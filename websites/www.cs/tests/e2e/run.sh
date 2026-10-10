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
trap 'rm -rf "$lock"' EXIT
npm ci --silent
npx playwright test "$@"
