/* The Island of Crete: how hard a level is, and the bars a level must clear.
 * `measure` runs the exact solver a few ways: the level as it is, without the
 * Minotaur, and refusing every catch; it labels the level chase or solo and plays
 * the plain walk to the exit. `challengeProblems` checks the numbers against the
 * campaign's bar and `sharedProblems` against the bar for shared levels. A
 * winnable level can still be no fight at all (the beast walled off, the line
 * walked straight); the bars fail that. `purposeProblems` fails a level with a
 * piece the player can walk past, and `threatProblems` one whose beast is no threat.
 * Campaign levels, the editor and endless mode all use these. DOM-free. */
import type { Level } from './level.ts';
import { parse, serialize } from './level.ts';
import { initial } from './state.ts';
import type { State } from './state.ts';
import { solve, solveRefusing, solving, caught, SOLVER_CAP } from './solver.ts';
import type { SearchRoom, SolveResult } from './solver.ts';
import { step, searchSkips } from './step.ts';
import { DIRS, DELTA, TERRAIN, HAZARDS, KEY_COLORS } from './tiles.ts';
import type { Dir, ObjectKind, Terrain } from './tiles.ts';
import { lineText, lineOf } from './cache.ts';
import { heldAt } from './pieces.ts';
import { work } from './work.ts';
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
  /** chase when some line from the start leads to a catch by the Minotaur (a hazard's or a bomb's never counts),
   *  solo when none does (or there is no Minotaur), unknown when the search for one hit its cap. */
  label: 'solo' | 'chase' | 'unknown';
  /** The plain walk (the shortest path over plain floor, taking the relics the gate needs, ignoring every piece),
   *  played on the real level, wins. False when there is no plain path. */
  naiveWins: boolean;
  /** The shortest winning line as move letters (cache.ts's lineText); '' when not solved. */
  line: string;
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
  const line = r.solved ? lineText(r.line) : '';
  if (!level.minotaur) {
    return { solved: r.solved, shortest, explored: r.explored, withoutMinotaur: null, minotaurDelta: 0, greedyWins: true, catchFree, catches, label, naiveWins, line };
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
  return { solved: r.solved, shortest, explored: r.explored, withoutMinotaur, minotaurDelta, greedyWins, catchFree, catches, label, naiveWins, line };
}

/** The pieces that make a level hard, as phrases ("4 blocks", "2 keys and 2 doors"), the most numerous first and in
 *  a fixed order on ties; a piece the level lacks is left out. Blocks and hazards count their clone machines too. */
export function hardPieces(level: Level): string[] {
  const count = (pred: (t: Terrain) => boolean) => level.terrain.filter(pred).length;
  const blocks = level.objects.filter(o => o === 'block').length + level.machines.filter(m => m.template === 'block').length;
  const keys = level.objects.filter(o => o !== null && o.startsWith('key-')).length;
  const doors = count(t => TERRAIN[t].door !== undefined);
  const toggles = count(t => t === 'toggle-open' || t === 'toggle-closed');
  const hazards = level.hazards.length + level.machines.filter(m => m.template in HAZARDS).length;
  const other = level.machines.filter(m => m.template !== 'block' && !(m.template in HAZARDS)).length;
  const buttons = count(t => t === 'button-brown' || t === 'button-red' || t === 'button');
  const entries: [number, string][] = [
    [blocks, `${blocks} ${blocks === 1 ? 'block' : 'blocks'}`],
    [keys + doors, [keys && `${keys} ${keys === 1 ? 'key' : 'keys'}`, doors && `${doors} ${doors === 1 ? 'door' : 'doors'}`].filter(Boolean).join(' and ')],
    [toggles, `${toggles} toggle ${toggles === 1 ? 'wall' : 'walls'}`],
    [hazards, `${hazards} ${hazards === 1 ? 'hazard' : 'hazards'}`],
    [other, `${other} clone ${other === 1 ? 'machine' : 'machines'}`],
    [buttons, `${buttons} ${buttons === 1 ? 'button' : 'buttons'}`],
  ];
  return entries.filter(e => e[0] > 0).sort((a, b) => b[0] - a[0]).map(e => e[1]);
}

