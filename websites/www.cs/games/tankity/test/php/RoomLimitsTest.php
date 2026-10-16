<?php
// games/tankity/test/php/RoomLimitsTest.php
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

require_once __DIR__ . '/RoomCallTrait.php';

/* No server-wide count of rooms: lobbies and matches are rows, a quiet one
   costs nothing, and only the per-address limits and the disk guard
   (room_db_max_mb) refuse a create. The disk guard turns away a new lobby and
   nothing else, and never closes a room that is running. */
final class RoomLimitsTest extends TestCase
{
    use RoomCallTrait;

    private string $dir;

    private const ENV = ['TANKITY_LOBBIES_PER_ADDRESS' => '4', 'TANKITY_ROOM_JOINS_PER_HOUR' => '1000',
        'TANKITY_ROOM_HOSTS_PER_ADDRESS' => '4', 'TANKITY_ROOM_LIVE_SECS' => '600'];
    private const FULL = ['TANKITY_ROOM_DB_MAX_MB' => '1'] + self::ENV;
    private const REFUSED = [503, ['error' => 'The server is full. Try again later.']];

    public static function setUpBeforeClass(): void
    {
        require_once __DIR__ . '/rooms-lib.php';
    }

    protected function setUp(): void
    {
        $_SERVER = ['HTTP_HOST' => 'localhost', 'REMOTE_ADDR' => '198.51.100.7'];
        $this->dir = tankity_test_dir();
        foreach (self::ENV as $k => $v) {
            putenv("$k=$v");
        }
    }

    protected function tearDown(): void
    {
        room_release_all();
        foreach (array_keys(self::ENV + self::FULL) as $k) {
            putenv($k);
        }
        tankity_test_rm($this->dir);
    }

    /** @return array{int, array} a create from address 203.0.113.$n */
    private function createFrom(int $n, string $initials = 'hst', array $env = self::ENV): array
    {
        return $this->call('create', ['initials' => $initials], ['REMOTE_ADDR' => "203.0.113.$n"], $env);
    }

    private function charges(): int
    {
        return (int) tankity_db()->query("SELECT COALESCE(SUM(n), 0) FROM rate WHERE kind = 'room'")->fetchColumn();
    }

    private function rows(): int
    {
        return (int) tankity_db()->query('SELECT COUNT(*) FROM rooms')->fetchColumn();
    }

    /** Grows the database past one megabyte with a row nothing reads. */
    private function fillDisk(): void
    {
        tankity_db()->prepare("INSERT OR REPLACE INTO closed (code, reason, at, seats) VALUES ('PADD', 'pad', ?, ?)")
            ->execute([time(), str_repeat('a', 1100000)]);
    }

    /** Frees the padding the way a sweep does: the rows go, the file stays as big. */
    private function emptyDisk(): void
    {
        tankity_db()->exec("DELETE FROM closed WHERE code = 'PADD'");
    }

    /** A lobby row grown past one megabyte, expired or live. */
    private function padLobby(string $code, bool $expired): void
    {
        $now = time();
        $q = tankity_db()->prepare("INSERT INTO rooms (code, data, created, touched, expires, phase, acted) VALUES (?, ?, ?, ?, ?, 'lobby', ?)");
        $q->bindValue(1, $code);
        $q->bindValue(2, str_repeat('a', 1100000), PDO::PARAM_LOB);
        $q->bindValue(3, $now - 5000);
        $q->bindValue(4, $now - 5000);
        $q->bindValue(5, $expired ? $now - 1 : $now + 600);
        $q->bindValue(6, $now - 5000);
        $q->execute();
    }

    public function testNoCountCapsRoomsServerWide(): void
    {
        // Twenty addresses, four lobbies each: eighty lobbies, none refused.
        for ($a = 1; $a <= 20; $a++) {
            for ($i = 0; $i < 4; $i++) {
                [$st, $made] = $this->createFrom($a);
                $this->assertSame(200, $st, json_encode($made));
            }
        }
        $this->assertSame(80, $this->rows());
        [$st, $ping] = $this->call('ping', [], [], self::ENV);
        $this->assertSame(200, $st);
        $this->assertSame(['used' => 0], $ping['rooms']);
        $this->assertSame(['used' => 80], $ping['lobbies']);
    }

