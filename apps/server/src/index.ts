import express from "express";
import cors from "cors";
import { config, getAdapterMode } from "./config.js";
import { EventStore } from "./domain/event-store.js";
import { SqliteEventStore } from "./domain/sqlite-event-store.js";
import { DemoEventStore } from "./domain/demo-event-store.js";
import { AgentRegistry } from "./domain/agent-registry.js";
import { RunManager } from "./domain/run-manager.js";
import { TaskManager } from "./domain/task-manager.js";
import { SessionManager } from "./domain/session-manager.js";
import { EventProcessor } from "./domain/event-processor.js";
import { RunLauncher, claudeAdapterFactory } from "./domain/run-launcher.js";
import type { AdapterFactory } from "./domain/run-launcher.js";
import { SessionOrchestrator } from "./domain/session-orchestrator.js";
import { WsGateway } from "./ws/gateway.js";
import { healthRouter } from "./routes/health.js";
import { agentsRouter } from "./routes/agents.js";
import { eventsRouter } from "./routes/events.js";
import { tasksRouter } from "./routes/tasks.js";
import { runsRouter } from "./routes/runs.js";
import { sessionsRouter } from "./routes/sessions.js";
import { presetsRouter } from "./routes/presets.js";
import { adminRouter } from "./routes/admin.js";
import { notificationsRouter } from "./routes/notifications.js";
import { pluginsRouter } from "./routes/plugins.js";
import { EventArchiver } from "./domain/event-archiver.js";
import { NotificationEngine } from "./domain/notification-engine.js";
import { PluginRegistry } from "./domain/plugin-registry.js";
import { metricsPlugin } from "./plugins/metrics-plugin.js";
import type { AgentEvent } from "@repo/shared";
import type { MockAutoLauncher as MockAutoLauncherType } from "./adapter/mock-auto-launcher.js";

// -- Domain --
const eventStore = config.demoMode
  ? new DemoEventStore()
  : config.storage === "sqlite"
    ? new SqliteEventStore()
    : new EventStore();
const agentRegistry = new AgentRegistry();
const runManager = new RunManager();
const taskManager = new TaskManager();
const sessionManager = new SessionManager();
const processor = new EventProcessor(eventStore, agentRegistry, runManager, taskManager);

// -- Replay persisted events, then init persistence for new writes --
const replayed = eventStore.loadFromFile(config.dataDir);
if (replayed.length > 0) {
  console.log(`[server] replaying ${replayed.length} persisted events...`);
  for (const event of replayed) {
    processor.replay(event);
  }
  console.log(`[server] replay complete — ${agentRegistry.count()} agents, ${runManager.all().length} runs`);
}
// Init persistence AFTER load — for JSONL this opens write stream (append mode)
// For SQLite this is already initialized in loadFromFile, but calling again is safe
eventStore.initPersistence(config.dataDir);

// -- Shared state --
let gateway: WsGateway;
let orchestrator: SessionOrchestrator;
let mockAutoLauncher: MockAutoLauncherType | null = null;
let notificationEngine: NotificationEngine | null = null;
let pluginRegistry: PluginRegistry | null = null;

// -- Debounced snapshot broadcast --
let snapshotTimer: ReturnType<typeof setTimeout> | null = null;
function scheduleSnapshot(): void {
  if (snapshotTimer) return;
  snapshotTimer = setTimeout(() => {
    snapshotTimer = null;
    gateway?.broadcastSnapshot();
  }, 300);
}

