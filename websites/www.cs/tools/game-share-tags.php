<?php
/**
 * Writes the site's page for each game, play/<id>/index.html, from the
 * game's metadata.yaml. Games know nothing about the site: everything that
 * ties a game to it lives in play/.
 *   - a `play` game: the site navbar, painted in the game's colours, over a
 *     full-height frame showing the game's own page (games/<id>/...);
 *   - a `start` game (mounted in the site page): a page that forwards to the
 *     site with ?game=<id>.
 * Both carry the game's link-preview tags (Open Graph, Twitter card), so a
 * shared link shows that game, not the home page. Crawlers never run
 * scripts, so the tags must sit in the served HTML.
 *
 *   php tools/game-share-tags.php          write every stale page
 *   php tools/game-share-tags.php --check  list stale pages, exit 1 if any
 *
 * The same run keeps each game installable (PWA). These files are the
 * game's own and use relative paths only:
 *   - games/<id>/manifest.webmanifest, linked from the game's page together
 *     with theme-color and iOS home-screen tags (inside a marked block);
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

const SHARE_TAGS_BEGIN = '<!-- app-tags:begin (tools/game-share-tags.php writes this block) -->';
const SHARE_TAGS_END = '<!-- app-tags:end -->';
const SHARE_TAGS_SITE_NAME = 'William Grim · SIUE Computer Science';
const SHARE_TAGS_SITE = 'https://www.cs.siue.edu/~wgrim/';

/* Registers a play page's service worker; harmless where service workers do
   not exist (plain http, file://, a test's stub DOM). */
const SHARE_TAGS_SW_REGISTER = "<script>if ('serviceWorker' in navigator) window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js', { scope: './' }).catch(function () {}); });</script>";

function share_tags_esc(string $s): string
{
    return htmlspecialchars($s, ENT_QUOTES | ENT_HTML5, 'UTF-8');
}

/** A game's link-preview tags, for the site page that shares it. */
function share_tags_preview(array $card, string $site): array
{
    $url = $site . 'play/' . $card['id'] . '/';
    $title = share_tags_esc($card['title']);
    $desc = share_tags_esc($card['description']);
    $lines = [
        '<meta name="description" content="' . $desc . '">',
        '<link rel="canonical" href="' . share_tags_esc($url) . '">',
        '<meta property="og:type" content="website">',
        '<meta property="og:site_name" content="' . share_tags_esc(SHARE_TAGS_SITE_NAME) . '">',
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
        '<meta name="twitter:title" content="' . $title . '">',
        '<meta name="twitter:description" content="' . $desc . '">');
    return $lines;
}

/** Install tags: theme colour, manifest, home-screen icon and title. $base
 *  is the path from the page to the game folder. */
function share_tags_install(array $card, string $base): array
{
    return [
        '<meta name="theme-color" content="' . share_tags_esc($card['theme_color']) . '">',
        '<link rel="manifest" href="' . share_tags_esc($base) . 'manifest.webmanifest">',
        '<link rel="apple-touch-icon" sizes="192x192" href="' . share_tags_esc($base) . 'icon-192.png">',
        '<meta name="mobile-web-app-capable" content="yes">',
        '<meta name="apple-mobile-web-app-capable" content="yes">',
        '<meta name="apple-mobile-web-app-title" content="' . share_tags_esc($card['short_name']) . '">',
    ];
}

/** The marked block in a play game's own page: install tags and the service
 *  worker, nothing about the site. Indented by $pad. */
function share_tags_block(array $card, string $pad): string
{
    $lines = array_merge([SHARE_TAGS_BEGIN], share_tags_install($card, ''), [SHARE_TAGS_SW_REGISTER, SHARE_TAGS_END]);
    return implode("\n", array_map(fn($l) => $pad . $l, $lines));
}

/** The site's page for a play game: its navbar, in the game's colours, over
 *  a frame showing the game. ../../ is the site root from play/<id>/. */
