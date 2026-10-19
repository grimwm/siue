// Pinning a typed or spoken note on the moment or span picked on the Story
// view (and its lane, when both ends were in one): the words, or a recording.
// The words stay in the box until the sealed note is stored, so a note that
// could not be sealed or kept is never lost. The Stop button of a recording
// lives in the answer bar's dock (AnswerBar.tsx), which is always on screen.
import { useState } from 'preact/hooks';
import { spanLabel } from '../answer.ts';
import type { Span } from '../hit.ts';
import { MAX_TEXT } from '../note.ts';
import { Button } from './console/Button.tsx';

export interface PinComposerProps {
  span: Span | null; laneName: string | null; recording: boolean; canRecord: boolean; busy: boolean;
  /** What became of the last send (or why it failed), shown inside the composer where the owner is looking. */
  status: string | null;
  /** Resolves true once the note is stored; false leaves the words in the box. */
  onSend(text: string): Promise<boolean>;
  onRecord(): void; onCancel(): void;
}

export function PinComposer(p: PinComposerProps) {
  const [text, setText] = useState('');
  const left = MAX_TEXT - text.length;
  const where = p.span ? `For ${spanLabel(p.span)}${p.laneName ? ` · ${p.laneName}` : ''}` : 'Drag across the Story view to pick a span, or tap one moment.';
  return (
    <div data-pin-composer="" class="grid gap-2 rounded-lg border border-amber bg-panel p-3">
      <p data-pin-span="" class="font-mono text-xs text-amber">{where}</p>
      <label class="grid gap-1 font-mono text-xs tracking-widest text-dim uppercase">Your note
        <textarea rows={3} maxLength={MAX_TEXT} value={text} onInput={e => setText(e.currentTarget.value)}
          class="min-h-24 rounded-md border border-rule bg-well p-3 font-body text-base tracking-normal text-ink normal-case focus-visible:outline-2 focus-visible:outline-amber" />
      </label>
      {left <= 500 ? <p class="font-mono text-xs text-dim">{`${left} characters left`}</p> : null}
      <div class="flex flex-wrap gap-2">
        <Button variant="primary" disabled={!p.span || text.trim() === '' || p.busy || p.recording} onClick={() => { void p.onSend(text).then(stored => { if (stored) setText(''); }); }}>Send</Button>
        {p.canRecord ? <Button variant="record" disabled={!p.span || p.busy || p.recording} onClick={p.onRecord}>{p.recording ? 'Recording…' : 'Record'}</Button> : null}
        <Button variant="ghost" onClick={p.onCancel}>Cancel</Button>
      </div>
      <p role="status" data-answer-status="" class="min-h-5 text-sm">{p.status ?? ''}</p>
    </div>
  );
}
