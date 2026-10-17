// Sealing: a round trip gives back the note and its audio; the words never
// appear in the bundle; a public key whose fingerprint differs from the
// built-in one is refused; tampering fails with a reason, never a crash.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { constants, createDecipheriv, createPrivateKey, createPublicKey, privateDecrypt, publicEncrypt } from 'node:crypto';
import { FingerprintMismatch, NoteUnreadable, fingerprintOf, headerFingerprint, open, seal } from '../src/seal.ts';
import type { NoteBody } from '../src/note.ts';
import { b64, builtIn, fx, hex, importPrivate } from './fixture-key.ts';

const body: NoteBody = {
  v: 1, kind: 'text', piece: 'test-piece', draft: 1, from: 8, to: 12, fromBar: 5, toBar: 6, lane: 'brass',
  text: 'louder and slower right here', reaction: null, curve: null, audio: null, made: '2026-10-20T14:03:11.000Z',
};
const isReason = (r: NoteUnreadable['reason']) => (e: unknown) => e instanceof NoteUnreadable && e.reason === r;

test('the fingerprint is the SHA-256 of the SPKI DER', async () => {
  assert.equal(await fingerprintOf(b64(fx.spki)), fx.fingerprint);
});

test('seal then open gives back the note and its audio', async () => {
  const audio = new Uint8Array([1, 2, 3, 4, 5]);
  const bundle = await seal({ ...body, kind: 'hum', audio: { mime: 'audio/webm', seconds: 1 } }, audio, builtIn);
  assert.equal(new TextDecoder().decode(bundle.slice(0, 6)), 'SIUEN1');
  assert.equal(headerFingerprint(bundle), fx.fingerprint);
  assert.equal((bundle[38]! << 8) | bundle[39]!, 512, 'RSA-4096 wraps to 512 bytes');
  const opened = await open(bundle, new Map([[fx.fingerprint, await importPrivate(fx.pkcs8)]]));
  assert.equal(opened.fingerprint, fx.fingerprint);
  assert.deepEqual(opened.body, { ...body, kind: 'hum', audio: { mime: 'audio/webm', seconds: 1 } });
  assert.deepEqual([...(opened.audio ?? [])], [1, 2, 3, 4, 5]);
});

test('a note on a sound effect carries seconds only', async () => {
  const sound: NoteBody = { ...body, piece: 'cannon-fire', from: 0.02, to: 0.2, fromBar: null, toBar: null, lane: 'boom', text: 'a sharper attack' };
  const opened = await open(await seal(sound, null, builtIn), new Map([[fx.fingerprint, await importPrivate(fx.pkcs8)]]));
  assert.deepEqual(opened.body, sound);
  assert.deepEqual([opened.body.fromBar, opened.body.toBar], [null, null]);
});

test('the words are not in the bundle, and two seals differ', async () => {
  const a = await seal(body, null, builtIn);
  const b = await seal(body, null, builtIn);
  assert.ok(!Buffer.from(a).includes(Buffer.from('louder')));
  assert.notDeepEqual(a, b);
});

test('a public key whose fingerprint differs from the built-in one is refused', async () => {
  await assert.rejects(seal(body, null, { fingerprint: fx.fingerprint, spki: fx.other.spki }), FingerprintMismatch);
});

test('open picks the key the header names out of a keyring of several', async () => {
  const keyring = new Map([[fx.fingerprint, await importPrivate(fx.pkcs8)], [fx.other.fingerprint, await importPrivate(fx.other.pkcs8)]]);
  const toOther = await seal(body, null, { fingerprint: fx.other.fingerprint, spki: fx.other.spki });
  assert.equal(headerFingerprint(toOther), fx.other.fingerprint);
  assert.equal((await open(toOther, keyring)).body.text, body.text);
});

