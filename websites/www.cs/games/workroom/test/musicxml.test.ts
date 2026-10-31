// onlyLane keeps the chosen part and drops every other part and its part-list entry.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fullScore, onlyLane, SCORE_ORDER, titled } from '../src/musicxml.ts';

const xml = readFileSync(new URL('./fixtures/two-parts.musicxml', import.meta.url), 'utf8');

test('keeps the chosen part and its part-list entry, and nothing of the others', () => {
  const out = onlyLane(xml, 'brass');
  assert.match(out, /<score-part id='brass'>/);
  assert.match(out, /<part id='brass'>[\s\S]*<step>G<\/step>[\s\S]*<\/part>/);
  assert.doesNotMatch(out, /strings-low|Low strings|<step>C<\/step>/);
  assert.match(out, /<part-list>[\s\S]*<\/part-list>/, 'the part list itself stays');
  assert.match(out, /<score-partwise version="3\.1">[\s\S]*<\/score-partwise>/);
});

test('the other lane works the same way', () => {
  const out = onlyLane(xml, 'strings-low');
  assert.match(out, /<score-part id="strings-low">/);
  assert.doesNotMatch(out, /brass|Brass|<step>G<\/step>/);
});

test('a lane the score has no part for is an error in words', () => {
  assert.throws(() => onlyLane(xml, 'harp'), /no part for harp/);
});

test('text that is not a MusicXML score is refused', () => {
  assert.throws(() => onlyLane('<html></html>', 'brass'), /not valid MusicXML/);
});

test('a self-closing part is dropped alone and never swallows the next one', () => {
  const x = `<score-partwise><part-list><score-part id="a"/><score-part id="b"><part-name>B</part-name></score-part></part-list><part id="a"/><part id="b"><measure/></part></score-partwise>`;
  const keepB = onlyLane(x, 'b');
  assert.match(keepB, /<score-part id="b"><part-name>B<\/part-name><\/score-part>/);
  assert.match(keepB, /<part id="b"><measure\/><\/part>/);
  assert.doesNotMatch(keepB, /id="a"/);
  const keepA = onlyLane(x, 'a');
  assert.match(keepA, /<score-part id="a"\/>/);
  assert.match(keepA, /<part id="a"\/>/);
  assert.doesNotMatch(keepA, /id="b"|<measure/);
});

test('a score without an XML declaration gets one, since the notation library needs it', () => {
  const bare = xml.replace(/^\s*<\?xml[^>]*\?>\s*/, '');
  assert.doesNotMatch(bare, /^<\?xml/);
  assert.match(onlyLane(bare, 'brass'), /^<\?xml version="1\.0" encoding="UTF-8"\?>\s*</);
  assert.match(onlyLane(`﻿  ${bare}`, 'brass'), /^<\?xml version="1\.0" encoding="UTF-8"\?>\s*</, 'a byte-order mark or blank space does not hide the missing declaration');
});

test('a declaration the score already has is kept, once', () => {
  const declared = '<?xml version="1.0" encoding="UTF-8"?>\n' + xml.replace(/^\s*<\?xml[^>]*\?>\s*/, '');
  const out = onlyLane(declared, 'brass');
  assert.equal(out.match(/<\?xml/g)?.length, 1);
  assert.ok(out.startsWith('<?xml version="1.0" encoding="UTF-8"?>'));
});

test('a score laid out by time is refused in plain words', () => {
  const timewise = '<?xml version="1.0"?><score-timewise version="3.1"><part-list><score-part id="brass"/></part-list><measure number="1"><part id="brass"/></measure></score-timewise>';
  assert.throws(() => onlyLane(timewise, 'brass'), /laid out by time.*instrument/);
});

test('a part named P1, P2 by its notation program is found by the lane name instead', () => {
  const numbered = xml.replace(/strings-low/g, 'P1').replace(/brass/g, 'P2');
  const out = onlyLane(numbered, 'brass', 'Brass');
  assert.match(out, /<score-part id='P2'><part-name>Brass<\/part-name>/);
  assert.match(out, /<part id='P2'>[\s\S]*<step>G<\/step>/);
  assert.doesNotMatch(out, /Low strings|<step>C<\/step>/);
  assert.throws(() => onlyLane(numbered, 'harp', 'Harp'), /no part for harp/);
});

