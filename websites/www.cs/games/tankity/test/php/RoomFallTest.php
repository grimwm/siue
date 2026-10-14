<?php
// games/tankity/test/php/RoomFallTest.php
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

/* Fall damage and parachutes in a room: a unit whose ground a blast took away
   drops straight down and pays by the drop, credited to whoever dug
   (src/sim.ts settleFalls is the same rules; the 'fall' sim vectors pin them). */
final class RoomFallTest extends TestCase
{
    private const RULES = ['freePx' => 10, 'perPx' => 0.5, 'chuteOver' => 5, 'aiRound' => 3];

    public static function setUpBeforeClass(): void
    {
        require_once __DIR__ . '/rooms-lib.php';
    }

    /** A flat field at 400; seat i is tank i. */
    private function room(array $tanks, array $extra = []): array
    {
        $room = ['terrain' => array_fill(0, 720, 400.0), 'tanks' => [], 'scores' => [], 'cash' => [], 'stats' => [],
            'shield' => [], 'bunker' => [], 'laststand' => [], 'chutes' => [], 'seats' => [], 'round' => 1, 'wind' => 0];
        foreach ($tanks as $i => $t) {
            $room['tanks'][$i] = $t + ['seat' => $i, 'name' => 'T' . $i, 'angle' => 45.0, 'power' => 50.0, 'hp' => 100, 'maxHp' => 100,
                'fuel' => 80.0, 'dirS' => 1, 'ammo' => []];
            $room['scores'][$i] = 0;
            $room['cash'][$i] = 0;
            if ($t['kind'] === 'human') {
                $room['stats'][$i] = ['won' => 0, 'kills' => 0, 'gain' => 0, 'from' => 0, 'out' => null];
            }
        }
        return array_replace($room, $extra);
    }

    private function human(float $x, float $y, array $more = []): array
    {
        return ['kind' => 'human', 'x' => $x, 'y' => $y] + $more;
    }

    private function drone(float $x, float $y, array $more = []): array
    {
        return ['kind' => 'ai', 'x' => $x, 'y' => $y] + $more;
    }

    public function testTheDamageIsLinearPastAFreeDrop(): void
    {
        $r = self::RULES;
        $this->assertSame(0, room_fall_damage(0.0, $r));
        $this->assertSame(0, room_fall_damage(10.0, $r));
        $this->assertSame(0, room_fall_damage(11.0, $r));
        $this->assertSame(1, room_fall_damage(12.0, $r));
        $this->assertSame(4, room_fall_damage(19.5, $r));
        $this->assertSame(45, room_fall_damage(100.0, $r));
        $this->assertSame(0, room_fall_damage(-30.0, $r));
    }

    public function testTheGameYamlRulesAreTheDefaults(): void
    {
        $this->assertSame(self::RULES, room_fall_rules());
        $this->assertSame('parachute', room_gear('parachute')['effect'] ?? null);
    }

    public function testAUnitOverAPitLandsAndPaysTheDrop(): void
    {
        $room = $this->room([$this->human(100, 300), $this->drone(400, 400)]);
        $events = [];
        room_settle_tanks($room, $events);
        $this->assertSame(400.0, $room['tanks'][0]['y']);
        $this->assertSame(55, $room['tanks'][0]['hp']);
        $this->assertSame([['t' => 'fall', 'seat' => 0, 'dmg' => 45, 'by' => 0, 'chute' => false, 'under' => false]], $events);
    }

    public function testTheDiggerIsCreditedWithScoreAndTheKill(): void
    {
        $room = $this->room([$this->human(100, 400), $this->drone(300, 400, ['hp' => 20])]);
        $events = [];
        room_explode($room, $events, $room['tanks'][0], 'nuke', 300.0, 470.0, null);
        $this->assertSame([], array_filter($events, fn($e) => $e['t'] === 'hit'), 'the blast itself missed the drone');
        $this->assertSame(0, $room['tanks'][1]['fellBy']);
        room_settle_tanks($room, $events);
        $fall = array_values(array_filter($events, fn($e) => $e['t'] === 'fall'))[0];
        $this->assertSame(0, $fall['by']);
        $this->assertSame(23, $fall['dmg']); // 56 px into the 456 floor
        $this->assertSame(0, $room['tanks'][1]['hp']);
        $this->assertSame(0, $room['tanks'][1]['lastHitBy']);
        $this->assertSame(1, $room['tanks'][0]['kills']);
        $this->assertSame(1, $room['stats'][0]['kills']);
        $this->assertSame(23 * 2 + 300, $room['scores'][0]);
        $this->assertSame(23 * 2 + 300, $room['cash'][0]);
        $this->assertContains(['t' => 'kill', 'seat' => 1, 'by' => 0], $events);
    }

