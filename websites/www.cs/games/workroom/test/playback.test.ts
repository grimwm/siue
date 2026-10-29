// The Player against a stub <audio> and the Sheet against a fake notation
// library: a seek during playback is never undone, a clip stops at its end, the
// frame loop ends with the Player, the transport buttons seek, the piece loops
// unless a clip is playing, and switching lanes leaves one drawing.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { h, render } from 'preact';
import { act } from 'preact/test-utils';
import { fire, installDocument, makeEl, document as stubDocument, renderTarget, walk } from '../../_kit/test/dom-stub.ts';
import type { StubElement } from '../../_kit/test/dom-stub.ts';

installDocument();

// A manual frame clock: the Player's loop (and Preact's own effect flush) run when the test says.
const frames = new Map<number, (t: number) => void>();
const cancelled: number[] = [];
let nextFrame = 1;
Object.assign(globalThis, {
  requestAnimationFrame: (cb: (t: number) => void) => { frames.set(nextFrame, cb); return nextFrame++; },
  cancelAnimationFrame: (id: number) => { cancelled.push(id); frames.delete(id); },
});
const frame = (): void => { const run = [...frames.values()]; frames.clear(); for (const cb of run) cb(0); };

interface StubAudio extends StubElement { currentTime: number; paused: boolean; loop: boolean; play(): Promise<void>; pause(): void; canPlayType(t: string): string }
const audios: StubAudio[] = [];
const asAudio = (el: StubElement): StubAudio => {
  const a = el as StubAudio;
  a.currentTime = 0;
  a.paused = true;
  a.loop = false;
  a.canPlayType = () => 'maybe';
  a.play = () => { a.paused = false; fire(a, 'play'); return Promise.resolve(); };
  a.pause = () => { a.paused = true; fire(a, 'pause'); };
  return a;
};
const originalNS = stubDocument.createElementNS;
const originalEl = stubDocument.createElement;
stubDocument.createElement = tag => (tag === 'audio' ? asAudio(originalEl(tag)) : originalEl(tag));
stubDocument.createElementNS = (ns, tag) => {
  const el = originalNS(ns, tag);
  if (tag !== 'audio') return el;
  const a = asAudio(el);
  audios.push(a);
  return a;
};

const ui = await (await import('../../_kit/test/tsx.ts')).importTsx<{
  player: typeof import('../src/ui/Player.tsx');
  sheet: typeof import('../src/ui/SheetMusic.tsx');
}>(import.meta.dirname, { player: '../src/ui/Player.tsx', sheet: '../src/ui/SheetMusic.tsx' });
const { createSheet } = await import('../src/sheetlife.ts');

const SRC = [{ file: 'audio.webm' as const, type: 'audio/webm; codecs=opus' }];
const playerProps = (over: Record<string, unknown> = {}) => ({ src: SRC, audioSrc: (f: string) => f, time: 0, bar: null, onTime: () => {}, clip: null, onClipDone: () => {}, duration: 60, onSeek: () => {}, ...over });
const button = (root: StubElement, name: string): StubElement => walk(root).find(e => e.localName === 'button' && e.textContent === name)!;
const pending = (): number => frames.size;
const labelled = (root: StubElement, name: string): StubElement => walk(root).find(e => e.localName === 'button' && e.getAttribute('aria-label') === name)!;

test('the transport buttons seek five seconds, and to the start and end of the whole track, from where the audio is', async () => {
  const root = makeEl('root');
  const seeks: number[] = [];
  await act(() => { render(h(ui.player.Player, playerProps({ onSeek: (t: number) => seeks.push(t) })), renderTarget(root)); });
  const audio = audios.at(-1)!;
  audio.currentTime = 12;
  for (const name of ['Back 5 seconds', 'Ahead 5 seconds', 'To the start', 'To the end']) fire(labelled(root, name), 'click');
  assert.deepEqual(seeks, [7, 17, 0, 60]);
  render(null, renderTarget(root));
});

