// Every piece a tier unlocks turns up in Endless: across a sample of seeds, at each grade and tier, the drafts the
// generator climbs from hold every family the tier offers (fake and invisible walls on the depths that hide walls,
// the cow in Hard too, though rarely), so no piece silently drops out. test/endless-gate.test.ts checks the same of
// each grade's bank, whose levels passed the whole gate.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { draft, textOf, familiesOf, HIDING } from '../src/endless/draft.ts';
import { planOf, holds } from '../src/endless/generate.ts';
import { rngOf } from '../src/endless/random.ts';
import { parse } from '../src/puzzle/level.ts';
import { GRADES } from '../src/puzzle/rating.ts';

const SEEDS = 120;

test('every family a tier unlocks appears on the drafts of a sample of seeds, at every grade', () => {
  for (const grade of GRADES) for (let tier = 1; tier <= 10; tier++) {
    const seen = new Set<string>();
    for (let k = 0; k < SEEDS; k++) {
      const rng = rngOf('pieces', grade, tier, k);
      const hides = familiesOf(tier).some(f => HIDING.includes(f)) && k % 5 === 0;
      const s = draft(rng, planOf(rng, tier, grade, hides, null, (k % 3) / 2));
      if (!s) continue;
      const lv = parse(textOf(s, ''));
      for (const f of familiesOf(tier)) if (holds(lv, f)) seen.add(f);
    }
    const missing = familiesOf(tier).filter(f => !seen.has(f));
    assert.deepEqual(missing, [], `${grade} tier ${tier}`);
  }
});
