// Change your passphrase, on Your studio: the current passphrase, then the new one twice. The page opens the notes
// key with the current one and locks the same key with the new one (passphrase.ts); the server takes it only when
// the key's fingerprints are the ones it holds. A password manager offers to update the saved passphrase (the
// username it never shows, current-password and new-password fields). The fields are cleared on submit, and the
// page keeps nothing of either passphrase.
import { useState } from 'preact/hooks';
import { Button } from './console/Button.tsx';

const FIELD = 'min-h-11 rounded-md border border-rule bg-well px-3 font-body text-base tracking-normal text-ink normal-case focus-visible:outline-2 focus-visible:outline-amber';
const LABEL = 'grid gap-1 font-mono text-xs tracking-widest text-dim uppercase';

export interface ChangePassphraseProps {
  /** Changes it; what went wrong, or null once the server holds the key under the new passphrase. */
  change(current: string, next: string, again: string): Promise<string | null>;
  /** The change is stored. */
  onChanged(): void;
}

export function ChangePassphrase(p: ChangePassphraseProps) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [again, setAgain] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const run = async (a: string, b: string, c: string): Promise<void> => {
    setBusy(true);
    setError(null);
    const problem = await p.change(a, b, c);
    setBusy(false);
    if (problem === null) p.onChanged();
    else setError(problem);
  };
  return (
    <form class="grid gap-3" data-change-form="" onSubmit={e => {
      e.preventDefault();
      const [a, b, c] = [current, next, again];
      setCurrent('');
      setNext('');
      setAgain('');
      if (!busy) void run(a, b, c);
    }}>
      <input type="text" name="username" autocomplete="username" value="siue-music" readOnly tabIndex={-1} aria-hidden="true" class="sr-only" />
      <label class={LABEL}>Current passphrase
        <input type="password" name="current-password" autocomplete="current-password" required value={current} onInput={e => setCurrent(e.currentTarget.value)} class={FIELD} />
      </label>
      <label class={LABEL}>New passphrase
        <input type="password" name="new-password" autocomplete="new-password" required value={next} onInput={e => setNext(e.currentTarget.value)} class={FIELD} />
      </label>
      <label class={LABEL}>The new passphrase again
        <input type="password" name="new-password-again" autocomplete="new-password" required value={again} onInput={e => setAgain(e.currentTarget.value)} class={FIELD} />
      </label>
      {error ? <p class="rounded-md border border-amber bg-well p-3 text-sm" role="alert">{error}</p> : null}
      <Button variant="primary" submit disabled={busy}>{busy ? 'Changing your passphrase…' : 'Change passphrase'}</Button>
    </form>
  );
}
