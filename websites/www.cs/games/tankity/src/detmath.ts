/* Operation Tankity: sin, cos and atan2 for the simulation, computed the same
 * to the last bit in the browser and in PHP (server/detmath.php). Only + - * /
 * and Math.floor on decimal constants both languages parse alike: fdlibm's
 * kernels after a Cody-Waite reduction by pi/2. Rendering keeps Math.*. */

export const PI = 3.141592653589793;
const PIO2 = 1.5707963267948966;
const INV_PIO2 = 6.36619772367581382433e-01;
const PIO2_1 = 1.57079632673412561417e+00;
const PIO2_1T = 6.07710050650619224932e-11;

const S1 = -1.66666666666666324348e-01, S2 = 8.33333333332248946124e-03, S3 = -1.98412698298579493134e-04;
const S4 = 2.75573137070700676789e-06, S5 = -2.50507602534068634195e-08, S6 = 1.58969099521155010221e-10;
const C1 = 4.16666666666666019037e-02, C2 = -1.38888888888741095749e-03, C3 = 2.48015872894767294178e-05;
const C4 = -2.75573143513906633035e-07, C5 = 2.08757232129817482790e-09, C6 = -1.13596475577881948265e-11;

function ksin(x: number): number {
  const z = x * x, v = z * x;
  const r = S2 + z * (S3 + z * (S4 + z * (S5 + z * S6)));
  return x + v * (S1 + z * r);
}
function kcos(x: number): number {
  const z = x * x;
  const r = z * (C1 + z * (C2 + z * (C3 + z * (C4 + z * (C5 + z * C6)))));
  const hz = 0.5 * z, w = 1 - hz;
  return w + (((1 - w) - hz) + z * r);
}
/** x as k quarter turns plus a remainder in [-pi/4, pi/4]: [quadrant 0-3, remainder].
 *  The quadrant stays a float (k mod 4 by floor) so no integer conversion,
 *  which the two languages do differently for huge k, is involved. */
function reduce(x: number): [number, number] {
  const k = Math.floor(x * INV_PIO2 + 0.5);
  return [k - 4 * Math.floor(k * 0.25), (x - k * PIO2_1) - k * PIO2_1T];
}
export function dsin(x: number): number {
  if (x === 0) return x; // keeps -0, as Math.sin does
  const [q, r] = reduce(x);
  return q === 0 ? ksin(r) : q === 1 ? kcos(r) : q === 2 ? -ksin(r) : -kcos(r);
}
export function dcos(x: number): number {
  const [q, r] = reduce(x);
  return q === 0 ? kcos(r) : q === 1 ? -ksin(r) : q === 2 ? -kcos(r) : ksin(r);
}

const AT = [
  3.33333333333329318027e-01, -1.99999999998764832476e-01, 1.42857142725034663711e-01, -1.11111104054623557880e-01,
  9.09088713343650656196e-02, -7.69187620504482999495e-02, 6.66107313738753120669e-02, -5.83357013379057348645e-02,
  4.97687799461593236017e-02, -3.65315727442169155270e-02, 1.62858201153657823623e-02,
] as const;
const ATAN_HI = [4.63647609000806093515e-01, 7.85398163397448278999e-01, 9.82793723247329054082e-01, 1.57079632679489655800e+00] as const;
const ATAN_LO = [2.26987774529616870924e-17, 3.06161699786838301793e-17, 1.39033110312309984516e-17, 6.12323399573676603587e-17] as const;

export function datan(x: number): number {
  if (x === 0) return x; // keeps -0, as Math.atan does
  let t = x < 0 ? -x : x;
  let id = -1;
  if (t >= 0.4375) {
    if (t < 0.6875) { id = 0; t = (2 * t - 1) / (2 + t); }
    else if (t < 1.1875) { id = 1; t = (t - 1) / (t + 1); }
    else if (t < 2.4375) { id = 2; t = (t - 1.5) / (1 + 1.5 * t); }
    else { id = 3; t = -1 / t; }
  }
  const z = t * t, w = z * z;
  const s1 = z * (AT[0] + w * (AT[2] + w * (AT[4] + w * (AT[6] + w * (AT[8] + w * AT[10])))));
  const s2 = w * (AT[1] + w * (AT[3] + w * (AT[5] + w * (AT[7] + w * AT[9]))));
  const r = id < 0 ? t - t * (s1 + s2) : ATAN_HI[id]! - ((t * (s1 + s2) - ATAN_LO[id]!) - t);
  return x < 0 ? -r : r;
}
// Where it differs from Math.atan2: y = -0 with x < 0 gives +π (`y >= 0` holds for -0) where Math gives -π,
// and (±0, ±0) gives +0 where Math gives ±0 or ±π. The server does the same, and no outcome depends on either.
export function datan2(y: number, x: number): number {
  if (x > 0) return datan(y / x);
  if (x < 0) return y >= 0 ? datan(y / x) + PI : datan(y / x) - PI;
  return y > 0 ? PIO2 : y < 0 ? -PIO2 : 0;
}
