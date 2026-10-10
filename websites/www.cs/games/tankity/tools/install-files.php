<?php
/**
 * Keeps this game installable (PWA) from its own metadata.yaml. Needs only
 * PHP and this folder, so the game can be copied anywhere and rebuilt:
 *
 *   php tools/install-files.php          write every stale file
 *   php tools/install-files.php --check  list stale files, exit 1 if any
 *
 * (Run from the game folder; from the site root it is
 * php games/<id>/tools/install-files.php.) It writes, with relative paths
 * only:
 *   - manifest.webmanifest, linked from the game's page together with
 *     theme-color and iOS home-screen tags (inside a marked block); it needs
 *     icon-192.png and icon-512.png, square PNGs;
 *   - sw.js, registered from the page: it precaches the game's static files
 *     so it opens offline, and otherwise goes to the network first. Its cache
 *     name carries a hash of those files, so any change to them makes sw.js
 *     stale until rewritten (rerun this after the last edit);
 *   - the `?v=` cache-busters, each a short hash of the file's content: the
 *     import map's entries (vendor/), every relative import between js/
 *     modules and game.js (dependencies first, so one run converges), then the
 *     page's game.js, game.css and fx.js tags (see install_versions). It edits
 *     the compiled js/ files for this, which tools/ts-build.mjs --check
 *     accepts: it compares them without the versions.
 * Test files, .php files, the share-only picture (`image:`) and the build
 * tooling (package.json, package-lock.json, tsconfig.json) are not cached; the
 * compiled modules in js/ are.
 * Copyright (C) 2026 William Grim
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
declare(strict_types=1);

const INSTALL_BEGIN = '<!-- app-tags:begin (tools/install-files.php writes this block) -->';
const INSTALL_END = '<!-- app-tags:end -->';
const INSTALL_DEFAULT_COLOR = '#0c0e12';

/* Registers the page's service worker; harmless where service workers do
   not exist (plain http, file://, a test's stub DOM). */
const INSTALL_SW_REGISTER = "<script>if ('serviceWorker' in navigator) window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js', { scope: './' }).catch(function () {}); });</script>";

function install_esc(string $s): string
{
    return htmlspecialchars($s, ENT_QUOTES | ENT_HTML5, 'UTF-8');
}

/**
 * Parses metadata.yaml's YAML subset: top-level `key: value` lines, `#`
 * comments, quoted scalars, and `key: >` folded blocks. Values are strings.
 *
 * @return array{0: array<string, string>, 1: ?string} [data, error]
 */
function install_parse_yaml(string $text): array
{
    $data = [];
    $lines = preg_split('/\r\n|\r|\n/', $text);
    $count = count($lines);
    for ($i = 0; $i < $count; $i++) {
        $line = $lines[$i];
        $trimmed = trim($line);
        if ($trimmed === '' || $trimmed[0] === '#') {
            continue;
        }
        if (!preg_match('/^([A-Za-z_][A-Za-z0-9_]*):(?:\s+(.*))?$/', rtrim($line), $m)) {
            return [[], 'line ' . ($i + 1) . ': expected `key: value` starting at column 1'];
        }
        $key = $m[1];
        $raw = trim($m[2] ?? '');
        if ($raw === '>' || $raw === '>-') {
            $parts = [];
            while ($i + 1 < $count && ($lines[$i + 1] === '' || preg_match('/^\s/', $lines[$i + 1]))) {
                $i++;
                if (trim($lines[$i]) !== '') {
                    $parts[] = trim($lines[$i]);
                }
            }
            $data[$key] = implode(' ', $parts);
            continue;
        }
        $quote = $raw[0] ?? '';
        if ($quote === '"' || $quote === "'") {
            $end = strpos($raw, $quote, 1);
            if ($end === false) {
                return [[], 'line ' . ($i + 1) . ": `$key` has an unclosed $quote"];
            }
            $data[$key] = substr($raw, 1, $end - 1);
            continue;
        }
        $cut = strpos($raw, ' #');
        $data[$key] = $cut === false ? $raw : rtrim(substr($raw, 0, $cut));
    }
    return [$data, null];
}

