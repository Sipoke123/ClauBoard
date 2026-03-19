---
name: frontend-implementation-style
description: Enforce the frontend stack, package choices, Tailwind styling patterns, motion system, and component implementation style for the Claude Code agent office UI.
---

# Purpose

Use this skill whenever building, refactoring, or polishing frontend UI in this repository.

This skill defines the required frontend implementation stack, allowed libraries, styling conventions, motion rules, and component quality standards.

The goal is to make the product feel like a premium agent office / mission control surface, not a generic admin dashboard.

# Required stack

Use the following by default:

- React
- Next.js App Router
- TypeScript
- Tailwind CSS
- Framer Motion
- lucide-react
- clsx
- tailwind-merge
- class-variance-authority

If any of these are missing and needed for the task, add them.

# Package rules

## Required packages

Use these packages unless the repository already has equivalent local abstractions:

- `tailwindcss`
- `framer-motion`
- `lucide-react`
- `clsx`
- `tailwind-merge`
- `class-variance-authority`

## Allowed packages when clearly useful

These may be added only if the task truly benefits from them:

- `reactflow` for dependency or workflow visualization
- `shadcn/ui` primitives if lightweight reuse is clearly beneficial

## Avoid by default

Do not introduce these unless the user explicitly requests them or there is a very strong reason:

- large UI frameworks like MUI, Ant Design, Chakra UI
- dashboard template kits
- multiple overlapping animation libraries
- CSS-in-JS frameworks for normal component work
- heavy charting or graph libraries unless actually required
- decorative visual libraries that add noise without operator value

# Design intent

The frontend should feel like:

- a premium operator control plane
- a live agent office
- a mission control surface
- a spatial 2D / 2.5D monitoring environment

It should NOT feel like:

- a generic admin dashboard
- a plain CRUD app
- a toy game interface
- a flat enterprise backoffice
- a decorative motion demo

# Tailwind implementation rules

Use Tailwind as the primary styling system.

## Preferred Tailwind patterns

Prefer:

- grid-based layouts
- clear spacing hierarchy
- reusable utility compositions
- layered surfaces
- consistent radius and border treatment
- dark or neutral control-plane palettes
- high-contrast state indicators

Prefer classes and patterns such as:

- `rounded-2xl` for major surfaces
- `rounded-xl` for smaller controls and inner panels
- `border border-white/10` or similar subtle borders
- `bg-zinc-950`, `bg-zinc-900`, `bg-zinc-800/60` or equivalent neutral dark surfaces
- `shadow-lg`, `shadow-xl`, soft layered shadows
- restrained `ring-*` or border emphasis for focus and status
- compact, readable `text-sm` / `text-xs` secondary UI
- stronger `text-base` / `text-lg` / `text-xl` hierarchy for important labels

## Avoid in Tailwind usage

Avoid:

- flat boxy styling with little depth
- excessive gradients on every surface
- random accent colors with no semantic meaning
- giant padding everywhere that lowers information density
- inconsistent radius choices
- uncontrolled blur and glassmorphism
- highly saturated consumer-app styling
- mixing too many unrelated visual patterns

# Class composition rules

Use `clsx` and `tailwind-merge` for class composition.

When a component has multiple visual variants, use `class-variance-authority`.

## Rules

- Do not build giant inline class strings with repeated conditional logic.
- Extract reusable visual variants into CVA when a component has meaningful states or variants.
- Use `clsx` + `tailwind-merge` or a local `cn()` helper for readable class composition.
- Keep component styling consistent across desks, rooms, badges, pills, buttons, and panels.

## Typical use cases for CVA

Use CVA for:

- status badges
- metric pills
- desk states
- room states
- action buttons
- panel variants
- alert banners

# Motion rules

Use `framer-motion` for meaningful motion and transitions.

## Use motion for

- panel enter / exit
- sidebar open / close
- detail drawer transitions
- subtle hover emphasis
- layout transitions when desks or rooms reorder
- status-driven emphasis
- appearance of banners, pills, and contextual controls
- room and desk selection transitions

## Motion should be

- subtle
- fast
- informative
- state-driven
- supportive of clarity

## Avoid motion that is

- theatrical
- slow
- bouncy
- decorative-only
- applied to every element
- disconnected from real state

## Motion examples that are good

Good uses:

