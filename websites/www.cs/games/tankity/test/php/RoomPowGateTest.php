<?php
// games/tankity/test/php/RoomPowGateTest.php
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

require_once __DIR__ . '/RoomCallTrait.php';

/* Create and join pay the room puzzle, checked in a fixed order before
   anything is charged or looked up: the protocol (426), the puzzle's format,
   MAC, age and work (403 or 422), a replay (409), then the hourly allowance
   (429). A join's work is checked before its code is looked up, so a guess
   without work learns nothing. Codes are six characters; four-character rooms
   made before keep working. */
final class RoomPowGateTest extends TestCase
{
    use RoomCallTrait;

    private string $dir;

    private const ENV = ['TANKITY_ROOM_JOINS_PER_HOUR' => '1000', 'TANKITY_LOBBIES_PER_ADDRESS' => '4',
        'TANKITY_ROOM_LIVE_SECS' => '600', 'TANKITY_POW_BITS' => '2'];

    private const RELOAD = ['error' => 'Tankity was updated. Reload the page to keep playing.', 'reload' => true];
    private const SHORT = ['error' => 'That puzzle is not finished.', 'puzzle' => 'puzzle-short'];
    private const BAD = ['error' => 'That puzzle is not one of ours.', 'puzzle' => 'puzzle-bad'];
    private const SPENT = ['error' => 'That puzzle was already used.', 'puzzle' => 'puzzle-spent'];
    private const EXPIRED = ['error' => 'That puzzle ran out of time.', 'puzzle' => 'puzzle-expired'];

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

    private const HOST = ['REMOTE_ADDR' => '203.0.113.1'];
    private const GUEST = ['REMOTE_ADDR' => '203.0.113.2'];

    /** Creates and joins charged against the hourly allowance, every address together. */
    private function charges(): int
    {
        return (int) tankity_db()->query("SELECT COALESCE(SUM(n), 0) FROM rate WHERE kind = 'room'")->fetchColumn();
    }

    /** @return array the host's create answer, the puzzle solved as the bundle solves it */
    private function lobby(): array
    {
        [$st, $host] = $this->call('create', ['initials' => 'hst'], self::HOST, self::ENV);
        $this->assertSame(200, $st, json_encode($host));
        return $host;
    }

    private function joinBody(string $code, string $initials = 'gst', array $server = self::GUEST, array $env = self::ENV): array
    {
        return ['proto' => ROOM_PROTO, 'code' => $code, 'initials' => $initials, 'pow' => $this->solve('join', $server, $env)];
    }

    public function testOldBundlesAreToldToReload(): void
    {
        $host = $this->lobby();
        $before = $this->charges();
        $this->assertSame([426, self::RELOAD], $this->raw('create', ['initials' => 'old'], self::HOST, self::ENV));
        $this->assertSame([426, self::RELOAD], $this->raw('join', ['code' => $host['code'], 'initials' => 'old'], self::GUEST, self::ENV));
        // A solved puzzle without the protocol is still an old bundle's request.
        $this->assertSame([426, self::RELOAD], $this->raw('create', ['initials' => 'old', 'pow' => $this->solve('create', self::HOST, self::ENV)], self::HOST, self::ENV));
        $this->assertSame($before, $this->charges(), 'nothing charged');
    }

    public function testCreateNeedsASolvedPuzzle(): void
    {
        $this->assertSame([422, self::SHORT], $this->raw('create', ['proto' => ROOM_PROTO, 'initials' => 'hst'], self::HOST, self::ENV));
        $this->assertSame(0, $this->charges());
        $pow = $this->solve('create', self::HOST, self::ENV);
        [$st, $made] = $this->raw('create', ['proto' => ROOM_PROTO, 'initials' => 'hst', 'pow' => $pow], self::HOST, self::ENV);
        $this->assertSame(200, $st, json_encode($made));
        $this->assertSame(1, $this->charges());
        // A join puzzle spent on a create: the purpose is inside the MAC.
        $join = $this->solve('join', self::HOST, self::ENV);
        $this->assertSame([403, self::BAD], $this->raw('create', ['proto' => ROOM_PROTO, 'initials' => 'two', 'pow' => $join], self::HOST, self::ENV));
        $this->assertSame(1, $this->charges(), 'a refused puzzle is uncharged');
    }

