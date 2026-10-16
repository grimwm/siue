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
}
