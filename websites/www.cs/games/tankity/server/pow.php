<?php
// Operation Tankity rooms. The room puzzle: creating or joining a room costs
// a small proof of work, which gets harder under load (README "Room slots").
//
// A challenge is `v1.<issued>.<purpose>.<bits>.<rand>.<mac>`: the server's
// unix seconds, `c` (create) or `j` (join), the leading zero bits each
// solution needs, 16 random bytes (base64url) and the first 22 base64url
// characters of HMAC-SHA256(pow_key, the first five parts . "|" . the asker's
// address hash). Nothing is stored at issue. A solution is POW_COUNT distinct
// nonces, each with PBKDF2-HMAC-SHA256(challenge, "tankity-pow|<nonce>",
// POW_ITER iterations, 32 bits) starting with `bits` zero bits; the browser
// finds them with WebCrypto (src/pow.ts). A challenge lives POW_TTL seconds by
// the server's clock and is spent once (the pow_used table).
//
// The checks run in a fixed order: format, MAC (purpose and address are
// inside it), age, the work. The replay check comes last, in rooms.php: a
// plain read first, then the spend in the same write transaction that charges
// the allowance. Loaded by rooms.php; it runs nothing on its own.
declare(strict_types=1);

// Not an endpoint: rooms.php defines this constant, then requires the file.
// A direct request gets a 404 and nothing runs.
if (!defined('TANKITY_ROOMS_INCLUDED')) {
    http_response_code(404);
    exit;
}

const POW_ITER = 100;
const POW_COUNT = 4;
const POW_TTL = 120;
/* A challenge stamped this far ahead of the server's clock still counts (two
   PHP workers a second apart); further ahead is refused as expired. */
const POW_SKEW = 5;
/* The window the global create count (the surge signal) looks back over. */
const POW_SURGE_SECS = 600;
/* Load raises the bits by at most this much, so a phone stays within a few seconds. */
const POW_RAISE_MAX = 2;
const POW_BAD = [403, 'puzzle-bad', 'That puzzle is not one of ours.'];
const POW_EXPIRED = [403, 'puzzle-expired', 'That puzzle ran out of time.'];
const POW_SHORT = [422, 'puzzle-short', 'That puzzle is not finished.'];
const POW_WRONG = [403, 'puzzle-wrong', 'That puzzle is not solved.'];
const POW_SPENT = [409, 'puzzle-spent', 'That puzzle was already used.'];

/* The server's clock for the puzzle checks. TANKITY_TEST_CLOCK and
   TANKITY_TEST_NOW are set only by PHPUnit (test/php/RoomPowGateTest.php),
   to redeem a puzzle "later" without waiting; no host sets them. */
function room_now(): int
{
    $now = (string) getenv('TANKITY_TEST_NOW');
    return getenv('TANKITY_TEST_CLOCK') === '1' && ctype_digit($now) ? (int) $now : time();
}

/* The key challenges are signed with, derived from this install's address key. */
function room_pow_key(): string
{
    return hash_hmac('sha256', 'tankity-pow-v1', tankity_addr_key(), true);
}

function room_pow_b64url(string $raw): string
{
    return rtrim(strtr(base64_encode($raw), '+/', '-_'), '=');
}

/* The MAC of a challenge's first five parts, bound to the asker's address. */
function room_pow_mac(string $payload): string
{
    return substr(room_pow_b64url(hash_hmac('sha256', $payload . '|' . room_client_hash(), room_pow_key(), true)), 0, 22);
}

/* Creates from every address in the surge window (rate rows under client `*`). */
function room_pow_creates(PDO $db, int $now): int
{
    return rate_used_since($db, '*', 'create', $now - POW_SURGE_SECS);
}

