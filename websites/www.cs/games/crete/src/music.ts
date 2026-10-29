/* The Island of Crete: the music. The title theme plays on every screen, the title card, the story, a level and the
 * editor alike, and never stops for one: only the Music and Sound switches, a hidden page and the browser's rule
 * that a gesture must come first start or stop it. It streams from media elements ("decks", src/music-decks.ts),
 * two. The render's tail is folded onto its start, so the file runs on from its end into its start; the browser's
 * own media loop would leave a gap there, so as the first deck reaches its end the second starts the file again
 * from 0, and the two take turns: every pass is the whole file, so the music's beat never slips. A file has
 * nothing past its end to overlap, so the join is a short equal-power dip (the first deck's last moments fade
 * out, the second's first fade in) that hides a decoder's gap. DOM-free: the decks and timers are ports. */
import type { Timers } from "../../_kit/ports.ts";

/** A fade's curve: linear, or equal-power (constant loudness across a crossfade). */
export type FadeShape = "linear" | "equal-power";

/** One media element through its own gain on the music bus. */
export interface Deck {
  /** Plays from where it is; rejects when the browser blocks it (no gesture yet), cannot load the file, or a pause
   *  cuts the play short (AbortError). */
  play(): Promise<void>;
  pause(): void;
  /** Seconds into the file. */
  position(): number;
  seek(seconds: number): void;
  /** The file's length in seconds; NaN until the browser knows it. */
  duration(): number;
  /** Ramps the deck's gain from where it is to `to` over `seconds` (linear unless `shape` says); 0 seconds sets it
   *  at once. */
  fade(to: number, seconds: number, shape?: FadeShape): void;
  /** Runs `listener` whenever the file plays to its end. Unlike a timer it is not throttled in a hidden page. */
  onEnded(listener: () => void): void;
}

export interface MusicPorts {
  /** A new deck, loading the title theme's file, paused at its start. */
  deck(): Deck;
  timers: Timers;
}

export interface Music {
  /** Whether music may play (Sound on and Music on). Off stops it at once; on starts it, from its beginning. */
  setEnabled(on: boolean): void;
  /** A gesture: starts the music if the browser blocked it, and readies the deck its loop point will need. */
  kick(): void;
  /** Whether a hidden page keeps the music going (the default); when not, `hold` stops it. */
  setBackground(on: boolean): void;
  /** The page hid: stops at once, remembering where, unless the music goes on in the background. */
  hold(): void;
  /** The page showed again: goes on from there. */
  release(): void;
}

/** Seconds the music takes to come in from silence. */
export const FADE_IN_S = 2;
/** Seconds of each half of the equal-power dip at the loop point: the first deck fades out over its last this long
 *  and the second fades in over its first, enough to hide a decoder's gap and too short to hear. */
export const LOOP_XF_S = 0.03;
/** How often the loop asks again for a length the browser does not know yet. */
const POLL_MS = 250;
/** The loop point is taken once the live deck is this close to it; further off, the timer waits again. */
const SEAM_SLACK_S = 0.005;

interface Player {
  /** Both decks, made when the music first starts. */
  decks: [Deck, Deck];
  /** The deck the music plays on now. */
  live: 0 | 1;
  /** Whether the music is meant to sound. */
  on: boolean;
  /** The browser refused the live deck's play; a gesture tries again. */
  blocked: boolean;
  /** Each deck has played once (silently, readied for the loop point) or for real. */
  ready: [boolean, boolean];
  /** Counts plays of each deck, so a refusal of a play since superseded is ignored. */
  plays: [number, number];
  loop: number;
  /** The live deck is fading out over its last moments, into the loop point. */
  ending: boolean;
}

const isAbort = (err: unknown): boolean => (err as { name?: unknown } | null)?.name === "AbortError";

