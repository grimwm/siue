/* The Island of Crete: the music. The title card plays the title theme; the
 * story cards (the story, a chapter's card, the Lore book and a page taken in
 * play) play its story cut, the same music with the organ held back; a level
 * and the editor play none. Each track streams from media elements ("decks",
 * src/music-decks.ts), two a track. The render's tail is folded onto its
 * start, so the file runs on from its end into its start; the browser's own
 * media loop would leave a gap there, so as the first deck reaches its end the
 * second starts the file again, under a crossfade just long enough to hide a
 * decoder's gap, and the two take turns. Changing track starts the new one at
 * the same point of the music, crossfading. DOM-free: the decks and timers are
 * ports. */
import type { Timers } from "../../_kit/ports.ts";
import type { LayerName } from "./layers.ts";

export type Track = "title" | "story";
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
}

export interface MusicPorts {
  /** A new deck for `track`, loading its file, paused at its start. */
  deck(track: Track): Deck;
  timers: Timers;
}

export interface Music {
  /** The track the screen calls for, or null for none: a change crossfades, and none fades out. */
  want(track: Track | null): void;
  /** Whether music may play (Sound on and Music on). Off stops it at once; on starts the wanted track again. */
  setEnabled(on: boolean): void;
  /** A gesture: starts a track the browser blocked, and readies the deck its loop point will need. */
  kick(): void;
  /** The page hid: stops at once, remembering where. */
  hold(): void;
  /** The page showed again: goes on from there. */
  release(): void;
}

/** Seconds a track takes to come in from silence. */
export const FADE_IN_S = 2;
/** Seconds the music takes to fade when a level opens. */
export const FADE_OUT_S = 1.5;
/** Seconds one track takes to cross into the other. */
export const SWITCH_S = 2.5;
/** Seconds of the equal-power crossfade at the loop point: the second deck starts this long before the first ends,
 *  enough to hide a decoder's gap and too short to blur the music. */
export const LOOP_XF_S = 0.03;
/** How often the loop asks again for a length the browser does not know yet. */
const POLL_MS = 250;
/** A deck is paused this long after its fade should have ended. */
const PAUSE_PAD_MS = 100;
/** The loop point is taken once the live deck is this close to it; further off, the timer waits again. */
const SEAM_SLACK_S = 0.005;

const STORY_CARDS: readonly LayerName[] = ["story", "chapter", "lore"];
/** Cards that open over another and leave its music playing. */
const PASSING: readonly LayerName[] = ["menu", "levels"];

/** The track for the cards open, `stack` from the bottom up: the topmost card that is not the menu or the level list
 *  decides. A story card plays the story cut, the title card the theme, and anything else (a level, its cards, the
 *  editor) none. */
export function trackFor(stack: readonly LayerName[]): Track | null {
  for (let i = stack.length - 1; i >= 0; i--) {
    const card = stack[i]!;
    if (PASSING.includes(card)) continue;
    if (STORY_CARDS.includes(card)) return "story";
    return card === "title" ? "title" : null;
  }
  return null;
}

interface Player {
  track: Track;
  /** Both decks, made when the track first starts. */
  decks: [Deck, Deck];
  /** The deck the track plays on now. */
  live: 0 | 1;
  /** Whether the track is meant to sound (it is the current one). */
  on: boolean;
  /** The browser refused the live deck's play; a gesture tries again. */
  blocked: boolean;
  /** Each deck has played once (silently, readied for the loop point) or for real. */
  ready: [boolean, boolean];
  /** Counts plays of each deck, so a refusal of a play since superseded is ignored. */
  plays: [number, number];
  loop: number;
  /** The pause at the end of a fade-out. */
  stop: number;
}

const isAbort = (err: unknown): boolean => (err as { name?: unknown } | null)?.name === "AbortError";

