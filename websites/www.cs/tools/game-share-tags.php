<?php
/**
 * Writes each game's link-preview tags (Open Graph, Twitter card) from its
 * metadata.yaml, so a shared game link shows that game, not the home page.
 * Crawlers never run scripts, so the tags must sit in the served HTML:
 *   - a `play` game: a marked block in the head of its page;
 *   - a `start` game (mounted in the site page): games/<id>/index.html, a
 *     share page that forwards to the site with ?game=<id>.
 *
 *   php tools/game-share-tags.php          write every stale page
 *   php tools/game-share-tags.php --check  list stale pages, exit 1 if any
 *
 * The same run keeps each game installable (PWA), from the same metadata:
 *   - games/<id>/manifest.webmanifest, linked from the game's page together
 *     with theme-color and iOS home-screen tags (inside the marked block);
 *     it needs games/<id>/icon-192.png and icon-512.png, square PNGs;
 *   - a `play` game also gets games/<id>/sw.js, registered from its page: it
 *     precaches the game's static files so it opens offline, and otherwise
 *     goes to the network first. Its cache name carries a hash of those
 *     files, so any change to them makes sw.js stale until rewritten.
 *   A `start` game has no page to run in; its manifest starts the site page
 *   at ?game=<id> (scope: the site root), which main.js links on launch.
 *
 * SITE_URL overrides the public base (default https://www.cs.siue.edu/~wgrim/).
 * Copyright (C) 2026 William Grim
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
declare(strict_types=1);
require_once __DIR__ . '/../games/hub.php';

const SHARE_TAGS_BEGIN = '<!-- share-tags:begin (tools/game-share-tags.php writes this block) -->';
const SHARE_TAGS_END = '<!-- share-tags:end -->';
const SHARE_TAGS_SITE = 'https://www.cs.siue.edu/~wgrim/';

/* Registers a play page's service worker; harmless where service workers do
   not exist (plain http, file://, a test's stub DOM). */
const SHARE_TAGS_SW_REGISTER = "<script>if ('serviceWorker' in navigator) window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js', { scope: './' }).catch(function () {}); });</script>";

function share_tags_esc(string $s): string
{
    return htmlspecialchars($s, ENT_QUOTES | ENT_HTML5, 'UTF-8');
}

/** The tag lines for one card, indented by $pad. */
function share_tags_block(array $card, string $site, string $pad): string
{
    $url = $site . 'games/' . $card['id'] . '/';
    $title = share_tags_esc($card['title']);
    $desc = share_tags_esc($card['description']);
    $lines = [
        SHARE_TAGS_BEGIN,
        '<meta name="description" content="' . $desc . '">',
        '<link rel="canonical" href="' . share_tags_esc($url) . '">',
        '<meta property="og:type" content="website">',
        '<meta property="og:site_name" content="William Grim · SIUE Computer Science">',
        '<meta property="og:title" content="' . $title . '">',
        '<meta property="og:description" content="' . $desc . '">',
        '<meta property="og:url" content="' . share_tags_esc($url) . '">',
    ];
    if (isset($card['image'])) {
        $img = share_tags_esc($site . $card['image']);
        array_push($lines,
            '<meta property="og:image" content="' . $img . '">',
            '<meta property="og:image:width" content="1200">',
            '<meta property="og:image:height" content="630">',
            '<meta property="og:image:alt" content="' . $title . '">',
            '<meta name="twitter:card" content="summary_large_image">',
            '<meta name="twitter:image" content="' . $img . '">');
    } else {
        $lines[] = '<meta name="twitter:card" content="summary">';
    }
    array_push($lines,
        '<meta name="theme-color" content="' . share_tags_esc($card['theme_color']) . '">',
        '<link rel="manifest" href="manifest.webmanifest">',
        '<link rel="apple-touch-icon" sizes="192x192" href="icon-192.png">',
        '<meta name="mobile-web-app-capable" content="yes">',
        '<meta name="apple-mobile-web-app-capable" content="yes">',
        '<meta name="apple-mobile-web-app-title" content="' . share_tags_esc($card['short_name']) . '">');
    if (isset($card['href'])) {
        $lines[] = SHARE_TAGS_SW_REGISTER;
    }
    array_push($lines,
        '<meta name="twitter:title" content="' . $title . '">',
        '<meta name="twitter:description" content="' . $desc . '">',
        SHARE_TAGS_END);
    return implode("\n", array_map(fn($l) => $pad . $l, $lines));
}

/** A play page with its block replaced, or inserted after the <title>. */
function share_tags_apply(string $html, string $block): ?string
{
    $b = strpos($html, SHARE_TAGS_BEGIN);
    $e = strpos($html, SHARE_TAGS_END);
    if ($b !== false && $e !== false && $e > $b) {
        $lineStart = strrpos(substr($html, 0, $b), "\n");
        $lineStart = $lineStart === false ? 0 : $lineStart + 1;
        return substr($html, 0, $lineStart) . $block . substr($html, $e + strlen(SHARE_TAGS_END));
    }
    if (!preg_match('#^([ \t]*)<title>.*?</title>[^\n]*\n#mi', $html, $m, PREG_OFFSET_CAPTURE)) {
        return null;
    }
    $at = $m[0][1] + strlen($m[0][0]);
    return substr($html, 0, $at) . $block . "\n" . substr($html, $at);
}

