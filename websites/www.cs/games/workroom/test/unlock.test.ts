// Unlocking the keyring: the right passphrase gives non-extractable keys, each
// proven to pair with its built-in public key; a wrong one fails cleanly; a
// weak, malformed, swapped or incomplete keyring is refused.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { KeyringInvalid, WrongPassphrase, lockKeyring, unlockKeyring } from '../src/unlock.ts';
import { open, seal } from '../src/seal.ts';
import { b64, builtIn, fx, otherKey } from './fixture-key.ts';

const note = { v: 1 as const, kind: 'text' as const, piece: 'p', draft: 1, from: 0, to: 1, fromBar: 1, toBar: 1, lane: null, text: 'hi', reaction: null, curve: null, audio: null, made: '2026-10-20T00:00:00.000Z' };

test('the right passphrase unlocks every known key, non-extractable, in keyring order', async () => {
  const ring = await unlockKeyring(fx.keyring, fx.passphrase, [builtIn, otherKey]);
  assert.deepEqual([...ring.keys()], [fx.fingerprint, fx.other.fingerprint]);
  for (const key of ring.values()) {
    assert.equal(key.extractable, false);
    assert.deepEqual(key.usages, ['decrypt']);
    await assert.rejects(crypto.subtle.exportKey('pkcs8', key));
  }
  assert.equal((await open(await seal(note, null, builtIn), ring)).body.text, 'hi');
  assert.equal((await open(await seal(note, null, otherKey), ring)).body.text, 'hi');
});

test('a wrong passphrase fails cleanly', async () => {
  await assert.rejects(unlockKeyring(fx.keyring, 'not the passphrase', [builtIn, otherKey]), WrongPassphrase);
  await assert.rejects(unlockKeyring(fx.keyring, '', [builtIn, otherKey]), WrongPassphrase);
});

test('spaces around it and the Unicode form do not matter', async () => {
  // The fixture passphrase ends in "café" with a composed é; type it decomposed with a newline.
  const typed = `  ${fx.passphrase.normalize('NFD')}\n`;
  assert.notEqual(typed.trim(), fx.passphrase);
  assert.equal((await unlockKeyring(fx.keyring, typed, [builtIn])).size, 1);
});

test('keys the page has no public key for are skipped', async () => {
  const ring = await unlockKeyring(fx.keyring, fx.passphrase, [builtIn]);
  assert.deepEqual([...ring.keys()], [fx.fingerprint]);
});

test('a weak or malformed keyring is refused before any key is derived', async () => {
  for (const bad of [{ iterations: 1000 }, { v: 2 }, { kdf: 'scrypt' }, { salt: 'AAAA' }, { iv: 'AAAA' }, { ct: '' }]) {
    await assert.rejects(unlockKeyring({ ...fx.keyring, ...bad } as typeof fx.keyring, fx.passphrase, [builtIn]), KeyringInvalid, JSON.stringify(bad));
  }
});

test('a keyring without the current key, or with a key that does not pair, is refused', async () => {
  const onlyOld = await lockKeyring([{ fingerprint: fx.other.fingerprint, pkcs8: b64(fx.other.pkcs8) }], fx.passphrase);
  await assert.rejects(unlockKeyring(onlyOld, fx.passphrase, [builtIn, otherKey]), KeyringInvalid, 'the current key is missing');
  await assert.rejects(unlockKeyring(fx.keyring, fx.passphrase, []), KeyringInvalid, 'the page has no key at all');
  const swapped = await lockKeyring([{ fingerprint: fx.fingerprint, pkcs8: b64(fx.other.pkcs8) }], fx.passphrase);
  await assert.rejects(unlockKeyring(swapped, fx.passphrase, [builtIn]), KeyringInvalid, 'unlocks, but to a key that does not pair with the public key');
  const twice = await lockKeyring([{ fingerprint: fx.fingerprint, pkcs8: b64(fx.pkcs8) }, { fingerprint: fx.fingerprint, pkcs8: b64(fx.pkcs8) }], fx.passphrase);
  await assert.rejects(unlockKeyring(twice, fx.passphrase, [builtIn]), KeyringInvalid, 'a fingerprint twice');
});

test('lockKeyring writes standard padded base64 with no line breaks, as the server checks it', async () => {
  // 16 bytes of salt encode to 24 characters ending "==", 12 bytes of IV to 16 with none; ct is arbitrary length.
  const pkcs8 = new Uint8Array([1, 2, 3, 4, 5, 6, 7]);
  const locked = await lockKeyring([{ fingerprint: 'ab'.repeat(32), pkcs8 }], fx.passphrase);
  assert.deepEqual(Object.keys(locked).sort(), ['ct', 'iterations', 'iv', 'kdf', 'salt', 'v']);
  assert.equal(locked.iterations, 600_000);
  assert.match(locked.salt, /^[A-Za-z0-9+/]{22}==$/);
  assert.match(locked.iv, /^[A-Za-z0-9+/]{16}$/);
  for (const field of [locked.salt, locked.iv, locked.ct]) {
    assert.match(field, /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/);
    assert.equal(Buffer.from(field, 'base64').toString('base64'), field, 'round-trips exactly');
  }
});
