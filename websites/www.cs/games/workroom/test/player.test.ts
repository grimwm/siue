import { test } from 'node:test';
import assert from 'node:assert/strict';
import { clipDone, follow, pickSource, skipTarget } from '../src/player.ts';
import { boundsFor, fitView, zoomAt } from '../src/zoom.ts';
import type { AudioSource } from '../src/score.ts';

const webm: AudioSource = { file: 'audio.webm', type: 'audio/webm; codecs=opus' };
const m4a: AudioSource = { file: 'audio.m4a', type: 'audio/mp4; codecs=mp4a.40.2' };

test('the first playable source wins (Safari without WebM Opus gets the m4a)', () => {
  assert.equal(pickSource([webm, m4a], t => (t.startsWith('audio/webm') ? 'probably' : 'maybe')), webm);
  assert.equal(pickSource([webm, m4a], t => (t.startsWith('audio/webm') ? '' : 'maybe')), m4a);
  assert.equal(pickSource([webm], () => ''), null);
});

test('a hear-it clip stops at its end', () => {
  assert.equal(clipDone(3.9, { from: 0, to: 4 }), false);
  assert.equal(clipDone(4, { from: 0, to: 4 }), true);
});

test('the view follows the playhead a page at a time', () => {
  const b = boundsFor(16, 800);
  const v = zoomAt(fitView(16, 800), 0, 4, b); // 200 px/s, 4 s visible from 0
  assert.equal(follow(v, 3, b).start, 0);
  assert.equal(follow(v, 5, b).start, 4);
  assert.equal(follow(v, 15.5, b).start, 12, 'clamped to the end');
});

test('back 5 and ahead 5 jump five seconds, clamped to the piece', () => {
  assert.equal(skipTarget('back5', 12, 60, []), 7);
  assert.equal(skipTarget('back5', 3, 60, []), 0);
  assert.equal(skipTarget('ahead5', 12, 60, []), 17);
  assert.equal(skipTarget('ahead5', 58, 60, []), 60);
});

test('previous section goes to the section playing, or the one before within 1.5 s of its start', () => {
  const starts = [0, 8, 20];
  assert.equal(skipTarget('prev', 12, 60, starts), 8);
  assert.equal(skipTarget('prev', 9, 60, starts), 0, 'just past a start: the one before');
  assert.equal(skipTarget('prev', 8, 60, starts), 0);
  assert.equal(skipTarget('prev', 1, 60, starts), 0);
  assert.equal(skipTarget('prev', 5, 60, []), 0, 'no sections: the start');
});

test('next section goes to the next start; past the last it stays put', () => {
  const starts = [0, 8, 20];
  assert.equal(skipTarget('next', 0, 60, starts), 8);
  assert.equal(skipTarget('next', 8, 60, starts), 20);
  assert.equal(skipTarget('next', 12, 60, starts), 20);
  assert.equal(skipTarget('next', 25, 60, starts), 25);
  assert.equal(skipTarget('next', 5, 60, []), 5);
});
