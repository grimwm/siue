/* The Island of Crete: habit players. Each one plays a level the way a player who has not thought it through would:
 * it walks the shortest plain path to what it wants next (the tool it uses, then the nearest needed relic, else
 * anything to take, then the exit), recomputed every turn on the board as the player sees it (a fake wall looks like
 * a wall, an unshown invisible wall like floor), stepping round the Minotaur's cell when a way round exists, avoiding
 * a hazard's cell and the cell it faces, bombs and thieves; it eats a honey cake at one heart, and a move it cannot
 * make becomes a wait. On top of that each has one habit for its tools or its care. A level a habit wins needed no
 * thought, so no Endless level may fall to any of them (src/puzzle/rating.ts's habitProblems). Deterministic: the same
 * level always plays the same way. DOM-free. */
import { step, act } from './step.ts';
import type { Action, GameEvent } from './step.ts';
import { initial } from './state.ts';
import type { State } from './state.ts';
import { DIRS, DELTA } from './tiles.ts';
import type { Dir, Terrain } from './tiles.ts';
import type { Level } from './level.ts';

/** The habits, with what each does on top of the plain walk. */
export const HABITS = {
  walk: 'walks round the Minotaur and never uses a tool',
  cowAtOnce: 'sets the cow down as soon as it holds it',
  cowNear: 'sets the cow down when the Minotaur is within 3 steps',
  mirrorNear: 'raises the mirror when the Minotaur is within 2 steps',
  toolsNear: 'sets the cow down and raises the mirror when the Minotaur comes near',
  careful: 'takes the safest step when its next one would be caught',
  carefulTools: 'is careful and sets the cow down and raises the mirror when the Minotaur comes near',
  cowStuck: 'sets the cow down where the Minotaur gets stuck behind a wall short of it',
  cowStuckCareful: 'sets the cow down where the Minotaur gets stuck, raises the mirror when he is near, and is careful',
} as const;
export type Habit = keyof typeof HABITS;
export const HABIT_LIST = Object.keys(HABITS) as Habit[];

/** What a habit player is: its tools and its care. */
interface Way { cow: 'none' | 'once' | 'near' | 'stuck'; mirror: boolean; careful: boolean }
const WAYS: Record<Habit, Way> = {
  walk: { cow: 'none', mirror: false, careful: false },
  cowAtOnce: { cow: 'once', mirror: false, careful: false },
  cowNear: { cow: 'near', mirror: false, careful: false },
  mirrorNear: { cow: 'none', mirror: true, careful: false },
  toolsNear: { cow: 'near', mirror: true, careful: false },
  careful: { cow: 'none', mirror: false, careful: true },
  carefulTools: { cow: 'near', mirror: true, careful: true },
  cowStuck: { cow: 'stuck', mirror: false, careful: false },
  cowStuckCareful: { cow: 'stuck', mirror: true, careful: true },
};

const MOVES: readonly Action[] = DIRS.map(dir => ({ kind: 'move', dir }) as Action);
const WAIT: Action = { kind: 'wait' };
const tool = (t: 'cow' | 'mirror' | 'cake'): Action => ({ kind: 'tool', tool: t });
const man = (a: { r: number; c: number }, b: { r: number; c: number }) => Math.abs(a.r - b.r) + Math.abs(a.c - b.c);
const caughtIn = (ev: readonly GameEvent[]) => ev.some(e => e.kind === 'caught');

/** Setting the cow down here leaves the Minotaur stuck short of it: after the drop and 10 waits the cow still stands
 *  and nothing has caught Theseus. */
function cowSticks(s: State): boolean {
  let x = step(s, tool('cow'));
  if (x.state === s || caughtIn(x.events)) return false;
  let t = x.state;
  for (let i = 0; i < 10; i++) {
    x = step(t, WAIT);
    if (caughtIn(x.events) || x.state.outcome !== 'playing') return false;
    t = x.state;
  }
  return !!t.cow;
}

/** The board as a player believes it: a fake wall looks like a wall, an unshown invisible wall like floor; with
 *  `keepMinotaur` false the Minotaur is left out (the plain path ignores him). */
function believed(s: State, keepMinotaur: boolean): State {
  let t: Terrain[] | null = null;
  for (let i = 0; i < s.terrain.length; i++) {
    const x = s.terrain[i];
    if (x === 'fake-wall' || x === 'invisible-wall') { t ??= [...s.terrain]; t[i] = x === 'fake-wall' ? 'wall' : 'floor'; }
  }
  return keepMinotaur ? { ...s, terrain: t ?? s.terrain } : { ...s, terrain: t ?? s.terrain, minotaur: null, stone: 0 };
}

/** What a player heads for, as a test of the state it reached from `s0`. */
type Goal = (s0: State, s: State) => boolean;
const relicGoal: Goal = (s0, s) => s.relicsLeft < s0.relicsLeft;
const winGoal: Goal = (_s0, s) => s.outcome === 'won';
const keyCount = (s: State) => s.keys.red + s.keys.blue + s.keys.yellow + s.keys.green;
const anyTake: Goal = (s0, s) => keyCount(s) > keyCount(s0) || s.gear.length > s0.gear.length
  || s.tools.mirror > s0.tools.mirror || s.tools.cow > s0.tools.cow || s.tools.cake > s0.tools.cake;
const toolGoal = (t: 'cow' | 'mirror'): Goal => (s0, s) => s.tools[t] > s0.tools[t];

/** The first move of a shortest path to a state meeting `goal`, and its length: breadth-first over Theseus's own
 *  moves on the believed board, the hazards frozen, never onto a hazard's cell or the cell one faces, never a move
 *  that is caught or robbed. His cell is in the way while a way round him exists; else the path ignores him. */
