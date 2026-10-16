<?php
// Operation Tankity rooms. Drone brains: bracketing a target, the strategies a drone plays and flips between
// after a dry spell, weapon choice, and the rack a drone brings to a round. Loaded by
// rooms.php; it runs nothing on its own.
declare(strict_types=1);

// Not an endpoint: rooms.php defines this constant, then requires the file.
// A direct request gets a 404 and nothing runs.
if (!defined('TANKITY_ROOMS_INCLUDED')) {
    http_response_code(404);
    exit;
}

const ROOM_AI_IDS = ['reaper', 'wraith', 'spotter'];
/* A drone's bracket learns where its volley first burst. */
function room_brk_land(array &$tank, float $x): void
{
    if (isset($tank['brk']) && $tank['brk']['land'] === null) {
        $tank['brk']['land'] = $x;
    }
}
/* Drone bracketing, like real artillery. The first shot at a target is the
 * ballistic solution plus the round's wobble (the ranging shot). While the
 * target and the gunner both stay put, each next shot starts from the last aim
 * and corrects by a share ('correct') of the measured miss, with the wobble
 * shrinking by 'brkShrink' per correction down to 'brkFloor' (never zero, so a
 * drone cannot lock into a bad aim). A target that moved more than
 * ROOM_BRK_DRIFT px, a gunner that moved, a dead target, or 'brkMax'
 * corrections without a kill all send it back to a fresh solution.
 * src/sim.ts aiChoose is the same algorithm; protocol/sim-vectors.php keeps
 * them identical. Memory per drone: $tank['brk'] = [t target index, a, p
 * angle and power fired, w weapon, n corrections so far, tx target x then,
 * ox own x then, land first burst x of the volley (null until it bursts)]. */
const ROOM_BRK_DRIFT = 3.0;
const ROOM_BRK_ON = 22.0;

/* How well the drones aim, by difficulty: the host's choice, stored in
 * $room['difficulty']. The ranging shot's wobble is wobStart - wobStep x round,
 * never below wobFloor. src/ai.ts DIFFICULTY is the same table (its comment
 * says how it was tuned). */
const ROOM_DIFFICULTY = [
    'easy' => ['wobStart' => 8.0, 'wobStep' => 0.5, 'wobFloor' => 3.2, 'correct' => 0.5, 'brkShrink' => 0.5, 'brkFloor' => 1.2, 'brkMax' => 5],
    'normal' => ['wobStart' => 5.0, 'wobStep' => 0.45, 'wobFloor' => 1.5, 'correct' => 0.6, 'brkShrink' => 0.45, 'brkFloor' => 0.55, 'brkMax' => 5],
    'hard' => ['wobStart' => 0.85, 'wobStep' => 0.12, 'wobFloor' => 0.25, 'correct' => 1.0, 'brkShrink' => 0.65, 'brkFloor' => 0.2, 'brkMax' => 5],
];
/* The difficulty a create request asks for: exactly one of the three words,
 * anything else (missing, misspelled, another type) is normal. */
function room_parse_difficulty(mixed $raw): string
{
    return is_string($raw) && isset(ROOM_DIFFICULTY[$raw]) ? $raw : 'normal';
}
/* A room's difficulty word; a room from before the setting, or anything
 * else, is normal. */
function room_difficulty(array $room): string
{
    return room_parse_difficulty($room['difficulty'] ?? null);
}

/* The guns a fresh aim searches: the first of each planning arc, in rack
 * order. A later gun with the same arc lands every shot where the first did,
 * and the search keeps only a strictly better shot, so it could never win.
 * src/ai.ts arcGuns is the same. */
function room_ai_arc_guns(array $weapons, array $guns): array
{
    $seen = [];
    $out = [];
    foreach ($guns as $k) {
        $f = room_flight_key($weapons[$k]);
        if (!isset($seen[$f])) {
            $seen[$f] = true;
            $out[] = $k;
        }
    }
    return $out;
}

/* The best (angle, power) near a last aim for a shot to burst on goalX: a
 * 6-step sweep, then 3- and 1-step neighbours of its best. Nearer the last
 * aim wins ties. */
function room_ai_correct(array $room, float $mx, float $my, string $wkey, int $dirS, float $a0, float $p0, float $goalX, float $high): array
{
    $width = count($room['terrain']);
    $best = null;
    $try = function (int $a, int $p) use (&$best, $room, $mx, $my, $wkey, $dirS, $a0, $p0, $goalX, $width, $high): void {
        if ($a < 10 || $a > 170 || $p < 10 || $p > 100) {
            return;
        }
        $land = room_sim_shot($room['terrain'], $room['wind'], $mx, $my, (float) $a, (float) $p, $wkey, $dirS, $width, $high, room_walls_now($room));
        $err = ($land['oob'] ? 400 + abs($land['x'] - $goalX) * 0.2 : abs($land['x'] - $goalX)) + 0.02 * (abs($a - $a0) + abs($p - $p0));
        if ($best === null || $err < $best['err']) {
            $best = ['err' => $err, 'a' => $a, 'p' => $p];
        }
    };
    for ($da = -12; $da <= 12; $da += 6) {
        for ($dp = -18; $dp <= 18; $dp += 6) {
            $try((int) $a0 + $da, (int) $p0 + $dp);
        }
    }
    foreach ([3, 1] as $step) {
        $ca = $best['a'];
        $cp = $best['p'];
        for ($da = -$step; $da <= $step; $da += $step) {
            for ($dp = -$step; $dp <= $step; $dp += $step) {
                if ($da !== 0 || $dp !== 0) {
                    $try($ca + $da, $cp + $dp);
                }
            }
        }
    }
    return [$best['a'], $best['p']];
}

/* Drone strategies: who a drone shoots at and how it aims. Every drone is
 * dealt one at random when it spawns, and a drone that goes ROOM_DRY_FLIP turns
 * without hurting anyone may switch (ROOM_FLIP_CHANCE per further dry turn).
 * Every strategy brackets a standing target the same way.
 *   hunter   keeps its target until it is wrecked (nearest when it picks)
 *   bully    always the nearest rival
 *   sniper   the weakest rival (lowest hp, nearest on a tie); wobble x0.8
 *   avenger  whoever last damaged it; the nearest while nobody has
 *   glory    the rival with the most score (a drone: 300 per kill); its most harmful gun of any arc
 *   lobber   any rival; high arcs (above ROOM_LOB_ANGLE degrees first) and area guns
 * src/sim.ts has the same table. Per tank: 's' strategy, 'dry' turns without
 * damage, 'dealt' damage since the last turn, 'lastHitBy' tanks index of the
 * last attacker, 'kills' this round. */
const ROOM_TACTICS = ['hunter', 'bully', 'sniper', 'avenger', 'glory', 'lobber'];
const ROOM_DRY_FLIP = 3;
const ROOM_FLIP_CHANCE = 0.35;
const ROOM_SNIPER_WOB = 0.8;
/* src/ai.ts FIELD_AIM: [width, aim, floor]. A wider field's faster shells
   need a steadier hand to keep each difficulty's hit rates. */
const ROOM_FIELD_AIM = [[720, 1.0, 1.0], [1080, 0.75, 0.55], [1440, 0.55, 0.4]];
function room_field_aim(int $w): array
{
    $pts = ROOM_FIELD_AIM;
    $n = count($pts);
    if ($w <= $pts[0][0]) {
        return ['aim' => $pts[0][1], 'floor' => $pts[0][2]];
    }
    if ($w >= $pts[$n - 1][0]) {
        return ['aim' => $pts[$n - 1][1], 'floor' => $pts[$n - 1][2]];
    }
    $i = 0;
    while ($pts[$i + 1][0] < $w) {
        $i++;
    }
    [$aw, $aa, $af] = $pts[$i];
    [$bw, $ba, $bf] = $pts[$i + 1];
    $t = ($w - $aw) / ($bw - $aw);
    return ['aim' => $aa + ($ba - $aa) * $t, 'floor' => $af + ($bf - $af) * $t];
}
const ROOM_LOB_ANGLE = 60;
const ROOM_LOB_OK = 40.0; // a high arc this close is good enough; otherwise flat shots may compete
const ROOM_KILL_GLORY = 300;
const ROOM_FOLLOW_ANGLE = 45; // the angle a follower arc tries when the lead's best angle leaves it short (src/ai.ts FOLLOW_ANGLE)
function room_pick_tactic(int &$rng): string
{
    return ROOM_TACTICS[(int) floor(room_rng_next($rng) * count(ROOM_TACTICS))];
}
/* The strategy dealt to a seat: a stream of its own, seeded from the room's
 * stream and the seat, so dealing never shifts the room's shots and terrain. */