/**
 * The fields the install files use, from metadata.yaml.
 * @return array{0: ?array<string, string>, 1: ?string} [card, error]
 */
function install_card(string $dir): array
{
    $text = @file_get_contents("$dir/metadata.yaml");
    if (!is_string($text)) {
        return [null, 'metadata.yaml is not readable'];
    }
    [$meta, $err] = install_parse_yaml($text);
    if ($err !== null) {
        return [null, "metadata.yaml: $err"];
    }
    foreach (['title', 'description', 'play'] as $key) {
        if (trim($meta[$key] ?? '') === '') {
            return [null, "metadata.yaml: `$key` is required"];
        }
    }
    $card = [
        'title' => trim($meta['title']),
        'description' => trim($meta['description']),
        'play' => trim($meta['play']),
        'image' => trim($meta['image'] ?? ''),
    ];
    $short = trim($meta['short_name'] ?? '');
    $card['short_name'] = $short !== '' ? $short : $card['title'];
    foreach (['theme_color', 'background_color'] as $key) {
        $color = trim($meta[$key] ?? INSTALL_DEFAULT_COLOR);
        if (!preg_match('/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/', $color)) {
            return [null, "metadata.yaml: `$key` must be a #rgb or #rrggbb color"];
        }
        $card[$key] = strtolower($color);
    }
    return [$card, null];
}

/** The cache-buster for a file: a short hash of its content. */
function install_version(string $content): string
{
    return substr(hash('sha256', $content), 0, 10);
}

/** The files the page loads with a `?v=` of their own, besides game.js's modules. */
const INSTALL_PAGE_VERSIONED = ['game.js', 'game.css', 'fx.js'];

/**
 * Every .js file under $dir/$sub, recursively, as paths relative to $dir.
 * @return list<string>
 */
function install_js_tree(string $dir, string $sub): array
{
    $found = [];
    foreach (is_dir("$dir/$sub") ? (scandir("$dir/$sub") ?: []) : [] as $f) {
        if ($f === '.' || $f === '..') {
            continue;
        }
        if (is_dir("$dir/$sub/$f")) {
            array_push($found, ...install_js_tree($dir, "$sub/$f"));
        } elseif (preg_match('/^[\w.-]+\.js$/', $f)) {
            $found[] = "$sub/$f";
        }
    }
    sort($found);
    return $found;
}

/**
 * A module's import specifiers. Only real statements count (`import ... from
 * 'x'`, `export ... from 'x'`, `import 'x'`, each starting a line), so a
 * comment that mentions one is left alone. The pattern captures the text up to
 * the opening quote, the quote, and the specifier.
 */
const INSTALL_IMPORT_RE = '#(^[ \t]*(?:import|export)\b[^;\'"]*?\bfrom\s*|^[ \t]*import\s*)([\'"])([^\'"\n]+)\2#m';

/** `a/b/../c.js` resolved against a base directory; null if it climbs out. */
function install_resolve(string $baseDir, string $spec): ?string
{
    $parts = $baseDir === '' ? [] : explode('/', $baseDir);
    foreach (explode('/', $spec) as $seg) {
        if ($seg === '' || $seg === '.') {
            continue;
        }
        if ($seg === '..') {
            if (!$parts) {
                return null;
            }
            array_pop($parts);
        } else {
            $parts[] = $seg;
        }
    }
    return implode('/', $parts);
}

/**
 * The page's import map as [spec => url], or null when there is none, plus
 * problems. Each url is a ./ path to a file in the game folder carrying `?v=`.
 *
 * @return array{0: ?array<string, string>, 1: list<string>}
 */
