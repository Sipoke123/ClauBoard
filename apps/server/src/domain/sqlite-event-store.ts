import path from "node:path";
import fs from "node:fs";
import Database from "better-sqlite3";
import type { AgentEvent } from "@repo/shared";

/**
 * SQLite-backed event store. Drop-in replacement for the JSONL EventStore.
 *
 * Schema:
 *   events(id TEXT PK, type TEXT, ts INTEGER, agentId TEXT, runId TEXT, taskId TEXT, data TEXT)
 *
 * - Indexed on agentId, runId, ts for fast queries
 * - Events are stored as JSON in the `data` column (full event blob)
 * - In-memory cache for hot queries; SQLite is source of truth
 */
export class SqliteEventStore {
  private db!: Database.Database;
  private events: AgentEvent[] = [];
  private insertStmt!: Database.Statement;

  /**
   * Initialize SQLite persistence.
   * @param dataDir - directory for agentflow.db (created if missing)
   */
  initPersistence(dataDir: string): void {
    fs.mkdirSync(dataDir, { recursive: true });
    const dbPath = path.join(dataDir, "agentflow.db");

    this.db = new Database(dbPath);
    this.db.pragma("journal_mode = WAL");
    this.db.pragma("synchronous = NORMAL");

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS events (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        ts INTEGER NOT NULL,
        agentId TEXT NOT NULL,
        runId TEXT NOT NULL DEFAULT '',
        taskId TEXT NOT NULL DEFAULT '',
        data TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_events_agentId ON events(agentId);
      CREATE INDEX IF NOT EXISTS idx_events_runId ON events(runId);
      CREATE INDEX IF NOT EXISTS idx_events_ts ON events(ts);
      CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);
    `);

    this.insertStmt = this.db.prepare(`
      INSERT OR IGNORE INTO events (id, type, ts, agentId, runId, taskId, data)
      VALUES (@id, @type, @ts, @agentId, @runId, @taskId, @data)
    `);

    console.log(`[sqlite-store] initialized at ${dbPath}`);
  }

  /**
   * Load all events from SQLite into memory for replay.
   */
  loadFromFile(_dataDir: string): AgentEvent[] {
    if (!this.db) return [];

    const rows = this.db.prepare("SELECT data FROM events ORDER BY ts ASC, rowid ASC").all() as { data: string }[];
    const loaded: AgentEvent[] = [];
    let skipped = 0;

    for (const row of rows) {
      try {
        loaded.push(JSON.parse(row.data) as AgentEvent);
      } catch {
        skipped++;
      }
    }

    if (skipped > 0) {
      console.warn(`[sqlite-store] skipped ${skipped} malformed row(s)`);
    }

    this.events = [...loaded];
    console.log(`[sqlite-store] loaded ${loaded.length} events from SQLite`);
    return loaded;
  }

  append(event: AgentEvent): void {
    this.events.push(event);
    if (this.insertStmt) {
      this.insertStmt.run({
        id: event.id,
        type: event.type,
        ts: event.ts,
        agentId: event.agentId,
        runId: event.runId ?? "",
        taskId: (event as any).taskId ?? "",
        data: JSON.stringify(event),
      });
    }
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

  /**
   * Query events directly from SQLite (for large datasets where in-memory is too much).
   */
  queryByRun(runId: string): AgentEvent[] {
    if (!this.db) return [];
    const rows = this.db.prepare("SELECT data FROM events WHERE runId = ? ORDER BY ts ASC").all(runId) as { data: string }[];
    return rows.map((r) => JSON.parse(r.data) as AgentEvent);
  }

  queryByAgent(agentId: string, limit = 1000): AgentEvent[] {
    if (!this.db) return [];
    const rows = this.db.prepare("SELECT data FROM events WHERE agentId = ? ORDER BY ts DESC LIMIT ?").all(agentId, limit) as { data: string }[];
    return rows.map((r) => JSON.parse(r.data) as AgentEvent).reverse();
  }

  queryByType(type: string, limit = 500): AgentEvent[] {
    if (!this.db) return [];
    const rows = this.db.prepare("SELECT data FROM events WHERE type LIKE ? ORDER BY ts DESC LIMIT ?").all(type + "%", limit) as { data: string }[];
    return rows.map((r) => JSON.parse(r.data) as AgentEvent).reverse();
  }

  /** Total event count from SQLite (not just in-memory) */
  dbCount(): number {
    if (!this.db) return 0;
    const row = this.db.prepare("SELECT COUNT(*) as cnt FROM events").get() as { cnt: number };
    return row.cnt;
  }

  close(): void {
    this.db?.close();
  }
}
