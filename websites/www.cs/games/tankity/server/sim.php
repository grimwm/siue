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
    $w = ROOM_W;
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
const ROOM_W = 720; // a room's field; a solo run's is dealt (src/field.ts) and checked here
const FIELD_W_MIN = 720;
const FIELD_W_MAX = 1440;
const FIELD_COL = 24;
const ROOM_FLIGHT_STEPS = 720; // a shell's longest flight on a room's field in 1/60 s steps (12 s), times room_field_reach() on a wider one; not a width

/* src/sim.ts fieldWidthOk(): an int in range on a whole column, else null.
   A solo deal refuses any width it returns null for. */
function room_field_width(mixed $w): ?int
{
    if (!is_int($w) || $w < FIELD_W_MIN || $w > FIELD_W_MAX || $w % FIELD_COL !== 0) {
        return null;
    }
    return $w;
}

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
/* A distance as the root of the squares (src/sim.ts dist()). */
function room_dist(float $dx, float $dy): float
{
    return sqrt($dx * $dx + $dy * $dy);
}
/* $b to a small whole power by repeated multiplication (src/sim.ts powi()). */
function room_powi(float $b, int $n): float
{
    $r = 1.0;
    for ($i = 0; $i < $n; $i++) {
        $r *= $b;
    }
    return $r;
}
function room_gauss(int &$a): float
{
    return (room_rng_next($a) + room_rng_next($a) + room_rng_next($a) - 1.5) * 2.0;
}
/* src/sim.ts drawHills(): the nine draws, in this order. */
function room_gen_hills(int &$rng): array
{
    $a = [20 + room_rng_next($rng) * 30, 10 + room_rng_next($rng) * 22, 5 + room_rng_next($rng) * 12];
    $p = [room_rng_next($rng) * 6.28, room_rng_next($rng) * 6.28, room_rng_next($rng) * 6.28];
    $f = [1 / 260 + room_rng_next($rng) / 500, 1 / 120 + room_rng_next($rng) / 260, 1 / 47 + room_rng_next($rng) / 120];
    return ['a' => $a, 'p' => $p, 'f' => $f];
}
/* src/sim.ts hillY() over columns 0..w-1. */
function room_hills_terrain(array $h, int $w): array
{
    [$a, $p, $f] = [$h['a'], $h['p'], $h['f']];
    $t = [];
    for ($x = 0; $x < $w; $x++) {
        $y = 330
            + $a[0] * det_sin($x * $f[0] + $p[0])
            + $a[1] * det_sin($x * $f[1] + $p[1])
            + $a[2] * det_sin($x * $f[2] + $p[2]);
        $t[$x] = max(190.0, min(415.0, $y));
    }
    return $t;
}
function room_hills_wire(array $h): array
{
    return array_merge($h['a'], $h['p'], $h['f']);
}
function room_gen_terrain(int &$rng, int $w): array
{
    return room_hills_terrain(room_gen_hills($rng), $w);
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
        $w[(string) $am['key']] = room_weapon_row($am);
    }
    if (!isset($w['shell'])) {
        $w['shell'] = room_weapon_row(['key' => 'shell', 'name' => 'Shell', 'dmg' => 34, 'radius' => 26, 'ai' => true, 'aiRound' => 1]);
    }
    return $w;
}
/* One ammo row of game.json as the sim reads it: every field a row may leave
// out gets the default src/sim.ts reads for it. */
function room_weapon_row(array $am): array
{
    return [
        'name' => (string) ($am['name'] ?? ($am['key'] ?? '')),
        'dmg' => (int) ($am['dmg'] ?? 30),
        'radius' => (int) ($am['radius'] ?? 24),
        'price' => (int) ($am['price'] ?? 0),
        'pack' => (int) ($am['pack'] ?? 0),
        'start' => (int) ($am['start'] ?? 0),
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
        'aiRack' => (int) ($am['aiRack'] ?? 2),
        'hops' => (int) ($am['hops'] ?? 1),
        'hopKeep' => (float) ($am['hopKeep'] ?? 0.5),
        'kick' => (float) ($am['kick'] ?? 150.0),
        'apex' => !empty($am['apex']),
    ];
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
/* src/sim.ts shotSpeed(): $reach is room_field_reach() of the field, exactly 1.0 on a room's. */
function room_shot_speed(float $power, bool $flat, float $mult = 1.0, float $reach = 1.0): float
{
    return ($flat ? 140.0 + $power * 3.2 : 40.0 + $power * 2.4) * $mult * $reach;
}
/* src/sim.ts fieldReach(): range and height grow by w / ROOM_W. */
function room_field_reach(int $w): float
{
    return sqrt($w / ROOM_W);
}
/* Where a shell leaves the barrel: 20 px along it, 14 px above the hull.
// src/sim.ts muzzle() is the same. [x, y]. */
function room_muzzle(array $tank): array
{
    $rad = deg2rad($tank['angle']);
    $dirS = $tank['dirS'] ?? -1;
    return [$tank['x'] + det_cos($rad) * 20 * $dirS, $tank['y'] - 14 - det_sin($rad) * 20];
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
        $d = room_dist($t['x'] - $sx, ($t['y'] - 12) - $sy);
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
    $sp = room_dist($vx, $vy) * 0.85;
    $base = det_atan2($vy, $vx);
    $out = [];
    for ($k = 0; $k < $n; $k++) {
        $ca = $base + ($k - ($n - 1) / 2) * $fan;
        $out[] = [det_cos($ca) * $sp, det_sin($ca) * $sp];
    }
    return $out;
}
/* The velocity a hop warhead leaps on with from its burst: forward as the
// last one flew, upward however it fell, both scaled by $keep. src/sim.ts
// hopShell() is the same. [vx, vy]. */
function room_hop_vel(float $vx, float $vy, float $keep): array
{
    return [$vx * $keep, -abs($vy) * $keep];
}
/* The bomblets a scatter weapon throws from its burst: $n velocities in a
// fixed fan $fan radians wide, centred straight up, bomblet $k leaving at
// $kick x (0.6 + 0.4 x ((5k mod n) / (n - 1))) px/s, so neighbours fly to
// different heights with no random numbers. src/sim.ts scatterShells() is the
// same. [[vx, vy], ...]. */
function room_scatter_vel(int $n, float $fan, float $kick): array
{
    $out = [];
    for ($k = 0; $k < $n; $k++) {
        $a = -M_PI / 2 + ($k - ($n - 1) / 2) * $fan / ($n - 1);
        $sp = $kick * (0.6 + 0.4 * (($k * 5) % $n) / ($n - 1));
        $out[] = [det_cos($a) * $sp, det_sin($a) * $sp];
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
/* Everything room_sim_flight reads from a gun, as one string: guns with the
 * same key fly the same planning arc from the same muzzle, so the drones search
 * one of them (ai.php room_ai_arc_guns). A field the flight starts to read
 * belongs here too; test/php/AiArcsTest.php changes every field of every gun
 * to catch one that is missing. src/sim.ts flightKey is the same. */
function room_flight_key(array $def): string
{
    $roll = ($def['effect'] ?? 'shot') === 'roller';
    $nums = [(float) ($def['speed'] ?? 1.0), $roll ? (float) (($def['friction'] ?? 0.3) ?: 0.3) : 0.0,
        $roll ? (float) (($def['rollTime'] ?? 5.0) ?: 5.0) : 0.0];
    foreach ($nums as $v) {
        if (!is_finite($v)) {
            throw new InvalidArgumentException('a gun\'s flight field is not a finite number');
        }
    }
    $nums = array_map(fn(float $v): float => $v == 0.0 ? 0.0 : $v, $nums); // -0 flies as 0, and JSON.stringify writes it 0
    // %.17g writes every double exactly whatever serialize_precision says, so two guns that differ never share a key.
    return (!empty($def['flat']) ? 'flat' : 'arc') . ($roll ? ' roll ' : ' fly ') . implode(' ', array_map(fn(float $v): string => sprintf('%.17g', $v), $nums));
}
/* Full trajectory; returns landing info. Mirrors src/sim.ts simShot. A
// roller's landing is where its roll ends. $top is the highest ground (the
// least terrain y): above it a shell cannot touch down, so the search skips
// the ground lookup there. */
function room_sim_shot(array $terrain, float $wind, float $x, float $y, float $angle, float $power, string $wkey, int $dirS, int $w, float $top = -INF): array
{
    return room_sim_flight($terrain, $wind, $x, $y, $angle, $power, room_weapons()[$wkey] ?? [], $dirS, $w, $top);
}
/* Planning flights flown so far ($add counts more): a drone turn's cost, which test/php/AiArcsTest.php holds to a budget. */
function room_sim_flights(int $add = 0): int
{
    static $n = 0;
    $n += $add;
    return $n;
}
/* room_sim_shot for a gun's definition rather than its key. */
function room_sim_flight(array $terrain, float $wind, float $x, float $y, float $angle, float $power, array $def, int $dirS, int $w, float $top = -INF): array
{
    room_sim_flights(1);
    $flat = !empty($def['flat']);
    $rad = deg2rad($angle);
    $vx = det_cos($rad) * room_shot_speed($power, $flat, (float) ($def['speed'] ?? 1.0), room_field_reach($w)) * $dirS;
    $vy = -det_sin($rad) * room_shot_speed($power, $flat, (float) ($def['speed'] ?? 1.0), room_field_reach($w));
    $grav = $flat ? (float) ROOM_FLAT_GRAV : (float) ROOM_GRAV;
    $dt = 1 / 60;
    // The drones' aim search runs this hundreds of times a turn: the per-step
    // products are formed once, in the same order, so every value is the same.
    $windStep = $wind * ROOM_TURN_WIND * $dt;
    $gravStep = $grav * $dt;
    $roller = ($def['effect'] ?? 'shot') === 'roller';
    for ($i = 0, $steps = (int) ceil(ROOM_FLIGHT_STEPS * room_field_reach($w)); $i < $steps; $i++) {
        $vx += $windStep;
        $vy += $gravStep;
        $x += $vx * $dt;
        $y += $vy * $dt;
        if ($x < 0 || $x >= $w || $y >= 500) {
            return ['x' => $x, 'y' => $y, 'oob' => true, 'vx' => $vx, 'vy' => $vy];
        }
        if ($i < 6 || $y < $top) { // the real flight ignores ground for its first 0.1 s
            continue;
        }
        $xi = $x < 0.5 ? 0 : ($x >= $w - 0.5 ? $w - 1 : (int) round($x));
        if ($y >= $terrain[$xi]) {
            if ($roller) {
                [$rx, $ry] = room_roll_out($terrain, $x, $vx, $vy, $def);
                return ['x' => $rx, 'y' => $ry, 'oob' => false, 'vx' => 0.0, 'vy' => 0.0];
            }
            return ['x' => $x, 'y' => $y, 'oob' => false, 'vx' => $vx, 'vy' => $vy];
        }
    }
    return ['x' => $x, 'y' => $y, 'oob' => true, 'vx' => $vx, 'vy' => $vy];
}
/* Where a cluster shot at (angle, power) splits, flown as the war flies it
// (its fuse, or the top of its arc with apex): [x, y, vx, vy], or null when it
// comes down or leaves the field first. src/sim.ts splitPoint() is the same. */
function room_split_point(array $terrain, float $wind, float $x, float $y, float $angle, float $power, string $wkey, int $dirS, int $w): ?array
{
    room_sim_flights(1);
    $def = room_weapons()[$wkey];
    $flat = !empty($def['flat']);
    $rad = deg2rad($angle);
    $vx = det_cos($rad) * room_shot_speed($power, $flat, (float) $def['speed'], room_field_reach($w)) * $dirS;
    $vy = -det_sin($rad) * room_shot_speed($power, $flat, (float) $def['speed'], room_field_reach($w));
    $grav = $flat ? (float) ROOM_FLAT_GRAV : (float) ROOM_GRAV;
    $dt = 1 / 60;
    $age = 0.0;
    for ($i = 0, $steps = (int) ceil(ROOM_FLIGHT_STEPS * room_field_reach($w)); $i < $steps; $i++) {
        $age += $dt;
        $vx += $wind * ROOM_TURN_WIND * $dt;
        $vy += $grav * $dt;
        $x += $vx * $dt;
        $y += $vy * $dt;
        if ($x < 0 || $x >= $w || $y >= 500) {
            return null;
        }
        if (!empty($def['apex']) ? $age >= 0.1 && $vy >= 0 : $age >= $def['fuse']) {
            return [$x, $y, $vx, $vy];
        }
        if ($i >= 6 && $y >= $terrain[$x < 0.5 ? 0 : ($x >= $w - 0.5 ? $w - 1 : (int) round($x))]) {
            return null;
        }
    }
    return null;
}
/* How long a munition leaving height $y0 at vertical speed $vy takes to come
// down to $groundY, with no wind (src/sim.ts dropTime()). */
function room_drop_time(float $y0, float $vy, float $groundY): float
{
    return (-$vy + sqrt(max(0.0, $vy * $vy + 2 * ROOM_GRAV * ($groundY - $y0)))) / ROOM_GRAV;
}
/* The ground changed (a crater, a new round): clients holding an older
   terrainRev must be sent the hills again. Rooms stored before the counter
   existed read as revision 1. */
function room_terrain_changed(array &$room): void
{
    $room['terrainRev'] = ($room['terrainRev'] ?? 1) + 1;
}
/* Damage by distance $d from a unit's body: full at the centre, falling to
// 30% at the edge of the reach (radius plus 14). src/sim.ts blastDamage(). */
function room_blast_damage(int $dmg, float $d, float $r): int
{
    return (int) round($dmg * max(0.3, 1 - $d / ($r + 14)));
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
    // A harmless burst (dmg 0) only carves: it touches no unit, so it spends
    // no shield and credits nobody.
    if ($dmg0 === 0) {
        return;
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
        $d = room_dist($cx - $x, $cy - $y);
        if ($d > $r + 14) {
            continue;
        }
        // A shield absorbs one hit whole, then it is gone.
        if ($t['kind'] === 'human' && ($room['shield'][$t['seat']] ?? false)) {
            $room['shield'][$t['seat']] = false;
            $events[] = ['t' => 'shield', 'seat' => $t['seat'], 'by' => $tank['seat']];
            continue;
        }
        $dmg = room_blast_damage($dmg0, $d, $r);
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
            if ($tank['kind'] === 'human' && $t['seat'] !== $tank['seat'] && isset($room['stats'][$tank['seat']])) {
                $room['stats'][$tank['seat']]['kills']++;
            }
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
    $u = ($x - $cx) / $rx;
    $v = ($y - $cy) / $ry;
    return $u * $u + $v * $v <= 1;
}
/* The first unit a shell touches anywhere along its step from (x0, y0) to
// (x1, y1), sampled every 3 px so a fast shell cannot skip through one, with
// the point it touched. The muzzle sits inside its gunner's box, so a shell
// ignores its owner until it has flown clear of that box ($clear turns true
// there); one that comes back hits it like anyone else. src/sim.ts sweepHit()
// is the same. */
function room_sweep_hit(array $room, float $x0, float $y0, float $x1, float $y1, ?int $skip, int $ownerIdx, bool &$clear): ?array
{
    $n = max(1, (int) ceil(room_dist($x1 - $x0, $y1 - $y0) / 3));
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
    $n = max(1, (int) ceil(room_dist($x1 - $x0, $y1 - $y0) / 3));
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
function room_fly_arc(array &$room, array &$events, array $tank, array $w, string $wkey, int $ownerIdx, float $sx, float $sy, float $vx, float $vy, float $age, $fuse, $ov, float $t0 = 0.0, ?int $skip = null): array
{
    $a = room_arc_start($sx, $sy, $vx, $vy, $age, $fuse, $skip);
    $steps = (int) ceil(ROOM_FLIGHT_STEPS * room_field_reach(count($room['terrain'])));
    while ($a['step'] < $steps) {
        $res = room_arc_step($room, $events, $tank, $w, $wkey, $ownerIdx, $a, $ov, $t0);
        if ($res !== null) {
            return $res;
        }
    }
    return room_arc_timeout($a, $steps);
}
/* A shell in flight, as room_arc_step moves it: where it is, its velocity
// and age, its fuse (false: none), the unit it may not hit directly (a
// lance's first victim, or the unit the burst that threw it struck), whether
// it has left its gunner's box, its recorded path and the steps flown. */
function room_arc_start(float $sx, float $sy, float $vx, float $vy, float $age, $fuse, ?int $skip): array
{
    return ['x' => $sx, 'y' => $sy, 'vx' => $vx, 'vy' => $vy, 'age' => $age, 'fuse' => $fuse, 'pierced' => $skip,
        'clear' => false, 'path' => [[$sx, $sy]], 'step' => 0];
}
/* An arc that flew its whole time without landing. */
function room_arc_timeout(array $a, int $steps): array
{
    return ['oob', $a['x'], $a['y'], $a['vx'], $a['vy'], null, $a['path'], $steps * (1 / 60)];
}
/* One 1/60 s step of an arc: null while it flies on, else how it ended:
// [status, x, y, vx, vy, directIdx, path, seconds flown], status 'hit' (a
// burst; a roller's after its roll), 'oob' or 'split' (a cluster parent at
// its bloom). Mirrors the stepShells effect hooks in src/sim.ts. */
function room_arc_step(array &$room, array &$events, array $tank, array $w, string $wkey, int $ownerIdx, array &$a, $ov, float $t0): ?array
{
    $width = count($room['terrain']);
    $dt = 1 / 60;
    $effect = $w['effect'] ?? 'shot';
    if ($effect === 'seeker') {
        $dv = room_seek_push($room['tanks'], $ownerIdx, $a['x'], $a['y'], (float) ($w['steer'] ?? 70.0), $dt);
        if ($dv !== null) {
            $a['vx'] += $dv[0];
            $a['vy'] += $dv[1];
        }
    }
    $grav = !empty($w['flat']) ? (float) ROOM_FLAT_GRAV : (float) ROOM_GRAV;
    $a['vx'] += $room['wind'] * ROOM_TURN_WIND * $dt;
    $a['vy'] += $grav * $dt;
    $px = $a['x'];
    $py = $a['y'];
    $a['x'] += $a['vx'] * $dt;
    $a['y'] += $a['vy'] * $dt;
    $a['age'] += $dt;
    $a['step']++;
    $step = $a['step'];
    if ($step % ROOM_PATH_EVERY === 0) {
        $a['path'][] = [$a['x'], $a['y']];
    }
    $flown = $step * $dt;
    if ($a['x'] < -20 || $a['x'] > $width + 20 || $a['y'] > 500) {
        $a['path'][] = [$a['x'], $a['y']];
        return ['oob', $a['x'], $a['y'], $a['vx'], $a['vy'], null, $a['path'], $flown];
    }
    // A cluster splits on its fuse; an apex cluster at the top of its arc (never before 0.1 s).
    if ($a['fuse'] !== false && $effect === 'cluster' && (!empty($w['apex']) ? $a['age'] >= 0.1 && $a['vy'] >= 0 : $a['age'] >= $a['fuse'])) {
        $a['path'][] = [$a['x'], $a['y']];
        return ['split', $a['x'], $a['y'], $a['vx'], $a['vy'], null, $a['path'], $flown];
    }
    $direct = null;
    $clear = $a['clear'];
    $hit = room_sweep_hit($room, $px, $py, $a['x'], $a['y'], $a['pierced'], $ownerIdx, $clear);
    $a['clear'] = $clear;
    if ($hit !== null) {
        // Burst where the shell touched the unit, not past it.
        [$direct, $a['x'], $a['y']] = $hit;
    }
    if ($direct === null && $effect === 'proximity') {
        $bd = (float) ($w['prox'] ?? 34.0);
        foreach ($room['tanks'] as $idx => $t) {
            if ($t['hp'] <= 0 || $idx === $ownerIdx) {
                continue;
            }
            $d = room_dist($a['x'] - $t['x'], $a['y'] - ($t['y'] - 12));
            if ($d < $bd) {
                $bd = $d;
                $direct = $idx;
            }
        }
    }
    if ($direct !== null) {
        if ($effect === 'pierce' && $a['pierced'] === null) {
            $a['pierced'] = $direct;
            // The bracket learns where the volley first burst, as src/sim.ts explode() does.
            room_brk_land($room['tanks'][$ownerIdx], $a['x']);
            $mark = count($events);
            room_explode($room, $events, $tank, $wkey, $a['x'], $a['y'], $direct, $ov);
            $events[] = ['t' => 'burst', 'x' => round($a['x'], 1), 'y' => round($a['y'], 1), 'r' => (float) (($ov['radius'] ?? null) ?? $w['radius']), 'w' => $wkey];
            room_stamp($events, $mark, $t0 + $flown);
            return null;
        }
        $a['path'][] = [$a['x'], $a['y']];
        return ['hit', $a['x'], $a['y'], $a['vx'], $a['vy'], $direct, $a['path'], $flown];
    }
    $xi = max(0, min($width - 1, (int) round($a['x'])));
    if ($a['age'] >= 0.1 && $a['y'] >= $room['terrain'][$xi]) {
        if ($effect === 'roller') {
            return room_roll_arc($room, $w, $ownerIdx, $a['x'], $a['vx'], $a['vy'], $a['clear'], $a['path'], $step);
        }
        $a['path'][] = [$a['x'], $a['y']];
        return ['hit', $a['x'], $a['y'], $a['vx'], $a['vy'], null, $a['path'], $flown];
    }
    return null;
}
/* Bomblets thrown together from (x, y) at $t seconds into the volley (a
// cluster's bloom, a scatter gun's throw), one per velocity in $vels: they fly
// side by side, step by step, and each bursts the step it lands, in list order
// within a step, against the ground the ones before it left. src/sim.ts
// stepShells is the same (a bomblet never waits for its siblings). Each is a
// 'shot' event of its own from $t. */
function room_fly_siblings(array &$room, array &$events, int $seatIdx, array $w, string $wkey, float $x, float $y, array $vels, float $age, array $sub, float $t, ?int $skip): void
{
    $arcs = [];
    foreach ($vels as [$vx, $vy]) {
        $arcs[] = room_arc_start($x, $y, $vx, $vy, $age, false, $skip);
    }
    $steps = (int) ceil(ROOM_FLIGHT_STEPS * room_field_reach(count($room['terrain'])));
    $live = array_keys($arcs);
    for ($s = 0; $s < $steps && $live; $s++) {
        foreach ($live as $i => $k) {
            $res = room_arc_step($room, $events, $room['tanks'][$seatIdx], $w, $wkey, $seatIdx, $arcs[$k], $sub, $t);
            if ($res !== null) {
                room_land_sibling($room, $events, $seatIdx, $wkey, $res, $sub, $t);
                unset($live[$i]);
            }
        }
    }
    foreach ($live as $k) {
        room_land_sibling($room, $events, $seatIdx, $wkey, room_arc_timeout($arcs[$k], $steps), $sub, $t);
    }
}
/* A bomblet's end: its shot event, then its burst (or a fizzle), stamped at its landing. */
function room_land_sibling(array &$room, array &$events, int $seatIdx, string $wkey, array $res, array $sub, float $t): void
{
    $tank = $room['tanks'][$seatIdx];
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
    room_stamp($events, $mark, $t + $res[7]);
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
