<?php
// What deploy.sh ships of the workroom: its pages, API, library, styles and
// the public key file; never its tools, committed drafts, README or the local
// compose override. nginx denies what Apache's .htaccess denies.
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

final class MusicDeployTest extends TestCase
{
    private static ?array $list = null;

    private static function shipped(): array
    {
        if (self::$list === null) {
            $site = dirname(__DIR__, 2);
            exec('cd ' . escapeshellarg($site) . ' && LIST=1 ./deploy.sh 2>/dev/null', $out, $code);
            self::assertSame(0, $code, 'LIST=1 ./deploy.sh failed');
            self::$list = $out;
        }
        return self::$list;
    }

    public function testShipsThePagesApiAndLibrary(): void
    {
        $list = self::shipped();
        foreach (['music/index.php', 'music/piece.php', 'music/notes.php', 'music/delete.php', 'music/keyring.php', 'music/api/note.php', 'music/api/picked-up.php', 'music/api/keyring.php',
            'music/lib/Store.php', 'music/lib/.htaccess', 'music/.htaccess', 'music/music.css'] as $f) {
            self::assertContains($f, $list, $f);
        }
        if (is_file(dirname(__DIR__, 2) . '/music/keys/public.json')) {
            self::assertContains('music/keys/public.json', $list);
        }
    }

    public function testNeverShipsToolsDraftsOrDocs(): void
    {
        foreach (self::shipped() as $f) {
            self::assertDoesNotMatchRegularExpression('~^music/(tools|pieces)/|^music/README\.md$~', $f, $f);
        }
    }

    public function testShipsTheBuiltWorkroomAndNeverItsSources(): void
    {
        $list = self::shipped();
        foreach (['workroom.js', 'sheet.js', 'THIRD_PARTY_LICENSES.txt'] as $f) {
            self::assertContains("games/workroom/dist/$f", $list, $f);
        }
        foreach ($list as $f) {
            self::assertDoesNotMatchRegularExpression('~^games/workroom/(src|test|tools)/~', $f, $f);
        }
    }

    public function testApacheForwardsTheAuthorizationHeader(): void
    {
        $ht = (string) file_get_contents(dirname(__DIR__, 2) . '/music/.htaccess');
        self::assertStringContainsString('SetEnvIf Authorization "(.+)" HTTP_AUTHORIZATION=$1', $ht);
        self::assertStringContainsString('HTTP_AUTHORIZATION', (string) file_get_contents(dirname(__DIR__, 2) . '/admin/lib/Request.php'));
        self::assertStringContainsString('REDIRECT_HTTP_AUTHORIZATION', (string) file_get_contents(dirname(__DIR__, 2) . '/admin/lib/Request.php'));
    }

    public function testNginxDeniesWhatApacheDenies(): void
    {
        $conf = (string) file_get_contents(dirname(__DIR__, 2) . '/docker/nginx/default.conf');
        foreach (['lib', 'tools', 'pieces', 'keys'] as $d) {
            self::assertStringContainsString("location ^~ /music/$d/ { deny all; }", $conf, $d);
        }
        $ht = (string) file_get_contents(dirname(__DIR__, 2) . '/music/.htaccess');
        self::assertStringContainsString('m#/music/(lib|tools|pieces|keys)/#', $ht);
        self::assertStringContainsString("media-src 'self' blob:", $ht);
    }
}
