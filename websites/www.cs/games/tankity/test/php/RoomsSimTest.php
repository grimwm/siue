<?php
declare(strict_types=1);

final class RoomsSimTest extends LegacyCheckCase
{
    protected static function script(): string
    {
        return __DIR__ . '/checks/rooms-sim.php';
    }
}
