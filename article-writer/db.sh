#!/usr/bin/env bash
# Start or stop the SoloStack PostgreSQL (port 5434) for article runs. The Payload app is retired and its service is disabled;
# the database lives in /kspellman/sites/payload-backup/solostack.au/database. Usage: bash db.sh start|stop|status
set -euo pipefail
PGBIN=/usr/lib/postgresql/18/bin
DATA=/kspellman/sites/payload-backup/solostack.au/database
LOG=/var/log/solostack-pg.log
case "${1:-status}" in
  start)
    if ss -ltn | grep -q ':5434 '; then echo "already running"; exit 0; fi
    touch "$LOG"; chown postgres: "$LOG"
    # logging_collector is switched off: the configured log folder was under the old project path.
    sudo -u postgres "$PGBIN/pg_ctl" -D "$DATA" -o "-c logging_collector=off" -l "$LOG" -w -t 90 start ;;
  stop)
    ss -ltn | grep -q ':5434 ' || { echo "not running"; exit 0; }
    sudo -u postgres "$PGBIN/pg_ctl" -D "$DATA" -m fast -w stop ;;
  status) ss -ltn | grep -q ':5434 ' && echo running || echo stopped ;;
  *) echo "usage: db.sh start|stop|status" >&2; exit 2 ;;
esac
