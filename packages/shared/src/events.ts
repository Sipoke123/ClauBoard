// ---------------------------------------------------------------------------
// Agent event schema — append-only, replayable
// See docs/event-model.md for the full catalog.
// ---------------------------------------------------------------------------

/** Base fields present on every event */
export interface AgentEventBase {
  id: string;
  type: string;
  ts: number;
  agentId: string;
  runId: string;
  taskId?: string;
}

// -- Agent lifecycle --------------------------------------------------------

export interface AgentRegisteredEvent extends AgentEventBase {
  type: "agent.registered";
  payload: { name: string };
}

export interface AgentHeartbeatEvent extends AgentEventBase {
  type: "agent.heartbeat";
  payload: { status: AgentStatus };
}

export interface AgentDeregisteredEvent extends AgentEventBase {
  type: "agent.deregistered";
  payload: { reason?: string };
}

export interface AgentBlockedEvent extends AgentEventBase {
  type: "agent.blocked";
  payload: { reason: string; waitingFor: "human" | "permission" | "input" };
}

// -- Run lifecycle ----------------------------------------------------------

export interface RunStartedEvent extends AgentEventBase {
  type: "run.started";
  payload: { description?: string };
}

export interface RunCompletedEvent extends AgentEventBase {
  type: "run.completed";
  payload: { summary?: string };
}

export interface RunFailedEvent extends AgentEventBase {
  type: "run.failed";
  payload: { error: string };
}

export interface RunStoppedEvent extends AgentEventBase {
  type: "run.stopped";
  payload: { reason: string };
}

// -- Task lifecycle ---------------------------------------------------------

export interface TaskCreatedEvent extends AgentEventBase {
  type: "task.created";
  payload: { title: string; description?: string };
}

export interface TaskCompletedEvent extends AgentEventBase {
  type: "task.completed";
  payload: { result?: string };
}

export interface TaskFailedEvent extends AgentEventBase {
  type: "task.failed";
  payload: { error: string };
}

// -- Tool invocation --------------------------------------------------------

export interface ToolInvokedEvent extends AgentEventBase {
  type: "tool.invoked";
  payload: { tool: string; input: string };
}

export interface ToolResultEvent extends AgentEventBase {
  type: "tool.result";
  payload: { tool: string; output: string; durationMs: number };
}

export interface ToolErrorEvent extends AgentEventBase {
  type: "tool.error";
  payload: { tool: string; error: string };
}

// -- Terminal output --------------------------------------------------------

export interface TerminalOutputEvent extends AgentEventBase {
  type: "terminal.output";
  payload: { stream: "stdout" | "stderr"; text: string };
}

// -- File changes -----------------------------------------------------------

export interface FileChangedEvent extends AgentEventBase {
  type: "file.changed";
  payload: { path: string; action: "create" | "edit" | "delete" };
}

// -- Discriminated union ----------------------------------------------------

export type AgentEvent =
  | AgentRegisteredEvent
  | AgentHeartbeatEvent
  | AgentDeregisteredEvent
  | AgentBlockedEvent
  | RunStartedEvent
  | RunCompletedEvent
  | RunFailedEvent
  | RunStoppedEvent
  | TaskCreatedEvent
  | TaskCompletedEvent
  | TaskFailedEvent
  | ToolInvokedEvent
  | ToolResultEvent
  | ToolErrorEvent
  | TerminalOutputEvent
  | FileChangedEvent;

export type AgentEventType = AgentEvent["type"];

// -- Run configuration (persisted alongside Run) ----------------------------

export interface RunConfig {
  prompt: string;
  cwd?: string;
  agentName: string;
}

// -- Derived domain models --------------------------------------------------

export type AgentStatus = "idle" | "working" | "error" | "blocked" | "offline";

export interface Agent {
  id: string;
  name: string;
  status: AgentStatus;
  currentRunId?: string;
  currentTaskId?: string;
  lastHeartbeat?: number;
  blockedReason?: string;
}

export type RunStatus = "running" | "completed" | "failed" | "stopped";

export interface Run {
  id: string;
  agentId: string;
  sessionId?: string;
  description?: string;
  status: RunStatus;
  startedAt: number;
  completedAt?: number;
  error?: string;
  config?: RunConfig;
}

// -- Session (operator grouping of runs, not event-sourced) -----------------

export type SessionStatus = "active" | "completed" | "failed" | "stopped";

export interface AgentSpec {
  prompt: string;
  agentName: string;
  cwd?: string;
  /** Names of other agents in this session that must complete before this one starts. */
  dependsOn?: string[];
}

/** Per-agent execution state within a session */
export type SessionAgentStatus = "waiting" | "running" | "completed" | "failed" | "stopped" | "skipped";

export interface SessionAgent {
  specIndex: number;
  agentName: string;
  status: SessionAgentStatus;
  dependsOn: string[];
  runId?: string;
}

export interface Session {
  id: string;
  name: string;
  createdAt: number;
  status: SessionStatus;
  specs: AgentSpec[];
  runIds: string[];
  /** Per-agent execution tracking for dependency-aware sessions */
  agents?: SessionAgent[];
}

export type TaskStatus = "pending" | "in_progress" | "completed" | "failed";

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  agentId: string;
  runId: string;
  createdAt: number;
  completedAt?: number;
  error?: string;
}
