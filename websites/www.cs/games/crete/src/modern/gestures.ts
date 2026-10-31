/* The Island of Crete, modern look: pointer gestures as camera operations, and a finger's swipe as a move. A reader
 * holds only the pointers down and the last tap; the caller owns the camera and applies the operations. One finger
 * swipes Theseus (src/swipe.ts) and never moves the camera. Two fingers either tilt, when they first slide up or
 * down together side by side, or else pan, twist and pinch, for the rest of that touch. The primary mouse button
 * turns (across) and tilts (up and down), the middle or right one pans, the wheel zooms, and a quick double tap
 * resets. The view stays wherever a gesture leaves it. DOM-free. */
import type { MoveAction } from '../keys.ts';
import { swipeDir } from '../swipe.ts';

/** A zoom multiplies the view's height by `factor` (under 1 is closer) about the screen point `(x, y)`. */
export type CamOp = { kind: 'turn'; deg: number } | { kind: 'tilt'; deg: number } | { kind: 'pan'; dx: number; dy: number }
  | { kind: 'zoom'; factor: number; x: number; y: number } | { kind: 'reset' } | { kind: 'swipe'; dir: MoveAction };

export interface Ptr {
  id: number;
  x: number;
  y: number;
  type: 'mouse' | 'touch' | 'pen';
  button: number;
}

export interface Gestures {
  down(p: Ptr): CamOp[];
  move(p: Ptr): CamOp[];
  up(p: Ptr): CamOp[];
  cancel(id: number): CamOp[];
  /** A wheel turned by `deltaY` pixels over `(x, y)`: down zooms out, up zooms in. */
  wheel(deltaY: number, x: number, y: number): CamOp[];
}

interface Held {
  x: number;
  y: number;
  /** Where it was when the touch's second finger came down (or it did): two-finger moves are read from here. */
  sx: number;
  sy: number;
  x0: number;
  y0: number;
  t0: number;
  type: Ptr['type'];
  button: number;
}

interface Two {
  ang: number;
  d: number;
  mx: number;
  my: number;
}

const TURN_PER_PX = 0.35;
/** Degrees of tilt per pixel slid: up tips toward straight down, down back toward 45°. */
export const TILT_PER_PX = 0.3;
/** How far two fingers move before the touch is read as a tilt or as the rest. */
const DECIDE_PX = 10;
const TAP_MS = 280;
const TAP_PX = 12;
const DOUBLE_MS = 320;
const DOUBLE_PX = 40;
const WHEEL_RATE = 0.0015;
/** Fingers closer than this pinch as if this far apart, so a tiny pinch never zooms wildly. */
const PINCH_MIN_PX = 10;

