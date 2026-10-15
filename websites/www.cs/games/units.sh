#!/bin/sh
# Every unit test in the games, in one node --test run: the kit's
# (_kit/test, _kit/build) and each game's (every folder with a build.json).
# Node runs the files in parallel, so one run is faster than one per folder.
# Each folder's glob is expanded here and fails the run when it matches no
# file, so a typo cannot pass with zero tests. make test runs this after the
# games/*/test.sh static and PHP steps.
set -e
cd "$(dirname "$0")"
dirs='_kit/test _kit/build'
for build in */build.json; do dirs="$dirs ${build%/build.json}/test"; done
set --
for dir in $dirs; do
  for f in "$dir"/*.test.ts; do
    [ -e "$f" ] || { echo "units.sh: no $dir/*.test.ts" >&2; exit 1; }
    set -- "$@" "$f"
  done
done
node --test "$@"
