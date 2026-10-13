<?php
// games/tankity/test/php/ScoresEndpointTest.php
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

/* scores.php serves the boards in the shape the page reads, and the first
   request converts the old per-callsign rows so /scores never reads empty. */
final class ScoresEndpointTest extends TestCase
{
    private string $dir;

    public static function setUpBeforeClass(): void
    {
        require_once __DIR__ . '/rooms-lib.php';
    }

    protected function setUp(): void
    {
        $this->dir = tankity_test_dir();
    }

    protected function tearDown(): void
    {
        tankity_test_rm($this->dir);
    }

    /** @return array{int, array} the status and the JSON answer */
    private function call(string $method, array $query = [], ?array $body = null, array $server = [], array $env = []): array
    {
        $script = 'register_shutdown_function(static function () { echo "\n", http_response_code(); });'
            . 'require ' . var_export(__DIR__ . '/scores-stdin.php', true) . ';'
            . '$_SERVER = ' . var_export($server + ['CONTENT_TYPE' => 'application/json', 'REMOTE_ADDR' => '203.0.113.9'], true) . ' + $_SERVER;'
            . '$_SERVER["REQUEST_METHOD"] = ' . var_export($method, true) . '; $_GET = ' . var_export($query, true) . ';'
            . 'require ' . var_export(dirname(__DIR__, 2) . '/scores.php', true) . ';';
        $proc = proc_open([PHP_BINARY, '-r', $script],
            [0 => ['pipe', 'r'], 1 => ['pipe', 'w'], 2 => ['pipe', 'w']], $pipes, null, $env + ['TANKITY_DATA_DIR' => $this->dir] + getenv());
        fwrite($pipes[0], $body === null ? '' : json_encode($body));
        fclose($pipes[0]);
        $out = stream_get_contents($pipes[1]);
        fclose($pipes[1]);
        fclose($pipes[2]);
        proc_close($proc);
        [$json, $status] = array_pad(explode("\n", rtrim($out), 2), 2, '');
        $status = (int) trim($status);
        return [$status, json_decode($json, true) ?? ['raw' => $out]];
    }

    public function testTheConvertedLegacyCallsignsAppearOnTheNormalBoard(): void
    {
        foreach ([['wmg', 900], ['bob', 700], ['test', 300], ['test2', 200]] as $i => [$slug, $score]) {
            legacy_write(tankity_db(), $slug, ['runs' => [['score' => $score, 'banked' => $i, 'won' => false, 'seed' => 's', 'ts' => '2026-01-0' . ($i + 1) . 'T00:00:00+00:00']]]);
        }
        [, $out] = $this->call('GET');
        $this->assertSame('normal', $out['difficulty']);
        $this->assertSame(['WMG', 'BOB', 'TES', 'TES'], array_column($out['scores'], 'name'));
        $this->assertSame([900, 700, 300, 200], array_column($out['scores'], 'best'));
        $this->assertSame([0, 1, 2, 3], array_column($out['scores'], 'banked'));
        $this->assertSame(false, $out['scores'][0]['won']);
    }

    public function testEachDifficultyHasItsOwnBoard(): void
    {
        $this->call('POST', [], ['name' => 'abc', 'score' => 50, 'banked' => 1, 'difficulty' => 'hard']);
        $this->assertSame(['ABC'], array_column($this->call('GET', ['difficulty' => 'hard'])[1]['scores'], 'name'));
        $this->assertSame([], $this->call('GET')[1]['scores']);
        $this->assertArrayHasKey('error', $this->call('GET', ['difficulty' => 'nightmare'])[1]);
    }

    public function testAPostFilesOnNormalByDefaultAndAnswersItsPlace(): void
    {
        [, $out] = $this->call('POST', [], ['name' => 'tankity', 'score' => 120, 'banked' => 2]);
        $this->assertSame(['ok' => true, 'name' => 'TAN', 'best' => 120, 'place' => 1], $out);
        $this->assertSame([120], array_column($this->call('GET')[1]['scores'], 'best'));
    }

    public function testAnInvalidRunIsRefused(): void
    {
        $this->assertArrayHasKey('error', $this->call('POST', [], ['name' => '', 'score' => 1, 'banked' => 0])[1]);
    }

    public function testACrossSiteOriginIsRefused(): void
    {
        [$st] = $this->call('POST', [], ['name' => 'abc', 'score' => 1, 'banked' => 0], ['HTTP_ORIGIN' => 'https://evil.example', 'HTTP_HOST' => 'www.cs.siue.edu']);
        $this->assertSame(403, $st);
        $this->assertSame([], board_top('normal', 10));
        [$st] = $this->call('POST', [], ['name' => 'abc', 'score' => 1, 'banked' => 0], ['HTTP_ORIGIN' => 'https://www.cs.siue.edu', 'HTTP_HOST' => 'www.cs.siue.edu']);
        $this->assertSame(200, $st);
    }

    public function testANonJsonContentTypeIsRefused(): void
    {
        [$st] = $this->call('POST', [], ['name' => 'abc', 'score' => 1, 'banked' => 0], ['CONTENT_TYPE' => 'text/plain']);
        $this->assertSame(415, $st);
        $this->assertSame([], board_top('normal', 10));
    }

    public function testAForgedRoomSeedIsRefused(): void
    {
        foreach (['room:ABCD', ' ROOM:ABCD'] as $seed) {
            [$st] = $this->call('POST', [], ['name' => 'zzz', 'score' => 999999, 'banked' => 9, 'difficulty' => 'hard', 'seed' => $seed]);
            $this->assertSame(400, $st, $seed);
        }
        $this->assertSame([], board_top('hard', 10));
    }

    public function testPostsAreThrottledPerAddress(): void
    {
        $env = ['TANKITY_SCORES_PER_HOUR' => '2'];
        $run = ['name' => 'abc', 'score' => 1, 'banked' => 0];
        $this->assertSame(200, $this->call('POST', [], $run, [], $env)[0]);
        $this->assertSame(200, $this->call('POST', [], $run, [], $env)[0]);
        $this->assertSame(429, $this->call('POST', [], $run, [], $env)[0]);
        $this->assertSame(200, $this->call('POST', [], $run, ['REMOTE_ADDR' => '203.0.113.77'], $env)[0], 'another address has its own allowance');
        $this->assertCount(3, board_top('normal', 10));
    }

    public function testClientRowsNeverEvictRoomRows(): void
    {
        $room = board_file(['difficulty' => 'normal', 'initials' => 'WIN', 'score' => 5, 'rounds' => 1, 'seed' => 'room:REAL']);
        $this->assertSame(1, $room);
        for ($i = 0; $i < BOARD_KEEP + 1; $i++) {
            board_file(['difficulty' => 'normal', 'initials' => 'ZZZ', 'score' => 999999, 'rounds' => 9, 'seed' => '', 'source' => 'client']);
        }
        $seeds = array_column(board_top('normal', 1000), 'seed');
        $this->assertContains('room:REAL', $seeds, 'the room-filed row survives 101 better client rows');
        $this->assertCount(BOARD_KEEP + 1, board_top('normal', 1000), 'each source keeps its own best BOARD_KEEP');
        $this->assertSame('ZZZ', board_top('normal', 1)[0]['initials'], 'the view still ranks both together');
    }
}