    public function testAReplayedPuzzleIsRefusedAndUncharged(): void
    {
        $pow = $this->solve('create', self::HOST, self::ENV);
        $this->assertSame(200, $this->raw('create', ['proto' => ROOM_PROTO, 'initials' => 'hst', 'pow' => $pow], self::HOST, self::ENV)[0]);
        $charged = $this->charges();
        $this->assertSame([409, self::SPENT], $this->raw('create', ['proto' => ROOM_PROTO, 'initials' => 'two', 'pow' => $pow], self::HOST, self::ENV));
        $this->assertSame($charged, $this->charges(), 'the replay is uncharged');
        $this->assertSame(1, (int) tankity_db()->query("SELECT COUNT(*) FROM rooms")->fetchColumn(), 'and made no room');
        // A join puzzle spent on a guess that missed is spent all the same: one
        // solved puzzle never buys a second guess.
        $host = $this->lobby();
        $guess = $this->joinBody('ZZZZZZ');
        $this->assertSame(404, $this->raw('join', $guess, self::GUEST, self::ENV)[0]);
        $this->assertSame([409, self::SPENT], $this->raw('join', ['code' => $host['code']] + $guess, self::GUEST, self::ENV));
    }

    public function testAnOldPuzzleIsRefused(): void
    {
        // Solved now, redeemed POW_TTL + 1 seconds later by the server's clock.
        $pow = $this->solve('create', self::HOST, self::ENV);
        $issued = (int) explode('.', $pow['c'])[1];
        $later = self::ENV + ['TANKITY_TEST_CLOCK' => '1', 'TANKITY_TEST_NOW' => (string) ($issued + POW_TTL + 1)];
        $this->assertSame([403, self::EXPIRED], $this->raw('create', ['proto' => ROOM_PROTO, 'initials' => 'hst', 'pow' => $pow], self::HOST, $later));
        $this->assertSame(0, $this->charges());
        // The variable alone moves nothing: only with TANKITY_TEST_CLOCK=1 does the server read it.
        $ignored = self::ENV + ['TANKITY_TEST_NOW' => (string) ($issued + POW_TTL + 1)];
        $this->assertSame(200, $this->raw('create', ['proto' => ROOM_PROTO, 'initials' => 'hst', 'pow' => $pow], self::HOST, $ignored)[0]);
    }

    public function testAPuzzleFromAnotherAddressIsRefused(): void
    {
        // Asked for from one address, redeemed from another (a stockpile shared
        // between machines): the address hash is inside the MAC.
        $pow = $this->solve('create', self::HOST, self::ENV);
        $this->assertSame([403, self::BAD], $this->raw('create', ['proto' => ROOM_PROTO, 'initials' => 'hst', 'pow' => $pow], self::GUEST, self::ENV));
        $host = $this->lobby();
        $join = $this->joinBody($host['code'], 'gst', self::GUEST);
        $this->assertSame([403, self::BAD], $this->raw('join', $join, ['REMOTE_ADDR' => '203.0.113.3'], self::ENV));
        $this->assertSame(1, $this->charges(), 'only the real create was charged');
        $this->assertSame(200, $this->raw('join', $join, self::GUEST, self::ENV)[0], 'the asker itself still gets in');
    }

    public function testAGuessWithoutWorkLearnsNothing(): void
    {
        $host = $this->lobby();
        $real = $this->raw('join', ['proto' => ROOM_PROTO, 'code' => $host['code'], 'initials' => 'gst'], self::GUEST, self::ENV);
        $made = $this->raw('join', ['proto' => ROOM_PROTO, 'code' => 'QQQQQQ', 'initials' => 'gst'], self::GUEST, self::ENV);
        $odd = $this->raw('join', ['proto' => ROOM_PROTO, 'code' => '??', 'initials' => 'gst'], self::GUEST, self::ENV);
        $this->assertSame([422, self::SHORT], $real);
        $this->assertSame($real, $made, 'a live code and a made-up one answer the same');
        $this->assertSame($real, $odd, 'so does a malformed one');
        $this->assertSame(1, $this->charges(), 'unsolved guesses cost the address nothing and the server one read');
        // With the work done, the code is looked up.
        $this->assertSame([404, ['error' => 'no such room']], $this->raw('join', $this->joinBody('QQQQQQ'), self::GUEST, self::ENV));
        [$st, $in] = $this->raw('join', $this->joinBody($host['code']), self::GUEST, self::ENV);
        $this->assertSame(200, $st, json_encode($in));
        // The hourly allowance still counts every solved guess: three an hour here.
        $env = ['TANKITY_ROOM_JOINS_PER_HOUR' => '3'] + self::ENV;
        $guesser = ['REMOTE_ADDR' => '203.0.113.50'];
        for ($i = 0; $i < 3; $i++) {
            $this->assertSame(404, $this->raw('join', $this->joinBody('QQQQQ' . $i, 'gss', $guesser, $env), $guesser, $env)[0]);
        }
        $this->assertSame([429, ['error' => 'too many rooms from here; try again later']],
            $this->raw('join', $this->joinBody('QQQQQ9', 'gss', $guesser, $env), $guesser, $env));
    }

