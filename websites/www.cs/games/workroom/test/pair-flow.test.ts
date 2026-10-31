// Pairing an AI key on Your studio: the server checks the code first; the page checks it again against the key it is
// handed and checks that key is a sealing key, so a server that swaps in a key of its own adds nothing; only then is
// the keyring opened with the passphrase, the AI key added, locked again and sent once with the current key's proof.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { KeyringAnswer, PageApi, PairRefusal } from '../src/api.ts';
import { PAIR_MESSAGES, pairAi } from '../src/pair-flow.ts';
import { pairingCode } from '../src/pairing.ts';
import { unlockKeyring } from '../src/unlock.ts';
import type { ChangeProof, LockedKeyring } from '../src/unlock.ts';
import { makeAiKey } from './ai-key.ts';
import { fx } from './fixture-key.ts';

const ai = await makeAiKey(9);
const intruder = await makeAiKey(9);

type Sent = { locked: LockedKeyring; current: string; previous: string[]; proof: ChangeProof; pair: { key: number; code: string; fingerprint: string } };
function server(answer: { spki: string; fingerprint: string } | PairRefusal = { spki: ai.spki, fingerprint: ai.fingerprint }) {
  const state = { checks: [] as string[], sent: [] as Sent[], keyring: fx.keyring as LockedKeyring, store: null as PairRefusal | null };
  const api: Pick<PageApi, 'keyring' | 'checkPairing' | 'pairKeyring'> = {
    keyring: async (): Promise<KeyringAnswer> => ({ locked: state.keyring, session: 'tag', ai: [] }),
    checkPairing: async (_key, code) => { state.checks.push(code); return answer; },
    pairKeyring: async (locked, current, previous, proof, pair) => { state.sent.push({ locked, current, previous, proof, pair }); return state.store; },
  };
  return { api, state };
}

test('the right code and passphrase add the AI key to the keyring and send it once', async () => {
  const s = server();
  const code = pairingCode(ai.fingerprint);
  assert.equal(await pairAi(s.api, 9, code.toLowerCase().replace(/-/g, ' '), fx.passphrase), null);
  assert.deepEqual(s.state.checks, [code], 'the code goes to the server as the page normalised it');
  assert.equal(s.state.sent.length, 1);
  const sent = s.state.sent[0]!;
  assert.deepEqual(sent.pair, { key: 9, code, fingerprint: ai.fingerprint });
  assert.equal(sent.current, fx.fingerprint);
  assert.deepEqual(sent.previous, [fx.other.fingerprint]);
  const opened = await unlockKeyring(sent.locked, fx.passphrase);
  assert.deepEqual(opened.ai, [{ fingerprint: ai.fingerprint, spki: ai.spki, key: 9 }]);
  assert.deepEqual([...opened.ring.keys()], [fx.fingerprint, fx.other.fingerprint], 'the same notes keys');
});

test('a malformed code is refused before the server is asked; a wrong one is the server\'s refusal', async () => {
  const s = server('wrong_code');
  assert.equal(await pairAi(s.api, 9, 'ABC', fx.passphrase), PAIR_MESSAGES.badCode);
  assert.deepEqual(s.state.checks, []);
  assert.equal(await pairAi(s.api, 9, 'AAAA-AAAA-AAAA-AAAA', fx.passphrase), PAIR_MESSAGES.wrong_code);
  assert.equal(s.state.sent.length, 0, 'no keyring is sent');
  assert.equal(await pairAi(server('too_many').api, 9, 'AAAA-AAAA-AAAA-AAAA', fx.passphrase), PAIR_MESSAGES.too_many);
  assert.equal(await pairAi(server('not_registered').api, 9, 'AAAA-AAAA-AAAA-AAAA', fx.passphrase), PAIR_MESSAGES.not_registered);
});

test('a server that hands back another key for the code is refused by the page, and nothing is sent', async () => {
  const swapped = server({ spki: intruder.spki, fingerprint: intruder.fingerprint });
  assert.equal(await pairAi(swapped.api, 9, pairingCode(ai.fingerprint), fx.passphrase), PAIR_MESSAGES.mismatch);
  assert.equal(swapped.state.sent.length, 0);
  const lying = server({ spki: intruder.spki, fingerprint: ai.fingerprint });
  assert.equal(await pairAi(lying.api, 9, pairingCode(ai.fingerprint), fx.passphrase), PAIR_MESSAGES.mismatch, 'a fingerprint that is not its key');
  assert.equal(lying.state.sent.length, 0);
});

test('a wrong passphrase changes nothing', async () => {
  const s = server();
  assert.equal(await pairAi(s.api, 9, pairingCode(ai.fingerprint), 'not the passphrase'), PAIR_MESSAGES.wrong);
  assert.equal(s.state.sent.length, 0);
});

test('pairing again replaces the key\'s earlier entry instead of adding a second', async () => {
  const s = server();
  await pairAi(s.api, 9, pairingCode(ai.fingerprint), fx.passphrase);
  s.state.keyring = s.state.sent[0]!.locked;
  await pairAi(s.api, 9, pairingCode(ai.fingerprint), fx.passphrase);
  assert.equal((await unlockKeyring(s.state.sent[1]!.locked, fx.passphrase)).ai.length, 1);
});
