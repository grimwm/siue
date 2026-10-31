<?php
// Fills a stats database with made-up visits (90 days unless told otherwise), through the real collector, so the
// Visitors dashboard can be looked at (and screenshotted) with numbers in it. Local only; tests/ never ships.
//   php tests/stats-demo-seed.php <admin data dir> [seed] [days]
declare(strict_types=1);

require __DIR__ . '/../stats/lib/bootstrap.php';

$dir = $argv[1] ?? '';
if ($dir === '' || !is_dir($dir)) {
    fwrite(STDERR, "usage: php tests/stats-demo-seed.php <admin data dir> [seed] [days]\n");
    exit(2);
}
mt_srand((int) ($argv[2] ?? 7));

final class DemoClock implements Admin\Clock
{
    public int $now = 0;

    public function now(): int
    {
        return $this->now;
    }
}

$db = Stats\Db::open($dir);
$clock = new DemoClock();
$host = 'localhost';
$c = new Stats\Collector($db, $clock, $host);

$uas = [
    'phone' => ['Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1', 5, 390],
    'android' => ['Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Mobile Safari/537.36', 5, 412],
    'tablet' => ['Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1', 5, 820],
    'desktop' => ['Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', 0, 1080],
    'mac' => ['Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', 0, 900],
];
$pick = static function (array $weights): string {
    $r = mt_rand() / mt_getrandmax() * array_sum($weights);
    foreach ($weights as $k => $w) {
        if (($r -= $w) <= 0) {
            return (string) $k;
        }
    }
    return (string) array_key_last($weights);
};
$hex = static fn(int $bytes): string => bin2hex(random_bytes($bytes));
$post = static function (array $m, string $ip, string $ua) use ($c): void {
    $c->handle('POST', ['origin' => 'http://localhost', 'sec-fetch-site' => 'same-origin'], (string) json_encode($m), $ip, $ua);
};