    public function testFourLobbiesPerAddress(): void
    {
        for ($i = 0; $i < 4; $i++) {
            $this->assertSame(200, $this->createFrom(1)[0]);
        }
        $charged = $this->charges();
        $this->assertSame([429, ['error' => 'too many lobbies open from here; start or leave one first']], $this->createFrom(1));
        $this->assertSame($charged, $this->charges(), 'answered before anything is charged');
        $this->assertSame(200, $this->createFrom(2)[0], 'another address opens its own');
    }

    public function testTheLobbyLimitFollowsTheSetting(): void
    {
        $env = ['TANKITY_LOBBIES_PER_ADDRESS' => '2'] + self::ENV;
        $this->assertSame(200, $this->createFrom(1, 'hst', $env)[0]);
        $this->assertSame(200, $this->createFrom(1, 'hst', $env)[0]);
        $this->assertSame(429, $this->createFrom(1, 'hst', $env)[0]);
        $this->assertSame(200, $this->createFrom(1, 'hst', self::ENV)[0], 'the default is four');
    }

    public function testAnIdleLobbyGivesBackItsAddressPlace(): void
    {
        for ($i = 0; $i < 4; $i++) {
            [$st, $made] = $this->createFrom(1);
            $this->assertSame(200, $st);
        }
        $this->assertSame(429, $this->createFrom(1)[0]);
        room_test_age($made['code'], 700);
        $this->assertSame(200, $this->createFrom(1)[0], 'an expired lobby no longer counts');
    }

    /** @return array{array, array} a started two-human match hosted from 203.0.113.5 */
    private function startedMatch(): array
    {
        [$st, $host] = $this->createFrom(5);
        $this->assertSame(200, $st);
        [$st, $guest] = $this->call('join', ['code' => $host['code'], 'initials' => 'gst'], ['REMOTE_ADDR' => '203.0.113.6'], self::ENV);
        $this->assertSame(200, $st, json_encode($guest));
        $this->gap();
        $seat = ['code' => $host['code'], 'token' => $host['token'], 'csrf' => $host['csrf']];
        $this->assertSame(200, $this->call('start', $seat, ['REMOTE_ADDR' => '203.0.113.5'], self::ENV)[0]);
        return [$host, $guest];
    }

    private function finish(string $code): void
    {
        [$room, $lock] = room_load($code);
        $room['phase'] = 'over';
        $room['acted'] = time();
        room_save($lock, $code, $room);
        room_unlock($lock);
    }

    /* Play again revives a finished match as a lobby: the lobby its host's
       address then holds counts against lobbies_per_address like a create. */
    public function testPlayAgainCountsAgainstTheHostsLobbies(): void
    {
        [$host] = $this->startedMatch();
        $this->finish($host['code']);
        for ($i = 0; $i < 4; $i++) {
            $this->assertSame(200, $this->createFrom(5)[0]);
        }
        $this->gap();
        $seat = ['code' => $host['code'], 'token' => $host['token'], 'csrf' => $host['csrf']];
        $this->assertSame([429, ['error' => 'too many lobbies open from here; start or leave one first']],
            $this->call('again', $seat, ['REMOTE_ADDR' => '203.0.113.5'], self::ENV));
        $this->assertSame('over', $this->stored($host['code'])['phase']);
    }

