"use client";

import { motion, type PanInfo } from "framer-motion";
import type React from "react";
import { useRef, useState, useMemo } from "react";
import { flushSync } from "react-dom";
import {
  ArrowRight,
  Wrench,
  FileCode,
  Zap,
  User,
  Shield,
  Code,
  Terminal,
  FileSearch,
  Cpu,
} from "lucide-react";
import type { Agent, AgentEvent, Run, Session } from "@repo/shared";
import { cn } from "../lib/cn";
import { statusDotVariants, statusLabels } from "../lib/variants";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AgentNode {
  id: string;
  agent: Agent;
  run?: Run;
  position: { x: number; y: number };
  eventCount: number;
  toolCount: number;
  fileCount: number;
  lastActivity?: string;
}

interface AgentConnection {
  from: string;
  to: string;
  status: "active" | "completed" | "blocked" | "idle";
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const NODE_WIDTH = 220;
const NODE_HEIGHT = 120;

const agentIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Alice: Code,
  Bob: Terminal,
  Linter: FileSearch,
  Carlos: Cpu,
  Diana: Shield,
  Eve: FileCode,
};

const agentColors: Record<string, string> = {
  working: "border-emerald-500/50 bg-emerald-500/5",
  idle: "border-emerald-500/30 bg-emerald-500/5",
  blocked: "border-amber-500/50 bg-amber-500/5",
  error: "border-red-500/50 bg-red-500/5",
  offline: "border-zinc-700/50 bg-zinc-800/30",
  paused: "border-amber-500/40 bg-amber-500/5",
};

const iconColors: Record<string, string> = {
  working: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
  idle: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  blocked: "border-amber-500/40 bg-amber-500/10 text-amber-400",
  error: "border-red-500/40 bg-red-500/10 text-red-400",
  offline: "border-zinc-600/40 bg-zinc-700/20 text-zinc-500",
  paused: "border-amber-500/30 bg-amber-500/10 text-amber-400",
};

// ---------------------------------------------------------------------------
// Connection Line
// ---------------------------------------------------------------------------

const connectionStyles: Record<string, { stroke: string; dot: string; width: number; dash: string; opacity: number }> = {
  active:    { stroke: "rgba(16, 185, 129, 0.5)",  dot: "rgba(16, 185, 129, 0.7)",  width: 2.5, dash: "",    opacity: 1 },
  completed: { stroke: "rgba(139, 92, 246, 0.3)",  dot: "rgba(139, 92, 246, 0.5)",  width: 2,   dash: "8,6", opacity: 0.8 },
  blocked:   { stroke: "rgba(239, 68, 68, 0.4)",   dot: "rgba(239, 68, 68, 0.6)",   width: 2,   dash: "4,4", opacity: 1 },
  idle:      { stroke: "rgba(161, 161, 170, 0.15)", dot: "rgba(161, 161, 170, 0.25)", width: 1.5, dash: "8,6", opacity: 0.6 },
};

