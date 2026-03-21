import { Router } from "express";
import type { EventArchiver } from "../domain/event-archiver.js";

export function adminRouter(archiver: EventArchiver): Router {
  const router = Router();

  /** Get event store stats */
  router.get("/admin/stats", (_req, res) => {
    res.json(archiver.stats());
  });

  /** Archive events older than N days (default 7) */
  router.post("/admin/archive", (req, res) => {
    const days = parseInt(req.body?.days as string) || 7;
    const maxAgeMs = days * 24 * 60 * 60 * 1000;
    const result = archiver.archive(maxAgeMs);
    res.json(result);
  });

  /** Compact verbose events for completed runs */
  router.post("/admin/compact", (_req, res) => {
    const result = archiver.compact();
    res.json(result);
  });

  return router;
}
