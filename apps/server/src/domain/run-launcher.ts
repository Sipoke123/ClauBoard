import type { LaunchRunRequest, LaunchRunResponse, RunConfig } from "@repo/shared";
import type { AgentAdapter, EmitFn } from "../adapter/types.js";
import type { RunManager } from "./run-manager.js";
import type { AgentRegistry } from "./agent-registry.js";
import { ClaudeCodeAdapter } from "../adapter/claude-code-adapter.js";
import { validateCwd } from "../config.js";

interface ActiveRun {
  adapter: AgentAdapter;
  agentId: string;
  runId: string;
  config: RunConfig;
  cleanupInterval?: ReturnType<typeof setInterval>;
}

/**
 * Factory that creates a per-run adapter instance.
 * In real mode: creates ClaudeCodeAdapter. In mock mode: creates MockRunAdapter.
 */
export type AdapterFactory = (opts: {
  prompt: string;
  cwd?: string;
  agentName: string;
  agentId: string;
  runId: string;
}) => AgentAdapter;

/** Default factory — creates real Claude Code adapters */
export const claudeAdapterFactory: AdapterFactory = (opts) =>
  new ClaudeCodeAdapter(opts);

let stopCounter = 0;

/**
 * Manages launching and tracking adapter instances (real or mock).
 * Validates cwd before launch. Emits run.stopped on explicit stop.
 */
export class RunLauncher {
  private activeRuns = new Map<string, ActiveRun>();
  private pendingConfigs = new Map<string, RunConfig>();

  constructor(
    private emit: EmitFn,
    private runManager: RunManager,
    private createAdapter: AdapterFactory = claudeAdapterFactory,
    private agentRegistry?: AgentRegistry,
  ) {}

  /**
   * Launch a new run. Throws if cwd validation fails.
   */
  launch(req: LaunchRunRequest): LaunchRunResponse {
    // Validate cwd (skip for mock — no real filesystem)
    const cwdError = validateCwd(req.cwd);
    if (cwdError) throw new Error(cwdError);

    const ts = Date.now();
    const agentId = req.agentId ?? `agent-${ts}-${Math.random().toString(36).slice(2, 6)}`;
    const runId = `run-${ts}-${Math.random().toString(36).slice(2, 6)}`;
    const runConfig: RunConfig = {
      prompt: req.prompt,
      cwd: req.cwd,
      agentName: req.agentName ?? "Claude",
    };

    const adapter = this.createAdapter({
      prompt: req.prompt,
      cwd: req.cwd,
      agentName: runConfig.agentName!,
      agentId,
      runId,
    });

    this.pendingConfigs.set(runId, runConfig);

    // Auto-register agent if not already known
    if (this.agentRegistry && !this.agentRegistry.get(agentId)) {
      this.emit({
        id: `reg-${Date.now()}-${Math.random().toString(36).slice(2, 4)}`,
        type: "agent.registered",
        ts: Date.now(),
        agentId,
        runId: "",
        payload: { name: runConfig.agentName! },
      });
    }

    adapter.start((event) => {
      this.emit(event);
      if (event.type === "run.started" && event.runId === runId) {
        const run = this.runManager.get(runId);
        if (run) {
          run.config = runConfig;
          if (req.sessionId) run.sessionId = req.sessionId;
        }
        this.pendingConfigs.delete(runId);
      }
      // Clean up on terminal events
      if (event.runId === runId && (event.type === "run.failed" || event.type === "run.completed" || event.type === "run.stopped")) {
        const active = this.activeRuns.get(runId);
        if (active?.cleanupInterval) clearInterval(active.cleanupInterval);
        this.activeRuns.delete(runId);
      }
    });

    this.activeRuns.set(runId, { adapter, agentId, runId, config: runConfig });

    // Safety timeout cleanup
    const MAX_CLEANUP_MS = 10 * 60 * 1000;
    const startTime = Date.now();
    const checkDone = setInterval(() => {
      const run = this.runManager.get(runId);
      const elapsed = Date.now() - startTime;
      if ((run && run.status !== "running") || elapsed > MAX_CLEANUP_MS) {
        clearInterval(checkDone);
        this.activeRuns.delete(runId);
      }
    }, 2000);

    const activeRun = this.activeRuns.get(runId);
    if (activeRun) activeRun.cleanupInterval = checkDone;

    console.log(`[run-launcher] launched ${agentId} for: "${req.prompt.slice(0, 80)}"`);
    return { agentId, runId };
  }

  /**
   * Stop a running run. Emits run.stopped event. Returns false if not found.
   */
  stop(runId: string): boolean {
    const run = this.activeRuns.get(runId);
    if (!run) return false;

    run.adapter.stop();
    if (run.cleanupInterval) clearInterval(run.cleanupInterval);

    this.emit({
      id: `stop-${Date.now()}-${++stopCounter}`,
      type: "run.stopped",
      ts: Date.now(),
      agentId: run.agentId,
      runId: run.runId,
      payload: { reason: "Stopped by operator" },
    });

    this.activeRuns.delete(runId);
    console.log(`[run-launcher] stopped ${run.agentId}`);
    return true;
  }

  /**
   * Send a follow-up message to a running agent.
   * Returns false if the run is not active or the adapter doesn't support messaging.
   */
  sendMessage(runId: string, text: string): boolean {
    const run = this.activeRuns.get(runId);
    if (!run) return false;
    if (!run.adapter.sendMessage) return false;
    return run.adapter.sendMessage(text);
  }

  isRunning(runId: string): boolean {
    return this.activeRuns.has(runId);
  }

  stopAll(): void {
    for (const [runId] of this.activeRuns) {
      this.stop(runId);
    }
  }

  activeCount(): number {
    return this.activeRuns.size;
  }
}
