<?php
// Operation Tankity rooms. The deterministic sim: integer RNG, terrain generation, the curated hills, weapon
// tables, ballistics, the Roller's rolling arc, hit boxes and sweeps, explosions and
// settling. It mirrors src/sim.ts, and protocol/sim-vectors.json pins the two
// together. Loaded by rooms.php; it runs nothing on its own.
declare(strict_types=1);

// Not an endpoint: rooms.php defines this constant, then requires the file.
// A direct request gets a 404 and nothing runs.
if (!defined('TANKITY_ROOMS_INCLUDED')) {
    http_response_code(404);
    exit;
}

// Curated hills. Friends pick these by public id ("canyon 3"); the seeds stay
// on the server, so a favorite hillside replays without ever revealing them.
const ROOM_MAPS = [
    'canyon 3' => ['name' => 'Canyon 3', 'seed' => 'tankity-canyon-three'],
    'twin hills' => ['name' => 'Twin Hills', 'seed' => 'tankity-twin-hills'],
    'dusty bowl' => ['name' => 'Dusty Bowl', 'seed' => 'tankity-dusty-bowl'],
    'high pass' => ['name' => 'High Pass', 'seed' => 'tankity-high-pass'],
    'crater field' => ['name' => 'Crater Field', 'seed' => 'tankity-crater-field'],
    'riverbed' => ['name' => 'Riverbed', 'seed' => 'tankity-riverbed'],
];
function room_map_lookup($raw): ?string
{
    if (!is_string($raw)) {
        return null;
    }
    $id = strtolower(trim(preg_replace('/\s+/', ' ', $raw)));
    return isset(ROOM_MAPS[$id]) ? $id : null;
}
function room_map_name(?string $id): string
{
    if ($id !== null && isset(ROOM_MAPS[$id])) {
        return ROOM_MAPS[$id]['name'];
    }
    return 'Random hills';
}
/* A picked map's silhouette for the lobby tiles: round one's terrain, from
// the same hidden seed room_start_round() uses, sampled to ROOM_PROFILE_N
// heights. 0 is the lowest ground the generator allows, 1 the highest. */
const ROOM_PROFILE_N = 48;
function room_map_profile(string $id): array
{
    $w = 720;
    $mrng = room_hash_seed(ROOM_MAPS[$id]['seed'] . '|round1');
    $t = room_gen_terrain($mrng, $w);
    $out = [];
    for ($i = 0; $i < ROOM_PROFILE_N; $i++) {
        $x = (int) round($i * ($w - 1) / (ROOM_PROFILE_N - 1));
        $out[] = round((415.0 - $t[$x]) / (415.0 - 190.0), 3);
    }
    return $out;
}
const ROOM_TURN_WIND = 2.2;
const ROOM_GRAV = 95;
const ROOM_FLAT_GRAV = 90; // flat bolts arc a little (src/sim.ts FLAT_GRAV)

