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
#   FORCE=1   upload everything even when the hash matches
#   DRY_RUN=1 show what would change, upload nothing
#   PRUNE=1   also delete stale files: ones the last deploy sent (they are
#             in the host's .deploy-hash manifest) that this one does not
set -euo pipefail

cd "$(dirname "$0")"
repo=$(git rev-parse --show-toplevel)
HOST=${HOST:-wgrim@www.cs.siue.edu}
PASSFILE=${SSHPASS_FILE:-$HOME/.ssh/.passwd.siue}
# Without a readable password file ssh would sit at a prompt forever.
if [ ! -r "$PASSFILE" ]; then
  echo "deploy: cannot read password file $PASSFILE (set SSHPASS_FILE)" >&2
  exit 1
fi
sshpass=(sshpass -f "$PASSFILE")
STAMP=.deploy-hash
# Runtime data the server writes; never upload over it.
SCORES=games/cylon/data/scores.json

# Shared game links must preview the game: refuse to ship stale share tags.
if ! php tools/game-share-tags.php --check; then
  echo "deploy: run php tools/game-share-tags.php and commit the result" >&2
  exit 1
fi

work=$(mktemp -d "${TMPDIR:-/tmp}/www-cs-deploy.XXXXXX")
trap 'rm -rf "$work"' EXIT
stage=$work/stage
mkdir "$stage"

# '-mkdir' on a directory that exists reports a Failure it then ignores;
# drop that line so real errors stand out. sftp ends its messages with CRLF.
sftp_batch() {
  "${sshpass[@]}" sftp -q -oBatchMode=no -b "$1" "$HOST" 2> >(tr -d '\r' | grep -v '^remote mkdir .*: Failure$' >&2) >/dev/null
}

# 1. Stage.
while IFS= read -r -d '' f; do
  [ -e "$f" ] || continue # deleted but still in the index
  case "$f" in
    "$SCORES") continue ;;
    # Development files that ride along with games: tests and handoff notes.
    games/*-test.* | games/*/HANDOFF.md) continue ;;
    games/*) ;;
    # The site's generated page per game (navbar plus the game in a frame).
    play/*) ;;
    */*) continue ;;
    *.html | *.js | *.css | *.php | *.png | *.ico | *.webmanifest) ;;
    *) continue ;;
  esac
  mkdir -p "$stage/$(dirname "$f")"
  cp -L "$f" "$stage/$f"
done < <(git ls-files -z --cached --others --exclude-standard --deduplicate -- .)
find "$stage" -type d -exec chmod 755 {} +
find "$stage" -type f -exec chmod 644 {} +

hash=$(python3 -I "$repo/scripts/deploy-hash" "$stage" --extra "$PWD/deploy.sh")
python3 -I "$repo/scripts/deploy-hash" "$stage" --manifest >"$work/manifest"

# 2. Compare with the host's stamp. A missing stamp means a first deploy;
# any other failure stops here rather than guessing.
remote_hash=
: >"$work/remote-manifest"
if out=$("${sshpass[@]}" scp -q "$HOST:$STAMP" "$work/remote-stamp" 2>&1); then
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

# The scores file is the server's: create it if missing, and keep it 666 so
# PHP (a different user) can write it in place.
if ! "${sshpass[@]}" scp -q "$HOST:$SCORES" "$work/scores" 2>/dev/null; then
  echo "[]" >"$work/scores"
  chmod 666 "$work/scores"
  "${sshpass[@]}" scp -q -p "$work/scores" "$HOST:$SCORES"
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
"${sshpass[@]}" scp -q -p "$work/stamp" "$HOST:$STAMP"
echo "www.cs: deployed ${hash:0:12}"
