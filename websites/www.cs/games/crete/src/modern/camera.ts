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

export interface Ground {
  x: number;
  z: number;
}

/** The floor point under a screen point `(sx, sy)` view units right of and above the view's centre. The lens is
 *  orthographic, so a screen-up offset reaches 1 / sin(pitch) as far along the ground. */
export function groundAt(c: Cam, sx: number, sy: number): Ground {
  const y = (c.yaw * Math.PI) / 180;
  const fy = sy / SIN_PITCH;
  return { x: c.tx + Math.cos(y) * sx - Math.sin(y) * fy, z: c.tz - Math.sin(y) * sx - Math.cos(y) * fy };
}

/** What the camera sees of the floor at screen `aspect`: the screen's corners from top-left clockwise, and a tick
 *  from the view's centre toward screen-up. */
export function footprint(c: Cam, aspect: number): { corners: Ground[]; tick: [Ground, Ground] } {
  const hh = viewRows(aspect) / 2;
  const hw = hh * aspect;
  return {
    corners: [groundAt(c, -hw, hh), groundAt(c, hw, hh), groundAt(c, hw, -hh), groundAt(c, -hw, -hh)],
    tick: [groundAt(c, 0, 0), groundAt(c, 0, hh * 0.4)],
  };
}

/** A mini-map cell in CSS pixels: 11, or 8 on a board under 520 px wide, and smaller when a big level would take
 *  more than half the board's width or 40% of its height. */
export function miniCell(boardW: number, boardH: number, cols: number, rows: number): number {
  const base = boardW < 520 ? 8 : 11;
  const fit = Math.min(Math.floor((boardW * 0.5) / cols), Math.floor((boardH * 0.4) / rows));
  return Math.max(2, Math.min(base, fit));
}

/** A floor point as mini-map pixels, for `cell`-pixel cells below a `top`-pixel rise. */
export function toMini(p: Ground, cols: number, rows: number, cell: number, top: number): [number, number] {
  return [(p.x + cols / 2) * cell, top + (p.z + rows / 2) * cell];
}

/** The floor point under a mini-map pixel. */
export function fromMini(px: number, py: number, cols: number, rows: number, cell: number, top: number): Ground {
  return { x: px / cell - cols / 2, z: (py - top) / cell - rows / 2 };
}
