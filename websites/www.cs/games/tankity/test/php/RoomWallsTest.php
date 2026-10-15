<?php
// games/tankity/test/php/RoomWallsTest.php
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

require_once __DIR__ . '/RoomCallTrait.php';

/* The arena's walls on the server (server/walls.php): each wall's step, roll
   and pool, the flights that meet them, and the host's pick (room_set_walls,
   what rooms.php action=walls runs) with its gates: origin, CSRF, seat token,
   host only, the act throttle, and never during a round. src/walls.ts is held
   to the same numbers by the `walls` sim vectors. */
final class RoomWallsTest extends TestCase
{
    use RoomCallTrait;

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

    /** The first gun that does $effect: tests pick guns by what they do, never by key. */
    private function gunOf(string $effect, bool $missile = false): string
    {
        foreach (room_weapons() as $k => $def) {
            if (($def['effect'] ?? 'shot') === $effect && !empty($def['missile']) === $missile) {
                return $k;
            }
        }
        $this->fail("no $effect gun");
    }

    /* ---- the walls themselves ---- */

    public function testRubberAndSpringBounceAShellBackAcrossTheWall(): void
    {
        foreach (['rubber' => ROOM_RUBBER_KEEP, 'spring' => ROOM_SPRING_KICK] as $walls => $keep) {
            [$x, $y, $vx] = [722.0, 200.0, 300.0];
            $this->assertSame(ROOM_WALL_BOUNCE, room_wall_step($x, $y, $vx, $walls, 720, 717.0, 202.0));
            $this->assertSame([716.0, 200.0, -300.0 * $keep], [$x, $y, $vx], $walls);
            [$x, $y, $vx] = [-4.0, 90.0, -200.0];
            $this->assertSame(ROOM_WALL_BOUNCE, room_wall_step($x, $y, $vx, $walls, 720, 1.0, 89.0));
            $this->assertSame([4.0, 90.0, 200.0 * $keep], [$x, $y, $vx], $walls);
        }
        $this->assertLessThan(1.0, ROOM_RUBBER_KEEP);
        $this->assertGreaterThan(1.0, ROOM_SPRING_KICK);
    }

    public function testWraparoundCarriesAShellToTheOtherSideAtTheSameHeightAndSpeed(): void
    {
        [$x, $y, $vx] = [723.5, 150.0, 260.0];
        $this->assertSame(ROOM_WALL_WRAP, room_wall_step($x, $y, $vx, 'wrap', 720, 719.0, 151.0));
        $this->assertSame([3.5, 150.0, 260.0], [$x, $y, $vx]);
        [$x, $y, $vx] = [-2.0, 80.0, -90.0];
        $this->assertSame(ROOM_WALL_WRAP, room_wall_step($x, $y, $vx, 'wrap', 720, 2.0, 79.0));
        $this->assertSame([718.0, 80.0, -90.0], [$x, $y, $vx]);
    }

    public function testConcreteStopsAShellOnTheWallAtTheHeightItCrossed(): void
    {
        [$x, $y, $vx] = [724.0, 210.0, 300.0];
        $this->assertSame(ROOM_WALL_BURST, room_wall_step($x, $y, $vx, 'concrete', 720, 714.0, 200.0));
        $this->assertSame(719.0, $x);
        $this->assertEqualsWithDelta(205.0, $y, 1e-12);
    }

    public function testNoneLeavesTheSidesOpen(): void
    {
        [$x, $y, $vx] = [723.0, 200.0, 300.0];
        $this->assertSame(ROOM_WALL_NONE, room_wall_step($x, $y, $vx, 'none', 720, 718.0, 202.0));
        $this->assertSame([723.0, 200.0, 300.0], [$x, $y, $vx]);
    }

    public function testAFullPowerShellAtTheNearWallPerWall(): void
    {
        $flat = array_fill(0, 720, 400.0);
        $shell = $this->gunOf('shot');
        [$mx, $my] = room_muzzle(['x' => 650.0, 'y' => 400.0, 'angle' => 45.0, 'dirS' => 1, 'kind' => 'human']);
        $shot = fn(string $walls): array => room_sim_shot($flat, 0.0, $mx, $my, 45.0, 100.0, $shell, 1, 720, -INF, $walls);
        $this->assertTrue($shot('none')['oob'], 'None: off the field');
        $concrete = $shot('concrete');
        $this->assertFalse($concrete['oob']);
        $this->assertSame(719.0, $concrete['x']);
        $this->assertLessThan(400.0, $concrete['y'], 'on the wall, over the ground');
        $rubber = $shot('rubber');
        $spring = $shot('spring');
        foreach (['rubber' => $rubber, 'spring' => $spring] as $walls => $land) {
            $this->assertFalse($land['oob'], $walls);
            $this->assertLessThan(650.0, $land['x'], "$walls: back past its gunner");
        }
        $this->assertLessThan($rubber['x'], $spring['x'], 'the spring throws it further');
        $wrap = $shot('wrap');
        $this->assertFalse($wrap['oob']);
        $this->assertLessThan(650.0, $wrap['x']);
        $this->assertGreaterThan(0.0, $wrap['vx'], 'still heading right, in from the left');
    }

