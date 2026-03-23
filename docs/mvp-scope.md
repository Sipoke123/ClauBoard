# MVP scope

> **Status:** completed

## MVP — must have

### Backend (orchestration server)
- [x] Agent session registry (register, heartbeat, deregister)
- [x] Run lifecycle management (create, start, complete, fail)
- [x] Task CRUD with agent assignment
- [x] Event ingestion endpoint (POST structured events)
- [x] Event persistence (append-only, in-memory + file for MVP)
- [x] WebSocket gateway broadcasting events to connected UIs
- [x] REST API: list agents, runs, tasks; get event timeline
- [x] Health endpoint

### Shared types
- [x] TypeScript event schema with base fields (type, ts, agentId, runId, taskId?, payload)
- [x] Event catalog: agent.started, agent.stopped, run.started, run.completed, task.created, task.assigned, task.completed, tool.invoked, tool.result, terminal.output, file.changed
- [x] Shared request/response types for REST API

### Frontend (operator UI)
- [x] Agent list panel — live status badges (idle, working, error, offline)
- [x] Simple 2D office layout — agents as positioned cards/avatars on a spatial canvas
- [x] Selected-agent detail panel — current run, task, recent events
- [x] Task board — columns by status, drag optional
- [x] Terminal panel — live streamed output per agent
- [x] Event timeline — filterable feed of all events, color-coded by type
- [x] WebSocket connection for real-time updates
- [x] Basic routing: `/` (office overview), `/agent/:id`, `/tasks`, `/timeline`

### Dev experience
- [x] Monorepo with shared types (apps/web, apps/server, packages/shared)
- [x] Single `npm run dev` starts both server and UI
- [x] Mock event generator for development without real agents
- [x] README with quickstart (<5 min to running)

## Post-MVP

- Agent replay: step through a completed run's events
- Multi-provider support (Cursor, Copilot, Devin)
- Authentication and multi-user support
- Webhook integrations (Slack, Discord)
- [x] Notification / alert rules
- Authentication & multi-user
- [x] Cloud deployment (Docker, fly.io)
- [x] Plugin system for custom event types

## Explicitly out of scope for MVP

- Multi-tenancy or user accounts
- ~~Production-grade persistence (database)~~ — SQLite storage added
- CI/CD pipeline
- ~~Mobile layout~~ — mobile responsive added
- Any 3D rendering or physics
- ~~Direct agent control (start/stop/kill from UI) — display only in MVP~~ — implemented
- Code editing or IDE features

## Constraints

- Prefer operational clarity over visual polish.
- Do not over-scope 3D in the first iteration unless explicitly prioritized.
- All UI state must be a projection of server-side events, never the source of truth.
- Event schema is versioned from day one.
- Local-first: everything runs on localhost in MVP.
