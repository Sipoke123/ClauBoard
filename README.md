# AgentFlow

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-emerald.svg)](./LICENSE)

A **free, open-source** visual control plane for [Claude Code](https://docs.anthropic.com/en/docs/claude-code) agents. Launch, monitor, and coordinate multiple AI agents from a single operator surface. Self-host it — no subscriptions, no limits, no cloud dependency.

## What it does

AgentFlow gives you a real-time dashboard for supervising Claude Code agents. Instead of switching between terminals and parsing raw output, you get:

- **Workflow canvas** — draggable agent nodes with live connection lines showing data flow and dependencies. Toggle to grid view
- **Agent roles** — each agent shows its role (Frontend, Backend, QA, DevOps, Security, Docs) on the card
- **Pipeline presets** — launch multi-agent pipelines (Parallel Analysis, Staged Pipeline, Review Team) with one click
- **Session orchestration** — group agents into sessions with dependency chains. If an agent is stopped, the chain blocks visually (red lines)
- **Run management** — launch and stop Claude Code agents from the UI. Stop pauses auto-relaunch in mock mode
- **Live event stream** — every tool call, file change, and text output in real time via WebSocket
- **Inspection tools** — drill into any agent to see output, tool calls, file changes, and raw event timeline
- **Export** — export all agents and their run data as JSON from the office view
- **Light/Dark theme** — toggle between themes with Claude amber accent palette, persisted to localStorage with no flash
- **Connection visualization** — lines between agents: green (active), purple (completed), red with X (blocked), amber with ≫ (bypassed/failover), gray (idle). Legend in bottom-left corner
- **Interactive messaging** — send follow-up messages to running agents from the detail panel
- **Context sharing** — dependent agents receive a summary of upstream work (files, tools, output) in their prompt
- **Failover** — if an upstream agent fails, dependents still launch with a warning instead of being blocked
- **Notifications** — built-in alert rules (run failed, agent blocked, tool errors, long-running). Real-time push via WebSocket with bell icon and unread badge
- **Event archival** — archive old events to timestamped files, compact verbose events for completed runs, auto-compact threshold
- **Plugin system** — extend AgentFlow with custom event types, notification rules, and lifecycle hooks. Built-in metrics plugin included
- **Docker ready** — multi-stage Dockerfile + docker-compose with mock profile. One command to deploy
- **Dual storage** — JSONL (default) or SQLite (`--storage sqlite`) with WAL mode and indexed queries
- **Virtual scrolling** — all tables and lists handle 50,000+ rows without lag via `@tanstack/react-virtual`

All state is derived from an append-only event stream. The UI is a projection of server state — never the source of truth.

## Who it's for

Developers or team leads running 1-10 Claude Code agents concurrently who want a single place to see what's happening, intervene when something goes wrong, and understand what happened after the fact.

## Prerequisites

- **Node.js >= 20** — check with `node --version`
- **npm >= 10** — comes with Node.js 20+
- **Claude Code CLI** (for real mode only) — `claude --version` should print a version. Install from [Claude Code docs](https://docs.anthropic.com/en/docs/claude-code). Must be authenticated.

Mock mode works without the Claude CLI.

## Quick start

```bash
git clone https://github.com/Sipoke123/AgentFlow.git
cd AgentFlow
npm install
```

### Option 1: Mock mode (recommended for first run)

No Claude Code CLI needed. Six simulated agents (Alice, Bob, Carlos, Diana, Eve, Linter) with roles generate realistic events. Two demo sessions are created automatically: a staged pipeline and a parallel session.

```bash
npm run dev:mock
```

Open http://localhost:3000 — you'll see the landing page. Click **Open Dashboard** to enter the office and see agents at work.

### Option 2: Real mode

Start server and UI together, then launch agents from the dashboard:

```bash
npm run dev
```

Open http://localhost:3000/office, click **Launch Run**, pick a preset or type a prompt, and watch a real Claude Code agent work.

> **Tip:** `npm run dev` starts both the server (port 3001) and the UI (port 3000) via Turborepo. You can also start them separately — see [Running the server and UI separately](#running-the-server-and-ui-separately).

## URLs

| URL | What |
|-----|------|
| http://localhost:3000 | Landing page with features, architecture, and getting started |
| http://localhost:3000/office | Office dashboard (canvas + grid views) |
| http://localhost:3000/sessions | Session management with pipeline visualization |
| http://localhost:3000/runs | Run history table with virtual scrolling |
| http://localhost:3000/tasks | Task board (Pending, In Progress, Completed, Failed) |
| http://localhost:3000/timeline | Event timeline with virtual scrolling |

## Key workflows

### Single agent run

1. Go to `/office` — agents appear on a draggable canvas with connection lines
2. Click **Launch Run** — sidebar opens with Single Agent and Pipeline tabs
3. Pick a preset or type a prompt
4. Watch the agent node appear and update live with status, role, prompt, and activity
5. Click or drag an agent to open the detail sidebar (Events / Output / Tools / Files tabs)

### Pipeline (multi-agent)

1. Click **Launch Run** → **Pipeline** tab
2. Pick a preset (Parallel Analysis Pipeline, Staged Pipeline, Review Team, Parallel Duo)
3. Click **Launch** — all agents appear on the canvas with dependency connections
4. Parallel agents run simultaneously; dependent agents wait for their prerequisites
5. If an agent fails or is stopped, dependents still launch with upstream context (failover). Connections turn amber (≫ bypassed)

### Real-world example

Run 5 analysis agents in parallel (Analytics, Diagnostics, Config Auditor, Code Analyst, Improvement Planner), then a Report Aggregator combines their results:

```
Analytics ──────┐
Diagnostics ────┤
Config Auditor ─┼──→ Report Aggregator
Code Analyst ───┤
Imp. Planner ───┘
```

Available as the **Parallel Analysis Pipeline** preset in Launch Run → Pipeline.

### Interactive messaging

While an agent is working, you can send follow-up messages from the Agent Detail panel. Type in the input field and press Send — the message is piped to the agent's stdin and appears in the event stream as `[operator]`.

In real mode this uses Claude Code's interactive stdin. In mock mode the agent acknowledges the message.

### Context sharing

When a session pipeline launches a dependent agent, it automatically receives a summary of what upstream agents did:

- Files created/edited (up to 15)
- Tools used with call counts
- Last output text (up to 300 chars)
- Warnings about upstream agents that failed

This context is prepended to the agent's prompt so it can build on previous work.

### Export agents

Click **Export** in the bottom-right of the office view to download a JSON file with all agents, their runs, prompts, and event counts.

### Notifications

The **Alerts** button in the office header shows real-time notifications:

- **Run Failed** (critical) — an agent run errored out
- **Agent Blocked** (warning) — agent needs attention (e.g., permission denied)
- **Run Stopped** (warning) — operator manually stopped an agent
- **Tool Errors** (warning) — 3+ tool errors in 30 seconds
- **Long Running** (info) — agent has been active for 5+ minutes

Alerts are pushed via WebSocket in real time. The bell badge shows unread count. Rules can be toggled via `GET /api/alerts/rules` and `POST /api/alerts/rules/:id`.

### Event maintenance

For long-running installations, manage event history via admin API:

```bash
# View stats (event counts by type, oldest/newest timestamp)
curl http://localhost:3001/api/admin/stats

# Archive events older than 7 days to a timestamped file
curl -X POST http://localhost:3001/api/admin/archive -H 'Content-Type: application/json' -d '{"days":7}'

# Compact: remove verbose events (heartbeats, tool details) for completed runs
curl -X POST http://localhost:3001/api/admin/compact
```

Auto-compact: set `--auto-compact 10000` to automatically compact when event count exceeds the threshold.

### Plugins

Extend AgentFlow with custom event types, notification rules, and hooks:

```ts
import type { PluginDefinition } from "./domain/plugin-registry.js";

const myPlugin: PluginDefinition = {
  id: "cost-tracker",
  name: "Cost Tracker",
  version: "1.0.0",
  eventTypes: [
    { type: "plugin.cost.update", label: "Cost Update", color: "text-pink-400" },
  ],
  onEvent(event) {
    if (event.type === "run.completed") {
      // Track costs per agent
    }
  },
  onRegister(ctx) {
    // Emit custom events via ctx.emit()
  },
};
```

API:
- `GET /api/plugins` — list registered plugins
- `GET /api/plugins/event-types` — all custom event types

The built-in **metrics plugin** tracks tool call rates, error rates, and run durations, emitting `plugin.metrics.snapshot` every 60 seconds.

## Theme

Toggle between light and dark themes using the switch in the sidebar or on the landing page footer. The palette uses Claude-inspired warm amber accents throughout. Your preference is saved to localStorage and applied instantly on page load (no flash).

## Configuration

All configuration is through environment variables or CLI flags. Copy `.env.example` to `.env` to customize.

### Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Server HTTP + WebSocket port |
| `DATA_DIR` | `./data` | Directory for persistence files |
| `STORAGE` | `jsonl` | Storage backend: `jsonl` (default) or `sqlite` |
| `MOCK_AGENTS` | `false` | Start with mock agents (`true` or `--mock` flag) |
| `ALLOWED_WORKSPACE_ROOTS` | _(empty)_ | Comma-separated paths agents can use as cwd |
| `AUTO_COMPACT` | `0` | Auto-compact when event count exceeds threshold (0 = disabled) |
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001` | Server URL for the UI |
| `NEXT_PUBLIC_WS_URL` | `ws://localhost:3001/ws` | WebSocket URL for the UI |

### Allowed workspace roots

By default, agents can use any working directory. For safer use, restrict to specific directories:

```bash
# Via environment variable
ALLOWED_WORKSPACE_ROOTS=/home/user/projects,/tmp/sandbox

# Via CLI flag
cd apps/server && npx tsx src/index.ts --allowed-roots "/home/user/projects,/tmp/sandbox"
```

The UI status bar shows a shield icon indicating whether restrictions are active.

### Storage backends

**JSONL (default)** — events appended to `apps/server/data/events.jsonl`. Simple, human-readable, easy to debug.

**SQLite** — events stored in `apps/server/data/agentflow.db`. WAL mode, indexed queries, better for production and large datasets.

```bash
# Use SQLite
npm run dev:mock -- --storage sqlite

# Or via environment variable
STORAGE=sqlite npm run dev:mock
```

On server restart, events are replayed from the chosen backend to rebuild state. To start fresh:

```bash
# JSONL
rm apps/server/data/events.jsonl

# SQLite
rm apps/server/data/agentflow.db
```

## Running the server and UI separately

```bash
# Terminal 1: UI
cd apps/web && npm run dev

# Terminal 2: Server (real mode)
cd apps/server && npx tsx src/index.ts

# Terminal 2 alternative: Mock mode
cd apps/server && npx tsx src/index.ts --mock

# Terminal 2 alternative: With workspace restrictions
cd apps/server && npx tsx src/index.ts --allowed-roots "/path/to/safe/dir"
```

## Docker

Build and run with Docker:

```bash
# Build the image
docker compose build

# Run in real mode
docker compose up

# Run in mock mode (6 demo agents)
docker compose --profile mock up

# Run detached with SQLite
STORAGE=sqlite docker compose up -d
```

Ports: `3000` (UI) and `3001` (server). Data persisted to `./data/` volume.

The image uses a multi-stage build (~150MB final) with standalone Next.js output and tini for proper signal handling.

## Commands

| Command | What it does |
|---------|-------------|
| `npm install` | Install all workspace dependencies |
| `npm run dev` | Start server (3001) + UI (3000) together |
| `npm run dev:mock` | Start with six simulated agents and demo sessions |
| `npm run build` | Build all packages |
| `npm run type-check` | Typecheck all packages |
| `npm run lint` | Lint all packages |

## Architecture

```
apps/web/            Next.js 15 operator UI (port 3000)
apps/server/         Express + WebSocket orchestration server (port 3001)
packages/shared/     TypeScript event types, API contracts, WS messages
```

- **Event-sourced**: all state changes flow through 15 typed event types
- **Adapter pattern**: agent runtimes implement `AgentAdapter` with `start(emit)` and `stop()`
- **Dual persistence**: JSONL (default) or SQLite with WAL mode and indexed queries
- **WebSocket**: server pushes events + debounced snapshots to UI in real time
- **Virtual scrolling**: `@tanstack/react-virtual` on all tables and lists — handles 50,000+ rows
- **CSS variable theming**: light/dark themes via `:root` and `.dark` class toggle with Claude amber palette
- **Notification engine**: rule-based alerts evaluated on every event, pushed via WebSocket
- **Event archival**: archive + compact commands for managing large histories
- **Client-side navigation**: Next.js `<Link>` for instant page transitions

See [docs/architecture.md](docs/architecture.md) for the full system design.

## What works today

- Launch real Claude Code runs from the UI
- Pipeline presets: Parallel Analysis (5+1), Staged Pipeline, Review Team, Parallel Duo
- Workflow canvas with draggable nodes and dependency-based auto-layout
- Grid view alternative with unified card design and hover animations
- Agent roles displayed on cards and detail panel
- Live event stream: tool calls, file changes, output, status transitions
- Stop agents from detail panel (pauses auto-relaunch in mock)
- Session orchestration with dependency validation and real-time status updates
- Demo sessions auto-created in mock mode (Feature Pipeline + Infrastructure & Docs)
- Session deep-linking from Office → Sessions page
- Light/dark theme toggle with Claude amber accent palette (flash-free)
- Connection line legend (active, completed, blocked, bypassed, idle)
- Export agents data as JSON
- Virtualized tables on Runs, Timeline, Tasks, Agent Detail, and Session Activity tabs
- Task board with status-colored cards (Pending, In Progress, Completed, Failed)
- Landing page with animated hero, features, architecture, newsletter footer
- Consistent selection highlighting across Canvas, Grid, and Sessions views
- JSONL persistence with replay on restart
- Mock adapter with 6 role-based agents and deterministic prompt sequencing
- Interactive messaging: send follow-up messages to running agents
- Context sharing: upstream run summaries injected into dependent agent prompts
- Failover: dependents launch even when upstream fails (with warning context)
- SQLite storage option with WAL mode, indexed queries, and direct query methods
- Notification engine with 5 built-in alert rules and real-time WS push
- Alert bell in office header with severity colors and unread badge
- Event archival (move old events to archive files) and compaction (remove verbose events)
- Auto-compact threshold for hands-off maintenance
- Plugin system with custom event types, notification rules, and lifecycle hooks
- Built-in metrics plugin (tool calls, errors, run durations)
- Docker deployment with multi-stage build, standalone Next.js, tini signal handling
- Accessible: keyboard navigation on all interactive elements, aria-labels, focus-visible states
- Theme-safe: all colors use CSS tokens, grid dots and gradients adapt to light/dark

## Limitations

- **Local only** — runs on localhost, no auth, no multi-user support
- **Requires `--dangerously-skip-permissions`** — only run in trusted environments
- **File change detection is best-effort** — detects Edit/Write but may miss Bash file changes
- **No task granularity** — each run maps to one task

See [docs/claude-code-adapter.md](docs/claude-code-adapter.md) for observability fidelity notes.

## Troubleshooting

**"Cannot connect" / UI shows "Reconnecting..."**
- Make sure the server is running on port 3001.

**"spawn claude ENOENT" / agent fails immediately**
- The `claude` CLI is not installed or not in PATH.

**"cwd is not under any allowed workspace root"**
- Add the path to `ALLOWED_WORKSPACE_ROOTS` or leave empty for local trust mode.

**Events persist across restarts**
- By design. Delete `apps/server/data/events.jsonl` to start fresh.

**Old agents appear after restart**
- Delete `apps/server/data/events.jsonl` and restart the server.

## Documentation

| Document | Contents |
|----------|----------|
| [Product brief](docs/product-brief.md) | Problem, users, value proposition |
| [Architecture](docs/architecture.md) | System design, components, data flow |
| [Event model](docs/event-model.md) | 15 event types, persistence, replay |
| [Backend architecture](docs/backend-architecture.md) | Server internals, adapter layer |
| [Claude Code adapter](docs/claude-code-adapter.md) | Real Claude Code integration |
| [Frontend IA](docs/frontend-ia.md) | UI structure, views, state management |
| [Demo guide](docs/demo-guide.md) | Step-by-step demo scenarios |
| [Roadmap](docs/roadmap.md) | Phases, completed work, what's next |

## Tech stack

- **Server**: Node.js, Express, WebSocket (`ws`)
- **UI**: Next.js 15, React 19, Tailwind CSS v4, Framer Motion, Lucide icons
- **Shared**: TypeScript, class-variance-authority
- **Build**: Turborepo monorepo
- **Theming**: CSS custom properties with Claude amber accent palette
- **Performance**: `@tanstack/react-virtual` for virtual scrolling
- **Persistence**: JSONL (default) or SQLite via `better-sqlite3`

## Contributing

Contributions are welcome. The project is AGPL-3.0 licensed and open to anyone.

1. Fork the repository
2. Create a feature branch: `git checkout -b my-feature`
3. Make your changes — keep the diff small and focused
4. Run `npm run type-check && npm run lint` to verify
5. Open a pull request against `main`

Please follow the existing code style and keep changes incremental. For large changes, open an issue first to discuss the approach.

## License

AGPL-3.0 License — see [LICENSE](./LICENSE) for details.

For commercial licensing (proprietary use without AGPL obligations), contact us via GitHub.

Copyright (c) 2026 AgentFlow
