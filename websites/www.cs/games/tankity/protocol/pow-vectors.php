<?php
// Writes (or checks) pow-vectors.json next to this file: the room puzzle's
// cases, so the server (server/pow.php) and the browser (src/pow.ts) count
// the same leading zero bits of the same PBKDF2 output.
//   php protocol/pow-vectors.php          rewrite pow-vectors.json
//   php protocol/pow-vectors.php --check  exit 1 if it is stale
// Six fixed challenges (their MACs are made up: only the derivation is
// pinned), each with the first POW_COUNT nonces from 0 up that solve it at
// POW_VECTOR_BITS, and probes: those nonces and one that does not solve it,
// each with its leading zero count. Read by test/pow.test.ts and
// test/php/RoomPowTest.php. Plain php: no database, no web server.
declare(strict_types=1);
if (!defined('TANKITY_ROOMS_INCLUDED')) {
    define('TANKITY_ROOMS_INCLUDED', true);
}
require_once __DIR__ . '/../server/pow.php';

const POW_VECTOR_BITS = 6;
const POW_VECTOR_CHALLENGES = [
    'v1.1800000000.c.6.AAAAAAAAAAAAAAAAAAAAAA.vectors-zero-mac-xxxxx',
    'v1.1800000001.j.6.ZmFrZS1yYW5kb20tYnl0ZXM.vectors-one-mac-xxxxxx',
    'v1.1800000002.c.6.dGFua2l0eS1wb3ctdmVjdG8.vectors-two-mac-xxxxxx',
    'v1.1800000003.j.6.cHV6emxlLXRocmVlLWNhc2U.vectors-three-mac-xxxx',
    'v1.1800000004.c.6.Zm91ci1mb3VyLWZvdXItZm8.vectors-four-mac-xxxxx',
    'v1.1800000005.j.6.ZmlmdGgtYW5kLWxhc3Qtb24.vectors-five-mac-xxxxx',
];

$cases = [];
foreach (POW_VECTOR_CHALLENGES as $c) {
    $solution = [];
    $miss = null;
    for ($n = 0; count($solution) < POW_COUNT; $n++) {
        if (room_pow_lead($c, $n) >= POW_VECTOR_BITS) {
            $solution[] = $n;
        } elseif ($miss === null) {
            $miss = $n;
        }
    }
    $probes = [];
    foreach ([...$solution, $miss] as $n) {
        $probes[] = ['nonce' => $n, 'lead' => room_pow_lead($c, $n)];
    }
    $cases[] = ['challenge' => $c, 'solution' => $solution, 'probes' => $probes];
}
$text = json_encode(['iter' => POW_ITER, 'count' => POW_COUNT, 'bits' => POW_VECTOR_BITS, 'challenges' => $cases],
    JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . "\n";
$file = __DIR__ . '/pow-vectors.json';
if (in_array('--check', $argv, true)) {
    if (@file_get_contents($file) !== $text) {
        fwrite(STDERR, "protocol/pow-vectors.json is stale: run php protocol/pow-vectors.php\n");
        exit(1);
    }
    exit(0);
}
file_put_contents($file, $text);
