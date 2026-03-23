"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { RocketLaunchIcon, XMarkIcon, UsersIcon, Squares2X2Icon, SignalIcon, ArrowDownTrayIcon, BellIcon } from "@heroicons/react/24/outline";
import { useStore, useStoreSelector } from "../../../lib/use-store";
import { OfficeFloor } from "../../../components/office-floor";
import { AgentWorkflowCanvas } from "../../../components/agent-workflow-canvas";
import { AgentDetail } from "../../../components/agent-detail";
import { RunLauncher } from "../../../components/run-launcher";
import { cn } from "../../../lib/cn";
import { buttonVariants, statusPillVariants } from "../../../lib/variants";
import type { AlertData } from "../../../lib/store";


type ViewMode = "grid" | "canvas";

export default function OfficePage() {
  const { agents, runs, tasks, sessions, events } = useStore();
  const alerts = useStoreSelector((s) => s.alerts);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showLauncher, setShowLauncher] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);
  const [seenCount, setSeenCount] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>("canvas");
  const unreadAlerts = alerts.length - seenCount;

  const router = useRouter();
  const selectedAgent = agents.find((a) => a.id === selectedId);

  const working = agents.filter((a) => a.status === "working").length;
  const blocked = agents.filter((a) => a.status === "blocked").length;
  const errored = agents.filter((a) => a.status === "error").length;

  function exportAgents() {
    const agentRuns = new Map<string, typeof runs>();
    for (const r of runs) {
      const arr = agentRuns.get(r.agentId) ?? [];
      arr.push(r);
      agentRuns.set(r.agentId, arr);
    }
    const data = agents.map((a) => ({
      id: a.id,
      name: a.name,
      role: a.role,
      status: a.status,
      runs: (agentRuns.get(a.id) ?? []).map((r) => ({
        id: r.id,
        status: r.status,
        description: r.description,
        prompt: r.config?.prompt,
        startedAt: new Date(r.startedAt).toISOString(),
        completedAt: r.completedAt ? new Date(r.completedAt).toISOString() : null,
        error: r.error,
      })),
      events: events.filter((e) => e.agentId === a.id).length,
    }));
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `clauboard-export-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col h-full relative">
      {/* Office header bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between px-3 md:px-5 py-2 md:py-2.5 bg-background border-b border-border-base shrink-0 gap-2">
        <div className="flex items-center justify-between md:justify-start gap-3 md:gap-4">
          <div className="flex items-center gap-2 md:gap-4">
            <h2 className="text-sm font-semibold text-foreground">Office</h2>
            <div className="flex items-center gap-1.5 md:gap-2">
              {agents.length > 0 && (
                <span className="flex items-center gap-1 text-xs text-muted-fg">
                  <UsersIcon className="w-3 h-3" /> {agents.length}
                </span>
              )}
              {working > 0 && <span className={statusPillVariants({ status: "working" })}>{working} active</span>}
              {blocked > 0 && <span className={statusPillVariants({ status: "blocked" })}>{blocked} blocked</span>}
              {errored > 0 && <span className={statusPillVariants({ status: "error" })}>{errored} error</span>}
              {sessions.length > 0 && (
                <span className="hidden md:inline text-xs text-muted-fg">{sessions.length} session{sessions.length !== 1 ? "s" : ""}</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 md:gap-2">
          {/* View toggle */}
          <div className="flex items-center rounded-md border border-border-base bg-surface p-0.5 h-6 shrink-0">
            <button
              onClick={() => setViewMode("canvas")}
              className={cn(
                "flex items-center gap-1 px-1.5 md:px-2 h-full rounded text-[11px] font-medium transition-colors",
                viewMode === "canvas" ? "bg-foreground/[0.08] text-foreground" : "text-muted-fg hover:text-foreground",
              )}
            >
              <SignalIcon className="w-[11px] h-[11px]" /> <span className="hidden md:inline">Canvas</span>
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "flex items-center gap-1 px-1.5 md:px-2 h-full rounded text-[11px] font-medium transition-colors",
                viewMode === "grid" ? "bg-foreground/[0.08] text-foreground" : "text-muted-fg hover:text-foreground",
              )}
            >
              <Squares2X2Icon className="w-[11px] h-[11px]" /> <span className="hidden md:inline">Grid</span>
            </button>
          </div>
<div className="flex items-center rounded-md border border-border-base bg-surface p-0.5 h-6 shrink-0">
            <button
              onClick={() => setShowLauncher(!showLauncher)}
              className={cn(
                "flex items-center gap-1 px-1.5 md:px-2 h-full rounded text-[11px] font-medium transition-colors",
                showLauncher ? "bg-foreground/[0.08] text-foreground" : "text-muted-fg hover:text-foreground",
              )}
            >
              <RocketLaunchIcon className="w-[11px] h-[11px]" /> <span className="hidden md:inline">Launch Run</span>
            </button>
          </div>
          {/* Alerts */}
          <div className="relative shrink-0">
            <div className="flex items-center rounded-md border border-border-base bg-surface p-0.5 h-6">
              <button
                onClick={() => { setShowAlerts(!showAlerts); if (!showAlerts) setSeenCount(alerts.length); }}
                className={cn(
                  "flex items-center gap-1 px-1.5 md:px-2 h-full rounded text-[11px] font-medium transition-colors",
                  showAlerts ? "bg-foreground/[0.08] text-foreground" : "text-muted-fg hover:text-foreground",
                )}
              >
                <BellIcon className="w-[11px] h-[11px]" />
                <span className="hidden md:inline">Alerts</span>
              {unreadAlerts > 0 && (
                <span className="flex items-center justify-center min-w-[16px] h-4 rounded-full bg-red-500 text-white text-[9px] font-bold px-1">
                  {unreadAlerts > 99 ? "99+" : unreadAlerts}
                </span>
              )}
              </button>
            </div>
            {showAlerts && (
              <div className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto rounded-xl border border-border-base bg-background shadow-2xl z-50">
                <div className="p-3 border-b border-border-base flex items-center justify-between sticky top-0 bg-background z-10">
                  <span className="text-xs font-semibold text-foreground">Alerts ({alerts.length})</span>
                  <button onClick={() => setShowAlerts(false)} className="text-[10px] text-muted-fg hover:text-foreground focus-visible:text-foreground focus-visible:outline-none transition-colors">Close</button>
                </div>

                {alerts.length === 0 ? (
                  <div className="p-6 text-xs text-muted-fg/40 text-center">No alerts yet</div>
                ) : (
                  <div className="divide-y divide-border-subtle">
                    {[...alerts].reverse().slice(0, 50).map((a: AlertData) => {
                      const colors: Record<string, string> = {
                        critical: "border-l-red-500",
                        warning: "border-l-amber-500",
                        info: "border-l-muted-fg",
                      };
                      return (
                        <div key={a.id} className={cn("p-3 text-xs border-l-2", colors[a.severity] ?? colors.info)}>
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="font-semibold text-foreground">{a.title}</span>
                            <span className="text-[10px] text-muted-fg/40 tabular-nums">{new Date(a.ts).toLocaleTimeString()}</span>
                          </div>
                          <div className="text-muted-fg truncate">{a.detail}</div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <div className="flex-1 min-w-0 min-h-0 p-4 relative" onClick={() => showAlerts && setShowAlerts(false)}>
          {viewMode === "canvas" ? (
            <AgentWorkflowCanvas
              agents={agents}
              runs={runs}
              sessions={sessions}
              events={events}
              selectedAgentId={selectedId}
              onSelectAgent={setSelectedId}
            />
          ) : (
            <div className="h-full overflow-auto">
              <OfficeFloor
                agents={agents}
                runs={runs}
                sessions={sessions}
                events={events}
                selectedAgentId={selectedId}
                onSelectAgent={setSelectedId}
                onOpenSession={(sessionId) => { router.push(`/sessions?selected=${sessionId}`); }}
                onLaunchRun={() => setShowLauncher(true)}
                onNavigateToSessions={() => { router.push("/sessions"); }}
              />
            </div>
          )}

          {/* Export button (hidden on mobile) */}
          {agents.length > 0 && (
            <button
              onClick={exportAgents}
              className="hidden md:inline-flex absolute bottom-5 right-5 z-30 items-center gap-1.5 h-7 px-3 rounded-lg text-[11px] font-medium border border-border-base bg-surface/90 text-muted-fg hover:text-foreground hover:border-border-base hover:bg-surface backdrop-blur-md transition-all"
            >
              <ArrowDownTrayIcon className="w-[11px] h-[11px]" /> Export
            </button>
          )}
        </div>

        {/* Right sidebar: Detail or Launcher */}
        <AnimatePresence>
          {(selectedAgent || showLauncher) && (
            <>
              {/* Mobile backdrop */}
              <motion.div
                className="md:hidden fixed inset-0 z-40 bg-black/50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => { setSelectedId(null); setShowLauncher(false); }}
              />
              <motion.div
                key={showLauncher ? "launcher" : "detail"}
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: typeof window !== "undefined" && window.innerWidth < 768 ? "100%" : 420, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className={cn(
                  "shrink-0 border-l border-border-base bg-background overflow-hidden",
                  "max-md:fixed max-md:inset-y-0 max-md:right-0 max-md:z-50 max-md:border-l-0 max-md:shadow-2xl",
                )}
              >
                <div className="w-full md:w-[420px] h-full flex flex-col p-3 md:p-5 overflow-y-auto">
                {showLauncher ? (
                  <>
                    <div className="flex items-center justify-between mb-5 shrink-0">
                      <h3 className="text-xs font-semibold text-muted-fg uppercase tracking-wider">Launch Run</h3>
                      <button onClick={() => setShowLauncher(false)} className={buttonVariants({ variant: "ghost", size: "xs" })}>
                        <XMarkIcon className="w-3 h-3" /> Close
                      </button>
                    </div>
                    <RunLauncher onClose={() => setShowLauncher(false)} />
                  </>
                ) : selectedAgent ? (
                  <>
                    <div className="flex items-center justify-between mb-5 shrink-0">
                      <h3 className="text-xs font-semibold text-muted-fg uppercase tracking-wider">Agent Detail</h3>
                      <button onClick={() => setSelectedId(null)} className={buttonVariants({ variant: "ghost", size: "xs" })}>
                        <XMarkIcon className="w-3 h-3" /> Close
                      </button>
                    </div>
                    <div className="flex-1 min-h-0">
                      <AgentDetail agent={selectedAgent} runs={runs} tasks={tasks} events={events} />
                    </div>
                  </>
                ) : null}
              </div>
            </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
