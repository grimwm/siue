/* The Island of Crete: how hard a level is, and the bars a level must clear.
 * `measure` runs the exact solver a few ways: the level as it is, without the
 * Minotaur, and refusing every catch; it labels the level chase or solo and plays
 * the plain walk to the exit. `challengeProblems` checks the numbers against the
 * campaign's bar and `sharedProblems` against the bar for shared levels. A
 * winnable level can still be no fight at all (the beast walled off, the line
 * walked straight); the bars fail that. Campaign levels, the editor and endless
 * mode all use these. DOM-free. */
import type { Level } from './level.ts';
import { initial } from './state.ts';
import { solving, caught, SOLVER_CAP } from './solver.ts';
import type { SearchRoom, SolveResult } from './solver.ts';
import { step } from './step.ts';
import { DIRS, DELTA, TERRAIN } from './tiles.ts';
import type { Dir, Terrain } from './tiles.ts';
import { layoutOf, pack, unpack } from './pack.ts';
import { memoryStore, StoreError } from './store.ts';
import type { NodeStore } from './store.ts';
import { ACTIONS, ORDER, TOOL_LIST, WAIT_CODE, finish } from './astar.ts';
import type { Progress } from './astar.ts';

/** A search's answer: the shortest line's length, 'none' when proved unwinnable, 'unknown' when it hit the cap. */
export type Shortest = number | 'none' | 'unknown';

export interface Difficulty {
  solved: boolean;
  /** The shortest winning line, in moves. */
  shortest: Shortest;
  /** Situations the solver stored to find it (A* with pruning, solver.ts). */
  explored: number;
  /** The shortest line with the Minotaur taken off the board; null when the level has none. */
  withoutMinotaur: Shortest | null;
  /** How many moves the Minotaur adds: `shortest - withoutMinotaur`, 0 without a Minotaur, null when either is not a number. */
  minotaurDelta: number | null;
  /** The Minotaur-free line, played on the real level, wins. True without a Minotaur; null when unknown. */
  greedyWins: boolean | null;
  /** The shortest win that is never caught. */
  catchFree: Shortest;
  /** Catches on the shortest line. */
  catches: number;
  /** chase when some line from the start leads to a catch, solo when none does (or there is no Minotaur),
   *  unknown when the search for one hit its cap. */
  label: 'solo' | 'chase' | 'unknown';
  /** The plain walk (the shortest path over plain floor, taking the relics the gate needs, ignoring every piece),
   *  played on the real level, wins. False when there is no plain path. */
  naiveWins: boolean;
}

const length = (r: SolveResult): Shortest => (r.solved ? r.line.length : r.capped ? 'unknown' : 'none');

/** Every search searches at most `cap` states; a capped search reports 'unknown', never 'none'. */
export function measure(level: Level, cap = SOLVER_CAP): Difficulty {
  return finish(measuring(level, cap));
}

/** Where measuring's searches keep their nodes (a fresh store for each), and how many each expands per batch. */
export interface MeasureRoom { store?: (words: number) => NodeStore; every?: number }