function share_tags_wrapper(array $card, string $site): string
{
    $id = $card['id'];
    $title = share_tags_esc($card['title']);
    $game = share_tags_esc('../../' . $card['page']);
    $head = array_merge(
        ['<meta charset="utf-8">', '<meta name="viewport" content="width=device-width, initial-scale=1">',
         "<title>$title · William Grim</title>"],
        share_tags_preview($card, $site),
        share_tags_install($card, "../../games/$id/"),
        ['<link rel="icon" href="../../favicon-32.png" sizes="32x32">',
         '<link rel="stylesheet" href="../play.css">',
         '<style>:root { --game-bg: ' . $card['background_color'] . '; --game-theme: ' . $card['theme_color']
            . '; --game-accent: ' . $card['accent_color'] . '; }</style>',
         '<script src="../play.js" defer></script>']);
    return "<!doctype html>\n<!-- Generated by tools/game-share-tags.php from games/$id/metadata.yaml; do not edit. -->\n"
        . "<html lang=\"en\">\n<head>\n" . implode("\n", $head) . "\n</head>\n<body>\n"
        . "<nav class=\"play-nav\" aria-label=\"Site\">\n"
        . "  <a class=\"play-brand\" href=\"../../\">William Grim</a>\n"
        . "  <a class=\"play-link\" href=\"../../\">Home</a>\n"
        . "  <a class=\"play-link\" href=\"../../#contact\">Contact</a>\n"
        . "  <a class=\"play-games\" href=\"../../#games\">Games</a>\n"
        . "  <span class=\"play-now\"><img src=\"../../games/$id/icon-192.png\" alt=\"\" width=\"20\" height=\"20\">$title</span>\n"
        . "</nav>\n"
        . "<iframe class=\"play-frame\" id=\"play-frame\" src=\"$game\" title=\"$title\" allow=\"fullscreen; keyboard-lock; autoplay; clipboard-write\" allowfullscreen></iframe>\n"
        . "</body>\n</html>\n";
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

/** The site's page for a game mounted in the site page: its preview tags,
 *  then straight on to the site with ?game=<id>. */
function share_tags_forward_page(array $card, string $site): string
{
    // Relative, so the forward stays on whichever host serves the page.
    $to = share_tags_esc('../../?game=' . rawurlencode($card['id']));
    $lines = array_merge(share_tags_preview($card, $site), share_tags_install($card, "../../games/{$card['id']}/"));
    return "<!doctype html>\n<!-- Generated by tools/game-share-tags.php from games/{$card['id']}/metadata.yaml; do not edit. -->\n"
        . "<html lang=\"en\">\n<head>\n<meta charset=\"utf-8\">\n"
        . '<title>' . share_tags_esc($card['title']) . "</title>\n"
        . implode("\n", $lines) . "\n"
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

/** The manifest JSON for one game. Every URL is relative, so the game runs
 *  from whatever path serves it. With no `id`, the app is known by its
 *  start_url: the game's own folder. */
function share_tags_manifest(array $card): string
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
    // play/ sits next to games/ at the site root.
    $playRoot = dirname($root) . '/play';
    foreach ($hub['games'] as $card) {
        $dir = "$root/{$card['id']}";
        $outputs = [];
        $want = null;
        $file = null;
        if (isset($card['page'])) {
            $file = $dir . '/' . substr($card['page'], strlen("games/{$card['id']}/"));
            if (str_ends_with($file, '/')) {
                $file .= 'index.html';
            }
            $html = (string) @file_get_contents($file);
            $pad = preg_match('#^([ \t]*)<title>#mi', $html, $m) ? $m[1] : '';
            $want = share_tags_apply($html, share_tags_block($card, $pad));
            if ($want === null) {
                $notes[] = "{$card['id']}: no <title> in its page to put install tags after";
                continue;
            }
            $outputs[$file] = $want;
            $outputs["$playRoot/{$card['id']}/index.html"] = share_tags_wrapper($card, $site);
        } else {
            $outputs["$playRoot/{$card['id']}/index.html"] = share_tags_forward_page($card, $site);
        }
        $problems = share_tags_icon_problems($dir);
        foreach ($problems as $p) {
            $notes[] = "{$card['id']}: $p";
        }
        if (!$problems) {
            $manifest = share_tags_manifest($card);
            $outputs["$dir/manifest.webmanifest"] = $manifest;
            if ($file !== null) {
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
                    @mkdir(dirname($path), 0755, true);
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
