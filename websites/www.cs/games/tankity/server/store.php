<?php
// Operation Tankity rooms. Room storage: shared-memory segments, the registry of live codes, the semaphores
// that serialize access, and the room lifecycle (allocate, register, load, save,
// close, discard, sweep). Loaded by rooms.php; it runs nothing on its own.
declare(strict_types=1);

// Not an endpoint: rooms.php defines this constant, then requires the file.
// A direct request gets a 404 and nothing runs.
if (!defined('TANKITY_ROOMS_INCLUDED')) {
    http_response_code(404);
    exit;
}

/* Occupied means alive: a room nobody has touched recently is an abandoned
// husk. It still rejoins by code until the sweep deletes it, but it no
// longer holds one of the scarce slots. */
function room_count(): int
{
    $live = 0;
    $cutoff = time() - room_live_secs();
    foreach (array_keys(room_registry_read()) as $code) {
        $head = room_peek((string) $code);
        if ($head !== null && $head['touched'] >= $cutoff) {
            $live++;
        }
    }
    return $live;
}
/* Room segments are sized with headroom: a room serializes to about 30-45 KB,
// and Linux backs only the pages actually written. */
const ROOM_SEG_BYTES = 131072;
// A segment starts with three big-endian uint32s: the length of the
// serialized room that follows, then touched and created (unix seconds), so
// the idle rules can read a room's age without taking its lock. Length 0
// means a segment that has not been written yet.
const ROOM_SEG_HEAD = 12;
const ROOM_REGISTRY_BYTES = 262144;
const ROOM_REGISTRY_VAR = 1;
/* Rooms live in SysV shared memory, full stop: no disk fallback. Without
// the extensions every room endpoint honestly reports the store as
// unavailable instead of serving a second, divergent shelf. */
function room_use_shm(): bool
{
    static $v = null;
    if ($v === null) {
        $v = function_exists('sem_get') && function_exists('shm_attach') && function_exists('shmop_open');
    }
    return $v;
}
/* A room's key comes from its code; nothing is reserved in advance. */
function room_key(string $code, ?int $base = null): int
{
    return (($base ?? room_shm_key()) ^ crc32('room:' . $code)) & 0x7fffffff;
}
function room_registry_key(?int $base = null): int
{
    return (($base ?? room_shm_key()) ^ crc32('registry')) & 0x7fffffff;
}

/* ---- the registry: live codes, for the cap, occupancy and the sweep ---- */
/* Read with no lock: it is a display, a moment of staleness is fine. A read
// that races a writer can come back torn, so it is retried. */
function room_registry_read(): array
{
    $id = @shm_attach(room_registry_key(), ROOM_REGISTRY_BYTES);
    if ($id === false) {
        return [];
    }
    $reg = [];
    for ($i = 0; $i < 3; $i++) {
        $v = @shm_get_var($id, ROOM_REGISTRY_VAR);
        if (is_array($v)) {
            $reg = $v;
            break;
        }
    }
    @shm_detach($id);
    return $reg;
}
/* Takes a semaphore, waiting at most $max seconds (never forever): a holder
// that hangs must not pile every later request for its room into PHP workers
// until the pool runs dry and the whole site stalls. Short backoff, never a
// sem_remove; false when the wait ran out (or the semaphore was removed). */
const ROOM_LOCK_WAIT = 2.0;
/* What room_registry_update answers when its lock wait ran out. */
const ROOM_REGISTRY_BUSY = '__registry_busy__';
function room_sem_take($sem, float $max = ROOM_LOCK_WAIT): bool
{
    $deadline = microtime(true) + $max;
    $nap = 2000;
    while (true) {
        if (@sem_acquire($sem, true)) {
            return true;
        }
        if (microtime(true) >= $deadline) {
            return false;
        }
        usleep($nap);
        $nap = min(50000, $nap * 2);
    }
}
/* Read-modify-write under the registry's own brief lock. The callback gets
// the registry and returns the new one, or null to leave it as it is; the
// result of this call is the callback's second return value, if any. */
function room_registry_update(callable $fn)
{
    $sem = @sem_get(room_registry_key(), 1);
    if ($sem === false || !room_sem_take($sem)) {
        // Busy: never exit from here. The caller decides, so a create that
        // already allocated its segment can free it (no leak, no cap bypass).
        return ROOM_REGISTRY_BUSY;
    }
    $id = @shm_attach(room_registry_key(), ROOM_REGISTRY_BYTES);
    $out = null;
    if ($id !== false) {
        $v = @shm_get_var($id, ROOM_REGISTRY_VAR);
        [$new, $out] = $fn(is_array($v) ? $v : []);
        if ($new !== null) {
            @shm_put_var($id, ROOM_REGISTRY_VAR, $new);
        }
        @shm_detach($id);
    }
    @sem_release($sem);
    return $out;
}

