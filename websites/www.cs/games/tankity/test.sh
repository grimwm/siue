#!/bin/sh
# This game's own unit suite and build checks, run from its folder; the
# site's `make test` runs every games/*/test.sh. Tests that need the docker
# PHP stay in the site Makefile. New test files go here, not in the Makefile.
set -e
cd "$(dirname "$0")"
npm ci --silent
node tools/ts-build.mjs --check
node tools/vendor.mjs --check
php game-json-test.php
php install-files-test.php
php tools/game-json.php --check
php tools/install-files.php --check
node smoke-test.js
node ui-test.js
node vendor-test.js
node audio-test.js
node render-test.js
node net-test.js
node input-test.js
node protocol-test.js
php config-test.php
php rooms-sim-test.php
node sim-vectors-test.js