/** measure in batches: it yields each search's progress between them (astar.ts's searching). */
export function* measuring(level: Level, cap = SOLVER_CAP, room: MeasureRoom = {}): Generator<Progress, Difficulty, void> {
  const start = initial(level);
  const at = (lv: Level) => ({ store: room.store?.(layoutOf(lv).words), every: room.every });
  const r = yield* solving(start, null, cap, at(level));
  const shortest = length(r);
  let catches = 0;
  if (r.solved) {
    let s = start;
    for (const a of r.line) { const x = step(s, a); s = x.state; if (caught(x.events, s)) catches++; }
  }
  const catchFree = length(yield* solving(start, caught, cap, at(level)));
  const can = yield* catching(level, cap, at(level));
  const label = can === null ? 'unknown' : can ? 'chase' : 'solo';
  const naiveWins = naiveWalkWins(level);
  if (!level.minotaur) {
    return { solved: r.solved, shortest, explored: r.explored, withoutMinotaur: null, minotaurDelta: 0, greedyWins: true, catchFree, catches, label, naiveWins };
  }
  const alone = { ...level, minotaur: null };
  const free = yield* solving(initial(alone), null, cap, at(alone));
  const withoutMinotaur = length(free);
  let greedyWins: boolean | null = free.solved ? false : free.capped ? null : false;
  if (free.solved) {
    let s = start;
    for (const a of free.line) s = step(s, a).state;
    greedyWins = s.outcome === 'won';
  }
  const minotaurDelta = typeof shortest === 'number' && typeof withoutMinotaur === 'number' ? shortest - withoutMinotaur : null;
  return { solved: r.solved, shortest, explored: r.explored, withoutMinotaur, minotaurDelta, greedyWins, catchFree, catches, label, naiveWins };
}

/** Cells reachable from `from` through cells `open` allows. */
function flood(level: Level, from: number, open: (i: number) => boolean): Uint8Array {
  const seen = new Uint8Array(level.rows * level.cols);
  const queue = [from];
  seen[from] = 1;
  for (let k = 0; k < queue.length; k++) {
    const i = queue[k]!;
    const r = Math.floor(i / level.cols), c = i % level.cols;
    for (const d of DIRS) {
      const nr = r + DELTA[d][0], nc = c + DELTA[d][1];
      if (nr < 0 || nc < 0 || nr >= level.rows || nc >= level.cols) continue;
      const j = nr * level.cols + nc;
      if (!seen[j] && open(j)) { seen[j] = 1; queue.push(j); }
    }
  }
  return seen;
}

/** True when the Minotaur may never share a cell with Theseus: the cells he could ever enter and the cells Theseus
 *  could ever enter do not meet. A cell counts open when it ever may: a door when its key is on the board, water
 *  when the level has a block to fill it (and, for Theseus, when it holds flippers), fire when it holds fire boots,
 *  a toggle wall always. Generous both ways, so true is a proof. */
function apart(level: Level): boolean {
  const held = new Set(level.objects);
  const opens = (t: Terrain): boolean => {
    const def = TERRAIN[t];
    if (def.door) return held.has(`key-${def.door}`);
    return t === 'water' ? held.has('block') : t === 'toggle-open' || t === 'toggle-closed';
  };
  const beast = flood(level, level.minotaur!.r * level.cols + level.minotaur!.c,
    i => TERRAIN[level.terrain[i]!].minotaur || opens(level.terrain[i]!));
  const hero = flood(level, level.player.r * level.cols + level.player.c, i => {
    const t = level.terrain[i]!;
    const def = TERRAIN[t];
    if (t === 'wall') return false;
    if (def.door) return opens(t);
    return !def.needs || held.has(def.needs) || opens(t);
  });
  return !beast.some((b, i) => b === 1 && hero[i] === 1);
}

/** Whether some line from the start leads to a catch: a depth-first search over packed situations that stops
 *  at the first turn that catches (any route, not the shortest; waiting first lets the beast come on). False when
 *  it is proved none does, null when the search stored `cap` situations first or its store failed. It keeps them
 *  in `store`, by default one in memory. */
export function canCatch(level: Level, cap = SOLVER_CAP, store?: NodeStore): boolean | null {
  return finish(catching(level, cap, { store }));
}

/** canCatch in batches: every `room.every` situations expanded it yields its progress (a depth-first search has
 *  no estimate, so its bestF and startH are 0), and its return value is the answer. */
