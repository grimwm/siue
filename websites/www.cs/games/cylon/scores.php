<?php
/**
 * Cylon Defense high-score API.
 * Copyright (C) 2026 William Grim
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * GET  -> { "scores" (this week), "alltime", "csrf", "week", "config" }
 * POST { "op": "start" } -> { "run" }
 * POST { "op": "score", "score", "hits", "initials", "run" }
 *
 * Settings: data/config.json (validated on load).
 * Scores: data/scores.json, or /var/tmp/<storageKey>-scores.json when data/ is not writable;
 *   CYLON_SCORES_FILE overrides both (tests). The file is {"week": [...], "alltime": [...]}.
 * Origin, CSRF, run tokens, rate limits and initials: server/score-guard.php (the kit's
 *   score guard); its run tokens live in sys_get_temp_dir()/<storageKey>-runs.json.
 */

require_once __DIR__ . '/server/score-guard.php';
require_once __DIR__ . '/server/store-dir.php';

use Kit\ScoreGuard;
use Kit\StoreDir;
use Kit\StoreModes;

function gameConfig(): array {
    static $config = null;
    static $mtime = null;
    $path = __DIR__ . '/data/config.json';
    $current = @filemtime($path);
    if ($config !== null && $mtime === $current) {
        return $config;
    }
    $raw = @file_get_contents($path);
    if ($raw === false) {
        throw new RuntimeException('config missing: ' . $path);
    }
    $data = json_decode($raw, true);
    if (!is_array($data)) {
        throw new RuntimeException('config is not a JSON object');
    }
    $config = validateConfig($data);
    $mtime = $current;
    return $config;
}

function cfg(string $key) {
    $config = gameConfig();
    if (!array_key_exists($key, $config)) {
        throw new RuntimeException('missing config ' . $key);
    }
    return $config[$key];
}

function validateConfig(array $data): array {
    $ints = [
        'maxScores' => [1, 100],
        'maxScoreValue' => [1, 10000000],
        'maxHitsStored' => [0, 100000],
        'minRunSec' => [0, 3600],
        'maxKosPerSec' => [1, 100],
        'koBurst' => [0, 10000],
    ];
    $required = array_merge(array_keys($ints), ['timezone', 'weekStartsOn'], ScoreGuard::CONFIG_KEYS);
    $unknown = array_diff(array_keys($data), $required);
    if ($unknown) {
        throw new RuntimeException('unknown config keys: ' . implode(', ', $unknown));
    }
    $missing = array_diff($required, array_keys($data), ScoreGuard::OPTIONAL_KEYS);
    if ($missing) {
        throw new RuntimeException('missing config keys: ' . implode(', ', $missing));
    }

    $out = ScoreGuard::validateConfig(array_intersect_key($data, array_flip(ScoreGuard::CONFIG_KEYS)));
    foreach ($ints as $key => [$min, $max]) {
        if (!is_int($data[$key]) || $data[$key] < $min || $data[$key] > $max) {
            throw new RuntimeException("config $key must be an integer from $min to $max");
        }
        $out[$key] = $data[$key];
    }
    if ($out['minRunSec'] >= $out['runTtlSec']) {
        throw new RuntimeException('config minRunSec must be less than runTtlSec');
    }

    $tz = $data['timezone'];
    if (!is_string($tz) || !in_array($tz, timezone_identifiers_list(), true)) {
        throw new RuntimeException('config timezone is not a known timezone id');
    }
    $out['timezone'] = $tz;

    $week = $data['weekStartsOn'];
    if ($week !== 'monday' && $week !== 'sunday') {
        throw new RuntimeException('config weekStartsOn must be monday or sunday');
    }
    $out['weekStartsOn'] = $week;
    return $out;
}

/** The kit's score gate, set up for Cylon: its cookie, header, rate salt and run store. */
function guard(): ScoreGuard {
    static $guard = null;
    return $guard ??= new ScoreGuard(
        array_intersect_key(gameConfig(), array_flip(ScoreGuard::CONFIG_KEYS)),
        'X-Cylon-CSRF',
        'cylon-score-rate-v1',
        $_SERVER,
        $_COOKIE,
        rtrim(sys_get_temp_dir(), DIRECTORY_SEPARATOR) . '/' . cfg('storageKey') . '-runs.json',
    );
}

/** Cylon's plausibility rule: no score before minRunSec, and no more KOs than the clock allows. */
function scoreFitsTime(int $score): callable {
    return static fn(int $elapsed): bool => $elapsed >= cfg('minRunSec')
        && $score <= cfg('koBurst') + max(0, $elapsed) * cfg('maxKosPerSec');
}

