#!/usr/bin/env bash
# Deploy www.cs to www.cs.siue.edu, skipping it when the server already has
# exactly this content.
#
# The deploy set is git's view of the working tree (tracked files plus new
# ones .gitignore does not exclude, uncommitted edits included), narrowed to
# what the site serves. It is staged with symlinks resolved and modes fixed
# (umask on the host makes plain uploads 640, which PHP cannot read), then
# hashed with scripts/deploy-hash. The host keeps that hash and the file
# list in .deploy-hash: equal hash, nothing to do; otherwise only files
# whose line changed are uploaded, and the stamp is written last so an
# interrupted deploy retries.
#
# A deploy logs in exactly once. One ssh master connection authenticates with
# the password; every scp and sftp rides its control socket and never
# authenticates again. Nothing is retried: the server's fail2ban bans an IP
# after repeated logins, so a failed connection stops the deploy.
#
#   FORCE=1   upload everything even when the hash matches
#   DRY_RUN=1 show what would change, upload nothing
#   PRUNE=1   also delete stale files: ones the last deploy sent (they are
#             in the host's .deploy-hash manifest) that this one does not
#   LIST=1    print the deploy set, one path per line, and stop (no host,
#             no password needed)
set -euo pipefail

cd "$(dirname "$0")"
repo=$(git rev-parse --show-toplevel)
HOST=${HOST:-wgrim@www.cs.siue.edu}
PASSFILE=${SSHPASS_FILE:-$HOME/.ssh/.passwd.siue}
STAMP=.deploy-hash
# Runtime data the server writes; never upload over it.
SCORES=games/cylon/data/scores.json

# Shared game links must preview the game: refuse to ship a stale site page.
if ! php tools/site-game-pages.php --check; then
  echo "deploy: run php tools/site-game-pages.php and commit the result" >&2
  exit 1
fi

