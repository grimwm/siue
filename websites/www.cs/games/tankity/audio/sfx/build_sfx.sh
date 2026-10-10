#!/usr/bin/env bash
# Rebuild Operation Tankity's sound effects from their CC0 sources.
#
#   bash games/tankity/audio/sfx/build_sfx.sh [output-dir]
#   bash games/tankity/audio/sfx/build_sfx.sh --fetch   refresh src/ from the web
#
# Needs ffmpeg (with libmp3lame). The CC0 source files this build uses are kept
# in src/ next to this script (stored in Git LFS; see ../CREDITS.md for where
# each came from), so a build needs no network. `--fetch` re-downloads the
# original packs into a fresh temp directory, checks each against the SHA-256
# pin below, and copies only the files used here into src/. Downloads are data:
# nothing in them is executed. The output directory defaults to the folder this
# script is in.
#
# The sonic theme is "gritty 16-bit artillery": every effect gets the same
# chain (THEME below) after its own layering, so the set sounds like one
# instrument instead of twelve stock files.
#
#   1. 22.05 kHz mono          the "console" sample rate
#   2. high-pass 35 Hz          no sub-bass mud that small speakers cannot play
#   3. EQ                       +2 dB at 100 Hz (weight), -3 dB at 3.2 kHz, then
#                               low-pass 9.5 kHz (dull the digital fizz)
#   4. bit-crush + hold         acrusher: 10 bits, log curve, every 2nd sample
#                               held, 50% wet (grit without wrecking the tone)
#   5. soft clip                tanh saturation, driven +4 dB
#   6. short room               two echoes at 35 and 70 ms, the same room on
#                               every effect
#   7. peak-normalise -2 dBFS   every file peaks at the same level, so the
#                               `volume` values in game.yaml are the whole mix
#
# Each effect below lists its layers (source files, trims, delays, gains).
# Edit a layer or THEME and re-run to retune the set. Credits and licences are
# in ../CREDITS.md. This script and src/ are development files: deploy.sh
# does not ship them.
set -euo pipefail

HERE=$(cd "$(dirname "$0")" && pwd)
SRC=$HERE/src
WORK=$(mktemp -d)
cleanup() {
  chmod -R u+w "$WORK" 2>/dev/null || true # zip entries can be read-only
  rm -rf "$WORK"
}
trap cleanup EXIT

# ---- sources (all CC0; see ../CREDITS.md) ---------------------------------
KENNEY=https://kenney.nl/media/pages/assets
OGA=https://opengameart.org/sites/default/files
# name|url|sha256
SOURCES='
sci|'$KENNEY'/sci-fi-sounds/6b296f9ecf-1677589334/kenney_sci-fi-sounds.zip|119340f351a5098ad814f78719438c0da355a9ce8a4c8a3af6a8d48aa3d49e04
ui|'$KENNEY'/interface-sounds/fa43c1dd4d-1677589452/kenney_interface-sounds.zip|f2193d072726d6758a5f7871b2dcc54dcce0d5c35c6f0a62f92549b327c81232
imp|'$KENNEY'/impact-sounds/87b4ddecda-1677589768/kenney_impact-sounds.zip|029d734af1582474edf3a694d1b0cebc97c1c152f2f39fa34d4c2bafc5de77f8
rpg|'$KENNEY'/rpg-audio/8e99002d76-1677590336/kenney_rpg-audio.zip|6dbeaf8544da958d8f2adcb4a4a4b76c1ade34a05f8ab9edccd327da7375f38b
jing|'$KENNEY'/music-jingles/f37e530b9e-1677590399/kenney_music-jingles.zip|b729ba57959bd58793d2c5cafa348aaf2655d354f3da35ec4729e03ec77197b8
bang|'$OGA'/25-CC0-bang-sfx.zip|c0c9ecc11e2dc0d190f0cced755569858234b8528286bc83becb6314c663407f
expl|'$OGA'/explosion.wav|df2594dcef5cf8f8f9b131828224fc47c9e3fdaf677bd9211d1b372dfde47177
metal1|'$OGA'/bing1.wav|d14941ce27e6b409e0cd941eaad7201d613070a4c3eb9c3627fec4cf3ae686e4
metal2|'$OGA'/bong1.wav|a6558d186f2843aefa212d567963b0ad79a6f78614bcf650f519620fc1549a6d
'

