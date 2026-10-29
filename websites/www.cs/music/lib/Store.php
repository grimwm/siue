<?php
// The workroom's storage: sealed notes the server cannot read, immutable
// drafts under a count and a byte budget, and one locked keyring. Rows live in
// the admin database; the bytes live in private files beside it.
declare(strict_types=1);

namespace Music;

final class NoteRejected extends \RuntimeException
{
    /** @param string $reason too_large | full | bad_header | unknown_key | no_key */
    public function __construct(public readonly string $reason)
    {
        parent::__construct($reason);
    }
}

final class DraftRejected extends \RuntimeException
{
    /** @param string $reason bad_piece | bad_version | missing_file | bad_file | too_large | over_quota | exists | bad_score */
    public function __construct(public readonly string $reason)
    {
        parent::__construct($reason);
    }
}

final class Store
{
    public const MAGIC = 'SIUEN1';
    public const MAX_NOTE_BYTES = 2_097_152;
    public const MAX_NOTES = 2000;
    /** The most a draft request may carry, and so the most one draft holds: 8 MB. */
    public const MAX_REQUEST_BYTES = 8_388_608;
    /** Each piece keeps only this many drafts; a publish deletes that piece's older ones. */
    public const KEEP_DRAFTS = 20;
    /** The most the kept drafts may hold in total: 100 MB. */
    public const MAX_DRAFT_TOTAL_BYTES = 104_857_600;
    /** The upload: the locked keyring (about 4.5 KB per retained RSA-4096 key, room for a dozen rotations, 64 KB) plus the fingerprints beside it. */
    public const MAX_KEYRING_BYTES = 65_536 + 33 * 70;
    public const KINDS = ['music', 'sound'];
    public const DRAFT_FILES = ['score.json', 'score.musicxml', 'audio.webm', 'audio.m4a', 'spectrogram.png'];

    private const ID = '/^[0-9a-f]{32}$/D';
    /** The shape of a piece id and of a project id. */
    private const PIECE = '/^[a-z0-9][a-z0-9-]{0,47}$/D';
    /** The magic, the 32-byte fingerprint and the two-byte key length: the least a sealed note can be. */
    private const HEADER_BYTES = 40;

    private \Kit\StoreDir $files;

    /** $dir is <admin data dir>/music; claimed private (0700) with notes/ and drafts/ inside; creates the music tables. */
    public function __construct(private \PDO $db, private string $dir, private \Admin\Clock $clock)
    {
        $this->files = new \Kit\StoreDir('music storage:', \Admin\StorageUnavailable::class);
        $this->files->claim($dir, true);
        $this->files->claim("$dir/notes", true);
        $this->files->claim("$dir/drafts", true);
        $this->db->exec('CREATE TABLE IF NOT EXISTS music_notes (id TEXT PRIMARY KEY, size INTEGER NOT NULL, sha256 TEXT NOT NULL, arrived_at INTEGER NOT NULL, picked_up_at INTEGER)');
        $this->db->exec("CREATE TABLE IF NOT EXISTS music_drafts (piece TEXT NOT NULL, version INTEGER NOT NULL, published_at INTEGER NOT NULL, size INTEGER NOT NULL, project_id TEXT NOT NULL DEFAULT '', project_name TEXT NOT NULL DEFAULT '', kind TEXT NOT NULL DEFAULT 'music', PRIMARY KEY (piece, version))");
        // A database made before these columns existed gains them here; each is added only when the table lacks it.
        $have = array_column($this->db->query('PRAGMA table_info(music_drafts)')->fetchAll(\PDO::FETCH_ASSOC), 'name');
        foreach (['project_id' => "''", 'project_name' => "''", 'kind' => "'music'"] as $column => $default) {
            if (in_array($column, $have, true)) {
                continue;
            }
            try {
                $this->db->exec("ALTER TABLE music_drafts ADD COLUMN $column TEXT NOT NULL DEFAULT $default");
            } catch (\PDOException $e) {
                if (!str_contains($e->getMessage(), 'duplicate column')) { // another request added it between the check and the ALTER
                    throw $e;
                }
            }
        }
        $this->db->exec("CREATE TABLE IF NOT EXISTS music_keyring (id INTEGER PRIMARY KEY CHECK (id = 1), locked TEXT NOT NULL, uploaded_at INTEGER NOT NULL, current_fp TEXT NOT NULL DEFAULT '', previous_fps TEXT NOT NULL DEFAULT '[]')");
        // A keyring table made before the fingerprints were kept gains them here; its stored row counts as no key.
        $have = array_column($this->db->query('PRAGMA table_info(music_keyring)')->fetchAll(\PDO::FETCH_ASSOC), 'name');
        foreach (['current_fp' => "''", 'previous_fps' => "'[]'"] as $column => $default) {
            if (in_array($column, $have, true)) {
                continue;
            }
            try {
                $this->db->exec("ALTER TABLE music_keyring ADD COLUMN $column TEXT NOT NULL DEFAULT $default");
            } catch (\PDOException $e) {
                if (!str_contains($e->getMessage(), 'duplicate column')) { // another request added it between the check and the ALTER
                    throw $e;
                }
            }
        }
    }

