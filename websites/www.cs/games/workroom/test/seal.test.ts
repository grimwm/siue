// Sealing: a round trip gives back the note and its audio; the words never
// appear in the bundle; a public key whose fingerprint differs from the
// built-in one is refused; tampering fails with a reason, never a crash.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
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
