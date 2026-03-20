"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Square, AlertTriangle, HelpCircle, StopCircle, Play, ExternalLink, Wrench, FileCode, Zap, Users, Rocket, Layers } from "lucide-react";
import type { Agent, AgentEvent, Run, Session } from "@repo/shared";
import { cn } from "../lib/cn";
import { statusDotVariants, statusPillVariants, buttonVariants, panelVariants, statusLabels } from "../lib/variants";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

// ---------------------------------------------------------------------------
// Desk border glow by status
// ---------------------------------------------------------------------------

const deskGlow: Record<string, string> = {
  working: "border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.08)]",
  idle: "border-emerald-500/20",
  error: "border-red-500/40 shadow-[0_0_20px_rgba(239,68,68,0.08)]",
  blocked: "border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.08)]",
  offline: "border-border-subtle",
  paused: "border-amber-500/30",
};


// ---------------------------------------------------------------------------
// Per-agent metrics
// ---------------------------------------------------------------------------

interface AgentMeta {
  agent: Agent;
  run?: Run;
  eventCount: number;
  toolCount: number;
  fileCount: number;
  hasError: boolean;
  lastEventTs: number;
  /** Human-readable description of the latest activity */
  lastActivity?: string;
  lastActivityType?: string;
}

function describeActivity(event: AgentEvent): { text: string; type: string } | null {
  const p = (event as any).payload;
  switch (event.type) {
    case "tool.invoked":
      return { text: `${p.tool} ${p.input ?? ""}`.trim(), type: "tool" };
    case "tool.result":
      return { text: `${p.tool} done (${p.durationMs}ms)`, type: "tool-done" };
    case "tool.error":
      return { text: `${p.tool} failed`, type: "tool-error" };
    case "file.changed":
      return { text: `${p.action} ${p.path}`, type: "file" };
    case "task.created":
      return { text: p.title, type: "task" };
    case "task.completed":
      return { text: `Done: ${p.result ?? "task completed"}`, type: "task-done" };
    case "terminal.output":
      return { text: (p.text as string).split("\n")[0].slice(0, 80), type: "terminal" };
    default:
      return null;
  }
}

function computeAgentMetas(agents: Agent[], runs: Run[], events: AgentEvent[]): Map<string, AgentMeta> {
  const map = new Map<string, AgentMeta>();
  for (const a of agents) {
    const agentRuns = runs.filter((r) => r.agentId === a.id);
    const currentRun = agentRuns.find((r) => r.status === "running") ?? agentRuns[agentRuns.length - 1];
    const agentEvents = events.filter((e) => e.agentId === a.id);
    const lastEvent = agentEvents[agentEvents.length - 1];

    // Find last meaningful activity
    let lastActivity: string | undefined;
    let lastActivityType: string | undefined;
    for (let i = agentEvents.length - 1; i >= 0; i--) {
      const desc = describeActivity(agentEvents[i]);
      if (desc) {
        lastActivity = desc.text;
        lastActivityType = desc.type;
        break;
      }
    }

    map.set(a.id, {
      agent: a,
      run: currentRun,
      eventCount: agentEvents.length,
      toolCount: agentEvents.filter((e) => e.type === "tool.invoked").length,
      fileCount: agentEvents.filter((e) => e.type === "file.changed").length,
      hasError: a.status === "error" || agentRuns.some((r) => r.status === "failed"),
      lastEventTs: lastEvent?.ts ?? 0,
      lastActivity,
      lastActivityType,
    });
  }
  return map;
}

function sortByName(agents: Agent[]): Agent[] {
  return [...agents].sort((a, b) => a.name.localeCompare(b.name));
}

// ---------------------------------------------------------------------------
// Agent desk
// ---------------------------------------------------------------------------