- selected desk slightly lifts or scales
- detail sidebar fades/slides in cleanly
- room summary pills animate into place
- active status uses restrained pulse or glow
- layout changes between waiting/running/completed feel smooth

## Motion examples that are bad

Bad uses:

- large sweeping page transitions everywhere
- bouncing cards
- continuous ambient animation with no meaning
- parallax effects for no operational benefit
- motion that reduces scanability

# Visual language

Use a consistent design language across the app.

## Major surfaces

Use distinct but related surfaces for:

- office surface
- room containers
- desks / workstations
- detail panels
- timeline feeds
- run/session summaries
- forms and launch controls

## Preferred feel

Prefer:

- layered dark surfaces
- premium control-plane density
- monitor-like inner panels
- restrained glow for active or error states
- clear separation between overview and detail layers
- calm, readable hierarchy

## Avoid

Avoid:

- bland white-card SaaS styling
- loud neon everywhere
- excessive visual clutter
- decorative chrome without utility
- fake 3D effects that do not improve understanding

# Spatial UI rules

The office surface should feel spatial even before full 3D.

## Spatial metaphors

Use:

- desks or workstations for agents
- rooms or zones for sessions
- a common area for ungrouped agents
- layered panel hierarchy to create depth
- deterministic layout, not chaotic placement

## Important constraint

Do not invent movement, relationships, or presence that are not backed by real state.

No fake walking, fake collaboration lines, or fake room activity.

# Component preferences

## Preferred component shapes

Prefer components that look like:

- mission-control panels
- desks / workstations
- room headers with summaries
- compact metric strips
- status-rich detail drawers
- operator action bars
- structured tabs for inspection

## Agent desk rules

Each desk should usually show:

- agent name
- status
- one short run/prompt summary if relevant
- 1 to 3 key metrics
- attention indicator when needed
- nearby quick actions where appropriate

Do not overload the desk with raw logs or too much text.

## Session room rules

Each room should usually show:

- session name
- concise health summary
- active/failed/blocked/done counts when relevant
- room-level actions where helpful
- grouped desks with clear scanability

# Status semantics

Status visuals must always map to real state.

## Preferred meanings

- green = running / active / healthy in-progress
- yellow = blocked / attention needed / waiting
- red = failed / urgent / error
- gray = idle / inactive / completed where appropriate
- blue or cyan = informational / grouping / tool/file activity

## Rules

- Never rely on color alone; pair it with text, icon, badge, border, or shape.
- Keep status semantics consistent across the app.
- Never invent a status style without a real corresponding state.

# Typography and spacing

## Typography

Use a clear hierarchy:

- strong headings for major panels and pages
- medium emphasis for room and desk labels
- small muted text for metadata
- readable compact text for operational details

Avoid overly tiny text for critical information.

## Spacing

Use consistent spacing scale.

Prefer:

- compact, information-dense cards
- enough breathing room for scanability
- tighter spacing inside dense operator surfaces
- larger spacing only for section separation

# Interaction rules

- Important actions should be close to the entity they affect.
- Hover states should clarify interactivity.
- Selection should feel immediate and visible.
- The office layer is for awareness, navigation, and quick action.
- Detailed debugging belongs in detail panels, tabs, and dedicated views.
- Keep common workflows low-click.

# Information architecture constraints

When polishing UI, preserve the product structure:

- office surface for overview
- room/session grouping for multi-agent awareness
- detail sidebars and pages for inspection
- timeline and specialized tabs for debugging
- quick actions near desks and room headers

Do not turn overview surfaces into raw log dumps.

# Accessibility and clarity

- Maintain strong contrast.
- Do not use color as the only signal.
- Keep controls clearly clickable.
- Keep text readable on dark surfaces.
- Ensure important states remain visible even when many agents are on screen.

# Implementation discipline

When modifying frontend code:

1. Inspect the existing component structure first.
2. Prefer improving and unifying current components over replacing everything.
3. Keep changes incremental.
4. Reuse status semantics and shared primitives.
5. Avoid large visual rewrites that break functionality.
6. Update relevant frontend docs if the design language changes materially.

# For this project

This project should evolve toward a polished 2D / 2.5D office control plane before any full 3D work.

The product should feel:

- premium
- alive
- operator-focused
- spatial
- high-signal

But never at the expense of:

- operational clarity
- truthful state representation
- scanability
- control usability

Every visual improvement must improve operator understanding, confidence, or speed of action.