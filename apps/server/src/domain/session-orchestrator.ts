import type { AgentSpec, SessionAgent, SessionAgentStatus } from "@repo/shared";
import type { SessionManager } from "./session-manager.js";
import type { RunManager } from "./run-manager.js";
import type { RunLauncher } from "./run-launcher.js";

/**
 * Watches run completions and launches waiting agents whose dependencies are met.
 *
 * The orchestrator is called after every run.completed / run.failed / run.stopped event.
 * It checks all sessions for agents in "waiting" state whose dependsOn agents have completed.
 *
 * This is explicit operator-defined coordination — no agent-to-agent messaging.
 */
export class SessionOrchestrator {
  constructor(
    private sessionManager: SessionManager,
    private runManager: RunManager,
    private runLauncher: RunLauncher,
  ) {}

  /**
   * Called when a run finishes (completed/failed/stopped).
   * Checks if any waiting agents in the same session can now be launched.
   */
  onRunFinished(runId: string): void {
    // Find which session this run belongs to
    for (const session of this.sessionManager.all()) {
      if (!session.agents || !session.runIds.includes(runId)) continue;
      if (session.status !== "active") continue;

      // Update the finished agent's status in the session
      const finishedAgent = session.agents.find((a) => a.runId === runId);
      if (finishedAgent) {
        const run = this.runManager.get(runId);
        if (run) {
          finishedAgent.status = run.status as SessionAgentStatus;
        }
      }

      // Check for agents whose deps failed — mark them skipped
      this.markSkippedAgents(session.agents);

      // Find waiting agents whose dependencies are now satisfied
      this.launchReadyAgents(session);

      // Check if session is complete
      this.checkSessionCompletion(session);
    }
  }

  /**
   * Launch all agents that have no dependencies (the first wave).
   * Called once when a session is created.
   */
  launchInitialWave(sessionId: string): void {
    const session = this.sessionManager.get(sessionId);
    if (!session?.agents) return;

    this.launchReadyAgents(session);
  }

  private launchReadyAgents(session: { id: string; agents?: SessionAgent[]; specs: AgentSpec[] }): void {
    if (!session.agents) return;

    for (const agent of session.agents) {
      if (agent.status !== "waiting") continue;
      if (!this.depsAreMet(agent, session.agents)) continue;

      // Launch this agent
      try {
        const spec = session.specs[agent.specIndex];
        const result = this.runLauncher.launch({
          prompt: spec.prompt,
          cwd: spec.cwd,
          agentName: spec.agentName,
          sessionId: session.id,
        });
        agent.runId = result.runId;
        agent.status = "running";
        this.sessionManager.addRun(session.id, result.runId);
        console.log(`[orchestrator] launched "${agent.agentName}" (deps met) in session ${session.id}`);
      } catch (err: any) {
        agent.status = "failed";
        console.error(`[orchestrator] failed to launch "${agent.agentName}": ${err.message}`);
      }
    }
  }

  private depsAreMet(agent: SessionAgent, allAgents: SessionAgent[]): boolean {
    if (agent.dependsOn.length === 0) return true;
    return agent.dependsOn.every((depName) => {
      const dep = allAgents.find((a) => a.agentName === depName);
      return dep?.status === "completed";
    });
  }

  private markSkippedAgents(agents: SessionAgent[]): void {
    for (const agent of agents) {
      if (agent.status !== "waiting") continue;
      // If any dependency failed/stopped/skipped, this agent can't run
      const hasFailedDep = agent.dependsOn.some((depName) => {
        const dep = agents.find((a) => a.agentName === depName);
        return dep && (dep.status === "failed" || dep.status === "stopped" || dep.status === "skipped");
      });
      if (hasFailedDep) {
        agent.status = "skipped";
        console.log(`[orchestrator] skipped "${agent.agentName}" — dependency failed`);
      }
    }
  }

  private checkSessionCompletion(session: { id: string; agents?: SessionAgent[] }): void {
    if (!session.agents) return;
    const allDone = session.agents.every(
      (a) => a.status !== "waiting" && a.status !== "running",
    );
    if (allDone) {
      const anyFailed = session.agents.some((a) => a.status === "failed" || a.status === "skipped");
      this.sessionManager.updateStatus(session.id, anyFailed ? "failed" : "completed");
      console.log(`[orchestrator] session ${session.id} ${anyFailed ? "failed" : "completed"}`);
    }
  }
}