function room_deal_tactic(array $room, int $seat): string
{
    $deal = room_hash_seed('tactic|' . $room['rng'] . '|' . $seat . '|' . ($room['round'] ?? 0));
    return room_pick_tactic($deal);
}
/* A different strategy from the one it has. */
function room_flip_tactic(int &$rng, string $now): string
{
    $others = array_values(array_filter(ROOM_TACTICS, fn($k) => $k !== $now));
    return $others[(int) floor(room_rng_next($rng) * count($others))];
}
/* Guns that hurt an area: pellets, bomblets, leaping warheads, a big blast. */
function room_area_gun(array $def): bool
{
    return in_array($def['effect'] ?? 'shot', ['pellets', 'cluster', 'scatter', 'hop', 'napalm'], true) || ($def['radius'] ?? 0) >= 40;
}

/* ---------- which gun: the harm each would do ---------- */
/* How much wider than predicted a gun's reach is taken to be near the drone
 * itself (src/ai.ts AI_SAFE_MARGIN). */
const ROOM_AI_SAFE_MARGIN = 1.25;
/* A blast's damage to a unit $d px from it, or 0 past its reach. */
function room_ai_reach_damage(int $dmg, float $d, float $r): int
{
    return $d <= $r + 14 ? room_blast_damage($dmg, $d, $r) : 0;
}
/* Where a gun's munitions land, as x on the landing's ground, with their own
 * damage and radius, and each one's free flight [x0, y0, vx, vy] (null for a
 * pellet, which leaves the barrel): a pellet gun's pellets, a hop gun's leaps,
 * a scatter gun's bomblets from its burst (or from $from), a cluster's from
 * where its shot splits; whether the shot itself is one blast; and the row
 * each bursts at (room_ai_sink_into). src/ai.ts munitions is the same.
 * ['burst', 'xs', 'ys', 'paths', 'dmg', 'r']. */
function room_ai_munitions(array $room, array $self, string $wkey, array $land, ?array $from = null): array
{
    $w = room_weapons()[$wkey];
    $xs = [];
    $ns = [];
    $paths = [];
    $done = function (bool $burst, int $dmg, int $r) use (&$xs, &$ns, &$paths, $land): array {
        return ['burst' => $burst, 'xs' => $xs, 'ys' => room_ai_sink_into($xs, $ns, (float) $land['y'], (float) $r), 'paths' => $paths, 'dmg' => $dmg, 'r' => $r];
    };
    $dmg = $w['subDmg'] ?: $w['dmg'];
    $r = $w['subRadius'] ?: $w['radius'];
    $dirS = $self['dirS'] ?? -1;
    $air = room_air(count($room['terrain']), (float) $room['wind'], $w, room_walls_now($room));
    if ($w['effect'] === 'pellets') {
        if (!isset($land['a'], $land['p'])) {
            return $done(true, $dmg, $r);
        }
        $n = $w['pellets'] ?: 1;
        [$mx, $my] = room_muzzle(['angle' => (float) $land['a']] + $self);
        $spd = room_launch_speed($w, (float) $land['p'], room_field_reach(count($room['terrain'])));
        $drop = fn(float $a): float => room_fall_to($mx, $my, det_cos($a) * $spd * $dirS, -det_sin($a) * $spd, (float) $land['y'], $air)[0];
        $mid = $drop(deg2rad((float) $land['a']));
        for ($i = 0; $i < $n; $i++) {
            $xs[] = $land['x'] + $drop(deg2rad((float) $land['a']) + ($i - ($n - 1) / 2) * $w['spread']) - $mid;
            $paths[] = null;
            $ns[] = 0;
        }
        return $done(false, $w['dmg'], $w['radius']);
    }
    if ($w['effect'] === 'hop') {
        $x = $land['x'];
        $vx = $land['vx'] ?? 0.0;
        $vy = $land['vy'] ?? 0.0;
        $keep = $w['hopKeep'] ?: 0.5;
        for ($i = 1; $i < ($w['hops'] ?: 1); $i++) {
            $hvx = $vx * $keep;
            $hvy = -abs($vy) * $keep;
            $down = room_fall_to($x, $land['y'] - 1, $hvx, $hvy, (float) $land['y'], $air);
            $paths[] = [$x, $land['y'] - 1, $hvx, $hvy];
            $x = $down[0];
            $xs[] = $x;
            $ns[] = $i;
            $vx = $down[2];
            $vy = $down[3];
        }
    } elseif ($w['effect'] === 'scatter') {
        $x0 = $from !== null ? $from[0] : $land['x'];
        $y0 = $from !== null ? $from[1] : $land['y'] - 2;
        foreach (room_scatter_vel(max(2, $w['split'] ?: 4), $w['fan'] ?? 0.22, $w['kick'] ?: 150.0) as [$vx, $vy]) {
            $down = room_fall_to($x0, $y0, $vx, $vy, (float) $land['y'], $air);
            $xs[] = $down[0];
            $ns[] = $down[5];
            $paths[] = [$x0, $y0, $vx, $vy];
        }
    } elseif ($w['effect'] === 'cluster' && isset($land['a'], $land['p'])) {
        [$mx, $my] = room_muzzle(['angle' => (float) $land['a']] + $self);
        $at = room_split_point($room['terrain'], $room['wind'], $mx, $my, (float) $land['a'], (float) $land['p'], $wkey, $dirS, count($room['terrain']), room_walls_now($room));
        if ($at === null) {
            return $done(true, $dmg, $r);
        }
        foreach (room_split_vel($at[2], $at[3], max(2, $w['split'] ?: 4), $w['fan'] ?? 0.22) as [$vx, $vy]) {
            $down = room_fall_to($at[0], $at[1], $vx, $vy, (float) $land['y'], $air);
            $xs[] = $down[0];
            $ns[] = $down[5];
            $paths[] = [$at[0], $at[1], $vx, $vy];
        }
        return $done(false, $dmg, $r);
    }
    return $done(true, $dmg, $r);
}
/* The row each of a volley's munitions bursts at, landing at $xs on ground at
 * row $y0, taken in the order they come down ($ns: the steps each flew; list
 * order on a tie): on the ground, or deeper in the craters the earlier ones
 * dug (room_carve_crater's 0.75 of the chord of radius $r under the burst),
 * never below the crater floor. src/ai.ts sinkInto is the same. */
function room_ai_sink_into(array $xs, array $ns, float $y0, float $r): array
{
    $order = array_keys($xs);
    usort($order, fn(int $a, int $b): int => ($ns[$a] <=> $ns[$b]) ?: ($a <=> $b));
    $ys = array_fill(0, count($xs), $y0);
    foreach ($order as $k => $i) {
        $y = $y0;
        for ($q = 0; $q < $k; $q++) {
            $j = $order[$q];
            $dx = $xs[$i] - $xs[$j];
            $y = max($y, $ys[$j] + sqrt(max(0.0, $r * $r - $dx * $dx)) * 0.75);
        }
        $ys[$i] = min(ROOM_H - 4.0, $y);
    }
    return $ys;
}
/* True when a munition flying free from $path [x0, y0, vx, vy] through $air
 * passes through hit box $b [cx, cy, rx, ry] before it comes down to $groundY
 * (src/ai.ts crosses). */
function room_ai_crosses(array $b, array $path, float $groundY, array $air): bool
{
    [$x0, $y0, $vx, $vy] = $path;
    [$cx, $cy, $rx, $ry] = $b;
    return room_fall_to((float) $x0, (float) $y0, (float) $vx, (float) $vy, $groundY, $air, function (float $x, float $y) use ($cx, $cy, $rx, $ry): bool {
        $u = ($x - $cx) / $rx;
        $v = ($y - $cy) / $ry;
        return $u * $u + $v * $v <= 1;
    })[4];
}
/* What gun $wkey landing at $land would do, fired by $self at $target: 'harm'
 * to the target, 'self' to the gunner (a blast that comes down within its
 * body's width, or a munition that flies through it, is a direct hit; a
 * scatter gun's bomblets counted from the landing and from the target's near
 * side, whichever hurts more), and how near any of it may burst to the gunner
 * ('own' against 'reach'). src/ai.ts bursts is the same. */
