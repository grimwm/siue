<?php
// games/tankity/test/php/RoomGuardTest.php
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

require_once __DIR__ . '/RoomCallTrait.php';

/* Rooms use the score guard's rules: initials typed in either case are stored
   uppercase, and only allowed origins may post. Creating and joining a room
   share one hourly allowance per address, counted in the database's rate
   table (server/rate.php). */
final class RoomGuardTest extends TestCase
{
    use RoomCallTrait;

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

    public function testACreateRefusedForABusyLobbyPoolIsNotCharged(): void
    {
        // A lab clicking Host while every lobby is busy keeps its allowance for the moment one frees.
        $env = ['TANKITY_MAX_LOBBIES' => '1'];
        [$st, $host] = $this->call('create', ['initials' => 'hst'], [], $env);
        $this->assertSame(200, $st, json_encode($host));
        for ($i = 0; $i < 3; $i++) {
            [$st, $out] = $this->call('create', ['initials' => 'two'], ['REMOTE_ADDR' => '203.0.113.10'], $env);
            $this->assertSame([409, ['error' => 'Every lobby is busy. Try again in a minute.']], [$st, $out]);
        }
        $this->assertSame(1, $this->roomCharges(), 'only the create that made a room was charged');
        // Everything else is still charged: a join refused for a bad code costs one.
        $this->assertSame(422, $this->call('join', ['code' => '??', 'initials' => 'gst'], [], $env)[0]);
        $this->assertSame(2, $this->roomCharges());
    }

    /* The docker stacks lift both limits; these tests want the host's. */
    private const FREE = ['TANKITY_ROOM_JOINS_PER_HOUR' => '1000', 'TANKITY_ROOM_HOSTS_PER_ADDRESS' => '4', 'TANKITY_LOBBIES_PER_ADDRESS' => '4'];

    public function testAnAddressOpensFourLobbiesAndNoMore(): void
    {
        for ($i = 0; $i < 4; $i++) {
            [$st, $out] = $this->call('create', ['initials' => 'hst'], [], self::FREE);
            $this->assertSame(200, $st, json_encode($out));
            $this->assertNotSame('', (string) tankity_db()->query('SELECT host FROM rooms WHERE code = ' . tankity_db()->quote($out['code']))->fetchColumn(),
                'the host column carries the address, or the cap would never count the room');
        }
        [$st, $out] = $this->call('create', ['initials' => 'hst'], [], self::FREE);
        $this->assertSame([429, ['error' => 'too many lobbies open from here; start or leave one first']], [$st, $out]);
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
        $this->assertSame(2 * $turn, room_idle_limit($room), 'two seats at one address earn a turn each');
        $this->assertNotSame('', (string) $room['seats'][1]['addr'], 'the join passed the address');
    }

    /** @return array{array, array, string} the host's and the guest's seats in a started two-human match, and its code */
    private function startedPair(): array
    {
        [$st, $host] = $this->call('create', ['initials' => 'hst'], ['REMOTE_ADDR' => '203.0.113.1'], self::FREE);
        $this->assertSame(200, $st, json_encode($host));
        [$st, $guest] = $this->call('join', ['code' => $host['code'], 'initials' => 'gst'], ['REMOTE_ADDR' => '203.0.113.2'], self::FREE);
        $this->assertSame(200, $st, json_encode($guest));
        $this->gap();
        [$st, $out] = $this->call('start', ['code' => $host['code'], 'token' => $host['token'], 'csrf' => $host['csrf']],
            ['REMOTE_ADDR' => '203.0.113.1'], self::FREE);
        $this->assertSame(200, $st, json_encode($out));
        return [$host, $guest, $host['code']];
    }

    /** @return array{array, array} the seat whose turn it is, then the other human */
    private function byTurn(array $host, array $guest, string $code): array
    {
        $room = $this->stored($code);
        $turnSeat = $room['tanks'][$room['turn']]['seat'] ?? -1;
        $this->assertContains($turnSeat, [$host['seat'], $guest['seat']], 'a human is up after Start');
        return $turnSeat === $host['seat'] ? [$host, $guest] : [$guest, $host];
    }

