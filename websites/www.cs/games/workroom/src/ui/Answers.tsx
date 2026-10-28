
// "Your notes" in the notes panel: the unlock form until the notes are
// unlocked (with the reason above it when a composer asked for the unlock),
// then the history of this piece (or all pieces). The notes not sent yet are
// listed either way. The outbox is flushed when the panel opens and
// whenever the browser comes back online.
import { useEffect, useRef, useState } from 'preact/hooks';
import { SignedOut } from '../api.ts';
import { answeredBy, forPiece, timelineMarks } from '../history.ts';
import type { HistoryItem } from '../history.ts';
import { DISCARD_FAILED, describeFailure, unreadableMessage } from '../notes-session.ts';
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
  /** The notes are locked again (a sign-in that ended, or a lock that overtook a load). */
  onLocked?(): void;
  onItems(items: readonly HistoryItem[]): void;
}

export function Answers(p: AnswersProps) {
  const [unlocked, setUnlocked] = useState(p.notes.unlocked());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** What the last action (Delete, Delete all, Discard, Try again) could not do: kept until the next action, so the reload after it cannot wipe it. */
  const [problem, setProblem] = useState<string | null>(null);
  const [items, setItems] = useState<readonly HistoryItem[]>([]);
  const [kept, setKept] = useState<readonly Pending[]>([]);
  const [scope, setScope] = useState<'piece' | 'all'>('piece');

  /** Shows a failure; a sign-in that ended locks the notes, so the unlock form comes back. */
  const fail = (e: unknown): void => {
    if (e instanceof SignedOut) { p.notes.lock(); setItems([]); }
    setError(describeFailure(e));
    setUnlocked(p.notes.unlocked());
    if (!p.notes.unlocked()) p.onLocked?.();
  };
  const load = async (): Promise<void> => {
    try {
      setKept(await p.notes.kept());
    } catch {
      // The browser's store could not be read just now: the list stays as it was, and the history still loads.
    }
    if (!p.notes.unlocked()) { setUnlocked(false); p.onLocked?.(); return; }
    try {
      const all = await p.notes.history();
      if (!p.notes.unlocked()) { setItems([]); setUnlocked(false); p.onLocked?.(); return; }
      setItems(all);
      p.onItems(all);
      const skipped = p.notes.unreadable();
      setError(skipped > 0 ? unreadableMessage(skipped) : null);
    } catch (e) {
      fail(e);
    }
  };
  /** `whenFailed` is what to say when the work fails for any reason but a lost sign-in. */
  const act = async (work: () => Promise<unknown>, whenFailed?: string): Promise<void> => {
    setBusy(true);
    setProblem(null);
    try { await work(); } catch (e) { if (e instanceof SignedOut) fail(e); else setProblem(whenFailed ?? describeFailure(e)); } finally { setBusy(false); }
    await load();
  };
  const mounted = useRef(false);
  // The first load follows the mount's flush below; a later refresh loads at once.
  useEffect(() => { if (mounted.current) void load(); mounted.current = true; }, [p.refresh]);
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
  const keptList = <Kept kept={kept} busy={busy} onDiscard={key => void act(() => p.notes.discard(key), DISCARD_FAILED)} onRetry={() => void act(() => p.notes.flush())} />;
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
          {[problem, error].map(m => (m ? <p class="rounded-md border border-amber bg-well p-3 text-sm" role="alert">{m}</p> : null))}
          <History items={scope === 'piece' ? forPiece(items, piece) : items} total={items.length} scope={scope} onScope={setScope} version={p.version}
            laneName={id => p.score.lanes.find(l => l.id === id)?.name ?? null}
            numberOf={id => numbers.get(id) ?? null}
            answers={id => { const k = answeredBy(p.score.changes, id); return k.length ? `Answered in this draft: ${k.map(i => `change ${i + 1}`).join(', ')}` : null; }}
            kept={kept} busy={busy}
            onDelete={id => void act(() => p.notes.remove(id))}
            onDeleteAll={() => void act(() => p.notes.removeAll())}
            onDiscard={key => void act(() => p.notes.discard(key), DISCARD_FAILED)}
            onRetry={() => void act(() => p.notes.flush())} />
        </>
      )}
    </Panel>
  );
}
