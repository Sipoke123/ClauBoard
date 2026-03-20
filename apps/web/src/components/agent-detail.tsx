"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { StopCircle, Wrench, FileCode, Zap, Terminal, CheckCircle, XCircle, Clock, AlertTriangle, Plus, Minus } from "lucide-react";
import type { Agent, AgentEvent, Run, Task } from "@repo/shared";
import { cn } from "../lib/cn";
import { statusDotVariants, statusPillVariants, buttonVariants, panelVariants, tabVariants, statusLabels, getEventColor } from "../lib/variants";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ToolCallRow({ invoked, result }: { invoked: AgentEvent; result?: AgentEvent }) {
  const inv = invoked as any;
  const res = result as any;
  const succeeded = result?.type === "tool.result";
  const failed = result?.type === "tool.error";

  return (
    <div className="border-b border-border-subtle py-2.5 px-3 text-xs font-mono">
      <div className="flex items-center gap-2">
        <Wrench size={10} className="text-orange-400/70 shrink-0" />
        <span className="text-orange-400 font-semibold">{inv.payload.tool}</span>
        <span className="text-muted-fg">{new Date(invoked.ts).toLocaleTimeString()}</span>
        {succeeded && <span className="text-emerald-400 text-[10px]">{res.payload.durationMs}ms</span>}
        {failed && <span className={statusPillVariants({ status: "failed" })}>ERROR</span>}
        {!result && <span className={cn(statusPillVariants({ status: "running" }), "animate-pulse")}>running</span>}
      </div>
      <div className="text-muted-fg mt-1 truncate pl-5">{inv.payload.input}</div>
      {res?.payload?.output && <div className="text-muted-fg mt-1 truncate pl-5">{res.payload.output}</div>}
      {res?.payload?.error && <div className="text-red-400 mt-1 truncate pl-5">{res.payload.error}</div>}
    </div>
  );
}

function TextOutputBlock({ event }: { event: AgentEvent }) {
  const p = (event as any).payload;
  const isStderr = p.stream === "stderr";
  return (
    <div className={cn(
      "py-2 px-3 text-xs whitespace-pre-wrap font-mono leading-relaxed",
      isStderr ? "text-red-300/80 bg-red-950/20" : "text-foreground"
    )}>
      {p.text}
    </div>
  );
}

function FileChangeRow({ event }: { event: AgentEvent }) {
  const p = (event as any).payload;
  const icons: Record<string, React.ReactNode> = {
    create: <Plus size={10} className="text-emerald-400" />,
    edit: <Minus size={10} className="text-amber-400" />,
    delete: <XCircle size={10} className="text-red-400" />,
  };
  return (
    <div className="flex items-center gap-2 py-1.5 px-3 text-xs font-mono border-b border-border-subtle">
      {icons[p.action] ?? null}
      <span className="text-cyan-400 truncate">{p.path}</span>
    </div>
  );
}

