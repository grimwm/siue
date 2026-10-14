<?php
// Operation Tankity rooms. The earth, as the shells move it: craters, dirt,
// pools of liquid dirt, slumping slopes, a digger's trench and a riot charge's
// scoop, each a pure function of the height map. src/earth.ts is the same ops
// to the last bit; protocol/sim-vectors.json pins the two together. Loaded by
// rooms.php after sim.php; it runs nothing on its own.
declare(strict_types=1);

// Not an endpoint: rooms.php defines this constant, then requires the file.
// A direct request gets a 404 and nothing runs.
if (!defined('TANKITY_ROOMS_INCLUDED')) {
    http_response_code(404);
    exit;
}

/* The sky stays open above this row: dirt never piles higher. */
const ROOM_TOP_Y = 40.0;
/* The field's floor (src/sim.ts H - 4): no crater or trench cuts below it. */
const ROOM_EARTH_FLOOR = 456.0;
/* A ground unit whose column's surface is more than this above it is buried. */
const ROOM_BURY_EPS = 2.0;
/* A digger burrows 240 px/s: this many px per 1/60 s step. */
const ROOM_DIG_STEP = 4.0;
/* A pool's level is found in exactly this many halvings. */
const ROOM_POUR_ITERS = 48;

/* Cuts a crater: the ground under (x, y) drops to a 3:4 ellipse of radius $r
// around it, never below $floor. src/earth.ts carveCrater() is the same. */
function room_carve_crater(array &$terrain, float $x, float $y, float $r, float $floor = ROOM_EARTH_FLOOR): void
{
    $n = count($terrain);
    $x0 = max(0, (int) floor($x - $r));
    $x1 = min($n - 1, (int) ceil($x + $r));
    for ($ix = $x0; $ix <= $x1; $ix++) {
        $dx = $ix - $x;
        $cut = sqrt(max(0.0, $r * $r - $dx * $dx)) * 0.75;
        $terrain[$ix] = min($floor, max((float) $terrain[$ix], $y + $cut));
    }
}
/* A disc of dirt of radius $r around (x, y) lands on the ground: each
// column's surface rises to the top of the disc over it (never above
// ROOM_TOP_Y); a disc under the surface changes nothing. src/earth.ts
// addDirt() is the same. */
function room_add_dirt(array &$terrain, float $x, float $y, float $r): void
{
    $n = count($terrain);
    $x0 = max(0, (int) floor($x - $r));
    $x1 = min($n - 1, (int) ceil($x + $r));
    for ($ix = $x0; $ix <= $x1; $ix++) {
        $dx = $ix - $x;
        $chord = sqrt(max(0.0, $r * $r - $dx * $dx));
        $terrain[$ix] = max(ROOM_TOP_Y, min((float) $terrain[$ix], $y - $chord));
    }
}
/* The pool liquid at level $level would make around column $xi: the run of
// columns out from $xi whose ground lies below the level (more than half a
// pixel above it counts as dry), its volume (the sum of each column's depth
// under the level) and whether it reaches the field's edge, where it spills
// off. [x0, x1, volume, edge]; x0 > x1 when $xi itself is dry. */
function room_pour_basin(array $terrain, int $xi, float $level): array
{
    $n = count($terrain);
    if (!($terrain[$xi] > $level - 0.5)) {
        return [$xi, $xi - 1, 0.0, false];
    }
    $a = $xi;
    $b = $xi;
    while ($a > 0 && $terrain[$a - 1] > $level - 0.5) {
        $a--;
    }
    while ($b < $n - 1 && $terrain[$b + 1] > $level - 0.5) {
        $b++;
    }
    $vol = 0.0;
    for ($ix = $a; $ix <= $b; $ix++) {
        $vol += $terrain[$ix] - $level;
    }
    return [$a, $b, $vol, $a === 0 || $b === $n - 1];
}
/* Where $volume px^2 of liquid poured at column x comes to rest. It runs
// downhill first, column by column to the lower neighbour (the right one on a
// tie), to the bottom of the dip it landed in; there its level is found in
// ROOM_POUR_ITERS halvings between the highest ground and the floor. A pool
// that would reach either edge of the field spills off it, so the level stays
// below what would reach one; what will not fit is lost (all of it, poured
// on a slope down to an edge). With $poolMin above 0 a liquid spreads only
// until it is $poolMin deep: when that fill would leave it shallower (or spill
// it all), it lies instead as a puddle (room_pour_puddle) $poolMin deep at the
// bottom it ran to. ['level', 'x0', 'x1'] (x0 > x1: no pool).
// src/earth.ts pourLevel() is the same. */
function room_pour_level(array $terrain, float $x, float $volume, float $poolMin = 0.0): array
{
    $n = count($terrain);
    $xi = (int) det_round(max(0.0, min((float) ($n - 1), $x)));
    while (true) {
        $l = $xi > 0 ? $terrain[$xi - 1] : -INF;
        $r = $xi < $n - 1 ? $terrain[$xi + 1] : -INF;
        if ($r > $terrain[$xi] && $r >= $l) {
            $xi++;
        } elseif ($l > $terrain[$xi]) {
            $xi--;
        } else {
            break;
        }
    }
    if (!($volume > 0)) {
        return ['level' => (float) $terrain[$xi], 'x0' => $xi, 'x1' => $xi - 1];
    }
    $lo = (float) min($terrain);
    $hi = ROOM_EARTH_FLOOR;
    for ($i = 0; $i < ROOM_POUR_ITERS; $i++) {
        $mid = ($lo + $hi) / 2;
        [, , $vol, $edge] = room_pour_basin($terrain, $xi, $mid);
        if ($edge || $vol > $volume) {
            $lo = $mid;
        } else {
            $hi = $mid;
        }
    }
    [$a, $b, , $edge] = room_pour_basin($terrain, $xi, $hi);
    $pool = $edge ? ['level' => $hi, 'x0' => $xi, 'x1' => $xi - 1] : ['level' => $hi, 'x0' => $a, 'x1' => $b];
    if (!($poolMin > 0) || ($pool['x0'] <= $pool['x1'] && $terrain[$xi] - $pool['level'] >= $poolMin)) {
        return $pool;
    }
    return room_pour_puddle($terrain, $xi, $volume, $poolMin);
}
/* A puddle: liquid that spreads only until it is $d deep, its level $d over
// the ground at column $xi, widening a column at a time, left then right in
// turn (a side whose next column stands dry gives way to the other), until it
// holds $volume. Once it reaches either edge of the field the rest spills
// off. src/earth.ts puddle() is the same. */
function room_pour_puddle(array $terrain, int $xi, float $volume, float $d): array
{
    $n = count($terrain);
    $level = $terrain[$xi] - $d;
    $a = $xi;
    $b = $xi;
    $vol = $d;
    $left = true;
    while ($vol < $volume && $a > 0 && $b < $n - 1) {
        $l = $terrain[$a - 1] > $level - 0.5;
        $r = $terrain[$b + 1] > $level - 0.5;
        if (!$l && !$r) {
            break;
        }
        if ($left ? $l : !$r) {
            $a--;
            $vol += max(0.0, $terrain[$a] - $level);
        } else {
            $b++;
            $vol += max(0.0, $terrain[$b] - $level);
        }
        $left = !$left;
    }
    return ['level' => (float) $level, 'x0' => $a, 'x1' => $b];
}
/* Liquid dirt sets: every column of the pool rises to its level (none is
// lowered). src/earth.ts fillPour() is the same. */
function room_fill_pour(array &$terrain, array $pool): void
{
    for ($ix = $pool['x0']; $ix <= $pool['x1']; $ix++) {
        $terrain[$ix] = min((float) $terrain[$ix], (float) $pool['level']);
    }
}
/* The ground within $r of column x slumps: $passes passes, each from left to
// right, moving earth from the higher of two neighbouring columns to the
// lower wherever they differ by more than $slope px, half the excess at a
// time, so every move keeps the volume. src/earth.ts slumpGround() is the same. */
function room_slump_ground(array &$terrain, float $x, float $r, float $slope, int $passes): void
{
    $n = count($terrain);
    $x0 = max(0, (int) floor($x - $r));
    $x1 = min($n - 1, (int) ceil($x + $r));
    for ($p = 0; $p < $passes; $p++) {
        for ($ix = $x0; $ix < $x1; $ix++) {
            $d = $terrain[$ix + 1] - $terrain[$ix];
            $ad = abs($d);
            if ($ad <= $slope) {
                continue;
            }
            $m = ($ad - $slope) / 2;
            if ($d > 0) {
                $terrain[$ix] += $m;
                $terrain[$ix + 1] -= $m;
            } else {
                $terrain[$ix + 1] += $m;
                $terrain[$ix] -= $m;
            }
        }
    }
}
/* A riot charge's scoop from a hull centred on (hx, hy) whose unit stands at
// $base, its barrel heading $a (radians, screen frame: x along cos, y along
// sin, y down): a crater of radius $r / 2 over the hull, never cutting below
// $base (it clears the hull, it does not drop it), then one every 4 px along the barrel out to
// $r, their radius growing from $r / 4 to $r x $fan. src/earth.ts riotCarve()
// is the same. */
function room_riot_carve(array &$terrain, float $hx, float $hy, float $a, float $r, float $fan, float $base): void
{
    room_carve_crater($terrain, $hx, $hy, $r / 2, min(ROOM_EARTH_FLOOR, $base));
    $ux = det_cos($a);
    $uy = det_sin($a);
    for ($k = 1; 4 * $k <= $r; $k++) {
        $d = 4.0 * $k;
        room_carve_crater($terrain, $hx + $ux * $d, $hy + $uy * $d, $r / 4 + ($r * $fan - $r / 4) * $d / $r);
    }
}
/* A digger's heading from its velocity at touchdown: [ux, uy], a unit
// vector (straight down for a shell standing still). src/earth.ts digHeading() is the same. */
function room_dig_heading(float $vx, float $vy): array
{
    $len = room_dist($vx, $vy);
    return $len > 0 ? [$vx / $len, $vy / $len] : [0.0, 1.0];
}
/* A digger's trench from (x, y): $n steps of ROOM_DIG_STEP px along
// (ux, uy), a crater of radius $r at each. The room replay carves a dig event
// with this; the burrow itself (room_fire_dig) steps the same way.
// src/earth.ts digCarve() is the same. */
function room_dig_carve(array &$terrain, float $x, float $y, float $ux, float $uy, int $n, float $r): void
{
    for ($i = 1; $i <= $n; $i++) {
        $x += $ux * ROOM_DIG_STEP;
        $y += $uy * ROOM_DIG_STEP;
        room_carve_crater($terrain, $x, $y, $r);
    }
}
/* A ground unit under the surface: its column's ground is more than
// ROOM_BURY_EPS above it. Drones hover and ride the ground, so are never
// buried. src/sim.ts buried() is the same. */
function room_buried(array $t, array $terrain): bool
{
    return $t['kind'] === 'human' && count($terrain) > 0 && room_surf_y($terrain, (float) $t['x']) < (float) $t['y'] - ROOM_BURY_EPS;
}
