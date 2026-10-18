<?php
// Scoped API keys: 64 hex characters shown once, kept only as SHA-256, each with a
// list of scopes from the registry, a per-key rate limit, and revocation.
declare(strict_types=1);

namespace Admin;

final class Keys
{
    public const PER_MINUTE = 60;
    public const LABEL_MAX = 80;

    /** The labels the music tool's setup sends people here to make (PUBLISH_KEY and PICKUP_KEY in siue_music/keys.py). */
    public const GUIDED_LABELS = ['music-publish', 'music-pickup'];

    /** The scopes a key may carry (bootstrap.php's ADMIN_KEY_SCOPES). */
    public const SCOPES = \ADMIN_KEY_SCOPES;

    /** @var list<string> */
    private array $registry;
    private string $baseUrl;

    /**
     * @param list<string>|null $scopes the registry; production passes none and reads the configured one
     * @param string|null $baseUrl the configured base URL; production passes none and reads it from the environment
     */
    public function __construct(private \PDO $db, private Clock $clock, ?array $scopes = null, ?string $baseUrl = null)
    {
        $this->registry = array_values($scopes ?? self::SCOPES);
        $this->baseUrl = $baseUrl ?? admin_base_url();
    }

    /** @return list<string> */
    public function registry(): array
    {
        return $this->registry;
    }

    /**
     * Makes a key and returns it; this is the only time it exists in the clear. Older keys are left alone.
     *
     * @param list<string> $scopes
     * @throws \InvalidArgumentException for a bad label, no scopes or a scope outside the registry
     */
    public function create(string $label, array $scopes): string
    {
        return $this->createReplacing($label, $scopes, false)['key'];
    }

    /**
     * Like create(), and for a guided label also revokes every older active key with that label, in
     * the same transaction, so a guided label has one active key.
     *
     * @param list<string> $scopes
     * @return array{key:string,id:int,replaced:int} id is the new key's row id; replaced counts the keys this call revoked
     * @throws \InvalidArgumentException as create() does
     */
    public function createReplacing(string $label, array $scopes, bool $replace = true): array
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
            if (!in_array($s, $this->registry, true)) {
                throw new \InvalidArgumentException('Unknown scope.');
            }
        }
        $key = bin2hex(random_bytes(32));
        $now = $this->clock->now();
        $replaced = 0;
        $this->db->exec('BEGIN IMMEDIATE');
        try {
            if ($replace && in_array($label, self::GUIDED_LABELS, true)) {
                $old = $this->db->prepare('UPDATE keys SET revoked_at = ? WHERE label = ? AND revoked_at IS NULL');
                $old->execute([$now, $label]);
                $replaced = $old->rowCount();
            }
            $this->db->prepare('INSERT INTO keys (label, key_hash, scopes, created_at) VALUES (?, ?, ?, ?)')
                ->execute([$label, hash('sha256', $key), json_encode($scopes, JSON_THROW_ON_ERROR), $now]);
            $id = (int) $this->db->lastInsertId();
            $this->db->exec('COMMIT');
        } catch (\Throwable $e) {
            if ($this->db->inTransaction()) {
                $this->db->exec('ROLLBACK');
            }
            throw $e;
        }
        return ['key' => $key, 'id' => $id, 'replaced' => $replaced];
    }

    /** @return list<array{id:int,label:string,scopes:list<string>,created_at:int,last_used_at:?int,revoked_at:?int}> */
    public function list(): array
    {
        $rows = $this->db->query('SELECT id, label, scopes, created_at, last_used_at, revoked_at FROM keys ORDER BY id')->fetchAll(\PDO::FETCH_ASSOC);
        return array_map(static fn(array $r): array => [
            'id' => (int) $r['id'],
            'label' => (string) $r['label'],
            'scopes' => json_decode((string) $r['scopes'], true) ?: [],
            'created_at' => (int) $r['created_at'],
            'last_used_at' => $r['last_used_at'] === null ? null : (int) $r['last_used_at'],
            'revoked_at' => $r['revoked_at'] === null ? null : (int) $r['revoked_at'],
        ], $rows);
    }

    /** True when an active key was revoked; false for an unknown or already revoked id. */
    public function revoke(int $id): bool
    {
        $st = $this->db->prepare('UPDATE keys SET revoked_at = ? WHERE id = ? AND revoked_at IS NULL');
        $st->execute([$this->clock->now(), $id]);
        return $st->rowCount() === 1;
    }

    /**
     * The gate for an API request: null when allowed (the use is recorded), else the JSON
     * response to send. Plain HTTP is refused before anything is read; only the Bearer
     * header counts, never the query string.
     */
    public function check(Request $r, string $scope): ?Response
    {
        if (!$r->https && !admin_is_local_base($this->baseUrl)) {
            return self::error(403, 'HTTPS required.');
        }
        $header = $r->headers['authorization'] ?? '';
        if (preg_match('/^Bearer ([0-9a-f]{64})$/Di', $header, $m) !== 1 || strtolower($m[1]) !== $m[1]) {
            return self::error(401, 'A valid API key is required.');
        }
        $st = $this->db->prepare('SELECT id, scopes FROM keys WHERE key_hash = ? AND revoked_at IS NULL');
        $st->execute([hash('sha256', $m[1])]);
        $row = $st->fetch(\PDO::FETCH_ASSOC);
        if ($row === false) {
            return self::error(401, 'A valid API key is required.');
        }
        $id = (int) $row['id'];
        $now = $this->clock->now();
        // Every request with a live key counts toward its limit, a wrong-scope one included.
        $this->db->exec('BEGIN IMMEDIATE');
        try {
            $this->db->prepare('DELETE FROM key_hits WHERE at <= ?')->execute([$now - 60]);
            $st = $this->db->prepare('SELECT COUNT(*) FROM key_hits WHERE key_id = ?');
            $st->execute([$id]);
            $over = (int) $st->fetchColumn() >= self::PER_MINUTE;
            if (!$over) {
                $this->db->prepare('INSERT INTO key_hits (key_id, at) VALUES (?, ?)')->execute([$id, $now]);
            }
            $scopes = json_decode((string) $row['scopes'], true);
            $allowed = is_array($scopes) && in_array($scope, $scopes, true);
            if (!$over && $allowed) {
                $this->db->prepare('UPDATE keys SET last_used_at = ? WHERE id = ?')->execute([$now, $id]);
            }
            $this->db->exec('COMMIT');
        } catch (\Throwable $e) {
            if ($this->db->inTransaction()) {
                $this->db->exec('ROLLBACK');
            }
            throw $e;
        }
        if ($over) {
            return self::error(429, 'Too many requests.');
        }
        return $allowed ? null : self::error(403, 'This key lacks the scope.');
    }

    private static function error(int $status, string $message): Response
    {
        $headers = ['Content-Type' => 'application/json'];
        if ($status === 401) {
            $headers['WWW-Authenticate'] = 'Bearer';
        }
        return new Response($status, Headers::apply($headers), json_encode(['error' => $message], JSON_THROW_ON_ERROR));
    }
}
