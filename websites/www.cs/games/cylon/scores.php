<?php
/**
 * Cylon Defense high-score API.
 * Copyright (C) 2026 William Grim
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * GET  -> { "scores", "csrf", "week", "config" }
 * POST { "op": "start" } -> { "run" }
 * POST { "op": "score", "score", "hits", "initials", "run" }
 *
 * Settings: data/config.json (validated on load).
 * Scores: data/scores.json, or /var/tmp/<storageKey>-scores.json when data/ is not writable.
 * Run tokens: sys_get_temp_dir()/<storageKey>-runs.json
 */

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

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
        'runTtlSec' => [60, 86400],
        'minRunSec' => [0, 3600],
        'maxKosPerSec' => [1, 100],
        'koBurst' => [0, 10000],
        'startsPerHour' => [1, 10000],
        'scoresPerHour' => [1, 10000],
    ];
    $required = array_merge(array_keys($ints), [
        'timezone', 'weekStartsOn', 'csrfCookie', 'storageKey', 'blockedInitials', 'allowedHosts',
    ]);
    $unknown = array_diff(array_keys($data), $required);
    if ($unknown) {
        throw new RuntimeException('unknown config keys: ' . implode(', ', $unknown));
    }
    $missing = array_diff($required, array_keys($data));
    if ($missing) {
        throw new RuntimeException('missing config keys: ' . implode(', ', $missing));
    }

    $out = [];
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

    foreach (['csrfCookie' => '/^[A-Za-z0-9_]{1,32}$/', 'storageKey' => '/^[A-Za-z0-9_-]{1,32}$/'] as $key => $pattern) {
        if (!is_string($data[$key]) || !preg_match($pattern, $data[$key])) {
            throw new RuntimeException("config $key has an invalid value");
        }
        $out[$key] = $data[$key];
    }

    if (!is_array($data['blockedInitials'])) {
        throw new RuntimeException('config blockedInitials must be a list');
    }
    $blocked = [];
    foreach ($data['blockedInitials'] as $initials) {
        $initials = strtoupper((string) $initials);
        if (!preg_match('/^[A-Z]{3}$/', $initials)) {
            throw new RuntimeException('config blockedInitials entries must be 3 letters');
        }
        $blocked[$initials] = true;
    }
    $out['blockedInitials'] = array_keys($blocked);

    if (!is_array($data['allowedHosts'])) {
        throw new RuntimeException('config allowedHosts must be a list');
    }
    $hosts = [];
    foreach ($data['allowedHosts'] as $host) {
        $host = strtolower((string) $host);
        if (!preg_match('/^[a-z0-9.-]+$/', $host)) {
            throw new RuntimeException('config allowedHosts has an invalid host');
        }
        $hosts[$host] = true;
    }
    $out['allowedHosts'] = array_keys($hosts);
    return $out;
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

