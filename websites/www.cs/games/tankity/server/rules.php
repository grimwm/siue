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

/* Exactly three letters, typed in either case, stored uppercase; a blocked set is refused. */
function room_valid_initials($raw): ?string
{
    return tankity_initials(tankity_guard(), $raw);
}
/* A turn is identified by round, turn slot and the count of shots fired so
// far, so the same player coming round again starts a fresh clock. */
function room_turn_key(array $room): string
{
    return ($room['round'] ?? 1) . ':' . $room['turn'] . ':' . ($room['shots'] ?? 0);
}
/* Seconds left on the turn clock of whoever's turn it is (null when it is
// not a human's turn). The clock starts when a turn begins, stamped with the
// room's turn time of that moment: aiming and driving do not reset it, and a
// later change of the turn time waits for the next turn. A clock without
// seconds (a room from before the setting) reads as the default. */
function room_turn_left(array &$room): ?float
{
    $t = $room['tanks'][$room['turn']] ?? null;
    if (($room['phase'] ?? '') !== 'play' || !$t || $t['kind'] !== 'human' || $t['hp'] <= 0) {
        return null;
    }
    $key = room_turn_key($room);
    if (($room['clock']['key'] ?? '') !== $key) {
        $room['clock'] = ['key' => $key, 'at' => microtime(true), 'secs' => room_turn_secs($room)];
    }
    $secs = (int) ($room['clock']['secs'] ?? ROOM_TURN_DEFAULT);
    return max(0.0, $secs - (microtime(true) - (float) $room['clock']['at']));
}
/* Seconds left on the shop clock (null outside the shop). It starts when the
// round is won (room_end_round stamps shop.at and shop.secs); a shop from
// before the stamp reads 90. */
function room_shop_left(array $room): ?float
{
    if (($room['phase'] ?? '') !== 'shop') {
        return null;
    }
    $at = (float) ($room['shop']['at'] ?? microtime(true));
    $secs = (int) ($room['shop']['secs'] ?? 90);
    return max(0.0, $secs - (microtime(true) - $at));
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
    // Fuel bought in the shop rides in a bank until the tanks muster.
    foreach ($room['seats'] as $idx => $s) {
        if (!($s['human'] ?? false)) {
            continue;
        }
        // A repair a room banked before armor was tracked lands now, capped at max.
        $legacyRepair = (int) ($room['repair'][$idx] ?? 0);
        if ($legacyRepair > 0) {
            room_repair($room, $idx, $legacyRepair);
            $room['repair'][$idx] = 0;
        }
        $room['fuelApplied'][$idx] = $room['fuelBonus'][$idx] ?? 0;
        $room['fuelBonus'][$idx] = 0;
    }
    unset($room['shop']);
    room_start_round($room);
    room_apply_fuel($room);
    $events = [['t' => 'round', 'round' => $room['round'], 'wind' => $room['wind']]];
    room_advance($room, $events);
    foreach ($events as $e) {
        room_emit($room, $e);
    }
    return true;
}
/* A human's turn ran out: a drone takes this one shot for them, aimed as the
// room's drones aim, with a gun from the player's own rack (the Shell when the
// drone's pick is not in the rack or not yet unlocked). It never drives. The
// seat stays the player's. Answers the gun. */
function room_standin_shot(array &$room, int $cur): string
{
    $t = $room['tanks'][$cur];
    // room_ai_choose also leaves aim memory (s, dry, dealt, brk) on the tank; only the
    // room-level strategy bookkeeping is restored, since nothing reads those for a human and
    // the next stand-in is better for the bracket.
    $tactic = $room['tactic'] ?? null; // the drone's strategy bookkeeping is not the player's
    $choice = room_ai_choose($room, $t);
    if ($tactic === null) {
        unset($room['tactic']);
    } else {
        $room['tactic'] = $tactic;
    }
    $wkey = (string) $choice['wkey'];
    $def = room_weapons()[$wkey] ?? null;
    $have = $room['ammo'][$t['seat']][$wkey] ?? 0;
    if ($wkey !== 'shell' && ($def === null || $have <= 0 || ($room['round'] ?? 1) < ($def['minRound'] ?? 1))) {
        $wkey = 'shell';
    }
    $room['tanks'][$cur]['angle'] = (float) $choice['angle'];
    $room['tanks'][$cur]['power'] = (float) $choice['power'];
    return $wkey;
}
/* Applies what is due as of now: in play, the turn that ran out and the
// drones' paced turns; in the shop, its clock. The caller holds the room and
// saves it. */
function room_tick(array &$room): void
{
    if ($room['phase'] === 'play') {
        $events = [];
        room_advance($room, $events);
        foreach ($events as $e) {
            room_emit($room, $e);
        }
    } elseif ($room['phase'] === 'shop') {
        room_shop_settle($room);
    }
}
/* Whether room_tick would change anything, from a read. */
function room_tick_due(array $room): bool
{
    if ($room['phase'] === 'shop') {
        return room_shop_left($room) <= 0;
    }
    if ($room['phase'] !== 'play') {
        return false;
    }
    $t = $room['tanks'][$room['turn']] ?? null;
    if (!$t) {
        return false;
    }
    if ($t['kind'] !== 'human' || $t['hp'] <= 0) {
        return room_pace_ready($room);
    }
    if (($room['clock']['key'] ?? '') !== room_turn_key($room)) {
        return true;
    }
    return room_turn_left($room) <= 0;
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
/* A human's aim, as an act sends it (null leaves that part as it is): the
// angle kept inside the limits of the gun the seat has loaded
// (room_aim_limits: 10..170, or a beam's dip), the power 10..100. Called
// again with nulls after a gun switch, so the barrel comes back inside the
// new gun's limits. */
function room_set_aim(array &$room, int $idx, int $seat, $angle, $power): void
{
    $weapons = room_weapons();
    [$lo, $hi] = room_aim_limits($weapons[$room['weapon'][$seat] ?? 'shell'] ?? null);
    $t = &$room['tanks'][$idx];
    $t['angle'] = max($lo, min($hi, is_numeric($angle) ? (float) $angle : (float) $t['angle']));
    $t['power'] = max(10.0, min(100.0, is_numeric($power) ? (float) $power : (float) $t['power']));
    unset($t);
}
/* A human's drive of $dx px (at most 80 either way) for the tank at $idx:
// toward the goal a pixel at a time, stopping short of any other unit; fuel
// pays only for the ground covered, and the tank sits on the ground where it
// stops. Null when it went, else [HTTP status, the player's line]: a buried
// tank cannot drive, nor one short of fuel. */
function room_drive(array &$room, int $idx, float $dx): ?array
{
    $tank = $room['tanks'][$idx];
    $dx = max(-80.0, min(80.0, $dx));
    if (room_buried($tank, $room['terrain'])) {
        return [409, 'You are buried: dig out first (a Riot Charge or a digger).'];
    }
    if (abs($dx) > $tank['fuel'] + 1e-9) {
        return [422, 'not enough fuel'];
    }
    $w = count($room['terrain']);
    $goal = max(12.0, min($w - 12.0, $tank['x'] + $dx));
    $step = $goal > $tank['x'] ? 1.0 : -1.0;
    $nx = (float) $tank['x'];
    while (abs($goal - $nx) >= 1.0 && !room_spot_taken($room, $idx, $nx + $step)) {
        $nx += $step;
    }
    if (abs($goal - $nx) < 1.0) {
        $nx = $goal;
    }
    $room['tanks'][$idx]['fuel'] = max(0.0, $tank['fuel'] - abs($nx - $tank['x']));
    $room['tanks'][$idx]['x'] = $nx;
    $room['tanks'][$idx]['y'] = room_surf_y($room['terrain'], $nx);
    return null;
}
function room_fire_shot(array &$room, array &$events, int $seatIdx, string $wkey): void
{
    $room['shots'] = ($room['shots'] ?? 0) + 1; // a fresh turn clock follows each shot
    $firstEvent = count($events) - 1; // the opener of this volley
    foreach ($room['tanks'] as $i => $t) {
        unset($room['tanks'][$i]['chute']); // the last volley's parachutes are down
    }
    $tank = &$room['tanks'][$seatIdx];
    $weapons = room_weapons();
    $w = $weapons[$wkey] ?? $weapons['shell'];
    // A gun always leaves inside its own limits (src/sim.ts fireWeapon is the same).
    [$aimLo, $aimHi] = room_aim_limits($w);
    $tank['angle'] = max($aimLo, min($aimHi, (float) $tank['angle']));
    $shots = ($w['pellets'] ?? 0) > 0 ? $w['pellets'] : 1;
    $rad = deg2rad($tank['angle']);
    $dirS = $tank['dirS'] ?? -1;
    $radius = (float) $w['radius'];
    $events[count($events) - 1]['at'] = 0.0; // the fire/aifire that opened this volley
    // A beam, a plasma ring or a riot charge has no flight: it resolves the moment it fires.
    $effect = $w['effect'] ?? 'shot';
    if (!room_flies($w)) {
        $mark = count($events);
        if ($effect === 'beam') {
            room_fire_beam($room, $events, $seatIdx, $w, $wkey);
        } elseif ($effect === 'plasma') {
            room_fire_plasma($room, $events, $seatIdx, $w, $wkey);
        } else {
            // The barrel's heading as src/sim.ts fireWeapon reads it.
            room_fire_riot($room, $events, $seatIdx, $w, $wkey, det_atan2(-det_sin($rad), det_cos($rad) * $dirS));
        }
        room_stamp($events, $mark, 0.0);
        $shots = 0;
    }
    for ($i = 0; $i < $shots; $i++) {
        $off = $shots === 1 ? 0 : ($i - ($shots - 1) / 2) * ($w['spread'] ?? 0.0);
        $a = $rad + $off;
        $spd = room_shot_speed($tank['power'], (float) ($w['speed'] ?? 1.0), room_field_reach(count($room['terrain'])));
        [$mx, $my] = room_muzzle($tank);
        $vx = det_cos($a) * $spd * $dirS;
        $vy = -det_sin($a) * $spd;
        $res = room_fly_arc($room, $events, $tank, $w, $wkey, $seatIdx, $mx, $my, $vx, $vy, 0.0, (float) ($w['fuse'] ?? 0.9), null, 0.0);
        if ($effect === 'tracer') {
            // A tracer bursts on nothing: its flight is all there is, radius 0.
            $ev = room_shot_event($tank, $wkey, 0.0, $res, 0.0);
            $ev['at'] = 0.0;
            $events[] = $ev;
            continue;
        }
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
            room_fly_siblings($room, $events, $seatIdx, $w, $wkey, $res[1], $res[2], $fanned, 99.0, $sub, $tSplit, null);
            continue;
        }
        // An earth gun's burst is its own event (room_earth_burst), and a
        // napalm shell's its pool (room_fire_burn), not a blast.
        $earth = in_array($effect, ['dirt', 'pour', 'slump', 'dig'], true);
        $fire = $effect === 'napalm';
        $ev = room_shot_event($tank, $wkey, 0.0, $res, $res[0] === 'hit' && !$earth && !$fire ? $radius : 0.0);
        $ev['at'] = 0.0;
        $events[] = $ev;
        $mark = count($events);
        if ($res[0] === 'hit' && ($earth || $fire)) {
            room_brk_land($tank, $res[1]);
            unset($tank);
            if ($fire) {
                room_fire_burn($room, $events, $seatIdx, $w, $wkey, $res, $res[7]);
            } else {
                room_earth_burst($room, $events, $seatIdx, $w, $wkey, $res, $res[7]);
            }
            $tank = &$room['tanks'][$seatIdx];
        } elseif ($res[0] === 'hit') {
            room_brk_land($tank, $res[1]);
            room_explode($room, $events, $tank, $wkey, $res[1], $res[2], $res[5], null);
        } else {
            $events[] = ['t' => 'fizzle', 'by' => $tank['seat'], 'w' => $wkey];
        }
        room_stamp($events, $mark, $res[7]);
        if ($res[0] === 'hit' && ($w['effect'] ?? 'shot') === 'hop') {
            room_fire_hops($room, $events, $seatIdx, $w, $wkey, $res, $res[7]);
        }
        if ($res[0] === 'hit' && ($w['effect'] ?? 'shot') === 'scatter') {
            room_fire_scatter($room, $events, $seatIdx, $w, $wkey, $res, $res[7]);
        }
    }
    unset($tank);
    // The dust settles: whoever lost their ground falls, as the volley ends.
    $end = 0.0;
    for ($i = max(0, $firstEvent), $n = count($events); $i < $n; $i++) {
        $end = max($end, (float) ($events[$i]['t1'] ?? 0.0), (float) ($events[$i]['at'] ?? 0.0));
    }
    $mark = count($events);
    room_settle_tanks($room, $events);
    room_stamp($events, $mark, $end);
    room_pace_stamp($room, $events, $firstEvent);
}
/* An earth gun bursts ($res, at $t seconds): dirt (a blast with no crater
// when it does damage, then a disc of dirt), pour (liquid dirt at its column),
// slump (the slopes round it slump; it owns the falls) or dig (it burrows on,
// room_fire_dig). Each moves the ground and says so in its own event.
// src/sim.ts burstShell is the same. */
function room_earth_burst(array &$room, array &$events, int $seatIdx, array $w, string $wkey, array $res, float $t): void
{
    $tank = $room['tanks'][$seatIdx];
    [, $x, $y] = $res;
    $effect = $w['effect'];
    if ($effect === 'dig') {
        room_fire_dig($room, $events, $seatIdx, $w, $wkey, $res, $t);
        return;
    }
    if ($effect === 'dirt' && (int) $w['dmg'] > 0) {
        room_explode($room, $events, $tank, $wkey, $x, $y, $res[5], ['carve' => false]);
    }
    $ground = [];
    foreach ($room['tanks'] as $i => $o) {
        $ground[$i] = room_surf_y($room['terrain'], (float) $o['x']);
    }
    $before = $room['terrain'];
    if ($effect === 'dirt') {
        $events[] = ['t' => 'dirt', 'w' => $wkey, 'x' => $x, 'y' => $y, 'r' => (float) $w['radius']];
        room_add_dirt($room['terrain'], $x, $y, (float) $w['radius']);
    } elseif ($effect === 'pour') {
        $col = (int) det_round(max(0.0, min((float) (count($room['terrain']) - 1), $x)));
        $events[] = ['t' => 'pour', 'w' => $wkey, 'x' => $col, 'v' => (float) $w['volume'], 'm' => (float) $w['poolMin']];
        room_fill_pour($room['terrain'], room_pour_level($room['terrain'], (float) $col, (float) $w['volume'], (float) $w['poolMin']));
    } else {
        $events[] = ['t' => 'slump', 'w' => $wkey, 'x' => $x, 'r' => (float) $w['radius'], 'slope' => (float) $w['slope'], 'passes' => (int) $w['passes']];
        room_slump_ground($room['terrain'], $x, (float) $w['radius'], (float) $w['slope'], (int) $w['passes']);
    }
    if ($room['terrain'] !== $before) {
        room_terrain_changed($room);
    }
    room_mark_falls($room, $ground, $seatIdx);
}
/* A napalm shell bursts ($res, at $t seconds): its pool (room_fire_pool,
// poured at the burst's column on the ground of this moment, which it never
// changes) burns from then until its last tick, its 'burn' event first (the
// pool, and t1 when it goes out). Every tick (room_tick_steps sim steps
// apart, room_burn_ticks of them) each living unit, in seat order, whose body
// reaches into the flames (room_in_flames) and is not buried under the ground
// the pool lies on (room_buried) takes dmg through room_hit_unit
// (a shield eats one tick whole, a bunker halves each), credited to the
// gunner, its gunner's own burns included (they score nothing). Its hits and
// kills are stamped at their tick. A pool that spilled away burns nothing.
// The whole burn is part of the volley that fired it: the next turn starts
// after its last tick. src/sim.ts stepFires is the same. */
function room_fire_burn(array &$room, array &$events, int $seatIdx, array $w, string $wkey, array $res, float $t): void
{
    $col = (int) det_round(max(0.0, min((float) (count($room['terrain']) - 1), $res[1])));
    $pool = room_fire_pool($room['terrain'], (float) $col, (float) $w['volume'], (float) $w['flame'], (float) $w['poolMin']);
    $n = $pool['x0'] <= $pool['x1'] ? room_burn_ticks((float) $w['burn'], (float) $w['tick']) : 0;
    $every = room_tick_steps((float) $w['tick']);
    $events[] = ['t' => 'burn', 'by' => $room['tanks'][$seatIdx]['seat'], 'w' => $wkey, 'x' => $col, 'v' => (float) $w['volume'],
        'level' => $pool['level'], 'x0' => $pool['x0'], 'x1' => $pool['x1'], 'flame' => $pool['flame'],
        'at' => round($t, 3), 't1' => round($t + $n * $every / 60, 3)];
    for ($k = 1; $k <= $n; $k++) {
        $mark = count($events);
        foreach (array_keys($room['tanks']) as $i) {
            if ($room['tanks'][$i]['hp'] > 0 && !room_buried($room['tanks'][$i], $room['terrain']) && room_in_flames($pool, room_unit_box($room['tanks'][$i]))) {
                room_hit_unit($room, $events, $i, (int) $w['dmg'], $room['tanks'][$seatIdx], $seatIdx, $w, false);
            }
        }
        room_stamp($events, $mark, $t + $k * $every / 60);
    }
}
/* A digger touched down ($res, at $t seconds; struck a unit in flight, it
// stops at once): it burrows on along its heading ROOM_DIG_STEP px a step,
// for ceil(digLen / ROOM_DIG_STEP) steps, cutting a crater of digR at each
// (owning the falls it digs) and bursting each warhead as it falls due
// (warhead k at step ceil(k n / warheads)). A unit's body at the next point
// (its gunner's only once the shell has left it) stops it there; so does the
// field's side or its floor, at the last point cut. Any warheads left burst
// where it stopped. Its 'dig' event (where it started, its heading, the steps
// cut, from $t to t1) comes before the bursts. src/sim.ts stepDigger is the same. */
function room_fire_dig(array &$room, array &$events, int $seatIdx, array $w, string $wkey, array $res, float $t): void
{
    $width = count($room['terrain']);
    [, $x, $y] = $res;
    [$x0, $y0] = [$x, $y];
    [$ux, $uy] = room_dig_heading($res[3], $res[4]);
    $n = (int) ceil($w['digLen'] / ROOM_DIG_STEP);
    $heads = (int) $w['warheads'];
    $sub = ['dmg' => (int) $w['subDmg'], 'radius' => (int) $w['subRadius']];
    $clear = $res[8] ?? true;
    $at = count($events);
    $done = 0;
    $k = 0;
    $stopAt = $t;
    $burst = function (float $when) use (&$room, &$events, &$k, $seatIdx, $wkey, $sub, &$x, &$y): void {
        $k++;
        $mark = count($events);
        room_explode($room, $events, $room['tanks'][$seatIdx], $wkey, $x, $y, null, $sub);
        $events[] = ['t' => 'burst', 'x' => round($x, 1), 'y' => round($y, 1), 'r' => (float) $sub['radius'], 'w' => $wkey];
        room_stamp($events, $mark, $when);
    };
    for ($i = 1; $res[5] === null && $i <= $n; $i++) {
        $nx = $x + $ux * ROOM_DIG_STEP;
        $ny = $y + $uy * ROOM_DIG_STEP;
        if ($nx < 0 || $nx > $width - 1 || $ny >= ROOM_EARTH_FLOOR) {
            break;
        }
        if (!$clear && !room_in_box($room['tanks'][$seatIdx], $nx, $ny)) {
            $clear = true;
        }
        $hit = false;
        foreach ($room['tanks'] as $j => $u) {
            if ($u['hp'] > 0 && !($j === $seatIdx && !$clear) && room_in_box($u, $nx, $ny)) {
                $hit = true;
                break;
            }
        }
        [$x, $y] = [$nx, $ny];
        $stopAt = $t + $i / 60;
        if ($hit) {
            break;
        }
        $done = $i;
        $ground = [];
        foreach ($room['tanks'] as $j => $o) {
            $ground[$j] = room_surf_y($room['terrain'], (float) $o['x']);
        }
        $before = $room['terrain'];
        room_carve_crater($room['terrain'], $x, $y, (float) $w['digR']);
        if ($room['terrain'] !== $before) {
            room_terrain_changed($room);
        }
        room_mark_falls($room, $ground, $seatIdx);
        while ($k < $heads && $i >= intdiv(($k + 1) * $n + $heads - 1, $heads)) {
            $burst($stopAt);
        }
    }
    while ($k < $heads) {
        $burst($stopAt);
    }
    array_splice($events, $at, 0, [['t' => 'dig', 'by' => $room['tanks'][$seatIdx]['seat'], 'w' => $wkey, 'x' => $x0, 'y' => $y0, 'ux' => $ux, 'uy' => $uy,
        'n' => $done, 'r' => (float) $w['digR'], 'at' => round($t, 3), 't1' => round($t + $done / 60, 3)]]);
}
/* A scatter weapon's bomblets, after its burst $res at $t seconds: thrown
// from two pixels above the burst (room_scatter_vel), each bursts on the
// ground at once (age 99, as a cluster bomblet does) and as it lands
// (room_fly_siblings), with subDmg/subRadius, never directly on the unit the
// burst struck. */
function room_fire_scatter(array &$room, array &$events, int $seatIdx, array $w, string $wkey, array $res, float $t): void
{
    $sub = ['dmg' => (int) ($w['subDmg'] ?? $w['dmg']), 'radius' => (int) ($w['subRadius'] ?? $w['radius'])];
    $n = max(2, (int) ($w['split'] ?? 4));
    $vels = room_scatter_vel($n, (float) ($w['fan'] ?? 0.22), (float) ($w['kick'] ?? 150.0));
    room_fly_siblings($room, $events, $seatIdx, $w, $wkey, $res[1], $res[2] - 2.0, $vels, 99.0, $sub, $t, $res[5]);
}
/* A hop weapon's later warheads, after its first burst $res at $t seconds:
// each leaps on from the last burst (room_hop_vel), one pixel up, and bursts
// with subDmg/subRadius, until `hops` warheads have burst or one leaves the
// field. Each is a 'shot' event of its own from the moment the last burst. */
function room_fire_hops(array &$room, array &$events, int $seatIdx, array $w, string $wkey, array $res, float $t): void
{
    $sub = ['dmg' => (int) ($w['subDmg'] ?? $w['dmg']), 'radius' => (int) ($w['subRadius'] ?? $w['radius'])];
    for ($hop = 1; $hop < (int) ($w['hops'] ?? 1) && $res[0] === 'hit'; $hop++) {
        $tank = $room['tanks'][$seatIdx];
        [$vx, $vy] = room_hop_vel($res[3], $res[4], (float) ($w['hopKeep'] ?? 0.5));
        $res = room_fly_arc($room, $events, $tank, $w, $wkey, $seatIdx, $res[1], $res[2] - 1.0, $vx, $vy, 0.0, false, $sub, $t, $res[5]);
        $ev = room_shot_event($tank, $wkey, $t, $res, $res[0] === 'hit' ? (float) $sub['radius'] : 0.0);
        $ev['at'] = round($t, 3);
        $events[] = $ev;
        $mark = count($events);
        if ($res[0] === 'hit') {
            room_brk_land($room['tanks'][$seatIdx], $res[1]);
            room_explode($room, $events, $tank, $wkey, $res[1], $res[2], $res[5], $sub);
        } else {
            $events[] = ['t' => 'fizzle', 'by' => $tank['seat'], 'w' => $wkey];
        }
        $t += $res[7];
        room_stamp($events, $mark, $t);
    }
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
        'difficulty' => 'normal', // the drones' aim: a ROOM_DIFFICULTY word, set by the host at create
        'host' => 0, // the seat that starts the match; the lowest human takes it if the host leaves
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
    $n = count(ROOM_AI_NAMES);
    $name = ROOM_AI_NAMES[(($slot - 1) % $n + $n) % $n]; // one name per seat, so slot 0 and slot 3 never share
    return ['human' => false, 'name' => $name, 'initials' => $name, 'lives' => 0, 'mode' => $mode === 'open' ? 'open' : 'ai'];
}
function room_seat_human(string $initials, string $token, array $body, string $addr): array
{
    // addr: the hashed client address that took the seat (room_idle_limit counts distinct ones).
    $seat = ['human' => true, 'initials' => $initials, 'token' => $token, 'lives' => 3, 'lastAct' => microtime(true), 'body' => room_body($body)];
    return $addr === '' ? $seat : $seat + ['addr' => $addr];
}
/* A seat's ammo at the start of a match: the endless Shell (-1), plus each
// row's start shells. src/sim.ts startAmmo is the same. */
function room_start_ammo(): array
{
    $ammo = ['shell' => -1];
    foreach (room_weapons() as $k => $def) {
        if ($k !== 'shell' && $def['start'] > 0) {
            $ammo[$k] = $def['start'];
        }
    }
    return $ammo;
}
/* Guns the arsenal has dropped (game.json arsenal.retired): key => what one
   shell refunds, its old price per shell (price / pack, rounded down). */
