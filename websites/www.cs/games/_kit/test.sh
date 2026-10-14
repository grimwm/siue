#!/bin/sh
# The kit's unit tests and type checks, run from its folder (the site's make
# test runs every games/*/test.sh after `npm ci` in games/).
set -e
cd "$(dirname "$0")"
set -- test/*.test.ts build/*.test.ts
[ -e "$1" ] || { echo "test.sh: no test/*.test.ts" >&2; exit 1; }
node --test "$@"
../node_modules/.bin/tsc -p tsconfig.json
../node_modules/.bin/tsc -p tsconfig.test.json
