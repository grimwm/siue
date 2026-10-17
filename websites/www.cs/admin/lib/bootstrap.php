<?php
// Loads the admin libraries; every admin endpoint and test starts here.
declare(strict_types=1);

require_once __DIR__ . '/Clock.php';
require_once __DIR__ . '/Db.php';
require_once __DIR__ . '/Pages.php';

// The kit's StoreDir and StoreModes. Where the kit's source is present (a
// checkout, the test suites, which share one process with the kit's own tests)
// its files are the ones loaded, so a class is never declared twice; the
// deployed site ships the copies in this folder instead.
$kitPhp = __DIR__ . '/../../games/_kit/php';
if (is_file($kitPhp . '/score-guard.php')) {
    require_once $kitPhp . '/score-guard.php';
} elseif (!class_exists(\Kit\StoreDir::class, false)) {
    require_once __DIR__ . '/store-modes.php';
    require_once __DIR__ . '/store-dir.php';
}
unset($kitPhp);
