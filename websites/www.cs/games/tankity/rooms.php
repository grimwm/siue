<?php
// Operation Tankity: game rooms. Friends play together; the server referees.
// No chat channel exists anywhere, names are 3-letter initials only, and the
// obscenity rule mirrors the cylon game (shared BLOCKED_INITIALS philosophy:
// an exact-3 uppercase set, enforced here AND in the browser).
//
// Anti-cheat model (server authority, no trust in the client):
//   - Clients send INTENTS only (aim/fire/drive/weapon/buy). They never send
//     hit info, damage, positions, or scores; every impact is simulated here.
//   - The terrain seed never leaves the server. Clients receive the height
//     array and tank positions, never the seed, so nothing can be recomputed
//     or pre-played elsewhere.
//   - Every act needs the seat's unguessable token PLUS the room CSRF token,
//     and Origin is checked when present. Aim/power/drive/fuel/ammo/cash are
//     range-checked against authoritative state; turn order is enforced.
//   - AI seats (the default for seats nobody holds) run the same sim inline, so no cron is needed.
//
// Storage: rooms are rows in Tankity's SQLite database (server/db.php), one
// serialized room per row. A request holds its room inside one write
// transaction (BEGIN IMMEDIATE) from load to unlock, so writers take turns;
// one that waits past the busy timeout answers 503. Rooms are play sessions:
// idle ones are deleted by whoever loads them and by housekeeping.
declare(strict_types=1);

// A JSON API must never leak diagnostics into its output: one stray warning
// and every client sees a page instead of game data. Errors still reach the
// server log; they just stop hijacking responses.
ini_set('display_errors', '0');

require_once __DIR__ . '/config.php';

// The server is split by concern under server/. This file keeps the request
// pipeline: parsing, the JSON reply, the gate, and one handler per action.
//   server/settings.php  room shape and the host's knobs
//   server/db.php        the storage directory, the database, transactions
//   server/guard.php     the score guard's settings and the blocked initials
//   server/score-guard.php  the kit's score guard (a generated copy; never edit it)
//   server/board.php     the boards, one per difficulty
//   server/housekeep.php throttled cleanup on requests
//   server/store.php     rooms as rows: the room lock, room lifecycle, the sweep
//   server/detmath.php   sin, cos, atan2 and Math.round, the same bits as src/detmath.ts
//   server/walls.php     the arena's side walls: bounces, wraps, bursts (mirrors src/walls.ts)
//   server/flight.php    the air a shell flies through, and a missile's launch speeds (mirrors src/sim.ts)
//   server/sim.php       the deterministic sim (mirrors src/sim.ts)
//   server/earth.php     the earth ops: craters, dirt, pools, slumps, trenches (mirrors src/earth.ts)
//   server/fire.php      napalm's burning pools and who their flames reach (mirrors src/fire.ts)
//   server/ai.php        drone aim, bracketing and strategies
//   server/rules.php     seats, rounds, turn clock, pacing, the shop, scores
//   server/protocol.php  events, snapshots and deltas
//   server/rate.php      per-address hourly allowances (creating and joining rooms)
//   server/pow.php       the room puzzle: challenges, their checks, spent ones
// Those files do nothing unless this one requires them.
define('TANKITY_ROOMS_INCLUDED', true);
require_once __DIR__ . '/server/db.php';
require_once __DIR__ . '/server/housekeep.php';
require_once __DIR__ . '/server/guard.php';
require_once __DIR__ . '/server/board.php';
require_once __DIR__ . '/server/settings.php';
require_once __DIR__ . '/server/store.php';
require_once __DIR__ . '/server/detmath.php';
require_once __DIR__ . '/server/walls.php';
require_once __DIR__ . '/server/flight.php';
require_once __DIR__ . '/server/sim.php';
require_once __DIR__ . '/server/earth.php';
require_once __DIR__ . '/server/fire.php';
require_once __DIR__ . '/server/ai.php';
require_once __DIR__ . '/server/rules.php';
require_once __DIR__ . '/server/protocol.php';
require_once __DIR__ . '/server/rate.php';
require_once __DIR__ . '/server/pow.php';

// room_arsenal() resolves against this file's own location (game.json next to it), so it stays here.
/* A client that sends Accept-Encoding: gzip gets the JSON compressed (the
   host's Apache has no compression of its own for PHP output; a room snapshot
   shrinks about eight-fold). ob_gzhandler negotiates the encoding, sets
   Content-Encoding and Vary, and passes the body through untouched for a
   client that does not accept it. Started here, not at the top of the file,
   so only a reply that is really sent is wrapped: the test suites include
   this file for its functions and must not have their output captured. It
   stacks on any buffer php.ini's output_buffering already opened (that one
   level is flushed by the exit below). */
function room_gzip_begin(): void
{
    if (!function_exists('ob_gzhandler') || ini_get('zlib.output_compression')) {
        return;
    }
    ob_start('ob_gzhandler');
}
function room_json_out(int $code, array $payload): void
{
    http_response_code($code);
    header('Content-Type: application/json');
    room_gzip_begin();
    echo json_encode($payload, JSON_UNESCAPED_SLASHES);
    exit;
}
/* The front of create and join, in order and uncharged (README "Room
   slots"): the protocol (an old bundle is told to reload), then the puzzle's
   format, MAC, age and work (server/pow.php), then a plain read for a puzzle
   already spent. Answers the challenge to spend, or null when the puzzle is
   off. A join runs this before its code is read, so a guess without work
   learns nothing. */