/** Cells reachable from `from` through cells `open` allows; from a cell `jumps` names, also every cell in `to`. */
function flood(level: Level, from: number, open: (i: number) => boolean, jumps?: { from: (i: number) => boolean; to: readonly number[] }): Uint8Array {
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
    if (jumps?.from(i)) {
      for (const j of jumps.to) if (!seen[j] && open(j)) { seen[j] = 1; queue.push(j); }
    }
  }
  return seen;
}

/** True when the Minotaur may never share a cell with Theseus: the cells he could ever enter and the cells Theseus
 *  could ever enter do not meet. A cell counts open when it ever may: a door when its key is on the board, water
 *  when the level has a block or a block-cloning machine to fill it (and, for Theseus, when it holds flippers),
 *  fire when it holds fire boots, a toggle wall always; for the Minotaur also a fake wall (Theseus may open it) and
 *  a bomb (anything may set it off). Theseus's flood goes through every other piece but walls, and from any
 *  teleport to every cell beside any teleport. Generous both ways, so true is a proof. */
function apart(level: Level): boolean {
  const held = new Set<string>(level.objects.filter(o => o !== null));
  if (level.machines.some(m => m.template === 'block')) held.add('block');
  const opens = (t: Terrain): boolean => {
    const def = TERRAIN[t];
    if (def.door) return held.has(`key-${def.door}`);
    return t === 'water' ? held.has('block') : t === 'toggle-open' || t === 'toggle-closed';
  };
  const beast = flood(level, level.minotaur!.r * level.cols + level.minotaur!.c, i => {
    const t = level.terrain[i]!;
    return TERRAIN[t].minotaur || opens(t) || t === 'fake-wall' || t === 'bomb';
  });
  const teleports = level.terrain.flatMap((t, i) => (t === 'teleport' ? [i] : []));
  const besideTeleports = teleports.flatMap(i => {
    const r = Math.floor(i / level.cols), c = i % level.cols;
    return DIRS.flatMap(d => {
      const nr = r + DELTA[d][0], nc = c + DELTA[d][1];
      return nr < 0 || nc < 0 || nr >= level.rows || nc >= level.cols ? [] : [nr * level.cols + nc];
    });
  });
  const hero = flood(level, level.player.r * level.cols + level.player.c, i => {
    const t = level.terrain[i]!;
    const def = TERRAIN[t];
    if (t === 'wall') return false;
    if (def.door) return opens(t);
    return !def.needs || held.has(def.needs) || opens(t);
  }, { from: i => level.terrain[i] === 'teleport', to: besideTeleports });
  return !beast.some((b, i) => b === 1 && hero[i] === 1);
}

/** Whether some line from the start leads to a catch by the Minotaur: a breadth-first search over packed
 *  situations that stops at the first turn he reaches Theseus in; Theseus walking into him, or a hazard's or a
 *  bomb's catch, is a turn like any other.
 *  Breadth-first, a catch a few turns away is found before the search wanders off down one long line. False when
 *  it is proved none does, null when the search stored `cap` situations first or its store failed. It keeps them
 *  in `store`, by default one in memory. */
export function canCatch(level: Level, cap = SOLVER_CAP, store?: NodeStore): boolean | null {
  return finish(catching(level, cap, { store }));
}

/** canCatch in batches: every `room.every` situations expanded it yields its progress (a breadth-first search
 *  has no estimate, so its bestF and startH are 0), and its return value is the answer. */
