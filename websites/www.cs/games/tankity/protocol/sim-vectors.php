<?php
// Writes (or checks) sim-vectors.json next to this file: game math cases for
// the two simulations that must agree, rooms.php (the room server) and
// src/sim.ts and src/armor.ts (the browser's sim and armor rules: solo, demo and
// the client's own shell flight).
//   php protocol/sim-vectors.php          rewrite sim-vectors.json
//   php protocol/sim-vectors.php --check  exit 1 if it is stale
// Every expected value comes from rooms.php's own functions (or, for the
// inlined pieces, the small pure functions extracted from the step loops).
// ../test/sim-vectors.test.mjs replays each case through the browser sim (src/sim.ts, src/armor.ts).
// Plain php: no web server, docker or shared memory. Cases are inputs and
// expected outputs only; a case with a 'known' reason is a difference the two
// sides have on purpose (or that is waiting on a decision), which the runner
// reports instead of failing on.
declare(strict_types=1);
if (!defined('TANKITY_ROOMS_LIB')) {
    define('TANKITY_ROOMS_LIB', true);
}
require_once __DIR__ . '/../rooms.php';

const SV_WIDTH = 720;
const SV_DECIMALS = 5; // numbers are written to this many places; the runner's tolerance is 1e-4
const SV_TOLERANCE = 0.0001;
ini_set('serialize_precision', '-1'); // exact cases are written as the shortest string that reads back to the same double

/** Rounds every float in a value, so the file is stable across platforms. */
function sv_round($v)
{
    if (is_float($v)) {
        $r = round($v, SV_DECIMALS);
        return $r == 0 ? 0.0 : $r; // never write -0
    }
    if (is_array($v)) {
        return array_map('sv_round', $v);
    }
    return $v;
}

/** A terrain from its recipe, to the nearest 0.001 (det_sin, so the recipe means the same ground everywhere). */
function sv_terrain(array $spec, int $w = SV_WIDTH): array
{
    $t = [];
    for ($ix = 0; $ix < $w; $ix++) {
        if (isset($spec['flat'])) {
            $y = (float) $spec['flat'];
        } elseif (isset($spec['slope'])) {
            $y = $spec['slope'][0] + ($spec['slope'][1] - $spec['slope'][0]) * $ix / ($w - 1);
        } elseif (isset($spec['vee'])) {
            // A V valley: [centre, half width, rim y, bottom y].
            [$cx, $half, $top, $bottom] = $spec['vee'];
            $y = $top + ($bottom - $top) * max(0, 1 - abs($ix - $cx) / $half);
        } else {
            [$base, $amp, $period] = $spec['hills'];
            $y = $base + $amp * det_sin($ix * 2 * M_PI / $period);
        }
        foreach ($spec['set'] ?? [] as [$x0, $x1, $sy]) {
            if ($ix >= $x0 && $ix <= $x1) {
                $y = (float) $sy;
            }
        }
        $t[] = round($y * 1000) / 1000;
    }
    return $t;
}

/** A room around a case: seat i is tank i; flags on a tank become the room's per-seat state. */
function sv_room(array $c, int $w = SV_WIDTH): array
{
    $room = ['terrain' => sv_terrain($c['terrain'], $w), 'tanks' => [], 'wind' => (float) ($c['wind'] ?? 0),
        'round' => (int) ($c['round'] ?? 1), 'rng' => (int) ($c['seed'] ?? 1),
        'scores' => [], 'cash' => [], 'shield' => [], 'bunker' => [], 'laststand' => [], 'jammer' => [], 'chutes' => [], 'stats' => []];
    if (array_key_exists('difficulty', $c)) {
        $room['difficulty'] = $c['difficulty'];
    }
    foreach ($c['tanks'] as $i => $t) {
        $room['tanks'][$i] = ['seat' => $i, 'kind' => $t['kind'], 'name' => 'T' . $i,
            'x' => (float) $t['x'], 'y' => (float) $t['y'], 'angle' => (float) ($t['angle'] ?? 45), 'power' => (float) ($t['power'] ?? 50),
            'hp' => (int) ($t['hp'] ?? 100), 'maxHp' => 100, 'fuel' => (float) ($t['fuel'] ?? 80), 'dirS' => $t['dirS'] ?? 1,
            'ammo' => $t['ammo'] ?? []];
        foreach (['s', 'dry', 'dealt', 'lastHitBy', 'kills', 'fellBy'] as $k) {
            if (isset($t[$k])) {
                $room['tanks'][$i][$k] = $t[$k];
            }
        }
        $room['scores'][$i] = (int) ($t['score'] ?? 0);
        $room['shield'][$i] = !empty($t['shield']);
        $room['bunker'][$i] = (int) ($t['bunker'] ?? 0);
        $room['laststand'][$i] = !empty($t['laststand']);
        $room['jammer'][$i] = (int) ($t['jammer'] ?? 0);
        if ($t['kind'] === 'human') {
            $room['chutes'][$i] = (int) ($t['chutes'] ?? 0);
        } elseif (isset($t['chutes'])) {
            $room['tanks'][$i]['chutes'] = (int) $t['chutes'];
        }
    }
    return $room;
}

/** What a blast or a volley changed: hp and fuel, the crater cells, and the human seat's score and cash. */
function sv_outcome(array $before, array $room): array
{
    $tanks = [];
    $human = null;
    foreach ($room['tanks'] as $i => $t) {
        $tanks[] = ['hp' => $t['hp'], 'fuel' => $t['fuel'], 'y' => (float) $t['y'], 'chutes' => $t['kind'] === 'ai' ? (int) ($t['chutes'] ?? 0) : null,
            'lastHitBy' => $t['lastHitBy'] ?? null, 'dealt' => !empty($t['dealt']), 'fellBy' => $t['fellBy'] ?? null];
        if ($t['kind'] === 'human' && $human === null) {
            $human = $i;
        }
    }
    $first = null;
    $last = null;
    foreach ($room['terrain'] as $ix => $y) {
        if (abs($y - $before['terrain'][$ix]) > 1e-9) {
            $first ??= $ix;
            $last = $ix;
        }
    }
    return ['tanks' => $tanks,
        'crater' => $first === null ? null : ['x0' => $first, 'y' => array_slice($room['terrain'], $first, $last - $first + 1)],
        'score' => $human === null ? 0 : ($room['scores'][$human] ?? 0),
        'cash' => $human === null ? 0 : ($room['cash'][$human] ?? 0),
        'shield' => $human === null ? false : $room['shield'][$human],
        'laststand' => $human === null ? false : $room['laststand'][$human],
        'chutes' => $human === null ? 0 : (int) ($room['chutes'][$human] ?? 0)];
}

/** The aim (angle, power) a shooter would pick to land a shell on x, found with the server's own predictor. */
function sv_aim_at(array $room, int $seat, string $wkey, float $targetX, int $lo = 15, int $hi = 85): array
{
    $tank = $room['tanks'][$seat];
    $best = [INF, 45, 50];
    for ($a = $lo; $a <= $hi; $a++) {
        for ($p = 20; $p <= 100; $p++) {
            $t = $tank;
            $t['angle'] = (float) $a;
            [$mx, $my] = room_muzzle($t);
            $land = room_sim_shot($room['terrain'], $room['wind'], $mx, $my, (float) $a, (float) $p, $wkey, $tank['dirS'], SV_WIDTH);
            $err = $land['oob'] ? INF : abs($land['x'] - $targetX);
            if ($err < $best[0]) {
                $best = [$err, $a, $p];
            }
        }
    }
    return [$best[1], $best[2]];
}

// The output fields each known difference may disagree on (array indexes
// written []; a path also covers everything under it). Any other field of a
// known case must still match.
const SV_KNOWN_PATHS = [
    'ai-aim/no-rivals-left' => ['out.angle', 'out.power'],
];
$cases = [];
$add = function (string $group, string $name, array $in, $out, ?string $known = null) use (&$cases): void {
    $case = ['name' => $name, 'in' => $in, 'out' => sv_round($out)];
    if ($known !== null) {
        $paths = SV_KNOWN_PATHS["$group/$name"] ?? null;
        if ($paths === null) {
            fwrite(STDERR, "sim-vectors: known case $group/$name needs its fields in SV_KNOWN_PATHS\n");
            exit(1);
        }
        $case['known'] = $known;
        $case['knownPaths'] = $paths;
    }
    $cases[$group][] = $case;
};
/* An exact case: written unrounded and compared with Object.is by the runner. */
$exact = function (string $group, string $name, array $in, $out) use (&$cases): void {
    $cases[$group][] = ['name' => $name, 'in' => $in, 'out' => $out, 'exact' => true];
};
$weapons = room_weapons();

/* ---- the deterministic math: every function on a grid and its edges ----
 * Compared without tolerance: the browser must produce these exact doubles. */
$det = function (string $fn, float $x, ?float $y = null) use ($exact): void {
    $out = match ($fn) {
        'sin' => det_sin($x), 'cos' => det_cos($x), 'atan' => det_atan($x),
        'atan2' => det_atan2((float) $y, $x), 'round' => det_round($x),
    };
    $n = fn(float $v): string => json_encode($v, JSON_PRESERVE_ZERO_FRACTION);
    $exact('detmath', "$fn(" . ($y === null ? '' : $n($y) . ', ') . $n($x) . ')', ['fn' => $fn, 'x' => $x] + ($y === null ? [] : ['y' => $y]), $out);
};
for ($i = -60; $i <= 60; $i++) {
    $x = $i * 0.5236 + 0.00137 * $i;
    $det('sin', $x);
    $det('cos', $x);
    $det('atan', $x / 7);
}
// 1200 more points in +-100 for sin, cos and atan, so a one-ulp change in a leading kernel term (the reduction,
// S1, S2, C1, the first atan terms and the atan breakpoints) fails cases. The high-order terms change no
// output at these points, so these vectors leave them unpinned.
for ($i = 0; $i < 400; $i++) {
    $x = (($i * 7919) % 20011) / 100.0 - 100.0 + 0.00031;
    $det('sin', $x);
    $det('cos', $x + 0.5);
    $det('atan', $x / 9.7);
}
// Past 1e5 the reduction loses accuracy (never fed by the game), but both sides still agree to the bit.
$edges = [-0.0, M_PI_4, -M_PI_4, M_PI_2, M_PI, 3 * M_PI_2, 2 * M_PI, -M_PI_2 * 7, 30.9, 1e-9, -1e-300, 5e-324,
    0.4375, 0.6875, 1.1875, 2.4375, -2.4375, 1e5, 1e6, 1e15, -1e22];
foreach ($edges as $x) {
    $det('sin', $x);
    $det('cos', $x);
    $det('atan', $x);
}
foreach ([[1, 1], [1, -1], [-1, -1], [-1, 1], [0, 1], [0, -1], [1, 0], [-1, 0], [0, 0], [-0.0, -1], [-0.0, 1], [3e-7, -2], [-250.5, 31.25]] as [$y, $x]) {
    $det('atan2', (float) $x, (float) $y);
}
foreach ([2.5, -2.5, 0.49999999999999994, -0.5, -0.4, -0.0, 0.0, 7.5, -7.5, 1e15 + 0.5, 4503599627370497.0, -4503599627370497.0] as $x) {
    $det('round', $x);
}

/* ---- constants and the integer core ---- */
$add('constants', 'physics', [], ['grav' => ROOM_GRAV, 'flatGrav' => ROOM_FLAT_GRAV, 'windK' => ROOM_TURN_WIND,
    'unitGap' => ROOM_UNIT_GAP, 'spawnGap' => ROOM_SPAWN_GAP]);

foreach (['tankity-canyon-three', 'scorch-01', '', 'a'] as $seed) {
    $state = room_hash_seed($seed);
    $stream = [];
    $s = $state;
    for ($i = 0; $i < 6; $i++) {
        $stream[] = room_rng_next($s);
    }
    $add('rng', 'seed-' . ($seed === '' ? 'empty' : $seed), ['seed' => $seed], ['hash' => $state, 'stream' => $stream]);
}
foreach (['tankity-twin-hills', 'scorch-01', 'tankity-riverbed'] as $seed) {
    $rng = room_hash_seed($seed);
    $t = room_gen_terrain($rng, SV_WIDTH);
    $samples = [];
    for ($x = 0; $x < SV_WIDTH; $x += 60) {
        $samples[] = $t[$x];
    }
    $add('terrain-gen', 'seed-' . $seed, ['seed' => $seed], ['samples' => $samples, 'min' => min($t), 'max' => max($t)]);
}
foreach ([[1, 3], [2, 1234], [3, 99], [4, 7], [5, 2026]] as [$n, $seed]) {
    $rng = $seed;
    $spots = room_spawn_spots($rng, $n, SV_WIDTH);
    $add('spawn-spots', "n$n-seed$seed", ['n' => $n, 'seed' => $seed], ['spots' => $spots, 'next' => room_rng_next($rng)]);
}

