#!/bin/sh
# Tankity's build checks and unit tests, run from its folder (the site's make
# test runs every games/*/test.sh after `npm ci` in games/, and the room
# suites in the docker PHP).
set -e
cd "$(dirname "$0")"
node ../_kit/build/build.mjs tankity --check
php tools/game-json.php --check
php tools/install-files.php --check
node tools/solo-runs.mjs --check
node ../_kit/build/icons.mjs tankity --check
node --test 'test/*.test.mjs'
../../vendor/bin/phpunit -c ../../phpunit.xml --testsuite tankity
