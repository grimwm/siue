<?php
// One-time sign-in links for a realm: issued only to an address the realm allows, stored hashed in the
// realm's own tables, valid for fifteen minutes, spent once, and rate limited per hour.
declare(strict_types=1);

namespace Admin;

final class Auth
{
    public const OWNER = 'wgrim@siue.edu';
    public const LINK_TTL = 900;
    public const DEVICE_TTL = 7776000;

    private const WINDOW = 3600;

    /** The realm's table prefix: a fixed value from Realm, never from a request. */
    private string $t;

    public function __construct(private \PDO $db, private Clock $clock, private Realm $realm)
    {
        $this->t = $realm->tables;
    }

    /** True when the address, trimmed and lower-cased (Address::normalize: any CR or LF refuses), is one the realm allows. */
    public function allowed(string $email): bool
    {
        return $this->address($email) !== null;
    }

    /** The normalized address when the realm allows it, else null. */
    private function address(string $email): ?string
    {
        $a = Address::normalize($email);
        return $a !== null && ($this->realm->allows)($a) ? $a : null;
    }

    /**
     * Records the request; returns the plain token when a link may be sent, else
     * null (not allowed, or a limit hit). A trusted device skips the address and
     * global limits (so strangers cannot lock the owner out) but keeps the per-IP
     * limit. $browserHash (the SHA-256 of the requesting browser's pending mark) is stored with
     * the link so only that browser can open it signed in. Opens its own BEGIN IMMEDIATE
     * transaction: callers must not hold one.
     */
    public function requestLink(string $email, string $ip, bool $trustedDevice = false, ?string $browserHash = null): ?string
    {
        $ip = substr($ip, 0, 45);
        $now = $this->clock->now();
        $since = $now - self::WINDOW;
        $address = $this->address($email);
        $limit = $this->realm->limits;
        $t = $this->t;

        // One immediate transaction, so concurrent requests cannot both pass a limit.
        $this->db->exec('BEGIN IMMEDIATE');
        try {
            $this->db->prepare("DELETE FROM {$t}link_requests WHERE at <= :since")->execute([':since' => $since]);
            // Spent and expired links stay an hour past their expiry so the
            // per-address count still sees them.
            $this->db->prepare("DELETE FROM {$t}links WHERE expires_at <= :old OR (used_at IS NOT NULL AND created_at <= :since)")
                ->execute([':old' => $now - self::WINDOW, ':since' => $since]);

            // Links issued in the window: refused requests never use up the overall limit. The request
            // rows serve the per-IP limit and the row cap.
            $issued = $this->count("SELECT COUNT(*) FROM {$t}links WHERE created_at > :since", [':since' => $since]);
            $rows = $this->count("SELECT COUNT(*) FROM {$t}link_requests", []);
            $perIp = $this->count("SELECT COUNT(*) FROM {$t}link_requests WHERE ip = :ip", [':ip' => $ip]);
            $perAddress = $address === null ? 0
                : $this->count("SELECT COUNT(*) FROM {$t}links WHERE email = :e AND created_at > :since", [':e' => $address, ':since' => $since]);

            // Every request counts, allowed or not, until its address is over the limit: past it the
            // window already holds, and a flood must not keep growing the table. The address column
            // holds an allowed address in its normal form, never what a refused stranger typed.
            if ($perIp < $limit['ip'] && $rows < $limit['rows']) {
                $this->db->prepare("INSERT INTO {$t}link_requests (ip, email, at) VALUES (:ip, :e, :at)")
                    ->execute([':ip' => $ip, ':e' => $address ?? '', ':at' => $now]);
            }

            $token = null;
            if ($address !== null && $perIp < $limit['ip']
                && ($trustedDevice || ($issued < $limit['global'] && $perAddress < $limit['address']))) {
                $token = bin2hex(random_bytes(32));
                $this->db->prepare("INSERT INTO {$t}links (token_hash, email, created_at, expires_at, used_at, browser_hash) VALUES (:h, :e, :c, :x, NULL, :b)")
                    ->execute([':h' => hash('sha256', $token), ':e' => $address, ':c' => $now, ':x' => $now + self::LINK_TTL, ':b' => $browserHash]);
            }
            $this->db->exec('COMMIT');
        } catch (\Throwable $e) {
            if ($this->db->inTransaction()) {
                $this->db->exec('ROLLBACK');
            }
            throw $e;
        }
        return $token;
    }

    /**
     * Registers a trusted device; returns its plain token (only the SHA-256 is stored). A studio device
     * belongs to one account and needs it; an admin device has none.
     */
    public function issueDevice(?int $account = null): string
    {
        $studio = $this->studio();
        if ($studio !== ($account !== null)) {
            throw new \LogicException($studio ? 'a studio device needs its account' : 'an admin device has no account');
        }
        $t = $this->t;
        $now = $this->clock->now();
        $this->db->prepare("DELETE FROM {$t}devices WHERE expires_at <= :now")->execute([':now' => $now]);
        $token = bin2hex(random_bytes(32));
        $h = hash('sha256', $token);
        if ($studio) {
            $this->db->prepare("INSERT INTO {$t}devices (token_hash, account_id, created_at, expires_at) VALUES (:h, :a, :c, :x)")
                ->execute([':h' => $h, ':a' => $account, ':c' => $now, ':x' => $now + self::DEVICE_TTL]);
        } else {
            $this->db->prepare("INSERT INTO {$t}devices (token_hash, created_at, expires_at) VALUES (:h, :c, :x)")
                ->execute([':h' => $h, ':c' => $now, ':x' => $now + self::DEVICE_TTL]);
        }
        return $token;
    }

