<?php
// Web-runnable sibling of rooms-test.php: exercises rooms.php through the
// real web server (same box, same SAPI, same store) instead of spawning its
// own php -S, which shared hosting does not allow. Lives in its own
// directory with its own .config.yaml, scratch store, and private shared
// memory key, so the live shelf is never touched. Open in a browser.
declare(strict_types=1);

header('Content-Type: text/plain; charset=utf-8');
set_time_limit(150);

$fail = 0;
$check = function (string $name, bool $cond, string $extra = '') use (&$fail): void {
    echo ($cond ? 'PASS' : 'FAIL') . ' ' . $name . ($extra !== '' ? ' :: ' . $extra : '') . "\n";
    if (!$cond) {
        $fail++;
    }
};

$host = (string) ($_SERVER['HTTP_HOST'] ?? '');
$dir = rtrim(str_replace('\\', '/', (string) ($_SERVER['SCRIPT_NAME'] ?? '')), '/');
$dir = substr($dir, 0, (int) strrpos($dir, '/'));
$scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$base = $scheme . '://' . $host . $dir;
$origin = $scheme . '://' . $host;

// Read-only peek at the same .config.yaml the server reads, so expectations
// follow the config instead of hardcoding a ceiling or a memory key.
$cfgMax = 10;
foreach (file(__DIR__ . '/.config.yaml') ?: [] as $line) {
    if (preg_match('/^\s*max_rooms\s*:\s*(\d+)/', $line, $m)) $cfgMax = (int) $m[1];
}

$probeGet = function (string $url) {
    $ctx = stream_context_create(['http' => ['timeout' => 8, 'ignore_errors' => true]]);
    $raw = @file_get_contents($url, false, $ctx);
    return $raw === false ? null : json_decode($raw, true);
};
// Reach ourselves however this box allows: the public host name on shared
// hosting, the nginx sibling from inside local docker (where localhost means
// this PHP container, not the web server).
$cands = [$base];
$bareHost = strtolower(preg_replace('/:\d+$/', '', $host));
if (in_array($bareHost, ['localhost', '127.0.0.1', '[::1]', '::1'], true)) {
    $cands[] = 'http://nginx' . $dir;
}
foreach ($cands as $c) {
    $probe = $probeGet($c . '/rooms.php?action=ping');
    if (is_array($probe) && ($probe['ok'] ?? false) === true) {
        $base = $c;
        $oh = (string) parse_url($c, PHP_URL_HOST);
        $op = parse_url($c, PHP_URL_PORT);
        $os = (string) parse_url($c, PHP_URL_SCHEME);
        $origin = $os . '://' . $oh . ($op ? ':' . $op : '');
        break;
    }
}

$get = function (string $url) {
    $ctx = stream_context_create(['http' => ['timeout' => 8, 'ignore_errors' => true]]);
    $raw = @file_get_contents($url, false, $ctx);
    return $raw === false ? null : json_decode($raw, true);
};
$post = function (string $action, array $body) use ($base, $origin) {
    $ctx = stream_context_create(['http' => [
        'method' => 'POST', 'timeout' => 8, 'ignore_errors' => true,
        'header' => "Content-Type: application/json\r\nOrigin: $origin\r\nX-CSRF-Token: " . ($body['csrf'] ?? '') . "\r\n",
        'content' => json_encode($body),
    ]]);
    $raw = @file_get_contents($base . '/rooms.php?action=' . $action, false, $ctx);
    return $raw === false ? null : json_decode($raw, true);
};

// The room functions, in this process: it runs on the same box with the same
// settings as the server, so slot keys and the cap come out identical. Used
// to age records and to hold one room's lock.
define('TANKITY_ROOMS_LIB', true);
require __DIR__ . '/rooms.php';
$ageRoom = function (string $c): void {
    [$room, $lock] = room_load($c);
    if (is_array($room)) {
        $room['touched'] = time() - 3600;
        room_seg_write($lock['shm'], $room);
    }
    room_unlock($lock);
};

$ping = $get($base . '/rooms.php?action=ping');
$check('server-up', $ping !== null);
$store = (string) ($ping['rooms']['store'] ?? '?');
$check('store-known', $store === 'memory', 'store=' . $store);
$check('cap-from-file', ($ping['rooms']['max'] ?? 0) === $cfgMax, 'max=' . ($ping['rooms']['max'] ?? '?'));
// Baseline, not emptiness: strangers may share the shelf, so every count
// below is relative to what was already live. Our own rooms are the only
// ones this suite ever ages out.
$baseUsed = (int) ($ping['rooms']['used'] ?? 0);
$check('empty-shelf', ($ping['rooms']['used'] ?? -1) === $baseUsed, 'used=' . ($ping['rooms']['used'] ?? '?'));

