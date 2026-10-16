<?php
// Operation Tankity rooms. Room storage: one row per room in Tankity's
// database (server/db.php), a room held as one write transaction from load to
// unlock, and the room lifecycle (allocate, register, load, save, close,
// discard, sweep), the per-address counts, the disk guard and the tombstones. Loaded by rooms.php; it runs nothing on its own.
declare(strict_types=1);

// Not an endpoint: rooms.php defines this constant, then requires the file.
// A direct request gets a 404 and nothing runs.
if (!defined('TANKITY_ROOMS_INCLUDED')) {
    http_response_code(404);
    exit;
}

/* A room serializes to about 30-45 KB; one far past that is a bug, refused
   rather than stored. */
const ROOM_MAX_BYTES = 131072;
/* A seated poll of a room that is not playing refreshes its touch this often;
   in between it is a read that never waits for the writer. */
const ROOM_HEARTBEAT_SECS = 20;
const ROOM_LOBBIES_HOSTED = 'too many lobbies open from here; start or leave one first';
const ROOM_FULL = 'The server is full. Try again later.';
/* A closed room keeps its tombstone (who may hear why, and its
   code withheld from new rooms) this long: 14 days. */
const ROOM_TOMBSTONE_SECS = 1209600;

/* A held room: its write transaction is open until room_unlock (commit),
   room_close (delete, commit) or room_discard (roll back). */
final class RoomLock
{
    public bool $open = true;
    public bool $saved = false;

    public function __construct(public readonly PDO $db, public readonly string $code)
    {
    }
}

// Through $GLOBALS so it is a real global even when a test script loads this in a closure.
$GLOBALS['ROOM_HELD'] ??= [];

/* A request that ends while it holds a room (an early reply, a fatal) keeps
   what room_save wrote and nothing else. */
function room_release_all(): void
{
    foreach ($GLOBALS['ROOM_HELD'] as $lock) {
        $lock->saved ? room_unlock($lock) : room_discard($lock);
    }
}
function room_hold(RoomLock $lock): RoomLock
{
    static $guard = false;
    if (!$guard) {
        $guard = true;
        register_shutdown_function('room_release_all');
    }
    $GLOBALS['ROOM_HELD'][$lock->code] = $lock;
    return $lock;
}

/* Opens the write transaction a room is held under. Every room shares the
   one writer: a request that waits past the busy timeout answers 503 rather
   than tying up a PHP worker. Never hold a room across a sleep, a long
   poll or any wait on the network. */
function room_begin(): PDO
{
    try {
        $db = tankity_db();
        $db->exec('BEGIN IMMEDIATE');
        tankity_depth($db, 1);
        return $db;
    } catch (Throwable $e) {
        room_store_fail($e);
    }
}

/* Answers a storage failure as JSON, never as an uncaught fatal: busy, a
   refused directory and a database error (disk full, read-only) are 503 (the
   client retries); anything else is logged and 500. A refusal was logged
   where it was made. */
function room_store_fail(Throwable $e): never
{
    if (tankity_busy($e)) {
        room_json_out(503, ['error' => 'this room is busy; try again']);
    }
    if ($e instanceof TankityStorageRefused) {
        room_json_out(503, ['error' => 'store unavailable']);
    }
    error_log('tankity rooms: ' . $e->getMessage());
    room_json_out($e instanceof PDOException ? 503 : 500, ['error' => 'store unavailable']);
}
function room_unlock($lock): void
{
    if (!$lock instanceof RoomLock || !$lock->open) {
        return;
    }
    // Commit first: if it fails (the DELETE journal waits on readers) the
    // transaction is rolled back before the request answers, never left open.
    try {
        $lock->db->exec('COMMIT');
    } catch (Throwable $e) {
        try {
            $lock->db->exec('ROLLBACK');
        } catch (PDOException) {
            // SQLite already rolled the transaction back.
        }
        $failed = $e;
    } finally {
        $lock->open = false;
        unset($GLOBALS['ROOM_HELD'][$lock->code]);
        tankity_depth($lock->db, -1);
    }
    if (isset($failed)) {
        room_store_fail($failed);
    }
}
/* Drops a room whose creation failed after allocation, or anything a request
   held but never saved. */
function room_discard($lock): void
{
    if (!$lock instanceof RoomLock || !$lock->open) {
        return;
    }
    $lock->open = false;
    unset($GLOBALS['ROOM_HELD'][$lock->code]);
    tankity_depth($lock->db, -1);
    $lock->db->exec('ROLLBACK');
}

