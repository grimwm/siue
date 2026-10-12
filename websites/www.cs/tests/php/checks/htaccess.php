<?php
// Pages revalidate on every visit (root and games/), so a cached page never names removed files.
$root = dirname(__DIR__, 3);
foreach (['.htaccess', 'games/.htaccess'] as $f) {
    $text = (string) @file_get_contents("$root/$f");
    $check("$f-pages-revalidate", str_contains($text, '<FilesMatch "\.html$">')
        && str_contains($text, 'Header set Cache-Control "no-cache"'), $f);
}