function room_admit(array $body, string $purpose): ?string
{
    if (!room_proto_ok($body)) {
        room_reload_out();
    }
    if (room_pow_bits_setting() === 0) {
        return null;
    }
    try {
        $refused = room_pow_check($body['pow'] ?? null, $purpose, room_now());
        if ($refused !== null) {
            room_json_out($refused[0], ['error' => $refused[2], 'puzzle' => $refused[1]]);
        }
        $challenge = (string) $body['pow']['c']; // the check passed, so it is a challenge string
        $spent = room_pow_spent($challenge);
    } catch (Throwable $e) {
        room_store_fail($e);
    }
    if ($spent) {
        room_json_out(POW_SPENT[0], ['error' => POW_SPENT[2], 'puzzle' => POW_SPENT[1]]);
    }
    return $challenge;
}

/* Creating and joining a room spend one of the address's hourly allowance
   (server/rate.php), a 429 once it is spent, and the puzzle admitted for it,
   in one write transaction: a replay that raced past room_admit's read is
   refused (409) with nothing charged, and an allowance refused leaves the
   puzzle unspent. A create also counts toward the surge signal. */
function room_rate_gate(?string $challenge, bool $create): void
{
    try {
        $client = tankity_guard()->clientKey();
        $now = time();
        $perHour = room_joins_per_hour();
        $db = tankity_db();
        $out = rate_used($db, $client, 'room', $now) >= $perHour ? 'rate'
            : tankity_tx($db, function (PDO $db) use ($client, $now, $perHour, $challenge, $create): string {
                if (rate_used($db, $client, 'room', $now) >= $perHour) {
                    return 'rate';
                }
                if ($challenge !== null && !room_pow_spend($db, $challenge)) {
                    return 'spent';
                }
                rate_take($db, $client, 'room', $perHour, $now);
                if ($create) {
                    room_pow_count_create($db, $now);
                }
                return 'ok';
            });
    } catch (Throwable $e) {
        room_store_fail($e);
    }
    if ($out === 'rate') {
        room_json_out(429, ['error' => 'too many rooms from here; try again later']);
    }
    if ($out === 'spent') {
        room_json_out(POW_SPENT[0], ['error' => POW_SPENT[2], 'puzzle' => POW_SPENT[1]]);
    }
}
/* The arsenal lives in game.yaml, served as game.json (tools/game-json.php
// writes it): the browser reads the same file, so prices, packs, ballistics,
// and effects can never disagree. When the file is missing the baked fallback
// below keeps rooms rolling. */
function room_arsenal(): array
{
    static $a = null;
    if ($a !== null) {
        return $a;
    }
    $a = false;
    $raw = @file_get_contents(__DIR__ . '/game.json');
    if ($raw !== false) {
        $d = json_decode($raw, true);
        if (is_array($d) && isset($d['arsenal']['ammo']) && is_array($d['arsenal']['ammo'])) {
            $a = $d['arsenal'];
        }
    }
    if ($a === false) {
        $a = ['ammo' => [
            ['key' => 'shell', 'name' => 'Shell', 'dmg' => 34, 'radius' => 26, 'price' => 0, 'pack' => 0, 'ai' => true, 'aiRound' => 1, 'effect' => 'shot', 'speed' => 1.0],
            ['key' => 'buck', 'name' => 'Buckshot', 'dmg' => 17, 'radius' => 20, 'price' => 80, 'pack' => 2, 'ai' => true, 'aiRound' => 2, 'effect' => 'pellets', 'pellets' => 3, 'spread' => 0.10, 'speed' => 1.0],
            ['key' => 'mortar', 'name' => 'Mortar', 'dmg' => 56, 'radius' => 42, 'price' => 200, 'pack' => 2, 'ai' => true, 'aiRound' => 3, 'effect' => 'shot', 'speed' => 1.0],
            ['key' => 'nuke', 'name' => 'NUKE', 'dmg' => 95, 'radius' => 70, 'price' => 500, 'pack' => 1, 'ai' => false, 'aiRound' => 99, 'effect' => 'shot', 'speed' => 1.0],
        ], 'gear' => [
            ['key' => 'repair', 'name' => 'Repair +40 armor', 'price' => 120, 'n' => 40, 'effect' => 'repair'],
            ['key' => 'fuel', 'name' => 'Fuel +60', 'price' => 60, 'n' => 60, 'effect' => 'fuel'],
        ]];
    }
    return $a;
}

/* A browser's seats, one row each in the order asked; null when it asked for
   too many or not for a list. A room with something due (a turn or shop that
   ran out, a drone up) is ticked under the write lock and saved; the rest are
   plain reads, and a lobby is never saved here, so asking keeps nothing
   alive. A code that names no room, an expired room and a token that holds no
   seat there are all `gone`. */
const ROOM_MINE_MAX = 12;
function room_mine(mixed $seats): ?array
{
    if (!is_array($seats) || !array_is_list($seats) || count($seats) > ROOM_MINE_MAX) {
        return null;
    }
    $out = [];
    $seen = []; // a seat asked twice is looked up once
    foreach ($seats as $ask) {
        $code = room_code_clean(is_array($ask) && is_string($ask['code'] ?? null) ? $ask['code'] : '');
        $token = is_array($ask) && is_string($ask['token'] ?? null) ? $ask['token'] : '';
        $key = $code . '|' . $token;
        $seen[$key] ??= room_mine_one($code, $token);
        $out[] = $seen[$key];
    }
    return $out;
}
/* One seat's row, or the `gone` row. */
function room_mine_one(string $code, string $token): array
{
    $gone = ['code' => $code, 'gone' => true];
    if (!preg_match(ROOM_CODE_RE, $code) || $token === '') {
        return $gone;
    }
    $room = room_peek($code);
    if ($room === null) {
        $why = room_closed_for($code, $token);
        return $why !== null ? $gone + ['closed' => $why] : $gone;
    }
    $seat = room_find_seat($room, $token);
    if ($seat === null) {
        return $gone;
    }
    if (room_tick_due($room)) {
        [$held, $lock] = room_load($code);
        $seat = is_array($held) ? room_find_seat($held, $token) : null;
        if ($seat === null) {
            // Gone, or the player left between the peek and the lock.
            if ($lock !== null) {
                room_unlock($lock);
            }
            return $gone;
        }
        room_tick($held);
        // A tick that could not be saved is not the room's state: answer from the peek.
        if (room_save($lock, $code, $held)) {
            $room = $held;
        }
        room_unlock($lock);
    }
    return room_mine_row($room, $seat);
}

