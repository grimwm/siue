<?php
// Writes (or checks) the room protocol fixtures next to this file.
//   php protocol/generate.php          rewrite every fixture
//   php protocol/generate.php --check  exit 1 if any fixture is stale
// Snapshots are built in process with rooms.php's own functions
// (scenarios.php). The create/join replies and the act errors come from a
// real rooms.php served by php -S on a free 127.0.0.1 port with a private
// data directory (run it in the docker PHP: make protocol).
declare(strict_types=1);
require __DIR__ . '/scenarios.php';

$check = in_array('--check', $argv, true);

/* ---- the live server ---- */
$data = sys_get_temp_dir() . '/tankity-protocol-' . getmypid() . '-' . bin2hex(random_bytes(3));
$probe = stream_socket_server('tcp://127.0.0.1:0');
$port = (int) substr(strrchr(stream_socket_get_name($probe, false), ':'), 1);
fclose($probe);
$base = 'http://127.0.0.1:' . $port;
$proc = proc_open(
    [PHP_BINARY, '-S', '127.0.0.1:' . $port, '-t', dirname(__DIR__)],
    [0 => ['file', '/dev/null', 'r'], 1 => ['file', '/dev/null', 'w'], 2 => ['file', '/dev/null', 'w']],
    $pipes,
    null,
    array_merge(getenv(), ['TANKITY_DATA_DIR' => $data, 'TANKITY_MAX_ROOMS' => '2', 'TANKITY_POW_BITS' => '4'])
);
$cleanup = function () use ($proc, $data): void {
    if (is_resource($proc)) {
        proc_terminate($proc);
    }
    // The server's private store: the database and its journal.
    foreach (glob($data . '/{,.}*', GLOB_BRACE) ?: [] as $f) {
        if (is_file($f)) {
            @unlink($f);
        }
    }
    @rmdir($data);
};
register_shutdown_function($cleanup);

/** A GET; returns [status, decoded body]. */
$get = function (string $query) use ($base): array {
    $raw = @file_get_contents($base . '/rooms.php?' . $query, false, stream_context_create(['http' => ['timeout' => 10, 'ignore_errors' => true]]));
    $status = 0;
    foreach ($http_response_header ?? [] as $h) {
        if (preg_match('#^HTTP/\S+ (\d+)#', $h, $m)) {
            $status = (int) $m[1];
        }
    }
    return [$status, $raw === false ? null : json_decode($raw, true)];
};
/* A create or join pays the room puzzle, solved here; a body that says
   `proto` or `pow` is sent as given. */
$solve = function (string $action) use ($get): array {
    [, $ch] = $get('action=challenge&for=' . $action);
    $found = [];
    for ($n = 0; count($found) < (int) $ch['count']; $n++) {
        if (room_pow_lead($ch['challenge'], $n) >= (int) $ch['bits']) {
            $found[] = $n;
        }
    }
    return ['c' => $ch['challenge'], 'n' => $found];
};
/** One request; returns [status, decoded body]. */
$call = function (string $action, array $body) use ($base, $solve): array {
    if (in_array($action, ['create', 'join'], true) && !array_key_exists('proto', $body) && !array_key_exists('pow', $body)) {
        $body += ['proto' => ROOM_PROTO, 'pow' => $solve($action)];
    }
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

// A host alone: Start answers `local` (the browser plays the match), and a
// bundle that sends no `proto` is told to reload instead.
[$st, $alone] = $call('create', ['initials' => 'ghi', 'difficulty' => 'hard']);
if ($st !== 200 || empty($alone['ok'])) {
    fwrite(STDERR, "protocol: the lone host's create failed ($st)\n");
    exit(1);
}
usleep(300000);
$lone = ['code' => $alone['code'], 'token' => $alone['token'], 'csrf' => $alone['csrf']];
[$st, $body] = $call('start', $lone);
$fixtures['error-reload'] = ['A bundle older than the server, where it cannot play the answer (a lone host\'s Start without `proto`): HTTP 426, reload.', $st, $body];
usleep(300000);
[$st, $body] = $call('start', $lone + ['proto' => 2]);
$fixtures['start-local-reply'] = ['Start with the host alone: the lobby closes and the browser plays the match with the room\'s Difficulty and speed.', $st, $body];
if ($fixtures['error-reload'][1] !== 426 || $fixtures['start-local-reply'][1] !== 200) {
    fwrite(STDERR, 'protocol: expected 426 then 200 for a lone Start, got ' . $fixtures['error-reload'][1] . ' then ' . $fixtures['start-local-reply'][1] . "\n");
    exit(1);
}

// The room puzzle: what action=challenge answers (the challenge itself is
// random and signed, so a placeholder stands in), and a create without it.
[$st, $ch] = $get('action=challenge&for=join');
if ($st !== 200 || !is_string($ch['challenge'] ?? null) || !preg_match('/^v1\.\d+\.j\.4\.[A-Za-z0-9_-]{22}\.[A-Za-z0-9_-]{22}$/', $ch['challenge'])) {
    fwrite(STDERR, "protocol: the challenge failed ($st)\n");
    exit(1);
}
$fixtures['challenge-reply'] = ['A room puzzle for a join, at 4 bits (the challenge string here is a placeholder: the real one is signed and bound to the asker\'s address).',
    200, ['challenge' => 'v1.1800000000.j.4.fixture-random-bytes00.fixture-signature-000000'] + $ch];
[$st, $body] = $call('create', ['initials' => 'jkl', 'proto' => ROOM_PROTO]);
$fixtures['error-puzzle'] = ['A create without its puzzle: HTTP 422, and which check refused it.', $st, $body];
if ($st !== 422 || ($body['puzzle'] ?? '') !== 'puzzle-short') {
    fwrite(STDERR, "protocol: expected 422 puzzle-short for a create without a puzzle, got $st\n");
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
        // sim-vectors.php and pow-vectors.php own those two.
        if (!in_array(basename($f), ['sim-vectors.json', 'pow-vectors.json'], true) && !isset($fixtures[basename($f, '.json')])) {
            $stale[] = basename($f) . ' (no scenario makes it)';
        }
    }
    if ($stale) {
        fwrite(STDERR, 'protocol: stale fixtures: ' . implode(', ', $stale) . "; run make protocol and commit the result\n");
        exit(1);
    }
    echo 'protocol: ' . count($fixtures) . " fixtures current\n";
}
