<?php
// games/tankity/test/php/AiArcsTest.php
// The drones plan one arc per flight, not one per gun (server/ai.php
// room_ai_arc_guns): which guns share is read from each gun's own flight
// fields (server/sim.php room_flight_key), so a gun given a different speed,
// gravity or roll is planned on its own. test/ai-arcs.test.mjs is the same for the browser.
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

    public function testAChangeToAnyFieldThatBendsAFlightChangesTheFlightKey(): void
    {
        $weapons = room_weapons();
        $bending = 0;
        foreach ($weapons as $k => $def) {
            foreach ($def as $f => $v) {
                $tries = array_unique(array_column($weapons, $f), SORT_REGULAR);
                if (is_int($v) || is_float($v)) {
                    $tries[] = $v * 1.37 + 0.11;
                    $tries[] = $v * 0.2;
                } elseif (is_bool($v)) {
                    $tries[] = !$v;
                }
                foreach ($tries as $t) {
                    if ($t === $v) {
                        continue;
                    }
                    $changed = [$f => $t] + $def;
                    if (self::flights($changed) === self::flights($def)) {
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
}
