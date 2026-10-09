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
 * SITE_URL overrides the public base (default https://www.cs.siue.edu/~wgrim/).
 * Copyright (C) 2026 William Grim
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
declare(strict_types=1);
require_once __DIR__ . '/../games/hub.php';

const SHARE_TAGS_BEGIN = '<!-- share-tags:begin (tools/game-share-tags.php writes this block) -->';
const SHARE_TAGS_END = '<!-- share-tags:end -->';
const SHARE_TAGS_SITE = 'https://www.cs.siue.edu/~wgrim/';

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
        '<meta property="og:site_name" content="William Grim — SIUE Computer Science">',
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
        if ($html !== $want) {
            $stale[] = $card['id'];
            if ($write) {
                file_put_contents($file, $want);
            }
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