    public function testAMissileAtFullPowerKeepsItsReachAndMeetsTheWallsOnlyAtTheEdge(): void
    {
        $flat = array_fill(0, 720, 400.0);
        $missile = $this->gunOf('shot', true);
        [$mx, $my] = room_muzzle(['x' => 200.0, 'y' => 400.0, 'angle' => 45.0, 'dirS' => 1, 'kind' => 'human']);
        $open = room_sim_shot($flat, 0.0, $mx, $my, 45.0, 60.0, $missile, 1, 720);
        foreach (ROOM_WALLS as $walls) {
            $this->assertSame($open, room_sim_shot($flat, 0.0, $mx, $my, 45.0, 60.0, $missile, 1, 720, -INF, $walls), "$walls: the open-field landing");
        }
        $this->assertTrue(room_sim_shot($flat, 0.0, $mx, $my, 45.0, 100.0, $missile, 1, 720)['oob']);
        $rubber = room_sim_shot($flat, 0.0, $mx, $my, 45.0, 100.0, $missile, 1, 720, -INF, 'rubber');
        $this->assertFalse($rubber['oob']);
        $this->assertGreaterThan(200.0, $rubber['x']);
        $this->assertLessThan(719.0, $rubber['x']);
        $wrap = room_sim_shot($flat, 0.0, $mx, $my, 45.0, 100.0, $missile, 1, 720, -INF, 'wrap');
        $this->assertFalse($wrap['oob']);
        $this->assertLessThan(200.0, $wrap['x']);
    }

    public function testARollerRollsBackOffRubberAndOnThroughWraparound(): void
    {
        $flat = array_fill(0, 720, 400.0);
        $roller = room_weapons()[$this->gunOf('roller')];
        $this->assertSame(719.0, room_roll_out($flat, 700.0, 200.0, 10.0, $roller, 'none')[0]);
        $this->assertSame(719.0, room_roll_out($flat, 700.0, 200.0, 10.0, $roller, 'concrete')[0]);
        $this->assertLessThan(719.0, room_roll_out($flat, 700.0, 200.0, 10.0, $roller, 'rubber')[0]);
        $this->assertLessThan(300.0, room_roll_out($flat, 700.0, 200.0, 10.0, $roller, 'wrap')[0]);
    }

    public function testNapalmPoolsAgainstASolidWallAndSpillsPastAnOpenEdge(): void
    {
        $slope = [];
        for ($x = 0; $x < 720; $x++) {
            $slope[] = 300 + 120 * $x / 719;
        }
        $w = room_weapons()[$this->gunOf('napalm')];
        $open = room_fire_pool($slope, 700.0, (float) $w['volume'], (float) $w['flame'], (float) $w['poolMin']);
        $this->assertLessThanOrEqual(1, max(0, $open['x1'] - $open['x0'] + 1), 'None: it runs off');
        foreach (ROOM_WALLS as $walls) {
            $p = room_fire_pool($slope, 700.0, (float) $w['volume'], (float) $w['flame'], (float) $w['poolMin'], room_walls_dam($walls));
            $pooled = $p['x1'] - $p['x0'] + 1 > 1;
            $this->assertSame(in_array($walls, ['concrete', 'rubber', 'spring'], true), $pooled, $walls);
            if ($pooled) {
                $this->assertSame(719, $p['x1'], "$walls: against the wall");
            }
        }
    }

    public function testRandomDrawsOneRealWallAndNothingElseDraws(): void
    {
        $seen = [];
        $rng = 11;
        for ($i = 0; $i < 200; $i++) {
            $seen[room_walls_for('random', $rng)] = true;
        }
        $this->assertEqualsCanonicalizing(ROOM_REAL_WALLS, array_keys($seen));
        foreach (ROOM_WALLS as $walls) {
            $rng = 11;
            $this->assertSame($walls, room_walls_for($walls, $rng));
            $this->assertSame(11, $rng, "$walls draws nothing");
        }
    }

    /* ---- the room's setting ---- */

    /* The host (seat 0) and a guest (seat 1), two drones; still in the lobby. */
    private function lobby(): array
    {
        $room = room_new('WALL', 'HOS');
        $room['seats'][0] = room_seat_human('HOS', 't0', [], '');
        $room['seats'][1] = room_seat_human('GST', 't1', [], '');
        $room['seats'][2] = room_idle_seat(2, 'ai');
        $room['seats'][3] = room_idle_seat(3, 'ai');
        room_seat_economy($room, 0);
        room_seat_economy($room, 1);
        return $room;
    }

