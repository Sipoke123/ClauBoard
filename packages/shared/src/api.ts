// ---------------------------------------------------------------------------
// REST API request / response types
// See docs/backend-architecture.md for route table
// ---------------------------------------------------------------------------

import type { Agent, AgentEvent, AgentSpec, Run, Session, Task } from "./events";

// -- Health -----------------------------------------------------------------

export interface HealthResponse {
  status: "ok";
  eventCount: number;
  agentCount: number;
  uptime: number;
  adapterMode?: "mock" | "claude" | "none";
  /** Whether allowed workspace roots are configured */
  cwdRestricted?: boolean;
  /** Number of active runs managed by RunLauncher */
  activeRuns?: number;
}

// -- Agents -----------------------------------------------------------------

export type AgentListResponse = Agent[];
export type AgentDetailResponse = Agent;

// -- Runs -------------------------------------------------------------------

export type RunListResponse = Run[];
export type RunDetailResponse = Run & { events: AgentEvent[] };

export interface RunEventsQuery {
  after?: string;
  limit?: number;
}

export type RunEventsResponse = AgentEvent[];

// -- Tasks ------------------------------------------------------------------

export type TaskListResponse = Task[];

export interface TaskListQuery {
  status?: string;
  agentId?: string;
}

// -- Run launch -------------------------------------------------------------

export interface LaunchRunRequest {
  prompt: string;
  cwd?: string;
  agentName?: string;
  sessionId?: string;
  /** Optional fixed agent ID (used by mock auto-launcher to reuse agents) */
  agentId?: string;
}

// -- Sessions ---------------------------------------------------------------

export interface CreateSessionRequest {
  name: string;
  agents: AgentSpec[];
}

export interface CreateSessionResponse {
  sessionId: string;
  runs: LaunchRunResponse[];
}

export type SessionListResponse = Session[];
export type SessionDetailResponse = Session & { runs: Run[] };

export interface LaunchRunResponse {
  agentId: string;
  runId: string;
}

// -- Run stop ---------------------------------------------------------------

export interface StopRunResponse {
  stopped: boolean;
  runId: string;
}

// -- Event ingestion --------------------------------------------------------

export interface IngestEventsRequest {
  events: AgentEvent[];
}

export interface IngestEventsResponse {
  accepted: number;
}
