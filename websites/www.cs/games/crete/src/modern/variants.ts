/* The Island of Crete, modern look: the look's switchable choices, one place to flip them. `VARIANT` is what ships.
 * A sample render may override any of them for one browser through the `crete-variant` key (JSON), which the
 * modern board reads when it starts (board3d.ts). DOM-free.
 *
 * - `items`: how the things Theseus can take, and the hazards, stand out. `cyan`: a bright cyan crystal with a dark
 *   rim over each, the hazards' violet; the objects about 0.8 of a cell on a dark disc. `white`: the same with a
 *   white crystal in a heavier dark halo. `plate`: no crystal over objects or hazards (Theseus and the Minotaur keep
 *   theirs); each object stands larger and brighter on a bright ring, as a Classic sprite stands out on its tile.
 * - `beacon`: a soft green column of light over Theseus, drawn over the walls, and his outline through a wall that
 *   hides him.
 * - `cutaway`: the walls between the camera and Theseus or any piece are ghosted.
 * - `caps`: the wall tops in pale stone and the joints between the floor's squares dark, so the plan reads from
 *   any angle.
 */

export interface Variant {
  items: 'cyan' | 'white' | 'plate';
  beacon: boolean;
  cutaway: boolean;
  caps: boolean;
}

export const VARIANT: Variant = {
  items: 'plate',
  beacon: false,
  cutaway: false,
  caps: false,
};

export const VARIANT_KEY = 'crete-variant';

/** `VARIANT` with any choices the JSON `raw` overrides; unknown or malformed parts are ignored. */
export function withOverrides(raw: string | null): Variant {
  const v: Variant = { ...VARIANT };
  if (!raw) return v;
  let o: unknown;
  try { o = JSON.parse(raw); } catch { return v; }
  if (!o || typeof o !== 'object') return v;
  const r = o as Record<string, unknown>;
  if (r.items === 'cyan' || r.items === 'white' || r.items === 'plate') v.items = r.items;
  for (const k of ['beacon', 'cutaway', 'caps'] as const) if (typeof r[k] === 'boolean') v[k] = r[k];
  return v;
}

let current: Variant = VARIANT;
/** The choices in force: `VARIANT`, or what `useOverrides` last set. */
export function variant(): Variant {
  return current;
}
/** Puts this browser's sample override (the JSON stored under VARIANT_KEY, or null) in force. */
export function useOverrides(raw: string | null): void {
  current = withOverrides(raw);
}
