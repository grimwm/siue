/* The Island of Crete: Endless's gate. Every level Endless makes passes the campaign's own checks
 * (src/puzzle/difficulty.ts) as a challenge level: `challengeProblems` against `BAR` (which carries
 * `catchProblems`), `sharedProblems` against `SHARED_BAR`, `threatProblems` with the challenge bar,
 * `hiddenProblems`, `rampProblems` with `rampOf` on the climb, and `uselessProblems`; and two of its own that the
 * campaign's tests keep for released levels: a tidy layout of rooms and halls, and a layout new against every
 * campaign level and the run's own levels (src/puzzle/layouts.ts). The difficulty climbs by the ramp, level by
 * level, until it reaches a plateau, where it stays. DOM-free. */
import type { Level } from '../puzzle/level.ts';
import type { Difficulty } from '../puzzle/difficulty.ts';
import {
  BAR, HIDDEN, SHARED_BAR, challengeProblems, hiddenProblems, hidesWalls, rampOf, rampProblems, sharedProblems,
  threatProblems, uselessProblems,
} from '../puzzle/difficulty.ts';
import { SAME, eight, featuresOf, overlapOf } from '../puzzle/layouts.ts';
import type { Features } from '../puzzle/layouts.ts';

/** Each chapter's teaching levels, measured: the most situations any of them stores and its longest line.
 *  test/endless.test.ts measures them again. An Endless level is a challenge level of the latest chapter whose
 *  pieces it holds (chapterOf), as if it stood in that chapter after its teaching levels: it stores at least
 *  `BAR.exploredTimes` (20) times that chapter's most and its line is no shorter than that chapter's longest. */
export const TEACHING: readonly { explored: number; shortest: number }[] = [
  { explored: 614, shortest: 36 }, { explored: 272, shortest: 25 }, { explored: 259, shortest: 23 },
  { explored: 53, shortest: 16 }, { explored: 59, shortest: 18 }, { explored: 98, shortest: 14 },
  { explored: 174, shortest: 18 }, { explored: 322, shortest: 25 }, { explored: 450, shortest: 18 },
];

/** The latest chapter whose pieces `level` holds, 1 to 9 (Chapter 10 brings none). */
export function chapterOf(level: Level): number {
  const t = new Set<string>(level.terrain);
  const o = new Set<string>(level.objects.filter((x): x is NonNullable<typeof x> => x !== null));
  if (t.has('thief') || t.has('bomb') || t.has('clone') || t.has('button-red')) return 9;
  if (level.hazards.some(h => h.kind !== 'ball')) return 8;
  if (level.hazards.length) return 7;
  if (t.has('teleport')) return 6;
  if (t.has('trap') || t.has('button-brown')) return 5;
  if (t.has('fake-wall') || t.has('invisible-wall')) return 4;
  if (t.has('popup')) return 3;
  if (t.has('gravel')) return 2;
  void o;
  return 1;
}

/** The context challengeProblems reads for a level of chapter `n`: only the teaching levels' situations and lines
 *  count. */
const contextOf = (n: number) => ({ teaching: [{ ...TEACHING[n - 1]! } as Difficulty] });

/** The least a level of chapter `n` stores (the challenge bar, and never less than the shared bar's for a chase),
 *  and its shortest line. */
export function floorOf(n: number): { explored: number; shortest: number } {
  const t = TEACHING[n - 1]!;
  return { explored: Math.max(SHARED_BAR.chaseExplored, BAR.exploredTimes * t.explored), shortest: Math.max(SHARED_BAR.chaseShortest, t.shortest) };
}

/** The least any level stores: the shared bar for a chase. */
export const FLOOR = SHARED_BAR.chaseExplored;

/** The climb and the plateau. Each level stores `climb.least` to `climb.most` times the situations of the level
 *  before it, a steadier climb than the campaign's widest ramp (1.2 to 2.2), until that would pass `plateau.most`;
 *  from then on every level stores between `plateau.least` and `plateau.most`, about a middle chapter's hardest
 *  levels (Chapter 2's last stores 44,006, Chapter 5's 54,608), and the ramp no longer applies. A level that hides a
 *  wall climbs by the gentler HIDDEN.ramp and never stores more than HIDDEN.most, so it comes only while the climb is
 *  low. */
export const CLIMB = { least: 1.2, most: 1.6 };
export const PLATEAU = { least: 30_000, most: 50_000 };

/** Where a level's situations must fall: `least` to `most`; `plateau` once the climb has levelled off. */
export interface Band { least: number; most: number; plateau: boolean }

