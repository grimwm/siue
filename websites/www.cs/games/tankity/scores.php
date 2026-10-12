<?php
// Operation Tankity: after-action report store.
// Runs per callsign in Tankity's database (server/legacy.php): GET answers
// each callsign's best, POST appends a validated run. Every write is one
// SQLite transaction, so a reader never sees half a record.
declare(strict_types=1);

// Same promise as rooms.php: diagnostics belong in the server log, never in
// a JSON response body.
ini_set('display_errors', '0');

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/server/db.php';
require_once __DIR__ . '/server/legacy.php';
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
        json_out(200, ['scores' => legacy_top(10)]);
    }
    if ($method === 'POST') {
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
        $slug = legacy_slug($name);
        $best = legacy_add_run($slug, ['score' => $score, 'banked' => $banked, 'won' => !empty($in['won']),
            'seed' => isset($in['seed']) ? substr((string) $in['seed'], 0, 64) : '', 'ts' => gmdate('c')]);
        json_out(200, ['ok' => true, 'name' => $slug, 'best' => $best]);
    }
    json_out(405, ['error' => 'method not allowed']);
} catch (Throwable $e) {
    error_log('tankity scores.php: ' . $e->getMessage());
    if ($e instanceof TankityStorageRefused) {
        json_out(503, ['error' => 'store unavailable']);
    }
    json_out(tankity_busy($e) ? 503 : 500, ['error' => tankity_busy($e) ? 'store busy' : 'store unavailable']);
}
