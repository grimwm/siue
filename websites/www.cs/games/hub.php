<?php
/**
 * Games hub catalog: reads games/<id>/metadata.yaml for every game directory
 * and turns each into a card for the Games page. The format is documented in
 * games/README.md. The site's games.php serves games_hub_list() as JSON.
 * Copyright (C) 2026 William Grim
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
declare(strict_types=1);

const GAMES_HUB_KEYS = ['title', 'kicker', 'description', 'button', 'play', 'start', 'order', 'hidden', 'image', 'short_name', 'theme_color', 'background_color', 'accent_color', 'screenshot'];
const GAMES_HUB_DEFAULT_ORDER = 100;
const GAMES_HUB_DEFAULT_COLOR = '#0c0e12';
const GAMES_HUB_DEFAULT_ACCENT = '#ff4d4d';

/**
 * Parses the YAML subset metadata.yaml uses: top-level `key: value` lines,
 * `#` comments, single- or double-quoted scalars, and `key: >` folded blocks
 * (indented lines joined with spaces). Every value comes back as a string.
 * The server has no yaml extension, hence this reader.
 *
 * @return array{0: array<string, string>, 1: ?string} [data, error]
 */
function games_hub_parse_yaml(string $text): array
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
        $num = $i + 1;
        if (!preg_match('/^([A-Za-z_][A-Za-z0-9_]*):(?:\s+(.*))?$/', rtrim($line), $m)) {
            return [[], "line $num: expected `key: value` starting at column 1"];
        }
        $key = $m[1];
        if (array_key_exists($key, $data)) {
            return [[], "line $num: `$key` appears twice"];
        }
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
                return [[], "line $num: `$key` has an unclosed $quote"];
            }
            $rest = trim(substr($raw, $end + 1));
            if ($rest !== '' && $rest[0] !== '#') {
                return [[], "line $num: unexpected text after the quoted `$key`"];
            }
            $data[$key] = substr($raw, 1, $end - 1);
            continue;
        }

        $cut = strpos($raw, ' #');
        $data[$key] = $cut === false ? $raw : rtrim(substr($raw, 0, $cut));
    }
    return [$data, null];
}

/* A relative path inside a game folder: no scheme, no leading slash, no
   . or .. segments. */
function games_hub_safe_path(string $path): bool
{
    return (bool) preg_match('#^[A-Za-z0-9_-][A-Za-z0-9._/-]*$#', $path)
        && !preg_match('#(^|/)\.\.?(/|$)#', $path);
}

/**
 * Validates one game's metadata and builds its card. A card launches either
 * by link (`play`, a file inside the game directory) or by calling a global
 * function on the site page (`start`, for games mounted into the page).
 *
 * @param array<string, string> $meta
 * @return array{0: ?array<string, mixed>, 1: ?string} [card, error]; both
 *         null when the game sets `hidden: true`.
 */
