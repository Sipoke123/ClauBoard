import fs from "node:fs";
import path from "node:path";
import type { AgentEvent } from "@repo/shared";

export class EventStore {
  private events: AgentEvent[] = [];
  private logStream: fs.WriteStream | null = null;

  /**
   * Initialize persistence. Call before appending events.
   * @param dataDir - directory for events.jsonl (created if missing)
   */
  initPersistence(dataDir: string): void {
    fs.mkdirSync(dataDir, { recursive: true });
    const filePath = path.join(dataDir, "events.jsonl");
    this.logStream = fs.createWriteStream(filePath, { flags: "a" });
  }

  append(event: AgentEvent): void {
    this.events.push(event);
    if (this.logStream) {
      this.logStream.write(JSON.stringify(event) + "\n");
    }
  }

  /**
   * Load events from a JSONL file into memory.
   * Returns the loaded events so the caller can replay them through the processor.
   */
  loadFromFile(dataDir: string): AgentEvent[] {
    const filePath = path.join(dataDir, "events.jsonl");
    if (!fs.existsSync(filePath)) return [];

    const content = fs.readFileSync(filePath, "utf-8").trim();
    if (!content) return [];

    const loaded: AgentEvent[] = [];
    let skipped = 0;
    const lines = content.split("\n");
    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        loaded.push(JSON.parse(line) as AgentEvent);
      } catch {
        skipped++;
      }
    }
    if (skipped > 0) {
      console.warn(`[event-store] skipped ${skipped} malformed line(s) in ${filePath}`);
    }
    console.log(`[event-store] loaded ${loaded.length} events from ${filePath}`);
    return loaded;
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
    this.logStream?.end();
  }
}
