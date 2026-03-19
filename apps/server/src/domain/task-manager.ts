import type { Task } from "@repo/shared";

export class TaskManager {
  private tasks = new Map<string, Task>();

  create(id: string, agentId: string, runId: string, title: string, description?: string): void {
    this.tasks.set(id, {
      id,
      title,
      description,
      status: "in_progress",
      agentId,
      runId,
      createdAt: Date.now(),
    });
  }

  complete(id: string, result?: string): void {
    const task = this.tasks.get(id);
    if (task) {
      task.status = "completed";
      task.completedAt = Date.now();
    }
  }

  fail(id: string, error: string): void {
    const task = this.tasks.get(id);
    if (task) {
      task.status = "failed";
      task.completedAt = Date.now();
      task.error = error;
    }
  }

  get(id: string): Task | undefined {
    return this.tasks.get(id);
  }

  all(): Task[] {
    return Array.from(this.tasks.values());
  }
}
