// Sections tile the piece: added over bars (the others make room, one cut in two keeps its name on both sides),
// renamed with their name's colour, removed into a neighbour; moved and duplicated with everything in their bars —
// notes (a note crossing out of the section goes with its start bar), regions, effect clips and their moves, markers,
// the tempo list through a meter change, the tempo line, loudness lines, vocal clips and the sections themselves.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { docWith } from './compose-fixture.ts';
import { scoreFromDoc } from '../src/compose/doc.ts';
import type { EditDoc } from '../src/compose/doc.ts';
import { fitRegions } from '../src/compose/regions.ts';
import { SECTION_NAMES, addSection, duplicateSection, moveSection, removeSection, renameSection, sectionColor, sectionsOf } from '../src/compose/sections.ts';
import { newVocalPart } from '../src/compose/vocal.ts';
import { parseScore } from '../src/score.ts';

const AT = { piece: { id: 'test', title: 'Test' }, project: { id: 'mine', name: 'Mine' }, draft: 1, made: '2026-11-03T00:00:00Z' };
const brief = (d: EditDoc) => sectionsOf(d).map(s => [s.id, s.name, s.from, s.to]);
const TAKE = `vocal-${'a'.repeat(64)}.flac`;

test('the five names have their own colours; any other name shares one', () => {
  assert.deepEqual(SECTION_NAMES, ['Intro', 'Verse', 'Chorus', 'Bridge', 'Outro']);
  assert.equal(new Set(SECTION_NAMES.map(sectionColor)).size, 5);
  assert.equal(sectionColor('Breakdown'), sectionColor('The Whole Piece'));
  assert.ok(!SECTION_NAMES.map(sectionColor).includes(sectionColor('Breakdown')));
});

test('a piece starts as one section; added sections take their bars and the rest make room', () => {
  let d: EditDoc = { ...docWith([['piano', [[0, 1, 60]]]]), bars: 8 };
  assert.deepEqual(brief(d), [['whole', 'The Whole Piece', 1, 8]]);
  const chorus = addSection(d, 'Chorus', 3, 4);
  d = chorus.doc;
  assert.equal(chorus.id, 'chorus');
  assert.deepEqual(brief(d), [['whole', 'The Whole Piece', 1, 2], ['chorus', 'Chorus', 3, 4], ['the-whole-piece', 'The Whole Piece', 5, 8]], 'cut in two: the right-hand side gets a new id');
  assert.equal(sectionsOf(d)[1]!.color, sectionColor('Chorus'));
  d = addSection(d, 'Intro', 1, 2).doc;
  assert.deepEqual(brief(d).map(s => s[1]), ['Intro', 'Chorus', 'The Whole Piece']);
  d = addSection(d, 'Chorus', 4, 10).doc;
  assert.deepEqual(brief(d), [['intro', 'Intro', 1, 2], ['chorus', 'Chorus', 3, 3], ['chorus-2', 'Chorus', 4, 10]], 'the piece grows to hold it');
  assert.equal(d.bars, 10);
  d = renameSection(d, 'chorus-2', 'Outro');
  assert.deepEqual(sectionsOf(d)[2]!.name, 'Outro');
  assert.equal(sectionsOf(d)[2]!.color, sectionColor('Outro'));
  assert.equal(renameSection(d, 'nope', 'X'), d);
  d = removeSection(d, 'chorus');
  assert.deepEqual(brief(d), [['intro', 'Intro', 1, 3], ['chorus-2', 'Outro', 4, 10]], 'its bars join the one before');
  d = removeSection(d, 'intro');
  assert.deepEqual(brief(d), [['chorus-2', 'Outro', 1, 10]], 'the first joins the one after');
  assert.equal(removeSection(d, 'chorus-2'), d, 'the last cannot go');
  assert.equal(d.parts[0]!.notes.length, 1, 'the music stays');
});

/**
 * Bars 1–2 in 4/4 at 100 BPM (Intro), bars 3–4 in 3/4 at 120 (Verse), bar 5 (Outro), with something of every kind in
 * them. Beats: bar 1 at 0, bar 2 at 4, bar 3 at 8, bar 4 at 11, bar 5 at 14, the end at 17.
 */
