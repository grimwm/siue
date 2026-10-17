#!/bin/sh
# The workroom page's build check, run from its folder (make test runs every
# games/*/test.sh, then games/units.sh runs the unit tests in test/).
set -eu
cd "$(dirname "$0")"
node ../_kit/build/build.mjs workroom --check
