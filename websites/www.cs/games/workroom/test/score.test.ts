// The score.json schema, version 1: a music piece and a sound effect parse; an
// unknown schema is refused with the reload message; each rule names the path
// it breaks; the two kinds differ exactly where the schema says; the page has
// no characters of its own.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { FAMILIES, MIN_SOUND_SECONDS, motifColor, parseScore, unknownSchemaMessage, type Score } from '../src/score.ts';

const read = (name: string): Score => JSON.parse(readFileSync(new URL(`./fixtures/${name}`, import.meta.url), 'utf8')) as Score;
const fixture = (): Score => read('score-v1.json');
const sound = (): Score => read('score-sound-v1.json');
const failure = (s: Score): string => {
  const r = parseScore(s);
  assert.equal(r.ok, false);
  return r.ok ? '' : r.error;
};
const broken = (change: (s: Score) => void): string => {
  const s = fixture();
  change(s);
  return failure(s);
};
const brokenSound = (change: (s: Score) => void): string => {
  const s = sound();
  change(s);
  return failure(s);
};

test('the fixtures are valid schema 1 scores, one of each kind', () => {
  for (const s of [fixture(), sound()]) {
    const r = parseScore(s);
    assert.ok(r.ok, r.ok ? '' : r.error);
  }
  assert.deepEqual([fixture().kind, sound().kind], ['music', 'sound']);
  assert.deepEqual([fixture().project.id, sound().project.id], ['crete', 'tankity']);
});

test('an unknown schema is refused with the reload message', () => {
  const r = parseScore({ ...fixture(), schema: 2 });
  assert.deepEqual(r, { ok: false, error: unknownSchemaMessage(2) });
  assert.match(unknownSchemaMessage(2), /score schema 2, which this page does not know\. Reload the page/);
  assert.equal(parseScore('nope').ok, false);
  assert.equal(parseScore(null).ok, false);
});

test('each rule names its path', () => {
  assert.match(broken(s => { s.piece.id = 'Bad Id'; }), /piece\.id/);
  assert.match(broken(s => { s.kind = 'noise' as never; }), /kind/);
  assert.match(broken(s => { s.project.id = 'Not An Id'; }), /project\.id/);
  assert.match(broken(s => { s.project.name = ''; }), /project\.name/);
  assert.match(broken(s => { s.project.name = 'n'.repeat(81); }), /project\.name/);
  assert.match(broken(s => { s.sections[1]!.from_bar = 6; }), /sections\[1\]\.from_bar/);
  assert.match(broken(s => { s.sections[1]!.to_bar = 7; }), /sections\[1\]\.to_bar/);
  assert.match(broken(s => { s.sections = []; }), /sections/);
  assert.match(broken(s => { s.characters[0]!.color = 'gold'; }), /characters\[0\]\.color/);
  assert.match(broken(s => { s.characters[1]!.id = 'ariadne'; }), /characters\[1\]\.id/);
  assert.match(broken(s => { s.motifs[0]!.character = 'nobody'; }), /motifs\[0\]\.character/);
  assert.match(broken(s => { s.notes[5]!.length = 5; }), /notes\[5\]/);
  assert.match(broken(s => { s.notes[0]!.lane = 'violas'; }), /notes\[0\]\.lane/);
  assert.match(broken(s => { s.notes[0]!.motif = 'minotaur'; }), /notes\[0\]\.motif/);
  assert.match(broken(s => { s.notes[0]!.pitch = 128; }), /notes\[0\]\.pitch/);
  assert.match(broken(s => { s.energy[0] = [1, 0.2]; }), /energy/);
  assert.match(broken(s => { s.energy[1] = [8, 1.5]; }), /energy\[1\]/);
  assert.match(broken(s => { s.glossary[0]!.term = 'flibbertigibbet'; }), /glossary\[0\]\.term/);
  assert.match(broken(s => { s.glossary[0]!.to = 20; }), /glossary\[0\]/);
  assert.match(broken(s => { s.tempo![0]!.bar = 2; }), /tempo\[0\]\.bar/);
  assert.match(broken(s => { delete s.tempo; }), /tempo/);
  assert.match(broken(s => { s.duration = 1; }), /duration.*last bar/, 'a tempo map that outruns the duration');
  assert.match(broken(s => { delete s.bars; }), /bars/);
  assert.match(broken(s => { delete s.musicxml; }), /musicxml/);
  assert.match(broken(s => { s.audio = []; }), /audio/);
  assert.match(broken(s => { s.lanes[1]!.id = 'strings-low'; }), /lanes\[1\]\.id/);
  assert.match(broken(s => { s.changes[0]!.answers = ['xyz']; }), /changes\[0\]\.answers/);
  assert.match(broken(s => { s.lanes[0]!.color = 'red'; }), /lanes\[0\]\.color/);
});

