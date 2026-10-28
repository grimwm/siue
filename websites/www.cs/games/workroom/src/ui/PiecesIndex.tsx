// The workroom's front page notes: unlock, and each piece shows how many of the
// owner's notes wait for pickup. The panel is the same one a piece page has
// (Answers), here for the general notes, which are tied to no piece: the owner
// writes one, sees the general notes already written, and answers to them. The
// counts come from every note the panel loads.
import { useEffect, useState } from 'preact/hooks';
import { waitingByPiece } from '../history.ts';
import { guardLeaving } from '../leave.ts';
import { UNLOCK_MESSAGES } from '../notes-session.ts';
import type { NotesSession } from '../notes-session.ts';
import { Answers } from './Answers.tsx';
import { Panel } from './console/Panel.tsx';
import { showWaiting } from './waiting.ts';

export function PiecesIndex(p: { notes: NotesSession; list: ParentNode }) {
  const [keyring, setKeyring] = useState(true);
  // Leaving the page asks first while a note not sent yet is held only in memory.
  useEffect(() => guardLeaving(window, () => p.notes.memoryOnly()), [p.notes]);
  useEffect(() => { void p.notes.hasKeyring().then(setKeyring, () => setKeyring(true)); }, [p.notes]);
  if (!keyring) {
    return (
      <Panel title="Your notes" class="mx-auto grid max-w-xl gap-3" data={{ 'data-pieces-notes': '' }}>
        <p class="text-sm text-dim">{UNLOCK_MESSAGES.noKeyring}</p>
      </Panel>
    );
  }
  return <div class="mx-auto max-w-xl"><Answers notes={p.notes} score={null} version={1} refresh={0} ask={null} onUnlocked={() => {}} onItems={items => showWaiting(p.list, waitingByPiece(items))} /></div>;
}
