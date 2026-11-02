/* The Island of Crete: the classic board's zoom. At zoom 1 the board shows the whole level (src/sheet.ts); a pinch,
 * the wheel or the + button zooms in, up to ZOOM_MAX times or a ZOOM_MAX_CELL px cell, whichever is less, and the view
 * then pans over the board. A step never changes the zoom: the view pans to keep Theseus two cells inside it. A new
 * level, Restart and Reset go back to the whole level; Undo keeps the zoom. DOM-free. */

export const ZOOM_MAX = 4;
export const ZOOM_MAX_CELL = 64;
/** One press of + or − multiplies or divides the zoom by this. */
export const ZOOM_STEP = 1.2;

/** The most a board whose whole-level cell is `fit` CSS px may zoom; never below 1. */
export function zoomMax(fit: number): number {
  return fit <= 0 ? 1 : Math.max(1, Math.min(ZOOM_MAX, ZOOM_MAX_CELL / fit));
}

export function clampZoom(zoom: number, fit: number): number {
  return Math.min(zoomMax(fit), Math.max(1, zoom));
}

/** The cell (CSS px) at `zoom` over the whole-level cell `fit`: `fit` itself at zoom 1, otherwise snapped to whole
 *  device pixels at `dpr`, so the board draws crisp at every zoom. */
export function zoomedCell(fit: number, zoom: number, dpr: number): number {
  const z = clampZoom(zoom, fit);
  if (z === 1) return fit;
  return Math.max(fit, Math.min(Math.round(fit * zoomMax(fit) * dpr), Math.round(fit * z * dpr)) / dpr);
}

interface RunLike { readonly past: readonly unknown[]; readonly now: unknown }

/** Whether `next` begins the try again rather than following `prev` by a step or an undo: a run with no past whose
 *  state is not one `prev` came through (an undo lands on one of those). With no `prev`, a run that just began. */
export function restarted(prev: RunLike | null, next: RunLike): boolean {
  if (!prev) return true;
  if (next.past.length > 0 || next.now === prev.now) return false;
  return !prev.past.includes(next.now);
}
