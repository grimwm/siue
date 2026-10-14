/* Operation Tankity: tracer marks.
 *
 * A tracer bursts on nothing; what it leaves is its mark, the path it flew
 * and where it came down (game.yaml gfx.mark). A `line` mark is its gunner's
 * alone and stays until that gunner fires again; a `smoke` mark is everyone's,
 * drifts with the wind, and stays until the round ends. The solo match feeds
 * this from the sim's trail and mark events, a room from the replayed shot
 * events; render.ts draws what shown() hands it. Pure: no page, no clock. */

export type MarkKind = 'line' | 'smoke';
/** One tracer's mark. `by` is its gunner (a tank's index in solo, a seat in a
 *  room); `pts` its path as x, y pairs; `age` seconds since it was fired. */
export interface Mark {
  by: number;
  wkey: string;
  kind: MarkKind;
  pts: number[];
  landed: boolean;
  age: number;
}
/** Points along a mark's path are kept at least this many px apart. */
export const MARK_EVERY = 6;
/** How far the wind pushes a smoke mark: px per second per unit of wind. */
export const SMOKE_DRIFT = 1.6;

export interface Marks {
  /** Every mark this round, oldest first. */
  readonly list: readonly Mark[];
  /** `by` fired again: its line marks are gone. */
  fired(by: number): void;
  /** A tracer (`shot`, any object that stands for it while it flies) is at (x, y). */
  trail(shot: object, by: number, wkey: string, kind: MarkKind, x: number, y: number): void;
  /** That tracer came down (or struck a unit) at (x, y). */
  land(shot: object, x: number, y: number): void;
  /** Time passes: smoke drifts and thins. */
  step(dt: number): void;
  /** The marks `viewer` sees: every smoke mark, and its own lines. */
  shown(viewer: number): Mark[];
  /** A new round (or match): no marks. */
  clear(): void;
}

export function createMarks(): Marks {
  let list: Mark[] = [];
  let live = new WeakMap<object, Mark>();
  function point(m: Mark, x: number, y: number, force: boolean): void {
    const n = m.pts.length;
    if (!force && n >= 2 && Math.hypot(x - m.pts[n - 2]!, y - m.pts[n - 1]!) < MARK_EVERY) return;
    m.pts.push(x, y);
  }
  return {
    get list() { return list; },
    fired(by) {
      list = list.filter(m => m.kind !== 'line' || m.by !== by);
    },
    trail(shot, by, wkey, kind, x, y) {
      let m = live.get(shot);
      if (!m) {
        m = { by, wkey, kind, pts: [], landed: false, age: 0 };
        live.set(shot, m);
        list.push(m);
      }
      if (!m.landed) point(m, x, y, false);
    },
    land(shot, x, y) {
      const m = live.get(shot);
      if (!m || m.landed) return;
      point(m, x, y, true);
      m.landed = true;
    },
    step(dt) {
      for (const m of list) m.age += dt;
    },
    shown(viewer) {
      return list.filter(m => m.kind === 'smoke' || m.by === viewer);
    },
    clear() {
      list = [];
      live = new WeakMap();
    },
  };
}

/** How far a smoke mark `age` seconds old has drifted on wind `wind`. */
export function smokeDrift(age: number, wind: number): number {
  return wind * SMOKE_DRIFT * age;
}
