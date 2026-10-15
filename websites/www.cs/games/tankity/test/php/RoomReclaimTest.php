<?php
// games/tankity/test/php/RoomReclaimTest.php
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

require_once __DIR__ . '/RoomCallTrait.php';

/* Start takes one of max_rooms' match slots. On a full server it closes the
   stalest eligible room instead of refusing: finished first, then stale (idle
   twice its turn time), then dormant (a long room idle an hour), the longest
   idle first within each; a room played within its floor never goes. */
final class RoomReclaimTest extends TestCase
{
    use RoomCallTrait;

    private string $dir;

    private const ENV = ['TANKITY_ROOM_LIVE_SECS' => '600', 'TANKITY_ROOM_JOINS_PER_HOUR' => '1000',
        'TANKITY_ROOM_HOSTS_PER_ADDRESS' => '4', 'TANKITY_LOBBIES_PER_ADDRESS' => '4', 'TANKITY_MAX_LOBBIES' => '100',
        'TANKITY_MAX_ROOMS' => '50'];

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

    /* A stored room with $humans seats, its phase, turn time and last act chosen. */
    private function put(string $code, string $phase, int $turn, int $acted, int $humans = 2): void
    {
        $room = room_new($code, 'HOS');
        $room['phase'] = $phase;
        for ($i = 0; $i < ROOM_SEATS; $i++) {
            $room['seats'][$i] = $i < $humans ? room_seat_human('P' . chr(65 + $i) . 'X', "$code-t$i", [], "a$i") : room_idle_seat($i, 'ai');
        }
        $room['turnSecs'] = $turn;
        $room['acted'] = $acted;
        $lock = room_alloc(fn() => $code);
        $this->assertTrue(room_save($lock, $code, $room));
        room_unlock($lock);
    }

    private function exists(string $code): bool
    {
        $q = tankity_db()->prepare('SELECT COUNT(*) FROM rooms WHERE code = ?');
        $q->execute([$code]);
        return (int) $q->fetchColumn() === 1;
    }

    /** @return list<string> every pick in turn, each tombstoned before the next */
    private function drain(int $now): array
    {
        $out = [];
        while (($victim = room_reclaim_pick('', $now)) !== null) {
            $out[] = $victim;
            tankity_tx(tankity_db(), fn(PDO $db) => room_tombstone($db, $victim, 'space', $now));
        }
        return $out;
    }

    public function testFloor(): void
    {
        $this->assertSame(600, room_reclaim_floor(60));
        $this->assertSame(600, room_reclaim_floor(120));
        $this->assertSame(1200, room_reclaim_floor(600));
        $this->assertSame(3600, room_reclaim_floor(1800));
        $this->assertSame(3600, room_reclaim_floor(28800));
        $this->assertSame(3600, room_reclaim_floor(604800));
    }

    public function testAnActiveRoomIsNeverPicked(): void
    {
        $now = time();
        $this->put('ACT1', 'play', 600, $now - 1199, 4);
        $this->put('ACT2', 'shop', 604800, $now - 3599);
        $this->put('ACT3', 'play', 1800, $now - 3599, 3);
        $this->put('LOBY', 'lobby', 120, $now - 5000, 1);
        $this->assertNull(room_reclaim_pick('', $now));
    }

    public function testFinishedThenStaleThenDormant(): void
    {
        $now = time();
        $this->put('AAAA', 'over', 120, $now - 30);         // finished
        $this->put('BBBB', 'play', 600, $now - 1300, 4);    // stale: idle past twice its 10-min turn
        $this->put('CCCC', 'play', 86400, $now - 18000);    // dormant: the oldest act, a 24 h room idle 5 h
        $this->put('DDDD', 'shop', 1800, $now - 4000, 3);   // stale, idle longer than B
        $this->assertSame(['AAAA', 'DDDD', 'BBBB', 'CCCC'], $this->drain($now));
    }

    /* The fairness requirement: a long game whose players took a turn two
       hours ago outlives a short game nobody has played in twice its turn time. */
    public function testAnActiveLongGameOutlivesAStaleShortOne(): void
    {
        $now = time();
        $this->put('LONG', 'play', 86400, $now - 7200);
        $this->put('SHRT', 'play', 600, $now - 1260, 4);
        $this->assertSame('SHRT', room_reclaim_pick('', $now));
    }

    public function testTiesBreakByCode(): void
    {
        $now = time();
        $this->put('ZZZZ', 'play', 600, $now - 1300, 4);
        $this->put('MMMM', 'play', 600, $now - 1300, 4);
        $this->assertSame('MMMM', room_reclaim_pick('', $now));
        $this->assertSame('ZZZZ', room_reclaim_pick('MMMM', $now), 'the room asking is never its own victim');
    }

