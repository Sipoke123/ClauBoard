import { spawn, type ChildProcess } from "node:child_process";
import { createInterface } from "node:readline";
import type { AgentEvent } from "@repo/shared";
import type { AgentAdapter, EmitFn } from "./types.js";

export interface ClaudeCodeAdapterOptions {
  /** The prompt to send to Claude Code */
  prompt: string;
  /** Working directory for the Claude process */
  cwd?: string;
  /** Agent display name */
  agentName?: string;
  /** Additional CLI flags */
  extraFlags?: string[];
  /** Pre-set agent ID (for run launcher to know the ID before start) */
  agentId?: string;
  /** Pre-set run ID */
  runId?: string;
  /** Enable interactive mode (stdin open for follow-up messages) */
  interactive?: boolean;
}

let counter = 0;
function uid(): string {
  return `cc-${Date.now()}-${++counter}`;
}

/**
 * Adapter that spawns a real Claude Code CLI process and translates
 * its stream-json output into our event model.
 *
 * See docs/claude-code-adapter.md for design and observability mapping.
 */
export class ClaudeCodeAdapter implements AgentAdapter {
  readonly name = "claude-code";
  private process: ChildProcess | null = null;
  private agentId: string;
  private runId: string;
  private taskId = "";
  private sessionId = "";

  constructor(private options: ClaudeCodeAdapterOptions) {
    const ts = Date.now();
    this.agentId = options.agentId ?? `claude-${ts}`;
    this.runId = options.runId ?? `run-${ts}`;
  }

  /** The agent/run IDs this adapter will use. Available after construction. */
  getIds(): { agentId: string; runId: string } {
    return { agentId: this.agentId, runId: this.runId };
  }

  start(emit: EmitFn): void {
    this.taskId = `task-${Date.now()}`;
    const agentName = this.options.agentName ?? "Claude";

    const interactive = this.options.interactive ?? true;
    const args = [
      ...(interactive ? [] : ["--print"]),
      "--output-format", "stream-json",
      "--verbose",
      "--dangerously-skip-permissions",
      ...(interactive ? [] : ["--no-session-persistence"]),
      ...(this.options.extraFlags ?? []),
      this.options.prompt,
    ];

    console.log(`[claude-code-adapter] spawning: claude ${args.slice(0, -1).join(" ")} "<prompt>"`);
    console.log(`[claude-code-adapter] cwd: ${this.options.cwd ?? process.cwd()}`);

    const child = spawn("claude", args, {
      cwd: this.options.cwd ?? process.cwd(),
      stdio: [interactive ? "pipe" : "ignore", "pipe", "pipe"],
      shell: true,
    });
    this.process = child;

    // Track tool calls in flight to pair invocations with results
    const pendingTools = new Map<string, { tool: string; startTs: number }>();

    // Parse stdout as NDJSON
    const rl = createInterface({ input: child.stdout! });
    rl.on("line", (line) => {
      let msg: any;
      try {
        msg = JSON.parse(line);
      } catch {
        return; // skip non-JSON lines
      }

      this.handleStreamMessage(msg, emit, pendingTools, agentName);
    });

    // Capture stderr as terminal output
    const stderrRl = createInterface({ input: child.stderr! });
    stderrRl.on("line", (line) => {
      if (!line.trim()) return;
      emit({
        id: uid(),
        type: "terminal.output",
        ts: Date.now(),
        agentId: this.agentId,
        runId: this.runId,
        taskId: this.taskId,
        payload: { stream: "stderr", text: line },
      });
    });

    // Handle process exit
    child.on("close", (code) => {
      console.log(`[claude-code-adapter] process exited with code ${code}`);

      // If we never got a result event, emit run completion based on exit code
      emit({
        id: uid(),
        type: "agent.deregistered",
        ts: Date.now(),
        agentId: this.agentId,
        runId: this.runId,
        payload: { reason: `process exited (code ${code})` },
      });
    });

    child.on("error", (err) => {
      console.error(`[claude-code-adapter] spawn error:`, err.message);
      emit({
        id: uid(),
        type: "run.failed",
        ts: Date.now(),
        agentId: this.agentId,
        runId: this.runId,
        payload: { error: `spawn error: ${err.message}` },
      });
      emit({
        id: uid(),
        type: "agent.deregistered",
        ts: Date.now(),
        agentId: this.agentId,
        runId: this.runId,
        payload: { reason: err.message },
      });
    });
  }

  stop(): void {
    if (this.process && !this.process.killed) {
      this.process.kill("SIGTERM");
      console.log("[claude-code-adapter] sent SIGTERM to claude process");
    }
    this.process = null;
  }

  /**
   * Send a follow-up message to the running agent via stdin.
   * Only works in interactive mode (stdin is "pipe").
   */
  sendMessage(text: string): boolean {
    if (!this.process || this.process.killed || !this.process.stdin) {
      return false;
    }
    try {
      this.process.stdin.write(text + "\n");
      console.log(`[claude-code-adapter] sent message to agent: "${text.slice(0, 80)}"`);
      return true;
    } catch (err: any) {
      console.error(`[claude-code-adapter] failed to send message: ${err.message}`);
      return false;
    }
  }

