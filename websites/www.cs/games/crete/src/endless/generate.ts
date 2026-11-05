/* The Island of Crete: Endless's generator. A run is a seed, a piece tier and a grade; its level at depth d is found
 * by a search the seed steers (`rngOf('endless', seed, tier, grade, depth, …, round)`): a corridor maze
 * (src/endless/draft.ts), then small changes to it (a piece moved, a passage opened or walled up), each kept when it
 * brings the level no further from the band its score must fall in and the cheap checks it must pass, judged by a
 * capped solve, one without the beast, the habit players and the score. A draft that passes them all goes through the
 * whole gate (src/endless/gate.ts); a piece the gate finds useless or a tool no one needs is taken out, an open area
 * that does not earn its place is walled in, and the climb goes on. A draft that stalls gives way to the next
 * round's.
 *
 * The search spends at most `budget` situations, counted from what each search stores, so every device stops at the
 * same step and the same seed, tier, grade and depth give the same level everywhere. Past the budget the level is one
 * from the grade's bank of levels made the same way ahead of time (src/endless/bank.ts), picked by the seed. A run's
 * first level always comes from the bank, so a new run starts at once. DOM-free. */
import { parse, serialize } from '../puzzle/level.ts';
import type { Level } from '../puzzle/level.ts';
import { initial } from '../puzzle/state.ts';
import { solve, caught } from '../puzzle/solver.ts';
import { step } from '../puzzle/step.ts';
import { lineText } from '../puzzle/cache.ts';
import { measure, naiveWalkWins, neverLive, pieceUnits, threatOf, uselessPieces, THREAT, BAR } from '../puzzle/difficulty.ts';
import { finish } from '../puzzle/astar.ts';
import { scoring } from '../puzzle/rating.ts';
import type { Grade } from '../puzzle/rating.ts';
import { habitWins, HABIT_LIST } from '../puzzle/habits.ts';
import type { Difficulty } from '../puzzle/difficulty.ts';
import { rngOf, hash } from './random.ts';
import type { Rng } from './random.ts';
import { draft, familiesOf, mutate, textOf, FAMILY_CHAPTER, HIDING, STYLES } from './draft.ts';
import type { Family, Plan, Sketch } from './draft.ts';
import {
  bandAfter, bandProblems, chapterOf, floorOf, hiddenBand, hidesWalls, levelChecks, likeness, newProblems, runProblems, tidyProblems,
  CHECK_CAP, CLIMB, EXPLORED_MOST, GRADE_BANDS, HIDDEN_EASE, HIDDEN_EVERY,
} from './gate.ts';
import type { Band, Checked, Known } from './gate.ts';
import type { Dir } from '../puzzle/tiles.ts';

/** The most chapters a tier counts: Chapter 10 brings no new piece, so its pieces are Chapter 9's. */
export const TIERS = 10;

/** A level the bank holds: its text, the situations it stores, its fewest moves, its score (rating.ts), the latest
 *  chapter whose pieces it uses (a tier offers it from that chapter on), and its line. */
export interface BankLevel { text: string; explored: number; shortest: number; score: number; chapter: number; line: string }

/** A level of the run so far: its text, the situations it stores and its score. */
export interface Played { text: string; explored: number; score: number }

export interface Request {
  seed: string;
  /** The chapters whose pieces the run uses: 1 to TIERS. */
  tier: number;
  /** The run's grade: Easy, Medium or Hard. */
  grade: Grade;
  /** 1 for the run's first level. */
  depth: number;
  /** The run's levels so far, oldest first (the last is the level before this one); the generator reads the last
   *  RUN_MEMORY of them. */
  run: readonly Played[];
  /** The search's whole budget in situations, PARTS × PART_BUDGET when not given: only the browser specs set it,
   *  since another budget can make another level. */
  budget?: number;
}

