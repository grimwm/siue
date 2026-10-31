// Pairing an AI key on Your studio. The person types the code their AI shows and their passphrase. The server checks
// the code first (it counts every try); then this page checks it again itself against the public key the server
// handed back, and checks that key is a sealing key (verifyAiKey), so a server that slipped in a key of its own is
// refused here. Only then is the keyring opened with the passphrase, the AI key added to it, locked again and stored
// with the current key's proof. Nothing of the passphrase is kept.
import { NoKeyring } from './api.ts';
import type { PageApi, PairRefusal } from './api.ts';
import { describeFailure } from './notes-session.ts';
import { normalizeCode, pairingCode } from './pairing.ts';
import { KeyringInvalid, WrongPassphrase, relockKeyring, unlockKeyring, verifyAiKey } from './unlock.ts';

export const PAIR_MESSAGES = {
  badCode: 'A pairing code is 12 letters and digits, like ABCD-EFGH-JKMN. Type it as your AI shows it.',
  wrong_code: 'That is not this key\'s pairing code. Check the code your AI shows and try again.',
  too_many: 'Too many pairing tries in the last hour. Try again later.',
  no_key: 'This AI key is revoked or gone. Reload the page.',
  not_registered: 'This key\'s AI has not started yet. Add the key to your AI app, then ask it for its pairing code.',
  key_changed: 'Your notes key changed while this page was open. Reload the page and try again.',
  mismatch: 'The server sent a key that does not match this code, so it was not added. Nothing was changed.',
  wrong: 'That passphrase did not unlock your notes key. Nothing was changed.',
  noKeyring: 'You have no notes key yet. Make one on All pieces first.',
  invalid: 'The notes key on the server is damaged or does not match its fingerprints. Nothing was changed.',
} as const;

const refusal = (r: PairRefusal): string => PAIR_MESSAGES[r];

/** Pairs AI key `key` with the typed `code`; what went wrong, or null once the server holds the keyring with it. */
export async function pairAi(api: Pick<PageApi, 'keyring' | 'checkPairing' | 'pairKeyring'>, key: number, typed: string, passphrase: string): Promise<string | null> {
  const code = normalizeCode(typed);
  if (code === null) return PAIR_MESSAGES.badCode;
  try {
    const found = await api.checkPairing(key, code);
    if (typeof found === 'string') return refusal(found);
    // The server's word is not enough: the code must be this key's, and the key a sealing key.
    if (pairingCode(found.fingerprint) !== code || !(await verifyAiKey(found.spki, found.fingerprint))) return PAIR_MESSAGES.mismatch;
    const { locked, session } = await api.keyring();
    const recipient = { fingerprint: found.fingerprint, spki: found.spki, key };
    const relocked = await relockKeyring(locked, passphrase, passphrase, session,
      ai => [...ai.filter(a => a.key !== key && a.fingerprint !== found.fingerprint), recipient]);
    // The new envelope must open, with the same current key and the AI key in it, before it replaces the old one.
    const check = await unlockKeyring(relocked.locked, passphrase);
    if (check.current.fingerprint !== relocked.current || !check.ai.some(a => a.fingerprint === found.fingerprint)) throw new KeyringInvalid('the new envelope does not match');
    const stored = await api.pairKeyring(relocked.locked, relocked.current, relocked.previous, relocked.proof, { key, code, fingerprint: found.fingerprint });
    return stored === null ? null : refusal(stored);
  } catch (e) {
    if (e instanceof WrongPassphrase) return PAIR_MESSAGES.wrong;
    if (e instanceof NoKeyring) return PAIR_MESSAGES.noKeyring;
    if (e instanceof KeyringInvalid) return PAIR_MESSAGES.invalid;
    return describeFailure(e);
  }
}
