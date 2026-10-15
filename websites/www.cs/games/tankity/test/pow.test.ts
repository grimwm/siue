// The room puzzle's browser half (src/pow.ts) against the server's
// (server/pow.php), through node's WebCrypto, the same API browsers have: the
// leading zeros counted alike (protocol/pow-vectors.json), the same smallest
// solving nonces however many guesses are in flight, and a solve that can be
// cancelled.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { POW_IN_FLIGHT, PowCancelled, leadingZeros, powKey, powLead, solvePow } from '../src/pow.ts';
import type { Subtle } from '../src/pow.ts';

const GAME_DIR = path.join(import.meta.dirname, '..');
interface Vectors {
  iter: number; count: number; bits: number;
  challenges: { challenge: string; solution: number[]; probes: { nonce: number; lead: number }[] }[];
}
const vectors: Vectors = JSON.parse(fs.readFileSync(path.join(GAME_DIR, 'protocol', 'pow-vectors.json'), 'utf8'));
const subtle: Subtle = globalThis.crypto.subtle;

await test('leading-zeros', () => {
  assert.deepEqual([0, 1, 0x80000000, 0x00ffffff, 0xffffffff, 0x40000000].map(leadingZeros), [32, 31, 0, 8, 0, 1]);
});

await test('vectors-count-like-the-server', async () => {
  assert.equal(vectors.challenges.length, 6);
  for (const c of vectors.challenges) {
    const key = await powKey(subtle, c.challenge);
    for (const p of c.probes) assert.equal(await powLead(subtle, key, p.nonce, vectors.iter), p.lead, `${c.challenge} #${p.nonce}`);
  }
});

await test('solve-finds-the-servers-nonces', async () => {
  for (const c of vectors.challenges) {
    const got = await solvePow({ challenge: c.challenge, bits: vectors.bits, count: vectors.count, iter: vectors.iter }, subtle);
    assert.deepEqual(got, c.solution, c.challenge);
  }
});

await test('solve-is-the-same-however-many-in-flight', async () => {
  const c = vectors.challenges[3]!;
  const ask = { challenge: c.challenge, bits: vectors.bits, count: vectors.count, iter: vectors.iter };
  for (const inFlight of [1, 3, POW_IN_FLIGHT, 16]) assert.deepEqual(await solvePow(ask, subtle, { inFlight }), c.solution, `${inFlight} in flight`);
});

await test('solve-at-4-bits', async () => {
  const ask = { challenge: 'v1.1800000000.j.4.test-challenge-four-bit.mac', bits: 4, count: 4, iter: 100 };
  const got = await solvePow(ask, subtle);
  assert.equal(new Set(got).size, 4);
  const key = await powKey(subtle, ask.challenge);
  for (const n of got) assert.ok((await powLead(subtle, key, n, 100)) >= 4, `nonce ${n}`);
});

await test('solve-at-0-bits-is-the-first-four', async () => {
  assert.deepEqual(await solvePow({ challenge: 'v1.1.c.0.x.y', bits: 0, count: 4, iter: 100 }, subtle), [0, 1, 2, 3]);
});

await test('solve-cancelled-before', async () => {
  await assert.rejects(solvePow({ challenge: 'v1.1.c.9.x.y', bits: 9, count: 4, iter: 100 }, subtle, { signal: { aborted: true } }), PowCancelled);
});

await test('solve-cancelled-midway', async () => {
  const signal = { aborted: false };
  let calls = 0;
  const counting: Subtle = {
    importKey: (...a) => subtle.importKey(...a),
    deriveBits: (...a) => { if (++calls === 20) signal.aborted = true; return subtle.deriveBits(...a); },
  };
  // 24 bits would take hours: only the cancel ends it.
  await assert.rejects(solvePow({ challenge: 'v1.1.c.24.x.y', bits: 24, count: 4, iter: 100 }, counting, { signal }), PowCancelled);
  assert.ok(calls < 20 + POW_IN_FLIGHT + 1, `${calls} guesses`);
});
