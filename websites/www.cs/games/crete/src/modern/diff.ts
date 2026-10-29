/* The Island of Crete, modern look: which cells a turn changed, so only their pieces are rebuilt. DOM-free. */
import type { State } from '../puzzle/state.ts';

/** Indices (row * cols + col) whose terrain or object differs between two states of one level, ascending. */
export function changedCells(a: State, b: State): number[] {
  const out: number[] = [];
  for (let i = 0; i < a.terrain.length; i++) {
    if (a.terrain[i] !== b.terrain[i] || a.objects[i] !== b.objects[i]) out.push(i);
  }
  return out;
}
