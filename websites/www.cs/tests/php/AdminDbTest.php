<?php
// The admin database: private file, secure_delete on, schema present, and the
// copy of the kit's StoreDir never drifts from the kit's.
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

require_once __DIR__ . '/AdminFakes.php';

final class AdminDbTest extends TestCase
{
    public function testSchemaAndPragmas(): void
    {
        $db = admin_tmp_db();
        $tables = $db->query("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")->fetchAll(PDO::FETCH_COLUMN);
        self::assertSame(['key_hits', 'keys', 'link_requests', 'links', 'sessions'], $tables);
        self::assertSame(1, (int) $db->query('PRAGMA secure_delete')->fetchColumn());
    }

    public function testDatabaseFileIsPrivate(): void
    {
        $dir = admin_tmp_dir();
        Admin\Db::open($dir);
        self::assertSame(0600, fileperms("$dir/admin.sqlite") & 0777);
        foreach (["$dir/admin.sqlite-wal", "$dir/admin.sqlite-shm"] as $side) {
            if (file_exists($side)) {
                self::assertSame(0, fileperms($side) & 0077, "$side has no group or other access");
            }
        }
    }

    public function testStoreDirCopyMatchesTheKit(): void
    {
        $root = dirname(__DIR__, 2);
        self::assertSame(
            file_get_contents("$root/games/_kit/php/store-dir.php"),
            file_get_contents("$root/admin/lib/store-dir.php"),
            'admin/lib/store-dir.php is a copy of games/_kit/php/store-dir.php',
        );
    }

    public function testStoreModesCopyMatchesTheKit(): void
    {
        $root = dirname(__DIR__, 2);
        $kit = (string) file_get_contents("$root/games/_kit/php/score-guard.php");
        $start = (int) strpos($kit, "/**\n * The file modes");
        $open = (int) strpos($kit, '{', (int) strpos($kit, 'final class StoreModes', $start));
        $depth = 0;
        $end = $open;
        for ($i = $open, $n = strlen($kit); $i < $n; $i++) {
            $depth += $kit[$i] === '{' ? 1 : ($kit[$i] === '}' ? -1 : 0);
            if ($depth === 0) {
                $end = $i;
                break;
            }
        }
        $block = substr($kit, $start, $end - $start + 1);
        self::assertStringContainsString('final class StoreModes', $block);
        self::assertStringContainsString(
            $block,
            (string) file_get_contents("$root/admin/lib/store-modes.php"),
            'admin/lib/store-modes.php holds the kit\'s StoreModes class verbatim',
        );
    }

    public function testASymlinkedDataDirIsRefusedWithoutPaths(): void
    {
        $base = admin_tmp_dir();
        symlink(sys_get_temp_dir(), "$base/link");
        putenv("ADMIN_DATA_DIR=$base/link");
        try {
            Admin\Db::dataDir();
            self::fail('a symlink must be refused');
        } catch (Admin\StorageUnavailable $e) {
            self::assertStringContainsString('is a symbolic link', $e->getMessage(), 'the log names the problem');
            $body = Admin\Pages::fromStorageError($e)->body;
            self::assertStringNotContainsString($e->getMessage(), $body);
            self::assertStringNotContainsString($base, $body);
            self::assertStringNotContainsString('link', $body);
            self::assertStringNotContainsString(sys_get_temp_dir(), $body);
        } finally {
            putenv('ADMIN_DATA_DIR');
        }
    }
}