export function plan(real: State, goal: Goal): { first: Dir; dist: number } | null {
  return planOn(real, goal, true) ?? planOn(real, goal, false);
}

function planOn(real: State, goal: Goal, keepMinotaur: boolean): { first: Dir; dist: number } | null {
  const s0 = believed(real, keepMinotaur);
  const cols = real.level.cols;
  const danger = new Set<number>();
  for (const h of real.hazards) {
    danger.add(h.at.r * cols + h.at.c);
    const [dr, dc] = DELTA[h.dir];
    danger.add((h.at.r + dr) * cols + h.at.c + dc);
  }
  const key = (s: State) => s.player.r * cols + s.player.c;
  const seen = new Set<number>([key(s0)]);
  let layer: { s: State; first: Dir }[] = [];
  for (const d of DIRS) {
    const r = act(s0, { kind: 'move', dir: d });
    if (r.state === s0 || caughtIn(r.events)) continue;
    if (r.state.player === s0.player && r.state.terrain === s0.terrain) continue;
    if (r.events.some(e => e.kind === 'robbed')) continue;
    if (danger.has(key(r.state))) continue;
    if (goal(s0, r.state)) return { first: d, dist: 1 };
    const k = key(r.state);
    if (seen.has(k)) continue;
    seen.add(k);
    layer.push({ s: r.state, first: d });
  }
  for (let dist = 2; layer.length && dist < 400; dist++) {
    const next: typeof layer = [];
    for (const { s, first } of layer) {
      for (const d of DIRS) {
        const r = act(s, { kind: 'move', dir: d });
        if (r.state === s || caughtIn(r.events) || r.state.outcome === 'lost') continue;
        if (r.events.some(e => e.kind === 'robbed')) continue;
        const k = key(r.state);
        if (danger.has(k)) continue;
        if (goal(s0, r.state)) return { first, dist };
        if (seen.has(k)) continue;
        seen.add(k);
        next.push({ s: r.state, first });
      }
    }
    layer = next;
  }
  return null;
}

/** The plain distance to the next main goal (a relic while any is needed, else the exit); Infinity when none is
 *  reachable. rating.ts counts the moves of the best line that make it larger. */
export function goalDistance(s: State): number {
  const p = s.relicsLeft > 0 ? plan(s, relicGoal) ?? plan(s, anyTake) : plan(s, winGoal) ?? plan(s, anyTake);
  return p ? p.dist : Infinity;
}

function goalPlan(s: State, want: readonly ('cow' | 'mirror')[]): { first: Dir; dist: number } | null {
  for (const t of want) {
    if (s.objects.some(o => o === t)) {
      const p = plan(s, toolGoal(t));
      if (p) return p;
    }
  }
  if (s.relicsLeft > 0) return plan(s, relicGoal) ?? plan(s, anyTake);
  return plan(s, winGoal) ?? plan(s, anyTake);
}

/** The action habit `h` takes in `s`. */
function choose(s: State, way: Way): Action {
  const m = s.minotaur;
  const near = m ? man(m, s.player) : Infinity;
  if (s.tools.cake > 0 && s.hearts <= 1) return tool('cake');
  if (way.cow !== 'none' && s.tools.cow > 0 && !s.cow) {
    if (way.cow === 'stuck' ? cowSticks(s) : way.cow === 'once' || near <= 3) return tool('cow');
  }
  if (way.mirror && s.tools.mirror > 0 && s.stone === 0 && near <= 2) return tool('mirror');
  const want: ('cow' | 'mirror')[] = [];
  if (way.cow !== 'none') want.push('cow');
  if (way.mirror) want.push('mirror');
  const p = goalPlan(s, want);
  let a: Action = p ? { kind: 'move', dir: p.first } : WAIT;
  // A move a wall or a stone Minotaur blocks is a bump, and one into the live Minotaur a catch: a wait instead.
  if (a.kind === 'move' && (step(s, a).state === s || (m && m.r === s.player.r + DELTA[a.dir][0] && m.c === s.player.c + DELTA[a.dir][1]))) a = WAIT;
  if (way.careful && caughtIn(step(s, a).events)) {
    // The safe action that leaves the plain distance shortest; a wait comes last on ties.
    let best: Action | null = null, bestD = Infinity;
    for (const b of [...MOVES, WAIT]) {
      const x = step(s, b);
      if (x.state === s || caughtIn(x.events)) continue;
      const d = goalDistance(x.state);
      if (d < bestD) { bestD = d; best = b; }
    }
    if (best) a = best;
  }
  return a;
}

/** How a habit's try went: won or not, and the turns it took. */
export interface HabitPlay { won: boolean; turns: number }

/** Plays habit `h` on `level` for at most `limit` turns (a try still going at the limit has lost). Catches are
 *  allowed: hearts and the throw-back work as in the game. */
export function playHabit(level: Level, h: Habit, limit: number): HabitPlay {
  const way = WAYS[h];
  let s = initial(level);
  let turns = 0;
  for (; turns < limit && s.outcome === 'playing'; turns++) {
    const a = choose(s, way);
    let r = step(s, a);
    if (r.state === s) r = step(s, WAIT);
    s = r.state;
  }
  return { won: s.outcome === 'won', turns };
}

/** The turns a habit may take on a level whose fewest moves are `shortest`: four times as many, and 50 more. */
export const habitLimit = (shortest: number): number => 4 * shortest + 50;

/** The habits that win `level`, in HABIT_LIST's order. */
export function habitWins(level: Level, shortest: number): Habit[] {
  return HABIT_LIST.filter(h => playHabit(level, h, habitLimit(shortest)).won);
}
