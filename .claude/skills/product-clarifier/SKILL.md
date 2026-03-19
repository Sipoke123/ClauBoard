---
name: product-clarifier
description: Turn a vague product idea into a concrete MVP brief, scope, and constraints.
---

# Purpose

Use this skill when the user has a rough product idea and the project needs a concrete definition before implementation.

# Goals

Transform the idea into:
- problem statement
- target users
- core use cases
- MVP scope
- non-goals
- risks
- success criteria

# Workflow

1. Restate the product idea in one paragraph.
2. Identify:
   - target user
   - primary workflow
   - core value
3. Propose:
   - MVP features
   - post-MVP features
   - non-goals
4. Create or update:
   - `docs/product-brief.md`
   - `docs/mvp-scope.md`
5. Do not start implementation until the MVP scope is written down.

# Output format

Always produce:
- concise summary
- assumptions
- MVP scope
- non-goals
- next implementation step

# Project-specific guidance

For this repository, assume the product is a visual control plane for Claude Code agents.
Prefer operational usefulness over visual polish.
Do not over-scope 3D features in the first iteration.
