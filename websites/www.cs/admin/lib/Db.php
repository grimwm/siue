<?php
// The admin database: a private SQLite file in a directory only PHP may enter.
declare(strict_types=1);

namespace Admin;

// bootstrap.php loads the kit's StoreDir and StoreModes before this file.

/** The storage directory cannot be trusted (someone else's, a link, open to others). */
final class StorageUnavailable extends \RuntimeException
{
}

final class Db
{
    public const FILE = 'admin.sqlite';

    private const SCHEMA = [
        'CREATE TABLE IF NOT EXISTS links (token_hash TEXT PRIMARY KEY, email TEXT NOT NULL, created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL, used_at INTEGER, browser_hash TEXT)',
        'CREATE TABLE IF NOT EXISTS link_requests (id INTEGER PRIMARY KEY, ip TEXT NOT NULL, email TEXT NOT NULL, at INTEGER NOT NULL)',
        'CREATE TABLE IF NOT EXISTS devices (token_hash TEXT PRIMARY KEY, created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL)',
        'CREATE TABLE IF NOT EXISTS sessions (id_hash TEXT PRIMARY KEY, created_at INTEGER NOT NULL, seen_at INTEGER NOT NULL, ip TEXT NOT NULL, agent TEXT NOT NULL, csrf_nonce TEXT)',
        'CREATE TABLE IF NOT EXISTS probes (name TEXT PRIMARY KEY, ok INTEGER NOT NULL, at INTEGER NOT NULL)',
        'CREATE TABLE IF NOT EXISTS keys (id INTEGER PRIMARY KEY, label TEXT NOT NULL, key_hash TEXT NOT NULL UNIQUE, scopes TEXT NOT NULL, created_at INTEGER NOT NULL, last_used_at INTEGER, revoked_at INTEGER)',
        'CREATE TABLE IF NOT EXISTS key_hits (key_id INTEGER NOT NULL, at INTEGER NOT NULL)',
        'CREATE TABLE IF NOT EXISTS migrations (name TEXT PRIMARY KEY, at INTEGER NOT NULL)',
        'CREATE TABLE IF NOT EXISTS accounts (id INTEGER PRIMARY KEY, email TEXT NOT NULL UNIQUE, created_at INTEGER NOT NULL, last_sign_in_at INTEGER)',
        // The studio realm's sign-in tables (Realm::studio): the admin ones' shape, each device and session for one account.
        'CREATE TABLE IF NOT EXISTS studio_links (token_hash TEXT PRIMARY KEY, email TEXT NOT NULL, created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL, used_at INTEGER, browser_hash TEXT)',
        'CREATE TABLE IF NOT EXISTS studio_link_requests (id INTEGER PRIMARY KEY, ip TEXT NOT NULL, email TEXT NOT NULL, at INTEGER NOT NULL)',
        'CREATE TABLE IF NOT EXISTS studio_devices (token_hash TEXT PRIMARY KEY, account_id INTEGER NOT NULL, created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL)',
        'CREATE TABLE IF NOT EXISTS studio_sessions (id_hash TEXT PRIMARY KEY, account_id INTEGER NOT NULL, created_at INTEGER NOT NULL, seen_at INTEGER NOT NULL, ip TEXT NOT NULL, agent TEXT NOT NULL, csrf_nonce TEXT)',
        'CREATE INDEX IF NOT EXISTS link_requests_at ON link_requests(at)',
        'CREATE INDEX IF NOT EXISTS link_requests_ip_at ON link_requests(ip, at)',
        'CREATE INDEX IF NOT EXISTS studio_link_requests_at ON studio_link_requests(at)',
        'CREATE INDEX IF NOT EXISTS studio_link_requests_ip_at ON studio_link_requests(ip, at)',
        'CREATE INDEX IF NOT EXISTS studio_links_email ON studio_links(email, created_at)',
        'CREATE INDEX IF NOT EXISTS studio_sessions_account ON studio_sessions(account_id)',
        'CREATE INDEX IF NOT EXISTS studio_devices_account ON studio_devices(account_id)',
        'CREATE INDEX IF NOT EXISTS key_hits_key_at ON key_hits(key_id, at)',
    ];

    private static function store(): \Kit\StoreDir
    {
        return new \Kit\StoreDir('admin storage:', StorageUnavailable::class);
    }

