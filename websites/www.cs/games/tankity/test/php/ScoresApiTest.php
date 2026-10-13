<?php
// games/tankity/test/php/ScoresApiTest.php
declare(strict_types=1);

use Kit\ScoreGuard;
use PHPUnit\Framework\TestCase;

/* scores.php's handler: every guard rule, the server playing each round from
   the stored state, and filing what the server already holds. */
final class ScoresApiTest extends TestCase
{
    private string $dir;
    private array $override;
    private int $now;
    private const TOKEN = '0123456789abcdef0123456789abcdef';

    public static function setUpBeforeClass(): void
    {
        require_once __DIR__ . '/rooms-lib.php';
        require_once dirname(__DIR__, 2) . '/server/scores-api.php';
    }

    protected function setUp(): void
    {
        $this->dir = tankity_test_dir();
        $this->override = ['startsPerHour' => 3];
        $this->now = 1_800_000_000;
        $_SERVER = ['HTTP_HOST' => 'localhost', 'HTTP_ORIGIN' => 'http://localhost', 'CONTENT_TYPE' => 'application/json',
            'REMOTE_ADDR' => '203.0.113.' . random_int(1, 254), 'HTTP_X_TANKITY_CSRF' => self::TOKEN, 'SCRIPT_NAME' => '/games/tankity/scores.php'];
        $_COOKIE = ['tankity_csrf' => self::TOKEN];
    }

    protected function tearDown(): void
    {
        putenv('TANKITY_ROUNDS_PER_HOUR');
        putenv('TANKITY_ROUND_CPU');
        tankity_test_rm($this->dir);
    }

    /** The guard for this test's request, on the test's clock; it sets no real cookie. */
    private function guard(): ScoreGuard
    {
        return tankity_guard($this->override, $_SERVER, $_COOKIE, fn(): int => $this->now, function (): void {});
    }

    private function post(array $body): array
    {
        return $this->raw((string) json_encode($body));
    }

    private function raw(string $body): array
    {
        return tankity_scores_handle('POST', [], $body, $this->guard(), $this->now);
    }

    private function get(array $query = []): array
    {
        return tankity_scores_handle('GET', $query, '', $this->guard(), $this->now);
    }

    private function recorded(): array
    {
        $all = json_decode((string) file_get_contents(dirname(__DIR__, 2) . '/protocol/solo-runs.json'), true)['runs'];
        foreach ($all as $r) {
            if (count($r['rounds']) <= 8 && count($r['rounds']) >= 2 && !$r['slow']) {
                return $r;
            }
        }
        $this->fail('no short recorded run');
    }

    private function start(array $run): string
    {
        [$status, $out] = $this->post(['op' => 'start', 'seed' => $run['seed'], 'difficulty' => $run['difficulty'], 'w' => $run['w']]);
        $this->assertSame(200, $status, json_encode($out));
        return $out['run'];
    }

    private function round(string $id, array $r): array
    {
        return $this->post(['op' => 'round', 'run' => $id] + $r);
    }

    /** Starts the run and sends every round; answers its id. */
    private function playAll(array $run): string
    {
        $id = $this->start($run);
        foreach ($run['rounds'] as $r) {
            $this->now += 30;
            [$status, $out] = $this->round($id, $r);
            $this->assertSame(200, $status, json_encode($out));
            $this->assertSame($r['claim'], array_intersect_key($out, $r['claim']));
        }
        return $id;
    }

    private function row(string $id): array
    {
        $q = tankity_db()->prepare('SELECT * FROM solo_runs WHERE id = ?');
        $q->execute([$id]);
        return $q->fetch(PDO::FETCH_ASSOC) ?: [];
    }

    // ---- GET

    public function testGetGivesTheBoardOfTheAskedDifficultyAndTheToken(): void
    {
        board_file(['difficulty' => 'hard', 'initials' => 'HRD', 'score' => 5, 'rounds' => 1, 'seed' => 's', 'source' => 'solo']);
        [$status, $out] = $this->get(['difficulty' => 'hard']);
        $this->assertSame(200, $status);
        $this->assertSame(self::TOKEN, $out['csrf']);
        $this->assertSame(BOARD_KEEP, $out['keep']);
        $this->assertSame(['hard', ['HRD']], [$out['difficulty'], array_column($out['scores'], 'name')]);
        $this->assertSame([], $this->get()[1]['scores'], 'Normal by default');
        $this->assertSame(422, $this->get(['difficulty' => 'brutal'])[0]);
        $this->assertSame(422, $this->get(['difficulty' => ['hard']])[0]);
    }

