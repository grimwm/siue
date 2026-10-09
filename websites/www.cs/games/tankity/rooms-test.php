<?php
// Live test for the shared-memory room shelf. Run: php rooms-test.php
// Spins its own php -S on 127.0.0.1:8472 with a private shared-memory key,
// so it never touches real rooms. Skips honestly where SysV is missing.
// Exit 0 when every check passes, 1 otherwise.
declare(strict_types=1);

$fail = 0;
$check = function (string $name, bool $cond, string $extra = '') use (&$fail): void {
    echo ($cond ? 'PASS' : 'FAIL') . ' ' . $name . ($extra !== '' ? ' :: ' . $extra : '') . "\n";
    if (!$cond) {
        $fail++;
    }
};

$tmp = sys_get_temp_dir() . '/tankity-rooms-test-' . getmypid();
@mkdir($tmp);
$shmKey = 100000 + (getmypid() % 50000);
file_put_contents($tmp . '/test.yaml', "max_rooms: 2\nroom_max_age: 3600\nroom_live_secs: 60\n");
$env = array_merge(getenv(), [
    'CONFIG_FILE' => $tmp . '/test.yaml',
    'TANKITY_SHM_KEY' => (string) $shmKey,
]);
if (!function_exists('shm_attach') || !function_exists('sem_get')) {
    echo "SKIP no-sysv\n";
    @unlink($tmp . '/test.yaml');
    @rmdir($tmp);
    exit(0);
}
$spawn = function () use ($env) {
    return proc_open(
        [PHP_BINARY, '-S', '127.0.0.1:8472', '-t', __DIR__],
        [0 => ['file', '/dev/null', 'r'], 1 => ['file', '/dev/null', 'w'], 2 => ['file', '/dev/null', 'w']],
        $pipes,
        null,
        $env
    );
};
$proc = $spawn();
if (!is_resource($proc)) {
    echo "FAIL server-spawn\n";
    exit(1);
}

$get = function (string $url) {
    $ctx = stream_context_create(['http' => ['timeout' => 5, 'ignore_errors' => true]]);
    $raw = @file_get_contents($url, false, $ctx);
    return $raw === false ? null : json_decode($raw, true);
};
$post = function (string $action, array $body) {
    $ctx = stream_context_create(['http' => [
        'method' => 'POST', 'timeout' => 5, 'ignore_errors' => true,
        'header' => "Content-Type: application/json\r\n",
        'content' => json_encode($body),
    ]]);
    $raw = @file_get_contents('http://127.0.0.1:8472/rooms.php?action=' . $action, false, $ctx);
    return $raw === false ? null : json_decode($raw, true);
};
$waitUp = function () use ($get) {
    $ping = null;
    for ($i = 0; $i < 50 && $ping === null; $i++) {
        usleep(100000);
        $ping = $get('http://127.0.0.1:8472/rooms.php?action=ping');
    }
    return $ping;
};

$ping = $waitUp();
$check('server-up', $ping !== null);
$store = (string) ($ping['rooms']['store'] ?? '?');
$check('store-known', $store === 'memory', 'store=' . $store);
$check('cap-from-file', ($ping['rooms']['max'] ?? 0) === 2, 'max=' . ($ping['rooms']['max'] ?? '?'));
$check('empty-shelf', ($ping['rooms']['used'] ?? -1) === 0);

$room = $post('create', ['initials' => 'tst']);
$check('create-ok', ($room['ok'] ?? false) === true, 'code=' . ($room['code'] ?? '?'));
$code = (string) ($room['code'] ?? '');
$token = (string) ($room['token'] ?? '');
$ping = $get('http://127.0.0.1:8472/rooms.php?action=ping');
$check('counts-live', ($ping['rooms']['used'] ?? -1) === 1);

// Age a record the way an abandoned room ages.
$id = shm_attach($shmKey, 2097152);
$reg = shm_get_var($id, 1);
$reg[$code]['touched'] = time() - 3600;
shm_put_var($id, 1, $reg);
shm_detach($id);
// An untouched record is truly gone: the sweep drops it, freeing the slot.
$ping = $get('http://127.0.0.1:8472/rooms.php?action=ping');
$check('stale-not-counted', ($ping['rooms']['used'] ?? -1) === 0);
$gone = $get('http://127.0.0.1:8472/rooms.php?action=state&code=' . $code . '&token=' . $token . '&since=0');
$check('stale-unreachable', ($gone['error'] ?? '') === 'no such room', $gone['error'] ?? '');

// A seated state poll is a heartbeat: a fresh waiting lobby stays counted.
$room = $post('create', ['initials' => 'qrs']);
$code = (string) ($room['code'] ?? '');
$token = (string) ($room['token'] ?? '');
$state = $get('http://127.0.0.1:8472/rooms.php?action=state&code=' . $code . '&token=' . $token . '&since=0');
$check('heartbeat-ok', ($state['ok'] ?? false) === true);
$ping = $get('http://127.0.0.1:8472/rooms.php?action=ping');
$check('heartbeat-counts', ($ping['rooms']['used'] ?? -1) === 1);

