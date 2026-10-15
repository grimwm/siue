<?php
// games/tankity/test/php/AiArcsTest.php
// The drones plan one arc per flight, not one per gun (server/ai.php
// room_ai_arc_guns): which guns share is read from each gun's own flight
// fields (server/sim.php room_flight_key), so a gun given a different speed,
// gravity or roll is planned on its own. test/ai-arcs.test.ts is the same for the browser.
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

final class AiArcsTest extends TestCase
{
    public static function setUpBeforeClass(): void
    {
        require_once __DIR__ . '/rooms-lib.php';
    }

    /** Hilly ground and a crosswind, so a shot can land, roll, or fly off the board. */
    private static function flights(array $def): array
    {
        static $terrain = null;
        if ($terrain === null) {
            for ($x = 0; $x < 720; $x++) {
                $terrain[] = 380 + 40 * det_sin($x * 2 * M_PI / 260);
            }
        }
        $out = [];
        foreach ([30, 52, 75, 104, 140] as $a) {
            foreach ([34, 61, 92] as $p) {
                foreach ([1, -1] as $dirS) {
                    $out[] = room_sim_flight($terrain, 3.0, 360.0, 380.0, (float) $a, (float) $p, $def, $dirS, 720);
                }
            }
        }
        return $out;
    }

    public function testAFlightIsTheShotOfThatGun(): void
    {
        $terrain = array_fill(0, 720, 400.0);
        foreach (room_weapons() as $k => $def) {
            $this->assertSame(room_sim_shot($terrain, 2.0, 100.0, 380.0, 50.0, 70.0, $k, 1, 720),
                room_sim_flight($terrain, 2.0, 100.0, 380.0, 50.0, 70.0, $def, 1, 720), $k);
        }
    }

    public function testGunsThatShareAFlightKeyFlyTheSameArcs(): void
    {
        $weapons = room_weapons();
        foreach ($weapons as $a => $da) {
            foreach ($weapons as $b => $db) {
                if ($a < $b && room_flight_key($da) === room_flight_key($db)) {
                    $this->assertSame(self::flights($da), self::flights($db), "$a and $b");
                }
            }
        }
    }

    /** The guns the field sweep below changes: every gun on the nightly run
     *  (GITHUB_EVENT_NAME schedule or workflow_dispatch), else the first gun
     *  of each distinct flight key, which tries every field on every arc in a
     *  sixth of the time. TANKITY_ARCS_SWEEP=all or sample overrides. */
    private static function sweptGuns(array $weapons): array
    {
        $mode = (string) getenv('TANKITY_ARCS_SWEEP');
        if ($mode === '') {
            $mode = in_array(getenv('GITHUB_EVENT_NAME'), ['schedule', 'workflow_dispatch'], true) ? 'all' : 'sample';
        }
        if ($mode === 'all') {
            return $weapons;
        }
        $first = [];
        foreach ($weapons as $k => $def) {
            $first[room_flight_key($def)] ??= $k;
        }
        return array_intersect_key($weapons, array_flip($first));
    }

    public function testAChangeToAnyFieldThatBendsAFlightChangesTheFlightKey(): void
    {
        $weapons = room_weapons();
        $bending = 0;
        foreach (self::sweptGuns($weapons) as $k => $def) {
            $flights = self::flights($def);
            foreach ($def as $f => $v) {
                $tries = array_unique(array_column($weapons, $f), SORT_REGULAR);
                if (is_int($v) || is_float($v)) {
                    $tries[] = $v * 1.37 + 0.11;
                    $tries[] = $v * 0.2;
                } elseif (is_bool($v)) {
                    $tries[] = !$v;
                } elseif (is_string($v)) {
                    $tries[] = $v . '~'; // a string field the flight reads while every gun holds the same value
                }
                foreach ($tries as $t) {
                    if ($t === $v) {
                        continue;
                    }
                    $changed = [$f => $t] + $def;
                    if (self::flights($changed) === $flights) {
                        continue;
                    }
                    $bending++;
                    $this->assertNotSame(room_flight_key($def), room_flight_key($changed),
                        "$k.$f = " . var_export($t, true) . ' bends the flight but keeps its flight key');
                }
            }
        }
        $this->assertGreaterThan(10, $bending);
    }

    public function testTheFlightKeyIsExactWhateverThePrecisionSetting(): void
    {
        $shell = room_weapons()['shell'];
        $near = ['speed' => 1.0000000000000002] + $shell;
        $was = ini_get('serialize_precision');
        try {
            foreach (['-1', '17', '6'] as $p) {
                ini_set('serialize_precision', $p);
                $this->assertNotSame(room_flight_key($shell), room_flight_key($near), "serialize_precision $p");
            }
        } finally {
            ini_set('serialize_precision', (string) $was);
        }
        $this->assertSame(room_flight_key(['speed' => 0.0] + $shell), room_flight_key(['speed' => -0.0] + $shell));
    }

