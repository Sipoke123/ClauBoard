#!/bin/sh
set -e

# $PORT is the single external port (set by Render/Railway/etc.)
# Next.js listens on $PORT, Express API on internal 3001.
# Next.js proxies /ws WebSocket upgrades to Express.
WEB_PORT="${PORT:-3000}"
API_PORT=3001

echo "[clauboard] Starting API server on port ${API_PORT}..."
cd /app/apps/server && PORT=$API_PORT node dist/index.js "$@" &
SERVER_PID=$!

# Use proxy server in Docker (handles WS upgrade proxying)
echo "[clauboard] Starting web on port ${WEB_PORT}..."
cd /app && PORT=$WEB_PORT API_PORT=$API_PORT node apps/web/server-proxy.js &
WEB_PID=$!

echo "[clauboard] Ready — API :${API_PORT}, web :${WEB_PORT}"

# Wait for either process to exit
while kill -0 $SERVER_PID 2>/dev/null && kill -0 $WEB_PID 2>/dev/null; do
  sleep 1
done

kill $SERVER_PID $WEB_PID 2>/dev/null || true
exit 0
