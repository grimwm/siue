<?php
// games/tankity/test/php/RoomPowTest.php
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

/* The room puzzle (server/pow.php) at the library level, on a fixed server
   clock: a challenge is signed and bound to its purpose and the asker's
   address, lives POW_TTL seconds by the server's clock, is solved by
   POW_COUNT distinct nonces, is spent once, and gets harder under load by at
   most two bits. */
final class RoomPowTest extends TestCase
{
    private string $dir;

    private const ENV = ['TANKITY_POW_BITS' => '9', 'TANKITY_POW_SURGE' => '60', 'TANKITY_MAX_ROOMS' => '8',
        'TANKITY_MAX_LOBBIES' => '8', 'TANKITY_ROOM_LIVE_SECS' => '600'];

    public static function setUpBeforeClass(): void
    {
        require_once __DIR__ . '/rooms-lib.php';
    }

    protected function setUp(): void
    {
        $_SERVER = ['HTTP_HOST' => 'localhost', 'REMOTE_ADDR' => '198.51.100.7'];
        $this->dir = tankity_test_dir();
        foreach (self::ENV as $k => $v) {
            putenv("$k=$v");
        }
    }

    protected function tearDown(): void
    {
        room_release_all();
        foreach (array_keys(self::ENV) as $k) {
            putenv($k);
        }
        tankity_test_rm($this->dir);
    }

    /** @return list<int> the first POW_COUNT nonces that solve $challenge at its own bits */
    private function solve(string $challenge): array
    {
        $bits = (int) explode('.', $challenge)[3];
        $found = [];
        for ($n = 0; count($found) < POW_COUNT; $n++) {
            if (room_pow_lead($challenge, $n) >= $bits) {
                $found[] = $n;
            }
        }
        return $found;
    }

    /** A nonce that does not solve $challenge. */
    private function miss(string $challenge): int
    {
        $bits = (int) explode('.', $challenge)[3];
        for ($n = 0; ; $n++) {
            if (room_pow_lead($challenge, $n) < $bits) {
                return $n;
            }
        }
    }

    /** Rows in the rooms table at a phase, as the counts read them. */
    private function rooms(string $phase, int $n, int $now): void
    {
        $db = tankity_db();
        $ins = $db->prepare('INSERT INTO rooms (code, data, created, touched, expires, phase, acted) VALUES (?, ?, ?, ?, ?, ?, ?)');
        for ($i = 0; $i < $n; $i++) {
            $ins->execute([strtoupper(substr($phase, 0, 2)) . sprintf('%04d', $i), '', $now, $now, $now + 600, $phase, $now]);
        }
    }

    private function emptyRooms(): void
    {
        tankity_db()->exec('DELETE FROM rooms');
    }

    public function testIssueIsSignedAndBound(): void
    {
        putenv('TANKITY_POW_BITS=2');
        $now = 1_800_000_000;
        $issued = room_pow_issue('c', $now);
        $parts = explode('.', $issued['challenge']);
        $this->assertCount(6, $parts);
        $this->assertSame(['v1', (string) $now, 'c'], array_slice($parts, 0, 3));
        $this->assertSame(['bits' => 3, 'count' => POW_COUNT, 'iter' => POW_ITER, 'expiresIn' => POW_TTL],
            array_diff_key($issued, ['challenge' => 1]));
        $this->assertSame(1, preg_match('/^[A-Za-z0-9_-]{22}$/', $parts[4]), 'rand: 16 bytes, base64url');
        $this->assertSame(1, preg_match('/^[A-Za-z0-9_-]{22}$/', $parts[5]), 'mac: 22 base64url characters');
        $c = $issued['challenge'];
        $this->assertNull(room_pow_check(['c' => $c, 'n' => $this->solve($c)], 'c', $now), 'the solved puzzle holds');

        $bad = [403, 'puzzle-bad', 'That puzzle is not one of ours.'];
        // Easier bits written into it: the MAC no longer matches.
        $easier = $parts;
        $easier[3] = '0';
        $e = implode('.', $easier);
        $this->assertSame($bad, room_pow_check(['c' => $e, 'n' => [0, 1, 2, 3]], 'c', $now), 'bits edited');
        // A create puzzle spent on a join, or relabelled as one.
        $this->assertSame($bad, room_pow_check(['c' => $c, 'n' => $this->solve($c)], 'j', $now), 'redeemed for the other purpose');
        $relabel = $parts;
        $relabel[2] = 'j';
        $r = implode('.', $relabel);
        $this->assertSame($bad, room_pow_check(['c' => $r, 'n' => $this->solve($r)], 'j', $now), 'purpose edited');
        // Redeemed from another address: the address hash is inside the MAC.
        $_SERVER['REMOTE_ADDR'] = '198.51.100.8';
        $this->assertSame($bad, room_pow_check(['c' => $c, 'n' => $this->solve($c)], 'c', $now), 'another address');
        $_SERVER['REMOTE_ADDR'] = '198.51.100.7';
        // Shapes that are not a challenge at all.
        foreach (['', 'v2.' . substr($c, 3), 'v1.x.c.3.' . $parts[4] . '.' . $parts[5], $c . '.extra', str_replace('.', '', $c)] as $junk) {
            $this->assertSame($bad, room_pow_check(['c' => $junk, 'n' => [0, 1, 2, 3]], 'c', $now), $junk);
        }
    }

