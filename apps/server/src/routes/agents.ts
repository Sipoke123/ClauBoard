import { Router } from "express";
import type { AgentRegistry } from "../domain/agent-registry.js";
import type { EventStore } from "../domain/event-store.js";
import type { RunManager } from "../domain/run-manager.js";

export function agentsRouter(
  agents: AgentRegistry,
  runs: RunManager,
  events: EventStore,
): Router {
  const router = Router();

  router.get("/agents", (_req, res) => {
    res.json(agents.all());
  });

  router.get("/agents/:id", (req, res) => {
    const agent = agents.get(req.params.id);
    if (!agent) return res.status(404).json({ error: "agent not found" });
    res.json({
      ...agent,
      runs: runs.byAgent(agent.id),
      recentEvents: events.byAgent(agent.id).slice(-50),
    });
  });

  return router;
}
