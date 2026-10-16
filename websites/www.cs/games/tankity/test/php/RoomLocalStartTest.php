<?php
// games/tankity/test/php/RoomLocalStartTest.php
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

require_once __DIR__ . '/RoomCallTrait.php';

/* A match needs a referee only when two or more humans play it. Start with
   the host alone closes the lobby and answers `local`: the browser plays the
   match itself, like solo, and the server keeps no slot and no lobby for it.
   An old bundle that cannot play it locally is told to reload instead. */
final class RoomLocalStartTest extends TestCase
{
    use RoomCallTrait;

    private string $dir;

    private const ENV = ['TANKITY_ROOM_LIVE_SECS' => '600', 'TANKITY_ROOM_JOINS_PER_HOUR' => '1000',
        'TANKITY_ROOM_HOSTS_PER_ADDRESS' => '4', 'TANKITY_LOBBIES_PER_ADDRESS' => '4'];

    private const RELOAD = ['error' => 'Tankity was updated. Reload the page to keep playing.', 'reload' => true];

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

    /** @return array the host's create answer */
    private function host(array $body = [], string $addr = '203.0.113.1'): array
    {
        [$st, $host] = $this->call('create', $body + ['initials' => 'hst'], ['REMOTE_ADDR' => $addr], self::ENV);
        $this->assertSame(200, $st, json_encode($host));
        return $host;
    }

    private function seated(array $host): array
    {
        return ['code' => $host['code'], 'token' => $host['token'], 'csrf' => $host['csrf']];
    }

    /** @return array{int, array} the host's Start */
    private function start(array $host, array $extra = [], string $addr = '203.0.113.1'): array
    {
        return $this->call('start', $extra + $this->seated($host), ['REMOTE_ADDR' => $addr], self::ENV);
    }

    /** @return array{int, int} started matches and open lobbies, as ping reports them */
    private function used(): array
    {
        [$st, $ping] = $this->call('ping', [], [], self::ENV);
        $this->assertSame(200, $st);
        return [$ping['rooms']['used'], $ping['lobbies']['used']];
    }

    private function exists(string $code): bool
    {
        $q = tankity_db()->prepare('SELECT COUNT(*) FROM rooms WHERE code = ?');
        $q->execute([$code]);
        return (int) $q->fetchColumn() === 1;
    }

    private function tombstones(): int
    {
        return (int) tankity_db()->query('SELECT COUNT(*) FROM closed')->fetchColumn();
    }

    public function testAOneHumanStartPlaysLocally(): void
    {
        $host = $this->host(['difficulty' => 'hard']);
        $this->gap();
        [$st, $out] = $this->call('speed', $this->seated($host) + ['speed' => 2], [], self::ENV);
        $this->assertSame(200, $st, json_encode($out));
        $this->gap();
        [$st, $out] = $this->call('walls', $this->seated($host) + ['walls' => 'rubber'], [], self::ENV);
        $this->assertSame(200, $st, json_encode($out));
        $this->gap();
        $this->assertSame([200, ['ok' => true, 'local' => ['difficulty' => 'hard', 'speed' => 2, 'walls' => 'rubber']]], $this->start($host, ['proto' => 2]));
        $this->assertFalse($this->exists($host['code']), 'the lobby is closed');
        $this->assertSame(0, $this->tombstones(), 'the host closed it: nobody is told it was closed to make space');
        $this->assertSame([0, 0], $this->used());
        $this->assertSame([404, ['error' => 'no such room']],
            $this->call('state', ['code' => $host['code'], 'token' => $host['token']], [], self::ENV));
    }

    /* A lobby with every other seat open still plays locally: the browser
       fields solo's three drones, whatever the lobby's seats were. */
    public function testALoneHostWithOpenSeatsStillPlaysLocally(): void
    {
        $host = $this->host();
        for ($i = 1; $i < ROOM_SEATS; $i++) {
            $this->gap();
            [$st, $out] = $this->call('seatmode', $this->seated($host) + ['seat' => $i, 'mode' => 'open'], [], self::ENV);
            $this->assertSame(200, $st, json_encode($out));
        }
        $this->gap();
        $this->assertSame([200, ['ok' => true, 'local' => ['difficulty' => 'normal', 'speed' => 1, 'walls' => 'none']]], $this->start($host, ['proto' => 2]));
        $this->assertFalse($this->exists($host['code']));
    }

