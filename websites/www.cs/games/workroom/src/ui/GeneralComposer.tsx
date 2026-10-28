// The front page's box for a general note: plain words, tied to no piece. The
// words stay in the box until the sealed note is stored, so a note that could
// not be sealed is never lost; a note kept on this device says why.
import { useState } from 'preact/hooks';
import { NoteEmpty, NoteTooLong, generalNote } from '../answer.ts';
import { MAX_TEXT } from '../note.ts';
import { KEPT_MESSAGES, MEMORY_NOTICE, SENT_MESSAGE, SEND_MESSAGES } from '../outbox.ts';
import type { NotesSession } from '../notes-session.ts';
import { Button } from './console/Button.tsx';

export function GeneralComposer(p: { notes: NotesSession; busy: boolean; onStored(): void }) {
  const [text, setText] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const send = async (): Promise<void> => {
    let body;
    try {
      body = generalNote(() => new Date(), text);
    } catch (e) {
      setStatus(e instanceof NoteEmpty || e instanceof NoteTooLong ? e.message : SEND_MESSAGES.sealFailed);
      return;
    }
    const sentWords = body.text;
    setSending(true);
    setStatus('Sealing and sending…');
    try {
      const r = await p.notes.send(body, null);
      const kept = r.kept.find(k => k.key === r.key);
      setStatus(kept ? `${KEPT_MESSAGES[kept.reason]}${r.memoryOnly ? ` ${MEMORY_NOTICE}` : ''}` : SENT_MESSAGE);
      setText(now => (now.trim() === sentWords ? '' : now)); // words typed while it was sent stay
      p.onStored();
    } catch (e) {
      setStatus(e instanceof Error ? e.message : SEND_MESSAGES.sealFailed);
    } finally {
      setSending(false);
    }
  };
  return (
    <div data-general-composer="" class="grid gap-2">
      <label class="grid gap-1 font-mono text-xs tracking-widest text-dim uppercase">A general note, on no piece in particular
        <textarea rows={3} maxLength={MAX_TEXT + 1000} value={text} onInput={e => setText(e.currentTarget.value)}
          class="rounded-md border border-rule bg-well p-3 font-body text-base tracking-normal text-ink normal-case focus-visible:outline-2 focus-visible:outline-amber" />
      </label>
      {status ? <p data-general-status="" class="text-sm" role="status">{status}</p> : null}
      <div class="flex justify-end"><Button variant="primary" disabled={sending || p.busy} onClick={() => void send()}>Send note</Button></div>
    </div>
  );
}
