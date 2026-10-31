// The render plan: which sample, rate, level and envelope each note of a renderable score plays with.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { regions, SFIZZ_LEVEL, velocityGain, voices } from '../src/render/plan.ts';
import type { Library } from '../src/render/plan.ts';
import { parseScore } from '../src/score.ts';
import type { Score } from '../src/score.ts';

const LIBRARY: Library = JSON.parse(readFileSync(join(import.meta.dirname, '..', '..', '..', 'music', 'library', 'library.json'), 'utf8'));
const fixture = (): Score => {
  const r = parseScore(JSON.parse(readFileSync(join(import.meta.dirname, 'fixtures', 'score-renderable-v1.json'), 'utf8')));
  assert.ok(r.ok);
  return r.score;
};

test('the harp regions match sfz.regions for its real roots: split halfway between neighbours, reaching 0 and 127', () => {
  // [lokey, hikey, root] as music/compose/siue_compose/sfz.py regions() gives them for library.json's harp.
  const want = [[0, 29, 28], [30, 33, 31], [34, 36, 35], [37, 39, 38], [40, 43, 41], [44, 46, 45], [47, 50, 48], [51, 53, 52],
    [54, 57, 55], [58, 60, 59], [61, 63, 62], [64, 67, 65], [68, 70, 69], [71, 74, 72], [75, 77, 76], [78, 81, 79], [82, 84, 83],
    [85, 87, 86], [88, 91, 89], [92, 94, 93], [95, 96, 95], [97, 99, 98], [100, 127, 101]];
  assert.deepEqual(regions(LIBRARY.instruments['harp']!.files).map(r => [r.lo, r.hi, r.file.pitch]), want);
});

test('regions do not depend on the order of the files', () => {
  const files = LIBRARY.instruments['harp']!.files;
  assert.deepEqual(regions([...files].reverse()), regions(files));
});

const harpScore = (pitches: number[], extra: Partial<Score> = {}): Score => ({
  ...fixture(),
  lanes: [{ id: 'harp', name: 'Harp', family: 'harp', icon: 'harp', color: '#aabbcc', sound: { instrument: 'harp', gain_db: 0, attack: 0.01, release: 1.5 } }],
  motifs: [],
  notes: pitches.map((pitch, i) => ({ lane: 'harp', start: i, length: 0.5, pitch, velocity: 127, motif: null })),
  ...extra,
});

test('one voice per note, with the region of its pitch, its time and the lane envelope', () => {
  const s = fixture();
  const v = voices(s, LIBRARY);
  assert.equal(v.length, s.notes.length);
  v.forEach((voice, i) => {
    const n = s.notes[i]!;
    assert.equal(voice.lane, n.lane);
    assert.equal(voice.at, n.start);
    assert.equal(voice.dur, n.length);
    const sound = s.lanes.find(l => l.id === n.lane)!.sound!;
    assert.deepEqual([voice.attack, voice.release], [sound.attack, sound.release]);
    assert.deepEqual(voice.loop, LIBRARY.instruments[sound.instrument]!.loop);
  });
});

test('a sample at its own root plays at rate 1, an octave up at rate 2', () => {
  const [atRoot, semitoneDown] = voices(harpScore([28, 40]), LIBRARY);
  assert.equal(atRoot!.file, 'harp/28.flac');
  assert.equal(atRoot!.rate, 1);
  assert.equal(semitoneDown!.file, 'harp/41.flac');
  assert.ok(Math.abs(semitoneDown!.rate - 2 ** (-1 / 12)) < 1e-12);
  const oneSample: Library = { ...LIBRARY, instruments: { harp: { files: [LIBRARY.instruments['harp']!.files[0]!] } } };
  assert.equal(voices(harpScore([28 + 12]), oneSample)[0]!.rate, 2);
  assert.equal(atRoot!.loop, null, 'the harp has no loop');
});

test('velocity gain follows sfizz with amp_veltrack=80; the lane gain multiplies it', () => {
  assert.equal(velocityGain(127), 1);
  assert.ok(Math.abs(velocityGain(0) - 0.2) < 1e-12);
  assert.ok(Math.abs(velocityGain(64) - (0.2 + 0.8 * (64 / 127) ** 2)) < 1e-12);
  const s = harpScore([60]);
  s.notes[0]!.velocity = 64;
  s.lanes[0]!.sound!.gain_db = 6;
  assert.ok(Math.abs(voices(s, LIBRARY)[0]!.gain - SFIZZ_LEVEL * 10 ** (6 / 20) * velocityGain(64)) < 1e-12);
});

// sfizz_render plays a sample at velocity 127 at 0.2654 of its own level in each channel (measured in the composing
// container on the harp, horn, organ and cello), so the master's soft clip and hiss meet the music at render.py's levels.
test('a voice plays at sfizz_render\'s own level: velocity 127 on a 0 dB lane is 0.2654', () => {
  assert.ok(Math.abs(SFIZZ_LEVEL - 0.2654) < 1e-4);
  const s = harpScore([60]);
  s.notes[0]!.velocity = 127;
  s.lanes[0]!.sound!.gain_db = 0;
  assert.equal(voices(s, LIBRARY)[0]!.gain, SFIZZ_LEVEL);
});

test('a lane without a sound or with an instrument the library lacks is refused', () => {
  const s = harpScore([60]);
  delete s.lanes[0]!.sound;
  assert.throws(() => voices(s, LIBRARY), /harp.*no sound/);
  const t = harpScore([60]);
  t.lanes[0]!.sound!.instrument = 'kazoo';
  assert.throws(() => voices(t, LIBRARY), /kazoo/);
});

const KIT: Library = {
  ...LIBRARY,
  instruments: { kit: { pitched: false, files: [{ pitch: 36, file: 'kit/36.flac', rate: 44100, channels: 2 }, { pitch: 38, file: 'kit/38.flac', rate: 44100, channels: 2 }] } },
};
const kitScore = (pitches: number[]): Score => ({
  ...harpScore(pitches),
  lanes: [{ id: 'harp', name: 'Drums', family: 'percussion', icon: 'percussion', color: '#aabbcc', sound: { instrument: 'kit', gain_db: 0, attack: 0.005, release: 0.4 } }],
});

test('unpitched regions are one key each', () => {
  assert.deepEqual(regions(KIT.instruments['kit']!.files, false).map(r => [r.lo, r.hi, r.file.pitch]), [[36, 36, 36], [38, 38, 38]]);
});

test('an unpitched note with no sample makes no voice', () => {
  const vs = voices(kitScore([36, 37, 38]), KIT);
  assert.deepEqual(vs.map(v => [v.file, v.rate]), [['kit/36.flac', 1], ['kit/38.flac', 1]]);
});

test('pitched regions unchanged', () => {
  const files = LIBRARY.instruments['cello']!.files;
  assert.deepEqual(regions(files, true), regions(files));
});
