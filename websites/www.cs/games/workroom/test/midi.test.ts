// Standard MIDI Files: reading one made by another writer (running status, velocity-0 offs, a drum channel, a pitch
// bend), writing the editor's document (drums on channel 10, each part's General MIDI program), and refusing a file
// that ends early.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ImportError, readMidi, writeMidi } from '../src/compose/midi.ts';
import { docWith, ENTRIES } from './compose-fixture.ts';

const fixture = (name: string): Uint8Array => new Uint8Array(readFileSync(join(import.meta.dirname, 'fixtures', 'import', name)));
const list = (notes: readonly { start: number; length: number; pitch: number }[]) => notes.map(n => [n.start, n.length, n.pitch]);

test('reads the GM fixture made by another writer', () => {
  const m = readMidi(fixture('gm-band.mid'));
  assert.equal(m.format, 'MIDI');
  assert.equal(m.title, 'GM Band');
  assert.deepEqual(m.tempo, [{ bar: 1, bpm: 100, beats: 3, unit: 4 }]);
  assert.deepEqual(m.parts.map(p => [p.name, p.program, p.drums]), [['Piano', 1, false], ['Bass', 33, false], ['Drums', null, true]]);
  assert.deepEqual(list(m.parts[0]!.notes), [[0, 1, 60], [0, 1, 64], [0, 1, 67], [1, 2, 62]]);
  assert.deepEqual(m.parts[0]!.notes.map(n => n.velocity), [90, 80, 70, 100]);
  assert.deepEqual(list(m.parts[1]!.notes), [[0, 3, 36], [3, 1.5, 31]]);
  assert.deepEqual(list(m.parts[2]!.notes), [[0, 0.25, 36], [0, 0.25, 42], [0.5, 0.25, 42], [1, 0.25, 38], [1, 0.25, 42], [1.5, 0.25, 42], [2, 0.25, 36]]);
  assert.ok(m.lost.some(l => /pitch-wheel/i.test(l)), m.lost.join(' | '));
  assert.ok(m.lost.some(l => /key and clef/i.test(l)));
});

test('a sustain pedal holds notes until it lifts', () => {
  const bytes = smf([[0, 0xb0, 64, 127], [0, 0x90, 60, 90], [96, 0x80, 60, 0], [384, 0xb0, 64, 0]]);
  assert.deepEqual(list(readMidi(bytes).parts[0]!.notes), [[0, 4, 60]]);
});

test('a speed change in the middle of a bar moves to the next bar, and says so', () => {
  const bytes = smf([[0, 0x90, 60, 90], [96 * 5, 0x80, 60, 0]], [[96 * 2, 0xff, 0x51, 500000]]);
  const m = readMidi(bytes);
  assert.deepEqual(m.tempo, [{ bar: 1, bpm: 120, beats: 4, unit: 4 }]);
  const two = readMidi(smf([[0, 0x90, 60, 90], [96 * 9, 0x80, 60, 0]], [[96 * 2, 0xff, 0x51, 1_000_000]]));
  assert.deepEqual(two.tempo, [{ bar: 1, bpm: 120, beats: 4, unit: 4 }, { bar: 2, bpm: 60, beats: 4, unit: 4 }]);
  assert.ok(two.lost.some(l => /middle of bar 1/.test(l)), two.lost.join(' | '));
});

test('writes drums on channel 10 and each part\'s General MIDI program', () => {
  const doc = docWith([['horn', [[0, 1, 53]]], ['kit', [[0, 1, 36]]], ['cello', [[1, 2, 48]]]]);
  const bytes = writeMidi(doc, ENTRIES);
  assert.equal(new TextDecoder().decode(bytes.slice(0, 4)), 'MThd');
  const hex = Buffer.from(bytes).toString('hex');
  assert.ok(hex.includes('c03c'), 'horn: program 61 on channel 1');
  assert.ok(hex.includes('9924'), 'kick on channel 10');
  assert.ok(hex.includes('c12a'), 'cello: program 43 on channel 2');
  const back = readMidi(bytes);
  assert.deepEqual(back.parts.map(p => [p.name, p.program, p.drums]), [['French Horn', 61, false], ['Drum Kit', null, true], ['Cello', 43, false]]);
  assert.deepEqual(list(back.parts[2]!.notes), [[1, 2, 48]]);
  assert.deepEqual(back.tempo, [{ bar: 1, bpm: 92, beats: 4, unit: 4 }]);
});

test('refuses a file that is not MIDI or ends early', () => {
  assert.throws(() => readMidi(new TextEncoder().encode('hello')), ImportError);
  const good = fixture('gm-band.mid');
  assert.throws(() => readMidi(good.slice(0, good.length - 10)), (e: unknown) => e instanceof ImportError && /ends early|cut short/i.test(e.message));
});

/** A format-0 file at 96 ticks to the quarter: [tick, status, data1, data2] channel events and [tick, 0xff, type, value] tempo metas. */
function smf(events: [number, number, number, number][], metas: [number, number, number, number][] = []): Uint8Array {
  const all = [...metas.map(m => ({ t: m[0], raw: [0xff, 0x51, 3, (m[3] >> 16) & 255, (m[3] >> 8) & 255, m[3] & 255] })),
    ...events.map(e => ({ t: e[0], raw: [e[1], e[2], e[3]] }))].sort((a, b) => a.t - b.t);
  const body: number[] = [];
  let now = 0;
  const vlq = (n: number): number[] => { const out = [n & 0x7f]; n >>= 7; while (n) { out.unshift(0x80 | (n & 0x7f)); n >>= 7; } return out; };
  for (const e of all) { body.push(...vlq(e.t - now), ...e.raw); now = e.t; }
  body.push(0, 0xff, 0x2f, 0);
  const len = body.length;
  return new Uint8Array([0x4d, 0x54, 0x68, 0x64, 0, 0, 0, 6, 0, 0, 0, 1, 0, 96, 0x4d, 0x54, 0x72, 0x6b, (len >> 24) & 255, (len >> 16) & 255, (len >> 8) & 255, len & 255, ...body]);
}
