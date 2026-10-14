<?php
// games/tankity/test/php/HousekeepTest.php
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

/* Cleanup without cron: at most once per interval, bounded, never failing the
   request, on a fake clock. */
final class HousekeepTest extends TestCase
{
    private string $dir;

    public static function setUpBeforeClass(): void
    {
        require_once __DIR__ . '/rooms-lib.php';
    }

    protected function setUp(): void
    {
        $this->dir = tankity_test_dir();
        mkdir($this->dir . '/old', 0700);
        putenv('TANKITY_SCORES_DIR=' . $this->dir . '/old');
        putenv('TANKITY_ROOM_LIVE_SECS=60');
    }

    protected function tearDown(): void
    {
        putenv('TANKITY_SCORES_DIR');
        putenv('TANKITY_ROOM_LIVE_SECS');
        tankity_test_rm($this->dir);
    }

    public function testItRunsAtMostOncePerInterval(): void
    {
        $job = ['n' => fn(int $now): int => 1];
        $this->assertSame(['n' => 1], tankity_housekeep(1_000_000, $job));
        $this->assertNull(tankity_housekeep(1_000_000 + HOUSEKEEP_EVERY - 1, $job));
        $this->assertSame(['n' => 1], tankity_housekeep(1_000_000 + HOUSEKEEP_EVERY, $job));
    }

    public function testAFailingJobDoesNotStopTheOthers(): void
    {
        $out = tankity_housekeep(2_000_000, [
            'bad' => function (int $now): int { throw new RuntimeException('boom'); },
            'good' => fn(int $now): int => 3,
        ]);
        $this->assertSame(['bad' => -1, 'good' => 3], $out);
    }

    public function testABusyDatabaseSkipsItQuietly(): void
    {
        $other = new PDO('sqlite:' . $this->dir . '/' . TANKITY_DB_FILE, null, null, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
        tankity_db();
        $other->exec('BEGIN IMMEDIATE');
        try {
            $this->assertNull(tankity_housekeep(3_000_000, ['n' => fn(int $now): int => 1]));
        } finally {
            $other->exec('ROLLBACK');
        }
    }

    public function testTheJobsAreTheRoomsAndTheRateCounts(): void
    {
        $this->assertSame(['legacy', 'callsigns', 'rooms', 'rate'], array_keys(tankity_jobs()));
    }

    public function testOldRateCountsGo(): void
    {
        $now = 1_800_000_000;
        $this->assertTrue(room_rate_take('lab', $now));
        $this->assertSame(0, tankity_jobs()['rate']($now + 3600));
        $this->assertSame(1, tankity_jobs()['rate']($now + 3600 + 2 * RATE_SLOT));
    }

    public function testIdleRoomsAndOldFilesGo(): void
    {
        $lock = room_alloc();
        room_save($lock, $lock->code, room_new($lock->code, 'OLD'));
        room_unlock($lock);
        room_test_age($lock->code, 600);
        file_put_contents($this->dir . '/old/wg-operation-tankity.json',
            json_encode(['name' => 'wg', 'runs' => [['score' => 5, 'banked' => 1, 'won' => false, 'seed' => 'a', 'ts' => '2026-01-01T00:00:00+00:00']], 'best' => 5]));
        $out = tankity_housekeep(time(), tankity_jobs());
        $this->assertSame(1, $out['rooms']);
        $this->assertSame(2, $out['legacy'], 'one file imported, the same file deleted');
        $this->assertSame(0, (int) tankity_db()->query('SELECT COUNT(*) FROM rooms')->fetchColumn());
        $this->assertFileDoesNotExist($this->dir . '/old/wg-operation-tankity.json');
    }
}
