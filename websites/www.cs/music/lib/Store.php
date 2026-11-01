<?php
// One account's studio storage: sealed notes the server cannot read, immutable
// drafts kept per piece within the account's room, and one locked keyring. Rows
// live in the admin database, each naming its account; the bytes live in private
// files beside it, drafts under drafts/<account>/<piece>/<version>/ with their
// scores gzipped, and vocal takes once per account under takes/<account>/, each
// kept while any draft of the account names it.
declare(strict_types=1);

namespace Music;

final class NoteRejected extends \RuntimeException
{
    /** @param string $reason too_large | full | over_quota | bad_header | unknown_key | no_key; $room is the bytes left and $shared whether the studios' shared space (not this account's own room) is what ran short, for over_quota */
    public function __construct(public readonly string $reason, public readonly int $room = 0, public readonly bool $shared = false)
    {
        parent::__construct($reason);
    }
}

final class DraftRejected extends \RuntimeException
{
    /** @param string $reason bad_piece | bad_version | missing_file | bad_file | too_large | over_quota | exists | bad_score | missing_take | low_disk; $room is the bytes left and $shared whether the studios' shared space (not this account's own room) is what ran short, for over_quota */
    public function __construct(public readonly string $reason, public readonly int $room = 0, public readonly bool $shared = false)
    {
        parent::__construct($reason);
    }
}

/** changeKeyring's $also refused: the transaction is rolled back and the change answers 'mismatch'. */
final class KeyringRace extends \RuntimeException
{
}

final class Store
{
    public const MAGIC = 'SIUEN1';
    /** A note sealed to several keys: the person's and each paired AI's (seal.ts sealTo). */
    public const MAGIC2 = 'SIUEN2';
    /** The most keys one SIUEN2 note names: the person's and ten AI keys, with room. */
    public const MAX_RECIPIENTS = 16;
    /** The largest note for an account with the allowance (Limits). */
    public const MAX_NOTE_BYTES = 2_097_152;
    /** The most notes one account keeps. */
    public const MAX_NOTES = 2000;
    /** The most a draft request may carry, and so the most one draft holds, for an account with the allowance: 8 MB. */
    public const MAX_REQUEST_BYTES = 8_388_608;
    /** Each piece keeps only this many drafts; a publish deletes that piece's older ones. */
    public const KEEP_DRAFTS = 20;
    /** The allowance: the most an account with it may store, 100 MB. */
    public const MAX_DRAFT_TOTAL_BYTES = 104_857_600;
    /** The upload: the locked keyring (about 4.5 KB per retained RSA-4096 key, room for a dozen rotations, 64 KB) plus the fingerprints beside it. */
    public const MAX_KEYRING_BYTES = 65_536 + 33 * 70;
    public const KINDS = ['music', 'sound'];
    public const DRAFT_FILES = ['score.json', 'score.musicxml', 'audio.webm', 'audio.m4a', 'spectrogram.png'];
    /** The draft files stored gzipped, as <name>.gz, and served whole. */
    public const GZIPPED = ['score.json', 'score.musicxml'];
    /** The one-time move of the single-studio tables and files into the owner's account. */
    public const MIGRATION = 'music-accounts-1';

    private const ID = '/^[0-9a-f]{32}$/D';
    /** The shape of a piece id and of a project id. */
    private const PIECE = '/^[a-z0-9][a-z0-9-]{0,47}$/D';
    /** The magic, the 32-byte fingerprint and the two-byte key length: the least a sealed note can be. */
    private const HEADER_BYTES = 40;

    private \Kit\StoreDir $files;

    /**
     * The studio of $account. $dir is <admin data dir>/music; claimed private (0700) with notes/ and drafts/ inside;
     * creates the music tables and, once per database, moves what the single studio stored into the owner's account.
     */
    public function __construct(
        private \PDO $db,
        private string $dir,
        private \Admin\Clock $clock,
        private int $account,
        private Limits $limits,
        private Accounts $accounts,
    ) {
        $this->files = new \Kit\StoreDir('music storage:', \Admin\StorageUnavailable::class);
        $this->files->claim($dir, true);
        $this->files->claim("$dir/notes", true);
        $this->files->claim("$dir/drafts", true);
        $this->files->claim("$dir/takes", true);
        // The tables in the single studio's shape, for a database that has none yet; MIGRATION then rebuilds them keyed by account.
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
        \Admin\Db::once($this->db, self::MIGRATION, fn() => $this->moveIntoAccounts(), fn() => $this->restoreDrafts());
        // The move committed but its process ended before it cleared away the old files it set aside.
        $this->removeTree("$dir/drafts.old");
        // Every key a note names (SIUEN1: the one; SIUEN2: each), so an AI key lists only the notes sealed to it, and
        // when each AI marked it picked up: one AI's mark never hides a note from another AI.
        $this->db->exec('CREATE TABLE IF NOT EXISTS music_note_recipients (note_id TEXT NOT NULL, account_id INTEGER NOT NULL, fingerprint TEXT NOT NULL, picked_up_at INTEGER, PRIMARY KEY (note_id, fingerprint))');
        $this->db->exec('CREATE INDEX IF NOT EXISTS music_note_recipients_fp ON music_note_recipients(account_id, fingerprint)');
        // Vocal takes, once per account, and which drafts name them: a take goes when the last draft naming it goes.
        $this->db->exec('CREATE TABLE IF NOT EXISTS music_takes (account_id INTEGER NOT NULL, file TEXT NOT NULL, size INTEGER NOT NULL, seconds REAL NOT NULL, added_at INTEGER NOT NULL, PRIMARY KEY (account_id, file))');
        $this->db->exec('CREATE TABLE IF NOT EXISTS music_draft_takes (account_id INTEGER NOT NULL, piece TEXT NOT NULL, version INTEGER NOT NULL, file TEXT NOT NULL, PRIMARY KEY (account_id, piece, version, file))');
        $this->db->exec('CREATE INDEX IF NOT EXISTS music_draft_takes_file ON music_draft_takes(account_id, file)');
        $this->db->exec("CREATE TABLE IF NOT EXISTS music_settings (account_id INTEGER PRIMARY KEY, vocal_quality TEXT NOT NULL DEFAULT 'perfect')");
    }

