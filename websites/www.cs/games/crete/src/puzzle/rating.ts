/* The Island of Crete: how hard a level is for a person, and the rules that keep a level a real puzzle. The
 * difficulty score adds up what makes people think, read off the solver's best line: how far the Minotaur forces
 * Theseus off the best beast-free route (the moves he adds, and the line's moves that leave that route), the moves
 * that lead away from the next goal, the waits, the traps beside the line (a step that looks safe but leaves no win),
 * and the turns where only one step is safe. The situations the solver stores are no part of it: they do not track
 * how hard people find a level (docs/superpowers/specs/2026-11-04-crete-endless-difficulty-design.md has the
 * measurements). The rules: no habit player wins (src/puzzle/habits.ts); open space earns its place (walled into
 * corridors, the level would be easier or lost) and stays under OPEN.most of the floor; a cow or a mirror is needed
 * (without it the level is lost or longer), and in a Hard level setting the cow down as soon as it is held loses.
 * Endless's gate (src/endless/gate.ts) and the editor's Check (src/editor/check.ts) both rate a level here, so they
 * always agree. Every search runs in batches and yields its progress, so the editor can stop and resume it.
 * DOM-free. */
import type { Level } from './level.ts';
import { parse, serialize } from './level.ts';
import { initial } from './state.ts';
import type { State } from './state.ts';
import { solving, caught } from './solver.ts';
import type { SolveResult } from './solver.ts';
import { step, searchSkips } from './step.ts';
import type { Action, GameEvent } from './step.ts';
import { DIRS } from './tiles.ts';
import type { Terrain } from './tiles.ts';
import { lineOf, lineText } from './cache.ts';
import type { Progress } from './astar.ts';
import type { Difficulty } from './difficulty.ts';
import { HABIT_LIST, goalDistance, habitLimit, playHabit } from './habits.ts';
import type { Habit } from './habits.ts';

/** The three difficulties of Endless; the editor names a level's band after them. */
export type Grade = 'easy' | 'medium' | 'hard';
export const GRADES: readonly Grade[] = ['easy', 'medium', 'hard'];
export const GRADE_NAMES: Readonly<Record<Grade, string>> = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };

/** The score's parts. */
export interface Score {
  /** The moves the Minotaur adds: the best line's length less the best beast-free line's. */
  detour: number;
  /** The best line's moves after which the beast-free distance to the win does not fall by one. */
  offRoute: number;
  /** The best line's moves after which the plain distance to the next goal (a relic, else the exit) is larger. */
  away: number;
  /** Waits on the best line. */
  waits: number;
  /** Steps beside the line, tried at every TRAP_EVERY-th turn, that look safe but leave no win without a catch. */
  traps: number;
  /** Turns of the best line where only one step (a move or a wait) is not caught at once. */
  forced: number;
  /** The weighted sum (WEIGHTS). */
  total: number;
}

/** Each part's weight: fitted on the campaign's levels and the old bank so that each part counts about as much as the
 *  others on a typical level, and the sum best tells the levels a habit wins from those it does not (the spec has
 *  the numbers). */
export const WEIGHTS = { detour: 1, offRoute: 1, away: 2, waits: 3, traps: 3, forced: 4 } as const;
/** Traps are tried at every third turn of the line. */
export const TRAP_EVERY = 3;

/** The searches' caps: a beast-free search from a turn of the line, and a trap's search, which proves no win. */
const freeCap = (d: Difficulty) => Math.max(50_000, 2 * d.explored);
const trapCap = (d: Difficulty) => Math.max(6_000, d.explored);

const MOVES: readonly Action[] = DIRS.map(dir => ({ kind: 'move', dir }) as Action);
const WAIT: Action = { kind: 'wait' };
const caughtIn = (ev: readonly GameEvent[]) => ev.some(e => e.kind === 'caught');

/** `s` with the Minotaur gone from the board. */
function beastFree(s: State): State {
  const level = { ...s.level, minotaur: null };
  return { ...s, level, minotaur: null, stone: 0 };
}

/** The score of `level`, whose best line and numbers `d` holds (difficulty.ts's measure). `cost.spent` adds up the
 *  situations its searches store (Endless's budget counts them). */