/* ---- the field at any width, exact (spec 7.4) ---- */
foreach ([720, 1080, 1440] as $w) {
    foreach (['tankity-twin-hills', 'scorch-01'] as $seed) {
        $rng = room_hash_seed($seed);
        $h = room_gen_hills($rng);
        $exact('field', "terrain-$w-$seed", ['kind' => 'terrain', 'w' => $w, 'seed' => $seed],
            ['hills' => room_hills_wire($h), 'terrain' => room_hills_terrain($h, $w), 'next' => room_rng_next($rng)]);
    }
    foreach ([3, 1234, 2026] as $seed) {
        $rng = $seed;
        $xs = room_spawn_spots($rng, 4, $w);
        $exact('field', "placement-$w-seed$seed", ['kind' => 'placement', 'w' => $w, 'seed' => $seed],
            ['xs' => $xs, 'next' => room_rng_next($rng)]);
    }
    $reach = room_field_reach($w);
    $speeds = [];
    foreach ([0.0, 37.0, 100.0] as $p) {
        array_push($speeds, room_shot_speed($p, false, 1.0, $reach), room_shot_speed($p, true, 1.0, $reach), room_shot_speed($p, false, 0.55, $reach));
    }
    $exact('field', "speed-$w", ['kind' => 'speed', 'w' => $w], ['reach' => $reach, 'speeds' => $speeds]);
    $shot = ['kind' => 'sim-shot', 'w' => $w, 'x' => $w - 100.0, 'y' => 386.0, 'angle' => 40.0, 'power' => 100.0, 'wkey' => 'shell', 'dirS' => 1];
    $exact('field', "off-the-right-$w", $shot, room_sim_shot(array_fill(0, $w, 400.0), 0.0, $shot['x'], $shot['y'], $shot['angle'], $shot['power'], 'shell', 1, $w));
    // A drone aiming across the width: the faster shell, the search and the tightened wobble together.
    $c = ['kind' => 'aim', 'w' => $w, 'seed' => 7, 'difficulty' => 'normal', 'terrain' => ['flat' => 400], 'tanks' => [
        ['kind' => 'ai', 'x' => 100, 'y' => 400.0, 'hp' => 100, 's' => 'hunter', 'ammo' => ['shell' => 99], 'dirS' => 1],
        ['kind' => 'human', 'x' => $w - 120, 'y' => 400.0, 'hp' => 100, 'dirS' => -1],
    ]];
    $room = sv_room($c, $w);
    $choice = room_ai_choose($room, $room['tanks'][0]);
    $fa = room_field_aim($w);
    $exact('field', "aim-$w", $c, ['fa' => [$fa['aim'], $fa['floor']], 'target' => $room['tanks'][0]['brk']['t'], 'wkey' => $choice['wkey'],
        'angle' => $choice['angle'], 'power' => $choice['power']]);
}

/* ---- shot speed and muzzle ---- */
foreach ([false, true] as $isFlat) {
    foreach ([0, 10, 55, 100] as $power) {
        foreach ([1.0, 1.5] as $mult) {
            $add('shot-speed', ($isFlat ? 'flat' : 'lob') . "-p$power-x$mult", ['power' => $power, 'flat' => $isFlat, 'mult' => $mult],
                room_shot_speed((float) $power, $isFlat, $mult));
        }
    }
}
foreach ([1, -1] as $dirS) {
    foreach ([0, 30, 62, 90, 150, 180] as $angle) {
        $tank = ['x' => 200.0, 'y' => 380.0, 'angle' => (float) $angle, 'dirS' => $dirS];
        $add('muzzle', "a$angle-dir$dirS", $tank, room_muzzle($tank));
    }
}

/* ---- hit boxes and the swept hit test ---- */
foreach (['human', 'ai'] as $kind) {
    $t = ['kind' => $kind, 'x' => 321.5, 'y' => 400.0];
    $box = room_unit_box($t);
    $add('hit-box', $kind, $t, $box);
    [$cx, $cy, $rx, $ry] = $box;
    foreach ([['centre', 0, 0], ['rim-in-x', 0.999, 0], ['rim-out-x', 1.001, 0], ['rim-in-y', 0, 0.999], ['rim-out-y', 0, 1.001],
        ['diagonal-in', 0.7, 0.7], ['diagonal-out', 0.75, 0.75], ['far', 3, 3]] as [$label, $fx, $fy]) {
        foreach ([1, -1] as $sgn) {
            $px = round($cx + $sgn * $fx * $rx, SV_DECIMALS);
            $py = round($cy + $sgn * $fy * $ry, SV_DECIMALS);
            $add('in-box', "$kind-$label" . ($sgn > 0 ? '' : '-neg'), $t + ['px' => $px, 'py' => $py], room_in_box($t, $px, $py));
        }
    }
}
$sweep = function (string $name, array $tanks, array $seg, int $owner, ?int $skip = null, bool $clear = false) use ($add): void {
    $room = sv_room(['terrain' => ['flat' => 400], 'tanks' => $tanks]);
    $seg = array_map('floatval', $seg);
    $c = $clear;
    $hit = room_sweep_hit($room, $seg[0], $seg[1], $seg[2], $seg[3], $skip, $owner, $c);
    $add('sweep-hit', $name, ['tanks' => $tanks, 'seg' => $seg, 'owner' => $owner, 'skip' => $skip, 'clear' => $clear],
        ['hit' => $hit, 'clear' => $c]);
};
$drone = fn(float $x, int $hp = 50) => ['kind' => 'ai', 'x' => $x, 'y' => 400.0, 'hp' => $hp];
$human = fn(float $x, int $hp = 50) => ['kind' => 'human', 'x' => $x, 'y' => 400.0, 'hp' => $hp];
$sweep('own-shell-leaves-drone', [$drone(300), $human(600)], [309.4, 368.3, 330, 360], 0);
$sweep('own-shell-comes-back', [$drone(300), $human(600)], [330, 360, 300, 370], 0, null, true);
$sweep('own-shell-inside-own-box-stays-uncleared', [$drone(300), $human(600)], [300, 372, 304, 368], 0);
$sweep('own-shell-leaves-human', [$human(300), $drone(600)], [305, 392, 340, 392], 0);
$sweep('own-shell-grazes-owner-before-clear', [$human(300), $drone(600)], [290, 392, 310, 392], 0);
$sweep('enemy-straight-through', [$human(100), $drone(300)], [250, 370, 350, 370], 0);
$sweep('enemy-fast-long-step', [$human(100), $drone(300)], [100, 372, 520, 372], 0);
$sweep('enemy-missed-by-a-hair', [$human(100), $drone(300)], [250, 355.5, 350, 355.5], 0);
$sweep('enemy-clipped-top', [$human(100), $drone(300)], [250, 356.5, 350, 356.5], 0);
$sweep('first-of-two-in-path-order', [$human(100), $drone(300), $drone(320)], [250, 370, 400, 370], 0);
$sweep('tank-index-breaks-a-tie', [$human(100), $drone(300), $drone(300)], [250, 370, 350, 370], 0);
$sweep('pierced-tank-skipped-next-is-hit', [$human(100), $drone(300), $drone(330)], [250, 370, 400, 370], 0, 1, true);
$sweep('dead-tank-ignored', [$human(100), $drone(300, 0), $drone(330)], [250, 370, 400, 370], 0);
$sweep('zero-length-step-inside-enemy', [$human(100), $drone(300)], [300, 370, 300, 370], 0);
$sweep('zero-length-step-in-open-air', [$human(100), $drone(300)], [200, 300, 200, 300], 0);
$sweep('starts-inside-enemy', [$human(100), $drone(300)], [300, 372, 330, 372], 0);
$sweep('human-target-box', [$drone(100), $human(300)], [250, 390, 350, 390], 0);
$sweep('human-target-above-hull', [$drone(100), $human(300)], [250, 372, 350, 372], 0);

/* ---- seeker steering and cluster fan ---- */
$seek = function (string $name, array $tanks, int $owner, float $sx, float $sy, float $steer, float $dt, ?string $known = null) use ($add): void {
    $room = sv_room(['terrain' => ['flat' => 400], 'tanks' => $tanks]);
    $add('seek-push', $name, ['tanks' => $tanks, 'owner' => $owner, 'sx' => $sx, 'sy' => $sy, 'steer' => $steer, 'dt' => $dt],
        room_seek_push($room['tanks'], $owner, $sx, $sy, $steer, $dt), $known);
};
$seek('nearest-of-two', [$human(100), $drone(400), $drone(250)], 0, 150, 300, 70, 1 / 60);
$seek('owner-never-targeted', [$human(150), $drone(500)], 0, 160, 380, 70, 1 / 60);
$seek('dead-rival-ignored', [$human(100), $drone(200, 0), $drone(500)], 0, 150, 300, 70, 1 / 60);
$seek('no-rival', [$human(100)], 0, 150, 300, 70, 1 / 60);
$seek('only-dead-rivals', [$human(100), $drone(200, 0)], 0, 150, 300, 70, 1 / 60);
$seek('strong-steer-short-step', [$human(100), $drone(400)], 0, 150, 200, 250, 0.01);
$seek('straight-down-at-it', [$human(100), $drone(150)], 0, 150, 100, 70, 1 / 60);
$seek('half-a-pixel-away', [$human(100), $drone(150)], 0, 150.5, 388, 70, 1 / 60);
$seek('exactly-one-pixel-away', [$human(100), $drone(150)], 0, 150, 389, 70, 1 / 60);
foreach ([[0.0, 0.0], [300.0, 0.0], [0.0, -250.0], [-140.0, 90.0]] as [$vx, $vy]) {
    foreach ([2, 4, 5] as $n) {
        $fan = $n === 5 ? 0.1 : 0.22;
        $add('split-fan', "v$vx,$vy-n$n", ['vx' => $vx, 'vy' => $vy, 'n' => $n, 'fan' => $fan], room_split_vel($vx, $vy, $n, $fan));
    }
}

/* ---- a hop warhead's leap from its burst ---- */
foreach ([[180.0, 140.0], [-220.5, 95.25], [120.0, -40.0], [0.0, 0.0], [-0.0, -310.7]] as [$vx, $vy]) {
    foreach ([0.2, 0.55, 0.9] as $keep) {
        $add('hop-vel', "v$vx,$vy-keep$keep", ['vx' => $vx, 'vy' => $vy, 'keep' => $keep], room_hop_vel($vx, $vy, $keep));
    }
}

/* ---- a scatter weapon's bomblets: the fixed fan ---- */
foreach ([[2, 0.2, 40.0], [2, 3.0, 400.0], [8, 2.4, 150.0], [8, 1.0, 222.5], [12, 2.4, 150.0], [12, 3.0, 61.0]] as [$n, $fan, $kick]) {
    $add('scatter-vel', "n$n-fan$fan-kick$kick", ['n' => $n, 'fan' => $fan, 'kick' => $kick], room_scatter_vel($n, $fan, $kick));
}

/* ---- where a cluster splits: on its fuse, or (apex) at the top of its arc ---- */
$clusterSplit = function (string $name, string $wkey, array $launch) use ($add, $weapons, $human, $drone): void {
    $c = ['terrain' => ['flat' => 430], 'tanks' => [$human(60, 100), $drone(700, 100)], 'wkey' => $wkey] + $launch;
    $room = sv_room($c);
    $events = [];
    $w = $weapons[$wkey];
    $res = room_fly_arc($room, $events, $room['tanks'][0], $w, $wkey, 0, (float) $c['x'], (float) $c['y'], (float) $c['vx'], (float) $c['vy'], 0.0, (float) $w['fuse'], null);
    $add('cluster-split', $name, $c, ['status' => $res[0], 'x' => $res[1], 'y' => $res[2], 'vx' => $res[3], 'vy' => $res[4], 'steps' => (int) round($res[7] * 60)]);
};
foreach ($weapons as $wkey => $def) {
    if (($def['effect'] ?? '') !== 'cluster') {
        continue;
    }
    $clusterSplit("$wkey-high-lob", $wkey, ['x' => 100, 'y' => 380, 'vx' => 120, 'vy' => -200]);
    $clusterSplit("$wkey-flat-and-fast", $wkey, ['x' => 100, 'y' => 380, 'vx' => 260, 'vy' => -40]);
    // Fired level or downhill it never rises: an apex cluster splits as soon as 0.1 s allows.
    $clusterSplit("$wkey-fired-downhill", $wkey, ['x' => 100, 'y' => 300, 'vx' => 150, 'vy' => 20]);
    $clusterSplit("$wkey-fired-level", $wkey, ['x' => 100, 'y' => 300, 'vx' => 150, 'vy' => 0]);
}

/* ---- the rack a drone brings to a round: aiRack of each gun it may load (the Shell is endless, -1) ---- */
foreach ([1, 3, 6, 7, 9, 12] as $round) {
    $add('rack', "round$round", ['round' => $round], room_ai_rack($round));
}