    public function testSolvesAreChecked(): void
    {
        putenv('TANKITY_POW_BITS=2');
        $now = 1_800_000_000;
        $c = room_pow_issue('j', $now)['challenge'];
        $n = $this->solve($c);
        $this->assertNull(room_pow_check(['c' => $c, 'n' => $n], 'j', $now));
        $short = [422, 'puzzle-short', 'That puzzle is not finished.'];
        $this->assertSame($short, room_pow_check(['c' => $c, 'n' => array_slice($n, 0, 3)], 'j', $now), 'three nonces');
        $this->assertSame($short, room_pow_check(['c' => $c, 'n' => [$n[0], $n[0], $n[1], $n[2]]], 'j', $now), 'a repeated nonce');
        $this->assertSame($short, room_pow_check(['c' => $c, 'n' => [...$n, $n[0] + 100000]], 'j', $now), 'five nonces');
        $this->assertSame($short, room_pow_check(['c' => $c, 'n' => [$n[0], $n[1], $n[2], (string) $n[3]]], 'j', $now), 'a string nonce');
        $this->assertSame($short, room_pow_check(['c' => $c, 'n' => [$n[0], $n[1], $n[2], -1]], 'j', $now), 'a negative nonce');
        $this->assertSame($short, room_pow_check(['c' => $c], 'j', $now), 'no nonces');
        $this->assertSame($short, room_pow_check(['c' => $c, 'n' => ['a' => 1, 'b' => 2, 'c' => 3, 'd' => 4]], 'j', $now), 'not a list');
        $wrong = [$n[0], $n[1], $n[2], $this->miss($c)];
        $this->assertSame([403, 'puzzle-wrong', 'That puzzle is not solved.'], room_pow_check(['c' => $c, 'n' => $wrong], 'j', $now));
        $this->assertSame($short, room_pow_check(null, 'j', $now), 'no puzzle at all');
    }

    public function testAnOldChallengeIsRefused(): void
    {
        putenv('TANKITY_POW_BITS=2');
        $now = 1_800_000_000;
        $expired = [403, 'puzzle-expired', 'That puzzle ran out of time.'];
        // The age is the server's own: issued and redeemed on $now, no client clock anywhere.
        $old = room_pow_issue('c', $now - POW_TTL - 1)['challenge'];
        $this->assertSame($expired, room_pow_check(['c' => $old, 'n' => $this->solve($old)], 'c', $now), 'one second past its life');
        $edge = room_pow_issue('c', $now - POW_TTL)['challenge'];
        $this->assertNull(room_pow_check(['c' => $edge, 'n' => $this->solve($edge)], 'c', $now), 'still alive at exactly POW_TTL');
        // Signed for the future (a stockpile against a wrong clock): refused past the 5 s skew.
        $payload = 'v1.' . ($now + 6) . '.c.3.AAAAAAAAAAAAAAAAAAAAAA';
        $future = $payload . '.' . room_pow_mac($payload);
        $this->assertSame($expired, room_pow_check(['c' => $future, 'n' => $this->solve($future)], 'c', $now), 'issued 6 s ahead');
        $payload5 = 'v1.' . ($now + 5) . '.c.3.AAAAAAAAAAAAAAAAAAAAAA';
        $near = $payload5 . '.' . room_pow_mac($payload5);
        $this->assertNull(room_pow_check(['c' => $near, 'n' => $this->solve($near)], 'c', $now), '5 s ahead is clock skew');
        // An old challenge with its issued time edited to now keeps the old MAC: forged.
        $parts = explode('.', $old);
        $parts[1] = (string) $now;
        $edited = implode('.', $parts);
        $this->assertSame([403, 'puzzle-bad', 'That puzzle is not one of ours.'],
            room_pow_check(['c' => $edited, 'n' => $this->solve($edited)], 'c', $now));
    }

