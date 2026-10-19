
// The passphrase form that unlocks the notes on this page view. A password
// manager fills it (a username it never shows, and a current-password field).
// Nothing is remembered by the page: the field is cleared on submit and the
// passphrase is asked on every visit. Chrome's own password manager may offer
// to save the pair; the owner dismisses that prompt.
import { useState } from 'preact/hooks';
import { Button } from './console/Button.tsx';

export interface UnlockPanelProps { busy: boolean; error: string | null; onUnlock(passphrase: string): void }

export function UnlockPanel(p: UnlockPanelProps) {
  const [value, setValue] = useState('');
  return (
    <form data-unlock="" class="grid gap-3" onSubmit={e => {
      e.preventDefault();
      const v = value;
      setValue('');
      if (v.trim() !== '') p.onUnlock(v);
    }}>
      <p class="text-sm text-dim">Unlock to write and read your notes. Your password manager fills the passphrase in; this device never keeps it.</p>
      <input type="text" name="username" autocomplete="username" value="siue-music" readOnly tabIndex={-1} aria-hidden="true" class="sr-only" />
      <label class="grid gap-1 font-mono text-xs tracking-widest text-dim uppercase">Passphrase
        <input type="password" name="password" autocomplete="current-password" required value={value} onInput={e => setValue(e.currentTarget.value)}
          class="min-h-11 rounded-md border border-rule bg-well px-3 font-body text-base tracking-normal text-ink normal-case focus-visible:outline-2 focus-visible:outline-amber" />
      </label>
      {p.error ? <p class="rounded-md border border-amber bg-well p-3 text-sm" role="alert">{p.error}</p> : null}
      <Button variant="primary" submit disabled={p.busy}>{p.busy ? 'Unlocking…' : 'Unlock notes'}</Button>
    </form>
  );
}
