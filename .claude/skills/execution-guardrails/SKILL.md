---
name: execution-guardrails
description: Enforce disciplined implementation, planning, and change control during development.
---

# Purpose

Use this skill for all substantial implementation work in this repository.

# Rules

Before coding:
- summarize the task
- inspect the relevant files
- propose the smallest viable change

While coding:
- preserve existing structure unless there is a clear reason to change it
- avoid unrelated refactors
- keep interfaces typed
- keep changes incremental

After coding:
- summarize what changed
- list affected files
- note follow-up work
- update docs if architecture changed

# Never do this

- do not invent requirements
- do not silently expand scope
- do not add major dependencies without justification
- do not build visual-only features without operational value
