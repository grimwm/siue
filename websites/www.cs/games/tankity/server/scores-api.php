<?php
// games/tankity/server/scores-api.php
// Operation Tankity's score endpoint. GET answers a difficulty's board and a
// CSRF token. POST {op: start} opens a solo run on a guard run token; {op:
// round} has the server play the round from the run's stored state; {op: file}
// files the score the server already holds. No score the client sends counts.
// Loaded by scores.php after rooms.php's library; it serves nothing.
declare(strict_types=1);
if (count(get_included_files()) === 1) {
    http_response_code(404);
    exit;
}

use Kit\ScoreGuard;

const SCORES_MAX_BODY = 262144; // a round of SOLO_MAX_SHOTS shots is about 20 KB
const SCORES_MAX_DEPTH = 8; // a round's JSON nests 3 deep
const SOLO_RUN_IDLE = 7200; // a run expires two hours after its last accepted request
const SOLO_RUN_MAX_AGE = 86400; // and a day after it started, at the latest
const SOLO_RUN_FILED_KEEP = 3600; // a filed run answers a repeated filing this long
const SOLO_MAX_LIVE_RUNS = 1000; // live or waiting to file, across the server: about 30 MB of state at most
// Runs one address may hold (live, over or void, not yet expired): a flood from
// one address can neither fill the table nor take every other player's place.
const SOLO_MAX_RUNS_PER_CLIENT = 100;
const SOLO_MAX_PLAYING = 8; // rounds being played at once across the server; past it a round waits (503)
const SOLO_LEASE_SLACK = 30; // seconds a round's lease outlasts its CPU budget, for a slow wall clock
const SOLO_EXPIRE_BATCH = 1000; // runs housekeeping deletes per pass: more than an hour of starts can add
// Per address, unless rounds_per_hour says otherwise. One campus NAT is one
// address, so this is sized for a class, not for one player.
const SOLO_ROUNDS_PER_HOUR = 600;
const SOLO_RUN_ID = '/^[a-f0-9]{32}\z/'; // the guard's run token: 128 random bits

function solo_rounds_per_hour(): int
{
    $raw = trim((string) tankity_setting('TANKITY_ROUNDS_PER_HOUR', 'rounds_per_hour', ''));
    return preg_match('/^\d{1,6}$/', $raw) && (int) $raw > 0 ? (int) $raw : SOLO_ROUNDS_PER_HOUR;
}

function solo_run_row(PDO $db, string $id): ?array
{
    $q = $db->prepare('SELECT * FROM solo_runs WHERE id = ?');
    $q->execute([$id]);
    $row = $q->fetch(PDO::FETCH_ASSOC);
    return is_array($row) ? $row : null;
}

/* The run a request names, or null for no such run (a malformed id included). */
function solo_run_find(mixed $id): ?array
{
    return is_string($id) && preg_match(SOLO_RUN_ID, $id) ? solo_run_row(tankity_db(), $id) : null;
}

function solo_run_expired(array $row, int $now): bool
{
    if ($row['status'] === 'filed') {
        return $now - (int) $row['touched'] > SOLO_RUN_FILED_KEEP;
    }
    return $now - (int) $row['touched'] > SOLO_RUN_IDLE || $now - (int) $row['created'] > SOLO_RUN_MAX_AGE;
}

/* Deletes expired runs, filed runs past their keep included, at most $limit; answers how many. */
function solo_runs_expire(int $now, int $limit = 100): int
{
    return tankity_tx(tankity_db(), function (PDO $db) use ($now, $limit): int {
        $q = $db->prepare("DELETE FROM solo_runs WHERE id IN (SELECT id FROM solo_runs WHERE
            (status <> 'filed' AND (touched < ? OR created < ?)) OR (status = 'filed' AND touched < ?) LIMIT ?)");
        $q->execute([$now - SOLO_RUN_IDLE, $now - SOLO_RUN_MAX_AGE, $now - SOLO_RUN_FILED_KEEP, $limit]);
        return $q->rowCount();
    });
}

/* Runs that still hold a place: live or waiting to file, and not yet expired. */
function solo_runs_live(PDO $db, int $now): int
{
    $q = $db->prepare("SELECT COUNT(*) FROM solo_runs WHERE status IN ('live', 'over') AND touched >= ? AND created >= ?");
    $q->execute([$now - SOLO_RUN_IDLE, $now - SOLO_RUN_MAX_AGE]);
    return (int) $q->fetchColumn();
}