/* ---- blast damage and the crater ---- */
$blast = function (string $name, array $c, ?string $known = null) use ($add): void {
    $room = sv_room($c);
    $before = $room;
    $events = [];
    room_explode($room, $events, $room['tanks'][$c['owner']], $c['wkey'], (float) $c['x'], (float) $c['y'], $c['direct'] ?? null, $c['ov'] ?? null);
    $add('blast', $name, $c, sv_outcome($before, $room), $known);
};
$flat = ['flat' => 400];
foreach ($weapons as $wkey => $def) {
    $r = (float) $def['radius'];
    $base = ['terrain' => $flat, 'tanks' => [$human(100, 100), $drone(300, 100)], 'owner' => 0, 'wkey' => $wkey, 'y' => 380.0];
    $blast("$wkey-falloff-half-radius", array_replace($base, ['x' => 300 + $r / 2]));
    $blast("$wkey-direct-hit", array_replace($base, ['x' => 300 + $r / 3, 'direct' => 1]));
    $blast("$wkey-edge-of-reach", array_replace($base, ['x' => 300 + $r + 13]));
    $blast("$wkey-just-out-of-reach", array_replace($base, ['x' => 300 + $r + 15]));
}
$base = ['terrain' => $flat, 'owner' => 0, 'wkey' => 'shell', 'y' => 390.0];
$blast('damage-floor-is-thirty-percent', array_replace($base, ['tanks' => [$human(100), $drone(300, 100)], 'x' => 300 + 38]));
$blast('overkill-clamps-hp-at-zero', array_replace($base, ['tanks' => [$human(100), $drone(300, 10)], 'x' => 300, 'direct' => 1]));
$blast('two-victims-one-blast', array_replace($base, ['tanks' => [$human(100), $drone(300, 100), $drone(330, 100)], 'x' => 315]));
$blast('dead-tank-takes-nothing', array_replace($base, ['tanks' => [$human(100), $drone(300, 0)], 'x' => 300]));
$blast('drone-hurts-human', array_replace($base, ['tanks' => [$drone(100), $human(300, 100)], 'x' => 300, 'direct' => 1]));
$blast('human-kills-drone-pays-bonus', array_replace($base, ['tanks' => [$human(100), $drone(300, 20)], 'x' => 300, 'direct' => 1]));
$blast('drone-kills-drone', array_replace($base, ['tanks' => [$human(100), $drone(300, 100), $drone(500, 20)], 'x' => 500, 'direct' => 2, 'owner' => 1]));
$blast('drone-kills-human', array_replace($base, ['tanks' => [$drone(100), $human(300, 10)], 'x' => 300, 'direct' => 1]));
$blast('shield-absorbs-one-hit', array_replace($base, ['tanks' => [$drone(100), $human(300, 100) + ['shield' => true]], 'x' => 300, 'direct' => 1]));
$blast('shield-spares-the-neighbour-not', array_replace($base, ['tanks' => [$drone(100), $human(300, 100) + ['shield' => true], $drone(320, 100)], 'x' => 310]));
$blast('bunker-halves', array_replace($base, ['tanks' => [$drone(100), $human(300, 100) + ['bunker' => 2]], 'x' => 312]));
$blast('bunker-never-below-one', array_replace($base, ['tanks' => [$drone(100), $human(300, 100) + ['bunker' => 1]], 'x' => 330, 'ov' => ['dmg' => 2, 'radius' => 26]]));
$blast('shield-then-bunker', array_replace($base, ['tanks' => [$drone(100), $human(300, 100) + ['shield' => true, 'bunker' => 3]], 'x' => 300, 'direct' => 1]));
$blast('override-damage-and-radius', array_replace($base, ['tanks' => [$human(100), $drone(300, 100)], 'x' => 320, 'ov' => ['dmg' => 25, 'radius' => 40]]));
$blast('last-stand-detonates', array_replace($base, ['tanks' => [$drone(100, 100), $human(300, 10) + ['laststand' => true], $drone(330, 100)], 'x' => 300, 'direct' => 1, 'owner' => 0]));
$blast('last-stand-spent-flag-stays-spent', array_replace($base, ['tanks' => [$drone(100, 100), $human(300, 10), $drone(330, 100)], 'x' => 300, 'direct' => 1, 'owner' => 0]));
foreach ($weapons as $wkey => $def) {
    if (($def['effect'] ?? '') === 'emp') {
        $blast("$wkey-drains-fuel", ['terrain' => $flat, 'owner' => 0, 'wkey' => $wkey, 'y' => 390.0, 'x' => 310,
            'tanks' => [$human(100), $drone(300, 100) + ['fuel' => 70]]]);
    }
}
// A harmless burst (dmg 0) carves and touches nobody: the shield stays, nobody is credited or blamed.
$blast('harmless-next-to-a-shielded-human', array_replace($base, ['tanks' => [$drone(100), $human(300, 100) + ['shield' => true]], 'x' => 305, 'direct' => 1,
    'ov' => ['dmg' => 0, 'radius' => 45]]));
$blast('harmless-next-to-a-drone', array_replace($base, ['tanks' => [$human(100), $drone(300, 100), $drone(320, 100)], 'x' => 310, 'owner' => 0,
    'ov' => ['dmg' => 0, 'radius' => 45]]));
$blast('harmless-drone-on-a-drone', array_replace($base, ['tanks' => [$human(100), $drone(300, 100), $drone(320, 100)], 'x' => 320, 'owner' => 1, 'direct' => 2,
    'ov' => ['dmg' => 0, 'radius' => 30]]));
// A harmless crater under a standing unit still credits its fall to the shooter, as any crater does.
$blast('harmless-crater-under-a-drone-credits-its-fall', array_replace($base, ['tanks' => [$human(100), $drone(300, 100)], 'x' => 300, 'y' => 400,
    'owner' => 0, 'ov' => ['dmg' => 0, 'radius' => 45]]));
$blast('crater-clipped-at-left-edge', array_replace($base, ['tanks' => [$human(100), $drone(300)], 'x' => 4, 'y' => 400, 'wkey' => 'nuke']));
$blast('crater-clipped-at-right-edge', array_replace($base, ['tanks' => [$human(100), $drone(300)], 'x' => 716, 'y' => 400, 'wkey' => 'nuke']));
$blast('crater-floor-clamps-at-456', ['terrain' => ['flat' => 440], 'tanks' => [$human(100), $drone(300)], 'owner' => 0, 'wkey' => 'nuke', 'x' => 200, 'y' => 440]);
$blast('blast-above-ground-leaves-it', ['terrain' => $flat, 'tanks' => [$human(100), $drone(300)], 'owner' => 0, 'wkey' => 'shell', 'x' => 200, 'y' => 300]);
$blast('crater-in-a-hill', ['terrain' => ['hills' => [330, 40, 200]], 'tanks' => [$human(100), $drone(300)], 'owner' => 0, 'wkey' => 'mortar', 'x' => 150, 'y' => 340]);
$blast('crater-widens-an-old-pit', ['terrain' => ['flat' => 400, 'set' => [[190, 210, 430]]], 'tanks' => [$human(100), $drone(300)], 'owner' => 0, 'wkey' => 'mortar', 'x' => 200, 'y' => 405]);

/* ---- landing prediction (the aim guide and the AI's search) ---- */
$sim = function (string $name, array $c) use ($add): void {
    $terrain = sv_terrain($c['terrain']);
    $land = room_sim_shot($terrain, (float) ($c['wind'] ?? 0), (float) $c['x'], (float) $c['y'], (float) $c['angle'], (float) $c['power'],
        $c['wkey'], $c['dirS'], SV_WIDTH);
    $add('sim-shot', $name, $c, $land);
};
foreach (['shell', 'mortar', 'rail', 'buck', 'roller'] as $wkey) {
    if (!isset($weapons[$wkey])) {
        continue;
    }
    $sim("$wkey-right-lob", ['terrain' => $flat, 'x' => 100, 'y' => 386, 'angle' => 55, 'power' => 60, 'wkey' => $wkey, 'dirS' => 1]);
    $sim("$wkey-left-lob", ['terrain' => $flat, 'x' => 600, 'y' => 386, 'angle' => 55, 'power' => 60, 'wkey' => $wkey, 'dirS' => -1]);
    $sim("$wkey-tailwind", ['terrain' => $flat, 'wind' => 8, 'x' => 100, 'y' => 386, 'angle' => 45, 'power' => 70, 'wkey' => $wkey, 'dirS' => 1]);
    $sim("$wkey-headwind", ['terrain' => $flat, 'wind' => -8, 'x' => 100, 'y' => 386, 'angle' => 45, 'power' => 70, 'wkey' => $wkey, 'dirS' => 1]);
    $sim("$wkey-over-hills", ['terrain' => ['hills' => [320, 50, 240]], 'wind' => 3, 'x' => 120, 'y' => 300, 'angle' => 40, 'power' => 55, 'wkey' => $wkey, 'dirS' => 1]);
    $sim("$wkey-flies-off-the-right", ['terrain' => $flat, 'x' => 600, 'y' => 386, 'angle' => 40, 'power' => 100, 'wkey' => $wkey, 'dirS' => 1]);
    $sim("$wkey-flies-off-the-left", ['terrain' => $flat, 'x' => 100, 'y' => 386, 'angle' => 40, 'power' => 100, 'wkey' => $wkey, 'dirS' => -1]);
    $sim("$wkey-straight-up", ['terrain' => $flat, 'x' => 300, 'y' => 386, 'angle' => 90, 'power' => 40, 'wkey' => $wkey, 'dirS' => 1]);
    $sim("$wkey-hugs-the-ground", ['terrain' => $flat, 'x' => 100, 'y' => 399.5, 'angle' => 0, 'power' => 20, 'wkey' => $wkey, 'dirS' => 1]);
    $sim("$wkey-into-the-hillside", ['terrain' => ['slope' => [420, 260]], 'x' => 100, 'y' => 390, 'angle' => 5, 'power' => 50, 'wkey' => $wkey, 'dirS' => 1]);
}

/* ---- a roller's roll: where it ends, from the moment it touches down ---- */
if (isset($weapons['roller'])) {
    $roll = function (string $name, array $c) use ($add, $weapons): void {
        [$x, $y] = room_roll_out(sv_terrain($c['terrain']), (float) $c['x'], (float) $c['vx'], (float) $c['vy'], $weapons['roller']);
        $add('roll-out', $name, $c + ['wkey' => 'roller'], ['x' => $x, 'y' => $y]);
    };
    $valley = ['hills' => [330, 40, 240]];
    $roll('down-into-the-valley', ['terrain' => $valley, 'x' => 200, 'vx' => 60, 'vy' => 20]);
    $roll('down-into-the-valley-from-the-right', ['terrain' => $valley, 'x' => 400, 'vx' => -60, 'vy' => 20]);
    $roll('coasts-on-the-flat-then-stops', ['terrain' => $flat, 'x' => 100, 'vx' => 120, 'vy' => 30]);
    $roll('barely-touching-stays-put', ['terrain' => $flat, 'x' => 100, 'vx' => 10, 'vy' => 5]);
    $roll('up-a-gentle-rise-loses-it', ['terrain' => ['slope' => [430, 380]], 'x' => 100, 'vx' => 110, 'vy' => 40]);
    $roll('up-a-steep-rise-turns-back', ['terrain' => ['slope' => [460, 240]], 'x' => 300, 'vx' => 120, 'vy' => 30]);
    $roll('off-the-right-edge', ['terrain' => ['slope' => [300, 420]], 'x' => 560, 'vx' => 80, 'vy' => 30]);
    $roll('off-the-left-edge', ['terrain' => ['slope' => [420, 300]], 'x' => 160, 'vx' => -80, 'vy' => 30]);
    $roll('lands-on-the-edge', ['terrain' => $flat, 'x' => 730, 'vx' => 80, 'vy' => 30]);
    $roll('rolls-out-its-time', ['terrain' => ['slope' => [200, 460]], 'x' => 20, 'vx' => 30, 'vy' => 0]);
    $roll('over-a-pit', ['terrain' => ['flat' => 400, 'set' => [[300, 340, 440]]], 'x' => 250, 'vx' => 110, 'vy' => 30]);
}

/* ---- whole volleys: fire, fly, burst, split, damage ---- */
$volley = function (string $name, array $c, ?string $known = null) use ($add): void {
    $room = sv_room($c);
    $before = $room;
    $seat = $c['shooter'];
    $room['tanks'][$seat]['angle'] = (float) $c['angle'];
    $room['tanks'][$seat]['power'] = (float) $c['power'];
    $events = [['t' => 'fire', 'seat' => $seat]];
    room_fire_shot($room, $events, $seat, $c['wkey']);
    $add('volley', $name, $c, sv_outcome($before, $room), $known);
};
$setups = [
    'flat-right' => ['terrain' => $flat, 'wind' => 0, 'shooter' => 0, 'tanks' => [$human(100, 100) + ['dirS' => 1], $drone(380, 100)], 'aim' => [0, 380]],
    'hills-headwind-left' => ['terrain' => ['hills' => [330, 30, 210]], 'wind' => -5, 'shooter' => 1,
        'tanks' => [$human(120, 100), $drone(560, 100) + ['dirS' => -1]], 'aim' => [1, 120]],
    'flat-two-rivals-tailwind' => ['terrain' => $flat, 'wind' => 6, 'shooter' => 0,
        'tanks' => [$human(80, 100), $drone(300, 100), $drone(350, 100)], 'aim' => [0, 325]],
];
foreach ($setups as $label => $s) {
    foreach ($weapons as $wkey => $def) {
        $c = ['terrain' => $s['terrain'], 'wind' => $s['wind'], 'shooter' => $s['shooter'], 'tanks' => $s['tanks'], 'wkey' => $wkey];
        $room = sv_room($c);
        [$c['angle'], $c['power']] = sv_aim_at($room, $s['aim'][0], $wkey, (float) $s['aim'][1]);
        $volley("$wkey-$label", $c);
    }
}
$shell = ['terrain' => $flat, 'wkey' => 'shell'];
$volley('point-blank-at-the-neighbour', array_replace($shell, ['shooter' => 0, 'tanks' => [$human(100, 100), $drone(130, 100)], 'angle' => 5, 'power' => 30]));
$volley('straight-up-comes-back-on-the-gunner', array_replace($shell, ['shooter' => 0, 'tanks' => [$human(300, 100), $drone(600, 100)], 'angle' => 90, 'power' => 40]));
$volley('wind-drives-it-back-onto-the-gunner', array_replace($shell, ['wind' => -12, 'shooter' => 0, 'tanks' => [$human(300, 100), $drone(600, 100)], 'angle' => 80, 'power' => 45]));
// A Shell held where a beam dipped leaves at its own minimum (10).
$volley('shell-held-below-its-minimum', array_replace($shell, ['shooter' => 0, 'tanks' => [$human(100, 100) + ['dirS' => 1], $drone(400, 100)], 'angle' => -20, 'power' => 60]));
$volley('lob-off-the-board', array_replace($shell, ['shooter' => 0, 'tanks' => [$human(600, 100), $drone(100, 100)], 'angle' => 40, 'power' => 100]));
// Splits just short of a ledge: the first bomblet is inside it within 0.04 s and bursts there at once, on both sides.
$volley('cluster-splits-at-a-ledge', ['terrain' => ['flat' => 400, 'set' => [[258, 330, 392]]], 'wkey' => 'cluster', 'shooter' => 0,
    'tanks' => [$human(100, 100) + ['dirS' => 1], $drone(300, 100) + ['y' => 392.0]], 'angle' => 10, 'power' => 47]);
