<?php
// The API's key check: which account a request's Bearer key serves. An AI key serves its own account; any
// other key goes to the owner's admin keys (Admin\Keys), which serve the owner's account. The account comes
// from the key, never from the request.
declare(strict_types=1);

namespace Music;

final class KeyGate
{
    public function __construct(
        private \PDO $db,
        private \Admin\Clock $clock,
        private \Admin\Keys $adminKeys,
        private Accounts $accounts,
        private string $baseUrl,
    ) {
    }

    /**
     * The account $r's key serves for $scope, or the refusal to send: plain HTTP is refused before the key is read,
     * and only the Bearer header counts. An active AI key is held to Admin\Keys::PER_MINUTE requests a minute (a
     * wrong-scope request counts) and to its own scopes, which never reach keys:publish. A key that is no AI key
     * is checked as an admin key and serves the owner.
     */
    public function check(\Admin\Request $r, string $scope): int|\Admin\Response
    {
        if (!$r->https && !\admin_is_local_base($this->baseUrl)) {
            return self::error(403, 'HTTPS required.');
        }
        $header = $r->headers['authorization'] ?? '';
        if (preg_match('/^Bearer ([0-9a-f]{64})$/D', $header, $m) === 1) {
            $st = $this->db->prepare('SELECT id, account_id, scopes FROM studio_keys WHERE key_hash = ? AND revoked_at IS NULL');
            $st->execute([hash('sha256', $m[1])]);
            $row = $st->fetch(\PDO::FETCH_ASSOC);
            if ($row !== false) {
                return $this->aiKey((int) $row['id'], (int) $row['account_id'], (string) $row['scopes'], $scope);
            }
        }
        $deny = $this->adminKeys->check($r, $scope);
        return $deny ?? $this->accounts->ownerId();
    }

    private function aiKey(int $id, int $account, string $scopes, string $scope): int|\Admin\Response
    {
        $now = $this->clock->now();
        $this->db->exec('BEGIN IMMEDIATE');
        try {
            $this->db->prepare('DELETE FROM studio_key_hits WHERE at <= ?')->execute([$now - 60]);
            $st = $this->db->prepare('SELECT COUNT(*) FROM studio_key_hits WHERE key_id = ?');
            $st->execute([$id]);
            $over = (int) $st->fetchColumn() >= \Admin\Keys::PER_MINUTE;
            if (!$over) {
                $this->db->prepare('INSERT INTO studio_key_hits (key_id, at) VALUES (?, ?)')->execute([$id, $now]);
            }
            $held = json_decode($scopes, true);
            $allowed = isset(AiKeys::SCOPES[$scope]) && is_array($held) && in_array($scope, $held, true);
            if (!$over && $allowed) {
                $this->db->prepare('UPDATE studio_keys SET last_used_at = ? WHERE id = ?')->execute([$now, $id]);
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
        return $allowed ? $account : self::error(403, 'This key lacks the scope.');
    }

    /** A 403 or 429 in Admin\Keys' shape, so a tool cannot tell an AI key's refusal from an admin key's. */
    private static function error(int $status, string $message): \Admin\Response
    {
        return new \Admin\Response($status, \Admin\Headers::apply(['Content-Type' => 'application/json']), json_encode(['error' => $message], JSON_THROW_ON_ERROR));
    }
}
