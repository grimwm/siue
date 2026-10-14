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
            $room['seats'][$i] = $i < $humans ? room_seat_human('P' . chr(65 + $i) . 'X', "t$i", []) : room_idle_seat($i, 'ai');
        }
        if ($turnSecs !== null) {
            $room['turnSecs'] = $turnSecs;
        }
        if ($actedAt !== null) {
            $room['actedAt'] = $actedAt;
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

    public function testAnOverRoomUsesTheSameRule(): void
    {
        $room = $this->started('OVER', 'over', 3, 600, 1000);
        $this->assertSame(1000 + 1800, room_expires($room));
        $room['turnSecs'] = 60;
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
        $this->assertSame(0, room_count());
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

    public function testCapCountsOnlyLiveRooms(): void
    {
        $this->save($this->started('LIVE', 'play', 1, 600, time()));
        $this->save($this->started('DEAD', 'play', 1, 60, time() - 5000));
        $this->assertSame(1, room_count());
        $lock = room_alloc(fn() => 'NEWR');
        room_save($lock, $lock->code, room_new('NEWR', 'ABC'));
        $this->assertTrue(room_register('NEWR', 2));
        $this->assertFalse(room_register('NEWR', 1));
        room_discard($lock);
    }

    public function testTheKnobsAreTheLiveWindowAndTheCap(): void
    {
        $this->assertSame(600, room_live_secs());
        $this->assertFalse(function_exists('room_max_age'));
        $this->assertSame(50, ROOM_MAX_ROOMS);
        $this->assertStringContainsString("\nmax_rooms: 50\n", (string) file_get_contents(dirname(__DIR__, 2) . '/.config.yaml'));
    }
}
