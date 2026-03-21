"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Layers, Plus, X, StopCircle, Wrench, FileCode, Zap, ArrowRight, AlertTriangle, Users, Sparkles } from "lucide-react";
import { useStore } from "../../../lib/use-store";
import type { Session, Run, Agent, AgentEvent, SessionAgent } from "@repo/shared";
import { validateDependencyGraph, computeStages } from "@repo/shared";
import { cn } from "../../../lib/cn";
import { statusDotVariants, statusPillVariants, buttonVariants, panelVariants, inputVariants, tabVariants, statusLabels, getEventColor } from "../../../lib/variants";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

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
            <Sparkles size={11} className="text-muted-fg" />
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
                {specs.length > 1 && <button type="button" onClick={() => removeAgent(idx)} className={buttonVariants({ variant: "ghost", size: "xs" })}><X size={10} /></button>}
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
      <button type="button" onClick={addAgent} className={buttonVariants({ variant: "ghost", size: "xs" })}><Plus size={10} /> Add agent</button>

      {hasDeps && !graphResult.valid && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/5 border border-red-500/20 text-xs text-red-400">
          <AlertTriangle size={12} /> {graphResult.error}
        </div>
      )}
      {hasDeps && graphResult.valid && graphResult.stages && (
        <div className={cn(panelVariants({ variant: "inset" }), "rounded-xl px-3 py-2")}>
          <div className="text-[10px] text-muted-fg mb-1.5">Execution order:</div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {graphResult.stages.map((stage, i) => (
              <div key={i} className="flex items-center gap-1.5">
                {i > 0 && <ArrowRight size={10} className="text-muted-fg/50" />}
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
  const waiting = agents.filter((a) => a.status === "waiting").length;
  const hasDeps = agents.some((a) => a.dependsOn.length > 0);

  return (
    <div onClick={onClick} role="button" tabIndex={0} className={cn(
      "w-full text-left p-4 rounded-xl border transition-all duration-150 cursor-pointer",
      selected ? "border-blue-500/40 bg-muted/60 shadow-lg shadow-blue-900/10" : "border-border-base bg-surface/60 hover:bg-muted/40 hover:border-border-base"
    )}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="font-medium text-sm text-foreground truncate">{session.name}</span>
        <span className={statusPillVariants({ status: session.status as any })}>{statusLabels[session.status] ?? session.status}</span>
      </div>
      <div className="flex items-center gap-2 text-[10px] text-muted-fg mb-2">
        <span>{agents.length} agents</span>
        {hasDeps && <span className="text-blue-400">staged</span>}
        {running > 0 && <span className="text-emerald-400">{running} running</span>}
        {waiting > 0 && <span>{waiting} waiting</span>}
      </div>
      <div className="flex gap-1.5 flex-wrap">
        {agents.map((a) => (
          <div key={a.agentName} className="flex items-center gap-1" title={`${a.agentName}: ${statusLabels[a.status]}`}>
            <span className={statusDotVariants({ status: a.status as any, size: "sm" })} />
            <span className="text-[10px] text-muted-fg">{a.agentName}</span>
          </div>
        ))}
      </div>
      {running > 0 && (
        <button onClick={(e) => { e.stopPropagation(); onStop(); }} className={cn(buttonVariants({ variant: "danger", size: "xs" }), "mt-2")}>
          <StopCircle size={10} /> Stop All
        </button>
      )}
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
  const sessionAgentIds = new Set(sessionRuns.map((r) => r.agentId));

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
    { id: "pipeline", label: hasDeps ? "Pipeline" : "Agents", count: sessionAgents.length, icon: <Users size={11} /> },
    { id: "activity", label: "Activity", count: sessionEvents.length, icon: <Zap size={11} /> },
    { id: "tools", label: "Tools", count: toolCalls, icon: <Wrench size={11} /> },
    { id: "files", label: "Files", count: fileChanges, icon: <FileCode size={11} /> },
  ];
  const typeGroups = ["all", "agent.", "run.", "task.", "tool.", "terminal.", "file."];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className={cn(panelVariants({ variant: "surface" }), "p-4 shrink-0")}>
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-foreground">{session.name}</h3>
          <span className={statusPillVariants({ status: session.status as any })}>{statusLabels[session.status]}</span>
        </div>
        <div className="text-xs text-muted-fg mt-1">{sessionAgents.length} agents{hasDeps ? " (staged)" : " (parallel)"} · {sessionEvents.length} events</div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 my-3 shrink-0">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={tabVariants({ active: activeTab === tab.id })}>
            {tab.icon} {tab.label}
            {tab.count != null && tab.count > 0 && <span className="text-muted-fg ml-0.5">{tab.count}</span>}
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
            <div className="flex items-start gap-3 overflow-x-auto pb-2">
              {cols.map((stageAgents, si) => (
                <div key={si} className="flex items-start gap-3">
                  <div className="min-w-[200px] space-y-2">
                    <div className="text-[10px] text-muted-fg font-semibold uppercase tracking-wider text-center mb-1">Stage {si + 1}</div>
                    {stageAgents.map((sa) => {
                      const run = sa.runId ? sessionRuns.find((r) => r.id === sa.runId) : undefined;
                      const evts = sa.runId ? sessionEvents.filter((e) => e.agentId === (run?.agentId ?? "")) : [];
                      const tools = evts.filter((e) => e.type === "tool.invoked").length;
                      const headerGlow: Record<string, string> = {
                        running: "border-emerald-500/30 bg-emerald-500/5", completed: "border-border-base bg-surface/40",
                        failed: "border-red-500/30 bg-red-500/5", waiting: "border-border-subtle bg-surface/30",
                        stopped: "border-amber-500/20 bg-amber-500/5", skipped: "border-border-subtle bg-surface/20 opacity-60",
                      };
                      return (
                        <motion.div key={sa.agentName} layout initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                          className={cn("rounded-xl border p-3", headerGlow[sa.status] ?? headerGlow.waiting)}>
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <span className={statusDotVariants({ status: sa.status as any, size: "md" })} />
                              <span className="font-medium text-sm text-foreground">{sa.agentName}</span>
                            </div>
                            <span className="text-[10px] text-muted-fg">{statusLabels[sa.status]}</span>
                          </div>
                          {sa.dependsOn.length > 0 && (
                            <div className="flex items-center gap-1 mb-1.5 flex-wrap">
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
                            <div className="flex gap-2 text-[10px] text-muted-fg mt-1.5">
                              {tools > 0 && <span className="text-orange-400/60">{tools} tools</span>}
                              <span>{evts.length} evts</span>
                              {run.completedAt && <span>{((run.completedAt - run.startedAt) / 1000).toFixed(1)}s</span>}
                            </div>
                          )}
                          {sa.status === "skipped" && <div className="text-[10px] text-amber-400/70 mt-1">Skipped — dep failed</div>}
                          {run?.error && <div className="text-[10px] text-red-400/70 mt-1 truncate">{run.error}</div>}
                        </motion.div>
                      );
                    })}
                  </div>
                  {si < maxStage && (
                    <div className="flex items-center self-center pt-8"><ArrowRight size={14} className="text-muted-fg/50" /></div>
                  )}
                </div>
              ))}
            </div>
          );
        })()}

        {/* ACTIVITY */}
        {activeTab === "activity" && (
          <div className="flex flex-col flex-1 min-h-0">
            <div className="flex gap-2 mb-2 shrink-0">
              <select value={agentFilter} onChange={(e) => setAgentFilter(e.target.value)} className={cn(inputVariants({ size: "sm" }), "w-auto")}>
                <option value="all">All agents</option>
                {sessionRuns.map((r) => <option key={r.agentId} value={r.agentId}>{agentMap.get(r.agentId)?.name ?? r.agentId}</option>)}
              </select>
              <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className={cn(inputVariants({ size: "sm" }), "w-auto")}>
                {typeGroups.map((g) => <option key={g} value={g}>{g === "all" ? "All types" : g + "*"}</option>)}
              </select>
              <span className="text-[10px] text-muted-fg self-center ml-auto">{filteredEvents.length} events</span>
            </div>
            <div className={cn(panelVariants({ variant: "inset" }), "rounded-xl flex-1 min-h-0 overflow-hidden")}>
              <div className="h-full overflow-y-auto">
                {filteredEvents.length === 0 ? <div className="text-xs text-muted-fg p-6 text-center">No events match filters</div> : (
                  <table className="w-full">
                    <thead className="sticky top-0 bg-surface z-10">
                      <tr className="border-b border-border-base text-[10px] font-semibold text-muted-fg uppercase tracking-wider">
                        <th className="py-1.5 px-3.5 text-left w-20">Time</th>
                        <th className="py-1.5 px-3.5 text-left w-24">Agent</th>
                        <th className="py-1.5 px-3.5 text-left w-36">Type</th>
                        <th className="py-1.5 px-3.5 text-left">Payload</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEvents.map((e) => (
                        <tr key={e.id} className="border-b border-border-subtle text-xs font-mono hover:bg-foreground/[0.02]">
                          <td className="py-1.5 px-3.5 text-muted-fg whitespace-nowrap">{new Date(e.ts).toLocaleTimeString()}</td>
                          <td className="py-1.5 px-3.5 text-muted-fg truncate max-w-[100px]">{agentMap.get(e.agentId)?.name ?? "?"}</td>
                          <td className={cn("py-1.5 px-3.5 whitespace-nowrap", getEventColor(e.type))}>{e.type}</td>
                          <td className="py-1.5 px-3.5 text-muted-fg truncate max-w-[300px]">{JSON.stringify((e as any).payload).slice(0, 100)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TOOLS */}
        {activeTab === "tools" && (
          <div className={cn(panelVariants({ variant: "inset" }), "rounded-xl flex-1 min-h-0 overflow-hidden")}>
            <div className="h-full overflow-y-auto">
              {toolsSummary.length === 0 ? <div className="text-xs text-muted-fg p-6 text-center">No tool calls yet</div> : (
                <table className="w-full">
                  <thead className="sticky top-0 bg-surface z-10">
                    <tr className="border-b border-border-base text-[10px] font-semibold text-muted-fg uppercase tracking-wider">
                      <th className="py-1.5 px-3.5 text-left w-32">Tool</th>
                      <th className="py-1.5 px-3.5 text-right w-20">Calls</th>
                      <th className="py-1.5 px-3.5 text-right w-20">Errors</th>
                      <th className="py-1.5 px-3.5 text-left">Used by</th>
                    </tr>
                  </thead>
                  <tbody>
                    {toolsSummary.map((t) => (
                      <tr key={t.name} className="border-b border-border-subtle text-xs">
                        <td className="py-2 px-3.5 text-orange-400 font-medium">{t.name}</td>
                        <td className="py-2 px-3.5 text-muted-fg text-right">{t.count}</td>
                        <td className={cn("py-2 px-3.5 text-right", t.errors > 0 ? "text-red-400" : "text-muted-fg")}>{t.errors}</td>
                        <td className="py-2 px-3.5"><div className="flex gap-1 flex-wrap">{t.agents.map((aid) => <span key={aid} className={statusPillVariants({ status: "idle" })}>{agentMap.get(aid)?.name ?? "?"}</span>)}</div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* FILES */}
        {activeTab === "files" && (
          <div className={cn(panelVariants({ variant: "inset" }), "rounded-xl flex-1 min-h-0 overflow-hidden")}>
            <div className="h-full overflow-y-auto">
              {fileSummary.length === 0 ? <div className="text-xs text-muted-fg p-6 text-center">No file changes detected</div> : (
                <table className="w-full">
                  <thead className="sticky top-0 bg-surface z-10">
                    <tr className="border-b border-border-base text-[10px] font-semibold text-muted-fg uppercase tracking-wider">
                      <th className="py-1.5 px-3.5 text-left w-20">Action</th>
                      <th className="py-1.5 px-3.5 text-left">Path</th>
                      <th className="py-1.5 px-3.5 text-left w-24">Agent</th>
                      <th className="py-1.5 px-3.5 text-left w-24">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fileSummary.map((f) => (
                      <tr key={f.path} className="border-b border-border-subtle text-xs font-mono">
                        <td className={cn("py-1.5 px-3.5", f.action === "create" ? "text-emerald-400" : f.action === "delete" ? "text-red-400" : "text-amber-400")}>{f.action}</td>
                        <td className="py-1.5 px-3.5 text-cyan-400 truncate max-w-[300px]">{f.path}</td>
                        <td className="py-1.5 px-3.5 text-muted-fg truncate max-w-[100px]">{agentMap.get(f.agent)?.name ?? "?"}</td>
                        <td className="py-1.5 px-3.5 text-muted-fg whitespace-nowrap">{new Date(f.ts).toLocaleTimeString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
    <div className="flex gap-6 h-full p-6 overflow-hidden">
      <div className="w-80 shrink-0 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers size={15} className="text-muted-fg" />
            <h2 className="text-sm font-semibold text-muted-fg">Sessions ({sessions.length})</h2>
          </div>
          <button onClick={() => setShowCreate(!showCreate)} className={buttonVariants({ variant: showCreate ? "ghost" : "outline", size: "xs" })}>
            {showCreate ? <><X size={10} /> Cancel</> : <><Plus size={10} /> New</>}
          </button>
        </div>

        <AnimatePresence>
          {showCreate && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
              <div className={cn(panelVariants({ variant: "surface" }), "p-4")}>
                <CreateSessionForm onCreated={() => setShowCreate(false)} presets={sessionPresets} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {sessions.length === 0 && !showCreate ? (
          <div className="border border-dashed border-border-base rounded-xl p-8 text-center space-y-3">
            <Layers size={24} className="text-muted-fg/50 mx-auto" />
            <div className="text-muted-fg text-sm font-medium">No sessions yet</div>
            <div className="text-muted-fg/70 text-xs leading-relaxed">Sessions let you group and coordinate multiple AI agents.<br />Use presets for a quick start.</div>
            <button onClick={() => setShowCreate(true)} className={buttonVariants({ variant: "outline", size: "sm" })}>
              <Plus size={11} /> Create your first session
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {[...sessions].sort((a, b) => b.createdAt - a.createdAt).map((s) => (
              <SessionCard key={s.id} session={s}
                selected={s.id === selectedId} onClick={() => setSelectedId(s.id === selectedId ? null : s.id)} onStop={() => stopSession(s.id)} />
            ))}
          </div>
        )}
      </div>

      {selectedSession && (
        <div className="flex-1 min-w-0">
          <SessionDetail session={selectedSession} runs={runs} agents={agents} events={events} />
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
