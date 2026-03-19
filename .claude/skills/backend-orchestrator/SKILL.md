---
name: backend-orchestrator
description: Build the orchestration server that manages agent runs, tasks, events, and realtime updates.
---

# Purpose

Use this skill to implement the backend control plane.

# Core responsibilities

Implement:
- agent session registry
- run lifecycle
- task assignment
- event ingestion
- event broadcasting
- persistence
- health/status endpoints

# Rules

- Keep orchestration logic separate from UI logic.
- Prefer explicit APIs and typed contracts.
- Treat the UI as a client of the control plane.
- Persist enough state to reconstruct a run timeline.

# Deliverables

Create/update:
- `apps/server`
- `docs/backend-architecture.md`

# For this project

The backend should be able to support Claude Code adapter workers later.
Do not hardcode frontend-specific state into backend domain models.
