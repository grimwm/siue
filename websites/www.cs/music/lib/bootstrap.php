<?php
// The music workroom's server code: the admin kit plus the music classes.
declare(strict_types=1);

require_once __DIR__ . '/../../admin/lib/bootstrap.php';
require_once __DIR__ . '/Store.php';
require_once __DIR__ . '/Limits.php';
require_once __DIR__ . '/Accounts.php';
require_once __DIR__ . '/Http.php';
require_once __DIR__ . '/Api.php';
require_once __DIR__ . '/Pages.php';

/** The studio of $account, with the limits its address has under the deploy's configuration. */
function music_store(\PDO $db, Admin\Clock $clock, int $account): Music\Store
{
    $people = admin_people();
    $accounts = new Music\Accounts($db, $clock, $people);
    $limits = Music\Limits::for($people, (string) $accounts->emailOf($account));
    return new Music\Store($db, Admin\Db::dataDir() . '/music', $clock, $account, $limits, $accounts);
}

/** Admin\Request::fromGlobals() plus the content-length header: PHP keeps CONTENT_LENGTH out of the HTTP_* variables Request reads. */
function music_request(): Admin\Request
{
    $r = Admin\Request::fromGlobals();
    $length = $_SERVER['CONTENT_LENGTH'] ?? null;
    if (is_string($length) && $length !== '') {
        $r->headers['content-length'] = $length;
    }
    return $r;
}

/**
 * The gates that need no database, in admin_serve()'s order, as a finished response or null: plain HTTP is
 * refused for every $kind; 'page' adds the script-fetch refusal, 'data' the cross-site refusal, 'api' (routes
 * tools call) nothing. Any other $kind throws.
 */
function music_early_refusal(string $kind, Admin\Request $r, string $baseUrl): ?Admin\Response
{
    if (!in_array($kind, ['page', 'data', 'api'], true)) {
        throw new InvalidArgumentException("Unknown route kind: $kind");
    }
    $refused = admin_refuse_plain_http($r, $baseUrl);
    if ($refused === null) {
        $refused = match ($kind) {
            'page' => admin_refuse_script_fetch($r),
            'data' => Music\Http::refuseCrossSite($r),
            default => null,
        };
    }
    return $refused === null ? null : Music\Http::finish($refused);
}

/** Up to $max bytes of php://input. Callers that must tell "too large" apart ask for one byte more than their limit. */
function music_read_body(int $max): string
{
    $body = file_get_contents('php://input', false, null, 0, $max);
    return $body === false ? '' : $body;
}

/**
 * First 10 hex of one SHA-256 over the workroom's built assets in games/workroom/dist: the page script, the
 * sheet-music script it loads with the same ?v=, the theme boot script and the stylesheet. A change to any busts
 * them all; '' while any is missing.
 */
function music_asset_version(?string $dist = null): string
{
    $dist ??= __DIR__ . '/../../games/workroom/dist';
    $hash = hash_init('sha256');
    foreach (['workroom.js', 'sheet.js', 'theme.js', 'workroom.css'] as $file) {
        $bytes = @file_get_contents("$dist/$file");
        if ($bytes === false) {
            return '';
        }
        hash_update($hash, hash('sha256', $bytes, true));
    }
    return substr(hash_final($hash), 0, 10);
}

/**
 * Runs music_early_refusal($kind, ...) FIRST and emits a refusal without opening the database, then builds the
 * database, key store, sessions and controllers, runs $route and emits the response. Storage that is refused
 * becomes the admin 503 page. Session, CSRF and scope checks live in Music\Pages and Music\Api, per route.
 *
 * @param callable(Music\Pages, Music\Api, Admin\Request): Admin\Response $route
 */
function music_run(string $kind, callable $route): void
{
    $r = music_request();
    $base = admin_base_url();
    $refused = music_early_refusal($kind, $r, $base);
    if ($refused !== null) {
        admin_emit($refused);
        return;
    }
    try {
        $db = Admin\Db::open(Admin\Db::dataDir());
        $clock = new Admin\SystemClock();
        $store = music_store($db, $clock, (new Music\Accounts($db, $clock, admin_people()))->ownerId());
        $keys = new Admin\Keys($db, $clock, null, $base);
        $sessions = new Admin\Sessions($db, $clock, Admin\Realm::admin(admin_people(), $base));
        $admin = new Admin\Pages($db, $clock, admin_mailer($r->host, null, $base), $base, null, $keys);
        $pages = new Music\Pages($store, $admin, $sessions, music_asset_version(), $base);
        $res = $route($pages, new Music\Api($store, $keys), $r);
    } catch (Admin\StorageUnavailable | PDOException $e) {
        error_log('music: storage unavailable: ' . $e->getMessage());
        $res = Music\Http::finish(Admin\Pages::fromStorageError($e));
    }
    admin_emit($res);
}

/** The studios' sign-in realm, beside the admin folder named by ADMIN_BASE_URL. */
function studio_realm(): Admin\Realm
{
    return Admin\Realm::studio(admin_base_url());
}

/**
 * The studio's sign-in flow: once a link is spent, Accounts::signIn finds or makes the account; a full studio
 * (null there) is false to SignIn, so no session starts.
 */
function studio_sign_in(\PDO $db, Admin\Clock $clock, Admin\Mailer $mailer, ?Admin\Realm $realm = null, ?Admin\People $people = null): Admin\SignIn
{
    $accounts = new Music\Accounts($db, $clock, $people ?? admin_people());
    return new Admin\SignIn($db, $clock, $mailer, $realm ?? studio_realm(), static fn(string $email): int|false => $accounts->signIn($email) ?? false);
}

/**
 * The whole of a thin sign-in page: music_early_refusal('page') first, then the database, $route(SignIn,
 * Request), the response, and the queued mail once the client has it. Storage that is refused becomes the admin 503 page.
 *
 * @param callable(Admin\SignIn, Admin\Request): Admin\Response $route
 */
function studio_sign_in_serve(callable $route): void
{
    $r = music_request();
    $base = admin_base_url();
    $refused = music_early_refusal('page', $r, $base);
    if ($refused !== null) {
        admin_emit($refused);
        return;
    }
    $signIn = null;
    try {
        $db = Admin\Db::open(Admin\Db::dataDir());
        $signIn = studio_sign_in($db, new Admin\SystemClock(), admin_mailer($r->host, null, $base));
        $res = $route($signIn, $r);
    } catch (Admin\StorageUnavailable | PDOException $e) {
        error_log('music: storage unavailable: ' . $e->getMessage());
        $res = Music\Http::finish(Admin\Pages::fromStorageError($e));
    }
    admin_emit($res);
    if ($signIn !== null) {
        if (function_exists('fastcgi_finish_request')) {
            fastcgi_finish_request();
        }
        $signIn->flush();
    }
}
