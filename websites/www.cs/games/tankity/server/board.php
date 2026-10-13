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
   did not make the best BOARD_KEEP. A board never holds more than that. */
function board_file(array $run): ?int
{
    $level = board_level($run['difficulty'] ?? null);
    if ($level === null) {
        throw new InvalidArgumentException('no such board: ' . var_export($run['difficulty'] ?? null, true));
    }
    return tankity_tx(tankity_db(), function (PDO $db) use ($run, $level): ?int {
        $db->prepare('INSERT INTO board (difficulty, initials, score, rounds, seed, at) VALUES (?, ?, ?, ?, ?, ?)')->execute([
            $level, (string) $run['initials'], (int) $run['score'], (int) $run['rounds'],
            substr((string) $run['seed'], 0, 64), (string) ($run['at'] ?? gmdate('c')),
        ]);
        $id = (int) $db->lastInsertId();
        $q = $db->prepare('SELECT COUNT(*) FROM board WHERE difficulty = ? AND (score > ? OR (score = ? AND id < ?))');
        $q->execute([$level, (int) $run['score'], (int) $run['score'], $id]);
        $place = (int) $q->fetchColumn() + 1;
        $db->prepare('DELETE FROM board WHERE difficulty = ? AND id NOT IN
            (SELECT id FROM board WHERE difficulty = ? ORDER BY score DESC, id LIMIT ?)')->execute([$level, $level, BOARD_KEEP]);
        return $place <= BOARD_KEEP ? $place : null;
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

/* Moves up to $limit per-callsign rows onto the Normal board (the only level
   there was): each callsign's best run, its name converted, the row deleted in
   the same transaction, so nothing is converted twice. Answers the rows moved. */
function board_convert_callsigns(int $limit = 200): int
{
    $guard = tankity_guard();
    $q = tankity_db()->prepare('SELECT slug FROM callsigns ORDER BY slug LIMIT ?');
    $q->execute([$limit]);
    $moved = 0;
    foreach ($q->fetchAll(PDO::FETCH_COLUMN) as $slug) {
        tankity_tx(tankity_db(), function (PDO $db) use ($slug, $guard, &$moved): void {
            $d = legacy_read($db, (string) $slug);
            $best = null;
            foreach ($d['runs'] as $r) {
                if (is_array($r) && isset($r['score']) && ($best === null || (int) $r['score'] > (int) $best['score'])) {
                    $best = $r;
                }
            }
            if ($best !== null) {
                board_file(['difficulty' => 'normal', 'initials' => board_convert_name((string) $slug, $guard),
                    'score' => max(0, (int) $best['score']), 'rounds' => max(0, (int) ($best['banked'] ?? 0)),
                    'seed' => (string) ($best['seed'] ?? ''), 'at' => (string) ($best['ts'] ?? '')]);
            }
            $db->prepare('DELETE FROM callsigns WHERE slug = ?')->execute([$slug]);
            $moved++;
        });
    }
    return $moved;
}
