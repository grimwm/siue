/* Operation Tankity: the Difficulty setting, as the player picks and keeps it.
 *
 * One word per browser under `tankity-difficulty`; a missing or unknown word
 * reads as normal. The aim each word stands for is DIFFICULTY in ai.ts. */
import type { StorageLike } from '../../_kit/ports.ts';
import { oneOf, pref } from '../../_kit/prefs.ts';
import { DIFFICULTIES } from './ai.ts';
import type { Difficulty } from './ai.ts';

export const DIFFICULTY_NAMES: Readonly<Record<Difficulty, string>> = { easy: 'Easy', normal: 'Normal', hard: 'Hard' };

export function isDifficulty(v: unknown): v is Difficulty {
  return typeof v === 'string' && (DIFFICULTIES as readonly string[]).includes(v);
}

export interface DifficultySetting {
  get(): Difficulty;
  set(d: Difficulty): void;
}

export function difficultySetting(storage: StorageLike | null): DifficultySetting {
  const saved = pref<Difficulty>('tankity-difficulty', 'normal', oneOf(DIFFICULTIES, 'normal'), storage);
  return { get: saved.get, set: saved.set };
}