    public const VOCAL_QUALITIES = ['perfect', 'ear'];

    /** The quality Save To Studio picks first for a new take: perfect (FLAC) unless the person chose ear (Opus). */
    public function vocalQuality(): string
    {
        $q = $this->db->prepare('SELECT vocal_quality FROM music_settings WHERE account_id = ?');
        $q->execute([$this->account]);
        $v = $q->fetchColumn();
        return in_array($v, self::VOCAL_QUALITIES, true) ? $v : 'perfect';
    }

    public function setVocalQuality(string $quality): bool
    {
        if (!in_array($quality, self::VOCAL_QUALITIES, true)) {
            return false;
        }
        $this->db->prepare('INSERT INTO music_settings (account_id, vocal_quality) VALUES (?, ?) ON CONFLICT(account_id) DO UPDATE SET vocal_quality = excluded.vocal_quality')->execute([$this->account, $quality]);
        return true;
    }

    /**
     * The fingerprints a sealed note names, in order, or null when its header is malformed: SIUEN1 names one; SIUEN2
     * names 1 to MAX_RECIPIENTS distinct ones, each with a wrapped key, followed by at least an IV and a tag.
     *
     * @return list<string>|null
     */
    public static function recipientsOf(string $sealed): ?array
    {
        if (str_starts_with($sealed, self::MAGIC)) {
            return strlen($sealed) < self::HEADER_BYTES ? null : [bin2hex(substr($sealed, 6, 32))];
        }
        if (!str_starts_with($sealed, self::MAGIC2) || strlen($sealed) < 7) {
            return null;
        }
        $n = ord($sealed[6]);
        if ($n < 1 || $n > self::MAX_RECIPIENTS) {
            return null;
        }
        $at = 7;
        $end = strlen($sealed);
        $prints = [];
        for ($i = 0; $i < $n; $i++) {
            if ($at + 34 > $end) {
                return null;
            }
            $fp = bin2hex(substr($sealed, $at, 32));
            $len = unpack('n', substr($sealed, $at + 32, 2))[1];
            $at += 34 + $len;
            if ($len === 0 || in_array($fp, $prints, true)) {
                return null;
            }
            $prints[] = $fp;
        }
        return $at + 12 + 16 <= $end ? $prints : null;
    }

    /**
     * Keeps one sealed note. Every key it names must be the account's current or a previous notes key, or one of
     * $aiRecipients (the paired, active AI keys: Pairing::activeRecipients), and at least one must be the person's.
     *
     * @param list<string> $aiRecipients
     * @return array{id: string, size: int, sha256: string, arrived_at: int} @throws NoteRejected
     */
    public function addNote(string $sealed, array $aiRecipients = []): array
    {
        $size = strlen($sealed);
        if ($size > $this->limits->maxNoteBytes) {
            throw new NoteRejected('too_large');
        }
        $prints = $this->fingerprints();
        if ($prints === null) {
            throw new NoteRejected('no_key');
        }
        $named = self::recipientsOf($sealed);
        if ($named === null) {
            throw new NoteRejected('bad_header');
        }
        $person = [$prints['current'], ...$prints['previous']];
        foreach ($named as $fp) {
            if (!in_array($fp, $person, true) && !in_array($fp, $aiRecipients, true)) {
                throw new NoteRejected('unknown_key');
            }
        }
        if (array_intersect($named, $person) === []) {
            throw new NoteRejected('unknown_key');
        }
        $id = bin2hex(random_bytes(16));
        $note = ['id' => $id, 'size' => $size, 'sha256' => hash('sha256', $sealed), 'arrived_at' => $this->clock->now()];
        $path = "{$this->dir}/notes/$id.sealed";
        $this->transaction(function () use ($sealed, $note, $path, $size, $named): void {
            $count = $this->db->prepare('SELECT COUNT(*) FROM music_notes WHERE account_id = ?');
            $count->execute([$this->account]);
            if ((int) $count->fetchColumn() >= self::MAX_NOTES) {
                throw new NoteRejected('full');
            }
            [$room, $shared] = $this->roomBinding();
            if ($size > $room) {
                throw new NoteRejected('over_quota', max(0, $room), $shared);
            }
            $this->writeFile($path, $sealed);
            try {
                $this->db->prepare('INSERT INTO music_notes (id, account_id, size, sha256, arrived_at) VALUES (?, ?, ?, ?, ?)')
                    ->execute([$note['id'], $this->account, $note['size'], $note['sha256'], $note['arrived_at']]);
                $to = $this->db->prepare('INSERT INTO music_note_recipients (note_id, account_id, fingerprint) VALUES (?, ?, ?)');
                foreach ($named as $fp) {
                    $to->execute([$note['id'], $this->account, $fp]);
                }
            } catch (\Throwable $e) {
                @unlink($path);
                throw $e;
            }
        });
        return $note;
    }

    /**
     * @param 'waiting'|'picked-up'|null $state
     * @param string|null $sealedTo only the notes sealed to this key (an AI key's paired key), with that key's own picked-up
     *                              mark as their state; null for every note and the note's own mark
     * @return list<array{id: string, size: int, sha256: string, arrived_at: int, picked_up_at: ?int}> oldest first
     */
    public function notes(?string $state = null, ?string $sealedTo = null): array
    {
        $where = match ($state) {
            'waiting' => 'AND picked_up_at IS NULL',
            'picked-up' => 'AND picked_up_at IS NOT NULL',
            default => '',
        };
        if ($sealedTo !== null) {
            $where = str_replace('picked_up_at', 'r.picked_up_at', $where);
            $q = $this->db->prepare('SELECT n.id, n.size, n.sha256, n.arrived_at, r.picked_up_at FROM music_notes n JOIN music_note_recipients r'
                . " ON r.note_id = n.id AND r.account_id = n.account_id WHERE n.account_id = ? AND r.fingerprint = ? $where ORDER BY n.arrived_at ASC, n.rowid ASC");
            $q->execute([$this->account, $sealedTo]);
        } else {
            $q = $this->db->prepare("SELECT id, size, sha256, arrived_at, picked_up_at FROM music_notes WHERE account_id = ? $where ORDER BY arrived_at ASC, rowid ASC");
            $q->execute([$this->account]);
        }
        $rows = $q->fetchAll(\PDO::FETCH_ASSOC);
        return array_map(static fn(array $r): array => [
            'id' => (string) $r['id'],
            'size' => (int) $r['size'],
            'sha256' => (string) $r['sha256'],
            'arrived_at' => (int) $r['arrived_at'],
            'picked_up_at' => $r['picked_up_at'] === null ? null : (int) $r['picked_up_at'],
        ], $rows);
    }