export function* scoring(level: Level, d: Difficulty, cost: { spent: number } = { spent: 0 }): Generator<Progress, Score, void> {
  const line = lineOf(d.line) ?? [];
  const detour = Math.max(0, d.minotaurDelta ?? 0);
  // Off the beast-free route.
  let offRoute = 0;
  if (level.minotaur && line.length) {
    const free = function* (s: State): Generator<Progress, number, void> {
      if (s.outcome === 'won') return 0;
      const r: SolveResult = yield* solving(beastFree(s), null, freeCap(d));
      cost.spent += r.explored;
      return r.solved ? r.line.length : r.capped ? NaN : Infinity;
    };
    let s = initial(level);
    let before = yield* free(s);
    for (const a of line) {
      const x = step(s, a).state;
      const after = yield* free(x);
      // A search that hit its cap proves nothing: the move counts as on the route.
      if (Number.isFinite(before) && !Number.isNaN(after) && after !== before - 1) offRoute++;
      before = after;
      s = x;
    }
  }
  // Away from the goal, waits and forced turns, along the line.
  let away = 0, waits = 0, forced = 0;
  {
    let s = initial(level);
    let dist = goalDistance(s);
    for (const a of line) {
      let safe = 0;
      for (const b of [...MOVES, WAIT]) {
        const x = step(s, b);
        // A bump is no choice, and a move that shows an invisible wall is the Wait, counted once.
        if (b.kind === 'move' && searchSkips(s, x)) continue;
        if (caughtIn(x.events) || x.state.outcome === 'lost') continue;
        safe++;
      }
      if (safe === 1) forced++;
      if (a.kind === 'wait') waits++;
      const x = step(s, a).state;
      const next = x.outcome === 'won' || x.relicsLeft < s.relicsLeft ? 0 : goalDistance(x);
      if (a.kind === 'move' && Number.isFinite(dist) && next > dist) away++;
      dist = next === 0 ? goalDistance(x) : next;
      s = x;
    }
  }
  // Traps beside the line.
  let traps = 0;
  {
    let s = initial(level);
    for (let i = 0; i < line.length; i++) {
      const a = line[i]!;
      if (i % TRAP_EVERY === 0) {
        for (const b of [...MOVES, WAIT]) {
          if (b.kind === a.kind && (b.kind !== 'move' || a.kind !== 'move' || b.dir === a.dir)) continue;
          const x = step(s, b);
          if (b.kind === 'move' && searchSkips(s, x)) continue;
          if (caughtIn(x.events) || x.state.outcome !== 'playing') continue;
          const r = yield* solving(x.state, caught, trapCap(d));
          cost.spent += r.explored;
          if (!r.solved && !r.capped) traps++;
        }
      }
      s = step(s, a).state;
    }
  }
  const total = WEIGHTS.detour * detour + WEIGHTS.offRoute * offRoute + WEIGHTS.away * away + WEIGHTS.waits * waits
    + WEIGHTS.traps * traps + WEIGHTS.forced * forced;
  return { detour, offRoute, away, waits, traps, forced, total };
}

/** Open ground: every cell but walls, shut doors, the gate's pit, closed toggle walls, fake and invisible walls and
 *  clone machines. */
const SHUT = new Set<Terrain>(['wall', 'door-red', 'door-blue', 'door-yellow', 'door-green', 'gate', 'toggle-closed', 'fake-wall', 'invisible-wall', 'clone']);

/** How open a level is: its open cells, the share of them inside some fully open 2 × 2 block, and its open areas
 *  (each a connected set of open 2 × 2 blocks; neighbouring blocks share a side), each with the cells it covers. */
export interface Openness { open: number; share: number; areas: { cells: number[] }[] }

/** Open space: OPEN.most of the open cells at most in an open 2 × 2 block, a little under the campaign's middle
 *  level and a third under its middle challenge level; an open area of OPEN.area cells or more is tried walled into
 *  corridors, and stays only if that makes the level easier or lost. */
export const OPEN = { most: 0.5, area: 6 };

