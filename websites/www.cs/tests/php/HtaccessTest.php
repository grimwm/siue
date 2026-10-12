<?php
declare(strict_types=1);

final class HtaccessTest extends LegacyCheckCase
{
    protected static function script(): string
    {
        return __DIR__ . '/checks/htaccess.php';
    }
}
