"use client";

import { useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ArrowPathIcon, RocketLaunchIcon } from "@heroicons/react/24/outline";
import { StopIcon } from "@heroicons/react/24/solid";
import { useStore } from "../../../lib/use-store";
import { cn } from "../../../lib/cn";
import { statusPillVariants, buttonVariants, panelVariants, statusLabels } from "../../../lib/variants";
import type { Run } from "@repo/shared";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
const ROW_HEIGHT = 40;

function formatDuration(run: Run): string {
  if (!run.completedAt) return "running...";
  const ms = run.completedAt - run.startedAt;
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export default function RunsPage() {
  const { runs, agents } = useStore();
  const [msg, setMsg] = useState<string | null>(null);

  const agentMap = new Map(agents.map((a) => [a.id, a.name]));
  const sortedRuns = [...runs].sort((a, b) => b.startedAt - a.startedAt);

  const scrollRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: sortedRuns.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 20,
  });

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
        <div className="flex items-center gap-2.5">
          <h2 className="text-lg font-semibold text-foreground">Run History</h2>
          <span className="text-xs text-muted-fg/60">{sortedRuns.length} runs</span>
        </div>
        {msg && (
          <span className={cn("text-xs", msg.startsWith("Error") ? "text-red-400" : "text-emerald-400")}>{msg}</span>
        )}
      </div>

      <div className={cn(panelVariants({ variant: "surface" }), "flex flex-col min-h-0 flex-1 overflow-hidden")}>
        {/* Header */}
        <div className="flex items-center border-b border-border-base text-[11px] font-semibold text-muted-fg uppercase tracking-wider shrink-0" style={{ height: ROW_HEIGHT }}>
          <span className="w-24 px-4">Status</span>
          <span className="w-28 px-4">Agent</span>
          <span className="flex-1 px-4">Prompt</span>
          <span className="w-24 px-4 text-right">Duration</span>
          <span className="w-44 px-4 text-right">Started</span>
          <span className="w-16 px-4" />
        </div>

        {/* Virtualized rows */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          {sortedRuns.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center space-y-2">
                <RocketLaunchIcon className="w-5 h-5 text-muted-fg/60 mx-auto" />
                <div className="text-muted-fg text-sm font-medium">No runs yet</div>
                <div className="text-muted-fg/60 text-xs">Launch a run from the Office page to see it here.</div>
              </div>
            </div>
          ) : (
            <div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
              {virtualizer.getVirtualItems().map((vRow) => {
                const run = sortedRuns[vRow.index];
                const agentName = agentMap.get(run.agentId) ?? "—";
                return (
                  <div
                    key={run.id}
                    className="flex items-center border-b border-border-base hover:bg-foreground/5 transition-colors absolute w-full"
                    style={{ height: ROW_HEIGHT, top: vRow.start }}
                  >
                    <span className="w-24 px-4">
                      <span className={cn(statusPillVariants({ status: run.status as any }), "justify-center")}>
                        {statusLabels[run.status] ?? run.status}
                      </span>
                    </span>
                    <span className="w-28 px-4 text-muted-fg text-sm truncate">{agentName}</span>
                    <span className="flex-1 px-4 text-foreground/80 text-sm truncate">
                      {run.config?.prompt ?? run.description ?? run.id}
                    </span>
                    <span className="w-24 px-4 text-muted-fg/60 text-xs text-right whitespace-nowrap">
                      {formatDuration(run)}
                    </span>
                    <span className="w-44 px-4 text-muted-fg/60 text-xs text-right whitespace-nowrap">
                      {new Date(run.startedAt).toLocaleString()}
                    </span>
                    <span className="w-16 px-4 flex justify-end">
                      {run.status === "running" && (
                        <button onClick={() => handleStop(run.id)} className={buttonVariants({ variant: "danger", size: "xs" })}>
                          <StopIcon className="w-2.5 h-2.5" />
                        </button>
                      )}
                      {run.config && run.status !== "running" && (
                        <button onClick={() => handleRerun(run)} className={buttonVariants({ variant: "ghost", size: "xs" })}>
                          <ArrowPathIcon className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