    /** The sealed bytes; with $sealedTo, only of a note sealed to that key. */
    public function noteBytes(string $id, ?string $sealedTo = null): ?string
    {
        if (preg_match(self::ID, $id) !== 1 || !$this->noteExists($id, $sealedTo)) {
            return null;
        }
        $bytes = @file_get_contents("{$this->dir}/notes/$id.sealed");
        return $bytes === false ? null : $bytes;
    }

    /**
     * true when the note exists (marking twice is fine). With $sealedTo, only a note sealed to that key is marked, and
     * that key's own mark is set too, so the note stops waiting for that AI alone.
     */
    public function markPickedUp(string $id, ?string $sealedTo = null): bool
    {
        if (preg_match(self::ID, $id) !== 1 || !$this->noteExists($id, $sealedTo)) {
            return false;
        }
        if ($sealedTo !== null) {
            $this->db->prepare('UPDATE music_note_recipients SET picked_up_at = ? WHERE note_id = ? AND account_id = ? AND fingerprint = ? AND picked_up_at IS NULL')
                ->execute([$this->clock->now(), $id, $this->account, $sealedTo]);
        }
        $this->db->prepare('UPDATE music_notes SET picked_up_at = ? WHERE id = ? AND account_id = ? AND picked_up_at IS NULL')->execute([$this->clock->now(), $id, $this->account]);
        return $this->noteExists($id);
    }

    public function deleteNote(string $id): bool
    {
        if (preg_match(self::ID, $id) !== 1) {
            return false;
        }
        return $this->transaction(function () use ($id): bool {
            $gone = $this->db->prepare('DELETE FROM music_notes WHERE id = ? AND account_id = ?');
            $gone->execute([$id, $this->account]);
            if ($gone->rowCount() === 0) {
                return false; // another account's note keeps its file
            }
            $this->db->prepare('DELETE FROM music_note_recipients WHERE note_id = ? AND account_id = ?')->execute([$id, $this->account]);
            @unlink("{$this->dir}/notes/$id.sealed");
            return true;
        });
    }

    public function deleteAllNotes(): int
    {
        return $this->transaction(fn(): int => count($this->deleteNotesOfAccount()));
    }

    public function waitingCount(): int
    {
        $q = $this->db->prepare('SELECT COUNT(*) FROM music_notes WHERE account_id = ? AND picked_up_at IS NULL');
        $q->execute([$this->account]);
        return (int) $q->fetchColumn();
    }

    /**
     * Keeps one draft. Refuses, before any file is written, when the files as sent total more than the account's
     * request limit (too_large); then, in one transaction, when the draft exists, or when its stored bytes (scores
     * gzipped) less what this piece's drafts older than its newest KEEP_DRAFTS - 1 hold would pass the room left
     * (over_quota, with that room): nothing is deleted to make room. After the files are written, deletes this piece's
     * drafts (rows and files, the files before the COMMIT) older than its newest KEEP_DRAFTS: each piece keeps its own
     * history, and other pieces are never touched.
     * $about is taken from the validated score.json: project_id (matches validProjectId), project_name (1 to 80 characters) and
     * kind (one of KINDS); anything else throws DraftRejected('bad_score') before the transaction opens. null records no
     * project: '' and '' and 'music' (a published draft always has one).
     * @param array<string, string> $files published name => the file's bytes
     * @param array{project_id: string, project_name: string, kind: string}|null $about
     * @param array<string, array{bytes: string, seconds: float}> $takes new vocal takes, checked (TakeCheck), by file name
     * @param list<string> $named every take the score names: each in $takes or already held, else missing_take
     * @throws DraftRejected
     */
    public function putDraft(string $piece, int $version, array $files, ?array $about = null, array $takes = [], array $named = []): void
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
        if (array_sum(array_map('strlen', $files)) > $this->limits->maxRequestBytes) {
            throw new DraftRejected('too_large');
        }
        $stored = [];
        foreach ($files as $name => $bytes) {
            $stored[self::storedName($name)] = self::storedBytes($name, $bytes);
        }
        foreach (array_keys($takes) as $file) {
            if (!preg_match(TakeCheck::NAME, $file) || !in_array($file, $named, true)) {
                throw new DraftRejected('bad_file');
            }
        }
        $this->transaction(function () use ($piece, $version, $stored, $about, $takes, $named): void {
            $size = array_sum(array_map('strlen', $stored));
            $held = $this->heldTakes($named);
            if (array_diff($named, $held, array_keys($takes)) !== []) {
                throw new DraftRejected('missing_take');
            }
            $new = array_diff_key($takes, array_flip($held));
            $newBytes = array_sum(array_map(static fn(array $t): int => strlen($t['bytes']), $new));
            $exists = $this->db->prepare('SELECT 1 FROM music_drafts WHERE account_id = ? AND piece = ? AND version = ?');
            $exists->execute([$this->account, $piece, $version]);
            if ($exists->fetchColumn() !== false) {
                throw new DraftRejected('exists');
            }
            $rollsOff = $this->db->prepare('SELECT COALESCE(SUM(size), 0) FROM (SELECT size FROM music_drafts WHERE account_id = ? AND piece = ? ORDER BY published_at DESC, rowid DESC LIMIT -1 OFFSET ' . (self::KEEP_DRAFTS - 1) . ')');
            $rollsOff->execute([$this->account, $piece]);
            [$room, $shared] = $this->roomBinding();
            if ($size + $newBytes - (int) $rollsOff->fetchColumn() > $room) {
                throw new DraftRejected('over_quota', max(0, $room), $shared);
            }
            // The floor guards the large uploads: a score alone is never refused for it.
            $this->checkDisk($newBytes);
            $this->writeDraftFiles($piece, $version, $stored);
            $written = [];
            try {
                foreach ($new as $file => $t) {
                    $this->writeTake($file, $t['bytes']);
                    $written[] = $file;
                    $this->db->prepare('INSERT INTO music_takes (account_id, file, size, seconds, added_at) VALUES (?, ?, ?, ?, ?)')
                        ->execute([$this->account, $file, strlen($t['bytes']), $t['seconds'], $this->clock->now()]);
                }
                $link = $this->db->prepare('INSERT OR IGNORE INTO music_draft_takes (account_id, piece, version, file) VALUES (?, ?, ?, ?)');
                foreach (array_unique($named) as $file) {
                    $link->execute([$this->account, $piece, $version, $file]);
                }
                $this->db->prepare('INSERT INTO music_drafts (account_id, piece, version, published_at, size, project_id, project_name, kind) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
                    ->execute([$this->account, $piece, $version, $this->clock->now(), $size, $about['project_id'], $about['project_name'], $about['kind']]);
                $history = $this->db->prepare('SELECT version FROM music_drafts WHERE account_id = ? AND piece = ? ORDER BY published_at DESC, rowid DESC LIMIT -1 OFFSET ' . self::KEEP_DRAFTS);
                $history->execute([$this->account, $piece]);
                $old = array_map('intval', $history->fetchAll(\PDO::FETCH_COLUMN));
                $drop = $this->db->prepare('DELETE FROM music_drafts WHERE account_id = ? AND piece = ? AND version = ?');
                foreach ($old as $v) {
                    $drop->execute([$this->account, $piece, $v]);
                    $this->unlinkTakes($piece, $v);
                }
                $freed = $this->unusedTakes();
            } catch (\Throwable $e) {
                $this->removeDraftFiles($piece, $version);
                foreach ($written as $file) {
                    @unlink($this->takePath($file));
                }
                throw $e;
            }
            foreach ($old as $v) {
                $this->removeDraftFiles($piece, $v);
            }
            $this->removeTakeFiles($freed);
        });
    }

