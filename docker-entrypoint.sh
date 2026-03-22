#!/bin/sh
set -e

# Render/Railway expose $PORT externally.
# Express API listens on $PORT (handles health checks + API + WebSocket).
# Next.js listens on internal port 3000.
API_PORT="${PORT:-3001}"
WEB_PORT=3000

echo "[clauboard] Starting API server on port ${API_PORT}..."
cd /app/apps/server && PORT=$API_PORT node dist/index.js "$@" &
SERVER_PID=$!

echo "[clauboard] Starting web on port ${WEB_PORT}..."
cd /app && PORT=$WEB_PORT node apps/web/server.js &
WEB_PID=$!

echo "[clauboard] Ready — API :${API_PORT} (external), web :${WEB_PORT} (internal)"

# Wait for either process to exit
while kill -0 $SERVER_PID 2>/dev/null && kill -0 $WEB_PID 2>/dev/null; do
  sleep 1
done

kill $SERVER_PID $WEB_PID 2>/dev/null || true
exit 0
