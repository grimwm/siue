#!/bin/sh
# This game's own unit suite and build checks, run from its folder; the
# site's `make test` runs every games/*/test.sh (after `npm ci` in games/).
# Tests that need the docker PHP stay in the site Makefile. New test files go
# here, not in the Makefile.
set -e
cd "$(dirname "$0")"
node ../_kit/build/build.mjs tankity --check
php game-json-test.php
php tools/game-json.php --check
php tools/install-files.php --check
node smoke-test.js
node ui-test.js
node audio-test.js
node render-test.js
node net-test.js
node input-test.js
node replay-test.js
node preview-test.js
node flow-test.js
node protocol-test.js
php config-test.php
php rooms-sim-test.php
node sim-vectors-test.js