/* The unexpired runs one address holds, void ones included (a filed run holds nothing). */
function solo_runs_of(PDO $db, string $client, int $now): int
{
    $q = $db->prepare("SELECT COUNT(*) FROM solo_runs WHERE client = ? AND status IN ('live', 'over', 'void') AND touched >= ? AND created >= ?");
    $q->execute([$client, $now - SOLO_RUN_IDLE, $now - SOLO_RUN_MAX_AGE]);
    return (int) $q->fetchColumn();
}

/* A void run answers nothing but 'void', so it keeps no state. */
function solo_run_void(string $id, int $now): void
{
    tankity_tx(tankity_db(), function (PDO $db) use ($id, $now): void {
        $db->prepare("UPDATE solo_runs SET status = 'void', state = '{}', touched = ? WHERE id = ? AND status = 'live'")->execute([$now, $id]);
        $db->prepare('UPDATE solo_runs SET playing = 0 WHERE id = ?')->execute([$id]);
    });
}

/* Takes the lease to play round $n of a run: [null, state] when this request
   may play it, else the reply to send. One request plays a round at a time
   (a copy sent meanwhile waits, then gets the stored reply), and at most
   SOLO_MAX_PLAYING rounds play across the server. A request that dies
   mid-round leaves a lease that runs out. */
function solo_run_lease(string $id, int $n, int $now): array
{
    return tankity_tx(tankity_db(), function (PDO $db) use ($id, $n, $now): array {
        $row = solo_run_row($db, $id);
        if ($row === null) {
            return [[404, ['error' => 'no such run']], null];
        }
        if ((int) $row['round'] === $n && $row['reply'] !== '') {
            return [[200, json_decode((string) $row['reply'], true)], null];
        }
        if ($row['status'] !== 'live' || (int) $row['round'] !== $n - 1) {
            return [[409, $row['status'] === 'void' ? ['error' => 'void'] : ['error' => 'out of order', 'round' => (int) $row['round']]], null];
        }
        $busy = $db->prepare('SELECT COUNT(*) FROM solo_runs WHERE playing > ?');
        $busy->execute([$now]);
        if ((int) $row['playing'] > $now || (int) $busy->fetchColumn() >= SOLO_MAX_PLAYING) {
            return [[503, ['error' => 'busy']], null];
        }
        $db->prepare('UPDATE solo_runs SET playing = ? WHERE id = ?')->execute([$now + (int) ceil(solo_round_cpu()) + SOLO_LEASE_SLACK, $id]);
        return [null, (string) $row['state']];
    });
}

function solo_run_release(string $id): void
{
    tankity_tx(tankity_db(), fn(PDO $db) => $db->prepare('UPDATE solo_runs SET playing = 0 WHERE id = ?')->execute([$id]));
}

/* src/solo-log.ts isClaim, with JSON's whole numbers as PHP decodes them. */
function solo_is_claim(mixed $c): bool
{
    if (!is_array($c) || !in_array($c['end'] ?? null, ['roundWon', 'tankLost', 'matchLost'], true)) {
        return false;
    }
    foreach (['score', 'cash', 'lives', 'roundsWon'] as $k) {
        if (!is_int($c[$k] ?? null) || $c[$k] < 0) {
            return false;
        }
    }
    return true;
}

/* Whether the client's claim is the server's, field by field: key order and extra keys never matter. */
function solo_claim_matches(array $server, array $client): bool
{
    foreach ($server as $k => $v) {
        if (($client[$k] ?? null) !== $v) {
            return false;
        }
    }
    return true;
}

function solo_state_encode(array $s): string
{
    // Integral floats stay floats (720.0 is not 720 to the sim's strict comparisons).
    return json_encode($s, JSON_PRESERVE_ZERO_FRACTION | JSON_THROW_ON_ERROR);
}

function solo_state_decode(string $json): array
{
    $s = json_decode($json, true, 512, JSON_THROW_ON_ERROR);
    if (!is_array($s)) {
        throw new UnexpectedValueException('a solo run state is not an object');
    }
    return $s;
}

