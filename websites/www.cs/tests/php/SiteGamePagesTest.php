<?php
// Tests for tools/site-game-pages.php. Each test starts from the games and shared
// files that setUp() writes under $this->tmp.
declare(strict_types=1);
require_once __DIR__ . '/../../tools/site-game-pages.php';
require_once __DIR__ . '/../../games/_kit/php/tests/TempDir.php';

use Kit\Tests\TempDir;
use PHPUnit\Framework\TestCase;

final class SiteGamePagesTest extends TestCase
{
    use TempDir;

    private string $site = 'https://example.edu/~me/';
    private string $tmp;
    private string $root;
    private string $page;

    /** Two games (a page game and a mounted one) and the shared play files, in a scratch tree. */
    protected function setUp(): void
    {
        $this->tmp = self::makeTempDir('site-game-pages-test');
        $this->root = "$this->tmp/games";
        mkdir("$this->root/arty", 0777, true);
        mkdir("$this->root/mounted", 0777, true);
        // The shared files every wrapper page loads, with a version of their own.
        mkdir("$this->tmp/play", 0777, true);
        file_put_contents("$this->tmp/play/play.css", ".play-nav{}\n");
        file_put_contents("$this->tmp/play/play.js", "(function () {})();\n");
        file_put_contents("$this->root/arty/metadata.yaml", "title: Arty & Co\ndescription: \"Lob <shells> at drones.\"\nplay: index.html\nimage: og.png\n");
        file_put_contents("$this->root/arty/og.png", 'png');
        // A page game's built Install and Share bar, which its site page loads.
        mkdir("$this->root/arty/dist", 0777, true);
        file_put_contents("$this->root/arty/dist/install.js", "(()=>{})();\n");
        // Its built entry, whose hash is the game's version.
        file_put_contents("$this->root/arty/dist/main.js", "export {};\n");
        $this->page = "<!doctype html>\n<html>\n<head>\n<meta charset=\"utf-8\">\n<title>Arty</title>\n</head>\n<body>hi</body>\n</html>\n";
        file_put_contents("$this->root/arty/index.html", $this->page);
        file_put_contents("$this->root/mounted/metadata.yaml", "title: Mounted\ndescription: Runs in the site page.\nstart: goGame\n");
    }

    protected function tearDown(): void
    {
        self::removeTree($this->tmp);
    }

    /** The ?v= a wrapper page should carry for a shared play file. */
    private function vOf(string $f): string
    {
        return substr(hash('sha256', (string) file_get_contents("$this->tmp/play/$f")), 0, 10);
    }

    /** check mode on a fresh tree reports both games stale and writes nothing */
    public function testCheckModeFindsStale(): void
    {
        [$stale, $notes] = site_pages_sync($this->root, $this->site, false);
        sort($stale);
        self::assertTrue($stale === ['arty', 'mounted'], 'check-finds-stale' . ' :: ' . json_encode($stale));
        self::assertTrue(file_get_contents("$this->root/arty/index.html") === $this->page && !is_dir("$this->tmp/play/arty") && !is_dir("$this->tmp/play/mounted"), 'check-writes-nothing');
    }

    /** write mode writes the site's pages and leaves the game's own page alone */
    public function testWriteLeavesGamePageAlone(): void
    {
        site_pages_sync($this->root, $this->site, true);
        self::assertTrue(file_get_contents("$this->root/arty/index.html") === $this->page, 'game-page-untouched');
    }

