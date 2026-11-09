<?php
/**
 * The Island of Crete: loads a backup (tools/backup-bank.ts) into the shared bank on its own host, from the command
 * line only, with no HTTP and no rate limit: what `make crete-bank-restore` does over HTTPS, without its share of
 * 600 trusted posts an hour. Copy the backup folder to the host, then run this with the host's PHP:
 *
 *   php bank/import-backup.php <backup dir> [--difficulties easy,medium,hard] [--dry-run]
 *
 * It checks each grade's file against the backup's manifest (its SHA-256), then hands each of the backup's served
 * levels to the bank exactly as trusted-add does (Bank::addVerified: every check, never `replace`), into the folder
 * the bank uses (bank/place.json's, by bank/Place.php's rule, which refuses as the endpoint does). A level the bank
 * holds or has retired stays out, as does one the backup keeps without a tuple; a full grade keeps what it serves.
 * Levels that were waiting are never loaded: they were not verified. --dry-run checks the backup and says where the
 * bank is, and loads nothing.
 *
 * Exits 0 when it went through the backup, 1 when the bank refused or failed, 2 on a bad backup or bad options. From
 * the web it is a 404 (and bank/.htaccess denies the folder).
 */
declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

const CRETE_BANK_LIBRARY = true;
require_once dirname(__DIR__) . '/endless-bank.php';

use Crete\Bank;
use Crete\Refusal;

/** Prints one line to stderr and exits with $code. */
function importFail(string $why, int $code): never
{
    fwrite(STDERR, "import-backup: $why\n");
    exit($code);
}

/**
 * The backup's grades, checked against its manifest: grade => its served levels.
 * @param list<string> $grades
 * @return array<string, list<array<string, mixed>>>
 */
function importRead(string $from, array $grades): array
{
    $manifest = json_decode((string) @file_get_contents("$from/manifest.json"), true);
    if (!is_array($manifest)) {
        importFail("$from: no manifest.json that reads as JSON: not a finished backup", 2);
    }
    if (($manifest['format'] ?? null) !== 1 || !is_array($manifest['grades'] ?? null)) {
        importFail("$from: manifest.json is not a backup manifest", 2);
    }
    $out = [];
    foreach ($grades as $g) {
        $e = $manifest['grades'][$g] ?? null;
        if ($e === null) {
            continue;
        }
        // Only the backup's own file for the grade: never a path the manifest names elsewhere.
        if (!is_array($e) || ($e['file'] ?? null) !== "$g.json") {
            importFail("$from: manifest.json names another file for $g than $g.json", 2);
        }
        $raw = @file_get_contents("$from/$g.json");
        if (!is_string($raw)) {
            importFail("$from: $g.json is missing", 2);
        }
        if (!hash_equals((string) ($e['sha256'] ?? ''), hash('sha256', $raw))) {
            importFail("$from: $g.json does not match its SHA-256 in manifest.json", 2);
        }
        $b = json_decode($raw, true);
        if (!is_array($b) || ($b['grade'] ?? null) !== $g || !is_array($b['served'] ?? null) || !array_is_list($b['served'])) {
            importFail("$from: $g.json is not $g's levels", 2);
        }
        $out[$g] = $b['served'];
    }
    return $out;
}

$args = array_slice($argv, 1);
$dryRun = false;
$grades = Bank::GRADES;
$from = null;
for ($i = 0; $i < count($args); $i++) {
    $a = $args[$i];
    if ($a === '--dry-run') {
        $dryRun = true;
    } elseif ($a === '--difficulties') {
        $grades = explode(',', (string) ($args[++$i] ?? ''));
        if ($grades === [] || array_diff($grades, Bank::GRADES) !== []) {
            importFail('--difficulties takes easy, medium and hard, joined by commas', 2);
        }
    } elseif ($from === null && !str_starts_with($a, '--')) {
        $from = rtrim($a, '/');
    } else {
        importFail("usage: php bank/import-backup.php <backup dir> [--difficulties easy,medium,hard] [--dry-run]", 2);
    }
}
if ($from === null || !is_dir($from)) {
    importFail('usage: php bank/import-backup.php <backup dir> [--difficulties easy,medium,hard] [--dry-run]', 2);
}

$backup = importRead($from, array_values(array_intersect(Bank::GRADES, $grades)));
if ($backup === []) {
    importFail("$from: the backup holds none of " . implode(', ', $grades), 2);
}

try {
    if ($dryRun) {
        $where = bankPlace()->report();
        if ($where['refused'] !== null) {
            importFail('the bank refuses to start: ' . $where['refused'], 1);
        }
        echo "import-backup: the bank is in {$where['dir']} ({$where['kind']})\n";
        foreach ($backup as $g => $served) {
            $with = count(array_filter($served, static fn($s): bool => is_array($s) && is_array($s['tuple'] ?? null)));
            echo "import-backup: $g: " . count($served) . " served in the backup, $with with a tuple\n";
        }
        echo "import-backup: dry run: nothing loaded\n";
        exit(0);
    }
    $place = bankPlace()->choose();
    echo "import-backup: the bank is in {$place['dir']} ({$place['kind']})\n";
    $bank = bank();
} catch (Throwable $e) {
    importFail($e->getMessage(), 1);
}

$failed = false;
foreach ($backup as $g => $served) {
    $n = ['added' => 0, 'held' => 0, 'retired' => 0, 'full' => 0, 'withoutTuple' => 0, 'refused' => 0];
    foreach ($served as $s) {
        if (!is_array($s) || !is_array($s['tuple'] ?? null)) {
            $n['withoutTuple']++;
            continue;
        }
        try {
            $bank->addVerified($s['tuple'], $s['made'] ?? null);
            $n['added']++;
        } catch (Refusal $r) {
            $why = $r->payload['error'] ?? '';
            match (true) {
                $why === 'duplicate' => $n['held']++,
                $why === 'retired' => $n['retired']++,
                $why === 'full' => $n['full']++,
                default => $n['refused']++,
            };
            if ($why !== 'duplicate' && $why !== 'retired' && $why !== 'full') {
                fwrite(STDERR, "import-backup: $g " . (string) ($s['h'] ?? '?') . ': refused, ' . json_encode($r->payload) . "\n");
            }
        } catch (Throwable $e) {
            fwrite(STDERR, "import-backup: $g: the bank failed: {$e->getMessage()}\n");
            $failed = true;
            break 2;
        }
    }
    echo "import-backup: $g: {$n['added']} loaded; {$n['held']} the bank holds, {$n['retired']} it has retired, "
        . "{$n['full']} left out (the difficulty is full), {$n['withoutTuple']} without a tuple, {$n['refused']} refused\n";
}
exit($failed ? 1 : 0);