function room_ai_bursts(array $room, array $self, array $target, string $wkey, array $land): array
{
    $w = room_weapons()[$wkey];
    [$tx, $ty, $trx, $try] = room_unit_box($target);
    $sb = room_unit_box($self);
    [$sx, $sy, $srx] = $sb;
    $air = room_air(count($room['terrain']), (float) $room['wind'], $w, room_walls_now($room));
    $d = room_dist($tx - $land['x'], $ty - $land['y']);
    $own = min(room_dist($sx - $land['x'], $sy - $land['y']), room_dist($sx - $tx, $sy - $ty) - max($trx, $try));
    $onSelf = fn(int $dmg, float $near, float $r, float $x): int => abs($x - $sx) <= $srx ? 2 * $dmg : room_ai_reach_damage($dmg, $near, $r);
    $selfFrom = function (array $subs) use ($sb, $sx, $sy, $own, $land, $onSelf, $air): int {
        $sum = 0;
        foreach ($subs['xs'] as $i => $x) {
            $path = $subs['paths'][$i];
            $sum += $path !== null && room_ai_crosses($sb, $path, (float) $land['y'], $air) ? 2 * $subs['dmg']
                : $onSelf($subs['dmg'], min(room_dist($sx - $x, $sy - $subs['ys'][$i]), $own + abs($x - $land['x'])), (float) $subs['r'], $x);
        }
        return $sum;
    };
    $harm = 0.0;
    $mine = 0;
    $reach = 0.0;
    $subs = room_ai_munitions($room, $self, $wkey, $land);
    if ($subs['burst']) {
        $harm = (float) room_ai_reach_damage($w['dmg'], $d, (float) $w['radius']);
        $mine = $onSelf($w['dmg'], $own, (float) $w['radius'], $land['x']);
        $reach = (float) ($w['radius'] + 14);
    }
    $far = 0.0;
    $tb = room_unit_box($target);
    foreach ($subs['xs'] as $i => $x) {
        // A munition that flies into the target's body from outside it bursts on it: its whole
        // damage. One thrown from inside it (a burst that struck it) never strikes it directly.
        $path = $subs['paths'][$i];
        $ou = $path !== null ? ($path[0] - $tx) / $trx : 0.0;
        $ov = $path !== null ? ($path[1] - $ty) / $try : 0.0;
        $outside = $path !== null && $ou * $ou + $ov * $ov > 1;
        $harm += $outside && room_ai_crosses($tb, $path, (float) $land['y'], $air) ? (float) $subs['dmg']
            : room_ai_reach_damage($subs['dmg'], room_dist($tx - $x, $ty - $subs['ys'][$i]), (float) $subs['r']);
        $far = max($far, abs($x - $land['x']));
    }
    $fromSubs = $selfFrom($subs);
    if ($w['effect'] === 'scatter') {
        $near = [$tx + ($sx >= $tx ? $trx : -$trx), $ty];
        $fromSubs = max($fromSubs, $selfFrom(room_ai_munitions($room, $self, $wkey, $land, $near)));
    }
    $mine += $fromSubs;
    if (count($subs['xs'])) {
        $reach = max($reach, $far + $subs['r'] + 14);
    }
    return ['harm' => $harm, 'self' => $mine, 'own' => $own, 'reach' => $reach];
}
/* The harm gun $wkey would do to $target landing at $land (room_sim_shot's
 * x, y, oob, vx, vy, plus the aim a, p), fired by $self, never more than the
 * target's armor; -INF when any of it could reach $self's own body.
 * src/ai.ts aiHarm is the same. */
function room_ai_harm(array $room, array $self, array $target, string $wkey, array $land): float
{
    if (!room_flies(room_weapons()[$wkey])) {
        return room_ai_no_flight_harm($room, $self, $wkey, $land);
    }
    if ($land['oob']) {
        return 0.0;
    }
    if (room_weapons()[$wkey]['effect'] === 'napalm') {
        $f = room_ai_fire_harm($room, $self, $wkey, $land);
        return $f['self'] > 0 || $f['near'] ? -INF : $f['harm'];
    }
    $b = room_ai_bursts($room, $self, $target, $wkey, $land);
    if ($b['own'] <= $b['reach'] * ROOM_AI_SAFE_MARGIN) {
        return -INF;
    }
    $e = room_ai_earth_harm($room, $self, $target, $wkey, $land);
    if ($e['self'] > 0 || $e['near']) {
        return -INF;
    }
    return room_ai_with_burial($target, $b['harm'] + $e['harm'], $e['bury']);
}
/* Harm capped at the target's armor, plus what burying it is worth, never
 * enough to pass for a kill (src/ai.ts withBurial). */
function room_ai_with_burial(array $target, float $hit, float $bury): float
{
    $hp = (float) $target['hp'];
    $h = min($hp, $hit);
    return $h >= $hp || $bury <= 0 ? $h : min($hp - 1, $h + $bury);
}
/* The damage gun $wkey landing at $land would do to $self, its own gunner,
 * with no margin (src/ai.ts aiSelfHarm). */
function room_ai_self_harm(array $room, array $self, array $target, string $wkey, array $land): int
{
    if (!room_flies(room_weapons()[$wkey])) {
        return 0; // a beam never crosses its gunner; a ring spares it; a riot charge never drops it
    }
    if ($land['oob']) {
        return 0;
    }
    if (room_weapons()[$wkey]['effect'] === 'napalm') {
        return room_ai_fire_harm($room, $self, $wkey, $land)['self'];
    }
    return room_ai_bursts($room, $self, $target, $wkey, $land)['self'] + room_ai_earth_harm($room, $self, $target, $wkey, $land)['self'];
}
/* The harm a gun with no flight would do fired by $self at the aim
 * $land['a'], $land['p']: a beam's flat damage on every rival whose body its
 * line crosses, a plasma ring's burns on every rival inside it, each no more
 * than that rival's armor. src/ai.ts noFlightHarm is the same. */
function room_ai_no_flight_harm(array $room, array $self, string $wkey, array $land): float
{
    $w = room_weapons()[$wkey];
    $a = (float) ($land['a'] ?? $self['angle']);
    $p = (float) ($land['p'] ?? 100.0);
    $selfIdx = null;
    foreach ($room['tanks'] as $i => $t) {
        if ($t['seat'] === $self['seat']) {
            $selfIdx = $i;
        }
    }
    $sum = 0;
    if ($w['effect'] === 'riot') {
        // Its scoop, on a copy of the ground: the falls it would give every rival, never one of its own.
        $t = $room['terrain'];
        [$cx, $cy] = room_unit_box($self);
        $r = deg2rad($a);
        room_riot_carve($t, $cx, $cy, det_atan2(-det_sin($r), det_cos($r) * ($self['dirS'] ?? -1)), (float) $w['radius'], (float) (($w['fan'] ?? 1.0) ?: 1.0), (float) $self['y']);
        if (room_ai_drop_cost($room, $self, room_surf_y($t, (float) $self['x'])) > 0) {
            return -INF;
        }
        foreach ($room['tanks'] as $i => $u) {
            if ($i !== $selfIdx && $u['hp'] > 0) {
                $sum += min($u['hp'], room_ai_drop_cost($room, $u, room_surf_y($t, (float) $u['x'])));
            }
        }
        return (float) $sum;
    }
    if ($w['effect'] === 'beam') {
        foreach (room_beam_line($room, $selfIdx, $w, $a, $p)[4] as $i) {
            $sum += min($room['tanks'][$i]['hp'], (int) $w['dmg']);
        }
        return (float) $sum;
    }
    $ring = room_ring_of($self, $w, $p);
    foreach ($room['tanks'] as $i => $u) {
        if ($i === $selfIdx || $u['hp'] <= 0) {
            continue;
        }
        $d = room_ring_damage($ring, $w, $u);
        if ($d !== null) {
            $sum += min($u['hp'], $d);
        }
    }
    return (float) $sum;
}
/* A beam's aim at $target: from the barrel's pivot (14 px above the hull)
 * straight at the target's body, to the nearest whole degree and inside the
 * beam's limits (aimLimits), at full power. [a, p]. src/ai.ts beamAim is the same. */
function room_ai_beam_aim(array $self, array $target, array $def): array
{
    [$cx, $cy] = room_unit_box($target);
    $r = det_atan2(-($cy - ($self['y'] - 14)), ($cx - $self['x']) * ($self['dirS'] ?? -1));
    // Behind and below reads past 180, the far side's dip.
    $deg = det_round($r / M_PI * 180);
    [$lo, $hi] = room_aim_limits($def);
    return [max($lo, min($hi, $deg < -90 ? $deg + 360 : $deg)), 100.0];
}
/* The harm to the target with no regard for the gunner (src/ai.ts targetHarm). */
function room_ai_target_harm(array $room, array $self, array $target, string $wkey, array $land): float
{
    if (!room_flies(room_weapons()[$wkey])) {
        return room_ai_no_flight_harm($room, $self, $wkey, $land);
    }
    if ($land['oob']) {
        return 0.0;
    }
    if (room_weapons()[$wkey]['effect'] === 'napalm') {
        return room_ai_fire_harm($room, $self, $wkey, $land)['harm'];
    }
    $e = room_ai_earth_harm($room, $self, $target, $wkey, $land);
    return room_ai_with_burial($target, room_ai_bursts($room, $self, $target, $wkey, $land)['harm'] + $e['harm'], $e['bury']);
}
/* How far either way a napalm shell's landing is taken to stray, px, and how
 * much bigger the drone's body is taken to be, px, when it asks whether a pool
 * could burn it (src/ai.ts AI_FIRE_WOBBLE, AI_FIRE_PAD). */
