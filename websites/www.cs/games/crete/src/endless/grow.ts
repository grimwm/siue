/* The Island of Crete: growing a harder Endless level from an easier one. A Hard level is rare among drafts, a
 * Medium level about half as rare, and a Medium level near the top of its band is a few hundred small changes from
 * Hard's. `grow` takes such a level, its parent, and climbs from it:
 * one small seeded change at a time (draft.ts's mutate: a piece moved, a passage's piece moved, a hazard turned, a
 * passage opened or walled up), each judged first by the cheap checks (generate.ts's distance, against a band that
 * starts just past the level's own score) and then by the whole gate at the aim's grade; a change is kept only when
 * the level still passes and its score rises. It stops once the score is in the aim's band, or after `steps` changes.
 * Everything is drawn from the seed it is given and its parent's text, so the same parent, seed and steps grow the
 * same level on every device. DOM-free. */
import { parse } from '../puzzle/level.ts';
import type { Level } from '../puzzle/level.ts';
import { hidesWalls, measure } from '../puzzle/difficulty.ts';
import type { Difficulty } from '../puzzle/difficulty.ts';
import { finish } from '../puzzle/astar.ts';
import { mutate, textOf } from './draft.ts';
import type { Door, Sketch } from './draft.ts';
import { rngOf } from './random.ts';
import { CHECK_CAP, bandProblems, levelChecks, likeness, runProblems } from './gate.ts';
import type { Band, Known } from './gate.ts';
import type { Grade, Score } from '../puzzle/rating.ts';
import type { Dir } from '../puzzle/tiles.ts';
import { distance } from './generate.ts';

/** A level's sketch, read back from its text alone: its grid, its hazards' and machines' facings, and as its
 *  passages every open cell between two lattice cells (an odd row and an even column, or the other way round), the
 *  cells a draft's passages stand on. */
export function sketchOf(level: Level, text: string): Sketch {
  const g = text.slice(text.indexOf('\n\n') + 2).trimEnd().split('\n').map(r => [...r]);
  const doors: Door[] = [];
  for (let r = 1; r < level.rows - 1; r++) for (let c = 1; c < level.cols - 1; c++) {
    if ((r % 2) === (c % 2) || level.terrain[r * level.cols + c] === 'wall') continue;
    doors.push({ r, c });
  }
  const facing = new Map<number, Dir>(level.hazards.map(h => [h.at.r * level.cols + h.at.c, h.dir]));
  const machines = new Map(level.machines.map(m => [m.at.r * level.cols + m.at.c, `${m.template}-${m.dir}`]));
  return { g, doors, facing, machines };
}

/** What a climb aims at: the grade whose gate each step must pass and the band it stops in. */
export interface GrowAim { grade: Grade; band: Band }

/** What a climb came to: the level it reached in the band (null when it ran out of steps first), the changes it
 *  tried and kept, the best score it reached, and the situations it spent. */
export interface Grown { found: { text: string; d: Difficulty; score: number } | null; tries: number; kept: number; best: number; spent: number }

const MEASURE_CAP = CHECK_CAP;

/** The whole gate at `grade`, less the band: the level's score when it passes, else null. */
function passes(level: Level, grade: Grade, known: Known, run: readonly Level[], spend: (n: number) => void): { d: Difficulty; score: number } | null {
  const d = measure(level, MEASURE_CAP);
  spend(4 * d.explored);
  if (!d.solved || runProblems(level, d, known, run).length) return null;
  const checked = finish(levelChecks(level, d, grade, false, MEASURE_CAP));
  spend(checked.score ? 8 * d.explored : 0);
  if (checked.problems.length || !checked.score) return null;
  return { d, score: checked.score.total };
}

/** Climbs from `parent` (a level's text) toward `aim`, drawing every change from `rngOf('endless', 'grow', ...key)`,
 *  for at most `steps` changes, and none once it has spent `room` situations (the parent's own check counted). `run`
 *  is the run's levels a new layout must look like none of. A parent that fails the aim's gate climbs nowhere; one
 *  already in its band is the level. */
export function grow(parent: string, aim: GrowAim, key: readonly (string | number)[], steps: number, known: Known, run: readonly Level[] = [], room = Infinity): Grown {
  const out: Grown = { found: null, tries: 0, kept: 0, best: 0, spent: 0 };
  const spend = (n: number) => { out.spent += n; };
  let level: Level;
  try { level = parse(parent); } catch { return out; }
  const hides = hidesWalls(level);
  let sketch = sketchOf(level, parent);
  const start = passes(level, aim.grade, known, run, spend);
  if (!start) return out;
  let score = start.score;
  out.best = score;
  if (!bandProblems({ total: score } as Score, aim.band).length) { out.found = { text: parent, d: start.d, score }; return out; }
  const rng = rngOf('endless', 'grow', ...key);
  const like = (lv: Level) => likeness(lv, known, run);
  const judged = new Set<string>();
  for (let i = 0; i < steps && out.spent < room; i++) {
    out.tries++;
    const next = mutate(rng, sketch);
    const text = textOf(next, '');
    if (judged.has(text)) continue;
    judged.add(text);
    let lv: Level;
    try { lv = parse(text); } catch { continue; }
    if (hidesWalls(lv) !== hides) continue;
    // The cheap checks first, against a band from just past the score so far to the aim's top.
    if (distance(lv, { least: score + 1, most: aim.band.most, plateau: aim.band.plateau }, spend, like) !== 0) continue;
    const p = passes(lv, aim.grade, known, run, spend);
    if (!p || p.score <= score || p.score > aim.band.most) continue;
    sketch = next; score = p.score; out.kept++; out.best = score;
    if (score >= aim.band.least) { out.found = { text, d: p.d, score }; return out; }
  }
  return out;
}
