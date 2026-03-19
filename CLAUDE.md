# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Product

**AgentFlow** — visual control plane for AI coding agents: tasks, runs, tools, terminal, events. Workflow canvas with draggable nodes and status-aware connections. Operational utility over visual polish.

## Project status

Working MVP with real Claude Code integration and workflow canvas. Operator can launch runs from the UI via `POST /api/runs`. Mock (6 agents, auto-relaunch) and real adapters both use the same RunLauncher path via AdapterFactory. Events persisted to JSONL and replayed on startup. See `docs/roadmap.md`.

## Commands

```bash
npm install              # install all workspace dependencies
npm run dev              # start server (3001) + web (3000) via turbo
npm run dev:mock         # start with mock agent data
npm run build            # build all packages
npm run type-check       # typecheck all packages
npm run lint             # lint all packages
```

Real Claude Code agent (run server and UI separately):
```bash
cd apps/web && npm run dev                                          # Terminal 1: UI
cd apps/server && npx tsx src/index.ts --claude "Your prompt here"  # Terminal 2: server + agent
```

Individual packages:
```bash
cd apps/server && npm run dev       # server only
cd apps/web && npm run dev          # Next.js only
cd packages/shared && npm run type-check  # check shared types
```

## Source of truth

**Written docs in the repo** are the persistent memory, not session context alone.

| Document | Purpose |
|----------|---------|
| `docs/product-brief.md` | Product, users, value |
| `docs/mvp-scope.md` | Must-have / post-MVP / non-goals |
| `docs/architecture.md` | Components, flows, deploy |
| `docs/event-model.md` | Events (append-only, replay) |
| `docs/frontend-ia.md` | Screens and UI navigation |
| `docs/backend-architecture.md` | Orchestrator, API/WS |
| `docs/roadmap.md` | Phases and checklists |
| `docs/decisions/ADR-0001-system-overview.md` | Key architectural decision |

Before major changes, **read** the relevant `docs/*` and update them alongside code.

**Principle:** runtime source of truth is the **event stream + persisted run state**; UI is a **projection**, not the source of truth.

## Monorepo structure

```
apps/web/            Next.js 15 operator UI (port 3000)
apps/server/         Express + WS orchestration server (port 3001)
packages/shared/     TypeScript event types, API contracts, WS messages
```

- Shared types imported as `@repo/shared` — both apps depend on it.
- Web proxies `/api/*` to server via Next.js rewrites.
- Server uses `tsx watch` for dev; no separate compile step needed.

## Skills and subagents

- **Skills** (role instructions): `.claude/skills/*/SKILL.md`
- **Subagents** (delegation): `.claude/agents/*.md` — `planner`, `frontend-builder`, `backend-builder`, `reviewer`
- Phase order and agent table: `.claude/README.md`

## How to work

1. Planning and docs → **planner** subagent (or skills: product-clarifier, task-breakdown, system-designer, event-schema-designer, repo-bootstrapper).
2. UI → **frontend-builder**; server and events → **backend-builder**.
3. Read-only review → **reviewer** (Read/Grep/Glob only).
4. Implementation: small slices, typed contracts, no scope creep — see **execution-guardrails** skill.

## Key design constraints

- Events are append-only and replayable; shared TypeScript types live in `packages/shared`.
- Events persisted to `data/events.jsonl`; server replays on startup to rebuild state.
- Agent runtimes integrate via the `AgentAdapter` interface (`apps/server/src/adapter/types.ts`).
- `RunLauncher` uses `AdapterFactory` — creates `MockRunAdapter` or `ClaudeCodeAdapter` per run.
- Mock auto-launcher is event-driven (no polling): notified via `onRunFinished`.
- Backend owns domain logic and orchestration; UI is a client/projection.
- Default canvas view with draggable nodes and SVG connection lines; grid view as alternative.
- Connection lines are status-aware: active (green), completed (purple), blocked (red + X), idle (gray).
- Prefer operational clarity over visual polish.
