// Where a shared level came from (src/endless/provenance.ts): a part's tuple carries just the run state the part
// reads, and running the part again from the tuple makes the same level, so a verifier that makes it again accepts
// that level and rejects any other text, a hand-edited one above all.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { memoryOf, regenerate, requestOf, sameMade, tupleOf, ENDLESS_VERSION } from '../src/endless/provenance.ts';
import type { Tuple } from '../src/endless/provenance.ts';
import { placeOf, RUN_MEMORY } from '../src/endless/generate.ts';
import type { Played } from '../src/endless/generate.ts';
import { BANKS } from '../src/endless/bank.ts';
import { hidesWalls } from '../src/puzzle/difficulty.ts';
import { parse } from '../src/puzzle/level.ts';

const asPlayed = (b: { text: string; explored: number; score: number }): Played => ({ text: b.text, explored: b.explored, score: b.score });
const PLAIN = BANKS.medium.filter(b => !hidesWalls(parse(b.text))).map(asPlayed);
const HIDING = BANKS.medium.filter(b => hidesWalls(parse(b.text))).map(asPlayed);

test('a tuple keeps the run\'s last levels, and the last plain one before them when none of those is plain', () => {
  const long = [...PLAIN, ...PLAIN].slice(0, 20);
  assert.deepEqual(memoryOf(long), long.slice(-RUN_MEMORY));
  assert.ok(HIDING.length >= 1);
  const hidden = Array.from({ length: RUN_MEMORY }, (_, i) => HIDING[i % HIDING.length]!);
  const run = [PLAIN[0]!, PLAIN[1]!, ...hidden];
  assert.deepEqual(memoryOf(run), [PLAIN[1]!, ...hidden], 'the last plain level, for the ramp');
  const req = { seed: 'abc', tier: 9, grade: 'medium' as const, depth: run.length + 1, run };
  assert.deepEqual(placeOf(requestOf(tupleOf(req, 5)!)), placeOf(req), 'the part reads the same place from the tuple');
  assert.equal(tupleOf(req, 5)!.k, 5);
  assert.equal(tupleOf(req, 5)!.v, ENDLESS_VERSION);
  assert.equal(tupleOf({ ...req, budget: 1000 }, 0), null, 'a spec\'s budget makes other levels');
  assert.equal(tupleOf({ ...req, depth: 1, run: [] }, 0), null, 'a first level is never searched for');
});

test('a verifier makes the tuple\'s level again and accepts only that level: a hand-edited text is rejected', () => {
  // A tuple whose part 0 finds a level part way through its budget.
  const before = BANKS.easy.find(b => b.score >= 50 && b.score <= 60)!;
  const tuple: Tuple = { v: ENDLESS_VERSION, seed: 'prov1', tier: 3, grade: 'easy', depth: 2, k: 0, run: [asPlayed(before)] };
  const made = regenerate(tuple, { features: [] });
  assert.ok(made, 'the part makes a level (pick another tuple if the generator changed)');
  assert.ok(sameMade(made, JSON.parse(JSON.stringify(made))), 'the same level, as it comes back over the wire');
  // A person's edit: one wall of the maze opened, the rest as made.
  const rows = made.text.split('\n');
  const r = rows.findIndex((row, i) => i > 4 && /#\.#/.test(row));
  rows[r] = rows[r]!.replace('#.#', '...');
  const edited = { ...made, text: rows.join('\n') };
  assert.equal(sameMade(made, edited), false, 'an opened wall');
  assert.equal(sameMade(made, { ...made, line: made.line + 'u' }), false, 'another line');
  assert.equal(sameMade(made, { ...made, shortest: made.shortest - 1 }), false, 'fewer moves claimed');
  assert.equal(sameMade(made, null), false);
  assert.equal(regenerate({ ...tuple, v: ENDLESS_VERSION + 1 }, { features: [] }), null, 'another version is not this generator\'s');
});

