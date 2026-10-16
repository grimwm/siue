<?php
// games/tankity/test/php/RoomIdleTest.php
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

/* When a room closes: a lobby lives on touches, a started room on the last
   human act (humans x turn time, never under the live window), no age cap. */
final class RoomIdleTest extends TestCase
{
    private string $dir;

    public static function setUpBeforeClass(): void
    {
        require_once __DIR__ . '/rooms-lib.php';
    }

    protected function setUp(): void
    {
        $this->dir = tankity_test_dir();
        putenv('TANKITY_ROOM_LIVE_SECS=600');
        putenv('TANKITY_ROOM_HOSTS_PER_ADDRESS'); // the docker stacks lift the cap
    }

    protected function tearDown(): void
    {
        room_release_all();
        putenv('TANKITY_ROOM_LIVE_SECS');
        tankity_test_rm($this->dir);
    }

    private function started(string $code, string $phase, int $humans, ?int $turnSecs, ?int $actedAt): array
    {
        $room = room_new($code, 'HOS');
        $room['phase'] = $phase;
        for ($i = 0; $i < ROOM_SEATS; $i++) {
            $room['seats'][$i] = $i < $humans ? room_seat_human('P' . chr(65 + $i) . 'X', "t$i", [], '') : room_idle_seat($i, 'ai');
        }
        if ($turnSecs !== null) {
            $room['turnSecs'] = $turnSecs;
        }
        if ($actedAt !== null) {
            $room['acted'] = $actedAt;
        }
        return $room;
    }

    private function save(array $room): void
    {
        $lock = room_alloc(fn() => $room['code']);
        $this->assertTrue(room_save($lock, $lock->code, $room));
        room_unlock($lock);
    }

    public function testALobbyLivesOnTouches(): void
    {
        $room = room_new('LOBB', 'ABC');
        $room['touched'] = 1000;
        $this->assertSame(1600, room_expires($room));
    }

    public function testAStartedRoomLivesHumansTimesTurnTime(): void
    {
        $room = $this->started('PLAY', 'play', 2, 28800, 1000);
        $this->assertSame(1000 + 57600, room_expires($room));
    }

    public function testTheLiveWindowIsTheFloor(): void
    {
        $room = $this->started('FLOR', 'play', 2, 60, 1000);
        $this->assertSame(1600, room_expires($room));
    }

    public function testAFinishedMatchLivesTheLiveWindowOnly(): void
    {
        // The final standings stay up one live window, never a week-long idle limit.
        $room = $this->started('OVER', 'over', 3, 604800, 1000);
        $room['seats'][0]['addr'] = 'a';
        $room['seats'][1]['addr'] = 'b';
        $room['seats'][2]['addr'] = 'c';
        $this->assertSame(1000 + 600, room_expires($room));
    }

    public function testAnOldRoomReadsActedAtAsTouched(): void
    {
        $room = $this->started('OLDR', 'play', 1, null, null);
        $room['touched'] = 5000;
        $this->assertSame(5600, room_expires($room));
    }

    public function testNoTotalAgeCap(): void
    {
        $room = $this->started('LONG', 'play', 1, 604800, time());
        $room['created'] = time() - 30 * 86400;
        $room['touched'] = time();
        $this->assertFalse(room_idle($room));
    }

    public function testPollsDoNotKeepAStartedRoomAlive(): void
    {
        $room = $this->started('POLL', 'play', 1, 60, time() - 700);
        $this->save($room); // room_save touches the room now, as a poll does
        $this->assertTrue(room_idle(room_decode(tankity_db()->query("SELECT data FROM rooms WHERE code = 'POLL'")->fetchColumn())));
        $this->assertSame(0, $this->live());
    }

    public function testTheColumnFollowsTheRoom(): void
    {
        $room = $this->started('COLM', 'play', 2, 600, time());
        $this->save($room);
        $q = tankity_db()->prepare('SELECT data, expires FROM rooms WHERE code = ?');
        $q->execute(['COLM']);
        [$data, $expires] = $q->fetch(PDO::FETCH_NUM);
        $this->assertSame(room_expires(room_decode($data)), (int) $expires);
        $this->assertSame(0, room_sweep(time()));
        $this->assertSame(1, room_sweep(time() + 10 ** 7));
        $this->assertSame(0, (int) tankity_db()->query('SELECT COUNT(*) FROM rooms')->fetchColumn());
    }