    public function testGetKeepsTheShapeThePageReadsAndNeverPublishesASeed(): void
    {
        board_file(['difficulty' => 'normal', 'initials' => 'WIN', 'score' => 50, 'rounds' => 3, 'seed' => 'room:LIVE', 'source' => 'room']);
        board_file(['difficulty' => 'normal', 'initials' => 'AAA', 'score' => 9, 'rounds' => 0, 'seed' => 'secret', 'source' => 'client', 'standin' => true]);
        [, $out] = $this->get();
        $this->assertSame(['name', 'best', 'banked', 'won', 'place', 'at', 'standin'], array_keys($out['scores'][0]));
        $this->assertSame(['WIN', 50, 3, false, 1, false], [$out['scores'][0]['name'], $out['scores'][0]['best'],
            $out['scores'][0]['banked'], $out['scores'][0]['won'], $out['scores'][0]['place'], $out['scores'][0]['standin']]);
        $this->assertTrue($out['scores'][1]['standin'], 'a converted name the blocklist refused is marked');
        $json = (string) json_encode($out);
        $this->assertStringNotContainsString('room:LIVE', $json);
        $this->assertStringNotContainsString('secret', $json);
    }

    public function testOnlyGetAndPostAreServed(): void
    {
        $this->assertSame(405, tankity_scores_handle('PUT', [], '{}', $this->guard(), $this->now)[0]);
    }

    // ---- the gate every POST passes

    public function testABadOriginIsForbidden(): void
    {
        $_SERVER['HTTP_ORIGIN'] = 'https://evil.example';
        $this->assertSame([403, ['error' => 'forbidden']], $this->post(['op' => 'start', 'seed' => 's', 'difficulty' => 'normal', 'w' => 720]));
        $this->assertSame(0, (int) tankity_db()->query('SELECT COUNT(*) FROM solo_runs')->fetchColumn());
    }

    public function testAMissingCsrfHeaderIsForbidden(): void
    {
        unset($_SERVER['HTTP_X_TANKITY_CSRF']);
        $this->assertSame(403, $this->post(['op' => 'start', 'seed' => 's', 'difficulty' => 'normal', 'w' => 720])[0]);
    }

    public function testAMissingCsrfCookieIsForbidden(): void
    {
        $_COOKIE = [];
        $this->assertSame(403, $this->post(['op' => 'start', 'seed' => 's', 'difficulty' => 'normal', 'w' => 720])[0]);
    }

    public function testAMismatchedCsrfIsForbidden(): void
    {
        $_SERVER['HTTP_X_TANKITY_CSRF'] = 'ffffffffffffffffffffffffffffffff';
        $this->assertSame(403, $this->post(['op' => 'start', 'seed' => 's', 'difficulty' => 'normal', 'w' => 720])[0]);
    }

    public function testOnlyJsonIsTaken(): void
    {
        foreach (['text/plain', 'application/x-www-form-urlencoded', ''] as $type) {
            $_SERVER['CONTENT_TYPE'] = $type;
            $this->assertSame(403, $this->post(['op' => 'start', 'seed' => 's', 'difficulty' => 'normal', 'w' => 720])[0], $type);
        }
        $_SERVER['CONTENT_TYPE'] = 'application/json; charset=utf-8';
        $this->assertSame(200, $this->post(['op' => 'start', 'seed' => 's', 'difficulty' => 'normal', 'w' => 720])[0]);
    }

    public function testABodyPastTheCapIsRefusedUnread(): void
    {
        $this->assertSame([413, ['error' => 'too large']], $this->raw('{"op":"start","pad":"' . str_repeat('x', SCORES_MAX_BODY) . '"}'));
    }