// An apex cluster lobbed over a ridge: its warheads fan down from the top of the arc.
foreach ($weapons as $wkey => $def) {
    if (($def['effect'] ?? '') === 'cluster' && !empty($def['apex'])) {
        $volley("$wkey-over-a-ridge", ['terrain' => ['flat' => 400, 'set' => [[260, 300, 300]]], 'wkey' => $wkey, 'shooter' => 0,
            'tanks' => [$human(100, 100) + ['dirS' => 1], $drone(440, 100), $drone(480, 100)], 'angle' => 62, 'power' => 62]);
    }
}
// Buried under 70 px of dirt: the shell starts in the ground and, after its 0.1 s grace, bursts in the dirt above the gunner.
$volley('buried-fires-shell', ['terrain' => ['flat' => 400, 'set' => [[270, 330, 330]]], 'wkey' => 'shell', 'shooter' => 0, 'angle' => 85, 'power' => 20,
    'tanks' => [$human(300, 100) + ['dirS' => 1], $drone(600, 100)]]);
$volley('fired-into-the-hillside', ['terrain' => ['slope' => [420, 260]], 'wkey' => 'shell', 'shooter' => 0, 'tanks' => [$human(100, 100), $drone(500, 100)], 'angle' => 5, 'power' => 50]);
$volley('shielded-human-eats-a-drone-shell', array_replace($shell, ['shooter' => 1, 'tanks' => [$human(380, 100) + ['shield' => true], $drone(100, 100) + ['dirS' => 1]],
    'angle' => sv_aim_at(sv_room(array_replace($shell, ['tanks' => [$human(380, 100), $drone(100, 100) + ['dirS' => 1]]])), 1, 'shell', 380.0)[0],
    'power' => sv_aim_at(sv_room(array_replace($shell, ['tanks' => [$human(380, 100), $drone(100, 100) + ['dirS' => 1]]])), 1, 'shell', 380.0)[1]]));

/* Hop weapons: each burst throws the next warhead on, until the last has burst or one leaves the field. */
foreach ($weapons as $wkey => $def) {
    if (($def['effect'] ?? '') !== 'hop') {
        continue;
    }
    $down = ['slope' => [300, 420]];
    $onSlope = sv_terrain($down);
    $c = ['terrain' => $down, 'wkey' => $wkey, 'shooter' => 0,
        'tanks' => [$human(100, 100) + ['y' => $onSlope[100], 'dirS' => 1], $drone(640, 100) + ['y' => $onSlope[640]]]];
    [$c['angle'], $c['power']] = sv_aim_at(sv_room($c), 0, $wkey, 250.0);
    $volley("$wkey-down-a-slope", $c);
    // The first warhead strikes the drone's body; the next leaps on past it (never a second direct hit on it) to the drone beyond.
    $volley("$wkey-direct-hit-hops-on", ['terrain' => $flat, 'wkey' => $wkey, 'shooter' => 0, 'angle' => 36, 'power' => 49,
        'tanks' => [$human(100, 100) + ['dirS' => 1], $drone(380, 200), $drone(470, 200)]]);
    $volley("$wkey-second-hop-leaves-the-field", ['terrain' => $flat, 'wkey' => $wkey, 'shooter' => 0, 'angle' => 35, 'power' => 30,
        'tanks' => [$human(560, 100) + ['dirS' => 1], $drone(100, 100)]]);
}

/* Scatter weapons: the burst throws its bomblets up; each bursts where it lands, in order. */
foreach ($weapons as $wkey => $def) {
    if (($def['effect'] ?? '') !== 'scatter') {
        continue;
    }
    $c = ['terrain' => $flat, 'wkey' => $wkey, 'shooter' => 0,
        'tanks' => [$human(100, 100) + ['dirS' => 1], $drone(330, 100), $drone(250, 100)]];
    [$c['angle'], $c['power']] = sv_aim_at(sv_room($c), 0, $wkey, 300.0);
    $volley("$wkey-on-flat", $c);
    // Bursting at the bottom of a narrow pit, the bomblets thrown sideways strike its walls at once.
    $pit = ['flat' => 400, 'set' => [[290, 310, 440]]];
    $c = ['terrain' => $pit, 'wkey' => $wkey, 'shooter' => 0, 'tanks' => [$human(100, 100) + ['dirS' => 1], $drone(420, 100)]];
    [$c['angle'], $c['power']] = sv_aim_at(sv_room($c), 0, $wkey, 300.0);
    $volley("$wkey-in-a-pit", $c);
    // The burst strikes the drone's body; no bomblet takes a direct hit on it.
    $volley("$wkey-direct-hit", ['terrain' => $flat, 'wkey' => $wkey, 'shooter' => 0, 'angle' => 36, 'power' => 49,
        'tanks' => [$human(100, 100) + ['dirS' => 1], $drone(380, 200), $drone(470, 200)]]);
}

/* Beams: no flight. The ray runs from the muzzle along the barrel, hits each
 * unit on it once for flat damage and cuts its channel. 'beam' is the line
 * itself and what it did; the volley cases add the settle that follows. */
$beamCase = function (string $name, array $c) use ($add, $weapons): void {
    $room = sv_room($c);
    $before = $room;
    $seat = $c['shooter'];
    $room['tanks'][$seat]['angle'] = (float) $c['angle'];
    $room['tanks'][$seat]['power'] = (float) $c['power'];
    $events = [];
    room_fire_beam($room, $events, $seat, $weapons[$c['wkey']], $c['wkey']);
    $e = $events[0];
    $add('beam', $name, $c, ['line' => [$e['x0'], $e['y0'], $e['x1'], $e['y1']]] + sv_outcome($before, $room));
};
/** A drone hovering where a beam fired by $spec crosses its body $s px out. */
$onBeam = function (array $spec, float $s, int $hp = 100) use ($drone): array {
    $t = ['angle' => (float) $spec['angle'], 'dirS' => $spec['dirS'], 'x' => (float) $spec['x'], 'y' => (float) $spec['y']];
    [$mx, $my] = room_muzzle($t);
    $a = deg2rad($t['angle']);
    return array_replace($drone($mx + det_cos($a) * $t['dirS'] * $s, $hp), ['y' => $my - det_sin($a) * $s + 30]);
};
foreach ($weapons as $wkey => $def) {
    if (($def['effect'] ?? '') !== 'beam') {
        continue;
    }
    $gun = $human(100, 100) + ['dirS' => 1, 'angle' => 40];
    $two = ['terrain' => $flat, 'wkey' => $wkey, 'shooter' => 0, 'angle' => 40, 'power' => 100,
        'tanks' => [$gun, $onBeam($gun, 140.0), $onBeam($gun, 260.0, 30)]];
    $beamCase("$wkey-through-two-drones", $two);
    $volley("$wkey-through-two-drones", $two);
    $beamCase("$wkey-short-power-stops-short", array_replace($two, ['power' => 30]));
    $beamCase("$wkey-at-power-61", array_replace($two, ['power' => 61]));
    // Through a hill a drone stands on: the channel takes its ground, and its fall is the gunner's.
    $hill = ['terrain' => ['flat' => 400, 'set' => [[200, 280, 330]]], 'wkey' => $wkey, 'shooter' => 0, 'angle' => 14, 'power' => 100,
        'tanks' => [$human(100, 100) + ['dirS' => 1], array_replace($drone(250, 100), ['y' => 330.0]), $drone(600, 100)]];
    $beamCase("$wkey-through-a-hill", $hill);
    $volley("$wkey-through-a-hill", $hill);
    $shielded = $human(100, 100) + ['dirS' => -1, 'shield' => true];
    $d = $drone(360, 100) + ['dirS' => -1, 'angle' => 18];
    $at = $onBeam($d + ['dirS' => -1], 160.0);
    $beamCase("$wkey-into-a-shield", ['terrain' => $flat, 'wkey' => $wkey, 'shooter' => 1, 'angle' => 18, 'power' => 100,
        'tanks' => [array_replace($shielded, ['x' => $at['x'], 'y' => $at['y'] - 20]), $d]]);
    // Dipped below level (aimMin): level ground, hulls on both sides, the far side's dip past 180.
    $beamCase("$wkey-level-at-a-hull", ['terrain' => $flat, 'wkey' => $wkey, 'shooter' => 0, 'angle' => 0, 'power' => 100,
        'tanks' => [$human(100, 100) + ['dirS' => 1], $human(380, 100), $drone(600, 100)]]);
    $volley("$wkey-dips-into-a-valley", ['terrain' => ['hills' => [360, 40, 300]], 'wkey' => $wkey, 'shooter' => 0, 'angle' => (int) $def['aimMin'], 'power' => 90,
        'tanks' => [array_replace($human(75, 100), ['dirS' => 1, 'y' => sv_terrain(['hills' => [360, 40, 300]])[75]]), array_replace($drone(260, 100), ['y' => sv_terrain(['hills' => [360, 40, 300]])[260]])]]);
    $volley("$wkey-dips-on-the-far-side", ['terrain' => $flat, 'wkey' => $wkey, 'shooter' => 0, 'angle' => 185, 'power' => 100,
        'tanks' => [$human(400, 100) + ['dirS' => 1], $human(150, 100), $drone(600, 100)]]);
    $volley("$wkey-held-past-its-limit-fires-at-it", ['terrain' => $flat, 'wkey' => $wkey, 'shooter' => 0, 'angle' => -45, 'power' => 100,
        'tanks' => [$human(100, 100) + ['dirS' => 1], $drone(400, 100)]]);
    $beamCase("$wkey-stops-at-the-edge", ['terrain' => $flat, 'wkey' => $wkey, 'shooter' => 0, 'angle' => 12, 'power' => 100,
        'tanks' => [$human(600, 100) + ['dirS' => 1], $drone(300, 100)]]);
    $beamCase("$wkey-drone-fired-left-at-a-drone", ['terrain' => ['hills' => [330, 40, 200]], 'wind' => 4, 'wkey' => $wkey, 'shooter' => 1, 'angle' => 25, 'power' => 80,
        'tanks' => [$human(100, 100), array_replace($drone(500, 60), ['dirS' => -1, 'y' => 340.0]), $onBeam(array_replace($drone(500), ['dirS' => -1, 'angle' => 25, 'y' => 340.0]), 200.0, 10)]]);
}
/* Plasma: a ring around its gunner's body, falloff, the gunner spared, no crater. */
$plasmaCase = function (string $name, array $c) use ($add, $weapons): void {
    $room = sv_room($c);
    $before = $room;
    $seat = $c['shooter'];
    $room['tanks'][$seat]['power'] = (float) $c['power'];
    $events = [];
    room_fire_plasma($room, $events, $seat, $weapons[$c['wkey']], $c['wkey']);
    $e = $events[0];
    $add('plasma', $name, $c, ['ring' => [$e['x'], $e['y'], $e['r']]] + sv_outcome($before, $room));
};
foreach ($weapons as $wkey => $def) {
    if (($def['effect'] ?? '') !== 'plasma') {
        continue;
    }
    $ring = ['terrain' => $flat, 'wkey' => $wkey, 'shooter' => 0, 'power' => 100, 'angle' => 45,
        'tanks' => [$human(300, 100) + ['dirS' => 1], $drone(330, 100), $drone(381.5, 100), $drone(430, 100), $drone(220, 100)]];
    $plasmaCase("$wkey-spares-firer", $ring);
    $volley("$wkey-spares-firer", $ring);
    $plasmaCase("$wkey-power-30-small-ring", array_replace($ring, ['power' => 30]));
    $plasmaCase("$wkey-min-radius-20", array_replace($ring, ['power' => 10]));
    $plasmaCase("$wkey-into-a-bunker", ['terrain' => $flat, 'wkey' => $wkey, 'shooter' => 1, 'power' => 90,
        'tanks' => [$human(280, 100) + ['bunker' => 2], $drone(330, 100) + ['dirS' => -1]]]);
    $plasmaCase("$wkey-no-crater", ['terrain' => ['hills' => [380, 30, 150]], 'wkey' => $wkey, 'shooter' => 1, 'power' => 77,
        'tanks' => [$human(260, 40) + ['shield' => true], array_replace($drone(300, 100), ['y' => 360.0]), $drone(345, 8)]]);
}
/* Tracers: they fly and leave a mark, and nothing else: no blast, no crater, no hp. */
foreach ($weapons as $wkey => $def) {
    if (($def['effect'] ?? '') !== 'tracer') {
        continue;
    }
    $volley("$wkey-volley", ['terrain' => ['hills' => [360, 30, 220]], 'wind' => 3, 'wkey' => $wkey, 'shooter' => 0, 'angle' => 52, 'power' => 63,
        'tanks' => [array_replace($human(120, 100), ['dirS' => 1, 'y' => 360.0]), $drone(420, 100)]]);
    $volley("$wkey-strikes-a-drone", ['terrain' => $flat, 'wkey' => $wkey, 'shooter' => 0, 'angle' => 10, 'power' => 40,
        'tanks' => [$human(100, 100) + ['dirS' => 1], array_replace($drone(160, 100), ['y' => 420.0])]]);
}

/* The earth guns: dirt, a pour, digs, riot charges and bombs, a disrupter.
 * Aimed with the server's own predictor at a spot, so each lands where it means to. */