// -- Shared emit function --
function emit(event: AgentEvent): void {
  processor.process(event);
  gateway?.broadcast(event);
  notificationEngine?.evaluate(event);
  pluginRegistry?.onEvent(event);

  // Notify orchestrator when runs finish
  if (event.type === "run.completed" || event.type === "run.failed" || event.type === "run.stopped") {
    orchestrator?.onRunFinished(event.runId);
    // Debounced snapshot broadcast for session state updates
    scheduleSnapshot();
    // Notify mock auto-launcher so it can relaunch
    mockAutoLauncher?.onRunFinished(event.runId, event.agentId);
  }

  // Auto-compact when threshold exceeded (JSONL only — SQLite doesn't support archiver)
  if (config.storage !== "sqlite" && config.autoCompactThreshold > 0 && eventStore.count() > config.autoCompactThreshold) {
    // Defer to not block the emit pipeline
    setTimeout(() => {
      try {
        const a = new EventArchiver(eventStore, runManager, config.dataDir);
        const result = a.compact();
        if (result.removed > 0) {
          console.log(`[auto-compact] removed ${result.removed} events, ${result.remaining} remaining`);
        }
      } catch (err: any) {
        console.error(`[auto-compact] error: ${err.message}`);
      }
    }, 100);
  }
}

// -- Determine adapter factory --
const adapterMode = getAdapterMode();
let adapterFactory: AdapterFactory = claudeAdapterFactory;

if (adapterMode === "mock") {
  const { MockRunAdapter } = await import("./adapter/mock-run-adapter.js");
  const delayMultiplier = config.demoMode ? 3 : 1;
  adapterFactory = (opts) => new MockRunAdapter({ ...opts, delayMultiplier });
}

// -- Run launcher --
const runLauncher = new RunLauncher(emit, runManager, adapterFactory, agentRegistry);

// -- Session orchestrator --
orchestrator = new SessionOrchestrator(sessionManager, runManager, runLauncher, eventStore);

// -- Express --
const app = express();
app.use(cors());
app.use(express.json());

// -- HTTP server + WebSocket --
const server = app.listen(config.port, () => {
  console.log(`[server] http://localhost:${config.port}`);
  console.log(`[server] ws://localhost:${config.port}/ws`);
  console.log(`[server] adapter: ${adapterMode}`);
  if (config.demoMode) {
    console.log(`[server] DEMO MODE: in-memory only, no disk writes, capped events, slower agents`);
  }
  if (config.allowedWorkspaceRoots.length > 0) {
    console.log(`[server] allowed workspace roots: ${config.allowedWorkspaceRoots.join(", ")}`);
  } else {
    console.warn(`[server] WARNING: no allowed workspace roots configured — all cwd paths are accepted`);
    console.warn(`[server]   Set ALLOWED_WORKSPACE_ROOTS or --allowed-roots to restrict`);
  }
});

gateway = new WsGateway(server, agentRegistry, runManager, taskManager, sessionManager);

// -- Routes --
app.use("/api", healthRouter(eventStore, agentRegistry, adapterMode, runLauncher));
app.use("/api", agentsRouter(agentRegistry, runManager, eventStore));
app.use("/api", eventsRouter(processor, eventStore, gateway));
app.use("/api", tasksRouter(taskManager));
app.use("/api", runsRouter(runManager, runLauncher, eventStore, {
  emit,
  onRunStopped: (agentId) => mockAutoLauncher?.pauseAgent(agentId),
  onAgentResumed: (agentId) => mockAutoLauncher?.resumeAgent(agentId),
  sessionManager,
  onSessionUpdated: () => gateway?.broadcastSnapshot(),
}));
app.use("/api", sessionsRouter(sessionManager, runManager, runLauncher, orchestrator, {
  onSessionCreated: () => gateway?.broadcastSnapshot(),
  onSessionUpdated: () => gateway?.broadcastSnapshot(),
  onAgentPaused: (agentId) => mockAutoLauncher?.pauseAgent(agentId),
  onClearMockAgents: () => mockAutoLauncher?.stopAndClear(),
  agentRegistry,
  emit,
}));
app.use("/api", presetsRouter());
const archiver = config.storage !== "sqlite"
  ? new EventArchiver(eventStore, runManager, config.dataDir)
  : null;
app.use("/api", adminRouter(archiver));

// -- Notifications --
notificationEngine = new NotificationEngine(runManager, agentRegistry);
notificationEngine.onAlert((alert) => {
  // Broadcast alert to all WS clients
  const msg = JSON.stringify({ type: "alert", data: alert });
  for (const client of (gateway as any).clients ?? []) {
    if (client.readyState === 1) client.send(msg);
  }
});
app.use("/api", notificationsRouter(notificationEngine));

