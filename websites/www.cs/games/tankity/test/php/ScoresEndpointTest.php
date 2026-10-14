<?php
// games/tankity/test/php/ScoresEndpointTest.php
declare(strict_types=1);

use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

/* scores.php as a request reaches it: the online boards (room matches) in the
   shape the page reads, and every POST answered 410 (solo scores stay in the browser)
   before the body, the database or any rate store is touched. */
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

    public function testTheNormalBoardInThePagesShape(): void
    {
        foreach ([['WMG', 900], ['BOB', 700], ['TES', 300], ['TES', 200]] as $i => [$who, $score]) {
            board_file(['difficulty' => 'normal', 'initials' => $who, 'score' => $score, 'rounds' => $i, 'seed' => 'room:ABCD', 'source' => 'room']);
        }
        [$status, $out] = $this->call('GET');
        $this->assertSame(200, $status);
        $this->assertSame('normal', $out['difficulty']);
        $this->assertSame(['WMG', 'BOB', 'TES', 'TES'], array_column($out['scores'], 'name'));
        $this->assertSame([900, 700, 300, 200], array_column($out['scores'], 'best'));
        $this->assertSame([0, 1, 2, 3], array_column($out['scores'], 'banked'));
        $this->assertSame(false, $out['scores'][0]['won']);
        $this->assertSame(['name', 'best', 'banked', 'won', 'place', 'at'], array_keys($out['scores'][0]), 'no seed, no stand-in flag');
        $this->assertSame(BOARD_KEEP, $out['keep']);
        $this->assertSame(['difficulty', 'scores', 'keep'], array_keys($out), 'no CSRF token: nothing is posted');
    }

    public function testEachDifficultyHasItsOwnBoard(): void
    {
        board_file(['difficulty' => 'hard', 'initials' => 'ABC', 'score' => 50, 'rounds' => 1, 'seed' => 'room:ABCD', 'source' => 'room']);
        $this->assertSame(['ABC'], array_column($this->call('GET', ['difficulty' => 'hard'])[1]['scores'], 'name'));
        $this->assertSame([], $this->call('GET')[1]['scores']);
        [$status, $out] = $this->call('GET', ['difficulty' => 'nightmare']);
        $this->assertSame(422, $status);
        $this->assertArrayHasKey('error', $out);
    }

    /** @return iterable<string, array{?array, array, array}> */
    public static function posts(): iterable
    {
        $same = ['HTTP_HOST' => 'www.cs.siue.edu', 'HTTP_ORIGIN' => 'https://www.cs.siue.edu', 'HTTP_X_TANKITY_CSRF' => self::TOKEN];
        $csrf = ['tankity_csrf' => self::TOKEN];
        yield 'the trusting POST main\'s page sends' => [['name' => 'zzz', 'score' => 999999, 'banked' => 9, 'difficulty' => 'hard', 'seed' => 's'], [], []];
        yield 'a solo run start, CSRF pair and all' => [['op' => 'start', 'seed' => 's', 'difficulty' => 'normal', 'w' => 720], $same, $csrf];
        yield 'an empty body' => [null, [], []];
        yield 'a cross-site page' => [['name' => 'zzz', 'score' => 5], ['HTTP_ORIGIN' => 'https://evil.example'] + $same, $csrf];
        yield 'not JSON' => [['name' => 'zzz', 'score' => 5], ['CONTENT_TYPE' => 'text/plain'], []];
    }

    #[DataProvider('posts')]
    public function testEveryPostIsGoneAndFilesNothing(?array $body, array $server, array $cookies): void
    {
        board_file(['difficulty' => 'hard', 'initials' => 'RUM', 'score' => 10, 'rounds' => 1, 'seed' => 'room:ABCD', 'source' => 'room']);
        $before = tankity_db()->query('SELECT * FROM board')->fetchAll(PDO::FETCH_ASSOC);
        $this->assertSame([410, ['error' => 'solo scores now stay in this browser']], $this->call('POST', [], $body, $server, $cookies));
        $this->assertSame($before, tankity_db()->query('SELECT * FROM board')->fetchAll(PDO::FETCH_ASSOC));
        $this->assertSame(0, (int) tankity_db()->query('SELECT COUNT(*) FROM rate')->fetchColumn(), 'no allowance is spent');
        $this->assertFileDoesNotExist($this->dir . '/' . TANKITY_GUARD_RUNS, 'the guard keeps nothing for it');
    }

    public function testOtherMethodsAreNotAllowed(): void
    {
        $this->assertSame([405, ['error' => 'method not allowed']], $this->call('PUT'));
    }
}
