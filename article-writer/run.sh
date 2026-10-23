#!/usr/bin/env bash
# Run the SoloStack article writer (generate-article.mjs); all flags pass through. The SoloStack database must be running
# (bash db.sh start, or let daily.sh do it). It runs as the solostack user, with the app's .env (database URL, OPENAI_API_KEY, FAL_KEY).
#   bash run.sh --plan --count=3        free: shows what would be written
#   bash run.sh --count=1               COSTS MONEY: writes review files to scripts/drafts/
#   bash run.sh --count=1 --write       saves the post and PUBLISHES it (--draft: save as a draft)
#   bash run.sh --mock --count=1        no AI, no network: pipeline test
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
APP=/kspellman/sites/cloudflare/solostack.au/payload/app
ENV_FILE=/kspellman/sites/cloudflare/solostack.au/.env
NODE_BIN=/kspellman/sites/cloudflare/solostack.au/payload/runtime/node-v22.23.2/bin
mkdir -p "$SCRIPT_DIR/drafts"
chown -R solostack:solostack "$SCRIPT_DIR/drafts" "$SCRIPT_DIR/topics.txt" 2>/dev/null || true
printf -v ARGS ' %q' "$@"
exec sudo -u solostack bash -c "set -a; . '$ENV_FILE'; set +a; export PATH='$NODE_BIN':\$PATH HOME=/kspellman/sites/cloudflare/solostack.au/payload/home NODE_OPTIONS=--no-deprecation; cd '$APP' && exec node_modules/.bin/tsx '$SCRIPT_DIR/generate-article.mjs'$ARGS"
