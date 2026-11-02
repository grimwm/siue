/* The Island of Crete, classic look: the board as a tilted sheet. The classic board turns to any heading and tilts
 * from straight down to 10°, like the modern one, without 3D graphics: the board sheet (the terrain, drawn by
 * src/board.ts) is a 2D canvas under a CSS transform (a lens, a tilt about the screen's across axis, a turn about the
 * sheet's own), and the figures, items and hazards stand upright over it, at their exact pixels, on their squares'
 * projected centres. Both looks share one heading and tilt, and every level opens, and a tap on the compass returns,
 * at 75° and north up (src/modern/camera.ts).
 *
 * Ground coordinates are CSS px from the board's top-left corner, one cell `cell` px; a screen point is CSS px from
 * the view's top-left. The view's centre, moved by (ox, oy), shows the ground point (tx, ty); `k` scales the picture
 * after the lens, so the whole level fits while it turns. DOM-free. */
import { DEFAULT_YAW, START_PITCH, clampTilt, nearestYaw } from './modern/camera.ts';
import type { Heading } from './modern/compass.ts';

/** The eye's distance from the sheet, in board sizes (its longer side): a gentle lens. */
export const EYE = 3.5;
/** How far down its square a standing figure's feet come as the view leans to 45°, and held lower, in cells. */
export const LEAN_FEET = 0.42;
/** When zoomed in, the view pans to keep Theseus this many cells inside it. */
export const FOLLOW_CELLS = 2;

export interface Frame {
  yaw: number;
  pitch: number;
  tx: number;
  ty: number;
  ox: number;
  oy: number;
  k: number;
  /** The eye's distance, CSS px. */
  d: number;
  vw: number;
  vh: number;
}

export interface Pt {
  x: number;
  y: number;
}

const rad = (deg: number): number => (deg * Math.PI) / 180;

/** The eye's distance for a `cols` × `rows` board of `cell` px cells. */
export const eye = (cols: number, rows: number, cell: number): number => EYE * Math.max(cols, rows) * cell;

/** Where ground point (x, y) shows on the screen. */
export function project(f: Frame, x: number, y: number): Pt {
  const a = rad(f.yaw), b = rad(90 - f.pitch);
  const x1 = x - f.tx, y1 = y - f.ty;
  const x2 = x1 * Math.cos(a) - y1 * Math.sin(a);
  const y2 = x1 * Math.sin(a) + y1 * Math.cos(a);
  const w = 1 - (y2 * Math.sin(b)) / f.d;
  return { x: f.vw / 2 + f.ox + (f.k * x2) / w, y: f.vh / 2 + f.oy + (f.k * y2 * Math.cos(b)) / w };
}

/** The ground point under screen point (X, Y); null beyond the horizon. */
export function unproject(f: Frame, X: number, Y: number): Pt | null {
  const a = rad(f.yaw), b = rad(90 - f.pitch);
  const sx = (X - f.vw / 2 - f.ox) / f.k, sy = (Y - f.vh / 2 - f.oy) / f.k;
  const den = Math.cos(b) + (sy * Math.sin(b)) / f.d;
  if (den <= 1e-9) return null;
  const y2 = sy / den;
  const x2 = sx * (1 - (y2 * Math.sin(b)) / f.d);
  return { x: f.tx + x2 * Math.cos(a) + y2 * Math.sin(a), y: f.ty - x2 * Math.sin(a) + y2 * Math.cos(a) };
}

/** The CSS transform that shows the sheet at `f`, for a canvas whose board starts `margin` px in from its corner and
 *  whose transform origin is its top-left corner, laid at the view's top-left. */
export function sheetTransform(f: Frame, margin: number): string {
  const n = (v: number): string => (Math.abs(v) < 1e-6 ? '0' : v.toFixed(3));
  return `translate(${n(f.vw / 2 + f.ox)}px, ${n(f.vh / 2 + f.oy)}px) scale(${n(f.k)}) perspective(${n(f.d)}px) ` +
    `rotateX(${n(90 - f.pitch)}deg) rotateZ(${n(f.yaw)}deg) translate(${n(-(f.tx + margin))}px, ${n(-(f.ty + margin))}px)`;
}

