<?php
// The room shelf, live. Spins its own php -S on a free 127.0.0.1 port with a
// private data directory, so it never touches real rooms or a port in use,
// and removes that directory when done.
declare(strict_types=1);
if (!defined('TANKITY_GAME_DIR')) {
    define('TANKITY_GAME_DIR', dirname(__DIR__, 3));
}


$tmp = sys_get_temp_dir() . '/tankity-rooms-test-' . getmypid();
@mkdir($tmp, 0700);
file_put_contents($tmp . '/test.yaml', "max_rooms: 2\nroom_live_secs: 60\n");
$env = array_merge(getenv(), ['CONFIG_FILE' => $tmp . '/test.yaml', 'TANKITY_DATA_DIR' => $tmp . '/data']);
// The room functions, in this process, for aging records and holding the lock.
putenv('CONFIG_FILE=' . $tmp . '/test.yaml');
putenv('TANKITY_DATA_DIR=' . $tmp . '/data');
require_once dirname(__DIR__, 2) . '/php/rooms-lib.php';
tankity_config(true);
$storedInitials = function (string $c) {
    [$room, $lock] = room_load($c);
    room_unlock($lock);
    return is_array($room) ? ($room['seats'][0]['initials'] ?? '(missing)') : '(no room)';
};
$storedDifficulty = function (string $c) {
    [$room, $lock] = room_load($c);
    room_unlock($lock);
    return is_array($room) ? ($room['difficulty'] ?? '(missing)') : '(no room)';
};
$ageRoom = function (string $c): void { room_test_age($c, 3600); };
// Ask the kernel for a free port, then hand it to php -S.
$probe = stream_socket_server('tcp://127.0.0.1:0');
$port = (int) substr(strrchr(stream_socket_get_name($probe, false), ':'), 1);
fclose($probe);
$base = 'http://127.0.0.1:' . $port;
$spawn = function () use ($env, $port) {
    return proc_open(
        [PHP_BINARY, '-S', '127.0.0.1:' . $port, '-t', TANKITY_GAME_DIR],
        [0 => ['file', '/dev/null', 'r'], 1 => ['file', '/dev/null', 'w'], 2 => ['file', '/dev/null', 'w']],
        $pipes,
        null,
        $env
    );
};
$proc = $spawn();
if (!is_resource($proc)) {
    $check('server-spawn', false, '');
    return;
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
$check('cap-from-file', ($ping['rooms']['max'] ?? 0) === 2, 'max=' . ($ping['rooms']['max'] ?? '?'));
$check('empty-shelf', ($ping['rooms']['used'] ?? -1) === 0);

$room = $post('create', ['initials' => 'tst']);
$check('create-ok', ($room['ok'] ?? false) === true, 'code=' . ($room['code'] ?? '?'));
$code = (string) ($room['code'] ?? '');
$token = (string) ($room['token'] ?? '');
$ping = $get($base . '/rooms.php?action=ping');
$check('counts-live', ($ping['rooms']['used'] ?? -1) === 1);
$check('lowercase-initials-stored-uppercase', $storedInitials($code) === 'TST', $storedInitials($code));
$check('create-without-difficulty-stores-normal', $storedDifficulty($code) === 'normal', $storedDifficulty($code));

// Age a record the way an abandoned room ages.
$ageRoom($code);
// An untouched record is truly gone: the sweep drops it, freeing the slot.
$ping = $get($base . '/rooms.php?action=ping');
$check('stale-not-counted', ($ping['rooms']['used'] ?? -1) === 0);
$gone = $get($base . '/rooms.php?action=state&code=' . $code . '&token=' . $token . '&since=0');
$check('stale-unreachable', ($gone['error'] ?? '') === 'no such room', $gone['error'] ?? '');

// A seated state poll is a heartbeat: a fresh waiting lobby stays counted.
$room = $post('create', ['initials' => 'qrs', 'difficulty' => 'hard']);
$code = (string) ($room['code'] ?? '');
$token = (string) ($room['token'] ?? '');
$state = $get($base . '/rooms.php?action=state&code=' . $code . '&token=' . $token . '&since=0');
$check('heartbeat-ok', ($state['ok'] ?? false) === true);
$check('create-stores-the-hosts-difficulty', $storedDifficulty($code) === 'hard', $storedDifficulty($code));
$check('snapshot-shows-the-difficulty', ($state['room']['difficulty'] ?? null) === 'hard', json_encode($state['room']['difficulty'] ?? null));
$ping = $get($base . '/rooms.php?action=ping');
$check('heartbeat-counts', ($ping['rooms']['used'] ?? -1) === 1);

// A request holding the write lock never stalls the shelf's count: ping only
// reads (RoomsStoreTest covers the full lock behaviour).
$held = tankity_db();
$held->exec('BEGIN IMMEDIATE');
$lockT = microtime(true);
$pingHeld = $get($base . '/rooms.php?action=ping', 20);
$lockDt = microtime(true) - $lockT;
$held->exec('ROLLBACK');
$check('ping-ignores-room-lock', $pingHeld !== null && ($pingHeld['rooms']['used'] ?? -1) >= 1
    && $lockDt < 1.0, sprintf('wait=%.2fs', $lockDt));

// The ceiling uses the live count, and refusals stay human.
$second = $post('create', ['initials' => 'abc', 'difficulty' => 'HARD', 'turn' => 28800]);
$check('create-with-an-unknown-difficulty-stores-normal', $storedDifficulty((string) ($second['code'] ?? '')) === 'normal',
    $storedDifficulty((string) ($second['code'] ?? '')));
$storedTurn = function (string $c) {
    [$room, $lock] = room_load($c);
    room_unlock($lock);
    return is_array($room) ? room_turn_secs($room) : -1;
};
$check('create-with-a-turn-time-stores-it', $storedTurn((string) ($second['code'] ?? '')) === 28800, (string) $storedTurn((string) ($second['code'] ?? '')));
usleep(1100000); // respect the creation throttle before the next attempt
$third = $post('create', ['initials' => 'def']);
$check('cap-live', ($second['ok'] ?? false) === true && ($third['ok'] ?? false) === false,
    'second=' . ($second['code'] ?? '?') . ' thirdErr=' . ($third['error'] ?? '?'));
$check('cap-human', isset($third['error']) && strpos($third['error'], 'taken') !== false, $third['error'] ?? '');

// Rooms live in the database, which outlives a web-server restart: a
// restarted server still sees the same shelf. Then age every room out so the
// cap is free for the match below.
proc_terminate($proc);
proc_close($proc);
$proc = $spawn();
$ping = $waitUp();
$check('restart-keeps-shelf', ($ping['rooms']['used'] ?? -1) === 2, 'used=' . ($ping['rooms']['used'] ?? '?'));
foreach ([$code, (string) ($second['code'] ?? '')] as $c) {
    $ageRoom($c);
}
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
$guest = $post('join', ['code' => $mcode, 'initials' => 'gst', 'difficulty' => 'easy']);
$gseat = (int) ($guest['seat'] ?? -1);
$gtoken = (string) ($guest['token'] ?? '');
$gcsrf = (string) ($guest['csrf'] ?? '');
$check('match-seats', ($match['ok'] ?? false) === true && ($guest['ok'] ?? false) === true && $gseat === 1,
    'code=' . $mcode . ' gseat=' . $gseat);
$check('a-joiner-cannot-change-the-difficulty', $storedDifficulty($mcode) === 'normal', $storedDifficulty($mcode));
// The host's next poll carries the guest's arrival, so the lobby can say so.
$lobby = $get($base . '/rooms.php?action=state&code=' . $mcode . '&token=' . $mtoken . '&since=0');
$joins = array_values(array_filter($lobby['room']['events'] ?? [], fn($e) => ($e['t'] ?? '') === 'join'));
$check('join-event-reaches-the-host', count($joins) === 1 && ($joins[0]['seat'] ?? -1) === $gseat && ($joins[0]['seq'] ?? 0) > 0,
    json_encode($joins));
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
// Delta snapshots: the hills ride only when the asker lacks them. A poll
// names the terrainRev it holds (have); the reply leaves terrain out when that
// is the room's revision, and always names the revision. full=1, another
// revision, or a missing have gets everything.
$dUrl = $base . '/rooms.php?action=state&code=' . $mcode . '&token=' . $mtoken;
$dFull = $get($dUrl . '&since=0');
$dRev = $dFull['room']['terrainRev'] ?? null;
$check('delta-first-poll-is-full', is_int($dRev) && is_array($dFull['room']['terrain'] ?? null) && count($dFull['room']['terrain']) === 720
    && !isset($dFull['room']['resync']), json_encode([$dRev, count($dFull['room']['terrain'] ?? [])]));
$dLean = $get($dUrl . '&since=0&have=' . $dRev);
$check('delta-omits-terrain-when-rev-matches', ($dLean['ok'] ?? false) === true && !array_key_exists('terrain', $dLean['room'] ?? [])
    && ($dLean['room']['terrainRev'] ?? null) === $dRev && count($dLean['room']['tanks'] ?? []) >= 2, json_encode(array_keys($dLean['room'] ?? [])));
$dOther = $get($dUrl . '&since=0&have=' . ($dRev + 1));
$check('delta-other-rev-gets-terrain', count($dOther['room']['terrain'] ?? []) === 720 && ($dOther['room']['terrainRev'] ?? null) === $dRev);
$dForce = $get($dUrl . '&since=0&full=1&have=' . $dRev);
$check('delta-full-1-returns-terrain', count($dForce['room']['terrain'] ?? []) === 720 && ($dForce['room']['terrain'] ?? []) === ($dFull['room']['terrain'] ?? null));
$dZero = $get($dUrl . '&since=0&full=0&have=' . $dRev);
$check('delta-full-0-is-not-full', !array_key_exists('terrain', $dZero['room'] ?? []));
// since cannot be ahead of the room: events were lost (a restarted room), so
// the answer is a full resync.
$dLost = $get($dUrl . '&since=99999&have=' . $dRev);
$check('delta-stale-since-resyncs-with-terrain', ($dLost['room']['resync'] ?? false) === true && count($dLost['room']['terrain'] ?? []) === 720, json_encode(array_keys($dLost['room'] ?? [])));
// The same fields ride on the POST actions (act, ready, buy).
usleep(300000);
$dAct = $post('act', ['code' => $mcode, 'token' => $mtoken, 'csrf' => $mcsrf, 'kind' => 'aim', 'angle' => 60, 'power' => 50, 'since' => 999999, 'have' => $dRev]);
$check('delta-act-reply-resyncs-too', ($dAct['room']['resync'] ?? false) === true && count($dAct['room']['terrain'] ?? []) === 720, json_encode(array_keys($dAct['room'] ?? [])));
usleep(300000);
$dAct = $post('act', ['code' => $mcode, 'token' => $mtoken, 'csrf' => $mcsrf, 'kind' => 'aim', 'angle' => 61, 'power' => 50, 'since' => 0, 'have' => $dRev]);
$check('delta-act-reply-omits-terrain', ($dAct['ok'] ?? false) === true && !array_key_exists('terrain', $dAct['room'] ?? []) && !isset($dAct['room']['resync']), json_encode(array_keys($dAct['room'] ?? ['error' => $dAct['error'] ?? '?'])));
usleep(300000);
$dReady = $post('ready', ['code' => $mcode, 'token' => $mtoken, 'csrf' => $mcsrf, 'ready' => false, 'have' => $dRev]);
$check('delta-ready-reply-omits-terrain', ($dReady['ok'] ?? false) === true && !array_key_exists('terrain', $dReady['room'] ?? []));
// A client that sends nothing extra still gets the old, complete reply.
usleep(300000);
$dPlain = $post('act', ['code' => $mcode, 'token' => $mtoken, 'csrf' => $mcsrf, 'kind' => 'aim', 'angle' => 62, 'power' => 50]);
$check('delta-plain-client-gets-terrain', count($dPlain['room']['terrain'] ?? []) === 720);
// Compression: Accept-Encoding: gzip returns Content-Encoding: gzip that
// decodes to the same JSON; without it the body is plain.
$rawGet = function (string $url, string $accept) {
    $ctx = stream_context_create(['http' => ['timeout' => 8, 'ignore_errors' => true, 'header' => $accept === '' ? '' : "Accept-Encoding: $accept\r\n"]]);
    $body = @file_get_contents($url, false, $ctx);
    return [$http_response_header ?? [], $body === false ? '' : $body];
};
$headerOf = function (array $headers, string $name): string {
    foreach ($headers as $h) {
        if (stripos($h, $name . ':') === 0) {
            return trim(substr($h, strlen($name) + 1));
        }
    }
    return '';
};
$volatile = function (array $r): array {
    unset($r['room']['turnLeft'], $r['room']['shopLeft']);
    return $r;
};
[$hPlain, $bPlain] = $rawGet($dUrl . '&since=0', '');
[$hGz, $bGz] = $rawGet($dUrl . '&since=0', 'gzip');
$unz = $bGz === '' ? false : @gzdecode($bGz);
$check('gzip-plain-without-accept-encoding', $headerOf($hPlain, 'Content-Encoding') === '' && is_array(json_decode($bPlain, true)));
$check('gzip-content-encoding', strtolower($headerOf($hGz, 'Content-Encoding')) === 'gzip' && stripos($headerOf($hGz, 'Vary'), 'Accept-Encoding') !== false,
    json_encode($hGz));
$check('gzip-decodes-to-the-same-json', $unz !== false && $volatile(json_decode($unz, true)) == $volatile(json_decode($bPlain, true)),
    $unz === false ? 'gzdecode failed' : '');
$check('gzip-shrinks-the-reply', $bGz !== '' && strlen($bGz) * 2 < strlen($bPlain), strlen($bGz) . ' vs ' . strlen($bPlain));
[$hErr, $bErr] = $rawGet($base . '/rooms.php?action=state&code=ZZZZ&token=x', 'gzip');
$errJson = $bErr === '' ? null : json_decode((string) @gzdecode($bErr), true);
$check('gzip-errors-compress-too', is_array($errJson) && ($errJson['error'] ?? '') === 'no such room' && strtolower($headerOf($hErr, 'Content-Encoding')) === 'gzip');
$check('gzip-error-status-kept', strpos($hErr[0] ?? '', '404') !== false, $hErr[0] ?? '');
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
$m2 = $post('create', ['initials' => 'sma', 'turn' => 5]);
$c2 = (string) ($m2['code'] ?? '');
$check('create-with-an-unknown-turn-time-stores-the-default', $storedTurn($c2) === 120, (string) $storedTurn($c2));
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
$check('start-sets-start-humans', ($go['room']['startHumans'] ?? -1) === 2, (string) ($go['room']['startHumans'] ?? '?'));
$check('start-skips-open-seat', ($go['ok'] ?? false) === true && $seatsFielded === [0, 1, 3], json_encode($seatsFielded));
usleep(300000);
$late = $post('join', ['code' => $c2, 'initials' => 'smd']);
$check('no-join-after-start', isset($late['error']));
usleep(300000);
$late = $post('seatmode', $h2 + ['seat' => 2, 'mode' => 'ai']);
$check('no-seatmode-after-start', isset($late['error']));

// The turn time: only the host sets it, only to a stop, in any phase; the
// snapshot carries it and one event says who changed it.
usleep(300000);
$tGuest = $post('turntime', $g3a + ['secs' => 600]);
$check('turntime-host-only', isset($tGuest['error']) && strpos($tGuest['error'] ?? '', 'host') !== false, json_encode($tGuest));
usleep(300000);
$tOdd = $post('turntime', $h2 + ['secs' => 90]);
$check('turntime-only-a-stop', isset($tOdd['error']) && strpos($tOdd['error'] ?? '', 'turn time') !== false, json_encode($tOdd));
usleep(300000);
$tSet = $post('turntime', $h2 + ['secs' => 600]);
$tEvents = array_values(array_filter($tSet['room']['events'] ?? [], fn($e) => ($e['t'] ?? '') === 'turntime'));
$check('turntime-host-sets-mid-play', ($tSet['ok'] ?? false) === true && ($tSet['room']['turnSecs'] ?? 0) === 600
    && count($tEvents) === 1 && $tEvents[0]['secs'] === 600 && $tEvents[0]['seat'] === 0, json_encode($tSet['room']['turnSecs'] ?? $tSet));

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
$ageRoom($mcode);
$ping = $get($base . '/rooms.php?action=ping');
$check('match-cleaned', ($ping['rooms']['used'] ?? -1) === 0);

// A refused purchase answers with room_buy's status and line, in the JSON
// error field, and takes no cash. The room is staged straight into the shop
// because reaching it by play is slow.
$bought = $post('create', ['initials' => 'shp']);
$bcode = (string) ($bought['code'] ?? '');
[$stage, $stageLock] = room_load($bcode);
$stage['phase'] = 'shop';
$stage['round'] = 1;
$stage['shop'] = ['at' => microtime(true), 'ready' => []];
$stage['cash'][0] = 100;
$stage['armor'][0] = 30;
room_save($stageLock, $bcode, $stage);
room_unlock($stageLock);
$buy = function (string $item) use ($base, $bought, $bcode): array {
    $ctx = stream_context_create(['http' => [
        'method' => 'POST', 'timeout' => 5, 'ignore_errors' => true,
        'header' => "Content-Type: application/json\r\n",
        'content' => json_encode(['code' => $bcode, 'token' => $bought['token'], 'csrf' => $bought['csrf'], 'item' => $item, 'qty' => 1]),
    ]]);
    $raw = @file_get_contents($base . '/rooms.php?action=buy', false, $ctx);
    $status = 0;
    foreach ($http_response_header ?? [] as $h) {
        if (preg_match('#^HTTP/\S+ (\d+)#', $h, $mm)) {
            $status = (int) $mm[1];
        }
    }
    return [$status, $raw === false ? null : json_decode($raw, true)];
};
foreach ([
    'unknown-item' => ['nope', 422, 'not for sale'],
    'locked-item' => ['nuke', 409, 'nukes unlock in round 4'],
    'short-on-cash' => ['repair', 409, 'short on cash'],
] as $name => [$item, $want, $line]) {
    usleep(300000);
    [$status, $reply] = $buy($item);
    $check("buy-refused-$name", $status === $want && ($reply['error'] ?? null) === $line && !isset($reply['ok']),
        "$status " . json_encode($reply));
    [$after, $afterLock] = room_load($bcode);
    room_unlock($afterLock);
    $check("buy-refused-$name-takes-no-cash", ($after['cash'][0] ?? -1) === 100, (string) ($after['cash'][0] ?? '?'));
}
// A seat that is out of the match is refused, and keeps its cash.
[$stage, $stageLock] = room_load($bcode);
$stage['seats'][0]['lives'] = 0;
room_save($stageLock, $bcode, $stage);
room_unlock($stageLock);
usleep(300000);
[$status, $reply] = $buy('mortar');
$check('buy-refused-out-of-match', $status === 409 && ($reply['error'] ?? null) === 'You are out of this match.' && !isset($reply['ok']),
    "$status " . json_encode($reply));
[$after, $afterLock] = room_load($bcode);
room_unlock($afterLock);
$check('buy-refused-out-of-match-takes-no-cash', ($after['cash'][0] ?? -1) === 100, (string) ($after['cash'][0] ?? '?'));
[$stage, $stageLock] = room_load($bcode);
$stage['seats'][0]['lives'] = 3;
$stage['cash'][0] = 500;
$stage['armor'][0] = 100;
room_save($stageLock, $bcode, $stage);
room_unlock($stageLock);
usleep(300000);
[$status, $reply] = $buy('repair');
$check('buy-refused-armor-at-max', $status === 409 && ($reply['error'] ?? null) === 'armor is full', "$status " . json_encode($reply));
[$stage, $stageLock] = room_load($bcode);
room_unlock($stageLock);
$check('buy-refused-armor-at-max-takes-no-cash', ($stage['cash'][0] ?? -1) === 500, (string) ($stage['cash'][0] ?? '?'));
$ageRoom($bcode);

proc_terminate($proc);
proc_close($proc);
// Remove the private shelf.
tankity_test_rm($tmp);
putenv('CONFIG_FILE');
tankity_config(true);
