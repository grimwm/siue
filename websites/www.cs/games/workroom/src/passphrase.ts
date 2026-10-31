// Changing the notes passphrase on Your studio: the current passphrase opens the locked keyring in this browser, the
// same keys are locked again under the new one (typed twice, the keymaker's rules), the new envelope is proven to
// open, and the server stores it only when its fingerprints are the ones it holds. Neither passphrase is kept.
import { KeyChanged, NoKeyring } from './api.ts';
import type { PageApi } from './api.ts';
import { PASSPHRASE_MESSAGES, checkPassphrase } from './keymaker.ts';
import { describeFailure } from './notes-session.ts';
import { KeyringInvalid, WrongPassphrase, relockKeyring, unlockKeyring } from './unlock.ts';

export const CHANGE_MESSAGES = {
  wrong: 'That is not your current passphrase. Nothing was changed.',
  keyChanged: 'Your notes key changed while this page was open. Reload the page and try again.',
  noKeyring: 'You have no notes key yet. Make one on your pieces page.',
  invalid: 'The notes key on the server is damaged or does not match its fingerprints. Use Forgot your passphrase to make a new one.',
} as const;

/** Changes the passphrase from `current` to `next` (typed again as `again`); what went wrong, or null once the server holds the re-locked keys. */
export async function changePassphrase(api: Pick<PageApi, 'keyring' | 'changeKeyring'>, current: string, next: string, again: string): Promise<string | null> {
  const weak = checkPassphrase(next, again);
  if (weak !== null) return PASSPHRASE_MESSAGES[weak];
  try {
    const { locked } = await api.keyring();
    const relocked = await relockKeyring(locked, current, next);
    // The new envelope must open with the new passphrase to the same current key before it replaces the old one.
    if ((await unlockKeyring(relocked.locked, next)).current.fingerprint !== relocked.current) throw new KeyringInvalid('the new envelope does not match');
    await api.changeKeyring(relocked.locked, relocked.current, relocked.previous);
    return null;
  } catch (e) {
    if (e instanceof WrongPassphrase) return CHANGE_MESSAGES.wrong;
    if (e instanceof KeyChanged) return CHANGE_MESSAGES.keyChanged;
    if (e instanceof NoKeyring) return CHANGE_MESSAGES.noKeyring;
    if (e instanceof KeyringInvalid) return CHANGE_MESSAGES.invalid;
    return describeFailure(e);
  }
}
