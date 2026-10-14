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
// Where the guard would keep run tokens and rate stamps; no Tankity request writes it.
const TANKITY_GUARD_RUNS = 'guard-runs.json';

/* The guard's config keys for Tankity, validated. Tankity uses the guard for
   its origin, address and initials checks only: rooms count each address's
   creates and joins in the database (server/rate.php), and scores.php takes
   no score, so the run and rate keys here serve no request. */
function tankity_guard_config(array $override = []): array
{
    $hosts = array_values(array_filter(array_map('trim',
        explode(',', (string) tankity_setting('TANKITY_ALLOWED_HOSTS', 'allowed_hosts', 'www.cs.siue.edu,cs.siue.edu')))));
    return ScoreGuard::validateConfig($override + [
        'runTtlSec' => 86400,
        'startsPerHour' => 120,
        'scoresPerHour' => 240,
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

/* Whether a room request came from an allowed page: its Origin, else its
   Referer, must name the request's own host or one in allowed_hosts. Callers
   that send neither (curl) pass, gated by the seat and room tokens and the
   hourly allowance on creating and joining. */
function room_origin_ok(): bool
{
    if (($_SERVER['HTTP_ORIGIN'] ?? '') === '' && ($_SERVER['HTTP_REFERER'] ?? '') === '') {
        return true; // curl-style callers send neither; the seat and room tokens still gate them
    }
    return tankity_guard()->originAllowed();
}
