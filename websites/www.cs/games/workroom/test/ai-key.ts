// An AI's sealing key for tests, made once per test file with Web Crypto (RSA-4096, exponent 65537, as the MCP makes
// it), and the TEST keyring locked again with that key as a paired AI recipient.
import { fingerprintOf } from '../src/seal.ts';
import { relockKeyring } from '../src/unlock.ts';
import type { AiRecipient, LockedKeyring } from '../src/unlock.ts';
import { fx } from './fixture-key.ts';

const toBase64 = (b: Uint8Array): string => Buffer.from(b).toString('base64');

export async function makeAiKey(key = 7): Promise<AiRecipient & { pkcs8: string; priv: CryptoKey }> {
  const pair = await crypto.subtle.generateKey({ name: 'RSA-OAEP', modulusLength: 4096, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' }, true, ['encrypt', 'decrypt']);
  const spki = new Uint8Array(await crypto.subtle.exportKey('spki', pair.publicKey));
  const pkcs8 = new Uint8Array(await crypto.subtle.exportKey('pkcs8', pair.privateKey));
  return { fingerprint: await fingerprintOf(spki), spki: toBase64(spki), key, pkcs8: toBase64(pkcs8), priv: pair.privateKey };
}

/** fx.keyring, under fx.passphrase, holding `ai` as its paired AI keys. */
export async function keyringWithAi(ai: AiRecipient[]): Promise<LockedKeyring> {
  return (await relockKeyring(fx.keyring, fx.passphrase, fx.passphrase, 'tag', () => ai.map(({ fingerprint, spki, key }) => ({ fingerprint, spki, key })))).locked;
}
