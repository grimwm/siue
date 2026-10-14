// The Next song announcement: what it says, and that it goes away on its own.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { manualClock } from '../../_kit/test/clock.ts';
import { createTrackToast, trackToastText } from '../src/track-toast.ts';

test('the text is the title and the author', () => {
  assert.equal(trackToastText({ file: 'audio/music/battle-theme-a.mp3', title: 'Battle Theme A', credit: 'cynicmusic' }), '♫ Battle Theme A · cynicmusic');
});

test('without an author it is just the title', () => {
  assert.equal(trackToastText({ file: 'a.mp3', title: 'Only Title' }), '♫ Only Title');
  assert.equal(trackToastText({ file: 'a.mp3', title: 'Only Title', credit: '   ' }), '♫ Only Title');
});

test('without a title the file name stands in', () => {
  assert.equal(trackToastText({ file: 'audio/music/battle-theme-a.mp3', credit: 'x' }), '♫ battle-theme-a · x');
});

test('the toast shows its text and hides itself after the wait', () => {
  const clock = manualClock();
  const host = { textContent: '', hidden: true };
  const toast = createTrackToast(host, clock.timers, 4000);
  toast.show('♫ A · b');
  assert.deepEqual([host.hidden, host.textContent], [false, '♫ A · b']);
  clock.advance(3999);
  assert.equal(host.hidden, false);
  clock.advance(1);
  assert.deepEqual([host.hidden, host.textContent], [true, '']);
  assert.equal(clock.pending(), 0);
});

test('a second song restarts the wait and leaves one timer', () => {
  const clock = manualClock();
  const host = { textContent: '', hidden: true };
  const toast = createTrackToast(host, clock.timers, 4000);
  toast.show('first');
  clock.advance(3000);
  toast.show('second');
  assert.equal(clock.pending(), 1);
  clock.advance(3999);
  assert.deepEqual([host.hidden, host.textContent], [false, 'second']);
  clock.advance(1);
  assert.equal(host.hidden, true);
});
