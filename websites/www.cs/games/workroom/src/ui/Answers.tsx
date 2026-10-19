
// "Your notes" in the notes panel: the unlock form until the notes are
// unlocked (with the reason above it when a composer asked for the unlock),
// then the history of this piece (or all pieces). The notes not sent yet are
// listed either way. The outbox is flushed when the panel opens and
// whenever the browser comes back online.
import { useEffect, useState } from 'preact/hooks';
import { SignedOut } from '../api.ts';
import { answeredBy, forPiece, timelineMarks } from '../history.ts';
import type { HistoryItem } from '../history.ts';
import { UNLOCK_MESSAGES } from '../notes-session.ts';
import type { NotesSession } from '../notes-session.ts';
import type { Pending } from '../outbox.ts';
import type { Score } from '../score.ts';
import { Panel } from './console/Panel.tsx';
import { History, Kept } from './History.tsx';
import { UnlockPanel } from './UnlockPanel.tsx';

export interface AnswersProps {
  notes: NotesSession; score: Score; version: number; refresh: number;
  ask: string | null;
  onUnlocked(): void;
  onItems(items: readonly HistoryItem[]): void;
}

const problemOf = (e: unknown): string => (e instanceof SignedOut ? UNLOCK_MESSAGES.signedOut : UNLOCK_MESSAGES.offline);

export function Answers(p: AnswersProps) {
  const [unlocked, setUnlocked] = useState(p.notes.unlocked());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<readonly HistoryItem[]>([]);
  const [kept, setKept] = useState<readonly Pending[]>([]);
  const [scope, setScope] = useState<'piece' | 'all'>('piece');

  /** Shows a failure; a sign-in that ended locks the notes, so the unlock form comes back. */
  const fail = (e: unknown): void => {
    if (e instanceof SignedOut) { p.notes.lock(); setItems([]); }
    setError(problemOf(e));
    setUnlocked(p.notes.unlocked());
  };
  const load = async (): Promise<void> => {
    setKept(await p.notes.kept());
    if (!p.notes.unlocked()) { setUnlocked(false); return; }
    try {
      const all = await p.notes.history();
      setItems(all);
      p.onItems(all);
      setError(null);
    } catch (e) {
      fail(e);
    }
  };
  const act = async (work: () => Promise<unknown>): Promise<void> => {
    setBusy(true);
    try { await work(); } catch (e) { fail(e); } finally { setBusy(false); }
    await load();
  };
  useEffect(() => { void load(); }, [p.refresh]);
  useEffect(() => {
    void p.notes.flush().then(load, load);
    const again = (): void => { void p.notes.flush().then(load, load); };
    window.addEventListener('online', again);
    return () => window.removeEventListener('online', again);
  }, [p.notes]);

  const unlock = async (passphrase: string): Promise<void> => {
    setBusy(true);
    setError(null);
    const problem = await p.notes.unlock(passphrase);
    setBusy(false);
    if (problem) { setError(problem); return; }
    // unlock() answers null both when it succeeded and when a lock overtook it.
    if (!p.notes.unlocked()) return;
    setUnlocked(true);
    p.onUnlocked();
    await load();
  };

  const piece = p.score.piece.id;
  const numbers = new Map(timelineMarks(items, piece, p.score.duration).map(m => [m.id, m.n]));
  const keptList = <Kept kept={kept} busy={busy} onDiscard={key => void act(() => p.notes.discard(key))} onRetry={() => void act(() => p.notes.flush())} />;
  return (
    <Panel title="Your notes" label="Notes & answers" class="grid gap-3" data={{ 'data-answers': '' }}>
      {!unlocked ? (
        <>
          {p.ask ? <p data-unlock-reason="" class="text-sm">{p.ask}</p> : null}
          <UnlockPanel busy={busy} error={error} onUnlock={pass => void unlock(pass)} />
          {keptList}
        </>
      ) : (
        <>
          {error ? <p class="rounded-md border border-amber bg-well p-3 text-sm" role="alert">{error}</p> : null}
          <History items={scope === 'piece' ? forPiece(items, piece) : items} total={items.length} scope={scope} onScope={setScope} version={p.version}
            laneName={id => p.score.lanes.find(l => l.id === id)?.name ?? null}
            numberOf={id => numbers.get(id) ?? null}
            answers={id => { const k = answeredBy(p.score.changes, id); return k.length ? `Answered in this draft: ${k.map(i => `change ${i + 1}`).join(', ')}` : null; }}
            kept={kept} busy={busy}
            onDelete={id => void act(() => p.notes.remove(id))}
            onDeleteAll={() => void act(() => p.notes.removeAll())}
            onDiscard={key => void act(() => p.notes.discard(key))}
            onRetry={() => void act(() => p.notes.flush())} />
        </>
      )}
    </Panel>
  );
}
