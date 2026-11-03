/* The Island of Crete: Endless's seeded randomness. A run's seed is a short string; every draw the generator makes
 * comes from `rngOf(seed, …)`, so the same seed, piece tier and depth always draw the same levels, on any device.
 * The hash is cyrb53 folded to 32 bits, the generator sfc32 (both small, fast and well mixed). DOM-free. */

export interface Rng {
  /** A number in [0, 1). */
  next(): number;
  /** An integer in [0, n). */
  int(n: number): number;
  /** One of `items`. */
  pick<T>(items: readonly T[]): T;
  /** `items`, shuffled into a new array. */
  shuffle<T>(items: readonly T[]): T[];
}

/** A 53-bit hash of `text` (cyrb53), as two 32-bit halves. */
function cyrb(text: string, seed = 0): [number, number] {
  let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
  for (let i = 0; i < text.length; i++) {
    const ch = text.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return [h1 >>> 0, h2 >>> 0];
}

/** A 32-bit hash of the parts, joined: the same parts always give the same number. */
export function hash(...parts: readonly (string | number)[]): number {
  return cyrb(parts.join('\u0001'))[0];
}

/** A generator drawn from the parts: the same parts always draw the same numbers. */
export function rngOf(...parts: readonly (string | number)[]): Rng {
  const text = parts.join('\u0001');
  const [a0, b0] = cyrb(text);
  const [c0, d0] = cyrb(text, 0x9e3779b9);
  let a = a0, b = b0, c = c0, d = d0 | 1;
  const next = (): number => {
    // sfc32
    const t = (((a + b) | 0) + d) | 0;
    d = (d + 1) | 0;
    a = b ^ (b >>> 9);
    b = (c + (c << 3)) | 0;
    c = (c << 21) | (c >>> 11);
    c = (c + t) | 0;
    return (t >>> 0) / 4294967296;
  };
  for (let i = 0; i < 12; i++) next();
  const int = (n: number) => Math.floor(next() * n);
  return {
    next,
    int,
    pick: items => items[int(items.length)]!,
    shuffle(items) {
      const out = [...items];
      for (let i = out.length - 1; i > 0; i--) {
        const j = int(i + 1);
        [out[i], out[j]] = [out[j]!, out[i]!];
      }
      return out;
    },
  };
}

/** Seeds a person can read aloud and type: lower-case letters and digits, no look-alikes (0/o, 1/l/i). */
const SEED_CHARS = 'abcdefghjkmnpqrstuvwxyz23456789';
export const SEED_LENGTH = 6;
/** A seed as typed or linked: trimmed, lower-cased, at most 32 letters, digits and hyphens; null when nothing is left. */
export function cleanSeed(raw: string): string | null {
  const s = raw.trim().toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 32);
  return s === '' ? null : s;
}

/** A new random seed, drawn from `random` (Math.random in the page). */
export function newSeed(random: () => number): string {
  let s = '';
  for (let i = 0; i < SEED_LENGTH; i++) s += SEED_CHARS[Math.floor(random() * SEED_CHARS.length)]!;
  return s;
}
