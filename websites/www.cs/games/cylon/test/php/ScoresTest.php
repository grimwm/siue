<?php
// scores.php's board logic against a temp store: week boundaries (DST
// included), ranking, the all-time board, and the legacy file shape.
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

final class ScoresTest extends TestCase
{
    private string $dir;
    private string $store;

    public static function setUpBeforeClass(): void
    {
        // Defined before the require so the HTTP handler at the file's end stays dormant.
        define('CYLON_SCORES_LIBRARY', true);
        require_once dirname(__DIR__, 2) . '/scores.php';
    }

    protected function setUp(): void
    {
        $this->dir = sys_get_temp_dir() . '/cylon-scores-test-' . bin2hex(random_bytes(4));
        mkdir($this->dir);
        $this->store = $this->dir . '/scores.json';
        putenv('CYLON_SCORES_FILE=' . $this->store);
    }

    protected function tearDown(): void
    {
        putenv('CYLON_SCORES_FILE');
        foreach (glob($this->dir . '/*') ?: [] as $f) {
            unlink($f);
        }
        rmdir($this->dir);
    }

    private function bytes(): string
    {
        return (string) file_get_contents($this->store);
    }

    private function row(int $score, string $at, string $initials = 'AAA'): array
    {
        return ['score' => $score, 'hits' => 0, 'initials' => $initials, 'at' => $at];
    }

    private function stored(): array
    {
        return json_decode((string) file_get_contents($this->store), true);
    }

    private function daysAgo(int $days): string
    {
        return gmdate('c', time() - $days * 86400);
    }

    public function testTheConfigResetsOnSunday(): void
    {
        $this->assertSame('sunday', cfg('weekStartsOn'));
        $this->assertSame('America/Chicago', cfg('timezone'));
    }

    /** @return array<string, array{string, string}> */
    public static function weekBoundaries(): array
    {
        return [
            'ordinary Saturday night' => ['2026-10-10T23:59:59-05:00', '2026-10-04'],
            'ordinary Sunday midnight' => ['2026-10-11T00:00:00-05:00', '2026-10-11'],
            'Sunday midnight in UTC terms' => ['2026-10-11T05:00:00Z', '2026-10-11'],
            'one second before, in UTC terms' => ['2026-10-11T04:59:59Z', '2026-10-04'],
            'Saturday before spring forward' => ['2026-03-07T23:59:59-06:00', '2026-03-01'],
            'spring-forward Sunday midnight' => ['2026-03-08T00:00:00-06:00', '2026-03-08'],
            'spring-forward Sunday after the jump' => ['2026-03-08T12:00:00-05:00', '2026-03-08'],
            'Saturday after spring forward' => ['2026-03-14T23:59:59-05:00', '2026-03-08'],
            'Sunday after spring forward' => ['2026-03-15T00:00:00-05:00', '2026-03-15'],
            'Saturday before fall back' => ['2026-10-31T23:59:59-05:00', '2026-10-25'],
            'fall-back Sunday midnight' => ['2026-11-01T00:00:00-05:00', '2026-11-01'],
            'fall-back Sunday after the repeated hour' => ['2026-11-01T12:00:00-06:00', '2026-11-01'],
            'Monday after fall back' => ['2026-11-02T00:00:00-06:00', '2026-11-01'],
            'Saturday after fall back' => ['2026-11-07T23:59:59-06:00', '2026-11-01'],
            'Sunday after fall back' => ['2026-11-08T00:00:00-06:00', '2026-11-08'],
        ];
    }

    #[\PHPUnit\Framework\Attributes\DataProvider('weekBoundaries')]
    public function testWeekStartsSundayMidnightCentral(string $iso, string $weekStart): void
    {
        $this->assertSame($weekStart, localWeek($iso));
    }

    public function testRankingIsScoreDescendingThenEarlierFirst(): void
    {
        $ranked = sortScores([
            $this->row(5, '2026-10-12T10:00:00+00:00', 'LOW'),
            $this->row(9, '2026-10-12T12:00:00+00:00', 'LAT'),
            $this->row(9, '2026-10-12T11:00:00+00:00', 'ERL'),
        ]);
        $this->assertSame(['ERL', 'LAT', 'LOW'], array_column($ranked, 'initials'));
    }

    public function testBoardsAreCappedAtMaxScores(): void
    {
        $max = cfg('maxScores');
        for ($i = 1; $i <= $max + 3; $i++) {
            addScoreLocked($i, 0, 'AAA');
        }
        $board = readScoresLocked();
        $this->assertCount($max, $board['week']);
        $this->assertCount($max, $board['alltime']);
        $this->assertSame($max + 3, $board['week'][0]['score']);
        $this->assertSame(4, $board['alltime'][$max - 1]['score']);
    }

    public function testAnAcceptedScoreLandsOnBothBoardsWithTheSameShape(): void
    {
        $board = addScoreLocked(7, 3, 'ZED');
        foreach (['week', 'alltime'] as $list) {
            $this->assertCount(1, $board[$list]);
            $this->assertSame(['score', 'hits', 'initials', 'at'], array_keys($board[$list][0]));
            $this->assertSame([7, 3, 'ZED'], [$board[$list][0]['score'], $board[$list][0]['hits'], $board[$list][0]['initials']]);
        }
        $this->assertSame(['week', 'alltime'], array_keys($this->stored()));
    }