function publicConfig(): array {
    return [
        'timezone' => cfg('timezone'),
        'weekStartsOn' => cfg('weekStartsOn'),
        'maxScores' => cfg('maxScores'),
        'blockedInitials' => cfg('blockedInitials'),
    ];
}

function respond(array $payload, int $status = 200): void {
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_SLASHES);
    exit;
}

function scorePathUsable(string $path): bool {
    if (is_file($path)) {
        return is_readable($path) && is_writable($path);
    }
    $dir = dirname($path);
    return is_dir($dir) && is_writable($dir);
}

/** The kit's storage checks: a link or another account's file is refused, with the cause in the log. */
function scoreStore(): StoreDir {
    static $store = null;
    return $store ??= new StoreDir('cylon storage:');
}

/** Prefer data/scores.json; fall back to durable /var/tmp. A data/ folder or file that is a link is not used. */
function resolveScorePath(): string {
    $override = getenv('CYLON_SCORES_FILE');
    if (is_string($override) && $override !== '') {
        return $override;
    }
    $preferred = __DIR__ . '/data/scores.json';
    if (scorePathUsable($preferred) && !is_link(dirname($preferred)) && !is_link($preferred)) {
        return $preferred;
    }
    return scoreStore()->claimFile('/var/tmp/' . cfg('storageKey') . '-scores.json');
}

function normalizeScores($data): array {
    if (!is_array($data)) {
        return [];
    }
    $out = [];
    foreach ($data as $row) {
        if (!is_array($row) || !isset($row['score'])) {
            continue;
        }
        $initials = ScoreGuard::coerceInitials($row['initials'] ?? null, 'A');
        if (guard()->isBlocked($initials)) {
            continue;
        }
        $out[] = [
            'score' => (int) $row['score'],
            'hits' => isset($row['hits']) ? (int) $row['hits'] : 0,
            'initials' => $initials,
            'at' => isset($row['at']) ? (string) $row['at'] : gmdate('c'),
        ];
    }
    return $out;
}

function scoreClock(): DateTimeZone {
    return new DateTimeZone(cfg('timezone'));
}

/** Start date (YYYY-MM-DD) of the configured local week containing $iso, or now. */
function localWeek(?string $iso = null): string {
    $tz = scoreClock();
    if ($iso === null || $iso === '') {
        $dt = new DateTimeImmutable('now', $tz);
    } else {
        try {
            $dt = (new DateTimeImmutable($iso))->setTimezone($tz);
        } catch (Throwable $e) {
            return '';
        }
    }
    $dow = (int) $dt->format('N'); // 1 = Monday … 7 = Sunday
    $back = cfg('weekStartsOn') === 'sunday' ? ($dow % 7) : ($dow - 1);
    return $dt->setTime(0, 0)->modify('-' . $back . ' days')->format('Y-m-d');
}

/** Keep entries from the current local week (its first day 00:00 through the next week's). */
function scoresForThisWeek(array $scores): array {
    $week = localWeek();
    $kept = [];
    foreach ($scores as $row) {
        if (localWeek($row['at'] ?? '') === $week) {
            $kept[] = $row;
        }
    }
    return $kept;
}

/**
 * Both boards in the store's on-disk shape.
 * @param resource $fh
 */
function writeScoresHandle($fh, array $store, string $path): void {
    $payload = json_encode([
        'week' => array_values($store['week']),
        'alltime' => array_values($store['alltime']),
    ], JSON_UNESCAPED_SLASHES);
    if ($payload === false) {
        throw new RuntimeException('encode failed');
    }
    rewind($fh);
    ftruncate($fh, 0);
    if (fwrite($fh, $payload) === false) {
        throw new RuntimeException('write failed for ' . $path);
    }
    fflush($fh);
    if (function_exists('fsync')) {
        @fsync($fh);
    }
}

function sortScores(array $scores): array {
    usort($scores, static function (array $a, array $b): int {
        if ($a['score'] === $b['score']) {
            return strcmp($a['at'], $b['at']);
        }
        return $b['score'] <=> $a['score'];
    });
    return array_slice(array_values($scores), 0, cfg('maxScores'));
}

/** Our own data/ folder is also the deploy account's; anything else (the /var/tmp fallback, tests) is PHP's alone. */
function scoresPathIsOurs(string $path): bool {
    return strpos(dirname($path) . DIRECTORY_SEPARATOR, __DIR__ . DIRECTORY_SEPARATOR) === 0;
}