/* Counts one create toward the surge signal, inside the caller's transaction. */
function room_pow_count_create(PDO $db, int $now): void
{
    $db->prepare("INSERT INTO rate (client, kind, slot, n) VALUES ('*', 'create', ?, 1)
        ON CONFLICT (client, kind, slot) DO UPDATE SET n = n + 1")->execute([intdiv($now, RATE_SLOT)]);
}

/* The bits a new challenge for $purpose ('c' or 'j') asks for: the setting
   for a join and one more for a create, one more again when started matches
   or lobbies reach 75 % of their caps or creates surge, two more when either
   cap is reached. Three indexed reads; 0 when the puzzle is off. */
function room_pow_bits(string $purpose, ?int $now = null): int
{
    $base = room_pow_bits_setting();
    if ($base === 0) {
        return 0;
    }
    $now ??= time();
    $slots = room_slots_used('', $now);
    $lobbies = room_lobbies_used('', $now);
    $maxRooms = room_max_rooms();
    $maxLobbies = room_max_lobbies();
    $raise = 0;
    if ($slots >= $maxRooms || $lobbies >= $maxLobbies) {
        $raise = 2;
    } elseif (4 * $slots >= 3 * $maxRooms || 4 * $lobbies >= 3 * $maxLobbies
        || room_pow_creates(tankity_db(), $now) >= room_pow_surge()) {
        $raise = 1;
    }
    return $base + ($purpose === 'c' ? 1 : 0) + min(POW_RAISE_MAX, $raise);
}

/* A new challenge for $purpose, issued at $now: what action=challenge answers. */
function room_pow_issue(string $purpose, int $now): array
{
    $bits = room_pow_bits($purpose, $now);
    $payload = "v1.$now.$purpose.$bits." . room_pow_b64url(random_bytes(16));
    return ['challenge' => $payload . '.' . room_pow_mac($payload), 'bits' => $bits, 'count' => POW_COUNT,
        'iter' => POW_ITER, 'expiresIn' => POW_TTL];
}

/* Leading zero bits of the first 32 bits of PBKDF2-HMAC-SHA256(challenge,
   "tankity-pow|nonce", POW_ITER). Integers only: src/pow.ts counts the same
   way, and protocol/pow-vectors.json pins the two together. */
function room_pow_lead(string $challenge, int $nonce): int
{
    $n = unpack('N', hash_pbkdf2('sha256', $challenge, 'tankity-pow|' . $nonce, POW_ITER, 4, true))[1];
    $k = 0;
    while ($k < 32 && ($n & 0x80000000) === 0) {
        $n = ($n << 1) & 0xFFFFFFFF;
        $k++;
    }
    return $k;
}

/* Null when $pow (the body's {c, n}) solves a live challenge this server
   issued to this address for $purpose; else [status, code, message]. Pure:
   no database (the replay check is the caller's). */
function room_pow_check(mixed $pow, string $purpose, int $now): ?array
{
    if (room_pow_bits_setting() === 0) {
        return null;
    }
    if (!is_array($pow)) {
        return POW_SHORT; // no puzzle at all: one that was never finished
    }
    $c = is_string($pow['c'] ?? null) ? $pow['c'] : '';
    $n = is_array($pow['n'] ?? null) && array_is_list($pow['n']) ? $pow['n'] : [];
    $parts = explode('.', $c);
    if (count($parts) !== 6 || $parts[0] !== 'v1' || $parts[2] !== $purpose
        || !preg_match('/^\d{1,12}$/', $parts[1]) || !preg_match('/^\d{1,2}$/', $parts[3])) {
        return POW_BAD;
    }
    [, $issued, , $bits, , $mac] = $parts;
    if (!hash_equals(room_pow_mac(implode('.', array_slice($parts, 0, 5))), $mac)) {
        return POW_BAD;
    }
    $age = $now - (int) $issued;
    if ($age > POW_TTL || $age < -POW_SKEW) {
        return POW_EXPIRED;
    }
    $ints = array_values(array_unique(array_filter($n, static fn($x): bool => is_int($x) && $x >= 0 && $x < 2 ** 32)));
    if (count($ints) !== POW_COUNT || count($n) !== POW_COUNT) {
        return POW_SHORT;
    }
    foreach ($ints as $x) {
        if (room_pow_lead($c, $x) < (int) $bits) {
            return POW_WRONG;
        }
    }
    return null;
}

/* What pow_used keys a challenge by: its MAC, unique per challenge. */
function room_pow_id(string $challenge): string
{
    $parts = explode('.', $challenge);
    return (string) end($parts);
}

/* When a spent challenge's row may go: when the challenge would have expired anyway. */
function room_pow_exp(string $challenge): int
{
    return (int) (explode('.', $challenge)[1] ?? 0) + POW_TTL;
}

/* Spent already: a plain read, so a replay is refused before anything is charged. */
function room_pow_spent(string $challenge): bool
{
    $q = tankity_db()->prepare('SELECT 1 FROM pow_used WHERE id = ?');
    $q->execute([room_pow_id($challenge)]);
    return $q->fetchColumn() !== false;
}

/* Spends a checked challenge inside the caller's write transaction; false
   when it was already spent (a replay that raced the plain read). */
function room_pow_spend(PDO $db, string $challenge): bool
{
    $q = $db->prepare('INSERT OR IGNORE INTO pow_used (id, exp) VALUES (?, ?)');
    $q->execute([room_pow_id($challenge), room_pow_exp($challenge)]);
    return $q->rowCount() === 1;
}
