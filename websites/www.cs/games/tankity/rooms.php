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
//   server/legacy.php    the per-callsign score runs and the import of the old score files
//   server/housekeep.php throttled cleanup on requests
//   server/store.php     rooms as rows: the room lock, room lifecycle, the sweep
//   server/detmath.php   sin, cos, atan2 and Math.round, the same bits as src/detmath.ts
//   server/sim.php       the deterministic sim (mirrors src/sim.ts)
//   server/flight.php    a solo volley in fixed steps, tanks falling between
//   server/ai.php        drone aim, bracketing and strategies
//   server/rules.php     seats, rounds, turn clock, pacing, the shop, scores
//   server/solo.php      the solo referee, for the server's play of solo rounds
//   server/protocol.php  events, snapshots and deltas
//   server/scores-api.php the solo score endpoint's work, here so housekeeping
//                        from either endpoint also sweeps solo runs
// Those files do nothing unless this one requires them.
define('TANKITY_ROOMS_INCLUDED', true);
require_once __DIR__ . '/server/db.php';
require_once __DIR__ . '/server/legacy.php';
require_once __DIR__ . '/server/housekeep.php';
require_once __DIR__ . '/server/guard.php';
require_once __DIR__ . '/server/board.php';
require_once __DIR__ . '/server/settings.php';
require_once __DIR__ . '/server/store.php';
require_once __DIR__ . '/server/detmath.php';
require_once __DIR__ . '/server/sim.php';
require_once __DIR__ . '/server/flight.php';
require_once __DIR__ . '/server/ai.php';
require_once __DIR__ . '/server/rules.php';
require_once __DIR__ . '/server/solo.php';
require_once __DIR__ . '/server/protocol.php';
require_once __DIR__ . '/server/scores-api.php';

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
/* Creating and joining a room spend one of the address's hourly allowance
   (room_rate_take in server/scores-api.php); a 429 once it is spent. */
function room_rate_gate(): void
{
    try {
        $allowed = room_rate_take(tankity_guard()->clientKey(), time());
    } catch (Throwable $e) {
        room_store_fail($e);
    }
    if (!$allowed) {
        room_json_out(429, ['error' => 'too many rooms from here; try again later']);
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
            ['key' => 'shell', 'name' => 'Shell', 'dmg' => 34, 'radius' => 26, 'price' => 0, 'pack' => 0, 'minRound' => 1, 'ai' => true, 'aiRound' => 1, 'effect' => 'shot', 'speed' => 1.0],
            ['key' => 'buck', 'name' => 'Buckshot', 'dmg' => 17, 'radius' => 20, 'price' => 80, 'pack' => 2, 'minRound' => 1, 'ai' => true, 'aiRound' => 2, 'effect' => 'pellets', 'pellets' => 3, 'spread' => 0.10, 'speed' => 1.0],
            ['key' => 'mortar', 'name' => 'Mortar', 'dmg' => 56, 'radius' => 42, 'price' => 200, 'pack' => 2, 'minRound' => 1, 'ai' => true, 'aiRound' => 3, 'effect' => 'shot', 'speed' => 1.0],
            ['key' => 'rail', 'name' => 'Rail', 'dmg' => 56, 'radius' => 15, 'price' => 140, 'pack' => 2, 'minRound' => 1, 'ai' => true, 'aiRound' => 5, 'effect' => 'shot', 'flat' => true, 'speed' => 1.0],
            ['key' => 'nuke', 'name' => 'NUKE', 'dmg' => 95, 'radius' => 70, 'price' => 500, 'pack' => 1, 'minRound' => 4, 'ai' => false, 'aiRound' => 99, 'effect' => 'shot', 'speed' => 1.0],
        ], 'gear' => [
            ['key' => 'repair', 'name' => 'Repair +40 armor', 'price' => 120, 'n' => 40, 'effect' => 'repair'],
            ['key' => 'fuel', 'name' => 'Fuel +60', 'price' => 60, 'n' => 60, 'effect' => 'fuel'],
        ]];
    }
    return $a;
}