/** A level Endless made: `made` by the search, or from the `bank`. */
export interface Made {
  text: string;
  /** The situations it stores, its fewest moves (difficulty.ts's measure) and its score (rating.ts). */
  explored: number;
  shortest: number;
  score: number;
  /** Its shortest line, as move letters (cache.ts's lineText), for Ariadne's thread. */
  line: string;
  from: 'made' | 'bank';
  /** Changes tried, and the situations the search spent. */
  tries: number;
  spent: number;
}

export interface Progress { tries: number; spent: number; budget: number }

/** A level's search is cut into parts: part k is a search of its own, steered by the seed and k, that may spend
 *  PART_BUDGET situations. The level is the one found by the lowest part that finds one, and the bank's when none of
 *  the PARTS does. So parts can run side by side, in as many workers as a device has, and every device still picks
 *  the same level: one with more cores only finds it sooner. */
export const PART_BUDGET = 3_000_000;
export const PARTS = 12;
/** The whole budget: what the parts may spend together. */
export const BUDGET = PART_BUDGET * PARTS;

/** The parts a request's search is cut into, and each one's budget: PARTS of PART_BUDGET, or PARTS sharing the
 *  budget a spec sets. */
export function partsOf(req: Pick<Request, 'budget'>): { parts: number; budget: number } {
  return { parts: PARTS, budget: req.budget === undefined ? PART_BUDGET : Math.max(1, Math.floor(req.budget / PARTS)) };
}
/** How many of the run's last levels a new level's layout is checked against. */
export const RUN_MEMORY = 12;
/** Changes tried on one draft before the next round's draft takes over. */
export const STEPS = 120;
/** How readily a climb takes a step up: a step that adds 0.25 to the distance is taken about one time in three. */
const TEMPERATURE = 0.25;
/** In a Hard run the cow, the easiest tool to lean on, comes in about one draft in COW_HARD of those that could
 *  hold it. */
const COW_HARD = 8;
/** Each grade's board sides, odd, as a range for a run's first levels and one for its plateau: a draft's sides are
 *  drawn from between them, by how far up the climb its band stands (`reachOf`), so a run's boards grow from small
 *  to large, the most at Hard. */
export const SIDES: Record<Grade, { first: readonly [number, number]; plateau: readonly [number, number] }> = {
  easy: { first: [11, 13], plateau: [13, 19] },
  medium: { first: [11, 15], plateau: [15, 21] },
  hard: { first: [13, 15], plateau: [15, 23] },
};
/** The share of drafts that stretch: one side from the top of the range and past it by up to STRETCH, the other from
 *  the bottom half, a wide board or a tall one. */
const STRETCHED = 0.35;
const STRETCH = 6;

/** How far up its grade's climb `band` stands: 0 at the first level's band, 1 on the plateau. */
export function reachOf(band: Band, grade: Grade): number {
  if (band.plateau) return 1;
  const g = GRADE_BANDS[grade];
  return Math.max(0, Math.min(1, (band.least - g.first[0]) / (g.plateau[0] - g.first[0])));
}

/** An odd number of `x`, rounded down, and at least 7. */
const odd = (x: number) => Math.max(7, Math.floor(x) % 2 ? Math.floor(x) : Math.floor(x) - 1);

/** A draft's sides for a grade at `reach` up its climb (reachOf): each drawn from the range between the first
 *  levels' and the plateau's (or from `range`, the bank's large boards), or stretched into a wide or a tall board. */
export function sidesOf(rng: Rng, grade: Grade, reach: number, range: readonly [number, number] | null = null): [number, number] {
  const { first, plateau } = SIDES[grade];
  const lo = range ? odd(range[0]) : odd(first[0] + (plateau[0] - first[0]) * reach + 1);
  const hi = Math.max(lo, range ? odd(range[1]) : odd(first[1] + (plateau[1] - first[1]) * reach + 1));
  const side = (a: number, b: number) => a + 2 * rng.int((b - a) / 2 + 1);
  if (rng.next() < STRETCHED) {
    const long = side(hi, odd(hi + STRETCH)), short = side(lo, odd((lo + hi) / 2 + 1));
    return rng.next() < 0.5 ? [short, long] : [long, short];
  }
  return [side(lo, hi), side(lo, hi)];
}

