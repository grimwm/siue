/* The Island of Crete, modern look: the compass as pure maths. A drag on the compass steers the camera: across turns
 * the view, up leans it toward 45° and down tilts it back toward straight down; the view stays wherever the drag
 * leaves it. A press that never moves COMPASS_TAP_PX from where it came down is a tap, however long it is held, which
 * resets the view. The compass's face shows the camera as it is, whatever moved it: the needle turns with the
 * heading, and the dial is squashed and a ring fills as the view tilts away from straight down. DOM-free. */
import { MAX_PITCH, MIN_PITCH, clampTilt } from './camera.ts';
import type { CamOp } from './gestures.ts';

/** A press that stays within this many CSS pixels of where it came down is a tap; past it, a drag. A fingertip
 *  wobbles several pixels on a quick tap, so this is finger-sized. */
export const COMPASS_TAP_PX = 12;
/** Degrees turned per pixel dragged across the compass. */
export const COMPASS_TURN_PER_PX = 0.6;
/** Degrees tilted per pixel dragged up or down: the whole tilt takes about 110 px. */
export const COMPASS_TILT_PER_PX = 0.4;

/** A compass press as camera operations: turns and tilts while it drags, `reset` when a tap lets go. One pointer at
 *  a time; others are ignored until it lifts. */
export interface CompassDrag {
  down(id: number, x: number, y: number): CamOp[];
  move(id: number, x: number, y: number): CamOp[];
  up(id: number, x: number, y: number): CamOp[];
  cancel(id: number): CamOp[];
}

export function createCompassDrag(): CompassDrag {
  let press: { id: number; x0: number; y0: number; x: number; y: number; dragging: boolean } | null = null;
  const drag: CompassDrag = {
    down(id, x, y) {
      if (press) return [];
      press = { id, x0: x, y0: y, x, y, dragging: false };
      return [];
    },
    move(id, x, y) {
      if (!press || press.id !== id) return [];
      if (!press.dragging) {
        if (Math.hypot(x - press.x0, y - press.y0) < COMPASS_TAP_PX) return [];
        press.dragging = true;
      }
      const dx = x - press.x, dy = y - press.y;
      press.x = x;
      press.y = y;
      const ops: CamOp[] = [];
      // The same senses as a drag on the board: rightward turns as a left-button drag right does, up leans toward
      // 45°, as on a map app.
      if (dx !== 0) ops.push({ kind: 'turn', deg: -dx * COMPASS_TURN_PER_PX });
      if (dy !== 0) ops.push({ kind: 'tilt', deg: dy * COMPASS_TILT_PER_PX });
      return ops;
    },
    up(id, x, y) {
      if (!press || press.id !== id) return [];
      const ops = drag.move(id, x, y);
      const dragged = press.dragging;
      press = null;
      return dragged ? ops : [{ kind: 'reset' }];
    },
    cancel(id) {
      if (press?.id === id) press = null;
      return [];
    },
  };
  return drag;
}

/** Where the view looks: its heading and its pitch, in degrees. */
export interface Heading {
  yaw: number;
  pitch: number;
}

/** `v` after a turn or a tilt: a turn adds to the heading; a tilt adds to the pitch, held between 45° and straight
 *  down. Any other operation leaves it. */
export function steer(v: Heading, op: CamOp): Heading {
  if (op.kind === 'turn') return { ...v, yaw: v.yaw + op.deg };
  if (op.kind === 'tilt') return { ...v, pitch: clampTilt(v.pitch + op.deg) };
  return v;
}

/** What the compass shows for a view: the needle's turn in degrees (it points at the board's north), how far the
 *  dial is squashed (1 is round, straight down; a disc seen at the view's pitch), and how far the view has tilted
 *  from straight down to the lowest pitch (0 to 1), which the ring fills to. */
export interface Face {
  needle: number;
  squash: number;
  tilt: number;
}

export function compassFace(v: Heading): Face {
  const pitch = clampTilt(v.pitch);
  return {
    needle: v.yaw,
    squash: Math.sin((pitch * Math.PI) / 180),
    tilt: (MAX_PITCH - pitch) / (MAX_PITCH - MIN_PITCH),
  };
}
