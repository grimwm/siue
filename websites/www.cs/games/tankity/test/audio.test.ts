// Tankity's sound without a browser: the loop-point trim, which track a level
// plays, silence without Web Audio, and the track hand-off against the kit's
// fake context and a fetch whose loads land when the test says.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { trimSilence, trackForLevel, sfx, music, initAudio, noteGesture, setSoundMuted } from '../src/audio.ts';
import { fakeAudioContext } from '../../_kit/test/audio.ts';

function must<T>(v: T | null | undefined, what: string): T {
  assert.ok(v !== null && v !== undefined, `${what} is missing`);
  return v;
}
const near = (a: number, b: number) => Math.abs(a - b) < 1e-9;
// The module makes its one context the first time a sound needs it after
// AudioContext exists; every test after the hand-off shares this fake.
const ctx = fakeAudioContext();

test('trim keeps a track from its first sound to its last', () => {
  const loud = new Float32Array(100);
  loud.fill(0.5, 20, 80);
  loud[10] = 0.003; // under the floor: still silence
  const t = trimSilence({ sampleRate: 100, getChannelData: () => loud });
  assert.ok(near(t.start, 0.2) && near(t.end, 0.8), JSON.stringify(t));
});

test('trim of pure silence keeps the last sample; of no silence keeps all', () => {
  const quiet = trimSilence({ sampleRate: 100, getChannelData: () => new Float32Array(50) });
  assert.ok(near(quiet.start, 0.49) && near(quiet.end, 0.5), JSON.stringify(quiet));
  const whole = trimSilence({ sampleRate: 10, getChannelData: () => new Float32Array(10).fill(0.1) });
  assert.ok(near(whole.start, 0) && near(whole.end, 1), JSON.stringify(whole));
});

test('the demo plays the theme; rounds walk the other tracks and wrap', () => {
  assert.deepEqual([0, 1, 2, 3, 4, 5, 6].map(l => trackForLevel(l, 4)), [0, 1, 2, 3, 1, 2, 3]);
  assert.equal(trackForLevel(0, 1), 0);
  assert.equal(trackForLevel(5, 1), 0);
});

test('with no AudioContext (this is Node) nothing throws and nothing plays', () => {
  assert.doesNotThrow(() => { sfx.play('boom'); sfx.turnPing(); music.start(); music.stop(); });
});

test('a skipped or stopped track that is still loading never keeps playing', async () => {
  Reflect.set(globalThis, 'AudioContext', function AudioContext() { return ctx; });
  const pending: Record<string, () => void> = {};
  Reflect.set(globalThis, 'fetch', (file: string) => new Promise<{ ok: boolean; arrayBuffer(): Promise<{ file: string }> }>(res => {
    pending[file] = () => res({ ok: true, arrayBuffer: () => Promise.resolve({ file }) });
  }));
  const settle = async () => { for (let i = 0; i < 10; i++) await new Promise(r => setTimeout(r, 0)); };
  const land = async (file: string) => { must(pending[file], `a load of ${file}`)(); await settle(); };
  const heard = () => ctx.nodes.flatMap(n => (n.kind === 'source' && n.started !== null && n.stopped === null && n.buffer?.file ? [n.buffer.file] : []));

  initAudio({ sfx: {}, music: [{ file: 'a.mp3' }, { file: 'b.mp3' }, { file: 'c.mp3' }] });
  noteGesture(false); // starts the theme, a.mp3
  await land('a.mp3');
  assert.deepEqual(heard(), ['a.mp3']);
  music.next(); // b.mp3 starts loading...
  music.next(); // ...and is skipped for c.mp3 before it arrives
  await land('b.mp3');
  await land('c.mp3');
  assert.deepEqual(heard(), ['c.mp3']);
  music.next(); // a.mp3 again (cached), then stop while it settles
  music.stop();
  await settle();
  assert.deepEqual(heard(), []);
});

test('muting sound silences effects', () => {
  setSoundMuted(true);
  const before = ctx.nodes.length;
  sfx.play('boom');
  sfx.turnPing();
  assert.equal(ctx.nodes.length, before);
  setSoundMuted(false);
});

// ---- the page hiding and coming back ----
import { pageHide, pageVisible, setMusicMuted } from '../src/audio.ts';
import { installAudioPage } from '../src/audio-page.ts';

