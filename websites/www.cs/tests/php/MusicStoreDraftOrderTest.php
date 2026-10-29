<?php
// A draft's files go while its row's deletion is still uncommitted, under the same
// BEGIN IMMEDIATE that a publish writes its files under, so a publish of the same
// draft cannot slip in between and lose its new files: for a delete and for the
// eviction of a piece's oldest draft alike.
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

require_once __DIR__ . '/MusicFakes.php';

/** A connection that runs $beforeCommit just before each COMMIT. */
final class CommitSpyPdo extends PDO
{
    /** @var (Closure(): void)|null */
    public ?Closure $beforeCommit = null;

    public function exec(string $statement): int|false
    {
        if ($statement === 'COMMIT' && $this->beforeCommit !== null) {
            ($this->beforeCommit)();
        }
        return parent::exec($statement);
    }
}

final class MusicStoreDraftOrderTest extends TestCase
{
    private Music\Store $store;
    private CommitSpyPdo $db;
    private string $dir;

    protected function setUp(): void
    {
        $data = admin_tmp_dir();
        Admin\Db::open($data);
        $this->db = new CommitSpyPdo('sqlite:' . $data . '/' . Admin\Db::FILE, null, null, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
        $this->dir = admin_tmp_dir() . '/music';
        $this->store = new Music\Store($this->db, $this->dir, new FakeClock(1_800_000_000));
    }

    private function files(): array
    {
        return ['score.json' => '{}', 'audio.webm' => "\x1A\x45\xDF\xA3" . random_bytes(32)];
    }

    /** Records, at each COMMIT, whether $path still exists. @return ArrayObject<int, bool> */
    private function watch(string $path): ArrayObject
    {
        $seen = new ArrayObject();
        $this->db->beforeCommit = static function () use ($path, $seen): void {
            $seen[] = file_exists($path);
        };
        return $seen;
    }

    public function testADeletedDraftsFilesAreGoneBeforeItsDeletionCommits(): void
    {
        $this->store->putDraft('ch1-labyrinth', 1, $this->files());
        $versionDir = "{$this->dir}/drafts/ch1-labyrinth/1";
        self::assertFileExists("$versionDir/score.json");
        $seen = $this->watch($versionDir);
        self::assertTrue($this->store->deleteDraft('ch1-labyrinth', 1));
        self::assertSame([false], $seen->getArrayCopy(), 'the files were removed inside the transaction');
    }

    public function testAnEvictedDraftsFilesAreGoneBeforeThePublishCommits(): void
    {
        for ($v = 1; $v <= Music\Store::KEEP_DRAFTS; $v++) {
            $this->store->putDraft('ch1-labyrinth', $v, $this->files());
        }
        $oldest = "{$this->dir}/drafts/ch1-labyrinth/1";
        self::assertFileExists("$oldest/score.json");
        $seen = $this->watch($oldest);
        $this->store->putDraft('ch1-labyrinth', Music\Store::KEEP_DRAFTS + 1, $this->files());
        self::assertSame([false], $seen->getArrayCopy(), 'the evicted draft\'s files were removed inside the transaction');
        self::assertCount(Music\Store::KEEP_DRAFTS, $this->store->drafts('ch1-labyrinth'));
    }
}
