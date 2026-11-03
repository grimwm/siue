/* The Island of Crete: Endless's generator. A run is a seed and a piece tier; its level at depth d is found by a
 * search the seed steers (`rngOf('endless', seed, tier, depth, round)`): a draft of rooms and halls
 * (src/endless/draft.ts), then small changes to it (a piece moved, a doorway opened or walled up), each kept when it
 * brings the level no further from the band it must fall in and the cheap checks it must pass, judged by one capped
 * solve. A draft that passes them all goes through the whole gate (src/endless/gate.ts); a piece the gate finds
 * useless is taken out and the climb goes on. A draft that stalls gives way to the next round's.
 *
 * The search spends at most `budget` situations, counted from what each search stores, so every device stops at the
 * same step and the same seed, tier and depth give the same level everywhere. Past the budget the level is one from
 * the bank of levels made the same way ahead of time (src/endless/bank.ts), picked by the seed. A run's first level
 * always comes from the bank, so a new run starts at once. DOM-free. */
import { parse, serialize } from '../puzzle/level.ts';
import type { Level } from '../puzzle/level.ts';
import { initial } from '../puzzle/state.ts';
import { solve, caught } from '../puzzle/solver.ts';
import { step } from '../puzzle/step.ts';
import { lineText } from '../puzzle/cache.ts';
import { measure, pieceUnits, threatOf, uselessPieces, THREAT, BAR } from '../puzzle/difficulty.ts';
import type { Difficulty } from '../puzzle/difficulty.ts';
import { rngOf, hash } from './random.ts';
import type { Rng } from './random.ts';
import { draft, familiesOf, mutate, textOf, FAMILY_CHAPTER, HIDING } from './draft.ts';
import type { Family, Plan, Sketch } from './draft.ts';
import { bandAfter, chapterOf, floorOf, quickProblems, newProblems } from './gate.ts';
import type { Band, Known } from './gate.ts';
import type { Dir } from '../puzzle/tiles.ts';

/** The most chapters a tier counts: Chapter 10 brings no new piece, so its pieces are Chapter 9's. */
export const TIERS = 10;

/** A level the bank holds: its text, the situations it stores, its fewest moves, and the latest chapter whose
 *  pieces it uses (a tier offers it from that chapter on). */
export interface BankLevel { text: string; explored: number; shortest: number; chapter: number }

/** A level of the run so far: its text and the situations it stores. */
export interface Played { text: string; explored: number }

export interface Request {
  seed: string;
  /** The chapters whose pieces the run uses: 1 to TIERS. */
  tier: number;
  /** 1 for the run's first level. */
  depth: number;
  /** The run's levels so far, oldest first (the last is the level before this one); the generator reads the last
   *  RUN_MEMORY of them. */
  run: readonly Played[];
}

/** A level Endless made: `made` by the search, or from the `bank`. */
export interface Made {
  text: string;
  /** The situations it stores and its fewest moves (difficulty.ts's measure). */
  explored: number;
  shortest: number;
  from: 'made' | 'bank';
  /** Changes tried, and the situations the search spent. */
  tries: number;
  spent: number;
}

export interface Progress { tries: number; spent: number; budget: number }

/** Situations the search may spend on one level before it takes the bank's (docs/superpowers/plans/
 *  2026-11-03-crete-endless.md has the measurements behind it). */
export const BUDGET = 12_000_000;
/** How many of the run's last levels a new level's layout is checked against. */
export const RUN_MEMORY = 12;
/** Changes tried on one draft before the next round's draft takes over. */
export const STEPS = 120;
/** How readily a climb takes a step up: a step that adds 0.25 to the distance is taken about one time in three. */
const TEMPERATURE = 0.25;

/** A draft's size, rooms and families, drawn for the band it must fall in. */
export function planOf(rng: Rng, tier: number, band: Band, hides: boolean): Plan {
  const all = familiesOf(tier).filter(f => !HIDING.includes(f));
  const newest = all.filter(f => FAMILY_CHAPTER[f] === Math.min(tier, 9));
  const count = 2 + rng.int(2);
  const families: Family[] = [];
  if (newest.length && rng.next() < 0.5) families.push(rng.pick(newest));
  if (hides) families.push(rng.pick(HIDING));
  for (const f of rng.shuffle(all)) if (families.length < count + (hides ? 1 : 0) && !families.includes(f)) families.push(f);
  const size = 12 + rng.int(3);
  return { rows: size, cols: size, roomRows: 3, roomCols: 3, families, relics: 1 + rng.int(3), hall: 0.2, loop: 0.35 };
}

