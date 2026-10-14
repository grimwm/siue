<?php
// games/tankity/test/php-docker/RoomsRefusedStoreTest.php
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

/* A storage directory PHP will not use (here a symbolic link) must answer every
   endpoint with 503 JSON, never an empty 500 from an uncaught exception. */
final class RoomsRefusedStoreTest extends TestCase
{
    private static string $tmp;
    private static string $base;
    private static string $log;
    /** @var resource */
    private static $server;

    public static function setUpBeforeClass(): void
    {
        self::$tmp = sys_get_temp_dir() . '/tankity-refused-' . getmypid() . '-' . bin2hex(random_bytes(3));
        mkdir(self::$tmp . '/real', 0700, true);
        symlink(self::$tmp . '/real', self::$tmp . '/link');
        self::$log = self::$tmp . '/php.log';
        $probe = stream_socket_server('tcp://127.0.0.1:0');
        $port = (int) substr((string) strrchr((string) stream_socket_get_name($probe, false), ':'), 1);
        fclose($probe);
        self::$base = 'http://127.0.0.1:' . $port;
        self::$server = proc_open([PHP_BINARY, '-d', 'error_log=' . self::$log, '-S', '127.0.0.1:' . $port, '-t', dirname(__DIR__, 2)],
            [0 => ['file', '/dev/null', 'r'], 1 => ['file', '/dev/null', 'w'], 2 => ['file', '/dev/null', 'w']], $pipes, null,
            array_merge(getenv(), ['TANKITY_DATA_DIR' => self::$tmp . '/link']));
        for ($i = 0; $i < 50 && @file_get_contents(self::$base . '/rooms.php?action=maps') === false; $i++) {
            usleep(100000);
        }
    }

    public static function tearDownAfterClass(): void
    {
        proc_terminate(self::$server);
        proc_close(self::$server);
        @unlink(self::$tmp . '/link');
        @unlink(self::$log);
        @rmdir(self::$tmp . '/real');
        @rmdir(self::$tmp);
    }

    /** @return array{int, mixed} */
    private static function call(string $path, ?array $body = null): array
    {
        $opts = ['timeout' => 10, 'ignore_errors' => true];
        if ($body !== null) {
            $opts += ['method' => 'POST', 'header' => "Content-Type: application/json\r\n", 'content' => json_encode($body)];
        }
        $raw = @file_get_contents(self::$base . $path, false, stream_context_create(['http' => $opts]));
        preg_match('#^HTTP/\S+ (\d+)#', $http_response_header[0] ?? '', $m);
        return [(int) ($m[1] ?? 0), is_string($raw) ? json_decode($raw, true) : null];
    }

    public function testEveryRoomEndpointAnswersJson503(): void
    {
        foreach ([
            ['/rooms.php?action=ping', null],
            ['/rooms.php?action=state&code=ABCD', null],
            ['/rooms.php?action=create', ['initials' => 'abc']],
            ['/rooms.php?action=join', ['code' => 'ABCD', 'initials' => 'abc']],
            ['/scores.php', null],
        ] as [$path, $body]) {
            [$st, $out] = self::call($path, $body);
            $this->assertSame(503, $st, $path);
            $this->assertIsArray($out, "$path answers JSON");
            $this->assertSame('store unavailable', $out['error'], $path);
        }
        // A score POST never reaches the store: it is gone whatever the store's state.
        $this->assertSame([410, ['error' => 'solo scores now stay in this browser']],
            self::call('/scores.php', ['name' => 'abc', 'score' => 1, 'banked' => 0]));
    }

    public function testARefusedStoreLogsOneLinePerRequest(): void
    {
        foreach ([['/rooms.php?action=ping', null], ['/scores.php', null], ['/rooms.php?action=create', ['initials' => 'abc']]] as [$path, $body]) {
            file_put_contents(self::$log, '');
            self::call($path, $body);
            $lines = array_filter(explode("\n", (string) file_get_contents(self::$log)));
            $this->assertCount(1, $lines, $path . ': ' . implode(' | ', $lines));
        }
    }
}
