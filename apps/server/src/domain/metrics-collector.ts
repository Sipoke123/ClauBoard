import type { AgentEvent } from "@repo/shared";

/**
 * In-memory aggregator for Prometheus exposition.
 * Counters are monotonically increasing per-agent; the route reads .snapshot()
 * on each scrape. Replay-safe — observe() is idempotent on event id.
 */

export interface AgentCounters {
  toolInvocations: number;
  toolErrors: number;
  filesChanged: number;
  runsCompleted: number;
  runsFailed: number;
  runsStopped: number;
  runDurationMsSum: number;
  runDurationCount: number;
}

export interface MetricsSnapshot {
  perAgent: Map<string, AgentCounters>;
  startedAt: number;
}

const EMPTY: AgentCounters = {
  toolInvocations: 0,
  toolErrors: 0,
  filesChanged: 0,
  runsCompleted: 0,
  runsFailed: 0,
  runsStopped: 0,
  runDurationMsSum: 0,
  runDurationCount: 0,
};

export class MetricsCollector {
  private perAgent = new Map<string, AgentCounters>();
  private runStarts = new Map<string, number>();
  private seenIds = new Set<string>();
  private readonly startedAt = Date.now();

  private getOrCreate(agentId: string): AgentCounters {
    let m = this.perAgent.get(agentId);
    if (!m) {
      m = { ...EMPTY };
      this.perAgent.set(agentId, m);
    }
    return m;
  }

  observe(event: AgentEvent): void {
    if (this.seenIds.has(event.id)) return;
    this.seenIds.add(event.id);

    const m = this.getOrCreate(event.agentId);

    switch (event.type) {
      case "tool.invoked":
        m.toolInvocations++;
        break;
      case "tool.error":
        m.toolErrors++;
        break;
      case "file.changed":
        m.filesChanged++;
        break;
      case "run.started":
        this.runStarts.set(event.runId, event.ts);
        break;
      case "run.completed":
      case "run.failed":
      case "run.stopped": {
        const start = this.runStarts.get(event.runId);
        if (start !== undefined) {
          m.runDurationMsSum += Math.max(0, event.ts - start);
          m.runDurationCount++;
          this.runStarts.delete(event.runId);
        }
        if (event.type === "run.completed") m.runsCompleted++;
        else if (event.type === "run.failed") m.runsFailed++;
        else m.runsStopped++;
        break;
      }
    }
  }

  snapshot(): MetricsSnapshot {
    return { perAgent: this.perAgent, startedAt: this.startedAt };
  }
}