    /** @return array{id: string, size: int, sha256: string, arrived_at: int} @throws NoteRejected */
    public function addNote(string $sealed): array
    {
        $size = strlen($sealed);
        if ($size > self::MAX_NOTE_BYTES) {
            throw new NoteRejected('too_large');
        }
        $prints = self::fingerprintsIn($this->db);
        if ($prints === null) {
            throw new NoteRejected('no_key');
        }
        if ($size < self::HEADER_BYTES || !str_starts_with($sealed, self::MAGIC)) {
            throw new NoteRejected('bad_header');
        }
        if (!in_array(bin2hex(substr($sealed, 6, 32)), [$prints['current'], ...$prints['previous']], true)) {
            throw new NoteRejected('unknown_key');
        }
        $id = bin2hex(random_bytes(16));
        $note = ['id' => $id, 'size' => $size, 'sha256' => hash('sha256', $sealed), 'arrived_at' => $this->clock->now()];
        $path = "{$this->dir}/notes/$id.sealed";
        $this->transaction(function () use ($sealed, $note, $path): void {
            if ((int) $this->db->query('SELECT COUNT(*) FROM music_notes')->fetchColumn() >= self::MAX_NOTES) {
                throw new NoteRejected('full');
            }
            $this->writeFile($path, $sealed);
            try {
                $this->db->prepare('INSERT INTO music_notes (id, size, sha256, arrived_at) VALUES (?, ?, ?, ?)')
                    ->execute([$note['id'], $note['size'], $note['sha256'], $note['arrived_at']]);
            } catch (\Throwable $e) {
                @unlink($path);
                throw $e;
            }
        });
        return $note;
    }

    /** @param 'waiting'|'picked-up'|null $state @return list<array{id: string, size: int, sha256: string, arrived_at: int, picked_up_at: ?int}> oldest first */
    public function notes(?string $state = null): array
    {
        $where = match ($state) {
            'waiting' => 'WHERE picked_up_at IS NULL',
            'picked-up' => 'WHERE picked_up_at IS NOT NULL',
            default => '',
        };
        $rows = $this->db->query("SELECT id, size, sha256, arrived_at, picked_up_at FROM music_notes $where ORDER BY arrived_at ASC, rowid ASC")->fetchAll(\PDO::FETCH_ASSOC);
        return array_map(static fn(array $r): array => [
            'id' => (string) $r['id'],
            'size' => (int) $r['size'],
            'sha256' => (string) $r['sha256'],
            'arrived_at' => (int) $r['arrived_at'],
            'picked_up_at' => $r['picked_up_at'] === null ? null : (int) $r['picked_up_at'],
        ], $rows);
    }

    public function noteBytes(string $id): ?string
    {
        if (preg_match(self::ID, $id) !== 1 || !$this->noteExists($id)) {
            return null;
        }
        $bytes = @file_get_contents("{$this->dir}/notes/$id.sealed");
        return $bytes === false ? null : $bytes;
    }

    /** true when the note exists (marking twice is fine). */
    public function markPickedUp(string $id): bool
    {
        if (preg_match(self::ID, $id) !== 1) {
            return false;
        }
        $this->db->prepare('UPDATE music_notes SET picked_up_at = ? WHERE id = ? AND picked_up_at IS NULL')->execute([$this->clock->now(), $id]);
        return $this->noteExists($id);
    }

    public function deleteNote(string $id): bool
    {
        if (preg_match(self::ID, $id) !== 1) {
            return false;
        }
        return $this->transaction(function () use ($id): bool {
            $gone = $this->db->prepare('DELETE FROM music_notes WHERE id = ?');
            $gone->execute([$id]);
            @unlink("{$this->dir}/notes/$id.sealed");
            return $gone->rowCount() > 0;
        });
    }

