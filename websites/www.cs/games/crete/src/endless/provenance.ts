/* The Island of Crete: where a shared Endless level came from. Part k of the search for a run's level (generate.ts's
 * makePart) is a pure function of the generator's version, the run's seed, tier and grade, the depth, k, and the run
 * state the search reads; so a level that some device says it made can be checked by making it again. A level goes
 * up to the shared bank with that tuple (`tupleOf`), and the bank serves it only once two other devices have run the
 * same part from the tuple (`regenerate`) and made the same level (`sameMade`). See
 * docs/superpowers/specs/2026-11-04-crete-shared-bank-design.md. DOM-free. */
import { parse } from '../puzzle/level.ts';
import { makePart, placeOf, RUN_MEMORY } from './generate.ts';
import type { Made, Part, Played, Request } from './generate.ts';
import { chapterOf, hidesWalls } from './gate.ts';
import type { Known } from './gate.ts';
import type { Grade } from '../puzzle/rating.ts';

/** The generator's version. Anything that changes what a part makes from the same tuple (the generator, the gate,
 *  the campaign's layouts, the solver's numbers) bumps it, and the shared bank's config (games/crete/bank/config.json)
 *  accepts the new number; test/shared-version.test.ts pins one part's output to it. */
export const ENDLESS_VERSION = 1;

/** The inputs of one part's search: enough to run it again anywhere. */
export interface Tuple { v: number; seed: string; tier: number; grade: Grade; depth: number; k: number; run: Played[] }

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
  return { v: ENDLESS_VERSION, seed: req.seed, tier: req.tier, grade: req.grade, depth: req.depth, k, run: memoryOf(req.run) };
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

/** Runs a tuple's part again: the level it makes (null when it makes none, or the tuple is not this generator's or
 *  is no request the generator takes). `part` is makePart, or a stand-in in the tests. */
export function regenerate(t: Tuple, known: Known, part: (req: Request, k: number, known: Known) => Part = makePart): SharedMade | null {
  if (t.v !== ENDLESS_VERSION) return null;
  const req = requestOf(t);
  try {
    placeOf(req);
    const found = part(req, t.k, known).found;
    return found ? sharedOf(found) : null;
  } catch {
    return null;
  }
}
