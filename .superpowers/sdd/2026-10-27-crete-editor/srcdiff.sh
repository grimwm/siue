#!/bin/bash
# Source-only review diff: srcdiff.sh BASE HEAD -> prints the file path.
set -e
cd /home/wgrim/Documents/Repositories/siue
W=.superpowers/sdd/2026-10-27-crete-editor; B=$1; H=$2
f=$W/review-$B..$H.src.diff
{ git log --oneline $B..$H; echo; git diff --stat $B..$H; echo; echo "(generated files under dist/, sw.js, .html version tags and site version files omitted)"
  git diff -U10 $B..$H -- . ':(exclude)**/dist/**' ':(exclude)**/sw.js' ':(exclude)**/*.html' ':(exclude)websites/www.cs/**/versions*'; } > $f
echo "$PWD/$f ($(wc -c < $f) bytes)"
