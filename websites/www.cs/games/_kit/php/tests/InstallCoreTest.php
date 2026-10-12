<?php
// Tests install-core.php: YAML card, ?v= hashes, install block, manifest, precache and sync.
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

    public function testManifestHasNoIdAndTakesItsFieldsFromMetadata(): void
    {
        [$card] = install_card($this->dir, 'play');
        $m = json_decode(install_manifest($card, 'arty'), true);
        $this->assertArrayNotHasKey('id', $m);
        $this->assertSame(['Arty & Co', 'Arty', '#112233', '#445566'], [$m['name'], $m['short_name'], $m['theme_color'], $m['background_color']]);
    }

    public function testCheckDetectsAHandEditedManifestAndAWriteRestoresIt(): void
    {
        install_sync($this->dir, self::PLAY, true);
        $path = "$this->dir/manifest.webmanifest";
        $good = (string) file_get_contents($path);
        file_put_contents($path, str_replace('Arty', 'Edited', $good));
        [$stale] = install_sync($this->dir, self::PLAY, false);
        $this->assertSame(['manifest.webmanifest'], $stale);
        install_sync($this->dir, self::PLAY, true);
        $this->assertSame($good, file_get_contents($path));
    }

    public function testCheckWritesNothing(): void
    {
        $before = [];
        foreach (scandir($this->dir) as $f) {
            $before[$f] = is_file("$this->dir/$f") ? md5_file("$this->dir/$f") : null;
        }
        install_sync($this->dir, self::PLAY, false);
        $after = [];
        foreach (scandir($this->dir) as $f) {
            $after[$f] = is_file("$this->dir/$f") ? md5_file("$this->dir/$f") : null;
        }
        $this->assertSame($before, $after);
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

    public function testKitPhpIsCopiedIntoServerAndChecked(): void
    {
        file_put_contents("$this->dir/metadata.yaml", "title: Arty\ndescription: Lob.\nstart: artyStart\n");
        $config = ['kind' => 'start', 'kit_php' => ['install-core.php']];
        [$stale] = install_sync($this->dir, $config, true);
        $this->assertSame(['manifest.webmanifest', 'server/install-core.php'], $stale);
        $this->assertFileEquals(dirname(__DIR__) . '/install-core.php', "$this->dir/server/install-core.php");
        $this->assertSame([[], []], install_sync($this->dir, $config, false));
        file_put_contents("$this->dir/server/install-core.php", '<?php // edited by hand');
        $this->assertSame([['server/install-core.php'], []], install_sync($this->dir, $config, false));
    }

    public function testKitPhpMustNameAKitFile(): void
    {
        file_put_contents("$this->dir/metadata.yaml", "title: Arty\ndescription: Lob.\nstart: artyStart\n");
        [$stale, $notes] = install_sync($this->dir, ['kind' => 'start', 'kit_php' => ['nope.php']], true);
        $this->assertSame([], $stale);
        $this->assertSame(['config: kit_php names nope.php, which games/_kit/php does not have'], $notes);
        [, $notes] = install_sync($this->dir, ['kind' => 'start', 'kit_php' => ['../install-core.php']], true);
        $this->assertSame(['config: kit_php entries are file names in games/_kit/php, such as score-guard.php'], $notes);
        $this->assertDirectoryDoesNotExist("$this->dir/server");
    }

    public function testRunReturnsOneOnACheckThatFindsStaleFiles(): void
    {
        $err = fopen('php://memory', 'w+');
        $code = install_run($this->dir, self::PLAY, ['install-files.php', '--check'], $err);
        rewind($err);
        $text = (string) stream_get_contents($err);
        $this->assertSame(1, $code);
        foreach (['index.html', 'manifest.webmanifest', 'sw.js'] as $f) {
            $this->assertStringContainsString("install-files: $f is stale", $text);
        }
    }

    public function testRunWritesAndReturnsZero(): void
    {
        $err = fopen('php://memory', 'w+');
        $out = fopen('php://memory', 'w+');
        $code = install_run($this->dir, self::PLAY, ['install-files.php'], $err, $out);
        rewind($err);
        rewind($out);
        $this->assertSame(0, $code);
        $this->assertSame('', stream_get_contents($err));
        $text = (string) stream_get_contents($out);
        foreach (['index.html', 'manifest.webmanifest', 'sw.js'] as $f) {
            $this->assertStringContainsString("install-files: wrote $f", $text);
        }
    }

    public function testPrecacheSkipsToolingAndKeepsNestedFiles(): void
    {
        mkdir("$this->dir/dist/sub", 0777, true);
        foreach (['package.json', 'tsconfig.json', 'build.json', 'sw.js', 'dist/sub/x.js'] as $f) {
            file_put_contents("$this->dir/$f", '{}');
        }
        [$names] = install_precache($this->dir, [], 'og.png', ['dist'], []);
        $this->assertContains('dist/sub/x.js', $names);
        foreach (['package.json', 'tsconfig.json', 'build.json', 'sw.js'] as $f) {
            $this->assertNotContains($f, $names);
        }
    }

    public function testPrecacheSkipsAnImageInsideAPrecacheFolder(): void
    {
        file_put_contents("$this->dir/dist/og.png", 'png');
        [$names] = install_precache($this->dir, [], 'dist/og.png', ['dist'], []);
        $this->assertNotContains('dist/og.png', $names);
        $this->assertContains('dist/main.js', $names);
    }

    public function testAnUnreadableVersionedFileIsAProblem(): void
    {
        [, $problems] = install_page_versions($this->dir, '<p></p>', 'index.html', ['gone.js']);
        $this->assertSame(['gone.js is not readable, but index.html references it'], $problems);
    }
}
