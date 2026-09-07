#!/usr/bin/env bash
# Runs on every Codespace start: launch API (3001) and Vite (5173) in the
# background. Logs: /tmp/assetra-api.log and /tmp/assetra-web.log
set -euo pipefail
WEB_DIR="$(cd "$(dirname "$0")/.." && pwd)"
API_DIR="${WEB_DIR}/../assetra-api"

# Di Codespaces, tautan verifikasi/reset di email harus menunjuk ke URL publik
# Codespace, bukan localhost. Email hanya benar-benar terkirim bila secret
# RESEND_API_KEY ada (github.com/settings/codespaces → New secret).
if [ -n "${CODESPACE_NAME:-}" ]; then
  export APP_URL="https://${CODESPACE_NAME}-5173.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN:-app.github.dev}"
  echo "[start] APP_URL=$APP_URL"
  [ -n "${RESEND_API_KEY:-}" ] && echo "[start] RESEND_API_KEY set — verification emails will be sent" || echo "[start] RESEND_API_KEY not set — demo mode, no emails are sent"
fi

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
