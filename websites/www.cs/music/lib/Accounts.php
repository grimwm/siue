<?php
// The studio's accounts: one per address, made at the first sign-in, refused to a new address that is not
// named once the studio holds max_accounts accounts or the shared pool is full. Usage is what an account
// stores: its drafts' stored bytes plus its sealed notes. Addresses come in normalized (Admin\Address).
declare(strict_types=1);

namespace Music;

final class Accounts
{
    public function __construct(private \PDO $db, private \Admin\Clock $clock, private \Admin\People $people)
    {
    }

    public function idFor(string $email): ?int
    {
        $q = $this->db->prepare('SELECT id FROM accounts WHERE email = ?');
        $q->execute([$email]);
        $id = $q->fetchColumn();
        return $id === false ? null : (int) $id;
    }

    public function emailOf(int $id): ?string
    {
        $q = $this->db->prepare('SELECT email FROM accounts WHERE id = ?');
        $q->execute([$id]);
        $email = $q->fetchColumn();
        return $email === false ? null : (string) $email;
    }

    /**
     * The account for $email, made on its first sign-in, with its last sign-in stamped now. Null when the studio is
     * full: a new address that is not named, once max_accounts accounts exist or the shared bytes reach max_shared_bytes.
     */
    public function signIn(string $email): ?int
    {
        $now = $this->clock->now();
        $this->db->exec('BEGIN IMMEDIATE');
        try {
            $id = $this->idFor($email);
            if ($id === null) {
                if (!$this->people->isNamed($email) && $this->full()) {
                    $this->db->exec('ROLLBACK');
                    return null;
                }
                $this->db->prepare('INSERT INTO accounts (email, created_at, last_sign_in_at) VALUES (?, ?, ?)')->execute([$email, $now, $now]);
                $id = (int) $this->db->lastInsertId();
            } else {
                $this->db->prepare('UPDATE accounts SET last_sign_in_at = ? WHERE id = ?')->execute([$now, $id]);
            }
            $this->db->exec('COMMIT');
            return $id;
        } catch (\Throwable $e) {
            if ($this->db->inTransaction()) {
                $this->db->exec('ROLLBACK');
            }
            throw $e;
        }
    }

    /** The owner's account, made (without a sign-in) when it is missing. */
    public function ownerId(): int
    {
        $this->db->prepare('INSERT OR IGNORE INTO accounts (email, created_at) VALUES (?, ?)')->execute([\Admin\Auth::OWNER, $this->clock->now()]);
        return (int) $this->idFor(\Admin\Auth::OWNER);
    }

    /** The account's stored bytes: its drafts as stored plus its sealed notes. */
    public function usage(int $id): int
    {
        return self::untilStored(function () use ($id): int {
            $q = $this->db->prepare('SELECT (SELECT COALESCE(SUM(size), 0) FROM music_drafts WHERE account_id = :id) + (SELECT COALESCE(SUM(size), 0) FROM music_notes WHERE account_id = :id)');
            $q->execute([':id' => $id]);
            return (int) $q->fetchColumn();
        }, 0);
    }

    /** The stored bytes of every account without the allowance: what max_shared_bytes caps. */
    public function sharedUsage(): int
    {
        $total = 0;
        foreach ($this->usages() as $row) {
            if (!$this->people->hasAllowance($row['email'])) {
                $total += $row['usage'];
            }
        }
        return $total;
    }

    /** What the shared pool has left: max_shared_bytes less sharedUsage(); below zero when it is over. */
    public function sharedRoom(): int
    {
        return $this->people->maxSharedBytes() - $this->sharedUsage();
    }

    /** @return list<array{id: int, email: string, usage: int, last_sign_in_at: ?int, named: bool}> oldest account first */
    public function list(): array
    {
        return array_map(fn(array $row): array => $row + ['named' => $this->people->isNamed($row['email'])], $this->usages());
    }

    private function full(): bool
    {
        $count = (int) $this->db->query('SELECT COUNT(*) FROM accounts')->fetchColumn();
        return $count >= $this->people->maxAccounts() || $this->sharedUsage() >= $this->people->maxSharedBytes();
    }

    /** @return list<array{id: int, email: string, usage: int, last_sign_in_at: ?int}> */
    private function usages(): array
    {
        $sum = static fn(string $table, string $alias): string => "(SELECT COALESCE(SUM(size), 0) FROM $table $alias WHERE $alias.account_id = a.id)";
        $rows = self::untilStored(
            fn(): array => $this->db->query('SELECT a.id, a.email, a.last_sign_in_at, ' . $sum('music_drafts', 'd') . ' + ' . $sum('music_notes', 'n') . ' AS usage FROM accounts a ORDER BY a.id')->fetchAll(\PDO::FETCH_ASSOC),
            null,
        ) ?? $this->db->query('SELECT id, email, last_sign_in_at, 0 AS usage FROM accounts ORDER BY id')->fetchAll(\PDO::FETCH_ASSOC);
        return array_map(static fn(array $r): array => [
            'id' => (int) $r['id'],
            'email' => (string) $r['email'],
            'usage' => (int) $r['usage'],
            'last_sign_in_at' => $r['last_sign_in_at'] === null ? null : (int) $r['last_sign_in_at'],
        ], $rows);
    }

    /**
     * $query's result, or $none while the workroom has stored nothing per account: its tables are not made yet, or
     * not yet moved into accounts (Store makes and moves them when it first opens). Any other storage error is thrown.
     */
    private static function untilStored(\Closure $query, mixed $none): mixed
    {
        try {
            return $query();
        } catch (\PDOException $e) {
            if (str_contains($e->getMessage(), 'no such table') || str_contains($e->getMessage(), 'no such column')) {
                return $none;
            }
            throw $e;
        }
    }
}
