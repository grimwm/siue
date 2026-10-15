#!/usr/bin/env bash
# Runs the browser suite, one at a time per machine: each run starts a
# headless Chrome that draws the games on the CPU, and two at once (two
# worktrees, two agents) starve each other into timing failures. A second
# run waits for the first. Arguments pass through to `playwright test`.
set -euo pipefail
cd "$(dirname "$0")"
lock="${E2E_LOCK:-/tmp/siue-e2e.lock}" # one path for every worktree and session
waited=0
until mkdir "$lock" 2>/dev/null; do
  # A lock left by a run that no longer exists is stale.
  if [ -f "$lock/pid" ] && ! kill -0 "$(cat "$lock/pid")" 2>/dev/null; then
    rm -rf "$lock"
    continue
  fi
  [ $((waited % 30)) -eq 0 ] && echo "e2e: another run holds $lock (pid $(cat "$lock/pid" 2>/dev/null || echo ?)); waiting..." >&2
  sleep 1
  waited=$((waited + 1))
done
echo $$ >"$lock/pid"
# A per-run TMPDIR makes every browser profile path unique to this run (see
# reap.sh); the trap kills the Playwright process group and reaps whatever
# browser is left, on a normal exit and on INT, TERM and HUP.
. ./reap.sh
E2E_RUN_DIR=$(mktemp -d "${TMPDIR:-/tmp}/siue-e2e-run.XXXXXX")
E2E_PGID=
finish() { e2e_cleanup; rm -rf "$lock"; }
trap finish EXIT
trap 'finish; exit 130' INT
trap 'finish; exit 143' TERM
trap 'finish; exit 129' HUP
npm ci --silent
set -m # the background job below becomes its own process group
status=0
TMPDIR=$E2E_RUN_DIR npx playwright test "$@" &
E2E_PGID=$!
wait "$E2E_PGID" || status=$?
set +m
exit "$status"
