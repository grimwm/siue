#!/bin/sh
# Stands in for PHPUnit in census.test.ts: copies a junit fixture to the
# --log-junit path and exits with the code given.
#   sh fake-phpunit.sh <junit fixture> <exit code> vendor/bin/phpunit ... --log-junit <path>
src=$1
code=$2
shift 2
while [ $# -gt 0 ]; do
  if [ "$1" = --log-junit ]; then cp "$src" "$2"; fi
  shift
done
exit "$code"
