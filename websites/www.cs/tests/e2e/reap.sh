# Sourced by run.sh (and tested by scripts/test_e2e_reap.py): keeps a run's
# browsers from outliving it.
#
# Every run gets its own TMPDIR. Playwright puts each browser's profile
# (user-data-dir) under it, so the directory's path appears on the command line
# of every browser this run launched, and of none that another run, or the
# developer's own Chrome, Comet or Safari, launched.

# e2e_pids_in DIR: pids whose command line contains DIR/ (matched literally), except this shell.
e2e_pids_in() {
  local pattern
  pattern=$(printf '%s' "$1" | sed 's/[][\\.^$*+?(){}|]/\\&/g')
  pgrep -f -- "$pattern/" 2>/dev/null | grep -vx "$$" || true
}

# e2e_reap_dir DIR: kill every process whose command line contains DIR.
e2e_reap_dir() {
  local dir=$1 pids
  case "$dir" in /?*) ;; *) echo "e2e_reap_dir: refusing '$dir'" >&2; return 1 ;; esac
  pids=$(e2e_pids_in "$dir")
  [ -n "$pids" ] || return 0
  # shellcheck disable=SC2086
  kill -TERM $pids 2>/dev/null || true
  local i
  for i in 1 2 3 4 5 6 7 8 9 10; do
    pids=$(e2e_pids_in "$dir")
    [ -n "$pids" ] || return 0
    sleep 0.2
  done
  # shellcheck disable=SC2086
  kill -KILL $pids 2>/dev/null || true
}

# e2e_cleanup: stop the run's process group, then reap its browsers. Safe to
# call twice. Uses E2E_PGID (the Playwright process group) and E2E_RUN_DIR.
e2e_cleanup() {
  trap '' INT TERM HUP
  if [ -n "${E2E_PGID:-}" ]; then
    kill -TERM -- "-$E2E_PGID" 2>/dev/null || true
    sleep 0.3
    kill -KILL -- "-$E2E_PGID" 2>/dev/null || true
    E2E_PGID=
  fi
  if [ -n "${E2E_RUN_DIR:-}" ]; then
    e2e_reap_dir "$E2E_RUN_DIR" || true
    rm -rf "$E2E_RUN_DIR"
    E2E_RUN_DIR=
  fi
}
