<?php
// games/tankity/test/php/RoomDronesTest.php
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

/* What a drone buys and earns in a room: the personalities (src/drones.ts is the same, pinned by the 'drone-shop'
   sim vectors), the budget, the reserve, the caps, the shapeshifter, and the economy a drone seat holds like a
   player's: cash, shells, armor, plates, parachutes, a shield. */
final class RoomDronesTest extends TestCase
{
    public static function setUpBeforeClass(): void
    {
        require_once __DIR__ . '/rooms-lib.php';
    }

    private static function view(array $over = []): array
    {
        return $over + ['cash' => 600, 'armor' => 100, 'plate' => 0, 'chutes' => 0, 'shield' => false];
    }

    private static function rng(string $seed, int $round = 1, int $seat = 1): int
    {
        return room_drone_rng($seed, $round, $seat);
    }

    /** @return array<string,array> personalities with rules of their own */
    private static function ruled(): array
    {
        return array_values(array_filter(room_drones(), fn($p) => !isset($p['shift'])));
    }

    private static function spend(array $buys): int
    {
        $n = 0;
        foreach ($buys as $b) {
            $w = room_weapons()[$b['item']] ?? null;
            $price = $w !== null ? $w['price'] : (room_gear($b['item'])['price'] ?? 0);
            $n += $price * $b['qty'];
        }
        return $n;
    }

    private static function gunsFor(int $left): array
    {
        return array_values(array_filter(array_keys(room_weapons()), function ($k) use ($left) {
            $a = room_weapons()[$k];
            return !empty($a['ai']) && $a['pack'] > 0 && $a['price'] > 0 && $a['dmg'] > 0 && $a['price'] <= $left;
        }));
    }

    private static function effect(string $item): ?string
    {
        return isset(room_weapons()[$item]) ? null : (room_gear($item)['effect'] ?? null);
    }

    private function shop(array $state, array $p, string $seed = 's'): array
    {
        $rng = self::rng($seed);
        return room_drone_shop($state, room_drone_arsenal(), $p, $rng);
    }

    public function testThePersonalitiesComeFromGameYaml(): void
    {
        $ps = room_drones();
        $this->assertGreaterThanOrEqual(2, count(self::ruled()));
        $this->assertGreaterThan(count(self::ruled()), count($ps), 'a shapeshifter rides along');
    }

    public function testEachPersonalityPicksTheBestGunItsRuleRanksAndCanAfford(): void
    {
        $w = room_weapons();
        foreach (self::ruled() as $p) {
            foreach ([250, 600, 1500, 5000] as $cash) {
                $buys = $this->shop(self::view(['cash' => $cash]), $p, 'pick');
                $budget = (int) floor($cash * (1 - $p['reserve']));
                $guns = array_values(array_filter($buys, fn($b) => isset($w[$b['item']])));
                if (!$guns) {
                    continue;
                }
                $left = $budget - self::spend(array_filter($buys, fn($b) => !isset($w[$b['item']])));
                $keys = self::gunsFor($left);
                $first = $guns[0]['item'];
                $this->assertContains($first, $keys, "{$p['key']} \$$cash");
                $score = fn(string $k) => match ($p['pick']) {
                    'big' => (float) $w[$k]['dmg'],
                    'value' => ($w[$k]['dmg'] * $w[$k]['pack']) / $w[$k]['price'],
                    'precise' => $w[$k]['dmg'] / $w[$k]['radius'] / $w[$k]['pack'],
                    default => 0.0,
                };
                if ($p['pick'] !== 'random') {
                    $this->assertSame(max(array_map($score, $keys)), $score($first), "{$p['key']} \$$cash picks the best by {$p['pick']}");
                }
            }
        }
    }

