"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Building2,
  Layers,
  Play,
  Activity,
  Search,
  Rocket,
  ArrowRight,
  Check,
  AlertTriangle,
  Terminal,
  GitBranch,
  Zap,
  Database,
  Wifi,
  Server,
  Globe,
  Code2,
  Box,
} from "lucide-react";
import { cn } from "../../lib/cn";
import { buttonVariants, panelVariants } from "../../lib/variants";
import { HeroSection } from "../../components/hero-section";

// ---------------------------------------------------------------------------
// Animation helpers
// ---------------------------------------------------------------------------

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" as any },
  transition: { duration: 0.5 },
};

const stagger = {
  whileInView: { transition: { staggerChildren: 0.08 } },
  viewport: { once: true, margin: "-80px" as any },
};

const fadeUpChild = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};

// ---------------------------------------------------------------------------
// Sections
// ---------------------------------------------------------------------------


function Features() {
  const features = [
    {
      icon: Building2,
      title: "Office View",
      description: "Spatial 2D layout where each agent is a desk inside session rooms, with live status indicators and quick actions.",
    },
    {
      icon: Layers,
      title: "Session Orchestration",
      description: "Group agents into sessions with optional dependency chains. Run Agent B only after Agent A finishes.",
    },
    {
      icon: Play,
      title: "Run Management",
      description: "Launch, stop, and rerun AI agents directly from the UI. Preset templates for quick demos.",
    },
    {
      icon: Activity,
      title: "Live Event Stream",
      description: "Every tool call, file change, and text output appears in real time via WebSocket. 15 typed event types.",
    },
    {
      icon: Search,
      title: "Inspection Tools",
      description: "Drill into any agent to see output, tool calls, file changes, and raw event timeline across tabs.",
    },
  ];

  return (
    <section id="features" className="max-w-6xl mx-auto px-6 py-20">
      <motion.div {...fadeUp} className="text-center mb-12">
        <h2 className="text-2xl font-bold text-foreground mb-3">What it does</h2>
        <p className="text-muted-fg text-sm">Everything you need to supervise AI agents in one surface.</p>
      </motion.div>
      <motion.div {...stagger} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((f) => (
          <motion.div
            key={f.title}
            {...fadeUpChild}
            className={cn(panelVariants({ variant: "elevated" }), "p-5 hover:border-foreground/[0.12] transition-colors")}
          >
            <div className="w-9 h-9 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center mb-4">
              <f.icon size={16} className="text-blue-400" />
            </div>
            <h3 className="text-sm font-semibold text-foreground mb-2">{f.title}</h3>
            <p className="text-xs text-muted-fg leading-relaxed">{f.description}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

function Workflows() {
  const workflows = [
    {
      title: "Single Agent Run",
      steps: [
        "Click Launch Run on the Office page",
        "Pick a preset or type a prompt",
        "Watch the agent desk appear and update live",
        "Click the desk to inspect output, tools, and files",
      ],
    },
    {
      title: "Multi-Agent Session",
      steps: [
        "Go to Sessions and click New",
        "Pick a preset or configure agents manually",
        "Create the session — agents launch in parallel",
        "See the session room with grouped desks on Office",
      ],
    },
    {
      title: "Staged Pipeline",
      steps: [
        "Define dependencies between agents",
        "The system validates for cycles before launch",
        "Stage 1 runs first, dependents wait",
        "Failed agents cause dependents to be skipped",
      ],
    },
  ];

  return (
    <section className="max-w-6xl mx-auto px-6 py-20">
      <motion.div {...fadeUp} className="text-center mb-12">
        <h2 className="text-2xl font-bold text-foreground mb-3">Key workflows</h2>
        <p className="text-muted-fg text-sm">Three ways to use the control plane, from simple to orchestrated.</p>
      </motion.div>
      <motion.div {...stagger} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {workflows.map((w, wi) => (
          <motion.div
            key={w.title}
            {...fadeUpChild}
            className={cn(panelVariants({ variant: "surface" }), "p-5")}
          >
            <div className="flex items-center gap-2.5 mb-4">
              <span className="w-6 h-6 rounded-lg bg-muted flex items-center justify-center text-xs font-bold text-muted-fg">{wi + 1}</span>
              <h3 className="text-sm font-semibold text-foreground">{w.title}</h3>
            </div>
            <ol className="space-y-2.5">
              {w.steps.map((step, si) => (
                <li key={si} className="flex items-start gap-2.5 text-xs text-muted-fg leading-relaxed">
                  <span className="text-muted-fg/60 font-mono shrink-0 mt-0.5">{si + 1}.</span>
                  {step}
                </li>
              ))}
            </ol>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

function Architecture() {
  const components = [
    {
      icon: Globe,
      name: "apps/web",
      tech: "Next.js 15 + React 19",
      description: "Operator UI with spatial office layout, session management, run history, task board, and event timeline.",
    },
    {
      icon: Server,
      name: "apps/server",
      tech: "Express + WebSocket",
      description: "Orchestration server with agent registry, run lifecycle, event processor, JSONL persistence, and adapter layer.",
    },
    {
      icon: Box,
      name: "packages/shared",
      tech: "TypeScript",
      description: "15 event types, API contracts, WebSocket messages, and dependency graph utilities shared between both apps.",
    },
  ];

  const patterns = [
    { icon: Database, label: "Event-sourced", detail: "Append-only event stream as source of truth" },
    { icon: Code2, label: "Adapter pattern", detail: "AgentAdapter interface with start(emit) and stop()" },
    { icon: Wifi, label: "Real-time", detail: "WebSocket pushes events to UI; snapshot on connect" },
    { icon: GitBranch, label: "Dependency graph", detail: "Validated execution order for staged sessions" },
  ];

  return (
    <section id="architecture" className="max-w-6xl mx-auto px-6 py-20">
      <motion.div {...fadeUp} className="text-center mb-12">
        <h2 className="text-2xl font-bold text-foreground mb-3">Architecture</h2>
        <p className="text-muted-fg text-sm">Turborepo monorepo with shared typed contracts.</p>
      </motion.div>

      <motion.div {...stagger} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {components.map((c) => (
          <motion.div key={c.name} {...fadeUpChild} className={cn(panelVariants({ variant: "surface" }), "p-5")}>
            <div className="flex items-center gap-2.5 mb-3">
              <c.icon size={15} className="text-muted-fg" />
              <code className="text-sm font-semibold text-foreground">{c.name}</code>
            </div>
            <div className="text-[10px] text-muted-fg/60 font-medium uppercase tracking-wider mb-2">{c.tech}</div>
            <p className="text-xs text-muted-fg leading-relaxed">{c.description}</p>
          </motion.div>
        ))}
      </motion.div>

      <motion.div {...stagger} className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {patterns.map((p) => (
          <motion.div key={p.label} {...fadeUpChild} className={cn(panelVariants({ variant: "inset" }), "p-4 text-center")}>
            <p.icon size={16} className="text-blue-400/60 mx-auto mb-2" />
            <div className="text-xs font-semibold text-foreground/80 mb-1">{p.label}</div>
            <div className="text-[10px] text-muted-fg/60">{p.detail}</div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

function WorksToday() {
  const items = [
    "Launch real agent runs from the UI",
    "Multi-agent sessions (parallel or dependency-ordered)",
    "Live event stream: tool calls, file changes, output",
    "Stop and rerun agents from the UI",
    "Session-level pipeline view, activity feed, tool summary",
    "Dependency graph validation before launch",
    "JSONL persistence with replay on restart",
    "Mock adapter for development without Claude CLI",
    "Demo presets for quick-launch scenarios",
  ];

  return (
    <section className="max-w-6xl mx-auto px-6 py-20">
      <motion.div {...fadeUp} className="text-center mb-12">
        <h2 className="text-2xl font-bold text-foreground mb-3">What works today</h2>
        <p className="text-muted-fg text-sm">Shipped and working in the current build.</p>
      </motion.div>
      <motion.div {...stagger} className="max-w-2xl mx-auto">
        <div className={cn(panelVariants({ variant: "surface" }), "p-6")}>
          <ul className="space-y-3">
            {items.map((item) => (
              <motion.li key={item} {...fadeUpChild} className="flex items-start gap-3 text-sm text-foreground/80">
                <Check size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                {item}
              </motion.li>
            ))}
          </ul>
        </div>
      </motion.div>
    </section>
  );
}

function Limitations() {
  const items = [
    { text: "Local only", detail: "Runs on localhost, no auth, no multi-user support" },
    { text: "Single-shot runs", detail: "Each agent executes one prompt and exits (no interactive sessions)" },
    { text: "Requires --dangerously-skip-permissions", detail: "Only run in trusted environments" },
    { text: "Best-effort file detection", detail: "Detects Edit/Write tools but may miss Bash file changes" },
    { text: "No task granularity", detail: "Agent CLI doesn't expose sub-tasks, so each run is one task" },
    { text: "No agent-to-agent communication", detail: "Sessions group and sequence agents but they don't share context" },
  ];

  return (
    <section className="max-w-6xl mx-auto px-6 py-20">
      <motion.div {...fadeUp} className="text-center mb-12">
        <h2 className="text-2xl font-bold text-foreground mb-3">Current limitations</h2>
        <p className="text-muted-fg text-sm">This is early-stage. Here is what does not work yet.</p>
      </motion.div>
      <motion.div {...stagger} className="max-w-2xl mx-auto">
        <div className={cn(panelVariants({ variant: "inset" }), "p-6")}>
          <ul className="space-y-3">
            {items.map((item) => (
              <motion.li key={item.text} {...fadeUpChild} className="flex items-start gap-3 text-sm">
                <AlertTriangle size={13} className="text-amber-400/70 shrink-0 mt-0.5" />
                <div>
                  <span className="text-foreground/80 font-medium">{item.text}</span>
                  <span className="text-muted-fg/60"> — {item.detail}</span>
                </div>
              </motion.li>
            ))}
          </ul>
        </div>
      </motion.div>
    </section>
  );
}

function GettingStarted() {
  return (
    <section id="getting-started" className="max-w-6xl mx-auto px-6 py-20">
      <motion.div {...fadeUp} className="text-center mb-12">
        <h2 className="text-2xl font-bold text-foreground mb-3">Getting started</h2>
        <p className="text-muted-fg text-sm">Up and running in under 2 minutes.</p>
      </motion.div>
      <motion.div {...stagger} className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div {...fadeUpChild} className={cn(panelVariants({ variant: "surface" }), "p-5")}>
          <h3 className="text-sm font-semibold text-foreground mb-1">Mock mode</h3>
          <p className="text-xs text-muted-fg mb-4">No CLI needed. Six simulated agents generate realistic events.</p>
          <div className={cn(panelVariants({ variant: "inset" }), "rounded-xl p-4 font-mono text-xs text-foreground/80 space-y-1")}>
            <div><span className="text-muted-fg/60">$</span> npm install</div>
            <div><span className="text-muted-fg/60">$</span> npm run dev:mock</div>
          </div>
        </motion.div>
        <motion.div {...fadeUpChild} className={cn(panelVariants({ variant: "surface" }), "p-5")}>
          <h3 className="text-sm font-semibold text-foreground mb-1">Real mode</h3>
          <p className="text-xs text-muted-fg mb-4">Requires <code className="text-muted-fg">claude</code> CLI installed and authenticated.</p>
          <div className={cn(panelVariants({ variant: "inset" }), "rounded-xl p-4 font-mono text-xs text-foreground/80 space-y-1")}>
            <div className="text-muted-fg/60"># Terminal 1: UI</div>
            <div><span className="text-muted-fg/60">$</span> cd apps/web && npm run dev</div>
            <div className="text-muted-fg/60 mt-2"># Terminal 2: Server</div>
            <div><span className="text-muted-fg/60">$</span> cd apps/server && npx tsx src/index.ts</div>
          </div>
        </motion.div>
      </motion.div>
      <motion.div {...fadeUp} className="text-center mt-10">
        <Link href="/office" className={cn(buttonVariants({ variant: "primary", size: "md" }), "h-10 px-6 text-sm")}>
          <Rocket size={14} /> Open the Dashboard
        </Link>
      </motion.div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border-base py-8">
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-xs text-muted-fg/60">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-blue-600/20 flex items-center justify-center">
            <Building2 size={10} className="text-blue-400" />
          </div>
          AgentFlow
        </div>
        <div className="flex items-center gap-4">
          <Link href="/office" className="hover:text-muted-fg transition-colors">Dashboard</Link>
          <a href="https://docs.anthropic.com/en/docs/claude-code" className="hover:text-muted-fg transition-colors" target="_blank" rel="noopener noreferrer">Claude Code Docs</a>
        </div>
      </div>
    </footer>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <Features />
      <Workflows />
      <Architecture />
      <WorksToday />
      <Limitations />
      <GettingStarted />
      <Footer />
    </div>
  );
}
