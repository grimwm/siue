// Undo and Redo over whole documents. Each edit pushes the document it made; the documents share every part an edit
// did not touch, so a long history stays small. A push after an Undo drops what could have been redone. DOM-free.
export interface History<T> {
  now(): T;
  push(next: T): void;
  /** The document before the last edit (the same one when there is nothing to undo). */
  undo(): T;
  redo(): T;
  undoCount(): number;
  redoCount(): number;
}

export function createHistory<T>(first: T): History<T> {
  const past: T[] = [];
  const future: T[] = [];
  let now = first;
  return {
    now: () => now,
    push: next => {
      if (next === now) return;
      past.push(now);
      future.length = 0;
      now = next;
    },
    undo: () => {
      const prev = past.pop();
      if (prev === undefined) return now;
      future.push(now);
      now = prev;
      return now;
    },
    redo: () => {
      const next = future.pop();
      if (next === undefined) return now;
      past.push(now);
      now = next;
      return now;
    },
    undoCount: () => past.length,
    redoCount: () => future.length,
  };
}
