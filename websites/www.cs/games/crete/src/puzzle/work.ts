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
  /** `walked`: Theseus walked into the live Minotaur, rather than the Minotaur reaching him. */
  | { kind: 'caught'; at: Cell; hearts: number; by: 'minotaur' | 'hazard' | 'bomb'; hazard?: HazardKind; walked?: true }
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
  /** Shared with the state until the turn first changes it (setTerrain, setObject): read it freely, write it only
   *  through those, or after setting `ownTerrain` with an array of the turn's own. */
  terrain: Terrain[];
  objects: (ObjectKind | null)[];
  /** The turn has its own copy of `terrain` / `objects`. */
  ownTerrain: boolean;
  ownObjects: boolean;
  /** Shared with the state until the turn first changes one of them (own): write them only after `own(w)`. */
  keys: Record<KeyColor, number>;
  tools: Record<Tool, number>;
  gear: Gear[];
  /** The turn has its own copies of `keys`, `tools` and `gear`. */
  ownHeld: boolean;
  /** The turn's own copy, except an empty list, which is the state's: never add to it in place. */
  hazards: Hazard[];
}

/** A working copy of `s` with its own terrain, objects, keys, tools and gear, which may be written in place. */
export const work = (s: State): Work => {
  const w = turnOf(s);
  w.terrain = [...s.terrain];
  w.objects = [...s.objects];
  w.ownTerrain = w.ownObjects = true;
  own(w);
  return w;
};

/** A turn's working copy of `s`: its terrain, objects, keys, tools and gear are the state's own until the turn
 *  changes them (setTerrain, setObject, own), so a turn that changes none of them copies none. */
export const turnOf = (s: State): Work => ({
  level: s.level, terrain: s.terrain as Terrain[], objects: s.objects as (ObjectKind | null)[], ownTerrain: false, ownObjects: false,
  player: s.player, hearts: s.hearts, keys: s.keys as Record<KeyColor, number>, gear: s.gear as Gear[], tools: s.tools as Record<Tool, number>,
  ownHeld: false, pages: s.pages, throwBack: s.throwBack, minotaur: s.minotaur, stone: s.stone, cow: s.cow,
  // An empty list is shared with the state: whatever adds a hazard to an empty list gives the turn its own first.
  hazards: s.hazards.length > 0 ? [...s.hazards] : (s.hazards as Hazard[]),
  relicsLeft: s.relicsLeft, moves: s.moves, outcome: s.outcome,
});

/** The turn takes its own keys, tools and gear, to change them. */
export function own(w: Work): void {
  if (w.ownHeld) return;
  w.keys = { ...w.keys };
  w.tools = { ...w.tools };
  w.gear = [...w.gear];
  w.ownHeld = true;
}

/** Sets the terrain at index `i`, copying the state's terrain first. */
export function setTerrain(w: Work, i: number, t: Terrain): void {
  if (!w.ownTerrain) { w.terrain = w.terrain.slice(); w.ownTerrain = true; }
  w.terrain[i] = t;
}

/** Sets the object at index `i`, copying the state's objects first. */
export function setObject(w: Work, i: number, o: ObjectKind | null): void {
  if (!w.ownObjects) { w.objects = w.objects.slice(); w.ownObjects = true; }
  w.objects[i] = o;
}

export const tAt = (w: Work, x: Cell): Terrain => (inside(w.level, x) ? w.terrain[index(w, x)]! : 'wall');
export const oAt = (w: Work, x: Cell): ObjectKind | null => (inside(w.level, x) ? w.objects[index(w, x)]! : null);