    public function testNeverOverBudgetNeverPastTheReserveNeverAGunWithoutTheAiFlag(): void
    {
        $w = room_weapons();
        foreach (self::ruled() as $p) {
            foreach ([0, 59, 60, 120, 301, 600, 2500, 99999] as $cash) {
                foreach ([[100, 0], [3, 0], [40, 2], [125, 1]] as [$armor, $plate]) {
                    foreach ([0, 1] as $chutes) {
                        $state = self::view(['cash' => $cash, 'armor' => $armor, 'plate' => $plate, 'chutes' => $chutes, 'shield' => $chutes === 1]);
                        $buys = $this->shop($state, $p, "n$cash");
                        $this->assertLessThanOrEqual((int) floor($cash * (1 - $p['reserve'])), self::spend($buys), "{$p['key']} \$$cash");
                        $this->assertGreaterThanOrEqual($cash * $p['reserve'], $cash - self::spend($buys), "{$p['key']} \$$cash keeps its reserve");
                        $this->assertLessThanOrEqual($p['maxBuys'], count($buys));
                        foreach ($buys as $b) {
                            $this->assertTrue($b['qty'] >= 1 && $b['qty'] <= 9);
                            if (isset($w[$b['item']])) {
                                $this->assertTrue(!empty($w[$b['item']]['ai']), "{$p['key']} bought {$b['item']}");
                            }
                        }
                    }
                }
            }
        }
    }

    public function testOneShotGearOnceAndOnlyWhenUsefulRepairOnlyUpToAFullHull(): void
    {
        foreach (self::ruled() as $p) {
            $rich = ['defense' => 1, 'maxBuys' => 12] + $p;
            foreach ([self::view(['cash' => 99999]), self::view(['cash' => 99999, 'chutes' => 3, 'shield' => true]), self::view(['cash' => 99999, 'armor' => 10])] as $state) {
                $buys = $this->shop($state, $rich, 'caps');
                $shields = array_filter($buys, fn($b) => self::effect($b['item']) === 'shield');
                $chutes = array_filter($buys, fn($b) => self::effect($b['item']) === 'parachute');
                $this->assertLessThanOrEqual(1, count($shields));
                $this->assertLessThanOrEqual(1, count($chutes));
                foreach (array_merge($shields, $chutes) as $b) {
                    $this->assertSame(1, $b['qty']);
                }
                $this->assertSame([], $state['shield'] ? $shields : [], 'it already has a shield');
                $this->assertSame([], $state['chutes'] > 0 ? $chutes : [], 'it already has a parachute');
                $repairs = array_filter($buys, fn($b) => self::effect($b['item']) === 'repair');
                if ($state['armor'] >= 100 + 25 * $state['plate']) {
                    $this->assertSame([], $repairs, 'a full hull wants no repair');
                }
                foreach ($repairs as $b) {
                    $per = (int) room_gear($b['item'])['n'];
                    $this->assertLessThanOrEqual((int) ceil((100 - $state['armor']) / $per), $b['qty']);
                }
            }
        }
    }

    public function testTheTurtleRepairsFirstWhenDamagedThenAParachuteAPlateAndAShield(): void
    {
        $turtle = room_drone_personality(room_drones(), 'turtle');
        $this->assertNotNull($turtle);
        $buys = $this->shop(self::view(['cash' => 2500, 'armor' => 40, 'plate' => 1]), $turtle, 't');
        $this->assertSame(['repair', 'parachute', 'plate', 'shield'], array_map(fn($b) => self::effect($b['item']), array_slice($buys, 0, 4)));
        $undamaged = $this->shop(self::view(['cash' => 2500]), $turtle, 't');
        $this->assertNotSame('repair', self::effect($undamaged[0]['item']));
    }

