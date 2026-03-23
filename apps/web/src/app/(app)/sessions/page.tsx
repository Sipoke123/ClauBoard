"use client";

import { useState, useMemo, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useVirtualizer } from "@tanstack/react-virtual";
import { motion, AnimatePresence } from "framer-motion";
import { Square3Stack3DIcon, PlusIcon, XMarkIcon, WrenchIcon, CodeBracketIcon, BoltIcon, ArrowRightIcon, ExclamationTriangleIcon, UsersIcon, SparklesIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { StopIcon } from "@heroicons/react/24/solid";
import { useStore } from "../../../lib/use-store";
import type { Session, Run, Agent, AgentEvent, SessionAgent } from "@repo/shared";
import { validateDependencyGraph, computeStages } from "@repo/shared";
import { cn } from "../../../lib/cn";
import { statusDotVariants, statusPillVariants, buttonVariants, panelVariants, inputVariants, tabVariants, statusLabels, getEventColor } from "../../../lib/variants";
import { API_URL } from "../../../lib/api-url";

interface SessionPreset {
  id: string;
  label: string;
  description: string;
  name: string;
  agents: { agentName: string; prompt: string; dependsOn?: string[] }[];
}

// ---------------------------------------------------------------------------
// Create session form
// ---------------------------------------------------------------------------

interface FormSpec { agentName: string; prompt: string; cwd: string; dependsOn: string[] }

function CreateSessionForm({ onCreated, presets }: { onCreated: () => void; presets: SessionPreset[] }) {
  const [name, setName] = useState("");
  const [specs, setSpecs] = useState<FormSpec[]>([
    { agentName: "Agent A", prompt: "", cwd: "", dependsOn: [] },
    { agentName: "Agent B", prompt: "", cwd: "", dependsOn: [] },
  ]);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function applyPreset(preset: SessionPreset) {
    setName(preset.name);
    setSpecs(preset.agents.map((a) => ({
      agentName: a.agentName,
      prompt: a.prompt,
      cwd: "",
      dependsOn: a.dependsOn ?? [],
    })));
  }

  function updateSpec(idx: number, field: string, value: any) {
    setSpecs((prev) => prev.map((s, i) => (i === idx ? { ...s, [field]: value } : s)));
  }
  function addAgent() {
    setSpecs((prev) => [...prev, { agentName: `Agent ${String.fromCharCode(65 + prev.length)}`, prompt: "", cwd: "", dependsOn: [] }]);
  }
  function removeAgent(idx: number) {
    if (specs.length <= 1) return;
    const removed = specs[idx].agentName;
    setSpecs((prev) => prev.filter((_, i) => i !== idx).map((s) => ({ ...s, dependsOn: s.dependsOn.filter((d) => d !== removed) })));
  }
  function toggleDep(idx: number, depName: string) {
    setSpecs((prev) => prev.map((s, i) => {
      if (i !== idx) return s;
      const deps = s.dependsOn.includes(depName) ? s.dependsOn.filter((d) => d !== depName) : [...s.dependsOn, depName];
      return { ...s, dependsOn: deps };
    }));
  }

  const agentNames = specs.map((s) => s.agentName.trim()).filter(Boolean);
  const hasDeps = specs.some((s) => s.dependsOn.length > 0);
  const graphResult = useMemo(() => {
    if (!hasDeps) return { valid: true, stages: [agentNames] };
    return validateDependencyGraph(specs.map((s) => ({ agentName: s.agentName.trim(), prompt: s.prompt, dependsOn: s.dependsOn })));
  }, [specs, hasDeps, agentNames]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || specs.some((s) => !s.prompt.trim()) || !graphResult.valid) return;
    setCreating(true); setError(null);
    try {
      const res = await fetch(`${API_URL}/api/sessions`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          agents: specs.map((s) => ({ agentName: s.agentName.trim() || "Claude", prompt: s.prompt.trim(), cwd: s.cwd.trim() || undefined, dependsOn: s.dependsOn.length > 0 ? s.dependsOn : undefined })),
        }),
      });
      if (!res.ok) { const b = await res.json().catch(() => ({})); throw new Error(b.error ?? `HTTP ${res.status}`); }
      setName(""); setSpecs([{ agentName: "Agent A", prompt: "", cwd: "", dependsOn: [] }, { agentName: "Agent B", prompt: "", cwd: "", dependsOn: [] }]);
      onCreated();
    } catch (err: any) { setError(err.message); } finally { setCreating(false); }
  }

  return (
    <form onSubmit={handleCreate} className="space-y-3">
      {presets.length > 0 && !name && specs.every((s) => !s.prompt) && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <SparklesIcon className="w-[11px] h-[11px] text-muted-fg" />
            <span className="text-[10px] text-muted-fg font-medium uppercase tracking-wider">Presets</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {presets.map((preset) => (
              <button key={preset.id} type="button" onClick={() => applyPreset(preset)}
                className={cn(panelVariants({ variant: "inset" }), "rounded-xl px-3 py-2 text-left hover:bg-muted/60 hover:border-border-base transition-colors group cursor-pointer")}>
                <div className="text-xs font-medium text-foreground/80 group-hover:text-foreground transition-colors">{preset.label}</div>
                <div className="text-[10px] text-muted-fg mt-0.5">{preset.description}</div>
              </button>
            ))}
          </div>
        </div>
      )}
      <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Session name" className={inputVariants({ size: "md" })} />
      <div className="space-y-2">
        {specs.map((spec, idx) => {
          const otherNames = agentNames.filter((n) => n !== spec.agentName.trim());
          return (
            <div key={idx} className={cn(panelVariants({ variant: "inset" }), "rounded-xl p-3 space-y-2")}>
              <div className="flex items-center justify-between">
                <input type="text" value={spec.agentName} onChange={(e) => updateSpec(idx, "agentName", e.target.value)} className="bg-transparent border-none text-sm font-medium text-foreground focus:outline-none w-32" />
                {specs.length > 1 && <button type="button" onClick={() => removeAgent(idx)} className={buttonVariants({ variant: "ghost", size: "xs" })}><XMarkIcon className="w-2.5 h-2.5" /></button>}
              </div>
              <textarea value={spec.prompt} onChange={(e) => updateSpec(idx, "prompt", e.target.value)} placeholder={`Prompt for ${spec.agentName}...`} rows={2} className={cn(inputVariants({ size: "sm" }), "resize-none")} />
              <input type="text" value={spec.cwd} onChange={(e) => updateSpec(idx, "cwd", e.target.value)} placeholder="Working directory (optional)" className={inputVariants({ size: "sm" })} />
              {otherNames.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-muted-fg">After:</span>
                  {otherNames.map((depName) => (
                    <button key={depName} type="button" onClick={() => toggleDep(idx, depName)}
                      className={cn("px-2 py-0.5 rounded-md text-[10px] transition-colors", spec.dependsOn.includes(depName) ? "bg-blue-600 text-white" : "bg-muted text-muted-fg hover:bg-muted/70")}>
                      {depName}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <button type="button" onClick={addAgent} className={buttonVariants({ variant: "ghost", size: "xs" })}><PlusIcon className="w-2.5 h-2.5" /> Add agent</button>

      {hasDeps && !graphResult.valid && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/5 border border-red-500/20 text-xs text-red-400">
          <ExclamationTriangleIcon className="w-3 h-3" /> {graphResult.error}
        </div>
      )}
      {hasDeps && graphResult.valid && graphResult.stages && (
        <div className={cn(panelVariants({ variant: "inset" }), "rounded-xl px-3 py-2")}>
          <div className="text-[10px] text-muted-fg mb-1.5">Execution order:</div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {graphResult.stages.map((stage, i) => (
              <div key={i} className="flex items-center gap-1.5">
                {i > 0 && <ArrowRightIcon className="w-2.5 h-2.5 text-muted-fg/50" />}
                <div className="flex gap-1">{stage.map((n) => <span key={n} className={statusPillVariants({ status: "active" })}>{n}</span>)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <button type="submit" disabled={creating || !name.trim() || specs.some((s) => !s.prompt.trim()) || !graphResult.valid} className={buttonVariants({ variant: "primary", size: "sm" })}>
          {creating ? "Creating..." : "Create Session"}
        </button>
        {error && <span className="text-xs text-red-400">{error}</span>}
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Session card
// ---------------------------------------------------------------------------

function SessionCard({ session, selected, onClick, onStop }: {
  session: Session; selected: boolean; onClick: () => void; onStop: () => void;
}) {
  const agents = session.agents ?? [];
  const running = agents.filter((a) => a.status === "running").length;
  const completed = agents.filter((a) => a.status === "completed").length;
  const failed = agents.filter((a) => ["failed", "stopped"].includes(a.status)).length;
  const waiting = agents.filter((a) => a.status === "waiting").length;
  const hasDeps = agents.some((a) => a.dependsOn.length > 0);

  const sessionGlow: Record<string, string> = {
    active: "border-emerald-500/30 bg-emerald-500/[0.03]",
    completed: "border-border-base bg-surface/60",
    failed: "border-red-500/20 bg-red-500/[0.02]",
    stopped: "border-amber-500/20 bg-amber-500/[0.02]",
  };

  return (
    <div onClick={onClick} role="button" tabIndex={0} className={cn(
      "w-full text-left p-4 rounded-xl border transition-all duration-150 cursor-pointer",
      selected
        ? "border-foreground/20 bg-foreground/[0.03] shadow-md"
        : cn("hover:bg-foreground/[0.02]", sessionGlow[session.status] ?? "border-border-base bg-surface/60")
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className={statusDotVariants({ status: session.status as any, size: "md" })} />
          <span className="font-semibold text-sm text-foreground truncate">{session.name}</span>
        </div>
        <ChevronRightIcon className={cn("w-[14px] h-[14px] text-muted-fg/40 shrink-0 transition-transform", selected && "rotate-90")} />
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-3 text-[10px] mb-2.5">
        <span className="text-muted-fg">{agents.length} agents</span>
        {hasDeps && <span className="text-amber-400/60">staged</span>}
        {running > 0 && <span className="text-emerald-400">{running} running</span>}
        {completed > 0 && <span className="text-muted-fg">{completed} done</span>}
        {failed > 0 && <span className="text-red-400">{failed} failed</span>}
        {waiting > 0 && <span className="text-muted-fg/60">{waiting} waiting</span>}
      </div>

      {/* Agent dots */}
      <div className="flex gap-2 flex-wrap">
        {agents.map((a) => (
          <div key={a.agentName} className="flex items-center gap-1.5 px-1.5 py-0.5 rounded-md bg-foreground/[0.03]" title={`${a.agentName}: ${statusLabels[a.status]}`}>
            <span className={statusDotVariants({ status: a.status as any, size: "sm" })} />
            <span className="text-[10px] text-muted-fg">{a.agentName}</span>
          </div>
        ))}
      </div>

      {/* Stop all */}
      {running > 0 && (
        <div className="mt-3 pt-2 border-t border-border-subtle">
          <button onClick={(e) => { e.stopPropagation(); onStop(); }}
            className={cn(buttonVariants({ variant: "danger", size: "xs" }))}>
            <StopIcon className="w-2.5 h-2.5" /> Stop All
          </button>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Virtual activity table
// ---------------------------------------------------------------------------

const ACTIVITY_ROW_HEIGHT = 32;

function VirtualActivityTable({ events, agentMap }: { events: AgentEvent[]; agentMap: Map<string, Agent> }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: events.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ACTIVITY_ROW_HEIGHT,
    overscan: 30,
  });

  if (events.length === 0) {
    return <div className="text-xs text-muted-fg/40 p-6 text-center">No events match filters</div>;
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Header */}
      <div className="flex border-b border-border-base text-[10px] font-semibold text-muted-fg uppercase tracking-wider shrink-0">
        <div className="py-1.5 px-3 w-20">Time</div>
        <div className="py-1.5 px-3 w-24">Agent</div>
        <div className="py-1.5 px-3 w-36">Type</div>
        <div className="py-1.5 px-3 flex-1">Payload</div>
      </div>
      {/* Virtual rows */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
          {virtualizer.getVirtualItems().map((vRow) => {
            const e = events[vRow.index];
            return (
              <div key={e.id} className="flex items-center border-b border-border-subtle text-xs font-mono hover:bg-foreground/[0.02] absolute w-full"
                style={{ height: ACTIVITY_ROW_HEIGHT, top: vRow.start }}>
                <div className="px-3 w-20 text-muted-fg whitespace-nowrap">{new Date(e.ts).toLocaleTimeString()}</div>
                <div className="px-3 w-24 text-muted-fg truncate">{agentMap.get(e.agentId)?.name ?? "?"}</div>
                <div className={cn("px-3 w-36 whitespace-nowrap", getEventColor(e.type))}>{e.type}</div>
                <div className="px-3 flex-1 text-muted-fg truncate">{JSON.stringify((e as any).payload).slice(0, 120)}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Session detail
// ---------------------------------------------------------------------------

type DetailTab = "pipeline" | "activity" | "tools" | "files";

function SessionDetail({ session, runs, agents, events }: { session: Session; runs: Run[]; agents: Agent[]; events: AgentEvent[] }) {
  const [activeTab, setActiveTab] = useState<DetailTab>("pipeline");
  const [agentFilter, setAgentFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const agentMap = new Map(agents.map((a) => [a.id, a]));
  const sessionAgents = session.agents ?? [];
  const sessionRuns = session.runIds.map((id) => runs.find((r) => r.id === id)).filter(Boolean) as Run[];
  const sessionAgentIds = useMemo(() => new Set(sessionRuns.map((r) => r.agentId)), [sessionRuns]);

  const sessionEvents = useMemo(() => events.filter((e) => sessionAgentIds.has(e.agentId)).sort((a, b) => b.ts - a.ts), [events, sessionAgentIds]);
  const filteredEvents = useMemo(() => {
    let f = sessionEvents;
    if (agentFilter !== "all") f = f.filter((e) => e.agentId === agentFilter);
    if (typeFilter !== "all") f = f.filter((e) => e.type.startsWith(typeFilter));
    return f;
  }, [sessionEvents, agentFilter, typeFilter]);

  const toolsSummary = useMemo(() => {
    const m = new Map<string, { count: number; errors: number; agents: Set<string> }>();
    for (const e of sessionEvents) {
      if (e.type === "tool.invoked") { const t = (e as any).payload.tool; const x = m.get(t) ?? { count: 0, errors: 0, agents: new Set() }; x.count++; x.agents.add(e.agentId); m.set(t, x); }
      if (e.type === "tool.error") { const t = (e as any).payload.tool; const x = m.get(t) ?? { count: 0, errors: 0, agents: new Set() }; x.errors++; m.set(t, x); }
    }
    return [...m.entries()].map(([n, d]) => ({ name: n, ...d, agents: [...d.agents] })).sort((a, b) => b.count - a.count);
  }, [sessionEvents]);

  const fileSummary = useMemo(() => {
    const m = new Map<string, { action: string; agent: string; ts: number }>();
    for (const e of sessionEvents) { if (e.type === "file.changed") { const p = (e as any).payload; m.set(p.path, { action: p.action, agent: e.agentId, ts: e.ts }); } }
    return [...m.entries()].map(([p, d]) => ({ path: p, ...d })).sort((a, b) => b.ts - a.ts);
  }, [sessionEvents]);

  const hasDeps = sessionAgents.some((a) => a.dependsOn.length > 0);
  const toolCalls = sessionEvents.filter((e) => e.type === "tool.invoked").length;
  const fileChanges = sessionEvents.filter((e) => e.type === "file.changed").length;

  const tabs: { id: DetailTab; label: string; count?: number; icon: React.ReactNode }[] = [
    { id: "pipeline", label: hasDeps ? "Pipeline" : "Agents", count: sessionAgents.length, icon: <UsersIcon className="w-[11px] h-[11px]" /> },
    { id: "activity", label: "Activity", count: sessionEvents.length, icon: <BoltIcon className="w-[11px] h-[11px]" /> },
    { id: "tools", label: "Tools", count: toolCalls, icon: <WrenchIcon className="w-[11px] h-[11px]" /> },
    { id: "files", label: "Files", count: fileChanges, icon: <CodeBracketIcon className="w-[11px] h-[11px]" /> },
  ];
  const typeGroups = ["all", "agent.", "run.", "task.", "tool.", "terminal.", "file."];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="shrink-0 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className={statusDotVariants({ status: session.status as any, size: "lg" })} />
            <h3 className="text-lg font-semibold text-foreground">{session.name}</h3>
          </div>
          <span className={statusPillVariants({ status: session.status as any })}>{statusLabels[session.status]}</span>
        </div>
        <div className="text-xs text-muted-fg mt-1 ml-5">{sessionAgents.length} agents{hasDeps ? " (staged pipeline)" : " (parallel)"} · {sessionEvents.length} events</div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 shrink-0 border-b border-border-subtle pb-3">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={tabVariants({ active: activeTab === tab.id })}>
            {tab.icon} {tab.label}
            {tab.count != null && tab.count > 0 && <span className="text-muted-fg/60 ml-0.5 tabular-nums">{tab.count}</span>}
          </button>
        ))}
      </div>

      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        {/* PIPELINE */}
        {activeTab === "pipeline" && (() => {
          const stageMap = computeStages(session.specs);
          const maxStage = Math.max(0, ...stageMap.values());
          const cols: SessionAgent[][] = Array.from({ length: maxStage + 1 }, () => []);
          for (const sa of sessionAgents) cols[stageMap.get(sa.agentName) ?? 0].push(sa);

          return (
            <div className="flex items-start gap-4 overflow-x-auto pb-2">
              {cols.map((stageAgents, si) => (
                <div key={si} className="flex items-start gap-4">
                  <div className="min-w-[220px] space-y-2">
                    <div className="text-[10px] text-muted-fg/60 font-semibold uppercase tracking-wider text-center mb-2">Stage {si + 1}</div>
                    {stageAgents.map((sa) => {
                      const run = sa.runId ? sessionRuns.find((r) => r.id === sa.runId) : undefined;
                      const evts = sa.runId ? sessionEvents.filter((e) => e.agentId === (run?.agentId ?? "")) : [];
                      const tools = evts.filter((e) => e.type === "tool.invoked").length;
                      const headerGlow: Record<string, string> = {
                        running: "border-emerald-500/30 bg-emerald-500/[0.04]",
                        completed: "border-emerald-500/20 bg-emerald-500/[0.02]",
                        failed: "border-red-500/30 bg-red-500/[0.04]",
                        waiting: "border-border-subtle bg-surface-inset",
                        stopped: "border-amber-500/20 bg-amber-500/[0.03]",
                        skipped: "border-border-subtle bg-surface-inset opacity-50",
                      };
                      return (
                        <motion.div key={sa.agentName} layout initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                          className={cn("rounded-xl border p-3.5 transition-colors", headerGlow[sa.status] ?? headerGlow.waiting)}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className={statusDotVariants({ status: sa.status as any, size: "md" })} />
                              <span className="font-semibold text-sm text-foreground">{sa.agentName}</span>
                            </div>
                            <span className={statusPillVariants({ status: sa.status as any })}>{statusLabels[sa.status]}</span>
                          </div>
                          {sa.dependsOn.length > 0 && (
                            <div className="flex items-center gap-1 mb-2 flex-wrap">
                              <span className="text-[10px] text-muted-fg/50">Depends on:</span>
                              {sa.dependsOn.map((dep) => {
                                const d = sessionAgents.find((a) => a.agentName === dep);
                                const done = d?.status === "completed";
                                const bad = d && ["failed", "stopped", "skipped"].includes(d.status);
                                return <span key={dep} className={cn(statusPillVariants({ status: done ? "completed" : bad ? "failed" : "waiting" }))}>{dep} {done ? "✓" : bad ? "✗" : "…"}</span>;
                              })}
                            </div>
                          )}
                          <div className="text-xs text-muted-fg truncate">{session.specs[sa.specIndex]?.prompt ?? "—"}</div>
                          {run && (
                            <div className="flex gap-3 text-[10px] text-muted-fg/60 mt-2 pt-2 border-t border-border-subtle">
                              {tools > 0 && <span className="text-amber-400/60">{tools} tools</span>}
                              <span>{evts.length} events</span>
                              {run.completedAt && <span>{((run.completedAt - run.startedAt) / 1000).toFixed(1)}s</span>}
                            </div>
                          )}
                          {sa.status === "skipped" && <div className="text-[10px] text-amber-400/70 mt-1.5">Skipped — dependency failed</div>}
                          {run?.error && <div className="text-[10px] text-red-400/80 mt-1.5 truncate">{run.error}</div>}
                        </motion.div>
                      );
                    })}
                  </div>
                  {si < maxStage && (
                    <div className="flex items-center self-center pt-8"><ArrowRightIcon className="w-4 h-4 text-muted-fg/30" /></div>
                  )}
                </div>
              ))}
            </div>
          );
        })()}

        {/* ACTIVITY */}
        {activeTab === "activity" && (
          <div className="flex flex-col flex-1 min-h-0">
            <div className="flex gap-2 mb-3 shrink-0">
              <select value={agentFilter} onChange={(e) => setAgentFilter(e.target.value)} className={cn(inputVariants({ size: "sm" }), "w-auto")}>
                <option value="all">All agents</option>
                {sessionRuns.map((r) => <option key={r.agentId} value={r.agentId}>{agentMap.get(r.agentId)?.name ?? r.agentId}</option>)}
              </select>
              <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className={cn(inputVariants({ size: "sm" }), "w-auto")}>
                {typeGroups.map((g) => <option key={g} value={g}>{g === "all" ? "All types" : g + "*"}</option>)}
              </select>
              <span className="text-[10px] text-muted-fg/50 self-center ml-auto tabular-nums">{filteredEvents.length} events</span>
            </div>
            <div className={cn(panelVariants({ variant: "inset" }), "rounded-xl flex-1 min-h-0 overflow-hidden flex flex-col")}>
              <VirtualActivityTable events={filteredEvents} agentMap={agentMap} />
            </div>
          </div>
        )}

        {/* TOOLS */}
        {activeTab === "tools" && (
          <div className={cn(panelVariants({ variant: "inset" }), "rounded-xl flex-1 min-h-0 overflow-hidden")}>
            <div className="h-full overflow-y-auto">
              {toolsSummary.length === 0 ? <div className="text-xs text-muted-fg/40 p-6 text-center">No tool calls yet</div> : (
                <div className="divide-y divide-border-subtle">
                  {toolsSummary.map((t) => (
                    <div key={t.name} className="flex items-center gap-4 px-4 py-3 hover:bg-foreground/[0.02] transition-colors">
                      <div className="flex items-center gap-2 w-36">
                        <WrenchIcon className="w-3 h-3 text-amber-400/60 shrink-0" />
                        <span className="text-sm font-medium text-foreground truncate">{t.name}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-fg">
                        <span className="tabular-nums">{t.count} calls</span>
                        {t.errors > 0 && <span className="text-red-400 tabular-nums">{t.errors} errors</span>}
                      </div>
                      <div className="flex gap-1 flex-wrap ml-auto">
                        {t.agents.map((aid) => (
                          <span key={aid} className={cn(statusPillVariants({ status: "idle" }))}>{agentMap.get(aid)?.name ?? "?"}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* FILES */}
        {activeTab === "files" && (
          <div className={cn(panelVariants({ variant: "inset" }), "rounded-xl flex-1 min-h-0 overflow-hidden")}>
            <div className="h-full overflow-y-auto">
              {fileSummary.length === 0 ? <div className="text-xs text-muted-fg/40 p-6 text-center">No file changes detected</div> : (
                <div className="divide-y divide-border-subtle">
                  {fileSummary.map((f) => (
                    <div key={f.path} className="flex items-center gap-4 px-4 py-2.5 hover:bg-foreground/[0.02] transition-colors font-mono text-xs">
                      <span className={cn(
                        "w-14 shrink-0 text-[10px] font-semibold uppercase tracking-wider",
                        f.action === "create" ? "text-emerald-400" : f.action === "delete" ? "text-red-400" : "text-amber-400"
                      )}>{f.action}</span>
                      <span className="text-cyan-400/80 truncate flex-1">{f.path}</span>
                      <span className="text-muted-fg/60 w-20 truncate text-right">{agentMap.get(f.agent)?.name ?? "?"}</span>
                      <span className="text-muted-fg/40 w-20 text-right whitespace-nowrap">{new Date(f.ts).toLocaleTimeString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

function SessionsPageInner() {
  const searchParams = useSearchParams();
  const { sessions, runs, agents, events } = useStore();
  const [selectedId, setSelectedId] = useState<string | null>(searchParams.get("selected"));
  const [showCreate, setShowCreate] = useState(false);
  const [sessionPresets, setSessionPresets] = useState<SessionPreset[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/api/presets/sessions`)
      .then((r) => r.json())
      .then(setSessionPresets)
      .catch(() => {});
  }, []);

  const selectedSession = sessions.find((s) => s.id === selectedId);

  async function stopSession(sessionId: string) {
    await fetch(`${API_URL}/api/sessions/${sessionId}/stop`, { method: "POST" });
  }

  return (
    <div className="flex flex-col md:flex-row gap-3 md:gap-6 h-full p-3 md:p-6 overflow-y-auto md:overflow-hidden relative">
      {/* Sidebar */}
      <div className="w-full md:w-80 shrink-0 flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-4 shrink-0">
          <div className="flex items-center gap-2">
            <Square3Stack3DIcon className="w-4 h-4 text-muted-fg" />
            <h2 className="text-base font-semibold text-foreground">Sessions</h2>
            {sessions.length > 0 && <span className="text-xs text-muted-fg/50 tabular-nums">{sessions.length}</span>}
          </div>
          <button onClick={() => setShowCreate(!showCreate)} className={buttonVariants({ variant: showCreate ? "ghost" : "outline", size: "xs" })}>
            {showCreate ? <><XMarkIcon className="w-2.5 h-2.5" /> Cancel</> : <><PlusIcon className="w-2.5 h-2.5" /> New</>}
          </button>
        </div>

        <AnimatePresence>
          {showCreate && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden shrink-0">
              <div className={cn(panelVariants({ variant: "surface" }), "p-4 mb-4")}>
                <CreateSessionForm onCreated={() => setShowCreate(false)} presets={sessionPresets} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {sessions.length === 0 && !showCreate ? (
          <div className="border border-dashed border-border-base rounded-xl p-8 text-center space-y-3">
            <Square3Stack3DIcon className="w-7 h-7 text-muted-fg/30 mx-auto" />
            <div className="text-foreground/80 text-sm font-medium">No sessions yet</div>
            <div className="text-muted-fg/60 text-xs leading-relaxed max-w-[220px] mx-auto">Sessions let you group and coordinate multiple AI agents with dependency chains.</div>
            <button onClick={() => setShowCreate(true)} className={buttonVariants({ variant: "outline", size: "sm" })}>
              <PlusIcon className="w-[11px] h-[11px]" /> Create your first session
            </button>
          </div>
        ) : (
          <div className="space-y-2 overflow-y-auto flex-1 min-h-0">
            {[...sessions].sort((a, b) => b.createdAt - a.createdAt).map((s) => (
              <SessionCard key={s.id} session={s}
                selected={s.id === selectedId} onClick={() => setSelectedId(s.id === selectedId ? null : s.id)} onStop={() => stopSession(s.id)} />
            ))}
          </div>
        )}
      </div>

      {/* Detail */}
      {selectedSession ? (
        <div className="flex-1 min-w-0">
          <div className="md:hidden flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-foreground">{selectedSession.name}</h3>
            <button onClick={() => setSelectedId(null)} className={buttonVariants({ variant: "ghost", size: "xs" })}>
              <XMarkIcon className="w-3 h-3" /> Back
            </button>
          </div>
          <SessionDetail session={selectedSession} runs={runs} agents={agents} events={events} />
        </div>
      ) : sessions.length > 0 && (
        <div className="hidden md:flex absolute inset-0 items-center justify-center pointer-events-none">
          <div className="text-center space-y-2">
            <Square3Stack3DIcon className="w-8 h-8 text-muted-fg/20 mx-auto" />
            <p className="text-sm text-muted-fg/50">Select a session to view details</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SessionsPage() {
  return (
    <Suspense>
      <SessionsPageInner />
    </Suspense>
  );
}
