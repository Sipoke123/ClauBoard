// ---------------------------------------------------------------------------
// WebSocket message types
// See docs/architecture.md for WS protocol
// ---------------------------------------------------------------------------

import type { Agent, AgentEvent, Run, Session, Task } from "./events";

// -- Server → Client --------------------------------------------------------

export interface WsEventMessage {
  type: "event";
  data: AgentEvent;
}

export interface WsSnapshotMessage {
  type: "snapshot";
  data: {
    agents: Agent[];
    runs: Run[];
    tasks: Task[];
    sessions: Session[];
  };
}

export interface WsAlertMessage {
  type: "alert";
  data: {
    id: string;
    ts: number;
    severity: "info" | "warning" | "critical";
    rule: string;
    title: string;
    detail: string;
    agentId?: string;
    runId?: string;
  };
}

export type ServerMessage = WsEventMessage | WsSnapshotMessage | WsAlertMessage;

// -- Client → Server --------------------------------------------------------

export interface WsSubscribeMessage {
  type: "subscribe";
  filters?: {
    agentId?: string;
    runId?: string;
  };
}

export type ClientMessage = WsSubscribeMessage;
