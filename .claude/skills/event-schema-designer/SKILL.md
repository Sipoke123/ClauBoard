---
name: event-schema-designer
description: Design normalized event contracts for agent activity, tasks, terminals, tools, and UI projections.
---

# Purpose

Use this skill when defining realtime protocols and persisted runtime events.

# Objectives

Define:
- event types
- JSON schemas or TypeScript types
- stable identifiers
- timestamps
- correlation IDs
- task/agent/run relationships

# Required outputs

Create or update:
- `packages/shared/src/events.ts`
- `docs/event-model.md`

# Rules

- Use append-only event thinking.
- Each event must have:
  - `type`
  - `ts`
  - `agentId`
  - `runId`
  - optional `taskId`
  - structured payload
- Design for replayability.
- Design events for both storage and realtime transport.

# For this project

Must support events for:
- agent lifecycle
- task lifecycle
- tool invocation
- shell output
- file changes
- git changes
- human intervention
- collaboration/handoff
- UI presence/state
