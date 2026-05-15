# Observability

ClauBoard exposes a Prometheus-compatible metrics endpoint so you can plug it into your existing Grafana / Alertmanager / Loki / ELK stack without bolting heavy infrastructure onto the app itself.

> **Want graphs in 30 seconds?** Skip ahead to [Local stack (docker compose)](#local-stack-docker-compose). It bundles Prometheus + Grafana with a pre-provisioned dashboard.

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

## Local stack (docker compose)

A standalone Prometheus + Grafana setup with a pre-provisioned dashboard ships in [`docker-compose.observability.yml`](../docker-compose.observability.yml). Run it alongside your local ClauBoard:

```bash
# 1. Start ClauBoard
npm run dev:mock        # or: npm run dev

# 2. Start the observability stack (separate terminal)
docker compose -f docker-compose.observability.yml up -d
```

Then open:

| Service    | URL                          | Login         |
|------------|------------------------------|---------------|
| Grafana    | http://localhost:3002        | admin / admin |
| Prometheus | http://localhost:9090        | (none)        |

Grafana boots with the **ClauBoard Overview** dashboard already loaded under the `ClauBoard` folder. It includes:

* Stat panels: active runs, registered agents, total events, server uptime
* Donut chart: runs by status
* Timeseries: tool invocation rate per agent
* Timeseries: tool error rate per agent (with thresholds at 10% and 25%)
* Timeseries: average run duration per agent
* Table: total runs per agent and status

The dashboard has two template variables:

* `env` — switch between `local` and `prod` (or both at once)
* `agent` — filter to one or more agents

Prometheus scrapes two targets out of the box (see [`observability/prometheus/prometheus.yml`](../observability/prometheus/prometheus.yml)):

* `host.docker.internal:3001` — your local server (label `env=local`)
* `clauboard.dev` — production (label `env=prod`)

If one target is down it shows DOWN in Prometheus's `/targets` page; the other still works.

To stop the stack:

```bash
docker compose -f docker-compose.observability.yml down       # keep data
docker compose -f docker-compose.observability.yml down -v    # wipe Grafana state
```

Edit the dashboard live in Grafana — changes persist in the `grafana-data` volume. To bake them back into the repo, export the dashboard JSON (Share → Export → Save to file) and overwrite [`observability/grafana/dashboards/clauboard.json`](../observability/grafana/dashboards/clauboard.json).

## Production: clauboard.dev on Render

ClauBoard's production deploys live on [Render](https://render.com). Two ingredients to wire production observability end-to-end:

### 1. Get `/api/metrics` live in prod

Render auto-deploys the Web Service from the `main` branch by default. After the metrics-endpoint commit lands on `main`, the next auto-deploy ships it. Verify with:

```bash
curl -i https://clauboard.dev/api/metrics
```

You should see `HTTP/2 200` and `content-type: text/plain; version=0.0.4`. If you still get 500/404, trigger a manual redeploy from the Render dashboard (Service → Manual Deploy → Deploy latest commit).

### 2. Scrape it from somewhere persistent

Render itself doesn't ship a Prometheus. Two practical paths:

#### Option A — Grafana Cloud free tier (recommended)

Free for 10k active series and 14-day retention, which is more than ClauBoard's metric volume will ever need.

1. Sign up at https://grafana.com/auth/sign-up/create-user
2. In your Grafana Cloud stack, go to **Connections → Add new connection → Hosted Prometheus metrics → Configuration details** and copy your `Remote Write URL`, username, and API key.
3. Easiest scrape pattern: deploy a tiny **Grafana Alloy** (or `prometheus` in agent mode) container that scrapes `https://clauboard.dev/api/metrics` and `remote_write`s to Grafana Cloud. You can run it as a second free Render Background Worker, or on any free-tier VPS.
4. Import [`observability/grafana/dashboards/clauboard.json`](../observability/grafana/dashboards/clauboard.json) into your Grafana Cloud instance (Dashboards → New → Import → Upload JSON file). Adjust the datasource UID prompt to point at your `grafanacloud-prom` datasource.

#### Option B — self-host Prometheus + Grafana on the same Render account

Run `prometheus` and `grafana` as additional Render Web Services using the same compose file as a starting point. Set the Prometheus scrape target to `clauboard-srv:3001` (Render internal hostname) instead of the public domain to skip the public ingress.

This costs roughly $7/month per service on Render's Starter plan. For a 1-10 agent control plane, Grafana Cloud free tier is the better fit.

### 3. Alerts

Use Grafana Cloud's built-in alerting (or Render's notification webhooks) with the [Alertmanager rules](#alertmanager-rules) below.

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
