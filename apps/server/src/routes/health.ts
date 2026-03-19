import { Router } from "express";
import type { HealthResponse } from "@repo/shared";
import type { EventStore } from "../domain/event-store.js";
import type { AgentRegistry } from "../domain/agent-registry.js";
import type { RunLauncher } from "../domain/run-launcher.js";
import { config } from "../config.js";

const startTime = Date.now();

export function healthRouter(
  store: EventStore,
  agents: AgentRegistry,
  adapterMode?: string,
  runLauncher?: RunLauncher,
): Router {
  const router = Router();

  router.get("/health", (_req, res) => {
    const response: HealthResponse = {
      status: "ok",
      eventCount: store.count(),
      agentCount: agents.count(),
      uptime: Date.now() - startTime,
      adapterMode: (adapterMode as HealthResponse["adapterMode"]) ?? "none",
      cwdRestricted: config.allowedWorkspaceRoots.length > 0,
      activeRuns: runLauncher?.activeCount() ?? 0,
    };
    res.json(response);
  });

  return router;
}
