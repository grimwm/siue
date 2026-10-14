#!/usr/bin/env bash
# Rebuild Operation Tankity's soundtrack from its CC0 sources.
#
#   bash games/tankity/audio/music/build_music.sh [output-dir]   rebuild every track
#   ... --verify            download every source and check its SHA-256 (no ffmpeg)
#   ... --measure [dir]     print each mp3's integrated loudness (LUFS)
#   ... --probe FILE        a source's duration, loudness and loudness range
#   ... --sha URL           download URL and print its SHA-256, to pin a new source
#   ... --vet PAGE_URL      read an OpenGameArt page: title, License(s) field, tags, files
#   ... --check-tools       report missing tools and how to install them
#
# Every source below is pinned by SHA-256: a download that differs stops the
# build before anything is written. Every track then gets the same treatment:
# stereo, 44.1 kHz, loudness-normalised to one target (EBU R128, two passes,
# TARGET_* below), 80 kbps mp3, metadata stripped. It is the author's music,
# made louder or quieter and nothing else, which is why game.yaml carries no
# per-track volume. Sources are cached outside the repository (MUSIC_CACHE,
# default ~/.cache/tankity-music) so a rebuild needs no network. Downloads are
# data: nothing in them is executed. Authors, pages and licences: ../CREDITS.md.
# This script is a development file: deploy.sh does not ship it.
set -euo pipefail

HERE=$(cd "$(dirname "$0")" && pwd)
# One loudness for the whole soundtrack, so Next song never jumps in level.
TARGET_LUFS=-16
TARGET_TP=-1.5
TARGET_LRA=11
UA='Mozilla/5.0 (tankity-music-build)'
CACHE=${MUSIC_CACHE:-${XDG_CACHE_HOME:-$HOME/.cache}/tankity-music}
WORK=$(mktemp -d)
cleanup() {
  chmod -R u+w "$WORK" 2>/dev/null || true # zip entries can be read-only
  rm -rf "$WORK"
}
trap cleanup EXIT

# ---- sources (all CC0; the page and licence text for each are in ../CREDITS.md) ----
# slug|download url|sha256 of the download|file name inside the zip (empty: the download is the track)
read -r -d '' DEFAULT_SOURCES <<'EOF' || true
# BEGIN SOURCES
# END SOURCES
EOF
SOURCES=${MUSIC_SOURCES:-$DEFAULT_SOURCES}

# ---- tools ------------------------------------------------------------------
missing=0
need() { command -v "$1" >/dev/null 2>&1 || { echo "missing tool: $1 -- $2" >&2; missing=1; }; }
# preflight fetch|build: every tool the mode needs, or exit 1 naming each gap.
preflight() {
  local filters encoders
  missing=0
  need curl "brew install curl"
  need unzip "brew install unzip"
  need awk "preinstalled on macOS and Linux"
  if ! command -v sha256sum >/dev/null 2>&1 && ! command -v shasum >/dev/null 2>&1; then
    echo "missing tool: sha256sum or shasum -- brew install coreutils" >&2
    missing=1
  fi
  if [ "$1" = build ]; then
    if command -v ffmpeg >/dev/null 2>&1; then
      if filters=$(ffmpeg -hide_banner -filters 2>&1); then :; else filters=; fi
      if encoders=$(ffmpeg -hide_banner -encoders 2>&1); then :; else encoders=; fi
      grep -q ' loudnorm ' <<<"$filters" || { echo "ffmpeg has no loudnorm filter -- brew reinstall ffmpeg" >&2; missing=1; }
      grep -q 'libmp3lame' <<<"$encoders" || { echo "ffmpeg has no libmp3lame encoder -- brew reinstall ffmpeg" >&2; missing=1; }
    else
      echo "missing tool: ffmpeg -- brew install ffmpeg (Debian/Ubuntu: apt-get install ffmpeg)" >&2
      missing=1
    fi
  fi
  [ "$missing" = 0 ] || exit 1
}

# ---- fetching ---------------------------------------------------------------
sha256() {
  if command -v sha256sum >/dev/null 2>&1; then sha256sum "$1" | cut -d' ' -f1; else shasum -a 256 "$1" | cut -d' ' -f1; fi
}

# fetch URL SHA: prints the path of the cached download, which matches SHA.
# A cached file is re-checked every time; one that no longer matches is replaced.
fetch() {
  local url=$1 want=$2 f="$CACHE/$2" got
  mkdir -p "$CACHE"
  if [ -f "$f" ] && [ "$(sha256 "$f")" = "$want" ]; then printf '%s\n' "$f"; return 0; fi
  curl -fsSL --retry 2 -A "$UA" -o "$f.part" "$url" || { rm -f "$f.part"; echo "download failed: $url" >&2; exit 1; }
  got=$(sha256 "$f.part") || exit 1
  if [ "$got" != "$want" ]; then
    rm -f "$f.part"
    echo "checksum mismatch for $url: pinned $want, got $got" >&2
    exit 1
  fi
  mv "$f.part" "$f"
  printf '%s\n' "$f"
}

