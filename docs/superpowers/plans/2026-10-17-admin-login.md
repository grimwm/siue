# Admin Login Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A shared sign-in for every admin page on www.cs: a one-time link emailed only to `wgrim@siue.edu`, server-side sessions, scoped API keys, themed emails.

**Architecture:** Plain PHP 8.4 under `websites/www.cs/admin/`, namespace `Admin`. All logic lives in `admin/lib/` as small classes with injected clock, mailer and request, so PHPUnit drives it without a web server; the pages are thin. State is one SQLite database in a private data directory picked by the kit's `StoreDir` rules (a copy of `games/_kit/php/store-dir.php` kept identical by a test).

**Tech Stack:** PHP 8.4 (server baseline; local 8.5), PDO SQLite, PHPUnit 12 (`--testsuite site`), nginx/PHP-FPM docker stack for local checks.

**Spec:** `docs/superpowers/specs/2026-10-17-admin-login-design.md`

## Global Constraints

- Only address that may receive a link: `wgrim@siue.edu` (a constant, `Admin\Auth::ALLOWED`).
- Mail: `smtp.siue.edu`, port `465`, implicit TLS, `verify_peer` and `verify_peer_name` true, from `wgrim@siue.edu`, no SMTP AUTH (as the peer-review app).
- Link token: 32 random bytes, hex; stored only as `hash('sha256', $token)`; lifetime **900 s**; single use; consumed only by POST.
- Rate limits per rolling hour: **3** links per address, **20** link requests per IP, **30** link requests in all. API keys: **60** requests per minute per key.
- Sessions: 32 random bytes id, stored as SHA-256; cookie `__Host-admin` with `Secure`, `HttpOnly`, `SameSite=Strict`, `Path=/`, no `Domain`; idle limit **7200 s**, absolute limit **604800 s**.
- Every admin response sends: `Cache-Control: no-store`, `Referrer-Policy: no-referrer`, `X-Robots-Tag: noindex, nofollow`, `X-Content-Type-Options: nosniff`, `Content-Security-Policy: default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'`.
- Nothing secret is committed. The repository is public.
- Never log a token, key or session id, nor their hashes.
- CI is not changed: no edits to `.github/`, `tests/e2e/select.ts`, the Makefile's `test` and `e2e` targets, or `compose.yaml`. New PHPUnit files under `tests/php/` run in the existing `site` suite.
- Never SSH, SFTP or SCP to www.cs. Deploys happen on merge.
- Never bind ports 3000, 5173, 8000, 8080. Docker runs use a unique `COMPOSE_PROJECT_NAME` and are torn down with `docker compose -p <name> down`; never touch the `siue` project, never prune.
- Comments and docs describe the current state, never history.
- Commits end with:
  ```
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb
  ```

## Review Focus

1. **Link prefetchers and scanners** (Outlook Safe Links, iMessage previews) GET the link: the token must survive any number of GETs. Pinned in Task 2.
2. **A second tab or a stale form** posts an old CSRF token: a clear "form expired" page, no sign-in, no crash. Pinned in Task 3.
3. **Mail server unreachable from www.cs**: the request page still shows the same reply, the token is deleted, `health.php` says `mail: no`. Pinned in Tasks 4 and 5.
4. **Clock edges**: a token at exactly 900 s, a session at exactly the idle limit — expired, consistently. Pinned in Tasks 2 and 3.
5. **Database directory not writable or a symlink** on the host: a 503 page that names nothing internal, never a PHP error with paths. Pinned in Task 1.

## File map

