<?php
// games/tankity/server/housekeep.php
// Cleanup without cron: on requests, at most once every HOUSEKEEP_EVERY
// seconds, each job bounded so no request pays much for it. Loaded by
// rooms.php and scores.php; it serves nothing.
declare(strict_types=1);
if (count(get_included_files()) === 1) {
    http_response_code(404);
    exit;
}
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/legacy.php';

const HOUSEKEEP_EVERY = 300;

/* Runs $jobs (name => fn(int $now): int, what it removed) when the last run
   is HOUSEKEEP_EVERY seconds old. A plain read decides that, so a request
   between runs never waits for the writer; one request then claims the run
   under the write lock. A busy database, or a job that fails, never fails the
   request. Answers what each job removed (-1 for one that failed), or null
   when it was not time. */
function tankity_housekeep(int $now, array $jobs): ?array
{
    try {
        $db = tankity_db();
        $last = (int) $db->query("SELECT v FROM meta WHERE k = 'housekeep_at'")->fetchColumn();
        if ($last > 0 && $now - $last < HOUSEKEEP_EVERY) {
            return null;
        }
        $claimed = tankity_tx($db, function (PDO $db) use ($now): bool {
            $last = (int) $db->query("SELECT v FROM meta WHERE k = 'housekeep_at'")->fetchColumn();
            if ($last > 0 && $now - $last < HOUSEKEEP_EVERY) {
                return false;
            }
            $db->prepare("INSERT OR REPLACE INTO meta (k, v) VALUES ('housekeep_at', ?)")->execute([(string) $now]);
            return true;
        });
    } catch (Throwable $e) {
        if (!tankity_busy($e) && !$e instanceof TankityStorageRefused) {
            error_log('tankity housekeeping: ' . $e->getMessage());
        }
        return null;
    }
    if (!$claimed) {
        return null;
    }
    $out = [];
    foreach ($jobs as $name => $job) {
        try {
            $out[$name] = (int) $job($now);
        } catch (Throwable $e) {
            error_log("tankity housekeeping $name: " . $e->getMessage());
            $out[$name] = -1;
        }
    }
    return $out;
}

/* Every cleanup job this request can run, in order: old files into callsign
   rows, callsign rows onto the Normal board, then the room sweep where the
   room library is loaded. */
function tankity_jobs(): array
{
    $jobs = ['legacy' => fn(int $now): int => array_sum(legacy_import(null, LEGACY_IMPORT_BATCH, $now))];
    if (function_exists('board_convert_callsigns')) {
        $jobs['callsigns'] = fn(int $now): int => board_convert_callsigns();
    }
    if (function_exists('room_sweep')) {
        $jobs['rooms'] = fn(int $now): int => room_sweep($now);
    }
    return $jobs;
}
