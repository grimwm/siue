// Engraving the editor's document as MusicXML: bars, rests, chords, ties across bar lines and time changes, clefs, the
// grand staff, written transposition (Double Bass an octave up, the horn in F a fifth up), drums, range colours and
// the key the notes suggest.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DOMParser } from '@xmldom/xmldom';
import type { Element as XElement } from '@xmldom/xmldom';
import { AMBER, inferFifths, RED, toMusicXml } from '../src/compose/toxml.ts';
import { docWith, ENTRIES } from './compose-fixture.ts';

const parse = (xml: string) => new DOMParser().parseFromString(xml, 'text/xml');
const kids = (el: XElement, tag: string): XElement[] => Array.from(el.childNodes).filter((n): n is XElement => n.nodeType === 1 && (n as XElement).tagName === tag);
const kid = (el: XElement, tag: string): XElement | undefined => kids(el, tag)[0];
const txt = (el: XElement | undefined, tag: string): string | undefined => (el ? kid(el, tag)?.textContent ?? undefined : undefined);
const measures = (xml: string, part = 0): XElement[] => kids(Array.from(parse(xml).getElementsByTagName('part'))[part]!, 'measure');
const notesOf = (m: XElement): XElement[] => kids(m, 'note');
/** A note as "C4 24 quarter" (pitch, duration, type), "rest 72 half." or "+E4 …" for a chord member, with "~" for a tie start. */
function show(n: XElement): string {
  const p = kid(n, 'pitch');
  const u = kid(n, 'unpitched');
  const alter = p ? txt(p, 'alter') : undefined;
  const name = p ? `${txt(p, 'step')}${alter === '1' ? '#' : alter === '-1' ? 'b' : ''}${txt(p, 'octave')}` : u ? `x${txt(u, 'display-step')}${txt(u, 'display-octave')}` : 'rest';
  const dots = kids(n, 'dot').length;
  const ties = kids(n, 'tie').map(t => t.getAttribute('type')).join('');
  return `${kid(n, 'chord') ? '+' : ''}${name} ${txt(n, 'duration')} ${txt(n, 'type') ?? (kid(n, 'rest')?.getAttribute('measure') === 'yes' ? 'bar' : '?')}${'.'.repeat(dots)}${ties.includes('start') ? '~' : ''}`;
}
const durations = (m: XElement, staff?: string): number =>
  notesOf(m).filter(n => !kid(n, 'chord') && (staff === undefined || txt(n, 'staff') === staff)).reduce((s, n) => s + Number(txt(n, 'duration')), 0);

test('one quarter note in 4/4, and the rest of the bar', () => {
  const xml = toMusicXml(docWith([['cello', [[0, 1, 60]]]]), ENTRIES);
  const [m1] = measures(xml);
  assert.equal(txt(kid(m1!, 'attributes'), 'divisions'), '24');
  assert.deepEqual(notesOf(m1!).map(show), ['C4 24 quarter', 'rest 72 half.']);
  assert.equal(kid(kid(m1!, 'attributes')!, 'clef') && txt(kid(kid(m1!, 'attributes')!, 'clef'), 'sign'), 'F');
  assert.match(xml, /<part-name>Cello<\/part-name>/);
  assert.match(xml, /<midi-program>43<\/midi-program>/);
});

test('ties across bar lines and time changes', () => {
  // 4/4 for a bar, then 3/4: a six-beat note from beat 2 fills bar 1 (three beats), all of bar 2 (three) — tied.
  const doc = docWith([['cello', [[1, 6, 48]]]], [{ bar: 1, bpm: 90, beats: 4, unit: 4 }, { bar: 2, bpm: 90, beats: 3, unit: 4 }]);
  const ms = measures(toMusicXml(doc, ENTRIES));
  assert.equal(ms.length, 4, 'four bars, as a new piece has');
  assert.deepEqual(notesOf(ms[0]!).map(show), ['rest 24 quarter', 'C3 72 half.~']);
  assert.deepEqual(notesOf(ms[1]!).map(show), ['C3 72 half.']);
  assert.equal(txt(kid(kid(ms[1]!, 'attributes')!, 'time'), 'beats'), '3');
  assert.deepEqual(kids(notesOf(ms[1]!)[0]!, 'tie').map(t => t.getAttribute('type')), ['stop']);
  assert.deepEqual(notesOf(ms[2]!).map(show), ['rest 72 bar']);
});

test('a chord is one group; notes of different lengths are tied into chords', () => {
  const ms = measures(toMusicXml(docWith([['violin', [[0, 2, 60], [0, 2, 64], [0, 2, 67], [2, 1, 72], [2, 2, 76]]]]), ENTRIES));
  assert.deepEqual(notesOf(ms[0]!).map(show), ['C4 48 half', '+E4 48 half', '+G4 48 half', 'C5 24 quarter', '+E5 24 quarter~', 'E5 24 quarter']);
});

test('the grand staff splits at middle C, with a backup between its staves', () => {
  const m = measures(toMusicXml(docWith([['piano', [[0, 4, 72], [0, 4, 48]]]]), ENTRIES))[0]!;
  const attrs = kid(m, 'attributes')!;
  assert.equal(txt(attrs, 'staves'), '2');
  assert.deepEqual(kids(attrs, 'clef').map(c => txt(c, 'sign')), ['G', 'F']);
  assert.ok(kid(m, 'backup'), 'a backup');
  assert.equal(durations(m, '1'), 96);
  assert.equal(durations(m, '2'), 96);
  const byStaff = notesOf(m).map(n => `${show(n)} s${txt(n, 'staff')}`);
  assert.deepEqual(byStaff, ['C5 96 whole s1', 'C3 96 whole s2']);
});