$earthVolley = function (string $name, array $c, float $at, int $lo = 15, int $hi = 85) use ($volley): void {
    [$c['angle'], $c['power']] = sv_aim_at(sv_room($c), $c['shooter'], $c['wkey'], $at, $lo, $hi);
    $volley($name, $c);
};
if (isset($weapons['dirtball'], $weapons['dirtcharge'], $weapons['liquiddirt'], $weapons['digger'], $weapons['sandhog'], $weapons['riotcharge'], $weapons['riotbomb'], $weapons['disrupter'])) {
    $earthVolley('dirtball-buries-human', ['terrain' => $flat, 'wkey' => 'dirtball', 'shooter' => 1,
        'tanks' => [$human(400, 100), $drone(120, 100) + ['dirS' => 1]]], 405.0);
    $earthVolley('dirtcharge-hurts-then-buries', ['terrain' => $flat, 'wkey' => 'dirtcharge', 'shooter' => 1,
        'tanks' => [$human(400, 100), $drone(120, 100) + ['dirS' => 1]]], 410.0);
    $vale = ['vee' => [360, 150, 330, 420]];
    $onVale = sv_terrain($vale);
    $earthVolley('liquiddirt-fills-valley-buries-two', ['terrain' => $vale, 'wkey' => 'liquiddirt', 'shooter' => 2,
        'tanks' => [array_replace($human(330, 100), ['y' => $onVale[330]]), array_replace($human(390, 100), ['y' => $onVale[390]]),
            array_replace($drone(100, 100), ['y' => $onVale[100], 'dirS' => 1])]], 360.0);
    // A flat shot comes down at a shallow slant, so the burrow runs on under the tank (deep under its hull, never touching it).
    $earthVolley('digger-under-tank-drops-it', ['terrain' => $flat, 'wkey' => 'digger', 'shooter' => 1,
        'tanks' => [$human(300, 100), $drone(60, 100) + ['dirS' => 1]]], 218.0, 15, 25);
    $earthVolley('sandhog-three-warheads', ['terrain' => $flat, 'wkey' => 'sandhog', 'shooter' => 0,
        'tanks' => [$human(100, 100) + ['dirS' => 1], $drone(420, 100), $drone(600, 100)]], 330.0);
    $pit = ['flat' => 400, 'set' => [[380, 420, 440]]];
    $earthVolley('sandhog-stops-at-tank', ['terrain' => $pit, 'wkey' => 'sandhog', 'shooter' => 1,
        'tanks' => [array_replace($human(400, 100), ['y' => 440.0]), $drone(150, 100) + ['dirS' => 1]]], 352.0);
    $volley('riotcharge-digs-out-buried-tank', ['terrain' => ['flat' => 400, 'set' => [[260, 340, 350]]], 'wkey' => 'riotcharge', 'shooter' => 0, 'angle' => 90, 'power' => 50,
        'tanks' => [$human(300, 100) + ['dirS' => 1], $drone(600, 100)]]);
    $volley('riotblast-cuts-a-lane-beside-its-gunner', ['terrain' => ['flat' => 400, 'set' => [[320, 420, 320]]], 'wkey' => 'riotblast', 'shooter' => 0, 'angle' => 10, 'power' => 50,
        'tanks' => [$human(300, 100) + ['dirS' => 1], $drone(600, 100)]]);
    $earthVolley('riotbomb-harmless-crater-drops-tank', ['terrain' => $flat, 'wkey' => 'riotbomb', 'shooter' => 1,
        'tanks' => [$human(400, 100), $drone(120, 100) + ['dirS' => 1]]], 400.0);
    // A sharp peak, 120 px over 20 px either side: steeper than the slope everywhere.
    $peak = ['vee' => [300, 20, 420, 300]];
    $earthVolley('disrupter-slumps-ridge-tank-falls', ['terrain' => $peak, 'wkey' => 'disrupter', 'shooter' => 1,
        'tanks' => [array_replace($human(300, 100), ['y' => 300.0]), array_replace($drone(100, 100), ['y' => 420.0, 'dirS' => 1])]], 300.0);
    $volley('disrupter-self-fall-credits-nobody', ['terrain' => $peak, 'wkey' => 'disrupter', 'shooter' => 0, 'angle' => 88, 'power' => 22,
        'tanks' => [array_replace($human(300, 100), ['y' => 300.0, 'dirS' => 1]), array_replace($drone(600, 100), ['y' => 420.0])]]);
}

/* Falls a volley digs: Buckshot pellets digging one pit in several bursts,
 * and craters in fractional ground, with and without parachutes. The browser
 * replays these as a solo match plays them (falls animated every frame, one
 * settle when the last shell is down). */
foreach ([['flat' => 400], ['flat' => 420.54], ['flat' => 400.37]] as $ground) {
    $gy = $ground['flat'];
    $g = str_replace('.', '_', (string) $gy);
    foreach ([[false, 0], [true, 1]] as [$withChute, $n]) {
        $chuteTag = $withChute ? '-with-a-parachute' : '';
        $volley("buck-digs-a-drone-in-bursts-ground-$g$chuteTag", ['terrain' => $ground, 'wkey' => 'buck', 'shooter' => 0, 'angle' => 45, 'power' => 46,
            'tanks' => [['kind' => 'human', 'x' => 100.0, 'y' => $gy, 'hp' => 100, 'dirS' => 1], ['kind' => 'ai', 'x' => 400.0, 'y' => $gy, 'hp' => 100, 'dirS' => -1, 'chutes' => $n]]]);
        $volley("shell-digs-short-of-a-pixel-ground-$g$chuteTag", ['terrain' => $ground, 'wkey' => 'shell', 'shooter' => 0, 'angle' => 30, 'power' => 51,
            'tanks' => [['kind' => 'human', 'x' => 100.0, 'y' => $gy, 'hp' => 100, 'dirS' => 1], ['kind' => 'ai', 'x' => 400.0, 'y' => $gy, 'hp' => 100, 'dirS' => -1, 'chutes' => $n]]]);
    }
}
$volley('mortar-on-its-own-gunner', ['terrain' => ['flat' => 400.37], 'wkey' => 'mortar', 'shooter' => 0, 'angle' => 90, 'power' => 15,
    'tanks' => [['kind' => 'human', 'x' => 300.0, 'y' => 400.37, 'hp' => 200, 'dirS' => 1, 'chutes' => 1], ['kind' => 'ai', 'x' => 600.0, 'y' => 400.37, 'hp' => 100, 'dirS' => -1]]]);

/* A roller: rolls down into a valley, into a unit, off the edge, stops on a rise. */
if (isset($weapons['roller'])) {
    $tankAt = function (array $terrain, string $kind, int $x, int $dirS, int $hp = 100) {
        $t = sv_terrain($terrain);
        return ['kind' => $kind, 'x' => (float) $x, 'y' => $t[$x], 'hp' => $hp, 'dirS' => $dirS];
    };
    $rollerVolley = function (string $name, array $terrain, array $tanks, int $angle, int $power) use ($volley): void {
        $volley($name, ['terrain' => $terrain, 'wkey' => 'roller', 'shooter' => 0, 'tanks' => $tanks, 'angle' => $angle, 'power' => $power]);
    };
    $valley = ['hills' => [330, 40, 240]];
    $rollerVolley('roller-rolls-down-into-the-valley', $valley, [$tankAt($valley, 'human', 60, 1), $tankAt($valley, 'ai', 640, -1)], 45, 40);
    $rollerVolley('roller-rolls-into-a-drone', $valley, [$tankAt($valley, 'human', 60, 1), $tankAt($valley, 'ai', 300, -1)], 45, 40);
    $rollerVolley('roller-rolls-into-a-human', $valley, [$tankAt($valley, 'ai', 60, 1), $tankAt($valley, 'human', 300, -1)], 45, 40);
    $rollerVolley('roller-rolls-back-onto-its-gunner', $valley, [$tankAt($valley, 'human', 60, 1), $tankAt($valley, 'ai', 640, -1)], 50, 30);
    $down = ['slope' => [300, 420]];
    $rollerVolley('roller-rolls-off-the-right-edge', $down, [$tankAt($down, 'human', 560, 1), $tankAt($down, 'ai', 100, -1)], 35, 20);
    $rollerVolley('roller-lobbed-off-the-board', $down, [$tankAt($down, 'human', 560, 1), $tankAt($down, 'ai', 100, -1)], 30, 30);
    $up = ['slope' => [420, 300]];
    $rollerVolley('roller-rolls-off-the-left-edge', $up, [$tankAt($up, 'human', 160, -1), $tankAt($up, 'ai', 600, 1)], 35, 20);
    $rise = ['slope' => [430, 380]];
    $rollerVolley('roller-stops-on-a-gentle-rise', $rise, [$tankAt($rise, 'human', 100, 1), $tankAt($rise, 'ai', 640, -1)], 40, 40);
    $rollerVolley('roller-rolls-past-two-rivals-hits-the-first', $valley, [$tankAt($valley, 'human', 60, 1), $tankAt($valley, 'ai', 290, -1), $tankAt($valley, 'ai', 310, -1)], 45, 40);
    $rollerVolley('roller-into-the-hillside', ['slope' => [420, 260]], [$tankAt(['slope' => [420, 260]], 'human', 100, 1), $tankAt(['slope' => [420, 260]], 'ai', 500, -1)], 5, 50);
}

/* ---- the drone's aim ---- */
$aim = function (string $name, array $c, ?string $known = null) use ($add): void {
    $room = sv_room($c);
    $choice = room_ai_choose($room, $room['tanks'][$c['shooter']]);
    $add('ai-aim', $name, $c, ['wkey' => $choice['wkey'], 'angle' => $choice['angle'], 'power' => $choice['power'], 'dx' => $choice['dx']], $known);
};
$rack = ['mortar' => 2, 'rail' => 2, 'buck' => 2, 'nuke' => 1];
$hills = ['hills' => [330, 40, 260]];
foreach ([1, 2, 3, 7, 11, 42, 777, 2026] as $seed) {
    $aim("one-rival-seed$seed", ['terrain' => $hills, 'wind' => 3, 'round' => 1 + $seed % 5, 'seed' => $seed, 'shooter' => 1,
        'tanks' => [$human(120, 100), $drone(520, 60) + ['dirS' => -1, 'angle' => 60, 'ammo' => $seed % 2 ? [] : $rack]]]);
}
foreach ([5, 19, 301, 4096] as $seed) {
    $aim("three-rivals-seed$seed", ['terrain' => $hills, 'wind' => -4, 'round' => 3, 'seed' => $seed, 'shooter' => 2,
        'tanks' => [$human(100, 100), $drone(300, 60), $drone(560, 60) + ['dirS' => -1, 'ammo' => $rack], $drone(660, 60)]]);
}
$aim('jammed-human-target', ['terrain' => $flat, 'wind' => 0, 'round' => 2, 'seed' => 8, 'shooter' => 1,
    'tanks' => [$human(150, 100) + ['jammer' => 2], $drone(550, 60) + ['dirS' => -1]]]);
$aim('late-round-steady-hands', ['terrain' => $flat, 'wind' => 1, 'round' => 12, 'seed' => 64, 'shooter' => 1,
    'tanks' => [$human(150, 100), $drone(550, 60) + ['dirS' => -1, 'ammo' => $rack]]]);
foreach ([4, 9, 21] as $seed) {
    $aim("roller-in-the-rack-seed$seed", ['terrain' => ['hills' => [330, 40, 240]], 'wind' => 0, 'round' => 5, 'seed' => $seed, 'shooter' => 1,
        'tanks' => [$human(300, 100), $drone(60, 60) + ['dirS' => 1, 'ammo' => ['roller' => 2]]]]);
}
$aim('no-rivals-left', ['terrain' => $flat, 'wind' => 0, 'round' => 1, 'seed' => 3, 'shooter' => 0,
    'tanks' => [$drone(300, 60) + ['dirS' => -1], $drone(500, 0)]],
    'With nobody left to shoot at the server falls back to a fixed 62/55 Shell and the browser aims at itself. Unreachable: a round with no rival has already ended on both sides.');
// A mixed rack: the drone fires the most harmful gun on its best arc, or (glory) of any arc.
$mixed = ['buck' => 2, 'mortar' => 2, 'rail' => 2, 'heavy' => 2, 'needle' => 1, 'roller' => 2];
foreach ($weapons as $k => $def) {
    if (!empty($def['ai']) && !isset($mixed[$k]) && $k !== 'shell') {
        $mixed[$k] = 1;
    }
}
foreach (['hunter', 'glory', 'lobber'] as $s) {
    foreach ([[3, 330], [17, 420], [40, 250]] as [$seed, $tx]) {
        $aim("mixed-rack-$s-seed$seed", ['terrain' => $flat, 'wind' => 2, 'round' => 9, 'seed' => $seed, 'shooter' => 1,
            'tanks' => [$human($tx, 100), $drone(120, 60) + ['dirS' => 1, 's' => $s, 'ammo' => $mixed]]]);
    }
}
// The target 50 px off: every big blast would reach the drone itself, so it fires something smaller.
$aim('mixed-rack-target-too-close', ['terrain' => $flat, 'wind' => 0, 'round' => 9, 'seed' => 5, 'shooter' => 1,
    'tanks' => [$human(170, 100), $drone(120, 60) + ['dirS' => 1, 's' => 'hunter', 'ammo' => ['heavy' => 1, 'mortar' => 1, 'nuke' => 1]]]]);

/* ---- the harm a gun would do from an aim: what picks a drone's gun ----
 * The landing is the drone's own planning flight for the aim; 'self' when the
 * burst or its munitions could reach the drone's own body (it is never fired). */