    public function testAFlightFieldThatIsNotAFiniteNumberIsRefused(): void
    {
        foreach ([['speed' => INF], ['speed' => NAN], ['effect' => 'roller', 'friction' => -INF]] as $bad) {
            try {
                room_flight_key($bad + room_weapons()['shell']);
                $this->fail(json_encode(array_keys($bad)) . ' was keyed');
            } catch (InvalidArgumentException) {
                $this->addToAssertionCount(1);
            }
        }
    }

    public function testAGunPlansOncePerDistinctArcTheFirstOfEachInRackOrder(): void
    {
        $weapons = room_weapons();
        $rack = array_keys(array_filter($weapons, fn($d) => $d['ai']));
        $plan = room_ai_arc_guns($weapons, $rack);
        $this->assertSame('shell', $plan[0]);
        $this->assertCount(count(array_unique(array_map(fn($k) => room_flight_key($weapons[$k]), $rack))), $plan);
        foreach ($rack as $k) {
            $first = null;
            foreach ($rack as $o) {
                if ($first === null && room_flight_key($weapons[$o]) === room_flight_key($weapons[$k])) {
                    $first = $o;
                }
            }
            $this->assertSame($first === $k, in_array($k, $plan, true), $k);
        }
        $this->assertSame(array_values(array_intersect($rack, $plan)), $plan);
    }

    public function testAGunGivenItsOwnArcIsPlannedOnItsOwnOneWithTheSameFlightShares(): void
    {
        $weapons = room_weapons();
        $rack = ['shell', 'buck', 'mortar'];
        $this->assertSame(['shell'], room_ai_arc_guns($weapons, $rack));
        foreach ([['speed' => 1.2], ['flat' => true], ['effect' => 'roller', 'friction' => 0.6, 'rollTime' => 8.0]] as $change) {
            $own = $weapons;
            $own['buck'] = $change + $own['buck'];
            $this->assertSame(['shell', 'buck'], room_ai_arc_guns($own, $rack), json_encode($change));
        }
        // A gun that hurts differently but flies the same is still one plan.
        $same = $weapons;
        $same['buck'] = ['dmg' => 99, 'radius' => 60, 'effect' => 'cluster'] + $same['buck'];
        $this->assertSame(['shell'], room_ai_arc_guns($same, $rack));
    }

    /** A drone and a human on flat ground, as the harm vectors place them. */
    private static function harmRoom(float $selfX, float $targetX): array
    {
        $unit = fn(int $seat, string $kind, float $x): array => ['seat' => $seat, 'kind' => $kind, 'x' => $x, 'y' => 400.0, 'hp' => 100, 'dirS' => 1];
        return ['terrain' => array_fill(0, 720, 400.0), 'tanks' => [$unit(0, 'ai', $selfX), $unit(1, 'human', $targetX)], 'wind' => 0.0];
    }

    public function testOnOneArcTheMoreHarmfulGunWins(): void
    {
        $room = self::harmRoom(100.0, 420.0);
        $land = ['x' => 410.0, 'y' => 400.0, 'oob' => false];
        [$self, $target] = $room['tanks'];
        $this->assertGreaterThan(room_ai_harm($room, $self, $target, 'shell', $land), room_ai_harm($room, $self, $target, 'mortar', $land));
        $this->assertSame(0.0, room_ai_harm($room, $self, $target, 'shell', ['x' => 760.0, 'y' => 300.0, 'oob' => true]));
    }

    public function testAGunThatWouldReachItsOwnDroneScoresMinusInfinity(): void
    {
        $room = self::harmRoom(100.0, 150.0);
        [$self, $target] = $room['tanks'];
        $land = ['x' => 150.0, 'y' => 400.0, 'oob' => false];
        $this->assertSame(-INF, room_ai_harm($room, $self, $target, 'heavy', $land));
        $this->assertGreaterThan(0.0, room_ai_harm($room, $self, $target, 'needle', $land));
    }

    public function testTheEarthTermCountsTheFallTheGroundItMovesWouldGive(): void
    {
        $room = self::harmRoom(100.0, 420.0);
        [$self, $target] = $room['tanks'];
        // A harmless crater right under the target drops it 0.75 r: Heavy Riot's 56 px costs 23.
        $e = room_ai_earth_harm($room, $self, $target, 'heavyriot', ['x' => 420.0, 'y' => 400.0, 'oob' => false]);
        $this->assertSame(23.0, $e['harm']);
        $this->assertSame(0, $e['self']);
        // Under the drone itself, the same crater is a gun never to fire.
        $this->assertSame(-INF, room_ai_harm($room, $self, $target, 'heavyriot', ['x' => 100.0, 'y' => 400.0, 'oob' => false]));
    }

