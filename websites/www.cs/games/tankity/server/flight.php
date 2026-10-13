<?php
// games/tankity/server/flight.php
// A volley as the browser's solo war flies it, for the server's solo rounds:
// fixed steps, each dropping the tanks and then moving every shell, a volley's
// shells bursting in launch order. src/sim.ts stepShells/fallTanks and
// src/solo-play.ts flyVolley are the same, pinned by the volley-fall vectors.
declare(strict_types=1);

// Not an endpoint: rooms.php defines this constant, then requires the file.
if (!defined('TANKITY_ROOMS_INCLUDED')) {
    http_response_code(404);
    exit;
}

const FLIGHT_STEP = 1 / 60; // src/solo.ts SOLO_STEP
const FLIGHT_FALL_GRAVITY = 700.0; // src/sim.ts FALL_GRAVITY
const FLIGHT_MAX_STEPS = 20000; // src/solo-play.ts FLIGHT_MAX_STEPS

/* The ground under x: src/sim.ts surfY (det_round is Math.round to the bit). */
function flight_surf(array $terrain, float $x): float
{
    $xi = max(0, min(count($terrain) - 1, (int) det_round($x)));
    return (float) $terrain[$xi];
}

/* src/sim.ts fireWeapon's launch: one shell per pellet, fanned by the spread. */
function flight_launch(array &$s, int $idx, string $wkey): void
{
    $t = $s['tanks'][$idx];
    $w = room_weapons()[$wkey];
    [$mx, $my] = room_muzzle($t);
    $r0 = deg2rad((float) $t['angle']);
    $dirS = $t['dirS'] ?? -1;
    $shots = (int) (($w['pellets'] ?? 0) ?: 1);
    $reach = room_field_reach(count($s['terrain']));
    $spd = room_shot_speed((float) $t['power'], !empty($w['flat']), (float) (($w['speed'] ?? 0) ?: 1.0), $reach);
    for ($i = 0; $i < $shots; $i++) {
        $off = $shots === 1 ? 0.0 : ($i - ($shots - 1) / 2) * (float) ($w['spread'] ?? 0.0);
        $a = $r0 + $off;
        $s['shells'][] = ['x' => $mx, 'y' => $my, 'vx' => det_cos($a) * $spd * $dirS, 'vy' => -det_sin($a) * $spd, 'w' => $wkey, 'owner' => $idx,
            // A flight lasts as long as the field is wide.
            'life' => 12.0 * $reach, 'age' => 0.0, 'pierced' => null, 'split' => false, 'order' => [$i], 'dead' => false, 'clear' => false,
            'dw' => null, 'dr' => null, 'rolling' => false, 'ru' => 0.0, 'rt' => 0];
    }
}

/* src/sim.ts fallTanks: a tank above the ground falls under gravity until it lands. */
function flight_fall(array &$s, float $h): void
{
    foreach ($s['tanks'] as &$t) {
        if ($t['hp'] <= 0) {
            continue;
        }
        $gy = flight_surf($s['terrain'], (float) $t['x']);
        if ($t['y'] < $gy - 0.5) {
            $t['vy'] = ($t['vy'] ?? 0.0) + FLIGHT_FALL_GRAVITY * $h;
            $t['y'] = min($gy, $t['y'] + $t['vy'] * $h);
            if ($t['y'] >= $gy) {
                $t['vy'] = 0.0;
            }
        } else {
            $t['y'] = $gy;
            $t['vy'] = 0.0;
        }
    }
    unset($t);
}

function flight_falling(array $s): bool
{
    foreach ($s['tanks'] as $t) {
        if ($t['hp'] > 0 && $t['y'] < flight_surf($s['terrain'], (float) $t['x']) - 0.5) {
            return true;
        }
    }
    return false;
}

/* src/sim.ts waitsOnEarlier: a shell launched earlier in the same volley is still in the air. */
function flight_waits(array $s, int $k): bool
{
    $me = $s['shells'][$k];
    foreach ($s['shells'] as $j => $o) {
        if ($j === $k || $o['dead'] || $o['owner'] !== $me['owner']) {
            continue;
        }
        $n = min(count($me['order']), count($o['order']));
        for ($i = 0; $i < $n; $i++) {
            if ($o['order'][$i] !== $me['order'][$i]) {
                if ($o['order'][$i] < $me['order'][$i]) {
                    return true;
                }
                continue 2;
            }
        }
        if (count($o['order']) < count($me['order'])) {
            return true;
        }
    }
    return false;
}