/* ---------- router ---------- */
// test/php/RoomsSimTest.php includes this file for its functions only.
if (defined('TANKITY_ROOMS_LIB')) {
    return;
}
// No cron on the host: requests do the cleanup, at most once a minute.
tankity_housekeep(time(), tankity_jobs());
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$action = $_GET['action'] ?? ($_POST['action'] ?? '');
$body = [];
if ($method === 'POST') {
    $raw = file_get_contents('php://input');
    $dec = json_decode(is_string($raw) ? $raw : '', true);
    $body = is_array($dec) ? $dec : $_POST;
}
if ($action === 'ping') {
    // Health plus occupancy for the lobby shelf: started matches against
    // max_rooms, waiting lobbies against max_lobbies. No secrets in here. A
    // read: idle rooms are not counted, and housekeeping deletes them.
    try {
        $rooms = ['used' => room_slots_used(), 'max' => room_max_rooms()];
        $lobbies = ['used' => room_lobbies_used(), 'max' => room_max_lobbies()];
    } catch (Throwable $e) {
        room_store_fail($e);
    }
    room_json_out(200, ['ok' => true, 'game' => 'operation-tankity', 'rooms' => $rooms, 'lobbies' => $lobbies]);
}

if ($action === 'challenge' && $method === 'GET') {
    // A puzzle for a create or a join, signed and bound to this address. Not
    // charged: issuing reads three counts and signs, and stores nothing.
    $purpose = ['create' => 'c', 'join' => 'j'][(string) ($_GET['for'] ?? '')] ?? null;
    if ($purpose === null) {
        room_json_out(422, ['error' => 'ask for a create or a join puzzle']);
    }
    try {
        $issued = room_pow_issue($purpose, room_now());
    } catch (Throwable $e) {
        room_store_fail($e);
    }
    header('Cache-Control: no-store');
    room_json_out(200, ['ok' => true] + $issued);
}

if ($action === 'maps') {
    // Public catalog: ids, names, and a silhouette of round one's hills.
    // Seeds never leave this file.
    $list = [];
    foreach (ROOM_MAPS as $id => $m) {
        $list[] = ['id' => $id, 'name' => $m['name'], 'profile' => room_map_profile($id)];
    }
    room_json_out(200, ['ok' => true, 'maps' => $list]);
}

if ($action === 'mine' && $method === 'POST') {
    // Reads, and ticks what is due; it changes nothing a GET state poll cannot,
    // so it takes no CSRF token and no rate charge. Tokens travel in the body.
    if (!room_origin_ok()) {
        room_json_out(403, ['error' => 'bad origin']);
    }
    try {
        $rows = room_mine($body['seats'] ?? null);
    } catch (Throwable $e) {
        room_store_fail($e);
    }
    if ($rows === null) {
        room_json_out(422, ['error' => 'too many rooms at once']);
    }
    room_json_out(200, ['ok' => true, 'rooms' => $rows]);
}

if ($action === 'map' && $method === 'POST') {
    [$room, $fh, $path, $seat] = room_gate($body, true, true, false);
    $before = $room;
    if ($seat !== room_host($room)) {
        room_unlock($fh);
        room_json_out(403, ['error' => 'only the host picks the hills']);
    }
    if ($room['phase'] !== 'lobby') {
        room_unlock($fh);
        room_json_out(409, ['error' => 'match already started']);
    }
    $raw = trim((string) ($body['map'] ?? ''));
    if ($raw === '') {
        $room['map'] = null;
    } else {
        $map = room_map_lookup($raw);
        if ($map === null) {
            room_unlock($fh);
            room_json_out(422, ['error' => 'no such hills']);
        }
        $room['map'] = $map;
    }
    room_setting_reply($room, $before, $fh, $path, $seat, $body);
}
if ($action === 'leave' && $method === 'POST') {
    [$room, $fh, $path, $seat] = room_gate($body, true, false, false);
    $code = $room['code'];
    // The leaver's name rides on the event: by the next poll the seat is a drone's.
    $who = (string) ($room['seats'][$seat]['initials'] ?? '');
    if (room_leave($room, $seat)) {
        room_emit($room, ['t' => 'left', 'seat' => $seat, 'name' => $who]);
        // The leaver may have been the one the shop was waiting on.
        room_shop_settle($room);
        $ok = room_save($fh, $path, $room);
    } else {
        room_close($fh);
        $ok = true;
    }
    room_unlock($fh);
    room_json_out($ok ? 200 : 500, $ok ? ['ok' => true] : ['error' => 'store write failed']);
}

// A seat changes its unit's look any time: lobby, shop, mid-match.
if ($action === 'body' && $method === 'POST') {
    [$room, $fh, $path, $seat] = room_gate($body, true, true, false);
    $room['seats'][$seat]['body'] = room_body($body);
    if (!room_save($fh, $path, $room)) {
        room_unlock($fh);
        room_json_out(500, ['error' => 'store write failed']);
    }
    room_unlock($fh);
    $out = room_reply_snapshot($room, $seat, $body);
    room_json_out(200, ['ok' => true, 'room' => $out]);
}