/* ---------- deterministic sim: bit-identical integer core to src/sim.ts ---------- */
function u32(int $v): int
{
    return $v & 0xFFFFFFFF;
}
/* Exact low 32 bits of the product, 16-bit halves at a time: a full u32
// multiply overflows into float and loses precision (and PHP 8.1+ prints a
// deprecation that corrupts the JSON). Matches Math.imul, bit for bit. */
function imul32(int $a, int $b): int
{
    $a &= 0xFFFFFFFF;
    $b &= 0xFFFFFFFF;
    $lo = ($a & 0xFFFF) * ($b & 0xFFFF);
    $mid = (($a >> 16) * ($b & 0xFFFF) + ($a & 0xFFFF) * ($b >> 16)) & 0xFFFF;
    return ($lo + ($mid << 16)) & 0xFFFFFFFF;
}
function room_hash_seed(string $str): int
{
    $h = u32(1779033703 ^ strlen($str));
    $len = strlen($str);
    for ($i = 0; $i < $len; $i++) {
        $h = imul32($h ^ ord($str[$i]), 3432918353);
        $h = u32(($h << 13) | ($h >> 19));
    }
    return u32($h);
}
/* Advances $a (by reference) and returns a float in [0,1). */
function room_rng_next(int &$a): float
{
    $a = u32($a + 0x6D2B79F5);
    $t = imul32($a ^ ($a >> 15), 1 | $a);
    $t = u32($t + imul32($t ^ ($t >> 7), 61 | $t)) ^ $t;
    return (float)(u32($t ^ ($t >> 14))) / 4294967296.0;
}
function room_rng_range(int &$a, float $lo, float $hi): float
{
    return $lo + room_rng_next($a) * ($hi - $lo);
}
function room_gauss(int &$a): float
{
    return (room_rng_next($a) + room_rng_next($a) + room_rng_next($a) - 1.5) * 2.0;
}
function room_gen_terrain(int &$rng, int $w): array
{
    $a = [20 + room_rng_next($rng) * 30, 10 + room_rng_next($rng) * 22, 5 + room_rng_next($rng) * 12];
    $p = [room_rng_next($rng) * 6.28, room_rng_next($rng) * 6.28, room_rng_next($rng) * 6.28];
    $f = [1 / 260 + room_rng_next($rng) / 500, 1 / 120 + room_rng_next($rng) / 260, 1 / 47 + room_rng_next($rng) / 120];
    $t = [];
    for ($x = 0; $x < $w; $x++) {
        $y = 330
            + $a[0] * sin($x * $f[0] + $p[0])
            + $a[1] * sin($x * $f[1] + $p[1])
            + $a[2] * sin($x * $f[2] + $p[2]);
        $t[$x] = max(190.0, min(415.0, $y));
    }
    return $t;
}
function room_weapons(): array
{
    // One table for ballistics, shop packs, prices, and round unlocks.
    static $w = null;
    if ($w !== null) {
        return $w;
    }
    $w = [];
    foreach (room_arsenal()['ammo'] as $am) {
        if (!isset($am['key'])) {
            continue;
        }
        $w[(string) $am['key']] = [
            'dmg' => (int) ($am['dmg'] ?? 30),
            'radius' => (int) ($am['radius'] ?? 24),
            'price' => (int) ($am['price'] ?? 0),
            'pack' => (int) ($am['pack'] ?? 0),
            'minRound' => (int) ($am['minRound'] ?? 1),
            'effect' => (string) ($am['effect'] ?? 'shot'),
            'speed' => (float) ($am['speed'] ?? 1.0),
            'flat' => !empty($am['flat']),
            'pellets' => (int) ($am['pellets'] ?? 0),
            'spread' => (float) ($am['spread'] ?? 0.0),
            'fuse' => (float) ($am['fuse'] ?? 0.9),
            'split' => (int) ($am['split'] ?? 4),
            'fan' => (float) ($am['fan'] ?? 0.22),
            'subDmg' => (int) ($am['subDmg'] ?? ($am['dmg'] ?? 30)),
            'subRadius' => (int) ($am['subRadius'] ?? ($am['radius'] ?? 24)),
            'prox' => (float) ($am['prox'] ?? 34.0),
            'steer' => (float) ($am['steer'] ?? 70.0),
            'drain' => (int) ($am['drain'] ?? 0),
            'friction' => (float) ($am['friction'] ?? 0.3),
            'rollTime' => (float) ($am['rollTime'] ?? 5.0),
            'ai' => !empty($am['ai']),
            'aiRound' => (int) ($am['aiRound'] ?? 99),
        ];
    }
    if (!isset($w['shell'])) {
        $w['shell'] = ['dmg' => 34, 'radius' => 26, 'price' => 0, 'pack' => 0, 'minRound' => 1, 'effect' => 'shot', 'speed' => 1.0, 'flat' => false, 'pellets' => 0, 'spread' => 0.0, 'fuse' => 0.9, 'split' => 4, 'fan' => 0.22, 'subDmg' => 34, 'subRadius' => 26, 'prox' => 34.0, 'steer' => 70.0, 'drain' => 0, 'friction' => 0.3, 'rollTime' => 5.0, 'ai' => true, 'aiRound' => 1];
    }
    return $w;
}
function room_gear(string $key): ?array
{
    foreach (room_arsenal()['gear'] as $g) {
        if (($g['key'] ?? null) === $key) {
            return $g;
        }
    }
    return null;
}
function room_shot_speed(float $power, bool $flat, float $mult = 1.0): float
{
    return ($flat ? 140.0 + $power * 3.2 : 40.0 + $power * 2.4) * $mult;
}
/* Where a shell leaves the barrel: 20 px along it, 14 px above the hull.
// src/sim.ts muzzle() is the same. [x, y]. */
function room_muzzle(array $tank): array
{
    $rad = deg2rad($tank['angle']);
    $dirS = $tank['dirS'] ?? -1;
    return [$tank['x'] + cos($rad) * 20 * $dirS, $tank['y'] - 14 - sin($rad) * 20];
}
/* The velocity a seeker gains this step toward the nearest live rival (a
// point 12 px above its hull), or null when there is none to steer at.
// src/sim.ts steerShell() is the same. [dvx, dvy]. */
function room_seek_push(array $tanks, int $ownerIdx, float $sx, float $sy, float $steer, float $dt): ?array
{
    $best = null;
    $bd = INF;
    foreach ($tanks as $idx => $t) {
        if ($t['hp'] <= 0 || $idx === $ownerIdx) {
            continue;
        }
        $d = hypot($t['x'] - $sx, ($t['y'] - 12) - $sy);
        if ($d < $bd) {
            $bd = $d;
            $best = $t;
        }
    }
    if ($best === null || $bd <= 1) {
        return null;
    }
    $push = $steer * $dt;
    return [(($best['x'] - $sx) / $bd) * $push, ((($best['y'] - 12) - $sy) / $bd) * $push];
}
/* The bomblets a cluster blooms into: $n velocities fanned $fan radians
// apart around the parent's heading, at 85% of its speed. src/sim.ts
// splitShell() is the same. [[vx, vy], ...]. */
function room_split_vel(float $vx, float $vy, int $n, float $fan): array
{
    $sp = hypot($vx, $vy) * 0.85;
    $base = atan2($vy, $vx);
    $out = [];
    for ($k = 0; $k < $n; $k++) {
        $ca = $base + ($k - ($n - 1) / 2) * $fan;
        $out[] = [cos($ca) * $sp, sin($ca) * $sp];
    }
    return $out;
}
/* Rollers. A roller that touches down does not burst: it rolls along the
// ground, a ball ROOM_ROLL_LIFT px above the surface, until it reaches a unit,
// runs off the board, comes to rest, or has rolled the weapon's rollTime. Wind
// does not touch it. src/sim.ts groundAt() .. rollOut() are the same. */
const ROOM_ROLL_LIFT = 3.0; // px the ball's centre rides above the ground
const ROOM_ROLL_KEEP = 0.7; // share of its speed along the ground that survives touching down
const ROOM_ROLL_DRAG = 10.0; // px/s^2: the ground's constant drag on a rolling ball, besides the weapon's friction
const ROOM_ROLL_STOP = 12.0; // px/s: slower than this, and ...
const ROOM_ROLL_STATIC = 20.0; // px/s^2: ... pulled by less than this, it stays put
/* The ground's height at a (fractional) column: linear between the columns. */
function room_ground_at(array $terrain, float $x): float
{
    $n = count($terrain);
    $xc = max(0.0, min((float) ($n - 1), $x));
    $i = (int) floor($xc);
    $j = min($i + 1, $n - 1);
    return $terrain[$i] + ($terrain[$j] - $terrain[$i]) * ($xc - $i);
}
/* The ground's slope dy/dx at x (positive: it falls away toward the right), over +-3 px. */
function room_ground_slope(array $terrain, float $x): float
{
    return (room_ground_at($terrain, $x + 3) - room_ground_at($terrain, $x - 3)) / 6;
}
/* A touching-down shell's speed along the ground at x, from its velocity. */
function room_roll_start(array $terrain, float $x, float $vx, float $vy): float
{
    $m = room_ground_slope($terrain, $x);
    return (($vx + $vy * $m) / sqrt(1 + $m * $m)) * ROOM_ROLL_KEEP;
}
/* One rolling step: downhill pulls it on (gravity along the slope), friction
// (and the ground's constant drag) slow it. $x moves; $u is its speed along the ground. False once it has
// come to rest. */
function room_roll_step(array $terrain, float &$x, float &$u, float $friction, float $dt): bool
{
    $m = room_ground_slope($terrain, $x);
    $n = sqrt(1 + $m * $m);
    $a = ROOM_GRAV * $m / $n;
    $u += $a * $dt;
    $u -= $u * $friction * $dt;
    $drag = ROOM_ROLL_DRAG * $dt;
    $u = abs($u) <= $drag ? 0.0 : $u - ($u > 0 ? 1.0 : -1.0) * $drag;
    if (abs($u) < ROOM_ROLL_STOP && abs($a) <= ROOM_ROLL_STATIC) {
        $u = 0.0;
        return false;
    }
    $x += $u / $n * $dt;
    return true;
}
/* Where a shell touching down at $x with velocity ($vx, $vy) ends its roll
// with no unit in the way: [x, y] at rest, off the board edge, or when its
// time is up. */
function room_roll_out(array $terrain, float $x, float $vx, float $vy, array $w): array
{
    $n = count($terrain);
    $x = max(0.0, min((float) ($n - 1), $x));
    $u = room_roll_start($terrain, $x, $vx, $vy);
    $steps = (int) round(($w['rollTime'] ?: 5.0) * 60);
    for ($i = 0; $i < $steps; $i++) {
        if ($x <= 0 || $x >= $n - 1) {
            break;
        }
        if (!room_roll_step($terrain, $x, $u, (float) ($w['friction'] ?: 0.3), 1 / 60)) {
            break;
        }
    }
    $x = max(0.0, min((float) ($n - 1), $x));
    return [$x, room_ground_at($terrain, $x)];
}
/* Full trajectory; returns landing info. Mirrors src/sim.ts simShot. A
// roller's landing is where its roll ends. */
function room_sim_shot(array $terrain, float $wind, float $x, float $y, float $angle, float $power, string $wkey, int $dirS, int $w): array
{
    $weapons = room_weapons();
    $flat = !empty($weapons[$wkey]['flat']);
    $rad = deg2rad($angle);
    $vx = cos($rad) * room_shot_speed($power, $flat, (float) ($weapons[$wkey]['speed'] ?? 1.0)) * $dirS;
    $vy = -sin($rad) * room_shot_speed($power, $flat, (float) ($weapons[$wkey]['speed'] ?? 1.0));
    $grav = $flat ? (float) ROOM_FLAT_GRAV : (float) ROOM_GRAV;
    $dt = 1 / 60;
    for ($i = 0; $i < 720; $i++) {
        $vx += $wind * ROOM_TURN_WIND * $dt;
        $vy += $grav * $dt;
        $x += $vx * $dt;
        $y += $vy * $dt;
        if ($x < 0 || $x >= $w || $y >= 500) {
            return ['x' => $x, 'y' => $y, 'oob' => true];
        }
        $xi = max(0, min($w - 1, (int) round($x)));
        if ($i >= 6 && $y >= $terrain[$xi]) { // the real flight ignores ground for its first 0.1 s
            if (($weapons[$wkey]['effect'] ?? 'shot') === 'roller') {
                [$rx, $ry] = room_roll_out($terrain, $x, $vx, $vy, $weapons[$wkey]);
                return ['x' => $rx, 'y' => $ry, 'oob' => false];
            }
            return ['x' => $x, 'y' => $y, 'oob' => false];
        }
    }
    return ['x' => $x, 'y' => $y, 'oob' => true];
}
/* The ground changed (a crater, a new round): clients holding an older
   terrainRev must be sent the hills again. Rooms stored before the counter
   existed read as revision 1. */
