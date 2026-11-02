/* The Island of Crete: the rule tips, a few short lines that teach a new player the rules while they play, each
 * shown once. Each tip comes from what the player just did or saw: the board coming into view with the Minotaur on
 * it, a turn landing (what the Minotaur did with it, a catch, how many moves so far), or a level with relics. They
 * build on one another, so a player meets them in order: how the Minotaur moves, what he just did and how walls hold
 * him, the relics and the gate, Wait and Undo, then the exit and the hearts. One tip stands at a time, in the banner's
 * place at the top of the board (src/ui/banner.tsx); it never stops play, Got It puts it away, the next tip replaces
 * it, and it goes by itself after TIP_TURNS turns. Which tips have shown is kept with the first cards
 * (src/met.ts noteCard), so the menu's Reset Tips shows them again. DOM-free. */
import type { Dir } from './puzzle/tiles.ts';
import type { Met } from './met.ts';

export type TipId = 'tip-beast' | 'tip-walls' | 'tip-relics' | 'tip-undo' | 'tip-exit';

/** The tips, in the order a player meets them. */
export const TIP_IDS: readonly TipId[] = ['tip-beast', 'tip-walls', 'tip-relics', 'tip-undo', 'tip-exit'];

/** How many turns a tip stands through before it goes by itself. */
export const TIP_TURNS = 4;
/** The move count at which Wait and Undo, then the exit, are told. */
export const UNDO_AT = 3;
export const EXIT_AT = 5;

/** What the player just saw or did. `view`: the board in view with play under way and no turn just played (a level
 *  begun, a card closed, an undo). `turn`: a turn just landed. */
export type TipEvent =
  | { kind: 'view'; beast: boolean; relics: boolean }
  | {
      kind: 'turn';
      /** The level has a Minotaur. */
      beast: boolean;
      /** Relics are still to take. */
      relics: boolean;
      /** The moves made so far. */
      moves: number;
      /** The ways the Minotaur stepped this turn, in order (a slide on ice or a current is no step). */
      steps: readonly Dir[];
      /** The turn ended in a catch. */
      caught: boolean;
    };

/** The tip this event shows, given which have shown, or null. */
export function nextTip(ev: TipEvent, seen: (id: TipId) => boolean): TipId | null {
  if (!ev.beast) return null;
  if (!seen('tip-beast')) return 'tip-beast';
  if (ev.kind === 'view') return ev.relics && !seen('tip-relics') ? 'tip-relics' : null;
  if (ev.caught && !seen('tip-undo')) return 'tip-undo';
  // Told on a turn he moved in, so it can say what he did (a turn he stands still may be Medusa's stone or a snare).
  if (!seen('tip-walls') && ev.steps.length > 0) return 'tip-walls';
  if (ev.relics && !seen('tip-relics')) return 'tip-relics';
  if (ev.moves >= UNDO_AT && !seen('tip-undo')) return 'tip-undo';
  if (ev.moves >= EXIT_AT && !seen('tip-exit')) return 'tip-exit';
  return null;
}

/** What the Minotaur did with the turn, in words: one step or two. */
function beastDid(steps: readonly Dir[]): string {
  if (steps.length === 1) return `He went ${steps[0]!}, then a wall stopped him.`;
  return `He went ${steps[0]!}, then ${steps[1]!}: two steps for your one.`;
}

/** A tip's words; the walls tip says what the Minotaur did in the turn that showed it. */
export function tipText(id: TipId, ev?: TipEvent): string {
  switch (id) {
    case 'tip-beast':
      return 'The Minotaur takes two steps for each of yours, always toward you: across if he can, else up or down.';
    case 'tip-walls':
      return `${ev?.kind === 'turn' && ev.steps.length > 0 ? `${beastDid(ev.steps)} ` : ''}He never steps away from you, so a wall in his way can trap him.`;
    case 'tip-relics':
      return 'Take every relic: the last one opens the Daedalus Gate on the way to the exit.';
    case 'tip-undo':
      return 'Wait lets him move while you stand still. Undo takes back a turn, as often as you like.';
    case 'tip-exit':
      return 'Reach the exit to clear the level. Each catch costs a heart; lose them all and the try is over.';
  }
}

export interface Tip {
  id: TipId;
  text: string;
}

export interface RuleTips {
  /** The tip standing now, if one is. */
  shown(): Tip | null;
  /** Tells the tips what just happened; true when the tip standing changed. */
  on(ev: TipEvent): boolean;
  /** Got It: the tip goes. */
  close(): void;
  /** A level opened: the tip from the last one goes. */
  clear(): void;
}

/** The tips for this browser, whose shown ones are kept in `met`. */
export function createRuleTips(met: Pick<Met, 'carded' | 'noteCard'>): RuleTips {
  let tip: Tip | null = null;
  let turns = 0;
  return {
    shown: () => tip,
    on(ev) {
      const id = nextTip(ev, x => met.carded(x));
      if (id) {
        met.noteCard(id);
        tip = { id, text: tipText(id, ev) };
        turns = 0;
        return true;
      }
      if (tip && ev.kind === 'turn' && ++turns >= TIP_TURNS) {
        tip = null;
        return true;
      }
      return false;
    },
    close() {
      tip = null;
    },
    clear() {
      tip = null;
    },
  };
}
