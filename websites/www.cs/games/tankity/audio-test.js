// The audio module's pure parts, without a browser. Run here: `node audio-test.js`.
// js/audio.js (compiled from src/audio.ts) must import with no page and no
// AudioContext; what it computes without one is the loop-point trim that keeps
// a track's silence out of its seam, and which track a level plays.
import { trimSilence, trackForLevel, sfx, music } from './js/audio.js';

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

if (failed) { console.log('AUDIO-FAILED'); process.exit(1); }
console.log('AUDIO-OK');
