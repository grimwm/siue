<?php
// Email addresses as the studios use them: one normal form, and the narrower shape a studio may have.
declare(strict_types=1);

namespace Admin;

final class Address
{
    /** Trimmed, lower case; null on a CR or LF or when there is not exactly one `@` with text on both sides. */
    public static function normalize(string $raw): ?string
    {
        if (preg_match('/[\r\n]/', $raw) === 1) {
            return null;
        }
        $a = strtolower(trim($raw));
        return preg_match('/^[^@\s]+@[^@\s]+$/D', $a) === 1 ? $a : null;
    }

    /** The normalized address when its domain is exactly siue.edu and its local part is plain (no `+`), else null. */
    public static function studio(string $raw): ?string
    {
        $a = self::normalize($raw);
        if ($a === null) {
            return null;
        }
        [$local, $domain] = explode('@', $a);
        return $domain === 'siue.edu' && preg_match('/^[a-z0-9._-]{1,64}$/D', $local) === 1 ? $a : null;
    }
}