    /** the site's wrapper page carries the previews (escaped, absolute URLs), the navbar back to the site, and the game in a frame */
    public function testWrapperPage(): void
    {
        site_pages_sync($this->root, $this->site, true);
        $wrap = (string) @file_get_contents("$this->tmp/play/arty/index.html");
        self::assertTrue(str_contains($wrap, '<meta property="og:title" content="Arty &amp; Co">'), 'wrapper-title');
        self::assertTrue(str_contains($wrap, 'content="Lob &lt;shells&gt; at drones."'), 'wrapper-escaped');
        // og:url carries the game's version (the hash of its dist/main.js), so each release is a new
        // Facebook object; the canonical link and JSON-LD url stay bare for search engines.
        $v = substr(hash('sha256', "export {};\n"), 0, 10);
        self::assertTrue(str_contains($wrap, '<meta property="og:url" content="https://example.edu/~me/play/arty/?v=' . $v . '">'), 'wrapper-og-url-versioned');
        self::assertTrue(str_contains($wrap, '<link rel="canonical" href="https://example.edu/~me/play/arty/">'), 'wrapper-canonical-bare');
        $og = 'https://example.edu/~me/games/arty/og.png?v=' . substr(hash('sha256', 'png'), 0, 10);
        self::assertTrue(str_contains($wrap, '<meta property="og:image" content="' . $og . '">')
            && str_contains($wrap, '<meta property="og:image:secure_url" content="' . $og . '">')
            && str_contains($wrap, '<meta property="og:image:type" content="image/png">')
            && str_contains($wrap, '<meta property="og:image:width" content="1200">')
            && str_contains($wrap, '<meta property="og:image:height" content="630">')
            && str_contains($wrap, '<meta property="og:image:alt" content="Arty &amp; Co in play">')
            && str_contains($wrap, '<meta name="twitter:card" content="summary_large_image">')
            && str_contains($wrap, '<meta name="twitter:image" content="' . $og . '">')
            && str_contains($wrap, '<meta name="twitter:image:alt" content="Arty &amp; Co in play">'), 'wrapper-image');
        // No clip in the metadata, no og:video.
        self::assertTrue(!str_contains($wrap, 'og:video'), 'wrapper-no-video');
        // JSON-LD: a free browser game, with the share picture.
        self::assertTrue((bool) preg_match('#<script type="application/ld\+json">(.*?)</script>#', $wrap, $m), 'wrapper-json-ld');
        $ld = json_decode($m[1], true);
        self::assertTrue($ld['@type'] === ['VideoGame', 'WebApplication'] && $ld['name'] === 'Arty & Co'
            && $ld['description'] === 'Lob <shells> at drones.' && $ld['url'] === 'https://example.edu/~me/play/arty/'
            && $ld['image'] === $og && $ld['isAccessibleForFree'] === true
            && $ld['offers'] === ['@type' => 'Offer', 'price' => '0', 'priceCurrency' => 'USD'], 'wrapper-json-ld-fields :: ' . $m[1]);
        self::assertTrue(!str_contains($m[1], '<shells>'), 'wrapper-json-ld-escapes-tags');
        self::assertTrue(str_contains($wrap, 'href="../../">William Grim</a>') && str_contains($wrap, 'href="../../#contact"')
            && str_contains($wrap, 'href="../../#games"'), 'wrapper-nav');
        self::assertTrue(str_contains($wrap, 'class="play-github" href="https://github.com/grimwm/siue" target="_blank" rel="noopener" aria-label="Source on GitHub"')
            && strpos($wrap, 'class="play-github"') < strpos($wrap, 'class="play-games"'), 'wrapper-github-left-of-games');
        self::assertTrue(str_contains($wrap, '<iframe class="play-frame" id="play-frame" src="../../games/arty/"')
            && str_contains($wrap, 'allow="fullscreen; keyboard-lock'), 'wrapper-frames-game');
        self::assertTrue(str_contains($wrap, '--game-bg: ' . GAMES_HUB_DEFAULT_COLOR . ';')
            && str_contains($wrap, '--game-accent: ' . GAMES_HUB_DEFAULT_ACCENT . ';'), 'wrapper-colours');
        self::assertTrue(str_contains($wrap, '<link rel="manifest" href="../../games/arty/manifest.webmanifest">')
            && !str_contains($wrap, 'serviceWorker'), 'wrapper-installs-game');
        // Install and Share: the bar's mount after the game's name, the game's
        // dist/install.js with its own version, and the early-prompt stash before it.
        self::assertTrue(str_contains($wrap, '<span class="play-install" id="play-install" data-title="Arty &amp; Co" data-game-page="../../games/arty/" data-version="' . $v . '"></span>')
            && strpos($wrap, 'class="play-now"') < strpos($wrap, 'id="play-install"'), 'wrapper-install-bar');
        self::assertTrue(str_contains($wrap, '<script src="../../games/arty/dist/install.js?v='
            . substr(hash('sha256', (string) file_get_contents("$this->root/arty/dist/install.js")), 0, 10) . '" defer></script>'), 'wrapper-loads-install-js');
        self::assertTrue(str_contains($wrap, INSTALL_PROMPT_STASH)
            && strpos($wrap, INSTALL_PROMPT_STASH) < strpos($wrap, '<script src='), 'wrapper-stashes-the-prompt-first');

        // The shared stylesheet and script carry a content-hash version, so a changed
        // file is fetched afresh.
        self::assertTrue(str_contains($wrap, '<link rel="stylesheet" href="../play.css?v=' . $this->vOf('play.css') . '">')
            && str_contains($wrap, '<script src="../play.js?v=' . $this->vOf('play.js') . '" defer></script>'), 'wrapper-versions-shared-files');
    }

