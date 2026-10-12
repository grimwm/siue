// Cylon's sound against the kit's recording fake context: the effects go
// through the sfx bus, the buses follow the settings, the music bed follows
// the session, and a gesture primes the context once.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createAudio } from '../src/audio.ts';
import { volumeToGain } from '../src/rules.ts';
import { fakeAudioContext } from '../../_kit/test/audio.ts';

// The music bed's scheduler is a real interval; unref it so a finished file does not wait on it.
const realSetInterval = globalThis.setInterval;
globalThis.setInterval = (...args) => realSetInterval(...args).unref();
const tick = () => new Promise(resolve => setImmediate(resolve));

const SFX = ['projectile', 'hit', 'heal', 'ko', 'nuke', 'raptor', 'grenadeArm', 'grenade', 'missile', 'trackerMissile', 'introLaunch', 'nukeLaunch'];
const oscs = ctx => ctx.nodes.filter(n => n.kind === 'osc').length;
// The core makes the sfx bus, then the music bus, as the context's first two gains.
const sfxBus = ctx => ctx.nodes.filter(n => n.kind === 'gain')[0];
const musicBus = ctx => ctx.nodes.filter(n => n.kind === 'gain')[1];

function rig({ ctx = fakeAudioContext(), settings = {}, session = true, noWebAudio = false } = {}) {
  const state = {
    settings: { soundEnabled: true, soundVolume: 50, musicEnabled: true, musicVolume: 50, ...settings },
    session,
  };
  const audio = createAudio({
    settings: () => state.settings,
    sessionActive: () => state.session,
    volumeToGain,
    createContext: noWebAudio ? () => null : () => ctx,
  });
  return { audio, ctx, state };
}

test('without Web Audio every entry point is a silent no-op', () => {
  const { audio } = rig({ noWebAudio: true });
  assert.doesNotThrow(() => {
    SFX.forEach(n => audio.sfx(n));
    audio.prime();
    audio.unlock();
    audio.syncMusic();
    audio.settingChanged('soundEnabled');
    audio.settingChanged('musicVolume');
  });
});

test('Node has no AudioContext, so the default context finder stays silent', () => {
  const audio = createAudio({
    settings: () => ({ soundEnabled: true, soundVolume: 50, musicEnabled: true, musicVolume: 50 }),
    sessionActive: () => true,
    volumeToGain,
  });
  assert.doesNotThrow(() => { audio.sfx('hit'); audio.unlock(); audio.syncMusic(); });
});

test('every effect is built behind the sfx bus; only the two buses reach the speakers', () => {
  const { audio, ctx } = rig({ session: false });
  audio.prime();
  const before = ctx.nodes.length;
  SFX.forEach(n => audio.sfx(n));
  assert.ok(ctx.nodes.length > before);
  const toSpeakers = ctx.nodes.filter(n => n.to.includes(ctx.destination));
  assert.deepEqual(toSpeakers, [sfxBus(ctx), musicBus(ctx)]);
  assert.ok(ctx.nodes.filter(n => n.to.includes(sfxBus(ctx))).length > SFX.length);
});

for (const [name, settings] of [['sound off', { soundEnabled: false }], ['volume 0', { soundVolume: 0 }]]) {
  test(`${name} makes no effect and no context`, () => {
    const { audio, ctx } = rig({ settings, session: false });
    SFX.forEach(n => audio.sfx(n));
    audio.prime();
    assert.equal(ctx.nodes.length, 0);
  });
}

test('the sfx bus follows the volume and the mute', () => {
  const { audio, ctx, state } = rig({ session: false });
  audio.prime();
  assert.equal(sfxBus(ctx).gain.value, volumeToGain(50, 'sfx'));
  state.settings.soundVolume = 100;
  audio.settingChanged('soundVolume');
  assert.equal(sfxBus(ctx).gain.value, volumeToGain(100, 'sfx'));
  state.settings.soundEnabled = false;
  audio.settingChanged('soundEnabled');
  assert.equal(sfxBus(ctx).gain.value, 0);
  const nodes = ctx.nodes.length;
  audio.sfx('raptor');
  assert.equal(ctx.nodes.length, nodes, 'muted: no new effect');
  state.settings.soundEnabled = true;
  audio.settingChanged('soundEnabled');
  assert.equal(sfxBus(ctx).gain.value, volumeToGain(100, 'sfx'));
});

test('turning both sound and music off suspends the context', () => {
  const { audio, ctx, state } = rig();
  audio.prime();
  state.settings.soundEnabled = false;
  state.settings.musicEnabled = false;
  audio.settingChanged('soundEnabled');
  assert.equal(ctx.suspends, 1);
});

test('the music bed starts with the session, follows its volume, and stops on mute or when the session ends', async () => {
  const { audio, ctx, state } = rig();
  audio.syncMusic();
  await tick();
  assert.ok(oscs(ctx) > 0);
  assert.equal(musicBus(ctx).gain.value, volumeToGain(50, 'music'));
  state.settings.musicVolume = 90;
  audio.settingChanged('musicVolume');
  assert.equal(musicBus(ctx).gain.value, volumeToGain(90, 'music'));
  state.settings.musicEnabled = false;
  audio.settingChanged('musicEnabled');
  assert.equal(musicBus(ctx).gain.value, 0);
  const stopped = oscs(ctx);
  audio.syncMusic();
  assert.equal(oscs(ctx), stopped);
  state.settings.musicEnabled = true;
  audio.settingChanged('musicEnabled');
  await tick();
  assert.equal(musicBus(ctx).gain.value, volumeToGain(90, 'music'));
  assert.ok(oscs(ctx) > stopped);
  state.session = false;
  audio.syncMusic();
  assert.equal(musicBus(ctx).gain.value, 0);
});

test('no music outside a session or at volume 0', async () => {
  const outside = rig({ session: false });
  outside.audio.syncMusic();
  await tick();
  assert.equal(outside.ctx.nodes.length, 0);
  const quiet = rig({ settings: { musicVolume: 0 } });
  quiet.audio.syncMusic();
  await tick();
  assert.equal(oscs(quiet.ctx), 0);
});

test('the first gesture resumes a suspended context and starts the bed once', async () => {
  const ctx = fakeAudioContext('suspended');
  const { audio } = rig({ ctx });
  audio.unlock();
  await tick();
  assert.equal(ctx.state, 'running');
  const after = oscs(ctx);
  assert.ok(after > 1, 'the priming blip and the bed');
  audio.unlock();
  await tick();
  assert.equal(oscs(ctx), after);
});

test('a gesture with sound and music both off opens nothing', () => {
  const { audio, ctx } = rig({ settings: { soundEnabled: false, musicEnabled: false } });
  audio.unlock();
  assert.equal(ctx.nodes.length, 0);
});

test('the settings are read live, even when the object is replaced', () => {
  const ctx = fakeAudioContext();
  let current = { soundEnabled: true, soundVolume: 50, musicEnabled: false, musicVolume: 50 };
  const audio = createAudio({ settings: () => current, sessionActive: () => true, volumeToGain, createContext: () => ctx });
  audio.prime();
  current = { ...current, soundVolume: 100 };
  audio.settingChanged('soundVolume');
  assert.equal(sfxBus(ctx).gain.value, volumeToGain(100, 'sfx'));
});