/** Kit\StoreModes opens our data/ to both users when PHP runs as another user. */
function scoresFileMode(string $path): int {
    $m = StoreModes::modes();
    return scoresPathIsOurs($path) ? $m['sharedFile'] : $m['file'];
}

/**
 * Open the scores file with an flock lock.
 * @return resource
 */
function openScoresFile(string $path, string $mode) {
    $dir = dirname($path);
    $m = StoreModes::modes();
    $relax = scoresPathIsOurs($path);
    if (!is_dir($dir) && !@mkdir($dir, $relax ? $m['sharedDir'] : $m['dir'], true) && !is_dir($dir)) {
        throw new RuntimeException('scores directory missing: ' . $dir);
    }
    if ($relax) {
        @chmod($dir, $m['sharedDir']);
    }
    if (!is_file($path)) {
        $bootstrap = @fopen($path, 'c+');
        if ($bootstrap === false) {
            throw new RuntimeException('unable to create scores file: ' . $path);
        }
        if (flock($bootstrap, LOCK_EX)) {
            if (filesize($path) === 0) {
                fwrite($bootstrap, '{"week":[],"alltime":[]}');
                fflush($bootstrap);
            }
            flock($bootstrap, LOCK_UN);
        }
        fclose($bootstrap);
        @chmod($path, scoresFileMode($path));
    }

    $fh = @fopen($path, $mode);
    if ($fh === false) {
        throw new RuntimeException('unable to open scores file: ' . $path);
    }
    return $fh;
}

/**
 * Parse the store file's contents. A bare array is the older single-board
 * file: its rows seed both boards, so nothing already ranked is lost.
 * @return array{week: array, alltime: array, legacy: bool}
 */
function parseStore($raw): array {
    if (!is_string($raw) || $raw === '') {
        return ['week' => [], 'alltime' => [], 'legacy' => false];
    }
    // A store that will not parse is left alone for repair: carrying on would
    // overwrite every board with an empty one.
    $data = json_decode($raw, true);
    if (!is_array($data)) {
        throw new RuntimeException('scores file is not valid JSON');
    }
    if (array_is_list($data) && $data !== []) {
        $rows = normalizeScores($data);
        return ['week' => $rows, 'alltime' => sortScores($rows), 'legacy' => true];
    }
    $hasWeek = array_key_exists('week', $data);
    $hasAllTime = array_key_exists('alltime', $data);
    if ((!$hasWeek && !$hasAllTime) && $data !== []) {
        throw new RuntimeException('scores file has neither week nor alltime');
    }
    if (($hasWeek && !is_array($data['week'])) || ($hasAllTime && !is_array($data['alltime']))) {
        throw new RuntimeException('scores file boards must be lists');
    }
    $week = normalizeScores($data['week'] ?? []);
    // A store without an all-time list gets one seeded from the weekly rows, so
    // nothing already ranked is lost; it is rewritten with both on the next save.
    $alltime = $hasAllTime ? normalizeScores($data['alltime']) : $week;
    return ['week' => $week, 'alltime' => sortScores($alltime), 'legacy' => !$hasAllTime];
}

/** @return array{scores: array, alltime: array} the response fields for both boards */
function boardPayload(array $store): array {
    return ['scores' => $store['week'], 'alltime' => $store['alltime']];
}

/**
 * Both boards, ranked. A read after the week turns rewrites the file without the
 * old week's rows; the all-time board is never pruned by time.
 * @return array{week: array, alltime: array}
 */
function readScoresLocked(): array {
    $path = resolveScorePath();
    $fh = openScoresFile($path, 'c+');
    try {
        // Exclusive: a read after the week turns rewrites the file without last week's rows.
        if (!flock($fh, LOCK_EX)) {
            throw new RuntimeException('unable to lock scores file for reading');
        }
        rewind($fh);
        $raw = stream_get_contents($fh);
        $store = parseStore($raw !== false ? $raw : '');
        $week = scoresForThisWeek($store['week']);
        if ($store['legacy'] || count($week) !== count($store['week'])) {
            $store['week'] = $week;
            writeScoresHandle($fh, $store, $path);
            @chmod($path, scoresFileMode($path));
        }
        flock($fh, LOCK_UN);
        return ['week' => sortScores($week), 'alltime' => $store['alltime']];
    } finally {
        fclose($fh);
    }
}

