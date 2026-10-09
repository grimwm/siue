<?php
// Compares probe.php's JSON (stdin) with the lists read from www.cs.siue.edu.
// Usage: php compare.php <expected-dir>. Exits 1 on any difference.
$dir = $argv[1];
$probe = json_decode(stream_get_contents(STDIN), true);
if (!is_array($probe)) {
    fwrite(STDERR, "FAIL: probe output was not JSON\n");
    exit(1);
}
$lines = fn (string $f) => array_values(array_filter(
    array_map('trim', file("$dir/$f")),
    fn ($l) => $l !== '' && $l[0] !== '#'
));
$bad = 0;

$want = $lines('expected-php-version.txt')[0];
$got = implode('.', array_slice(explode('.', $probe['php']), 0, 2));
if ($got === $want && $probe['sapi'] === 'fpm-fcgi') {
    echo "OK: PHP {$probe['php']} ({$probe['sapi']}), server minor is $want\n";
} else {
    echo "FAIL: image runs PHP {$probe['php']} ({$probe['sapi']}), server is $want (fpm-fcgi)\n";
    $bad++;
}

$server = array_map('strtolower', $lines('expected-modules.txt'));
$image = array_map('strtolower', $probe['extensions']);
$missing = array_diff($server, $image);
$extra = array_diff($image, $server);
if (!$missing && !$extra) {
    echo 'OK: ' . count($server) . " modules match www.cs.siue.edu\n";
} else {
    echo "FAIL: module set differs from www.cs.siue.edu\n";
    foreach ($missing as $m) echo "  server only: $m\n";
    foreach ($extra as $m) echo "  image only:  $m\n";
    $bad++;
}

// ini_get_all() reports booleans as "1"/"0"/""; fold those to On/Off.
$onOff = fn ($v) => in_array(strtolower((string) $v), ['1', 'on', 'true', 'yes'], true) ? 'On' : 'Off';
$iniBad = [];
$ini = $lines('expected-ini.txt');
foreach ($ini as $line) {
    [$k, $want] = explode('=', $line, 2);
    if (!array_key_exists($k, $probe['ini'])) {
        $iniBad[] = "  $k: not set in the image";
        continue;
    }
    $got = (string) $probe['ini'][$k];
    if (in_array($want, ['On', 'Off'], true)) {
        $got = $onOff($got);
    }
    if ($got !== $want) {
        $iniBad[] = "  $k: server=$want image=$got";
    }
}
if (!$iniBad) {
    echo 'OK: ' . count($ini) . " ini values match www.cs.siue.edu\n";
} else {
    echo "FAIL: ini values differ from www.cs.siue.edu\n" . implode("\n", $iniBad) . "\n";
    $bad++;
}
exit($bad ? 1 : 0);
