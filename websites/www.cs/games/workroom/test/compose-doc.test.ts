// The editor's document: beats through tempo changes, a score opened for editing and saved back as a valid,
// renderable draft that keeps what the editor does not touch (motifs, sections, characters, changes, the glossary).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beatClock } from '../src/compose/beats.ts';
import { docFromScore, newDoc, scoreFromDoc } from '../src/compose/doc.ts';
import { catalogue } from '../src/catalogue.ts';
import { parseScore } from '../src/score.ts';
import type { Score } from '../src/score.ts';
import type { Library } from '../src/render/plan.ts';

const read = (p: string): unknown => JSON.parse(readFileSync(p, 'utf8'));
const fixture = (name: string): Score => read(join(import.meta.dirname, 'fixtures', name)) as Score;
const ENTRIES = catalogue(read(join(import.meta.dirname, '..', '..', '..', 'music', 'library', 'library.json')) as Library);
const AT = { piece: { id: 'test-piece', title: 'Test piece: the Labyrinth wakes' }, project: { id: 'crete', name: 'Crete' }, draft: 2, made: '2026-10-31T12:00:00Z' };
const close = (a: number, b: number, msg?: string) => assert.ok(Math.abs(a - b) < 1e-6, `${a} ≈ ${b} ${msg ?? ''}`);

test('beats are the tempo\'s own beat, through a tempo change', () => {
  const clock = beatClock([{ bar: 1, bpm: 120, beats: 4, unit: 4 }, { bar: 3, bpm: 60, beats: 3, unit: 4 }]);
  close(clock.seconds(4), 2, 'bar 2 at 120');
  close(clock.seconds(8), 4, 'bar 3 starts after two bars of four at 120');
  close(clock.seconds(11), 7, 'one bar of three at 60');
  close(clock.beat(7), 11);
  assert.equal(clock.barStartBeat(4), 11);
  assert.equal(clock.barOfBeat(10.9), 3);
  assert.equal(clock.barOfBeat(11), 4);
  assert.equal(beatClock([{ bar: 1, bpm: 90, beats: 6, unit: 8 }]).quarter(1), 2, 'a quarter is two eighth-beats in 6/8');
  assert.equal(beatClock([{ bar: 1, bpm: 60, beats: 2, unit: 2 }]).quarter(1), 0.5, 'and half a beat in 2/2');
});

test('a renderable score opens and saves back unchanged but for its draft', () => {
  const score = fixture('score-renderable-v1.json');
  const doc = docFromScore(score, ENTRIES);
  assert.deepEqual(doc.parts.map(p => [p.id, p.instrument, p.notes.length]), [['strings-low', 'cello', 3], ['brass', 'horn', 3]]);
  assert.equal(doc.parts[0]!.notes[0]!.start, 0);
  assert.equal(doc.parts[0]!.notes[0]!.length, 4, 'two seconds at 120 is four beats');
  const saved = scoreFromDoc(doc, AT);
  const parsed = parseScore(saved, new Set(ENTRIES.map(e => e.id)));
  assert.ok(parsed.ok, parsed.ok ? '' : parsed.error);
  assert.equal(saved.draft, 2);
  assert.equal(saved.made, AT.made);
  assert.deepEqual([saved.duration, saved.bars, saved.tempo], [score.duration, score.bars, score.tempo]);
  for (const k of ['sections', 'characters', 'motifs', 'glossary', 'changes', 'energy', 'mix', 'lanes'] as const) assert.deepEqual(saved[k], score[k], k);
  const key = (n: Score['notes'][number]) => `${n.lane} ${n.start} ${n.length} ${n.pitch} ${n.velocity} ${n.motif}`;
  assert.deepEqual(saved.notes.map(key).sort(), score.notes.map(key).sort());
});

test('a draft with audio and lanes without a sound saves as a renderable score of the family\'s instrument', () => {
  const score = fixture('score-v1.json');
  const doc = docFromScore(score, ENTRIES);
  assert.deepEqual(doc.parts.map(p => p.instrument), ['cello', 'horn']);
  const saved = scoreFromDoc(doc, AT);
  assert.deepEqual(saved.audio, []);
  assert.equal(saved.spectrogram, undefined);
  assert.deepEqual(saved.mix, { style: 'lofi', loudness: -20 });
  assert.equal(saved.musicxml, 'score.musicxml');
  const parsed = parseScore(saved);
  assert.ok(parsed.ok, parsed.ok ? '' : parsed.error);
});

