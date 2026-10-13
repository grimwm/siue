// A round's inputs and claim (src/solo-log.ts): what the browser sends the
// server as each round ends.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { ROUND_MAX_BUYS, ROUND_MAX_SHOTS, newRecorder, recordBuy, recordShot, closeRound, isRoundLog, replayableSeed } from '../src/solo-log.ts';

const claim = { end: 'roundWon', score: 1450, cash: 1210, lives: 3, roundsWon: 1 };

test('a round is its buys and shots with exact numbers, and survives JSON', () => {
  const rec = newRecorder();
  recordBuy(rec, { kind: 'ammo', w: 'mortar' }, 3);
  recordBuy(rec, { kind: 'gear', g: 'repair' }, 1);
  recordShot(rec, { x: 211.38333333333335, angle: 47.016666666666666, power: 63.5 }, 'mortar');
  const round = closeRound(rec, 1, claim);
  const back = JSON.parse(JSON.stringify(round));
  assert.deepEqual(back, {
    n: 1, buys: [{ i: 'mortar', q: 3 }, { i: 'repair', q: 1 }],
    shots: [{ w: 'mortar', a: 47.016666666666666, p: 63.5, x: 211.38333333333335 }], claim,
  });
  assert.ok(isRoundLog(back));
  assert.deepEqual([rec.buys, rec.shots], [[], []], 'the recorder starts the next round empty');
});

test('the validator refuses anything else', () => {
  const ok = { n: 1, buys: [], shots: [], claim };
  assert.ok(isRoundLog(ok));
  assert.ok(!isRoundLog(null));
  assert.ok(!isRoundLog({ ...ok, n: 0 }));
  assert.ok(!isRoundLog({ ...ok, shots: [{ w: 'shell', a: '1', p: 1, x: 1 }] }));
  assert.ok(!isRoundLog({ ...ok, buys: [{ i: 'mortar', q: 1.5 }] }));
  assert.ok(!isRoundLog({ ...ok, claim: { ...claim, end: 'won' } }));
  assert.ok(!isRoundLog({ ...ok, shots: Array(201).fill({ w: 'shell', a: 45, p: 50, x: 100 }) }), 'past ROUND_MAX_SHOTS');
});

test('the validator keeps out numbers no honest page records', () => {
  const ok = { n: 1, buys: [{ i: 'mortar', q: 9 }], shots: [{ w: 'shell', a: 10, p: 100, x: 12 }], claim };
  assert.ok(isRoundLog(ok));
  for (const bad of [
    { ...ok, buys: [{ i: 'mortar', q: 0 }] }, { ...ok, buys: [{ i: 'mortar', q: 10 }] },
    { ...ok, buys: [{ i: 'x'.repeat(33), q: 1 }] },
    { ...ok, shots: [{ ...ok.shots[0], a: 9 }] }, { ...ok, shots: [{ ...ok.shots[0], a: 171 }] },
    { ...ok, shots: [{ ...ok.shots[0], p: 101 }] }, { ...ok, shots: [{ ...ok.shots[0], x: Infinity }] },
    { ...ok, claim: { ...claim, cash: -1 } },
  ]) assert.ok(!isRoundLog(bad), JSON.stringify(bad));
});

test('a round at the limits is valid and one past them is not; the limits are the server\'s', () => {
  const buys = n => Array.from({ length: n }, () => ({ i: 'mortar', q: 1 }));
  assert.ok(isRoundLog({ n: 1, buys: buys(ROUND_MAX_BUYS), shots: [], claim }));
  assert.ok(!isRoundLog({ n: 1, buys: buys(ROUND_MAX_BUYS + 1), shots: [], claim }));
  assert.deepEqual([ROUND_MAX_BUYS, ROUND_MAX_SHOTS], [60, 200]);
  const php = path.join(import.meta.dirname, '..', 'server', 'solo.php');
  if (fs.existsSync(php)) {
    const src = fs.readFileSync(php, 'utf8');
    assert.equal(Number(/SOLO_MAX_BUYS',\s*(\d+)|const SOLO_MAX_BUYS\s*=\s*(\d+)/.exec(src)?.slice(1).find(Boolean)), ROUND_MAX_BUYS);
    assert.equal(Number(/SOLO_MAX_SHOTS',\s*(\d+)|const SOLO_MAX_SHOTS\s*=\s*(\d+)/.exec(src)?.slice(1).find(Boolean)), ROUND_MAX_SHOTS);
  }
});

test('only printable-ASCII seeds play the same in PHP', () => {
  assert.ok(replayableSeed('scorched-1234'));
  assert.ok(!replayableSeed('héllo'));
  assert.ok(!replayableSeed(''));
  assert.ok(!replayableSeed('x'.repeat(65)));
});
