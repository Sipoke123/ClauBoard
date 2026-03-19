# Product brief

> **Status:** defined

## One-liner

**AgentFlow** — visual control plane for AI coding agents: operators see runs, tasks, tools, terminals, and events in one place.

## Problem

When running multiple Claude Code agents in parallel, operators have no unified view of what each agent is doing. They must switch between terminals, parse raw logs, and mentally reconstruct state. This makes it hard to:
- know which agent is stuck, idle, or making progress
- see what tools an agent is invoking and what output they produce
- intervene (cancel, reassign, nudge) at the right moment
- reconstruct what happened after the fact (post-mortem, audit)

## Target users

**Primary:** Developer / team-lead operating 2-10 Claude Code agents concurrently — needs a single dashboard to supervise, debug, and intervene.

**Secondary:** Platform engineer building internal tooling around Claude Code — needs event contracts and extensibility.

## Core value

Real-time operational visibility into multi-agent Claude Code sessions, replacing terminal-hopping with a single control surface.

## Primary workflows

1. **Monitor** — open the dashboard, see all active agents, their current run/task, and live status at a glance.
2. **Inspect** — click an agent to see its event timeline, terminal output, tool calls, and file changes.
3. **Navigate tasks** — view a task board showing assignment, status, and which agent owns each task.
4. **Debug** — scroll the event timeline to find where something went wrong; filter by agent, run, or event type.
5. **Replay** — load a completed run's event history and step through it (post-MVP stretch).

## Success criteria

- Operator can see live status of all agents within 2 seconds of page load.
- Event timeline accurately reflects server-side state (no stale UI).
- A new developer can run the full stack locally in under 5 minutes.
- All visible data maps to real orchestration state (no fake/demo data shipped as default).

## Risks & assumptions

| Risk | Mitigation |
|------|------------|
| Claude Code has no stable event API yet | Design an adapter layer; mock events for MVP |
| WebSocket scalability for many agents | MVP targets 2-10 agents; scale later |
| Scope creep into 3D/animation | Constrain MVP to 2D/2.5D; 3D is post-MVP |
| Event schema churn | Version events from day one; keep a catalog |

**Assumptions:**
- Agents emit structured events (or we can wrap their output into events).
- Single operator per deployment in MVP (no multi-tenancy).
- Local-first deployment (localhost); cloud deploy is post-MVP.

## Non-goals (initial)

- Multi-tenant SaaS deployment
- Agent-to-agent direct communication UI
- Heavy 3D office with physics/animation
- Built-in code editor or IDE replacement
- Production monitoring / alerting / PagerDuty integration
