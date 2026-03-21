import type { AgentEvent } from "@repo/shared";
import type { PluginDefinition, PluginContext } from "../domain/plugin-registry.js";

/**
 * Built-in metrics plugin.
 * Tracks agent performance: tool call rates, error rates, run durations.
 * Emits plugin.metrics.snapshot events periodically.
 */

interface AgentMetrics {
  toolCalls: number;
  toolErrors: number;
  filesChanged: number;
  runsCompleted: number;
  runsFailed: number;
  totalDurationMs: number;
  lastRunStart: number;
}

const agentMetrics = new Map<string, AgentMetrics>();
let snapshotInterval: ReturnType<typeof setInterval> | null = null;

function getOrCreate(agentId: string): AgentMetrics {
  let m = agentMetrics.get(agentId);
  if (!m) {
    m = { toolCalls: 0, toolErrors: 0, filesChanged: 0, runsCompleted: 0, runsFailed: 0, totalDurationMs: 0, lastRunStart: 0 };
    agentMetrics.set(agentId, m);
  }
  return m;
}

export const metricsPlugin: PluginDefinition = {
  id: "metrics",
  name: "Agent Metrics",
  version: "1.0.0",

  eventTypes: [
    {
      type: "plugin.metrics.snapshot",
      label: "Metrics Snapshot",
      color: "text-cyan-400",
      payloadDescription: "Periodic aggregate metrics for all agents: tool calls, errors, files changed, run stats",
    },
  ],

  onRegister(ctx: PluginContext) {
    const intervalMs = (ctx.config.intervalMs as number) ?? 60000; // default 1 min

    snapshotInterval = setInterval(() => {
      if (agentMetrics.size === 0) return;

      const snapshot: Record<string, AgentMetrics> = {};
      for (const [id, m] of agentMetrics) {
        snapshot[id] = { ...m };
      }

      ctx.emit({
        id: `pm-${Date.now()}`,
        type: "plugin.metrics.snapshot",
        ts: Date.now(),
        agentId: "system",
        runId: "",
        payload: {
          agents: snapshot,
          totalAgents: agentMetrics.size,
          totalToolCalls: [...agentMetrics.values()].reduce((s, m) => s + m.toolCalls, 0),
          totalErrors: [...agentMetrics.values()].reduce((s, m) => s + m.toolErrors, 0),
        },
      });
    }, intervalMs);
  },

  onEvent(event: AgentEvent) {
    const m = getOrCreate(event.agentId);

    switch (event.type) {
      case "tool.invoked":
        m.toolCalls++;
        break;
      case "tool.error":
        m.toolErrors++;
        break;
      case "file.changed":
        m.filesChanged++;
        break;
      case "run.started":
        m.lastRunStart = event.ts;
        break;
      case "run.completed":
        m.runsCompleted++;
        if (m.lastRunStart) m.totalDurationMs += event.ts - m.lastRunStart;
        break;
      case "run.failed":
        m.runsFailed++;
        if (m.lastRunStart) m.totalDurationMs += event.ts - m.lastRunStart;
        break;
    }
  },

  onDestroy() {
    if (snapshotInterval) {
      clearInterval(snapshotInterval);
      snapshotInterval = null;
    }
    agentMetrics.clear();
  },
};
