#!/usr/bin/env bash
# SoloStack publishing run (for cron or by hand): starts the database, writes and PUBLISHES one article, rebuilds the static
# export and deploys it to Cloudflare Pages, then stops the database again. Costs money (ChatGPT + fal.ai image) and takes a
# few minutes (the Next build is heavy). Log: /kspellman/sites/cloudflare/solostack.au/scripts/logs/daily.log
# Options for the writer are on the run.sh line below (category, length, images, --draft ...).
# If the build or deploy fails, the post stays published in the database and the next run includes it.
set -uo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
STATIC=/kspellman/sites/cloudflare/solostack.au/static
LOG="$DIR/logs/daily.log"
mkdir -p "$DIR/logs"
exec 9>/tmp/solostack-daily.lock
flock -n 9 || { echo "$(date '+%F %T') another run is still going, skipping" >> "$LOG"; exit 0; }
exec >> "$LOG" 2>&1
echo "=== $(date '+%F %T %Z') ==="

STARTED=0
if [ "$(bash "$DIR/db.sh" status)" = stopped ]; then bash "$DIR/db.sh" start && STARTED=1 || { echo "database did not start"; exit 1; }; fi
cleanup() { [ "$STARTED" = 1 ] && bash "$DIR/db.sh" stop; }
trap cleanup EXIT

OUT=$(bash "$DIR/run.sh" --count=1 --write --images=featured --length=medium 2>&1 | grep -v -i "deprecat\|trace-deprecation")
echo "$OUT"
SAVED=$(echo "$OUT" | sed -n 's/^POSTS_SAVED=//p' | tail -1)
SLUG=$(echo "$OUT" | sed -n 's|.*PUBLISHED post id [0-9]*: /posts/\([a-z0-9-]*\).*|\1|p' | tail -1)
if [ "${SAVED:-0}" -lt 1 ]; then echo "nothing was saved; no rebuild needed"; exit 0; fi
if [ -z "$SLUG" ]; then echo "saved as a draft (or no slug found); no rebuild needed"; exit 0; fi

AVAIL=$(awk '/MemAvailable/ {print int($2/1024)}' /proc/meminfo)
if [ "$AVAIL" -lt 5000 ]; then echo "only ${AVAIL} MB of memory free; skipping the build (the next run will include this post)"; exit 1; fi

echo "--- rebuilding the static export"
bash "$STATIC/scripts/build.sh" || { echo "BUILD FAILED"; exit 1; }
[ -f "$STATIC/dist/posts/$SLUG.html" ] || { echo "the export has no posts/$SLUG.html; not deploying"; exit 1; }

echo "--- deploying to Cloudflare Pages"
cd "$STATIC" && npx --yes wrangler@4.149.0 pages deploy dist --project-name solostack-au --branch main --commit-dirty=true || { echo "DEPLOY FAILED"; exit 1; }
for i in 1 2 3 4 5 6; do
  CODE=$(curl -s -o /dev/null -w '%{http_code}' "https://solostack.au/posts/$SLUG")
  [ "$CODE" = 200 ] && { echo "LIVE: https://solostack.au/posts/$SLUG"; exit 0; }
  sleep 10
done
echo "deployed, but https://solostack.au/posts/$SLUG returned $CODE"; exit 1
