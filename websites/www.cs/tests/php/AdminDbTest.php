<?php
// The admin database: private file, secure_delete on, schema present, the
// one-time steps run once, and the copy of the kit's StoreDir never drifts from the kit's.
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

require_once __DIR__ . '/AdminFakes.php';

final class AdminDbTest extends TestCase
{
    public function testSchemaAndPragmas(): void
    {
        $db = admin_tmp_db();
        $tables = $db->query("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")->fetchAll(PDO::FETCH_COLUMN);
        self::assertSame(['accounts', 'devices', 'key_hits', 'keys', 'link_requests', 'links', 'migrations', 'probes', 'sessions', 'studio_confirms', 'studio_devices', 'studio_key_hits', 'studio_keys', 'studio_link_requests', 'studio_links', 'studio_pair_tries', 'studio_seal_keys', 'studio_sessions'], $tables);
        self::assertSame(1, (int) $db->query('PRAGMA secure_delete')->fetchColumn());
    }

    public function testADatabaseMadeBeforeTheBrowserHashColumnGainsIt(): void
    {
        $dir = admin_tmp_dir();
        $old = new PDO('sqlite:' . $dir . '/' . Admin\Db::FILE);
        $old->exec('CREATE TABLE links (token_hash TEXT PRIMARY KEY, email TEXT NOT NULL, created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL, used_at INTEGER)');
        $old->exec("INSERT INTO links VALUES ('h', 'wgrim@siue.edu', 1, 2, NULL)");
        unset($old);
        $db = Admin\Db::open($dir);
        self::assertContains('browser_hash', array_column($db->query('PRAGMA table_info(links)')->fetchAll(PDO::FETCH_ASSOC), 'name'));
        self::assertNull($db->query('SELECT browser_hash FROM links')->fetchColumn(), 'the old row has no hash');
        Admin\Db::open($dir);
    }

    /** A database with keys made before drafts:delete existed: a publish key, a pickup key and a revoked publish key. */
    private function keysBeforeDraftsDelete(string $dir): void
    {
        $old = new PDO('sqlite:' . $dir . '/' . Admin\Db::FILE);
        $old->exec('CREATE TABLE keys (id INTEGER PRIMARY KEY, label TEXT NOT NULL, key_hash TEXT NOT NULL UNIQUE, scopes TEXT NOT NULL, created_at INTEGER NOT NULL, last_used_at INTEGER, revoked_at INTEGER)');
        $old->exec('INSERT INTO keys VALUES (1, \'music-publish\', \'h1\', \'["drafts:publish","keys:publish"]\', 1, 5, NULL)');
        $old->exec('INSERT INTO keys VALUES (2, \'music-pickup\', \'h2\', \'["notes:pickup"]\', 1, NULL, NULL)');
        $old->exec('INSERT INTO keys VALUES (3, \'music-publish\', \'h3\', \'["drafts:publish","keys:publish"]\', 1, NULL, 2)');
    }

    /** @return array<int, list<string>> id => scopes */
    private static function scopesById(PDO $db): array
    {
        $out = [];
        foreach ($db->query('SELECT id, scopes FROM keys ORDER BY id')->fetchAll(PDO::FETCH_ASSOC) as $row) {
            $out[(int) $row['id']] = json_decode((string) $row['scopes'], true);
        }
        return $out;
    }

    public function testOpeningGivesEveryActivePublishingKeyTheDraftsDeleteScopeInPlace(): void
    {
        $dir = admin_tmp_dir();
        $this->keysBeforeDraftsDelete($dir);
        $db = Admin\Db::open($dir);
        self::assertSame([
            1 => ['drafts:publish', 'keys:publish', 'drafts:delete'],
            2 => ['notes:pickup'],
            3 => ['drafts:publish', 'keys:publish'],
        ], self::scopesById($db), 'only the active key that publishes drafts gains it');
        self::assertSame(['h1', 'h2', 'h3'], $db->query('SELECT key_hash FROM keys ORDER BY id')->fetchAll(PDO::FETCH_COLUMN), 'no key is remade');
        self::assertSame(5, (int) $db->query('SELECT last_used_at FROM keys WHERE id = 1')->fetchColumn());
    }

    public function testTheDraftsDeleteStepRunsOnceAndNeverAgain(): void
    {
        $dir = admin_tmp_dir();
        $this->keysBeforeDraftsDelete($dir);
        $first = self::scopesById(Admin\Db::open($dir));
        $db = Admin\Db::open($dir);
        self::assertSame($first, self::scopesById($db), 'a second open changes nothing');
        // A key made after the step keeps exactly the scopes it was made with.
        $db->exec('INSERT INTO keys VALUES (4, \'narrow\', \'h4\', \'["drafts:publish"]\', 9, NULL, NULL)');
        self::assertSame(['drafts:publish'], self::scopesById(Admin\Db::open($dir))[4]);
        self::assertSame(1, (int) $db->query("SELECT COUNT(*) FROM migrations WHERE name = 'keys-drafts-delete'")->fetchColumn());
    }

    public function testANewDatabaseRecordsTheStepWithNothingToChange(): void
    {
        $db = admin_tmp_db();
        self::assertSame([], self::scopesById($db));
        self::assertSame(['keys-drafts-delete'], $db->query('SELECT name FROM migrations')->fetchAll(PDO::FETCH_COLUMN));
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
