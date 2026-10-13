<?php
// games/tankity/test/php/ScoresEndpointTest.php
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

/* scores.php as a request reaches it: the boards in the shape the page reads,
   the first request converting the old per-callsign rows so /scores never
   reads empty, and no score taken on a browser's word. Every refusal of the
   handler itself is in ScoresApiTest. */
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

    private const TOKEN = 'abcdefabcdefabcdefabcdefabcdef01';

    /** @return array{int, array} the status and the JSON answer */
    private function call(string $method, array $query = [], ?array $body = null, array $server = [], array $cookies = []): array
    {
        $script = 'register_shutdown_function(static function () { echo "\n", http_response_code(); });'
            . 'require ' . var_export(__DIR__ . '/scores-stdin.php', true) . ';'
            . '$_SERVER = ' . var_export($server + ['CONTENT_TYPE' => 'application/json', 'REMOTE_ADDR' => '203.0.113.9'], true) . ' + $_SERVER;'
            . '$_SERVER["REQUEST_METHOD"] = ' . var_export($method, true) . '; $_GET = ' . var_export($query, true) . ';'
            . '$_COOKIE = ' . var_export($cookies, true) . ';'
            . 'require ' . var_export(dirname(__DIR__, 2) . '/scores.php', true) . ';';
        $proc = proc_open([PHP_BINARY, '-r', $script],
            [0 => ['pipe', 'r'], 1 => ['pipe', 'w'], 2 => ['pipe', 'w']], $pipes, null, ['TANKITY_DATA_DIR' => $this->dir] + getenv());
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

    /** A same-site browser request carrying its CSRF pair. */
    private function browser(array $server = []): array
    {
        return [$server + ['HTTP_HOST' => 'www.cs.siue.edu', 'HTTP_ORIGIN' => 'https://www.cs.siue.edu', 'HTTP_X_TANKITY_CSRF' => self::TOKEN],
            ['tankity_csrf' => self::TOKEN]];
    }

    public function testTheConvertedLegacyCallsignsAppearOnTheNormalBoard(): void
    {
        foreach ([['wmg', 900], ['bob', 700], ['test', 300], ['test2', 200]] as $i => [$slug, $score]) {
            legacy_write(tankity_db(), $slug, ['runs' => [['score' => $score, 'banked' => $i, 'won' => false, 'seed' => 's', 'ts' => '2026-01-0' . ($i + 1) . 'T00:00:00+00:00']]]);
        }
        [$status, $out] = $this->call('GET');
        $this->assertSame(200, $status);
        $this->assertSame('normal', $out['difficulty']);
        $this->assertSame(['WMG', 'BOB', 'TES', 'TES'], array_column($out['scores'], 'name'));
        $this->assertSame([900, 700, 300, 200], array_column($out['scores'], 'best'));
        $this->assertSame([0, 1, 2, 3], array_column($out['scores'], 'banked'));
        $this->assertSame(false, $out['scores'][0]['won']);
        $this->assertSame([false, false, false, false], array_column($out['scores'], 'standin'));
        $this->assertArrayNotHasKey('seed', $out['scores'][0]);
        $this->assertSame(BOARD_KEEP, $out['keep']);
        $this->assertMatchesRegularExpression('/^[a-f0-9]{32}$/', $out['csrf'], 'a first visit is handed a CSRF token');
    }

    public function testEachDifficultyHasItsOwnBoard(): void
    {
        board_file(['difficulty' => 'hard', 'initials' => 'ABC', 'score' => 50, 'rounds' => 1, 'seed' => 's', 'source' => 'solo']);
        $this->assertSame(['ABC'], array_column($this->call('GET', ['difficulty' => 'hard'])[1]['scores'], 'name'));
        $this->assertSame([], $this->call('GET')[1]['scores']);
        [$status, $out] = $this->call('GET', ['difficulty' => 'nightmare']);
        $this->assertSame(422, $status);
        $this->assertArrayHasKey('error', $out);
    }

    public function testABareScoreReportIsRefusedAndFilesNothing(): void
    {
        $report = ['name' => 'zzz', 'score' => 999999, 'banked' => 9, 'difficulty' => 'hard', 'seed' => 's'];
        $this->assertSame([403, ['error' => 'forbidden']], $this->call('POST', [], $report), 'no CSRF pair');
        [$server, $cookies] = $this->browser();
        $this->assertSame([400, ['error' => 'invalid json']], $this->call('POST', [], $report, $server, $cookies), 'a CSRF pair, but no run');
        $this->assertSame([], board_top('hard', 10));
    }

    public function testACrossSiteOriginIsRefused(): void
    {
        [$server, $cookies] = $this->browser(['HTTP_ORIGIN' => 'https://evil.example']);
        $this->assertSame(403, $this->call('POST', [], ['op' => 'start', 'seed' => 's', 'difficulty' => 'normal', 'w' => 720], $server, $cookies)[0]);
        [$server, $cookies] = $this->browser();
        [$status, $out] = $this->call('POST', [], ['op' => 'start', 'seed' => 's', 'difficulty' => 'normal', 'w' => 720], $server, $cookies);
        $this->assertSame(200, $status, json_encode($out));
        $this->assertMatchesRegularExpression('/^[a-f0-9]{32}$/', $out['run']);
    }

    public function testANonJsonContentTypeIsRefused(): void
    {
        [$server, $cookies] = $this->browser(['CONTENT_TYPE' => 'text/plain']);
        $this->assertSame(403, $this->call('POST', [], ['op' => 'start', 'seed' => 's', 'difficulty' => 'normal', 'w' => 720], $server, $cookies)[0]);
        $this->assertSame(0, (int) tankity_db()->query('SELECT COUNT(*) FROM solo_runs')->fetchColumn());
    }
}