/* src/sim.ts explode: the gunner's bracket learns where it burst, then the room blast. */
function flight_burst(array &$s, array $shell, float $x, float $y, ?int $direct, ?array $ov): void
{
    room_brk_land($s['tanks'][$shell['owner']], $x);
    $events = [];
    room_explode($s, $events, $s['tanks'][$shell['owner']], $shell['w'], $x, $y, $direct, $ov);
}

/* src/sim.ts stepRoller: one step of a ball on the ground. */
function flight_step_roller(array &$s, int $k, array $w, float $h): void
{
    $sh = $s['shells'][$k];
    $t = $s['terrain'];
    $n = count($t);
    $x0 = $sh['x'];
    $y0 = $sh['y'];
    $x = $sh['x'];
    $u = $sh['ru'];
    $done = $sh['rt'] >= (int) det_round((float) (($w['rollTime'] ?? 0) ?: 5.0) * 60) || $x <= 0 || $x >= $n - 1;
    $direct = null;
    if (!$done) {
        $moving = room_roll_step($t, $x, $u, (float) (($w['friction'] ?? 0) ?: 0.3), $h);
        $sh['rt']++;
        $sh['x'] = $x;
        $sh['ru'] = $u;
        $sh['y'] = room_ground_at($t, $x) - ROOM_ROLL_LIFT;
        $m = room_ground_slope($t, $x);
        $sh['vx'] = $u / sqrt(1 + $m * $m);
        $sh['vy'] = $sh['vx'] * $m;
        $done = !$moving;
        $clear = $sh['clear'];
        $hit = room_roll_hit($s, $x0, $y0, $sh['x'], $sh['y'], $sh['owner'], $clear);
        $sh['clear'] = $clear;
        if ($hit !== null) {
            $direct = $hit[0];
            $sh['x'] = $hit[1];
            $done = true;
        }
    }
    if (!$done) {
        $s['shells'][$k] = $sh;
        return;
    }
    $sh['dead'] = true;
    $s['shells'][$k] = $sh;
    $bx = max(0.0, min((float) ($n - 1), $sh['x']));
    flight_burst($s, $sh, $bx, room_ground_at($s['terrain'], $bx), $direct, null);
}

/* src/sim.ts stepShells: every shell one step. Bomblets born this step fly
   this step too; a shell that would burst while an earlier one of its volley
   is in the air holds where it was. */