    public function testAnOldBundleStartingAloneIsToldToReload(): void
    {
        $host = $this->host();
        $this->gap();
        $this->assertSame([426, self::RELOAD], $this->start($host));
        $this->assertSame('lobby', $this->stored($host['code'])['phase'], 'the lobby is left as it was');
        $this->assertSame([0, 1], $this->used());
        $this->gap();
        $this->assertSame([426, self::RELOAD], $this->start($host, ['proto' => 1]), 'only this protocol plays locally');
        $this->assertTrue($this->exists($host['code']));
    }

    /* A local Start keeps every gate a server Start has. */
    public function testALocalStartKeepsItsGates(): void
    {
        $host = $this->host();
        [, $guest] = $this->call('join', ['code' => $host['code'], 'initials' => 'gst'], ['REMOTE_ADDR' => '203.0.113.2'], self::ENV);
        $this->gap();
        [$st] = $this->call('leave', $this->seated($guest), ['REMOTE_ADDR' => '203.0.113.2'], self::ENV);
        $this->assertSame(200, $st);
        $this->gap();
        $this->assertSame(403, $this->call('start', $this->seated($host) + ['proto' => 2],
            ['REMOTE_ADDR' => '203.0.113.1', 'HTTP_ORIGIN' => 'https://evil.example'], self::ENV)[0], 'origin');
        $this->assertSame(403, $this->start($host, ['proto' => 2, 'csrf' => 'nope'])[0], 'csrf');
        $this->assertSame(404, $this->start(['token' => str_repeat('ab', 32)] + $host, ['proto' => 2])[0], 'seat token');
        $this->assertTrue($this->exists($host['code']), 'no refused Start closed the lobby');
        $this->gap();
        $this->assertSame(200, $this->start($host, ['proto' => 2])[0], 'the guest left, so the host is alone');
        $this->assertFalse($this->exists($host['code']));
    }

    public function testAGuestCannotStartTheLobbyLocally(): void
    {
        $host = $this->host();
        [$st, $guest] = $this->call('join', ['code' => $host['code'], 'initials' => 'gst'], ['REMOTE_ADDR' => '203.0.113.2'], self::ENV);
        $this->assertSame(200, $st);
        $this->gap();
        $this->assertSame([403, ['error' => 'only the host starts the match']],
            $this->call('start', $this->seated($guest) + ['proto' => 2], ['REMOTE_ADDR' => '203.0.113.2'], self::ENV));
        $this->assertTrue($this->exists($host['code']));
    }

    public function testTwoHumansFromOneAddressTakeASlot(): void
    {
        $host = $this->host();
        [$st, $guest] = $this->call('join', ['code' => $host['code'], 'initials' => 'gst'], ['REMOTE_ADDR' => '203.0.113.1'], self::ENV);
        $this->assertSame(200, $st, json_encode($guest));
        $this->gap();
        [$st, $out] = $this->start($host, ['proto' => 2]);
        $this->assertSame(200, $st, json_encode($out));
        $this->assertSame('play', $out['room']['phase']);
        $this->assertArrayNotHasKey('local', $out);
        $this->assertSame([1, 0], $this->used());
    }

    public function testTwoHumansWithoutProtoStillStart(): void
    {
        $host = $this->host();
        [$st] = $this->call('join', ['code' => $host['code'], 'initials' => 'gst'], ['REMOTE_ADDR' => '203.0.113.2'], self::ENV);
        $this->assertSame(200, $st);
        $this->gap();
        [$st, $out] = $this->start($host);
        $this->assertSame(200, $st, json_encode($out));
        $this->assertSame('play', $out['room']['phase']);
        $this->assertSame([1, 0], $this->used());
    }
}