$harm = function (string $name, array $c) use ($add): void {
    $room = sv_room($c);
    $self = $room['tanks'][$c['self']];
    $self['angle'] = (float) $c['a'];
    [$mx, $my] = room_muzzle($self);
    $land = room_sim_shot($room['terrain'], $room['wind'], $mx, $my, (float) $c['a'], (float) $c['p'], $c['wkey'], $self['dirS'], SV_WIDTH);
    $land += ['a' => $c['a'], 'p' => $c['p']];
    $h = room_ai_harm($room, $room['tanks'][$c['self']], $room['tanks'][$c['target']], $c['wkey'], $land);
    $add('ai-harm', $name, $c, ['land' => [$land['x'], $land['y']], 'harm' => is_infinite($h) ? 'self' : $h,
        'selfHarm' => room_ai_self_harm($room, $room['tanks'][$c['self']], $room['tanks'][$c['target']], $c['wkey'], $land)]);
};
foreach ($weapons as $wkey => $def) {
    $scene = ['terrain' => $flat, 'wind' => 2, 'self' => 0, 'target' => 1, 'wkey' => $wkey, 'tanks' => [$drone(100, 60) + ['dirS' => 1], $human(420, 100)]];
    foreach ([[45, 70], [60, 64], [35, 58], [70, 40], [80, 30], [40, 100]] as [$a, $p]) {
        $harm("$wkey-a$a-p$p", $scene + ['a' => $a, 'p' => $p]);
    }
    $harm("$wkey-weak-target", ['terrain' => $hills, 'wind' => -3, 'self' => 0, 'target' => 1, 'wkey' => $wkey,
        'tanks' => [$drone(560, 60) + ['dirS' => -1], $human(330, 12)], 'a' => 50, 'p' => 62]);
    foreach ([20, 45, 70] as $gap) {
        $harm("$wkey-point-blank-$gap", ['terrain' => $flat, 'wind' => 0, 'self' => 0, 'target' => 1, 'wkey' => $wkey,
            'tanks' => [$drone(300, 60) + ['dirS' => 1], $human(300 + $gap, 100)], 'a' => 80, 'p' => 25]);
    }
    $harm("$wkey-at-a-drone", ['terrain' => $flat, 'wind' => 0, 'self' => 0, 'target' => 1, 'wkey' => $wkey,
        'tanks' => [$human(100, 60) + ['dirS' => 1], $drone(330, 100)], 'a' => 55, 'p' => 60]);
}
// Pressed against its target with big guns and a Needle: it fires something that spares it.
$aim('pressed-against-its-target', ['terrain' => $flat, 'wind' => 0, 'round' => 9, 'seed' => 5, 'shooter' => 1, 'difficulty' => 'hard',
    'tanks' => [$human(350, 100), $drone(300, 60) + ['dirS' => 1, 's' => 'hunter', 'ammo' => ['heavy' => 1, 'babynuke' => 1, 'needle' => 1]]]]);
// Point blank with a full round-9 rack, every strategy fires what would hurt it least.
$rack9 = room_ai_rack(9);
foreach (['hunter', 'glory', 'lobber', 'sniper'] as $s) {
    foreach ([20, 40, 70] as $gap) {
        $aim("point-blank-least-self-harm-$s-$gap", ['terrain' => $flat, 'wind' => 0, 'round' => 9, 'seed' => 2, 'shooter' => 1, 'difficulty' => 'hard',
            'tanks' => [$human(300 + $gap, 100), $drone(300, 60) + ['dirS' => 1, 's' => $s, 'ammo' => $rack9]]]);
    }
}
// Guns with no flight: a beam aimed at a rival in line on a ridge, a ring
// around a rival 40 px off, and a ring left in the rack with rivals far off.
foreach ($weapons as $wkey => $def) {
    if (($def['effect'] ?? '') === 'beam') {
        foreach ([[1, 120, 320], [2, 600, 380], [3, 120, 320]] as [$seed, $sx, $tx]) {
            $aim("$wkey-rival-in-line-seed$seed", ['terrain' => ['flat' => 400, 'set' => [[min($sx, $tx) + 180, max($sx, $tx) + 20, 330]]], 'wind' => 1, 'round' => 9,
                'seed' => $seed, 'shooter' => 1, 'difficulty' => 'hard', 'tanks' => [array_replace($drone($tx, 100), ['y' => 330.0]),
                $drone($sx, 60) + ['dirS' => $tx > $sx ? 1 : -1, 's' => 'hunter', 'ammo' => [$wkey => 2, 'mortar' => 1]]]]);
        }
        $aim("$wkey-ground-target-below-the-barrel", ['terrain' => $flat, 'wind' => 0, 'round' => 9, 'seed' => 4, 'shooter' => 1, 'difficulty' => 'hard',
            'tanks' => [$human(420, 100), $drone(120, 60) + ['dirS' => 1, 's' => 'hunter', 'ammo' => [$wkey => 2]]]]);
    }
    if (($def['effect'] ?? '') === 'plasma') {
        foreach ([[1, 1], [-1, 2]] as [$dir, $seed]) {
            $aim("$wkey-rival-40-px-off-$dir", ['terrain' => $flat, 'wind' => 0, 'round' => 9, 'seed' => $seed, 'shooter' => 1, 'difficulty' => 'hard',
                'tanks' => [$human(300 + 40 * $dir, 100), $drone(300, 60) + ['dirS' => $dir, 's' => 'hunter', 'ammo' => [$wkey => 2, 'mortar' => 2]]]]);
        }
        $aim("$wkey-rivals-300-px-off", ['terrain' => $flat, 'wind' => 0, 'round' => 9, 'seed' => 5, 'shooter' => 1, 'difficulty' => 'hard',
            'tanks' => [$human(500, 100), $drone(200, 60) + ['dirS' => 1, 's' => 'hunter', 'ammo' => [$wkey => 2]], $drone(520, 60)]]);
    }
}
// The earth guns: the ground a gun moves counts as harm (a fall, a burial, a dig's warheads); a gun whose ground would drop or bury the drone is never fired.
if (isset($weapons['digger'], $weapons['dirtball'], $weapons['disrupter'], $weapons['riotcharge'])) {
    $ridge = ['vee' => [420, 60, 420, 330]];
    $onRidge = sv_terrain($ridge);
    $aim('digger-under-a-ridge-tank', ['terrain' => $ridge, 'wind' => 0, 'round' => 9, 'seed' => 3, 'shooter' => 1, 'difficulty' => 'hard',
        'tanks' => [array_replace($human(420, 100), ['y' => $onRidge[420]]), array_replace($drone(120, 200), ['y' => $onRidge[120], 'dirS' => 1, 's' => 'hunter', 'ammo' => ['digger' => 1]])]]);
    foreach ([1, 2] as $seed) {
        $aim("dirtball-buries-a-human-in-a-dip-seed$seed", ['terrain' => ['flat' => 400, 'set' => [[380, 440, 420]]], 'wind' => 0, 'round' => 9, 'seed' => $seed, 'shooter' => 1,
            'difficulty' => 'hard', 'tanks' => [array_replace($human(410, 100), ['y' => 420.0]), $drone(120, 200) + ['dirS' => 1, 's' => 'hunter', 'ammo' => ['dirtball' => 1]]]]);
        $aim("dirt-never-at-a-drone-seed$seed", ['terrain' => $flat, 'wind' => 0, 'round' => 9, 'seed' => $seed, 'shooter' => 1, 'difficulty' => 'hard',
            'tanks' => [$drone(420, 100) + ['dirS' => -1], $drone(120, 200) + ['dirS' => 1, 's' => 'hunter', 'ammo' => ['dirtball' => 2]]]]);
    }
    $flanks = ['vee' => [300, 60, 420, 330]];
    $onFlanks = sv_terrain($flanks);
    $aim('disrupter-refused-on-its-own-slope', ['terrain' => $flanks, 'wind' => 0, 'round' => 9, 'seed' => 4, 'shooter' => 1, 'difficulty' => 'hard',
        'tanks' => [array_replace($human(345, 100), ['y' => $onFlanks[345]]), array_replace($drone(265, 200), ['y' => $onFlanks[265], 'dirS' => 1, 's' => 'hunter', 'ammo' => ['disrupter' => 1]])]]);
    $aim('buried-human-fires-its-riot-charge', ['terrain' => ['flat' => 400, 'set' => [[270, 330, 360]]], 'wind' => 0, 'round' => 9, 'seed' => 5, 'shooter' => 0,
        'tanks' => [$human(300, 100) + ['dirS' => 1, 'angle' => 70, 'ammo' => ['riotcharge' => 1, 'mortar' => 1]], $drone(600, 100)]]);
}
// A weak target gets the cheapest gun that finishes it.
$aim('weak-target-cheapest-gun', ['terrain' => $flat, 'wind' => 0, 'round' => 9, 'seed' => 5, 'shooter' => 1, 'difficulty' => 'hard',
    'tanks' => [$human(400, 10), $drone(120, 60) + ['dirS' => 1, 's' => 'hunter', 'ammo' => ['mortar' => 2, 'babynuke' => 1]]]]);

/* ---- bracketing: a drone's shots at one target, one after another ----
 * Each step is what the caller does for a drone turn: choose, move if it
 * wants to, fire the volley (which records where it burst). The target may be
 * driven off at a step; 'hp' is large so nobody dies mid-sequence. */
$bracket = function (string $name, array $c) use ($add): void {
    $w = $c['w'] ?? SV_WIDTH;
    $room = sv_room($c, $w);
    $seat = $c['shooter'];
    $steps = [];
    for ($k = 0; $k < $c['shots']; $k++) {
        if (($c['driveAt'] ?? -1) === $k) {
            $room['tanks'][$c['target']]['x'] += $c['driveBy'];
        }
        $choice = room_ai_choose($room, $room['tanks'][$seat]);
        $room['tanks'][$seat]['angle'] = $choice['angle'];
        $room['tanks'][$seat]['power'] = $choice['power'];
        $nx = max(12.0, min($w - 12.0, $room['tanks'][$seat]['x'] + $choice['dx']));
        if (abs($choice['dx']) > 0.5) {
            $room['tanks'][$seat]['x'] = $nx;
            $room['tanks'][$seat]['y'] = $room['terrain'][max(0, min($w - 1, (int) round($nx)))];
        }
        $room['tanks'][$seat]['brk']['ox'] = $room['tanks'][$seat]['x'];
        if ($choice['wkey'] !== 'shell') {
            $room['tanks'][$seat]['ammo'][$choice['wkey']] = max(0, ($room['tanks'][$seat]['ammo'][$choice['wkey']] ?? 0) - 1);
        }
        $events = [['t' => 'aifire', 'seat' => $seat]];
        room_fire_shot($room, $events, $seat, $choice['wkey']);
        $b = $room['tanks'][$seat]['brk'];
        $steps[] = ['wkey' => $choice['wkey'], 'angle' => $choice['angle'], 'power' => $choice['power'], 'x' => $room['tanks'][$seat]['x'],
            'n' => $b['n'], 'target' => $b['t'], 'land' => $b['land']];
    }
    $add('ai-bracket', $name, $c, $steps);
};
foreach ([1, 7, 42, 2026] as $seed) {
    $bracket("stationary-target-seed$seed", ['terrain' => $flat, 'wind' => 3, 'round' => 1, 'seed' => $seed, 'shooter' => 1, 'target' => 0, 'shots' => 6,
        'tanks' => [$human(210, 9999), $drone(510, 9999) + ['dirS' => -1, 'angle' => 60]]]);
}
foreach ([3, 19] as $seed) {
    $bracket("steady-hands-seed$seed", ['terrain' => $flat, 'wind' => -2, 'round' => 9, 'seed' => $seed, 'shooter' => 1, 'target' => 0, 'shots' => 5,
        'tanks' => [$human(210, 9999), $drone(510, 9999) + ['dirS' => -1]]]);
}
foreach ([5, 64] as $seed) {
    $bracket("target-drives-off-seed$seed", ['terrain' => $flat, 'wind' => 1, 'round' => 2, 'seed' => $seed, 'shooter' => 1, 'target' => 0, 'shots' => 6,
        'driveAt' => 3, 'driveBy' => 45.0, 'tanks' => [$human(200, 9999), $drone(500, 9999) + ['dirS' => -1]]]);
}
$bracket('three-rivals-keeps-its-target', ['terrain' => $flat, 'wind' => -4, 'round' => 3, 'seed' => 301, 'shooter' => 2, 'target' => 0, 'shots' => 5,
    'tanks' => [$human(100, 9999), $drone(300, 9999), $drone(560, 9999) + ['dirS' => -1], $drone(660, 9999)]]);
$bracket('jammed-target-wobbles-double', ['terrain' => $flat, 'wind' => 0, 'round' => 2, 'seed' => 8, 'shooter' => 1, 'target' => 0, 'shots' => 5,
    'tanks' => [$human(200, 9999) + ['jammer' => 2], $drone(500, 9999) + ['dirS' => -1]]]);
$bracket('drone-with-a-rack', ['terrain' => $flat, 'wind' => 2, 'round' => 4, 'seed' => 11, 'shooter' => 1, 'target' => 0, 'shots' => 6,
    'tanks' => [$human(210, 9999), $drone(510, 9999) + ['dirS' => -1, 'ammo' => ['mortar' => 2]]]]);
// A unit on a ledge stands in the lance's line, so the lance pierces it before it lands: the bracket keeps that first burst.
$bracket('lance-marks-its-first-burst', ['terrain' => ['flat' => 400, 'set' => [[465, 485, 330]]], 'wind' => 0, 'round' => 6, 'seed' => 23,
    'shooter' => 2, 'target' => 0, 'shots' => 4,
    'tanks' => [$human(150, 9999), $drone(475, 9999) + ['y' => 330.0], $drone(560, 9999) + ['dirS' => -1, 's' => 'glory', 'ammo' => ['lance' => 9]]]]);

/* ---- difficulty: the same scenes under each level's aim ----
 * A word neither side knows aims at normal on both. */
