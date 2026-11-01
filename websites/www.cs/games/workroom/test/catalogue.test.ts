// The instrument catalogue the editor reads out of the shared library: categories, ranges, written pitch and drum pieces.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { catalogue, CATEGORIES, defaultSound, intervalWords, laneFamily, rangeClass, writtenPitch } from '../src/catalogue.ts';
import type { Entry } from '../src/catalogue.ts';
import type { Library } from '../src/render/plan.ts';

const read = (path: string): Library => JSON.parse(readFileSync(path, 'utf8'));
const LIBRARY = read(join(import.meta.dirname, '..', '..', '..', 'music', 'library', 'library.json'));
const entries = catalogue(LIBRARY);
const get = (id: string): Entry => entries.find(e => e.id === id)!;

test('catalogue lists 27 in category order', () => {
  assert.equal(entries.length, 27);
  assert.deepEqual(entries.map(e => e.id), ['violin', 'viola', 'cello', 'bass', 'harp', 'lyre', 'flute', 'piccolo', 'oboe', 'clarinet', 'bassoon',
    'trumpet', 'horn', 'trombone', 'tuba', 'piano', 'organ', 'celesta', 'timpani', 'glock', 'xylo', 'marimba', 'vibes', 'bells', 'kit', 'orch',
    'choir']);
  assert.deepEqual(CATEGORIES.map(c => c.label), ['Strings', 'Woodwinds', 'Brass', 'Keyboards', 'Pitched Percussion', 'Drums & Percussion', 'Voices']);
  assert.equal(get('bass').name, 'Double Bass');
  assert.equal(get('horn').gmName, 'French Horn');
});

test('double bass writes an octave up', () => {
  assert.equal(writtenPitch(get('bass'), 28), 40);
});

test('glock writes two octaves down', () => {
  assert.equal(writtenPitch(get('glock'), 96), 72);
});

test('B-flat clarinet and trumpet write a major second up, the horn in F a perfect fifth up', () => {
  assert.equal(get('clarinet').written, 2);
  assert.equal(get('trumpet').written, 2);
  assert.equal(get('horn').written, 7);
  assert.equal(writtenPitch(get('horn'), 53), 60); // sounding F3 is written C4
});

test('the written interval in words', () => {
  assert.equal(intervalWords(12), 'an octave above');
  assert.equal(intervalWords(-12), 'an octave below');
  assert.equal(intervalWords(-24), 'two octaves below');
  assert.equal(intervalWords(7), 'a perfect fifth above');
  assert.equal(intervalWords(2), 'a major second above');
  assert.equal(intervalWords(14), 'a major ninth above');
});

test('range classes', () => {
  const violin = get('violin');
  assert.equal(rangeClass(violin, 60), 'normal');
  assert.equal(rangeClass(violin, 103), 'expert');
  assert.equal(rangeClass(violin, 110), 'out');
  assert.equal(rangeClass(violin, 40), 'out');
});

test('drum classes', () => {
  const kit = get('kit');
  assert.equal(rangeClass(kit, 36), 'normal');
  assert.equal(rangeClass(kit, 37), 'out');
  assert.deepEqual(kit.pieces?.[0], [36, 'Kick']);
  assert.equal(kit.clef, 'percussion');
  assert.equal(kit.range, null);
});

test('stand-ins carry their note', () => {
  for (const [id, target] of [['celesta', 'glock'], ['choir', 'organ']] as const) {
    assert.equal(get(id).standin, target, id);
    assert.ok(get(id).standinNote, id);
  }
  assert.equal(get('vibes').standin, null);
  assert.ok(get('lyre').standinNote, 'the lyre says it plays a folk harp');
  assert.equal(get('violin').standin, null);
  assert.equal(get('violin').standinNote, null);
});

test('lane families and default sounds', () => {
  assert.equal(laneFamily(get('harp')), 'harp');
  assert.equal(laneFamily(get('lyre')), 'harp');
  assert.equal(get('lyre').icon, 'lyre');
  assert.equal(get('violin').icon, 'strings');
  assert.deepEqual(defaultSound(get('lyre')), { instrument: 'lyre', gain_db: 0, attack: 0.02, release: 2.5 });
  assert.equal(laneFamily(get('cello')), 'strings');
  assert.equal(laneFamily(get('kit')), 'percussion');
  assert.equal(laneFamily(get('glock')), 'percussion');
  assert.equal(laneFamily(get('choir')), 'choir');
  assert.deepEqual(defaultSound(get('vibes')), { instrument: 'vibes', gain_db: 0, attack: 0.005, release: 1.8 });
  assert.deepEqual(defaultSound(get('choir')), { instrument: 'choir', gain_db: 0, attack: 0.25, release: 0.6 });
});

test('an old library.json without catalogue fields gives an empty catalogue and does not throw', () => {
  assert.deepEqual(catalogue(read(join(import.meta.dirname, 'fixtures', 'library-before-catalogue.json'))), []);
});

test('an entry with a category the page does not know is left out', () => {
  const lib: Library = { ...LIBRARY, instruments: { theremin: { files: [], name: 'Theremin', category: 'electronic' } } };
  assert.deepEqual(catalogue(lib), []);
});
