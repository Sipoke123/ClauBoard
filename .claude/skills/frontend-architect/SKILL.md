---
name: frontend-architect
description: Design and implement the operator UI for the agent office with a strong information architecture.
---

# Purpose

Use this skill for frontend planning and implementation.

# Priorities

Prioritize:
1. operator clarity
2. realtime state visibility
3. task navigation
4. debugging utility
5. visual polish

# MVP UI

Prefer the following initial views:
- agent list
- office map / simple spatial layout
- selected agent panel
- task board
- terminal panel
- timeline/event feed

# Rules

- Avoid heavy 3D in the first implementation unless explicitly requested.
- Build 2D/2.5D first if it accelerates delivery.
- Every visual element must correspond to actual runtime state.
- Do not invent fake state for animations.

# Deliverables

Update:
- `docs/frontend-ia.md`
- relevant components and routes
