<?php
// Operation Tankity rooms. The rules of a game: seats and economy, starting and ending rounds, the turn clock,
// drone pacing and watch turns, the shop, lives and winnings, firing a volley.
// Loaded by rooms.php; it runs nothing on its own.
declare(strict_types=1);

// Not an endpoint: rooms.php defines this constant, then requires the file.
// A direct request gets a 404 and nothing runs.
if (!defined('TANKITY_ROOMS_INCLUDED')) {
    http_response_code(404);
    exit;
}

// Mirrors cylon: exact-3 uppercase initials, blocked set enforced both sides.
// (Keep in sync with BLOCKED_INITIALS in game.js.)
const BLOCKED_INITIALS = [
    'ASS',
    'FUK', 'FUC', 'FCK', 'FUX', 'FUQ',
    'SHT', 'SHI',
    'DIK', 'DIC', 'DCK',
    'COK', 'COC', 'COQ',
    'CUM', 'JIZ',
    'CNT', 'PUS', 'VAG', 'CLT',
    'SEX', 'XXX', 'TIT',
    'FAG', 'FGT',
    'NIG', 'NGR',
    'WTF', 'FFS',
    'POO', 'PEE',
    'KKK',
];
/* Cylon-style initials, case kept as typed: exactly 3 letters, and the
 * uppercased form must not be blocked. */
function room_valid_initials($raw): ?string
{
    if (!is_string($raw)) {
        return null;
    }
    $s = trim($raw);
    if (!preg_match('/^[A-Za-z]{3}$/', $s)) {
        return null;
    }
    if (in_array(strtoupper($s), BLOCKED_INITIALS, true)) {
        return null;
    }
    return $s;
}
/* Seconds a human gets for a turn before the crew fires for them. */
const ROOM_TURN_SECS = 120;
/* Seconds left on the turn clock of whoever's turn it is (null when it is
// not a human's turn). The clock starts when a turn begins: aiming and
// driving do not reset it. A turn is identified by round, turn slot and the
// count of shots fired so far, so the same player coming round again starts
// a fresh clock. */
function room_turn_left(array &$room): ?float
{
    $t = $room['tanks'][$room['turn']] ?? null;
    if (($room['phase'] ?? '') !== 'play' || !$t || $t['kind'] !== 'human' || $t['hp'] <= 0) {
        return null;
    }
    $key = ($room['round'] ?? 1) . ':' . $room['turn'] . ':' . ($room['shots'] ?? 0);
    if (($room['clock']['key'] ?? '') !== $key) {
        $room['clock'] = ['key' => $key, 'at' => microtime(true)];
    }
    return max(0.0, ROOM_TURN_SECS - (microtime(true) - (float) $room['clock']['at']));
}
/* Seconds the between-rounds shop stays open before the next round starts for
// everyone, ready or not. */
const ROOM_SHOP_SECS = 90;
/* Seconds left on the shop clock (null outside the shop). It starts when the
// round is won (room_end_round stamps shop.at). */
function room_shop_left(array $room): ?float
{
    if (($room['phase'] ?? '') !== 'shop') {
        return null;
    }
    $at = (float) ($room['shop']['at'] ?? microtime(true));
    return max(0.0, ROOM_SHOP_SECS - (microtime(true) - $at));
}
/* The seats the shop waits on: humans still in the match. Drones, open chairs,
// leavers (their seat turns into a drone) and eliminated humans never block. */
function room_shop_voters(array $room): array
{
    $out = [];
    foreach ($room['seats'] as $idx => $s) {
        if (($s['human'] ?? false) && ($s['lives'] ?? 0) > 0) {
            $out[] = $idx;
        }
    }
    return $out;
}
function room_shop_ready(array $room, int $seat): bool
{
    return !empty($room['shop']['ready'][$seat]) && in_array($seat, room_shop_voters($room), true);
}
/* Record one seat's wanted ready state. The caller sends the state it wants,
// never a flip, so a retried or duplicated request lands the same way twice;
// outside the shop it is ignored (false), so a late "unready" cannot reopen a
// shop whose round has begun. Callers hold the room lock and call
// room_shop_settle right after, in the same read-modify-write. */
function room_shop_set_ready(array &$room, int $seat, bool $want): bool
{
    if ($room['phase'] !== 'shop') {
        return false;
    }
    $room['shop']['ready'][$seat] = $want;
    return true;
}
/* Start the next round when the shop clock has run out or every voter is
// ready. Runs inside the locked read-modify-write that recorded the change,
// so "last player readies" and "round starts" are one step no other request
// can slip between. Returns whether the round started. */
function room_shop_settle(array &$room): bool
{
    if ($room['phase'] !== 'shop') {
        return false;
    }
    $voters = room_shop_voters($room);
    $all = count($voters) > 0;
    foreach ($voters as $v) {
        $all = $all && room_shop_ready($room, $v);
    }
    if (!$all && room_shop_left($room) > 0) {
        return false;
    }
    // Apply stockpiled repairs and fuel before fresh hills.
    foreach ($room['seats'] as $idx => $s) {
        if (!($s['human'] ?? false)) {
            continue;
        }
        $room['repairApplied'][$idx] = $room['repair'][$idx] ?? 0;
        $room['fuelApplied'][$idx] = $room['fuelBonus'][$idx] ?? 0;
        $room['repair'][$idx] = 0;
        $room['fuelBonus'][$idx] = 0;
    }
    unset($room['shop']);
    room_start_round($room);
    room_apply_banked($room);
    $events = [['t' => 'round', 'round' => $room['round'], 'wind' => $room['wind']]];
    room_advance($room, $events);
    foreach ($events as $e) {
        room_emit($room, $e);
    }
    room_settle_tanks($room);
    return true;
}
/* A random gun from a seat's rack: any shell it still has, the Shell always,
// skipping anything its round has not unlocked. */
function room_random_gun(array $room, int $seat): string
{
    $weapons = room_weapons();
    $rack = ['shell'];
    foreach ($room['ammo'][$seat] ?? [] as $wkey => $have) {
        if ($wkey !== 'shell' && $have > 0 && isset($weapons[$wkey])
            && ($weapons[$wkey]['minRound'] ?? 1) <= ($room['round'] ?? 1)) {
            $rack[] = $wkey;
        }
    }
    return $rack[random_int(0, count($rack) - 1)];
}
/* One fully simulated shot (all pellets, all bomblets), server side. No
 * client can fake this. Every event is stamped with its moment in the volley
 * ('at'), and shot events carry their flight path, so clients replay it. */
