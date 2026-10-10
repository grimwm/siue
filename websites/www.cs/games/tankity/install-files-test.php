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
$page = "<!doctype html>\n<html>\n<head>\n<meta charset=\"utf-8\">\n    <title>Arty</title>\n<link rel=\"stylesheet\" href=\"game.css?v=old\">\n</head>\n<body>hi\n<script type=\"importmap\">\n{\n  \"imports\": {\n    \"preact\": \"./vendor/preact/preact.module.js?v=old\"\n  }\n}\n</script>\n<script src=\"fx.js?v=old\" defer></script>\n<script type=\"module\" src=\"game.js?v=old\"></script>\n</body>\n</html>\n";
file_put_contents("$dir/index.html", $page);
file_put_contents("$dir/og.png", 'png');
foreach ([192, 512] as $n) {
    file_put_contents("$dir/icon-$n.png", $png($n));
}
// game.js imports sim.js with a stale version and the panel with none; the panel
// imports a leaf and the bare `preact`, the leaf imports sim.js (the way tsc
// writes them: double quotes, no ?v=). Three deep, so a change to sim.js must
// re-version every module above it.
file_put_contents("$dir/game.js", "import { a } from './js/sim.js?v=old';\nimport { panel } from './js/ui/panel.js';\nconsole.log(a, panel);\n");
file_put_contents("$dir/game.css", "body { margin: 0; }\n");
file_put_contents("$dir/fx.js", "// effects\n");
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
// Compiled modules ship; their TypeScript sources and the build tooling never do.
@mkdir("$dir/js", 0777, true);
@mkdir("$dir/src", 0777, true);
@mkdir("$dir/node_modules/ts", 0777, true);
@mkdir("$dir/js/ui", 0777, true);
@mkdir("$dir/vendor/preact", 0777, true);
file_put_contents("$dir/js/sim.js", "export const a = 1;\n");
file_put_contents("$dir/js/ui/leaf.js", "/* import { nothing } from './sim.js'; (a comment that names an import) */\nimport { a } from \"../sim.js\";\nexport const leaf = a + 1;\n");
file_put_contents("$dir/js/ui/panel.js", "import { h } from \"preact\";\nimport {\n  leaf,\n} from \"./leaf.js\";\nexport const panel = h + leaf;\n");
file_put_contents("$dir/vendor/preact/preact.module.js", "export const h = 1;\n");
file_put_contents("$dir/vendor/preact/LICENSE", "MIT\n");
file_put_contents("$dir/src/sim.ts", "export const a: number = 1;\n");
file_put_contents("$dir/node_modules/ts/index.js", "// not shipped\n");
file_put_contents("$dir/package.json", "{}\n");
file_put_contents("$dir/package-lock.json", "{}\n");
file_put_contents("$dir/tsconfig.json", "{}\n");

// Check mode on a fresh folder lists what is missing and writes nothing.
[$stale] = install_sync($dir, false);
sort($stale);
$check('check-finds-stale', $stale === ['game.js', 'index.html', 'js/ui/leaf.js', 'js/ui/panel.js', 'manifest.webmanifest', 'sw.js'], json_encode($stale));
$check('check-writes-nothing', file_get_contents("$dir/index.html") === $page && !is_file("$dir/sw.js")
    && str_contains((string) file_get_contents("$dir/game.js"), 'sim.js?v=old'));

install_sync($dir, true);
[$stale] = install_sync($dir, false);
$check('clean-after-write', $stale === [], json_encode($stale));

// The page keeps its body and indentation, and knows nothing about a site.
$html = (string) file_get_contents("$dir/index.html");
$check('page-block-once', substr_count($html, INSTALL_BEGIN) === 1 && substr_count($html, INSTALL_END) === 1);
$check('page-indented', str_contains($html, "    " . INSTALL_BEGIN));
$check('page-body-kept', str_contains($html, "<body>hi\n") && str_contains($html, '<title>Arty</title>'));
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
$check('sw-precache-list', $list === ['./', 'fx.js', 'fx/sprites/boom.png', 'game.css', 'game.js', 'icon-192.png', 'icon-512.png', 'index.html', 'js/sim.js', 'js/ui/leaf.js', 'js/ui/panel.js', 'manifest.webmanifest', 'vendor/preact/preact.module.js'], json_encode($list));
$check('sw-precaches-nested-modules-and-vendored-code', in_array('js/ui/panel.js', $list, true) && in_array('vendor/preact/preact.module.js', $list, true)
    && !in_array('vendor/preact/LICENSE', $list, true));
