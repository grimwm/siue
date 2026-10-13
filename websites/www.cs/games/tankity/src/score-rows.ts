// The shape of the scores this browser keeps when the server store is out of
// reach (localStorage key tankity-local), and the guard that reads them back.

/** A finished run as it is filed. */
/* A row without a `difficulty` counts as Normal. */
export interface ScoreEntry { name: string; score: number; banked: number; won: boolean; seed: string; difficulty?: 'easy' | 'normal' | 'hard' }

export function isScoreRows(v: unknown): v is ScoreEntry[] {
  return Array.isArray(v) && v.every(r => r !== null && typeof r === 'object'
    && typeof r.name === 'string' && typeof r.score === 'number' && typeof r.banked === 'number'
    && typeof r.won === 'boolean' && typeof r.seed === 'string'
    && (r.difficulty === undefined || r.difficulty === 'easy' || r.difficulty === 'normal' || r.difficulty === 'hard'));
}
