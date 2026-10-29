/* The Island of Crete, modern look: the fixed-pitch camera as pure maths. The view turns about the vertical
 * axis and slides over the board; it never tilts or zooms. The board is centred at the origin, one cell is
 * one unit, and cell (r, c) sits at x = c - (cols - 1) / 2, z = r - (rows - 1) / 2. DOM-free. */

export const PITCH = 45;
export const DEFAULT_YAW = 15;

export interface Cam {
  yaw: number;
  tx: number;
  tz: number;
}

const SIN_PITCH = Math.sin((PITCH * Math.PI) / 180);

/** Ease `cur` toward `goal` in place; true while it is still moving. `snap` (reduced motion) jumps at once. */
export function easeCam(cur: Cam, goal: Cam, dtSec: number, snap: boolean): boolean {
  const k = snap ? 1 : 1 - Math.exp(-dtSec * 11);
  let moving = false;
  for (const key of ['yaw', 'tx', 'tz'] as const) {
    const d = goal[key] - cur[key];
    if (d === 0) continue;
    cur[key] = Math.abs(d) > (key === 'yaw' ? 0.02 : 0.002) && !snap ? cur[key] + d * k : goal[key];
    if (cur[key] !== goal[key]) moving = true;
  }
  return moving;
}

/** The camera with its target held within the board, one cell beyond its edge cells. */
export function clampCam(c: Cam, cols: number, rows: number): Cam {
  const hx = (cols - 1) / 2 + 1;
  const hz = (rows - 1) / 2 + 1;
  return { yaw: c.yaw, tx: Math.max(-hx, Math.min(hx, c.tx)), tz: Math.max(-hz, Math.min(hz, c.tz)) };
}

/** A screen drag of (dxPx, dyPx) as a ground move: the board follows the finger, and the ground's depth axis
 * is foreshortened by sin(pitch). */
export function panCam(c: Cam, dxPx: number, dyPx: number, unitsPerPx: number): Cam {
  const y = (c.yaw * Math.PI) / 180;
  const rx = Math.cos(y);
  const rz = -Math.sin(y);
  const fx = -Math.sin(y);
  const fz = -Math.cos(y);
  const dx = dxPx * unitsPerPx;
  const dy = (dyPx * unitsPerPx) / SIN_PITCH;
  return { yaw: c.yaw, tx: c.tx - rx * dx + fx * dy, tz: c.tz - rz * dx + fz * dy };
}

/** The yaw equal to `target` modulo 360 that lies nearest `current`. */
export function nearestYaw(target: number, current: number): number {
  return target + 360 * Math.round((current - target) / 360);
}

/** Ground rows visible top to bottom: more on a tall, narrow screen so the width still fits. */
export function viewRows(aspect: number): number {
  return Math.min(14, Math.max(7.5, 7.5 / aspect));
}