/**
 * Ranks the score onto both boards. `rank` is its 1-based place on the all-time
 * board, or null when it did not make the cut (a tie at the last place keeps the older row).
 * @return array{week: array, alltime: array, rank: ?int}
 */
function addScoreLocked(int $score, int $hits, string $initials): array {
    $path = resolveScorePath();
    $fh = openScoresFile($path, 'c+');
    try {
        if (!flock($fh, LOCK_EX)) {
            throw new RuntimeException('unable to lock scores file for writing');
        }

        rewind($fh);
        $raw = stream_get_contents($fh);
        $store = parseStore($raw !== false ? $raw : '');
        $row = [
            'score' => $score,
            'hits' => $hits,
            'initials' => ScoreGuard::coerceInitials($initials, 'A'),
            'at' => gmdate('c'),
        ];
        $week = scoresForThisWeek($store['week']);
        $week[] = $row;
        $store['week'] = sortScores($week);
        $store['alltime'][] = $row;
        $store['alltime'] = sortScores($store['alltime']);
        // Equal rows sort in insertion order, so the new one is the last of its twins.
        $rank = null;
        foreach ($store['alltime'] as $i => $r) {
            if ($r === $row) {
                $rank = $i + 1;
            }
        }
        $store['rank'] = $rank;
        writeScoresHandle($fh, $store, $path);
        flock($fh, LOCK_UN);
        @chmod($path, scoresFileMode($path));
        return $store;
    } finally {
        fclose($fh);
    }
}

// Tests load the functions above without serving a request.
if (defined('CYLON_SCORES_LIBRARY')) {
    return;
}

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

try {
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    $csrf = guard()->csrfToken();

    if ($method === 'GET') {
        respond([
            ...boardPayload(readScoresLocked()),
            'csrf' => $csrf,
            'week' => localWeek(),
            'tz' => cfg('timezone'),
            'config' => publicConfig(),
            'store' => 'json',
        ]);
    }

    if ($method === 'POST') {
        $contentType = (string) ($_SERVER['CONTENT_TYPE'] ?? $_SERVER['HTTP_CONTENT_TYPE'] ?? '');
        if (stripos($contentType, 'application/json') === false || !guard()->originAllowed() || !guard()->csrfOk()) {
            respond(['error' => 'forbidden', 'scores' => [], 'alltime' => []], 403);
        }

        $raw = file_get_contents('php://input');
        $data = json_decode($raw ?: '{}', true);
        if (!is_array($data)) {
            respond(['error' => 'invalid json', 'scores' => [], 'alltime' => []], 400);
        }

        $op = (string) ($data['op'] ?? '');
        if ($op === 'start') {
            $run = guard()->startRun();
            if ($run === null) {
                respond(['error' => 'rate', 'scores' => [], 'alltime' => []], 429);
            }
            respond(['ok' => true, 'run' => $run]);
        }

        if ($op !== 'score') {
            respond(['error' => 'invalid json', 'scores' => [], 'alltime' => []], 400);
        }

        $score = isset($data['score']) ? (int) $data['score'] : 0;
        $hits = isset($data['hits']) ? (int) $data['hits'] : 0;
        $initials = ScoreGuard::coerceInitials($data['initials'] ?? 'AAA', 'A');
        if ($score < 1 || $score > cfg('maxScoreValue')) {
            respond(['error' => 'invalid score', 'scores' => [], 'alltime' => []], 400);
        }
        if (guard()->isBlocked($initials)) {
            respond(['error' => 'invalid initials', ...boardPayload(readScoresLocked())], 400);
        }
        $problem = guard()->consumeRun((string) ($data['run'] ?? ''), scoreFitsTime($score));
        if ($problem === 'rate') {
            respond(['error' => 'rate', ...boardPayload(readScoresLocked())], 429);
        }
        if ($problem !== null) {
            respond(['error' => $problem, ...boardPayload(readScoresLocked())], 400);
        }
        $hits = max(0, min(cfg('maxHitsStored'), $hits));

        respond([
            'ok' => true,
            ...boardPayload($added = addScoreLocked($score, $hits, $initials)),
            'alltimeRank' => $added['rank'],
            'week' => localWeek(),
            'tz' => cfg('timezone'),
            'config' => publicConfig(),
            'store' => 'json',
        ]);
    }

    respond(['error' => 'method not allowed', 'scores' => [], 'alltime' => []], 405);
} catch (Throwable $e) {
    error_log('scores.php: ' . $e->getMessage());
    respond(['error' => 'server error', 'scores' => [], 'alltime' => []], 500);
}
