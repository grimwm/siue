<?php
// Tests for tools/install-files.php: the manifest, the install block in the
// game's page, and sw.js. Run: php install-files-test.php (in this folder).
// Exit 0 when every check passes, 1 otherwise.
declare(strict_types=1);
require_once __DIR__ . '/tools/install-files.php';

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

$tmp = sys_get_temp_dir() . '/install-files-test-' . getmypid();
$dir = "$tmp/arty";
@mkdir($dir, 0777, true);
file_put_contents("$dir/metadata.yaml", "title: Arty & Co\ndescription: Lob shells.\nshort_name: Arty\ntheme_color: \"#112233\"\nbackground_color: \"#445566\"\nplay: index.html\nimage: og.png\n");
$page = "<!doctype html>\n<html>\n<head>\n<meta charset=\"utf-8\">\n    <title>Arty</title>\n</head>\n<body>hi</body>\n</html>\n";
file_put_contents("$dir/index.html", $page);
file_put_contents("$dir/og.png", 'png');
foreach ([192, 512] as $n) {
    file_put_contents("$dir/icon-$n.png", $png($n));
}
file_put_contents("$dir/game.js", "console.log(1);\n");
file_put_contents("$dir/smoke-test.js", "// not shipped\n");
file_put_contents("$dir/scores.php", "<?php\n");
file_put_contents("$dir/game.yaml", "arsenal: {}\n");
file_put_contents("$dir/README.md", "# notes\n");
file_put_contents("$dir/theme.mp3", "audio");
// The dev-only effects editor and Blender script never ship; rendered sprites do.
file_put_contents("$dir/fx-editor.html", "<!doctype html>\n");
file_put_contents("$dir/fx-editor.js", "// dev only\n");
@mkdir("$dir/fx/sprites", 0777, true);
@mkdir("$dir/fx/blender", 0777, true);
file_put_contents("$dir/fx/sprites/boom.png", $png(192));
file_put_contents("$dir/fx/blender/render_fx.py", "# dev only\n");

// Check mode on a fresh folder lists what is missing and writes nothing.
[$stale] = install_sync($dir, false);
sort($stale);
$check('check-finds-stale', $stale === ['index.html', 'manifest.webmanifest', 'sw.js'], json_encode($stale));
$check('check-writes-nothing', file_get_contents("$dir/index.html") === $page && !is_file("$dir/sw.js"));

install_sync($dir, true);
[$stale] = install_sync($dir, false);
$check('clean-after-write', $stale === [], json_encode($stale));

// The page keeps its body and indentation, and knows nothing about a site.
$html = (string) file_get_contents("$dir/index.html");
$check('page-block-once', substr_count($html, INSTALL_BEGIN) === 1 && substr_count($html, INSTALL_END) === 1);
$check('page-indented', str_contains($html, "    " . INSTALL_BEGIN));
$check('page-body-kept', str_contains($html, '<body>hi</body>') && str_contains($html, '<title>Arty</title>'));
$check('page-knows-no-site', !str_contains($html, 'og:') && !str_contains($html, '../') && !str_contains($html, 'http'));
$check('page-links-manifest', str_contains($html, '<link rel="manifest" href="manifest.webmanifest">')
    && str_contains($html, '<meta name="theme-color" content="#112233">')
    && str_contains($html, '<link rel="apple-touch-icon" sizes="192x192" href="icon-192.png">')
    && str_contains($html, '<meta name="apple-mobile-web-app-capable" content="yes">')
    && str_contains($html, '<meta name="apple-mobile-web-app-title" content="Arty">'));
$check('page-registers-sw', str_contains($html, "navigator.serviceWorker.register('sw.js', { scope: './' })")
    && str_contains($html, "'serviceWorker' in navigator"));
$check('page-names-this-tool', str_contains($html, 'tools/install-files.php'));

$m = json_decode((string) @file_get_contents("$dir/manifest.webmanifest"), true);
$check('manifest-parses', is_array($m));
$check('manifest-names', ($m['name'] ?? null) === 'Arty & Co' && ($m['short_name'] ?? null) === 'Arty');
$check('manifest-colors', ($m['theme_color'] ?? null) === '#112233' && ($m['background_color'] ?? null) === '#445566');
$check('manifest-display', ($m['display'] ?? null) === 'standalone');
$check('manifest-start-in-scope', ($m['start_url'] ?? null) === './' && ($m['scope'] ?? null) === './');
// No id: the app is known by its start_url, the game's own folder.
$check('manifest-no-id', !array_key_exists('id', $m));
$check('manifest-icons', array_column($m['icons'] ?? [], 'sizes') === ['192x192', '512x512']
    && array_unique(array_column($m['icons'] ?? [], 'type')) === ['image/png']);
$urls = array_merge([$m['start_url'] ?? '', $m['scope'] ?? ''], array_column($m['icons'] ?? [], 'src'));
$check('manifest-urls-relative', array_filter($urls, fn($u) => preg_match('#^(https?:)?//#', $u) || ($u !== '' && $u[0] === '/')) === []);

// A stale or missing manifest is caught by check mode, and fixed by write.
$orig = file_get_contents("$dir/manifest.webmanifest");
file_put_contents("$dir/manifest.webmanifest", str_replace('Arty & Co', 'Other', $orig));
[$stale] = install_sync($dir, false);
$check('check-sees-stale-manifest', $stale === ['manifest.webmanifest'], json_encode($stale));
install_sync($dir, true);
$check('write-restores-manifest', file_get_contents("$dir/manifest.webmanifest") === $orig);
unlink("$dir/manifest.webmanifest");
[$stale] = install_sync($dir, false);
$check('check-sees-missing-manifest', $stale === ['manifest.webmanifest'], json_encode($stale));
install_sync($dir, true);

