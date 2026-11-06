/* The Island of Crete: a level saved for the shared bank instead of posted (`make crete-levels SAVE_ONLY=<dir>`), one
 * JSON file each, read back by tools/upload-bank.ts. The file holds exactly what `trusted-add` sends, the tuple and the
 * level, beside the grade, score and generator version to read at a glance. Its name is `<grade>-<hash>.json`, the
 * hash the level text's SHA-256 (16 hex digits), so files sort by grade and two levels never share a name. */
import { createHash } from 'node:crypto';
import type { SharedMade, Tuple } from '../src/endless/provenance.ts';
import { tupleShape } from '../src/endless/verifier.ts';
import type { Grade } from '../src/puzzle/rating.ts';

export interface LevelFile { v: number; grade: Grade; score: number; tuple: Tuple; made: SharedMade }

/** The file a level is saved as: its name and its text. */
export function levelFile(tuple: Tuple, made: SharedMade): { name: string; text: string } {
  const hash = createHash('sha256').update(made.text).digest('hex').slice(0, 16);
  const body: LevelFile = { v: tuple.v, grade: tuple.grade, score: made.score, tuple, made };
  return { name: `${tuple.grade}-${hash}.json`, text: `${JSON.stringify(body, null, 2)}\n` };
}

const MADE_KEYS = ['text', 'line', 'shortest', 'score', 'explored', 'chapter', 'hides'] as const;

/** A saved level read back, or why it cannot be: the tuple must have the bank's shape, the level its fields with the
 *  types and ranges the bank takes (so a broken file never spends one of the runner's posts), and the grade and
 *  version must match the tuple's. The server checks the rest. */
export function readLevelFile(raw: string): LevelFile | string {
  let v: unknown;
  try { v = JSON.parse(raw); } catch { return 'not JSON'; }
  if (typeof v !== 'object' || v === null) return 'not a level file';
  const f = v as Record<string, unknown>;
  const tuple = tupleShape(f.tuple);
  if (!tuple) return 'its tuple is not one the bank takes';
  const made = f.made as Record<string, unknown> | null;
  if (typeof made !== 'object' || made === null || MADE_KEYS.some(k => !(k in made)) || typeof made.text !== 'string') return 'its level is missing fields';
  const int = (x: unknown, a: number, b: number) => Number.isInteger(x) && (x as number) >= a && (x as number) <= b;
  const bad = [
    !(typeof made.line === 'string' && /^[a-z]{1,2000}$/.test(made.line)) && 'line',
    !int(made.shortest, 1, 2000) && 'shortest', !int(made.score, 0, 10000) && 'score',
    !int(made.explored, 0, 10_000_000) && 'explored', !int(made.chapter, 1, 10) && 'chapter',
    typeof made.hides !== 'boolean' && 'hides',
  ].filter(Boolean);
  if (bad.length) return `its level's ${bad.join(', ')} is not one the bank takes`;
  if (f.grade !== tuple.grade || f.v !== tuple.v) return 'its grade or version does not match its tuple';
  return { v: tuple.v, grade: tuple.grade, score: made.score as number, tuple, made: made as unknown as SharedMade };
}