test('the Double Bass is written an octave up', () => {
  const xml = toMusicXml(docWith([['bass', [[0, 4, 28]]]]), ENTRIES);
  const m = measures(xml)[0]!;
  assert.deepEqual(notesOf(m).map(show), ['E2 96 whole']);
  const tr = kid(kid(m, 'attributes')!, 'transpose')!;
  assert.deepEqual([txt(tr, 'diatonic'), txt(tr, 'chromatic'), txt(tr, 'octave-change')], ['0', '0', '-1']);
});

test('the horn in F is written a fifth up, the glockenspiel two octaves down; concert pitch writes how they sound', () => {
  const doc = docWith([['horn', [[0, 4, 53]]], ['glock', [[0, 4, 96]]]]);
  const xml = toMusicXml(doc, ENTRIES);
  const horn = measures(xml, 0)[0]!;
  assert.deepEqual(notesOf(horn).map(show), ['C4 96 whole']);
  const tr = kid(kid(horn, 'attributes')!, 'transpose')!;
  assert.deepEqual([txt(tr, 'diatonic'), txt(tr, 'chromatic'), txt(tr, 'octave-change')], ['-4', '-7', undefined]);
  // The piece sounds in C, so the horn's part is in G (one sharp).
  assert.equal(txt(kid(kid(horn, 'attributes')!, 'key'), 'fifths'), '1');
  const glock = measures(xml, 1)[0]!;
  assert.deepEqual(notesOf(glock).map(show), ['C5 96 whole']);
  assert.equal(txt(kid(kid(glock, 'attributes')!, 'transpose'), 'octave-change'), '2');
  const concert = toMusicXml(doc, ENTRIES, { concert: true });
  assert.deepEqual(notesOf(measures(concert, 0)[0]!).map(show), ['F3 96 whole']);
  assert.doesNotMatch(concert, /<transpose>/);
});

test('drums are unpitched, each piece its own instrument, cymbals with an x notehead', () => {
  const xml = toMusicXml(docWith([['kit', [[0, 1, 36], [0, 1, 42], [1, 1, 38]]]]), ENTRIES);
  const m = measures(xml)[0]!;
  assert.equal(txt(kid(kid(m, 'attributes')!, 'clef'), 'sign'), 'percussion');
  const [kick, hat, snare] = notesOf(m);
  assert.equal(show(kick!), 'xF4 24 quarter');
  assert.equal(show(hat!), '+xG5 24 quarter');
  assert.equal(txt(hat!, 'notehead'), 'x');
  assert.equal(kid(hat!, 'instrument')!.getAttribute('id'), 'drum-kit-I43');
  assert.equal(show(snare!), 'xC5 24 quarter');
  assert.match(xml, /<midi-channel>10<\/midi-channel>/);
  assert.match(xml, /<score-instrument id="drum-kit-I43">\s*<instrument-name>Closed Hi-Hat<\/instrument-name>/);
  assert.match(xml, /<midi-unpitched>43<\/midi-unpitched>/);
});

test('amber and red notes are coloured; colours can be left off', () => {
  // Violin: 55–100 normal, 103 expert only, 40 beyond.
  const doc = docWith([['violin', [[0, 1, 60], [1, 1, 103], [2, 1, 40]]]]);
  const notes = notesOf(measures(toMusicXml(doc, ENTRIES))[0]!);
  assert.deepEqual(notes.slice(0, 3).map(n => n.getAttribute('color') ?? ''), ['', AMBER, RED]);
  assert.equal(kid(notes[2]!, 'notehead')!.getAttribute('color'), RED);
  assert.doesNotMatch(toMusicXml(doc, ENTRIES, { colours: false }), /color=/);
});

test('the key the notes suggest', () => {
  assert.equal(inferFifths([67, 69, 71, 72, 74, 76, 78]), 1, 'G major');
  assert.equal(inferFifths([65, 67, 69, 70, 72, 74, 76]), -1, 'F major');
  assert.equal(inferFifths([60, 62, 64]), 0, 'C fits with no sharps or flats');
  assert.equal(inferFifths([]), 0);
});

test('every bar adds up, however finely notes are placed', () => {
  const doc = docWith([['piano', [[0.02, 0.98, 60], [1.37, 0.4, 64], [3.99, 0.5, 67], [5, 1 / 48, 70]]]]);
  for (const m of measures(toMusicXml(doc, ENTRIES))) {
    assert.equal(durations(m, '1'), 96, `bar ${m.getAttribute('number')} staff 1`);
    assert.equal(durations(m, '2'), 96, `bar ${m.getAttribute('number')} staff 2`);
  }
});

test('in 6/8 the beat is an eighth: a dotted quarter is three beats', () => {
  const doc = docWith([['flute', [[0, 3, 72], [3, 3, 74]]]], [{ bar: 1, bpm: 60, beats: 6, unit: 8 }]);
  const m = measures(toMusicXml(doc, ENTRIES))[0]!;
  assert.deepEqual(notesOf(m).map(show), ['C5 36 quarter.', 'D5 36 quarter.']);
  assert.match(toMusicXml(doc, ENTRIES), /<beat-unit>eighth<\/beat-unit>\s*<per-minute>60<\/per-minute>/);
  assert.match(toMusicXml(doc, ENTRIES), /<sound tempo="30"\/>/);
});

test('only the parts asked for', () => {
  const doc = docWith([['cello', [[0, 1, 48]]], ['flute', [[0, 1, 72]]]]);
  const xml = toMusicXml(doc, ENTRIES, { parts: ['flute'] });
  assert.equal(parse(xml).getElementsByTagName('part').length, 1);
  assert.match(xml, /<score-part id="flute">/);
});
