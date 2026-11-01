// The editor's save: the bundle the server reads, and every answer said in words that keep the edit safe.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { SignedOut } from '../src/api.ts';
import { encodeBundle, saveScore } from '../src/compose/save.ts';
import { liveVoice } from '../src/compose/sampler.ts';
import { regions } from '../src/render/plan.ts';
import type { Library } from '../src/render/plan.ts';
import type { Score } from '../src/score.ts';

const SCORE = JSON.parse(readFileSync(join(import.meta.dirname, 'fixtures', 'score-renderable-v1.json'), 'utf8')) as Score;
const LIB = JSON.parse(readFileSync(join(import.meta.dirname, '..', '..', '..', 'music', 'library', 'library.json'), 'utf8')) as Library;
const answering = (status: number, data: Record<string, unknown>) => ({ saveDraft: async () => ({ status, data }) });

test('the bundle is SIUED1, a count, then name length, name, uint32 size and bytes', () => {
  const b = encodeBundle({ 'score.json': new Uint8Array([1, 2, 3]) });
  assert.deepEqual([...b], [...Buffer.from('SIUED1'), 1, 10, ...Buffer.from('score.json'), 0, 0, 0, 3, 1, 2, 3]);
});

test('a save posts the score as its own draft and answers the version kept', async () => {
  let seen: [string, number, Uint8Array] | null = null;
  const api = { saveDraft: async (piece: string, version: number, bundle: Uint8Array<ArrayBuffer>) => { seen = [piece, version, bundle]; return { status: 201, data: { version: 1 } }; } };
  assert.deepEqual(await saveScore(api, SCORE), { ok: true, version: 1 });
  const [piece, version, bundle] = seen!;
  assert.deepEqual([piece, version], ['test-piece', 1]);
  const json = JSON.parse(Buffer.from(bundle.slice(6 + 1 + 1 + 10 + 4)).toString('utf8'));
  assert.equal(json.piece.id, 'test-piece');
});

test('each refusal says what happened and that the edit is kept', async () => {
  const stale = await saveScore(answering(409, { error: 'stale', latest: 4 }), SCORE);
  assert.deepEqual(stale, { ok: false, latest: 4, message: 'Draft 4 of this piece was saved after you opened it. Press Save Draft again to keep yours as draft 5; draft 4 stays as it is.' });
  const full = await saveScore(answering(413, { error: 'over_quota', room: 10, message: 'Your studio has 10 bytes of 5 MB left. Delete drafts or picked-up notes to make room.' }), SCORE);
  assert.equal(full.ok, false);
  assert.match(!full.ok ? full.message : '', /^Your studio has 10 bytes of 5 MB left\..* Your edit is still here\.$/);
  for (const error of ['too_large', 'too_many_notes', 'too_many_lanes', 'unknown_instrument', 'bad_score']) {
    const r = await saveScore(answering(422, { error }), SCORE);
    assert.ok(!r.ok && r.message.endsWith('Your edit is still here.'), error);
  }
  const out = await saveScore({ saveDraft: async () => { throw new SignedOut('gone'); } }, SCORE);
  assert.match(!out.ok ? out.message : '', /^Your sign-in ended\./);
  const offline = await saveScore({ saveDraft: async () => { throw new TypeError('fetch failed'); } }, SCORE);
  assert.match(!offline.ok ? offline.message : '', /^Could not reach the server\./);
});

test('a live note plays the sample and rate the renderer would', () => {
  const sound = { instrument: 'cello', gain_db: 0, attack: 0.05, release: 0.3 };
  const region = regions(LIB.instruments['cello']!.files).find(r => 50 >= r.lo && 50 <= r.hi)!;
  const v = liveVoice(LIB, sound, 50, 127)!;
  assert.equal(v.file, region.file);
  assert.ok(Math.abs(v.rate - 2 ** ((50 - region.file.pitch) / 12)) < 1e-12);
  assert.deepEqual(v.loop, LIB.instruments['cello']!.loop);
  assert.ok(liveVoice(LIB, { ...sound, gain_db: -6 }, 50, 127)!.gain < v.gain, 'the part\'s level');
  assert.ok(liveVoice(LIB, sound, 50, 40)!.gain < v.gain, 'softer when played softer');
  const kit = { instrument: 'kit', gain_db: 0, attack: 0.005, release: 0.4 };
  assert.equal(liveVoice(LIB, kit, 38, 100)!.rate, 1, 'a drum is never repitched');
  assert.equal(liveVoice(LIB, kit, 61, 100), null, 'and has nothing on another key');
  assert.equal(liveVoice(LIB, { ...sound, instrument: 'kazoo' }, 60, 100), null);
});
