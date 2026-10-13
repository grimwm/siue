<?php
// games/tankity/test/php/LegacyImportTest.php
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

/* The per-callsign runs live in the database; the old files are imported
   once, losing nothing, and deleted only once their import has committed. */
final class LegacyImportTest extends TestCase
{
    private string $dir;
    private string $old;
    private string|false $errorLog;

    public static function setUpBeforeClass(): void
    {
        require_once __DIR__ . '/rooms-lib.php';
    }

    protected function setUp(): void
    {
        $this->dir = tankity_test_dir();
        $this->old = $this->dir . '/old';
        mkdir($this->old, 0700);
        putenv('TANKITY_SCORES_DIR=' . $this->old);
        $this->errorLog = ini_set('error_log', $this->dir . '/setup.log');
    }

    protected function tearDown(): void
    {
        ini_set('error_log', $this->errorLog === false ? '' : $this->errorLog);
        putenv('TANKITY_SCORES_DIR');
        tankity_test_rm($this->dir);
    }

    private function file(string $slug, array $runs): string
    {
        $path = $this->old . "/$slug-operation-tankity.json";
        file_put_contents($path, json_encode(['name' => $slug, 'runs' => $runs, 'best' => max(array_column($runs, 'score'))]));
        return $path;
    }

    private function entry(int $score, string $ts): array
    {
        return ['score' => $score, 'banked' => 2, 'won' => false, 'seed' => 's' . $score, 'ts' => $ts];
    }

    private function runs(string $slug): array
    {
        return legacy_read(tankity_db(), $slug)['runs'];
    }

    public function testEveryRunOfEveryFileArrivesAndTheFilesGo(): void
    {
        $runs = [];
        for ($i = 0; $i < 60; $i++) {
            $runs[] = $this->entry(10 + $i, sprintf('2026-01-01T00:%02d:00+00:00', $i));
        }
        $a = $this->file('wg', $runs);
        $b = $this->file('r2-d2', [$this->entry(450, '2026-03-01T00:00:00+00:00')]);
        $this->assertSame([2, 2], legacy_import());
        $this->assertCount(60, $this->runs('wg'), 'the import keeps every run, past the 50 a new file keeps');
        $this->assertSame(69, legacy_read(tankity_db(), 'wg')['best']);
        $this->assertSame([450], array_column($this->runs('r2-d2'), 'score'));
        $this->assertFileDoesNotExist($a);
        $this->assertFileDoesNotExist($b);
    }

    public function testAnInterruptedImportResumesWithoutDuplicates(): void
    {
        $path = $this->file('wg', [$this->entry(100, '2026-01-01T00:00:00+00:00'), $this->entry(200, '2026-01-02T00:00:00+00:00')]);
        $copy = (string) file_get_contents($path);
        legacy_import();
        file_put_contents($path, $copy); // as if the request died between the commit and the delete
        $this->assertSame([1, 1], legacy_import());
        $this->assertSame([100, 200], array_column($this->runs('wg'), 'score'));
    }

    public function testRunsAlreadyInTheDatabaseMergeWithTheFile(): void
    {
        legacy_write(tankity_db(), 'wg', ['name' => 'wg', 'runs' => [$this->entry(300, '2026-05-01T00:00:00+00:00')]]);
        $this->file('wg', [$this->entry(100, '2026-01-01T00:00:00+00:00')]);
        legacy_import();
        $this->assertSame([100, 300], array_column($this->runs('wg'), 'score'), 'merged, oldest first');
    }

    public function testIdenticalRunsInOneFileAreAllKeptAndNeverAddedTwice(): void
    {
        $same = $this->entry(100, '2026-01-01T00:00:00+00:00');
        $path = $this->file('wg', [$same, $same]);
        $copy = (string) file_get_contents($path);
        legacy_import();
        $this->assertSame([100, 100], array_column($this->runs('wg'), 'score'));
        file_put_contents($path, $copy);
        legacy_import();
        $this->assertSame([100, 100], array_column($this->runs('wg'), 'score'));
    }

    public function testAFileThatChangedIsKeptForTheNextPass(): void
    {
        $path = $this->file('wg', [$this->entry(100, '2026-01-01T00:00:00+00:00')]);
        legacy_import(null, LEGACY_IMPORT_BATCH, null, function () use ($path): void {
            $this->file('wg', [$this->entry(100, '2026-01-01T00:00:00+00:00'), $this->entry(150, '2026-01-03T00:00:00+00:00')]);
        });
        $this->assertFileExists($path);
        legacy_import();
        $this->assertFileDoesNotExist($path);
        $this->assertSame([100, 150], array_column($this->runs('wg'), 'score'));
    }

