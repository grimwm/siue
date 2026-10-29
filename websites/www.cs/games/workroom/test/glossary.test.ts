// The glossary: every term has two lines; the sound-design terms are there; a
// score's uses come back in order with their clip spans; words and phrases in
// text become tappable terms.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { GLOSSARY, splitTerms, term, termsIn } from '../src/glossary.ts';
import type { Score } from '../src/score.ts';

const read = (name: string): Score => JSON.parse(readFileSync(new URL(`./fixtures/${name}`, import.meta.url), 'utf8')) as Score;

test('every term has an id, a word and two non-empty lines', () => {
  assert.ok(GLOSSARY.length >= 36);
  for (const t of GLOSSARY) {
    assert.match(t.id, /^[a-z][a-z-]*$/);
    assert.ok(t.lines[0].length > 0 && t.lines[1].length > 0, t.id);
  }
  assert.equal(new Set(GLOSSARY.map(t => t.id)).size, GLOSSARY.length);
});

test('the sound-design terms are in the glossary', () => {
  for (const id of ['attack', 'decay', 'release', 'envelope', 'layer', 'transient', 'pitch-sweep', 'reverb-tail', 'foley', 'ambience', 'low-pass-filter', 'distortion']) {
    assert.ok(term(id), id);
  }
  assert.deepEqual([term('pitch-sweep')?.word, term('low-pass-filter')?.word], ['pitch sweep', 'low-pass filter']);
});

test("a score's terms come with their clips", () => {
  assert.deepEqual(termsIn(read('score-v1.json')).map(u => [u.term.id, u.from, u.to]), [['ostinato', 0, 4], ['motif', 8, 12]]);
  assert.deepEqual(termsIn(read('score-sound-v1.json')).map(u => [u.term.id, u.from, u.to]), [['attack', 0, 0.08], ['decay', 0.08, 0.4]]);
});

test('words in text become terms, whole words only', () => {
  const parts = splitTerms('A Phrygian ostinato, motifs and a crescendo.');
  assert.deepEqual(parts.map(p => ('term' in p ? `[${p.term.id}]` : p.text)).join(''), 'A [phrygian] [ostinato], motifs and a [crescendo].');
  assert.equal(term('octave')?.word, 'octave');
});

test('a phrase is one term', () => {
  const parts = splitTerms('A low-pass filter on the Reverb Tail.');
  assert.deepEqual(parts.map(p => ('term' in p ? `[${p.term.id}]` : p.text)).join(''), 'A [low-pass-filter] on the [reverb-tail].');
});

test('everyday words link only in their musical phrases', () => {
  const linked = (text: string): string => splitTerms(text).map(p => ('term' in p ? `[${p.term.id}]` : p.text)).join('');
  assert.equal(linked('Keep the rest of the piece; the staff liked it; tie the themes together; an accidental change.'), 'Keep the rest of the piece; the staff liked it; tie the themes together; an accidental change.');
  assert.equal(linked('A quarter rest, then tied notes and two accidentals.'), 'A [rest], then [tie] and two [accidental].');
  assert.equal(linked('A whole note and a dotted note on the second line'), 'A [whole-note] and a [dotted-note] on the second line');
  for (const id of ['rest', 'tie', 'staff', 'accidental']) assert.ok(term(id), `${id} still has a card`);
});