$days = max(7, (int) ($argv[3] ?? 90));
$now = time();
$start = $now - $days * 86400;
$pool = [];
$crete = array_merge(array_map(static fn(int $i): string => "1-$i", range(1, 10)), array_map(static fn(int $i): string => "2-$i", range(1, 10)));
$sent = 0;
for ($d = 0; $d <= $days; $d++) {
    $dayStart = $start + $d * 86400;
    $dayStart -= $dayStart % 86400;
    $weekday = (int) gmdate('N', $dayStart);
    $base = 10 + 31.5 * $d / $days + ($weekday >= 6 ? 6 : 0);
    $spike = ['facebook' => $d === $days - 38 ? 70 : ($d === $days - 37 ? 25 : 0), 'discord' => $d === $days - 16 ? 40 : 0];
    $count = (int) round($base * (0.8 + mt_rand() / mt_getrandmax() * 0.4)) + $spike['facebook'] + $spike['discord'];
    $plans = [];
    for ($v = 0; $v < $count; $v++) {
        $returning = $pool !== [] && mt_rand(1, 100) <= 42;
        if ($returning) {
            // Most who come back were here lately.
            $who = &$pool[max(0, count($pool) - 1 - (int) floor((mt_rand() / mt_getrandmax()) ** 2 * min(count($pool), 400)))];
        } else {
            $kind = $pick(['phone' => 38, 'android' => 18, 'tablet' => 9, 'desktop' => 22, 'mac' => 13]);
            $who = ['vid' => mt_rand(1, 100) <= 82 ? $hex(16) : null, 'ip' => '198.51.' . mt_rand(0, 255) . '.' . mt_rand(1, 254), 'ua' => $uas[$kind], 'level' => 0];
            if ($who['vid'] !== null) {
                $pool[] = &$who;
            }
        }
        $hour = (int) $pick([0 => 1, 1 => 1, 6 => 1, 7 => 2, 8 => 4, 9 => 5, 10 => 7, 11 => 8, 12 => 9, 13 => 8, 14 => 7, 15 => 6, 16 => 6, 17 => 6, 18 => 7, 19 => 9, 20 => 10, 21 => 9, 22 => 5, 23 => 2]);
        $at = $dayStart + ($hour + 5) % 24 * 3600 + mt_rand(0, 3500);
        if ($at > $now) {
            unset($who);
            continue;
        }
        $ref = $spike['facebook'] > 0 && $v < $spike['facebook'] ? 'l.facebook.com' : ($spike['discord'] > 0 && $v >= $count - $spike['discord'] ? 'discord.com'
            : ['l.facebook.com', 'discord.com', 'www.google.com', '', '', 'localhost', 'blackboard.siue.edu'][(int) $pick([0 => 14, 1 => 8, 2 => 16, 3 => 30, 4 => 10, 5 => 12, 6 => 10])]);
        $page = $pick(['crete' => 46, 'home' => 24, 'tankity' => 20, 'cylon' => 10]);
        $plans[] = [$at, &$who, $page, $ref];
        unset($who);
    }
    usort($plans, static fn(array $a, array $b): int => $a[0] <=> $b[0]);
    foreach ($plans as [$at, &$who, $page, $ref]) {
        $clock->now = $at;
        $sid = $hex(8);
        $pv = $hex(8);
        [$ua, $tp, $sw] = $who['ua'];
        $post(['t' => 'v', 'p' => $page, 'pv' => $pv, 'sid' => $sid, 'vid' => $who['vid'], 'r' => $ref, 'tp' => $tp, 'sw' => $sw], $who['ip'], $ua);
        $secs = (int) min(5400, max(4, exp(mt_rand(250, 640) / 100)));
        $ev = static function (string $n, ?string $k = null) use (&$who, $sid, $page, $post, $ua, $clock): void {
            $clock->now += mt_rand(20, 200);
            $post(['t' => 'e', 'p' => $page, 'sid' => $sid, 'vid' => $who['vid'], 'n' => $n] + ($k === null ? [] : ['k' => $k]), $who['ip'], $ua);
        };
        if ($page === 'crete' && mt_rand(1, 100) <= 85) {
            $ev('game_start', $who['level'] > 0 ? 'continue' : 'new');
            $tries = mt_rand(1, 6);
            for ($t = 0; $t < $tries && $who['level'] < count($crete); $t++) {
                $lvl = $crete[$who['level']];
                $ev('level_start', $lvl);
                if (mt_rand(1, 100) <= 30) {
                    $ev('hint');
                }
                if (mt_rand(1, 100) <= 8) {
                    $ev('route');
                }
                if (mt_rand(1, 100) <= 4) {
                    $ev('auto');
                }
                if (mt_rand(1, 100) <= max(35, 92 - $who['level'] * 4)) {
                    $ev('level_win', $lvl);
                    $who['level']++;
                } else {
                    break;
                }
            }
            if (mt_rand(1, 100) <= 6) {
                $ev('share');
            }
            if (mt_rand(1, 100) <= 2) {
                $ev('install');
            }
        } elseif ($page === 'tankity' && mt_rand(1, 100) <= 80) {
            $room = mt_rand(1, 100) <= 25;
            if ($room) {
                $ev('room_host');
            }
            $ev('match_start', $room ? 'room' : 'solo');
            if (mt_rand(1, 100) <= 60) {
                $ev('match_end', $room ? 'room' : 'solo');
            }
        } elseif ($page === 'cylon' && mt_rand(1, 100) <= 75) {
            $ev('game_start');
            if (mt_rand(1, 100) <= 30) {
                $ev('score_submit');
            }
        }
        $post(['t' => 's', 'p' => $page, 'pv' => $pv, 'sec' => $secs], $who['ip'], $ua);
        $sent++;
    }
    unset($who);
}
Stats\Rollup::maybeRun($db, $now + 3600);
echo "stats-demo-seed: $sent visits over $days days\n";
