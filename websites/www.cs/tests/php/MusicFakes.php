<?php
// Helpers for the music workroom's tests: fixed fingerprints, a fake sealed
// bundle (only its clear header is real), a draft bundle, a store in a temp
// directory, the pages on studio sessions, and signed-in requests.
declare(strict_types=1);

require_once __DIR__ . '/AdminFakes.php';
require_once __DIR__ . '/AdminPagesTest.php'; // MemoryMailer
require_once __DIR__ . '/../../music/lib/bootstrap.php';

const MUSIC_FP_CURRENT = 'abababababababababababababababababababababababababababababababab';
const MUSIC_FP_PREVIOUS = 'cdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcd';

/** A bundle with a real header and $body random bytes after it. */
function music_sealed(string $fpHex = MUSIC_FP_CURRENT, int $body = 64): string
{
    return 'SIUEN1' . hex2bin($fpHex) . random_bytes($body);
}

/** The SIUED1 draft bundle (Formats) for name => bytes. */
function music_draft_bundle(array $files): string
{
    $out = 'SIUED1' . chr(count($files));
    foreach ($files as $name => $bytes) {
        $out .= chr(strlen($name)) . $name . pack('N', strlen($bytes)) . $bytes;
    }
    return $out;
}

/** The People of $json (studio.json's shape); a test-only `max_shared_bytes` key sets a pool smaller than a MiB. */
function music_people(string $json): Admin\People
{
    $d = json_decode($json, true);
    $bytes = is_array($d) ? ($d['max_shared_bytes'] ?? null) : null;
    if ($bytes !== null) {
        unset($d['max_shared_bytes']);
        $json = (string) json_encode($d === [] ? new stdClass() : $d);
    }
    $people = Admin\People::fromJson($json) ?? throw new InvalidArgumentException('bad people JSON');
    return $bytes === null ? $people : $people->withMaxSharedBytes($bytes);
}

/**
 * The store of $email's account (signed in first) on $db, with the named people and caps of $people (studio.json's shape).
 * @return array{Music\Store, Music\Accounts, int} store, accounts, the account's id
 */
function music_store_of(PDO $db, string $dir, Admin\Clock $clock, string $email = Admin\Auth::OWNER, string $people = '{}'): array
{
    $named = music_people($people);
    $accounts = new Music\Accounts($db, $clock, $named, $dir);
    $id = $accounts->signIn($email) ?? throw new RuntimeException("no account for $email");
    $store = new Music\Store($db, $dir, $clock, $id, Music\Limits::for($named, $email), $accounts);
    return [$store, $accounts, $id];
}

/**
 * @return array{Music\Store, PDO, string, FakeClock, Music\Accounts, int} store, database, music dir, clock, accounts, the
 * account's id; the account is the owner's unless $email names another; $keyed stores a keyring naming the fixed fingerprints
 */
function music_world(bool $keyed = true, string $email = Admin\Auth::OWNER, string $people = '{}'): array
{
    $clock = new FakeClock(1_800_000_000);
    $db = admin_tmp_db();
    $dir = admin_tmp_dir() . '/music';
    [$store, $accounts, $id] = music_store_of($db, $dir, $clock, $email, $people);
    if ($keyed) {
        $store->putKeyring('{"v":1}', MUSIC_FP_CURRENT, [MUSIC_FP_PREVIOUS]);
    }
    return [$store, $db, $dir, $clock, $accounts, $id];
}

/** A request carrying a live studio session of $account (and HTTPS); $studio is a studio realm's Sessions. */
function music_signed_in(Admin\Sessions $studio, int $account, array $over = []): Admin\Request
{
    $header = $studio->start(req(['https' => true]), $account);
    preg_match('/^__Secure-studio=([0-9a-f]{64});/', $header, $m);
    return req(array_replace(['https' => true, 'cookies' => ['__Secure-studio' => $m[1]]], $over));
}

/** A request carrying a live admin session (and HTTPS); $admin is the admin realm's Sessions. */
function music_admin_signed_in(Admin\Sessions $admin, array $over = []): Admin\Request
{
    $header = $admin->start(req(['https' => true]));
    preg_match('/^' . preg_quote(Admin\Sessions::COOKIE, '/') . '=([0-9a-f]{64});/', $header, $m);
    return req(array_replace(['https' => true, 'cookies' => [Admin\Sessions::COOKIE => $m[1]]], $over));
}

/** fn(int $account): Music\Store on $db and $dir, each account with the limits its address has under $people (studio.json's shape). */
function music_store_for(PDO $db, string $dir, Admin\Clock $clock, string $people = '{}'): Closure
{
    $named = music_people($people);
    $accounts = new Music\Accounts($db, $clock, $named, $dir);
    return static fn(int $account): Music\Store => new Music\Store($db, $dir, $clock, $account, Music\Limits::for($named, (string) $accounts->emailOf($account)), $accounts);
}

/**
 * The workroom's pages on $db and $dir, as music_run builds them, with studio sessions beside the admin folder $base.
 * @return array{Music\Pages, Admin\Sessions, Closure, Music\Accounts} pages, studio sessions, store for an account, accounts
 */
function music_pages(PDO $db, string $dir, Admin\Clock $clock, string $base, string $people = '{}'): array
{
    $named = music_people($people);
    $accounts = new Music\Accounts($db, $clock, $named, $dir);
    $storeFor = music_store_for($db, $dir, $clock, $people);
    $sessions = new Admin\Sessions($db, $clock, Admin\Realm::studio($base));
    return [new Music\Pages($storeFor, $accounts, $named, $sessions, '0123456789', $base, new Music\AiKeys($db, $clock)), $sessions, $storeFor, $accounts];
}

/** A locked keyring envelope of the pinned shape (Music\Keyring), random inside. */
function music_locked_keyring(array $over = []): array
{
    return $over + ['v' => 1, 'kdf' => 'PBKDF2-SHA-256', 'iterations' => 600000, 'salt' => base64_encode(random_bytes(16)),
        'iv' => base64_encode(random_bytes(12)), 'ct' => base64_encode(random_bytes(2400))];
}
