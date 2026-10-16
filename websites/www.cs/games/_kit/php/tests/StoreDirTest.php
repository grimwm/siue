<?php
// Kit\StoreDir: the storage-directory rules every game's PHP shares. A link,
// another account's directory or one open to others is never adopted.
declare(strict_types=1);

require_once __DIR__ . '/TempDir.php';
require_once dirname(__DIR__) . '/score-guard.php';
require_once dirname(__DIR__) . '/store-dir.php';

use Kit\StoreDir;
use Kit\Tests\TempDir;
use PHPUnit\Framework\TestCase;

final class StoreDirTest extends TestCase
{
    use TempDir;

    private string $root;
    private StoreDir $store;

    protected function setUp(): void
    {
        $this->root = self::makeTempDir('kit-store-dir');
        $this->store = new StoreDir('kit test:', DomainException::class);
    }

    protected function tearDown(): void
    {
        foreach (glob($this->root . '/*') ?: [] as $d) {
            @chmod($d, 0700);
        }
        self::removeTree($this->root);
    }

    private function silently(callable $fn): mixed
    {
        $old = ini_set('error_log', '/dev/null');
        try {
            return $fn();
        } finally {
            ini_set('error_log', (string) $old);
        }
    }

    public function testAMissingDirectoryIsCreatedPrivate(): void
    {
        $dir = $this->root . '/new/deeper';
        $this->assertSame($dir, $this->store->claim($dir, true));
        $this->assertSame(0700, fileperms($dir) & 0777);
    }

    public function testASymlinkedDirectoryIsRefusedWithTheCallersException(): void
    {
        $real = $this->root . '/real';
        mkdir($real, 0700);
        symlink($real, $this->root . '/link');
        foreach ([true, false] as $private) {
            try {
                $this->silently(fn() => $this->store->claim($this->root . '/link', $private));
                $this->fail('a link must be refused');
            } catch (DomainException $e) {
                $this->assertStringContainsString('symbolic link', $e->getMessage());
                $this->assertStringStartsWith($this->root . '/link ', $e->getMessage());
            }
        }
    }

    public function testADirectoryOwnedBySomeoneElseIsRefused(): void
    {
        if (StoreDir::euid() === 0) {
            $this->markTestSkipped('root owns everything it makes');
        }
        // /var/tmp, /tmp or / belong to root, never to this account.
        foreach (['/', '/usr'] as $theirs) {
            try {
                $this->silently(fn() => $this->store->claim($theirs, true));
                $this->fail("$theirs belongs to root and must be refused");
            } catch (DomainException $e) {
                $this->assertStringContainsString('belongs to another account', $e->getMessage());
            }
        }
    }

    public function testATooOpenPrivateDirectoryIsRefusedNotAdopted(): void
    {
        $open = $this->root . '/open';
        mkdir($open, 0755);
        chmod($open, 0755);
        try {
            $this->silently(fn() => $this->store->claim($open, true));
            $this->fail('a 0755 private directory must be refused');
        } catch (DomainException $e) {
            $this->assertStringContainsString('has mode 0755, not 0700', $e->getMessage());
        }
        $this->assertSame(0755, fileperms($open) & 0777, 'claim never loosens or silently rewrites it');
    }

    public function testPickTightensAnOpenPreferredDirectoryItOwns(): void
    {
        $pref = $this->root . '/data';
        mkdir($pref, 0755);
        chmod($pref, 0755);
        $this->assertSame($pref, $this->store->pick($pref, $this->root . '/fallback'));
        $this->assertSame(0700, fileperms($pref) & 0777);
        $this->assertStringContainsString('Require all denied', (string) file_get_contents($pref . '/.htaccess'));
        $this->assertDirectoryDoesNotExist($this->root . '/fallback');
    }

    public function testPickNeverUsesALinkedPreferredDirectory(): void
    {
        $real = $this->root . '/real';
        mkdir($real, 0700);
        symlink($real, $this->root . '/data');
        $fallback = $this->root . '/fallback';
        $this->assertSame($fallback, $this->store->pick($this->root . '/data', $fallback, fn(string $p): bool => true));
        $this->assertFileDoesNotExist($real . '/.htaccess');
    }

    public function testClaimFileRefusesALinkAndTightensAnOpenFileOfOurs(): void
    {
        $target = $this->root . '/target';
        file_put_contents($target, '{}');
        symlink($target, $this->root . '/scores.json');
        try {
            $this->silently(fn() => $this->store->claimFile($this->root . '/scores.json'));
            $this->fail('a linked file must be refused');
        } catch (DomainException $e) {
            $this->assertStringContainsString('symbolic link', $e->getMessage());
        }
        $this->assertSame($this->root . '/missing', $this->store->claimFile($this->root . '/missing'));
        chmod($target, 0666);
        $this->assertSame($target, $this->store->claimFile($target));
        $this->assertSame(0600, fileperms($target) & 0777);
    }

    public function testDenyHttpWritesTheCallersTextOnce(): void
    {
        $store = new StoreDir('kit test:', RuntimeException::class, "# mine\nRequire all denied\n");
        $this->assertTrue($store->denyHttp($this->root));
        $this->assertSame("# mine\nRequire all denied\n", file_get_contents($this->root . '/.htaccess'));
        $this->assertSame(0600, fileperms($this->root . '/.htaccess') & 0777);
        $this->assertTrue($store->denyHttp($this->root));
    }

    public function testAFileOpenedNormallyPassesThePostOpenCheck(): void
    {
        $path = $this->root . '/scores.json';
        $fh = fopen($path, 'x');
        $this->store->verifyOpened($fh, $path);
        $this->assertIsResource($fh);
        fclose($fh);
    }

