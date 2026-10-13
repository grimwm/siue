<?php
// games/tankity/test/php-docker/RoomsStoreFailureTest.php
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

/* A database error partway through a request (disk full, read-only) must answer
   503 JSON and leave no row or lock behind, not an empty 500. A trigger that
   aborts every room UPDATE stands in for the failing disk. */
final class RoomsStoreFailureTest extends TestCase
{
    private static string $tmp;
    private static string $base;
    /** @var resource */
    private static $server;

    public static function setUpBeforeClass(): void
    {
        self::$tmp = sys_get_temp_dir() . '/tankity-failing-' . getmypid() . '-' . bin2hex(random_bytes(3));
        mkdir(self::$tmp, 0700);
        putenv('TANKITY_DATA_DIR=' . self::$tmp . '/data');
        require_once dirname(__DIR__) . '/php/rooms-lib.php';
        $probe = stream_socket_server('tcp://127.0.0.1:0');
        $port = (int) substr((string) strrchr((string) stream_socket_get_name($probe, false), ':'), 1);
        fclose($probe);
        self::$base = 'http://127.0.0.1:' . $port;
        self::$server = proc_open([PHP_BINARY, '-S', '127.0.0.1:' . $port, '-t', dirname(__DIR__, 2)],
            [0 => ['file', '/dev/null', 'r'], 1 => ['file', '/dev/null', 'w'], 2 => ['file', '/dev/null', 'w']], $pipes, null,
            array_merge(getenv(), ['TANKITY_DATA_DIR' => self::$tmp . '/data']));
        for ($i = 0; $i < 50 && @file_get_contents(self::$base . '/rooms.php?action=maps') === false; $i++) {
            usleep(100000);
        }
    }

    public static function tearDownAfterClass(): void
    {
        proc_terminate(self::$server);
        proc_close(self::$server);
        tankity_test_rm(self::$tmp);
    }

    /** @return array{int, mixed} */
    private static function create(): array
    {
        $ctx = stream_context_create(['http' => ['method' => 'POST', 'timeout' => 10, 'ignore_errors' => true,
            'header' => "Content-Type: application/json\r\n", 'content' => json_encode(['initials' => 'abc'])]]);
        $raw = @file_get_contents(self::$base . '/rooms.php?action=create', false, $ctx);
        preg_match('#^HTTP/\S+ (\d+)#', $http_response_header[0] ?? '', $m);
        return [(int) ($m[1] ?? 0), is_string($raw) ? json_decode($raw, true) : null];
    }

    public function testAFailingSaveAnswersJson503AndLeavesNothingBehind(): void
    {
        [$st] = self::create(); // opens the database and its schema
        $this->assertSame(200, $st);
        $db = tankity_db();
        $db->exec('DELETE FROM rooms');
        $db->exec("CREATE TRIGGER failing_disk BEFORE UPDATE ON rooms BEGIN SELECT RAISE(ABORT, 'database or disk is full'); END");
        try {
            [$st, $out] = self::create();
            $this->assertSame(503, $st);
            $this->assertSame(['error' => 'store unavailable'], $out);
            $this->assertSame(0, (int) $db->query('SELECT COUNT(*) FROM rooms')->fetchColumn(), 'the unsaved room is rolled back');
        } finally {
            $db->exec('DROP TRIGGER failing_disk');
        }
        [$st] = self::create();
        $this->assertSame(200, $st, 'the store is not left locked');
    }
}
