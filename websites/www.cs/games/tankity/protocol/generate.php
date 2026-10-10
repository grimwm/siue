<?php
// Writes (or checks) the room protocol fixtures next to this file.
//   php protocol/generate.php          rewrite every fixture
//   php protocol/generate.php --check  exit 1 if any fixture is stale
// Snapshots are built in process with rooms.php's own functions
// (scenarios.php). The create/join replies and the act errors come from a
// real rooms.php served by php -S on a free 127.0.0.1 port with a private
// shared-memory key, so this needs SysV: run it where the room tests run
// (the docker PHP; see README.md).
declare(strict_types=1);
require __DIR__ . '/scenarios.php';

$check = in_array('--check', $argv, true);
if (!function_exists('shm_attach') || !function_exists('sem_get')) {
    fwrite(STDERR, "protocol: needs sysvshm and sysvsem; run it in the docker PHP (make protocol)\n");
    exit(1);
}

/* ---- the live server ---- */
$shmKey = 200000 + (getmypid() % 50000);
$probe = stream_socket_server('tcp://127.0.0.1:0');
$port = (int) substr(strrchr(stream_socket_get_name($probe, false), ':'), 1);
fclose($probe);
$base = 'http://127.0.0.1:' . $port;
$proc = proc_open(
    [PHP_BINARY, '-S', '127.0.0.1:' . $port, '-t', dirname(__DIR__)],
    [0 => ['file', '/dev/null', 'r'], 1 => ['file', '/dev/null', 'w'], 2 => ['file', '/dev/null', 'w']],
    $pipes,
    null,
    array_merge(getenv(), ['TANKITY_SHM_KEY' => (string) $shmKey, 'TANKITY_MAX_ROOMS' => '2'])
);
$cleanup = function () use ($proc, $shmKey): void {
    if (is_resource($proc)) {
        proc_terminate($proc);
    }
    $id = @shm_attach($shmKey, ROOM_SHM_SIZE);
    if ($id !== false) {
        @shm_remove($id);
    }
    $sem = @sem_get($shmKey, 1);
    if ($sem !== false) {
        @sem_remove($sem);
    }
};
register_shutdown_function($cleanup);

/** One request; returns [status, decoded body]. */
$call = function (string $action, array $body) use ($base): array {
    $ctx = stream_context_create(['http' => [
        'method' => 'POST', 'timeout' => 10, 'ignore_errors' => true,
        'header' => "Content-Type: application/json\r\n",
        'content' => json_encode($body),
    ]]);
    $raw = @file_get_contents($base . '/rooms.php?action=' . $action, false, $ctx);
    $status = 0;
    foreach ($http_response_header ?? [] as $h) {
        if (preg_match('#^HTTP/\S+ (\d+)#', $h, $m)) {
            $status = (int) $m[1];
        }
    }
    return [$status, $raw === false ? null : json_decode($raw, true)];
};
$up = false;
for ($i = 0; $i < 50 && !$up; $i++) {
    usleep(100000);
    $up = @file_get_contents($base . '/rooms.php?action=ping') !== false;
}
if (!$up) {
    fwrite(STDERR, "protocol: the test server did not start\n");
    exit(1);
}

$fixtures = protocol_snapshots();

// Create and join: the volatile values (code, tokens) are replaced with fixed
// ones; the keys and types are what the client relies on.
[$st, $created] = $call('create', ['initials' => 'abc']);
if ($st !== 200 || empty($created['ok'])) {
    fwrite(STDERR, "protocol: create failed ($st)\n");
    exit(1);
}
$fixtures['create-reply'] = ['Host creates a room: its code, seat 0, a seat token and the csrf token (values here are placeholders).',
    200, ['ok' => true, 'code' => PROTOCOL_CODE, 'seat' => $created['seat'], 'token' => 'fixture-token-0', 'csrf' => 'fixture-csrf']];
[$st, $joined] = $call('join', ['code' => $created['code'], 'initials' => 'def']);
if ($st !== 200 || empty($joined['ok'])) {
    fwrite(STDERR, "protocol: join failed ($st)\n");
    exit(1);
}
$fixtures['join-reply'] = ['A guest joins: same keys as create, their own seat.',
    200, ['ok' => true, 'code' => PROTOCOL_CODE, 'seat' => $joined['seat'], 'token' => 'fixture-token-1', 'csrf' => 'fixture-csrf']];

usleep(300000); // past the 150 ms act spacing
[$st, $started] = $call('start', ['code' => $created['code'], 'token' => $created['token'], 'csrf' => $created['csrf']]);
if ($st !== 200 || empty($started['ok'])) {
    fwrite(STDERR, "protocol: start failed ($st)\n");
    exit(1);
}
// Loading a weapon is allowed on anyone's turn and saves the seat's act time,
// so an act straight after it lands inside the 150 ms spacing (429); once the
// spacing has passed the same act reaches the turn check (the host is up: 409).
usleep(300000);
$guest = ['code' => $created['code'], 'token' => $joined['token'], 'csrf' => $joined['csrf']];
[$st] = $call('act', $guest + ['kind' => 'weapon', 'weapon' => 'shell']);
if ($st !== 200) {
    fwrite(STDERR, "protocol: the guest's weapon pick failed ($st)\n");
    exit(1);
}
$aim = $guest + ['kind' => 'aim', 'angle' => 50, 'power' => 50];
[$st, $body] = $call('act', $aim);
$fixtures['error-too-fast'] = ['An act inside the 150 ms spacing: HTTP 429 with a short error string.', $st, $body];
usleep(300000);
[$st, $body] = $call('act', $aim);
$fixtures['error-not-your-turn'] = ['An act on someone else\'s turn: HTTP 409.', $st, $body];
if ($fixtures['error-too-fast'][1] !== 429 || $fixtures['error-not-your-turn'][1] !== 409) {
    fwrite(STDERR, 'protocol: expected 429 then 409, got ' . $fixtures['error-too-fast'][1] . ' then ' . $fixtures['error-not-your-turn'][1] . "\n");
    exit(1);
}

/* ---- write or compare ---- */
$stale = [];
foreach ($fixtures as $name => [$about, $status, $body]) {
    $text = json_encode(['about' => $about, 'status' => $status, 'body' => protocol_wire($body)],
        JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT) . "\n";
    $file = __DIR__ . "/$name.json";
    if ($check) {
        if (!is_file($file) || file_get_contents($file) !== $text) {
            $stale[] = "$name.json";
        }
    } else {
        file_put_contents($file, $text);
        echo "protocol: wrote $name.json\n";
    }
}
if ($check) {
    foreach (glob(__DIR__ . '/*.json') ?: [] as $f) {
        if (!isset($fixtures[basename($f, '.json')])) {
            $stale[] = basename($f) . ' (no scenario makes it)';
        }
    }
    if ($stale) {
        fwrite(STDERR, 'protocol: stale fixtures: ' . implode(', ', $stale) . "; run make protocol and commit the result\n");
        exit(1);
    }
    echo 'protocol: ' . count($fixtures) . " fixtures current\n";
}
