/* Cylon Defense: the grenade and the raptor strike.
 *
 * The two abilities are a small state machine each. The grenade is armed by a
 * press and thrown by the next click, or disarmed by a second press; the raptor
 * is called, strikes a beat later and lands a beat after that. Both are held
 * off by a cooldown: the moment each is next usable lives in the game's
 * Schedule (src/state.ts: grenadeReadyAt, raptorReadyAt), so a pause moves it
 * with every other due-at. This module keeps the arming flag, the raptor's
 * "inbound" flag and its timers, and decides what a press or a click does. It
 * touches no element: the cooldown fields come through `readyAt`/`setReadyAt`,
 * and the visible effects (the blast, the holes, the landscape, the knock-outs,
 * the eye, the raptor's sprite, the buttons) come in as callbacks. DOM-free, so
 * abilities-test.js runs it on a fake clock with fake timers. */

export const GRENADE_COOLDOWN_MS = 10000;
export const RAPTOR_COOLDOWN_MS = 60000;
/** From the call to the strike band's blast. */
export const RAPTOR_STRIKE_AT_MS = 700;
/** From the call to the raptor leaving, when it can be called again. */
export const RAPTOR_LANDS_AT_MS = 1900;

export type Ability = 'grenade' | 'raptor';

/** Milliseconds from `now` until `readyAt`, never negative. */
export function cooldownRemaining(readyAt: number, now: number): number {
  return Math.max(0, readyAt - now);
}

/** The whole seconds a cooldown badge shows (10…1, 60…1), or 0 when it is not cooling. */
export function cooldownSeconds(readyAt: number, now: number): number {
  const remaining = cooldownRemaining(readyAt, now);
  return remaining > 0 ? Math.max(1, Math.ceil(remaining / 1000)) : 0;
}

export interface AbilitiesDeps {
  now: () => number;
  setTimer: (fn: () => void, ms: number) => unknown;
  clearTimer: (handle: unknown) => void;
  /** Actively fighting: abilities do nothing in the intro or on the game-over panel. */
  isLive: () => boolean;
  /** When an ability is next usable (the Schedule's field); 0 when it is now. */
  readyAt: (which: Ability) => number;
  setReadyAt: (which: Ability, at: number) => void;
  /** Open the audio context, then play the named effect. */
  sfx: (name: 'grenadeArm' | 'grenade' | 'raptor') => void;
  /** Something the buttons show changed: arming, a cooldown, the raptor's flight. */
  changed: () => void;
  /** The grenade lands at a page position: blast, holes, letters, knock-outs. */
  grenadeBlast: (pageX: number, pageY: number) => void;
  /** False when the page has no raptor to fly; the call is then refused. */
  raptorAvailable: () => boolean;
  /** The raptor is called: disorient the eye and send the sprite in. */
  raptorLaunch: () => void;
  /** The raptor's strike band hits: landscape, impacts, bots wiped. */
  raptorStrike: () => void;
  /** The raptor leaves, or its strike is cleared: sprite and impacts away. */
  raptorClear: () => void;
}

export interface Abilities {
  /** True between arming the grenade and throwing or cancelling it. */
  grenadeArmed(): boolean;
  /** True from the raptor's call until it lands. */
  raptorInbound(): boolean;
  /** A press on Grenade: arms it, or disarms it when armed. Returns whether it armed. */
  readyGrenade(): boolean;
  /** Disarms the grenade, if armed. */
  cancelGrenadeArm(): void;
  /** The click that throws an armed grenade. Returns whether it was thrown. */
  throwGrenadeAt(pageX: number, pageY: number): boolean;
  /** A press on Raptor. Returns whether the strike was called. */
  callRaptor(): boolean;
  /** Cancels the raptor's pending strike and landing and clears its effects. */
  clearRaptor(): void;
  /** A new run: no cooldowns, nothing armed, no raptor in the air. */
  reset(): void;
}

export function createAbilities(d: AbilitiesDeps): Abilities {
  let armed = false;
  let inbound = false;
  let timers: unknown[] = [];

  function clearRaptor(): void {
    timers.forEach((t) => d.clearTimer(t));
    timers = [];
    inbound = false;
    d.raptorClear();
  }

  function cancelGrenadeArm(): void {
    if (!armed) return;
    armed = false;
    d.changed();
  }

  return {
    grenadeArmed: () => armed,
    raptorInbound: () => inbound,
    cancelGrenadeArm,
    clearRaptor,

    readyGrenade() {
      if (!d.isLive()) return false;
      if (d.now() < d.readyAt('grenade')) return false;
      if (armed) {
        cancelGrenadeArm();
        return false;
      }
      armed = true;
      d.sfx('grenadeArm');
      d.changed();
      return true;
    },

    throwGrenadeAt(pageX, pageY) {
      if (!d.isLive()) return false;
      if (!armed) return false;
      if (d.now() < d.readyAt('grenade')) {
        cancelGrenadeArm();
        return false;
      }
      armed = false;
      d.setReadyAt('grenade', d.now() + GRENADE_COOLDOWN_MS);
      d.changed();
      d.sfx('grenade');
      d.grenadeBlast(pageX, pageY);
      return true;
    },

    callRaptor() {
      if (!d.isLive() || inbound) return false;
      if (d.now() < d.readyAt('raptor')) return false;
      if (!d.raptorAvailable()) return false;

      clearRaptor();
      inbound = true;
      d.setReadyAt('raptor', d.now() + RAPTOR_COOLDOWN_MS);
      d.changed();
      d.sfx('raptor');
      d.raptorLaunch();

      timers.push(d.setTimer(() => {
        if (!inbound || !d.isLive()) return;
        d.raptorStrike();
      }, RAPTOR_STRIKE_AT_MS));

      timers.push(d.setTimer(() => {
        d.raptorClear();
        inbound = false;
        timers = [];
        d.changed();
      }, RAPTOR_LANDS_AT_MS));

      return true;
    },

    reset() {
      d.setReadyAt('grenade', 0);
      d.setReadyAt('raptor', 0);
      armed = false;
      clearRaptor();
    },
  };
}