/** A draft's size, maze and families, drawn for the run's grade at `reach` up its climb (reachOf); with `family`,
 *  always with that family (the bank's tool asks for one, so every piece has levels of its own). Its style is drawn
 *  from STYLES, and its board grows with `reach` (or is drawn from `range`), with two relics or more from half way
 *  up. */
export function planOf(rng: Rng, tier: number, grade: Grade, hides: boolean, family: Family | null = null, reach = 0, range: readonly [number, number] | null = null): Plan {
  let all = familiesOf(tier).filter(f => !HIDING.includes(f));
  if (grade === 'hard' && family !== 'cow' && rng.int(COW_HARD) !== 0) all = all.filter(f => f !== 'cow');
  const fresh = all.filter(f => FAMILY_CHAPTER[f] === Math.min(tier, 9));
  const count = (grade === 'hard' ? 4 : 3) + rng.int(2);
  const families: Family[] = [];
  if (family && !HIDING.includes(family)) families.push(family);
  else if (fresh.length && rng.next() < 0.5) families.push(rng.pick(fresh));
  if (hides) families.push(family && HIDING.includes(family) ? family : rng.pick(HIDING));
  for (const f of rng.shuffle(all)) if (families.length < count + (hides ? 1 : 0) && !families.includes(f)) families.push(f);
  const [rows, cols] = sidesOf(rng, grade, reach, range);
  const style = rng.pick(STYLES);
  const roll = rng.next();
  return {
    rows, cols, families, relics: (reach >= 0.5 ? 2 : 1) + rng.int(2), style,
    winding: 0.3 + 0.6 * rng.next(), braid: style === 'braided' ? 0.95 + 0.05 * rng.next() : 0.45 + 0.45 * rng.next(),
    chambers: roll < 0.85 ? 0 : roll < 0.97 ? 1 : 2,
  };
}

/* The search steers by these two, and a seed must steer it the same way on every device. Math.log and Math.exp
 * may differ in their last bit from one engine to another; these use only + - * /, which IEEE 754 fixes exactly. */
const LN2 = 0.6931471805599453;

/** The natural log of x > 0. */
export function ln(x: number): number {
  let k = 0;
  while (x >= 2) { x /= 2; k++; }
  while (x < 1) { x *= 2; k--; }
  // ln(x) = 2 atanh((x - 1) / (x + 1)), x in [1, 2).
  const z = (x - 1) / (x + 1), z2 = z * z;
  let term = z, sum = 0;
  for (let i = 1; i < 60; i += 2) { sum += term / i; term *= z2; }
  return 2 * sum + k * LN2;
}

/** e to the power -y, for y >= 0. */
export function expNeg(y: number): number {
  if (!(y >= 0)) return 1;
  if (y > 60) return 0;
  let n = 0;
  while (y >= LN2) { y -= LN2; n++; }
  let term = 1, sum = 1;
  for (let i = 1; i < 30; i++) { term *= -y / i; sum += term; }
  for (; n > 0; n--) sum /= 2;
  return sum;
}

/** The searches' caps: no Endless level stores more than EXPLORED_MOST, and the measure's other searches (the
 *  catch-free line, the beast's first catch, the line without him) get room to finish. */
const SOLVE_CAP = Math.ceil(EXPLORED_MOST * 1.05);
const MEASURE_CAP = CHECK_CAP;
/** What a habit player's try is charged against the budget, in situations: its turns are cheap, but not free. */
const HABIT_CHARGE = 2_000;

/** How far a level is from passing the cheap checks: 0 when it passes them, more the further it is; Infinity when it
 *  is no level. A tidy maze first, then one capped solve, a second without the beast, the habit players, and the
 *  score against the band. */