function install_import_map(string $dir, string $page, string $pageName): array
{
    $n = preg_match_all('#<script type="importmap">(.*?)</script>#s', $page, $found);
    if ($n === 0) {
        return [null, []];
    }
    if ($n > 1) {
        return [null, ["$pageName must hold one import map (found $n)"]];
    }
    $decoded = json_decode($found[1][0], true);
    $imports = is_array($decoded) ? ($decoded['imports'] ?? null) : null;
    if (!is_array($imports) || $imports === []) {
        return [null, ["$pageName: the import map must be JSON with a non-empty \"imports\" object"]];
    }
    $problems = [];
    foreach ($imports as $spec => $url) {
        if (!is_string($url) || !preg_match('#^\./([\w./-]+\.js)\?v=[^"?\s]*$#', $url, $m)) {
            $problems[] = "$pageName: import map entry \"$spec\" must be a ./ path to a .js file ending in ?v=...";
        } elseif (!is_file("$dir/{$m[1]}")) {
            $problems[] = "$pageName: import map entry \"$spec\" names {$m[1]}, which does not exist";
        }
    }
    return [$problems ? null : $imports, $problems];
}

/**
 * Sets every `?v=` to the content hash of the file it names, so a browser
 * never pairs a cached file with a newer one it imports.
 *
 *   1. Import map: each entry's file (./vendor/...) gets its own hash.
 *   2. js/ modules and game.js, dependencies first. A relative import of
 *      another module of ours (written with its .js extension, `?v=` present
 *      or not) gets that module's hash, then the importer is hashed in turn, so
 *      one run converges however deep the chain. A bare import must name an
 *      entry of the import map. Imports go through no other door.
 *   3. The page's tags for game.js (which now carries those hashes), game.css
 *      and fx.js.
 *
 * Loud failure, writing nothing: an import of a module that does not exist or
 * lives outside js/, a bare import the map lacks, a cycle, a js/ module that
 * game.js does not reach, a dynamic import of a literal, a malformed import map
 * or one placed after the game's script, or a page tag found other than once.
 * Only the version value inside a recognised reference is rewritten.
 *
 * @return array{0: string, 1: string, 2: list<string>, 3: array<string, string>} [game.js, page, problems, js/ modules by path]
 */
