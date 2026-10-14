<?php
// Operation Tankity rooms. Room storage: one row per room in Tankity's
// database (server/db.php), a room held as one write transaction from load to
// unlock, and the room lifecycle (allocate, register, load, save, close,
// discard, sweep). Loaded by rooms.php; it runs nothing on its own.
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

/* How long a started room (play, shop, over) lasts with no human acting:
   every distinct address among its humans gets one turn's worth, never less
   than the live window. One address, however many seats it holds, cannot buy
   itself a long hold on the room cap, so a room with fewer than two distinct
   addresses lasts the live window whatever its turn time. A seat with no
   recorded address (an older room) counts as its own. */
function room_idle_limit(array $r): int
{
    $addrs = [];
    foreach ($r['seats'] ?? [] as $i => $s) {
        if ($s['human'] ?? false) {
            $addrs[(string) ($s['addr'] ?? '') !== '' ? 'a' . $s['addr'] : 's' . $i] = true;
        }
    }
    $distinct = count($addrs);
    return $distinct < 2 ? room_live_secs() : max(room_live_secs(), $distinct * room_turn_secs($r));
}

/* When a room closes: a lobby a live window after its last touch (seated
   polls heartbeat it); a started room its idle limit after the last human
   act. There is no total-age cap. A room saved before acts were stamped reads
   its last touch as the act. */
function room_expires(array $r): int
{
    $touched = (int) ($r['touched'] ?? $r['created'] ?? 0);
    if (($r['phase'] ?? 'lobby') === 'lobby') {
        return $touched + room_live_secs();
    }
    return (int) ($r['actedAt'] ?? $touched) + room_idle_limit($r);
}

/* Seconds from now until the room closes for want of play, never negative.
   Replies carry it beside expiresAt so a client counts down from when the
   answer arrived, whatever its own clock says. */
function room_closes_in(array $r, ?int $now = null): int
{
    return max(0, room_expires($r) - ($now ?? time()));
}

/* Past its expiry. The stored column (rooms.expires) is room_expires at the
   last save, so the count, the cap and the sweep agree with this. */
function room_idle(array $r, ?int $now = null): bool
{
    return ($now ?? time()) > room_expires($r);
}

/* Live rooms: not yet expired. A read, so the lobby's occupancy never waits
   for a writer. */
function room_count(?int $now = null): int
{
    $now ??= time();
    $q = tankity_db()->prepare('SELECT COUNT(*) FROM rooms WHERE expires >= ?');
    $q->execute([$now]);
    return (int) $q->fetchColumn();
}

/* Holds a new room: a free code taken under the write lock, its row inserted
   empty. The caller saves it, registers it, then unlocks (or discards). */
function room_alloc(?callable $nextCode = null): RoomLock
{
    $nextCode = $nextCode ?? fn() => room_new_code(fn($c) => false);
    $db = room_begin();
    $ins = $db->prepare('INSERT OR IGNORE INTO rooms (code, data, created, touched, expires) VALUES (?, ?, ?, ?, ?)');
    for ($try = 0; $try < 50; $try++) {
        $code = $nextCode();
        $now = time();
        $ins->execute([$code, '', $now, $now, $now + room_live_secs()]);
        if ($ins->rowCount() === 1) {
            return room_hold(new RoomLock($db, $code));
        }
    }
    tankity_depth($db, -1);
    $db->exec('ROLLBACK');
    room_json_out(500, ['error' => 'no free room code; try again']);
}

/* Registers a freshly saved room unless that would pass the cap. The write
   lock has been held since room_alloc, so the count is exact. True when
   registered, false at the cap, null when $code is not held here. */
function room_register(string $code, int $max): ?bool
{
    $lock = $GLOBALS['ROOM_HELD'][$code] ?? null;
    if (!$lock instanceof RoomLock || !$lock->open) {
        return null;
    }
    $now = time();
    try {
        $q = $lock->db->prepare('SELECT COUNT(*) FROM rooms WHERE code <> ? AND expires >= ?');
        $q->execute([$code, $now]);
        return (int) $q->fetchColumn() < $max;
    } catch (PDOException $e) {
        room_store_fail($e);
    }
}

/* Unexpired rooms an address hosts, not counting $except (the room being
   made). Under the write lock room_alloc takes, the count is exact. */
function room_hosted(string $hostKey, string $except = '', ?int $now = null): int
{
    if ($hostKey === '') {
        return 0;
    }
    $q = tankity_db()->prepare('SELECT COUNT(*) FROM rooms WHERE host = ? AND code <> ? AND expires >= ?');
    $q->execute([$hostKey, $except, $now ?? time()]);
    return (int) $q->fetchColumn();
}

/* Unexpired long games (turn time of 8 h or more), not counting $except (the
   room being made or changed). Reads each live room, at most the room cap's
   worth; under the write lock the count is exact. */
function room_long_count(string $except = '', ?int $now = null): int
{
    $q = tankity_db()->prepare('SELECT data FROM rooms WHERE code <> ? AND expires >= ?');
    $q->execute([$except, $now ?? time()]);
    $n = 0;
    foreach ($q->fetchAll(PDO::FETCH_COLUMN) as $raw) {
        $r = room_decode($raw);
        if ($r !== null && room_turn_secs($r) >= ROOM_LONG_TURN_SECS) {
            $n++;
        }
    }
    return $n;
}
const ROOM_LONG_FULL = 'every long-game slot is taken; pick a shorter turn time or try later';

/* A room as stored, read without the write lock, for a poll that changes
   nothing; null when there is none or it is idle. */
function room_peek(string $code): ?array
{
    $q = tankity_db()->prepare('SELECT data FROM rooms WHERE code = ?');
    $q->execute([$code]);
    $room = room_decode($q->fetchColumn());
    return $room !== null && ($room['code'] ?? null) === $code && !room_idle($room) ? $room : null;
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
        $q = $lock->db->prepare('UPDATE rooms SET data = ?, touched = ?, expires = ?, host = ? WHERE code = ?');
        $q->bindValue(1, $raw, PDO::PARAM_LOB);
        $q->bindValue(2, $room['touched'], PDO::PARAM_INT);
        $q->bindValue(3, room_expires($room), PDO::PARAM_INT);
        $q->bindValue(4, (string) ($room['hostKey'] ?? ''));
        $q->bindValue(5, $code);
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