    public function testAnUnreadableFileIsLeftAlone(): void
    {
        file_put_contents($this->old . '/bad-operation-tankity.json', '{not json');
        $this->assertSame([0, 0], legacy_import());
        $this->assertFileExists($this->old . '/bad-operation-tankity.json');
    }

    public function testALinkOrAnOversizedFileIsNotOursToTake(): void
    {
        $real = $this->file('real', [$this->entry(5, '2026-01-01T00:00:00+00:00')]);
        rename($real, $this->dir . '/elsewhere.json');
        symlink($this->dir . '/elsewhere.json', $real);
        file_put_contents($this->old . '/big-operation-tankity.json', json_encode(['runs' => [$this->entry(1, 'x')], 'pad' => str_repeat('x', LEGACY_FILE_MAX)]));
        $this->assertSame([0, 0], legacy_import());
        $this->assertFileExists($this->dir . '/elsewhere.json');
    }

    public function testEverySkippedFileIsLoggedWithItsReason(): void
    {
        $log = $this->dir . '/php.log';
        $prev = ini_set('error_log', $log);
        try {
            file_put_contents($this->old . '/bad-operation-tankity.json', '{not json');
            file_put_contents($this->old . '/empty-operation-tankity.json', '{"name":"empty"}');
            file_put_contents($this->old . '/big-operation-tankity.json', str_repeat('x', LEGACY_FILE_MAX + 1));
            file_put_contents($this->dir . '/target.json', '{}');
            symlink($this->dir . '/target.json', $this->old . '/link-operation-tankity.json');
            $this->file('good', [$this->entry(5, '2026-01-01T00:00:00+00:00')]);
            $this->assertSame([1, 1], legacy_import());
        } finally {
            ini_set('error_log', (string) $prev);
        }
        $lines = array_values(array_filter(explode("\n", (string) file_get_contents($log))));
        $this->assertCount(4, $lines, 'one line per skipped file, none for the good one');
        $text = implode("\n", $lines);
        foreach ([
            '/bad-operation-tankity.json is not valid JSON',
            '/empty-operation-tankity.json has no runs list',
            '/big-operation-tankity.json is too big to be a score file',
            '/link-operation-tankity.json is not a plain file',
        ] as $want) {
            $this->assertStringContainsString($want, $text);
        }
    }

    public function testOldTempFilesGoAndFreshOnesStay(): void
    {
        $stale = $this->old . '/wg-operation-tankity.json.tmp.123';
        $fresh = $this->old . '/wg-operation-tankity.json.tmp.456';
        file_put_contents($stale, 'x');
        file_put_contents($fresh, 'x');
        touch($stale, time() - 7200);
        legacy_import();
        $this->assertFileDoesNotExist($stale);
        $this->assertFileExists($fresh);
    }

    public function testABatchIsBounded(): void
    {
        foreach (['a', 'b', 'c'] as $s) {
            $this->file($s, [$this->entry(1, '2026-01-01T00:00:00+00:00')]);
        }
        $this->assertSame([2, 2], legacy_import(null, 2));
        $this->assertSame([1, 1], legacy_import(null, 2));
    }

    public function testAnImportedFileThatSurvivesIsNotFiledAgainAfterConversion(): void
    {
        $path = $this->file('wg', [$this->entry(640, '2026-01-01T00:00:00+00:00')]);
        $copy = file_get_contents($path);
        legacy_import();
        $this->assertSame(1, board_convert_callsigns());
        file_put_contents($path, $copy); // another deployment wrote the file back
        legacy_import();
        board_convert_callsigns();
        legacy_import();
        board_convert_callsigns();
        $this->assertCount(1, board_top('normal', 10));
    }

    public function testARewrittenFileDoesNotFileTheSameRunTwice(): void
    {
        $path = $this->file('wg', [$this->entry(640, '2026-01-01T00:00:00+00:00')]);
        legacy_import();
        board_convert_callsigns();
        // Another deployment rewrites the file with one more run: the bytes differ,
        // the old run is the one already on the board.
        $this->file('wg', [$this->entry(640, '2026-01-01T00:00:00+00:00'), $this->entry(100, '2026-03-01T00:00:00+00:00')]);
        legacy_import();
        board_convert_callsigns();
        $scores = array_column(board_top('normal', 10), 'score');
        $this->assertSame(1, count(array_keys($scores, 640)), 'the 640 run is on the board once');
    }
}