    /** a game's clip becomes og:video (absolute, versioned, typed, sized) and its kicker and genre reach the alt text and JSON-LD */
    public function testVideoKickerGenre(): void
    {
        file_put_contents("$this->root/arty/clip.mp4", 'mp4');
        file_put_contents("$this->root/arty/metadata.yaml", "title: Arty\nkicker: Lob shells\ngenre: Artillery\ndescription: Lob shells.\nplay: index.html\nimage: og.png\nvideo: clip.mp4\n");
        site_pages_sync($this->root, $this->site, true);
        $wrap = (string) @file_get_contents("$this->tmp/play/arty/index.html");
        $clip = 'https://example.edu/~me/games/arty/clip.mp4?v=' . substr(hash('sha256', 'mp4'), 0, 10);
        self::assertTrue(str_contains($wrap, '<meta property="og:video" content="' . $clip . '">')
            && str_contains($wrap, '<meta property="og:video:secure_url" content="' . $clip . '">')
            && str_contains($wrap, '<meta property="og:video:type" content="video/mp4">')
            && str_contains($wrap, '<meta property="og:video:width" content="1280">')
            && str_contains($wrap, '<meta property="og:video:height" content="720">'), 'wrapper-video');
        // The still stays the preview, and the page stays a website.
        self::assertTrue(str_contains($wrap, '<meta property="og:type" content="website">')
            && str_contains($wrap, '<meta name="twitter:card" content="summary_large_image">')
            && !str_contains($wrap, 'twitter:player'), 'wrapper-still-is-preview');
        self::assertTrue(str_contains($wrap, 'content="Arty in play: lob shells"') && str_contains($wrap, '"genre":"Artillery"'), 'wrapper-kicker-genre');
        // A recaptured clip is a new address, so the page goes stale.
        file_put_contents("$this->root/arty/clip.mp4", 'mp4 again');
        [$stale] = site_pages_sync($this->root, $this->site, false);
        self::assertTrue($stale === ['arty'], 'wrapper-stale-on-new-clip');
    }

    /** search text is cut at a whole sentence near 160 characters */
    public function testSummary(): void
    {
        self::assertTrue(site_pages_summary('Short.') === 'Short.', 'summary-short');
        $long = 'Defend this page from Cylon drones: missiles, Raptors, and one opening nuke. Play often: weekly high scores reset every Sunday at midnight Central. You can also start from the nav Game Off toggle.';
        self::assertTrue(site_pages_summary($long) === 'Defend this page from Cylon drones: missiles, Raptors, and one opening nuke. Play often: weekly high scores reset every Sunday at midnight Central.', 'summary-sentences');
        $one = str_repeat('word ', 50);
        $cut = site_pages_summary($one);
        self::assertTrue(mb_strlen($cut) <= 160 && str_ends_with($cut, 'word…'), 'summary-one-long-sentence :: ' . $cut);
    }

    /** a mounted game gets a site page that forwards to the site */
    public function testStartPage(): void
    {
        site_pages_sync($this->root, $this->site, true);
        $fwd = (string) @file_get_contents("$this->tmp/play/mounted/index.html");
        self::assertTrue(str_contains($fwd, '<meta property="og:title" content="Mounted">'), 'start-page-written');
        self::assertTrue(str_contains($fwd, 'url=../../?game=mounted') && str_contains($fwd, 'http-equiv="refresh"'), 'start-page-forwards');
        self::assertTrue(str_contains($fwd, '<meta name="twitter:card" content="summary">'), 'start-page-no-image-card');
        self::assertTrue(str_contains($fwd, "<script>location.replace(\"../../?game=mounted\" + location.search.replace(/^\\?/, '&') + location.hash);</script>")
            && str_contains($fwd, '<noscript><meta http-equiv="refresh" content="0; url=../../?game=mounted"></noscript>'), 'start-page-keeps-the-query');
    }

