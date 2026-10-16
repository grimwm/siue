<?php
// Operation Tankity rooms. The air a shell flies through: gravity, quadratic
// drag on its speed relative to the moving air, wind that grows with the
// height above the field's floor, and the side walls it meets (server/walls.php);
// and a missile's launch speed at each power. The
// same to the last bit as src/sim.ts (stepBallistic, missileTable): only + - *
// / and sqrt, which every engine rounds alike. Loaded by rooms.php (and by
// tools/game-json.php, which writes each missile's table into game.json); it
// runs nothing on its own.
declare(strict_types=1);

// Not an endpoint: rooms.php (or tools/game-json.php) defines its constant, then requires the file.
if (!defined('TANKITY_ROOMS_INCLUDED') && !defined('TANKITY_FLIGHT_TOOL')) {
    http_response_code(404);
    exit;
}

const ROOM_GRAV = 95;
const ROOM_W = 720; // a room's field; a solo run's is dealt (src/field.ts) and checked in sim.php
const ROOM_H = 460; // the field's height: its floor, which the wind's height counts from, is y = ROOM_H
/* src/sim.ts DRAG_K, AIR_SPEED, SHEAR_H: drag per px of a Shell (drag 1); the
   air's speed per unit of wind at SHEAR_H px above the field's floor, px/s. */
const ROOM_DRAG_K = 0.0012;
const ROOM_AIR_SPEED = 10;
const ROOM_SHEAR_H = 40;
/* src/sim.ts MISSILE_LOW, MISSILE_FULL and the bisection's rounds and span. */
const ROOM_MISSILE_LOW = 0.1;
const ROOM_MISSILE_FULL = 1.0;
const ROOM_MISSILE_WIND = 0.125; // the share of the wind's push a missile feels
const ROOM_MISSILE_ROUNDS = 40;
const ROOM_MISSILE_SLOW = 10;
const ROOM_MISSILE_FAST = 4000;

/* src/sim.ts airOf(): the wind's speed at ROOM_SHEAR_H (wind x ROOM_AIR_SPEED
   x sqrt(s)), the gun's drag scaled to the field (k) and the field's scale s =
   $fw / ROOM_W, and the field's walls ($fw apart; absent for None). A row with
   no drag flies at 1; a missile feels ROOM_MISSILE_WIND of the wind. */
function room_air(int $fw, float $wind, array $def, string $walls = 'none'): array
{
    $s = $fw / ROOM_W;
    $drag = (float) ($def['drag'] ?? 1.0);
    $air = ['wind' => $wind * ROOM_AIR_SPEED * sqrt($s) * (!empty($def['missile']) ? ROOM_MISSILE_WIND : 1.0), 'k' => ROOM_DRAG_K * $drag / $s, 's' => (float) $s];
    if ($walls !== 'none') {
        $air['walls'] = $walls;
        $air['fw'] = $fw;
    }
    return $air;
}

/* src/sim.ts shear(): (max($h, 1) / ROOM_SHEAR_H)^(3/16) by square roots alone. */
function room_shear(float $h): float
{
    $r = sqrt(sqrt(sqrt(sqrt(max($h, 1.0) / ROOM_SHEAR_H))));
    return $r * $r * $r;
}

/* src/sim.ts stepBallistic(): one step of $dt through $air, in place, then
   the walls the air carries (room_wall_step): what the step did at one. */
function room_step_ballistic(float &$x, float &$y, float &$vx, float &$vy, float $dt, array $air): int
{
    $px = $x;
    $py = $y;
    $rx = $vx;
    if ($air['wind'] != 0.0) {
        $rx -= $air['wind'] * room_shear((ROOM_H - $y) / $air['s']);
    }
    $ry = $vy;
    $d = $air['k'] * sqrt($rx * $rx + $ry * $ry);
    $vx -= $d * $rx * $dt;
    $vy += (ROOM_GRAV - $d * $ry) * $dt;
    $x += $vx * $dt;
    $y += $vy * $dt;
    return isset($air['walls']) ? room_wall_step($x, $y, $vx, $air['walls'], $air['fw'], $px, $py) : 0;
}

/* src/sim.ts calmRange45(): how far a 45-degree shot at speed $v flies on a
   room's field in calm air with drag $k, launch height back down to it, px. */
function room_calm_range45(float $v, float $k): float
{
    $a = deg2rad(45.0);
    $x = 0.0;
    $y = 0.0;
    $vx = det_cos($a) * $v;
    $vy = -det_sin($a) * $v;
    $air = ['wind' => 0.0, 'k' => $k, 's' => 1.0];
    for ($i = 0; $i < 6000; $i++) {
        $px = $x;
        $py = $y;
        room_step_ballistic($x, $y, $vx, $vy, 1 / 60, $air);
        if ($y >= 0 && $vy > 0) {
            return $px + ($x - $px) * -$py / ($y - $py);
        }
    }
    return $x;
}

/* src/sim.ts missileTable(): a missile's launch speed (px/s on a room's field)
   at each whole power 0..100, for drag factor $drag. */
function room_missile_table(float $drag): array
{
    $k = ROOM_DRAG_K * $drag;
    $out = [];
    for ($p = 0; $p <= 100; $p++) {
        $goal = max(ROOM_MISSILE_LOW, $p / 100) * ROOM_MISSILE_FULL * ROOM_W;
        $lo = (float) ROOM_MISSILE_SLOW;
        $hi = (float) ROOM_MISSILE_FAST;
        for ($i = 0; $i < ROOM_MISSILE_ROUNDS; $i++) {
            $mid = ($lo + $hi) / 2;
            if (room_calm_range45($mid, $k) < $goal) {
                $lo = $mid;
            } else {
                $hi = $mid;
            }
        }
        $out[] = ($lo + $hi) / 2;
    }
    return $out;
}
