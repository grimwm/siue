/* The Island of Crete: Endless's gate, and the rating the editor's Check shows. Every level Endless makes passes the
 * campaign's own checks (src/puzzle/difficulty.ts) as a challenge level: `challengeProblems` against `BAR` (which
 * carries `catchProblems`), `sharedProblems` (both with their situations at Endless's FLOOR), `threatProblems` with
 * the challenge bar,
 * `hiddenProblems`, `startProblems` and `purposeProblems`, the every-piece rule; the rules of src/puzzle/rating.ts:
 * no habit player wins, open space earns its place, a cow or a mirror is needed (and in Hard the cow set down at once
 * loses); and two of its own: a tidy maze, and a layout new against every campaign level and the run's own levels
 * (src/puzzle/layouts.ts). A run is played at a grade, Easy, Medium or Hard: its levels climb by the difficulty score
 * (rating.ts), level by level, to the grade's plateau, where they stay. `levelChecks` holds every rule that does not
 * depend on the run, so the editor rates a level exactly as Endless would judge it. DOM-free. */
import type { Level } from '../puzzle/level.ts';
import type { Difficulty } from '../puzzle/difficulty.ts';
import {
  BAR, SHARED_BAR, challengeProblems, hiddenProblems, hidesWalls, sharedProblems, startProblems,
  threatProblems, purposing,
} from '../puzzle/difficulty.ts';
import { bandOf, gradeOf, habitProblems, openProblems, scoring, toolProblems } from '../puzzle/rating.ts';
import type { Band as Rank, Grade, Problem, Score } from '../puzzle/rating.ts';
import type { Progress } from '../puzzle/astar.ts';
import { SOLVER_CAP } from '../puzzle/solver.ts';
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
  if (t.has('thief') || t.has('bomb') || t.has('clone') || t.has('button-red')) return 9;
  if (level.hazards.some(h => h.kind !== 'ball')) return 8;
  if (level.hazards.length) return 7;
  if (t.has('teleport')) return 6;
  if (t.has('trap') || t.has('button-brown')) return 5;
  if (t.has('fake-wall') || t.has('invisible-wall')) return 4;
  if (t.has('popup')) return 3;
  if (t.has('gravel')) return 2;
  return 1;
}

/** The least any Endless level stores. The situations a search stores are only a floor in Endless (its levels climb
 *  by the score, src/puzzle/rating.ts), and a maze's corridors make long, hard lines from small searches: the score
 *  reaches the campaign's hardest levels' from 2,000 situations. So every chapter's floor is this one, a third of
 *  the shared bar's for a chase, and Endless reads the shared bar with it. */
export const FLOOR = 2_000;
/** The shared bar as Endless reads it: its moves, with FLOOR for its situations. */
export const ENDLESS_SHARED_BAR = { ...SHARED_BAR, explored: FLOOR, chaseExplored: FLOOR };

/** The context challengeProblems reads for a level of chapter `n`: the teaching levels' longest line, and a most
 *  that puts the situations bar at FLOOR. */
const contextOf = (n: number) => ({ teaching: [{ explored: Math.ceil(FLOOR / BAR.exploredTimes), shortest: TEACHING[n - 1]!.shortest } as Difficulty] });

/** The least a level of chapter `n` stores (FLOOR), and its shortest line (the chapter's longest teaching line, and
 *  never less than the shared bar's for a chase). */
export function floorOf(n: number): { explored: number; shortest: number } {
  const t = TEACHING[n - 1]!;
  return { explored: FLOOR, shortest: Math.max(SHARED_BAR.chaseShortest, t.shortest) };
}

/** The most situations an Endless level's search may store, so a phone can make and check it: the situations stored
 *  are a cost here, not a difficulty, and a maze's corridors make hard levels from small searches. */
export const EXPLORED_MOST = 30_000;
/** The cap on every search the gate runs past the first (the measure's others, the score's, open space's, the
 *  tools', every piece's): the editor's rating uses it too, so a search capped in one is capped in the other. */
export const CHECK_CAP = 4 * EXPLORED_MOST;

