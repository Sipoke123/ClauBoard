# Demo Guide

How to run a smooth, repeatable demo of the ClauBoard control plane.

## Prerequisites

- Node.js >= 20
- Claude Code CLI installed (`claude --version` should work)
- This repo cloned and dependencies installed (`npm install`)

## Setup

```bash
npm install          # if not already done
```

Start the dev environment in two terminals:

```bash
# Terminal 1: Next.js UI
cd apps/web && npm run dev

# Terminal 2: Server (no adapter — runs launch from UI)
cd apps/server && npx tsx src/index.ts
```

The UI is at http://localhost:3000, server at http://localhost:3001.

The landing page is at `/`. The dashboard is at `/office`.

### Alternative: mock mode (no real Claude Code needed)

```bash
npm run dev:mock
```

This starts server + UI with six simulated agents (Alice, Bob, Carlos, Diana, Eve, Linter) that auto-launch runs and relaunch after completion. Agents can be paused/resumed. Great for exploring the UI or demoing without API access.

The default view is a **workflow canvas** with draggable agent nodes and connection lines showing data flow. Toggle to grid view via the header switcher.

## Mode indicator

The bottom-left corner shows connection status and adapter mode:

- **Mock** label + connected indicator — connected to server in mock mode (simulated agents)
- **Claude** label + connected indicator — connected to server with real Claude Code adapter
- Connected indicator only — connected but no adapter active (runs launch from UI)
- **Reconnecting...** — WebSocket disconnected, retrying

## Demo Scenarios

### Scenario 1: Single Agent Run

**What it shows:** Launch a Claude Code agent from the product and watch it work in real time.

1. Open http://localhost:3000/office (Office page)
2. Click **Launch Run** in the top-right
3. Hover a **Quick Launch** preset and click the blue **Quick Launch** button (one click!)
4. Watch the agent desk appear on the office floor
5. Click the desk to open the **Agent Detail** sidebar
6. Switch between tabs: Events, Output, Tools, Files

**If the office is empty:** The empty state has direct "Launch Run" and "New Session" buttons — no need to find them in the header.

**Key things to highlight:**
- Real Claude Code process running underneath
- Live event stream via WebSocket
- Tool invocations tracked individually
- File changes detected automatically
- Status changes reflected immediately on the desk

### Scenario 2: Parallel Multi-Agent Session

**What it shows:** Multiple agents working independently, grouped in one session.

1. Navigate to **Sessions** (sidebar)
2. Click **New**
3. Select the "Parallel Duo" preset (or configure manually)
4. Click **Create Session**
5. Return to **Office** page to see the session room with two desks
6. Watch both agents work simultaneously
7. Click a session room's **Details** button to see session-level view with Pipeline, Activity, Tools, Files tabs

**Key things to highlight:**
- Session rooms group agents visually
- Room-level metrics (active, failed, tools, files)
- Session detail page aggregates all agent activity
- Each agent can be inspected individually

### Scenario 3: Staged Dependency Pipeline

**What it shows:** Agents executing in dependency order — some wait for others to finish.

1. Navigate to **Sessions**
2. Click **New**
3. Select the "Staged Pipeline" or "Review Team" preset
4. Note the **Execution order** visualization at the bottom of the form
5. Click **Create Session**
6. Watch Stage 1 agents run while Stage 2+ agents show "Waiting"
7. As agents complete, dependent agents launch automatically
8. Failed agents cause dependents to be skipped

**Key things to highlight:**
- Dependency graph validation (cycles, duplicates rejected)
- Staged execution visible in Pipeline tab
- Waiting vs running vs completed status flows
- Honest representation — no fake collaboration

## Navigating the UI

| Page | What it shows |
|------|---------------|
| **Landing** (`/`) | Product overview, getting started, capabilities |
| **Office** (`/office`) | Spatial overview — session rooms with agent desks, status at a glance |
| **Sessions** (`/sessions`) | Create and inspect multi-agent sessions |
| **Runs** (`/runs`) | Run history table — all runs, status, duration, rerun/stop |
| **Tasks** (`/tasks`) | Kanban-style task board (in-progress / completed / failed) |
| **Timeline** (`/timeline`) | Raw event feed with type and agent filters |

## Recommended demo flow

1. **Start with the landing page** (`/`) to explain what the product is
2. Click **Open Dashboard** to enter the office
3. **Launch a quick preset** from the empty state or Launch Run panel
4. **Walk through the agent desk** and detail sidebar tabs
5. **Navigate to Sessions** and create a staged pipeline
6. **Return to Office** to show the room with grouped desks
7. **Open session details** to show pipeline view and activity feed
8. **Show Runs and Timeline** for operational depth

## Fallback: Mock Mode

If a live Claude Code run is unreliable (rate limits, network, etc.), use mock mode:

```bash
npm run dev:mock
```

Mock mode simulates six agents with realistic event sequences:
- Task creation and completion
- Tool invocations (Read, Edit, Bash, etc.)
- File changes
- Occasional errors and blocked states
- Terminal output

Everything in the UI works the same — it's the same event pipeline.

**Tip:** You can start the demo in mock mode to show the UI working quickly, then switch to real mode for the "real deal" if time permits.

## Tips for a Smooth Demo

1. **Start with mock mode** to show the UI working, then switch to real mode for the "real deal"
2. **Use Quick Launch** — hover a preset and click the blue button for one-click launch
3. **Keep prompts read-only** (e.g., "do not modify any files") for safe demos
4. **Use the Office page as your home screen** — it's the most visual and impressive surface
5. **Click into agent desks** to show the detail sidebar with tabs
6. **Navigate to Sessions** for the pipeline visualization
7. **The mode indicator** (bottom-left) shows connection status and whether you're in mock or real mode — useful to point out
8. **The landing page** is a great opening slide for context before entering the dashboard
