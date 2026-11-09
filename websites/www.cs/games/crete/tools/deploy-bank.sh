#!/usr/bin/env bash
# Deploys Crete's shared Endless bank to happystl.com (DreamHost), where PHP
# runs as the account and a folder outside the web root keeps the levels for
# good. .github/workflows/deploy.yml runs it on main's tip; it touches nothing
# on the account but these two folders:
#
#   BANK_DIR  the bank's files, served at https://www.happystl.com/crete-bank/:
#             endless-bank.php, bank/ (its library, settings, the backup loader,
#             place.json and verifier.json; denied to browsers) and server/ (the
#             kit's score guard; denied too). Files are added or replaced, never
#             deleted.
#   DATA_DIR  the bank's levels: made 0700 when missing, never uploaded to,
#             emptied or deleted. bank/place.json names it, and the bank uses
#             it and nothing else (bank/Place.php).
#
#   HOST      the ssh login (user@host); ssh only accepts the host keys in
#             ~/.ssh/known_hosts and logs in once per step, never retrying
#   SSH_KEY   the private key file (optional: ssh's own otherwise)
#   WEB_ROOT  the site's web root on the host (default /home/happystl/happystl.com)
#   BANK_DIR  default $WEB_ROOT/crete-bank; must be one folder inside WEB_ROOT
#   DATA_DIR  default /home/happystl/crete-bank-data; must be outside WEB_ROOT
#   CRETE_BANK_VERIFIER_TOKEN  required: the trusted runner's token ("Crete
#             Config" in 1Password, field bank-verifier), 32 to 128 letters,
#             digits, '-' or '_'; only its sha256 is staged, as bank/verifier.json,
#             and it is never printed
#   LIST=1      print the files it would send, one per line, and stop (no host)
#   STAGE_DIR=d stage into the new folder d and stop (no host; the tests)
set -euo pipefail

cd "$(dirname "$0")/.."
WEB_ROOT=${WEB_ROOT:-/home/happystl/happystl.com}
WEB_ROOT=${WEB_ROOT%/}
BANK_DIR=${BANK_DIR:-$WEB_ROOT/crete-bank}
BANK_DIR=${BANK_DIR%/}
DATA_DIR=${DATA_DIR:-/home/happystl/crete-bank-data}
DATA_DIR=${DATA_DIR%/}

fail() {
  echo "deploy-bank: $*" >&2
  exit 1
}

path_ok='^(/[A-Za-z0-9._-]+)+$'
for v in WEB_ROOT BANK_DIR DATA_DIR; do
  [[ "${!v}" =~ $path_ok ]] && ! [[ "${!v}" =~ /\.\.?(/|$) ]] || fail "$v must be an absolute path of letters, digits, '.', '_' and '-'"
done
[[ "$BANK_DIR" =~ ^"$WEB_ROOT"/[a-z0-9-]+$ ]] || fail "BANK_DIR must be one folder inside WEB_ROOT ($WEB_ROOT)"
case "$DATA_DIR/" in
  "$WEB_ROOT"/*) fail "DATA_DIR must be outside WEB_ROOT: browsers must never reach the levels" ;;
esac
[[ "${CRETE_BANK_VERIFIER_TOKEN:-}" =~ ^[A-Za-z0-9_-]{32,128}$ ]] || fail "CRETE_BANK_VERIFIER_TOKEN is missing or not valid"

# 1. Stage.
FILES=(
  endless-bank.php
  bank/.htaccess bank/Bank.php bank/Place.php bank/config.json bank/import-backup.php
  server/blocked-initials.json server/score-guard.php server/store-dir.php
)
if [ -n "${STAGE_DIR:-}" ]; then
  [ ! -e "$STAGE_DIR" ] || fail "STAGE_DIR $STAGE_DIR already exists"
  stage=$STAGE_DIR
  mkdir -p "$stage"
else
  stage=$(mktemp -d)
  trap 'rm -rf "$stage"' EXIT
fi
for f in "${FILES[@]}"; do
  mkdir -p "$stage/$(dirname "$f")"
  cp -L "$f" "$stage/$f"
done
for f in "${FILES[@]}"; do
  case "$f" in
    *.php) php -l "$stage/$f" >/dev/null || fail "$f does not parse" ;;
    *.json) php -r 'exit(is_array(json_decode((string) file_get_contents($argv[1]), true)) ? 0 : 1);' "$stage/$f" || fail "$f is not JSON" ;;
  esac
done
# The site's folder: no listing, and no far-future caching from the host's defaults (every answer is no-store).
printf '%s\n' '# Crete'"'"'s shared Endless bank (games/crete/tools/deploy-bank.sh).' 'Options -Indexes' \
  '<IfModule mod_expires.c>' '  ExpiresActive Off' '</IfModule>' >"$stage/.htaccess"
printf '%s\n' '# The kit'"'"'s libraries: PHP reads them, browsers may not.' 'Require all denied' >"$stage/server/.htaccess"
php -r 'echo json_encode(["dir" => $argv[1]], JSON_UNESCAPED_SLASHES), "\n";' "$DATA_DIR" >"$stage/bank/place.json"
token_sha=$(printf '%s' "$CRETE_BANK_VERIFIER_TOKEN" | sha256sum | cut -d' ' -f1)
printf '{"tokenSha256": "%s"}\n' "$token_sha" >"$stage/bank/verifier.json"
find "$stage" -type d -exec chmod 755 {} +
find "$stage" -type f -exec chmod 644 {} +

if [ "${LIST:-0}" = 1 ]; then
  (cd "$stage" && find . -type f | sed 's|^\./||' | LC_ALL=C sort)
  exit 0
fi
[ -z "${STAGE_DIR:-}" ] || exit 0

# 2. Send.
[ -n "${HOST:-}" ] || fail "HOST (user@host) is not set"
ssh_opts=(-o BatchMode=yes -o StrictHostKeyChecking=yes -o ConnectTimeout=20 -o ConnectionAttempts=1)
if [ -n "${SSH_KEY:-}" ]; then
  ssh_opts+=(-o IdentitiesOnly=yes -i "$SSH_KEY")
fi
# The levels' folder first, so the new place.json never names a folder that is missing.
ssh "${ssh_opts[@]}" "$HOST" "mkdir -p -m 700 '$DATA_DIR' && chmod 700 '$DATA_DIR' && mkdir -p '$BANK_DIR'"
# --delay-updates puts every new file in place at the end, together; nothing is deleted.
rsync -rt --delay-updates --chmod=D755,F644 -e "ssh ${ssh_opts[*]}" "$stage/" "$HOST:$BANK_DIR/"
echo "deploy-bank: sent $(find "$stage" -type f | wc -l) files to $BANK_DIR; the levels stay in $DATA_DIR"