    private function wallEvents(array $room): array
    {
        return array_values(array_filter($room['events'], fn($e) => ($e['t'] ?? '') === 'walls'));
    }

    public function testARoomFromBeforeTheSettingPlaysNone(): void
    {
        $old = room_new('OLDR', 'ABC');
        unset($old['walls'], $old['wallsNow']);
        $this->assertSame('none', room_walls_setting($old));
        $this->assertSame('none', room_walls_now($old));
        $snap = room_snapshot($old, null, 0);
        $this->assertSame('none', $snap['walls']);
        $this->assertSame('none', $snap['wallsNow']);
        foreach (['brick', 3, null, 'RUBBER'] as $odd) {
            $this->assertSame('none', room_walls_setting(['walls' => $odd]), var_export($odd, true));
            $this->assertSame('none', room_walls_now(['wallsNow' => $odd]), var_export($odd, true));
        }
        $this->assertSame('none', room_walls_now(['wallsNow' => 'random']), 'a round never plays Random itself');
    }

    public function testOnlyTheHostPicksAndOnlyAWall(): void
    {
        $room = $this->lobby();
        $this->assertSame(403, room_set_walls($room, 1, 'rubber')[0] ?? null);
        foreach (['brick', '', null, 3, ['rubber']] as $odd) {
            $this->assertSame(422, room_set_walls($room, 0, $odd)[0] ?? null, var_export($odd, true));
        }
        $this->assertSame('none', room_walls_setting($room));
        $this->assertSame([], $this->wallEvents($room));
    }

    public function testThePickChangesBetweenRoundsNeverDuringOne(): void
    {
        $room = $this->lobby();
        $this->assertNull(room_set_walls($room, 0, 'rubber'));
        $this->assertSame('rubber', room_walls_setting($room));
        $said = $this->wallEvents($room);
        $this->assertCount(1, $said);
        $this->assertSame(['t' => 'walls', 'seat' => 0, 'walls' => 'rubber'], array_diff_key($said[0], ['seq' => 1]));
        // The same pick again says nothing.
        $this->assertNull(room_set_walls($room, 0, 'rubber'));
        $this->assertCount(1, $this->wallEvents($room));
        room_match_begin($room);
        room_start_round($room);
        $this->assertSame('play', $room['phase']);
        $this->assertSame('rubber', room_walls_now($room), 'the round plays the pick');
        // During the round: refused, and the round keeps its wall.
        $this->assertSame(409, room_set_walls($room, 0, 'wrap')[0] ?? null);
        $this->assertSame('rubber', room_walls_setting($room));
        // Between rounds (the shop) it is taken, and applies from the next round.
        $room['phase'] = 'shop';
        $this->assertNull(room_set_walls($room, 0, 'wrap'));
        $this->assertSame('rubber', room_walls_now($room), 'the shop still shows the round just played');
        room_start_round($room);
        $this->assertSame('wrap', room_walls_now($room));
        // Every seat's snapshot carries both.
        foreach ([0, 1, null] as $seat) {
            $snap = room_snapshot($room, $seat, 0);
            $this->assertSame('wrap', $snap['walls']);
            $this->assertSame('wrap', $snap['wallsNow']);
        }
    }

    public function testRandomPlaysARealWallEachRoundAndOtherPicksLeaveTheStreamAlone(): void
    {
        $a = $this->lobby();
        $b = $this->lobby();
        room_set_walls($b, 0, 'spring');
        foreach ([&$a, &$b] as &$r) {
            room_match_begin($r);
            room_start_round($r);
        }
        unset($r);
        $this->assertSame($a['rng'], $b['rng'], 'a fixed pick draws nothing');
        $this->assertSame('spring', room_walls_now($b));
        $c = $this->lobby();
        room_set_walls($c, 0, 'random');
        room_match_begin($c);
        $seen = [];
        for ($i = 0; $i < 12; $i++) {
            room_start_round($c);
            $seen[room_walls_now($c)] = true;
        }
        $this->assertSame([], array_diff(array_keys($seen), ROOM_REAL_WALLS), 'only real walls');
        $this->assertGreaterThan(1, count($seen), 'it changes from round to round');
        $this->assertSame('random', room_snapshot($c, 0, 0)['walls']);
    }

