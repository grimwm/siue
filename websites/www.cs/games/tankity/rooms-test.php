<?php
// Live test for the shared-memory room shelf. Run: php rooms-test.php
// Spins its own php -S on a free 127.0.0.1 port with a private shared-memory
// key, so it never touches real rooms or a port in use, and removes that
// memory when done. Skips honestly where SysV is missing.
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
// Ask the kernel for a free port, then hand it to php -S.
$probe = stream_socket_server('tcp://127.0.0.1:0');
$port = (int) substr(strrchr(stream_socket_get_name($probe, false), ':'), 1);
fclose($probe);
$base = 'http://127.0.0.1:' . $port;
$spawn = function () use ($env, $port) {
    return proc_open(
        [PHP_BINARY, '-S', '127.0.0.1:' . $port, '-t', __DIR__],
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

$get = function (string $url, int $timeout = 5) {
    $ctx = stream_context_create(['http' => ['timeout' => $timeout, 'ignore_errors' => true]]);
    $raw = @file_get_contents($url, false, $ctx);
    return $raw === false ? null : json_decode($raw, true);
};
$post = function (string $action, array $body) use (&$base) {
    $ctx = stream_context_create(['http' => [
        'method' => 'POST', 'timeout' => 5, 'ignore_errors' => true,
        'header' => "Content-Type: application/json\r\n",
        'content' => json_encode($body),
    ]]);
    $raw = @file_get_contents($base . '/rooms.php?action=' . $action, false, $ctx);
    return $raw === false ? null : json_decode($raw, true);
};
$waitUp = function () use ($get, &$base) {
    $ping = null;
    for ($i = 0; $i < 50 && $ping === null; $i++) {
        usleep(100000);
        $ping = $get($base . '/rooms.php?action=ping');
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
$ping = $get($base . '/rooms.php?action=ping');
$check('counts-live', ($ping['rooms']['used'] ?? -1) === 1);

// Age a record the way an abandoned room ages.
$id = shm_attach($shmKey, 2097152);
$reg = shm_get_var($id, 1);
$reg[$code]['touched'] = time() - 3600;
shm_put_var($id, 1, $reg);
shm_detach($id);
// An untouched record is truly gone: the sweep drops it, freeing the slot.
$ping = $get($base . '/rooms.php?action=ping');
$check('stale-not-counted', ($ping['rooms']['used'] ?? -1) === 0);
$gone = $get($base . '/rooms.php?action=state&code=' . $code . '&token=' . $token . '&since=0');
$check('stale-unreachable', ($gone['error'] ?? '') === 'no such room', $gone['error'] ?? '');

// A seated state poll is a heartbeat: a fresh waiting lobby stays counted.
$room = $post('create', ['initials' => 'qrs']);
$code = (string) ($room['code'] ?? '');
$token = (string) ($room['token'] ?? '');
$state = $get($base . '/rooms.php?action=state&code=' . $code . '&token=' . $token . '&since=0');
$check('heartbeat-ok', ($state['ok'] ?? false) === true);
$ping = $get($base . '/rooms.php?action=ping');
$check('heartbeat-counts', ($ping['rooms']['used'] ?? -1) === 1);

// A holder that died hard must not brick the shelf: hold the semaphore in
// this process and prove a ping still gets through after the bounded wait.
$held = sem_get($shmKey, 1);
$check('lock-held', $held !== false && @sem_acquire($held));
$lockT = microtime(true);
$pingHeld = $get($base . '/rooms.php?action=ping', 20); // the server waits out the ~5s lock
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

// Rooms live in SysV memory, which outlives a web-server restart (only a host
// restart wipes it): a restarted server still sees the same shelf. Then age
// every room out so the sweep frees the cap for the match below.
proc_terminate($proc);
proc_close($proc);
$proc = $spawn();
$ping = $waitUp();
$check('restart-keeps-shelf', ($ping['rooms']['used'] ?? -1) === 2, 'used=' . ($ping['rooms']['used'] ?? '?'));
$id = shm_attach($shmKey, 2097152);
$reg = shm_get_var($id, 1);
foreach (array_keys($reg) as $c) {
    $reg[$c]['touched'] = time() - 3600;
}
shm_put_var($id, 1, $reg);
shm_detach($id);
$ping = $get($base . '/rooms.php?action=ping');
$check('sweep-frees-cap', ($ping['rooms']['used'] ?? -1) === 0, 'used=' . ($ping['rooms']['used'] ?? '?'));
$gone = $get($base . '/rooms.php?action=state&code=' . $code . '&token=' . $token . '&since=0');
$check('swept-unreachable', ($gone['error'] ?? '') === 'no such room', $gone['error'] ?? '');

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
$calm = $get($base . '/rooms.php?action=state&code=' . $mcode . '&token=' . $mtoken . '&since=0');
$aiC = 0;
foreach (($calm['room']['events'] ?? []) as $e) {
    if (($e['t'] ?? '') === 'aifire') $aiC++;
}
$check('polls-hold-turn', ($calm['ok'] ?? false) === true && ($calm['room']['turn'] ?? -1) === 0 && $aiC === $aiG,
    'turn=' . ($calm['room']['turn'] ?? '?') . ' ai=' . $aiC);
// Ready outside the shop changes nothing and answers quietly with the room
// as it is; a ready that does not say true or false is refused.
usleep(300000);
$idle = $post('ready', ['code' => $mcode, 'token' => $mtoken, 'csrf' => $mcsrf, 'ready' => false]);
$check('ready-outside-shop-ignored', ($idle['ok'] ?? false) === true && ($idle['room']['phase'] ?? '') === 'play'
    && array_key_exists('shopLeft', $idle['room']) && $idle['room']['shopLeft'] === null, json_encode($idle['room']['phase'] ?? $idle));
$vague = $post('ready', ['code' => $mcode, 'token' => $mtoken, 'csrf' => $mcsrf]);
$check('ready-needs-a-state', !isset($vague['ok']) && isset($vague['error']), json_encode($vague));
// Leaving: a guest's seat goes to the battery and the room stays; the last
// human out closes the room at once, freeing its slot.
usleep(300000);
$gLeft = $post('leave', ['code' => $mcode, 'token' => $gtoken, 'csrf' => $gcsrf]);
$after = $get($base . '/rooms.php?action=state&code=' . $mcode . '&token=' . $mtoken . '&since=0');
$gSeat = $after['room']['seats'][1] ?? [];
$check('leave-guest-to-battery', ($gLeft['ok'] ?? false) === true && ($gSeat['human'] ?? true) === false,
    json_encode($gSeat));
usleep(300000);
$usedBefore = ($get($base . '/rooms.php?action=ping')['rooms']['used'] ?? -1);
$hLeft = $post('leave', ['code' => $mcode, 'token' => $mtoken, 'csrf' => $mcsrf]);
$usedAfter = ($get($base . '/rooms.php?action=ping')['rooms']['used'] ?? -1);
$check('leave-last-closes-room', ($hLeft['ok'] ?? false) === true && $usedAfter === $usedBefore - 1,
    "used $usedBefore -> $usedAfter");
$gone = $get($base . '/rooms.php?action=state&code=' . $mcode . '&token=' . $mtoken . '&since=0');
$check('leave-room-gone', ($gone['error'] ?? '') === 'no such room', $gone['error'] ?? '');

// Seat modes. The host flips seats nobody holds between AI and Open; nobody
// else may; open seats field no tank; a guest takes the first free chair.
$seatsOf = fn($r) => $r['room']['seats'] ?? [];
$modeOf = fn($r, int $i) => $seatsOf($r)[$i]['mode'] ?? '?';
$m2 = $post('create', ['initials' => 'sma']);
$c2 = (string) ($m2['code'] ?? '');
$h2 = ['code' => $c2, 'token' => (string) ($m2['token'] ?? ''), 'csrf' => (string) ($m2['csrf'] ?? '')];
$snap = $get($base . '/rooms.php?action=state&code=' . $c2 . '&token=' . $h2['token'] . '&since=0');
$check('lobby-four-seats', count($seatsOf($snap)) === 4 && $modeOf($snap, 0) === 'human' && $modeOf($snap, 1) === 'ai'
    && $modeOf($snap, 3) === 'ai', json_encode($seatsOf($snap)));
$g2 = $post('join', ['code' => $c2, 'initials' => 'smb']);
$g2a = ['code' => $c2, 'token' => (string) ($g2['token'] ?? ''), 'csrf' => (string) ($g2['csrf'] ?? '')];
$check('join-takes-first-free-seat', ($g2['seat'] ?? -1) === 1);
usleep(300000);
$denied = $post('seatmode', $g2a + ['seat' => 2, 'mode' => 'open']);
$check('seatmode-host-only', isset($denied['error']) && strpos($denied['error'] ?? '', 'host') !== false, $denied['error'] ?? '');
$noCsrf = $post('seatmode', ['code' => $c2, 'token' => $h2['token'], 'seat' => 2, 'mode' => 'open']);
$check('seatmode-needs-csrf', isset($noCsrf['error']), $noCsrf['error'] ?? '');
usleep(300000);
$fast1 = $post('seatmode', $h2 + ['seat' => 2, 'mode' => 'open']);
$fast2 = $post('seatmode', $h2 + ['seat' => 3, 'mode' => 'open']);
$check('seatmode-throttled', ($fast1['ok'] ?? false) === true && isset($fast2['error']) && strpos($fast2['error'] ?? '', 'fast') !== false,
    $fast2['error'] ?? '');
usleep(300000);
$fast2 = $post('seatmode', $h2 + ['seat' => 3, 'mode' => 'open']);
$check('seatmode-host-opens', ($fast2['ok'] ?? false) === true && $modeOf($fast2, 2) === 'open' && $modeOf($fast2, 3) === 'open',
    json_encode($seatsOf($fast2)));
usleep(300000);
$onHuman = $post('seatmode', $h2 + ['seat' => 1, 'mode' => 'open']);
$check('seatmode-not-on-humans', isset($onHuman['error']), $onHuman['error'] ?? '');
usleep(300000);
$badMode = $post('seatmode', $h2 + ['seat' => 2, 'mode' => 'banana']);
$check('seatmode-validates', isset($badMode['error']), $badMode['error'] ?? '');
$seen = $get($base . '/rooms.php?action=state&code=' . $c2 . '&token=' . $g2a['token'] . '&since=0');
$check('guest-sees-open', $modeOf($seen, 2) === 'open' && $modeOf($seen, 1) === 'human');
// The guest steps out of the lobby: the chair goes back to a drone seat.
usleep(300000);
$post('leave', $g2a);
$seen = $get($base . '/rooms.php?action=state&code=' . $c2 . '&token=' . $h2['token'] . '&since=0');
$check('lobby-leave-chair-resets', $modeOf($seen, 1) === 'ai' && ($seatsOf($seen)[1]['name'] ?? '') !== 'SMB', json_encode($seatsOf($seen)[1] ?? null));
// All three other seats open: one tank is no match.
usleep(300000);
$post('seatmode', $h2 + ['seat' => 1, 'mode' => 'open']);
usleep(300000);
$lone = $post('start', $h2);
$check('start-refuses-lone-tank', isset($lone['error']) && strpos($lone['error'] ?? '', 'AI') !== false, $lone['error'] ?? '');
$still = $get($base . '/rooms.php?action=state&code=' . $c2 . '&token=' . $h2['token'] . '&since=0');
$check('refused-start-stays-lobby', ($still['room']['phase'] ?? '') === 'lobby');
// A guest joins the open chair; humans alone have nobody to fight.
usleep(300000);
$g3 = $post('join', ['code' => $c2, 'initials' => 'smc']);
$g3a = ['code' => $c2, 'token' => (string) ($g3['token'] ?? ''), 'csrf' => (string) ($g3['csrf'] ?? '')];
$check('join-into-open-seat', ($g3['seat'] ?? -1) === 1);
usleep(300000);
$noFoe = $post('start', $h2);
$check('start-refuses-no-drone', isset($noFoe['error']) && strpos($noFoe['error'] ?? '', 'AI') !== false, $noFoe['error'] ?? '');
// One drone seat back on: host + guest + drone, the fourth seat stays open.
usleep(300000);
$post('seatmode', $h2 + ['seat' => 3, 'mode' => 'ai']);
usleep(300000);
$go = $post('start', $h2);
$seatsFielded = array_map(fn($t) => $t['seat'], $go['room']['tanks'] ?? []);
sort($seatsFielded);
$check('start-skips-open-seat', ($go['ok'] ?? false) === true && $seatsFielded === [0, 1, 3], json_encode($seatsFielded));
usleep(300000);
$late = $post('join', ['code' => $c2, 'initials' => 'smd']);
$check('no-join-after-start', isset($late['error']));
usleep(300000);
$late = $post('seatmode', $h2 + ['seat' => 2, 'mode' => 'ai']);
$check('no-seatmode-after-start', isset($late['error']));

// The host walks out mid-match: the match goes on for the guest (the host's
// tank turns drone), the room stays on the shelf, and only the last human
// out takes it down.
usleep(300000);
$used0 = ($get($base . '/rooms.php?action=ping')['rooms']['used'] ?? -1);
$hostGone = $post('leave', $h2);
$used1 = ($get($base . '/rooms.php?action=ping')['rooms']['used'] ?? -1);
$check('host-leave-keeps-room', ($hostGone['ok'] ?? false) === true && $used1 === $used0, "used $used0 -> $used1");
$after = $get($base . '/rooms.php?action=state&code=' . $c2 . '&token=' . $g3a['token'] . '&since=0');
$hostTank = null;
foreach (($after['room']['tanks'] ?? []) as $t) {
    if (($t['seat'] ?? -1) === 0) $hostTank = $t;
}
$check('host-seat-now-drone', ($after['ok'] ?? false) === true && ($after['room']['phase'] ?? '') === 'play'
    && $modeOf($after, 0) === 'ai' && $hostTank !== null && $hostTank['kind'] === 'ai', json_encode($hostTank));
$check('guest-turn-after-host-left', ($after['room']['turn'] ?? -1) === 1, 'turn=' . ($after['room']['turn'] ?? '?'));
$ghost = $post('act', $h2 + ['kind' => 'fire']);
$check('left-host-token-dead', isset($ghost['error']));
usleep(300000);
$play = $post('act', $g3a + ['kind' => 'fire']);
$check('guest-keeps-playing', ($play['ok'] ?? false) === true && ($play['room']['turn'] ?? -1) === 1,
    'turn=' . ($play['room']['turn'] ?? '?'));
usleep(300000);
// A leave straight behind an aim tap is never throttled away.
$aimed = $post('act', $g3a + ['kind' => 'aim', 'angle' => 70, 'power' => 50]);
$last = $post('leave', $g3a);
$check('leave-not-throttled', (($aimed['ok'] ?? false) === true) && (($last['ok'] ?? false) === true), json_encode([$aimed['error'] ?? 'ok', $last['error'] ?? 'ok']));
$used2 = ($get($base . '/rooms.php?action=ping')['rooms']['used'] ?? -1);
$check('last-human-closes-room', ($last['ok'] ?? false) === true && $used2 === $used0 - 1, "used $used0 -> $used2");

// Leave the shelf as found.
$id = shm_attach($shmKey, 2097152);
$reg = shm_get_var($id, 1);
$reg[$mcode]['touched'] = time() - 3600;
shm_put_var($id, 1, $reg);
shm_detach($id);
$ping = $get($base . '/rooms.php?action=ping');
$check('match-cleaned', ($ping['rooms']['used'] ?? -1) === 0);

proc_terminate($proc);
proc_close($proc);
// Remove the private shelf so test runs never pile up segments.
$id = @shm_attach($shmKey, 2097152);
if ($id !== false) {
    @shm_remove($id);
}
$sem = @sem_get($shmKey, 1);
if ($sem !== false) {
    @sem_remove($sem);
}
@unlink($tmp . '/test.yaml');
@rmdir($tmp);
exit($fail ? 1 : 0);