/* The room in a row, or null when nothing readable is there. */
function room_decode(mixed $raw): ?array
{
    $v = is_string($raw) && $raw !== '' ? @unserialize($raw, ['allowed_classes' => false]) : false;
    return is_array($v) ? $v : null;
}

/* How long a started room (play, shop) lasts with no human taking a turn:
   one turn time per human seated, never less than the live window. A full
   this bounds disk. */
function room_idle_limit(array $r): int
{
    $humans = 0;
    foreach ($r['seats'] ?? [] as $s) {
        $humans += ($s['human'] ?? false) ? 1 : 0;
    }
    return max(room_live_secs(), max(1, $humans) * room_turn_secs($r));
}

/* When a room closes: a lobby a live window after its last touch (seated
   polls heartbeat it); a started room its idle limit after the last human
   act. There is no total-age cap. A room saved before acts were stamped reads
   its last touch as the act. */
function room_expires(array $r): int
{
    $touched = (int) ($r['touched'] ?? $r['created'] ?? 0);
    $phase = $r['phase'] ?? 'lobby';
    if ($phase === 'lobby') {
        return $touched + room_live_secs();
    }
    // A finished match keeps its final standings up for the live window only,
    // so it soon gives back its place, its host's place and any long place.
    $limit = $phase === 'over' ? room_live_secs() : room_idle_limit($r);
    return room_acted($r) + $limit;
}

/* The last turn-moving act (rooms.php stamps it); a room saved before the
   key was renamed reads actedAt, then its last touch. */
function room_acted(array $r): int
{
    return (int) ($r['acted'] ?? $r['actedAt'] ?? $r['touched'] ?? $r['created'] ?? 0);
}

/* Seconds from now until the room closes for want of play, never negative.
   Replies carry it beside expiresAt so a client counts down from when the
   answer arrived, whatever its own clock says. */
function room_closes_in(array $r, ?int $now = null): int
{
    return max(0, room_expires($r) - ($now ?? time()));
}

/* Past its expiry. The stored column (rooms.expires) is room_expires at the
   last save, so the per-address counts and the sweep agree with this. */
function room_idle(array $r, ?int $now = null): bool
{
    return ($now ?? time()) > room_expires($r);
}

/* The database file plus its -wal, in bytes. filesize() is a stat; PHP
   caches stats, so the cache is cleared first. */
function room_db_bytes(): int
{
    clearstatcache();
    $path = tankity_data_dir() . '/' . TANKITY_DB_FILE;
    return (int) @filesize($path) + (int) @filesize($path . '-wal');
}

/* True when the database has reached room_db_max_mb: a new lobby is refused
   (ROOM_FULL); nothing already running is touched. */
function room_db_full(): bool
{
    return room_db_bytes() >= room_db_max_mb() * 1048576;
}

/* Live lobbies an address hosts, not counting $except: what
   lobbies_per_address bounds. */
function room_lobbies_hosted(string $hostKey, string $except = '', ?int $now = null): int
{
    if ($hostKey === '') {
        return 0;
    }
    $q = tankity_db()->prepare("SELECT COUNT(*) FROM rooms WHERE host = ? AND phase = 'lobby' AND code <> ? AND expires >= ?");
    $q->execute([$hostKey, $except, $now ?? time()]);
    return (int) $q->fetchColumn();
}

/* Closes a room with a tombstone, inside the caller's write transaction: its
   row goes, and a tombstone keeps the hashes of its human seats' tokens for
   ROOM_TOMBSTONE_SECS, so those players (and nobody else) hear why. */
function room_tombstone(PDO $db, string $code, string $reason, int $now): void
{
    $q = $db->prepare('SELECT data FROM rooms WHERE code = ?');
    $q->execute([$code]);
    $room = room_decode($q->fetchColumn());
    $seats = [];
    foreach ($room['seats'] ?? [] as $s) {
        if (($s['human'] ?? false) && is_string($s['token'] ?? null) && $s['token'] !== '') {
            $seats[] = room_token_hash($s['token']);
        }
    }
    $db->prepare('DELETE FROM rooms WHERE code = ?')->execute([$code]);
    $db->prepare('INSERT OR REPLACE INTO closed (code, reason, at, seats) VALUES (?, ?, ?, ?)')
        ->execute([$code, $reason, $now, json_encode($seats)]);
}
function room_token_hash(string $token): string
{
    return substr(hash('sha256', $token), 0, 32);
}