    /** a second write changes nothing, and check mode is clean */
    public function testWriteIsIdempotent(): void
    {
        site_pages_sync($this->root, $this->site, true);
        $wrap = (string) @file_get_contents("$this->tmp/play/arty/index.html");
        site_pages_sync($this->root, $this->site, true);
        self::assertTrue(file_get_contents("$this->tmp/play/arty/index.html") === $wrap, 'write-idempotent');
        [$stale] = site_pages_sync($this->root, $this->site, false);
        self::assertTrue($stale === [], 'check-clean-after-write' . ' :: ' . json_encode($stale));
    }

    /** changing play.js re-versions its tag on every wrapper page, and only that */
    public function testSharedFileChangeReversions(): void
    {
        site_pages_sync($this->root, $this->site, true);
        $wrap = (string) file_get_contents("$this->tmp/play/arty/index.html");
        $jsBefore = $this->vOf('play.js');
        file_put_contents("$this->tmp/play/play.js", "(function () { /* edited */ })();\n");
        [$stale] = site_pages_sync($this->root, $this->site, false);
        self::assertTrue($stale === ['arty'], 'check-sees-changed-shared-script' . ' :: ' . json_encode($stale));
        site_pages_sync($this->root, $this->site, true);
        $after = (string) file_get_contents("$this->tmp/play/arty/index.html");
        self::assertTrue($this->vOf('play.js') !== $jsBefore
            && str_contains($after, 'play.js?v=' . $this->vOf('play.js')) && str_contains($after, 'play.css?v=' . $this->vOf('play.css'))
            && str_replace('play.js?v=' . $this->vOf('play.js'), 'play.js?v=' . $jsBefore, $after) === $wrap, 'rewrite-moves-only-the-script-version');
        file_put_contents("$this->tmp/play/play.css", ".play-nav{color:red}\n");
        [$stale] = site_pages_sync($this->root, $this->site, false);
        self::assertTrue($stale === ['arty'], 'check-sees-changed-shared-stylesheet' . ' :: ' . json_encode($stale));
        site_pages_sync($this->root, $this->site, true);
        [$stale] = site_pages_sync($this->root, $this->site, false);
        self::assertTrue($stale === [], 'clean-after-shared-rewrite' . ' :: ' . json_encode($stale));
    }

    /** a shared file that cannot be read stops the run: a note, a failure flag, nothing written */
    public function testUnreadableSharedFileFails(): void
    {
        site_pages_sync($this->root, $this->site, true);
        $keep = (string) file_get_contents("$this->tmp/play/play.js");
        $wrapNow = (string) file_get_contents("$this->tmp/play/arty/index.html");
        unlink("$this->tmp/play/play.js");
        [$stale, $notes, $broken] = site_pages_sync($this->root, $this->site, true);
        self::assertTrue($stale === [] && $broken === true && in_array('play/play.js is not readable, but the wrapper pages load it', $notes, true)
            && file_get_contents("$this->tmp/play/arty/index.html") === $wrapNow, 'unreadable-shared-file-fails' . ' :: ' . json_encode([$stale, $notes, $broken]));
        file_put_contents("$this->tmp/play/play.js", $keep);
    }

    /** a page game that was never built has no bar to load: a note and a failure */
    public function testUnbuiltGameFails(): void
    {
        unlink("$this->root/arty/dist/install.js");
        [$stale, $notes, $broken] = site_pages_sync($this->root, $this->site, false);
        self::assertTrue($broken === true
            && in_array('games/arty/dist/install.js is not readable, but play/arty/ loads it; build the game', $notes, true), 'unbuilt-game-fails' . ' :: ' . json_encode([$notes, $broken]));
    }

    /** a page game without its built entry has no version to share: a note and a failure */
    public function testUnbuiltEntryFails(): void
    {
        unlink("$this->root/arty/dist/main.js");
        [, $notes, $broken] = site_pages_sync($this->root, $this->site, false);
        self::assertTrue($broken === true
            && in_array('games/arty/dist/main.js is not readable, but play/arty/ shares its version; build the game', $notes, true), 'unbuilt-entry-fails' . ' :: ' . json_encode([$notes, $broken]));
    }