// A holder that died hard must not brick the shelf: hold the semaphore in
// this process and prove a ping still gets through after the bounded wait.
$held = sem_get($shmKey, 1);
$check('lock-held', $held !== false && @sem_acquire($held));
$lockT = microtime(true);
$pingHeld = $get('http://127.0.0.1:8472/rooms.php?action=ping');
$lockDt = microtime(true) - $lockT;
if (isset($held) && $held !== false) {
    @sem_release($held);
}
$check('lock-reset', $pingHeld !== null && ($pingHeld['rooms']['used'] ?? -1) >= 1
    && $lockDt >= 4.0 && $lockDt < 20.0, sprintf('wait=%.1fs', $lockDt));

// The ceiling uses the live count, and refusals stay human.
$second = $post('create', ['initials' => 'abc']);
usleep(1100000); // respect the creation throttle before the next attempt
$third = $post('create', ['initials' => 'def']);
$check('cap-live', ($second['ok'] ?? false) === true && ($third['ok'] ?? false) === false,
    'second=' . ($second['code'] ?? '?') . ' thirdErr=' . ($third['error'] ?? '?'));
$check('cap-human', isset($third['error']) && strpos($third['error'], 'taken') !== false, $third['error'] ?? '');

// A restart wipes memory rooms.
proc_terminate($proc);
proc_close($proc);
$proc = $spawn();
$ping = $waitUp();
$check('restart-wipes', ($ping['rooms']['used'] ?? -1) === 0);
$gone = $get('http://127.0.0.1:8472/rooms.php?action=state&code=' . $code . '&token=' . $token . '&since=0');
$check('restart-unreachable', ($gone['error'] ?? '') === 'no such room', $gone['error'] ?? '');

// Turns must cycle host -> guest -> battery. A guest who just sat down is
// present, not idle (no instant auto-fire), and one drone shot passes the
// turn on instead of machine-gunning the whole round from a frozen turn.
$match = $post('create', ['initials' => 'hos']);
$mcode = (string) ($match['code'] ?? '');
$mtoken = (string) ($match['token'] ?? '');
$mcsrf = (string) ($match['csrf'] ?? '');
$guest = $post('join', ['code' => $mcode, 'initials' => 'gst']);
$gseat = (int) ($guest['seat'] ?? -1);
$gtoken = (string) ($guest['token'] ?? '');
$gcsrf = (string) ($guest['csrf'] ?? '');
$check('match-seats', ($match['ok'] ?? false) === true && ($guest['ok'] ?? false) === true && $gseat === 1,
    'code=' . $mcode . ' gseat=' . $gseat);
usleep(300000); // seats clock in on create/join; starting is throttled like any other act
$started = $post('start', ['code' => $mcode, 'token' => $mtoken, 'csrf' => $mcsrf]);
$check('match-starts', ($started['ok'] ?? false) === true && ($started['room']['turn'] ?? -1) === 0,
    'turn=' . ($started['room']['turn'] ?? '?'));
usleep(300000);
$afterHost = $post('act', ['code' => $mcode, 'token' => $mtoken, 'csrf' => $mcsrf, 'kind' => 'fire']);
$turnH = $afterHost['room']['turn'] ?? -1;
$aiH = 0;
$guestHp = -1;
foreach (($afterHost['room']['events'] ?? []) as $e) {
    if (($e['t'] ?? '') === 'aifire') $aiH++;
}
foreach (($afterHost['room']['tanks'] ?? []) as $t) {
    if (($t['seat'] ?? -1) === 1) $guestHp = (int) $t['hp'];
}
$check('turn-reaches-guest', ($afterHost['ok'] ?? false) === true && $turnH === 1 && $aiH === 0 && $guestHp > 0,
    'turn=' . $turnH . ' ai=' . $aiH . ' guestHp=' . $guestHp);
usleep(300000);
$afterGuest = $post('act', ['code' => $mcode, 'token' => $gtoken, 'csrf' => $gcsrf, 'kind' => 'fire']);
$turnG = $afterGuest['room']['turn'] ?? -1;
$aiG = 0;
foreach (($afterGuest['room']['events'] ?? []) as $e) {
    if (($e['t'] ?? '') === 'aifire') $aiG++;
}
$check('turn-cycles-past-ai', ($afterGuest['ok'] ?? false) === true && $turnG === 0 && $aiG >= 1 && $aiG <= 2,
    'turn=' . $turnG . ' ai=' . $aiG);
usleep(300000);
$calm = $get('http://127.0.0.1:8472/rooms.php?action=state&code=' . $mcode . '&token=' . $mtoken . '&since=0');
$aiC = 0;
foreach (($calm['room']['events'] ?? []) as $e) {
    if (($e['t'] ?? '') === 'aifire') $aiC++;
}
$check('polls-hold-turn', ($calm['ok'] ?? false) === true && ($calm['room']['turn'] ?? -1) === 0 && $aiC === $aiG,
    'turn=' . ($calm['room']['turn'] ?? '?') . ' ai=' . $aiC);
// Leave the shelf as found.
$id = shm_attach($shmKey, 2097152);
$reg = shm_get_var($id, 1);
$reg[$mcode]['touched'] = time() - 3600;
shm_put_var($id, 1, $reg);
shm_detach($id);
$ping = $get('http://127.0.0.1:8472/rooms.php?action=ping');
$check('match-cleaned', ($ping['rooms']['used'] ?? -1) === 0);

proc_terminate($proc);
proc_close($proc);
@unlink($tmp . '/test.yaml');
@rmdir($tmp);
exit($fail ? 1 : 0);