test('a sound effect has seconds, no bars and no tempo, and needs no MusicXML', () => {
  const s = sound();
  assert.deepEqual([s.bars, s.tempo, s.musicxml, s.notes.length, s.characters.length], [undefined, undefined, undefined, 0, 0]);
  assert.ok(s.duration >= MIN_SOUND_SECONDS);
  assert.match(brokenSound(x => { x.bars = 8; }), /bars/);
  assert.match(brokenSound(x => { x.tempo = [{ bar: 1, bpm: 120, beats: 4, unit: 4 }]; }), /tempo/);
  assert.match(brokenSound(x => { x.duration = 0.04; }), /duration/);
  assert.match(brokenSound(x => { x.sections[0]!.from_bar = 1; }), /sections\[0\]/);
  assert.match(brokenSound(x => { x.sections[1]!.from = 0.05; }), /sections\[1\]\.from/);
  assert.match(brokenSound(x => { x.sections[1]!.to = 0.5; }), /sections\[1\]\.to/);
  assert.match(brokenSound(x => { x.changes[0]!.to = 0.5; }), /changes\[0\]\.to/);
  assert.match(brokenSound(x => { x.changes[0]!.from_bar = 1; }), /changes\[0\]/);
  assert.match(brokenSound(x => { x.energy[2] = [0.5, 0]; }), /energy/);
  assert.match(brokenSound(x => { x.lanes[0]!.family = 'kazoo' as never; }), /lanes\[0\]\.family/);
  const withXml = sound();
  withXml.musicxml = 'score.musicxml';
  assert.ok(parseScore(withXml).ok, 'a sound piece may carry MusicXML');
  const noMoments = sound();
  noMoments.sections = [];
  assert.ok(parseScore(noMoments).ok, 'sections are optional for a sound piece');
  const shortest = sound();
  shortest.duration = MIN_SOUND_SECONDS;
  shortest.sections = [];
  shortest.energy = [[0, 1], [MIN_SOUND_SECONDS, 0]];
  shortest.glossary = [];
  shortest.changes = [];
  assert.ok(parseScore(shortest).ok, 'a 0.05 s sound is allowed');
});

test('either kind may use any lane family', () => {
  assert.deepEqual(FAMILIES.slice(-7), ['impact', 'whoosh', 'ambience', 'voice', 'electronic', 'foley', 'ui']);
  const music = fixture();
  music.lanes[0]!.family = 'impact';
  music.lanes[0]!.icon = 'impact';
  assert.ok(parseScore(music).ok, 'a music lane may use a sound-design family');
  const effect = sound();
  effect.lanes[1]!.family = 'strings';
  effect.lanes[1]!.icon = 'strings';
  assert.ok(parseScore(effect).ok, 'a sound layer may use an orchestral family');
});

test("a motif takes its character's colour from the score", () => {
  const s = fixture();
  assert.equal(motifColor(s, s.motifs[0]!), '#d4a017');
  s.characters[0]!.color = '#112233';
  assert.equal(motifColor(s, s.motifs[0]!), '#112233');
});

test('the page has no characters or colours of its own', () => {
  const src = join(import.meta.dirname, '..', 'src');
  const files = (dir: string): string[] => readdirSync(dir, { withFileTypes: true }).flatMap(e => (e.isDirectory() ? files(join(dir, e.name)) : /\.tsx?$/.test(e.name) ? [join(dir, e.name)] : []));
  for (const f of files(src)) assert.doesNotMatch(readFileSync(f, 'utf8'), /Ariadne|Minotaur|Daedalus|Athens|CHARACTER_COLORS/, f);
});