if ($action === 'create' && $method === 'POST') {
    if (!room_origin_ok()) {
        room_json_out(403, ['error' => 'bad origin']);
    }
    $challenge = room_admit($body, 'c');
    // Create opens a lobby: a place in the lobby pool, no match slot (Start
    // takes that). The address's lobby cap and a pool with nothing it may
    // close are answered from plain reads before anything is charged, so a
    // lab clicking Host while every lobby is busy keeps its allowance and its
    // puzzle; the exact checks are made again under the write lock below.
    try {
        $hostKey = room_client_hash();
        $hosting = room_lobbies_hosted($hostKey) >= room_lobbies_per_address();
        $busy = !$hosting && room_lobbies_used() >= room_max_lobbies() && room_lobby_evict_pick('', time()) === null;
    } catch (Throwable $e) {
        room_store_fail($e);
    }
    if ($hosting) {
        room_json_out(429, ['error' => ROOM_LOBBIES_HOSTED]);
    }
    if ($busy) {
        room_json_out(409, ['error' => ROOM_LOBBIES_BUSY]);
    }
    // The initials and the hills are pure checks: refused before anything is charged.
    $initials = room_valid_initials($body['initials'] ?? null);
    if ($initials === null) {
        room_json_out(422, ['error' => 'initials must be 3 letters, kept clean']);
    }
    $map = null;
    if (isset($body['map']) && trim((string) $body['map']) !== '') {
        $map = room_map_lookup($body['map']);
        if ($map === null) {
            room_json_out(422, ['error' => 'no such hills']);
        }
    }
    $turn = $body['turn'] ?? null;
    $turn = is_int($turn) && in_array($turn, ROOM_TURN_STOPS, true) ? $turn : ROOM_TURN_DEFAULT;
    room_rate_gate($challenge, true);
    // Idle rooms never counted toward either cap; the sweep only drops their rows.
    try {
        room_sweep();
    } catch (Throwable $e) {
        room_store_fail($e);
    }
    $lock = room_alloc();
    $code = $lock->code;
    $room = room_new($code, $initials);
    $room['map'] = $map;
    // The host's setting for the whole room; nobody changes it after this.
    $room['difficulty'] = room_parse_difficulty($body['difficulty'] ?? null);
    $room['turnSecs'] = $turn;
    $room['acted'] = time();
    $token = room_rand_token();
    // A fresh seat is present, not idle: the turn clock must not mistake a
    // guest who just sat down for one who walked away.
    $room['seats'][0] = room_seat_human($initials, $token, $body, $hostKey);
    $room['hostKey'] = $hostKey;
    for ($i = 1; $i < ROOM_SEATS; $i++) {
        $room['seats'][$i] = room_idle_seat($i);
    }
    room_seat_economy($room, 0);
    // The exact caps, under the write lock room_alloc took: two creates racing
    // for the last place cannot both win. Every refusal frees the code just
    // allocated (and puts back any lobby it closed) before answering.
    try {
        if (room_lobbies_hosted($hostKey, $code) >= room_lobbies_per_address()) {
            room_discard($lock);
            room_json_out(429, ['error' => ROOM_LOBBIES_HOSTED]);
        }
        if (!room_lobby_take($lock->db, $code, time())) {
            room_discard($lock);
            room_json_out(409, ['error' => ROOM_LOBBIES_BUSY]);
        }
    } catch (PDOException $e) {
        room_discard($lock);
        room_store_fail($e);
    }
    if (!room_save($lock, $code, $room)) {
        room_discard($lock);
        room_json_out(500, ['error' => 'store write failed']);
    }
    room_unlock($lock);
    room_json_out(200, ['ok' => true, 'code' => $code, 'seat' => 0, 'token' => $token, 'csrf' => $room['csrf']]);
}

if ($action === 'join' && $method === 'POST') {
    if (!room_origin_ok()) {
        room_json_out(403, ['error' => 'bad origin']);
    }
    // The work comes before the code is read: an unsolved guess at a live
    // code and at a made-up one get the same answer.
    $challenge = room_admit($body, 'j');
    // The code's shape and the initials are pure checks, refused uncharged;
    // whether the code names a room is learned only once the guess is paid.
    $code = room_code_clean((string) ($body['code'] ?? ''));
    $initials = room_valid_initials($body['initials'] ?? null);
    if (!preg_match(ROOM_CODE_RE, $code) || $initials === null) {
        room_json_out(422, ['error' => 'need a 6-character room code and clean 3-letter initials']);
    }
    room_rate_gate($challenge, false);
    $loaded = room_load($code);
    [$room, $fh, $path] = $loaded;
    if (!is_array($room)) {
        room_unlock($fh);
        room_json_out(404, ['error' => 'no such room']);
    }
    if ($room['phase'] !== 'lobby') {
        room_unlock($fh);
        room_json_out(409, ['error' => 'match already started']);
    }
    // A guest takes the first seat nobody holds, open or drone alike.
    $seat = null;
    foreach ($room['seats'] as $idx => $s) {
        if (!($s['human'] ?? false)) {
            $seat = $idx;
            break;
        }
    }
    if ($seat === null) {
        room_unlock($fh);
        room_json_out(409, ['error' => 'room is full']);
    }
    foreach ($room['seats'] as $s) {
        if (($s['human'] ?? false) && strtoupper((string) ($s['initials'] ?? '')) === strtoupper($initials)) {
            room_unlock($fh);
            room_json_out(409, ['error' => 'those initials are taken here']);
        }
    }
    $token = room_rand_token();
    // Same as create: joining means present, so the seat starts clocked in.
    $room['seats'][$seat] = room_seat_human($initials, $token, $body, room_client_hash());
    room_seat_economy($room, $seat);
    room_emit($room, ['t' => 'join', 'seat' => $seat, 'name' => $initials]);
    $room['acted'] = time();
    if (!room_save($fh, $path, $room)) {
        room_unlock($fh);
        room_json_out(500, ['error' => 'store write failed']);
    }
    room_unlock($fh);
    room_json_out(200, ['ok' => true, 'code' => $code, 'seat' => $seat, 'token' => $token, 'csrf' => $room['csrf']]);
}

