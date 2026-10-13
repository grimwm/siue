#!/bin/sh
# games/tankity/data/ can hold Tankity's database: the web server must refuse
# it. Plants a probe file there, fetches it through the site at $1, removes it.
set -eu
cd "$(dirname "$0")/.."
url=$1
dir=games/tankity/data
made=
if [ ! -d "$dir" ]; then
  mkdir "$dir"
  made=1
fi
echo probe > "$dir/zz-deny-probe.sqlite"
code=$(curl -s -o /dev/null -w '%{http_code}' "${url}games/tankity/data/zz-deny-probe.sqlite") || code=000
rm -f "$dir/zz-deny-probe.sqlite"
# A local PHP may have taken the directory for its store meanwhile: then it stays.
if [ -n "$made" ]; then rmdir "$dir" 2>/dev/null || true; fi
if [ "$code" != 403 ] && [ "$code" != 404 ]; then
  echo "tankity-data-deny: $dir is served over HTTP (status $code)" >&2
  exit 1
fi
echo "tankity-data-deny: refused ($code)"
