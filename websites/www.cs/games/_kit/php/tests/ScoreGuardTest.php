<?php
// The kit's score gate: config, initials, origin, CSRF, run tokens and rate limits.
declare(strict_types=1);

require_once dirname(__DIR__) . '/score-guard.php';

use Kit\ScoreGuard;
use Kit\StoreModes;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

final class ScoreGuardTest extends TestCase
{
    private const CONFIG = [
        'runTtlSec' => 600, 'startsPerHour' => 3, 'scoresPerHour' => 2,
        'csrfCookie' => 'test_csrf', 'storageKey' => 'test',
        'blockedInitials' => ['ASS', 'kkk', 'ASS'], 'allowedHosts' => ['WWW.cs.siue.edu'],
    ];
    private const IP = '203.0.113.7';

    private string $runs;
    private int $now = 1_800_000_000;
    /** @var list<array{string, string, array<string, mixed>}> */
    private array $cookiesSet = [];

    protected function setUp(): void
    {
        $this->runs = sys_get_temp_dir() . '/score-guard-' . bin2hex(random_bytes(4)) . '.json';
    }

    protected function tearDown(): void
    {
        @unlink($this->runs);
    }

    /** @param array<string, mixed> $server @param array<string, mixed> $cookies @param array<string, mixed> $config */
    private function guard(array $server = [], array $cookies = [], array $config = []): ScoreGuard
    {
        return new ScoreGuard(
            ScoreGuard::validateConfig($config + self::CONFIG),
            'X-Test-CSRF',
            'test-salt',
            $server + ['HTTP_HOST' => 'game.test', 'REMOTE_ADDR' => self::IP],
            $cookies,
            $this->runs,
            fn(): int => $this->now,
            function (string $name, string $value, array $options): void { $this->cookiesSet[] = [$name, $value, $options]; },
        );
    }

    public function testConfigIsValidatedAndNormalised(): void
    {
        $c = ScoreGuard::validateConfig(self::CONFIG + ['somethingElse' => 1]);
        $this->assertSame(['ASS', 'KKK'], $c['blockedInitials']);
        $this->assertSame(['www.cs.siue.edu'], $c['allowedHosts']);
        $this->assertSame(ScoreGuard::CONFIG_KEYS, array_keys($c));
    }

    /** @return array<string, array{array<string, mixed>, string}> */
    public static function badConfigs(): array
    {
        $without = self::CONFIG;
        unset($without['runTtlSec']);
        return [
            'missing key' => [$without, 'missing config keys: runTtlSec'],
            'ttl too short' => [['runTtlSec' => 59] + self::CONFIG, 'config runTtlSec must be an integer from 60 to 86400'],
            'starts as text' => [['startsPerHour' => '3'] + self::CONFIG, 'config startsPerHour must be an integer from 1 to 10000'],
            'bad cookie name' => [['csrfCookie' => 'bad-name!'] + self::CONFIG, 'config csrfCookie has an invalid value'],
            'empty storage key' => [['storageKey' => ''] + self::CONFIG, 'config storageKey has an invalid value'],
            'blocked not a list' => [['blockedInitials' => 'ASS'] + self::CONFIG, 'config blockedInitials must be a list'],
            'blocked two letters' => [['blockedInitials' => ['AS']] + self::CONFIG, 'config blockedInitials entries must be 3 letters'],
            'bad host' => [['allowedHosts' => ['bad host']] + self::CONFIG, 'config allowedHosts has an invalid host'],
        ];
    }

    /** @param array<string, mixed> $config */
    #[DataProvider('badConfigs')]
    public function testConfigRejects(array $config, string $message): void
    {
        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage($message);
        ScoreGuard::validateConfig($config);
    }

    public function testInitialsAreThreeLettersInEitherCase(): void
    {
        $this->assertSame('ABC', ScoreGuard::initials('abc'));
        $this->assertSame('ABC', ScoreGuard::initials('AbC'));
        foreach (['ab', 'abcd', 'a1c', ' abc', '', 'ÄBC'] as $bad) {
            $this->assertNull(ScoreGuard::initials($bad), $bad);
        }
        foreach ([123, null, ['abc'], true] as $bad) {
            $this->assertNull(ScoreGuard::initials($bad));
        }
    }

