// Crete's music: which track each screen calls for, and the player that streams it from two decks a track,
// crossfading at the loop point and between tracks, with fake decks and a manual clock.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { manualClock } from '../../_kit/test/clock.ts';
import { FADE_IN_S, FADE_OUT_S, LOOP_XF_S, SWITCH_S, createMusic, trackFor } from '../src/music.ts';
import type { Deck, Track } from '../src/music.ts';
import type { LayerName } from '../src/layers.ts';

class FakeDeck implements Deck {
  t = 0;
  playing = false;
  gain = 0;
  fades: Array<[to: number, seconds: number]> = [];
  plays = 0;
  block = false;
  readonly track: Track;
  dur: number;
  constructor(track: Track, dur: number) {
    this.track = track;
    this.dur = dur;
  }
  play(): Promise<void> {
    this.plays++;
    if (this.block) return Promise.reject(new Error('NotAllowedError'));
    this.playing = true;
    return Promise.resolve();
  }
  pause(): void { this.playing = false; }
  position(): number { return this.t; }
  seek(t: number): void { this.t = t; }
  duration(): number { return this.dur; }
  fade(to: number, seconds: number): void {
    this.fades.push([to, seconds]);
    this.gain = to;
  }
}

const rig = (dur = 20) => {
  const clock = manualClock();
  const decks: FakeDeck[] = [];
  const music = createMusic({
    deck: track => {
      const d = new FakeDeck(track, dur);
      decks.push(d);
      return d;
    },
    timers: clock.timers,
  });
  /** Moves time on in 10 ms steps: each playing deck plays on (stopping at its end), then due timers fire. */
  const advance = (seconds: number): void => {
    for (let ms = 0; ms < seconds * 1000; ms += 10) {
      for (const d of decks) {
        if (!d.playing) continue;
        d.t = Math.min(d.dur, d.t + 0.01);
        if (d.t >= d.dur) d.playing = false;
      }
      clock.advance(10);
    }
  };
  const playing = () => decks.filter(d => d.playing);
  return { music, decks, advance, playing, clock };
};
const settle = () => new Promise(r => setImmediate(r));
const last = (d: FakeDeck) => d.fades[d.fades.length - 1];

test('the title card calls for the title theme, the story cards for the story cut, a level and the editor for none', () => {
  const view = (...stack: LayerName[]) => ({ top: stack[stack.length - 1] ?? null, has: (n: LayerName) => stack.includes(n) });
  assert.equal(trackFor(view('title')), 'title');
  assert.equal(trackFor(view('title', 'menu')), 'title', 'the menu over the title card');
  assert.equal(trackFor(view('title', 'levels')), 'title');
  assert.equal(trackFor(view('title', 'story')), 'story');
  assert.equal(trackFor(view('chapter')), 'story', "a chapter's card");
  assert.equal(trackFor(view('end', 'chapter')), 'story', "the closing card over a level's end");
  assert.equal(trackFor(view('lore')), 'story', 'a page taken in play');
  assert.equal(trackFor(view('menu', 'lore')), 'story', 'the Lore book from the menu');
  assert.equal(trackFor(view('title', 'editor')), null);
  assert.equal(trackFor(view()), null, 'a level in play');
  assert.equal(trackFor(view('start')), null);
  assert.equal(trackFor(view('menu')), null, 'the menu over a level');
  assert.equal(trackFor(view('shared')), null);
});

test('the title theme starts at its beginning and fades in', () => {
  const { music, decks, playing } = rig();
  music.want('title');
  assert.equal(decks.length, 1);
  const [d] = decks;
  assert.ok(d);
  assert.deepEqual([d.track, d.t, d.playing], ['title', 0, true]);
  assert.deepEqual(d.fades, [[0, 0], [1, FADE_IN_S]]);
  music.want('title');
  assert.equal(playing().length, 1, 'wanting it again changes nothing');
  assert.equal(d.plays, 1);
});

test('at the loop point a second deck starts the track again and the two crossfade; the decks then take turns', () => {
  const { music, decks, advance, playing } = rig(20);
  music.want('title');
  advance(20 - LOOP_XF_S - 0.1);
  assert.equal(decks.length, 1, 'no second deck before the loop point');
  advance(0.2);
  assert.equal(decks.length, 2);
  const [a, b] = decks;
  assert.ok(a && b);
  assert.equal(b.track, 'title');
  assert.ok(b.playing && b.t < 0.2, 'the second deck plays from the start');
  assert.deepEqual(last(b), [1, LOOP_XF_S]);
  assert.deepEqual(last(a), [0, LOOP_XF_S]);
  advance(LOOP_XF_S + 0.2);
  assert.deepEqual(playing(), [b], 'the first deck stops once faded');
  advance(20 - LOOP_XF_S - b.t + 0.1);
  assert.equal(decks.length, 2, 'the first deck is used again');
  assert.ok(a.playing && a.t < 0.5);
  advance(LOOP_XF_S + 0.2);
  assert.deepEqual(playing(), [a]);
});

