<?php
// games/tankity/server/legacy.php
// The per-callsign score runs: the callsigns table (one row per callsign, in
// the shape the old files had), what scores.php and the rooms file into it,
// and the one-time import of the old <scores_dir>/<callsign>-operation-tankity.json
// files. Loaded by rooms.php and scores.php; it serves nothing.
declare(strict_types=1);
if (count(get_included_files()) === 1) {
    http_response_code(404);
    exit;
}
require_once __DIR__ . '/db.php';

const LEGACY_SLUG = 'operation-tankity';
const LEGACY_RUNS_KEPT = 50;
const LEGACY_IMPORT_BATCH = 200; // old files per housekeeping pass
const LEGACY_FILE_MAX = 4194304; // a callsign file is a few KB; anything bigger is not one
const LEGACY_TMP_AGE = 3600; // a temp file this old was left by a writer that died

/* Where the old files are: a scores_dir setting left from before data_dir
   (it is retired, and read only to find them), else /var/tmp. */
function legacy_dir(): string
{
    $d = trim((string) tankity_setting('TANKITY_SCORES_DIR', 'scores_dir', ''));
    return $d !== '' ? rtrim($d, '/') : '/var/tmp';
}

function legacy_slug(string $name): string
{
    $s = strtolower(trim($name));
    $s = (string) preg_replace('/[^a-z0-9_-]+/', '-', $s);
    $s = trim($s, '-');
    return substr($s === '' ? 'anonymous' : $s, 0, 32);
}

/* A callsign's record: name, runs (oldest first) and best. */
function legacy_read(PDO $db, string $slug): array
{
    $q = $db->prepare('SELECT data FROM callsigns WHERE slug = ?');
    $q->execute([$slug]);
    $d = json_decode((string) $q->fetchColumn(), true);
    return is_array($d) && is_array($d['runs'] ?? null) ? $d : ['name' => $slug, 'runs' => [], 'best' => 0];
}

function legacy_write(PDO $db, string $slug, array $data): void
{
    $best = 0;
    foreach ($data['runs'] as $r) {
        $best = max($best, (int) ($r['score'] ?? 0));
    }
    $row = ['name' => $slug, 'runs' => array_values($data['runs']), 'best' => $best];
    $db->prepare('INSERT OR REPLACE INTO callsigns (slug, data) VALUES (?, ?)')->execute([$slug, json_encode($row, JSON_UNESCAPED_SLASHES)]);
}

/* Appends one run to a callsign, keeping its last LEGACY_RUNS_KEPT; answers the new best. */
function legacy_add_run(string $slug, array $run): int
{
    return tankity_tx(tankity_db(), function (PDO $db) use ($slug, $run): int {
        $d = legacy_read($db, $slug);
        $d['runs'][] = $run;
        $d['runs'] = array_slice($d['runs'], -LEGACY_RUNS_KEPT);
        legacy_write($db, $slug, $d);
        return legacy_read($db, $slug)['best'];
    });
}

/* Each callsign's best and its latest run, best first. */
function legacy_top(int $n): array
{
    $rows = [];
    foreach (tankity_db()->query('SELECT slug, data FROM callsigns') as $r) {
        $d = json_decode((string) $r['data'], true);
        if (!is_array($d) || empty($d['runs'])) {
            continue;
        }
        $last = end($d['runs']);
        $rows[] = ['name' => (string) $r['slug'], 'best' => (int) ($d['best'] ?? 0), 'banked' => (int) ($last['banked'] ?? 0),
            'won' => (bool) ($last['won'] ?? false), 'ts' => (string) ($last['ts'] ?? '')];
    }
    usort($rows, fn($a, $b) => $b['best'] <=> $a['best']);
    return array_slice($rows, 0, $n);
}

/* What makes two runs the same run, so an import that runs twice adds nothing twice. */
function legacy_run_key(array $r): string
{
    return (string) json_encode([(int) ($r['score'] ?? 0), (int) ($r['banked'] ?? 0), (bool) ($r['won'] ?? false),
        (string) ($r['seed'] ?? ''), (string) ($r['ts'] ?? '')]);
}

