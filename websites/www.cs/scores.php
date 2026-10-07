<?php
/**
 * High-score API for the Cylon defense mini-game.
 * GET  -> { "scores": [ { "score", "hits", "at" }, ... ] }
 * POST -> JSON body { "score": int, "hits": int, "initials": "ABC" }
 * Storage: prefer data/scores.json (SFTP-reachable); fall back to
 * /var/tmp/<user>-cylon-scores.json when data/ is not web-writable.
 */

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

const MAX_SCORES = 10;
const MAX_SCORE_VALUE = 100000;
/**
 * Uppercase 3-letter blocks rejected on write and omitted on read.
 * Keep in sync with BLOCKED_INITIALS in games/cylon/cylon.js.
 */
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

function respond(array $payload, int $status = 200): void {
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_SLASHES);
    exit;
}

function accountName(): string {
    $base = basename(__DIR__);
    return preg_match('/^[A-Za-z0-9._-]+$/', $base) ? $base : 'cylon';
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
    return '/var/tmp/' . accountName() . '-cylon-scores.json';
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
    return in_array($initials, BLOCKED_INITIALS, true);
}

function sortScores(array $scores): array {
    usort($scores, static function (array $a, array $b): int {
        if ($a['score'] === $b['score']) {
            return strcmp($a['at'], $b['at']);
        }
        return $b['score'] <=> $a['score'];
    });
    return array_slice(array_values($scores), 0, MAX_SCORES);
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
        if (!flock($fh, LOCK_SH)) {
            throw new RuntimeException('unable to lock scores file for reading');
        }
        rewind($fh);
        $raw = stream_get_contents($fh);
        flock($fh, LOCK_UN);
        $scores = normalizeScores(json_decode($raw !== false && $raw !== '' ? $raw : '[]', true));
        return sortScores($scores);
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
        $scores = normalizeScores(json_decode($raw !== false && $raw !== '' ? $raw : '[]', true));
        $scores[] = [
            'score' => $score,
            'hits' => $hits,
            'initials' => sanitizeInitials($initials),
            'at' => gmdate('c'),
        ];
        $scores = sortScores($scores);

        $payload = json_encode($scores, JSON_UNESCAPED_SLASHES);
        if ($payload === false) {
            throw new RuntimeException('encode failed');
        }

        rewind($fh);
        ftruncate($fh, 0);
        $written = fwrite($fh, $payload);
        if ($written === false) {
            throw new RuntimeException('write failed for ' . $path);
        }
        fflush($fh);
        // Ensure readers see durable content before unlock on supporting platforms
        if (function_exists('fsync')) {
            @fsync($fh);
        }
        flock($fh, LOCK_UN);
        @chmod($path, 0666);
        return $scores;
    } finally {
        fclose($fh);
    }
}

try {
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

    if ($method === 'GET') {
        respond(['scores' => readScoresLocked(), 'store' => 'json']);
    }

    if ($method === 'POST') {
        $raw = file_get_contents('php://input');
        $data = json_decode($raw ?: '{}', true);
        if (!is_array($data)) {
            respond(['error' => 'invalid json', 'scores' => []], 400);
        }

        $score = isset($data['score']) ? (int) $data['score'] : 0;
        $hits = isset($data['hits']) ? (int) $data['hits'] : 0;
        $initials = sanitizeInitials($data['initials'] ?? 'AAA');
        if ($score < 1 || $score > MAX_SCORE_VALUE) {
            respond(['error' => 'invalid score', 'scores' => []], 400);
        }
        if (isBlockedInitials($initials)) {
            respond(['error' => 'invalid initials', 'scores' => readScoresLocked()], 400);
        }
        $hits = max(0, min(MAX_SCORE_VALUE, $hits));

        respond(['ok' => true, 'scores' => addScoreLocked($score, $hits, $initials), 'store' => 'json']);
    }

    respond(['error' => 'method not allowed', 'scores' => []], 405);
} catch (Throwable $e) {
    respond(['error' => 'server error', 'detail' => $e->getMessage(), 'scores' => []], 500);
}
