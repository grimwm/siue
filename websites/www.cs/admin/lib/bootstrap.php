<?php
// Loads the admin libraries; every admin endpoint and test starts here.
declare(strict_types=1);

require_once __DIR__ . '/Clock.php';
require_once __DIR__ . '/Db.php';
require_once __DIR__ . '/Auth.php';
require_once __DIR__ . '/Html.php';
require_once __DIR__ . '/Pages.php';
require_once __DIR__ . '/Request.php';
require_once __DIR__ . '/Sessions.php';
require_once __DIR__ . '/Keys.php';
require_once __DIR__ . '/Headers.php';
require_once __DIR__ . '/Mailer.php';
require_once __DIR__ . '/MailTemplate.php';

// The kit's StoreDir and StoreModes. The command-line test suites share one
// process with the kit's own tests and load the kit's files, so a class is never
// declared twice; every web request loads the copies in this folder, which the
// deploy ships and a drift test keeps identical to the kit's.
$kitPhp = __DIR__ . '/../../games/_kit/php';
if (PHP_SAPI === 'cli' && is_file($kitPhp . '/score-guard.php')) {
    require_once $kitPhp . '/score-guard.php';
} elseif (!class_exists(\Kit\StoreDir::class, false)) {
    require_once __DIR__ . '/store-modes.php';
    require_once __DIR__ . '/store-dir.php';
}
unset($kitPhp);

/** The scopes an API key may carry. Workrooms add theirs here. */
const ADMIN_KEY_SCOPES = ['notes:pickup', 'drafts:publish', 'keys:publish'];

/** Dashboard links for the hub, label => path relative to /admin/. Workrooms add themselves here. */
function admin_dashboards(): array
{
    return ['Music workroom' => '../music/'];
}

/** Encryption-key fingerprints for the hub, label => fingerprint. Workrooms add their own here. */
function admin_key_fingerprints(\PDO $db): array
{
    require_once __DIR__ . '/../../music/lib/Store.php';
    try {
        $prints = Music\Store::fingerprintsIn($db);
    } catch (PDOException) {
        // The music tables do not exist until the workroom first runs.
        return ['Music notes key' => 'not made yet (make music-setup)'];
    }
    return ['Music notes key' => $prints === null ? 'not made yet (make music-setup)' : Music\Store::displayFingerprint($prints['current'])];
}

/** True for exactly `localhost` or `127.0.0.1`, with an optional port. */
function admin_is_local_host(string $host): bool
{
    return preg_match('/^(localhost|127\.0\.0\.1)(:\d{1,5})?$/D', $host) === 1;
}

/** The folder URL mail links point into: ADMIN_BASE_URL, else the live site. The request never feeds it. */
function admin_base_url(): string
{
    $set = (string) getenv('ADMIN_BASE_URL');
    return $set !== '' ? $set : 'https://www.cs.siue.edu/~wgrim/admin/';
}

/** True only when the configured base URL is plain HTTP on localhost or 127.0.0.1: a local development setup. */
function admin_is_local_base(string $baseUrl): bool
{
    $parts = parse_url($baseUrl);
    return is_array($parts) && ($parts['scheme'] ?? '') === 'http' && in_array($parts['host'] ?? '', ['localhost', '127.0.0.1'], true);
}

/**
 * The Path the admin cookies carry: the base URL's path up to and including its ~user folder, so the
 * owner's other pages share them and no other user's pages see them; `/` for a base without one.
 */
function admin_cookie_path(string $baseUrl): string
{
    $path = rawurldecode((string) parse_url($baseUrl, PHP_URL_PATH));
    return preg_match('#^/~[^/]+/#', $path, $m) === 1 ? $m[0] : '/';
}

/**
 * The mailer for a request to $host. A capture directory (ADMIN_MAIL_CAPTURE_DIR) is honoured only
 * when the configured base URL is local, the request host is exactly localhost or 127.0.0.1, and PHP
 * runs under FPM or its built-in server; otherwise the SMTP mailer is used whatever is set.
 */
function admin_mailer(string $host, ?string $captureDir = null, ?string $baseUrl = null, ?string $sapi = null): Admin\Mailer
{
    $captureDir ??= (string) getenv('ADMIN_MAIL_CAPTURE_DIR');
    if ($captureDir !== ''
        && admin_is_local_base($baseUrl ?? admin_base_url())
        && admin_is_local_host($host)
        && in_array($sapi ?? PHP_SAPI, ['fpm-fcgi', 'cli-server'], true)) {
        return new Admin\CaptureMailer($captureDir);
    }
    return new Admin\SmtpMailer();
}

/** The 403 for plain HTTP, or null when the request may proceed. Only a local base URL permits plain HTTP. */
function admin_refuse_plain_http(Admin\Request $r, string $baseUrl): ?Admin\Response
{
    if ($r->https || admin_is_local_base($baseUrl)) {
        return null;
    }
    return new Admin\Response(403, Admin\Headers::apply(['Content-Type' => 'text/plain; charset=utf-8']), 'HTTPS required.');
}

/**
 * The 403 for a page request a script made (fetch, XHR, an embed) instead of a browser navigation, or
 * null. www.cs is one origin for every user's folder, so another user's script could otherwise read
 * these pages. Requests without Fetch Metadata headers (curl, older browsers) pass.
 */
function admin_refuse_script_fetch(Admin\Request $r): ?Admin\Response
{
    $mode = $r->headers['sec-fetch-mode'] ?? null;
    $dest = $r->headers['sec-fetch-dest'] ?? null;
    if (($mode === null || $mode === 'navigate') && ($dest === null || $dest === 'document')) {
        return null;
    }
    return new Admin\Response(403, Admin\Headers::apply(['Content-Type' => 'text/plain; charset=utf-8']), 'Open this page directly.');
}

/** Writes a response to the client. */
function admin_emit(Admin\Response $res): void
{
    http_response_code($res->status);
    foreach ($res->headers as $name => $value) {
        header($name . ': ' . $value);
    }
    foreach ($res->cookies as $cookie) {
        header('Set-Cookie: ' . $cookie, false);
    }
    echo $res->body;
}

/**
 * The whole of a thin page: refuse plain HTTP (except from a local host) and, for a page
 * ($health false), script-made requests; open the
 * database, run $handler(Pages, Request), send the response, then send queued mail
 * once the client has what it asked for.
 *
 * @param callable(Admin\Pages, Admin\Request): Admin\Response $handler
 */
function admin_serve(callable $handler, bool $health = false): void
{
    $r = Admin\Request::fromGlobals();
    $base = admin_base_url();
    $refused = admin_refuse_plain_http($r, $base);
    if ($refused !== null) {
        admin_emit($refused);
        return;
    }
    $refused = $health ? null : admin_refuse_script_fetch($r);
    if ($refused !== null) {
        admin_emit($refused);
        return;
    }
    try {
        $db = Admin\Db::open(Admin\Db::dataDir());
    } catch (Admin\StorageUnavailable | PDOException $e) {
        error_log('admin: storage unavailable: ' . $e->getMessage());
        admin_emit($health ? Admin\Pages::healthResponse(false, false) : Admin\Pages::fromStorageError($e));
        return;
    }
    $pages = new Admin\Pages($db, new Admin\SystemClock(), admin_mailer($r->host, null, $base), $base);
    admin_emit($handler($pages, $r));
    if (function_exists('fastcgi_finish_request')) {
        fastcgi_finish_request();
    }
    $pages->flush();
}