export function* catching(level: Level, cap = SOLVER_CAP, room: SearchRoom = {}): Generator<Progress, boolean | null, void> {
  if (!level.minotaur || apart(level)) return false;
  const layout = layoutOf(level);
  const store = room.store ?? memoryStore(layout.words);
  const every = Math.max(1, room.every ?? 65_536);
  try {
    const buf = new Uint32Array(layout.words);
    pack(initial(level), layout, buf, 0);
    store.add(buf, 0, -1, 0, 0);
    if (store.size >= cap) return null;
    const stack = [0];
    let expanded = 0;
    while (stack.length) {
      if (++expanded % every === 0) yield { expanded, stored: store.size, bestF: 0, startH: 0 };
      const id = stack.pop()!;
      store.words(id, buf, 0);
      const s = unpack(buf, 0, layout, level, 0);
      for (const c of ORDER) {
        if (c > WAIT_CODE && s.tools[TOOL_LIST[c - WAIT_CODE - 1]!] <= 0) continue;
        const x = step(s, ACTIONS[c]!);
        if (caught(x.events, s)) return true;
        const n = x.state;
        if (n === s || n.outcome !== 'playing') continue;
        pack(n, layout, buf, 0);
        const nid = store.add(buf, 0, id, c, 0);
        if (store.size >= cap) return null;
        if (nid >= 0) stack.push(nid);
      }
    }
    return false;
  } catch (e) {
    if (e instanceof StoreError) return null;
    throw e;
  }
}

/** More relics than this on the board and the plain walk takes the nearest needed relic each time. */
const EXACT_RELICS = 16;

/** Moves from `from` to every cell over plain floor (only walls stop it), and the direction each cell was entered
 *  by on a shortest path (directions tried in DIRS order). */
function plainPaths(level: Level, from: number): { dist: Int32Array; via: Int8Array } {
  const n = level.rows * level.cols;
  const dist = new Int32Array(n).fill(-1);
  const via = new Int8Array(n).fill(-1);
  dist[from] = 0;
  const queue = [from];
  for (let k = 0; k < queue.length; k++) {
    const i = queue[k]!;
    const r = Math.floor(i / level.cols), c = i % level.cols;
    DIRS.forEach((d, di) => {
      const nr = r + DELTA[d][0], nc = c + DELTA[d][1];
      if (nr < 0 || nc < 0 || nr >= level.rows || nc >= level.cols) return;
      const j = nr * level.cols + nc;
      if (dist[j]! >= 0 || level.terrain[j] === 'wall') return;
      dist[j] = dist[i]! + 1; via[j] = di; queue.push(j);
    });
  }
  return { dist, via };
}

