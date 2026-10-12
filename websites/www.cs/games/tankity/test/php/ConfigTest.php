<?php
declare(strict_types=1);

final class ConfigTest extends LegacyCheckCase
{
    protected static function script(): string
    {
        return __DIR__ . '/checks/config.php';
    }
}
