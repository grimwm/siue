<?php
// games/tankity/test/php/rooms-lib.php
// Loads rooms.php for its functions only (no request is served) and keeps
// every test's storage in its own temporary directory. TestCases require this
// in setUpBeforeClass; check scripts require it instead of rooms.php.
declare(strict_types=1);
if (!defined('TANKITY_ROOMS_LIB')) {
    define('TANKITY_ROOMS_LIB', true);
}
require_once dirname(__DIR__, 2) . '/server/db.php';
require_once dirname(__DIR__, 2) . '/rooms.php';

/* Removes a test directory and everything in it, and points TANKITY_DATA_DIR
   back at this process's default. */
function tankity_test_rm(string $dir): void
{
    foreach (array_diff(scandir($dir) ?: [], ['.', '..']) as $f) {
        $p = "$dir/$f";
        is_dir($p) && !is_link($p) ? tankity_test_rm($p) : @unlink($p);
    }
    @rmdir($dir);
    putenv('TANKITY_DATA_DIR=' . ($GLOBALS['TANKITY_TEST_HOME'] ?? ''));
}

/* A fresh private directory, with TANKITY_DATA_DIR pointed at it. */
function tankity_test_dir(): string
{
    $dir = sys_get_temp_dir() . '/tankity-test-' . bin2hex(random_bytes(6));
    tankity_claim_dir($dir, true);
    putenv('TANKITY_DATA_DIR=' . $dir);
    return $dir;
}

// A process that sets no directory stores in one of its own, removed at exit.
if ((string) getenv('TANKITY_DATA_DIR') === '' && !isset($GLOBALS['TANKITY_TEST_HOME'])) {
    $GLOBALS['TANKITY_TEST_HOME'] = sys_get_temp_dir() . '/tankity-test-' . getmypid() . '-' . bin2hex(random_bytes(4));
    tankity_claim_dir($GLOBALS['TANKITY_TEST_HOME'], true);
    putenv('TANKITY_DATA_DIR=' . $GLOBALS['TANKITY_TEST_HOME']);
    register_shutdown_function(static fn() => tankity_test_rm($GLOBALS['TANKITY_TEST_HOME']));
}

/* Ages a stored room by $seconds, as a room nobody touches ages. */
function room_test_age(string $code, int $seconds): void
{
    tankity_tx(tankity_db(), function (PDO $db) use ($code, $seconds): void {
        $q = $db->prepare('SELECT data FROM rooms WHERE code = ?');
        $q->execute([$code]);
        $room = room_decode($q->fetchColumn());
        if ($room === null) {
            return;
        }
        $room['touched'] = (int) ($room['touched'] ?? time()) - $seconds;
        $room['created'] = (int) ($room['created'] ?? time()) - $seconds;
        if (isset($room['actedAt'])) {
            $room['actedAt'] = (int) $room['actedAt'] - $seconds;
        }
        $u = $db->prepare('UPDATE rooms SET data = ?, touched = touched - ?, created = created - ?, expires = expires - ? WHERE code = ?');
        $u->bindValue(1, serialize($room), PDO::PARAM_LOB);
        $u->bindValue(2, $seconds, PDO::PARAM_INT);
        $u->bindValue(3, $seconds, PDO::PARAM_INT);
        $u->bindValue(4, $seconds, PDO::PARAM_INT);
        $u->bindValue(5, $code);
        $u->execute();
    });
}