/** Each grade's bands on the difficulty score: where a run's first level falls, and the plateau its climb levels off
 *  on. Easy's plateau is a middle chapter's hardest levels (Chapters 4 to 6's last three score 45 to 79, Chapter 5's
 *  53, 58 and 79), Medium's the campaign's hardest (Chapters 8 to 10's last three each score 47 to 121, 89 in the
 *  middle), and Hard's past them: its low end is above all of those but Chapter 8's last two and Chapter 9's last. */
export const GRADE_BANDS: Readonly<Record<Grade, { first: readonly [number, number]; plateau: readonly [number, number] }>> = {
  easy: { first: [25, 40], plateau: [45, 70] },
  medium: { first: [35, 55], plateau: [70, 110] },
  hard: { first: [50, 75], plateau: [110, 170] },
};

/** The climb: each level scores `least` to `most` times the score of the last plain level before it (a level that
 *  hides walls does not count), until its band reaches the grade's plateau. */
export const CLIMB = { least: 1.1, most: 1.35 };

/** A level that hides walls (a fake or an invisible wall) is set easier than its neighbours: it scores `least` to
 *  `most` times the band its place would give a plain level (its low and its high end), and stores no more than
 *  difficulty.ts's HIDDEN.most. One level in HIDDEN_EVERY hides walls, once the run's tier has them. */
export const HIDDEN_EASE = { least: 0.7, most: 0.9 };
export const HIDDEN_EVERY = 5;

/** Where a level's score must fall: `least` to `most`; `plateau` once the climb has levelled off. */
export interface Band { least: number; most: number; plateau: boolean }

/** The band for a plain level after one whose score was `previous` (null for a run's first level). */
export function bandAfter(previous: number | null, grade: Grade): Band {
  const g = GRADE_BANDS[grade];
  if (previous === null) return { least: g.first[0], most: g.first[1], plateau: false };
  const plateau = { least: g.plateau[0], most: g.plateau[1], plateau: true };
  if (previous >= g.plateau[0]) return plateau;
  const least = Math.max(g.first[0], Math.ceil(previous * CLIMB.least));
  const most = Math.min(g.plateau[1], Math.floor(previous * CLIMB.most));
  if (least >= g.plateau[0]) return plateau;
  return { least, most: Math.max(most, least + 4), plateau: false };
}

/** The band for a level that hides walls, at a place whose plain band is `plain`: set easier. */
export function hiddenBand(plain: Band): Band {
  return { least: Math.floor(plain.least * HIDDEN_EASE.least), most: Math.max(Math.floor(plain.least * HIDDEN_EASE.most), Math.floor(plain.least * HIDDEN_EASE.least) + 4), plateau: plain.plateau };
}

/** A level's features for Endless's new-layout check: layouts.ts's, less the cells at an even row and an even
 *  column. Every maze has a wall on each of those corners of its lattice, so they tell no two mazes apart; counted,
 *  any two mazes would look half alike. */
export function mazeFeaturesOf(lv: Level): Features {
  return featuresOf(lv).map((row, r) => row.map((k, c) => ((r + 1) % 2 === 0 && (c + 1) % 2 === 0 ? '' : k)));
}

/** The campaign's levels' features, each with its eight turns and flips, worked out once. */
export interface Known { features: readonly Features[][] }
export function knownOf(levels: readonly Level[]): Known {
  return { features: levels.map(lv => eight(mazeFeaturesOf(lv))) };
}

/** How much two levels' layouts overlap for Endless (mazeFeaturesOf), over the turns and flips of `b`. */
export function mazeOverlap(a: Level, b: Level): number {
  return overlapOf(mazeFeaturesOf(a), eight(mazeFeaturesOf(b)));
}

/** A tidy maze: no wall stands alone (an inside wall with no wall beside it), and no bare nub (an empty floor cell
 *  walled on three sides whose one way out opens onto a wider space, a pocket that leads nowhere and holds nothing).
 *  A dead-end corridor, two cells or more long, is a maze's own. */
