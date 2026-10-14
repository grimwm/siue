<?php
// games/tankity/test/php/RoomEarthTest.php
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

/* The earth in a room: burial (a ground unit under risen ground stays where
   it is until a new round; drones ride the ground up) and the earth guns'
   volleys (src/sim.ts is the same rules; the sim vectors pin them). */
final class RoomEarthTest extends TestCase
{
    public static function setUpBeforeClass(): void
    {
        require_once __DIR__ . '/rooms-lib.php';
    }

    /** A flat field at 400; seat i is tank i. */
    private function room(array $tanks): array
    {
        $room = ['terrain' => array_fill(0, 720, 400.0), 'tanks' => [], 'scores' => [], 'cash' => [], 'stats' => [], 'ammo' => [],
            'shield' => [], 'bunker' => [], 'laststand' => [], 'chutes' => [], 'seats' => [], 'round' => 1, 'wind' => 0, 'rng' => 7];
        foreach ($tanks as $i => $t) {
            $room['tanks'][$i] = $t + ['seat' => $i, 'name' => 'T' . $i, 'angle' => 45.0, 'power' => 50.0, 'hp' => 100, 'maxHp' => 100,
                'fuel' => 80.0, 'dirS' => 1, 'ammo' => []];
            $room['scores'][$i] = 0;
            $room['cash'][$i] = 0;
        }
        return $room;
    }

    public function testFreshDirtBuriesAHumanAndTheSettleLeavesItThere(): void
    {
        $room = $this->room([['kind' => 'human', 'x' => 300.0, 'y' => 400.0], ['kind' => 'ai', 'x' => 500.0, 'y' => 400.0]]);
        room_add_dirt($room['terrain'], 300.0, 400.0, 35.0);
        $this->assertTrue(room_buried($room['tanks'][0], $room['terrain']));
        $events = [];
        room_settle_tanks($room, $events);
        $this->assertSame(400.0, $room['tanks'][0]['y']);
        $this->assertSame([], $events);
    }

    public function testADroneUnderFreshDirtRidesUpAndIsNeverBuried(): void
    {
        $room = $this->room([['kind' => 'human', 'x' => 100.0, 'y' => 400.0], ['kind' => 'ai', 'x' => 300.0, 'y' => 400.0]]);
        room_add_dirt($room['terrain'], 300.0, 400.0, 35.0);
        $this->assertFalse(room_buried($room['tanks'][1], $room['terrain']));
        room_settle_tanks($room);
        $this->assertSame(365.0, $room['tanks'][1]['y']);
        $this->assertSame(100, $room['tanks'][1]['hp']);
    }

    public function testABuriedTankCannotDrive(): void
    {
        $room = $this->room([['kind' => 'human', 'x' => 300.0, 'y' => 400.0], ['kind' => 'ai', 'x' => 500.0, 'y' => 400.0]]);
        room_add_dirt($room['terrain'], 300.0, 400.0, 35.0);
        $this->assertSame([409, 'You are buried: dig out first (a Riot Charge or a digger).'], room_drive($room, 0, 20.0));
        $this->assertSame(300.0, $room['tanks'][0]['x']);
        $this->assertSame(80.0, $room['tanks'][0]['fuel']);
        $room['terrain'] = array_fill(0, 720, 400.0);
        $this->assertNull(room_drive($room, 0, 20.0));
        $this->assertSame(320.0, $room['tanks'][0]['x']);
        $this->assertSame(60.0, $room['tanks'][0]['fuel']);
    }

    public function testANewRoundPlacesEveryUnitOnTheFreshHills(): void
    {
        $room = room_new('EARTH', 'AAA');
        $room['seats'] = [room_seat_human('AAA', 'tok', [], ''), room_idle_seat(1), room_idle_seat(2, 'open'), room_idle_seat(3, 'open')];
        room_seat_economy($room, 0);
        room_start_round($room);
        foreach ($room['tanks'] as $i => $t) {
            $room['tanks'][$i]['y'] += 30;
        }
        room_start_round($room);
        foreach ($room['tanks'] as $t) {
            $this->assertSame((float) room_surf_y($room['terrain'], (float) $t['x']), (float) $t['y']);
        }
    }
}
