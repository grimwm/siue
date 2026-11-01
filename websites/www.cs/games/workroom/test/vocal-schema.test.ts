// Vocal Tracks in the score: the shared vectors' vocal lane parses, each broken case is refused naming its path (the
// Python validator reads the same file), and a vocal lane makes a score schema 2.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { needsSchema2, parseScore, type Score } from '../src/score.ts';
import { setPath } from './score2.test.ts';

interface Vectors { score: Score; invalid: { name: string; set: string; value: unknown; error: string }[] }
const vectors = (): Vectors => JSON.parse(readFileSync(new URL('./fixtures/vocal-vectors.json', import.meta.url), 'utf8')) as Vectors;

test('a vocal lane parses with its takes and clips, and needs schema 2', () => {
  const r = parseScore(vectors().score, new Set(['cello', 'horn']));
  assert.ok(r.ok, r.ok ? '' : r.error);
  const lane = r.score.lanes.find(l => l.id === 'voice')!;
  assert.equal(lane.sound!.instrument, 'vocal');
  assert.equal(lane.vocal!.takes.length, 2);
  assert.deepEqual(lane.vocal!.clips[0], { take: `vocal-${'a'.repeat(64)}.flac`, at: 1, from: 0.5, to: 6, gain_db: -2, fade_in: 0.2, fade_out: 0.5 });
  assert.equal(needsSchema2(r.score), true);
});

test('each broken vocal case is refused, naming the path it breaks', () => {
  for (const c of vectors().invalid) {
    const v = vectors();
    setPath(v.score, c.set, c.value);
    const r = parseScore(v.score);
    assert.equal(r.ok, false, c.name);
    if (!r.ok) assert.equal(r.error.split(': ')[0], c.error, `${c.name}: ${r.error}`);
  }
});
