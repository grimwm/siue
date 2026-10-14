<?php
// games/tankity/test/php/RoomTurnTimeTest.php
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

/* The room's turn time: the stops, clocks that stamp their own seconds, the
   drone that fires for a player whose time ran out, and room_tick. */
final class RoomTurnTimeTest extends TestCase
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

    /* One human (seat 0) and one drone, the human's turn up. */
    private function playing(int $turnSecs = 120, int $lives = 3): array
    {
        $room = room_new('TURN', 'HOS');
        $room['seats'][0] = room_seat_human('HOS', 't0', [], '');
        $room['seats'][0]['lives'] = $lives;
        $room['seats'][1] = room_idle_seat(1, 'ai');
        $room['seats'][2] = room_idle_seat(2, 'open');
        $room['seats'][3] = room_idle_seat(3, 'open');
        $room['turnSecs'] = $turnSecs;
        room_seat_economy($room, 0);
        room_match_begin($room);
        room_start_round($room);
        $events = [];
        room_advance($room, $events);
        $this->assertSame('human', $room['tanks'][$room['turn']]['kind']);
        return $room;
    }

    private function kinds(array $events): array
    {
        return array_column($events, 't');
    }

    public function testStopsAndDefault(): void
    {
        $this->assertSame([60, 120, 600, 1800, 28800, 86400, 604800], ROOM_TURN_STOPS);
        $this->assertSame(120, ROOM_TURN_DEFAULT);
        $this->assertSame(120, room_turn_secs(room_new('TTTT', 'ABC')));
        $this->assertSame(600, room_turn_secs(['turnSecs' => 600]));
        $this->assertSame(120, room_turn_secs(['turnSecs' => 777]));
    }

    public function testShopSecsFollowTheTurnTime(): void
    {
        $this->assertSame(60, room_shop_secs(60));
        $this->assertSame(90, room_shop_secs(120));
        $this->assertSame(600, room_shop_secs(600));
        $this->assertSame(604800, room_shop_secs(604800));
    }

    public function testClockStampsItsOwnSeconds(): void
    {
        $room = $this->playing(600);
        $left = room_turn_left($room);
        $this->assertEqualsWithDelta(600, $left, 1.0);
        $this->assertSame(600, $room['clock']['secs']);
        $room['turnSecs'] = 60;
        $this->assertEqualsWithDelta(600, room_turn_left($room), 1.0);
    }

    public function testAChangeAppliesFromTheNextTurn(): void
    {
        $room = $this->playing(600);
        room_turn_left($room);
        $room['turnSecs'] = 60;
        $room['shots'] = ($room['shots'] ?? 0) + 1;
        room_turn_left($room);
        $this->assertSame(60, $room['clock']['secs']);
    }

    public function testAnOldClockWithoutSecondsReads120(): void
    {
        $room = $this->playing(600);
        $room['clock'] = ['key' => room_turn_key($room), 'at' => microtime(true) - 30];
        $this->assertEqualsWithDelta(90, room_turn_left($room), 1.0);
    }

    public function testATimedOutTurnIsFiredByADroneAndTheSeatStaysHuman(): void
    {
        $room = $this->playing();
        room_turn_left($room);
        $room['clock']['at'] -= $room['clock']['secs'] + 1;
        $x = $room['tanks'][0]['x'];
        $events = [];
        room_advance($room, $events);
        $autos = array_values(array_filter($events, fn($e) => $e['t'] === 'auto'));
        $this->assertCount(1, $autos);
        $this->assertSame(0, $autos[0]['seat']);
        $this->assertTrue($room['seats'][0]['human']);
        $this->assertSame('human', $room['tanks'][0]['kind']);
        $this->assertSame($autos[0]['a'], round($room['tanks'][0]['angle'], 1));
        $this->assertSame($autos[0]['pw'], round($room['tanks'][0]['power'], 1));
        $this->assertSame($x, $room['tanks'][0]['x'], 'a stand-in never drives');
    }

    /* The human's turn, with the drone's pick forced to the Nuke: it is the
       only gun in the tank's rack besides the Shell, and a "glory" gunner
       takes the heaviest. $stock is the Nuke count in the player's rack. */
    private function nukeRoom(int $round, int $stock, int $tankStock): array
    {
        $room = $this->playing();
        $room['round'] = $round;
        $room['ammo'][0]['nuke'] = $stock;
        $room['tanks'][0]['ammo'] = ['shell' => -1, 'nuke' => $tankStock];
        $room['tanks'][0]['s'] = 'glory';
        $room['weapon'][0] = 'nuke';
        return $room;
    }

    private function timeOut(array &$room): array
    {
        room_turn_left($room);
        $room['clock']['at'] -= 200;
        $events = [];
        room_advance($room, $events);
        return array_values(array_filter($events, fn($e) => $e['t'] === 'auto'))[0];
    }

    public function testTheStandInFiresAStockedUnlockedGunAndSpendsIt(): void
    {
        $room = $this->nukeRoom(4, 2, 2);
        $this->assertSame('nuke', room_ai_choose($room, $room['tanks'][0])['wkey'], 'the scenario makes the drone pick the Nuke');
        $auto = $this->timeOut($room);
        $this->assertSame('nuke', $auto['w']);
        $this->assertSame(1, $room['ammo'][0]['nuke'], 'one round of the rack is spent');
        $this->assertSame(1, $room['tanks'][0]['ammo']['nuke']);
        $this->assertSame('nuke', $room['weapon'][0], 'rounds are left, so the selection stays');
    }

    public function testTheLastRoundSpentFallsTheSelectionBackToShell(): void
    {
        $room = $this->nukeRoom(4, 1, 1);
        $this->assertSame('nuke', $this->timeOut($room)['w']);
        $this->assertSame(0, $room['ammo'][0]['nuke']);
        $this->assertSame('shell', $room['weapon'][0]);
    }

    public function testTheStandInLeavesAStockedGunThatIsNotUnlockedYet(): void
    {
        $room = $this->nukeRoom(1, 1, 1);
        $this->assertSame('nuke', room_ai_choose($room, $room['tanks'][0])['wkey']);
        $auto = $this->timeOut($room);
        $this->assertSame('shell', $auto['w'], 'the Nuke unlocks in round 4');
        $this->assertSame(1, $room['ammo'][0]['nuke'], 'the rack is untouched');
    }

    public function testTheStandInFiresTheShellWhenTheRackIsEmpty(): void
    {
        $room = $this->nukeRoom(4, 0, 1);
        $this->assertSame('nuke', room_ai_choose($room, $room['tanks'][0])['wkey']);
        $this->assertSame('shell', $this->timeOut($room)['w']);
        $this->assertSame(0, $room['ammo'][0]['nuke']);
    }

    public function testTickDue(): void
    {
        $room = $this->playing();
        $this->assertFalse(room_tick_due($room), 'a fresh human turn');
        $stale = $room;
        room_turn_left($stale);
        $stale['clock']['at'] -= $stale['clock']['secs'] + 1;
        $this->assertTrue(room_tick_due($stale), 'the clock ran out');
        $unstamped = $room;
        unset($unstamped['clock']);
        $this->assertTrue(room_tick_due($unstamped), 'never stamped');

        $shop = $this->shopRoom();
        $this->assertFalse(room_tick_due($shop), 'a shop just opened');
        $shop['shop']['at'] -= $shop['shop']['secs'] + 1;
        $this->assertTrue(room_tick_due($shop));

        $lobby = room_new('LOBB', 'ABC');
        $this->assertFalse(room_tick_due($lobby));

        // A drone up: due only once the pace allows (nobody human is standing).
        $drone = $this->playing();
        $drone['tanks'][0]['hp'] = 0;
        $drone['turn'] = 1;
        $this->assertSame('ai', $drone['tanks'][1]['kind']);
        $drone['pace'] = ['at' => microtime(true), 'wait' => 60];
        $this->assertFalse(room_tick_due($drone), 'a drone waits for its pace');
        $drone['pace'] = ['at' => microtime(true) - 61, 'wait' => 60];
        $this->assertTrue(room_tick_due($drone), 'the pace has passed');

        // A dead human holding the turn is the drones' to pass, not a clock.
        $dead = $this->playing();
        $dead['tanks'][0]['hp'] = 0;
        $this->assertTrue(room_tick_due($dead));
    }

    public function testTickAppliesTheTimeout(): void
    {
        $room = $this->playing();
        room_turn_left($room);
        $room['clock']['at'] -= 200;
        $shots = $room['shots'] ?? 0;
        room_tick($room);
        $this->assertGreaterThan($shots, $room['shots']);
        $this->assertContains('auto', $this->kinds($room['events']));
    }

    private function shopRoom(int $turnSecs = 600): array
    {
        $room = $this->playing($turnSecs);
        foreach ($room['tanks'] as &$t) {
            if ($t['kind'] === 'ai') {
                $t['hp'] = 0;
            }
        }
        unset($t);
        $events = [];
        room_end_round($room, $events);
        $this->assertSame('shop', $room['phase']);
        return $room;
    }

    public function testTheShopStampsItsSeconds(): void
    {
        $room = $this->shopRoom(600);
        $this->assertSame(600, $room['shop']['secs']);
        $this->assertEqualsWithDelta(600, room_shop_left($room), 1.0);
        $this->assertSame(90, $this->shopRoom(120)['shop']['secs']);
    }

    public function testMatchEndStampsActedAt(): void
    {
        $room = $this->playing(120, 1);
        $room['actedAt'] = time() - 5000;
        $room['tanks'][0]['hp'] = 0;
        $events = [];
        room_end_round($room, $events);
        $this->assertSame('over', $room['phase']);
        $this->assertGreaterThanOrEqual(time() - 1, $room['actedAt']);
    }

    public function testPlayAgainKeepsTheTurnTime(): void
    {
        $room = $this->playing(28800, 1);
        $room['tanks'][0]['hp'] = 0;
        $events = [];
        room_end_round($room, $events);
        $this->assertTrue(room_again($room));
        $this->assertSame(28800, $room['turnSecs']);
    }
}
