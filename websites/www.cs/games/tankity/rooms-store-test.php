<?php
// Live test for the room slot table. Run: php rooms-store-test.php
// Needs SysV (run it in the docker PHP, like rooms-test.php). It uses a
// private shared-memory key, a free 127.0.0.1 port and a four-slot table,
// and removes every segment and semaphore it made. Skips where SysV is missing.
// Covers: code -> key mapping, exclusive create (and a forced collision),
// a missing code, the cap, a closed room freeing its segment and registry
// entry, the idle sweep, occupancy, and per-room locking (another room never
// waits, the same room does, crashes release, a join racing a close).
// Exit 0 when every check passes, 1 otherwise.
declare(strict_types=1);

$fail = 0;
$check = function (string $name, bool $cond, string $extra = '') use (&$fail): void {
    echo ($cond ? 'PASS' : 'FAIL') . ' ' . $name . ($extra !== '' ? ' :: ' . $extra : '') . "\n";
    if (!$cond) {
        $fail++;
    }
};
if (!function_exists('shm_attach') || !function_exists('sem_get') || !function_exists('proc_open')) {
    echo "SKIP no-sysv\n";
    exit(0);
}

const CAP = 4;
$tmp = sys_get_temp_dir() . '/tankity-store-test-' . getmypid();
@mkdir($tmp);
$shmKey = 300000 + (getmypid() % 50000);
file_put_contents($tmp . '/test.yaml', "max_rooms: " . CAP . "\nroom_max_age: 3600\nroom_live_secs: 60\n");
$env = array_merge(getenv(), [
    'CONFIG_FILE' => $tmp . '/test.yaml',
    'TANKITY_SHM_KEY' => (string) $shmKey,
    'PHP_CLI_SERVER_WORKERS' => '4',
]);
putenv('CONFIG_FILE=' . $tmp . '/test.yaml');
putenv('TANKITY_SHM_KEY=' . $shmKey);
define('TANKITY_ROOMS_LIB', true);
require __DIR__ . '/rooms.php';

$cleanup = function () use ($shmKey, $tmp): void {
    $id = @shm_attach(room_registry_key($shmKey), ROOM_REGISTRY_BYTES);
    $reg = $id === false ? [] : @shm_get_var($id, ROOM_REGISTRY_VAR);
    foreach (array_keys(is_array($reg) ? $reg : []) as $c) {
        $k = room_key((string) $c, $shmKey);
        $seg = @shmop_open($k, 'w', 0, 0);
        if ($seg !== false) {
            @shmop_delete($seg);
        }
        $sem = @sem_get($k, 1);
        if ($sem !== false) {
            @sem_remove($sem);
        }
    }
    if ($id !== false) {
        @shm_remove($id);
    }
    $sem = @sem_get(room_registry_key($shmKey), 1);
    if ($sem !== false) {
        @sem_remove($sem);
    }
    @unlink($tmp . '/test.yaml');
    @unlink($tmp . '/holder.php');
    @rmdir($tmp);
};
$segExists = fn(string $c) => @shmop_open(room_key($c), 'a', 0, 0) !== false;

/* ---- code -> key ---- */
$keys = [];
$stable = true;
$inRange = true;
for ($i = 0; $i < 2000; $i++) {
    $c = room_new_code(fn($x) => false);
    $k = room_key($c);
    $keys[$k] = true;
    $stable = $stable && $k === room_key($c) && $k === (($shmKey ^ crc32('room:' . $c)) & 0x7fffffff);
    $inRange = $inRange && $k > 0 && $k <= 0x7fffffff && $k !== room_registry_key();
}
$check('key-from-code', $stable && $inRange);
$check('keys-spread', count($keys) > 1900, count($keys) . ' distinct of 2000 draws');
$check('key-base-matters', room_key('ABCD', 1) !== room_key('ABCD', 2));

