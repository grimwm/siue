<?php
// games/tankity/server/rate.php
// Per-address hourly allowances, counted in the database's rate table: one
// row per address, kind and RATE_SLOT seconds. Rooms count creates and joins
// under kind 'room'. Loaded by rooms.php; it serves nothing.
declare(strict_types=1);
if (count(get_included_files()) === 1) {
    http_response_code(404);
    exit;
}
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/db.php';

// An allowance counts in slots of this many seconds, and a check sums the
// last hour's slots and the one it began in: never more than the allowance in
// any hour, and an allowance spent all at once comes back at most one slot late.
const RATE_SLOT = 600;
// Count rows housekeeping deletes per pass (one a minute), so a pass is bounded by rows, not time.
const RATE_EXPIRE_BATCH = 5000;
// Rooms created and joined, together, by one address an hour: a class behind
// one campus NAT hosting and joining all evening fits; a script minting rooms
// and seats does not.
const ROOM_JOINS_PER_HOUR = 300;

/* A positive whole-number setting, or $default when it is unset. A value set
   but refused is logged once (naming the setting and the value), then the
   default is used. */
function tankity_int_setting(string $env, string $key, int $default): int
{
    static $logged = [];
    $set = tankity_setting($env, $key, '');
    $raw = trim(is_scalar($set) ? (string) $set : '');
    if (preg_match('/^\d{1,6}$/', $raw) && (int) $raw > 0) {
        return (int) $raw;
    }
    if ($raw !== '' || !is_scalar($set)) {
        $shown = is_scalar($set) ? var_export(substr($raw, 0, 40), true) : get_debug_type($set);
        if (!isset($logged[$key][$shown])) {
            $logged[$key][$shown] = true;
            error_log("tankity setting $key ($env): refused $shown, not a whole number from 1 to 999999; using $default");
        }
    }
    return $default;
}

function room_joins_per_hour(): int
{
    return tankity_int_setting('TANKITY_ROOM_JOINS_PER_HOUR', 'room_joins_per_hour', ROOM_JOINS_PER_HOUR);
}

// Unexpired rooms one address can host at once: a room can outlive its host's
// attention (long turn times), so the cap on rooms is shared out by address.
const ROOM_HOSTS_PER_ADDRESS = 4;
/* The address a room remembers for a seat: a hash of the guard's client key,
   so the stored room never holds an address itself. */
function room_client_hash(): string
{
    return substr(hash('sha256', 'tankity-addr|' . tankity_guard()->clientKey()), 0, 16);
}
function room_hosts_per_address(): int
{
    return tankity_int_setting('TANKITY_ROOM_HOSTS_PER_ADDRESS', 'room_hosts_per_address', ROOM_HOSTS_PER_ADDRESS);
}

/* How much of its $kind allowance an address ($client, the guard's key) has
   used in the last hour: the counts of the slots that hour touches, the slot
   it began in counted whole. Seven indexed rows at most. */
function rate_used(PDO $db, string $client, string $kind, int $now): int
{
    $q = $db->prepare('SELECT COALESCE(SUM(n), 0) FROM rate WHERE client = ? AND kind = ? AND slot >= ?');
    $q->execute([$client, $kind, intdiv($now - 3600, RATE_SLOT)]);
    return (int) $q->fetchColumn();
}

/* Takes one of an address's $perHour $kind slots inside the caller's write
   transaction, so a rollback gives it back; false, and nothing taken, when
   they are spent. */
function rate_take(PDO $db, string $client, string $kind, int $perHour, int $now): bool
{
    if (rate_used($db, $client, $kind, $now) >= $perHour) {
        return false;
    }
    $db->prepare('INSERT INTO rate (client, kind, slot, n) VALUES (?, ?, ?, 1)
        ON CONFLICT (client, kind, slot) DO UPDATE SET n = n + 1')->execute([$client, $kind, intdiv($now, RATE_SLOT)]);
    return true;
}

/* Takes one of an address's room_joins_per_hour() creates and joins, in its
   own write transaction; false, and nothing taken, when they are spent. A
   spent allowance is answered from a plain read, so a flood past it never
   waits on the write lock; under it, the take checks again as the writer. */
function room_rate_take(string $client, int $now): bool
{
    $perHour = room_joins_per_hour();
    $db = tankity_db();
    if (rate_used($db, $client, 'room', $now) >= $perHour) {
        return false;
    }
    return tankity_tx($db, fn(PDO $db): bool => rate_take($db, $client, 'room', $perHour, $now));
}

/* Deletes counts too old to matter, at most $limit; answers how many. */
function rate_expire(int $now, int $limit = RATE_EXPIRE_BATCH): int
{
    return tankity_tx(tankity_db(), function (PDO $db) use ($now, $limit): int {
        $q = $db->prepare('DELETE FROM rate WHERE rowid IN (SELECT rowid FROM rate WHERE slot < ? LIMIT ?)');
        $q->execute([intdiv($now - 3600, RATE_SLOT), $limit]);
        return $q->rowCount();
    });
}