/** The whole share page for a game mounted in the site page. */
function share_tags_forward_page(array $card, string $site): string
{
    // Relative, so the forward stays on whichever host serves the page.
    $to = share_tags_esc('../../?game=' . rawurlencode($card['id']));
    return "<!doctype html>\n<html lang=\"en\">\n<head>\n<meta charset=\"utf-8\">\n"
        . '<title>' . share_tags_esc($card['title']) . "</title>\n"
        . share_tags_block($card, $site, '') . "\n"
        . '<meta http-equiv="refresh" content="0; url=' . $to . "\">\n"
        . "</head>\n<body>\n<p><a href=\"$to\">Play " . share_tags_esc($card['title']) . "</a></p>\n</body>\n</html>\n";
}

/** Problems with a game's install icons: each must be a square PNG of its size. */
function share_tags_icon_problems(string $dir): array
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

/** The manifest JSON for one game. Every URL is relative, since the site is
 *  served from a path (~user), not the domain root. */
function share_tags_manifest(array $card, string $site): string
{
    if (isset($card['href'])) {
        $page = substr($card['href'], strlen("games/{$card['id']}/"));
        $start = $page === '' ? './' : $page;
        $scope = './';
    } else {
        // The game runs in the site page, so the app starts there. The scope
        // must contain start_url; both resolve against games/<id>/.
        $start = '../../?game=' . rawurlencode($card['id']);
        $scope = '../../';
    }
    $manifest = [
        // A path-only id resolves against the site's origin: stable if
        // start_url moves, and distinct per game.
        'id' => (string) parse_url($site, PHP_URL_PATH) . "games/{$card['id']}/",
        'name' => $card['title'],
        'short_name' => $card['short_name'],
        'description' => $card['description'],
        'lang' => 'en',
        'start_url' => $start,
        'scope' => $scope,
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
 * The static files a play game's service worker precaches, and a hash of
 * them. $override maps a file name to the content this run is about to write
 * for it. Test files and the share-only picture are left out.
 *
 * @param array<string, string> $override
 * @return array{0: list<string>, 1: string} [file names, hash]
 */
function share_tags_precache(string $dir, array $override, ?string $image): array
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

/** The service worker for a play game: precache, then network first. */
function share_tags_sw(array $card, array $files, string $hash): string
{
    $prefix = "game-{$card['id']}-";
    $urls = json_encode(array_merge(['./'], $files), JSON_UNESCAPED_SLASHES);
    return <<<JS
// Service worker for {$card['title']}. Generated by tools/game-share-tags.php;
// rerun it after changing the game's files or metadata.yaml.
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
  // anything outside the folder is left to the browser.
  if (req.method !== 'GET' || url.origin !== self.location.origin
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
 * Brings every game's share tags in line with its metadata.
 * @return array{0: list<string>, 1: list<string>} [stale game ids, notes]
 */
function share_tags_sync(string $root, string $site, bool $write): array
{
    $stale = [];
    $notes = [];
    $hub = games_hub_list($root);
    foreach ($hub['errors'] as $e) {
        $notes[] = "{$e['id']}: {$e['error']}";
    }
    foreach ($hub['games'] as $card) {
        $dir = "$root/{$card['id']}";
        if (isset($card['href'])) {
            $file = $dir . '/' . substr($card['href'], strlen("games/{$card['id']}/"));
            if (str_ends_with($file, '/')) {
                $file .= 'index.html';
            }
            $html = (string) @file_get_contents($file);
            $pad = preg_match('#^([ \t]*)<title>#mi', $html, $m) ? $m[1] : '';
            $want = share_tags_apply($html, share_tags_block($card, $site, $pad));
            if ($want === null) {
                $notes[] = "{$card['id']}: no <title> in its page to put share tags after";
                continue;
            }
        } else {
            $file = "$dir/index.html";
            $html = (string) @file_get_contents($file);
            $want = share_tags_forward_page($card, $site);
        }
        $outputs = [$file => $want];
        $problems = share_tags_icon_problems($dir);
        foreach ($problems as $p) {
            $notes[] = "{$card['id']}: $p";
        }
        if (!$problems) {
            $manifest = share_tags_manifest($card, $site);
            $outputs["$dir/manifest.webmanifest"] = $manifest;
            if (isset($card['href'])) {
                $image = isset($card['image']) ? basename($card['image']) : null;
                [$names, $hash] = share_tags_precache(
                    $dir, [basename($file) => $want, 'manifest.webmanifest' => $manifest], $image);
                $outputs["$dir/sw.js"] = share_tags_sw($card, $names, $hash);
            }
        }
        $isStale = (bool) $problems;
        foreach ($outputs as $path => $content) {
            if ((string) @file_get_contents($path) !== $content) {
                $isStale = true;
                if ($write) {
                    file_put_contents($path, $content);
                }
            }
        }
        if ($isStale) {
            $stale[] = $card['id'];
        }
    }
    return [$stale, $notes];
}

if (realpath($_SERVER['SCRIPT_FILENAME'] ?? '') === __FILE__) {
    $check = in_array('--check', $argv, true);
    $site = getenv('SITE_URL') ?: SHARE_TAGS_SITE;
    [$stale, $notes] = share_tags_sync(__DIR__ . '/../games', rtrim($site, '/') . '/', !$check);
    foreach ($notes as $n) {
        fwrite(STDERR, "game-share-tags: $n\n");
    }
    if ($check) {
        foreach ($stale as $id) {
            fwrite(STDERR, "game-share-tags: games/$id share tags are stale; run php tools/game-share-tags.php\n");
        }
        exit($stale ? 1 : 0);
    }
    foreach ($stale as $id) {
        echo "game-share-tags: wrote games/$id\n";
    }
}
