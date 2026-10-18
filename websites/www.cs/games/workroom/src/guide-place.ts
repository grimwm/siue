// Where the guide's card goes: on the side of the lit part with more room, as
// tall as that room allows (the card scrolls), so it never covers the part. A
// part taller than the screen cannot be cleared; the card then covers its far
// end and leaves its top left corner in view. DOM-free.
export interface PlaceBox { left: number; top: number; width: number; height: number }
/** 'above' hangs the card from the top of the screen, 'below' stands it on the bottom; 'over' also stands it on the bottom, covering part of the spot. */
export interface CardPlacement { side: 'above' | 'below' | 'over'; maxHeight: number }

/** The card's distance from the screen edge. */
export const EDGE = 16;
const GAP = 8;
/** The least height worth showing a card at. */
const MIN_HEIGHT = 120;
/** A card never takes more than this share of the screen. */
const MAX_SHARE = 0.5;

export function cardPlacement(spot: PlaceBox, viewWidth: number, viewHeight: number): CardPlacement {
  void viewWidth;
  const room = (free: number): number => Math.floor(Math.min(free - EDGE - GAP, viewHeight * MAX_SHARE));
  const above = room(spot.top);
  const below = room(viewHeight - (spot.top + spot.height));
  const best = Math.max(above, below);
  if (best >= MIN_HEIGHT) return below >= above ? { side: 'below', maxHeight: below } : { side: 'above', maxHeight: above };
  // Over the spot: the card takes the lower share of the screen, so the spot's top stays visible while it starts in the upper part.
  return { side: 'over', maxHeight: Math.floor(viewHeight * MAX_SHARE) - EDGE };
}
