<?php
// Sign-in sessions: random ids kept only as SHA-256, an idle and an absolute
// limit, per-session CSRF tokens, and the trusted-device cookie's strings.
declare(strict_types=1);

namespace Admin;

final class Sessions
{
    public const COOKIE = '__Host-admin';
    public const DEVICE_COOKIE = '__Host-admin-device';
    public const IDLE = 7200;
    public const MAX = 604800;

    private const ATTRIBUTES = 'Path=/; Secure; HttpOnly; SameSite=Strict';

    public function __construct(private \PDO $db, private Clock $clock)
    {
    }

    /** New session (always a fresh id); returns the cookie header value. */
    public function start(Request $r): string
    {
        $id = bin2hex(random_bytes(32));
        $now = $this->clock->now();
        $this->db->prepare('INSERT INTO sessions (id_hash, created_at, seen_at, ip, agent) VALUES (?, ?, ?, ?, ?)')
            ->execute([hash('sha256', $id), $now, $now, substr($r->ip, 0, 45), substr($r->agent, 0, 255)]);
        return self::COOKIE . '=' . $id . '; ' . self::ATTRIBUTES;
    }

    /** True when the request's cookie names a live session; refreshes seen_at. */
    public function current(Request $r): bool
    {
        $hash = $this->hashOf($r);
        $now = $this->clock->now();
        // A session past either limit is deleted, whoever it belongs to.
        $this->db->prepare('DELETE FROM sessions WHERE seen_at <= ? OR created_at <= ?')
            ->execute([$now - self::IDLE, $now - self::MAX]);
        if ($hash === null) {
            return false;
        }
        $st = $this->db->prepare('UPDATE sessions SET seen_at = ? WHERE id_hash = ?');
        $st->execute([$now, $hash]);
        return $st->rowCount() === 1;
    }

    /** Ends this request's session; returns the expiring cookie header value. */
    public function end(Request $r): string
    {
        $hash = $this->hashOf($r);
        if ($hash !== null) {
            $this->db->prepare('DELETE FROM sessions WHERE id_hash = ?')->execute([$hash]);
        }
        return self::COOKIE . '=; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; ' . self::ATTRIBUTES;
    }

    /** Ends every session. */
    public function endAll(): void
    {
        $this->db->exec('DELETE FROM sessions');
    }

    /** A CSRF token bound to this session, stored hashed, replacing any earlier one; '' without a session. */
    public function csrf(Request $r): string
    {
        $hash = $this->hashOf($r);
        if ($hash === null) {
            return '';
        }
        $token = bin2hex(random_bytes(32));
        $st = $this->db->prepare('UPDATE sessions SET csrf_hash = ? WHERE id_hash = ?');
        $st->execute([hash('sha256', $token), $hash]);
        return $st->rowCount() === 1 ? $token : '';
    }

    /** True once for the token csrf() issued; every check, right or wrong, spends the stored token. */
    public function checkCsrf(Request $r, string $given): bool
    {
        $hash = $this->hashOf($r);
        if ($hash === null) {
            return false;
        }
        $this->db->exec('BEGIN IMMEDIATE');
        try {
            $st = $this->db->prepare('SELECT csrf_hash FROM sessions WHERE id_hash = ?');
            $st->execute([$hash]);
            $stored = $st->fetchColumn();
            $this->db->prepare('UPDATE sessions SET csrf_hash = NULL WHERE id_hash = ?')->execute([$hash]);
            $this->db->exec('COMMIT');
        } catch (\Throwable $e) {
            $this->db->exec('ROLLBACK');
            throw $e;
        }
        return is_string($stored) && $given !== '' && hash_equals($stored, hash('sha256', $given));
    }

    /** The Set-Cookie value that remembers a trusted device for ninety days. */
    public static function deviceCookie(string $token): string
    {
        return self::DEVICE_COOKIE . '=' . $token . '; Max-Age=' . Auth::DEVICE_TTL . '; ' . self::ATTRIBUTES;
    }

    /** The Set-Cookie value that removes the trusted-device cookie. */
    public static function expireDeviceCookie(): string
    {
        return self::DEVICE_COOKIE . '=; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; ' . self::ATTRIBUTES;
    }

    /** The trusted-device token the request carries, if any. */
    public static function deviceToken(Request $r): ?string
    {
        $v = $r->cookies[self::DEVICE_COOKIE] ?? null;
        return is_string($v) && $v !== '' ? $v : null;
    }

    private function hashOf(Request $r): ?string
    {
        $id = $r->cookies[self::COOKIE] ?? null;
        return is_string($id) && $id !== '' ? hash('sha256', $id) : null;
    }
}