    public function testDirtCountsABurialOnlyOnAGroundUnit(): void
    {
        $room = self::harmRoom(100.0, 420.0);
        [$self, $target] = $room['tanks'];
        $land = ['x' => 420.0, 'y' => 400.0, 'oob' => false];
        // Dirt Ball's disc tops out 35 px over the hull: a burial worth ROOM_AI_BURY + 35, capped.
        $this->assertSame(min((float) ROOM_AI_BURY_MAX, ROOM_AI_BURY + 35.0), room_ai_earth_harm($room, $self, $target, 'dirtball', $land)['bury']);
        $room['tanks'][1]['kind'] = 'ai';
        $this->assertSame(0.0, room_ai_earth_harm($room, $self, $room['tanks'][1], 'dirtball', $land)['bury']);
        // Never enough to pass for a kill: a 20-armor target scores 19 at most.
        $room['tanks'][1]['kind'] = 'human';
        $room['tanks'][1]['hp'] = 20;
        $this->assertSame(19.0, room_ai_with_burial($room['tanks'][1], 0.0, 65.0));
    }

    /** The planning flights one drone turn costs with a full round-9 rack (three
     *  roller arcs among them), over hills, for every strategy: room_advance runs
     *  up to three drone turns under the room lock, so a turn stays inside a
     *  fixed budget. */
    public function testADroneTurnWithAFullRackStaysInsideItsFlightBudget(): void
    {
        $terrain = [];
        for ($x = 0; $x < 720; $x++) {
            $terrain[] = 330 + 40 * det_sin($x * 2 * M_PI / 260);
        }
        foreach (['hunter', 'bully', 'sniper', 'avenger', 'glory', 'lobber'] as $s) {
            foreach ([1, 2, 3, 4] as $seed) {
                $room = ['terrain' => $terrain, 'wind' => 2.0, 'round' => 9, 'rng' => $seed, 'jammer' => [], 'scores' => [],
                    'tanks' => [
                        ['seat' => 0, 'kind' => 'human', 'x' => 150.0, 'y' => $terrain[150], 'hp' => 100, 'dirS' => 1, 'angle' => 45.0, 'power' => 50.0],
                        ['seat' => 1, 'kind' => 'ai', 'x' => 560.0, 'y' => $terrain[560], 'hp' => 60, 'dirS' => -1, 'angle' => 45.0, 'power' => 50.0,
                            's' => $s, 'ammo' => room_ai_rack(9)],
                    ]];
                $before = room_sim_flights();
                $ops = room_ai_earth_ops();
                room_ai_choose($room, $room['tanks'][1]);
                $this->assertLessThanOrEqual(440, room_sim_flights() - $before, "$s seed $seed");
                // Ground predictions beside the flights (test/ai-search.test.ts holds the browser to the same 240).
                $this->assertLessThanOrEqual(240, room_ai_earth_ops() - $ops, "$s seed $seed: ground predictions");
            }
        }
    }

    /** A wall-clock backstop beside the counted budgets: a full round-9 rack's
     *  turns cost little more than the same rack's without the earth guns,
     *  both measured in this run (so a busy machine slows both alike), summed
     *  over every strategy so a slow strategy's turns show. */
    public function testTheEarthGunsAddLittleToADroneTurnsTime(): void
    {
        $terrain = [];
        for ($x = 0; $x < 720; $x++) {
            $terrain[] = 330 + 40 * det_sin($x * 2 * M_PI / 260);
        }
        $full = room_ai_rack(9);
        $plain = array_filter($full, fn($k) => !in_array(room_weapons()[$k]['effect'], ['dirt', 'pour', 'dig', 'riot', 'slump'], true), ARRAY_FILTER_USE_KEY);
        $total = function (array $rack) use ($terrain): float {
            $ms = [];
            foreach (['hunter', 'bully', 'sniper', 'avenger', 'glory', 'lobber'] as $s) {
                foreach ([1, 2, 3] as $seed) {
                    $room = ['terrain' => $terrain, 'wind' => 2.0, 'round' => 9, 'rng' => $seed, 'jammer' => [], 'scores' => [],
                        'tanks' => [
                            ['seat' => 0, 'kind' => 'human', 'x' => 150.0, 'y' => $terrain[150], 'hp' => 100, 'dirS' => 1, 'angle' => 45.0, 'power' => 50.0],
                            ['seat' => 1, 'kind' => 'ai', 'x' => 560.0, 'y' => $terrain[560], 'hp' => 60, 'dirS' => -1, 'angle' => 45.0, 'power' => 50.0,
                                's' => $s, 'ammo' => $rack],
                        ]];
                    $t0 = hrtime(true);
                    room_ai_choose($room, $room['tanks'][1]);
                    $ms[] = (hrtime(true) - $t0) / 1e6;
                }
            }
            return array_sum($ms);
        };
        $total($plain); // warm up
        $total($full);
        [$base, $earth] = [INF, INF];
        for ($i = 0; $i < 5; $i++) { // interleaved, so drift hits both alike
            $base = min($base, $total($plain));
            $earth = min($earth, $total($full));
        }
        $this->assertLessThan(1.25 * $base, $earth, sprintf('a full rack\'s turns take %.1f ms, the rack without the earth guns %.1f ms', $earth, $base));
    }
}
