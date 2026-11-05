/* The Island of Crete: Demo, the title card's kiosk mode. It plays an Endless run at Medium with every piece, on a
 * random seed, by itself: each level along the solver's line (the play-out Auto gives, a step every STEP_MS), and, a
 * beat after each win, the next level, without end. Its run is its own Endless (src/endless/mode.ts) over saves kept
 * in memory (`memoryStorage`), so the player's saved runs, bests, progress and met entries stay as they were. While
 * the page is hidden it plays nothing (the page holds its workers). It asks for a screen wake lock while it runs, and
 * takes a refusal quietly. Any key or tap ends it (src/main.ts). DOM-free. */
import type { StorageLike, Timers } from '../../_kit/ports.ts';
import { SLIDE_MS } from './board-plan.ts';
import type { EndlessMode } from './endless/mode.ts';
import { GRADE_NAMES } from './puzzle/rating.ts';
import type { Grade } from './puzzle/rating.ts';

/** The difficulty Demo plays. */
export const DEMO_GRADE: Grade = 'medium';
/** Demo's pace, in ms: a step of the line (a touch slower than Auto's), the board in view before the first step,
 *  and the beat between a win and the next level. */
export interface DemoPace { step: number; begin: number; next: number }
export const DEMO_PACE: DemoPace = { step: SLIDE_MS * 4, begin: 900, next: 1500 };
/** The play-outs that may stop with the try no further along before Demo goes on to the next level. */
export const DEMO_TRIES = 3;

/** A wake lock as the page holds it (the browser's WakeLockSentinel). */
export interface WakeLock { readonly released: boolean; release(): Promise<void> | void }

/** What Demo reads of the game and asks of it. */
export interface DemoGame {
  readonly opens: number;
  readonly playing: boolean;
  readonly run: { readonly now: { readonly outcome: string; readonly moves: number } } | null;
  auto(every?: number): void;
  stop(): void;
}

export interface DemoDeps {
  timers: Pick<Timers, 'setTimeout' | 'clearTimeout'>;
  game: DemoGame;
  /** A fresh Endless of Demo's own, for each start. */
  mode(): EndlessMode;
  /** The piece tier Demo's runs take: every piece. */
  tier: number;
  newSeed(): string;
  /** The page is showing. */
  shown(): boolean;
  /** Demo started, ended, or its words changed. */
  changed(): void;
  /** Its searches end (Demo ended). */
  cancel?(): void;
  /** Asks for a screen wake lock; rejects when refused. */
  wakeLock?(): Promise<WakeLock>;
}

/** What the page shows while Demo runs. */
export interface DemoView {
  grade: Grade;
  /** The level in play, or the one being made. */
  depth: number;
  /** The level is being made (or the first is on its way). */
  finding: boolean;
}

export interface Demo {
  active(): boolean;
  view(): DemoView | null;
  start(): void;
  /** Ends Demo: the play-out, the searches and the wake lock stop. */
  stop(): void;
  /** Demo's Endless has just opened its level on the game. */
  opened(): void;
  /** The game, the page's showing or Demo's Endless changed. */
  update(): void;
  /** Another pace (the browser specs'). */
  setPace(p: Partial<DemoPace>): void;
}

/** The strip's line: "Demo · Endless Medium · Level 7". */
export function demoWords(v: DemoView): string {
  return `Demo · Endless ${GRADE_NAMES[v.grade]} · ${v.finding ? `Finding Level ${v.depth}…` : `Level ${v.depth}`}`;
}

/** Storage that lives only as long as the page: Demo's saved runs. */
export function memoryStorage(): StorageLike {
  const m = new Map<string, string>();
  return {
    getItem: k => m.get(k) ?? null,
    setItem: (k, v) => { m.set(k, v); },
    removeItem: k => { m.delete(k); },
  };
}

