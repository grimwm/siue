// Pairing one AI key, on its row on Your studio: the code the AI shows and the notes passphrase (the keyring is
// opened and locked again in this browser, pair-flow.ts). The fields are cleared on submit, and the page keeps
// nothing of the passphrase.
import { useState } from 'preact/hooks';
import { Button } from './console/Button.tsx';

const FIELD = 'min-h-11 rounded-md border border-rule bg-well px-3 font-body text-base tracking-normal text-ink normal-case focus-visible:outline-2 focus-visible:outline-amber';
const LABEL = 'grid gap-1 font-mono text-xs tracking-widest text-dim uppercase';

export interface PairAiProps {
  label: string;
  /** Pairs it; what went wrong, or null once the server holds the keyring with the AI key in it. */
  pair(code: string, passphrase: string): Promise<string | null>;
  onPaired(): void;
}

export function PairAi(p: PairAiProps) {
  const [code, setCode] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const run = async (c: string, pass: string): Promise<void> => {
    setBusy(true);
    setError(null);
    const problem = await p.pair(c, pass);
    setBusy(false);
    if (problem === null) p.onPaired();
    else setError(problem);
  };
  return (
    <form class="grid gap-3" data-pair-form="" aria-label={`Pair ${p.label}`} onSubmit={e => {
      e.preventDefault();
      const [c, pass] = [code, passphrase];
      setPassphrase('');
      if (!busy) void run(c, pass);
    }}>
      <input type="text" name="username" autocomplete="username" value="siue-music" readOnly tabIndex={-1} aria-hidden="true" class="sr-only" />
      <label class={LABEL}>Pairing Code
        <input type="text" name="pairing-code" autocomplete="off" spellcheck={false} autocapitalize="characters" placeholder="XXXX-XXXX-XXXX-XXXX" required value={code}
          onInput={e => setCode(e.currentTarget.value)} class={FIELD} />
      </label>
      <label class={LABEL}>Passphrase
        <input type="password" name="current-password" autocomplete="current-password" required value={passphrase} onInput={e => setPassphrase(e.currentTarget.value)} class={FIELD} />
      </label>
      {error ? <p class="rounded-md border border-amber bg-well p-3 text-sm" role="alert">{error}</p> : null}
      <Button variant="primary" submit disabled={busy}>{busy ? 'Pairing…' : 'Pair'}</Button>
    </form>
  );
}
