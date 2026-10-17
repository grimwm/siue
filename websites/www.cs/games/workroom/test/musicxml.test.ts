// onlyLane keeps the chosen part and drops every other part and its part-list entry.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { onlyLane } from '../src/musicxml.ts';

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
