/* The Island of Crete: the campaign's level texts, without its words, for Endless's new-layout check in the worker.
 * test/endless.test.ts checks it holds every released level. DOM-free. */
import { TRIALS } from '../puzzle/trials.ts';
import { WAYS } from '../puzzle/ways.ts';
import { CLOSING } from '../puzzle/closing.ts';
import { FALSE_WALLS } from '../puzzle/false-walls.ts';
import { SNARES } from '../puzzle/snares.ts';
import { FOLDS } from '../puzzle/folds.ts';
import { ROUNDS } from '../puzzle/rounds.ts';
import { WINDS } from '../puzzle/winds.ts';
import { WORKSHOP } from '../puzzle/workshop.ts';
import { HEART } from '../puzzle/heart.ts';
import { parse } from '../puzzle/level.ts';
import type { Level } from '../puzzle/level.ts';

export const CAMPAIGN_TEXTS: readonly { id: string; text: string }[] = [
  ...TRIALS, ...WAYS, ...CLOSING, ...FALSE_WALLS, ...SNARES, ...FOLDS, ...ROUNDS, ...WINDS, ...WORKSHOP, ...HEART,
];

export function campaignLevels(): Level[] {
  return CAMPAIGN_TEXTS.map(t => parse(t.text));
}