# Each game rebuilds its own install files (manifest, service worker) with
# the tool in its folder: refuse a stale one.
for tool in games/*/tools/install-files.php; do
  if ! php "$tool" --check; then
    echo "deploy: run php $tool and commit the result" >&2
    exit 1
  fi
done

# The home page's own ?v= cache-busters (site.css, main.js, the mounted game's
# css and entry module): refuse a stale one. It hashes games/cylon/dist/main.js,
# which the kit build check below guards.
if ! php tools/site-versions.php --check; then
  echo "deploy: run (cd games && npm run build), then php tools/site-versions.php, and commit the result" >&2
  exit 1
fi

# Tankity's data is edited in game.yaml and served as game.json: refuse a stale
# or invalid one.
if ! php games/tankity/tools/game-json.php --check; then
  echo "deploy: run php games/tankity/tools/game-json.php and commit the result" >&2
  exit 1
fi

# A game built with the shared kit ships its dist/: refuse a stale build or a
# failing type check.
if ! (cd games && npm ci --silent && npm run --silent check); then
  echo "deploy: run (cd games && npm run build) and commit dist/" >&2
  exit 1
fi

# The site's own scripts (main.js, play/play.js) are TypeScript in src/ too, with
# their compiler setup at the site root: refuse a stale build.
if ! (npm ci --silent && node tools/ts-build.mjs --check); then
  echo "deploy: run node tools/ts-build.mjs and commit the result" >&2
  exit 1
fi

# deploy-set.php plants probe files under games/zz-probe while it lists the set;
# a killed test could leave them behind, so a real deploy refuses to ship them.
if [ "${LIST:-0}" != 1 ] && [ -e games/zz-probe ]; then
  echo "deploy: games/zz-probe is a leftover of tests/php/DeploySetTest.php; delete it" >&2
  exit 1
fi

work=$(mktemp -d "${TMPDIR:-/tmp}/www-cs-deploy.XXXXXX")
ctl=
sock=
master=0
cleanup() {
  if [ "$master" = 1 ]; then
    ssh -o "ControlPath=$sock" -O exit "$HOST" >/dev/null 2>&1 || true
  fi
  rm -rf "$work" ${ctl:+"$ctl"}
}
trap cleanup EXIT
# The control socket lives in its own short directory: a unix socket path is
# limited to about 104 bytes on macOS, and $TMPDIR there (/var/folders/...)
# plus ssh's temporary suffix overflows it.
ctl=$(mktemp -d /tmp/dpl.XXXX)
sock=$ctl/m
stage=$work/stage
mkdir "$stage"

# Options that make scp and sftp use the master's connection instead of
# logging in again (ControlMaster=no: never open a connection of their own).
mux=(-o "ControlPath=$sock" -o ControlMaster=no)

# '-mkdir' on a directory that exists reports a Failure it then ignores;
# drop that line so real errors stand out. sftp ends its messages with CRLF.
sftp_batch() {
  sftp -q -oBatchMode=no "${mux[@]}" -b "$1" "$HOST" 2> >(tr -d '\r' | grep -v '^remote mkdir .*: Failure$' >&2) >/dev/null
}

# The admin login's database lives in admin/data/, the server's like the scores
# file: made when missing, never staged, uploaded, overwritten or pruned (the
# case arm above keeps it out of the manifest). PHP runs as the web user, not
# the site account, so the folder is 770 and the group it inherits from the
# setgid site root is what lets PHP in; other accounts cannot enter. Every
# line is '-'-prefixed so a refusal (such as a setgid bit this account may not
# set) never aborts the deploy; 770 comes first so a refused 2770 leaves 770. The folder is made right after admin/ and
# before the upload batch's chmod 755 on admin/, which clears admin/'s setgid.
admin_data_batch() {
  printf '%s\n' '-mkdir admin' '-mkdir admin/data' '-chmod 770 admin/data' '-chmod 2770 admin/data'
}
if [ "${ADMIN_BATCH:-0}" = 1 ]; then
  admin_data_batch
  exit 0
fi

# 1. Stage.
while IFS= read -r -d '' f; do
  [ -e "$f" ] || continue # deleted but still in the index
  case "$f" in
    "$SCORES") continue ;;
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
    games/*-test.* | games/*/test.sh | games/README.md | games/*/README.md | games/*/tools/* | games/*/test/* | games/*/protocol/* | games/tankity/game.yaml | games/tankity/audio/sfx/build_sfx.sh | games/tankity/audio/music/build_music.sh | games/*/fx-editor.* | games/*/fx/blender/* | games/*/dist/pow-bench.* | games/workroom/fonts/*) continue ;;
    games/*/package.json | games/*/package-lock.json | games/*/tsconfig.json | games/*/tsconfig.test.json | games/*/node_modules/* | games/*/.gitignore) continue ;;
    # Authoring sources (Git LFS audio and Blender scenes, see .gitattributes;
    # TypeScript in games/*/src/): never served.
    *.blend | *.blend1 | *.wav | *.flac | *.aif | *.aiff | games/*/src/*) continue ;;
    # The shared build kit, its tests and the games' build setup (the kit's
    # package files and each game's build.json; test/ is skipped above); the
    # built dist/ ships.
    games/_kit/* | games/node_modules/* | games/package.json | games/package-lock.json | games/.gitignore | games/*/build.json) continue ;;
    # Tankity's storage (its database, its run store) belongs to the server:
    # never staged, so never uploaded, never chmodded, and never in the
    # manifest a PRUNE reads.
    games/tankity/data/*) continue ;;
    # The admin login's storage (its database) likewise.
    admin/data/*) continue ;;
    # The admin login's pages, stylesheet, libraries and their .htaccess files
    # ship; its notes (README.md) and anything else under admin/ do not. A case
    # pattern's * crosses slashes, so a library's subfolder is refused first.
    admin/lib/*/*) continue ;;
    admin/lib/*.php | admin/lib/.htaccess) ;;
    admin/*/*) continue ;;
    admin/*.php | admin/admin.css | admin/.htaccess) ;;
    admin/*) continue ;;
    # The music workroom: its pages, API and library
    # (its stylesheet, scripts and fonts ship from games/workroom/dist/). Its tools, committed drafts and README stay home. A case
    # pattern's * also matches /, so each folder is named and anything deeper skipped.
    music/api/*/* | music/lib/*/*) continue ;;
    music/api/*.php | music/lib/*.php | music/lib/.htaccess) ;;
    music/*/*) continue ;;
    music/*.php | music/.htaccess) ;;
    music/*) continue ;;
    games/*) ;;
    # The site's generated page per game (navbar plus the game in a frame).
    play/*) ;;
    .htaccess) ;;
    */*) continue ;;
    *.html | *.js | *.css | *.php | *.png | *.ico | *.webmanifest) ;;
    *) continue ;;
  esac
  mkdir -p "$stage/$(dirname "$f")"
  cp -L "$f" "$stage/$f"
done < <(git ls-files -z --cached --others --exclude-standard --deduplicate -- .)
find "$stage" -type d -exec chmod 755 {} +
find "$stage" -type f -exec chmod 644 {} +

if [ "${LIST:-0}" = 1 ]; then
  (cd "$stage" && find . -type f | sed 's|^\./||' | LC_ALL=C sort)
  exit 0
