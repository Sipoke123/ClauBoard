import type { AgentEvent } from "@repo/shared";
import type { IEventStore } from "./event-store.js";

/**
 * In-memory event store for demo mode.
 * - No disk I/O (no JSONL writes)
 * - Capped at MAX_EVENTS — oldest events are dropped when limit is exceeded
 * - Safe for indefinite use on free-tier hosting
 */
const MAX_EVENTS = 500;

export class DemoEventStore implements IEventStore {
  private events: AgentEvent[] = [];

  initPersistence(_dataDir: string): void {
    // No-op: demo mode never writes to disk
  }

  append(event: AgentEvent): void {
    this.events.push(event);
    if (this.events.length > MAX_EVENTS) {
      // Drop oldest 20% to avoid trimming on every single event
      const dropCount = Math.floor(MAX_EVENTS * 0.2);
      this.events = this.events.slice(dropCount);
    }
  }

  loadFromFile(_dataDir: string): AgentEvent[] {
    // No-op: nothing persisted in demo mode
    return [];
  }

  all(): AgentEvent[] {
    return this.events;
  }

  byRun(runId: string): AgentEvent[] {
    return this.events.filter((e) => e.runId === runId);
  }

  byAgent(agentId: string): AgentEvent[] {
    return this.events.filter((e) => e.agentId === agentId);
  }

  count(): number {
    return this.events.length;
  }

  after(index: number, limit = 100): AgentEvent[] {
    return this.events.slice(index, index + limit);
  }

  close(): void {
    // No-op
  }
}
