<?php
// websites/www.cs/games/_kit/php/tests/InstallCoreTest.php
declare(strict_types=1);

require_once __DIR__ . '/../install-core.php';

use PHPUnit\Framework\TestCase;

final class InstallCoreTest extends TestCase
{
    private string $dir;

    private const PLAY = ['kind' => 'play', 'versioned' => ['dist/main.js', 'game.css'], 'precache_dirs' => ['dist'], 'precache_exclude' => []];

    protected function setUp(): void
    {
        $this->dir = sys_get_temp_dir() . '/install-core-' . bin2hex(random_bytes(4)) . '/arty';
        mkdir($this->dir . '/dist', 0777, true);
        file_put_contents("$this->dir/metadata.yaml", "title: Arty & Co\ndescription: >\n  Lob\n  shells.\nshort_name: Arty\ntheme_color: \"#112233\"\nbackground_color: \"#445566\"\nplay: index.html\nimage: og.png # share picture\n");
        file_put_contents("$this->dir/index.html", "<!doctype html>\n<html>\n<head>\n    <title>Arty</title>\n<link rel=\"stylesheet\" href=\"game.css?v=old\">\n</head>\n<body>\n<script type=\"module\" src=\"dist/main.js?v=old\"></script>\n</body>\n</html>\n");
        file_put_contents("$this->dir/game.css", 'body{}');
        file_put_contents("$this->dir/dist/main.js", 'console.log(1)');
        file_put_contents("$this->dir/dist/main.js.map", '{}');
        file_put_contents("$this->dir/og.png", 'png');
        file_put_contents("$this->dir/engine-test.js", '');
        foreach ([192, 512] as $n) {
            file_put_contents("$this->dir/icon-$n.png", self::png($n));
        }
    }

    protected function tearDown(): void
    {
        exec('rm -rf ' . escapeshellarg(dirname($this->dir)));
    }

    private static function png(int $n): string
    {
        $chunk = fn(string $t, string $d): string => pack('N', strlen($d)) . $t . $d . pack('N', crc32($t . $d));
        return "\x89PNG\r\n\x1a\n" . $chunk('IHDR', pack('NNCCCCC', $n, $n, 8, 2, 0, 0, 0))
            . $chunk('IDAT', (string) gzcompress(str_repeat("\0" . str_repeat("\0", $n * 3), $n))) . $chunk('IEND', '');
    }

    public function testParsesTheYamlSubset(): void
    {
        [$data, $err] = install_parse_yaml("a: 1\n# c\nb: \"x # y\"\nc: >\n  one\n  two\nd: z # note\n");
        $this->assertNull($err);
        $this->assertSame(['a' => '1', 'b' => 'x # y', 'c' => 'one two', 'd' => 'z'], $data);
        $this->assertSame('line 1: expected `key: value` starting at column 1', install_parse_yaml("  a: 1\n")[1]);
    }

    public function testCardNeedsTheKeyForItsKind(): void
    {
        [$card, $err] = install_card($this->dir, 'start');
        $this->assertNull($card);
        $this->assertSame('metadata.yaml: `start` is required', $err);
        [$card] = install_card($this->dir, 'play');
        $this->assertSame('Arty', $card['short_name']);
        $this->assertSame('#112233', $card['theme_color']);
    }

    public function testPageVersionsAreContentHashes(): void
    {
        $page = (string) file_get_contents("$this->dir/index.html");
        [$out, $problems] = install_page_versions($this->dir, $page, 'index.html', ['dist/main.js', 'game.css']);
        $this->assertSame([], $problems);
        $this->assertStringContainsString('src="dist/main.js?v=' . install_version('console.log(1)') . '"', $out);
        $this->assertStringContainsString('href="game.css?v=' . install_version('body{}') . '"', $out);
    }

