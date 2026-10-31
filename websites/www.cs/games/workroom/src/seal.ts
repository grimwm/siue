// Sealing a note in the browser: a fresh AES-256-GCM key encrypts the note, RSA-OAEP (SHA-256) wraps that key to the
// current public key of the unlocked keyring, and the header names the key the note was sealed to (SIUEN1). A note
// for the person and their paired AI keys (sealTo) wraps the one AES key once per recipient, each wrap after its key's
// fingerprint (SIUEN2). The server only ever stores the result.
import type { NoteBody } from './note.ts';
import { isNoteBody } from './note.ts';

export const MAGIC = 'SIUEN1';
const MAGIC_BYTES = new TextEncoder().encode(MAGIC);
/** SIUEN2: the magic, a recipient count n (1..MAX_RECIPIENTS), n times (fingerprint, u16 length, wrapped key), the IV, the ciphertext. */
export const MAGIC2 = 'SIUEN2';
const MAGIC2_BYTES = new TextEncoder().encode(MAGIC2);
export const MAX_RECIPIENTS = 16;
const FP_LENGTH = 32;
const HEADER_LENGTH = MAGIC_BYTES.length + FP_LENGTH + 2; // magic, fingerprint, wrapped-key length
// The note's additional data: the magic and the fingerprint, bytes 0..37 (not the wrapped-key length after them).
const AAD_LENGTH = MAGIC_BYTES.length + FP_LENGTH;
const RSA_BITS = 4096;
const IV_LENGTH = 12;
const TAG_LENGTH = 16;

export interface PublicKey { fingerprint: string; spki: string } // spki: base64 DER

export class FingerprintMismatch extends Error {}
export class NoteUnreadable extends Error {
  readonly reason: 'format' | 'unknown-key' | 'tampered';
  constructor(reason: 'format' | 'unknown-key' | 'tampered') {
    super(`note unreadable: ${reason}`);
    this.reason = reason;
  }
}

const toHex = (bytes: Uint8Array): string => Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
const fromBase64 = (s: string): Uint8Array<ArrayBuffer> => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

export async function fingerprintOf(spkiDer: Uint8Array<ArrayBuffer>): Promise<string> {
  return toHex(new Uint8Array(await crypto.subtle.digest('SHA-256', spkiDer)));
}

const startsWith = (bundle: Uint8Array, magic: Uint8Array): boolean => bundle.length >= magic.length && magic.every((b, i) => bundle[i] === b);

/** The fingerprint a SIUEN1 bundle's header names, or null when the bundle is too short or is not a SIUEN1 note. */
export function headerFingerprint(bundle: Uint8Array): string | null {
  if (bundle.length < HEADER_LENGTH || !startsWith(bundle, MAGIC_BYTES)) return null;
  return toHex(bundle.subarray(MAGIC_BYTES.length, MAGIC_BYTES.length + FP_LENGTH));
}

interface Wrap { fingerprint: string; wrapped: Uint8Array<ArrayBuffer> }

/** A SIUEN2 bundle's recipients, its additional data and where its IV starts; null when the header is malformed. */
export function siuen2Header(bundle: Uint8Array<ArrayBuffer>): { wraps: Wrap[]; aad: Uint8Array<ArrayBuffer>; ivAt: number } | null {
  if (!startsWith(bundle, MAGIC2_BYTES) || bundle.length < MAGIC2_BYTES.length + 1) return null;
  const n = bundle[MAGIC2_BYTES.length]!;
  if (n < 1 || n > MAX_RECIPIENTS) return null;
  const view = new DataView(bundle.buffer, bundle.byteOffset, bundle.byteLength);
  let at = MAGIC2_BYTES.length + 1;
  const wraps: Wrap[] = [];
  for (let i = 0; i < n; i++) {
    if (at + FP_LENGTH + 2 > bundle.length) return null;
    const fingerprint = toHex(bundle.subarray(at, at + FP_LENGTH));
    const length = view.getUint16(at + FP_LENGTH);
    at += FP_LENGTH + 2;
    if (length === 0 || at + length > bundle.length || wraps.some(w => w.fingerprint === fingerprint)) return null;
    wraps.push({ fingerprint, wrapped: bundle.slice(at, at + length) });
    at += length;
  }
  if (at + IV_LENGTH + TAG_LENGTH > bundle.length) return null;
  const aad = new Uint8Array(MAGIC2_BYTES.length + 1 + n * FP_LENGTH);
  aad.set(MAGIC2_BYTES, 0);
  aad[MAGIC2_BYTES.length] = n;
  wraps.forEach((w, i) => aad.set(fromHex(w.fingerprint), MAGIC2_BYTES.length + 1 + i * FP_LENGTH));
  return { wraps, aad, ivAt: at };
}