function room_terrain_changed(array &$room): void
{
    $room['terrainRev'] = ($room['terrainRev'] ?? 1) + 1;
}
function room_explode(array &$room, array &$events, array $tank, string $wkey, float $x, float $y, ?int $directIdx, $ov = null): void
{
    $weapons = room_weapons();
    $w = $weapons[$wkey] ?? $weapons['shell'];
    $dmg0 = (int) (($ov !== null && isset($ov['dmg'])) ? $ov['dmg'] : $w['dmg']);
    $r = (float) (($ov !== null && isset($ov['radius'])) ? $ov['radius'] : $w['radius']);
    $width = count($room['terrain']);
    $x0 = max(0, (int) floor($x - $r));
    $x1 = min($width - 1, (int) ceil($x + $r));
    $carved = false;
    for ($ix = $x0; $ix <= $x1; $ix++) {
        $dx = $ix - $x;
        $cut = sqrt(max(0.0, $r * $r - $dx * $dx)) * 0.75;
        $was = $room['terrain'][$ix];
        $room['terrain'][$ix] = min(456.0, max($was, $y + $cut));
        if ($room['terrain'][$ix] !== $was) {
            $carved = true;
        }
    }
    if ($carved) {
        room_terrain_changed($room);
    }
    $ownerIdx = null;
    foreach ($room['tanks'] as $i => $o) {
        if ($o['seat'] === $tank['seat']) {
            $ownerIdx = $i;
        }
    }
    foreach ($room['tanks'] as $idx => &$t) {
        if ($t['hp'] <= 0) {
            continue;
        }
        // Distance from the unit's body (its hit box centre), drone or tank.
        [$cx, $cy] = room_unit_box($t);
        $d = hypot($cx - $x, $cy - $y);
        if ($d > $r + 14) {
            continue;
        }
        // A shield absorbs one hit whole, then it is gone.
        if ($t['kind'] === 'human' && ($room['shield'][$t['seat']] ?? false)) {
            $room['shield'][$t['seat']] = false;
            $events[] = ['t' => 'shield', 'seat' => $t['seat'], 'by' => $tank['seat']];
            continue;
        }
        $dmg = (int) round($dmg0 * max(0.3, 1 - $d / ($r + 14)));
        if ($directIdx !== null && $directIdx === $idx) {
            $dmg *= 2;
        }
        // A bunker halves everything that gets through.
        if ($t['kind'] === 'human' && ($room['bunker'][$t['seat']] ?? 0) > 0) {
            $dmg = max(1, (int) round($dmg / 2));
        }
        $t['hp'] = max(0, $t['hp'] - $dmg);
        if (($w['effect'] ?? 'shot') === 'emp') {
            $t['fuel'] = max(0.0, ($t['fuel'] ?? 0.0) - (float) ($w['drain'] ?? 0));
        }
        $events[] = ['t' => 'hit', 'seat' => $t['seat'], 'dmg' => $dmg, 'by' => $tank['seat'], 'direct' => $directIdx === $idx];
        if ($ownerIdx !== null && $ownerIdx !== $idx) {
            $t['lastHitBy'] = $ownerIdx; // a drone's avenger and the shooter's dry spell read these
            $room['tanks'][$ownerIdx]['dealt'] = true;
            if ($t['hp'] <= 0) {
                $room['tanks'][$ownerIdx]['kills'] = ($room['tanks'][$ownerIdx]['kills'] ?? 0) + 1;
            }
        }
        if ($tank['kind'] === 'human' && $t['kind'] === 'ai') {
            $room['scores'][$tank['seat']] = ($room['scores'][$tank['seat']] ?? 0) + $dmg * 2;
            $room['cash'][$tank['seat']] = ($room['cash'][$tank['seat']] ?? 0) + $dmg * 2;
        }
        if ($t['hp'] <= 0) {
            $events[] = ['t' => 'kill', 'seat' => $t['seat'], 'by' => $tank['seat']];
            if ($tank['kind'] === 'human' && $t['kind'] === 'ai') {
                $room['scores'][$tank['seat']] = ($room['scores'][$tank['seat']] ?? 0) + 300;
                $room['cash'][$tank['seat']] = ($room['cash'][$tank['seat']] ?? 0) + 300;
            }
            // Last stand: the wreck itself detonates, once. The flag is
            // spent first so chained wrecks terminate.
            if ($t['kind'] === 'human' && ($room['laststand'][$t['seat']] ?? false)) {
                $room['laststand'][$t['seat']] = false;
                $events[] = ['t' => 'laststand', 'seat' => $t['seat']];
                $gone = $t;
                $ls = room_gear('laststand') ?? [];
                $blast = ['dmg' => (int) ($ls['dmg'] ?? 50), 'radius' => (float) ($ls['radius'] ?? 44)];
                room_explode($room, $events, $gone, 'shell', (float) $t['x'], (float) $t['y'] - 12.0, null, $blast);
            }
        }
    }
    unset($t);
}
/* One ballistic arc: integrate until impact, fizzle, fuse-split, or a
// proximity burst. Returns [status, x, y, vx, vy, directIdx]; cluster
// parents return 'split' with the bloom point instead of exploding.
// Mirrors the stepShells effect hooks in src/sim.ts. */
/* Replay timing: every event a volley makes carries 'at', seconds after the
   volley fires, so clients play the turn back at the speed it happened. */
