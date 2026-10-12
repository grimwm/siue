<?php
// games/tankity/test/php/DataDirTest.php
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

/* Where Tankity keeps its files: data/ when PHP can write it (with the deny
   file), else a private /var/tmp directory, and never one someone else made. */
final class DataDirTest extends TestCase
{
    private string $root;

    public static function setUpBeforeClass(): void
    {
        require_once __DIR__ . '/rooms-lib.php';
    }

    protected function setUp(): void
    {
        $this->root = tankity_test_dir();
    }

    protected function tearDown(): void
    {
        foreach (glob($this->root . '/*') ?: [] as $d) {
            @chmod($d, 0700);
        }
        tankity_test_rm($this->root);
    }

    public function testAWritablePreferredDirectoryIsUsedAndDeniesHttp(): void
    {
        $pref = $this->root . '/data';
        $this->assertSame($pref, tankity_pick_dir($pref, $this->root . '/fallback'));
        $this->assertSame(0700, fileperms($pref) & 0777);
        $this->assertStringContainsString('Require all denied', (string) file_get_contents($pref . '/.htaccess'));
        $this->assertDirectoryDoesNotExist($this->root . '/fallback');
    }

    public function testAnUnwritablePreferredDirectoryFallsBackToAPrivateOne(): void
    {
        $fallback = $this->root . '/someone-tankity';
        $this->assertSame($fallback, tankity_pick_dir($this->root . '/data', $fallback, fn(string $p): bool => false));
        $this->assertSame(0700, fileperms($fallback) & 0777);
        $this->assertDirectoryDoesNotExist($this->root . '/data');
    }

    public function testAPreferredDirectoryThatCannotTakeItsDenyFileIsNotUsed(): void
    {
        if (tankity_euid() === 0) {
            $this->markTestSkipped('root writes through any mode');
        }
        $pref = $this->root . '/data';
        mkdir($pref, 0500);
        $this->assertSame($this->root . '/fallback', tankity_pick_dir($pref, $this->root . '/fallback', fn(string $p): bool => true));
    }

    public function testAFallbackOpenToOthersIsRefused(): void
    {
        $open = $this->root . '/open';
        mkdir($open);
        chmod($open, 0777);
        $this->expectException(RuntimeException::class);
        tankity_pick_dir($this->root . '/data', $open, fn(string $p): bool => false);
    }

    public function testASymlinkedFallbackIsRefused(): void
    {
        mkdir($this->root . '/elsewhere', 0700);
        symlink($this->root . '/elsewhere', $this->root . '/link');
        $this->expectException(RuntimeException::class);
        tankity_pick_dir($this->root . '/data', $this->root . '/link', fn(string $p): bool => false);
    }

    public function testTheUsernameIsTheScriptOwnersAndSafeInAPath(): void
    {
        $name = tankity_username();
        $this->assertMatchesRegularExpression('/^[a-z0-9_-]{1,32}$/', $name);
        $owner = strtolower((string) preg_replace('/[^A-Za-z0-9_-]+/', '', get_current_user()));
        $this->assertSame($owner !== '' ? substr($owner, 0, 32) : 'uid' . getmyuid(), $name);
        $this->assertSame($name, tankity_username(), 'the same on every call');
    }

    public function testTheDataDirSettingWins(): void
    {
        $this->assertSame($this->root, tankity_data_dir());
    }

    public function testADataDirFromTheConfigFileIsUsedExactlyAndCreatedPrivate(): void
    {
        $want = $this->root . '/configured/store';
        file_put_contents($this->root . '/c.yaml', "data_dir: \"$want\"\n");
        putenv('TANKITY_DATA_DIR');
        putenv('CONFIG_FILE=' . $this->root . '/c.yaml');
        tankity_config(true);
        try {
            $this->assertSame($want, tankity_data_dir());
            $this->assertSame(0700, fileperms($want) & 0777);
        } finally {
            putenv('CONFIG_FILE');
            tankity_config(true);
        }
    }

    public function testAnUnwritableDataDirFailsLoudlyAndNeverFallsBack(): void
    {
        if (tankity_euid() === 0) {
            $this->markTestSkipped('root writes through any mode');
        }
        $locked = $this->root . '/locked';
        mkdir($locked, 0500);
        putenv('TANKITY_DATA_DIR=' . $locked);
        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage("$locked is not a writable directory");
        tankity_data_dir();
    }
}