/* The 404 for a room that is not there, and for a request whose token holds
   no seat in a room that is: a stranger cannot tell a live code from one
   nobody holds. A seat whose room was closed to make space (its token's hash
   is in the tombstone) also hears why; anyone else learns nothing more. */
function room_gone_out(string $code, string $token): never
{
    try {
        $why = room_closed_for($code, $token);
    } catch (Throwable $e) {
        $why = null; // the plain 404 still says the room is gone
    }
    room_json_out(404, ['error' => 'no such room'] + ($why !== null ? ['closed' => $why] : []));
}

/* The seat token a request carries: in the body of a POST, or the
   X-Seat-Token header of a state poll (never the URL, which access logs keep). */
function room_req_token(array $body): string
{
    $token = $body['token'] ?? $_SERVER['HTTP_X_SEAT_TOKEN'] ?? '';
    return is_string($token) ? $token : '';
}

function room_csrf_ok(array $room, array $body): bool
{
    $csrf = $body['csrf'] ?? $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    return is_string($csrf) && hash_equals((string) ($room['csrf'] ?? ''), $csrf);
}

/* Authenticated room ops share these gates. */
/* Who is asking is settled from a plain read before the write lock, so a
   stranger is answered (room_gone_out) without queueing behind the one
   writer; the seat and the room token are checked again under the lock.
   $throttle spaces a seat's acts 150 ms apart; leaving skips it, since a
   leave right behind an aim tap must still land. $stamp records the request
   as a turn-moving act (room['acted']): what keeps a started room alive and
   out of the reclaim. Requests that move nothing (a new look, leaving, the
   menu flag, a gun loaded off one's turn) pass false. */
function room_gate(array $body, bool $needCsrf, bool $throttle = true, bool $stamp = true): array
{
    if (!room_origin_ok()) {
        room_json_out(403, ['error' => 'bad origin']);
    }
    $code = room_code_clean((string) ($body['code'] ?? ''));
    if (!preg_match(ROOM_CODE_RE, $code)) {
        room_json_out(422, ['error' => 'bad room code']);
    }
    $token = room_req_token($body);
    try {
        $peek = room_peek($code);
    } catch (Throwable $e) {
        room_store_fail($e);
    }
    if ($peek === null || room_find_seat($peek, $token) === null) {
        room_gone_out($code, $token);
    }
    if ($needCsrf && !room_csrf_ok($peek, $body)) {
        room_json_out(403, ['error' => 'bad csrf token']);
    }
    $loaded = room_load($code);
    [$room, $fh, $path] = $loaded;
    $seat = is_array($room) ? room_find_seat($room, $token) : null;
    if ($seat === null) {
        // Gone, or the seat left, between the read and the lock.
        room_unlock($fh);
        room_gone_out($code, $token);
    }
    if ($needCsrf) {
        if (!room_csrf_ok($room, $body)) {
            room_unlock($fh);
            room_json_out(403, ['error' => 'bad csrf token']);
        }
        $now = microtime(true);
        $last = (float) ($room['seats'][$seat]['lastAct'] ?? 0);
        if ($throttle && $now - $last < 0.15) {
            room_unlock($fh);
            room_json_out(429, ['error' => 'too fast']);
        }
        // Unthrottled requests (leave, the menu flag) do not spend the
        // spacing.
        if ($throttle) {
            $room['seats'][$seat]['lastAct'] = $now;
        }
    }
    if ($stamp) {
        $room['acted'] = time(); // polls and timeouts never come through here
    }
    return [$room, $fh, $path, $seat];
}

/* A host's setting answered: saved only when it changed something, and a
   change counts as playing (stamps `acted`) only in the lobby. Once the match
   is under way only a turn keeps a room alive, so a host cannot hold one open
   by touching the settings. $before is the room as room_gate handed it over. */
function room_setting_reply(array $room, array $before, $fh, string $path, int $seat, array $body): never
{
    if ($room !== $before) {
        if ($room['phase'] === 'lobby') {
            $room['acted'] = time();
        }
        if (!room_save($fh, $path, $room)) {
            room_unlock($fh);
            room_json_out(500, ['error' => 'store write failed']);
        }
    }
    room_unlock($fh);
    $out = room_reply_snapshot($room, $seat, $body);
    room_json_out(200, ['ok' => true, 'room' => $out]);
}

/* The host decides each non-human seat: drone battery ('ai') or 'open'. */
if ($action === 'seatmode' && $method === 'POST') {
    [$room, $fh, $path, $seat] = room_gate($body, true, true, false);
    $before = $room;
    if ($seat !== room_host($room)) {
        room_unlock($fh);
        room_json_out(403, ['error' => 'only the host sets the seats']);
    }
    if ($room['phase'] !== 'lobby') {
        room_unlock($fh);
        room_json_out(409, ['error' => 'match already started']);
    }
    $target = $body['seat'] ?? null;
    $mode = (string) ($body['mode'] ?? '');
    if (!is_int($target) || !isset($room['seats'][$target]) || !in_array($mode, ['ai', 'open'], true)) {
        room_unlock($fh);
        room_json_out(422, ['error' => 'pick a seat and AI or Open']);
    }
    if ($room['seats'][$target]['human'] ?? false) {
        room_unlock($fh);
        room_json_out(409, ['error' => 'a player is sitting there']);
    }
    $room['seats'][$target]['mode'] = $mode;
    room_setting_reply($room, $before, $fh, $path, $seat, $body);
}

/* The host sets the turn time in any phase; it applies from the next turn
   (the running clock and an open shop keep theirs). */
