/* The Island of Crete: the level from outside the campaign. It sits at index `at`, after the campaign's levels, until
 * the next one is put there, so Retry opens it again; it records no progress and finds no pages. A try from the
 * editor is one: Try it puts the editor away and opens the draft at its start card on the game screen, Back to
 * the editor settles the game (no play-out, animation or thread) and shows the editor on its draft, and a try won
 * without Ariadne's thread is the author's best for its level text. DOM-free. */
import type { Levels, OutsideLevel } from './campaign/chapters.ts';
import type { Level } from './puzzle/level.ts';
import type { Action } from './puzzle/step.ts';

export interface OutsideDeps {
  /** The game opens level `i`. */
  open(i: number): void;
  /** The game settles: its play-out, animation and thread stop. */
  settle(): void;
  /** Every card and layer closes. */
  closeLayers(): void;
  /** The editor shows, alone, on its draft. */
  showEditor(): void;
  /** A try of the level text `text` was won in `moves` without the thread. */
  bestWon(text: string, moves: number): void;
}

export interface Outside {
  /** The campaign's levels, then the outside one at `at`. */
  readonly levels: Levels;
  readonly at: number;
  /** Opens `level` as the outside level `about`, with `line` as its proven line when there is one; `text` is the
   *  level text a try's best is kept under. */
  play(level: Level, about: OutsideLevel, line?: readonly Action[] | null, text?: string | null): void;
  /** Opens the editor's draft as a try: `text` is its share text, and `line` the last Check's line when that check
   *  was of this text. */
  tryLevel(level: Level, text: string, line: readonly Action[] | null): void;
  backToEditor(): void;
}

export function createOutside(campaign: Levels, deps: OutsideDeps): Outside {
  const at = campaign.count;
  let held: { level: Level; about: OutsideLevel; line: readonly Action[] | null; text: string | null } | null = null;
  const levels: Levels = {
    count: campaign.count,
    id: i => (i === at ? 'outside' : campaign.id(i)),
    level(i) {
      if (i !== at) return campaign.level(i);
      if (!held) throw new RangeError('no outside level is held');
      return held.level;
    },
    scratch: i => i === at,
    outside: i => (i === at ? held?.about ?? null : null),
    line: i => (i === at ? held?.line ?? null : null),
    won(i, moves, assisted) {
      if (i === at && held?.about.kind === 'try' && held.text !== null && !assisted) deps.bestWon(held.text, moves);
    },
  };
  function play(level: Level, about: OutsideLevel, line: readonly Action[] | null = null, text: string | null = null): void {
    held = { level, about, line, text };
    deps.open(at);
  }
  return {
    levels,
    at,
    play,
    tryLevel(level, text, line) {
      deps.closeLayers();
      play(level, { kind: 'try', name: level.title || 'Your level', best: null }, line, text);
    },
    backToEditor() {
      deps.settle();
      deps.showEditor();
    },
  };
}
