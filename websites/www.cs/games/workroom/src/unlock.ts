// Unlocking the locked keyring in the browser: PBKDF2 over the passphrase, AES-GCM, and the public half of every key
// derived from the private key itself, so the key notes are sealed to is vouched for by the passphrase. The unlocked
// keys are non-extractable.
import { fingerprintOf } from './seal.ts';
import type { PublicKey } from './seal.ts';

export const ITERATIONS = 600_000;
export const MAX_ITERATIONS = 10_000_000;
export const KEYRING_AAD = 'siue-music-keyring-v1';
const SALT_LENGTH = 16;
const IV_LENGTH = 12;
const TAG_LENGTH = 16;
const RSA = { name: 'RSA-OAEP', hash: 'SHA-256' } as const;
const RSA_BITS = 4096;

export interface LockedKeyring { v: 1; kdf: 'PBKDF2-SHA-256'; iterations: number; salt: string; iv: string; ct: string }
export class WrongPassphrase extends Error {}
export class KeyringInvalid extends Error {}
/** This browser has no Web Crypto (an old browser, or a page not served over https). */
export class NoCrypto extends Error {}

/** The characters stripped from both ends of a passphrase: an explicit set, so Python strips exactly the same. */
export const STRIPPED = ' \t\n\r\f\v\u00A0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF';

/** NFC-normalised, stripped of STRIPPED at both ends, UTF-8: the same bytes Python derives from the same passphrase. */
export function normalizePassphrase(p: string): Uint8Array<ArrayBuffer> {
  const chars = Array.from(p.normalize('NFC'));
  let start = 0;
  let end = chars.length;
  while (start < end && STRIPPED.includes(chars[start]!)) start++;
  while (end > start && STRIPPED.includes(chars[end - 1]!)) end--;
  return new TextEncoder().encode(chars.slice(start, end).join(''));
}

const toBase64 = (b: Uint8Array): string => btoa(String.fromCharCode(...b));
const BASE64 = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

function fromBase64(s: unknown): Uint8Array<ArrayBuffer> | null {
  if (typeof s !== 'string' || !BASE64.test(s)) return null;
  return Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
}

async function deriveKey(passphrase: string, salt: Uint8Array<ArrayBuffer>, iterations: number, usage: 'encrypt' | 'decrypt'): Promise<CryptoKey> {
  const base = await crypto.subtle.importKey('raw', normalizePassphrase(passphrase), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations }, base, { name: 'AES-GCM', length: 256 }, false, [usage]);
}

export interface Unlocked {
  /** The public key to seal new notes to: the keyring's first entry. */
  current: PublicKey;
  /** Every entry's non-extractable RSA-OAEP SHA-256 private key (usages ['decrypt']), by fingerprint, in keyring order. */
  ring: Map<string, CryptoKey>;
}

/**
 * Unlocks the whole keyring. Each entry's public half is derived from its private key and its SHA-256 SPKI
 * fingerprint must equal the entry's; the private key is then proven to decrypt what that public half encrypts.
 * The first entry is the current key. KeyringInvalid when the envelope is weak or malformed, the plaintext is
 * malformed, empty or repeats a fingerprint, or an entry is not RSA-4096 or does not match its fingerprint;
 * WrongPassphrase when the passphrase does not decrypt it.
 */
export async function unlockKeyring(locked: LockedKeyring, passphrase: string): Promise<Unlocked> {
  const entries = await openEntries(locked, passphrase);
  const ring = new Map<string, CryptoKey>();
  let current: PublicKey | undefined;
  try {
    for (const entry of entries) {
      const { pub, priv } = await importPaired(entry);
      current ??= pub;
      ring.set(entry.fingerprint, priv);
    }
  } finally {
    for (const entry of entries) entry.pkcs8.fill(0);
  }
  return { current: current!, ring };
}

/**
 * A new passphrase for the same keys: opens the keyring with `passphrase`, checks every entry against its fingerprint
 * as unlockKeyring does, and locks the same entries, in the same order, with `next` (a fresh salt and IV). `current`
 * and `previous` are the fingerprints the server must already hold. The private keys' bytes are zeroed once locked.
 * WrongPassphrase and KeyringInvalid as unlockKeyring.
 */
export async function relockKeyring(locked: LockedKeyring, passphrase: string, next: string): Promise<{ locked: LockedKeyring; current: string; previous: string[] }> {
  const entries = await openEntries(locked, passphrase);
  try {
    for (const entry of entries) await importPaired(entry);
    const fingerprints = entries.map(e => e.fingerprint);
    return { locked: await lockKeyring(entries, next), current: fingerprints[0]!, previous: fingerprints.slice(1) };
  } finally {
    for (const entry of entries) entry.pkcs8.fill(0);
  }
}

