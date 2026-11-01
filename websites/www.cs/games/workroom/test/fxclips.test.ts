// DJ & Effects' clips in the score: the shared vectors' score parses with a clip of every effect (the Python
// validator reads the same file), each broken case is refused naming its path, schema 1 refuses them, a sound piece
// has none, and a bar position is the seconds the tempo says.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { barSeconds, FX_CLIP_EFFECTS, needsSchema2, parseScore, type Score } from '../src/score.ts';

interface Vectors { score: Score; invalid: { name: string; set: string; value: unknown; error: string }[]; seconds: [number, number][] }
const vectors = (): Vectors => JSON.parse(readFileSync(new URL('./fixtures/fxclips-vectors.json', import.meta.url), 'utf8')) as Vectors;

/** Sets (or, with "__delete__", removes) the value at a dotted path of keys and list indexes. */
function setPath(root: unknown, path: string, value: unknown): void {
  const keys = path.split('.');
  let at = root as Record<string, unknown>;
  for (const k of keys.slice(0, -1)) at = at[k] as Record<string, unknown>;
  const last = keys[keys.length - 1]!;
  if (value === '__delete__') delete at[last];
  else at[last] = value;
}

test('the score parses with a clip of every effect, settings and moves kept', () => {
  const r = parseScore(vectors().score);
  assert.ok(r.ok, r.ok ? '' : r.error);
  const clips = r.score.fx_clips!;
  assert.deepEqual(new Set(clips.map(c => c.effect)), new Set(FX_CLIP_EFFECTS));
  assert.deepEqual(clips[0], { effect: 'scratch', lane: null, from_bar: 1, to_bar: 1.5, settings: { style: 'chirp' }, points: [[1, 1], [1.25, -2.5], [1.5, 1]] });
  assert.equal(clips[3]!.settings, undefined, 'a clip may leave every setting at its default');
  assert.equal(needsSchema2(r.score), true);
});

test('each broken clip is refused, naming the path it breaks', () => {
  for (const c of vectors().invalid) {
    const v = vectors();
    setPath(v.score, c.set, c.value);
    const r = parseScore(v.score);
    assert.equal(r.ok, false, c.name);
    if (!r.ok) assert.ok(r.error.startsWith(c.error + ':'), `${c.name}: ${r.error}`);
  }
});

test('schema 1 refuses clips, and a sound piece has none', () => {
  const v = vectors();
  const one = parseScore({ ...v.score, schema: 1 });
  assert.equal(one.ok, false);
  const clipsOnly = vectors().score;
  const r = parseScore(clipsOnly);
  assert.ok(r.ok);
  const { fx_clips: _, ...without } = r.score;
  assert.equal(needsSchema2({ ...without, schema: 2 } as Score), true, 'the rest of the vectors score is schema 2 too');
});

test('a bar position is its seconds through every tempo change', () => {
  const v = vectors();
  for (const [bar, sec] of v.seconds) assert.equal(barSeconds(v.score.tempo!, bar), sec, `bar ${bar}`);
});
