// A piece page's sheet music for a draft that stores none: engraved from the score's own notes, each lane its part.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { engraveScore, sheetSource } from '../src/compose/engrave.ts';
import type { Library } from '../src/render/plan.ts';
import type { Score } from '../src/score.ts';

const read = (p: string): unknown => JSON.parse(readFileSync(p, 'utf8'));
const SCORE = read(join(import.meta.dirname, 'fixtures', 'score-renderable-v1.json')) as Score;
const LIBRARY = read(join(import.meta.dirname, '..', '..', '..', 'music', 'library', 'library.json')) as Library;

test('where the sheet comes from', () => {
  assert.equal(sheetSource(SCORE, true), 'stored');
  assert.equal(sheetSource(SCORE, false), 'engraved');
  assert.equal(sheetSource({ ...SCORE, mix: undefined }, false), null, 'a score the page cannot play has no notes it can engrave');
  assert.equal(sheetSource({ ...SCORE, kind: 'sound' }, false), null);
});

test('engraved from the notes, each lane a part named by its id, read once', async () => {
  let fetched = 0;
  const xml = await engraveScore(SCORE, async () => { fetched++; return LIBRARY; });
  for (const lane of SCORE.lanes) assert.match(xml, new RegExp(`<part id="${lane.id}">`));
  assert.doesNotMatch(xml, /color=/);
  await engraveScore(SCORE, async () => { fetched++; return LIBRARY; });
  assert.equal(fetched, 1);
});
