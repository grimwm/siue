<?php
// Tests for tools/site-game-pages.php. Run: php tests/site-game-pages-test.php
// Exit 0 when every check passes, 1 otherwise.
declare(strict_types=1);
require_once __DIR__ . '/../tools/site-game-pages.php';

$fail = 0;
$check = function (string $name, bool $cond, string $extra = '') use (&$fail): void {
    echo ($cond ? 'PASS' : 'FAIL') . ' ' . $name . ($extra !== '' ? ' :: ' . $extra : '') . "\n";
    if (!$cond) {
        $fail++;
    }
};

$site = 'https://example.edu/~me/';
$tmp = sys_get_temp_dir() . '/site-game-pages-test-' . getmypid();
$root = "$tmp/games";
@mkdir("$root/arty", 0777, true);
@mkdir("$root/mounted", 0777, true);
// The shared files every wrapper page loads, with a version of their own.
@mkdir("$tmp/play", 0777, true);
file_put_contents("$tmp/play/play.css", ".play-nav{}\n");
file_put_contents("$tmp/play/play.js", "(function () {})();\n");
file_put_contents("$root/arty/metadata.yaml", "title: Arty & Co\ndescription: \"Lob <shells> at drones.\"\nplay: index.html\nimage: og.png\n");
file_put_contents("$root/arty/og.png", 'png');
$page = "<!doctype html>\n<html>\n<head>\n<meta charset=\"utf-8\">\n<title>Arty</title>\n</head>\n<body>hi</body>\n</html>\n";
file_put_contents("$root/arty/index.html", $page);
file_put_contents("$root/mounted/metadata.yaml", "title: Mounted\ndescription: Runs in the site page.\nstart: goGame\n");

// Check mode on a fresh tree reports both games stale and writes nothing.
[$stale, $notes] = site_pages_sync($root, $site, false);
sort($stale);
$check('check-finds-stale', $stale === ['arty', 'mounted'], json_encode($stale));
$check('check-writes-nothing', file_get_contents("$root/arty/index.html") === $page && !is_dir("$tmp/play/arty") && !is_dir("$tmp/play/mounted"));

// Write mode writes the site's pages and leaves the game's own page alone.
site_pages_sync($root, $site, true);
$check('game-page-untouched', file_get_contents("$root/arty/index.html") === $page);

// The site's wrapper page carries the previews (escaped, absolute URLs), the
// navbar back to the site, and the game in a frame.
$wrap = (string) @file_get_contents("$tmp/play/arty/index.html");
$check('wrapper-title', str_contains($wrap, '<meta property="og:title" content="Arty &amp; Co">'));
$check('wrapper-escaped', str_contains($wrap, 'content="Lob &lt;shells&gt; at drones."'));
$check('wrapper-url', str_contains($wrap, '<meta property="og:url" content="https://example.edu/~me/play/arty/">'));
$check('wrapper-image', str_contains($wrap, '<meta property="og:image" content="https://example.edu/~me/games/arty/og.png">')
    && str_contains($wrap, '<meta name="twitter:card" content="summary_large_image">'));
$check('wrapper-nav', str_contains($wrap, 'href="../../">William Grim</a>') && str_contains($wrap, 'href="../../#contact"')
    && str_contains($wrap, 'href="../../#games"'));
$check('wrapper-github-left-of-games', str_contains($wrap, 'class="play-github" href="https://github.com/grimwm/siue" target="_blank" rel="noopener" aria-label="Source on GitHub"')
    && strpos($wrap, 'class="play-github"') < strpos($wrap, 'class="play-games"'));
$check('wrapper-frames-game', str_contains($wrap, '<iframe class="play-frame" id="play-frame" src="../../games/arty/"')
    && str_contains($wrap, 'allow="fullscreen; keyboard-lock'));
$check('wrapper-colours', str_contains($wrap, '--game-bg: ' . GAMES_HUB_DEFAULT_COLOR . ';')
    && str_contains($wrap, '--game-accent: ' . GAMES_HUB_DEFAULT_ACCENT . ';'));
$check('wrapper-installs-game', str_contains($wrap, '<link rel="manifest" href="../../games/arty/manifest.webmanifest">')
    && !str_contains($wrap, 'serviceWorker'));

// The shared stylesheet and script carry a content-hash version, so a changed
// file is fetched afresh.
$vOf = fn(string $f): string => substr(hash('sha256', (string) file_get_contents("$tmp/play/$f")), 0, 10);
$check('wrapper-versions-shared-files', str_contains($wrap, '<link rel="stylesheet" href="../play.css?v=' . $vOf('play.css') . '">')
    && str_contains($wrap, '<script src="../play.js?v=' . $vOf('play.js') . '" defer></script>'));

