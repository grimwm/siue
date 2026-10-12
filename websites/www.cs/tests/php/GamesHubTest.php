<?php
declare(strict_types=1);

final class GamesHubTest extends LegacyCheckCase
{
    protected static function script(): string
    {
        return __DIR__ . '/checks/games-hub.php';
    }
}
