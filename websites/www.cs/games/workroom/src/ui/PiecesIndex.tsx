// The pieces list's notes: unlock, and each piece shows how many of the
// owner's notes wait for pickup; the notes not sent yet are listed and flushed.
import { useEffect, useRef, useState } from 'preact/hooks';
import { SignedOut } from '../api.ts';
import { waitingByPiece } from '../history.ts';
import { guardLeaving } from '../leave.ts';
import { UNLOCK_MESSAGES } from '../notes-session.ts';
import type { NotesSession } from '../notes-session.ts';
import type { Pending } from '../outbox.ts';
import { Panel } from './console/Panel.tsx';
import { Kept } from './History.tsx';
import { UnlockPanel } from './UnlockPanel.tsx';
import { showWaiting } from './waiting.ts';

const problemOf = (e: unknown): string => (e instanceof SignedOut ? UNLOCK_MESSAGES.signedOut : UNLOCK_MESSAGES.offline);

export function PiecesIndex(p: { notes: NotesSession; list: ParentNode }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [counted, setCounted] = useState(false);
  const [keyring, setKeyring] = useState(true);
  const [kept, setKept] = useState<readonly Pending[]>([]);
  const [problem, setProblem] = useState<string | null>(null);
  const countedNow = useRef(false);
  const recount = async (): Promise<void> => {
    showWaiting(p.list, waitingByPiece(await p.notes.history()));
    countedNow.current = true;
    setCounted(true);
  };
  // After a flush, notes just sent wait on the server: the counts are taken again once they are shown.
  const refreshKept = async (): Promise<void> => {
    try { setKept(await p.notes.kept()); } catch { /* the browser's store could not be read just now; the list stays as it was */ }
    if (countedNow.current) await recount().catch(() => { /* the counts stay as they were until the next flush */ });
  };
  // Leaving the page asks first while a note not sent yet is held only in memory.
  useEffect(() => guardLeaving(window, () => p.notes.memoryOnly()), [p.notes]);
  useEffect(() => { void p.notes.hasKeyring().then(setKeyring, () => setKeyring(true)); }, [p.notes]);
  useEffect(() => {
    const again = (): void => { void p.notes.flush().then(refreshKept, refreshKept); };
    again();
    window.addEventListener('online', again);
    return () => window.removeEventListener('online', again);
  }, [p.notes]);
  const unlock = async (passphrase: string): Promise<void> => {
    setBusy(true);
    setError(null);
    const problem = await p.notes.unlock(passphrase);
    if (problem) { setError(problem); setBusy(false); return; }
    try {
      await recount();
    } catch (e) {
      setError(problemOf(e));
    }
    setBusy(false);
  };
  const act = async (work: () => Promise<unknown>): Promise<void> => {
    setBusy(true);
    setProblem(null);
    try { await work(); } catch (e) { setProblem(problemOf(e)); } finally { setBusy(false); }
    await refreshKept();
  };
  return (
    <Panel title="Your notes" class="mx-auto grid max-w-xl gap-3" data={{ 'data-pieces-notes': '' }}>
      {!keyring
        ? <p class="text-sm text-dim">{UNLOCK_MESSAGES.noKeyring}</p>
        : counted
          ? <p class="text-sm text-dim">Each piece shows how many of your notes wait for pickup.</p>
          : <UnlockPanel busy={busy} error={error} onUnlock={pass => void unlock(pass)} />}
      {problem ? <p class="rounded-md border border-amber bg-well p-3 text-sm" role="alert">{problem}</p> : null}
      <Kept kept={kept} busy={busy} onDiscard={key => void act(() => p.notes.discard(key))} onRetry={() => void act(() => p.notes.flush())} />
    </Panel>
  );
}
