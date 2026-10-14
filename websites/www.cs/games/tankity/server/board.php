<?php
// games/tankity/server/board.php
// Operation Tankity's online boards, one per difficulty: room matches two or
// more humans played, rows in the board table, best first, ties to the older
// run, the best BOARD_KEEP kept per board. Loaded by rooms.php (scores.php
// loads it through rooms.php); it serves nothing.
declare(strict_types=1);
if (count(get_included_files()) === 1) {
    http_response_code(404);
    exit;
}
require_once __DIR__ . '/db.php';

const BOARD_LEVELS = ['easy', 'normal', 'hard']; // server/ai.php ROOM_DIFFICULTY's levels
const BOARD_KEEP = 100;
const BOARD_SHOW = 20;
// Who filed a row: only the room server, from a match, files.
const BOARD_SOURCES = ['room'];

function board_level(mixed $raw): ?string
{
    return is_string($raw) && in_array($raw, BOARD_LEVELS, true) ? $raw : null;
}

/* Files a run on its difficulty's board: its 1-based place, or null when it
   did not make the best BOARD_KEEP of its board. A run must name its source
   (BOARD_SOURCES). */
function board_file(array $run): ?int
{
    $level = board_level($run['difficulty'] ?? null);
    if ($level === null) {
        throw new InvalidArgumentException('no such board: ' . var_export($run['difficulty'] ?? null, true));
    }
    $source = $run['source'] ?? null;
    if (!in_array($source, BOARD_SOURCES, true)) {
        throw new InvalidArgumentException('no such source: ' . var_export($source, true));
    }
    return tankity_tx(tankity_db(), function (PDO $db) use ($run, $level, $source): ?int {
        $db->prepare('INSERT INTO board (difficulty, initials, score, rounds, seed, at, source) VALUES (?, ?, ?, ?, ?, ?, ?)')->execute([
            $level, (string) $run['initials'], (int) $run['score'], (int) $run['rounds'],
            substr((string) $run['seed'], 0, 64), (string) ($run['at'] ?? gmdate('c')), $source,
        ]);
        $id = (int) $db->lastInsertId();
        $q = $db->prepare('SELECT COUNT(*) FROM board WHERE difficulty = ? AND (score > ? OR (score = ? AND id < ?))');
        $q->execute([$level, (int) $run['score'], (int) $run['score'], $id]);
        $place = (int) $q->fetchColumn() + 1;
        $db->prepare('DELETE FROM board WHERE difficulty = ? AND id NOT IN
            (SELECT id FROM board WHERE difficulty = ? ORDER BY score DESC, id LIMIT ?)')->execute([$level, $level, BOARD_KEEP]);
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