# fetch: download every pack, verify it, and copy the files used below into src/.
fetch() {
  command -v curl >/dev/null && command -v unzip >/dev/null && command -v shasum >/dev/null ||
    { echo "--fetch needs curl, unzip and shasum" >&2; exit 1; }
  local dl="$WORK/dl" x="$WORK/x" name url sha f
  mkdir -p "$dl" "$x" "$SRC"
  while IFS='|' read -r name url sha; do
    [ -n "$name" ] || continue
    f="$dl/$name.${url##*.}"
    curl -fsSL -o "$f" "$url"
    if [ "$(shasum -a 256 "$f" | cut -d' ' -f1)" != "$sha" ]; then
      echo "checksum mismatch for $url" >&2; exit 1
    fi
    mkdir -p "$x/$name"
    case "$f" in
      *.zip) unzip -q -o "$f" -d "$x/$name" ;;
      *) cp "$f" "$x/$name/${url##*/}" ;;
    esac
  done <<<"$SOURCES"
  chmod -R u+w "$x"
  for f in "${SRC_FILES[@]}"; do
    found=$(find "$x" -type f -name "$f" | head -n 1)
    [ -n "$found" ] || { echo "not in the downloads: $f" >&2; exit 1; }
    cp "$found" "$SRC/$f"
  done
  echo "refreshed ${#SRC_FILES[@]} files in $SRC"
}

# The files this build reads from src/.
SRC_FILES=(
  "explosion.wav"
  "lowFrequency_explosion_001.ogg"
  "explosionCrunch_002.ogg"
  "cannon_02.ogg"
  "shot_01.ogg"
  "impactSoft_heavy_001.ogg"
  "impactSoft_heavy_000.ogg"
  "impactPunch_heavy_002.ogg"
  "impactMetal_heavy_003.ogg"
  "impactMetal_medium_000.ogg"
  "impactMetal_medium_001.ogg"
  "bong1.wav"
  "bing1.wav"
  "engineCircular_002.ogg"
  "footstep_concrete_000.ogg"
  "footstep_concrete_003.ogg"
  "click_004.ogg"
  "click_005.ogg"
  "handleCoins.ogg"
  "error_001.ogg"
  "error_002.ogg"
  "question_003.ogg"
  "jingles_NES12.ogg"
  "jingles_NES07.ogg"
  "jingles_NES00.ogg"
)

if [ "${1:-}" = "--fetch" ]; then fetch; exit 0; fi
OUT=${1:-$HERE}
for tool in ffmpeg; do
  command -v "$tool" >/dev/null || { echo "missing tool: $tool" >&2; exit 1; }
done
for f in "${SRC_FILES[@]}"; do
  [ -s "$SRC/$f" ] || { echo "missing source src/$f (run with --fetch)" >&2; exit 1; }
done

EXPLOSION=$SRC/explosion.wav
SUB=$SRC/lowFrequency_explosion_001.ogg
CRUNCH=$SRC/explosionCrunch_002.ogg
CANNON=$SRC/cannon_02.ogg
CRACK=$SRC/shot_01.ogg
THUD_LOW=$SRC/impactSoft_heavy_001.ogg
THUD_LOW2=$SRC/impactSoft_heavy_000.ogg
THUD_PUNCH=$SRC/impactPunch_heavy_002.ogg
CLANK_HEAVY=$SRC/impactMetal_heavy_003.ogg
CLANK_RING=$SRC/impactMetal_medium_000.ogg
CLANK_RING2=$SRC/impactMetal_medium_001.ogg
BONG=$SRC/bong1.wav
BING=$SRC/bing1.wav
ENGINE=$SRC/engineCircular_002.ogg
STEP1=$SRC/footstep_concrete_000.ogg
STEP2=$SRC/footstep_concrete_003.ogg
CLICK1=$SRC/click_004.ogg
CLICK2=$SRC/click_005.ogg
COINS=$SRC/handleCoins.ogg
BEEP_HI=$SRC/error_001.ogg
BEEP_LO=$SRC/error_002.ogg
BARK=$SRC/question_003.ogg
JING_WIN=$SRC/jingles_NES12.ogg
JING_LOSE=$SRC/jingles_NES07.ogg
JING_FANFARE=$SRC/jingles_NES00.ogg

# ---- the shared chain (steps 2-6; 1 and 7 are in render()) ----------------
THEME='highpass=f=35,equalizer=f=100:t=q:w=1:g=2,equalizer=f=3200:t=q:w=1:g=-3,lowpass=f=9500,acrusher=bits=10:mode=log:aa=1:samples=2:mix=0.5,volume=4dB,asoftclip=type=tanh,aecho=0.85:0.5:35|70:0.2|0.1'