export function openness(level: Level): Openness {
  const R = level.rows, C = level.cols;
  const op = (r: number, c: number) => r >= 0 && c >= 0 && r < R && c < C && !SHUT.has(level.terrain[r * C + c]!);
  let open = 0;
  for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) if (op(r, c)) open++;
  const block = new Uint8Array(R * C), inBlock = new Uint8Array(R * C);
  for (let r = 0; r + 1 < R; r++) for (let c = 0; c + 1 < C; c++) {
    if (op(r, c) && op(r + 1, c) && op(r, c + 1) && op(r + 1, c + 1)) {
      block[r * C + c] = 1;
      inBlock[r * C + c] = inBlock[(r + 1) * C + c] = inBlock[r * C + c + 1] = inBlock[(r + 1) * C + c + 1] = 1;
    }
  }
  const seen = new Uint8Array(R * C);
  const areas: { cells: number[] }[] = [];
  for (let k = 0; k < R * C; k++) {
    if (!block[k] || seen[k]) continue;
    const cells = new Set<number>();
    const queue = [k];
    seen[k] = 1;
    for (let q = 0; q < queue.length; q++) {
      const x = queue[q]!, r = Math.floor(x / C), c = x % C;
      cells.add(x); cells.add(x + 1); cells.add(x + C); cells.add(x + C + 1);
      for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
        const rr = r + dr, cc = c + dc, y = rr * C + cc;
        if (rr >= 0 && cc >= 0 && rr < R && cc < C && block[y] && !seen[y]) { seen[y] = 1; queue.push(y); }
      }
    }
    areas.push({ cells: [...cells].sort((a, b) => a - b) });
  }
  let inside = 0;
  for (const v of inBlock) inside += v;
  return { open, share: open ? inside / open : 0, areas };
}

/** `level` with an open area walled into corridors: a wall on every plain, empty floor cell of the area whose row and
 *  column are both even, so no 2 × 2 block of it stays open (each holds exactly one such cell) and its cells stay
 *  joined. Cells holding a piece or a figure stay as they are. */
export function walledIn(level: Level, cells: readonly number[]): Level {
  const C = level.cols;
  const figures = new Set<number>([level.player.r * C + level.player.c, ...level.hazards.map(h => h.at.r * C + h.at.c)]);
  if (level.minotaur) figures.add(level.minotaur.r * C + level.minotaur.c);
  const t = [...level.terrain];
  for (const i of cells) {
    const r = Math.floor(i / C), c = i % C;
    if (r % 2 === 0 && c % 2 === 0 && t[i] === 'floor' && level.objects[i] === null && !figures.has(i)) t[i] = 'wall';
  }
  return parse(serialize({ ...level, terrain: t }));
}

/** The score of a level by itself: its best line, with the Minotaur and without, then `scoring`. Null when it cannot
 *  be won (or a search hit its cap). */
function* scoreAlone(level: Level, cap: number): Generator<Progress, Score | null, void> {
  const r = yield* solving(initial(level), caught, cap);
  if (!r.solved) return null;
  let delta = 0;
  if (level.minotaur) {
    const f = yield* solving(initial({ ...level, minotaur: null }), null, cap);
    if (!f.solved) return null;
    delta = r.line.length - f.line.length;
  }
  return yield* scoring(level, { line: lineText(r.line), minotaurDelta: delta, explored: r.explored } as Difficulty);
}

/** A problem with a level: its rule (for counting and tests), what it is in plain words for the editor, and, when
 *  the level as it would be with the problem mended is known, that level (the generator climbs on from it). */
export interface Problem { rule: string; words: string; mended?: Level }

const at = (level: Level, i: number) => `row ${Math.floor(i / level.cols) + 1}, column ${(i % level.cols) + 1}`;

/** Open space that does not earn its place: more than OPEN.most of the floor open, or an open area that, walled into
 *  corridors, leaves the level as hard (score at least as high) and still won. */
export function* openProblems(level: Level, score: Score, cap: number): Generator<Progress, Problem[], void> {
  const o = openness(level);
  const out: Problem[] = [];
  if (o.share > OPEN.most) out.push({ rule: 'open', words: `Too open: ${Math.round(100 * o.share)}% of the floor is open space (at most ${Math.round(100 * OPEN.most)}%)` });
  for (const a of o.areas) {
    if (a.cells.length < OPEN.area) continue;
    const walled = walledIn(level, a.cells);
    if (walled.terrain.every((t, i) => t === level.terrain[i])) continue;
    const s = yield* scoreAlone(walled, cap);
    if (s && s.total >= score.total) {
      out.push({ rule: 'open-area', words: `An open area near ${at(level, a.cells[0]!)} does not earn its place: walled into corridors, the level is as hard (${s.total} against ${score.total})`, mended: walled });
    }
  }
  return out;
}