const fromHex = (hex: string): Uint8Array<ArrayBuffer> => Uint8Array.from(hex.match(/../g) ?? [], (h) => parseInt(h, 16));

/** The RSA-OAEP public key of `key`, checked against its fingerprint and the modulus; FingerprintMismatch otherwise. */
async function importRecipient(key: PublicKey): Promise<CryptoKey> {
  const spki = fromBase64(key.spki);
  if ((await fingerprintOf(spki)) !== key.fingerprint) throw new FingerprintMismatch('the public key does not match its fingerprint');
  const pub = await crypto.subtle.importKey('spki', spki, { name: 'RSA-OAEP', hash: 'SHA-256' }, false, ['encrypt']);
  if ((pub.algorithm as RsaHashedKeyAlgorithm).modulusLength !== RSA_BITS) throw new FingerprintMismatch(`the public key is not RSA-${RSA_BITS}`);
  return pub;
}

const plaintext = (body: NoteBody, audio: Uint8Array<ArrayBuffer> | null): Uint8Array<ArrayBuffer> => {
  const json = new TextEncoder().encode(JSON.stringify(body));
  const audioBytes = audio ?? new Uint8Array(0);
  const plain = new Uint8Array(4 + json.length + audioBytes.length);
  new DataView(plain.buffer).setUint32(0, json.length);
  plain.set(json, 4);
  plain.set(audioBytes, 4 + json.length);
  return plain;
};

/**
 * Seals to every key in `keys`, the person's current key first: SIUEN1 for that key alone, SIUEN2 with the AI keys.
 * Each key is checked against its fingerprint first (FingerprintMismatch, nothing sealed); a repeated fingerprint or
 * more than MAX_RECIPIENTS keys throws.
 */
export async function sealTo(body: NoteBody, audio: Uint8Array<ArrayBuffer> | null, keys: readonly PublicKey[]): Promise<Uint8Array<ArrayBuffer>> {
  if (keys.length === 1) return seal(body, audio, keys[0]!);
  if (keys.length < 1 || keys.length > MAX_RECIPIENTS || new Set(keys.map(k => k.fingerprint)).size !== keys.length) throw new Error('a note is sealed to 1 to 16 distinct keys');
  const pubs = await Promise.all(keys.map(importRecipient));
  const aes = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt']);
  const raw = await crypto.subtle.exportKey('raw', aes);
  const wraps = await Promise.all(pubs.map(async (pub) => new Uint8Array(await crypto.subtle.encrypt({ name: 'RSA-OAEP' }, pub, raw))));
  const headerLength = MAGIC2_BYTES.length + 1 + wraps.reduce((n, w) => n + FP_LENGTH + 2 + w.length, 0);
  const header = new Uint8Array(headerLength);
  const view = new DataView(header.buffer);
  header.set(MAGIC2_BYTES, 0);
  header[MAGIC2_BYTES.length] = keys.length;
  let at = MAGIC2_BYTES.length + 1;
  keys.forEach((k, i) => {
    header.set(fromHex(k.fingerprint), at);
    view.setUint16(at + FP_LENGTH, wraps[i]!.length);
    header.set(wraps[i]!, at + FP_LENGTH + 2);
    at += FP_LENGTH + 2 + wraps[i]!.length;
  });
  const { aad } = siuen2Header(new Uint8Array([...header, ...new Uint8Array(IV_LENGTH + TAG_LENGTH)]))!;
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv, additionalData: aad }, aes, plaintext(body, audio)));
  const out = new Uint8Array(header.length + iv.length + ct.length);
  out.set(header, 0);
  out.set(iv, header.length);
  out.set(ct, header.length + iv.length);
  return out;
}

