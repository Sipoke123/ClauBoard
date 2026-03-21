"use client";

import { useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { StopCircle, Wrench, FileCode, Zap, Terminal, CheckCircle, XCircle, Clock, AlertTriangle, Plus, Minus } from "lucide-react";
import type { Agent, AgentEvent, Run, Task } from "@repo/shared";
import { cn } from "../lib/cn";
import { statusDotVariants, statusPillVariants, buttonVariants, panelVariants, tabVariants, statusLabels, getEventColor } from "../lib/variants";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

// ---------------------------------------------------------------------------
// Virtualized list helper
// ---------------------------------------------------------------------------

function VirtualList<T>({
  items,
  rowHeight,
  renderRow,
  getKey,
  emptyLabel,
}: {
  items: T[];
  rowHeight: number;
  renderRow: (item: T, index: number) => React.ReactNode;
  getKey: (item: T, index: number) => string;
  emptyLabel: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => rowHeight,
    overscan: 15,
  });

  if (items.length === 0) {
    return <div className="text-xs text-muted-fg p-6 text-center">{emptyLabel}</div>;
  }

  return (
    <div ref={scrollRef} className="h-full overflow-y-auto">
      <div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
        {virtualizer.getVirtualItems().map((vRow) => (
          <div
            key={getKey(items[vRow.index], vRow.index)}
            className="absolute w-full"
            style={{ height: vRow.size, top: vRow.start }}
          >
            {renderRow(items[vRow.index], vRow.index)}
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Row renderers
// ---------------------------------------------------------------------------

function ToolCallRow({ invoked, result }: { invoked: AgentEvent; result?: AgentEvent }) {
  const inv = invoked as any;
  const res = result as any;
  const succeeded = result?.type === "tool.result";
  const failed = result?.type === "tool.error";

  return (
    <div className="border-b border-border-subtle py-2.5 px-3 text-xs font-mono h-full">
      <div className="flex items-center gap-2">
        <Wrench size={10} className="text-orange-400/70 shrink-0" />
        <span className="text-orange-400 font-semibold">{inv.payload.tool}</span>
        <span className="text-muted-fg">{new Date(invoked.ts).toLocaleTimeString()}</span>
        {succeeded && <span className="text-emerald-400 text-[10px]">{res.payload.durationMs}ms</span>}
        {failed && <span className={statusPillVariants({ status: "failed" })}>ERROR</span>}
        {!result && <span className={cn(statusPillVariants({ status: "running" }), "animate-pulse")}>running</span>}
      </div>
      <div className="text-muted-fg mt-1 truncate pl-5">{inv.payload.input}</div>
    </div>
  );
}

function RawEventRow({ event }: { event: AgentEvent }) {
  const color = getEventColor(event.type);
  return (
    <div className="flex gap-3 text-xs py-1.5 px-3 font-mono border-b border-border-subtle hover:bg-foreground/[0.02] h-full items-center">
      <span className="text-muted-fg shrink-0">{new Date(event.ts).toLocaleTimeString()}</span>
      <span className={cn("shrink-0", color)}>{event.type}</span>
      <span className="text-muted-fg truncate">{JSON.stringify((event as any).payload).slice(0, 80)}</span>
    </div>
  );
}

function TextOutputRow({ event }: { event: AgentEvent }) {
  const p = (event as any).payload;
  const isStderr = p.stream === "stderr";
  return (
    <div className={cn(
      "py-1.5 px-3 text-xs whitespace-pre-wrap font-mono leading-relaxed border-b border-border-subtle h-full",
      isStderr ? "text-red-400 bg-red-500/10" : "text-foreground"
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
    <div className="flex items-center gap-2 py-1.5 px-3 text-xs font-mono border-b border-border-subtle h-full">
      {icons[p.action] ?? null}
      <span className="text-cyan-400 truncate">{p.path}</span>
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
    working: "border-emerald-500/30 bg-emerald-500/5",
    blocked: "border-amber-500/30 bg-amber-500/5",
    error: "border-red-500/30 bg-red-500/5",
    idle: "border-border-base bg-surface/60",
    offline: "border-border-subtle bg-surface/40",
    paused: "border-amber-500/20 bg-amber-500/5",
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
        {/* Name + role + status dot */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className={statusDotVariants({ status: displayStatus as any, size: "lg" })} />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-foreground leading-none">{agent.name}</h3>
                <span className={statusPillVariants({ status: displayStatus as any })}>
                  {statusLabels[displayStatus] ?? displayStatus}
                </span>
              </div>
              {agent.role && <div className="text-[10px] text-muted-fg/50 uppercase tracking-wider leading-none mt-1">{agent.role}</div>}
            </div>
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
                <StopCircle size={10} /> {stopping ? "..." : "Stop"}
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
          </div>
        </div>
        {/* Current task */}
        {(currentRun ?? lastRun) && (
          <div className="mt-2 text-xs text-muted-fg truncate">
            {(currentRun ?? lastRun)?.config?.prompt ?? (currentRun ?? lastRun)?.description ?? (currentRun ?? lastRun)?.id}
          </div>
        )}
        {agent.status === "blocked" && agent.blockedReason && (
          <div className="flex items-center gap-1.5 mt-1.5 text-xs text-amber-400/80">
            <AlertTriangle size={11} /> {agent.blockedReason}
          </div>
        )}
        {lastRun?.error && <div className="mt-1 text-xs text-red-400/80 truncate">{lastRun.error}</div>}
      </div>

      {/* Metrics strip */}
      <div className="grid grid-cols-4 gap-2 shrink-0">
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

        <div className={cn(panelVariants({ variant: "inset" }), "rounded-xl flex-1 min-h-0 overflow-hidden")}>
          {activeTab === "events" && (
            <VirtualList
              items={[...agentEvents].reverse()}
              rowHeight={30}
              getKey={(e) => e.id}
              emptyLabel="No events yet"
              renderRow={(e) => <RawEventRow event={e} />}
            />
          )}
          {activeTab === "output" && (
            <VirtualList
              items={textEvents}
              rowHeight={36}
              getKey={(e) => e.id}
              emptyLabel="No output yet"
              renderRow={(e) => <TextOutputRow event={e} />}
            />
          )}
          {activeTab === "tools" && (
            <VirtualList
              items={toolPairs}
              rowHeight={52}
              getKey={(p) => p.invoked.id}
              emptyLabel="No tool calls yet"
              renderRow={(p) => <ToolCallRow invoked={p.invoked} result={p.result} />}
            />
          )}
          {activeTab === "files" && (
            <VirtualList
              items={fileEvents}
              rowHeight={30}
              getKey={(e) => e.id}
              emptyLabel="No file changes detected"
              renderRow={(e) => <FileChangeRow event={e} />}
            />
          )}
        </div>
      </div>
    </div>
  );
}