    private function live(): int
    {
        return (int) tankity_db()->query('SELECT COUNT(*) FROM rooms WHERE expires >= ' . time())->fetchColumn();
    }

    public function testCountsSeeOnlyLiveRooms(): void
    {
        $this->save($this->started('LIVE', 'play', 1, 600, time()));
        $this->save($this->started('DEAD', 'play', 1, 60, time() - 5000));
        $this->save($this->started('OVRL', 'over', 2, 600, time()));
        $this->save($this->started('LOBB', 'lobby', 1, 600, time()));
        $this->assertSame(3, $this->live(), 'a dead room is not counted');
    }

    public function testTheKnobIsTheLiveWindow(): void
    {
        $this->assertSame(600, room_live_secs());
        $this->assertFalse(function_exists('room_max_age'));
    }

    private function seatsFrom(array $room, array $addrs): array
    {
        foreach ($addrs as $i => $addr) {
            $room['seats'][$i] = room_seat_human('P' . chr(65 + $i) . 'X', "t$i", [], $addr);
        }
        return $room;
    }

    /* Two seats behind one address (friends on one campus network) earn a
       turn each: a started room has its humans by construction. */
    public function testIdleLimitIsHumansTimesTurnTime(): void
    {
        $two = $this->seatsFrom($this->started('TWOS', 'play', 0, 86400, 1000), ['aaaa', 'aaaa']);
        $this->assertSame(172800, room_idle_limit($two));
        $one = $this->seatsFrom($this->started('ONES', 'play', 0, 86400, 1000), ['aaaa']);
        $this->assertSame(86400, room_idle_limit($one));
        $lightning = $this->seatsFrom($this->started('LITE', 'play', 0, 60, 1000), ['aaaa']);
        $this->assertSame(600, room_idle_limit($lightning));
    }

    public function testOneAddressCannotHostMoreThanItsShare(): void
    {
        foreach (['H1', 'H2', 'H3', 'H4', 'H5'] as $i => $c) {
            $room = $this->started($c . 'XX', 'play', 1, 604800, time());
            $room['hostKey'] = 'aaaa';
            $this->save($room);
        }
        $other = $this->started('OTHR', 'lobby', 1, null, time());
        $other['hostKey'] = 'bbbb';
        $this->save($other);
        $this->assertSame(4, room_hosts_per_address());
        $this->assertSame(5, room_hosted('aaaa'));
        $this->assertSame(4, room_hosted('aaaa', 'H1XX'));
        $this->assertSame(0, room_hosted('bbbb'), 'a lobby is no hosted match');
        $this->assertSame(1, room_lobbies_hosted('bbbb'));
        $this->assertSame(0, room_hosted(''));
        // Expired rooms stop counting: a one-human week room expires a week after its last turn.
        room_test_age('H1XX', 604801);
        room_test_age('H2XX', 604801);
        $this->assertSame(3, room_hosted('aaaa'));
    }

    public function testTheSnapshotAndTheMineRowCarryWhenTheRoomCloses(): void
    {
        $lobby = $this->started('EXPA', 'lobby', 1, null, null);
        $lobby['touched'] = 1_800_000_000;
        $this->assertSame(1_800_000_600, room_snapshot($lobby, 0, 0)['expiresAt']);

        $play = $this->started('EXPB', 'play', 2, 600, 1_800_000_000);
        $play['seats'][1]['addr'] = 'other';
        $play['seats'][0]['addr'] = 'one';
        $expected = 1_800_000_000 + 2 * 600;
        $this->assertSame($expected, room_expires($play));
        $this->assertSame($expected, room_snapshot($play, null, 0)['expiresAt'], 'a watcher gets it too');
        $this->assertSame($expected, room_mine_row($play, 0)['expiresAt']);
    }

    public function testClosesInIsSecondsFromNowSoAClientClockNeverMatters(): void
    {
        $play = $this->started('EXPC', 'play', 2, 600, time() - 100);
        $play['seats'][1]['addr'] = 'other';
        $play['seats'][0]['addr'] = 'one';
        $want = room_expires($play) - time();
        $this->assertEqualsWithDelta($want, room_snapshot($play, 0, 0)['closesIn'], 1);
        $this->assertEqualsWithDelta($want, room_mine_row($play, 0)['closesIn'], 1);
        $this->assertSame(0, room_closes_in($play, room_expires($play) + 50), 'never negative');
        $this->assertSame(30, room_closes_in($play, room_expires($play) - 30));
    }
}
