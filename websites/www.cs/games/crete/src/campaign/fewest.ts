/* The Island of Crete: the fewest moves each campaign level can be won in, by level id: the length of the solver's
 * shortest winning line (src/puzzle/solver.ts). The levels never change in play, so the numbers are kept here
 * rather than searched for on the page; test/fewest.test.ts solves every level and checks each one. */
export const FEWEST: Readonly<Record<string, number>> = {
  'trial-1': 10, 'trial-2': 23, 'trial-3': 36, 'trial-4': 28, 'trial-5': 23,
  'trial-6': 24, 'trial-7': 24, 'trial-8': 29, 'trial-9': 40, 'trial-10': 76,
  'ch2-1': 12, 'ch2-2': 17, 'ch2-3': 25, 'ch2-4': 51, 'ch2-5': 44,
  'ch2-6': 62, 'ch2-7': 66, 'ch2-8': 60, 'ch2-9': 54, 'ch2-10': 72,
  'ch3-1': 14, 'ch3-2': 15, 'ch3-3': 23, 'ch3-4': 46, 'ch3-5': 45,
  'ch3-6': 47, 'ch3-7': 37, 'ch3-8': 52, 'ch3-9': 51, 'ch3-10': 62,
  'ch4-1': 16, 'ch4-2': 12, 'ch4-3': 13, 'ch4-4': 53, 'ch4-5': 37,
  'ch4-6': 50, 'ch4-7': 44, 'ch4-8': 48, 'ch4-9': 58, 'ch4-10': 81,
  'ch5-1': 18, 'ch5-2': 18, 'ch5-3': 17, 'ch5-4': 56, 'ch5-5': 49,
  'ch5-6': 71, 'ch5-7': 46, 'ch5-8': 49, 'ch5-9': 66, 'ch5-10': 65,
};

/** How a count of moves stands against the fewest possible: "best possible 12 (2 over)", or "best possible 12 ·
 *  perfect" at the fewest. */
export function againstFewest(moves: number, fewest: number): string {
  return moves <= fewest ? `best possible ${fewest} · perfect` : `best possible ${fewest} (${moves - fewest} over)`;
}