// The service worker: precache list, versioned cache, network-first rules.
$sw = (string) @file_get_contents("$dir/sw.js");
preg_match('/const CACHE = PREFIX \+ \'([0-9a-f]{12})\'/', $sw, $hm);
preg_match('/const PRECACHE = (\[.*\]);/', $sw, $pm);
$list = json_decode($pm[1] ?? 'null', true);
$check('sw-precache-list', $list === ['./', 'fx/sprites/boom.png', 'game.js', 'icon-192.png', 'icon-512.png', 'index.html', 'manifest.webmanifest'], json_encode($list));
$check('sw-skips-dev-tools', !str_contains($pm[1] ?? '', 'fx-editor') && !str_contains($pm[1] ?? '', 'blender'));
$check('sw-skips-tests-php-and-share-image', !str_contains($pm[1] ?? '', 'smoke-test') && !str_contains($pm[1] ?? '', '.php') && !str_contains($pm[1] ?? '', 'og.png'));
$check('sw-skips-yaml-notes-and-audio', !str_contains($pm[1] ?? '', 'game.yaml') && !str_contains($pm[1] ?? '', 'README') && !str_contains($pm[1] ?? '', '.mp3'));
$check('sw-names-this-tool', str_contains($sw, 'Generated by tools/install-files.php'));
$check('sw-range-requests-bypass', str_contains($sw, "req.headers.has('range')"));
$check('sw-prefix-per-game', str_contains($sw, "const PREFIX = 'game-arty-';"));
$check('sw-network-first', str_contains($sw, "fetch(req, { cache: 'no-cache' })") && str_contains($sw, 'caches.match(req'));
$check('sw-never-php-or-non-get', str_contains($sw, "req.method !== 'GET'") && str_contains($sw, ".endsWith('.php')"));
$check('sw-drops-old-caches', str_contains($sw, 'k.startsWith(PREFIX) && k !== CACHE') && str_contains($sw, 'caches.delete'));

// Any precached file changing re-versions the cache and makes sw.js stale.
file_put_contents("$dir/game.js", "console.log(2);\n");
[$stale] = install_sync($dir, false);
$check('check-sees-changed-asset', $stale === ['sw.js'], json_encode($stale));
install_sync($dir, true);
preg_match('/const CACHE = PREFIX \+ \'([0-9a-f]{12})\'/', (string) file_get_contents("$dir/sw.js"), $hm2);
$check('sw-cache-name-changes-with-assets', ($hm2[1] ?? '') !== '' && ($hm2[1] ?? '') !== ($hm[1] ?? ''));
// Unshipped files do not version the cache.
file_put_contents("$dir/smoke-test.js", "// edited\n");
file_put_contents("$dir/scores.php", "<?php // edited\n");
[$stale] = install_sync($dir, false);
$check('check-ignores-unshipped-files', $stale === [], json_encode($stale));
// A hand-edited sw.js is stale.
file_put_contents("$dir/sw.js", "// hand edit\n");
[$stale] = install_sync($dir, false);
$check('check-sees-edited-sw', $stale === ['sw.js'], json_encode($stale));
install_sync($dir, true);

// Editing metadata makes the install files stale again.
file_put_contents("$dir/metadata.yaml", "title: Arty 2\ndescription: New.\nplay: index.html\n");
[$stale] = install_sync($dir, false);
$check('check-sees-metadata-change', in_array('manifest.webmanifest', $stale, true) && in_array('index.html', $stale, true), json_encode($stale));

// Wrong-size or missing icons fail (and say why).
file_put_contents("$dir/icon-512.png", $png(192));
[, $notes] = install_sync($dir, false);
$check('check-sees-wrong-size-icon', $notes === ['icon-512.png must be a 512x512 PNG'], json_encode($notes));
unlink("$dir/icon-192.png");
file_put_contents("$dir/icon-512.png", $png(512));
[, $notes] = install_sync($dir, false);
$check('check-sees-missing-icon', $notes === ['icon-192.png must be a 192x192 PNG'], json_encode($notes));

// The CLI runs from the game folder alone: copy this folder's tool beside a
// scratch game and run it there.
$cli = "$tmp/cli/arty";
@mkdir("$cli/tools", 0777, true);
copy(__DIR__ . '/tools/install-files.php', "$cli/tools/install-files.php");
foreach (['index.html', 'metadata.yaml', 'icon-192.png', 'icon-512.png'] as $f) {
    copy(__DIR__ . "/$f", "$cli/$f");
}
$run = function (string ...$args) use ($cli): array {
    exec(escapeshellarg(PHP_BINARY) . ' ' . escapeshellarg("$cli/tools/install-files.php") . ' '
        . implode(' ', array_map('escapeshellarg', $args)) . ' 2>&1', $out, $rc);
    return [$rc, implode("\n", $out)];
};
[$rc, $msg] = $run('--check');
$check('cli-check-fails-when-stale', $rc === 1 && str_contains($msg, 'sw.js is stale'), $msg);
[$rc] = $run();
[$rc2] = $run('--check');
$check('cli-write-then-check-clean', $rc === 0 && $rc2 === 0 && is_file("$cli/sw.js") && is_file("$cli/manifest.webmanifest"));

// This game's own files are in sync with its metadata.
[$stale, $notes] = install_sync(__DIR__, false);
$check('repo-game-in-sync', $stale === [] && $notes === [], 'run: php tools/install-files.php (stale: ' . implode(', ', $stale) . ')');

exec('rm -rf ' . escapeshellarg($tmp));
echo $fail === 0 ? "INSTALL-FILES-OK\n" : "INSTALL-FILES-FAIL $fail\n";
exit($fail === 0 ? 0 : 1);
