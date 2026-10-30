// The notes key made on the page: an RSA-4096 key pair from Web Crypto, locked
// with the passphrase in the same envelope unlock.ts opens, and named by the
// SHA-256 of its SPKI. RSA-4096 is slow to make, so one key serves every test.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { MIN_PASSPHRASE, checkPassphrase, makeNotesKey } from '../src/keymaker.ts';
import { open, seal } from '../src/seal.ts';
import { ITERATIONS, WrongPassphrase, unlockKeyring } from '../src/unlock.ts';
import { b64 } from './fixture-key.ts';

const PASSPHRASE = 'correct horse battery staple';
const made = await makeNotesKey(PASSPHRASE);
const note = { v: 1 as const, kind: 'text' as const, piece: 'p', draft: 1, from: 0, to: 1, fromBar: 1, toBar: 1, lane: null, text: 'made here', reaction: null, curve: null, audio: null, made: '2026-10-30T00:00:00.000Z' };

test('a made key unlocks with its passphrase and seals a note that opens', async () => {
  const unlocked = await unlockKeyring(made.locked, PASSPHRASE);
  assert.deepEqual([...unlocked.ring.keys()], [made.current]);
  assert.equal(unlocked.ring.get(made.current)!.extractable, false);
  assert.equal((await open(await seal(note, null, unlocked.current), unlocked.ring)).body.text, 'made here');
});

test('the fingerprint uploaded is the SPKI SHA-256 of the key', async () => {
  const { current } = await unlockKeyring(made.locked, PASSPHRASE);
  assert.match(made.current, /^[0-9a-f]{64}$/);
  assert.equal(current.fingerprint, made.current);
  assert.equal(createHash('sha256').update(b64(current.spki)).digest('hex'), made.current);
  const spki = await crypto.subtle.importKey('spki', b64(current.spki), { name: 'RSA-OAEP', hash: 'SHA-256' }, true, ['encrypt']);
  assert.equal((spki.algorithm as RsaHashedKeyAlgorithm).modulusLength, 4096);
});

test('the envelope is PBKDF2-SHA-256 at 600000 rounds', () => {
  assert.equal(ITERATIONS, 600_000);
  assert.equal(made.locked.v, 1);
  assert.equal(made.locked.kdf, 'PBKDF2-SHA-256');
  assert.equal(made.locked.iterations, 600_000);
  assert.deepEqual(Object.keys(made.locked).sort(), ['ct', 'iterations', 'iv', 'kdf', 'salt', 'v']);
});

test('a wrong passphrase does not unlock it', async () => {
  await assert.rejects(unlockKeyring(made.locked, 'correct horse battery stapler'), WrongPassphrase);
});

test('passphrases under 12 characters or not matching are refused', () => {
  assert.equal(MIN_PASSPHRASE, 12);
  assert.equal(checkPassphrase('', ''), 'short');
  assert.equal(checkPassphrase('elevenchars', 'elevenchars'), 'short');
  assert.equal(checkPassphrase('  elevenchars  ', '  elevenchars  '), 'short', 'spaces at the ends are not counted: the unlock strips them');
  assert.equal(checkPassphrase('twelve chars', 'twelve chars'), null);
  assert.equal(checkPassphrase('ünïcödé-twelve', 'ünïcödé-twelve'), null);
  assert.equal(checkPassphrase('twelve chars', 'twelve charz'), 'differ');
  assert.equal(checkPassphrase('twelve chars', ''), 'differ');
});