// A mounted game gets a site page that forwards to the site.
$fwd = (string) @file_get_contents("$tmp/play/mounted/index.html");
$check('start-page-written', str_contains($fwd, '<meta property="og:title" content="Mounted">'));
$check('start-page-forwards', str_contains($fwd, 'url=../../?game=mounted') && str_contains($fwd, 'http-equiv="refresh"'));
$check('start-page-no-image-card', str_contains($fwd, '<meta name="twitter:card" content="summary">'));

// Idempotent: a second write changes nothing, and check mode is clean.
site_pages_sync($root, $site, true);
$check('write-idempotent', file_get_contents("$tmp/play/arty/index.html") === $wrap);
[$stale] = site_pages_sync($root, $site, false);
$check('check-clean-after-write', $stale === [], json_encode($stale));

// Changing play.js re-versions its tag on every wrapper page, and only that.
$jsBefore = $vOf('play.js');
file_put_contents("$tmp/play/play.js", "(function () { /* edited */ })();\n");
[$stale] = site_pages_sync($root, $site, false);
$check('check-sees-changed-shared-script', $stale === ['arty'], json_encode($stale));
site_pages_sync($root, $site, true);
$after = (string) file_get_contents("$tmp/play/arty/index.html");
$check('rewrite-moves-only-the-script-version', $vOf('play.js') !== $jsBefore
    && str_contains($after, 'play.js?v=' . $vOf('play.js')) && str_contains($after, 'play.css?v=' . $vOf('play.css'))
    && str_replace('play.js?v=' . $vOf('play.js'), 'play.js?v=' . $jsBefore, $after) === $wrap);
file_put_contents("$tmp/play/play.css", ".play-nav{color:red}\n");
[$stale] = site_pages_sync($root, $site, false);
$check('check-sees-changed-shared-stylesheet', $stale === ['arty'], json_encode($stale));
site_pages_sync($root, $site, true);
[$stale] = site_pages_sync($root, $site, false);
$check('clean-after-shared-rewrite', $stale === [], json_encode($stale));

// A shared file that cannot be read stops the run: a note, a failure flag, nothing written.
$keep = (string) file_get_contents("$tmp/play/play.js");
$wrapNow = (string) file_get_contents("$tmp/play/arty/index.html");
unlink("$tmp/play/play.js");
[$stale, $notes, $broken] = site_pages_sync($root, $site, true);
$check('unreadable-shared-file-fails', $stale === [] && $broken === true && in_array('play/play.js is not readable, but the wrapper pages load it', $notes, true)
    && file_get_contents("$tmp/play/arty/index.html") === $wrapNow, json_encode([$stale, $notes, $broken]));
file_put_contents("$tmp/play/play.js", $keep);

// Editing metadata makes the page stale again.
file_put_contents("$root/arty/metadata.yaml", "title: Arty 2\ndescription: New.\nplay: index.html\n");
[$stale] = site_pages_sync($root, $site, false);
$check('check-sees-metadata-change', $stale === ['arty'], json_encode($stale));

// The wrapper takes the game's colours and links its manifest and icon.
file_put_contents("$root/arty/metadata.yaml", "title: Arty & Co\ndescription: Lob shells.\nshort_name: Arty\ntheme_color: \"#112233\"\nbackground_color: \"#445566\"\naccent_color: \"#aabbcc\"\nplay: index.html\nimage: og.png\n");
site_pages_sync($root, $site, true);
[$stale] = site_pages_sync($root, $site, false);
$check('colours-clean-after-write', $stale === [], json_encode($stale));
$check('wrapper-game-colours', str_contains((string) file_get_contents("$tmp/play/arty/index.html"),
    '--game-bg: #445566; --game-theme: #112233; --game-accent: #aabbcc;'));
$check('wrapper-install-tags', str_contains($wrap, '<meta name="theme-color"')
    && str_contains((string) file_get_contents("$tmp/play/arty/index.html"), '<meta name="apple-mobile-web-app-title" content="Arty">'));
$check('start-page-links-manifest', str_contains((string) file_get_contents("$tmp/play/mounted/index.html"),
    '<link rel="manifest" href="../../games/mounted/manifest.webmanifest">'));

// The site tool never touches a game folder.
$check('game-folders-untouched', !is_file("$root/arty/manifest.webmanifest") && !is_file("$root/arty/sw.js")
    && !is_file("$root/mounted/manifest.webmanifest") && !is_file("$root/mounted/index.html"));

// The site's own games are in sync with their metadata.
[$stale, $notes, $broken] = site_pages_sync(__DIR__ . '/../games', SITE_PAGES_SITE, false);
$check('repo-games-in-sync', $stale === [], 'run: php tools/site-game-pages.php  (stale: ' . implode(', ', $stale) . ')');

exec('rm -rf ' . escapeshellarg($tmp));
echo $fail === 0 ? "SITE-PAGES-OK\n" : "SITE-PAGES-FAIL $fail\n";
exit($fail === 0 ? 0 : 1);