    public function testAllTimeSurvivesTheWeeklyReset(): void
    {
        file_put_contents($this->store, json_encode([
            'week' => [$this->row(30, $this->daysAgo(14), 'OLD')],
            'alltime' => [$this->row(30, $this->daysAgo(14), 'OLD'), $this->row(20, $this->daysAgo(40), 'ANC')],
        ]));
        $board = readScoresLocked();
        $this->assertSame([], $board['week']);
        $this->assertSame(['OLD', 'ANC'], array_column($board['alltime'], 'initials'));
        $this->assertSame([], $this->stored()['week']);
        $this->assertCount(2, $this->stored()['alltime']);
    }

    public function testAScoreAfterTheResetLeavesLastWeeksAllTimeRowsAlone(): void
    {
        file_put_contents($this->store, json_encode([
            'week' => [$this->row(30, $this->daysAgo(14), 'OLD')],
            'alltime' => [$this->row(30, $this->daysAgo(14), 'OLD')],
        ]));
        $board = addScoreLocked(10, 1, 'NEW');
        $this->assertSame(['NEW'], array_column($board['week'], 'initials'));
        $this->assertSame(['OLD', 'NEW'], array_column($board['alltime'], 'initials'));
    }

    public function testACorruptStoreIsRefusedAndLeftUntouched(): void
    {
        foreach (['{not json', '"a string"', '{"other":1}', '{"week":"x","alltime":[]}', '{"week":[],"alltime":5}'] as $bad) {
            file_put_contents($this->store, $bad);
            try {
                addScoreLocked(5, 0, 'AAA');
                $this->fail("accepted $bad");
            } catch (RuntimeException) {
                $this->assertSame($bad, $this->bytes());
            }
            try {
                readScoresLocked();
                $this->fail("read $bad");
            } catch (RuntimeException) {
                $this->assertSame($bad, $this->bytes());
            }
        }
    }

    public function testAnEmptyStoreIsEmptyBoards(): void
    {
        file_put_contents($this->store, '');
        $this->assertSame(['week' => [], 'alltime' => []], readScoresLocked());
    }

    public function testAStoreMissingAllTimeSeedsItFromTheWeekWithoutLoss(): void
    {
        file_put_contents($this->store, json_encode(['week' => [$this->row(3, gmdate('c'), 'ONE'), $this->row(9, gmdate('c'), 'TWO')]]));
        $board = readScoresLocked();
        $this->assertSame(['TWO', 'ONE'], array_column($board['alltime'], 'initials'));
        $this->assertSame(['TWO', 'ONE'], array_column($this->stored()['alltime'], 'initials'));
    }

    public function testTheRankIsThePlaceOnTheAllTimeBoardOrNull(): void
    {
        $this->assertSame(1, addScoreLocked(10, 0, 'AAA')['rank']);
        $this->assertSame(1, addScoreLocked(20, 0, 'BBB')['rank']);
        $this->assertSame(2, addScoreLocked(15, 0, 'CCC')['rank']);
    }

    public function testATieAtTheLastPlaceLeavesTheNewerRowOffTheBoard(): void
    {
        $max = cfg('maxScores');
        $rows = [];
        for ($i = 0; $i < $max; $i++) {
            $rows[] = $this->row(50, '2026-01-01T00:00:00+00:00', 'OLD');
        }
        file_put_contents($this->store, json_encode(['week' => [], 'alltime' => $rows]));
        $result = addScoreLocked(50, 0, 'NEW');
        $this->assertNull($result['rank']);
        $this->assertSame(['OLD'], array_unique(array_column($result['alltime'], 'initials')));
        $this->assertSame(1, addScoreLocked(51, 0, 'TOP')['rank']);
    }

    public function testALegacyArrayFileSeedsBothBoardsAndIsRewrittenAsAnObject(): void
    {
        $rows = [
            $this->row(8, gmdate('c'), 'NOW'),
            $this->row(40, $this->daysAgo(20), 'BIG'),
        ];
        file_put_contents($this->store, json_encode($rows));
        $board = readScoresLocked();
        $this->assertSame(['NOW'], array_column($board['week'], 'initials'));
        $this->assertSame(['BIG', 'NOW'], array_column($board['alltime'], 'initials'));
        $stored = $this->stored();
        $this->assertSame(['week', 'alltime'], array_keys($stored));
        $this->assertSame(['BIG', 'NOW'], array_column($stored['alltime'], 'initials'));
    }

    public function testALegacyArrayFileIsUpgradedByAScoreToo(): void
    {
        file_put_contents($this->store, json_encode([$this->row(40, $this->daysAgo(20), 'BIG')]));
        $board = addScoreLocked(2, 0, 'NEW');
        $this->assertSame(['BIG', 'NEW'], array_column($board['alltime'], 'initials'));
        $this->assertSame(['week', 'alltime'], array_keys($this->stored()));
    }

