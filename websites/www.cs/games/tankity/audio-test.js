// The audio module's pure parts, without a browser. Run here: `node audio-test.js`.
// js/audio.js (compiled from src/audio.ts) must import with no page and no
// AudioContext; what it computes without one is the loop-point trim that keeps
// a track's silence out of its seam, and which track a level plays.
import { trimSilence, trackForLevel, sfx, music, initAudio, noteGesture } from './js/audio.js';

let failed = 0;
const check = (name, ok, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${ok ? '' : ` :: ${detail}`}`);
  if (!ok) failed++;
};
const near = (a, b) => Math.abs(a - b) < 1e-9;

// A synthetic mono buffer: 1 s at 100 Hz, silent except samples 20..79.
const loud = new Float32Array(100);
loud.fill(0.5, 20, 80);
loud[10] = 0.003; // under the floor: still silence
const trimmed = trimSilence({ sampleRate: 100, getChannelData: () => loud });
check('trim-start-at-first-sound', near(trimmed.start, 0.2), String(trimmed.start));
check('trim-end-after-last-sound', near(trimmed.end, 0.8), String(trimmed.end));

const quiet = trimSilence({ sampleRate: 100, getChannelData: () => new Float32Array(50) });
check('trim-all-silence-keeps-the-last-sample', near(quiet.start, 0.49) && near(quiet.end, 0.5), JSON.stringify(quiet));

const full = new Float32Array(10).fill(0.1);
const whole = trimSilence({ sampleRate: 10, getChannelData: () => full });
check('trim-no-silence-keeps-all', near(whole.start, 0) && near(whole.end, 1), JSON.stringify(whole));

// The demo plays the theme (track 0); rounds walk the others in order and wrap.
const walk = [0, 1, 2, 3, 4, 5, 6].map(l => trackForLevel(l, 4));
check('track-for-level', walk.join() === '0,1,2,3,1,2,3', walk.join());
check('track-for-level-one-track', trackForLevel(0, 1) === 0 && trackForLevel(5, 1) === 0);

// With no AudioContext (this is Node) nothing throws and nothing plays.
let threw = '';
try {
  sfx.play('boom');
  sfx.turnPing();
  music.start();
  music.stop();
} catch (e) { threw = String(e); }
check('silent-without-webaudio', threw === '', threw);

// Track hand-off, against a fake WebAudio and fetch whose loads finish when
// the test says. While a track loads, the one the listener hears must stay
// reachable: skipping twice, or stopping, mid-load must still fade it out.
{
  const sources = []; // every buffer source started, with the file it plays
  const param = () => ({ value: 1, setValueAtTime() {}, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {}, cancelScheduledValues() {} });
  globalThis.AudioContext = class {
    constructor() { this.currentTime = 0; this.state = 'running'; this.destination = {}; }
    resume() { return Promise.resolve(); }
    createGain() { return { gain: param(), connect() {} }; }
    createOscillator() { return { frequency: param(), type: '', connect() {}, start() {}, stop() {} }; }
    createBufferSource() {
      const src = { buffer: null, stopped: false, connect() {}, start() { sources.push(this); }, stop() { this.stopped = true; } };
      return src;
    }
    decodeAudioData(bytes) {
      const data = new Float32Array(1000).fill(0.5);
      return Promise.resolve({ file: bytes.file, sampleRate: 100, duration: 10, getChannelData: () => data });
    }
  };
  const pending = {};
  globalThis.fetch = file => new Promise(res => {
    pending[file] = () => res({ ok: true, arrayBuffer: () => Promise.resolve({ file }) });
  });
  const land = async file => { pending[file](); for (let i = 0; i < 10; i++) await new Promise(r => setTimeout(r, 0)); };
  const heard = () => sources.filter(s => !s.stopped).map(s => s.buffer.file);

  initAudio({ sfx: {}, music: [{ file: 'a.mp3' }, { file: 'b.mp3' }, { file: 'c.mp3' }] });
  noteGesture(false); // starts the theme, a.mp3
  await land('a.mp3');
  check('handoff-theme-plays', heard().join() === 'a.mp3', heard().join());
  music.next(); // b.mp3 starts loading...
  music.next(); // ...and is skipped for c.mp3 before it arrives
  await land('b.mp3');
  await land('c.mp3');
  check('handoff-double-skip-fades-the-heard-track', heard().join() === 'c.mp3', heard().join());
  music.next(); // a.mp3 again (cached), then stop while it settles
  music.stop();
  await land('a.mp3').catch(() => {});
  for (let i = 0; i < 10; i++) await new Promise(r => setTimeout(r, 0));
  check('handoff-stop-mid-load-silences-all', heard().length === 0, heard().join());
}

if (failed) { console.log('AUDIO-FAILED'); process.exit(1); }
console.log('AUDIO-OK');
process.exit(0);