function games_hub_card(string $id, array $meta, string $dir): array
{
    foreach (array_keys($meta) as $key) {
        if (!in_array($key, GAMES_HUB_KEYS, true)) {
            return [null, "unknown key `$key` (allowed: " . implode(', ', GAMES_HUB_KEYS) . ')'];
        }
    }

    $hidden = $meta['hidden'] ?? 'false';
    if ($hidden !== 'true' && $hidden !== 'false') {
        return [null, '`hidden` must be true or false'];
    }

    foreach (['title', 'description'] as $key) {
        if (trim($meta[$key] ?? '') === '') {
            return [null, "`$key` is required"];
        }
    }

    $play = trim($meta['play'] ?? '');
    $start = trim($meta['start'] ?? '');
    if (($play === '') === ($start === '')) {
        return [null, 'set exactly one of `play` (a page in the game folder) or `start` (a page function)'];
    }

    $order = trim($meta['order'] ?? (string) GAMES_HUB_DEFAULT_ORDER);
    if (!preg_match('/^-?\d{1,6}$/', $order)) {
        return [null, '`order` must be a whole number'];
    }

    if ($hidden === 'true') {
        return [null, null];
    }

    $title = trim($meta['title']);
    $card = [
        'id' => $id,
        'title' => $title,
        'kicker' => trim($meta['kicker'] ?? ''),
        'description' => trim($meta['description']),
        'button' => trim($meta['button'] ?? '') !== '' ? trim($meta['button']) : "Play $title",
        'order' => (int) $order,
    ];

    // Install (PWA) look: the app's short name and its two colors; the site's
    // wrapper page paints its navbar from these and the accent.
    $short = trim($meta['short_name'] ?? '');
    if (mb_strlen($short) > 24) {
        return [null, '`short_name` must be 24 characters or fewer'];
    }
    $card['short_name'] = $short !== '' ? $short : $title;
    foreach (['theme_color', 'background_color', 'accent_color'] as $key) {
        $color = trim($meta[$key] ?? ($key === 'accent_color' ? GAMES_HUB_DEFAULT_ACCENT : GAMES_HUB_DEFAULT_COLOR));
        if (!preg_match('/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/', $color)) {
            return [null, "`$key` must be a #rgb or #rrggbb color"];
        }
        $card[$key] = strtolower($color);
    }

    // Share picture for link previews: a 1200x630 image in the game folder.
    $image = trim($meta['image'] ?? '');
    if ($image !== '') {
        if (!games_hub_safe_path($image) || !preg_match('/\.(png|jpe?g|webp)$/i', $image)) {
            return [null, '`image` must be a .png, .jpg or .webp file inside the game folder'];
        }
        if (!is_file("$dir/$image")) {
            return [null, "`image` names $image, which is not in the game folder"];
        }
        $card['image'] = "games/$id/$image";
    }

    // Screenshot for the Games page card: a 16:9 picture in the game folder.
    $shot = trim($meta['screenshot'] ?? '');
    if ($shot !== '') {
        if (!games_hub_safe_path($shot) || !preg_match('/\.(png|jpe?g|webp)$/i', $shot)) {
            return [null, '`screenshot` must be a .png, .jpg or .webp file inside the game folder'];
        }
        if (!is_file("$dir/$shot")) {
            return [null, "`screenshot` names $shot, which is not in the game folder"];
        }
        $card['screenshot'] = "games/$id/$shot";
    }

    if ($play !== '') {
        // Relative, inside the game folder, no scheme or traversal.
        if (!games_hub_safe_path($play)) {
            return [null, '`play` must be a file path inside the game folder, like index.html'];
        }
        if (!is_file("$dir/$play")) {
            return [null, "`play` names $play, which is not in the game folder"];
        }
        // The game's own page (a folder's index page gets the folder URL).
        // Players and shared links go to the site's wrapper page, which shows
        // the site navbar over that page; the game knows nothing about it.
        $card['page'] = $play === 'index.html' ? "games/$id/" : "games/$id/$play";
        $card['href'] = "play/$id/";
        $card['share'] = $card['href'];
    } else {
        if (!preg_match('/^[A-Za-z_$][A-Za-z0-9_$]*$/', $start)) {
            return [null, '`start` must be a JavaScript function name, like cylonStartGame'];
        }
        $card['start'] = $start;
        // tools/site-game-pages.php writes play/<id>/, a page that carries
        // the game's share tags and forwards to the site with ?game=<id>.
        $card['share'] = "play/$id/";
        // The site page links this manifest once the game launches, so the
        // page can be installed as this game.
        if (is_file("$dir/manifest.webmanifest")) {
            $card['manifest'] = "games/$id/manifest.webmanifest";
        }
    }
    return [$card, null];
}

/**
 * Every game directory under $root that has a metadata.yaml, as cards sorted
 * by `order` then title, plus one error per game whose metadata is invalid.
 *
 * @return array{games: list<array<string, mixed>>, errors: list<array{id: string, error: string}>}
 */
function games_hub_list(string $root): array
{
    $games = [];
    $errors = [];
    $dirs = is_dir($root) ? scandir($root) : [];
    foreach ($dirs ?: [] as $id) {
        $dir = "$root/$id";
        if ($id[0] === '.' || !is_dir($dir) || !is_file("$dir/metadata.yaml")) {
            continue;
        }
        if (!preg_match('/^[a-z0-9][a-z0-9-]*$/', $id)) {
            $errors[] = ['id' => $id, 'error' => 'folder name must be lowercase letters, digits and dashes'];
            continue;
        }
        $text = @file_get_contents("$dir/metadata.yaml");
        if (!is_string($text)) {
            $errors[] = ['id' => $id, 'error' => 'metadata.yaml is not readable'];
            continue;
        }
        [$meta, $err] = games_hub_parse_yaml($text);
        if ($err === null) {
            [$card, $err] = games_hub_card($id, $meta, $dir);
        }
        if ($err !== null) {
            $errors[] = ['id' => $id, 'error' => "metadata.yaml: $err"];
        } elseif ($card !== null) {
            $games[] = $card;
        }
    }
    usort($games, fn(array $a, array $b): int => [$a['order'], $a['title']] <=> [$b['order'], $b['title']]);
    return ['games' => $games, 'errors' => $errors];
}
