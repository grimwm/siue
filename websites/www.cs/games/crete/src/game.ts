/* The Island of Crete: the controller. It holds the try in progress, plays the
 * player's presses and Ariadne's thread (a hint, the whole line, a play-out)
 * through the engine, voices each turn's events, records a win, and keeps the
 * turn that is animating. A turn's animation pauses where the player's figure
 * reaches a story page, while the page reads it, and goes on when told. The
 * page draws from it and holds no rules. DOM-free. */
import type { Clock, Timers } from '../../_kit/ports.ts';
import { SLIDE_MS, timeline } from './board-plan.ts';
import type { Figures, Timeline } from './board-plan.ts';
import type { Levels } from './campaign/chapters.ts';
import type { FoundPages } from './pages.ts';
import type { Progress } from './progress.ts';
import { act, assist, restart, startRun, undo } from './puzzle/run.ts';
import type { Run } from './puzzle/run.ts';
import { solve } from './puzzle/solver.ts';
import { pagesTaken } from './puzzle/state.ts';
import type { State } from './puzzle/state.ts';
import { act as actAlone, step } from './puzzle/step.ts';
import type { Action, GameEvent } from './puzzle/step.ts';
import type { Cell } from './puzzle/tiles.ts';

export type SfxName =
  | 'step' | 'push' | 'splash' | 'sizzle' | 'door' | 'key' | 'relic' | 'gate' | 'button' | 'slide'
  | 'caught' | 'stone' | 'win' | 'lose' | 'bump' | 'pickup' | 'page' | 'hint' | 'chapter';

export type Tone = 'info' | 'good' | 'bad';

/** The most states the thread's search may visit in the browser. */
export const THREAD_CAP = 200_000;
export const SLACK = 'The thread goes slack: undo or restart.';

export interface GameDeps {
  sfx(name: SfxName): void;
  say(text: string, tone?: Tone): void;
  progress: Progress;
  /** The story pages found, kept in this browser. */
  pages: FoundPages;
  /** The levels played, by index. */
  levels: Levels;
  /** For the T play-out. */
  timers: Timers;
  /** The animation's time. */
  clock: Clock;
  reducedMotion(): boolean;
  /** The view redraws. */
  changed(): void;
}

export interface Anim {
  timeline: Timeline;
  /** `clock.now()` when the turn was played. */
  started: number;
  /** The state the turn began from: it is drawn while the player's own moves play. */
  before: State;
  /** The state once the player's action alone has played: it is drawn while the hazards move. */
  mid: State;
  /** The story pages the player's figure reaches this turn, by id, at the moment it lands on each. */
  stops: readonly PageStop[];
  /** The page the animation waits at while it is read, or null while it plays. */
  paused: PageStop | null;
}

export interface PageStop { id: string; ms: number }

export interface Game {
  /** 0-based; -1 before one opens. */
  readonly trial: number;
  /** How many times a level has been opened: the page shows its start card for each. */
  readonly opens: number;
  readonly run: Run | null;
  /** V: the line's cells while shown. */
  readonly thread: readonly Cell[] | null;
  /** T is playing the line out. */
  readonly playing: boolean;
  readonly anim: Anim | null;
  /** The animation's time now, ms since the turn was played less any time spent paused. Reaching a story
   *  page pauses it there (`anim.paused`) and tells the page; it then stays at that time until `resume`. */
  animMs(): number;
  /** Goes on from a page the animation paused at, from the same moment. */
  resume(): void;
  /** The pages the last win recorded as new; empty after open, undo and restart. */
  readonly found: readonly string[];
  /** Starts level `i` fresh (clears assisted). */
  open(i: number): void;
  press(a: Action | 'undo' | 'restart'): void;
  hint(): void;
  route(): void;
  auto(): void;
  /** Ends the play-out, if one is running. */
  stop(): void;
  finishAnim(): void;
}

/** What the board draws `ms` into the animation: the state before the turn, less each thing the figure has
 *  reached, while the player's own moves, slides and pushed blocks play; the state once the player's action alone
 *  has played (`anim.mid`) while the hazards move; the state after the turn while the Minotaur's steps play; and
 *  the figures at rest once it ends. The hazards drawn are the figures', never the state's. An animation paused
 *  at a page is not done. */
