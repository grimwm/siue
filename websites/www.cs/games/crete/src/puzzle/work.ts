// websites/www.cs/games/crete/src/puzzle/work.ts
/* The Island of Crete: the vocabulary of a turn. The actions, the events a
 * turn reports, and the working copy a turn edits before it is frozen into
 * the next state. DOM-free. */
import type { Cell, Dir, Gear, Hazard, HazardKind, KeyColor, ObjectKind, Template, Terrain, Tool } from './tiles.ts';
import { index, inside } from './state.ts';
import type { State } from './state.ts';

export type Action = { kind: 'move'; dir: Dir } | { kind: 'wait' } | { kind: 'tool'; tool: Tool };

export type GameEvent =
  | { kind: 'moved'; who: 'player' | 'minotaur' | 'hazard'; hazard?: HazardKind; from: Cell; to: Cell }
  | { kind: 'slid'; who: 'player' | 'minotaur' | 'block' | 'hazard'; hazard?: HazardKind; from: Cell; to: Cell }
  | { kind: 'pushed'; from: Cell; to: Cell }
  | { kind: 'opened'; color: KeyColor; at: Cell }
  | { kind: 'took'; what: ObjectKind; at: Cell }
  | { kind: 'sank'; at: Cell }
  | { kind: 'flipped' }
  | { kind: 'caught'; at: Cell; hearts: number; by: 'minotaur' | 'hazard' | 'bomb' }
  | { kind: 'revealed'; at: Cell; what: 'fake-wall' | 'invisible-wall' }
  | { kind: 'rose'; at: Cell }
  | { kind: 'teleported'; who: 'player' | 'block'; from: Cell; via: Cell; to: Cell }
  | { kind: 'held'; who: 'player' | 'minotaur' | 'block' | 'hazard'; at: Cell }
  | { kind: 'robbed'; at: Cell; gear: Gear[] }
  | { kind: 'exploded'; who: 'player' | 'block' | 'hazard'; at: Cell }
  | { kind: 'cloned'; what: Template; at: Cell }
  | { kind: 'sent-home'; from: Cell; to: Cell | null }
  | { kind: 'stoned'; turns: number }
  | { kind: 'won' }
  | { kind: 'lost' };

type Mutable<T> = { -readonly [K in keyof T]: T[K] };
export interface Work extends Mutable<Omit<State, 'terrain' | 'objects' | 'keys' | 'tools' | 'gear' | 'hazards'>> {
  terrain: Terrain[];
  objects: (ObjectKind | null)[];
  keys: Record<KeyColor, number>;
  tools: Record<Tool, number>;
  gear: Gear[];
  hazards: Hazard[];
  /** The hazard phase is under way: a hazard cloned now joins the end of the phase's list. Never part of a State. */
  inHazardPhase: boolean;
}

export const work = (s: State): Work => ({
  ...s, terrain: [...s.terrain], objects: [...s.objects], keys: { ...s.keys }, tools: { ...s.tools }, gear: [...s.gear], hazards: [...s.hazards],
  inHazardPhase: false,
});
export const tAt = (w: Work, x: Cell): Terrain => (inside(w.level, x) ? w.terrain[index(w, x)]! : 'wall');
export const oAt = (w: Work, x: Cell): ObjectKind | null => (inside(w.level, x) ? w.objects[index(w, x)]! : null);