    public function testBodiesThatAreNotARequestAreRefused(): void
    {
        foreach (['', 'nope', '"start"', '[1,2]', '{"op":"launch"}', '{"op":["start"]}',
            '{"op":"round","run":' . str_repeat('[', 40) . str_repeat(']', 40) . '}'] as $raw) {
            $this->assertSame([400, ['error' => 'invalid json']], $this->raw($raw), $raw);
        }
    }

    public function testAPr15StyleScoreReportFilesNothing(): void
    {
        foreach (['normal', 'hard'] as $level) {
            $this->assertSame([400, ['error' => 'invalid json']],
                $this->post(['name' => 'zzz', 'score' => 999999, 'banked' => 9, 'difficulty' => $level, 'seed' => 's']));
            $this->assertSame([], board_top($level, 5));
        }
    }

    // ---- start

    public function testStartsAreRateLimitedAndChecked(): void
    {
        foreach (["h\u{e9}llo", '', str_repeat('s', 65), "tab\there", 7, null] as $seed) {
            $this->assertSame(422, $this->post(['op' => 'start', 'seed' => $seed, 'difficulty' => 'normal', 'w' => 720])[0], var_export($seed, true));
        }
        $this->assertSame(422, $this->post(['op' => 'start', 'seed' => 's', 'difficulty' => 'brutal', 'w' => 720])[0]);
        foreach ([null, 700, 1464, 1201, '1200'] as $w) {
            $this->assertSame(422, $this->post(['op' => 'start', 'seed' => 's', 'difficulty' => 'normal', 'w' => $w])[0], var_export($w, true));
        }
        // json_encode writes 1200.0 as 1200; the browser could send the float form.
        $this->assertSame(422, $this->raw('{"op":"start","seed":"s","difficulty":"normal","w":1200.0}')[0]);
        for ($i = 0; $i < 3; $i++) {
            $this->assertSame(200, $this->post(['op' => 'start', 'seed' => 's', 'difficulty' => 'normal', 'w' => [720, 1200, 1440][$i]])[0]);
        }
        $this->assertSame([429, ['error' => 'rate']], $this->post(['op' => 'start', 'seed' => 's', 'difficulty' => 'normal', 'w' => 720]));
        $this->assertSame(3, (int) tankity_db()->query('SELECT COUNT(*) FROM solo_runs')->fetchColumn());
    }

    public function testRoomSeedsStayReservedForRooms(): void
    {
        foreach (['room:ABCD', ' ROOM:ABCD', 'Room:x'] as $seed) {
            $this->assertSame(422, $this->post(['op' => 'start', 'seed' => $seed, 'difficulty' => 'normal', 'w' => 720])[0], $seed);
        }
        $this->assertSame(0, (int) tankity_db()->query('SELECT COUNT(*) FROM solo_runs')->fetchColumn());
    }

    public function testAStartAnswersOnlyAnUnguessableRunId(): void
    {
        [$status, $a] = $this->post(['op' => 'start', 'seed' => 'secret-seed', 'difficulty' => 'normal', 'w' => 720]);
        [, $b] = $this->post(['op' => 'start', 'seed' => 'secret-seed', 'difficulty' => 'normal', 'w' => 720]);
        $this->assertSame(200, $status);
        $this->assertSame(['ok', 'run'], array_keys($a));
        $this->assertMatchesRegularExpression('/^[a-f0-9]{32}$/', $a['run']);
        $this->assertNotSame($a['run'], $b['run']);
        $this->assertStringNotContainsString('secret-seed', (string) json_encode($a));
    }

    public function testTheStateIsKeptAsJsonWithItsFloats(): void
    {
        $run = $this->recorded();
        $id = $this->start($run);
        $this->assertSame(200, $this->round($id, $run['rounds'][0])[0]);
        $state = json_decode((string) $this->row($id)['state'], true, 512, JSON_THROW_ON_ERROR);
        $this->assertSame(1, $state['round']);
        $this->assertIsFloat($state['tanks'][0]['x']);
        $this->assertSame($run['w'], $state['w'], 'the run is played at the width it started with');
    }