    /**
     * Deletes one draft's row and its files in one transaction, the files before the COMMIT, so a publish of the
     * same draft (which writes its files under the same lock) never loses its new files; false for a bad piece id
     * or version, or a draft that is not stored.
     */
    public function deleteDraft(string $piece, int $version): bool
    {
        if (!self::validPieceId($piece) || $version < 1 || $version > 9999) {
            return false;
        }
        return $this->transaction(function () use ($piece, $version): bool {
            $drop = $this->db->prepare('DELETE FROM music_drafts WHERE account_id = ? AND piece = ? AND version = ?');
            $drop->execute([$this->account, $piece, $version]);
            if ($drop->rowCount() === 0) {
                return false;
            }
            $this->unlinkTakes($piece, $version);
            $freed = $this->unusedTakes();
            $this->removeDraftFiles($piece, $version);
            $this->removeTakeFiles($freed);
            return true;
        });
    }

    /** Deletes every draft of $piece, rows and files (the files before the COMMIT); how many went. 0 for a bad piece id. */
    public function deletePiece(string $piece): int
    {
        if (!self::validPieceId($piece)) {
            return 0;
        }
        return $this->transaction(function () use ($piece): int {
            $versions = $this->db->prepare('SELECT version FROM music_drafts WHERE account_id = ? AND piece = ?');
            $versions->execute([$this->account, $piece]);
            $gone = array_map('intval', $versions->fetchAll(\PDO::FETCH_COLUMN));
            $this->db->prepare('DELETE FROM music_drafts WHERE account_id = ? AND piece = ?')->execute([$this->account, $piece]);
            $this->db->prepare('DELETE FROM music_draft_takes WHERE account_id = ? AND piece = ?')->execute([$this->account, $piece]);
            $freed = $this->unusedTakes();
            foreach ($gone as $v) {
                $this->removeDraftFiles($piece, $v);
            }
            $this->removeTakeFiles($freed);
            $this->removeTree("{$this->dir}/drafts/{$this->account}/$piece");
            return count($gone);
        });
    }

    /** @return list<array{piece: string, version: int, published_at: int, project_id: string, project_name: string, kind: string}> newest first */
    public function drafts(?string $piece = null): array
    {
        $q = $this->db->prepare('SELECT piece, version, published_at, project_id, project_name, kind FROM music_drafts WHERE account_id = ? AND (? IS NULL OR piece = ?) ORDER BY published_at DESC, rowid DESC');
        $q->execute([$this->account, $piece, $piece]);
        return array_map(static fn(array $r): array => [
            'piece' => (string) $r['piece'],
            'version' => (int) $r['version'],
            'published_at' => (int) $r['published_at'],
            'project_id' => (string) $r['project_id'],
            'project_name' => (string) $r['project_name'],
            'kind' => (string) $r['kind'],
        ], $q->fetchAll(\PDO::FETCH_ASSOC));
    }

    /** One draft file's bytes as published (a score decompressed), or null for an unknown draft, a name outside DRAFT_FILES, or a file that is missing or damaged. */
    public function draftBytes(string $piece, int $version, string $name): ?string
    {
        if (!self::validPieceId($piece) || $version < 1 || $version > 9999 || !in_array($name, self::DRAFT_FILES, true)) {
            return null;
        }
        $known = $this->db->prepare('SELECT 1 FROM music_drafts WHERE account_id = ? AND piece = ? AND version = ?');
        $known->execute([$this->account, $piece, $version]);
        if ($known->fetchColumn() === false) {
            return null;
        }
        $path = $this->draftDir($piece, $version) . '/' . self::storedName($name);
        $bytes = is_file($path) ? @file_get_contents($path) : false;
        if ($bytes !== false && in_array($name, self::GZIPPED, true)) {
            $bytes = @gzdecode($bytes);
        }
        return $bytes === false ? null : $bytes;
    }

