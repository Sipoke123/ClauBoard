#!/bin/sh
set -e

echo "[agentflow] Starting server on port ${PORT:-3001}..."
cd /app/apps/server && node dist/index.js "$@" &
SERVER_PID=$!

echo "[agentflow] Starting web on port 3000..."
cd /app && PORT=3000 node apps/web/server.js &
WEB_PID=$!

echo "[agentflow] Ready — server :${PORT:-3001}, web :3000"

# Wait for either process to exit
wait -n $SERVER_PID $WEB_PID
EXIT_CODE=$?

# Kill the other process
kill $SERVER_PID $WEB_PID 2>/dev/null || true
exit $EXIT_CODE
