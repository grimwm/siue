// Score schema 2: the shared vectors' score parses with every field, each broken case is refused naming its path
// (the Python validator reads the same file), schema 1 refuses the new fields, and the tempo line's ramp is by bar.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { needsSchema2, parseScore, tempoLineBpm, type Score } from '../src/score.ts';

interface Vectors { score: Score; invalid: { name: string; set: string; value: unknown; error: string }[] }
const vectors = (): Vectors => JSON.parse(readFileSync(new URL('./fixtures/schema2-vectors.json', import.meta.url), 'utf8')) as Vectors;

/** Sets (or, with "__delete__", removes) the value at a dotted path of keys and list indexes. */
export function setPath(root: unknown, path: string, value: unknown): void {
  const keys = path.split('.');
  let at = root as Record<string, unknown>;
  for (const k of keys.slice(0, -1)) at = at[k] as Record<string, unknown>;
  const last = keys[keys.length - 1]!;
  if (value === '__delete__') delete at[last];
  else at[last] = value;
}

test('the schema 2 score parses with every new field kept', () => {
  const r = parseScore(vectors().score);
  assert.ok(r.ok, r.ok ? '' : r.error);
  const s = r.score;
  assert.equal(s.schema, 2);
  assert.deepEqual(s.piece_tempo, [{ bar: 1, bpm: 92, shape: 'speed_up' }, { bar: 5, bpm: 128, shape: 'steady' }]);
  assert.deepEqual(s.lanes[1]!.speed, { ratio: 0.666667 });
  assert.equal(s.lanes[0]!.dynamics!.length, 2);
  assert.equal(s.lanes[0]!.fx!.echo!.repeats, 3);
  assert.equal(s.lanes[1]!.voice!.length, 4);
  assert.deepEqual(s.notes[3]!.bend, [[0, -50], [0.5, 0], [1.2, 30], [2, 0]]);
  assert.deepEqual(s.mix!.room, { preset: 'concert_hall', amount: 0.4 });
  assert.deepEqual(s.mix!.limiter, { on: true, ceiling_db: -1 });
  assert.equal(needsSchema2(s), true);
});

test('each broken case is refused, naming the path it breaks', () => {
  for (const c of vectors().invalid) {
    const v = vectors();
    setPath(v.score, c.set, c.value);
    const r = parseScore(v.score);
    assert.equal(r.ok, false, c.name);
    // An unknown schema is the page's reload message, which names the schema rather than a path.
    if (!r.ok) assert.equal(c.error === 'schema' && /score schema \d/.test(r.error) ? 'schema' : r.error.split(': ')[0], c.error, `${c.name}: ${r.error}`);
  }
});

test('a schema 1 score with no new field needs no schema 2', () => {
  const s = JSON.parse(readFileSync(new URL('./fixtures/score-v1.json', import.meta.url), 'utf8')) as Score;
  const r = parseScore(s);
  assert.ok(r.ok);
  if (r.ok) assert.equal(needsSchema2(r.score), false);
});

test('a ramp moves by bar toward the next mark, and a steady mark holds', () => {
  const line = [{ bar: 1, bpm: 92, shape: 'speed_up' as const }, { bar: 5, bpm: 128, shape: 'steady' as const }];
  assert.deepEqual([1, 2, 3, 4, 5, 9].map(b => tempoLineBpm(line, b)), [92, 101, 110, 119, 128, 128]);
  const down = [{ bar: 1, bpm: 120, shape: 'slow_down' as const }, { bar: 4, bpm: 66, shape: 'steady' as const }];
  assert.deepEqual([1, 2, 3, 4].map(b => tempoLineBpm(down, b)), [120, 102, 84, 66]);
});