/* Drone-only pacing. While no human tank is standing the battle belongs to the
// drones and the players only watch, so the server advances ONE drone turn per
// poll, and only once the previous volley has had time to play on the clients.
// Running the whole battle inline would blow past room_advance's guard and
// past the event buffer before a client polled. room_pace_stamp records when a
// volley fired and how long it plays (the latest shot landing or event offset
// in it, plus a beat), never less than ROOM_DRONE_PACE_MIN. */
const ROOM_DRONE_PACE_MIN = 2.0;
const ROOM_VOLLEY_LINGER = 1.0;
/* The longest barrel swing a client plays before a volley flies (src/replay.ts
// aimDur, at most 1.4 s); the wait covers it so the next volley never lands on
// a client still playing the last one. */
const ROOM_AIM_MAX = 1.4;
/* With no human standing the drones play three times as fast: their volleys
// carry 'watch' => true (clients replay them at src/replay.ts FAST_SPEED, the
// same 3) and the gap between them is a third as long. */
const ROOM_DRONE_SPEED = 3.0;
/* Drones left alone can miss each other forever: after this many drone-only
// turns the round ends anyway, as the battery's (src/flow.ts WATCH_TURNS is the same). */
const ROOM_WATCH_TURNS = 40;
function room_pace_stamp(array &$room, array $events, int $from): void
{
    $span = 0.0;
    for ($i = max(0, $from), $n = count($events); $i < $n; $i++) {
        $span = max($span, (float) ($events[$i]['t1'] ?? 0.0), (float) ($events[$i]['at'] ?? 0.0));
    }
    $wait = max(ROOM_DRONE_PACE_MIN, ROOM_AIM_MAX + $span + ROOM_VOLLEY_LINGER);
    if (!empty($events[$from]['watch'])) {
        $wait /= ROOM_DRONE_SPEED;
    }
    $room['pace'] = ['at' => microtime(true), 'wait' => $wait];
}
function room_pace_ready(array $room): bool
{
    $p = $room['pace'] ?? null;
    return !$p || microtime(true) - (float) $p['at'] >= (float) $p['wait'];
}
function room_humans_alive(array $room): bool
{
    foreach ($room['tanks'] as $t) {
        if ($t['kind'] === 'human' && $t['hp'] > 0) {
            return true;
        }
    }
    return false;
}
function room_fire_shot(array &$room, array &$events, int $seatIdx, string $wkey): void
{
    $room['shots'] = ($room['shots'] ?? 0) + 1; // a fresh turn clock follows each shot
    $firstEvent = count($events) - 1; // the opener of this volley
    $tank = &$room['tanks'][$seatIdx];
    $weapons = room_weapons();
    $w = $weapons[$wkey] ?? $weapons['shell'];
    $shots = ($w['pellets'] ?? 0) > 0 ? $w['pellets'] : 1;
    $rad = deg2rad($tank['angle']);
    $dirS = $tank['dirS'] ?? -1;
    $radius = (float) $w['radius'];
    $events[count($events) - 1]['at'] = 0.0; // the fire/aifire that opened this volley
    for ($i = 0; $i < $shots; $i++) {
        $off = $shots === 1 ? 0 : ($i - ($shots - 1) / 2) * ($w['spread'] ?? 0.0);
        $a = $rad + $off;
        $spd = room_shot_speed($tank['power'], !empty($w['flat']), (float) ($w['speed'] ?? 1.0));
        [$mx, $my] = room_muzzle($tank);
        $vx = cos($a) * $spd * $dirS;
        $vy = -sin($a) * $spd;
        $res = room_fly_arc($room, $events, $tank, $w, $wkey, $seatIdx, $mx, $my, $vx, $vy, 0.0, (float) ($w['fuse'] ?? 0.9), null, 0.0);
        if ($res[0] === 'split') {
            // The bloom reads as a burst on every screen; the bomblets do
            // the real damage from here.
            $split = room_shot_event($tank, $wkey, 0.0, $res, 0.0);
            $split['split'] = true;
            $split['at'] = 0.0;
            $events[] = $split;
            $tSplit = $res[7];
            $n = max(2, (int) ($w['split'] ?? 4));
            $fan = (float) ($w['fan'] ?? 0.22);
            $fanned = room_split_vel($res[3], $res[4], $n, $fan);
            $sub = ['dmg' => (int) ($w['subDmg'] ?? $w['dmg']), 'radius' => (int) ($w['subRadius'] ?? $w['radius'])];
            for ($k = 0; $k < $n; $k++) {
                $cr = room_fly_arc($room, $events, $tank, $w, $wkey, $seatIdx, $res[1], $res[2], $fanned[$k][0], $fanned[$k][1], 99.0, false, $sub, $tSplit);
                $ev = room_shot_event($tank, $wkey, $tSplit, $cr, $cr[0] === 'hit' ? (float) $sub['radius'] : 0.0);
                $ev['at'] = round($tSplit, 3);
                $events[] = $ev;
                $mark = count($events);
                if ($cr[0] === 'hit') {
                    room_brk_land($tank, $cr[1]);
                    room_explode($room, $events, $tank, $wkey, $cr[1], $cr[2], $cr[5], $sub);
                } else {
                    $events[] = ['t' => 'fizzle', 'by' => $tank['seat'], 'w' => $wkey];
                }
                room_stamp($events, $mark, $tSplit + $cr[7]);
            }
            continue;
        }
        $ev = room_shot_event($tank, $wkey, 0.0, $res, $res[0] === 'hit' ? $radius : 0.0);
        $ev['at'] = 0.0;
        $events[] = $ev;
        $mark = count($events);
        if ($res[0] === 'hit') {
            room_brk_land($tank, $res[1]);
            room_explode($room, $events, $tank, $wkey, $res[1], $res[2], $res[5], null);
        } else {
            $events[] = ['t' => 'fizzle', 'by' => $tank['seat'], 'w' => $wkey];
        }
        room_stamp($events, $mark, $res[7]);
    }
    unset($tank);
    room_pace_stamp($room, $events, $firstEvent);
}
/* ---------- room state machine ---------- */
function room_new(string $code, string $initials): array
{
    $rng = room_hash_seed('tankity-room-' . $code);
    return [
        'code' => $code,
        'csrf' => room_rand_token(16),
        'created' => time(),
        'touched' => time(),
        'seed' => null, // never sent to clients
        'rng' => $rng,
        'phase' => 'lobby', // lobby | shop | play | over
        'map' => null, // a ROOM_MAPS id, or null for a random draw
        'round' => 0,
        'wind' => 0,
        'terrain' => [],
        'terrainRev' => 1, // bumped whenever the hills change (room_terrain_changed)
        'tanks' => [],
        // seatIdx => human: ['initials','token','lives','human'=>true]; drone or
        // open: ['name','lives','human'=>false,'mode'=>'ai'|'open']. All
        // ROOM_SEATS exist from the start; a joiner takes the first free one.
        'seats' => [],
        'turn' => 0,
        'scores' => [],
        'cash' => [],
        'ammo' => [],
        'events' => [],
        'winners' => [],
    ];
}
/* A seat nobody sits in: the drone battery by default, or open (no unit). */
function room_idle_seat(int $slot, string $mode = 'ai'): array
{
    $name = ROOM_AI_NAMES[($slot - 1) % count(ROOM_AI_NAMES)];
    return ['human' => false, 'name' => $name, 'initials' => $name, 'lives' => 0, 'mode' => $mode === 'open' ? 'open' : 'ai'];
}
function room_seat_human(string $initials, string $token, array $body): array
{
    return ['human' => true, 'initials' => $initials, 'token' => $token, 'lives' => 3, 'lastAct' => microtime(true), 'body' => room_body($body)];
}
/* Every economy slot a new human seat needs, keyed by seat. */
function room_seat_economy(array &$room, int $seat): void
{
    $room['scores'][$seat] = 0;
    $room['cash'][$seat] = 600;
    $room['ammo'][$seat] = ['shell' => -1, 'buck' => 1, 'mortar' => 0, 'rail' => 0, 'nuke' => 0];
    $room['weapon'][$seat] = 'shell';
    $room['nextUp'][$seat] = 3000;
}
/* Seats that will field a unit: every human and every drone seat. */
function room_fielded(array $room): int
{
    $n = 0;
    foreach ($room['seats'] as $s) {
        if (($s['human'] ?? false) || ($s['mode'] ?? 'ai') !== 'open') {
            $n++;
        }
    }
    return $n;
}
/* Units keep at least ROOM_UNIT_GAP apart, centre to centre, so hulls never
   overlap; fresh rounds spread them ROOM_SPAWN_GAP apart. */