    /** @return array{array, array} a lobby hosted from $hostAddr with a guest from $guestAddr */
    private function pair(string $hostAddr, string $guestAddr, int $turn = 120): array
    {
        [$st, $host] = $this->call('create', ['initials' => 'hst', 'turn' => $turn], ['REMOTE_ADDR' => $hostAddr], self::ENV);
        $this->assertSame(200, $st, json_encode($host));
        [$st, $guest] = $this->call('join', ['code' => $host['code'], 'initials' => 'gst'], ['REMOTE_ADDR' => $guestAddr], self::ENV);
        $this->assertSame(200, $st, json_encode($guest));
        return [$host, $guest];
    }

    /** @return array{int, array} the host's Start */
    private function start(array $host, string $addr, array $env = []): array
    {
        return $this->call('start', ['code' => $host['code'], 'token' => $host['token'], 'csrf' => $host['csrf']],
            ['REMOTE_ADDR' => $addr], $env + self::ENV);
    }

    private function used(array $env = []): array
    {
        [$st, $ping] = $this->call('ping', [], [], $env + self::ENV);
        $this->assertSame(200, $st);
        return [$ping['rooms']['used'], $ping['lobbies']['used']];
    }

    private const FULL52 = ['TANKITY_MAX_ROOMS' => '52'];

    /** @return list<array> 52 week-long matches started by 13 hosting addresses, four each, a second address joined to each */
    private function holdEverySlot(): array
    {
        $hosts = [];
        for ($n = 1; $n <= 13; $n++) {
            for ($k = 0; $k < 4; $k++) {
                [$host] = $this->pair("203.0.113.$n", "198.51.100.$n", 604800);
                $hosts[] = $host + ['addr' => "203.0.113.$n"];
            }
        }
        $this->gap();
        foreach ($hosts as $h) {
            [$st, $out] = $this->start($h, $h['addr'], self::FULL52);
            $this->assertSame(200, $st, json_encode($out));
        }
        $this->assertSame([52, 0], $this->used(self::FULL52));
        return $hosts;
    }

    /* A1: thirteen addresses start every slot and leave them idle. Within an
       hour of their last turns a real pair is told to wait; after it, the
       pair's Start closes the stalest held room and plays. */
    public function testThirteenAddressesCannotHoldEverySlot(): void
    {
        $hosts = $this->holdEverySlot();
        [$real, $realGuest] = $this->pair('192.0.2.1', '192.0.2.2');
        $this->gap();
        $this->assertSame([409, ['error' => 'Every match slot is in play. Try again in a few minutes.']], $this->start($real, '192.0.2.1', self::FULL52));
        $this->assertSame([52, 1], $this->used(self::FULL52), 'nothing was closed');

        foreach ($hosts as $h) {
            room_test_age($h['code'], 3601);
        }
        $first = tankity_db()->query("SELECT code FROM rooms WHERE phase = 'play' ORDER BY acted, code LIMIT 1")->fetchColumn();
        $this->gap();
        [$st, $out] = $this->start($real, '192.0.2.1', self::FULL52);
        $this->assertSame(200, $st, json_encode($out));
        $this->assertSame('play', $out['room']['phase']);
        $gone = array_values(array_filter($hosts, fn(array $h): bool => !$this->exists($h['code'])));
        $this->assertCount(1, $gone, 'exactly one held room made space');
        $this->assertSame($first, $gone[0]['code'], 'the one idle longest');
        $this->assertSame([52, 0], $this->used(self::FULL52));
        $this->assertSame([404, ['error' => 'no such room', 'closed' => 'space']],
            $this->call('state', ['code' => $gone[0]['code'], 'token' => $gone[0]['token']], [], self::ENV));
        [$st, $mine] = $this->call('mine', ['seats' => [['code' => $gone[0]['code'], 'token' => $gone[0]['token']]]], [], self::ENV);
        $this->assertSame(200, $st);
        $this->assertSame([['code' => $gone[0]['code'], 'gone' => true, 'closed' => 'space']], $mine['rooms']);
    }