foreach (['easy', 'normal', 'hard', 'brutal'] as $level) {
    foreach ([[1, 1], [5, 77], [10, 2026]] as [$round, $seed]) {
        $aim("$level-round$round", ['terrain' => $hills, 'wind' => 3, 'round' => $round, 'seed' => $seed, 'shooter' => 1, 'difficulty' => $level,
            'tanks' => [$human(140, 100), $drone(520, 60) + ['dirS' => -1, 'angle' => 60]]]);
    }
    $aim("$level-sniper-on-a-jammer", ['terrain' => $flat, 'wind' => -2, 'round' => 4, 'seed' => 33, 'shooter' => 1, 'difficulty' => $level,
        'tanks' => [$human(160, 100) + ['jammer' => 2], $drone(540, 60) + ['dirS' => -1, 's' => 'sniper']]]);
    foreach ([[1, 7], [6, 42]] as [$round, $seed]) {
        // Seven shots: the ranging shot, five corrections, then a fresh start.
        $bracket("$level-stationary-round$round", ['terrain' => $hills, 'wind' => 2, 'round' => $round, 'seed' => $seed, 'shooter' => 1, 'target' => 0,
            'shots' => 7, 'difficulty' => $level, 'tanks' => [$human(200, 9999), $drone(520, 9999) + ['dirS' => -1, 'angle' => 60]]]);
    }
}

/* On a wide field the wobble's floor is scaled by room_field_aim (0.5 at 1080, 0.4 at
 * 1440, so not 1), so a long bracket that shrinks down to it pins that scale on both sides. */
foreach ([1080, 1440] as $w) {
    $bracket("wide-field-$w-shrinks-to-its-floor", ['w' => $w, 'terrain' => $flat, 'wind' => 2, 'round' => 6, 'seed' => 42, 'shooter' => 1, 'target' => 0,
        'shots' => 8, 'tanks' => [$human(250, 9999), $drone($w - 250, 9999) + ['dirS' => -1, 'angle' => 60]]]);
}

/* ---- strategies: who a drone picks and how it aims ----
 * A few turns of choosing with no volley fired in between, so nothing is
 * damaged and the dry spell grows; a turn is choose plus the caller's move. */
$tactic = function (string $name, array $c) use ($add): void {
    $room = sv_room($c);
    $seat = $c['shooter'];
    $steps = [];
    for ($k = 0; $k < $c['turns']; $k++) {
        $choice = room_ai_choose($room, $room['tanks'][$seat]);
        $room['tanks'][$seat]['angle'] = $choice['angle'];
        $room['tanks'][$seat]['power'] = $choice['power'];
        if (abs($choice['dx']) > 0.5) {
            $nx = max(12.0, min(SV_WIDTH - 12.0, $room['tanks'][$seat]['x'] + $choice['dx']));
            $room['tanks'][$seat]['x'] = $nx;
            $room['tanks'][$seat]['y'] = $room['terrain'][max(0, min(SV_WIDTH - 1, (int) round($nx)))];
        }
        $room['tanks'][$seat]['brk']['ox'] = $room['tanks'][$seat]['x'];
        $b = $room['tanks'][$seat];
        $steps[] = ['target' => $b['brk']['t'], 's' => $b['s'], 'dry' => $b['dry'], 'tactic' => $choice['tactic'] ?? null,
            'wkey' => $choice['wkey'], 'angle' => $choice['angle'], 'power' => $choice['power'], 'x' => $b['x'], 'n' => $b['brk']['n']];
    }
    $add('ai-tactic', $name, $c, $steps);
};
$scene = function (string $s, array $shooter = [], array $rival3 = [], array $rival0 = []) use ($human, $drone, $flat): array {
    return ['terrain' => $flat, 'wind' => 1, 'round' => 3, 'seed' => 12, 'shooter' => 1, 'turns' => 3,
        'tanks' => [
            $rival0 + $human(100, 80) + ['score' => 900],
            $drone(520, 100) + $shooter + ['dirS' => -1, 's' => $s],
            $drone(300, 30),
            $drone(450, 70) + $rival3 + ['kills' => 4],
        ]];
};
foreach (['hunter', 'bully', 'sniper', 'avenger', 'glory', 'lobber'] as $s) {
    $tactic("$s-scene", $scene($s));
}
$tactic('avenger-remembers-its-attacker', $scene('avenger', ['lastHitBy' => 0]));
$tactic('avenger-attacker-wrecked-falls-back-to-nearest', $scene('avenger', ['lastHitBy' => 0], [], ['hp' => 0]));
$tactic('glory-human-leads', $scene('glory', [], ['kills' => 1]));
$tactic('glory-takes-its-strongest-gun', $scene('glory', ['ammo' => ['mortar' => 2, 'heavy' => 2, 'buck' => 2]]));
$tactic('sniper-ties-go-to-the-nearest', ['terrain' => $flat, 'wind' => 0, 'round' => 2, 'seed' => 5, 'shooter' => 1, 'turns' => 2,
    'tanks' => [$human(100, 50), $drone(520, 100) + ['dirS' => -1, 's' => 'sniper'], $drone(330, 50), $drone(260, 50)]]);
$tactic('lobber-with-area-guns', array_replace($scene('lobber', ['ammo' => ['rail' => 2, 'buck' => 2, 'mortar' => 2]]), ['turns' => 2]));
foreach ([2, 9, 31] as $seed) {
    $tactic("lobber-plain-shells-seed$seed", array_replace($scene('lobber'), ['seed' => $seed, 'turns' => 2]));
}
// A ridge between them stops every high arc short, so the lobber falls back to flat shots.
$tactic('lobber-falls-back-to-flat-behind-a-ridge', ['terrain' => ['flat' => 400, 'set' => [[300, 500, 60]]], 'wind' => 1, 'round' => 3, 'seed' => 12,
    'shooter' => 1, 'turns' => 2, 'tanks' => [$human(250, 80), $drone(530, 100) + ['dirS' => -1, 's' => 'lobber']]]);
foreach ([1, 4, 8, 16] as $seed) {
    $tactic("dry-spell-flips-seed$seed", array_replace($scene('bully'), ['seed' => $seed, 'turns' => 9, 'round' => 6]));
}
$tactic('flip-waits-for-three-dry-turns', array_replace($scene('bully', ['dry' => 2]), ['seed' => 3, 'turns' => 1]));
$tactic('flip-when-the-spell-is-long', array_replace($scene('bully', ['dry' => 3]), ['seed' => 3, 'turns' => 1]));

/* ---- settling after a crater ---- */
foreach ([['over-a-pit', 300, 300], ['already-down', 300, 400], ['ground-rose-above', 300, 450], ['off-the-left-edge', -3, 380],
    ['off-the-right-edge', 730, 380], ['half-pixel-rounds-up', 10.5, 380], ['hill-slope', 200.4, 300]] as [$label, $x, $y]) {
    $t = sv_terrain(['hills' => [380, 50, 150]]);
    $room = ['terrain' => $t, 'tanks' => [['seat' => 0, 'kind' => 'ai', 'hp' => 50, 'x' => (float) $x, 'y' => (float) $y]]];
    room_settle_tanks($room);
    $add('settle', $label, ['terrain' => ['hills' => [380, 50, 150]], 'x' => $x, 'y' => $y, 'hp' => 50], $room['tanks'][0]['y']);
}
$room = ['terrain' => sv_terrain($flat), 'tanks' => [['seat' => 0, 'kind' => 'ai', 'hp' => 0, 'x' => 300.0, 'y' => 200.0]]];
room_settle_tanks($room);
$add('settle', 'wreck-stays-put', ['terrain' => $flat, 'x' => 300, 'y' => 200, 'hp' => 0], $room['tanks'][0]['y']);
// Burial: risen ground never lifts a ground unit mid-round; a drone rides it up.
$mound = ['flat' => 400, 'set' => [[270, 330, 370]]];
foreach ([['human-under-dirt-stays-buried', 'human', 400.0], ['drone-under-dirt-rides-up', 'ai', 400.0],
    ['human-a-hair-under-snaps-up', 'human', 370.4], ['human-over-a-pit-still-falls', 'human', 360.0]] as [$label, $kind, $y]) {
    $room = ['terrain' => sv_terrain($mound), 'tanks' => [['seat' => 0, 'kind' => $kind, 'hp' => 50, 'x' => 300.0, 'y' => $y]]];
    room_settle_tanks($room);
    $add('settle', $label, ['terrain' => $mound, 'kind' => $kind, 'x' => 300, 'y' => $y, 'hp' => 50], $room['tanks'][0]['y']);
}

/* ---- the earth ops: the ground a shell moves (src/earth.ts) ----
 * Each case is an op on a terrain from its recipe; the output is the cells
 * it changed (x0 and their heights, null for none) and, for a pour, the pool. */
$earth = function (string $name, array $c) use ($add): void {
    $t = sv_terrain($c['terrain']);
    $before = $t;
    $out = [];
    switch ($c['op']) {
        case 'crater':
            room_carve_crater($t, (float) $c['x'], (float) $c['y'], (float) $c['r']);
            break;
        case 'dirt':
            room_add_dirt($t, (float) $c['x'], (float) $c['y'], (float) $c['r']);
            break;
        case 'pour':
            $pool = room_pour_level($t, (float) $c['x'], (float) $c['v']);
            $out['pool'] = [$pool['level'], $pool['x0'], $pool['x1']];
            room_fill_pour($t, $pool);
            break;
        case 'slump':
            room_slump_ground($t, (float) $c['x'], (float) $c['r'], (float) $c['slope'], (int) $c['passes']);
            break;
        case 'riot':
            room_riot_carve($t, (float) $c['x'], (float) $c['y'], (float) $c['a'], (float) $c['r'], (float) $c['fan'], (float) $c['y'] + 10);
            break;
        case 'dig':
            [$ux, $uy] = room_dig_heading((float) $c['vx'], (float) $c['vy']);
            $out['heading'] = [$ux, $uy];
            room_dig_carve($t, (float) $c['x'], (float) $c['y'], $ux, $uy, (int) $c['n'], (float) $c['r']);
            break;
    }
    $first = null;
    $last = null;
    foreach ($t as $ix => $y) {
        if (abs($y - $before[$ix]) > 1e-9) {
            $first ??= $ix;
            $last = $ix;
        }
    }
    $out['cells'] = $first === null ? null : ['x0' => $first, 'y' => array_slice($t, $first, $last - $first + 1)];
    $add('earth', $name, $c, $out);
};
$earth('crater-on-flat', ['op' => 'crater', 'terrain' => $flat, 'x' => 300.4, 'y' => 400, 'r' => 26]);
$earth('crater-at-the-floor', ['op' => 'crater', 'terrain' => ['flat' => 440], 'x' => 300, 'y' => 450, 'r' => 30]);
$earth('dirt-on-flat', ['op' => 'dirt', 'terrain' => $flat, 'x' => 300.25, 'y' => 400, 'r' => 35]);
$earth('dirt-in-the-air-builds-a-column', ['op' => 'dirt', 'terrain' => $flat, 'x' => 300, 'y' => 330, 'r' => 20]);
$earth('dirt-at-the-left-edge', ['op' => 'dirt', 'terrain' => $flat, 'x' => 4, 'y' => 400, 'r' => 35]);
$earth('dirt-at-the-right-edge', ['op' => 'dirt', 'terrain' => $flat, 'x' => 717.5, 'y' => 400, 'r' => 60]);
$earth('dirt-below-the-surface-changes-nothing', ['op' => 'dirt', 'terrain' => $flat, 'x' => 300, 'y' => 450, 'r' => 20]);
$earth('dirt-never-above-the-sky-line', ['op' => 'dirt', 'terrain' => ['flat' => 120], 'x' => 300, 'y' => 90, 'r' => 60]);
$earth('dirt-on-a-hillside', ['op' => 'dirt', 'terrain' => ['hills' => [330, 40, 200]], 'x' => 140, 'y' => 345, 'r' => 45]);
$vee = ['vee' => [300, 120, 330, 420]];
foreach ([[300, 4000], [287.5, 4000], [250, 1500], [300, 20000], [300, 200]] as [$x, $v]) {
    $earth("pour-into-a-vee-x$x-v$v", ['op' => 'pour', 'terrain' => $vee, 'x' => $x, 'v' => $v]);
}
$earth('pour-of-zero-volume', ['op' => 'pour', 'terrain' => $vee, 'x' => 300, 'v' => 0]);
$earth('pour-on-a-slope-spills-off-the-edge', ['op' => 'pour', 'terrain' => ['slope' => [300, 420]], 'x' => 500, 'v' => 4000]);
$earth('pour-at-the-edge-spills', ['op' => 'pour', 'terrain' => $flat, 'x' => 0, 'v' => 4000]);
$earth('pour-in-a-pit-near-the-edge', ['op' => 'pour', 'terrain' => ['flat' => 400, 'set' => [[8, 40, 430]]], 'x' => 20, 'v' => 4000]);
$earth('pour-overflows-a-pit-onto-the-flat', ['op' => 'pour', 'terrain' => ['flat' => 400, 'set' => [[290, 310, 430]]], 'x' => 300, 'v' => 4000]);
$earth('pour-on-hills', ['op' => 'pour', 'terrain' => ['hills' => [330, 40, 200]], 'x' => 140, 'v' => 4000]);
$earth('slump-a-cliff', ['op' => 'slump', 'terrain' => ['flat' => 420, 'set' => [[0, 300, 300]]], 'x' => 300, 'r' => 120, 'slope' => 1.0, 'passes' => 24]);
$earth('slump-a-ridge', ['op' => 'slump', 'terrain' => ['flat' => 400, 'set' => [[280, 320, 330]]], 'x' => 310, 'r' => 120, 'slope' => 1.0, 'passes' => 24]);
$earth('slump-gentle-hills-stays', ['op' => 'slump', 'terrain' => ['hills' => [330, 10, 400]], 'x' => 300, 'r' => 120, 'slope' => 1.0, 'passes' => 24]);
$earth('slump-steep-hills', ['op' => 'slump', 'terrain' => ['hills' => [330, 40, 120]], 'x' => 200, 'r' => 120, 'slope' => 1.5, 'passes' => 5]);
$earth('slump-at-the-edge', ['op' => 'slump', 'terrain' => ['flat' => 420, 'set' => [[0, 20, 300]]], 'x' => 5, 'r' => 120, 'slope' => 1.0, 'passes' => 3]);
$earth('riot-charge-on-flat', ['op' => 'riot', 'terrain' => $flat, 'x' => 300, 'y' => 390, 'a' => -0.9, 'r' => 45, 'fan' => 1.2]);
$earth('riot-blast-into-a-hill', ['op' => 'riot', 'terrain' => ['flat' => 400, 'set' => [[320, 420, 320]]], 'x' => 300, 'y' => 390, 'a' => -0.17, 'r' => 90, 'fan' => 0.6]);
$earth('riot-at-the-left-edge-facing-left', ['op' => 'riot', 'terrain' => $flat, 'x' => 12, 'y' => 390, 'a' => M_PI + 0.3, 'r' => 45, 'fan' => 1.2]);
$earth('riot-digs-out-a-buried-hull', ['op' => 'riot', 'terrain' => ['flat' => 400, 'set' => [[270, 330, 350]]], 'x' => 300, 'y' => 390, 'a' => -M_PI / 2, 'r' => 45, 'fan' => 1.2]);
$earth('dig-into-a-hill-and-out', ['op' => 'dig', 'terrain' => ['flat' => 400, 'set' => [[200, 260, 360]]], 'x' => 190, 'y' => 398, 'vx' => 160, 'vy' => 40, 'n' => 28, 'r' => 11]);
$earth('dig-down-at-a-slant', ['op' => 'dig', 'terrain' => $flat, 'x' => 300, 'y' => 401, 'vx' => -120, 'vy' => 200, 'n' => 45, 'r' => 15]);
$earth('dig-to-the-floor', ['op' => 'dig', 'terrain' => ['flat' => 430], 'x' => 300, 'y' => 431, 'vx' => 0, 'vy' => 300, 'n' => 15, 'r' => 8]);
$earth('dig-standing-still-goes-down', ['op' => 'dig', 'terrain' => $flat, 'x' => 300, 'y' => 401, 'vx' => 0, 'vy' => 0, 'n' => 3, 'r' => 8]);

