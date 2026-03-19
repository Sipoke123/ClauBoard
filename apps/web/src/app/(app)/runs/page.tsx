"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { RotateCcw, StopCircle, Clock, Folder, Rocket } from "lucide-react";
import { useStore } from "../../../lib/use-store";
import { cn } from "../../../lib/cn";
import { statusDotVariants, statusPillVariants, buttonVariants, panelVariants, statusLabels } from "../../../lib/variants";
import type { Run } from "@repo/shared";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

function formatDuration(run: Run): string {
  if (!run.completedAt) return "running...";
  const ms = run.completedAt - run.startedAt;
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function RunRow({
  run, agentName, onRerun, onStop,
}: {
  run: Run; agentName: string; onRerun: (run: Run) => void; onStop: (runId: string) => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center gap-3 py-3 px-4 border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
    >
      <span className={cn(statusPillVariants({ status: run.status as any }), "w-20 justify-center")}>
        {statusLabels[run.status] ?? run.status}
      </span>
      <span className="text-zinc-400 text-sm w-24 shrink-0 truncate">{agentName}</span>
      <span className="text-zinc-300 text-sm flex-1 truncate min-w-0">
        {run.config?.prompt ?? run.description ?? run.id}
      </span>
      {run.config?.cwd && (
        <span className="flex items-center gap-1 text-zinc-600 text-xs truncate max-w-40">
          <Folder size={10} /> {run.config.cwd}
        </span>
      )}
      <span className="flex items-center gap-1 text-zinc-600 text-xs w-16 shrink-0 text-right">
        <Clock size={10} /> {formatDuration(run)}
      </span>
      <span className="text-zinc-700 text-xs w-32 shrink-0 text-right">
        {new Date(run.startedAt).toLocaleString()}
      </span>
      <div className="flex gap-1 shrink-0 w-16 justify-end">
        {run.status === "running" && (
          <button onClick={() => onStop(run.id)} className={buttonVariants({ variant: "danger", size: "xs" })}>
            <StopCircle size={10} />
          </button>
        )}
        {run.config && run.status !== "running" && (
          <button onClick={() => onRerun(run)} className={buttonVariants({ variant: "ghost", size: "xs" })}>
            <RotateCcw size={10} />
          </button>
        )}
      </div>
    </motion.div>
  );
}

export default function RunsPage() {
  const { runs, agents } = useStore();
  const [msg, setMsg] = useState<string | null>(null);

  const agentMap = new Map(agents.map((a) => [a.id, a.name]));
  const sortedRuns = [...runs].sort((a, b) => b.startedAt - a.startedAt);

  async function handleRerun(run: Run) {
    if (!run.config) return;
    setMsg(null);
    try {
      const res = await fetch(`${API_URL}/api/runs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: run.config.prompt, cwd: run.config.cwd, agentName: run.config.agentName }),
      });
      if (!res.ok) { const b = await res.json().catch(() => ({})); throw new Error(b.error ?? `HTTP ${res.status}`); }
      setMsg("Relaunched"); setTimeout(() => setMsg(null), 3000);
    } catch (err: any) { setMsg(`Error: ${err.message}`); }
  }

  async function handleStop(runId: string) {
    await fetch(`${API_URL}/api/runs/${runId}/stop`, { method: "POST" }).catch(() => {});
  }

  return (
    <div className="flex flex-col h-full p-6">
      <div className="flex items-center justify-between mb-5 shrink-0">
        <h2 className="text-lg font-semibold text-zinc-100">Run History</h2>
        {msg && (
          <span className={cn("text-xs", msg.startsWith("Error") ? "text-red-400" : "text-emerald-400")}>{msg}</span>
        )}
      </div>

      <div className={cn(panelVariants({ variant: "surface" }), "flex flex-col min-h-0 flex-1 overflow-hidden")}>
        <div className="flex gap-3 py-2 px-4 border-b border-white/[0.06] text-[11px] font-semibold text-zinc-500 uppercase tracking-wider shrink-0">
          <span className="w-20">Status</span>
          <span className="w-24">Agent</span>
          <span className="flex-1">Prompt</span>
          <span className="w-16 text-right">Duration</span>
          <span className="w-32 text-right">Started</span>
          <span className="w-16" />
        </div>
        <div className="flex-1 overflow-y-auto">
          {sortedRuns.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <Rocket size={20} className="text-zinc-700 mx-auto" />
              <div className="text-zinc-500 text-sm font-medium">No runs yet</div>
              <div className="text-zinc-700 text-xs">Launch a run from the Office page to see it here.</div>
            </div>
          ) : (
            sortedRuns.map((run) => (
              <RunRow key={run.id} run={run} agentName={agentMap.get(run.agentId) ?? "—"} onRerun={handleRerun} onStop={handleStop} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
