<?php
// Keeps a game installable from its metadata.yaml: manifest.webmanifest, and
// for a game with a page of its own, the page's install tags, its ?v= values
// and sw.js. Each game's tools/install-files.php passes its config to
// install_run(). Needs only PHP.
declare(strict_types=1);

const INSTALL_BEGIN = '<!-- app-tags:begin (tools/install-files.php writes this block) -->';
const INSTALL_END = '<!-- app-tags:end -->';
const INSTALL_DEFAULT_COLOR = '#0c0e12';

/* Registers the page's service worker; harmless where service workers do
   not exist (plain http, file://, a test's stub DOM). */
const INSTALL_SW_REGISTER = "<script>if ('serviceWorker' in navigator) window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js', { scope: './' }).catch(function () {}); });</script>";

/* Holds back the browser's install prompt for the page's Install button
   (games/_kit/install.ts): the event can fire before the deferred
   dist/install.js runs, and a prompt not held back is lost. */
const INSTALL_PROMPT_STASH = "<script>window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); window.__installPrompt = e; });</script>";

/** Every install icon (rendered by games/_kit/build/icons.mjs): file, size and
 *  purpose. `apple` is the home-screen icon iOS reads from the page; the rest
 *  go in the manifest. */
const INSTALL_ICONS = [
    ['file' => 'icon-192.png', 'size' => 192, 'purpose' => 'any'],
    ['file' => 'icon-512.png', 'size' => 512, 'purpose' => 'any'],
    ['file' => 'icon-maskable-192.png', 'size' => 192, 'purpose' => 'maskable'],
    ['file' => 'icon-maskable-512.png', 'size' => 512, 'purpose' => 'maskable'],
    ['file' => 'icon-monochrome-512.png', 'size' => 512, 'purpose' => 'monochrome'],
    ['file' => 'icon-apple-180.png', 'size' => 180, 'purpose' => 'apple'],
];

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
function install_card(string $dir, string $kind): array
{
    $text = @file_get_contents("$dir/metadata.yaml");
    if (!is_string($text)) {
        return [null, 'metadata.yaml is not readable'];
    }
    [$meta, $err] = install_parse_yaml($text);
    if ($err !== null) {
        return [null, "metadata.yaml: $err"];
    }
    foreach (['title', 'description', $kind] as $key) {
        if (trim($meta[$key] ?? '') === '') {
            return [null, "metadata.yaml: `$key` is required"];
        }
    }
    $card = [
        'title' => trim($meta['title']),
        'description' => trim($meta['description']),
        $kind => trim($meta[$kind]),
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

/**
 * Sets each listed file's ?v= in the page to its content hash. Every file
 * must be referenced exactly once as src="…?v=…" or href="…?v=…".
 * @param list<string> $files
 * @return array{0: string, 1: list<string>} [page, problems]
 */
function install_page_versions(string $dir, string $page, string $pageName, array $files): array
{
    $problems = [];
    foreach ($files as $f) {
        $content = @file_get_contents("$dir/$f");
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
    return [$page, $problems];
}

/** The marked block in the game's page: install tags and the service worker. */
function install_block(array $card, string $pad): string
{
    $lines = [
        INSTALL_BEGIN,
        '<meta name="theme-color" content="' . install_esc($card['theme_color']) . '">',
        '<link rel="manifest" href="manifest.webmanifest">',
        '<link rel="apple-touch-icon" sizes="180x180" href="icon-apple-180.png">',
        '<meta name="mobile-web-app-capable" content="yes">',
        '<meta name="apple-mobile-web-app-capable" content="yes">',
        '<meta name="apple-mobile-web-app-title" content="' . install_esc($card['short_name']) . '">',
        INSTALL_PROMPT_STASH,
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
    foreach (INSTALL_ICONS as $icon) {
        $n = $icon['size'];
        $info = @getimagesize("$dir/{$icon['file']}");
        if ($info === false || $info[2] !== IMAGETYPE_PNG || $info[0] !== $n || $info[1] !== $n) {
            $problems[] = "{$icon['file']} must be a {$n}x$n PNG";
        }
    }
    return $problems;
}

/** The manifest JSON. Every URL is relative, so the game runs from whatever
 *  path serves it. A `start` game runs on the site page, so it starts there,
 *  with its scope narrowed to that page: an installed app stays in the game. */
function install_manifest(array $card, string $id): string
{
    $start = isset($card['start']);
    $manifest = [
        'name' => $card['title'],
        'short_name' => $card['short_name'],
        'description' => $card['description'],
        'lang' => 'en',
        'start_url' => $start ? '../../index.html?game=' . rawurlencode($id) . '&app=1' : ($card['play'] === 'index.html' ? './' : $card['play']),
        'scope' => $start ? '../../index.html' : './',
        'display_override' => ['fullscreen', 'standalone'],
        'display' => 'standalone',
        'background_color' => $card['background_color'],
        'theme_color' => $card['theme_color'],
        'categories' => ['games'],
        'icons' => array_values(array_map(
            fn(array $i): array => ['src' => $i['file'], 'sizes' => "{$i['size']}x{$i['size']}", 'type' => 'image/png', 'purpose' => $i['purpose']],
            array_filter(INSTALL_ICONS, fn(array $i): bool => $i['purpose'] !== 'apple')
        )),
    ];
    return json_encode($manifest, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . "\n";
}

/**
 * The static files the service worker precaches, and a hash of them.
 * @param array<string, string> $override name -> content about to be written
 * @param string $image the share-only picture, relative to the game folder as configured
 * @param list<string> $dirs folders precached recursively
 * @param list<string> $exclude fnmatch patterns on file names
 * @return array{0: list<string>, 1: string} [file names, hash]
 */
function install_precache(string $dir, array $override, string $image, array $dirs, array $exclude): array
{
    $found = array_merge(scandir($dir) ?: [], array_keys($override));
    foreach ($dirs as $sub) {
        if (!is_dir("$dir/$sub")) {
            continue;
        }
        $it = new RecursiveIteratorIterator(new RecursiveDirectoryIterator("$dir/$sub", FilesystemIterator::SKIP_DOTS));
        foreach ($it as $file) {
            $found[] = $sub . '/' . str_replace('\\', '/', substr($file->getPathname(), strlen("$dir/$sub/")));
        }
    }
    // A WebP or JPEG in a precached folder is a game asset (Crete's Modern icons, its look pictures); at the top it is a
    // page preview or screenshot, which stays out.
    $skip = array_merge(['sw.js', '*-test.*', '*.test.*', '*.map', 'package*.json', 'tsconfig*.json', 'build.json'], $exclude);
    $names = [];
    foreach ($found as $f) {
        $base = basename($f);
        if (in_array($f, $names, true) || !(is_file("$dir/$f") || isset($override[$f]))
            || !(preg_match('/\.(html|js|css|json|png|webmanifest)$/', $f) || (str_contains($f, '/') && preg_match('/\.(webp|jpg)$/', $f)))
            || $f === $image) {
            continue;
        }
        foreach ($skip as $pattern) {
            if (fnmatch($pattern, $base)) {
                continue 2;
            }
        }
        $names[] = $f;
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
// Service worker for {$card['title']}. Generated by tools/install-files.php (games/_kit/php/install-core.php)
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

/** @return array{0: list<string>, 1: list<string>} [stale file names, notes] */
function install_sync(string $dir, array $config, bool $write): array
{
    $kind = $config['kind'] ?? '';
    if ($kind !== 'play' && $kind !== 'start') {
        return [[], ["config: kind must be play or start"]];
    }
    [$card, $err] = install_card($dir, $kind);
    if ($card === null) {
        return [[], [$err]];
    }
    $notes = install_icon_problems($dir);
    $outputs = [];
    if ($kind === 'play') {
        $pageName = $card['play'];
        [$html, $problems] = install_page_versions($dir, (string) @file_get_contents("$dir/$pageName"), $pageName, $config['versioned'] ?? []);
        if ($problems) {
            return [[], array_merge($notes, $problems)];
        }
        $pad = preg_match('#^([ \t]*)<title>#mi', $html, $m) ? $m[1] : '';
        $page = install_apply($html, install_block($card, $pad));
        if ($page === null) {
            return [[], array_merge($notes, ["no <title> in $pageName to put install tags after"])];
        }
        $outputs[$pageName] = $page;
    }
    if (!$notes) {
        $outputs['manifest.webmanifest'] = install_manifest($card, basename($dir));
        if ($kind === 'play') {
            [$names, $hash] = install_precache($dir, $outputs, $card['image'], $config['precache_dirs'] ?? [], $config['precache_exclude'] ?? []);
            $outputs['sw.js'] = install_sw($card, basename($dir), $names, $hash);
        }
    }
    // Kit PHP is never deployed, so a game ships its own copy; the copy is an
    // output like the manifest, and --check refuses one edited by hand.
    if (!is_array($config['kit_php'] ?? [])) {
        return [[], array_merge($notes, ['config: kit_php must be a list of file names in games/_kit/php'])];
    }
    foreach ($config['kit_php'] ?? [] as $file) {
        if (!is_string($file) || !preg_match('/^[a-z0-9-]+\.(php|json)$/', $file)) {
            return [[], array_merge($notes, ['config: kit_php entries are file names in games/_kit/php, such as score-guard.php'])];
        }
        // A .json copy (blocked-initials.json) is shared data that lives in games/_kit/, beside php/.
        $copy = @file_get_contents((str_ends_with($file, '.json') ? dirname(__DIR__) : __DIR__) . "/$file");
        if ($copy === false) {
            return [[], array_merge($notes, ["config: kit_php names $file, which games/_kit/php does not have"])];
        }
        $outputs["server/$file"] = $copy;
    }
    $stale = [];
    foreach ($outputs as $name => $content) {
        if ((string) @file_get_contents("$dir/$name") !== $content) {
            $stale[] = $name;
            if ($write) {
                if (!is_dir(dirname("$dir/$name")) && !@mkdir(dirname("$dir/$name"), 0755, true) && !is_dir(dirname("$dir/$name"))) {
                    $notes[] = "cannot create the folder for $name";
                    continue;
                }
                file_put_contents("$dir/$name", $content);
            }
        }
    }
    return [$stale, $notes];
}

/** The tools/install-files.php command line: write, or --check. Returns the exit code; $err and $out are injectable streams. */
function install_run(string $dir, array $config, array $argv, $err = STDERR, $out = STDOUT): int
{
    $check = in_array('--check', $argv, true);
    [$stale, $notes] = install_sync($dir, $config, !$check);
    foreach ($notes as $n) {
        fwrite($err, "install-files: $n\n");
    }
    foreach ($stale as $f) {
        if ($check) {
            fwrite($err, "install-files: $f is stale; run php tools/install-files.php in the game folder\n");
        } else {
            fwrite($out, "install-files: wrote $f\n");
        }
    }
    return $notes || ($check && $stale) ? 1 : 0;
}