    /**
     * Where the admin files live. ADMIN_DATA_DIR is used exactly (created and
     * claimed private, refused when it is a link or not ours); unset, admin/data/
     * when PHP can write it (on the host the deploy makes it group-writable for PHP's
     * user, which owns the files PHP puts there), else /var/tmp/<username>-admin/,
     * which the host wipes whenever php-fpm restarts.
     */
    public static function dataDir(): string
    {
        $set = trim((string) getenv('ADMIN_DATA_DIR'));
        if ($set !== '') {
            return self::store()->claim(rtrim($set, '/'), true);
        }
        return self::store()->pick(__DIR__ . '/../data', '/var/tmp/' . \Kit\StoreDir::username() . '-admin');
    }

    /**
     * "site" when $dir is the admin/data folder inside the site (or $siteDir), else "fallback":
     * a place the host may wipe, or a configured one.
     */
    public static function storeKind(string $dir, ?string $siteDir = null): string
    {
        $site = realpath($siteDir ?? __DIR__ . '/../data');
        $here = realpath($dir);
        return $site !== false && $here !== false && $site === $here ? 'site' : 'fallback';
    }

    /** Opens (creating it private when missing) the database in $dir and makes sure the schema exists. */
    public static function open(string $dir): \PDO
    {
        $path = $dir . '/' . self::FILE;
        if (is_link($path)) {
            self::store()->refuse($path, 'is a symbolic link', 'remove it');
        }
        // The host's umask (0022) would make the database and its -wal/-shm side
        // files readable by everyone; create them private instead.
        $old = umask(0077);
        try {
            $db = new \PDO('sqlite:' . $path, null, null, [\PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION]);
            $db->exec('PRAGMA busy_timeout = 5000');
            $db->exec('PRAGMA secure_delete = ON');
            $db->exec('PRAGMA journal_mode = WAL');
            $db->exec('PRAGMA foreign_keys = ON');
            foreach (self::SCHEMA as $sql) {
                $db->exec($sql);
            }
            // A database made before a column existed gets it added; CREATE TABLE IF NOT EXISTS leaves it alone.
            $have = array_column($db->query('PRAGMA table_info(links)')->fetchAll(\PDO::FETCH_ASSOC), 'name');
            if (!in_array('browser_hash', $have, true)) {
                $db->exec('ALTER TABLE links ADD COLUMN browser_hash TEXT');
            }
            self::once($db, 'keys-drafts-delete', [self::class, 'grantDraftsDelete']);
        } finally {
            umask($old);
        }
        foreach ([$path, $path . '-wal', $path . '-shm'] as $f) {
            if (is_file($f)) {
                @chmod($f, \Kit\StoreModes::modes()['file']);
            }
        }
        return $db;
    }

    /**
     * Runs a one-time step and records its name in `migrations`, in one transaction, so it never runs again on
     * this database (a new database records it with nothing to change). When anything throws after the step
     * began and the transaction is still held, $undo runs before the ROLLBACK, for work outside the database
     * (files) that the ROLLBACK cannot reverse.
     *
     * @param callable(\PDO): void $step
     * @param (callable(\PDO): void)|null $undo
     */
    public static function once(\PDO $db, string $name, callable $step, ?callable $undo = null): void
    {
        $done = $db->prepare('SELECT 1 FROM migrations WHERE name = ?');
        $done->execute([$name]);
        if ($done->fetchColumn() !== false) {
            return;
        }
        $db->exec('BEGIN IMMEDIATE');
        $began = false;
        try {
            $done->execute([$name]);
            if ($done->fetchColumn() === false) {
                $began = true;
                $step($db);
                $db->prepare('INSERT INTO migrations (name, at) VALUES (?, ?)')->execute([$name, time()]);
            }
            $db->exec('COMMIT');
        } catch (\Throwable $e) {
            if ($db->inTransaction()) {
                try {
                    if ($began && $undo !== null) {
                        $undo($db);
                    }
                } finally {
                    $db->exec('ROLLBACK');
                }
            }
            throw $e;
        }
    }

    /**
     * A key that publishes drafts may also delete them: every active key holding drafts:publish gains
     * drafts:delete in place, keeping its secret, label and history. Revoked keys and other keys are left alone,
     * and a key made later carries only the scopes it is made with.
     */
    private static function grantDraftsDelete(\PDO $db): void
    {
        $update = $db->prepare('UPDATE keys SET scopes = ? WHERE id = ?');
        foreach ($db->query('SELECT id, scopes FROM keys WHERE revoked_at IS NULL')->fetchAll(\PDO::FETCH_ASSOC) as $row) {
            $scopes = json_decode((string) $row['scopes'], true);
            if (is_array($scopes) && in_array('drafts:publish', $scopes, true) && !in_array('drafts:delete', $scopes, true)) {
                $scopes[] = 'drafts:delete';
                $update->execute([json_encode(array_values($scopes), JSON_THROW_ON_ERROR), (int) $row['id']]);
            }
        }
    }
}
