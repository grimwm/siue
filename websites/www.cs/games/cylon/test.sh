#!/bin/sh
# This game's own unit suite and build checks, run from its folder; the
# site's `make test` runs every games/*/test.sh. Tests that need the docker
# PHP stay in the site Makefile. New test files go here, not in the Makefile.
set -e
cd "$(dirname "$0")"
npm ci --silent
node tools/ts-build.mjs --check
php install-files-test.php
php tools/install-files.php --check
node rules-test.js
node playfield-test.js
node scores-test.js
node audio-test.js
node state-test.js
node abilities-test.js
node field-test.js
node smoke-test.js