function ConnectionLine({
  from,
  to,
  status,
  nodes,
}: {
  from: string;
  to: string;
  status: string;
  nodes: AgentNode[];
}) {
  const fromNode = nodes.find((n) => n.id === from);
  const toNode = nodes.find((n) => n.id === to);
  if (!fromNode || !toNode) return null;

  const startX = fromNode.position.x + NODE_WIDTH;
  const startY = fromNode.position.y + NODE_HEIGHT / 2;
  const endX = toNode.position.x;
  const endY = toNode.position.y + NODE_HEIGHT / 2;

  const cp1X = startX + (endX - startX) * 0.5;
  const cp2X = endX - (endX - startX) * 0.5;

  const d = `M${startX},${startY} C${cp1X},${startY} ${cp2X},${endY} ${endX},${endY}`;
  const style = connectionStyles[status] ?? connectionStyles.idle;

  return (
    <g opacity={style.opacity}>
      <path
        d={d}
        fill="none"
        stroke={style.stroke}
        strokeWidth={style.width}
        strokeDasharray={style.dash || undefined}
        strokeLinecap="round"
      />
      <circle cx={endX} cy={endY} r={3} fill={style.dot} />
      {/* Blocked X marker at midpoint */}
      {status === "blocked" && (
        <>
          <line
            x1={(startX + endX) / 2 - 5} y1={(startY + endY) / 2 - 5}
            x2={(startX + endX) / 2 + 5} y2={(startY + endY) / 2 + 5}
            stroke="rgba(239, 68, 68, 0.6)" strokeWidth={2} strokeLinecap="round"
          />
          <line
            x1={(startX + endX) / 2 + 5} y1={(startY + endY) / 2 - 5}
            x2={(startX + endX) / 2 - 5} y2={(startY + endY) / 2 + 5}
            stroke="rgba(239, 68, 68, 0.6)" strokeWidth={2} strokeLinecap="round"
          />
        </>
      )}
    </g>
  );
}

// ---------------------------------------------------------------------------
// Agent Node Card
// ---------------------------------------------------------------------------

