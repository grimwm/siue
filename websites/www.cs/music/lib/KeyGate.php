<?php
// The API's key check: which account a request's Bearer key serves. An AI key serves its own account; any
// other key goes to the owner's admin keys (Admin\Keys), which serve the owner's account. The account comes
// from the key, never from the request.
declare(strict_types=1);

namespace Music;

/** Who a request's key is: the account it serves and, for an AI key, which key and the sealing key it is paired to. */
final class Caller
{
    /** @param list<string> $scopes an AI key's scopes; empty for an admin key */
    public function __construct(
        public readonly int $account,
        public readonly ?int $aiKey = null,
        public readonly ?string $label = null,
        public readonly array $scopes = [],
    ) {
    }
}

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

    /** The pairing of the AI keys this gate checks. */
    public function pairing(): Pairing
    {
        return new Pairing($this->db, $this->clock);
    }

    /**
     * The account $r's key serves for $scope, or the refusal to send: plain HTTP is refused before the key is read,
     * and only the Bearer header counts. An active AI key is held to Admin\Keys::PER_MINUTE requests a minute (a
     * wrong-scope request counts) and to its own scopes, which never reach keys:publish. A key that is no AI key
     * is checked as an admin key and serves the owner.
     */
    public function check(\Admin\Request $r, string $scope): int|\Admin\Response
    {
        $caller = $this->caller($r, $scope);
        return $caller instanceof Caller ? $caller->account : $caller;
    }

    /**
     * As check(), with who the key is. A null $scope asks only that the key is live: an AI key with any scope passes
     * (its status route), and an admin key is refused 403, since only AI keys have a status.
     */
    public function caller(\Admin\Request $r, ?string $scope): Caller|\Admin\Response
    {
        if (!$r->https && !\admin_is_local_base($this->baseUrl)) {
            return \Admin\Keys::error(403, 'HTTPS required.');
        }
        $header = $r->headers['authorization'] ?? '';
        if (preg_match('/^Bearer ([0-9a-f]{64})$/D', $header, $m) === 1) {
            $st = $this->db->prepare('SELECT id, account_id, label, scopes FROM studio_keys WHERE key_hash = ? AND revoked_at IS NULL');
            $st->execute([hash('sha256', $m[1])]);
            $row = $st->fetch(\PDO::FETCH_ASSOC);
            // An open cursor holds a read snapshot; meter's BEGIN IMMEDIATE would then fail at once (SQLITE_BUSY,
            // no busy wait) whenever another request wrote since. Close it first.
            $st->closeCursor();
            if ($row !== false) {
                $held = json_decode((string) $row['scopes'], true);
                $held = is_array($held) ? array_values(array_filter($held, static fn(mixed $s): bool => is_string($s) && isset(AiKeys::SCOPES[$s]))) : [];
                // A scope outside AiKeys::SCOPES is refused whatever the row holds.
                $allowed = $scope === null ? $held !== [] : isset(AiKeys::SCOPES[$scope]) && in_array($scope, $held, true);
                $deny = \Admin\Keys::meter($this->db, $this->clock, 'studio_keys', (int) $row['id'], $allowed);
                return $deny ?? new Caller((int) $row['account_id'], (int) $row['id'], (string) $row['label'], $held);
            }
        }
        if ($scope === null) {
            $deny = $this->adminKeys->check($r, 'notes:pickup');
            return $deny ?? \Admin\Keys::error(403, 'Only an AI key has a sealing key.');
        }
        $deny = $this->adminKeys->check($r, $scope);
        return $deny ?? new Caller($this->accounts->ownerId());
    }
}
