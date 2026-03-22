"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  BuildingOffice2Icon,
  Square3Stack3DIcon,
  PlayIcon,
  ChartBarIcon,
  RocketLaunchIcon,
  CheckIcon,
  ArrowsRightLeftIcon,
  CircleStackIcon,
  WifiIcon,
  ServerIcon,
  GlobeAltIcon,
  CodeBracketIcon,
  CubeIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/24/outline";
import { cn } from "../../lib/cn";
import { HeroSection } from "../../components/hero-section";
import { ThemeToggle } from "../../components/ui/theme-toggle";

// ---------------------------------------------------------------------------
// Animation helpers
// ---------------------------------------------------------------------------

const blurIn = {
  initial: { opacity: 0, filter: "blur(4px)", y: 8 },
  whileInView: { opacity: 1, filter: "blur(0px)", y: 0 },
  viewport: { once: true, margin: "-60px" as any },
  transition: { duration: 0.8 },
};

const blurInSlow = {
  initial: { opacity: 0, filter: "blur(4px)", y: 8 },
  whileInView: { opacity: 1, filter: "blur(0px)", y: 0 },
  viewport: { once: true, margin: "-60px" as any },
  transition: { delay: 0.2, duration: 0.8 },
};

// Keep old names as aliases for sections that already use them
const fadeUp = blurIn;
const stagger = {
  initial: "hidden",
  whileInView: "visible",
  viewport: { once: true, margin: "-60px" as any },
  variants: {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
  },
};
const fadeUpChild = {
  variants: {
    hidden: { opacity: 0, filter: "blur(4px)", y: 8 },
    visible: { opacity: 1, filter: "blur(0px)", y: 0, transition: { duration: 0.6 } },
  },
};

// ---------------------------------------------------------------------------
// Sections
// ---------------------------------------------------------------------------