// The full score: every part, in standard score order (woodwinds, brass,
// percussion, harp, keyboards, voices, strings), and the title and tempo a
// printed first page shows.
const three = `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="4.0">
  <work><work-title>Old title</work-title></work>
  <identification><creator type="composer">Music21</creator></identification>
  <part-list>
    <score-part id="cellos"><part-name>Cellos</part-name></score-part>
    <score-part id="P2"><part-name>Horn</part-name></score-part>
    <score-part id="flute"><part-name>Flute</part-name></score-part>
    <score-part id="extra"><part-name>Extra</part-name></score-part>
  </part-list>
  <part id="cellos"><measure number="1"><attributes><divisions>1</divisions></attributes><note><pitch><step>C</step><octave>2</octave></pitch><duration>4</duration></note></measure></part>
  <part id="P2"><measure number="1"><note><pitch><step>G</step><octave>3</octave></pitch><duration>4</duration></note></measure></part>
  <part id="flute"><measure number="1"><note><pitch><step>E</step><octave>5</octave></pitch><duration>4</duration></note></measure></part>
  <part id="extra"><measure number="1"><note><rest/><duration>4</duration></note></measure></part>
</score-partwise>`;
const threeLanes = [
  { id: 'cellos', name: 'Cellos', family: 'strings' },
  { id: 'horn', name: 'Horn', family: 'brass' },
  { id: 'flute', name: 'Flute', family: 'woodwinds' },
] as const;
const ids = (x: string, tag: string) => [...x.matchAll(new RegExp(`<${tag} id="([^"]+)"`, 'g'))].map(m => m[1]);

test('the full score keeps every part, in score order: woodwinds, brass, then strings; a part with no lane goes last', () => {
  const out = fullScore(three, threeLanes);
  assert.deepEqual(ids(out, 'score-part'), ['flute', 'P2', 'cellos', 'extra']);
  assert.deepEqual(ids(out, 'part'), ['flute', 'P2', 'cellos', 'extra']);
  assert.match(out, /<part id="P2"><measure number="1"><note><pitch><step>G<\/step>/, 'each part keeps its music');
  assert.match(out, /^<\?xml/);
});

test('score order: every family has its place, and lanes of one family keep their order', () => {
  const order = ['woodwinds', 'brass', 'percussion', 'harp', 'keys', 'choir', 'strings'] as const;
  for (let i = 1; i < order.length; i++) assert.ok(SCORE_ORDER[order[i - 1]!] < SCORE_ORDER[order[i]!], `${order[i - 1]} before ${order[i]}`);
  const twoStrings = [{ id: 'cellos', name: 'Cellos', family: 'strings' }, { id: 'flute', name: 'Flute', family: 'strings' }] as const;
  assert.deepEqual(ids(fullScore(three, twoStrings), 'part'), ['cellos', 'flute', 'P2', 'extra']);
});

test('a score that groups its parts keeps its own order', () => {
  assert.equal(fullScore(xml, [{ id: 'brass', name: 'Brass', family: 'brass' }, { id: 'strings-low', name: 'Low strings', family: 'strings' }]), xml);
});

test('a full score of text that is not MusicXML is refused', () => {
  assert.throws(() => fullScore('<html></html>', threeLanes), /not valid MusicXML/);
});

test('for print the piece title is the title, and a tempo is added when the score has none', () => {
  const out = titled(three, 'Crete & the sea', { bpm: 62, unit: 4 });
  assert.match(out, /<movement-title>Crete &amp; the sea<\/movement-title>\s*<identification>/, 'the title sits where MusicXML wants it');
  assert.match(out, /<part id="cellos"><measure number="1"><attributes><divisions>1<\/divisions><\/attributes><direction placement="above"><direction-type><metronome><beat-unit>quarter<\/beat-unit><per-minute>62<\/per-minute><\/metronome><\/direction-type><sound tempo="62"\/><\/direction>/);
  assert.equal(out.match(/<metronome>/g)?.length, 1, 'only in the first part');
  const half = titled(three, 'T', { bpm: 60, unit: 2 });
  assert.match(half, /<beat-unit>half<\/beat-unit><per-minute>60<\/per-minute><\/metronome><\/direction-type><sound tempo="120"\/>/, 'the sound tempo counts quarter notes');
});

test('for print an existing title is replaced and an existing tempo is kept', () => {
  const had = three.replace('</work>', '</work><movement-title>Old</movement-title>').replace('<note><rest/>', '<direction><direction-type><metronome><beat-unit>quarter</beat-unit><per-minute>90</per-minute></metronome></direction-type></direction><note><rest/>');
  const out = titled(had, 'New', { bpm: 62, unit: 4 });
  assert.equal(out.match(/<movement-title>/g)?.length, 1);
  assert.match(out, /<movement-title>New<\/movement-title>/);
  assert.equal(out.match(/<metronome>/g)?.length, 1);
  assert.match(out, /<per-minute>90</);
  assert.equal(titled(three, 'T', null).match(/<metronome>/g), null, 'no tempo known, none added');
});
