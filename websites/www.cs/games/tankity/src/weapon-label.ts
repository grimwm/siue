/* Operation Tankity: how the deck's Weapon button sums up a gun: its damage,
 * and a blast size (S, M, L) from its radius. DOM-free. */
import type { Weapon } from './sim.ts';

/** Radii below smallBelow are S, from largeFrom up are L, M between. */
export const BLAST_CUTOFFS = Object.freeze({ smallBelow: 20, largeFrom: 40 });

export function blastSize(radius: number): 'S' | 'M' | 'L' {
  if (radius < BLAST_CUTOFFS.smallBelow) return 'S';
  if (radius >= BLAST_CUTOFFS.largeFrom) return 'L';
  return 'M';
}

/** "34 dmg · M". */
export function weaponLine(w: Pick<Weapon, 'dmg' | 'radius'>): string {
  return `${w.dmg} dmg · ${blastSize(w.radius)}`;
}
