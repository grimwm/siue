/* The Island of Crete: the controller. It holds the try in progress, plays the
 * player's presses and Ariadne's thread (a hint, the whole line, a play-out)
 * through the engine, voices each turn's events, records a win, and keeps the
 * turn that is animating. The page draws from it and holds no rules. DOM-free. */
import type { Clock, Timers } from '../../_kit/ports.ts';
import { SLIDE_MS, timeline } from './board-plan.ts';
import type { Figures, Timeline } from './board-plan.ts';
import type { Progress } from './progress.ts';
import { act, assist, restart, startRun, undo } from './puzzle/run.ts';
import type { Run } from './puzzle/run.ts';
import { solve } from './puzzle/solver.ts';
import type { State } from './puzzle/state.ts';
import { step } from './puzzle/step.ts';
import type { Action, GameEvent } from './puzzle/step.ts';
import type { Cell } from './puzzle/tiles.ts';
import { TRIALS, trialLevel } from './puzzle/trials.ts';

export type SfxName =
  | 'step' | 'push' | 'splash' | 'sizzle' | 'door' | 'key' | 'relic' | 'gate' | 'button' | 'slide'
  | 'caught' | 'stone' | 'win' | 'lose' | 'bump' | 'pickup' | 'page' | 'hint';

export type Tone = 'info' | 'good' | 'bad';

/** The most states the thread's search may visit in the browser. */
export const THREAD_CAP = 200_000;
export const SLACK = 'The thread goes slack: undo or restart.';

export interface GameDeps {
  sfx(name: SfxName): void;
  say(text: string, tone?: Tone): void;
  progress: Progress;
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
  /** The state the turn began from: it is drawn until the figures arrive. */
  before: State;
}

export interface Game {
  /** 0-based; -1 before one opens. */
  readonly trial: number;
  /** How many times a trial has been opened: the page shows its start card for each. */
  readonly opens: number;
  readonly run: Run | null;
  /** V: the line's cells while shown. */
  readonly thread: readonly Cell[] | null;
  /** T is playing the line out. */
  readonly playing: boolean;
  readonly anim: Anim | null;
  /** Starts trial `i` fresh (clears assisted). */
  open(i: number): void;
  press(a: Action | 'undo' | 'restart'): void;
  hint(): void;
  route(): void;
  auto(): void;
  /** Ends the play-out, if one is running. */
  stop(): void;
  finishAnim(): void;
}

/** What the board draws `ms` after the animation began: the state before the turn and the figures between
 *  cells while it plays (items vanish and doors open when the figure arrives), the state after it and the
 *  figures at rest once it ends. */
export function frameOf(g: Pick<Game, 'run' | 'anim'>, ms: number): { state: State; figures: Figures; done: boolean } | null {
  if (!g.run) return null;
  const a = g.anim;
  if (a && ms < a.timeline.duration) return { state: a.before, figures: a.timeline.at(ms), done: false };
  return { state: g.run.now, figures: { player: g.run.now.player, minotaur: g.run.now.minotaur }, done: true };
}

export function createGame(deps: GameDeps): Game {
  let trial = -1;
  let opens = 0;
  let run: Run | null = null;
  let thread: readonly Cell[] | null = null;
  let anim: Anim | null = null;
  let tick: number | null = null;
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
    anim = tl.duration > 0 ? { timeline: tl, started: deps.clock.now(), before } : null;
    if (run.now.outcome === 'won') deps.progress.record(TRIALS[trial]!.id, run.now.moves, run.assisted);
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

  return {
    get trial() { return trial; },
    get opens() { return opens; },
    get run() { return run; },
    get thread() { return thread; },
    get playing() { return tick !== null; },
    get anim() { return anim; },
    open(i) {
      stop();
      trial = i;
      run = startRun(trialLevel(i));
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
        if (!live() || !nextOfLine() || !live()) stop();
      }, SLIDE_MS * 3);
      deps.changed();
    },
    stop,
    finishAnim,
  };
}
