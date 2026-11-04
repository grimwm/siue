// websites/www.cs/games/crete/src/puzzle/state.ts
/* The Island of Crete: the state of one try at a level. Immutable: a turn
 * (src/puzzle/step.ts) returns a new state and never edits the one it was
 * given. DOM-free. */
import { DELTA } from './tiles.ts';
import type { Cell, Dir, Gear, Hazard, KeyColor, ObjectKind, Terrain, Tool } from './tiles.ts';
import type { Level } from './level.ts';

export type Outcome = 'playing' | 'won' | 'lost';

export interface State {
  readonly level: Level;
  readonly terrain: readonly Terrain[];
  readonly objects: readonly (ObjectKind | null)[];
  readonly player: Cell;
  readonly hearts: number;
  readonly keys: Readonly<Record<KeyColor, number>>;
  /** Gear held, each once, in the order taken. */
  readonly gear: readonly Gear[];
  readonly tools: Readonly<Record<Tool, number>>;
  /** Story pages taken: bit `i` is set once the page at `level.pageCells[i]` is. */
  readonly pages: number;
  /** Where a catch throws the player: the last safe zone stood on, or the start. */
  readonly throwBack: Cell;
  readonly minotaur: Cell | null;
  /** Minotaur turns left as stone. */
  readonly stone: number;
  /** Where Daedalus's cow stands, while it stands. */
  readonly cow: Cell | null;
  /** The moving hazards standing now, sorted by cell. */
  readonly hazards: readonly Hazard[];
  readonly relicsLeft: number;
  readonly moves: number;
  readonly outcome: Outcome;
}

/** The most hearts a try at `level` can hold: its starting hearts and one for each honey cake on its grid. Hearts
 *  never carry from one level to the next: every try starts at `level.hearts`. */
export function maxHearts(level: Level): number {
  let cakes = 0;
  for (const o of level.objects) if (o === 'cake') cakes++;
  return level.hearts + cakes;
}

export function initial(level: Level): State {
  return {
    level,
    terrain: level.terrain,
    objects: level.objects,
    player: level.player,
    hearts: level.hearts,
    keys: { red: 0, blue: 0, yellow: 0, green: 0 },
    gear: [],
    tools: { mirror: 0, cake: 0, cow: 0 },
    pages: 0,
    throwBack: level.player,
    minotaur: level.minotaur,
    stone: 0,
    cow: null,
    hazards: [...level.hazards],
    relicsLeft: level.relics,
    moves: 0,
    outcome: 'playing',
  };
}

export const inside = (lv: Level, x: Cell): boolean => x.r >= 0 && x.c >= 0 && x.r < lv.rows && x.c < lv.cols;
export const index = (s: { level: Level }, x: Cell): number => x.r * s.level.cols + x.c;
export const terrainAt = (s: State, x: Cell): Terrain => (inside(s.level, x) ? s.terrain[index(s, x)]! : 'wall');
export const same = (a: Cell, b: Cell | null): boolean => !!b && a.r === b.r && a.c === b.c;
/** Cells are never written to, so one object serves each cell of a board up to 64 a side (the editor's largest) and
 *  the row and column just outside it: a turn's steps make no new ones. */
const CELL_SPAN = 66;
const CELLS: readonly Cell[] = Array.from({ length: CELL_SPAN * CELL_SPAN }, (_, k) => ({ r: Math.floor(k / CELL_SPAN) - 1, c: (k % CELL_SPAN) - 1 }));
export const cellAt = (r: number, c: number): Cell =>
  (r >= -1 && c >= -1 && r < CELL_SPAN - 1 && c < CELL_SPAN - 1 ? CELLS[(r + 1) * CELL_SPAN + c + 1]! : { r, c });
export const next = (x: Cell, d: Dir): Cell => cellAt(x.r + DELTA[d][0], x.c + DELTA[d][1]);
export const gateOpen = (s: Pick<State, 'relicsLeft'>): boolean => s.relicsLeft === 0;

/** The ids of the pages taken, in the level's `pages:` order. */
export function pagesTaken(s: State): string[] {
  return s.level.pageIds.filter((_, i) => (s.pages >> i) & 1);
}
