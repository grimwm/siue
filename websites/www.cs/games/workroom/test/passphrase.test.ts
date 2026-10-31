// Changing the passphrase: the same keys, in the same order, locked again under the new passphrase; the old one no
// longer opens them; a wrong current passphrase, a weak new one or a key that changed on the server stops it with
// words for the person, and nothing is uploaded.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { KeyChanged, NoKeyring, SignedOut } from '../src/api.ts';
import type { KeyringAnswer } from '../src/api.ts';
import { PASSPHRASE_MESSAGES } from '../src/keymaker.ts';
import { CHANGE_MESSAGES, changePassphrase } from '../src/passphrase.ts';
import { KeyringInvalid, WrongPassphrase, changeMessage, lockKeyring, relockKeyring, unlockKeyring } from '../src/unlock.ts';
import type { ChangeProof } from '../src/unlock.ts';
import type { LockedKeyring } from '../src/unlock.ts';
import { b64, fx } from './fixture-key.ts';

const NEW = 'a brand new passphrase';

/** True when the proof is the current key's signature over this tag, the current fingerprint and the new envelope, as the server checks it. */
async function proves(proof: ChangeProof, tag: string, current: string, locked: LockedKeyring): Promise<boolean> {
  const pub = await crypto.subtle.importKey('spki', b64(proof.spki), { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
  return crypto.subtle.verify('RSASSA-PKCS1-v1_5', pub, b64(proof.sig), new TextEncoder().encode(changeMessage(tag, current, locked)));
}

test('relocking keeps every key and its order under the new passphrase only', async () => {
  const again = await relockKeyring(fx.keyring, fx.passphrase, NEW, 'tag-1');
  assert.equal(again.current, fx.fingerprint);
  assert.deepEqual(again.previous, [fx.other.fingerprint]);
  const unlocked = await unlockKeyring(again.locked, NEW);
  assert.deepEqual([...unlocked.ring.keys()], [fx.fingerprint, fx.other.fingerprint]);
  assert.equal(unlocked.current.spki, fx.spki);
  await assert.rejects(unlockKeyring(again.locked, fx.passphrase), WrongPassphrase);
  assert.notEqual(again.locked.salt, fx.keyring.salt, 'a fresh salt');
  assert.equal(again.proof.spki, fx.spki, 'the proof names the current key');
  assert.equal(await proves(again.proof, 'tag-1', fx.fingerprint, again.locked), true);
  assert.equal(await proves(again.proof, 'tag-2', fx.fingerprint, again.locked), false, 'only for this sign-in');
  assert.equal(await proves(again.proof, 'tag-1', fx.fingerprint, fx.keyring), false, 'only for this envelope');
});

test('a wrong current passphrase relocks nothing', async () => {
  await assert.rejects(relockKeyring(fx.keyring, 'not the passphrase', NEW, 'tag'), WrongPassphrase);
});

test('an entry that does not match its fingerprint is refused, as an unlock refuses it', async () => {
  const lying = await lockKeyring([{ fingerprint: fx.other.fingerprint, pkcs8: b64(fx.pkcs8) }], fx.passphrase);
  await assert.rejects(relockKeyring(lying, fx.passphrase, NEW, 'tag'), KeyringInvalid);
});

function server(keyring: LockedKeyring = fx.keyring) {
  const state = { keyring, changes: [] as { locked: LockedKeyring; current: string; previous: string[]; proof: ChangeProof }[], refuse: null as unknown };
  const api = {
    keyring: async (): Promise<KeyringAnswer> => ({ locked: state.keyring, session: 'tag' }),
    changeKeyring: async (locked: LockedKeyring, current: string, previous: string[], proof: ChangeProof): Promise<void> => {
      if (state.refuse) throw state.refuse;
      state.changes.push({ locked, current, previous, proof });
      state.keyring = locked;
    },
  };
  return { api, state };
}

test('a change uploads the same fingerprints, and the new passphrase unlocks what the server holds', async () => {
  const { api, state } = server();
  assert.equal(await changePassphrase(api, fx.passphrase, NEW, NEW), null);
  assert.equal(state.changes.length, 1);
  assert.equal(state.changes[0]!.current, fx.fingerprint);
  assert.deepEqual(state.changes[0]!.previous, [fx.other.fingerprint]);
  assert.equal(await proves(state.changes[0]!.proof, 'tag', fx.fingerprint, state.changes[0]!.locked), true, "signed over the server's tag for this sign-in");
  assert.deepEqual([...(await unlockKeyring(state.keyring, NEW)).ring.keys()], [fx.fingerprint, fx.other.fingerprint]);
});

test('every refusal says why in plain words and uploads nothing', async () => {
  const { api, state } = server();
  assert.equal(await changePassphrase(api, fx.passphrase, 'short', 'short'), PASSPHRASE_MESSAGES.short);
  assert.equal(await changePassphrase(api, fx.passphrase, NEW, `${NEW}!`), PASSPHRASE_MESSAGES.differ);
  assert.equal(await changePassphrase(api, 'not the passphrase', NEW, NEW), CHANGE_MESSAGES.wrong);
  assert.equal(state.changes.length, 0);
  state.refuse = new KeyChanged('changed');
  assert.equal(await changePassphrase(api, fx.passphrase, NEW, NEW), CHANGE_MESSAGES.keyChanged);
  state.refuse = new SignedOut('gone');
  assert.equal(await changePassphrase(api, fx.passphrase, NEW, NEW), 'Your sign-in ended. Sign in again.');
  const none = { keyring: async (): Promise<KeyringAnswer> => { throw new NoKeyring('none'); }, changeKeyring: async () => {} };
  assert.equal(await changePassphrase(none, fx.passphrase, NEW, NEW), CHANGE_MESSAGES.noKeyring);
});
