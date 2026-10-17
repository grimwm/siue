// The committed TEST key pairs (tools/make-fixtures.ts): used by nothing but tests.
// `fx` is the current key; `fx.other` is an earlier key a rotation retained. Both are in fx.keyring.
import { readFileSync } from 'node:fs';
import type { LockedKeyring } from '../src/unlock.ts';
import type { BuiltInKey } from '../src/seal.ts';

export interface TestKey { label: string; fingerprint: string; spki: string; pkcs8: string; passphrase: string; keyring: LockedKeyring; other: { fingerprint: string; spki: string; pkcs8: string } }
export const fx = JSON.parse(readFileSync(new URL('./fixtures/test-key.json', import.meta.url), 'utf8')) as TestKey;
export const builtIn: BuiltInKey = { fingerprint: fx.fingerprint, spki: fx.spki };
export const otherKey: BuiltInKey = { fingerprint: fx.other.fingerprint, spki: fx.other.spki };
export const b64 = (s: string): Uint8Array<ArrayBuffer> => Uint8Array.from(Buffer.from(s, 'base64'));
export const hex = (s: string): Uint8Array<ArrayBuffer> => Uint8Array.from(Buffer.from(s, 'hex'));
export const importPrivate = (pkcs8: string): Promise<CryptoKey> =>
  crypto.subtle.importKey('pkcs8', b64(pkcs8), { name: 'RSA-OAEP', hash: 'SHA-256' }, false, ['decrypt']);
