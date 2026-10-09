<?php
// Operation Tankity: after-action report store.
// No database: one JSON file per callsign on local disk.
//   /var/tmp/<callsign>-operation-tankity.json
// ACID, per file, via flock(LOCK_EX) + write-to-temp + fsync + rename:
//   Atomicity: readers never see a half-written file; rename is atomic.
//   Consistency: every run is validated server-side before it is stored.
//   Isolation: LOCK_EX serialises writers; LOCK_SH protects readers.
//   Durability: tmp file is fsync()ed before the rename lands it.
// The leaderboard (GET) is a best-effort snapshot: each file is individually
// ACID, but there is no cross-file transaction across the glob.
declare(strict_types=1);

// Same promise as rooms.php: diagnostics belong in the server log, never in
// a JSON response body.
ini_set('display_errors', '0');

require_once __DIR__ . '/config.php';

const GAME_SLUG = 'operation-tankity';
const MAX_RUNS_KEPT = 50;

function scores_dir(): string
{
    $d = (string) tankity_setting('TANKITY_SCORES_DIR', 'scores_dir', '');
    if (trim($d) !== '') {
        return rtrim(trim($d), '/');
    }
    return '/var/tmp';
}

function slugify(string $name): string
{
    $s = strtolower(trim($name));
    $s = (string) preg_replace('/[^a-z0-9_-]+/', '-', $s);
    $s = trim($s, '-');
    if ($s === '') {
        $s = 'anonymous';
    }
    return substr($s, 0, 32);
}

function json_out(int $code, array $payload): void
{
    http_response_code($code);
    header('Content-Type: application/json');
    echo json_encode($payload, JSON_UNESCAPED_SLASHES);
    exit;
}

function read_locked($fh): array
{
    $raw = stream_get_contents($fh);
    if ($raw === false || trim($raw) === '') {
        return ['name' => '', 'runs' => [], 'best' => 0];
    }
    $data = json_decode($raw, true);
    if (!is_array($data) || !isset($data['runs']) || !is_array($data['runs'])) {
        return ['name' => '', 'runs' => [], 'best' => 0, 'reset' => true];
    }
    return $data;
}

function atomic_store(string $path, array $data): void
{
    $tmp = $path . '.tmp.' . getmypid();
    $bytes = json_encode($data, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
    if ($bytes === false) {
        throw new RuntimeException('encode failed');
    }
    $fh = fopen($tmp, 'wb');
    if ($fh === false) {
        throw new RuntimeException('tmp open failed');
    }
    fwrite($fh, $bytes);
    fflush($fh);
    if (function_exists('fsync')) {
        fsync($fh);
    }
    fclose($fh);
    if (!rename($tmp, $path)) {
        @unlink($tmp);
        throw new RuntimeException('rename failed');
    }
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    $dir = scores_dir();
    $rows = [];
    foreach (glob($dir . '/*-' . GAME_SLUG . '.json') ?: [] as $path) {
        $fh = @fopen($path, 'rb');
        if ($fh === false) {
            continue;
        }
        if (!flock($fh, LOCK_SH)) {
            fclose($fh);
            continue;
        }
        $data = read_locked($fh);
        flock($fh, LOCK_UN);
        fclose($fh);
        if (empty($data['runs'])) {
            continue;
        }
        $last = end($data['runs']);
        $rows[] = [
            'name' => basename($path, '-' . GAME_SLUG . '.json'),
            'best' => (int) ($data['best'] ?? 0),
            'banked' => (int) ($last['banked'] ?? 0),
            'won' => (bool) ($last['won'] ?? false),
            'ts' => $last['ts'] ?? '',
        ];
    }
    usort($rows, fn($a, $b) => $b['best'] <=> $a['best']);
    json_out(200, ['scores' => array_slice($rows, 0, 10)]);
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
    $won = !empty($in['won']);
    $seed = isset($in['seed']) ? substr((string) $in['seed'], 0, 64) : '';
    if ($name === '' || strlen($name) > 24 || $score < 0 || $score > 999999 || $banked < 0 || $banked > 999) {
        json_out(422, ['error' => 'invalid run (name 1-24 chars, score 0-999999, banked 0-999)']);
    }
    $slug = slugify($name);
    $path = scores_dir() . '/' . $slug . '-' . GAME_SLUG . '.json';
    $fh = @fopen($path, 'c+b');
    if ($fh === false) {
        json_out(500, ['error' => 'store unavailable']);
    }
    if (!flock($fh, LOCK_EX)) {
        fclose($fh);
        json_out(500, ['error' => 'store busy']);
    }
    try {
        rewind($fh);
        $data = read_locked($fh);
        $data['name'] = $slug;
        $data['runs'][] = [
            'score' => $score,
            'banked' => $banked,
            'won' => $won,
            'seed' => $seed,
            'ts' => gmdate('c'),
        ];
        $data['runs'] = array_slice($data['runs'], -MAX_RUNS_KEPT);
        $data['best'] = 0;
        foreach ($data['runs'] as $r) {
            $data['best'] = max($data['best'], (int) $r['score']);
        }
        unset($data['reset']);
        atomic_store($path, $data);
        $best = $data['best'];
    } catch (Throwable $e) {
        flock($fh, LOCK_UN);
        fclose($fh);
        json_out(500, ['error' => 'store write failed']);
    }
    flock($fh, LOCK_UN);
    fclose($fh);
    json_out(200, ['ok' => true, 'name' => $slug, 'best' => $best ?? 0]);
}

json_out(405, ['error' => 'method not allowed']);