export function* catching(level: Level, cap = SOLVER_CAP, room: SearchRoom = {}): Generator<Progress, boolean | null, void> {
  if (!level.minotaur || apart(level)) return false;
  const layout = layoutOf(level);
  const store = room.store ?? memoryStore(layout.words);
  const every = Math.max(1, room.every ?? 65_536);
  try {
    const buf = new Uint32Array(layout.words);
    const from = new Uint32Array(layout.words);
    pack(initial(level), layout, buf, 0);
    store.add(buf, 0, -1, 0, 0);
    if (store.size >= cap) return null;
    let expanded = 0;
    // Every store hands out ids in the order it stores situations, so they are the breadth-first queue.
    for (let id = 0; id < store.size; id++) {
      if (++expanded % every === 0) yield { expanded, stored: store.size, bestF: 0, startH: 0 };
      store.words(id, from, 0);
      const s = unpack(from, 0, layout, level, 0);
      for (const c of ORDER) {
        if (c > WAIT_CODE && s.tools[TOOL_LIST[c - WAIT_CODE - 1]!] <= 0) continue;
        const x = step(s, ACTIONS[c]!);
        // Walking into him is no threat of his: only his reaching Theseus counts.
        if (x.events.some(e => e.kind === 'caught' && e.by === 'minotaur' && !e.walked)) return true;
        const n = x.state;
        if (searchSkips(s, x) || n.outcome !== 'playing') continue;
        pack(n, layout, buf, 0, s, from, 0);
        store.add(buf, 0, id, c, 0);
        if (store.size >= cap) return null;
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

/** The plain walk, played on the real level, wins: measure's `naiveWins`, which fails sharedProblems. */
export function naiveWalkWins(level: Level): boolean {
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

/** Chapter 1's numbers set it: its teaching Minotaurs add 3 to 14 moves (level 9's adds 11, level 10's 13), and
 *  its hardest teaching search is level 3's 614 situations (level 9 stores 27 times that, level 10 33 times); the
 *  bar sits a little under level 9's. */
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
  out.push(...catchProblems(d));
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

/** No level needs a catch: a player cannot know to walk into the beast. The solver's shortest line takes none, and
 *  no line that takes one is shorter than the best line that never does. */
export function catchProblems(d: Difficulty): string[] {
  if (d.catchFree === 'unknown') return ['the catch-free search hit its cap'];
  if (d.catchFree === 'none') return ['no win without a catch: no level may need one'];
  if (typeof d.shortest === 'number' && d.catchFree > d.shortest) {
    return [`the fewest moves take a catch (${d.shortest}, against ${d.catchFree} without one): no level may need one`];
  }
  if (d.catches > 0) return ['the shortest line takes a catch, though a line as short takes none: no level may need one'];
  return [];
}

/** How much harder each challenge level is than the one before it, in situations stored: a steady climb, never a
 *  cliff. The first challenge level is held to the challenge bar instead. */
export const RAMP = { least: 1.2, most: 2.2 };

/** Within a chapter each challenge level stores between RAMP.least and RAMP.most times the situations of the one
 *  before it. */
export function rampProblems(previous: Difficulty, d: Difficulty, ramp = RAMP): string[] {
  const times = d.explored / Math.max(1, previous.explored);
  if (times < ramp.least) return [`stored ${d.explored} situations, ${times.toFixed(2)} × the challenge level before it (${previous.explored}); the ramp asks at least ${ramp.least} ×`];
  if (times > ramp.most) return [`stored ${d.explored} situations, ${times.toFixed(2)} × the challenge level before it (${previous.explored}); the ramp allows at most ${ramp.most} ×`];
  return [];
}

/** A fake or an invisible wall hides part of a level from the player, and the solver sees through it: `measure`
 *  counts the level as if every wall were known, while a player has to find them. So a level that hides a wall is
 *  held to a lower band than a plain level at the same spot: a gentler ramp, and a ceiling on its search. */
export const HIDDEN = { ramp: { least: 1.1, most: 1.5 }, most: 20_000 };

/** The level has a fake or an invisible wall. */
export function hidesWalls(level: Level): boolean {
  return level.terrain.some(t => t === 'fake-wall' || t === 'invisible-wall');
}

/** The ramp a challenge level climbs by: HIDDEN's when it hides a wall, RAMP's otherwise. */
export function rampOf(level: Level): { least: number; most: number } {
  return hidesWalls(level) ? HIDDEN.ramp : RAMP;
}

/** What keeps a challenge level that hides a wall inside its band; empty for a plain level. */
export function hiddenProblems(level: Level, d: Difficulty): string[] {
  if (!hidesWalls(level) || d.explored <= HIDDEN.most) return [];
  return [`the level hides walls: stored ${d.explored} situations, the ceiling for a level that hides walls is ${HIDDEN.most}`];
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

/** Chapter 1 sets it: its challenge levels win in 43 and 58 moves from 16,596 and 20,004 situations, its teaching
 *  levels in at most 36 moves from at most 614. The bar sits a little under level 9's situations and moves, a few
 *  past the longest teaching level; a chase level that clears the chase checks needs half of that again. The
 *  situation counts are this solver's (its estimate and pruning): a change to either moves them, and the bar is
 *  set again from Chapter 1's new counts. */
export const SHARED_BAR: SharedBar = { shortest: 40, explored: 12_000, chaseShortest: 30, chaseExplored: 6_000 };

/** What keeps a level from being shared; empty when it clears the bar. A shared level needs no catch either. */
export function sharedProblems(d: Difficulty, bar: SharedBar = SHARED_BAR): string[] {
  if (d.shortest === 'unknown') return ['the solver hit its cap: the level is not proved winnable'];
  if (!d.solved || typeof d.shortest !== 'number') return ['the level cannot be won'];
  const out: string[] = [];
  if (d.naiveWins) out.push('the plain walk to the exit wins');
  out.push(...catchProblems(d));
  const chase = d.label === 'chase' && d.greedyWins === false && d.minotaurDelta !== null && d.minotaurDelta >= BAR.minotaurDelta;
  const shortest = chase ? bar.chaseShortest : bar.shortest;
  const explored = chase ? bar.chaseExplored : bar.explored;
  if (d.shortest < shortest) out.push(`the quickest win is ${d.shortest} moves, the bar is ${shortest}`);
  if (d.explored < explored) out.push(`the solver searched ${d.explored} situations, the bar is ${explored}`);
  return out;
}

/** A piece of a level, and the level as it would be if the player ignored that piece (one way or more). */
export interface PieceUnit {
  name: string;
  ignored: readonly Level[];
  /** For a piece whose purpose is a use, not a touch: true for a situation where it is being used (a door of its
   *  colour opened, its gear worn on its ground, the mirror raised, the cow set down). purposeProblems reads it. */
  used?: (s: State) => boolean;
}

/** How a taken piece is used, where taking it is not yet a use: gear worn on its ground, the mirror raised, the cow
 *  set down. A spare relic is used by being taken. */
const USE: Partial<Record<ObjectKind, (s: State) => boolean>> = {
  flippers: s => s.gear.includes('flippers') && s.terrain[s.player.r * s.level.cols + s.player.c] === 'water',
  'fire-boots': s => s.gear.includes('fire-boots') && s.terrain[s.player.r * s.level.cols + s.player.c] === 'fire',
  skates: s => s.gear.includes('skates') && s.terrain[s.player.r * s.level.cols + s.player.c] === 'ice',
  suction: s => s.gear.includes('suction') && TERRAIN[s.terrain[s.player.r * s.level.cols + s.player.c]!].carries !== undefined,
  mirror: s => s.stone > 0,
  cow: s => s.cow !== null,
};

/** The gear that carries Theseus over a floor kind unharmed. */
const GEAR_OF: Partial<Record<Terrain, ObjectKind>> = {
  ice: 'skates', 'force-up': 'suction', 'force-down': 'suction', 'force-left': 'suction', 'force-right': 'suction',
};

/** The level with its terrain and objects edited, parsed again so the buttons' links follow. */
function edited(level: Level, f: (t: Terrain[], o: (ObjectKind | null)[]) => void): Level {
  const t = [...level.terrain], o = [...level.objects];
  f(t, o);
  // A clone machine taken out takes its entry in the `machines:` header with it.
  const machines = level.machines.filter(m => t[m.at.r * level.cols + m.at.c] === 'clone');
  return parse(serialize({ ...level, terrain: t, objects: o, machines }));
}

/** Every piece of a level, each with the ways it can be taken out: the piece is useless when none of them changes
 *  anything (uselessProblems). What Theseus would take is gone: a colour's keys, gear, the mirror, the cow, a spare
 *  relic. What he would open, push or cross is tried both shut, as wall (he never uses it), and gone, as floor (it no
 *  longer holds anyone back): a colour's doors (with its keys, the pair), a block, a fake wall, water, fire, teleports. Gravel, marked stones
 *  and pop-up walls, a road for Theseus and a bar to the beast, are tried as floor and as wall too. What shapes the
 *  ground is plain floor: ice and currents (tried without their gear as well), a snare with its brown buttons, an
 *  invisible wall, a thief, a bomb; a hazard is gone, and a clone machine with its red buttons is wall. The toggle
 *  walls and their button are one piece: the button never pressed, every wall staying as it starts. Floor kinds
 *  count as one piece each (all the gravel); the rest count one by one. A honey cake and a story page are not puzzle
 *  pieces: a cake is a spare heart and no level may need a catch, and a page is a reward off the quick way. */
export function pieceUnits(level: Level): PieceUnit[] {
  const out: PieceUnit[] = [];
  const at = (i: number) => `row ${Math.floor(i / level.cols) + 1}, column ${(i % level.cols) + 1}`;
  const on = (s: State) => level.terrain[s.player.r * level.cols + s.player.c]!;
  for (const color of KEY_COLORS) {
    const key: ObjectKind = `key-${color}`;
    // A colour's keys and doors are used when Theseus walks through one of its doors.
    const opened = (s: State) => TERRAIN[on(s)].door === color;
    if (level.objects.includes(key)) {
      out.push({ name: `the ${color} keys`, ignored: [edited(level, (_, o) => { o.forEach((x, i) => { if (x === key) o[i] = null; }); })], used: opened });
    }
    if (level.terrain.some(t => TERRAIN[t].door === color)) {
      out.push({ name: `the ${color} doors`, ignored: (['wall', 'floor'] as const).map(to => edited(level, (t, o) => {
        t.forEach((x, i) => { if (TERRAIN[x].door === color) t[i] = to; });
        o.forEach((x, i) => { if (x === key) o[i] = null; });
      })), used: opened });
    }
  }
  const spare = level.objects.filter(o => o === 'relic').length > level.relics;
  level.objects.forEach((x, i) => {
    if (x === 'block') {
      out.push({ name: `the block at ${at(i)}`, ignored: [
        edited(level, (t, o) => { o[i] = null; t[i] = 'wall'; }), edited(level, (_, o) => { o[i] = null; })] });
    } else if (x === 'relic' ? spare : x !== null && x !== 'cake' && x !== 'page' && !x.startsWith('key-')) {
      out.push({ name: `the ${x === 'relic' ? 'spare relic' : x} at ${at(i)}`, ignored: [edited(level, (_, o) => { o[i] = null; })], used: x === null ? undefined : USE[x] });
    }
  });
  const kinds: [string, readonly Terrain[], readonly Terrain[]][] = [
    ['gravel', ['gravel'], ['floor', 'wall']],
    ['marked stones', ['safe'], ['floor', 'wall']],
    ['pop-up walls', ['popup'], ['floor', 'wall']],
    ['ice', ['ice'], ['floor']],
    ['currents', ['force-up', 'force-down', 'force-left', 'force-right'], ['floor']],
    ['water', ['water'], ['wall', 'floor']],
    ['fire', ['fire'], ['wall', 'floor']],
    ['teleports', ['teleport'], ['wall', 'floor']],
  ];
  for (const [name, ks, as] of kinds) {
    if (!level.terrain.some(t => ks.includes(t))) continue;
    const ignored = as.map(to => edited(level, t => { t.forEach((x, i) => { if (ks.includes(x)) t[i] = to; }); }));
    const gear = GEAR_OF[ks[0]!];
    if (gear && level.objects.includes(gear)) ignored.push(edited(level, (_, o) => { o.forEach((x, i) => { if (x === gear) o[i] = null; }); }));
    out.push({ name: `the ${name}`, ignored });
  }
  if (level.terrain.some(t => t === 'button' || t === 'toggle-open' || t === 'toggle-closed')) {
    out.push({ name: 'the toggle walls and their button', ignored: [edited(level, t => {
      t.forEach((x, i) => { if (x === 'button' || x === 'toggle-open') t[i] = 'floor'; else if (x === 'toggle-closed') t[i] = 'wall'; });
    })] });
  }
  level.terrain.forEach((x, i) => {
    const linked = (t: Terrain[]) => { for (const [b, to] of Object.entries(level.links)) if (to === i) t[Number(b)] = 'floor'; };
    const one = (name: string, to: Terrain, more?: (t: Terrain[]) => void, also?: Terrain) =>
      out.push({ name: `the ${name} at ${at(i)}`, ignored: [to, ...(also ? [also] : [])].map(as => edited(level, t => { t[i] = as; more?.(t); })) });
    if (x === 'trap') one('snare', 'floor', linked);
    else if (x === 'fake-wall') one('fake wall', 'wall', undefined, 'floor');
    else if (x === 'invisible-wall') one('invisible wall', 'floor');
    else if (x === 'thief') one('thief', 'floor');
    else if (x === 'bomb') one('bomb', 'floor');
    else if (x === 'clone') one('clone machine', 'wall', linked);
  });
  level.hazards.forEach((h, k) => {
    out.push({ name: `the ${HAZARDS[h.kind].name.toLowerCase()} at ${at(h.at.r * level.cols + h.at.c)}`,
      ignored: [parse(serialize({ ...level, hazards: level.hazards.filter((_, j) => j !== k) }))] });
  });
  return out;
}

/** A piece whose only mark on the level is on the search must cut it by at least this much when ignored: the step
 *  from one challenge level to the next that the ramp aims for. */
export const USEFUL = { explored: 1.3 };

/** What ignoring a piece changes, in words; null when it changes nothing that counts, 'capped' when a search hit
 *  its cap and so proved nothing. With `strict`, a smaller search no longer counts: only the fewest moves (with a
 *  catch or without) or the level's being won. */
function changes(d: Difficulty, lv: Level, cap: number, strict = false): string | null {
  const r = solve(initial(lv), cap);
  if (!r.solved) return r.capped ? 'capped' : 'the level cannot be won';
  if (r.line.length !== d.shortest) return `the fewest moves go from ${d.shortest} to ${r.line.length}`;
  const free = solveRefusing(initial(lv), caught, cap);
  if (!free.solved) return free.capped ? 'capped' : 'no win without a catch';
  if (free.line.length !== d.catchFree) return `the fewest catch-free moves go from ${d.catchFree} to ${free.line.length}`;
  if (!strict && d.explored >= USEFUL.explored * r.explored) return `the search falls from ${d.explored} situations to ${r.explored}`;
  return null;
}

/** The cells a piece holds: wherever one of the ways of taking it out changes the level. A hazard's way leaves the
 *  ground as it was, so it holds none. */
function cellsOf(level: Level, u: PieceUnit): number[] {
  const out = new Set<number>();
  for (const lv of u.ignored) {
    for (let i = 0; i < level.terrain.length; i++) if (lv.terrain[i] !== level.terrain[i] || lv.objects[i] !== level.objects[i]) out.add(i);
  }
  return [...out];
}

/** The shortest line meets the piece: it is used (PieceUnit's `used`: a door of a key's colour walked through, gear
 *  worn on its ground, the mirror raised, the cow set down), or, for any other piece, Theseus stands on one of its
 *  cells (a spare relic taken, gravel or a teleport crossed, a button pressed), what one holds changes (a block
 *  pushed, a toggle wall turned, water filled, a bomb set off), or the beast stands in a snare there. */
function meets(level: Level, line: string, u: PieceUnit): boolean {
  const cells = u.used ? [] : cellsOf(level, u);
  if (!cells.length && !u.used) return false;
  let s = initial(level);
  const at = (c: { r: number; c: number }) => c.r * level.cols + c.c;
  for (const a of lineOf(line) ?? []) {
    s = step(s, a).state;
    if (u.used?.(s)) return true;
    const p = at(s.player), m = s.minotaur ? at(s.minotaur) : -1;
    for (const i of cells) {
      if (p === i || s.terrain[i] !== level.terrain[i] || s.objects[i] !== level.objects[i]) return true;
      if (m === i && level.terrain[i] === 'trap') return true;
    }
  }
  return false;
}

/** Every piece matters: ignoring it (pieceUnits) makes the level unwinnable or need a catch, changes its fewest
 *  moves, or cuts its search by at least USEFUL.explored times. A piece the player can ignore with nothing changing
 *  fails the level. */
export function uselessProblems(level: Level, d: Difficulty, cap = SOLVER_CAP): string[] {
  return uselessPieces(level, d, cap).map(p => p.problem);
}

/** Every piece has a purpose a player sees: the shortest line meets it (takes the key, opens the door, pushes the
 *  block, presses the button, crosses the tile), or ignoring it makes the level unwinnable or changes its fewest
 *  moves (a door that holds the beast back). A piece that only makes the search bigger is a decoy the player can
 *  walk past, and fails. Every campaign level (test/difficulty.test.ts) and every Endless level (src/endless/gate.ts)
 *  is held to this. */
export function purposeProblems(level: Level, d: Difficulty, cap = SOLVER_CAP): string[] {
  return uselessPieces(level, d, cap, true).map(p => p.problem);
}

/** uselessProblems with the pieces themselves, for a tool that takes them out (src/endless/generate.ts); with
 *  `strict`, purposeProblems's. */
export function uselessPieces(level: Level, d: Difficulty, cap = SOLVER_CAP, strict = false): { unit: PieceUnit; problem: string }[] {
  if (!d.solved || typeof d.catchFree !== 'number') return [];
  return pieceUnits(level).flatMap(u => {
    // The line meets it: it has a purpose, with no search.
    if (strict && meets(level, d.line, u)) return [];
    const found = u.ignored.map(lv => changes(d, lv, cap, strict));
    if (found.some(c => c !== null && c !== 'capped')) return [];
    if (found.includes('capped')) return [{ unit: u, problem: `${u.name}: the search without it hit its cap, so it is not proved to matter` }];
    return [{ unit: u, problem: strict
      ? `${u.name}: the shortest line never meets it, and ignoring it leaves the fewest moves at ${d.shortest}`
      : `${u.name}: ignoring it changes nothing (still ${d.shortest} moves, and the search no ${USEFUL.explored} × smaller)` }];
  });
}

/** purposeProblems in steps: it yields between the pieces (a progress of nothing searched), so a caller can stop
 *  between them (the editor's Check). Its answer is purposeProblems's. */
export function* purposing(level: Level, d: Difficulty, cap = SOLVER_CAP): Generator<Progress, string[], void> {
  if (!d.solved || typeof d.catchFree !== 'number') return [];
  const out: string[] = [];
  for (const u of pieceUnits(level)) {
    yield { expanded: 0, stored: 0, bestF: 0, startH: 0 };
    if (meets(level, d.line, u)) continue;
    const found = u.ignored.map(lv => changes(d, lv, cap, true));
    if (found.some(c => c !== null && c !== 'capped')) continue;
    out.push(found.includes('capped')
      ? `${u.name}: the search without it hit its cap, so it is not proved to matter`
      : `${u.name}: the shortest line never meets it, and ignoring it leaves the fewest moves at ${d.shortest}`);
  }
  return out;
}

/** Nothing starts under a figure: the cell where Theseus, the Minotaur or a hazard begins is plain floor with no
 *  piece on it (no relic, key, gear, tool, page, cake, button or other piece), so the player sees every piece at the
 *  start. The level text cannot write a figure on a piece, so this guards levels built in code (an edit, a draft). */
export function startProblems(level: Level): string[] {
  const figures: [string, { r: number; c: number }][] = [['Theseus', level.player]];
  if (level.minotaur) figures.push(['the Minotaur', level.minotaur]);
  for (const h of level.hazards) figures.push([`the ${HAZARDS[h.kind].name.toLowerCase()}`, h.at]);
  const out: string[] = [];
  for (const [who, at] of figures) {
    const i = at.r * level.cols + at.c;
    const t = level.terrain[i]!, o = level.objects[i];
    if (t !== 'floor' || o !== null) out.push(`${who} starts on ${o ?? t} at row ${at.r + 1}, column ${at.c + 1}: nothing may start under a figure`);
  }
  return out;
}

/** The beast along the shortest line: `live` of its `turns`, and the longest run of turns in a row he is not live. */
export interface Threat { turns: number; live: number; quiet: number }

/** A live beast: within `reach` steps of Theseus over ground he may tread (four of his turns: he takes two steps a
 *  turn); penned where no path reaches Theseus, he is quiet. Stone or held in a snare he counts as live: Theseus
 *  worked to put him there. On the shortest line of a challenge level he is live for at least a third of the turns
 *  and never quiet for more than a third of them in a row. A teaching level shows one piece, and may leave the beast
 *  behind once it has: a quarter of the turns, and no limit on a quiet stretch. */
export const THREAT = {
  reach: 8,
  challenge: { share: 1 / 3, quiet: 1 / 3 },
  teaching: { share: 1 / 4, quiet: 1 },
};

/** The beast can never be live (THREAT): he is penned apart from every cell Theseus could reach, and the level has
 *  no mirror to turn him to stone and no snare to hold him. Then every turn of every line is quiet, and
 *  threatProblems fails the level whatever its line: a check that needs no search. */
export function neverLive(level: Level): boolean {
  if (!level.minotaur || level.objects.includes('mirror') || level.terrain.includes('trap')) return false;
  return apart(level);
}

/** Steps from the Minotaur to Theseus over cells the Minotaur may enter (Theseus's own cell counts), when at most
 *  `most`; Infinity otherwise. */
function beastReach(s: State, most: number): number {
  const lv = s.level;
  if (!s.minotaur) return Infinity;
  const from = s.minotaur.r * lv.cols + s.minotaur.c, goal = s.player.r * lv.cols + s.player.c;
  const dist = new Map<number, number>([[from, 0]]);
  const queue = [from];
  for (let k = 0; k < queue.length; k++) {
    const i = queue[k]!, here = dist.get(i)!;
    if (i === goal) return here;
    if (here >= most) continue;
    const r = Math.floor(i / lv.cols), c = i % lv.cols;
    for (const d of DIRS) {
      const nr = r + DELTA[d][0], nc = c + DELTA[d][1];
      if (nr < 0 || nc < 0 || nr >= lv.rows || nc >= lv.cols) continue;
      const j = nr * lv.cols + nc;
      if (dist.has(j)) continue;
      if (j !== goal && (!TERRAIN[s.terrain[j]!].minotaur || s.objects[j] === 'block')) continue;
      dist.set(j, here + 1);
      queue.push(j);
    }
  }
  return Infinity;
}

/** The beast along the shortest line (`d.line`): a turn is live when, after it, he is within THREAT.reach steps of
 *  Theseus, or Theseus has dealt with him: he is stone, or held in a snare. */
export function threatOf(level: Level, d: Difficulty): Threat {
  const line = lineOf(d.line) ?? [];
  let s = initial(level);
  let live = 0, quiet = 0, run = 0;
  for (const a of line) {
    const x = step(s, a);
    s = x.state;
    const on = s.stone > 0 || (!!s.minotaur && (heldAt(work(s), s.minotaur) || beastReach(s, THREAT.reach) <= THREAT.reach));
    if (on) { live++; run = 0; } else quiet = Math.max(quiet, ++run);
  }
  return { turns: line.length, live, quiet };
}

/** The beast is a real threat, not penned from the start. No route that ignores him wins as quickly (he adds at
 *  least a move), and on the shortest line he is live for at least THREAT[kind].share of the turns and never quiet
 *  for more than THREAT[kind].quiet of them in a row. A level without a Minotaur has nothing to check. */
export function threatProblems(level: Level, d: Difficulty, kind: 'teaching' | 'challenge'): string[] {
  if (!level.minotaur || !d.solved || typeof d.shortest !== 'number') return [];
  const out: string[] = [];
  if (d.minotaurDelta !== null && d.minotaurDelta < 1) out.push('the beast adds no moves: a route that ignores him wins as quickly');
  const bar = THREAT[kind];
  const t = threatOf(level, d);
  if (t.live < bar.share * t.turns) out.push(`the beast is live on ${t.live} of ${t.turns} turns; the bar is ${Math.ceil(bar.share * t.turns)}`);
  if (t.quiet > bar.quiet * t.turns) out.push(`the beast is quiet for ${t.quiet} turns in a row; the bar is ${Math.floor(bar.quiet * t.turns)}`);
  return out;
}
