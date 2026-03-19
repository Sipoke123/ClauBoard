import express from "express";
import cors from "cors";
import { config, getAdapterMode } from "./config.js";
import { EventStore } from "./domain/event-store.js";
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
import type { AgentEvent } from "@repo/shared";
import type { MockAutoLauncher as MockAutoLauncherType } from "./adapter/mock-auto-launcher.js";

// -- Domain --
const eventStore = new EventStore();
const agentRegistry = new AgentRegistry();
const runManager = new RunManager();
const taskManager = new TaskManager();
const sessionManager = new SessionManager();
const processor = new EventProcessor(eventStore, agentRegistry, runManager, taskManager);

// -- Replay persisted events --
const replayed = eventStore.loadFromFile(config.dataDir);
if (replayed.length > 0) {
  console.log(`[server] replaying ${replayed.length} persisted events...`);
  for (const event of replayed) {
    eventStore.append(event);
  }
  for (const event of replayed) {
    processor.replay(event);
  }
  console.log(`[server] replay complete — ${agentRegistry.count()} agents, ${runManager.all().length} runs`);
}

// -- Init persistence --
eventStore.initPersistence(config.dataDir);

// -- Shared state --
let gateway: WsGateway;
let orchestrator: SessionOrchestrator;
let mockAutoLauncher: MockAutoLauncherType | null = null;

// -- Shared emit function --
function emit(event: AgentEvent): void {
  processor.process(event);
  gateway.broadcast(event);

  // Notify orchestrator when runs finish
  if (event.type === "run.completed" || event.type === "run.failed" || event.type === "run.stopped") {
    orchestrator.onRunFinished(event.runId);
    // Notify mock auto-launcher so it can relaunch
    mockAutoLauncher?.onRunFinished(event.runId, event.agentId);
  }
}

// -- Determine adapter factory --
const adapterMode = getAdapterMode();
let adapterFactory: AdapterFactory = claudeAdapterFactory;

if (adapterMode === "mock") {
  const { MockRunAdapter } = await import("./adapter/mock-run-adapter.js");
  adapterFactory = (opts) => new MockRunAdapter(opts);
}

// -- Run launcher --
const runLauncher = new RunLauncher(emit, runManager, adapterFactory);

// -- Session orchestrator --
orchestrator = new SessionOrchestrator(sessionManager, runManager, runLauncher);

// -- Express --
const app = express();
app.use(cors());
app.use(express.json());

// -- HTTP server + WebSocket --
const server = app.listen(config.port, () => {
  console.log(`[server] http://localhost:${config.port}`);
  console.log(`[server] ws://localhost:${config.port}/ws`);
  console.log(`[server] adapter: ${adapterMode}`);
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
}));
app.use("/api", sessionsRouter(sessionManager, runManager, runLauncher, orchestrator));
app.use("/api", presetsRouter());

// -- Mock auto-launcher --
if (adapterMode === "mock") {
  const { MockAutoLauncher } = await import("./adapter/mock-auto-launcher.js");
  mockAutoLauncher = new MockAutoLauncher(runLauncher, runManager, agentRegistry, emit);
  mockAutoLauncher.start();
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