const ROOM_AI_FIRE_WOBBLE = 24.0;
const ROOM_AI_FIRE_PAD = 8.0;
/* How many of the aim's power wobbles a napalm shot is taken to fall short by (src/ai.ts AI_FIRE_SHORT). */
const ROOM_AI_FIRE_SHORT = 2.5;
/* What napalm $wkey landing at $land would burn (src/ai.ts fireHarm): its
 * pool poured at the landing's column on the ground as it is, and every tick
 * on every living unit in its flames (room_burn_total: a human's shield eats
 * one, its bunker halves each). 'harm' sums the rivals' burns, each no more
 * than that rival's armor; 'self' is the drone's own; 'near' when its body,
 * taken ROOM_AI_FIRE_PAD px bigger, would stand in the flames of the pool, of
 * the pools a landing ROOM_AI_FIRE_WOBBLE px either way would make, or of the
 * pool its own dip would hold (a shot that strays far enough runs down into
 * it). One ground prediction (room_ai_earth_ops), as an earth harm is. */
function room_ai_fire_harm(array $room, array $self, string $wkey, array $land): array
{
    room_ai_earth_ops(1);
    $w = room_weapons()[$wkey];
    $col = (float) det_round(max(0.0, min((float) (count($room['terrain']) - 1), (float) $land['x'])));
    $dam = room_walls_dam(room_walls_now($room));
    $pool = room_fire_pool($room['terrain'], $col, (float) $w['volume'], (float) $w['flame'], (float) $w['poolMin'], $dam);
    $n = room_burn_ticks((float) $w['burn'], (float) $w['tick']);
    $harm = 0.0;
    $mine = 0;
    foreach ($room['tanks'] as $u) {
        if ($u['hp'] <= 0 || room_buried($u, $room['terrain']) || !room_in_flames($pool, room_unit_box($u))) {
            continue;
        }
        $human = $u['kind'] === 'human';
        $cost = room_burn_total((int) $w['dmg'], $n, $human && !empty($room['shield'][$u['seat']]), $human && ($room['bunker'][$u['seat']] ?? 0) > 0);
        if ($u['seat'] === $self['seat']) {
            $mine = $cost;
        } else {
            $harm += min((float) $u['hp'], (float) $cost);
        }
    }
    [$cx, $cy, $rx, $ry] = room_unit_box($self);
    $wide = [$cx, $cy, $rx + ROOM_AI_FIRE_PAD, $ry + ROOM_AI_FIRE_PAD];
    $near = room_in_flames($pool, $wide)
        // Its own dip: where liquid would collect under it (a dip's pool, no puddle: on flat ground nothing collects there).
        || room_in_flames(room_fire_pool($room['terrain'], (float) $self['x'], (float) $w['volume'], (float) $w['flame'], 0.0, $dam), $wide);
    foreach ([-1.0, 1.0] as $k) {
        $near = $near || room_in_flames(room_fire_pool($room['terrain'], $col + $k * ROOM_AI_FIRE_WOBBLE, (float) $w['volume'], (float) $w['flame'], (float) $w['poolMin'], $dam), $wide);
    }
    // A shot that falls short, as src/ai.ts fireHarm takes it.
    $skill = ROOM_DIFFICULTY[room_difficulty($room)];
    $fw = count($room['terrain']);
    $wob = max($skill['wobFloor'], $skill['wobStart'] - $skill['wobStep'] * ($room['round'] ?? 1)) * room_field_aim($fw)['aim'];
    // The elevation above the horizontal: a backward shot's aim reads 180 - it.
    $p = max(10.0, (float) ($land['p'] ?? 50.0));
    $aim = (float) ($land['a'] ?? 45.0);
    $da = ROOM_AI_FIRE_SHORT * 9 * $wob;
    $e = $aim > 90 ? 180 - $aim : $aim;
    $lo = max(0.0, min(90.0, $e - $da));
    $hi = max(0.0, min(90.0, $e + $da));
    $kp = max(0.0, 1 - ROOM_AI_FIRE_SHORT * 12 * $wob / $p);
    $s2 = det_sin(deg2rad(2 * $e));
    $ka = $s2 > 1e-6 ? max(0.0, min(det_sin(deg2rad(2 * $lo)), det_sin(deg2rad(2 * $hi))) / $s2) : 0.0;
    $short = 1 - min(1.0, $kp * $kp * $ka);
    $back = (float) det_round(max(0.0, min((float) ($fw - 1), (float) $land['x'] + ((float) $self['x'] - (float) $land['x']) * $short)));
    $near = $near || room_in_flames(room_fire_pool($room['terrain'], $back, (float) $w['volume'], (float) $w['flame'], (float) $w['poolMin'], $dam), $wide);
    return ['harm' => $harm, 'self' => $mine, 'near' => $near];
}
/* Ground predictions made so far ($add counts more): a drone turn's cost
 * beside its flights, which test/php/AiArcsTest.php holds to a budget
 * (src/ai.ts earthOps). */
function room_ai_earth_ops(int $add = 0): int
{
    static $n = 0;
    $n += $add;
    return $n;
}
/* What burying a ground unit is worth, in armor: ROOM_AI_BURY plus a point a
 * px deeper, up to ROOM_AI_BURY_MAX (src/ai.ts AI_BURY). */
const ROOM_AI_BURY = 30;
const ROOM_AI_BURY_MAX = 70;
/* How deep under the surface a target must end up for the burial to count. */
const ROOM_AI_BURY_DEPTH = 12.0;
/* What a fall of unit $u onto ground at y $ground would cost it, as the
 * settle would charge it. src/ai.ts dropCost is the same. */
function room_ai_drop_cost(array $room, array $u, float $ground): int
{
    if ($ground - $u['y'] <= 0.5) {
        return 0;
    }
    $rules = room_fall_rules();
    $raw = room_fall_damage($ground - $u['y'], $rules);
    if ($raw <= 0) {
        return 0;
    }
    $human = $u['kind'] === 'human';
    $cost = $human && ($room['bunker'][$u['seat']] ?? 0) > 0 ? max(1, (int) round($raw / 2)) : $raw;
    $chutes = $human ? (int) ($room['chutes'][$u['seat']] ?? 0) : (int) ($u['chutes'] ?? 0);
    return $cost > $rules['chuteOver'] && $chutes > 0 ? 0 : $cost;
}
/* What the ground gun $wkey moves, landing at $land, would do to $target
 * ('harm': its fall, a burial, a dig's warheads) and to $self ('self': the
 * same; 'near': a warhead within reach of its body). src/ai.ts earthHarm is
 * the same. */