    public function testTheRoomsSimFliesTheRoundsWall(): void
    {
        $room = $this->lobby();
        room_set_walls($room, 0, 'concrete');
        room_match_begin($room);
        room_start_round($room);
        $room['terrain'] = array_fill(0, 720, 400.0);
        foreach ($room['tanks'] as $i => $t) {
            $room['tanks'][$i]['x'] = (float) (100 + 140 * $i);
            $room['tanks'][$i]['y'] = 400.0;
        }
        $me = 0;
        $room['tanks'][$me]['x'] = 650.0;
        $room['tanks'][$me]['dirS'] = 1;
        $room['tanks'][$me]['angle'] = 45.0;
        $room['tanks'][$me]['power'] = 100.0;
        $events = [['t' => 'fire', 'seat' => $room['tanks'][$me]['seat']]];
        room_fire_shot($room, $events, $me, $this->gunOf('shot'));
        $shots = array_values(array_filter($events, fn($e) => $e['t'] === 'shot'));
        $this->assertCount(1, $shots);
        $this->assertSame(719.0, $shots[0]['x1'], 'it burst on the wall');
        $this->assertGreaterThan(0.0, $shots[0]['r']);
    }

    public function testPlayAgainKeepsThePickAndClearsTheRoundsWall(): void
    {
        $room = $this->lobby();
        room_set_walls($room, 0, 'wrap');
        room_match_begin($room);
        room_start_round($room);
        $room['phase'] = 'over';
        $this->assertTrue(room_again($room));
        $this->assertSame('wrap', room_walls_setting($room));
        $this->assertSame('none', room_walls_now($room));
    }

    /* ---- action=walls as a request: its gates ---- */

    /** A lobby with the host and a guest, through the real endpoints. */
    private function hosted(): array
    {
        [$st, $host] = $this->call('create', ['initials' => 'hst']);
        $this->assertSame(200, $st, json_encode($host));
        [$st, $guest] = $this->call('join', ['code' => $host['code'], 'initials' => 'gst']);
        $this->assertSame(200, $st, json_encode($guest));
        return [$host, $guest];
    }

    public function testTheHostSetsItThroughTheEndpointAndTheGuestSeesIt(): void
    {
        [$host, $guest] = $this->hosted();
        $this->gap();
        [$st, $out] = $this->call('walls', ['code' => $host['code'], 'token' => $host['token'], 'csrf' => $host['csrf'], 'walls' => 'wrap']);
        $this->assertSame(200, $st, json_encode($out));
        $this->assertSame('wrap', $out['room']['walls']);
        [$st, $seen] = $this->call('state', ['code' => $guest['code'], 'token' => $guest['token']]);
        $this->assertSame(200, $st);
        $this->assertSame('wrap', $seen['room']['walls']);
        $this->assertContains('walls', array_column($seen['room']['events'], 't'));
    }

    public function testEveryGateRefusesBeforeAnythingChanges(): void
    {
        [$host, $guest] = $this->hosted();
        $ask = ['code' => $host['code'], 'token' => $host['token'], 'csrf' => $host['csrf'], 'walls' => 'rubber'];
        $this->gap();
        $this->assertSame(403, $this->call('walls', $ask, ['HTTP_ORIGIN' => 'https://evil.example'])[0], 'origin');
        $this->assertSame(403, $this->call('walls', ['csrf' => 'nope'] + $ask)[0], 'CSRF');
        $this->assertSame(401, $this->call('walls', ['token' => 'nope'] + $ask)[0], 'seat token');
        $this->gap();
        [$st, $out] = $this->call('walls', ['token' => $guest['token']] + $ask);
        $this->assertSame([403, ['error' => 'only the host picks the walls']], [$st, $out], 'host only');
        $this->gap();
        $this->assertSame(422, $this->call('walls', ['walls' => 'lava'] + $ask)[0], 'a wall');
        $this->assertSame('none', $this->stored($host['code'])['walls'] ?? 'none', 'nothing changed');
        // The act throttle: a second pick on the heels of the first is refused.
        $this->gap();
        $this->assertSame(200, $this->call('walls', $ask)[0]);
        [$room, $lock] = room_load($host['code']);
        $room['seats'][0]['lastAct'] = microtime(true) + 3600; // an hour ahead: still inside the spacing however slowly the next request starts
        room_save($lock, $host['code'], $room);
        room_unlock($lock);
        $this->assertSame(429, $this->call('walls', ['walls' => 'spring'] + $ask)[0], 'rate');
        $this->assertSame('rubber', $this->stored($host['code'])['walls']);
    }

    public function testARoundInPlayRefusesThePick(): void
    {
        [$host] = $this->hosted();
        $seat = ['code' => $host['code'], 'token' => $host['token'], 'csrf' => $host['csrf']];
        $this->gap();
        $this->assertSame(200, $this->call('start', $seat + ['proto' => 2])[0]);
        $this->assertSame('play', $this->stored($host['code'])['phase']);
        $this->gap();
        [$st, $out] = $this->call('walls', $seat + ['walls' => 'spring']);
        $this->assertSame([409, ['error' => 'the walls change between rounds']], [$st, $out]);
    }
}
