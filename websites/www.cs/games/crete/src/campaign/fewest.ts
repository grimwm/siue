/* The Island of Crete: the fewest moves each campaign level can be won in, by level id: the length of the solver's
 * shortest winning line (src/puzzle/solver.ts). The levels never change in play, so the numbers are kept here
 * rather than searched for on the page; test/fewest.test.ts solves every level and checks each one. */
export const FEWEST: Readonly<Record<string, number>> = {
  'trial-1': 10, 'trial-2': 23, 'trial-3': 36, 'trial-4': 28, 'trial-5': 23,
  'trial-6': 24, 'trial-7': 23, 'trial-8': 29, 'trial-9': 54, 'trial-10': 76,
  'ch2-1': 12, 'ch2-2': 17, 'ch2-3': 25, 'ch2-4': 51, 'ch2-5': 42,
  'ch2-6': 62, 'ch2-7': 63, 'ch2-8': 48, 'ch2-9': 59, 'ch2-10': 76,
  'ch3-1': 14, 'ch3-2': 15, 'ch3-3': 23, 'ch3-4': 46, 'ch3-5': 42,
  'ch3-6': 44, 'ch3-7': 35, 'ch3-8': 46, 'ch3-9': 53, 'ch3-10': 64,
  'ch4-1': 17, 'ch4-2': 12, 'ch4-3': 14, 'ch4-4': 58, 'ch4-5': 55,
  'ch4-6': 45, 'ch4-7': 49, 'ch4-8': 56, 'ch4-9': 50, 'ch4-10': 83,
};

/** How a count of moves stands against the fewest possible: "best possible 12 (2 over)", or "best possible 12 ·
 *  perfect" at the fewest. */
export function againstFewest(moves: number, fewest: number): string {
  return moves <= fewest ? `best possible ${fewest} · perfect` : `best possible ${fewest} (${moves - fewest} over)`;
}