export function createMusic(ports: MusicPorts): Music {
  const { timers } = ports;
  let player: Player | null = null;
  let enabled = false;
  let held = false;
  let background = true;
  /** Where the music was when the page hid. */
  let heldAt = 0;

  /** The player, its two decks made and loading on the first call. */
  function get(): Player {
    if (player) return player;
    const p: Player = {
      decks: [ports.deck(), ports.deck()], live: 0, on: false, blocked: false,
      ready: [false, false], plays: [0, 0], loop: 0, ending: false,
    };
    // A hidden page's timers run late (a second or more apart, far more after minutes); the live deck's end is the
    // loop point all the same, with at worst a gap the size of that lateness, and the music never stops.
    p.decks.forEach((d, i) => d.onEnded(() => {
      if (!p.on || p.live !== i) return;
      clearTimer(p.loop);
      p.loop = 0;
      seam(p);
    }));
    player = p;
    return p;
  }

  const other = (i: 0 | 1): 0 | 1 => (i === 0 ? 1 : 0);

  /** Plays deck `i`; `refused` runs when the browser says no to this play while it is still the latest. */
  function playDeck(p: Player, i: 0 | 1, refused: () => void): void {
    const n = ++p.plays[i];
    p.decks[i].play().then(
      () => { p.ready[i] = true; },
      err => {
        if (isAbort(err) || p.plays[i] !== n || !p.on) return;
        refused();
      },
    );
  }

  /** Starts the live deck from where it stands, fading in. */
  function play(p: Player, fadeIn: number): void {
    const i = p.live;
    const d = p.decks[i];
    d.fade(0, 0);
    playDeck(p, i, () => { if (p.live === i) p.blocked = true; });
    d.fade(1, fadeIn);
  }

  /** Plays the idle deck silently and pauses it again at its start, so the browser lets the loop point play it from a
   *  timer: done when the music starts (often in the gesture that started it) and again on each gesture until it
   *  takes. */
  function ready(p: Player): void {
    const i = other(p.live);
    if (p.ready[i]) return;
    const d = p.decks[i];
    const n = ++p.plays[i];
    d.fade(0, 0);
    d.play().then(() => {
      p.ready[i] = true;
      if (p.plays[i] === n && p.live !== i) {
        d.pause();
        d.seek(0);
      }
    }, () => {});
  }

  function clearTimer(id: number): void {
    if (id) timers.clearTimeout(id);
  }

  /** Waits for the live deck's end, asking its position again when a timer fires (playback can stall): its last
   *  LOOP_XF_S fade out, and at the end the loop point. */
  function schedule(p: Player): void {
    clearTimer(p.loop);
    const d = p.decks[p.live];
    const dur = d.duration();
    if (!Number.isFinite(dur) || dur <= 0) {
      p.loop = timers.setTimeout(() => schedule(p), POLL_MS);
      return;
    }
    const left = dur - d.position();
    if (!p.ending && left > LOOP_XF_S + SEAM_SLACK_S) {
      p.loop = timers.setTimeout(() => schedule(p), (left - LOOP_XF_S) * 1000);
      return;
    }
    if (!p.ending) {
      p.ending = true;
      d.fade(0, Math.max(0, left), "equal-power");
    }
    if (left > SEAM_SLACK_S) {
      p.loop = timers.setTimeout(() => schedule(p), left * 1000);
      return;
    }
    p.loop = 0;
    seam(p);
  }

  /** The loop point: the idle deck starts the file again from 0 as the live one ends. Should the browser refuse it, the
   *  live deck plays the file again itself (with the media loop's gap) and the next loop point tries again. */
  function seam(p: Player): void {
    const was = p.live;
    const old = p.decks[was];
    const now = other(was);
    const next = p.decks[now];
    p.live = now;
    p.ending = false;
    next.seek(0);
    next.fade(0, 0);
    playDeck(p, now, () => {
      if (p.live !== now) return;
      next.pause();
      p.live = was;
      old.seek(0);
      old.fade(1, LOOP_XF_S, "equal-power");
      playDeck(p, was, () => { if (p.live === was) p.blocked = true; });
      schedule(p);
    });
    next.fade(1, LOOP_XF_S, "equal-power");
    old.pause();
    schedule(p);
  }

  function start(at: number): void {
    const p = get();
    p.on = true;
    p.ending = false;
    p.decks[p.live].seek(at);
    play(p, FADE_IN_S);
    ready(p);
    schedule(p);
  }

  function stop(p: Player): void {
    p.on = false;
    p.blocked = false;
    clearTimer(p.loop);
    p.loop = 0;
    p.ending = false;
    for (const d of p.decks) d.pause();
  }

  /** Brings the sound in line with the switches and the page: music plays when enabled and shown. */
  function apply(): void {
    const target = enabled && !held;
    if (target === !!player?.on) return;
    if (target) {
      start(heldAt);
      heldAt = 0;
    } else if (player) {
      if (held) heldAt = player.decks[player.live].position();
      stop(player);
    }
  }

  return {
    setEnabled(on) {
      enabled = on;
      if (!on) heldAt = 0;
      apply();
    },
    kick() {
      const p = player?.on ? player : null;
      if (!p) return;
      if (p.blocked) {
        p.blocked = false;
        play(p, FADE_IN_S);
      }
      ready(p);
    },
    setBackground(on) {
      background = on;
    },
    hold() {
      if (background) return;
      held = true;
      apply();
    },
    release() {
      held = false;
      apply();
    },
  };
}