/** The searches' caps: a solve that stores more than the band allows is no use, and the measure's other searches
 *  (the catch-free line, the beast's first catch, the line without him) get room to finish. */
const solveCap = (band: Band) => Math.ceil(band.most * 1.05);
const measureCap = (band: Band) => Math.max(200_000, band.most * 4);

/** How far a level is from passing the cheap checks: 0 when it passes them, more the further it is; Infinity when it
 *  is no level. One capped solve, and a second without the beast once the first is in the band. */
export function distance(level: Level, band: Band, spend: (n: number) => void): number {
  if (!level.minotaur) return Infinity;
  const start = initial(level);
  const r = solve(start, solveCap(band));
  spend(r.explored);
  if (!r.solved) return r.capped ? 12 : 30;
  let far = 0;
  const floor = floorOf(chapterOf(level));
  const least = Math.max(band.least, floor.explored);
  if (r.explored < least) far += 3 * Math.log(least / r.explored);
  if (r.explored > band.most) far += 3 * Math.log(r.explored / band.most);
  if (r.line.length < floor.shortest) far += 0.2 * (floor.shortest - r.line.length);
  let s = start, catches = 0;
  for (const a of r.line) { const x = step(s, a); s = x.state; if (caught(x.events, s)) catches++; }
  far += 3 * catches;
  const t = threatOf(level, { line: lineText(r.line) } as Difficulty);
  far += 6 * Math.max(0, THREAT.challenge.share - t.live / Math.max(1, t.turns));
  far += 6 * Math.max(0, t.quiet / Math.max(1, t.turns) - THREAT.challenge.quiet);
  if ((globalThis as any).DEBUG_ENDLESS && far > 0 && far < 1.5) (globalThis as any).DEBUG_ENDLESS("near", `ex ${r.explored >= band.least ? (r.explored > band.most ? "hi" : "ok") : "lo"} len ${r.line.length >= 36 ? "ok" : r.line.length} c ${catches} live ${(t.live/t.turns).toFixed(2)} quiet ${(t.quiet/t.turns).toFixed(2)}`);
  if (far > 0) return far;
  const free = solve(initial({ ...level, minotaur: null }), solveCap(band));
  spend(free.explored);
  if (free.solved) {
    far += 0.4 * Math.max(0, BAR.minotaurDelta - (r.line.length - free.line.length));
    let g = start;
    for (const a of free.line) g = step(g, a).state;
    if (g.outcome === 'won') far += 2;
    if ((globalThis as any).DEBUG_ENDLESS && Math.random() < 0.05) (globalThis as any).DEBUG_ENDLESS("near", `ex ${r.explored} len ${r.line.length} free ${free.line.length} won ${g.outcome}`);
  }
  return far;
}

/** `s` as `level` has it: its grid and its hazards' and machines' facings, with `s`'s doorways. */
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

/** The bank's level for this place: one the tier offers, in the band (else in the campaign's widest ramp, else on
 *  the plateau), not among the run's last levels, picked by the seed and depth. */
export function fromBank(bank: readonly BankLevel[], req: Request, band: Band): BankLevel {
  const recent = req.run.slice(-RUN_MEMORY);
  const offered = bank.filter(b => b.chapter <= req.tier);
  const runLevels = recent.map(p => parse(p.text));
  const fresh = offered.filter(b => !recent.some(p => p.text === b.text) && newProblems(parse(b.text), { features: [] }, runLevels).length === 0);
  const prev = req.run.at(-1)?.explored ?? null;
  const plateau = bandAfter(Number.MAX_SAFE_INTEGER, false)!;
  const ladder: ((b: BankLevel) => boolean)[] = [
    b => b.explored >= band.least && b.explored <= band.most,
    b => prev !== null && b.explored >= prev * 1.2 && b.explored <= prev * 2.2,
    b => b.explored >= plateau.least && b.explored <= plateau.most,
    () => true,
  ];
  for (const pool of [fresh, offered, bank]) {
    for (const fits of ladder) {
      const ok = pool.filter(fits);
      if (ok.length) return ok[hash('endless-bank', req.seed, req.tier, req.depth) % ok.length]!;
    }
  }
  throw new RangeError('the bank is empty');
}

/** Where the search stands, for `search`'s callers. */
interface Spent { tries: number; spent: number }

/** The search: the first level that passes the gate in `band`, or null once `budget` situations are spent. `title`
 *  names the level; `tryHides` says whether a round may hide walls (and then which band it climbs in). */