function AgentNodeCard({
  node,
  isDragging,
}: {
  node: AgentNode;
  isDragging: boolean;
}) {
  const { agent, run, eventCount, toolCount, fileCount, lastActivity } = node;
  const isPaused = agent.status === "idle" && run?.status === "stopped";
  const displayStatus = isPaused ? "paused" : agent.status;
  const Icon = agentIcons[agent.name] ?? User;

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-xl border backdrop-blur transition-all",
        agentColors[displayStatus] ?? agentColors.offline,
        isDragging ? "border-2" : "hover:shadow-lg",
      )}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] via-transparent to-transparent" />

      <div className="relative p-3 space-y-2">
        {/* Header */}
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border backdrop-blur",
              iconColors[displayStatus] ?? iconColors.offline,
            )}
          >
            <Icon className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className={statusDotVariants({ status: displayStatus as any, size: "sm" })} />
              <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-medium">
                {statusLabels[displayStatus] ?? displayStatus}
              </span>
            </div>
            <h3 className="truncate text-xs font-semibold text-zinc-100">
              {agent.name}
            </h3>
          </div>

        </div>

        {/* Task */}
        <p className="text-[10px] leading-relaxed text-zinc-400 truncate">
          {run?.config?.prompt ?? run?.description ?? "No active task"}
        </p>

        {/* Live activity */}
        {lastActivity && (agent.status === "working" || agent.status === "blocked") && (
          <p className="text-[10px] font-mono text-zinc-500 truncate">
            {lastActivity}
          </p>
        )}

        {/* Footer metrics */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-[10px] text-zinc-600">
            {toolCount > 0 && (
              <span className="flex items-center gap-1 text-orange-400/60">
                <Wrench size={9} /> {toolCount}
              </span>
            )}
            {fileCount > 0 && (
              <span className="flex items-center gap-1 text-cyan-400/60">
                <FileCode size={9} /> {fileCount}
              </span>
            )}
            {eventCount > 0 && (
              <span className="flex items-center gap-1">
                <Zap size={9} /> {eventCount}
              </span>
            )}
          </div>
          {node.run && (
            <div className="flex items-center gap-1 text-[9px] text-zinc-600">
              <ArrowRight className="h-2.5 w-2.5" />
              <span className="uppercase tracking-wider">
                {run?.status ?? "idle"}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Canvas
// ---------------------------------------------------------------------------

function buildNodes(
  agents: Agent[],
  runs: Run[],
  events: AgentEvent[],
  savedPositions: Map<string, { x: number; y: number }>,
): AgentNode[] {
  const sorted = [...agents].sort((a, b) => a.name.localeCompare(b.name));

  return sorted.map((agent, i) => {
    const agentRuns = runs.filter((r) => r.agentId === agent.id);
    const currentRun = agentRuns.find((r) => r.status === "running") ?? agentRuns[agentRuns.length - 1];
    const agentEvents = events.filter((e) => e.agentId === agent.id);

    // Find last activity
    let lastActivity: string | undefined;
    for (let j = agentEvents.length - 1; j >= 0; j--) {
      const ev = agentEvents[j];
      const p = (ev as any).payload;
      if (ev.type === "tool.invoked") { lastActivity = `${p.tool} ${p.input ?? ""}`; break; }
      if (ev.type === "file.changed") { lastActivity = `${p.action} ${p.path}`; break; }
      if (ev.type === "task.created") { lastActivity = p.title; break; }
    }

    // Workflow-style layout: staggered positions
    const positions: Record<string, { x: number; y: number }> = {
      "Alice":  { x: 40,  y: 60 },
      "Bob":    { x: 320, y: 60 },
      "Linter": { x: 600, y: 160 },
      "Carlos": { x: 40,  y: 280 },
      "Diana":  { x: 320, y: 280 },
      "Eve":    { x: 320, y: 160 },
    };
    const defaultPos = positions[agent.name] ?? {
      x: 60 + (i % 3) * 280,
      y: 60 + Math.floor(i / 3) * 180,
    };

    return {
      id: agent.id,
      agent,
      run: currentRun,
      position: savedPositions.get(agent.id) ?? defaultPos,
      eventCount: agentEvents.length,
      toolCount: agentEvents.filter((e) => e.type === "tool.invoked").length,
      fileCount: agentEvents.filter((e) => e.type === "file.changed").length,
      lastActivity,
    };
  });
}

// Default workflow connections showing agent pipelines
const DEFAULT_CONNECTIONS: { fromName: string; toName: string }[] = [
  { fromName: "Alice", toName: "Bob" },       // Frontend → Backend
  { fromName: "Bob", toName: "Linter" },       // Backend → QA
  { fromName: "Carlos", toName: "Diana" },     // DevOps → Security
  { fromName: "Alice", toName: "Eve" },        // Frontend → Docs
  { fromName: "Diana", toName: "Linter" },     // Security → QA
];

function getConnectionStatus(fromAgent: Agent, fromRun: Run | undefined, toAgent: Agent): AgentConnection["status"] {
  const fromPaused = fromAgent.status === "idle" && fromRun?.status === "stopped";
  const fromFailed = fromAgent.status === "error" || fromRun?.status === "failed";

  // Source agent stopped or failed → connection blocked
  if (fromPaused || fromFailed) return "blocked";

  // Source working, target waiting → active (data flowing)
  if (fromAgent.status === "working") return "active";

  // Source completed successfully → completed
  if (fromRun?.status === "completed") return "completed";

  return "idle";
}

function buildConnections(agents: Agent[], sessions: Session[], runs: Run[]): AgentConnection[] {
  const conns: AgentConnection[] = [];
  const agentMap = new Map(agents.map((a) => [a.id, a]));
  const lastRunMap = new Map<string, Run>();
  for (const a of agents) {
    const agentRuns = runs.filter((r) => r.agentId === a.id);
    const last = agentRuns.find((r) => r.status === "running") ?? agentRuns[agentRuns.length - 1];
    if (last) lastRunMap.set(a.id, last);
  }

  // Build connections from session dependencies
  for (const session of sessions) {
    const sessionRuns = session.runIds
      .map((id) => runs.find((r) => r.id === id))
      .filter(Boolean) as Run[];

    for (let i = 0; i < sessionRuns.length - 1; i++) {
      const fromAgent = agentMap.get(sessionRuns[i].agentId);
      const toAgent = agentMap.get(sessionRuns[i + 1].agentId);
      if (fromAgent && toAgent) {
        conns.push({
          from: fromAgent.id,
          to: toAgent.id,
          status: getConnectionStatus(fromAgent, lastRunMap.get(fromAgent.id), toAgent),
        });
      }
    }
  }

  // If no session connections, use default workflow layout
  if (conns.length === 0 && agents.length > 1) {
    const nameToId = new Map(agents.map((a) => [a.name, a.id]));
    for (const { fromName, toName } of DEFAULT_CONNECTIONS) {
      const fromId = nameToId.get(fromName);
      const toId = nameToId.get(toName);
      if (fromId && toId) {
        const fromAgent = agentMap.get(fromId);
        const toAgent = agentMap.get(toId);
        if (fromAgent && toAgent) {
          conns.push({
            from: fromId,
            to: toId,
            status: getConnectionStatus(fromAgent, lastRunMap.get(fromId), toAgent),
          });
        }
      }
    }
  }

  return conns;
}

export function AgentWorkflowCanvas({
  agents,
  runs,
  sessions,
  events,
  selectedAgentId,
  onSelectAgent,
}: {
  agents: Agent[];
  runs: Run[];
  sessions: Session[];
  events: AgentEvent[];
  selectedAgentId: string | null;
  onSelectAgent: (id: string | null) => void;
}) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragStartPosition = useRef<{ x: number; y: number } | null>(null);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [savedPositions, setSavedPositions] = useState<Map<string, { x: number; y: number }>>(new Map());

  const nodes = useMemo(
    () => buildNodes(agents, runs, events, savedPositions),
    [agents, runs, events, savedPositions],
  );

  const connections = useMemo(
    () => buildConnections(agents, sessions, runs),
    [agents, sessions, runs],
  );

  const [contentSize, setContentSize] = useState(() => {
    const maxX = Math.max(900, ...nodes.map((n) => n.position.x + NODE_WIDTH + 50));
    const maxY = Math.max(500, ...nodes.map((n) => n.position.y + NODE_HEIGHT + 50));
    return { width: maxX, height: maxY };
  });

  // Drag handlers
  const handleDragStart = (nodeId: string) => {
    setDraggingNodeId(nodeId);
    onSelectAgent(nodeId);
    const node = nodes.find((n) => n.id === nodeId);
    if (node) {
      dragStartPosition.current = { x: node.position.x, y: node.position.y };
    }
  };

  const handleDrag = (nodeId: string, { offset }: PanInfo) => {
    if (draggingNodeId !== nodeId || !dragStartPosition.current) return;

    const newX = Math.max(0, dragStartPosition.current.x + offset.x);
    const newY = Math.max(0, dragStartPosition.current.y + offset.y);

    flushSync(() => {
      setSavedPositions((prev) => {
        const next = new Map(prev);
        next.set(nodeId, { x: newX, y: newY });
        return next;
      });
    });

    setContentSize((prev) => ({
      width: Math.max(prev.width, newX + NODE_WIDTH + 50),
      height: Math.max(prev.height, newY + NODE_HEIGHT + 50),
    }));

    // Auto-scroll canvas when dragging near edges
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const edgeMargin = 60;
      const scrollSpeed = 12;

      const nodeRight = newX + NODE_WIDTH - canvas.scrollLeft;
      const nodeBottom = newY + NODE_HEIGHT - canvas.scrollTop;
      const nodeLeft = newX - canvas.scrollLeft;
      const nodeTop = newY - canvas.scrollTop;

      if (nodeRight > rect.width - edgeMargin) canvas.scrollLeft += scrollSpeed;
      if (nodeLeft < edgeMargin) canvas.scrollLeft -= scrollSpeed;
      if (nodeBottom > rect.height - edgeMargin) canvas.scrollTop += scrollSpeed;
      if (nodeTop < edgeMargin) canvas.scrollTop -= scrollSpeed;
    }
  };

  const handleDragEnd = () => {
    setDraggingNodeId(null);
    dragStartPosition.current = null;
  };

  if (agents.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="text-zinc-500 text-sm">No agents yet</div>
          <div className="text-zinc-700 text-xs">Launch a run to see agents on the canvas</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col h-full">
      {/* Canvas */}
      <div
        ref={canvasRef}
        onPointerDown={(e) => {
          // Only deselect if clicking directly on canvas background (not on a node)
          const target = e.target as HTMLElement;
          if (target === e.currentTarget || target.hasAttribute("data-canvas-bg")) {
            onSelectAgent(null);
          }
        }}
        className="relative flex-1 overflow-auto rounded-xl border border-white/[0.04] bg-zinc-950/40"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }}
      >
        <div
          data-canvas-bg
          className="relative"
          style={{
            minWidth: contentSize.width,
            minHeight: contentSize.height,
          }}
        >
          {/* SVG Connections */}
          <svg
            className="absolute top-0 left-0 pointer-events-none"
            width={contentSize.width}
            height={contentSize.height}
            style={{ overflow: "visible" }}
          >
            {connections.map((c) => (
              <ConnectionLine
                key={`${c.from}-${c.to}`}
                from={c.from}
                to={c.to}
                status={c.status}
                nodes={nodes}
              />
            ))}
          </svg>

          {/* Agent Nodes */}
          {nodes.map((node) => {
            const isDragging = draggingNodeId === node.id;

            return (
              <motion.div
                key={node.id}
                drag
                dragMomentum={false}
                dragConstraints={{ left: 0, top: 0, right: 100000, bottom: 100000 }}
                onPointerDown={() => onSelectAgent(node.id)}
                onDragStart={() => handleDragStart(node.id)}
                onDrag={(_, info) => handleDrag(node.id, info)}
                onDragEnd={handleDragEnd}
                style={{
                  x: node.position.x,
                  y: node.position.y,
                  width: NODE_WIDTH,
                  transformOrigin: "0 0",
                }}
                className={cn(
                  "absolute cursor-grab",
                  selectedAgentId === node.id && "ring-1 ring-white/20 rounded-xl",
                )}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2 }}
                whileHover={{ scale: 1.02 }}
                whileDrag={{ scale: 1.05, zIndex: 50, cursor: "grabbing" }}
              >
                <AgentNodeCard
                  node={node}
                  isDragging={isDragging}
                />
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Legend — bottom left inside canvas */}
      <div className="absolute bottom-3 left-3 z-10 flex flex-col gap-1.5 rounded-lg border border-white/[0.04] bg-zinc-950/80 backdrop-blur-sm px-3 py-2.5">
        <span className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wider mb-0.5">Connections</span>
        <div className="flex items-center gap-2">
          <svg width="24" height="8"><line x1="0" y1="4" x2="24" y2="4" stroke="rgba(16, 185, 129, 0.5)" strokeWidth="2.5" /></svg>
          <span className="text-[9px] text-zinc-500">Active — data flowing</span>
        </div>
        <div className="flex items-center gap-2">
          <svg width="24" height="8"><line x1="0" y1="4" x2="24" y2="4" stroke="rgba(139, 92, 246, 0.3)" strokeWidth="2" strokeDasharray="4,3" /></svg>
          <span className="text-[9px] text-zinc-500">Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <svg width="24" height="8"><line x1="0" y1="4" x2="24" y2="4" stroke="rgba(239, 68, 68, 0.4)" strokeWidth="2" strokeDasharray="3,3" /></svg>
          <span className="text-[9px] text-zinc-500">Blocked — chain broken</span>
        </div>
        <div className="flex items-center gap-2">
          <svg width="24" height="8"><line x1="0" y1="4" x2="24" y2="4" stroke="rgba(161, 161, 170, 0.15)" strokeWidth="1.5" strokeDasharray="4,3" /></svg>
          <span className="text-[9px] text-zinc-500">Idle — waiting</span>
        </div>
      </div>
    </div>
  );
}