/** How far a figure (a sprite `rise` cells taller than its cell) standing on the far row reaches above the board's
 *  far edge at `pitch`, in cells: its frame's top stands its rise and its feet above its square's centre, which is
 *  half a cell, foreshortened, inside the edge. A wall's top leans no further. */
export function headroom(pitch: number, rise: number): number {
  const lean = Math.min(1, Math.max(0, (90 - pitch) / 45));
  return Math.max(rise, rise + LEAN_FEET * lean + 0.5 * (1 - Math.sin(rad(pitch))));
}

/** The board's box on the screen at `f`: its four corners, and the figures' headroom (`rise`, as for headroom) above
 *  the highest. */
export function extent(f: Frame, cols: number, rows: number, cell: number, rise: number): { left: number; top: number; right: number; bottom: number } {
  const pts = [project(f, 0, 0), project(f, cols * cell, 0), project(f, 0, rows * cell), project(f, cols * cell, rows * cell)];
  const xs = pts.map(p => p.x), ys = pts.map(p => p.y);
  return { left: Math.min(...xs), top: Math.min(...ys) - headroom(f.pitch, rise) * cell * f.k, right: Math.max(...xs), bottom: Math.max(...ys) };
}

/** The whole-level frame: the board's centre in the middle, scaled and moved so its box (`rise` as for headroom) fills
 *  the view and is centred in it. */
export function wholeFrame(v: Heading, cols: number, rows: number, cell: number, rise: number, vw: number, vh: number): Frame {
  const f: Frame = { yaw: v.yaw, pitch: v.pitch, tx: (cols * cell) / 2, ty: (rows * cell) / 2, ox: 0, oy: 0, k: 1, d: eye(cols, rows, cell), vw, vh };
  const e = extent(f, cols, rows, cell, rise);
  const k = Math.min(vw / (e.right - e.left), vh / (e.bottom - e.top));
  return { ...f, k, ox: k * (vw / 2 - (e.left + e.right) / 2), oy: k * (vh / 2 - (e.top + e.bottom) / 2) };
}

/** The largest whole cell (CSS px) at which the whole level, seen at `v` with its figures' headroom, fits a `vw` × `vh`
 *  view unscaled; at least 1. The board's box grows in step with its cell, so one measure at a 1 px cell answers it. */
export function sheetCell(v: Heading, cols: number, rows: number, rise: number, vw: number, vh: number): number {
  const f: Frame = { yaw: v.yaw, pitch: v.pitch, tx: cols / 2, ty: rows / 2, ox: 0, oy: 0, k: 1, d: eye(cols, rows, 1), vw, vh };
  const e = extent(f, cols, rows, 1, rise);
  return Math.max(1, Math.floor(Math.min(vw / (e.right - e.left), vh / (e.bottom - e.top))));
}

/** `f` with the ground point at the view's centre held on the board. */
export function holdTarget(f: Frame, cols: number, rows: number, cell: number): Frame {
  return { ...f, tx: Math.max(0, Math.min(cols * cell, f.tx)), ty: Math.max(0, Math.min(rows * cell, f.ty)) };
}

/** `f` refocused so that the ground point now at screen point (X, Y) comes to the view's centre, with no offset. */
export function centredOn(f: Frame, X: number, Y: number): Frame {
  const g = unproject(f, X, Y);
  return g ? { ...f, tx: g.x, ty: g.y, ox: 0, oy: 0 } : f;
}

/** `f` panned by a screen drag of (dx, dy): the ground follows the finger, whatever the heading. */
export function panned(f: Frame, dx: number, dy: number, cols: number, rows: number, cell: number): Frame {
  return holdTarget(centredOn(f, f.vw / 2 + f.ox - dx, f.vh / 2 + f.oy - dy), cols, rows, cell);
}