```
websites/www.cs/admin/
  .htaccess                 # headers for every admin response; deny lib/ and data/
  lib/.htaccess             # Require all denied
  lib/bootstrap.php         # require_once of every lib file; config
  lib/store-dir.php         # exact copy of games/_kit/php/store-dir.php (test keeps it equal)
  lib/Db.php                # Admin\Db: opens SQLite, schema, secure_delete
  lib/Clock.php             # Admin\Clock interface + SystemClock
  lib/Request.php           # Admin\Request: method, ip, https, headers, cookies, post (from globals or tests)
  lib/Auth.php              # Admin\Auth: links (issue, peek, consume), limits, ALLOWED
  lib/Sessions.php          # Admin\Sessions: create, current, touch, end, endAll; Csrf
  lib/Keys.php              # Admin\Keys: create, list, revoke, check(scope)
  lib/Mailer.php            # Admin\Mailer interface; SmtpMailer; CaptureMailer (local only)
  lib/MailTemplate.php      # Admin\MailTemplate: link and notice messages, multipart
  lib/Headers.php           # Admin\Headers::send() and the list
  lib/Pages.php             # Admin\Pages: controllers returning Response (status, headers, body)
  lib/Html.php              # the page shell in the site's look; escaping
  login.php verify.php logout.php index.php keys.php health.php   # thin: build Request, call Pages, emit
  admin.css                 # the pages' style (dark site look)
websites/www.cs/tests/php/
  AdminDbTest.php AdminAuthTest.php AdminSessionsTest.php AdminMailTest.php
  AdminPagesTest.php AdminKeysTest.php AdminDeployTest.php
  AdminFakes.php            # FakeClock, MemoryMailer, request builder (not a test; no Test suffix)
websites/www.cs/docker/nginx/default.conf  # deny /admin/lib/ and /admin/data/ (nginx ignores .htaccess)
websites/www.cs/compose.admin-local.yaml   # local-only override: ADMIN_MAIL_CAPTURE_DIR (not used by CI)
websites/www.cs/Makefile                   # new target admin-smoke (local only; test/e2e targets untouched)
websites/www.cs/.gitignore                 # admin/data/
websites/www.cs/deploy.sh                  # never ship admin/data/
websites/www.cs/admin/README.md
```

Configuration (all optional, read by `bootstrap.php` from the environment, never secret): `ADMIN_DATA_DIR` (exact data directory), `ADMIN_MAIL_CAPTURE_DIR` (local docker only: write mail to files instead of SMTP; refused unless `PHP_SAPI` is `fpm-fcgi` **and** the host header is `localhost`/`127.0.0.1`), `ADMIN_BASE_URL` (default `https://www.cs.siue.edu/~wgrim/admin/`).

---

### Task 1: Storage and schema

**Files:** Create `admin/lib/store-dir.php` (copy), `admin/lib/Db.php`, `admin/lib/Clock.php`, `admin/lib/bootstrap.php`, `admin/lib/.htaccess`, `admin/.htaccess`, `tests/php/AdminDbTest.php`, `tests/php/AdminFakes.php`; modify `docker/nginx/default.conf`, `.gitignore`, `deploy.sh`.