export function createDemo(deps: DemoDeps): Demo {
  let on = false;
  let pace: DemoPace = { ...DEMO_PACE };
  let mode: EndlessMode | null = null;
  /** The game's opening of Demo's level in play; null while the next is on its way. */
  let opens: number | null = null;
  /** Play-outs begun that left the try where it stood, and its moves when the last began. */
  let tries = 0;
  let lastMoves = -1;
  let beginTimer = 0;
  let nextTimer = 0;
  let againTimer = 0;
  let lock: WakeLock | null = null;
  let asking = false;

  const clear = (): void => {
    deps.timers.clearTimeout(beginTimer);
    deps.timers.clearTimeout(nextTimer);
    deps.timers.clearTimeout(againTimer);
    beginTimer = nextTimer = againTimer = 0;
  };

  /** Keeps the screen on while Demo runs and the page shows; the browser lets the lock go when the page hides. */
  function wake(): void {
    if (!deps.wakeLock || asking || (lock && !lock.released)) return;
    asking = true;
    deps.wakeLock().then(l => {
      asking = false;
      if (on) lock = l;
      else void l.release();
    }, () => { asking = false; });
  }

  function release(): void {
    const l = lock;
    lock = null;
    if (l && !l.released) {
      try { void Promise.resolve(l.release()).catch(() => {}); } catch { /* gone either way */ }
    }
  }

  /** A new run on a new seed. */
  function newRun(): void {
    opens = null;
    tries = 0;
    lastMoves = -1;
    mode?.newRun(deps.newSeed(), deps.tier, DEMO_GRADE);
  }

  /** The level is done (won, or its line would not play): a win counted in Demo's run, and the next level. */
  function advance(): void {
    if (!on || !mode) return;
    mode.won(deps.game.run?.now.moves ?? 0, true);
    opens = null;
    tries = 0;
    lastMoves = -1;
    mode.next();
    // A run that cannot go on (it was lost) starts again on a new seed.
    if (opens === null && !mode.view().finding) newRun();
    deps.changed();
  }

  /** The play-out starts, when the level is still Demo's, in play and showing. */
  function begin(): void {
    beginTimer = 0;
    const g = deps.game;
    const s = g.run?.now;
    if (!on || !deps.shown() || g.opens !== opens || !s || s.outcome !== 'playing' || g.playing) return;
    if (s.moves !== lastMoves) tries = 0;
    lastMoves = s.moves;
    if (++tries > DEMO_TRIES) { advance(); return; }
    g.auto(pace.step);
  }

  function update(): void {
    if (!on || !mode) return;
    if (!deps.shown()) {
      clear();
      deps.game.stop();
      return;
    }
    wake();
    const v = mode.view();
    if (opens === null) {
      // No level could be made: a new run on another seed, after a beat.
      if (v.error && !v.finding && !againTimer) againTimer = deps.timers.setTimeout(() => { againTimer = 0; if (on) newRun(); }, pace.next);
      deps.changed();
      return;
    }
    const g = deps.game;
    const s = g.run?.now;
    if (g.opens !== opens || !s) return;
    if (s.outcome === 'playing') {
      if (!g.playing && !beginTimer) beginTimer = deps.timers.setTimeout(begin, lastMoves < 0 ? pace.begin : pace.step);
    } else if (!nextTimer) {
      nextTimer = deps.timers.setTimeout(() => { nextTimer = 0; advance(); }, pace.next);
    }
  }

  return {
    active: () => on,
    view() {
      if (!on || !mode) return null;
      const run = mode.view().run;
      const depth = run ? run.depth + (opens === null && run.cleared >= run.depth ? 1 : 0) : 1;
      return { grade: DEMO_GRADE, depth, finding: opens === null };
    },
    start() {
      if (on) return;
      on = true;
      mode = deps.mode();
      wake();
      deps.changed();
      newRun();
    },
    stop() {
      if (!on) return;
      on = false;
      clear();
      deps.game.stop();
      mode?.cancel();
      mode = null;
      opens = null;
      deps.cancel?.();
      release();
      deps.changed();
    },
    opened() {
      if (!on) return;
      opens = deps.game.opens;
      tries = 0;
      lastMoves = -1;
      clear();
      deps.changed();
      update();
    },
    update,
    setPace(p) { pace = { ...pace, ...p }; },
  };
}
