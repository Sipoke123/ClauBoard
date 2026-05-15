import { Router } from "express";
import type { IEventStore } from "../domain/event-store.js";
import type { AgentRegistry } from "../domain/agent-registry.js";
import type { RunManager } from "../domain/run-manager.js";
import type { RunLauncher } from "../domain/run-launcher.js";
import type { MetricsCollector } from "../domain/metrics-collector.js";

/**
 * Prometheus text exposition format (v0.0.4) — hand-rolled, zero deps.
 * Spec: https://prometheus.io/docs/instrumenting/exposition_formats/
 *
 * Scrape with:
 *   - job_name: clauboard
 *     static_configs:
 *       - targets: ['localhost:3001']
 *     metrics_path: /api/metrics
 */

const NS = "clauboard";

function escapeLabel(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/"/g, '\\"');
}

function fmtLabels(labels: Record<string, string | undefined>): string {
  const entries = Object.entries(labels).filter(([, v]) => v !== undefined && v !== "");
  if (entries.length === 0) return "";
  return "{" + entries.map(([k, v]) => `${k}="${escapeLabel(v as string)}"`).join(",") + "}";
}

interface Metric {
  name: string;
  help: string;
  type: "counter" | "gauge";
  samples: Array<{ labels?: Record<string, string | undefined>; value: number }>;
}

function render(metrics: Metric[]): string {
  const lines: string[] = [];
  for (const m of metrics) {
    const fullName = `${NS}_${m.name}`;
    lines.push(`# HELP ${fullName} ${m.help}`);
    lines.push(`# TYPE ${fullName} ${m.type}`);
    for (const s of m.samples) {
      lines.push(`${fullName}${fmtLabels(s.labels ?? {})} ${s.value}`);
    }
  }
  return lines.join("\n") + "\n";
}

export function metricsRouter(
  collector: MetricsCollector,
  store: IEventStore,
  agents: AgentRegistry,
  runs: RunManager,
  runLauncher: RunLauncher,
): Router {
  const router = Router();

  router.get("/metrics", (_req, res) => {
    const snap = collector.snapshot();
    const allRuns = runs.all();

    // Roll up runs by status (totals across all agents)
    const runsByStatus: Record<string, number> = {
      running: 0,
      completed: 0,
      failed: 0,
      stopped: 0,
    };
    for (const r of allRuns) {
      runsByStatus[r.status] = (runsByStatus[r.status] ?? 0) + 1;
    }

    // Per-agent run totals by status (uses readable agent_name label)
    const perAgentRunSamples: Array<{ labels: Record<string, string>; value: number }> = [];
    const agentNameById = new Map<string, string>();
    for (const a of agents.all()) agentNameById.set(a.id, a.name);

    const perAgentRunCounts = new Map<string, Record<string, number>>();
    for (const r of allRuns) {
      const name = agentNameById.get(r.agentId) ?? r.agentId;
      const buckets = perAgentRunCounts.get(name) ?? { running: 0, completed: 0, failed: 0, stopped: 0 };
      buckets[r.status] = (buckets[r.status] ?? 0) + 1;
      perAgentRunCounts.set(name, buckets);
    }
    for (const [name, buckets] of perAgentRunCounts) {
      for (const [status, count] of Object.entries(buckets)) {
        perAgentRunSamples.push({ labels: { agent_name: name, status }, value: count });
      }
    }

    // Per-agent counters from collector
    const toolInv: Metric["samples"] = [];
    const toolErr: Metric["samples"] = [];
    const fileCh: Metric["samples"] = [];
    const runDurSum: Metric["samples"] = [];
    const runDurCount: Metric["samples"] = [];
    for (const [agentId, c] of snap.perAgent) {
      const name = agentNameById.get(agentId) ?? agentId;
      const labels = { agent_name: name };
      toolInv.push({ labels, value: c.toolInvocations });
      toolErr.push({ labels, value: c.toolErrors });
      fileCh.push({ labels, value: c.filesChanged });
      runDurSum.push({ labels, value: c.runDurationMsSum / 1000 });
      runDurCount.push({ labels, value: c.runDurationCount });
    }

    const metrics: Metric[] = [
      {
        name: "uptime_seconds",
        help: "Seconds since the metrics collector started.",
        type: "gauge",
        samples: [{ value: (Date.now() - snap.startedAt) / 1000 }],
      },
      {
        name: "events_total",
        help: "Total events recorded in the event store (post-replay + live).",
        type: "counter",
        samples: [{ value: store.count() }],
      },
      {
        name: "agents_total",
        help: "Number of registered agents.",
        type: "gauge",
        samples: [{ value: agents.count() }],
      },
      {
        name: "runs_active",
        help: "Number of currently-running adapter runs (RunLauncher).",
        type: "gauge",
        samples: [{ value: runLauncher.activeCount() }],
      },
      {
        name: "runs_total",
        help: "Lifetime run counts grouped by terminal status and agent.",
        type: "gauge",
        samples: perAgentRunSamples,
      },
      {
        name: "runs_status",
        help: "Aggregate run counts by status across all agents.",
        type: "gauge",
        samples: Object.entries(runsByStatus).map(([status, value]) => ({
          labels: { status },
          value,
        })),
      },
      {
        name: "tool_invocations_total",
        help: "Total tool invocations per agent.",
        type: "counter",
        samples: toolInv,
      },
      {
        name: "tool_errors_total",
        help: "Total tool errors per agent.",
        type: "counter",
        samples: toolErr,
      },
      {
        name: "files_changed_total",
        help: "Total file change events per agent (best-effort, see README).",
        type: "counter",
        samples: fileCh,
      },
      {
        name: "run_duration_seconds_sum",
        help: "Sum of completed/failed/stopped run durations in seconds, per agent.",
        type: "counter",
        samples: runDurSum,
      },
      {
        name: "run_duration_seconds_count",
        help: "Count of completed/failed/stopped runs per agent. Pair with _sum to compute averages.",
        type: "counter",
        samples: runDurCount,
      },
    ];

    res.type("text/plain; version=0.0.4; charset=utf-8").send(render(metrics));
  });

  return router;
}