function Features() {
  const features = [
    {
      icon: <BuildingOffice2Icon className="w-4 h-4 text-emerald-500" />,
      title: "Visual Workspace",
      description: "Drag agents on a canvas, see who depends on whom. Connection lines update in real time as agents work, finish, or fail.",
      status: "Core",
      tags: ["Canvas", "Drag & Drop"],
      colSpan: 2,
      hasPersistentHover: true,
      docId: "visual-workspace",
    },
    {
      icon: <Square3Stack3DIcon className="w-4 h-4 text-emerald-500" />,
      title: "Agent Pipelines",
      description: "Chain agents together: analyst first, then strategist, then implementer. If one fails, the rest keep going.",
      status: "New",
      tags: ["Sessions", "Dependencies"],
      docId: "agent-pipelines",
    },
    {
      icon: <ChartBarIcon className="w-4 h-4 text-violet-500" />,
      title: "See Everything Live",
      description: "Every tool call, file edit, and output appears instantly. Scroll through 50,000+ events without a hiccup.",
      status: "Live",
      tags: ["Events", "Virtual Scroll"],
      colSpan: 2,
      docId: "live-events",
    },
    {
      icon: <PlayIcon className="w-4 h-4 text-sky-500" />,
      title: "Talk to Running Agents",
      description: "Send follow-up instructions while agents work. Redirect or course-correct without restarting.",
      status: "Interactive",
      tags: ["Stdin", "Real-time"],
      docId: "interactive-agents",
    },
    {
      icon: <ArrowsRightLeftIcon className="w-4 h-4 text-emerald-500" />,
      title: "Automatic Handoffs",
      description: "When one agent finishes, the next receives a summary — files created, tools used, key output.",
      status: "Smart",
      tags: ["Context", "Failover"],
      docId: "context-sharing",
    },
    {
      icon: <CircleStackIcon className="w-4 h-4 text-rose-500" />,
      title: "Deploy Anywhere",
      description: "Docker-ready with one command. Dual storage, event archival, plugin system. Extensible by design.",
      status: "Docker",
      tags: ["SQLite", "Plugins"],
      colSpan: 2,
      hasPersistentHover: false,
      docId: "deployment",
    },
  ];

  return (
    <section id="features" className="py-16 md:py-32">
      <div className="mx-auto w-full max-w-6xl space-y-8 px-6">
        <motion.div {...blurIn} className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-wide text-balance md:text-4xl lg:text-5xl xl:font-extrabold">
            Everything you need
          </h2>
          <p className="text-muted-fg mt-4 text-sm tracking-wide text-balance md:text-base">
            From launching a single agent to orchestrating a team — one tool does it all.
          </p>
        </motion.div>

        <motion.div {...blurInSlow} className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-6xl mx-auto">

          {features.map((item, index) => (
            <div
              key={index}
              className={cn(
                "group relative p-4 rounded-xl overflow-hidden transition-all duration-300",
                "border border-gray-100/80 dark:border-white/10 bg-white dark:bg-white/[0.03]",
                "hover:shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:hover:shadow-[0_2px_12px_rgba(255,255,255,0.03)]",
                "hover:-translate-y-0.5 will-change-transform",
                item.colSpan === 2 ? "md:col-span-2" : "col-span-1",
                item.hasPersistentHover && "shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:shadow-[0_2px_12px_rgba(255,255,255,0.03)] -translate-y-0.5",
              )}
            >
              <div className={cn(
                "absolute inset-0 transition-opacity duration-300",
                item.hasPersistentHover ? "opacity-100" : "opacity-0 group-hover:opacity-100",
              )}>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[length:4px_4px]" />
              </div>

              <div className="relative flex flex-col space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-black/5 dark:bg-white/10 group-hover:bg-gradient-to-br transition-all duration-300">
                    {item.icon}
                  </div>
                  <span className={cn(
                    "text-xs font-medium px-2 py-1 rounded-lg backdrop-blur-sm",
                    "bg-black/5 dark:bg-white/10 text-gray-600 dark:text-gray-300",
                    "transition-colors duration-300 group-hover:bg-black/10 dark:group-hover:bg-white/20",
                  )}>
                    {item.status || "Active"}
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 tracking-tight text-[15px]">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-snug font-[425]">
                    {item.description}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                    {item.tags?.map((tag, i) => (
                      <span key={i} className="px-2 py-1 rounded-md bg-black/5 dark:bg-white/10 backdrop-blur-sm transition-all duration-200 hover:bg-black/10 dark:hover:bg-white/20">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <Link href={`/docs#${item.docId}`} className="text-xs text-gray-500 dark:text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-emerald-600 dark:hover:text-emerald-400">
                    Learn more →
                  </Link>
                </div>
              </div>

              <div className={cn(
                "absolute inset-0 -z-10 rounded-xl p-px bg-gradient-to-br from-transparent via-gray-100/50 to-transparent dark:via-white/10",
                item.hasPersistentHover ? "opacity-100" : "opacity-0 group-hover:opacity-100",
                "transition-opacity duration-300",
              )} />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function OpenSource() {
  const cards = [
    {
      icon: ServerIcon,
      title: "Self-Hosted",
      description: "Run on your own machine. Full control over your data and agents. No external services required.",
      detail: "npm run dev",
    },
    {
      icon: CheckIcon,
      title: "No Limits",
      description: "Unlimited agents, sessions, and pipelines. No artificial restrictions — use every feature from day one.",
      detail: "Everything included",
    },
    {
      icon: CodeBracketIcon,
      title: "Community",
      description: "AGPL-3.0 licensed. Fork it, extend it, contribute back. Built in the open for the developer community.",
      detail: "github.com/Sipoke123/AgentFlow",
    },
  ];

  return (
    <section id="open-source" className="max-w-6xl mx-auto px-6 py-20">
      <motion.div {...fadeUp} className="text-center mb-12">
        <h2 className="text-3xl font-bold tracking-wide text-balance md:text-4xl">Free &amp; Open Source</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-4 text-sm">No subscriptions. No limits. Self-host and own your data.</p>
      </motion.div>
      <motion.div {...stagger} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-start">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              {...fadeUpChild}
              className="group relative p-6 rounded-xl border border-gray-100/80 dark:border-white/10 bg-white dark:bg-white/[0.03] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:hover:shadow-[0_2px_12px_rgba(255,255,255,0.03)]"
            >
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-500/10 text-emerald-500">
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100 tracking-tight text-[15px]">{card.title}</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-snug mb-6">{card.description}</p>
              <div className="font-mono text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 border border-emerald-500/15 rounded-lg px-3 py-2">
                {card.detail}
              </div>
            </motion.div>
          );
        })}
      </motion.div>
      <motion.div {...fadeUp} className="text-center mt-10 flex items-center justify-center gap-3 flex-wrap">
        <a
          href="https://github.com/Sipoke123/AgentFlow"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:border-gray-300 dark:hover:border-white/20 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-all"
        >
          <CodeBracketIcon className="w-4 h-4" /> View on GitHub
        </a>
      </motion.div>
    </section>
  );
}

function Architecture() {
  const components = [
    {
      icon: GlobeAltIcon,
      name: "apps/web",
      tech: "Next.js 15 + React 19",
      description: "Operator UI with spatial office layout, session management, run history, task board, and event timeline.",
    },
    {
      icon: ServerIcon,
      name: "apps/server",
      tech: "Express + WebSocket",
      description: "Orchestration server with agent registry, run lifecycle, event processor, JSONL persistence, and adapter layer.",
    },
    {
      icon: CubeIcon,
      name: "packages/shared",
      tech: "TypeScript",
      description: "15 event types, API contracts, WebSocket messages, and dependency graph utilities shared between both apps.",
    },
  ];

  const patterns = [
    { icon: CircleStackIcon, label: "Event-sourced", detail: "Append-only event stream as source of truth" },
    { icon: CodeBracketIcon, label: "Adapter pattern", detail: "AgentAdapter interface with start(emit) and stop()" },
    { icon: WifiIcon, label: "Real-time", detail: "WebSocket pushes events to UI; snapshot on connect" },
    { icon: ArrowsRightLeftIcon, label: "Dependency graph", detail: "Validated execution order for staged sessions" },
  ];

  return (
    <section id="architecture" className="max-w-6xl mx-auto px-6 py-20">
      <motion.div {...fadeUp} className="text-center mb-12">
        <h2 className="text-3xl font-bold tracking-wide text-balance md:text-4xl">Architecture</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-4 text-sm">Turborepo monorepo with shared typed contracts.</p>
      </motion.div>

      <motion.div {...stagger} className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        {components.map((c) => (
          <motion.div key={c.name} {...fadeUpChild} className="group p-5 rounded-xl border border-gray-100/80 dark:border-white/10 bg-white dark:bg-white/[0.03] hover:shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:hover:shadow-[0_2px_12px_rgba(255,255,255,0.03)] hover:-translate-y-0.5 transition-all duration-300">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-black/5 dark:bg-white/10">
                <c.icon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              </div>
              <code className="font-medium text-gray-900 dark:text-gray-100 tracking-tight text-[15px]">{c.name}</code>
            </div>
            <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/10 text-gray-500 dark:text-gray-400">{c.tech}</span>
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-300 leading-snug">{c.description}</p>
          </motion.div>
        ))}
      </motion.div>

      <motion.div {...stagger} className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {patterns.map((p) => (
          <motion.div key={p.label} {...fadeUpChild} className="p-4 rounded-xl border border-gray-100/80 dark:border-white/10 bg-white dark:bg-white/[0.03] text-center hover:shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:hover:shadow-[0_2px_12px_rgba(255,255,255,0.03)] transition-all duration-300">
            <p.icon className="w-4 h-4 text-emerald-500 mx-auto mb-2" />
            <div className="text-xs font-medium text-gray-900 dark:text-gray-100 mb-1">{p.label}</div>
            <div className="text-[11px] text-gray-500 dark:text-gray-400">{p.detail}</div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}


function GettingStarted() {
  return (
    <section id="getting-started" className="max-w-6xl mx-auto px-6 py-20">
      <motion.div {...fadeUp} className="text-center mb-12">
        <h2 className="text-3xl font-bold tracking-wide text-balance md:text-4xl">Get started in 2 minutes</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-4 text-sm">Clone, install, run. That is it.</p>
      </motion.div>
      <motion.div {...stagger} className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-3">
        <motion.div {...fadeUpChild} className="group p-5 rounded-xl border border-gray-100/80 dark:border-white/10 bg-white dark:bg-white/[0.03] hover:shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:hover:shadow-[0_2px_12px_rgba(255,255,255,0.03)] hover:-translate-y-0.5 transition-all duration-300">
          <h3 className="font-medium text-gray-900 dark:text-gray-100 tracking-tight text-[15px] mb-1">Quick Start</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">No Claude CLI needed. Six demo agents show you everything.</p>
          <div className="rounded-lg p-4 bg-black/[0.03] dark:bg-white/[0.03] font-mono text-sm text-gray-700 dark:text-gray-300 space-y-1">
            <div><span className="text-gray-400 dark:text-gray-500">$</span> npm install</div>
            <div><span className="text-gray-400 dark:text-gray-500">$</span> npm run dev:mock</div>
          </div>
        </motion.div>
        <motion.div {...fadeUpChild} className="group p-5 rounded-xl border border-gray-100/80 dark:border-white/10 bg-white dark:bg-white/[0.03] hover:shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:hover:shadow-[0_2px_12px_rgba(255,255,255,0.03)] hover:-translate-y-0.5 transition-all duration-300">
          <h3 className="font-medium text-gray-900 dark:text-gray-100 tracking-tight text-[15px] mb-1">With real agents</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Connect your <code className="text-gray-600 dark:text-gray-300">claude</code> CLI and run real tasks.</p>
          <div className="rounded-lg p-4 bg-black/[0.03] dark:bg-white/[0.03] font-mono text-sm text-gray-700 dark:text-gray-300 space-y-1">
            <div><span className="text-gray-400 dark:text-gray-500">$</span> npm run dev</div>
          </div>
        </motion.div>
        <motion.div {...fadeUpChild} className="group p-5 rounded-xl border border-gray-100/80 dark:border-white/10 bg-white dark:bg-white/[0.03] hover:shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:hover:shadow-[0_2px_12px_rgba(255,255,255,0.03)] hover:-translate-y-0.5 transition-all duration-300">
          <h3 className="font-medium text-gray-900 dark:text-gray-100 tracking-tight text-[15px] mb-1">Docker</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">One command to build and deploy. Production-ready.</p>
          <div className="rounded-lg p-4 bg-black/[0.03] dark:bg-white/[0.03] font-mono text-sm text-gray-700 dark:text-gray-300 space-y-1">
            <div><span className="text-gray-400 dark:text-gray-500">$</span> docker compose up</div>
          </div>
        </motion.div>
      </motion.div>
      <motion.div {...fadeUp} className="text-center mt-10">
        <Link href="/office" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/60 transition-all">
          <RocketLaunchIcon className="w-4 h-4" /> Try it Now
        </Link>
      </motion.div>
    </section>
  );
}

function Footer() {
  const [email, setEmail] = React.useState("");

  return (
    <footer className="relative border-t border-border-base bg-background text-foreground transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-6 py-12 md:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Newsletter */}
          <div className="relative">
            <h2 className="mb-4 text-2xl font-bold tracking-tight text-foreground">Stay in the loop</h2>
            <p className="mb-6 text-sm text-muted-fg">
              Get notified about new features, agent patterns, and product updates.
            </p>
            <form className="relative" onSubmit={(e) => { e.preventDefault(); setEmail(""); }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full h-10 rounded-lg border border-border-base bg-surface-inset px-3 pr-12 text-sm text-foreground placeholder:text-muted-fg/50 focus:outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/15 transition-colors"
              />
              <button
                type="submit"
                className="absolute right-1 top-1 h-8 w-8 rounded-full bg-transparent border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center transition-all hover:bg-emerald-500/10 hover:border-emerald-500/60 hover:scale-105"
              >
                <PaperAirplaneIcon className="h-3.5 w-3.5" />
              </button>
            </form>
            <div className="absolute -right-4 top-0 h-24 w-24 rounded-full bg-emerald-600/5 blur-2xl" />
          </div>

          {/* Product */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground uppercase tracking-wider">Product</h3>
            <nav className="space-y-2.5 text-sm">
              <Link href="/#features" className="block text-muted-fg hover:text-foreground transition-colors">Features</Link>
              <Link href="/#architecture" className="block text-muted-fg hover:text-foreground transition-colors">Architecture</Link>
              <Link href="/#getting-started" className="block text-muted-fg hover:text-foreground transition-colors">Get Started</Link>
              <Link href="/docs" className="block text-muted-fg hover:text-foreground transition-colors">Documentation</Link>
            </nav>
          </div>

          {/* Resources */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground uppercase tracking-wider">Resources</h3>
            <nav className="space-y-2.5 text-sm">
              <a href="https://github.com/Sipoke123/AgentFlow" target="_blank" rel="noopener noreferrer" className="block text-muted-fg hover:text-foreground transition-colors">GitHub Repository</a>
              <a href="https://github.com/Sipoke123/AgentFlow/issues" target="_blank" rel="noopener noreferrer" className="block text-muted-fg hover:text-foreground transition-colors">Report Issues</a>
              <a href="https://docs.anthropic.com/en/docs/claude-code" target="_blank" rel="noopener noreferrer" className="block text-muted-fg hover:text-foreground transition-colors">Claude Code Docs</a>
              <a href="https://github.com/Sipoke123/AgentFlow/blob/main/LICENSE" target="_blank" rel="noopener noreferrer" className="block text-muted-fg hover:text-foreground transition-colors">AGPL-3.0 License</a>
            </nav>
          </div>

          {/* Connect */}
          <div className="relative">
            <h3 className="mb-4 text-sm font-semibold text-foreground uppercase tracking-wider">Connect</h3>
            <div className="mb-6 flex space-x-3">
              <a href="https://github.com/Sipoke123/AgentFlow" target="_blank" rel="noopener noreferrer" title="GitHub" className="w-9 h-9 rounded-full border border-border-base bg-surface flex items-center justify-center text-muted-fg hover:text-foreground hover:border-foreground/20 hover:bg-foreground/5 transition-all">
                <CodeBracketIcon className="h-4 w-4" />
              </a>
            </div>
            <ThemeToggle />
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border-base pt-8 text-center md:flex-row">
          <span className="text-sm text-muted-fg/50">&copy; 2026 AgentFlow. Free &amp; Open Source.</span>
          <nav className="flex gap-4 text-sm text-muted-fg/50">
            <a href="https://github.com/Sipoke123/AgentFlow" target="_blank" rel="noopener noreferrer" className="hover:text-muted-fg transition-colors">GitHub</a>
            <span>AGPL-3.0</span>
          </nav>
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
      <div className="relative">
        <HeroSection />
        <div
          className="absolute inset-0 -z-10 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, var(--grid-dot) 1px, transparent 1px)`,
            backgroundSize: "20px 20px",
            maskImage: "linear-gradient(to bottom, black 60%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, black 60%, transparent 100%)",
          }}
        />
      </div>
      <Features />
      <Architecture />
      <OpenSource />
      <GettingStarted />
      <Footer />
    </div>
  );
}
