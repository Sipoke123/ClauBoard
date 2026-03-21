import { Router } from "express";
import type { CreateSessionRequest, AgentEvent } from "@repo/shared";
import { validateDependencyGraph } from "@repo/shared";

let agentIdCounter = 0;
let eventIdCounter = 0;
import type { SessionManager } from "../domain/session-manager.js";
import type { RunManager } from "../domain/run-manager.js";
import type { RunLauncher } from "../domain/run-launcher.js";
import type { SessionOrchestrator } from "../domain/session-orchestrator.js";
import type { EmitFn } from "../adapter/types.js";

import type { AgentRegistry } from "../domain/agent-registry.js";

export function sessionsRouter(
  sessionManager: SessionManager,
  runManager: RunManager,
  runLauncher: RunLauncher,
  orchestrator: SessionOrchestrator,
  opts?: { onSessionCreated?: () => void; emit?: EmitFn; onClearMockAgents?: () => void; agentRegistry?: AgentRegistry },
): Router {
  const router = Router();

  /** List all sessions, newest first */
  router.get("/sessions", (_req, res) => {
    const sessions = sessionManager.all().sort((a, b) => b.createdAt - a.createdAt);
    res.json(sessions);
  });

  /** Get a single session with its runs */
  router.get("/sessions/:id", (req, res) => {
    const session = sessionManager.get(req.params.id);
    if (!session) return res.status(404).json({ error: "session not found" });
    const runs = session.runIds.map((id) => runManager.get(id)).filter(Boolean);
    res.json({ ...session, runs });
  });

  /** Create a session and launch agents respecting dependencies */
  router.post("/sessions", (req, res) => {
    const body = req.body as CreateSessionRequest;

    if (!body.name || typeof body.name !== "string" || !body.name.trim()) {
      return res.status(400).json({ error: "name is required" });
    }
    if (!Array.isArray(body.agents) || body.agents.length === 0) {
      return res.status(400).json({ error: "agents array is required and must not be empty" });
    }
    for (const spec of body.agents) {
      if (!spec.prompt || !spec.agentName) {
        return res.status(400).json({ error: "each agent needs prompt and agentName" });
      }
    }

    // Validate dependency graph (duplicates, self-deps, unknown deps, cycles)
    const graphResult = validateDependencyGraph(body.agents);
    if (!graphResult.valid) {
      return res.status(400).json({
        error: graphResult.error,
        ...(graphResult.cycle ? { cycle: graphResult.cycle } : {}),
      });
    }

    // Note: no clearing — new pipeline agents are added alongside existing ones

    const sessionId = `session-${Date.now()}`;
    sessionManager.create(sessionId, body.name.trim(), body.agents);

    const session = sessionManager.get(sessionId)!;

    // Pre-register ALL agents (including waiting ones) so canvas shows them immediately
    if (session.agents && opts?.emit) {
      for (const sa of session.agents) {
        const agentId = `agent-sess-${Date.now()}-${++agentIdCounter}-${Math.random().toString(36).slice(2, 8)}`;
        sa.agentId = agentId;

        opts.emit({
          id: `reg-${Date.now()}-${++eventIdCounter}-${Math.random().toString(36).slice(2, 8)}`,
          type: "agent.registered",
          ts: Date.now(),
          agentId,
          runId: "",
          payload: { name: sa.agentName },
        });
      }
    }

    // Orchestrator launches the first wave (agents with no dependencies)
    // Pass pre-assigned agentIds so RunLauncher reuses them
    orchestrator.launchInitialWave(sessionId);

    // Notify clients about new session + agents
    setTimeout(() => opts?.onSessionCreated?.(), 200);

    res.status(201).json({
      sessionId,
      agents: session.agents,
      stages: graphResult.stages,
    });
  });

  /** Stop all running runs in a session */
  router.post("/sessions/:id/stop", (req, res) => {
    const session = sessionManager.get(req.params.id);
    if (!session) return res.status(404).json({ error: "session not found" });

    let stoppedCount = 0;
    for (const runId of session.runIds) {
      const run = runManager.get(runId);
      if (run?.status === "running") {
        if (runLauncher.stop(runId)) stoppedCount++;
      }
    }

    // Mark waiting agents as skipped
    if (session.agents) {
      for (const agent of session.agents) {
        if (agent.status === "waiting") {
          agent.status = "skipped";
        }
      }
    }

    sessionManager.updateStatus(session.id, "stopped");
    res.json({ stopped: stoppedCount, sessionId: session.id });
  });

  return router;
}
