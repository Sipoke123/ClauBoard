"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WrenchIcon, CodeBracketIcon, BoltIcon, UsersIcon, RocketLaunchIcon, Square3Stack3DIcon, CodeBracketSquareIcon, CommandLineIcon, MagnifyingGlassIcon, CpuChipIcon, ShieldCheckIcon, UserIcon, ArrowTopRightOnSquareIcon, BuildingOffice2Icon } from "@heroicons/react/24/outline";
import { StopIcon } from "@heroicons/react/24/solid";
import type { Agent, AgentEvent, Run, Session } from "@repo/shared";
import { cn } from "../lib/cn";
import { statusDotVariants, statusPillVariants, buttonVariants, panelVariants, statusLabels } from "../lib/variants";
import { API_URL } from "../lib/api-url";

// ---------------------------------------------------------------------------
// Desk border glow by status
// ---------------------------------------------------------------------------

const agentIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Alice: CodeBracketSquareIcon, Bob: CommandLineIcon, Linter: MagnifyingGlassIcon, Carlos: CpuChipIcon, Diana: ShieldCheckIcon, Eve: CodeBracketIcon,
};

const iconColors: Record<string, string> = {
  working: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
  idle: "border-emerald-500/30 bg-emerald-500/5 text-emerald-400",
  error: "border-red-500/40 bg-red-500/10 text-red-400",
  blocked: "border-amber-500/40 bg-amber-500/10 text-amber-400",
  offline: "border-border-subtle bg-muted text-muted-fg",
  paused: "border-amber-500/30 bg-amber-500/10 text-amber-400",
};

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
    <motion.div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e: React.KeyboardEvent) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } }}
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={cn(
        "relative w-full h-[100px] md:h-[120px] text-left rounded-xl border transition-shadow cursor-pointer",
        glow,
        selected
          ? "ring-2 ring-foreground/20 shadow-lg"
          : "bg-surface/70 hover:shadow-lg",
      )}
    >
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-foreground/[0.03] via-transparent to-transparent pointer-events-none" />

      <div className="relative p-2 md:p-3 h-full flex flex-col">
        {/* Header: icon + name + status */}
        <div className="flex items-center gap-2 md:gap-2.5 shrink-0">
          <div className={cn(
            "flex h-7 w-7 md:h-9 md:w-9 shrink-0 items-center justify-center rounded-lg border backdrop-blur",
            iconColors[displayStatus] ?? iconColors.offline,
          )}>
            {(() => { const Icon = agentIcons[agent.name] ?? UserIcon; return <Icon className="h-3.5 w-3.5 md:h-[18px] md:w-[18px]" />; })()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="truncate text-xs font-semibold text-foreground leading-none">{agent.name}</h3>
              <span className={statusDotVariants({ status: displayStatus as any, size: "sm" })} />
            </div>
            {agent.role && <div className="text-[9px] text-muted-fg/50 uppercase tracking-wider leading-none mt-1">{agent.role}</div>}
          </div>
        </div>

        {/* Middle: task + activity */}
        <div className="flex-1 min-h-0 mt-1 md:mt-2 space-y-0.5">
          <p className="text-[9px] md:text-[10px] text-muted-fg truncate">
            {run?.config?.prompt ?? run?.description ?? "Idle"}
          </p>
          {lastActivity && (agent.status === "working" || agent.status === "blocked") && (
            <p className="text-[10px] font-mono text-muted-fg/60 truncate">{lastActivity}</p>
          )}
          {agent.status === "blocked" && agent.blockedReason && (
            <p className="text-[10px] text-amber-400/80 truncate">{agent.blockedReason}</p>
          )}
          {run?.error && (
            <p className="text-[10px] text-red-400/80 truncate">{run.error}</p>
          )}
        </div>

        {/* Footer: metrics pinned to bottom */}
        <div className="flex items-center justify-between shrink-0 pt-1">
          <div className="flex items-center gap-3 text-[10px] text-muted-fg">
            {toolCount > 0 && (
              <span className="flex items-center gap-1 text-amber-400/60">
                <WrenchIcon className="w-[9px] h-[9px]" /> {toolCount}
              </span>
            )}
            {fileCount > 0 && (
              <span className="flex items-center gap-1 text-cyan-400/60">
                <CodeBracketIcon className="w-[9px] h-[9px]" /> {fileCount}
              </span>
            )}
            {eventCount > 0 && (
              <span className="flex items-center gap-1">
                <BoltIcon className="w-[9px] h-[9px]" /> {eventCount}
              </span>
            )}
          </div>
          {run && (
            <span className="text-[9px] text-muted-fg uppercase tracking-wider">{statusLabels[displayStatus] ?? displayStatus}</span>
          )}
        </div>
      </div>
    </motion.div>
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
      className={cn(panelVariants({ variant: "room" }), "p-3 md:p-5")}
    >
      {/* Room header */}
      <div className="flex items-center justify-between gap-2 mb-3 md:mb-4">
        <div className="flex items-center gap-2 md:gap-3 flex-wrap min-w-0">
          <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
            <UsersIcon className={cn(
              "w-[13px] h-[13px] opacity-50",
              metrics?.working ? "text-emerald-400 opacity-100" : metrics?.failed ? "text-red-400 opacity-100" : "text-muted-fg",
            )} />
            <span className="text-[11px] md:text-xs font-semibold text-muted-fg uppercase tracking-wider">{label}</span>
          </div>

          {metrics && (
            <div className="flex items-center gap-1 md:gap-1.5 flex-wrap">
              {metrics.working > 0 && <span className={statusPillVariants({ status: "working" })}>{metrics.working} active</span>}
              {metrics.failed > 0 && <span className={statusPillVariants({ status: "failed" })}>{metrics.failed} failed</span>}
              {metrics.blocked > 0 && <span className={statusPillVariants({ status: "blocked" })}>{metrics.blocked} blocked</span>}
              {metrics.completed > 0 && metrics.working === 0 && metrics.failed === 0 && (
                <span className={statusPillVariants({ status: "completed" })}>{metrics.completed} done</span>
              )}
              <span className="hidden md:flex items-center gap-1 text-[10px] text-muted-fg">{metrics.toolCalls > 0 && <><WrenchIcon className="w-[9px] h-[9px]" />{metrics.toolCalls}</>}</span>
              <span className="hidden md:flex items-center gap-1 text-[10px] text-cyan-500/50">{metrics.fileChanges > 0 && <><CodeBracketIcon className="w-[9px] h-[9px]" />{metrics.fileChanges}</>}</span>
            </div>
          )}
        </div>

        <div className="flex gap-1.5 shrink-0">
          {onOpenSession && (
            <button onClick={onOpenSession} className={buttonVariants({ variant: "ghost", size: "xs" })}>
              <ArrowTopRightOnSquareIcon className="w-2.5 h-2.5" /> Details
            </button>
          )}
          {onStopAll && metrics && metrics.working > 0 && (
            <button onClick={onStopAll} className={buttonVariants({ variant: "danger", size: "xs" })}>
              <StopIcon className="w-2.5 h-2.5" /> Stop All
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3">
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
          <BuildingOffice2Icon className="w-6 h-6 text-muted-fg" />
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
              <RocketLaunchIcon className="w-[13px] h-[13px]" /> Launch Run
            </button>
          )}
          {onNavigateToSessions && (
            <button onClick={onNavigateToSessions} className={buttonVariants({ variant: "outline", size: "sm" })}>
              <Square3Stack3DIcon className="w-[13px] h-[13px]" /> New Session
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
      className="min-h-full p-3 md:p-6 space-y-3 md:space-y-5"
      style={{
        backgroundImage: `radial-gradient(circle, var(--grid-dot) 1px, transparent 1px)`,
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