test('the piece loops by default, Loop turns it off, and a clip never loops', async () => {
  const root = makeEl('root');
  await act(() => { render(h(ui.player.Player, playerProps()), renderTarget(root)); });
  const audio = audios.at(-1)!;
  const loop = button(root, 'Loop');
  assert.equal(audio.loop, true, 'on by default');
  assert.equal(loop.getAttribute('aria-pressed'), 'true');
  await act(() => { fire(loop, 'click'); });
  assert.equal(audio.loop, false);
  assert.equal(button(root, 'Loop').getAttribute('aria-pressed'), 'false');
  await act(() => { fire(button(root, 'Loop'), 'click'); });
  await act(() => { render(h(ui.player.Player, playerProps({ clip: { from: 2, to: 4 } })), renderTarget(root)); });
  assert.equal(audio.loop, false, 'a clip stops at its end');
  await act(() => { render(h(ui.player.Player, playerProps()), renderTarget(root)); });
  assert.equal(audio.loop, true, 'back on once the clip is done');
  render(null, renderTarget(root));
});

test('a seek while playing writes the audio position at once and the old time never comes back', async () => {
  const root = makeEl('root');
  const reported: number[] = [];
  const seekRef: { current: ((t: number) => void) | null } = { current: null };
  await act(() => { render(h(ui.player.Player, playerProps({ onTime: (t: number) => reported.push(t), seekRef })), renderTarget(root)); });
  const audio = audios.at(-1)!;
  await act(() => { fire(button(root, 'Play'), 'click'); });
  audio.currentTime = 1;
  frame();
  assert.equal(reported.at(-1), 1);
  assert.ok(seekRef.current, 'the Player hands out its seek');
  seekRef.current!(5);
  assert.equal(audio.currentTime, 5, 'written in the same call');
  frame();
  frame();
  assert.deepEqual(reported.slice(-2), [5, 5]);
  assert.ok(!reported.slice(reported.indexOf(5)).includes(1), 'the old time did not return');
  assert.equal(button(root, 'Pause')?.textContent, 'Pause');
  render(null, renderTarget(root));
});

test('Hear it plays the clip and stops at its end', async () => {
  const root = makeEl('root');
  let done = 0;
  const clip = { from: 2, to: 4 };
  const clipRef: { current: ((c: { from: number; to: number }) => void) | null } = { current: null };
  await act(() => { render(h(ui.player.Player, playerProps({ clip, clipRef, onClipDone: () => { done++; } })), renderTarget(root)); });
  const audio = audios.at(-1)!;
  assert.equal(audio.paused, true, 'nothing plays until the tap');
  await act(() => { clipRef.current!(clip); });
  assert.equal(audio.currentTime, 2, 'starts at the clip start');
  assert.equal(audio.paused, false, 'and plays');
  audio.currentTime = 3.9;
  frame();
  assert.equal(done, 0);
  audio.currentTime = 4.05;
  frame();
  assert.equal(audio.paused, true, 'paused at the end');
  assert.equal(done, 1);
  frame();
  assert.equal(done, 1, 'the loop ended');
  render(null, renderTarget(root));
});

test('unmounting cancels the Player\'s own pending frame and drops the seek handle', async () => {
  const root = makeEl('root');
  const reported: number[] = [];
  const seekRef: { current: ((t: number) => void) | null } = { current: null };
  await act(() => { render(h(ui.player.Player, playerProps({ onTime: (t: number) => reported.push(t), seekRef })), renderTarget(root)); });
  await act(() => { fire(button(root, 'Play'), 'click'); });
  frame();
  const seen = reported.length;
  assert.ok(seen > 0, 'the loop reported a time');
  assert.equal(frames.size, 1, 'the Player waits on exactly one frame');
  const mine = [...frames.keys()];
  await act(() => { render(null, renderTarget(root)); });
  assert.ok(mine.every(id => cancelled.includes(id)), 'cancelAnimationFrame was called with the Player\'s frame');
  assert.ok(!mine.some(id => frames.has(id)), 'and it is no longer queued');
  assert.equal(seekRef.current, null);
  frame(); // the queue was not cleared by the test
  assert.equal(reported.length, seen, 'nothing reported after unmount');
});

test('pausing cancels the Player\'s pending frame', async () => {
  const root = makeEl('root');
  const reported: number[] = [];
  await act(() => { render(h(ui.player.Player, playerProps({ onTime: (t: number) => reported.push(t) })), renderTarget(root)); });
  await act(() => { fire(button(root, 'Play'), 'click'); });
  frame();
  const seen = reported.length;
  assert.equal(frames.size, 1);
  const mine = [...frames.keys()];
  await act(() => { fire(button(root, 'Pause'), 'click'); });
  assert.ok(mine.every(id => cancelled.includes(id)), 'cancelAnimationFrame was called with the Player\'s frame');
  assert.equal(frames.size, 0, 'nothing is queued');
  frame();
  assert.equal(reported.length, seen, 'no time reported while paused');
  render(null, renderTarget(root));
});