    public function testStartsStopAtTheLiveRunCap(): void
    {
        $this->override['startsPerHour'] = 10;
        tankity_tx(tankity_db(), function (PDO $db): void {
            $q = $db->prepare("INSERT INTO solo_runs (id, difficulty, seed, created, touched, round, status, state, reply, filed) VALUES (?, 'normal', 's', ?, ?, 0, ?, '{}', '', '')");
            for ($i = 0; $i < SOLO_MAX_LIVE_RUNS; $i++) {
                $q->execute([sprintf('%032x', $i), $this->now, $this->now, $i % 2 ? 'live' : 'over']);
            }
        });
        $this->assertSame([503, ['error' => 'busy']], $this->post(['op' => 'start', 'seed' => 's', 'difficulty' => 'normal', 'w' => 720]));
        // Runs gone quiet do not count, though housekeeping has not deleted them yet.
        tankity_db()->exec('UPDATE solo_runs SET touched = touched - ' . (SOLO_RUN_IDLE + 1) . " WHERE id = '" . sprintf('%032x', 0) . "'");
        $this->assertSame(200, $this->post(['op' => 'start', 'seed' => 's', 'difficulty' => 'normal', 'w' => 720])[0]);
    }

    // ---- rounds

    public function testAnHonestRunFilesAtExactlyTheScoreTheBrowserShowed(): void
    {
        $run = $this->recorded();
        $id = $this->playAll($run);
        [$status, $out] = $this->post(['op' => 'file', 'run' => $id, 'initials' => 'abc']);
        $this->assertSame(200, $status, json_encode($out));
        $this->assertSame(['ok' => true, 'score' => $run['score'], 'roundsWon' => $run['roundsWon'], 'rank' => 1, 'difficulty' => $run['difficulty']], $out);
        $top = board_top($run['difficulty'], 1)[0];
        $this->assertSame(['ABC', $run['score'], $run['roundsWon'], $run['seed'], false], [$top['initials'], $top['score'], $top['rounds'], $top['seed'], $top['standin']]);
        $this->assertSame('solo', tankity_db()->query('SELECT source FROM board')->fetchColumn(), 'a server-played run is not a browser claim');
    }

    public function testARoundAnswersTheServersClaimAndNothingElse(): void
    {
        $run = $this->recorded();
        $id = $this->start($run);
        [$status, $out] = $this->round($id, $run['rounds'][0]);
        $this->assertSame(200, $status);
        $this->assertSame(['ok' => true, 'n' => 1] + $run['rounds'][0]['claim'], $out);
    }

    public function testAForgedScoreFieldIsIgnored(): void
    {
        $run = $this->recorded();
        $id = $this->playAll($run);
        [, $out] = $this->post(['op' => 'file', 'run' => $id, 'initials' => 'ABC', 'score' => 999999, 'roundsWon' => 99]);
        $this->assertSame([$run['score'], $run['roundsWon']], [$out['score'], $out['roundsWon']]);
        $this->assertSame($run['score'], board_top($run['difficulty'], 1)[0]['score']);
    }

    public function testAClaimMatchesWhateverOrderItsKeysCameIn(): void
    {
        $run = $this->recorded();
        $id = $this->start($run);
        $r = $run['rounds'][0];
        $r['claim'] = array_reverse($r['claim'], true);
        $this->assertSame(200, $this->round($id, $r)[0]);
    }

    public function testALyingClaimVoidsTheRun(): void
    {
        $run = $this->recorded();
        $id = $this->start($run);
        $r = $run['rounds'][0];
        $r['claim']['score'] += 500;
        [$status, $out] = $this->round($id, $r);
        $this->assertSame(422, $status);
        $this->assertSame(['void', 'mismatch'], [$out['error'], $out['why']]);
        $this->assertSame($run['rounds'][0]['claim'], $out['server']);
        $this->assertSame([409, ['error' => 'void']], $this->round($id, $run['rounds'][0]), 'nothing later can match');
        $this->assertSame([409, ['error' => 'void']], $this->post(['op' => 'file', 'run' => $id, 'initials' => 'ABC']));
        $this->assertSame([], board_top($run['difficulty'], 5));
    }

