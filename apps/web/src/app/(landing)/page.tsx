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
} from "@heroicons/react/24/outline";
import { cn } from "../../lib/cn";
import { HeroSection } from "../../components/hero-section";
import { LandingFooter } from "../../components/landing-footer";

// ---------------------------------------------------------------------------
// Animation helpers
// ---------------------------------------------------------------------------

const blurIn = {
  initial: { opacity: 0, filter: "blur(4px)", y: 8 },
  whileInView: { opacity: 1, filter: "blur(0px)", y: 0 },
  viewport: { once: true, amount: 0.1 },
  transition: { duration: 0.8 },
};

const blurInSlow = {
  initial: { opacity: 0, filter: "blur(4px)", y: 8 },
  whileInView: { opacity: 1, filter: "blur(0px)", y: 0 },
  viewport: { once: true, amount: 0.1 },
  transition: { delay: 0.2, duration: 0.8 },
};

// Keep old names as aliases for sections that already use them
const fadeUp = blurIn;
const stagger = {
  initial: "hidden",
  whileInView: "visible",
  viewport: { once: true, amount: 0.1 },
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
          <h2 className="text-3xl font-bold tracking-wide text-balance md:text-4xl">
            Everything you need
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-4 text-sm">
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
                  <Link href={`/docs#${item.docId}`} className="text-xs text-gray-500 dark:text-gray-400 md:opacity-0 md:group-hover:opacity-100 transition-opacity hover:text-emerald-600 dark:hover:text-emerald-400">
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
      detail: "github.com/Sipoke123/ClauBoard",
    },
  ];

  return (
    <section id="open-source" className="max-w-6xl mx-auto px-6 py-20">
      <motion.div {...fadeUp} className="text-center mb-12">
        <h2 className="text-3xl font-bold tracking-wide text-balance md:text-4xl">Free &amp; Open Source</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-4 text-sm">No subscriptions. No limits. Self-host and own your data.</p>
      </motion.div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-start">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              {...blurIn}
              transition={{ duration: 0.8, delay: i * 0.1 }}
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
      </div>
      <motion.div {...fadeUp} className="text-center mt-10 flex items-center justify-center gap-3 flex-wrap">
        <a
          href="https://github.com/Sipoke123/ClauBoard"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:border-gray-300 dark:hover:border-white/20 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-all"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg> View on GitHub
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        {components.map((c, i) => (
          <motion.div key={c.name} {...blurIn} transition={{ duration: 0.8, delay: i * 0.1 }} className="group p-5 rounded-xl border border-gray-100/80 dark:border-white/10 bg-white dark:bg-white/[0.03] hover:shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:hover:shadow-[0_2px_12px_rgba(255,255,255,0.03)] hover:-translate-y-0.5 transition-all duration-300">
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
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {patterns.map((p, i) => (
          <motion.div key={p.label} {...blurIn} transition={{ duration: 0.8, delay: i * 0.08 }} className="p-4 rounded-xl border border-gray-100/80 dark:border-white/10 bg-white dark:bg-white/[0.03] text-center hover:shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:hover:shadow-[0_2px_12px_rgba(255,255,255,0.03)] transition-all duration-300">
            <p.icon className="w-4 h-4 text-emerald-500 mx-auto mb-2" />
            <div className="text-xs font-medium text-gray-900 dark:text-gray-100 mb-1">{p.label}</div>
            <div className="text-[11px] text-gray-500 dark:text-gray-400">{p.detail}</div>
          </motion.div>
        ))}
      </div>
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
      <motion.div {...fadeUp} className="max-w-2xl mx-auto rounded-xl border border-gray-200/80 dark:border-white/10 bg-white dark:bg-white/[0.02] overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_12px_rgba(255,255,255,0.02)]">
        <div className="flex items-center gap-2 px-4 py-3 bg-gray-50/80 dark:bg-white/[0.03] border-b border-gray-200/80 dark:border-white/10">
          <span className="w-3 h-3 rounded-full bg-red-500/80" />
          <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <span className="w-3 h-3 rounded-full bg-green-500/80" />
          <span className="ml-2 text-sm text-gray-400 dark:text-gray-500 font-mono">terminal</span>
        </div>
        <div className="p-6 font-mono text-sm break-all">
          <div className="space-y-4">
            <div>
              <span className="text-gray-400 dark:text-gray-500">&#35; Clone and install</span>
              <div className="flex items-start gap-2"><span className="text-emerald-500 select-none">$</span><span className="text-gray-800 dark:text-gray-200">git clone https://github.com/Sipoke123/ClauBoard.git</span></div>
              <div className="flex items-start gap-2"><span className="text-emerald-500 select-none">$</span><span className="text-gray-800 dark:text-gray-200">cd ClauBoard && npm install</span></div>
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
      </motion.div>
      <motion.div {...fadeUp} className="text-center mt-10">
        <Link href="/office" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium bg-card border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-surface hover:border-emerald-500/60 transition-all">
          <RocketLaunchIcon className="w-4 h-4" /> Try it Now
        </Link>
      </motion.div>
    </section>
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
      <LandingFooter />
    </div>
  );
}
