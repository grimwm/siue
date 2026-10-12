<?php
declare(strict_types=1);

final class SiteVersionsTest extends LegacyCheckCase
{
    protected static function script(): string
    {
        return __DIR__ . '/checks/site-versions.php';
    }
}