/* ---- the server ---- */
$probe = stream_socket_server('tcp://127.0.0.1:0');
$port = (int) substr(strrchr(stream_socket_get_name($probe, false), ':'), 1);
fclose($probe);
$base = 'http://127.0.0.1:' . $port;
$proc = proc_open(
    [PHP_BINARY, '-S', '127.0.0.1:' . $port, '-t', __DIR__],
    [0 => ['file', '/dev/null', 'r'], 1 => ['file', '/dev/null', 'w'], 2 => ['file', '/dev/null', 'w']],
    $pipes,
    null,
    $env
);
if (!is_resource($proc)) {
    echo "FAIL server-spawn\n";
    $cleanup();
    exit(1);
}
register_shutdown_function(function () use (&$proc, $cleanup): void {
    if (is_resource($proc)) {
        proc_terminate($proc);
    }
    $cleanup();
});
$get = function (string $url, int $timeout = 10) {
    $ctx = stream_context_create(['http' => ['timeout' => $timeout, 'ignore_errors' => true]]);
    $raw = @file_get_contents($url, false, $ctx);
    return $raw === false ? null : json_decode($raw, true);
};
$post = function (string $action, array $body) use ($base) {
    $ctx = stream_context_create(['http' => [
        'method' => 'POST', 'timeout' => 10, 'ignore_errors' => true,
        'header' => "Content-Type: application/json\r\n",
        'content' => json_encode($body),
    ]]);
    $raw = @file_get_contents($base . '/rooms.php?action=' . $action, false, $ctx);
    return $raw === false ? null : json_decode($raw, true);
};
$ping = null;
for ($i = 0; $i < 50 && $ping === null; $i++) {
    usleep(100000);
    $ping = $get($base . '/rooms.php?action=ping');
}
$check('server-up', $ping !== null);
$check('empty-table', ($ping['rooms']['used'] ?? -1) === 0 && ($ping['rooms']['max'] ?? 0) === CAP);
$stateOf = fn(array $r) => $get($base . '/rooms.php?action=state&code=' . $r['code'] . '&token=' . $r['token'] . '&since=0');
// True when no semaphore is left over for the code (a fresh one is free).
$freeSem = function (string $c): bool {
    $sem = sem_get(room_key($c), 1);
    $ok = @sem_acquire($sem, true);
    if ($ok) {
        @sem_release($sem);
    }
    @sem_remove($sem);
    return $ok;
};
$ageRoom = function (string $c): void {
    [$room, $lock] = room_load($c);
    if (is_array($room)) {
        $room['touched'] = time() - 3600;
        room_seg_write($lock['shm'], $room);
    }
    room_unlock($lock);
};

/* ---- create allocates one segment per room; the cap; a closed room frees its segment ---- */
$rooms = [];
$names = ['aaa', 'bbb', 'ccc', 'ddd'];
for ($i = 0; $i < CAP; $i++) {
    $r = $post('create', ['initials' => $names[$i]]);
    if (($r['ok'] ?? false) === true) {
        $rooms[] = $r;
    }
}
$check('create-makes-distinct-segments', count($rooms) === CAP
    && count(array_unique(array_map(fn($r) => room_key($r['code']), $rooms))) === CAP
    && array_reduce($rooms, fn($ok, $r) => $ok && $segExists($r['code']), true));
$check('code-format', count($rooms) === CAP
    && array_reduce($rooms, fn($ok, $r) => $ok && preg_match('/^[' . ROOM_CODE_ALPHABET . ']{' . ROOM_CODE_LEN . '}$/', $r['code']) === 1, true));
$reg = room_registry_read();
$check('registry-lists-live-codes', count($reg) === CAP && isset($reg[$rooms[0]['code']]['created']), json_encode(array_keys($reg)));
$ping = $get($base . '/rooms.php?action=ping');
$check('occupancy-counts', ($ping['rooms']['used'] ?? -1) === CAP, 'used=' . ($ping['rooms']['used'] ?? '?'));
$head = room_peek($rooms[0]['code']);
$check('header-reads-without-lock', is_array($head) && $head['touched'] >= time() - 5 && $head['created'] > 0);
$full = $post('create', ['initials' => 'eee']);
$check('full-at-the-cap', !isset($full['ok'])
    && ($full['error'] ?? '') === 'every room is taken (4 / 4). Try again later.', $full['error'] ?? '?');
$check('full-leaves-no-segment', count(room_registry_read()) === CAP);

$gone = $rooms[1];
$left = $post('leave', ['code' => $gone['code'], 'token' => $gone['token'], 'csrf' => $gone['csrf']]);
$check('leave-closes', ($left['ok'] ?? false) === true);
$ping = $get($base . '/rooms.php?action=ping');
$check('closed-room-frees-count', ($ping['rooms']['used'] ?? -1) === CAP - 1, 'used=' . ($ping['rooms']['used'] ?? '?'));
$check('closed-room-gone', ($stateOf($gone)['error'] ?? '') === 'no such room');
$check('closed-segment-removed', !$segExists($gone['code']));
$check('closed-registry-entry-removed', !isset(room_registry_read()[$gone['code']]));
$check('closed-semaphore-removed', $freeSem($gone['code']));
$again = $post('create', ['initials' => 'fff']);
$check('closed-room-place-reusable', ($again['ok'] ?? false) === true && $segExists($again['code']));
$rooms[1] = $again;

// A code nobody made is the existing 404, for join and state alike.
$ghost = room_new_code(fn($c) => $segExists($c));
$jm = $post('join', ['code' => $ghost, 'initials' => 'zzz']);
$check('join-missing-code-404', ($jm['error'] ?? '') === 'no such room', $jm['error'] ?? '?');
$sm = $get($base . '/rooms.php?action=state&code=' . $ghost . '&token=x&since=0');
$check('state-missing-code-404', ($sm['error'] ?? '') === 'no such room');
$check('missing-code-makes-nothing', !$segExists($ghost));

