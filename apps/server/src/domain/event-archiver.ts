import fs from "node:fs";
import path from "node:path";
import type { AgentEvent } from "@repo/shared";
import type { IEventStore } from "./event-store.js";
import type { RunManager } from "./run-manager.js";

/**
 * Event archival and compaction for managing large event histories.
 *
 * Archive: moves events older than a threshold to a separate archive file.
 * Compact: removes verbose events (heartbeats, terminal output, tool details)
 *   for completed/failed runs, keeping only lifecycle events.
 *
 * Both operations rebuild the JSONL file and in-memory array.
 */
export class EventArchiver {
  constructor(
    private eventStore: IEventStore,
    private runManager: RunManager,
    private dataDir: string,
  ) {}

  /**
   * Archive events older than `maxAgeMs` into a timestamped archive file.
   * Returns { archived, remaining, archiveFile }.
   */
  archive(maxAgeMs: number = 7 * 24 * 60 * 60 * 1000): { archived: number; remaining: number; archiveFile: string } {
    const cutoff = Date.now() - maxAgeMs;
    const all = this.eventStore.all();

    const old: AgentEvent[] = [];
    const recent: AgentEvent[] = [];
    for (const e of all) {
      (e.ts < cutoff ? old : recent).push(e);
    }

    if (old.length === 0) {
      return { archived: 0, remaining: all.length, archiveFile: "" };
    }

    // Write archive file
    const archiveFile = path.join(this.dataDir, `events-archive-${new Date().toISOString().slice(0, 10)}-${Date.now()}.jsonl`);
    fs.writeFileSync(archiveFile, old.map((e) => JSON.stringify(e)).join("\n") + "\n");

    // Rewrite main file with only recent events
    this.rewriteEvents(recent);

    console.log(`[archiver] archived ${old.length} events (before ${new Date(cutoff).toISOString()}) to ${path.basename(archiveFile)}`);
    return { archived: old.length, remaining: recent.length, archiveFile: path.basename(archiveFile) };
  }

  /**
   * Compact verbose events for completed/failed/stopped runs.
   * Keeps: run.started, run.completed, run.failed, run.stopped, task.created, task.completed, task.failed,
   *   agent.registered, agent.deregistered, file.changed
   * Removes: agent.heartbeat, terminal.output, tool.invoked, tool.result, tool.error
   *   (only for terminal runs — running runs are untouched)
   *
   * Returns { removed, remaining }.
   */
  compact(): { removed: number; remaining: number } {
    const all = this.eventStore.all();
    const terminalStatuses = new Set(["completed", "failed", "stopped"]);

    // Find runIds that are terminal
    const terminalRunIds = new Set<string>();
    for (const run of this.runManager.all()) {
      if (terminalStatuses.has(run.status)) {
        terminalRunIds.add(run.id);
      }
    }

    // Verbose event types that can be removed for terminal runs
    const verboseTypes = new Set([
      "agent.heartbeat",
      "terminal.output",
      "tool.invoked",
      "tool.result",
      "tool.error",
    ]);

    const kept: AgentEvent[] = [];
    let removed = 0;

    for (const e of all) {
      const isVerbose = verboseTypes.has(e.type);
      const isTerminalRun = e.runId ? terminalRunIds.has(e.runId) : false;

      if (isVerbose && isTerminalRun) {
        removed++;
      } else {
        kept.push(e);
      }
    }

    if (removed === 0) {
      return { removed: 0, remaining: all.length };
    }

    this.rewriteEvents(kept);

    console.log(`[archiver] compacted ${removed} verbose events from ${terminalRunIds.size} terminal runs`);
    return { removed, remaining: kept.length };
  }

  /**
   * Get stats about the current event store.
   */
  stats(): {
    total: number;
    byType: Record<string, number>;
    oldestTs: number;
    newestTs: number;
    archiveFiles: string[];
  } {
    const all = this.eventStore.all();
    const byType: Record<string, number> = {};
    let oldestTs = Infinity;
    let newestTs = 0;

    for (const e of all) {
      byType[e.type] = (byType[e.type] ?? 0) + 1;
      if (e.ts < oldestTs) oldestTs = e.ts;
      if (e.ts > newestTs) newestTs = e.ts;
    }

    // Find archive files
    const archiveFiles: string[] = [];
    try {
      const files = fs.readdirSync(this.dataDir);
      for (const f of files) {
        if (f.startsWith("events-archive-") && f.endsWith(".jsonl")) {
          archiveFiles.push(f);
        }
      }
    } catch {}

    return {
      total: all.length,
      byType,
      oldestTs: oldestTs === Infinity ? 0 : oldestTs,
      newestTs,
      archiveFiles: archiveFiles.sort(),
    };
  }

  /**
   * Rewrite the events.jsonl file and update in-memory store.
   */
  private rewriteEvents(events: AgentEvent[]): void {
    // Close current write stream
    this.eventStore.close();

    // Overwrite JSONL file
    const filePath = path.join(this.dataDir, "events.jsonl");
    fs.writeFileSync(filePath, events.map((e) => JSON.stringify(e)).join("\n") + (events.length > 0 ? "\n" : ""));

    // Replace in-memory array via reload
    // We need to access private field — use loadFromFile which sets this.events
    this.eventStore.loadFromFile(this.dataDir);

    // Re-init persistence (reopen write stream in append mode)
    this.eventStore.initPersistence(this.dataDir);
  }
}