/* ---- one room's segment ---- */
/* Crash safety. A room is held through its own semaphore, taken with a
// bounded wait (room_sem_take: at most ROOM_LOCK_WAIT seconds, then "busy",
// and a waiter never removes a semaphore). PHP's sem_get defaults to
// auto_release, which also puts the acquire on the kernel's undo list, so a
// request that ends, fatals or is killed lets go of what it held; the
// shutdown handler below releases explicitly as well. */
$ROOM_HELD = [];
function room_release_all(): void
{
    global $ROOM_HELD;
    foreach ($ROOM_HELD as $lock) {
        room_unlock($lock);
    }
}
function room_hold(array $lock): array
{
    global $ROOM_HELD;
    static $guard = false;
    if (!$guard) {
        $guard = true;
        register_shutdown_function('room_release_all');
    }
    $ROOM_HELD[$lock['key']] = $lock;
    return $lock;
}
/* Opens an existing room's segment and locks the room: blocking, or with
// $wait false a held room answers null at once. Null also means the room does
// not exist (or vanished while this waited). The handle carries the segment
// and the semaphore for the caller's critical section. */
function room_lock(string $code, bool $wait): ?array
{
    $key = room_key($code);
    $shm = @shmop_open($key, 'w', 0, 0);
    if ($shm === false) {
        return null;
    }
    $sem = @sem_get($key, 1);
    if ($sem === false) {
        room_json_out(500, ['error' => 'room memory is unavailable on this server']);
    }
    // A semaphore removed under a waiter makes this fail: the room was closed.
    // A wait that runs out on a room that still exists is "busy", not gone.
    if (!($wait ? room_sem_take($sem) : @sem_acquire($sem, true))) {
        if ($wait && @shmop_open($key, 'w', 0, 0) !== false) {
            room_json_out(503, ['error' => 'this room is busy; try again']);
        }
        return null;
    }
    return room_hold(['sem' => $sem, 'shm' => $shm, 'key' => $key, 'code' => $code, 'open' => true]);
}
function room_unlock($lock): void
{
    global $ROOM_HELD;
    if (!is_array($lock) || !($lock['open'] ?? false)) {
        return;
    }
    unset($ROOM_HELD[$lock['key']]);
    @sem_release($lock['sem']);
}
/* The room in a locked segment, or null when nothing readable is there. */
function room_seg_read($shm): ?array
{
    $h = room_seg_head($shm);
    if ($h === null || $h['len'] === 0 || $h['len'] > ROOM_SEG_BYTES - ROOM_SEG_HEAD) {
        return null;
    }
    $raw = @shmop_read($shm, ROOM_SEG_HEAD, $h['len']);
    $v = is_string($raw) ? @unserialize($raw, ['allowed_classes' => false]) : false;
    return is_array($v) ? $v : null;
}
function room_seg_head($shm): ?array
{
    $raw = @shmop_read($shm, 0, ROOM_SEG_HEAD);
    if (!is_string($raw) || strlen($raw) !== ROOM_SEG_HEAD) {
        return null;
    }
    $h = unpack('Nlen/Ntouched/Ncreated', $raw);
    return $h === false ? null : $h;
}
/* Header and room in one write, so a reader sees either the old room or the
// new one. False when the room has outgrown its segment. */
function room_seg_write($shm, array $room): bool
{
    $raw = serialize($room);
    if (strlen($raw) > ROOM_SEG_BYTES - ROOM_SEG_HEAD) {
        return false;
    }
    $t = (int) ($room['touched'] ?? 0);
    $c = (int) ($room['created'] ?? $t);
    return @shmop_write($shm, pack('NNN', strlen($raw), $t, $c) . $raw, 0) > 0;
}
/* A room's header with no lock, or null when it does not exist (yet). For
// displays and the idle test only. */
function room_peek(string $code): ?array
{
    $shm = @shmop_open(room_key($code), 'a', 0, 0);
    if ($shm === false) {
        return null;
    }
    $h = room_seg_head($shm);
    return $h === null || $h['len'] === 0 ? null : $h;
}
/* The idle rules: nobody has touched it inside the live window, or it is
// older than the day limit. Takes a room or a header. */
function room_idle(array $r, ?int $now = null): bool
{
    $now = $now ?? time();
    $t = $r['touched'] ?? $r['created'] ?? 0;
    return $now - $t > room_live_secs() || $now - ($r['created'] ?? $t) > room_max_age();
}
/* Creates a room's segment and locks it, nothing written yet. Mode 'n' makes
// the kernel create it only if no segment has the key, atomically, so a
// collision or a race with another create just draws another code. */
function room_alloc(?callable $nextCode = null): ?array
{
    $nextCode = $nextCode ?? fn() => room_new_code(fn($c) => false);
    for ($try = 0; $try < 50; $try++) {
        $code = $nextCode();
        $key = room_key($code);
        if ($key === room_registry_key()) {
            continue;
        }
        $shm = @shmop_open($key, 'n', 0600, ROOM_SEG_BYTES);
        if ($shm === false) {
            continue;
        }
        $sem = @sem_get($key, 1);
        if ($sem === false || !room_sem_take($sem)) {
            @shmop_delete($shm);
            room_json_out(500, ['error' => 'room memory is unavailable on this server']);
        }
        return room_hold(['sem' => $sem, 'shm' => $shm, 'key' => $key, 'code' => $code, 'open' => true]);
    }
    room_json_out(500, ['error' => 'room memory is unavailable on this server']);
}
/* Registers a freshly written room, unless that would pass the cap: the
// check and the add happen under the registry lock, so the cap is exact.
// Entries whose segment is gone are dropped on the way. */
/* True when registered, false when the cap is reached, null when the registry
// stayed busy past the lock wait. */
function room_register(string $code, int $max): ?bool
{
    $cutoff = time() - room_live_secs();
    $ok = room_registry_update(function (array $reg) use ($code, $max, $cutoff): array {
        $live = 0;
        foreach (array_keys($reg) as $c) {
            $c = (string) $c;
            $head = room_peek($c);
            if ($head === null) {
                unset($reg[$c]);
            } elseif ($c !== $code && $head['touched'] >= $cutoff) {
                $live++;
            }
        }
        if ($live >= $max) {
            return [$reg, false];
        }
        $reg[$code] = ['created' => time()];
        return [$reg, true];
    });
    return $ok === ROOM_REGISTRY_BUSY ? null : $ok === true;
}
/* Closes a room the caller holds: mark it closed and save, drop it from the
// registry, then delete the segment and remove the semaphore. A request that
// got the room before this (still attached) reads "closed"; one that comes
// after finds no segment. Either way it is the 404. */
function room_close($lock): void
{
    if (!is_array($lock)) {
        return;
    }
    $raw = serialize(['code' => $lock['code'], 'closed' => true]);
    @shmop_write($lock['shm'], pack('NNN', strlen($raw), 0, 0) . $raw, 0);
    $code = $lock['code'];
    room_registry_update(function (array $reg) use ($code): array {
        unset($reg[$code]);
        return [$reg, null];
    });
    @shmop_delete($lock['shm']);
    room_unlock($lock);
    @sem_remove($lock['sem']);
}
/* Drops a room whose creation failed after allocation. */
function room_discard($lock): void
{
    if (!is_array($lock)) {
        return;
    }
    @shmop_delete($lock['shm']);
    room_unlock($lock);
    @sem_remove($lock['sem']);
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
/* ---------- persistence: one record per room, memory or files ---------- */
function room_load(string $code, bool $create = false): ?array
{
    if (!room_use_shm()) {
        return null;
    }
    $lock = room_lock($code, true);
    if ($lock === null) {
        return [null, null, $code];
    }
    $room = room_seg_read($lock['shm']);
    if ($room !== null && ($room['code'] ?? null) === $code && !($room['closed'] ?? false)) {
        // Whoever locks a room clears it out when it is idle.
        if (room_idle($room)) {
            room_close($lock);
            return [null, null, $code];
        }
        return [$room, $lock, $code];
    }
    // Closed (or never written): the closer is about to delete it. If the
    // segment is already gone this lock sat on a semaphore made after the
    // close, which nothing else will ever remove.
    $gone = @shmop_open($lock['key'], 'a', 0, 0) === false;
    room_unlock($lock);
    if ($gone) {
        @sem_remove($lock['sem']);
    }
    return [null, null, $code];
}
function room_save($lock, string $code, array $room): bool
{
    if (!room_use_shm() || !is_array($lock)) {
        return false;
    }
    $room['touched'] = time();
    return room_seg_write($lock['shm'], $room);
}
// The shelf never holds more rooms than matter: anything nobody has touched
// inside the live window is dropped, and day-old records go whatever happens.
// Anything with a browser still open heartbeats on every state poll, so only
// truly gone rooms vanish. The walk reads each room's header without a lock
// and only touches, without waiting, a room that looks idle; a busy room is
// skipped. Registry entries whose segment is gone are dropped.
function room_sweep(): void
{
    $now = time();
    $dead = [];
    foreach (array_keys(room_registry_read()) as $code) {
        $code = (string) $code;
        $shm = @shmop_open(room_key($code), 'a', 0, 0);
        if ($shm === false) {
            $dead[] = $code;
            continue;
        }
        $head = room_seg_head($shm);
        if ($head === null || $head['len'] === 0 || !room_idle($head, $now)) {
            continue;
        }
        $lock = room_lock($code, false);
        if ($lock === null) {
            continue;
        }
        $room = room_seg_read($lock['shm']);
        if ($room === null || ($room['closed'] ?? false) || room_idle($room, $now)) {
            room_close($lock);
        } else {
            room_unlock($lock);
        }
    }
    if ($dead) {
        room_registry_update(function (array $reg) use ($dead): array {
            foreach ($dead as $c) {
                if (room_peek($c) === null) {
                    unset($reg[$c]);
                }
            }
            return [$reg, null];
        });
    }
}