    public function testCodesAreSixCharactersAndOldOnesStillWork(): void
    {
        $host = $this->lobby();
        $this->assertMatchesRegularExpression('/^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{6}$/', $host['code']);
        // A room made before codes grew: four characters, inserted as it was.
        $lock = room_alloc(fn() => 'WXYZ');
        $room = room_new('WXYZ', 'OLD');
        $room['seats'][0] = room_seat_human('OLD', 'old-token', [], '');
        for ($i = 1; $i < ROOM_SEATS; $i++) {
            $room['seats'][$i] = room_idle_seat($i);
        }
        $this->assertTrue(room_save($lock, 'WXYZ', $room));
        room_unlock($lock);
        [$st, $in] = $this->call('join', ['code' => 'wxyz', 'initials' => 'gst'], self::GUEST, self::ENV);
        $this->assertSame(200, $st, json_encode($in));
        $this->assertSame('WXYZ', $in['code']);
        // A code read back with a space or a hyphen, in any case.
        $spaced = strtolower(substr($host['code'], 0, 3)) . ' - ' . substr($host['code'], 3);
        [$st, $in] = $this->call('join', ['code' => $spaced, 'initials' => 'gst'], self::GUEST, self::ENV);
        $this->assertSame(200, $st, json_encode($in));
        $this->assertSame($host['code'], $in['code']);
        // state reads both lengths, and the gated acts and mine take the six.
        foreach ([['WXYZ', 'old-token'], [$host['code'], $host['token']]] as [$code, $token]) {
            $this->assertSame(200, $this->raw('state', ['code' => $code, 'token' => $token], self::GUEST, self::ENV)[0], $code);
        }
        [$st, $mine] = $this->raw('mine', ['seats' => [['code' => strtolower($host['code']), 'token' => $host['token']]]], self::HOST, self::ENV);
        $this->assertSame(200, $st);
        $this->assertSame($host['code'], $mine['rooms'][0]['code']);
        $this->assertFalse($mine['rooms'][0]['gone']);
        $this->assertSame(200, $this->raw('body', ['code' => $host['code'], 'token' => $host['token'], 'csrf' => $host['csrf'], 'body' => 'tank'], self::HOST, self::ENV)[0]);
        // Five characters is neither.
        $this->assertSame(422, $this->raw('state', ['code' => 'ABCDE'], self::GUEST, self::ENV)[0]);
        [$st, $out] = $this->call('join', ['code' => 'ABCDE', 'initials' => 'gst'], self::GUEST, self::ENV);
        $this->assertSame([422, ['error' => 'need a 6-character room code and clean 3-letter initials']], [$st, $out]);
    }

    public function testChallengeIsCheapAndUncharged(): void
    {
        $env = self::ENV;
        for ($i = 0; $i < 50; $i++) {
            [$st, $ch] = $this->raw('challenge', ['for' => $i % 2 ? 'join' : 'create'], self::HOST, $env);
            $this->assertSame(200, $st);
        }
        $this->assertSame(0, (int) tankity_db()->query('SELECT COUNT(*) FROM rate')->fetchColumn(), 'nothing counted');
        $this->assertSame(['ok' => true, 'bits' => 2, 'count' => POW_COUNT, 'iter' => POW_ITER, 'expiresIn' => POW_TTL],
            array_diff_key($ch, ['challenge' => 1]));
        $this->assertSame(422, $this->raw('challenge', ['for' => 'start'], self::HOST, $env)[0]);
        $this->assertSame(422, $this->raw('challenge', [], self::HOST, $env)[0]);
        // Lobbies open make it no harder.
        for ($i = 0; $i < 3; $i++) {
            $this->assertSame(200, $this->call('create', ['initials' => 'hst'], ['REMOTE_ADDR' => "203.0.113.1$i"], $env)[0]);
        }
        $this->assertSame(2, $this->raw('challenge', ['for' => 'join'], self::HOST, $env)[1]['bits']);
        $this->assertSame(3, $this->raw('challenge', ['for' => 'create'], self::HOST, $env)[1]['bits']);
    }
}
