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
            return \Admin\Keys::error(403, 'HTTPS required.');
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

    /** The AI key's account, metered like an admin key; a scope outside AiKeys::SCOPES is refused whatever its row holds. */
    private function aiKey(int $id, int $account, string $scopes, string $scope): int|\Admin\Response
    {
        $held = json_decode($scopes, true);
        $allowed = isset(AiKeys::SCOPES[$scope]) && is_array($held) && in_array($scope, $held, true);
        return \Admin\Keys::meter($this->db, $this->clock, 'studio_keys', $id, $allowed) ?? $account;
    }
}