function install_versions(string $dir, string $gameJs, string $page, string $pageName): array
{
    $problems = [];
    [$map, $mapProblems] = install_import_map($dir, $page, $pageName);
    $problems = array_merge($problems, $mapProblems);
    $mapSpecs = $map === null ? [] : array_keys($map);

    // The nodes: game.js and every js/ module, with their text as it is now.
    $text = ['game.js' => $gameJs];
    foreach (install_js_tree($dir, 'js') as $f) {
        $text[$f] = (string) file_get_contents("$dir/$f");
    }
    // Each node's relative imports, resolved to node paths.
    $deps = [];
    foreach ($text as $path => $body) {
        $deps[$path] = [];
        $base = dirname($path) === '.' ? '' : dirname($path);
        preg_match_all(INSTALL_IMPORT_RE, $body, $imps, PREG_SET_ORDER);
        foreach ($imps as $imp) {
            $spec = $imp[3];
            if ($spec[0] === '.') {
                $target = install_resolve($base, (string) preg_replace('/\?.*$/', '', $spec));
                if ($target === null || !str_starts_with($target, 'js/') || !str_ends_with($target, '.js')) {
                    $problems[] = "$path imports $spec, which is not a .js file under js/";
                } elseif (!isset($text[$target])) {
                    $problems[] = "$path imports $target, which does not exist";
                } else {
                    $deps[$path][$target] = true;
                }
            } elseif (!preg_match('#^[A-Za-z@][^:]*$#', $spec)) {
                $problems[] = "$path imports $spec, which is neither a relative path nor a name in the import map";
            } elseif (!in_array($spec, $mapSpecs, true)) {
                $problems[] = "$path imports $spec, which the import map in $pageName does not list";
            }
        }
        if (preg_match('/\bimport\s*\(\s*[\'"]/', $body)) {
            $problems[] = "$path uses a dynamic import() of a literal; only static imports are versioned";
        }
    }
    // The map must come before the module script that needs it.
    $mapAt = strpos($page, '<script type="importmap">');
    $gameAt = strpos($page, 'game.js?v=');
    if ($mapAt !== false && $gameAt !== false && $mapAt > $gameAt) {
        $problems[] = "$pageName must put the import map before the game.js script";
    }
    if ($problems) {
        return [$gameJs, $page, $problems, []];
    }

    // Dependencies first (post-order from game.js); a cycle or an unreached module is a problem.
    $order = [];
    $state = [];
    $visit = function (string $node, array $trail) use (&$visit, &$order, &$state, &$problems, $deps): void {
        if (($state[$node] ?? 0) === 2) {
            return;
        }
        if (($state[$node] ?? 0) === 1) {
            $problems[] = 'import cycle: ' . implode(' -> ', array_merge(array_slice($trail, (int) array_search($node, $trail, true)), [$node]));
            return;
        }
        $state[$node] = 1;
        foreach (array_keys($deps[$node]) as $d) {
            $visit($d, array_merge($trail, [$node]));
        }
        $state[$node] = 2;
        $order[] = $node;
    };
    $visit('game.js', []);
    foreach (array_keys($text) as $f) {
        if (!isset($state[$f])) {
            $problems[] = "$f is not imported from game.js, directly or through another js/ module";
        }
    }
    if ($problems) {
        return [$gameJs, $page, $problems, []];
    }

    $hash = [];
    foreach ($order as $node) {
        $base = dirname($node) === '.' ? '' : dirname($node);
        $text[$node] = (string) preg_replace_callback(
            INSTALL_IMPORT_RE,
            function (array $m) use ($base, &$hash): string {
                if ($m[3][0] !== '.') {
                    return $m[0];
                }
                $bare = (string) preg_replace('/\?.*$/', '', $m[3]);
                return $m[1] . $m[2] . $bare . '?v=' . $hash[install_resolve($base, $bare)] . $m[2];
            },
            $text[$node]
        );
        $hash[$node] = install_version($text[$node]);
    }
    $gameJs = $text['game.js'];
    unset($text['game.js']);

    if ($map !== null) {
        $page = (string) preg_replace_callback(
            '#(<script type="importmap">)(.*?)(</script>)#s',
            fn(array $m): string => $m[1] . preg_replace_callback(
                '#"(\./[\w./-]+\.js)\?v=[^"?\s]*"#',
                fn(array $e): string => '"' . $e[1] . '?v=' . install_version((string) file_get_contents($dir . '/' . substr($e[1], 2))) . '"',
                $m[2]
            ) . $m[3],
            $page
        );
    }
    foreach (INSTALL_PAGE_VERSIONED as $f) {
        $content = $f === 'game.js' ? $gameJs : @file_get_contents("$dir/$f");
        if (!is_string($content)) {
            $problems[] = "$f is not readable, but $pageName references it";
            continue;
        }
        $count = 0;
        $page = (string) preg_replace_callback(
            '#((?:src|href)=")' . preg_quote($f, '#') . '(\?v=)([^"?\s]*)(")#',
            fn(array $m): string => $m[1] . $f . $m[2] . install_version($content) . $m[4],
            $page,
            -1,
            $count
        );
        if ($count !== 1) {
            $problems[] = "$pageName must reference $f?v=... exactly once (found $count)";
        }
    }
    return [$gameJs, $page, $problems, $text];
}

/** The marked block in the game's page: install tags and the service worker. */
function install_block(array $card, string $pad): string
{
    $lines = [
        INSTALL_BEGIN,
        '<meta name="theme-color" content="' . install_esc($card['theme_color']) . '">',
        '<link rel="manifest" href="manifest.webmanifest">',
        '<link rel="apple-touch-icon" sizes="192x192" href="icon-192.png">',
        '<meta name="mobile-web-app-capable" content="yes">',
        '<meta name="apple-mobile-web-app-capable" content="yes">',
        '<meta name="apple-mobile-web-app-title" content="' . install_esc($card['short_name']) . '">',
        INSTALL_SW_REGISTER,
        INSTALL_END,
    ];
    return implode("\n", array_map(fn($l) => $pad . $l, $lines));
}