    public function testEachClaimFieldIsCompared(): void
    {
        $run = $this->recorded();
        foreach (['end' => 'roundWon', 'score' => 1, 'cash' => 1, 'lives' => 1, 'roundsWon' => 1] as $field => $bump) {
            $this->override['startsPerHour'] = 100;
            $id = $this->start($run);
            $r = $run['rounds'][0];
            $r['claim'][$field] = is_int($bump) ? $r['claim'][$field] + $bump : ($r['claim'][$field] === $bump ? 'tankLost' : $bump);
            [$status, $out] = $this->round($id, $r);
            $this->assertSame([422, 'mismatch'], [$status, $out['why'] ?? null], $field);
        }
    }

    public function testAMalformedRoundIsRefusedBeforeItCosts(): void
    {
        $run = $this->recorded();
        $id = $this->start($run);
        $r = $run['rounds'][0];
        foreach ([['n' => 0], ['n' => '1'], ['claim' => null], ['claim' => ['end' => 'won'] + $r['claim']],
            ['claim' => ['score' => -1] + $r['claim']], ['claim' => ['lives' => '2'] + $r['claim']]] as $bad) {
            $this->assertSame([400, ['error' => 'invalid json']], $this->post(array_merge(['op' => 'round', 'run' => $id] + $r, $bad)), json_encode($bad));
        }
        $body = (string) json_encode(['op' => 'round', 'run' => $id] + $r);
        foreach (['"n":1,' => '"n":1.0,', '"lives":' . $r['claim']['lives'] => '"lives":' . $r['claim']['lives'] . '.0'] as $from => $to) {
            $this->assertSame(1, substr_count($body, $from), $from);
            $this->assertSame([400, ['error' => 'invalid json']], $this->raw(str_replace($from, $to, $body)), $to);
        }
        $this->assertSame('live', $this->row($id)['status']);
        $this->assertSame(200, $this->round($id, $r)[0]);
    }

    public function testATamperedRoundVoidsTheRun(): void
    {
        $run = $this->recorded();
        $id = $this->start($run);
        $r = $run['rounds'][0];
        $r['shots'][0]['a'] = 200;
        $this->assertSame([422, ['error' => 'void', 'why' => 'out of range']], $this->round($id, $r));
        $this->assertSame('void', $this->row($id)['status']);
    }

    public function testBuysAndShotsMustBeListsAsTheBrowserRefereeHoldsThem(): void
    {
        // JSON objects in place of the lists: PHP would read {} as an empty list; src/solo-play.ts refuses them.
        $run = $this->recorded();
        $this->override['startsPerHour'] = 10;
        $r = $run['rounds'][0];
        $body = (string) json_encode(['op' => 'round', 'run' => $this->start($run)] + $r);
        $objectBuys = (string) preg_replace('/"buys":\[.*?\],"shots"/', '"buys":{},"shots"', $body, 1, $done);
        $this->assertSame(1, $done);
        $this->assertSame([422, ['error' => 'void', 'why' => 'bad buys']], $this->raw($objectBuys));
        $shots = (string) json_encode((object) $r['shots']);
        $body = (string) json_encode(['op' => 'round', 'run' => $this->start($run), 'n' => 1, 'buys' => $r['buys'], 'shots' => 'SHOTS', 'claim' => $r['claim']]);
        $this->assertStringStartsWith('{"0":', $shots);
        $this->assertSame([422, ['error' => 'void', 'why' => 'too many shots']], $this->raw(str_replace('"SHOTS"', $shots, $body)));
    }

    public function testARoundTooCostlyForTheServerVoidsTheRun(): void
    {
        putenv('TANKITY_ROUND_CPU=0.001');
        $run = $this->recorded();
        $id = $this->start($run);
        $this->assertSame([422, ['error' => 'void', 'why' => 'too slow']], $this->round($id, $run['rounds'][0]));
    }

    public function testTheRoundBudgetIsASetting(): void
    {
        $this->assertSame(SOLO_ROUND_CPU, solo_round_cpu());
        $this->assertSame(4.0, SOLO_ROUND_CPU);
        putenv('TANKITY_ROUND_CPU=7.5');
        $this->assertSame(7.5, solo_round_cpu());
        foreach (['0', '-2', 'fast', 'INF', 'NAN'] as $bad) {
            putenv("TANKITY_ROUND_CPU=$bad");
            $this->assertSame(SOLO_ROUND_CPU, solo_round_cpu(), $bad);
        }
    }