    public function testTheShapeshifterShiftsDeterministicallyAndNeverLandsOnItself(): void
    {
        $ps = room_drones();
        $shifters = array_values(array_filter($ps, fn($p) => isset($p['shift'])));
        $this->assertNotEmpty($shifters);
        foreach ($shifters as $s) {
            foreach (['alpha', 'beta', 'scorched-4242'] as $seed) {
                $run = function () use ($ps, $s, $seed): array {
                    $d = ['personality' => $s['key'], 'form' => room_drone_deal($ps, $seed, 3)['form']];
                    $forms = [$d['form']];
                    for ($round = 0; $round < 300; $round++) {
                        $rng = room_drone_rng($seed, $round, 3);
                        $d['form'] = room_drone_form($ps, $d, $round, $rng);
                        $forms[] = $d['form'];
                    }
                    return $forms;
                };
                $forms = $run();
                $this->assertSame($forms, $run(), "$seed is deterministic");
                foreach ($forms as $f) {
                    $this->assertNotSame($s['key'], $f);
                    $this->assertNotNull(room_drone_personality(self::ruled(), $f), "$f has rules of its own");
                }
                $shifts = 0;
                for ($i = 1; $i < count($forms); $i++) {
                    $shifts += $forms[$i] !== $forms[$i - 1] ? 1 : 0;
                }
                $this->assertTrue($shifts > 30 && $shifts < 200, "$seed: $shifts shifts");
            }
            $d = ['personality' => $s['key'], 'form' => self::ruled()[0]['key']];
            for ($i = 0; $i < 50; $i++) {
                $rng = room_drone_rng("z$i", 0, 1);
                $this->assertSame($d['form'], room_drone_form($ps, $d, 0, $rng), 'round 0 wears its first form');
            }
        }
    }

    public function testAPersonalityIsDealtFromTheSeedAndSeatUniformlyOverTheList(): void
    {
        $ps = room_drones();
        $tally = [];
        for ($i = 0; $i < 1200; $i++) {
            $k = room_drone_deal($ps, "seed$i", 1 + $i % 3)['personality'];
            $tally[$k] = ($tally[$k] ?? 0) + 1;
        }
        foreach ($ps as $p) {
            $this->assertTrue(($tally[$p['key']] ?? 0) > 120 && $tally[$p['key']] < 300, "{$p['key']}: " . ($tally[$p['key']] ?? 0));
        }
        $this->assertSame(room_drone_deal($ps, 'alpha', 2), room_drone_deal($ps, 'alpha', 2));
    }

    /* ---- the room ---- */

    /** Host HUM at seat 0, drones at seats 1 and 2, seat 3 open; the match begun and round 1 mustered. */
    private function begun(): array
    {
        $room = room_new('DRON', 'HUM');
        $room['seats'][0] = room_seat_human('HUM', 't0', [], '');
        $room['seats'][1] = room_seat_human('GST', 't1', [], '');
        $room['seats'][2] = room_idle_seat(2, 'ai');
        $room['seats'][3] = room_idle_seat(3, 'ai');
        room_seat_economy($room, 0);
        room_seat_economy($room, 1);
        room_match_begin($room);
        room_start_round($room);
        return $room;
    }

    public function testAMatchStartDealsEveryDroneSeatAStakeAShopAndAPersonality(): void
    {
        $room = $this->begun();
        $this->assertArrayHasKey('droneSeed', $room);
        foreach ([2, 3] as $seat) {
            $this->assertNotSame('', $room['persona'][$seat]['personality']);
            $this->assertTrue($room['cash'][$seat] >= 0 && $room['cash'][$seat] <= 600, "seat $seat cash {$room['cash'][$seat]}");
            foreach (room_start_ammo() as $k => $n) {
                $this->assertGreaterThanOrEqual($n, $room['ammo'][$seat][$k], "seat $seat keeps the start shells of $k");
            }
        }
        $tank = $room['tanks'][2];
        $this->assertSame(100 + 25 * ($room['plate'][2] ?? 0), $tank['maxHp']);
        $this->assertSame($room['ammo'][2], $tank['ammo'], 'it musters with what it bought');
        $snap = room_snapshot($room, 0, 0)['seats'];
        $this->assertNull($snap[0]['persona']);
        $this->assertSame(room_drone_persona_name($room, 2), $snap[2]['persona']);
        $this->assertNotNull($snap[2]['persona']);
    }

