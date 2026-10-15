<?php
// games/tankity/test/php/RoomLobbyPoolTest.php
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

require_once __DIR__ . '/RoomCallTrait.php';

/* Lobbies wait in a pool of their own (max_lobbies, lobbies_per_address) and
   hold no match slot. A full pool makes room by closing a dead, then an idle,
   then an old lobby; a fresh, attended lobby is never closed. Its players hear
   why from a tombstone that answers only to their seat tokens. */
final class RoomLobbyPoolTest extends TestCase
{
    use RoomCallTrait;

    private string $dir;

    private const ENV = ['TANKITY_MAX_LOBBIES' => '6', 'TANKITY_LOBBIES_PER_ADDRESS' => '4', 'TANKITY_MAX_ROOMS' => '2',
        'TANKITY_ROOM_JOINS_PER_HOUR' => '1000', 'TANKITY_ROOM_HOSTS_PER_ADDRESS' => '4', 'TANKITY_ROOM_LIVE_SECS' => '600'];

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

    /** @return array{int, array} a create from address 203.0.113.$n */
    private function createFrom(int $n, string $initials = 'hst'): array
    {
        return $this->call('create', ['initials' => $initials], ['REMOTE_ADDR' => "203.0.113.$n"], self::ENV);
    }

    /** @return list<array> six lobbies, from addresses 1 and 2 */
    private function fill(): array
    {
        $out = [];
        for ($i = 0; $i < 6; $i++) {
            [$st, $made] = $this->createFrom(1 + intdiv($i, 3));
            $this->assertSame(200, $st, json_encode($made));
            $out[] = $made;
        }
        return $out;
    }

    private function exists(string $code): bool
    {
        $q = tankity_db()->prepare('SELECT COUNT(*) FROM rooms WHERE code = ?');
        $q->execute([$code]);
        return (int) $q->fetchColumn() === 1;
    }

    private function ping(): array
    {
        [$st, $out] = $this->call('ping', [], [], self::ENV);
        $this->assertSame(200, $st, json_encode($out));
        return $out;
    }

    public function testLobbiesHoldNoSlot(): void
    {
        $this->fill();
        $ping = $this->ping();
        $this->assertSame(['used' => 0, 'max' => 2], $ping['rooms']);
        $this->assertSame(['used' => 6, 'max' => 6], $ping['lobbies']);
        $this->assertSame(0, room_slots_used());
        $this->assertSame(6, room_lobbies_used());
    }

    public function testFourLobbiesPerAddress(): void
    {
        for ($i = 0; $i < 4; $i++) {
            $this->assertSame(200, $this->createFrom(1)[0]);
        }
        $charged = (int) tankity_db()->query("SELECT COALESCE(SUM(n), 0) FROM rate WHERE kind = 'room'")->fetchColumn();
        $this->assertSame([429, ['error' => 'too many lobbies open from here; start or leave one first']], $this->createFrom(1));
        $this->assertSame($charged, (int) tankity_db()->query("SELECT COALESCE(SUM(n), 0) FROM rate WHERE kind = 'room'")->fetchColumn(),
            'answered before anything is charged');
        $this->assertSame(200, $this->createFrom(2)[0], 'another address opens its own');
    }

    /* A2: addresses fill the pool and keep every lobby heartbeating. A real
       host's fresh, attended lobby is never the one closed, and a newcomer is
       told to wait rather than evicting it. */
    public function testALobbyFloodNeverEvictsAFreshAttendedLobby(): void
    {
        [$st, $real] = $this->createFrom(9, 'rea');
        $this->assertSame(200, $st);
        $flood = [];
        for ($i = 0; $i < 5; $i++) {
            [$st, $made] = $this->createFrom(1 + $i % 2, 'flo');
            $this->assertSame(200, $st, json_encode($made));
            $flood[] = $made['code'];
        }
        // Twenty seconds on, every tab has polled: all six heartbeat.
        foreach ([$real['code'], ...$flood] as $code) {
            room_test_set($code, ['touched' => time() - 1]);
        }
        $charged = (int) tankity_db()->query("SELECT COALESCE(SUM(n), 0) FROM rate WHERE kind = 'room'")->fetchColumn();
        $this->assertSame([409, ['error' => 'Every lobby is busy. Try again in a minute.']], $this->createFrom(3, 'new'));
        $this->assertSame($charged, (int) tankity_db()->query("SELECT COALESCE(SUM(n), 0) FROM rate WHERE kind = 'room'")->fetchColumn(),
            'a full pool with nothing to close is answered before anything is charged');
        $this->assertTrue($this->exists($real['code']), 'the real lobby is still there');
        $this->assertSame(6, room_lobbies_used());
    }

