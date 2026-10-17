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
        self::assertSame(0, fileperms("$dir/admin.sqlite") & 0007, 'no access for others');
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
        $class = substr($kit, (int) strpos($kit, "/**\n * The file modes"));
        self::assertStringContainsString(
            trim($class),
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
            self::assertStringNotContainsString(sys_get_temp_dir(), Admin\Pages::storageDown()->body);
        } finally {
            putenv('ADMIN_DATA_DIR');
        }
    }
}
