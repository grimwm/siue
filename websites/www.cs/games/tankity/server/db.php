<?php
// games/tankity/server/db.php
// Where Tankity keeps its files and its one SQLite database there: the
// directory (data/ when PHP can write it, else /var/tmp/<username>-tankity),
// the journal mode its filesystem allows, the schema steps, and transactions.
// Loaded by rooms.php and scores.php; it serves nothing.
declare(strict_types=1);
if (count(get_included_files()) === 1) {
    http_response_code(404);
    exit;
}
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/score-guard.php';

const TANKITY_DB_FILE = 'tankity.sqlite';
const TANKITY_BUSY_MS = 2000; // a writer that waits longer answers "busy" instead of tying up a PHP worker
// Filesystems whose locks and shared memory WAL can trust. Anything else,
// including a mount table PHP cannot read, gets the DELETE journal.
const TANKITY_LOCAL_FS = ['ext2', 'ext3', 'ext4', 'xfs', 'btrfs', 'zfs', 'f2fs', 'jfs', 'reiserfs', 'bcachefs', 'tmpfs', 'overlay', 'apfs', 'hfs'];
const TANKITY_DENY = "# Tankity's database: PHP reads it, browsers may not.\nRequire all denied\n";

/* The storage directory cannot be trusted (someone else's, a link, open to
   others). Callers answer 503; the cause is already in the log. */
final class TankityStorageRefused extends RuntimeException
{
}

/* Logs one line naming the path and the problem, then refuses. */
function tankity_refuse(string $dir, string $problem, string $remedy = 'remove it, or set data_dir'): never
{
    error_log("tankity storage: $dir $problem; $remedy");
    throw new TankityStorageRefused("$dir $problem");
}

/* The mode for a directory ('dir') or file ('file') Tankity's PHP creates.
   Kit\StoreModes decides for every game; README "Storage" says who else can
   reach them on a host where PHP runs as a shared user. */
function tankity_mode(string $kind): int
{
    return \Kit\StoreModes::modes()[$kind];
}

/* The account the site belongs to: the owner of the running script, the same
   in every PHP-FPM worker and pool; uid<N> when the name cannot be looked up. */
function tankity_username(): string
{
    $name = strtolower((string) preg_replace('/[^A-Za-z0-9_-]+/', '', get_current_user()));
    return $name !== '' ? substr($name, 0, 32) : 'uid' . getmyuid();
}

/* PHP's own effective uid: who must own a directory on a shared /var/tmp. */
function tankity_euid(): int
{
    return function_exists('posix_geteuid') ? posix_geteuid() : getmyuid();
}

/* Creates $dir (0700) unless it exists, then checks it is a real directory PHP
   can write. $private also requires that PHP owns it and nobody else may
   enter: /var/tmp is shared, so a directory another account made is refused. */
function tankity_claim_dir(string $dir, bool $private): string
{
    // mkdir is the atomic step: if the name is taken, whatever holds it is
    // verified below, never adopted.
    if (!file_exists($dir) && !is_link($dir)) {
        if (!@mkdir($dir, tankity_mode('dir'), true) && !file_exists($dir) && !is_link($dir)) {
            tankity_refuse($dir, 'cannot be created', 'fix its parent directory, or set data_dir');
        }
    }
    clearstatcache(true, $dir);
    $st = @lstat($dir); // lstat: a link is reported as a link, not followed
    if ($st === false) {
        tankity_refuse($dir, 'is not a writable directory', 'fix its permissions, or set data_dir');
    }
    $isLink = ($st['mode'] & 0170000) === 0120000;
    if ($isLink && !$private) {
        tankity_refuse($dir, 'is a symbolic link, not a writable directory', 'point data_dir at the directory itself');
    }
    if ($private) {
        // Ownership comes before writability: a directory someone else made is
        // not writable to us, and that squat must be refused and logged, not
        // reported as a plain permissions problem.
        if ($isLink) {
            tankity_refuse($dir, 'is a symbolic link');
        }
        if (($st['mode'] & 0170000) !== 0040000) {
            tankity_refuse($dir, 'is not a directory');
        }
        if ($st['uid'] !== tankity_euid()) {
            tankity_refuse($dir, 'belongs to another account');
        }
        if (($st['mode'] & 0777) !== tankity_mode('dir')) {
            tankity_refuse($dir, sprintf('has mode %04o, not %04o', $st['mode'] & 0777, tankity_mode('dir')));
        }
    }
    if (($st['mode'] & 0170000) !== 0040000 || !is_writable($dir)) {
        tankity_refuse($dir, 'is not a writable directory', 'fix its permissions, or set data_dir');
    }
    return $dir;
}

/* The deny file Apache reads in a storage directory under the web root; true
   once it is in place. */
