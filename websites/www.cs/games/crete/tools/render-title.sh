#!/usr/bin/env bash
# The Island of Crete: render the title card's picture (fx/blender/title_card.py) in its two framings and encode
# them as the WebP files game.css shows: fx/title/title-wide.webp (1920x1080, landscape screens) and
# fx/title/title-tall.webp (1080x1920, portrait phones). Also saves the scene as fx/blender/title.blend (Git LFS).
#
#   tools/render-title.sh [--samples N] [--quality Q]
#
# Needs `blender` (4.2 or newer; BLENDER=/path/to/blender overrides) and ImageMagick 7 (`magick`).
# Same script and Blender version, same pictures: every random choice in the scene is seeded.
set -euo pipefail

here=$(cd "$(dirname "$0")/.." && pwd)
blender=${BLENDER:-blender}
samples=96
quality=86
while [ $# -gt 0 ]; do
  case "$1" in
    --samples) samples=$2; shift 2 ;;
    --quality) quality=$2; shift 2 ;;
    *) echo "render-title: unknown option $1" >&2; exit 2 ;;
  esac
done

tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT
mkdir -p "$here/fx/title"

for frame in wide tall; do
  blend=()
  [ "$frame" = wide ] && blend=(--blend "$here/fx/blender/title.blend")
  "$blender" -b -P "$here/fx/blender/title_card.py" -- \
    --frame "$frame" --out "$tmp/$frame.png" --samples "$samples" "${blend[@]+"${blend[@]}"}" >"$tmp/$frame.log" 2>&1 \
    || { tail -20 "$tmp/$frame.log" >&2; exit 1; }
  grep -q '^RENDERED' "$tmp/$frame.log" || { tail -20 "$tmp/$frame.log" >&2; exit 1; }
  magick "$tmp/$frame.png" -strip -quality "$quality" -define webp:method=6 "$here/fx/title/title-$frame.webp"
  printf 'render-title: wrote fx/title/title-%s.webp (%s bytes)\n' "$frame" "$(wc -c <"$here/fx/title/title-$frame.webp" | tr -d ' ')"
done
