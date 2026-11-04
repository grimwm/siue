import assert from 'node:assert/strict';
import { test } from 'node:test';
import { rangeClass } from '../src/catalogue.ts';
import { barsNeeded, scoreFromDoc } from '../src/compose/doc.ts';
import { TEMPLATES, templateDoc, templateEntry } from '../src/compose/templates.ts';
import { parseScore } from '../src/score.ts';
import { ENTRIES, entry } from './compose-fixture.ts';

const AT = { piece: { id: 'start', title: 'Start' }, project: { id: 'songs', name: 'Songs' }, draft: 1, made: '2026-11-03T12:00:00Z' };
const ids = new Set(ENTRIES.map(e => e.id));

test('every template with tracks builds, saves and passes the page validator', () => {
  // An Empty Song is like any new piece: nothing to save until it has a track.
  for (const t of TEMPLATES) {
    const doc = templateDoc(t.id, ENTRIES, t.name);
    assert.equal(doc.title, t.name);
    if (t.id === 'empty') continue;
    const parsed = parseScore(scoreFromDoc(doc, AT), ids);
    assert.ok(parsed.ok, `${t.id}: ${parsed.ok ? '' : parsed.error}`);
  }
});

test('every instrument a template names or plays is in the catalogue', () => {
  for (const t of TEMPLATES) {
    for (const id of t.pictures) assert.ok(templateEntry(ENTRIES, id), `${t.id} picture ${id}`);
    for (const p of templateDoc(t.id, ENTRIES, 'x').parts) assert.ok(ids.has(p.instrument), `${t.id} plays ${p.instrument}`);
  }
});

test('the real library has the named instruments themselves', () => {
  for (const id of ['kit', 'bass', 'piano', 'marimba']) assert.equal(templateEntry(ENTRIES, id)?.id, id);
});

test('Just A Beat: four bars of drums at 100 BPM on the kit\'s own pieces', () => {
  const doc = templateDoc('beat', ENTRIES, 'Beat');
  assert.equal(doc.parts.length, 1);
  assert.equal(doc.tempo[0]!.bpm, 100);
  assert.equal(barsNeeded(doc), 4);
  const kit = entry('kit');
  const pieces = new Set(kit.pieces!.map(([p]) => p));
  const notes = doc.parts[0]!.notes;
  assert.ok(notes.length > 30);
  for (const n of notes) assert.ok(pieces.has(n.pitch), `drum ${n.pitch}`);
  for (const p of [36, 38, 42]) assert.ok(notes.some(n => n.pitch === p), `uses ${p}`);
  assert.ok(doc.parts[0]!.regions?.length);
});

test('Beat + Bass: the bass walks C, A, F, G inside the double bass\'s range', () => {
  const doc = templateDoc('bass', ENTRIES, 'Bass');
  assert.deepEqual(doc.parts.map(p => p.instrument), ['kit', 'bass']);
  const bass = doc.parts[1]!;
  for (const n of bass.notes) assert.notEqual(rangeClass(entry('bass'), n.pitch), 'out', `bass ${n.pitch}`);
  const roots = [0, 4, 8, 12].map(b => bass.notes.find(n => n.start === b)!.pitch % 12);
  assert.deepEqual(roots, [0, 9, 5, 7]);
});

test('Full Band: 8 bars at 104 BPM, four tracks, Verse and Chorus, a riser into bar 5, a drum fill', () => {
  const doc = templateDoc('band', ENTRIES, 'Band');
  assert.equal(doc.tempo[0]!.bpm, 104);
  assert.equal(barsNeeded(doc), 8);
  assert.deepEqual(doc.parts.map(p => p.instrument), ['kit', 'bass', 'piano', 'marimba']);
  assert.deepEqual(doc.sections?.map(s => [s.name, s.from, s.to]), [['Verse', 1, 4], ['Chorus', 5, 8]]);
  const risers = (doc.fxClips ?? []).filter(c => c.effect === 'riser');
  assert.equal(risers.length, 1);
  assert.equal(risers[0]!.lane, null);
  assert.equal(risers[0]!.to_bar, 5);
  const kit = doc.parts[0]!;
  assert.ok(kit.notes.some(n => n.pitch === 50 && n.start >= 12 && n.start < 16), 'a tom in the fill bar');
  for (const p of doc.parts.slice(1)) for (const n of p.notes) assert.notEqual(rangeClass(entry(p.instrument), n.pitch), 'out', `${p.instrument} ${n.pitch}`);
});

test('Empty Song: no tracks, 4 bars at 100 BPM', () => {
  const doc = templateDoc('empty', ENTRIES, 'Empty');
  assert.equal(doc.parts.length, 0);
  assert.equal(doc.tempo[0]!.bpm, 100);
  assert.equal(barsNeeded(doc), 4);
});

test('a missing instrument falls back to a stand-in', () => {
  const without = ENTRIES.filter(e => e.id !== 'marimba' && e.id !== 'bass');
  const doc = templateDoc('band', without, 'Band');
  assert.deepEqual(doc.parts.map(p => p.instrument), ['kit', 'cello', 'piano', 'vibes']);
});
