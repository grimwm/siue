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
