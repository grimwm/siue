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
        'CREATE TABLE IF NOT EXISTS links (token_hash TEXT PRIMARY KEY, email TEXT NOT NULL, created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL, used_at INTEGER)',
        'CREATE TABLE IF NOT EXISTS link_requests (id INTEGER PRIMARY KEY, ip TEXT NOT NULL, email TEXT NOT NULL, at INTEGER NOT NULL)',
        'CREATE TABLE IF NOT EXISTS sessions (id_hash TEXT PRIMARY KEY, created_at INTEGER NOT NULL, seen_at INTEGER NOT NULL, ip TEXT NOT NULL, agent TEXT NOT NULL)',
        'CREATE TABLE IF NOT EXISTS keys (id INTEGER PRIMARY KEY, label TEXT NOT NULL, key_hash TEXT NOT NULL UNIQUE, scopes TEXT NOT NULL, created_at INTEGER NOT NULL, last_used_at INTEGER, revoked_at INTEGER)',
        'CREATE TABLE IF NOT EXISTS key_hits (key_id INTEGER NOT NULL, at INTEGER NOT NULL)',
        'CREATE INDEX IF NOT EXISTS link_requests_at ON link_requests(at)',
        'CREATE INDEX IF NOT EXISTS key_hits_key_at ON key_hits(key_id, at)',
    ];

    private static function store(): \Kit\StoreDir
    {
        return new \Kit\StoreDir('admin storage:', StorageUnavailable::class);
    }

    /**
     * Where the admin files live. ADMIN_DATA_DIR is used exactly (created and
     * claimed private, refused when it is a link or not ours); unset, admin/data/
     * when PHP can write it, else /var/tmp/<username>-admin/.
     */
    public static function dataDir(): string
    {
        $set = trim((string) getenv('ADMIN_DATA_DIR'));
        if ($set !== '') {
            return self::store()->claim(rtrim($set, '/'), true);
        }
        return self::store()->pick(__DIR__ . '/../data', '/var/tmp/' . \Kit\StoreDir::username() . '-admin');
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
}
