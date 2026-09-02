#!/usr/bin/env bash
# Runs on every Codespace start: launch API (3001) and Vite (5173) in the
# background. Logs: /tmp/assetra-api.log and /tmp/assetra-web.log
set -euo pipefail
WEB_DIR="$(cd "$(dirname "$0")/.." && pwd)"
API_DIR="${WEB_DIR}/../assetra-api"

pkill -f "src/server.js" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true

(cd "$API_DIR" && nohup node src/server.js > /tmp/assetra-api.log 2>&1 &)
(cd "$WEB_DIR" && nohup npx vite --host --port 5173 > /tmp/assetra-web.log 2>&1 &)

for i in $(seq 1 30); do
  curl -sf http://localhost:5173/api/health >/dev/null 2>&1 && break
  sleep 1
done
echo "[start] api: $(curl -s http://localhost:3001/api/health || echo 'not ready yet')"
echo "[start] open the forwarded port 5173 (Ports tab) in your browser"