/** A page with its block replaced, or inserted after the <title>. */
function install_apply(string $html, string $block): ?string
{
    // The begin line is matched by prefix, so its parenthetical can change.
    $b = strpos($html, '<!-- app-tags:begin');
    $e = strpos($html, INSTALL_END);
    if ($b !== false && $e !== false && $e > $b) {
        $lineStart = strrpos(substr($html, 0, $b), "\n");
        $lineStart = $lineStart === false ? 0 : $lineStart + 1;
        return substr($html, 0, $lineStart) . $block . substr($html, $e + strlen(INSTALL_END));
    }
    if (!preg_match('#^([ \t]*)<title>.*?</title>[^\n]*\n#mi', $html, $m, PREG_OFFSET_CAPTURE)) {
        return null;
    }
    $at = $m[0][1] + strlen($m[0][0]);
    return substr($html, 0, $at) . $block . "\n" . substr($html, $at);
}

/** Problems with the install icons: each must be a square PNG of its size. */
function install_icon_problems(string $dir): array
{
    $problems = [];
    foreach ([192, 512] as $n) {
        $info = @getimagesize("$dir/icon-$n.png");
        if ($info === false || $info[2] !== IMAGETYPE_PNG || $info[0] !== $n || $info[1] !== $n) {
            $problems[] = "icon-$n.png must be a {$n}x$n PNG";
        }
    }
    return $problems;
}

/** The manifest JSON. Every URL is relative, so the game runs from whatever
 *  path serves it. With no `id`, the app is known by its start_url. */
function install_manifest(array $card): string
{
    $manifest = [
        'name' => $card['title'],
        'short_name' => $card['short_name'],
        'description' => $card['description'],
        'lang' => 'en',
        'start_url' => $card['play'] === 'index.html' ? './' : $card['play'],
        'scope' => './',
        'display' => 'standalone',
        'background_color' => $card['background_color'],
        'theme_color' => $card['theme_color'],
        'categories' => ['games'],
        'icons' => [
            ['src' => 'icon-192.png', 'sizes' => '192x192', 'type' => 'image/png', 'purpose' => 'any'],
            ['src' => 'icon-512.png', 'sizes' => '512x512', 'type' => 'image/png', 'purpose' => 'any'],
        ],
    ];
    return json_encode($manifest, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . "\n";
}

/**
 * The static files the service worker precaches, and a hash of them.
 * $override maps a file name to the content this run is about to write.
 * Test files, the dev-only effects editor (fx-editor.*), the share-only
 * picture and the build tooling (package.json, package-lock.json,
 * tsconfig.json) are left out; the rendered effect sprites (fx/sprites), the
 * compiled ES modules (js/, built from src/ by tools/ts-build.mjs) and the
 * vendored libraries (vendor/, copied by tools/vendor.mjs) are in.
 *
 * @param array<string, string> $override
 * @return array{0: list<string>, 1: string} [file names, hash]
 */
function install_precache(string $dir, array $override, string $image): array
{
    $names = [];
    // A file about to be written counts even if it is not on disk yet.
    $found = array_merge(scandir($dir) ?: [], array_keys($override));
    foreach (['fx/sprites'] as $sub) {
        foreach (is_dir("$dir/$sub") ? (scandir("$dir/$sub") ?: []) : [] as $f) {
            $found[] = "$sub/$f";
        }
    }
    array_push($found, ...install_js_tree($dir, 'js'), ...install_js_tree($dir, 'vendor'));
    foreach ($found as $f) {
        if ((is_file("$dir/$f") || isset($override[$f])) && !in_array($f, $names, true)
            && preg_match('/\.(html|js|css|json|png|webmanifest)$/', $f)
            && $f !== 'sw.js' && $f !== $image && !str_contains($f, '-test.')
            && !str_starts_with($f, 'fx-editor.')
            && !in_array($f, ['package.json', 'package-lock.json', 'tsconfig.json'], true)) {
            $names[] = $f;
        }
    }
    sort($names);
    $ctx = hash_init('sha256');
    foreach ($names as $f) {
        hash_update($ctx, $f . "\0" . ($override[$f] ?? (string) file_get_contents("$dir/$f")) . "\0");
    }
    return [$names, substr(hash_final($ctx), 0, 12)];
}

/** The service worker: precache, then network first. */
function install_sw(array $card, string $id, array $files, string $hash): string
{
    $prefix = "game-$id-";
    $urls = json_encode(array_merge(['./'], $files), JSON_UNESCAPED_SLASHES);
    return <<<JS
// Service worker for {$card['title']}. Generated by tools/install-files.php
// in this folder; rerun it after changing the game's files or metadata.yaml.
// Network first, so an online player always gets the current files; the
// precached copies answer only when the network does not.
const PREFIX = '$prefix';
const CACHE = PREFIX + '$hash';
const PRECACHE = $urls;
const SCOPE_PATH = new URL('./', self.location).pathname;

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(PRECACHE.map(u => new Request(u, { cache: 'reload' }))))
      .then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith(PREFIX) && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);
  // Only this game's own files. Its server APIs (.php) stay online only, and
  // anything outside the folder is left to the browser. Range requests
  // (streamed music) go straight to the network: a partial 206 is not cached,
  // and the precache holds only small static files. Sound effects, fetched
  // whole, are cached here the first time they play.
  if (req.method !== 'GET' || url.origin !== self.location.origin || req.headers.has('range')
      || !url.pathname.startsWith(SCOPE_PATH) || url.pathname.endsWith('.php')) {
    return;
  }
  event.respondWith(
    fetch(req, { cache: 'no-cache' }).then(res => {
      if (res.status === 200) {
        const copy = res.clone();
        caches.open(CACHE).then(cache => cache.put(req, copy));
      }
      return res;
    }).catch(() => caches.match(req, { ignoreSearch: true })
      .then(hit => hit || (req.mode === 'navigate' ? caches.match('./') : undefined))
      .then(res => res || Response.error())));
});

