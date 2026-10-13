<?php
// games/tankity/test/php/RoomStoreTest.php
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

/* Rooms as rows: a held room is one write transaction from load to unlock,
   the cap is exact, idle rooms are gone, and nothing is left locked. */
final class RoomStoreTest extends TestCase
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
        putenv('TANKITY_ROOM_MAX_AGE=3600');
    }

    protected function tearDown(): void
    {
        room_release_all();
        putenv('TANKITY_ROOM_LIVE_SECS');
        putenv('TANKITY_ROOM_MAX_AGE');
        tankity_test_rm($this->dir);
    }

    private function make(string $initials = 'TST'): string
    {
        $lock = room_alloc();
        $this->assertTrue(room_save($lock, $lock->code, room_new($lock->code, $initials)));
        $this->assertTrue(room_register($lock->code, 10));
        room_unlock($lock);
        return $lock->code;
    }

    private function rows(): int
    {
        return (int) tankity_db()->query('SELECT COUNT(*) FROM rooms')->fetchColumn();
    }

    public function testARoomSavedIsTheRoomLoaded(): void
    {
        $code = $this->make();
        [$room, $lock] = room_load($code);
        $this->assertSame($code, $room['code']);
        $this->assertInstanceOf(RoomLock::class, $lock);
        room_unlock($lock);
        $this->assertSame(1, room_count());
    }

    public function testAMissingCodeLoadsNothingAndHoldsNothing(): void
    {
        $this->assertSame([null, null, 'ZZZZ'], room_load('ZZZZ'));
        $this->assertSame(0, tankity_depth(tankity_db()));
        tankity_tx(tankity_db(), fn() => null);
        $this->assertSame(0, $this->rows());
    }

    public function testACollidingCodeDrawsAnother(): void
    {
        $taken = $this->make();
        $feed = [$taken, $taken, 'WXYZ'];
        $tries = 0;
        $lock = room_alloc(function () use (&$feed, &$tries): string {
            $tries++;
            return array_shift($feed);
        });
        $this->assertSame(['WXYZ', 3], [$lock->code, $tries]);
        room_discard($lock);
        $this->assertSame(1, $this->rows());
    }

    public function testTheCapIsCheckedUnderTheSameLock(): void
    {
        for ($i = 0; $i < 3; $i++) {
            $this->make();
        }
        $lock = room_alloc();
        room_save($lock, $lock->code, room_new($lock->code, 'CAP'));
        $this->assertFalse(room_register($lock->code, 3));
        $this->assertTrue(room_register($lock->code, 4));
        room_discard($lock);
        $this->assertSame(3, room_count());
    }

    public function testAHeldRoomKeepsOtherWritersOut(): void
    {
        $code = $this->make();
        [, $lock] = room_load($code);
        $other = new PDO('sqlite:' . $this->dir . '/' . TANKITY_DB_FILE, null, null, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
        $other->exec('PRAGMA busy_timeout = 50');
        try {
            $other->exec('BEGIN IMMEDIATE');
            $this->fail('a second writer got in while the room was held');
        } catch (PDOException $e) {
            $this->assertTrue(tankity_busy($e));
        }
        room_unlock($lock);
        $other->exec('BEGIN IMMEDIATE');
        $other->exec('ROLLBACK');
    }

    public function testAPeekReadsWithoutTheLock(): void
    {
        $code = $this->make();
        $other = new PDO('sqlite:' . $this->dir . '/' . TANKITY_DB_FILE, null, null, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
        $other->exec('BEGIN IMMEDIATE');
        try {
            $this->assertSame($code, room_peek($code)['code']);
        } finally {
            $other->exec('ROLLBACK');
        }
        room_test_age($code, 120);
        $this->assertNull(room_peek($code), 'an idle room is not there to read');
    }

    public function testAnIdleRoomIsUncountedAndGoneOnLoad(): void
    {
        $code = $this->make();
        room_test_age($code, 120);
        $this->assertSame(0, room_count());
        $this->assertSame([null, null, $code], room_load($code));
        $this->assertSame(0, $this->rows());
    }

    public function testTheSweepDropsIdleRoomsOnlyAndIsBounded(): void
    {
        $keep = $this->make();
        $a = $this->make();
        $b = $this->make();
        room_test_age($a, 120);
        room_test_age($b, 4000);
        $this->assertSame(1, room_sweep(null, 1));
        $this->assertSame(1, room_sweep());
        $this->assertSame(0, room_sweep());
        $this->assertSame([$keep], tankity_db()->query('SELECT code FROM rooms')->fetchAll(PDO::FETCH_COLUMN));
    }

    public function testClosingDeletesTheRow(): void
    {
        $code = $this->make();
        [, $lock] = room_load($code);
        room_close($lock);
        $this->assertSame(0, $this->rows());
        $this->assertSame([null, null, $code], room_load($code));
    }

    public function testAnOversizedRoomIsRefused(): void
    {
        $lock = room_alloc();
        $this->assertFalse(room_save($lock, $lock->code, room_new($lock->code, 'BIG') + ['pad' => str_repeat('x', ROOM_MAX_BYTES)]));
        room_discard($lock);
    }

    public function testARequestThatEndsHoldingARoomKeepsOnlyWhatItSaved(): void
    {
        $unsaved = room_alloc();
        room_release_all();
        $this->assertSame(0, $this->rows());
        $saved = room_alloc();
        room_save($saved, $saved->code, room_new($saved->code, 'SAV'));
        room_release_all();
        $this->assertSame(1, $this->rows());
        $this->assertFalse($unsaved->open);
    }
}