    public function testCoercingKeepsLettersThenCutsOrPads(): void
    {
        $this->assertSame('ABX', ScoreGuard::coerceInitials('ab', 'X'));
        $this->assertSame('ABC', ScoreGuard::coerceInitials('a1b2c3d', 'X'));
        $this->assertSame('XXX', ScoreGuard::coerceInitials('', 'X'));
        $this->assertSame('AAA', ScoreGuard::coerceInitials(null, 'A'));
        $this->assertSame('ZED', ScoreGuard::coerceInitials('Zed', 'A'));
        $this->expectException(InvalidArgumentException::class);
        ScoreGuard::coerceInitials('ab', 'xy');
    }

    public function testBlockedInitialsIgnoreCase(): void
    {
        $g = $this->guard();
        $this->assertTrue($g->isBlocked('ass'));
        $this->assertTrue($g->isBlocked('KKK'));
        $this->assertFalse($g->isBlocked('ABC'));
    }

    /** @return array<string, array{array<string, string>, bool}> */
    public static function origins(): array
    {
        return [
            'own host' => [['HTTP_ORIGIN' => 'https://game.test'], true],
            'own host, other port' => [['HTTP_ORIGIN' => 'http://game.test:8080'], true],
            'own host behind a port' => [['HTTP_HOST' => 'game.test:8443', 'HTTP_ORIGIN' => 'https://game.test'], true],
            'allowed host' => [['HTTP_ORIGIN' => 'https://www.cs.siue.edu'], true],
            'foreign origin' => [['HTTP_ORIGIN' => 'https://evil.example'], false],
            'opaque origin' => [['HTTP_ORIGIN' => 'null'], false],
            'referer when no origin' => [['HTTP_REFERER' => 'https://game.test/games/cylon/'], true],
            'foreign referer' => [['HTTP_REFERER' => 'https://evil.example/x'], false],
            'origin wins over referer' => [['HTTP_ORIGIN' => 'https://evil.example', 'HTTP_REFERER' => 'https://game.test/'], false],
            'neither, with the header' => [['HTTP_X_TEST_CSRF' => 'x'], true],
            'neither, no header' => [[], false],
        ];
    }

    /** @param array<string, string> $server */
    #[DataProvider('origins')]
    public function testOriginAllowList(array $server, bool $allowed): void
    {
        $this->assertSame($allowed, $this->guard($server)->originAllowed());
    }

    public function testCsrfNeedsTheCookieAndAnEqualHeader(): void
    {
        $token = str_repeat('ab', 16);
        $this->assertTrue($this->guard(['HTTP_X_TEST_CSRF' => $token], ['test_csrf' => $token])->csrfOk());
        $this->assertFalse($this->guard(['HTTP_X_TEST_CSRF' => str_repeat('cd', 16)], ['test_csrf' => $token])->csrfOk());
        $this->assertFalse($this->guard([], ['test_csrf' => $token])->csrfOk());
        $this->assertFalse($this->guard(['HTTP_X_TEST_CSRF' => 'abc'], ['test_csrf' => 'abc'])->csrfOk());
        $this->assertFalse($this->guard(['HTTP_X_TEST_CSRF' => $token])->csrfOk());
    }

    public function testATokenCookieIsReusedNotReissued(): void
    {
        $token = str_repeat('ab', 16);
        $this->assertSame($token, $this->guard([], ['test_csrf' => $token])->csrfToken());
        $this->assertSame([], $this->cookiesSet);
    }

    public function testANewTokenIsAStrictHttpOnlyCookieScopedToTheGame(): void
    {
        $g = $this->guard(['SCRIPT_NAME' => '/games/test/scores.php', 'HTTPS' => 'on'], ['test_csrf' => 'not-a-token']);
        $token = $g->csrfToken();
        $this->assertMatchesRegularExpression('/^[a-f0-9]{32}$/', $token);
        $this->assertSame([['test_csrf', $token, [
            'expires' => $this->now + 7 * 86400, 'path' => '/games/test', 'secure' => true, 'httponly' => true, 'samesite' => 'Strict',
        ]]], $this->cookiesSet);
        $this->assertSame($token, $g->csrfToken(), 'the same request keeps the token it set');
    }

