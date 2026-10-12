# Games Kit, Plan E: Tankity Music Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tankity's soundtrack grows from four to sixteen CC0 tracks in the same 16-bit action/chiptune style, all built by one script that pins each source by SHA-256 and normalizes loudness to one target, with a "♫ Title · Author" toast on Next song and a unit test that keeps `game.yaml`, `CREDITS.md` and `audio/music/` in agreement.

**Architecture:** `audio/music/build_music.sh` (modelled on `audio/sfx/build_sfx.sh`) downloads each source into a cache outside the repository, refuses any whose SHA-256 differs from its pin, and encodes it: stereo, 44.1 kHz, EBU R128 two-pass `loudnorm` to one target, 80 kbps mp3, metadata stripped. It also carries the tools that make track selection checkable (`--vet` reads an OpenGameArt page's License(s) field, `--sha`, `--probe`). The track player in `src/audio.ts` tells `onTrackStart` whether a track began because the player pressed Next song; `main.ts` shows the toast only for that cause. A new `test/music-catalog.test.mjs` is the agreement test.

**Tech Stack:** Bash (3.2-compatible, as macOS ships), ffmpeg with `loudnorm` and `libmp3lame`, curl, unzip, a SHA-256 tool; TypeScript 7 on `node:test`; the Tankity game folder `websites/www.cs/games/tankity/`.

**Spec:** `docs/superpowers/specs/2026-10-12-games-kit-design.md` (section 6.5 Music; PR row 17 of section 10). The code this plan changes is Plan A's result (the kit exists, Tankity is TypeScript under `src/`, tests are `*.test.mjs` under `test/`) plus the PRs that land before it, below.

**Landing order across plans:** difficulty PR → B6 ∥ C10 → B7 → (B8 ∥ B9) ∥ (C11 → C12 → C13) → B19 → D20 → D14 → D15 → D16 → E17 → row 18. (D20 is Plan D's storage PR, spec row 20.)

**Cross-plan dependencies:**
- The branch starts from `main` after Plan B's PR 6 and Plan C's PR 13 have merged (and rebases onto anything that lands after it starts). PR 6 rewrote `test/audio.test.mjs` onto `node:test` and the kit's fake audio context, and moved `src/audio.ts`'s context onto the kit's audio core; this plan's `test/audio-announce.test.mjs` uses that same `fakeAudioContext` from `games/_kit/test/audio.ts`.
- PR 13 replaced the toolbar with the status bar, the battlefield (`#field`: the canvas, the title card, the round banner and the one-line `#dialogue` chatter toast) and the control deck (`#btn-track` is Next song), deleted `tankity-toolbar.spec.mjs` and created `tankity-layout.spec.mjs`. The Next song toast lives inside `#field`, below `#dialogue`, and `tankity-layout`'s per-device check covers it (Task 7).

## Global Constraints

- The host is the sftp-only PHP 8.4 server; nothing is built there. What ships is static files plus the existing runtime PHP. `dist/` is checked in; the mp3 files under `audio/music/` are plain git (see `.gitattributes`: `*.mp3 binary`), the script and anything under `audio/**/src/**` is not deployed.
- Only tracks whose source page states CC0 in its License(s) field; each page's URL goes in `games/tankity/audio/CREDITS.md`.
- Sixteen tracks in all (the existing four plus twelve new). Battle Theme A stays first (the theme: the demo and intro always play `music[0]`).
- Music is 80 kbps stereo mp3 with metadata stripped, EBU R128 loudness-normalized to one target; the per-track `volume: 0.6` in `game.yaml` goes away.
- Pinned versions are unchanged (`typescript` `7.0.2`, `esbuild` `0.28.2`, `preact` `11.0.1`, `phpunit/phpunit` `^12`). This plan adds no dependency.
- Verify tooling before starting, not midway: Task 1 adds `build_music.sh --check-tools` and runs it first. Required: `ffmpeg` (with the `loudnorm` filter and `libmp3lame`), `curl`, `unzip`, `awk`, and `sha256sum` or `shasum`. Remediation: `brew install ffmpeg curl unzip coreutils` (Debian/Ubuntu: `apt-get install ffmpeg curl unzip coreutils`). The script needs no login.
- Never bind a port someone may be using (3000, 5173, 8000, 8080). Specs get the docker site's ephemeral port from `make url`.
- Never run browser specs without the e2e lock: always through `make e2e` / `tests/e2e/run.sh`.
- Agents run `make test` plus at most two browser specs locally (this plan: `tankity-audio.spec.mjs` and `tankity-layout.spec.mjs`); CI runs the selected specs in four shards.
- `make test` budgets: static checks ≤ 15 s, unit suites ≤ 45 s. The new unit tests are ffmpeg-free except the gated ones in Task 10, which skip when `ffmpeg` is absent and run in well under 10 s with it.
- New tests are idiomatic `node:test` (`test()` + `assert`) and do not use the `check()` bridge; spec row 18 turns them into `.test.ts`. This plan adds new test files and leaves `test/audio.test.mjs` (Plan B's `node:test` rewrite) alone.
- Comments say why, not what; no history ("kept from when…"); file headers one to five lines. Docs describe the current state only.
- Downloaded files are untrusted data: they live in the cache directory, are never executed, and Node/Python that reads them runs with `-I`/outside their directory. Nothing here interprets a download except `ffmpeg`/`unzip`.
- One PR for the whole plan (spec row 17): `games/tankity-music`. CI, the pr-fix loop on review comments, merge on green CI after pr-fix (William authorized merging on green; CodeRabbit rate-limited reviews do not block), deploy, a light live check, and a report that ends with a cache-busted `/play/tankity/?v=<sha>` link.
- Generated files are never hand-merged. This PR rewrites `dist/`, `sw.js`, `index.html`'s `?v=` values, `manifest.webmanifest` and `game.json`; after rebasing onto `main`, take either side of a conflict in them and rebuild: `cd websites/www.cs/games && npm run build && php tankity/tools/game-json.php && php tankity/tools/install-files.php`, then `cd websites/www.cs && php tools/site-versions.php`, and commit what they wrote. The mp3 files and `CREDITS.md` are not generated by those tools: a conflict in them is resolved by hand and then checked with `music-catalog.test.mjs`.
- Work happens in a worktree (`git worktree add .claude/worktrees/tankity-music -b games/tankity-music origin/main`); the main checkout stays on `main`.
- Commit messages end with:
  ```
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb
  ```

Shorthand used below (all paths are from the repository root):
`T` = `websites/www.cs/games/tankity`, `SITE` = `websites/www.cs`, `MUSIC` = `T/audio/music`, `SCRATCH` = the session scratchpad directory (never `/tmp`, never committed).

## Review Focus

1. **A page that lists CC0 beside, or instead of, another licence** (`CC-BY 3.0`, `CC-BY-SA`, `GPL`). Expected: only a License(s) field that includes `CC0` as one of its entries passes `--vet`, and the field's text is copied verbatim into `CREDITS.md`. Pinned by `music-build.test.mjs` (Task 1) and the catalog test's licence-cell rule (Task 4).
2. **A source that changed upstream after it was pinned** (the author re-uploads, a mirror serves HTML). Expected: the build stops with "checksum mismatch", writes nothing, and a cached file is re-verified on every use. Pinned by `music-build.test.mjs` (Task 1).
3. **One loud and one quiet track after the per-track volume is gone.** Expected: every mp3 lands within 1 LU of the one target, so Next song never jumps in level. Pinned by the gated loudness test (Task 10).
4. **A track that is a jingle, ambient drone, or has long silence or a fade-out at either end.** Expected: 40 to 240 s, steady dynamics (LRA ≤ 12 LU), no vocals; the player trims silence and cross-fades, so a long fade-out is the one thing the loop cannot hide. Pinned by the selection rules (Tasks 8–9) and the gated duration test (Task 10).
5. **Next song with one track, with Music muted, or the built-in synth songs.** Expected: no toast when nothing new starts, and a round change never toasts. Pinned by `audio-announce.test.mjs` (Task 6) and the `tankity-audio` spec (Task 7).

---

## File Structure

```
T/audio/music/build_music.sh          # create (Task 1), grows in Tasks 2-3, 8-9: sources, encode, --vet/--sha/--probe/--measure/--verify
T/audio/music/*.mp3                    # modify: the existing four rebuilt (Task 3); twelve added (Tasks 8-9)
T/audio/CREDITS.md                     # modify: Music table gains License field and SHA-256 columns (Task 4); rows added (Tasks 8-9)
T/game.yaml                            # modify: no per-track volume, comments, twelve entries (Tasks 3, 8-10)
T/game.json                            # regenerated by tools/game-json.php (Tasks 3, 8-9)
T/sw.js, T/index.html, T/manifest.webmanifest  # regenerated by tools/install-files.php (Tasks 3, 7, 9, 10)
T/test/music-build.test.mjs            # create (Task 1): the script's pure modes
T/test/music-catalog.test.mjs          # create (Task 4), extended in Task 10: game.yaml / CREDITS.md / audio/music / pins agree
T/src/track-toast.ts                   # create (Task 5): trackToastText + createTrackToast, DOM-free
T/test/track-toast.test.mjs            # create (Task 5)
T/src/audio.ts                         # modify (Task 6): onTrackStart(track, cause)
T/test/audio-announce.test.mjs         # create (Task 6)
T/src/main.ts, T/index.html, T/game.css, T/tsconfig.json  # modify (Task 7): the toast on the page, inside #field below #dialogue
SITE/tests/e2e/tankity-audio.spec.mjs  # modify (Task 7)
SITE/tests/e2e/tankity-layout.spec.mjs # modify (Task 7): the toast in the per-device no-overlap check
SITE/tests/e2e/select.mjs, select-test.mjs, SITE/deploy.sh  # modify (Task 10)
T/README.md                            # modify (Task 10)
```

Not touched: `src/ui/*`, `src/menu.ts`, the layout and key work of Plan C's PRs 11–13 (the Menu's phone "Next song" entry, `#menu-track`, calls `music.next()` and so gets the toast from Task 6 with no change here).

---

# PR 17: Tankity music

Branch `games/tankity-music`.

### Task 1: `build_music.sh` core: tool preflight, pins, fetch, vetting

**Files:**
- Create: `MUSIC/build_music.sh`
- Create: `T/test/music-build.test.mjs`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces (every later task relies on these modes and on the SOURCES format):
  - `bash build_music.sh --check-tools` : exit 0 if every tool the build needs is present, else exit 1 listing each missing tool with its install command.
  - `bash build_music.sh --vet PAGE_URL` : only `https://opengameart.org/content/...` pages. Prints `title:`, `license:` (comma-separated entries of the License(s) field), `tags:` and one `file:` line per audio/zip download link. Exit 0 only when the licence list includes `CC0`; exit 3 otherwise (it still prints what it found).
  - `bash build_music.sh --vet-html FILE` : the same parsing over a saved page (used by the tests).
  - `bash build_music.sh --sha URL` : downloads URL (cached) and prints its SHA-256.
  - `bash build_music.sh --verify` : for every pinned source, download (or reuse the cache), check the SHA-256, extract the member from a zip; prints `ok <slug>` per source; needs no ffmpeg.
  - SOURCES format, one per line between `# BEGIN SOURCES` and `# END SOURCES` inside a heredoc: `slug|download-url|sha256|member`. `slug` is the output file's base name (`slug.mp3`); `member` is the exact file name inside a `.zip` (empty for a direct audio file). Env overrides for tests: `MUSIC_SOURCES` (replaces the table), `MUSIC_CACHE` (the cache directory, default `${XDG_CACHE_HOME:-$HOME/.cache}/tankity-music`).
  - Functions later tasks extend: `encode SLUG INPUT OUTFILE` and `build OUTDIR` (Task 3), `probe FILE` and `measure DIR` (Task 3).

- [ ] **Step 0: Create the worktree and check the tools**

```bash
git fetch origin && git worktree add .claude/worktrees/tankity-music -b games/tankity-music origin/main
cd .claude/worktrees/tankity-music
```

(The script does not exist yet, so run the first check by hand:)

```bash
for t in ffmpeg curl unzip awk; do command -v $t >/dev/null || echo "MISSING $t"; done
command -v sha256sum >/dev/null || command -v shasum >/dev/null || echo "MISSING sha256sum/shasum"
ffmpeg -hide_banner -filters 2>&1 | grep ' loudnorm ' ; ffmpeg -hide_banner -encoders 2>&1 | grep libmp3lame
```

Expected: no `MISSING` line and one line each for `loudnorm` and `libmp3lame`. If anything is missing, install it with the commands in Global Constraints and re-run before going on.

- [ ] **Step 1: Write the failing test**

Create `T/test/music-build.test.mjs`:

```js
// build_music.sh's modes that need no ffmpeg: the licence reader and the SHA-256 pin.
// A pin that does not match must stop the build before anything is written.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtempSync, writeFileSync, rmSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const SCRIPT = join(import.meta.dirname, '..', 'audio', 'music', 'build_music.sh');
const run = (args, env = {}) => spawnSync('bash', [SCRIPT, ...args], { encoding: 'utf8', env: { ...process.env, ...env } });

/** The part of an OpenGameArt page the reader looks at, in the page's own markup. */
const page = (licenses, tags = ['chiptune']) => `<html><head><title>Level One | OpenGameArt.org</title></head><body>
<div class="field field-name-field-art-tags field-type-taxonomy-term-reference field-label-above"><div class="field-label">Tags:&nbsp;</div><div class="field-items">${tags.map(t => `<div class="field-item even"><a href="/art-search-advanced?field_art_tags_tid=${t}">${t}</a></div>`).join('')}</div></div>
<div class="field field-name-field-art-licenses field-type-taxonomy-term-reference field-label-above"><div class="field-label">License(s):&nbsp;</div><div class="field-items">${licenses.map(l => `<div class="field-item even"><div class='license-icon'><a href='http://example.org/l'><div class='license-name'>${l}</div></a></div></div>`).join('')}</div></div><div class="field field-name-collect field-type-ds field-label-above"><div class='license-name'>CC0</div></div>
<div class="field field-name-field-art-files field-type-file field-label-above"><div class="field-items"><a href="https://opengameart.org/sites/default/files/level%20one.ogg" type="audio/ogg">level one.ogg</a></div></div>
</body></html>`;

function vet(html) {
  const dir = mkdtempSync(join(tmpdir(), 'vet-'));
  try {
    const file = join(dir, 'page.html');
    writeFileSync(file, html);
    return run(['--vet-html', file]);
  } finally { rmSync(dir, { recursive: true, force: true }); }
}

test('a page whose License(s) field is CC0 passes and prints its facts', () => {
  const r = vet(page(['CC0']));
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /^title: Level One$/m);
  assert.match(r.stdout, /^license: CC0$/m);
  assert.match(r.stdout, /^tags: chiptune$/m);
  assert.match(r.stdout, /^file: https:\/\/opengameart\.org\/sites\/default\/files\/level%20one\.ogg$/m);
});

test('CC0 among several licences passes; the whole field is printed', () => {
  const r = vet(page(['CC-BY 3.0', 'CC0']));
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /^license: CC-BY 3\.0, CC0$/m);
});

test('a page without CC0 in its field is rejected, even if CC0 appears elsewhere on the page', () => {
  const r = vet(page(['CC-BY 3.0']));
  assert.equal(r.status, 3);
  assert.match(r.stdout, /^license: CC-BY 3\.0$/m);
});

test('a page with no License(s) field is rejected', () => {
  const r = vet('<html><title>x | OpenGameArt.org</title><body>CC0 everywhere</body></html>');
  assert.equal(r.status, 3);
});

test('only opengameart.org/content pages can be vetted', () => {
  assert.equal(run(['--vet', 'https://example.org/track']).status, 2);
});

/** A one-source table whose "download" is a local file, so no network is needed. */
function pinned(sha) {
  const dir = mkdtempSync(join(tmpdir(), 'pin-'));
  const src = join(dir, 'track.ogg');
  writeFileSync(src, 'not really audio');
  const real = createHash('sha256').update('not really audio').digest('hex');
  const env = { MUSIC_CACHE: join(dir, 'cache'), MUSIC_SOURCES: `t|file://${src}|${sha ?? real}|` };
  return { dir, env, real };
}

test('--verify accepts a source whose SHA-256 matches, and reuses the cache', () => {
  const p = pinned();
  try {
    const first = run(['--verify'], p.env);
    assert.equal(first.status, 0, first.stderr);
    assert.match(first.stdout, /^ok t$/m);
    assert.deepEqual(readdirSync(join(p.dir, 'cache')), [p.real]);
    rmSync(join(p.dir, 'track.ogg')); // a second run must not need the network or the file
    assert.equal(run(['--verify'], p.env).status, 0);
  } finally { rmSync(p.dir, { recursive: true, force: true }); }
});

test('--verify stops on a SHA-256 that does not match and caches nothing', () => {
  const p = pinned('0'.repeat(64));
  try {
    const r = run(['--verify'], p.env);
    assert.equal(r.status, 1);
    assert.match(r.stderr, /checksum mismatch/);
    assert.deepEqual(readdirSync(join(p.dir, 'cache')), []);
  } finally { rmSync(p.dir, { recursive: true, force: true }); }
});

test('a cached file that no longer matches its pin is not trusted', () => {
  const p = pinned();
  try {
    assert.equal(run(['--verify'], p.env).status, 0);
    writeFileSync(join(p.dir, 'cache', p.real), 'tampered');
    const r = run(['--verify'], p.env); // re-downloads from the file:// URL and succeeds again
    assert.equal(r.status, 0, r.stderr);
    rmSync(join(p.dir, 'track.ogg'));
    writeFileSync(join(p.dir, 'cache', p.real), 'tampered');
    assert.equal(run(['--verify'], p.env).status, 1);
  } finally { rmSync(p.dir, { recursive: true, force: true }); }
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `cd websites/www.cs/games/tankity && node --test test/music-build.test.mjs`
Expected: FAIL (the script does not exist; `bash` exits 127).

- [ ] **Step 3: Write the script**

Create `MUSIC/build_music.sh` (then `chmod +x`):

```bash
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
```

- [ ] **Step 4: Run the tests and the tool check**

Run: `chmod +x websites/www.cs/games/tankity/audio/music/build_music.sh && cd websites/www.cs/games/tankity && node --test test/music-build.test.mjs && bash audio/music/build_music.sh --check-tools`
Expected: all tests PASS; `all tools present`. (Empty SOURCES is fine for now: `--verify` over a `MUSIC_SOURCES` override is what the tests use.)

- [ ] **Step 5: Commit**

```bash
git add websites/www.cs/games/tankity/audio/music/build_music.sh websites/www.cs/games/tankity/test/music-build.test.mjs
git commit -m "Tankity music: build_music.sh preflight, SHA-256 pins and CC0 page vetting"
```

### Task 2: Pin the existing four sources

**Files:**
- Modify: `MUSIC/build_music.sh` (the SOURCES block)

**Interfaces:**
- Consumes: `--vet`, `--sha`, `--verify` from Task 1.
- Produces: four SOURCES lines whose slugs are `battle-theme-a`, `chiptune-level-1`, `awake-megawall-10`, `chiptune-level-3` (exactly the existing file base names), each with a verified SHA-256 and member. `source_audio` for each yields a file whose duration is within 1.5 s of the committed mp3 (57.3 s Awake!, 95.9 s Battle Theme A, 74.3 s Level 1, 81.9 s Level 3), which proves it is the same piece.

The four pages are in `CREDITS.md` today: `https://opengameart.org/content/battle-theme-a`, `https://opengameart.org/content/awake-megawall-10`, and `https://opengameart.org/content/5-chiptunes-action` (files "Level 1" and "Level 3").

- [ ] **Step 1: Read what each page offers**

```bash
cd websites/www.cs/games/tankity
for p in battle-theme-a awake-megawall-10 5-chiptunes-action; do bash audio/music/build_music.sh --vet https://opengameart.org/content/$p; echo "exit $?"; done
```

Expected: each prints `license: CC0`, `exit 0`, and `file:` lines (Battle Theme A offers `https://opengameart.org/sites/default/files/battleThemeA.mp3`; 5 Chiptunes (Action) offers one `.zip`). If a page shows a non-CC0 licence now, stop and report: the track cannot stay.

- [ ] **Step 2: Pin each download**

For every `file:` URL you will use: `bash audio/music/build_music.sh --sha <url>` prints the SHA-256 (and caches the file under its hash). For the zip, list the wavs to find the member names for Level 1 and Level 3:

```bash
unzip -l "${XDG_CACHE_HOME:-$HOME/.cache}/tankity-music/<sha-of-the-zip>"
```

Pick the members whose names say Level 1 and Level 3 (exact file name, no directory).

- [ ] **Step 3: Write the four lines and prove each is the same piece**

Replace the empty block between the markers with the four lines in the SOURCES format (`slug|url|sha|member`, keep the `# BEGIN SOURCES` / `# END SOURCES` marker lines). Then:

```bash
bash audio/music/build_music.sh --verify          # expect: ok <slug> x4
```

For each slug, compare lengths (the member path is printed by extracting it the way the build will; for a quick check unzip the member into `$SCRATCH` and run):

```bash
ffprobe -v error -show_entries format=duration -of csv=p=0 <extracted-source>
ffprobe -v error -show_entries format=duration -of csv=p=0 audio/music/<slug>.mp3
```

Expected: the two durations differ by under 1.5 s for all four. If a member does not match any existing track, try the other members of that zip; do not guess.

- [ ] **Step 4: Commit**

```bash
git add websites/www.cs/games/tankity/audio/music/build_music.sh
git commit -m "Tankity music: pin the four existing tracks' sources by SHA-256"
```

### Task 3: Encode, measure, choose the one loudness target, rebuild the four

**Files:**
- Modify: `MUSIC/build_music.sh` (add `encode`, `build`, `probe`, `measure`, their modes; set `TARGET_LUFS`)
- Modify: `MUSIC/*.mp3` (the four, rebuilt)
- Modify: `T/game.yaml:548-563` (drop `volume: 0.6`), `T/game.json` (regenerated)

**Interfaces:**
- Consumes: `source_audio`, `each_source`, `preflight build`, `TARGET_*` from Task 1; the four pins from Task 2.
- Produces: `bash build_music.sh [output-dir]` writes `slug.mp3` for every source; `--measure [dir]` prints `<LUFS> <file>` per mp3; `--probe FILE` prints `duration: <s>`, `loudness: <LUFS>`, `range: <LU>` for any audio file (used by the track selection tasks). Task 10's gated test reads `TARGET_LUFS=` from this file.

- [ ] **Step 1: Choose the target from what the game plays today**

Today's files are played at `volume: 0.6`, so the level a player hears is each file's loudness minus 4.44 dB (`20·log10(0.6)`). The new single target must keep the soundtrack about as loud as it is now against the effects. Before adding code, measure the committed files with a throwaway command:

```bash
cd websites/www.cs/games/tankity/audio/music
for f in battle-theme-a chiptune-level-1 awake-megawall-10 chiptune-level-3; do
  out=$(ffmpeg -nostdin -hide_banner -nostats -i $f.mp3 -af ebur128=framelog=quiet -f null - 2>&1)
  awk -v f=$f '/Integrated loudness:/{x=1;next} x&&$1=="I:"{printf "%s %.1f LUFS file, %.1f LUFS as played\n", f, $2, $2+20*log(0.6)/log(10); x=0}' <<<"$out"
done
```

Take the median of the four "as played" values, round to a whole LUFS, and clamp it to the range -18 to -14. That is `TARGET_LUFS`. Edit the `TARGET_LUFS=-16` line to the chosen value, and put the four measurements and the reasoning in a two-line comment above it (why this number, no dates).

- [ ] **Step 2: Add the encoder and the other modes**

Insert before the final `case` in `build_music.sh`:

```bash
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
```

and replace the final `case`'s last arm (`*) echo "usage: …"`) with these arms, so a bare invocation builds:

```bash
  --probe) probe "${2:?usage: --probe FILE}"; exit 0 ;;
  --measure) measure "${2:-$HERE}"; exit 0 ;;
  -*) echo "usage: build_music.sh [output-dir | --check-tools | --verify | --measure [dir] | --probe FILE | --sha URL | --vet PAGE_URL]" >&2; exit 2 ;;
  *) build "${1:-$HERE}"; exit 0 ;;
```

(`ffprobe` ships with ffmpeg; `preflight build` already proved ffmpeg is there.)

- [ ] **Step 3: Rebuild the four and check them**

```bash
cd websites/www.cs/games/tankity
bash audio/music/build_music.sh
bash audio/music/build_music.sh --measure
for f in audio/music/*.mp3; do ffprobe -v error -show_entries stream=channels,sample_rate,bit_rate:format=bit_rate,duration:format_tags -of default=nw=1 $f; done
```

Expected: `--measure` prints four values each within 1.0 of `TARGET_LUFS`; ffprobe shows `channels=2`, `sample_rate=44100`, a bit rate near 80000, and no `TAG:` lines. Play nothing; the numbers are the check.

- [ ] **Step 4: Remove the per-track volume**

In `game.yaml`, delete the four `volume: 0.6` lines in the `audio.music` list. In the same file's music comment block (the `music:` paragraph before `audio:`), change the `volume` line to:

```
#   volume   0 to 1, default 1. Leave it out: audio/music/build_music.sh puts
#            every file at one loudness, so no track needs a trim.
```

and the `credit` line to `#   credit   the author, shown beside the title in the Next song toast (max 120). The licence is in audio/CREDITS.md, not here.` Also change the preceding "stream-sized music at about 80 kbps" sentence to end with `... built by audio/music/build_music.sh.` Then:

```bash
php tools/game-json.php && php tools/install-files.php && php tools/game-json.php --check && php tools/install-files.php --check
```

Expected: no errors. The game.json diff is exactly `volume: 0.6` → `1` on four tracks plus nothing else.

- [ ] **Step 5: Run the tank's audio unit tests and commit**

Run: `sh test.sh`
Expected: PASS (it does not touch the music files' bytes).

```bash
git add websites/www.cs/games/tankity
git commit -m "Tankity music: encode through build_music.sh at one loudness target; drop per-track volume"
```

### Task 4: The agreement test, and CREDITS.md in its final shape

**Files:**
- Create: `T/test/music-catalog.test.mjs`
- Modify: `T/audio/CREDITS.md` (the `## Music (music/)` section)

**Interfaces:**
- Consumes: `game.json` (`audio.music[]`: `file`, `title`, `credit`, `volume`), `game.yaml`, the SOURCES block (`# BEGIN SOURCES`…`# END SOURCES`), the Music table in `CREDITS.md`.
- Produces: the CREDITS Music table format every later row follows (six cells):
  `| `file.mp3` | Title | Author | Source page | License field | Download SHA-256 |` where Title equals `game.yaml`'s `title`, Author equals its `credit`, Source page starts `https://opengameart.org/content/`, License field is the page's License(s) text verbatim (a comma-separated list that includes `CC0`), SHA-256 equals the pin in `build_music.sh`.

- [ ] **Step 1: Write the test (it fails against today's CREDITS.md)**

Create `T/test/music-catalog.test.mjs`:

```js
// The soundtrack is described in four places that must agree: game.yaml (what plays),
// audio/CREDITS.md (who made it, where, under what licence), audio/music/ (the files)
// and build_music.sh (how each file is made, pinned by SHA-256). game.json is read
// instead of parsing YAML: tools/game-json.php --check keeps it identical to game.yaml.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync, openSync, readSync, closeSync } from 'node:fs';
import { join } from 'node:path';

const GAME = join(import.meta.dirname, '..');
const MUSIC = join(GAME, 'audio', 'music');
const game = JSON.parse(readFileSync(join(GAME, 'game.json'), 'utf8'));
const tracks = game.audio.music;
const yaml = readFileSync(join(GAME, 'game.yaml'), 'utf8');
const credits = readFileSync(join(GAME, 'audio', 'CREDITS.md'), 'utf8');
const script = readFileSync(join(MUSIC, 'build_music.sh'), 'utf8');

const slugOf = file => file.replace(/^audio\/music\//, '').replace(/\.mp3$/, '');

/** The Music table's rows by file name. */
function creditRows() {
  const section = credits.split(/^## Music/m)[1] ?? '';
  const rows = new Map();
  for (const line of section.split('\n')) {
    if (!line.startsWith('| `')) continue;
    const cells = line.split('|').slice(1, -1).map(c => c.trim());
    assert.equal(cells.length, 6, `six cells in: ${line}`);
    const [file, title, author, page, license, sha] = cells;
    const name = file.replaceAll('`', '');
    assert.ok(!rows.has(name), `${name} is listed twice in CREDITS.md`);
    rows.set(name, { title, author, page, license, sha });
  }
  return rows;
}

/** build_music.sh's pins by slug. */
function pins() {
  const block = script.split('# BEGIN SOURCES\n')[1]?.split('# END SOURCES')[0] ?? '';
  const out = new Map();
  for (const line of block.split('\n')) {
    if (!line.trim() || line.startsWith('#')) continue;
    const [slug, url, sha, member] = line.split('|');
    assert.match(slug, /^[a-z0-9-]+$/, `slug: ${line}`);
    assert.match(url, /^https:\/\/opengameart\.org\/sites\/default\/files\/\S+$/, `url: ${line}`);
    assert.match(sha, /^[0-9a-f]{64}$/, `sha: ${line}`);
    assert.ok(!out.has(slug), `${slug} is pinned twice`);
    out.set(slug, { url, sha, member });
  }
  return out;
}

test('Battle Theme A is first: it is the theme the demo and intro play', () => {
  assert.equal(tracks[0].file, 'audio/music/battle-theme-a.mp3');
  assert.equal(tracks[0].title, 'Battle Theme A');
});

test('every track names an mp3 in audio/music/, a title and an author, and carries no volume', () => {
  for (const t of tracks) {
    assert.match(t.file, /^audio\/music\/[a-z0-9-]+\.mp3$/, t.file);
    assert.ok(t.title && t.title.length <= 60, `title: ${t.file}`);
    assert.ok(t.credit && t.credit.trim(), `credit: ${t.file}`);
    assert.doesNotMatch(t.credit, /CC0|licen[cs]e/i, `credit is the author, not the licence: ${t.file}`);
    assert.equal(t.volume ?? 1, 1, `${t.file} has a volume`);
  }
  const musicYaml = yaml.split(/^ {2}music:\n/m)[1]?.split(/^\S/m)[0] ?? '';
  assert.doesNotMatch(musicYaml, /^\s*volume:/m, 'game.yaml sets a per-track volume');
  assert.equal(new Set(tracks.map(t => t.file)).size, tracks.length, 'a file is listed twice');
  assert.equal(new Set(tracks.map(t => t.title)).size, tracks.length, 'a title is used twice');
});

test('audio/music/ holds exactly the listed mp3 files and the build script', () => {
  const onDisk = readdirSync(MUSIC).sort();
  const want = [...tracks.map(t => t.file.replace('audio/music/', '')), 'build_music.sh'].sort();
  assert.deepEqual(onDisk, want);
  let total = 0;
  for (const t of tracks) {
    const size = statSync(join(GAME, t.file)).size;
    assert.ok(size > 100_000 && size <= 2_500_000, `${t.file} is ${size} bytes`);
    total += size;
  }
  assert.ok(total <= 18_000_000, `the soundtrack is ${total} bytes`);
});

test('CREDITS.md has one row per track, with the same title and author as game.yaml', () => {
  const rows = creditRows();
  assert.deepEqual([...rows.keys()].sort(), tracks.map(t => t.file.replace('audio/music/', '')).sort());
  for (const t of tracks) {
    const row = rows.get(t.file.replace('audio/music/', ''));
    assert.equal(row.title, t.title, `title of ${t.file}`);
    assert.equal(row.author, t.credit, `author of ${t.file}`);
  }
});

test('every CREDITS.md row states CC0 in the page licence field and links the page', () => {
  for (const [file, row] of creditRows()) {
    assert.match(row.page, /^https:\/\/opengameart\.org\/content\/[a-z0-9-]+$/, `page of ${file}`);
    assert.match(row.license, /(^|, )CC0(,|$)/, `License(s) text of ${file}: ${row.license}`);
    assert.match(row.sha, /^[0-9a-f]{64}$/, `SHA-256 of ${file}`);
  }
});

test('build_music.sh pins exactly the listed tracks, with the SHA-256 CREDITS.md records', () => {
  const pinned = pins();
  assert.deepEqual([...pinned.keys()].sort(), tracks.map(t => slugOf(t.file)).sort());
  const rows = creditRows();
  for (const [slug, pin] of pinned) {
    assert.equal(rows.get(`${slug}.mp3`).sha, pin.sha, `SHA-256 of ${slug}`);
  }
});

test('the files carry no ID3 tags', () => {
  for (const t of tracks) {
    const fd = openSync(join(GAME, t.file), 'r');
    try {
      const head = Buffer.alloc(3);
      readSync(fd, head, 0, 3, 0);
      assert.notEqual(head.toString('latin1'), 'ID3', `${t.file} starts with an ID3v2 tag`);
      const size = statSync(join(GAME, t.file)).size;
      const tail = Buffer.alloc(3);
      readSync(fd, tail, 0, 3, size - 128);
      assert.notEqual(tail.toString('latin1'), 'TAG', `${t.file} ends with an ID3v1 tag`);
    } finally { closeSync(fd); }
  }
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `cd websites/www.cs/games/tankity && node --test test/music-catalog.test.mjs`
Expected: FAIL in the CREDITS.md tests (rows have four cells, titles differ: "Action Chiptune, Level 1" vs `game.yaml`'s "Action Chiptune 1"); the file, tag and volume tests PASS.

- [ ] **Step 3: Rewrite the Music section of `CREDITS.md`**

Replace everything from `## Music (`music/`)` to the end of the file with the text below, then fill the four rows from facts you already have: Title and Author come from `game.yaml` (`Battle Theme A` / `cynicmusic`; `Action Chiptune 1` / `Juhani Junkala`; `Awake! (Megawall-10)` / `cynicmusic`; `Action Chiptune 3` / `Juhani Junkala`), the page from the existing table, the licence text from `--vet`'s `license:` line (run it again if unsure), and the SHA-256 from the pins. Keep the rows in `game.yaml` order.

```markdown
## Music (`music/`)

Each file is the author's track, loudness-normalised to one level and encoded
as stereo mp3 at 80 kbps with metadata stripped by `music/build_music.sh`,
which downloads the source and refuses it unless its SHA-256 (last column)
matches. Each page below states CC0 in its License(s) field, copied exactly
into the table. The author is the composer the page names; OpenGameArt's own
"Author" line shows who uploaded it.

| File | Title | Author | Source page | License field | Download SHA-256 |
|---|---|---|---|---|---|
| `battle-theme-a.mp3` | Battle Theme A | cynicmusic | https://opengameart.org/content/battle-theme-a | CC0 | <sha> |
```

(The one row above shows the shape; write all four, each with its real SHA-256. cynicmusic's site is https://cynicmusic.com and Juhani Junkala's pack is "5 Chiptunes (Action)"; keep those as one sentence under the table, not in the cells.)

- [ ] **Step 4: Run the test to verify it passes, then commit**

Run: `node --test test/music-catalog.test.mjs`
Expected: PASS (all seven).

```bash
git add websites/www.cs/games/tankity/test/music-catalog.test.mjs websites/www.cs/games/tankity/audio/CREDITS.md
git commit -m "Tankity music: a test that game.yaml, CREDITS.md, audio/music and the pins agree"
```

### Task 5: The toast's text and timer

**Files:**
- Create: `T/src/track-toast.ts`
- Create: `T/test/track-toast.test.mjs`
- Modify: `T/tsconfig.json` (the DOM-free program's `files`)

**Interfaces:**
- Consumes: `Timers` from `websites/www.cs/games/_kit/ports.ts` (`setTimeout(fn, ms): number`, `clearTimeout(id)`, `setInterval`, `clearInterval`); `manualClock()` from `_kit/test/clock.ts` in the test.
- Produces:
  - `trackToastText(track: { file: string; title?: string; credit?: string }): string` : `♫ Title · Author`; just `♫ Title` without an author; the file's base name stands in for a missing title.
  - `interface ToastHost { textContent: string | null; hidden: boolean }`
  - `createTrackToast(host: ToastHost, timers: Timers, ms?: number): { show(text: string): void }` : shows the text, hides it `ms` (default 4000) later; a second `show` restarts the wait and leaves exactly one timer.

- [ ] **Step 1: Write the failing test**

Create `T/test/track-toast.test.mjs`:

```js
// The Next song announcement: what it says, and that it goes away on its own.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { manualClock } from '../../_kit/test/clock.ts';
import { createTrackToast, trackToastText } from '../src/track-toast.ts';

test('the text is the title and the author', () => {
  assert.equal(trackToastText({ file: 'audio/music/battle-theme-a.mp3', title: 'Battle Theme A', credit: 'cynicmusic' }), '♫ Battle Theme A · cynicmusic');
});

test('without an author it is just the title', () => {
  assert.equal(trackToastText({ file: 'a.mp3', title: 'Only Title' }), '♫ Only Title');
  assert.equal(trackToastText({ file: 'a.mp3', title: 'Only Title', credit: '   ' }), '♫ Only Title');
});

test('without a title the file name stands in', () => {
  assert.equal(trackToastText({ file: 'audio/music/battle-theme-a.mp3', credit: 'x' }), '♫ battle-theme-a · x');
});

test('the toast shows its text and hides itself after the wait', () => {
  const clock = manualClock();
  const host = { textContent: '', hidden: true };
  const toast = createTrackToast(host, clock.timers, 4000);
  toast.show('♫ A · b');
  assert.deepEqual([host.hidden, host.textContent], [false, '♫ A · b']);
  clock.advance(3999);
  assert.equal(host.hidden, false);
  clock.advance(1);
  assert.deepEqual([host.hidden, host.textContent], [true, '']);
  assert.equal(clock.pending(), 0);
});

test('a second song restarts the wait and leaves one timer', () => {
  const clock = manualClock();
  const host = { textContent: '', hidden: true };
  const toast = createTrackToast(host, clock.timers, 4000);
  toast.show('first');
  clock.advance(3000);
  toast.show('second');
  assert.equal(clock.pending(), 1);
  clock.advance(3999);
  assert.deepEqual([host.hidden, host.textContent], [false, 'second']);
  clock.advance(1);
  assert.equal(host.hidden, true);
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `cd websites/www.cs/games/tankity && node --test test/track-toast.test.mjs`
Expected: FAIL (`track-toast.ts` not found).

- [ ] **Step 3: Write the module**

Create `T/src/track-toast.ts`:

```ts
/* The Next song announcement: the line's text and the timer that clears it.
 * DOM-free (it is handed the element and the timers), so Node tests it. */
import type { Timers } from '../../_kit/ports.ts';

/** What a toast needs from its element. */
export interface ToastHost { textContent: string | null; hidden: boolean }

/** "♫ Title · Author"; just "♫ Title" when no author is credited. */
export function trackToastText(track: { file: string; title?: string; credit?: string }): string {
  const title = track.title || track.file.replace(/^.*\//, '').replace(/\.[^.]*$/, '');
  const author = (track.credit ?? '').trim();
  return author ? `♫ ${title} · ${author}` : `♫ ${title}`;
}

export function createTrackToast(host: ToastHost, timers: Timers, ms = 4000): { show(text: string): void } {
  let timer = 0;
  return {
    show(text) {
      if (timer) timers.clearTimeout(timer);
      host.textContent = text;
      host.hidden = false;
      timer = timers.setTimeout(() => { host.hidden = true; host.textContent = ''; timer = 0; }, ms);
    },
  };
}
```

In `T/tsconfig.json` add `"src/track-toast.ts"` to the end of the `files` array (it is DOM-free by design).

- [ ] **Step 4: Run test and type-check**

Run: `node --test test/track-toast.test.mjs && node ../_kit/build/build.mjs tankity --check`
Expected: PASS; the build check passes (it type-checks the new module; `dist/` is unchanged because nothing imports it yet).

- [ ] **Step 5: Commit**

```bash
git add websites/www.cs/games/tankity/src/track-toast.ts websites/www.cs/games/tankity/test/track-toast.test.mjs websites/www.cs/games/tankity/tsconfig.json
git commit -m "Tankity music: the Next song toast's text and timer"
```

### Task 6: The player says why a track started

**Files:**
- Modify: `T/src/audio.ts` (the `onTrackStart` type and call, `nextTrack`, `stopMusic`, `playTrack`)
- Create: `T/test/audio-announce.test.mjs`

**Interfaces:**
- Consumes: `music.next()`, `music.forRound(round)`, `music.onTrackStart(cb)`, `initAudio`, `noteGesture` (all existing, on the kit's audio core since Plan B's PR 6); `fakeAudioContext` (`games/_kit/test/audio.ts`, Plan B Task 1).
- Produces: `export type TrackCause = 'auto' | 'next'` and `music.onTrackStart(callback: ((track: Track, cause: TrackCause) => void) | null): void`. `'next'` only when the track began because Next song stepped to it while more than one track exists and the music is not muted; the demo's theme, a round change, and a failover are `'auto'`.

- [ ] **Step 1: Write the failing test**

Create `T/test/audio-announce.test.mjs`:

```js
// Which track starts are announced as "Next song": only the ones the player asked for.
// Runs src/audio.ts against the kit's fake audio context and a fetch whose loads finish when the test says.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { initAudio, music, noteGesture } from '../src/audio.ts';
import { fakeAudioContext } from '../../_kit/test/audio.ts';

// The module makes its one context through the kit's audio core the first
// time a sound needs it; this fake is that context.
const ctx = fakeAudioContext();
globalThis.AudioContext = function AudioContext() { return ctx; };
const pending = {};
globalThis.fetch = file => new Promise(res => {
  pending[file] = () => res({ ok: true, arrayBuffer: () => Promise.resolve({ file }) });
});
const land = async file => { pending[file](); for (let i = 0; i < 10; i++) await new Promise(r => setTimeout(r, 0)); };

test('Next song is announced; the theme and a round change are not', async () => {
  initAudio({ sfx: {}, music: [{ file: 'a.mp3', title: 'A' }, { file: 'b.mp3', title: 'B' }, { file: 'c.mp3', title: 'C' }] });
  const started = [];
  music.onTrackStart((track, cause) => started.push(`${track.title}:${cause}`));
  noteGesture(false); // the theme
  await land('a.mp3');
  music.next();
  await land('b.mp3');
  music.forRound(2); // a round picks track 2 by itself
  await land('c.mp3');
  music.next(); // wraps to the theme, already decoded
  for (let i = 0; i < 10; i++) await new Promise(r => setTimeout(r, 0));
  music.stop();
  assert.deepEqual(started, ['A:auto', 'B:next', 'C:auto', 'A:next']);
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `cd websites/www.cs/games/tankity && node --test test/audio-announce.test.mjs`
Expected: FAIL (`started` is `['A:undefined', …]`).

- [ ] **Step 3: Implement**

In `T/src/audio.ts`:

Replace
```ts
let onTrackStart: ((track: Track) => void) | null = null;
```
with
```ts
/** Why a track began: a round, the theme or a failover chose it ('auto'), or the player stepped to it ('next'). */
export type TrackCause = 'auto' | 'next';
let onTrackStart: ((track: Track, cause: TrackCause) => void) | null = null;
/* Set by Next song until the track it asked for starts, so the announcement
   is about the player's choice and never about a round's. */
let nextPending = false;
```

In `playTrack`, replace
```ts
    trackFails = 0;
    const ac = audioCtx()!;
```
with
```ts
    trackFails = 0;
    const cause: TrackCause = nextPending ? 'next' : 'auto';
    nextPending = false;
    const ac = audioCtx()!;
```
and replace `if (onTrackStart) onTrackStart(t);` with `if (onTrackStart) onTrackStart(t, cause);`.

In `nextTrack`, replace
```ts
  trackIdx = ((trackPlay ? trackPlay.idx : trackIdx) + 1) % MUSIC_LIST.length;
```
with
```ts
  trackIdx = ((trackPlay ? trackPlay.idx : trackIdx) + 1) % MUSIC_LIST.length;
  // With one track, or the music muted, nothing new starts to announce.
  if (MUSIC_LIST.length > 1 && !musicMuted) nextPending = true;
```

In `stopMusic`, after `musicOn = false;` add `nextPending = false;`.

In the exported `music` object replace
```ts
  onTrackStart(callback: ((track: Track) => void) | null): void { onTrackStart = callback; },
```
with
```ts
  onTrackStart(callback: ((track: Track, cause: TrackCause) => void) | null): void { onTrackStart = callback; },
```
and its doc comment `/** Called once a track begins to play, with its game.json entry. */` with `/** Called once a track begins to play, with its game.json entry and why it began. */`.

- [ ] **Step 4: Run the new test and the existing audio test**

Run: `node --test test/audio-announce.test.mjs test/audio.test.mjs && node ../_kit/build/build.mjs tankity`
Expected: PASS. The build rewrites `dist/main.js` and its map; `main.ts` still passes a one-argument callback, which the new type accepts.

- [ ] **Step 5: Commit**

```bash
git add websites/www.cs/games/tankity/src/audio.ts websites/www.cs/games/tankity/test/audio-announce.test.mjs websites/www.cs/games/tankity/dist
git commit -m "Tankity music: the track player says whether Next song started a track"
```

### Task 7: Show the toast on the page

**Files:**
- Modify: `T/index.html` (inside `#field`, after `#dialogue`), `T/game.css` (after the `#dialogue span:first-child` rule), `T/src/main.ts` (the `music.onTrackStart(...)` line) and its imports
- Modify: `SITE/tests/e2e/tankity-audio.spec.mjs` (the "Next track steps through the soundtrack" test), `SITE/tests/e2e/tankity-layout.spec.mjs` (the per-device check)
- Regenerate: `T/dist/*`, `T/sw.js`, `T/index.html` hashes, `T/manifest.webmanifest`

**Interfaces:**
- Consumes: `trackToastText`, `createTrackToast` (Task 5); `music.onTrackStart(cb(track, cause))` (Task 6); `browserTimers` from `_kit/ports.browser.ts`; the page's `$` helper and `say`.
- Produces: an element `#track-toast` (`role="status"`, hidden by default) inside `#field`, directly below the `#dialogue` chatter toast, holding "♫ Title · Author" for 4 s after Next song.

- [ ] **Step 1: Extend the browser spec first**

In `tankity-audio.spec.mjs`, in `Next track steps through the soundtrack from the toolbar or the ] key`, replace

```js
  await page.click('#btn-track');
  await expect.poll(() => logText(page), { timeout: 15_000 }).toContain(`Now playing: ${config.audio.music[1].title}`);
  await page.keyboard.press(']');
  await expect.poll(() => logText(page), { timeout: 15_000 }).toContain(`Now playing: ${config.audio.music[2].title}`);
```

with

```js
  await expect(page.locator('#track-toast')).toBeHidden(); // the theme starting is not an announcement
  await page.click('#btn-track');
  await expect.poll(() => logText(page), { timeout: 15_000 }).toContain(`Now playing: ${config.audio.music[1].title}`);
  const song = n => `♫ ${config.audio.music[n].title} · ${config.audio.music[n].credit}`;
  await expect(page.locator('#track-toast')).toHaveText(song(1));
  await page.keyboard.press(']');
  await expect.poll(() => logText(page), { timeout: 15_000 }).toContain(`Now playing: ${config.audio.music[2].title}`);
  await expect(page.locator('#track-toast')).toHaveText(song(2));
```

and in the test `the demo plays the theme, loops it without a seam, and a round picks the next track`, after the line that expects `Now playing: ${config.audio.music[1].title}`, add `await expect(page.locator('#track-toast')).toBeHidden(); // a round change is not Next song`.

In `tankity-layout.spec.mjs`, add after `function smallTargets() { ... }`:

```js
/* The Next song toast, shown with a long title while a chatter line shows: it
   must sit inside the battlefield, below the chatter, on one line, and over
   neither bar nor any deck button. */
function toastProblems() {
  const probs = [];
  const dlg = document.getElementById('dialogue');
  dlg.hidden = false;
  document.getElementById('dlg-name').textContent = 'REAPER';
  document.getElementById('dlg-line').textContent = 'Wind check: hold that barrel steady and wait for it.';
  const toast = document.getElementById('track-toast');
  toast.textContent = '♫ Battle Theme A (Extended Mix) · A Composer With A Long Name';
  toast.hidden = false;
  const r = toast.getBoundingClientRect();
  const over = (a, b) => a.left < b.right - 0.5 && b.left < a.right - 0.5 && a.top < b.bottom - 0.5 && b.top < a.bottom - 0.5;
  const field = document.getElementById('field').getBoundingClientRect();
  if (r.top < field.top - 0.5 || r.bottom > field.bottom + 0.5 || r.left < field.left - 0.5 || r.right > field.right + 0.5) probs.push('toast leaves the battlefield');
  if (r.top < dlg.getBoundingClientRect().bottom - 0.5) probs.push('toast is not below the chatter');
  if (toast.getClientRects().length > 1 || getComputedStyle(toast).whiteSpace !== 'nowrap') probs.push('toast wraps');
  if (over(r, document.getElementById('hud-bar').getBoundingClientRect())) probs.push('toast over the status bar');
  for (const b of document.querySelectorAll('#deck button')) {
    if (b.getClientRects().length && over(r, b.getBoundingClientRect())) probs.push(`toast over ${b.id || b.dataset.aim}`);
  }
  toast.hidden = true;
  dlg.hidden = true;
  return probs;
}
```

and in the per-device test (`${dev[0]} ${dev[1]}×${dev[2]}: solo and room bars fit, the deck fits, the page fits`), directly after its `for (const room of [false, true]) { ... }` loop, add:

```js
    expect(await page.evaluate(toastProblems), 'track toast').toEqual([]);
```

- [ ] **Step 2: Run it to verify it fails**

Run: `cd websites/www.cs && make up >/dev/null && E2E_ARGS="tankity-audio.spec.mjs tankity-layout.spec.mjs" make e2e` (the e2e lock is taken by `make e2e`)
Expected: FAIL (`#track-toast` does not exist).

- [ ] **Step 3: Add the element, the style and the wiring**

`index.html`, inside `#field`, directly after the `#dialogue` element (its closing `</div>`, before the one that closes `#field`):

```html
        <div id="track-toast" class="track-toast" role="status" aria-live="polite" hidden></div>
```

`game.css`, directly after the `#dialogue span:first-child { … }` rule:

```css
/* The Next song announcement: one line inside the battlefield, under the
   chatter toast (#dialogue sits at top: 8px and is under 32 px tall), clipped
   with an ellipsis rather than wrapped. */
.track-toast {
  position: absolute; top: 44px; left: 50%; transform: translateX(-50%); z-index: 2;
  max-width: calc(100% - 16px); padding: 3px 10px;
  overflow: hidden; white-space: nowrap; text-overflow: ellipsis;
  background: rgba(12, 15, 46, 0.88); border: 1px solid var(--accent); border-radius: 999px;
  color: #fff; font-weight: 700; font-size: 0.72rem; line-height: 1.3;
  pointer-events: none;
}
.track-toast[hidden] { display: none; }
```

`main.ts`: replace its `import { browserStorage } from '../../_kit/ports.browser.ts';` with `import { browserStorage, browserTimers } from '../../_kit/ports.browser.ts';`, and add next to the other imports

```ts
import { createTrackToast, trackToastText } from './track-toast.ts';
```

and replace the line

```ts
music.onTrackStart(t => say(`Now playing: ${t.title || t.file}${t.credit ? ` (${t.credit})` : ''}.`, 'info'));
```

with

```ts
const trackToastHost = $('track-toast');
const trackToast = trackToastHost ? createTrackToast(trackToastHost, browserTimers) : null;
music.onTrackStart((t, cause) => {
  say(`Now playing: ${t.title || t.file}${t.credit ? ` (${t.credit})` : ''}.`, 'info');
  if (cause === 'next' && trackToast) trackToast.show(trackToastText(t));
});
```

(The radio log line stays: the spec and players rely on it.)

- [ ] **Step 4: Rebuild, regenerate, and run**

```bash
cd websites/www.cs/games/tankity
node ../_kit/build/build.mjs tankity && php tools/install-files.php && sh test.sh
cd ../.. && E2E_ARGS="tankity-audio.spec.mjs tankity-layout.spec.mjs" make e2e
```

Expected: unit suites PASS (the smoke test reads `index.html` and `main.ts`; if it lists known element ids, add `track-toast` to the list it checks), both specs PASS.

- [ ] **Step 5: Commit**

```bash
git add websites/www.cs/games/tankity websites/www.cs/tests/e2e/tankity-audio.spec.mjs websites/www.cs/tests/e2e/tankity-layout.spec.mjs
git commit -m "Tankity music: Next song shows a toast with the title and author, under the chatter"
```

### Task 8: Choose and add six new tracks (tracks 5 to 10)

**Files:**
- Modify: `MUSIC/build_music.sh` (SOURCES), `MUSIC/*.mp3` (six new), `T/audio/CREDITS.md` (six rows), `T/game.yaml` (six entries), `T/game.json`, `T/sw.js`, `T/index.html` (regenerated)

**Interfaces:**
- Consumes: `--vet`, `--sha`, `--probe`, `--verify`, the build (Tasks 1-3); the CREDITS row format (Task 4); the catalog test.
- Produces: six more pinned, built, credited and listed tracks. Task 9 repeats this with the next six; the catalog test passes after each task.

**Acceptance rules.** A candidate is accepted only if every rule holds; each is checkable by a command below, and the evidence lands in the CREDITS.md row (page URL, License field text, SHA-256) or the PR description (rejected candidates and why).

1. **Licence.** `build_music.sh --vet <page>` exits 0: the page's License(s) field lists `CC0`. Copy its `license:` line into the row verbatim. Only `https://opengameart.org/content/<slug>` pages qualify (the one place whose licence field this tool reads). A page that gives CC0 only in prose, comments or a linked pack page does not count.
2. **Style.** Compared case-insensitively, the page's `tags:` include at least one of `chiptune`, `8-bit`, `16-bit`, `retro`, `nes`, `snes`, `sid`, `fm`, `shooter`, `action`, `battle`, `boss`, `arcade`, or its description says so; and none of `vocals`, `vocal`, `lyrics`, `singing`, `orchestral`, `ambient`, `drone`, `piano`. The tracks are looping action music for a tank battle, so tracks tagged `menu`, `title` or `jingle` alone do not fit.
3. **Length and steadiness.** `--probe` on the source shows `duration` from 40 to 240 s and `range` (loudness range) at most 12 LU. Longer or more dynamic pieces are rejected, not cut.
4. **Downloadable source.** The page offers an `.mp3`, `.ogg`, `.wav` or `.flac` file, or a `.zip` holding one, on `https://opengameart.org/sites/default/files/`; `--sha` downloads it (the download is at most 60 MB).
5. **Pinned.** The download's SHA-256 is the one `--sha` printed, written into SOURCES and the CREDITS row, and `--verify` prints `ok` for it.
6. **Named author.** The page names the composer (in its text or title). The CREDITS Author cell and `game.yaml` `credit` are that name, not "Anonymous" and not the uploader unless the uploader is the composer.
7. **Variety.** No piece duplicates another (title or SHA); no author supplies more than 4 of the sixteen tracks (the four existing ones count); the new tracks do not all come from one pack.
8. **Fit for the disk.** The built mp3 is at most 2.5 MB (about 250 s).

- [ ] **Step 1: Search for candidates**

OpenGameArt's search filters by art type (12 is Music), licence (4 is CC0) and tag. Collect page slugs from several tags, a few pages each:

```bash
cd websites/www.cs/games/tankity
for tag in chiptune 8-bit retro nes shooter action battle boss; do
  for page in 0 1 2; do
    curl -fsSL -m 30 -A 'Mozilla/5.0' "https://opengameart.org/art-search-advanced?keys=&field_art_type_tid%5B%5D=12&field_art_licenses_tid%5B%5D=4&field_art_tags_tid=$tag&page=$page" |
      { grep -o 'href="/content/[^"]*"' || true; }
  done
done | sort | uniq -c | sort -rn | sed 's/href="//; s/"$//' > "$SCRATCH/music-leads.txt"
wc -l "$SCRATCH/music-leads.txt"
```

Listings match on the search filter, which is a lead, not evidence: a lead becomes a candidate only by passing rule 1 below. Skip the site's own pages the listing also returns (`/content/faq`, collections, challenge pages) and the four tracks already in use. Pages in earlier results that looked like good leads when this plan was written (unverified): `nes-shooter-music-5-tracks-3-jingles`, `4-chiptunes-adventure`, `great-boss`, `8-bit-slay-the-evil`, `8-bit-mechanical-complex`, `it-takes-a-hero`.

- [ ] **Step 2: Vet, probe, and record each candidate**

For each lead (work through them until you have six accepted):

```bash
bash audio/music/build_music.sh --vet https://opengameart.org/content/<slug>          # rules 1, 2, 4 (exit 0 and the lines it prints)
sha=$(bash audio/music/build_music.sh --sha <file url>)                                # rule 4, 5
# for a zip: unzip -l "${XDG_CACHE_HOME:-$HOME/.cache}/tankity-music/$sha"             # choose one member per track
bash audio/music/build_music.sh --probe <extracted source file>                        # rule 3
```

Append one line per candidate, accepted or not, to `$SCRATCH/music-candidates.tsv`: `slug  page  title  author  license-line  file-url  member  sha256  duration  range  tags  ACCEPT|REJECT(reason)`. A pack page with several good tracks yields several candidates (one member each); extract members into `$SCRATCH` to probe them. Never run or open anything you downloaded other than through ffmpeg/ffprobe/unzip.

- [ ] **Step 3: Choose six and name them**

Pick the six best accepted candidates by rule 7. The slug of each is its title in lower-case kebab (`[a-z0-9-]+`, at most 40 characters, unique among the sixteen): the slug becomes `audio/music/<slug>.mp3`. The `game.yaml` title is the title as the page gives it (at most 60 characters, no HTML entities).

- [ ] **Step 4: Add them to the script, CREDITS.md and game.yaml**

For each of the six, in that order:

- SOURCES: `slug|file-url|sha256|member` (a line before `# END SOURCES`).
- CREDITS.md: one row after the existing ones, in the Task 4 format: `| `slug.mp3` | Title | Author | https://opengameart.org/content/<page-slug> | <license line from --vet, verbatim> | <sha256> |`.
- `game.yaml`: append to `audio.music` (after the existing entries; the theme stays first):

```yaml
    - file: audio/music/<slug>.mp3
      title: <Title>
      credit: <Author>
```

(Quote a title that contains `: `, `#` or leading punctuation, as the existing `"Awake! (Megawall-10)"` is.)

- [ ] **Step 5: Build, regenerate and test**

```bash
bash audio/music/build_music.sh --verify
bash audio/music/build_music.sh
bash audio/music/build_music.sh --measure     # every value within 1.0 of TARGET_LUFS
php tools/game-json.php && php tools/install-files.php && sh test.sh
```

Expected: all `ok`; the existing four rebuild to identical bytes (check `git status`: only the six new mp3 files are added, no existing mp3 shows modified; if one does, the ffmpeg version differs from the one that built it, which is fine to commit only if `--measure` still holds, but note it in the PR); `test.sh` PASS including the catalog test with ten tracks.

- [ ] **Step 6: Commit**

```bash
git add websites/www.cs/games/tankity
git commit -m "Tankity music: six more CC0 tracks (5 to 10 of 16)"
```

### Task 9: Choose and add the last six tracks (tracks 11 to 16)

**Files:** the same set as Task 8.

**Interfaces:**
- Consumes: Task 8's procedure and rules, unchanged, and the ten tracks it leaves.
- Produces: the sixteenth track; the soundtrack is complete.

- [ ] **Step 1: Search, vet, probe, record**

Repeat Task 8 steps 1 and 2 against the same eight rules (the rule list in Task 8 applies in full to these six tracks; rule 7 now counts all ten tracks already listed). Reuse `$SCRATCH/music-leads.txt` and `$SCRATCH/music-candidates.tsv`: candidates already marked ACCEPT in Task 8 but not chosen are the first choice, and fresh leads (other tags such as `sid`, `snes`, `arcade`, `16-bit`, `fm`, and pages 3 to 5 of the listings) cover the rest.

- [ ] **Step 2: Choose six, add them, build**

Pick six; name, pin, credit and list them exactly as in Task 8 steps 3 and 4, then run Task 8 step 5's commands.
Expected: sixteen mp3 files; `--verify` prints sixteen `ok`; `--measure` prints sixteen values within 1.0 of `TARGET_LUFS`; `test.sh` PASS.

- [ ] **Step 3: Commit**

```bash
git add websites/www.cs/games/tankity
git commit -m "Tankity music: the last six CC0 tracks (11 to 16 of 16)"
```

### Task 10: Pin the final shape: sixteen tracks, gated audio checks, docs, selection rules

**Files:**
- Modify: `T/test/music-catalog.test.mjs`
- Modify: `T/README.md` (lines ~16, ~19, ~85-90), `T/game.yaml` (header note on the audio block, if it still says "four")
- Modify: `SITE/deploy.sh:108`, `SITE/tests/e2e/select.mjs:42`, `SITE/tests/e2e/select-test.mjs`

**Interfaces:**
- Consumes: the finished catalog (Tasks 8-9), `TARGET_LUFS` from the script (Task 3), `ffmpeg`/`ffprobe` if present.
- Produces: the guard that the soundtrack stays at sixteen and stays level; the deploy and selection rules that treat `build_music.sh` like `build_sfx.sh`.

- [ ] **Step 1: Add the failing sixteen-track and gated audio tests**

Append to `T/test/music-catalog.test.mjs` (add `import { spawnSync } from 'node:child_process';` at the top):

```js
test('the soundtrack is sixteen tracks', () => {
  assert.equal(tracks.length, 16);
});

test('no author supplies more than four of the sixteen', () => {
  const byAuthor = new Map();
  for (const t of tracks) byAuthor.set(t.credit, (byAuthor.get(t.credit) ?? 0) + 1);
  for (const [author, n] of byAuthor) assert.ok(n <= 4, `${author} has ${n} tracks`);
});

/** ffmpeg and ffprobe are dev tools: the audio checks run where they exist (a developer's machine) and skip elsewhere. */
const haveFfmpeg = spawnSync('ffmpeg', ['-version']).status === 0 && spawnSync('ffprobe', ['-version']).status === 0;
const targetLufs = Number(script.match(/^TARGET_LUFS=(-?[0-9.]+)/m)?.[1]);

test('the files are 80 kbps stereo mp3, 40 to 240 s, with no tags', { skip: !haveFfmpeg && 'ffmpeg is not installed' }, () => {
  for (const t of tracks) {
    const r = spawnSync('ffprobe', ['-v', 'error', '-of', 'json', '-show_entries', 'format=duration,bit_rate,format_name:format_tags:stream=channels,codec_name', join(GAME, t.file)], { encoding: 'utf8' });
    assert.equal(r.status, 0, r.stderr);
    const info = JSON.parse(r.stdout);
    assert.equal(info.streams[0].codec_name, 'mp3', t.file);
    assert.equal(info.streams[0].channels, 2, `${t.file} is not stereo`);
    assert.ok(Math.abs(Number(info.format.bit_rate) - 80_000) < 4_000, `${t.file} bit rate ${info.format.bit_rate}`);
    const seconds = Number(info.format.duration);
    assert.ok(seconds >= 40 && seconds <= 240, `${t.file} lasts ${seconds} s`);
    assert.equal(info.format.tags, undefined, `${t.file} carries tags`);
  }
});

test('every track sits within 1 LU of the one loudness target', { skip: !haveFfmpeg && 'ffmpeg is not installed' }, () => {
  assert.ok(Number.isFinite(targetLufs), 'TARGET_LUFS not found in build_music.sh');
  for (const t of tracks) {
    const r = spawnSync('ffmpeg', ['-nostdin', '-hide_banner', '-nostats', '-i', join(GAME, t.file), '-af', 'ebur128=framelog=quiet', '-f', 'null', '-'], { encoding: 'utf8' });
    assert.equal(r.status, 0, r.stderr);
    const lufs = Number(r.stderr.match(/Integrated loudness:\s*I:\s*(-?[0-9.]+) LUFS/)?.[1]);
    assert.ok(Number.isFinite(lufs), `no loudness for ${t.file}`);
    assert.ok(Math.abs(lufs - targetLufs) <= 1, `${t.file} is ${lufs} LUFS; the target is ${targetLufs}`);
  }
});
```

- [ ] **Step 2: Run them**

Run: `cd websites/www.cs/games/tankity && node --test test/music-catalog.test.mjs`
Expected: PASS with ffmpeg installed (it reads the committed files, so these pass the first time; if the loudness test fails for a track, the track was not built at the target: rebuild it). The point of writing them after the build is that they pin the finished state against future edits; break one on purpose (copy a track's bytes over another's slug in a scratch clone, or change `TARGET_LUFS`) to see each fail, then undo.

- [ ] **Step 3: Docs, deploy set and spec selection**

`README.md`: in the Files table row for `audio/sfx/`, `audio/music/`, `audio/CREDITS.md`, replace `Optional CC0 sound files named by game.yaml, and where each came from` with `Optional CC0 sound files named by game.yaml (sixteen music tracks built by audio/music/build_music.sh), and where each came from`. In the `src/audio.ts` row add `, and tells main.ts why a track started (the Next song toast)`. Add a row after it: `| src/track-toast.ts | The Next song toast's text ("♫ Title · Author") and its timer. DOM-free: it is handed the element and the timers |`. In the paragraph that begins "Audio plays only after the first tap", append: `Music is rebuilt with `bash audio/music/build_music.sh`: each source is pinned by SHA-256 and every track is normalised to one loudness (EBU R128), so a track needs no volume; add its row to CREDITS.md with the page's License(s) text, and `test/music-catalog.test.mjs` fails until game.yaml, CREDITS.md, audio/music/ and the pins agree.`

`deploy.sh` line 108: add `games/tankity/audio/music/build_music.sh` next to `games/tankity/audio/sfx/build_sfx.sh` in the `continue` list.

`select.mjs` line 42: change `audio/sfx/build_sfx\\.sh` to `audio/(sfx/build_sfx|music/build_music)\\.sh`. In `select-test.mjs` add, after the `sim-vectors-run-nothing` line:

```js
check('music-build-script-runs-nothing', select([`${S}games/tankity/audio/music/build_music.sh`, `${S}games/tankity/audio/sfx/build_sfx.sh`]), 'NONE');
```

`game.yaml`: if the audio header still describes the music as a short list ("four", "a few"), make it say how many without a number: "the music list is the soundtrack".

- [ ] **Step 4: Regenerate and run everything this plan can run**

```bash
cd websites/www.cs
node tests/e2e/select-test.mjs
php games/tankity/tools/game-json.php --check && php games/tankity/tools/install-files.php --check
make test
LIST=1 ./deploy.sh | grep -c 'audio/music/.*\.mp3'      # expect 16
LIST=1 ./deploy.sh | grep -c 'build_music.sh'           # expect 0
E2E_ARGS="tankity-audio.spec.mjs" make e2e
```

Expected: select-test all PASS; checks clean; `make test` within its budgets; sixteen mp3 files in the deploy list, no script; the audio spec PASS (its "every track is tried once" test now covers sixteen files). If `install-files.php --check` reports stale output, run `php games/tankity/tools/install-files.php` and include the regenerated files.

- [ ] **Step 5: Commit**

```bash
git add -A websites/www.cs/games/tankity websites/www.cs/deploy.sh websites/www.cs/tests/e2e
git commit -m "Tankity music: sixteen-track guards, docs, and deploy/spec rules for build_music.sh"
```

### Task 11: Ship the PR

**Files:** none new.

**Interfaces:**
- Consumes: the branch `games/tankity-music` with Tasks 1-10 committed.
- Produces: the merged, deployed PR and the report.

- [ ] **Step 1: Final gate in the worktree**

If `main` moved since the branch started, rebase onto it and rebuild the generated files (Global Constraints) before this gate. Run `make test` (from `websites/www.cs`) and `E2E_ARGS="tankity-audio.spec.mjs tankity-layout.spec.mjs" make e2e`. Both must pass. Do not run more specs locally; CI selects them (`select.mjs` maps `games/tankity/**` to the Tankity specs).

- [ ] **Step 2: Push and open the PR**

```bash
git push -u origin games/tankity-music
gh pr create --title "Tankity music: sixteen CC0 tracks, one loudness, Next song toast" --body-file "$SCRATCH/pr-body.md"
```

The body (write it to `$SCRATCH/pr-body.md`) must contain: what changed in four bullets (script, twelve tracks, normalization and removal of `volume`, toast); the tools it needs (`ffmpeg` with loudnorm and libmp3lame, curl, unzip, sha256sum or shasum) and the rebuild command; the chosen `TARGET_LUFS` with the four "as played" measurements it came from; a table of the twelve new tracks (title, author, page, License field text, SHA-256); the candidates that were rejected and the rule each failed; and "Please audition the soundtrack: the checks are numbers (level, length, tags), not ears." End with the attribution lines required for pull requests.

- [ ] **Step 3: Wait on the required checks, not the advisory ones**

Branch protection decides what is required. Poll with the exit status, not text:

```bash
if out=$(gh pr checks --required); then st=0; else st=$?; fi
```

`st` 0 is green, 8 is still pending (wait and poll again), anything else is a failure to read or a red check (read it before retrying). If `out` is empty and `st` is 0, protection may be missing: confirm with `gh api "repos/:owner/:repo/branches/main/protection"` (404 means none) and then gate on `gh run list --branch games/tankity-music` until the CI workflow's run is green. A CodeRabbit rate-limit comment does not block the merge. Run the pr-fix loop: fix real review findings, and answer each thread with a technical reason.

- [ ] **Step 4: Merge on green, deploy and live-check**

Merge on green CI after the pr-fix loop (`gh pr merge --squash`): William authorized merging on green. After the merge, the deploy workflow runs from `main`; when it is green, open `https://www.cs.siue.edu/play/tankity/?v=<merge sha>` (cache-busted), press any key, press `]`, and see the toast; run `E2E_BASE_URL=https://www.cs.siue.edu/ E2E_ARGS="tankity-audio.spec.mjs" make e2e` only if the tests/e2e README allows live runs; otherwise check by hand that `audio/music/` serves sixteen files (`curl -sI` on three of them returns 200 and `audio/mpeg`).

- [ ] **Step 5: Remove the merged worktree**

```bash
git -C .claude/worktrees/tankity-music merge-base --is-ancestor HEAD origin/main && git worktree remove .claude/worktrees/tankity-music && git branch -d games/tankity-music && git push origin --delete games/tankity-music
```

Report: the PR number, `TARGET_LUFS`, the sixteen titles, and the cache-busted play link.

---

## Self-review

**Spec coverage (6.5):** twelve new CC0 tracks, sixteen total, existing style, Battle Theme A first: Tasks 8-10 (rules 1-8; the first-track test in Task 4, the count in Task 10). CC0 in the page's license field and the URL in `CREDITS.md`: rule 1, `--vet`, the table's page and License-field columns, pinned by the catalog test (Task 4). `build_music.sh` that downloads by SHA-256, transcodes to 80 kbps stereo with metadata stripped, normalizes (EBU R128, one target): Tasks 1-3, with the existing four going through it (Tasks 2-3) and `volume: 0.6` removed (Task 3). Toast "♫ Title · Author" on Next song: Tasks 5-7. Unit test that `game.yaml`, `CREDITS.md` and `audio/music/` agree: Task 4 (plus the pins), extended in Task 10. Tooling preflight: Task 1 (`--check-tools`, Step 0, Global Constraints). Track selection as its own tasks with checkable rules and recorded evidence: Tasks 8-9.

**Placeholder scan:** the only values the plan cannot supply are the twelve tracks themselves and their pins; Tasks 8-9 define how they are found, accepted and recorded, and the format of each line. The `<sha>` in Task 4's row example is a shape marker for a value the implementer computes in Task 2.

**Type consistency:** `TrackCause`, `onTrackStart(track, cause)` (Task 6) is what `main.ts` consumes (Task 7); the new audio test uses Plan B's `fakeAudioContext`, and the toast's place (`#field`, below `#dialogue`) and its layout check use Plan C's PR 13 ids; `trackToastText` / `createTrackToast` / `ToastHost` (Task 5) match their use in Task 7; the SOURCES format (Task 1) is what Tasks 2, 4, 8 and the catalog parser (`slug|url|sha|member`) use; `TARGET_LUFS=` is read by Task 10's test with the regex `^TARGET_LUFS=(-?[0-9.]+)` that matches the line Task 1 writes and Task 3 edits.

**Review Focus:** each of the five lines has a test or rule in the task named on it.
