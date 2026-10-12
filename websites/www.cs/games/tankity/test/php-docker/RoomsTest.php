<?php
declare(strict_types=1);

final class RoomsTest extends LegacyCheckCase
{
    protected static function script(): string
    {
        return __DIR__ . '/checks/rooms.php';
    }
}
