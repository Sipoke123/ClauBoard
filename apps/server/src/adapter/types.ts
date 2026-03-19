import type { AgentEvent } from "@repo/shared";

/**
 * Callback the adapter uses to push events into the server pipeline.
 * The server handles persistence, state derivation, and WS broadcast.
 */
export type EmitFn = (event: AgentEvent) => void;

/**
 * Contract for any agent runtime adapter.
 *
 * Implementations:
 *  - MockRunAdapter: generates fake events for development (per-run)
 *  - (future) ClaudeCodeAdapter: wraps real Claude Code CLI processes
 *
 * Lifecycle:
 *  1. Server creates adapter with an `emit` callback
 *  2. Server calls `start()` — adapter begins producing events
 *  3. Server calls `stop()` on shutdown — adapter cleans up
 */
export interface AgentAdapter {
  /** Human-readable name for logs */
  readonly name: string;

  /** Begin producing events. Called once after server is ready. */
  start(emit: EmitFn): void;

  /** Stop producing events. Called on server shutdown. */
  stop(): void;
}
