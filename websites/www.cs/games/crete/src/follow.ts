/* The Island of Crete: keeps a scrolling board's player in view. DOM-free. */

/** The scroll offset and the visible size of a scrolling board, in CSS px. */
export interface View { x: number; y: number; w: number; h: number }

/** One axis: the offset that keeps [pos, pos + size] at least `margin` inside [off, off + span], moving as little as
 *  possible, clamped to [0, content - span]. A view too small for the margins shrinks them to what fits. */
function axis(off: number, span: number, content: number, pos: number, size: number, margin: number): number {
  const m = Math.min(margin, Math.max(0, (span - size) / 2));
  let o = off;
  if (pos - m < o) o = pos - m;
  if (pos + size + m > o + span) o = pos + size + m - span;
  return Math.max(0, Math.min(o, content - span));
}

/** The scroll offset that keeps the box [left, top, size] at least `margin` inside the view, moving as little as
 *  possible, clamped to [0, content - view]. */
export function follow(view: View, content: { w: number; h: number }, box: { left: number; top: number; size: number }, margin: number): { x: number; y: number } {
  return {
    x: axis(view.x, view.w, content.w, box.left, box.size, margin),
    y: axis(view.y, view.h, content.h, box.top, box.size, margin),
  };
}