function room_ai_earth_harm(array $room, array $self, array $target, string $wkey, array $land): array
{
    room_ai_earth_ops(1);
    $w = room_weapons()[$wkey];
    $fw = count($room['terrain']);
    [$tx, $ty] = room_unit_box($target);
    [$sx, $sy] = room_unit_box($self);
    $harm = 0;
    $mine = 0;
    $near = false;
    $effect = $w['effect'];
    // Only the ground under the target and the drone matters (src/ai.ts earthHarm).
    $cols = [max(0, min($fw - 1, (int) det_round((float) $target['x']))), max(0, min($fw - 1, (int) det_round((float) $self['x'])))];
    $at = [(float) $room['terrain'][$cols[0]], (float) $room['terrain'][$cols[1]]];
    $carve = function (float $x, float $y, float $r) use (&$at, $cols, $fw): void {
        foreach ($cols as $i => $ix) {
            if ($ix < max(0, (int) floor($x - $r)) || $ix > min($fw - 1, (int) ceil($x + $r))) {
                continue;
            }
            $dx = $ix - $x;
            $at[$i] = min(ROOM_EARTH_FLOOR, max($at[$i], $y + sqrt(max(0.0, $r * $r - $dx * $dx)) * 0.75));
        }
    };
    if ($effect === 'dirt') {
        $r = (float) $w['radius'];
        foreach ($cols as $i => $ix) {
            if ($ix < max(0, (int) floor($land['x'] - $r)) || $ix > min($fw - 1, (int) ceil($land['x'] + $r))) {
                continue;
            }
            $dx = $ix - $land['x'];
            $at[$i] = max(ROOM_TOP_Y, min($at[$i], $land['y'] - sqrt(max(0.0, $r * $r - $dx * $dx))));
        }
    } elseif ($effect === 'pour' || $effect === 'slump') {
        $t = $room['terrain'];
        if ($effect === 'pour') {
            room_fill_pour($t, room_pour_level($t, det_round(max(0.0, min((float) ($fw - 1), (float) $land['x']))), (float) $w['volume'], (float) $w['poolMin'], room_walls_dam(room_walls_now($room))));
        } else {
            room_slump_ground($t, (float) $land['x'], (float) $w['radius'], (float) $w['slope'], (int) $w['passes']);
        }
        $at = [(float) $t[$cols[0]], (float) $t[$cols[1]]];
    } elseif ($effect === 'dig') {
        $x = (float) $land['x'];
        $y = (float) $land['y'];
        [$ux, $uy] = room_dig_heading((float) ($land['vx'] ?? 0.0), (float) ($land['vy'] ?? 0.0));
        $n = (int) ceil($w['digLen'] / ROOM_DIG_STEP);
        $heads = (int) $w['warheads'];
        $pts = [];
        for ($i = 1; $i <= $n; $i++) {
            $nx = $x + $ux * ROOM_DIG_STEP;
            $ny = $y + $uy * ROOM_DIG_STEP;
            if ($nx < 0 || $nx > $fw - 1 || $ny >= ROOM_EARTH_FLOOR) {
                break;
            }
            [$x, $y] = [$nx, $ny];
            $hit = false;
            foreach ($room['tanks'] as $u) {
                if ($u['hp'] > 0 && $u['seat'] !== $self['seat'] && room_in_box($u, $nx, $ny)) {
                    $hit = true;
                    break;
                }
            }
            if ($hit) {
                break;
            }
            $carve($x, $y, (float) $w['digR']);
            while (count($pts) < $heads && $i >= intdiv((count($pts) + 1) * $n + $heads - 1, $heads)) {
                $pts[] = [$x, $y];
            }
        }
        while (count($pts) < $heads) {
            $pts[] = [$x, $y];
        }
        $sd = (int) $w['subDmg'];
        $sr = (float) $w['subRadius'];
        foreach ($pts as [$px, $py]) {
            $carve($px, $py, $sr);
            $harm += room_ai_reach_damage($sd, room_dist($tx - $px, $ty - $py), $sr);
            $own = room_dist($sx - $px, $sy - $py);
            $mine += room_ai_reach_damage($sd, $own, $sr);
            if ($own <= ($sr + 14) * ROOM_AI_SAFE_MARGIN) {
                $near = true;
            }
        }
    } else {
        $subs = room_ai_munitions($room, $self, $wkey, $land);
        if ($subs['burst']) {
            $carve((float) $land['x'], (float) $land['y'], (float) $w['radius']);
        }
        foreach ($subs['xs'] as $x) {
            $carve((float) $x, (float) $land['y'], (float) $subs['r']);
        }
    }
    $harm += room_ai_drop_cost($room, $target, $at[0]);
    $mine += room_ai_drop_cost($room, $self, $at[1]);
    $bury = 0.0;
    if (($effect === 'dirt' || $effect === 'pour') && $target['kind'] === 'human'
        && !($room['terrain'][$cols[0]] < $target['y'] - ROOM_AI_BURY_DEPTH) && $at[0] < $target['y'] - ROOM_AI_BURY_DEPTH) {
        $bury = min((float) ROOM_AI_BURY_MAX, ROOM_AI_BURY + ($target['y'] - $at[0]));
    }
    if ($self['kind'] === 'human' && !room_buried($self, $room['terrain']) && $at[1] < $self['y'] - ROOM_BURY_EPS) {
        $mine += ROOM_AI_BURY_MAX;
    }
    return ['harm' => (float) $harm, 'bury' => $bury, 'self' => $mine, 'near' => $near];
}
/* The gun to fire once the search has found each arc's best aim ($byArc:
 * flight key => [err, a, p, land]). src/ai.ts pickGun is the same: the most
 * harmful candidate wins, the cheaper on a tie, then rack order; glory weighs every gun it
 * carries, any other strategy the guns of the best-landing arc; when no gun
 * would hurt anyone, that arc's first gun (glory: its strongest), or if that
 * would reach the drone itself, the gun of the best-landing arc that would
 * not. */
function room_ai_pick_gun(array $room, array $self, array $target, bool $glory, array $guns, array $arcOf, array $byArc, string $bestGun,
    array $lands = [], array &$aims = []): string
{
    $weapons = room_weapons();
    $harms = [];
    $harmOf = function (string $k) use (&$harms, &$aims, $room, $self, $target, $arcOf, $byArc, $lands, $weapons): float {
        if (!isset($harms[$k])) {
            $h = room_ai_harm($room, $self, $target, $k, $byArc[$arcOf[$k]]['land']);
            // A digger does its harm away from where it lands: it is weighed at
            // every aim its arc searched that lands within its burrow's length
            // of the target (no other can reach it), and fires the most
            // harmful (the first of equals).
            if ($weapons[$k]['effect'] === 'dig') {
                foreach ($lands[$arcOf[$k]] ?? [] as $aim) {
                    if ($aim['land']['oob'] || abs($aim['land']['x'] - $target['x']) > $weapons[$k]['digLen']) {
                        continue;
                    }
                    $g = room_ai_harm($room, $self, $target, $k, $aim['land']);
                    if ($g > $h) {
                        $h = $g;
                        $aims[$k] = $aim;
                    }
                }
            }
            $harms[$k] = $h;
        }
        return $harms[$k];
    };
    // The guns whose arcs land as near the target as the best one does, or on its hull (within
    // ROOM_BRK_ON): each gun's drag gives it an arc of its own, and they all come down there.
    $near = max($byArc[$arcOf[$bestGun]]['err'], ROOM_BRK_ON);
    $pool = $glory ? $guns : array_values(array_filter($guns, fn($k) => $byArc[$arcOf[$k]]['err'] <= $near));
    $top = null;
    $topHarm = 0.0;
    foreach ($pool as $k) {
        $h = $harmOf($k);
        // The cheaper gun on a tie: harm is capped at the target's armor, so it is the one that finishes the job for less.
        if ($h > $topHarm || ($top !== null && $h === $topHarm && $weapons[$k]['price'] < $weapons[$top]['price'])) {
            [$top, $topHarm] = [$k, $h];
        }
    }
    if ($top !== null) {
        return $top;
    }
    // Nothing hurts: glory fires its biggest gun; any other drone its cheapest of the pool.
    $fallback = $bestGun;
    foreach ($pool as $k) {
        if ($glory ? $weapons[$k]['dmg'] > $weapons[$fallback]['dmg'] : $weapons[$k]['price'] < $weapons[$fallback]['price']) {
            $fallback = $k;
        }
    }
    if ($harmOf($fallback) !== -INF) {
        return $fallback;
    }
    $safe = null;
    foreach ($guns as $k) {
        if ($harmOf($k) !== -INF && ($safe === null || $byArc[$arcOf[$k]]['err'] < $byArc[$arcOf[$safe]]['err'])) {
            $safe = $k;
        }
    }
    if ($safe !== null) {
        return $safe;
    }
    // Every gun would reach the drone: the one that hurts it least, then the
    // one that hurts the target most, then the cheaper. Never napalm: a pool
    // that could burn the drone is never fired (the Shell is always loaded).
    [$pick, $pickSelf, $pickHarm] = [$bestGun, INF, -INF];
    foreach ($guns as $k) {
        if ($weapons[$k]['effect'] === 'napalm') {
            continue;
        }
        $land = $byArc[$arcOf[$k]]['land'];
        $mine = room_ai_self_harm($room, $self, $target, $k, $land);
        $theirs = room_ai_target_harm($room, $self, $target, $k, $land);
        if ($mine < $pickSelf || ($mine === $pickSelf && ($theirs > $pickHarm
            || ($theirs === $pickHarm && $weapons[$k]['price'] < $weapons[$pick]['price'])))) {
            [$pick, $pickSelf, $pickHarm] = [$k, $mine, $theirs];
        }
    }
    return $pick;
}
/* The rival a strategy would pick, ignoring any bracket in progress. Null for
 * a lobber, whose pick is random. $rivals are sorted nearest first. */
function room_tactic_target(array $room, array $tank, array $rivals, string $s, ?array $mem): ?array
{
    if ($s === 'lobber') {
        return null;
    }
    $pick = $rivals[0];
    if ($s === 'hunter') {
        foreach ($rivals as $r) {
            if ($mem !== null && $r['idx'] === $mem['t']) {
                $pick = $r;
            }
        }
    } elseif ($s === 'sniper') {
        foreach ($rivals as $r) {
            if ($r['hp'] < $pick['hp']) {
                $pick = $r;
            }
        }
    } elseif ($s === 'avenger') {
        foreach ($rivals as $r) {
            if ($r['idx'] === ($tank['lastHitBy'] ?? -1)) {
                $pick = $r;
            }
        }
    } elseif ($s === 'glory') {
        $glory = fn($r) => $r['kind'] === 'human' ? ($room['scores'][$r['seat']] ?? 0) : ($r['kills'] ?? 0) * ROOM_KILL_GLORY;
        foreach ($rivals as $r) {
            if ($glory($r) > $glory($pick)) {
                $pick = $r;
            }
        }
    }
    return $pick;
}

