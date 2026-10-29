// The music's decks: which file a browser streams, and each media element through its own gain onto the music bus.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createAudioCore } from '../../_kit/audio/core.ts';
import { asAudioContext, fakeAudioContext } from '../../_kit/test/audio.ts';
import type { FakeContext, FakeGain } from '../../_kit/test/audio.ts';
import { mediaDeck, pickSource } from '../src/music-decks.ts';
import type { MediaLike } from '../src/music-decks.ts';

const SOURCES = [
  { url: 'audio/music/title.webm', type: 'audio/webm; codecs="opus"' },
  { url: 'audio/music/title.m4a', type: 'audio/mp4; codecs="mp4a.40.2"' },
];

test('the first file the browser can play: Opus in WebM, else AAC (Safari), else none', () => {
  assert.equal(pickSource(SOURCES, () => 'probably')?.url, 'audio/music/title.webm');
  assert.equal(pickSource(SOURCES, t => (t.startsWith('audio/mp4') ? 'maybe' : ''))?.url, 'audio/music/title.m4a');
  assert.equal(pickSource(SOURCES, () => ''), null);
});

const fakeMedia = () => {
  const el = {
    src: '', preload: '', currentTime: 0, duration: Number.NaN, volume: 1, plays: 0, paused: true,
    play() { el.plays++; el.paused = false; return Promise.resolve(); },
    pause() { el.paused = true; },
  };
  return el;
};
/** A fake context that can also take a media element, as a source node it records. */
const withMedia = (ctx: FakeContext) => {
  const sources: Array<{ el: unknown; node: FakeGain }> = [];
  Object.assign(ctx, {
    createMediaElementSource(el: unknown) {
      const node = ctx.createGain();
      sources.push({ el, node });
      return node;
    },
  });
  return sources;
};

test('a deck streams its file through its own gain, silent until faded in, onto the music bus', async () => {
  const ctx = fakeAudioContext();
  const sources = withMedia(ctx);
  const core = createAudioCore({ createContext: () => asAudioContext(ctx) });
  const el = fakeMedia();
  const deck = mediaDeck(core, 'audio/music/title.webm', el as unknown as MediaLike);
  assert.deepEqual([el.src, el.preload], ['audio/music/title.webm', 'auto']);
  await deck.play();
  assert.equal(el.plays, 1);
  const [source] = sources;
  assert.ok(source);
  assert.equal(source.el, el);
  const gain = source.node.to[0] as FakeGain;
  assert.equal(gain.gain.value, 0);
  assert.deepEqual(gain.to, [core.bus('music')]);
  deck.fade(1, 2);
  assert.deepEqual(gain.gain.calls.slice(-3), [['cancel', 0, 10], ['set', 0, 10], ['lin', 1, 12]]);
  deck.fade(0, 0);
  assert.deepEqual(gain.gain.calls.slice(-2), [['cancel', 0, 10], ['set', 0, 10]]);
  await deck.play();
  assert.equal(sources.length, 1, 'the element is wired once');
  assert.equal(el.volume, 1);
});

test('a deck reads and moves the element’s time, and pauses it', () => {
  const core = createAudioCore({ createContext: () => null });
  const el = fakeMedia();
  const deck = mediaDeck(core, 'a.webm', el as unknown as MediaLike);
  el.duration = 216.8;
  deck.seek(12.5);
  assert.deepEqual([deck.position(), deck.duration()], [12.5, 216.8]);
  void deck.play();
  deck.pause();
  assert.equal(el.paused, true);
});

test('without Web Audio a deck sets the element’s own volume', () => {
  const core = createAudioCore({ createContext: () => null });
  const el = fakeMedia();
  const deck = mediaDeck(core, 'a.webm', el as unknown as MediaLike);
  deck.fade(0, 0);
  assert.equal(el.volume, 0);
  deck.fade(1, 2);
  assert.equal(el.volume, 1);
});
