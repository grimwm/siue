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

    public function testAnUnknownKindIsABug(): void
    {
        $this->expectException(InvalidArgumentException::class);
        music_early_refusal('other', req(['https' => true]), self::BASE);
    }
}
