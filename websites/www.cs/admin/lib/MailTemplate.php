<?php
// The two sign-in messages, each a multipart/alternative with the plain text first. The HTML
// part is table markup with inline styles and no images, in the site's dark look.
declare(strict_types=1);

namespace Admin;

final class MailTemplate
{
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
            . "If this was not you, sign out everywhere:\r\n$hubUrl\r\n";
        $rows = '';
        foreach (['When' => $at, 'IP' => $ip, 'Browser' => $agent] as $label => $value) {
            $rows .= '<tr><td style="padding:6px 16px 6px 0;font-family:\'Source Sans 3\',Arial,sans-serif;color:#9aa3b2;font-size:14px;vertical-align:top;white-space:nowrap;">'
                . self::e($label) . '</td><td style="padding:6px 0;font-family:\'Source Sans 3\',Arial,sans-serif;color:#e8ebf0;font-size:16px;word-break:break-word;">'
                . self::e($value) . '</td></tr>';
        }
        $body = self::p('Someone signed in to your admin pages.')
            . '<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px 0;">' . $rows . '</table>'
            . self::p('If this was not you, sign out everywhere.', true, false)
            . self::button($hubUrl, 'Sign out everywhere');
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
        $color = $muted ? '#9aa3b2' : '#e8ebf0';
        $size = $muted ? '14px' : '17px';
        $margin = $last ? '24px 0 0 0' : '0 0 24px 0';
        return "<p style=\"margin:$margin;font-family:'Source Sans 3',Arial,sans-serif;font-size:$size;line-height:1.5;color:$color;\">"
            . self::e($text) . '</p>';
    }

    private static function button(string $url, string $label): string
    {
        return '<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0 0 0;"><tr>'
            . '<td bgcolor="#e02020" style="background:#e02020;border-radius:6px;">'
            . '<a href="' . self::e($url) . '" style="display:inline-block;padding:14px 32px;'
            . "font-family:'Source Sans 3',Arial,sans-serif;font-size:17px;font-weight:bold;color:#ffffff;text-decoration:none;\">"
            . self::e($label) . '</a></td></tr></table>';
    }

    private static function page(string $heading, string $body): string
    {
        $mark = '<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="left" style="margin:0 0 24px 0;"><tr>'
            . '<td width="120" height="28" bgcolor="#1e2633" style="background:#1e2633;border-radius:14px;width:120px;height:28px;" align="center" valign="middle">'
            . '<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>'
            . '<td width="22" height="14" bgcolor="#e02020" style="background:#e02020;border-radius:50%;width:22px;height:14px;font-size:1px;line-height:1px;">&nbsp;</td>'
            . '</tr></table></td></tr></table><div style="clear:both;"></div>';
        $h = self::e($heading);
        return '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">'
            . '<meta name="viewport" content="width=device-width, initial-scale=1">'
            . '<meta name="color-scheme" content="dark"><meta name="supported-color-schemes" content="dark">'
            . "<title>$h</title></head>"
            . '<body style="margin:0;padding:0;background:#0d0f12;color:#e8ebf0;">'
            . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#0d0f12" style="background:#0d0f12;"><tr><td align="center">'
            . '<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;">'
            . '<tr><td height="6" bgcolor="#e02020" style="background:#e02020;height:6px;font-size:1px;line-height:6px;">&nbsp;</td></tr>'
            . '<tr><td bgcolor="#0d0f12" style="background:#0d0f12;padding:40px 24px 40px 24px;">'
            . $mark
            . "<h1 style=\"margin:0;font-family:Orbitron,'Source Sans 3',Arial,sans-serif;font-size:28px;line-height:1.2;font-weight:bold;color:#e8ebf0;\">$h</h1>"
            . $body
            . '</td></tr>'
            . '<tr><td height="6" bgcolor="#e02020" style="background:#e02020;height:6px;font-size:1px;line-height:6px;">&nbsp;</td></tr>'
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
