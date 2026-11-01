# Admin pages

A private area of www.cs.siue.edu/~wgrim for the site owner: a sign-in page, a hub that links to
dashboards, and a panel for API keys. Only named admins sign in: the owner, `wgrim@siue.edu`, and anyone
the deploy's `admin/config/studio.json` marks `admin` (`lib/People.php`). Dashboards for
workrooms hang off the hub; the owner's Mac talks to the site with scoped API keys, never with the
login.

| Page | What it does |
| --- | --- |
| `login.php` | Asks for the address and mails a one-time link to a named admin only. The reply, a `__Secure-admin-pending` cookie included, is the same whoever asks. |
| `verify.php` | Opened in the browser that asked for the link, the mailed link signs in at once and the page moves on to `index.php` (or the page the visit came from). Opened anywhere else, it shows a button; pressing it spends the link and starts a session. |
| `index.php` | The hub: dashboard links, encryption-key fingerprints (with a "Remove the notes key" control while one is stored), sign out and sign out everywhere. |
| `keys.php` | Create and revoke scoped API keys. A new key is shown once, and its card in the list is tagged as that key. For `music-publish` and `music-pickup` the page says which active key creating replaces. |
| `studios.php` | Every studio's address, usage and last sign-in, with the shared usage and the account count against their caps. Remove takes the typed address; the owner's studio has no Remove. Never any piece, title or note. |
| `stats.php` | Visitors: charts of the site's visitor statistics for 7, 30 or 90 days, across every page or for one (`?page=`, `?days=`), each with its numbers in a table. See [Visitor statistics](#visitor-statistics). |
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
- Sessions are server-side, last 7 days idle and 30 days at most, and survive closing the browser. Cookies are `__Secure-admin*`,
  `Secure`, `HttpOnly`, `SameSite=Strict`, with `Path` taken from `ADMIN_BASE_URL` (`/~wgrim/` on
  the host). Each sign-in mails a notice to the address that signed in.
- Realms (`lib/Realm.php`): the sign-in flow (`lib/SignIn.php`) runs in a realm that names who may sign in,
  its base URL, cookies, tables and hourly limits. The admin realm admits named admins, with
  `links`, `link_requests`, `devices` and `sessions`. The studio realm, under `music/`, admits any plain
  `@siue.edu` address (no `+`, no subdomain), with `__Secure-studio*` cookies on `Path=/~wgrim/music/`, the
  `studio_` tables and an account on each device and session. A link, device or session is looked up only in its
  own realm's tables, so neither realm opens the other. Mail goes only to plain `@siue.edu` addresses.
  The studio realm's pages are `music/login.php`, `verify.php` and `logout.php`; its link mail and
  sign-in notice say "music studio", and `SignIn` refuses to be built for it without the step that finds the account.
- Requests and limits: every response carries the security headers (`lib/Headers.php`, mirrored in
  `.htaccess`); plain HTTP is refused except for a local base URL; page requests made by a script
  (`Sec-Fetch-Mode` other than `navigate`) are refused; link requests are rate limited per hour: links issued
  overall, requests per IP, links per address, and request rows kept (admin 30 / 20 / 3 / 1000, studio
  300 / 100 / 3 / 3000, so a class behind one campus address can sign in at once).
- Mail links are built only from `ADMIN_BASE_URL`, never from the request's Host header. The mail
  capture (`ADMIN_MAIL_CAPTURE_DIR`) works only with a local base URL, a local request host and
  PHP under FPM or its built-in server; otherwise mail goes to `smtp.siue.edu`.
- API keys are 64 hex characters shown once and kept as SHA-256, each with scopes from
  `ADMIN_KEY_SCOPES`, a per-minute limit and revocation. They are read from the `Authorization:
  Bearer` header only.
