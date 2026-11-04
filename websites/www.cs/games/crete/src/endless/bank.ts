/* The Island of Crete: Endless's banks, written by tools/endless-bank.ts; do not edit them by hand. Levels the
 * generator made ahead of time and the gate passed, one bank for each grade, for a run's first level and for any level
 * whose search runs out of its budget: none yet. DOM-free. */
import type { BankLevel } from './generate.ts';
import type { Grade } from '../puzzle/rating.ts';

export const BANKS: Readonly<Record<Grade, readonly BankLevel[]>> = {
  easy: [],
  medium: [],
  hard: [],
};