if ($action === 'turntime' && $method === 'POST') {
    // Spaced like every other act (the slider sends a settled value).
    [$room, $fh, $path, $seat] = room_gate($body, true, true, false);
    $before = $room;
    if ($seat !== room_host($room)) {
        room_unlock($fh);
        room_json_out(403, ['error' => 'only the host sets the turn time']);
    }
    $secs = $body['secs'] ?? null;
    if (!is_int($secs) || !in_array($secs, ROOM_TURN_STOPS, true)) {
        room_unlock($fh);
        room_json_out(422, ['error' => 'pick one of the turn times']);
    }
    if ($secs !== room_turn_secs($room)) {
        $room['turnSecs'] = $secs;
        room_emit($room, ['t' => 'turntime', 'seat' => $seat, 'secs' => $secs]);
    }
    room_setting_reply($room, $before, $fh, $path, $seat, $body);
}

/* The host sets the game speed in any phase; every client replays at it
   from then on (room_set_speed). */
if ($action === 'speed' && $method === 'POST') {
    // Spaced like every other act (the button sends a settled pick).
    [$room, $fh, $path, $seat] = room_gate($body, true, true, false);
    $before = $room;
    $refused = room_set_speed($room, $seat, $body['speed'] ?? null);
    if ($refused !== null) {
        room_unlock($fh);
        room_json_out($refused[0], ['error' => $refused[1]]);
    }
    room_setting_reply($room, $before, $fh, $path, $seat, $body);
}

/* The host picks the walls in the lobby or between rounds; the pick applies
   from the next round (room_set_walls). */
if ($action === 'walls' && $method === 'POST') {
    [$room, $fh, $path, $seat] = room_gate($body, true, true, false);
    $before = $room;
    $refused = room_set_walls($room, $seat, $body['walls'] ?? null);
    if ($refused !== null) {
        room_unlock($fh);
        room_json_out($refused[0], ['error' => $refused[1]]);
    }
    room_setting_reply($room, $before, $fh, $path, $seat, $body);
}

if ($action === 'start' && $method === 'POST') {
    [$room, $fh, $path, $seat] = room_gate($body, true);
    if ($seat !== room_host($room)) {
        room_unlock($fh);
        room_json_out(403, ['error' => 'only the host starts the match']);
    }
    if ($room['phase'] !== 'lobby') {
        room_unlock($fh);
        room_json_out(409, ['error' => 'already started']);
    }
    // One human needs no referee: the browser plays the match as solo, and
    // the lobby closes without a tombstone, since its host closed it (README
    // "Room slots"). An old bundle could not play it, so it is told to reload
    // and the lobby stays as it was.
    $humans = count(array_filter($room['seats'], static fn(array $s): bool => (bool) ($s['human'] ?? false)));
    if ($humans < 2) {
        if (!room_proto_ok($body)) {
            room_unlock($fh);
            room_reload_out();
        }
        $local = ['difficulty' => room_difficulty($room), 'speed' => room_speed($room), 'walls' => room_walls_setting($room)];
        room_close($fh);
        room_json_out(200, ['ok' => true, 'local' => $local]);
    }
    // Humans and drone seats field units; open seats stay empty. The host
    // is always seated, so a single drone seat makes at least two tanks;
    // humans alone would have no one to fight.
    $drones = 0;
    foreach ($room['seats'] as $s) {
        if (!($s['human'] ?? false) && ($s['mode'] ?? 'ai') !== 'open') {
            $drones++;
        }
    }
    if ($drones === 0) {
        room_unlock($fh);
        room_json_out(409, ['error' => 'A match needs at least two tanks. Switch a seat to AI so there is someone to battle.']);
    }
    // The match takes a slot, under this request's write lock so two Starts
    // cannot both take the last one: the host's address within its match cap,
    // then a free slot or the stalest eligible room closed to make one.
    try {
        $now = time();
        $room['startedBy'] = room_host_key($room);
        if (room_hosted($room['startedBy'], (string) $room['code'], $now) >= room_hosts_per_address()) {
            room_discard($fh);
            room_json_out(429, ['error' => 'too many matches hosted from here; finish or leave one first']);
        }
        if (!room_take_slot($fh, (string) $room['code'], $now)) {
            room_discard($fh);
            room_json_out(409, ['error' => 'Every match slot is in play. Try again in a few minutes.']);
        }
    } catch (PDOException $e) {
        room_discard($fh);
        room_store_fail($e);
    }
    room_match_begin($room);
    room_start_round($room);
    $events = [];
    $events[] = ['t' => 'round', 'round' => $room['round'], 'wind' => $room['wind']];
    room_advance($room, $events);
    foreach ($events as $e) {
        room_emit($room, $e);
    }
    if (!room_save($fh, $path, $room)) {
        // Rolled back: a room closed above for this slot stays open.
        room_discard($fh);
        room_json_out(500, ['error' => 'store write failed']);
    }
    room_unlock($fh);
    $out = room_reply_snapshot($room, $seat, $body);
    room_json_out(200, ['ok' => true, 'room' => $out]);
}