function AgentDesk({ meta, selected, onClick }: { meta: AgentMeta; selected: boolean; onClick: () => void }) {
  const { agent, run, eventCount, toolCount, fileCount, lastActivity } = meta;
  const isPaused = agent.status === "idle" && run?.status === "stopped";
  const displayStatus = isPaused ? "paused" : agent.status;
  const glow = deskGlow[displayStatus] ?? deskGlow.offline;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e: React.KeyboardEvent) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } }}
      className={cn(
        "relative w-full text-left rounded-xl border transition-all cursor-pointer",
        glow,
        selected
          ? "ring-2 ring-blue-500/60 ring-offset-1 ring-offset-background bg-muted/60"
          : "bg-surface/70 hover:bg-muted/50 hover:shadow-lg",
      )}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/[0.03] via-transparent to-transparent pointer-events-none" />

      <div className="relative p-3 space-y-2">
        {/* Header */}
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className={statusDotVariants({ status: displayStatus as any, size: "sm" })} />
              <span className="text-[9px] uppercase tracking-wider text-muted-fg font-medium">
                {statusLabels[displayStatus] ?? displayStatus}
              </span>
            </div>
            <h3 className="truncate text-xs font-semibold text-foreground">
              {agent.name}
            </h3>
          </div>
        </div>

        {/* Task */}
        <p className="text-[10px] leading-relaxed text-muted-fg truncate">
          {run?.config?.prompt ?? run?.description ?? "No active task"}
        </p>

        {/* Live activity */}
        {lastActivity && (agent.status === "working" || agent.status === "blocked") && (
          <p className="text-[10px] font-mono text-muted-fg truncate">
            {lastActivity}
          </p>
        )}

        {agent.status === "blocked" && agent.blockedReason && (
          <div className="text-[10px] text-amber-400/80 truncate">{agent.blockedReason}</div>
        )}
        {run?.error && (
          <div className="text-[10px] text-red-400/80 truncate">{run.error}</div>
        )}

        {/* Footer metrics */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-[10px] text-muted-fg">
            {toolCount > 0 && (
              <span className="flex items-center gap-1 text-orange-400/60">
                <Wrench size={9} /> {toolCount}
              </span>
            )}
            {fileCount > 0 && (
              <span className="flex items-center gap-1 text-cyan-400/60">
                <FileCode size={9} /> {fileCount}
              </span>
            )}
            {eventCount > 0 && (
              <span className="flex items-center gap-1">
                <Zap size={9} /> {eventCount}
              </span>
            )}
          </div>
          {run && (
            <div className="flex items-center gap-1 text-[9px] text-muted-fg">
              <span className="uppercase tracking-wider">{run?.status ?? "idle"}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Room
// ---------------------------------------------------------------------------

interface RoomMetrics {
  total: number; working: number; completed: number; failed: number; blocked: number; stopped: number; toolCalls: number; fileChanges: number;
}

function computeRoomMetrics(agentMetas: AgentMeta[], runs: Run[], sessionRunIds: string[]): RoomMetrics {
  const sessionRuns = sessionRunIds.map((id) => runs.find((r) => r.id === id)).filter(Boolean) as Run[];
  return {
    total: agentMetas.length,
    working: agentMetas.filter((m) => m.agent.status === "working").length,
    completed: sessionRuns.filter((r) => r.status === "completed").length,
    failed: sessionRuns.filter((r) => r.status === "failed").length,
    blocked: agentMetas.filter((m) => m.agent.status === "blocked").length,
    stopped: sessionRuns.filter((r) => r.status === "stopped").length,
    toolCalls: agentMetas.reduce((s, m) => s + m.toolCount, 0),
    fileChanges: agentMetas.reduce((s, m) => s + m.fileCount, 0),
  };
}

function Room({
  label, sessionStatus, metrics, children, onStopAll, onOpenSession,
}: {
  label: string; sessionStatus?: string; metrics?: RoomMetrics; children: React.ReactNode;
  onStopAll?: () => void; onOpenSession?: () => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(panelVariants({ variant: "room" }), "p-5")}
    >
      {/* Room header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Users size={13} className={cn(
              "opacity-50",
              metrics?.working ? "text-emerald-400 opacity-100" : metrics?.failed ? "text-red-400 opacity-100" : "text-muted-fg",
            )} />
            <span className="text-xs font-semibold text-muted-fg uppercase tracking-wider">{label}</span>
          </div>

          {metrics && (
            <div className="flex items-center gap-1.5">
              {metrics.working > 0 && <span className={statusPillVariants({ status: "working" })}>{metrics.working} active</span>}
              {metrics.failed > 0 && <span className={statusPillVariants({ status: "failed" })}>{metrics.failed} failed</span>}
              {metrics.blocked > 0 && <span className={statusPillVariants({ status: "blocked" })}>{metrics.blocked} blocked</span>}
              {metrics.completed > 0 && metrics.working === 0 && metrics.failed === 0 && (
                <span className={statusPillVariants({ status: "completed" })}>{metrics.completed} done</span>
              )}
              {metrics.toolCalls > 0 && (
                <span className="flex items-center gap-1 text-[10px] text-muted-fg"><Wrench size={9} />{metrics.toolCalls}</span>
              )}
              {metrics.fileChanges > 0 && (
                <span className="flex items-center gap-1 text-[10px] text-cyan-500/50"><FileCode size={9} />{metrics.fileChanges}</span>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-1.5">
          {onOpenSession && (
            <button onClick={onOpenSession} className={buttonVariants({ variant: "ghost", size: "xs" })}>
              <ExternalLink size={10} /> Details
            </button>
          )}
          {onStopAll && metrics && metrics.working > 0 && (
            <button onClick={onStopAll} className={buttonVariants({ variant: "danger", size: "xs" })}>
              <StopCircle size={10} /> Stop All
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {children}
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function OfficeEmptyState({ onLaunchRun, onNavigateToSessions }: { onLaunchRun?: () => void; onNavigateToSessions?: () => void }) {
  return (
    <div className="h-full flex items-center justify-center">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-5 max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-surface border border-border-base flex items-center justify-center mx-auto">
          <Building2 size={24} className="text-muted-fg" />
        </div>
        <div>
          <div className="text-foreground text-sm font-medium">The office is empty</div>
          <div className="text-muted-fg text-xs mt-1.5 leading-relaxed">
            Launch a single agent run or create a multi-agent session to get started.
          </div>
        </div>
        <div className="flex items-center justify-center gap-3">
          {onLaunchRun && (
            <button onClick={onLaunchRun} className={buttonVariants({ variant: "primary", size: "sm" })}>
              <Rocket size={13} /> Launch Run
            </button>
          )}
          {onNavigateToSessions && (
            <button onClick={onNavigateToSessions} className={buttonVariants({ variant: "outline", size: "sm" })}>
              <Layers size={13} /> New Session
            </button>
          )}
        </div>
        <div className="text-[10px] text-muted-fg space-y-1">
          <div>Use presets for a quick demo, or enter a custom prompt.</div>
          <div>Try <span className="text-foreground/60">npm run dev:mock</span> for simulated agents.</div>
        </div>
      </motion.div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Office floor
// ---------------------------------------------------------------------------

export function OfficeFloor({
  agents, runs, sessions, events, selectedAgentId, onSelectAgent, onOpenSession, onLaunchRun, onNavigateToSessions,
}: {
  agents: Agent[]; runs: Run[]; sessions: Session[]; events: AgentEvent[];
  selectedAgentId: string | null; onSelectAgent: (id: string | null) => void;
  onOpenSession?: (sessionId: string) => void;
  onLaunchRun?: () => void;
  onNavigateToSessions?: () => void;
}) {
  const agentMetas = useMemo(() => computeAgentMetas(agents, runs, events), [agents, runs, events]);

  const sessionGroups = useMemo(() => {
    const groups: { session: Session; agents: Agent[]; metas: AgentMeta[] }[] = [];
    const sessionAgentIds = new Set<string>();

    for (const session of [...sessions].sort((a, b) => b.createdAt - a.createdAt)) {
      const sessionRuns = session.runIds.map((id) => runs.find((r) => r.id === id)).filter(Boolean) as Run[];
      const sessionAgents = sessionRuns.map((r) => agents.find((a) => a.id === r.agentId)).filter(Boolean) as Agent[];
      if (sessionAgents.length > 0) {
        const sorted = sortByName(sessionAgents);
        groups.push({ session, agents: sorted, metas: sorted.map((a) => agentMetas.get(a.id)!).filter(Boolean) });
        for (const a of sessionAgents) sessionAgentIds.add(a.id);
      }
    }

    return { groups, standalone: sortByName(agents.filter((a) => !sessionAgentIds.has(a.id))) };
  }, [agents, runs, sessions, agentMetas]);

  async function stopSession(sessionId: string) {
    await fetch(`${API_URL}/api/sessions/${sessionId}/stop`, { method: "POST" }).catch(() => {});
  }

  if (agents.length === 0) {
    return (
      <OfficeEmptyState
        onLaunchRun={onLaunchRun}
        onNavigateToSessions={onNavigateToSessions}
      />
    );
  }

  return (
    <div
      className="min-h-full p-6 space-y-5"
      style={{
        backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)`,
        backgroundSize: "20px 20px",
      }}
    >
      <AnimatePresence mode="popLayout">
        {sessionGroups.groups.map(({ session, agents: sessionAgents, metas }) => {
          const metrics = computeRoomMetrics(metas, runs, session.runIds);
          return (
            <Room
              key={session.id}
              label={session.name}
              sessionStatus={session.status}
              metrics={metrics}
              onStopAll={() => stopSession(session.id)}
              onOpenSession={onOpenSession ? () => onOpenSession(session.id) : undefined}
            >
              {sessionAgents.map((agent) => (
                <AgentDesk
                  key={agent.id}
                  meta={agentMetas.get(agent.id)!}
                  selected={agent.id === selectedAgentId}
                  onClick={() => onSelectAgent(agent.id === selectedAgentId ? null : agent.id)}
                />
              ))}
            </Room>
          );
        })}

        {sessionGroups.standalone.length > 0 && (
          <Room label={sessionGroups.groups.length > 0 ? "Common Area" : "Agents"}>
            {sessionGroups.standalone.map((agent) => (
              <AgentDesk
                key={agent.id}
                meta={agentMetas.get(agent.id)!}
                selected={agent.id === selectedAgentId}
                onClick={() => onSelectAgent(agent.id === selectedAgentId ? null : agent.id)}
              />
            ))}
          </Room>
        )}
      </AnimatePresence>
    </div>
  );
}

// Re-export Building2 for empty state in other files
import { Building2 } from "lucide-react";
