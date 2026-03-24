# Architecture

> **Status:** implemented (MVP)

## System context

```
┌─────────────────────────────────────────────────────────┐
│                    Operator (browser)                    │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │              Operator UI (Next.js)                 │  │
│  │  Agent list · Office map · Tasks · Terminal · Log  │  │
│  └──────────────────────┬────────────────────────────┘  │
│                         │ WS + REST                     │
└─────────────────────────┼───────────────────────────────┘
                          │
┌─────────────────────────┼───────────────────────────────┐
│                         ▼                               │
│  ┌───────────────────────────────────────────────────┐  │
│  │         Orchestration Server (Node/Express)       │  │
│  │                                                   │  │
│  │  Agent Registry · Run Manager · Task Manager      │  │
│  │  Event Processor · Event Store · WS Gateway       │  │
│  └──────────┬───────────────────────────┬────────────┘  │
│             │                           │               │
│  ┌──────────▼──────────┐  ┌─────────────▼────────────┐  │
│  │  Event Store        │  │  Adapter Layer           │  │
│  │  (memory + JSONL)   │  │  AgentAdapter interface   │  │
│  └─────────────────────┘  └─────────────┬────────────┘  │
│                                         │               │
│          Orchestration Server boundary  │               │
└─────────────────────────────────────────┼───────────────┘
                                          │
            ┌─────────────────────────────┼──────────┐
            │         Adapter implementations        │
            │                                        │
            │  ┌──────────────┐  ┌────────────────┐  │
            │  │ MockAdapter  │  │ ClaudeCode     │  │
            │  │ 6 fake agents│  │ Adapter        │  │
            │  │ built-in     │  │ real CLI       │  │
            │  └──────────────┘  └────────────────┘  │
            │                                        │
            │  External agents: POST /api/events     │
            └────────────────────────────────────────┘
```

## Major components

| Component | Responsibility | Location |
|-----------|----------------|----------|
| **Operator UI** | Renders projections of orchestration state; no business logic | `apps/web` |
| **Orchestration Server** | Agent registry, run/task lifecycle, event ingest, persistence, WS broadcast | `apps/server` |
| **Event Processor** | Central reducer: appends events to store + derives state; supports replay mode for startup | `apps/server/src/domain/event-processor.ts` |
| **Event Store** | In-memory event array + JSONL file append; loads from file on startup | `apps/server/src/domain/event-store.ts` |
| **Adapter Layer** | Typed interface (`AgentAdapter`) for any agent runtime to emit events | `apps/server/src/adapter/types.ts` |
| **MockRunAdapter** | Built-in adapter producing fake events for 6 role-based agents | `apps/server/src/adapter/mock-run-adapter.ts` |
| **ClaudeCodeAdapter** | Spawns real `claude` CLI, parses stream-json output into events | `apps/server/src/adapter/claude-code-adapter.ts` |
| **Shared Types** | TypeScript interfaces for events, API requests/responses, domain models | `packages/shared` |

## Adapter contract

```typescript
interface AgentAdapter {
  readonly name: string;
  start(emit: EmitFn): void;   // begin producing events
  stop(): void;                 // clean up on shutdown
}

type EmitFn = (event: AgentEvent) => void;
```

Adapters receive a single `emit` callback. The server handles persistence, state derivation, and WS broadcast. Adapters never access server internals.

External agents can also POST events to `/api/events` — the adapter contract is the in-process equivalent.

## Communication

| Path | Protocol | Direction | Purpose |
|------|----------|-----------|---------|
| UI ↔ Server | WebSocket | bidirectional | Real-time event stream, agent status updates |
| UI → Server | HTTP REST | request/response | Fetch agents, runs, tasks; launch new runs |
| Adapter → Server | `emit()` callback | push (in-process) | Structured events from in-process adapters |
| External Agent → Server | HTTP POST | push | `POST /api/events` for out-of-process agents |
| Server → UI | WebSocket push | server→client | Broadcast new events as they arrive |

### REST API routes

```
GET    /api/health

GET    /api/agents
GET    /api/agents/:id
POST   /api/agents/:id/pause
POST   /api/agents/:id/resume

GET    /api/runs
GET    /api/runs/:id
POST   /api/runs              ← operator launches a Claude Code run
POST   /api/runs/:id/stop
POST   /api/runs/:id/message

GET    /api/tasks

GET    /api/events
POST   /api/events            ← external agents post here

GET    /api/sessions
POST   /api/sessions
GET    /api/sessions/:id
POST   /api/sessions/:id/stop

GET    /api/presets/runs
GET    /api/presets/sessions

GET    /api/admin/stats
POST   /api/admin/archive
POST   /api/admin/compact

GET    /api/alerts
POST   /api/alerts/:id/ack
POST   /api/alerts/ack-all
GET    /api/alerts/rules
POST   /api/alerts/rules/:id

GET    /api/plugins
GET    /api/plugins/event-types
```

### WebSocket messages

```
Server → Client:
  { type: "event", data: AgentEvent }
  { type: "snapshot", data: { agents, runs, tasks, sessions } }
  { type: "alert", data: AlertPayload }

Client → Server:
  { type: "subscribe", filters?: { agentId?, runId? } }
```

## Source of truth

- **Runtime truth:** event stream + persisted run/task/agent state in the orchestration server.
- **UI:** pure projection of server state via WebSocket and REST. UI never mutates domain state directly.
- **Events:** append-only, immutable once written. State is derived by reducing the event stream.
- **Persistence:** JSONL file replayed on startup to rebuild all derived state.

## Startup sequence

1. `EventStore.loadFromFile()` reads `data/events.jsonl`
2. Events loaded into memory (not re-persisted)
3. `EventProcessor.replay()` derives state for each event
4. `EventStore.initPersistence()` opens append stream for new events
5. Express + WS server starts
6. Adapter starts (if configured)

## Deployment model (MVP)

- **Local only.** Both server and UI run on localhost.
- `apps/server` → Express on port 3001
- `apps/web` → Next.js dev server on port 3000, proxying API to 3001
- Single `npm run dev` at repo root starts both via turbo.
- Event data persisted to `data/events.jsonl` (gitignored).

## Security notes

> **Warning:** Do not expose the server to a public network without adding authentication — there is none in the current implementation.

- MVP is local-only, single operator, no auth.
- Event ingestion endpoint has no authentication — acceptable for localhost.
- Post-MVP: add API key for agent→server auth; add session auth for UI.
- No secrets in the event stream — adapters must sanitize before emitting.

## Related

- [ADR-0001: System overview](./decisions/ADR-0001-system-overview.md)
- [Event model](./event-model.md)
- [Backend architecture](./backend-architecture.md)
- [Frontend IA](./frontend-ia.md)