  private handleStreamMessage(
    msg: any,
    emit: EmitFn,
    pendingTools: Map<string, { tool: string; startTs: number }>,
    agentName: string,
  ): void {
    const ts = Date.now();

    switch (msg.type) {
      case "system": {
        if (msg.subtype === "init") {
          this.sessionId = msg.session_id ?? "";
          // Register agent
          emit({
            id: uid(),
            type: "agent.registered",
            ts,
            agentId: this.agentId,
            runId: this.runId,
            payload: { name: agentName },
          });
          // Start run
          emit({
            id: uid(),
            type: "run.started",
            ts,
            agentId: this.agentId,
            runId: this.runId,
            payload: {
              description: this.options.prompt.slice(0, 200),
            },
          });
          // Create a single task for the whole prompt
          emit({
            id: uid(),
            type: "task.created",
            ts,
            agentId: this.agentId,
            runId: this.runId,
            taskId: this.taskId,
            payload: {
              title: this.options.prompt.slice(0, 100),
              description: this.options.prompt,
            },
          });
          // Agent is now working
          emit({
            id: uid(),
            type: "agent.heartbeat",
            ts,
            agentId: this.agentId,
            runId: this.runId,
            payload: { status: "working" },
          });
        }
        break;
      }

      case "assistant": {
        const content = msg.message?.content;
        if (!Array.isArray(content)) break;

        for (const block of content) {
          if (block.type === "tool_use") {
            // Tool invocation
            const inputStr = typeof block.input === "string"
              ? block.input
              : JSON.stringify(block.input);

            pendingTools.set(block.id, { tool: block.name, startTs: ts });

            emit({
              id: uid(),
              type: "tool.invoked",
              ts,
              agentId: this.agentId,
              runId: this.runId,
              taskId: this.taskId,
              payload: {
                tool: block.name,
                input: inputStr.slice(0, 500),
              },
            });
          } else if (block.type === "text" && block.text) {
            // Agent text output
            emit({
              id: uid(),
              type: "terminal.output",
              ts,
              agentId: this.agentId,
              runId: this.runId,
              taskId: this.taskId,
              payload: { stream: "stdout", text: block.text },
            });
          }
        }
        break;
      }

      case "user": {
        const content = msg.message?.content;
        if (!Array.isArray(content)) break;

        for (const block of content) {
          if (block.type === "tool_result") {
            const pending = pendingTools.get(block.tool_use_id);
            const toolName = pending?.tool ?? "unknown";
            const durationMs = pending ? ts - pending.startTs : 0;
            pendingTools.delete(block.tool_use_id);

            // Extract output text
            let output = "";
            if (typeof block.content === "string") {
              output = block.content;
            } else if (Array.isArray(block.content)) {
              output = block.content
                .filter((c: any) => c.type === "text")
                .map((c: any) => c.text)
                .join("\n");
            }

            emit({
              id: uid(),
              type: "tool.result",
              ts,
              agentId: this.agentId,
              runId: this.runId,
              taskId: this.taskId,
              payload: {
                tool: toolName,
                output: output.slice(0, 500),
                durationMs,
              },
            });

            // Detect file changes from tool_use_result metadata
            this.detectFileChange(msg, toolName, emit, ts);
          }
        }
        break;
      }

      case "result": {
        if (msg.subtype === "success") {
          // Complete task
          emit({
            id: uid(),
            type: "task.completed",
            ts,
            agentId: this.agentId,
            runId: this.runId,
            taskId: this.taskId,
            payload: {
              result: typeof msg.result === "string"
                ? msg.result.slice(0, 200)
                : undefined,
            },
          });
          // Complete run
          emit({
            id: uid(),
            type: "run.completed",
            ts,
            agentId: this.agentId,
            runId: this.runId,
            payload: {
              summary: `Completed in ${msg.duration_ms ?? 0}ms` +
                (msg.total_cost_usd ? ` ($${msg.total_cost_usd.toFixed(4)})` : ""),
            },
          });
        } else {
          // Task failed
          const errorText = typeof msg.result === "string"
            ? msg.result
            : "Claude Code returned an error";
          emit({
            id: uid(),
            type: "task.failed",
            ts,
            agentId: this.agentId,
            runId: this.runId,
            taskId: this.taskId,
            payload: { error: errorText.slice(0, 300) },
          });
          // Run failed
          emit({
            id: uid(),
            type: "run.failed",
            ts,
            agentId: this.agentId,
            runId: this.runId,
            payload: { error: errorText.slice(0, 300) },
          });
        }
        break;
      }
      // rate_limit_event and other types — ignored
    }
  }

  /**
   * Best-effort file change detection from tool result metadata.
   * The stream-json format includes `tool_use_result.file` for Read/Edit/Write.
   */
  private detectFileChange(
    msg: any,
    toolName: string,
    emit: EmitFn,
    ts: number,
  ): void {
    const fileSensitiveTools = ["Edit", "Write", "NotebookEdit"];
    if (!fileSensitiveTools.includes(toolName)) return;

    // Try to extract file path from the tool_use_result metadata
    const filePath = msg.tool_use_result?.file?.filePath;
    if (filePath) {
      emit({
        id: uid(),
        type: "file.changed",
        ts,
        agentId: this.agentId,
        runId: this.runId,
        taskId: this.taskId,
        payload: {
          path: filePath,
          action: toolName === "Write" ? "create" : "edit",
        },
      });
    }
  }
}