/* ---------- router ---------- */
// test/php/checks/rooms-sim.php includes this file for its functions only.
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
    // Health plus occupancy for the lobby shelf. No secrets in here. A read:
    // idle rooms are not counted, and housekeeping deletes them.
    try {
        $rooms = ['used' => room_count(), 'max' => room_max_rooms()];
    } catch (Throwable $e) {
        room_store_fail($e);
    }
    room_json_out(200, ['ok' => true, 'game' => 'operation-tankity', 'rooms' => $rooms]);
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

if ($action === 'map' && $method === 'POST') {
    [$room, $fh, $path, $seat] = room_gate($body, true);
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
    if (!room_save($fh, $path, $room)) {
        room_unlock($fh);
        room_json_out(500, ['error' => 'store write failed']);
    }
    room_unlock($fh);
    $out = room_reply_snapshot($room, $seat, $body);
    room_json_out(200, ['ok' => true, 'room' => $out]);
}
if ($action === 'leave' && $method === 'POST') {
    [$room, $fh, $path, $seat] = room_gate($body, true, false);
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
    [$room, $fh, $path, $seat] = room_gate($body, true);
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
    // A full server is answered from a plain read before anything is charged:
    // a lab clicking Host while every room is taken keeps its allowance.
    try {
        $max = room_max_rooms();
        $full = room_count() >= $max;
    } catch (Throwable $e) {
        room_store_fail($e);
    }
    if ($full) {
        room_json_out(409, ['error' => "every room is taken ($max / $max). Try again later."]);
    }
    room_rate_gate();
    $initials = room_valid_initials($body['initials'] ?? null);
    if ($initials === null) {
        room_json_out(422, ['error' => 'initials must be 3 letters, kept clean']);
    }
    // Idle rooms never counted toward the cap; the sweep only drops their rows.
    // Two creates racing for the last place are settled by room_register below.
    try {
        room_sweep();
    } catch (Throwable $e) {
        room_store_fail($e);
    }
    $map = null;
    if (isset($body['map']) && trim((string) $body['map']) !== '') {
        $map = room_map_lookup($body['map']);
        if ($map === null) {
            room_json_out(422, ['error' => 'no such hills']);
        }
    }
    $lock = room_alloc();
    $code = $lock->code;
    $room = room_new($code, $initials);
    $room['map'] = $map;
    // The host's setting for the whole room; nobody changes it after this.
    $room['difficulty'] = room_parse_difficulty($body['difficulty'] ?? null);
    $token = room_rand_token();
    // A fresh seat is present, not idle: the 90-second auto-fire rule must
    // not mistake a guest who just sat down for one who walked away.
    $room['seats'][0] = room_seat_human($initials, $token, $body);
    for ($i = 1; $i < ROOM_SEATS; $i++) {
        $room['seats'][$i] = room_idle_seat($i);
    }
    room_seat_economy($room, 0);
    if (!room_save($lock, $code, $room)) {
        room_discard($lock);
        room_json_out(500, ['error' => 'store write failed']);
    }
    // The exact cap check: two creates racing for the last place cannot both win.
    // Every failure frees the segment just allocated before answering.
    $registered = room_register($code, $max);
    if ($registered !== true) {
        room_discard($lock);
        if ($registered === null) {
            room_json_out(503, ['error' => 'the room server is busy; try again']);
        }
        room_json_out(409, ['error' => "every room is taken ($max / $max). Try again later."]);
    }
    room_unlock($lock);
    room_json_out(200, ['ok' => true, 'code' => $code, 'seat' => 0, 'token' => $token, 'csrf' => $room['csrf']]);
}

