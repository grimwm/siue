/* The Island of Crete: what the page tells the player on meeting things. The first time Theseus picks up a kind of
 * item, or touches an active tile (src/dictionary.ts ACTIVE), a card (play waits for it); every later time, a banner
 * that fades on its own. Nothing else interrupts play: the Minotaur, the moving hazards and the passive tiles are
 * only read in the Dictionary, and a story page opens only its own story. Where first cards are off (a try from
 * the editor) nothing is a first and nothing is noted as met. DOM-free. */
import { metId } from './dictionary.ts';
import type { Met } from './met.ts';

/** How long a banner shows. */
export const BANNER_MS = 2500;

export interface MeetPlan {
  /** Entries met for the first time: a card each, in order. */
  cards: string[];
  /** Entries met before: one banner names them all. */
  banners: string[];
}

/** What a turn's meetings show. `shown` are entries whose first card already showed this turn (the animation stopped
 *  for them), so they get neither a card nor a banner. */
export function meetNotices(meets: readonly string[], met: Pick<Met, 'has'>, cards: boolean, shown: ReadonlySet<string> = new Set()): MeetPlan {
  const plan: MeetPlan = { cards: [], banners: [] };
  for (const id of meets) {
    if (shown.has(id) || plan.cards.includes(id) || plan.banners.includes(id)) continue;
    if (isFirst(id, met, cards)) plan.cards.push(id);
    else plan.banners.push(id);
  }
  return plan;
}

/** Whether meeting entry `id` now is a first, whose card stops the animation. */
export const isFirst = (id: string, met: Pick<Met, 'has'>, cards: boolean): boolean => cards && !met.has(metId(id));
