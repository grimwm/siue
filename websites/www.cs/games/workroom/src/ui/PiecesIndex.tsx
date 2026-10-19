// The pieces list's notes: unlock, and each piece shows how many of the
// owner's notes wait for pickup; the notes not sent yet are listed and flushed.
import { useEffect, useState } from 'preact/hooks';
import { SignedOut } from '../api.ts';
import { waitingByPiece } from '../history.ts';
import { UNLOCK_MESSAGES } from '../notes-session.ts';
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
  const refreshKept = async (): Promise<void> => { setKept(await p.notes.kept()); };
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
      showWaiting(p.list, waitingByPiece(await p.notes.history()));
      setCounted(true);
    } catch (e) {
      setError(e instanceof SignedOut ? UNLOCK_MESSAGES.signedOut : UNLOCK_MESSAGES.offline);
    }
    setBusy(false);
  };
  const act = async (work: () => Promise<unknown>): Promise<void> => {
    setBusy(true);
    try { await work(); } finally { setBusy(false); }
    await refreshKept();
  };
  return (
    <Panel title="Your notes" class="mx-auto grid max-w-xl gap-3" data={{ 'data-pieces-notes': '' }}>
      {!keyring
        ? <p class="text-sm text-dim">{UNLOCK_MESSAGES.noKeyring}</p>
        : counted
          ? <p class="text-sm text-dim">Each piece shows how many of your notes wait for pickup.</p>
          : <UnlockPanel busy={busy} error={error} onUnlock={pass => void unlock(pass)} />}
      <Kept kept={kept} busy={busy} onDiscard={key => void act(() => p.notes.discard(key))} onRetry={() => void act(() => p.notes.flush())} />
    </Panel>
  );
}
