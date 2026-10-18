# Admin pages

A private area of www.cs.siue.edu/~wgrim for the site owner: a sign-in page, a hub that links to
dashboards, and a panel for API keys. Nobody but `wgrim@siue.edu` can sign in. Dashboards for
workrooms hang off the hub; the owner's Mac talks to the site with scoped API keys, never with the
login.

| Page | What it does |
| --- | --- |
| `login.php` | Asks for the address and mails a one-time link to the allowed address only. The reply, a `__Secure-admin-pending` cookie included, is the same whoever asks. |
| `verify.php` | Opened in the browser that asked for the link, the mailed link signs in at once and the page moves on to `index.php` (or the page the visit came from). Opened anywhere else, it shows a button; pressing it spends the link and starts a session. |
| `index.php` | The hub: dashboard links, encryption-key fingerprints (with a "Remove the notes key" control while one is stored), sign out and sign out everywhere. |
| `keys.php` | Create and revoke scoped API keys. A new key is shown once, and its card in the list is tagged as that key. For `music-publish` and `music-pickup` the page says which active key creating replaces. |
| `logout.php` | Ends the session (POST), or every session with `?all=1`. |
| `health.php` | `{"mail":"yes\|no","db":"yes\|no","store":"site\|fallback"}` for a deploy check; reveals nothing else. |

`lib/` holds the code (deployed, never served: an `.htaccess` denies it). The SQLite database,
`admin.sqlite`, lives in `data/` next to this file: on the host that is `admin/data/` inside the
site. The deploy creates the folder (group of the site root, mode 770, with setgid when the host allows it, so PHP's user can write and
other accounts cannot enter) and never uploads, overwrites or prunes anything in it; the database
survives deploys and php-fpm restarts. Its files belong to PHP's user (mode 0600), so sftp can delete them but not read them. If PHP cannot use
`admin/data/`, it falls back to `/var/tmp/<account>-admin/`, which the host wipes whenever php-fpm
restarts (sessions, links, keys and trusted devices would vanish). `ADMIN_DATA_DIR` moves the
database elsewhere, but reaches PHP only where the server passes environment through (an FPM pool
`env[]` line); on the host the default applies. Locally `data/` is gitignored.

## Security model

- Links are random, stored only as SHA-256, good for 15 minutes and once. Requesting a link
  sets a `__Secure-admin-pending` cookie (a random mark, `SameSite=Lax` so the mail app's click carries it,
  15 minutes) and stores only the mark's SHA-256 with the link. Opening the link signs in only when that
  cookie matches; the sign-in answers with a page that moves on by a same-origin refresh, because a redirect
  that began on another site would make the browser drop the `SameSite=Strict` session cookie. Any other
  opener, such as a mail scanner, gets a button; opening the link there never spends it, and the button
  does, behind a CSRF mark tied to a cookie.
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

### Shared host

www.cs runs every user's PHP as the same system user (`apache`), with no `open_basedir`. **Any
account holder's PHP can read and write what this site's PHP stores**, including the admin
database: it could forge a session, mint an API key or edit stored rows without ever using a link,
a session or a CSRF token. No code on this host can prevent that, and the owner has accepted it. It
cannot change the site's pages or scripts (deployed files are not writable by PHP) and cannot read
end-to-end-encrypted notes. Treat anything stored on the server alone as readable by other
accounts, and give a key only the access that risk can bear.

### Shared origin

www.cs serves every user's `~folder` from one browser origin. Cookies are scoped to `/~wgrim/`, so
other users' pages never receive them, but a script on another user's page, running while the owner
is signed in, shares the origin and could act as the owner. Short sessions and the Fetch Metadata
guard narrow that window. The owner chose to stay on www.cs with this caveat.

Another user's page can also set a cookie with the same name on a deeper path
(`__Secure-admin=junk; Path=/~wgrim/admin/`). The browser then sends that one first, so the owner
bounces to the login page, and the trusted-device cookie can be shadowed the same way; clearing the
site's cookies recovers.

### Logs and headers

`verify.php?token=` appears in the web server's access log, and opening the link outside the browser that asked for it does not spend it,
so anyone who can read that log can use a link within its 15 minutes, through the button. The logs are not readable by
other accounts. `.htaccess` sets the security headers with `Header always set` so that errors raised
before PHP runs carry them too; a page PHP sends can therefore show each header twice, with the same
value.

## Run the local smoke test

```bash
cd websites/www.cs
make admin-smoke
```

It starts the docker stack in its own throwaway project (an ephemeral port, never one a dev server
uses) with `compose.admin-local.yaml`, which sets `ADMIN_BASE_URL=http://localhost/admin/` and
captures mail to a folder of the container's own filesystem (`/tmp/admin-smoke-<random>`), with the
database beside it, so it never touches a developer's `admin/data/`. It then requests a link, reads the captured mail, signs in with the button,
loads the hub, signs out, signs in again by opening a second link in the browser that asked for it (a stranger still gets the button), and checks that `lib/`, `data/` and script-made requests are refused and
that `health.php` reports the database. It prints `ADMIN-SMOKE-OK` and removes the project and its
container.

## After a deploy

```bash
curl -s https://www.cs.siue.edu/~wgrim/admin/health.php
```

It should print `{"mail":"yes","db":"yes","store":"site"}`. `"store":"fallback"` means PHP cannot use
`admin/data/` (it is not writable by PHP) and the database sits where a php-fpm restart wipes it. The mail answer is cached between probes, so a fresh
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
(`lib/bootstrap.php`) so the hub shows it. A key the owner may need to start over on is offered for removal by adding it to `admin_key_removers()` (same file): it lists the key only while it is stored, with the explanation, the button label and a callable that takes the PDO.

Machine access takes a scoped key. Add the scope name to `ADMIN_KEY_SCOPES`, create a key with that
scope on `keys.php`, and gate the endpoint with `$p->requireKey($r, $scope)` (it delegates to `Admin\Keys::check`), which returns `null` when
allowed and the JSON error response (401, 403 or 429) otherwise:

```php
$denied = $p->requireKey($r, 'workroom-name');
```

The caller sends `Authorization: Bearer <key>` over HTTPS.
