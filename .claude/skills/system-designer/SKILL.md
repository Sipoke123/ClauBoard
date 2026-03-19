---
name: system-designer
description: Design the architecture, components, interfaces, and data flow before implementation.
---

# Purpose

Use this skill before implementing any major subsystem.

# Required outputs

Produce:
- system context
- major components
- responsibilities of each component
- communication paths
- deployment model
- security notes
- open questions

# Required documents

Update:
- `docs/architecture.md`
- `docs/decisions/ADR-0001-system-overview.md` if missing

# Rules

- Prefer explicit interfaces over implicit coupling.
- Identify source of truth for runtime state.
- Separate orchestration state from UI projection.
- Distinguish MVP architecture from future architecture.

# For this project

The source of truth should be the event stream and persisted run state.
The visual office is a projection of runtime state, not the source of truth.
