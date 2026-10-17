<?php
// Loads the admin libraries; every admin endpoint and test starts here.
declare(strict_types=1);

require_once __DIR__ . '/Clock.php';
require_once __DIR__ . '/Db.php';
require_once __DIR__ . '/Pages.php';

// The kit's classes, unless the kit is already loaded (the test suites share a process).
if (!class_exists(\Kit\StoreModes::class, false)) {
    require_once __DIR__ . '/store-modes.php';
}
if (!class_exists(\Kit\StoreDir::class, false)) {
    require_once __DIR__ . '/store-dir.php';
}