    /* The residual: bots that take a turn in a held room keep it. Thirteen of
       the held rooms have a host aim after the hour; only the other 39 can go. */
    public function testAPlayedHoldIsTheResidual(): void
    {
        $hosts = $this->holdEverySlot();
        foreach ($hosts as $h) {
            room_test_age($h['code'], 3601);
        }
        $played = [];
        foreach (array_chunk($hosts, 4) as $byAddr) {
            $h = $byAddr[0];
            $room = $this->stored($h['code']);
            $this->assertSame(0, $room['tanks'][$room['turn']]['seat'], 'the host is up first');
            [$st, $out] = $this->call('act', ['code' => $h['code'], 'token' => $h['token'], 'csrf' => $h['csrf'], 'kind' => 'aim', 'angle' => 50, 'power' => 60],
                ['REMOTE_ADDR' => $h['addr']], self::FULL52 + self::ENV);
            $this->assertSame(200, $st, json_encode($out));
            $played[] = $h['code'];
        }
        $picked = $this->drain(time());
        $this->assertCount(39, $picked);
        $this->assertSame([], array_values(array_intersect($picked, $played)), 'a room with a turn taken within the hour never goes');
        foreach ($played as $code) {
            $this->assertTrue($this->exists($code));
        }
    }

    /* A Start on a full server never closes a room someone played within its
       floor, however many Starts are tried. */
    public function testAStartNeverEvictsARoomPlayedWithinItsFloor(): void
    {
        $env = ['TANKITY_MAX_ROOMS' => '2'];
        $real = [];
        foreach ([1, 2] as $n) {
            [$host] = $this->pair("192.0.2.$n", "192.0.2.1$n", 600);
            $real[] = $host + ['addr' => "192.0.2.$n"];
        }
        $this->gap();
        foreach ($real as $h) {
            $this->assertSame(200, $this->start($h, $h['addr'], $env)[0]);
            room_test_age($h['code'], 1190); // ten seconds inside the 20-minute floor
        }
        for ($try = 0; $try < 3; $try++) {
            [$att] = $this->pair("203.0.113.$try", "203.0.113.1$try");
            $this->gap();
            $this->assertSame(409, $this->start($att, "203.0.113.$try", $env)[0]);
        }
        foreach ($real as $h) {
            $this->assertTrue($this->exists($h['code']));
            $this->assertSame('play', $this->stored($h['code'])['phase']);
        }
        $this->assertSame(0, (int) tankity_db()->query('SELECT COUNT(*) FROM closed')->fetchColumn());
    }

    /* Promoting a lobby to a match keeps every gate of the other acts: origin,
       seat token, CSRF and host-only all answer before any slot is taken, so
       none of them can close someone's room. */
    public function testStartKeepsItsGatesBeforeTakingASlot(): void
    {
        $env = ['TANKITY_MAX_ROOMS' => '1'];
        [$done] = $this->pair('192.0.2.1', '192.0.2.2');
        $this->gap();
        $this->assertSame(200, $this->start($done, '192.0.2.1', $env)[0]);
        [$room, $lock] = room_load($done['code']);
        $room['phase'] = 'over';
        room_save($lock, $done['code'], $room);
        room_unlock($lock);
        [$host, $guest] = $this->pair('203.0.113.1', '203.0.113.2');
        $this->gap();
        $seat = ['code' => $host['code'], 'token' => $host['token'], 'csrf' => $host['csrf']];
        $tries = [
            [403, 'bad origin', $seat, ['HTTP_ORIGIN' => 'https://evil.example']],
            [401, 'bad seat token', ['token' => str_repeat('ab', 32)] + $seat, []],
            [403, 'bad csrf token', ['csrf' => 'nope'] + $seat, []],
            [403, 'only the host starts the match', ['code' => $host['code'], 'token' => $guest['token'], 'csrf' => $guest['csrf']], []],
        ];
        foreach ($tries as [$want, $line, $body, $server]) {
            $this->assertSame([$want, ['error' => $line]], $this->call('start', $body, $server + ['REMOTE_ADDR' => '203.0.113.1'], $env + self::ENV));
            $this->gap();
        }
        $this->assertTrue($this->exists($done['code']), 'no refused Start closed the finished match');
        $this->assertSame(0, (int) tankity_db()->query('SELECT COUNT(*) FROM closed')->fetchColumn());
        $this->assertSame('lobby', $this->stored($host['code'])['phase']);
        $this->assertSame(200, $this->start($host, '203.0.113.1', $env)[0], 'the host\'s own Start reclaims it');
        $this->assertFalse($this->exists($done['code']));
    }