    public function testAPlainHttpRequestGetsANonSecureCookieAtTheRoot(): void
    {
        $this->guard(['SCRIPT_NAME' => '/scores.php'])->csrfToken();
        $this->assertSame('/', $this->cookiesSet[0][2]['path']);
        $this->assertFalse($this->cookiesSet[0][2]['secure']);
    }

    public function testATrailingNewlineIsNotInitialsOrAToken(): void
    {
        $this->assertNull(ScoreGuard::initials("abc\n"));
        $this->assertNull(ScoreGuard::initials("ass\n"), 'a blocked word must not slip past as ASS plus a newline');
        $this->assertFalse($this->guard()->isBlocked('ABC'));
        $token = str_repeat('ab', 16);
        $g = $this->guard(['HTTP_X_TEST_CSRF' => "$token\n"], ['test_csrf' => "$token\n"]);
        $this->assertFalse($g->csrfOk());
        $fresh = $g->csrfToken();
        $this->assertNotSame("$token\n", $fresh);
        $this->assertMatchesRegularExpression('/\A[a-f0-9]{32}\z/', $fresh);
        $this->assertCount(1, $this->cookiesSet);
    }

    public function testAPostWithNoOriginNorRefererNeedsTheCsrfPair(): void
    {
        $bare = $this->guard();
        $this->assertFalse($bare->originAllowed() && $bare->csrfOk());
        $headerOnly = $this->guard(['HTTP_X_TEST_CSRF' => str_repeat('ab', 16)]);
        $this->assertTrue($headerOnly->originAllowed(), 'the origin check alone lets a header-bearing request through');
        $this->assertFalse($headerOnly->csrfOk(), 'without the matching cookie the CSRF check refuses it');
    }

    public function testConfigRejectsANewlineSuffix(): void
    {
        foreach ([['csrfCookie' => "ok\n"], ['storageKey' => "ok\n"], ['allowedHosts' => ["a.test\n"]]] as $bad) {
            try {
                ScoreGuard::validateConfig($bad + self::CONFIG);
                $this->fail('accepted ' . json_encode($bad));
            } catch (RuntimeException) {
                $this->addToAssertionCount(1);
            }
        }
    }

    public function testARunTokenIsSpentOnce(): void
    {
        $g = $this->guard();
        $run = $g->startRun();
        $this->assertMatchesRegularExpression('/^[a-f0-9]{32}$/', (string) $run);
        $this->assertNull($g->consumeRun((string) $run));
        $this->assertSame('invalid run', $g->consumeRun((string) $run));
    }

    public function testAnExpiredTokenIsRefused(): void
    {
        $run = (string) $this->guard()->startRun();
        $this->now += 601;
        $this->assertSame('invalid run', $this->guard()->consumeRun($run));
    }

    public function testUnknownAndMalformedTokensAreRefused(): void
    {
        $this->assertSame('invalid run', $this->guard()->consumeRun(str_repeat('0', 32)));
        $this->assertSame('invalid run', $this->guard()->consumeRun('not-a-token'));
        $this->assertSame('invalid run', $this->guard()->consumeRun(''));
    }

    public function testAnImplausibleScoreKeepsItsTokenUnspent(): void
    {
        $run = (string) $this->guard()->startRun();
        $this->now += 42;
        $seen = [];
        $this->assertSame('score rejected', $this->guard()->consumeRun($run, function (int $elapsed) use (&$seen): bool { $seen[] = $elapsed; return false; }));
        $this->assertSame([42], $seen);
        $this->assertNull($this->guard()->consumeRun($run, fn(int $elapsed): bool => true));
    }

    public function testStartsAreLimitedPerHourPerClient(): void
    {
        for ($i = 0; $i < 3; $i++) {
            $this->assertNotNull($this->guard()->startRun());
        }
        $this->assertNull($this->guard()->startRun());
        $this->assertNotNull($this->guard(['REMOTE_ADDR' => '198.51.100.9'])->startRun(), 'another client has its own budget');
        $this->now += 3601;
        $this->assertNotNull($this->guard()->startRun(), 'an hour later the budget is back');
    }

