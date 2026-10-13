<?php
// games/tankity/server/board.php
// Operation Tankity's all-time boards, one per difficulty: rows in the board
// table, best first, ties to the older run, the best BOARD_KEEP kept per
// board. Also moves the per-callsign rows from before the boards onto the
// Normal board. Loaded by rooms.php and scores.php; it serves nothing.
declare(strict_types=1);
if (count(get_included_files()) === 1) {
    http_response_code(404);
    exit;
}
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/guard.php';
require_once __DIR__ . '/legacy.php';

use Kit\ScoreGuard;

const BOARD_LEVELS = ['easy', 'normal', 'hard']; // server/ai.php ROOM_DIFFICULTY's levels
const BOARD_KEEP = 100;
const BOARD_SHOW = 20;
const BOARD_STANDIN = 'AAA'; // what a converted name the blocklist refuses becomes

function board_level(mixed $raw): ?string
{
    return is_string($raw) && in_array($raw, BOARD_LEVELS, true) ? $raw : null;
}

/* An old free-text callsign as board initials: the kit guard's coercion
   (letters uppercased, the rest dropped, cut or padded with X to three), and
   the stand-in for a set the guard blocks. */
function board_convert_name(string $name, ScoreGuard $guard): string
{
    $three = ScoreGuard::coerceInitials($name, 'X');
    return $guard->isBlocked($three) ? BOARD_STANDIN : $three;
}

/* Files a run on its difficulty's board: its 1-based place, or null when it
   did not make the best BOARD_KEEP of its source. A run's source is 'room' (the
   server filed it from a match; the default) or 'client' (a browser's own
   claim). Each source keeps its own best BOARD_KEEP, so no number of client
   rows can push a room row off; the view ranks both together. */
function board_file(array $run): ?int
{
    $level = board_level($run['difficulty'] ?? null);
    if ($level === null) {
        throw new InvalidArgumentException('no such board: ' . var_export($run['difficulty'] ?? null, true));
    }
    $source = ($run['source'] ?? 'room') === 'client' ? 'client' : 'room';
    return tankity_tx(tankity_db(), function (PDO $db) use ($run, $level, $source): ?int {
        $db->prepare('INSERT INTO board (difficulty, initials, score, rounds, seed, at, source) VALUES (?, ?, ?, ?, ?, ?, ?)')->execute([
            $level, (string) $run['initials'], (int) $run['score'], (int) $run['rounds'],
            substr((string) $run['seed'], 0, 64), (string) ($run['at'] ?? gmdate('c')), $source,
        ]);
        $id = (int) $db->lastInsertId();
        $q = $db->prepare('SELECT COUNT(*) FROM board WHERE difficulty = ? AND (score > ? OR (score = ? AND id < ?))');
        $q->execute([$level, (int) $run['score'], (int) $run['score'], $id]);
        $place = (int) $q->fetchColumn() + 1;
        $db->prepare('DELETE FROM board WHERE difficulty = ? AND source = ? AND id NOT IN
            (SELECT id FROM board WHERE difficulty = ? AND source = ? ORDER BY score DESC, id LIMIT ?)')->execute([$level, $source, $level, $source, BOARD_KEEP]);
        $kept = $db->prepare('SELECT COUNT(*) FROM board WHERE id = ?');
        $kept->execute([$id]);
        return (int) $kept->fetchColumn() === 1 ? $place : null;
    });
}

/* A board's best $n runs with their places. */
function board_top(string $difficulty, int $n): array
{
    $q = tankity_db()->prepare('SELECT initials, score, rounds, seed, at FROM board WHERE difficulty = ? ORDER BY score DESC, id LIMIT ?');
    $q->execute([$difficulty, $n]);
    $out = [];
    foreach ($q->fetchAll(PDO::FETCH_ASSOC) as $i => $r) {
        $out[] = ['initials' => (string) $r['initials'], 'score' => (int) $r['score'], 'rounds' => (int) $r['rounds'],
            'seed' => (string) $r['seed'], 'at' => (string) $r['at'], 'place' => $i + 1];
    }
    return $out;
}

/* Whether a run is already on the Normal board: the same converted name, score,
   rounds, seed and date. A rewritten old file brings its old runs back; this is
   how an import tells the ones already converted. */
function board_has_run(string $initials, array $run): bool
{
    $q = tankity_db()->prepare("SELECT 1 FROM board WHERE difficulty = 'normal' AND initials = ? AND score = ? AND rounds = ? AND seed = ? AND at = ?");
    $q->execute([$initials, max(0, (int) ($run['score'] ?? 0)), max(0, (int) ($run['banked'] ?? 0)),
        (string) ($run['seed'] ?? ''), (string) ($run['ts'] ?? '')]);
    return $q->fetchColumn() !== false;
}

/* The highest-scoring readable run of a callsign's data, or null. */
function board_best_run(array $d): ?array
{
    $best = null;
    foreach ($d['runs'] as $r) {
        if (is_array($r) && isset($r['score']) && ($best === null || (int) $r['score'] > (int) $best['score'])) {
            $best = $r;
        }
    }
    return $best;
}

/* Moves up to $limit per-callsign rows onto the Normal board (the only level
   there was): each callsign's best run, its name converted, the row deleted in
   the same transaction, so nothing is converted twice. Older runs go first, so
   equal scores keep the board's older-run-ahead order. Answers the rows moved. */
function board_convert_callsigns(int $limit = 200): int
{
    $guard = tankity_guard();
    $order = [];
    foreach (tankity_db()->query('SELECT slug FROM callsigns')->fetchAll(PDO::FETCH_COLUMN) as $slug) {
        $order[(string) $slug] = (string) (board_best_run(legacy_read(tankity_db(), (string) $slug))['ts'] ?? '');
    }
    uksort($order, fn($a, $b) => [$order[$a], $a] <=> [$order[$b], $b]);
    $moved = 0;
    foreach (array_slice(array_keys($order), 0, $limit) as $slug) {
        tankity_tx(tankity_db(), function (PDO $db) use ($slug, $guard, &$moved): void {
            $d = legacy_read($db, (string) $slug);
            $best = board_best_run($d);
            if ($best === null) {
                error_log("tankity board: callsign $slug has no readable run; dropped");
            } else {
                board_file(['difficulty' => 'normal', 'initials' => board_convert_name((string) $slug, $guard),
                    'score' => max(0, (int) $best['score']), 'rounds' => max(0, (int) ($best['banked'] ?? 0)),
                    'seed' => (string) ($best['seed'] ?? ''), 'at' => (string) ($best['ts'] ?? '') ?: gmdate('c')]);
            }
            $db->prepare('DELETE FROM callsigns WHERE slug = ?')->execute([$slug]);
            $moved++;
        });
    }
    return $moved;
}
