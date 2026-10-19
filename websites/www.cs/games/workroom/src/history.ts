// The owner's notes as the page shows them: every note on the server, newest
// first, waiting or picked up, opened (its body already checked by
// note.ts isNoteBody inside open()) or with the plain reason it could not be.
// Also the counts per piece, the marks the Story view draws, and which of
// Claude's changes answer a note.
import type { ServerNote } from './api.ts';
import type { NoteMark } from './answer.ts';
import type { Change } from './score.ts';
import { NoteUnreadable } from './seal.ts';
import type { Opened } from './seal.ts';

export interface HistoryItem { id: string; arrived: number; pickedUp: number | null; state: 'waiting' | 'picked-up'; opened: Opened | null; problem: string | null }
export type OpenOutcome = Opened | NoteUnreadable | 'download';
export const PROBLEMS: Readonly<Record<NoteUnreadable['reason'] | 'download', string>> = {
  format: 'Could not open this note: it is not a sealed note.',
  'unknown-key': 'Could not open this note: it was sealed to a key your keyring does not hold.',
  tampered: 'Could not open this note: it was damaged or changed.',
  download: 'Could not download this note. Reload the page to try again.',
};

export function buildHistory(server: readonly ServerNote[], outcomes: ReadonlyMap<string, OpenOutcome>): HistoryItem[] {
  return server.map((n, i) => ({ n, i })).sort((a, b) => b.n.arrived_at - a.n.arrived_at || b.i - a.i).map(({ n }) => {
    const o = outcomes.get(n.id);
    const problem = o === undefined ? null : o === 'download' ? PROBLEMS.download : o instanceof NoteUnreadable ? PROBLEMS[o.reason] : null;
    const opened = o === undefined || o === 'download' || o instanceof NoteUnreadable ? null : o;
    return { id: n.id, arrived: n.arrived_at, pickedUp: n.picked_up_at, state: n.picked_up_at === null ? 'waiting' : 'picked-up', opened, problem };
  });
}

export function waitingByPiece(items: readonly HistoryItem[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const i of items) if (i.state === 'waiting' && i.opened) counts.set(i.opened.body.piece, (counts.get(i.opened.body.piece) ?? 0) + 1);
  return counts;
}

export function forPiece(items: readonly HistoryItem[], piece: string): HistoryItem[] {
  return items.filter(i => (i.opened ? i.opened.body.piece === piece : i.problem !== null));
}

export function timelineMarks(items: readonly HistoryItem[], piece: string, duration: number): NoteMark[] {
  const clamp = (t: number): number => Math.min(duration, Math.max(0, t));
  return items
    .filter(i => i.opened !== null && i.opened.body.piece === piece && i.opened.body.kind !== 'energy')
    .sort((a, b) => a.arrived - b.arrived || (a.id < b.id ? -1 : 1))
    .map((i, k) => {
      const b = i.opened!.body;
      const from = clamp(b.from);
      return { id: i.id, n: k + 1, from, to: Math.max(from, clamp(b.to)), lane: b.lane, kind: b.kind, draft: b.draft };
    });
}

export function answeredBy(changes: readonly Change[], id: string): number[] {
  return changes.flatMap((c, i) => (c.answers.includes(id) ? [i] : []));
}
