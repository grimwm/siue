<?php
// The one-time move of the single-studio tables and files into the owner's account: every row gains the
// owner's account, draft files move under it with their text gzipped, a second open changes nothing, and
// a throw or a crash part way leaves every draft readable under the layout the database records.
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

require_once __DIR__ . '/MusicFakes.php';

/** A connection whose next COMMIT throws; with $hide, it also reports no open transaction, as a process that died would leave things. */
final class FailingCommitPdo extends PDO
{
    public bool $failCommit = true;
    public bool $hide = false;

    public function exec(string $statement): int|false
    {
        if ($statement === 'COMMIT' && $this->failCommit) {
            $this->failCommit = false;
            throw new PDOException('disk I/O error');
        }
        return parent::exec($statement);
    }

    public function inTransaction(): bool
    {
        return !$this->hide && parent::inTransaction();
    }
}

final class MusicMigrationTest extends TestCase
{
    private const NOTE_A = '0123456789abcdef0123456789abcdef';
    private const NOTE_B = 'fedcba9876543210fedcba9876543210';

    private string $data;
    private string $dir;
    /** @var array<string, string> "piece/version/name" => the bytes stored before the move */
    private array $files = [];
    /** @var array<string, string> note id => sealed bytes */
    private array $notes = [];

    /** The tables and files as the single-studio workroom left them. */
    protected function setUp(): void
    {
        $this->data = admin_tmp_dir();
        $db = Admin\Db::open($this->data);
        $db->exec('CREATE TABLE music_notes (id TEXT PRIMARY KEY, size INTEGER NOT NULL, sha256 TEXT NOT NULL, arrived_at INTEGER NOT NULL, picked_up_at INTEGER)');
        $db->exec("CREATE TABLE music_drafts (piece TEXT NOT NULL, version INTEGER NOT NULL, published_at INTEGER NOT NULL, size INTEGER NOT NULL, project_id TEXT NOT NULL DEFAULT '', project_name TEXT NOT NULL DEFAULT '', kind TEXT NOT NULL DEFAULT 'music', PRIMARY KEY (piece, version))");
        $db->exec("CREATE TABLE music_keyring (id INTEGER PRIMARY KEY CHECK (id = 1), locked TEXT NOT NULL, uploaded_at INTEGER NOT NULL, current_fp TEXT NOT NULL DEFAULT '', previous_fps TEXT NOT NULL DEFAULT '[]')");
        $db->prepare('INSERT INTO music_keyring (id, locked, uploaded_at, current_fp, previous_fps) VALUES (1, ?, 5, ?, ?)')
            ->execute(['{"v":1,"ct":"locked"}', MUSIC_FP_CURRENT, json_encode([MUSIC_FP_PREVIOUS])]);
        $this->dir = $this->data . '/music';
        foreach ([$this->dir, "{$this->dir}/notes", "{$this->dir}/drafts"] as $d) {
            mkdir($d, 0700);
            chmod($d, 0700);
        }
        $note = $db->prepare('INSERT INTO music_notes (id, size, sha256, arrived_at, picked_up_at) VALUES (?, ?, ?, ?, ?)');
        foreach ([self::NOTE_A => null, self::NOTE_B => 30] as $id => $picked) {
            $bytes = music_sealed(MUSIC_FP_CURRENT, 300);
            $this->notes[$id] = $bytes;
            file_put_contents("{$this->dir}/notes/$id.sealed", $bytes);
            $note->execute([$id, strlen($bytes), hash('sha256', $bytes), 20, $picked]);
        }
        $score = json_encode(['piece' => ['title' => 'The Labyrinth'], 'lanes' => array_fill(0, 40, ['notes' => [60, 62, 64, 65, 67]])]);
        $drafts = [
            // A piece whose id is also the owner's account id: the old and new layouts must never be confused.
            ['1', 1, 10, ['score.json' => '{"piece":{"title":"One"}}'], ['crete', 'Crete', 'music']],
            ['ch1-labyrinth', 1, 20, ['score.json' => $score, 'score.musicxml' => '<score-partwise>' . str_repeat('<note/>', 300) . '</score-partwise>', 'audio.webm' => "\x1A\x45\xDF\xA3" . random_bytes(500)], ['crete', 'Crete', 'music']],
            ['ch1-labyrinth', 2, 20, ['score.json' => $score . ' '], ['crete', 'Crete', 'music']],
            ['cannon-fire', 3, 40, ['score.json' => '{}', 'spectrogram.png' => "\x89PNG" . random_bytes(64)], ['tankity', 'Tankity', 'sound']],
        ];
        $row = $db->prepare('INSERT INTO music_drafts (piece, version, published_at, size, project_id, project_name, kind) VALUES (?, ?, ?, ?, ?, ?, ?)');
        foreach ($drafts as [$piece, $v, $at, $files, $about]) {
            @mkdir("{$this->dir}/drafts/$piece/$v", 0700, true);
            foreach ($files as $name => $bytes) {
                file_put_contents("{$this->dir}/drafts/$piece/$v/$name", $bytes);
                $this->files["$piece/$v/$name"] = $bytes;
            }
            $row->execute([$piece, $v, $at, array_sum(array_map('strlen', $files)), ...$about]);
        }
    }

