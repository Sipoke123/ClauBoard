"use client";

import type { Agent, AgentEvent, Run, Session, Task, ServerMessage } from "@repo/shared";

// ---------------------------------------------------------------------------
// Minimal reactive store — no dependencies beyond React
// State is derived entirely from server events.
// ---------------------------------------------------------------------------

export interface StoreState {
  agents: Agent[];
  runs: Run[];
  tasks: Task[];
  sessions: Session[];
  events: AgentEvent[];
  connected: boolean;
}

type Listener = () => void;

class Store {
  private state: StoreState = {
    agents: [],
    runs: [],
    tasks: [],
    sessions: [],
    events: [],
    connected: false,
  };

  private listeners = new Set<Listener>();

  getState(): StoreState {
    return this.state;
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    for (const l of this.listeners) l();
  }

  setConnected(connected: boolean): void {
    this.state = { ...this.state, connected };
    this.notify();
  }

  applySnapshot(data: { agents: Agent[]; runs: Run[]; tasks: Task[]; sessions: Session[] }): void {
    this.state = { ...this.state, ...data };
    this.notify();
  }

  applyEvent(event: AgentEvent): void {
    const s = this.state;

    // Always append to event log
    const events = [...s.events, event].slice(-5000); // keep last 5000

    // Derive agent updates
    let agents = [...s.agents];
    let runs = [...s.runs];
    let tasks = [...s.tasks];

    switch (event.type) {
      case "agent.registered": {
        const exists = agents.find((a) => a.id === event.agentId);
        if (!exists) {
          agents.push({
            id: event.agentId,
            name: event.payload.name,
            role: (event as any).payload.role,
            status: "idle",
            lastHeartbeat: event.ts,
          });
        }
        break;
      }
      case "agent.heartbeat":
        agents = agents.map((a) =>
          a.id === event.agentId
            ? { ...a, status: event.payload.status, lastHeartbeat: event.ts }
            : a,
        );
        break;
      case "agent.deregistered":
        agents = agents.filter((a) => a.id !== event.agentId);
        break;
      case "agent.blocked":
        agents = agents.map((a) =>
          a.id === event.agentId
            ? { ...a, status: "blocked", blockedReason: event.payload.reason }
            : a,
        );
        break;
      case "run.started":
        runs.push({
          id: event.runId,
          agentId: event.agentId,
          description: event.payload.description,
          status: "running",
          startedAt: event.ts,
        });
        agents = agents.map((a) =>
          a.id === event.agentId
            ? { ...a, status: "working", currentRunId: event.runId }
            : a,
        );
        break;
      case "run.completed":
        runs = runs.map((r) =>
          r.id === event.runId
            ? { ...r, status: "completed", completedAt: event.ts }
            : r,
        );
        agents = agents.map((a) =>
          a.id === event.agentId
            ? { ...a, status: "idle", currentRunId: undefined }
            : a,
        );
        break;
      case "run.failed":
        runs = runs.map((r) =>
          r.id === event.runId
            ? { ...r, status: "failed", completedAt: event.ts, error: event.payload.error }
            : r,
        );
        agents = agents.map((a) =>
          a.id === event.agentId
            ? { ...a, status: "error", currentRunId: undefined }
            : a,
        );
        break;
      case "run.stopped":
        runs = runs.map((r) =>
          r.id === event.runId
            ? { ...r, status: "stopped", completedAt: event.ts }
            : r,
        );
        agents = agents.map((a) =>
          a.id === event.agentId
            ? { ...a, status: "idle", currentRunId: undefined }
            : a,
        );
        break;
      case "task.created":
        tasks.push({
          id: event.taskId!,
          title: event.payload.title,
          description: event.payload.description,
          status: "in_progress",
          agentId: event.agentId,
          runId: event.runId,
          createdAt: event.ts,
        });
        agents = agents.map((a) =>
          a.id === event.agentId ? { ...a, currentTaskId: event.taskId } : a,
        );
        break;
      case "task.completed":
        tasks = tasks.map((t) =>
          t.id === event.taskId
            ? { ...t, status: "completed", completedAt: event.ts }
            : t,
        );
        agents = agents.map((a) =>
          a.id === event.agentId ? { ...a, currentTaskId: undefined } : a,
        );
        break;
      case "task.failed":
        tasks = tasks.map((t) =>
          t.id === event.taskId
            ? { ...t, status: "failed", completedAt: event.ts, error: event.payload.error }
            : t,
        );
        agents = agents.map((a) =>
          a.id === event.agentId ? { ...a, currentTaskId: undefined } : a,
        );
        break;
    }

    this.state = { ...s, agents, runs, tasks, events };
    this.notify();
  }

  handleMessage(msg: ServerMessage): void {
    if (msg.type === "snapshot") {
      this.applySnapshot(msg.data);
    } else if (msg.type === "event") {
      this.applyEvent(msg.data);
    }
  }
}

// Singleton store
export const store = new Store();
