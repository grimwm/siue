// Touch, mouse and trackpad gestures reduced to taps, view changes and span
// selections. Pure state machine over pointer events. DOM-free.
import { panBy, pinch, zoomAt } from './zoom.ts';
import type { Bounds, View } from './zoom.ts';

export interface PointerIn { id: number; x: number; y: number; t: number }
export type GestureOut =
  | { kind: 'tap'; x: number; y: number }
  | { kind: 'view'; view: View }
  | { kind: 'select'; x0: number; x1: number; y: number; done: boolean };
export interface Gestures {
  down(p: PointerIn): GestureOut[];
  move(p: PointerIn): GestureOut[];
  up(p: PointerIn): GestureOut[];
  cancel(id: number): GestureOut[];
  /** Trackpad pinch arrives as ctrl+wheel: zoom by exp(-deltaY / 200) about x; otherwise deltaX pans. */
  wheel(x: number, deltaX: number, deltaY: number, ctrl: boolean): GestureOut[];
}
export const TAP_SLOP_PX = 8;
export const TAP_MS = 300;

interface Finger { x: number; y: number }

/** mode 'pan': one finger pans, two pinch; mode 'select' (pinning a span): one finger selects, two still pinch. */
export function createGestures(view: () => View, bounds: () => Bounds, mode: () => 'pan' | 'select'): Gestures {
  const fingers = new Map<number, Finger>();
  // The first finger's start, for tap detection and the select anchor; cleared once it can no longer be a tap.
  let first: { id: number; x: number; y: number; t: number; moved: boolean } | null = null;
  // The pinch baseline: both fingers' x and the view when the second finger went down.
  let base: { a: number; b: number; ax: number; bx: number; view: View } | null = null;
  let selecting: { x0: number; y: number } | null = null;

  const startPinch = (): void => {
    const [a, b] = [...fingers.entries()];
    if (!a || !b) return;
    base = { a: a[0], b: b[0], ax: a[1].x, bx: b[1].x, view: view() };
  };

  return {
    down(p) {
      fingers.set(p.id, { x: p.x, y: p.y });
      if (fingers.size === 1) {
        first = { id: p.id, x: p.x, y: p.y, t: p.t, moved: false };
        selecting = mode() === 'select' ? { x0: p.x, y: p.y } : null;
      } else {
        first = null;
        selecting = null;
        if (fingers.size === 2) startPinch();
      }
      return [];
    },
    move(p) {
      const f = fingers.get(p.id);
      if (!f) return [];
      const dx = p.x - f.x;
      f.x = p.x;
      f.y = p.y;
      if (first && first.id === p.id && Math.hypot(p.x - first.x, p.y - first.y) > TAP_SLOP_PX) first.moved = true;
      if (fingers.size === 2 && base) {
        const a = fingers.get(base.a);
        const b = fingers.get(base.b);
        if (!a || !b) return [];
        return [{ kind: 'view', view: pinch(base.view, [base.ax, base.bx], [a.x, b.x], bounds()) }];
      }
      if (fingers.size !== 1) return [];
      if (selecting) return [{ kind: 'select', x0: selecting.x0, x1: p.x, y: selecting.y, done: false }];
      return dx === 0 ? [] : [{ kind: 'view', view: panBy(view(), dx, bounds()) }];
    },
    up(p) {
      const wasSelecting = selecting;
      const start = first;
      const known = fingers.delete(p.id);
      if (!known) return [];
      base = null;
      selecting = null;
      first = null;
      if (wasSelecting && fingers.size === 0) return [{ kind: 'select', x0: wasSelecting.x0, x1: p.x, y: wasSelecting.y, done: true }];
      if (start && start.id === p.id && !start.moved && p.t - start.t <= TAP_MS && Math.hypot(p.x - start.x, p.y - start.y) <= TAP_SLOP_PX) {
        return [{ kind: 'tap', x: p.x, y: p.y }];
      }
      return [];
    },
    cancel(id) {
      fingers.delete(id);
      first = null;
      base = null;
      selecting = null;
      return [];
    },
    wheel(x, deltaX, deltaY, ctrl) {
      if (ctrl) return [{ kind: 'view', view: zoomAt(view(), x, Math.exp(-deltaY / 200), bounds()) }];
      return deltaX === 0 ? [] : [{ kind: 'view', view: panBy(view(), -deltaX, bounds()) }];
    },
  };
}
