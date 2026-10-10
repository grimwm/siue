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

/** A valid solid-black $n x $n PNG, no GD needed. */
$png = function (int $n): string {
    $chunk = fn(string $type, string $data): string => pack('N', strlen($data)) . $type . $data . pack('N', crc32($type . $data));
    $rows = str_repeat("\0" . str_repeat("\0", $n * 3), $n);
    return "\x89PNG\r\n\x1a\n" . $chunk('IHDR', pack('NNCCCCC', $n, $n, 8, 2, 0, 0, 0))
        . $chunk('IDAT', gzcompress($rows)) . $chunk('IEND', '');
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
foreach (['arty', 'mounted'] as $id) {
    foreach ([192, 512] as $n) {
        file_put_contents("$root/$id/icon-$n.png", $png($n));
    }
}
file_put_contents("$root/arty/game.js", "console.log(1);\n");
file_put_contents("$root/arty/smoke-test.js", "// not shipped\n");
file_put_contents("$root/arty/scores.php", "<?php\n");

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

// --- Install (PWA) files ----------------------------------------------------

file_put_contents("$root/arty/metadata.yaml", "title: Arty & Co\ndescription: Lob shells.\nshort_name: Arty\ntheme_color: \"#112233\"\nbackground_color: \"#445566\"\nplay: index.html\nimage: og.png\n");
share_tags_sync($root, $site, true);
[$stale] = share_tags_sync($root, $site, false);
$check('pwa-clean-after-write', $stale === [], json_encode($stale));
$m = json_decode((string) @file_get_contents("$root/arty/manifest.webmanifest"), true);
$check('manifest-parses', is_array($m));
$check('manifest-names', ($m['name'] ?? null) === 'Arty & Co' && ($m['short_name'] ?? null) === 'Arty');
$check('manifest-colors', ($m['theme_color'] ?? null) === '#112233' && ($m['background_color'] ?? null) === '#445566');
$check('manifest-display', ($m['display'] ?? null) === 'standalone');
$check('manifest-page-start-in-scope', ($m['start_url'] ?? null) === './' && ($m['scope'] ?? null) === './');
$check('manifest-id', ($m['id'] ?? null) === '/~me/games/arty/');
$check('manifest-icons', array_column($m['icons'] ?? [], 'sizes') === ['192x192', '512x512']
    && array_unique(array_column($m['icons'] ?? [], 'type')) === ['image/png']);
$urls = array_merge([$m['start_url'] ?? '', $m['scope'] ?? ''], array_column($m['icons'] ?? [], 'src'), [$m['id'] ?? '/']);
$check('manifest-urls-relative', array_filter($urls, fn($u) => preg_match('#^(https?:)?//#', $u) || ($u !== '' && $u[0] === '/' && $u !== $m['id'])) === []);

$html = file_get_contents("$root/arty/index.html");
$check('page-links-manifest', str_contains($html, '<link rel="manifest" href="manifest.webmanifest">')
    && str_contains($html, '<meta name="theme-color" content="#112233">')
    && str_contains($html, '<link rel="apple-touch-icon" sizes="192x192" href="icon-192.png">')
    && str_contains($html, '<meta name="apple-mobile-web-app-capable" content="yes">')
    && str_contains($html, '<meta name="apple-mobile-web-app-title" content="Arty">'));
$check('page-registers-sw', str_contains($html, "navigator.serviceWorker.register('sw.js', { scope: './' })")
    && str_contains($html, "'serviceWorker' in navigator"));

// The start game: the app starts the site page, and the scope contains it.
$m2 = json_decode((string) @file_get_contents("$root/mounted/manifest.webmanifest"), true);
$check('start-manifest-start-url', ($m2['start_url'] ?? null) === '../../?game=mounted');
$check('start-manifest-scope-contains-start', ($m2['scope'] ?? null) === '../../'
    && str_starts_with($m2['start_url'] ?? '', $m2['scope'] ?? "\0"));
$check('start-manifest-own-id', ($m2['id'] ?? null) === '/~me/games/mounted/' && ($m2['id'] ?? '') !== ($m['id'] ?? ''));
$check('start-manifest-no-sw', !is_file("$root/mounted/sw.js")
    && !str_contains((string) file_get_contents("$root/mounted/index.html"), 'serviceWorker'));
$check('start-page-links-manifest', str_contains((string) file_get_contents("$root/mounted/index.html"), '<link rel="manifest" href="manifest.webmanifest">'));

// A stale or missing manifest is caught by check mode, and fixed by write.
$orig = file_get_contents("$root/arty/manifest.webmanifest");
file_put_contents("$root/arty/manifest.webmanifest", str_replace('Arty & Co', 'Other', $orig));
[$stale] = share_tags_sync($root, $site, false);
$check('check-sees-stale-manifest', $stale === ['arty'], json_encode($stale));
share_tags_sync($root, $site, true);
$check('write-restores-manifest', file_get_contents("$root/arty/manifest.webmanifest") === $orig);
unlink("$root/mounted/manifest.webmanifest");
[$stale] = share_tags_sync($root, $site, false);
$check('check-sees-missing-manifest', $stale === ['mounted'], json_encode($stale));
share_tags_sync($root, $site, true);

// The service worker: precache list, versioned cache, network-first rules.
$sw = (string) @file_get_contents("$root/arty/sw.js");
preg_match('/const CACHE = PREFIX \+ \'([0-9a-f]{12})\'/', $sw, $hm);
preg_match('/const PRECACHE = (\[.*\]);/', $sw, $pm);
$list = json_decode($pm[1] ?? 'null', true);
$check('sw-precache-list', $list === ['./', 'game.js', 'icon-192.png', 'icon-512.png', 'index.html', 'manifest.webmanifest'], json_encode($list));
$check('sw-skips-tests-php-and-share-image', !str_contains($pm[1] ?? '', 'smoke-test') && !str_contains($pm[1] ?? '', '.php') && !str_contains($pm[1] ?? '', 'og.png'));
$check('sw-prefix-per-game', str_contains($sw, "const PREFIX = 'game-arty-';"));
$check('sw-network-first', str_contains($sw, "fetch(req, { cache: 'no-cache' })") && str_contains($sw, 'caches.match(req'));
$check('sw-never-php-or-non-get', str_contains($sw, "req.method !== 'GET'") && str_contains($sw, ".endsWith('.php')"));
$check('sw-drops-old-caches', str_contains($sw, 'k.startsWith(PREFIX) && k !== CACHE') && str_contains($sw, 'caches.delete'));
$check('sw-not-for-start-game', !is_file("$root/mounted/sw.js"));

// Any precached file changing re-versions the cache and makes sw.js stale.
file_put_contents("$root/arty/game.js", "console.log(2);\n");
[$stale] = share_tags_sync($root, $site, false);
$check('check-sees-changed-asset', $stale === ['arty'], json_encode($stale));
share_tags_sync($root, $site, true);
preg_match('/const CACHE = PREFIX \+ \'([0-9a-f]{12})\'/', (string) file_get_contents("$root/arty/sw.js"), $hm2);
$check('sw-cache-name-changes-with-assets', ($hm2[1] ?? '') !== '' && ($hm2[1] ?? '') !== ($hm[1] ?? ''));
// Unshipped files do not version the cache.
file_put_contents("$root/arty/smoke-test.js", "// edited\n");
file_put_contents("$root/arty/scores.php", "<?php // edited\n");
[$stale] = share_tags_sync($root, $site, false);
$check('check-ignores-unshipped-files', $stale === [], json_encode($stale));
// A hand-edited sw.js is stale.
file_put_contents("$root/arty/sw.js", "// hand edit\n");
[$stale] = share_tags_sync($root, $site, false);
$check('check-sees-edited-sw', $stale === ['arty'], json_encode($stale));
share_tags_sync($root, $site, true);

// Missing or wrong-size icons fail check mode (and say why).
file_put_contents("$root/arty/icon-512.png", $png(192));
[$stale, $notes] = share_tags_sync($root, $site, false);
$check('check-sees-wrong-size-icon', $stale === ['arty'] && in_array('arty: icon-512.png must be a 512x512 PNG', $notes, true), json_encode([$stale, $notes]));
unlink("$root/arty/icon-192.png");
file_put_contents("$root/arty/icon-512.png", $png(512));
[$stale, $notes] = share_tags_sync($root, $site, false);
$check('check-sees-missing-icon', $stale === ['arty'] && in_array('arty: icon-192.png must be a 192x192 PNG', $notes, true), json_encode([$stale, $notes]));

// The site's own games are in sync with their metadata.
[$stale, $notes] = share_tags_sync(__DIR__ . '/../games', SHARE_TAGS_SITE, false);
$check('repo-games-in-sync', $stale === [], 'run: php tools/game-share-tags.php  (stale: ' . implode(', ', $stale) . ')');

exec('rm -rf ' . escapeshellarg($tmp));
echo $fail === 0 ? "SHARE-TAGS-OK\n" : "SHARE-TAGS-FAIL $fail\n";
exit($fail === 0 ? 0 : 1);