$check('sw-skips-ts-sources-and-tooling', !str_contains($pm[1] ?? '', 'src/') && !str_contains($pm[1] ?? '', '.ts')
    && !str_contains($pm[1] ?? '', 'node_modules') && !str_contains($pm[1] ?? '', 'package') && !str_contains($pm[1] ?? '', 'tsconfig'));
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
file_put_contents("$dir/game.css", "body { margin: 1px; }\n");
[$stale] = install_sync($dir, false);
$check('check-sees-changed-asset', $stale === ['index.html', 'sw.js'], json_encode($stale));
install_sync($dir, true);
preg_match('/const CACHE = PREFIX \+ \'([0-9a-f]{12})\'/', (string) file_get_contents("$dir/sw.js"), $hm2);
$check('sw-cache-name-changes-with-assets', ($hm2[1] ?? '') !== '' && ($hm2[1] ?? '') !== ($hm[1] ?? ''));
// A compiled module re-versions the cache too, so a new sim never pairs with an old one offline.
file_put_contents("$dir/js/sim.js", "export const a = 2;\n");
[$stale] = install_sync($dir, false);
$check('check-sees-changed-module-and-everything-above-it', $stale === ['index.html', 'game.js', 'js/ui/leaf.js', 'js/ui/panel.js', 'sw.js'], json_encode($stale));
install_sync($dir, true);
// Unshipped files do not version the cache.
file_put_contents("$dir/smoke-test.js", "// edited\n");
file_put_contents("$dir/scores.php", "<?php // edited\n");
file_put_contents("$dir/src/sim.ts", "export const a: number = 3;\n");
file_put_contents("$dir/package.json", "{\"edited\": true}\n");
[$stale] = install_sync($dir, false);
$check('check-ignores-unshipped-files', $stale === [], json_encode($stale));
// A hand-edited sw.js is stale.
file_put_contents("$dir/sw.js", "// hand edit\n");
[$stale] = install_sync($dir, false);
$check('check-sees-edited-sw', $stale === ['sw.js'], json_encode($stale));
install_sync($dir, true);

// Versions: each ?v= is the content hash of its file.
install_sync($dir, true);
$vOf = fn(string $content): string => substr(hash('sha256', $content), 0, 10);
$read = fn(string $f): string => (string) file_get_contents("$dir/$f");
$importV = function () use ($read): string {
    preg_match("#from './js/sim\.js\?v=([0-9a-f]+)'#", $read('game.js'), $m);
    return $m[1] ?? '';
};
$pageV = function (string $f) use ($read): string {
    preg_match('#"' . preg_quote($f, '#') . '\?v=([0-9a-f]+)"#', $read('index.html'), $m);
    return $m[1] ?? '';
};
$check('import-version-is-module-hash', $importV() === $vOf($read('js/sim.js')), $importV());
$check('page-versions-are-file-hashes', $pageV('game.js') === $vOf($read('game.js'))
    && $pageV('game.css') === $vOf($read('game.css')) && $pageV('fx.js') === $vOf($read('fx.js')));

// A stale import version is found alone: the page already holds game.js's corrected hash.
$gameOk = $read('game.js');
$htmlOk = $read('index.html');
file_put_contents("$dir/game.js", str_replace('sim.js?v=' . $importV(), 'sim.js?v=stale', $gameOk));
[$stale] = install_sync($dir, false);
sort($stale);
$check('check-sees-stale-import-version', $stale === ['game.js'], json_encode($stale));
install_sync($dir, true);
$check('write-restores-import-version', $read('game.js') === $gameOk && $read('index.html') === $htmlOk);

