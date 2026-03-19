---
name: office-3d-builder
description: Build a polished 3D office layer for the agent control plane using a real-time scene, avatar variants, state-driven animation, and a premium mission-control aesthetic.
---

# Purpose

Use this skill whenever building or refining the 3D office layer for this repository.

This skill is specifically for adding a spatial 3D office interface on top of the existing control-plane product.

The 3D office must remain operationally useful:
- it is a spatial visualization and interaction layer for real agent/session state
- it is not a fake simulation
- it is not a decorative mini-game

# Core product intent

The 3D office should feel like:
- a live AI agent office
- a premium spatial control plane
- a believable workplace for active agents

It should not feel like:
- a random game scene
- a toy sandbox
- a fake social sim
- visual noise disconnected from the actual system state

# Required frontend stack

Prefer and use by default:

- React
- Next.js
- TypeScript
- Tailwind CSS
- Framer Motion for surrounding 2D UI transitions
- React Three Fiber for 3D scene rendering
- @react-three/drei for helpers, controls, environment helpers, text, staging, and useful abstractions
- lucide-react for surrounding UI controls
- clsx
- tailwind-merge
- class-variance-authority

If needed for animation and assets, these are allowed:

- three
- @react-three/postprocessing for restrained scene polish
- leva only if a small internal scene tuning panel is clearly useful during development
- gltfjsx if the workflow benefits from converting models into components

Avoid adding a large game stack unless clearly necessary.

# Scene design principles

The 3D office must support these ideas:

- rooms or zones correspond to real sessions or groups
- desks correspond to real agents
- common areas correspond to ungrouped agents
- agents visually reflect real status
- movement and animation must be derived from actual system state, not random decoration

# Avatar system requirements

Support at least 3 selectable avatar display modes for agents.

Default acceptable examples:
1. human office workers
2. cats
3. robots

The user should be able to switch avatar mode globally from the product UI.

If real 3D character assets are unavailable, use stylized placeholder avatars with strong silhouette and readable animation states.
Do not block implementation waiting for perfect art assets.

# Animation rules

Each avatar should support a minimal but believable animation/state model.

At minimum:

- idle
- working at desk
- walking / moving between points
- blocked / waiting
- failed / error state
- selected / focused state

Animation must always be state-driven.

Examples:
- running/working agent sits or faces desk/monitor
- blocked agent shows waiting posture or subtle attention marker
- failed agent shows alert/error marker, not cartoon drama
- moving agent only moves when there is a real scene reason for repositioning
- idle agent remains at desk or in neutral posture

Do not add random wandering with no real meaning.

# State mapping rules

The 3D office is a projection of real system state.

Map real state such as:
- working
- idle
- blocked
- failed
- stopped
- completed
- selected
- session membership

to scene-level visuals such as:
- avatar animation
- desk glow
- room emphasis
- status markers
- path movement
- camera focus
- hover/selection treatment

Never invent fake backend state just to make the scene look busy.

# Spatial behavior rules

Prefer deterministic placement over chaotic simulation.

- each agent should have a stable desk/home position
- each session should have a stable room/zone
- common-area agents should have stable placement
- camera movement should help operator understanding
- selection should move focus cleanly to the relevant desk/room

Walking should be used carefully.

Good uses:
- entering a newly created session area
- transitioning to a meeting or shared zone if such a zone is tied to real state
- repositioning when the layout changes for real reasons

Bad uses:
- constant wandering
- fake pacing
- ambient movement disconnected from state

# Visual style

The office should feel:

- premium
- clean
- spatial
- slightly cinematic
- mission-control adjacent
- readable at a glance

Use:
- restrained dark-modern palette
- warm office lighting or clean sci-fi-neutral lighting
- premium materials without realism obsession
- readable silhouettes
- strong desk / room landmarks
- subtle scene depth and atmosphere

Avoid:
- over-busy environments
- excessive post-processing
- cluttered props everywhere
- cartoon chaos
- horror/game aesthetics
- fake realism if assets are weak

# Scene composition

Prefer a layout with:
- clear office floor
- distinct desk clusters or rooms
- monitors / desk surfaces
- visible navigation landmarks
- easy camera framing
- enough negative space for readability

Optional but good:
- small ambient props
- status screens
- room labels
- light floor patterns
- subtle environmental depth cues

# Camera and controls

The 3D office should support operator-friendly navigation.

Prefer:
- a default angled overview camera
- click-to-focus on desk or room
- smooth camera transitions
- optional reset view
- optional follow selected agent
- limited zoom/pan/orbit as appropriate

Do not make the user fight the camera.

# UI integration

The 3D office must stay integrated with the existing product.

Keep:
- detail sidebars
- selection behavior
- session grouping semantics
- quick actions where useful
- truthful status indicators

The 3D scene should complement, not replace, the existing inspection surfaces.

# Performance rules

Keep the first implementation practical.

- optimize for smoothness over asset complexity
- prefer instancing or lightweight assets if needed
- avoid extremely heavy models
- avoid overusing shadows/postprocessing
- build a visually convincing MVP before chasing realism

# Implementation strategy

Prefer this order:
1. define scene architecture and state mapping
2. create stable room/desk layout
3. add avatar system with 3 selectable modes
4. add minimal state-driven animation
5. add selection/focus/camera behavior
6. add restrained visual polish
7. stop before overbuilding

# For this project

This product already has a strong 2D control plane.
The 3D office must build on that foundation.

The 3D layer should:
- feel impressive
- remain usable
- clearly reflect real agent/session state
- preserve the mission-control / office metaphor

Do not turn the product into a game.
Do not sacrifice operational clarity for visual spectacle.