test('the loop waits for the length of the file to be known', () => {
  const { music, decks, advance } = rig(Number.NaN);
  music.want('title');
  advance(3);
  const [d] = decks;
  assert.ok(d);
  d.dur = 5;
  advance(5 - 3 - LOOP_XF_S + 0.1);
  assert.equal(decks.length, 2);
});

test('from the title theme to the story cut: the cut comes in at the same point of the music as the theme fades', () => {
  const { music, decks, advance, playing } = rig();
  music.want('title');
  advance(3);
  music.want('story');
  const [title, story] = decks;
  assert.ok(title && story);
  assert.equal(story.track, 'story');
  assert.ok(Math.abs(story.t - 3) < 0.02, `the cut starts at ${story.t}`);
  assert.deepEqual(story.fades, [[0, 0], [1, SWITCH_S]]);
  assert.deepEqual(last(title), [0, SWITCH_S]);
  advance(SWITCH_S + 0.2);
  assert.deepEqual(playing(), [story]);
});

test('a level fades the music out and stops it; the title card later starts the theme from its beginning', () => {
  const { music, decks, advance, playing, clock } = rig();
  music.want('title');
  advance(4);
  music.want(null);
  const [d] = decks;
  assert.ok(d);
  assert.deepEqual(last(d), [0, FADE_OUT_S]);
  advance(FADE_OUT_S + 0.2);
  assert.deepEqual(playing(), []);
  assert.equal(clock.pending(), 0, 'no loop timer left running');
  music.want('title');
  assert.equal(d.t, 0);
  assert.equal(d.playing, true);
  assert.deepEqual(last(d), [1, FADE_IN_S]);
});

test('back to the title card while the theme is still fading out: it comes back up from where it is', () => {
  const { music, decks, advance } = rig();
  music.want('title');
  advance(4);
  music.want(null);
  advance(FADE_OUT_S / 2);
  music.want('title');
  const [d] = decks;
  assert.ok(d);
  assert.equal(decks.length, 1);
  assert.ok(d.t > 4, 'not restarted');
  assert.deepEqual(last(d), [1, FADE_IN_S]);
  advance(FADE_OUT_S);
  assert.equal(d.playing, true, 'the fade-out did not stop it');
});

test('a browser that blocks autoplay: the first gesture starts the theme, faded in', async () => {
  const clock = manualClock();
  const decks: FakeDeck[] = [];
  const music = createMusic({ deck: t => { const d = new FakeDeck(t, 20); d.block = true; decks.push(d); return d; }, timers: clock.timers });
  music.want('title');
  await settle();
  const [d] = decks;
  assert.ok(d);
  assert.equal(d.playing, false);
  d.block = false;
  music.kick();
  await settle();
  assert.equal(d.playing, true);
  assert.equal(d.t, 0);
  assert.deepEqual(d.fades.slice(-2), [[0, 0], [1, FADE_IN_S]]);
  music.kick();
  assert.equal(d.plays, 2, 'a gesture once it plays asks for nothing');
});

test('a gesture with nothing blocked, or no music wanted, plays nothing', async () => {
  const { music, decks } = rig();
  music.kick();
  assert.equal(decks.length, 0);
  music.want('title');
  music.kick();
  await settle();
  assert.equal(decks[0]?.plays, 1);
});

test('music off stops it at once and plays nothing until on, which starts the wanted track again', () => {
  const { music, decks, playing, advance } = rig();
  music.want('title');
  advance(2);
  music.setEnabled(false);
  assert.deepEqual(playing(), []);
  music.want('story');
  assert.equal(decks.length, 1, 'no deck while off');
  music.setEnabled(true);
  const story = decks[1];
  assert.ok(story);
  assert.deepEqual([story.track, story.t, story.playing], ['story', 0, true]);
});

test('music that starts off plays nothing until it is turned on', () => {
  const { music, decks } = rig();
  music.setEnabled(false);
  music.want('title');
  assert.equal(decks.length, 0);
});

test('a hidden page holds the music where it is; shown again it goes on from there', () => {
  const { music, decks, playing, advance, clock } = rig();
  music.want('title');
  advance(6);
  music.hold();
  assert.deepEqual(playing(), []);
  assert.equal(clock.pending(), 0);
  music.release();
  const [d] = decks;
  assert.ok(d);
  assert.equal(d.playing, true);
  assert.ok(Math.abs(d.t - 6) < 0.02);
  assert.deepEqual(last(d), [1, FADE_IN_S]);
});
