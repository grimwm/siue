<?php
// The headers every admin response carries.
declare(strict_types=1);

namespace Admin;

final class Headers
{
    public const LIST = [
        'Cache-Control' => 'no-store',
        'Referrer-Policy' => 'no-referrer',
        'X-Robots-Tag' => 'noindex, nofollow',
        'X-Content-Type-Options' => 'nosniff',
        'Content-Security-Policy' => "default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'",
    ];

    /**
     * $headers with every required header set; a required header already present
     * is replaced, others are kept.
     *
     * @param array<string,string> $headers
     * @return array<string,string>
     */
    public static function apply(array $headers): array
    {
        return self::LIST + array_diff_key($headers, self::LIST);
    }
}
