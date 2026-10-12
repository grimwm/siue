<?php
declare(strict_types=1);

final class RoomsStoreTest extends LegacyCheckCase
{
    protected static function script(): string
    {
        return __DIR__ . '/checks/rooms-store.php';
    }
}