// -- Plugins --
pluginRegistry = new PluginRegistry(emit);
pluginRegistry.register(metricsPlugin, { intervalMs: 60000 });
app.use("/api", pluginsRouter(pluginRegistry, emit));

// -- Mock auto-launcher --
if (adapterMode === "mock") {
  const { MockAutoLauncher } = await import("./adapter/mock-auto-launcher.js");
  const demoOpts = config.demoMode ? {
    delayMultiplier: 3,
    demoMode: true,
    onDemoRecovery: () => {
      // Reset all stopped sessions to active
      for (const session of sessionManager.all()) {
        if (session.status === "stopped") {
          sessionManager.updateStatus(session.id, "active");
          for (const sa of session.agents ?? []) {
            if (sa.status === "stopped" || sa.status === "skipped") {
              sa.status = "waiting";
            }
          }
        }
      }
      console.log("[demo] sessions reset to active");
      gateway?.broadcastSnapshot();
    },
  } : undefined;
  mockAutoLauncher = new MockAutoLauncher(runLauncher, runManager, agentRegistry, emit, demoOpts);
  mockAutoLauncher.start();

  // Create demo sessions using main mock agents (after they're registered)
  if (sessionManager.all().length === 0) {
    setTimeout(() => {
      // Pipeline session: Alice & Bob do work → Linter reviews
      const pipelineSpecs = [
        { agentName: "Alice", prompt: "Refactor auth middleware and add rate limiting", dependsOn: [] as string[] },
        { agentName: "Bob", prompt: "Migrate database schema and update API docs", dependsOn: [] as string[] },
        { agentName: "Linter", prompt: "Run lint and type-check on all changes from Alice and Bob", dependsOn: ["Alice", "Bob"] },
      ];
      const pipelineId = `session-${Date.now()}`;
      sessionManager.create(pipelineId, "Feature Pipeline", pipelineSpecs);
      const pSession = sessionManager.get(pipelineId)!;
      // Reuse existing mock agent IDs
      for (const sa of pSession.agents!) {
        const mockAgent = agentRegistry.findByName(sa.agentName);
        if (mockAgent) sa.agentId = mockAgent.id;
      }
      orchestrator.launchInitialWave(pipelineId);
      console.log("[mock] created demo Feature Pipeline session");

      // Parallel session: Carlos, Diana, Eve work independently
      setTimeout(() => {
        const parallelSpecs = [
          { agentName: "Carlos", prompt: "Set up Docker multi-stage build and CI pipeline", dependsOn: [] as string[] },
          { agentName: "Diana", prompt: "Audit auth flow and check dependencies for CVEs", dependsOn: [] as string[] },
          { agentName: "Eve", prompt: "Write getting started guide and update changelog", dependsOn: [] as string[] },
        ];
        const parallelId = `session-${Date.now()}`;
        sessionManager.create(parallelId, "Infrastructure & Docs", parallelSpecs);
        const parSession = sessionManager.get(parallelId)!;
        for (const sa of parSession.agents!) {
          const mockAgent = agentRegistry.findByName(sa.agentName);
          if (mockAgent) sa.agentId = mockAgent.id;
        }
        orchestrator.launchInitialWave(parallelId);
        console.log("[mock] created demo Infrastructure & Docs session");
      }, 2000);
    }, 2000); // wait for mock agents to be registered
  }
} else if (adapterMode === "claude") {
  const { ClaudeCodeAdapter } = await import("./adapter/claude-code-adapter.js");
  const adapter = new ClaudeCodeAdapter({
    prompt: config.claudePrompt!,
    cwd: config.claudeCwd,
    agentName: config.claudeName,
  });
  adapter.start(emit);
  console.log(`[server] claude adapter started for single-run mode`);
}

// -- Shutdown --
function shutdown() {
  console.log("[server] shutting down...");
  mockAutoLauncher?.stop();
  runLauncher.stopAll();
  eventStore.close();
  server.close();
}
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