fi

# Without a readable password file ssh would sit at a prompt forever.
if [ ! -r "$PASSFILE" ]; then
  echo "deploy: cannot read password file $PASSFILE (set SSHPASS_FILE)" >&2
  exit 1
fi

hash=$(python3 -I "$repo/scripts/deploy-hash" "$stage" --extra "$PWD/deploy.sh")
python3 -I "$repo/scripts/deploy-hash" "$stage" --manifest >"$work/manifest"

# 2a. The one login. -f returns once authentication succeeded and the master
# is in the background; ControlPersist=no ends it with -O exit (cleanup).
if ! sshpass -f "$PASSFILE" ssh -o "ControlPath=$sock" -o ControlMaster=yes -o ControlPersist=no -fN "$HOST"; then
  echo "deploy: could not connect to $HOST; not retrying — repeated logins trip the server's fail2ban" >&2
  exit 1
fi
master=1

# 2. Compare with the host's stamp. A missing stamp means a first deploy;
# any other failure stops here rather than guessing.
remote_hash=
: >"$work/remote-manifest"
if out=$(scp -q "${mux[@]}" "$HOST:$STAMP" "$work/remote-stamp" 2>&1); then
  remote_hash=$(sed -n '1s/^sha256 //p' "$work/remote-stamp")
  grep -v -e '^sha256 ' -e '^#' "$work/remote-stamp" >"$work/remote-manifest" || true
elif ! grep -qi 'no such file' <<<"$out"; then
  echo "deploy: could not read $HOST:$STAMP: $out" >&2
  exit 1
fi

if [ "$hash" = "$remote_hash" ] && [ "${FORCE:-0}" != 1 ]; then
  echo "www.cs: $HOST is up to date (${hash:0:12}); nothing to deploy"
  exit 0
fi

if [ "${FORCE:-0}" = 1 ] || [ ! -s "$work/remote-manifest" ]; then
  cut -d' ' -f3- "$work/manifest" >"$work/send"
else
  comm -13 <(sort "$work/remote-manifest") <(sort "$work/manifest") | cut -d' ' -f3- >"$work/send"
fi
# The recipe rides in the manifest as an "extra" line; it is never uploaded.
grep -v '^deploy.sh$' "$work/send" >"$work/files" || true

# Files the last deploy sent that this one does not have. Only paths in the
# host's manifest qualify, so the server's own files (scores, runs) never
# do. They are reported, and deleted only with PRUNE=1.
comm -23 <(cut -d' ' -f3- "$work/remote-manifest" | grep -v '^extra ' | sort) \
         <(cut -d' ' -f3- "$work/manifest" | sort) >"$work/gone" || true

prev=${remote_hash:0:12}
echo "www.cs: deploying ${hash:0:12} to $HOST (was ${prev:-nothing})"
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

admin_data_batch >"$work/admin-data"
sftp_batch "$work/admin-data"

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
if ! listing=$(printf 'ls -1 %s\n' "$scores_dir" | sftp -q -oBatchMode=no "${mux[@]}" -b - "$HOST" 2>&1); then
  echo "deploy: cannot list $scores_dir on $HOST; scores left untouched, rerun the deploy" >&2
  exit 1
fi
if ! grep -q "/$(basename "$SCORES")\$" <<<"$listing"; then
  echo '{"week":[],"alltime":[]}' >"$work/scores"
  chmod 666 "$work/scores"
  scp -q -p "${mux[@]}" "$work/scores" "$HOST:$SCORES"
  echo "  created $SCORES"
fi
printf 'chmod 666 %s\n' "$SCORES" >"$work/chmod"
sftp_batch "$work/chmod"

# 4. Stamp last.
{
  echo "sha256 $hash"
  echo "# $(date -u +%Y-%m-%dT%H:%M:%SZ) $(git describe --always --dirty 2>/dev/null || echo unknown)"
  cat "$work/manifest"
} >"$work/stamp"
chmod 644 "$work/stamp"
scp -q -p "${mux[@]}" "$work/stamp" "$HOST:$STAMP"

# 5. Read the stamp back on the same connection: the host must now hold this
# deploy's hash. A second deploy run to check would be a second login.
scp -q "${mux[@]}" "$HOST:$STAMP" "$work/stamp-check"
if [ "$(sed -n '1s/^sha256 //p' "$work/stamp-check")" != "$hash" ]; then
  echo "deploy: $HOST:$STAMP does not hold ${hash:0:12} after the upload" >&2
  exit 1
fi
echo "www.cs: deployed ${hash:0:12} (stamp verified)"