    public function testDiggingOutYourOwnFootingCreditsNobody(): void
    {
        $room = $this->room([$this->human(100, 300, ['fellBy' => 0, 'hp' => 40]), $this->drone(400, 400)]);
        $events = [];
        room_settle_tanks($room, $events);
        $this->assertSame(0, $room['tanks'][0]['hp']);
        $this->assertSame(0, $room['scores'][0]);
        $this->assertSame(0, $room['stats'][0]['kills']);
        $this->assertArrayNotHasKey('lastHitBy', $room['tanks'][0]);
        $this->assertContains(['t' => 'kill', 'seat' => 0, 'by' => 0], $events);
    }

    public function testAParachuteSavesABigFallAndIsSpent(): void
    {
        $room = $this->room([$this->human(100, 300), $this->drone(400, 400)], ['chutes' => [0 => 2]]);
        $events = [];
        room_settle_tanks($room, $events);
        $this->assertSame(100, $room['tanks'][0]['hp']);
        $this->assertSame(1, $room['chutes'][0]);
        $this->assertTrue($room['tanks'][0]['chute']);
        $this->assertSame([['t' => 'fall', 'seat' => 0, 'dmg' => 0, 'by' => 0, 'chute' => true, 'under' => false]], $events);
    }

    public function testASmallFallKeepsTheParachute(): void
    {
        $room = $this->room([$this->human(100, 379), $this->drone(400, 400)], ['chutes' => [0 => 1]]);
        room_settle_tanks($room);
        $this->assertSame(95, $room['tanks'][0]['hp']);
        $this->assertSame(1, $room['chutes'][0]);
        $this->assertFalse($room['tanks'][0]['chute'] ?? false);
    }

    public function testADroneSpendsItsOwnParachute(): void
    {
        $room = $this->room([$this->human(100, 400), $this->drone(300, 300, ['hp' => 60, 'chutes' => 1])]);
        room_settle_tanks($room);
        $this->assertSame(60, $room['tanks'][1]['hp']);
        $this->assertSame(0, $room['tanks'][1]['chutes']);
    }

    public function testTheBunkerHalvesItAndTheShieldDoesNotStopIt(): void
    {
        $room = $this->room([$this->human(100, 300), $this->drone(400, 400)], ['shield' => [0 => true], 'bunker' => [0 => 2]]);
        room_settle_tanks($room);
        $this->assertSame(100 - 23, $room['tanks'][0]['hp']);
        $this->assertTrue($room['shield'][0]);
    }

    public function testLandingOnAUnitHurtsItCreditedToTheDigger(): void
    {
        $room = $this->room([$this->human(310, 400), $this->drone(300, 200, ['fellBy' => 2, 'hp' => 60, 'chutes' => 1]), $this->drone(600, 400)]);
        $this->assertSame(377.0, room_rest_y($room['tanks'], $room['terrain'], 1));
        $events = [];
        room_settle_tanks($room, $events);
        $dmg = room_fall_damage(177.0, self::RULES);
        $this->assertSame(377.0, $room['tanks'][1]['y']);
        $this->assertSame(60, $room['tanks'][1]['hp']);
        $this->assertSame(100 - $dmg, $room['tanks'][0]['hp']);
        $this->assertSame(2, $room['tanks'][0]['lastHitBy']);
        $this->assertContains(['t' => 'fall', 'seat' => 0, 'dmg' => $dmg, 'by' => 2, 'chute' => false, 'under' => true], $events);
    }

