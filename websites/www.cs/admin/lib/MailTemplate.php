<?php
// The two sign-in messages, each a multipart/alternative with the plain text first. The HTML
// part is table markup with inline styles and no images, in the site's light look: dark text on
// white reads in every client, and clients with a dark mode invert it cleanly, where a dark design
// gets lightened to grey with dimmed text.
declare(strict_types=1);

namespace Admin;

final class MailTemplate
{
    /** The site's light palette (site.css, [data-bs-theme="light"]). */
    public const PAGE = '#e8ebf0';
    public const CARD = '#ffffff';
    public const TEXT = '#1a1f2a';
    public const MUTED = '#5a6578';
    public const RED = '#c81010';

    /** @return array{subject:string,mime:string} */
    public static function link(string $url, int $minutes): array
    {
        $good = 'Good for ' . $minutes . ($minutes === 1 ? ' minute' : ' minutes') . ', once.';
        $text = "Sign in\r\n\r\n"
            . "$good\r\n\r\n"
            . $url . "\r\n\r\n"
            . "If you did not ask for this, ignore it.\r\n";
        $body = self::p($good)
            . self::button($url, 'Sign in')
            . self::p('If you did not ask for this, ignore it.', true);
        return ['subject' => 'Your sign-in link', 'mime' => self::multipart($text, self::page('Sign in', $body))];
    }

    /** @return array{subject:string,mime:string} */
    public static function notice(int $when, string $ip, string $agent, string $hubUrl): array
    {
        $at = (new \DateTimeImmutable('@' . $when))->setTimezone(new \DateTimeZone('America/Chicago'))->format('D j M Y, g:i A T');
        $ip = self::oneLine($ip, 45);
        $agent = self::oneLine($agent, 120);
        $text = "New sign-in\r\n\r\n"
            . "When: $at\r\nIP: $ip\r\nBrowser: $agent\r\n\r\n"
            . "If this was not you, sign in, then sign out everywhere:\r\n$hubUrl\r\n";
        $rows = '';
        foreach (['When' => $at, 'IP' => $ip, 'Browser' => $agent] as $label => $value) {
            $rows .= '<tr><td style="padding:6px 16px 6px 0;font-family:\'Source Sans 3\',Arial,sans-serif;color:' . self::MUTED . ';font-size:14px;vertical-align:top;white-space:nowrap;">'
                . self::e($label) . '</td><td style="padding:6px 0;font-family:\'Source Sans 3\',Arial,sans-serif;color:' . self::TEXT . ';font-size:16px;word-break:break-word;">'
                . self::e($value) . '</td></tr>';
        }
        $body = self::p('Someone signed in to your admin pages.')
            . '<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px 0;">' . $rows . '</table>'
            . self::p('If this was not you, sign in and press Sign out everywhere.', true, false)
            . self::button($hubUrl, 'Open the admin pages');
        return ['subject' => 'New sign-in to your admin pages', 'mime' => self::multipart($text, self::page('New sign-in', $body))];
    }

    private static function e(string $s): string
    {
        return htmlspecialchars($s, ENT_QUOTES | ENT_SUBSTITUTE);
    }

    /** One printable line of at most $max characters; control characters become spaces. */
    private static function oneLine(string $s, int $max): string
    {
        $s = preg_replace('/[\x00-\x1f\x7f]+/', ' ', mb_scrub($s, 'UTF-8')) ?? '';
        return trim(mb_substr($s, 0, $max, 'UTF-8'));
    }

    private static function p(string $text, bool $muted = false, bool $last = true): string
    {
        $color = $muted ? self::MUTED : self::TEXT;
        $size = $muted ? '14px' : '17px';
        $margin = $last ? '24px 0 0 0' : '0 0 24px 0';
        return "<p style=\"margin:$margin;font-family:'Source Sans 3',Arial,sans-serif;font-size:$size;line-height:1.5;color:$color;\">"
            . self::e($text) . '</p>';
    }

    private static function button(string $url, string $label): string
    {
        return '<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0 0 0;"><tr>'
            . '<td bgcolor="' . self::RED . '" style="background:' . self::RED . ';border-radius:6px;">'
            . '<a href="' . self::e($url) . '" style="display:inline-block;padding:14px 32px;'
            . "font-family:'Source Sans 3',Arial,sans-serif;font-size:17px;font-weight:bold;color:#ffffff;text-decoration:none;\">"
            . self::e($label) . '</a></td></tr></table>';
    }

    private static function page(string $heading, string $body): string
    {
        $h = self::e($heading);
        $bar = '<tr><td height="6" bgcolor="' . self::RED . '" style="background:' . self::RED . ';height:6px;font-size:1px;line-height:6px;">&nbsp;</td></tr>';
        return '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">'
            . '<meta name="viewport" content="width=device-width, initial-scale=1">'
            . '<meta name="color-scheme" content="light"><meta name="supported-color-schemes" content="light">'
            . "<title>$h</title></head>"
            . '<body style="margin:0;padding:0;background:' . self::PAGE . ';color:' . self::TEXT . ';">'
            . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="' . self::PAGE . '" style="background:' . self::PAGE . ';"><tr><td align="center" style="padding:24px 12px;">'
            . '<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;">'
            . $bar
            . '<tr><td bgcolor="' . self::CARD . '" style="background:' . self::CARD . ';padding:36px 28px;">'
            . "<p style=\"margin:0 0 12px 0;font-family:Orbitron,'Source Sans 3',Arial,sans-serif;font-size:13px;font-weight:bold;letter-spacing:2px;color:" . self::RED . ";\">WWW.CS &middot; ADMIN</p>"
            . "<h1 style=\"margin:0;font-family:Orbitron,'Source Sans 3',Arial,sans-serif;font-size:28px;line-height:1.2;font-weight:bold;color:" . self::TEXT . ";\">$h</h1>"
            . $body
            . '</td></tr>'
            . $bar
            . '</table></td></tr></table></body></html>';
    }

    private static function multipart(string $text, string $html): string
    {
        $boundary = 'admin-' . bin2hex(random_bytes(16));
        $text = str_replace(["\r\n", "\r"], "\n", $text);
        $text = str_replace("\n", "\r\n", $text);
        return "MIME-Version: 1.0\r\n"
            . "Content-Type: multipart/alternative; boundary=\"$boundary\"\r\n"
            . "\r\n"
            . "--$boundary\r\n"
            . "Content-Type: text/plain; charset=utf-8\r\n"
            . "Content-Transfer-Encoding: quoted-printable\r\n"
            . "\r\n"
            . quoted_printable_encode($text) . "\r\n"
            . "--$boundary\r\n"
            . "Content-Type: text/html; charset=utf-8\r\n"
            . "Content-Transfer-Encoding: quoted-printable\r\n"
            . "\r\n"
            . quoted_printable_encode($html) . "\r\n"
            . "--$boundary--\r\n";
    }
}
