import type { RunLauncher } from "../domain/run-launcher.js";
import type { RunManager } from "../domain/run-manager.js";
import type { AgentRegistry } from "../domain/agent-registry.js";
import type { EmitFn } from "./types.js";

const MOCK_AGENTS = [
  { id: "agent-alice", name: "Alice", role: "Frontend", prompts: [
    "Add rate limiting to the API endpoints",
    "Refactor auth middleware for better error handling",
    "Write integration tests for user service",
    "Optimize database query performance",
  ]},
  { id: "agent-bob", name: "Bob", role: "Backend", prompts: [
    "Migrate database schema to support multi-tenancy",
    "Fix pagination bug in search results",
    "Update API documentation for v2 endpoints",
    "Add structured error logging",
  ]},
  { id: "agent-linter", name: "Linter", role: "QA", prompts: [
    "Run npm run lint and npm run type-check. Report any errors or warnings.",
    "Run eslint on all source files and report violations by severity.",
    "Check for TypeScript strict mode violations across the codebase.",
  ]},
  { id: "agent-carlos", name: "Carlos", role: "DevOps", prompts: [
    "Set up CI/CD pipeline with GitHub Actions",
    "Configure Docker multi-stage build for production",
    "Add health check endpoints and monitoring",
    "Optimize build times and caching strategy",
  ]},
  { id: "agent-diana", name: "Diana", role: "Security", prompts: [
    "Audit authentication flow for vulnerabilities",
    "Review API endpoints for injection risks",
    "Check dependency tree for known CVEs",
    "Implement CSP headers and security middleware",
  ]},
  { id: "agent-eve", name: "Eve", role: "Docs", prompts: [
    "Generate API documentation from OpenAPI spec",
    "Write getting started guide for new developers",
    "Update changelog and migration guide for v2",
    "Add inline code examples to README",
  ]},
];

/**
 * Mock auto-launcher: registers agents, launches runs, and automatically
 * relaunches when runs finish. Uses event-driven approach (no polling).
 *
 * Stop → agent paused (no relaunch). Resume → agent relaunched.
 */
export class MockAutoLauncher {
  private pausedAgents = new Set<string>();
  private activeRunIds = new Map<string, string>();
  private promptIndex = new Map<string, number>();
  private stopped = false;
  private delayMultiplier: number;
  private demoMode: boolean;
  private recoveryTimer: ReturnType<typeof setTimeout> | null = null;
  private onDemoRecovery: (() => void) | null;

  constructor(
    private runLauncher: RunLauncher,
    private runManager: RunManager,
    private agentRegistry: AgentRegistry,
    private emit: EmitFn,
    options?: { delayMultiplier?: number; demoMode?: boolean; onDemoRecovery?: () => void },
  ) {
    this.delayMultiplier = options?.delayMultiplier ?? 1;
    this.demoMode = options?.demoMode ?? false;
    this.onDemoRecovery = options?.onDemoRecovery ?? null;
  }

  start(): void {
    console.log(`[mock-auto-launcher] registering ${MOCK_AGENTS.length} mock agents`);
    this.stopped = false;

    // Register all agents and stagger initial launches
    let counter = 0;
    for (const agent of MOCK_AGENTS) {
      if (!this.agentRegistry.get(agent.id)) {
        this.emit({
          id: `mock-reg-${Date.now()}-${++counter}`,
          type: "agent.registered",
          ts: Date.now(),
          agentId: agent.id,
          runId: "",
          payload: { name: agent.name, role: agent.role },
        });
      }
    }

    // Stagger launches so agents don't all start at the same time
    for (let i = 0; i < MOCK_AGENTS.length; i++) {
      setTimeout(() => {
        if (!this.stopped) this.launchFor(MOCK_AGENTS[i]);
      }, i * 1500);
    }
  }

  stop(): void {
    this.stopped = true;
    console.log("[mock-auto-launcher] stopped");
  }

  /** Stop all mock agents and deregister them (e.g. when a session pipeline is launched) */
  stopAndClear(): void {
    this.stopped = true;
    // Stop all active runs
    for (const [agentId, runId] of this.activeRunIds) {
      try { this.runLauncher.stop(runId); } catch {}
    }
    this.activeRunIds.clear();
    this.pausedAgents.clear();

    // Deregister all mock agents
    for (const agent of MOCK_AGENTS) {
      this.emit({
        id: `mock-dereg-${Date.now()}-${agent.id}`,
        type: "agent.deregistered",
        ts: Date.now(),
        agentId: agent.id,
        runId: "",
        payload: {},
      });
    }
    console.log("[mock-auto-launcher] cleared all mock agents");
  }

