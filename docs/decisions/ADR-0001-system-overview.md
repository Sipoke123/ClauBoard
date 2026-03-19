# ADR-0001: System overview

## Status

Accepted

## Context

We are building a visual control plane for Claude Code agents. Before implementation, we need a shared understanding of component boundaries, communication patterns, and where the source of truth lives. Key tension: the UI must feel real-time and alive, but must never be the authority on system state.

## Decision

The system is a **three-layer architecture**:

1. **Agent layer** — Claude Code processes (or mock generators in MVP) push structured events to the server via HTTP POST. Agents are fire-and-forget event producers; they do not query the server.

2. **Orchestration server** — A Node.js/Express service that:
   - Maintains the agent registry, run lifecycle, and task state
   - Ingests events into an append-only store
   - Derives current state by reducing the event stream
   - Broadcasts events to connected UIs via WebSocket
   - Exposes REST endpoints for historical queries

3. **Operator UI** — A Next.js app that is a pure **projection** of server state. It connects via WebSocket for live updates and falls back to REST for initial loads and history. It contains no business logic and never writes domain state.

**Source of truth:** the event stream + derived state in the orchestration server. The UI is always a read-only consumer.

**Shared types:** a `packages/shared` package holds TypeScript interfaces for events, API contracts, and domain models. Both server and UI import from it, ensuring type-safe contracts.

## Consequences

**Positive**

- Clear separation: UI bugs cannot corrupt domain state.
- Event-sourced model makes replay and debugging natural.
- Shared types catch contract drift at compile time.
- Mock generator makes the UI fully developable without real agents.

**Negative / tradeoffs**

- Event-derived state adds complexity vs. simple CRUD — acceptable given replay/debug requirements.
- WebSocket adds operational surface vs. polling — but latency requirements demand it.
- Monorepo tooling (turborepo) has a learning curve — but the alternative (separate repos with published packages) is worse for a small team.

## Alternatives considered

| Alternative | Why rejected |
|-------------|--------------|
| UI polls REST every N seconds | Too slow for real-time feel; wastes bandwidth |
| UI writes state directly to a database | Violates projection principle; hard to replay |
| Microservices (separate registry, event store, etc.) | Over-engineered for MVP; monolith is fine |
| GraphQL instead of REST + WS | Adds complexity; REST + WS is simpler for this shape of data |

## References

- [Architecture](../architecture.md)
- [Event model](../event-model.md)
