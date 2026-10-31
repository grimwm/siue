/* The Island of Crete: the fewest moves each campaign level can be won in, by level id: the length of the solver's
 * shortest winning line (src/puzzle/solver.ts). The levels never change in play, so the numbers are kept here
 * rather than searched for on the page; test/fewest.test.ts solves every level and checks each one. */
export const FEWEST: Readonly<Record<string, number>> = {
  'trial-1': 10, 'trial-2': 23, 'trial-3': 36, 'trial-4': 28, 'trial-5': 23,
  'trial-6': 24, 'trial-7': 23, 'trial-8': 29, 'trial-9': 54, 'trial-10': 76,
  'ch2-1': 12, 'ch2-2': 17, 'ch2-3': 25, 'ch2-4': 52, 'ch2-5': 52,
  'ch2-6': 62, 'ch2-7': 64, 'ch2-8': 58, 'ch2-9': 61, 'ch2-10': 82,
};

/** How a count of moves stands against the fewest possible: "best possible 12 (2 over)", or "best possible 12 ·
 *  perfect" at the fewest. */
export function againstFewest(moves: number, fewest: number): string {
  return moves <= fewest ? `best possible ${fewest} · perfect` : `best possible ${fewest} (${moves - fewest} over)`;
}