    public function testScoresAreLimitedPerHour(): void
    {
        $runs = [];
        for ($i = 0; $i < 3; $i++) {
            $runs[] = (string) $this->guard()->startRun();
        }
        $this->assertNull($this->guard()->consumeRun($runs[0]));
        $this->assertNull($this->guard()->consumeRun($runs[1]));
        $this->assertSame('rate', $this->guard()->consumeRun($runs[2]));
    }

    public function testAnIpv6BlockSharesOneBucketAndIpv4IsUnchanged(): void
    {
        $a = $this->guard(['REMOTE_ADDR' => '2001:db8:1:2::1']);
        $b = $this->guard(['REMOTE_ADDR' => '2001:db8:1:2:ffff:aaaa:bbbb:cccc']);
        $other = $this->guard(['REMOTE_ADDR' => '2001:db8:1:3::1']);
        $this->assertSame($a->clientKey(), $b->clientKey());
        $this->assertNotSame($a->clientKey(), $other->clientKey());
        $this->assertSame(substr(hash_hmac('sha256', '198.51.100.9', 'test-salt'), 0, 24), $this->guard(['REMOTE_ADDR' => '198.51.100.9'])->clientKey());
        $this->assertSame(substr(hash_hmac('sha256', 'garbage:x', 'test-salt'), 0, 24), $this->guard(['REMOTE_ADDR' => 'garbage:x'])->clientKey());
    }

    public function testTheStoreHoldsTheKeyedHashNeverTheAddress(): void
    {
        $g = $this->guard();
        $g->startRun();
        $raw = (string) file_get_contents($this->runs);
        $this->assertStringNotContainsString(self::IP, $raw);
        $this->assertSame(substr(hash_hmac('sha256', self::IP, 'test-salt'), 0, 24), $g->clientKey());
        $this->assertArrayHasKey($g->clientKey(), json_decode($raw, true)['rates']);
    }

    public function testAStoreWrittenByTheOldCylonCodeIsHonoured(): void
    {
        $id = str_repeat('e', 32);
        $key = substr(hash_hmac('sha256', self::IP, 'test-salt'), 0, 24);
        file_put_contents($this->runs, json_encode([
            'runs' => [['id' => $id, 'at' => $this->now - 10, 'exp' => $this->now + 100, 'used' => false]],
            'rates' => [$key => ['start' => [$this->now - 10], 'score' => []]],
        ]));
        $this->assertNull($this->guard()->consumeRun($id));
        $this->assertNotNull($this->guard()->startRun());
        $this->assertNotNull($this->guard()->startRun());
        $this->assertNull($this->guard()->startRun(), 'the old start stamp still counts toward the hour');
    }

    public function testRateTakeCountsItsOwnKindPerClientPerHour(): void
    {
        $this->assertTrue($this->guard()->rateTake('room', 2));
        $this->assertTrue($this->guard()->rateTake('room', 2));
        $this->assertFalse($this->guard()->rateTake('room', 2));
        $this->assertTrue($this->guard(['REMOTE_ADDR' => '198.51.100.9'])->rateTake('room', 2), 'another client has its own budget');
        $this->assertNotNull($this->guard()->startRun(), 'room stamps never spend run starts');
        $this->now += 3601;
        $this->assertTrue($this->guard()->rateTake('room', 2), 'an hour later the budget is back');
    }

    public function testRateTakeKeepsTheStoreShapeOldReadersExpect(): void
    {
        $g = $this->guard();
        $g->rateTake('room', 5);
        $row = json_decode((string) file_get_contents($this->runs), true)['rates'][$g->clientKey()];
        $this->assertSame([[], [], [$this->now]], [$row['start'], $row['score'], $row['room']]);
    }

