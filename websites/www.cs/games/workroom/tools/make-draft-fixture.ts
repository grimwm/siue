// Writes the draft fixtures the local browser check publishes (make music-e2e):
// test/fixtures/draft/ (a music piece: score.json and score.musicxml),
// test/fixtures/draft-sound/ (a sound effect: score.json only) and
// test/fixtures/draft-score/ (the music piece as its score alone, which the page
// builds the sound of: built-piece, with the same score.musicxml). The audio and
// the spectrogram are made with ffmpeg, as the README of the check describes.
// Usage, from websites/www.cs/games: node workroom/tools/make-draft-fixture.ts
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

type Note = { lane: string; start: number; length: number; pitch: number };
type Lane = { id: string };
type Score = { bars: number; duration: number; lanes: Lane[]; notes: Note[] };

const fixtures = join(import.meta.dirname, '..', 'test', 'fixtures');
mkdirSync(join(fixtures, 'draft'), { recursive: true });
mkdirSync(join(fixtures, 'draft-sound'), { recursive: true });
mkdirSync(join(fixtures, 'draft-score'), { recursive: true });
copyFileSync(join(fixtures, 'score-sound-v1.json'), join(fixtures, 'draft-sound', 'score.json'));
copyFileSync(join(fixtures, 'score-v1.json'), join(fixtures, 'draft', 'score.json'));

const STEPS: [string, number][] = [['C', 0], ['C', 1], ['D', 0], ['D', 1], ['E', 0], ['F', 0], ['F', 1], ['G', 0], ['G', 1], ['A', 0], ['A', 1], ['B', 0]];

/** A whole note at the lane's pitch in each bar where a note starts, a whole rest elsewhere. */
function part(score: Score, lane: string): string {
  const barSeconds = score.duration / score.bars;
  const measures: string[] = [];
  for (let bar = 1; bar <= score.bars; bar++) {
    const note = score.notes.find(n => n.lane === lane && Math.floor(n.start / barSeconds + 1e-9) === bar - 1);
    const attrs = bar === 1 ? '<attributes><divisions>1</divisions><time><beats>4</beats><beat-type>4</beat-type></time><clef><sign>G</sign><line>2</line></clef></attributes>' : '';
    let body = '<note><rest measure="yes"/><duration>4</duration></note>';
    if (note) {
      const [step, alter] = STEPS[note.pitch % 12]!;
      body = `<note><pitch><step>${step}</step>${alter ? '<alter>1</alter>' : ''}<octave>${Math.floor(note.pitch / 12) - 1}</octave></pitch><duration>4</duration><type>whole</type></note>`;
    }
    measures.push(`<measure number="${bar}">${attrs}${body}</measure>`);
  }
  return `<part id="${lane}">${measures.join('')}</part>`;
}

const score = JSON.parse(readFileSync(join(fixtures, 'score-v1.json'), 'utf8')) as Score;
const lanes = ['strings-low', 'brass'];
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="4.0"><part-list>${lanes.map(l => `<score-part id="${l}"><part-name>${l}</part-name></score-part>`).join('')}</part-list>${lanes.map(l => part(score, l)).join('')}</score-partwise>
`;
writeFileSync(join(fixtures, 'draft', 'score.musicxml'), xml);
writeFileSync(join(fixtures, 'draft-score', 'score.musicxml'), xml);
const renderable = JSON.parse(readFileSync(join(fixtures, 'score-renderable-v1.json'), 'utf8')) as { piece: { id: string; title: string } };
renderable.piece = { id: 'built-piece', title: 'Built piece: the Labyrinth from its score' };
writeFileSync(join(fixtures, 'draft-score', 'score.json'), JSON.stringify(renderable, null, 2) + '\n');
