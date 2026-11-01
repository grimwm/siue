/* The Island of Crete, modern look: the first-time hint that the 3D board can be turned and tilted, as pure logic.
 * A player new to the modern board who leaves the camera alone for HINT_DELAY_MS sees one small line by the compass
 * (and the compass gives one small wiggle); it goes on the first camera gesture, a tap on it, a layer covering the
 * board, or after HINT_SHOW_MS. It shows on at most HINT_MAX_SHOWS visits, and never again once the player has moved
 * the camera. DOM-free; controls.ts draws it and keeps its record in localStorage. */

/** Quiet time on the board, in ms, before the hint shows. */
export const HINT_DELAY_MS = 1500;
/** How long the hint stays, in ms, if nothing moves the camera. */
export const HINT_SHOW_MS = 8000;
/** The most visits the hint ever shows on. */
export const HINT_MAX_SHOWS = 2;
/** Where the hint's record is kept. */
export const HINT_KEY = 'crete-view-hint';

/** What the hint remembers between visits: how many visits it has shown on, and whether the camera ever moved. */
export interface HintRecord {
  shows: number;
  moved: boolean;
}

/** A stored record, or a fresh one when there is none or it cannot be read. */
export function readHint(raw: string | null): HintRecord {
  try {
    const v = raw ? (JSON.parse(raw) as Partial<HintRecord>) : {};
    const shows = Number.isInteger(v.shows) && (v.shows as number) > 0 ? (v.shows as number) : 0;
    return { shows, moved: v.moved === true };
  } catch {
    return { shows: 0, moved: false };
  }
}

/** The hint's line: for a finger, or for a mouse. */
export function hintText(touch: boolean): string {
  return touch
    ? 'Drag two fingers to tilt and twist · Tap the compass to reset'
    : 'Drag to turn and tilt · Right-drag to pan · Tap the compass to reset';
}

/** What changed, for the page to draw: show it, hide it, or nothing. Every change also means the record is saved. */
export type HintChange = 'show' | 'hide' | null;

export interface Hint {
  /** The record as it stands, to store. */
  record(): HintRecord;
  /** Time passing: `covered` while a layer is over the board or the board is out of sight. */
  tick(now: number, covered: boolean): HintChange;
  /** The player moved the camera. */
  moved(): HintChange;
  /** A tap on the hint itself. */
  dismiss(): HintChange;
  /** True once it has nothing more to do this visit: shown and gone, or not wanted at all. */
  over(): boolean;
}

/** The hint for one visit, starting at `now` with `rec` from earlier visits. */
export function createHint(rec: HintRecord, now: number): Hint {
  const r: HintRecord = { ...rec };
  let phase: 'waiting' | 'shown' | 'done' = r.moved || r.shows >= HINT_MAX_SHOWS ? 'done' : 'waiting';
  let quietSince = now;
  let shownAt = 0;
  const end = (): HintChange => {
    const was = phase;
    phase = 'done';
    return was === 'shown' ? 'hide' : null;
  };
  return {
    record: () => ({ ...r }),
    tick(t, covered) {
      if (phase === 'waiting') {
        if (covered) {
          quietSince = t;
          return null;
        }
        if (t - quietSince < HINT_DELAY_MS) return null;
        phase = 'shown';
        shownAt = t;
        r.shows++;
        return 'show';
      }
      if (phase === 'shown' && (covered || t - shownAt >= HINT_SHOW_MS)) return end();
      return null;
    },
    moved() {
      r.moved = true;
      return end();
    },
    dismiss() {
      return phase === 'shown' ? end() : null;
    },
    over: () => phase === 'done',
  };
}
