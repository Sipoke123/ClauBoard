import type { Run, RunConfig } from "@repo/shared";

export class RunManager {
  private runs = new Map<string, Run>();

  start(id: string, agentId: string, description?: string, config?: RunConfig): void {
    // Skip if already exists — prevents replay from overwriting persisted terminal state
    if (this.runs.has(id)) return;
    this.runs.set(id, {
      id,
      agentId,
      description,
      status: "running",
      startedAt: Date.now(),
      config,
    });
  }

  complete(id: string, summary?: string): void {
    const run = this.runs.get(id);
    if (run && run.status === "running") {
      run.status = "completed";
      run.completedAt = Date.now();
      if (summary) run.description = summary;
    }
  }

  fail(id: string, error: string): void {
    const run = this.runs.get(id);
    if (run && run.status === "running") {
      run.status = "failed";
      run.completedAt = Date.now();
      run.error = error;
    }
  }

  stop(id: string): void {
    const run = this.runs.get(id);
    if (run && run.status === "running") {
      run.status = "stopped";
      run.completedAt = Date.now();
    }
  }

  get(id: string): Run | undefined {
    return this.runs.get(id);
  }

  all(): Run[] {
    return Array.from(this.runs.values());
  }

  byAgent(agentId: string): Run[] {
    return this.all().filter((r) => r.agentId === agentId);
  }
}