/** The moves of the plain walk, or null when there is no plain path. */
export function plainWalk(level: Level): Dir[] | null {
  const cells = level.rows * level.cols;
  const startCell = level.player.r * level.cols + level.player.c;
  const relics: number[] = [];
  const exits: number[] = [];
  for (let i = 0; i < cells; i++) {
    if (level.objects[i] === 'relic') relics.push(i);
    if (level.terrain[i] === 'exit') exits.push(i);
  }
  const need = level.relics;
  const from = [startCell, ...relics].map(i => plainPaths(level, i));
  /** Point p is the start (0) or relic p - 1; its nearest exit and the moves to it. */
  const toExit = (p: number): [number, number] => {
    let best = -1, cost = Infinity;
    for (const e of exits) { const d = from[p]!.dist[e]!; if (d >= 0 && d < cost) { cost = d; best = e; } }
    return [best, cost];
  };
  const leg = (p: number, q: number) => { const d = from[p]!.dist[q === 0 ? startCell : relics[q - 1]!]!; return d < 0 ? Infinity : d; };
  let order: number[] | null = null;
  if (need === 0) order = [];
  else if (relics.length <= EXACT_RELICS) {
    // Shortest order: dp over the sets of relics taken, ending at each.
    const R = relics.length;
    const dp = new Float64Array((1 << R) * R).fill(Infinity);
    const back = new Int8Array((1 << R) * R).fill(-1);
    for (let j = 0; j < R; j++) dp[(1 << j) * R + j] = leg(0, j + 1);
    let best = Infinity, bestAt = -1;
    for (let m = 1; m < 1 << R; m++) {
      const size = popcount(m);
      if (size > need) continue;
      for (let j = 0; j < R; j++) {
        const here = dp[m * R + j]!;
        if (!(m & (1 << j)) || here === Infinity) continue;
        if (size === need) {
          const total = here + toExit(j + 1)[1];
          if (total < best) { best = total; bestAt = m * R + j; }
          continue;
        }
        for (let k = 0; k < R; k++) {
          if (m & (1 << k)) continue;
          const at = (m | (1 << k)) * R + k;
          const cost = here + leg(j + 1, k + 1);
          if (cost < dp[at]!) { dp[at] = cost; back[at] = j; }
        }
      }
    }
    if (bestAt >= 0) {
      order = [];
      for (let at = bestAt; ;) {
        const m = Math.floor(at / R), j = at % R;
        order.push(j + 1);
        if (back[at]! < 0) break;
        at = (m & ~(1 << j)) * R + back[at]!;
      }
      order.reverse();
    }
  } else {
    order = [];
    const left = new Set(relics.map((_, j) => j + 1));
    let at = 0;
    while (order.length < need) {
      let next = -1, cost = Infinity;
      for (const q of left) { const d = leg(at, q); if (d < cost) { cost = d; next = q; } }
      if (next < 0) { order = null; break; }
      order.push(next); left.delete(next); at = next;
    }
  }
  if (!order) return null;
  const last = order.length ? order[order.length - 1]! : 0;
  const [exit] = toExit(last);
  if (exit < 0) return null;
  const moves: Dir[] = [];
  const stops = [0, ...order];
  const targets = [...order.map(q => relics[q - 1]!), exit];
  stops.forEach((p, k) => {
    const { via } = from[p]!;
    const target = targets[k]!;
    const legMoves: Dir[] = [];
    for (let i = target; via[i]! >= 0;) {
      const d = DIRS[via[i]!]!;
      legMoves.push(d);
      i -= DELTA[d][0] * level.cols + DELTA[d][1];
    }
    moves.push(...legMoves.reverse());
  });
  return moves;
}

function popcount(m: number): number { let n = 0; for (; m; m &= m - 1) n++; return n; }

/** The plain walk, played on the real level, wins. */
function naiveWalkWins(level: Level): boolean {
  const walk = plainWalk(level);
  if (!walk) return false;
  let s = initial(level);
  for (const dir of walk) {
    s = step(s, { kind: 'move', dir }).state;
    if (s.outcome !== 'playing') break;
  }
  return s.outcome === 'won';
}

/** The bar. Every level with a Minotaur: the Minotaur shapes the route (it adds moves, or the line that ignores
 *  it loses). A chapter's challenge levels, past its teaching stretch, are a real fight on top of that. */
export interface Bar {
  /** A challenge level's Minotaur adds at least this many moves. */
  minotaurDelta: number;
  /** A challenge level stores at least this many times the situations of the chapter's hardest teaching level. */
  exploredTimes: number;
}

/** Chapter 1's numbers set it: its teaching Minotaurs add 3 to 13 moves (level 9's adds 22, level 10's 31), and
 *  its hardest teaching search is level 3's 614 situations (level 9 stores 39 times that, level 10 47 times); the
 *  bar is about half of level 9's. */
export const BAR: Bar = { minotaurDelta: 8, exploredTimes: 20 };

/** Where a challenge level sits: the chapter's teaching levels, measured. */
export interface ChallengeContext { teaching: readonly Difficulty[] }

/** What keeps the level from clearing the bar; empty when it clears it. With a context, the level is a challenge
 *  level and the challenge rules apply too. */
