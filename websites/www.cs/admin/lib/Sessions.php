<?php
// Sign-in sessions for a realm: random ids kept only as SHA-256 in the realm's own table, an idle and an
// absolute limit, per-session CSRF tokens, and the trusted-device cookie's strings. A studio session
// belongs to one account.
declare(strict_types=1);

namespace Admin;

final class Sessions
{
    /** The admin realm's session and device cookies. */
    public const COOKIE = '__Secure-admin';
    public const DEVICE_COOKIE = '__Secure-admin-device';
    public const IDLE = 604800;
    public const MAX = 2592000;

    /** The realm's table prefix: a fixed value from Realm, never from a request. */
    private string $t;

    /**
     * The realm's cookie path is the owner's folder (or its music/ folder), never wider: www.cs serves every
     * user's pages from the same host, and __Host- would force Path=/.
     */
    public function __construct(private \PDO $db, private Clock $clock, private Realm $realm)
    {
        $this->t = $realm->tables;
    }

    /** The attributes every cookie carries; no Domain, so the browser keeps it to this host. */
    public static function attributes(string $path, string $sameSite = 'Strict'): string
    {
        return 'Path=' . $path . '; Secure; HttpOnly; SameSite=' . $sameSite;
    }

    /**
     * New session (always a fresh id); returns the cookie header value, kept across browser restarts up to MAX.
     * A studio session needs its account; an admin session has none.
     */
    public function start(Request $r, ?int $account = null): string
    {
        $studio = $this->studio();
        if ($studio !== ($account !== null)) {
            throw new \LogicException($studio ? 'a studio session needs its account' : 'an admin session has no account');
        }
        $id = bin2hex(random_bytes(32));
        $now = $this->clock->now();
        $row = [hash('sha256', $id), $now, $now, substr($r->ip, 0, 45), substr($r->agent, 0, 255)];
        if ($studio) {
            $this->db->prepare("INSERT INTO {$this->t}sessions (id_hash, created_at, seen_at, ip, agent, account_id) VALUES (?, ?, ?, ?, ?, ?)")
                ->execute([...$row, $account]);
        } else {
            $this->db->prepare("INSERT INTO {$this->t}sessions (id_hash, created_at, seen_at, ip, agent) VALUES (?, ?, ?, ?, ?)")
                ->execute($row);
        }
        return $this->realm->cookie . '=' . $id . '; Max-Age=' . self::MAX . '; ' . self::attributes($this->realm->cookiePath);
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
        $this->db->prepare("DELETE FROM {$this->t}sessions WHERE seen_at <= ? OR created_at <= ?")
            ->execute([$now - self::IDLE, $now - self::MAX]);
        $st = $this->db->prepare("UPDATE {$this->t}sessions SET seen_at = ? WHERE id_hash = ?");
        $st->execute([$now, $hash]);
        return $st->rowCount() === 1;
    }

    /** The account of the request's live studio session, or null; refreshes it like current(). Studio realm only. */
    public function account(Request $r): ?int
    {
        if (!$this->studio()) {
            throw new \LogicException('only a studio session has an account');
        }
        if (!$this->current($r)) {
            return null;
        }
        $st = $this->db->prepare("SELECT account_id FROM {$this->t}sessions WHERE id_hash = ?");
        $st->execute([$this->hashOf($r)]);
        $id = $st->fetchColumn();
        return $id === false ? null : (int) $id;
    }

    /** Ends this request's session; returns the expiring cookie header value. */
    public function end(Request $r): string
    {
        $hash = $this->hashOf($r);
        if ($hash !== null) {
            $this->db->prepare("DELETE FROM {$this->t}sessions WHERE id_hash = ?")->execute([$hash]);
        }
        return $this->realm->cookie . '=; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; ' . self::attributes($this->realm->cookiePath);
    }

    /** Ends every session of the realm, or in the studio only $account's. */
    public function endAll(?int $account = null): void
    {
        if ($account !== null && $this->studio()) {
            $this->db->prepare("DELETE FROM {$this->t}sessions WHERE account_id = ?")->execute([$account]);
            return;
        }
        $this->db->exec("DELETE FROM {$this->t}sessions");
    }

    /**
     * A stable tag for this session and purpose, '' without a live session: an HMAC of the purpose under the
     * session id, so it changes with every sign-in and tells nothing about the id. A page keeps it beside
     * something it remembers, to forget that once this session ends.
     */
    public function tag(Request $r, string $purpose): string
    {
        $id = $this->idOf($r);
        return $id === null || !$this->live($id) ? '' : hash_hmac('sha256', $purpose, $id);
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
            $st = $this->db->prepare("SELECT csrf_nonce FROM {$this->t}sessions WHERE id_hash = ?");
            $st->execute([$hash]);
            $nonce = $st->fetchColumn();
            if (!is_string($nonce) || $nonce === '') {
                $nonce = bin2hex(random_bytes(32));
                $this->db->prepare("UPDATE {$this->t}sessions SET csrf_nonce = ? WHERE id_hash = ?")->execute([$nonce, $hash]);
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
            $st = $this->db->prepare("SELECT csrf_nonce FROM {$this->t}sessions WHERE id_hash = ?");
            $st->execute([$hash]);
            $nonce = $st->fetchColumn();
            $this->db->prepare("UPDATE {$this->t}sessions SET csrf_nonce = NULL WHERE id_hash = ?")->execute([$hash]);
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

    /** The Set-Cookie value that remembers a trusted device for ninety days; $cookie is the realm's session cookie. */
    public static function deviceCookie(string $token, string $path, string $cookie = self::COOKIE): string
    {
        return $cookie . '-device=' . $token . '; Max-Age=' . Auth::DEVICE_TTL . '; ' . self::attributes($path);
    }

    /** The Set-Cookie value that removes the trusted-device cookie. */
    public static function expireDeviceCookie(string $path, string $cookie = self::COOKIE): string
    {
        return $cookie . '-device=; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; ' . self::attributes($path);
    }

    /** The trusted-device token the request carries, if any. */
    public static function deviceToken(Request $r, string $cookie = self::COOKIE): ?string
    {
        $v = $r->cookies[$cookie . '-device'] ?? null;
        return is_string($v) && $v !== '' ? $v : null;
    }

    private function hashOf(Request $r): ?string
    {
        $id = $this->idOf($r);
        return $id === null ? null : hash('sha256', $id);
    }

    private function idOf(Request $r): ?string
    {
        $id = $r->cookies[$this->realm->cookie] ?? null;
        return is_string($id) && $id !== '' ? $id : null;
    }

    private function studio(): bool
    {
        return $this->realm->name === 'studio';
    }

    /** True while the session is inside both limits; does not refresh it. */
    private function live(string $id): bool
    {
        $now = $this->clock->now();
        $st = $this->db->prepare("SELECT 1 FROM {$this->t}sessions WHERE id_hash = ? AND seen_at > ? AND created_at > ?");
        $st->execute([hash('sha256', $id), $now - self::IDLE, $now - self::MAX]);
        return $st->fetchColumn() !== false;
    }
}
