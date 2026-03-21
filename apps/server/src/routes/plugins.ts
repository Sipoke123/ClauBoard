import { Router } from "express";
import type { PluginRegistry } from "../domain/plugin-registry.js";
import type { EmitFn } from "../adapter/types.js";

export function pluginsRouter(registry: PluginRegistry, emit: EmitFn): Router {
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

    emit({
      id: `plugin-emit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type: type as `plugin.${string}`,
      ts: Date.now(),
      agentId,
      runId: runId ?? "",
      taskId,
      payload: payload ?? {},
    });

    res.json({ accepted: true, type });
  });

  return router;
}
