<?php
// Writes (or checks) sim-vectors.json next to this file: game math cases for
// the two simulations that must agree, rooms.php (the room server) and
// src/sim.ts (the browser's sim: solo, demo and the client's own shell flight).
//   php protocol/sim-vectors.php          rewrite sim-vectors.json
//   php protocol/sim-vectors.php --check  exit 1 if it is stale
// Every expected value comes from rooms.php's own functions (or, for the
// inlined pieces, the small pure functions extracted from the step loops).
// ../sim-vectors-test.js replays each case through the compiled sim (js/sim.js).
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

/** A terrain from its recipe, to the nearest 0.001 so both languages build the same ground. */
function sv_terrain(array $spec): array
{
    $t = [];
    for ($ix = 0; $ix < SV_WIDTH; $ix++) {
        if (isset($spec['flat'])) {
            $y = (float) $spec['flat'];
        } elseif (isset($spec['slope'])) {
            $y = $spec['slope'][0] + ($spec['slope'][1] - $spec['slope'][0]) * $ix / (SV_WIDTH - 1);
        } else {
            [$base, $amp, $period] = $spec['hills'];
            $y = $base + $amp * sin($ix * 2 * M_PI / $period);
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
function sv_room(array $c): array
{
    $room = ['terrain' => sv_terrain($c['terrain']), 'tanks' => [], 'wind' => (float) ($c['wind'] ?? 0),
        'round' => (int) ($c['round'] ?? 1), 'rng' => (int) ($c['seed'] ?? 1),
        'scores' => [], 'cash' => [], 'shield' => [], 'bunker' => [], 'laststand' => [], 'jammer' => []];
    foreach ($c['tanks'] as $i => $t) {
        $room['tanks'][$i] = ['seat' => $i, 'kind' => $t['kind'], 'name' => 'T' . $i,
            'x' => (float) $t['x'], 'y' => (float) $t['y'], 'angle' => (float) ($t['angle'] ?? 45), 'power' => (float) ($t['power'] ?? 50),
            'hp' => (int) ($t['hp'] ?? 100), 'maxHp' => 100, 'fuel' => (float) ($t['fuel'] ?? 80), 'dirS' => $t['dirS'] ?? 1,
            'ammo' => $t['ammo'] ?? []];
        foreach (['s', 'dry', 'dealt', 'lastHitBy', 'kills'] as $k) {
            if (isset($t[$k])) {
                $room['tanks'][$i][$k] = $t[$k];
            }
        }
        $room['scores'][$i] = (int) ($t['score'] ?? 0);
        $room['shield'][$i] = !empty($t['shield']);
        $room['bunker'][$i] = (int) ($t['bunker'] ?? 0);
        $room['laststand'][$i] = !empty($t['laststand']);
        $room['jammer'][$i] = (int) ($t['jammer'] ?? 0);
    }
    return $room;
}

/** What a blast or a volley changed: hp and fuel, the crater cells, and the human seat's score and cash. */
function sv_outcome(array $before, array $room): array
{
    $tanks = [];
    $human = null;
    foreach ($room['tanks'] as $i => $t) {
        $tanks[] = ['hp' => $t['hp'], 'fuel' => $t['fuel']];
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
        'laststand' => $human === null ? false : $room['laststand'][$human]];
}

/** The aim (angle, power) a shooter would pick to land a shell on x, found with the server's own predictor. */
function sv_aim_at(array $room, int $seat, string $wkey, float $targetX): array
{
    $tank = $room['tanks'][$seat];
    $best = [INF, 45, 50];
    for ($a = 15; $a <= 85; $a++) {
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
    'seek-push/half-a-pixel-away' => ['out'],
    'seek-push/exactly-one-pixel-away' => ['out'],
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
$weapons = room_weapons();

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
$seek('half-a-pixel-away', [$human(100), $drone(150)], 0, 150.5, 388, 70, 1 / 60,
    'room_seek_push skips steering within 1 px of the target; the browser sim clamps the distance to 1 and still steers. Unreachable in play: a shell that close is already inside the rival\'s hit box and has burst.');
$seek('exactly-one-pixel-away', [$human(100), $drone(150)], 0, 150, 389, 70, 1 / 60,
    'same 1 px rule as half-a-pixel-away');
foreach ([[0.0, 0.0], [300.0, 0.0], [0.0, -250.0], [-140.0, 90.0]] as [$vx, $vy]) {
    foreach ([2, 4, 5] as $n) {
        $fan = $n === 5 ? 0.1 : 0.22;
        $add('split-fan', "v$vx,$vy-n$n", ['vx' => $vx, 'vy' => $vy, 'n' => $n, 'fan' => $fan], room_split_vel($vx, $vy, $n, $fan));
    }
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
$volley('lob-off-the-board', array_replace($shell, ['shooter' => 0, 'tanks' => [$human(600, 100), $drone(100, 100)], 'angle' => 40, 'power' => 100]));
$volley('fired-into-the-hillside', ['terrain' => ['slope' => [420, 260]], 'wkey' => 'shell', 'shooter' => 0, 'tanks' => [$human(100, 100), $drone(500, 100)], 'angle' => 5, 'power' => 50]);
$volley('shielded-human-eats-a-drone-shell', array_replace($shell, ['shooter' => 1, 'tanks' => [$human(380, 100) + ['shield' => true], $drone(100, 100) + ['dirS' => 1]],
    'angle' => sv_aim_at(sv_room(array_replace($shell, ['tanks' => [$human(380, 100), $drone(100, 100) + ['dirS' => 1]]])), 1, 'shell', 380.0)[0],
    'power' => sv_aim_at(sv_room(array_replace($shell, ['tanks' => [$human(380, 100), $drone(100, 100) + ['dirS' => 1]]])), 1, 'shell', 380.0)[1]]));

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

/* ---- bracketing: a drone's shots at one target, one after another ----
 * Each step is what the caller does for a drone turn: choose, move if it
 * wants to, fire the volley (which records where it burst). The target may be
 * driven off at a step; 'hp' is large so nobody dies mid-sequence. */
$bracket = function (string $name, array $c) use ($add): void {
    $room = sv_room($c);
    $seat = $c['shooter'];
    $steps = [];
    for ($k = 0; $k < $c['shots']; $k++) {
        if (($c['driveAt'] ?? -1) === $k) {
            $room['tanks'][$c['target']]['x'] += $c['driveBy'];
        }
        $choice = room_ai_choose($room, $room['tanks'][$seat]);
        $room['tanks'][$seat]['angle'] = $choice['angle'];
        $room['tanks'][$seat]['power'] = $choice['power'];
        $nx = max(12.0, min(SV_WIDTH - 12.0, $room['tanks'][$seat]['x'] + $choice['dx']));
        if (abs($choice['dx']) > 0.5) {
            $room['tanks'][$seat]['x'] = $nx;
            $room['tanks'][$seat]['y'] = $room['terrain'][max(0, min(SV_WIDTH - 1, (int) round($nx)))];
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
foreach ([1, 4, 8, 16] as $seed) {
    $tactic("dry-spell-flips-seed$seed", array_replace($scene('bully'), ['seed' => $seed, 'turns' => 9, 'round' => 6]));
}
$tactic('flip-waits-for-three-dry-turns', array_replace($scene('bully', ['dry' => 2]), ['seed' => 3, 'turns' => 1]));
$tactic('flip-when-the-spell-is-long', array_replace($scene('bully', ['dry' => 3]), ['seed' => 3, 'turns' => 1]));

/* ---- settling after a crater ---- */
foreach ([['over-a-pit', 300, 300], ['already-down', 300, 400], ['ground-rose-above', 300, 450], ['off-the-left-edge', -3, 380],
    ['off-the-right-edge', 730, 380], ['half-pixel-rounds-up', 10.5, 380], ['hill-slope', 200.4, 300]] as [$label, $x, $y]) {
    $t = sv_terrain(['hills' => [380, 50, 150]]);
    $room = ['terrain' => $t, 'tanks' => [['hp' => 50, 'x' => (float) $x, 'y' => (float) $y]]];
    room_settle_tanks($room);
    $add('settle', $label, ['terrain' => ['hills' => [380, 50, 150]], 'x' => $x, 'y' => $y, 'hp' => 50], $room['tanks'][0]['y']);
}
$room = ['terrain' => sv_terrain($flat), 'tanks' => [['hp' => 0, 'x' => 300.0, 'y' => 200.0]]];
room_settle_tanks($room);
$add('settle', 'wreck-stays-put', ['terrain' => $flat, 'x' => 300, 'y' => 200, 'hp' => 0], $room['tanks'][0]['y']);

/* ---- write or compare ---- */
$weaponNames = array_keys($weapons);
$head = ['about' => 'Game math cases generated by php protocol/sim-vectors.php from rooms.php; sim-vectors-test.js replays them through js/sim.js. Do not edit by hand.',
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