// A stale page version is found alone: sw.js hashes the corrected page.
file_put_contents("$dir/index.html", str_replace('game.css?v=' . $pageV('game.css'), 'game.css?v=stale', $htmlOk));
[$stale] = install_sync($dir, false);
sort($stale);
$check('check-sees-stale-page-version', $stale === ['index.html'], json_encode($stale));
install_sync($dir, true);
$check('write-restores-page-version', $read('index.html') === $htmlOk);

// Changing a module re-versions its import, game.js in the page and sw.js in
// one run, and a second run changes nothing.
file_put_contents("$dir/js/sim.js", "export const a = 99;\n");
install_sync($dir, true);
$check('one-run-converges', $importV() === $vOf($read('js/sim.js')) && $pageV('game.js') === $vOf($read('game.js'))
    && $read('game.js') !== $gameOk);
[$stale] = install_sync($dir, false);
$check('check-clean-after-one-run', $stale === [], json_encode($stale));
$before = [$read('index.html'), $read('game.js'), $read('sw.js'), $read('manifest.webmanifest')];
install_sync($dir, true);
$check('second-run-changes-nothing', $before === [$read('index.html'), $read('game.js'), $read('sw.js'), $read('manifest.webmanifest')]);
$check('rewrite-touches-only-versions', preg_replace('/\?v=[0-9a-f]+/', '?v=X', $read('game.js'))
    === preg_replace('/\?v=[0-9a-f]+/', '?v=X', $gameOk));

// A missing reference fails loudly: a note, and nothing written.
$htmlNow = $read('index.html');
$gameNow = $read('game.js');
$cases = [
    'page lacks fx.js' => ['index.html', str_replace('fx.js?v=', 'fx-other.js?v=', $htmlNow), 'index.html must reference fx.js?v=... exactly once (found 0)'],
    'page lacks game.css version' => ['index.html', str_replace('href="game.css?v=', 'href="game.css#', $htmlNow), 'index.html must reference game.css?v=... exactly once (found 0)'],
    'page lists game.js twice' => ['index.html', $htmlNow . "<script src=\"game.js?v=x\"></script>\n", 'index.html must reference game.js?v=... exactly once (found 2)'],
];
foreach ($cases as $name => [$file, $broken, $expect]) {
    $good = $read($file);
    file_put_contents("$dir/$file", $broken);
    $swBefore = $read('sw.js');
    [$stale, $notes] = install_sync($dir, true);
    $check("missing-reference-fails: $name", $stale === [] && in_array($expect, $notes, true)
        && $read($file) === $broken && $read('sw.js') === $swBefore, json_encode([$stale, $notes]));
    file_put_contents("$dir/$file", $good);
}
// An import with no ?v= at all gets one (tsc writes them bare); a hand-edited fragment is not a version.
$gameNow = $read('game.js');
file_put_contents("$dir/game.js", (string) preg_replace('#(js/ui/panel\.js)\?v=[0-9a-f]+#', '$1', $gameNow));
[$stale] = install_sync($dir, false);
$check('check-sees-import-without-version', $stale === ['game.js'], json_encode($stale));
install_sync($dir, true);
$check('write-adds-the-missing-version', $read('game.js') === $gameNow);

