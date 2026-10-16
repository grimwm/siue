<?php
// games/tankity/test/php-docker/RoomsLoadTest.php
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

/* One SQLite writer for every room, under the load the lobby allows: 8 rooms
   in play, each with three humans and a drone, and four players per room
   polling at the client's pace (src/net.ts MATCH_POLL_MS) for ten seconds,
   against the docker site (nginx and PHP-FPM), as browsers reach it. A poll
   of a playing room takes the write lock only when something is due (a
   drone's turn, which these rooms have every round, or a clock run out);
   the rest are reads. Each human also sends an aim act every few seconds, as
   a player moving the barrel does, and every act takes the lock. The journal is whatever the site picks for its filesystem
   (WAL on the container's overlay).

   What it guards is the single writer's capacity: that the write lock a poll
   takes is held for milliseconds, so 32 polling seats queue briefly and none
   waits out the 2 s busy timeout (a 503). The hard assertions are therefore
   counts: no poll or act answered 503, every seat completed its polls, every
   status was accepted. Latency is a coarse backstop, set against this run's
   own idle baseline so a slow runner moves both together: a healthy run sits
   at 10-30 ms p95, and a lock held several times longer (the writer saturates
   at roughly 20 polls/s, so past ~50 ms per hold) pushes the median and the
   p95 an order of magnitude up and into 503s. Wall-clock never gates alone:
   a stalled CI runner that pauses one poll for 350 ms is not a regression. */
final class RoomsLoadTest extends TestCase
{
    private const ROOMS = 8;
    private const POLL_SECS = 1.6;
    private const ACT_SECS = 3.0;
    private const RUN_SECS = 10.0;
    private const MIN_POLLS_PER_SEAT = 5;
    private const MAX_RUN_SECS = 60.0;
    private const P95_CEILING_MS = 1000; // half the 2 s busy timeout, 30x a healthy p95
    private const MEDIAN_FLOOR_MS = 100;
    private const MEDIAN_BASELINE_X = 12;
    private const BASE = 'http://nginx/games/tankity/rooms.php';

    /** @return array{int, ?array} */
    public static function setUpBeforeClass(): void
    {
        require_once dirname(__DIR__) . '/php/rooms-lib.php'; // the puzzle solver
    }

    private function post(string $action, array $body): array
    {
        $body = tankity_test_admit(dirname(self::BASE), $action, $body);
        $h = curl_init(self::BASE . '?action=' . $action);
        curl_setopt_array($h, [CURLOPT_POST => true, CURLOPT_POSTFIELDS => json_encode($body), CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => ['Content-Type: application/json'], CURLOPT_TIMEOUT => 10]);
        $raw = curl_exec($h);
        $code = (int) curl_getinfo($h, CURLINFO_RESPONSE_CODE);
        return [$code, is_string($raw) ? json_decode($raw, true) : null];
    }

