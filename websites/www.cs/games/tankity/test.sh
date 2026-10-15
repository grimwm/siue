#!/bin/sh
# Tankity's build checks and PHPUnit suite, run from its folder (the site's
# make test runs every games/*/test.sh after `npm ci` in games/, then
# games/units.sh, which runs Tankity's unit tests with every other game's, and
# the room suites in the docker PHP).
set -e
cd "$(dirname "$0")"
node ../_kit/build/build.mjs tankity --check
php tools/game-json.php --check
php tools/install-files.php --check
php protocol/pow-vectors.php --check
node ../_kit/build/icons.mjs tankity --check
../../vendor/bin/phpunit -c ../../phpunit.xml --testsuite tankity
