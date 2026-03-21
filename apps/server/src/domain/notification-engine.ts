import type { AgentEvent } from "@repo/shared";
import type { RunManager } from "./run-manager.js";
import type { AgentRegistry } from "./agent-registry.js";

// ---------------------------------------------------------------------------
// Alert types
// ---------------------------------------------------------------------------

export interface Alert {
  id: string;
  ts: number;
  severity: "info" | "warning" | "critical";
  rule: string;
  title: string;
  detail: string;
  agentId?: string;
  runId?: string;
  sessionId?: string;
  acknowledged: boolean;
}

export interface AlertRule {
  id: string;
  name: string;
  enabled: boolean;
  /** Event types that trigger evaluation */
  triggers: string[];
  /** Evaluate function — return an Alert or null */
  evaluate: (event: AgentEvent, ctx: RuleContext) => Alert | null;
}

export interface RuleContext {
  runManager: RunManager;
  agentRegistry: AgentRegistry;
  recentAlerts: Alert[];
}

// ---------------------------------------------------------------------------
// Built-in rules
// ---------------------------------------------------------------------------

let alertCounter = 0;
function alertId(): string {
  return `alert-${Date.now()}-${++alertCounter}`;
}

const builtInRules: AlertRule[] = [
  {
    id: "run-failed",
    name: "Run Failed",
    enabled: true,
    triggers: ["run.failed"],
    evaluate: (event) => ({
      id: alertId(),
      ts: event.ts,
      severity: "critical",
      rule: "run-failed",
      title: "Agent run failed",
      detail: (event as any).payload?.error ?? "Run failed with unknown error",
      agentId: event.agentId,
      runId: event.runId,
      acknowledged: false,
    }),
  },
  {
    id: "run-stopped",
    name: "Run Stopped by Operator",
    enabled: true,
    triggers: ["run.stopped"],
    evaluate: (event) => ({
      id: alertId(),
      ts: event.ts,
      severity: "warning",
      rule: "run-stopped",
      title: "Agent stopped by operator",
      detail: (event as any).payload?.reason ?? "Stopped",
      agentId: event.agentId,
      runId: event.runId,
      acknowledged: false,
    }),
  },
  {
    id: "agent-blocked",
    name: "Agent Blocked",
    enabled: true,
    triggers: ["agent.blocked"],
    evaluate: (event) => ({
      id: alertId(),
      ts: event.ts,
      severity: "warning",
      rule: "agent-blocked",
      title: "Agent is blocked",
      detail: (event as any).payload?.reason ?? "Agent requires attention",
      agentId: event.agentId,
      runId: event.runId,
      acknowledged: false,
    }),
  },
  {
    id: "tool-error",
    name: "Tool Error",
    enabled: true,
    triggers: ["tool.error"],
    evaluate: (event, ctx) => {
      // Only alert if there are multiple recent tool errors (3+ in last 30s)
      const recent = ctx.recentAlerts.filter(
        (a) => a.rule === "tool-error" && a.agentId === event.agentId && a.ts > Date.now() - 30000,
      );
      if (recent.length < 2) return null; // wait for 3rd
      return {
        id: alertId(),
        ts: event.ts,
        severity: "warning",
        rule: "tool-error",
        title: "Repeated tool errors",
        detail: `Agent has ${recent.length + 1} tool errors in the last 30 seconds`,
        agentId: event.agentId,
        runId: event.runId,
        acknowledged: false,
      };
    },
  },
  {
    id: "session-completed",
    name: "Session Completed",
    enabled: true,
    triggers: ["run.completed", "run.failed"],
    evaluate: (_event, ctx) => {
      // This is handled via session status change, not directly here
      return null;
    },
  },
  {
    id: "long-running",
    name: "Long Running Agent",
    enabled: true,
    triggers: ["agent.heartbeat"],
    evaluate: (event, ctx) => {
      const agent = ctx.agentRegistry.get(event.agentId);
      if (!agent || agent.status !== "working" || !agent.currentRunId) return null;

      const run = ctx.runManager.get(agent.currentRunId);
      if (!run) return null;

      const elapsed = Date.now() - run.startedAt;
      const fiveMin = 5 * 60 * 1000;

      // Only alert once per run
      if (elapsed < fiveMin) return null;
      const alreadyAlerted = ctx.recentAlerts.some(
        (a) => a.rule === "long-running" && a.runId === run.id,
      );
      if (alreadyAlerted) return null;

      return {
        id: alertId(),
        ts: event.ts,
        severity: "info",
        rule: "long-running",
        title: "Agent running for 5+ minutes",
        detail: `Run has been active for ${Math.round(elapsed / 60000)} minutes`,
        agentId: event.agentId,
        runId: run.id,
        acknowledged: false,
      };
    },
  },
];

// ---------------------------------------------------------------------------
// Engine
// ---------------------------------------------------------------------------

export type AlertCallback = (alert: Alert) => void;

export class NotificationEngine {
  private rules: AlertRule[] = [...builtInRules];
  private alerts: Alert[] = [];
  private listeners: AlertCallback[] = [];
  private triggerIndex = new Map<string, AlertRule[]>();

  constructor(
    private runManager: RunManager,
    private agentRegistry: AgentRegistry,
  ) {
    this.rebuildIndex();
  }

  /** Register a callback for new alerts */
  onAlert(cb: AlertCallback): void {
    this.listeners.push(cb);
  }

  /** Process an event through all matching rules */
  evaluate(event: AgentEvent): void {
    const matchingRules = this.triggerIndex.get(event.type) ?? [];
    const ctx: RuleContext = {
      runManager: this.runManager,
      agentRegistry: this.agentRegistry,
      recentAlerts: this.alerts,
    };

    for (const rule of matchingRules) {
      if (!rule.enabled) continue;
      try {
        const alert = rule.evaluate(event, ctx);
        if (alert) {
          this.alerts.push(alert);
          // Keep only last 500 alerts in memory
          if (this.alerts.length > 500) {
            this.alerts = this.alerts.slice(-500);
          }
          for (const cb of this.listeners) {
            cb(alert);
          }
        }
      } catch (err: any) {
        console.error(`[notifications] rule "${rule.id}" error: ${err.message}`);
      }
    }
  }

  /** Get all alerts (optionally unacknowledged only) */
  getAlerts(unacknowledgedOnly = false): Alert[] {
    if (unacknowledgedOnly) {
      return this.alerts.filter((a) => !a.acknowledged);
    }
    return [...this.alerts];
  }

  /** Acknowledge an alert */
  acknowledge(alertId: string): boolean {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (!alert) return false;
    alert.acknowledged = true;
    return true;
  }

  /** Acknowledge all alerts */
  acknowledgeAll(): number {
    let count = 0;
    for (const alert of this.alerts) {
      if (!alert.acknowledged) {
        alert.acknowledged = true;
        count++;
      }
    }
    return count;
  }

  /** Get/set rule enabled state */
  setRuleEnabled(ruleId: string, enabled: boolean): boolean {
    const rule = this.rules.find((r) => r.id === ruleId);
    if (!rule) return false;
    rule.enabled = enabled;
    return true;
  }

  getRules(): { id: string; name: string; enabled: boolean; triggers: string[] }[] {
    return this.rules.map((r) => ({ id: r.id, name: r.name, enabled: r.enabled, triggers: r.triggers }));
  }

  private rebuildIndex(): void {
    this.triggerIndex.clear();
    for (const rule of this.rules) {
      for (const trigger of rule.triggers) {
        const existing = this.triggerIndex.get(trigger) ?? [];
        existing.push(rule);
        this.triggerIndex.set(trigger, existing);
      }
    }
  }
}