/** `f` panned as little as keeps ground point (x, y) FOLLOW_CELLS cells inside the view, or as near as the view's
 *  size allows. */
export function keepInView(f: Frame, x: number, y: number, cols: number, rows: number, cell: number): Frame {
  let out = f;
  // The lens is not flat, so a step or two more settles it.
  for (let i = 0; i < 3; i++) {
    const p = project(out, x, y);
    const mx = Math.min(FOLLOW_CELLS * cell * out.k, out.vw / 2), my = Math.min(FOLLOW_CELLS * cell * out.k, out.vh / 2);
    const sx = p.x < mx ? p.x - mx : p.x > out.vw - mx ? p.x - (out.vw - mx) : 0;
    const sy = p.y < my ? p.y - my : p.y > out.vh - my ? p.y - (out.vh - my) : 0;
    if (Math.abs(sx) < 0.5 && Math.abs(sy) < 0.5) break;
    out = holdTarget(centredOn(out, out.vw / 2 + out.ox + sx, out.vh / 2 + out.oy + sy), cols, rows, cell);
  }
  return out;
}

/** The shared heading and tilt, easing toward where the player sent them. */
export interface SheetView {
  readonly cur: Heading;
  readonly goal: Heading;
  /** Turns by `deg`; at once under a finger, eased from a button. */
  turn(deg: number, eased: boolean): void;
  /** Tilts by `deg` toward straight down (negative: toward the lowest tilt), held between them. */
  tilt(deg: number, eased: boolean): void;
  /** Puts the view at this heading and tilt at once (the other look's, on switching). */
  set(yaw: number, pitch: number): void;
  /** Back to 75° and north up; eased unless `eased` is false. */
  home(eased: boolean): void;
  /** Moves `cur` toward `goal` over `dtSec`; `snap` (reduced motion) jumps. True while it still moves. */
  step(dtSec: number, snap: boolean): boolean;
}

export function createSheetView(): SheetView {
  const cur: Heading = { yaw: DEFAULT_YAW, pitch: START_PITCH };
  const goal: Heading = { ...cur };
  return {
    cur,
    goal,
    turn(deg, eased) {
      goal.yaw += deg;
      if (!eased) cur.yaw += deg;
    },
    tilt(deg, eased) {
      goal.pitch = clampTilt(goal.pitch + deg);
      if (!eased) cur.pitch = clampTilt(cur.pitch + deg);
    },
    set(yaw, pitch) {
      cur.yaw = goal.yaw = yaw;
      cur.pitch = goal.pitch = clampTilt(pitch);
    },
    home(eased) {
      goal.yaw = nearestYaw(DEFAULT_YAW, cur.yaw);
      goal.pitch = START_PITCH;
      if (!eased) Object.assign(cur, goal);
    },
    step(dtSec, snap) {
      const k = snap ? 1 : 1 - Math.exp(-dtSec * 11);
      let moving = false;
      for (const key of ['yaw', 'pitch'] as const) {
        const d = goal[key] - cur[key];
        if (d === 0) continue;
        cur[key] = Math.abs(d) > 0.02 && !snap ? cur[key] + d * k : goal[key];
        if (cur[key] !== goal[key]) moving = true;
      }
      return moving;
    },
  };
}

/** The grid side a wall shows its face on, for a view at `yaw`: the quarter turn nearest it (0 north up, 1 with west
 *  away, 2 south away, 3 east away). The face is the side nearest the viewer; the top leans away. */
export const faceQuarter = (yaw: number): number => ((Math.round(yaw / 90) % 4) + 4) % 4;

/** The ground direction away from the viewer at quarter `q`, one cell long: north, west, south, east. */
export const AWAY: readonly Pt[] = [{ x: 0, y: -1 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 0 }];