/* Server-side drone AI: same ballistic search as the browser, with the same
 * round-scaled error, driven by the room rng stream. Remembers the shot in
 * the drone's 'brk' (the caller fixes 'ox' once the drone has moved) and
 * reports a strategy switch in 'tactic'. */
function room_ai_choose(array &$room, array $tank): array
{
    $rng = $room['rng'];
    $dirS = $tank['dirS'] ?? -1;
    [$mx, $my] = room_muzzle($tank);
    $selfIdx = null;
    foreach ($room['tanks'] as $i => $t) {
        if ($t['seat'] === $tank['seat']) {
            $selfIdx = $i;
        }
    }
    // Drones feud with each other too. Nobody is safe, nobody is perfect.
    $rivals = [];
    foreach ($room['tanks'] as $i => $t) {
        if ($t['hp'] > 0 && $t['seat'] !== $tank['seat']) {
            $rivals[] = $t + ['idx' => $i];
        }
    }
    if (!count($rivals)) {
        $room['rng'] = $rng;
        return ['wkey' => 'shell', 'angle' => 62.0, 'power' => 55.0, 'dx' => 0.0];
    }
    usort($rivals, fn($a, $b) => abs($a['x'] - $tank['x']) <=> abs($b['x'] - $tank['x']));
    $keys = ['shell'];
    $weapons = room_weapons();
    foreach ($weapons as $k => $def) {
        if ($k === 'shell') {
            continue;
        }
        if (($tank['ammo'][$k] ?? 0) > 0) {
            $keys[] = $k;
        }
    }
    // A buried ground unit fired for by the battery digs itself out first:
    // its first riot gun in rack order, at its own aim (no random numbers drawn).
    if (room_buried($tank, $room['terrain'])) {
        foreach ($keys as $k) {
            if ($weapons[$k]['effect'] === 'riot') {
                [$lo, $hi] = room_aim_limits($weapons[$k]);
                $room['rng'] = $rng;
                return ['wkey' => $k, 'angle' => max($lo, min($hi, (float) $tank['angle'])), 'power' => (float) $tank['power'], 'dx' => 0.0];
            }
        }
    }
    // A drone that cannot hurt anyone for a while tries something else.
    $s = $tank['s'] ?? 'hunter';
    $mem = $tank['brk'] ?? null;
    $dry = $tank['dry'] ?? 0;
    $tactic = null;
    if ($mem !== null) {
        $dry = !empty($tank['dealt']) ? 0 : $dry + 1;
    }
    if ($dry >= ROOM_DRY_FLIP && room_rng_next($rng) < ROOM_FLIP_CHANCE) {
        $s = room_flip_tactic($rng, $s);
        $tactic = $s;
        $dry = 0;
        $room['tactic'][$tank['seat']] = $s;
    }
    $want = room_tactic_target($room, $tank, $rivals, $s, $mem);
    // A bracket in progress: same target standing where it stood, same gunner
    // on the same spot, the same gun still loaded, under the correction cap,
    // and a strategy that still wants that target.
    $cont = null;
    $skill = ROOM_DIFFICULTY[room_difficulty($room)];
    // A beam or a ring has no landing to walk in, and a napalm pool lies where
    // the ground takes it: after one, the drone aims afresh.
    if ($mem !== null && $mem['n'] < $skill['brkMax'] && abs($tank['x'] - $mem['ox']) <= 1.0 && in_array($mem['w'], $keys, true)
        && room_flies($weapons[$mem['w']]) && $weapons[$mem['w']]['effect'] !== 'napalm') {
        foreach ($rivals as $r) {
            if ($r['idx'] === $mem['t'] && abs($r['x'] - $mem['tx']) <= ROOM_BRK_DRIFT && ($want === null || $want['idx'] === $r['idx'])) {
                $cont = $r;
            }
        }
    }
    if ($cont !== null) {
        $me = $cont;
    } elseif ($want !== null) {
        $me = $want;
    } else {
        $me = count($rivals) > 1 ? $rivals[(int) floor(room_rng_next($rng) * count($rivals))] : $rivals[0];
    }
    $width = count($room['terrain']);
    $high = min($room['terrain']);
    $fa = room_field_aim($width);
    // Deliberately shaky hands: dangerous up close, forgiving at range.
    // A jammer doubles the wobble of anything aimed at its owner.
    $wob = max($skill['wobFloor'], $skill['wobStart'] - $skill['wobStep'] * $room['round']) * ($s === 'sniper' ? ROOM_SNIPER_WOB : 1.0) * $fa['aim'];
    if ($cont !== null) {
        $w = $mem['w'];
        $n = $mem['n'] + 1;
        $sim = room_sim_shot($room['terrain'], $room['wind'], $mx, $my, (float) $mem['a'], (float) $mem['p'], $w, $dirS, $width, $high, room_walls_now($room));
        $landed = $mem['land'] ?? $sim['x'];
        $miss = $me['x'] - $landed;
        if (abs($miss) <= ROOM_BRK_ON) {
            $miss = 0.0; // a burst on the hull is on target: hold the aim
        }
        // Where the sim must put a shot so that, shifted by the measured miss
        // of the last one, it bursts on the target (or, taking out only part
        // of the miss, nearer it).
        [$ba, $bp] = room_ai_correct($room, $mx, $my, $w, $dirS, (float) $mem['a'], (float) $mem['p'], $sim['x'] + $miss * $skill['correct'], $high);
        $wob = max($skill['brkFloor'] * $fa['floor'], $wob * room_powi($skill['brkShrink'], $n));
    } else {
        // The aim search flies planning arcs: it weighs only guns that fly.
        // The others are weighed after it.
        $fliers = [];
        $grounded = [];
        foreach ($keys as $k) {
            if (room_flies($weapons[$k])) {
                $fliers[] = $k;
            } else {
                $grounded[] = $k;
            }
        }
        $guns = $fliers;
        if ($s === 'lobber') {
            $area = array_values(array_filter($fliers, fn($k) => room_area_gun($weapons[$k])));
            $guns = count($area) ? $area : $fliers;
        }
        // Every planning arc's best aim, and the best of all.
        $arcOf = [];
        foreach ($guns as $k) {
            $arcOf[$k] = room_flight_key($weapons[$k]);
        }
        $byArc = [];
        // Every aim each arc searched, in search order (a digger is weighed at each).
        $lands = [];
        $best = null;
        $consider = function (string $wkey, int $a, int $p) use (&$best, &$byArc, &$lands, &$arcOf, $room, $mx, $my, $dirS, $me, $width, $high): float {
            $land = room_sim_shot($room['terrain'], $room['wind'], $mx, $my, (float) $a, (float) $p, $wkey, $dirS, $width, $high, room_walls_now($room));
            $err = $land['oob'] ? 400 + abs($land['x'] - $me['x']) * 0.2 : abs($land['x'] - $me['x']);
            $f = $arcOf[$wkey];
            $aim = ['err' => $err, 'a' => $a, 'p' => $p, 'land' => $land + ['a' => $a, 'p' => $p]];
            if (!isset($byArc[$f]) || $err < $byArc[$f]['err']) {
                $byArc[$f] = $aim;
            }
            $lands[$f][] = $aim;
            if ($best === null || $err < $best['err']) {
                $best = ['err' => $err, 'a' => $a, 'p' => $p, 'wkey' => $wkey];
            }
            return $err;
        };
        // One gun over angles lo..hi of the grid (25, 31, ...) and powers 20,
        // 26, ... 98: every other point of it, then the eight neighbours of the best.
        // A roller's planning flight rolls on after it lands, several times the
        // cost of a shell's: its arcs are searched after the others, start on a
        // grid twice as coarse, and narrow (12, then 6) only when that coarse
        // best already beats the best landing so far.
        $search = function (string $wkey, int $lo, int $hi) use ($consider, $weapons, &$best): void {
            $roll = $weapons[$wkey]['effect'] === 'roller';
            $coarse = $roll ? 24 : 12;
            [$ca, $cp, $ce] = [$lo, 20, INF];
            for ($a = $lo; $a <= $hi; $a += $coarse) {
                for ($p = 20; $p <= 100; $p += $coarse) {
                    $err = $consider($wkey, $a, $p);
                    if ($err < $ce) {
                        [$ca, $cp, $ce] = [$a, $p, $err];
                    }
                }
            }
            if ($roll && $ce > $best['err']) {
                return;
            }
            foreach ($roll ? [12, 6] : [6] as $step) {
                [$ba, $bp] = [$ca, $cp];
                for ($a = $ba - $step; $a <= $ba + $step; $a += $step) {
                    for ($p = $bp - $step; $p <= $bp + $step; $p += $step) {
                        if (($a !== $ba || $p !== $bp) && $a >= $lo && $a <= $hi && $p >= 20 && $p <= 100) {
                            $err = $consider($wkey, $a, $p);
                            if ($err < $ce) {
                                [$ca, $cp, $ce] = [$a, $p, $err];
                            }
                        }
                    }
                }
            }
        };
        // Each gun's drag gives it an arc of its own, more arcs than a turn can
        // grid-search: only the plan's first arc (the lead) is, and every other
        // arc but a roller's follows it. A follower keeps the lead's best angle
        // and seeks only the power, coarse to fine (12, 6, 3, 1 either side of
        // the lead's best power); one that still lands more than ROOM_BRK_ON
        // from the target tries ROOM_FOLLOW_ANGLE the same way. src/ai.ts is the same.
        $follow = function (string $wkey, int $lo, int $hi, int $a0, int $p0) use ($consider): void {
            $ce = INF;
            foreach ([$a0, ROOM_FOLLOW_ANGLE] as $a) {
                if ($ce <= ROOM_BRK_ON) {
                    break;
                }
                $ca = max($lo, min($hi, $a));
                $cp = max(20, min(100, $p0));
                $ae = $consider($wkey, $ca, $cp);
                foreach ([12, 6, 3, 1] as $step) {
                    $bp = $cp;
                    foreach ([$bp - $step, $bp + $step] as $p) {
                        if ($p < 20 || $p > 100) {
                            continue;
                        }
                        $err = $consider($wkey, $ca, $p);
                        if ($err < $ae) {
                            [$cp, $ae] = [$p, $err];
                        }
                    }
                }
                $ce = min($ce, $ae);
            }
        };
        $searchPlan = function (array $plan, int $lo, int $hi) use ($search, $follow, $weapons, &$byArc, &$arcOf): void {
            foreach (array_values($plan) as $i => $wkey) {
                if ($i > 0 && $weapons[$wkey]['effect'] !== 'roller') {
                    $lead = $byArc[$arcOf[$plan[0]]];
                    $follow($wkey, $lo, $hi, $lead['a'], $lead['p']);
                } else {
                    $search($wkey, $lo, $hi);
                }
            }
        };
        // The first angle on the grid above ROOM_LOB_ANGLE.
        $highFrom = 25 + 6 * (int) ceil((ROOM_LOB_ANGLE + 1 - 25) / 6);
        $planOf = function (array $from) use ($weapons): array {
            $plan = room_ai_arc_guns($weapons, $from);
            usort($plan, fn($a, $b) => (int) ($weapons[$a]['effect'] === 'roller') <=> (int) ($weapons[$b]['effect'] === 'roller'));
            return $plan;
        };
        $plan = $planOf($guns);
        $searchPlan($plan, $s === 'lobber' ? $highFrom : 25, 155);
        if ($s === 'lobber') {
            $unsafe = true;
            foreach ($guns as $k) {
                if (room_ai_harm($room, $tank, $me, $k, $byArc[$arcOf[$k]]['land']) !== -INF) {
                    $unsafe = false;
                }
            }
            if ($unsafe) {
                // Every high arc of its area guns would reach the lobber itself: it
                // searches as any drone does, every gun it carries on every arc.
                $guns = $fliers;
                foreach ($guns as $k) {
                    $arcOf[$k] ??= room_flight_key($weapons[$k]);
                }
                $byArc = [];
                $lands = [];
                $best = null;
                $plan = $planOf($guns);
                $searchPlan($plan, 25, 155);
            } elseif ($best['err'] > ROOM_LOB_OK) {
                // A lobber falls back to flat shots when no high arc lands near.
                $searchPlan($plan, 25, $highFrom - 1);
            }
        }
        $aims = [];
        $w = room_ai_pick_gun($room, $tank, $me, $s === 'glory', $guns, $arcOf, $byArc, $best['wkey'], $lands, $aims);
        $aim = $aims[$w] ?? $byArc[$arcOf[$w]];
        [$ba, $bp, $n] = [$aim['a'], $aim['p'], 0];
        // A gun with no flight, aimed as it aims (a beam at the target's body,
        // a ring wherever the barrel points, both at full power), fires instead
        // when it would do more harm than that pick (and any harm at all).
        $top = max(0.0, room_ai_harm($room, $tank, $me, $w, $aim['land']));
        foreach ($grounded as $k) {
            [$ga, $gp] = $weapons[$k]['effect'] === 'beam' ? room_ai_beam_aim($tank, $me, $weapons[$k]) : [(float) $tank['angle'], 100.0];
            $h = room_ai_harm($room, $tank, $me, $k, ['x' => $tank['x'], 'y' => $tank['y'], 'oob' => false, 'a' => $ga, 'p' => $gp]);
            if ($h > $top) {
                [$w, $ba, $bp, $top] = [$k, $ga, $gp, $h];
            }
        }
    }
    if ($me['kind'] === 'human' && ($room['jammer'][$me['seat']] ?? 0) > 0) {
        $wob *= 2;
    }
    // det_round: PHP's round() takes halves away from zero, Math.round up; they differ below zero.
    [$aimLo, $aimHi] = room_aim_limits($weapons[$w] ?? null);
    $angle = max($aimLo, min($aimHi, det_round($ba + room_gauss($rng) * 9 * $wob)));
    $power = max(10.0, min(100.0, det_round($bp + room_gauss($rng) * 12 * $wob)));
    // Drones shuffle for a better firing spot instead of camping one rut,
    // unless they are walking a bracket in, fire a gun with no flight (aimed
    // from where they stand), or fire napalm (it judged its own dip from here).
    // Only a drone shuffles: a ground unit fired for by the battery never drives.
    $dx = 0.0;
    if ($cont === null && room_flies($weapons[$w]) && $weapons[$w]['effect'] !== 'napalm' && room_rng_next($rng) < 0.35) {
        $dx = (room_rng_next($rng) < 0.5 ? -1.0 : 1.0) * (8 + room_rng_next($rng) * 27);
        if ($tank['kind'] === 'human') {
            $dx = 0.0;
        }
    }
    $room['rng'] = $rng;
    $room['tanks'][$selfIdx]['s'] = $s;
    $room['tanks'][$selfIdx]['dry'] = $dry;
    $room['tanks'][$selfIdx]['dealt'] = false;
    $room['tanks'][$selfIdx]['brk'] = ['t' => $me['idx'], 'a' => $angle, 'p' => $power, 'w' => $w, 'n' => $n,
        'tx' => $me['x'], 'ox' => $tank['x'], 'land' => null];
    $out = ['wkey' => $w, 'angle' => $angle, 'power' => $power, 'dx' => $dx];
    if ($tactic !== null) {
        $out['tactic'] = $tactic;
    }
    return $out;
}