    public function testReplayIsRefused(): void
    {
        $now = 1_800_000_000;
        $c = room_pow_issue('c', $now)['challenge'];
        $db = tankity_db();
        $this->assertTrue(tankity_tx($db, fn(PDO $db): bool => room_pow_spend($db, $c)), 'the first use');
        $this->assertTrue(room_pow_spent($c), 'the plain read sees it spent');
        $this->assertFalse(tankity_tx($db, fn(PDO $db): bool => room_pow_spend($db, $c)), 'the second use');
        // Kept until the challenge would have expired anyway, then housekept.
        $exp = (int) $db->query('SELECT exp FROM pow_used')->fetchColumn();
        $this->assertSame($now + POW_TTL, $exp);
        $this->assertSame(0, room_pow_expire($now + POW_TTL));
        $this->assertSame(1, tankity_housekeep($now + POW_TTL + 1, tankity_jobs())['pow']);
        $this->assertFalse(room_pow_spent($c));
    }

    public function testBitsRiseUnderPressure(): void
    {
        $now = time();
        $this->assertSame([9, 10], [room_pow_bits('j', $now), room_pow_bits('c', $now)], 'calm: join at the setting, create one harder');
        // Started matches at 75 % of max_rooms (6 of 8).
        $this->rooms('play', 6, $now);
        $this->assertSame([10, 11], [room_pow_bits('j', $now), room_pow_bits('c', $now)], '75 % of the match slots');
        $this->emptyRooms();
        $this->rooms('lobby', 6, $now);
        $this->assertSame([10, 11], [room_pow_bits('j', $now), room_pow_bits('c', $now)], '75 % of the lobbies');
        $this->emptyRooms();
        // At the cap.
        $this->rooms('shop', 8, $now);
        $this->assertSame([11, 12], [room_pow_bits('j', $now), room_pow_bits('c', $now)], 'every match slot taken');
        $this->emptyRooms();
        $this->rooms('lobby', 8, $now);
        $this->assertSame([11, 12], [room_pow_bits('j', $now), room_pow_bits('c', $now)], 'every lobby taken');
        $this->emptyRooms();
        // A surge of creates from everywhere: 60 within 10 minutes.
        $db = tankity_db();
        for ($i = 0; $i < 59; $i++) {
            room_pow_count_create($db, $now);
        }
        $this->assertSame(9, room_pow_bits('j', $now), '59 creates is no surge');
        room_pow_count_create($db, $now);
        $this->assertSame([10, 11], [room_pow_bits('j', $now), room_pow_bits('c', $now)], 'the 60th create');
        // Everything at once never raises it past +2.
        $this->rooms('play', 8, $now);
        $this->rooms('lobby', 8, $now);
        $this->assertSame([11, 12], [room_pow_bits('j', $now), room_pow_bits('c', $now)], 'at most two bits harder');
        // The surge counts only the last ten minutes' slots.
        $this->emptyRooms();
        $this->assertSame(9, room_pow_bits('j', $now + 2 * RATE_SLOT + 1), 'the surge has passed');
        // The issued challenge carries the bits it was issued at.
        $this->assertSame('10', explode('.', room_pow_issue('j', $now)['challenge'])[3]);
    }

    public function testZeroBitsTurnsItOff(): void
    {
        putenv('TANKITY_POW_BITS=0');
        $now = 1_800_000_000;
        $this->assertNull(room_pow_check(null, 'c', $now));
        $this->assertNull(room_pow_check(null, 'j', $now));
        $this->assertSame(0, room_pow_bits('c', $now));
        $this->assertSame(0, room_pow_issue('c', $now)['bits']);
        // A refused setting is the default, never "off".
        putenv('TANKITY_POW_BITS=lots');
        $this->assertSame(ROOM_POW_BITS, room_pow_bits_setting());
        putenv('TANKITY_POW_BITS=99');
        $this->assertSame(ROOM_POW_BITS, room_pow_bits_setting());
    }

    public function testVectorsMatch(): void
    {
        $v = json_decode((string) file_get_contents(dirname(__DIR__, 2) . '/protocol/pow-vectors.json'), true);
        $this->assertSame(POW_ITER, $v['iter']);
        $this->assertSame(POW_COUNT, $v['count']);
        $this->assertCount(6, $v['challenges']);
        foreach ($v['challenges'] as $case) {
            foreach ($case['probes'] as $p) {
                $this->assertSame($p['lead'], room_pow_lead($case['challenge'], $p['nonce']), $case['challenge'] . ' #' . $p['nonce']);
            }
            $this->assertSame($case['solution'], $this->solveAt($case['challenge'], $v['bits']));
        }
    }

    /** @return list<int> the first POW_COUNT nonces with at least $bits leading zeros */
    private function solveAt(string $challenge, int $bits): array
    {
        $found = [];
        for ($n = 0; count($found) < POW_COUNT; $n++) {
            if (room_pow_lead($challenge, $n) >= $bits) {
                $found[] = $n;
            }
        }
        return $found;
    }
}
