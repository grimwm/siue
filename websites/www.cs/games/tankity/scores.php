<?php
// Operation Tankity: the all-time boards (server/board.php), one per
// difficulty. GET ?difficulty=easy|normal|hard answers the best runs (Normal
// by default); POST files a validated run on a board. Every write is one
// SQLite transaction, so a reader never sees half a record.
declare(strict_types=1);

// Same promise as rooms.php: diagnostics belong in the server log, never in
// a JSON response body.
ini_set('display_errors', '0');

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/server/db.php';
require_once __DIR__ . '/server/guard.php';
require_once __DIR__ . '/server/board.php';
require_once __DIR__ . '/server/housekeep.php';

function json_out(int $code, array $payload): void
{
    http_response_code($code);
    header('Content-Type: application/json');
    echo json_encode($payload, JSON_UNESCAPED_SLASHES);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
try {
    tankity_housekeep(time(), tankity_jobs());
    if ($method === 'GET') {
        $level = board_level($_GET['difficulty'] ?? 'normal');
        if ($level === null) {
            json_out(422, ['error' => 'difficulty must be easy, normal or hard']);
        }
        // The shape the page reads: name, best, banked (rounds), won.
        json_out(200, ['difficulty' => $level, 'scores' => array_map(
            fn(array $r): array => ['name' => $r['initials'], 'best' => $r['score'], 'banked' => $r['rounds'],
                'won' => false, 'place' => $r['place'], 'at' => $r['at']],
            board_top($level, BOARD_SHOW)
        )]);
    }
    if ($method === 'POST') {
        // A browser's own claim, filed as 'client': it can never take a room-filed
        // row's place. Solo runs are not yet replayed by the server.
        if (!room_origin_ok()) {
            json_out(403, ['error' => 'cross-site request refused']);
        }
        if (stripos((string) ($_SERVER['CONTENT_TYPE'] ?? ''), 'application/json') !== 0) {
            json_out(415, ['error' => 'send application/json']);
        }
        $guard = tankity_guard();
        if (!$guard->rateTake('post', tankity_guard_config()['scoresPerHour'])) {
            json_out(429, ['error' => 'too many reports; try later']);
        }
        $body = file_get_contents('php://input');
        $in = json_decode(is_string($body) ? $body : '', true);
        if (!is_array($in)) {
            json_out(400, ['error' => 'body must be JSON']);
        }
        $name = isset($in['name']) ? (string) $in['name'] : '';
        $score = isset($in['score']) ? (int) $in['score'] : -1;
        $banked = isset($in['banked']) ? (int) $in['banked'] : -1;
        if ($name === '' || strlen($name) > 24 || $score < 0 || $score > 999999 || $banked < 0 || $banked > 999) {
            json_out(422, ['error' => 'invalid run (name 1-24 chars, score 0-999999, banked 0-999)']);
        }
        $level = board_level($in['difficulty'] ?? 'normal');
        if ($level === null) {
            json_out(422, ['error' => 'difficulty must be easy, normal or hard']);
        }
        $seed = isset($in['seed']) ? substr((string) $in['seed'], 0, 64) : '';
        if (stripos(ltrim($seed), 'room:') === 0) {
            json_out(400, ['error' => 'that seed names a room match']);
        }
        $initials = board_convert_name($name, $guard);
        $place = board_file(['difficulty' => $level, 'initials' => $initials, 'score' => $score, 'rounds' => $banked,
            'seed' => $seed, 'source' => 'client']);
        json_out(200, ['ok' => true, 'name' => $initials, 'best' => $score, 'place' => $place]);
    }
    json_out(405, ['error' => 'method not allowed']);
} catch (Throwable $e) {
    if ($e instanceof TankityStorageRefused) {
        json_out(503, ['error' => 'store unavailable']);
    }
    error_log('tankity scores.php: ' . $e->getMessage());
    json_out(tankity_busy($e) ? 503 : 500, ['error' => tankity_busy($e) ? 'store busy' : 'store unavailable']);
}