export function search(
  key: readonly (string | number)[], tier: number, band: Band, previous: Difficulty | null, known: Known, run: readonly Level[],
  budget: number, at: Spent, progress?: (p: Progress) => void, hidingBand: Band | null = null,
): { text: string; d: Difficulty } | null {
  const spend = (n: number) => { at.spent += n; };
  for (let round = 0; at.spent < budget; round++) {
    const rng = rngOf('endless', ...key, round);
    const hides = hidingBand !== null && rng.next() < 0.25;
    const roundBand = hides ? hidingBand! : band;
    let sketch = draft(rng, planOf(rng, tier, roundBand, hides));
    if (!sketch) { spend(1_000); continue; }
    const levelOf = (s: Sketch): Level | null => { try { return parse(textOf(s, '')); } catch { return null; } };
    let level = levelOf(sketch);
    let far = level ? distance(level, roundBand, spend) : Infinity;
    if ((globalThis as any).DEBUG_ENDLESS) (globalThis as any).DEBUG_ENDLESS('round', `${round} start ${far.toFixed(2)}`);
    // A round that has come close gets more steps; one that stays far gives way sooner.
    let steps = STEPS;
    for (let stepNo = 0; stepNo < steps && at.spent < budget; stepNo++) {
      if (stepNo === steps - 1 && far < 2 && steps < 3 * STEPS) steps += STEPS;
      if (stepNo === Math.floor(STEPS / 3) && far >= 8) break;
      at.tries++;
      if (stepNo % 8 === 0) progress?.({ tries: at.tries, spent: at.spent, budget });
      if (far === 0 && level) {
        const d = measure(level, measureCap(roundBand));
        spend(4 * d.explored);
        const qp = quickProblems(level, d, { band: roundBand, previous }, known, run);
        if ((globalThis as any).DEBUG_ENDLESS) (globalThis as any).DEBUG_ENDLESS('gate', qp.join(' | '));
        if (qp.length) far = 1;
        else {
          spend(pieceUnits(level).reduce((n, u) => n + u.ignored.length, 0) * 2 * d.explored);
          const useless = uselessPieces(level, d, measureCap(roundBand));
          if ((globalThis as any).DEBUG_ENDLESS) (globalThis as any).DEBUG_ENDLESS('useless', useless.map(u => u.problem).join(' | '));
          if (!useless.length) return { text: textOf(sketch, ''), d };
          // Take the first useless piece out and climb on from there.
          const stripped = emptiest(useless[0]!.unit.ignored);
          sketch = sketchFrom(sketch, stripped);
          level = levelOf(sketch);
          far = level ? distance(level, roundBand, spend) : Infinity;
          continue;
        }
      }
      const next = mutate(rng, sketch);
      const nextLevel = levelOf(next);
      if (!nextLevel) continue;
      const nextFar = distance(nextLevel, roundBand, spend);
      // Downhill always; uphill now and then, less the further up, so a climb is not stuck in a dip.
      if (nextFar <= far || (Number.isFinite(nextFar) && rng.next() < Math.exp(-(nextFar - far) / TEMPERATURE))) {
        sketch = next; level = nextLevel; far = nextFar;
      }
    }
    if ((globalThis as any).DEBUG_ENDLESS) (globalThis as any).DEBUG_ENDLESS('end', `${round} far ${far.toFixed(2)} spent ${at.spent}`);
  }
  return null;
}

/** The run's level at `req.depth`. */
export function generate(req: Request, bank: readonly BankLevel[], known: Known, opts: { budget?: number; progress?: (p: Progress) => void } = {}): Made {
  const budget = opts.budget ?? BUDGET;
  const before = req.run.at(-1) ?? null;
  const band = bandAfter(before?.explored ?? null, false)!;
  const at: Spent = { tries: 0, spent: 0 };
  const take = (b: BankLevel): Made => ({ text: b.text, explored: b.explored, shortest: b.shortest, from: 'bank', ...at });
  if (req.depth <= 1 || !before) return take(fromBank(bank, req, band));
  const run = req.run.slice(-RUN_MEMORY).map(p => parse(p.text));
  const hides = familiesOf(req.tier).some(f => HIDING.includes(f)) ? bandAfter(before.explored, true) : null;
  const found = search([req.seed, req.tier, req.depth], req.tier, band, { explored: before.explored } as Difficulty, known, run, budget, at, opts.progress, hides);
  if (!found) return take(fromBank(bank, req, band));
  return { text: found.text, explored: found.d.explored, shortest: found.d.shortest as number, from: 'made', ...at };
}

