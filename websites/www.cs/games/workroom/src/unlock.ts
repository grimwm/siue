// Unlocking the locked keyring in the browser: PBKDF2 over the passphrase, AES-GCM, and a proof that every key pairs
// with the public key built into the page. The unlocked keys are non-extractable.
import { fingerprintOf } from './seal.ts';
import type { BuiltInKey } from './seal.ts';

export const ITERATIONS = 600_000;
export const MAX_ITERATIONS = 10_000_000;
export const KEYRING_AAD = 'siue-music-keyring-v1';
const SALT_LENGTH = 16;
const IV_LENGTH = 12;
const TAG_LENGTH = 16;
const RSA = { name: 'RSA-OAEP', hash: 'SHA-256' } as const;

export interface LockedKeyring { v: 1; kdf: 'PBKDF2-SHA-256'; iterations: number; salt: string; iv: string; ct: string }
export class WrongPassphrase extends Error {}
export class KeyringInvalid extends Error {}

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

/**
 * Unlocks the whole keyring. `known` lists the public keys built into the page, the current one first. Every entry
 * whose fingerprint is in `known` becomes a non-extractable RSA-OAEP SHA-256 private key (usages ['decrypt']) proven
 * to pair with that public key; entries the page has no public key for are skipped. The result is in keyring order.
 * KeyringInvalid when the envelope is weak or malformed, the plaintext is malformed or repeats a fingerprint, the
 * keyring lacks known[0] (the current key), or an entry does not pair with its public key; WrongPassphrase when
 * the passphrase does not decrypt it.
 */
export async function unlockKeyring(locked: LockedKeyring, passphrase: string, known: readonly BuiltInKey[]): Promise<Map<string, CryptoKey>> {
  const current = known[0];
  if (current === undefined) throw new KeyringInvalid('the page has no notes key');
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

  const entries = parseEntries(plain);
  plain.fill(0);
  if (!entries.some((e) => e.fingerprint === current.fingerprint)) throw new KeyringInvalid('the keyring lacks the current key');

  const ring = new Map<string, CryptoKey>();
  for (const entry of entries) {
    const pub = known.find((k) => k.fingerprint === entry.fingerprint);
    try {
      if (pub !== undefined) ring.set(entry.fingerprint, await importPaired(entry.pkcs8, pub));
    } finally {
      entry.pkcs8.fill(0);
    }
  }
  return ring;
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

/** Imports the private key non-extractable and proves it decrypts what the built-in public key encrypts. */
async function importPaired(pkcs8: Uint8Array<ArrayBuffer>, pub: BuiltInKey): Promise<CryptoKey> {
  try {
    const priv = await crypto.subtle.importKey('pkcs8', pkcs8, RSA, false, ['decrypt']);
    const spki = Uint8Array.from(atob(pub.spki), (c) => c.charCodeAt(0));
    if ((await fingerprintOf(spki)) !== pub.fingerprint) throw new Error('fingerprint');
    const pubKey = await crypto.subtle.importKey('spki', spki, RSA, false, ['encrypt']);
    const probe = crypto.getRandomValues(new Uint8Array(32));
    const back = new Uint8Array(await crypto.subtle.decrypt({ name: 'RSA-OAEP' }, priv, await crypto.subtle.encrypt({ name: 'RSA-OAEP' }, pubKey, probe)));
    if (back.length !== probe.length || back.some((b, i) => b !== probe[i])) throw new Error('mismatch');
    return priv;
  } catch {
    throw new KeyringInvalid(`the key ${pub.fingerprint} does not pair with its public key`);
  }
}

/** The format Python's lock_keyring writes (current key first); the page never locks, tests and fixtures do. */
export async function lockKeyring(keys: readonly { fingerprint: string; pkcs8: Uint8Array<ArrayBuffer> }[], passphrase: string): Promise<LockedKeyring> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const aes = await deriveKey(passphrase, salt, ITERATIONS, 'encrypt');
  const plain = new TextEncoder().encode(JSON.stringify({ v: 1, keys: keys.map((k) => ({ fingerprint: k.fingerprint, pkcs8: toBase64(k.pkcs8) })) }));
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv, additionalData: new TextEncoder().encode(KEYRING_AAD) }, aes, plain));
  return { v: 1, kdf: 'PBKDF2-SHA-256', iterations: ITERATIONS, salt: toBase64(salt), iv: toBase64(iv), ct: toBase64(ct) };
}