test('notes past the last bar grow the piece and its last section; the energy line stretches', () => {
  const score = fixture('score-renderable-v1.json');
  const doc = docFromScore(score, ENTRIES);
  doc.parts[0]!.notes.push({ id: 999, start: 33, length: 2, pitch: 40, velocity: 90, motif: null });
  const saved = scoreFromDoc(doc, AT);
  assert.equal(saved.bars, 9, 'beat 35 ends inside bar 9');
  close(saved.duration, 18);
  assert.equal(saved.sections.at(-1)!.to_bar, 9);
  close(saved.energy.at(-1)![0], 18);
  close(saved.energy[1]![0], score.energy[1]![0] * 18 / 16, 'scaled with the piece');
  assert.ok(parseScore(saved).ok);
});

test('bars never shrink below the piece\'s own, so its sections and changes still fit', () => {
  const doc = docFromScore(fixture('score-renderable-v1.json'), ENTRIES);
  for (const p of doc.parts) p.notes = [];
  const saved = scoreFromDoc(doc, AT);
  assert.equal(saved.bars, 8);
  assert.ok(parseScore(saved).ok);
});

test('a removed part takes its motif spans with it, and changes about it name no lane', () => {
  const doc = docFromScore(fixture('score-renderable-v1.json'), ENTRIES);
  doc.parts = doc.parts.filter(p => p.id !== 'brass');
  const saved = scoreFromDoc(doc, AT);
  assert.deepEqual(saved.motifs[0]!.spans, []);
  assert.equal(saved.changes[0]!.lane, null);
  assert.ok(parseScore(saved).ok);
});

test('a new piece is 92 BPM in 4/4, four bars, one section; with a part it saves and parses', () => {
  const doc = newDoc('My First Tune');
  assert.deepEqual(doc.tempo, [{ bar: 1, bpm: 92, beats: 4, unit: 4 }]);
  assert.equal(doc.bars, 4);
  const cello = ENTRIES.find(e => e.id === 'cello')!;
  doc.parts.push({ id: 'cello', name: 'Cello', color: '#7a9cc6', family: 'strings', icon: 'strings', instrument: 'cello', gain_db: 0, attack: cello.attack, release: cello.release,
    notes: [{ id: 1, start: 0, length: 1, pitch: 48, velocity: 90, motif: null }, { id: 2, start: 0, length: 1, pitch: 55, velocity: 90, motif: null }] });
  const saved = scoreFromDoc(doc, { ...AT, piece: { id: 'my-first-tune', title: 'My First Tune' }, project: { id: 'my-pieces', name: 'My Pieces' }, draft: 1 });
  const parsed = parseScore(saved, new Set(ENTRIES.map(e => e.id)));
  assert.ok(parsed.ok, parsed.ok ? '' : parsed.error);
  close(saved.duration, 4 * 4 * 60 / 92);
  assert.deepEqual(saved.sections, [{ id: 'whole', name: 'The Whole Piece', color: '#5a6b7a', from_bar: 1, to_bar: 4 }]);
  close(saved.notes[1]!.length, 60 / 92);
  assert.deepEqual(saved.notes.map(n => n.pitch), [48, 55], 'a chord keeps both notes');
});

test('the orchestra fixture with drums round-trips its notes', () => {
  const score = fixture(join('draft-orchestra', 'score.json'));
  const saved = scoreFromDoc(docFromScore(score, ENTRIES), AT);
  assert.equal(saved.notes.length, score.notes.length);
  assert.ok(parseScore(saved, new Set(ENTRIES.map(e => e.id))).ok);
});

test('a new piece gets an id of its own from its title, and a project by name', async () => {
  const { pieceIdFor, projectFor } = await import('../src/compose/newpiece.ts');
  assert.equal(pieceIdFor('My First Tune!', new Set()), 'my-first-tune');
  assert.equal(pieceIdFor('My First Tune', new Set(['my-first-tune', 'my-first-tune-2'])), 'my-first-tune-3');
  assert.equal(pieceIdFor('Café Ünïcode', new Set()), 'cafe-unicode');
  assert.equal(pieceIdFor('***', new Set()), 'piece');
  assert.match(pieceIdFor('x'.repeat(100), new Set()), /^x{40}$/);
  const projects = [{ id: 'crete', name: 'Crete' }];
  assert.deepEqual(projectFor('crete', projects), { id: 'crete', name: 'Crete' });
  assert.deepEqual(projectFor('  ', projects), { id: 'my-pieces', name: 'My Pieces' });
  assert.deepEqual(projectFor('Game Jam', projects), { id: 'game-jam', name: 'Game Jam' });
  assert.deepEqual(projectFor('Crete!', projects), { id: 'crete-2', name: 'Crete!' });
});