function RawEventRow({ event }: { event: AgentEvent }) {
  const color = getEventColor(event.type);
  return (
    <div className="flex gap-3 text-xs py-1.5 px-3 font-mono border-b border-border-subtle hover:bg-foreground/[0.02]">
      <span className="text-muted-fg shrink-0">{new Date(event.ts).toLocaleTimeString()}</span>
      <span className={cn("shrink-0", color)}>{event.type}</span>
      <span className="text-muted-fg truncate">{JSON.stringify((event as any).payload).slice(0, 100)}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

type Tab = "events" | "output" | "tools" | "files";

export function AgentDetail({
  agent, runs, tasks, events,
}: {
  agent: Agent; runs: Run[]; tasks: Task[]; events: AgentEvent[];
}) {
  const [activeTab, setActiveTab] = useState<Tab>("events");
  const [stopping, setStopping] = useState(false);

  const agentRuns = runs.filter((r) => r.agentId === agent.id);
  const agentTasks = tasks.filter((t) => t.agentId === agent.id);
  const agentEvents = events.filter((e) => e.agentId === agent.id);

  const currentRun = agentRuns.find((r) => r.status === "running");
  const lastRun = agentRuns[agentRuns.length - 1];
  const isPaused = agent.status === "idle" && lastRun?.status === "stopped";
  const displayStatus = isPaused ? "paused" : agent.status;

  const textEvents = agentEvents.filter((e) => e.type === "terminal.output");
  const toolInvoked = agentEvents.filter((e) => e.type === "tool.invoked");
  const toolResults = agentEvents.filter((e) => e.type === "tool.result" || e.type === "tool.error");
  const fileEvents = agentEvents.filter((e) => e.type === "file.changed");

  const toolPairs: { invoked: AgentEvent; result?: AgentEvent }[] = [];
  const resultQueue = [...toolResults];
  for (const inv of toolInvoked) {
    const resIdx = resultQueue.findIndex((r) => (r as any).payload.tool === (inv as any).payload.tool);
    const result = resIdx >= 0 ? resultQueue.splice(resIdx, 1)[0] : undefined;
    toolPairs.push({ invoked: inv, result });
  }

  // Header glow by status
  const headerGlow: Record<string, string> = {
    working: "border-emerald-500/30 bg-emerald-950/20",
    blocked: "border-amber-500/30 bg-amber-950/20",
    error: "border-red-500/30 bg-red-950/20",
    idle: "border-border-base bg-surface/60",
    offline: "border-border-subtle bg-surface/40",
    paused: "border-amber-500/20 bg-amber-950/10",
  };

  const tabs: { id: Tab; label: string; count: number; icon: React.ReactNode }[] = [
    { id: "events", label: "Events", count: agentEvents.length, icon: <Zap size={11} /> },
    { id: "output", label: "Output", count: textEvents.length, icon: <Terminal size={11} /> },
    { id: "tools", label: "Tools", count: toolInvoked.length, icon: <Wrench size={11} /> },
    { id: "files", label: "Files", count: fileEvents.length, icon: <FileCode size={11} /> },
  ];

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Agent header */}
      <div className={cn("p-4 rounded-xl border", headerGlow[displayStatus] ?? headerGlow.offline)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className={statusDotVariants({ status: displayStatus as any, size: "lg" })} />
            <h3 className="text-base font-semibold text-foreground">{agent.name}</h3>
          </div>
          <div className="flex items-center gap-2">
            {(displayStatus === "working" || displayStatus === "blocked") && (
              <button
                onClick={async () => {
                  setStopping(true);
                  try { await fetch(`${API_URL}/api/agents/${agent.id}/pause`, { method: "POST" }); } catch {}
                  setStopping(false);
                }}
                disabled={stopping}
                className="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-md text-[11px] font-medium border border-red-500/30 bg-transparent text-red-400 hover:bg-red-500/10 hover:border-red-500/50 transition-all disabled:opacity-40"
              >
                <StopCircle size={10} /> {stopping ? "Stopping" : "Stop"}
              </button>
            )}
            {isPaused && (
              <button
                onClick={async () => {
                  try { await fetch(`${API_URL}/api/agents/${agent.id}/resume`, { method: "POST" }); } catch {}
                }}
                className="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-md text-[11px] font-medium border border-emerald-500/30 bg-transparent text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/50 transition-all"
              >
                <Zap size={10} /> Resume
              </button>
            )}
            <span className={statusPillVariants({ status: displayStatus as any })}>
              {statusLabels[displayStatus] ?? displayStatus}
            </span>
          </div>
        </div>
        {agent.status === "blocked" && agent.blockedReason && (
          <div className="flex items-center gap-1.5 mt-2 text-xs text-amber-400/80">
            <AlertTriangle size={11} /> {agent.blockedReason}
          </div>
        )}
        {(currentRun ?? lastRun) && (
          <div className="mt-2 text-xs text-muted-fg truncate">
            {currentRun ? "Run: " : "Last: "}
            {(currentRun ?? lastRun).description ?? (currentRun ?? lastRun).id}
          </div>
        )}
        {lastRun?.error && <div className="mt-1 text-xs text-red-400/80 truncate">{lastRun.error}</div>}
      </div>

      {/* Metrics strip */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: "Runs", value: agentRuns.length, icon: <Zap size={11} className="text-muted-fg" /> },
          { label: "Tasks", value: agentTasks.filter((t) => t.status === "completed").length, icon: <CheckCircle size={11} className="text-muted-fg" /> },
          { label: "Tools", value: toolInvoked.length, icon: <Wrench size={11} className="text-orange-400/60" /> },
          { label: "Files", value: fileEvents.length, icon: <FileCode size={11} className="text-cyan-400/60" /> },
        ].map((m) => (
          <div key={m.label} className={cn(panelVariants({ variant: "inset" }), "rounded-xl p-2.5 text-center")}>
            <div className="text-lg font-bold text-foreground">{m.value}</div>
            <div className="flex items-center justify-center gap-1 text-[10px] text-muted-fg">{m.icon} {m.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs + content */}
      <div className="flex flex-col min-h-0 flex-1">
        <div className="flex gap-1 mb-3 shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={tabVariants({ active: activeTab === tab.id })}
            >
              {tab.icon} {tab.label}
              {tab.count > 0 && <span className="text-muted-fg ml-0.5">{tab.count}</span>}
            </button>
          ))}
        </div>

        <div className={cn(panelVariants({ variant: "inset" }), "rounded-xl flex-1 overflow-y-auto")}>
          {activeTab === "events" && (
            agentEvents.length === 0
              ? <Empty label="No events yet" />
              : agentEvents.slice(-50).map((e) => <RawEventRow key={e.id} event={e} />)
          )}
          {activeTab === "output" && (
            textEvents.length === 0
              ? <Empty label="No output yet" />
              : textEvents.map((e) => <TextOutputBlock key={e.id} event={e} />)
          )}
          {activeTab === "tools" && (
            toolPairs.length === 0
              ? <Empty label="No tool calls yet" />
              : toolPairs.map((p) => <ToolCallRow key={p.invoked.id} invoked={p.invoked} result={p.result} />)
          )}
          {activeTab === "files" && (
            fileEvents.length === 0
              ? <Empty label="No file changes detected" />
              : fileEvents.map((e) => <FileChangeRow key={e.id} event={e} />)
          )}
        </div>
      </div>
    </div>
  );
}

function Empty({ label }: { label: string }) {
  return <div className="text-xs text-muted-fg p-6 text-center">{label}</div>;
}