    public function testAVolleyEndsWithItsFallsSettled(): void
    {
        // The human lobs a nuke beside the drone; the drone's ground goes and it drops with the volley.
        $room = $this->room([$this->human(100, 400), $this->drone(300, 400, ['hp' => 500])]);
        $best = null;
        for ($p = 30; $p <= 100 && $best === null; $p++) {
            $land = room_sim_shot($room['terrain'], 0.0, ...array_merge(room_muzzle(['angle' => 45.0, 'dirS' => 1, 'x' => 100.0, 'y' => 400.0]), [45.0, (float) $p, 'nuke', 1, 720]));
            if (!$land['oob'] && $land['x'] > 360) {
                $best = $p;
            }
        }
        $room['tanks'][0]['power'] = (float) $best;
        $room['tanks'][0]['ammo']['nuke'] = 1;
        $events = [['t' => 'fire', 'seat' => 0]];
        room_fire_shot($room, $events, 0, 'nuke');
        $falls = array_values(array_filter($events, fn($e) => $e['t'] === 'fall'));
        $this->assertNotEmpty($falls, 'the drone fell');
        $this->assertSame(1, $falls[0]['seat']);
        $this->assertSame(0, $falls[0]['by']);
        $this->assertArrayHasKey('at', $falls[0], 'stamped for the replay');
        $xi = (int) round($room['tanks'][1]['x']);
        $this->assertSame($room['terrain'][$xi], $room['tanks'][1]['y']);
    }

    public function testDronesCarryAParachuteFromTheRulesRound(): void
    {
        $this->assertSame(0, room_drone_chutes(2));
        $this->assertSame(1, room_drone_chutes(3));
        $room = room_new('FALL', 'HUM');
        $room['seats'][0] = room_seat_human('HUM', 't0', [], '');
        $room['seats'][1] = room_idle_seat(1, 'ai');
        $room['seats'][2] = room_idle_seat(2, 'open');
        $room['seats'][3] = room_idle_seat(3, 'open');
        room_seat_economy($room, 0);
        $room['round'] = 2;
        room_start_round($room);
        $this->assertSame(1, $room['tanks'][1]['chutes']);
        $this->assertArrayNotHasKey('chutes', $room['tanks'][0], 'a human\'s parachutes live on the seat');
    }

    public function testTheShopSellsParachutesThatStack(): void
    {
        $room = room_new('FALL', 'HUM');
        $room['seats'][0] = room_seat_human('HUM', 't0', [], '');
        room_seat_economy($room, 0);
        $room['round'] = 1;
        $room['cash'][0] = 10000;
        $g = room_gear('parachute');
        $this->assertNull(room_buy($room, 0, 'parachute', 3));
        $this->assertSame(3 * (int) $g['n'], $room['chutes'][0]);
        $this->assertNull(room_buy($room, 0, 'parachute', 1));
        $this->assertSame(4 * (int) $g['n'], $room['chutes'][0]);
        $this->assertSame(10000 - 4 * (int) $g['price'], $room['cash'][0]);
        $snap = room_snapshot($room, 0, 0);
        $this->assertSame(4 * (int) $g['n'], $snap['you']['chutes']);
    }

    public function testTheBunkerCountsTowardTheParachute(): void
    {
        // 26 px: raw 8, halved to 4, not over 5: the chute stays packed.
        $room = $this->room([$this->human(100, 374), $this->drone(400, 400)], ['chutes' => [0 => 1], 'bunker' => [0 => 2]]);
        room_settle_tanks($room);
        $this->assertSame(96, $room['tanks'][0]['hp']);
        $this->assertSame(1, $room['chutes'][0]);
    }

    public function testTheBlastThatLoweredTheGroundMostIsCredited(): void
    {
        $room = $this->room([$this->human(100, 400), $this->drone(600, 400), $this->drone(300, 400)]);
        $events = [];
        room_explode($room, $events, $room['tanks'][0], 'mortar', 300.0, 440.0, null);
        room_explode($room, $events, $room['tanks'][1], 'shell', 330.0, 445.0, null);
        $this->assertSame(0, $room['tanks'][2]['fellBy']);
        $events = [];
        room_settle_tanks($room, $events);
        $this->assertSame(0, array_values(array_filter($events, fn($e) => $e['t'] === 'fall' && $e['seat'] === 2))[0]['by']);
    }

    public function testARiseFoldsAnOpenParachute(): void
    {
        // A drone rides risen ground up (a ground unit would stay buried).
        $room = $this->room([$this->human(100, 400), $this->drone(400, 430, ['chute' => true])]);
        room_settle_tanks($room);
        $this->assertSame(400.0, $room['tanks'][1]['y']);
        $this->assertArrayNotHasKey('chute', $room['tanks'][1]);
    }
}