/* ---- falling: units land, pay by the drop, spend parachutes, credit the digger ----
 * A case may first fire a blast (x, y, wkey, owner) that digs the pits; then
 * every hanging unit lands. The output is each unit's height, armor, kills,
 * last hit and drone parachutes, the human's score, cash and parachutes, and
 * the falls in order: [seat, dmg, credited seat (the unit itself for
 * nobody), parachute opened, landed on]. */
$fall = function (string $name, array $c) use ($add): void {
    $room = sv_room($c);
    $events = [];
    if (isset($c['blast'])) {
        $b = $c['blast'];
        room_explode($room, $events, $room['tanks'][$b['owner']], $b['wkey'], (float) $b['x'], (float) $b['y'], null);
    }
    $events = [];
    room_settle_tanks($room, $events);
    $human = null;
    $tanks = [];
    foreach ($room['tanks'] as $i => $t) {
        $tanks[] = ['y' => $t['y'], 'hp' => $t['hp'], 'kills' => $t['kills'] ?? 0, 'lastHitBy' => $t['lastHitBy'] ?? null,
            'chutes' => $t['kind'] === 'ai' ? (int) ($t['chutes'] ?? 0) : null];
        if ($t['kind'] === 'human' && $human === null) {
            $human = $i;
        }
    }
    $falls = [];
    foreach ($events as $e) {
        if ($e['t'] === 'fall') {
            $falls[] = [$e['seat'], $e['dmg'], $e['by'], $e['chute'], $e['under']];
        }
    }
    $add('fall', $name, $c, ['tanks' => $tanks, 'falls' => $falls,
        'score' => $human === null ? 0 : $room['scores'][$human], 'cash' => $human === null ? 0 : ($room['cash'][$human] ?? 0),
        'chutes' => $human === null ? 0 : (int) ($room['chutes'][$human] ?? 0)]);
};
$at = fn(string $kind, float $x, float $y, int $hp = 100, array $more = []) => ['kind' => $kind, 'x' => $x, 'y' => $y, 'hp' => $hp] + $more;
foreach ([0, 5, 10, 10.5, 11, 12, 21, 22, 22.25, 37.7, 100, 166] as $drop) {
    $fall("drop-$drop", ['terrain' => $flat, 'tanks' => [$at('human', 100, 400 - $drop, 300), $at('ai', 400, 400)]]);
}
$fall('ground-rose-is-free', ['terrain' => $flat, 'tanks' => [$at('human', 100, 430), $at('ai', 400, 400)]]);
$fall('credited-to-the-digger', ['terrain' => $flat, 'tanks' => [$at('human', 100, 400), $at('ai', 400, 330, 60, ['fellBy' => 0])]]);
$fall('fall-wrecks-pays-the-bonus', ['terrain' => $flat, 'tanks' => [$at('human', 100, 400), $at('ai', 400, 300, 12, ['fellBy' => 0])]]);
$fall('own-pit-credits-nobody', ['terrain' => $flat, 'tanks' => [$at('human', 100, 300, 100, ['fellBy' => 0]), $at('ai', 400, 400)]]);
$fall('drone-digs-out-the-human', ['terrain' => $flat, 'tanks' => [$at('human', 100, 300, 30, ['fellBy' => 1]), $at('ai', 400, 400)]]);
$fall('drone-digs-out-a-drone', ['terrain' => $flat, 'tanks' => [$at('human', 600, 400), $at('ai', 100, 400), $at('ai', 300, 320, 20, ['fellBy' => 1])]]);
$fall('parachute-opens', ['terrain' => $flat, 'tanks' => [$at('human', 100, 300, 100, ['chutes' => 2]), $at('ai', 400, 400)]]);
$fall('under-the-threshold-keeps-it', ['terrain' => $flat, 'tanks' => [$at('human', 100, 379, 100, ['chutes' => 1]), $at('ai', 400, 400)]]);
$fall('just-over-the-threshold-spends-it', ['terrain' => $flat, 'tanks' => [$at('human', 100, 378, 100, ['chutes' => 1]), $at('ai', 400, 400)]]);
$fall('drone-parachute', ['terrain' => $flat, 'tanks' => [$at('human', 100, 400), $at('ai', 400, 250, 60, ['chutes' => 1, 'fellBy' => 0])]]);
$fall('bunker-halves-shield-does-not', ['terrain' => $flat, 'tanks' => [$at('human', 100, 290, 100, ['bunker' => 2, 'shield' => true]), $at('ai', 400, 400)]]);
$fall('lands-on-a-unit', ['terrain' => $flat, 'tanks' => [$at('human', 310, 400), $at('ai', 300, 200, 60, ['fellBy' => 2, 'chutes' => 1]), $at('ai', 600, 400)]]);
$fall('stack-lands-bottom-up', ['terrain' => $flat, 'tanks' => [$at('ai', 300, 300), $at('human', 300, 350)]]);
$fall('side-by-side-misses', ['terrain' => $flat, 'tanks' => [$at('human', 100, 400), $at('ai', 144, 300)]]);
$fall('fall-wrecks-a-last-stand', ['terrain' => $flat, 'tanks' => [$at('human', 300, 250, 20, ['laststand' => true, 'fellBy' => 1]), $at('ai', 330, 400, 100), $at('ai', 600, 400)]]);
$fall('hillside-pit', ['terrain' => ['hills' => [330, 40, 200], 'set' => [[180, 220, 420]]], 'tanks' => [$at('human', 200.4, 340), $at('ai', 500, 330)]]);
foreach (['shell', 'mortar', 'heavy', 'nuke', 'roller'] as $wkey) {
    if (isset($weapons[$wkey])) {
        $fall("$wkey-digs-beside-a-drone", ['terrain' => $flat, 'tanks' => [$at('human', 100, 400), $at('ai', 330, 400, 60)],
            'blast' => ['x' => 330 + $weapons[$wkey]['radius'] * 0.5, 'y' => 400, 'wkey' => $wkey, 'owner' => 0]]);
    }
}
$fall('blast-digs-its-own-gunner', ['terrain' => $flat, 'tanks' => [$at('human', 300, 400), $at('ai', 600, 400)],
    'blast' => ['x' => 300, 'y' => 440, 'wkey' => 'mortar', 'owner' => 0]]);
$fall('drone-blast-digs-the-human', ['terrain' => $flat, 'tanks' => [$at('human', 300, 400, 100, ['chutes' => 1]), $at('ai', 600, 400)],
    'blast' => ['x' => 300, 'y' => 470, 'wkey' => 'nuke', 'owner' => 1]]);

/* ---- armor between rounds: carry-over, a capped repair, a plate, a wreck ----
 * Each case is a list of ops on one seat; the output is the seat's armor, its
 * max, and the tank's hp after every op. src/armor.ts replays them. */
$armor = function (string $name, array $ops) use ($exact): void {
    $room = ['plate' => [0 => 0]];
    $hp = 0;
    $out = [];
    foreach ($ops as $op) {
        switch ($op[0]) {
            case 'muster':
                $hp = room_muster_armor($room, 0);
                break;
            case 'damage':
                $hp = max(0, $hp - $op[1]);
                break;
            case 'end':
                room_carry_armor($room, 0, $hp, $hp <= 0);
                break;
            case 'repair':
                room_repair($room, 0, 40 * $op[1]);
                break;
            case 'plate':
                room_fit_plate($room, 0, $op[1]);
                break;
        }
        $out[] = ['armor' => room_muster_armor($room, 0), 'max' => room_max_armor($room, 0), 'hp' => $hp];
    }
    $exact('armor', $name, ['ops' => $ops], $out);
};
$armor('damage-carries-over', [['muster'], ['damage', 36], ['end'], ['muster']]);
$armor('repair-capped-at-max', [['muster'], ['damage', 15], ['end'], ['repair', 1], ['muster']]);
$armor('three-packs-from-low-capped-at-max', [['muster'], ['damage', 90], ['end'], ['repair', 3], ['muster']]);
$armor('plate-raises-max-and-armor', [['muster'], ['damage', 40], ['end'], ['plate', 1], ['muster']]);
$armor('plates-then-repair-to-the-new-max', [['plate', 3], ['muster'], ['damage', 15], ['end'], ['repair', 1], ['muster']]);
$armor('wreck-re-musters-at-full-max', [['plate', 2], ['muster'], ['damage', 500], ['end'], ['muster']]);
$armor('full-armor-repair-restores-nothing', [['muster'], ['repair', 2], ['muster']]);

/* ---- the room match ends on the last human standing ----
 * lives per seat (null: a drone seat), how many humans started, the round. */
$matchEnd = function (string $name, array $lives, int $startHumans, int $round) use ($exact): void {
    $room = ['seats' => [], 'startHumans' => $startHumans];
    foreach ($lives as $i => $l) {
        $room['seats'][$i] = $l === null ? ['human' => false, 'lives' => 0] : ['human' => true, 'lives' => $l];
    }
    $o = room_match_outcome($room);
    $exact('match-end', $name, ['lives' => $lives, 'startHumans' => $startHumans, 'round' => $round],
        ['over' => $o['over'], 'winner' => $o['winner'], 'bonus' => room_winner_bonus($round)]);
};
$matchEnd('one-human-alive-plays-on', [2, null, null, null], 1, 3);
$matchEnd('one-human-out-ends', [0, null, null, null], 1, 5);
$matchEnd('last-of-two-wins', [1, 0, null, null], 2, 4);
$matchEnd('last-of-three-wins-after-a-double-out', [2, 0, 0, null], 3, 7);
$matchEnd('two-of-three-play-on', [1, 1, 0, null], 3, 2);
$matchEnd('last-two-fall-together', [0, 0, null, null], 2, 6);
$matchEnd('a-leaver-counts-as-out', [3, null, null, null], 2, 3);

/* ---- write or compare ---- */
$weaponNames = array_keys($weapons);
$head = ['about' => 'Game math cases generated by php protocol/sim-vectors.php from rooms.php; test/sim-vectors.test.mjs replays them through src/sim.ts, src/ai.ts, src/armor.ts, src/standings.ts and src/detmath.ts. Do not edit by hand.',
    'tolerance' => SV_TOLERANCE, 'weapons' => $weaponNames];
$lines = [];
foreach ($cases as $group => $list) {
    $rows = array_map(fn($c) => json_encode($c, JSON_UNESCAPED_SLASHES | JSON_PRESERVE_ZERO_FRACTION), $list);
    $lines[] = '    ' . json_encode($group) . ": [\n      " . implode(",\n      ", $rows) . "\n    ]";
}
$text = "{\n  \"about\": " . json_encode($head['about'], JSON_UNESCAPED_SLASHES) .",\n  \"tolerance\": " . SV_TOLERANCE . ",\n  \"weapons\": " . json_encode($weaponNames)
    . ",\n  \"groups\": {\n" . implode(",\n", $lines) . "\n  }\n}\n";
$file = __DIR__ . '/sim-vectors.json';
$count = array_sum(array_map('count', $cases));
if (in_array('--check', $argv, true)) {
    if (!is_file($file) || file_get_contents($file) !== $text) {
        fwrite(STDERR, "sim-vectors: sim-vectors.json is stale; run make sim-vectors and commit the result\n");
        exit(1);
    }
    echo "sim-vectors: $count cases current\n";
    exit(0);
}
file_put_contents($file, $text);
echo "sim-vectors: wrote $count cases to sim-vectors.json\n";
foreach ($cases as $group => $list) {
    echo '  ' . str_pad($group, 12) . count($list) . "\n";
}