export function distance(level: Level, band: Band, spend: (n: number, kind?: string) => void, like: (level: Level) => number = () => 0): number {
  if (!level.minotaur) return Infinity;
  // An untidy draft (a wall standing alone, a bare nub) is far, whatever it plays like.
  const untidy = tidyProblems(level).length;
  if (untidy) return 14 + untidy;
  // So is one whose layout repeats a campaign level's or looks like the run's: no solve can mend that.
  const x = like(level);
  if (x >= 1) return 13 + 10 * (x - 1);
  // Two of the gate's own failures that need no solve: the plain walk wins (sharedProblems), or the beast is penned
  // with nothing to make him live (threatProblems).
  if (naiveWalkWins(level)) { spend(0, 'cheap:walk'); return 12.5; }
  if (neverLive(level)) { spend(0, 'cheap:penned'); return 12.5; }
  const start = initial(level);
  const r = solve(start, SOLVE_CAP);
  if (!r.solved) { spend(r.explored, r.capped ? 'solve:capped' : 'solve:lost'); return r.capped ? 12 : 30; }
  spend(r.explored, 'solve');
  let far = 0;
  const floor = floorOf(chapterOf(level));
  if (r.explored < floor.explored) far += 3 * ln(floor.explored / r.explored);
  if (r.line.length < floor.shortest) far += 0.2 * (floor.shortest - r.line.length);
  let s = start, catches = 0;
  for (const a of r.line) { const x = step(s, a); s = x.state; if (caught(x.events, s)) catches++; }
  far += 3 * catches;
  const t = threatOf(level, { line: lineText(r.line) } as Difficulty);
  far += 6 * Math.max(0, THREAT.challenge.share - t.live / Math.max(1, t.turns));
  far += 6 * Math.max(0, t.quiet / Math.max(1, t.turns) - THREAT.challenge.quiet);
  if (far > 0) return far;
  const free = solve(initial({ ...level, minotaur: null }), SOLVE_CAP);
  spend(free.explored, 'free');
  let detour = 0;
  if (free.solved) {
    detour = r.line.length - free.line.length;
    far += 0.4 * Math.max(0, BAR.minotaurDelta - detour);
    let g = start;
    for (const a of free.line) g = step(g, a).state;
    if (g.outcome === 'won') far += 2;
  }
  if (far > 0) return far;
  // The habit players: each that wins puts the draft further off.
  const wins = habitWins(level, r.line.length).length;
  spend(HABIT_CHARGE * HABIT_LIST.length, 'habits');
  if (wins) return 1 + 0.5 * Math.min(wins, 4);
  // The score: a draft under its band, or over it, is far.
  const cost = { spent: 0 };
  const score = finish(scoring(level, { line: lineText(r.line), minotaurDelta: detour, explored: r.explored } as Difficulty, cost)).total;
  spend(cost.spent, 'score');
  if (score < band.least) far += 3 * ln(band.least / Math.max(1, score));
  if (score > band.most) far += 3 * ln(score / band.most);
  return far;
}

/** `s` as `level` has it: its grid and its hazards' and machines' facings, with `s`'s passages. */
function sketchFrom(s: Sketch, level: Level): Sketch {
  const text = serialize(level);
  const g = text.slice(text.indexOf('\n\n') + 2).trimEnd().split('\n').map(r => [...r]);
  const facing = new Map<number, Dir>(level.hazards.map(h => [h.at.r * level.cols + h.at.c, h.dir]));
  const machines = new Map(level.machines.map(m => [m.at.r * level.cols + m.at.c, `${m.template}-${m.dir}`]));
  return { g, doors: s.doors, facing, machines };
}

/** The variant of a piece taken out that leaves the most floor: the piece gone rather than walled. */
function emptiest(variants: readonly Level[]): Level {
  const walls = (lv: Level) => lv.terrain.filter(t => t === 'wall').length;
  return variants.reduce((a, b) => (walls(b) < walls(a) ? b : a));
}