// --- Sheet ---

const lanes = ['a', 'b'].map(id => ({ id, name: `Lane ${id}`, family: 'strings' as const, icon: 'strings' as const, color: '#112233' }));
const settle = async (): Promise<void> => { for (let i = 0; i < 6; i++) await act(() => new Promise<void>(r => setImmediate(r))); };

test('switching lanes twice leaves one drawing, and leaving the view removes the resize listener', async () => {
  const listeners = new Set<() => void>();
  const win = { addEventListener: (_t: 'resize', f: () => void) => { listeners.add(f); }, removeEventListener: (_t: 'resize', f: () => void) => { listeners.delete(f); } };
  const shown: string[] = [];
  const ports = {
    fetchText: async () => '<xml/>',
    loadModule: async () => ({
      mountSheet: (el: HTMLElement) => createSheet(el as unknown as StubElement as never, host => ({
        load: async () => {},
        render: () => { const svg = stubDocument.createElement('svg'); (host as unknown as StubElement).appendChild(svg); },
        clear: () => {},
      }), win, (_x, lane, name) => { shown.push(`${lane} ${name}`); return ''; }),
    }),
  };
  const root = makeEl('root');
  const props = (laneId: string) => ({ musicxmlSrc: 'score.musicxml', laneId, lanes, onLane: () => {}, ports });
  await act(() => { render(h(ui.sheet.SheetMusic, props('a')), renderTarget(root)); });
  assert.match(root.textContent, /Loading sheet music/);
  await settle();
  const sheet = walk(root).find(e => e.id === 'sheet')!;
  assert.equal(sheet.children.length, 1);
  await act(() => { render(h(ui.sheet.SheetMusic, props('b')), renderTarget(root)); });
  await settle();
  await act(() => { render(h(ui.sheet.SheetMusic, props('a')), renderTarget(root)); });
  await settle();
  assert.deepEqual(shown, ['a Lane a', 'b Lane b', 'a Lane a'], 'each lane is drawn by its id, with its name for parts a notation program numbered');
  assert.equal(sheet.children.length, 1, 'one drawing after two lane switches');
  assert.equal(listeners.size, 1);
  assert.doesNotMatch(root.textContent, /Loading sheet music/);
  await act(() => { render(null, renderTarget(root)); });
  await settle();
  assert.equal(listeners.size, 0, 'the resize listener is gone');
  assert.equal(sheet.children.length, 0);
});

test('a renderer that fails to load says so, readably', async () => {
  const ports = { fetchText: async () => '<xml/>', loadModule: async () => { throw new Error('The sheet music renderer did not load. Check the connection and reload the page.'); } };
  const root = makeEl('root');
  await act(() => { render(h(ui.sheet.SheetMusic, { musicxmlSrc: 'score.musicxml', laneId: 'a', lanes, onLane: () => {}, ports }), renderTarget(root)); });
  await settle();
  assert.match(root.textContent, /renderer did not load/);
  assert.doesNotMatch(root.textContent, /Loading sheet music/);
  render(null, renderTarget(root));
});

test('a view left before its file arrives mounts nothing and rejects nothing', async () => {
  let mounts = 0;
  let arrive!: (xml: string) => void;
  const ports = {
    fetchText: () => new Promise<string>(r => { arrive = r; }),
    loadModule: async () => ({ mountSheet: () => { mounts++; throw new Error('should not mount'); } }),
  };
  const unhandled: unknown[] = [];
  const note = (e: unknown): void => { unhandled.push(e); };
  process.on('unhandledRejection', note);
  const root = makeEl('root');
  await act(() => { render(h(ui.sheet.SheetMusic, { musicxmlSrc: 'score.musicxml', laneId: 'a', lanes, onLane: () => {}, ports }), renderTarget(root)); });
  await act(() => { render(null, renderTarget(root)); });
  arrive('<xml/>');
  await settle();
  await new Promise<void>(r => setImmediate(r)); // Node reports a rejection once the microtask queue drains
  process.off('unhandledRejection', note);
  assert.equal(mounts, 0);
  assert.deepEqual(unhandled, []);
});