  /** Called by server when a run finishes (any terminal event) */
  onRunFinished(runId: string, agentId: string): void {
    if (this.stopped) return;

    const tracked = this.activeRunIds.get(agentId);
    if (tracked !== runId) return; // not our run
    this.activeRunIds.delete(agentId);

    if (this.pausedAgents.has(agentId)) return; // paused — don't relaunch

    // Relaunch after a natural pause (3-6s, scaled by delayMultiplier)
    const agent = MOCK_AGENTS.find((a) => a.id === agentId);
    if (!agent) return;
    const baseDelay = (3000 + Math.random() * 3000) * this.delayMultiplier;
    setTimeout(() => {
      if (!this.stopped && !this.pausedAgents.has(agentId)) {
        this.launchFor(agent);
      }
    }, baseDelay);
  }

  /** Pause agent — stop the active run and disable auto-relaunching */
  pauseAgent(agentId: string): void {
    this.pausedAgents.add(agentId);
    const runId = this.activeRunIds.get(agentId);
    if (runId) {
      try { this.runLauncher.stop(runId); } catch {}
    }
    this.activeRunIds.delete(agentId);
    this.scheduleRecoveryIfNeeded();
  }

  /** Resume agent — relaunch immediately */
  resumeAgent(agentId: string): void {
    this.pausedAgents.delete(agentId);
    const agent = MOCK_AGENTS.find((a) => a.id === agentId);
    if (agent && !this.stopped) {
      // Re-register (in case it was deregistered)
      this.emit({
        id: `mock-rereg-${Date.now()}`,
        type: "agent.registered",
        ts: Date.now(),
        agentId: agent.id,
        runId: "",
        payload: { name: agent.name, role: agent.role },
      });
      this.launchFor(agent);
    }
  }

  private nextPrompt(agent: typeof MOCK_AGENTS[number]): string {
    const idx = this.promptIndex.get(agent.id) ?? 0;
    const prompt = agent.prompts[idx % agent.prompts.length];
    this.promptIndex.set(agent.id, idx + 1);
    return prompt;
  }

  private launchFor(agent: typeof MOCK_AGENTS[number]): void {
    if (this.stopped || this.pausedAgents.has(agent.id)) return;
    if (this.activeRunIds.has(agent.id)) return; // already running

    try {
      const result = this.runLauncher.launch({
        prompt: this.nextPrompt(agent),
        agentName: agent.name,
        agentId: agent.id,
      });
      this.activeRunIds.set(agent.id, result.runId);
    } catch (err) {
      console.warn(`[mock-auto-launcher] failed to launch for ${agent.name}:`, err);
    }
  }

  /**
   * Demo mode auto-recovery: if all agents are paused, resume them after 30s.
   * Ensures the demo always looks alive for the next visitor.
   */
  private scheduleRecoveryIfNeeded(): void {
    if (!this.demoMode || this.stopped) return;
    if (this.recoveryTimer) return; // already scheduled

    // Check if all mock agents are paused
    const allPaused = MOCK_AGENTS.every((a) => this.pausedAgents.has(a.id));
    if (!allPaused) return;

    console.log("[demo] all agents paused — auto-recovery in 30s");
    this.recoveryTimer = setTimeout(() => {
      this.recoveryTimer = null;
      if (this.stopped) return;

      console.log("[demo] auto-recovering — resuming all agents");
      for (const agent of MOCK_AGENTS) {
        this.pausedAgents.delete(agent.id);
        // Re-register agent
        this.emit({
          id: `demo-recover-${Date.now()}-${agent.id}`,
          type: "agent.registered",
          ts: Date.now(),
          agentId: agent.id,
          runId: "",
          payload: { name: agent.name, role: agent.role },
        });
      }
      // Stagger relaunches
      for (let i = 0; i < MOCK_AGENTS.length; i++) {
        setTimeout(() => {
          if (!this.stopped) this.launchFor(MOCK_AGENTS[i]);
        }, i * 1500);
      }

      // Notify server to reset sessions and broadcast
      this.onDemoRecovery?.();
    }, 30_000);
  }
}