/** The bank's level for this place: one the tier offers, that hides walls when the place does (else one that does
 *  not), in the band (else within the climb from the run's last plain level, else on the plateau), not among the
 *  run's last levels, picked by the seed and depth. */
export function fromBank(bank: readonly BankLevel[], req: Request, band: Band, hides = false): BankLevel {
  const recent = req.run.slice(-RUN_MEMORY);
  const offered = bank.filter(b => b.chapter <= req.tier);
  const runLevels = recent.map(p => parse(p.text));
  const fresh = offered.filter(b => !recent.some(p => p.text === b.text) && newProblems(parse(b.text), { features: [] }, runLevels).length === 0);
  const prev = lastPlain(req.run)?.score ?? null;
  const plateau = bandAfter(Number.MAX_SAFE_INTEGER, req.grade);
  const hiding = (b: BankLevel) => hidesWalls(parse(b.text)) === hides;
  const ladder: ((b: BankLevel) => boolean)[] = [
    b => hiding(b) && b.score >= band.least && b.score <= band.most,
    b => b.score >= band.least && b.score <= band.most && !hidesWalls(parse(b.text)),
    b => prev !== null && b.score >= prev * HIDDEN_EASE.least && b.score <= prev * CLIMB.most,
    b => b.score >= plateau.least && b.score <= plateau.most,
  ];
  const pick = (ok: readonly BankLevel[]) => ok[hash('endless-bank', req.seed, req.tier, req.grade, req.depth) % ok.length]!;
  // Only when no level the tier offers looks new does a level like one of the run's come back, never the one just
  // played while the tier offers another.
  const notLast = offered.filter(b => b.text !== req.run.at(-1)?.text);
  // A fresh level matters most, then the band: a fresh level on the ladder comes before an old one in the band; past
  // the ladder, any fresh level before any old one.
  const tries: [readonly BankLevel[], (b: BankLevel) => boolean][] = [
    ...ladder.map(fits => [fresh, fits] as [readonly BankLevel[], (b: BankLevel) => boolean]),
    ...ladder.map(fits => [notLast, fits] as [readonly BankLevel[], (b: BankLevel) => boolean]),
    [fresh, () => true], [notLast, () => true],
  ];
  for (const [pool, fits] of tries) {
    const ok = pool.filter(fits);
    if (ok.length) return pick(ok);
  }
  if (offered.length) return pick(offered);
  if (bank.length) return pick(bank);
  throw new RangeError('the bank is empty');
}

/** The run's last level that hides no walls: the climb goes on from its score. */
function lastPlain(run: readonly Played[]): Played | null {
  for (let i = run.length - 1; i >= 0; i--) if (!hidesWalls(parse(run[i]!.text))) return run[i]!;
  return null;
}

/** Where the search stands, for `search`'s callers. */
interface Spent { tries: number; spent: number }

/** What a search looks for: the tier's pieces at a grade, in a band, a level that hides walls or not, and, for the
 *  bank's tool, a family it must hold. */
export interface Aim {
  tier: number; grade: Grade; band: Band; hides: boolean; family?: Family | null;
  /** False when the levels it is new against are a bank's, not a run's: their layouts are compared, not their looks
   *  (newProblems), since a bank holds many levels of one size and style. */
  look?: boolean;
  /** The sides its drafts are drawn from, in place of its grade's for its band (the bank's large boards). */
  sides?: readonly [number, number];
}

/** Round `round` of a search's draft: the generator it climbs with, the plan it drew and the draft (null when its
 *  pieces would not fit). */
export function roundOf(key: readonly (string | number)[], aim: Aim, round: number): { rng: Rng; plan: Plan; sketch: Sketch | null } {
  const rng = rngOf('endless', ...key, round);
  const plan = planOf(rng, aim.tier, aim.grade, aim.hides, aim.family ?? null, reachOf(aim.band, aim.grade), aim.sides ?? null);
  return { rng, plan, sketch: draft(rng, plan) };
}

