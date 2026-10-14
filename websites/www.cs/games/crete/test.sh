#!/bin/sh
# Crete's build checks and unit tests, run from its folder (the site's
# make test runs every games/*/test.sh after `npm ci` in games/).
set -e
cd "$(dirname "$0")"
node ../_kit/build/build.mjs crete --check
php tools/install-files.php --check
node ../_kit/build/icons.mjs crete --check
set -- test/*.test.mjs test/*.test.ts
for f do [ -e "$f" ] && set -- "$@" "$f"; shift; done
[ -e "$1" ] || { echo "test.sh: no test/*.test.mjs or test/*.test.ts" >&2; exit 1; }
node --test "$@"
