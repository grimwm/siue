<?php
// Helpers for the music workroom's tests: fixed fingerprints, a fake sealed
// bundle (only its clear header is real), a draft bundle, a store in a temp
// directory, and a signed-in request.
declare(strict_types=1);

require_once __DIR__ . '/AdminFakes.php';
require_once __DIR__ . '/AdminPagesTest.php'; // MemoryMailer
require_once __DIR__ . '/../../music/lib/bootstrap.php';

const MUSIC_FP_CURRENT = 'abababababababababababababababababababababababababababababababab';
const MUSIC_FP_PREVIOUS = 'cdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcd';

function music_keys(): Music\PublicKeys
{
    return new Music\PublicKeys(MUSIC_FP_CURRENT, [MUSIC_FP_PREVIOUS]);
}

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

/** @return array{Music\Store, PDO, string, FakeClock} store, database, music dir, clock */
function music_world(?Music\PublicKeys $keys = null): array
{
    $clock = new FakeClock(1_800_000_000);
    $db = admin_tmp_db();
    $dir = admin_tmp_dir() . '/music';
    return [new Music\Store($db, $dir, $clock, $keys ?? music_keys()), $db, $dir, $clock];
}

/** A request with a live session cookie (and HTTPS). */
function music_signed_in(Admin\Sessions $sessions, array $over = []): Admin\Request
{
    $header = $sessions->start(req(['https' => true]));
    preg_match('/' . preg_quote(Admin\Sessions::COOKIE, '/') . '=([0-9a-f]{64})/', $header, $m);
    return req(array_replace(['https' => true, 'cookies' => [Admin\Sessions::COOKIE => $m[1]]], $over));
}
