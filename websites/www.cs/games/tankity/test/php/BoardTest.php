<?php
// games/tankity/test/php/BoardTest.php
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

/* The online boards: one per difficulty, room matches only, best runs first,
   ties keep the older run ahead, the best BOARD_KEEP kept per board. */
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
        return ['difficulty' => $level, 'initials' => $who, 'score' => $score, 'rounds' => 1, 'seed' => 's', 'source' => 'room'];
    }

    public function testARunMustSayWhoFiledIt(): void
    {
        foreach ([null, 'browser', '', 'solo'] as $source) {
            try {
                board_file(['source' => $source] + $this->entry('SRC', 1));
                $this->fail('filed with source ' . var_export($source, true));
            } catch (InvalidArgumentException) {
            }
        }
        $row = $this->entry('SRC', 1);
        unset($row['source']);
        $this->expectException(InvalidArgumentException::class);
        board_file($row);
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
        foreach (tankity_schema_steps()[4] as $q) {
            $db->exec($q);
        }
        $this->assertSame(['OLD' => 'client', 'RUM' => 'room'], $db->query('SELECT initials, source FROM board')->fetchAll(PDO::FETCH_KEY_PAIR));
    }

    public function testOnlyRoomRowsCanBeFiled(): void
    {
        $this->expectException(InvalidArgumentException::class);
        board_file(['source' => 'client'] + $this->entry('CLI', 1));
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
