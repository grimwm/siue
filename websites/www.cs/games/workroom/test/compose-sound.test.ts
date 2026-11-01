// The Sound panel's edits and the live microphone: a setting back at its default is left out, so an untouched piece
// stays schema 1; settings, the Room, the limiter and a voice chain save as a valid schema 2 score; the live voice asks
// for the microphone only when started and lets it go when stopped.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { scoreFromDoc } from '../src/compose/doc.ts';
import { chainProcessor, startLiveVoice } from '../src/compose/livemic.ts';
import { mixOf, newVoiceFx, setLaneFx, setMix, setVoice, tidyFx } from '../src/compose/sound.ts';
import { parseScore } from '../src/score.ts';
import { docWith } from './compose-fixture.ts';

const AT = { piece: { id: 'test-piece', title: 'Test' }, project: { id: 'crete', name: 'Crete' }, draft: 2, made: '2026-10-31T12:00:00Z' };

test('settings at their defaults are left out', () => {
  assert.equal(tidyFx({ volume_db: 0, pan: 0, eq: { bass: 0 }, echo: { amount: 0, repeats: 5 }, brightness: { cutoff: 1, sweep: 'off' }, room: 0.3, mute: false }), undefined);
  assert.deepEqual(tidyFx({ pan: -0.5, echo: { amount: 0.4 } }), { pan: -0.5, echo: { amount: 0.4, repeats: 3, beats: 1 } });
});

test('Sound settings, the Room, the limiter and a voice chain save as a valid schema 2 score; put back, it is schema 1 again', () => {
  const plain = docWith([['cello', [[0, 2, 48]]], ['horn', [[0, 2, 60]]]]);
  const [cello, horn] = plain.parts.map(p => p.id) as [string, string];
  let doc = setLaneFx(plain, cello, fx => ({ ...fx, eq: { bass: 4 }, pan: 0.3, solo: true }));
  doc = setMix(doc, m => ({ ...m, room: { preset: 'cathedral', amount: 0.5 }, limiter: { on: true, ceiling_db: -1 } }));
  doc = setVoice(doc, horn, [newVoiceFx('vocoder', cello), newVoiceFx('autotune', cello)]);
  const s = scoreFromDoc(doc, AT);
  const r = parseScore(JSON.parse(JSON.stringify(s)));
  assert.ok(r.ok, r.ok ? '' : r.error);
  assert.equal(s.schema, 2);
  assert.deepEqual(s.lanes[0]!.fx, { pan: 0.3, eq: { bass: 4 }, solo: true });
  assert.deepEqual(s.lanes[1]!.voice!.map(v => v.effect), ['vocoder', 'autotune']);
  assert.deepEqual(s.mix, { style: 'lofi', loudness: -20, room: { preset: 'cathedral', amount: 0.5 }, limiter: { on: true, ceiling_db: -1 } });
  let back = setLaneFx(doc, cello, () => ({}));
  back = setVoice(back, horn, []);
  back = setMix(back, m => ({ ...m, room: { preset: 'dry', amount: 0.5 }, limiter: { on: false, ceiling_db: -1 } }));
  assert.equal(scoreFromDoc(back, AT).schema, 1);
  assert.deepEqual(mixOf(back), { style: 'lofi', loudness: -20 });
});

test('a voice chain processes a block; the live voice asks for the microphone only when started and lets it go', async () => {
  const run = chainProcessor([{ effect: 'robot', mix: 1 }, { effect: 'talkbox', carrier: 'x', mix: 1 }], 48000);
  const out = new Float32Array(2048);
  run(Float32Array.from({ length: 2048 }, (_, i) => Math.sin(i / 10)), out);
  assert.ok(out.every(Number.isFinite));

  let asked = 0;
  const stopped: string[] = [];
  let closed = false;
  const node = { onaudioprocess: null as unknown, connect: (n: unknown) => n, disconnect: () => stopped.push('node') };
  const ports = {
    microphone: async () => { asked++; return { getTracks: () => [{ stop: () => stopped.push('track') }] } as unknown as MediaStream; },
    context: () => ({
      sampleRate: 48000, destination: {},
      createMediaStreamSource: () => ({ connect: () => node, disconnect: () => stopped.push('source') }),
      createScriptProcessor: () => node,
      close: async () => { closed = true; },
    }) as unknown as AudioContext,
  };
  assert.equal(asked, 0);
  const live = await startLiveVoice(ports, [{ effect: 'pitch', semitones: 3, formant: 0 }]);
  assert.equal(asked, 1);
  assert.equal(typeof node.onaudioprocess, 'function');
  live.stop();
  live.stop();
  assert.deepEqual(stopped, ['source', 'node', 'track']);
  assert.equal(closed, true);
  assert.equal(live.running, false);
  assert.equal(node.onaudioprocess, null);
});