    public function testEightPlayingRoomsPolledAtTheClientsPaceNeverAnswerBusy(): void
    {
        $ping = json_decode((string) @file_get_contents(self::BASE . '?action=ping'), true);
        $this->assertIsArray($ping, 'the docker site answers (make up)');
        $seats = [];
        $rooms = [];
        for ($r = 0; $r < self::ROOMS; $r++) {
            [$st, $host] = $this->post('create', ['initials' => 'l' . chr(97 + $r) . 'a']);
            $this->assertSame(200, $st, json_encode($host));
            $rooms[] = $host;
            $seats[] = [$host['code'], $host['token'], $host['csrf']];
            foreach (['b', 'c'] as $g) {
                [$st, $guest] = $this->post('join', ['code' => $host['code'], 'initials' => 'l' . chr(97 + $r) . $g]);
                $this->assertSame(200, $st, json_encode($guest));
                $seats[] = [$host['code'], $guest['token'], $guest['csrf']];
            }
            usleep(200000); // past the 150 ms act spacing a fresh seat starts under
            [$st, $out] = $this->post('start', ['code' => $host['code'], 'token' => $host['token'], 'csrf' => $host['csrf']]);
            $this->assertSame(200, $st, json_encode($out));
            $seats[] = [$host['code'], '', '']; // a stranger polling the code: answered 404 from a read
        }
        // This run's idle baseline: one seat polling a playing room, one at a time.
        $base = [];
        for ($i = 0; $i < 10; $i++) {
            $t0 = microtime(true);
            @file_get_contents(self::BASE . '?action=state&code=' . $seats[0][0], false,
                stream_context_create(['http' => ['header' => 'X-Seat-Token: ' . $seats[0][1] . "\r\n"]]));
            $base[] = (microtime(true) - $t0) * 1000;
        }
        sort($base);
        $baseline = $base[intdiv(count($base), 2)];
        $mh = curl_multi_init();
        $polled = array_fill_keys(array_keys($seats), 0);
        $next = [];
        $nextAct = [];
        foreach ($seats as $k => $_) {
            $next[$k] = microtime(true) + ($k % 16) * 0.1; // spread the first polls as browsers' clocks are spread
            $nextAct[$k] = microtime(true) + 1.0 + ($k % 8) * 0.3;
        }
        $actors = [];
        $actCodes = [];
        $busy = [];
        $codes = [];
        $strangerCodes = [];
        $lat = [];
        $active = [];
        $start = microtime(true);
        $end = $start + self::RUN_SECS;
        // Ends at the time, but not before every seat has polled its share (a
        // stalled runner polls late, not less), and never past the cap.
        while ($end > microtime(true) || (min($polled) < self::MIN_POLLS_PER_SEAT && microtime(true) < $start + self::MAX_RUN_SECS)
            || $active || $actors) {
            $now = microtime(true);
            foreach ($seats as $k => [$code, $token]) {
                $live = $now < $end || (min($polled) < self::MIN_POLLS_PER_SEAT && $now < $start + self::MAX_RUN_SECS);
                if ($live && $now >= $next[$k] && !isset($active[$k])) {
                    $h = curl_init(self::BASE . '?action=state&code=' . $code);
                    curl_setopt_array($h, [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 10,
                        CURLOPT_HTTPHEADER => $token !== '' ? ['X-Seat-Token: ' . $token] : []]);
                    curl_multi_add_handle($mh, $h);
                    $active[$k] = [$h, $now];
                    $next[$k] = $now + self::POLL_SECS;
                }
            }
            foreach ($seats as $k => [$code, $token, $csrf]) {
                if ($token !== '' && $now < $end && $now >= $nextAct[$k] && !isset($actors[$k])) {
                    $h = curl_init(self::BASE . '?action=act');
                    curl_setopt_array($h, [CURLOPT_POST => true, CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 10,
                        CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
                        CURLOPT_POSTFIELDS => json_encode(['code' => $code, 'token' => $token, 'csrf' => $csrf, 'kind' => 'aim', 'angle' => 40 + $k % 50, 'power' => 60])]);
                    curl_multi_add_handle($mh, $h);
                    $actors[$k] = $h;
                    $nextAct[$k] = $now + self::ACT_SECS;
                }
            }
            curl_multi_exec($mh, $running);
            while (($info = curl_multi_info_read($mh)) !== false) {
                foreach ($actors as $k => $h) {
                    if ($h === $info['handle']) {
                        $actCodes[] = (int) curl_getinfo($h, CURLINFO_RESPONSE_CODE);
                        curl_multi_remove_handle($mh, $h);
                        unset($actors[$k]);
                        continue 2;
                    }
                }
                foreach ($active as $k => [$h, $t0]) {
                    if ($h === $info['handle']) {
                        $status = (int) curl_getinfo($h, CURLINFO_RESPONSE_CODE);
                        if ($seats[$k][1] !== '') {
                            $codes[] = $status;
                        } else {
                            $strangerCodes[] = $status;
                        }
                        $polled[$k]++;
                        $lat[] = (microtime(true) - $t0) * 1000;
                        if ($status === 503) {
                            $busy[] = $k;
                        }
                        curl_multi_remove_handle($mh, $h);
                        unset($active[$k]);
                        break;
                    }
                }
            }
            curl_multi_select($mh, 0.01);
        }
        foreach ($seats as [$code, $token, $csrf]) {
            if ($token !== '') {
                $this->post('leave', ['code' => $code, 'token' => $token, 'csrf' => $csrf]);
            }
        }
        sort($lat);
        $p95 = $lat[(int) ceil(0.95 * count($lat)) - 1];
        $median = $lat[intdiv(count($lat), 2)];
        $this->assertGreaterThanOrEqual(self::MIN_POLLS_PER_SEAT, min($polled), 'every player polled');
        $this->assertSame([], $busy, 'no poll answered 503');
        $this->assertSame([200], array_values(array_unique($codes)));
        $this->assertSame([404], array_values(array_unique($strangerCodes)), 'a stranger learns nothing');
        $this->assertNotEmpty($actCodes, 'the humans acted');
        $this->assertSame([], array_diff($actCodes, [200, 409]), 'an act is accepted or told it is not the seat\'s turn, never busy');
        fwrite(STDERR, sprintf("\nRoomsLoadTest: %d polls, %d acts, baseline %.0f ms, median %.0f ms, p95 %.0f ms, max %.0f ms\n",
            count($lat), count($actCodes), $baseline, $median, $p95, end($lat)));
        $medianLimit = max(self::MEDIAN_FLOOR_MS, self::MEDIAN_BASELINE_X * $baseline);
        $this->assertLessThan($medianLimit, $median, sprintf('median %.0f ms against an idle baseline of %.0f ms', $median, $baseline));
        $this->assertLessThan(self::P95_CEILING_MS, $p95, sprintf('p95 %.0f ms over %d polls', $p95, count($lat)));
    }
}
