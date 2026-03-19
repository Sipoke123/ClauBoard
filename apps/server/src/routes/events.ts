import { Router } from "express";
import type { AgentEvent } from "@repo/shared";
import type { EventProcessor } from "../domain/event-processor.js";
import type { EventStore } from "../domain/event-store.js";
import type { WsGateway } from "../ws/gateway.js";

export function eventsRouter(
  processor: EventProcessor,
  store: EventStore,
  gateway: WsGateway,
): Router {
  const router = Router();

  /** Ingest events from agents (or mock generator) */
  router.post("/events", (req, res) => {
    const { events } = req.body as { events: AgentEvent[] };
    if (!Array.isArray(events)) {
      return res.status(400).json({ error: "events must be an array" });
    }
    for (const event of events) {
      processor.process(event);
      gateway.broadcast(event);
    }
    res.json({ accepted: events.length });
  });

  /** Get all events (with optional limit) */
  router.get("/events", (req, res) => {
    const limit = parseInt(req.query.limit as string) || 200;
    const all = store.all();
    res.json(all.slice(-limit));
  });

  return router;
}
