#!/usr/bin/env bash
# Deploy the games to happystl.com, skipping when the host already holds
# exactly this content.
#
# The served set is the three games (Crete, Tankity, The CIC) as deploy.sh
# ships them: games/crete, games/tankity, games/cylon (dist/ plus the static
# assets they load relatively) and games/.htaccess. Visitor statistics live
# in the WordPress plugin on happystl.com, not here: the games' beacon posts
# to the WordPress REST endpoint, so neither stats/ nor the admin library
# ships. The CIC board lives in games/cylon/data/scores.json and Tankity's
# database in games/tankity/data/tankity.sqlite: both are server data, never
# staged here — the transfer-game-data workflow job moves the live copies,
# and the endpoints create empty ones when they are missing. games.php and
# hub.php are the SIUE hub's and are never sent; the WordPress pages are the hub.
#
# Paths are derived from this script, so it travels with the games: the games
# live one folder up, the site root one above that. The hash below is the
# scripts/deploy-hash format (mode, SHA-256, path), computed inline so the
# script needs nothing from the repository but the files it ships.
#
# A deploy logs in exactly once. One ssh master connection authenticates;
# every scp and sftp rides its control socket and never authenticates again.
# Nothing is retried: a failed connection stops the deploy.
#
#   HOST=...         DreamHost ssh target (default dh, the operator's alias)
#   SSH_KEY=...      private key file for the login (CI writes it from the
#                    'Dreamhost Deploys' 1Password item); when unset, ssh uses
#                    the agent or the alias's own key
#   SSHPASS_FILE=... password file, only when the login is a password (never
#                    set for DreamHost by the Makefile; the SIUE password
#                    file must never be offered to another host)
#   WEB_ROOT=...     the site root on the host (default happystl.com)
#   FORCE=1   upload everything even when the hash matches
#   DRY_RUN=1 show what would change, upload nothing
#   PRUNE=1   also delete stale files: ones the last deploy sent (they are
#             in the host's .deploy-hash-games manifest) that this one does
#             not
#   LIST=1    print the deploy set, one path per line, and stop (no host,
#             no key needed)
#   STAGE_DIR=... stage into that directory and stop (no host, no key needed)
set -euo pipefail

SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
GAMES_DIR=$(dirname "$SCRIPT_DIR")
SITE_DIR=$(dirname "$GAMES_DIR")
cd "$SITE_DIR"

HOST=${HOST:-dh}
SSH_KEY=${SSH_KEY:-}
SSHPASS_FILE=${SSHPASS_FILE:-}
WEB_ROOT=${WEB_ROOT:-happystl.com}
STAMP=games/.deploy-hash
# Server data the deploy never uploads over: the CIC board, created empty
# below when it is missing.
SCORES=games/cylon/data/scores.json

