<?php
// The admin pages' markup: one dark card, one stylesheet, no inline style or script,
// so the Content-Security-Policy in Headers::LIST lets every page render.
declare(strict_types=1);

namespace Admin;

final class Html
{
    public static function e(string $s): string
    {
        return htmlspecialchars($s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    }

    /**
     * A complete page: $body is trusted markup built with e(). $script adds the one same-origin script; $head is
     * trusted markup for the head; $stylesheet is the admin stylesheet's path from the page (Realm::$stylesheet).
     */
    public static function page(string $title, string $body, bool $script = false, string $head = '', string $stylesheet = 'admin.css'): string
    {
        $t = self::e($title);
        return '<!doctype html>' . "\n"
            . '<html lang="en"><head><meta charset="utf-8">'
            . '<meta name="viewport" content="width=device-width, initial-scale=1">'
            . '<meta name="robots" content="noindex, nofollow">'
            . '<meta name="color-scheme" content="dark">'
            . "<title>$t</title>"
            . '<link rel="stylesheet" href="' . self::e($stylesheet) . '">'
            . ($script ? '<script src="admin.js" defer></script>' : '')
            . $head
            . '</head><body><main class="card">'
            . '<div class="mark" aria-hidden="true"><span></span></div>'
            . "<h1>$t</h1>"
            . $body
            . '</main></body></html>';
    }

    public static function p(string $text, string $class = ''): string
    {
        return '<p' . ($class === '' ? '' : ' class="' . self::e($class) . '"') . '>' . self::e($text) . '</p>';
    }

    /**
     * A POST form of hidden fields and one button.
     *
     * @param array<string,string> $hidden
     */
    public static function form(string $action, array $hidden, string $button, string $class = 'button'): string
    {
        $fields = '';
        foreach ($hidden as $name => $value) {
            $fields .= '<input type="hidden" name="' . self::e($name) . '" value="' . self::e($value) . '">';
        }
        return '<form method="post" action="' . self::e($action) . '">' . $fields
            . '<button type="submit" class="' . self::e($class) . '">' . self::e($button) . '</button></form>';
    }
}
