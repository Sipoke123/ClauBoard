import type { Agent, AgentStatus } from "@repo/shared";

export class AgentRegistry {
  private agents = new Map<string, Agent>();

  register(id: string, name: string, role?: string): void {
    this.agents.set(id, {
      id,
      name,
      role,
      status: "idle",
      lastHeartbeat: Date.now(),
    });
  }

  heartbeat(id: string, status: AgentStatus): void {
    const agent = this.agents.get(id);
    if (agent) {
      agent.status = status;
      agent.lastHeartbeat = Date.now();
      if (status !== "blocked") agent.blockedReason = undefined;
    }
  }

  block(id: string, reason: string): void {
    const agent = this.agents.get(id);
    if (agent) {
      agent.status = "blocked";
      agent.blockedReason = reason;
    }
  }

  deregister(id: string): void {
    this.agents.delete(id);
  }

  setCurrentRun(agentId: string, runId: string | undefined): void {
    const agent = this.agents.get(agentId);
    if (agent) agent.currentRunId = runId;
  }

  setCurrentTask(agentId: string, taskId: string | undefined): void {
    const agent = this.agents.get(agentId);
    if (agent) agent.currentTaskId = taskId;
  }

  get(id: string): Agent | undefined {
    return this.agents.get(id);
  }

  findByName(name: string): Agent | undefined {
    for (const agent of this.agents.values()) {
      if (agent.name === name) return agent;
    }
    return undefined;
  }

  all(): Agent[] {
    return Array.from(this.agents.values());
  }

  count(): number {
    return this.agents.size;
  }

  /** Remove all agents from the registry */
  clear(): void {
    this.agents.clear();
  }
}
