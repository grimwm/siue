<?php
/**
 * Keeps this game installable (PWA) from its own metadata.yaml. Needs only
 * PHP and this folder, so the game can be copied anywhere and rebuilt:
 *
 *   php tools/install-files.php          write every stale file
 *   php tools/install-files.php --check  list stale files, exit 1 if any
 *
 * (Run from the game folder; from the site root it is
 * php games/<id>/tools/install-files.php.) It writes:
 *   - manifest.webmanifest, which needs icon-192.png and icon-512.png, square
 *     PNGs;
 *   - the `?v=` cache-busters inside cylon.js: each ./js/<name>.js import, and
 *     the mount.html fetch, set to a short hash of that file's content (see
 *     install_versions). The `?v=` of cylon.js itself, and of the stylesheets in css/, are the
 *     site page's: the page that loads the game versions the game's entry
 *     points, so this tool never reads or writes it.
 *
 * This game is mounted in the site's page (`start:` in metadata.yaml), so it
 * has no page of its own to run in and no service worker: its manifest starts
 * the site page at ?game=<id> (scope: the site root), which the site links
 * when the game launches.
 * Copyright (C) 2026 William Grim
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
declare(strict_types=1);

const INSTALL_DEFAULT_COLOR = '#0c0e12';

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
    foreach (['title', 'description', 'start'] as $key) {
        if (trim($meta[$key] ?? '') === '') {
            return [null, "metadata.yaml: `$key` is required"];
        }
    }
    $card = [
        'title' => trim($meta['title']),
        'description' => trim($meta['description']),
        'start' => trim($meta['start']),
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

/** The cache-buster for a file: a short hash of its content. */
function install_version(string $content): string
{
    return substr(hash('sha256', $content), 0, 10);
}

/** The game's entry module, which imports js/ and fetches mount.html. */
const INSTALL_ENTRY = 'cylon.js';

/**
 * Sets every `?v=` inside the entry module to the content hash of the file it
 * names: each ./js/<name>.js import, and the mount.html fetch. Only the value
 * after `?v=` in a recognised reference is rewritten. Every js/ module must be
 * imported exactly once and mount.html referenced exactly once, or the problems
 * are reported and the caller writes nothing.
 *
 * @return array{0: string, 1: list<string>} [entry module, problems]
 */
function install_versions(string $dir, string $entry): array
{
    $problems = [];
    $modules = [];
    foreach (is_dir("$dir/js") ? (scandir("$dir/js") ?: []) : [] as $f) {
        if (preg_match('/^[\w-]+\.js$/', $f)) {
            $modules[$f] = install_version((string) file_get_contents("$dir/js/$f"));
        }
    }
    $seen = [];
    $entry = (string) preg_replace_callback(
        '#(from \'\./js/)([\w-]+\.js)(\?v=)([^\'"?\s]*)(\')#',
        function (array $m) use ($modules, &$seen, &$problems): string {
            $seen[$m[2]] = ($seen[$m[2]] ?? 0) + 1;
            if (!isset($modules[$m[2]])) {
                $problems[] = INSTALL_ENTRY . " imports js/{$m[2]}, which does not exist";
                return $m[0];
            }
            return $m[1] . $m[2] . $m[3] . $modules[$m[2]] . $m[5];
        },
        $entry
    );
    foreach (array_keys($modules) as $f) {
        if (($seen[$f] ?? 0) !== 1) {
            $problems[] = INSTALL_ENTRY . " must import ./js/$f?v=... exactly once (found " . ($seen[$f] ?? 0) . ')';
        }
    }
    $mount = @file_get_contents("$dir/mount.html");
    if (!is_string($mount)) {
        $problems[] = 'mount.html is not readable, but ' . INSTALL_ENTRY . ' fetches it';
        return [$entry, $problems];
    }
    $count = 0;
    $entry = (string) preg_replace_callback(
        '#(\'mount\.html)(\?v=)([^\'"?\s]*)(\')#',
        fn(array $m): string => $m[1] . $m[2] . install_version($mount) . $m[4],
        $entry,
        -1,
        $count
    );
    if ($count !== 1) {
        $problems[] = INSTALL_ENTRY . " must reference 'mount.html?v=...' exactly once (found $count)";
    }
    return [$entry, $problems];
}

/** The manifest JSON. Every URL is relative, so the game runs from whatever
 *  path serves it. With no `id`, the app is known by its start_url. */
function install_manifest(array $card, string $id): string
{
    $manifest = [
        'name' => $card['title'],
        'short_name' => $card['short_name'],
        'description' => $card['description'],
        'lang' => 'en',
        // The app starts the site page; the scope must contain start_url, and
        // both resolve against this folder.
        'start_url' => '../../?game=' . rawurlencode($id),
        'scope' => '../../',
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
    $outputs = $notes ? [] : ['manifest.webmanifest' => install_manifest($card, basename($dir))];
    // A folder with no entry module and no js/ is manifest-only; with either,
    // the entry module's versions are part of what this tool keeps.
    if (is_file("$dir/" . INSTALL_ENTRY) || is_dir("$dir/js")) {
        $entry = @file_get_contents("$dir/" . INSTALL_ENTRY);
        if (!is_string($entry)) {
            return [[], array_merge($notes, [INSTALL_ENTRY . ' is not readable, but js/ exists'])];
        }
        [$entry, $problems] = install_versions($dir, $entry);
        if ($problems) {
            return [[], array_merge($notes, $problems)];
        }
        $outputs[INSTALL_ENTRY] = $entry;
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
