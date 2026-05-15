# Observability

ClauBoard exposes a Prometheus-compatible metrics endpoint so you can plug it into your existing Grafana / Alertmanager / Loki / ELK stack without bolting heavy infrastructure onto the app itself.

The runtime source of truth is still the append-only event stream in `data/events.jsonl` (or SQLite). The `/api/metrics` endpoint is a thin in-memory projection of that stream, rebuilt on startup via replay.

## Endpoint

```
GET http://localhost:3001/api/metrics
Content-Type: text/plain; version=0.0.4; charset=utf-8
```

No auth. ClauBoard is a localhost tool by design (see [README](../README.md#limitations)). If you expose the server beyond localhost, put it behind a reverse proxy that handles auth.

## Metrics

| Metric | Type | Labels | Description |
|--------|------|--------|-------------|
| `clauboard_uptime_seconds` | gauge | (none) | Seconds since the metrics collector started |
| `clauboard_events_total` | counter | (none) | Total events recorded in the event store |
| `clauboard_agents_total` | gauge | (none) | Number of registered agents |
| `clauboard_runs_active` | gauge | (none) | Currently running adapter runs |
| `clauboard_runs_total` | gauge | `agent_name`, `status` | Lifetime run counts per agent and status |
| `clauboard_runs_status` | gauge | `status` | Aggregate run counts across all agents |
| `clauboard_tool_invocations_total` | counter | `agent_name` | Total tool invocations per agent |
| `clauboard_tool_errors_total` | counter | `agent_name` | Total tool errors per agent |
| `clauboard_files_changed_total` | counter | `agent_name` | File-change events per agent (best-effort, see README limitations) |
| `clauboard_run_duration_seconds_sum` | counter | `agent_name` | Sum of finished run durations in seconds |
| `clauboard_run_duration_seconds_count` | counter | `agent_name` | Count of finished runs (pair with `_sum` for averages) |

`status` values: `running`, `completed`, `failed`, `stopped`.

## Prometheus scrape config

```yaml
scrape_configs:
  - job_name: clauboard
    scrape_interval: 30s
    metrics_path: /api/metrics
    static_configs:
      - targets: ['localhost:3001']
```

## Useful PromQL

Average run duration per agent over the last 5 minutes:

```promql
rate(clauboard_run_duration_seconds_sum[5m])
  / rate(clauboard_run_duration_seconds_count[5m])
```

Tool error rate per agent:

```promql
rate(clauboard_tool_errors_total[5m])
  / rate(clauboard_tool_invocations_total[5m])
```

Agents currently blocked or failing:

```promql
clauboard_runs_status{status="failed"} > 0
```

## Alertmanager rules

Drop into your Prometheus rules file:

```yaml
groups:
  - name: clauboard
    rules:
      - alert: ClauBoardAgentRunFailing
        expr: increase(clauboard_runs_total{status="failed"}[10m]) > 0
        for: 1m
        labels:
          severity: warning
        annotations:
          summary: "Agent {{ $labels.agent_name }} has a failed run"

      - alert: ClauBoardHighToolErrorRate
        expr: |
          rate(clauboard_tool_errors_total[5m])
            / rate(clauboard_tool_invocations_total[5m]) > 0.2
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Tool error rate above 20% for {{ $labels.agent_name }}"

      - alert: ClauBoardServerDown
        expr: up{job="clauboard"} == 0
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "ClauBoard server unreachable"
```

ClauBoard also has a built-in notification engine (see `docs/architecture.md`) with rules for failures, blocks, tool errors and long runs. The two are complementary: built-in notifications surface inside the UI, Alertmanager surfaces them in your existing on-call setup.

## Grafana dashboard

There is no shipped JSON dashboard yet. A reasonable starter board has these panels:

* `clauboard_runs_active` (single stat)
* `clauboard_runs_status` (pie or bar)
* `rate(clauboard_tool_invocations_total[5m])` per agent (timeseries)
* `rate(clauboard_tool_errors_total[5m]) / rate(clauboard_tool_invocations_total[5m])` per agent (timeseries, percentage)
* avg run duration per agent (computed from `_sum / _count`, see PromQL above)

If you build one, please open a PR with the JSON in `docs/grafana/`.

## Log shipping (Loki, ELK)

The event stream itself lives in `data/events.jsonl` (one JSON object per line). For Loki or ELK you can tail that file with Promtail / Filebeat / Vector. Example Promtail scrape:

```yaml
scrape_configs:
  - job_name: clauboard-events
    static_configs:
      - targets: [localhost]
        labels:
          job: clauboard-events
          __path__: /path/to/clauboard/data/events.jsonl
    pipeline_stages:
      - json:
          expressions:
            type: type
            agentId: agentId
            runId: runId
            ts: ts
      - labels:
          type:
          agentId:
      - timestamp:
          source: ts
          format: UnixMs
```

For SQLite storage there is no append-only file to tail. Either switch to JSONL (`STORAGE=jsonl`) for log shipping, or query the SQLite database from your shipper of choice.

## Mimir / long-term storage

ClauBoard does not need Mimir. The local Prometheus instance scraping `/api/metrics` is more than enough for a 1 to 10 agent setup. If you already run Mimir as your remote-write target, point Prometheus at it as usual. No changes on the ClauBoard side.

## What is intentionally not here

* No `/metrics` push to a gateway. Pull-based scrape only.
* No OpenTelemetry traces. Spans across agent runs are interesting but out of scope for the MVP.
* No per-event histograms (latency buckets). Run duration is exposed as `_sum` and `_count` which is enough for averages and rate panels.
* No auth on the endpoint. See above.
