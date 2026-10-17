# Admin login: one-address email sign-in for the site's dashboards

Every admin page on www.cs (the music workroom first) signs in through one
shared kit: a one-time link emailed to `wgrim@siue.edu`, and nobody else.
The security model is the peer-review app's (`cs425/web/reviews`), tightened
because this repository is public and www.cs is a shared host.

## Goal

The owner opens any admin page, asks for a link, taps it in their SIUE mail,
presses **Sign in**, and is in for the session. Nobody else can get a link,
guess a session, or read anything behind the login. Tools that run on the
owner's Mac use scoped API keys, never the login.

## What the owner gets

- **Sign-in page** (`/admin/login.php`): one field, prefilled with the owner's
  address, and **Email me a link**. Every request, allowed or not, gets the
  same reply: "If that address may sign in, a link is on its way. It is good
  for 15 minutes, once."
- **The email**: "Your sign-in link", in the site's look (below), with one red
  **Sign in** button and the expiry.
- **Confirm page** (`/admin/verify.php`): opening the link shows **Sign in**;
  only pressing it uses the link. Mail scanners and link previews never post,
  so they cannot burn it.
- **Sign-in notice**: each successful sign-in emails the owner when, from which
  IP, and which browser, with a **Sign out everywhere** link to the hub.
- **Hub** (`/admin/`): the dashboards (the workroom first), **Sign out**,
  **Sign out everywhere**, and the API keys panel.
- **API keys panel**: create a key with named scopes (the workroom's are
  `notes:pickup` and `drafts:publish`), shown once; list keys by label, scope,
  created and last used; revoke. The panel also shows the fingerprint of each
  dashboard's encryption public key, to compare once with the owner's Mac.

## Security model

From the peer-review app, kept as it is:

- Link tokens are 32 random bytes; only their SHA-256 hash is stored; the plain
  token exists only in the email. Single use.
- Two-step sign-in: GET shows the button, POST consumes the token.
- At most 3 links per hour for the address. A link whose email fails to send is
  deleted.
- The address is validated and any CR or LF in a mail field is refused (no
  header injection).
- Mail goes to `smtp.siue.edu` port 465 over TLS with the certificate verified
  (`verify_peer`, `verify_peer_name`), from `wgrim@siue.edu`.
- The session id is regenerated at sign-in. Cookies are `Secure` and
  `HttpOnly`. Every state-changing form carries a CSRF token that is burned on
  each check.

Tightened here:

- **One address.** The allowed list is exactly `wgrim@siue.edu`, a constant in
  code with a test. A request for any other address sends nothing and is
  answered exactly as an allowed one is, in the same time budget (the reply is
  written before the mail is sent), so nobody can probe which addresses work.
- **15-minute links** instead of 24 hours. Expired and used tokens are deleted
  on every request.
- **Own sessions, not PHP's.** Sessions live in the kit's SQLite database, not
  in PHP's shared session directory: the cookie (`__Secure-admin`, `Secure`,
  `HttpOnly`, `SameSite=Strict`, `Path=/~wgrim/`) holds a random 32-byte id,
  and the server stores only its hash. A session ends after 30 minutes idle or
  24 hours in all; **Sign out** deletes it; **Sign out everywhere** deletes them
  all, every unused link and every trusted device.
- **Trusted devices:** a sign-in also sets `__Secure-admin-device` (same
  attributes, 90 days, stored as a hash). A link request from a trusted device
  skips the address and overall limits and keeps the per-IP one, so nobody can
  lock the owner out by spending the public allowance.
- **The shared host:** www.cs serves every user's `~folder` as one browser
  origin. Cookies are scoped to `/~wgrim/`, so other users' pages never receive
  them, and the base URL comes only from configuration (`ADMIN_BASE_URL`,
  default `https://www.cs.siue.edu/~wgrim/admin/`), never from the request's
  Host header. What path scoping cannot stop: a script on another `~user` page
  that the owner visits while signed in runs on the same origin. The short
  sessions narrow that window; the owner chose to stay on www.cs with it.
- **Shared PHP (accepted):** on www.cs every user's PHP runs as the same
  system user (`apache`), with no `open_basedir`. Any account holder's PHP can
  therefore read and write whatever this site's PHP stores, the admin database
  included: it could forge a session, mint an API key or tamper with stored
  rows, bypassing links, sessions and CSRF. No code on this host can prevent
  that, and the owner accepts it in writing. What it cannot do: change the
  site's pages or scripts (deployed files are not writable by PHP) or read the
  workroom's notes, which are end-to-end encrypted before they reach the
  server. Key-gated write access (`drafts:publish`) therefore trusts every
  www.cs account holder as much as it trusts the owner's database; nothing
  stored on the server alone should be treated as secret.