    /** Whether draft $version of $piece stores the file $name (one of DRAFT_FILES). */
    public function hasDraftFile(string $piece, int $version, string $name): bool
    {
        return self::validPieceId($piece) && $version >= 1 && $version <= 9999 && in_array($name, self::DRAFT_FILES, true)
            && is_file($this->draftDir($piece, $version) . '/' . self::storedName($name));
    }

    /** What this account may store: the limits its address has. */
    public function limits(): Limits
    {
        return $this->limits;
    }

    /** The bytes this account may still store: the smaller of its own room and, without the allowance, the shared pool's; never below 0. */
    public function room(): int
    {
        return max(0, $this->roomLeft());
    }

    /**
     * Deletes every note, draft and file of this account and its keyring, in one transaction (the caller's, when it
     * holds one), the files before the COMMIT. The account itself stays.
     */
    public function wipe(): void
    {
        $this->transaction(function (): void {
            $this->deleteNotesOfAccount();
            $this->db->prepare('DELETE FROM music_drafts WHERE account_id = ?')->execute([$this->account]);
            $this->db->prepare('DELETE FROM music_keyring WHERE account_id = ?')->execute([$this->account]);
            $this->db->prepare('DELETE FROM music_draft_takes WHERE account_id = ?')->execute([$this->account]);
            $this->db->prepare('DELETE FROM music_takes WHERE account_id = ?')->execute([$this->account]);
            $this->db->prepare('DELETE FROM music_settings WHERE account_id = ?')->execute([$this->account]);
            $this->removeTree("{$this->dir}/drafts/{$this->account}");
            $this->removeTree("{$this->dir}/takes/{$this->account}");
        });
    }

    /**
     * Keeps the one locked keyring and the fingerprints its uploader named, replacing what was stored. The server
     * never reads inside the keyring and cannot check the fingerprints against it.
     *
     * @param list<string> $previous
     */
    public function putKeyring(string $lockedJson, string $current, array $previous): void
    {
        $this->db->prepare('INSERT INTO music_keyring (account_id, locked, uploaded_at, current_fp, previous_fps) VALUES (?, ?, ?, ?, ?) ON CONFLICT(account_id) DO UPDATE SET locked = excluded.locked, uploaded_at = excluded.uploaded_at, current_fp = excluded.current_fp, previous_fps = excluded.previous_fps')
            ->execute([$this->account, $lockedJson, $this->clock->now(), $current, json_encode(array_values($previous))]);
    }

    /**
     * Forgot your passphrase: deletes every note of this account (rows, then files) and its keyring, in one
     * transaction. Pieces, drafts and AI keys stay. @return int how many notes went
     */
    public function forgetNotesKey(): int
    {
        return $this->transaction(function (): int {
            $gone = count($this->deleteNotesOfAccount());
            $this->db->prepare('DELETE FROM music_keyring WHERE account_id = ?')->execute([$this->account]);
            (new Pairing($this->db, $this->clock))->unpairAll($this->account); // the next keyring holds no AI key
            return $gone;
        });
    }

    /**
     * A new passphrase: replaces the locked keyring only when $current is the stored current fingerprint and
     * $previous holds exactly the stored previous ones (in any order), so the envelope can change and the keys
     * cannot. 'changed'; 'mismatch' when the fingerprints differ, or $also (run inside the same transaction) returns
     * false; 'none' when no keyring is stored.
     *
     * @param list<string> $previous
     * @return 'changed'|'mismatch'|'none'
     */
    public function changeKeyring(string $lockedJson, string $current, array $previous, ?\Closure $also = null): string
    {
        try {
            return $this->changeKeyringIn($lockedJson, $current, $previous, $also);
        } catch (KeyringRace) {
            return 'mismatch';
        }
    }

    /** @param list<string> $previous @return 'changed'|'mismatch'|'none' */
    private function changeKeyringIn(string $lockedJson, string $current, array $previous, ?\Closure $also): string
    {
        return $this->transaction(function () use ($lockedJson, $current, $previous, $also): string {
            $stored = $this->keyring();
            if ($stored === null) {
                return 'none';
            }
            $given = array_values($previous);
            $had = $stored['previous'];
            sort($given);
            sort($had);
            if ($stored['current'] === '' || !hash_equals($stored['current'], $current) || $given !== $had) {
                return 'mismatch';
            }
            // $also runs in the same transaction (pairing marks its AI key); false undoes the whole change.
            if ($also !== null && !$also()) {
                throw new KeyringRace();
            }
            $this->db->prepare('UPDATE music_keyring SET locked = ?, uploaded_at = ?, previous_fps = ? WHERE account_id = ?')
                ->execute([$lockedJson, $this->clock->now(), json_encode(array_values($previous)), $this->account]);
            return 'changed';
        });
    }

    /** Stores the keyring only when this account has none, in one statement; false when it already has one. */
    public function createKeyring(string $lockedJson, string $current, array $previous): bool
    {
        $q = $this->db->prepare('INSERT INTO music_keyring (account_id, locked, uploaded_at, current_fp, previous_fps) VALUES (?, ?, ?, ?, ?) ON CONFLICT(account_id) DO NOTHING');
        $q->execute([$this->account, $lockedJson, $this->clock->now(), $current, json_encode(array_values($previous))]);
        return $q->rowCount() === 1;
    }

    /** @return array{locked: string, uploaded_at: int, current: string, previous: list<string>}|null */
    public function keyring(): ?array
    {
        $q = $this->db->prepare('SELECT locked, uploaded_at, current_fp, previous_fps FROM music_keyring WHERE account_id = ?');
        $q->execute([$this->account]);
        $row = $q->fetch(\PDO::FETCH_ASSOC);
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
        return self::fingerprintsIn($this->db, $this->account);
    }