/* ---------- what a drone buys (src/drones.ts is the same, pinned by the 'drone-shop' sim vectors) ---------- */
const ROOM_DRONE_MAX_PACKS = 9;
/* The arsenal as droneShop reads it: the guns in the data file's order, and the gear rows. */
function room_drone_arsenal(): array
{
    $w = room_weapons();
    return ['order' => array_keys($w), 'weapons' => $w, 'gear' => room_arsenal()['gear'] ?? []];
}
/* The first gear of an effect in the data file's order (repair, parachute, plate, shield): by effect, never by key. */
function room_drone_gear(array $arsenal, string $effect): ?array
{
    foreach ($arsenal['gear'] as $g) {
        if (($g['effect'] ?? '') === $effect) {
            return $g;
        }
    }
    return null;
}
/* A gun's rank for a pick: higher is better (src/drones.ts gunScore). */
function room_drone_score(string $pick, int $dmg, int $radius, int $pack, int $price): float
{
    return match ($pick) {
        'value' => ($dmg * $pack) / $price,
        'precise' => $dmg / $radius / $pack,
        default => (float) $dmg,
    };
}
/* The guns a drone may buy with $left dollars: ai guns the shop sells that do damage, in the arsenal's order. */
function room_drone_affordable(array $arsenal, int $left): array
{
    $out = [];
    foreach ($arsenal['order'] as $k) {
        $a = $arsenal['weapons'][$k];
        if (!empty($a['ai']) && $a['pack'] > 0 && $a['price'] > 0 && $a['dmg'] > 0 && $a['price'] <= $left) {
            $out[] = $k;
        }
    }
    return $out;
}
/* What a drone with these rules buys on one visit: a list of ['item' => key, 'qty' => packs].
 * $state holds cash, armor, plate, chutes and shield; $p is a personality row with rules; $rng is
 * a stream's state, drawn only by the random pick. src/drones.ts droneShop is the same. */