/** The search: the first level that passes the gate for `aim`, or null once `budget` situations are spent. `trace`
 *  hears why drafts fall short (tools/endless-bank.ts prints it). */
export function search(
  key: readonly (string | number)[], aim: Aim, previous: Difficulty | null, known: Known, run: readonly Level[],
  budget: number, at: Spent, progress?: (p: Progress) => void, trace?: (line: string) => void,
): { text: string; d: Difficulty; score: number; plan: Plan } | null {
  const stats = (at as { by?: Record<string, number> }).by;
  const spend = (n: number, kind = 'other') => { at.spent += n; if (stats) { stats[kind] = (stats[kind] ?? 0) + n; stats[kind + '#'] = (stats[kind + '#'] ?? 0) + 1; } };
  // A layout's likeness turns on its terrain alone, so moving a piece never changes it.
  const likes = new Map<string, number>();
  const like = (lv: Level): number => {
    const k = `${lv.cols}:${lv.terrain.join(',')}`;
    let x = likes.get(k);
    if (x === undefined) { x = likeness(lv, known, run, aim.look ?? true); likes.set(k, x); }
    return x;
  };
  const place = { grade: aim.grade, band: aim.band, previous };
  for (let round = 0; at.spent < budget; round++) {
    const { rng, plan, sketch: drawn } = roundOf(key, aim, round);
    let sketch = drawn;
    if (!sketch) { spend(1_000); continue; }
    const levelOf = (s: Sketch): Level | null => { try { return parse(textOf(s, '')); } catch { return null; } };
    // A change that comes back to a level already judged costs nothing more: the same text, the same distance.
    const judged = new Map<string, number>();
    const judge = (s: Sketch, lv: Level): number => {
      const text = textOf(s, '');
      let far = judged.get(text);
      if (far === undefined) {
        far = distance(lv, aim.band, spend, like);
        // A level that should hide walls and no longer does (the climb took them out) is no use here.
        if (Number.isFinite(far) && hidesWalls(lv) !== aim.hides) far += 4;
        if (aim.family && Number.isFinite(far) && !holds(lv, aim.family)) far += 4;
        judged.set(text, far);
      } else if (stats) stats['memo#'] = (stats['memo#'] ?? 0) + 1;
      return far;
    };
    let level = levelOf(sketch);
    // A draft that looks like a level of the run (its size and style) or repeats a campaign layout gives way at once:
    // a small change never mends that. It is charged a little, so a search of such drafts still ends.
    if (!level || like(level) >= 1) { spend(1_000, 'like'); continue; }
    let far = judge(sketch, level);
    const startFar = far, spentAtStart = at.spent;
    // A round that has come close gets more steps; one that stays far gives way sooner.
    let steps = STEPS;
    for (let stepNo = 0; stepNo < steps && at.spent < budget; stepNo++) {
      if (stepNo === steps - 1 && far < 2 && steps < 3 * STEPS) steps += STEPS;
      if (stepNo === Math.floor(STEPS / 3) && far >= 8) break;
      at.tries++;
      if (stepNo % 8 === 0) progress?.({ tries: at.tries, spent: at.spent, budget });
      if (far === 0 && level) {
        const d = measure(level, MEASURE_CAP);
        spend(4 * d.explored, 'measure');
        const rp = runProblems(level, d, known, run, aim.look ?? true);
        let checked: Checked | null = null;
        if (!rp.length) {
          checked = finish(levelChecks(level, d, aim.grade, false, MEASURE_CAP));
          spend(checked.score ? 8 * d.explored : 0, 'checks');
        }
        const problems = rp.length ? rp : checked!.problems.map(p => p.words);
        const purposeOnly = !rp.length && checked!.problems.length > 0 && checked!.problems.every(p => p.rule === 'purpose');
        // A problem the gate knows how to mend (a tool no one needs taken out, an open area walled in): the climb goes
        // on from the mended level.
        const mended = rp.length ? undefined : checked!.problems.find(p => p.mended)?.mended;
        if (mended) {
          trace?.(`mended: ${problems.join('; ')}`);
          if (stats) stats['mended#'] = (stats['mended#'] ?? 0) + 1;
          sketch = sketchFrom(sketch, mended);
          level = levelOf(sketch);
          far = level ? judge(sketch, level) : Infinity;
          continue;
        }
        if (problems.length && !purposeOnly) {
          trace?.(`gate: ${problems.join('; ')}`);
          if (stats) for (const q of problems) { const k = 'gate:' + q.replace(/[0-9.,×%]+/g, 'N').slice(0, 50); stats[k] = (stats[k] ?? 0) + 1; }
          far = 1; judged.set(textOf(sketch, ''), far);
        } else if (purposeOnly) {
          spend(pieceUnits(level).reduce((n, u) => n + u.ignored.length, 0) * 2 * d.explored, 'useless');
          const useless = uselessPieces(level, d, MEASURE_CAP, true);
          if (!useless.length) { far = 1; judged.set(textOf(sketch, ''), far); continue; }
          trace?.(`useless: ${useless.map(u => u.problem).join('; ')}`);
          // Take the first useless piece out and climb on from there.
          const stripped = emptiest(useless[0]!.unit.ignored);
          sketch = sketchFrom(sketch, stripped);
          level = levelOf(sketch);
          far = level ? judge(sketch, level) : Infinity;
          continue;
        } else {
          const score = checked!.score!;
          const out = bandProblems(score, aim.band);
          if (!out.length) return { text: textOf(sketch, ''), d, score: score.total, plan };
          trace?.(`band: ${out.join('; ')}`);
          if (stats) stats['gate:band'] = (stats['gate:band'] ?? 0) + 1;
          far = 0.5 + 3 * Math.abs(ln(score.total < aim.band.least ? aim.band.least / Math.max(1, score.total) : score.total / aim.band.most));
          judged.set(textOf(sketch, ''), far);
        }
      }
      const next = mutate(rng, sketch);
      const nextLevel = levelOf(next);
      if (!nextLevel) continue;
      const nextFar = judge(next, nextLevel);
      // Downhill always; uphill now and then, less the further up, so a climb is not stuck in a dip.
      if (nextFar <= far || (Number.isFinite(nextFar) && rng.next() < expNeg((nextFar - far) / TEMPERATURE))) {
        sketch = next; level = nextLevel; far = nextFar;
      }
    }
    trace?.(`round ${round}: began ${startFar.toFixed(2)}, ended ${far.toFixed(2)} from passing, ${at.spent - spentAtStart} spent`);
  }
  return null;
}

