<?php
// games/tankity/server/scores-api.php
// Operation Tankity's score endpoint. GET answers a difficulty's board and a
// CSRF token. POST {op: start} opens a solo run; {op: round} has the server
// play the round from the run's stored state; {op: file} files the score the
// server already holds. No score the client sends counts.
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
// A run with no round played yet expires sooner: the browser starts one only
// when it has a round to send, so a run left unplayed is a start nobody uses.
const SOLO_RUN_UNPLAYED_IDLE = 900;
const SOLO_RUN_MAX_AGE = 86400; // and a day after it started, at the latest
const SOLO_RUN_FILED_KEEP = 3600; // a filed run answers a repeated filing this long
const SOLO_LEASE_SLACK = 30; // seconds a round's lease outlasts its CPU budget, for a slow wall clock
// Rows housekeeping deletes per pass (one a minute): a thousand addresses
// each starting runs as fast as SOLO_STARTS_PER_HOUR allows add 120000 run rows
// an hour and 24000 count rows (one a ten-minute slot for each of the three
// solo caps and the rooms'), and every pass is bounded by rows, not time.
const SOLO_EXPIRE_BATCH = 2500;
// Of those, runs that still hold state (tens of KB each at the widest field):
// fewer a pass, so freeing their pages never holds the write lock for long.
// Every place still frees within the hour.
const SOLO_EXPIRE_PLAYED_BATCH = 250;
const SOLO_RATE_EXPIRE_BATCH = 5000;
// The hourly caps count in slots of this many seconds, and a check sums the
// last hour's slots and the one it began in: never more than the cap in any
// hour, and an allowance spent all at once comes back at most one slot late.
const SOLO_RATE_SLOT = 600;
const SOLO_RUN_ID = '/^[a-f0-9]{32}\z/'; // a run's id: 128 random bits, and the only key to it
// The defaults of the settings below. Every cap but the play slots is per
// address, and one campus NAT is one address, so they are sized for a class.
const SOLO_STARTS_PER_HOUR = 120;
const SOLO_ROUNDS_PER_HOUR = 600;
const SOLO_SCORES_PER_HOUR = 240;
// Runs past their first round (live or waiting to file) hold a place, across
// the server and per address: filling every place takes SOLO_MAX_HELD /
// SOLO_HELD_PER_CLIENT addresses, while one campus NAT still fits a full lab.
// A played run's state is up to about 27 KB. A run not yet played holds no
// state and no place.
const SOLO_MAX_HELD = 3000; // about 86 MB of played runs at the widest field
const SOLO_HELD_PER_CLIENT = 30; // a 30-seat lab behind one address
// Runs one address may hold (unplayed, live, over or void, not yet expired):
// a flood from one address can neither fill the table nor take every other
// player's place.
const SOLO_RUNS_PER_CLIENT = 100;
// Rounds played at once across the server, past which a round waits (503):
// about the host's cores, which only its operator knows. One address may hold
// SOLO_PLAYING_PER_CLIENT of them, so it cannot take them all.
const SOLO_MAX_PLAYING = 8;
const SOLO_PLAYING_PER_CLIENT = 4;
// Rooms created and joined, together, by one address an hour: a class behind
// one campus NAT hosting and joining all evening fits; a script minting rooms
// and seats does not.
const ROOM_JOINS_PER_HOUR = 300;

/* A positive whole-number setting, or $default when it is unset. A value set
   but refused is logged once (naming the setting and the value), then the
   default is used. */
function solo_setting(string $env, string $key, int $default): int
{
    static $logged = [];
    $set = tankity_setting($env, $key, '');
    $raw = trim(is_scalar($set) ? (string) $set : '');
    if (preg_match('/^\d{1,6}$/', $raw) && (int) $raw > 0) {
        return (int) $raw;
    }
    if ($raw !== '' || !is_scalar($set)) {
        $shown = is_scalar($set) ? var_export(substr($raw, 0, 40), true) : get_debug_type($set);
        if (!isset($logged[$key][$shown])) {
            $logged[$key][$shown] = true;
            error_log("tankity setting $key ($env): refused $shown, not a whole number from 1 to 999999; using $default");
        }
    }
    return $default;
}

