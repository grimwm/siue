<?php
// games/tankity/test/php/RoomSpeedTest.php
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

/* The room's game speed: the host's action (room_set_speed, what rooms.php
   action=speed runs), the snapshot's field, a room from before the setting,
   and the drones' pacing, which waits that fraction while the war itself
   stays the same at every speed. */
final class RoomSpeedTest extends TestCase
{
    private string $dir;

    public static function setUpBeforeClass(): void
    {
        require_once __DIR__ . '/rooms-lib.php';
    }

    protected function setUp(): void
    {
        $this->dir = tankity_test_dir();
    }

    protected function tearDown(): void
    {
        tankity_test_rm($this->dir);
    }

    /* The host (seat 0) and a guest (seat 1), two drones, the match on. */
    private function playing(): array
    {
        $room = room_new('FAST', 'HOS');
        $room['seats'][0] = room_seat_human('HOS', 't0', [], '');
        $room['seats'][1] = room_seat_human('GST', 't1', [], '');
        $room['seats'][2] = room_idle_seat(2, 'ai');
        $room['seats'][3] = room_idle_seat(3, 'ai');
        room_seat_economy($room, 0);
        room_seat_economy($room, 1);
        room_match_begin($room);
        room_start_round($room);
        return $room;
    }

    private function speedEvents(array $room): array
    {
        return array_values(array_filter($room['events'], fn($e) => ($e['t'] ?? '') === 'speed'));
    }

    public function testTheSpeedsAndARoomFromBeforeTheSettingReads1(): void
    {
        $this->assertSame([1, 2, 4], ROOM_SPEEDS);
        $this->assertSame(1, room_speed(room_new('NEWR', 'ABC')));
        $old = room_new('OLDR', 'ABC');
        unset($old['speed']);
        $this->assertSame(1, room_speed($old));
        $this->assertSame(4, room_speed(['speed' => 4]));
        foreach ([3, 0, -1, '2', 2.0, null, 'fast'] as $odd) {
            $this->assertSame(1, room_speed(['speed' => $odd]), var_export($odd, true));
        }
    }

    public function testOnlyTheHostSetsIt(): void
    {
        $room = $this->playing();
        $this->assertSame(403, room_set_speed($room, 1, 2)[0] ?? null);
        $this->assertSame(1, room_speed($room));
        $this->assertSame([], $this->speedEvents($room));
    }

    public function testOnlyToASpeed(): void
    {
        $room = $this->playing();
        foreach ([3, 8, 0, '4', 2.0, null] as $odd) {
            $refused = room_set_speed($room, 0, $odd);
            $this->assertSame(422, $refused[0] ?? null, var_export($odd, true));
        }
        $this->assertSame(1, room_speed($room));
    }

    public function testTheHostSetsItMidPlayWithOneLineForEveryone(): void
    {
        $room = $this->playing();
        $this->assertNull(room_set_speed($room, 0, 4));
        $this->assertSame(4, room_speed($room));
        $said = $this->speedEvents($room);
        $this->assertCount(1, $said);
        $this->assertSame(0, $said[0]['seat']);
        $this->assertSame(4, $said[0]['speed']);
        // The same speed again changes nothing and says nothing.
        $this->assertNull(room_set_speed($room, 0, 4));
        $this->assertCount(1, $this->speedEvents($room));
        // Every seat's snapshot carries it.
        $this->assertSame(4, room_snapshot($room, 1, 0)['speed']);
        $this->assertSame(4, room_snapshot($room, null, 0)['speed']);
    }

    public function testASnapshotOfARoomFromBeforeTheSettingSays1(): void
    {
        $room = $this->playing();
        unset($room['speed']);
        $this->assertSame(1, room_snapshot($room, 0, 0)['speed']);
    }

    public function testTheDronesPacedTurnsWaitTheSpeedsFraction(): void
    {
        $room = $this->playing();
        $room['pace'] = ['at' => microtime(true) - 1.0, 'wait' => 3.0];
        $this->assertFalse(room_pace_ready($room), '1×: 3 s');
        $room['speed'] = 2;
        $this->assertFalse(room_pace_ready($room), '2×: 1.5 s');
        $room['speed'] = 4;
        $this->assertTrue(room_pace_ready($room), '4×: 0.75 s');
        // A change mid-wait counts at once, as it does on the clients.
        $room['speed'] = 1;
        $this->assertFalse(room_pace_ready($room));
    }

    public function testTheWarIsTheSameAtEverySpeed(): void
    {
        // Every human down: the drones play on, one paced turn at a time.
        $base = $this->playing();
        foreach ($base['tanks'] as $i => $t) {
            if ($t['kind'] === 'human') {
                $base['tanks'][$i]['hp'] = 0;
            }
        }
        $runs = [];
        foreach (ROOM_SPEEDS as $speed) {
            $room = $base;
            $room['speed'] = $speed;
            $events = [];
            room_advance($room, $events);
            $this->assertNotEmpty($events, "{$speed}×: a drone fired");
            // The volley's stamps ('at', 't1') and the paced wait stay in the war's own seconds.
            $runs[$speed] = [$events, $room['terrain'], array_column($room['tanks'], 'hp'), $room['pace']['wait']];
        }
        $this->assertSame($runs[1], $runs[2]);
        $this->assertSame($runs[1], $runs[4]);
    }
}