/** The level holds a piece of `family`. */
export function holds(level: Level, family: Family): boolean {
  const t = (x: string) => level.terrain.includes(x as never), o = (x: string) => level.objects.includes(x as never);
  const h = (k: string) => level.hazards.some(z => z.kind === k);
  switch (family) {
    case 'keys': return level.terrain.some(x => x.startsWith('door-'));
    case 'water': return t('water');
    case 'fire': return t('fire');
    case 'ice': return t('ice');
    case 'force': return level.terrain.some(x => x.startsWith('force-'));
    case 'blocks': return o('block') || level.machines.some(m => m.template === 'block');
    case 'toggle': return t('toggle-open') || t('toggle-closed');
    case 'mirror': return o('mirror');
    case 'cow': return o('cow');
    case 'gravel': return t('gravel');
    case 'popup': return t('popup');
    case 'fake': return t('fake-wall');
    case 'invisible': return t('invisible-wall');
    case 'snare': return t('trap');
    case 'teleport': return t('teleport');
    case 'ball': return h('ball');
    case 'glider': return h('glider');
    case 'fireball': return h('fireball');
    case 'thief': return t('thief');
    case 'bomb': return t('bomb');
    case 'clone': return t('clone');
  }
}

/** What a part of a level's search came to: the level it found, or null once it spent its budget. */
export interface Part { found: Made | null; tries: number; spent: number }