    public function testASeatTakesTheWinnersPrizeInCashWhenADroneStandsAlone(): void
    {
        $room = $this->begun();
        $room['round'] = 2;
        foreach ($room['tanks'] as $i => $t) {
            $room['tanks'][$i]['hp'] = $t['seat'] === 2 ? 50 : 0;
        }
        $room['cash'][2] = 100;
        // Seats out of the shop's reach, so the prize is read back as it was paid.
        $room['seats'][2]['mode'] = 'open';
        $room['seats'][3]['mode'] = 'open';
        $events = [];
        $humanScores = $room['scores'];
        room_end_round($room, $events);
        $this->assertSame($humanScores, $room['scores'], 'the score rules do not change');
        $this->assertNotContains('roundwin', array_column($events, 't'));
        $this->assertContains('roundlost', array_column($events, 't'));
        $this->assertSame(100 + 500 + 2 * 100, $room['cash'][2], 'roundWinCash + round x 100');
    }

    public function testADroneEarnsTwiceTheDamageAndTheKillBonusInRoomsWhoeverTheVictim(): void
    {
        $room = $this->begun();
        $room['cash'][2] = 0;
        $room['cash'][3] = 0;
        $room['scores'][2] = 0;
        $before = $room['scores'];
        $idx = fn(int $seat) => array_search($seat, array_column($room['tanks'], 'seat'), true);
        $a = $idx(2);
        $b = $idx(3);
        $h = $idx(0);
        $room['tanks'][$b]['hp'] = 5;
        $room['tanks'][$h]['hp'] = 100;
        $events = [];
        room_hit_unit($room, $events, $h, 30, $room['tanks'][$a], $a, room_weapons()['shell'], true);
        $this->assertSame(60, $room['cash'][2], 'twice the damage to a player');
        room_hit_unit($room, $events, $b, 30, $room['tanks'][$a], $a, room_weapons()['shell'], true);
        $this->assertSame(60 + 60 + 300, $room['cash'][2], 'twice the damage and the kill bonus to a drone');
        $this->assertSame(0, $room['cash'][3]);
        $this->assertSame($before, $room['scores'], 'a drone earns cash, never score');
        room_hit_unit($room, $events, $a, 30, $room['tanks'][$a], $a, room_weapons()['shell'], true);
        $this->assertSame(420, $room['cash'][2], 'hurting itself earns nothing');
    }

    public function testAPlayersEarningsAreUnchanged(): void
    {
        $room = $this->begun();
        $idx = fn(int $seat) => array_search($seat, array_column($room['tanks'], 'seat'), true);
        [$h, $g, $d] = [$idx(0), $idx(1), $idx(2)];
        $room['cash'][0] = 0;
        $room['scores'][0] = 0;
        $room['cash'][1] = 0;
        $events = [];
        room_hit_unit($room, $events, $d, 30, $room['tanks'][$h], $h, room_weapons()['shell'], true);
        $this->assertSame([60, 60], [$room['cash'][0], $room['scores'][0]], 'a player hitting a drone pays score and cash');
        room_hit_unit($room, $events, $g, 30, $room['tanks'][$h], $h, room_weapons()['shell'], true);
        $this->assertSame([60, 60], [$room['cash'][0], $room['scores'][0]], 'a player hitting a player pays nothing');
        $room['tanks'][$d]['hp'] = 5;
        room_hit_unit($room, $events, $d, 30, $room['tanks'][$h], $h, room_weapons()['shell'], true);
        $this->assertSame([60 + 60 + 300, 60 + 60 + 300], [$room['cash'][0], $room['scores'][0]]);
    }

