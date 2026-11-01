// The harder layouts held back from Chapter 2: kept whole, still canonical level text, and still winnable.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { HELD } from '../src/puzzle/held.ts';
import { WAYS } from '../src/puzzle/ways.ts';
import { parse, serialize } from '../src/puzzle/level.ts';
import { initial } from '../src/puzzle/state.ts';
import { solve, SOLVER_CAP } from '../src/puzzle/solver.ts';

test('seven held layouts, one for each of Chapter 2\'s challenge levels, none of them what plays now', () => {
  assert.deepEqual(HELD.map(h => h.was), ['ch2-4', 'ch2-5', 'ch2-6', 'ch2-7', 'ch2-8', 'ch2-9', 'ch2-10']);
  assert.equal(new Set(HELD.map(h => h.id)).size, HELD.length);
  for (const h of HELD) assert.notEqual(h.text, WAYS.find(w => w.id === h.was)!.text, h.id);
});

test('each held layout parses to canonical text and is won by the solver', () => {
  for (const h of HELD) {
    const lv = parse(h.text);
    assert.equal(serialize(lv), h.text, h.id);
    assert.ok(lv.minotaur, h.id);
    const r = solve(initial(lv), h.was === 'ch2-10' ? 6_000_000 : SOLVER_CAP);
    assert.ok(r.solved, `${h.id} is winnable`);
  }
});
