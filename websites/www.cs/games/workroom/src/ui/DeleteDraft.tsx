// "Delete this draft" and "Delete this piece" on a piece page. Each asks first
// with the browser's own confirm, in words that name what goes, then posts to
// the server and moves on: after a draft to the next newest one (the pieces
// list when it was the last), after a piece to the pieces list. A draft the
// server no longer has is as good as deleted. Notes sealed about the piece are
// not touched.
import { useState } from 'preact/hooks';
import { ServerError } from '../api.ts';
import { describeFailure } from '../notes-session.ts';
import { Button } from './console/Button.tsx';

export interface DeleteDraftProps {
  piece: string;
  title: string;
  version: number;
  /** Every kept draft of the piece, as listed. */
  versions: readonly number[];
  /** Posts the delete; the number gone. */
  remove(piece: string, version?: number): Promise<number>;
  /** The browser's confirm. */
  confirm(question: string): boolean;
  /** Goes to a page of the studio. */
  go(url: string): void;
}

export const PIECES_LIST = './';
export const draftPage = (piece: string, version: number): string => `piece.php?id=${encodeURIComponent(piece)}&v=${version}`;

export const draftQuestion = (title: string, version: number, last: boolean): string =>
  `Delete draft ${version} of ${title}? ${last ? 'It is the only draft, so the piece goes too. ' : ''}This cannot be undone.`;
export const pieceQuestion = (title: string, drafts: number): string =>
  `Delete ${title} and ${drafts === 1 ? 'its one draft' : `all ${drafts} of its drafts`}? This cannot be undone.`;

export function DeleteDraft(p: DeleteDraftProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const run = async (question: string, version: number | undefined, next: string): Promise<void> => {
    if (busy || !p.confirm(question)) return;
    setBusy(true);
    setError(null);
    try {
      await p.remove(p.piece, version);
    } catch (e) {
      if (!(e instanceof ServerError && e.status === 404)) {
        setError(describeFailure(e));
        setBusy(false);
        return;
      }
    }
    p.go(next);
  };
  const rest = p.versions.filter(v => v !== p.version);
  const newest = rest.length === 0 ? null : Math.max(...rest);
  return (
    <div data-delete-draft="" class="grid gap-2">
      <div class="flex flex-wrap justify-end gap-2">
        <Button variant="ghost" disabled={busy} onClick={() => { void run(draftQuestion(p.title, p.version, newest === null), p.version, newest === null ? PIECES_LIST : draftPage(p.piece, newest)); }}>Delete this draft</Button>
        <Button variant="ghost" disabled={busy} onClick={() => { void run(pieceQuestion(p.title, p.versions.length), undefined, PIECES_LIST); }}>Delete this piece</Button>
      </div>
      {error ? <p class="rounded-md border border-amber bg-well p-3 text-sm" role="alert">{error}</p> : null}
    </div>
  );
}