**Interfaces — Produces:**
- `interface Admin\Clock { public function now(): int; }`, `final class Admin\SystemClock implements Clock`.
- `final class Admin\Db { public static function open(string $dir): \PDO; public static function dataDir(): string; }` — `open` creates `admin.sqlite` (0600 via `StoreModes`), runs `PRAGMA secure_delete = ON; PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;` and the schema below. `dataDir()` = `ADMIN_DATA_DIR` exactly (claimed, private) else `StoreDir::pick(__DIR__.'/../data', '/var/tmp/'.StoreDir::username().'-admin')`.
- `final class Admin\StorageUnavailable extends \RuntimeException` (the `StoreDir` refusal class).
- Test helpers in `AdminFakes.php`: `FakeClock` (settable `now`), `MemoryMailer`, `req(array $over = []): Admin\Request` (Task 3 defines `Request`; Task 1's fakes define only `FakeClock` and a temp-dir helper `admin_tmp_db(): \PDO`).

Schema:

```sql
CREATE TABLE IF NOT EXISTS links (token_hash TEXT PRIMARY KEY, email TEXT NOT NULL, created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL, used_at INTEGER);
CREATE TABLE IF NOT EXISTS link_requests (id INTEGER PRIMARY KEY, ip TEXT NOT NULL, email TEXT NOT NULL, at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS sessions (id_hash TEXT PRIMARY KEY, created_at INTEGER NOT NULL, seen_at INTEGER NOT NULL, ip TEXT NOT NULL, agent TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS keys (id INTEGER PRIMARY KEY, label TEXT NOT NULL, key_hash TEXT NOT NULL UNIQUE, scopes TEXT NOT NULL, created_at INTEGER NOT NULL, last_used_at INTEGER, revoked_at INTEGER);
CREATE TABLE IF NOT EXISTS key_hits (key_id INTEGER NOT NULL, at INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS link_requests_at ON link_requests(at);
CREATE INDEX IF NOT EXISTS key_hits_key_at ON key_hits(key_id, at);
```

- [ ] **Step 1: Failing tests** (`tests/php/AdminDbTest.php`):

```php
<?php
// The admin database: private file, secure_delete on, schema present, and the
// copy of the kit's StoreDir never drifts from the kit's.
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

require_once __DIR__ . '/AdminFakes.php';

final class AdminDbTest extends TestCase
{
    public function testSchemaAndPragmas(): void
    {
        $db = admin_tmp_db();
        $tables = $db->query("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")->fetchAll(PDO::FETCH_COLUMN);
        self::assertSame(['key_hits', 'keys', 'link_requests', 'links', 'sessions'], $tables);
        self::assertSame(1, (int) $db->query('PRAGMA secure_delete')->fetchColumn());
    }

    public function testDatabaseFileIsPrivate(): void
    {
        $dir = admin_tmp_dir();
        Admin\Db::open($dir);
        self::assertSame(0, fileperms("$dir/admin.sqlite") & 0007, 'no access for others');
    }

    public function testStoreDirCopyMatchesTheKit(): void
    {
        $root = dirname(__DIR__, 2);
        self::assertSame(
            file_get_contents("$root/games/_kit/php/store-dir.php"),
            file_get_contents("$root/admin/lib/store-dir.php"),
            'admin/lib/store-dir.php is a copy of games/_kit/php/store-dir.php',
        );
    }

    public function testASymlinkedDataDirIsRefusedWithoutPaths(): void
    {
        $base = admin_tmp_dir();
        symlink(sys_get_temp_dir(), "$base/link");
        putenv("ADMIN_DATA_DIR=$base/link");
        try {
            Admin\Db::dataDir();
            self::fail('a symlink must be refused');
        } catch (Admin\StorageUnavailable $e) {
            self::assertStringNotContainsString(sys_get_temp_dir(), Admin\Pages::storageDown()->body);
        } finally {
            putenv('ADMIN_DATA_DIR');
        }
    }
}
```

(`Admin\Pages::storageDown()` is created in Task 5; for this task add a minimal `Pages` with only `storageDown(): Response` returning status 503 and the body "Admin pages are unavailable right now." — Task 5 extends the class. `Response` is `final class Admin\Response { public function __construct(public int $status, public array $headers, public string $body) {} }` in `lib/Pages.php`.)

- [ ] **Step 2:** run `vendor/bin/phpunit tests/php/AdminDbTest.php` from `websites/www.cs` — FAIL (classes missing).
- [ ] **Step 3: Implement** the files above. `admin/lib/.htaccess` = `Require all denied`. `admin/.htaccess` sets the Global Constraints headers with `Header always set` and adds `<If "%{REQUEST_URI} =~ m#/admin/(lib|data)/#"> Require all denied </If>`. In `docker/nginx/default.conf` add, beside the other deny lines: `location ^~ /admin/lib/ { deny all; }` and `location ^~ /admin/data/ { deny all; }`. `.gitignore`: `admin/data/`. `deploy.sh`: add `admin/data/*) continue ;;` next to `games/tankity/data/*`.
- [ ] **Step 4:** run the test — PASS; `vendor/bin/phpunit --testsuite site` — PASS.
- [ ] **Step 5: Commit** `Admin login: private storage and schema`.

### Task 2: Links and limits

**Files:** Create `admin/lib/Auth.php`, `tests/php/AdminAuthTest.php`.

**Interfaces — Consumes:** `Db`, `Clock`. **Produces:**
```php
final class Admin\Auth {
    public const ALLOWED = 'wgrim@siue.edu';
    public const LINK_TTL = 900;
    public function __construct(\PDO $db, Clock $clock) {}
    /** Normalises; true only for exactly ALLOWED (trimmed, lower-cased), with no CR/LF. */
    public static function allowed(string $email): bool;
    /** Records the request; returns the plain token when a link may be sent, else null (not allowed, or a limit hit). */
    public function requestLink(string $email, string $ip): ?string;
    /** The address for a valid, unused, unexpired token; never consumes. */
    public function peek(string $token): ?string;
    /** Consumes a valid token once (atomic UPDATE ... WHERE used_at IS NULL AND expires_at > now); the address or null. */
    public function consume(string $token): ?string;
    /** Deletes the link for this token (a failed send). */
    public function forget(string $token): void;
    /** Deletes every unused link (sign out everywhere). */
    public function forgetAll(): void;
}
```

- [ ] **Step 1: Failing tests:**

```php
<?php
// One-time links: only the allowed address, hashed at rest, 15 minutes, once, by POST
// (peek never consumes), and the three hourly limits.
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

require_once __DIR__ . '/AdminFakes.php';

final class AdminAuthTest extends TestCase
{
    private function auth(?FakeClock $c = null): array
    {
        $c ??= new FakeClock(1_000_000);
        $db = admin_tmp_db();
        return [new Admin\Auth($db, $c), $db, $c];
    }

    public function testOnlyTheOneAddress(): void
    {
        foreach (['wgrim@siue.edu', ' WGRIM@siue.edu ', 'Wgrim@SIUE.EDU'] as $ok) self::assertTrue(Admin\Auth::allowed($ok), $ok);
        foreach (['wgrim@siue.edu.evil.com', 'x@siue.edu', "wgrim@siue.edu\r\nBcc: a@b.c", 'wgrim@siue.edu,x@y.z', '', 'wgrim'] as $bad) {
            self::assertFalse(Admin\Auth::allowed($bad), $bad);
        }
        [$a] = $this->auth();
        self::assertNull($a->requestLink('someone@siue.edu', '1.2.3.4'));
    }

    public function testTokenIsHashedAtRestAndWorksOnceByConsume(): void
    {
        [$a, $db] = $this->auth();
        $t = $a->requestLink('wgrim@siue.edu', '1.2.3.4');
        self::assertMatchesRegularExpression('/^[0-9a-f]{64}$/', (string) $t);
        $stored = $db->query('SELECT token_hash FROM links')->fetchColumn();
        self::assertSame(hash('sha256', $t), $stored);
        self::assertStringNotContainsString($t, (string) json_encode($db->query('SELECT * FROM links')->fetchAll()));
        self::assertSame('wgrim@siue.edu', $a->peek($t));
        self::assertSame('wgrim@siue.edu', $a->peek($t), 'peek never consumes');
        self::assertSame('wgrim@siue.edu', $a->consume($t));
        self::assertNull($a->consume($t), 'once');
        self::assertNull($a->peek($t));
    }

    public function testExpiresAtExactly900Seconds(): void
    {
        [$a, , $c] = $this->auth();
        $t = $a->requestLink('wgrim@siue.edu', '1.2.3.4');
        $c->now += 899;
        self::assertNotNull($a->peek($t));
        $c->now += 1;
        self::assertNull($a->peek($t));
        self::assertNull($a->consume($t));
    }

    public function testAlteredOrUnknownTokensFail(): void
    {
        [$a] = $this->auth();
        $t = (string) $a->requestLink('wgrim@siue.edu', '1.2.3.4');
        self::assertNull($a->consume(strrev($t)));
        self::assertNull($a->consume(''));
        self::assertNull($a->consume(str_repeat('0', 64)));
    }

    public function testThreeLinksAnHourForTheAddress(): void
    {
        [$a, , $c] = $this->auth();
        for ($i = 0; $i < 3; $i++) self::assertNotNull($a->requestLink('wgrim@siue.edu', "10.0.0.$i"));
        self::assertNull($a->requestLink('wgrim@siue.edu', '10.0.0.9'));
        $c->now += 3600;
        self::assertNotNull($a->requestLink('wgrim@siue.edu', '10.0.0.9'));
    }

    public function testIpAndGlobalLimitsCountRefusedAddressesToo(): void
    {
        [$a] = $this->auth();
        for ($i = 0; $i < 20; $i++) $a->requestLink("x$i@example.com", '9.9.9.9');
        self::assertNull($a->requestLink('wgrim@siue.edu', '9.9.9.9'), 'per-IP limit');
        for ($i = 0; $i < 10; $i++) $a->requestLink("y$i@example.com", "8.8.8.$i");
        self::assertNull($a->requestLink('wgrim@siue.edu', '7.7.7.7'), 'global limit of 30');
    }

    public function testForgetAndForgetAll(): void
    {
        [$a] = $this->auth();
        $t = (string) $a->requestLink('wgrim@siue.edu', '1.1.1.1');
        $a->forget($t);
        self::assertNull($a->peek($t));
        $u = (string) $a->requestLink('wgrim@siue.edu', '1.1.1.1');
        $a->forgetAll();
        self::assertNull($a->peek($u));
    }
}
```

- [ ] **Step 2:** run — FAIL. **Step 3:** implement. `requestLink` inserts into `link_requests` first (every request counts, allowed or not), deletes requests older than 3600 s and links whose `expires_at <= now` or `used_at IS NOT NULL`, then checks the global (≥ 30 in the hour → null), IP (≥ 20 → null) and allowed-address (≥ 3 links created in the hour → null) limits, then inserts `links(token_hash, email, now, now + LINK_TTL, NULL)`. Expiry comparisons are `expires_at > now`. `consume` is one `UPDATE links SET used_at = :now WHERE token_hash = :h AND used_at IS NULL AND expires_at > :now`, then reads the email only if `rowCount() === 1`. Hash with `hash('sha256', $token)`; reject tokens not matching `/^[0-9a-f]{64}$/` before touching the database.
- [ ] **Step 4:** PASS. **Step 5: Commit** `Admin login: one-time links and limits`.

### Task 3: Requests, sessions, CSRF and headers

**Files:** Create `admin/lib/Request.php`, `admin/lib/Sessions.php`, `admin/lib/Headers.php`, `tests/php/AdminSessionsTest.php`; extend `tests/php/AdminFakes.php` with `req()`.

**Interfaces — Produces:**
```php
final class Admin\Request {
    public function __construct(public string $method, public string $ip, public bool $https, public string $host,
        public array $headers, public array $cookies, public array $post, public array $query, public string $agent) {}
    public static function fromGlobals(): self; // https from $_SERVER['HTTPS'] === 'on' or REQUEST_SCHEME === 'https'
}
final class Admin\Sessions {
    public const COOKIE = '__Host-admin';
    public const IDLE = 7200;
    public const MAX = 604800;
    public function __construct(\PDO $db, Clock $clock) {}
    /** New session (always a fresh id); returns the cookie header value. */
    public function start(Request $r): string;
    /** True when the request's cookie names a live session; refreshes seen_at. */
    public function current(Request $r): bool;
    /** Ends this request's session; returns the expiring cookie header value. */
    public function end(Request $r): string;
    /** Ends every session. */
    public function endAll(): void;
    /** A CSRF token bound to this session, stored hashed per session, replaced on every check. */
    public function csrf(Request $r): string;
    public function checkCsrf(Request $r, string $given): bool;
}
final class Admin\Headers { public const LIST = [/* name => value, exactly the Global Constraints */]; public static function apply(array $headers): array; }
```

Add the column `csrf_hash TEXT` to `sessions` (in `Db` schema, Task 1's test lists tables only, so it stays green).

- [ ] **Step 1: Failing tests** (`AdminSessionsTest.php`): a started session's cookie header contains `__Host-admin=`, `Secure`, `HttpOnly`, `SameSite=Strict`, `Path=/`, no `Domain`; the database holds only `hash('sha256', id)`; `current` true just before `IDLE`, false at exactly `IDLE` idle, false at `MAX` even with activity every hour; a second `start` yields a different id (regeneration); `end` kills only that session, `endAll` kills all; `checkCsrf` true once for the issued token and false on reuse and on a token from another session; `Headers::apply([])` contains every Global Constraints header with its exact value. Write each as its own test method with literal values (no loops over magic constants).
- [ ] **Step 2–4:** FAIL → implement → PASS. Session id = `bin2hex(random_bytes(32))`; compare with `hash_equals`. `current` also deletes sessions past either limit.
- [ ] **Step 5: Commit** `Admin login: sessions, CSRF and response headers`.

### Task 4: Mail in the site's look

**Files:** Create `admin/lib/Mailer.php`, `admin/lib/MailTemplate.php`, `tests/php/AdminMailTest.php`.

**Interfaces — Produces:**
```php
interface Admin\Mailer { /** Throws \RuntimeException on failure. */ public function send(string $to, string $subject, string $mime): void; }
final class Admin\SmtpMailer implements Mailer { public function __construct(string $host = 'smtp.siue.edu', int $port = 465, string $from = 'wgrim@siue.edu', int $timeout = 20) {} }
final class Admin\CaptureMailer implements Mailer { public function __construct(string $dir) {} } // writes <time>-<rand>.eml
final class Admin\MailTemplate {
    /** ['subject' => string, 'mime' => string]: multipart/alternative, text part first. */
    public static function link(string $url, int $minutes): array;
    public static function notice(int $when, string $ip, string $agent, string $hubUrl): array;
}
```

`SmtpMailer::send` ports `smtp_send` and `smtp_expect`/`dot_stuff` from `cs425/web/reviews/mail.php` (copy their logic; refuse CR/LF in `to`, `subject`, `from`; `ssl://` with `verify_peer`, `verify_peer_name`; `EHLO`, `MAIL FROM`, `RCPT TO`, `DATA`, dot-stuffed body, `QUIT`); `to` must also pass `Auth::allowed` or it throws (defence in depth). The mime string carries its own `MIME-Version`, `Content-Type: multipart/alternative; boundary=...` headers, the way the peer-review app's `build_multipart_message` does; the mailer prepends `From`, `To`, `Subject`, `Date` (RFC 2822) and `Message-ID`.

The HTML part: a 600 px table on `#0d0f12`, 6 px red (`#e02020`) bars top and bottom, the Cylon-eye mark (a rounded `#1e2633` pill with a red ellipse, as table cells, no image), heading in `Orbitron, 'Source Sans 3', Arial, sans-serif`, body `'Source Sans 3', Arial, sans-serif` in `#e8ebf0`, `<meta name="color-scheme" content="dark">`, a bulletproof red button (table cell `#e02020`, white bold text) for the link; every interpolated value through `htmlspecialchars(..., ENT_QUOTES)`. Link email: subject `Your sign-in link`, heading `Sign in`, line `Good for 15 minutes, once.`, and `If you did not ask for this, ignore it.` Notice email: subject `New sign-in to your admin pages`, when (America/Chicago, `D j M Y, g:i A T`), IP, browser (the user agent, trimmed to 120 chars), and a `Sign out everywhere` button to the hub.

- [ ] **Step 1: Failing tests:** both messages are `multipart/alternative` with exactly two parts, text first; the link URL appears in both parts once; `15 minutes` in both; an agent string `<script>alert(1)</script>` appears escaped in the HTML part; `SmtpMailer` refuses `x@siue.edu` and a subject with `\r\n` before connecting (assert the exception, using port 1 so any accidental connect fails differently); `CaptureMailer` writes one `.eml` file containing `To: wgrim@siue.edu`.
- [ ] **Step 2–4.** **Step 5: Commit** `Admin login: themed mail and the SMTP client`.

### Task 5: The pages

**Files:** Create `admin/lib/Pages.php` (extend), `admin/lib/Html.php`, `admin/lib/bootstrap.php` (extend), `admin/login.php`, `admin/verify.php`, `admin/logout.php`, `admin/index.php`, `admin/health.php`, `admin/admin.css`, `tests/php/AdminPagesTest.php`.

**Interfaces — Produces:**
```php
final class Admin\Pages {
    public function __construct(\PDO $db, Clock $clock, Mailer $mailer, string $baseUrl) {}
    public function loginForm(Request $r): Response;             // GET login.php
    public function requestLink(Request $r): Response;           // POST login.php: same reply always; sends after the reply
    public function confirm(Request $r): Response;               // GET verify.php?token=: button form, never consumes
    public function signIn(Request $r): Response;                // POST verify.php: CSRF + consume + start session + notice
    public function signOut(Request $r): Response;               // POST logout.php (CSRF)
    public function signOutEverywhere(Request $r): Response;     // POST logout.php?all=1 (CSRF): endAll + forgetAll
    public function hub(Request $r): Response;                   // GET index.php (session required)
    public function health(): Response;                          // GET health.php: {"mail":"yes|no","db":"yes|no"}
    public static function storageDown(): Response;
    /** For every other admin page: a Response redirecting to login.php when there is no session, else null. */
    public function requireAdmin(Request $r): ?Response;
    /** Mail queued by requestLink/signIn, sent by flush() after the response is out. */
    public function flush(): void;
}
```

Every `Response` gets `Headers::apply`. The thin pages: `require bootstrap.php`; build `Request::fromGlobals()`; refuse non-HTTPS with 403 (except `health.php` in local docker, where `https` is false: allow when the host is `localhost` or `127.0.0.1`); call the controller; emit status, headers, body; if `function_exists('fastcgi_finish_request')` call it, then `$pages->flush()`. On `StorageUnavailable`, emit `Pages::storageDown()`.

`health.php`: `db` = the database opens; `mail` = `stream_socket_client('ssl://smtp.siue.edu:465', ..., 5)` connects and the greeting starts with `220` (then `QUIT`). Nothing else in the body.

The hub (`index.php`): links to dashboards (a list in `bootstrap.php`, empty until the workroom adds itself), the API keys panel, the encryption-key fingerprints (a list in `bootstrap.php`, empty until the workroom adds its own), **Sign out** and **Sign out everywhere** (two POST forms with CSRF).

- [ ] **Step 1: Failing tests** (`AdminPagesTest.php`, with `MemoryMailer`, `FakeClock`, `req()`):
  - `requestLink` for `wgrim@siue.edu` and for `x@siue.edu` return byte-identical bodies and status 200; only the first queues mail; after `flush()` the mailer holds one message to `wgrim@siue.edu` whose link is `<baseUrl>verify.php?token=<64 hex>`.
  - A mailer that throws: same reply; after `flush()` the link no longer peeks (deleted).
  - `confirm` GET with a valid token: 200, a POST form with the token in a hidden field and a CSRF field; called 5 times, the token still peeks.
  - `signIn` with a wrong CSRF: 403 "This form expired. Open the link again." and no session; with the right CSRF and token: 303 to `index.php`, a `Set-Cookie` for `__Host-admin`, one notice mail queued; the same token again: 403.
  - `hub` without a cookie: 303 to `login.php`; with a session: 200 and both sign-out forms.
  - `signOutEverywhere`: all sessions gone and an unused link no longer peeks.
  - Every response from every controller carries every header in `Headers::LIST`.
  - `storageDown()` body contains no `/` path.
- [ ] **Step 2–4.** **Step 5: Commit** `Admin login: sign-in pages and the hub`.

### Task 6: API keys

**Files:** Create `admin/lib/Keys.php`, `admin/keys.php`, `tests/php/AdminKeysTest.php`; extend `Pages` with `keysPanel(Request $r): Response` (GET) and `keysAction(Request $r): Response` (POST create/revoke, CSRF).

**Interfaces — Produces:**
```php
final class Admin\Keys {
    public const PER_MINUTE = 60;
    public function __construct(\PDO $db, Clock $clock) {}
    /** Returns the plain key once (64 hex); stores its SHA-256. $scopes from the registry. */
    public function create(string $label, array $scopes): string;
    /** [['id','label','scopes','created_at','last_used_at','revoked_at']] — never a hash. */
    public function list(): array;
    public function revoke(int $id): void;
    /** For an API request: null when allowed (and records the hit), else a Response (401/403/429). */
    public function check(Request $r, string $scope): ?Response;
}
```

The scope registry is `Admin\Keys::SCOPES`, a constant array in `bootstrap.php`'s config, empty here (the workroom adds `notes:pickup` and `drafts:publish`); `create` refuses unknown scopes. `check`: non-HTTPS → 403 before reading anything; no `Authorization: Bearer <64 hex>` → 401; unknown or revoked → 401; missing scope → 403; more than `PER_MINUTE` hits in the last 60 s → 429; else update `last_used_at`, insert a hit, delete hits older than 60 s, return null. A key never satisfies `requireAdmin`.

- [ ] **Step 1: Failing tests:** create returns 64 hex and the table holds only its hash; list never contains it; a key in the query string (`?key=`) is ignored (401); HTTP refused (403); wrong scope 403; revoked 401; the 61st request in a minute 429 and the 1st of the next minute allowed; a session cookie without a key is 401 for `check`; a key without a session gets 303 from `requireAdmin`.
- [ ] **Step 2–4.** **Step 5: Commit** `Admin login: scoped API keys`.

### Task 7: Local smoke, deploy rules, docs; open the PR

**Files:** Create `compose.admin-local.yaml`, `admin/README.md`, `tests/php/AdminDeployTest.php`; modify `Makefile` (new target only).

- `compose.admin-local.yaml` (local only; CI never reads it): adds to `www-cs-php` the environment `ADMIN_MAIL_CAPTURE_DIR: /var/www/html/admin/data/mail` and `ADMIN_BASE_URL: http://localhost/admin/`.
- `make admin-smoke` (new target; `test` and `e2e` untouched): with `COMPOSE_PROJECT_NAME=admin-smoke-$$$$`, `docker compose -f compose.yaml -f compose.admin-local.yaml up -d --build`, then with curl against the ephemeral port: GET `admin/login.php` (200, headers present), POST the address (200), read the newest `.eml` in the capture dir through `docker compose exec`, GET the link (200, form), POST it with the CSRF from the form (303, cookie), GET `admin/` with the cookie (200), POST sign out (303), GET `admin/` (303 to login), GET `admin/lib/Auth.php` and `admin/data/` (403); print `ADMIN-SMOKE-OK`; always `docker compose -p <name> down`.
- `AdminDeployTest.php`: running `deploy.sh`'s file selection (the way `DeploySetTest` does) ships `admin/*.php`, `admin/lib/*.php`, `admin/lib/.htaccess`, `admin/.htaccess`, `admin/admin.css`, and never `admin/data/...`, `admin/README.md` or `compose.admin-local.yaml`.
- `admin/README.md`: what the admin pages are, the security model in short, how to run `make admin-smoke`, how to check `health.php` after a deploy, how a dashboard uses `requireAdmin` and a scoped key.

- [ ] **Step 1:** write `AdminDeployTest.php` — FAIL where deploy rules are missing; fix `deploy.sh` and the `NEVER_SHIPS` pattern only as needed — PASS.
- [ ] **Step 2:** write the compose override and the Makefile target; run `make admin-smoke` — `ADMIN-SMOKE-OK`.
- [ ] **Step 3:** gates: `vendor/bin/phpunit --testsuite site`, `vendor/bin/phpunit --testsuite kit`, `make test` (with the docker stack up under a unique project name for its docker steps), `bash games/units.sh`.
- [ ] **Step 4:** commit, push branch `admin/login`, open the PR (summary, spec and plan paths, the after-deploy check: `curl -s https://www.cs.siue.edu/~wgrim/admin/health.php` should print `{"mail":"yes","db":"yes"}`; then request a link and sign in once from the phone; attribution lines).
