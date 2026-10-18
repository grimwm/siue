// Unlocking the keyring: the right passphrase gives non-extractable keys and the
// current public key, each derived from and proven against its private key; a
// wrong passphrase fails cleanly; a weak, malformed, mislabelled or empty
// keyring is refused.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { KeyringInvalid, STRIPPED, WrongPassphrase, lockKeyring, normalizePassphrase, unlockKeyring } from '../src/unlock.ts';
import { fingerprintOf, open, seal } from '../src/seal.ts';
import { b64, current, fx, otherKey } from './fixture-key.ts';

const note = { v: 1 as const, kind: 'text' as const, piece: 'p', draft: 1, from: 0, to: 1, fromBar: 1, toBar: 1, lane: null, text: 'hi', reaction: null, curve: null, audio: null, made: '2026-10-20T00:00:00.000Z' };

test('the right passphrase unlocks every key, non-extractable, in keyring order', async () => {
  const { ring } = await unlockKeyring(fx.keyring, fx.passphrase);
  assert.deepEqual([...ring.keys()], [fx.fingerprint, fx.other.fingerprint]);
  for (const key of ring.values()) {
    assert.equal(key.extractable, false);
    assert.deepEqual(key.usages, ['decrypt']);
    await assert.rejects(crypto.subtle.exportKey('pkcs8', key));
  }
});

test('the current key is the first entry, its spki derived from the private key and fingerprinted', async () => {
  const { current: key } = await unlockKeyring(fx.keyring, fx.passphrase);
  assert.deepEqual(key, current);
  assert.equal(await fingerprintOf(b64(key.spki)), key.fingerprint);
  const reversed = await lockKeyring([{ fingerprint: fx.other.fingerprint, pkcs8: b64(fx.other.pkcs8) }, { fingerprint: fx.fingerprint, pkcs8: b64(fx.pkcs8) }], fx.passphrase);
  assert.equal((await unlockKeyring(reversed, fx.passphrase)).current.fingerprint, fx.other.fingerprint);
});

test('a note sealed to the current key opens with the ring, and so does one sealed to a previous key', async () => {
  const unlocked = await unlockKeyring(fx.keyring, fx.passphrase);
  assert.equal((await open(await seal(note, null, unlocked.current), unlocked.ring)).body.text, 'hi');
  assert.equal((await open(await seal(note, null, otherKey), unlocked.ring)).body.text, 'hi');
});

test('a wrong passphrase fails cleanly', async () => {
  await assert.rejects(unlockKeyring(fx.keyring, 'not the passphrase'), WrongPassphrase);
  await assert.rejects(unlockKeyring(fx.keyring, ''), WrongPassphrase);
});

test('spaces around it and the Unicode form do not matter', async () => {
  // The fixture passphrase ends in "café" with a composed é; type it decomposed with a newline.
  const typed = `  ${fx.passphrase.normalize('NFD')}\n`;
  assert.notEqual(typed.trim(), fx.passphrase);
  assert.equal((await unlockKeyring(fx.keyring, typed)).ring.size, 2);
});

test('a weak or malformed keyring is refused before any key is derived', async () => {
  for (const bad of [{ iterations: 1000 }, { v: 2 }, { kdf: 'scrypt' }, { salt: 'AAAA' }, { iv: 'AAAA' }, { ct: '' }]) {
    await assert.rejects(unlockKeyring({ ...fx.keyring, ...bad } as typeof fx.keyring, fx.passphrase), KeyringInvalid, JSON.stringify(bad));
  }
});

test('an entry whose fingerprint is not its key\'s, or a repeated or empty keyring, is refused', async () => {
  const mislabelled = await lockKeyring([{ fingerprint: fx.fingerprint, pkcs8: b64(fx.other.pkcs8) }], fx.passphrase);
  await assert.rejects(unlockKeyring(mislabelled, fx.passphrase), (e: unknown) => e instanceof KeyringInvalid && e.message === `the keyring entry ${fx.fingerprint.slice(0, 16)} does not match its key`);
  const laterMislabelled = await lockKeyring([{ fingerprint: fx.fingerprint, pkcs8: b64(fx.pkcs8) }, { fingerprint: 'ab'.repeat(32), pkcs8: b64(fx.other.pkcs8) }], fx.passphrase);
  await assert.rejects(unlockKeyring(laterMislabelled, fx.passphrase), KeyringInvalid);
  const twice = await lockKeyring([{ fingerprint: fx.fingerprint, pkcs8: b64(fx.pkcs8) }, { fingerprint: fx.fingerprint, pkcs8: b64(fx.pkcs8) }], fx.passphrase);
  await assert.rejects(unlockKeyring(twice, fx.passphrase), KeyringInvalid, 'a fingerprint twice');
  const empty = await lockKeyring([], fx.passphrase);
  await assert.rejects(unlockKeyring(empty, fx.passphrase), (e: unknown) => e instanceof KeyringInvalid && e.message === 'the keyring has no keys');
});

test('a key that is not RSA-4096 is refused even when its fingerprint is right', async () => {
  const small = await crypto.subtle.generateKey({ name: 'RSA-OAEP', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' }, true, ['encrypt', 'decrypt']);
  const spki = new Uint8Array(await crypto.subtle.exportKey('spki', small.publicKey));
  const pkcs8 = new Uint8Array(await crypto.subtle.exportKey('pkcs8', small.privateKey));
  const locked = await lockKeyring([{ fingerprint: await fingerprintOf(spki), pkcs8 }], fx.passphrase);
  await assert.rejects(unlockKeyring(locked, fx.passphrase), KeyringInvalid);
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

test('more iterations than the cap are refused', async () => {
  await assert.rejects(unlockKeyring({ ...fx.keyring, iterations: 10_000_001 }, fx.passphrase), KeyringInvalid);
});

test('the passphrase is stripped of exactly the explicit whitespace set, after NFC', () => {
  const plain = new TextEncoder().encode('abc');
  for (const pad of ['﻿', '　', ' ', ' ', ' ', ' \t\n\r\f\v']) {
    assert.deepEqual(normalizePassphrase(`${pad}abc${pad}`), plain, JSON.stringify(pad));
  }
  assert.deepEqual(normalizePassphrase('a　b'), new TextEncoder().encode('a　b'), 'inside is kept');
  assert.deepEqual(normalizePassphrase('​abc'), new TextEncoder().encode('​abc'), 'a zero-width space is not in the set');
  assert.ok(STRIPPED.includes('﻿') && STRIPPED.includes('　'));
});

test('a keyring Python locked unlocks in the browser, current key first', async () => {
  const { readFileSync } = await import('node:fs');
  const locked = JSON.parse(readFileSync(new URL('./fixtures/keyring-by-python.json', import.meta.url), 'utf8')) as typeof fx.keyring;
  const { current: key, ring } = await unlockKeyring(locked, fx.passphrase);
  assert.equal(key.fingerprint, fx.fingerprint);
  assert.deepEqual([...ring.keys()], [fx.fingerprint, fx.other.fingerprint]);
  for (const key of ring.values()) assert.equal(key.extractable, false);
});