export function createGestures(now: () => number): Gestures {
  const held = new Map<number, Held>();
  let two: Two | null = null;
  let lastTap: { t: number; x: number; y: number } | null = null;
  /** True once a second finger has come down, until every finger is up: such a touch is never a swipe or a tap. */
  let multi = false;
  /** What two fingers do this touch: undecided until they have moved DECIDE_PX. */
  let mode: 'tilt' | 'free' | null = null;
  let start: Two | null = null;

  const twoInfo = (): Two => {
    const [a, b] = [...held.values()];
    if (!a || !b) return { ang: 0, d: 0, mx: 0, my: 0 };
    return { ang: Math.atan2(b.y - a.y, b.x - a.x), d: Math.hypot(b.x - a.x, b.y - a.y), mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2 };
  };

  return {
    down(p) {
      held.set(p.id, { x: p.x, y: p.y, sx: p.x, sy: p.y, x0: p.x, y0: p.y, t0: now(), type: p.type, button: p.button });
      for (const h of held.values()) { h.sx = h.x; h.sy = h.y; }
      two = held.size === 2 ? twoInfo() : null;
      start = two;
      mode = null;
      if (held.size > 1) multi = true;
      return [];
    },
    move(p) {
      const h = held.get(p.id);
      if (!h) return [];
      const dx = p.x - h.x;
      const dy = p.y - h.y;
      h.x = p.x;
      h.y = p.y;
      const ops: CamOp[] = [];
      if (held.size === 1) {
        if (h.type !== 'mouse') return ops;
        if (h.button === 1 || h.button === 2) {
          if (dx !== 0 || dy !== 0) ops.push({ kind: 'pan', dx, dy });
        } else {
          if (dx !== 0) ops.push({ kind: 'turn', deg: -dx * TURN_PER_PX });
          if (dy !== 0) ops.push({ kind: 'tilt', deg: -dy * TILT_PER_PX });
        }
      } else if (held.size === 2 && two && start) {
        const nowInfo = twoInfo();
        if (!mode) {
          const [a, b] = [...held.values()] as [Held, Held];
          const ay = a.y - a.sy, by = b.y - b.sy, ax = a.x - a.sx, bx = b.x - b.sx;
          const near = Math.min(Math.hypot(ax, ay), Math.hypot(bx, by)), far = Math.max(Math.hypot(ax, ay), Math.hypot(bx, by));
          // Fingers report one at a time: wait until both have moved, unless one has gone well past the other or
          // their spread has changed (a pinch is never a tilt).
          const pinched = Math.abs(nowInfo.d - start.d) >= DECIDE_PX;
          if (!pinched && (far < DECIDE_PX || (near < DECIDE_PX / 2 && far < 2 * DECIDE_PX))) return ops;
          // Side by side (the line between them within 35° of level), both sliding the same way, mostly up or down,
          // about as far as each other: a tilt. Anything else (one finger swinging, a pinch, a slant) is the rest.
          const level = Math.abs(Math.sin(start.ang)) < Math.sin((35 * Math.PI) / 180);
          const together = Math.sign(ay) === Math.sign(by) && Math.min(Math.abs(ay), Math.abs(by)) > DECIDE_PX / 2
            && Math.abs(ay - by) < Math.max(Math.abs(ay), Math.abs(by)) / 2;
          const upright = Math.abs(ax) < Math.abs(ay) / 2 && Math.abs(bx) < Math.abs(by) / 2;
          mode = level && together && upright ? 'tilt' : 'free';
        }
        if (mode === 'tilt') {
          const mdy = nowInfo.my - two.my;
          if (mdy !== 0) ops.push({ kind: 'tilt', deg: -mdy * TILT_PER_PX });
          two = nowInfo;
          return ops;
        }
        let da = nowInfo.ang - two.ang;
        if (da > Math.PI) da -= 2 * Math.PI;
        if (da < -Math.PI) da += 2 * Math.PI;
        if (da !== 0) ops.push({ kind: 'turn', deg: (da * 180) / Math.PI });
        const mdx = nowInfo.mx - two.mx;
        const mdy = nowInfo.my - two.my;
        if (mdx !== 0 || mdy !== 0) ops.push({ kind: 'pan', dx: mdx, dy: mdy });
        const factor = Math.max(PINCH_MIN_PX, two.d) / Math.max(PINCH_MIN_PX, nowInfo.d);
        if (factor !== 1) ops.push({ kind: 'zoom', factor, x: nowInfo.mx, y: nowInfo.my });
        two = nowInfo;
      }
      return ops;
    },
    up(p) {
      const h = held.get(p.id);
      if (!h) return [];
      held.delete(p.id);
      two = null;
      start = null;
      const wasMulti = multi;
      if (held.size === 0) multi = false;
      if (h.type === 'mouse' || held.size !== 0 || wasMulti) return [];
      const t = now();
      const dir = swipeDir(p.x - h.x0, p.y - h.y0, t - h.t0);
      if (dir) {
        lastTap = null;
        return [{ kind: 'swipe', dir }];
      }
      if (t - h.t0 >= TAP_MS || Math.hypot(p.x - h.x0, p.y - h.y0) >= TAP_PX) return [];
      if (lastTap && t - lastTap.t < DOUBLE_MS && Math.hypot(p.x - lastTap.x, p.y - lastTap.y) < DOUBLE_PX) {
        lastTap = null;
        return [{ kind: 'reset' }];
      }
      lastTap = { t, x: p.x, y: p.y };
      return [];
    },
    cancel(id) {
      held.delete(id);
      two = null;
      start = null;
      if (held.size === 0) multi = false;
      return [];
    },
    wheel(deltaY, x, y) {
      return deltaY === 0 ? [] : [{ kind: 'zoom', factor: Math.exp(deltaY * WHEEL_RATE), x, y }];
    },
  };
}