JS;
}

/**
 * Brings the game folder's install files in line with its metadata.
 * @return array{0: list<string>, 1: list<string>} [stale file names, notes]
 */
function install_sync(string $dir, bool $write): array
{
    [$card, $err] = install_card($dir);
    if ($card === null) {
        return [[], [$err]];
    }
    $notes = install_icon_problems($dir);
    $pageName = $card['play'];
    $html = (string) @file_get_contents("$dir/$pageName");
    // Versions first: the page and sw.js hash the content written here.
    [$gameJs, $html, $problems, $modules] = install_versions($dir, (string) @file_get_contents("$dir/game.js"), $html, $pageName);
    if ($problems) {
        return [[], array_merge($notes, $problems)];
    }
    $pad = preg_match('#^([ \t]*)<title>#mi', $html, $m) ? $m[1] : '';
    $page = install_apply($html, install_block($card, $pad));
    if ($page === null) {
        return [[], array_merge($notes, ["no <title> in $pageName to put install tags after"])];
    }
    $outputs = [$pageName => $page, 'game.js' => $gameJs] + $modules;
    if (!$notes) {
        $manifest = install_manifest($card);
        $outputs['manifest.webmanifest'] = $manifest;
        [$names, $hash] = install_precache($dir, $outputs, basename($card['image']));
        $outputs['sw.js'] = install_sw($card, basename($dir), $names, $hash);
    }
    $stale = [];
    foreach ($outputs as $name => $content) {
        if ((string) @file_get_contents("$dir/$name") !== $content) {
            $stale[] = $name;
            if ($write) {
                file_put_contents("$dir/$name", $content);
            }
        }
    }
    return [$stale, $notes];
}

if (realpath($_SERVER['SCRIPT_FILENAME'] ?? '') === __FILE__) {
    $check = in_array('--check', $argv, true);
    [$stale, $notes] = install_sync(dirname(__DIR__), !$check);
    foreach ($notes as $n) {
        fwrite(STDERR, "install-files: $n\n");
    }
    if ($check) {
        foreach ($stale as $f) {
            fwrite(STDERR, "install-files: $f is stale; run php tools/install-files.php in the game folder\n");
        }
    } else {
        foreach ($stale as $f) {
            echo "install-files: wrote $f\n";
        }
    }
    exit($notes || ($check && $stale) ? 1 : 0);
}