    /** @return array{current: string, previous: list<string>}|null as fingerprints(), for callers with a database and no store */
    public static function fingerprintsIn(\PDO $db, int $account): ?array
    {
        $q = $db->prepare('SELECT current_fp, previous_fps FROM music_keyring WHERE account_id = ?');
        $q->execute([$account]);
        $row = $q->fetch(\PDO::FETCH_ASSOC);
        if ($row === false || $row['current_fp'] === '') {
            return null;
        }
        return ['current' => (string) $row['current_fp'], 'previous' => self::decodePrevious((string) $row['previous_fps'])];
    }

    /**
     * Forgets $account's locked keyring and its fingerprints. True when a keyring was stored; false when none was or the
     * table does not exist. Any other storage error (a busy or read-only database) is thrown.
     */
    public static function removeKeyring(\PDO $db, int $account): bool
    {
        try {
            $q = $db->prepare('DELETE FROM music_keyring WHERE account_id = ?');
            $q->execute([$account]);
            return $q->rowCount() > 0;
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

    private function noteExists(string $id, ?string $sealedTo = null): bool
    {
        if ($sealedTo !== null) {
            $q = $this->db->prepare('SELECT 1 FROM music_notes n JOIN music_note_recipients r ON r.note_id = n.id AND r.account_id = n.account_id WHERE n.id = ? AND n.account_id = ? AND r.fingerprint = ?');
            $q->execute([$id, $this->account, $sealedTo]);
            return $q->fetchColumn() !== false;
        }
        $q = $this->db->prepare('SELECT 1 FROM music_notes WHERE id = ? AND account_id = ?');
        $q->execute([$id, $this->account]);
        return $q->fetchColumn() !== false;
    }

    /**
     * Runs $work between BEGIN IMMEDIATE and COMMIT; any throw rolls back and is rethrown. Inside a transaction the
     * caller already holds, $work runs in it, and the caller commits or rolls back.
     */
    /** @return list<array{file: string, size: int, seconds: float, drafts: int}> this account's vocal takes, oldest first */
    public function takes(): array
    {
        $q = $this->db->prepare('SELECT t.file, t.size, t.seconds, (SELECT COUNT(*) FROM music_draft_takes d WHERE d.account_id = t.account_id AND d.file = t.file) AS drafts FROM music_takes t WHERE t.account_id = ? ORDER BY t.added_at, t.file');
        $q->execute([$this->account]);
        return array_map(static fn(array $r): array => ['file' => (string) $r['file'], 'size' => (int) $r['size'], 'seconds' => (float) $r['seconds'], 'drafts' => (int) $r['drafts']], $q->fetchAll(\PDO::FETCH_ASSOC));
    }

    /** A take's bytes, or null for a name that is not a take or one this account does not hold. */
    public function takeBytes(string $file): ?string
    {
        if (!preg_match(TakeCheck::NAME, $file) || $this->heldTakes([$file]) === []) {
            return null;
        }
        $bytes = @file_get_contents($this->takePath($file));
        return $bytes === false ? null : $bytes;
    }

    /**
     * Converts a held take to $newFile (checked by the caller, its $seconds from its frames): every draft naming the old
     * take names the new one instead, in its score and its links, then the old take goes, all in one transaction.
     * False when this account does not hold $oldFile.
     * @throws DraftRejected over_quota or low_disk
     */
    public function convertTake(string $oldFile, string $newFile, string $bytes, float $seconds): bool
    {
        if (!preg_match(TakeCheck::NAME, $oldFile) || !preg_match(TakeCheck::NAME, $newFile) || $oldFile === $newFile) {
            return false;
        }
        return $this->transaction(function () use ($oldFile, $newFile, $bytes, $seconds): bool {
            if ($this->heldTakes([$oldFile]) === []) {
                return false;
            }
            $have = $this->heldTakes([$newFile]) !== [];
            $add = $have ? 0 : strlen($bytes);
            [$room, $shared] = $this->roomBinding();
            if ($add > $room) {
                throw new DraftRejected('over_quota', max(0, $room), $shared);
            }
            $this->checkDisk($add);
            if (!$have) {
                $this->writeTake($newFile, $bytes);
                $this->db->prepare('INSERT INTO music_takes (account_id, file, size, seconds, added_at) VALUES (?, ?, ?, ?, ?)')
                    ->execute([$this->account, $newFile, $add, $seconds, $this->clock->now()]);
            }
            $uses = $this->db->prepare('SELECT piece, version FROM music_draft_takes WHERE account_id = ? AND file = ?');
            $uses->execute([$this->account, $oldFile]);
            foreach ($uses->fetchAll(\PDO::FETCH_ASSOC) as $u) {
                $piece = (string) $u['piece'];
                $version = (int) $u['version'];
                $path = $this->draftDir($piece, $version) . '/' . self::storedName('score.json');
                $json = @gzdecode((string) @file_get_contents($path));
                $score = $json === false ? null : json_decode($json, true);
                if (!is_array($score)) {
                    continue;
                }
                foreach ($score['lanes'] ?? [] as $i => $lane) {
                    if (!is_array($lane['vocal'] ?? null)) {
                        continue;
                    }
                    foreach ($lane['vocal']['takes'] ?? [] as $j => $t) {
                        if (($t['file'] ?? null) === $oldFile) {
                            $score['lanes'][$i]['vocal']['takes'][$j] = ['file' => $newFile, 'seconds' => $seconds];
                        }
                    }
                    foreach ($lane['vocal']['clips'] ?? [] as $j => $c) {
                        if (($c['take'] ?? null) === $oldFile) {
                            $score['lanes'][$i]['vocal']['clips'][$j]['take'] = $newFile;
                            $score['lanes'][$i]['vocal']['clips'][$j]['to'] = min((float) $c['to'], $seconds);
                        }
                    }
                }
                $stored = self::storedBytes('score.json', (string) json_encode($score, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
                $before = is_file($path) ? (int) filesize($path) : 0;
                $this->writeFile($path, $stored);
                $this->db->prepare('UPDATE music_drafts SET size = size + ? WHERE account_id = ? AND piece = ? AND version = ?')
                    ->execute([strlen($stored) - $before, $this->account, $piece, $version]);
                $this->db->prepare('INSERT OR IGNORE INTO music_draft_takes (account_id, piece, version, file) VALUES (?, ?, ?, ?)')
                    ->execute([$this->account, $piece, $version, $newFile]);
            }
            $this->db->prepare('DELETE FROM music_draft_takes WHERE account_id = ? AND file = ?')->execute([$this->account, $oldFile]);
            $this->removeTakeFiles($this->unusedTakes());
            return true;
        });
    }

    /** @param list<string> $files @return list<string> those of $files this account holds */
    private function heldTakes(array $files): array
    {
        if ($files === []) {
            return [];
        }
        $q = $this->db->prepare('SELECT file FROM music_takes WHERE account_id = ? AND file IN (' . implode(',', array_fill(0, count($files), '?')) . ')');
        $q->execute([$this->account, ...array_values($files)]);
        return array_map('strval', $q->fetchAll(\PDO::FETCH_COLUMN));
    }

    private function unlinkTakes(string $piece, int $version): void
    {
        $this->db->prepare('DELETE FROM music_draft_takes WHERE account_id = ? AND piece = ? AND version = ?')->execute([$this->account, $piece, $version]);
    }

    /** Deletes the rows of the takes no draft names any more; their files go with removeTakeFiles. @return list<string> */
    private function unusedTakes(): array
    {
        $q = $this->db->prepare('SELECT file FROM music_takes t WHERE t.account_id = ? AND NOT EXISTS (SELECT 1 FROM music_draft_takes d WHERE d.account_id = t.account_id AND d.file = t.file)');
        $q->execute([$this->account]);
        $gone = array_map('strval', $q->fetchAll(\PDO::FETCH_COLUMN));
        $drop = $this->db->prepare('DELETE FROM music_takes WHERE account_id = ? AND file = ?');
        foreach ($gone as $file) {
            $drop->execute([$this->account, $file]);
        }
        return $gone;
    }

    /** @param list<string> $files */
    private function removeTakeFiles(array $files): void
    {
        foreach ($files as $file) {
            @unlink($this->takePath($file));
        }
        @rmdir("{$this->dir}/takes/{$this->account}");
    }

    private function takePath(string $file): string
    {
        return "{$this->dir}/takes/{$this->account}/$file";
    }

    private function writeTake(string $file, string $bytes): void
    {
        $this->files->claim("{$this->dir}/takes/{$this->account}", true);
        $this->writeFile($this->takePath($file), $bytes);
    }

    /** Refuses ($bytes more to store) while the host's free disk would drop below the configured floor. @throws DraftRejected */
    private function checkDisk(int $bytes): void
    {
        $free = @disk_free_space($this->dir);
        if ($bytes > 0 && $free !== false && $free - $bytes < $this->limits->minFreeDiskBytes) {
            throw new DraftRejected('low_disk');
        }
    }

    private function transaction(\Closure $work): mixed
    {
        if ($this->db->inTransaction()) {
            return $work();
        }
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

    /** @param array<string, string> $stored stored name => stored bytes */
    private function writeDraftFiles(string $piece, int $version, array $stored): void
    {
        $accountDir = $this->files->claim("{$this->dir}/drafts/{$this->account}", true);
        $pieceDir = $this->files->claim("$accountDir/$piece", true);
        $versionDir = $this->files->claim("$pieceDir/$version", true);
        try {
            foreach ($stored as $name => $bytes) {
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
        $versionDir = $this->draftDir($piece, $version);
        foreach (self::DRAFT_FILES as $name) {
            $stored = self::storedName($name);
            @unlink("$versionDir/$stored");
            @unlink("$versionDir/$stored.tmp");
        }
        @rmdir($versionDir);
        @rmdir("{$this->dir}/drafts/{$this->account}/$piece");
        @rmdir("{$this->dir}/drafts/{$this->account}");
    }

    private function draftDir(string $piece, int $version): string
    {
        return "{$this->dir}/drafts/{$this->account}/$piece/$version";
    }

    private static function storedName(string $name): string
    {
        return in_array($name, self::GZIPPED, true) ? "$name.gz" : $name;
    }

    private static function storedBytes(string $name, string $bytes): string
    {
        return in_array($name, self::GZIPPED, true) ? gzencode($bytes, 9) : $bytes;
    }

    /** The room before clamping: below zero when the account (or the shared pool) is already over. */
    private function roomLeft(): int
    {
        return $this->roomBinding()[0];
    }

    /** The room before clamping, and whether it is the shared space's (smaller than the account's own) rather than the account's own. @return array{int, bool} */
    private function roomBinding(): array
    {
        $own = $this->limits->quotaBytes - $this->accounts->usage($this->account);
        if (!$this->limits->sharedPool) {
            return [$own, false];
        }
        $shared = $this->accounts->sharedRoom();
        return $shared < $own ? [$shared, true] : [$own, false];
    }

    /** Deletes this account's note rows, then their files; inside the caller's transaction. @return list<string> the ids */
    private function deleteNotesOfAccount(): array
    {
        $q = $this->db->prepare('SELECT id FROM music_notes WHERE account_id = ?');
        $q->execute([$this->account]);
        $ids = $q->fetchAll(\PDO::FETCH_COLUMN);
        $this->db->prepare('DELETE FROM music_notes WHERE account_id = ?')->execute([$this->account]);
        $this->db->prepare('DELETE FROM music_note_recipients WHERE account_id = ?')->execute([$this->account]);
        foreach ($ids as $id) {
            @unlink("{$this->dir}/notes/$id.sealed");
        }
        return $ids;
    }

    /**
     * The one-time move (MIGRATION), inside Db::once's transaction. Every note, draft and keyring row becomes the
     * owner's: the three tables are rebuilt keyed by account. The draft files are copied, scores gzipped, into
     * drafts.new/<owner>/<piece>/<version>/ and each row's size becomes its stored bytes; then drafts/ is set aside as
     * drafts.old/ and drafts.new/ takes its place, still before the COMMIT. A throw restores drafts/ (restoreDrafts) before
     * the ROLLBACK; a process that dies first leaves drafts.old/, which the next move restores before it starts, since
     * only the COMMIT makes the new layout the one the database records. The constructor deletes drafts.old/ after it.
     */
    private function moveIntoAccounts(): void
    {
        $this->restoreDrafts();
        $any = false;
        foreach (['music_notes', 'music_drafts', 'music_keyring'] as $table) {
            $any = $any || $this->db->query("SELECT 1 FROM $table LIMIT 1")->fetchColumn() !== false;
        }
        $owner = $any ? $this->accounts->ownerId() : 0; // with no rows, no account is named
        $db = $this->db;
        $db->exec('CREATE TABLE music_notes_next (id TEXT PRIMARY KEY, account_id INTEGER NOT NULL REFERENCES accounts(id), size INTEGER NOT NULL, sha256 TEXT NOT NULL, arrived_at INTEGER NOT NULL, picked_up_at INTEGER)');
        $db->prepare('INSERT INTO music_notes_next (rowid, id, account_id, size, sha256, arrived_at, picked_up_at) SELECT rowid, id, ?, size, sha256, arrived_at, picked_up_at FROM music_notes')->execute([$owner]);
        $db->exec("CREATE TABLE music_drafts_next (account_id INTEGER NOT NULL REFERENCES accounts(id), piece TEXT NOT NULL, version INTEGER NOT NULL, published_at INTEGER NOT NULL, size INTEGER NOT NULL, project_id TEXT NOT NULL DEFAULT '', project_name TEXT NOT NULL DEFAULT '', kind TEXT NOT NULL DEFAULT 'music', PRIMARY KEY (account_id, piece, version))");
        $db->prepare('INSERT INTO music_drafts_next (rowid, account_id, piece, version, published_at, size, project_id, project_name, kind) SELECT rowid, ?, piece, version, published_at, size, project_id, project_name, kind FROM music_drafts')->execute([$owner]);
        $db->exec("CREATE TABLE music_keyring_next (account_id INTEGER PRIMARY KEY REFERENCES accounts(id), locked TEXT NOT NULL, uploaded_at INTEGER NOT NULL, current_fp TEXT NOT NULL DEFAULT '', previous_fps TEXT NOT NULL DEFAULT '[]')");
        $db->prepare('INSERT INTO music_keyring_next (account_id, locked, uploaded_at, current_fp, previous_fps) SELECT ?, locked, uploaded_at, current_fp, previous_fps FROM music_keyring')->execute([$owner]);
        foreach (['music_notes', 'music_drafts', 'music_keyring'] as $table) {
            $db->exec("DROP TABLE $table");
            $db->exec("ALTER TABLE {$table}_next RENAME TO $table");
        }
        $db->exec('CREATE INDEX music_notes_account ON music_notes(account_id)');

        $rows = $db->query('SELECT piece, version FROM music_drafts')->fetchAll(\PDO::FETCH_ASSOC);
        if ($rows === []) {
            return;
        }
        $next = $this->files->claim("{$this->dir}/drafts.new", true);
        $this->files->claim("$next/$owner", true);
        $size = $db->prepare('UPDATE music_drafts SET size = ? WHERE account_id = ? AND piece = ? AND version = ?');
        foreach ($rows as $row) {
            $piece = (string) $row['piece'];
            $version = (int) $row['version'];
            $stored = 0;
            if (self::validPieceId($piece) && $version >= 1 && $version <= 9999) {
                $from = "{$this->dir}/drafts/$piece/$version";
                $to = $this->files->claim($this->files->claim("$next/$owner/$piece", true) . "/$version", true);
                foreach (self::DRAFT_FILES as $name) {
                    if (!is_file("$from/$name") || is_link("$from/$name")) {
                        continue; // a file the draft never had
                    }
                    // A file that is there but cannot be read stops the move: the ROLLBACK and restoreDrafts keep it.
                    $bytes = @file_get_contents("$from/$name");
                    if ($bytes === false) {
                        $this->files->refuse("$from/$name", 'cannot be read', 'fix its permissions');
                    }
                    $kept = self::storedBytes($name, $bytes);
                    $this->writeFile("$to/" . self::storedName($name), $kept);
                    $stored += strlen($kept);
                }
            }
            $size->execute([$stored, $owner, $piece, $version]);
        }
        $this->swap("{$this->dir}/drafts", "{$this->dir}/drafts.old");
        $this->swap($next, "{$this->dir}/drafts");
    }

    /** Puts drafts/ back as the move found it, when drafts.old/ was set aside and its move never committed, and deletes drafts.new/. */
    private function restoreDrafts(): void
    {
        $old = "{$this->dir}/drafts.old";
        if (is_dir($old) && !is_link($old)) {
            $this->removeTree("{$this->dir}/drafts");
            $this->swap($old, "{$this->dir}/drafts");
        }
        $this->removeTree("{$this->dir}/drafts.new");
    }

    private function swap(string $from, string $to): void
    {
        if (!@rename($from, $to)) {
            $this->files->refuse($from, "cannot be renamed to $to", 'fix its directory');
        }
    }

    /** Deletes $path and everything under it, never following a link; a missing path is skipped. */
    private function removeTree(string $path): void
    {
        if (is_link($path) || is_file($path)) {
            @unlink($path);
            return;
        }
        if (!is_dir($path)) {
            return;
        }
        foreach (scandir($path) ?: [] as $entry) {
            if ($entry !== '.' && $entry !== '..') {
                $this->removeTree("$path/$entry");
            }
        }
        @rmdir($path);
    }
}
