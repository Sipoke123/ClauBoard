"use client";

import Link from "next/link";
import { BuildingOffice2Icon, Square3Stack3DIcon, PlayIcon, ChartBarIcon, ArrowsRightLeftIcon, CircleStackIcon, BellIcon, PuzzlePieceIcon, RocketLaunchIcon, ShieldCheckIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import React from "react";
import { HeroHeader } from "../../../components/hero-section";
import { LandingFooter } from "../../../components/landing-footer";

const sections = [
  {
    id: "visual-workspace",
    icon: BuildingOffice2Icon,
    title: "Visual Workspace",
    description: "The heart of AgentFlow — a draggable canvas where every agent is a card you can move, inspect, and control.",
    details: [
      "Drag agents freely on the canvas to organize your workspace",
      "Connection lines between agents show dependencies and data flow",
      "Lines change color based on status: green (active), purple (completed), red (blocked), amber (bypassed), gray (idle)",
      "Click any agent to open the Detail panel with full event stream, output, tools, and files",
      "Toggle between Canvas (free-form) and Grid (structured) views",
      "Export agent state as JSON from the canvas",
      "Dot-grid background for spatial orientation",
    ],
  },
  {
    id: "agent-pipelines",
    icon: Square3Stack3DIcon,
    title: "Agent Pipelines",
    description: "Chain agents into dependency graphs. Build multi-step workflows where each agent waits for its prerequisites.",
    details: [
      "Create sessions with multiple agents and define dependencies between them",
      "Launch presets like 'Parallel Analysis Pipeline' with one click — 5 agents analyze in parallel, then an aggregator combines results",
      "The SessionOrchestrator validates the dependency graph before launching",
      "Each stage waits for its dependencies to complete before starting",
      "Failover: if an upstream agent fails or is stopped, downstream agents still launch with a context warning instead of blocking the entire chain",
      "Visual connection lines show the pipeline flow in real time",
    ],
  },
  {
    id: "interactive-agents",
    icon: PlayIcon,
    title: "Talk to Running Agents",
    description: "Send follow-up instructions to agents while they work. No need to stop and restart — just redirect in real time.",
    details: [
      "Open the Agent Detail panel and type a message in the input field",
      "The message is sent to the agent's stdin — Claude Code reads it as operator input",
      "Use this to clarify requirements, provide missing context, or change direction",
      "Messages appear in the event timeline as 'stdin' entries",
      "Works with real Claude Code CLI — the agent processes your message and adjusts its approach",
    ],
  },
  {
    id: "live-events",
    icon: ChartBarIcon,
    title: "See Everything Live",
    description: "Every tool call, file edit, terminal output, and status change streams to the UI in real time via WebSocket.",
    details: [
      "Events are append-only and replayable — server replays on startup to rebuild state",
      "Virtual scrolling handles 50,000+ events without lag (powered by @tanstack/react-virtual)",
      "Filter by event type (tool.invoked, file.changed, terminal.output, etc.) or by agent",
      "Timeline page shows all events across all agents in chronological order",
      "Agent Detail panel shows events scoped to a single agent",
      "Events are persisted to JSONL (default) or SQLite for production use",
    ],
  },
  {
    id: "context-sharing",
    icon: ArrowsRightLeftIcon,
    title: "Automatic Handoffs",
    description: "When one agent completes, the next in the pipeline receives a structured summary of what was done.",
    details: [
      "The system collects: files created/modified, tool calls made, key terminal output",
      "This context is injected into the downstream agent's prompt automatically",
      "Example: 'Agent Analyst completed. Files created: research.md, data/metrics.json. Tools: Read (5), Write (2). Read research.md for results.'",
      "If an upstream agent failed, the downstream agent is warned: 'Note: upstream agent failed. Proceeding with available context.'",
      "All agents in a session work in the same project directory — they can read each other's file output directly",
    ],
  },
  {
    id: "deployment",
    icon: CircleStackIcon,
    title: "Deploy Anywhere",
    description: "Production-ready with Docker, dual storage backends, event archival, and a plugin system for extensibility.",
    details: [
      "Docker: multi-stage build, docker-compose with mock and real profiles",
      "Storage: JSONL (default, simple) or SQLite with WAL mode (production, indexed queries)",
      "Event archival: archive old events to timestamped files, compact verbose events",
      "Auto-compact when event count exceeds threshold (configurable via COMPACT_THRESHOLD)",
      "Plugin system: register custom event types, notification rules, and lifecycle hooks",
      "Built-in metrics plugin tracks tool calls, errors, files modified, and run durations",
    ],
  },
  {
    id: "notifications",
    icon: BellIcon,
    title: "Notifications & Alerts",
    description: "Built-in alert rules monitor agent health and notify you when something needs attention.",
    details: [
      "5 built-in rules: run failed, agent blocked, tool errors (>3), long-running (>5min), task failed",
      "Alerts appear in the Office header with severity-colored badges",
      "Acknowledge alerts to dismiss them",
      "Custom rules can be added via the plugin system",
      "Alert history is persisted — review past incidents after the fact",
    ],
  },
  {
    id: "plugins",
    icon: PuzzlePieceIcon,
    title: "Plugin System",
    description: "Extend AgentFlow with custom event types, notification rules, and processing hooks.",
    details: [
      "Plugins define: name, version, custom event types, notification rules, and lifecycle hooks",
      "onRegister: initialize plugin state when loaded",
      "onEvent: process every event that flows through the system",
      "onDestroy: clean up resources when unloaded",
      "Built-in metrics plugin as reference implementation",
      "API: GET /api/plugins (list), GET /api/plugins/event-types (custom types), POST /api/plugins/emit (inject events)",
    ],
  },
  {
    id: "mock-mode",
    icon: RocketLaunchIcon,
    title: "Mock Mode",
    description: "Demo the full product without Claude Code CLI. Six simulated agents generate realistic events.",
    details: [
      "Run `npm run dev:mock` — no API key or CLI needed",
      "6 agents: Alice (Frontend), Bob (Backend), Carlos (DevOps), Diana (Security), Eve (Docs), Linter (QA)",
      "Each agent cycles through realistic prompts: rate limiting, database migration, Docker builds, security reviews",
      "Agents complete runs, take breaks, then start new tasks — simulates a live office",
      "Stop/pause individual agents from the UI",
      "Launch additional agents or pipelines on top of the mock agents",
      "Demo sessions are auto-created showing pipeline and team patterns",
    ],
  },
  {
    id: "security",
    icon: ShieldCheckIcon,
    title: "Security & Configuration",
    description: "Control what agents can access and where they can run.",
    details: [
      "ALLOWED_WORKSPACE_ROOTS: restrict which directories agents can use as working directory",
      "All agent processes run as child processes of the server — no external network access by default",
      "Events are local-only (JSONL/SQLite in data/ directory) — no cloud dependency",
      "WebSocket connections authenticated via session token (when auth is enabled)",
      "Environment variables for all configuration — no config files to leak",
    ],
  },
  {
    id: "limitations",
    icon: ExclamationTriangleIcon,
    title: "Known Limitations",
    description: "We're transparent about what's not done yet. These are actively being worked on.",
    details: [
      "Local only — runs on localhost. Authentication and multi-user support are on the roadmap",
      "Trusted environment required — uses --dangerously-skip-permissions for non-interactive agent runs. Run in development environments only",
      "File detection is approximate — catches Edit/Write tool calls but may miss files changed via Bash commands",
      "Single Claude Code provider — support for Cursor, Copilot, and other agents is planned",
    ],
  },
];

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <HeroHeader />
      <div className="max-w-4xl mx-auto px-6 pt-28 pb-16">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Documentation</h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Everything you need to know about AgentFlow — from first launch to production deployment.
          </p>
          <p className="mt-3 text-sm text-emerald-600 dark:text-emerald-400 font-medium">
            AgentFlow is free and open-source under the AGPL-3.0 License.{" "}
            <a href="https://github.com/Sipoke123/AgentFlow" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:opacity-80 transition-opacity">View on GitHub</a>
          </p>
        </div>

        {/* Table of Contents */}
        <nav className="mb-16 p-6 rounded-xl border border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.02]">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-4">On this page</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {sections.map((s) => (
              <a key={s.id} href={`#${s.id}`} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors py-1">
                <s.icon className="w-[14px] h-[14px] text-emerald-600 dark:text-emerald-400 shrink-0" />
                {s.title}
              </a>
            ))}
          </div>
        </nav>

        {/* Sections */}
        <div className="space-y-16">
          {sections.map((s) => (
            <section key={s.id} id={s.id} className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-600/[0.08] border border-emerald-500/15 flex items-center justify-center">
                  <s.icon className="w-[18px] h-[18px] text-emerald-600 dark:text-emerald-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">{s.title}</h2>
              </div>
              <p className="text-base text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">{s.description}</p>
              <ul className="space-y-3">
                {s.details.map((d, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    {d}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        {/* Quick Start */}
        <section className="mt-20">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Quick Start</h2>
          <div className="rounded-xl border border-gray-200/80 dark:border-white/10 bg-white dark:bg-white/[0.02] overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_12px_rgba(255,255,255,0.02)]">
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-50/80 dark:bg-white/[0.03] border-b border-gray-200/80 dark:border-white/10">
              <span className="w-3 h-3 rounded-full bg-red-500/80" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <span className="w-3 h-3 rounded-full bg-green-500/80" />
              <span className="ml-2 text-sm text-gray-400 dark:text-gray-500 font-mono">terminal</span>
            </div>
            <div className="p-6 font-mono text-sm">
              <div className="space-y-4">
                <div>
                  <span className="text-gray-400 dark:text-gray-500">&#35; Clone and install</span>
                  <div className="flex items-start gap-2"><span className="text-emerald-500 select-none">$</span><span className="text-gray-800 dark:text-gray-200">git clone https://github.com/Sipoke123/AgentFlow.git</span></div>
                  <div className="flex items-start gap-2"><span className="text-emerald-500 select-none">$</span><span className="text-gray-800 dark:text-gray-200">cd AgentFlow && npm install</span></div>
                </div>
                <div>
                  <span className="text-gray-400 dark:text-gray-500">&#35; Quick start with demo agents</span>
                  <div className="flex items-start gap-2"><span className="text-emerald-500 select-none">$</span><span className="text-gray-800 dark:text-gray-200">npm run dev:mock</span></div>
                </div>
                <div>
                  <span className="text-gray-400 dark:text-gray-500">&#35; Or with real Claude Code agents</span>
                  <div className="flex items-start gap-2"><span className="text-emerald-500 select-none">$</span><span className="text-gray-800 dark:text-gray-200">npm run dev</span></div>
                  <span className="text-gray-400 dark:text-gray-500">&#35; With SQLite storage</span>
                  <div className="flex items-start gap-2"><span className="text-emerald-500 select-none">$</span><span className="text-gray-800 dark:text-gray-200">STORAGE=sqlite npm run dev</span></div>
                </div>
                <div>
                  <span className="text-gray-400 dark:text-gray-500">&#35; Or use Docker</span>
                  <div className="flex items-start gap-2"><span className="text-emerald-500 select-none">$</span><span className="text-gray-800 dark:text-gray-200">docker compose up</span></div>
                </div>
                <div className="pt-2">
                  <span className="text-cyan-500 dark:text-cyan-400">Open http://localhost:3000 in your browser</span>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
      <LandingFooter />
    </div>
  );
}
