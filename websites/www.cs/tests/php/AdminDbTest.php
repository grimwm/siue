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
        self::assertSame(['devices', 'key_hits', 'keys', 'link_requests', 'links', 'probes', 'sessions'], $tables);
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

    /** on the host PHP runs as the web user, while the site account owns admin/data (group-writable for PHP) */
    public function testTheOwnershipModelOfADataFolderTheSiteAccountOwns(): void
    {
        $web = 48;
        $site = 1000;
        $other = 1001;
        self::assertTrue(Kit\StoreDir::ownerTrusted($web, $site, $web), 'a file PHP made');
        self::assertTrue(Kit\StoreDir::ownerTrusted($site, $site, $web), 'a file the site account put there');
        self::assertFalse(Kit\StoreDir::ownerTrusted($other, $site, $web), 'another account\'s file');
        self::assertFalse(Kit\StoreDir::ownerTrusted($other, null, $web), 'no directory to vouch for it');
    }

    public function testAGroupWritableDataFolderIsChosenAndTheDatabaseIsPrivate(): void
    {
        $base = admin_tmp_dir();
        $data = "$base/data";
        mkdir($data, 0770);
        chmod($data, 0770);
        $picked = (new Kit\StoreDir('admin storage:', Admin\StorageUnavailable::class))->pick($data, "$base/fallback");
        self::assertSame($data, $picked);
        self::assertFileDoesNotExist("$base/fallback");
        $db = Admin\Db::open($picked);
        self::assertNotFalse($db->query('SELECT 1'));
        self::assertSame(0600, fileperms("$data/" . Admin\Db::FILE) & 0777);
        self::assertTrue(Kit\StoreDir::trustedOwner((int) fileowner("$data/" . Admin\Db::FILE), "$data/" . Admin\Db::FILE));
    }
}
