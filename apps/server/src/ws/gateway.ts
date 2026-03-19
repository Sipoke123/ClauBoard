import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "http";
import type { AgentEvent } from "@repo/shared";
import type { ServerMessage } from "@repo/shared";
import type { AgentRegistry } from "../domain/agent-registry.js";
import type { RunManager } from "../domain/run-manager.js";
import type { TaskManager } from "../domain/task-manager.js";
import type { SessionManager } from "../domain/session-manager.js";

export class WsGateway {
  private wss: WebSocketServer;
  private clients = new Set<WebSocket>();

  constructor(
    server: Server,
    private agents: AgentRegistry,
    private runs: RunManager,
    private tasks: TaskManager,
    private sessions: SessionManager,
  ) {
    this.wss = new WebSocketServer({ server, path: "/ws" });

    this.wss.on("connection", (ws) => {
      this.clients.add(ws);

      const snapshot: ServerMessage = {
        type: "snapshot",
        data: {
          agents: this.agents.all(),
          runs: this.runs.all(),
          tasks: this.tasks.all(),
          sessions: this.sessions.all(),
        },
      };
      ws.send(JSON.stringify(snapshot));

      ws.on("close", () => {
        this.clients.delete(ws);
      });
    });
  }

  broadcast(event: AgentEvent): void {
    const msg: ServerMessage = { type: "event", data: event };
    const json = JSON.stringify(msg);
    for (const client of this.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(json);
      }
    }
  }
}