    public function deleteAllNotes(): int
    {
        return $this->transaction(function (): int {
            $ids = $this->db->query('SELECT id FROM music_notes')->fetchAll(\PDO::FETCH_COLUMN);
            $this->db->exec('DELETE FROM music_notes');
            foreach ($ids as $id) {
                @unlink("{$this->dir}/notes/$id.sealed");
            }
            return count($ids);
        });
    }

    public function waitingCount(): int
    {
        return (int) $this->db->query('SELECT COUNT(*) FROM music_notes WHERE picked_up_at IS NULL')->fetchColumn();
    }

    /**
     * Keeps one draft. In one transaction, before any file is written: refuses when the files total more than
     * MAX_REQUEST_BYTES (too_large), when the draft exists, or when the new draft plus every stored draft that
     * remains (all of them, less this piece's drafts older than its newest KEEP_DRAFTS - 1) total more than
     * MAX_DRAFT_TOTAL_BYTES (over_quota). After the files are written, deletes this piece's drafts (rows and files)
     * older than its newest KEEP_DRAFTS: each piece keeps its own history, and other pieces are never touched.
     * $about is taken from the validated score.json: project_id (matches validProjectId), project_name (1 to 80 characters) and
     * kind (one of KINDS); anything else throws DraftRejected('bad_score') before the transaction opens. null records no
     * project: '' and '' and 'music' (a published draft always has one).
     * @param array<string, string> $files published name => the file's bytes
     * @param array{project_id: string, project_name: string, kind: string}|null $about
     * @throws DraftRejected
     */
    public function putDraft(string $piece, int $version, array $files, ?array $about = null): void
    {
        if (!self::validPieceId($piece)) {
            throw new DraftRejected('bad_piece');
        }
        if ($version < 1 || $version > 9999) {
            throw new DraftRejected('bad_version');
        }
        if ($files === []) {
            throw new DraftRejected('missing_file');
        }
        foreach (array_keys($files) as $name) {
            if (!in_array($name, self::DRAFT_FILES, true)) {
                throw new DraftRejected('bad_file');
            }
        }
        $about ??= ['project_id' => '', 'project_name' => '', 'kind' => 'music'];
        if (!self::aboutIsKeepable($about)) {
            throw new DraftRejected('bad_score');
        }
        $evicted = $this->transaction(function () use ($piece, $version, $files, $about): array {
            $size = array_sum(array_map('strlen', $files));
            if ($size > self::MAX_REQUEST_BYTES) {
                throw new DraftRejected('too_large');
            }
            $exists = $this->db->prepare('SELECT 1 FROM music_drafts WHERE piece = ? AND version = ?');
            $exists->execute([$piece, $version]);
            if ($exists->fetchColumn() !== false) {
                throw new DraftRejected('exists');
            }
            $rollsOff = $this->db->prepare('SELECT COALESCE(SUM(size), 0) FROM (SELECT size FROM music_drafts WHERE piece = ? ORDER BY published_at DESC, rowid DESC LIMIT -1 OFFSET ' . (self::KEEP_DRAFTS - 1) . ')');
            $rollsOff->execute([$piece]);
            $remaining = (int) $this->db->query('SELECT COALESCE(SUM(size), 0) FROM music_drafts')->fetchColumn() - (int) $rollsOff->fetchColumn();
            if ($size + $remaining > self::MAX_DRAFT_TOTAL_BYTES) {
                throw new DraftRejected('over_quota');
            }
            $this->writeDraftFiles($piece, $version, $files);
            try {
                $this->db->prepare('INSERT INTO music_drafts (piece, version, published_at, size, project_id, project_name, kind) VALUES (?, ?, ?, ?, ?, ?, ?)')
                    ->execute([$piece, $version, $this->clock->now(), $size, $about['project_id'], $about['project_name'], $about['kind']]);
                $history = $this->db->prepare('SELECT piece, version FROM music_drafts WHERE piece = ? ORDER BY published_at DESC, rowid DESC LIMIT -1 OFFSET ' . self::KEEP_DRAFTS);
                $history->execute([$piece]);
                $old = $history->fetchAll(\PDO::FETCH_ASSOC);
                $drop = $this->db->prepare('DELETE FROM music_drafts WHERE piece = ? AND version = ?');
                foreach ($old as $row) {
                    $drop->execute([$row['piece'], $row['version']]);
                }
            } catch (\Throwable $e) {
                $this->removeDraftFiles($piece, $version);
                throw $e;
            }
            return $old;
        });
        foreach ($evicted as $row) {
            $this->removeDraftFiles((string) $row['piece'], (int) $row['version']);
        }
    }

