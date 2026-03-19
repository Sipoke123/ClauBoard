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

export type ServerMessage = WsEventMessage | WsSnapshotMessage;

// -- Client → Server --------------------------------------------------------

export interface WsSubscribeMessage {
  type: "subscribe";
  filters?: {
    agentId?: string;
    runId?: string;
  };
}

export type ClientMessage = WsSubscribeMessage;