# source_audio URL SHA MEMBER: prints the path of an audio file ready to encode.
source_audio() {
  local url=$1 sha=$2 member=$3 f dir found
  f=$(fetch "$url" "$sha") || exit 1
  case "${url##*.}" in
    zip)
      dir="$WORK/x/$sha"
      if [ ! -d "$dir" ]; then
        mkdir -p "$dir"
        unzip -q -o "$f" -d "$dir" || { echo "cannot unzip $url" >&2; exit 1; }
        chmod -R u+w "$dir"
      fi
      found=$(find "$dir" -type f | awk -F/ -v m="$member" '$NF == m && !n { print; n = 1 }') || exit 1
      [ -n "$found" ] || { echo "not in $url: $member" >&2; exit 1; }
      printf '%s\n' "$found"
      ;;
    *) printf '%s\n' "$f" ;;
  esac
}

# each_source CMD: runs CMD slug url sha member for every pinned source.
each_source() {
  local slug url sha member
  while IFS='|' read -r slug url sha member; do
    case "$slug" in '' | '#'*) continue ;; esac
    "$1" "$slug" "$url" "$sha" "$member"
  done <<<"$SOURCES"
}

verify_one() {
  local path
  path=$(source_audio "$2" "$3" "$4") || exit 1
  [ -s "$path" ] || { echo "empty source for $1" >&2; exit 1; }
  echo "ok $1"
}

# ---- vetting an OpenGameArt page ---------------------------------------------
# field_segment NAME: the page on stdin, from that field to the next one.
field_segment() {
  tr '\n' ' ' | sed -n "s/.*field-name-$1//p" | sed 's/<div class="field field-name-.*//'
}
# vet_html FILE: print what the page says; exit 0 only if its License(s) field lists CC0.
vet_html() {
  local file=$1 title licenses tags
  title=$(sed -n 's/.*<title>\([^<|]*[^<| ]\) *|.*/\1/p' "$file" | head -n 1)
  licenses=$(field_segment field-art-licenses <"$file" | { grep -o "license-name'>[^<]*" || true; } | sed "s/license-name'>//" | paste -sd, - | sed 's/,/, /g')
  tags=$(field_segment field-art-tags <"$file" | { grep -o 'field_art_tags_tid=[^"&]*' || true; } | sed 's/.*=//' | paste -sd, - | sed 's/,/, /g')
  printf 'title: %s\nlicense: %s\ntags: %s\n' "$title" "$licenses" "$tags"
  field_segment field-art-files <"$file" |
    { grep -o 'href="https://opengameart.org/sites/default/files/[^"]*\.\(mp3\|ogg\|wav\|flac\|zip\)"' || true; } |
    sed 's/^href="//; s/"$//' | sort -u | sed 's/^/file: /'
  case ", $licenses," in *", CC0,"*) return 0 ;; esac
  echo "REJECT: the License(s) field does not list CC0" >&2
  return 3
}
vet() {
  case "$1" in
    https://opengameart.org/content/*) ;;
    *) echo "only https://opengameart.org/content/ pages carry a License(s) field this tool reads" >&2; exit 2 ;;
  esac
  curl -fsSL -m 30 -A "$UA" -o "$WORK/page.html" "$1" || { echo "cannot read $1" >&2; exit 1; }
  printf 'page: %s\n' "$1"
  vet_html "$WORK/page.html"
}

# ---- modes ------------------------------------------------------------------
case "${1:-}" in
  --check-tools) preflight build; echo "all tools present"; exit 0 ;;
  --vet) vet "${2:?usage: --vet PAGE_URL}"; exit $? ;;
  --vet-html) vet_html "${2:?usage: --vet-html FILE}"; exit $? ;;
  --sha)
    preflight fetch
    curl -fsSL --retry 2 -A "$UA" -o "$WORK/sha.part" "${2:?usage: --sha URL}" || { echo "download failed: $2" >&2; exit 1; }
    got=$(sha256 "$WORK/sha.part") || exit 1
    mkdir -p "$CACHE" && cp "$WORK/sha.part" "$CACHE/$got" # so --verify and the build reuse it
    echo "$got"
    exit 0
    ;;
  --verify) preflight fetch; each_source verify_one; exit 0 ;;
  *) echo "usage: build_music.sh [--check-tools|--verify|--sha URL|--vet PAGE_URL|--vet-html FILE]" >&2; exit 2 ;;
esac