// Exclusive create: a code whose key is taken is never overwritten; the next code is drawn.
$taken = $rooms[2]['code'];
$fresh = room_new_code(fn($c) => $segExists($c));
$feed = [$taken, $taken, $fresh];
$tries = 0;
$lockN = room_alloc(function () use (&$feed, &$tries) {
    $tries++;
    return array_shift($feed);
});
$check('collision-retries', is_array($lockN) && $lockN['code'] === $fresh && $tries === 3, 'tries=' . $tries);
room_discard($lockN);
$check('collision-leaves-owner-intact', ($stateOf($rooms[2])['ok'] ?? false) === true);

// The cap is exact under the registry lock even for a create that already holds a segment.
$over = room_alloc();
$overRoom = room_new($over['code'], 'ovr');
room_save($over, $over['code'], $overRoom);
$overOk = room_register($over['code'], CAP);
$check('register-refuses-over-cap', $overOk === false);
room_discard($over);
$check('refused-segment-freed', !$segExists($over['code']));

/* ---- idle rooms: not counted, and swept ---- */
$stale = $rooms[2];
$ageRoom($stale['code']);
$check('idle-not-counted-before-sweep', room_count() === CAP - 1, 'count=' . room_count());
$new = $post('create', ['initials' => 'ggg']);
$check('idle-swept-by-create', ($new['ok'] ?? false) === true && !$segExists($stale['code'])
    && !isset(room_registry_read()[$stale['code']]), $new['error'] ?? '');
$check('idle-old-code-gone', ($stateOf($stale)['error'] ?? '') === 'no such room');
$rooms[2] = $new;

$ageRoom($rooms[3]['code']);
$check('idle-gone-on-lock', ($stateOf($rooms[3])['error'] ?? '') === 'no such room');
$check('idle-segment-removed', !$segExists($rooms[3]['code']) && !isset(room_registry_read()[$rooms[3]['code']]));
$ageRoom($rooms[0]['code']);
$get($base . '/rooms.php?action=ping');
$check('ping-sweeps-idle', !$segExists($rooms[0]['code']) && room_count() === 2, 'count=' . room_count());
$hhh = $post('create', ['initials' => 'hhh']);
$post('create', ['initials' => 'iii']);
$check('table-refills', room_count() === CAP);
// A registry entry whose segment vanished (a crash mid-close) is dropped by the sweep.
$ghostReg = room_new_code(fn($c) => $segExists($c));
room_registry_update(function (array $r) use ($ghostReg): array {
    $r[$ghostReg] = ['created' => time()];
    return [$r, null];
});
$get($base . '/rooms.php?action=ping');
$check('sweep-drops-dead-entries', !isset(room_registry_read()[$ghostReg]));

/* ---- per-room locking ---- */
$A = $rooms[1];
$B = $rooms[2];
$check('locks-two-keys', room_key($A['code']) !== room_key($B['code']));
file_put_contents($tmp . '/holder.php', <<<'PHP'
<?php
// argv: code seconds mode. Locks the room, says so, then holds it.
define('TANKITY_ROOMS_LIB', true);
require $argv[4] . '/rooms.php';
[$room, $lock] = room_load($argv[1]);
echo "LOCKED\n";
fflush(STDOUT);
if ($argv[3] === 'fatal') {
    undefined_function_that_dies();
}
sleep((int) $argv[2] > 0 ? (int) $argv[2] : 0);
usleep((int) round(($argv[2] - (int) $argv[2]) * 1e6));
if ($argv[3] === 'close') {
    room_close($lock);
    exit(0);
}
if ($argv[3] === 'mark') {
    $room['marker'] = 'holder-was-here';
    room_save($lock, $argv[1], $room);
}
room_unlock($lock);
PHP);
$hold = function (string $code, string $secs, string $mode) use ($env, $tmp) {
    $p = proc_open(
        [PHP_BINARY, $tmp . '/holder.php', $code, $secs, $mode, __DIR__],
        [0 => ['file', '/dev/null', 'r'], 1 => ['pipe', 'w'], 2 => ['file', '/dev/null', 'w']],
        $pipes,
        null,
        $env
    );
    $line = is_resource($p) ? fgets($pipes[1]) : false;
    return [$p, $pipes, $line !== false && trim($line) === 'LOCKED'];
};
$reap = function ($p, $pipes): void {
    @fclose($pipes[1]);
    proc_close($p);
};