$room = $post('create', ['initials' => 'tst']);
$check('create-ok', ($room['ok'] ?? false) === true, 'code=' . ($room['code'] ?? '?'));
$code = (string) ($room['code'] ?? '');
$token = (string) ($room['token'] ?? '');
$csrf = (string) ($room['csrf'] ?? '');
$ping = $get($base . '/rooms.php?action=ping');
$check('counts-live', ($ping['rooms']['used'] ?? -1) === $baseUsed + 1, 'used=' . ($ping['rooms']['used'] ?? '?'));

// Age a record the way an abandoned room ages.
$ageRoom($code);
// An untouched record is truly gone: the sweep drops it, freeing the slot.
$ping = $get($base . '/rooms.php?action=ping');
$check('stale-not-counted', ($ping['rooms']['used'] ?? -1) === $baseUsed, 'used=' . ($ping['rooms']['used'] ?? '?'));
$gone = $get($base . '/rooms.php?action=state&code=' . $code . '&token=' . $token . '&since=0');
$check('stale-unreachable', ($gone['error'] ?? '') === 'no such room', $gone['error'] ?? '');

// A seated state poll is a heartbeat: a fresh waiting lobby stays counted.
$room = $post('create', ['initials' => 'qrs']);
$code = (string) ($room['code'] ?? '');
$token = (string) ($room['token'] ?? '');
$csrf = (string) ($room['csrf'] ?? '');
$state = $get($base . '/rooms.php?action=state&code=' . $code . '&token=' . $token . '&since=0');
$check('heartbeat-ok', ($state['ok'] ?? false) === true);
$ping = $get($base . '/rooms.php?action=ping');
$check('heartbeat-counts', ($ping['rooms']['used'] ?? -1) === $baseUsed + 1, 'used=' . ($ping['rooms']['used'] ?? '?'));

// A request holding one room's lock never stalls the shelf: ping reads
// the registry without a lock.
$held = sem_get(room_key($code), 1);
$check('lock-held', $held !== false && @sem_acquire($held));
$lockT = microtime(true);
$pingHeld = $get($base . '/rooms.php?action=ping');
$lockDt = microtime(true) - $lockT;
if (isset($held) && $held !== false) {
    @sem_release($held);
}
$check('ping-ignores-room-lock', $pingHeld !== null && ($pingHeld['rooms']['used'] ?? -1) >= 1
    && $lockDt < 2.0, sprintf('wait=%.2fs', $lockDt));

// The ceiling uses the live count, and refusals stay human: fill the shelf
// to the configured max, then prove one more guest is refused kindly.
$fillNames = ['fax', 'fay', 'faz', 'fbx', 'fby', 'fbz', 'fcx', 'fcy', 'fcz', 'fdx'];
$fillCodes = [];
$pingNow = $get($base . '/rooms.php?action=ping');
$need = $cfgMax - (int) ($pingNow['rooms']['used'] ?? 0);
$fillsOk = true;
for ($i = 0; $i < $need; $i++) {
    sleep(2); // respect the creation throttle before the next attempt
    $f = $post('create', ['initials' => $fillNames[$i % count($fillNames)]]);
    if (($f['ok'] ?? false) !== true) $fillsOk = false;
    else $fillCodes[] = (string) ($f['code'] ?? '');
}
sleep(2);
$refused = $post('create', ['initials' => 'zzz']);
$check('cap-live', $fillsOk && ($refused['ok'] ?? false) === false,
    'filled=' . count($fillCodes) . '/' . $need . ' refusedErr=' . ($refused['error'] ?? '?'));
$check('cap-human', isset($refused['error']) && strpos($refused['error'], 'taken') !== false, $refused['error'] ?? '');

// Empty the shelf back down for the match below, then prove the sweep took.
foreach (array_merge($fillCodes, [$code]) as $old) {
    $ageRoom($old);
}
$ping = $get($base . '/rooms.php?action=ping');
$check('shelf-emptied', ($ping['rooms']['used'] ?? -1) === $baseUsed, 'used=' . ($ping['rooms']['used'] ?? '?'));

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
// Leave the shared shelf as found: only this match is swept.
$ageRoom($mcode);
$get($base . '/rooms.php?action=ping'); // the sweep runs on ping, not on state
$gone = $get($base . '/rooms.php?action=state&code=' . $mcode . '&token=' . $mtoken . '&since=0');
$check('match-cleaned', ($gone['error'] ?? '') === 'no such room', $gone['error'] ?? '');

echo $fail ? "WEB-FAILED\n" : "WEB-OK\n";
