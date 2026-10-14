#!/bin/sh
# Cylon's build checks and PHPUnit suite, run from its folder (the site's make
# test runs every games/*/test.sh after `npm ci` in games/, then
# games/units.sh, which runs Cylon's unit tests with every other game's).
set -e
cd "$(dirname "$0")"
node ../_kit/build/build.mjs cylon --check
php tools/install-files.php --check
node ../_kit/build/icons.mjs cylon --check
../../vendor/bin/phpunit -c ../../phpunit.xml --testsuite cylon
