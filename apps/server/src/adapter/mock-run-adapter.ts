import type { AgentEvent } from "@repo/shared";
import type { AgentAdapter, EmitFn } from "./types.js";

let counter = 0;
function uid(): string {
  return `evt-${Date.now()}-${++counter}-${Math.random().toString(36).slice(2, 6)}`;
}
function tid(): string {
  return `task-${Date.now()}-${++counter}-${Math.random().toString(36).slice(2, 6)}`;
}
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const TASK_NAMES = [
  "Refactor auth middleware",
  "Write unit tests for parser",
  "Fix pagination bug",
  "Add rate limiting",
  "Update API docs",
  "Migrate database schema",
  "Optimize query performance",
  "Add error logging",
  "Review pull request",
  "Set up monitoring",
];

const TOOLS = ["Read", "Edit", "Bash", "Grep", "Write", "Glob"];

const FILE_PATHS = [
  "src/auth/middleware.ts",
  "src/api/routes.ts",
  "src/db/schema.sql",
  "tests/parser.test.ts",
  "package.json",
  "src/utils/logger.ts",
  "src/config.ts",
  "src/services/user.ts",
];

export interface MockRunAdapterOptions {
  agentId: string;
  runId: string;
  agentName: string;
  prompt: string;
}

/**
 * Per-run mock adapter. Simulates a single Claude Code run.
 * Does NOT emit agent.registered or agent.deregistered —
 * the auto-launcher owns agent lifecycle.
 */
export class MockRunAdapter implements AgentAdapter {
  readonly name = "mock-run";
  private abortController: AbortController | null = null;
  private emitFn: EmitFn | null = null;

  constructor(private options: MockRunAdapterOptions) {}

  getIds(): { agentId: string; runId: string } {
    return { agentId: this.options.agentId, runId: this.options.runId };
  }

  start(emit: EmitFn): void {
    this.emitFn = emit;
    this.abortController = new AbortController();
    this.simulateRun(emit, this.abortController.signal);
  }

  stop(): void {
    this.abortController?.abort();
    this.abortController = null;
  }

  sendMessage(text: string): boolean {
    if (!this.emitFn) return false;
    // Mock: emit the operator message as a terminal event, then simulate a brief response
    this.emitFn({
      id: uid(),
      type: "terminal.output",
      ts: Date.now(),
      agentId: this.options.agentId,
      runId: this.options.runId,
      payload: { stream: "stdout", text: `Acknowledged: "${text.slice(0, 100)}". Adjusting approach...` },
    });
    return true;
  }

  private async simulateRun(emit: EmitFn, signal: AbortSignal): Promise<void> {
    const { agentId, runId, prompt } = this.options;

    const delay = (ms: number) =>
      new Promise<void>((resolve, reject) => {
        const timer = setTimeout(resolve, ms);
        signal.addEventListener("abort", () => {
          clearTimeout(timer);
          reject(new Error("aborted"));
        }, { once: true });
      });

    try {
      // Start the run
      emit({
        id: uid(), type: "run.started", ts: Date.now(),
        agentId, runId,
        payload: { description: prompt },
      });

      // 2-4 tasks per run
      const taskCount = 2 + Math.floor(Math.random() * 3);
      for (let t = 0; t < taskCount && !signal.aborted; t++) {
        await delay(2000 + Math.random() * 3000);

        const taskId = tid();
        const taskTitle = pick(TASK_NAMES);

        emit({
          id: uid(), type: "task.created", ts: Date.now(),
          agentId, runId, taskId,
          payload: { title: taskTitle },
        });

        // 2-4 tool calls per task
        const toolCount = 2 + Math.floor(Math.random() * 3);
        for (let i = 0; i < toolCount && !signal.aborted; i++) {
          await delay(1000 + Math.random() * 2000);

          const tool = pick(TOOLS);
          emit({
            id: uid(), type: "tool.invoked", ts: Date.now(),
            agentId, runId, taskId,
            payload: { tool, input: `${tool.toLowerCase()} ${pick(FILE_PATHS)}` },
          });

          await delay(800 + Math.random() * 1500);

          if (Math.random() < 0.08) {
            emit({
              id: uid(), type: "tool.error", ts: Date.now(),
              agentId, runId, taskId,
              payload: { tool, error: "ENOENT: file not found" },
            });
          } else {
            emit({
              id: uid(), type: "tool.result", ts: Date.now(),
              agentId, runId, taskId,
              payload: {
                tool,
                output: `Done: ${tool.toLowerCase()} completed`,
                durationMs: Math.floor(100 + Math.random() * 900),
              },
            });
          }

          // File change after Edit/Write
          if ((tool === "Edit" || tool === "Write") && Math.random() > 0.3) {
            emit({
              id: uid(), type: "file.changed", ts: Date.now(),
              agentId, runId, taskId,
              payload: { path: pick(FILE_PATHS), action: pick(["edit", "create"]) },
            });
          }
        }

        // Terminal output
        if (Math.random() > 0.4) {
          emit({
            id: uid(), type: "terminal.output", ts: Date.now(),
            agentId, runId, taskId,
            payload: {
              stream: "stdout",
              text: `$ npm run test\n  PASS src/${taskTitle.toLowerCase().replace(/\s+/g, "-")}.test.ts`,
            },
          });
        }

        // Occasional blocked state (5%)
        if (Math.random() < 0.05) {
          emit({
            id: uid(), type: "agent.blocked", ts: Date.now(),
            agentId, runId, taskId,
            payload: { reason: "Permission required to run shell command", waitingFor: "permission" },
          });
          await delay(3000 + Math.random() * 3000);
          emit({
            id: uid(), type: "agent.heartbeat", ts: Date.now(),
            agentId, runId,
            payload: { status: "working" },
          });
        }

        await delay(800);

        // Complete or fail task (92% success)
        if (Math.random() > 0.08) {
          emit({
            id: uid(), type: "task.completed", ts: Date.now(),
            agentId, runId, taskId,
            payload: { result: `${taskTitle} done` },
          });
        } else {
          emit({
            id: uid(), type: "task.failed", ts: Date.now(),
            agentId, runId, taskId,
            payload: { error: "Lint check failed" },
          });
        }
      }

      await delay(1500);

      // Complete run (90% success)
      if (Math.random() > 0.1) {
        emit({
          id: uid(), type: "run.completed", ts: Date.now(),
          agentId, runId,
          payload: { summary: `Completed in ${Math.floor(10000 + Math.random() * 180000)}ms ($${(0.15 + Math.random() * 1.2).toFixed(4)})` },
        });
      } else {
        emit({
          id: uid(), type: "run.failed", ts: Date.now(),
          agentId, runId,
          payload: { error: "Build failed with exit code 1" },
        });
      }
    } catch {
      // aborted — stop() was called
    }
  }
}
