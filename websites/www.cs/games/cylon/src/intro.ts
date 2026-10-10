/* Cylon Defense: the opening strike.
 *
 * When a run starts, a nuke drops from above the viewport to the middle of the
 * screen, the page blows apart, "The CIC" appears at the center, and combat
 * begins; a beat later the title glides into the nav brand slot (or fades, on a
 * phone or with reduced motion). This module owns that sequence: the flight, the
 * timed steps, the title element's states and the token that cancels all of it.
 *
 * It touches only the elements it is handed and `window`; what the sequence
 * needs from the game (the settings, the pause, the sound, the detonation, the
 * start of combat) comes in as callbacks, so nothing here reaches cylon.js's
 * state. Browser-only: it compiles in the DOM program. */

export interface IntroDeps {
  /** The hero title; the sequence still runs without it. */
  titleEl: HTMLElement | null;
  /** The nuke that flies in; without it the strike lands at once. */
  nukeEl: HTMLElement | null;
  /** The nav brand the title settles into; without it the title fades. */
  brandEl: HTMLElement | null;
  body: HTMLElement;
  /** The title's text. */
  title: string;
  reduceMotion: boolean;
  /** How long the nav chrome takes to fade, which the title's hold waits out. */
  navFadeMs: number;
  /** The title's glide into the brand slot (the CSS transition's length). */
  settleMs: number;
  /** Flight speed in px per second, the distance that counts as arrived, and the longest flight. */
  speed: number;
  arriveRadius: number;
  maxFlightMs: number;
  /** A random source in [0, 1): the entry point is jittered. */
  random: () => number;
  /** False once the player switches the game off; the sequence stops. */
  enabled: () => boolean;
  /** True while the help overlay holds the run; the sequence waits. */
  paused: () => boolean;
  /** A new run is starting (the score token). */
  startRun: () => void;
  /** The nuke leaves: open the audio context and play the launch effect. */
  launched: () => void;
  /** Whether a nuke is in the air, which the mid-run launcher checks. */
  setNukeInFlight: (inFlight: boolean) => void;
  /** The nuke arrives at (x, y): the blast, with no damage and no shake. */
  detonate: (x: number, y: number) => void;
  /** The white flash has peaked: scatter the page and begin combat. */
  beginCombat: () => void;
}

export interface Intro {
  /** Starts the sequence, replacing any one still running. */
  play(): void;
  /** Stops it where it stands and clears the title and the nuke. */
  cancel(): void;
  /** True from play() until combat begins or it is cancelled. */
  playing(): boolean;
}