    /** @return list<array{piece: string, version: int, published_at: int, project_id: string, project_name: string, kind: string}> newest first */
    public function drafts(?string $piece = null): array
    {
        $q = $this->db->prepare('SELECT piece, version, published_at, project_id, project_name, kind FROM music_drafts WHERE (? IS NULL OR piece = ?) ORDER BY published_at DESC, rowid DESC');
        $q->execute([$piece, $piece]);
        return array_map(static fn(array $r): array => [
            'piece' => (string) $r['piece'],
            'version' => (int) $r['version'],
            'published_at' => (int) $r['published_at'],
            'project_id' => (string) $r['project_id'],
            'project_name' => (string) $r['project_name'],
            'kind' => (string) $r['kind'],
        ], $q->fetchAll(\PDO::FETCH_ASSOC));
    }

    /** The bytes of every stored draft, as recorded when each was kept. */
    public function draftBytes(): int
    {
        return (int) $this->db->query('SELECT COALESCE(SUM(size), 0) FROM music_drafts')->fetchColumn();
    }

    /** Absolute path, or null for an unknown draft or a name outside DRAFT_FILES. */
    public function draftFile(string $piece, int $version, string $name): ?string
    {
        if (!self::validPieceId($piece) || $version < 1 || $version > 9999 || !in_array($name, self::DRAFT_FILES, true)) {
            return null;
        }
        $known = $this->db->prepare('SELECT 1 FROM music_drafts WHERE piece = ? AND version = ?');
        $known->execute([$piece, $version]);
        $path = "{$this->dir}/drafts/$piece/$version/$name";
        return $known->fetchColumn() !== false && is_file($path) ? $path : null;
    }

    /**
     * Keeps the one locked keyring and the fingerprints its uploader named, replacing what was stored. The server
     * never reads inside the keyring and cannot check the fingerprints against it.
     *
     * @param list<string> $previous
     */
    public function putKeyring(string $lockedJson, string $current, array $previous): void
    {
        $this->db->prepare('INSERT INTO music_keyring (id, locked, uploaded_at, current_fp, previous_fps) VALUES (1, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET locked = excluded.locked, uploaded_at = excluded.uploaded_at, current_fp = excluded.current_fp, previous_fps = excluded.previous_fps')
            ->execute([$lockedJson, $this->clock->now(), $current, json_encode(array_values($previous))]);
    }

    /** @return array{locked: string, uploaded_at: int, current: string, previous: list<string>}|null */
    public function keyring(): ?array
    {
        $row = $this->db->query('SELECT locked, uploaded_at, current_fp, previous_fps FROM music_keyring WHERE id = 1')->fetch(\PDO::FETCH_ASSOC);
        if ($row === false) {
            return null;
        }
        return [
            'locked' => (string) $row['locked'],
            'uploaded_at' => (int) $row['uploaded_at'],
            'current' => (string) $row['current_fp'],
            'previous' => self::decodePrevious((string) $row['previous_fps']),
        ];
    }

    /** The fingerprints notes may be sealed to, or null when no keyring has been uploaded with a current one. */
    public function fingerprints(): ?array
    {
        return self::fingerprintsIn($this->db);
    }

    /** @return array{current: string, previous: list<string>}|null as fingerprints(), for callers with a database and no store */
    public static function fingerprintsIn(\PDO $db): ?array
    {
        $row = $db->query('SELECT current_fp, previous_fps FROM music_keyring WHERE id = 1')->fetch(\PDO::FETCH_ASSOC);
        if ($row === false || $row['current_fp'] === '') {
            return null;
        }
        return ['current' => (string) $row['current_fp'], 'previous' => self::decodePrevious((string) $row['previous_fps'])];
    }

    /**
     * Forgets the locked keyring and its fingerprints. True when a keyring was stored; false when none was or the table
     * does not exist. Any other storage error (a busy or read-only database) is thrown.
     */
    public static function removeKeyring(\PDO $db): bool
    {
        try {
            return $db->exec('DELETE FROM music_keyring WHERE id = 1') > 0;
        } catch (\PDOException $e) {
            if (str_contains($e->getMessage(), 'no such table')) {
                return false;
            }
            throw $e;
        }
    }

    /** "abcd ef01 ..." groups of four for people to compare. */
    public static function displayFingerprint(string $hex): string
    {
        return implode(' ', str_split($hex, 4));
    }

