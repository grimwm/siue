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
 *   php tools/site-game-pages.php          write every stale page
 *   php tools/site-game-pages.php --check  list stale pages, exit 1 if any
 *
 * The wrapper pages load the shared play/play.css and play/play.js with a
 * `?v=` that is a short hash of each file's content, so a changed script or
 * stylesheet is fetched afresh (play.js is compiled from src/play/play.ts by
 * tools/ts-build.mjs, so run that first). A page's version changes only when
 * the file does.
 *
 * The game's own install files (manifest, service worker, the install block
 * in its page) are not written here: each game folder carries its own
 * tools/install-files.php. These pages only link the manifest.
 *
 * SITE_URL overrides the public base (default https://www.cs.siue.edu/~wgrim/).
 * Copyright (C) 2026 William Grim
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
declare(strict_types=1);
require_once __DIR__ . '/../games/hub.php';

const SITE_PAGES_SITE_NAME = 'William Grim · SIUE Computer Science';
const SITE_PAGES_SITE = 'https://www.cs.siue.edu/~wgrim/';

function site_pages_esc(string $s): string
{
    return htmlspecialchars($s, ENT_QUOTES | ENT_HTML5, 'UTF-8');
}

/** A game's link-preview tags, for the site page that shares it. */
function site_pages_preview(array $card, string $site): array
{
    $url = $site . 'play/' . $card['id'] . '/';
    $title = site_pages_esc($card['title']);
    $desc = site_pages_esc($card['description']);
    $lines = [
        '<meta name="description" content="' . $desc . '">',
        '<link rel="canonical" href="' . site_pages_esc($url) . '">',
        '<meta property="og:type" content="website">',
        '<meta property="og:site_name" content="' . site_pages_esc(SITE_PAGES_SITE_NAME) . '">',
        '<meta property="og:title" content="' . $title . '">',
        '<meta property="og:description" content="' . $desc . '">',
        '<meta property="og:url" content="' . site_pages_esc($url) . '">',
    ];
    if (isset($card['image'])) {
        $img = site_pages_esc($site . $card['image']);
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

/** Install tags linking the game's own files: theme colour, manifest,
 *  home-screen icon and title. $base is the path from the page to the game
 *  folder. */
function site_pages_install(array $card, string $base): array
{
    return [
        '<meta name="theme-color" content="' . site_pages_esc($card['theme_color']) . '">',
        '<link rel="manifest" href="' . site_pages_esc($base) . 'manifest.webmanifest">',
        '<link rel="apple-touch-icon" sizes="192x192" href="' . site_pages_esc($base) . 'icon-192.png">',
        '<meta name="mobile-web-app-capable" content="yes">',
        '<meta name="apple-mobile-web-app-capable" content="yes">',
        '<meta name="apple-mobile-web-app-title" content="' . site_pages_esc($card['short_name']) . '">',
    ];
}

/** The cache-buster for a file: a short hash of its content. */
function site_pages_version(string $content): string
{
    return substr(hash('sha256', $content), 0, 10);
}

/** The shared files every wrapper page loads, relative to play/. */
const SITE_PAGES_SHARED = ['play.css', 'play.js'];

/**
 * The `?v=` of each shared file, from play/ ($playRoot).
 * @return array{0: array<string, string>, 1: list<string>} [file => version, problems]
 */
function site_pages_shared_versions(string $playRoot): array
{
    $versions = [];
    $problems = [];
    foreach (SITE_PAGES_SHARED as $f) {
        $content = @file_get_contents("$playRoot/$f");
        if (!is_string($content)) {
            $problems[] = "play/$f is not readable, but the wrapper pages load it";
            continue;
        }
        $versions[$f] = site_pages_version($content);
    }
    return [$versions, $problems];
}

/** The site's page for a play game: its navbar, in the game's colours, over
 *  a frame showing the game. ../../ is the site root from play/<id>/.
 *  $versions maps play.css and play.js to their `?v=`. */
function site_pages_wrapper(array $card, string $site, array $versions): string
{
    $id = $card['id'];
    $title = site_pages_esc($card['title']);
    $game = site_pages_esc('../../' . $card['page']);
    $head = array_merge(
        ['<meta charset="utf-8">', '<meta name="viewport" content="width=device-width, initial-scale=1">',
         "<title>$title · William Grim</title>"],
        site_pages_preview($card, $site),
        site_pages_install($card, "../../games/$id/"),
        ['<link rel="icon" href="../../favicon-32.png" sizes="32x32">',
         '<link rel="stylesheet" href="../play.css?v=' . $versions['play.css'] . '">',
         '<style>:root { --game-bg: ' . $card['background_color'] . '; --game-theme: ' . $card['theme_color']
            . '; --game-accent: ' . $card['accent_color'] . '; }</style>',
         '<script src="../play.js?v=' . $versions['play.js'] . '" defer></script>']);
    return "<!doctype html>\n<!-- Generated by tools/site-game-pages.php from games/$id/metadata.yaml; do not edit. -->\n"
        . "<html lang=\"en\">\n<head>\n" . implode("\n", $head) . "\n</head>\n<body>\n"
        . "<nav class=\"play-nav\" aria-label=\"Site\">\n"
        . "  <a class=\"play-brand\" href=\"../../\">William Grim</a>\n"
        . "  <a class=\"play-link\" href=\"../../\">Home</a>\n"
        . "  <a class=\"play-link\" href=\"../../#contact\">Contact</a>\n"
        . "  <a class=\"play-github\" href=\"https://github.com/grimwm/siue\" target=\"_blank\" rel=\"noopener\" aria-label=\"Source on GitHub\" title=\"Source on GitHub\"><svg viewBox=\"0 0 16 16\" width=\"18\" height=\"18\" aria-hidden=\"true\" focusable=\"false\"><path fill=\"currentColor\" d=\"M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z\"/></svg></a>\n"
        . "  <a class=\"play-games\" href=\"../../#games\">Games</a>\n"
        . "  <span class=\"play-now\"><img src=\"../../games/$id/icon-192.png\" alt=\"\" width=\"20\" height=\"20\">$title</span>\n"
        . "</nav>\n"
        . "<iframe class=\"play-frame\" id=\"play-frame\" src=\"$game\" title=\"$title\" allow=\"fullscreen; keyboard-lock; autoplay; clipboard-write\" allowfullscreen></iframe>\n"
        . "</body>\n</html>\n";
}

/** The site's page for a game mounted in the site page: its preview tags,
 *  then straight on to the site with ?game=<id>. */
function site_pages_forward_page(array $card, string $site): string
{
    // Relative, so the forward stays on whichever host serves the page.
    $to = site_pages_esc('../../?game=' . rawurlencode($card['id']));
    $lines = array_merge(site_pages_preview($card, $site), site_pages_install($card, "../../games/{$card['id']}/"));
    return "<!doctype html>\n<!-- Generated by tools/site-game-pages.php from games/{$card['id']}/metadata.yaml; do not edit. -->\n"
        . "<html lang=\"en\">\n<head>\n<meta charset=\"utf-8\">\n"
        . '<title>' . site_pages_esc($card['title']) . "</title>\n"
        . implode("\n", $lines) . "\n"
        . '<meta http-equiv="refresh" content="0; url=' . $to . "\">\n"
        . "</head>\n<body>\n<p><a href=\"$to\">Play " . site_pages_esc($card['title']) . "</a></p>\n</body>\n</html>\n";
}

/**
 * Brings every game's site page in line with its metadata.
 * @return array{0: list<string>, 1: list<string>, 2: bool} [stale game ids, notes, whether a shared
 *         file was unreadable, so nothing could be checked or written]
 */
function site_pages_sync(string $root, string $site, bool $write): array
{
    $stale = [];
    $notes = [];
    $hub = games_hub_list($root);
    foreach ($hub['errors'] as $e) {
        $notes[] = "{$e['id']}: {$e['error']}";
    }
    // play/ sits next to games/ at the site root.
    $playRoot = dirname($root) . '/play';
    [$versions, $problems] = site_pages_shared_versions($playRoot);
    if ($problems) {
        return [[], array_merge($notes, $problems), true];
    }
    foreach ($hub['games'] as $card) {
        $content = isset($card['page'])
            ? site_pages_wrapper($card, $site, $versions)
            : site_pages_forward_page($card, $site);
        $path = "$playRoot/{$card['id']}/index.html";
        if ((string) @file_get_contents($path) !== $content) {
            $stale[] = $card['id'];
            if ($write) {
                @mkdir(dirname($path), 0755, true);
                file_put_contents($path, $content);
            }
        }
    }
    return [$stale, $notes, false];
}

if (realpath($_SERVER['SCRIPT_FILENAME'] ?? '') === __FILE__) {
    $check = in_array('--check', $argv, true);
    $site = getenv('SITE_URL') ?: SITE_PAGES_SITE;
    [$stale, $notes, $broken] = site_pages_sync(__DIR__ . '/../games', rtrim($site, '/') . '/', !$check);
    foreach ($notes as $n) {
        fwrite(STDERR, "site-game-pages: $n\n");
    }
    if ($check) {
        foreach ($stale as $id) {
            fwrite(STDERR, "site-game-pages: play/$id/ is stale; run php tools/site-game-pages.php\n");
        }
        exit($stale || $broken ? 1 : 0);
    }
    foreach ($stale as $id) {
        echo "site-game-pages: wrote play/$id/\n";
    }
    exit($broken ? 1 : 0);
}