function solo_starts_per_hour(): int
{
    return solo_setting('TANKITY_STARTS_PER_HOUR', 'starts_per_hour', SOLO_STARTS_PER_HOUR);
}

function solo_rounds_per_hour(): int
{
    return solo_setting('TANKITY_ROUNDS_PER_HOUR', 'rounds_per_hour', SOLO_ROUNDS_PER_HOUR);
}

function solo_scores_per_hour(): int
{
    return solo_setting('TANKITY_SCORES_PER_HOUR', 'scores_per_hour', SOLO_SCORES_PER_HOUR);
}

function solo_runs_per_client(): int
{
    return solo_setting('TANKITY_RUNS_PER_CLIENT', 'runs_per_client', SOLO_RUNS_PER_CLIENT);
}

function solo_max_playing(): int
{
    return solo_setting('TANKITY_MAX_PLAYING', 'max_playing', SOLO_MAX_PLAYING);
}

function solo_playing_per_client(): int
{
    return solo_setting('TANKITY_PLAYING_PER_CLIENT', 'playing_per_client', SOLO_PLAYING_PER_CLIENT);
}

function solo_max_held(): int
{
    return solo_setting('TANKITY_MAX_HELD', 'max_held', SOLO_MAX_HELD);
}

function solo_held_per_client(): int
{
    return solo_setting('TANKITY_HELD_PER_CLIENT', 'held_per_client', SOLO_HELD_PER_CLIENT);
}

function room_joins_per_hour(): int
{
    return solo_setting('TANKITY_ROOM_JOINS_PER_HOUR', 'room_joins_per_hour', ROOM_JOINS_PER_HOUR);
}

/* How much of its $kind allowance an address ($client, the guard's key) has
   used in the last hour: the counts of the slots that hour touches, the slot
   it began in counted whole. So no hour holds more than the cap, and an
   allowance spent at once comes back at most SOLO_RATE_SLOT seconds after the
   hour. Seven indexed rows at most. */
function solo_rate_used(PDO $db, string $client, string $kind, int $now): int
{
    $q = $db->prepare('SELECT COALESCE(SUM(n), 0) FROM solo_rate WHERE client = ? AND kind = ? AND slot >= ?');
    $q->execute([$client, $kind, intdiv($now - 3600, SOLO_RATE_SLOT)]);
    return (int) $q->fetchColumn();
}

/* Takes one of an address's $perHour $kind slots inside the caller's write
   transaction, so a rollback gives it back; false, and nothing taken, when
   they are spent. */
function solo_rate_take(PDO $db, string $client, string $kind, int $perHour, int $now): bool
{
    if (solo_rate_used($db, $client, $kind, $now) >= $perHour) {
        return false;
    }
    $db->prepare('INSERT INTO solo_rate (client, kind, slot, n) VALUES (?, ?, ?, 1)
        ON CONFLICT (client, kind, slot) DO UPDATE SET n = n + 1')->execute([$client, $kind, intdiv($now, SOLO_RATE_SLOT)]);
    return true;
}

/* Takes one of an address's room_joins_per_hour() creates and joins, in its
   own write transaction; false, and nothing taken, when they are spent. */
function room_rate_take(string $client, int $now): bool
{
    $perHour = room_joins_per_hour();
    return tankity_tx(tankity_db(), fn(PDO $db): bool => solo_rate_take($db, $client, 'room', $perHour, $now));
}

/* Deletes counts too old to matter, at most $limit; answers how many. */
function solo_rate_expire(int $now, int $limit = SOLO_RATE_EXPIRE_BATCH): int
{
    return tankity_tx(tankity_db(), function (PDO $db) use ($now, $limit): int {
        $q = $db->prepare('DELETE FROM solo_rate WHERE rowid IN (SELECT rowid FROM solo_rate WHERE slot < ? LIMIT ?)');
        $q->execute([intdiv($now - 3600, SOLO_RATE_SLOT), $limit]);
        return $q->rowCount();
    });
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
    $idle = $row['status'] === 'live' && (int) $row['round'] === 0 ? SOLO_RUN_UNPLAYED_IDLE : SOLO_RUN_IDLE;
    return $now - (int) $row['touched'] > $idle || $now - (int) $row['created'] > SOLO_RUN_MAX_AGE;
}

/* Deletes expired runs, filed runs past their keep included: at most
   $playedLimit that still hold state (past round 0, live or over) and at most
   $limit others; answers how many. A run whose round is being played is never
   deleted: its lease runs out first. */
function solo_runs_expire(int $now, int $limit = SOLO_EXPIRE_BATCH, int $playedLimit = SOLO_EXPIRE_PLAYED_BATCH): int
{
    return tankity_tx(tankity_db(), function (PDO $db) use ($now, $limit, $playedLimit): int {
        $gone = 0;
        foreach (['', 'NOT '] as $i => $not) {
            $q = $db->prepare("DELETE FROM solo_runs WHERE id IN (SELECT id FROM solo_runs WHERE playing <= ? AND (
                (status <> 'filed' AND (touched < ? OR created < ?)) OR (status = 'filed' AND touched < ?)
                OR (status = 'live' AND round = 0 AND touched < ?)) AND {$not}(round > 0 AND status IN ('live', 'over')) LIMIT ?)");
            $q->execute([$now, $now - SOLO_RUN_IDLE, $now - SOLO_RUN_MAX_AGE, $now - SOLO_RUN_FILED_KEEP, $now - SOLO_RUN_UNPLAYED_IDLE,
                $i === 0 ? $playedLimit : $limit]);
            $gone += $q->rowCount();
        }
        return $gone;
    });
}