    public function testARoundSentTwiceIsPlayedOnce(): void
    {
        $run = $this->recorded();
        $id = $this->start($run);
        $first = $this->round($id, $run['rounds'][0]);
        $state = $this->row($id)['state'];
        $this->now += 5;
        $this->assertSame($first, $this->round($id, $run['rounds'][0]));
        $this->assertSame(1, (int) $this->row($id)['round']);
        $this->assertSame($state, $this->row($id)['state']);
    }

    public function testARoundOutOfOrderIsRefused(): void
    {
        $run = $this->recorded();
        $id = $this->start($run);
        $this->assertSame([409, ['error' => 'out of order', 'round' => 0]], $this->round($id, $run['rounds'][1]));
        $this->assertSame(200, $this->round($id, $run['rounds'][0])[0]);
        $this->assertSame([409, ['error' => 'out of order', 'round' => 1]], $this->round($id, ['n' => 3] + $run['rounds'][1]));
        $this->assertSame('live', $this->row($id)['status'], 'out of order is not a lie');
    }

    public function testNoRoundIsPlayedAfterTheLast(): void
    {
        $run = $this->recorded();
        $id = $this->playAll($run);
        $last = $run['rounds'][count($run['rounds']) - 1];
        $this->assertSame(409, $this->round($id, ['n' => $last['n'] + 1] + $last)[0]);
        $this->assertSame('over', $this->row($id)['status']);
    }

    public function testAnUnknownOrMalformedRunIsNotFound(): void
    {
        $run = $this->recorded();
        foreach (['ffffffffffffffffffffffffffffffff', 'nope', '', "' OR 1=1 --"] as $id) {
            $this->assertSame([404, ['error' => 'no such run']], $this->round($id, $run['rounds'][0]), $id);
            $this->assertSame([404, ['error' => 'no such run']], $this->post(['op' => 'file', 'run' => $id, 'initials' => 'ABC']), $id);
        }
    }

    public function testARunGoneQuietExpires(): void
    {
        $run = $this->recorded();
        $id = $this->start($run);
        $this->now += SOLO_RUN_IDLE + 1;
        $this->assertSame([410, ['error' => 'expired']], $this->round($id, $run['rounds'][0]));
        $this->assertSame([410, ['error' => 'expired']], $this->post(['op' => 'file', 'run' => $id, 'initials' => 'ABC']));
        $this->assertSame(1, solo_runs_expire($this->now));
        $this->assertSame([404, ['error' => 'no such run']], $this->round($id, $run['rounds'][0]));
    }

    public function testARunExpiresADayAfterItStartedHoweverBusy(): void
    {
        $run = $this->recorded();
        $id = $this->start($run);
        $this->assertSame(200, $this->round($id, $run['rounds'][0])[0]);
        tankity_db()->exec('UPDATE solo_runs SET created = created - ' . (SOLO_RUN_MAX_AGE + 1));
        $this->assertSame([410, ['error' => 'expired']], $this->round($id, $run['rounds'][1]));
        $this->assertSame(1, solo_runs_expire($this->now));
    }

    public function testHousekeepingSweepsStaleRunsAFewAtATime(): void
    {
        $this->assertArrayHasKey('solo', tankity_jobs());
        tankity_tx(tankity_db(), function (PDO $db): void {
            $q = $db->prepare("INSERT INTO solo_runs (id, difficulty, seed, created, touched, round, status, state, reply, filed) VALUES (?, 'normal', 's', ?, ?, 0, ?, '{}', '', '')");
            $old = $this->now - SOLO_RUN_IDLE - 1;
            foreach (['live', 'over', 'void'] as $i => $status) {
                $q->execute([sprintf('%032x', $i), $old, $old, $status]);
            }
            $q->execute([sprintf('%032x', 10), $this->now, $this->now - SOLO_RUN_FILED_KEEP - 1, 'filed']);
            $q->execute([sprintf('%032x', 11), $this->now, $this->now - 10, 'filed']);
            $q->execute([sprintf('%032x', 12), $this->now, $this->now, 'live']);
        });
        $this->assertSame(2, solo_runs_expire($this->now, 2));
        $this->assertSame(2, solo_runs_expire($this->now));
        $this->assertSame(0, solo_runs_expire($this->now));
        $this->assertSame([sprintf('%032x', 11), sprintf('%032x', 12)],
            tankity_db()->query('SELECT id FROM solo_runs ORDER BY id')->fetchAll(PDO::FETCH_COLUMN));
    }

