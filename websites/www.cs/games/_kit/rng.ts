// websites/www.cs/games/_kit/rng.ts
// A seeded generator: a string hash and mulberry32. Do not change a constant
// or an operation: every sequence a seed produces would change.
// Tankity's hashSeed and mulberry32 are a separate TS/PHP parity twin
// (tankity/src/sim.ts, server/sim.php) and do not come from here.
// _kit/test/rng-compare.test.ts shows the test helper's generator and this one
// agree bit for bit.
import type { Rng } from './ports.ts';
export type { Rng };

export function hashSeed(str: string): number {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}

export function mulberry32(a: number): Rng {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