    /** a new release (a rebuilt dist/main.js) is a new og:url, so the page goes stale; a mounted game's page is versioned too */
    public function testReleaseChangesOgUrl(): void
    {
        mkdir("$this->root/mounted/dist", 0777, true);
        file_put_contents("$this->root/mounted/dist/main.js", "m1\n");
        site_pages_sync($this->root, $this->site, true);
        $fwd = (string) file_get_contents("$this->tmp/play/mounted/index.html");
        self::assertTrue(str_contains($fwd, '<meta property="og:url" content="https://example.edu/~me/play/mounted/?v=' . substr(hash('sha256', "m1\n"), 0, 10) . '">')
            && str_contains($fwd, '<link rel="canonical" href="https://example.edu/~me/play/mounted/">'), 'start-page-og-url-versioned');
        file_put_contents("$this->root/arty/dist/main.js", "export const next = 1;\n");
        [$stale] = site_pages_sync($this->root, $this->site, true);
        $wrap = (string) file_get_contents("$this->tmp/play/arty/index.html");
        $v = substr(hash('sha256', "export const next = 1;\n"), 0, 10);
        self::assertTrue($stale === ['arty'] && str_contains($wrap, 'play/arty/?v=' . $v . '">') && str_contains($wrap, 'data-version="' . $v . '"'), 'release-new-og-url');
    }

    /** editing metadata makes the page stale again */
    public function testMetadataChangeMakesStale(): void
    {
        site_pages_sync($this->root, $this->site, true);
        file_put_contents("$this->root/arty/metadata.yaml", "title: Arty 2\ndescription: New.\nplay: index.html\n");
        [$stale] = site_pages_sync($this->root, $this->site, false);
        self::assertTrue($stale === ['arty'], 'check-sees-metadata-change' . ' :: ' . json_encode($stale));
    }

    /** the wrapper takes the game's colours and links its manifest and icon */
    public function testGameColoursAndInstallTags(): void
    {
        site_pages_sync($this->root, $this->site, true);
        $wrap = (string) file_get_contents("$this->tmp/play/arty/index.html");
        file_put_contents("$this->root/arty/metadata.yaml", "title: Arty & Co\ndescription: Lob shells.\nshort_name: Arty\ntheme_color: \"#112233\"\nbackground_color: \"#445566\"\naccent_color: \"#aabbcc\"\nplay: index.html\nimage: og.png\n");
        site_pages_sync($this->root, $this->site, true);
        [$stale] = site_pages_sync($this->root, $this->site, false);
        self::assertTrue($stale === [], 'colours-clean-after-write' . ' :: ' . json_encode($stale));
        self::assertTrue(str_contains((string) file_get_contents("$this->tmp/play/arty/index.html"),
            '--game-bg: #445566; --game-theme: #112233; --game-accent: #aabbcc;'), 'wrapper-game-colours');
        self::assertTrue(str_contains($wrap, '<meta name="theme-color"')
            && str_contains((string) file_get_contents("$this->tmp/play/arty/index.html"), '<meta name="apple-mobile-web-app-title" content="Arty">'), 'wrapper-install-tags');
        self::assertTrue(str_contains((string) file_get_contents("$this->tmp/play/mounted/index.html"),
            '<link rel="manifest" href="../../games/mounted/manifest.webmanifest">'), 'start-page-links-manifest');
    }

    /** the site tool never touches a game folder */
    public function testGameFoldersUntouched(): void
    {
        site_pages_sync($this->root, $this->site, true);
        self::assertTrue(!is_file("$this->root/arty/manifest.webmanifest") && !is_file("$this->root/arty/sw.js")
            && !is_file("$this->root/mounted/manifest.webmanifest") && !is_file("$this->root/mounted/index.html"), 'game-folders-untouched');
    }

    /** each generated game page's og:url is the page with its game's version */
    public function testRepoPagesVersionedUrl(): void
    {
        $games = __DIR__ . '/../../games';
        $pages = glob(__DIR__ . '/../../play/*/index.html') ?: [];
        self::assertTrue(count($pages) >= 3, 'repo-pages-found');
        foreach ($pages as $page) {
            $id = basename(dirname($page));
            $html = (string) file_get_contents($page);
            $v = site_pages_game_version($games, $id);
            self::assertTrue($v !== null && str_contains($html, '<meta property="og:url" content="' . SITE_PAGES_SITE . "play/$id/?v=$v\">"), "repo-og-url-versioned :: $id");
        }
    }

    /** the site's own games are in sync with their metadata */
    public function testRepoGamesInSync(): void
    {
        [$stale, $notes, $broken] = site_pages_sync(__DIR__ . '/../../games', SITE_PAGES_SITE, false);
        self::assertTrue($stale === [], 'repo-games-in-sync' . ' :: ' . 'run: php tools/site-game-pages.php  (stale: ' . implode(', ', $stale) . ')');
    }
}
