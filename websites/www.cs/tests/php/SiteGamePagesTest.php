<?php
declare(strict_types=1);

final class SiteGamePagesTest extends LegacyCheckCase
{
    protected static function script(): string
    {
        return __DIR__ . '/checks/site-game-pages.php';
    }
}
