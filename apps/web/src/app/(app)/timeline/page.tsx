"use client";

import { useState } from "react";
import { Activity } from "lucide-react";
import { useStore } from "../../../lib/use-store";
import { cn } from "../../../lib/cn";
import { panelVariants, inputVariants, getEventColor } from "../../../lib/variants";
import type { AgentEvent } from "@repo/shared";

function EventRow({ event, agentName }: { event: AgentEvent; agentName: string }) {
  const color = getEventColor(event.type);
  return (
    <div className="flex items-start gap-3 py-2 px-3.5 border-b border-white/[0.04] text-xs font-mono hover:bg-white/[0.02] transition-colors">
      <span className="text-zinc-600 shrink-0 w-20">{new Date(event.ts).toLocaleTimeString()}</span>
      <span className="text-zinc-500 shrink-0 w-20 truncate">{agentName}</span>
      <span className={cn("shrink-0 w-36", color)}>{event.type}</span>
      <span className="text-zinc-600 truncate">{JSON.stringify((event as any).payload).slice(0, 120)}</span>
    </div>
  );
}

export default function TimelinePage() {
  const { events, agents } = useStore();
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [agentFilter, setAgentFilter] = useState<string>("all");

  const agentMap = new Map(agents.map((a) => [a.id, a.name]));
  const typeGroups = ["all", "agent.", "run.", "task.", "tool.", "terminal.", "file."];

  let filtered = [...events].reverse();
  if (typeFilter !== "all") filtered = filtered.filter((e) => e.type.startsWith(typeFilter));
  if (agentFilter !== "all") filtered = filtered.filter((e) => e.agentId === agentFilter);
  filtered = filtered.slice(0, 200);

  return (
    <div className="flex flex-col h-full p-6">
      <div className="flex items-center justify-between mb-5 shrink-0">
        <div className="flex items-center gap-2.5">
          <Activity size={18} className="text-zinc-500" />
          <h2 className="text-lg font-semibold text-zinc-100">Event Timeline</h2>
          <span className="text-xs text-zinc-600">{filtered.length} events</span>
        </div>
        <div className="flex gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className={cn(inputVariants({ size: "sm" }), "w-auto")}
          >
            {typeGroups.map((g) => (
              <option key={g} value={g}>{g === "all" ? "All types" : g + "*"}</option>
            ))}
          </select>
          <select
            value={agentFilter}
            onChange={(e) => setAgentFilter(e.target.value)}
            className={cn(inputVariants({ size: "sm" }), "w-auto")}
          >
            <option value="all">All agents</option>
            {agents.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className={cn(panelVariants({ variant: "surface" }), "flex flex-col min-h-0 flex-1 overflow-hidden")}>
        <div className="flex gap-3 py-2 px-3.5 border-b border-white/[0.06] text-[11px] font-semibold text-zinc-500 uppercase tracking-wider shrink-0">
          <span className="w-20">Time</span>
          <span className="w-20">Agent</span>
          <span className="w-36">Type</span>
          <span>Payload</span>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <Activity size={20} className="text-zinc-700 mx-auto" />
              <div className="text-zinc-500 text-sm font-medium">No events yet</div>
              <div className="text-zinc-700 text-xs">Events appear here as agents work. Launch a run to get started.</div>
            </div>
          ) : (
            filtered.map((e) => (
              <EventRow key={e.id} event={e} agentName={agentMap.get(e.agentId) ?? e.agentId} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