/** The key comes from the unlocked keyring (`unlocked.current`), never from the page. Checks its fingerprint first; throws FingerprintMismatch and seals nothing when it differs. */
export async function seal(body: NoteBody, audio: Uint8Array<ArrayBuffer> | null, key: PublicKey): Promise<Uint8Array<ArrayBuffer>> {
  const pub = await importRecipient(key);
  const aes = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt']);
  const wrapped = new Uint8Array(await crypto.subtle.encrypt({ name: 'RSA-OAEP' }, pub, await crypto.subtle.exportKey('raw', aes)));

  const header = new Uint8Array(HEADER_LENGTH);
  header.set(MAGIC_BYTES, 0);
  header.set(Uint8Array.from(key.fingerprint.match(/../g) ?? [], (h) => parseInt(h, 16)), MAGIC_BYTES.length);
  new DataView(header.buffer).setUint16(MAGIC_BYTES.length + FP_LENGTH, wrapped.length);

  const plain = plaintext(body, audio);

  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv, additionalData: header.subarray(0, AAD_LENGTH) }, aes, plain));

  const out = new Uint8Array(header.length + wrapped.length + iv.length + ct.length);
  out.set(header, 0);
  out.set(wrapped, header.length);
  out.set(iv, header.length + wrapped.length);
  out.set(ct, header.length + wrapped.length + iv.length);
  return out;
}

export interface Opened { fingerprint: string; body: NoteBody; audio: Uint8Array<ArrayBuffer> | null }

/** Picks the key the bundle's header names (SIUEN1), or the first recipient the keyring holds (SIUEN2), out of the keyring. */
export async function open(bundle: Uint8Array<ArrayBuffer>, keyring: ReadonlyMap<string, CryptoKey>): Promise<Opened> {
  let fingerprint: string;
  let wrapped: Uint8Array<ArrayBuffer>;
  let aad: Uint8Array<ArrayBuffer>;
  let ivAt: number;
  if (startsWith(bundle, MAGIC2_BYTES)) {
    const header = siuen2Header(bundle);
    if (header === null) throw new NoteUnreadable('format');
    const mine = header.wraps.find(w => keyring.has(w.fingerprint));
    if (mine === undefined) throw new NoteUnreadable('unknown-key');
    ({ fingerprint, wrapped } = mine);
    ({ aad, ivAt } = header);
  } else {
    const named = headerFingerprint(bundle);
    if (named === null) throw new NoteUnreadable('format');
    const wrappedLength = new DataView(bundle.buffer, bundle.byteOffset, bundle.byteLength).getUint16(MAGIC_BYTES.length + FP_LENGTH);
    ivAt = HEADER_LENGTH + wrappedLength;
    if (wrappedLength === 0 || bundle.length < ivAt + IV_LENGTH + TAG_LENGTH) throw new NoteUnreadable('format');
    fingerprint = named;
    wrapped = bundle.slice(HEADER_LENGTH, ivAt);
    aad = bundle.slice(0, AAD_LENGTH);
  }
  const priv = keyring.get(fingerprint);
  if (priv === undefined) throw new NoteUnreadable('unknown-key');
  try {
    const rawKey = await crypto.subtle.decrypt({ name: 'RSA-OAEP' }, priv, wrapped);
    const aes = await crypto.subtle.importKey('raw', rawKey, { name: 'AES-GCM' }, false, ['decrypt']);
    const iv = bundle.slice(ivAt, ivAt + IV_LENGTH);
    const plain = new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-GCM', iv, additionalData: aad }, aes, bundle.slice(ivAt + IV_LENGTH)));
    const jsonLength = new DataView(plain.buffer).getUint32(0);
    if (plain.length < 4 + jsonLength) throw new NoteUnreadable('tampered');
    const body: unknown = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(plain.subarray(4, 4 + jsonLength)));
    if (!isNoteBody(body)) throw new NoteUnreadable('tampered');
    const rest = plain.slice(4 + jsonLength);
    return { fingerprint, body, audio: rest.length > 0 ? rest : null };
  } catch (e) {
    if (e instanceof NoteUnreadable) throw e;
    throw new NoteUnreadable('tampered');
  }
}