    // ---- filing

    public function testARunFilesOnceAndOnlyWhenOver(): void
    {
        $run = $this->recorded();
        $id = $this->start($run);
        $this->assertSame([409, ['error' => 'the run is not over']], $this->post(['op' => 'file', 'run' => $id, 'initials' => 'ABC']));
        foreach ($run['rounds'] as $r) {
            $this->round($id, $r);
        }
        $first = $this->post(['op' => 'file', 'run' => $id, 'initials' => 'ABC']);
        $this->assertSame(200, $first[0]);
        // A filing whose reply was lost is asked again: the same answer, and still one row.
        $this->now += 60;
        $this->assertSame($first, $this->post(['op' => 'file', 'run' => $id, 'initials' => 'XYZ']));
        $this->assertCount(1, board_top($run['difficulty'], 5));
        $this->assertSame('ABC', board_top($run['difficulty'], 1)[0]['initials']);
        $this->now += SOLO_RUN_FILED_KEEP;
        $this->assertSame([410, ['error' => 'expired']], $this->post(['op' => 'file', 'run' => $id, 'initials' => 'ABC']));
        $this->assertCount(1, board_top($run['difficulty'], 5));
    }

    public function testAFiledRunsTokenCannotBeSpentAgain(): void
    {
        $run = $this->recorded();
        $id = $this->playAll($run);
        $this->assertSame(200, $this->post(['op' => 'file', 'run' => $id, 'initials' => 'ABC'])[0]);
        $this->assertSame('invalid run', $this->guard()->consumeRun($id));
    }

    public function testASpentTokenWithoutAFilingIsRefused(): void
    {
        $run = $this->recorded();
        $id = $this->playAll($run);
        $this->assertNull($this->guard()->consumeRun($id));
        $this->assertSame([400, ['error' => 'invalid run']], $this->post(['op' => 'file', 'run' => $id, 'initials' => 'ABC']));
        $this->assertSame([], board_top($run['difficulty'], 5));
    }

    public function testBadInitialsAreRefused(): void
    {
        $run = $this->recorded();
        $id = $this->playAll($run);
        foreach (['AB', 'A1C', 'ass', '', 'ABCD', null, ['ABC']] as $bad) {
            $this->assertSame(422, $this->post(['op' => 'file', 'run' => $id, 'initials' => $bad])[0], var_export($bad, true));
        }
        $this->assertSame(200, $this->post(['op' => 'file', 'run' => $id, 'initials' => ' abc '])[0]);
    }

    // ---- the per-address throttle

    public function testRoundsAreRateLimited(): void
    {
        putenv('TANKITY_ROUNDS_PER_HOUR=5');
        $run = $this->recorded();
        $id = $this->start($run);
        $guard = $this->guard();
        for ($i = 0; $i < solo_rounds_per_hour(); $i++) {
            $guard->rateTake('round', solo_rounds_per_hour());
        }
        $this->assertSame([429, ['error' => 'rate']], $this->round($id, $run['rounds'][0]));
    }

    public function testTheRoundsCapIsASetting(): void
    {
        $this->assertSame(SOLO_ROUNDS_PER_HOUR, solo_rounds_per_hour());
        $this->assertSame(600, SOLO_ROUNDS_PER_HOUR);
        putenv('TANKITY_ROUNDS_PER_HOUR=25');
        $this->assertSame(25, solo_rounds_per_hour());
        putenv('TANKITY_ROUNDS_PER_HOUR=lots');
        $this->assertSame(SOLO_ROUNDS_PER_HOUR, solo_rounds_per_hour());
        $this->assertSame(240, tankity_guard_config()['scoresPerHour']);
    }

