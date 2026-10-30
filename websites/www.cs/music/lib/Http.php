<?php
// Response and request helpers shared by the music API and the session routes:
// the admin headers plus the music CSP, header lookup, the declared body length,
// the cross-site refusal and ranged file serving.
declare(strict_types=1);

namespace Music;

final class Http
{
    /** The admin CSP plus media-src for recorded and opened audio. */
    public const CSP_EXTRA = "; media-src 'self' blob:";

    public static function csp(): string
    {
        return \Admin\Headers::LIST['Content-Security-Policy'] . self::CSP_EXTRA;
    }

    /** The header's value, found whatever the letter case of either name. */
    public static function header(\Admin\Request $r, string $name): ?string
    {
        foreach ($r->headers as $key => $value) {
            if (strcasecmp((string) $key, $name) === 0) {
                return $value;
            }
        }
        return null;
    }

    /** The Content-Length header as a non-negative integer; null when it is missing or not all digits. */
    public static function declaredLength(\Admin\Request $r): ?int
    {
        $value = self::header($r, 'Content-Length');
        return $value !== null && preg_match('/^\d{1,12}$/D', $value) === 1 ? (int) $value : null;
    }

    /** 403 {"error":"cross_site"} when Sec-Fetch-Site is present and is not "same-origin"; null otherwise. */
    public static function refuseCrossSite(\Admin\Request $r): ?\Admin\Response
    {
        $site = self::header($r, 'Sec-Fetch-Site');
        return $site === null || $site === 'same-origin' ? null : self::json(403, ['error' => 'cross_site']);
    }

    /** @param array<string, mixed> $data */
    public static function json(int $status, array $data): \Admin\Response
    {
        return self::finish(new \Admin\Response($status, ['Content-Type' => 'application/json'], json_encode($data, JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES)));
    }

    /** Adds the admin headers and the music CSP to any response. */
    public static function finish(\Admin\Response $res): \Admin\Response
    {
        $res->headers = \Admin\Headers::apply($res->headers);
        $res->headers['Content-Security-Policy'] = self::csp();
        return $res;
    }

    /** 200 with $bytes whole, or 206 with one byte range ("bytes=a-b", "bytes=a-", "bytes=-n"); 416 on a bad range. */
    public static function serveBytes(string $bytes, string $mime, ?string $range): \Admin\Response
    {
        $size = strlen($bytes);
        $headers = ['Content-Type' => $mime, 'Accept-Ranges' => 'bytes'];
        if ($range === null) {
            return self::finish(new \Admin\Response(200, $headers + ['Content-Length' => (string) $size], $bytes));
        }
        $span = self::span($range, $size);
        if ($span === null) {
            return self::finish(new \Admin\Response(416, $headers + ['Content-Range' => "bytes */$size"], ''));
        }
        [$from, $to] = $span;
        $part = substr($bytes, $from, $to - $from + 1);
        return self::finish(new \Admin\Response(206, $headers + ['Content-Range' => "bytes $from-$to/$size", 'Content-Length' => (string) strlen($part)], $part));
    }

    /** @return array{int, int}|null the first and last byte of the satisfiable range, or null */
    private static function span(string $range, int $size): ?array
    {
        if (preg_match('/^bytes=(\d{0,12})-(\d{0,12})$/D', $range, $m) !== 1 || $size === 0) {
            return null;
        }
        [, $a, $b] = $m;
        if ($a === '') {
            if ($b === '' || (int) $b === 0) {
                return null;
            }
            return [max(0, $size - (int) $b), $size - 1];
        }
        $from = (int) $a;
        $to = $b === '' ? $size - 1 : min((int) $b, $size - 1);
        return $from < $size && $from <= $to ? [$from, $to] : null;
    }
}
