/* Cylon Defense: the types the browser-side modules share.
 *
 * main.ts owns a few pieces of mutable state that more than one module reads
 * or writes (the run's record, the schedule, whether the game is paused), and
 * a few plain records (the cursor, the settings). They are handed to each
 * module as these types; the modules take them as arguments. Apart from the settings
 * constants and guard, this file is types only. */
import type * as playfieldModule from './playfield.ts';
import type * as rulesModule from './rules.ts';
import type { RunState, Schedule } from './state.ts';
import type * as stateModule from './state.ts';

/** The modules the factories call into, as the objects main.ts imported them. */
export type StateApi = typeof stateModule;
export type RulesApi = typeof rulesModule;
export type PlayfieldApi = typeof playfieldModule;

export type Timer = ReturnType<typeof setTimeout>;

/**
 * The state the modules share. main.ts replaces `run` and `schedule` with what
 * each state transition returns, so it lives in one record the modules read
 * through; none of them keeps a copy.
 */
export interface Game {
  /** The run's score and hull (state.ts). */
  run: RunState;
  /** The moments the game is waiting for (state.ts); the timer handles stay with whoever armed them. */
  schedule: Schedule;
  /** The help overlay holds the run. */
  paused: boolean;
  /** When the pause began, for the skew it puts on every due moment. */
  pauseStartedAt: number;
  /** A mid-run nuke is in the air. */
  nukeInFlight: boolean;
  /** The finger steering the reticle on a touch screen, if any. */
  reticlePointerId: number | null;
  draggingReticle: boolean;
  /**
   * Puts the eye's tracking to sleep once the cursor rests. Null until the first
   * move; clearTimeout accepts that at run time, though the DOM typing does not,
   * so the call sites assert it.
   */
  idleTimer: Timer | null;
}

/** The player's settings, as saved in localStorage. Volumes run 0 to 100. */
export interface Settings {
  gameEnabled: boolean;
  soundEnabled: boolean;
  musicEnabled: boolean;
  soundVolume: number;
  musicVolume: number;
  eyeEnabled: boolean;
  /** The settings panel writes by data-setting name. */
  [key: string]: boolean | number;
}

export const SETTINGS_KEY = 'cylon-settings';

export const DEFAULT_SETTINGS: Settings = {
  gameEnabled: false,
  soundEnabled: true,
  musicEnabled: true,
  // UI midpoints; gain curves map 50% to the intended default loudness
  soundVolume: 50,
  musicVolume: 50,
  eyeEnabled: true,
};

/**
 * Accepts any stored object, so a partial or older one still loads; the caller
 * spreads it over DEFAULT_SETTINGS and clamps the volumes.
 */
export function isSettings(v: unknown): v is Partial<Settings> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/** The cursor, in viewport and in page coordinates. */
export interface Mouse {
  clientX: number;
  clientY: number;
  pageX: number;
  pageY: number;
  /** performance.now() at the last move. */
  t: number;
}

/** Where the cursor was aimed last, which the missiles lock on. */
export interface AimPoint {
  clientX: number;
  clientY: number;
  t: number;
}

/** A drone: a button that carries its two timers. */
export interface Bot extends HTMLButtonElement {
  _shootInterval?: ReturnType<typeof setInterval> | null;
  _patrolInterval?: ReturnType<typeof setInterval> | null;
}

/** A missile in the air. */
export interface Missile {
  el: HTMLElement;
  tracker: boolean;
  alive: boolean;
  /** Where along the top it left, so the next launch can keep clear. */
  originX: number;
}
