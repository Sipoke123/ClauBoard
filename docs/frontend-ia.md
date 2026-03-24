# Frontend information architecture

> **Status:** implemented

## Operator priorities

1. Clarity — can I tell what's happening at a glance?
2. Realtime state visibility — is this live or stale?
3. Task navigation — where is each task and who owns it?
4. Debugging utility — can I trace what went wrong?
5. Visual polish — looks good, but never at the expense of 1-4

## Views

### 1. Office (`/office`)

Two view modes, toggled via header switcher:

#### Canvas view (default)

Draggable workflow canvas — the primary operator awareness surface.

- **Agent nodes**: draggable cards showing status dot, role icon, prompt, live activity line, and mini metrics
- **Connection lines**: bezier curves between agents showing data flow with status-aware colors:
  - Green solid — active (agent working, data flowing)
  - Purple dashed — completed
  - Red dashed + X marker — blocked (agent stopped/failed, chain broken)
  - Gray thin — idle (waiting)
- **Default connections**: when no sessions exist, shows logical workflow connections (e.g., Frontend→Backend→QA)
- **Session connections**: built automatically from session dependency chains
- **Legend**: bottom-left corner explains all connection types
- **Selection**: click agent to open detail sidebar; click empty canvas to close
- **Dragging**: reposition agents freely; does not affect detail panel selection
- **Auto-scroll**: canvas scrolls when dragging near edges

#### Grid view

Traditional card grid — same as previous office floor layout with session rooms and desk cards.

#### Shared elements

- **Header bar**: aggregate stats, Canvas/Grid toggle, Launch Run button
- **Agent detail sidebar**: opens on agent selection, shows stop/resume, metrics, events/output/tools/files tabs
- **Status system**: Working (green pulse), Ready (green), Paused (amber), Blocked (amber pulse), Error (red), Offline (gray)
- **Launch panel**: collapsible "Launch Run" form in the header

### 2. Sessions (`/sessions`)

Multi-agent session management with grouped observability.

- **Create form**: name + dynamic agent list (prompt/name/cwd per agent)
- **Session list**: cards with status badge, compact metrics (agents, tools, files, duration), agent status dots
- **Session detail** (4 tabs):
  - **Agents**: per-agent cards with individual metrics (tools, files, events, duration, errors)
  - **Activity**: combined session timeline with agent and event-type filters
  - **Tools**: session-wide tool summary table (tool name, call count, error count, used by which agents)
  - **Files**: deduplicated file change table (action, path, agent, time)

### 3. Run history (`/runs`)

Flat list of all runs, newest first. Status badge, agent name, prompt, cwd, duration, start time. Stop/rerun actions.

### 4. Task board (`/tasks`)

Columns by status: In Progress, Completed, Failed. Cards show task title, agent, error.

### 5. Event timeline (`/timeline`)

Reverse-chronological feed of all events. Filterable by agent and event type prefix. Color-coded by category.

## Layout structure

```
┌──────────────────────────────────────────────────────────┐
│  Sidebar (56)    │  Main content                         │
│                  │                                        │
│  · Office (/)    │  Office: floor + detail sidebar        │
│  · Sessions      │  Sessions: list + detail panel         │
│  · Runs          │  Runs: table                           │
│  · Tasks         │  Tasks: columns                        │
│  · Timeline      │  Timeline: filterable feed             │
│                  │                                        │
│  Connection      │                                        │
│  indicator       │                                        │
└──────────────────────────────────────────────────────────┘
```

## State management

- WebSocket connection managed at app root via `Shell` component
- `Store` holds: `agents`, `runs`, `tasks`, `sessions`, `events`, `alerts` — all derived from server events
- On connect: server sends snapshot → store initializes
- On each event: store reducer updates the relevant slice
- Components subscribe via `useStore()` / `useStoreSelector()`
- No local state for domain data — everything comes from the server

## State mapping

Every visual element maps to **real** runtime/orchestration state:
- Agent desk status → derived from latest `agent.heartbeat` event
- Desk glow → `working` status (real)
- Session room → session grouping from server
- Tool counts → counted from `tool.invoked` events
- Connection indicator → WebSocket readyState

No fake data for demos unless explicitly labeled as mock.

## Canvas design

The default canvas view uses **Framer Motion drag + SVG connections**:
- Dot-grid background for spatial feel
- Agent nodes as draggable rounded cards with role icon, status, and live activity
- Bezier curve SVG connections between agents with status-aware styling
- Connection legend overlay in bottom-left corner
- Auto-scroll when dragging near canvas edges
- Positions saved in component state (reset on page reload)
- Default workflow layout positions agents in a staggered flow pattern

## Grid design (alternative)

The grid view uses **CSS grid + Tailwind**:
- Desks as rounded cards with inner "monitor" area
- Session rooms as dashed-border regions
- Status conveyed via border color + subtle glow shadows
- Sorted by agent name (stable, no jumping)