    public function testLegacySeedingKeepsOnlyTheTopMaxScores(): void
    {
        $max = cfg('maxScores');
        $rows = [];
        for ($i = 1; $i <= $max + 2; $i++) {
            $rows[] = $this->row($i, $this->daysAgo(20));
        }
        file_put_contents($this->store, json_encode($rows));
        $board = readScoresLocked();
        $this->assertCount($max, $board['alltime']);
        $this->assertSame($max + 2, $board['alltime'][0]['score']);
    }

    public function testBoardsUseTheOneScoresFileUnderItsSingleLock(): void
    {
        addScoreLocked(5, 0, 'AAA');
        readScoresLocked();
        $this->assertSame(['scores.json'], array_map('basename', glob($this->dir . '/*')));
        foreach (['readScoresLocked', 'addScoreLocked'] as $fn) {
            $r = new ReflectionFunction($fn);
            $body = implode('', array_slice(file($r->getFileName()), $r->getStartLine() - 1, $r->getEndLine() - $r->getStartLine() + 1));
            $this->assertSame(1, substr_count($body, 'flock($fh, LOCK_EX)'), "$fn takes exactly one exclusive lock");
            $this->assertSame(1, substr_count($body, 'openScoresFile('), "$fn opens one file");
        }
    }

    public function testTheGuardGetsCylonsBlockList(): void
    {
        $this->assertTrue(guard()->isBlocked('ass'));
        $this->assertTrue(guard()->isBlocked('KKK'));
        $this->assertFalse(guard()->isBlocked('ZED'));
    }

    public function testTheTimeRuleMatchesTheConfig(): void
    {
        $score = cfg('koBurst') + 10 * cfg('maxKosPerSec');
        $this->assertTrue(scoreFitsTime($score)(10));
        $this->assertFalse(scoreFitsTime($score)(9));
        $this->assertFalse(scoreFitsTime(1)(cfg('minRunSec') - 1));
        $this->assertTrue(scoreFitsTime(1)(cfg('minRunSec')));
    }

    public function testStoredInitialsAreCoercedAsBefore(): void
    {
        $rows = normalizeScores([['score' => 1, 'initials' => 'a1'], ['score' => 2], ['score' => 3, 'initials' => 'ass']]);
        $this->assertSame(['AAA', 'AAA'], array_column($rows, 'initials'));
    }

    public function testTheConfigStillRejectsKeysCylonDoesNotKnow(): void
    {
        $config = json_decode((string) file_get_contents(dirname(__DIR__, 2) . '/data/config.json'), true);
        $this->assertIsArray(validateConfig($config));
        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('unknown config keys: surprise');
        validateConfig($config + ['surprise' => 1]);
    }

    /** @param array<string, string> $server @return array<string, mixed> */
    private function post(array $server, array $cookies = []): array
    {
        $code = '$_SERVER = ' . var_export($server + [
            'REQUEST_METHOD' => 'POST', 'CONTENT_TYPE' => 'application/json',
            'HTTP_HOST' => 'game.test', 'REMOTE_ADDR' => '203.0.113.7',
        ], true) . '; $_COOKIE = ' . var_export($cookies, true) . '; require ' . var_export(dirname(__DIR__, 2) . '/scores.php', true) . ';';
        $out = (string) shell_exec('CYLON_SCORES_FILE=' . escapeshellarg($this->store) . ' ' . escapeshellarg(PHP_BINARY) . ' -r ' . escapeshellarg($code));
        return json_decode($out, true) ?? ['raw' => $out];
    }

    public function testAPostWithNoOriginOrRefererNeedsAValidCsrfPair(): void
    {
        $token = str_repeat('ab', 16);
        $this->assertSame('forbidden', $this->post([])['error'] ?? null, 'no Origin, no Referer, no CSRF');
        $this->assertSame('forbidden', $this->post(['HTTP_X_CYLON_CSRF' => $token])['error'] ?? null, 'header without the cookie');
        $this->assertSame('forbidden', $this->post(['HTTP_X_CYLON_CSRF' => str_repeat('cd', 16)], ['cylon_csrf' => $token])['error'] ?? null, 'header differs from the cookie');
        $this->assertSame('forbidden', $this->post(['HTTP_ORIGIN' => 'https://evil.example', 'HTTP_X_CYLON_CSRF' => $token], ['cylon_csrf' => $token])['error'] ?? null, 'foreign origin');
        $this->assertSame('invalid json', $this->post(['HTTP_X_CYLON_CSRF' => $token, 'HTTP_ORIGIN' => 'https://game.test'], ['cylon_csrf' => $token])['error'] ?? null, 'both checks pass, so the body is read');
    }

    public function testTheRunsFileIsPrivate(): void
    {
        $runs = rtrim(sys_get_temp_dir(), DIRECTORY_SEPARATOR) . '/' . cfg('storageKey') . '-runs.json';
        $existed = is_file($runs);
        $this->assertNotNull(guard()->startRun());
        $this->assertSame(0600, fileperms($runs) & 0777);
        if (!$existed) {
            unlink($runs);
        }
    }
}
