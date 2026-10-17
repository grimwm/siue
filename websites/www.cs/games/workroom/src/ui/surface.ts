// Pointer events on a drawing surface, handed to the gesture machine: a tap
// seeks, a drag pans, two fingers or ctrl+wheel zoom. A cancelled or lost
// pointer capture cancels the machine, so a missed pointerup cannot wedge it.
import { useEffect, useRef } from 'preact/hooks';
import { createGestures } from '../gestures.ts';
import type { GestureOut, Gestures } from '../gestures.ts';
import { xToTime } from '../zoom.ts';
import type { Bounds, View } from '../zoom.ts';

export interface SurfaceProps {
  view: View;
  bounds: Bounds;
  duration: number;
  onSeek(t: number): void;
  onView(v: View): void;
  /** true while any pointer is down on the surface, false once all are up or cancelled. */
  onHold?(held: boolean): void;
}
interface PointerLike { pointerId: number; clientX: number; clientY: number; timeStamp: number; currentTarget: Element }
interface WheelLike { clientX: number; deltaX: number; deltaY: number; ctrlKey: boolean; currentTarget: Element; preventDefault(): void }

export interface SurfaceHandlers {
  onPointerDown(e: PointerLike): void;
  onPointerMove(e: PointerLike): void;
  onPointerUp(e: PointerLike): void;
  onPointerCancel(e: PointerLike): void;
  onLostPointerCapture(e: PointerLike): void;
  onWheel(e: WheelLike): void;
}

/** Pointer coordinates relative to the surface; a missing left or top counts as 0. */
const local = (el: Element, clientX: number, clientY: number): { x: number; y: number } => {
  const r = el.getBoundingClientRect();
  return { x: clientX - (r.left || 0), y: clientY - (r.top || 0) };
};

export function useSurface(p: SurfaceProps): SurfaceHandlers {
  const live = useRef(p);
  live.current = p;
  const machine = useRef<Gestures | null>(null);
  machine.current ??= createGestures(() => live.current.view, () => live.current.bounds, () => 'pan');
  const g = machine.current;
  const down = useRef(new Set<number>());
  // A view left with a pointer still down never sees its release.
  useEffect(() => () => { if (down.current.size > 0) live.current.onHold?.(false); }, []);
  const hold = (id: number, held: boolean): void => {
    const was = down.current.size > 0;
    if (held) down.current.add(id); else down.current.delete(id);
    const is = down.current.size > 0;
    if (was !== is) live.current.onHold?.(is);
  };

  const apply = (outs: GestureOut[]): void => {
    for (const o of outs) {
      const { view, duration, onSeek, onView } = live.current;
      if (o.kind === 'tap') onSeek(Math.min(duration, Math.max(0, xToTime(view, o.x))));
      else if (o.kind === 'view') onView(o.view);
    }
  };
  const at = (e: PointerLike) => ({ id: e.pointerId, ...local(e.currentTarget, e.clientX, e.clientY), t: e.timeStamp });
  return {
    onPointerDown(e) {
      e.currentTarget.setPointerCapture?.(e.pointerId);
      hold(e.pointerId, true);
      apply(g.down(at(e)));
    },
    onPointerMove: e => apply(g.move(at(e))),
    onPointerUp(e) { apply(g.up(at(e))); hold(e.pointerId, false); },
    onPointerCancel(e) { apply(g.cancel(e.pointerId)); hold(e.pointerId, false); },
    onLostPointerCapture(e) { apply(g.cancel(e.pointerId)); hold(e.pointerId, false); },
    onWheel(e) {
      e.preventDefault();
      apply(g.wheel(local(e.currentTarget, e.clientX, 0).x, e.deltaX, e.deltaY, e.ctrlKey));
    },
  };
}
