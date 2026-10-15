<?php
// games/tankity/test/php/RoomSchemaTest.php
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

/* Schema step 8: the columns the slot count, the lobby count and the reclaim
   read (written by every room_save), the tombstones of rooms closed to make
   space, and the spent puzzles. */
final class RoomSchemaTest extends TestCase
{
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
        room_release_all();
        tankity_test_rm($this->dir);
    }

    /** @return list<string> */
    private function columns(PDO $db, string $table): array
    {
        return array_column($db->query("PRAGMA table_info($table)")->fetchAll(PDO::FETCH_ASSOC), 'name');
    }

    public function testStepEightAddsTheColumnsAndTables(): void
    {
        $db = tankity_db();
        $this->assertSame(8, (int) $db->query('PRAGMA user_version')->fetchColumn());
        $this->assertContains('phase', $this->columns($db, 'rooms'));
        $this->assertContains('acted', $this->columns($db, 'rooms'));
        $this->assertContains('turn_secs', $this->columns($db, 'rooms'));
        $this->assertSame(['code', 'reason', 'at', 'seats'], $this->columns($db, 'closed'));
        $this->assertSame(['id', 'exp'], $this->columns($db, 'pow_used'));
    }

    public function testStepEightBackfillsLiveRows(): void
    {
        // A database left at version 7 by the server before this one.
        $path = $this->dir . '/' . TANKITY_DB_FILE;
        $old = new PDO('sqlite:' . $path, null, null, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
        foreach (array_slice(tankity_schema_steps(), 0, 7, true) as $sql) {
            foreach ($sql as $q) {
                $old->exec($q);
            }
        }
        $old->exec('PRAGMA user_version = 7');
        $ins = $old->prepare('INSERT INTO rooms (code, data, created, touched, expires) VALUES (?, ?, ?, ?, ?)');
        $lobby = ['code' => 'LOBY', 'phase' => 'lobby', 'touched' => 800];
        $play = ['code' => 'PLAY', 'phase' => 'play', 'actedAt' => 1000, 'turnSecs' => 86400, 'touched' => 1200];
        $shop = ['code' => 'SHOP', 'phase' => 'shop', 'touched' => 900];
        foreach ([[$lobby, 800], [$play, 1200], [$shop, 900]] as [$room, $touched]) {
            $ins->execute([$room['code'], serialize($room), 1, $touched, $touched + 600]);
        }
        $ins->execute(['JUNK', 'not a room', 1, 700, 1300]);
        $old = null;

        $db = tankity_db();
        $rows = $db->query('SELECT code, phase, acted, turn_secs FROM rooms ORDER BY code')->fetchAll(PDO::FETCH_NUM);
        $this->assertSame([
            ['JUNK', 'lobby', 0, 120],
            ['LOBY', 'lobby', 800, 120],
            ['PLAY', 'play', 1000, 86400],
            ['SHOP', 'shop', 900, 120],
        ], array_map(static fn(array $r): array => [$r[0], $r[1], (int) $r[2], (int) $r[3]], $rows));
    }

    public function testSaveWritesTheColumns(): void
    {
        $lock = room_alloc(fn() => 'COLS');
        $this->assertSame('lobby', (string) tankity_db()->query("SELECT phase FROM rooms WHERE code = 'COLS'")->fetchColumn(),
            'an allocated row is a lobby');
        $room = room_new('COLS', 'ABC');
        $room['phase'] = 'shop';
        $room['acted'] = 1234;
        $room['turnSecs'] = 600;
        $this->assertTrue(room_save($lock, 'COLS', $room));
        room_unlock($lock);
        $row = tankity_db()->query("SELECT phase, acted, turn_secs FROM rooms WHERE code = 'COLS'")->fetch(PDO::FETCH_NUM);
        $this->assertSame(['shop', 1234, 600], [$row[0], (int) $row[1], (int) $row[2]]);
    }

    public function testActedReadsTheOldKey(): void
    {
        $this->assertSame(5, room_acted(['actedAt' => 5]));
        $this->assertSame(7, room_acted(['acted' => 7, 'actedAt' => 5]));
        $this->assertSame(3, room_acted(['touched' => 3]));
    }
}
