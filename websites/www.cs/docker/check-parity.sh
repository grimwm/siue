#!/usr/bin/env bash
# Fail unless the php image matches www.cs.siue.edu: PHP minor version,
# exactly the modules in expected-modules.txt, and every value in
# expected-ini.txt. It asks FPM itself (via cgi-fcgi) rather than the CLI,
# because the CLI forces some values (max_execution_time=0) and never sees
# the pool's php_value settings. Refresh the lists from the server, never
# from the image: see docker/parity/probe.php.
set -euo pipefail

cd "$(dirname "$0")/.."

started=0
if [ -z "$(docker compose ps --status running -q php)" ]; then
  docker compose up -d --build php >/dev/null
  started=1
fi
cleanup() { if [ "$started" -eq 1 ]; then docker compose stop php >/dev/null; fi; }
trap cleanup EXIT

probe() {
  docker compose exec -T php env \
    SCRIPT_FILENAME=/opt/www-cs-docker/parity/probe.php \
    REQUEST_METHOD=GET \
    cgi-fcgi -bind -connect 127.0.0.1:9000
}

# FPM takes a moment to bind after a fresh start.
out=
for attempt in 1 2 3 4 5 6 7 8 9 10; do
  if out=$(probe 2>&1); then
    break
  fi
  if [ "$attempt" -eq 10 ]; then
    echo "FAIL: FPM did not answer the probe:" >&2
    echo "$out" >&2
    exit 1
  fi
  sleep 1
done

# Drop the FastCGI response headers (everything up to the first blank line).
body=$(awk 'seen { print; next } /^\r?$/ { seen = 1 }' <<<"$out")

docker compose exec -T php php /opt/www-cs-docker/parity/compare.php /opt/www-cs-docker <<<"$body"