    public function testAnAddressHostsFourMatches(): void
    {
        $env = ['TANKITY_LOBBIES_PER_ADDRESS' => '9'] + self::ENV;
        for ($i = 0; $i < 4; $i++) {
            [$st, $host] = $this->createFrom(5, 'hst', $env);
            $this->assertSame(200, $st);
            $this->assertSame(200, $this->call('join', ['code' => $host['code'], 'initials' => 'gst'], ['REMOTE_ADDR' => '203.0.113.6'], $env)[0]);
            $this->gap();
            $seat = ['code' => $host['code'], 'token' => $host['token'], 'csrf' => $host['csrf']];
            $this->assertSame(200, $this->call('start', $seat, ['REMOTE_ADDR' => '203.0.113.5'], $env)[0]);
        }
        [$st, $host] = $this->createFrom(5, 'hst', $env);
        $this->assertSame(200, $this->call('join', ['code' => $host['code'], 'initials' => 'gst'], ['REMOTE_ADDR' => '203.0.113.6'], $env)[0]);
        $this->gap();
        $seat = ['code' => $host['code'], 'token' => $host['token'], 'csrf' => $host['csrf']];
        $this->assertSame([429, ['error' => 'too many matches hosted from here; finish or leave one first']],
            $this->call('start', $seat, ['REMOTE_ADDR' => '203.0.113.5'], $env));
        $this->assertSame('lobby', $this->stored($host['code'])['phase']);
    }

    public function testTheDiskGuardIsOffUnderTheLimit(): void
    {
        $this->assertFalse(room_db_full());
        $this->assertSame(200, $this->createFrom(1, 'hst', self::FULL)[0]);
        $this->assertGreaterThan(0, room_db_bytes());
    }

    public function testTheDiskGuardCountsLiveDataNotFileSize(): void
    {
        putenv('TANKITY_ROOM_DB_MAX_MB=1');
        $this->assertSame(200, $this->createFrom(1)[0]);
        $path = tankity_data_dir() . '/' . TANKITY_DB_FILE;
        $this->assertFalse(room_db_full());
        $this->fillDisk();
        $this->assertGreaterThanOrEqual(1048576, room_db_bytes());
        $this->assertTrue(room_db_full());
        $this->emptyDisk();
        clearstatcache();
        $this->assertLessThan(1048576, room_db_bytes(), 'freed pages are not live data');
        $this->assertGreaterThanOrEqual(1048576, filesize($path) + (is_file($path . '-wal') ? filesize($path . '-wal') : 0),
            'while the file and its -wal stay as large as they grew');
        $this->assertFalse(room_db_full());
        putenv('TANKITY_ROOM_DB_MAX_MB');
        $this->assertSame(256, room_db_max_mb());
    }

    public function testCreatesComeBackAfterTheRowsGoWithoutAVacuum(): void
    {
        putenv('TANKITY_ROOM_DB_MAX_MB=1');
        $this->fillDisk();
        $this->assertSame(self::REFUSED, $this->createFrom(1, 'hst', self::FULL));
        $this->emptyDisk();
        $this->assertSame(200, $this->createFrom(1, 'hst', self::FULL)[0]);
    }

    public function testExpiredLobbiesAreSweptBeforeAnyoneIsRefused(): void
    {
        putenv('TANKITY_ROOM_DB_MAX_MB=1');
        $this->assertSame(200, $this->createFrom(1, 'hst', self::FULL)[0]);
        $this->padLobby('EXPD', true);
        $this->assertTrue(room_db_full());
        // Nobody has swept yet: the create does it, rechecks and goes through.
        $this->assertSame(200, $this->createFrom(2, 'two', self::FULL)[0]);
        $this->assertSame(0, (int) tankity_db()->query("SELECT COUNT(*) FROM rooms WHERE code = 'EXPD'")->fetchColumn());
        // A live lobby that big is not swept: the data is real, so the create is refused.
        $this->padLobby('LIVE', false);
        $this->assertSame(self::REFUSED, $this->createFrom(3, 'thr', self::FULL));
        $this->assertSame(1, (int) tankity_db()->query("SELECT COUNT(*) FROM rooms WHERE code = 'LIVE'")->fetchColumn(), 'a live room is never closed');
    }

