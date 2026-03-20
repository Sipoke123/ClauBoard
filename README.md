# AgentFlow

A visual control plane for [Claude Code](https://docs.anthropic.com/en/docs/claude-code) agents. Launch, monitor, and coordinate multiple AI agents from a single operator surface.

## What it does

AgentFlow gives you a real-time dashboard for supervising Claude Code agents. Instead of switching between terminals and parsing raw output, you get:

- **Workflow canvas** — draggable agent nodes with live connection lines showing data flow. Toggle to grid view
- **Pipeline presets** — launch multi-agent pipelines (Parallel Analysis, Staged Pipeline, Review Team) with one click
- **Session orchestration** — group agents into sessions with dependency chains. Visual pipeline with status-aware connections
- **Run management** — launch and stop Claude Code agents from the UI sidebar
- **Live event stream** — every tool call, file change, and text output in real time via WebSocket
- **Inspection tools** — drill into any agent to see output, tool calls, file changes, and raw event timeline
- **Light/Dark theme** — toggle between light and dark themes, persisted to localStorage
- **Connection visualization** — lines between agents change color: green (active), purple (completed), red with X (blocked), gray (idle)

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

No Claude Code CLI needed. Six simulated agents generate realistic events with auto-relaunching runs.

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
| http://localhost:3000 | Landing page |
| http://localhost:3000/office | Office dashboard (main view) |
| http://localhost:3000/sessions | Session management |
| http://localhost:3000/runs | Run history |
| http://localhost:3000/tasks | Task board |
| http://localhost:3000/timeline | Event timeline |

## Key workflows

### Single agent run

1. Go to `/office` — agents appear on a draggable canvas with connection lines
2. Click **Launch Run** — sidebar opens with Single Agent and Pipeline tabs
3. Pick a preset or type a prompt
4. Watch the agent node appear and update live with status, prompt, and activity
5. Click or drag an agent to open the detail sidebar (Events / Output / Tools / Files tabs)

### Pipeline (multi-agent)

1. Click **Launch Run** → **Pipeline** tab
2. Pick a preset (Parallel Analysis Pipeline, Staged Pipeline, Review Team, Parallel Duo)
3. Click **Launch** — all agents appear on the canvas with dependency connections
4. Parallel agents run simultaneously; dependent agents wait for their prerequisites
5. If an agent fails, dependents are skipped and connections turn red

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

## Theme

Toggle between light and dark themes using the switch in the sidebar. Your preference is saved to localStorage.

## Configuration

All configuration is through environment variables or CLI flags. Copy `.env.example` to `.env` to customize.

### Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Server HTTP + WebSocket port |
| `DATA_DIR` | `./data` | Directory for `events.jsonl` persistence |
| `MOCK_AGENTS` | `false` | Start with mock agents (`true` or `--mock` flag) |
| `ALLOWED_WORKSPACE_ROOTS` | _(empty)_ | Comma-separated paths agents can use as cwd |
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

### Persistence

Events are appended to `apps/server/data/events.jsonl`. On server restart, events are replayed to rebuild state. To start fresh:

```bash
rm apps/server/data/events.jsonl
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

## Commands

| Command | What it does |
|---------|-------------|
| `npm install` | Install all workspace dependencies |
| `npm run dev` | Start server (3001) + UI (3000) together |
| `npm run dev:mock` | Start with six simulated agents |
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
- **JSONL persistence**: events appended to file, replayed on restart
- **WebSocket**: server pushes events to UI in real time; snapshot on connect
- **CSS variable theming**: light/dark themes via `:root` and `.dark` class toggle

See [docs/architecture.md](docs/architecture.md) for the full system design.

## What works today

- Launch real Claude Code runs from the UI
- Pipeline presets: Parallel Analysis (5+1), Staged Pipeline, Review Team, Parallel Duo
- Workflow canvas with draggable nodes and dependency-based auto-layout
- Grid view alternative for traditional card layout
- Live event stream: tool calls, file changes, output, status transitions
- Stop agents from detail panel
- Session orchestration with dependency validation
- Light/dark theme toggle with localStorage persistence
- Connection line legend (active, completed, blocked, idle)
- JSONL persistence with replay on restart
- Mock adapter with 6 agents for realistic demos

## Limitations

- **Local only** — runs on localhost, no auth, no multi-user support
- **Single-shot runs** — each agent executes one prompt and exits
- **Requires `--dangerously-skip-permissions`** — only run in trusted environments
- **File change detection is best-effort** — detects Edit/Write but may miss Bash file changes
- **No task granularity** — each run maps to one task
- **No agent-to-agent communication** — sessions group and sequence agents but they don't share context

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
- **Theming**: CSS custom properties with light/dark toggle
- **Persistence**: JSONL (append-only event log)
