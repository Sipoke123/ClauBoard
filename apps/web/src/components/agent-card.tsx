"use client";

import type { Agent } from "@repo/shared";

const statusColors: Record<string, string> = {
  idle: "bg-gray-500",
  working: "bg-green-500 animate-pulse",
  blocked: "bg-yellow-500 animate-pulse",
  error: "bg-red-500",
  offline: "bg-gray-700",
};

const statusLabels: Record<string, string> = {
  idle: "Idle",
  working: "Working",
  blocked: "Blocked",
  error: "Error",
  offline: "Offline",
};

export function AgentCard({
  agent,
  selected,
  onClick,
}: {
  agent: Agent;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-lg border transition-colors ${
        selected
          ? "border-emerald-500 bg-gray-800"
          : "border-gray-800 bg-gray-900 hover:border-gray-700"
      }`}
    >
      <div className="flex items-center gap-3">
        <span className={`w-3 h-3 rounded-full shrink-0 ${statusColors[agent.status]}`} />
        <div className="min-w-0">
          <div className="font-medium text-sm truncate">{agent.name}</div>
          <div className="text-xs text-gray-500">{statusLabels[agent.status]}</div>
        </div>
      </div>
      {agent.currentTaskId && (
        <div className="mt-2 text-xs text-gray-400 truncate">
          Task: {agent.currentTaskId}
        </div>
      )}
    </button>
  );
}
