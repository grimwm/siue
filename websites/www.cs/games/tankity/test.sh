#!/bin/sh
# Tankity's build checks and unit tests, run from its folder (the site's make
# test runs every games/*/test.sh after `npm ci` in games/, and the room
# suites in the docker PHP).
set -e
cd "$(dirname "$0")"
node ../_kit/build/build.mjs tankity --check
php tools/game-json.php --check
php tools/install-files.php --check
node ../_kit/build/icons.mjs tankity --check
set -- test/*.test.ts
[ -e "$1" ] || { echo "test.sh: no test/*.test.ts" >&2; exit 1; }
node --test "$@"
../../vendor/bin/phpunit -c ../../phpunit.xml --testsuite tankity