    public function testRateTakeRefusesAKindThatIsNotAWord(): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->guard()->rateTake('Room!', 1);
    }

    public function testAnUnparsableStoreStartsEmpty(): void
    {
        file_put_contents($this->runs, '{not json');
        $this->assertNotNull($this->guard()->startRun());
    }

    public function testAnUnopenableStoreIsAnError(): void
    {
        $this->runs = sys_get_temp_dir() . '/no-such-dir-' . bin2hex(random_bytes(4)) . '/runs.json';
        $this->expectException(RuntimeException::class);
        $this->guard()->startRun();
    }

    public function testModesForEachWayPhpRuns(): void
    {
        $this->assertSame(['dir' => 0700, 'file' => 0600, 'sharedDir' => 0700, 'sharedFile' => 0600], StoreModes::modes(true));
        $this->assertSame(['dir' => 0700, 'file' => 0600, 'sharedDir' => 0777, 'sharedFile' => 0666], StoreModes::modes(false));
        $this->assertSame(StoreModes::modes(posix_geteuid() === getmyuid()), StoreModes::modes());
    }

    public function testTheStoreTakesThePrivateFileMode(): void
    {
        $this->guard()->startRun();
        $this->assertSame(0600, fileperms($this->runs) & 0777);
    }

    public function testAShortWriteFailsAndKeepsThePreviousStore(): void
    {
        ShortWriteStream::$files = [];
        ShortWriteStream::$shortOnce = false;
        $this->runs = 'shortwrite://runs.json';
        $first = (string) $this->guard()->startRun();
        $before = ShortWriteStream::$files['runs.json'];
        ShortWriteStream::$shortOnce = true;
        try {
            $this->guard(['REMOTE_ADDR' => '198.51.100.9'])->startRun();
            $this->fail('a short write must not look like success');
        } catch (RuntimeException $e) {
            $this->assertSame('run store write failed', $e->getMessage());
        }
        $this->assertSame($before, ShortWriteStream::$files['runs.json'], 'the previous store is put back');
        $this->assertNull($this->guard()->consumeRun($first), 'and still honours its tokens');
    }
}

/** An in-memory file whose next write can land only half its bytes. */
final class ShortWriteStream
{
    /** @var array<string, string> */
    public static array $files = [];
    public static bool $shortOnce = false;
    public static bool $refuseNext = false;
    /** @var resource|null */
    public $context;
    private string $name = '';
    private int $pos = 0;

    public function stream_open(string $path, string $mode, int $options, ?string &$opened): bool
    {
        $this->name = substr($path, strlen('shortwrite://'));
        self::$files[$this->name] ??= '';
        return true;
    }

    public function stream_read(int $count): string
    {
        $out = substr(self::$files[$this->name], $this->pos, $count);
        $this->pos += strlen($out);
        return $out;
    }

    public function stream_write(string $data): int
    {
        // PHP retries a short write, so the stream takes half and then refuses the rest once.
        if (self::$refuseNext) {
            self::$refuseNext = false;
            return 0;
        }
        if (self::$shortOnce) {
            self::$shortOnce = false;
            self::$refuseNext = true;
            $data = substr($data, 0, intdiv(strlen($data), 2));
        }
        $file = self::$files[$this->name];
        self::$files[$this->name] = substr($file, 0, $this->pos) . $data . substr($file, $this->pos + strlen($data));
        $this->pos += strlen($data);
        return strlen($data);
    }

    public function stream_eof(): bool
    {
        return $this->pos >= strlen(self::$files[$this->name]);
    }

    public function stream_tell(): int
    {
        return $this->pos;
    }

    public function stream_seek(int $offset, int $whence): bool
    {
        $this->pos = $offset;
        return true;
    }

    public function stream_truncate(int $size): bool
    {
        self::$files[$this->name] = str_pad(substr(self::$files[$this->name], 0, $size), $size, "\0");
        return true;
    }

    public function stream_lock(int $operation): bool
    {
        return true;
    }

    public function stream_flush(): bool
    {
        return true;
    }

    /** @return array<string, int> */
    public function stream_stat(): array
    {
        return ['size' => strlen(self::$files[$this->name])];
    }

    public function stream_set_option(int $option, int $arg1, ?int $arg2): bool
    {
        return false;
    }
}

stream_wrapper_register('shortwrite', ShortWriteStream::class);
