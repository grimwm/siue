/* The Island of Crete: a lower bound on the moves a win still needs, for an A* search. It counts moves in a
 * relaxed game over cells, where every door, toggle wall, block and figure is gone and water, fire and the gate
 * are open. From a cell, a move in each direction may end on any cell its step and the slide or carry after it
 * pass (gear or an obstacle may stop it there), and a catch may throw Theseus to any safe zone or the start. Every
 * real action is one edge or none, so the bound never overestimates and drops by at most one per action. The
 * distances to the exit and to each relic are found once per level; a situation costs one look-up per relic still
 * on the board. DOM-free. */
import { DIRS, DELTA, TERRAIN } from './tiles.ts';
import type { Dir } from './tiles.ts';
import type { Level } from './level.ts';
import type { State } from './state.ts';

export interface Estimate {
  /** Moves still needed at least; Infinity when no win is possible even relaxed. */
  (s: State): number;
}

/** The cells a move from `from` heading `d` may end on, in the relaxed game: the step's cell, then each cell the
 *  slide or carry would take Theseus to without gear, until a wall, the board's edge or a cell already crossed. */
function moveEnds(lv: Level, from: number, d: Dir): number[] {
  const open = (r: number, c: number) => r >= 0 && c >= 0 && r < lv.rows && c < lv.cols && lv.terrain[r * lv.cols + c] !== 'wall';
  let r = Math.floor(from / lv.cols) + DELTA[d][0];
  let c = (from % lv.cols) + DELTA[d][1];
  if (!open(r, c)) return [];
  const ends = [r * lv.cols + c];
  const seen = new Set(ends);
  let dir = d;
  for (;;) {
    const def = TERRAIN[lv.terrain[r * lv.cols + c]!];
    if (def.carries) dir = def.carries;
    else if (!def.slides) return ends;
    const nr = r + DELTA[dir][0];
    const nc = c + DELTA[dir][1];
    if (!open(nr, nc) || seen.has(nr * lv.cols + nc)) return ends;
    r = nr;
    c = nc;
    ends.push(r * lv.cols + c);
    seen.add(r * lv.cols + c);
  }
}

/** The relaxed game's edges, reversed: for each cell, the cells one move or one catch away from it. */
function relaxed(lv: Level) {
  const n = lv.rows * lv.cols;
  const open = lv.terrain.map(t => t !== 'wall');
  const into: number[][] = Array.from({ length: n }, () => []);
  for (let x = 0; x < n; x++) {
    if (!open[x]) continue;
    for (const d of DIRS) for (const y of moveEnds(lv, x, d)) into[y]!.push(x);
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
