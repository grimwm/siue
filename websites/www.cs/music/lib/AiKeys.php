<?php
// Each account's AI keys: 64 hex characters shown once, kept only as SHA-256, each with some of three scopes
// (never keys:publish), at most MAX_ACTIVE active per account. KeyGate checks them. Revoking is the one way a
// key stops working short of deleteAll (start over); either forgets the key's sealing key (Pairing).
declare(strict_types=1);

namespace Music;

final class AiKeys
{
    /** The scopes an AI key may carry, with the words the studio page shows for each. */
    public const SCOPES = ['notes:pickup' => 'read notes', 'drafts:publish' => 'publish drafts', 'drafts:delete' => 'delete drafts'];
    public const MAX_ACTIVE = 10;
    public const LABEL_MAX = 80;

    public function __construct(private \PDO $db, private \Admin\Clock $clock)
    {
    }

    /**
     * Makes a key for $account and returns it; this is the only time it exists in the clear.
     *
     * @param list<string> $scopes
     * @throws \InvalidArgumentException for a bad label, no scope, a scope outside SCOPES, or a key past MAX_ACTIVE
     */
    public function create(int $account, string $label, array $scopes): string
    {
        $label = trim($label);
        if ($label === '' || mb_strlen($label) > self::LABEL_MAX) {
            throw new \InvalidArgumentException('A key needs a label of 1 to ' . self::LABEL_MAX . ' characters.');
        }
        $scopes = array_values(array_unique(array_filter($scopes, 'is_string')));
        if ($scopes === []) {
            throw new \InvalidArgumentException('A key needs at least one scope.');
        }
        foreach ($scopes as $s) {
            if (!isset(self::SCOPES[$s])) {
                throw new \InvalidArgumentException('Unknown scope.');
            }
        }
        $key = bin2hex(random_bytes(32));
        $this->db->exec('BEGIN IMMEDIATE');
        try {
            $active = $this->db->prepare('SELECT COUNT(*) FROM studio_keys WHERE account_id = ? AND revoked_at IS NULL');
            $active->execute([$account]);
            if ((int) $active->fetchColumn() >= self::MAX_ACTIVE) {
                throw new \InvalidArgumentException('A studio has at most ' . self::MAX_ACTIVE . ' active AI keys. Revoke one first.');
            }
            $this->db->prepare('INSERT INTO studio_keys (account_id, label, key_hash, scopes, created_at) VALUES (?, ?, ?, ?, ?)')
                ->execute([$account, $label, hash('sha256', $key), json_encode($scopes, JSON_THROW_ON_ERROR), $this->clock->now()]);
            $this->db->exec('COMMIT');
        } catch (\Throwable $e) {
            if ($this->db->inTransaction()) {
                $this->db->exec('ROLLBACK');
            }
            throw $e;
        }
        return $key;
    }

    /** @return list<array{id:int,label:string,scopes:list<string>,created_at:int,last_used_at:?int,revoked_at:?int}> oldest first, revoked keys included */
    public function list(int $account): array
    {
        $q = $this->db->prepare('SELECT id, label, scopes, created_at, last_used_at, revoked_at FROM studio_keys WHERE account_id = ? ORDER BY id');
        $q->execute([$account]);
        return array_map(static fn(array $r): array => [
            'id' => (int) $r['id'],
            'label' => (string) $r['label'],
            'scopes' => json_decode((string) $r['scopes'], true) ?: [],
            'created_at' => (int) $r['created_at'],
            'last_used_at' => $r['last_used_at'] === null ? null : (int) $r['last_used_at'],
            'revoked_at' => $r['revoked_at'] === null ? null : (int) $r['revoked_at'],
        ], $q->fetchAll(\PDO::FETCH_ASSOC));
    }

    /** True when an active key of $account was revoked; false for another account's, an unknown or an already revoked id. */
    public function revoke(int $account, int $id): bool
    {
        $st = $this->db->prepare('UPDATE studio_keys SET revoked_at = ? WHERE id = ? AND account_id = ? AND revoked_at IS NULL');
        $st->execute([$this->clock->now(), $id, $account]);
        if ($st->rowCount() !== 1) {
            return false;
        }
        Pairing::forget($this->db, $account, $id); // its sealing key goes with it: new notes are no longer sealed to it
        return true;
    }

    /** Deletes every key of $account and its rate-limit rows. Runs inside the caller's transaction when one is open. */
    public function deleteAll(int $account): void
    {
        Pairing::forget($this->db, $account);
        $this->db->prepare('DELETE FROM studio_key_hits WHERE key_id IN (SELECT id FROM studio_keys WHERE account_id = ?)')->execute([$account]);
        $this->db->prepare('DELETE FROM studio_keys WHERE account_id = ?')->execute([$account]);
    }
}
