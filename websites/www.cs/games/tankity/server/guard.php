<?php
// games/tankity/server/guard.php
// Tankity's settings for the kit's score guard (server/score-guard.php is the
// generated copy of games/_kit/php/score-guard.php) and the initials nobody may
// file or sit down with. Loaded by rooms.php, scores.php and server/board.php.
declare(strict_types=1);
if (count(get_included_files()) === 1) {
    http_response_code(404);
    exit;
}
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/score-guard.php';

use Kit\ScoreGuard;

// Matched on the uppercase form. src/initials.ts BLOCKED_INITIALS is the same list.
const BLOCKED_INITIALS = [
    'ASS',
    'FUK', 'FUC', 'FCK', 'FUX', 'FUQ',
    'SHT', 'SHI',
    'DIK', 'DIC', 'DCK',
    'COK', 'COC', 'COQ',
    'CUM', 'JIZ',
    'CNT', 'PUS', 'VAG', 'CLT',
    'SEX', 'XXX', 'TIT',
    'FAG', 'FGT',
    'NIG', 'NGR',
    'WTF', 'FFS',
    'POO', 'PEE',
    'KKK',
];
// The guard's run tokens and rate stamps, beside the database.
const TANKITY_GUARD_RUNS = 'guard-runs.json';

/* The guard's config keys for Tankity, validated. A solo run's token is spent
   when the run files, hours after it may have started; the run's own expiry
   (solo_runs) is the tighter limit. Tests pass $override (a low limit). */
function tankity_guard_config(array $override = []): array
{
    $hosts = array_values(array_filter(array_map('trim',
        explode(',', (string) tankity_setting('TANKITY_ALLOWED_HOSTS', 'allowed_hosts', 'www.cs.siue.edu,cs.siue.edu')))));
    return ScoreGuard::validateConfig($override + [
        'runTtlSec' => 86400,
        'startsPerHour' => 120,
        'scoresPerHour' => (int) tankity_setting('TANKITY_SCORES_PER_HOUR', 'scores_per_hour', '60'),
        'csrfCookie' => 'tankity_csrf',
        'storageKey' => 'operation-tankity',
        'blockedInitials' => BLOCKED_INITIALS,
        'allowedHosts' => $hosts,
    ]);
}

/* The kit's score guard for this request, set up for Tankity: its cookie and
   header, its rate salt and its run store in the storage directory. Tests pass
   the request, a clock and a cookie setter; a page request uses $_SERVER,
   $_COOKIE and the real ones. */
function tankity_guard(array $override = [], ?array $server = null, ?array $cookies = null, ?Closure $clock = null, ?Closure $setCookie = null): ScoreGuard
{
    return new ScoreGuard(
        tankity_guard_config($override),
        'X-Tankity-Csrf',
        'tankity-score-rate-v1',
        $server ?? $_SERVER,
        $cookies ?? $_COOKIE,
        tankity_data_dir() . '/' . TANKITY_GUARD_RUNS,
        $clock,
        $setCookie,
    );
}

/* Initials as filed and seated: three letters typed in either case (spaces
   around them dropped), stored uppercase; null for anything else or a blocked set. */
function tankity_initials(ScoreGuard $guard, mixed $raw): ?string
{
    $initials = ScoreGuard::initials(is_string($raw) ? trim($raw) : $raw);
    return $initials !== null && !$guard->isBlocked($initials) ? $initials : null;
}

/* Whether a browser request came from this site: a cross-site Origin is
   refused; callers that send none (curl) pass, and their tokens still gate them. */
function room_origin_ok(): bool
{
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if ($origin === '') {
        return true; // curl-style callers send none; the tokens still gate them
    }
    $host = strtolower((string) ($_SERVER['HTTP_HOST'] ?? ''));
    $host = preg_replace('/:\d+$/', '', $host);
    $o = parse_url($origin, PHP_URL_HOST);
    return is_string($o) && $o !== '' && strcasecmp($o, $host) === 0;
}