    /** @return list<string> */
    private static function decodePrevious(string $json): array
    {
        $list = json_decode($json, true);
        return is_array($list) ? array_values(array_filter($list, 'is_string')) : [];
    }

    /** The piece id of the workroom's general notes (games/workroom/src/note.ts GENERAL_PIECE): no piece can have it. */
    public const GENERAL_PIECE = 'general';

    public static function validPieceId(mixed $id): bool
    {
        return is_string($id) && $id !== self::GENERAL_PIECE && preg_match(self::PIECE, $id) === 1;
    }

    /** A note id: 32 lowercase hex digits. */
    public static function validNoteId(mixed $id): bool
    {
        return is_string($id) && preg_match(self::ID, $id) === 1;
    }

    /** A draft version: 1 to 9999 without leading zeros. */
    public static function validVersion(mixed $v): bool
    {
        return is_string($v) && preg_match('/^[1-9]\d{0,3}$/D', $v) === 1;
    }

    /** A project id has a piece id's form; `general` is reserved for pieces only. */
    public static function validProjectId(mixed $id): bool
    {
        return is_string($id) && preg_match(self::PIECE, $id) === 1;
    }

    /** 1 to 80 characters. */
    public static function validProjectName(mixed $name): bool
    {
        return is_string($name) && mb_strlen($name) >= 1 && mb_strlen($name) <= 80;
    }

    /** A recorded project is a valid id with a name of 1 to 80 characters; ('', '') is the one "no project" value. */
    private static function aboutIsKeepable(array $about): bool
    {
        $id = $about['project_id'] ?? null;
        $name = $about['project_name'] ?? null;
        $kind = $about['kind'] ?? null;
        if (!is_string($id) || !is_string($name) || !is_string($kind) || !in_array($kind, self::KINDS, true)) {
            return false;
        }
        if ($id === '' && $name === '') {
            return true;
        }
        return self::validProjectId($id) && self::validProjectName($name);
    }

    private function noteExists(string $id): bool
    {
        $q = $this->db->prepare('SELECT 1 FROM music_notes WHERE id = ?');
        $q->execute([$id]);
        return $q->fetchColumn() !== false;
    }

    /** Runs $work between BEGIN IMMEDIATE and COMMIT; any throw rolls back and is rethrown. */
    private function transaction(\Closure $work): mixed
    {
        $this->db->exec('BEGIN IMMEDIATE');
        try {
            $result = $work();
            $this->db->exec('COMMIT');
            return $result;
        } catch (\Throwable $e) {
            if ($this->db->inTransaction()) {
                $this->db->exec('ROLLBACK');
            }
            throw $e;
        }
    }

    /** Writes a private file whole: a temporary name, then a rename, so no reader sees half of it. */
    private function writeFile(string $path, string $bytes): void
    {
        $tmp = $path . '.tmp';
        @unlink($tmp); // a leftover from a crash would fail the exclusive open
        $old = umask(0077);
        try {
            $fh = @fopen($tmp, 'x');
        } finally {
            umask($old);
        }
        if ($fh === false) {
            $this->files->refuse($tmp, 'cannot be written', 'fix its directory');
        }
        $ok = fwrite($fh, $bytes) === strlen($bytes);
        $ok = fclose($fh) && $ok;
        if (!$ok || !@rename($tmp, $path)) {
            @unlink($tmp);
            $this->files->refuse($path, 'cannot be written', 'fix its directory');
        }
        @chmod($path, \Kit\StoreModes::modes()['file']);
    }

    /** @param array<string, string> $files */
    private function writeDraftFiles(string $piece, int $version, array $files): void
    {
        $pieceDir = $this->files->claim("{$this->dir}/drafts/$piece", true);
        $versionDir = $this->files->claim("$pieceDir/$version", true);
        try {
            foreach ($files as $name => $bytes) {
                $path = "$versionDir/$name";
                @unlink($path);
                $this->writeFile($path, $bytes);
            }
        } catch (\Throwable $e) {
            $this->removeDraftFiles($piece, $version);
            throw $e;
        }
    }

    /** Deletes a draft's files and its empty directories; whatever is not there is skipped. */
    private function removeDraftFiles(string $piece, int $version): void
    {
        $versionDir = "{$this->dir}/drafts/$piece/$version";
        foreach (self::DRAFT_FILES as $name) {
            @unlink("$versionDir/$name");
            @unlink("$versionDir/$name.tmp");
        }
        @rmdir($versionDir);
        @rmdir("{$this->dir}/drafts/$piece");
    }
}
