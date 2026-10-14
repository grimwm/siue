<?php
// games/tankity/test/php/DbTest.php
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

/* The database: private, at the latest schema, the journal its filesystem
   allows, one writer at a time. */
final class DbTest extends TestCase
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
        putenv('TANKITY_JOURNAL');
        tankity_test_rm($this->dir);
    }

    public function testANewDatabaseIsPrivateAndAtTheLatestSchema(): void
    {
        $db = tankity_db();
        $path = $this->dir . '/' . TANKITY_DB_FILE;
        $this->assertSame(0600, fileperms($path) & 0777);
        $this->assertSame(max(array_keys(tankity_schema_steps())), (int) $db->query('PRAGMA user_version')->fetchColumn());
        $this->assertSame(TANKITY_BUSY_MS, (int) $db->query('PRAGMA busy_timeout')->fetchColumn());
        $this->assertSame(tankity_journal_mode($this->dir), strtolower((string) $db->query('PRAGMA journal_mode')->fetchColumn()));
        $tables = $db->query("SELECT name FROM sqlite_master WHERE type = 'table'")->fetchAll(PDO::FETCH_COLUMN);
        foreach (['meta', 'rooms', 'board', 'rate'] as $t) {
            $this->assertContains($t, $tables);
        }
        $this->assertSame(5, max(array_keys(tankity_schema_steps())));
        foreach (['solo_runs', 'solo_rate', 'callsigns', 'legacy_imported'] as $t) {
            $this->assertNotContains($t, $tables);
        }
    }

    public function testStepFiveKeepsOnlyTheRoomRowsAndAddsTheRateTable(): void
    {
        // Production is at v4: room rows the server filed, and 'client' rows a browser claimed.
        $db = new PDO('sqlite:' . $this->dir . '/' . TANKITY_DB_FILE, null, null, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
        foreach ([1, 2, 3, 4] as $v) {
            foreach (tankity_schema_steps()[$v] as $q) {
                $db->exec($q);
            }
        }
        $db->exec('PRAGMA user_version = 4');
        // Old callsign rows still waiting to convert, and the record of imported files.
        $db->exec("INSERT INTO callsigns (slug, data) VALUES ('wmg', '{}')");
        $db->exec("INSERT INTO legacy_imported (name, hash, at) VALUES ('wmg-operation-tankity.json', 'h', 'x')");
        $ins = $db->prepare("INSERT INTO board (difficulty, initials, score, rounds, seed, at, source) VALUES (?, ?, ?, 1, ?, 'x', ?)");
        foreach ([['normal', 'WMG', 900, 's', 'client'], ['normal', 'RUM', 500, 'room:ABCD', 'room'], ['hard', 'AAA', 800, 's', 'client'],
            ['easy', 'TWO', 100, 'room:WXYZ', 'room']] as $r) {
            $ins->execute($r);
        }
        $db = null;
        $db = tankity_db();
        $this->assertSame(5, (int) $db->query('PRAGMA user_version')->fetchColumn());
        $this->assertSame([['RUM', 'room'], ['TWO', 'room']], $db->query('SELECT initials, source FROM board ORDER BY id')->fetchAll(PDO::FETCH_NUM));
        $this->assertSame(0, (int) $db->query('SELECT COUNT(*) FROM rate')->fetchColumn());
        $this->assertSame(['client', 'kind', 'slot', 'n'], $db->query('PRAGMA table_info(rate)')->fetchAll(PDO::FETCH_COLUMN, 1));
        $this->assertNotContains('standin', $db->query('PRAGMA table_info(board)')->fetchAll(PDO::FETCH_COLUMN, 1));
        $tables = $db->query("SELECT name FROM sqlite_master WHERE type = 'table'")->fetchAll(PDO::FETCH_COLUMN);
        $this->assertNotContains('callsigns', $tables, 'the old callsigns were solo claims too');
        $this->assertNotContains('legacy_imported', $tables);
    }

    public function testADatabaseNewerThanThisServerIsRefused(): void
    {
        // A schema this code does not know would fail later on a column it lacks; refuse it up front.
        $path = $this->dir . '/' . TANKITY_DB_FILE;
        $future = new PDO('sqlite:' . $path);
        $future->exec('PRAGMA user_version = ' . (max(array_keys(tankity_schema_steps())) + 1));
        $future = null;
        $this->expectErrorLog();
        try {
            tankity_db();
            $this->fail('a newer database was opened');
        } catch (TankityStorageRefused $e) {
            $this->assertStringContainsString('newer', $e->getMessage());
        }
    }

    public function testTheDirectoryAndEveryDatabaseFileArePrivateUnderALooseUmask(): void
    {
        $old = umask(0022);
        try {
            $db = tankity_db();
            $db->exec("INSERT INTO meta (k, v) VALUES ('w', '1')");
            $this->assertSame(0022, umask(), 'the umask is back as it was');
        } finally {
            umask($old);
        }
        $this->assertSame(0700, fileperms($this->dir) & 0777);
        $files = glob($this->dir . '/' . TANKITY_DB_FILE . '*') ?: [];
        $this->assertContains($this->dir . '/' . TANKITY_DB_FILE, $files);
        if (tankity_journal_mode($this->dir) === 'wal') {
            $this->assertContains($this->dir . '/' . TANKITY_DB_FILE . '-wal', $files);
            $this->assertContains($this->dir . '/' . TANKITY_DB_FILE . '-shm', $files);
        }
        foreach ($files as $f) {
            $this->assertSame(0600, fileperms($f) & 0777, "$f is private");
        }
    }

    public function testASymlinkedDatabaseIsRefused(): void
    {
        symlink($this->dir . '/elsewhere.sqlite', $this->dir . '/' . TANKITY_DB_FILE);
        $before = umask();
        try {
            tankity_db();
            $this->fail('a symlinked database was opened');
        } catch (TankityStorageRefused) {
            // refused
        }
        $this->assertSame($before, umask(), 'the umask is untouched by a refused open');
    }

    public function testTheSchemaStepsRunOnce(): void
    {
        $db = tankity_db();
        tankity_schema($db);
        $this->assertSame(max(array_keys(tankity_schema_steps())), (int) $db->query('PRAGMA user_version')->fetchColumn());
    }

    public function testTheJournalFollowsTheFilesystem(): void
    {
        $mounts = "/dev/sda1 / ext4 rw 0 0\nfiler:/home /home nfs4 rw 0 0\ntmpfs /run tmpfs rw 0 0\n//srv/share /mnt/my\\040share cifs rw 0 0\n";
        $this->assertSame('ext4', tankity_fs_type('/srv/tankity', $mounts));
        $this->assertSame('nfs4', tankity_fs_type('/home/wgrim/public_html/games/tankity/data', $mounts));
        $this->assertSame('cifs', tankity_fs_type('/mnt/my share/db', $mounts));
        $this->assertSame('wal', tankity_journal_mode('/srv/tankity', $mounts));
        $this->assertSame('delete', tankity_journal_mode('/home/wgrim', $mounts));
        $this->assertSame('delete', tankity_journal_mode('/mnt/my share', $mounts));
        $this->assertNull(tankity_fs_type('/srv/tankity', ''));
        $this->assertSame('delete', tankity_journal_mode('/srv/tankity', ''), 'an unreadable mount table is not trusted');
    }

    public function testTheJournalSettingOverrides(): void
    {
        putenv('TANKITY_JOURNAL=delete');
        $this->assertSame('delete', tankity_journal_mode('/srv/tankity', "/dev/sda1 / ext4 rw 0 0\n"));
    }

    public function testAFailedTransactionLeavesNothing(): void
    {
        $db = tankity_db();
        try {
            tankity_tx($db, function (PDO $db): void {
                $db->exec("INSERT INTO meta (k, v) VALUES ('x', '1')");
                throw new RuntimeException('boom');
            });
        } catch (RuntimeException) {
            // expected: the point is what it left behind
        }
        $this->assertFalse($db->query("SELECT v FROM meta WHERE k = 'x'")->fetchColumn());
        $this->assertSame(0, tankity_depth($db));
    }

    public function testAnInnerTransactionJoinsTheOuterOne(): void
    {
        $db = tankity_db();
        tankity_tx($db, function (PDO $db): void {
            tankity_tx($db, fn(PDO $db) => $db->exec("INSERT INTO meta (k, v) VALUES ('inner', '1')"));
            $this->assertSame(1, tankity_depth($db));
        });
        $this->assertSame('1', $db->query("SELECT v FROM meta WHERE k = 'inner'")->fetchColumn());
    }

    public function testASecondWriterWaitsThenGivesUpBusy(): void
    {
        $db = tankity_db();
        $other = new PDO('sqlite:' . $this->dir . '/' . TANKITY_DB_FILE, null, null, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
        $other->exec('PRAGMA busy_timeout = 100');
        $db->exec('BEGIN IMMEDIATE');
        try {
            $t = microtime(true);
            try {
                tankity_tx($other, fn() => null);
                $this->fail('a second writer got in');
            } catch (PDOException $e) {
                $this->assertTrue(tankity_busy($e));
            }
            $this->assertGreaterThanOrEqual(0.09, microtime(true) - $t);
        } finally {
            $db->exec('ROLLBACK');
        }
    }
}
