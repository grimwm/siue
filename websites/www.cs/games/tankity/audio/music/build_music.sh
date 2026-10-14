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
# Played at volume 0.6 the four first tracks measured -15.1, -12.0, -17.7 and
# -12.1 LUFS; their median, rounded, keeps the music as loud against the effects.
TARGET_LUFS=-14
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
battle-theme-a|https://opengameart.org/sites/default/files/battleThemeA.mp3|6042399782e581d753d616bc703e66483d5eccb5fb687a20c9a552d68c49e620|
chiptune-level-1|https://opengameart.org/sites/default/files/5%20Action%20Chiptunes%20By%20Juhani%20Junkala.zip|ea189990c0fb9a700187ccc740eda72400341a082305a163867467d96346460d|Juhani Junkala [Retro Game Music Pack] Level 1.wav
awake-megawall-10|https://opengameart.org/sites/default/files/awake10_megaWall.mp3|462c85304df0ea5369cb98aaae158108c92227fa5f442fb63a2da6febbe82ded|
chiptune-level-3|https://opengameart.org/sites/default/files/5%20Action%20Chiptunes%20By%20Juhani%20Junkala.zip|ea189990c0fb9a700187ccc740eda72400341a082305a163867467d96346460d|Juhani Junkala [Retro Game Music Pack] Level 3.wav
artillery-mans-stage|https://opengameart.org/sites/default/files/Artillery%20Man%27s%20Stage_0.ogg|0ac84d7f50d24db53de8e256ef5534606fe3b35ec82f8ebc4a6dd32bcfdb4e8a|
abandoned-hopes|https://opengameart.org/sites/default/files/Abandoned%20Hopes.wav|556a2178173bf62a44bcc0e3e5c640f1b9421f8f9c28c49a6fd8c3b17f032f7d|
great-boss|https://opengameart.org/sites/default/files/Great%20Boss_0.ogg|5a9eaa1236c36efbdf36c5b576c722057d8a7177f8277fd42105e013eaf19aac|
inevitable-doom|https://opengameart.org/sites/default/files/Inevitable%20Doom.wav|cef9610f1a708fa039c6ef61f2851413f0d2d09b27cdca4943778a76d428be47|
boss-battle-1|https://opengameart.org/sites/default/files/Boss%20Battle%20%231%20V1.wav|70508dcdb1e1b29884913f6d73949b0dfaa097390b23e9a53fd3067e1cb80781|
chip-bit-danger|https://opengameart.org/sites/default/files/Chip%20Bit%20Danger.mp3|6656f7ee749dfcb060effcd9ce73da6be9d3006cd189463bc7e7429f2ccf600f|
mecha-collection|https://opengameart.org/sites/default/files/Mecha%20Collection.wav|d2d1e2b188c91a99efab0e5cb964861b5540095b0e1c2c646b83601a7874ecb5|
hey-boss|https://opengameart.org/sites/default/files/Hey%20Boss.mp3|af6f6ed2a3c97f04c0b9b5092ee51bc2d8d69ae41b98172d6ed33037beb08caa|
nes-shooter-mars|https://opengameart.org/sites/default/files/WAV.zip|cefe1973eda47bd0388d5e80c50cf224a6d7c473276a11a3c90d6b4b8e7f0e6a|Mars.wav
8-bit-battle-theme|https://opengameart.org/sites/default/files/newbattle.wav|73d4f61dd69a89edb7948cdc0bac14ce878c6ab46bc8ec4118867b5ab147772b|
the-monarchs-rule|https://opengameart.org/sites/default/files/The%20Monarch%27s%20Rule.wav|238239ff2d976e01f0f7521ec2858caf7070bb6abdaa45a883a9800f4c56bf81|
operation-unthinkable|https://opengameart.org/sites/default/files/Operation%20Unthinkable_0.ogg|47f876174af5a8125dcb807aeced5a31e44b97336bf54b204bd8aabda43d33f4|
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

# ---- encoding ---------------------------------------------------------------
json_field() { awk -F'"' -v k="$1" '$2 == k { print $4 }' <<<"$2"; }