function piece(): EditDoc {
  let d = docWith([['piano', [[0.5, 1, 60], [7, 3, 62], [9, 1, 64]]], ['cello', [[12, 1, 40]]]],
    [{ bar: 1, bpm: 100, beats: 4, unit: 4 }, { bar: 3, bpm: 120, beats: 3, unit: 4 }]);
  d = fitRegions(d);
  const vocal = newVocalPart('voice', 'Voice', '#123456');
  vocal.vocal = { takes: [{ file: TAKE, seconds: 2 }], clips: [{ take: TAKE, at: 5.3, from: 0, to: 0.5, gain_db: 0, fade_in: 0, fade_out: 0 }] };
  return {
    ...d, bars: 5,
    parts: [{ ...d.parts[0]!, dynamics: [{ bar: 1, level: 48, shape: 'louder' }, { bar: 3, level: 100, shape: 'steady' }] }, d.parts[1]!, vocal],
    fxClips: [
      { effect: 'scratch', lane: null, from_bar: 1, to_bar: 1.5, points: [[1, 1], [1.25, -1], [1.5, 1]] },
      { effect: 'stutter', lane: d.parts[0]!.id, from_bar: 3.5, to_bar: 3.75 },
      { effect: 'hot_cue', lane: null, from_bar: 4, to_bar: 4.5, settings: { cue_bar: 1.5 } },
    ],
    markers: [{ beat: 1, name: 'Start' }, { beat: 9, name: 'Verse' }],
    sections: [
      { id: 'intro', name: 'Intro', color: sectionColor('Intro'), from: 1, to: 2 }, { id: 'verse', name: 'Verse', color: sectionColor('Verse'), from: 3, to: 4 },
      { id: 'outro', name: 'Outro', color: sectionColor('Outro'), from: 5, to: 5 },
    ],
  };
}

test('a moved section takes everything in its bars; the rest close up', () => {
  const d0 = piece();
  assert.deepEqual(d0.parts[0]!.regions!.map(r => [r.start, r.length]), [[0, 11]], 'one region over bars 1 to 3');
  const d = moveSection(d0, 'verse', 1);
  assert.deepEqual(brief(d), [['verse', 'Verse', 1, 2], ['intro', 'Intro', 3, 4], ['outro', 'Outro', 5, 5]]);
  assert.deepEqual(d.tempo, [{ bar: 1, bpm: 120, beats: 3, unit: 4 }, { bar: 3, bpm: 100, beats: 4, unit: 4 }, { bar: 5, bpm: 120, beats: 3, unit: 4 }],
    'the meter and tempo go with their bars');
  const piano = d.parts[0]!;
  assert.deepEqual(piano.notes.map(n => [n.start, n.length, n.pitch]), [[1, 1, 64], [6.5, 1, 60], [13, 3, 62]],
    'each note keeps its place in its bar; the one crossing out of bar 2 goes with bar 2');
  assert.deepEqual(piano.notes.map(n => n.id).sort(), d0.parts[0]!.notes.map(n => n.id).sort(), 'and its id');
  assert.deepEqual(piano.regions!.map(r => [r.start, r.length]), [[0, 3], [6, 8]], 'the region was cut at the section\'s edge first');
  assert.deepEqual(d.parts[1]!.notes.map(n => n.start), [4], 'bar 4 is new bar 2');
  assert.deepEqual(d.parts[1]!.regions!.map(r => [r.start, r.length]), [[3, 3]]);
  assert.deepEqual(piano.dynamics, [{ bar: 1, level: 100, shape: 'steady' }, { bar: 3, level: 48, shape: 'louder' }, { bar: 5, level: 100, shape: 'steady' }],
    'each bar keeps its loudness mark, and bar 5 carries on what it had');
  assert.deepEqual(d.fxClips, [
    { effect: 'scratch', lane: null, from_bar: 3, to_bar: 3.5, points: [[3, 1], [3.25, -1], [3.5, 1]] },
    { effect: 'stutter', lane: piano.id, from_bar: 1.5, to_bar: 1.75 },
    { effect: 'hot_cue', lane: null, from_bar: 2, to_bar: 2.5, settings: { cue_bar: 3.5 } },
  ], 'clips, their moves and the bar a hot cue jumps to');
  assert.deepEqual(d.markers, [{ beat: 1, name: 'Verse' }, { beat: 7, name: 'Start' }]);
  assert.equal(d.parts[2]!.vocal!.clips[0]!.at, 0.5, 'a vocal clip one beat into bar 3 is one beat (at 120) into the piece');
  const parsed = parseScore(JSON.parse(JSON.stringify(scoreFromDoc(d, AT))));
  assert.ok(parsed.ok, parsed.ok ? '' : parsed.error);
  const back = moveSection(d, 'verse', 5);
  assert.deepEqual(brief(back), [['intro', 'Intro', 1, 2], ['verse', 'Verse', 3, 4], ['outro', 'Outro', 5, 5]]);
  assert.deepEqual(back.parts[0]!.notes, d0.parts[0]!.notes, 'moved back, every note is where it was');
  assert.deepEqual(back.tempo, d0.tempo.concat());
  assert.deepEqual(brief(moveSection(d0, 'verse', 6)), [['intro', 'Intro', 1, 2], ['outro', 'Outro', 3, 3], ['verse', 'Verse', 4, 5]], 'to the end');
  const grown = moveSection(d0, 'intro', 6);
  assert.deepEqual(brief(grown).at(-1), ['intro', 'Intro', 4, 6], 'a note crossing out of the last bar grows the piece, and the last section with it');
});

