<?php
// games/tankity/test/php/RoomRetireTest.php
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

/* A room saved while a seat held a gun the arsenal has since dropped: the
   retired gun's shells come back as room cash at its old price per shell, a
   key the arsenal never had is dropped, a loaded one falls back to the Shell,
   and the room plays on without meeting a key the sim cannot fire. */
final class RoomRetireTest extends TestCase
{
    private string $dir;

    public static function setUpBeforeClass(): void
    {
        require_once __DIR__ . '/rooms-lib.php';
    }

    protected function setUp(): void
    {
        $this->dir = tankity_test_dir();
        putenv('TANKITY_ROOM_LIVE_SECS=60');
    }

    protected function tearDown(): void
    {
        room_release_all();
        putenv('TANKITY_ROOM_LIVE_SECS');
        tankity_test_rm($this->dir);
    }

    /** The first two retired guns in game.json, with what a shell of each refunds. */
    private static function retired(): array
    {
        $r = room_retired();
        self::assertGreaterThanOrEqual(2, count($r), 'game.json retires at least two guns');
        foreach (array_keys($r) as $k) {
            self::assertArrayNotHasKey($k, room_weapons(), "$k is retired and still in the arsenal");
        }
        return array_slice($r, 0, 2, true);
    }

    /** A playing room whose seat 0 holds 3 of one retired gun, 1 of another and 5 of a key nobody knows, the second one loaded. */
    private static function stale(): array
    {
        [[$a, $pa], [$b, $pb]] = array_map(null, array_keys(self::retired()), array_values(self::retired()));
        $room = room_new('OLDG', 'HUM');
        $room['seats'][0] = room_seat_human('HUM', 't0', [], '');
        room_seat_economy($room, 0);
        $room['ammo'][0] += [$a => 3, $b => 1, 'nosuchgun' => 5];
        $room['weapon'][0] = $b;
        $room['tanks'] = [
            ['kind' => 'human', 'seat' => 0, 'x' => 100.0, 'y' => 400.0, 'hp' => 100, 'ammo' => $room['ammo'][0]],
            ['kind' => 'ai', 'seat' => 1, 'x' => 500.0, 'y' => 400.0, 'hp' => 60, 'ammo' => ['shell' => -1, $a => 2]],
        ];
        return [$room, 600 + 3 * $pa + $pb, [$a, $b]];
    }

    public function testRetiredShellsAreRefundedAtTheirOldPricePerShell(): void
    {
        [$room, $cash, $keys] = self::stale();
        $this->assertTrue(room_retire_guns($room));
        $this->assertSame($cash, $room['cash'][0]);
        foreach ([...$keys, 'nosuchgun'] as $k) {
            $this->assertArrayNotHasKey($k, $room['ammo'][0]);
            $this->assertArrayNotHasKey($k, $room['tanks'][0]['ammo']);
            $this->assertArrayNotHasKey($k, $room['tanks'][1]['ammo'], 'a drone drops its retired shells too');
        }
        $this->assertSame(-1, $room['ammo'][0]['shell'], 'the Shell stays endless');
        $this->assertSame('shell', $room['weapon'][0], 'a retired gun loaded falls back to the Shell');
    }

    public function testACleanRoomIsLeftAlone(): void
    {
        [$room] = self::stale();
        room_retire_guns($room);
        $once = $room;
        $this->assertFalse(room_retire_guns($room), 'refunded once only');
        $this->assertSame($once, $room);
    }

    public function testMalformedStockNeverCrashes(): void
    {
        $room = room_new('ODDS', 'HUM');
        $room['ammo'] = [0 => 'junk', 1 => [array_key_first(self::retired()) => 'x']];
        $room['weapon'] = [0 => 7];
        $room['tanks'] = [['ammo' => null], 'junk'];
        room_retire_guns($room);
        $this->assertSame([], $room['ammo'][1], 'a retired key with no count refunds nothing and goes');
        $this->assertSame('shell', $room['weapon'][0]);
    }

    public function testALoadedOrPolledRoomIsAlreadyRefunded(): void
    {
        [$room, $cash] = self::stale();
        $lock = room_alloc();
        $room['code'] = $lock->code;
        $this->assertTrue(room_save($lock, $lock->code, $room));
        room_unlock($lock);
        $peek = room_peek($lock->code);
        $this->assertSame($cash, $peek['cash'][0]);
        [$loaded, $held] = room_load($lock->code);
        room_unlock($held);
        $this->assertSame($cash, $loaded['cash'][0]);
        $this->assertSame('shell', $loaded['weapon'][0]);
        $this->assertFalse(room_retire_guns($loaded));
    }

    public function testTheRoomPlaysOnAfterTheRefund(): void
    {
        [$room] = self::stale();
        room_retire_guns($room);
        // The refund buys like any other cash.
        $had = $room['ammo'][0]['buck'] ?? 0;
        $this->assertNull(room_buy($room, 0, 'buck', 1));
        $this->assertSame($had + 2, $room['ammo'][0]['buck']);
    }
}
