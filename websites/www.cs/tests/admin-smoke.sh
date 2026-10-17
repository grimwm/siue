#!/usr/bin/env bash
# Local smoke test of the admin login against the docker stack (make admin-smoke).
#
# Brings the stack up under its own throwaway project name, with
# compose.admin-local.yaml so mail is captured to a file, signs in with the
# emailed link, signs out, and checks what must be refused. Prints ADMIN-SMOKE-OK
# or fails. The project is always torn down. nginx's host port is ephemeral and
# ADMIN_BASE_URL is http://localhost/admin/, so requests go to 127.0.0.1:<port>
# with Host: localhost and the mailed link's host is rewritten to that port.
set -euo pipefail

cd "$(dirname "$0")/.."
name="admin-smoke-$(od -An -N4 -tx1 /dev/urandom | tr -d ' \n')"
dc=(docker compose -p "$name" -f ../../compose.yaml -f compose.admin-local.yaml)
work=$(mktemp -d "${TMPDIR:-/tmp}/admin-smoke.XXXXXX")

cleanup() {
  # The container wrote admin/data into the bind-mounted tree; take it back out.
  "${dc[@]}" exec -T www-cs-php rm -rf /var/www/html/admin/data >/dev/null 2>&1 || true
  "${dc[@]}" down >/dev/null 2>&1 || true
  rm -rf "$work"
}
trap cleanup EXIT

fail() { echo "admin-smoke: FAIL: $*" >&2; exit 1; }

"${dc[@]}" up -d --build www-cs-php www-cs-nginx >/dev/null
addr=$("${dc[@]}" port www-cs-nginx 80) || fail "no nginx port"
port=${addr##*:}
[ -n "$port" ] || fail "no nginx port"
origin="http://127.0.0.1:$port"

# req NAME METHOD PATH [curl args...]: headers to $work/NAME.h, body to $work/NAME.b; prints the status.
req() {
  local n=$1 m=$2 p=$3
  shift 3
  curl -s --max-time 30 -X "$m" -H 'Host: localhost' -D "$work/$n.h" -o "$work/$n.b" -w '%{http_code}' "$@" "$origin$p"
}
expect() { # NAME WANT GOT
  [ "$3" = "$2" ] || fail "$1: want $2, got $3"
}
cookie_of() { # NAME COOKIE: the cookie's name=value from the Set-Cookie lines of a header dump
  tr -d '\r' <"$work/$1.h" | awk -v c="$2=" 'tolower($1)=="set-cookie:" && index($2, c)==1 { sub(/;.*/, "", $2); print $2; exit }'
}

# Wait for PHP to answer.
for _ in $(seq 1 60); do
  if code=$(req wait GET /admin/login.php) && [ "$code" = 200 ]; then break; fi
  sleep 1
done

# 1. The sign-in page, with every security header.
expect "GET login.php" 200 "$(req login GET /admin/login.php)"
for h in cache-control referrer-policy x-robots-tag x-content-type-options content-security-policy; do
  grep -qi "^$h:" "$work/login.h" || fail "login.php lacks the $h header"
done

# 2. Ask for the link. The capture folder sits in the data folder the first request made.
"${dc[@]}" exec -T -u apache www-cs-php mkdir -p /var/www/html/admin/data/mail
expect "POST login.php" 200 "$(req ask POST /admin/login.php --data-urlencode 'email=wgrim@siue.edu')"

# 3. The mail is written after the reply: wait for it, take the newest.
eml=
for _ in $(seq 1 20); do
  if eml=$("${dc[@]}" exec -T www-cs-php sh -c 'ls -t /var/www/html/admin/data/mail/*.eml 2>/dev/null | head -1') && [ -n "$eml" ]; then break; fi
  sleep 0.5
done
[ -n "$eml" ] || fail "no captured mail"
"${dc[@]}" exec -T www-cs-php cat "$eml" >"$work/mail.eml"
link=$(python3 -I - "$work/mail.eml" <<'PY'
import email, email.policy, re, sys
msg = email.message_from_binary_file(open(sys.argv[1], "rb"), policy=email.policy.default)
text = msg.get_body(preferencelist=("plain",)).get_content()
m = re.search(r"http://localhost/admin/verify\.php\?token=[0-9a-f]+", text)
print(m.group(0) if m else "")
PY
)
[ -n "$link" ] || fail "no sign-in link in the mail"
path=${link#http://localhost}

# 4. Open the link: a form and the confirm cookie.
expect "GET link" 200 "$(req confirm GET "$path")"
grep -q '<form' "$work/confirm.b" || fail "the link page has no form"
csrf=$(sed -n 's/.*name="csrf" value="\([0-9a-f]*\)".*/\1/p' "$work/confirm.b" | head -1)
token=${path##*token=}
[ -n "$csrf" ] || fail "no csrf in the form"
confirm=$(cookie_of confirm __Secure-admin-confirm)
[ -n "$confirm" ] || { tr -d '\r' <"$work/confirm.h" >&2; fail "no confirm cookie"; }

# 5. Press the button: 303 and the session cookie, scoped to the whole local origin.
expect "POST verify.php" 303 "$(req verify POST /admin/verify.php -H "Cookie: $confirm" --data-urlencode "token=$token" --data-urlencode "csrf=$csrf")"
session=$(cookie_of verify __Secure-admin)
[ -n "$session" ] || fail "no session cookie"
tr -d '\r' <"$work/verify.h" | grep -i '^set-cookie: __Secure-admin=' | grep -qi 'path=/\(;\|$\)' || fail "the session cookie lacks Path=/"

# 6. The hub, signed in.
expect "GET admin/ signed in" 200 "$(req hub GET /admin/ -H "Cookie: $session")"
csrf=$(sed -n 's/.*name="csrf" value="\([0-9a-f]*\)".*/\1/p' "$work/hub.b" | head -1)
[ -n "$csrf" ] || fail "no csrf on the hub"

# 7. Sign out; the next visit goes to the login page.
expect "POST logout.php" 303 "$(req out POST /admin/logout.php -H "Cookie: $session" --data-urlencode "csrf=$csrf")"
expect "GET admin/ signed out" 303 "$(req after GET /admin/ -H "Cookie: $session")"
grep -qi '^location: login\.php' "$work/after.h" || fail "signed-out visit does not redirect to login.php"

# 8. Libraries and storage are not served.
for p in /admin/lib/Auth.php /admin/data/; do
  code=$(req deny GET "$p")
  [ "$code" = 403 ] || [ "$code" = 404 ] || fail "$p answered $code"
done

# 9. A script-made request to a page is refused.
expect "fetch-mode GET admin/" 403 "$(req fetch GET /admin/ -H 'Sec-Fetch-Mode: cors' -H 'Sec-Fetch-Dest: empty')"

# 10. The probe.
expect "GET health.php" 200 "$(req health GET /admin/health.php)"
grep -q '^{"mail":"\(yes\|no\)","db":"yes"}$' "$work/health.b" || fail "health.php said: $(cat "$work/health.b")"

echo ADMIN-SMOKE-OK