function flight_step_shells(array &$s, float $h): void
{
    $weapons = room_weapons();
    $width = count($s['terrain']);
    $reach = room_field_reach($width);
    for ($k = 0; $k < count($s['shells']); $k++) {
        $sh = $s['shells'][$k];
        $w = $weapons[$sh['w']];
        $effect = $w['effect'] ?? 'shot';
        if ($sh['rolling']) {
            flight_step_roller($s, $k, $w, $h);
            continue;
        }
        $sh['age'] += $h;
        if ($effect === 'seeker') {
            $dv = room_seek_push($s['tanks'], $sh['owner'], $sh['x'], $sh['y'], (float) (($w['steer'] ?? 0) ?: 70.0), $h);
            if ($dv !== null) {
                $sh['vx'] += $dv[0];
                $sh['vy'] += $dv[1];
            }
        }
        $x0 = $sh['x'];
        $y0 = $sh['y'];
        $held = [$sh['vx'], $sh['vy'], $sh['age'] - $h, $sh['life'], $sh['clear']];
        $grav = !empty($w['flat']) ? (float) ROOM_FLAT_GRAV : (float) ROOM_GRAV;
        $sh['vx'] += $s['wind'] * ROOM_TURN_WIND * $h;
        $sh['vy'] += $grav * $h;
        $sh['x'] += $sh['vx'] * $h;
        $sh['y'] += $sh['vy'] * $h;
        $sh['life'] -= $h;
        if ($sh['life'] <= 0 || $sh['x'] < -20 || $sh['x'] > $width + 20 || $sh['y'] > 500) {
            $sh['dead'] = true;
            $s['shells'][$k] = $sh;
            continue;
        }
        if ($effect === 'cluster' && !$sh['split'] && $sh['age'] >= (float) (($w['fuse'] ?? 0) ?: 0.9)) {
            $sh['split'] = true;
            $sh['dead'] = true;
            $s['shells'][$k] = $sh;
            $n = max(2, (int) (($w['split'] ?? 0) ?: 4));
            foreach (room_split_vel($sh['vx'], $sh['vy'], $n, (float) (($w['fan'] ?? 0) ?: 0.22)) as $i => [$vx, $vy]) {
                $s['shells'][] = ['x' => $sh['x'], 'y' => $sh['y'], 'vx' => $vx, 'vy' => $vy, 'w' => $sh['w'], 'owner' => $sh['owner'],
                    'life' => 12.0 * $reach, 'age' => 0.0, 'pierced' => null, 'split' => true, 'order' => [...$sh['order'], $i], 'dead' => false, 'clear' => false,
                    'dw' => (int) (($w['subDmg'] ?? 0) ?: $w['dmg']), 'dr' => (float) (($w['subRadius'] ?? 0) ?: $w['radius']),
                    'rolling' => false, 'ru' => 0.0, 'rt' => 0];
            }
            continue;
        }
        $direct = null;
        $clear = $sh['clear'];
        $hit = room_sweep_hit($s, $x0, $y0, $sh['x'], $sh['y'], $sh['pierced'], $sh['owner'], $clear);
        $sh['clear'] = $clear;
        if ($hit !== null) {
            [$direct, $sh['x'], $sh['y']] = $hit;
        }
        if ($direct === null && $effect === 'proximity') {
            $bd = (float) (($w['prox'] ?? 0) ?: 34.0);
            foreach ($s['tanks'] as $i => $t) {
                if ($t['hp'] <= 0 || $i === $sh['owner']) {
                    continue;
                }
                $d = room_dist($sh['x'] - $t['x'], $sh['y'] - ($t['y'] - 12));
                if ($d < $bd) {
                    $bd = $d;
                    $direct = $i;
                }
            }
        }
        $grounded = ($sh['split'] || $sh['age'] >= 0.1) && $sh['y'] >= flight_surf($s['terrain'], $sh['x']);
        if (($direct !== null || ($grounded && $effect !== 'roller')) && flight_waits($s, $k)) {
            $sh['x'] = $x0;
            $sh['y'] = $y0;
            [$sh['vx'], $sh['vy'], $sh['age'], $sh['life'], $sh['clear']] = $held;
            $s['shells'][$k] = $sh;
            continue;
        }
        $ov = $sh['dw'] ? ['dmg' => $sh['dw'], 'radius' => $sh['dr']] : null;
        if ($direct !== null) {
            // A lance punches through its first victim and keeps flying.
            if ($effect === 'pierce' && $sh['pierced'] === null) {
                $sh['pierced'] = $direct;
            } else {
                $sh['dead'] = true;
            }
            $s['shells'][$k] = $sh;
            flight_burst($s, $sh, $sh['x'], $sh['y'], $direct, $ov);
            continue;
        }
        if ($grounded && $effect === 'roller') {
            $sh['rolling'] = true;
            $sh['rt'] = 0;
            $sh['x'] = max(0.0, min((float) ($width - 1), $sh['x']));
            $sh['ru'] = room_roll_start($s['terrain'], $sh['x'], $sh['vx'], $sh['vy']);
            $sh['y'] = room_ground_at($s['terrain'], $sh['x']) - ROOM_ROLL_LIFT;
            $s['shells'][$k] = $sh;
            continue;
        }
        if ($grounded) {
            $sh['dead'] = true;
            $s['shells'][$k] = $sh;
            flight_burst($s, $sh, $sh['x'], $sh['y'], null, $ov);
            continue;
        }
        $s['shells'][$k] = $sh;
    }
    $s['shells'] = array_values(array_filter($s['shells'], fn(array $x): bool => !$x['dead']));
}

/* The war's steps for one volley: each drops the tanks, then moves the shells;
   once the last shell is gone, steps drop the tanks until none is falling.
   $onStep sees the state after each step. Answers the steps taken. */
function flight_volley(array &$s, ?Closure $onStep = null): int
{
    $steps = 0;
    for (; ($s['shells'] ?? []) && $steps < FLIGHT_MAX_STEPS; $steps++) {
        flight_fall($s, FLIGHT_STEP);
        flight_step_shells($s, FLIGHT_STEP);
        if ($onStep !== null) {
            $onStep($s);
        }
    }
    for (; flight_falling($s) && $steps < FLIGHT_MAX_STEPS; $steps++) {
        flight_fall($s, FLIGHT_STEP);
        if ($onStep !== null) {
            $onStep($s);
        }
    }
    return $steps;
}
