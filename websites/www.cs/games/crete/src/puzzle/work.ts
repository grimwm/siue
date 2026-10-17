// websites/www.cs/games/crete/src/puzzle/work.ts
/* The Island of Crete: the vocabulary of a turn. The actions, the events a
 * turn reports, and the working copy a turn edits before it is frozen into
 * the next state. DOM-free. */
import type { Cell, Dir, Gear, KeyColor, ObjectKind, Terrain, Tool } from './tiles.ts';
import { index, inside } from './state.ts';
import type { State } from './state.ts';

export type Action = { kind: 'move'; dir: Dir } | { kind: 'wait' } | { kind: 'tool'; tool: Tool };

export type GameEvent =
  | { kind: 'moved'; who: 'player' | 'minotaur'; from: Cell; to: Cell }
  | { kind: 'slid'; who: 'player' | 'minotaur' | 'block'; from: Cell; to: Cell }
  | { kind: 'pushed'; from: Cell; to: Cell }
  | { kind: 'opened'; color: KeyColor; at: Cell }
  | { kind: 'took'; what: ObjectKind; at: Cell }
  | { kind: 'sank'; at: Cell }
  | { kind: 'flipped' }
  | { kind: 'caught'; at: Cell; hearts: number }
  | { kind: 'stoned'; turns: number }
  | { kind: 'won' }
  | { kind: 'lost' };

type Mutable<T> = { -readonly [K in keyof T]: T[K] };
export interface Work extends Mutable<Omit<State, 'terrain' | 'objects' | 'keys' | 'tools' | 'gear'>> {
  terrain: Terrain[];
  objects: (ObjectKind | null)[];
  keys: Record<KeyColor, number>;
  tools: Record<Tool, number>;
  gear: Gear[];
}

export const work = (s: State): Work => ({
  ...s, terrain: [...s.terrain], objects: [...s.objects], keys: { ...s.keys }, tools: { ...s.tools }, gear: [...s.gear],
});
export const tAt = (w: Work, x: Cell): Terrain => (inside(w.level, x) ? w.terrain[index(w, x)]! : 'wall');
export const oAt = (w: Work, x: Cell): ObjectKind | null => (inside(w.level, x) ? w.objects[index(w, x)]! : null);
