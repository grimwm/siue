// The workroom's front page notes: make the notes key when there is none yet,
// unlock, and each piece shows how many of the notes wait for pickup. The panel
// is the same one a piece page has (Answers), here for the general notes, which
// are tied to no piece: the person writes one, sees the general notes already
// written, and answers to them. The counts come from every note the panel loads. Under it, Connect your AI
// (ConnectAi): what the page offers for AI apps, the same for every studio.
import { useEffect, useRef, useState } from 'preact/hooks';
import { waitingByPiece } from '../history.ts';
import { guardLeaving, unsavedWork } from '../leave.ts';
import type { NotesSession } from '../notes-session.ts';
import { Answers } from './Answers.tsx';
import { ConnectAi } from './ConnectAi.tsx';
import { MakeKeyPanel } from './MakeKeyPanel.tsx';
import { showWaiting } from './waiting.ts';

export function PiecesIndex(p: { notes: NotesSession; list: ParentNode }) {
  const [keyring, setKeyring] = useState(true);
  const [text, setText] = useState('');
  /** Why the unlock is shown first, when the key was made but did not unlock. */
  const [why, setWhy] = useState<string | null>(null);
  const textNow = useRef(text);
  textNow.current = text;
  // Leaving the page asks first while words are typed and not stored, or a note not sent yet is held only in memory.
  useEffect(() => guardLeaving(window, () => unsavedWork({ draft: textNow.current, recording: false, held: false, memoryOnly: p.notes.memoryOnly() })), [p.notes]);
  useEffect(() => { void p.notes.hasKeyring().then(setKeyring, () => setKeyring(true)); }, [p.notes]);
  if (!keyring) {
    return (
      <div class="mx-auto grid max-w-xl gap-4">
        <MakeKeyPanel notes={p.notes} onMade={() => setKeyring(true)} onStored={m => { setWhy(m); setKeyring(true); }} />
        <ConnectAi />
      </div>
    );
  }
  return (
    <div class="mx-auto grid max-w-xl gap-4">
      <Answers notes={p.notes} score={null} version={1} refresh={0} ask={why} onUnlocked={() => {}} onItems={items => showWaiting(p.list, waitingByPiece(items))} draft={{ text, onText: setText }} />
      <ConnectAi />
    </div>
  );
}
