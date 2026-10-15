#!/bin/sh
# The kit's type checks, run from its folder (the site's make test runs every
# games/*/test.sh after `npm ci` in games/, then games/units.sh, which runs
# the kit's unit tests with every game's).
set -e
cd "$(dirname "$0")"
../node_modules/.bin/tsc -p tsconfig.json
../node_modules/.bin/tsc -p tsconfig.test.json
