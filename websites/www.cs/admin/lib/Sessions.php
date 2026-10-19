<?php
// Sign-in sessions: random ids kept only as SHA-256, an idle and an absolute
// limit, per-session CSRF tokens, and the trusted-device cookie's strings.
declare(strict_types=1);

namespace Admin;

final class Sessions
{
    public const COOKIE = '__Secure-admin';
    public const DEVICE_COOKIE = '__Secure-admin-device';
    public const IDLE = 604800;
    public const MAX = 2592000;

    /**
     * @param string $cookiePath the Path every cookie carries: the owner's folder, never wider (www.cs
     *                           serves every user's pages from the same host, and __Host- would force Path=/)
     */
    public function __construct(private \PDO $db, private Clock $clock, private string $cookiePath)
    {
    }

    /** The attributes every cookie carries; no Domain, so the browser keeps it to this host. */
    public static function attributes(string $path, string $sameSite = 'Strict'): string
    {
        return 'Path=' . $path . '; Secure; HttpOnly; SameSite=' . $sameSite;
    }

    /** New session (always a fresh id); returns the cookie header value, kept across browser restarts up to MAX. */
    public function start(Request $r): string
    {
        $id = bin2hex(random_bytes(32));
        $now = $this->clock->now();
        $this->db->prepare('INSERT INTO sessions (id_hash, created_at, seen_at, ip, agent) VALUES (?, ?, ?, ?, ?)')
            ->execute([hash('sha256', $id), $now, $now, substr($r->ip, 0, 45), substr($r->agent, 0, 255)]);
        return self::COOKIE . '=' . $id . '; Max-Age=' . self::MAX . '; ' . self::attributes($this->cookiePath);
    }

    /** True when the request's cookie names a live session; refreshes seen_at. */
    public function current(Request $r): bool
    {
        $hash = $this->hashOf($r);
        if ($hash === null) {
            return false; // an anonymous request writes nothing
        }
        $now = $this->clock->now();
        // A session past either limit is deleted, whoever it belongs to.
        $this->db->prepare('DELETE FROM sessions WHERE seen_at <= ? OR created_at <= ?')
            ->execute([$now - self::IDLE, $now - self::MAX]);
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
        return self::COOKIE . '=; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; ' . self::attributes($this->cookiePath);
    }

    /** Ends every session. */
    public function endAll(): void
    {
        $this->db->exec('DELETE FROM sessions');
    }

    /**
     * The session's current CSRF token, created when it has none; '' without a live
     * session. The database keeps only a random nonce; the token is its HMAC under the
     * session id, so it can be handed to every form on a page and is unknowable from
     * the database alone. Only checkCsrf() replaces it.
     */
    public function csrf(Request $r): string
    {
        $id = $this->idOf($r);
        if ($id === null || !$this->live($id)) {
            return '';
        }
        $hash = hash('sha256', $id);
        $this->db->exec('BEGIN IMMEDIATE');
        try {
            $st = $this->db->prepare('SELECT csrf_nonce FROM sessions WHERE id_hash = ?');
            $st->execute([$hash]);
            $nonce = $st->fetchColumn();
            if (!is_string($nonce) || $nonce === '') {
                $nonce = bin2hex(random_bytes(32));
                $this->db->prepare('UPDATE sessions SET csrf_nonce = ? WHERE id_hash = ?')->execute([$nonce, $hash]);
            }
            $this->db->exec('COMMIT');
        } catch (\Throwable $e) {
            if ($this->db->inTransaction()) {
                $this->db->exec('ROLLBACK');
            }
            throw $e;
        }
        return hash_hmac('sha256', $nonce, $id);
    }

    /** True for the session's current token; every check, right or wrong, replaces it. False for an expired session. */
    public function checkCsrf(Request $r, string $given): bool
    {
        $id = $this->idOf($r);
        if ($id === null || !$this->live($id)) {
            return false;
        }
        $hash = hash('sha256', $id);
        $this->db->exec('BEGIN IMMEDIATE');
        try {
            $st = $this->db->prepare('SELECT csrf_nonce FROM sessions WHERE id_hash = ?');
            $st->execute([$hash]);
            $nonce = $st->fetchColumn();
            $this->db->prepare('UPDATE sessions SET csrf_nonce = NULL WHERE id_hash = ?')->execute([$hash]);
            $this->db->exec('COMMIT');
        } catch (\Throwable $e) {
            if ($this->db->inTransaction()) {
                $this->db->exec('ROLLBACK');
            }
            throw $e;
        }
        return is_string($nonce) && $nonce !== '' && $given !== ''
            && hash_equals(hash_hmac('sha256', $nonce, $id), $given);
    }

    /** The Set-Cookie value that remembers a trusted device for ninety days. */
    public static function deviceCookie(string $token, string $path): string
    {
        return self::DEVICE_COOKIE . '=' . $token . '; Max-Age=' . Auth::DEVICE_TTL . '; ' . self::attributes($path);
    }

    /** The Set-Cookie value that removes the trusted-device cookie. */
    public static function expireDeviceCookie(string $path): string
    {
        return self::DEVICE_COOKIE . '=; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; ' . self::attributes($path);
    }

    /** The trusted-device token the request carries, if any. */
    public static function deviceToken(Request $r): ?string
    {
        $v = $r->cookies[self::DEVICE_COOKIE] ?? null;
        return is_string($v) && $v !== '' ? $v : null;
    }

    private function hashOf(Request $r): ?string
    {
        $id = $this->idOf($r);
        return $id === null ? null : hash('sha256', $id);
    }

    private function idOf(Request $r): ?string
    {
        $id = $r->cookies[self::COOKIE] ?? null;
        return is_string($id) && $id !== '' ? $id : null;
    }

    /** True while the session is inside both limits; does not refresh it. */
    private function live(string $id): bool
    {
        $now = $this->clock->now();
        $st = $this->db->prepare('SELECT 1 FROM sessions WHERE id_hash = ? AND seen_at > ? AND created_at > ?');
        $st->execute([hash('sha256', $id), $now - self::IDLE, $now - self::MAX]);
        return $st->fetchColumn() !== false;
    }
}