test('Download offers the audio the Player plays, the sheet music and the score, named for the draft', async () => {
  const root = makeEl('root');
  const src = [{ file: 'audio.m4a' as const, type: 'audio/mp4' }, ...SRC];
  await act(() => { render(h(ui.player.Player, playerProps({ src, audioSrc: (f: string) => `draft.php?file=${f}`, download: { piece: 'crete-title', version: 3, sheet: true } })), renderTarget(root)); });
  const group = walk(root).find(e => e.getAttribute('role') === 'group' && e.getAttribute('aria-label') === 'Download this draft')!;
  assert.ok(group, 'a labelled Download group');
  const links = walk(group).filter(e => e.localName === 'a');
  assert.deepEqual(links.map(a => [a.textContent, a.getAttribute('href'), a.getAttribute('download')]), [
    ['Audio', 'draft.php?file=audio.m4a', 'crete-title-v3.m4a'],
    ['Sheet music', 'draft.php?file=score.musicxml', 'crete-title-v3.musicxml'],
    ['Score', 'draft.php?file=score.json', 'crete-title-v3.json'],
  ]);
  assert.equal(links[0]!.getAttribute('aria-label'), 'Download audio, crete-title-v3.m4a');
  assert.ok(links.every(a => /\bmin-h-11\b/.test(a.getAttribute('class') ?? '') && /\bmin-w-11\b/.test(a.getAttribute('class') ?? '')), '44 px targets');
  await act(() => { render(h(ui.player.Player, playerProps({ download: { piece: 'rain', version: 1, sheet: false } })), renderTarget(root)); });
  assert.deepEqual(walk(root).filter(e => e.localName === 'a').map(a => a.textContent), ['Audio', 'Score'], 'no sheet music on a piece without one');
  render(null, renderTarget(root));
});

// --- A draft played from its score ---

const { soundBuilder } = await import('../src/render/sound.ts');
const renderable = (await import('../src/score.ts')).parseScore(JSON.parse((await import('node:fs')).readFileSync(new URL('./fixtures/score-renderable-v1.json', import.meta.url), 'utf8')));
assert.ok(renderable.ok);
const library = { version: 1 as const, source: '', commit: '', licence: '', credit: '', instruments: {} };

test('a draft is built once and kept in memory: the library and each draft render once, a failure is tried again', async () => {
  const calls = { library: 0, load: 0, render: 0, url: 0 };
  let fail = true;
  const build = soundBuilder({
    library: async () => { calls.library++; return library; },
    load: async () => { calls.load++; },
    render: async () => { calls.render++; if (fail) throw new Error('the cello sample cello/c3.flac could not be loaded: the server answered 404'); return { channels: [new Float32Array(4), new Float32Array(4)], rate: 48000 }; },
    url: bytes => { calls.url++; return `blob:${bytes.length}`; },
  });
  const stages: string[] = [];
  await assert.rejects(build('rain/v1', renderable.score, s => stages.push(s)), /the server answered 404/);
  fail = false;
  const a = await build('rain/v1', renderable.score, s => stages.push(s));
  const b = await build('rain/v1', renderable.score, s => stages.push(s));
  assert.equal(a, b, 'the same sound, not a second render');
  assert.equal(a.url, 'blob:60', 'a 16-bit stereo WAV: a 44-byte header and 4 frames of 4 bytes');
  assert.equal(a.rate, 48000);
  assert.deepEqual(calls, { library: 1, load: 2, render: 2, url: 1 }, 'the failed render is tried again; the library is fetched once');
  await build('rain/v2', renderable.score, () => {});
  assert.equal(calls.render, 3, 'another draft is its own render');
  assert.deepEqual(stages, ['instruments', 'rendering', 'instruments', 'rendering', 'finishing']);
});