const ROOM_UNIT_GAP = 44.0;
const ROOM_SPAWN_GAP = 110;
/* Ground-unit bodies a human may drive; looks only, no stats. */
const ROOM_BODIES = ['tank', 'hover', 'walker', 'buggy'];
function room_body(array $body): string
{
    $b = (string) ($body['body'] ?? 'tank');
    return in_array($b, ROOM_BODIES, true) ? $b : 'tank';
}
function room_spot_taken(array $room, int $self, float $x): bool
{
    foreach ($room['tanks'] as $idx => $t) {
        if ($idx !== $self && $t['hp'] > 0 && abs($t['x'] - $x) < ROOM_UNIT_GAP) {
            return true;
        }
    }
    return false;
}
/* n spawn points, at least ROOM_SPAWN_GAP apart, in random order: no seat
   owns a side. Even spacing if sampling fails. */
function room_spawn_spots(int &$rng, int $n, int $width): array
{
    $lo = 30;
    $hi = $width - 30;
    for ($tries = 0; $tries < 200; $tries++) {
        $xs = [];
        for ($i = 0; $i < $n; $i++) {
            $xs[] = (int) round($lo + room_rng_next($rng) * ($hi - $lo));
        }
        sort($xs);
        $ok = true;
        for ($i = 1; $i < $n; $i++) {
            if ($xs[$i] - $xs[$i - 1] < ROOM_SPAWN_GAP) {
                $ok = false;
                break;
            }
        }
        if ($ok) {
            for ($i = $n - 1; $i > 0; $i--) {
                $j = (int) floor(room_rng_next($rng) * ($i + 1));
                [$xs[$i], $xs[$j]] = [$xs[$j], $xs[$i]];
            }
            return $xs;
        }
    }
    $xs = [];
    for ($i = 0; $i < $n; $i++) {
        $xs[] = (int) round($lo + ($i + 0.5) * ($hi - $lo) / $n);
    }
    return $xs;
}
function room_start_round(array &$room): void
{
    $room['watchTurns'] = 0;
    $room['round'] += 1;
    $w = 720;
    if ($room['map'] !== null && isset(ROOM_MAPS[$room['map']])) {
        // A picked map replays its own hills every time: terrain comes from
        // the hidden seed plus the round, never from the live stream.
        $mrng = room_hash_seed(ROOM_MAPS[$room['map']]['seed'] . '|round' . $room['round']);
        $room['terrain'] = room_gen_terrain($mrng, $w);
    } else {
        $room['terrain'] = room_gen_terrain($room['rng'], $w);
    }
    room_terrain_changed($room);
    $room['wind'] = (int) round(room_rng_range($room['rng'], -8, 8));
    $slots = room_spawn_spots($room['rng'], max(1, room_fielded($room)), $w);
    $room['tanks'] = [];
    $seat = 0;
    foreach ($room['seats'] as $idx => $s) {
        if ($s['human'] && ($s['lives'] ?? 0) <= 0) {
            continue; // eliminated humans stay out
        }
        if (!$s['human'] && ($s['mode'] ?? 'ai') === 'open') {
            continue; // nobody plays an open seat
        }
        $armor = $s['human'] ? 100 + 25 * ($room['plate'][$idx] ?? 0) : 60 + 6 * ($room['round'] - 1);
        $room['tanks'][] = [
            'seat' => $idx,
            'kind' => $s['human'] ? 'human' : 'ai',
            'name' => $s['human'] ? $s['initials'] : $s['initials'],
            'x' => $slots[$seat % count($slots)],
            'y' => 0,
            'angle' => 62.0,
            'power' => 55.0,
            'hp' => $armor,
            'maxHp' => $armor,
            'fuel' => $s['human'] ? 80 : 0,
            'dirS' => $slots[$seat % count($slots)] < $w / 2 ? 1 : -1, // face the middle
            'ammo' => $s['human']
                ? ($room['ammo'][$idx] ?? ['shell' => -1, 'buck' => 1])
                : room_ai_rack($room['round']),
        ];
        $seat++;
    }
    foreach ($room['tanks'] as &$t) {
        $xi = max(0, min($w - 1, (int) round($t['x'])));
        $t['y'] = $room['terrain'][$xi];
        if ($t['kind'] === 'ai') {
            // A drone keeps its strategy from round to round; a new one is dealt one.
            $room['tactic'][$t['seat']] ??= room_deal_tactic($room, $t['seat']);
            $t['s'] = $room['tactic'][$t['seat']];
        }
    }
    unset($t);
    $room['turn'] = 0;
    $room['phase'] = count($room['tanks']) ? 'play' : 'over';
    // Callers announce the new round through the sequenced event batch.
}
function room_advance(array &$room, array &$events): void
{
    // Skip the dead; run AI turns inline (bounded) until a human is up.
    $n = count($room['tanks']);
    for ($guard = 0; $guard < 2 * $n + 4; $guard++) {
        $alive = [];
        foreach ($room['tanks'] as $i => $t) {
            if ($t['hp'] > 0) {
                $alive[] = $i;
            }
        }
        if (!count($alive)) {
            room_end_round($room, $events);
            return;
        }
        $cur = null;
        foreach ($alive as $i) {
            if ($i >= $room['turn'] && $cur === null) {
                $cur = $i;
            }
        }
        if ($cur === null) {
            $cur = $alive[0];
        }
        $room['turn'] = $cur;
        $t = $room['tanks'][$cur];
        if ($t['kind'] === 'human') {
            // A human's turn runs on a clock (room_turn_left): when it runs
            // out, the crew loads a random gun from the rack and fires it with
            // the current aim, so one absent player never holds up the room.
            if (room_turn_left($room) > 0) {
                return; // waiting on this human's move
            }
            $wkey = room_random_gun($room, $t['seat']);
            $have = $room['ammo'][$t['seat']][$wkey] ?? 0;
            $events[] = ['t' => 'auto', 'seat' => $t['seat'], 'w' => $wkey,
                'x' => round($t['x'], 1), 'a' => round($t['angle'], 1), 'pw' => round($t['power'], 1)];
            if ($wkey !== 'shell') {
                $room['ammo'][$t['seat']][$wkey] = max(0, $have - 1);
                $room['tanks'][$cur]['ammo'][$wkey] = $room['ammo'][$t['seat']][$wkey];
                if ($have - 1 <= 0) {
                    $room['weapon'][$t['seat']] = 'shell';
                }
            }
            room_fire_shot($room, $events, $cur, $wkey);
            $room['seats'][$t['seat']]['lastAct'] = microtime(true);
            if (room_round_settled($room)) {
                room_end_round($room, $events);
                return;
            }
            $room['turn'] = $cur + 1;
            continue;
        }
        // AI takes its turn right now, server side. With no human standing the
        // drones fight on one turn per poll, paced to the last volley.
        $watching = !room_humans_alive($room);
        if ($watching && !room_pace_ready($room)) {
            return;
        }
        $choice = room_ai_choose($room, $t);
        $room['tanks'][$cur]['angle'] = $choice['angle'];
        $room['tanks'][$cur]['power'] = $choice['power'];
        $width = count($room['terrain']);
        $nx = max(12.0, min($width - 12.0, $room['tanks'][$cur]['x'] + ($choice['dx'] ?? 0)));
        if (abs($choice['dx'] ?? 0) > 0.5 && !room_spot_taken($room, $cur, $nx)) {
            $room['tanks'][$cur]['x'] = $nx;
            $xi = max(0, min($width - 1, (int) round($room['tanks'][$cur]['x'])));
            $room['tanks'][$cur]['y'] = $room['terrain'][$xi];
        }
        if (isset($room['tanks'][$cur]['brk'])) {
            $room['tanks'][$cur]['brk']['ox'] = $room['tanks'][$cur]['x']; // the bracket remembers where it fired from
        }
        if ($choice['wkey'] !== 'shell') {
            $room['tanks'][$cur]['ammo'][$choice['wkey']] = max(0, ($room['tanks'][$cur]['ammo'][$choice['wkey']] ?? 0) - 1);
        }
        $me = $room['tanks'][$cur];
        if (isset($choice['tactic'])) {
            $events[] = ['t' => 'tactic', 'seat' => $t['seat'], 's' => $choice['tactic']];
        }
        $events[] = ['t' => 'aifire', 'seat' => $t['seat'], 'w' => $choice['wkey'],
            'x' => round($me['x'], 1), 'a' => round($me['angle'], 1), 'pw' => round($me['power'], 1)];
        if ($watching) {
            $events[count($events) - 1]['watch'] = true; // nobody left to play: clients speed it up
        }
        room_fire_shot($room, $events, $cur, $choice['wkey']);
        if ($watching) {
            $room['watchTurns'] = ($room['watchTurns'] ?? 0) + 1;
        }
        if (room_round_settled($room) || ($room['watchTurns'] ?? 0) >= ROOM_WATCH_TURNS) {
            room_end_round($room, $events);
            return;
        }
        // Pass the turn on like every other shot: without this the same
        // drone fires up to a dozen times per call and humans never move.
        $room['turn'] = $cur + 1;
        if ($watching || !room_humans_alive($room)) {
            return; // the last human just fell: the next drone waits for its poll
        }
    }
}
/* A round ends when one unit is left standing, human or drone, or none (the
// last two fell together). */
function room_round_settled(array $room): bool
{
    $alive = 0;
    foreach ($room['tanks'] as $t) {
        if ($t['hp'] > 0) {
            $alive++;
        }
    }
    return $alive <= 1;
}
/* Settle a round: only a human who is the last unit standing is paid (the
// round bonus and prize, 'roundwin' with the winner's seat); a drone survivor
// or nobody left is 'roundlost'. Every human whose tank was wrecked loses a
// life, and at 0 is eliminated. No human with a life left ends the match;
// otherwise the shop opens, won or lost. */
function room_end_round(array &$room, array &$events): void
{
    // Trick timers tick down on settled rounds.
    foreach ($room['seats'] as $idx => $s) {
        if (!($s['human'] ?? false)) {
            continue;
        }
        if (($room['jammer'][$idx] ?? 0) > 0) {
            $room['jammer'][$idx]--;
        }
        if (($room['bunker'][$idx] ?? 0) > 0) {
            $room['bunker'][$idx]--;
        }
    }
    $alive = array_values(array_filter($room['tanks'], fn($t) => $t['hp'] > 0));
    $winner = count($alive) === 1 && $alive[0]['kind'] === 'human' ? $alive[0] : null;
    $wrecked = [];
    foreach ($room['tanks'] as $t) {
        if ($t['hp'] <= 0) {
            $wrecked[$t['seat']] = true;
        }
    }
    $anyLeft = false;
    foreach ($room['seats'] as $idx => &$s) {
        if (!($s['human'] ?? false)) {
            continue;
        }
        if (isset($wrecked[$idx])) {
            $s['lives'] = max(0, ($s['lives'] ?? 3) - 1);
            if ($s['lives'] <= 0) {
                room_save_score($s['initials'], $room['scores'][$idx] ?? 0, $room);
                $events[] = ['t' => 'eliminated', 'seat' => $idx];
            }
        }
        if (($s['lives'] ?? 0) > 0) {
            $anyLeft = true;
        }
    }
    unset($s);
    if ($winner !== null) {
        $bonus = 750 + $room['round'] * 150;
        $prize = 500 + $room['round'] * 100;
        $room['scores'][$winner['seat']] = ($room['scores'][$winner['seat']] ?? 0) + $bonus;
        $room['cash'][$winner['seat']] = ($room['cash'][$winner['seat']] ?? 0) + $prize;
        $events[] = ['t' => 'roundwin', 'round' => $room['round'], 'seat' => $winner['seat']];
    } else {
        $events[] = ['t' => 'roundlost', 'round' => $room['round']];
    }
    unset($room['pace']);
    if (!$anyLeft) {
        $room['phase'] = 'over';
        $events[] = ['t' => 'matchover'];
        return;
    }
    // Every round starts from the shop, won or lost.
    $room['phase'] = 'shop';
    $room['shop'] = ['at' => microtime(true), 'ready' => []];
}
/* File a room score into the same per-initials store as local play. */
function room_save_score(string $initials, int $score, array $room): void
{
    $slug = strtolower(preg_replace('/[^a-z0-9_-]+/i', '-', $initials) ?: 'anonymous');
    $path = room_scores_dir() . '/' . $slug . '-' . ROOM_GAME . '.json';
    $fh = @fopen($path, 'c+b');
    if ($fh === false) {
        return;
    }
    if (!flock($fh, LOCK_EX)) {
        fclose($fh);
        return;
    }
    rewind($fh);
    $raw = stream_get_contents($fh);
    $data = is_string($raw) && trim($raw) !== '' ? json_decode($raw, true) : null;
    if (!is_array($data) || !isset($data['runs']) || !is_array($data['runs'])) {
        $data = ['name' => $slug, 'runs' => [], 'best' => 0];
    }
    $data['runs'][] = ['score' => $score, 'banked' => 0, 'won' => false, 'seed' => 'room:' . $room['code'], 'ts' => gmdate('c')];
    $data['runs'] = array_slice($data['runs'], -50);
    $best = 0;
    foreach ($data['runs'] as $r) {
        $best = max($best, (int) $r['score']);
    }
    $data['best'] = $best;
    $tmp = $path . '.tmp.' . getmypid();
    $fh2 = fopen($tmp, 'wb');
    if ($fh2 !== false) {
        fwrite($fh2, (string) json_encode($data, JSON_UNESCAPED_SLASHES));
        fflush($fh2);
        if (function_exists('fsync')) {
            fsync($fh2);
        }
        fclose($fh2);
        rename($tmp, $path);
    }
    flock($fh, LOCK_UN);
    fclose($fh);
}
/* 1-ups, same economy as local play. */
function room_check_oneups(array &$room, array &$events, int $seat): void
{
    $lives = $room['seats'][$seat]['lives'] ?? 3;
    $next = $room['nextUp'][$seat] ?? 3000;
    $score = $room['scores'][$seat] ?? 0;
    while ($score >= $next) {
        $next += 3000;
        if ($lives < 5) {
            $lives += 1;
            $events[] = ['t' => 'oneup', 'seat' => $seat, 'lives' => $lives];
        }
    }
    $room['seats'][$seat]['lives'] = $lives;
    $room['nextUp'][$seat] = $next;
}
function room_find_seat(array $room, string $token): ?int
{
    foreach ($room['seats'] as $idx => $s) {
        if (($s['human'] ?? false) && isset($s['token']) && hash_equals((string) $s['token'], $token)) {
            return $idx;
        }
    }
    return null;
}

