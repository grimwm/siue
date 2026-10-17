// The vault holds unlocked keys in memory only and refuses extractable ones.
// A device that signs in after a rotation unlocks the one keyring and opens
// notes sealed to the old key and to the new one.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createVault } from '../src/vault.ts';
import { unlockKeyring } from '../src/unlock.ts';
import { open, seal } from '../src/seal.ts';
import type { NoteBody } from '../src/note.ts';
import { builtIn, fx, otherKey } from './fixture-key.ts';

const note = (text: string): NoteBody => ({ v: 1, kind: 'text', piece: 'p', draft: 1, from: 0, to: 1, fromBar: 1, toBar: 1, lane: null, text, reaction: null, curve: null, audio: null, made: '2026-10-20T00:00:00.000Z' });

test('load replaces the keyring and clear empties it', async () => {
  const v = createVault();
  assert.equal(v.keyring().size, 0);
  v.load(await unlockKeyring(fx.keyring, fx.passphrase, [builtIn, otherKey]));
  assert.ok(v.has(fx.fingerprint) && v.has(fx.other.fingerprint));
  v.load(await unlockKeyring(fx.keyring, fx.passphrase, [builtIn]));
  assert.ok(v.has(fx.fingerprint) && !v.has(fx.other.fingerprint), 'a load replaces what was there');
  v.clear();
  assert.equal(v.keyring().size, 0);
});

test('an extractable key is refused', async () => {
  const pair = await crypto.subtle.generateKey({ name: 'RSA-OAEP', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' }, true, ['encrypt', 'decrypt']);
  assert.throws(() => createVault().load(new Map([['ff'.repeat(32), pair.privateKey]])));
});

test('after a rotation a newly signed-in device opens notes sealed before and after it', async () => {
  // fx is the current key; fx.other is the earlier key the rotation retained; both are in the one keyring.
  const sealedBefore = await seal(note('sealed before the rotation'), null, otherKey);
  const sealedAfter = await seal(note('sealed after the rotation'), null, builtIn);
  const device = createVault(); // a phone that has never held a key
  assert.deepEqual(device.missing([otherKey.fingerprint, fx.fingerprint]), [otherKey.fingerprint, fx.fingerprint]);
  device.load(await unlockKeyring(fx.keyring, fx.passphrase, [builtIn, otherKey]));
  assert.deepEqual(device.missing([otherKey.fingerprint, fx.fingerprint]), []);
  assert.equal((await open(sealedBefore, device.keyring())).body.text, 'sealed before the rotation');
  assert.equal((await open(sealedAfter, device.keyring())).body.text, 'sealed after the rotation');
});

test('the keyring a caller gets is a copy: changing it leaves the vault alone', async () => {
  const v = createVault();
  v.load(await unlockKeyring(fx.keyring, fx.passphrase, [builtIn, otherKey]));
  const view = v.keyring() as Map<string, CryptoKey>;
  view.delete(fx.fingerprint);
  view.set('00'.repeat(32), view.get(fx.other.fingerprint)!);
  assert.ok(v.has(fx.fingerprint));
  assert.ok(!v.has('00'.repeat(32)));
  assert.equal(v.keyring().size, 2);
});