# encode SLUG INPUT OUTFILE: two-pass loudnorm to the target, then 80 kbps stereo mp3.
# The first pass measures; the second applies a linear gain, so the music is not
# compressed. -nostdin because the caller reads the source table on stdin.
encode() {
  local slug=$1 in=$2 out=$3 stats i tp lra thr off v norm
  norm="I=$TARGET_LUFS:TP=$TARGET_TP:LRA=$TARGET_LRA"
  if ! stats=$(ffmpeg -nostdin -hide_banner -nostats -i "$in" -vn -af "loudnorm=$norm:print_format=json" -f null - 2>&1); then
    echo "$stats" >&2
    echo "ffmpeg failed measuring $slug" >&2
    exit 1
  fi
  i=$(json_field input_i "$stats"); tp=$(json_field input_tp "$stats"); lra=$(json_field input_lra "$stats")
  thr=$(json_field input_thresh "$stats"); off=$(json_field target_offset "$stats")
  for v in "$i" "$tp" "$lra" "$thr" "$off"; do
    [[ $v =~ ^-?[0-9]+(\.[0-9]+)?$ ]] || { echo "cannot measure the loudness of $slug (got '$v')" >&2; exit 1; }
  done
  ffmpeg -nostdin -y -v error -i "$in" -vn \
    -af "loudnorm=$norm:measured_I=$i:measured_TP=$tp:measured_LRA=$lra:measured_thresh=$thr:offset=$off:linear=true" \
    -ac 2 -ar 44100 -c:a libmp3lame -b:a 80k -map_metadata -1 -id3v2_version 0 \
    -fflags +bitexact -flags:a +bitexact "$out"
}

build_one() {
  local src
  src=$(source_audio "$2" "$3" "$4") || exit 1
  encode "$1" "$src" "$WORK/out/$1.mp3"
  echo "built $1"
}
# build OUTDIR: every track is built in a scratch folder and copied over only when all succeeded.
build() {
  preflight build
  mkdir -p "$WORK/out"
  each_source build_one
  mkdir -p "$1"
  cp "$WORK/out/"*.mp3 "$1/"
  echo "built into $1:"
  ls -l "$1"/*.mp3
}

# probe FILE: what a candidate source is like, before it is pinned.
probe() {
  local stats dur
  preflight build
  dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$1") || exit 1
  if ! stats=$(ffmpeg -nostdin -hide_banner -nostats -i "$1" -vn -af "loudnorm=I=$TARGET_LUFS:TP=$TARGET_TP:LRA=$TARGET_LRA:print_format=json" -f null - 2>&1); then
    echo "$stats" >&2; exit 1
  fi
  printf 'duration: %.1f\nloudness: %s\nrange: %s\n' "$dur" "$(json_field input_i "$stats")" "$(json_field input_lra "$stats")"
}

# measure DIR: each mp3's integrated loudness, the number the target is held to.
measure() {
  local dir=${1:-$HERE} f out lufs
  preflight build
  for f in "$dir"/*.mp3; do
    out=$(ffmpeg -nostdin -hide_banner -nostats -i "$f" -af ebur128=framelog=quiet -f null - 2>&1) || { echo "$out" >&2; exit 1; }
    lufs=$(awk '/Integrated loudness:/ { x = 1; next } x && $1 == "I:" { print $2; x = 0 }' <<<"$out")
    [ -n "$lufs" ] || { echo "no loudness for $f" >&2; exit 1; }
    printf '%s %s\n' "$lufs" "$(basename "$f")"
  done
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
  --probe) probe "${2:?usage: --probe FILE}"; exit 0 ;;
  --measure) measure "${2:-$HERE}"; exit 0 ;;
  -*) echo "usage: build_music.sh [output-dir | --check-tools | --verify | --measure [dir] | --probe FILE | --sha URL | --vet PAGE_URL]" >&2; exit 2 ;;
  *) build "${1:-$HERE}"; exit 0 ;;
esac