export function challengeProblems(d: Difficulty, bar: Bar = BAR, context?: ChallengeContext): string[] {
  const out: string[] = [];
  if (d.shortest === 'unknown') return ['the solver hit its cap: the level is not proved winnable'];
  if (!d.solved) return ['the level cannot be won'];
  const hasMinotaur = d.withoutMinotaur !== null;
  if (hasMinotaur) {
    if (d.minotaurDelta === null || d.greedyWins === null) out.push('the Minotaur-free search hit its cap');
    else if (d.minotaurDelta <= 0 && d.greedyWins) out.push('the Minotaur does not matter: the line that ignores him wins, no longer');
  }
  if (!context) return out;
  if (!hasMinotaur) return [...out, 'a challenge level has a Minotaur'];
  if (d.greedyWins !== false) out.push('a challenge level: the line that ignores the Minotaur must lose');
  if (d.minotaurDelta !== null && d.minotaurDelta < bar.minotaurDelta) {
    out.push(`a challenge level: the Minotaur adds ${d.minotaurDelta} moves, the bar is ${bar.minotaurDelta}`);
  }
  const most = (f: (t: Difficulty) => number) => Math.max(0, ...context.teaching.map(f));
  const explored = most(t => t.explored);
  if (d.explored < bar.exploredTimes * explored) {
    out.push(`a challenge level: stored ${d.explored} situations, the bar is ${bar.exploredTimes} × ${explored} = ${bar.exploredTimes * explored}`);
  }
  const longest = most(t => (typeof t.shortest === 'number' ? t.shortest : 0));
  if (typeof d.shortest === 'number' && d.shortest < longest) {
    out.push(`a challenge level: ${d.shortest} moves, shorter than the longest teaching level's ${longest}`);
  }
  return out;
}

/** Within a chapter no challenge level is easier (fewer situations stored) than the one before it. */
export function rampProblems(previous: Difficulty, d: Difficulty): string[] {
  return d.explored < previous.explored
    ? [`stored ${d.explored} situations, fewer than the challenge level before it (${previous.explored})`]
    : [];
}

/** The bar for shared levels, set against a chapter's challenge levels. It never needs a Minotaur: the quickest
 *  win is long, the solver stores many situations to find it, and the plain walk does not win. A chase level whose
 *  Minotaur adds at least `BAR.minotaurDelta` moves, and whose line that ignores him loses, clears it on lower
 *  puzzle numbers. */
export interface SharedBar {
  /** The quickest win takes at least this many moves. */
  shortest: number;
  /** The solver stores at least this many situations to find it. */
  explored: number;
  /** The same two for a chase level whose Minotaur shapes the route. */
  chaseShortest: number;
  chaseExplored: number;
}

/** Chapter 1 sets it: its challenge levels win in 54 and 76 moves from 24,086 and 28,990 situations, its teaching
 *  levels in at most 36 moves from at most 614. The bar is about half of level 9's situations and a few moves
 *  past the longest teaching level; a chase level that clears the chase checks needs half of that again. The
 *  situation counts are this solver's (its estimate and pruning): a change to either moves them, and the bar is
 *  set again from Chapter 1's new counts. */
export const SHARED_BAR: SharedBar = { shortest: 40, explored: 12_000, chaseShortest: 30, chaseExplored: 6_000 };

/** What keeps a level from being shared; empty when it clears the bar. */
export function sharedProblems(d: Difficulty, bar: SharedBar = SHARED_BAR): string[] {
  if (d.shortest === 'unknown') return ['the solver hit its cap: the level is not proved winnable'];
  if (!d.solved || typeof d.shortest !== 'number') return ['the level cannot be won'];
  const out: string[] = [];
  if (d.naiveWins) out.push('the plain walk to the exit wins');
  const chase = d.label === 'chase' && d.greedyWins === false && d.minotaurDelta !== null && d.minotaurDelta >= BAR.minotaurDelta;
  const shortest = chase ? bar.chaseShortest : bar.shortest;
  const explored = chase ? bar.chaseExplored : bar.explored;
  if (d.shortest < shortest) out.push(`the quickest win is ${d.shortest} moves, the bar is ${shortest}`);
  if (d.explored < explored) out.push(`the solver searched ${d.explored} situations, the bar is ${explored}`);
  return out;
}
