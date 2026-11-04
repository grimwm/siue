// What the composer's views share: the document and the page's state (open tracks, what is picked, the step for new
// notes, the loop range, the scale), and the actions that change them. The Composer builds one each render and hands
// it to the transport, the timeline and its rows, so each part reads what it needs without a long list of props.
import type { Entry } from '../../catalogue.ts';
import type { BeatClock } from '../../compose/beats.ts';
import type { Chord } from '../../compose/chords.ts';
import type { EditDoc, Part } from '../../compose/doc.ts';
import type { FxClipEffect } from '../../score.ts';

/** What is picked: notes of one part, a region, a section, an effect clip, or nothing. */
export type Pick =
  | { kind: 'none' }
  | { kind: 'notes'; part: string; ids: ReadonlySet<number> }
  | { kind: 'region'; part: string; id: number }
  | { kind: 'section'; id: string }
  | { kind: 'clip'; index: number };

/** The two-octave piano roll's rows. */
export const ROLL_ROWS = 24;

export interface Ctl {
  doc: EditDoc;
  entries: readonly Entry[];
  clock: BeatClock;
  /** The piece's bars, and the beats the timeline shows (one more bar than the piece, to write into). */
  bars: number;
  total: number;
  /** The end of the piece in beats. */
  end: number;
  /** Pixels per beat on the shared scale. */
  ppb: number;
  /** A finger, not a mouse: taps add on lift, drags wait for a hold. */
  coarse: boolean;
  open: ReadonlySet<string>;
  sel: string | null;
  pick: Pick;
  /** The step for new notes and Fix Timing, in beats, and the choices for it. */
  len: number;
  lengths: readonly (readonly [string, number])[];
  selectMode: boolean;
  chord: { chord: Chord; part: string } | null;
  splitting: boolean;
  typing: boolean;
  /** Where Type Notes, Paste and Split go; the playhead's start. */
  cursor: number;
  loop: { from: number; to: number } | null;
  loopOn: boolean;
  placing: FxClipEffect | null;
  /** An effect clip placed a moment ago, flashed so a tap on a phone shows where it landed. */
  flash: number | null;
  entryOf(part: Part): Entry | null;
  drums(part: Part): boolean;
  /** The lowest row of a part's two-octave window. */
  low(part: Part): number;
  setLow(part: string, low: number): void;
  apply(next: EditDoc, words?: string): void;
  say(words: string): void;
  setPick(p: Pick): void;
  setSel(part: string): void;
  toggleOpen(part: string, open?: boolean): void;
  setLen(beats: number): void;
  setSelectMode(on: boolean): void;
  setChord(c: { chord: Chord; part: string } | null): void;
  setSplitting(on: boolean): void;
  setTyping(on: boolean): void;
  setCursor(beat: number): void;
  setLoop(range: { from: number; to: number } | null): void;
  /** A note heard at once on the part's instrument, even on a muted track. */
  preview(part: Part, pitch: number, beats?: number): void;
  /** A short tune on an instrument, through the live sampler: bass an octave up and one note at a time, drums a beat. */
  hearInstrument(e: Entry): void;
  /** Plays from `beat` (the cursor) or, while playing, jumps there. */
  playFrom(beat: number): void;
  playing: boolean;
  /** Opens a popover by name beside `anchor`. */
  openPop(name: PopName, anchor: HTMLElement | null, arg?: string): void;
  /** The timeline's playhead is drawn here, outside Preact: the Arrange registers it. */
  head: { draw(beat: number, follow: boolean): void } | null;
  startPlacing(effect: FxClipEffect | null): void;
  /** Places the effect at a target the timeline worked out (drag, tap or keys). */
  placeAt(t: import('../../compose/placement.ts').Target): void;
  setRecordOpen(part: string | null): void;
  /** The track whose name is being typed in its header. */
  renaming: string | null;
  setRenaming(part: string | null): void;
  recordOpen: string | null;
  /** The palette of effects above the timeline. */
  paletteOpen: boolean;
  setPaletteOpen(open: boolean): void;
}

export type PopName = 'track' | 'chords' | 'section-add' | 'section-rename' | 'add' | 'more' | 'marker';

/** "bar 3" or "bar 3 beat 2" for a beat. */
export function barWords(clock: BeatClock, beat: number): string {
  const bar = clock.barOfBeat(beat + 1e-9);
  const into = Math.round((beat - clock.barStartBeat(bar)) * 100) / 100;
  return into < 0.01 ? `bar ${bar}` : `bar ${bar} beat ${Math.round((into + 1) * 100) / 100}`;
}
