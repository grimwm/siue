// Making the notes key on the page: an RSA-OAEP 4096 SHA-256 key pair from Web
// Crypto, locked at once with the passphrase in the envelope unlockKeyring opens.
// The private key is extractable only inside makeNotesKey, its pkcs8 bytes are
// zeroed once locked, and nothing of the key or the passphrase is kept: the
// locked keyring goes to the server, and the page unlocks it from there.
import { fingerprintOf } from './seal.ts';
import { NoCrypto, lockKeyring, normalizePassphrase } from './unlock.ts';
import type { LockedKeyring } from './unlock.ts';

/** The fewest characters a passphrase may have, counted as the unlock reads it (NFC, ends stripped). */
export const MIN_PASSPHRASE = 12;

/** What the person is told when checkPassphrase refuses the two passphrases they typed. */
export const PASSPHRASE_MESSAGES = {
  short: `Choose a passphrase of at least ${MIN_PASSPHRASE} characters.`,
  differ: 'The two passphrases are not the same. Type it again in both fields.',
} as const;

/** Why two typed passphrases cannot make a key: too short, or not the same; null when they can. */
export function checkPassphrase(a: string, b: string): 'short' | 'differ' | null {
  const first = normalizePassphrase(a);
  if (Array.from(new TextDecoder().decode(first)).length < MIN_PASSPHRASE) return 'short';
  const second = normalizePassphrase(b);
  return first.length === second.length && first.every((x, i) => x === second[i]) ? null : 'differ';
}

/** A new notes key, locked with the passphrase, and its fingerprint (the SHA-256 of its SPKI) to upload as the current key. */
export async function makeNotesKey(passphrase: string): Promise<{ locked: LockedKeyring; current: string }> {
  if (typeof crypto === 'undefined' || !crypto.subtle) throw new NoCrypto('this browser has no Web Crypto');
  const pair = await crypto.subtle.generateKey(
    { name: 'RSA-OAEP', modulusLength: 4096, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' }, true, ['encrypt', 'decrypt']);
  const fingerprint = await fingerprintOf(new Uint8Array(await crypto.subtle.exportKey('spki', pair.publicKey)));
  const pkcs8 = new Uint8Array(await crypto.subtle.exportKey('pkcs8', pair.privateKey));
  try {
    return { locked: await lockKeyring([{ fingerprint, pkcs8 }], passphrase), current: fingerprint };
  } finally {
    pkcs8.fill(0);
  }
}
