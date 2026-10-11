/* Cylon Defense: the scanner eye.
 *
 * The eye sweeps the scanner bar; while a run is live and the cursor moves it
 * keeps sweeping with the glare beam pointed at the cursor, and when the Raptor
 * blinds it the eye dances erratically until the disorientation (a due-at moment
 * in the Schedule) passes. This module owns the eye's position, its tracking
 * flag and the sweep, and paints the eye and the glare on every frame.
 *
 * It touches only the eye and glare elements it is handed; the live game's
 * record, the settings and the cursor come in as arguments. Browser-only: it
 * compiles in the DOM program. */
import type { Game, Mouse, Settings, StateApi } from './types.js';

export interface EyeDeps {
  /** The eye on the scanner bar. */
  eye: HTMLElement;
  /** The beam below it; the eye still works without one. */
  glare: HTMLElement | null;
  game: Game;
  settings: Settings;
  mouse: Mouse;
  state: StateApi;
  /** Actively fighting: the eye tracks only then. */
  isGameLive: () => boolean;
  /** How long the Raptor's strike leaves the eye blinded. */
  EYE_DISORIENT_MS: number;
}

export interface Eye {
  isEyeDisoriented(): boolean;
  /** Starts or stops tracking the cursor (stopping hands the eye back to its idle sweep). */
  setEyeTracking(on: boolean): void;
  /** The eye is blinded for `ms` (the Raptor's call). */
  disorientEye(ms?: number): void;
  /** Ends the blindness at once (a new run). */
  clearEyeDisorient(): void;
  /** The eye's centre in viewport px. */
  eyeClientCenter(): { x: number; y: number };
  /** One frame of the eye and glare; it schedules the next itself. */
  updateEye(): void;
}

export function createEye(d: EyeDeps): Eye {
  const { eye, glare, game, settings, mouse, state, isGameLive, EYE_DISORIENT_MS } = d;

  let eyeX = 50;
  let tracking = false;

  // One full left-right-left sweep while the eye tracks the cursor.
  const EYE_SWEEP_S = 5.2;
  let sweepPhase = 0;
  let sweepLast = 0;

  function readEyePercent() {
    const parent = eye.parentElement;
    if (!parent) return 50;
    const er = eye.getBoundingClientRect();
    const pr = parent.getBoundingClientRect();
    if (pr.width < 1) return 50;
    return ((er.left + er.width / 2 - pr.left) / pr.width) * 100;
  }

  function isEyeDisoriented() {
    return state.pending(game.schedule.eyeDisorientedUntil, Date.now());
  }

  function setEyeTracking(on: boolean): void {
    // Idle sweep only when the game is off (or eye tracking disabled / disoriented)
    if (!isGameLive() || !settings.eyeEnabled || isEyeDisoriented()) on = false;
    if (on && !tracking) {
      // Pick the tracking sweep up where the idle sweep left the eye.
      eyeX = readEyePercent();
      sweepPhase = Math.asin(Math.max(-1, Math.min(1, (eyeX - 50) / 45)));
      sweepLast = performance.now();
    }
    tracking = on;
    eye.classList.toggle('is-tracking', on && !isEyeDisoriented());
    if (glare) glare.classList.toggle('is-active', on && !isEyeDisoriented());
    if (!on && !isEyeDisoriented()) {
      eye.style.left = '';
      if (glare) {
        glare.style.opacity = '';
        glare.style.height = '';
        glare.style.top = '';
        glare.style.transform = '';
      }
    }
  }

  function disorientEye(ms = EYE_DISORIENT_MS) {
    game.schedule.eyeDisorientedUntil = Date.now() + ms;
    tracking = false;
    eye.classList.remove('is-tracking');
    eye.classList.add('is-disoriented');
    eyeX = readEyePercent();
    if (glare) {
      glare.classList.add('is-active');
      glare.classList.add('is-disoriented');
    }
  }

  function clearEyeDisorientIfDue() {
    if (eye.classList.contains('is-disoriented') && !isEyeDisoriented()) {
      eye.classList.remove('is-disoriented');
      if (glare) glare.classList.remove('is-disoriented');
      if (!tracking) {
        eye.style.left = '';
        if (glare) glare.classList.remove('is-active');
      }
    }
  }

  function updateEye() {
    clearEyeDisorientIfDue();

    if (isEyeDisoriented()) {
      // Erratic sweep — still moving, but not tracking the player
      const t = performance.now() / 1000;
      const dance = 50
        + Math.sin(t * 6.8) * 30
        + Math.sin(t * 15.4) * 14
        + Math.sin(t * 2.7) * 10
        + Math.sin(t * 31) * 4;
      const target = Math.min(95, Math.max(5, dance));
      eyeX += (target - eyeX) * 0.22;
      eye.style.left = `${eyeX}%`;
      if (glare) {
        glare.classList.add('is-active');
        glare.style.left = `${(eyeX / 100) * window.innerWidth}px`;
        const flicker = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(t * 22));
        glare.style.height = `${Math.min(window.innerHeight * 0.28, 11 * 16) * flicker}px`;
        glare.style.opacity = String(0.35 + 0.55 * flicker);
      }
    } else if (tracking && settings.eyeEnabled) {
      // The eye keeps sweeping while it watches you; the glare is a beam
      // from the eye down to the cursor, re-aimed every frame.
      const now = performance.now();
      sweepPhase += Math.min(0.05, (now - sweepLast) / 1000) * (Math.PI * 2 / EYE_SWEEP_S);
      sweepLast = now;
      eyeX = 50 + 45 * Math.sin(sweepPhase);
      eye.style.left = `${eyeX}%`;
      if (glare) {
        const from = eyeClientCenter();
        const top = from.y + eye.getBoundingClientRect().height * 0.2;
        const dx = mouse.clientX - from.x;
        const dy = Math.max(1, mouse.clientY - top);
        glare.style.opacity = '';
        glare.style.left = `${from.x}px`;
        glare.style.top = `${top}px`;
        // A glare, not a laser: it points at the cursor but fades out
        // short of it. It carries at most 85% of the way (140 px plus a
        // quarter of the distance), and dims overall as you get farther.
        const dist = Math.hypot(dx, dy);
        const reach = Math.min(dist * 0.85, 140 + dist * 0.25);
        glare.style.height = `${dist}px`;
        glare.style.setProperty('--glare-reach', `${(reach / Math.max(1, dist)) * 100}%`);
        glare.style.opacity = String(Math.max(0.3, Math.min(1, 1 - dist / (Math.hypot(window.innerWidth, window.innerHeight) * 1.2))));
        glare.style.transform = `translateX(-50%) rotate(${-Math.atan2(dx, dy)}rad)`;
      }
    }
    requestAnimationFrame(updateEye);
  }

  function clearEyeDisorient() {
    game.schedule.eyeDisorientedUntil = 0;
    if (eye) eye.classList.remove('is-disoriented');
    if (glare) {
      glare.classList.remove('is-disoriented');
      if (!tracking) glare.classList.remove('is-active');
    }
  }

  function eyeClientCenter() {
    const er = eye.getBoundingClientRect();
    return {
      x: er.left + er.width / 2,
      y: er.top + er.height / 2
    };
  }

  return { isEyeDisoriented, setEyeTracking, disorientEye, clearEyeDisorient, eyeClientCenter, updateEye };
}
