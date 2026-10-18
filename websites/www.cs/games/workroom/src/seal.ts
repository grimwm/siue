// Sealing a note in the browser: a fresh AES-256-GCM key encrypts the note, RSA-OAEP (SHA-256) wraps that key to the
// current public key of the unlocked keyring, and the header names the key the note was sealed to. The server only
// ever stores the result.
import type { NoteBody } from './note.ts';
import { NOTE_KINDS, REACTION_IDS } from './note.ts';

export const MAGIC = 'SIUEN1';
const MAGIC_BYTES = new TextEncoder().encode(MAGIC);
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

/** The fingerprint a bundle's header names, or null when the bundle is too short or is not a sealed note. */
export function headerFingerprint(bundle: Uint8Array): string | null {
  if (bundle.length < HEADER_LENGTH) return null;
  for (let i = 0; i < MAGIC_BYTES.length; i++) if (bundle[i] !== MAGIC_BYTES[i]) return null;
  return toHex(bundle.subarray(MAGIC_BYTES.length, MAGIC_BYTES.length + FP_LENGTH));
}

/** The key comes from the unlocked keyring (`unlocked.current`), never from the page. Checks its fingerprint first; throws FingerprintMismatch and seals nothing when it differs. */
export async function seal(body: NoteBody, audio: Uint8Array<ArrayBuffer> | null, key: PublicKey): Promise<Uint8Array<ArrayBuffer>> {
  const spki = fromBase64(key.spki);
  if ((await fingerprintOf(spki)) !== key.fingerprint) throw new FingerprintMismatch('the public key does not match its fingerprint');
  const pub = await crypto.subtle.importKey('spki', spki, { name: 'RSA-OAEP', hash: 'SHA-256' }, false, ['encrypt']);
  if ((pub.algorithm as RsaHashedKeyAlgorithm).modulusLength !== RSA_BITS) throw new FingerprintMismatch(`the public key is not RSA-${RSA_BITS}`);
  const aes = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt']);
  const wrapped = new Uint8Array(await crypto.subtle.encrypt({ name: 'RSA-OAEP' }, pub, await crypto.subtle.exportKey('raw', aes)));

  const header = new Uint8Array(HEADER_LENGTH);
  header.set(MAGIC_BYTES, 0);
  header.set(Uint8Array.from(key.fingerprint.match(/../g) ?? [], (h) => parseInt(h, 16)), MAGIC_BYTES.length);
  new DataView(header.buffer).setUint16(MAGIC_BYTES.length + FP_LENGTH, wrapped.length);

  const json = new TextEncoder().encode(JSON.stringify(body));
  const audioBytes = audio ?? new Uint8Array(0);
  const plain = new Uint8Array(4 + json.length + audioBytes.length);
  new DataView(plain.buffer).setUint32(0, json.length);
  plain.set(json, 4);
  plain.set(audioBytes, 4 + json.length);

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

function isNoteBody(x: unknown): x is NoteBody {
  if (typeof x !== 'object' || x === null) return false;
  const b = x as Record<string, unknown>;
  const num = (v: unknown): boolean => typeof v === 'number' && Number.isFinite(v);
  const numOrNull = (v: unknown): boolean => v === null || num(v);
  const strOrNull = (v: unknown): boolean => v === null || typeof v === 'string';
  const curve = b['curve'];
  const audio = b['audio'] as Record<string, unknown> | null;
  return b['v'] === 1 && NOTE_KINDS.includes(b['kind'] as never)
    && typeof b['piece'] === 'string' && num(b['draft']) && num(b['from']) && num(b['to'])
    && numOrNull(b['fromBar']) && numOrNull(b['toBar']) && strOrNull(b['lane']) && strOrNull(b['text'])
    && typeof b['made'] === 'string'
    && (b['reaction'] === null || REACTION_IDS.includes(b['reaction'] as never))
    && (curve === null || (Array.isArray(curve) && curve.every((p) => Array.isArray(p) && p.length === 2 && num(p[0]) && num(p[1]))))
    && (audio === null || (typeof audio === 'object' && typeof audio['mime'] === 'string' && num(audio['seconds'])));
}

/** Picks the key the bundle's header names out of the keyring. */
export async function open(bundle: Uint8Array<ArrayBuffer>, keyring: ReadonlyMap<string, CryptoKey>): Promise<Opened> {
  const fingerprint = headerFingerprint(bundle);
  if (fingerprint === null) throw new NoteUnreadable('format');
  const wrappedLength = new DataView(bundle.buffer, bundle.byteOffset, bundle.byteLength).getUint16(MAGIC_BYTES.length + FP_LENGTH);
  const ivAt = HEADER_LENGTH + wrappedLength;
  if (wrappedLength === 0 || bundle.length < ivAt + IV_LENGTH + TAG_LENGTH) throw new NoteUnreadable('format');
  const priv = keyring.get(fingerprint);
  if (priv === undefined) throw new NoteUnreadable('unknown-key');
  try {
    const aad = bundle.slice(0, AAD_LENGTH);
    const rawKey = await crypto.subtle.decrypt({ name: 'RSA-OAEP' }, priv, bundle.slice(HEADER_LENGTH, ivAt));
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
