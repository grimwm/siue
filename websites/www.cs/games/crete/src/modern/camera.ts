/* The Island of Crete, modern look: the camera as pure maths. There is one camera, always free to turn and tilt:
 * it turns about the vertical axis to any heading and stays there, tilts anywhere from straight down (90°) to 10°
 * above the ground, nearly edge-on, slides over the board and zooms within limits. Every level opens, and Reset returns, at 75° and
 * north up, centred. The board is centred at the origin, one cell is one unit, and cell (r, c) sits at
 * x = c - (cols - 1) / 2, z = r - (rows - 1) / 2. DOM-free. */

/** The pitch every level opens at and Reset returns to: steeply down, square to the board like the classic look, so
 *  a wall hides about a quarter of the cell behind it and the figures still show their faces. */
export const START_PITCH = 75;
/** The lowest the view tilts: 10° above the ground, nearly edge-on. */
export const MIN_PITCH = 10;
/** The steepest the view tilts: straight down. */
export const MAX_PITCH = 90;
/** The heading every view starts at and Reset returns to: square to the board, north up, as the classic look is. */
export const DEFAULT_YAW = 0;

/** `pitch` held between MIN_PITCH and straight down. */
export function clampTilt(pitch: number): number {
  return Math.max(MIN_PITCH, Math.min(MAX_PITCH, pitch));
}

/** How far the camera stands back from the point it looks at, in cells, for a view `zoom` rows high at `pitch`: 40,
 *  or, tilted low, far enough that the bottom of the view still starts above the ground, so the near ground is never
 *  cut off. */
export function cameraDistance(pitch: number, zoom: number): number {
  const p = (pitch * Math.PI) / 180;
  return Math.max(40, (zoom / 2) * Math.cos(p) / Math.max(0.05, Math.sin(p)) + 4);
}

export interface Cam {
  yaw: number;
  /** Degrees above the ground: 90 (straight down) to 10; 75 to start. */
  pitch: number;
  tx: number;
  tz: number;
  /** The view's height in ground rows: smaller is closer. */
  zoom: number;
}

/** How much the ground's depth axis is foreshortened at pitch `deg`: 1 looking straight down. */
const sinPitch = (deg: number): number => Math.sin((deg * Math.PI) / 180);

/** Ease `cur` toward `goal` in place; true while it is still moving. `snap` (reduced motion) jumps at once. */
export function easeCam(cur: Cam, goal: Cam, dtSec: number, snap: boolean): boolean {
  const k = snap ? 1 : 1 - Math.exp(-dtSec * 11);
  let moving = false;
  for (const key of ['yaw', 'pitch', 'tx', 'tz', 'zoom'] as const) {
    const d = goal[key] - cur[key];
    if (d === 0) continue;
    cur[key] = Math.abs(d) > (key === 'yaw' || key === 'pitch' ? 0.02 : 0.002) && !snap ? cur[key] + d * k : goal[key];
    if (cur[key] !== goal[key]) moving = true;
  }
  return moving;
}

const hold = (v: number, reach: number): number => Math.max(-Math.max(0, reach), Math.min(Math.max(0, reach), v));

/** The camera with its target held so the view stays within the level, one cell of margin. The level and the view
 *  are compared on the screen's own axes (across, and deep along the ground, which is foreshortened by sin(pitch)):
 *  on an axis where the level fits the view, the level is centred on it; otherwise the view may reach one cell past
 *  the level's edge and no further. The level is `cols` × `rows` cells centred at the origin, the screen `aspect`
 *  wide to high. */
export function clampView(c: Cam, cols: number, rows: number, aspect: number): Cam {
  const y = (c.yaw * Math.PI) / 180;
  const cs = Math.cos(y), sn = Math.sin(y);
  const across = c.tx * cs - c.tz * sn;
  const deep = -c.tx * sn - c.tz * cs;
  const halfAcross = (cols * Math.abs(cs) + rows * Math.abs(sn)) / 2;
  const halfDeep = (cols * Math.abs(sn) + rows * Math.abs(cs)) / 2;
  const a = hold(across, halfAcross + 1 - (c.zoom * aspect) / 2);
  const b = hold(deep, halfDeep + 1 - c.zoom / 2 / sinPitch(c.pitch));
  return { ...c, tx: a * cs - b * sn, tz: -a * sn - b * cs };
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
  const dy = (dyPx * unitsPerPx) / sinPitch(c.pitch);
  return { ...c, tx: c.tx - rx * dx + fx * dy, tz: c.tz - rz * dx + fz * dy };
}

