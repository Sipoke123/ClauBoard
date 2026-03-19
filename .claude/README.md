# Claude project skills

Skills in `skills/*/SKILL.md` are instructions for how Claude should work in this repo (visual control plane for Claude Code agents).

## Recommended order

**Phase 1 — product & plan**

1. **product-clarifier** → `docs/product-brief.md`, `docs/mvp-scope.md`
2. **task-breakdown** → milestones and first slices

**Phase 2 — foundation**

3. **repo-bootstrapper** → structure, README, `.env.example`
4. **system-designer** → `docs/architecture.md`, ADR

**Phase 3 — core stack**

5. **event-schema-designer** → `packages/shared` events, `docs/event-model.md`
6. **backend-orchestrator** → `apps/server`, `docs/backend-architecture.md`
7. **frontend-architect** → `docs/frontend-ia.md`, UI

**Phase 4 — ship**

8. **task-breakdown** again → refine tickets
9. Implement in small slices; use **execution-guardrails** on every substantial change.

## Project subagents (`agents/`)

| Subagent | When to use | Preloaded skills |
|----------|-------------|------------------|
| **planner** | Product brief, MVP, milestones, architecture, events on paper, ADR, roadmap, repo scaffold *design* | product-clarifier, task-breakdown, system-designer, event-schema-designer, repo-bootstrapper, execution-guardrails |
| **frontend-builder** | `apps/web`, operator UI, `docs/frontend-ia.md` | frontend-architect, execution-guardrails |
| **backend-builder** | `apps/server`, events API/WS, `packages/shared` events, `docs/backend-architecture.md` | backend-orchestrator, event-schema-designer, execution-guardrails |
| **reviewer** | Read-only: quality, security, alignment with `docs/*`, no edits | execution-guardrails; tools: Read, Grep, Glob |

Subagents live in `.claude/agents/*.md` (project scope). After adding files manually, restart the session or refresh via `/agents` so Claude Code picks them up.
