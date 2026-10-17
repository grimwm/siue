// Writes the TEST key pairs and fixtures the unit tests, the Python tests and
// the local browser check share: a current key and an earlier one a rotation
// retained, both locked in one keyring. Rerun only to replace the test keys;
// the committed files are what every test reads.
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fingerprintOf, seal } from '../src/seal.ts';
import { lockKeyring } from '../src/unlock.ts';

const dir = join(import.meta.dirname, '..', 'test', 'fixtures');
const b64 = (u: ArrayBuffer | Uint8Array) => Buffer.from(u instanceof Uint8Array ? u : new Uint8Array(u)).toString('base64');
async function pair() {
  const k = await crypto.subtle.generateKey({ name: 'RSA-OAEP', modulusLength: 4096, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' }, true, ['encrypt', 'decrypt']);
  const spki = new Uint8Array(await crypto.subtle.exportKey('spki', k.publicKey));
  const pkcs8 = new Uint8Array(await crypto.subtle.exportKey('pkcs8', k.privateKey));
  return { fingerprint: await fingerprintOf(spki), spki: b64(spki), pkcs8: b64(pkcs8), raw: pkcs8 };
}
const main = await pair();
const other = await pair();
const passphrase = 'test passphrase for the workroom fixtures, café';
const fixture = {
  label: 'TEST KEYS: used by nothing but tests. Never a real notes key.',
  fingerprint: main.fingerprint, spki: main.spki, pkcs8: main.pkcs8, passphrase,
  keyring: await lockKeyring([{ fingerprint: main.fingerprint, pkcs8: main.raw }, { fingerprint: other.fingerprint, pkcs8: other.raw }], passphrase),
  other: { fingerprint: other.fingerprint, spki: other.spki, pkcs8: other.pkcs8 },
};
writeFileSync(join(dir, 'test-key.json'), JSON.stringify(fixture, null, 2) + '\n');
const publicOf = (k: { fingerprint: string; spki: string }) => ({ fingerprint: k.fingerprint, spki: k.spki });
writeFileSync(join(dir, 'public.json'), JSON.stringify({ schema: 1, current: publicOf(main), previous: [publicOf(other)] }, null, 2) + '\n');
writeFileSync(join(dir, 'public-key.ts'), `// The test keys' public halves, built into the page only by tools/e2e-bundle.ts.\nexport const PUBLIC_KEY = ${JSON.stringify(publicOf(main))};\nexport const PREVIOUS_KEYS = [${JSON.stringify(publicOf(other))}];\n`);
const key = publicOf(main);
const base = { v: 1 as const, piece: 'test-piece', draft: 1, from: 64, to: 78, fromBar: 33, toBar: 40, lane: 'brass', reaction: null, curve: null, made: '2026-10-17T12:00:00.000Z' };
writeFileSync(join(dir, 'note-text.sealed'), await seal({ ...base, kind: 'text', text: 'Fixture note: louder at bar 33', audio: null }, null, key));
writeFileSync(join(dir, 'note-hum.sealed'), await seal({ ...base, kind: 'hum', text: null, audio: { mime: 'audio/webm', seconds: 2 } }, new Uint8Array(2048).fill(7), key));
console.log(`fixtures: test keys ${main.fingerprint} (current), ${other.fingerprint} (earlier)`);
