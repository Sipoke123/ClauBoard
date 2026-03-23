# Claude Code Adapter

> **Status:** implemented (v1 — single-session)

## Strategy

The adapter spawns `claude` CLI as a child process with `--print --output-format stream-json --verbose`. This produces a newline-delimited JSON stream where each line is a structured message describing exactly what Claude Code is doing: tool calls, tool results, text output, and session lifecycle.

We parse this stream line-by-line and map each message to our existing event model. No polling, no log scraping, no inference — the stream-json format gives us structured, typed data.

## CLI invocation

```
claude --print \
  --output-format stream-json \
  --verbose \
  --dangerously-skip-permissions \
  --no-session-persistence \
  "<prompt>"
```

Flags:
- `--print` — non-interactive, single prompt, exits when done
- `--output-format stream-json` — structured NDJSON stream on stdout
- `--verbose` — required for stream-json; includes tool-level detail
- `--dangerously-skip-permissions` — no interactive permission prompts (agent would block)

> **Warning:** `--dangerously-skip-permissions` bypasses all file-system permission prompts. Only use in trusted/sandboxed environments.
- `--no-session-persistence` — we manage our own persistence; don't clutter Claude's session store

## Stream JSON message types

| `type` field | Subfields | What it tells us |
|---|---|---|
| `system` (subtype: `init`) | `session_id`, `tools`, `model`, `cwd` | Session started |
| `assistant` | `message.content[]` — array of `text` and/or `tool_use` blocks | Agent is thinking or calling tools |
| `user` | `message.content[]` — array of `tool_result` blocks | Tool returned a result |
| `result` | `subtype: "success"\|"error"`, `duration_ms`, `total_cost_usd` | Session ended |

## Event mapping

| Stream JSON → | Our event type | Mapping logic |
|---|---|---|
| `system` init | `agent.registered` | `agentId` from session_id, `name` from config or "Claude" |
| `system` init | `run.started` | One run per CLI invocation |
| `assistant` with `tool_use` | `tool.invoked` | `tool` = tool_use.name, `input` = stringified input |
| `user` with `tool_result` | `tool.result` | `tool` and `output` from result content |
| `user` tool_result for Edit/Write | `file.changed` | Inferred from tool name + input file path |
| `assistant` with `text` | `terminal.output` | Agent's text responses as stdout |
| `result` success | `run.completed` | `summary` from result text |
| `result` error | `run.failed` | `error` from result text |
| `result` (any) | `agent.deregistered` | Agent process exits |

## Observability fidelity

### Reliably captured
- Tool invocations: name, input, output, success/failure
- Session lifecycle: start, end, duration, cost
- Agent text output (thinking, explanations)
- File operations via Edit/Write tool detection
- Model used, tools available

### Partially inferred
- `file.changed` events: inferred from Edit/Write/Bash tool names + input parsing. May miss files changed by Bash commands.
- Task boundaries: Claude Code doesn't expose explicit "tasks" — the entire prompt is one task. We create a single task per run.

### Not yet observable
- Internal planning steps (Claude's chain-of-thought is not streamed)
- Permission denial events (we skip permissions with `--dangerously-skip-permissions`)
- Token-level streaming (partial text chunks)
- Multi-turn conversations (we use `--print` = single prompt)
- Cost breakdown per tool call (only total cost at end)

## Limitations (v1)

1. **Single-shot only.** Each adapter run executes one prompt. No interactive sessions.
2. **No concurrent agents.** v1 runs one Claude process at a time per adapter instance. Multiple adapters can run in parallel.
3. **Requires `--dangerously-skip-permissions`.** Without this, Claude would block on permission prompts that nobody can answer. This means the adapter should only run in trusted/sandboxed environments.
4. **No task granularity.** Claude Code doesn't expose sub-task boundaries. We emit one `task.created` per run.
5. **File change detection is best-effort.** We detect Edit/Write tool calls but not files changed by Bash commands.

## Future improvements

- Interactive/streaming mode via `--input-format stream-json`
- Multiple concurrent agent sessions
- Permission handling via a proxy approval mechanism
- Richer file change detection (watch filesystem or parse Bash commands)
- Cost tracking events
