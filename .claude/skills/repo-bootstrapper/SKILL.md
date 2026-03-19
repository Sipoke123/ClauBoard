---
name: repo-bootstrapper
description: Create the initial repository structure, tooling, docs, and developer setup for a new project.
---

# Purpose

Use this skill when starting a new project from scratch.

# Responsibilities

Create:
- repository structure
- package manager setup
- root README
- docs folder
- env example
- lint/format config
- scripts for dev/build/test

# Default architecture

Prefer:
- monorepo if frontend + backend + shared contracts are needed
- separate packages/apps for:
  - `apps/web`
  - `apps/server`
  - `packages/shared`
  - `docs`

# Rules

- Explain the proposed structure before creating many files.
- Keep the first scaffold minimal and runnable.
- Avoid speculative packages unless directly needed.
- Add TODO markers only when they correspond to an explicit planned milestone.

# Deliverables

Create:
- `README.md`
- `docs/architecture.md`
- `docs/roadmap.md`
- `.env.example`

# For this project

Default stack:
- TypeScript
- Next.js frontend
- Node.js backend
- shared event schema package
- WebSocket realtime transport