export function tidyProblems(level: Level): string[] {
  const { rows: R, cols: C } = level;
  const wall = (r: number, c: number) => level.terrain[r * C + c] === 'wall';
  const openAround = (r: number, c: number) => 4 - [wall(r - 1, c), wall(r + 1, c), wall(r, c - 1), wall(r, c + 1)].filter(Boolean).length;
  const out: string[] = [];
  for (let r = 1; r < R - 1; r++) for (let c = 1; c < C - 1; c++) {
    const i = r * C + c;
    const walls = 4 - openAround(r, c);
    if (wall(r, c) && walls === 0) out.push(`a lone wall at row ${r + 1}, column ${c + 1}`);
    const bare = level.terrain[i] === 'floor' && level.objects[i] === null
      && !(level.player.r === r && level.player.c === c) && !(level.minotaur?.r === r && level.minotaur.c === c)
      && !level.hazards.some(h => h.at.r === r && h.at.c === c);
    if (!bare || walls < 3) continue;
    // Its one open neighbour: a corridor (two ways out) makes this a dead end; a wider space makes it a nub.
    const [nr, nc] = !wall(r - 1, c) ? [r - 1, c] : !wall(r + 1, c) ? [r + 1, c] : !wall(r, c - 1) ? [r, c - 1] : [r, c + 1];
    if (walls === 4 || nr <= 0 || nc <= 0 || nr >= R - 1 || nc >= C - 1 || openAround(nr, nc) !== 2) out.push(`a bare pocket at row ${r + 1}, column ${c + 1}`);
  }
  return out;
}

/** A maze's look, what a player takes in at a glance: its shape and how its corridors run. `dead` is the share of
 *  its floor in dead ends, `forks` the share where three or four ways meet, `loops` its loops (the passages past a
 *  tree's) for each cell of floor, `run` the mean length of its straight stretches of floor and `walls` of its inside
 *  walls (each two cells or more), and `skew` how much longer its stretches of floor run one way than the other. */
export interface Look { rows: number; cols: number; dead: number; forks: number; loops: number; run: number; walls: number; skew: number }

export function lookOf(lv: Level): Look {
  const { rows: R, cols: C } = lv;
  const f = featuresOf(lv);
  const inside = (r: number, c: number) => r >= 1 && c >= 1 && r < R - 1 && c < C - 1;
  const open = (r: number, c: number) => inside(r, c) && f[r - 1]![c - 1] !== 'wall';
  const wall = (r: number, c: number) => inside(r, c) && f[r - 1]![c - 1] === 'wall';
  let cells = 0, dead = 0, forks = 0, joins = 0;
  // Straight stretches of floor across, of floor down, and of wall: how many, and their cells.
  const runs = [[0, 0], [0, 0], [0, 0]] as [number, number][];
  const stretch = (is: (r: number, c: number) => boolean, r: number, c: number, dr: number, dc: number, into: [number, number]) => {
    if (is(r - dr, c - dc)) return;
    let k = 0;
    while (is(r + k * dr, c + k * dc)) k++;
    if (k >= 2) { into[0]++; into[1] += k; }
  };
  for (let r = 1; r < R - 1; r++) for (let c = 1; c < C - 1; c++) {
    if (wall(r, c)) { stretch(wall, r, c, 0, 1, runs[2]!); stretch(wall, r, c, 1, 0, runs[2]!); continue; }
    cells++;
    const ways = [open(r - 1, c), open(r + 1, c), open(r, c - 1), open(r, c + 1)].filter(Boolean).length;
    if (ways === 1) dead++;
    if (ways >= 3) forks++;
    if (open(r, c + 1)) joins++;
    if (open(r + 1, c)) joins++;
    stretch(open, r, c, 0, 1, runs[0]!);
    stretch(open, r, c, 1, 0, runs[1]!);
  }
  const n = Math.max(1, cells);
  const mean = ([k, total]: [number, number]) => (k ? total / k : 0);
  const [across, down, walls] = runs.map(mean) as [number, number, number];
  return {
    rows: R, cols: C, dead: dead / n, forks: forks / n, loops: Math.max(0, joins - cells + 1) / n,
    run: mean([runs[0]![0] + runs[1]![0], runs[0]![1] + runs[1]![1]]), walls,
    skew: across + down ? Math.abs(across - down) / (across + down) : 0,
  };
}

/** The differences in a look's measures that, on average, make two mazes look nothing alike. */
export const LOOK_SCALE = { dead: 0.08, forks: 0.08, loops: 0.05, run: 2, walls: 3, skew: 0.3 };

