// Crete's synth on the kit's audio core: each event's notes, the mute switch,
// and the gesture that wakes the speakers.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MUSIC_GAIN, createAudio } from '../src/audio.ts';
import { createAudioCore } from '../../_kit/audio/core.ts';
import { asAudioContext, fakeAudioContext, gainAt, nodeOf, nodesOf } from '../../_kit/test/audio.ts';
import type { FakeContext, ParamCall } from '../../_kit/test/audio.ts';
import type { SfxName } from '../src/game.ts';

const EVENTS: SfxName[] = [
  'step', 'push', 'splash', 'sizzle', 'door', 'key', 'relic', 'gate', 'button', 'slide',
  'caught', 'stone', 'win', 'lose', 'bump', 'pickup', 'page', 'hint', 'chapter',
  'snap', 'reveal', 'rise', 'warp', 'thief', 'boom', 'clone', 'home',
];
const rig = (state?: string) => {
  const ctx = fakeAudioContext(state);
  return { ctx, audio: createAudio(createAudioCore({ createContext: () => asAudioContext(ctx) })) };
};
const oscs = (ctx: FakeContext) => nodesOf(ctx, 'osc');
/** The first recorded call on a param; the test fails when there is none. */
const firstCall = (calls: ParamCall[]): ParamCall => {
  const call = calls[0];
  assert.ok(call, 'a recorded call');
  return call;
};

test('every event is voiced through the sfx bus', () => {
  const { ctx, audio } = rig();
  for (const name of EVENTS) {
    const before = oscs(ctx).length;
    audio.sfx(name);
    assert.ok(oscs(ctx).length > before, name);
  }
  const sfxBus = nodeOf(ctx, 'gain', 0);
  assert.ok(oscs(ctx).every(o => gainAt(o.to, 0).to[0] === sfxBus));
});

test('the win is four rising square notes a tenth of a second apart', () => {
  const { ctx, audio } = rig();
  audio.sfx('win');
  const notes = oscs(ctx);
  assert.deepEqual(notes.map(o => firstCall(o.frequency.calls)[1]), [523, 659, 784, 1046]);
  assert.deepEqual(notes.map(o => { assert.ok(o.started !== null, 'note started'); return +(o.started - 10).toFixed(6); }), [0, 0.1, 0.2, 0.3]);
  assert.ok(notes.every(o => o.type === 'square'));
});

test('a note with no volume of its own plays at 0.04', () => {
  const { ctx, audio } = rig();
  audio.sfx('step');
  assert.equal(firstCall(gainAt(nodeOf(ctx, 'osc').to, 0).gain.calls)[1], 0.04);
});

test('muting silences every event; unmuting brings them back', () => {
  const { ctx, audio } = rig();
  assert.equal(audio.toggleMute(), true);
  for (const name of EVENTS) audio.sfx(name);
  assert.equal(oscs(ctx).length, 0);
  assert.equal(audio.toggleMute(), false);
  // Unmuting is a gesture, so the core's silent priming blip is already one oscillator.
  const primed = oscs(ctx).length;
  audio.sfx('step');
  assert.equal(oscs(ctx).length, primed + 1);
});

test('ensure wakes a suspended context, but not while muted', async () => {
  const muted = rig('suspended');
  muted.audio.toggleMute();
  muted.audio.ensure();
  assert.equal(muted.ctx.resumes, 0);
  const { ctx, audio } = rig('suspended');
  audio.ensure();
  await new Promise(r => setImmediate(r));
  assert.equal(ctx.state, 'running');
});

test('the new voices differ from each other and from the old ones', () => {
  const notes = (name: SfxName): string => {
    const { ctx, audio } = rig();
    audio.sfx(name);
    return oscs(ctx).map(o => `${o.type}:${JSON.stringify(o.frequency.calls)}`).join('|');
  };
  const seen = new Map<string, SfxName>();
  for (const name of EVENTS) {
    const n = notes(name);
    assert.ok(!seen.has(n), `${name} sounds like ${seen.get(n)}`);
    seen.set(n, name);
  }
});

test('music has its own switch, on the music bus alone; Sound off silences the music too', () => {
  const core = createAudioCore({ createContext: () => asAudioContext(fakeAudioContext()) });
  const audio = createAudio(core);
  assert.equal(audio.musicHeard(), true);
  audio.setMusic(false);
  assert.deepEqual([core.isMuted('music'), core.isMuted('sfx'), audio.musicHeard()], [true, false, false]);
  audio.setMusic(true);
  assert.deepEqual([core.isMuted('music'), audio.musicHeard()], [false, true]);
  audio.toggleMute();
  assert.deepEqual([core.isMuted('music'), core.isMuted('sfx'), audio.musicHeard()], [true, true, false]);
  audio.setMusic(true);
  assert.equal(core.isMuted('music'), true, 'Music on does not get past Sound off');
  audio.toggleMute();
  assert.deepEqual([core.isMuted('music'), audio.musicHeard()], [false, true]);
  audio.setMusic(false);
  audio.toggleMute();
  audio.toggleMute();
  assert.equal(core.isMuted('music'), true, 'Sound on again keeps Music off');
});

test('the music bus sits under the effects', () => {
  const ctx = fakeAudioContext();
  const core = createAudioCore({ createContext: () => asAudioContext(ctx) });
  createAudio(core);
  core.context();
  assert.ok(MUSIC_GAIN > 0 && MUSIC_GAIN < 1);
  assert.equal(nodeOf(ctx, 'gain', 1).gain.value, MUSIC_GAIN);
});
