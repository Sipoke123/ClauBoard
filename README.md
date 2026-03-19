# AgentFlow

A visual control plane for [Claude Code](https://docs.anthropic.com/en/docs/claude-code) agents. Launch, monitor, and coordinate multiple AI agents from a single operator surface.

## What it does

AgentFlow gives you a real-time dashboard for supervising Claude Code agents. Instead of switching between terminals and parsing raw output, you get:

- **Workflow canvas** — draggable agent nodes on a canvas with live connection lines showing data flow between agents. Toggle to grid view
- **Session orchestration** — group agents into sessions with dependency chains (run Agent B after Agent A finishes). Visual pipeline with status-aware connections
- **Run management** — launch and stop Claude Code agents from the UI. Pause/resume agents in mock mode
- **Live event stream** — every tool call, file change, and text output appears in real time via WebSocket
- **Inspection tools** — drill into any agent to see its output, tool calls, file changes, and raw event timeline
- **Connection status visualization** — lines between agents change color based on state: green (active), purple (completed), red with X (blocked), gray (idle)

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
git clone <this-repo>
cd claude-code-office
npm install
```

### Option 1: Mock mode (recommended for first run)

No Claude Code CLI needed. Six simulated agents (Alice, Bob, Carlos, Diana, Eve, Linter) generate realistic events with auto-relaunching runs.

```bash
npm run dev:mock
```

Open http://localhost:3000 — you'll see the landing page. Click **Open Dashboard** to enter the office and see agents at work.

### Option 2: Real mode

Start server and UI together, then launch agents from the dashboard:

```bash
npm run dev
```

Open http://localhost:3000/office, click **Launch Run**, pick a preset, and watch a real Claude Code agent work.

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
2. Click **Launch Run** and pick a preset (or type a prompt)
3. Watch the agent node appear and update live with status, prompt, and activity
4. Click or drag an agent to open the detail sidebar (Events / Output / Tools / Files tabs)
5. Toggle between **Canvas** and **Grid** views using the switcher in the header

### Multi-agent session

1. Go to `/sessions` and click **New**
2. Pick a preset (Parallel Duo, Staged Pipeline, Review Team) or configure manually
3. Create the session — agents launch according to dependency rules
4. Return to `/office` to see the session room with grouped desks
5. Click **Details** on the room header for session-level metrics and activity

### Staged pipeline

Define dependencies between agents (e.g., "Analyst runs after Researcher completes"). The system validates for cycles, launches agents in order, and skips dependents if a prerequisite fails.

## Configuration

All configuration is through environment variables or CLI flags. Copy `.env.example` to `.env` to customize.

### Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Server HTTP + WebSocket port |
| `DATA_DIR` | `./data` | Directory for `events.jsonl` persistence |
| `MOCK_AGENTS` | `false` | Start with mock agents (`true` or `--mock` flag) |
| `ALLOWED_WORKSPACE_ROOTS` | _(empty)_ | Comma-separated paths agents can use as cwd. Empty = all paths allowed |
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001` | Server URL for the UI (set if server is on a different host) |
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

Events are appended to `data/events.jsonl`. On server restart, events are replayed to rebuild state. To start fresh, delete or rename the file:

```bash
rm data/events.jsonl   # or move it
```

## Running the server and UI separately

Useful when you want different flags or separate terminal output:

```bash
# Terminal 1: UI
cd apps/web && npm run dev

# Terminal 2: Server (real mode, agents launch from UI)
cd apps/server && npx tsx src/index.ts

# Terminal 2 alternative: Server in mock mode
cd apps/server && npx tsx src/index.ts --mock

# Terminal 2 alternative: Server with workspace restrictions
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

- **Event-sourced**: all state changes flow through 15 typed event types (agent lifecycle, runs, tasks, tools, terminal output, file changes)
- **Adapter pattern**: agent runtimes implement a simple `AgentAdapter` interface with `start(emit)` and `stop()`
- **JSONL persistence**: events appended to `data/events.jsonl`, replayed on server restart to rebuild state
- **WebSocket**: server pushes events to the UI in real time; sends a full snapshot on connect

See [docs/architecture.md](docs/architecture.md) for the full system design.

## What works today

- Launch real Claude Code runs from the UI with prompt, working directory, and agent name
- Launch multi-agent sessions (parallel or dependency-ordered)
- **Workflow canvas** with draggable agent nodes and status-aware connection lines
- Grid view alternative for traditional card layout
- Live event stream: tool invocations, file changes, text output, status transitions
- Stop agents from the detail panel; pause/resume in mock mode
- Session-level observability: pipeline view, activity feed, tool summary, file change log
- Dependency graph validation (cycles, self-deps, duplicates rejected before launch)
- Connection line legend showing data flow states (active, completed, blocked, idle)
- JSONL persistence with replay on restart
- Mock adapter with 6 agents and auto-relaunching runs for realistic demos
- Demo presets for quick-launch scenarios

## Limitations

This is an early-stage project. Be aware of:

- **Local only** — runs on localhost, no auth, no multi-user support
- **Single-shot runs** — each agent executes one prompt and exits (no interactive sessions)
- **Requires `--dangerously-skip-permissions`** — agents can't answer permission prompts, so permissions are bypassed. Only run in trusted environments
- **File change detection is best-effort** — detects Edit/Write tool calls but may miss files changed by Bash commands
- **No task granularity** — Claude Code doesn't expose sub-task boundaries, so each run maps to one task
- **No agent-to-agent communication** — sessions group and sequence agents but they don't share context
- **No 3D** — the office view is a 2D canvas with draggable nodes (operational clarity over visual polish)

See [docs/claude-code-adapter.md](docs/claude-code-adapter.md) for detailed observability fidelity notes.

## Troubleshooting

**"Cannot connect" / UI shows "Reconnecting..."**
- Make sure the server is running. In mock mode (`npm run dev:mock`), both start together. In real mode with separate terminals, make sure port 3001 is active.

**"spawn claude ENOENT" / agent fails immediately**
- The `claude` CLI is not installed or not in PATH. Run `claude --version` to check. Install from the [Claude Code docs](https://docs.anthropic.com/en/docs/claude-code).

**"cwd is not under any allowed workspace root"**
- You set `ALLOWED_WORKSPACE_ROOTS` but the prompt's working directory isn't under any of them. Either add the path to your allowed roots or leave the roots empty for local trust mode.

**Port 3000 or 3001 already in use**
- Another process is using the port. Kill it or change the port via `PORT` env var (for the server) or by editing the Next.js config.

**Events persist across restarts**
- By design. Delete `data/events.jsonl` to start fresh.

**Agents seem stuck in "working" after server restart**
- If the server was killed while an agent was running, the agent's terminal status never got a completion event. Delete `data/events.jsonl` to reset, or wait — the agent will time out after 10 minutes.

## Documentation

| Document | Contents |
|----------|----------|
| [Product brief](docs/product-brief.md) | Problem, users, value proposition |
| [Architecture](docs/architecture.md) | System design, components, data flow |
| [Event model](docs/event-model.md) | 15 event types, persistence, replay |
| [Backend architecture](docs/backend-architecture.md) | Server internals, adapter layer |
| [Claude Code adapter](docs/claude-code-adapter.md) | How real Claude Code integration works |
| [Frontend IA](docs/frontend-ia.md) | UI structure, views, state management |
| [Demo guide](docs/demo-guide.md) | Step-by-step demo scenarios |
| [Roadmap](docs/roadmap.md) | Phases, completed work, what's next |

## Tech stack

- **Server**: Node.js, Express, WebSocket (`ws`)
- **UI**: Next.js 15, React 19, Tailwind CSS, Framer Motion, Lucide icons
- **Shared**: TypeScript, class-variance-authority
- **Build**: Turborepo monorepo
- **Persistence**: JSONL (append-only event log)