    public function testALinkPlantedAfterTheClaimIsRefusedAndClosed(): void
    {
        $path = $this->root . '/scores.json';
        $this->assertSame($path, $this->store->claimFile($path), 'missing, so it passes the claim');
        $victim = $this->root . '/victim';
        file_put_contents($victim, 'keep');
        symlink($victim, $path); // another account wins the race
        $fh = fopen($path, 'c+'); // the open follows the link
        try {
            $this->silently(fn() => $this->store->verifyOpened($fh, $path));
            $this->fail('a link planted after the claim must be refused');
        } catch (DomainException $e) {
            $this->assertStringContainsString('symbolic link', $e->getMessage());
        }
        $this->assertFalse(is_resource($fh), 'the handle is closed');
        $this->assertSame('keep', file_get_contents($victim));
    }

    public function testAFileSwappedForAnotherIsRefused(): void
    {
        $path = $this->root . '/scores.json';
        $fh = fopen($path, 'c+');
        unlink($path);
        file_put_contents($path, 'other'); // same name, another inode
        try {
            $this->silently(fn() => $this->store->verifyOpened($fh, $path));
            $this->fail('a swapped file must be refused');
        } catch (DomainException $e) {
            $this->assertStringContainsString('changed while it was being opened', $e->getMessage());
        }
    }

    public function testAFileOfAnotherAccountIsRefused(): void
    {
        // PHP runs as 48; a stranger (1001) planted a file in root's sticky /var/tmp.
        $this->assertFalse(StoreDir::ownerTrusted(1001, 0, 48));
        // ...or in a directory that belongs to yet another account.
        $this->assertFalse(StoreDir::ownerTrusted(1001, 500, 48));
        $this->assertFalse(StoreDir::ownerTrusted(1001, null, 48));
    }

    public function testAFileOfPhpOrOfItsDirectorysOwnerIsTrusted(): void
    {
        // PHP's own file, wherever it is.
        $this->assertTrue(StoreDir::ownerTrusted(48, 0, 48));
        $this->assertTrue(StoreDir::ownerTrusted(48, null, 48));
        // The site account's file in the site account's data folder, written by PHP through its group (www.cs.siue.edu).
        $this->assertTrue(StoreDir::ownerTrusted(500, 500, 48));
        // Root's file in root's directory: root could do anything anyway.
        $this->assertTrue(StoreDir::ownerTrusted(0, 0, 48));
    }

    public function testTheDirectorysOwnersFileOpensWhenPhpIsSomeoneElse(): void
    {
        if (StoreDir::euid() === 0) {
            $this->markTestSkipped('root owns everything it makes');
        }
        // /etc/hosts: root's file in root's /etc, opened by a non-root PHP (its real path: macOS links /etc).
        $path = (string) realpath('/etc/hosts');
        $fh = fopen($path, 'r');
        $this->store->verifyOpened($fh, $path);
        $this->assertTrue(is_resource($fh));
        fclose($fh);
    }

    public function testAHardLinkToOurFileIsRefusedByTheClaimAndThePostOpenCheck(): void
    {
        $ours = $this->root . '/ours';
        file_put_contents($ours, '{}');
        link($ours, $this->root . '/scores.json');
        try {
            $this->silently(fn() => $this->store->claimFile($this->root . '/scores.json'));
            $this->fail('a hard-linked file must be refused by the claim');
        } catch (DomainException $e) {
            $this->assertStringContainsString('hard links', $e->getMessage());
        }
        $fh = fopen($this->root . '/scores.json', 'r+');
        try {
            $this->silently(fn() => $this->store->verifyOpened($fh, $this->root . '/scores.json'));
            $this->fail('a hard-linked file must be refused after opening');
        } catch (DomainException $e) {
            $this->assertStringContainsString('hard links', $e->getMessage());
        }
        $this->assertFalse(is_resource($fh));
        $this->assertSame('{}', file_get_contents($ours));
    }

    public function testOpenExistingCreatesAMissingFileWithTheModeAndSeed(): void
    {
        $path = $this->root . '/new.json';
        $fh = $this->store->openExisting($path, 0600, '{"a":1}');
        $this->assertSame('{"a":1}', stream_get_contents($fh));
        fclose($fh);
        $this->assertSame(0600, fileperms($path) & 0777);
        $fh = $this->store->openExisting($path, 0600, 'ignored');
        $this->assertSame('{"a":1}', stream_get_contents($fh), 'an existing file is neither reseeded nor truncated');
        fclose($fh);
    }

    public function testOpenExistingNeverCreatesOrTruncatesThroughALink(): void
    {
        $target = $this->root . '/target';
        symlink($target, $this->root . '/dangling');
        try {
            $this->silently(fn() => $this->store->openExisting($this->root . '/dangling', 0600, 'x'));
            $this->fail('a dangling link must be refused');
        } catch (DomainException) {
        }
        $this->assertFileDoesNotExist($target, 'the link was not followed to create its target');
        file_put_contents($target, 'keep');
        try {
            $this->silently(fn() => $this->store->openExisting($this->root . '/dangling', 0600, 'x'));
            $this->fail('a link to a file must be refused');
        } catch (DomainException $e) {
            $this->assertStringContainsString('symbolic link', $e->getMessage());
        }
        $this->assertSame('keep', file_get_contents($target));
    }

    /** A game that ships the score guard must ship the file it requires. */
    public function testEveryGameThatShipsTheScoreGuardShipsStoreDir(): void
    {
        $found = 0;
        foreach (glob(dirname(__DIR__, 3) . '/*/tools/install-files.php') ?: [] as $file) {
            $src = (string) file_get_contents($file);
            if (str_contains($src, "'score-guard.php'")) {
                $found++;
                $this->assertStringContainsString("'store-dir.php'", $src, $file);
            }
        }
        $this->assertGreaterThanOrEqual(2, $found);
    }
}
