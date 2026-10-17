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
require_once __DIR__ . '/Headers.php';
require_once __DIR__ . '/Mailer.php';
require_once __DIR__ . '/MailTemplate.php';

// The kit's StoreDir and StoreModes. Where the kit's source is present (a
// checkout, the test suites, which share one process with the kit's own tests)
// its files are the ones loaded, so a class is never declared twice; the
// deployed site ships the copies in this folder instead.
$kitPhp = __DIR__ . '/../../games/_kit/php';
if (is_file($kitPhp . '/score-guard.php')) {
    require_once $kitPhp . '/score-guard.php';
} elseif (!class_exists(\Kit\StoreDir::class, false)) {
    require_once __DIR__ . '/store-modes.php';
    require_once __DIR__ . '/store-dir.php';
}
unset($kitPhp);

/** Dashboard links for the hub, label => path relative to /admin/. Workrooms add themselves here. */
function admin_dashboards(): array
{
    return [];
}

/** Encryption-key fingerprints for the hub, label => fingerprint. Workrooms add their own here. */
function admin_key_fingerprints(): array
{
    return [];
}

/** True for exactly `localhost` or `127.0.0.1`, with an optional port. */
function admin_is_local_host(string $host): bool
{
    return preg_match('/^(localhost|127\.0\.0\.1)(:\d{1,5})?$/D', $host) === 1;
}

/**
 * The mailer for a request to $host. A capture directory (ADMIN_MAIL_CAPTURE_DIR) is
 * honoured only for a local host, so a stray setting can never divert real mail.
 */
function admin_mailer(string $host, ?string $captureDir = null): Admin\Mailer
{
    $captureDir ??= (string) getenv('ADMIN_MAIL_CAPTURE_DIR');
    if ($captureDir !== '' && admin_is_local_host($host)) {
        return new Admin\CaptureMailer($captureDir);
    }
    return new Admin\SmtpMailer();
}

/** The folder URL mail links point into: fixed in production, the request's own for a local host. */
function admin_base_url(Admin\Request $r): string
{
    if (admin_is_local_host($r->host)) {
        return ($r->https ? 'https' : 'http') . '://' . $r->host . '/admin/';
    }
    return 'https://www.cs.siue.edu/admin/';
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
 * The whole of a thin page: refuse plain HTTP (except from a local host), open the
 * database, run $handler(Pages, Request), send the response, then send queued mail
 * once the client has what it asked for.
 *
 * @param callable(Admin\Pages, Admin\Request): Admin\Response $handler
 */
function admin_serve(callable $handler, bool $health = false): void
{
    $r = Admin\Request::fromGlobals();
    if (!$r->https && !admin_is_local_host($r->host)) {
        admin_emit(new Admin\Response(403, Admin\Headers::apply(['Content-Type' => 'text/plain; charset=utf-8']), 'HTTPS required.'));
        return;
    }
    try {
        $db = Admin\Db::open(Admin\Db::dataDir());
    } catch (Admin\StorageUnavailable | PDOException $e) {
        error_log('admin: storage unavailable: ' . $e->getMessage());
        admin_emit($health ? Admin\Pages::healthResponse(false, false) : Admin\Pages::fromStorageError($e));
        return;
    }
    $pages = new Admin\Pages($db, new Admin\SystemClock(), admin_mailer($r->host), admin_base_url($r));
    admin_emit($handler($pages, $r));
    if (function_exists('fastcgi_finish_request')) {
        fastcgi_finish_request();
    }
    $pages->flush();
}
