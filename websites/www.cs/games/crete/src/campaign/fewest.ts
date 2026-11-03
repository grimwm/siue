/* The Island of Crete: the fewest moves each campaign level can be won in, by level id: the length of the solver's
 * shortest winning line (src/puzzle/solver.ts). The levels never change in play, so the numbers are kept here
 * rather than searched for on the page; test/fewest.test.ts solves every level and checks each one. */
export const FEWEST: Readonly<Record<string, number>> = {
  'trial-1': 10, 'trial-2': 23, 'trial-3': 36, 'trial-4': 28, 'trial-5': 23,
  'trial-6': 24, 'trial-7': 24, 'trial-8': 29, 'trial-9': 43, 'trial-10': 58,
  'ch2-1': 12, 'ch2-2': 17, 'ch2-3': 25, 'ch2-4': 53, 'ch2-5': 45,
  'ch2-6': 60, 'ch2-7': 66, 'ch2-8': 66, 'ch2-9': 54, 'ch2-10': 76,
  'ch3-1': 14, 'ch3-2': 17, 'ch3-3': 23, 'ch3-4': 49, 'ch3-5': 50,
  'ch3-6': 51, 'ch3-7': 37, 'ch3-8': 52, 'ch3-9': 55, 'ch3-10': 78,
  'ch4-1': 16, 'ch4-2': 12, 'ch4-3': 13, 'ch4-4': 53, 'ch4-5': 42,
  'ch4-6': 62, 'ch4-7': 55, 'ch4-8': 48, 'ch4-9': 58, 'ch4-10': 91,
  'ch5-1': 18, 'ch5-2': 18, 'ch5-3': 17, 'ch5-4': 56, 'ch5-5': 53,
  'ch5-6': 71, 'ch5-7': 44, 'ch5-8': 49, 'ch5-9': 64, 'ch5-10': 75,
  'ch6-1': 13, 'ch6-2': 14, 'ch6-3': 13, 'ch6-4': 43, 'ch6-5': 45,
  'ch6-6': 39, 'ch6-7': 30, 'ch6-8': 34, 'ch6-9': 59, 'ch6-10': 54,
  'ch7-1': 18, 'ch7-2': 8, 'ch7-3': 18, 'ch7-4': 35, 'ch7-5': 31,
  'ch7-6': 33, 'ch7-7': 45, 'ch7-8': 48, 'ch7-9': 56, 'ch7-10': 47,
  'ch8-1': 25, 'ch8-2': 17, 'ch8-3': 19, 'ch8-4': 38, 'ch8-5': 31,
  'ch8-6': 31, 'ch8-7': 36, 'ch8-8': 46, 'ch8-9': 37, 'ch8-10': 40,
};

/** How a count of moves stands against the fewest possible: "best possible 12 (2 over)", or "best possible 12 ·
 *  perfect" at the fewest. */
export function againstFewest(moves: number, fewest: number): string {
  return moves <= fewest ? `best possible ${fewest} · perfect` : `best possible ${fewest} (${moves - fewest} over)`;
}
