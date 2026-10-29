// Crete's music: the player that streams the title theme from two decks, handing over at the loop point, with fake
// decks and a manual clock.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { manualClock } from '../../_kit/test/clock.ts';
import { FADE_IN_S, LOOP_XF_S, createMusic } from '../src/music.ts';
import type { Deck, FadeShape } from '../src/music.ts';

type Fade = [to: number, seconds: number] | [to: number, seconds: number, shape: FadeShape];

class FakeDeck implements Deck {
  t = 0;
  playing = false;
  gain = 0;
  fades: Fade[] = [];
  plays = 0;
  /** play() rejects with NotAllowedError. */
  block = false;
  /** play() waits until the test settles it: held[i](error?) rejects with that error, or resolves. */
  hold = false;
  held: Array<(err?: Error) => void> = [];
  dur: number;
  ended: Array<() => void> = [];
  constructor(dur: number) {
    this.dur = dur;
  }
  play(): Promise<void> {
    this.plays++;
    if (this.block) return Promise.reject(Object.assign(new Error('blocked'), { name: 'NotAllowedError' }));
    if (this.hold) {
      return new Promise((resolve, reject) => {
        this.held.push(err => {
          if (err) reject(err);
          else {
            this.playing = true;
            resolve();
          }
        });
      });
    }
    this.playing = true;
    if (this.t >= this.dur) this.t = 0; // an ended element plays again from its start
    return Promise.resolve();
  }
  pause(): void { this.playing = false; }
  position(): number { return this.t; }
  seek(t: number): void { this.t = t; }
  duration(): number { return this.dur; }
  onEnded(listener: () => void): void { this.ended.push(listener); }
  fade(to: number, seconds: number, shape?: FadeShape): void {
    this.fades.push(shape ? [to, seconds, shape] : [to, seconds]);
    this.gain = to;
  }
}

