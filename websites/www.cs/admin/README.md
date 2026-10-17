# Admin pages

A private area of www.cs.siue.edu/~wgrim for the site owner: a sign-in page, a hub that links to
dashboards, and a panel for API keys. Nobody but `wgrim@siue.edu` can sign in. Dashboards for
workrooms hang off the hub; the owner's Mac talks to the site with scoped API keys, never with the
login.

| Page | What it does |
| --- | --- |
| `login.php` | Asks for the address and mails a one-time link to the allowed address only. The reply is the same whoever asks. |
| `verify.php` | The mailed link opens a page with a button; pressing it spends the link and starts a session. |
| `index.php` | The hub: dashboard links, encryption-key fingerprints, sign out and sign out everywhere. |
| `keys.php` | Create and revoke scoped API keys. A new key is shown once. |
| `logout.php` | Ends the session (POST), or every session with `?all=1`. |
| `health.php` | `{"mail":"yes\|no","db":"yes\|no"}` for a deploy check; reveals nothing else. |

`lib/` holds the code and `data/` the SQLite database. Neither is ever served or deployed (`data/`
is created by PHP, private to it, and gitignored).

## Security model

- Links are random, stored only as SHA-256, good for 15 minutes and once. Opening a link never
  spends it; the button does, behind a CSRF mark tied to a cookie.
- Sessions are server-side, last 30 minutes idle and 24 hours at most. Cookies are `__Secure-admin*`,
  `Secure`, `HttpOnly`, `SameSite=Strict`, with `Path` taken from `ADMIN_BASE_URL` (`/~wgrim/` on
  the host). Each sign-in mails the owner a notice.
- Requests and limits: every response carries the security headers (`lib/Headers.php`, mirrored in
  `.htaccess`); plain HTTP is refused except for a local base URL; page requests made by a script
  (`Sec-Fetch-Mode` other than `navigate`) are refused; link requests are rate limited per address,
  per IP and overall.
- Mail links are built only from `ADMIN_BASE_URL`, never from the request's Host header. The mail
  capture (`ADMIN_MAIL_CAPTURE_DIR`) works only with a local base URL, a local request host and
  PHP under FPM or its built-in server; otherwise mail goes to `smtp.siue.edu`.
- API keys are 64 hex characters shown once and kept as SHA-256, each with scopes from
  `ADMIN_KEY_SCOPES`, a per-minute limit and revocation. They are read from the `Authorization:
  Bearer` header only.

### Shared origin

www.cs serves every user's `~folder` from one browser origin. Cookies are scoped to `/~wgrim/`, so
other users' pages never receive them, but a script on another user's page, running while the owner
is signed in, shares the origin and could act as the owner. Short sessions and the Fetch Metadata
guard narrow that window. The owner chose to stay on www.cs with this caveat.

## Run the local smoke test

```bash
cd websites/www.cs
make admin-smoke
```

It starts the docker stack in its own throwaway project (an ephemeral port, never one a dev server
uses) with `compose.admin-local.yaml`, which sets `ADMIN_BASE_URL=http://localhost/admin/` and
captures mail to `admin/data/mail`. It then requests a link, reads the captured mail, signs in,
loads the hub, signs out, and checks that `lib/`, `data/` and script-made requests are refused and
that `health.php` reports the database. It prints `ADMIN-SMOKE-OK` and removes the project.

## After a deploy

```bash
curl -s https://www.cs.siue.edu/~wgrim/admin/health.php
```

It should print `{"mail":"yes","db":"yes"}`. The mail answer is cached between probes, so a fresh
`no` can lag a recovery. Then request a link from the login page and sign in once.

## Build a dashboard

A dashboard is a PHP page next to `index.php` that starts with the bootstrap and gates on the session:

```php
<?php
declare(strict_types=1);
require __DIR__ . '/lib/bootstrap.php';

admin_serve(static function (Admin\Pages $p, Admin\Request $r): Admin\Response {
    return $p->requireAdmin($r) ?? /* build the page's Admin\Response here */;
});
```

`requireAdmin` returns a redirect to `login.php` when there is no session, else `null`. Register the
page in `admin_dashboards()` and its encryption-key fingerprint in `admin_key_fingerprints()`
(`lib/bootstrap.php`) so the hub shows it.

Machine access takes a scoped key. Add the scope name to `ADMIN_KEY_SCOPES`, create a key with that
scope on `keys.php`, and gate the endpoint with `Admin\Keys::check`, which returns `null` when
allowed and the JSON error response (401, 403 or 429) otherwise:

```php
$denied = (new Admin\Keys($db, new Admin\SystemClock()))->check($r, 'workroom-name');
```

The caller sends `Authorization: Bearer <key>` over HTTPS.