if ($action === 'join' && $method === 'POST') {
    if (!room_origin_ok()) {
        room_json_out(403, ['error' => 'bad origin']);
    }
    room_rate_gate();
    $code = strtoupper(trim((string) ($body['code'] ?? '')));
    $initials = room_valid_initials($body['initials'] ?? null);
    if (!preg_match('/^[A-Z0-9]{4}$/', $code) || $initials === null) {
        room_json_out(422, ['error' => 'need a 4-character room code and clean 3-letter initials']);
    }
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
    $room['seats'][$seat] = room_seat_human($initials, $token, $body);
    room_seat_economy($room, $seat);
    room_emit($room, ['t' => 'join', 'seat' => $seat, 'name' => $initials]);
    if (!room_save($fh, $path, $room)) {
        room_unlock($fh);
        room_json_out(500, ['error' => 'store write failed']);
    }
    room_unlock($fh);
    room_json_out(200, ['ok' => true, 'code' => $code, 'seat' => $seat, 'token' => $token, 'csrf' => $room['csrf']]);
}

/* Authenticated room ops share these gates. */
/* $throttle spaces a seat's acts 150 ms apart; leaving skips it, since a
   leave right behind an aim tap must still land. */
function room_gate(array $body, bool $needCsrf, bool $throttle = true): array
{
    if (!room_origin_ok()) {
        room_json_out(403, ['error' => 'bad origin']);
    }
    $code = strtoupper(trim((string) ($body['code'] ?? '')));
    if (!preg_match('/^[A-Z0-9]{4}$/', $code)) {
        room_json_out(422, ['error' => 'bad room code']);
    }
    $loaded = room_load($code);
    [$room, $fh, $path] = $loaded;
    if (!is_array($room)) {
        room_unlock($fh);
        room_json_out(404, ['error' => 'no such room']);
    }
    $token = (string) ($body['token'] ?? '');
    $seat = room_find_seat($room, $token);
    if ($seat === null) {
        room_unlock($fh);
        room_json_out(401, ['error' => 'bad seat token']);
    }
    if ($needCsrf) {
        $csrf = (string) ($body['csrf'] ?? $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '');
        if (!hash_equals((string) ($room['csrf'] ?? ''), $csrf)) {
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
    return [$room, $fh, $path, $seat];
}

/* The host decides each non-human seat: drone battery ('ai') or 'open'. */
if ($action === 'seatmode' && $method === 'POST') {
    [$room, $fh, $path, $seat] = room_gate($body, true);
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
    if (!room_save($fh, $path, $room)) {
        room_unlock($fh);
        room_json_out(500, ['error' => 'store write failed']);
    }
    room_unlock($fh);
    $out = room_reply_snapshot($room, $seat, $body);
    room_json_out(200, ['ok' => true, 'room' => $out]);
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
    room_match_begin($room);
    room_start_round($room);
    $events = [];
    $events[] = ['t' => 'round', 'round' => $room['round'], 'wind' => $room['wind']];
    room_advance($room, $events);
    foreach ($events as $e) {
        room_emit($room, $e);
    }
    room_settle_tanks($room);
    if (!room_save($fh, $path, $room)) {
        room_unlock($fh);
        room_json_out(500, ['error' => 'store write failed']);
    }
    room_unlock($fh);
    $out = room_reply_snapshot($room, $seat, $body);
    room_json_out(200, ['ok' => true, 'room' => $out]);
}

if ($action === 'state') {
    $code = strtoupper(trim((string) (($body['code'] ?? $_GET['code'] ?? ''))));
    if (!preg_match('/^[A-Z0-9]{4}$/', $code)) {
        room_json_out(422, ['error' => 'bad room code']);
    }
    // A lobby or a finished match changes only by an act: a poll reads it
    // without the write lock. A seated poll still refreshes the room's touch
    // every ROOM_HEARTBEAT_SECS, so a waiting lobby stays live.
    try {
        $peek = room_peek($code);
    } catch (Throwable $e) {
        room_store_fail($e);
    }
    if ($peek === null) {
        room_json_out(404, ['error' => 'no such room']);
    }
    $peekToken = (string) ($body['token'] ?? $_GET['token'] ?? '');
    $peekSeat = $peekToken !== '' ? room_find_seat($peek, $peekToken) : null;
    if (in_array($peek['phase'], ['lobby', 'over'], true)
        && ($peekSeat === null || time() - (int) ($peek['touched'] ?? 0) < ROOM_HEARTBEAT_SECS)) {
        room_json_out(200, ['ok' => true, 'room' => room_reply_snapshot($peek, $peekSeat, $body)]);
    }
    $loaded = room_load($code);
    [$room, $fh, $path] = $loaded;
    if (!is_array($room)) {
        room_unlock($fh);
        room_json_out(404, ['error' => 'no such room']);
    }
    $token = (string) ($body['token'] ?? $_GET['token'] ?? '');
    $seat = $token !== '' ? room_find_seat($room, $token) : null;
    if ($room['phase'] === 'play') {
        $events = [];
        room_advance($room, $events);
        foreach ($events as $e) {
            room_emit($room, $e);
        }
        room_settle_tanks($room);
        room_save($fh, $path, $room);
    } elseif ($room['phase'] === 'shop') {
        // The shop clock runs out on whoever polls first.
        room_shop_settle($room);
        room_save($fh, $path, $room);
    } elseif ($seat !== null) {
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
    [$room, $fh, $path, $seat] = room_gate($body, true, ($body['kind'] ?? '') !== 'menu');
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
    if ($kind === 'menu') {
        // Recorded above; nothing else to do.
    } else {
    $tank = &$room['tanks'][$myIdx];
    if ($kind === 'aim') {
        $tank['angle'] = max(10.0, min(170.0, (float) ($body['angle'] ?? $tank['angle'])));
        $tank['power'] = max(10.0, min(100.0, (float) ($body['power'] ?? $tank['power'])));
    } elseif ($kind === 'drive') {
        $dx = max(-80.0, min(80.0, (float) ($body['dx'] ?? 0)));
        if (abs($dx) > $tank['fuel'] + 1e-9) {
            room_unlock($fh);
            room_json_out(422, ['error' => 'not enough fuel']);
        }
        $w = count($room['terrain']);
        // Roll toward the target a pixel at a time and stop short of any
        // other unit; fuel pays only for the ground actually covered.
        $goal = max(12.0, min($w - 12.0, $tank['x'] + $dx));
        $step = $goal > $tank['x'] ? 1.0 : -1.0;
        $nx = $tank['x'];
        while (abs($goal - $nx) >= 1.0 && !room_spot_taken($room, $myIdx, $nx + $step)) {
            $nx += $step;
        }
        if (abs($goal - $nx) < 1.0) {
            $nx = $goal;
        }
        $tank['fuel'] = max(0.0, $tank['fuel'] - abs($nx - $tank['x']));
        $tank['x'] = $nx;
        $xi = max(0, min($w - 1, (int) round($tank['x'])));
        $tank['y'] = $room['terrain'][$xi];
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
        $minRound = $weapons[$wkey]['minRound'] ?? 1;
        if ($room['round'] < $minRound) {
            room_unlock($fh);
            $msg = $wkey === 'nuke' ? 'nukes unlock in round 4' : 'unlocks in round ' . $minRound;
            room_json_out(409, ['error' => $msg]);
        }
        $room['weapon'][$seat] = $wkey;
    } elseif ($kind === 'fire') {
        // The shot carries its own aim so a fast trigger pull never fires stale barrels.
        if (isset($body['angle'])) {
            $tank['angle'] = max(10.0, min(170.0, (float) $body['angle']));
        }
        if (isset($body['power'])) {
            $tank['power'] = max(10.0, min(100.0, (float) $body['power']));
        }
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
        $minRound = $weapons[$wkey]['minRound'] ?? 1;
        if ($room['round'] < $minRound) {
            room_unlock($fh);
            $msg = $wkey === 'nuke' ? 'nukes unlock in round 4' : 'unlocks in round ' . $minRound;
            room_json_out(409, ['error' => $msg]);
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
        room_settle_tanks($room);
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
            room_settle_tanks($room);
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
    if (!room_again($room)) {
        room_unlock($fh);
        room_json_out(409, ['error' => 'no match to play again: it is still on, or nobody is left']);
    }
    room_emit($room, ['t' => 'again', 'seat' => $seat]);
    if (!room_save($fh, $path, $room)) {
        room_unlock($fh);
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



