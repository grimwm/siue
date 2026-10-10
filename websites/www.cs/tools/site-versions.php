<?php
/**
 * Writes the `?v=` cache-busters in the site's home page, index.html: each
 * file the page loads carries a short hash of that file's content, so a
 * changed file is fetched afresh and an unchanged one stays cached. The home
 * page is the site's, so this tool lives with the site and the games stay
 * ignorant of it. It rewrites only the version value inside a recognised
 * reference:
 *   - site.css and main.js, the site shell;
 *   - games/cylon/cylon.css, the mounted game's stylesheet;
 *   - games/cylon/cylon.js, the mounted game's entry module, loaded by an
 *     import() in the page's module script.
 * Each reference must appear exactly once, or nothing is written and the
 * problem is reported.
 *
 *   php tools/site-versions.php          write index.html if it is stale
 *   php tools/site-versions.php --check  report it stale, exit 1 if so
 *
 * Who writes which `?v=`: this tool owns every one in index.html; the game's
 * own tools/install-files.php owns the ones inside games/cylon/cylon.js (its
 * js/ imports and its mount.html fetch). The two never touch the same file.
 * The page hashes cylon.js as it stands, so run the game's tool first: if
 * cylon.js changes afterwards, this tool's --check names index.html stale
 * until it is rerun. (make test and deploy.sh run them in that order.)
 * Copyright (C) 2026 William Grim
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
declare(strict_types=1);

/** The page, relative to the site root. */
const SITE_VERSIONS_PAGE = 'index.html';

/**
 * The references the page versions: [kind, path relative to the site root].
 * 'attr' is a src or href attribute; 'import' is a dynamic import() in the
 * page's module script.
 */
const SITE_VERSIONS_REFS = [
    ['attr', 'site.css'],
    ['attr', 'main.js'],
    ['attr', 'games/cylon/cylon.css'],
    ['import', 'games/cylon/cylon.js'],
];

/** The cache-buster for a file: a short hash of its content. */
function site_versions_hash(string $content): string
{
    return substr(hash('sha256', $content), 0, 10);
}

/**
 * Sets every referenced file's `?v=` to the hash of its content in $html.
 *
 * @return array{0: string, 1: list<string>} [page, problems]; on problems the page is unchanged
 */
function site_versions_apply(string $html, string $siteDir): array
{
    $problems = [];
    $out = $html;
    foreach (SITE_VERSIONS_REFS as [$kind, $path]) {
        $content = @file_get_contents("$siteDir/$path");
        if (!is_string($content)) {
            $problems[] = SITE_VERSIONS_PAGE . " references $path, which is not readable";
            continue;
        }
        $p = preg_quote($path, '#');
        $pattern = $kind === 'attr'
            ? '#((?:src|href)="' . $p . ')(\?v=)([^"?\s]*)(")#'
            : '#(import\(\'\./' . $p . ')(\?v=)([^\'"?\s]*)(\'\))#';
        $count = 0;
        $out = (string) preg_replace_callback(
            $pattern,
            fn(array $m): string => $m[1] . $m[2] . site_versions_hash($content) . $m[4],
            $out,
            -1,
            $count
        );
        if ($count !== 1) {
            $problems[] = SITE_VERSIONS_PAGE . " must reference $path?v=... exactly once (found $count)";
        }
    }
    return $problems ? [$html, $problems] : [$out, []];
}

/**
 * Brings the page's versions in line with its files.
 * @return array{0: bool, 1: list<string>} [stale, problems]
 */
function site_versions_sync(string $siteDir, bool $write): array
{
    $html = @file_get_contents("$siteDir/" . SITE_VERSIONS_PAGE);
    if (!is_string($html)) {
        return [false, [SITE_VERSIONS_PAGE . ' is not readable']];
    }
    [$page, $problems] = site_versions_apply($html, $siteDir);
    if ($problems) {
        return [false, $problems];
    }
    $stale = $page !== $html;
    if ($stale && $write) {
        file_put_contents("$siteDir/" . SITE_VERSIONS_PAGE, $page);
    }
    return [$stale, []];
}

if (realpath($_SERVER['SCRIPT_FILENAME'] ?? '') === __FILE__) {
    $check = in_array('--check', $argv, true);
    [$stale, $problems] = site_versions_sync(dirname(__DIR__), !$check);
    foreach ($problems as $p) {
        fwrite(STDERR, "site-versions: $p\n");
    }
    if ($stale) {
        if ($check) {
            fwrite(STDERR, 'site-versions: ' . SITE_VERSIONS_PAGE . " is stale; run php tools/site-versions.php (after php games/cylon/tools/install-files.php)\n");
        } else {
            echo 'site-versions: wrote ' . SITE_VERSIONS_PAGE . "\n";
        }
    }
    exit($problems || ($check && $stale) ? 1 : 0);
}
