import type { Session, SessionStatus, SessionAgent, AgentSpec } from "@repo/shared";

/**
 * Manages sessions — operator-defined groupings of runs.
 * Sessions are not event-sourced; they are purely an operator construct.
 * Now supports per-agent dependency tracking for staged execution.
 */
export class SessionManager {
  private sessions = new Map<string, Session>();

  create(id: string, name: string, specs: AgentSpec[]): Session {
    // Build per-agent tracking with dependency info
    const agents: SessionAgent[] = specs.map((spec, idx) => ({
      specIndex: idx,
      agentName: spec.agentName,
      status: "waiting",
      dependsOn: spec.dependsOn ?? [],
    }));

    const session: Session = {
      id,
      name,
      createdAt: Date.now(),
      status: "active",
      specs,
      runIds: [],
      agents,
    };
    this.sessions.set(id, session);
    return session;
  }

  addRun(sessionId: string, runId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.runIds.push(runId);
    }
  }

  updateStatus(sessionId: string, status: SessionStatus): void {
    const session = this.sessions.get(sessionId);
    if (session) session.status = status;
  }

  get(id: string): Session | undefined {
    return this.sessions.get(id);
  }

  all(): Session[] {
    return Array.from(this.sessions.values());
  }
}