export function frameOf(g: Pick<Game, 'run' | 'anim'>, ms: number): { state: State; figures: Figures; done: boolean } | null {
  if (!g.run) return null;
  const a = g.anim;
  if (a && (ms < a.timeline.duration || a.paused)) {
    const state = ms < a.timeline.playerEnd ? takenBy(a, ms) : ms < a.timeline.hazardEnd ? a.mid : g.run.now;
    return { state, figures: a.timeline.at(ms), done: false };
  }
  const now = g.run.now;
  return { state: now, figures: { player: now.player, minotaur: now.minotaur, hazards: now.hazards.map(h => ({ kind: h.kind, at: h.at })) }, done: true };
}

/** The state before the turn with each thing the figure has reached by `ms` gone from its cell. */
function takenBy(a: Pick<Anim, 'before' | 'timeline'>, ms: number): State {
  const gone = a.timeline.taken.filter(t => t.ms <= ms);
  if (gone.length === 0) return a.before;
  const objects = [...a.before.objects];
  for (const t of gone) objects[t.at.r * a.before.level.cols + t.at.c] = null;
  return { ...a.before, objects };
}

/** Where the turn's animation stops for each story page the player takes. */
function pageStops(before: State, tl: Timeline): PageStop[] {
  const { cols, pageIds, pageCells } = before.level;
  return tl.taken.flatMap(t => {
    const id = t.what === 'page' ? pageIds[pageCells.indexOf(t.at.r * cols + t.at.c)] : undefined;
    return id === undefined ? [] : [{ id, ms: t.ms }];
  });
}

