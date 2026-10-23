#!/usr/bin/env bash
# Rebuild the static site from current CMS content.
#  1. builds ../build-source (a copy of the Payload/Next app with static-export tweaks) as the solostack user,
#     reading the database credentials from the live app's .env (never copied here),
#  2. serves it on 127.0.0.1:3099, crawls it into dist/ with scripts/export.py, then stops it.
# Needs the solostack PostgreSQL service (port 5434) running. Does not touch the live site.
set -euo pipefail
HERE="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$HERE/build-source"
NODE_BIN=/kspellman/sites/payload-backup/solostack.au/runtime/node-v22.23.2/bin
ENV_FILE=/kspellman/sites/cloudflare/solostack.au/.env
PORT=3099

run_as_app() {
  sudo -u solostack bash -c "set -a; . '$ENV_FILE'; set +a; export PATH='$NODE_BIN':\$PATH HOME=/kspellman/sites/payload-backup/solostack.au/home; cd '$SRC' && $1"
}

if ss -ltn | grep -q ":$PORT "; then echo "Port $PORT is busy; stop the previous export server first." >&2; exit 1; fi
chown -R solostack:solostack "$SRC"
run_as_app "NODE_OPTIONS='--no-deprecation --max-old-space-size=3584' node node_modules/next/dist/bin/next build > build.log 2>&1" \
  || { echo "Build failed; see $SRC/build.log" >&2; exit 1; }

run_as_app "exec node node_modules/next/dist/bin/next start -H 127.0.0.1 -p $PORT" > "$SRC/serve.log" 2>&1 &
trap 'pid=$(ss -ltnp | grep ":$PORT " | grep -o "pid=[0-9]*" | cut -d= -f2 | head -1); [ -n "$pid" ] && kill "$pid"' EXIT
for _ in $(seq 1 30); do curl -sf -o /dev/null "http://127.0.0.1:$PORT/" && break; sleep 1; done

python3 "$HERE/scripts/export.py" --base "http://127.0.0.1:$PORT" --out "$HERE/dist"
