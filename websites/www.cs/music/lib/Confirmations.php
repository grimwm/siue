<?php
// The mailed links that confirm a studio's destructive actions (Forgot your passphrase, Start over): sign-in links'
// rules. A 32-byte random token stored only as its SHA-256, with the account, its address and the action; good for
// Admin\Auth::LINK_TTL (fifteen minutes) and spent once by one atomic UPDATE; at most PER_HOUR an hour per account.
// The mail goes in flush(), after the reply, to the account's own address, and a link whose mail fails is deleted.
declare(strict_types=1);

namespace Music;

final class Confirmations
{
    public const ACTIONS = ['forgot-passphrase', 'start-over'];
    public const PER_HOUR = 3;

    private const WINDOW = 3600;

    /** @var list<array{to: string, subject: string, mime: string, token: string}> */
    private array $queue = [];

    /** $studioBase: the studio realm's folder URL, where confirm.php lives. */
    public function __construct(private \PDO $db, private \Admin\Clock $clock, private \Admin\Mailer $mailer, private string $studioBase)
    {
    }

    /**
     * Issues a link for $action on $account and queues its mail to $email (the account's address). False, and
     * nothing issued, when the account has had PER_HOUR links in the last hour.
     */
    public function request(int $account, string $email, string $action): bool
    {
        if (!in_array($action, self::ACTIONS, true)) {
            throw new \InvalidArgumentException("Unknown action: $action");
        }
        $now = $this->clock->now();
        $token = null;
        $this->db->exec('BEGIN IMMEDIATE');
        try {
            // Spent and expired links stay an hour past their expiry so the hour's count still sees them.
            $this->db->prepare('DELETE FROM studio_confirms WHERE expires_at <= ?')->execute([$now - self::WINDOW]);
            $q = $this->db->prepare('SELECT COUNT(*) FROM studio_confirms WHERE account_id = ? AND created_at > ?');
            $q->execute([$account, $now - self::WINDOW]);
            if ((int) $q->fetchColumn() < self::PER_HOUR) {
                $token = bin2hex(random_bytes(32));
                $this->db->prepare('INSERT INTO studio_confirms (token_hash, account_id, email, action, created_at, expires_at) VALUES (?, ?, ?, ?, ?, ?)')
                    ->execute([hash('sha256', $token), $account, $email, $action, $now, $now + \Admin\Auth::LINK_TTL]);
            }
            $this->db->exec('COMMIT');
        } catch (\Throwable $e) {
            if ($this->db->inTransaction()) {
                $this->db->exec('ROLLBACK');
            }
            throw $e;
        }
        if ($token === null) {
            return false;
        }
        $mail = \Admin\MailTemplate::confirm($this->studioBase . 'confirm.php?token=' . $token, intdiv(\Admin\Auth::LINK_TTL, 60), $action);
        $this->queue[] = ['to' => $email, 'subject' => $mail['subject'], 'mime' => $mail['mime'], 'token' => $token];
        return true;
    }

    /**
     * The account and action of a live, unspent link whose account still has the address it was mailed to; never
     * spends it.
     *
     * @return array{account: int, action: string}|null
     */
    public function peek(mixed $token): ?array
    {
        if (!self::wellFormed($token)) {
            return null;
        }
        $q = $this->db->prepare('SELECT c.account_id, c.action FROM studio_confirms c JOIN accounts a ON a.id = c.account_id AND a.email = c.email WHERE c.token_hash = ? AND c.used_at IS NULL AND c.expires_at > ?');
        $q->execute([hash('sha256', $token), $this->clock->now()]);
        $row = $q->fetch(\PDO::FETCH_ASSOC);
        return $row === false ? null : ['account' => (int) $row['account_id'], 'action' => (string) $row['action']];
    }

    /**
     * Spends a live link once (of any number of concurrent callers exactly one gets it), and with it every other
     * unspent link of its account. Null when it is not live, or its account no longer has the address it was mailed to.
     *
     * @return array{account: int, action: string}|null
     */
    public function consume(mixed $token): ?array
    {
        $found = $this->peek($token);
        if ($found === null) {
            return null;
        }
        $now = $this->clock->now();
        $up = $this->db->prepare('UPDATE studio_confirms SET used_at = ? WHERE token_hash = ? AND used_at IS NULL AND expires_at > ?');
        $up->execute([$now, hash('sha256', (string) $token), $now]);
        if ($up->rowCount() !== 1) {
            return null;
        }
        $this->db->prepare('UPDATE studio_confirms SET used_at = ? WHERE account_id = ? AND used_at IS NULL')->execute([$now, $found['account']]);
        return $found;
    }

    /** Sends the queued mail. A link that cannot be sent is deleted so it cannot be used. */
    public function flush(): void
    {
        $queue = $this->queue;
        $this->queue = [];
        foreach ($queue as $m) {
            try {
                $this->mailer->send($m['to'], $m['subject'], $m['mime']);
            } catch (\Throwable $e) {
                error_log('music: confirmation mail not sent: ' . get_class($e));
                try {
                    $this->db->prepare('DELETE FROM studio_confirms WHERE token_hash = ?')->execute([hash('sha256', $m['token'])]);
                } catch (\Throwable $f) {
                    error_log('music: unsent confirmation link not removed: ' . get_class($f));
                }
            }
        }
    }

    private static function wellFormed(mixed $token): bool
    {
        return is_string($token) && preg_match('/^[0-9a-f]{64}$/D', $token) === 1;
    }
}
