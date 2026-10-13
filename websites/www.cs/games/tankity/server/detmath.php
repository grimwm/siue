<?php
// Operation Tankity rooms. sin, cos, atan2 and Math.round for the simulation, the
// same to the last bit as src/detmath.ts: only + - * / and floor on decimal
// constants both languages parse alike (fdlibm's kernels after a Cody-Waite
// reduction by pi/2). Loaded by rooms.php; it runs nothing on its own.
declare(strict_types=1);

// Not an endpoint: rooms.php defines this constant, then requires the file.
if (!defined('TANKITY_ROOMS_INCLUDED')) {
    http_response_code(404);
    exit;
}

const DET_PI = 3.141592653589793;
const DET_PIO2 = 1.5707963267948966;
const DET_INV_PIO2 = 6.36619772367581382433e-01;
const DET_PIO2_1 = 1.57079632673412561417e+00;
const DET_PIO2_1T = 6.07710050650619224932e-11;
const DET_S = [-1.66666666666666324348e-01, 8.33333333332248946124e-03, -1.98412698298579493134e-04,
    2.75573137070700676789e-06, -2.50507602534068634195e-08, 1.58969099521155010221e-10];
const DET_C = [4.16666666666666019037e-02, -1.38888888888741095749e-03, 2.48015872894767294178e-05,
    -2.75573143513906633035e-07, 2.08757232129817482790e-09, -1.13596475577881948265e-11];
const DET_AT = [3.33333333333329318027e-01, -1.99999999998764832476e-01, 1.42857142725034663711e-01, -1.11111104054623557880e-01,
    9.09088713343650656196e-02, -7.69187620504482999495e-02, 6.66107313738753120669e-02, -5.83357013379057348645e-02,
    4.97687799461593236017e-02, -3.65315727442169155270e-02, 1.62858201153657823623e-02];
const DET_ATAN_HI = [4.63647609000806093515e-01, 7.85398163397448278999e-01, 9.82793723247329054082e-01, 1.57079632679489655800e+00];
const DET_ATAN_LO = [2.26987774529616870924e-17, 3.06161699786838301793e-17, 1.39033110312309984516e-17, 6.12323399573676603587e-17];

/* JavaScript's Math.round: a half goes toward +infinity (PHP's round() takes
   it away from zero), and a result of zero from a negative x is -0. */
function det_round(float $x): float
{
    $f = floor($x);
    $r = $x - $f >= 0.5 ? $f + 1.0 : $f;
    return ($r == 0.0 && $x < 0.0) ? -0.0 : $r;
}

function det_ksin(float $x): float
{
    [$s1, $s2, $s3, $s4, $s5, $s6] = DET_S;
    $z = $x * $x;
    $v = $z * $x;
    $r = $s2 + $z * ($s3 + $z * ($s4 + $z * ($s5 + $z * $s6)));
    return $x + $v * ($s1 + $z * $r);
}

function det_kcos(float $x): float
{
    [$c1, $c2, $c3, $c4, $c5, $c6] = DET_C;
    $z = $x * $x;
    $r = $z * ($c1 + $z * ($c2 + $z * ($c3 + $z * ($c4 + $z * ($c5 + $z * $c6)))));
    $hz = 0.5 * $z;
    $w = 1.0 - $hz;
    return $w + (((1.0 - $w) - $hz) + $z * $r);
}

/* [quadrant 0-3, remainder in [-pi/4, pi/4]]. The quadrant stays a float (k
   mod 4 by floor): an (int) cast of a huge k is not JavaScript's & 3. */
function det_reduce(float $x): array
{
    $k = floor($x * DET_INV_PIO2 + 0.5);
    return [$k - 4.0 * floor($k * 0.25), ($x - $k * DET_PIO2_1) - $k * DET_PIO2_1T];
}

function det_sin(float $x): float
{
    if ($x == 0.0) {
        return $x; // keeps -0, as Math.sin does
    }
    [$q, $r] = det_reduce($x);
    return match ($q) { 0.0 => det_ksin($r), 1.0 => det_kcos($r), 2.0 => -det_ksin($r), default => -det_kcos($r) };
}

function det_cos(float $x): float
{
    [$q, $r] = det_reduce($x);
    return match ($q) { 0.0 => det_kcos($r), 1.0 => -det_ksin($r), 2.0 => -det_kcos($r), default => det_ksin($r) };
}

function det_atan(float $x): float
{
    if ($x == 0.0) {
        return $x; // keeps -0, as Math.atan does
    }
    $t = $x < 0 ? -$x : $x;
    $id = -1;
    if ($t >= 0.4375) {
        if ($t < 0.6875) {
            $id = 0;
            $t = (2.0 * $t - 1.0) / (2.0 + $t);
        } elseif ($t < 1.1875) {
            $id = 1;
            $t = ($t - 1.0) / ($t + 1.0);
        } elseif ($t < 2.4375) {
            $id = 2;
            $t = ($t - 1.5) / (1.0 + 1.5 * $t);
        } else {
            $id = 3;
            $t = -1.0 / $t;
        }
    }
    $a = DET_AT;
    $z = $t * $t;
    $w = $z * $z;
    $s1 = $z * ($a[0] + $w * ($a[2] + $w * ($a[4] + $w * ($a[6] + $w * ($a[8] + $w * $a[10])))));
    $s2 = $w * ($a[1] + $w * ($a[3] + $w * ($a[5] + $w * ($a[7] + $w * $a[9]))));
    $r = $id < 0 ? $t - $t * ($s1 + $s2) : DET_ATAN_HI[$id] - (($t * ($s1 + $s2) - DET_ATAN_LO[$id]) - $t);
    return $x < 0 ? -$r : $r;
}

// y = -0.0 with x < 0 gives +π, unlike libm's -π: `$y >= 0` holds for -0.0. src/detmath.ts does the same, and the sim never aims from -0.
function det_atan2(float $y, float $x): float
{
    if ($x > 0) {
        return det_atan($y / $x);
    }
    if ($x < 0) {
        return $y >= 0 ? det_atan($y / $x) + DET_PI : det_atan($y / $x) - DET_PI;
    }
    return $y > 0 ? DET_PIO2 : ($y < 0 ? -DET_PIO2 : 0.0);
}