if ($action === 'state') {
    $code = room_code_clean((string) ($body['code'] ?? $_GET['code'] ?? ''));
    if (!preg_match(ROOM_CODE_RE, $code)) {
        room_json_out(422, ['error' => 'bad room code']);
    }
    // Only a seat reads its room: a request whose token holds no seat hears
    // the same 404 as one for a code nobody holds, so polling codes finds
    // nothing (only a paid join does). A lobby or a finished match changes
    // only by an act: a poll reads it without the write lock. A seated poll
    // still refreshes the room's touch every ROOM_HEARTBEAT_SECS, so a
    // waiting lobby stays live.
    try {
        $peek = room_peek($code);
    } catch (Throwable $e) {
        room_store_fail($e);
    }
    $token = room_req_token($body);
    $peekSeat = $peek !== null ? room_find_seat($peek, $token) : null;
    if ($peekSeat === null) {
        room_gone_out($code, $token);
    }
    if (in_array($peek['phase'], ['lobby', 'over'], true)
        && time() - (int) ($peek['touched'] ?? 0) < ROOM_HEARTBEAT_SECS) {
        room_json_out(200, ['ok' => true, 'room' => room_reply_snapshot($peek, $peekSeat, $body)]);
    }
    // A running match changes on its own only when a clock runs out or a
    // drone is up: until then a poll is a read, so a week-long room open in
    // a tab costs no writes. room_tick_due answers from the read (as mine).
    if (in_array($peek['phase'], ['play', 'shop'], true) && !room_tick_due($peek)) {
        room_json_out(200, ['ok' => true, 'room' => room_reply_snapshot($peek, $peekSeat, $body)]);
    }
    $loaded = room_load($code);
    [$room, $fh, $path] = $loaded;
    $seat = is_array($room) ? room_find_seat($room, $token) : null;
    if ($seat === null) {
        room_unlock($fh);
        room_gone_out($code, $token);
    }
    if ($room['phase'] === 'play' || $room['phase'] === 'shop') {
        // A turn or shop clock that ran out, or a drone's turn, is applied by whoever polls first.
        room_tick($room);
        room_save($fh, $path, $room);
    } else {
        // Heartbeat: a seated browser polls state every couple of seconds, so
        // saving (mtime only, hands off lastAct) keeps a waiting lobby live
        // without holding its slot forever after everyone leaves.
        room_save($fh, $path, $room);
    }
    room_unlock($fh);
    $out = room_reply_snapshot($room, $seat, $body);
    room_json_out(200, ['ok' => true, 'room' => $out]);
}

if ($action === 'act' && $method === 'POST') {
    // A menu flag only says "this player is in a menu": it follows the
    // player's own clicks, so the act throttle does not apply to it.
    // The handler stamps the act itself once it knows whose turn it is.
    [$room, $fh, $path, $seat] = room_gate($body, true, ($body['kind'] ?? '') !== 'menu', false);
    $kind = (string) ($body['kind'] ?? '');
    $events = [];
    if ($room['phase'] !== 'play') {
        room_unlock($fh);
        room_json_out(409, ['error' => 'not playing right now']);
    }
    $myIdx = null;
    foreach ($room['tanks'] as $i => $t) {
        if ($t['seat'] === $seat && $t['hp'] > 0) {
            $myIdx = $i;
            break;
        }
    }
    // Loading a weapon and the menu flag are fine on anyone's turn: neither
    // moves the match (firing checks the ammo again). Everything else waits
    // for the player's own turn.
    $anyTurn = $kind === 'weapon' || $kind === 'menu';
    if ($kind === 'menu') {
        $room['menu'][$seat] = !empty($body['open']);
    } elseif ($myIdx === null || (!$anyTurn && ($room['tanks'][$room['turn']]['seat'] ?? -1) !== $seat)) {
        room_unlock($fh);
        room_json_out(409, ['error' => 'not your turn']);
    }
    // Aiming, driving and firing happen on one's own turn; a gun loaded then
    // counts too. The menu flag and a gun loaded while someone else is up
    // move nothing, so they keep the room alive for nobody.
    $ownTurn = $myIdx !== null && ($room['tanks'][$room['turn']]['seat'] ?? -1) === $seat;
    if ($kind !== 'menu' && $ownTurn) {
        $room['acted'] = time();
    }
    if ($kind === 'menu') {
        // Recorded above; nothing else to do.
    } else {
    $tank = &$room['tanks'][$myIdx];
    if ($kind === 'aim') {
        unset($tank);
        room_set_aim($room, $myIdx, $seat, $body['angle'] ?? null, $body['power'] ?? null);
        $tank = &$room['tanks'][$myIdx];
    } elseif ($kind === 'drive') {
        unset($tank);
        $refused = room_drive($room, $myIdx, (float) ($body['dx'] ?? 0));
        if ($refused !== null) {
            room_unlock($fh);
            room_json_out($refused[0], ['error' => $refused[1]]);
        }
        $tank = &$room['tanks'][$myIdx];
    } elseif ($kind === 'weapon') {
        $wkey = (string) ($body['weapon'] ?? 'shell');
        $weapons = room_weapons();
        if (!isset($weapons[$wkey])) {
            room_unlock($fh);
            room_json_out(422, ['error' => 'no such weapon']);
        }
        $have = $room['ammo'][$seat][$wkey] ?? 0;
        if ($wkey !== 'shell' && $have <= 0) {
            room_unlock($fh);
            room_json_out(409, ['error' => 'none left']);
        }
        $room['weapon'][$seat] = $wkey;
        // The barrel comes back inside the new gun's limits.
        unset($tank);
        room_set_aim($room, $myIdx, $seat, null, null);
        $tank = &$room['tanks'][$myIdx];
    } elseif ($kind === 'fire') {
        // The shot carries its own aim so a fast trigger pull never fires stale barrels.
        unset($tank);
        room_set_aim($room, $myIdx, $seat, $body['angle'] ?? null, $body['power'] ?? null);
        $tank = &$room['tanks'][$myIdx];
        $wkey = (string) ($room['weapon'][$seat] ?? 'shell');
        $weapons = room_weapons();
        if (!isset($weapons[$wkey])) {
            $wkey = 'shell';
        }
        $have = $room['ammo'][$seat][$wkey] ?? 0;
        if ($wkey !== 'shell' && $have <= 0) {
            room_unlock($fh);
            room_json_out(409, ['error' => 'none left']);
        }
        if ($wkey !== 'shell') {
            $room['ammo'][$seat][$wkey] = $have - 1;
            $room['tanks'][$myIdx]['ammo'][$wkey] = $room['ammo'][$seat][$wkey];
            // The last one fired: the gun falls back to the endless Shell.
            if ($have - 1 <= 0) {
                $room['weapon'][$seat] = 'shell';
            }
        }
        $me = $room['tanks'][$myIdx];
        $events[] = ['t' => 'fire', 'seat' => $seat, 'w' => $wkey,
            'x' => round($me['x'], 1), 'a' => round($me['angle'], 1), 'pw' => round($me['power'], 1)];
        room_fire_shot($room, $events, $myIdx, $wkey);
        $rng = $room['rng'];
        $room['wind'] = (int) max(-12, min(12, round($room['wind'] + room_gauss($rng) * 2)));
        $room['rng'] = $rng;
        room_check_oneups($room, $events, $seat);
        if (room_round_settled($room)) {
            room_end_round($room, $events);
        } else {
            $n = count($room['tanks']);
            $room['turn'] = ($room['turn'] + 1) % max(1, $n);
            room_advance($room, $events);
        }
    } else {
        room_unlock($fh);
        room_json_out(422, ['error' => 'unknown act']);
    }
    unset($tank);
    }
    foreach ($events as $e) {
        room_emit($room, $e);
    }
    if (!room_save($fh, $path, $room)) {
        room_unlock($fh);
        room_json_out(500, ['error' => 'store write failed']);
    }
    room_unlock($fh);
    $out = room_reply_snapshot($room, $seat, $body);
    room_json_out(200, ['ok' => true, 'room' => $out]);
}

