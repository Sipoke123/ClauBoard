import { Router } from "express";
import type { TaskManager } from "../domain/task-manager.js";

export function tasksRouter(tasks: TaskManager): Router {
  const router = Router();

  router.get("/tasks", (_req, res) => {
    res.json(tasks.all());
  });

  return router;
}