/** The band for the level after one that stored `previous` situations (null for a run's first level), for a level
 *  that hides walls or not; null when a level that hides walls cannot fit (the climb is past HIDDEN.most). */
export function bandAfter(previous: number | null, hides: boolean): Band | null {
  const ramp = hides ? HIDDEN.ramp : CLIMB;
  const ceiling = hides ? HIDDEN.most : PLATEAU.most;
  // A run's first level may store anything from the floor to about a chapter's third challenge level.
  if (previous === null) return { least: FLOOR, most: hides ? HIDDEN.most : 20_000, plateau: false };
  const least = Math.max(FLOOR, Math.ceil(previous * ramp.least));
  const most = Math.min(ceiling, Math.floor(previous * ramp.most));
  if (most >= least * 1.15) return { least, most, plateau: false };
  return hides ? null : { least: PLATEAU.least, most: PLATEAU.most, plateau: true };
}

/** The campaign's levels' features, each with its eight turns and flips, worked out once. */
export interface Known { features: readonly Features[][] }
export function knownOf(levels: readonly Level[]): Known {
  return { features: levels.map(lv => eight(featuresOf(lv))) };
}

/** A tidy layout of rooms and halls: no wall stands alone (an inside wall with no wall beside it), and no bare
 *  pocket (an empty floor cell walled on three sides, a nub that leads nowhere and holds nothing). */
export function tidyProblems(level: Level): string[] {
  const { rows: R, cols: C } = level;
  const wall = (r: number, c: number) => level.terrain[r * C + c] === 'wall';
  const out: string[] = [];
  for (let r = 1; r < R - 1; r++) for (let c = 1; c < C - 1; c++) {
    const i = r * C + c;
    const walls = [wall(r - 1, c), wall(r + 1, c), wall(r, c - 1), wall(r, c + 1)].filter(Boolean).length;
    if (wall(r, c) && walls === 0) out.push(`a lone wall at row ${r + 1}, column ${c + 1}`);
    const bare = level.terrain[i] === 'floor' && level.objects[i] === null
      && !(level.player.r === r && level.player.c === c) && !(level.minotaur?.r === r && level.minotaur.c === c)
      && !level.hazards.some(h => h.at.r === r && h.at.c === c);
    if (bare && walls >= 3) out.push(`a bare pocket at row ${r + 1}, column ${c + 1}`);
  }
  return out;
}

/** A new layout: its features overlap no campaign level's, and none of `run` (the run's earlier levels), by SAME. */
export function newProblems(level: Level, known: Known, run: readonly Level[] = []): string[] {
  const A = featuresOf(level);
  const out: string[] = [];
  known.features.forEach((Bs, k) => { const x = overlapOf(A, Bs); if (x >= SAME) out.push(`its layout repeats campaign level ${k + 1}'s (${x.toFixed(2)})`); });
  run.forEach((lv, k) => { const x = overlapOf(A, eight(featuresOf(lv))); if (x >= SAME) out.push(`its layout repeats the run's level ${k + 1}'s (${x.toFixed(2)})`); });
  return out;
}

/** What Endless needs to know of where a level falls: its band, and the run's level before it (null for the first). */
export interface Place { band: Band; previous: Difficulty | null }

/** Every check but uselessProblems (the costly one), in the order of their cost. */
export function quickProblems(level: Level, d: Difficulty, place: Place, known: Known, run: readonly Level[] = []): string[] {
  const out: string[] = [];
  if (d.explored < place.band.least || d.explored > place.band.most) {
    out.push(`stored ${d.explored} situations, the band is ${place.band.least} to ${place.band.most}`);
  }
  out.push(...challengeProblems(d, BAR, contextOf(chapterOf(level))), ...sharedProblems(d), ...threatProblems(level, d, 'challenge'), ...hiddenProblems(level, d));
  if (!place.band.plateau && place.previous) out.push(...rampProblems(place.previous, d, rampOf(level)));
  if (hidesWalls(level) && place.band.plateau) out.push('a level that hides walls never sits on the plateau');
  if (out.length) return out;
  return [...tidyProblems(level), ...newProblems(level, known, run)];
}

/** The whole gate: quickProblems, then uselessProblems with searches capped at `cap`. Empty when the level passes. */
export function gateProblems(level: Level, d: Difficulty, place: Place, known: Known, run: readonly Level[] = [], cap?: number): string[] {
  const quick = quickProblems(level, d, place, known, run);
  return quick.length ? quick : uselessProblems(level, d, cap);
}