/** The yaw equal to `target` modulo 360 that lies nearest `current`. */
export function nearestYaw(target: number, current: number): number {
  return target + 360 * Math.round((current - target) / 360);
}

/** The closest view: about five rows. */
export const ZOOM_MIN = 5;
/** A wall's height, in cells. */
export const WALL_H = 1.25;
/** The room the walls need on screen at `pitch`, above the far edge and so, the view being centred, below the near
 *  one too: a wall's height, foreshortened by the tilt, at each. */
const wallClearance = (pitch: number): number => 2 * WALL_H * Math.cos((pitch * Math.PI) / 180);

export interface ZoomLimits {
  min: number;
  max: number;
}

/** The whole-level view: the view's height in ground rows that shows all of a `cols` × `rows` level and its walls'
 *  tops, as the camera is turned (`yaw`) and tipped (`pitch`), on a screen `aspect` wide to high, with no margin round
 *  them: the size the classic look shows the level at (src/sheet.ts wholeFrame), so the two looks match. It is the
 *  view every level opens at, and the one Reset returns to. */
export function wholeZoom(aspect: number, cols: number, rows: number, pitch: number, yaw: number): number {
  const y = (yaw * Math.PI) / 180;
  const cs = Math.abs(Math.cos(y)), sn = Math.abs(Math.sin(y));
  const w = cols, h = rows;
  const across = w * cs + h * sn;
  const deep = (w * sn + h * cs) * sinPitch(pitch);
  return Math.max(ZOOM_MIN, deep + wallClearance(pitch), across / aspect);
}

/** How far the view may zoom on a `cols` × `rows` level at screen `aspect` and camera `pitch`: in to about five
 *  rows, out until the whole level and a cell's margin fit whichever way the view is turned, however big it is. */
export function zoomLimits(aspect: number, cols: number, rows: number, pitch: number): ZoomLimits {
  const d = Math.hypot(cols + 2, rows + 2);
  return { min: ZOOM_MIN, max: Math.max(ZOOM_MIN, d * sinPitch(pitch) + wallClearance(pitch), d / aspect) };
}

export const clampZoom = (z: number, lim: ZoomLimits): number => Math.max(lim.min, Math.min(lim.max, z));

export interface Ground {
  x: number;
  z: number;
}

/** The floor point under a screen point `(sx, sy)` view units right of and above the view's centre. The lens is
 *  orthographic, so a screen-up offset reaches 1 / sin(pitch) as far along the ground. */
export function groundAt(c: Cam, sx: number, sy: number): Ground {
  const y = (c.yaw * Math.PI) / 180;
  const fy = sy / sinPitch(c.pitch);
  return { x: c.tx + Math.cos(y) * sx - Math.sin(y) * fy, z: c.tz - Math.sin(y) * sx - Math.cos(y) * fy };
}

/** The camera zoomed by `factor` (its view height times `factor`, within `lim`) about the screen point `(u, v)` view
 *  heights right of and above the view's centre: the floor point under it stays under it. */
export function zoomAbout(c: Cam, factor: number, u: number, v: number, lim: ZoomLimits): Cam {
  const zoom = clampZoom(c.zoom * factor, lim);
  const k = c.zoom - zoom;
  const g = groundAt(c, u * k, v * k);
  return { ...c, zoom, tx: g.x, tz: g.z };
}

/** What the camera sees of the floor at screen `aspect`: the screen's corners from top-left clockwise, and a tick
 *  from the view's centre toward screen-up. */
export function footprint(c: Cam, aspect: number): { corners: Ground[]; tick: [Ground, Ground] } {
  const hh = c.zoom / 2;
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