function room_retired(): array
{
    static $r = null;
    if ($r !== null) {
        return $r;
    }
    $r = [];
    foreach (room_arsenal()['retired'] ?? [] as $row) {
        if (is_array($row) && isset($row['key'])) {
            $r[(string) $row['key']] = intdiv(max(0, (int) ($row['price'] ?? 0)), max(1, (int) ($row['pack'] ?? 1)));
        }
    }
    return $r;
}
/* A room saved before a gun left the arsenal: each seat's shells of a
   retired gun are refunded at its old price per shell in room cash, any
   other key the arsenal lacks is dropped with no refund, a seat that had one
   loaded loads the Shell, and every unit's rack drops them (a drone's too).
   room_load runs it on every room, so the sim never meets a key it cannot
   fire; it changes nothing once the room is clean. True when it changed. */
function room_retire_guns(array &$room): bool
{
    $live = room_weapons();
    $retired = room_retired();
    $changed = false;
    foreach (is_array($room['ammo'] ?? null) ? $room['ammo'] : [] as $seat => $stock) {
        foreach (is_array($stock) ? $stock : [] as $k => $n) {
            if (isset($live[$k])) {
                continue;
            }
            $back = isset($retired[$k]) && is_numeric($n) && $n > 0 ? $retired[$k] * (int) $n : 0;
            if ($back > 0) {
                $room['cash'][$seat] = (int) ($room['cash'][$seat] ?? 0) + $back;
            }
            unset($room['ammo'][$seat][$k]);
            $changed = true;
        }
    }
    foreach (is_array($room['weapon'] ?? null) ? $room['weapon'] : [] as $seat => $w) {
        if (!is_string($w) || !isset($live[$w])) {
            $room['weapon'][$seat] = 'shell';
            $changed = true;
        }
    }
    foreach (is_array($room['tanks'] ?? null) ? $room['tanks'] : [] as $i => $t) {
        foreach (is_array($t['ammo'] ?? null) ? $t['ammo'] : [] as $k => $_) {
            if (!isset($live[$k])) {
                unset($room['tanks'][$i]['ammo'][$k]);
                $changed = true;
            }
        }
    }
    return $changed;
}
/* What a buy or a pick of a locked row says: its name and its round. */
function room_unlock_msg(string $name, int $minRound): string
{
    return "$name unlocks in round $minRound";
}
/* Every economy slot a new human seat needs, keyed by seat. */
function room_seat_economy(array &$room, int $seat): void
{
    $room['scores'][$seat] = 0;
    $room['cash'][$seat] = 600;
    $room['ammo'][$seat] = room_start_ammo();
    $room['weapon'][$seat] = 'shell';
    $room['nextUp'][$seat] = 3000;
    $room['plate'][$seat] = 0;
    $room['armor'][$seat] = ROOM_ARMOR;
    $room['chutes'][$seat] = 0;
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
    // Each human's gain this round counts from here.
    foreach ($room['stats'] ?? [] as $idx => $st) {
        $room['stats'][$idx]['from'] = $room['scores'][$idx] ?? 0;
    }
    $room['round'] += 1;
    $w = ROOM_W;
    if ($room['map'] !== null && isset(ROOM_MAPS[$room['map']])) {
        // A picked map replays its own hills every time: terrain comes from
        // the hidden seed plus the round, never from the live stream.
        $mrng = room_hash_seed(ROOM_MAPS[$room['map']]['seed'] . '|round' . $room['round']);
        $room['hills'] = room_gen_hills($mrng);
    } else {
        $room['hills'] = room_gen_hills($room['rng']);
    }
    $room['terrain'] = room_hills_terrain($room['hills'], $w);
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
        $armor = $s['human'] ? room_muster_armor($room, $idx) : 60 + 6 * ($room['round'] - 1);
        $max = $s['human'] ? room_max_armor($room, $idx) : $armor;
        $room['tanks'][] = [
            'seat' => $idx,
            'kind' => $s['human'] ? 'human' : 'ai',
            'name' => $s['human'] ? $s['initials'] : $s['initials'],
            'x' => $slots[$seat % count($slots)],
            'y' => 0,
            'angle' => 62.0,
            'power' => 55.0,
            'hp' => $armor,
            'maxHp' => $max,
            'fuel' => $s['human'] ? 80 : 0,
            'dirS' => $slots[$seat % count($slots)] < $w / 2 ? 1 : -1, // face the middle
            'ammo' => $s['human']
                ? ($room['ammo'][$idx] ?? room_start_ammo())
                : room_ai_rack($room['round']),
        ];
        if (!$s['human']) {
            $room['tanks'][count($room['tanks']) - 1]['chutes'] = room_drone_chutes($room['round']);
        }
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
            // out, a drone aims and fires for them (room_standin_shot), so one
            // absent player never holds up the room.
            if (room_turn_left($room) > 0) {
                return; // waiting on this human's move
            }
            $wkey = room_standin_shot($room, $cur);
            $t = $room['tanks'][$cur];
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
/* ---------- this match ---------- */
/* Called by the start handler: how many humans started (last-human-standing
   and the online board need two), each human's match stats from zero, and a
   fresh match id, so a browser tells one match from the next in a room whose
   code Play again keeps. */
function room_match_begin(array &$room): void
{
    $room['matchId'] = bin2hex(random_bytes(6));
    $room['startHumans'] = 0;
    $room['stats'] = [];
    $room['filed'] = [];
    $room['winner'] = null;
    $room['winBonus'] = 0;
    foreach ($room['seats'] as $idx => $s) {
        if ($s['human'] ?? false) {
            $room['startHumans']++;
            $room['stats'][$idx] = ['won' => 0, 'kills' => 0, 'gain' => 0, 'from' => 0, 'out' => null];
        }
    }
}
/* Whether the match is over after a round, and who won. No human with a life
   left ends it with no winner; in a room that started with two or more humans,
   exactly one left ends it and that one wins. Leaving is a forfeit: a leaver's
   seat is no longer human, so the other of the last two wins at the end of
   that round with the normal bonus. A room without room_match_begin
   reads startHumans as 1 and plays like solo. */
function room_match_outcome(array $room): array
{
    $left = [];
    foreach ($room['seats'] as $idx => $s) {
        if (($s['human'] ?? false) && ($s['lives'] ?? 0) > 0) {
            $left[] = $idx;
        }
    }
    if (!$left) {
        return ['over' => true, 'winner' => null];
    }
    if (($room['startHumans'] ?? 1) >= 2 && count($left) === 1) {
        return ['over' => true, 'winner' => $left[0]];
    }
    return ['over' => false, 'winner' => null];
}
/* The winner's bonus: twice the round bonus of the round the match ended in. */
function room_winner_bonus(int $round): int
{
    return 2 * (750 + $round * 150);
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
    // Armor carries into the next round; a wrecked tank re-musters at full max.
    foreach ($room['tanks'] as $t) {
        // A seat this round eliminates has no next tank; its armor stays as it was.
        $out = $t['hp'] <= 0 && ($room['seats'][$t['seat']]['lives'] ?? 3) <= 1;
        if ($t['kind'] === 'human' && !$out) {
            room_carry_armor($room, (int) $t['seat'], (int) $t['hp'], $t['hp'] <= 0);
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
    foreach ($room['seats'] as $idx => &$s) {
        if (!($s['human'] ?? false)) {
            continue;
        }
        if (isset($wrecked[$idx])) {
            $s['lives'] = max(0, ($s['lives'] ?? 3) - 1);
            if ($s['lives'] <= 0) {
                if (isset($room['stats'][$idx])) {
                    $room['stats'][$idx]['out'] = (int) $room['round'];
                }
                $events[] = ['t' => 'eliminated', 'seat' => $idx];
            }
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
    if ($winner !== null && isset($room['stats'][$winner['seat']])) {
        $room['stats'][$winner['seat']]['won']++;
    }
    unset($room['pace']);
    foreach ($room['stats'] ?? [] as $idx => $st) {
        $room['stats'][$idx]['gain'] = ($room['scores'][$idx] ?? 0) - $st['from'];
    }
    // Leave is a forfeit: a leaver is no longer human, so the other of the last
    // two wins here, at the end of the round they left in.
    $outcome = room_match_outcome($room);
    if ($outcome['over']) {
        if ($outcome['winner'] !== null) {
            $w = $outcome['winner'];
            $bonus = room_winner_bonus((int) $room['round']);
            $room['scores'][$w] = ($room['scores'][$w] ?? 0) + $bonus;
            if (isset($room['stats'][$w])) {
                $room['stats'][$w]['gain'] += $bonus;
            }
            $room['winner'] = $w;
            $room['winBonus'] = $bonus;
            $events[] = ['t' => 'matchwin', 'seat' => $w, 'bonus' => $bonus];
            room_file_seat($room, $w);
        }
        room_file_eliminated($room, $wrecked);
        $room['phase'] = 'over';
        $room['actedAt'] = time(); // the final standings stay up for one idle limit
        $events[] = ['t' => 'matchover'];
        return;
    }
    room_file_eliminated($room, $wrecked);
    // Every round starts from the shop, won or lost.
    $room['phase'] = 'shop';
    $room['shop'] = ['at' => microtime(true), 'secs' => room_shop_secs(room_turn_secs($room)), 'ready' => []];
}
/* Files the humans this round eliminated. The winner is filed first when the
   match ends, so each rank is the place on a board that already holds it. */
function room_file_eliminated(array &$room, array $wrecked): void
{
    foreach ($room['seats'] as $idx => $s) {
        if (($s['human'] ?? false) && ($s['lives'] ?? 0) <= 0 && isset($wrecked[$idx])) {
            room_file_seat($room, $idx);
        }
    }
}
/* Files a human seat's match score on the board of the room's difficulty,
   once per match. Inside the room's transaction: it commits with the room. A
   failure is logged, never allowed to break the round. A match fewer than two
   humans started never reaches the online board: the seat is marked 'local',
   and the snapshot tells its browser to keep the score itself. A leaver's
   seat turns into a drone but startHumans stays, so a two-human match one
   player forfeits still files online. */
function room_file_seat(array &$room, int $seat): void
{
    if (array_key_exists($seat, $room['filed'] ?? [])) {
        return;
    }
    if (($room['startHumans'] ?? 1) < 2) {
        $room['filed'][$seat] = 'local';
        return;
    }
    $s = $room['seats'][$seat] ?? [];
    try {
        $rank = board_file(['difficulty' => room_difficulty($room), 'initials' => strtoupper((string) ($s['initials'] ?? 'AAA')),
            'score' => (int) ($room['scores'][$seat] ?? 0), 'rounds' => (int) ($room['stats'][$seat]['won'] ?? 0),
            'seed' => 'room:' . $room['code'], 'source' => 'room']);
    } catch (Throwable $e) {
        // false, not null: the snapshot tells a filing that failed from a score
        // that filed but made no place. The write was rolled back, and a match
        // files once, so it is not retried.
        error_log("tankity board: room {$room['code']} seat $seat not filed: " . $e->getMessage());
        $rank = false;
    }
    $room['filed'][$seat] = $rank;
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
/* ---------- armor (src/armor.ts is the same) ---------- */
const ROOM_ARMOR = 100;
const ROOM_PLATE_ARMOR = 25;
/* A human seat's max armor: 100 plus 25 per hull plate fitted. */
function room_max_armor(array $room, int $seat): int
{
    return ROOM_ARMOR + ROOM_PLATE_ARMOR * (int) ($room['plate'][$seat] ?? 0);
}
/* The armor a seat's next tank musters with: what its last round ended with. */
function room_muster_armor(array $room, int $seat): int
{
    return (int) ($room['armor'][$seat] ?? room_max_armor($room, $seat));
}
/* The fewest repair packs that fill the hull; 0 at full armor. */
function room_repair_packs_wanted(array $room, int $seat, int $per): int
{
    $missing = room_max_armor($room, $seat) - room_muster_armor($room, $seat);
    return $missing <= 0 || $per <= 0 ? 0 : (int) ceil($missing / $per);
}
/* Restores up to $n armor, never past max; returns what it restored. */
function room_repair(array &$room, int $seat, int $n): int
{
    $have = room_muster_armor($room, $seat);
    $back = max(0, min($n, room_max_armor($room, $seat) - $have));
    $room['armor'][$seat] = $have + $back;
    return $back;
}
/* A plate raises max armor and adds the same armor now. */
function room_fit_plate(array &$room, int $seat, int $qty): void
{
    $have = room_muster_armor($room, $seat);
    $room['plate'][$seat] = (int) ($room['plate'][$seat] ?? 0) + $qty;
    $room['armor'][$seat] = $have + ROOM_PLATE_ARMOR * $qty;
}
/* The next round's armor: this round's end, or, after a wreck, a fresh tank at
   full max (the plates stay fitted). */
function room_carry_armor(array &$room, int $seat, int $hp, bool $wrecked): void
{
    $max = room_max_armor($room, $seat);
    $room['armor'][$seat] = $wrecked ? $max : min($hp, $max);
}
/* One purchase: ammo packs or a piece of gear. Null when it went through, else
   [HTTP status, the player's line]. One-shot tricks never stack, a repair buys
   only the packs that fill the hull, and round-one goods sell in the pre-match
   shop (round 0) as the browser's shelf does. */
function room_buy(array &$room, int $seat, string $item, int $qty): ?array
{
    // An eliminated human stays in the shop phase while others play on; refused so a seat that is out cannot move cash standings.
    if (($room['seats'][$seat]['lives'] ?? 1) <= 0) {
        return [409, 'You are out of this match.'];
    }
    $weapons = room_weapons();
    $qty = max(1, min(9, $qty));
    $gear = null;
    if ($item !== 'shell' && isset($weapons[$item])) {
        $minRound = (int) ($weapons[$item]['minRound'] ?? 1);
        $price = (int) $weapons[$item]['price'];
        $pack = (int) ($weapons[$item]['pack'] ?? 1);
    } elseif (($gear = room_gear($item)) !== null) {
        $minRound = (int) ($gear['minRound'] ?? 1);
        $price = (int) ($gear['price'] ?? 0);
        $pack = 0;
    } else {
        return [422, 'not for sale'];
    }
    if ((int) $room['round'] < ($minRound <= 1 ? 0 : $minRound)) {
        return [409, room_unlock_msg((string) (isset($weapons[$item]) ? $weapons[$item]['name'] : ($gear['name'] ?? $item)), $minRound)];
    }
    $effect = (string) ($gear['effect'] ?? '');
    if (in_array($effect, ['shield', 'extralife', 'laststand'], true)) {
        $qty = 1;
    }
    if ($effect === 'repair') {
        $want = room_repair_packs_wanted($room, $seat, (int) ($gear['n'] ?? 0));
        if ($want === 0) {
            return [409, 'armor is full'];
        }
        $qty = min($qty, $want);
    }
    $total = $price * $qty;
    $cash = $room['cash'][$seat] ?? 0;
    if ($cash < $total) {
        return [409, 'short on cash'];
    }
    $room['cash'][$seat] = $cash - $total;
    if ($gear === null) {
        $room['ammo'][$seat][$item] = ($room['ammo'][$seat][$item] ?? 0) + $pack * $qty;
        return null;
    }
    $n = (int) ($gear['n'] ?? 0) * $qty;
    switch ($effect) {
        case 'repair':
            room_repair($room, $seat, $n);
            break;
        case 'fuel':
            $room['fuelBonus'][$seat] = ($room['fuelBonus'][$seat] ?? 0) + $n;
            break;
        case 'plate':
            room_fit_plate($room, $seat, $qty);
            break;
        case 'shield':
            $room['shield'][$seat] = true;
            break;
        case 'extralife':
            if (($room['seats'][$seat]['lives'] ?? 3) < 5) {
                $room['seats'][$seat]['lives'] = ($room['seats'][$seat]['lives'] ?? 3) + 1;
            } else {
                $room['scores'][$seat] = ($room['scores'][$seat] ?? 0) + 500;
            }
            break;
        case 'jammer':
            $room['jammer'][$seat] = max($room['jammer'][$seat] ?? 0, $n);
            break;
        case 'bunker':
            $room['bunker'][$seat] = max($room['bunker'][$seat] ?? 0, $n);
            break;
        case 'laststand':
            $room['laststand'][$seat] = true;
            break;
        case 'parachute':
            $room['chutes'][$seat] = ($room['chutes'][$seat] ?? 0) + $n;
            break;
    }
    return null;
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

/* Fuel bought in the shop goes onto the freshly mustered human tanks. */
function room_apply_fuel(array &$room): void
{
    foreach ($room['tanks'] as &$t) {
        if ($t['kind'] !== 'human') {
            continue;
        }
        $t['fuel'] += ($room['fuelApplied'][$t['seat']] ?? 0);
    }
    unset($t);
}

/* The seat that holds the host's powers. */
function room_host(array $room): int
{
    return (int) ($room['host'] ?? 0);
}
/* Make sure a human holds the host: the lowest-numbered human takes it if the
   host's seat is vacated. False when no human is seated. */
function room_rehost(array &$room): bool
{
    if ($room['seats'][room_host($room)]['human'] ?? false) {
        return true;
    }
    foreach ($room['seats'] as $idx => $s) {
        if ($s['human'] ?? false) {
            $room['host'] = $idx;
            return true;
        }
    }
    return false;
}
/* Play again (same room): back to the lobby with the same code and seats, every
   human on fresh lives, score and cash. The room's map and Difficulty stay (the
   host chose them at create). A seat a player left goes back to the battery.
   Pressed twice (two players at once), the second press finds the lobby and
   changes nothing. False while the match is still on. */
function room_again(array &$room): bool
{
    if ($room['phase'] === 'lobby') {
        return true;
    }
    if ($room['phase'] !== 'over') {
        return false;
    }
    if (!room_rehost($room)) {
        return false; // everyone left; nobody is there to start a lobby
    }
    foreach (['plate', 'armor', 'shield', 'jammer', 'bunker', 'laststand', 'chutes', 'fuelBonus', 'fuelApplied', 'tactic', 'stats', 'filed', 'matchId', 'menu', 'shop', 'pace', 'clock'] as $k) {
        unset($room[$k]);
    }
    foreach ($room['seats'] as $idx => $s) {
        if ($s['human'] ?? false) {
            $room['seats'][$idx]['lives'] = 3;
            room_seat_economy($room, $idx);
        } elseif (!empty($s['bot'])) {
            $room['seats'][$idx] = room_idle_seat($idx);
        }
    }
    $room['winner'] = null;
    $room['winBonus'] = 0;
    $room['startHumans'] = 0;
    $room['phase'] = 'lobby';
    $room['round'] = 0;
    $room['tanks'] = [];
    $room['terrain'] = [];
    room_terrain_changed($room);
    return true;
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
    if ($humans === 0 || ($room['phase'] === 'lobby' && $seat === room_host($room))) {
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
    room_rehost($room);
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
