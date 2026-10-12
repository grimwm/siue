<?php
declare(strict_types=1);

final class GameJsonTest extends LegacyCheckCase
{
    protected static function script(): string
    {
        return __DIR__ . '/checks/game-json.php';
    }
}