// Round 1, in process: the holder has A; B answers at once, A waits for it
// and then sees what the holder wrote (it neither failed nor raced).
[$p, $pipes, $ok] = $hold($A['code'], '1.5', 'mark');
$check('holder-locked-A', $ok);
$t = microtime(true);
[$roomB, $lockB] = room_load($B['code']);
$dtB = microtime(true) - $t;
room_unlock($lockB);
$check('other-room-immediate', is_array($roomB) && $dtB < 0.25, sprintf('%.3fs', $dtB));
$t = microtime(true);
$pingHeld = $get($base . '/rooms.php?action=ping', 5);
$dtPing = microtime(true) - $t;
$check('ping-immediate', ($pingHeld['ok'] ?? false) === true && $dtPing < 0.5, sprintf('%.3fs', $dtPing));
$t = microtime(true);
$stateB = $stateOf($B);
$dtState = microtime(true) - $t;
$check('http-other-room-immediate', ($stateB['ok'] ?? false) === true && $dtState < 0.5, sprintf('%.3fs', $dtState));
$t = microtime(true);
[$roomA, $lockA] = room_load($A['code']);
$dtA = microtime(true) - $t;
room_unlock($lockA);
$check('same-room-waits', $dtA > 0.5 && $dtA < 5.0, sprintf('%.3fs', $dtA));
$check('same-room-sees-holders-write', is_array($roomA) && ($roomA['marker'] ?? '') === 'holder-was-here');
$reap($p, $pipes);

// Round 2, over HTTP: a state request for the held room waits, then succeeds.
[$p, $pipes, $ok] = $hold($A['code'], '1.5', 'plain');
$check('holder-locked-A-again', $ok);
$t = microtime(true);
$stateA = $stateOf($A);
$dtHttpA = microtime(true) - $t;
$check('http-same-room-waits', ($stateA['ok'] ?? false) === true && $dtHttpA > 0.5, sprintf('%.3fs', $dtHttpA));
$reap($p, $pipes);

// Crashes: a holder that dies hard, or hits a PHP fatal, must not leave the
// room locked. Poll without blocking so a stuck lock fails instead of hanging.
$lockable = function (string $code): bool {
    $sem = sem_get(room_key($code), 1);
    for ($i = 0; $i < 30; $i++) {
        if (@sem_acquire($sem, true)) {
            @sem_release($sem);
            return true;
        }
        usleep(100000);
    }
    return false;
};
[$p, $pipes, $ok] = $hold($A['code'], '30', 'plain');
$check('holder-locked-for-kill', $ok);
$check('held-lock-blocks', !(function () use ($A) {
    $sem = sem_get(room_key($A['code']), 1);
    $got = @sem_acquire($sem, true);
    if ($got) {
        @sem_release($sem);
    }
    return $got;
})());
proc_terminate($p, 9);
$reap($p, $pipes);
$check('killed-holder-releases', $lockable($A['code']));
[$p, $pipes, $ok] = $hold($A['code'], '0', 'fatal');
$reap($p, $pipes);
$check('fatal-holder-releases', $lockable($A['code']));
$afterCrash = $stateOf($A);
$check('room-intact-after-crashes', ($afterCrash['ok'] ?? false) === true);

// A join racing a close: the holder has the room and closes it while joins
// pile up behind its lock. Every reply must be a whole answer (never a
// corrupt read or an error page), and once the room is closed it is the 404.
$post('leave', ['code' => $hhh['code'], 'token' => $hhh['token'], 'csrf' => $hhh['csrf']]);
$R = $post('create', ['initials' => 'rrr']);
$check('race-room-created', ($R['ok'] ?? false) === true);
[$p, $pipes, $ok] = $hold($R['code'], '0.6', 'close');
$check('holder-locked-R', $ok);
$allowed = [null, 'no such room', 'room is full', 'those initials are taken here'];
$replies = [];
$bad = [];
$letters = ['aab', 'aac', 'aad', 'aae', 'aaf', 'aag', 'aah', 'aai'];
$end = microtime(true) + 6;
$i = 0;
$last = null;
while (microtime(true) < $end) {
    $last = $post('join', ['code' => $R['code'], 'initials' => $letters[$i++ % count($letters)]]);
    $e = is_array($last) ? ($last['error'] ?? null) : '(no reply)';
    $replies[$e ?? 'ok'] = ($replies[$e ?? 'ok'] ?? 0) + 1;
    if (!in_array($e, $allowed, true)) {
        $bad[] = $e;
    }
    if ($e === 'no such room') {
        break;
    }
}
$reap($p, $pipes);
$check('race-replies-whole', !$bad, json_encode($replies));
$check('race-ends-in-404', ($last['error'] ?? '') === 'no such room' && !$segExists($R['code']));
$check('race-leaves-no-stray-semaphore', $freeSem($R['code']));

echo $fail ? "STORE-FAILED\n" : "STORE-OK\n";
exit($fail ? 1 : 0);
