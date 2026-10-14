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
/* The share of a hop or scatter gun's later munitions a drone counts on, and
 * the share of a cluster's flight left after it splits (src/ai.ts
 * AI_SUB_SHARE and AI_SPLIT_LEFT). */
const ROOM_AI_SUB_SHARE = 0.35;
const ROOM_AI_SPLIT_LEFT = 0.5;
/* A blast's damage to a unit $d px from it, or 0 past its reach. */
function room_ai_reach_damage(int $dmg, float $d, float $r): int
{
    return $d <= $r + 14 ? (int) round($dmg * max(0.3, 1 - $d / ($r + 14))) : 0;
}
/* The harm gun $wkey would do to $target landing at $land (room_sim_shot's
 * x, y, oob), fired by $self: its blast on the target's body, plus what its
 * pellets or bomblets add, plus room_ai_fall_harm; -INF when any of it could
 * reach $self's own body. src/ai.ts aiHarm is the same. */
function room_ai_harm(array $room, array $self, array $target, string $wkey, array $land): float
{
    $w = room_weapons()[$wkey];
    if ($land['oob']) {
        return 0.0;
    }
    [$tx, $ty] = room_unit_box($target);
    [$sx, $sy] = room_unit_box($self);
    $d = room_dist($tx - $land['x'], $ty - $land['y']);
    $own = room_dist($sx - $land['x'], $sy - $land['y']);
    $subDmg = $w['subDmg'] ?: $w['dmg'];
    $subR = $w['subRadius'] ?: $w['radius'];
    $harm = 0.0;
    $reach = $w['radius'] + 14;
    if ($w['effect'] === 'pellets' || $w['effect'] === 'cluster') {
        $pel = $w['effect'] === 'pellets';
        $n = $pel ? ($w['pellets'] ?: 1) : max(2, $w['split'] ?: 4);
        $step = $pel ? $w['spread'] : ($w['fan'] ?: 0.22);
        $dmg = $pel ? $w['dmg'] : $subDmg;
        $r = $pel ? $w['radius'] : $subR;
        // How far the fan has to spread: the whole flight for pellets, what is left after the split for bomblets.
        $len = room_dist($land['x'] - $self['x'], $land['y'] - ($self['y'] - 14)) * ($pel ? 1 : ROOM_AI_SPLIT_LEFT);
        $reach = 0;
        for ($i = 0; $i < $n; $i++) {
            $off = abs($i - ($n - 1) / 2) * $step * $len;
            $harm += room_ai_reach_damage($dmg, $d + $off, (float) $r);
            $reach = max($reach, $r + 14 + $off);
        }
    } else {
        $harm = (float) room_ai_reach_damage($w['dmg'], $d, (float) $w['radius']);
        if ($w['effect'] === 'hop' || $w['effect'] === 'scatter') {
            $hop = $w['effect'] === 'hop';
            $n = $hop ? $w['hops'] - 1 : max(2, $w['split'] ?: 4);
            // How far a scatter gun's bomblets may land: half the range of its fastest thrown at 45 degrees.
            $spread = $hop ? 0.0 : $w['kick'] * $w['kick'] / (2 * ROOM_GRAV);
            $harm += ROOM_AI_SUB_SHARE * $n * room_ai_reach_damage($subDmg, max(0.0, $d - $spread), (float) $subR);
            $reach = max($reach, $subR + 14 + $spread);
        }
    }
    if ($own <= $reach) {
        return -INF;
    }
    return $harm + room_ai_fall_harm($room, $self, $target, $wkey, $land);
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
 * harmful candidate wins, ties to rack order; glory weighs every gun it
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
        if ($h > $topHarm) {
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
    return $safe ?? $fallback;
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
    if ($mem !== null && $mem['n'] < $skill['brkMax'] && abs($tank['x'] - $mem['ox']) <= 1.0 && in_array($mem['w'], $keys, true)) {
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
        $guns = $keys;
        if ($s === 'lobber') {
            $area = array_values(array_filter($keys, fn($k) => room_area_gun($weapons[$k])));
            $guns = count($area) ? $area : $keys;
        }
        // Every planning arc's best aim, and the best of all.
        $arcOf = [];
        foreach ($guns as $k) {
            $arcOf[$k] = room_flight_key($weapons[$k]);
        }
        $byArc = [];
        $best = null;
        $consider = function (string $wkey, int $a, int $p) use (&$best, &$byArc, $arcOf, $room, $mx, $my, $dirS, $me, $width, $high): float {
            $land = room_sim_shot($room['terrain'], $room['wind'], $mx, $my, (float) $a, (float) $p, $wkey, $dirS, $width, $high);
            $err = $land['oob'] ? 400 + abs($land['x'] - $me['x']) * 0.2 : abs($land['x'] - $me['x']);
            $f = $arcOf[$wkey];
            if (!isset($byArc[$f]) || $err < $byArc[$f]['err']) {
                $byArc[$f] = ['err' => $err, 'a' => $a, 'p' => $p, 'land' => $land];
            }
            if ($best === null || $err < $best['err']) {
                $best = ['err' => $err, 'a' => $a, 'p' => $p, 'wkey' => $wkey];
            }
            return $err;
        };
        // One gun over angles lo..hi of the grid (25, 31, ...) and powers 20,
        // 26, ... 98: every other point of it, then the eight neighbours of the best.
        $search = function (string $wkey, int $lo, int $hi) use ($consider): void {
            [$ca, $cp, $ce] = [$lo, 20, INF];
            for ($a = $lo; $a <= $hi; $a += 12) {
                for ($p = 20; $p <= 100; $p += 12) {
                    $err = $consider($wkey, $a, $p);
                    if ($err < $ce) {
                        [$ca, $cp, $ce] = [$a, $p, $err];
                    }
                }
            }
            for ($a = $ca - 6; $a <= $ca + 6; $a += 6) {
                for ($p = $cp - 6; $p <= $cp + 6; $p += 6) {
                    if (($a !== $ca || $p !== $cp) && $a >= $lo && $a <= $hi && $p >= 20 && $p <= 100) {
                        $consider($wkey, $a, $p);
                    }
                }
            }
        };
        // The first angle on the grid above ROOM_LOB_ANGLE.
        $highFrom = 25 + 6 * (int) ceil((ROOM_LOB_ANGLE + 1 - 25) / 6);
        $plan = room_ai_arc_guns($weapons, $guns);
        foreach ($plan as $wkey) {
            $search($wkey, $s === 'lobber' ? $highFrom : 25, 155);
        }
        // A lobber falls back to flat shots only when no high arc lands near.
        if ($s === 'lobber' && $best['err'] > ROOM_LOB_OK) {
            foreach ($plan as $wkey) {
                $search($wkey, 25, $highFrom - 1);
            }
        }
        $w = room_ai_pick_gun($room, $tank, $me, $s === 'glory', $guns, $arcOf, $byArc, $best['wkey']);
        $aim = $byArc[$arcOf[$w]];
        [$ba, $bp, $n] = [$aim['a'], $aim['p'], 0];
    }
    if ($me['kind'] === 'human' && ($room['jammer'][$me['seat']] ?? 0) > 0) {
        $wob *= 2;
    }
    $angle = max(10.0, min(170.0, round($ba + room_gauss($rng) * 9 * $wob)));
    $power = max(10.0, min(100.0, round($bp + room_gauss($rng) * 12 * $wob)));
    // Drones shuffle for a better firing spot instead of camping one rut,
    // unless they are walking a bracket in.
    $dx = 0.0;
    if ($cont === null && room_rng_next($rng) < 0.35) {
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
