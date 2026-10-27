/* The Island of Crete: undo and redo for the level editor. A history is an
 * immutable value; the page commits once per edit (a whole drag is one edit).
 * DOM-free. */

/** How many edits can be undone. */
export const UNDO_LIMIT = 50;

export interface History<T> {
  readonly now: T;
  readonly canUndo: boolean;
  readonly canRedo: boolean;
  /** Oldest first; at most UNDO_LIMIT long. */
  readonly past: readonly T[];
  /** Next redo first. */
  readonly future: readonly T[];
}

function make<T>(now: T, past: readonly T[], future: readonly T[]): History<T> {
  return { now, past, future, canUndo: past.length > 0, canRedo: future.length > 0 };
}

export function startHistory<T>(t: T): History<T> {
  return make(t, [], []);
}

/** `t` becomes the present and the old present can be undone; a new edit drops the redo steps. The same object as now changes nothing. */
export function commit<T>(h: History<T>, t: T): History<T> {
  if (t === h.now) return h;
  return make(t, [...h.past, h.now].slice(-UNDO_LIMIT), []);
}

export function undoH<T>(h: History<T>): History<T> {
  if (h.past.length === 0) return h;
  return make(h.past[h.past.length - 1]!, h.past.slice(0, -1), [h.now, ...h.future]);
}

export function redoH<T>(h: History<T>): History<T> {
  if (h.future.length === 0) return h;
  return make(h.future[0]!, [...h.past, h.now], h.future.slice(1));
}
