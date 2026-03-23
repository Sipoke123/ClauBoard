"use client";

import { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ClipboardDocumentListIcon, ArrowPathIcon, CheckCircleIcon, XCircleIcon, ClockIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { useStore } from "../../../lib/use-store";
import { cn } from "../../../lib/cn";
import { statusDotVariants } from "../../../lib/variants";
import type { Task, TaskStatus } from "@repo/shared";

const columns: { status: TaskStatus; label: string; icon: React.ReactNode; dotColor: string; headerBorder: string }[] = [
  {
    status: "pending",
    label: "Pending",
    icon: <ClockIcon className="w-[14px] h-[14px]" />,
    dotColor: "text-muted-fg",
    headerBorder: "border-border-base",
  },
  {
    status: "in_progress",
    label: "In Progress",
    icon: <ArrowPathIcon className="w-[14px] h-[14px] animate-spin" />,
    dotColor: "text-blue-400",
    headerBorder: "border-blue-500/50",
  },
  {
    status: "completed",
    label: "Completed",
    icon: <CheckCircleIcon className="w-[14px] h-[14px]" />,
    dotColor: "text-emerald-400",
    headerBorder: "border-emerald-500/50",
  },
  {
    status: "failed",
    label: "Failed",
    icon: <XCircleIcon className="w-[14px] h-[14px]" />,
    dotColor: "text-red-400",
    headerBorder: "border-red-500/50",
  },
];

const statusCardStyles: Record<TaskStatus, string> = {
  pending: "border-border-subtle bg-surface-inset",
  in_progress: "border-blue-500/20 bg-blue-500/[0.03]",
  completed: "border-emerald-500/20 bg-emerald-500/[0.03]",
  failed: "border-red-500/20 bg-red-500/[0.03]",
};

const CARD_HEIGHT = 80;
const CARD_GAP = 6;

function VirtualTaskColumn({ tasks, agentMap }: { tasks: Task[]; agentMap: Map<string, string> }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: tasks.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => CARD_HEIGHT + CARD_GAP,
    overscan: 10,
  });

  if (tasks.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-xs text-muted-fg/40">No tasks</p>
      </div>
    );
  }

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto">
      <div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
        {virtualizer.getVirtualItems().map((vRow) => {
          const task = tasks[vRow.index];
          const agentName = agentMap.get(task.agentId) ?? task.agentId;
          return (
            <div
              key={task.id}
              className="absolute w-full px-0.5"
              style={{ height: CARD_HEIGHT, top: vRow.start }}
            >
              <div
                className={cn(
                  "rounded-xl border p-3 h-full flex flex-col justify-between transition-colors hover:brightness-105",
                  statusCardStyles[task.status]
                )}
              >
                <div>
                  <div className="font-medium text-sm text-foreground truncate leading-tight">
                    {task.title}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className={cn(statusDotVariants({ status: task.status === "in_progress" ? "running" : task.status === "pending" ? "waiting" : task.status, size: "sm" }))} />
                    <span className="text-[11px] text-muted-fg truncate">{agentName}</span>
                  </div>
                </div>
                {task.error && (
                  <div className="flex items-center gap-1 mt-1">
                    <ExclamationTriangleIcon className="w-2.5 h-2.5 text-red-400 shrink-0" />
                    <span className="text-[10px] text-red-400/80 truncate">{task.error}</span>
                  </div>
                )}
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
    <div className="flex flex-col h-full p-3 md:p-6">
      <div className="flex items-center gap-2 mb-3 md:mb-5 shrink-0">
        <ClipboardDocumentListIcon className="w-[18px] h-[18px] text-muted-fg" />
        <h2 className="text-base md:text-lg font-semibold text-foreground">Task Board</h2>
        <span className="ml-1 text-xs text-muted-fg/50 tabular-nums">{tasks.length} tasks</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 flex-1 min-h-0">
        {columns.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.status);
          return (
            <div key={col.status} className="flex flex-col min-h-0">
              <div className={cn("border-t-2 pt-3 mb-3 shrink-0", col.headerBorder)}>
                <div className="flex items-center gap-2">
                  <span className={col.dotColor}>{col.icon}</span>
                  <h3 className="text-sm font-semibold text-foreground/80">{col.label}</h3>
                  {colTasks.length > 0 && (
                    <span className="ml-auto text-[11px] font-medium text-muted-fg/50 bg-foreground/[0.04] px-1.5 py-0.5 rounded-md tabular-nums">
                      {colTasks.length}
                    </span>
                  )}
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
