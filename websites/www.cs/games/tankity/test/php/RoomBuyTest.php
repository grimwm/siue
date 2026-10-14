<?php
// games/tankity/test/php/RoomBuyTest.php
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

/* The room shop: one function for every purchase, and Repair never banks. */
final class RoomBuyTest extends TestCase
{
    public static function setUpBeforeClass(): void
    {
        require_once __DIR__ . '/rooms-lib.php';
    }

    private function room(int $round = 1): array
    {
        $room = room_new('SHOP', 'HUM');
        $room['seats'][0] = room_seat_human('HUM', 't0', []);
        room_seat_economy($room, 0);
        $room['round'] = $round;
        return $room;
    }

    public function testASeatOutOfTheMatchCannotBuy(): void
    {
        $room = $this->room();
        $room['seats'][0]['lives'] = 0;
        $this->assertSame([409, 'You are out of this match.'], room_buy($room, 0, 'mortar', 1));
        $this->assertSame(600, $room['cash'][0]);
    }

    public function testRepairAtFullArmorIsRefusedAndCostsNothing(): void
    {
        $room = $this->room();
        $this->assertSame([409, 'armor is full'], room_buy($room, 0, 'repair', 1));
        $this->assertSame(600, $room['cash'][0]);
    }

    public function testRepairBuysOnlyThePacksThatFillTheHull(): void
    {
        $room = $this->room();
        $room['armor'][0] = 30;
        $this->assertNull(room_buy($room, 0, 'repair', 9));
        $this->assertSame(100, $room['armor'][0]);
        $this->assertSame(600 - 2 * 120, $room['cash'][0]);
    }

    public function testAPlateFromTheShop(): void
    {
        $room = $this->room();
        $this->assertNull(room_buy($room, 0, 'plate', 1));
        $this->assertSame(1, $room['plate'][0]);
        $this->assertSame(125, $room['armor'][0]);
        $this->assertSame(300, $room['cash'][0]);
    }

    public function testOneShotTricksNeverStack(): void
    {
        $room = $this->room();
        $this->assertNull(room_buy($room, 0, 'shield', 3));
        $this->assertTrue($room['shield'][0]);
        $this->assertSame(350, $room['cash'][0]);
    }

    public function testRoundOneGoodsSellBeforeRoundOne(): void
    {
        $room = $this->room(0);
        $this->assertNull(room_buy($room, 0, 'mortar', 1));
        $this->assertSame(2, $room['ammo'][0]['mortar']);
    }

    public function testLaterGoodsWaitForTheirRound(): void
    {
        $room = $this->room(1);
        $this->assertSame([409, 'Cluster unlocks in round 2'], room_buy($room, 0, 'cluster', 1));
        $this->assertSame([409, 'NUKE unlocks in round 4'], room_buy($room, 0, 'nuke', 1));
    }

    public function testShortOnCashAndNotForSale(): void
    {
        $room = $this->room();
        $this->assertSame([409, 'short on cash'], room_buy($room, 0, 'extralife', 1));
        $this->assertSame([422, 'not for sale'], room_buy($room, 0, 'shell', 1));
        $this->assertSame([422, 'not for sale'], room_buy($room, 0, 'rocket', 1));
    }

    public function testTheSnapshotCarriesArmorAndMax(): void
    {
        $room = $this->room();
        room_buy($room, 0, 'plate', 1);
        $room['armor'][0] = 90;
        $snap = room_snapshot($room, 0, 0);
        $this->assertSame(90, $snap['you']['armor']);
        $this->assertSame(125, $snap['you']['maxArmor']);
    }
}
