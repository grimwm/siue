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
    'easy' => ['wobStart' => 5.0, 'wobStep' => 0.3, 'wobFloor' => 2.0, 'correct' => 0.5, 'brkShrink' => 0.6, 'brkFloor' => 0.8, 'brkMax' => 5],
    'normal' => ['wobStart' => 3.7, 'wobStep' => 0.33, 'wobFloor' => 1.15, 'correct' => 0.6, 'brkShrink' => 0.5, 'brkFloor' => 0.4, 'brkMax' => 5],
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
        $land = room_sim_shot($room['terrain'], $room['wind'], $mx, $my, (float) $a, (float) $p, $wkey, $dirS, $width, $high);
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
const ROOM_FIELD_AIM = [[720, 1.0, 1.0], [1080, 0.7, 0.5], [1440, 0.55, 0.4]];
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
    return in_array($def['effect'] ?? 'shot', ['pellets', 'cluster', 'scatter', 'hop'], true) || ($def['radius'] ?? 0) >= 40;
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
 * where its shot splits; whether the shot itself is one blast. src/ai.ts
 * munitions is the same. ['burst', 'xs', 'paths', 'dmg', 'r']. */
function room_ai_munitions(array $room, array $self, string $wkey, array $land, ?array $from = null): array
{
    $w = room_weapons()[$wkey];
    $xs = [];
    $paths = [];
    $dmg = $w['subDmg'] ?: $w['dmg'];
    $r = $w['subRadius'] ?: $w['radius'];
    $dirS = $self['dirS'] ?? -1;
    if ($w['effect'] === 'pellets') {
        if (!isset($land['a'], $land['p'])) {
            return ['burst' => true, 'xs' => [], 'paths' => [], 'dmg' => $dmg, 'r' => $r];
        }
        $n = $w['pellets'] ?: 1;
        [$mx, $my] = room_muzzle(['angle' => (float) $land['a']] + $self);
        $spd = room_shot_speed((float) $land['p'], !empty($w['flat']), (float) $w['speed'], room_field_reach(count($room['terrain'])));
        $drop = function (float $a) use ($mx, $my, $spd, $dirS, $land): float {
            $vx = det_cos($a) * $spd * $dirS;
            $vy = -det_sin($a) * $spd;
            return $mx + $vx * room_drop_time($my, $vy, $land['y']);
        };
        $mid = $drop(deg2rad((float) $land['a']));
        for ($i = 0; $i < $n; $i++) {
            $xs[] = $land['x'] + $drop(deg2rad((float) $land['a']) + ($i - ($n - 1) / 2) * $w['spread']) - $mid;
            $paths[] = null;
        }
        return ['burst' => false, 'xs' => $xs, 'paths' => $paths, 'dmg' => $w['dmg'], 'r' => $w['radius']];
    }
    if ($w['effect'] === 'hop') {
        $x = $land['x'];
        $vx = $land['vx'] ?? 0.0;
        $vy = $land['vy'] ?? 0.0;
        $keep = $w['hopKeep'] ?: 0.5;
        for ($i = 1; $i < ($w['hops'] ?: 1); $i++) {
            $hvx = $vx * $keep;
            $hvy = -abs($vy) * $keep;
            $t = room_drop_time($land['y'] - 1, $hvy, $land['y']);
            $paths[] = [$x, $land['y'] - 1, $hvx, $hvy];
            $x += $hvx * $t;
            $xs[] = $x;
            $vx = $hvx;
            $vy = $hvy + ROOM_GRAV * $t;
        }
    } elseif ($w['effect'] === 'scatter') {
        $x0 = $from !== null ? $from[0] : $land['x'];
        $y0 = $from !== null ? $from[1] : $land['y'] - 2;
        foreach (room_scatter_vel(max(2, $w['split'] ?: 4), $w['fan'] ?: 0.22, $w['kick'] ?: 150.0) as [$vx, $vy]) {
            $xs[] = $x0 + $vx * room_drop_time($y0, $vy, $land['y']);
            $paths[] = [$x0, $y0, $vx, $vy];
        }
    } elseif ($w['effect'] === 'cluster' && isset($land['a'], $land['p'])) {
        [$mx, $my] = room_muzzle(['angle' => (float) $land['a']] + $self);
        $at = room_split_point($room['terrain'], $room['wind'], $mx, $my, (float) $land['a'], (float) $land['p'], $wkey, $dirS, count($room['terrain']));
        if ($at === null) {
            return ['burst' => true, 'xs' => [], 'paths' => [], 'dmg' => $dmg, 'r' => $r];
        }
        foreach (room_split_vel($at[2], $at[3], max(2, $w['split'] ?: 4), $w['fan'] ?: 0.22) as [$vx, $vy]) {
            $xs[] = $at[0] + $vx * room_drop_time($at[1], $vy, $land['y']);
            $paths[] = [$at[0], $at[1], $vx, $vy];
        }
        return ['burst' => false, 'xs' => $xs, 'paths' => $paths, 'dmg' => $dmg, 'r' => $r];
    }
    return ['burst' => true, 'xs' => $xs, 'paths' => $paths, 'dmg' => $dmg, 'r' => $r];
}
/* True when a munition flying free from $path [x0, y0, vx, vy], with no wind,
 * passes through hit box $b [cx, cy, rx, ry] before it comes down to $groundY
 * (src/ai.ts crosses). */