    public function testAThrottledRunWaitsAndCarriesOn(): void
    {
        // A class behind one address: the run is held, never voided or dropped, and plays on once the hour moves.
        putenv('TANKITY_ROUNDS_PER_HOUR=1');
        $run = $this->recorded();
        $id = $this->start($run);
        $this->assertSame(200, $this->round($id, $run['rounds'][0])[0]);
        $this->assertSame([429, ['error' => 'rate']], $this->round($id, $run['rounds'][1]));
        $this->assertSame('live', $this->row($id)['status']);
        $this->now += 3601;
        $this->assertSame(200, $this->round($id, $run['rounds'][1])[0]);
    }

    public function testAThrottledFilingSpendsNothingAndFilesLater(): void
    {
        $this->override['scoresPerHour'] = 1;
        $run = $this->recorded();
        $id = $this->playAll($run);
        $this->assertTrue($this->guard()->rateTake('score', 1));
        $this->assertSame([429, ['error' => 'rate']], $this->post(['op' => 'file', 'run' => $id, 'initials' => 'ABC']));
        $this->assertSame([], board_top($run['difficulty'], 5));
        $this->now += 3601;
        $this->assertSame(200, $this->post(['op' => 'file', 'run' => $id, 'initials' => 'ABC'])[0]);
    }

    public function testTheThrottleKeysOnTheSubscriberNotTheAddress(): void
    {
        putenv('TANKITY_ROUNDS_PER_HOUR=1');
        $body = ['op' => 'round', 'run' => str_repeat('0', 32)] + $this->recorded()['rounds'][0];
        $at = function (string $addr) use ($body): int {
            $_SERVER['REMOTE_ADDR'] = $addr;
            return $this->post($body)[0];
        };
        // One IPv6 subscriber holds the whole /64.
        $this->assertSame(404, $at('2001:db8:1:2::1'));
        $this->assertSame(429, $at('2001:db8:1:2:ffff::9'));
        $this->assertSame(404, $at('2001:db8:1:3::1'), 'the next /64 is someone else');
        // An IPv4 client seen through IPv6 is the same client.
        $this->assertSame(404, $at('198.51.100.7'));
        $this->assertSame(429, $at('::ffff:198.51.100.7'));
        $this->assertSame(429, $at('64:ff9b::198.51.100.7'));
        $this->assertSame(404, $at('198.51.100.8'));
    }

    // ---- the boards' sources

    public function testBrowserClaimsNeverEvictServerFiledRows(): void
    {
        board_file(['difficulty' => 'normal', 'initials' => 'WIN', 'score' => 5, 'rounds' => 1, 'seed' => 'room:REAL', 'source' => 'room']);
        board_file(['difficulty' => 'normal', 'initials' => 'SOL', 'score' => 4, 'rounds' => 1, 'seed' => 'solo', 'source' => 'solo']);
        for ($i = 0; $i < BOARD_KEEP + 1; $i++) {
            board_file(['difficulty' => 'normal', 'initials' => 'ZZZ', 'score' => 999999, 'rounds' => 9, 'seed' => '', 'source' => 'client']);
        }
        $names = array_column(board_top('normal', 1000), 'initials');
        $this->assertContains('WIN', $names, 'the room-filed row survives 101 better client rows');
        $this->assertContains('SOL', $names, 'so does the server-played solo row');
        $this->assertCount(BOARD_KEEP + 2, $names);
        $this->assertSame('ZZZ', board_top('normal', 1)[0]['initials'], 'the view still ranks every source together');
    }

    public function testRoomAndSoloRowsShareOneVerifiedPool(): void
    {
        for ($i = 0; $i < BOARD_KEEP; $i++) {
            board_file(['difficulty' => 'normal', 'initials' => 'RUM', 'score' => 100 + $i, 'rounds' => 1, 'seed' => 'room:X', 'source' => 'room']);
        }
        $this->assertNull(board_file(['difficulty' => 'normal', 'initials' => 'SOL', 'score' => 1, 'rounds' => 1, 'seed' => 's', 'source' => 'solo']));
        $this->assertSame(1, board_file(['difficulty' => 'normal', 'initials' => 'TOP', 'score' => 9999, 'rounds' => 1, 'seed' => 's', 'source' => 'solo']));
        $this->assertCount(BOARD_KEEP, board_top('normal', 1000));
    }
}
