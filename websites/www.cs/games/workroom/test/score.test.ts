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
  const r = parseScore({ ...fixture(), schema: 3 });
  assert.deepEqual(r, { ok: false, error: unknownSchemaMessage(3) });
  assert.match(unknownSchemaMessage(3), /score schema 3, which this page does not know\. Reload the page/);
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

// A renderable score carries its own sound: every lane has `sound`, and `mix` is present.
const LIBRARY = new Set(['harp', 'cello', 'bass', 'organ', 'horn']);
const renderable = (): Score => read('score-renderable-v1.json');
const brokenRenderable = (change: (s: Score) => void, ids: ReadonlySet<string> | undefined = LIBRARY): string => {
  const s = renderable();
  change(s);
  const r = parseScore(s, ids);
  assert.equal(r.ok, false);
  return r.ok ? '' : r.error;
};

test('a renderable score needs no audio file and no spectrogram', () => {
  const s = renderable();
  assert.deepEqual([s.audio, s.spectrogram], [[], undefined]);
  const r = parseScore(s, LIBRARY);
  assert.ok(r.ok, r.ok ? '' : r.error);
  assert.deepEqual(r.ok && [r.score.lanes[0]!.sound?.instrument, r.score.mix], ['cello', { style: 'lofi', loudness: -20 }]);
  assert.ok(parseScore(s).ok, 'without the library only the id format is checked');
});

test('the sound of a lane and the mix are checked, naming their paths', () => {
  assert.match(brokenRenderable(s => { s.lanes[0]!.sound!.instrument = 'kazoo'; }), /^lanes\[0\]\.sound\.instrument/);
  assert.ok(parseScore((() => { const s = renderable(); s.lanes[0]!.sound!.instrument = 'kazoo'; return s; })()).ok, 'no library, no lookup');
  assert.match(brokenRenderable(s => { s.lanes[0]!.sound!.instrument = 'Not An Id'; }, undefined), /^lanes\[0\]\.sound\.instrument/);
  assert.match(brokenRenderable(s => { s.lanes[1]!.sound!.gain_db = 21; }), /^lanes\[1\]\.sound\.gain_db/);
  assert.match(brokenRenderable(s => { s.lanes[1]!.sound!.gain_db = -41; }), /^lanes\[1\]\.sound\.gain_db/);
  assert.match(brokenRenderable(s => { s.lanes[0]!.sound!.attack = 11; }), /^lanes\[0\]\.sound\.attack/);
  assert.match(brokenRenderable(s => { s.lanes[0]!.sound!.attack = -1; }), /^lanes\[0\]\.sound\.attack/);
  assert.match(brokenRenderable(s => { s.lanes[0]!.sound!.release = 21; }), /^lanes\[0\]\.sound\.release/);
  assert.match(brokenRenderable(s => { (s.lanes[0] as { sound: unknown }).sound = 'cello'; }), /^lanes\[0\]\.sound:/);
  assert.match(brokenRenderable(s => { s.mix!.style = 'hall' as never; }), /^mix\.style/);
  assert.match(brokenRenderable(s => { s.mix!.loudness = -9; }), /^mix\.loudness/);
  assert.match(brokenRenderable(s => { s.mix!.loudness = -31; }), /^mix\.loudness/);
  assert.match(brokenRenderable(s => { (s as { mix: unknown }).mix = 'lofi'; }), /^mix:/);
});

test('a score with no audio file and no complete sound is refused at audio', () => {
  assert.match(brokenRenderable(s => { delete s.lanes[1]!.sound; }), /^audio/);
  assert.match(brokenRenderable(s => { delete s.mix; }), /^audio/);
  assert.match(brokenRenderable(s => { delete s.lanes[0]!.sound; delete s.lanes[1]!.sound; delete s.mix; }), /^audio/);
  assert.match(brokenRenderable(s => { s.audio = []; delete s.mix; s.spectrogram = fixture().spectrogram; }), /^audio/);
});

test('a score that is not renderable still needs its spectrogram; a renderable one may omit it', () => {
  const noPicture = renderable();
  noPicture.audio = fixture().audio;
  assert.ok(parseScore(noPicture, LIBRARY).ok);
  const both = renderable();
  both.audio = fixture().audio;
  both.spectrogram = fixture().spectrogram;
  assert.ok(parseScore(both, LIBRARY).ok);
  const plain = fixture();
  delete plain.spectrogram;
  const r = parseScore(plain);
  assert.deepEqual(r.ok ? '' : r.error.slice(0, 12), 'spectrogram:');
});

test('a lane with sound but no mix, or a mix with a lane lacking sound, keeps its audio rules', () => {
  const s = fixture();
  s.lanes[0]!.sound = { instrument: 'harp', gain_db: 0, attack: 0.05, release: 1.5 };
  assert.ok(parseScore(s, LIBRARY).ok, 'sound is optional per lane when the audio files are there');
  s.mix = { style: 'lofi', loudness: -20 };
  assert.ok(parseScore(s, LIBRARY).ok);
});