const rig = (dur = 20, setup: (d: FakeDeck) => void = () => {}) => {
  const clock = manualClock();
  const decks: FakeDeck[] = [];
  const music = createMusic({
    deck: () => {
      const d = new FakeDeck(dur);
      setup(d);
      decks.push(d);
      return d;
    },
    timers: clock.timers,
  });
  /** Moves time on in 10 ms steps: each playing deck plays on (stopping at its end), then due timers fire. */
  const advance = (seconds: number): void => {
    for (let ms = 0; ms < seconds * 1000 - 1e-6; ms += 10) {
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
const pair = (decks: FakeDeck[]): [FakeDeck, FakeDeck] => {
  const [a, b] = decks;
  assert.ok(a && b, 'two decks');
  return [a, b];
};

test('the music starts at its beginning and fades in; its second deck is made, loaded and readied at once', async () => {
  const { music, decks, playing } = rig();
  music.setEnabled(true);
  const [a, b] = pair(decks);
  assert.deepEqual([a.t, a.playing], [0, true]);
  assert.deepEqual(a.fades, [[0, 0], [1, FADE_IN_S]]);
  assert.equal(b.plays, 1, 'the second deck is played once, silent, so the seam may play it later');
  assert.deepEqual(b.fades, [[0, 0]]);
  await settle();
  assert.deepEqual([b.playing, b.t], [false, 0], 'and paused again at its start');
  music.setEnabled(true);
  assert.deepEqual(playing(), [a], 'enabling it again changes nothing');
  assert.equal(a.plays, 1);
  assert.equal(decks.length, 2);
});

test('every pass is the whole file: the second deck starts from 0 as the first ends, a short equal-power dip hiding the join', async () => {
  const { music, decks, advance, playing, clock } = rig(20);
  /** When each deck began to sound, in seconds of the clock, and from where in the file. */
  const starts: Array<{ deck: FakeDeck; at: number; from: number }> = [];
  music.setEnabled(true);
  await settle();
  const [a, b] = pair(decks);
  for (const d of [a, b]) {
    const play = d.play.bind(d);
    d.play = () => {
      const from = d.t;
      const r = play();
      if (d.playing) starts.push({ deck: d, at: clock.clock.now() / 1000, from });
      return r;
    };
  }
  assert.ok(LOOP_XF_S >= 0.02 && LOOP_XF_S <= 0.05, `a fade of ${LOOP_XF_S} s only hides a decoder gap`);
  advance(20 - LOOP_XF_S - 0.02);
  assert.deepEqual(playing(), [a]);
  assert.deepEqual(last(a), [1, FADE_IN_S], 'the first deck is still at full gain');
  advance(0.04);
  assert.deepEqual(playing(), [a], 'nothing of the start overlaps the end');
  const out = last(a);
  assert.ok(out && out[0] === 0 && out[2] === 'equal-power' && out[1] <= LOOP_XF_S, `its last ${LOOP_XF_S} s fade out (${out})`);
  advance(0.04);
  assert.ok(b.playing, 'the second deck takes over');
  assert.deepEqual(last(b), [1, LOOP_XF_S, 'equal-power']);
  advance(20);
  advance(0.1);
  const [first, second] = starts;
  assert.ok(first && second, `two starts at the loop points (${starts.length})`);
  assert.deepEqual([first.deck, first.from, second.deck, second.from], [b, 0, a, 0], 'each from the start of the file');
  assert.ok(Math.abs(first.at - 20) <= 0.011, `the first pass lasted ${first.at} s, the file's 20 s`);
  assert.ok(Math.abs(second.at - first.at - 20) <= 0.011, `the second pass lasted ${second.at - first.at} s`);
  assert.equal(decks.length, 2);
});

test('the loop waits for the length of the file to be known', () => {
  const { music, decks, advance } = rig(Number.NaN);
  music.setEnabled(true);
  advance(3);
  const [a, b] = pair(decks);
  a.dur = 5;
  b.dur = 5;
  advance(5 - 3 + 0.05);
  assert.equal(b.playing, true);
});

test('when the seam is refused (a browser that will not play the second deck), the first deck loops on its own', async () => {
  const { music, decks, advance } = rig(20);
  music.setEnabled(true);
  await settle();
  const [a, b] = pair(decks);
  b.block = true;
  advance(20);
  await settle();
  assert.equal(b.playing, false);
  assert.ok(a.playing && a.t < 0.2, `the first deck plays again from its start (at ${a.t})`);
  assert.equal(last(a)?.[0], 1, 'at full gain');
  b.block = false;
  advance(20);
  assert.equal(b.playing, true, 'the next seam tries the second deck again');
});

test('a browser that blocks autoplay: the first gesture starts the theme, faded in, and readies its second deck', async () => {
  const { music, decks } = rig(20, d => { d.block = true; });
  music.setEnabled(true);
  await settle();
  const [a, b] = pair(decks);
  assert.equal(a.playing, false);
  a.block = false;
  b.block = false;
  music.kick();
  await settle();
  assert.equal(a.playing, true);
  assert.equal(a.t, 0);
  assert.deepEqual(a.fades.slice(-2), [[0, 0], [1, FADE_IN_S]]);
  assert.equal(b.plays, 2, 'the gesture readies the second deck too');
  assert.equal(b.playing, false);
  music.kick();
  assert.deepEqual([a.plays, b.plays], [2, 2], 'a gesture once both are ready asks for nothing');
});

test('a gesture with nothing blocked, or no music on, plays nothing', async () => {
  const { music, decks } = rig();
  music.kick();
  assert.equal(decks.length, 0);
  music.setEnabled(true);
  await settle();
  music.kick();
  await settle();
  assert.deepEqual(decks.map(d => d.plays), [1, 1]);
});

test('a play cut short (AbortError) after the track is on again does not count as blocked', async () => {
  const { music, decks } = rig(20, d => { d.hold = true; });
  music.setEnabled(true);
  const [a] = pair(decks);
  music.setEnabled(false);
  music.setEnabled(true);
  // The first play() gives up only now, cut short by the pause; the second goes ahead.
  a.held[0]?.(Object.assign(new Error('interrupted'), { name: 'AbortError' }));
  a.held[a.held.length - 1]?.();
  await settle();
  const plays = a.plays;
  music.kick();
  assert.equal(a.plays, plays, 'the gesture finds nothing blocked');
  assert.equal(a.playing, true);
});

test('a superseded play that is refused does not mark the playing track blocked', async () => {
  const { music, decks } = rig(20, d => { d.hold = true; });
  music.setEnabled(true);
  const [a] = pair(decks);
  music.setBackground(false);
  music.hold();
  music.release();
  a.held[0]?.(Object.assign(new Error('blocked'), { name: 'NotAllowedError' }));
  a.held[a.held.length - 1]?.();
  await settle();
  const plays = a.plays;
  music.kick();
  assert.equal(a.plays, plays);
});

test('music off stops it at once; on starts it again from its beginning', () => {
  const { music, decks, playing, advance } = rig();
  music.setEnabled(true);
  advance(2);
  music.setEnabled(false);
  assert.deepEqual(playing(), []);
  music.setEnabled(true);
  const [a] = pair(decks);
  assert.deepEqual([a.t, a.playing], [0, true]);
});

test('music plays nothing until it is turned on', () => {
  const { decks } = rig();
  assert.equal(decks.length, 0);
});

test('a hidden page holds the music where it is; shown again it goes on from there', () => {
  const { music, decks, playing, advance, clock } = rig();
  music.setEnabled(true);
  advance(6);
  music.setBackground(false);
  music.hold();
  assert.deepEqual(playing(), []);
  assert.equal(clock.pending(), 0);
  music.release();
  const [d] = pair(decks);
  assert.equal(d.playing, true);
  assert.ok(Math.abs(d.t - 6) < 0.02);
  assert.deepEqual(last(d), [1, FADE_IN_S]);
});

test('a hidden page keeps the music going by default, and stops it with Music in the background off', async () => {
  const { music, playing, advance } = rig();
  music.setEnabled(true);
  await settle();
  advance(2);
  music.hold();
  assert.equal(playing().length, 1, 'still playing');
  advance(2);
  music.release();
  await settle();
  assert.equal(playing().length, 1);
  music.setBackground(false);
  music.hold();
  assert.deepEqual(playing(), [], 'stopped while hidden');
  music.release();
  await settle();
  assert.equal(playing().length, 1);
});

test('in a hidden page whose timers run late, the end of the file hands over to the other deck and the loop never stops', () => {
  const { music, decks, playing } = rig(20);
  music.setEnabled(true);
  const [a, b] = pair(decks);
  b.playing = false;
  music.hold();
  // The browser throttled the loop timer, so the deck plays to its end and fires `ended` with the timer still pending.
  a.t = a.dur;
  a.playing = false;
  a.ended.forEach(fn => fn());
  assert.deepEqual(playing(), [b], 'the other deck starts the file again');
  assert.equal(b.t, 0);
  assert.deepEqual(last(b), [1, LOOP_XF_S, 'equal-power']);
  a.ended.forEach(fn => fn());
  assert.deepEqual(playing(), [b], 'an ended event of a deck that is not live changes nothing');
  b.t = b.dur;
  b.playing = false;
  b.ended.forEach(fn => fn());
  assert.deepEqual(playing(), [a], 'and back again');
});
