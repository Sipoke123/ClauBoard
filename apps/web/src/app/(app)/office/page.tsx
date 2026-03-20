"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Rocket, X, Users, LayoutGrid, Network } from "lucide-react";
import { useStore } from "../../../lib/use-store";
import { OfficeFloor } from "../../../components/office-floor";
import { AgentWorkflowCanvas } from "../../../components/agent-workflow-canvas";
import { AgentDetail } from "../../../components/agent-detail";
import { RunLauncher } from "../../../components/run-launcher";
import { cn } from "../../../lib/cn";
import { buttonVariants, statusPillVariants } from "../../../lib/variants";

type ViewMode = "grid" | "canvas";

export default function OfficePage() {
  const { agents, runs, tasks, sessions, events } = useStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showLauncher, setShowLauncher] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("canvas");

  const selectedAgent = agents.find((a) => a.id === selectedId);

  const working = agents.filter((a) => a.status === "working").length;
  const blocked = agents.filter((a) => a.status === "blocked").length;
  const errored = agents.filter((a) => a.status === "error").length;

  return (
    <div className="flex flex-col h-screen">
      {/* Office header bar */}
      <div className="flex items-center justify-between px-5 py-2.5 bg-zinc-900/60 border-b border-white/[0.06] shrink-0 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <h2 className="text-sm font-semibold text-zinc-200">Office</h2>
          <div className="flex items-center gap-2">
            {agents.length > 0 && (
              <span className="flex items-center gap-1.5 text-xs text-zinc-500">
                <Users size={12} /> {agents.length}
              </span>
            )}
            {working > 0 && <span className={statusPillVariants({ status: "working" })}>{working} active</span>}
            {blocked > 0 && <span className={statusPillVariants({ status: "blocked" })}>{blocked} blocked</span>}
            {errored > 0 && <span className={statusPillVariants({ status: "error" })}>{errored} error</span>}
            {sessions.length > 0 && (
              <span className="text-xs text-zinc-600">{sessions.length} session{sessions.length !== 1 ? "s" : ""}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center rounded-lg border border-white/[0.06] bg-zinc-900/60 p-0.5">
            <button
              onClick={() => setViewMode("canvas")}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors",
                viewMode === "canvas" ? "bg-white/[0.08] text-zinc-100" : "text-zinc-500 hover:text-zinc-300",
              )}
            >
              <Network size={12} /> Canvas
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors",
                viewMode === "grid" ? "bg-white/[0.08] text-zinc-100" : "text-zinc-500 hover:text-zinc-300",
              )}
            >
              <LayoutGrid size={12} /> Grid
            </button>
          </div>
          <button
            onClick={() => setShowLauncher(!showLauncher)}
            className={buttonVariants({ variant: showLauncher ? "ghost" : "primary", size: "sm" })}
          >
            {showLauncher ? <><X size={13} /> Close</> : <><Rocket size={13} /> Launch Run</>}
          </button>
        </div>
      </div>

      {/* Launcher panel */}
      {showLauncher && (
        <div className="border-b border-white/[0.06] bg-zinc-900/40">
          <div className="px-5 py-4 max-w-lg">
            <RunLauncher onClose={() => setShowLauncher(false)} />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <div className="flex-1 min-w-0 min-h-0 p-4">
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
                onOpenSession={(sessionId) => { window.location.href = `/sessions?selected=${sessionId}`; }}
                onLaunchRun={() => setShowLauncher(true)}
                onNavigateToSessions={() => { window.location.href = "/sessions"; }}
              />
            </div>
          )}
        </div>

        {/* Detail sidebar */}
        <AnimatePresence>
          {selectedAgent && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 420, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="shrink-0 border-l border-white/[0.06] bg-zinc-950 overflow-hidden"
            >
              <div className="w-[420px] h-full flex flex-col p-5">
                <div className="flex items-center justify-between mb-5 shrink-0">
                  <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Agent Detail</h3>
                  <button onClick={() => setSelectedId(null)} className={buttonVariants({ variant: "ghost", size: "xs" })}>
                    <X size={12} /> Close
                  </button>
                </div>
                <div className="flex-1 min-h-0">
                  <AgentDetail agent={selectedAgent} runs={runs} tasks={tasks} events={events} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