    public function testAPageTagMustAppearExactlyOnce(): void
    {
        [, $problems] = install_page_versions($this->dir, '<p>none</p>', 'index.html', ['dist/main.js']);
        $this->assertSame(['index.html must reference dist/main.js?v=... exactly once (found 0)'], $problems);
    }

    public function testBlockIsInsertedThenReplaced(): void
    {
        [$card] = install_card($this->dir, 'play');
        $page = (string) file_get_contents("$this->dir/index.html");
        $once = install_apply($page, install_block($card, '    '));
        $this->assertNotNull($once);
        $this->assertSame($once, install_apply($once, install_block($card, '    ')));
        $this->assertStringContainsString('<meta name="apple-mobile-web-app-title" content="Arty">', $once);
        $this->assertNull(install_apply('<p>no title</p>', 'x'));
    }

    public function testManifestForAPlayGameAndAStartGame(): void
    {
        [$card] = install_card($this->dir, 'play');
        $play = json_decode(install_manifest($card, 'arty'), true);
        $this->assertSame(['./', './'], [$play['start_url'], $play['scope']]);
        $start = json_decode(install_manifest(['start' => 'arty'] + $card, 'arty'), true);
        $this->assertSame(['../../?game=arty', '../../'], [$start['start_url'], $start['scope']]);
    }

    public function testPrecacheListsShippedFilesOnly(): void
    {
        file_put_contents("$this->dir/fx-editor.js", '');
        [$names] = install_precache($this->dir, [], 'og.png', ['dist'], ['fx-editor.*']);
        $this->assertSame(['dist/main.js', 'game.css', 'icon-192.png', 'icon-512.png', 'index.html'], $names);
    }

    public function testPrecacheListsOnlyExistingFiles(): void
    {
        [$names] = install_precache($this->dir, ['manifest.webmanifest' => '{}'], 'og.png', ['dist', 'missing-dir'], []);
        foreach ($names as $n) {
            $this->assertTrue(is_file("$this->dir/$n") || $n === 'manifest.webmanifest', $n);
        }
    }

    public function testPrecacheHashFollowsContent(): void
    {
        [, $a] = install_precache($this->dir, [], 'og.png', ['dist'], []);
        file_put_contents("$this->dir/dist/main.js", 'console.log(2)');
        [, $b] = install_precache($this->dir, [], 'og.png', ['dist'], []);
        $this->assertNotSame($a, $b);
    }

    public function testIconsMustBeSquarePngsOfTheirSize(): void
    {
        $this->assertSame([], install_icon_problems($this->dir));
        file_put_contents("$this->dir/icon-512.png", self::png(511));
        $this->assertSame(['icon-512.png must be a 512x512 PNG'], install_icon_problems($this->dir));
    }

    public function testSyncWritesThenChecksClean(): void
    {
        [$stale] = install_sync($this->dir, self::PLAY, true);
        $this->assertSame(['index.html', 'manifest.webmanifest', 'sw.js'], $stale);
        [$again, $notes] = install_sync($this->dir, self::PLAY, false);
        $this->assertSame([[], []], [$again, $notes]);
        $this->assertStringContainsString('"dist/main.js"', (string) file_get_contents("$this->dir/sw.js"));
        $this->assertStringNotContainsString('main.js.map', (string) file_get_contents("$this->dir/sw.js"));
    }

    public function testAStartGameGetsOnlyAManifest(): void
    {
        file_put_contents("$this->dir/metadata.yaml", "title: Arty\ndescription: Lob.\nstart: artyStart\n");
        [$stale] = install_sync($this->dir, ['kind' => 'start'], true);
        $this->assertSame(['manifest.webmanifest'], $stale);
        $this->assertFileDoesNotExist("$this->dir/sw.js");
    }

    public function testRunReturnsOneOnACheckThatFindsStaleFiles(): void
    {
        ob_start();
        $code = install_run($this->dir, self::PLAY, ['install-files.php', '--check']);
        ob_end_clean();
        $this->assertSame(1, $code);
    }
}
