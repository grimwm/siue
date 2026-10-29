<?php
// What deploy.sh ships of the workroom: its pages, API and library;
// never its tools, committed drafts, README or the local
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
            'music/lib/Store.php', 'music/lib/.htaccess', 'music/.htaccess'] as $f) {
            self::assertContains($f, $list, $f);
        }
    }

    public function testShipsTheSampleLibrary(): void
    {
        $list = self::shipped();
        self::assertContains('music/library/library.json', $list);
        self::assertContains('music/library/README.md', $list);
        self::assertContains('music/library/harp/28.flac', $list);
        $index = json_decode((string) file_get_contents(dirname(__DIR__, 2) . '/music/library/library.json'), true);
        foreach ($index['instruments'] as $inst) {
            foreach ($inst['files'] as $f) {
                self::assertContains('music/library/' . $f['file'], $list, $f['file']);
            }
        }
    }

    public function testServesTheSampleLibraryPlainly(): void
    {
        $conf = (string) file_get_contents(dirname(__DIR__, 2) . '/docker/nginx/default.conf');
        self::assertStringNotContainsString('/music/library/ { deny all; }', $conf);
        self::assertStringContainsString('location ~ ^/music/library/.*\.flac$ {', $conf);
        self::assertStringContainsString('default_type audio/flac;', $conf);
        $ht = (string) file_get_contents(dirname(__DIR__, 2) . '/music/.htaccess');
        self::assertStringContainsString('AddType audio/flac .flac', $ht);
    }

    public function testNeverShipsToolsDraftsOrDocs(): void
    {
        foreach (self::shipped() as $f) {
            self::assertDoesNotMatchRegularExpression('~^music/(tools|compose|pieces|keys)/|^music/README\.md$~', $f, $f);
        }
    }

    public function testShipsTheBuiltWorkroomAndNeverItsSources(): void
    {
        $list = self::shipped();
        $built = ['workroom.js', 'sheet.js', 'theme.js', 'workroom.css', 'THIRD_PARTY_LICENSES.txt',
            'fonts/barlow-latin-400-normal.woff2', 'fonts/barlow-latin-500-normal.woff2', 'fonts/barlow-latin-600-normal.woff2',
            'fonts/barlow-condensed-latin-600-normal.woff2', 'fonts/ibm-plex-mono-latin-400-normal.woff2', 'fonts/ibm-plex-mono-latin-500-normal.woff2'];
        foreach ($built as $f) {
            self::assertContains("games/workroom/dist/$f", $list, $f);
        }
        foreach ($list as $f) {
            self::assertDoesNotMatchRegularExpression('~^games/workroom/(src|test|tools|fonts)/~', $f, $f);
        }
        self::assertNotContains('music/music.css', $list, 'the workroom stylesheet ships from games/workroom/dist/');
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
        foreach (['lib', 'tools', 'compose', 'pieces', 'keys'] as $d) {
            self::assertStringContainsString("location ^~ /music/$d/ { deny all; }", $conf, $d);
        }
        $ht = (string) file_get_contents(dirname(__DIR__, 2) . '/music/.htaccess');
        self::assertStringContainsString('m#/music/(lib|tools|compose|pieces|keys)/#', $ht);
        self::assertStringContainsString("media-src 'self' blob:", $ht);
    }
}
