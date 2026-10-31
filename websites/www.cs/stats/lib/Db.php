<?php
// The statistics database: stats.sqlite beside admin.sqlite, private like it, in WAL mode.
declare(strict_types=1);

namespace Stats;

final class Db
{
    public const FILE = 'stats.sqlite';

    private const SCHEMA = [
        // Raw rows, kept Days::KEEP days. who is the visitor ID when the browser keeps one, else 'd' + the daily hash.
        'CREATE TABLE IF NOT EXISTS hits (id INTEGER PRIMARY KEY, at INTEGER NOT NULL, day TEXT NOT NULL, hour INTEGER NOT NULL, page TEXT NOT NULL, kind TEXT NOT NULL, name TEXT, prop TEXT, pv TEXT, sid TEXT NOT NULL, vid TEXT, dhash TEXT NOT NULL, who TEXT NOT NULL, ref TEXT, device TEXT, secs INTEGER NOT NULL DEFAULT 0)',
        'CREATE UNIQUE INDEX IF NOT EXISTS hits_pv ON hits(pv) WHERE pv IS NOT NULL',
        'CREATE INDEX IF NOT EXISTS hits_day_page ON hits(day, page)',
        'CREATE INDEX IF NOT EXISTS hits_vid_day ON hits(vid, day)',
        // Each visitor ID's first and last day, per page and across the site ('*').
        'CREATE TABLE IF NOT EXISTS visitors (vid TEXT NOT NULL, page TEXT NOT NULL, first_day TEXT NOT NULL, last_day TEXT NOT NULL, PRIMARY KEY (vid, page))',
        'CREATE INDEX IF NOT EXISTS visitors_first ON visitors(page, first_day)',
        // The daily salt: only today's row exists.
        'CREATE TABLE IF NOT EXISTS salts (day TEXT PRIMARY KEY, salt BLOB NOT NULL)',
        // Writes per minute, per client (hashed) and overall.
        'CREATE TABLE IF NOT EXISTS rate (bucket TEXT PRIMARY KEY, minute INTEGER NOT NULL, n INTEGER NOT NULL)',
        'CREATE INDEX IF NOT EXISTS rate_minute ON rate(minute)',
        // Aggregates, kept forever: one value per day, page (or '*') and metric.
        'CREATE TABLE IF NOT EXISTS daily (day TEXT NOT NULL, page TEXT NOT NULL, metric TEXT NOT NULL, value REAL NOT NULL, PRIMARY KEY (day, page, metric))',
        // Return rates of each day's new visitors, kept forever once a week has passed.
        'CREATE TABLE IF NOT EXISTS cohorts (day TEXT NOT NULL, page TEXT NOT NULL, size INTEGER NOT NULL, d1 INTEGER NOT NULL, d7 INTEGER NOT NULL, PRIMARY KEY (day, page))',
        'CREATE TABLE IF NOT EXISTS meta (k TEXT PRIMARY KEY, v TEXT NOT NULL)',
    ];

    /** Opens (creating it private when missing) the database in $dir, the admin data folder. */
    public static function open(string $dir): \PDO
    {
        $path = $dir . '/' . self::FILE;
        if (is_link($path)) {
            throw new \Admin\StorageUnavailable($path . ' is a symbolic link');
        }
        $old = umask(0077);
        try {
            $db = new \PDO('sqlite:' . $path, null, null, [\PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION]);
            $db->exec('PRAGMA busy_timeout = 5000');
            $db->exec('PRAGMA journal_mode = WAL');
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

    /** Runs $work inside BEGIN IMMEDIATE ... COMMIT, rolling back when it throws. */
    public static function write(\PDO $db, callable $work): mixed
    {
        $db->exec('BEGIN IMMEDIATE');
        try {
            $out = $work();
            $db->exec('COMMIT');
            return $out;
        } catch (\Throwable $e) {
            if ($db->inTransaction()) {
                $db->exec('ROLLBACK');
            }
            throw $e;
        }
    }
}
