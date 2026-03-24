# Backend architecture

> **Status:** implemented (MVP)

## Responsibilities

- **Agent session registry** — track which agents are connected, their status (including blocked)
- **Run lifecycle** — create, start, complete, fail runs; associate with agents
- **Task management** — CRUD tasks, assign to agents, track status
- **Event ingestion** — accept structured events via adapter `emit()` or REST POST, validate, persist
- **Event broadcasting** — push events to WebSocket subscribers in real-time
- **State derivation** — maintain in-memory views of agents/runs/tasks by reducing events
- **Persistence** — append events to JSONL; replay on startup to rebuild state
- **Adapter hosting** — start/stop `AgentAdapter` implementations
- **Health / status APIs** — liveness check, system stats

## Boundaries

- Orchestration and domain logic live here; the UI is a **read-only client**.
- Domain models must not be frontend-specific.
- The server owns event validation and ordering — adapters are untrusted producers.
- Adapters interact only through the `EmitFn` callback — no access to server internals.

## Internal structure

```
apps/server/src/
├── index.ts              # entry point: wires domain, replay, Express, WS, adapter
├── config.ts             # port, data dir, env vars
├── adapter/
│   ├── types.ts                # AgentAdapter interface + EmitFn type
│   ├── mock-run-adapter.ts     # mock run adapter (single run simulation)
│   ├── mock-auto-launcher.ts   # auto-launches 6 mock agents (Alice, Bob, Carlos, Diana, Eve, Linter)
│   └── claude-code-adapter.ts  # real Claude Code CLI adapter
├── domain/
│   ├── event-store.ts          # in-memory + JSONL persistence + file loading
│   ├── event-processor.ts      # central reducer (process + replay modes)
│   ├── agent-registry.ts       # agent state (idle, working, blocked, error, offline)
│   ├── run-manager.ts          # run lifecycle
│   ├── task-manager.ts         # task state
│   ├── run-launcher.ts         # manages launching multiple Claude Code adapter instances
│   ├── session-manager.ts      # multi-agent session registry and lifecycle
│   ├── session-orchestrator.ts # staged dependency execution for sessions
│   ├── notification-engine.ts  # alert rules, firing, and acknowledgement
│   ├── plugin-registry.ts      # plugin loading and event-type extension
│   ├── event-archiver.ts       # JSONL archival and compaction
│   ├── demo-event-store.ts     # in-memory event store for demo/test mode
│   └── sqlite-event-store.ts   # SQLite-backed event store (--storage sqlite)
├── routes/
│   ├── agents.ts         # GET /api/agents, GET /api/agents/:id
│   ├── runs.ts           # GET /api/runs, POST /api/runs (launch), GET /api/runs/:id, POST /api/runs/:id/stop, POST /api/runs/:id/message
│   ├── events.ts         # POST /api/events, GET /api/events
│   ├── tasks.ts          # GET /api/tasks
│   ├── health.ts         # GET /api/health
│   ├── sessions.ts       # GET/POST /api/sessions, GET /api/sessions/:id, POST /api/sessions/:id/stop
│   ├── presets.ts        # GET /api/presets/runs, GET /api/presets/sessions
│   ├── admin.ts          # GET /api/admin/stats, POST /api/admin/archive, POST /api/admin/compact
│   ├── notifications.ts  # GET/POST /api/alerts, POST /api/alerts/:id/ack, GET/POST /api/alerts/rules
│   └── plugins.ts        # GET /api/plugins, GET /api/plugins/event-types
└── ws/
    └── gateway.ts        # WebSocket: snapshot on connect, broadcast on event
```

## Adapter layer

```typescript
interface AgentAdapter {
  readonly name: string;
  start(emit: EmitFn): void;
  stop(): void;
}
```

The server creates the adapter, passes it an `emit` function that chains:
`emit(event) → processor.process(event) → gateway.broadcast(event)`

This keeps adapters decoupled from persistence, state derivation, and WS transport.

### Current adapters

| Adapter | Agents | Activation |
|---------|--------|------------|
| `MockAutoLauncher` + `MockRunAdapter` | Alice, Bob, Carlos, Diana, Eve, Linter (6 simulated) | `--mock` flag or `MOCK_AGENTS=true` |
| `ClaudeCodeAdapter` | Real Claude Code CLI process | `--claude "prompt"` flag or `CLAUDE_PROMPT` env |

## Persistence

### Current (JSONL)
- Events appended to `data/events.jsonl` (one JSON line per event)
- On startup: `loadFromFile()` reads lines → `replay()` derives state → `initPersistence()` opens append stream
- Malformed lines skipped during replay
- `data/` directory created automatically, gitignored

### SQLite (available via `--storage sqlite`)
- SQLite with `events` table: `(id, type, ts, agentId, runId, taskId, payload)`
- Indexes on `(runId, ts)` and `(agentId, ts)`
- Implemented in `domain/sqlite-event-store.ts`; select with `--storage sqlite` at startup
- Periodic snapshots to speed up startup (see `event-archiver.ts`)

## Error handling

- Invalid events rejected with 400 + validation errors (REST path)
- Adapter events go through the same processor — invalid events are stored but may not derive correctly
- WS disconnects handled gracefully; clients reconnect and receive a fresh snapshot
- Graceful shutdown: adapter stopped, JSONL stream closed, HTTP server closed

## Related

- [Architecture](./architecture.md)
- [Event model](./event-model.md)