    public function testADeadLobbyGoesFirst(): void
    {
        $l = $this->fill();
        room_test_set($l[2]['code'], ['touched' => time() - 41]); // no tab polls it
        room_test_set($l[0]['code'], ['acted' => time() - 700]);  // polled, but nobody acts
        [$st, $made] = $this->createFrom(3, 'new');
        $this->assertSame(200, $st, json_encode($made));
        $this->assertFalse($this->exists($l[2]['code']), 'the dead lobby made room');
        $this->assertTrue($this->exists($l[0]['code']));
        $this->assertSame(6, room_lobbies_used());

        $seated = ['code' => $l[2]['code'], 'token' => $l[2]['token']];
        $this->assertSame([404, ['error' => 'no such room', 'closed' => 'space']], $this->call('state', $seated, [], self::ENV));
        $this->assertSame([404, ['error' => 'no such room']],
            $this->call('state', ['code' => $l[2]['code'], 'token' => str_repeat('ab', 32)], [], self::ENV), 'a stranger learns nothing');
        $this->assertSame([404, ['error' => 'no such room']], $this->call('state', ['code' => $l[2]['code']], [], self::ENV));
        $this->assertSame([404, ['error' => 'no such room', 'closed' => 'space']],
            $this->call('map', $seated + ['csrf' => $l[2]['csrf'], 'map' => ''], [], self::ENV), 'a gated act hears it too');
        [$st, $mine] = $this->call('mine', ['seats' => [$seated]], [], self::ENV);
        $this->assertSame(200, $st);
        $this->assertSame([['code' => $l[2]['code'], 'gone' => true, 'closed' => 'space']], $mine['rooms']);
        // The tombstone never makes the code joinable or revives the room.
        [$st, $join] = $this->call('join', ['code' => $l[2]['code'], 'initials' => 'gst'], ['REMOTE_ADDR' => '203.0.113.4'], self::ENV);
        $this->assertSame([404, ['error' => 'no such room']], [$st, $join]);
        $this->assertFalse($this->exists($l[2]['code']));
    }

    public function testThenIdleThenOld(): void
    {
        $l = $this->fill();
        room_test_set($l[1]['code'], ['acted' => time() - 601]);
        $this->assertSame(200, $this->createFrom(3, 'new')[0]);
        $this->assertFalse($this->exists($l[1]['code']), 'the idle lobby made room');

        room_test_set($l[3]['code'], ['created' => time() - 1801]);
        $this->assertSame(200, $this->createFrom(3, 'two')[0]);
        $this->assertFalse($this->exists($l[3]['code']), 'then the old one');
        foreach ([0, 2, 4, 5] as $i) {
            $this->assertTrue($this->exists($l[$i]['code']));
        }
    }

    public function testThePickOrdersEachTierByAge(): void
    {
        $l = $this->fill();
        $now = time();
        room_test_set($l[4]['code'], ['created' => $now - 3000]);
        room_test_set($l[5]['code'], ['acted' => $now - 900]);
        room_test_set($l[3]['code'], ['acted' => $now - 1200]);
        room_test_set($l[1]['code'], ['touched' => $now - 50]);
        room_test_set($l[0]['code'], ['touched' => $now - 45]);
        $order = [];
        while (($victim = room_lobby_evict_pick('', $now)) !== null) {
            $order[] = $victim;
            tankity_tx(tankity_db(), fn(PDO $db) => room_tombstone($db, $victim, 'space', $now));
        }
        $this->assertSame(array_map(fn(int $i): string => $l[$i]['code'], [1, 0, 3, 5, 4]), $order);
    }

    public function testPlayAgainTakesALobbyPlace(): void
    {
        [$st, $host] = $this->createFrom(5);
        $this->assertSame(200, $st);
        $this->assertSame(200, $this->call('join', ['code' => $host['code'], 'initials' => 'gst'], ['REMOTE_ADDR' => '203.0.113.6'], self::ENV)[0]);
        $this->gap();
        $seat = ['code' => $host['code'], 'token' => $host['token'], 'csrf' => $host['csrf']];
        $this->assertSame(200, $this->call('start', $seat, ['REMOTE_ADDR' => '203.0.113.5'], self::ENV)[0]);
        [$room, $lock] = room_load($host['code']);
        $room['phase'] = 'over';
        $room['acted'] = time();
        room_save($lock, $host['code'], $room);
        room_unlock($lock);
        $this->fill();
        $this->gap();
        $this->assertSame([409, ['error' => 'Every lobby is busy. Try again in a minute.']],
            $this->call('again', $seat, ['REMOTE_ADDR' => '203.0.113.5'], self::ENV));
        $this->assertSame('over', $this->stored($host['code'])['phase'], 'the refused Play again left the match finished');
    }

    public function testTombstonesBlockTheCodeAndExpire(): void
    {
        $lock = room_alloc(fn() => 'TOMB');
        $room = room_new('TOMB', 'ABC');
        $room['seats'][0] = room_seat_human('ABC', 'tok', [], '');
        room_save($lock, 'TOMB', $room);
        room_unlock($lock);
        $at = time();
        tankity_tx(tankity_db(), fn(PDO $db) => room_tombstone($db, 'TOMB', 'space', $at));
        $this->assertSame('space', room_closed_for('TOMB', 'tok'));
        $this->assertNull(room_closed_for('TOMB', 'other'));
        $this->assertNull(room_closed_for('TOMB', ''));

        $feed = ['TOMB', 'TOMB', 'FRSH'];
        $lock = room_alloc(function () use (&$feed): string {
            return array_shift($feed);
        });
        $this->assertSame('FRSH', $lock->code, 'a tombstoned code is never drawn again');
        room_discard($lock);

        $this->assertSame(0, room_tombstone_expire($at + ROOM_TOMBSTONE_SECS - 1));
        $done = tankity_housekeep($at + ROOM_TOMBSTONE_SECS + 1, tankity_jobs());
        $this->assertSame(1, $done['closed']);
        $this->assertNull(room_closed_for('TOMB', 'tok'));
    }
}
