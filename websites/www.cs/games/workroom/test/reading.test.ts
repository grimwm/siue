// The sheet-music reading lesson: what one lane's notation holds (clef, time,
// key, note lengths, accidentals, ties), and six steps that point at real bars
// of it, with a clip of each bar, or a plain explanation when the lane has no
// example.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { term } from '../src/glossary.ts';
import { onlyLane } from '../src/musicxml.ts';
import { readLane, readingSteps, STEP_IDS } from '../src/reading.ts';
import type { ReadingStep } from '../src/reading.ts';
import type { TempoMap } from '../src/tempo.ts';

// Four seconds a bar: bar n starts at 4(n - 1).
const tempo: TempoMap = { metric: true, barStart: n => (n - 1) * 4, barAt: t => Math.floor(t / 4) + 1 };
const words = (s: ReadingStep): string => s.text.map(r => r.text).join('');
const step = (steps: ReadingStep[], id: string): ReadingStep => steps.find(s => s.id === id)!;

const note = (step: string, octave: number, type: string, more = ''): string =>
  `<note><pitch><step>${step}</step>${more.includes('<alter>') ? '' : '<alter>0</alter>'}<octave>${octave}</octave></pitch><duration>1</duration><type>${type}</type>${more}</note>`;
const SMALL = `<?xml version="1.0"?><score-partwise><part-list><score-part id="cellos"><part-name>Cellos</part-name></score-part></part-list><part id="cellos">
<measure number="1"><attributes><divisions>2</divisions><key><fifths>-2</fifths></key><time><beats>3</beats><beat-type>4</beat-type></time><clef><sign>F</sign><line>4</line></clef></attributes>
<note><rest measure="yes"/><duration>6</duration></note></measure>
<measure number="2">${note('D', 3, 'half', '<dot/>')}</measure>
<measure number="3">${note('F', 3, 'quarter')}<note><chord/><pitch><step>A</step><octave>3</octave></pitch><duration>2</duration><type>quarter</type></note>${note('G', 3, 'eighth')}${note('G', 3, 'eighth')}<note><rest/><duration>2</duration><type>quarter</type></note></measure>
<measure number="4"><note><pitch><step>E</step><alter>-1</alter><octave>3</octave></pitch><duration>6</duration><type>half</type><dot/><accidental>flat</accidental><tie type="start"/></note></measure>
<measure number="5"><note><pitch><step>E</step><alter>-1</alter><octave>3</octave></pitch><duration>6</duration><type>half</type><dot/><tie type="stop"/></note></measure>
</part></score-partwise>`;

test('a lane reads as its clef, time, key and notes bar by bar', () => {
  const lane = readLane(SMALL);
  assert.equal(lane.clef, 'bass');
  assert.deepEqual(lane.time, { beats: 3, beatType: 4 });
  assert.equal(lane.fifths, -2);
  const sounding = lane.notes.filter(n => !n.rest);
  assert.deepEqual(sounding.map(n => [n.bar, n.name, n.type, n.dots]), [[2, 'D3', 'half', 1], [3, 'F3', 'quarter', 0], [3, 'G3', 'eighth', 0], [3, 'G3', 'eighth', 0], [4, 'E♭3', 'half', 1], [5, 'E♭3', 'half', 1]], 'a chord counts once, by its first note');
  assert.deepEqual(lane.notes.filter(n => n.rest).map(n => [n.bar, n.type, n.wholeBar]), [[1, null, true], [3, 'quarter', false]]);
  assert.deepEqual(lane.notes.filter(n => n.accidental).map(n => [n.bar, n.accidental]), [[4, 'flat']]);
  assert.deepEqual(lane.notes.filter(n => n.tieStart || n.tieStop).map(n => [n.bar, n.tieStart, n.tieStop]), [[4, true, false], [5, false, true]]);
});

test('six steps, in order, each two or three sentences, every linked word in the glossary', () => {
  const steps = readingSteps(readLane(SMALL), tempo, 40);
  assert.deepEqual(steps.map(s => s.id), [...STEP_IDS]);
  assert.deepEqual(STEP_IDS, ['staff', 'lengths', 'bars', 'accidentals', 'ties', 'follow']);
  for (const s of steps) {
    const sentences = words(s).split(/(?<=[.!?])\s+(?=[A-Z0-9])/).filter(x => x.trim().length > 0);
    assert.ok(sentences.length >= 2 && sentences.length <= 3, `${s.id}: ${sentences.length} sentences: ${words(s)}`);
    for (const r of s.text) if ('term' in r) assert.ok(term(r.term), `${s.id} links ${r.term}`);
  }
  for (const id of ['staff', 'clef', 'whole-note', 'rest', 'bar', 'time-signature', 'accidental', 'key-signature', 'tie'])
    assert.ok(steps.some(s => s.text.some(r => 'term' in r && r.term === id)), `some step links ${id}`);
});

