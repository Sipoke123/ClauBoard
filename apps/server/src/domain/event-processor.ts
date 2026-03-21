import type { AgentEvent } from "@repo/shared";
import type { AgentRegistry } from "./agent-registry.js";
import type { RunManager } from "./run-manager.js";
import type { TaskManager } from "./task-manager.js";
import type { EventStore } from "./event-store.js";

/**
 * Central reducer: appends event to store and updates all derived models.
 *
 * Two modes:
 *  - `process()` — normal: appends to store + derives state (for new events)
 *  - `replay()` — startup: only derives state, events are already in store
 */
export class EventProcessor {
  constructor(
    private store: EventStore,
    private agents: AgentRegistry,
    private runs: RunManager,
    private tasks: TaskManager,
  ) {}

  /** Normal path: persist + derive. */
  process(event: AgentEvent): void {
    this.store.append(event);
    this.derive(event);
  }

  /** Replay path: derive only (events already loaded into store). */
  replay(event: AgentEvent): void {
    this.derive(event);
  }

  private derive(event: AgentEvent): void {
    switch (event.type) {
      case "agent.registered":
        this.agents.register(event.agentId, event.payload.name, (event as any).payload.role);
        break;
      case "agent.heartbeat":
        this.agents.heartbeat(event.agentId, event.payload.status);
        break;
      case "agent.deregistered":
        this.agents.deregister(event.agentId);
        break;
      case "agent.blocked":
        this.agents.block(event.agentId, event.payload.reason);
        break;
      case "run.started":
        this.runs.start(event.runId, event.agentId, event.payload.description);
        this.agents.setCurrentRun(event.agentId, event.runId);
        this.agents.heartbeat(event.agentId, "working");
        break;
      case "run.completed":
        this.runs.complete(event.runId, event.payload.summary);
        this.agents.setCurrentRun(event.agentId, undefined);
        this.agents.heartbeat(event.agentId, "idle");
        break;
      case "run.failed":
        this.runs.fail(event.runId, event.payload.error);
        this.agents.setCurrentRun(event.agentId, undefined);
        this.agents.heartbeat(event.agentId, "error");
        break;
      case "run.stopped":
        this.runs.stop(event.runId);
        this.agents.setCurrentRun(event.agentId, undefined);
        this.agents.heartbeat(event.agentId, "idle");
        break;
      case "task.created":
        this.tasks.create(
          event.taskId!,
          event.agentId,
          event.runId,
          event.payload.title,
          event.payload.description,
        );
        this.agents.setCurrentTask(event.agentId, event.taskId);
        break;
      case "task.completed":
        this.tasks.complete(event.taskId!, event.payload.result);
        this.agents.setCurrentTask(event.agentId, undefined);
        break;
      case "task.failed":
        this.tasks.fail(event.taskId!, event.payload.error);
        this.agents.setCurrentTask(event.agentId, undefined);
        break;
    }
  }
}
