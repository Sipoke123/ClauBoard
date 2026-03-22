"use client";

import { useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ChartBarIcon } from "@heroicons/react/24/outline";
import { useStore } from "../../../lib/use-store";
import { cn } from "../../../lib/cn";
import { panelVariants, inputVariants, getEventColor } from "../../../lib/variants";
import type { AgentEvent } from "@repo/shared";

const ROW_HEIGHT = 32;

export default function TimelinePage() {
  const { events, agents } = useStore();
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [agentFilter, setAgentFilter] = useState<string>("all");

  const agentMap = new Map(agents.map((a) => [a.id, a.name]));
  const typeGroups = ["all", "agent.", "run.", "task.", "tool.", "terminal.", "file."];

  const seen = new Set<string>();
  let filtered = [...events].reverse().filter((e) => {
    if (seen.has(e.id)) return false;
    seen.add(e.id);
    return true;
  });
  if (typeFilter !== "all") filtered = filtered.filter((e) => e.type.startsWith(typeFilter));
  if (agentFilter !== "all") filtered = filtered.filter((e) => e.agentId === agentFilter);

  const scrollRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: filtered.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 20,
  });

  return (
    <div className="flex flex-col h-full p-6">
      <div className="flex items-center justify-between mb-5 shrink-0">
        <div className="flex items-center gap-2.5">
          <ChartBarIcon className="w-[18px] h-[18px] text-muted-fg" />
          <h2 className="text-lg font-semibold text-foreground">Event Timeline</h2>
          <span className="text-xs text-muted-fg/60">{filtered.length} events</span>
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
        {/* Header */}
        <div className="flex items-center border-b border-border-base text-[11px] font-semibold text-muted-fg uppercase tracking-wider shrink-0" style={{ height: ROW_HEIGHT }}>
          <span className="w-24 px-4">Time</span>
          <span className="w-28 px-4">Agent</span>
          <span className="w-40 px-4">Type</span>
          <span className="flex-1 px-4">Payload</span>
        </div>

        {/* Virtualized rows */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center space-y-2">
                <ChartBarIcon className="w-5 h-5 text-muted-fg/60 mx-auto" />
                <div className="text-muted-fg text-sm font-medium">No events yet</div>
                <div className="text-muted-fg/60 text-xs">Events appear here as agents work. Launch a run to get started.</div>
              </div>
            </div>
          ) : (
            <div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
              {virtualizer.getVirtualItems().map((virtualRow) => {
                const event = filtered[virtualRow.index];
                const color = getEventColor(event.type);
                return (
                  <div
                    key={event.id}
                    className="flex items-center border-b border-border-base font-mono text-xs hover:bg-foreground/5 transition-colors absolute w-full"
                    style={{ height: ROW_HEIGHT, top: virtualRow.start }}
                  >
                    <span className="w-24 px-4 text-muted-fg/60 whitespace-nowrap">{new Date(event.ts).toLocaleTimeString()}</span>
                    <span className="w-28 px-4 text-muted-fg truncate">{agentMap.get(event.agentId) ?? event.agentId}</span>
                    <span className={cn("w-40 px-4 whitespace-nowrap", color)}>{event.type}</span>
                    <span className="flex-1 px-4 text-muted-fg/60 truncate">{JSON.stringify((event as any).payload).slice(0, 120)}</span>
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