/** What each habit's win says, in plain words. */
const HABIT_WORDS: Readonly<Record<Habit, string>> = {
  walk: 'The plain walk wins: walking to each relic and the exit, round the Minotaur, clears it',
  cowAtOnce: 'The cow habit wins: setting the cow down at once and walking clears it',
  cowNear: 'The cow habit wins: setting the cow down when the Minotaur comes near clears it',
  mirrorNear: 'The mirror habit wins: raising the mirror when the Minotaur comes near clears it',
  toolsNear: 'The tool habit wins: using the cow and the mirror when the Minotaur comes near clears it',
  careful: 'The careful walk wins: stepping aside whenever the Minotaur would catch clears it',
  carefulTools: 'The careful walk with tools wins: stepping aside and using the tools when he is near clears it',
  cowStuck: 'The cow habit wins: setting the cow down where the Minotaur gets stuck clears it',
  cowStuckCareful: 'The cow habit wins: setting the cow down where he gets stuck and stepping aside clears it',
};

/** No habit player wins. */
export function habitProblems(level: Level, d: Difficulty): Problem[] {
  if (typeof d.shortest !== 'number') return [];
  return HABIT_LIST.filter(h => playHabit(level, h, habitLimit(d.shortest as number)).won)
    .map(h => ({ rule: `habit:${h}`, words: HABIT_WORDS[h] }));
}

/** The level with every `object` taken off. */
const without = (level: Level, object: 'cow' | 'mirror'): Level =>
  parse(serialize({ ...level, objects: level.objects.map(o => (o === object ? null : o)) }));

/** A cow or a mirror is needed: without it the level is lost or takes more moves. In a Hard level, setting the cow
 *  down as soon as it is held (on the best line) leaves no win without a catch. */
export function* toolProblems(level: Level, d: Difficulty, grade: Grade | null, cap: number): Generator<Progress, Problem[], void> {
  const out: Problem[] = [];
  if (typeof d.shortest !== 'number') return out;
  for (const tool of ['cow', 'mirror'] as const) {
    if (!level.objects.includes(tool)) continue;
    const r = yield* solving(initial(without(level, tool)), caught, cap);
    if (r.solved && r.line.length <= d.shortest) {
      out.push({ rule: `tool:${tool}`, words: `The ${tool} is not needed: without it the level is won in ${r.line.length} moves`, mended: without(level, tool) });
    }
  }
  if (grade === 'hard' && level.objects.includes('cow')) {
    let s = initial(level);
    for (const a of lineOf(d.line) ?? []) {
      if (s.tools.cow > 0 && !s.cow) {
        const x = step(s, { kind: 'tool', tool: 'cow' });
        if (!caughtIn(x.events) && x.state !== s) {
          const r = yield* solving(x.state, caught, cap);
          if (r.solved) out.push({ rule: 'tool:cow-early', words: 'The cow works too early: setting it down as soon as it is held still wins' });
        }
        break;
      }
      s = step(s, a).state;
    }
  }
  return out;
}

/** The score bands the editor names a level by, the same as Endless's (src/endless/gate.ts's GRADE_BANDS): under
 *  Easy's first levels it is Too Easy; past Hard's plateau, Beyond Hard. */
export type Band = 'Too Easy' | 'Easy' | 'Medium' | 'Hard' | 'Beyond Hard';

/** Where each band starts on the score: Easy at the least an Easy run's first level scores, Medium and Hard where
 *  their runs' plateaus start (their first levels overlap the band below), Beyond Hard past Hard's plateau. */
export const BAND_FROM = { easy: 25, medium: 70, hard: 110, beyond: 170 } as const;

export function bandOf(total: number): Band {
  if (total < BAND_FROM.easy) return 'Too Easy';
  if (total < BAND_FROM.medium) return 'Easy';
  if (total < BAND_FROM.hard) return 'Medium';
  if (total <= BAND_FROM.beyond) return 'Hard';
  return 'Beyond Hard';
}

/** The grade a band holds a level to: Too Easy as Easy, Beyond Hard as Hard. */
export function gradeOf(band: Band): Grade {
  return band === 'Too Easy' || band === 'Easy' ? 'easy' : band === 'Medium' ? 'medium' : 'hard';
}
