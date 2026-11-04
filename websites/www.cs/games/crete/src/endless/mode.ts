/* The Island of Crete: Endless on the page, DOM-free. A run is played at a grade, Easy, Medium or Hard, each with its
 * own saved run and best; the card shows the grade chosen last (Medium until one is). It keeps the saved runs
 * (src/endless/saved.ts), asks the
 * worker (src/endless/client.ts) for levels, and opens them as levels from outside the campaign. A new run's first
 * level comes from the bank at once; while a level is played, the workers already make the next AHEAD, so Next
 * Level usually opens one straight away, and otherwise the Endless card shows the search's progress until it is in.
 * Outside a run, `ahead()` makes levels in the background: the saved run's next ones, or, with no run, the next new
 * run's (its seed chosen ahead, src/endless/saved.ts's upcoming), so New Run opens on levels already made. How many
 * workers it may use is the client's `size()`. The card's words come from `view()`. */
import { parse } from '../puzzle/level.ts';
import { lineOf } from '../puzzle/cache.ts';
import type { Action } from '../puzzle/step.ts';
import type { Level } from '../puzzle/level.ts';
import type { Made, Progress } from './generate.ts';
import type { EndlessClient, MakeJob } from './client.ts';
import { CancelledError } from './client.ts';
import { AHEAD, UPCOMING } from './saved.ts';
import type { EndlessBest, EndlessRun, EndlessSaved, RunLevel } from './saved.ts';
import { endlessName } from './name.ts';
import { cleanSeed } from './random.ts';
import { GRADES, GRADE_NAMES } from '../puzzle/rating.ts';
import type { Grade } from '../puzzle/rating.ts';

/** What an Endless level is, for the cards: its depth, its name and its fewest moves. */
export interface EndlessAbout { kind: 'endless'; name: string; best: null; depth: number; fewest: number; seed: string; grade: Grade }

export interface EndlessDeps {
  /** Each grade's saved run and best. */
  saved(grade: Grade): EndlessSaved;
  /** The grade the card shows, and choosing another. */
  grade(): Grade;
  setGrade(grade: Grade): void;
  client: EndlessClient;
  /** The piece tier a new run takes (src/endless/tier.ts). */
  tier(): number;
  /** A new random seed. */
  newSeed(): string;
  /** Opens `level` on the game screen, with its shortest line for Ariadne's thread. */
  play(level: Level, about: EndlessAbout, line: readonly Action[] | null): void;
  /** The card's words changed. */
  changed(): void;
  /** The search's budget, when a browser spec has set one. */
  budget?(): number | undefined;
}

export interface EndlessView {
  /** The grade the card shows: its run, best and levels ready are the ones below. */
  grade: Grade;
  /** The saved run, when there is one. */
  run: EndlessRun | null;
  best: EndlessBest | null;
  /** The tier a new run would take. */
  tier: number;
  /** Levels made ahead and ready: the saved run's queued ones, or, with no run, the next new run's. */
  ready: number;
  /** The search for a level the player waits on: its progress (null until the first report), or null when none. */
  finding: { progress: Progress | null } | null;
  /** Why the last level could not be made, until the next try. */
  error: string | null;
  /** A seed a link brought, with the tier and grade it names (else the player's and Medium), until it is played or
   *  the card is left. */
  linked: { seed: string; tier: number; grade: Grade } | null;
}

export interface EndlessMode {
  view(): EndlessView;
  /** A new run on `seed` (a random one when not given), `tier` (the player's when not given) and `grade` (the
   *  card's when not given), opened at its first level. */
  newRun(seed?: string, tier?: number, grade?: Grade): void;
  /** A link brought `seed` (and perhaps a tier and a grade): the card offers it, at that grade. */
  link(seed: string, tier: number | null, grade?: string | null): void;
  /** The card shows `grade`. */
  choose(grade: Grade): void;
  /** The saved run's level, opened again. */
  continueRun(): void;
  /** The level in play was won. */
  won(moves: number, assisted: boolean): void;
  /** Next Level: the run's next level, at once when it is made, else once the search ends. */
  next(): void;
  /** Stops waiting for a level (the search for the next level goes on in the background only when one is due). */
  cancel(): void;
  /** The level being played belongs to the saved run: the next one is being made, or ready. */
  prefetch(): void;
  /** Makes levels in the background, while the player waits on none: the saved run's next, else the next new
   *  run's first; nothing once they are made. */
  ahead(): void;
}