// The module graph: each importer carries the hash of what it imports, however deep.
$vIn = fn(string $f, string $name): string => preg_match('#' . preg_quote($name, '#') . '\?v=([0-9a-f]+)#', $read($f), $m) === 1 ? $m[1] : '';
$check('chain-leaf-imports-sim-by-hash', $vIn('js/ui/leaf.js', '../sim.js') === $vOf($read('js/sim.js')));
$check('chain-panel-imports-leaf-by-hash', $vIn('js/ui/panel.js', './leaf.js') === $vOf($read('js/ui/leaf.js')));
$check('chain-game-imports-panel-by-hash', $vIn('game.js', 'js/ui/panel.js') === $vOf($read('js/ui/panel.js')));
$check('chain-keeps-layout-and-tscs-quotes', str_contains($read('js/ui/panel.js'), "import {\n  leaf,\n} from \"./leaf.js?v=") && str_contains($read('js/ui/panel.js'), 'from "preact";'));
$check('chain-leaves-bare-imports-alone', !str_contains($read('js/ui/panel.js'), 'preact?v='));
$check('comments-naming-an-import-are-left-alone', str_contains($read('js/ui/leaf.js'), "/* import { nothing } from './sim.js'; (a comment that names an import) */"));
$mapV = fn(): string => preg_match('#"preact": "\./vendor/preact/preact\.module\.js\?v=([0-9a-f]+)"#', $read('index.html'), $m) === 1 ? $m[1] : '';
$check('import-map-version-is-the-vendored-files-hash', $mapV() === $vOf($read('vendor/preact/preact.module.js')), $mapV());
$check('import-map-keeps-its-layout', str_contains($read('index.html'), "{\n  \"imports\": {\n    \"preact\": \"./vendor/"));

// A change deep in the graph re-versions every module above it, game.js, the page and sw.js in one run.
$before = [$read('js/ui/leaf.js'), $read('js/ui/panel.js'), $read('game.js'), $read('index.html')];
file_put_contents("$dir/js/sim.js", "export const a = 123;\n");
[$stale] = install_sync($dir, false);
$check('deep-change-is-seen-everywhere-above', $stale === ['index.html', 'game.js', 'js/ui/leaf.js', 'js/ui/panel.js', 'sw.js'], json_encode($stale));
install_sync($dir, true);
$check('deep-change-converges-in-one-run', $vIn('js/ui/leaf.js', '../sim.js') === $vOf($read('js/sim.js'))
    && $vIn('js/ui/panel.js', './leaf.js') === $vOf($read('js/ui/leaf.js'))
    && $vIn('game.js', 'js/ui/panel.js') === $vOf($read('js/ui/panel.js'))
    && $vIn('game.js', 'js/sim.js') === $vOf($read('js/sim.js'))
    && $pageV('game.js') === $vOf($read('game.js'))
    && $before !== [$read('js/ui/leaf.js'), $read('js/ui/panel.js'), $read('game.js'), $read('index.html')]);
[$stale] = install_sync($dir, false);
$check('deep-change-then-clean', $stale === [], json_encode($stale));

// A vendored file changing re-versions the import map (and with it the page) and the cache.
file_put_contents("$dir/vendor/preact/preact.module.js", "export const h = 2;\n");
[$stale] = install_sync($dir, false);
$check('vendored-change-is-seen', $stale === ['index.html', 'sw.js'], json_encode($stale));
install_sync($dir, true);
$check('vendored-change-re-versions-the-map', $mapV() === $vOf($read('vendor/preact/preact.module.js')));
[$stale] = install_sync($dir, false);
$check('vendored-change-then-clean', $stale === [], json_encode($stale));
// The vendored LICENSE rides along without versioning the cache.
file_put_contents("$dir/vendor/preact/LICENSE", "MIT, edited\n");
[$stale] = install_sync($dir, false);
$check('vendored-license-is-not-cached', $stale === [], json_encode($stale));