# render NAME SECONDS -- ffmpeg input args are in the array `IN`, the layer
# graph (ending in label [mix]) in GRAPH. Output: $OUT/NAME.mp3
render() {
  local name=$1 secs=$2 raw="$WORK/$1.wav" peak gain pre= i n=$(( ${#IN[@]} / 4 ))
  for ((i = 0; i < n; i++)); do pre+="[$i]aresample=22050[r$i];"; done # step 1
  ffmpeg -y -v error "${IN[@]}" -filter_complex \
    "${pre}${GRAPH};[mix]apad=pad_dur=0.2,atrim=0:${secs},${THEME},atrim=0:${secs},afade=t=out:st=$(awk "BEGIN{print $secs-0.05}"):d=0.05[out]" \
    -map '[out]' -ac 1 -ar 22050 "$raw"
  peak=$(ffmpeg -v info -i "$raw" -af volumedetect -f null - 2>&1 | sed -n 's/.*max_volume: \(-\{0,1\}[0-9.]*\) dB.*/\1/p')
  gain=$(awk "BEGIN{print -2 - ($peak)}")
  ffmpeg -y -v error -i "$raw" -af "volume=${gain}dB" -ac 1 -ar 22050 -c:a libmp3lame -b:a 48k -map_metadata -1 -id3v2_version 0 "$OUT/$name.mp3"
}
# Each input is downmixed to mono and resampled to 22.05 kHz as [r0], [r1], ...
I() { IN+=(-ac 1 -i "$1"); }
newjob() { IN=(); GRAPH=; }

# ---- the effects -----------------------------------------------------------
# boom: a shell exploding. Broadband explosion body + sub thump + crunchy tail.
newjob; I "$EXPLOSION"; I "$SUB"; I "$CRUNCH"
GRAPH='[r0]volume=1.0[a];[r1]volume=0.9[b];[r2]adelay=40,volume=0.5[c];[a][b][c]amix=inputs=3:normalize=0:duration=longest[mix]'
render boom 1.4

# launch: the shell leaving the barrel. Cannon shot + crack + low chest + a
# short metallic ring of the barrel.
newjob; I "$CANNON"; I "$CRACK"; I "$THUD_LOW2"; I "$CLANK_RING2"
GRAPH='[r0]atrim=0:0.8,afade=t=out:st=0.5:d=0.3[a];[r1]volume=0.6[b];[r2]atrim=0:0.4,volume=0.5[c];[r3]adelay=30,volume=0.3[d];[a][b][c][d]amix=inputs=4:normalize=0:duration=longest[mix]'
render launch 0.8

# clank: a shell hitting armour. Heavy plate strike + ringing partials.
newjob; I "$CLANK_HEAVY"; I "$CLANK_RING"; I "$BONG"
GRAPH='[r0]volume=1.0[a];[r1]volume=0.6[b];[r2]atrim=0:0.5,afade=t=out:st=0.2:d=0.3,volume=0.35[c];[a][b][c]amix=inputs=3:normalize=0:duration=longest[mix]'
render clank 0.55

# thud: a tank landing. Low soft impact + a punch of mid body.
newjob; I "$THUD_LOW"; I "$THUD_PUNCH"
GRAPH='[r0]volume=1.0[a];[r1]volume=0.5[b];[a][b]amix=inputs=2:normalize=0:duration=longest[mix]'
render thud 0.5

# move: tread clatter. Two track-link steps over a short engine rumble.
newjob; I "$ENGINE"; I "$STEP1"; I "$STEP2"
GRAPH='[r0]atrim=0:0.32,lowpass=f=500,afade=t=in:d=0.03,afade=t=out:st=0.2:d=0.12,volume=0.5[a];[r1]volume=0.9[b];[r2]adelay=130,volume=0.8[c];[a][b][c]amix=inputs=3:normalize=0:duration=longest[mix]'
render move 0.35

# click: a mechanical switch. A sharp tick and a short body.
newjob; I "$CLICK1"; I "$CLICK2"
GRAPH='[r0]volume=1.0[a];[r1]volume=0.8[b];[a][b]amix=inputs=2:normalize=0:duration=longest[mix]'
render click 0.08

# cash: a purchase. Coins plus a bell ting.
newjob; I "$COINS"; I "$BING"
GRAPH='[r0]volume=1.0[a];[r1]atrim=0:0.5,adelay=90,volume=0.6[b];[a][b]amix=inputs=2:normalize=0:duration=longest[mix]'
render cash 0.85

# warn: an alarm. Two alternating beeps, high then low, twice.
newjob; I "$BEEP_HI"; I "$BEEP_LO"; I "$BEEP_HI"; I "$BEEP_LO"
GRAPH='[r0]volume=1[a];[r1]adelay=170,volume=1[b];[r2]adelay=340,volume=1[c];[r3]adelay=510,volume=1[d];[a][b][c][d]amix=inputs=4:normalize=0:duration=longest[mix]'
render warn 0.7

# bark: a drone's radio chirp. Voice-like blip through a narrow radio band.
newjob; I "$BARK"
GRAPH='[r0]highpass=f=500,lowpass=f=3200,volume=1.0[mix]'
render bark 0.35

# win: a round won. A rising 8-bit jingle.
newjob; I "$JING_WIN"
GRAPH='[r0]volume=1.0[mix]'
render win 0.95

# lose: a life lost. A falling 8-bit jingle, pitched down a minor third.
newjob; I "$JING_LOSE"
GRAPH='[r0]asetrate=22050*0.84,aresample=22050,volume=1.0[mix]'
render lose 0.9

# fanfare: the match ends in glory. The long 8-bit fanfare with a held finish.
newjob; I "$JING_FANFARE"
GRAPH='[r0]volume=1.0[mix]'
render fanfare 1.8

echo "built into $OUT:"
ls -l "$OUT"/*.mp3
