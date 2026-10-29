/* The Island of Crete: the music. The title card plays the title theme; the
 * story cards (the story, a chapter's card, the Lore book and a page taken in
 * play) play its story cut, the same music with the organ held back; a level
 * and the editor play none. Each track streams from media elements ("decks",
 * src/music-decks.ts), two a track: the render's tail is folded onto its
 * start, and at the loop point the second deck starts the file again while the
 * first fades out under it, so the browser's gap at a media loop is never
 * heard. Changing track starts the new one at the same point of the music,
 * crossfading. DOM-free: the decks and timers are ports. */
import type { Timers } from "../../_kit/ports.ts";
import type { LayerName } from "./layers.ts";

export type Track = "title" | "story";

/** One media element through its own gain on the music bus. */
export interface Deck {
  /** Plays from where it is; rejects when the browser blocks it (no gesture yet) or cannot load the file. */
  play(): Promise<void>;
  pause(): void;
  /** Seconds into the file. */
  position(): number;
  seek(seconds: number): void;
  /** The file's length in seconds; NaN until the browser knows it. */
  duration(): number;
  /** Ramps the deck's gain from where it is to `to` over `seconds`; 0 seconds sets it at once. */
  fade(to: number, seconds: number): void;
}

export interface MusicPorts {
  /** A new deck for `track`, paused at its start. */
  deck(track: Track): Deck;
  timers: Timers;
}

export interface Music {
  /** The track the screen calls for, or null for none: a change crossfades, and none fades out. */
  want(track: Track | null): void;
  /** Whether music may play (Sound on and Music on). Off stops it at once; on starts the wanted track again. */
  setEnabled(on: boolean): void;
  /** A gesture: starts a track the browser blocked. */
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
/** Seconds the two decks of a track overlap at its loop point. */
export const LOOP_XF_S = 0.8;
/** How often the loop asks again for a length the browser does not know yet. */
const POLL_MS = 250;
/** A deck is paused this long after its fade should have ended. */
const PAUSE_PAD_MS = 100;

const STORY_CARDS: readonly LayerName[] = ["story", "chapter", "lore"];

/** The track for the cards open: a story card on top plays the story cut; the title card, or a card over it but the
 *  editor, plays the theme; anything else (a level, its cards, the editor) plays none. */
export function trackFor(layers: { top: LayerName | null; has(name: LayerName): boolean }): Track | null {
  if (layers.top !== null && STORY_CARDS.includes(layers.top)) return "story";
  if (layers.top === "editor") return null;
  return layers.has("title") ? "title" : null;
}

interface Player {
  track: Track;
  decks: Deck[];
  /** The deck the track plays on now. */
  live: number;
  /** Whether the track is meant to sound (it is the current one). */
  on: boolean;
  /** The browser refused its last play; a gesture tries again. */
  blocked: boolean;
  loop: number;
  /** The pause at the end of a fade-out. */
  stop: number;
}

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
      p = { track, decks: [], live: 0, on: false, blocked: false, loop: 0, stop: 0 };
      players.set(track, p);
    }
    return p;
  }

  function deck(p: Player, i: number): Deck {
    while (p.decks.length <= i) p.decks.push(ports.deck(p.track));
    return p.decks[i]!;
  }

  function play(p: Player, d: Deck, fadeIn: number): void {
    d.fade(0, 0);
    d.play().catch(() => {
      if (p.on && deck(p, p.live) === d) p.blocked = true;
    });
    d.fade(1, fadeIn);
  }

  function clearTimer(id: number): void {
    if (id) timers.clearTimeout(id);
  }

  /** Waits for the live deck's loop point, asking its position again when the timer fires (playback can stall). */
  function schedule(p: Player): void {
    clearTimer(p.loop);
    const d = deck(p, p.live);
    const dur = d.duration();
    if (!Number.isFinite(dur) || dur <= 0) {
      p.loop = timers.setTimeout(() => schedule(p), POLL_MS);
      return;
    }
    const left = dur - d.position() - LOOP_XF_S;
    if (left > 0.02) {
      p.loop = timers.setTimeout(() => schedule(p), left * 1000);
      return;
    }
    p.loop = 0;
    const old = d;
    p.live = 1 - p.live;
    const next = deck(p, p.live);
    next.seek(0);
    play(p, next, LOOP_XF_S);
    old.fade(0, LOOP_XF_S);
    timers.setTimeout(() => {
      if (deck(p, p.live) !== old) old.pause();
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
      deck(p, p.live).fade(1, fadeIn);
    } else {
      const d = deck(p, p.live);
      d.seek(at);
      play(p, d, fadeIn);
    }
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
    deck(p, p.live).fade(0, fadeOut);
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
        at = deck(from, from.live).position();
        fadeIn = SWITCH_S;
      } else if (heldAt?.track === target) at = heldAt.at;
      heldAt = null;
      start(target, at, fadeIn);
    }
    if (from) {
      if (held) heldAt = { track: from.track, at: deck(from, from.live).position() };
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
      if (!p || !p.blocked) return;
      p.blocked = false;
      play(p, deck(p, p.live), FADE_IN_S);
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