/** The keyring's entries, opened with the passphrase: at least one, none repeated. The caller zeroes their pkcs8 bytes. */
async function openEntries(locked: LockedKeyring, passphrase: string): Promise<{ fingerprint: string; pkcs8: Uint8Array<ArrayBuffer> }[]> {
  if (typeof crypto === 'undefined' || !crypto.subtle) throw new NoCrypto('this browser has no Web Crypto');
  const salt = fromBase64(locked.salt);
  const iv = fromBase64(locked.iv);
  const ct = fromBase64(locked.ct);
  if (locked.v !== 1 || locked.kdf !== 'PBKDF2-SHA-256' || !Number.isInteger(locked.iterations) || locked.iterations < ITERATIONS || locked.iterations > MAX_ITERATIONS
    || salt?.length !== SALT_LENGTH || iv?.length !== IV_LENGTH || ct === null || ct.length < TAG_LENGTH + 1) {
    throw new KeyringInvalid('the keyring envelope is weak or malformed');
  }

  let plain: Uint8Array<ArrayBuffer>;
  try {
    const aes = await deriveKey(passphrase, salt, locked.iterations, 'decrypt');
    plain = new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-GCM', iv, additionalData: new TextEncoder().encode(KEYRING_AAD) }, aes, ct));
  } catch {
    throw new WrongPassphrase('the passphrase does not unlock the keyring');
  }

  let entries: { fingerprint: string; pkcs8: Uint8Array<ArrayBuffer> }[];
  try {
    entries = parseEntries(plain);
  } finally {
    plain.fill(0);
  }
  if (entries.length === 0) throw new KeyringInvalid('the keyring has no keys');
  return entries;
}

function parseEntries(plain: Uint8Array): { fingerprint: string; pkcs8: Uint8Array<ArrayBuffer> }[] {
  let data: unknown;
  try {
    data = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(plain));
  } catch {
    throw new KeyringInvalid('the keyring is not JSON');
  }
  const obj = data as { v?: unknown; keys?: unknown } | null;
  if (typeof obj !== 'object' || obj === null || obj.v !== 1 || !Array.isArray(obj.keys)) throw new KeyringInvalid('the keyring is malformed');
  const seen = new Set<string>();
  const entries: { fingerprint: string; pkcs8: Uint8Array<ArrayBuffer> }[] = [];
  for (const raw of obj.keys as unknown[]) {
    const e = raw as { fingerprint?: unknown; pkcs8?: unknown } | null;
    const pkcs8 = typeof e === 'object' && e !== null ? fromBase64(e.pkcs8) : null;
    if (typeof e !== 'object' || e === null || typeof e.fingerprint !== 'string' || !/^[0-9a-f]{64}$/.test(e.fingerprint) || pkcs8 === null || pkcs8.length === 0) {
      throw new KeyringInvalid('a keyring entry is malformed');
    }
    if (seen.has(e.fingerprint)) throw new KeyringInvalid('the keyring repeats a fingerprint');
    seen.add(e.fingerprint);
    entries.push({ fingerprint: e.fingerprint, pkcs8 });
  }
  return entries;
}

/**
 * Derives the entry's public key from its private key, checks the fingerprint and the modulus, and returns the
 * private key imported non-extractable once it is proven to decrypt what the public half encrypts. The extractable
 * import lives only long enough to export the JWK.
 */
async function importPaired(entry: { fingerprint: string; pkcs8: Uint8Array<ArrayBuffer> }): Promise<{ pub: PublicKey; priv: CryptoKey }> {
  const fail = (): KeyringInvalid => new KeyringInvalid(`the keyring entry ${entry.fingerprint.slice(0, 16)} does not match its key`);
  try {
    const temp = await crypto.subtle.importKey('pkcs8', entry.pkcs8, RSA, true, ['decrypt']);
    const jwk = await crypto.subtle.exportKey('jwk', temp);
    if (jwk.kty !== 'RSA' || typeof jwk.n !== 'string' || typeof jwk.e !== 'string') throw new Error('not RSA');
    const pubKey = await crypto.subtle.importKey('jwk', { kty: 'RSA', n: jwk.n, e: jwk.e, alg: 'RSA-OAEP-256', ext: true }, RSA, true, ['encrypt']);
    delete jwk.d; delete jwk.p; delete jwk.q; delete jwk.dp; delete jwk.dq; delete jwk.qi;
    if ((pubKey.algorithm as RsaHashedKeyAlgorithm).modulusLength !== RSA_BITS) throw new Error('modulus');
    const spki = new Uint8Array(await crypto.subtle.exportKey('spki', pubKey));
    if ((await fingerprintOf(spki)) !== entry.fingerprint) throw new Error('fingerprint');
    const priv = await crypto.subtle.importKey('pkcs8', entry.pkcs8, RSA, false, ['decrypt']);
    const probe = crypto.getRandomValues(new Uint8Array(32));
    const back = new Uint8Array(await crypto.subtle.decrypt({ name: 'RSA-OAEP' }, priv, await crypto.subtle.encrypt({ name: 'RSA-OAEP' }, pubKey, probe)));
    if (back.length !== probe.length || back.some((b, i) => b !== probe[i])) throw new Error('mismatch');
    return { pub: { fingerprint: entry.fingerprint, spki: toBase64(spki) }, priv };
  } catch {
    throw fail();
  }
}

/** The format Python's lock_keyring writes (current key first); the page locks a key it makes with it (keymaker.ts), and the same keys again under a new passphrase (relockKeyring). */
export async function lockKeyring(keys: readonly { fingerprint: string; pkcs8: Uint8Array<ArrayBuffer> }[], passphrase: string): Promise<LockedKeyring> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const aes = await deriveKey(passphrase, salt, ITERATIONS, 'encrypt');
  const plain = new TextEncoder().encode(JSON.stringify({ v: 1, keys: keys.map((k) => ({ fingerprint: k.fingerprint, pkcs8: toBase64(k.pkcs8) })) }));
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv, additionalData: new TextEncoder().encode(KEYRING_AAD) }, aes, plain));
  return { v: 1, kdf: 'PBKDF2-SHA-256', iterations: ITERATIONS, salt: toBase64(salt), iv: toBase64(iv), ct: toBase64(ct) };
}
