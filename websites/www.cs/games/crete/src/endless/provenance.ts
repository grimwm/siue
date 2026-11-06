/* The Island of Crete: where a shared Endless level came from. Part k of the search for a run's level (generate.ts's
 * makePart) is a pure function of the generator's version, the run's seed, tier and grade, the depth, k, and the run
 * state the search reads; so a level that some device says it made can be checked by making it again. A level goes
 * up to the shared bank with that tuple (`tupleOf`), and the bank serves it only once two other devices have run the
 * same part from the tuple (`regenerate`) and made the same level (`sameMade`). A grown tuple (`grow`) names a
 * parent, the same part at an easier grade, and a climb from it (grow.ts): its seed and its steps; making it again
 * makes the parent again and replays the climb (`grownOf`). See
 * docs/superpowers/specs/2026-11-04-crete-shared-bank-design.md. DOM-free. */
import { parse } from '../puzzle/level.ts';
import { grownPart, growOf, placeOf, searchPart, RUN_MEMORY } from './generate.ts';
import type { Grow, Made, Part, Played, Request } from './generate.ts';
import type { Grown } from './grow.ts';
import { chapterOf, hidesWalls } from './gate.ts';
import type { Known } from './gate.ts';
import type { Grade } from '../puzzle/rating.ts';

/** The generator's version. Anything that changes what a part makes from the same tuple (the generator, the gate,
 *  the campaign's layouts, the solver's numbers) bumps it, and the shared bank's config (games/crete/bank/config.json)
 *  accepts the new number; test/shared-version.test.ts pins one part's output to it. */
export const ENDLESS_VERSION = 3;
/** The versions this generator makes again, byte for byte: a version 2 tuple is a version 3 one with no climb (its
 *  Hard parts were all searches for drafts). */
export const VERSIONS: readonly number[] = [2, 3];

export type { Grow };
/** The most changes a grown tuple's climb may name. */
export const GROWN_MOST = 1000;

/** The inputs of one part's search: enough to run it again anywhere; with `grow` (generate.ts's growOf), the part's
 *  parent is searched at `grow.from` and climbed toward the tuple's own grade. */
export interface Tuple { v: number; seed: string; tier: number; grade: Grade; depth: number; k: number; run: Played[]; grow?: Grow }

/** A level as the shared bank keeps it: what the part made, with its chapter and whether it hides walls. */
export interface SharedMade { text: string; line: string; shortest: number; score: number; explored: number; chapter: number; hides: boolean }

/** The run state `req`'s part reads, and no more: the run's last RUN_MEMORY levels, and before them the run's last
 *  plain level (one that hides no walls) when none of those is plain, since the ramp climbs from it. */
export function memoryOf(run: readonly Played[]): Played[] {
  const recent = run.slice(-RUN_MEMORY);
  const plain = (p: Played) => !hidesWalls(parse(p.text));
  if (recent.some(plain)) return recent.map(p => ({ text: p.text, explored: p.explored, score: p.score }));
  let older: Played | undefined;
  for (let i = run.length - recent.length - 1; i >= 0 && !older; i--) if (plain(run[i]!)) older = run[i];
  return [...(older ? [older] : []), ...recent].map(p => ({ text: p.text, explored: p.explored, score: p.score }));
}

/** The tuple of part `k` of `req`'s search; null when the request cannot be shared (a run's first level, which the
 *  search never makes, or a browser spec's budget, which makes other levels). */
export function tupleOf(req: Request, k: number): Tuple | null {
  if (req.budget !== undefined || req.depth < 2 || !req.run.length) return null;
  const grow = growOf(req, k);
  return { v: ENDLESS_VERSION, seed: req.seed, tier: req.tier, grade: req.grade, depth: req.depth, k, run: memoryOf(req.run), ...(grow ? { grow } : {}) };
}

/** The request a tuple's part belongs to. */
export function requestOf(t: Tuple): Request {
  return { seed: t.seed, tier: t.tier, grade: t.grade, depth: t.depth, run: t.run };
}

/** A level the search made, as the shared bank keeps it. */
export function sharedOf(m: Pick<Made, 'text' | 'line' | 'shortest' | 'score' | 'explored'>): SharedMade {
  const level = parse(m.text);
  return { text: m.text, line: m.line, shortest: m.shortest, score: m.score, explored: m.explored, chapter: chapterOf(level), hides: hidesWalls(level) };
}

