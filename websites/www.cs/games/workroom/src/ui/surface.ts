// Pointer events on a drawing surface, handed to the gesture machine: a tap
// seeks, a drag pans (in select mode it picks a span), two fingers, ctrl or cmd
// with the wheel, or a trackpad pinch (Safari's gesture events too) zoom. A cancelled or lost
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
  /** 'select' (pinning): one finger picks a span instead of panning; two still pinch. */
  mode?: 'pan' | 'select';
  /** A span being picked (x and y in surface pixels): it starts at (x0, y0) and the pointer is now at (x1, y1); done closes it; cancelled drops the preview. */
  onSelect?(x0: number, x1: number, y0: number, y1: number, done: boolean, cancelled: boolean): void;
  /** A tap, after onSeek, with where it landed. */
  onTap?(x: number, y: number): void;
}
interface PointerLike { pointerId: number; clientX: number; clientY: number; timeStamp: number; currentTarget: Element }
interface WheelLike { clientX: number; deltaX: number; deltaY: number; ctrlKey: boolean; metaKey?: boolean; currentTarget: Element; preventDefault(): void }
/** Safari's gesture event: the scale since the pinch began. */
interface GestureLike { clientX?: number; scale?: number; currentTarget: Element; preventDefault(): void }

export interface SurfaceHandlers {
  onPointerDown(e: PointerLike): void;
  onPointerMove(e: PointerLike): void;
  onPointerUp(e: PointerLike): void;
  onPointerCancel(e: PointerLike): void;
  onLostPointerCapture(e: PointerLike): void;
  onWheel(e: WheelLike): void;
  onGestureStart(e: GestureLike): void;
  onGestureChange(e: GestureLike): void;
  onGestureEnd(e: GestureLike): void;
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
  machine.current ??= createGestures(() => live.current.view, () => live.current.bounds, () => live.current.mode ?? 'pan');
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

  /** Hands the gesture's outputs on; true when one of them changed the view. */
  const apply = (outs: GestureOut[], y?: number): boolean => {
    let moved = false;
    for (const o of outs) {
      const { view, duration, onSeek, onView } = live.current;
      if (o.kind === 'tap') {
        onSeek(Math.min(duration, Math.max(0, xToTime(view, o.x))));
        live.current.onTap?.(o.x, o.y);
      } else if (o.kind === 'select') {
        live.current.onSelect?.(o.x0, o.x1, o.y, y ?? o.y, o.done, o.cancelled === true);
      } else if (o.kind === 'view') {
        if (o.view.start !== view.start || o.view.pxPerSec !== view.pxPerSec) moved = true;
        onView(o.view);
      }
    }
    return moved;
  };
  const at = (e: PointerLike) => ({ id: e.pointerId, ...local(e.currentTarget, e.clientX, e.clientY), t: e.timeStamp });
  return {
    onPointerDown(e) {
      e.currentTarget.setPointerCapture?.(e.pointerId);
      hold(e.pointerId, true);
      apply(g.down(at(e)));
    },
    onPointerMove: e => apply(g.move(at(e)), at(e).y),
    onPointerUp(e) { apply(g.up(at(e)), at(e).y); hold(e.pointerId, false); },
    onPointerCancel(e) { apply(g.cancel(e.pointerId)); hold(e.pointerId, false); },
    onLostPointerCapture(e) { apply(g.cancel(e.pointerId)); hold(e.pointerId, false); },
    onWheel(e) {
      // Only a wheel that moved the view is stopped (and a pinch, which would otherwise zoom the whole page): the rest scrolls the page.
      const zoom = e.ctrlKey || e.metaKey === true;
      const moved = apply(g.wheel(local(e.currentTarget, e.clientX, 0).x, e.deltaX, e.deltaY, zoom));
      if (moved || zoom) e.preventDefault();
    },
    onGestureStart(e) { e.preventDefault(); g.scaleEnd(); },
    onGestureChange(e) { e.preventDefault(); apply(g.scale(local(e.currentTarget, e.clientX ?? 0, 0).x, e.scale ?? 1)); },
    onGestureEnd(e) { e.preventDefault(); g.scaleEnd(); },
  };
}
