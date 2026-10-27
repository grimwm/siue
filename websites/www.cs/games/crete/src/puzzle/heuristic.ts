/* The Island of Crete: a lower bound on the moves a win still needs, for an A* search. It counts moves in a
 * relaxed game over cells, where every door, toggle wall, pop-up wall, fake wall, snare, block, figure and
 * hazard is gone and water, fire, the gate, gravel, bombs and the thief are open; only walls, invisible walls and
 * clone machines stay shut. From a cell, a move in each direction may end on any cell its step and the slide or
 * carry after it pass (gear or an obstacle may stop it there), and a teleport may keep Theseus or send him beyond
 * any other teleport; a catch by the Minotaur, a hazard or a bomb may throw him to any safe zone or the start.
 * Every real action is one edge or none, so the bound never overestimates and drops by at most one per action.
 * The distances to the exit and to each relic are found once per level; a situation costs one look-up per relic
 * still on the board. DOM-free. */
import { DIRS, DELTA, TERRAIN } from './tiles.ts';
import type { Dir, Terrain } from './tiles.ts';
import type { Level } from './level.ts';
import type { State } from './state.ts';

export interface Estimate {
  /** Moves still needed at least; Infinity when no win is possible even relaxed. */
  (s: State): number;
}

/** Terrain the relaxed game keeps as wall: what Theseus never enters, however the try goes. */
const WALLS: ReadonlySet<Terrain> = new Set<Terrain>(['wall', 'invisible-wall', 'clone']);

/** The cells a move from `from` heading `d` may end on, in the relaxed game: every cell the step and the slide or
 *  carry after it would take Theseus to without gear. A teleport may keep him, or send him on to the cell beyond
 *  any other of `teleports` the way he entered (none when the level has fewer than two). Each (cell, heading) is
 *  followed once. */
function moveEnds(lv: Level, from: number, d: Dir, teleports: readonly number[]): number[] {
  const open = (r: number, c: number) => r >= 0 && c >= 0 && r < lv.rows && c < lv.cols && !WALLS.has(lv.terrain[r * lv.cols + c]!);
  const ends = new Set<number>();
  const seen = new Set<number>();
  const todo: [number, number, Dir][] = [];
  const enter = (r: number, c: number, dir: Dir) => {
    if (!open(r, c)) return;
    const key = (r * lv.cols + c) * 4 + DIRS.indexOf(dir);
    if (seen.has(key)) return;
    seen.add(key);
    ends.add(r * lv.cols + c);
    todo.push([r, c, dir]);
  };
  enter(Math.floor(from / lv.cols) + DELTA[d][0], (from % lv.cols) + DELTA[d][1], d);
  while (todo.length) {
    const [r, c, dir] = todo.pop()!;
    const t = lv.terrain[r * lv.cols + c]!;
    if (t === 'teleport') {
      for (const v of teleports) {
        if (v === r * lv.cols + c) continue;
        const br = Math.floor(v / lv.cols) + DELTA[dir][0], bc = (v % lv.cols) + DELTA[dir][1];
        if (open(br, bc) && lv.terrain[br * lv.cols + bc] !== 'teleport') enter(br, bc, dir);
      }
      continue;
    }
    const def = TERRAIN[t];
    const on = def.carries ?? (def.slides ? dir : null);
    if (on) enter(r + DELTA[on][0], c + DELTA[on][1], on);
  }
  return [...ends];
}

/** The relaxed game's edges, reversed: for each cell, the cells one move or one catch away from it. */
function relaxed(lv: Level) {
  const n = lv.rows * lv.cols;
  const open = lv.terrain.map(t => !WALLS.has(t));
  const teleports = lv.terrain.flatMap((t, i) => (t === 'teleport' ? [i] : []));
  const into: number[][] = Array.from({ length: n }, () => []);
  for (let x = 0; x < n; x++) {
    if (!open[x]) continue;
    for (const d of DIRS) for (const y of moveEnds(lv, x, d, teleports.length > 1 ? teleports : [])) into[y]!.push(x);
  }
  const thrown = new Uint8Array(n);
  lv.terrain.forEach((t, i) => { if (t === 'safe') thrown[i] = 1; });
  thrown[lv.player.r * lv.cols + lv.player.c] = 1;
  return { n, open, into, thrown };
}

/** Moves from each cell to the nearest of `targets` in the relaxed game: breadth-first over the reversed edges.
 *  A catch reaches a throw-back cell from anywhere, so the first such cell reached puts every cell one move
 *  further at most. */
function distancesTo(g: ReturnType<typeof relaxed>, targets: readonly number[]): Float64Array {
  const d = new Float64Array(g.n).fill(Infinity);
  const queue = new Int32Array(g.n);
  let tail = 0;
  for (const t of targets) if (d[t] === Infinity) { d[t] = 0; queue[tail++] = t; }
  let caught = false;
  for (let head = 0; head < tail; head++) {
    const x = queue[head]!;
    const dx = d[x]! + 1;
    for (const p of g.into[x]!) if (d[p] === Infinity) { d[p] = dx; queue[tail++] = p; }
    if (!caught && g.thrown[x]) {
      caught = true;
      for (let p = 0; p < g.n; p++) if (g.open[p] && d[p] === Infinity) { d[p] = dx; queue[tail++] = p; }
    }
  }
  return d;
}

export function estimateFor(level: Level): Estimate {
  const g = relaxed(level);
  const exits = level.terrain.flatMap((t, i) => (t === 'exit' ? [i] : []));
  const toExit = distancesTo(g, exits);
  const relicCells = level.objects.flatMap((o, i) => (o === 'relic' ? [i] : []));
  const toRelic = relicCells.map(i => distancesTo(g, [i]));
  return (s: State): number => {
    if (s.outcome === 'won') return 0;
    if (s.outcome === 'lost') return Infinity;
    const at = s.player.r * level.cols + s.player.c;
    const exit = toExit[at]!;
    if (s.relicsLeft === 0) return exit;
    let onBoard = 0;
    let nearest = Infinity;
    let farthest = 0;
    for (let k = 0; k < relicCells.length; k++) {
      if (s.objects[relicCells[k]!] !== 'relic') continue;
      const d = toRelic[k]![at]!;
      onBoard++;
      if (d < nearest) nearest = d;
      if (d > farthest) farthest = d;
    }
    if (onBoard < s.relicsLeft) return Infinity;
    // Every relic on the board is needed: each must be reached. Fewer are needed: at least the nearest one.
    return Math.max(exit, onBoard === s.relicsLeft ? farthest : nearest);
  };
}

const estimates = new WeakMap<Level, Estimate>();

/** `estimateFor(level)`, built once per Level object. */
export function estimateOf(level: Level): Estimate {
  let e = estimates.get(level);
  if (!e) estimates.set(level, e = estimateFor(level));
  return e;
}
