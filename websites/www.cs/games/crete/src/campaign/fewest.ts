/* The Island of Crete: the fewest moves each campaign level can be won in, by level id: the length of the solver's
 * shortest winning line (src/puzzle/solver.ts). The levels never change in play, so the numbers are kept here
 * rather than searched for on the page; test/fewest.test.ts solves every level and checks each one. */
export const FEWEST: Readonly<Record<string, number>> = {
  'trial-1': 10, 'trial-2': 23, 'trial-3': 36, 'trial-4': 28, 'trial-5': 23,
  'trial-6': 24, 'trial-7': 24, 'trial-8': 29, 'trial-9': 43, 'trial-10': 58,
  'ch2-1': 12, 'ch2-2': 17, 'ch2-3': 25, 'ch2-4': 53, 'ch2-5': 54,
  'ch2-6': 60, 'ch2-7': 66, 'ch2-8': 66, 'ch2-9': 52, 'ch2-10': 76,
  'ch3-1': 14, 'ch3-2': 17, 'ch3-3': 23, 'ch3-4': 41, 'ch3-5': 50,
  'ch3-6': 51, 'ch3-7': 33, 'ch3-8': 47, 'ch3-9': 55, 'ch3-10': 80,
  'ch4-1': 16, 'ch4-2': 12, 'ch4-3': 13, 'ch4-4': 53, 'ch4-5': 42,
  'ch4-6': 45, 'ch4-7': 57, 'ch4-8': 48, 'ch4-9': 57, 'ch4-10': 85,
  'ch5-1': 18, 'ch5-2': 18, 'ch5-3': 17, 'ch5-4': 56, 'ch5-5': 46,
  'ch5-6': 71, 'ch5-7': 43, 'ch5-8': 45, 'ch5-9': 64, 'ch5-10': 66,
  'ch6-1': 13, 'ch6-2': 14, 'ch6-3': 13, 'ch6-4': 34, 'ch6-5': 45,
  'ch6-6': 39, 'ch6-7': 36, 'ch6-8': 34, 'ch6-9': 59, 'ch6-10': 54,
  'ch7-1': 18, 'ch7-2': 8, 'ch7-3': 18, 'ch7-4': 33, 'ch7-5': 41,
  'ch7-6': 41, 'ch7-7': 35, 'ch7-8': 31, 'ch7-9': 45, 'ch7-10': 55,
  'ch8-1': 25, 'ch8-2': 17, 'ch8-3': 19, 'ch8-4': 38, 'ch8-5': 30,
  'ch8-6': 31, 'ch8-7': 36, 'ch8-8': 46, 'ch8-9': 42, 'ch8-10': 55,
  'ch9-1': 18, 'ch9-2': 16, 'ch9-3': 16, 'ch9-4': 42, 'ch9-5': 40,
  'ch9-6': 39, 'ch9-7': 39, 'ch9-8': 43, 'ch9-9': 63, 'ch9-10': 53,
  'ch10-1': 20, 'ch10-2': 16, 'ch10-3': 22, 'ch10-4': 50, 'ch10-5': 42,
  'ch10-6': 42, 'ch10-7': 54, 'ch10-8': 55, 'ch10-9': 42, 'ch10-10': 60,
};

/** How a count of moves stands against the fewest possible: "best possible 12 (2 over)", or "best possible 12 ·
 *  perfect" at the fewest. */
export function againstFewest(moves: number, fewest: number): string {
  return moves <= fewest ? `best possible ${fewest} · perfect` : `best possible ${fewest} (${moves - fewest} over)`;
}
