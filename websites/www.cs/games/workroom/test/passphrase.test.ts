// Changing the passphrase: the same keys, in the same order, locked again under the new passphrase; the old one no
// longer opens them; a wrong current passphrase, a weak new one or a key that changed on the server stops it with
// words for the person, and nothing is uploaded.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { KeyChanged, NoKeyring, SignedOut } from '../src/api.ts';
import type { KeyringAnswer } from '../src/api.ts';
import { PASSPHRASE_MESSAGES } from '../src/keymaker.ts';
import { CHANGE_MESSAGES, changePassphrase } from '../src/passphrase.ts';
import { KeyringInvalid, WrongPassphrase, lockKeyring, relockKeyring, unlockKeyring } from '../src/unlock.ts';
import type { LockedKeyring } from '../src/unlock.ts';
import { b64, fx } from './fixture-key.ts';

const NEW = 'a brand new passphrase';

test('relocking keeps every key and its order under the new passphrase only', async () => {
  const again = await relockKeyring(fx.keyring, fx.passphrase, NEW);
  assert.equal(again.current, fx.fingerprint);
  assert.deepEqual(again.previous, [fx.other.fingerprint]);
  const unlocked = await unlockKeyring(again.locked, NEW);
  assert.deepEqual([...unlocked.ring.keys()], [fx.fingerprint, fx.other.fingerprint]);
  assert.equal(unlocked.current.spki, fx.spki);
  await assert.rejects(unlockKeyring(again.locked, fx.passphrase), WrongPassphrase);
  assert.notEqual(again.locked.salt, fx.keyring.salt, 'a fresh salt');
});

test('a wrong current passphrase relocks nothing', async () => {
  await assert.rejects(relockKeyring(fx.keyring, 'not the passphrase', NEW), WrongPassphrase);
});

test('an entry that does not match its fingerprint is refused, as an unlock refuses it', async () => {
  const lying = await lockKeyring([{ fingerprint: fx.other.fingerprint, pkcs8: b64(fx.pkcs8) }], fx.passphrase);
  await assert.rejects(relockKeyring(lying, fx.passphrase, NEW), KeyringInvalid);
});

function server(keyring: LockedKeyring = fx.keyring) {
  const state = { keyring, changes: [] as { locked: LockedKeyring; current: string; previous: string[] }[], refuse: null as unknown };
  const api = {
    keyring: async (): Promise<KeyringAnswer> => ({ locked: state.keyring, session: 'tag' }),
    changeKeyring: async (locked: LockedKeyring, current: string, previous: string[]): Promise<void> => {
      if (state.refuse) throw state.refuse;
      state.changes.push({ locked, current, previous });
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
