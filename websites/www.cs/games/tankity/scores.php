<?php
// Operation Tankity: the online boards (server/board.php), one per difficulty,
// holding room matches two or more humans played. GET ?difficulty=easy|normal|hard
// answers a board's best runs (Normal by default). Solo scores stay in the
// browser, so every POST is answered 410 before anything else is read or
// written: an old page's filing costs the server nothing, and the page keeps
// the run in its own browser.
declare(strict_types=1);

// Same promise as rooms.php: diagnostics belong in the server log, never in
// a JSON response body.
ini_set('display_errors', '0');

function scores_out(int $code, array $payload): never
{
    http_response_code($code);
    header('Content-Type: application/json');
    header('Cache-Control: no-store');
    echo json_encode($payload, JSON_UNESCAPED_SLASHES);
    exit;
}

$method = (string) ($_SERVER['REQUEST_METHOD'] ?? 'GET');
if ($method === 'POST') {
    scores_out(410, ['error' => 'solo scores now stay in this browser']);
}
if ($method !== 'GET') {
    scores_out(405, ['error' => 'method not allowed']);
}

require_once __DIR__ . '/config.php';
// The boards and housekeeping come with the room library; no room is served.
define('TANKITY_ROOMS_LIB', true);
require_once __DIR__ . '/rooms.php';

try {
    tankity_housekeep(time(), tankity_jobs());
    $level = board_level($_GET['difficulty'] ?? 'normal');
    if ($level === null) {
        scores_out(422, ['error' => 'difficulty must be easy, normal or hard']);
    }
    // The shape the page reads: name, best, banked (rounds), won, place, at; never the seed.
    $scores = array_map(
        fn(array $r): array => ['name' => $r['initials'], 'best' => $r['score'], 'banked' => $r['rounds'],
            'won' => false, 'place' => $r['place'], 'at' => $r['at']],
        board_top($level, BOARD_SHOW)
    );
} catch (Throwable $e) {
    if ($e instanceof TankityStorageRefused) {
        scores_out(503, ['error' => 'store unavailable']);
    }
    error_log('tankity scores.php: ' . $e->getMessage());
    scores_out(tankity_busy($e) ? 503 : 500, ['error' => tankity_busy($e) ? 'busy' : 'store unavailable']);
}
scores_out(200, ['difficulty' => $level, 'scores' => $scores, 'keep' => BOARD_KEEP]);
