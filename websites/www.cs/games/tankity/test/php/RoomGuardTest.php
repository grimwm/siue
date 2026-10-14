<?php
// games/tankity/test/php/RoomGuardTest.php
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

/* Rooms use the score guard's rules: initials typed in either case are stored
   uppercase, and only allowed origins may post. Creating and joining a room
   share one hourly allowance per address, counted in the database's rate
   table (server/rate.php). */
final class RoomGuardTest extends TestCase
{
    private string $dir;

    public static function setUpBeforeClass(): void
    {
        require_once __DIR__ . '/rooms-lib.php';
    }

    protected function setUp(): void
    {
        $_SERVER = ['HTTP_HOST' => 'localhost', 'REMOTE_ADDR' => '198.51.100.7'];
        $this->dir = tankity_test_dir();
        putenv('TANKITY_ROOM_JOINS_PER_HOUR');
    }

    protected function tearDown(): void
    {
        putenv('TANKITY_ROOM_JOINS_PER_HOUR');
        tankity_test_rm($this->dir);
    }

    public function testInitialsAreStoredUppercase(): void
    {
        $this->assertSame('ABC', room_valid_initials('abc'));
        $this->assertSame('WGR', room_valid_initials(' wGr '));
    }

    public function testBadInitialsAreRefused(): void
    {
        foreach (['ab', 'abcd', 'a1c', 'ass', 'AsS', "ab\n", null, 7] as $bad) {
            $this->assertNull(room_valid_initials($bad), var_export($bad, true));
        }
    }

    public function testOriginsFollowTheAllowList(): void
    {
        $this->assertTrue(room_origin_ok(), 'no Origin: the seat and room tokens gate it');
        $_SERVER['HTTP_ORIGIN'] = 'http://localhost';
        $this->assertTrue(room_origin_ok());
        $_SERVER['HTTP_ORIGIN'] = 'https://www.cs.siue.edu';
        $this->assertTrue(room_origin_ok());
        $_SERVER['HTTP_ORIGIN'] = 'https://evil.example';
        $this->assertFalse(room_origin_ok());
    }

    public function testARefererAloneMustBeAnAllowedPage(): void
    {
        $_SERVER['HTTP_REFERER'] = 'https://evil.example/page';
        $this->assertFalse(room_origin_ok());
        $_SERVER['HTTP_REFERER'] = 'https://cs.siue.edu/games/tankity/';
        $this->assertTrue(room_origin_ok());
    }

    public function testTheRoomAllowanceIsASetting(): void
    {
        $this->expectErrorLog();
        $this->assertSame(300, room_joins_per_hour());
        putenv('TANKITY_ROOM_JOINS_PER_HOUR=3');
        $this->assertSame(3, room_joins_per_hour());
        foreach (['0', '-1', 'many', '2.5'] as $bad) {
            putenv("TANKITY_ROOM_JOINS_PER_HOUR=$bad");
            $this->assertSame(300, room_joins_per_hour(), $bad);
            $this->assertStringContainsString("room_joins_per_hour (TANKITY_ROOM_JOINS_PER_HOUR): refused '$bad'",
                (string) @file_get_contents((string) ini_get('error_log')));
        }
    }

    public function testTheAllowanceHoldsInEverySlidingHour(): void
    {
        putenv('TANKITY_ROOM_JOINS_PER_HOUR=2');
        $client = tankity_guard()->clientKey();
        $now = 1_800_000_000;
        $this->assertTrue(room_rate_take($client, $now));
        $this->assertTrue(room_rate_take($client, $now + 10));
        $this->assertFalse(room_rate_take($client, $now + 20));
        $this->assertTrue(room_rate_take('someone-else', $now + 20), 'another address has its own allowance');
        $this->assertFalse(room_rate_take($client, $now + 3600), 'still inside the hour');
        $this->assertTrue(room_rate_take($client, $now + 3600 + RATE_SLOT), 'back once the hour has moved on');
        $db = tankity_db();
        $this->assertSame(0, rate_used($db, $client, 'other', $now + 20), 'another kind counts on its own');
        // The sweep drops the rooms' counts once they are too old to matter, and keeps the rest.
        $this->assertSame(2, rate_expire($now + 3600 + RATE_SLOT * 7));
        $this->assertSame(1, rate_used($db, $client, 'room', $now + 3600 + RATE_SLOT * 7));
    }