function room_drone_shop(array $state, array $arsenal, array $p, int &$rng): array
{
    $reserve = $p['reserve'] ?? 0;
    $defense = $p['defense'] ?? 0;
    $maxBuys = (int) ($p['maxBuys'] ?? 1);
    $pick = (string) ($p['pick'] ?? 'big');
    $budget = (int) floor($state['cash'] * (1 - $reserve));
    $defBudget = (int) floor($budget * $defense);
    $buys = [];
    $spent = 0;
    $armor = (int) $state['armor'];
    $plate = (int) $state['plate'];
    $chutes = (int) $state['chutes'];
    $shield = (bool) $state['shield'];
    $maxArmor = static fn(int $pl): int => ROOM_ARMOR + ROOM_PLATE_ARMOR * $pl;

    $repair = room_drone_gear($arsenal, 'repair');
    if ($repair !== null && count($buys) < $maxBuys && $armor < $maxArmor($plate) && (int) $repair['price'] > 0) {
        $per = (int) ($repair['n'] ?? 0);
        $missing = $maxArmor($plate) - $armor;
        $wanted = $missing <= 0 || $per <= 0 ? 0 : (int) ceil($missing / $per);
        $qty = min($wanted, ROOM_DRONE_MAX_PACKS, intdiv($defBudget - $spent, (int) $repair['price']));
        if ($qty >= 1) {
            $buys[] = ['item' => $repair['key'], 'qty' => $qty];
            $spent += (int) $repair['price'] * $qty;
            $armor += max(0, min($per * $qty, $maxArmor($plate) - $armor));
        }
    }
    $chute = room_drone_gear($arsenal, 'parachute');
    if ($chute !== null && count($buys) < $maxBuys && $chutes === 0 && (int) $chute['price'] <= $defBudget - $spent) {
        $buys[] = ['item' => $chute['key'], 'qty' => 1];
        $spent += (int) $chute['price'];
        $chutes += (int) ($chute['n'] ?? 0);
    }
    $plateRow = room_drone_gear($arsenal, 'plate');
    if ($plateRow !== null && count($buys) < $maxBuys && (int) $plateRow['price'] <= $defBudget - $spent) {
        $buys[] = ['item' => $plateRow['key'], 'qty' => 1];
        $spent += (int) $plateRow['price'];
        $armor += ROOM_PLATE_ARMOR;
        $plate++;
    }
    $shieldRow = room_drone_gear($arsenal, 'shield');
    if ($shieldRow !== null && count($buys) < $maxBuys && !$shield && (int) $shieldRow['price'] <= $defBudget - $spent) {
        $buys[] = ['item' => $shieldRow['key'], 'qty' => 1];
        $spent += (int) $shieldRow['price'];
        $shield = true;
    }

    while (count($buys) < $maxBuys) {
        $keys = room_drone_affordable($arsenal, $budget - $spent);
        if (!$keys) {
            break;
        }
        $chosen = $keys[0];
        if ($pick === 'random') {
            $total = 0;
            foreach ($keys as $k) {
                $total += $arsenal['weapons'][$k]['price'];
            }
            $r = room_rng_next($rng) * $total;
            $acc = 0;
            $chosen = $keys[count($keys) - 1];
            foreach ($keys as $k) {
                $acc += $arsenal['weapons'][$k]['price'];
                if ($r < $acc) {
                    $chosen = $k;
                    break;
                }
            }
        } else {
            $best = -INF;
            foreach ($keys as $k) {
                $a = $arsenal['weapons'][$k];
                $score = room_drone_score($pick, $a['dmg'], $a['radius'], $a['pack'], $a['price']);
                if ($score > $best) {
                    $best = $score;
                    $chosen = $k;
                }
            }
        }
        $buys[] = ['item' => $chosen, 'qty' => 1];
        $spent += $arsenal['weapons'][$chosen]['price'];
    }
    return $buys;
}
/* The personality with this key. */
function room_drone_personality(array $personalities, string $key): ?array
{
    foreach ($personalities as $p) {
        if ($p['key'] === $key) {
            return $p;
        }
    }
    return null;
}
/* The personalities with rules of their own other than $self: what a shapeshifter may take. */
function room_drone_ruled(array $personalities, string $self): array
{
    return array_values(array_filter($personalities, fn($p) => $p['key'] !== $self && !isset($p['shift'])));
}
/* The stream a drone's draws come from in one round: the match seed, the round (0 is the pre-match shop) and the seat. */
function room_drone_rng(string $seed, int $round, int $seat): int
{
    return room_hash_seed($seed . '|drone|' . $round . '|' . $seat);
}
/* A new drone's character: a personality drawn uniformly from the seed and its seat, and a shapeshifter's first form. */
function room_drone_deal(array $personalities, string $seed, int $seat): array
{
    if (!$personalities) {
        return ['personality' => '', 'form' => ''];
    }
    $rng = room_hash_seed($seed . '|drone|deal|' . $seat);
    $mine = $personalities[(int) floor(room_rng_next($rng) * count($personalities))];
    $form = $mine['key'];
    if (isset($mine['shift'])) {
        $others = room_drone_ruled($personalities, $mine['key']);
        if ($others) {
            $form = $others[(int) floor(room_rng_next($rng) * count($others))]['key'];
        }
    }
    return ['personality' => $mine['key'], 'form' => $form];
}
/* The form a drone shops by this round: a shapeshifter after the first shop shifts with probability `shift`
 * (one draw) to another personality with rules (a second draw); otherwise it keeps the form it has. */
function room_drone_form(array $personalities, array $drone, int $round, int &$rng): string
{
    $mine = room_drone_personality($personalities, $drone['personality']);
    if ($mine === null || !isset($mine['shift'])) {
        return $drone['personality'];
    }
    if ($round > 0 && room_rng_next($rng) < $mine['shift']) {
        $others = room_drone_ruled($personalities, $mine['key']);
        if ($others) {
            return $others[(int) floor(room_rng_next($rng) * count($others))]['key'];
        }
    }
    return $drone['form'];
}
/* One shop visit for seat $seat: it settles its form for the round, chooses, and each purchase goes through
 * room_buy, the function the players buy with. Returns the purchases that went through. */
function room_drone_visit(array &$room, int $seat): array
{
    $personalities = room_drones();
    $drone = $room['persona'][$seat] ?? ['personality' => '', 'form' => ''];
    $round = (int) $room['round'];
    $rng = room_drone_rng(room_drone_seed($room), $round, $seat);
    $room['persona'][$seat]['form'] = $form = room_drone_form($personalities, $drone, $round, $rng);
    $rules = room_drone_personality($personalities, $form);
    if ($rules === null) {
        return [];
    }
    $state = ['cash' => (int) ($room['cash'][$seat] ?? 0), 'armor' => room_muster_armor($room, $seat), 'plate' => (int) ($room['plate'][$seat] ?? 0),
        'chutes' => (int) ($room['chutes'][$seat] ?? 0), 'shield' => !empty($room['shield'][$seat])];
    $done = [];
    foreach (room_drone_shop($state, room_drone_arsenal(), $rules, $rng) as $b) {
        if (room_buy($room, $seat, $b['item'], $b['qty']) === null) {
            $done[] = $b;
        }
    }
    return $done;
}
/* The seed a room's drones draw from: hidden, dealt at match start. */
function room_drone_seed(array $room): string
{
    return (string) ($room['droneSeed'] ?? ('tankity-drones-' . ($room['code'] ?? '')));
}
/* A drone seat's economy and personality, dealt once (a match start deals every drone seat; a seat that
 * starts without them, a room built piecemeal, gets them when it is first needed). The economy keeps
 * whatever the seat already holds, so a human who leaves keeps their own. */
function room_drone_ready(array &$room, int $seat): void
{
    if (!isset($room['cash'][$seat]) && !isset($room['ammo'][$seat])) {
        room_seat_economy($room, $seat);
    }
    if (!isset($room['persona'][$seat])) {
        $room['persona'][$seat] = room_drone_deal(room_drones(), room_drone_seed($room), $seat);
    }
}
/* What a drone seat shows on its name: its personality's name (a shapeshifter's is its own), or null. */
function room_drone_persona_name(array $room, int $seat): ?string
{
    $key = $room['persona'][$seat]['personality'] ?? '';
    $p = $key === '' ? null : room_drone_personality(room_drones(), $key);
    return $p === null ? null : (string) $p['name'];
}