function tankity_deny_http(string $dir): bool
{
    $f = $dir . '/.htaccess';
    if (is_file($f) && str_contains((string) @file_get_contents($f), 'Require all denied')) {
        return true;
    }
    if (@file_put_contents($f, TANKITY_DENY) === false) {
        return false;
    }
    @chmod($f, tankity_mode('file'));
    return true;
}

/* $preferred when PHP can write it (or create it there) and its deny file is
   in place; otherwise the private $fallback. $writable is the tests' seam. */
function tankity_pick_dir(string $preferred, string $fallback, ?Closure $writable = null): string
{
    $writable ??= fn(string $p): bool => is_writable($p);
    if (is_dir($preferred) && !is_link($preferred)) {
        // A checkout or deploy may have made it 0755; PHP's own directory is private.
        if (fileowner($preferred) === tankity_euid() && (fileperms($preferred) & 0077) !== 0) {
            @chmod($preferred, tankity_mode('dir'));
        }
        $usable = $writable($preferred);
    } else {
        // A request that lost the mkdir race uses the directory the winner made.
        $usable = !file_exists($preferred) && $writable(dirname($preferred))
            && (@mkdir($preferred, tankity_mode('dir')) || (is_dir($preferred) && !is_link($preferred)));
        if ($usable) {
            @chmod($preferred, tankity_mode('dir'));
        }
    }
    if ($usable && tankity_deny_http($preferred)) {
        return $preferred;
    }
    return tankity_claim_dir($fallback, true);
}

/* Where Tankity keeps its files. A data_dir setting (TANKITY_DATA_DIR, or
   .config.yaml) is used exactly: created 0700 when missing, and an error when
   it cannot be written, never a silent move elsewhere. Unset: games/tankity/data/
   when PHP can write it, else /var/tmp/<username>-tankity/. */
function tankity_data_dir(): string
{
    $set = trim((string) tankity_setting('TANKITY_DATA_DIR', 'data_dir', ''));
    // A refusal is remembered for the request: it was logged once, and the
    // endpoint, housekeeping and the score code all ask again.
    static $refused = [];
    static $claimed = [];
    static $picked = null;
    if (isset($refused[$set])) {
        throw $refused[$set];
    }
    try {
        if ($set !== '') {
            return $claimed[$set] ??= tankity_claim_dir(rtrim($set, '/'), false);
        }
        return $picked ??= tankity_pick_dir(dirname(__DIR__) . '/data', '/var/tmp/' . tankity_username() . '-tankity');
    } catch (TankityStorageRefused $e) {
        $refused[$set] = $e;
        throw $e;
    }
}

/* The filesystem type holding $path: the longest mount point in the mount
   table that contains it. Null when the table cannot be read. */
function tankity_fs_type(string $path, ?string $mounts = null): ?string
{
    $mounts ??= @file_get_contents('/proc/self/mounts');
    if (!is_string($mounts) || $mounts === '') {
        return null;
    }
    $real = realpath($path) ?: $path;
    $type = null;
    $len = -1;
    foreach (explode("\n", $mounts) as $line) {
        $f = preg_split('/\s+/', trim($line));
        if (!is_array($f) || count($f) < 3) {
            continue;
        }
        // The kernel writes a space in a mount point as \040.
        $mp = str_replace(['\\040', '\\011', '\\012', '\\134'], [' ', "\t", "\n", '\\'], $f[1]);
        $inside = $mp === '/' || $real === $mp || str_starts_with($real, rtrim($mp, '/') . '/');
        if ($inside && strlen($mp) > $len) {
            $len = strlen($mp);
            $type = $f[2];
        }
    }
    return $type;
}

/* WAL only on a local filesystem; DELETE on anything else or unknown. */
function tankity_journal_mode(string $dir, ?string $mounts = null): string
{
    $set = strtolower(trim((string) tankity_setting('TANKITY_JOURNAL', 'journal_mode', '')));
    if ($set === 'wal' || $set === 'delete') {
        return $set;
    }
    return in_array(tankity_fs_type($dir, $mounts), TANKITY_LOCAL_FS, true) ? 'wal' : 'delete';
}

/* The schema, one step per version. A database at version N runs the steps
   after N, each in its own transaction. Step 2 is the boards; step 3 remembers the old score files already
   imported, so a file that outlives its import is never filed twice; step 4 tells
   a row the server filed from a match from a browser's own claim. */