test('once the WAV is made, the built sound keeps one channel, the mix, in the left channel\'s own memory', async () => {
  const left = Float32Array.from([0.1, 0.2, -0.4, 0]);
  const right = Float32Array.from([0.3, 0.2, 0, 0.5]);
  const [l0, r0] = [[...left], [...right]];
  let bytes: Uint8Array | null = null;
  const build = soundBuilder({
    library: async () => library,
    load: async () => {},
    render: async () => ({ channels: [left, right], rate: 48000 }),
    url: b => { bytes = b; return 'blob:x'; },
  });
  const built = await build('mix/v1', renderable.score, () => {});
  const v = new DataView(bytes!.buffer);
  assert.deepEqual([v.getInt16(44, true), v.getInt16(46, true)], [Math.round(0.1 * 32767), Math.round(0.3 * 32767)], 'the WAV is the stereo audio');
  assert.equal(built.channels.length, 1);
  assert.equal(built.channels[0], left, 'no new array: the mix is written over the left channel');
  assert.deepEqual([...built.channels[0]!], l0.map((x, i) => Math.fround(Math.fround(x / 2) + r0[i]! / 2)), 'the mean, summed as the sound picture sums it');
});

test('a failed library fetch is tried again by the next build', async () => {
  let tries = 0;
  const build = soundBuilder({
    library: async () => { if (++tries === 1) throw new Error('the server answered 503'); return library; },
    load: async () => {},
    render: async () => ({ channels: [new Float32Array(2)], rate: 48000 }),
    url: () => 'blob:x',
  });
  await assert.rejects(build('a/v1', renderable.score, () => {}), /503/);
  assert.equal((await build('a/v1', renderable.score, () => {})).url, 'blob:x');
});

test('while the sound is built the Player says so with a progress line, and nothing plays', async () => {
  const root = makeEl('root');
  const before = audios.length;
  await act(() => { render(h(ui.player.Player, playerProps({ src: [], rendered: { state: 'building', stage: 'rendering' }, download: { piece: 'rain', version: 1, sheet: false } })), renderTarget(root)); });
  assert.match(root.textContent, /Building the sound…/);
  const bar = walk(root).find(e => e.localName === 'progress')!;
  assert.ok(bar, 'a progress line');
  assert.equal(String(bar.value), '2', 'the second of three stages');
  assert.equal(bar.getAttribute('max'), '3');
  assert.equal(audios.length, before, 'no <audio> yet');
  assert.equal(button(root, 'Play').disabled, true);
  assert.doesNotMatch(root.textContent, /cannot play/);
  assert.deepEqual(walk(root).filter(e => e.localName === 'a').map(a => a.textContent), ['Score'], 'no audio to download yet');
  render(null, renderTarget(root));
});

test('a built sound plays from its blob URL and downloads as Audio (WAV)', async () => {
  const root = makeEl('root');
  const asked: string[] = [];
  await act(() => { render(h(ui.player.Player, playerProps({ src: [], audioSrc: (f: string) => { asked.push(f); return `draft.php?file=${f}`; }, rendered: { state: 'ready', url: 'blob:https://x/7', channels: [], rate: 48000 }, download: { piece: 'rain', version: 2, sheet: false } })), renderTarget(root)); });
  const audio = audios.at(-1)!;
  assert.equal(audio.getAttribute('src'), 'blob:https://x/7');
  assert.equal(button(root, 'Play').disabled, false);
  await act(() => { fire(button(root, 'Play'), 'click'); });
  assert.equal(audio.paused, false);
  assert.doesNotMatch(root.textContent, /Building the sound/);
  const links = walk(root).filter(e => e.localName === 'a');
  assert.deepEqual(links.map(a => [a.textContent, a.getAttribute('href'), a.getAttribute('download')]), [
    ['Audio (WAV)', 'blob:https://x/7', 'rain-v2.wav'],
    ['Score', 'draft.php?file=score.json', 'rain-v2.json'],
  ]);
  assert.ok(!asked.some(f => f.startsWith('audio.')), 'no draft audio file is asked for');
  render(null, renderTarget(root));
});

test('a sound that could not be built says why, and Play is disabled', async () => {
  const root = makeEl('root');
  await act(() => { render(h(ui.player.Player, playerProps({ src: [], rendered: { state: 'failed', reason: 'the server answered 404' }, download: { piece: 'rain', version: 1, sheet: false } })), renderTarget(root)); });
  const alert = walk(root).find(e => e.getAttribute('role') === 'alert')!;
  assert.equal(alert.textContent, 'The sound could not be built: the server answered 404');
  assert.equal(button(root, 'Play').disabled, true);
  assert.ok(['Back 5 seconds', 'Ahead 5 seconds', 'To the start', 'To the end'].every(n => labelled(root, n).disabled === true));
  assert.doesNotMatch(root.textContent, /Building the sound|cannot play/);
  render(null, renderTarget(root));
});
