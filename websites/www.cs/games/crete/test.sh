#!/bin/sh
# Crete's build checks, run from its folder (the site's make test runs every
# games/*/test.sh after `npm ci` in games/, then games/units.sh, which runs
# Crete's unit tests with every other game's).
set -e
cd "$(dirname "$0")"
node ../_kit/build/build.mjs crete --check
php tools/install-files.php --check
node ../_kit/build/icons.mjs crete --check