/** The start card's words: the seed and the fewest moves, and, for a level the search did not make from the seed
 *  in time, that it comes from the level bank. */
export function introOf(seed: string, l: RunLevel, grade: Grade): string {
  return `Seed ${seed}, ${GRADE_NAMES[grade]}. The fewest moves are ${l.shortest}.${l.from === 'bank' ? ' From the level bank.' : ''}`;
}

/** A grade as a link names it, or null for anything else. */
export function gradeFrom(raw: string | null | undefined): Grade | null {
  const g = (raw ?? '').trim().toLowerCase();
  return GRADES.includes(g as Grade) ? g as Grade : null;
}

export function createEndlessMode(deps: EndlessDeps): EndlessMode {
  let finding: { progress: Progress | null } | null = null;
  let error: string | null = null;
  /** The worker's job: the level it makes is a run's next one (or its first), or the upcoming run's. */
  let job: { make: MakeJob; seed: string; tier: number; grade: Grade; budget: number | null; depth: number; first: boolean; upcoming: boolean } | null = null;
  /** Open the level once it is made. */
  let waiting = false;
  let linked: { seed: string; tier: number; grade: Grade } | null = null;
  /** The grade of the run whose level is open: its wins and Next Level go to that run, whatever the card shows. */
  let playing: Grade = deps.grade();

  const about = (run: EndlessRun, l: RunLevel, grade: Grade): EndlessAbout =>
    ({ kind: 'endless', name: endlessName(run.seed, run.depth), best: null, depth: run.depth, fewest: l.shortest, seed: run.seed, grade });
  const openCurrent = (run: EndlessRun, grade: Grade) => {
    playing = grade;
    const l = run.levels.at(-1)!;
    let level: Level;
    try { level = parse(l.text); } catch (e) { error = `The level could not be read: ${e instanceof Error ? e.message : String(e)}`; deps.changed(); return; }
    deps.play({ ...level, title: endlessName(run.seed, run.depth), intro: introOf(run.seed, l, grade) }, about(run, l, grade), lineOf(l.line));
    prefetch();
  };

  /** Keeps the workers AHEAD levels in front of the level being played: each level made starts the next. */
  function prefetch(): void {
    const saved = deps.saved(playing);
    const run = saved.run();
    if (!run) return;
    const queued = saved.queued().length;
    if (queued >= AHEAD) return;
    const depth = run.depth + 1 + queued;
    if (job && !job.upcoming && job.grade === playing && job.seed === run.seed && job.depth === depth) return;
    start(run.seed, run.tier, playing, depth, false);
  }

  /** In the background: the card's grade's saved run's next levels, or, with no run, its next new run's (its seed
   *  chosen once and kept; its levels dropped when the tier or the budget it was made for changes). */
  function ahead(): void {
    if (waiting) return;
    const grade = deps.grade();
    const saved = deps.saved(grade);
    if (saved.run()) { playing = grade; prefetch(); return; }
    const tier = deps.tier(), budget = deps.budget?.() ?? null;
    let up = saved.upcoming();
    if (!up || up.tier !== tier || up.budget !== budget) up = saved.plan(up?.seed ?? deps.newSeed(), tier, budget);
    if (up.levels.length >= UPCOMING) return;
    const depth = up.levels.length + 1;
    if (job && job.upcoming && job.grade === grade && job.seed === up.seed && job.tier === tier && job.budget === budget && job.depth === depth) return;
    start(up.seed, tier, grade, depth, false, up.levels);
  }

  function start(seed: string, tier: number, grade: Grade, depth: number, first: boolean, upcoming: readonly RunLevel[] | null = null): void {
    job?.make.cancel();
    const saved = deps.saved(grade);
    const played = first ? [] : upcoming ? upcoming.map(l => ({ text: l.text, explored: l.explored, score: l.score })) : saved.played();
    const budget = deps.budget?.();
    const make = deps.client.make({ seed, tier, grade, depth, run: played, ...(budget !== undefined ? { budget } : {}) });
    const mine = { make, seed, tier, grade, budget: budget ?? null, depth, first, upcoming: !!upcoming };
    job = mine;
    make.progress(p => {
      if (job !== mine || !finding) return;
      finding = { progress: p };
      deps.changed();
    });
    make.result.then((made: Made) => {
      if (job !== mine) return;
      job = null;
      if (mine.upcoming) {
        // Kept only for the plan it was made for: a new tier or budget remakes the upcoming run.
        const up = saved.upcoming();
        if (up && up.tier === mine.tier && up.budget === mine.budget) saved.addUpcoming(seed, depth, made);
        ahead();
        deps.changed();
        return;
      }
      if (first) {
        const run = saved.start(seed, tier, made);
        if (waiting) { waiting = false; finding = null; deps.changed(); openCurrent(run, grade); }
        return;
      }
      saved.addMade(seed, depth, made);
      const run = saved.run();
      if (waiting && grade === playing && run?.next && run.depth + 1 === depth) { waiting = false; finding = null; deps.changed(); goNext(); return; }
      prefetch();
    }, (e: unknown) => {
      if (job !== mine) return;
      job = null;
      // A level made in the background that could not be made is asked for again when the player wants it.
      if (e instanceof CancelledError || mine.upcoming) return;
      error = `No level could be made: ${e instanceof Error ? e.message : String(e)}`;
      waiting = false;
      finding = null;
      deps.changed();
    });
  }

  function goNext(): void {
    const run = deps.saved(playing).advance();
    if (!run) return;
    openCurrent(run, playing);
  }

  const tierFrom = (tier: number | null | undefined) => (tier !== null && tier !== undefined && Number.isInteger(tier) && tier >= 1 && tier <= 10 ? tier : deps.tier());

  return {
    view: () => {
      const grade = deps.grade();
      const saved = deps.saved(grade);
      const run = saved.run();
      const up = run ? null : saved.upcoming();
      const tier = deps.tier();
      const ready = run ? saved.queued().length : up && up.tier === tier && up.budget === (deps.budget?.() ?? null) ? up.levels.length : 0;
      return { grade, run, best: saved.best(), tier, ready, finding, error, linked };
    },
    choose(grade) {
      if (!GRADES.includes(grade) || grade === deps.grade()) return;
      deps.setGrade(grade);
      if (linked) linked = { ...linked, grade };
      error = null;
      deps.changed();
    },
    link(seed, tier, grade) {
      const s = cleanSeed(seed);
      if (!s) return;
      const g = gradeFrom(grade) ?? 'medium';
      const t = tierFrom(tier);
      if (g !== deps.grade()) deps.setGrade(g);
      const run = deps.saved(g).run();
      // The saved run is that seed's: Continue is the way back into it.
      linked = run && run.seed === s && run.tier === t ? null : { seed: s, tier: t, grade: g };
      deps.changed();
    },
    newRun(seed, tier, grade) {
      const g = grade && GRADES.includes(grade) ? grade : deps.grade();
      if (g !== deps.grade()) deps.setGrade(g);
      const saved = deps.saved(g);
      const up = saved.upcoming();
      const s = (seed && cleanSeed(seed)) || up?.seed || deps.newSeed();
      const t = tierFrom(tier);
      linked = null;
      error = null;
      playing = g;
      // The levels made ahead for this seed, tier and budget: the run opens on them at once.
      if (up && up.levels.length && up.seed === s && up.tier === t && up.budget === (deps.budget?.() ?? null)) {
        if (job) { job.make.cancel(); job = null; }
        waiting = false;
        finding = null;
        const [first, ...after] = up.levels;
        const run = saved.start(s, t, first!, after);
        deps.changed();
        openCurrent(run, g);
        return;
      }
      waiting = true;
      finding = { progress: null };
      deps.changed();
      start(s, t, g, 1, true);
    },
    continueRun() {
      const grade = deps.grade();
      const run = deps.saved(grade).run();
      if (!run) return;
      error = null;
      openCurrent(run, grade);
    },
    won(moves, assisted) {
      deps.saved(playing).won(moves, assisted);
      deps.changed();
    },
    next() {
      const run = deps.saved(playing).run();
      if (!run || run.cleared < run.depth) return;
      if (run.next) { goNext(); return; }
      error = null;
      waiting = true;
      finding = { progress: null };
      deps.changed();
      if (!job || job.grade !== playing || job.seed !== run.seed || job.depth !== run.depth + 1) start(run.seed, run.tier, playing, run.depth + 1, false);
    },
    cancel() {
      linked = null;
      waiting = false;
      finding = null;
      if (job?.first) { job.make.cancel(); job = null; }
      deps.changed();
    },
    prefetch,
    ahead,
  };
}