function tankity_scores_start(array $in, ScoreGuard $guard, int $now): array
{
    $seed = $in['seed'] ?? null;
    $level = board_level($in['difficulty'] ?? null);
    $w = room_field_width($in['w'] ?? null);
    // Printable ASCII only: PHP hashes a seed's bytes and the browser its UTF-16 units.
    if (!is_string($seed) || !preg_match('/^[\x20-\x7e]{1,64}\z/', $seed) || $level === null || $w === null) {
        return [422, ['error' => 'a printable seed, a difficulty (easy, normal, hard) and a field width (720 to 1440, a multiple of 24)']];
    }
    if (stripos(ltrim($seed), 'room:') === 0) {
        return [422, ['error' => 'seeds that begin with room: are reserved for room matches; use another seed']];
    }
    $client = $guard->clientKey();
    return tankity_tx(tankity_db(), function (PDO $db) use ($guard, $now, $level, $seed, $w, $client): array {
        if (solo_runs_live($db, $now) >= SOLO_MAX_LIVE_RUNS) {
            return [503, ['error' => 'busy']];
        }
        if (solo_runs_of($db, $client, $now) >= SOLO_MAX_RUNS_PER_CLIENT) {
            return [429, ['error' => 'rate']];
        }
        $id = $guard->startRun();
        if ($id === null) {
            return [429, ['error' => 'rate']];
        }
        // Dealt only once the start is allowed; the state records the width every round is played at.
        $state = solo_state_encode(solo_deal($seed, $level, $w));
        $db->prepare("INSERT INTO solo_runs (id, difficulty, seed, created, touched, round, status, state, reply, filed, client)
            VALUES (?, ?, ?, ?, ?, 0, 'live', ?, '', '', ?)")->execute([$id, $level, $seed, $now, $now, $state, $client]);
        return [200, ['ok' => true, 'run' => $id]];
    });
}

/* One round: the server plays it from the stored state outside the write lock
   (it can take up to solo_round_cpu()), holding the run's lease, then stores
   the result if the run is still at the round before. One request plays one
   round, and a round stored is never played again. The client's claim must be
   the server's own, or the run is void. $obj is the same body decoded with
   objects, so a JSON object sent where a list belongs is refused as the
   browser's referee refuses it, not read as a list. */
function tankity_scores_round(array $in, object $obj, ScoreGuard $guard, int $now): array
{
    $n = $in['n'] ?? null;
    if (!is_int($n) || $n < 1 || !solo_is_claim($in['claim'] ?? null)) {
        return [400, ['error' => 'invalid json']];
    }
    if (!$guard->rateTake('round', solo_rounds_per_hour())) {
        return [429, ['error' => 'rate']];
    }
    $row = solo_run_find($in['run'] ?? null);
    if ($row === null) {
        return [404, ['error' => 'no such run']];
    }
    if (solo_run_expired($row, $now)) {
        return [410, ['error' => 'expired']];
    }
    if ($row['status'] === 'void') {
        return [409, ['error' => 'void']];
    }
    $id = (string) $row['id'];
    if ((int) $row['round'] === $n && $row['reply'] !== '') {
        return [200, json_decode((string) $row['reply'], true)];
    }
    if ($row['status'] !== 'live' || (int) $row['round'] !== $n - 1) {
        return [409, ['error' => 'out of order', 'round' => (int) $row['round']]];
    }
    [$answer, $stored] = solo_run_lease($id, $n, $now);
    if ($answer !== null) {
        return $answer;
    }
    $buys = is_array($obj->buys ?? null) ? $in['buys'] : null;
    $shots = is_array($obj->shots ?? null) ? $in['shots'] : null;
    try {
        $got = solo_round(solo_state_decode($stored), $buys, $shots, solo_round_cpu());
    } catch (Throwable $e) {
        solo_run_release($id);
        throw $e;
    }
    if (!$got['ok']) {
        solo_run_void($id, $now);
        return [422, ['error' => 'void', 'why' => $got['error']]];
    }
    if (!solo_claim_matches($got['claim'], $in['claim'])) {
        solo_run_void($id, $now);
        return [422, ['error' => 'void', 'why' => 'mismatch', 'server' => $got['claim']]];
    }
    $reply = ['ok' => true, 'n' => $n] + $got['claim'];
    $state = solo_state_encode($got['s']);
    return tankity_tx(tankity_db(), function (PDO $db) use ($id, $n, $got, $reply, $state, $now): array {
        $row = solo_run_row($db, $id);
        if ($row === null || $row['status'] !== 'live' || (int) $row['round'] !== $n - 1) {
            // Another request stored this round (or the run moved on) while this one played it.
            return $row !== null && (int) $row['round'] === $n && $row['reply'] !== ''
                ? [200, json_decode((string) $row['reply'], true)] : [409, ['error' => 'out of order', 'round' => (int) ($row['round'] ?? 0)]];
        }
        $db->prepare('UPDATE solo_runs SET state = ?, round = ?, status = ?, touched = ?, reply = ?, playing = 0 WHERE id = ?')->execute([
            $state, $n, $got['claim']['end'] === 'matchLost' ? 'over' : 'live', $now, json_encode($reply, JSON_UNESCAPED_SLASHES), $id,
        ]);
        return [200, $reply];
    });
}

/* Files a run that is over, at the score the server played it to. A filing
   asked again (its reply lost) answers the stored reply, without spending
   anything. The guard's token is spent inside the write transaction, after the
   lock is held, so a busy database refuses the filing before the token goes. */
function tankity_scores_file(array $in, ScoreGuard $guard, int $now): array
{
    $initials = tankity_initials($guard, $in['initials'] ?? null);
    if ($initials === null) {
        return [422, ['error' => 'initials must be 3 letters, kept clean']];
    }
    $row = solo_run_find($in['run'] ?? null);
    if ($row === null) {
        return [404, ['error' => 'no such run']];
    }
    if (solo_run_expired($row, $now)) {
        return [410, ['error' => 'expired']];
    }
    if ($row['status'] === 'filed') {
        return [200, json_decode((string) $row['filed'], true)];
    }
    if ($row['status'] === 'void') {
        return [409, ['error' => 'void']];
    }
    if ($row['status'] === 'live') {
        return [409, ['error' => 'the run is not over']];
    }
    $id = (string) $row['id'];
    return tankity_tx(tankity_db(), function (PDO $db) use ($id, $initials, $guard, $now): array {
        $row = solo_run_row($db, $id);
        if ($row === null) {
            return [404, ['error' => 'no such run']];
        }
        if ($row['status'] === 'filed') {
            return [200, json_decode((string) $row['filed'], true)];
        }
        if ($row['status'] !== 'over') {
            return [409, ['error' => $row['status'] === 'void' ? 'void' : 'the run is not over']];
        }
        $problem = $guard->consumeRun($id);
        if ($problem !== null) {
            return $problem === 'rate' ? [429, ['error' => 'rate']] : [400, ['error' => $problem]];
        }
        $s = solo_state_decode((string) $row['state']);
        $score = (int) $s['scores'][0];
        $won = (int) $s['roundsWon'];
        $rank = board_file(['difficulty' => $row['difficulty'], 'initials' => $initials, 'score' => $score, 'rounds' => $won,
            'seed' => $row['seed'], 'source' => 'solo']);
        $reply = ['ok' => true, 'score' => $score, 'roundsWon' => $won, 'rank' => $rank, 'difficulty' => $row['difficulty']];
        $db->prepare("UPDATE solo_runs SET status = 'filed', touched = ?, filed = ?, state = '{}' WHERE id = ?")
            ->execute([$now, json_encode($reply, JSON_UNESCAPED_SLASHES), $id]);
        return [200, $reply];
    });
}

/* The request: [status, payload]. $raw is the body, read at most
   SCORES_MAX_BODY + 1 bytes by the caller. */
function tankity_scores_handle(string $method, array $query, string $raw, ScoreGuard $guard, int $now): array
{
    if ($method === 'GET') {
        $level = board_level($query['difficulty'] ?? 'normal');
        if ($level === null) {
            return [422, ['error' => 'difficulty must be easy, normal or hard']];
        }
        // The shape src/scores.ts reads. Never the seed: a room row's is the code of a room that may still be playing.
        $rows = array_map(fn(array $r): array => ['name' => $r['initials'], 'best' => $r['score'], 'banked' => $r['rounds'],
            'won' => false, 'place' => $r['place'], 'at' => $r['at'], 'standin' => $r['standin']], board_top($level, BOARD_SHOW));
        return [200, ['difficulty' => $level, 'scores' => $rows, 'keep' => BOARD_KEEP, 'csrf' => $guard->csrfToken()]];
    }
    if ($method !== 'POST') {
        return [405, ['error' => 'method not allowed']];
    }
    $type = (string) ($_SERVER['CONTENT_TYPE'] ?? $_SERVER['HTTP_CONTENT_TYPE'] ?? '');
    if (stripos($type, 'application/json') !== 0 || !$guard->originAllowed() || !$guard->csrfOk()) {
        return [403, ['error' => 'forbidden']];
    }
    // The declared length first: the caller then reads no more than the cap.
    if ((int) ($_SERVER['CONTENT_LENGTH'] ?? 0) > SCORES_MAX_BODY || strlen($raw) > SCORES_MAX_BODY) {
        return [413, ['error' => 'too large']];
    }
    $in = json_decode($raw, true, SCORES_MAX_DEPTH);
    $obj = json_decode($raw, false, SCORES_MAX_DEPTH);
    if (!is_array($in) || !is_object($obj)) {
        return [400, ['error' => 'invalid json']];
    }
    return match ($in['op'] ?? null) {
        'start' => tankity_scores_start($in, $guard, $now),
        'round' => tankity_scores_round($in, $obj, $guard, $now),
        'file' => tankity_scores_file($in, $guard, $now),
        default => [400, ['error' => 'invalid json']],
    };
}
