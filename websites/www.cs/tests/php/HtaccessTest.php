<?php
// Pages revalidate on every visit (root and games/), so a cached page never names removed files.
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

final class HtaccessTest extends TestCase
{
    /** the root and games/ .htaccess send Cache-Control: no-cache for .html */
    public function testPagesRevalidate(): void
    {
        $root = dirname(__DIR__, 2);
        foreach (['.htaccess', 'games/.htaccess'] as $f) {
            $text = (string) @file_get_contents("$root/$f");
            self::assertTrue(str_contains($text, '<FilesMatch "\.html$">')
                && str_contains($text, 'Header set Cache-Control "no-cache"'), "$f-pages-revalidate" . ' :: ' . $f);
        }
    }
}