- Who is an admin, and who has the allowance, comes only from `admin/config/studio.json` (see
  [Named people and caps](#named-people-and-caps)), which the deploy writes and the web server never serves.
  It is readable by other host accounts' PHP, like everything stored (see Shared host): it names
  addresses and caps, never a secret. Admins and studios sign in separately: an admin session never
  opens a studio page, and a studio session never reaches `admin/`.

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
is signed in, shares the origin and could act as the owner. Sessions last up to 30 days, so that
window is long; the Fetch Metadata guard and **Sign out** narrow it. The owner chose to stay on www.cs with this caveat.

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

## Named people and caps

The deploy writes `admin/config/studio.json` from the `studio-config` field of the Secure Note `SIUE music studio config` in the SIUE 1Password vault (never from git; the folder is not served). The note is optional. Its shape:

```json
{"people":[{"email":"a@siue.edu","admin":false,"allowance":false}],"max_accounts":500,"max_shared_mb":20480,"min_free_disk_mb":51200,"max_take_decoded_mb":200}
```

Each email must be a plain `@siue.edu` address (no `+`); the caps are optional (`max_accounts`; `max_shared_mb`, the studios' shared space; `min_free_disk_mb`, the free disk a vocal take may never take the host below; `max_take_decoded_mb`, the most one vocal take may decode to; each MiB value a positive integer) and default to 500, 20480 (20 GiB), 51200 (50 GiB) and 200; any other key makes the file invalid. `wgrim@siue.edu` is always an admin with the allowance. A missing or malformed file gives the defaults: the owner is the only admin, with the allowance, and the caps are 500 accounts, 20 GiB shared, a 50 GiB disk floor and 200 MiB a take. Without the note (or with an empty field) the deploy stages no file and the site runs on those defaults; the deploy workflow loads the note in its own step, so a missing note never stops the deploy. `tools/studio-config.php` validates a field that is set, and an invalid value stops the deploy so a typo cannot silently drop named people. A deploy that stages no file removes the host's earlier `admin/config/studio.json` (the deploy workflow prunes files the last deploy sent that this one does not), so deleting the note returns the site to the defaults. After editing the field, run the deploy workflow on `main`.

## Run the local smoke test

```bash
cd websites/www.cs
make admin-smoke
```

It starts the docker stack in its own throwaway project (an ephemeral port, never one a dev server
uses) with `compose.admin-local.yaml`, which sets `ADMIN_BASE_URL=http://localhost/admin/`, points
`STUDIO_CONFIG_FILE` at `tests/e2e/studio-config.json` (it names only the owner) and captures mail to a folder of the container's own filesystem (`/tmp/admin-smoke-<random>`), with the
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

## Visitor statistics

First-party counts of visits to the faculty page and the games, read only here. Visitors never see them: the
one public endpoint, `stats/collect.php`, takes POSTs and always answers an empty 204 (405 for anything else).

- **Beacon.** The kit's `games/_kit/stats.ts`, built into each game as `dist/stats.js`. The faculty page loads
  `games/cylon/dist/stats.js` (page `home`, or the game `?game=` names); each `play/<id>/` page loads its game's
  copy before the frame; a game page loads its own and, when framed by a page that runs one, hands its events
  to that page instead of counting a second view. Games send named events with `track()`. Do Not Track, Global
  Privacy Control and browser automation send nothing. No cookies.
- **Who is who.** A random visitor ID in the visitor's `localStorage` (`wgrim-stats`), with the visit's ID
  (renewed after 30 minutes idle); without storage, a daily hash of a server-side salt, the IP, the user
  agent, the site and the date. The salt lives only in `stats.sqlite` and only for its day. Raw IPs and user
  agents are never stored; only the referrer's kind (Facebook, Discord, search, this site, direct, other) and
  the device class (phone, tablet, desktop) are.
- **Endpoint** (`stats/lib/Collector.php`). Refuses a cross-site `Origin` or `Sec-Fetch-Site`, `DNT: 1`,
  `Sec-GPC: 1`, bot user agents, bodies over 2 KB, pages other than `home` and the game folders, and events off
  the allowlist (`Collector::EVENTS`); 600 writes a minute per client (by hashed IP) and 6000 overall.
- **Storage.** `stats.sqlite` beside `admin.sqlite` in the admin data folder. Everything about visitors is kept
  forever: raw rows (`hits`), visitor IDs' first and last days (`visitors`), daily aggregates (`daily`) and
  day-1/day-7 return cohorts (`cohorts`). There is no cron: a write runs the cleanup at most once an hour
  (`stats/lib/Rollup.php`), which rolls finished days into `daily`, finalizes week-old cohorts, and drops past
  days' salts and past minutes' write counts. Days and hours are in America/Chicago.
- **Dashboard** (`stats/lib/Report.php`, `Dashboard.php`, `admin/stats.js`, `admin/stats.css`). Ranges: 7, 30
  (default) and 90 days, 6 months, 1 year, and 2 or more years up to as far back as the numbers go
  (`?range=7d|30d|90d|6m|1y|<n>y`). Ranges over 120 days chart by week and over 731 days by month: visits and
  views add up, visitor counts are averages a day. The earlier period's headline numbers are counted once and
  kept in `memo`, since past days never change. The report goes to the page as a JSON block, which `stats.js`
  draws as SVG (the CSP allows no inline script or style). Light and dark follow the system; tooltips follow
  the pointer, a tap or the arrow keys.
- **Privacy note.** `privacy.html` at the site root, linked from the faculty page's foot and the Games panel.

`make stats-e2e` checks it in a browser on a throwaway docker project. To look at the dashboard with made-up
numbers, run `php tests/stats-demo-seed.php <dir> [seed] [days]` in the PHP container against that project's admin data
folder (`ADMIN_DATA_DIR`), then sign in.

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