function room_ai_crosses(array $b, array $path, float $groundY): bool
{
    [$x0, $y0, $vx, $vy] = $path;
    [$cx, $cy, $rx, $ry] = $b;
    $steps = min(ROOM_FLIGHT_STEPS, (int) ceil(room_drop_time($y0, $vy, $groundY) * 60));
    for ($k = 1; $k <= $steps; $k++) {
        $t = $k / 60;
        $u = ($x0 + $vx * $t - $cx) / $rx;
        $v = ($y0 + $vy * $t + ROOM_GRAV * $t * $t / 2 - $cy) / $ry;
        if ($u * $u + $v * $v <= 1) {
            return true;
        }
    }
    return false;
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
    $d = room_dist($tx - $land['x'], $ty - $land['y']);
    $own = min(room_dist($sx - $land['x'], $sy - $land['y']), room_dist($sx - $tx, $sy - $ty) - max($trx, $try));
    $onSelf = fn(int $dmg, float $near, float $r, float $x): int => abs($x - $sx) <= $srx ? 2 * $dmg : room_ai_reach_damage($dmg, $near, $r);
    $selfFrom = function (array $subs) use ($sb, $sx, $sy, $own, $land, $onSelf): int {
        $sum = 0;
        foreach ($subs['xs'] as $i => $x) {
            $path = $subs['paths'][$i];
            $sum += $path !== null && room_ai_crosses($sb, $path, $land['y']) ? 2 * $subs['dmg']
                : $onSelf($subs['dmg'], min(room_dist($sx - $x, $sy - $land['y']), $own + abs($x - $land['x'])), (float) $subs['r'], $x);
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
    foreach ($subs['xs'] as $x) {
        $harm += room_ai_reach_damage($subs['dmg'], room_dist($tx - $x, $ty - $land['y']), (float) $subs['r']);
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
    $b = room_ai_bursts($room, $self, $target, $wkey, $land);
    if ($b['own'] <= $b['reach'] * ROOM_AI_SAFE_MARGIN) {
        return -INF;
    }
    return min((float) $target['hp'], $b['harm'] + room_ai_fall_harm($room, $self, $target, $wkey, $land));
}
/* The damage gun $wkey landing at $land would do to $self, its own gunner,
 * with no margin (src/ai.ts aiSelfHarm). */
function room_ai_self_harm(array $room, array $self, array $target, string $wkey, array $land): int
{
    if (!room_flies(room_weapons()[$wkey])) {
        return 0; // a beam never crosses its gunner; a ring spares it
    }
    return $land['oob'] ? 0 : room_ai_bursts($room, $self, $target, $wkey, $land)['self'];
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
 * straight at the target's body, to the nearest whole degree and within the
 * barrel's 10..170, at full power. [a, p]. src/ai.ts beamAim is the same. */
function room_ai_beam_aim(array $self, array $target): array
{
    [$cx, $cy] = room_unit_box($target);
    $r = det_atan2(-($cy - ($self['y'] - 14)), ($cx - $self['x']) * ($self['dirS'] ?? -1));
    return [max(10.0, min(170.0, det_round($r / M_PI * 180))), 100.0];
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
    return min((float) $target['hp'], room_ai_bursts($room, $self, $target, $wkey, $land)['harm'] + room_ai_fall_harm($room, $self, $target, $wkey, $land));
}
/* The harm of the fall a gun's crater would give the target, less the
 * drone's own. Craters do not drop units into falls that hurt yet, so it is
 * 0. src/ai.ts fallHarm is the same. */
function room_ai_fall_harm(array $room, array $self, array $target, string $wkey, array $land): float
{
    return 0.0;
}
/* The gun to fire once the search has found each arc's best aim ($byArc:
 * flight key => [err, a, p, land]). src/ai.ts pickGun is the same: the most
 * harmful candidate wins, the cheaper on a tie, then rack order; glory weighs every gun it
 * carries, any other strategy the guns of the best-landing arc; when no gun
 * would hurt anyone, that arc's first gun (glory: its strongest), or if that
 * would reach the drone itself, the gun of the best-landing arc that would
 * not. */
function room_ai_pick_gun(array $room, array $self, array $target, bool $glory, array $guns, array $arcOf, array $byArc, string $bestGun): string
{
    $weapons = room_weapons();
    $harms = [];
    $harmOf = function (string $k) use (&$harms, $room, $self, $target, $arcOf, $byArc): float {
        if (!isset($harms[$k])) {
            $harms[$k] = room_ai_harm($room, $self, $target, $k, $byArc[$arcOf[$k]]['land']);
        }
        return $harms[$k];
    };
    $pool = $glory ? $guns : array_values(array_filter($guns, fn($k) => $arcOf[$k] === $arcOf[$bestGun]));
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
    $fallback = $bestGun;
    if ($glory) {
        foreach ($pool as $k) {
            if ($weapons[$k]['dmg'] > $weapons[$fallback]['dmg']) {
                $fallback = $k;
            }
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
    // one that hurts the target most, then the cheaper.
    [$pick, $pickSelf, $pickHarm] = [$bestGun, INF, -INF];
    foreach ($guns as $k) {
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
    // A beam or a ring has no landing to walk in: after one, the drone aims afresh.
    if ($mem !== null && $mem['n'] < $skill['brkMax'] && abs($tank['x'] - $mem['ox']) <= 1.0 && in_array($mem['w'], $keys, true)
        && room_flies($weapons[$mem['w']])) {
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
        $sim = room_sim_shot($room['terrain'], $room['wind'], $mx, $my, (float) $mem['a'], (float) $mem['p'], $w, $dirS, $width, $high);
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
        $best = null;
        $consider = function (string $wkey, int $a, int $p) use (&$best, &$byArc, &$arcOf, $room, $mx, $my, $dirS, $me, $width, $high): float {
            $land = room_sim_shot($room['terrain'], $room['wind'], $mx, $my, (float) $a, (float) $p, $wkey, $dirS, $width, $high);
            $err = $land['oob'] ? 400 + abs($land['x'] - $me['x']) * 0.2 : abs($land['x'] - $me['x']);
            $f = $arcOf[$wkey];
            if (!isset($byArc[$f]) || $err < $byArc[$f]['err']) {
                $byArc[$f] = ['err' => $err, 'a' => $a, 'p' => $p, 'land' => $land + ['a' => $a, 'p' => $p]];
            }
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
        // The first angle on the grid above ROOM_LOB_ANGLE.
        $highFrom = 25 + 6 * (int) ceil((ROOM_LOB_ANGLE + 1 - 25) / 6);
        $planOf = function (array $from) use ($weapons): array {
            $plan = room_ai_arc_guns($weapons, $from);
            usort($plan, fn($a, $b) => (int) ($weapons[$a]['effect'] === 'roller') <=> (int) ($weapons[$b]['effect'] === 'roller'));
            return $plan;
        };
        $plan = $planOf($guns);
        foreach ($plan as $wkey) {
            $search($wkey, $s === 'lobber' ? $highFrom : 25, 155);
        }
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
                $best = null;
                foreach ($planOf($guns) as $wkey) {
                    $search($wkey, 25, 155);
                }
            } elseif ($best['err'] > ROOM_LOB_OK) {
                // A lobber falls back to flat shots when no high arc lands near.
                foreach ($plan as $wkey) {
                    $search($wkey, 25, $highFrom - 1);
                }
            }
        }
        $w = room_ai_pick_gun($room, $tank, $me, $s === 'glory', $guns, $arcOf, $byArc, $best['wkey']);
        $aim = $byArc[$arcOf[$w]];
        [$ba, $bp, $n] = [$aim['a'], $aim['p'], 0];
        // A gun with no flight, aimed as it aims (a beam at the target's body,
        // a ring wherever the barrel points, both at full power), fires instead
        // when it would do more harm than that pick (and any harm at all).
        $top = max(0.0, room_ai_harm($room, $tank, $me, $w, $aim['land']));
        foreach ($grounded as $k) {
            [$ga, $gp] = $weapons[$k]['effect'] === 'beam' ? room_ai_beam_aim($tank, $me) : [(float) $tank['angle'], 100.0];
            $h = room_ai_harm($room, $tank, $me, $k, ['x' => $tank['x'], 'y' => $tank['y'], 'oob' => false, 'a' => $ga, 'p' => $gp]);
            if ($h > $top) {
                [$w, $ba, $bp, $top] = [$k, $ga, $gp, $h];
            }
        }
    }
    if ($me['kind'] === 'human' && ($room['jammer'][$me['seat']] ?? 0) > 0) {
        $wob *= 2;
    }
    $angle = max(10.0, min(170.0, round($ba + room_gauss($rng) * 9 * $wob)));
    $power = max(10.0, min(100.0, round($bp + room_gauss($rng) * 12 * $wob)));
    // Drones shuffle for a better firing spot instead of camping one rut,
    // unless they are walking a bracket in, or fire a gun with no flight
    // (aimed from where they stand).
    $dx = 0.0;
    if ($cont === null && room_flies($weapons[$w]) && room_rng_next($rng) < 0.35) {
        $dx = (room_rng_next($rng) < 0.5 ? -1.0 : 1.0) * (8 + room_rng_next($rng) * 27);
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

/* Drone magazine from the data file: aiRack of each gun the battery may load
 * by round (src/sim.ts droneRack is the same). */
function room_ai_rack(int $round): array
{
    $rack = ['shell' => -1];
    foreach (room_weapons() as $k => $def) {
        if ($k === 'shell') {
            continue;
        }
        $rack[$k] = (!empty($def['ai']) && $round >= ($def['aiRound'] ?? 99)) ? (int) ($def['aiRack'] ?? 2) : 0;
    }
    return $rack;
}