    /**
     * True for a well-formed, known, unexpired device token. In the studio realm the device must belong to
     * $account, and without one nothing is trusted; the admin realm ignores $account.
     */
    public function isTrustedDevice(?string $token, ?int $account = null): bool
    {
        if ($token === null || !self::wellFormed($token)) {
            return false;
        }
        $t = $this->t;
        $args = [':h' => hash('sha256', $token), ':now' => $this->clock->now()];
        if ($this->studio()) {
            if ($account === null) {
                return false;
            }
            $st = $this->db->prepare("SELECT 1 FROM {$t}devices WHERE token_hash = :h AND expires_at > :now AND account_id = :a");
            $st->execute($args + [':a' => $account]);
        } else {
            $st = $this->db->prepare("SELECT 1 FROM {$t}devices WHERE token_hash = :h AND expires_at > :now");
            $st->execute($args);
        }
        return $st->fetchColumn() !== false;
    }

    /** The studio account of an address the realm allows, or null (none yet, refused, or the admin realm). */
    public function accountOf(string $email): ?int
    {
        $address = $this->address($email);
        if ($address === null || !$this->studio()) {
            return null;
        }
        $st = $this->db->prepare('SELECT id FROM accounts WHERE email = ?');
        $st->execute([$address]);
        $id = $st->fetchColumn();
        return $id === false ? null : (int) $id;
    }

    /** Forgets every trusted device of the realm, or in the studio only $account's. */
    public function forgetDevices(?int $account = null): void
    {
        $t = $this->t;
        if ($account !== null && $this->studio()) {
            $this->db->prepare("DELETE FROM {$t}devices WHERE account_id = ?")->execute([$account]);
            return;
        }
        $this->db->exec("DELETE FROM {$t}devices");
    }

    /** The address for a valid, unused, unexpired token; never consumes. */
    public function peek(string $token): ?string
    {
        if (!self::wellFormed($token)) {
            return null;
        }
        $st = $this->db->prepare("SELECT email FROM {$this->t}links WHERE token_hash = :h AND used_at IS NULL AND expires_at > :now");
        $st->execute([':h' => hash('sha256', $token), ':now' => $this->clock->now()]);
        $email = $st->fetchColumn();
        return is_string($email) ? $email : null;
    }

    /** True when the token is live and was requested by the browser holding $mark; never consumes. */
    public function peekFor(string $token, string $mark): bool
    {
        if (!self::wellFormed($token) || !self::wellFormed($mark)) {
            return false;
        }
        $st = $this->db->prepare("SELECT browser_hash FROM {$this->t}links WHERE token_hash = :h AND used_at IS NULL AND expires_at > :now");
        $st->execute([':h' => hash('sha256', $token), ':now' => $this->clock->now()]);
        $bound = $st->fetchColumn();
        return is_string($bound) && hash_equals($bound, hash('sha256', $mark));
    }

    /** Consumes a valid token once; the address, or null. */
    public function consume(string $token): ?string
    {
        if (!self::wellFormed($token)) {
            return null;
        }
        $hash = hash('sha256', $token);
        $now = $this->clock->now();
        // One atomic UPDATE: of any number of concurrent callers exactly one sees rowCount 1.
        $up = $this->db->prepare("UPDATE {$this->t}links SET used_at = :now WHERE token_hash = :h AND used_at IS NULL AND expires_at > :now");
        $up->execute([':now' => $now, ':h' => $hash]);
        if ($up->rowCount() !== 1) {
            return null;
        }
        $st = $this->db->prepare("SELECT email FROM {$this->t}links WHERE token_hash = :h");
        $st->execute([':h' => $hash]);
        $email = $st->fetchColumn();
        return is_string($email) ? $email : null;
    }

    /** Deletes the link for this token (a failed send). */
    public function forget(string $token): void
    {
        if (self::wellFormed($token)) {
            $this->db->prepare("DELETE FROM {$this->t}links WHERE token_hash = :h")->execute([':h' => hash('sha256', $token)]);
        }
    }

    /**
     * Spends every unused link of the realm, or in the studio only those for $account's address (sign out
     * everywhere). Spent, not deleted: they still count against the hour's limits.
     */
    public function forgetAll(?int $account = null): void
    {
        $t = $this->t;
        $now = $this->clock->now();
        if ($account !== null && $this->studio()) {
            $this->db->prepare("UPDATE {$t}links SET used_at = ? WHERE used_at IS NULL AND email = (SELECT email FROM accounts WHERE id = ?)")->execute([$now, $account]);
            return;
        }
        $this->db->prepare("UPDATE {$t}links SET used_at = ? WHERE used_at IS NULL")->execute([$now]);
    }

    private function studio(): bool
    {
        return $this->realm->name === 'studio';
    }

    private static function wellFormed(string $token): bool
    {
        return preg_match('/^[0-9a-f]{64}$/D', $token) === 1;
    }

    /** @param array<string,mixed> $args */
    private function count(string $sql, array $args): int
    {
        $st = $this->db->prepare($sql);
        $st->execute($args);
        return (int) $st->fetchColumn();
    }
}
