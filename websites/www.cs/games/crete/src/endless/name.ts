/* The Island of Crete: what an Endless level is called. Its name is drawn from the run's seed and the level's depth,
 * a hall of the Labyrinth like the campaign's ("The Sunken Court"), so the same run's levels always carry the same
 * names. Endless's words on the cards are here too. DOM-free. */
import { hash } from './random.ts';

const ADJECTIVES = [
  'Bronze', 'Silent', 'Winding', 'Narrow', 'Sunken', 'Broken', 'Painted', 'Hidden', 'Cold', 'Echoing', 'Dusty',
  'Golden', 'Crooked', 'Lower', 'Upper', 'Long', 'Twin', 'Burnt', 'Flooded', 'Forgotten', 'Hollow', 'Red', 'Salt',
  'Lamplit', 'Dark', 'Cedar', 'Horned', 'Marble', 'Quiet', 'Iron',
] as const;
const PLACES = [
  'Hall', 'Court', 'Passage', 'Stair', 'Gallery', 'Vault', 'Cistern', 'Chamber', 'Cloister', 'Corridor', 'Crossing',
  'Landing', 'Threshold', 'Ward', 'Stalls', 'Shrine', 'Yard', 'Undercroft', 'Rooms', 'Turning', 'Store', 'Halls',
] as const;

/** The name of the run `seed`'s level at `depth`. */
export function endlessName(seed: string, depth: number): string {
  const h = hash('endless-name', seed, depth);
  return `The ${ADJECTIVES[h % ADJECTIVES.length]} ${PLACES[Math.floor(h / ADJECTIVES.length) % PLACES.length]}`;
}

/** The kicker on a run's cards: "Endless · Level 3". */
export const endlessKicker = (depth: number): string => `Endless · Level ${depth}`;

/** The pieces a tier offers, in words: "Chapter 1's pieces", "the pieces of Chapters 1 to 4", "every piece". */
export function tierWords(tier: number): string {
  if (tier <= 1) return "Chapter 1's pieces";
  if (tier >= 9) return 'every piece';
  return `the pieces of Chapters 1 to ${tier}`;
}

/** Which levels are made ahead and ready: the saved run's next ones, or a new run's first ones. */
export function readyWords(p: { run: { depth: number } | null; ready: number }): string | null {
  if (p.run) {
    if (p.ready < 1) return null;
    const from = p.run.depth + 1;
    return p.ready === 1 ? `Level ${from} is ready.` : `Levels ${from} to ${from + p.ready - 1} are ready.`;
  }
  return p.ready >= 2 ? `Levels 1 to ${p.ready} of a new run are ready.` : null;
}
