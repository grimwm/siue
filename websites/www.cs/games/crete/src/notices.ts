/* The Island of Crete: what the page tells the player on meeting things. The first time a kind of thing is picked
 * up, a card (play waits for it); every later time, a banner that fades on its own. The first time a hazard or a
 * special tile is in sight on the board, a card; after that, nothing. Where first cards are off (a try from the
 * editor) nothing is a first and nothing is noted as met. DOM-free. */
import { OBJECT_ENTRY, inSight } from './dictionary.ts';
import type { Met } from './met.ts';
import type { State } from './puzzle/state.ts';
import type { ObjectKind } from './puzzle/tiles.ts';

/** How long a banner shows. */
export const BANNER_MS = 2500;

export interface PickupPlan {
  /** Entries met for the first time: a card each, in the order taken. */
  cards: string[];
  /** Entries met before: one banner names them all. */
  banners: string[];
}

/** What a turn's pickups show. `shown` are entries whose first card already showed this turn (the animation stopped
 *  for them), so they get neither a card nor a banner. A story page has no banner: its own Lore card opens. */
export function pickupNotices(took: readonly ObjectKind[], met: Pick<Met, 'has'>, cards: boolean, shown: ReadonlySet<string> = new Set()): PickupPlan {
  const plan: PickupPlan = { cards: [], banners: [] };
  for (const what of took) {
    const id = OBJECT_ENTRY[what];
    if (shown.has(id) || plan.cards.includes(id) || plan.banners.includes(id)) continue;
    if (cards && !met.has(id)) plan.cards.push(id);
    else if (id !== 'page') plan.banners.push(id);
  }
  return plan;
}

/** Whether taking `what` is a first, whose card stops the animation. */
export const isFirstTake = (what: ObjectKind, met: Pick<Met, 'has'>, cards: boolean): boolean => cards && !met.has(OBJECT_ENTRY[what]);

/** The hazards and special tiles in sight that have not been met: a card each. */
export function meetings(s: State, met: Pick<Met, 'has'>, cards: boolean): string[] {
  return cards ? inSight(s).filter(id => !met.has(id)) : [];
}