export function createMusic(ports: MusicPorts): Music {
  const { timers } = ports;
  const players = new Map<Track, Player>();
  let wanted: Track | null = null;
  let enabled = true;
  let held = false;
  let current: Track | null = null;
  /** Where the track was when the page hid. */
  let heldAt: { track: Track; at: number } | null = null;

  function player(track: Track): Player {
    let p = players.get(track);
    if (!p) {
      p = {
        track, decks: [ports.deck(track), ports.deck(track)], live: 0, on: false, blocked: false,
        ready: [false, false], plays: [0, 0], loop: 0, stop: 0,
      };
      players.set(track, p);
    }
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
   *  timer: done when the track starts (often in the gesture that started it) and again on each gesture until it
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

  /** Waits for the live deck's loop point, asking its position again when the timer fires (playback can stall). */
  function schedule(p: Player): void {
    clearTimer(p.loop);
    const d = p.decks[p.live];
    const dur = d.duration();
    if (!Number.isFinite(dur) || dur <= 0) {
      p.loop = timers.setTimeout(() => schedule(p), POLL_MS);
      return;
    }
    const left = dur - d.position() - LOOP_XF_S;
    if (left > SEAM_SLACK_S) {
      p.loop = timers.setTimeout(() => schedule(p), left * 1000);
      return;
    }
    p.loop = 0;
    seam(p);
  }

  /** The loop point: the idle deck starts the file again as the live one ends. Should the browser refuse it, the
   *  live deck plays the file again itself (with the media loop's gap) and the next loop point tries again. */
  function seam(p: Player): void {
    const was = p.live;
    const old = p.decks[was];
    const now = other(was);
    const next = p.decks[now];
    p.live = now;
    next.seek(0);
    next.fade(0, 0);
    playDeck(p, now, () => {
      if (p.live !== now) return;
      next.pause();
      p.live = was;
      old.seek(0);
      old.fade(1, 0);
      playDeck(p, was, () => { if (p.live === was) p.blocked = true; });
      schedule(p);
    });
    next.fade(1, LOOP_XF_S, "equal-power");
    old.fade(0, LOOP_XF_S, "equal-power");
    timers.setTimeout(() => {
      if (p.live !== was) old.pause();
    }, LOOP_XF_S * 1000 + PAUSE_PAD_MS);
    schedule(p);
  }

  function start(track: Track, at: number, fadeIn: number): void {
    const p = player(track);
    p.on = true;
    if (p.stop) {
      // Still fading out: it comes back up from where it is.
      clearTimer(p.stop);
      p.stop = 0;
      p.decks[p.live].fade(1, fadeIn);
    } else {
      p.decks[p.live].seek(at);
      play(p, fadeIn);
    }
    ready(p);
    schedule(p);
  }

  function stop(p: Player, fadeOut: number): void {
    p.on = false;
    p.blocked = false;
    clearTimer(p.loop);
    p.loop = 0;
    clearTimer(p.stop);
    p.stop = 0;
    const pauseAll = (): void => {
      p.stop = 0;
      for (const d of p.decks) d.pause();
    };
    if (fadeOut <= 0) {
      pauseAll();
      return;
    }
    p.decks[p.live].fade(0, fadeOut);
    p.stop = timers.setTimeout(pauseAll, fadeOut * 1000 + PAUSE_PAD_MS);
  }

  /** Brings what sounds in line with what is wanted; `quick` stops without a fade (Music off, a hidden page). */
  function apply(quick: boolean): void {
    const target = enabled && !held ? wanted : null;
    if (target === current) return;
    const from = current ? player(current) : null;
    current = target;
    if (target) {
      let at = 0;
      let fadeIn = FADE_IN_S;
      if (from) {
        at = from.decks[from.live].position();
        fadeIn = SWITCH_S;
      } else if (heldAt?.track === target) at = heldAt.at;
      heldAt = null;
      start(target, at, fadeIn);
    }
    if (from) {
      if (held) heldAt = { track: from.track, at: from.decks[from.live].position() };
      stop(from, quick ? 0 : target ? SWITCH_S : FADE_OUT_S);
    }
  }

  return {
    want(track) {
      wanted = track;
      apply(false);
    },
    setEnabled(on) {
      enabled = on;
      apply(true);
    },
    kick() {
      const p = current ? player(current) : null;
      if (!p) return;
      if (p.blocked) {
        p.blocked = false;
        play(p, FADE_IN_S);
      }
      ready(p);
    },
    hold() {
      held = true;
      apply(true);
    },
    release() {
      held = false;
      apply(false);
    },
  };
}
