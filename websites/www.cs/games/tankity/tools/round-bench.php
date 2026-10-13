<?php
// games/tankity/tools/round-bench.php
// CPU per round of every recorded solo run (protocol/solo-runs.json), played
// by solo_round with no budget cap. Report only: exit 1 when a round is refused
// or misses the browser's claim. --budget=SECONDS also fails any round that
// needs more, for a manual or nightly check against a host-calibrated number.
// A loaded xdebug slows the referee about 4x even with xdebug.mode=off: time with `php -n` where it is installed.
//   php -d xdebug.mode=off tools/round-bench.php [--budget=2.0]
declare(strict_types=1);
define('TANKITY_ROOMS_LIB', true);
require __DIR__ . '/../rooms.php';

$budget = null;
foreach (array_slice($argv, 1) as $arg) {
    if (!preg_match('/^--budget=(\d+(?:\.\d+)?)$/', $arg, $m) || (float) $m[1] <= 0.0) {
        fwrite(STDERR, "usage: php tools/round-bench.php [--budget=SECONDS]\n");
        exit(2);
    }
    $budget = (float) $m[1];
}

$runs = json_decode((string) file_get_contents(__DIR__ . '/../protocol/solo-runs.json'), true)['runs'];
$bad = 0;
foreach ($runs as $r) {
    $s = solo_deal($r['seed'], $r['difficulty'], $r['w']);
    $worst = 0.0;
    $at = 0;
    $total = 0.0;
    foreach ($r['rounds'] as $round) {
        $t0 = solo_cpu_now();
        $got = solo_round($s, $round['buys'], $round['shots'], 1e9);
        $cpu = solo_cpu_now() - $t0;
        if ($cpu > $worst) {
            [$worst, $at] = [$cpu, $round['n']];
        }
        $total += $cpu;
        if (!$got['ok'] || $got['claim'] !== $round['claim']) {
            printf("%-14s round %d %s\n", $r['name'], $round['n'], $got['ok'] ? 'MISSES THE CLAIM' : 'REFUSED ' . $got['error']);
            $bad++;
            continue 2;
        }
        $s = $got['s'];
    }
    $over = $budget !== null && $worst > $budget;
    printf("%-14s %3d rounds  worst %5.3f s (round %d)  total %6.2f s%s\n", $r['name'], count($r['rounds']), $worst, $at, $total,
        $over ? '  OVER ' . $budget . ' s' : '');
    if ($over) {
        $bad++;
    }
}
printf("default budget SOLO_ROUND_CPU = %.1f s\n", SOLO_ROUND_CPU);
exit($bad ? 1 : 0);
