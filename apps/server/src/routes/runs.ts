import { Router } from "express";
import type { LaunchRunRequest } from "@repo/shared";
import type { RunManager } from "../domain/run-manager.js";
import type { RunLauncher } from "../domain/run-launcher.js";
import type { IEventStore } from "../domain/event-store.js";
import type { SessionManager } from "../domain/session-manager.js";
import type { EmitFn } from "../adapter/types.js";

export interface RunsRouterOpts {
  emit?: EmitFn;
  onRunStopped?: (agentId: string) => void;
  onAgentResumed?: (agentId: string) => void;
  sessionManager?: SessionManager;
  onSessionUpdated?: () => void;
}

export function runsRouter(
  runManager: RunManager,
  runLauncher: RunLauncher,
  eventStore: IEventStore,
  opts?: RunsRouterOpts,
): Router {
  const router = Router();

  router.get("/runs", (_req, res) => {
    res.json(runManager.all().sort((a, b) => b.startedAt - a.startedAt));
  });

  router.get("/runs/:id", (req, res) => {
    const run = runManager.get(req.params.id);
    if (!run) return res.status(404).json({ error: "run not found" });
    res.json({ ...run, events: eventStore.byRun(run.id) });
  });

  router.post("/runs", (req, res) => {
    const body = req.body as LaunchRunRequest;
    if (!body.prompt || typeof body.prompt !== "string" || body.prompt.trim().length === 0) {
      return res.status(400).json({ error: "prompt is required and must not be empty" });
    }
    try {
      const result = runLauncher.launch(body);
      res.status(201).json(result);
    } catch (err: any) {
      const msg = err.message ?? "failed to launch run";
      const status = msg.includes("not under any allowed workspace root") ? 403 : 500;
      res.status(status).json({ error: msg });
    }
  });

  router.post("/runs/:id/stop", (req, res) => {
    const runId = req.params.id;
    const run = runManager.get(runId);
    if (!run) return res.status(404).json({ error: "run not found" });
    if (run.status !== "running") {
      return res.status(400).json({ error: `run is already ${run.status}` });
    }

    // Immediately pause in auto-launcher
    opts?.onRunStopped?.(run.agentId);

    const stopped = runLauncher.stop(runId);
    if (!stopped && opts?.emit) {
      opts.emit({
        id: `stop-${Date.now()}`,
        type: "run.stopped",
        ts: Date.now(),
        agentId: run.agentId,
        runId,
        payload: { reason: "Stopped by operator" },
      });
    } else if (!stopped) {
      return res.status(400).json({ error: "run is not actively managed" });
    }

    res.json({ stopped: true, runId });
  });

  /** Send a follow-up message to a running agent (interactive mode) */
  router.post("/runs/:id/message", (req, res) => {
    const runId = req.params.id;
    const { text } = req.body as { text?: string };
    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return res.status(400).json({ error: "text is required" });
    }
    const run = runManager.get(runId);
    if (!run) return res.status(404).json({ error: "run not found" });
    if (run.status !== "running") {
      return res.status(400).json({ error: `run is ${run.status}, not running` });
    }

    const sent = runLauncher.sendMessage(runId, text.trim());
    if (!sent) {
      return res.status(400).json({ error: "agent does not support interactive messaging" });
    }

    // Emit operator message as an event for visibility
    if (opts?.emit) {
      opts.emit({
        id: `msg-${Date.now()}`,
        type: "terminal.output",
        ts: Date.now(),
        agentId: run.agentId,
        runId,
        payload: { stream: "stdin", text: `[operator] ${text.trim()}` },
      });
    }

    res.json({ sent: true, runId });
  });

  /** Pause an agent — stops auto-relaunching and kills any running runs */
  router.post("/agents/:id/pause", (req, res) => {
    const agentId = req.params.id;

    // Pause auto-launcher
    opts?.onRunStopped?.(agentId);

    // Stop all running runs for this agent
    const agentRuns = runManager.all().filter((r) => r.agentId === agentId && r.status === "running");
    for (const run of agentRuns) {
      const stopped = runLauncher.stop(run.id);
      if (!stopped && opts?.emit) {
        opts.emit({
          id: `stop-${Date.now()}-${run.id}`,
          type: "run.stopped",
          ts: Date.now(),
          agentId,
          runId: run.id,
          payload: { reason: "Stopped by operator" },
        });
      }
    }

    res.json({ paused: true, agentId, stoppedRuns: agentRuns.length });
  });

  /** Resume a paused agent (mock mode) */
  router.post("/agents/:id/resume", (req, res) => {
    if (!opts?.onAgentResumed) {
      return res.status(400).json({ error: "resume not available" });
    }
    const agentId = req.params.id;
    opts.onAgentResumed(agentId);

    // Update only this agent's status in parent session
    let sessionReactivated = false;
    if (opts.sessionManager) {
      for (const session of opts.sessionManager.all()) {
        if (session.status !== "stopped" && session.status !== "active") continue;
        const sa = session.agents?.find((a) => a.agentId === agentId);
        if (!sa) continue;

        sa.status = "running";

        // If session was stopped, reactivate it (at least one agent is now running)
        if (session.status === "stopped") {
          opts.sessionManager.updateStatus(session.id, "active");
        }
        sessionReactivated = true;
      }
    }

    // Broadcast snapshot so /sessions UI updates immediately
    if (sessionReactivated) {
      opts.onSessionUpdated?.();
    }

    res.json({ resumed: true, agentId });
  });

  return router;
}
