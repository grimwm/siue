// "Your notes" before there is a notes key: the person chooses a passphrase,
// typed twice, and this page makes the key, locks it with the passphrase,
// uploads it and unlocks it at once. When the key is stored but the unlock failed,
// the unlock form takes over (the key exists, and a second make would discard it). A password manager offers to save the new
// passphrase (a username it never shows, and new-password fields). The fields
// are cleared on submit; the page keeps nothing of the passphrase.
import { useState } from 'preact/hooks';
import { PASSPHRASE_MESSAGES, checkPassphrase } from '../keymaker.ts';
import { UNLOCK_MESSAGES } from '../notes-session.ts';
import type { NotesSession } from '../notes-session.ts';
import { Button } from './console/Button.tsx';
import { Panel } from './console/Panel.tsx';

export const MAKE_KEY_INTRO = 'Make your notes key. Your notes are sealed in this browser with a key only your passphrase unlocks. Nobody can reset it, not even the people who run this site. If you forget it, Forgot your passphrase on Your studio deletes your notes and this key so you can make a new one; your pieces stay.';

const FIELD = 'min-h-11 rounded-md border border-rule bg-well px-3 font-body text-base tracking-normal text-ink normal-case focus-visible:outline-2 focus-visible:outline-amber';
const LABEL = 'grid gap-1 font-mono text-xs tracking-widest text-dim uppercase';

export interface MakeKeyPanelProps {
  notes: NotesSession;
  /** The key is made, uploaded and unlocked. */
  onMade(): void;
  /** The studio holds the key now (this page uploaded it, or another tab did) but it is not unlocked: show the unlock form, with why. */
  onStored(why: string): void;
}

export function MakeKeyPanel(p: MakeKeyPanelProps) {
  const [first, setFirst] = useState('');
  const [again, setAgain] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const make = async (a: string, b: string): Promise<void> => {
    const refused = checkPassphrase(a, b);
    if (refused !== null) { setError(PASSPHRASE_MESSAGES[refused]); return; }
    setBusy(true);
    setError(null);
    const problem = await p.notes.makeKey(a);
    setBusy(false);
    if (problem === null && p.notes.unlocked()) { p.onMade(); return; }
    const why = problem ?? UNLOCK_MESSAGES.lockedAgain;
    if (p.notes.keyStored()) p.onStored(why);
    else setError(why);
  };
  return (
    <Panel title="Your notes" class="grid gap-3" data={{ 'data-make-key': '' }}>
      <form class="grid gap-3" onSubmit={e => {
        e.preventDefault();
        const a = first;
        const b = again;
        setFirst('');
        setAgain('');
        if (!busy) void make(a, b);
      }}>
        <p class="text-sm">{MAKE_KEY_INTRO}</p>
        <input type="text" name="username" autocomplete="username" value="siue-music" readOnly tabIndex={-1} aria-hidden="true" class="sr-only" />
        <label class={LABEL}>Passphrase
          <input type="password" name="new-password" autocomplete="new-password" required value={first} onInput={e => setFirst(e.currentTarget.value)} class={FIELD} />
        </label>
        <label class={LABEL}>The same passphrase again
          <input type="password" name="new-password-again" autocomplete="new-password" required value={again} onInput={e => setAgain(e.currentTarget.value)} class={FIELD} />
        </label>
        {error ? <p class="rounded-md border border-amber bg-well p-3 text-sm" role="alert">{error}</p> : null}
        <Button variant="primary" submit disabled={busy}>{busy ? 'Making your key…' : 'Make my notes key'}</Button>
      </form>
    </Panel>
  );
}
