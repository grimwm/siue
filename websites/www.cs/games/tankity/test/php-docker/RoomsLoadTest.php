<?php
// games/tankity/test/php-docker/RoomsLoadTest.php
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

/* One SQLite writer for every room, under the load the lobby allows: 8 rooms
   in play, each with three humans and a drone, and four players per room
   polling at the client's pace (src/net.ts MATCH_POLL_MS) for ten seconds,
   against the docker site (nginx and PHP-FPM), as browsers reach it. Every
   poll of a playing room takes the write lock (the drone's turns run in it),
   and each human also sends an aim act every few seconds, as a player moving
   the barrel does. The journal is whatever the site picks for its filesystem
   (WAL on the container's overlay). */
final class RoomsLoadTest extends TestCase
{
    private const ROOMS = 8;
    private const POLL_SECS = 1.6;
    private const ACT_SECS = 3.0;
    private const RUN_SECS = 10.0;
    private const ROOMS_P95_MS = 300;
    private const BASE = 'http://nginx/games/tankity/rooms.php';

    /** @return array{int, ?array} */
    private function post(string $action, array $body): array
    {
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
        $this->assertLessThanOrEqual($ping['rooms']['max'], $ping['rooms']['used'] + self::ROOMS, 'room for the test on the shelf');
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
            $seats[] = [$host['code'], '', '']; // a fourth player watching: a poll with no seat
        }
        $mh = curl_multi_init();
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
        $lat = [];
        $active = [];
        $end = microtime(true) + self::RUN_SECS;
        while (microtime(true) < $end || $active || $actors) {
            $now = microtime(true);
            foreach ($seats as $k => [$code, $token]) {
                if ($now < $end && $now >= $next[$k] && !isset($active[$k])) {
                    $h = curl_init(self::BASE . '?action=state&code=' . $code . ($token !== '' ? '&token=' . $token : ''));
                    curl_setopt_array($h, [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 10]);
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
                        $codes[] = $status;
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
        $this->assertGreaterThan(self::ROOMS * 4 * 5, count($codes), 'every player polled');
        $this->assertSame([], $busy, 'no poll answered 503');
        $this->assertSame([200], array_values(array_unique($codes)));
        $this->assertNotEmpty($actCodes, 'the humans acted');
        $this->assertSame([], array_diff($actCodes, [200, 409]), 'an act is accepted or told it is not the seat\'s turn, never busy');
        fwrite(STDERR, sprintf("\nRoomsLoadTest: %d polls, %d acts, p95 %.0f ms, max %.0f ms\n", count($lat), count($actCodes), $p95, end($lat)));
        $this->assertLessThan(self::ROOMS_P95_MS, $p95, sprintf('p95 %.0f ms over %d polls', $p95, count($lat)));
    }
}
