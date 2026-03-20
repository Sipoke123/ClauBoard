"use client";

import { ListChecks, Loader2, CheckCircle, XCircle } from "lucide-react";
import { useStore } from "../../../lib/use-store";
import { cn } from "../../../lib/cn";
import { panelVariants, statusDotVariants } from "../../../lib/variants";
import type { Task, TaskStatus } from "@repo/shared";

const columns: { status: TaskStatus; label: string; icon: React.ReactNode; accent: string }[] = [
  { status: "in_progress", label: "In Progress", icon: <Loader2 size={13} className="text-blue-400 animate-spin" />, accent: "border-blue-500/40" },
  { status: "completed", label: "Completed", icon: <CheckCircle size={13} className="text-emerald-400" />, accent: "border-emerald-500/40" },
  { status: "failed", label: "Failed", icon: <XCircle size={13} className="text-red-400" />, accent: "border-red-500/40" },
];

function TaskCard({ task, agentName }: { task: Task; agentName: string }) {
  return (
    <div className={cn(panelVariants({ variant: "inset" }), "rounded-xl p-3")}>
      <div className="font-medium text-sm text-foreground/80 truncate">{task.title}</div>
      <div className="text-[11px] text-muted-fg mt-1">{agentName}</div>
      {task.error && <div className="text-[11px] text-red-400/80 mt-1.5 truncate">{task.error}</div>}
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
      </div>
      <div className="grid grid-cols-3 gap-4 flex-1 min-h-0">
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
              <div className="space-y-2 flex-1 overflow-y-auto">
                {colTasks.length === 0 ? (
                  <div className="text-xs text-muted-fg/60 text-center py-6">No tasks</div>
                ) : (
                  colTasks.map((t) => (
                    <TaskCard key={t.id} task={t} agentName={agentMap.get(t.agentId) ?? t.agentId} />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