    /** Opens the store as music_run() does: the owner's account first, then the store. @return array{Music\Store, PDO, int} */
    private function open(?PDO $db = null): array
    {
        $db ??= Admin\Db::open($this->data);
        $clock = new FakeClock(1_800_000_000);
        $people = Admin\People::fromJson('{}');
        $accounts = new Music\Accounts($db, $clock, $people);
        $owner = $accounts->ownerId();
        return [new Music\Store($db, $this->dir, $clock, $owner, Music\Limits::for($people, Admin\Auth::OWNER), $accounts), $db, $owner];
    }

    private function failingConnection(): FailingCommitPdo
    {
        return new FailingCommitPdo('sqlite:' . $this->data . '/' . Admin\Db::FILE, null, null, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
    }

    /** Every file under $dir, relative path => bytes. @return array<string, string> */
    private function tree(string $dir): array
    {
        $out = [];
        if (!is_dir($dir)) {
            return $out;
        }
        $it = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($dir, FilesystemIterator::SKIP_DOTS));
        foreach ($it as $f) {
            $out[substr((string) $f, strlen($dir) + 1)] = (string) file_get_contents((string) $f);
        }
        ksort($out);
        return $out;
    }

    private function assertEveryDraftReads(Music\Store $s): void
    {
        foreach ($this->files as $key => $bytes) {
            [$piece, $v, $name] = explode('/', $key);
            self::assertSame($bytes, $s->draftBytes($piece, (int) $v, $name), $key);
        }
    }

    /** @return list<string> */
    private function columns(PDO $db, string $table): array
    {
        return array_column($db->query("PRAGMA table_info($table)")->fetchAll(PDO::FETCH_ASSOC), 'name');
    }

    public function testTheOwnersNotesDraftsAndKeyringBecomeTheOwnersAccount(): void
    {
        [$s, $db, $owner] = $this->open();
        self::assertSame(Admin\Auth::OWNER, $db->query('SELECT email FROM accounts')->fetchColumn(), 'the owner\'s is the only account');
        foreach (['music_notes', 'music_drafts', 'music_keyring'] as $table) {
            self::assertContains('account_id', $this->columns($db, $table), $table);
            self::assertSame([$owner], array_map('intval', $db->query("SELECT DISTINCT account_id FROM $table")->fetchAll(PDO::FETCH_COLUMN)), $table);
        }
        $pk = static fn(string $t): array => array_column(array_filter($db->query("PRAGMA table_info($t)")->fetchAll(PDO::FETCH_ASSOC), static fn(array $c): bool => $c['pk'] > 0), 'name');
        self::assertSame(['account_id', 'piece', 'version'], $pk('music_drafts'));
        self::assertSame(['account_id'], $pk('music_keyring'));
        self::assertStringNotContainsString('id = 1', (string) $db->query("SELECT sql FROM sqlite_master WHERE name = 'music_keyring'")->fetchColumn());
        self::assertContains('account_id', $db->query("SELECT ii.name FROM pragma_index_list('music_notes') il JOIN pragma_index_info(il.name) ii")->fetchAll(PDO::FETCH_COLUMN), 'notes are indexed by account');

        self::assertSame(['locked' => '{"v":1,"ct":"locked"}', 'uploaded_at' => 5, 'current' => MUSIC_FP_CURRENT, 'previous' => [MUSIC_FP_PREVIOUS]], $s->keyring());
        self::assertSame([self::NOTE_A, self::NOTE_B], array_column($s->notes(), 'id'));
        self::assertSame([self::NOTE_A], array_column($s->notes('waiting'), 'id'));
        foreach ($this->notes as $id => $bytes) {
            self::assertSame($bytes, $s->noteBytes($id));
        }
        self::assertSame(
            [['cannon-fire', 3, 'tankity', 'sound'], ['ch1-labyrinth', 2, 'crete', 'music'], ['ch1-labyrinth', 1, 'crete', 'music'], ['1', 1, 'crete', 'music']],
            array_map(static fn(array $d): array => [$d['piece'], $d['version'], $d['project_id'], $d['kind']], $s->drafts()),
            'newest first, and drafts published in the same second keep their order',
        );
        $s->addNote(music_sealed());
        self::assertSame(['current' => MUSIC_FP_CURRENT, 'previous' => [MUSIC_FP_PREVIOUS]], Music\Store::fingerprintsIn($db, $owner));
    }

