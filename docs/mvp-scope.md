# MVP scope

> **Status:** defined

## MVP — must have

### Backend (orchestration server)
- [ ] Agent session registry (register, heartbeat, deregister)
- [ ] Run lifecycle management (create, start, complete, fail)
- [ ] Task CRUD with agent assignment
- [ ] Event ingestion endpoint (POST structured events)
- [ ] Event persistence (append-only, in-memory + file for MVP)
- [ ] WebSocket gateway broadcasting events to connected UIs
- [ ] REST API: list agents, runs, tasks; get event timeline
- [ ] Health endpoint

### Shared types
- [ ] TypeScript event schema with base fields (type, ts, agentId, runId, taskId?, payload)
- [ ] Event catalog: agent.started, agent.stopped, run.started, run.completed, task.created, task.assigned, task.completed, tool.invoked, tool.result, terminal.output, file.changed
- [ ] Shared request/response types for REST API

### Frontend (operator UI)
- [ ] Agent list panel — live status badges (idle, working, error, offline)
- [ ] Simple 2D office layout — agents as positioned cards/avatars on a spatial canvas
- [ ] Selected-agent detail panel — current run, task, recent events
- [ ] Task board — columns by status, drag optional
- [ ] Terminal panel — live streamed output per agent
- [ ] Event timeline — filterable feed of all events, color-coded by type
- [ ] WebSocket connection for real-time updates
- [ ] Basic routing: `/` (office overview), `/agent/:id`, `/tasks`, `/timeline`

### Dev experience
- [ ] Monorepo with shared types (apps/web, apps/server, packages/shared)
- [ ] Single `npm run dev` starts both server and UI
- [ ] Mock event generator for development without real agents
- [ ] README with quickstart (<5 min to running)

## Post-MVP

- Agent replay: step through a completed run's events
- Multi-provider support (Cursor, Copilot, Devin)
- Authentication and multi-user support
- Webhook integrations (Slack, Discord)
- Notification / alert rules
- Authentication & multi-user
- Cloud deployment (Docker, fly.io)
- Plugin system for custom event types

## Explicitly out of scope for MVP

- Multi-tenancy or user accounts
- Production-grade persistence (database)
- CI/CD pipeline
- Mobile layout
- Any 3D rendering or physics
- Direct agent control (start/stop/kill from UI) — display only in MVP
- Code editing or IDE features

## Constraints

- Prefer operational clarity over visual polish.
- Do not over-scope 3D in the first iteration unless explicitly prioritized.
- All UI state must be a projection of server-side events, never the source of truth.
- Event schema is versioned from day one.
- Local-first: everything runs on localhost in MVP.