    private function actedColumn(string $code): int
    {
        return (int) tankity_db()->query('SELECT acted FROM rooms WHERE code = ' . tankity_db()->quote($code))->fetchColumn();
    }

    /* A6: requests that move nothing (the menu flag, a new look) cost nothing
       and must not keep a held room "active". Only a turn-moving act does. */
    public function testMenuAndBodyDoNotKeepARoomAlive(): void
    {
        [$host, $guest, $code] = $this->startedPair();
        room_test_age($code, 500);
        $acted = $this->actedColumn($code);
        $this->assertSame($acted, room_acted($this->stored($code)));
        [$up] = $this->byTurn($host, $guest, $code);
        $seat = ['code' => $code, 'token' => $up['token'], 'csrf' => $up['csrf']];
        $this->assertSame(200, $this->call('act', $seat + ['kind' => 'menu', 'open' => true], [], self::FREE)[0]);
        $this->gap();
        $this->assertSame(200, $this->call('body', $seat + ['body' => 'walker'], [], self::FREE)[0]);
        $this->assertSame($acted, $this->actedColumn($code), 'menu and body leave acted');
        $this->assertSame($acted, room_acted($this->stored($code)));
        $this->gap();
        [$st, $out] = $this->call('act', $seat + ['kind' => 'aim', 'angle' => 60, 'power' => 50], [], self::FREE);
        $this->assertSame(200, $st, json_encode($out));
        $this->assertEqualsWithDelta(time(), $this->actedColumn($code), 1, 'an aim on one\'s own turn stamps it');
        $this->assertEqualsWithDelta(time(), room_acted($this->stored($code)), 1);
    }

    public function testAnOffTurnWeaponDoesNotStamp(): void
    {
        [$host, $guest, $code] = $this->startedPair();
        room_test_age($code, 500);
        $acted = $this->actedColumn($code);
        [$up, $off] = $this->byTurn($host, $guest, $code);
        [$st, $out] = $this->call('act', ['code' => $code, 'token' => $off['token'], 'csrf' => $off['csrf'], 'kind' => 'weapon', 'weapon' => 'shell'],
            [], self::FREE);
        $this->assertSame(200, $st, json_encode($out));
        $this->assertSame($acted, $this->actedColumn($code), 'loading a gun off one\'s turn moves nothing');
        $this->gap();
        [$st, $out] = $this->call('act', ['code' => $code, 'token' => $up['token'], 'csrf' => $up['csrf'], 'kind' => 'weapon', 'weapon' => 'shell'],
            [], self::FREE);
        $this->assertSame(200, $st, json_encode($out));
        $this->assertEqualsWithDelta(time(), $this->actedColumn($code), 1, 'the player who is up loading a gun stamps it');
    }

    public function testTheHostingPlaceFollowsTheHostWhenTheHostLeaves(): void
    {
        [$st, $host] = $this->call('create', ['initials' => 'hst'], ['REMOTE_ADDR' => '203.0.113.1'], self::FREE);
        $this->assertSame(200, $st, json_encode($host));
        [$st, $guest] = $this->call('join', ['code' => $host['code'], 'initials' => 'gst'], ['REMOTE_ADDR' => '203.0.113.2'], self::FREE);
        $this->assertSame(200, $st, json_encode($guest));
        $room = $this->stored($host['code']);
        $hostAddr = (string) $room['seats'][0]['addr'];
        $guestAddr = (string) $room['seats'][1]['addr'];
        $this->assertSame(1, room_hosted($hostAddr));
        // In a running match the host leaving passes the role on (in a lobby it closes the room).
        $this->gap();
        $this->assertSame(200, $this->call('start', ['code' => $host['code'], 'token' => $host['token'], 'csrf' => $host['csrf']],
            ['REMOTE_ADDR' => '203.0.113.1'], self::FREE)[0]);
        $this->gap();
        $this->assertSame(200, $this->call('leave', ['code' => $host['code'], 'token' => $host['token'], 'csrf' => $host['csrf']],
            ['REMOTE_ADDR' => '203.0.113.1'], self::FREE)[0]);
        $this->assertSame(0, room_hosted($hostAddr), 'the leaver hosts nothing now');
        $this->assertSame(1, room_hosted($guestAddr), 'the new host carries the room');
    }

