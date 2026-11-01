// Loudness lines: a part's dynamics from Very Soft to Very Loud, held Steady or moving (Get Louder, Get Softer) between
// marks, and how the renderer scales a note's own velocity by the line. The Python side (siue_music/score.py
// level_at, effective_velocity) gives the same numbers, checked by test/fixtures/schema2-vectors.json. DOM-free.
import type { DynMark } from '../score.ts';
import type { EditDoc } from './doc.ts';

/** The six loudness levels as the Loudness panel names them; Fairly Loud (mf, 80) leaves a note as it is. */
export const LEVEL_NAMES: readonly { level: number; label: string; mark: string }[] = [
  { level: 32, label: 'Very Soft', mark: 'pp' }, { level: 48, label: 'Soft', mark: 'p' }, { level: 64, label: 'Fairly Soft', mark: 'mp' },
  { level: 80, label: 'Fairly Loud', mark: 'mf' }, { level: 100, label: 'Loud', mark: 'f' }, { level: 120, label: 'Very Loud', mark: 'ff' },
];

/**
 * A lane's loudness level at `seconds`: a steady mark holds; Get Louder and Get Softer move linearly in seconds from
 * the mark's bar start to the next mark's. `barStart` is the seconds at which a bar starts.
 */
export function levelAt(marks: readonly DynMark[], seconds: number, barStart: (bar: number) => number): number {
  let i = 0;
  while (i + 1 < marks.length && barStart(marks[i + 1]!.bar) <= seconds + 1e-9) i++;
  const m = marks[i]!;
  const next = marks[i + 1];
  if (m.shape === 'steady' || !next) return m.level;
  const a = barStart(m.bar);
  const b = barStart(next.bar);
  return m.level + ((next.level - m.level) * (seconds - a)) / (b - a);
}

/** A note's velocity scaled by its lane's level (80 leaves it as it is), held to 1..127. */
export const effectiveVelocity = (velocity: number, level: number | null): number =>
  level === null ? velocity : Math.max(1, Math.min(127, Math.floor((velocity * level) / 80 + 0.5)));

/**
 * A loudness line that is valid as the schema says: in bar order from bar 1, one mark a bar, the last steady, and each
 * moving mark heading the way the next lies (a move to the same level holds).
 */
export function tidyDynamics(marks: readonly DynMark[]): DynMark[] {
  const sorted = [...marks].sort((a, b) => a.bar - b.bar).filter((m, i, all) => i === 0 || m.bar !== all[i - 1]!.bar);
  if (sorted[0] && sorted[0].bar !== 1) sorted[0] = { ...sorted[0], bar: 1 };
  return sorted.map((m, i) => {
    const next = sorted[i + 1];
    if (!next) return { ...m, shape: 'steady' };
    if (m.shape === 'steady') return { ...m };
    return { ...m, shape: next.level > m.level ? 'louder' : next.level < m.level ? 'softer' : 'steady' };
  });
}

/** A part's loudness line: `marks` tidied, or none (each note as played) for an empty list. */
export function setDynamics(doc: EditDoc, partId: string, marks: readonly DynMark[]): EditDoc {
  const line = marks.length ? tidyDynamics(marks) : null;
  return { ...doc, parts: doc.parts.map(p => (p.id === partId ? { ...p, dynamics: line } : p)) };
}
