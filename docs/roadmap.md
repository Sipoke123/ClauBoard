# Roadmap

> Detailed implementation plan. Each task is a focused slice with a concrete artifact.

## Phase 1 — Product & plan ✅

- [x] Product brief defined (`docs/product-brief.md`)
- [x] MVP scope locked (`docs/mvp-scope.md`)
- [x] Architecture designed (`docs/architecture.md`)
- [x] ADR-0001 accepted (`docs/decisions/ADR-0001-system-overview.md`)
- [x] Event model defined (`docs/event-model.md`)
- [x] Backend architecture defined (`docs/backend-architecture.md`)
- [x] Frontend IA defined (`docs/frontend-ia.md`)
- [x] Task breakdown and roadmap written

## Phase 2 — Repo scaffold ✅

- [x] Turborepo monorepo with `npm install && npm run dev`
- [x] `packages/shared` with event types importable from both apps
- [x] `apps/server` Express skeleton with health endpoint
- [x] `apps/web` Next.js skeleton with Tailwind
- [x] Single `npm run dev` starts both via turbo

## Phase 3 — Shared event schema ✅

- [x] `AgentEvent` discriminated union (15 event types)
- [x] API request/response types (`api.ts`)
- [x] WebSocket message types (`ws.ts`)
- [x] Dependency graph utilities (`graph.ts`)

## Phase 4 — Backend orchestration ✅

- [x] Event store (in-memory + JSONL persistence)
- [x] Agent registry, run manager, task manager
- [x] Event processor (central reducer with replay support)
- [x] REST routes: health, agents, events, tasks, runs, sessions, presets
- [x] WebSocket gateway (snapshot + broadcast)
- [x] Event ingestion endpoint (`POST /api/events`)
- [x] JSONL persistence with replay on startup

## Phase 5 — MVP operator UI ✅

- [x] WebSocket hook + reactive store
- [x] Layout shell + sidebar navigation
- [x] Office floor: agent desks with live status, session rooms
- [x] Agent detail sidebar: events, output, tools, files tabs
- [x] Task board (in-progress / completed / failed)
- [x] Event timeline with type and agent filters
- [x] Run history with stop/rerun actions
- [x] Connection status indicator

## Phase 6 — Mock agent adapter ✅

- [x] MockRunAdapter: per-run adapter (same lifecycle as real ClaudeCodeAdapter)
- [x] MockAutoLauncher: 6 agents (Alice, Bob, Carlos, Diana, Eve, Linter) with auto-relaunching
- [x] AdapterFactory pattern: RunLauncher uses factory to create mock or real adapters
- [x] Pause/resume support: stop agent pauses auto-launcher, resume relaunches
- [x] Event-driven relaunch (no polling): auto-launcher notified via onRunFinished
- [x] `--mock` flag / `MOCK_AGENTS=true` env var
- [x] `npm run dev:mock` for full stack mock development

## Phase 7 — Real Claude Code integration ✅

- [x] ClaudeCodeAdapter: spawns `claude` CLI with `--print --output-format stream-json`
- [x] Stream-json parsing: tool calls, results, text output, file changes, lifecycle
- [x] Run launcher: `POST /api/runs` starts a real Claude Code process
- [x] Run lifecycle: stop, rerun from UI
- [x] CWD validation with configurable allowed workspace roots
- [x] Adapter documented (`docs/claude-code-adapter.md`)

## Phase 8 — Multi-agent sessions ✅

- [x] Session model: group multiple runs under one session
- [x] Session creation API with agent specs
- [x] Dependency-aware orchestration (staged execution)
- [x] Dependency graph validation (cycles, self-deps, duplicates)
- [x] Session orchestrator: launches dependent agents as prerequisites complete
- [x] Session UI: create form, session list, session detail (pipeline/activity/tools/files)
- [x] Session rooms in office view with grouped desks and room-level metrics

## Phase 9 — Office polish ✅

- [x] 2D office floor with spatial desk/room layout (grid view)
- [x] Attention management: failed/blocked agents highlighted
- [x] Quick actions from office view (stop in detail panel)
- [x] Shared CVA design system (variants for status, buttons, panels, tabs, inputs)
- [x] Framer Motion for panel transitions and layout animations
- [x] Demo presets for runs and sessions
- [x] Improved empty states with onboarding hints

## Phase 11 — Workflow canvas ✅

- [x] Draggable agent nodes on canvas with dot-grid background
- [x] Bezier curve connections between agents showing data flow
- [x] Status-aware connection lines: active (green solid), completed (purple dashed), blocked (red dashed + X), idle (gray)
- [x] Connection legend in bottom-left corner of canvas
- [x] View toggle: Canvas (default) / Grid mode switcher in header
- [x] Agent role icons (Code, Terminal, FileSearch, Cpu, Shield, FileCode)
- [x] Live activity line on each agent card (tool calls, file changes, tasks)
- [x] Paused status for stopped agents with resume capability
- [x] Auto-scroll canvas when dragging near edges
- [x] Click agent to open detail, click empty space to close
- [x] Default workflow connections when no sessions exist
- [x] Session dependency chains visualized automatically

## Phase 10 — Demo readiness ✅

- [x] Demo presets API (`/api/presets/runs`, `/api/presets/sessions`)
- [x] Quick-launch preset buttons in run launcher and session creation
- [x] Demo guide document (`docs/demo-guide.md`)
- [x] README rewritten for public readability

## What's next

- [x] SQLite persistence via `--storage sqlite` (WAL mode, indexed queries, drop-in replacement for JSONL)
- [ ] Authentication and multi-user support
- [x] Interactive sessions: operator can send follow-up messages to running agents via stdin
- [x] Agent-to-agent context sharing: upstream run summary (files, tools, output) injected into dependent agent prompts
- [ ] 3D office view (Three.js / R3F) — canvas view may suffice
- [x] Failover: dependent agents launch even when upstream fails/stops (with context note in prompt)
- [ ] Cloud deployment (Docker, fly.io)
- [x] Notification engine: built-in rules (run failed, agent blocked, tool errors, long-running), WS push, UI alert bell with unread badge
- [x] Event archival (move old events to timestamped archive files) + compaction (remove verbose events for terminal runs) + auto-compact threshold
- [x] Plugin system: PluginRegistry with custom event types, notification rules, lifecycle hooks. Built-in metrics plugin

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Event schema churn | Rework in both server and UI | Types in shared package; both apps import |
| WebSocket reconnection edge cases | Stale UI state | Full snapshot on reconnect |
| JSONL file corruption on crash | Lost events | Flush after each write; skip malformed lines on replay |
| Scope creep into 3D/polish | Delays core work | Hard boundary: 2D/2.5D first |
