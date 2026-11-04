/* The Island of Crete, modern look: how the Aegean Portal wakes once the last relic is taken, by `t`, ms since it
 * began (src/openings.ts `wake`). Gold runes trace along the top of the arch from both capitals to the crown; the
 * keystone flares; the sheet of light rises and the pool fills while the runes settle to a faint gold; then motes of
 * light rise from the pool and fade. Going dark again is a plain fade (`portal` in src/openings.ts). Reduced motion
 * never wakes it: it is simply lit, its runes at their faint gold. DOM-free. */

/** How long the whole waking takes, ms. */
export const WAKE_MS = 2100;
/** How long the runes take to trace from the capitals to the crown, ms. */
export const RUNES_MS = 700;
/** When the keystone's flare starts, and how long it lasts, ms. */
export const FLARE_AT = 590, FLARE_MS = 420;
/** When the sheet of light starts to rise and the pool to fill, and how long they take, ms. */
export const LIGHT_AT = 770, LIGHT_MS = 630;
/** When the runes start to settle, and how long they take, ms. */
export const SETTLE_AT = 980, SETTLE_MS = 420;
/** How bright the runes stay once the portal is lit. */
export const RUNE_REST = 0.45 * 0.35;
/** How many motes rise from the pool, and how long each one lives, ms. */
export const MOTE_COUNT = 12, MOTE_MS = 600;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const ease = (v: number) => { const x = clamp01(v); return x * x * (3 - 2 * x); };
/** 0 at both ends, 1 half way. */
const bell = (v: number) => (v <= 0 || v >= 1 ? 0 : Math.sin(Math.PI * v));

/** How far the sheet of light has risen and the pool has filled, 0 dark to 1 lit. */
export const lightAt = (t: number): number => ease((t - LIGHT_AT) / LIGHT_MS);

/** How bright the keystone's flare is, 0 none to 1 full. */
export const flareAt = (t: number): number => bell((t - FLARE_AT) / FLARE_MS);

/** How bright the rune `u` of the way from its capital to the crown (0 to 1) is: dark until the trace reaches it, it
 *  burns bright, eases back, and settles to RUNE_REST once the light is in. */
export function runeAt(t: number, u: number): number {
  const since = t / RUNES_MS - u;
  const on = clamp01(since * 8);
  const fresh = on * (1 - clamp01(since * 2));
  return on * (0.45 + 0.55 * fresh) * (1 - 0.65 * ease((t - SETTLE_AT) / SETTLE_MS));
}

/** A mote: where it rises from, beside the pool's middle, when it starts, ms, and how high it rises, in cells. */
export interface Mote { x: number; z: number; t0: number; rise: number }

/** The motes, the same every time: they start as the pool fills and every one has gone by WAKE_MS. */
export const MOTES: readonly Mote[] = Array.from({ length: MOTE_COUNT }, (_, i) => {
  const r = (n: number) => { const x = Math.sin(i * 12.9898 + n * 78.233) * 43758.5453; return x - Math.floor(x); };
  return {
    x: -0.05 - r(2) * 0.25, z: (r(1) - 0.5) * 0.6,
    t0: LIGHT_AT + 230 + (i / (MOTE_COUNT - 1)) * (WAKE_MS - MOTE_MS - LIGHT_AT - 230), rise: 0.8 + r(4) * 0.6,
  };
});

/** How bright mote `m` is and how far up it has risen, 0 to 1 of its rise. */
export function moteAt(t: number, m: Mote): { o: number; up: number } {
  const life = (t - m.t0) / MOTE_MS;
  return { o: bell(life), up: clamp01(life) };
}