    public function testADroneSeatsShieldAbsorbsOneHit(): void
    {
        $room = $this->begun();
        $idx = fn(int $seat) => array_search($seat, array_column($room['tanks'], 'seat'), true);
        [$h, $d] = [$idx(0), $idx(2)];
        $room['shield'][2] = true;
        $room['cash'][0] = 0;
        $hp = $room['tanks'][$d]['hp'];
        $events = [];
        room_hit_unit($room, $events, $d, 30, $room['tanks'][$h], $h, room_weapons()['shell'], true);
        $this->assertSame($hp, $room['tanks'][$d]['hp']);
        $this->assertFalse($room['shield'][2]);
        $this->assertContains('shield', array_column($events, 't'));
        $this->assertSame(0, $room['cash'][0], 'an absorbed hit pays nothing');
        room_hit_unit($room, $events, $d, 30, $room['tanks'][$h], $h, room_weapons()['shell'], true);
        $this->assertSame($hp - 30, $room['tanks'][$d]['hp']);
    }

    public function testADroneCarriesAndSpendsItsShellsAndParachutesAcrossRounds(): void
    {
        $room = $this->begun();
        $d = array_search(2, array_column($room['tanks'], 'seat'), true);
        $room['tanks'][$d]['ammo']['buck'] = 0;
        $room['tanks'][$d]['chutes'] = 1;
        $room['tanks'][$d]['hp'] = 40;
        $room['cash'][2] = 0;
        $room['cash'][3] = 0;
        $room['plate'][2] = 0;
        $events = [];
        room_end_round($room, $events);
        $this->assertSame(0, $room['ammo'][2]['buck']);
        $this->assertSame(1, $room['chutes'][2]);
        $this->assertSame(40, $room['armor'][2]);
        $this->assertSame('shop', $room['phase']);
    }

    public function testADronesShopsGoThroughRoomBuyWhichNeverRefusesADroneSeatForBeingOut(): void
    {
        $room = $this->begun();
        $this->assertSame(0, $room['seats'][2]['lives'], 'a drone seat has no lives');
        $room['cash'][2] = 1000;
        $this->assertNull(room_buy($room, 2, 'shield', 3));
        $this->assertTrue($room['shield'][2]);
        $room['seats'][0]['lives'] = 0;
        $this->assertSame(409, room_buy($room, 0, 'shield', 1)[0], 'a human who is out still cannot buy');
    }

    public function testAHumanWhoLeavesKeepsTheirOwnEconomyForTheBot(): void
    {
        $room = $this->begun();
        $room['cash'][1] = 777;
        $room['ammo'][1]['buck'] = 5;
        $room['plate'][1] = 2;
        $room['armor'][1] = 140;
        $room['chutes'][1] = 3;
        $room['shield'][1] = true;
        $this->assertTrue(room_leave($room, 1));
        $this->assertTrue(!empty($room['seats'][1]['bot']));
        $this->assertSame([777, 5, 2, 140, 3, true], [$room['cash'][1], $room['ammo'][1]['buck'], $room['plate'][1], $room['armor'][1], $room['chutes'][1], $room['shield'][1]]);
        $t = $room['tanks'][array_search(1, array_column($room['tanks'], 'seat'), true)];
        $this->assertSame('ai', $t['kind']);
        $this->assertSame(5, $t['ammo']['buck'], 'the bot fires the leaver\'s own shells');
        $this->assertSame(3, $t['chutes']);
        $this->assertNotSame('', $room['persona'][1]['personality'], 'the bot is dealt a personality');
        // And it shops with that economy at the round's end.
        $room['cash'][1] = 0;
        $events = [];
        room_end_round($room, $events);
        $this->assertSame(0, $room['cash'][1] < 0 ? 1 : 0);
    }

    public function testPlayAgainResetsEveryDroneSeatToTheStartingValues(): void
    {
        $room = $this->begun();
        $room['cash'][2] = 5;
        $room['plate'][2] = 4;
        $room['phase'] = 'over';
        $this->assertTrue(room_again($room));
        $this->assertSame([600, 0, 100, 0], [$room['cash'][2], $room['plate'][2], $room['armor'][2], $room['chutes'][2]]);
        $this->assertSame(room_start_ammo(), $room['ammo'][2]);
        $this->assertArrayNotHasKey('persona', $room);
    }
}
