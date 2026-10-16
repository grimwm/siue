<?php
// games/tankity/test/php-docker/RoomsStoreTest.php
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

/* The room store under real concurrency: its own php -S (four workers) on a
   free 127.0.0.1 port, a private data directory, and
   holders in other processes. */
final class RoomsStoreTest extends TestCase
{
    private const CAP = 4;
    private static string $tmp;
    private static string $base;
    /** @var resource */
    private static $server;

    public static function setUpBeforeClass(): void
    {
        self::$tmp = sys_get_temp_dir() . '/tankity-store-http-' . getmypid() . '-' . bin2hex(random_bytes(3));
        mkdir(self::$tmp, 0700);
        file_put_contents(self::$tmp . '/test.yaml', "room_live_secs: 60\n");
        putenv('CONFIG_FILE=' . self::$tmp . '/test.yaml');
        putenv('TANKITY_DATA_DIR=' . self::$tmp . '/data');
        require_once dirname(__DIR__) . '/php/rooms-lib.php';
        tankity_config(true);
        $probe = stream_socket_server('tcp://127.0.0.1:0');
        $port = (int) substr((string) strrchr((string) stream_socket_get_name($probe, false), ':'), 1);
        fclose($probe);
        self::$base = 'http://127.0.0.1:' . $port;
        self::$server = proc_open([PHP_BINARY, '-S', '127.0.0.1:' . $port, '-t', dirname(__DIR__, 2)],
            [0 => ['file', '/dev/null', 'r'], 1 => ['file', '/dev/null', 'w'], 2 => ['file', '/dev/null', 'w']], $pipes, null,
            array_merge(getenv(), ['CONFIG_FILE' => self::$tmp . '/test.yaml', 'TANKITY_DATA_DIR' => self::$tmp . '/data', 'PHP_CLI_SERVER_WORKERS' => '4']));
        for ($i = 0; $i < 50 && self::get('ping') === null; $i++) {
            usleep(100000);
        }
    }

    public static function tearDownAfterClass(): void
    {
        proc_terminate(self::$server);
        proc_close(self::$server);
        tankity_test_rm(self::$tmp);
        putenv('CONFIG_FILE');
        tankity_config(true);
    }

    protected function setUp(): void
    {
        putenv('TANKITY_DATA_DIR=' . self::$tmp . '/data');
        tankity_db()->exec('DELETE FROM rooms');
    }

    /* A GET; a state poll's seat token rides in X-Seat-Token, as the client sends it. */
    private static function get(string $action, string $query = '', string $token = ''): ?array
    {
        $ctx = stream_context_create(['http' => ['timeout' => 10, 'ignore_errors' => true,
            'header' => $token === '' ? '' : "X-Seat-Token: $token\r\n"]]);
        $raw = @file_get_contents(self::$base . '/rooms.php?action=' . $action . $query, false, $ctx);
        return $raw === false ? null : json_decode($raw, true);
    }

    /** @return array{int, ?array} */
    private static function post(string $action, array $body): array
    {
        $body = tankity_test_admit(self::$base, $action, $body);
        $ctx = stream_context_create(['http' => ['method' => 'POST', 'timeout' => 10, 'ignore_errors' => true,
            'header' => "Content-Type: application/json\r\n", 'content' => json_encode($body)]]);
        $raw = @file_get_contents(self::$base . '/rooms.php?action=' . $action, false, $ctx);
        preg_match('#^HTTP/\S+ (\d+)#', $http_response_header[0] ?? '', $m);
        return [(int) ($m[1] ?? 0), $raw === false ? null : json_decode($raw, true)];
    }

    private function rows(): int
    {
        return (int) tankity_db()->query('SELECT COUNT(*) FROM rooms')->fetchColumn();
    }

    /** A process that takes the write lock, says LOCKED, and holds it $secs seconds. */
    private function holder(float $secs)
    {
        $code = 'define("TANKITY_ROOMS_LIB", true); require $argv[1] . "/rooms.php"; $db = tankity_db();'
            . ' $db->exec("BEGIN IMMEDIATE"); echo "LOCKED\n"; fflush(STDOUT); usleep((int) ($argv[2] * 1e6)); $db->exec("ROLLBACK");';
        $p = proc_open([PHP_BINARY, '-r', $code, dirname(__DIR__, 2), (string) $secs], [1 => ['pipe', 'w'], 2 => ['file', '/dev/null', 'w']], $pipes,
            null, array_merge(getenv(), ['TANKITY_DATA_DIR' => self::$tmp . '/data']));
        $this->assertSame('LOCKED', trim((string) fgets($pipes[1])));
        return [$p, $pipes];
    }

    public function testCreatesTakeDistinctCodes(): void
    {
        $codes = [];
        for ($i = 0; $i < self::CAP; $i++) {
            [$st, $r] = self::post('create', ['initials' => 'ab' . chr(97 + $i)]);
            $this->assertSame(200, $st, json_encode($r));
            $codes[] = $r['code'];
        }
        $this->assertCount(self::CAP, array_unique($codes));
        $this->assertSame(self::CAP, self::get('ping')['lobbies']['used']);
        $this->assertSame(self::CAP, $this->rows());
    }

