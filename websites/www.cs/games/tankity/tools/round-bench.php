<?php
// games/tankity/tools/round-bench.php
// CPU per round of every recorded solo run (protocol/solo-runs.json), played
// by solo_round with no budget cap. Exit 1 when a round is refused, misses the
// browser's claim, or needs more than SOLO_ROUND_CPU: an honest round must always play.
//   php -d xdebug.mode=off tools/round-bench.php
declare(strict_types=1);
define('TANKITY_ROOMS_LIB', true);
require __DIR__ . '/../rooms.php';

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
    printf("%-14s %3d rounds  worst %5.3f s (round %d)  total %6.2f s%s\n", $r['name'], count($r['rounds']), $worst, $at, $total,
        $worst > SOLO_ROUND_CPU ? '  OVER ' . SOLO_ROUND_CPU . ' s' : '');
    if ($worst > SOLO_ROUND_CPU) {
        $bad++;
    }
}
exit($bad ? 1 : 0);