/* Banked shop repair and fuel go onto the freshly mustered human tanks.
   Tanks muster at full armor, so repair rides on top for this round, the
   same as solo play. */
function room_apply_banked(array &$room): void
{
    foreach ($room['tanks'] as &$t) {
        if ($t['kind'] !== 'human') {
            continue;
        }
        $t['hp'] += ($room['repairApplied'][$t['seat']] ?? 0);
        $t['maxHp'] = $t['hp'];
        $t['fuel'] += ($room['fuelApplied'][$t['seat']] ?? 0);
    }
    unset($t);
}

/* A human walks away. The last human out closes the room, freeing its slot
   at once; otherwise the battery takes over the seat, host included: a match
   that has begun carries on for everyone else (nothing after the lobby is
   host-only). Only in the lobby does the host leaving close the room, since
   nobody else can start it. */
function room_leave(array &$room, int $seat): bool
{
    $humans = 0;
    foreach ($room['seats'] as $idx => $s) {
        if ($idx !== $seat && ($s['human'] ?? false)) {
            $humans++;
        }
    }
    if ($humans === 0 || ($room['phase'] === 'lobby' && $seat === 0)) {
        return false; // close the room
    }
    if ($room['phase'] === 'lobby') {
        $room['seats'][$seat] = room_idle_seat($seat); // the chair goes back to the battery
        return true;
    }
    $name = strtoupper((string) ($room['seats'][$seat]['initials'] ?? 'AI'));
    // A bot drives the seat from here; 'bot' marks the unit for everyone.
    $room['seats'][$seat] = ['human' => false, 'name' => $name, 'initials' => $name, 'mode' => 'ai', 'bot' => true,
        'lives' => $room['seats'][$seat]['lives'] ?? 0];
    foreach ($room['tanks'] as &$t) {
        if ($t['seat'] === $seat) {
            $t['kind'] = 'ai';
            $t['ammo'] = room_ai_rack((int) $room['round']);
            $room['tactic'][$seat] = room_deal_tactic($room, $seat);
            $t['s'] = $room['tactic'][$seat];
        }
    }
    unset($t);
    return true;
}
