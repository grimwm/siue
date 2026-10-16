<?php
// Tests for tools/site-versions.php, which writes the ?v= cache-busters in the
// home page. Each test starts from the page and files that setUp() writes.
declare(strict_types=1);
require_once __DIR__ . '/../../tools/site-versions.php';
require_once __DIR__ . '/../../games/_kit/php/tests/TempDir.php';

use Kit\Tests\TempDir;
use PHPUnit\Framework\TestCase;

final class SiteVersionsTest extends TestCase
{
    use TempDir;

    /** The stylesheets of the game page, in the order the page links them: that order is the cascade. */
    private const SHEETS = ['eye', 'nav', 'help', 'hud', 'gameover', 'settings', 'controls', 'fx', 'units', 'world', 'intro'];

    private string $tmp;
    /** @var array<string, string> path => content of every file the page references */
    private array $files;
    private string $page;

    protected function setUp(): void
    {
        $this->tmp = self::makeTempDir('site-versions-test');
        mkdir("$this->tmp/games/cylon/css", 0777, true);
        mkdir("$this->tmp/games/cylon/dist", 0777, true);
        $this->files = [
            'site.css' => "body{}\n",
            'main.js' => "function f(){}\n",
            'games/cylon/dist/main.js' => "export const x = 1;\n",
            'games/cylon/dist/kit.css' => ".kit-x{}\n",
        ];
        foreach (self::SHEETS as $n) {
            $this->files["games/cylon/css/$n.css"] = ".$n{}\n";
        }
        foreach ($this->files as $f => $content) {
            file_put_contents("$this->tmp/$f", $content);
        }
        $links = implode('', array_map(fn(string $n): string => "<link href=\"games/cylon/css/$n.css?v=old\" rel=\"stylesheet\">\n", self::SHEETS));
        $this->page = "<link href=\"site.css?v=old\" rel=\"stylesheet\">\n<link href=\"games/cylon/dist/kit.css?v=old\" rel=\"stylesheet\">\n$links"
            . "<script src=\"main.js?v=old\"></script>\n"
            . "<script type=\"module\">\nconst m = await import('./games/cylon/dist/main.js?v=old');\n</script>\n";
        file_put_contents("$this->tmp/index.html", $this->page);
    }

    protected function tearDown(): void
    {
        self::removeTree($this->tmp);
    }

    private function read(string $f): string
    {
        return (string) file_get_contents("$this->tmp/$f");
    }

    /** The ?v= the page should carry for a file, from the content it was set up with. */
    private function v(string $f): string
    {
        return substr(hash('sha256', $this->files[$f]), 0, 10);
    }

    /** check mode finds the page stale and writes nothing */
    public function testCheckModeFindsStale(): void
    {
        [$stale, $problems] = site_versions_sync($this->tmp, false);
        self::assertTrue($stale === true && $problems === [], 'check-finds-stale' . ' :: ' . json_encode([$stale, $problems]));
        self::assertTrue($this->read('index.html') === $this->page, 'check-writes-nothing');
    }

    /** write sets every version to its file's hash, and one run converges */
    public function testWriteSetsEveryVersion(): void
    {
        [$stale] = site_versions_sync($this->tmp, true);
        $html = $this->read('index.html');
        self::assertTrue($stale === true, 'write-reports-stale');
        self::assertTrue(str_contains($html, "href=\"site.css?v={$this->v('site.css')}\""), 'site-css-version');
        self::assertTrue(str_contains($html, "src=\"main.js?v={$this->v('main.js')}\""), 'main-js-version');
        foreach (self::SHEETS as $n) {
            self::assertTrue(str_contains($html, "href=\"games/cylon/css/$n.css?v={$this->v("games/cylon/css/$n.css")}\""), "cylon-$n-css-version");
        }
        self::assertTrue(str_contains($html, "import('./games/cylon/dist/main.js?v={$this->v('games/cylon/dist/main.js')}')"), 'cylon-js-version');
        self::assertTrue(str_contains($html, "href=\"games/cylon/dist/kit.css?v={$this->v('games/cylon/dist/kit.css')}\""), 'cylon-kit-css-version');
        [$stale, $problems] = site_versions_sync($this->tmp, false);
        self::assertTrue($stale === false && $problems === [], 'converges-in-one-run' . ' :: ' . json_encode([$stale, $problems]));
        self::assertTrue(preg_replace('/\?v=[0-9a-f]+/', '?v=X', $html) === preg_replace('/\?v=old/', '?v=X', $this->page), 'rewrite-touches-only-versions');
    }

