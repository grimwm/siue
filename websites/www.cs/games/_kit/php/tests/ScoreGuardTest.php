<?php
// The kit's score gate: config, initials, origin, CSRF, run tokens and rate limits.
declare(strict_types=1);

require_once dirname(__DIR__) . '/score-guard.php';

use Kit\ScoreGuard;
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
}