export function createIntro(d: IntroDeps): Intro {
  let gen = 0;
  let isPlaying = false;

  function resetTitle(): void {
    d.body.classList.remove('cylon-intro-hero');
    const el = d.titleEl;
    if (!el) return;
    el.hidden = true;
    el.setAttribute('aria-hidden', 'true');
    el.classList.remove('is-hero', 'is-settling', 'is-exit');
    el.style.cssText = '';
  }

  function pinTitleCenter(): { x: number; y: number } {
    const el = d.titleEl;
    if (!el) return { x: 0, y: 0 };
    const x = (window.innerWidth || 1) * 0.5;
    const y = (window.innerHeight || 1) * 0.48;
    // Pixel pin: % left/top jumps when the scrollbar or nav chrome reflows
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.right = 'auto';
    el.style.bottom = 'auto';
    el.style.transform = 'translate(-50%, -50%)';
    el.style.transformOrigin = 'center center';
    return { x, y };
  }

  function showTitle(): void {
    const el = d.titleEl;
    if (!el) return;
    el.textContent = d.title;
    el.hidden = false;
    el.setAttribute('aria-hidden', 'false');
    el.classList.remove('is-exit', 'is-settling', 'is-hero');
    el.style.cssText = '';
    pinTitleCenter();
    d.body.classList.add('cylon-intro-hero');
    // Opacity-only fade in; keep transform pinned so nothing pops
    void el.offsetWidth;
    el.classList.add('is-hero');
  }

  function isMobileChrome(): boolean {
    return window.matchMedia('(max-width: 819px)').matches;
  }

  /** After the hold: glide from viewport center into the nav brand (desktop) or fade (mobile). */
  function settleTitle(token: number): void {
    const el = d.titleEl;
    if (token !== gen || !el || el.hidden) return;
    const brand = d.brandEl;

    if (d.reduceMotion || isMobileChrome() || !brand) {
      el.classList.add('is-exit');
      const ms = d.reduceMotion ? 0 : 450;
      setTimeout(() => {
        if (token !== gen) return;
        resetTitle();
      }, ms);
      return;
    }

    // Re-pin after nav chrome / scatter may have shifted layout, then measure once
    const pinned = pinTitleCenter();
    void el.offsetWidth;
    const heroRect = el.getBoundingClientRect();
    const brandRect = brand.getBoundingClientRect();
    const heroCenterX = heroRect.left + heroRect.width / 2;
    const heroCenterY = heroRect.top + heroRect.height / 2;
    const targetX = brandRect.left + brandRect.width / 2;
    const targetY = brandRect.top + brandRect.height / 2;
    const dx = targetX - heroCenterX;
    const dy = targetY - heroCenterY;
    const scale = brandRect.width / Math.max(heroRect.width, 1);

    el.classList.remove('is-hero');
    el.classList.add('is-settling');
    el.style.left = `${pinned.x}px`;
    el.style.top = `${pinned.y}px`;
    el.style.transform = 'translate(-50%, -50%) scale(1)';

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (token !== gen) return;
        el.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(${scale})`;
        el.style.textShadow = 'none';
      });
    });

    let settled = false;
    const finishSettle = (e?: TransitionEvent): void => {
      if (e && e.propertyName && e.propertyName !== 'transform') return;
      if (settled || token !== gen) return;
      settled = true;
      el.removeEventListener('transitionend', finishSettle);
      resetTitle();
    };
    el.addEventListener('transitionend', finishSettle);
    setTimeout(() => finishSettle(), d.settleMs + 120);
  }

  function cancel(): void {
    gen += 1;
    isPlaying = false;
    d.setNukeInFlight(false);
    if (d.nukeEl) d.nukeEl.classList.remove('is-flying');
    resetTitle();
  }

  function play(): void {
    const token = ++gen;
    isPlaying = true;
    d.startRun();
    d.setNukeInFlight(false);
    resetTitle();

    const targetX = (window.innerWidth || 1) / 2;
    const targetY = (window.innerHeight || 1) * 0.48;

    // The intro's timed steps wait out a pause (How to Play) instead of
    // running underneath it.
    const afterPause = (fn: () => void): void => {
      const step = (): void => {
        if (token !== gen || !d.enabled()) return;
        if (d.paused()) {
          setTimeout(step, 100);
          return;
        }
        fn();
      };
      step();
    };

    const beginCombat = (): void => {
      isPlaying = false;
      d.beginCombat();
    };

    const finish = (x: number, y: number): void => {
      if (token !== gen || !d.enabled()) return;
      d.setNukeInFlight(false);
      if (d.nukeEl) d.nukeEl.classList.remove('is-flying');
      d.detonate(x, y);
      showTitle();
      // Start scatter after the white flash peaks so the drift is visible
      const scatterDelay = d.reduceMotion ? 0 : 520;
      setTimeout(() => afterPause(beginCombat), scatterDelay);
      // Hold at center through nav chrome fade, then ride into the brand slot
      const settleDelay = d.reduceMotion ? 0 : Math.max(900, scatterDelay + d.navFadeMs + 80);
      setTimeout(() => afterPause(() => settleTitle(token)), settleDelay);
    };

    const nuke = d.nukeEl;
    if (d.reduceMotion || !nuke) {
      finish(targetX, targetY);
      return;
    }

    d.setNukeInFlight(true);
    // Enter from above the viewport toward center
    let x = targetX + (d.random() - 0.5) * Math.min(120, (window.innerWidth || 400) * 0.15);
    let y = -72;
    let started = performance.now();
    let last = started;
    const speed = d.speed;

    nuke.style.left = `${x}px`;
    nuke.style.top = `${y}px`;
    nuke.classList.add('is-flying');
    d.launched();

    const tick = (now: number): void => {
      if (token !== gen) return;
      if (!d.enabled()) {
        cancel();
        return;
      }
      if (d.paused()) {
        started += now - last;
        last = now;
        requestAnimationFrame(tick);
        return;
      }

      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const dx = targetX - x;
      const dy = targetY - y;
      const dist = Math.hypot(dx, dy) || 1;
      const step = speed * dt;
      x += (dx / dist) * Math.min(step, dist);
      y += (dy / dist) * Math.min(step, dist);

      nuke.style.left = `${x}px`;
      nuke.style.top = `${y}px`;
      nuke.style.setProperty('--nuke-heading', `${Math.atan2(dy, dx) * (180 / Math.PI)}deg`);

      if (dist <= d.arriveRadius || now - started >= d.maxFlightMs) {
        finish(x, y);
        return;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  return { play, cancel, playing: () => isPlaying };
}
