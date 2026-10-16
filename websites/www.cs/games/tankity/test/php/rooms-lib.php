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
require_once dirname(__DIR__, 3) . '/_kit/php/tests/TempDir.php';

/* The kit's TempDir helpers, for the plain functions below. */
final class TankityTempTree
{
    use Kit\Tests\TempDir;

    public static function remove(string $path): void
    {
        self::removeTree($path);
    }
}

/* Removes a test directory and everything in it, and points TANKITY_DATA_DIR
   back at this process's default. */
function tankity_test_rm(string $dir): void
{
    TankityTempTree::remove($dir);
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
        foreach (['acted', 'actedAt'] as $k) {
            if (isset($room[$k])) {
                $room[$k] = (int) $room[$k] - $seconds;
            }
        }
        $u = $db->prepare('UPDATE rooms SET data = ?, touched = touched - ?, created = created - ?, expires = expires - ?, acted = acted - ?
            WHERE code = ?');
        $u->bindValue(1, serialize($room), PDO::PARAM_LOB);
        for ($i = 2; $i <= 5; $i++) {
            $u->bindValue($i, $seconds, PDO::PARAM_INT);
        }
        $u->bindValue(6, $code);
        $u->execute();
    });
}

/* Sets a stored room's clocks (touched, acted, created) in its data and its
   columns, with the expiry recomputed from the result: a room as if a poll,
   an act or its creation had happened then. */
function room_test_set(string $code, array $set): void
{
    tankity_tx(tankity_db(), function (PDO $db) use ($code, $set): void {
        $q = $db->prepare('SELECT data FROM rooms WHERE code = ?');
        $q->execute([$code]);
        $room = room_decode($q->fetchColumn());
        if ($room === null) {
            return;
        }
        foreach (['touched', 'acted', 'created'] as $k) {
            if (isset($set[$k])) {
                $room[$k] = (int) $set[$k];
            }
        }
        $u = $db->prepare('UPDATE rooms SET data = ?, touched = ?, acted = ?, created = ?, expires = ? WHERE code = ?');
        $u->bindValue(1, serialize($room), PDO::PARAM_LOB);
        $u->bindValue(2, (int) ($room['touched'] ?? time()), PDO::PARAM_INT);
        $u->bindValue(3, room_acted($room), PDO::PARAM_INT);
        $u->bindValue(4, (int) ($room['created'] ?? time()), PDO::PARAM_INT);
        $u->bindValue(5, room_expires($room), PDO::PARAM_INT);
        $u->bindValue(6, $code);
        $u->execute();
    });
}

/* A create or join body as the current bundle sends it, for the suites that
   reach rooms.php over HTTP: the room protocol and the room puzzle, asked for
   from $base (the URL of rooms.php's folder) and solved here at whatever bits
   it came with. A body that already says `proto` or `pow` is sent as given. */
function tankity_test_admit(string $base, string $action, array $body): array
{
    if (!in_array($action, ['create', 'join'], true) || array_key_exists('proto', $body) || array_key_exists('pow', $body)) {
        return $body;
    }
    $ctx = stream_context_create(['http' => ['timeout' => 10, 'ignore_errors' => true]]);
    $ch = json_decode((string) @file_get_contents($base . '/rooms.php?action=challenge&for=' . $action, false, $ctx), true);
    if (!is_array($ch) || !is_string($ch['challenge'] ?? null)) {
        return $body + ['proto' => ROOM_PROTO];
    }
    $found = [];
    for ($n = 0; count($found) < (int) $ch['count']; $n++) {
        if (room_pow_lead($ch['challenge'], $n) >= (int) $ch['bits']) {
            $found[] = $n;
        }
    }
    return $body + ['proto' => ROOM_PROTO, 'pow' => ['c' => $ch['challenge'], 'n' => $found]];
}

/* A drone's magazine for a test that needs one: $n shells of every gun a drone may use (`ai`). A drone owns no free
   gear, so a case that wants it holding a gun hands it one (test/rack.ts is the browser's twin). */
function tankity_test_rack(int $n = 2): array
{
    $rack = ['shell' => -1];
    foreach (room_weapons() as $k => $def) {
        if ($k !== 'shell') {
            $rack[$k] = !empty($def['ai']) ? $n : 0;
        }
    }
    return $rack;
}
