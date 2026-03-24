# Event model

> **Status:** implemented

## Principles

- **Append-only** — events are immutable once written; never updated or deleted.
- **Replayable** — current state can be reconstructed by replaying events from the beginning.
- **Shared contract** — TypeScript types in `packages/shared/src/events.ts`; server and UI share the same definitions.
- **Versioned** — each event type has a stable name; breaking changes get a new type name.
- **Persisted** — events are appended to `data/events.jsonl`; server replays on startup.

## Base fields

Every event includes:

```typescript
interface AgentEventBase {
  id: string;          // unique event ID
  type: string;        // stable event name from catalog
  ts: number;          // Unix ms timestamp
  agentId: string;     // which agent emitted this
  runId: string;       // which run this belongs to
  taskId?: string;     // optional task context
}
```

## Event catalog (16 types)

### Agent lifecycle

| Type | Payload | When |
|------|---------|------|
| `agent.registered` | `{ name }` | Agent connects to server |
| `agent.heartbeat` | `{ status }` | Periodic health ping |
| `agent.deregistered` | `{ reason? }` | Agent disconnects |
| `agent.blocked` | `{ reason, waitingFor }` | Agent waiting for human input, permission, etc. |

### Run lifecycle

| Type | Payload | When |
|------|---------|------|
| `run.started` | `{ description? }` | New run begins |
| `run.completed` | `{ summary? }` | Run finishes successfully |
| `run.failed` | `{ error }` | Run terminates with error |
| `run.stopped` | `{ reason? }` | Run cancelled by operator |

### Task lifecycle

| Type | Payload | When |
|------|---------|------|
| `task.created` | `{ title, description? }` | New task added (implicitly in_progress) |
| `task.completed` | `{ result? }` | Task finished |
| `task.failed` | `{ error }` | Task failed |

### Tool invocation

| Type | Payload | When |
|------|---------|------|
| `tool.invoked` | `{ tool, input }` | Agent calls a tool |
| `tool.result` | `{ tool, output, durationMs }` | Tool returns result |
| `tool.error` | `{ tool, error }` | Tool call failed |

### Terminal output

| Type | Payload | When |
|------|---------|------|
| `terminal.output` | `{ stream, text }` | CLI output captured |

### File changes

| Type | Payload | When |
|------|---------|------|
| `file.changed` | `{ path, action }` | File created, edited, or deleted |

## State derivation

Domain state is derived by reducing the event stream through `EventProcessor`:

```
EventProcessor.process(event) → updates AgentRegistry, RunManager, TaskManager
EventProcessor.replay(event)  → same derivation, but skips persistence (for startup replay)
```

Events that update derived models: `agent.*`, `run.*`, `task.*`.
Events stored but not derived: `tool.*`, `terminal.*`, `file.*`.

Both server and client maintain parallel derived state. Server is authoritative; client rebuilds from WebSocket snapshot + incremental events.

## Persistence & transport

### Persistence
- Events appended to `data/events.jsonl` (one JSON line per event).
- On startup, server reads the file and replays all events to rebuild derived state.
- `EventStore.loadFromFile()` reads; `EventStore.initPersistence()` opens append stream.
- Malformed lines are skipped during replay.

### Transport
- **Ingestion:** adapters call `emit(event)` → processor + WS broadcast.
- **HTTP ingestion:** `POST /api/events` for external agents.
- **Broadcast:** server pushes each new event to all WebSocket subscribers.
- **Snapshot:** on WebSocket connect, server sends full derived state.

### SQLite storage (available now)
- SQLite event table indexed by `(runId, ts)` and `(agentId, ts)`.
- Select with `--storage sqlite` at startup; implemented in `domain/sqlite-event-store.ts`.
- Event archival / compaction for old runs via `event-archiver.ts`.
- Snapshot files for faster startup with large event logs.
