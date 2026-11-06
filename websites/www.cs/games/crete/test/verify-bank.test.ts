// The trusted verifier's script (tools/verify-bank.ts): it lists the waiting levels with its token in the header, makes
// each again from its tuple, posts a match for the level its tuple makes and a mismatch for a tampered text, leaves
// another version's levels alone, keeps to its share, never prints or posts its token in a body, and fails quietly.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { verifyAll, TOKEN_HEADER } from '../tools/verify-bank.ts';
import { ENDLESS_VERSION, sharedOf } from '../src/endless/provenance.ts';
import type { SharedMade, Tuple } from '../src/endless/provenance.ts';
import { BANKS } from '../src/endless/bank.ts';

const TOKEN = 'secret-token-abcdefghijklmnopqrstuvwxyz-0123';
const level = (i: number): SharedMade => sharedOf(BANKS.medium[i]!);
const tuple = (seed: string, v = ENDLESS_VERSION): Tuple => ({ v, seed, tier: 3, grade: 'medium', depth: 2, k: 0, run: [{ text: BANKS.medium[0]!.text, explored: 3000, score: 40 }] });

/** A bank that lists `items` and records every request. */
function bank(items: unknown[], over: { failList?: boolean } = {}) {
  const calls: { headers: Record<string, string>; body: Record<string, unknown> }[] = [];
  const fetch = async (_url: string, init: { headers: Record<string, string>; body: string }) => {
    const body = JSON.parse(init.body) as Record<string, unknown>;
    calls.push({ headers: init.headers, body });
    if (body.op === 'trusted-list') {
      if (over.failList) return { ok: false, status: 401, json: async () => ({ error: 'unauthorized' }) };
      return { ok: true, status: 200, json: async () => ({ items }) };
    }
    return { ok: true, status: 200, json: async () => ({ ok: true, verdict: body.verdict }) };
  };
  return { fetch, calls };
}

/** The generator, standing in: seed 'a' makes level 1, seed 'b' level 2. */
const regen = (t: Tuple): SharedMade | null => (t.seed === 'a' ? level(1) : t.seed === 'b' ? level(2) : null);

test('a level its tuple makes is a match; a tampered text is a mismatch; an older version still made again is checked; another is left alone', async () => {
  const tampered = { ...level(2), text: level(2).text.replace('#.#', '...') };
  assert.notEqual(tampered.text, level(2).text);
  const b = bank([
    { grade: 'medium', h: 'a'.repeat(16), tuple: tuple('a'), made: level(1) },
    { grade: 'medium', h: 'b'.repeat(16), tuple: tuple('b'), made: tampered },
    { grade: 'medium', h: 'c'.repeat(16), tuple: tuple('a', ENDLESS_VERSION + 1), made: level(1) },
    { grade: 'medium', h: 'd'.repeat(16), tuple: tuple('a', 2), made: level(1) },
  ]);
  const lines: string[] = [];
  const tally = await verifyAll({ fetch: b.fetch, url: 'x', token: TOKEN, regenerate: regen, now: () => 0, log: l => lines.push(l) }, { items: 10, ms: 60_000 });
  assert.deepEqual(tally, { checked: 3, matched: 2, mismatched: 1, skipped: 1 });
  const verdicts = b.calls.filter(c => c.body.op === 'trusted-verify').map(c => [c.body.h, c.body.verdict]);
  assert.deepEqual(verdicts, [['a'.repeat(16), 'match'], ['b'.repeat(16), 'mismatch'], ['d'.repeat(16), 'match']]);
  for (const c of b.calls) {
    assert.equal(c.headers[TOKEN_HEADER], TOKEN, 'the token rides in its header');
    assert.ok(!JSON.stringify(c.body).includes(TOKEN), 'and never in a body');
  }
  assert.ok(!lines.join('\n').includes(TOKEN), 'nor in what it prints');
});

test('it keeps to its share of levels, and a refused list ends the run quietly', async () => {
  const many = Array.from({ length: 5 }, (_, i) => ({ grade: 'medium', h: `${i}`.repeat(16), tuple: tuple('a'), made: level(1) }));
  const b = bank(many);
  const tally = await verifyAll({ fetch: b.fetch, url: 'x', token: TOKEN, regenerate: regen, now: () => 0, log: () => {} }, { items: 2, ms: 60_000 });
  assert.equal(tally.checked, 2);
  let t = 0;
  const slow = bank(many);
  const timed = await verifyAll({ fetch: slow.fetch, url: 'x', token: TOKEN, regenerate: x => { t += 1000; return regen(x); }, now: () => t, log: () => {} }, { items: 10, ms: 2500 });
  assert.equal(timed.checked, 3, 'it stops once its minutes are spent');
  const refused = bank(many, { failList: true });
  const lines: string[] = [];
  assert.deepEqual(await verifyAll({ fetch: refused.fetch, url: 'x', token: TOKEN, regenerate: regen, now: () => 0, log: l => lines.push(l) }, { items: 10, ms: 1000 }),
    { checked: 0, matched: 0, mismatched: 0, skipped: 0 });
  assert.match(lines[0]!, /401/);
});
