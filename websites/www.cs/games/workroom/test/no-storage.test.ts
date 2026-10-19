// Nothing of any key is ever written to browser storage: unlocking, loading
// the vault, sealing and opening touch no IndexedDB, localStorage,
// sessionStorage, cookie or Cache API, and the key modules do not even name them.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createVault } from '../src/vault.ts';
import { unlockKeyring } from '../src/unlock.ts';
import { open, seal } from '../src/seal.ts';
import { fx } from './fixture-key.ts';

const touched: string[] = [];
const trap = (name: string) => new Proxy({}, {
  get: (_t, p) => { touched.push(`${name}.${String(p)}`); return () => undefined; },
  set: (_t, p) => { touched.push(`${name}.${String(p)}=`); return true; },
});
for (const name of ['indexedDB', 'localStorage', 'sessionStorage', 'caches']) {
  Object.defineProperty(globalThis, name, { value: trap(name), configurable: true });
}
Object.defineProperty(globalThis, 'document', {
  configurable: true,
  value: { get cookie() { touched.push('document.cookie'); return ''; }, set cookie(_v: string) { touched.push('document.cookie='); } },
});

test('unlocking, using and clearing the vault touch no browser storage', async () => {
  const vault = createVault();
  const unlocked = await unlockKeyring(fx.keyring, fx.passphrase);
  vault.load(unlocked.ring);
  const sealed = await seal({ v: 1, kind: 'text', piece: 'p', draft: 1, from: 0, to: 1, fromBar: 1, toBar: 1, lane: null, text: 'hi', reaction: null, curve: null, audio: null, made: '2026-10-20T00:00:00.000Z' }, null, unlocked.current);
  assert.equal((await open(sealed, vault.keyring())).body.text, 'hi');
  vault.clear();
  assert.deepEqual(touched, []);
});

test('the modules that handle keys never name a browser store', () => {
  for (const file of ['note', 'seal', 'unlock', 'vault', 'answer', 'api', 'outbox', 'history', 'notes-session', 'recorder', 'energy']) {
    const source = readFileSync(new URL(`../src/${file}.ts`, import.meta.url), 'utf8');
    assert.doesNotMatch(source, /indexedDB|localStorage|sessionStorage|document\.cookie|\bcaches\b/, `${file}.ts`);
  }
});
