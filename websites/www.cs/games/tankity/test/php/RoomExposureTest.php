<?php
// games/tankity/test/php/RoomExposureTest.php
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

require_once __DIR__ . '/RoomCallTrait.php';

/* What a request without a seat can learn or cost. A code is found only by
   joining (the join puzzle and the allowance): `state` and every seated act
   answer a stranger exactly as they answer a code nobody holds, and they
   answer before the write lock. A host's setting that changes nothing, or
   any setting once the match is under way, keeps no room alive. A Start or
   Play again whose save fails leaves everything as it was, and a create that
   names bad initials or hills is refused before anything is charged. */
final class RoomExposureTest extends TestCase
{
    use RoomCallTrait;

    private string $dir;

    private const ENV = ['TANKITY_ROOM_JOINS_PER_HOUR' => '1000', 'TANKITY_LOBBIES_PER_ADDRESS' => '4',
        'TANKITY_ROOM_HOSTS_PER_ADDRESS' => '4',
        'TANKITY_ROOM_LIVE_SECS' => '600', 'TANKITY_POW_BITS' => '2'];

    private const NONE = [404, ['error' => 'no such room']];
    private const HOST = ['REMOTE_ADDR' => '203.0.113.1'];
    private const GUEST = ['REMOTE_ADDR' => '203.0.113.2'];

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
        foreach (array_keys(self::ENV) as $k) {
            putenv($k);
        }
        tankity_test_rm($this->dir);
    }

    /** @return array{array, array} a lobby's host and a guest seated in it */
    private function pair(array $env = []): array
    {
        [$st, $host] = $this->call('create', ['initials' => 'hst'], self::HOST, $env + self::ENV);
        $this->assertSame(200, $st, json_encode($host));
        [$st, $guest] = $this->call('join', ['code' => $host['code'], 'initials' => 'gst'], self::GUEST, $env + self::ENV);
        $this->assertSame(200, $st, json_encode($guest));
        return [$host, $guest];
    }

    private function seat(array $who): array
    {
        return ['code' => $who['code'], 'token' => $who['token'], 'csrf' => $who['csrf']];
    }

    private function started(array $env = []): array
    {
        [$host, $guest] = $this->pair($env);
        $this->gap();
        [$st, $out] = $this->call('start', $this->seat($host), self::HOST, $env + self::ENV);
        $this->assertSame(200, $st, json_encode($out));
        return [$host, $guest];
    }

    private function charges(): int
    {
        return (int) tankity_db()->query("SELECT COALESCE(SUM(n), 0) FROM rate WHERE kind = 'room'")->fetchColumn();
    }

    private function exists(string $code): bool
    {
        $q = tankity_db()->prepare('SELECT COUNT(*) FROM rooms WHERE code = ?');
        $q->execute([$code]);
        return (int) $q->fetchColumn() === 1;
    }

    /* The stored row grown past what a save may write, so the next save of it fails. */
    private function bloat(string $code): void
    {
        $room = $this->stored($code) + ['pad' => str_repeat('x', ROOM_MAX_BYTES)];
        $q = tankity_db()->prepare('UPDATE rooms SET data = ? WHERE code = ?');
        $q->bindValue(1, serialize($room), PDO::PARAM_LOB);
        $q->bindValue(2, $code);
        $q->execute();
    }

    /* The stored room's last act moved back, so a stamp shows as a change. */
    private function ageActed(string $code, int $secs): int
    {
        [$room, $lock] = room_load($code);
        $room['acted'] = time() - $secs;
        $this->assertTrue(room_save($lock, $code, $room));
        room_unlock($lock);
        return $room['acted'];
    }

    public function testStateAnswersAStrangerAsIfNoRoomWereThere(): void
    {
        [$host] = $this->pair();
        $code = $host['code'];
        $this->assertSame(self::NONE, $this->raw('state', ['code' => 'ZZZZZZ'], self::GUEST));
        $this->assertSame(self::NONE, $this->raw('state', ['code' => $code], self::GUEST), 'a live lobby without a token');
        $this->assertSame(self::NONE, $this->raw('state', ['code' => $code, 'token' => str_repeat('ab', 32)], self::GUEST));
        [$st, $out] = $this->raw('state', ['code' => $code, 'token' => $host['token']], self::HOST);
        $this->assertSame(200, $st, json_encode($out));
        $this->gap();
        $this->assertSame(200, $this->call('start', $this->seat($host), self::HOST)[0]);
        $this->assertSame(self::NONE, $this->raw('state', ['code' => $code], self::GUEST), 'a started match without a token');
        $this->assertSame(self::NONE, $this->raw('state', ['code' => $code, 'token' => 'nope'], self::GUEST));
        $this->assertSame('play', $this->raw('state', ['code' => $code, 'token' => $host['token']], self::HOST)[1]['room']['phase']);
    }

    public function testAStatePollCarriesItsTokenInAHeaderNeverTheQuery(): void
    {
        [$host] = $this->pair();
        $q = ['action' => 'state', 'code' => $host['code'], 'since' => '0'];
        $this->assertSame(self::NONE, $this->get($q + ['token' => $host['token']], self::HOST), 'a token in the URL is not read');
        [$st, $out] = $this->get($q, self::HOST + ['HTTP_X_SEAT_TOKEN' => $host['token']]);
        $this->assertSame(200, $st, json_encode($out));
        $this->assertSame('lobby', $out['room']['phase']);
        $this->assertSame(self::NONE, $this->get($q, self::GUEST + ['HTTP_X_SEAT_TOKEN' => str_repeat('ab', 32)]));
    }

    public function testASeatedActAnswersABadTokenAsIfNoRoomWereThere(): void
    {
        [$host] = $this->pair();
        $acts = ['body', 'leave', 'act', 'buy', 'again', 'ready', 'turntime', 'speed', 'walls', 'map', 'seatmode', 'start'];
        foreach ($acts as $act) {
            // With and without an Origin: neither tells a live code from a made-up one.
            foreach ([[], ['HTTP_ORIGIN' => '']] as $origin) {
                $live = $this->raw($act, ['code' => $host['code'], 'token' => str_repeat('ab', 32), 'csrf' => $host['csrf']], self::GUEST + $origin);
                $made = $this->raw($act, ['code' => 'ZZZZZZ', 'token' => str_repeat('ab', 32), 'csrf' => $host['csrf']], self::GUEST + $origin);
                $this->assertSame(self::NONE, $live, "$act at a live code");
                $this->assertSame($made, $live, "$act at a made-up code");
                $this->assertSame(self::NONE, $this->raw($act, ['code' => $host['code']], self::GUEST + $origin), "$act without a token");
            }
        }
        $this->assertSame('lobby', $this->stored($host['code'])['phase'], 'nothing above touched the room');
    }

    public function testAStrangerIsAnsweredWithoutTheWriteLock(): void
    {
        [$host] = $this->started();
        // Another request holds the writer: a stranger's answer must not queue
        // behind it (the busy timeout would make it a 503).
        $other = new PDO('sqlite:' . tankity_data_dir() . '/' . TANKITY_DB_FILE, null, null, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
        $other->exec('BEGIN IMMEDIATE');
        try {
            $bad = ['code' => $host['code'], 'token' => str_repeat('ab', 32), 'csrf' => $host['csrf']];
            foreach (['body', 'leave', 'ready', 'act', 'state'] as $act) {
                $this->assertSame(self::NONE, $this->raw($act, $bad, self::GUEST), $act);
            }
            // A seat with the wrong room token is turned away before the lock too.
            $this->assertSame(403, $this->raw('body', ['csrf' => 'nope'] + $this->seat($host), self::HOST)[0]);
        } finally {
            $other->exec('ROLLBACK');
        }
    }

    public function testASettingThatChangesNothingKeepsNoRoomAlive(): void
    {
        [$host] = $this->pair();
        $code = $host['code'];
        $seat = $this->seat($host);
        // In the lobby a real change is playing; the same pick again is not.
        $old = $this->ageActed($code, 500);
        $this->gap();
        $this->assertSame(200, $this->call('turntime', $seat + ['secs' => room_turn_secs($this->stored($code))], self::HOST)[0]);
        $this->gap();
        $this->assertSame(200, $this->call('speed', $seat + ['speed' => room_speed($this->stored($code))], self::HOST)[0]);
        $this->gap();
        $this->assertSame(200, $this->call('walls', $seat + ['walls' => room_walls_setting($this->stored($code))], self::HOST)[0]);
        $this->gap();
        $this->assertSame(200, $this->call('map', $seat + ['map' => ''], self::HOST)[0]);
        $this->gap();
        $this->assertSame(200, $this->call('seatmode', $seat + ['seat' => 2, 'mode' => 'ai'], self::HOST)[0]);
        $this->assertSame($old, $this->stored($code)['acted'], 'an unchanged lobby setting');
        $this->gap();
        $this->assertSame(200, $this->call('turntime', $seat + ['secs' => 600], self::HOST)[0]);
        $this->assertGreaterThan($old, $this->stored($code)['acted'], 'a changed lobby setting');

        // Once the match is under way only a turn keeps it alive: the host's
        // turn time and speed, changed or not, never do.
        $this->gap();
        $this->assertSame(200, $this->call('start', $seat, self::HOST)[0]);
        $old = $this->ageActed($code, 500);
        foreach ([['turntime', ['secs' => 600]], ['turntime', ['secs' => 1800]], ['speed', ['speed' => 4]], ['speed', ['speed' => 4]]] as [$act, $ask]) {
            $this->gap();
            [$st, $out] = $this->call($act, $seat + $ask, self::HOST);
            $this->assertSame(200, $st, json_encode($out));
        }
        $room = $this->stored($code);
        $this->assertSame(1800, room_turn_secs($room), 'the change still applies');
        $this->assertSame(4, room_speed($room));
        $this->assertSame($old, $room['acted'], 'a mid-match setting is not a turn');
    }

    public function testAStartWhoseSaveFailsLeavesTheLobby(): void
    {
        [$host] = $this->pair([]);
        $this->bloat($host['code']);
        $this->gap();
        [$st, $out] = $this->call('start', $this->seat($host), self::HOST, self::ENV);
        $this->assertSame([500, ['error' => 'store write failed']], [$st, $out]);
        $this->assertSame('lobby', $this->stored($host['code'])['phase']);
    }

    public function testAPlayAgainWhoseSaveFailsChargesNothing(): void
    {
        [$host] = $this->started([]);
        [$room, $lock] = room_load($host['code']);
        $room['phase'] = 'over';
        $this->assertTrue(room_save($lock, $host['code'], $room));
        room_unlock($lock);
        $this->bloat($host['code']);
        $charged = $this->charges();
        $this->gap();
        [$st, $out] = $this->call('again', $this->seat($host), self::HOST, self::ENV);
        $this->assertSame([500, ['error' => 'store write failed']], [$st, $out]);
        $this->assertSame($charged, $this->charges(), 'nothing charged');
        $this->assertSame('over', $this->stored($host['code'])['phase']);
    }

    public function testACreateWithBadInitialsOrHillsIsRefusedUncharged(): void
    {
        $pow = $this->solve('create', self::HOST);
        $ask = ['proto' => ROOM_PROTO, 'pow' => $pow];
        [$st, $out] = $this->raw('create', $ask + ['initials' => 'x1'], self::HOST);
        $this->assertSame(422, $st, json_encode($out));
        [$st, $out] = $this->raw('create', $ask + ['initials' => 'hst', 'map' => 'no-such-hills'], self::HOST);
        $this->assertSame([422, ['error' => 'no such hills']], [$st, $out]);
        $this->assertSame(0, $this->charges(), 'no allowance spent');
        // The same puzzle still buys the room: it was not spent either.
        [$st, $out] = $this->raw('create', $ask + ['initials' => 'hst'], self::HOST);
        $this->assertSame(200, $st, json_encode($out));
        $this->assertSame(1, $this->charges());
    }

    public function testAJoinWithBadInitialsOrAMalformedCodeIsRefusedUncharged(): void
    {
        [$st, $host] = $this->call('create', ['initials' => 'hst'], self::HOST);
        $this->assertSame(200, $st);
        $charged = $this->charges();
        $pow = $this->solve('join', self::GUEST);
        $ask = ['proto' => ROOM_PROTO, 'pow' => $pow];
        $this->assertSame(422, $this->raw('join', $ask + ['code' => $host['code'], 'initials' => 'x1'], self::GUEST)[0]);
        $this->assertSame(422, $this->raw('join', $ask + ['code' => 'ABCDE', 'initials' => 'gst'], self::GUEST)[0]);
        $this->assertSame($charged, $this->charges());
        $this->assertSame(200, $this->raw('join', $ask + ['code' => $host['code'], 'initials' => 'gst'], self::GUEST)[0]);
    }
}