/* Why a seat's room is gone (the tombstone's reason), or null: only a token whose hash the
   tombstone holds hears it. A read. */
function room_closed_for(string $code, string $token): ?string
{
    if ($token === '') {
        return null;
    }
    $q = tankity_db()->prepare('SELECT reason, seats FROM closed WHERE code = ?');
    $q->execute([$code]);
    $row = $q->fetch(PDO::FETCH_NUM);
    if ($row === false) {
        return null;
    }
    $seats = json_decode((string) $row[1], true);
    return is_array($seats) && in_array(room_token_hash($token), $seats, true) ? (string) $row[0] : null;
}

/* Deletes spent puzzles whose challenge has expired anyway, at most $limit
   (housekeeping). */
function room_pow_expire(int $now, int $limit = 5000): int
{
    return tankity_tx(tankity_db(), function (PDO $db) use ($now, $limit): int {
        $q = $db->prepare('DELETE FROM pow_used WHERE id IN (SELECT id FROM pow_used WHERE exp < ? LIMIT ?)');
        $q->execute([$now, $limit]);
        return $q->rowCount();
    });
}

/* Deletes tombstones older than ROOM_TOMBSTONE_SECS, at most $limit
   (housekeeping). */
function room_tombstone_expire(int $now, int $limit = 5000): int
{
    return tankity_tx(tankity_db(), function (PDO $db) use ($now, $limit): int {
        $q = $db->prepare('DELETE FROM closed WHERE code IN (SELECT code FROM closed WHERE at < ? LIMIT ?)');
        $q->execute([$now - ROOM_TOMBSTONE_SECS, $limit]);
        return $q->rowCount();
    });
}

/* Holds a new room: a free code taken under the write lock, its row inserted
   empty. The caller checks the address's lobbies, saves it, then unlocks (or
   discards). */