/* Imports up to $limit old files: each file's runs merge into its callsign's
   row (every run kept, none twice), and the file is deleted only after that
   commit, and only if it is byte for byte what was read. A file it skips
   is logged with the reason and left for a person. Temp files a dead writer left go too. $afterCommit is
   the tests' seam between the commit and the delete. Answers [imported, deleted]. */
function legacy_import(?string $dir = null, int $limit = LEGACY_IMPORT_BATCH, ?int $now = null, ?Closure $afterCommit = null): array
{
    $dir ??= legacy_dir();
    $now ??= time();
    $imported = 0;
    $deleted = 0;
    $paths = glob($dir . '/*-' . LEGACY_SLUG . '.json') ?: [];
    sort($paths);
    foreach (array_slice($paths, 0, $limit) as $path) {
        // /var/tmp is shared: only a plain file this account owns is ours to read and delete.
        $st = @lstat($path);
        $why = match (true) {
            $st === false => 'cannot be read',
            ($st['mode'] & 0170000) !== 0100000 => 'is not a plain file',
            $st['uid'] !== tankity_euid() => 'belongs to another account',
            $st['size'] > LEGACY_FILE_MAX => 'is too big to be a score file',
            default => null,
        };
        $raw = $why === null ? @file_get_contents($path) : false;
        $data = is_string($raw) ? json_decode($raw, true) : null;
        if ($why === null && !is_array($data)) {
            $why = is_string($raw) ? 'is not valid JSON' : 'cannot be read';
        } elseif ($why === null && !is_array($data['runs'] ?? null)) {
            $why = 'has no runs list';
        }
        if ($why !== null) {
            error_log("tankity legacy import: $path $why; left in place");
            continue;
        }
        $slug = legacy_slug(basename($path, '-' . LEGACY_SLUG . '.json'));
        $runs = $data['runs'];
        $name = basename($path);
        $hash = sha1((string) $raw);
        tankity_tx(tankity_db(), function (PDO $db) use ($slug, $runs, $name, $hash): void {
            // Converting a callsign deletes its row, so the row can no longer tell
            // that this file was imported; this record does.
            $done = $db->prepare('SELECT 1 FROM legacy_imported WHERE name = ? AND hash = ?');
            $done->execute([$name, $hash]);
            if ($done->fetchColumn() !== false) {
                return;
            }
            $db->prepare('INSERT INTO legacy_imported (name, hash, at) VALUES (?, ?, ?)')->execute([$name, $hash, gmdate('c')]);
            $d = legacy_read($db, $slug);
            // Counts, not a set: two genuinely identical runs in a file are both kept,
            // and an import that runs twice still adds nothing the second time.
            $have = array_count_values(array_map('legacy_run_key', $d['runs']));
            $seen = [];
            foreach ($runs as $r) {
                if (!is_array($r) || !isset($r['score'])) {
                    continue;
                }
                $k = legacy_run_key($r);
                $seen[$k] = ($seen[$k] ?? 0) + 1;
                if ($seen[$k] > ($have[$k] ?? 0)) {
                    $d['runs'][] = $r;
                }
            }
            usort($d['runs'], fn($a, $b) => strcmp((string) ($a['ts'] ?? ''), (string) ($b['ts'] ?? '')));
            legacy_write($db, $slug, $d);
        });
        $imported++;
        if ($afterCommit !== null) {
            $afterCommit();
        }
        clearstatcache(true, $path);
        if (@file_get_contents($path) === $raw && @unlink($path)) {
            $deleted++;
        }
    }
    foreach (array_slice(glob($dir . '/*-' . LEGACY_SLUG . '.json.tmp.*') ?: [], 0, $limit) as $tmp) {
        if ($now - (int) @filemtime($tmp) > LEGACY_TMP_AGE && @unlink($tmp)) {
            $deleted++;
        }
    }
    return [$imported, $deleted];
}