test('hidden suspends the context and plays no effect; visible resumes it', () => {
  setMusicMuted(false);
  music.stop();
  initAudio({ sfx: {}, music: [] });
  noteGesture(false); // the synth begins
  const suspends = ctx.suspends;
  pageHide();
  assert.equal(ctx.state, 'suspended');
  assert.equal(ctx.suspends, suspends + 1);
  const before = ctx.nodes.length;
  sfx.play('boom');
  sfx.clockWarn();
  assert.equal(ctx.nodes.length, before, 'no effect is scheduled while hidden');
  pageVisible();
  assert.equal(ctx.state, 'running');
  sfx.play('click');
  assert.ok(ctx.nodes.length > before);
});

test('hidden stops the synth scheduler, visible restarts it only with music on', async () => {
  music.stop();
  music.start();
  pageHide();
  const n = ctx.nodes.length;
  await new Promise(r => setTimeout(r, 200));
  assert.equal(ctx.nodes.length, n, 'no synth notes while hidden');
  pageVisible();
  await new Promise(r => setTimeout(r, 150));
  assert.ok(ctx.nodes.length > n, 'the synth plays again');
  music.stop();
  pageHide();
  pageVisible();
  const m = ctx.nodes.length;
  await new Promise(r => setTimeout(r, 150));
  assert.equal(ctx.nodes.length, m, 'music that was off stays off');
});

test('a track resumes from where it was, and a muted music stays silent', async () => {
  music.stop();
  setMusicMuted(false);
  Reflect.set(globalThis, 'fetch', (file: string) => Promise.resolve({ ok: true, arrayBuffer: () => Promise.resolve({ file }) }));
  initAudio({ sfx: {}, music: [{ file: 'a.mp3' }] });
  noteGesture(false);
  await new Promise(r => setTimeout(r, 50));
  const voices = () => ctx.nodes.filter(n => n.kind === 'source' && n.buffer?.file === 'a.mp3').length;
  const first = voices();
  assert.ok(first >= 1);
  pageHide();
  assert.equal(ctx.state, 'suspended');
  pageVisible();
  assert.equal(ctx.state, 'running');
  assert.equal(voices(), first, 'the track is not restarted');
  pageHide();
  setMusicMuted(true);
  const nodes = ctx.nodes.length;
  pageVisible();
  assert.equal(ctx.nodes.length, nodes, 'muted music starts nothing on return');
  setMusicMuted(false);
  music.stop();
});

test('the turn ping sounds while hidden, then the context suspends again', async () => {
  music.stop();
  pageHide();
  const before = ctx.nodes.length;
  const resumes = ctx.resumes;
  sfx.turnPing();
  assert.ok(ctx.nodes.length > before, 'the ping is scheduled');
  assert.equal(ctx.resumes, resumes + 1);
  assert.equal(ctx.state, 'running');
  await new Promise(r => setTimeout(r, 900));
  assert.equal(ctx.state, 'suspended');
  pageVisible();
});

test('the page wiring: hidden pauses media and clears the session; pagehide not persisted closes', () => {
  const handlers: Record<string, (e: unknown) => void> = {};
  const paused: string[] = [];
  const doc = {
    visibilityState: 'visible',
    addEventListener: (t: string, h: (e: unknown) => void) => { handlers['d:' + t] = h; },
    querySelectorAll: () => [{ pause: () => paused.push('x') }],
  };
  const win = { addEventListener: (t: string, h: (e: unknown) => void) => { handlers['w:' + t] = h; } };
  const session = { metadata: { title: 'x' } as unknown, playbackState: 'playing' };
  installAudioPage({ doc: doc as never, win: win as never, nav: { mediaSession: session } });
  doc.visibilityState = 'hidden';
  handlers['d:visibilitychange']!({});
  assert.equal(ctx.state, 'suspended');
  assert.equal(paused.length, 1);
  assert.equal(session.metadata, null);
  assert.equal(session.playbackState, 'none');
  doc.visibilityState = 'visible';
  handlers['d:visibilitychange']!({});
  assert.equal(ctx.state, 'running');
  handlers['d:freeze']!({});
  assert.equal(ctx.state, 'suspended');
  handlers['w:pageshow']!({});
  assert.equal(ctx.state, 'running');
  handlers['w:pagehide']!({ persisted: true });
  assert.equal(ctx.closes, 0);
  handlers['w:pageshow']!({});
  handlers['w:pagehide']!({ persisted: false });
  assert.equal(ctx.closes, 1);
  assert.equal(ctx.state, 'closed');
});
