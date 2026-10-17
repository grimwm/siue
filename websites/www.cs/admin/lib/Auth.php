<?php
// One-time sign-in links: issued only to the allowed address, stored hashed,
// valid for fifteen minutes, spent once, and rate limited per hour.
declare(strict_types=1);

namespace Admin;

final class Auth
{
    public const ALLOWED = 'wgrim@siue.edu';
    public const LINK_TTL = 900;

    private const WINDOW = 3600;
    private const LIMIT_GLOBAL = 30;
    private const LIMIT_IP = 20;
    private const LIMIT_ADDRESS = 3;

    public function __construct(private \PDO $db, private Clock $clock)
    {
    }

    /** True only for exactly ALLOWED once trimmed and lower-cased; any CR or LF refuses. */
    public static function allowed(string $email): bool
    {
        if (preg_match('/[\r\n]/', $email) === 1) {
            return false;
        }
        return strtolower(trim($email)) === self::ALLOWED;
    }

    /** Records the request; returns the plain token when a link may be sent, else null (not allowed, or a limit hit). */
    public function requestLink(string $email, string $ip): ?string
    {
        $now = $this->clock->now();
        $since = $now - self::WINDOW;
        $ok = self::allowed($email);

        // One immediate transaction, so concurrent requests cannot both pass a limit.
        $this->db->exec('BEGIN IMMEDIATE');
        try {
            $this->db->prepare('DELETE FROM link_requests WHERE at <= :since')->execute([':since' => $since]);
            // Spent and expired links stay an hour past their expiry so the
            // per-address count still sees them.
            $this->db->prepare('DELETE FROM links WHERE expires_at <= :old OR (used_at IS NOT NULL AND created_at <= :since)')
                ->execute([':old' => $now - self::WINDOW, ':since' => $since]);

            $global = $this->count('SELECT COUNT(*) FROM link_requests', []);
            $perIp = $this->count('SELECT COUNT(*) FROM link_requests WHERE ip = :ip', [':ip' => $ip]);
            $perAddress = $this->count('SELECT COUNT(*) FROM links WHERE email = :e AND created_at > :since', [':e' => self::ALLOWED, ':since' => $since]);

            // Every request counts, allowed or not.
            $this->db->prepare('INSERT INTO link_requests (ip, email, at) VALUES (:ip, :e, :at)')
                ->execute([':ip' => $ip, ':e' => substr(strtolower(trim($email)), 0, 254), ':at' => $now]);

            $token = null;
            if ($ok && $global < self::LIMIT_GLOBAL && $perIp < self::LIMIT_IP && $perAddress < self::LIMIT_ADDRESS) {
                $token = bin2hex(random_bytes(32));
                $this->db->prepare('INSERT INTO links (token_hash, email, created_at, expires_at, used_at) VALUES (:h, :e, :c, :x, NULL)')
                    ->execute([':h' => hash('sha256', $token), ':e' => self::ALLOWED, ':c' => $now, ':x' => $now + self::LINK_TTL]);
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

    /** The address for a valid, unused, unexpired token; never consumes. */
    public function peek(string $token): ?string
    {
        if (!self::wellFormed($token)) {
            return null;
        }
        $st = $this->db->prepare('SELECT email FROM links WHERE token_hash = :h AND used_at IS NULL AND expires_at > :now');
        $st->execute([':h' => hash('sha256', $token), ':now' => $this->clock->now()]);
        $email = $st->fetchColumn();
        return is_string($email) ? $email : null;
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
        $up = $this->db->prepare('UPDATE links SET used_at = :now WHERE token_hash = :h AND used_at IS NULL AND expires_at > :now');
        $up->execute([':now' => $now, ':h' => $hash]);
        if ($up->rowCount() !== 1) {
            return null;
        }
        $st = $this->db->prepare('SELECT email FROM links WHERE token_hash = :h');
        $st->execute([':h' => $hash]);
        $email = $st->fetchColumn();
        return is_string($email) ? $email : null;
    }

    /** Deletes the link for this token (a failed send). */
    public function forget(string $token): void
    {
        if (self::wellFormed($token)) {
            $this->db->prepare('DELETE FROM links WHERE token_hash = :h')->execute([':h' => hash('sha256', $token)]);
        }
    }

    /** Deletes every unused link (sign out everywhere). */
    public function forgetAll(): void
    {
        $this->db->exec('DELETE FROM links WHERE used_at IS NULL');
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