    /** any referenced file changing makes the page stale, and only the page */
    public function testChangedFileMakesPageStale(): void
    {
        site_versions_sync($this->tmp, true);
        foreach (array_keys($this->files) as $f) {
            $this->files[$f] .= "/* more */\n";
            file_put_contents("$this->tmp/$f", $this->files[$f]);
            [$stale] = site_versions_sync($this->tmp, false);
            self::assertTrue($stale === true, "check-sees-changed-$f");
            site_versions_sync($this->tmp, true);
            [$stale] = site_versions_sync($this->tmp, false);
            self::assertTrue($stale === false, "clean-after-rewrite-$f");
        }
    }

    /** a missing or duplicate reference fails loudly and writes nothing */
    public function testBadReferenceFailsLoudly(): void
    {
        site_versions_sync($this->tmp, true);
        $now = $this->read('index.html');
        $cases = [
            'site.css has no version' => [str_replace('site.css?v=', 'site.css#', $now), 'index.html must reference site.css?v=... exactly once (found 0)'],
            'main.js is listed twice' => [$now . "<script src=\"main.js?v=x\"></script>\n", 'index.html must reference main.js?v=... exactly once (found 2)'],
            'a cylon stylesheet is gone' => [str_replace('games/cylon/css/hud.css?v=', 'games/cylon/css/other.css?v=', $now), 'index.html must reference games/cylon/css/hud.css?v=... exactly once (found 0)'],
            'a cylon stylesheet is linked twice' => [$now . "<link href=\"games/cylon/css/eye.css?v=x\" rel=\"stylesheet\">\n", 'index.html must reference games/cylon/css/eye.css?v=... exactly once (found 2)'],
            'cylon stylesheets are out of order' => [str_replace(['css/nav.css?v=', 'css/help.css?v=', 'css/tmp.css?v='], ['css/tmp.css?v=', 'css/nav.css?v=', 'css/help.css?v='], $now), 'index.html must link games/cylon/css/*.css in the order of SITE_VERSIONS_REFS'],
            'the cylon import has no version' => [str_replace("dist/main.js?v=", 'dist/main.js#', $now), 'index.html must reference games/cylon/dist/main.js?v=... exactly once (found 0)'],
            'the cylon bundle is imported twice' => [$now . "import('./games/cylon/dist/main.js?v=y');\n", 'index.html must reference games/cylon/dist/main.js?v=... exactly once (found 2)'],
        ];
        foreach ($cases as $name => [$broken, $expect]) {
            file_put_contents("$this->tmp/index.html", $broken);
            [$stale, $problems] = site_versions_sync($this->tmp, true);
            self::assertTrue($stale === false && in_array($expect, $problems, true) && $this->read('index.html') === $broken, "bad-reference-fails: $name" . ' :: ' . json_encode($problems));
        }
    }

    /** a stylesheet in the folder that the page does not link would never load */
    public function testUnlinkedStylesheetFails(): void
    {
        site_versions_sync($this->tmp, true);
        $now = $this->read('index.html');
        file_put_contents("$this->tmp/games/cylon/css/extra.css", ".x{}\n");
        [$stale, $problems] = site_versions_sync($this->tmp, true);
        self::assertTrue($stale === false && in_array('games/cylon/css/extra.css is not in SITE_VERSIONS_REFS, so index.html would not link it', $problems, true) && $this->read('index.html') === $now, 'an-unlinked-stylesheet-fails' . ' :: ' . json_encode($problems));
    }

    /** a file the page references that cannot be read is reported */
    public function testUnreadableFileFails(): void
    {
        site_versions_sync($this->tmp, true);
        unlink("$this->tmp/main.js");
        [, $problems] = site_versions_sync($this->tmp, false);
        self::assertTrue($problems === ['index.html references main.js, which is not readable'], 'unreadable-file-fails' . ' :: ' . json_encode($problems));
    }

    /** the repository's own page is in sync (build the games, then run php tools/site-versions.php) */
    public function testRepoPageInSync(): void
    {
        [$stale, $problems] = site_versions_sync(dirname(__DIR__, 2), false);
        self::assertTrue($stale === false && $problems === [], 'repo-page-in-sync' . ' :: ' . json_encode([$stale, $problems]));
    }
}
