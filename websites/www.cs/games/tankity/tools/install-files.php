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
 *     stale until rewritten (rerun this after the last edit).
 * Test files, .php files and the share-only picture (`image:`) are not cached.
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
 *
 * @param array<string, string> $override
 * @return array{0: list<string>, 1: string} [file names, hash]
 */
function install_precache(string $dir, array $override, string $image): array
{
    $names = [];
    // A file about to be written counts even if it is not on disk yet.
    foreach (array_merge(scandir($dir) ?: [], array_keys($override)) as $f) {
        if ((is_file("$dir/$f") || isset($override[$f])) && !in_array($f, $names, true)
            && preg_match('/\.(html|js|css|json|png|webmanifest)$/', $f)
            && $f !== 'sw.js' && $f !== $image && !str_contains($f, '-test.')) {
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
    $pad = preg_match('#^([ \t]*)<title>#mi', $html, $m) ? $m[1] : '';
    $page = install_apply($html, install_block($card, $pad));
    if ($page === null) {
        return [[], array_merge($notes, ["no <title> in $pageName to put install tags after"])];
    }
    $outputs = [$pageName => $page];
    if (!$notes) {
        $manifest = install_manifest($card);
        $outputs['manifest.webmanifest'] = $manifest;
        [$names, $hash] = install_precache($dir, [$pageName => $page, 'manifest.webmanifest' => $manifest], basename($card['image']));
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