/** How alike two looks are, 0 to 1: their shapes (side against side, the board turned either way) times how alike
 *  their corridors run (each measure's difference against LOOK_SCALE; 0 when they differ that much on average). */
export function lookLikeness(a: Look, b: Look): number {
  const ratio = (x: number, y: number) => Math.min(x, y) / Math.max(x, y);
  const shape = Math.max(ratio(a.rows, b.rows) * ratio(a.cols, b.cols), ratio(a.rows, b.cols) * ratio(a.cols, b.rows));
  const keys = Object.keys(LOOK_SCALE) as (keyof typeof LOOK_SCALE)[];
  const off = keys.reduce((n, k) => n + Math.abs(a[k] - b[k]) / LOOK_SCALE[k], 0) / keys.length;
  return shape * Math.max(0, 1 - off);
}

/** Two levels of a run look alike from this much (runLikeness). */
export const RUN_SAME = 0.6;

/** How alike two levels of a run look, 0 to 1: their looks (lookLikeness), or their layouts' overlap (mazeOverlap,
 *  over the turns and flips of `b`) put on the same scale, SAME counting as RUN_SAME, whichever is more. */
export function runLikeness(a: Level, b: Level): number {
  return Math.max(lookLikeness(lookOf(a), lookOf(b)), mazeOverlap(a, b) * RUN_SAME / SAME);
}

/** A new layout: its features overlap no campaign level's by SAME, and it looks like none of `run` (the run's
 *  earlier levels) by RUN_SAME (runLikeness); with `look` false, its layout overlaps none of `run`'s by SAME
 *  (a bank's levels against each other, where one size and style may come more than once). */
export function newProblems(level: Level, known: Known, run: readonly Level[] = [], look = true): string[] {
  const A = mazeFeaturesOf(level);
  const out: string[] = [];
  known.features.forEach((Bs, k) => { const x = overlapOf(A, Bs); if (x >= SAME) out.push(`its layout repeats campaign level ${k + 1}'s (${x.toFixed(2)})`); });
  run.forEach((lv, k) => {
    const x = look ? runLikeness(level, lv) : overlapOf(A, eight(mazeFeaturesOf(lv)));
    if (x >= (look ? RUN_SAME : SAME)) out.push(`its layout ${look ? 'looks like' : 'repeats'} the run's level ${k + 1}'s (${x.toFixed(2)})`);
  });
  return out;
}

/** How near `level` comes to repeating a layout: the most its layout overlaps any campaign level's against SAME, or
 *  looks like any of `run`'s against RUN_SAME (with `look` false, overlaps any of theirs against SAME, as
 *  newProblems); under 1 it is new. */
export function likeness(level: Level, known: Known, run: readonly Level[] = [], look = true): number {
  const A = mazeFeaturesOf(level);
  let most = 0;
  for (const Bs of known.features) most = Math.max(most, overlapOf(A, Bs) / SAME);
  for (const lv of run) most = Math.max(most, look ? runLikeness(level, lv) / RUN_SAME : overlapOf(A, eight(mazeFeaturesOf(lv))) / SAME);
  return most;
}

/** A sentence as the editor shows it: its first letter a capital. */
const sentence = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** difficulty.ts's problems, in the editor's plain words. */
function plain(rule: string, problems: readonly string[]): Problem[] {
  return problems.map(p => {
    let words = sentence(p);
    if (rule === 'purpose') words = `A useless piece: ${p.slice(0, p.indexOf(':') > 0 ? p.indexOf(':') : p.length)}`;
    else if (p === 'the plain walk to the exit wins') words = 'The plain walk wins: walking straight to each relic and the exit clears it';
    else if (p.startsWith('a challenge level: the line that ignores')) words = 'The Minotaur can be ignored: the best line without him also wins';
    else if (p.startsWith('a challenge level: ')) words = sentence(p.slice('a challenge level: '.length));
    else if (rule === 'threat') words = `The Minotaur is no threat: ${p}`;
    else if (rule === 'tidy') words = `Untidy: ${p}`;
    return { rule, words };
  });
}

/** What the run-independent checks found: the level's score (null when it never got that far) and its problems. */
export interface Checked { score: Score | null; problems: Problem[] }