function room_alloc(?callable $nextCode = null): RoomLock
{
    $nextCode = $nextCode ?? fn() => room_new_code(fn($c) => false);
    $db = room_begin();
    // A code with a tombstone is never drawn again while the tombstone lasts.
    $ins = $db->prepare("INSERT OR IGNORE INTO rooms (code, data, created, touched, expires, phase, acted)
        SELECT ?, '', ?, ?, ?, 'lobby', ? WHERE NOT EXISTS (SELECT 1 FROM closed WHERE code = ?)");
    for ($try = 0; $try < 50; $try++) {
        $code = $nextCode();
        $now = time();
        $ins->execute([$code, $now, $now, $now + room_live_secs(), $now, $code]);
        if ($ins->rowCount() === 1) {
            return room_hold(new RoomLock($db, $code));
        }
    }
    tankity_depth($db, -1);
    $db->exec('ROLLBACK');
    room_json_out(500, ['error' => 'no free room code; try again']);
}

/* Live started matches an address hosts, not counting $except (the room
   being started): what room_hosts_per_address bounds. Under the write lock
   the count is exact. */
function room_hosted(string $hostKey, string $except = '', ?int $now = null): int
{
    if ($hostKey === '') {
        return 0;
    }
    $q = tankity_db()->prepare("SELECT COUNT(*) FROM rooms WHERE host = ? AND phase IN ('play', 'shop', 'over') AND code <> ? AND expires >= ?");
    $q->execute([$hostKey, $except, $now ?? time()]);
    return (int) $q->fetchColumn();
}

/* A room as stored, read without the write lock, for a poll that changes
   nothing; null when there is none or it is idle. */
function room_peek(string $code): ?array
{
    $q = tankity_db()->prepare('SELECT data FROM rooms WHERE code = ?');
    $q->execute([$code]);
    $room = room_decode($q->fetchColumn());
    if ($room === null || ($room['code'] ?? null) !== $code || room_idle($room)) {
        return null;
    }
    room_retire_guns($room); // what room_load shows for a room still holding a retired gun
    return $room;
}

/* Holds a room for this request: [room, lock, code]. With no room (never
   made, closed, or idle and cleared out now) it answers [null, null, code]
   and holds nothing. */
function room_load(string $code): array
{
    $db = room_begin();
    $q = $db->prepare('SELECT data FROM rooms WHERE code = ?');
    $q->execute([$code]);
    $room = room_decode($q->fetchColumn());
    if ($room !== null && ($room['code'] ?? null) === $code) {
        // A room saved before a gun left the arsenal refunds it (server/rules.php).
        room_retire_guns($room);
        if (!room_idle($room)) {
            return [$room, room_hold(new RoomLock($db, $code)), $code];
        }
        // Whoever loads a room clears it out when it is idle.
        $db->prepare('DELETE FROM rooms WHERE code = ?')->execute([$code]);
    }
    tankity_depth($db, -1);
    $db->exec('COMMIT');
    return [null, null, $code];
}
/* The address that hosts the room now: the host seat's, so the hosting cap
   follows the host when the role passes to another player (and a room with
   no human left counts against nobody). A host seat from before addresses
   were stored reads the address recorded at create. */
function room_host_key(array $room): string
{
    $seat = $room['seats'][room_host($room)] ?? null;
    if (!is_array($seat) || !($seat['human'] ?? false)) {
        return '';
    }
    $addr = (string) ($seat['addr'] ?? '');
    return $addr !== '' ? $addr : (string) ($room['hostKey'] ?? '');
}
/* The address a room counts against (the host column): a lobby's current
   host, for the lobby cap; a started match's starter, for the match cap, so
   a host who leaves a running match (the role passes on) still has it
   counted until it ends. */
function room_cap_key(array $room): string
{
    if (in_array($room['phase'] ?? 'lobby', ['play', 'shop', 'over'], true) && is_string($room['startedBy'] ?? null) && $room['startedBy'] !== '') {
        return $room['startedBy'];
    }
    return room_host_key($room);
}
function room_save($lock, string $code, array $room): bool
{
    if (!$lock instanceof RoomLock || !$lock->open) {
        return false;
    }
    $room['touched'] = time();
    $raw = serialize($room);
    if (strlen($raw) > ROOM_MAX_BYTES) {
        return false;
    }
    try {
        $q = $lock->db->prepare('UPDATE rooms SET data = ?, touched = ?, expires = ?, host = ?, phase = ?, acted = ?, turn_secs = ?
            WHERE code = ?');
        $q->bindValue(1, $raw, PDO::PARAM_LOB);
        $q->bindValue(2, $room['touched'], PDO::PARAM_INT);
        $q->bindValue(3, room_expires($room), PDO::PARAM_INT);
        $q->bindValue(4, room_cap_key($room));
        $q->bindValue(5, (string) ($room['phase'] ?? 'lobby'));
        $q->bindValue(6, room_acted($room), PDO::PARAM_INT);
        $q->bindValue(7, room_turn_secs($room), PDO::PARAM_INT);
        $q->bindValue(8, $code);
        $q->execute();
    } catch (PDOException $e) {
        room_store_fail($e);
    }
    $lock->saved = true;
    return $q->rowCount() === 1;
}
/* Closes a room the caller holds: its row goes, then the lock. A request
   waiting for it finds no room: the 404. */
function room_close($lock): void
{
    if (!$lock instanceof RoomLock || !$lock->open) {
        return;
    }
    try {
        $lock->db->prepare('DELETE FROM rooms WHERE code = ?')->execute([$lock->code]);
    } catch (PDOException $e) {
        room_store_fail($e);
    }
    $lock->saved = true;
    room_unlock($lock);
}
/* Deletes idle rooms, at most $limit. Housekeeping and create run it; a
   database too busy to answer skips it. */
function room_sweep(?int $now = null, int $limit = 100): int
{
    $now ??= time();
    try {
        return tankity_tx(tankity_db(), function (PDO $db) use ($now, $limit): int {
            $q = $db->prepare('DELETE FROM rooms WHERE code IN (SELECT code FROM rooms WHERE expires < ? LIMIT ?)');
            $q->execute([$now, $limit]);
            return $q->rowCount();
        });
    } catch (Throwable $e) {
        if (!tankity_busy($e)) {
            throw $e;
        }
        return 0;
    }
}
function room_rand_token(int $bytes = 32): string
{
    return bin2hex(random_bytes($bytes));
}
function room_new_code(callable $exists): string
{
    $alpha = ROOM_CODE_ALPHABET;
    $n = strlen($alpha);
    do {
        $code = '';
        for ($i = 0; $i < ROOM_CODE_LEN; $i++) {
            $code .= $alpha[random_int(0, $n - 1)];
        }
    } while ($exists($code));
    return $code;
}