/** The same level, to the byte, with the same line and numbers. */
export function sameMade(a: SharedMade | null, b: SharedMade | null): boolean {
  if (!a || !b) return false;
  return a.text === b.text && a.line === b.line && a.shortest === b.shortest && a.score === b.score
    && a.explored === b.explored && a.chapter === b.chapter && a.hides === b.hides;
}

/** A search for a draft (generate.ts's searchPart), or a stand-in in the tests. */
export type PartMaker = (req: Request, k: number, known: Known, opts?: { hides?: boolean }) => Part;

const GRADE_ORDER: readonly Grade[] = ['easy', 'medium', 'hard'];

/** What a grown tuple came to: its parent (the part searched at `grow.from`, null when it found none), the climb from
 *  it (null with no parent), and the part. */
export function grownOf(t: Tuple & { grow: Grow }, known: Known, part: PartMaker = searchPart): { parent: Made | null; climb: Grown | null; part: Part } {
  return grownPart(requestOf(t), t.k, t.grow, known, { search: (r, k, kn, o) => part(r, k, kn, o) });
}

/** A tuple this generator takes: one of VERSIONS, and a climb only from version 3, from an easier grade, within
 *  GROWN_MOST changes. */
export function takes(t: Tuple): boolean {
  if (!VERSIONS.includes(t.v)) return false;
  if (!t.grow) return true;
  const g = t.grow;
  return t.v >= 3 && GRADE_ORDER.indexOf(g.from) >= 0 && GRADE_ORDER.indexOf(g.from) < GRADE_ORDER.indexOf(t.grade)
    && /^[a-z0-9-]{1,32}$/.test(g.seed) && Number.isInteger(g.steps) && g.steps >= 1 && g.steps <= GROWN_MOST;
}

/** The Hard tuple whose parent is a Medium part's own level: the same tuple at Hard, grown from Medium as Hard's
 *  odd parts are (growOf). Its parent's search is the Medium part itself when the two places agree on hiding walls;
 *  where they do not (each place draws that from its own grade), null. */
export function childOf(t: Tuple): (Tuple & { grow: Grow }) | null {
  if (t.grade !== 'medium' || t.grow || t.v < 3) return null;
  const child = { ...t, grade: 'hard' as const, grow: growOf({ grade: 'hard' }, 1)! };
  try {
    if (placeOf(requestOf(child)).hides !== placeOf(requestOf(t)).hides) return null;
  } catch { return null; }
  return child;
}

/** A level a remade part is the parent of: its tuple, the level, and how long its climb took. */
export interface Child { tuple: Tuple; made: SharedMade; ms: number }

/** Runs a tuple's part again: the level it makes (null when it makes none, or the tuple is not one this generator
 *  takes or no request it can run), and whether a climb grew it. The tuple says which part it is: a search for a
 *  draft, or with `grow` its parent's search and the climb. With `child`, a Medium part's level is climbed toward
 *  Hard as well, as its childOf tuple's parent; the child is the Hard level when the climb changed it into Hard's
 *  band (one already there would be the same level twice), the very level the child's tuple makes again. */
export function remake(t: Tuple, known: Known, part: PartMaker = searchPart, child = false, now: () => number = Date.now): { made: SharedMade | null; grown: boolean; child: Child | null } {
  if (!takes(t)) return { made: null, grown: false, child: null };
  try {
    placeOf(requestOf(t));
    if (t.grow) {
      const found = grownOf(t as Tuple & { grow: Grow }, known, part).part.found;
      return { made: found ? sharedOf(found) : null, grown: !!found, child: null };
    }
    const p = part(requestOf(t), t.k, known);
    const made = p.found ? sharedOf(p.found) : null;
    const c = child && made ? childOf(t) : null;
    if (!c) return { made, grown: false, child: null };
    const t0 = now();
    const g = grownOf(c, known, () => p);
    const ms = now() - t0;
    const f = g.climb && g.climb.kept > 0 ? g.part.found : null;
    return { made, grown: false, child: f ? { tuple: c, made: sharedOf(f), ms } : null };
  } catch {
    return { made: null, grown: false, child: null };
  }
}

/** The level a tuple makes again (remake's), as the shared bank keeps it. */
export function regenerate(t: Tuple, known: Known, part: PartMaker = searchPart): SharedMade | null {
  return remake(t, known, part).made;
}