/** Every rule that does not depend on the run, for a level of `grade` (or the grade its score puts it at): the
 *  campaign's checks as a challenge level of its chapter, nothing under a figure, a tidy maze, no habit win, the
 *  score, open space that earns its place, the tools needed, and every piece's purpose, in order of their cost. With `all` false it stops at the first that fails
 *  (Endless's gate); with `all` true it goes through every one (the editor). Searches are capped at `cap`. */
export function* levelChecks(level: Level, d: Difficulty, grade: Grade | ((score: Score) => Grade), all: boolean, cap = SOLVER_CAP): Generator<Progress, Checked, void> {
  const problems: Problem[] = [];
  const add = (ps: readonly Problem[]) => { problems.push(...ps); return !all && problems.length > 0; };
  if (!d.solved) return { score: null, problems: plain('solve', challengeProblems(d)) };
  if (add(plain('challenge', challengeProblems(d, BAR, contextOf(chapterOf(level)))))) return { score: null, problems };
  if (add(plain('shared', sharedProblems(d, ENDLESS_SHARED_BAR).filter(p => !challengeProblems(d).includes(p))))) return { score: null, problems };
  if (add(plain('threat', threatProblems(level, d, 'challenge')))) return { score: null, problems };
  if (add(plain('hidden', hiddenProblems(level, d)))) return { score: null, problems };
  if (add(plain('start', startProblems(level)))) return { score: null, problems };
  if (add(plain('tidy', tidyProblems(level)))) return { score: null, problems };
  yield { expanded: 0, stored: 0, bestF: 0, startH: 0 };
  if (add(habitProblems(level, d))) return { score: null, problems };
  const score = yield* scoring(level, d);
  if (add(yield* openProblems(level, score, cap))) return { score, problems };
  if (add(yield* toolProblems(level, d, typeof grade === 'function' ? grade(score) : grade, cap))) return { score, problems };
  add(plain('purpose', yield* purposing(level, d, cap)));
  return { score, problems };
}

/** A level as the editor's Check rates it: its numbers, its score and the band the score puts it in (null when it
 *  never got that far), and every rule it fails, judged at that band's grade, so the editor says what Endless would. */
export interface Rated { d: Difficulty; score: Score | null; band: Rank | null; problems: Problem[] }

/** The editor's rating of a level measured as `d`: levelChecks with every rule, at the grade of the band its score
 *  falls in. */
export function* rating(level: Level, d: Difficulty, cap = CHECK_CAP): Generator<Progress, Rated, void> {
  const c = yield* levelChecks(level, d, s => gradeOf(bandOf(s.total)), true, cap);
  return { d, score: c.score, band: c.score ? bandOf(c.score.total) : null, problems: c.problems };
}

/** What Endless needs to know of where a level falls: its grade and band, and the run's level before it (null for
 *  the first). */
export interface Place { grade: Grade; band: Band; previous: Difficulty | null }

/** The run's checks that need no search: the situations within the floor and EXPLORED_MOST, and a layout new
 *  against the campaign and the run (newProblems, `look` as there). */
export function runProblems(level: Level, d: Difficulty, known: Known, run: readonly Level[] = [], look = true): string[] {
  const out: string[] = [];
  if (d.explored > EXPLORED_MOST) out.push(`stored ${d.explored} situations, more than ${EXPLORED_MOST}`);
  return [...out, ...newProblems(level, known, run, look)];
}

/** The score's band: empty when the score falls in it. */
export function bandProblems(score: Score, band: Band): string[] {
  return score.total < band.least || score.total > band.most ? [`scored ${score.total}, the band is ${band.least} to ${band.most}`] : [];
}

/** The whole gate: the run's checks, then levelChecks (stopping at the first failure), then the score's band. Empty
 *  when the level passes. */
export function gateProblems(level: Level, d: Difficulty, place: Place, known: Known, run: readonly Level[] = [], cap?: number): string[] {
  const r = runProblems(level, d, known, run);
  if (r.length) return r;
  let checked: Checked;
  const g = levelChecks(level, d, place.grade, false, cap);
  for (;;) { const n = g.next(); if (n.done) { checked = n.value; break; } }
  if (checked.problems.length) return checked.problems.map(p => p.words);
  return bandProblems(checked.score!, place.band);
}

/** Whether a level hides walls (difficulty.ts's), for the generator. */
export { hidesWalls };
