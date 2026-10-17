// Touch, mouse and trackpad gestures reduced to taps, view changes and span
// selections. Pure state machine over pointer events. DOM-free.
import { panBy, pinch, zoomAt } from './zoom.ts';
import type { Bounds, View } from './zoom.ts';

export interface PointerIn { id: number; x: number; y: number; t: number }
export type GestureOut =
  | { kind: 'tap'; x: number; y: number }
  | { kind: 'view'; view: View }
  // A span selection. done closes it; cancelled (with done) means the preview is to be dropped, not kept: a second finger landed or the pointer was cancelled.
  | { kind: 'select'; x0: number; x1: number; y: number; done: boolean; cancelled?: true };
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

/** mode 'pan': one finger pans, two pinch; mode 'select' (pinning a span): one finger selects, two still pinch. A press that never leaves the tap slop is a tap in either mode and moves or selects nothing. */
export function createGestures(view: () => View, bounds: () => Bounds, mode: () => 'pan' | 'select'): Gestures {
  const fingers = new Map<number, Finger>();
  // The first finger's start, for tap detection; null once a second finger lands.
  let first: { id: number; x: number; y: number; t: number; moved: boolean } | null = null;
  // The pinch baseline: two fingers' x and the view when they were last (re)baselined.
  let base: { a: number; b: number; ax: number; bx: number; view: View } | null = null;
  // An armed selection; shown once a select event has been emitted for it.
  let selecting: { x0: number; y: number; shown: boolean; x1: number } | null = null;

  const startPinch = (): void => {
    const [a, b] = [...fingers.entries()];
    if (!a || !b) { base = null; return; }
    base = { a: a[0], b: b[0], ax: a[1].x, bx: b[1].x, view: view() };
  };
  const closeSelect = (): GestureOut[] => {
    const s = selecting;
    selecting = null;
    return s && s.shown ? [{ kind: 'select', x0: s.x0, x1: s.x1, y: s.y, done: true, cancelled: true }] : [];
  };

  return {
    down(p) {
      fingers.set(p.id, { x: p.x, y: p.y });
      if (fingers.size === 1) {
        first = { id: p.id, x: p.x, y: p.y, t: p.t, moved: false };
        selecting = mode() === 'select' ? { x0: p.x, y: p.y, shown: false, x1: p.x } : null;
        return [];
      }
      first = null;
      const out = closeSelect();
      // A third finger keeps the pinch of the two that already made it.
      if (!base || !fingers.has(base.a) || !fingers.has(base.b)) startPinch();
      return out;
    },
    move(p) {
      const f = fingers.get(p.id);
      if (!f) return [];
      const before = f.x;
      f.x = p.x;
      f.y = p.y;
      if (fingers.size >= 2) {
        if (!base) return [];
        const a = fingers.get(base.a);
        const b = fingers.get(base.b);
        if (!a || !b || (p.id !== base.a && p.id !== base.b)) return [];
        return [{ kind: 'view', view: pinch(base.view, [base.ax, base.bx], [a.x, b.x], bounds()) }];
      }
      let dx = p.x - before;
      if (first && first.id === p.id && !first.moved) {
        if (Math.hypot(p.x - first.x, p.y - first.y) <= TAP_SLOP_PX) return [];
        first.moved = true;
        dx = p.x - first.x; // the slop travel counts once the touch is a drag
      }
      if (selecting) {
        selecting.shown = true;
        selecting.x1 = p.x;
        return [{ kind: 'select', x0: selecting.x0, x1: p.x, y: selecting.y, done: false }];
      }
      return dx === 0 ? [] : [{ kind: 'view', view: panBy(view(), dx, bounds()) }];
    },
    up(p) {
      const sel = selecting;
      const start = first;
      if (!fingers.delete(p.id)) return [];
      first = null;
      if (fingers.size >= 2) {
        // The remaining fingers pinch from where they are now.
        if (!base || !fingers.has(base.a) || !fingers.has(base.b)) startPinch();
      } else {
        base = null;
      }
      selecting = null;
      if (sel && start && start.moved && fingers.size === 0) return [{ kind: 'select', x0: sel.x0, x1: p.x, y: sel.y, done: true }];
      if (start && start.id === p.id && !start.moved && p.t - start.t <= TAP_MS && Math.hypot(p.x - start.x, p.y - start.y) <= TAP_SLOP_PX) {
        return [{ kind: 'tap', x: p.x, y: p.y }];
      }
      return [];
    },
    cancel(id) {
      const had = fingers.delete(id);
      first = null;
      if (fingers.size >= 2) { if (!base || !fingers.has(base.a) || !fingers.has(base.b)) startPinch(); }
      else base = null;
      return had ? closeSelect() : [];
    },
    wheel(x, deltaX, deltaY, ctrl) {
      if (ctrl) return [{ kind: 'view', view: zoomAt(view(), x, Math.exp(-deltaY / 200), bounds()) }];
      return deltaX === 0 ? [] : [{ kind: 'view', view: panBy(view(), -deltaX, bounds()) }];
    },
  };
}
