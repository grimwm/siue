<?php
declare(strict_types=1);

final class OkTest extends LegacyCheckCase
{
    private const ROOT = '/x';

    protected static function script(): string
    {
        return __DIR__ . '/ok.checks.php';
    }

    private static function twice(int $n): int
    {
        return $n * 2;
    }
}