    public function testAPlayPollThatHasNothingDueDoesNotSave(): void
    {
        [$st, $host] = $this->call('create', ['initials' => 'hst'], [], self::FREE);
        $this->assertSame(200, $st);
        $start = ['code' => $host['code'], 'token' => $host['token'], 'csrf' => $host['csrf']];
        $this->gap();
        $this->assertSame(200, $this->call('start', $start, [], self::FREE)[0]);
        $touched = fn(): int => (int) tankity_db()->query('SELECT touched FROM rooms WHERE code = ' . tankity_db()->quote($host['code']))->fetchColumn();
        // Push the stored touch back so any save shows as a change.
        tankity_db()->exec('UPDATE rooms SET touched = touched - 100 WHERE code = ' . tankity_db()->quote($host['code']));
        $before = $touched();
        [$st, $out] = $this->call('state', ['code' => $host['code'], 'token' => $host['token']], [], self::FREE);
        $this->assertSame(200, $st, json_encode($out));
        $this->assertSame('play', $out['room']['phase']);
        $this->assertSame($before, $touched(), 'a plain play poll is a read');
        // A turn that ran out is due: the next poll applies it under the lock and saves.
        [$room, $lock] = room_load($host['code']);
        $room['clock']['at'] -= 10_000;
        room_save($lock, $host['code'], $room);
        room_unlock($lock);
        tankity_db()->exec('UPDATE rooms SET touched = touched - 100 WHERE code = ' . tankity_db()->quote($host['code']));
        $before = $touched();
        [$st, $out] = $this->call('state', ['code' => $host['code'], 'token' => $host['token'], 'since' => 0], [], self::FREE);
        $this->assertSame(200, $st);
        $this->assertNotSame($before, $touched(), 'a due timeout is applied and saved');
        $this->assertContains('auto', array_column($out['room']['events'], 't'));
    }

    public function testTurnTimeIsThrottledLikeOtherActs(): void
    {
        [$st, $host] = $this->call('create', ['initials' => 'hst'], [], self::FREE);
        $this->assertSame(200, $st);
        $set = static fn(int $secs): array => ['code' => $host['code'], 'token' => $host['token'], 'csrf' => $host['csrf'], 'secs' => $secs];
        $this->gap();
        $this->assertSame(200, $this->call('turntime', $set(600), [], self::FREE)[0]);
        // Mark the last act as now, then ask again at once.
        [$room, $lock] = room_load($host['code']);
        $room['seats'][0]['lastAct'] = microtime(true);
        room_save($lock, $host['code'], $room);
        room_unlock($lock);
        $this->assertSame(429, $this->call('turntime', $set(1800), [], self::FREE)[0]);
    }

    public function testTheAddressKeyIsReadBeforeItIsEverWritten(): void
    {
        $key = tankity_addr_key();
        tankity_db()->exec("CREATE TRIGGER no_key_write BEFORE INSERT ON meta WHEN NEW.k = 'addr_key' BEGIN SELECT RAISE(ABORT, 'addr_key written again'); END");
        $this->assertSame($key, tankity_addr_key(), 'an existing key is read, never inserted over');
    }

    public function testAddressHashesAreKeyedPerInstall(): void
    {
        $_SERVER['REMOTE_ADDR'] = '203.0.113.77';
        $a = room_client_hash();
        $this->assertSame($a, room_client_hash(), 'stable within an install');
        $this->assertNotSame(substr(hash('sha256', 'tankity-addr|' . tankity_guard()->clientKey()), 0, 16), $a,
            'not the unkeyed hash anyone could rebuild from the address');
        $other = tankity_test_dir();
        putenv('TANKITY_DATA_DIR=' . $other);
        try {
            $this->assertNotSame($a, room_client_hash(), 'another install keys it differently');
        } finally {
            putenv('TANKITY_DATA_DIR=' . $this->dir);
            tankity_test_rm($other);
        }
    }
}