    public function testASpentAllowanceIsRefusedWithoutTheWriteLock(): void
    {
        // A flood past the allowance must never queue on the writer: another
        // request holds the write lock, and the refusal still comes at once.
        putenv('TANKITY_ROOM_JOINS_PER_HOUR=1');
        $now = 1_800_000_000;
        $this->assertTrue(room_rate_take('flood', $now));
        $other = new PDO('sqlite:' . tankity_data_dir() . '/' . TANKITY_DB_FILE, null, null, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
        $other->exec('BEGIN IMMEDIATE');
        try {
            $t = microtime(true);
            $this->assertFalse(room_rate_take('flood', $now + 1));
            $this->assertLessThan(0.5, microtime(true) - $t, 'refused from a read, not after waiting on the lock');
        } finally {
            $other->exec('ROLLBACK');
        }
        $this->assertTrue(room_rate_take('someone-else', $now + 1), 'under the allowance it is still charged');
    }

    /** The room allowance spent so far, across every address. */
    private function roomCharges(): int
    {
        return (int) tankity_db()->query("SELECT COALESCE(SUM(n), 0) FROM rate WHERE kind = 'room'")->fetchColumn();
    }

    /** @return array{int, array} the status and the JSON answer of rooms.php as a request */
    private function call(string $action, array $body, array $server = [], array $env = []): array
    {
        $script = 'register_shutdown_function(static function () { while (ob_get_level()) { ob_end_flush(); } echo "\n", http_response_code(); });'
            . 'require ' . var_export(__DIR__ . '/scores-stdin.php', true) . ';'
            . '$_SERVER = ' . var_export($server + ['CONTENT_TYPE' => 'application/json', 'REMOTE_ADDR' => '203.0.113.9',
                'HTTP_HOST' => 'www.cs.siue.edu', 'HTTP_ORIGIN' => 'https://www.cs.siue.edu'], true) . ' + $_SERVER;'
            . '$_SERVER["REQUEST_METHOD"] = "POST"; $_GET = ' . var_export(['action' => $action], true) . ';'
            . 'require ' . var_export(dirname(__DIR__, 2) . '/rooms.php', true) . ';';
        $proc = proc_open([PHP_BINARY, '-d', 'zlib.output_compression=0', '-r', $script],
            [0 => ['pipe', 'r'], 1 => ['pipe', 'w'], 2 => ['pipe', 'w']], $pipes, null,
            $env + ['TANKITY_DATA_DIR' => $this->dir, 'TANKITY_ROOM_JOINS_PER_HOUR' => '2'] + getenv());
        fwrite($pipes[0], json_encode($body));
        fclose($pipes[0]);
        $out = stream_get_contents($pipes[1]);
        fclose($pipes[1]);
        fclose($pipes[2]);
        proc_close($proc);
        [$json, $status] = array_pad(explode("\n", rtrim($out), 2), 2, '');
        return [(int) trim($status), json_decode($json, true) ?? ['raw' => $out]];
    }

    public function testCreateAndJoinShareTheAllowance(): void
    {
        [$st, $host] = $this->call('create', ['initials' => 'hst']);
        $this->assertSame(200, $st, json_encode($host));
        // A refused origin is answered before anything is charged.
        $this->assertSame(403, $this->call('join', ['code' => $host['code'], 'initials' => 'gst'], ['HTTP_ORIGIN' => 'https://evil.example'])[0]);
        [$st, $guest] = $this->call('join', ['code' => $host['code'], 'initials' => 'gst']);
        $this->assertSame(200, $st, json_encode($guest));
        $this->assertSame([429, ['error' => 'too many rooms from here; try again later']], $this->call('create', ['initials' => 'thr']));
        $this->assertSame([429, ['error' => 'too many rooms from here; try again later']],
            $this->call('join', ['code' => $host['code'], 'initials' => 'thr']));
        $this->assertSame(200, $this->call('join', ['code' => $host['code'], 'initials' => 'oth'], ['REMOTE_ADDR' => '203.0.113.10'])[0],
            'another address joins');
        $q = tankity_db()->prepare('SELECT data FROM rooms WHERE code = ?');
        $q->execute([$host['code']]);
        $room = room_decode($q->fetchColumn());
        $this->assertSame(['HST', 'GST', 'OTH'], array_values(array_filter(array_map(
            static fn(array $s): ?string => ($s['human'] ?? false) ? $s['initials'] : null, $room['seats']))));
    }

    public function testACreateRefusedForAFullServerIsNotCharged(): void
    {
        // A lab clicking Host while every room is taken keeps its allowance for the moment one frees.
        $env = ['TANKITY_MAX_ROOMS' => '1'];
        [$st, $host] = $this->call('create', ['initials' => 'hst'], [], $env);
        $this->assertSame(200, $st, json_encode($host));
        for ($i = 0; $i < 3; $i++) {
            [$st, $out] = $this->call('create', ['initials' => 'two'], [], $env);
            $this->assertSame(409, $st, json_encode($out));
            $this->assertStringContainsString('every room is taken', $out['error']);
        }
        $this->assertSame(1, $this->roomCharges(), 'only the create that made a room was charged');
        // Everything else is still charged: a join refused for a bad code costs one.
        $this->assertSame(422, $this->call('join', ['code' => '??', 'initials' => 'gst'], [], $env)[0]);
        $this->assertSame(2, $this->roomCharges());
    }

    /** @return array the stored room, decoded */
    private function stored(string $code): array
    {
        $q = tankity_db()->prepare('SELECT data FROM rooms WHERE code = ?');
        $q->execute([$code]);
        return room_decode($q->fetchColumn());
    }

    private const FREE = ['TANKITY_ROOM_JOINS_PER_HOUR' => '1000'];

    public function testAnAddressHostsFourRoomsAndNoMore(): void
    {
        for ($i = 0; $i < 4; $i++) {
            [$st, $out] = $this->call('create', ['initials' => 'hst'], [], self::FREE);
            $this->assertSame(200, $st, json_encode($out));
            $this->assertNotSame('', (string) tankity_db()->query('SELECT host FROM rooms WHERE code = ' . tankity_db()->quote($out['code']))->fetchColumn(),
                'the host column carries the address, or the cap would never count the room');
        }
        [$st, $out] = $this->call('create', ['initials' => 'hst'], [], self::FREE);
        $this->assertSame(429, $st);
        $this->assertStringContainsString('too many rooms hosted', $out['error']);
        $this->assertSame(200, $this->call('create', ['initials' => 'two'], ['REMOTE_ADDR' => '203.0.113.10'], self::FREE)[0],
            'another address hosts its own');
    }

    public function testTheHostingCapIsRecheckedUnderTheWriteLock(): void
    {
        // Learn this address's key from one room, then free the slot.
        [$st, $first] = $this->call('create', ['initials' => 'hst'], [], self::FREE);
        $this->assertSame(200, $st);
        $db = tankity_db();
        $key = (string) $db->query('SELECT host FROM rooms')->fetchColumn();
        $db->exec('DELETE FROM rooms');
        // The moment another create of the same address takes its code (after
        // the plain-read check passed), four rooms of it appear: a race.
        $db->exec("CREATE TRIGGER race AFTER INSERT ON rooms WHEN NEW.data = '' BEGIN "
            . implode(' ', array_map(fn(int $n): string => "INSERT OR IGNORE INTO rooms (code, data, created, touched, expires, host) VALUES ('RAC$n', 'x', 1, 1, 4102444800, " . $db->quote($key) . ');', range(1, 4)))
            . ' END');
        [$st, $out] = $this->call('create', ['initials' => 'hst'], [], self::FREE);
        $this->assertSame(429, $st, json_encode($out));
        $this->assertSame(0, (int) $db->query('SELECT COUNT(*) FROM rooms')->fetchColumn(), 'the refused room was freed with the race it lost');
    }

    public function testAJoinRecordsTheGuestsAddressForTheIdleLimit(): void
    {
        $turn = 86400;
        [$st, $host] = $this->call('create', ['initials' => 'hst', 'turn' => $turn], [], self::FREE);
        $this->assertSame(200, $st, json_encode($host));
        $this->assertSame(200, $this->call('join', ['code' => $host['code'], 'initials' => 'mat'], [], self::FREE)[0]);
        $room = $this->stored($host['code']);
        $this->assertSame($turn, $room['turnSecs']);
        $this->assertSame(room_live_secs(), room_idle_limit($room), 'two seats at one address are one player\'s worth');
        $this->assertNotSame('', (string) $room['seats'][1]['addr'], 'the join passed the address');

        $this->assertSame(200, $this->call('join', ['code' => $host['code'], 'initials' => 'oth'], ['REMOTE_ADDR' => '203.0.113.10'], self::FREE)[0]);
        $room = $this->stored($host['code']);
        $this->assertSame(2 * $turn, room_idle_limit($room), 'a second address earns a turn each');
    }
}
