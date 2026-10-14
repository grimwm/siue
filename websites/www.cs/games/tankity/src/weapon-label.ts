/* Operation Tankity: how the deck's Weapon button sums up a gun: its damage
 * (or none), and a blast size (S, M, L) from its radius, or what it does
 * instead of a blast (a beam; a tracer's path). DOM-free. */
import type { Weapon } from './sim.ts';

/** Radii below smallBelow are S, from largeFrom up are L, M between. */
export const BLAST_CUTOFFS = Object.freeze({ smallBelow: 20, largeFrom: 40 });

export function blastSize(radius: number): 'S' | 'M' | 'L' {
  if (radius < BLAST_CUTOFFS.smallBelow) return 'S';
  if (radius >= BLAST_CUTOFFS.largeFrom) return 'L';
  return 'M';
}

/** The same letters, spelled out for screen readers. */
export const BLAST_WORDS = Object.freeze({ S: 'small', M: 'medium', L: 'large' });

/** What a gun does, when that is not a blast of some size: a beam, or a
 *  tracer's path. Null for a blast (and a plasma ring, sized as one). */
function kindWord(w: Partial<Pick<Weapon, 'effect'>>): 'beam' | 'path' | null {
  return w.effect === 'beam' ? 'beam' : w.effect === 'tracer' ? 'path' : null;
}

/** "34 dmg · M"; "45 dmg · beam"; "no damage · path". */
export function weaponLine(w: Pick<Weapon, 'dmg' | 'radius'> & Partial<Pick<Weapon, 'effect'>>): string {
  return `${w.dmg > 0 ? `${w.dmg} dmg` : 'no damage'} · ${kindWord(w) ?? blastSize(w.radius)}`;
}

/** "34 damage, medium blast": what a screen reader hears for the line. */
export function weaponLineSpoken(w: Pick<Weapon, 'dmg' | 'radius'> & Partial<Pick<Weapon, 'effect'>>): string {
  const kind = kindWord(w);
  const what = kind === 'beam' ? 'beam' : kind === 'path' ? 'shows its path' : `${BLAST_WORDS[blastSize(w.radius)]} blast`;
  return `${w.dmg > 0 ? `${w.dmg} damage` : 'no damage'}, ${what}`;
}
