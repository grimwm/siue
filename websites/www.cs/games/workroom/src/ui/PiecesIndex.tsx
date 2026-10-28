// The pieces list's notes: unlock, and each piece shows how many of the
// owner's notes wait for pickup; the notes not sent yet are listed and flushed.
import { useEffect, useRef, useState } from 'preact/hooks';
import { SignedOut } from '../api.ts';
import { waitingByPiece } from '../history.ts';
import { guardLeaving } from '../leave.ts';
import { DISCARD_FAILED, UNLOCK_MESSAGES, describeFailure, unreadableMessage } from '../notes-session.ts';
import type { NotesSession } from '../notes-session.ts';
import type { Pending } from '../outbox.ts';
import { Panel } from './console/Panel.tsx';
import { Kept } from './History.tsx';
import { UnlockPanel } from './UnlockPanel.tsx';
import { showWaiting } from './waiting.ts';

export function PiecesIndex(p: { notes: NotesSession; list: ParentNode }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [counted, setCounted] = useState(false);
  const [keyring, setKeyring] = useState(true);
  const [kept, setKept] = useState<readonly Pending[]>([]);
  /** What the last action (Discard, Try again) could not do: kept until the next action, so the reload after it cannot wipe it. */
  const [problem, setProblem] = useState<string | null>(null);
  /** What is wrong with the counts: notes the page could not read, or a count that failed. Replaced by every count. */
  const [countNote, setCountNote] = useState<string | null>(null);
  const countedNow = useRef(false);
  const recount = async (): Promise<void> => {
    showWaiting(p.list, waitingByPiece(await p.notes.history()));
    countedNow.current = true;
    setCounted(true);
    const skipped = p.notes.unreadable();
    setCountNote(skipped > 0 ? unreadableMessage(skipped) : null);
  };
  // After a flush, notes just sent wait on the server: the counts are taken again once they are shown.
  const refreshKept = async (): Promise<void> => {
    try { setKept(await p.notes.kept()); } catch { /* the browser's store could not be read just now; the list stays as it was */ }
    if (countedNow.current) await recount().catch((e: unknown) => setCountNote(`The counts could not be updated. ${describeFailure(e)}`));
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
    // The notes are unlocked now, so the unlock form goes whether or not the first count works; a failed count is told and tried again after the next flush.
    countedNow.current = true;
    setCounted(true);
    try {
      await recount();
    } catch (e) {
      setCountNote(`Your notes are unlocked, but the counts could not be loaded. ${describeFailure(e)}`);
    }
    setBusy(false);
  };
  /** `whenFailed` is what to say when the work fails for any reason but a lost sign-in. */
  const act = async (work: () => Promise<unknown>, whenFailed?: string): Promise<void> => {
    setBusy(true);
    setProblem(null);
    try { await work(); } catch (e) { setProblem(whenFailed !== undefined && !(e instanceof SignedOut) ? whenFailed : describeFailure(e)); } finally { setBusy(false); }
    await refreshKept();
  };
  return (
    <Panel title="Your notes" class="mx-auto grid max-w-xl gap-3" data={{ 'data-pieces-notes': '' }}>
      {!keyring
        ? <p class="text-sm text-dim">{UNLOCK_MESSAGES.noKeyring}</p>
        : counted
          ? <p class="text-sm text-dim">Each piece shows how many of your notes wait for pickup.</p>
          : <UnlockPanel busy={busy} error={error} onUnlock={pass => void unlock(pass)} />}
      {[problem, countNote].map(m => (m ? <p class="rounded-md border border-amber bg-well p-3 text-sm" role="alert">{m}</p> : null))}
      <Kept kept={kept} busy={busy} onDiscard={key => void act(() => p.notes.discard(key), DISCARD_FAILED)} onRetry={() => void act(() => p.notes.flush())} />
    </Panel>
  );
}