function tankity_schema_steps(): array
{
    return [
        1 => [
            'CREATE TABLE meta (k TEXT PRIMARY KEY, v TEXT NOT NULL)',
            'CREATE TABLE rooms (code TEXT PRIMARY KEY, data BLOB NOT NULL, created INTEGER NOT NULL, touched INTEGER NOT NULL)',
            'CREATE INDEX rooms_touched ON rooms (touched)',
            'CREATE TABLE callsigns (slug TEXT PRIMARY KEY, data TEXT NOT NULL)',
        ],
        2 => [
            'CREATE TABLE board (id INTEGER PRIMARY KEY AUTOINCREMENT, difficulty TEXT NOT NULL, initials TEXT NOT NULL,
                score INTEGER NOT NULL, rounds INTEGER NOT NULL, seed TEXT NOT NULL, at TEXT NOT NULL)',
            'CREATE INDEX board_rank ON board (difficulty, score DESC, id)',
        ],
        3 => [
            'CREATE TABLE legacy_imported (name TEXT NOT NULL, hash TEXT NOT NULL, at TEXT NOT NULL, PRIMARY KEY (name, hash))',
        ],
        4 => [
            // 'room' rows are filed by the server from a match; 'client' rows are a browser's own claim.
            "ALTER TABLE board ADD COLUMN source TEXT NOT NULL DEFAULT 'room'",
            // Before this column only room filing (seed 'room:CODE') and the legacy conversion (a browser's claim) wrote rows.
            "UPDATE board SET source = 'client' WHERE seed NOT LIKE 'room:%'",
        ],
    ];
}

function tankity_schema(PDO $db): void
{
    $have = (int) $db->query('PRAGMA user_version')->fetchColumn();
    foreach (tankity_schema_steps() as $version => $sql) {
        if ($version <= $have) {
            continue;
        }
        tankity_tx($db, function (PDO $db) use ($version, $sql): void {
            // Another request may have run this step while this one waited for the lock.
            if ((int) $db->query('PRAGMA user_version')->fetchColumn() >= $version) {
                return;
            }
            foreach ($sql as $q) {
                $db->exec($q);
            }
            $db->exec('PRAGMA user_version = ' . $version);
        });
    }
}

/* The database and any journal or WAL files beside it are private. */
function tankity_private_files(string $path): void
{
    foreach (['', '-wal', '-shm', '-journal'] as $suffix) {
        if (is_file($path . $suffix)) {
            @chmod($path . $suffix, tankity_mode('file'));
        }
    }
}

/* The database in the storage directory, opened once per request. */
function tankity_db(): PDO
{
    static $open = [];
    $dir = tankity_data_dir();
    if (isset($open[$dir])) {
        return $open[$dir];
    }
    $path = $dir . '/' . TANKITY_DB_FILE;
    if (is_link($path)) {
        tankity_refuse($path, 'is a symbolic link');
    }
    // The host's umask (0022) would make the database and its -wal/-shm side
    // files readable by everyone; create them private instead.
    $old = umask(0077);
    try {
        $db = new PDO('sqlite:' . $path, null, null, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
        $db->exec('PRAGMA busy_timeout = ' . TANKITY_BUSY_MS);
        $mode = tankity_journal_mode($dir);
        $db->query('PRAGMA journal_mode = ' . $mode)->fetchColumn();
        $db->exec('PRAGMA synchronous = ' . ($mode === 'wal' ? 'NORMAL' : 'FULL'));
        tankity_schema($db);
        tankity_private_files($path);
    } finally {
        umask($old);
    }
    return $open[$dir] = $db;
}

/* Open write transactions per connection. A tankity_tx inside one (a score
   filed while a room is held) joins it, and the outer commit covers both. */
function tankity_depth(PDO $db, int $delta = 0): int
{
    static $depth = [];
    $id = spl_object_id($db);
    $depth[$id] = max(0, ($depth[$id] ?? 0) + $delta);
    return $depth[$id];
}

/* Runs $fn as one writer (BEGIN IMMEDIATE, waiting at most the busy timeout);
   rolls back and rethrows when $fn throws. */
function tankity_tx(PDO $db, callable $fn): mixed
{
    if (tankity_depth($db) > 0) {
        // Nested: a savepoint, so a throw the caller catches takes this part's
        // writes back and leaves the outer transaction's own intact.
        static $n = 0;
        $sp = 'tankity_sp' . ++$n;
        $db->exec("SAVEPOINT $sp");
        try {
            $out = $fn($db);
        } catch (Throwable $e) {
            $db->exec("ROLLBACK TO $sp");
            $db->exec("RELEASE $sp");
            throw $e;
        }
        $db->exec("RELEASE $sp");
        return $out;
    }
    $db->exec('BEGIN IMMEDIATE');
    tankity_depth($db, 1);
    try {
        $out = $fn($db);
        $db->exec('COMMIT');
        return $out;
    } catch (Throwable $e) {
        try {
            $db->exec('ROLLBACK');
        } catch (PDOException) {
            // SQLite already rolled the transaction back.
        }
        throw $e;
    } finally {
        tankity_depth($db, -1);
    }
}

/* SQLITE_BUSY or SQLITE_LOCKED: the wait for the writer ahead ran out. */
function tankity_busy(Throwable $e): bool
{
    return $e instanceof PDOException && in_array((int) ($e->errorInfo[1] ?? 0), [5, 6], true);
}
