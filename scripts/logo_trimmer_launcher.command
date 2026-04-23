#!/bin/zsh
set -euo pipefail

PROJECT_DIR="/Users/admin/Documents/CRIADORDECURICULO"
SERVER_SCRIPT="$PROJECT_DIR/server/logoTrimmerServer.js"
LOG_DIR="$PROJECT_DIR/.logs"

mkdir -p "$LOG_DIR"

if ! lsof -iTCP:3005 -sTCP:LISTEN >/dev/null 2>&1; then
  nohup node "$SERVER_SCRIPT" > "$LOG_DIR/logo_trimmer_server.log" 2>&1 &
fi

for _ in {1..30}; do
  if nc -z 127.0.0.1 3005 >/dev/null 2>&1; then
    break
  fi
  sleep 0.2
 done

open "http://localhost:3005/LogoTrimmer"
