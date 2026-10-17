<?php
// What music_run decides before it opens the database: plain HTTP is refused on
// every route; a page load must be a browser navigation, a data route must be
// same-origin, an API route (called by tools) needs nothing more. Each refusal
// carries the admin headers and the music CSP.
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

require_once __DIR__ . '/MusicFakes.php';

final class MusicBootstrapTest extends TestCase
{
    private const BASE = 'https://example.test/~wgrim/admin/';

    public function testPlainHttpIsRefusedOnEveryKindOfRoute(): void
    {
        foreach (['page', 'data', 'api'] as $kind) {
            $res = music_early_refusal($kind, req(['https' => false]), self::BASE);
            self::assertNotNull($res, $kind);
            self::assertSame(403, $res->status, $kind);
            self::assertSame(Music\Http::csp(), $res->headers['Content-Security-Policy'], $kind);
            self::assertNull(music_early_refusal($kind, req(['https' => false]), 'http://localhost/admin/'), "$kind on a local base");
            self::assertNull(music_early_refusal($kind, req(['https' => true]), self::BASE), "$kind over HTTPS");
        }
    }

    public function testAPageLoadMustBeANavigation(): void
    {
        $script = req(['https' => true, 'headers' => ['sec-fetch-mode' => 'cors', 'sec-fetch-dest' => 'empty', 'sec-fetch-site' => 'same-origin']]);
        $navigation = req(['https' => true, 'headers' => ['sec-fetch-mode' => 'navigate', 'sec-fetch-dest' => 'document', 'sec-fetch-site' => 'none']]);
        self::assertSame(403, music_early_refusal('page', $script, self::BASE)?->status);
        self::assertNull(music_early_refusal('page', $navigation, self::BASE));
        self::assertNull(music_early_refusal('page', req(['https' => true]), self::BASE), 'curl and older browsers send no Fetch Metadata');
    }

    public function testADataRouteMustBeSameOrigin(): void
    {
        $at = fn(string $site) => req(['https' => true, 'headers' => ['sec-fetch-site' => $site]]);
        self::assertSame(403, music_early_refusal('data', $at('cross-site'), self::BASE)?->status);
        self::assertSame(403, music_early_refusal('data', $at('same-site'), self::BASE)?->status);
        self::assertNull(music_early_refusal('data', $at('same-origin'), self::BASE), "the page's own script");
        self::assertNull(music_early_refusal('api', $at('cross-site'), self::BASE), 'API routes are for tools: only HTTPS and the key decide');
    }

    public function testABadKeyFileDisablesNoteUploadsOnly(): void
    {
        $dir = admin_tmp_dir();
        $bad = "$dir/public.json";
        file_put_contents($bad, '{not json');
        putenv("MUSIC_PUBLIC_KEYS=$bad");
        try {
            $prev = ini_set('error_log', "$dir/php.log");
            self::assertNull(music_public_keys());
            $store = new Music\Store(admin_tmp_db(), "$dir/music", new FakeClock(1000), music_public_keys());
            $this->expectException(Music\NoteRejected::class);
            $this->expectExceptionMessage('no_key');
            $store->addNote(music_sealed());
        } finally {
            putenv('MUSIC_PUBLIC_KEYS');
            if (isset($prev) && $prev !== false) {
                ini_set('error_log', $prev);
            }
        }
    }

    public function testKeyFileErrorsCarryNoFilesystemPath(): void
    {
        $dir = admin_tmp_dir();
        self::assertNull(Music\PublicKeys::fromFile("$dir/absent.json"));
        foreach (['{not json', '{"schema":1,"previous":[],"current":{"fingerprint":"' . str_repeat('a', 64) . '","spki":"AAAA"}}'] as $i => $content) {
            $file = "$dir/bad$i.json";
            file_put_contents($file, $content);
            try {
                Music\PublicKeys::fromFile($file);
                self::fail("bad$i accepted");
            } catch (RuntimeException $e) {
                self::assertStringNotContainsString($dir, $e->getMessage());
                self::assertStringNotContainsString('/', str_replace('music/keys/public.json', '', $e->getMessage()));
            }
        }
    }

    public function testTheAssetVersionStampsBothScripts(): void
    {
        $dir = sys_get_temp_dir() . '/music-assets-' . bin2hex(random_bytes(4));
        mkdir($dir);
        try {
            self::assertSame('', music_asset_version($dir), 'no files, no version');
            file_put_contents("$dir/workroom.js", 'page');
            self::assertSame('', music_asset_version($dir), 'sheet.js missing');
            file_put_contents("$dir/sheet.js", 'sheet');
            $both = music_asset_version($dir);
            self::assertMatchesRegularExpression('/^[0-9a-f]{10}$/', $both);
            file_put_contents("$dir/sheet.js", 'sheet, changed');
            self::assertNotSame($both, music_asset_version($dir), 'a change to sheet.js alone changes the version');
            file_put_contents("$dir/sheet.js", 'sheet');
            file_put_contents("$dir/workroom.js", 'page, changed');
            self::assertNotSame($both, music_asset_version($dir), 'and so does one to workroom.js alone');
            self::assertMatchesRegularExpression('/^[0-9a-f]{10}$/', music_asset_version(), 'the shipped files');
        } finally {
            array_map('unlink', glob("$dir/*") ?: []);
            rmdir($dir);
        }
    }

    public function testAnUnknownKindIsABug(): void
    {
        $this->expectException(InvalidArgumentException::class);
        music_early_refusal('other', req(['https' => true]), self::BASE);
    }
}
