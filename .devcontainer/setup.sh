#!/usr/bin/env bash
# Runs once when the Codespace is created: clone the API next to this repo,
# install both, seed demo data.
set -euo pipefail
WEB_DIR="$(cd "$(dirname "$0")/.." && pwd)"
API_DIR="${WEB_DIR}/../assetra-api"
API_REPO="${API_REPO:-https://github.com/dimasgardenia/assetra-api.git}"
BRANCH="$(git -C "$WEB_DIR" rev-parse --abbrev-ref HEAD 2>/dev/null || echo main)"

if [ ! -d "$API_DIR/.git" ]; then
  if ! git clone --branch "$BRANCH" "$API_REPO" "$API_DIR" 2>/dev/null; then
    echo "[setup] branch '$BRANCH' not in assetra-api, using main"
    git clone --branch main "$API_REPO" "$API_DIR"
  fi
fi

echo "[setup] installing web deps"; (cd "$WEB_DIR" && npm ci --no-audit --no-fund)
echo "[setup] installing api deps"; (cd "$API_DIR" && npm ci --no-audit --no-fund)
echo "[setup] seeding demo data";   (cd "$API_DIR" && node src/db/seed.js)
echo "[setup] done"
