// websites/www.cs/games/_kit/test/audio-focus.test.ts
// A game in a frame goes quiet when the player clicks out of it and comes back when they click in again
// (audio-focus.ts), through the core's setAway against the recording fake context: the fade and suspend, a muted
// bus left muted, a context never made left unmade, and a hidden tab.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BLUR_SETTLE_MS, followFocus, isEmbedded } from '../audio-focus.ts';
import { AWAY_FADE_S, createAudioCore } from '../audio/core.ts';
import { asAudioContext, fakeAudioContext } from './audio.ts';
import type { FakeGain } from './audio.ts';
import { manualClock } from './clock.ts';

const tick = () => new Promise(r => setImmediate(r));

/** A frame's window and document: `focused` is what document.hasFocus() answers. */
function frame(opts: { top?: 'self' | 'other' | 'throws'; focused?: boolean } = {}) {
  const on: Record<string, Array<(e: unknown) => void>> = {};
  const listen = (where: string) => (type: string, fn: (e: unknown) => void) => { (on[where + type] ??= []).push(fn); };
  const win: { top: unknown; addEventListener: ReturnType<typeof listen> } = { top: {}, addEventListener: listen('w:') };
  if (opts.top === 'self') win.top = win;
  if (opts.top === 'throws') Object.defineProperty(win, 'top', { get() { throw new Error('cross-origin'); } });
  const doc = {
    visibilityState: 'visible',
    focused: opts.focused ?? true,
    fullscreenElement: null as unknown,
    hasFocus() { return this.focused; },
    addEventListener: listen('d:'),
  };
  const fire = (key: string) => { for (const fn of on[key] ?? []) fn({}); };
  return { win, doc, fire, on };
}

function rig(opts: { focused?: boolean; make?: boolean } = {}) {
  const clock = manualClock();
  const ctx = fakeAudioContext();
  const core = createAudioCore({ createContext: () => asAudioContext(ctx), timers: clock.timers });
  if (opts.make !== false) core.context();
  const f = frame({ focused: opts.focused });
  const log: string[] = [];
  const follows = followFocus({ win: f.win, doc: f.doc, timers: clock.timers }, {
    away: () => { log.push('away'); core.setAway(true); },
    back: () => { log.push('back'); core.setAway(false); },
  });
  /** The player clicks the host page: the frame's window blurs and its document loses focus. */
  const clickOut = () => { f.doc.focused = false; f.fire('w:blur'); clock.advance(BLUR_SETTLE_MS); clock.advance(AWAY_FADE_S * 1000); };
  /** The player clicks back in: a press, then focus. */
  const clickIn = () => { f.doc.focused = true; f.fire('w:pointerdown'); f.fire('w:focus'); };
  return { ctx, core, f, log, follows, clock, clickOut, clickIn };
}

const busGain = (core: ReturnType<typeof createAudioCore>, name: 'sfx' | 'music') => (core.bus(name) as unknown as FakeGain).gain;

test('a top window, or a frame whose top can be read as itself, is not embedded; an unreadable top is', () => {
  assert.equal(isEmbedded(frame({ top: 'self' }).win), false);
  assert.equal(isEmbedded(frame({ top: 'other' }).win), true);
  assert.equal(isEmbedded(frame({ top: 'throws' }).win), true);
});

test('in a top window it listens to nothing', () => {
  const f = frame({ top: 'self' });
  const follows = followFocus({ win: f.win, doc: f.doc, timers: manualClock().timers }, { away: () => assert.fail(), back: () => assert.fail() });
  assert.equal(follows, false);
  assert.deepEqual(Object.keys(f.on), []);
});

test('clicking out fades both buses and then suspends the context; clicking back in resumes it', async () => {
  const { ctx, core, log, follows, clickOut, clickIn } = rig();
  assert.equal(follows, true);
  assert.equal(ctx.state, 'running');
  clickOut();
  await tick();
  assert.deepEqual(log, ['away']);
  assert.equal(ctx.state, 'suspended');
  for (const name of ['sfx', 'music'] as const) {
    const lin = busGain(core, name).calls.find(c => c[0] === 'lin');
    assert.deepEqual(lin, ['lin', 0, ctx.currentTime + AWAY_FADE_S], `${name} fades out over AWAY_FADE_S`);
  }
  clickIn();
  await tick();
  assert.deepEqual(log, ['away', 'back'], 'pointerdown and focus together bring it back once');
  assert.equal(ctx.state, 'running');
  assert.equal(busGain(core, 'sfx').value, 1);
});

test('the context is suspended only after the fade, and a quick return cancels it', async () => {
  const { ctx, f, clock } = rig();
  f.doc.focused = false;
  f.fire('w:blur');
  clock.advance(BLUR_SETTLE_MS);
  clock.advance(AWAY_FADE_S * 1000 - 1);
  assert.equal(ctx.suspends, 0, 'still fading');
  f.doc.focused = true;
  f.fire('w:focus');
  clock.advance(1000);
  await tick();
  assert.equal(ctx.suspends, 0);
  assert.equal(ctx.state, 'running');
});

test('a muted bus stays muted when the player comes back', () => {
  const { core, clickOut, clickIn } = rig();
  core.setMuted('music', true);
  clickOut();
  clickIn();
  assert.equal(busGain(core, 'music').value, 0, 'music stays muted');
  assert.equal(busGain(core, 'sfx').value, 1, 'sound comes back');
  assert.equal(core.isMuted('music'), true);
});