/** The place `req.depth` holds in its run: its band, whether its level hides walls (one in HIDDEN_EVERY, from the
 *  seed, once the tier has hidden walls), and the run's level before it. */
export function placeOf(req: Request): { band: Band; hides: boolean; before: Played | null } {
  const before = req.run.at(-1) ?? null;
  const plain = bandAfter(lastPlain(req.run)?.score ?? null, req.grade);
  const hides = req.depth > 1 && familiesOf(req.tier).some(f => HIDING.includes(f))
    && hash('endless-hides', req.seed, req.tier, req.grade, req.depth) % HIDDEN_EVERY === 0;
  return { band: hides ? hiddenBand(plain) : plain, hides, before };
}

/** Part `k` of the search for the run's level at `req.depth` (2 or more). */
export function makePart(req: Request, k: number, known: Known, opts: { progress?: (p: Progress) => void } = {}): Part {
  const { band, hides, before } = placeOf(req);
  const { parts, budget } = partsOf(req);
  if (!before || k < 0 || k >= parts) throw new RangeError(`no part ${k} of a search for level ${req.depth}`);
  const at: Spent = { tries: 0, spent: 0 };
  const run = req.run.slice(-RUN_MEMORY).map(p => parse(p.text));
  const found = search([req.seed, req.tier, req.grade, req.depth, 'part', k], { tier: req.tier, grade: req.grade, band, hides },
    { explored: before.explored } as Difficulty, known, run, budget, at, opts.progress);
  const made: Made | null = found
    ? { text: found.text, explored: found.d.explored, shortest: found.d.shortest as number, score: found.score, line: found.d.line, from: 'made', tries: at.tries, spent: at.spent }
    : null;
  return { found: made, ...at };
}

/** The bank's level for the run's level at `req.depth`, after parts that spent `tries` and `spent`. */
export function bankFor(req: Request, bank: readonly BankLevel[], tries = 0, spent = 0): Made {
  const place = placeOf(req);
  const b = fromBank(bank, req, place.band, place.hides);
  return { text: b.text, explored: b.explored, shortest: b.shortest, score: b.score, line: b.line, from: 'bank', tries, spent };
}

/** The level a search's parts settle on: the lowest part's that found one, with what the parts up to it spent; null
 *  while a lower part is still to come back, or when none found one (`results` holds each part's, by k). */
export function settle(results: readonly (Part | undefined)[], parts: number): { made: Made | null; done: boolean } {
  let tries = 0, spent = 0;
  for (let k = 0; k < parts; k++) {
    const r = results[k];
    if (!r) return { made: null, done: false };
    tries += r.tries; spent += r.spent;
    if (r.found) return { made: { ...r.found, tries, spent }, done: true };
  }
  return { made: null, done: true };
}

/** The run's level at `req.depth`: a run's first from the bank at once; every later one from its search's parts,
 *  run one after another here (src/endless/client.ts runs them side by side and settles on the same one), and the
 *  bank's when none finds one. `banks` holds each grade's bank. */
export function generate(req: Request, banks: Readonly<Record<Grade, readonly BankLevel[]>>, known: Known, opts: { progress?: (p: Progress) => void } = {}): Made {
  const bank = banks[req.grade];
  if (req.depth <= 1 || !req.run.length) return bankFor(req, bank);
  const { parts, budget } = partsOf(req);
  const results: Part[] = [];
  for (let k = 0; k < parts; k++) {
    const base = results.reduce((n, r) => n + r.spent, 0);
    results.push(makePart(req, k, known, { progress: p => opts.progress?.({ tries: p.tries, spent: base + p.spent, budget: parts * budget }) }));
    const s = settle(results, parts);
    if (s.made) return s.made;
  }
  return bankFor(req, bank, results.reduce((n, r) => n + r.tries, 0), results.reduce((n, r) => n + r.spent, 0));
}
