/* The Island of Crete: Endless on the page, DOM-free. It keeps the saved run (src/endless/saved.ts), asks the
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

/** What an Endless level is, for the cards: its depth, its name and its fewest moves. */
export interface EndlessAbout { kind: 'endless'; name: string; best: null; depth: number; fewest: number; seed: string }

export interface EndlessDeps {
  saved: EndlessSaved;
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
  /** A seed a link brought, with the tier it names (else the player's), until it is played or the card is left. */
  linked: { seed: string; tier: number } | null;
}

export interface EndlessMode {
  view(): EndlessView;
  /** A new run on `seed` (a random one when not given) and `tier` (the player's when not given), opened at its
   *  first level. */
  newRun(seed?: string, tier?: number): void;
  /** A link brought `seed` (and perhaps a tier): the card offers it. */
  link(seed: string, tier: number | null): void;
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
export function introOf(seed: string, l: RunLevel): string {
  return `Seed ${seed}. The fewest moves are ${l.shortest}.${l.from === 'bank' ? ' From the level bank.' : ''}`;
}

export function createEndlessMode(deps: EndlessDeps): EndlessMode {
  let finding: { progress: Progress | null } | null = null;
  let error: string | null = null;
  /** The worker's job: the level it makes is the saved run's next one (or its first). */
  let job: { make: MakeJob; seed: string; depth: number; first: boolean; upcoming: boolean } | null = null;
  /** Open the level once it is made. */
  let waiting = false;
  let linked: { seed: string; tier: number } | null = null;

  const about = (run: EndlessRun, l: RunLevel): EndlessAbout =>
    ({ kind: 'endless', name: endlessName(run.seed, run.depth), best: null, depth: run.depth, fewest: l.shortest, seed: run.seed });
  const openCurrent = (run: EndlessRun) => {
    const l = run.levels.at(-1)!;
    let level: Level;
    try { level = parse(l.text); } catch (e) { error = `The level could not be read: ${e instanceof Error ? e.message : String(e)}`; deps.changed(); return; }
    deps.play({ ...level, title: endlessName(run.seed, run.depth), intro: introOf(run.seed, l) }, about(run, l), lineOf(l.line));
    prefetch();
  };

  /** Keeps the workers AHEAD levels in front of the one being played: each level made starts the next. */
  function prefetch(): void {
    const run = deps.saved.run();
    if (!run) return;
    const queued = deps.saved.queued().length;
    if (queued >= AHEAD) return;
    const depth = run.depth + 1 + queued;
    if (job && !job.upcoming && job.seed === run.seed && job.depth === depth) return;
    start(run.seed, run.tier, depth, false);
  }

  /** The next new run's levels, made while there is no run: its seed is chosen once and kept; its levels are
   *  dropped when the tier or the budget it was made for changes. */
  function ahead(): void {
    if (waiting) return;
    if (deps.saved.run()) { prefetch(); return; }
    const tier = deps.tier(), budget = deps.budget?.() ?? null;
    let up = deps.saved.upcoming();
    if (!up || up.tier !== tier || up.budget !== budget) up = deps.saved.plan(up?.seed ?? deps.newSeed(), tier, budget);
    if (up.levels.length >= UPCOMING) return;
    const depth = up.levels.length + 1;
    if (job && job.upcoming && job.seed === up.seed && job.depth === depth) return;
    start(up.seed, tier, depth, false, up.levels);
  }

  function start(seed: string, tier: number, depth: number, first: boolean, upcoming: readonly RunLevel[] | null = null): void {
    job?.make.cancel();
    const played = first ? [] : upcoming ? upcoming.map(l => ({ text: l.text, explored: l.explored })) : deps.saved.played();
    const budget = deps.budget?.();
    const make = deps.client.make({ seed, tier, depth, run: played, ...(budget !== undefined ? { budget } : {}) });
    const mine = { make, seed, depth, first, upcoming: !!upcoming };
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
        deps.saved.addUpcoming(seed, depth, made);
        ahead();
        deps.changed();
        return;
      }
      if (first) {
        const run = deps.saved.start(seed, tier, made);
        if (waiting) { waiting = false; finding = null; deps.changed(); openCurrent(run); }
        return;
      }
      deps.saved.addMade(seed, depth, made);
      const run = deps.saved.run();
      if (waiting && run?.next && run.depth + 1 === depth) { waiting = false; finding = null; deps.changed(); goNext(); return; }
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
    const run = deps.saved.advance();
    if (!run) return;
    openCurrent(run);
  }

  return {
    view: () => {
      const run = deps.saved.run();
      const up = run ? null : deps.saved.upcoming();
      const tier = deps.tier();
      const ready = run ? deps.saved.queued().length : up && up.tier === tier && up.budget === (deps.budget?.() ?? null) ? up.levels.length : 0;
      return { run, best: deps.saved.best(), tier, ready, finding, error, linked };
    },
    link(seed, tier) {
      const s = cleanSeed(seed);
      if (!s) return;
      const run = deps.saved.run();
      const t = tier !== null && Number.isInteger(tier) && tier >= 1 && tier <= 10 ? tier : deps.tier();
      // The saved run is that seed's: Continue is the way back into it.
      linked = run && run.seed === s && run.tier === t ? null : { seed: s, tier: t };
      deps.changed();
    },
    newRun(seed, tier) {
      const up = deps.saved.upcoming();
      const s = (seed && cleanSeed(seed)) || up?.seed || deps.newSeed();
      const t = tier !== undefined && Number.isInteger(tier) && tier >= 1 && tier <= 10 ? tier : deps.tier();
      linked = null;
      error = null;
      // The levels made ahead for this seed, tier and budget: the run opens on them at once.
      if (up && up.levels.length && up.seed === s && up.tier === t && up.budget === (deps.budget?.() ?? null)) {
        if (job) { job.make.cancel(); job = null; }
        waiting = false;
        finding = null;
        const [first, ...after] = up.levels;
        const run = deps.saved.start(s, t, first!, after);
        deps.changed();
        openCurrent(run);
        return;
      }
      waiting = true;
      finding = { progress: null };
      deps.changed();
      start(s, t, 1, true);
    },
    continueRun() {
      const run = deps.saved.run();
      if (!run) return;
      error = null;
      openCurrent(run);
    },
    won(moves, assisted) {
      deps.saved.won(moves, assisted);
      deps.changed();
    },
    next() {
      const run = deps.saved.run();
      if (!run || run.cleared < run.depth) return;
      if (run.next) { goNext(); return; }
      error = null;
      waiting = true;
      finding = { progress: null };
      deps.changed();
      if (!job || job.seed !== run.seed || job.depth !== run.depth + 1) start(run.seed, run.tier, run.depth + 1, false);
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
