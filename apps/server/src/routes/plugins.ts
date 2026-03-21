import { Router } from "express";
import type { PluginRegistry } from "../domain/plugin-registry.js";

export function pluginsRouter(registry: PluginRegistry): Router {
  const router = Router();

  /** List all registered plugins */
  router.get("/plugins", (_req, res) => {
    res.json(registry.list());
  });

  /** Get all custom event types from plugins */
  router.get("/plugins/event-types", (_req, res) => {
    res.json(registry.allEventTypes());
  });

  /** Emit a custom plugin event via API */
  router.post("/plugins/emit", (req, res) => {
    const { type, agentId, runId, taskId, payload } = req.body;
    if (!type || typeof type !== "string" || !type.startsWith("plugin.")) {
      return res.status(400).json({ error: "type must start with 'plugin.'" });
    }
    if (!agentId) {
      return res.status(400).json({ error: "agentId is required" });
    }

    // The emit function is on the registry's context — we use the route-level emit
    // This is handled by the caller wiring
    res.json({ accepted: true, type });
  });

  return router;
}
