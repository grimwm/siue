// Record A Vocal: floats become 16-bit exactly at the ends; a take lands where it was sung, less the latency, and a
// take begun in the count-in keeps only what came after; the microphone is let go on Stop.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { placeTake, recordVocal, toInt16, REC_BLOCK } from '../src/compose/vocalrec.ts';

test('floats to 16-bit: the ends are -32768 and 32767, and past them is clipped', () => {
  assert.deepEqual([...toInt16(Float32Array.of(-1, 1, 0, 0.5, 2, -3))], [-32768, 32767, 0, 16384, 32767, -32768]);
});

test('a take sits where it was sung: its first sample\'s time in the piece, less the latency', () => {
  assert.deepEqual(placeTake(10.5, 10, 0.1, 48000), { at: 0.4, from: 0 });
  assert.deepEqual(placeTake(9, 10, 0, 48000), { at: 0, from: 48000 }, 'a second into the count-in: that second is dropped');
});

test('recording: chunks in order, the count-in clicked, the backing started on the downbeat, the mic let go', async () => {
  const stopped: string[] = [];
  const started: [string, number][] = [];
  const node = { onaudioprocess: null as null | ((e: unknown) => void), connect: (x: unknown) => x, disconnect() {} };
  const ctx = {
    sampleRate: 48000, currentTime: 2, baseLatency: 0.01, outputLatency: 0.02, destination: {},
    createMediaStreamSource: () => ({ connect: () => node, disconnect() {} }),
    createScriptProcessor: () => node,
    createGain: () => ({ gain: { value: 1, setValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect: (x: unknown) => x }),
    createOscillator: () => ({ frequency: { value: 0 }, connect: (x: unknown) => x, start: (t: number) => started.push(['click', t]), stop() {} }),
    createBufferSource: () => ({ buffer: null, connect() {}, start: (t: number) => started.push(['backing', t]), onended: null }),
    close: async () => { stopped.push('context'); },
  };
  const stream = { getTracks: () => [{ stop: () => stopped.push('mic') }], getAudioTracks: () => [{ getSettings: () => ({ latency: 0.01 }) }] };
  const chunks: [number, number][] = [];
  const rec = await recordVocal({ microphone: async () => stream as unknown as MediaStream, context: () => ctx as unknown as AudioContext },
    { backing: {} as AudioBuffer, beat: 0.5, countIn: 4, clicks: [], onChunk: (seq, pcm) => chunks.push([seq, pcm.length]) });
  assert.deepEqual(started.filter(s => s[0] === 'click').map(s => s[1]), [2.15, 2.65, 3.15, 3.65]);
  assert.deepEqual(started.find(s => s[0] === 'backing'), ['backing', 4.15]);
  const block = (playbackTime: number) => node.onaudioprocess!({ playbackTime, inputBuffer: { getChannelData: () => new Float32Array(REC_BLOCK) } });
  block(4.5);
  block(4.5 + REC_BLOCK / 48000);
  assert.deepEqual(chunks, [[0, REC_BLOCK], [1, REC_BLOCK]]);
  const where = rec.stop();
  const first = 4.5 - REC_BLOCK / 48000;
  assert.ok(Math.abs(where.at - Math.round((first - 4.15 - 0.04) * 1000) / 1000) < 1e-9, JSON.stringify(where));
  assert.equal(where.samples, 2 * REC_BLOCK);
  assert.deepEqual(stopped, ['mic', 'context']);
  rec.stop();
  assert.deepEqual(stopped, ['mic', 'context'], 'a second Stop does nothing');
});