# Each game rebuilds its own install files (manifest, service worker) with
# the tool in its folder: refuse a stale one.
for tool in games/*/tools/install-files.php; do
  if ! php "$tool" --check; then
    echo "deploy-games: run php $tool and commit the result" >&2
    exit 1
  fi
done

# Tankity's data is edited in game.yaml and served as game.json: refuse a stale
# or invalid one.
if ! php games/tankity/tools/game-json.php --check; then
  echo "deploy-games: run php games/tankity/tools/game-json.php and commit the result" >&2
  exit 1
fi

# A game built with the shared kit ships its dist/: refuse a stale build or a
# failing type check. Only the three games this deploy ships are checked:
# `npm run check` would also check the music workroom, which this deploy
# does not ship and no CI job checks, so a stale workroom build would block
# the games deploy for no reason.
if ! (cd games && npm ci --silent); then
  echo "deploy-games: npm ci in games/ failed" >&2
  exit 1
fi
for game in crete tankity cylon; do
  if ! (cd games && node _kit/build/build.mjs "$game" --check && node _kit/build/icons.mjs "$game" --check); then
    echo "deploy-games: run (cd games && npm run build) and commit dist/" >&2
    exit 1
  fi
done

# deploy-set.php plants probe files under games/zz-probe while it lists the set;
# a killed test could leave them behind, so a real deploy refuses to ship them.
if [ "${LIST:-0}" != 1 ] && [ -e games/zz-probe ]; then
  echo "deploy-games: games/zz-probe is a leftover of tests/php/GamesDeploySetTest.php; delete it" >&2
  exit 1
fi

work=$(mktemp -d "${TMPDIR:-/tmp}/games-deploy.XXXXXX")
ctl=
sock=
master=0
cleanup() {
  if [ "$master" = 1 ]; then
    ssh -o "ControlPath=$sock" -O exit "$HOST" >/dev/null 2>&1 || true
  fi
  rm -rf "$work"
  # The control directory is a separate rm: ${ctl:+"$ctl"} would pass the
  # quotes through as part of the path (deploy.sh's ${ctl:+\"$ctl\"} leaks
  # the directory in /tmp after every deploy).
  [ -n "$ctl" ] && rm -rf "$ctl"
}
trap cleanup EXIT
# The control socket lives in its own short directory: a unix socket path is
# limited to about 104 bytes on macOS, and $TMPDIR there (/var/folders/...)
# plus ssh's temporary suffix overflows it.
ctl=$(mktemp -d /tmp/dplg.XXXX)
sock=$ctl/m
stage=$work/stage
mkdir "$stage"

# Options that make scp and sftp use the master's connection instead of
# logging in again (ControlMaster=no: never open a connection of their own).
mux=(-o "ControlPath=$sock" -o ControlMaster=no)

# '-mkdir' on a directory that exists reports a Failure it then ignores;
# drop that line so real errors stand out. sftp ends its messages with CRLF.
sftp_batch() {
  # Every path in a batch is relative to the login directory, but the
  # games live under WEB_ROOT: on DreamHost the login directory is the
  # account home, not the site root, so a batch without this step
  # uploads beside the site instead of into it (the first deploy did
  # exactly that: files landed in /home/happystl/games, the seed scp to
  # $WEB_ROOT/... then failed, and the games 404'd). Step into WEB_ROOT
  # first; the absolute scp paths already point there.
  local tmp rc
  tmp=$(mktemp)
  { printf 'cd %s\n' "$WEB_ROOT"; cat "$1"; } >"$tmp"
  sftp -q -oBatchMode=no "${mux[@]}" -b "$tmp" "$HOST" 2> >(tr -d '\r' | grep -v '^remote mkdir .*: Failure$' >&2) >/dev/null
  rc=$?
  rm -f "$tmp"
  return $rc
}

# 1. Stage.
while IFS= read -r -d '' f; do
  [ -e "$f" ] || continue # deleted but still in the index
  case "$f" in
    "$SCORES") continue ;;
    # Crete's shared bank runs on happystl.com (games/crete/tools/deploy-bank.sh),
    # never here: its endpoint, library, settings and a local checkout's data/.
    games/crete/endless-bank.php | games/crete/bank/* | games/crete/server/* | games/crete/data/*) continue ;;
    # Server data: Tankity's database and the admin login's database belong
    # to the server: never staged, so never uploaded, never chmodded, and
    # never in the manifest a PRUNE reads.
    games/tankity/data/* | admin/data/*) continue ;;
    # Development files that ride along with games: tests, maintainer notes
    # (README.md), each game's tools/ folder (generators for files that do
    # ship; nothing at runtime runs them), the room protocol fixtures
    # (games/*/protocol/, only the tests read them), games/tankity/game.yaml,
    # whose runtime form is the generated game.json (nothing fetches the
    # YAML), the sound-effect build script (the .mp3 files it builds do ship;
    # its sources are in games/*/src/ below), the effects editor and the
    # Blender script behind the effect sprites (the rendered sheets do ship),
    # Tankity's puzzle bench bundle (tools/pow-bench.html loads it),
    # and the TypeScript build setup (package*.json, tsconfig.json, tsconfig.test.json,
    # node_modules; the built dist/ ships, the TypeScript sources in src/ do
    # not). The workroom's font sources (games/workroom/fonts/: the build copies
    # them into dist/fonts/, which ships) are named exactly, because a pattern's *
    # crosses slashes and games/*/fonts/* would also match dist/fonts/.
    games/*-test.* | games/*/test.sh | games/*/README.md | games/*/tools/* | games/tools/* | games/*/test/* | games/*/protocol/* | games/tankity/game.yaml | games/tankity/audio/sfx/build_sfx.sh | games/tankity/audio/music/build_music.sh | games/*/fx-editor.* | games/*/fx/blender/* | games/*/dist/pow-bench.* | games/workroom/fonts/*) continue ;;
    games/*/package.json | games/*/package-lock.json | games/*/tsconfig.json | games/*/tsconfig.test.json | games/*/node_modules/* | games/*/.gitignore) continue ;;
    # Authoring sources (Git LFS audio and Blender scenes, see .gitattributes;
    # TypeScript in games/*/src/): never served.
    *.blend | *.blend1 | *.wav | *.flac | *.aif | *.aiff | games/*/src/*) continue ;;
    # The shared build kit, its tests and the games' build setup (the kit's
    # package files and each game's build.json; test/ is skipped above); the
    # built dist/ ships.
    games/_kit/* | games/node_modules/* | games/package.json | games/package-lock.json | games/.gitignore | games/*/build.json) continue ;;
    # The admin login's pages, stylesheet, libraries and their .htaccess files
    # stay on SIUE; nothing under admin/ ships with the games.
    admin/*) continue ;;
    # The visitor statistics live in the WordPress plugin; nothing under
    # stats/ ships with the games.
    stats/*) continue ;;
    games/*) ;;
    *) continue ;;
  esac
  mkdir -p "$stage/$(dirname "$f")"
  cp -L "$f" "$stage/$f"
done < <(git ls-files -z --cached --others --exclude-standard --deduplicate -- games/crete games/tankity games/cylon games/.htaccess)
find "$stage" -type d -exec chmod 755 {} +
find "$stage" -type f -exec chmod 644 {} +

if [ "${LIST:-0}" = 1 ]; then
  (cd "$stage" && find . -type f | sed 's|^\./||' | LC_ALL=C sort)
  exit 0
fi

if [ -n "${STAGE_DIR:-}" ]; then
  rm -rf "$STAGE_DIR"
  cp -a "$stage" "$STAGE_DIR"
  echo "staged into $STAGE_DIR"
  exit 0
fi

# The login: a key file when one is given, a password file when that is how
# the login works, else the agent or the host alias's own key. A readable
# password file is required when one is named, so ssh never sits at a prompt.
if [ -n "$SSH_KEY" ]; then
  [ -r "$SSH_KEY" ] || { echo "deploy-games: cannot read SSH key file $SSH_KEY" >&2; exit 1; }
elif [ -n "$SSHPASS_FILE" ] && [ ! -r "$SSHPASS_FILE" ]; then
  echo "deploy-games: cannot read password file $SSHPASS_FILE (set SSHPASS_FILE)" >&2
  exit 1
fi

# The hash: the scripts/deploy-hash format (mode, SHA-256, path, sorted by
# path; the recipe as an "extra" line), computed here so this script needs
# nothing from the repository but the files it ships.
cat >"$work/hash.py" <<'PYEOF'
import hashlib, os, stat, sys
def file_sha(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()
def manifest(tree, extras):
    lines = []
    for dirpath, dirnames, filenames in os.walk(tree):
        for name in dirnames + filenames:
            path = os.path.join(dirpath, name)
            if os.path.islink(path):
                raise SystemExit(f"deploy-games: refusing symlink in stage: {path}")
        for name in filenames:
            path = os.path.join(dirpath, name)
            rel = os.path.relpath(path, tree).replace(os.sep, "/")
            mode = stat.S_IMODE(os.stat(path).st_mode)
            lines.append(f"{mode:04o} {file_sha(path)} {rel}")
    lines.sort(key=lambda l: l.split(" ", 2)[2].encode())
    for path in extras:
        lines.append(f"extra {file_sha(path)} {os.path.basename(path)}")
    return lines
tree, *rest = sys.argv[1:]
manifest_flag = "--manifest" in rest
extras = [a for a in rest if a != "--manifest"]
lines = manifest(tree, extras)
if manifest_flag:
    print("\n".join(lines))
else:
    print(hashlib.sha256(("\n".join(lines) + "\n").encode()).hexdigest())
PYEOF
hash=$(python3 -I "$work/hash.py" "$stage" "$SCRIPT_DIR/deploy-games.sh")
python3 -I "$work/hash.py" "$stage" --manifest "$SCRIPT_DIR/deploy-games.sh" >"$work/manifest"

# 2a. The one login. -f returns once authentication succeeded and the master
# is in the background; ControlPersist=no ends it with -O exit (cleanup).
login=(ssh -o "ControlPath=$sock" -o ControlMaster=yes -o ControlPersist=no -fN)
[ -n "$SSH_KEY" ] && login+=(-i "$SSH_KEY")
if [ -n "$SSHPASS_FILE" ]; then
  if ! sshpass -f "$SSHPASS_FILE" "${login[@]}" "$HOST"; then
    echo "deploy-games: could not connect to $HOST; not retrying" >&2
    exit 1
  fi
elif ! "${login[@]}" "$HOST"; then
  echo "deploy-games: could not connect to $HOST; not retrying" >&2
  exit 1
fi
master=1

# 2. Compare with the host's stamp. A missing stamp means a first deploy;
# any other failure stops here rather than guessing.
remote_hash=
: >"$work/remote-manifest"
if out=$(scp -q "${mux[@]}" "$HOST:$WEB_ROOT/$STAMP" "$work/remote-stamp" 2>&1); then
  remote_hash=$(sed -n '1s/^sha256 //p' "$work/remote-stamp")
  grep -v -e '^sha256 ' -e '^#' "$work/remote-stamp" >"$work/remote-manifest" || true
elif ! grep -qi 'no such file' <<<"$out"; then
  echo "deploy-games: could not read $HOST:$WEB_ROOT/$STAMP: $out" >&2
  exit 1
fi

if [ "$hash" = "$remote_hash" ] && [ "${FORCE:-0}" != 1 ]; then
  echo "games: $HOST is up to date (${hash:0:12}); nothing to deploy"
  exit 0
fi

if [ "${FORCE:-0}" = 1 ] || [ ! -s "$work/remote-manifest" ]; then
  cut -d' ' -f3- "$work/manifest" >"$work/send"
else
  comm -13 <(sort "$work/remote-manifest") <(sort "$work/manifest") | cut -d' ' -f3- >"$work/send"
fi
# The recipe rides in the manifest as an "extra" line; it is never uploaded.
grep -v '^deploy-games.sh$' "$work/send" >"$work/files" || true

# Files the last deploy sent that this one does not have. Only paths in the
# host's manifest qualify, so the server's own files (scores, runs) never
# do. They are reported, and deleted only with PRUNE=1.
comm -23 <(cut -d' ' -f3- "$work/remote-manifest" | grep -v '^extra ' | sort) \
         <(cut -d' ' -f3- "$work/manifest" | sort) >"$work/gone" || true

prev=${remote_hash:0:12}
echo "games: deploying ${hash:0:12} to $HOST (was ${prev:-nothing})"
sed 's/^/  send  /' "$work/files"
if [ "${PRUNE:-0}" = 1 ]; then
  sed 's/^/  delete  /' "$work/gone"
else
  sed 's/^/  stale (left on server; PRUNE=1 deletes)  /' "$work/gone"
fi
if [ "${DRY_RUN:-0}" = 1 ]; then
  echo "DRY_RUN: nothing uploaded"
  exit 0
fi

# 3. Upload the changed files. sftp creates missing directories ('-' lets an
# existing one pass) and put -p keeps the staged 644 file modes. mkdir lands
# at the host umask (750, unreadable to the web server), so every staged
# directory is set to 755 on each deploy; there are only a handful.
{
  while IFS= read -r f; do
    d=$(dirname "$f")
    while [ "$d" != . ]; do echo "$d"; d=$(dirname "$d"); done
  done <"$work/files" | sort -u | awk '{ print length, $0 }' | sort -n | cut -d' ' -f2- | sed 's/^/-mkdir /'
  while IFS= read -r f; do
    printf 'put -p "%s" "%s"\n' "$stage/$f" "$f"
  done <"$work/files"
  (cd "$stage" && find . -mindepth 1 -type d | sed 's|^\./||' | sort) | sed 's/^/chmod 755 /'
} >"$work/batch"
if [ -s "$work/batch" ]; then
  sftp_batch "$work/batch"
fi
if [ "${PRUNE:-0}" = 1 ] && [ -s "$work/gone" ]; then
  # '-rm' so a file someone already removed by hand does not stop the batch.
  sed -e 's/^/-rm "/' -e 's/$/"/' "$work/gone" >"$work/prune"
  sftp_batch "$work/prune"
fi

# The scores file is the server's: create it only when a listing of its folder
# succeeds and does not show it, and keep it 666 so PHP (a different user) can
# write it in place. A failed listing stops here, before the stamp, so a
# network error can never replace live scores with an empty board.
scores_dir=$(dirname "$SCORES")
if ! listing=$(printf 'cd %s\nls -1 %s\n' "$WEB_ROOT" "$scores_dir" | sftp -q -oBatchMode=no "${mux[@]}" -b - "$HOST" 2>&1); then
  echo "deploy-games: cannot list $scores_dir on $HOST; scores left untouched, rerun the deploy" >&2
  exit 1
fi
if ! grep -q "/$(basename "$SCORES")\$" <<<"$listing"; then
  echo '{"week":[],"alltime":[]}' >"$work/scores"
  chmod 666 "$work/scores"
  scp -q -p "${mux[@]}" "$work/scores" "$HOST:$WEB_ROOT/$SCORES"
  echo "  created $WEB_ROOT/$SCORES"
fi
printf 'chmod 666 %s\n' "$SCORES" >"$work/chmod"
sftp_batch "$work/chmod"

# The game data folders are created by sftp mkdir at the host umask
# (0700 on DreamHost), and the upload batch's chmod pass only covers
# staged directories — games/tankity/data is server data and never
# staged, so it is never chmodded. Apache then cannot read the
# .htaccess inside and logs AH00529 on every data access. Set them
# 755 explicitly ('-' so a missing folder never stops the deploy).
{
  echo '-chmod 755 games/cylon/data'
  echo '-chmod 755 games/tankity/data'
  echo '-chmod 755 games/crete/data'
} >"$work/chmod-data"
sftp_batch "$work/chmod-data"

# 4. Stamp last.
{
  echo "sha256 $hash"
  echo "# $(date -u +%Y-%m-%dT%H:%M:%SZ) $(git describe --always --dirty 2>/dev/null || echo unknown)"
  cat "$work/manifest"
} >"$work/stamp"
chmod 644 "$work/stamp"
scp -q -p "${mux[@]}" "$work/stamp" "$HOST:$WEB_ROOT/$STAMP"

# 5. Read the stamp back on the same connection: the host must now hold this
# deploy's hash. A second deploy run to check would be a second login.
scp -q "${mux[@]}" "$HOST:$WEB_ROOT/$STAMP" "$work/stamp-check"
if [ "$(sed -n '1s/^sha256 //p' "$work/stamp-check")" != "$hash" ]; then
  echo "deploy-games: $HOST:$WEB_ROOT/$STAMP does not hold ${hash:0:12} after the upload" >&2
  exit 1
fi
echo "games: deployed ${hash:0:12} (stamp verified)"