test('a move to a place that is not a boundary outside the section changes nothing', () => {
  const d = piece();
  assert.equal(moveSection(d, 'verse', 2), d, 'not a section boundary');
  assert.equal(moveSection(d, 'verse', 3), d, 'its own start');
  assert.equal(moveSection(d, 'verse', 5), d, 'where it already is');
  assert.equal(moveSection(d, 'outro', 6), d, 'already at the end');
  assert.equal(moveSection(d, 'nope', 1), d);
});

test('a duplicated section is copied straight after itself with new ids; later bars move on', () => {
  const d0 = piece();
  const d = duplicateSection(d0, 'intro');
  assert.equal(d.bars, 7);
  assert.deepEqual(brief(d), [['intro', 'Intro', 1, 2], ['intro-2', 'Intro', 3, 4], ['verse', 'Verse', 5, 6], ['outro', 'Outro', 7, 7]]);
  assert.deepEqual(d.tempo, [{ bar: 1, bpm: 100, beats: 4, unit: 4 }, { bar: 5, bpm: 120, beats: 3, unit: 4 }]);
  const piano = d.parts[0]!;
  assert.deepEqual(piano.notes.map(n => n.start), [0.5, 7, 8.5, 15, 17]);
  const ids = piano.notes.map(n => n.id);
  assert.equal(new Set(ids).size, ids.length, 'copies have new ids');
  assert.ok(ids.filter(id => !d0.parts[0]!.notes.some(n => n.id === id)).every(id => id >= d0.nextId));
  assert.deepEqual(piano.regions!.map(r => [r.start, r.length]), [[0, 8], [8, 8], [16, 3]]);
  assert.deepEqual(piano.dynamics, [{ bar: 1, level: 48, shape: 'steady' }, { bar: 3, level: 48, shape: 'louder' }, { bar: 5, level: 100, shape: 'steady' }]);
  assert.deepEqual(d.markers!.map(m => [m.beat, m.name]), [[1, 'Start'], [9, 'Start'], [17, 'Verse']]);
  assert.deepEqual(d.fxClips!.map(c => [c.effect, c.from_bar]), [['scratch', 1], ['scratch', 3], ['stutter', 5.5], ['hot_cue', 6]]);
  assert.equal(d.parts[2]!.vocal!.clips[0]!.at, 10.1, 'the vocal clip moves on by the two copied bars (4.8 s)');
  const parsed = parseScore(JSON.parse(JSON.stringify(scoreFromDoc(d, AT))));
  assert.ok(parsed.ok, parsed.ok ? '' : parsed.error);
});


test('a tempo line goes with its bars, carrying on where the order jumps', () => {
  let d: EditDoc = { ...docWith([['piano', [[0, 1, 60], [12, 1, 67]]]]), bars: 4 };
  d = { ...d, tempoLine: [{ bar: 1, bpm: 80, shape: 'speed_up' }, { bar: 3, bpm: 120, shape: 'steady' }],
    tempo: [{ bar: 1, bpm: 80, beats: 4, unit: 4 }, { bar: 2, bpm: 100, beats: 4, unit: 4 }, { bar: 3, bpm: 120, beats: 4, unit: 4 }] };
  d = addSection(d, 'Verse', 3, 4).doc;
  const moved = moveSection(d, 'verse', 1);
  assert.deepEqual(moved.tempoLine, [{ bar: 1, bpm: 120, shape: 'steady' }, { bar: 3, bpm: 80, shape: 'steady' }, { bar: 4, bpm: 100, shape: 'steady' }]);
  assert.deepEqual(moved.tempo.map(t => [t.bar, t.bpm]), [[1, 120], [3, 80], [4, 100]], 'each bar keeps its speed');
  const parsed = parseScore(JSON.parse(JSON.stringify(scoreFromDoc(moved, AT))));
  assert.ok(parsed.ok, parsed.ok ? '' : parsed.error);
});
