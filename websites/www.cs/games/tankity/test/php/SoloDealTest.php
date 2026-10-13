<?php
// games/tankity/test/php/SoloDealTest.php
// server/solo.php's deal and muster: only a field width the rule accepts is
// dealt, the deal opens in the shop with one human and the browser's stake,
// and a muster stands every unit exactly on its column. The solo-deal sim
// vectors pin the draws themselves to the browser.
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

final class SoloDealTest extends TestCase
{
    public static function setUpBeforeClass(): void
    {
        require_once __DIR__ . '/rooms-lib.php';
    }

    public function testOnlyAWidthTheRuleAcceptsIsDealt(): void
    {
        foreach ([696, 1464, 1201, 0, -720] as $w) {
            try {
                solo_deal('alpha', 'normal', $w);
                $this->fail("width $w was dealt");
            } catch (InvalidArgumentException $e) {
                $this->assertSame("field width $w", $e->getMessage());
            }
        }
        $this->assertSame(744, solo_deal('alpha', 'normal', 744)['w']);
    }

    public function testADealOpensInTheShopWithOneHumanAndTheStake(): void
    {
        $s = solo_deal('alpha', 'hard', 1080);
        $this->assertSame('shop', $s['phase']);
        $this->assertSame('hard', room_difficulty($s));
        $this->assertSame(0, $s['round']);
        $this->assertSame([0 => ['human' => true, 'initials' => 'YOU', 'lives' => 3]], $s['seats']);
        $this->assertSame([600, 0, 3000, 100, 0], [$s['cash'][0], $s['scores'][0], $s['nextUp'][0], $s['armor'][0], $s['plate'][0]]);
        $this->assertSame(['shell' => -1, 'buck' => 1], array_filter($s['ammo'][0]));
        $this->assertSame(array_keys(room_weapons()), array_keys($s['ammo'][0]));
        $this->assertCount(1080, $s['terrain']);
        $this->assertSame([], $s['tanks']);
        $this->assertSame('normal', room_difficulty(solo_deal('alpha', 'nonsense', 720)));
    }

    public function testADealDrawsTheHillsAndTheCloudsAndNothingElse(): void
    {
        $rng = room_hash_seed('alpha');
        for ($i = 0; $i < 9 + 20; $i++) {
            room_rng_next($rng);
        }
        $this->assertSame($rng, solo_deal('alpha', 'normal', 720)['rng']);
    }

    public function testAMusterStandsEveryUnitOnItsColumnAndRotatesTheOpener(): void
    {
        $s = solo_deal('scorched-4242', 'normal', 1440);
        $turns = [];
        for ($r = 1; $r <= 5; $r++) {
            $s['round'] = $r;
            solo_muster($s);
            $this->assertSame('play', $s['phase']);
            $this->assertCount(4, $s['tanks']);
            foreach ($s['tanks'] as $t) {
                $this->assertSame($s['terrain'][max(0, min(count($s['terrain']) - 1, (int) det_round((float) $t['x'])))], $t['y']);
                $this->assertSame($t['x'] < 720 ? 1 : -1, $t['dirS']);
            }
            $this->assertSame([100, 60 + 6 * ($r - 1)], [$s['tanks'][0]['hp'], $s['tanks'][1]['hp']]);
            $turns[] = $s['turn'];
        }
        $this->assertSame([0, 1, 2, 3, 0], $turns);
        $this->assertSame(SOLO_FOES, array_keys($s['tactics']), 'each drone keeps the strategy it was dealt');
    }
}