    public function testTheHostingCapCountsStartedMatches(): void
    {
        for ($k = 0; $k < 4; $k++) {
            [$host] = $this->pair('203.0.113.1', "198.51.100.$k");
            $this->gap();
            $this->assertSame(200, $this->start($host, '203.0.113.1')[0]);
        }
        [$fifth] = $this->pair('203.0.113.1', '198.51.100.9');
        $this->gap();
        $this->assertSame([429, ['error' => 'too many matches hosted from here; finish or leave one first']], $this->start($fifth, '203.0.113.1'));
        $this->assertSame('lobby', $this->stored($fifth['code'])['phase']);
        // Lobbies are their own allowance: three more open, the next is refused.
        for ($k = 0; $k < 3; $k++) {
            $this->assertSame(200, $this->call('create', ['initials' => 'hst'], ['REMOTE_ADDR' => '203.0.113.1'], self::ENV)[0]);
        }
        $this->assertSame(429, $this->call('create', ['initials' => 'hst'], ['REMOTE_ADDR' => '203.0.113.1'], self::ENV)[0]);
    }

    public function testPlayAgainGivesTheSlotBack(): void
    {
        [$host] = $this->pair('203.0.113.1', '203.0.113.2');
        $this->gap();
        $this->assertSame(200, $this->start($host, '203.0.113.1')[0]);
        [$room, $lock] = room_load($host['code']);
        $room['phase'] = 'over';
        $room['acted'] = time();
        room_save($lock, $host['code'], $room);
        room_unlock($lock);
        $this->assertSame([1, 0], $this->used());
        $this->gap();
        $this->assertSame(200, $this->call('again', ['code' => $host['code'], 'token' => $host['token'], 'csrf' => $host['csrf']],
            ['REMOTE_ADDR' => '203.0.113.1'], self::ENV)[0]);
        $this->assertSame([0, 1], $this->used());
    }

    /* Two Starts racing for the last slot: one plays, the other is told to
       wait, and the cap holds. */
    public function testTwoStartsRacingForTheLastSlotCannotBothWin(): void
    {
        $env = ['TANKITY_MAX_ROOMS' => '2'];
        [$held] = $this->pair('192.0.2.9', '192.0.2.19');
        $this->gap();
        $this->assertSame(200, $this->start($held, '192.0.2.9', $env)[0]);
        [$a] = $this->pair('203.0.113.1', '203.0.113.2');
        [$b] = $this->pair('203.0.113.3', '203.0.113.4');
        $this->gap();
        $runs = [$this->launch('start', ['code' => $a['code'], 'token' => $a['token'], 'csrf' => $a['csrf']], ['REMOTE_ADDR' => '203.0.113.1'], $env + self::ENV),
            $this->launch('start', ['code' => $b['code'], 'token' => $b['token'], 'csrf' => $b['csrf']], ['REMOTE_ADDR' => '203.0.113.3'], $env + self::ENV)];
        $codes = array_map(fn(array $r): int => $this->collect($r)[0], $runs);
        sort($codes);
        $this->assertSame([200, 409], $codes);
        $this->assertSame([2, 1], $this->used($env));
        $this->assertTrue($this->exists($held['code']), 'the active match was never a victim');
    }

    /* Two Starts racing on a full server with one reclaimable room: the room
       is closed once, for one of them; the other is told to wait. */
    public function testTwoStartsCannotReclaimTheSameRoomTwice(): void
    {
        $env = ['TANKITY_MAX_ROOMS' => '2'];
        $held = [];
        foreach ([1, 2] as $n) {
            [$h] = $this->pair("192.0.2.$n", "192.0.2.1$n", 600);
            $held[] = $h + ['addr' => "192.0.2.$n"];
        }
        $this->gap();
        foreach ($held as $h) {
            $this->assertSame(200, $this->start($h, $h['addr'], $env)[0]);
        }
        [$room, $lock] = room_load($held[0]['code']);
        $room['phase'] = 'over';
        $room['acted'] = time();
        room_save($lock, $held[0]['code'], $room);
        room_unlock($lock);
        [$a] = $this->pair('203.0.113.1', '203.0.113.2');
        [$b] = $this->pair('203.0.113.3', '203.0.113.4');
        $this->gap();
        $runs = [$this->launch('start', ['code' => $a['code'], 'token' => $a['token'], 'csrf' => $a['csrf']], ['REMOTE_ADDR' => '203.0.113.1'], $env + self::ENV),
            $this->launch('start', ['code' => $b['code'], 'token' => $b['token'], 'csrf' => $b['csrf']], ['REMOTE_ADDR' => '203.0.113.3'], $env + self::ENV)];
        $codes = array_map(fn(array $r): int => $this->collect($r)[0], $runs);
        sort($codes);
        $this->assertSame([200, 409], $codes);
        $this->assertSame([2, 1], $this->used($env));
        $this->assertFalse($this->exists($held[0]['code']), 'the finished match made space');
        $this->assertTrue($this->exists($held[1]['code']), 'the running one did not');
        $this->assertSame(1, (int) tankity_db()->query('SELECT COUNT(*) FROM closed')->fetchColumn());
    }
}