test('each step points at a real bar of the lane and plays it', () => {
  const steps = readingSteps(readLane(SMALL), tempo, 40);
  const staff = step(steps, 'staff');
  assert.match(words(staff), /bass clef/);
  assert.match(words(staff), /The first note here, in bar 2, is D3/);
  assert.equal(staff.bar, 2);
  assert.deepEqual(staff.clip, { from: 4, to: 8 });
  const lengths = step(steps, 'lengths');
  assert.equal(lengths.bar, 3, 'the bar with the most kinds of length');
  assert.match(words(lengths), /Bar 3 holds a quarter note, two eighth notes and a quarter rest\./);
  const bars = step(steps, 'bars');
  assert.match(words(bars), /3 over 4/);
  assert.match(words(bars), /count one, two, three/);
  assert.equal(bars.bar, 2);
  const acc = step(steps, 'accidentals');
  assert.match(words(acc), /2 flats/);
  assert.match(words(acc), /Bar 4 has E♭3/);
  assert.equal(acc.bar, 4);
  assert.deepEqual(acc.clip, { from: 12, to: 16 });
  const ties = step(steps, 'ties');
  assert.match(words(ties), /In bar 4, the E♭3 is tied into bar 5/);
  assert.equal(ties.bar, 4);
  assert.deepEqual(ties.clip, { from: 12, to: 20 }, 'the clip holds the whole tied note');
  const follow = step(steps, 'follow');
  assert.equal(follow.follow, true);
  assert.equal(follow.clip?.from, 4, 'reading along starts where the lane first plays');
});

test('a clip never runs past the end of the piece', () => {
  const steps = readingSteps(readLane(SMALL), tempo, 18);
  assert.deepEqual(step(steps, 'ties').clip, { from: 12, to: 18 });
});

test('a lane with no example says the rule in general and offers no Hear it there', () => {
  const plain = `<score-partwise><part id="x"><measure number="1"><attributes><divisions>1</divisions><clef><sign>G</sign><line>2</line></clef></attributes><note><rest measure="yes"/><duration>4</duration></note></measure></part></score-partwise>`;
  const steps = readingSteps(readLane(plain), tempo, 40);
  assert.deepEqual(steps.map(s => s.id), [...STEP_IDS]);
  for (const id of ['staff', 'accidentals', 'ties', 'follow']) {
    assert.equal(step(steps, id).clip, null, id);
    assert.equal(step(steps, id).bar, null, id);
  }
  assert.match(words(step(steps, 'staff')), /treble clef/);
  assert.doesNotMatch(words(step(steps, 'accidentals')), /Bar \d/);
  assert.match(words(step(steps, 'accidentals')), /no key signature/);
  assert.doesNotMatch(words(step(steps, 'ties')), /bar \d/);
});

test('a piece with no bars has no clips', () => {
  const flat: TempoMap = { metric: false, barStart: () => 0, barAt: () => null };
  const steps = readingSteps(readLane(SMALL), flat, 40);
  assert.ok(steps.every(s => s.clip === null));
});

test("Crete's title theme: the cellos' tune reads in bass clef and 4/4 and points at its flat", () => {
  const xml = readFileSync(new URL('../../../music/pieces/crete-title/v3/score.musicxml', import.meta.url), 'utf8');
  const lane = readLane(onlyLane(xml, 'cellos'));
  assert.deepEqual(lane.time, { beats: 4, beatType: 4 });
  const steps = readingSteps(lane, tempo, 216);
  const acc = step(steps, 'accidentals');
  assert.ok(acc.bar !== null && acc.clip !== null);
  assert.match(words(acc), /Bar \d+ has [A-G][♭♯]\d/);
  assert.match(words(acc), /no key signature/);
  assert.match(words(step(steps, 'staff')), /bass clef/);
  assert.match(words(acc), /Bar \d+ has [A-G]♭\d/);
});