    public function testTwoCreatesRaceForACode(): void
    {
        $multi = curl_multi_init();
        $handles = [];
        foreach (['raz', 'ray'] as $who) {
            $h = curl_init(self::$base . '/rooms.php?action=create');
            curl_setopt_array($h, [CURLOPT_POST => true, CURLOPT_POSTFIELDS => json_encode(tankity_test_admit(self::$base, 'create', ['initials' => $who])),
                CURLOPT_HTTPHEADER => ['Content-Type: application/json'], CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 10]);
            curl_multi_add_handle($multi, $h);
            $handles[] = $h;
        }
        do {
            curl_multi_exec($multi, $running);
            curl_multi_select($multi, 0.05);
        } while ($running > 0);
        $codes = array_map(fn($h): int => (int) curl_getinfo($h, CURLINFO_RESPONSE_CODE), $handles);
        $this->assertSame([200, 200], $codes);
        $made = array_map(fn($h): string => (string) (json_decode((string) curl_multi_getcontent($h), true)['code'] ?? ''), $handles);
        $this->assertCount(2, array_unique($made), 'two creates racing never share a code');
        $this->assertSame(2, $this->rows());
    }

    public function testTheLastHumanLeavingClosesTheRoom(): void
    {
        [, $r] = self::post('create', ['initials' => 'lvx']);
        [$st] = self::post('leave', ['code' => $r['code'], 'token' => $r['token'], 'csrf' => $r['csrf']]);
        $this->assertSame(200, $st);
        $this->assertSame(0, $this->rows());
        $this->assertSame('no such room', self::get('state', '&code=' . $r['code'])['error']);
    }

    public function testACreateSweepsIdleRooms(): void
    {
        [, $old] = self::post('create', ['initials' => 'old']);
        room_test_age($old['code'], 120);
        $this->assertSame(0, self::get('ping')['rooms']['used'], 'an idle room is not counted');
        self::post('create', ['initials' => 'new']);
        $this->assertSame(1, $this->rows());
    }

    public function testAHeldWriterMakesOthersWaitThenAnswerBusy(): void
    {
        [, $r] = self::post('create', ['initials' => 'bsy']);
        room_test_age($r['code'], 30); // a seated poll past the heartbeat takes the write lock
        [$p, $pipes] = $this->holder(3.0);
        $t = microtime(true);
        $out = self::get('state', '&code=' . $r['code'], $r['token']);
        $dt = microtime(true) - $t;
        proc_close($p);
        $this->assertSame('this room is busy; try again', $out['error'] ?? json_encode($out));
        $this->assertGreaterThan(1.8, $dt);
        $this->assertLessThan(3.0, $dt);
    }

    public function testAShortHoldOnlyDelays(): void
    {
        [, $r] = self::post('create', ['initials' => 'dly']);
        room_test_age($r['code'], 30); // a seated poll past the heartbeat takes the write lock
        [$p, $pipes] = $this->holder(0.5);
        $t = microtime(true);
        $out = self::get('state', '&code=' . $r['code'], $r['token']);
        $dt = microtime(true) - $t;
        proc_close($p);
        $this->assertTrue($out['ok'] ?? false, json_encode($out));
        $this->assertGreaterThan(0.3, $dt);
    }

    public function testAKilledHolderReleasesTheLock(): void
    {
        [, $r] = self::post('create', ['initials' => 'kil']);
        room_test_age($r['code'], 30); // a seated poll past the heartbeat takes the write lock
        [$p, $pipes] = $this->holder(30.0);
        proc_terminate($p, 9);
        proc_close($p);
        $t = microtime(true);
        $out = self::get('state', '&code=' . $r['code'], $r['token']);
        $this->assertTrue($out['ok'] ?? false, json_encode($out));
        $this->assertLessThan(1.0, microtime(true) - $t);
    }

    public function testALobbyPollAnswersWhileARoomIsHeld(): void
    {
        [, $r] = self::post('create', ['initials' => 'lob']);
        [$p, $pipes] = $this->holder(3.0);
        $t = microtime(true);
        $out = self::get('state', '&code=' . $r['code'], $r['token']);
        $dt = microtime(true) - $t;
        proc_close($p);
        $this->assertTrue($out['ok'] ?? false, json_encode($out));
        $this->assertLessThan(1.0, $dt, 'a fresh lobby poll is a read');
    }

    public function testPingAnswersWhileARoomIsHeld(): void
    {
        self::post('create', ['initials' => 'png']);
        [$p, $pipes] = $this->holder(3.0);
        $t = microtime(true);
        $ping = self::get('ping');
        $dt = microtime(true) - $t;
        proc_close($p);
        $this->assertSame(1, $ping['lobbies']['used']);
        $this->assertLessThan(1.0, $dt);
        $this->assertArrayNotHasKey('store', $ping['rooms']);
    }
}