/* The count of played runs holding a place, answered from a covering index
   (solo_runs_held, or solo_runs_held_by for one address). */
function solo_runs_held_sql(bool $perClient): string
{
    return "SELECT COUNT(*) FROM solo_runs WHERE round > 0 AND status IN ('live', 'over') AND touched >= ? AND created >= ?"
        . ($perClient ? ' AND client = ?' : '');
}

/* Runs that hold a place: past their first round (or playing it), live or
   waiting to file, and not yet expired; across the server, or those one
   address ($client) started. */
function solo_runs_held(PDO $db, int $now, ?string $client = null): int
{
    $who = $client === null ? '' : ' AND client = ?';
    $args = $client === null ? [] : [$client];
    $played = $db->prepare(solo_runs_held_sql($client !== null));
    $played->execute([$now - SOLO_RUN_IDLE, $now - SOLO_RUN_MAX_AGE, ...$args]);
    $first = $db->prepare("SELECT COUNT(*) FROM solo_runs WHERE playing > ? AND round = 0$who");
    $first->execute([$now, ...$args]);
    return (int) $played->fetchColumn() + (int) $first->fetchColumn();
}

/* The unexpired runs one address holds, void ones included (a filed run holds nothing). */
function solo_runs_of(PDO $db, string $client, int $now): int
{
    $q = $db->prepare("SELECT COUNT(*) FROM solo_runs WHERE client = ? AND status IN ('live', 'over', 'void') AND created >= ?
        AND touched >= CASE WHEN status = 'live' AND round = 0 THEN ? ELSE ? END");
    $q->execute([$client, $now - SOLO_RUN_MAX_AGE, $now - SOLO_RUN_UNPLAYED_IDLE, $now - SOLO_RUN_IDLE]);
    return (int) $q->fetchColumn();
}

/* The reply for a round this request played after the run moved past it:
   the stored reply when another copy stored round $n, else out of order. */
function solo_run_moved_on(?array $row, int $n): array
{
    return $row !== null && (int) $row['round'] === $n && $row['reply'] !== ''
        ? [200, json_decode((string) $row['reply'], true)] : [409, ['error' => 'out of order', 'round' => (int) ($row['round'] ?? 0)]];
}

/* Voids a run the referee refused at round $n, if it is still at the round
   before, giving back this request's lease ($lease) and no other: null when
   voided (a void run answers nothing but 'void', so it keeps no state), else
   the reply for a run that moved on. */
function solo_run_void(string $id, int $n, int $lease, int $now): ?array
{
    return tankity_tx(tankity_db(), function (PDO $db) use ($id, $n, $lease, $now): ?array {
        $db->prepare('UPDATE solo_runs SET playing = 0 WHERE id = ? AND playing = ?')->execute([$id, $lease]);
        $q = $db->prepare("UPDATE solo_runs SET status = 'void', state = '{}', touched = ? WHERE id = ? AND status = 'live' AND round = ?");
        $q->execute([$now, $id, $n - 1]);
        return $q->rowCount() === 1 ? null : solo_run_moved_on(solo_run_row($db, $id), $n);
    });
}

/* Takes the lease to play round $n of a run for the address $client:
   [null, row, lease] when this request may play it, else [reply, null, 0].
   One request plays a round at a time (a copy sent meanwhile waits, then gets
   the stored reply); at most solo_max_playing() rounds play across the server
   and solo_playing_per_client() for one address. A first round also needs a
   place: one of solo_max_held() (503 past it) and one of the
   solo_held_per_client() of the address that started the run (429). Only then
   is the round charged to the address. A request that dies mid-round leaves a
   lease that runs out. */
function solo_run_lease(string $id, int $n, string $client, int $now): array
{
    return tankity_tx(tankity_db(), function (PDO $db) use ($id, $n, $client, $now): array {
        $row = solo_run_row($db, $id);
        if ($row === null) {
            return [[404, ['error' => 'no such run']], null, 0];
        }
        if ((int) $row['round'] === $n && $row['reply'] !== '') {
            return [[200, json_decode((string) $row['reply'], true)], null, 0];
        }
        if ($row['status'] !== 'live' || (int) $row['round'] !== $n - 1) {
            return [[409, $row['status'] === 'void' ? ['error' => 'void'] : ['error' => 'out of order', 'round' => (int) $row['round']]], null, 0];
        }
        $busy = $db->prepare('SELECT COUNT(*), COALESCE(SUM(lessee = ?), 0) FROM solo_runs WHERE playing > ?');
        $busy->execute([$client, $now]);
        [$playing, $mine] = array_map('intval', $busy->fetch(PDO::FETCH_NUM));
        if ((int) $row['playing'] > $now || $playing >= solo_max_playing() || $mine >= solo_playing_per_client()
            || ($n === 1 && solo_runs_held($db, $now) >= solo_max_held())) {
            return [[503, ['error' => 'busy']], null, 0];
        }
        if (($n === 1 && solo_runs_held($db, $now, (string) $row['client']) >= solo_held_per_client())
            || !solo_rate_take($db, $client, 'round', solo_rounds_per_hour(), $now)) {
            return [[429, ['error' => 'rate']], null, 0];
        }
        $lease = $now + (int) ceil(solo_round_cpu()) + SOLO_LEASE_SLACK;
        $db->prepare('UPDATE solo_runs SET playing = ?, lessee = ? WHERE id = ?')->execute([$lease, $client, $id]);
        return [null, $row, $lease];
    });
}

/* Gives back a lease this request still holds; one that ran out and was
   taken by another request is that request's. */
function solo_run_release(string $id, int $lease): void
{
    tankity_tx(tankity_db(), fn(PDO $db) => $db->prepare('UPDATE solo_runs SET playing = 0 WHERE id = ? AND playing = ?')->execute([$id, $lease]));
}

/* Stores round $n as played ($got from solo_round) if the run is still at the
   round before, giving back this request's lease ($lease) and no other. */
function solo_run_store(string $id, int $n, int $lease, array $got, int $now): array
{
    $reply = ['ok' => true, 'n' => $n] + $got['claim'];
    $state = solo_state_encode($got['s']);
    return tankity_tx(tankity_db(), function (PDO $db) use ($id, $n, $lease, $got, $reply, $state, $now): array {
        $row = solo_run_row($db, $id);
        if ($row === null || $row['status'] !== 'live' || (int) $row['round'] !== $n - 1) {
            // Another request stored this round (or the run moved on) while this one played it.
            return solo_run_moved_on($row, $n);
        }
        $db->prepare('UPDATE solo_runs SET state = ?, round = ?, status = ?, touched = ?, reply = ?,
            playing = CASE WHEN playing = ? THEN 0 ELSE playing END WHERE id = ?')->execute([
            $state, $n, $got['claim']['end'] === 'matchLost' ? 'over' : 'live', $now, json_encode($reply, JSON_UNESCAPED_SLASHES), $lease, $id,
        ]);
        return [200, $reply];
    });
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

/* Opens a run: its seed, difficulty and width, and no state; round 1 deals it
   (solo_deal is deterministic). A start is turned away while its first round
   could not be played anyway, so the browser keeps the run instead of opening
   one here that would expire unplayed. */
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
    return tankity_tx(tankity_db(), function (PDO $db) use ($now, $level, $seed, $w, $client): array {
        if (solo_runs_held($db, $now) >= solo_max_held()) {
            return [503, ['error' => 'busy']];
        }
        if (solo_runs_held($db, $now, $client) >= solo_held_per_client()
            || solo_rate_used($db, $client, 'round', $now) >= solo_rounds_per_hour()
            || solo_runs_of($db, $client, $now) >= solo_runs_per_client()
            || !solo_rate_take($db, $client, 'start', solo_starts_per_hour(), $now)) {
            return [429, ['error' => 'rate']];
        }
        $id = bin2hex(random_bytes(16));
        $db->prepare("INSERT INTO solo_runs (id, difficulty, seed, w, created, touched, round, status, state, reply, filed, client)
            VALUES (?, ?, ?, ?, ?, ?, 0, 'live', '', '', '', ?)")->execute([$id, $level, $seed, $w, $now, $now, $client]);
        return [200, ['ok' => true, 'run' => $id]];
    });
}

/* One round: the server plays it from the stored state (round 1 deals it
   first) outside the write lock, holding the run's lease, then stores the
   result if the run is still at the round before. The run is found before
   anything is charged, so an id that names no run costs nothing. One request
   plays one round, and a round stored is never played again. The client's
   claim must be the server's own, or the run is void. $obj is the same body
   decoded with objects, so a JSON object sent where a list belongs is refused
   as the browser's referee refuses it, not read as a list. */
function tankity_scores_round(array $in, object $obj, ScoreGuard $guard, int $now): array
{
    $n = $in['n'] ?? null;
    if (!is_int($n) || $n < 1 || !solo_is_claim($in['claim'] ?? null)) {
        return [400, ['error' => 'invalid json']];
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
    [$answer, $row, $lease] = solo_run_lease($id, $n, $guard->clientKey(), $now);
    if ($answer !== null) {
        return $answer;
    }
    $buys = is_array($obj->buys ?? null) ? $in['buys'] : null;
    $shots = is_array($obj->shots ?? null) ? $in['shots'] : null;
    try {
        $s = $n === 1 ? solo_deal((string) $row['seed'], (string) $row['difficulty'], (int) $row['w']) : solo_state_decode((string) $row['state']);
        $got = solo_round($s, $buys, $shots, solo_round_cpu());
        if (!$got['ok']) {
            return solo_run_void($id, $n, $lease, $now) ?? [422, ['error' => 'void', 'why' => $got['error']]];
        }
        if (!solo_claim_matches($got['claim'], $in['claim'])) {
            return solo_run_void($id, $n, $lease, $now) ?? [422, ['error' => 'void', 'why' => 'mismatch', 'server' => $got['claim']]];
        }
        return solo_run_store($id, $n, $lease, $got, $now);
    } catch (Throwable $e) {
        // Whatever failed, the run waits for the round to be sent again, not for its lease to run out.
        // A release that fails too is logged; the caller sees what failed first.
        try {
            solo_run_release($id, $lease);
        } catch (Throwable $released) {
            error_log('tankity scores: releasing a lease after a failed round: ' . $released->getMessage());
        }
        throw $e;
    }
}

/* Files a run that is over, at the score the server played it to. A filing
   asked again (its reply lost) answers the stored reply, without spending
   anything. The run is its own single-use token: 'over' becomes 'filed' in
   the same transaction as the board row and the filing's charge to the
   address, so a filing that fails anywhere takes all three back and can be
   sent again. */
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
    $client = $guard->clientKey();
    return tankity_tx(tankity_db(), function (PDO $db) use ($id, $initials, $client, $now): array {
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
        if (!solo_rate_take($db, $client, 'score', solo_scores_per_hour(), $now)) {
            return [429, ['error' => 'rate']];
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
