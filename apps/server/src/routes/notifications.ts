import { Router } from "express";
import type { NotificationEngine } from "../domain/notification-engine.js";

export function notificationsRouter(engine: NotificationEngine): Router {
  const router = Router();

  /** Get all alerts */
  router.get("/alerts", (req, res) => {
    const unackOnly = req.query.unacknowledged === "true";
    res.json(engine.getAlerts(unackOnly));
  });

  /** Acknowledge a single alert */
  router.post("/alerts/:id/ack", (req, res) => {
    const ok = engine.acknowledge(req.params.id);
    if (!ok) return res.status(404).json({ error: "alert not found" });
    res.json({ acknowledged: true });
  });

  /** Acknowledge all alerts */
  router.post("/alerts/ack-all", (_req, res) => {
    const count = engine.acknowledgeAll();
    res.json({ acknowledged: count });
  });

  /** Get alert rules */
  router.get("/alerts/rules", (_req, res) => {
    res.json(engine.getRules());
  });

  /** Toggle a rule */
  router.post("/alerts/rules/:id", (req, res) => {
    const { enabled } = req.body as { enabled?: boolean };
    if (typeof enabled !== "boolean") {
      return res.status(400).json({ error: "enabled must be a boolean" });
    }
    const ok = engine.setRuleEnabled(req.params.id, enabled);
    if (!ok) return res.status(404).json({ error: "rule not found" });
    res.json({ id: req.params.id, enabled });
  });

  return router;
}
