"use client";

import { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ListChecks, Loader2, CheckCircle, XCircle, Clock } from "lucide-react";
import { useStore } from "../../../lib/use-store";
import { cn } from "../../../lib/cn";
import { panelVariants } from "../../../lib/variants";
import type { Task, TaskStatus } from "@repo/shared";

const columns: { status: TaskStatus; label: string; icon: React.ReactNode; accent: string }[] = [
  { status: "pending", label: "Pending", icon: <Clock size={13} className="text-muted-fg" />, accent: "border-border-base" },
  { status: "in_progress", label: "In Progress", icon: <Loader2 size={13} className="text-blue-400 animate-spin" />, accent: "border-blue-500/40" },
  { status: "completed", label: "Completed", icon: <CheckCircle size={13} className="text-emerald-400" />, accent: "border-emerald-500/40" },
  { status: "failed", label: "Failed", icon: <XCircle size={13} className="text-red-400" />, accent: "border-red-500/40" },
];

const CARD_HEIGHT = 64;
const CARD_GAP = 8;

function VirtualTaskColumn({ tasks, agentMap }: { tasks: Task[]; agentMap: Map<string, string> }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: tasks.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => CARD_HEIGHT + CARD_GAP,
    overscan: 10,
  });

  if (tasks.length === 0) {
    return <div className="text-xs text-muted-fg/60 text-center py-6">No tasks</div>;
  }

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto">
      <div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
        {virtualizer.getVirtualItems().map((vRow) => {
          const task = tasks[vRow.index];
          return (
            <div
              key={task.id}
              className="absolute w-full"
              style={{ height: CARD_HEIGHT, top: vRow.start }}
            >
              <div className={cn(panelVariants({ variant: "inset" }), "rounded-xl p-3 h-full")}>
                <div className="font-medium text-sm text-foreground/80 truncate">{task.title}</div>
                <div className="text-[11px] text-muted-fg mt-1">{agentMap.get(task.agentId) ?? task.agentId}</div>
                {task.error && <div className="text-[11px] text-red-400/80 mt-1 truncate">{task.error}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function TasksPage() {
  const { tasks, agents } = useStore();
  const agentMap = new Map(agents.map((a) => [a.id, a.name]));

  return (
    <div className="flex flex-col h-full p-6">
      <div className="flex items-center gap-2.5 mb-5 shrink-0">
        <ListChecks size={18} className="text-muted-fg" />
        <h2 className="text-lg font-semibold text-foreground">Task Board</h2>
        <span className="text-xs text-muted-fg/60">{tasks.length} tasks</span>
      </div>
      <div className="grid grid-cols-4 gap-4 flex-1 min-h-0">
        {columns.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.status);
          return (
            <div key={col.status} className="flex flex-col min-h-0">
              <div className={cn("border-t-2 pt-3 mb-3 shrink-0", col.accent)}>
                <div className="flex items-center gap-2">
                  {col.icon}
                  <h3 className="text-sm font-semibold text-muted-fg">{col.label}</h3>
                  <span className="text-xs text-muted-fg/60">{colTasks.length}</span>
                </div>
              </div>
              <VirtualTaskColumn tasks={colTasks} agentMap={agentMap} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
