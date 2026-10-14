/* Operation Tankity: how the deck's Weapon button sums up a gun: its damage
 * (or none), and a blast size (S, M, L) from its radius, or what it does
 * instead of a blast (a beam; a tracer's path; earth moved). DOM-free. */
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

type Labelled = Pick<Weapon, 'dmg' | 'radius'> & Partial<Pick<Weapon, 'effect' | 'warheads' | 'subDmg'>>;
const EARTH = ['dirt', 'pour', 'dig', 'riot', 'slump'];
/** What a gun does, when that is not a blast of some size: a beam, a
 *  tracer's path, or earth moved (a dirt gun that bursts as it lands is
 *  sized as a blast). Null for a blast (and a plasma ring, sized as one). */
function kindWord(w: Labelled): 'beam' | 'path' | 'earth' | null {
  if (w.effect === 'beam') return 'beam';
  if (w.effect === 'tracer') return 'path';
  return EARTH.includes(w.effect || '') && !(w.dmg > 0) ? 'earth' : null;
}
/** The damage the line names: a burrow's warheads' when it has them. */
function lineDmg(w: Labelled): number {
  return w.effect === 'dig' && (w.warheads || 0) > 0 ? w.subDmg || 0 : w.dmg;
}

/** "34 dmg · M"; "45 dmg · beam"; "no damage · path"; "no damage · earth". */
export function weaponLine(w: Labelled): string {
  const d = lineDmg(w);
  return `${d > 0 ? `${d} dmg` : 'no damage'} · ${kindWord(w) ?? blastSize(w.radius)}`;
}

/** "34 damage, medium blast": what a screen reader hears for the line. */
export function weaponLineSpoken(w: Labelled): string {
  const kind = kindWord(w), d = lineDmg(w);
  const what = kind === 'beam' ? 'beam' : kind === 'path' ? 'shows its path' : kind === 'earth' ? 'moves earth' : `${BLAST_WORDS[blastSize(w.radius)]} blast`;
  return `${d > 0 ? `${d} damage` : 'no damage'}, ${what}`;
}