export function createGame(deps: GameDeps): Game {
  let trial = -1;
  let opens = 0;
  let run: Run | null = null;
  let thread: readonly Cell[] | null = null;
  let anim: Anim | null = null;
  /** How many of the animation's page stops it has reached. */
  let reached = 0;
  let tick: number | null = null;
  let found: readonly string[] = [];
  /** V is on: the line from the try as it stands stays drawn through every turn. */
  let threadOn = false;

  const stop = (): void => {
    if (tick === null) return;
    deps.timers.clearInterval(tick);
    tick = null;
    deps.changed();
  };

  function finishAnim(): void {
    if (!anim) return;
    anim = null;
    deps.changed();
  }

  function voice(events: GameEvent[], before: State, after: State): void {
    let slid = false;
    for (const e of events) {
      switch (e.kind) {
        case 'moved':
          if (e.who === 'player') {
            deps.sfx(before.terrain[e.to.r * before.level.cols + e.to.c] === 'fire' ? 'sizzle' : 'step');
          }
          break;
        case 'slid':
          if (!slid) deps.sfx('slide');
          slid = true;
          if (e.who === 'player' && before.terrain[e.to.r * before.level.cols + e.to.c] === 'fire') deps.sfx('sizzle');
          break;
        case 'pushed': deps.sfx('push'); break;
        case 'sank': deps.sfx('splash'); break;
        case 'opened': deps.sfx('door'); break;
        case 'took':
          if (e.what.startsWith('key-')) deps.sfx('key');
          else if (e.what === 'relic') deps.sfx(after.relicsLeft === 0 ? 'gate' : 'relic');
          else if (e.what === 'page') deps.sfx('page');
          else if (e.what === 'fire-boots') deps.sfx('sizzle');
          else deps.sfx('pickup');
          break;
        case 'flipped': deps.sfx('button'); break;
        case 'caught':
          deps.sfx('caught');
          deps.say(`Caught! ${e.hearts} ${e.hearts === 1 ? 'heart' : 'hearts'} left.`, 'bad');
          break;
        case 'stoned': deps.sfx('stone'); break;
        case 'won': deps.sfx('win'); break;
        case 'lost': deps.sfx('lose'); break;
      }
    }
  }

  /** Plays one action on the try; false when it was a bump. */
  function play(a: Action): boolean {
    if (!run) return false;
    const r = act(run, a);
    if (r.run === run) {
      if (run.now.outcome === 'playing') deps.sfx('bump');
      return false;
    }
    const before = run.now;
    run = r.run;
    if (a.kind === 'tool' && a.tool !== 'mirror') deps.sfx('pickup');
    voice(r.events, before, run.now);
    const tl = timeline(before, r.events, deps.reducedMotion(), run.now);
    anim = tl.duration > 0 ? { timeline: tl, started: deps.clock.now(), before, mid: actAlone(before, a).state, stops: pageStops(before, tl), paused: null } : null;
    reached = 0;
    if (run.now.outcome === 'won') {
      deps.progress.record(deps.levels.id(trial), run.now.moves, run.assisted);
      found = deps.pages.add(pagesTaken(run.now));
    }
    redraw();
    deps.changed();
    return true;
  }

  /** A solve of the try as it stands, or null (with a word said) when none is found. */
  function line(): Action[] | null {
    const r = solve(run!.now, THREAD_CAP);
    if (!r.solved) {
      deps.say(SLACK, 'bad');
      return null;
    }
    return r.line;
  }

  const live = (): boolean => !!run && run.now.outcome === 'playing';

  function helped(): void {
    if (run) run = assist(run);
  }

  /** The thread after the try changed: drawn again from where it stands, or off when it ends or cannot be won. */
  function redraw(): void {
    thread = null;
    if (!threadOn) return;
    if (!live()) {
      threadOn = false;
      return;
    }
    const l = line();
    if (!l) {
      threadOn = false;
      return;
    }
    thread = cells(l);
  }

  function nextOfLine(): boolean {
    const l = line();
    if (!l || l.length === 0) return false;
    helped();
    finishAnim();
    play(l[0]!);
    return true;
  }

  function cells(l: Action[]): Cell[] {
    let s = run!.now;
    const out: Cell[] = [s.player];
    const add = (c: Cell): void => {
      const last = out[out.length - 1]!;
      if (last.r !== c.r || last.c !== c.c) out.push(c);
    };
    for (const a of l) {
      const r = step(s, a);
      for (const e of r.events) if ((e.kind === 'moved' || e.kind === 'slid') && e.who === 'player') add(e.to);
      add(r.state.player);
      s = r.state;
    }
    return out;
  }

  function animMs(): number {
    if (!anim) return 0;
    if (anim.paused) return anim.paused.ms;
    const ms = deps.clock.now() - anim.started;
    const stop = anim.stops[reached];
    if (stop && ms >= stop.ms) {
      reached++;
      anim.paused = stop;
      deps.changed();
      return stop.ms;
    }
    return ms;
  }

  function resume(): void {
    if (!anim?.paused) return;
    anim.started = deps.clock.now() - anim.paused.ms;
    anim.paused = null;
    deps.changed();
  }

  /** The turn's animation is paused at a page, or has one still to reach: a play-out waits for it. */
  const pageAhead = (): boolean => !!anim && (anim.paused !== null || reached < anim.stops.length);

  return {
    get trial() { return trial; },
    get opens() { return opens; },
    get run() { return run; },
    get thread() { return thread; },
    get playing() { return tick !== null; },
    get anim() { return anim; },
    get found() { return found; },
    animMs,
    resume,
    open(i) {
      stop();
      trial = i;
      run = startRun(deps.levels.level(i));
      found = [];
      threadOn = false;
      thread = null;
      anim = null;
      opens++;
      deps.changed();
    },
    press(a) {
      if (!run) return;
      finishAnim();
      stop();
      if (a === 'undo' || a === 'restart') {
        run = a === 'undo' ? undo(run) : restart(run);
        found = [];
        redraw();
        deps.changed();
        return;
      }
      play(a);
    },
    hint() {
      if (!live()) return;
      finishAnim();
      stop();
      if (nextOfLine()) deps.sfx('hint');
    },
    route() {
      if (!live()) return;
      finishAnim();
      stop();
      if (threadOn) {
        threadOn = false;
        thread = null;
        deps.changed();
        return;
      }
      const l = line();
      if (l) {
        helped();
        deps.sfx('hint');
        threadOn = true;
        thread = cells(l);
      }
      deps.changed();
    },
    auto() {
      if (tick !== null) {
        stop();
        return;
      }
      if (!live()) return;
      finishAnim();
      tick = deps.timers.setInterval(() => {
        if (pageAhead()) return;
        if (!live() || !nextOfLine() || !live()) stop();
      }, SLIDE_MS * 3);
      deps.changed();
    },
    stop,
    finishAnim,
  };
}