test('tampering fails with a reason', async () => {
  const keyring = new Map([[fx.fingerprint, await importPrivate(fx.pkcs8)], [fx.other.fingerprint, await importPrivate(fx.other.pkcs8)]]);
  const bundle = await seal(body, null, builtIn);
  const flipped = bundle.slice();
  flipped[flipped.length - 1] = flipped[flipped.length - 1]! ^ 1;
  await assert.rejects(open(flipped, keyring), isReason('tampered'));
  const reheaded = bundle.slice();
  reheaded.set(hex(fx.other.fingerprint), 6);
  await assert.rejects(open(reheaded, keyring), isReason('tampered'));
  await assert.rejects(open(bundle.slice(0, 30), keyring), isReason('format'));
  await assert.rejects(open(new Uint8Array(0), keyring), isReason('format'));
  await assert.rejects(open(bundle, new Map()), isReason('unknown-key'));
});

test('the committed fixture notes still open (the format is stable)', async () => {
  const keyring = new Map([[fx.fingerprint, await importPrivate(fx.pkcs8)]]);
  const text = await open(new Uint8Array(readFileSync(new URL('./fixtures/note-text.sealed', import.meta.url))), keyring);
  assert.equal(text.body.text, 'Fixture note: louder at bar 33');
  const hum = await open(new Uint8Array(readFileSync(new URL('./fixtures/note-hum.sealed', import.meta.url))), keyring);
  assert.equal(hum.body.kind, 'hum');
  assert.equal(hum.audio?.length, 2048);
});

test('a note re-wrapped to another key under another header does not open (the header is authenticated)', async () => {
  const bundle = await seal(body, null, builtIn);
  const aesRaw = privateDecrypt({ key: createPrivateKey({ key: Buffer.from(fx.pkcs8, 'base64'), format: 'der', type: 'pkcs8' }), oaepHash: 'sha256', padding: constants.RSA_PKCS1_OAEP_PADDING }, bundle.subarray(40, 40 + 512));
  const otherPub = createPublicKey({ key: Buffer.from(fx.other.spki, 'base64'), format: 'der', type: 'spki' });
  const rewrapped = publicEncrypt({ key: otherPub, oaepHash: 'sha256', padding: constants.RSA_PKCS1_OAEP_PADDING }, aesRaw);
  const forged = Uint8Array.from(Buffer.concat([bundle.subarray(0, 6), Buffer.from(fx.other.fingerprint, 'hex'), bundle.subarray(38, 40), rewrapped, bundle.subarray(40 + 512)]));
  const keyring = new Map([[fx.other.fingerprint, await importPrivate(fx.other.pkcs8)]]);
  await assert.rejects(open(forged, keyring), isReason('tampered'));
});

test('an independent opener (node:crypto, additional data = bytes 0..37) reads the fixture notes', () => {
  const bundle = readFileSync(new URL('./fixtures/note-text.sealed', import.meta.url));
  assert.equal(bundle.readUInt16BE(38), 512);
  const priv = createPrivateKey({ key: Buffer.from(fx.pkcs8, 'base64'), format: 'der', type: 'pkcs8' });
  const aesKey = privateDecrypt({ key: priv, oaepHash: 'sha256', padding: constants.RSA_PKCS1_OAEP_PADDING }, bundle.subarray(40, 552));
  const d = createDecipheriv('aes-256-gcm', aesKey, bundle.subarray(552, 564));
  d.setAAD(bundle.subarray(0, 38));
  d.setAuthTag(bundle.subarray(bundle.length - 16));
  const plain = Buffer.concat([d.update(bundle.subarray(564, bundle.length - 16)), d.final()]);
  const j = plain.readUInt32BE(0);
  const note = JSON.parse(plain.subarray(4, 4 + j).toString('utf8')) as NoteBody;
  assert.equal(note.text, 'Fixture note: louder at bar 33');
  assert.equal(plain.length, 4 + j);
});

test('a built-in key that is not RSA-4096 is refused', async () => {
  const small = await crypto.subtle.generateKey({ name: 'RSA-OAEP', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' }, true, ['encrypt', 'decrypt']);
  const spki = new Uint8Array(await crypto.subtle.exportKey('spki', small.publicKey));
  await assert.rejects(seal(body, null, { fingerprint: await fingerprintOf(spki), spki: Buffer.from(spki).toString('base64') }), FingerprintMismatch);
});
