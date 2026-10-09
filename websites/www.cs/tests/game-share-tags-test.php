<?php
// Tests for tools/game-share-tags.php. Run: php tests/game-share-tags-test.php
// Exit 0 when every check passes, 1 otherwise.
declare(strict_types=1);
require_once __DIR__ . '/../tools/game-share-tags.php';

$fail = 0;
$check = function (string $name, bool $cond, string $extra = '') use (&$fail): void {
    echo ($cond ? 'PASS' : 'FAIL') . ' ' . $name . ($extra !== '' ? ' :: ' . $extra : '') . "\n";
    if (!$cond) {
        $fail++;
    }
};

$site = 'https://example.edu/~me/';
$tmp = sys_get_temp_dir() . '/game-share-tags-test-' . getmypid();
$root = "$tmp/games";
@mkdir("$root/arty", 0777, true);
@mkdir("$root/mounted", 0777, true);
file_put_contents("$root/arty/metadata.yaml", "title: Arty & Co\ndescription: \"Lob <shells> at drones.\"\nplay: index.html\nimage: og.png\n");
file_put_contents("$root/arty/og.png", 'png');
$page = "<!doctype html>\n<html>\n<head>\n<meta charset=\"utf-8\">\n<title>Arty</title>\n</head>\n<body>hi</body>\n</html>\n";
file_put_contents("$root/arty/index.html", $page);
file_put_contents("$root/mounted/metadata.yaml", "title: Mounted\ndescription: Runs in the site page.\nstart: goGame\n");

// Check mode on a fresh tree reports both games stale and writes nothing.
[$stale, $notes] = share_tags_sync($root, $site, false);
sort($stale);
$check('check-finds-stale', $stale === ['arty', 'mounted'], json_encode($stale));
$check('check-writes-nothing', file_get_contents("$root/arty/index.html") === $page && !is_file("$root/mounted/index.html"));

// Write mode fills the play page's head, escaped, with absolute URLs.
share_tags_sync($root, $site, true);
$html = file_get_contents("$root/arty/index.html");
$check('play-page-block', substr_count($html, SHARE_TAGS_BEGIN) === 1 && substr_count($html, SHARE_TAGS_END) === 1);
$check('play-page-title', str_contains($html, '<meta property="og:title" content="Arty &amp; Co">'));
$check('play-page-escaped', str_contains($html, 'content="Lob &lt;shells&gt; at drones."'));
$check('play-page-url', str_contains($html, '<meta property="og:url" content="https://example.edu/~me/games/arty/">'));
$check('play-page-image', str_contains($html, '<meta property="og:image" content="https://example.edu/~me/games/arty/og.png">')
    && str_contains($html, '<meta name="twitter:card" content="summary_large_image">'));
$check('play-page-body-kept', str_contains($html, '<body>hi</body>') && str_contains($html, '<title>Arty</title>'));

// A mounted game gets a share page that forwards to the site.
$fwd = (string) @file_get_contents("$root/mounted/index.html");
$check('start-page-written', str_contains($fwd, '<meta property="og:title" content="Mounted">'));
$check('start-page-forwards', str_contains($fwd, 'url=../../?game=mounted') && str_contains($fwd, 'http-equiv="refresh"'));
$check('start-page-no-image-card', str_contains($fwd, '<meta name="twitter:card" content="summary">'));

// Idempotent: a second write changes nothing, and check mode is clean.
share_tags_sync($root, $site, true);
$check('write-idempotent', file_get_contents("$root/arty/index.html") === $html);
[$stale] = share_tags_sync($root, $site, false);
$check('check-clean-after-write', $stale === [], json_encode($stale));

// Editing metadata makes the page stale again.
file_put_contents("$root/arty/metadata.yaml", "title: Arty 2\ndescription: New.\nplay: index.html\n");
[$stale] = share_tags_sync($root, $site, false);
$check('check-sees-metadata-change', $stale === ['arty'], json_encode($stale));

// The site's own games are in sync with their metadata.
[$stale, $notes] = share_tags_sync(__DIR__ . '/../games', SHARE_TAGS_SITE, false);
$check('repo-games-in-sync', $stale === [], 'run: php tools/game-share-tags.php  (stale: ' . implode(', ', $stale) . ')');

exec('rm -rf ' . escapeshellarg($tmp));
echo $fail === 0 ? "SHARE-TAGS-OK\n" : "SHARE-TAGS-FAIL $fail\n";
exit($fail === 0 ? 0 : 1);
