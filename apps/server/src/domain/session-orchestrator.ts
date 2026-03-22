import type { AgentSpec, SessionAgent, SessionAgentStatus, AgentEvent } from "@repo/shared";
import type { SessionManager } from "./session-manager.js";
import type { RunManager } from "./run-manager.js";
import type { RunLauncher } from "./run-launcher.js";
import type { IEventStore } from "./event-store.js";

/**
 * Watches run completions and launches waiting agents whose dependencies are met.
 *
 * Failover: if a dependency fails/stops, the dependent agent still launches
 * (it is NOT skipped). The agent proceeds with whatever context is available.
 *
 * Context sharing: when launching a dependent agent, the orchestrator builds
 * a summary of what upstream agents did (files created/edited, tools used,
 * output produced) and prepends it to the agent's prompt.
 */
export class SessionOrchestrator {
  constructor(
    private sessionManager: SessionManager,
    private runManager: RunManager,
    private runLauncher: RunLauncher,
    private eventStore: IEventStore,
  ) {}

  /**
   * Called when a run finishes (completed/failed/stopped).
   */
  onRunFinished(runId: string): void {
    for (const session of this.sessionManager.all()) {
      if (!session.agents || !session.runIds.includes(runId)) continue;
      if (session.status === "completed" || session.status === "failed") continue;

      const finishedAgent = session.agents.find((a) => a.runId === runId);
      if (finishedAgent) {
        const run = this.runManager.get(runId);
        if (run) {
          finishedAgent.status = run.status as SessionAgentStatus;
        }
      }

      this.launchReadyAgents(session);
      this.checkSessionCompletion(session);
    }
  }

  launchInitialWave(sessionId: string): void {
    const session = this.sessionManager.get(sessionId);
    if (!session?.agents) return;
    this.launchReadyAgents(session);
  }

  // ---------------------------------------------------------------------------
  // Private
  // ---------------------------------------------------------------------------

  private launchReadyAgents(session: { id: string; agents?: SessionAgent[]; specs: AgentSpec[] }): void {
    if (!session.agents) return;

    for (const agent of session.agents) {
      if (agent.status !== "waiting") continue;
      if (!this.depsAreResolved(agent, session.agents)) continue;

      const failedDeps = this.getFailedDeps(agent, session.agents);
      const completedDeps = this.getCompletedDeps(agent, session.agents);

      try {
        const spec = session.specs[agent.specIndex];

        // Build context from completed upstream agents
        const contextBlock = this.buildUpstreamContext(completedDeps, failedDeps);
        const prompt = contextBlock ? `${spec.prompt}\n\n${contextBlock}` : spec.prompt;

        const result = this.runLauncher.launch({
          prompt,
          cwd: spec.cwd,
          agentName: spec.agentName,
          agentId: agent.agentId,
          sessionId: session.id,
        });
        agent.runId = result.runId;
        agent.status = "running";
        this.sessionManager.addRun(session.id, result.runId);

        if (failedDeps.length > 0) {
          console.log(`[orchestrator] launched "${agent.agentName}" with failover (failed deps: ${failedDeps.map((d) => d.agentName).join(", ")})`);
        } else {
          console.log(`[orchestrator] launched "${agent.agentName}" with context from: ${completedDeps.map((d) => d.agentName).join(", ") || "none"}`);
        }
      } catch (err: any) {
        agent.status = "failed";
        console.error(`[orchestrator] failed to launch "${agent.agentName}": ${err.message}`);
      }
    }
  }

  /**
   * Build a context block summarizing what upstream agents did.
   */
  private buildUpstreamContext(completedDeps: SessionAgent[], failedDeps: SessionAgent[]): string {
    const sections: string[] = [];

    // Context from successful upstream agents
    for (const dep of completedDeps) {
      if (!dep.runId) continue;
      const summary = this.summarizeRun(dep.agentName, dep.runId);
      if (summary) sections.push(summary);
    }

    // Note about failed upstream agents
    if (failedDeps.length > 0) {
      const names = failedDeps.map((d) => d.agentName).join(", ");
      sections.push(`⚠ Upstream agents that did not complete: ${names}. Their work may be partial or missing.`);
    }

    if (sections.length === 0) return "";

    return `--- Upstream Context ---\n${sections.join("\n\n")}\n--- End Context ---`;
  }

  /**
   * Summarize a completed run: files changed, tools used, last output.
   */
  private summarizeRun(agentName: string, runId: string): string | null {
    const events = this.eventStore.byRun(runId);
    if (events.length === 0) return null;

    // Collect files
    const files = new Map<string, string>();
    for (const e of events) {
      if (e.type === "file.changed") {
        const p = (e as any).payload;
        files.set(p.path, p.action);
      }
    }

    // Collect tool usage counts
    const tools = new Map<string, number>();
    for (const e of events) {
      if (e.type === "tool.invoked") {
        const t = (e as any).payload.tool;
        tools.set(t, (tools.get(t) ?? 0) + 1);
      }
    }

    // Get last output text (if any)
    let lastOutput = "";
    for (let i = events.length - 1; i >= 0; i--) {
      if (events[i].type === "terminal.output") {
        lastOutput = ((events[i] as any).payload.text ?? "").slice(0, 300);
        break;
      }
    }

    // Build summary
    const parts: string[] = [`[${agentName}] completed.`];

    if (files.size > 0) {
      const fileList = [...files.entries()].slice(0, 15).map(([p, a]) => `  ${a}: ${p}`).join("\n");
      parts.push(`Files (${files.size}):\n${fileList}${files.size > 15 ? `\n  ... and ${files.size - 15} more` : ""}`);
    }

    if (tools.size > 0) {
      const toolList = [...tools.entries()].map(([t, c]) => `${t}(${c})`).join(", ");
      parts.push(`Tools: ${toolList}`);
    }

    if (lastOutput) {
      parts.push(`Last output: ${lastOutput}${lastOutput.length >= 300 ? "..." : ""}`);
    }

    return parts.join("\n");
  }

  private depsAreResolved(agent: SessionAgent, allAgents: SessionAgent[]): boolean {
    if (agent.dependsOn.length === 0) return true;
    const terminalStatuses = new Set(["completed", "failed", "stopped", "skipped"]);
    return agent.dependsOn.every((depName) => {
      const dep = allAgents.find((a) => a.agentName === depName);
      return dep && terminalStatuses.has(dep.status);
    });
  }

  private getFailedDeps(agent: SessionAgent, allAgents: SessionAgent[]): SessionAgent[] {
    const failedStatuses = new Set(["failed", "stopped", "skipped"]);
    return agent.dependsOn
      .map((depName) => allAgents.find((a) => a.agentName === depName))
      .filter((dep): dep is SessionAgent => !!dep && failedStatuses.has(dep.status));
  }

  private getCompletedDeps(agent: SessionAgent, allAgents: SessionAgent[]): SessionAgent[] {
    return agent.dependsOn
      .map((depName) => allAgents.find((a) => a.agentName === depName))
      .filter((dep): dep is SessionAgent => !!dep && dep.status === "completed");
  }

  private checkSessionCompletion(session: { id: string; agents?: SessionAgent[] }): void {
    if (!session.agents) return;
    const allDone = session.agents.every(
      (a) => a.status !== "waiting" && a.status !== "running",
    );
    if (allDone) {
      const anyFailed = session.agents.some((a) => a.status === "failed" || a.status === "stopped");
      this.sessionManager.updateStatus(session.id, anyFailed ? "failed" : "completed");
      console.log(`[orchestrator] session ${session.id} ${anyFailed ? "failed" : "completed"}`);
    }
  }
}