test('a context never made stays unmade, and a suspended one stays suspended', async () => {
  let made = 0;
  const clock = manualClock();
  const core = createAudioCore({ createContext: () => { made++; return asAudioContext(fakeAudioContext()); }, timers: clock.timers });
  core.setAway(true);
  core.setAway(false);
  assert.equal(made, 0, 'nothing had sounded: nothing is made');

  const { ctx, clickOut, clickIn } = rig();
  // The browser refused the resume (no gesture yet): the context is made but suspended.
  ctx.state = 'suspended';
  ctx.resumes = 0;
  clickOut();
  clickIn();
  await tick();
  assert.equal(ctx.resumes, 0, 'not running before (no gesture yet): not resumed');
});

test('while away nothing resumes the context: not a sound, not a release, not a wake', async () => {
  const { ctx, core, clickOut, clickIn } = rig();
  clickOut();
  await tick();
  core.tone({ freq: 440, dur: 0.1 });
  core.hold();
  core.release();
  core.wake();
  await tick();
  assert.equal(ctx.resumes, 0);
  assert.equal(ctx.state, 'suspended');
  clickIn();
  await tick();
  assert.equal(ctx.state, 'running');
});

test('a hold that is still on when the player comes back keeps the context suspended', async () => {
  const { ctx, core, clickOut, clickIn } = rig();
  clickOut();
  core.hold();
  clickIn();
  await tick();
  assert.equal(ctx.state, 'suspended', 'the tab is still hidden');
  core.release();
  await tick();
  assert.equal(ctx.state, 'running');
});

test('a blur that leaves the frame focused is not leaving: its own input, its own fullscreen', () => {
  const { f, log, clock } = rig();
  f.fire('w:blur');
  clock.advance(BLUR_SETTLE_MS);
  assert.deepEqual(log, [], 'focus moved within the frame');
  f.doc.focused = false;
  f.doc.fullscreenElement = {};
  f.fire('w:blur');
  clock.advance(BLUR_SETTLE_MS);
  assert.deepEqual(log, [], 'the frame is full screen');
});

test('a blur followed at once by focus (a fullscreen change, an alert) is not leaving', () => {
  const { f, log, clock } = rig();
  f.doc.focused = false;
  f.fire('w:blur');
  f.doc.focused = true;
  f.fire('w:focus');
  clock.advance(BLUR_SETTLE_MS * 4);
  assert.deepEqual(log, []);
});

test('a frame that loads without focus starts away; the first press brings it back', () => {
  const { f, log } = rig({ focused: false, make: false });
  assert.deepEqual(log, ['away']);
  f.doc.focused = true;
  f.fire('w:pointerdown');
  assert.deepEqual(log, ['away', 'back']);
});

test('a hidden tab is away; visible again it comes back only if the frame has focus', () => {
  const { f, log } = rig();
  f.doc.visibilityState = 'hidden';
  f.doc.focused = false;
  f.fire('d:visibilitychange');
  assert.deepEqual(log, ['away']);
  f.doc.visibilityState = 'visible';
  f.fire('d:visibilitychange');
  assert.deepEqual(log, ['away'], 'shown, but the frame has no focus');
  f.doc.focused = true;
  f.fire('w:focus');
  assert.deepEqual(log, ['away', 'back']);
});

test('a press in a hidden frame does not bring the sound back', () => {
  const { f, log, clickOut } = rig();
  clickOut();
  f.doc.visibilityState = 'hidden';
  f.fire('w:keydown');
  assert.deepEqual(log, ['away']);
});

test('a sound asked for while away is not made, so none plays late on the return', () => {
  const { ctx, core, clickOut, clickIn } = rig();
  clickOut();
  const before = ctx.nodes.length;
  core.tone({ freq: 440, dur: 0.1 });
  core.noise({ dur: 0.1, vol: 0.1 });
  core.voice({ oscs: [{ type: 'sine', freq: 220 }], envelope: [{ ramp: 'linear', to: 0.1, at: 0.05 }], dur: 0.1 });
  assert.equal(ctx.nodes.length, before);
  clickIn();
  core.tone({ freq: 440, dur: 0.1 });
  assert.ok(ctx.nodes.length > before);
});

test('a gain or mute set while away waits for the return, and does not cut the fade short', () => {
  const { core, clickOut, clickIn, f, clock } = rig();
  f.doc.focused = false;
  f.fire('w:blur');
  clock.advance(BLUR_SETTLE_MS);
  const calls = busGain(core, 'music').calls.length;
  core.setGain('music', 0.3);
  core.setMuted('sfx', true);
  assert.equal(busGain(core, 'music').calls.length, calls, 'the fade is left alone');
  clickOut();
  clickIn();
  assert.equal(busGain(core, 'music').value, 0.3);
  assert.equal(busGain(core, 'sfx').value, 0);
});

test('a context made while away is silent and suspended, and is not resumed on the return', async () => {
  const clock = manualClock();
  const ctx = fakeAudioContext();
  const core = createAudioCore({ createContext: () => asAudioContext(ctx), timers: clock.timers });
  core.setAway(true);
  core.context();
  await tick();
  assert.equal(ctx.state, 'suspended');
  assert.equal(busGain(core, 'sfx').value, 0);
  core.setAway(false);
  await tick();
  assert.equal(ctx.state, 'suspended', 'nothing was playing');
  assert.equal(busGain(core, 'sfx').value, 1);
  core.tone({ freq: 440, dur: 0.1 });
  await tick();
  assert.equal(ctx.state, 'running', 'the next sound resumes it as usual');
});
