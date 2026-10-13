// A round's inputs and claim (src/solo-log.ts): what the browser sends the
// server as each round ends.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newRecorder, recordBuy, recordShot, closeRound, isRoundLog, replayableSeed } from '../src/solo-log.ts';

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

test('only printable-ASCII seeds play the same in PHP', () => {
  assert.ok(replayableSeed('scorched-1234'));
  assert.ok(!replayableSeed('héllo'));
  assert.ok(!replayableSeed(''));
  assert.ok(!replayableSeed('x'.repeat(65)));
});
