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

    public function testASquattedFallbackIsRefusedWithAClearLogLine(): void
    {
        $log = $this->root . '/php.log';
        $old = ini_set('error_log', $log);
        $refusals = [];
        try {
            $open = $this->root . '/open';
            mkdir($open, 0755);
            chmod($open, 0755);
            mkdir($this->root . '/elsewhere', 0700);
            symlink($this->root . '/elsewhere', $this->root . '/link');
            foreach ([$open, $this->root . '/link'] as $bad) {
                try {
                    tankity_pick_dir($this->root . '/data', $bad, fn(string $p): bool => false);
                    $this->fail("$bad was accepted");
                } catch (TankityStorageRefused $e) {
                    $refusals[] = $e->getMessage();
                }
            }
            if (tankity_euid() !== 0 && is_writable('/var/tmp') && fileowner('/var/tmp') !== tankity_euid()) {
                $this->expectException(TankityStorageRefused::class);
                try {
                    tankity_claim_dir('/var/tmp', true);
                } finally {
                    $text = (string) file_get_contents($log);
                    $this->assertStringContainsString('/var/tmp belongs to another account; remove it, or set data_dir', $text);
                }
            }
        } finally {
            ini_set('error_log', $old === false ? '' : $old);
            $text = (string) @file_get_contents($log);
            $this->assertStringContainsString("$open has mode 0755, not 0700; remove it, or set data_dir", $text);
            $this->assertStringContainsString('/link is a symbolic link; remove it, or set data_dir', $text);
            $this->assertCount(2, $refusals);
        }
    }

    public function testASquatByAnotherAccountIsRefusedEvenWhenWeCannotWriteIt(): void
    {
        $log = $this->root . '/php.log';
        $old = ini_set('error_log', $log);
        try {
            if (tankity_euid() === 0) {
                $theirs = $this->root . '/theirs';
                mkdir($theirs, 0700);
                chown($theirs, 12345);
            } else {
                $theirs = '/usr'; // root's, and not writable by us
                $this->assertFalse(is_writable($theirs));
            }
            try {
                tankity_claim_dir($theirs, true);
                $this->fail('a directory of another account was accepted');
            } catch (TankityStorageRefused) {
                // refused, which is the point
            }
            $this->assertStringContainsString("$theirs belongs to another account; remove it, or set data_dir", (string) file_get_contents($log));
        } finally {
            ini_set('error_log', $old === false ? '' : $old);
        }
    }

    public function testAnExistingDirectoryIsVerifiedNeverJustUsed(): void
    {
        $mine = $this->root . '/mine';
        mkdir($mine, 0700);
        $this->assertSame($mine, tankity_claim_dir($mine, true));
        chmod($mine, 0750);
        $this->expectException(TankityStorageRefused::class);
        tankity_claim_dir($mine, true);
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