/** Prefer data/scores.json; fall back to durable world-writable /var/tmp. */
function resolveScorePath(): string {
    $preferred = __DIR__ . '/data/scores.json';
    if (scorePathUsable($preferred)) {
        return $preferred;
    }
    return '/var/tmp/' . cfg('storageKey') . '-scores.json';
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
        $initials = isset($row['initials']) ? strtoupper((string) $row['initials']) : 'AAA';
        $initials = preg_replace('/[^A-Z]/', '', $initials) ?: 'AAA';
        $initials = substr(str_pad($initials, 3, 'A'), 0, 3);
        if (isBlockedInitials($initials)) {
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

function sanitizeInitials($value): string {
    $initials = strtoupper((string) $value);
    $initials = preg_replace('/[^A-Z]/', '', $initials) ?: 'AAA';
    return substr(str_pad($initials, 3, 'A'), 0, 3);
}

function isBlockedInitials(string $initials): bool {
    return in_array($initials, cfg('blockedInitials'), true);
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

/** Keep entries from the current local week (Monday 00:00 through next Monday). */
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

function requestHost(): string {
    $host = strtolower((string) ($_SERVER['HTTP_HOST'] ?? ''));
    return (string) preg_replace('/:\d+$/', '', $host);
}

function originHost(string $value): string {
    $host = parse_url($value, PHP_URL_HOST);
    return is_string($host) ? strtolower($host) : '';
}

/** Reject cross-site browser posts. Missing Origin is allowed only with the CSRF header. */
function originAllowed(): bool {
    $allowed = array_unique(array_filter(array_merge(cfg('allowedHosts'), [requestHost()])));
    $origin = (string) ($_SERVER['HTTP_ORIGIN'] ?? '');
    if ($origin !== '') {
        return in_array(originHost($origin), $allowed, true);
    }
    $referer = (string) ($_SERVER['HTTP_REFERER'] ?? '');
    if ($referer !== '') {
        return in_array(originHost($referer), $allowed, true);
    }
    return isset($_SERVER['HTTP_X_CYLON_CSRF']);
}

function cookiePath(): string {
    $script = (string) ($_SERVER['SCRIPT_NAME'] ?? '');
    $dir = rtrim(str_replace('\\', '/', dirname($script)), '/');
    return ($dir === '' || $dir === '.') ? '/' : $dir;
}

function issueCsrfCookie(): string {
    $current = (string) ($_COOKIE[cfg('csrfCookie')] ?? '');
    if (preg_match('/^[a-f0-9]{32}$/', $current)) {
        return $current;
    }
    $token = bin2hex(random_bytes(16));
    $https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https')
        || (($_SERVER['REQUEST_SCHEME'] ?? '') === 'https');
    setcookie(cfg('csrfCookie'), $token, [
        'expires' => time() + 7 * 86400,
        'path' => cookiePath(),
        'secure' => $https,
        'httponly' => true,
        'samesite' => 'Strict',
    ]);
    $_COOKIE[cfg('csrfCookie')] = $token;
    return $token;
}

function csrfOk(): bool {
    $cookie = (string) ($_COOKIE[cfg('csrfCookie')] ?? '');
    $header = (string) ($_SERVER['HTTP_X_CYLON_CSRF'] ?? '');
    if (!preg_match('/^[a-f0-9]{32}$/', $cookie) || $header === '') {
        return false;
    }
    return hash_equals($cookie, $header);
}

function clientIpKey(): string {
    $ip = (string) ($_SERVER['REMOTE_ADDR'] ?? '');
    return substr(hash_hmac('sha256', $ip, 'cylon-score-rate-v1'), 0, 24);
}

function runsPath(): string {
    // Not data/: the web user can rewrite scores.json but cannot create new files there.
    $tmp = rtrim(sys_get_temp_dir(), DIRECTORY_SEPARATOR);
    return $tmp . '/' . cfg('storageKey') . '-runs.json';
}

function emptyRunStore(): array {
    return ['runs' => [], 'rates' => []];
}

function loadRunStore($raw): array {
    $data = json_decode(is_string($raw) && $raw !== '' ? $raw : '{}', true);
    if (!is_array($data)) {
        return emptyRunStore();
    }
    $store = emptyRunStore();
    if (isset($data['runs']) && is_array($data['runs'])) {
        $store['runs'] = $data['runs'];
    }
    if (isset($data['rates']) && is_array($data['rates'])) {
        $store['rates'] = $data['rates'];
    }
    return $store;
}

function pruneRunStore(array $store, int $now): array {
    $runs = [];
    foreach ($store['runs'] as $run) {
        if (!is_array($run)) {
            continue;
        }
        $exp = (int) ($run['exp'] ?? 0);
        if ($exp >= $now - 3600) {
            $runs[] = $run;
        }
    }
    $store['runs'] = $runs;
    $cutoff = $now - 3600;
    $rates = [];
    foreach ($store['rates'] as $key => $row) {
        if (!is_array($row)) {
            continue;
        }
        $clean = [];
        foreach (['start', 'score'] as $kind) {
            $stamps = [];
            foreach (($row[$kind] ?? []) as $ts) {
                $ts = (int) $ts;
                if ($ts >= $cutoff) {
                    $stamps[] = $ts;
                }
            }
            $clean[$kind] = $stamps;
        }
        if ($clean['start'] || $clean['score']) {
            $rates[$key] = $clean;
        }
    }
    $store['rates'] = $rates;
    return $store;
}

function rateAllows(array $store, string $kind, int $limit, int $now): bool {
    $key = clientIpKey();
    $stamps = $store['rates'][$key][$kind] ?? [];
    $recent = 0;
    foreach ($stamps as $ts) {
        if ((int) $ts >= $now - 3600) {
            $recent++;
        }
    }
    return $recent < $limit;
}

function rateMark(array &$store, string $kind, int $now): void {
    $key = clientIpKey();
    if (!isset($store['rates'][$key]) || !is_array($store['rates'][$key])) {
        $store['rates'][$key] = ['start' => [], 'score' => []];
    }
    $store['rates'][$key][$kind][] = $now;
}

/** @param resource $fh */
function writeJsonHandle($fh, $payload, string $path): void {
    $encoded = json_encode($payload, JSON_UNESCAPED_SLASHES);
    if ($encoded === false) {
        throw new RuntimeException('encode failed');
    }
    rewind($fh);
    ftruncate($fh, 0);
    if (fwrite($fh, $encoded) === false) {
        throw new RuntimeException('write failed for ' . $path);
    }
    fflush($fh);
    if (function_exists('fsync')) {
        @fsync($fh);
    }
}

function withRunStore(callable $fn) {
    $path = runsPath();
    $fh = openScoresFile($path, 'c+');
    try {
        if (!flock($fh, LOCK_EX)) {
            throw new RuntimeException('unable to lock runs file');
        }
        rewind($fh);
        $raw = stream_get_contents($fh);
        $store = pruneRunStore(loadRunStore($raw), time());
        $result = $fn($store);
        writeJsonHandle($fh, $store, $path);
        flock($fh, LOCK_UN);
        @chmod($path, 0666);
        return $result;
    } finally {
        fclose($fh);
    }
}

function startRun(): string {
    $now = time();
    return withRunStore(static function (array &$store) use ($now): string {
        if (!rateAllows($store, 'start', cfg('startsPerHour'), $now)) {
            throw new RuntimeException('rate');
        }
        $id = bin2hex(random_bytes(16));
        $store['runs'][] = [
            'id' => $id,
            'at' => $now,
            'exp' => $now + cfg('runTtlSec'),
            'used' => false,
        ];
        rateMark($store, 'start', $now);
        return $id;
    });
}

/**
 * Consume a run token if the claimed score fits the time since it was issued.
 * Returns an error code, or null when the run was accepted.
 */
function consumeRun(string $id, int $score): ?string {
    if (!preg_match('/^[a-f0-9]{32}$/', $id)) {
        return 'invalid run';
    }
    $now = time();
    return withRunStore(static function (array &$store) use ($id, $score, $now): ?string {
        if (!rateAllows($store, 'score', cfg('scoresPerHour'), $now)) {
            return 'rate';
        }
        foreach ($store['runs'] as &$run) {
            if (!is_array($run) || ($run['id'] ?? '') !== $id) {
                continue;
            }
            if (!empty($run['used']) || (int) ($run['exp'] ?? 0) < $now) {
                unset($run);
                return 'invalid run';
            }
            $elapsed = $now - (int) ($run['at'] ?? $now);
            $maxScore = cfg('koBurst') + max(0, $elapsed) * cfg('maxKosPerSec');
            if ($elapsed < cfg('minRunSec') || $score > $maxScore) {
                unset($run);
                return 'score rejected';
            }
            $run['used'] = true;
            unset($run);
            rateMark($store, 'score', $now);
            return null;
        }
        unset($run);
        return 'invalid run';
    });
}

/** @param resource $fh */
function writeScoresHandle($fh, array $scores, string $path): void {
    $payload = json_encode(array_values($scores), JSON_UNESCAPED_SLASHES);
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

/**
 * Open the scores file with an flock lock.
 * @return resource
 */
function openScoresFile(string $path, string $mode) {
    $dir = dirname($path);
    // 0777 only for our data/ dir — shared-host PHP is not the SFTP user.
    $relax = strpos($dir, __DIR__ . DIRECTORY_SEPARATOR) === 0
        || $dir === __DIR__ . '/data'
        || $dir === __DIR__ . DIRECTORY_SEPARATOR . 'data';
    if (!is_dir($dir) && !@mkdir($dir, $relax ? 0777 : 0755, true) && !is_dir($dir)) {
        throw new RuntimeException('scores directory missing: ' . $dir);
    }
    if ($relax) {
        @chmod($dir, 0777);
    }
    if (!is_file($path)) {
        $bootstrap = @fopen($path, 'c+');
        if ($bootstrap === false) {
            throw new RuntimeException('unable to create scores file: ' . $path);
        }
        if (flock($bootstrap, LOCK_EX)) {
            if (filesize($path) === 0) {
                fwrite($bootstrap, '[]');
                fflush($bootstrap);
            }
            flock($bootstrap, LOCK_UN);
        }
        fclose($bootstrap);
        @chmod($path, 0666);
    }

    $fh = @fopen($path, $mode);
    if ($fh === false) {
        throw new RuntimeException('unable to open scores file: ' . $path);
    }
    return $fh;
}

function readScoresLocked(): array {
    $path = resolveScorePath();
    $fh = openScoresFile($path, 'c+');
    try {
        // Exclusive: a read after midnight rewrites the file without yesterday's rows.
        if (!flock($fh, LOCK_EX)) {
            throw new RuntimeException('unable to lock scores file for reading');
        }
        rewind($fh);
        $raw = stream_get_contents($fh);
        $scores = normalizeScores(json_decode($raw !== false && $raw !== '' ? $raw : '[]', true));
        $week = scoresForThisWeek($scores);
        if (count($week) !== count($scores)) {
            writeScoresHandle($fh, $week, $path);
            @chmod($path, 0666);
        }
        flock($fh, LOCK_UN);
        return sortScores($week);
    } finally {
        fclose($fh);
    }
}

function addScoreLocked(int $score, int $hits, string $initials): array {
    $path = resolveScorePath();
    $fh = openScoresFile($path, 'c+');
    try {
        if (!flock($fh, LOCK_EX)) {
            throw new RuntimeException('unable to lock scores file for writing');
        }

        rewind($fh);
        $raw = stream_get_contents($fh);
        $scores = scoresForThisWeek(normalizeScores(json_decode($raw !== false && $raw !== '' ? $raw : '[]', true)));
        $scores[] = [
            'score' => $score,
            'hits' => $hits,
            'initials' => sanitizeInitials($initials),
            'at' => gmdate('c'),
        ];
        $scores = sortScores($scores);
        writeScoresHandle($fh, $scores, $path);
        flock($fh, LOCK_UN);
        @chmod($path, 0666);
        return $scores;
    } finally {
        fclose($fh);
    }
}

try {
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    $csrf = issueCsrfCookie();

    if ($method === 'GET') {
        respond([
            'scores' => readScoresLocked(),
            'csrf' => $csrf,
            'week' => localWeek(),
            'tz' => cfg('timezone'),
            'config' => publicConfig(),
            'store' => 'json',
        ]);
    }

    if ($method === 'POST') {
        $contentType = (string) ($_SERVER['CONTENT_TYPE'] ?? $_SERVER['HTTP_CONTENT_TYPE'] ?? '');
        if (stripos($contentType, 'application/json') === false || !originAllowed() || !csrfOk()) {
            respond(['error' => 'forbidden', 'scores' => []], 403);
        }

        $raw = file_get_contents('php://input');
        $data = json_decode($raw ?: '{}', true);
        if (!is_array($data)) {
            respond(['error' => 'invalid json', 'scores' => []], 400);
        }

        $op = (string) ($data['op'] ?? '');
        if ($op === 'start') {
            try {
                $run = startRun();
            } catch (RuntimeException $e) {
                if ($e->getMessage() === 'rate') {
                    respond(['error' => 'rate', 'scores' => []], 429);
                }
                throw $e;
            }
            respond(['ok' => true, 'run' => $run]);
        }

        if ($op !== 'score') {
            respond(['error' => 'invalid json', 'scores' => []], 400);
        }

        $score = isset($data['score']) ? (int) $data['score'] : 0;
        $hits = isset($data['hits']) ? (int) $data['hits'] : 0;
        $initials = sanitizeInitials($data['initials'] ?? 'AAA');
        if ($score < 1 || $score > cfg('maxScoreValue')) {
            respond(['error' => 'invalid score', 'scores' => []], 400);
        }
        if (isBlockedInitials($initials)) {
            respond(['error' => 'invalid initials', 'scores' => readScoresLocked()], 400);
        }
        $problem = consumeRun((string) ($data['run'] ?? ''), $score);
        if ($problem === 'rate') {
            respond(['error' => 'rate', 'scores' => readScoresLocked()], 429);
        }
        if ($problem !== null) {
            respond(['error' => $problem, 'scores' => readScoresLocked()], 400);
        }
        $hits = max(0, min(cfg('maxHitsStored'), $hits));

        respond([
            'ok' => true,
            'scores' => addScoreLocked($score, $hits, $initials),
            'week' => localWeek(),
            'tz' => cfg('timezone'),
            'config' => publicConfig(),
            'store' => 'json',
        ]);
    }

    respond(['error' => 'method not allowed', 'scores' => []], 405);
} catch (Throwable $e) {
    error_log('scores.php: ' . $e->getMessage());
    respond(['error' => 'server error', 'scores' => []], 500);
}
