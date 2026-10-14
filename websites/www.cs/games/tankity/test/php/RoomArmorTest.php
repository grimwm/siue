<?php
// games/tankity/test/php/RoomArmorTest.php
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

/* Armor carries between rounds, repairs stop at max, plates add max and armor,
   and a wreck re-musters at full max (src/armor.ts is the same). */
final class RoomArmorTest extends TestCase
{
    public static function setUpBeforeClass(): void
    {
        require_once __DIR__ . '/rooms-lib.php';
    }

    /** Host HUM at seat 0 against one drone, round 1 started. */
    private function room(): array
    {
        $room = room_new('ARMR', 'HUM');
        $room['seats'][0] = room_seat_human('HUM', 't0', [], '');
        $room['seats'][1] = room_idle_seat(1, 'ai');
        $room['seats'][2] = room_idle_seat(2, 'open');
        $room['seats'][3] = room_idle_seat(3, 'open');
        room_seat_economy($room, 0);
        room_start_round($room);
        return $room;
    }

    private function human(array $room): array
    {
        foreach ($room['tanks'] as $t) {
            if ($t['kind'] === 'human') {
                return $t;
            }
        }
        $this->fail('no human tank');
    }

    private function setHp(array &$room, string $kind, int $hp): void
    {
        foreach ($room['tanks'] as &$t) {
            if ($t['kind'] === $kind) {
                $t['hp'] = $hp;
            }
        }
        unset($t);
    }

    public function testFirstRoundMustersAtOneHundred(): void
    {
        $me = $this->human($this->room());
        $this->assertSame(100, $me['hp']);
        $this->assertSame(100, $me['maxHp']);
    }

    public function testDamageCarriesIntoTheNextRound(): void
    {
        $room = $this->room();
        $this->setHp($room, 'human', 64);
        $this->setHp($room, 'ai', 0);
        $events = [];
        room_end_round($room, $events);
        room_shop_set_ready($room, 0, true);
        $this->assertTrue(room_shop_settle($room));
        $me = $this->human($room);
        $this->assertSame(64, $me['hp']);
        $this->assertSame(100, $me['maxHp']);
    }

    public function testARepairPaidForBeforeTheArmorRulesStillLands(): void
    {
        // A room saved by the earlier version banked the repair in `repair[seat]`.
        $room = $this->room();
        $this->setHp($room, 'human', 40);
        $this->setHp($room, 'ai', 0);
        $events = [];
        room_end_round($room, $events);
        $room['repair'][0] = 30;
        room_shop_set_ready($room, 0, true);
        $this->assertTrue(room_shop_settle($room));
        $this->assertSame(70, $this->human($room)['hp']);
        $this->assertSame(0, $room['repair'][0]);
    }

    public function testAWreckReMustersAtFullMaxWithPlatesKept(): void
    {
        $room = $this->room();
        room_fit_plate($room, 0, 2);
        $this->setHp($room, 'human', 0);
        $events = [];
        room_end_round($room, $events);
        $this->assertSame(2, $room['seats'][0]['lives']);
        $this->assertSame(150, $room['armor'][0]);
        $this->assertSame(2, $room['plate'][0]);
        room_shop_set_ready($room, 0, true);
        room_shop_settle($room);
        $me = $this->human($room);
        $this->assertSame(150, $me['hp']);
        $this->assertSame(150, $me['maxHp']);
    }

    public function testRepairRestoresUpToMax(): void
    {
        $room = $this->room();
        room_fit_plate($room, 0, 3);
        $room['armor'][0] = 160;
        $this->assertSame(1, room_repair_packs_wanted($room, 0, 40));
        $this->assertSame(15, room_repair($room, 0, 40));
        $this->assertSame(175, $room['armor'][0]);
        $this->assertSame(0, room_repair($room, 0, 40));
        $this->assertSame(0, room_repair_packs_wanted($room, 0, 40));
    }

    public function testAPlateAddsMaxAndArmorNow(): void
    {
        $room = $this->room();
        $room['armor'][0] = 60;
        room_fit_plate($room, 0, 1);
        $this->assertSame(125, room_max_armor($room, 0));
        $this->assertSame(85, $room['armor'][0]);
    }

    public function testDronesAreUnchanged(): void
    {
        $room = $this->room();
        foreach ($room['tanks'] as $t) {
            if ($t['kind'] === 'ai') {
                $this->assertSame(60, $t['hp']);
            }
        }
    }

    public function testDronesStayOnTheirOwnCurveInLaterRounds(): void
    {
        $room = $this->room();
        $this->setHp($room, 'ai', 0);
        $events = [];
        room_end_round($room, $events);
        room_shop_set_ready($room, 0, true);
        room_shop_settle($room);
        foreach ($room['tanks'] as $t) {
            if ($t['kind'] === 'ai') {
                $this->assertSame(66, $t['hp']);
                $this->assertSame(66, $t['maxHp']);
            }
        }
    }

    public function testAnEliminatedSeatKeepsItsArmorUntouched(): void
    {
        $room = $this->room();
        $room['seats'][0]['lives'] = 1;
        $room['armor'][0] = 40;
        $this->setHp($room, 'human', 0);
        $events = [];
        room_end_round($room, $events);
        $this->assertSame(40, $room['armor'][0]);
    }

    public function testFuelStillBanksAndNothingElseDoes(): void
    {
        $room = $this->room();
        $room['fuelBonus'][0] = 60;
        $this->setHp($room, 'ai', 0);
        $events = [];
        room_end_round($room, $events);
        room_shop_set_ready($room, 0, true);
        room_shop_settle($room);
        $this->assertSame(140.0, (float) $this->human($room)['fuel']);
        $this->assertArrayNotHasKey('repair', $room);
        $this->assertArrayNotHasKey('repairApplied', $room);
    }
}
