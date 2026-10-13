<?php
// games/tankity/test/php/BoardTest.php
declare(strict_types=1);

use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

/* The boards: one per difficulty, best runs first, ties keep the older run
   ahead, the best BOARD_KEEP kept per board, and the per-callsign rows from
   before the boards converted once onto the Normal board. */
final class BoardTest extends TestCase
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

    private function entry(string $who, int $score, string $level = 'normal'): array
    {
        return ['difficulty' => $level, 'initials' => $who, 'score' => $score, 'rounds' => 1, 'seed' => 's'];
    }

    public function testFilesAndRanksBestFirst(): void
    {
        $this->assertSame(1, board_file($this->entry('AAA', 300)));
        $this->assertSame(1, board_file($this->entry('BBB', 500)));
        $this->assertSame(3, board_file($this->entry('CCC', 100)));
        $this->assertSame(['BBB', 'AAA', 'CCC'], array_column(board_top('normal', 10), 'initials'));
        $this->assertSame([1, 2, 3], array_column(board_top('normal', 10), 'place'));
    }

    public function testEachDifficultyHasItsOwnBoard(): void
    {
        $this->assertSame(1, board_file($this->entry('EZE', 100, 'easy')));
        $this->assertSame(1, board_file($this->entry('HRD', 50, 'hard')));
        $this->assertSame(1, board_file($this->entry('NRM', 10)));
        $this->assertSame(['EZE'], array_column(board_top('easy', 10), 'initials'));
        $this->assertSame(['HRD'], array_column(board_top('hard', 10), 'initials'));
        $this->assertSame(['NRM'], array_column(board_top('normal', 10), 'initials'));
        $this->assertSame(BOARD_LEVELS, array_keys(ROOM_DIFFICULTY), 'the boards are the drones\' levels');
    }

    public function testAnUnknownDifficultyIsNotABoard(): void
    {
        $this->assertNull(board_level('brutal'));
        $this->assertNull(board_level(null));
        $this->assertSame('hard', board_level('hard'));
        $this->expectException(InvalidArgumentException::class);
        board_file($this->entry('BAD', 1, 'brutal'));
    }

    public function testTiesKeepTheOlderRunAhead(): void
    {
        board_file($this->entry('OLD', 200));
        $this->assertSame(2, board_file($this->entry('NEW', 200)));
        $this->assertSame(['OLD', 'NEW'], array_column(board_top('normal', 2), 'initials'));
    }

    public function testKeepsTheBestAndARunBelowThemDoesNotPlace(): void
    {
        for ($i = 0; $i < BOARD_KEEP; $i++) {
            board_file($this->entry('TOP', 1000 + $i));
        }
        $this->assertNull(board_file($this->entry('LOW', 1)));
        $this->assertCount(BOARD_KEEP, board_top('normal', BOARD_KEEP + 5));
        $this->assertSame(1, board_file($this->entry('LOW', 1, 'easy')), 'another board is not full');
    }

    /** @return iterable<string, array{string, string}> */
    public static function callsigns(): iterable
    {
        yield 'two letters pad with X' => ['bo', 'BOX'];
        yield 'digits and dashes drop' => ['r2-d2', 'RDX'];
        yield 'long names cut' => ['tankity-ace', 'TAN'];
        yield 'no letters is XXX, which is blocked' => ['123', 'AAA'];
        yield 'empty' => ['', 'AAA'];
        yield 'a blocked set' => ['ass', 'AAA'];
        yield 'already three' => ['wgr', 'WGR'];
    }

    #[DataProvider('callsigns')]
    public function testOddCallsignsConvert(string $name, string $want): void
    {
        $this->assertSame($want, board_convert_name($name, tankity_guard()));
    }

    public function testConvertsCallsignRowsOnceOntoTheNormalBoard(): void
    {
        legacy_write(tankity_db(), 'wg', ['runs' => [
            ['score' => 10, 'banked' => 0, 'won' => false, 'seed' => 'a', 'ts' => '2026-01-01T00:00:00+00:00'],
            ['score' => 900, 'banked' => 4, 'won' => false, 'seed' => 'b', 'ts' => '2026-02-01T00:00:00+00:00'],
        ]]);
        legacy_write(tankity_db(), 'r2-d2', ['runs' => [['score' => 450, 'banked' => 2, 'won' => false, 'seed' => 'c', 'ts' => '2026-03-01T00:00:00+00:00']]]);
        $this->assertSame(2, board_convert_callsigns());
        $top = board_top('normal', 10);
        $this->assertSame(['WGX', 'RDX'], array_column($top, 'initials'));
        $this->assertSame([900, 450], array_column($top, 'score'));
        $this->assertSame([4, 'b', '2026-02-01T00:00:00+00:00'], [$top[0]['rounds'], $top[0]['seed'], $top[0]['at']]);
        $this->assertSame(0, (int) tankity_db()->query('SELECT COUNT(*) FROM callsigns')->fetchColumn());
        $this->assertSame(0, board_convert_callsigns(), 'nothing is converted twice');
        $this->assertSame(['client', 'client'], tankity_db()->query('SELECT source FROM board ORDER BY id')->fetchAll(PDO::FETCH_COLUMN), 'a legacy callsign was a browser claim');
        $this->assertSame([], board_top('easy', 10));
    }

    public function testEqualScoresKeepTheOlderRunAhead(): void
    {
        foreach (['zed' => '2026-01-01T00:00:00+00:00', 'amy' => '2026-02-01T00:00:00+00:00'] as $name => $ts) {
            legacy_write(tankity_db(), $name, ['runs' => [['score' => 100, 'banked' => 1, 'won' => false, 'seed' => $name, 'ts' => $ts]]]);
        }
        board_convert_callsigns();
        $this->assertSame(['ZED', 'AMY'], array_column(board_top('normal', 10), 'initials'));
    }

    public function testARunWithoutADateIsDatedByTheConversion(): void
    {
        legacy_write(tankity_db(), 'old', ['runs' => [['score' => 5, 'banked' => 0, 'won' => false, 'seed' => 'x']]]);
        board_convert_callsigns();
        $this->assertNotSame('', board_top('normal', 1)[0]['at']);
    }

    public function testTheSourceColumnRelabelsRowsThatAreNotRoomMatches(): void
    {
        $db = new PDO('sqlite::memory:');
        $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        foreach ([1, 2, 3] as $v) {
            foreach (tankity_schema_steps()[$v] as $q) {
                $db->exec($q);
            }
        }
        $db->exec('PRAGMA user_version = 3');
        $ins = $db->prepare("INSERT INTO board (difficulty, initials, score, rounds, seed, at) VALUES ('normal', ?, 1, 1, ?, 'x')");
        $ins->execute(['OLD', 's']);
        $ins->execute(['RUM', 'room:ABCD']);
        tankity_schema($db);
        $this->assertSame(['OLD' => 'client', 'RUM' => 'room'], $db->query('SELECT initials, source FROM board')->fetchAll(PDO::FETCH_KEY_PAIR));
    }

    public function testADatelessRunConvertedOnceIsRecognisedAfterwards(): void
    {
        legacy_write(tankity_db(), 'old', ['runs' => [['score' => 5, 'banked' => 0, 'won' => false, 'seed' => 'x']]]);
        board_convert_callsigns();
        $this->assertTrue(board_has_run(board_convert_name('old', tankity_guard()), ['score' => 5, 'banked' => 0, 'seed' => 'x']));
    }

    public function testARowWithNoRunIsDroppedWithALogLine(): void
    {
        legacy_write(tankity_db(), 'void', ['runs' => []]);
        $log = tempnam(sys_get_temp_dir(), 'log');
        $was = ini_set('error_log', $log);
        board_convert_callsigns();
        ini_set('error_log', (string) $was);
        $this->assertStringContainsString('callsign void has no readable run', (string) file_get_contents($log));
        unlink($log);
        $this->assertSame(0, (int) tankity_db()->query('SELECT COUNT(*) FROM callsigns')->fetchColumn());
    }

    public function testAFailurePartWayLeavesTheUnconvertedRowsAlone(): void
    {
        legacy_write(tankity_db(), 'fine', ['runs' => [['score' => 10, 'banked' => 0, 'won' => false, 'seed' => 'a', 'ts' => '2026-01-01T00:00:00+00:00']]]);
        legacy_write(tankity_db(), 'bom', ['runs' => [['score' => 20, 'banked' => 0, 'won' => false, 'seed' => 'b', 'ts' => '2026-02-01T00:00:00+00:00']]]);
        tankity_db()->exec("CREATE TRIGGER fail_bom BEFORE INSERT ON board WHEN NEW.initials = 'BOM' BEGIN SELECT RAISE(ABORT, 'boom'); END");
        try {
            board_convert_callsigns();
            $this->fail('the failing row should have thrown');
        } catch (PDOException) {
        }
        $this->assertSame(['FIN'], array_column(board_top('normal', 10), 'initials'));
        $this->assertSame(['bom'], tankity_db()->query('SELECT slug FROM callsigns')->fetchAll(PDO::FETCH_COLUMN));
    }

    public function testTheLiveCallsignsAllSurviveTheConversion(): void
    {
        foreach (['wmg' => 400, 'bob' => 300, 'test2' => 200, 'test' => 100] as $name => $score) {
            legacy_write(tankity_db(), $name, ['runs' => [['score' => $score, 'banked' => 1, 'won' => false, 'seed' => $name, 'ts' => '2026-01-01T00:00:00+00:00']]]);
        }
        $this->assertSame(4, board_convert_callsigns());
        $top = board_top('normal', 10);
        $this->assertSame(['WMG', 'BOB', 'TES', 'TES'], array_column($top, 'initials'));
        $this->assertSame([400, 300, 200, 100], array_column($top, 'score'), 'two callsigns that share initials both keep their row');
    }

    public function testTheGuardKeepsItsRunsInTheStorageDirectory(): void
    {
        $this->assertNotNull(tankity_guard([], ['HTTP_HOST' => 'localhost', 'REMOTE_ADDR' => '192.0.2.1'], [], fn(): int => 1_000_000, function (): void {})->startRun());
        $this->assertFileExists($this->dir . '/' . TANKITY_GUARD_RUNS);
    }

    public function testASavepointKeepsAFailedFilingOutOfTheOuterTransaction(): void
    {
        $db = tankity_db();
        tankity_tx($db, function () {
            board_file($this->entry('AAA', 5));
            try {
                tankity_tx(tankity_db(), function (PDO $d) {
                    $d->exec("INSERT INTO board (difficulty, initials, score, rounds, seed, at) VALUES ('normal', 'BAD', 1, 0, '', '')");
                    throw new RuntimeException('after the insert');
                });
            } catch (RuntimeException) {
            }
        });
        $this->assertSame(['AAA'], array_column(board_top('normal', 10), 'initials'), 'the half-done insert did not commit');
    }
}