- **Rate limits beyond the address:** at most 20 link requests per hour per IP
  and 30 in all, so the form cannot be used to flood the mailbox.
- **No secrets in git.** Nothing secret is committed: the database (tokens,
  sessions, key hashes) is created on the server on first use. The allowed
  address and mail settings are not secret and live in code.
- **API keys:** 32 random bytes, shown once, stored as SHA-256 hashes, compared
  in constant time. Sent only in `Authorization: Bearer`, never in a URL (so
  never in an access log). HTTPS only: a plain-HTTP request is refused before
  it is read. Each key has fixed scopes and can do nothing else; a key can
  never sign in, change settings or create keys. 60 requests per minute per
  key.
- **Headers on every admin response:** `Cache-Control: no-store`,
  `Referrer-Policy: no-referrer` (a link token never leaks to another site),
  `X-Robots-Tag: noindex, nofollow`, `X-Content-Type-Options: nosniff`, a
  strict `Content-Security-Policy` (self only, no inline script) with
  `frame-ancestors 'none'`.
- **Storage:** the kit's `StoreDir` rules (a configurable `data_dir`, the deny
  file when the directory is under the web root, the server's group-write
  ownership), with the database file never served. On the host the database
  is `admin/data/admin.sqlite` inside the site: the deploy creates `admin/data`
  (group of the site root, mode 770, with setgid when the host allows it, so PHP's user can write and other
  accounts cannot enter) and never uploads, overwrites or prunes anything in
  it. `/var/tmp/<account>-admin/` is only the fallback when `admin/data` is
  unusable; the host wipes it whenever php-fpm restarts. `ADMIN_DATA_DIR`
  overrides the location, but reaches PHP only where the server passes
  environment through (an FPM pool `env[]` line).
- **Logging:** sign-ins and key use are recorded as counts and times only; no
  token, key or session id is ever logged.

## Emails in the site's look

One template, two messages (the link and the sign-in notice), each
`multipart/alternative` with a plain-text part first:

- Near-black panel (`#0d0f12`), red bars top and bottom (`#e02020`), the
  site's Cylon-eye mark above an Orbitron heading, body in Source Sans 3 with
  system fallbacks (Gmail and Outlook drop web fonts; Apple Mail keeps them).
- Tables and inline styles only (what mail clients render), `color-scheme:
  dark` so phones do not invert it, a 600 px column that fits a phone.
- The **Sign in** button is a bulletproof table button in red with white text;
  the plain-text part carries the same link on its own line.

## Code

In `websites/www.cs/admin/`:

- `lib/` (never served: a deny file, and a guard that refuses direct requests):
  `auth.php` (tokens, sessions, CSRF, the allowed address, rate limits),
  `keys.php` (API keys and scopes), `mail.php` (the SMTP client, ported from the
  peer-review app with its injection checks), `mail-template.php` (the themed
  messages), `headers.php`, `db.php` (the schema, on `StoreDir`).
- Pages: `login.php`, `verify.php`, `logout.php`, `index.php` (the hub),
  `keys.php` (the panel).
- `require_admin()` for pages and `require_key(string $scope)` for APIs: every
  dashboard and API calls one of them first.
- `health.php`: answers whether the mail server's port can be reached and the
  database opens (yes or no each, nothing else), so the deploy check proves
  sign-in can work before the owner tries it. The mail check's result is
  cached and refreshed at most once every 10 minutes, so requests to this
  public page can never multiply connections to the mail server.

## Tests

PHPUnit (`tests/php/Admin*Test.php`), with the clock, the mailer and the
request injected:

- Only `wgrim@siue.edu` gets mail; other addresses send nothing and get the
  identical reply; addresses with CR/LF, uppercase, spaces or extra `@` are
  handled.
- A token works once, within 15 minutes, by POST only; a GET never consumes; a
  used, expired or altered token fails with one message.
- Rate limits: the fourth link in an hour is refused; per-IP and global caps.
- A failed send deletes its token.
- Sessions: regenerated id at sign-in, idle and absolute expiry, sign out,
  sign out everywhere; the stored value is a hash.
- CSRF on every POST; the token is burned.
- Keys: shown once, hashed, scoped, revocable, header-only, refused over HTTP,
  rate-limited; a key cannot reach a page that needs a session.
- Headers present on every admin response.
- The emails: both parts present, the link and expiry in each, no unescaped
  input in the HTML.

Browser: `admin-login.spec.ts` signs in through the two steps with the mailer
captured in the docker stack, and checks that the hub needs a session. It runs
locally with `make e2e`; CI's spec selection is not changed.

## Delivery

One PR: the kit, the hub, the keys panel, `health.php` and the tests. CI is
not changed: after the deploy, `admin/health.php` is checked by hand with one
HTTPS request.

## Out of scope

Other addresses or roles; passwords or passkeys; the dashboards themselves
(each its own spec).