if ($action === 'buy' && $method === 'POST') {
    [$room, $fh, $path, $seat] = room_gate($body, true);
    if (room_shop_settle($room)) {
        room_save($fh, $path, $room); // the clock ran out before this purchase
    }
    if ($room['phase'] !== 'shop') {
        room_unlock($fh);
        room_json_out(409, ['error' => 'shop is closed']);
    }
    $err = room_buy($room, $seat, (string) ($body['item'] ?? ''), (int) ($body['qty'] ?? 1));
    if ($err !== null) {
        room_unlock($fh);
        room_json_out($err[0], ['error' => $err[1]]);
    }
    if (!room_save($fh, $path, $room)) {
        room_unlock($fh);
        room_json_out(500, ['error' => 'store write failed']);
    }
    room_unlock($fh);
    $out = room_reply_snapshot($room, $seat, $body);
    room_json_out(200, ['ok' => true, 'room' => $out]);
}

/* Play again (same room): anyone seated may press it once the match is over. */
if ($action === 'again' && $method === 'POST') {
    [$room, $fh, $path, $seat] = room_gate($body, true, false);
    // Back to the lobby gives the match slot back and takes a place in the
    // lobby pool, closing a dead, idle or old lobby when the pool is full.
    if ($room['phase'] === 'over') {
        try {
            $place = room_lobby_take($fh->db, (string) $room['code'], time());
        } catch (PDOException $e) {
            room_discard($fh);
            room_store_fail($e);
        }
        if (!$place) {
            room_discard($fh);
            room_json_out(409, ['error' => ROOM_LOBBIES_BUSY]);
        }
    }
    $wasOver = $room['phase'] === 'over';
    if (!room_again($room)) {
        room_discard($fh);
        room_json_out(409, ['error' => 'no match to play again: it is still on, or nobody is left']);
    }
    // The revived lobby counts against its (possibly new) host's lobbies.
    if ($wasOver) {
        try {
            $hosting = room_lobbies_hosted(room_host_key($room), (string) $room['code']) >= room_lobbies_per_address();
        } catch (PDOException $e) {
            room_discard($fh);
            room_store_fail($e);
        }
        if ($hosting) {
            room_discard($fh);
            room_json_out(429, ['error' => ROOM_LOBBIES_HOSTED]);
        }
        // A new lobby spends the presser's hourly allowance, as create does.
        try {
            $allowed = room_rate_take(tankity_guard()->clientKey(), time());
        } catch (Throwable $e) {
            room_discard($fh);
            room_store_fail($e);
        }
        if (!$allowed) {
            room_discard($fh);
            room_json_out(429, ['error' => 'too many rooms from here; try again later']);
        }
    }
    room_emit($room, ['t' => 'again', 'seat' => $seat]);
    if (!room_save($fh, $path, $room)) {
        // Rolled back: a lobby closed for this place stays open, and the
        // allowance is not charged.
        room_discard($fh);
        room_json_out(500, ['error' => 'store write failed']);
    }
    $out = room_reply_snapshot($room, $seat, $body);
    room_unlock($fh);
    room_json_out(200, ['ok' => true, 'room' => $out]);
}

/* Ready is a toggle on the wire as a wanted state: {"ready": true|false}.
   Not throttled: it follows the player's own click, like the menu flag, and
   a swallowed click would leave the button disagreeing with the room. */
if ($action === 'ready' && $method === 'POST') {
    [$room, $fh, $path, $seat] = room_gate($body, true, false);
    if (!is_bool($body['ready'] ?? null)) {
        room_unlock($fh);
        room_json_out(422, ['error' => 'say whether you are ready']);
    }
    // Out of the shop this changes nothing and answers with the room as it
    // is, so a late "unready" just shows the client the round already began.
    if (room_shop_set_ready($room, $seat, $body['ready'])) {
        room_shop_settle($room);
        if (!room_save($fh, $path, $room)) {
            room_unlock($fh);
            room_json_out(500, ['error' => 'store write failed']);
        }
    }
    room_unlock($fh);
    $out = room_reply_snapshot($room, $seat, $body);
    room_json_out(200, ['ok' => true, 'room' => $out]);
}

room_json_out(405, ['error' => 'method not allowed']);



