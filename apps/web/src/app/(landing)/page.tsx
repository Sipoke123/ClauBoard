"use client";

import React from "react";
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
  Send,
  Minus,
  Crown,
  Users,
} from "lucide-react";
import { cn } from "../../lib/cn";
import { buttonVariants, panelVariants } from "../../lib/variants";
import { HeroSection } from "../../components/hero-section";
import { ThemeToggle } from "../../components/ui/theme-toggle";

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
      title: "Visual Workspace",
      description: "Drag agents on a canvas, see who depends on whom. Connection lines update in real time as agents work, finish, or fail.",
    },
    {
      icon: Layers,
      title: "Agent Pipelines",
      description: "Chain agents together: analyst first, then strategist, then implementer. If one fails, the rest keep going with context.",
    },
    {
      icon: Play,
      title: "Talk to Running Agents",
      description: "Send follow-up instructions to agents while they work. Redirect, clarify, or course-correct without restarting.",
    },
    {
      icon: Activity,
      title: "See Everything Live",
      description: "Every tool call, file edit, and output appears instantly. Scroll through 50,000+ events without a hiccup.",
    },
    {
      icon: GitBranch,
      title: "Automatic Handoffs",
      description: "When one agent finishes, the next receives a summary of what was done — files created, tools used, key output.",
    },
    {
      icon: Database,
      title: "Built for Scale",
      description: "Start with simple file storage, switch to SQLite for production. Archive old events, auto-compact, zero downtime.",
    },
  ];

  return (
    <section id="features" className="max-w-6xl mx-auto px-6 py-20">
      <motion.div {...fadeUp} className="text-center mb-12">
        <h2 className="text-2xl font-bold text-foreground mb-3">Everything you need</h2>
        <p className="text-muted-fg text-sm">From launching a single agent to orchestrating a team — one tool does it all.</p>
      </motion.div>
      <motion.div {...stagger} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((f) => (
          <motion.div
            key={f.title}
            {...fadeUpChild}
            className={cn(panelVariants({ variant: "elevated" }), "p-5 hover:border-foreground/[0.12] transition-colors")}
          >
            <div className="w-9 h-9 rounded-xl bg-amber-600/[0.08] border border-amber-500/15 flex items-center justify-center mb-4">
              <f.icon size={16} className="text-amber-600 dark:text-amber-400" />
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
      title: "Quick Start",
      steps: [
        "Open the Dashboard and click Launch Run",
        "Choose a preset or write your own prompt",
        "Watch the agent appear on the canvas and start working",
        "Click it to see output, tools, files in the detail panel",
      ],
    },
    {
      title: "Team of Agents",
      steps: [
        "Go to Sessions and create a new group",
        "Add multiple agents with different prompts",
        "Launch — they all work in parallel on your project",
        "Track progress of each agent from one screen",
      ],
    },
    {
      title: "Build a Pipeline",
      steps: [
        "Set dependencies: analyst → strategist → implementer",
        "The system validates the chain before launching",
        "Each stage waits for the previous to finish",
        "If one fails, the next still runs with a context warning",
      ],
    },
  ];

  return (
    <section className="max-w-6xl mx-auto px-6 py-20">
      <motion.div {...fadeUp} className="text-center mb-12">
        <h2 className="text-2xl font-bold text-foreground mb-3">How it works</h2>
        <p className="text-muted-fg text-sm">Three ways to use AgentFlow, from simple to orchestrated.</p>
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

function Pricing() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Get started with the basics",
      icon: Rocket,
      featured: false,
      features: [
        { text: "Up to 3 agents", included: true },
        { text: "1 pipeline preset", included: true },
        { text: "JSONL storage", included: true },
        { text: "Canvas & Grid views", included: true },
        { text: "Community support", included: true },
        { text: "Sessions", included: false },
        { text: "Notifications", included: false },
        { text: "SQLite storage", included: false },
        { text: "Interactive messaging", included: false },
      ],
      cta: "Get Started",
      ctaHref: "/office",
    },
    {
      name: "Pro",
      price: "$29",
      period: "/month",
      description: "For power users and small teams",
      icon: Crown,
      featured: true,
      features: [
        { text: "Up to 10 agents", included: true },
        { text: "Unlimited pipelines", included: true },
        { text: "SQLite storage", included: true },
        { text: "Sessions & orchestration", included: true },
        { text: "Notifications & alerts", included: true },
        { text: "Interactive messaging", included: true },
        { text: "Context sharing", included: true },
        { text: "Event archival", included: true },
        { text: "Email support", included: true },
      ],
      cta: "Start Free Trial",
      ctaHref: "/office",
    },
    {
      name: "Team",
      price: "$99",
      period: "/month",
      description: "For teams running agents at scale",
      icon: Users,
      featured: false,
      features: [
        { text: "Unlimited agents", included: true },
        { text: "Unlimited pipelines", included: true },
        { text: "SQLite + Cloud backup", included: true },
        { text: "All Pro features", included: true },
        { text: "Multi-user access", included: true },
        { text: "Role-based permissions", included: true },
        { text: "API access", included: true },
        { text: "Custom alert rules", included: true },
        { text: "Priority support", included: true },
      ],
      cta: "Contact Sales",
      ctaHref: "#",
    },
  ];

  return (
    <section id="pricing" className="max-w-6xl mx-auto px-6 py-20">
      <motion.div {...fadeUp} className="text-center mb-12">
        <h2 className="text-2xl font-bold text-foreground mb-3">Simple, transparent pricing</h2>
        <p className="text-muted-fg text-sm">Start free. Upgrade when you need more agents or features.</p>
      </motion.div>
      <motion.div {...stagger} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
        {plans.map((plan) => {
          const Icon = plan.icon;
          return (
            <motion.div
              key={plan.name}
              {...fadeUpChild}
              className={cn(
                panelVariants({ variant: plan.featured ? "elevated" : "surface" }),
                "p-6 relative",
                plan.featured && "ring-1 ring-amber-500/20",
              )}
            >
              {plan.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 rounded-full bg-amber-600 text-white text-[10px] font-semibold uppercase tracking-wider">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2.5 mb-4">
                <div className={cn(
                  "w-9 h-9 rounded-xl flex items-center justify-center border",
                  plan.featured
                    ? "bg-amber-600/[0.08] border-amber-500/15 text-amber-600 dark:text-amber-400"
                    : "bg-foreground/[0.04] border-border-base text-muted-fg",
                )}>
                  <Icon size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{plan.name}</h3>
                  <p className="text-[10px] text-muted-fg">{plan.description}</p>
                </div>
              </div>

              <div className="mb-6">
                <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                <span className="text-sm text-muted-fg ml-1">{plan.period}</span>
              </div>

              <ul className="space-y-2.5 mb-6">
                {plan.features.map((f) => (
                  <li key={f.text} className="flex items-center gap-2.5 text-xs">
                    {f.included ? (
                      <Check size={13} className="text-emerald-400 shrink-0" />
                    ) : (
                      <Minus size={13} className="text-muted-fg/30 shrink-0" />
                    )}
                    <span className={f.included ? "text-foreground/80" : "text-muted-fg/40"}>{f.text}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.ctaHref}
                className={cn(
                  "block w-full text-center py-2.5 rounded-lg text-sm font-medium transition-all",
                  plan.featured
                    ? "border border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/60"
                    : "border border-border-base text-muted-fg hover:text-foreground hover:border-foreground/20 hover:bg-foreground/[0.04]",
                )}
              >
                {plan.cta}
              </Link>
            </motion.div>
          );
        })}
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
            <p.icon size={16} className="text-amber-600/60 dark:text-amber-400/60 mx-auto mb-2" />
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
    "Launch and manage real Claude Code agents from the browser",
    "Build multi-agent pipelines with automatic failover",
    "Send messages to running agents — redirect or clarify mid-task",
    "Agents pass context to each other: files, tools, output summaries",
    "Live event feed with virtual scrolling — handles 50k+ events smoothly",
    "Drag-and-drop canvas with live connection status between agents",
    "Notification alerts when agents fail, get blocked, or run too long",
    "SQLite or JSONL storage — switch with one flag, no migration needed",
    "Light and dark themes with full keyboard accessibility",
    "Try instantly with 6 mock agents — no Claude CLI required",
    "Export all agent data as JSON for analysis",
  ];

  return (
    <section className="max-w-6xl mx-auto px-6 py-20">
      <motion.div {...fadeUp} className="text-center mb-12">
        <h2 className="text-2xl font-bold text-foreground mb-3">Shipped and working</h2>
        <p className="text-muted-fg text-sm">Everything below is live in the current build.</p>
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
    { text: "Local only for now", detail: "Runs on localhost — auth and multi-user coming soon" },
    { text: "Needs trusted environment", detail: "Uses --dangerously-skip-permissions for non-interactive agent runs" },
    { text: "File detection is approximate", detail: "Catches Edit/Write tools but may miss files changed via Bash" },
  ];

  return (
    <section className="max-w-6xl mx-auto px-6 py-20">
      <motion.div {...fadeUp} className="text-center mb-12">
        <h2 className="text-2xl font-bold text-foreground mb-3">Known limitations</h2>
        <p className="text-muted-fg text-sm">We are working on these. Transparency matters.</p>
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
        <h2 className="text-2xl font-bold text-foreground mb-3">Get started in 2 minutes</h2>
        <p className="text-muted-fg text-sm">Clone, install, run. That is it.</p>
      </motion.div>
      <motion.div {...stagger} className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div {...fadeUpChild} className={cn(panelVariants({ variant: "surface" }), "p-5")}>
          <h3 className="text-sm font-semibold text-foreground mb-1">Try it now</h3>
          <p className="text-xs text-muted-fg mb-4">No Claude CLI needed. Six demo agents show you everything.</p>
          <div className={cn(panelVariants({ variant: "inset" }), "rounded-xl p-4 font-mono text-xs text-foreground/80 space-y-1")}>
            <div><span className="text-muted-fg/60">$</span> npm install</div>
            <div><span className="text-muted-fg/60">$</span> npm run dev:mock</div>
          </div>
        </motion.div>
        <motion.div {...fadeUpChild} className={cn(panelVariants({ variant: "surface" }), "p-5")}>
          <h3 className="text-sm font-semibold text-foreground mb-1">With real agents</h3>
          <p className="text-xs text-muted-fg mb-4">Connect your <code className="text-muted-fg">claude</code> CLI and run real tasks.</p>
          <div className={cn(panelVariants({ variant: "inset" }), "rounded-xl p-4 font-mono text-xs text-foreground/80 space-y-1")}>
            <div className="text-muted-fg/60"># Terminal 1: UI</div>
            <div><span className="text-muted-fg/60">$</span> cd apps/web && npm run dev</div>
            <div className="text-muted-fg/60 mt-2"># Terminal 2: Server</div>
            <div><span className="text-muted-fg/60">$</span> cd apps/server && npx tsx src/index.ts</div>
          </div>
        </motion.div>
      </motion.div>
      <motion.div {...fadeUp} className="text-center mt-10">
        <Link href="/office" className={cn(buttonVariants({ variant: "outline", size: "md" }), "h-10 px-6 text-sm border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/60")}>
          <Rocket size={14} /> Open the Dashboard
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
                className="w-full h-10 rounded-lg border border-border-base bg-surface-inset px-3 pr-12 text-sm text-foreground placeholder:text-muted-fg/50 focus:outline-none focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/15 transition-colors"
              />
              <button
                type="submit"
                className="absolute right-1 top-1 h-8 w-8 rounded-full bg-transparent border border-amber-500/40 text-amber-600 dark:text-amber-400 flex items-center justify-center transition-all hover:bg-amber-500/10 hover:border-amber-500/60 hover:scale-105"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
            <div className="absolute -right-4 top-0 h-24 w-24 rounded-full bg-amber-600/5 blur-2xl" />
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground uppercase tracking-wider">Quick Links</h3>
            <nav className="space-y-2.5 text-sm">
              <Link href="/office" className="block text-muted-fg hover:text-foreground transition-colors">Dashboard</Link>
              <Link href="/sessions" className="block text-muted-fg hover:text-foreground transition-colors">Sessions</Link>
              <Link href="/runs" className="block text-muted-fg hover:text-foreground transition-colors">Runs</Link>
              <Link href="/tasks" className="block text-muted-fg hover:text-foreground transition-colors">Tasks</Link>
              <Link href="/timeline" className="block text-muted-fg hover:text-foreground transition-colors">Timeline</Link>
            </nav>
          </div>

          {/* Resources */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground uppercase tracking-wider">Resources</h3>
            <nav className="space-y-2.5 text-sm">
              <a href="https://docs.anthropic.com/en/docs/claude-code" target="_blank" rel="noopener noreferrer" className="block text-muted-fg hover:text-foreground transition-colors">Claude Code Docs</a>
              <a href="https://github.com/Sipoke123/AgentFlow" target="_blank" rel="noopener noreferrer" className="block text-muted-fg hover:text-foreground transition-colors">GitHub Repository</a>
              <Link href="#features" className="block text-muted-fg hover:text-foreground transition-colors">Features</Link>
              <Link href="#architecture" className="block text-muted-fg hover:text-foreground transition-colors">Architecture</Link>
              <Link href="#getting-started" className="block text-muted-fg hover:text-foreground transition-colors">Get Started</Link>
            </nav>
          </div>

          {/* Follow & Social */}
          <div className="relative">
            <h3 className="mb-4 text-sm font-semibold text-foreground uppercase tracking-wider">Connect</h3>
            <div className="mb-6 flex space-x-3">
              {[
                { icon: Globe, label: "Website", href: "#" },
                { icon: Code2, label: "GitHub", href: "https://github.com/Sipoke123/AgentFlow" },
                { icon: Zap, label: "API", href: "https://docs.anthropic.com/en/docs/claude-code" },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={social.label}
                  className="w-9 h-9 rounded-full border border-border-base bg-surface flex items-center justify-center text-muted-fg hover:text-foreground hover:border-foreground/20 hover:bg-foreground/5 transition-all"
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
            <ThemeToggle />
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border-base pt-8 text-center md:flex-row">
          <span className="text-sm text-muted-fg/50">&copy; {new Date().getFullYear()} AgentFlow. All rights reserved.</span>
          <nav className="flex gap-4 text-sm text-muted-fg/50">
            <Link href="#" className="hover:text-muted-fg transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-muted-fg transition-colors">Terms of Service</Link>
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
      <HeroSection />
      <Features />
      <Workflows />
      <Pricing />
      <Architecture />
      <WorksToday />
      <Limitations />
      <GettingStarted />
      <Footer />
    </div>
  );
}
