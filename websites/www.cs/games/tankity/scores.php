<?php
// Operation Tankity: the score endpoint. The work is server/scores-api.php;
// this answers the request.
declare(strict_types=1);

// Same promise as rooms.php: diagnostics belong in the server log, never in
// a JSON response body.
ini_set('display_errors', '0');

require_once __DIR__ . '/config.php';
// The sim, the guard, the boards and housekeeping come with the room library; no room is served.
define('TANKITY_ROOMS_LIB', true);
require_once __DIR__ . '/rooms.php';
require_once __DIR__ . '/server/scores-api.php';

// A backstop past the round's own CPU budget: one request plays at most one round.
set_time_limit((int) ceil(solo_round_cpu()) + 15);
try {
    tankity_housekeep(time(), tankity_jobs());
    // One byte past the cap is enough to refuse a body; the rest is never read.
    $raw = file_get_contents('php://input', false, null, 0, SCORES_MAX_BODY + 1);
    [$status, $payload] = tankity_scores_handle((string) ($_SERVER['REQUEST_METHOD'] ?? 'GET'), $_GET,
        is_string($raw) ? $raw : '', tankity_guard(), time());
} catch (Throwable $e) {
    if ($e instanceof TankityStorageRefused) {
        [$status, $payload] = [503, ['error' => 'store unavailable']];
    } else {
        error_log('tankity scores.php: ' . $e->getMessage());
        [$status, $payload] = tankity_busy($e) ? [503, ['error' => 'busy']] : [500, ['error' => 'store unavailable']];
    }
}
http_response_code($status);
header('Content-Type: application/json');
header('Cache-Control: no-store');
echo json_encode($payload, JSON_UNESCAPED_SLASHES);