    public function testDraftFilesMoveUnderTheAccountAndTextIsGzipped(): void
    {
        [$s, $db, $owner] = $this->open();
        $base = "{$this->dir}/drafts/$owner";
        foreach ($this->files as $key => $bytes) {
            $text = str_starts_with(basename($key), 'score.');
            $path = "$base/$key" . ($text ? '.gz' : '');
            self::assertFileExists($path, $key);
            self::assertSame($bytes, $text ? gzdecode((string) file_get_contents($path)) : file_get_contents($path), $key);
            self::assertSame(0, fileperms($path) & 0077, "$key is private");
            if ($text) {
                self::assertFileDoesNotExist("$base/$key");
            }
        }
        self::assertSame([(string) $owner], array_values(array_diff(scandir("{$this->dir}/drafts"), ['.', '..'])), 'nothing is left at the old paths');
        self::assertDirectoryDoesNotExist("{$this->dir}/drafts.old");
        self::assertDirectoryDoesNotExist("{$this->dir}/drafts.new");
        $sizes = $db->query('SELECT piece, version, size FROM music_drafts')->fetchAll(PDO::FETCH_ASSOC);
        foreach ($sizes as $row) {
            $stored = 0;
            foreach (glob("$base/{$row['piece']}/{$row['version']}/*") as $f) {
                $stored += filesize($f);
            }
            self::assertSame($stored, (int) $row['size'], "{$row['piece']} v{$row['version']} counts its stored bytes");
        }
        self::assertLessThan(strlen($this->files['ch1-labyrinth/2/score.json']), (int) $db->query("SELECT size FROM music_drafts WHERE piece = 'ch1-labyrinth' AND version = 2")->fetchColumn());
        $this->assertEveryDraftReads($s);
    }

    public function testASecondOpenChangesNothing(): void
    {
        [$s, $db] = $this->open();
        $snapshot = function () use ($db): array {
            $rows = [];
            foreach (['accounts', 'migrations', 'music_notes', 'music_drafts', 'music_keyring'] as $t) {
                $rows[$t] = $db->query("SELECT rowid, * FROM $t ORDER BY rowid")->fetchAll(PDO::FETCH_ASSOC);
            }
            $rows['schema'] = $db->query("SELECT name, sql FROM sqlite_master ORDER BY name")->fetchAll(PDO::FETCH_ASSOC);
            return [$rows, $this->tree($this->dir)];
        };
        $before = $snapshot();
        [$again] = $this->open();
        $this->open();
        self::assertSame($before, $snapshot());
        $this->assertEveryDraftReads($again);
        self::assertSame(1, (int) $db->query("SELECT COUNT(*) FROM migrations WHERE name = 'music-accounts-1'")->fetchColumn());
    }

    public function testAThrowMidMigrationLeavesEveryDraftReadable(): void
    {
        $failing = $this->failingConnection();
        try {
            $this->open($failing);
            self::fail('the COMMIT threw');
        } catch (PDOException $e) {
            self::assertSame('disk I/O error', $e->getMessage());
        }
        $db = Admin\Db::open($this->data);
        self::assertNotContains('account_id', $this->columns($db, 'music_drafts'), 'the database still records the old layout');
        self::assertSame(0, (int) $db->query("SELECT COUNT(*) FROM migrations WHERE name = 'music-accounts-1'")->fetchColumn());
        $files = $this->files;
        ksort($files);
        self::assertSame($files, $this->tree("{$this->dir}/drafts"), 'and every draft is back where it records them, byte for byte');
        self::assertDirectoryDoesNotExist("{$this->dir}/drafts.old");
        self::assertDirectoryDoesNotExist("{$this->dir}/drafts.new");
        [$s] = $this->open($db);
        $this->assertEveryDraftReads($s);
    }

    public function testACrashAfterTheFilesMovedAndBeforeTheCommitIsPutRightOnTheNextOpen(): void
    {
        $dying = $this->failingConnection();
        $dying->hide = true; // once() can neither undo nor roll back: the process is gone
        try {
            $this->open($dying);
            self::fail('the COMMIT threw');
        } catch (PDOException) {
        }
        $dying->exec('ROLLBACK'); // what SQLite does with a dead process's journal
        unset($dying);
        self::assertDirectoryExists("{$this->dir}/drafts.old", 'the old files were set aside, uncommitted');
        $db = Admin\Db::open($this->data);
        self::assertNotContains('account_id', $this->columns($db, 'music_drafts'));
        [$s, , $owner] = $this->open($db);
        $this->assertEveryDraftReads($s);
        self::assertSame([(string) $owner], array_values(array_diff(scandir("{$this->dir}/drafts"), ['.', '..'])));
        self::assertDirectoryDoesNotExist("{$this->dir}/drafts.old");
        self::assertDirectoryDoesNotExist("{$this->dir}/drafts.new");
    }

    public function testACrashAfterTheCommitLeavesOnlyLeftoversTheNextOpenClearsAway(): void
    {
        [, , $owner] = $this->open();
        mkdir("{$this->dir}/drafts.old/ch1-labyrinth/1", 0700, true);
        file_put_contents("{$this->dir}/drafts.old/ch1-labyrinth/1/score.json", 'old');
        [$s] = $this->open();
        self::assertDirectoryDoesNotExist("{$this->dir}/drafts.old");
        $this->assertEveryDraftReads($s);
        self::assertSame([(string) $owner], array_values(array_diff(scandir("{$this->dir}/drafts"), ['.', '..'])));
    }
}