const ROOM_PATH_EVERY = 5; // record one path point per 5 sim steps (12 per second)
function room_stamp(array &$events, int $from, float $at): void
{
    for ($i = $from, $n = count($events); $i < $n; $i++) {
        if (!isset($events[$i]['at'])) {
            $events[$i]['at'] = round($at, 3);
        }
    }
}
/* The shot event clients replay: launch time, landing time, blast radius,
   and the flight path as "x,y x,y ..." (compact in shared memory). */
function room_shot_event(array $tank, string $wkey, float $t0, array $res, float $radius): array
{
    return ['t' => 'shot', 'by' => $tank['seat'], 'w' => $wkey,
        'x0' => round($res[6][0][0] ?? $res[1], 1), 'y0' => round($res[6][0][1] ?? $res[2], 1),
        'x1' => round($res[1], 1), 'y1' => round($res[2], 1),
        't0' => round($t0, 3), 't1' => round($t0 + $res[7], 3), 'r' => $radius,
        'p' => implode(' ', array_map(fn($pt) => round($pt[0]) . ',' . round($pt[1]), $res[6]))];
}
/* Hit boxes match what clients draw: a ground unit's hull and turret, or a
// drone's body up in the air (src/sim.ts unitHitBox() is the same). An ellipse
// [cx, cy, rx, ry]. */
function room_unit_box(array $t): array
{
    return $t['kind'] === 'human'
        ? [(float) $t['x'], (float) $t['y'] - 10.0, 20.0, 13.0]
        : [(float) $t['x'], (float) $t['y'] - 30.0, 18.0, 14.0];
}
function room_in_box(array $t, float $x, float $y): bool
{
    [$cx, $cy, $rx, $ry] = room_unit_box($t);
    return (($x - $cx) / $rx) ** 2 + (($y - $cy) / $ry) ** 2 <= 1;
}
/* The first unit a shell touches anywhere along its step from (x0, y0) to
// (x1, y1), sampled every 3 px so a fast shell cannot skip through one, with
// the point it touched. The muzzle sits inside its gunner's box, so a shell
// ignores its owner until it has flown clear of that box ($clear turns true
// there); one that comes back hits it like anyone else. src/sim.ts sweepHit()
// is the same. */
function room_sweep_hit(array $room, float $x0, float $y0, float $x1, float $y1, ?int $skip, int $ownerIdx, bool &$clear): ?array
{
    $n = max(1, (int) ceil(hypot($x1 - $x0, $y1 - $y0) / 3));
    for ($i = 1; $i <= $n; $i++) {
        $px = $x0 + ($x1 - $x0) * $i / $n;
        $py = $y0 + ($y1 - $y0) * $i / $n;
        if (!$clear && !room_in_box($room['tanks'][$ownerIdx], $px, $py)) {
            $clear = true;
        }
        foreach ($room['tanks'] as $idx => $t) {
            if ($t['hp'] <= 0 || $idx === $skip || ($idx === $ownerIdx && !$clear)) {
                continue;
            }
            if (room_in_box($t, $px, $py)) {
                return [$idx, $px, $py];
            }
        }
    }
    return null;
}
/* The first unit a rolling shell touches along its step, with the point it
// touched. A ball on the ground cannot reach a drone hovering overhead, so a
// unit counts as touched when the ball is within the width of its hit box, at
// any height. The owner-clear rule is room_sweep_hit()'s.
// src/sim.ts rollHit() is the same. */
function room_roll_hit(array $room, float $x0, float $y0, float $x1, float $y1, int $ownerIdx, bool &$clear): ?array
{
    $n = max(1, (int) ceil(hypot($x1 - $x0, $y1 - $y0) / 3));
    for ($i = 1; $i <= $n; $i++) {
        $px = $x0 + ($x1 - $x0) * $i / $n;
        $py = $y0 + ($y1 - $y0) * $i / $n;
        if (!$clear && !room_in_box($room['tanks'][$ownerIdx], $px, $py)) {
            $clear = true;
        }
        foreach ($room['tanks'] as $idx => $t) {
            if ($t['hp'] <= 0 || ($idx === $ownerIdx && !$clear)) {
                continue;
            }
            if (room_in_box($t, $px, room_unit_box($t)[1])) {
                return [$idx, $px, $py];
            }
        }
    }
    return null;
}
function room_fly_arc(array &$room, array &$events, array $tank, array $w, string $wkey, int $ownerIdx, float $sx, float $sy, float $vx, float $vy, float $age, $fuse, $ov, float $t0 = 0.0): array
{
    $width = count($room['terrain']);
    $dt = 1 / 60;
    $path = [[$sx, $sy]];
    $grav = !empty($w['flat']) ? (float) ROOM_FLAT_GRAV : (float) ROOM_GRAV;
    $pierced = null; // the tank a lance went through, never hit twice
    $clear = false; // out of its gunner's box yet
    for ($step = 0; $step < 720; $step++) {
        if (($w['effect'] ?? 'shot') === 'seeker') {
            $dv = room_seek_push($room['tanks'], $ownerIdx, $sx, $sy, (float) ($w['steer'] ?? 70.0), $dt);
            if ($dv !== null) {
                $vx += $dv[0];
                $vy += $dv[1];
            }
        }
        $vx += $room['wind'] * ROOM_TURN_WIND * $dt;
        $vy += $grav * $dt;
        $px = $sx;
        $py = $sy;
        $sx += $vx * $dt;
        $sy += $vy * $dt;
        $age += $dt;
        if (($step + 1) % ROOM_PATH_EVERY === 0) {
            $path[] = [$sx, $sy];
        }
        $flown = ($step + 1) * $dt;
        if ($sx < -20 || $sx > $width + 20 || $sy > 500) {
            $path[] = [$sx, $sy];
            return ['oob', $sx, $sy, $vx, $vy, null, $path, $flown];
        }
        if ($fuse !== false && ($w['effect'] ?? 'shot') === 'cluster' && $age >= $fuse) {
            $path[] = [$sx, $sy];
            return ['split', $sx, $sy, $vx, $vy, null, $path, $flown];
        }
        $direct = null;
        $hit = room_sweep_hit($room, $px, $py, $sx, $sy, $pierced, $ownerIdx, $clear);
        if ($hit !== null) {
            // Burst where the shell touched the unit, not past it.
            [$direct, $sx, $sy] = $hit;
        }
        if ($direct === null && ($w['effect'] ?? 'shot') === 'proximity') {
            $bd = (float) ($w['prox'] ?? 34.0);
            foreach ($room['tanks'] as $idx => $t) {
                if ($t['hp'] <= 0 || $idx === $ownerIdx) {
                    continue;
                }
                $d = hypot($sx - $t['x'], $sy - ($t['y'] - 12));
                if ($d < $bd) {
                    $bd = $d;
                    $direct = $idx;
                }
            }
        }
        if ($direct !== null) {
            if (($w['effect'] ?? 'shot') === 'pierce' && $pierced === null) {
                $pierced = $direct;
                $mark = count($events);
                room_explode($room, $events, $tank, $wkey, $sx, $sy, $direct, $ov);
                $events[] = ['t' => 'burst', 'x' => round($sx, 1), 'y' => round($sy, 1), 'r' => (float) (($ov['radius'] ?? null) ?? $w['radius']), 'w' => $wkey];
                room_stamp($events, $mark, $t0 + $flown);
                continue;
            }
            $path[] = [$sx, $sy];
            return ['hit', $sx, $sy, $vx, $vy, $direct, $path, $flown];
        }
        $xi = max(0, min($width - 1, (int) round($sx)));
        if ($age >= 0.1 && $sy >= $room['terrain'][$xi]) {
            if (($w['effect'] ?? 'shot') === 'roller') {
                return room_roll_arc($room, $w, $ownerIdx, $sx, $vx, $vy, $clear, $path, $step + 1);
            }
            $path[] = [$sx, $sy];
            return ['hit', $sx, $sy, $vx, $vy, null, $path, $flown];
        }
    }
    return ['oob', $sx, $sy, $vx, $vy, null, $path, 720 * $dt];
}
/* A roller touched down at column $sx with velocity ($vx, $vy), $steps sim
// steps into its flight: roll it to its burst. Returns room_fly_arc's tuple
// ('hit' at the burst, the unit it touched or null, the path so far plus the
// rolling points, seconds flown). */
function room_roll_arc(array $room, array $w, int $ownerIdx, float $sx, float $vx, float $vy, bool $clear, array $path, int $steps): array
{
    $terrain = $room['terrain'];
    $width = count($terrain);
    $dt = 1 / 60;
    $sx = max(0.0, min((float) ($width - 1), $sx));
    $u = room_roll_start($terrain, $sx, $vx, $vy);
    $sy = room_ground_at($terrain, $sx) - ROOM_ROLL_LIFT;
    $path[] = [$sx, $sy];
    $limit = (int) round(($w['rollTime'] ?: 5.0) * 60);
    $friction = (float) ($w['friction'] ?: 0.3);
    $direct = null;
    for ($rt = 0; $rt < $limit && $sx > 0 && $sx < $width - 1; $rt++) {
        $px = $sx;
        $py = $sy;
        $moving = room_roll_step($terrain, $sx, $u, $friction, $dt);
        $steps++;
        $sy = room_ground_at($terrain, $sx) - ROOM_ROLL_LIFT;
        $m = room_ground_slope($terrain, $sx);
        $vx = $u / sqrt(1 + $m * $m);
        $vy = $vx * $m;
        $hit = room_roll_hit($room, $px, $py, $sx, $sy, $ownerIdx, $clear);
        if ($hit !== null) {
            [$direct, $sx, ] = $hit;
        }
        if ($hit !== null || !$moving) {
            break;
        }
        if ($steps % ROOM_PATH_EVERY === 0) {
            $path[] = [$sx, $sy];
        }
    }
    $bx = max(0.0, min((float) ($width - 1), $sx));
    $by = room_ground_at($terrain, $bx);
    $path[] = [$bx, $by];
    return ['hit', $bx, $by, $vx, $vy, $direct, $path, $steps * $dt];
}
/* Tanks ride the terrain down after craters (server side, snapped). */
function room_settle_tanks(array &$room): void
{
    $w = count($room['terrain']);
    if (!$w) {
        return;
    }
    foreach ($room['tanks'] as &$t) {
        if ($t['hp'] <= 0) {
            continue;
        }
        $xi = max(0, min($w - 1, (int) round($t['x'])));
        $t['y'] = $room['terrain'][$xi];
    }
    unset($t);
}