// Loud failures: a note names the problem, and nothing is written.
$htmlNow = $read('index.html');
$mapBlock = (string) preg_replace('#^.*?(<script type="importmap">.*?</script>\n).*$#s', '$1', $htmlNow);
$withoutMap = str_replace($mapBlock, '', $htmlNow);
$graphCases = [
    'bare import the map lacks' => [['js/ui/panel.js' => $read('js/ui/panel.js') . "import { z } from \"other\";\n"],
        'js/ui/panel.js imports other, which the import map in index.html does not list'],
    'page has no import map at all' => [['index.html' => $withoutMap],
        'js/ui/panel.js imports preact, which the import map in index.html does not list'],
    'import of a module that is not there' => [['game.js' => $read('game.js') . "import './js/ui/nope.js';\n"],
        'game.js imports js/ui/nope.js, which does not exist'],
    'import that climbs out of js/' => [['js/ui/leaf.js' => $read('js/ui/leaf.js') . "import \"../../game.js\";\n"],
        'js/ui/leaf.js imports ../../game.js, which is not a .js file under js/'],
    'import with a fragment instead of a version' => [['game.js' => str_replace('js/sim.js?v=', 'js/sim.js#', $read('game.js'))],
        'game.js imports ./js/sim.js#' . $vOf($read('js/sim.js')) . ', which is not a .js file under js/'],
    'import that is neither relative nor bare' => [['game.js' => $read('game.js') . "import 'https://cdn.example/x.js';\n"],
        'game.js imports https://cdn.example/x.js, which is neither a relative path nor a name in the import map'],
    'import cycle' => [['js/ui/leaf.js' => $read('js/ui/leaf.js') . "import \"./panel.js\";\n"],
        'import cycle: js/ui/panel.js -> js/ui/leaf.js -> js/ui/panel.js'],
    'dynamic import of a literal' => [['game.js' => $read('game.js') . "const later = import('./js/sim.js');\n"],
        'game.js uses a dynamic import() of a literal; only static imports are versioned'],
    'js file nothing imports' => [['js/extra.js' => "export const b = 1;\n"],
        'js/extra.js is not imported from game.js, directly or through another js/ module'],
    'js file only another unreached file imports' => [['js/extra.js' => "import \"./extra2.js\";\n", 'js/extra2.js' => "export const c = 1;\n"],
        'js/extra2.js is not imported from game.js, directly or through another js/ module'],
    'import map after the game script' => [['index.html' => str_replace('</body>', $mapBlock . "</body>", $withoutMap)],
        'index.html must put the import map before the game.js script'],
    'import map names a file that is not there' => [['index.html' => str_replace('preact.module.js?v=', 'preact.gone.js?v=', $htmlNow)],
        'index.html: import map entry "preact" names vendor/preact/preact.gone.js, which does not exist'],
    'import map entry without a version' => [['index.html' => (string) preg_replace('#(preact\.module\.js)\?v=[0-9a-f]+#', '$1', $htmlNow)],
        'index.html: import map entry "preact" must be a ./ path to a .js file ending in ?v=...'],
    'import map that is not JSON' => [['index.html' => str_replace('"imports": {', '"imports": [', $htmlNow)],
        'index.html: the import map must be JSON with a non-empty "imports" object'],
    'two import maps' => [['index.html' => str_replace('</body>', $mapBlock . "</body>", $htmlNow)],
        'index.html must hold one import map (found 2)'],
];
foreach ($graphCases as $name => [$files, $expect]) {
    $good = [];
    foreach ($files as $f => $broken) {
        $good[$f] = is_file("$dir/$f") ? $read($f) : null;
        file_put_contents("$dir/$f", $broken);
    }
    $swBefore = $read('sw.js');
    [$stale, $notes] = install_sync($dir, true);
    $untouched = true;
    foreach ($files as $f => $broken) {
        $untouched = $untouched && $read($f) === $broken;
    }
    $check("graph-fails-loudly: $name", $stale === [] && in_array($expect, $notes, true) && $untouched && $read('sw.js') === $swBefore,
        json_encode([$stale, $notes]));
    foreach ($good as $f => $content) {
        if ($content === null) {
            unlink("$dir/$f");
        } else {
            file_put_contents("$dir/$f", $content);
        }
    }
}
[$stale] = install_sync($dir, false);
$check('graph-cases-leave-the-folder-clean', $stale === [], json_encode($stale));

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
foreach (['index.html', 'game.js', 'game.css', 'fx.js', 'metadata.yaml', 'icon-192.png', 'icon-512.png'] as $f) {
    copy(__DIR__ . "/$f", "$cli/$f");
}
// js/ (with ui/) and vendor/ come along whole.
exec('cp -R ' . escapeshellarg(__DIR__ . '/js') . ' ' . escapeshellarg(__DIR__ . '/vendor') . ' ' . escapeshellarg($cli));
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