    public function testAnIpv6PrefixSharesOneAddressLimit(): void
    {
        $from = fn(string $addr): array => $this->call('create', ['initials' => 'hst'], ['REMOTE_ADDR' => $addr], self::ENV);
        for ($i = 1; $i <= 4; $i++) {
            $this->assertSame(200, $from("2001:db8:1:2::$i")[0]);
        }
        $this->assertSame(429, $from('2001:db8:1:2:aaaa:bbbb:cccc:dddd')[0], 'the same /64 is one address');
        $this->assertSame(200, $from('2001:db8:1:3::1')[0], 'the next /64 is another');
    }

    public function testARequestBodyPastTheCapIsRefused(): void
    {
        [$st, $out] = $this->raw('create', ['initials' => 'hst', 'pad' => str_repeat('x', ROOM_BODY_MAX)], [], self::ENV);
        $this->assertSame([413, ['error' => 'request too large']], [$st, $out]);
        $this->assertSame(0, $this->rows());
    }

    public function testTheDiskGuardRefusesANewLobbyAtTheLimitUncharged(): void
    {
        putenv('TANKITY_ROOM_DB_MAX_MB=1');
        $this->assertSame(200, $this->createFrom(1, 'hst', self::FULL)[0]);
        $this->fillDisk();
        $this->assertTrue(room_db_full());
        $charged = $this->charges();
        $rows = $this->rows();
        $spent = (int) tankity_db()->query('SELECT COUNT(*) FROM pow_used')->fetchColumn();
        for ($i = 0; $i < 3; $i++) {
            $this->assertSame(self::REFUSED, $this->createFrom(2, 'two', self::FULL));
        }
        $this->assertSame($charged, $this->charges(), 'no allowance spent');
        $this->assertSame($rows, $this->rows(), 'no room made');
        $this->assertSame($spent, (int) tankity_db()->query('SELECT COUNT(*) FROM pow_used')->fetchColumn(), 'no puzzle consumed');
        // The same puzzle still buys the room once there is room again.
        $this->emptyDisk();
        $this->assertFalse(room_db_full());
        $this->assertSame(200, $this->createFrom(2, 'two', self::FULL)[0]);
    }

    public function testNothingRunningIsRefusedPastTheLimit(): void
    {
        [$host, $guest] = $this->startedMatch();
        [$st, $lobby] = $this->createFrom(7, 'lob');
        $this->assertSame(200, $st);
        $this->fillDisk();
        $before = $this->rows();

        // Join the lobby that was open before the disk filled.
        [$st, $joined] = $this->call('join', ['code' => $lobby['code'], 'initials' => 'gst'], ['REMOTE_ADDR' => '203.0.113.8'], self::FULL);
        $this->assertSame(200, $st, json_encode($joined));

        // Start it (the guest makes two humans, a drone makes the foe).
        $this->gap();
        $seat = ['code' => $lobby['code'], 'token' => $lobby['token'], 'csrf' => $lobby['csrf']];
        [$st, $out] = $this->call('start', $seat, ['REMOTE_ADDR' => '203.0.113.7'], self::FULL);
        $this->assertSame(200, $st, json_encode($out));
        $this->assertSame('play', $this->stored($lobby['code'])['phase']);

        // A turn in the match that was already running.
        $this->gap();
        $moved = false;
        foreach ([$host, $guest] as $who) {
            [$st] = $this->call('act', ['code' => $host['code'], 'token' => $who['token'], 'csrf' => $who['csrf'], 'kind' => 'aim', 'angle' => 60, 'power' => 50], [], self::FULL);
            $moved = $moved || $st === 200;
        }
        $this->assertTrue($moved, 'the seat on turn aims');

        // Play again on a finished match.
        $this->finish($host['code']);
        $this->gap();
        $again = ['code' => $host['code'], 'token' => $host['token'], 'csrf' => $host['csrf']];
        $this->assertSame(200, $this->call('again', $again, ['REMOTE_ADDR' => '203.0.113.5'], self::FULL)[0]);
        $this->assertSame('lobby', $this->stored($host['code'])['phase']);

        $this->assertSame($before, $this->rows(), 'no room was closed to make room');
        $this->assertSame(self::REFUSED, $this->createFrom(9, 'new', self::FULL), 'only a new lobby is turned away');
    }
}
