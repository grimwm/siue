<?php
declare(strict_types=1);

final class DeploySetTest extends LegacyCheckCase
{
    protected static function script(): string
    {
        return __DIR__ . '/checks/deploy-set.php';
    }
}
