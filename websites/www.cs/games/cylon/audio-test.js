// The sound module against a fake AudioContext. Run here: `node audio-test.js`.
// js/audio.js (compiled from src/audio.ts) gets its settings, its session state,
// its volume curve and its context as arguments, so Node needs no WebAudio: the
// fake below records the nodes the module builds and the gains it sets.
import { createAudio } from './js/audio.js';
import { volumeToGain } from './js/rules.js';

let failed = 0;
const check = (name, ok, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${ok ? '' : ` :: ${detail}`}`);
  if (!ok) failed++;
};
const tick = () => new Promise((resolve) => setImmediate(resolve));

function fakeParam(initial = 1) {
  return {
    value: initial,
    setValueAtTime(v) { this.value = v; },
    exponentialRampToValueAtTime() {},
    linearRampToValueAtTime() {},
    cancelScheduledValues() {},
  };
}

function fakeContext(state = 'running') {
  const ctx = {
    state,
    currentTime: 10,
    sampleRate: 8000,
    destination: { name: 'destination' },
    nodes: [],
    oscillators: 0,
    resumes: 0,
    suspends: 0,
    resume() { ctx.resumes++; ctx.state = 'running'; return Promise.resolve(); },
    suspend() { ctx.suspends++; ctx.state = 'suspended'; return Promise.resolve(); },
    createGain() {
      const node = { kind: 'gain', gain: fakeParam(), to: [], connect(t) { node.to.push(t); }, disconnect() {} };
      ctx.nodes.push(node);
      return node;
    },
    createOscillator() {
      ctx.oscillators++;
      const node = { kind: 'osc', type: 'sine', frequency: fakeParam(440), to: [], connect(t) { node.to.push(t); }, disconnect() {}, start() {}, stop() {} };
      ctx.nodes.push(node);
      return node;
    },
    createBiquadFilter() {
      const node = { kind: 'filter', type: 'lowpass', frequency: fakeParam(), Q: fakeParam(), to: [], connect(t) { node.to.push(t); }, disconnect() {} };
      ctx.nodes.push(node);
      return node;
    },
    createBuffer(_ch, len) { return { getChannelData: () => new Float32Array(len) }; },
    createBufferSource() {
      const node = { kind: 'source', to: [], connect(t) { node.to.push(t); }, disconnect() {}, start() {}, stop() {} };
      ctx.nodes.push(node);
      return node;
    },
  };
  // The first two gains the module makes are the sfx bus and the music bus.
  ctx.sfxBus = () => ctx.nodes.filter((n) => n.kind === 'gain')[0];
  ctx.musicBus = () => ctx.nodes.filter((n) => n.kind === 'gain')[1];
  return ctx;
}

function rig({ ctx = fakeContext(), settings = {}, session = true, noWebAudio = false } = {}) {
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

const SFX = ['projectile', 'hit', 'heal', 'ko', 'nuke', 'raptor', 'grenadeArm', 'grenade', 'missile', 'trackerMissile', 'introLaunch', 'nukeLaunch'];

// 1. Silent without an AudioContext: every entry point is a no-op, none throws.
{
  const { audio } = rig({ noWebAudio: true });
  let threw = null;
  try {
    SFX.forEach((n) => audio.sfx(n));
    audio.prime();
    audio.unlock();
    audio.syncMusic();
    audio.settingChanged('soundEnabled');
    audio.settingChanged('musicVolume');
  } catch (err) { threw = err; }
  check('silent-without-webaudio-never-throws', threw === null, String(threw));
}
{
  // The default context finder: Node has no AudioContext, so the module stays silent.
  const audio = createAudio({
    settings: () => ({ soundEnabled: true, soundVolume: 50, musicEnabled: true, musicVolume: 50 }),
    sessionActive: () => true,
    volumeToGain,
  });
  let threw = null;
  try { audio.sfx('hit'); audio.unlock(); audio.syncMusic(); } catch (err) { threw = err; }
  check('default-context-absent-in-node-is-silent', threw === null, String(threw));
}

// 2. Each effect builds sound through the sfx bus, never straight to the speakers.
{
  const { audio, ctx } = rig();
  audio.prime();
  const bus = ctx.sfxBus();
  const before = ctx.nodes.length;
  SFX.forEach((n) => audio.sfx(n));
  check('every-sfx-makes-sound', ctx.nodes.length > before);
  const toDestination = ctx.nodes.filter((n) => n.to.includes(ctx.destination));
  check('only-the-buses-reach-the-destination', toDestination.length === 2 && toDestination.includes(bus) && toDestination.includes(ctx.musicBus()),
    toDestination.map((n) => n.kind).join());
  const fed = ctx.nodes.filter((n) => n.to.includes(bus)).length;
  check('effects-feed-the-sfx-bus', fed > SFX.length, String(fed));
}

// 3. Mute and zero volume stop sound: no context, no nodes.
for (const [name, settings] of [['sound-off', { soundEnabled: false }], ['volume-zero', { soundVolume: 0 }]]) {
  const { audio, ctx } = rig({ settings });
  SFX.forEach((n) => audio.sfx(n));
  audio.prime();
  check(`${name}-plays-no-sfx`, ctx.nodes.length === 0 && ctx.oscillators === 0, `${ctx.nodes.length} nodes`);
}

// 4. The sfx bus gain follows the volume setting and the mute.
{
  const { audio, ctx, state } = rig();
  audio.prime();
  const bus = ctx.sfxBus();
  check('sfx-bus-follows-volume-50', bus.gain.value === volumeToGain(50, 'sfx'), String(bus.gain.value));
  state.settings.soundVolume = 100;
  audio.settingChanged('soundVolume');
  check('sfx-bus-follows-volume-100', bus.gain.value === volumeToGain(100, 'sfx') && bus.gain.value > volumeToGain(50, 'sfx'), String(bus.gain.value));
  state.settings.soundVolume = 0;
  audio.settingChanged('soundVolume');
  check('sfx-bus-volume-0-is-silent', bus.gain.value === volumeToGain(0, 'sfx'), String(bus.gain.value));
  state.settings.soundVolume = 70;
  audio.settingChanged('soundVolume');
  state.settings.soundEnabled = false;
  audio.settingChanged('soundEnabled');
  check('mute-zeroes-the-sfx-bus', bus.gain.value === 0, String(bus.gain.value));
  const nodes = ctx.nodes.length;
  audio.sfx('raptor');
  check('mute-stops-new-effects', ctx.nodes.length === nodes);
  state.settings.soundEnabled = true;
  audio.settingChanged('soundEnabled');
  check('unmute-restores-the-sfx-bus', bus.gain.value === volumeToGain(70, 'sfx'), String(bus.gain.value));
}

// 5. Muting both sound and music suspends the context.
{
  const { audio, ctx, state } = rig();
  audio.prime();
  state.settings.soundEnabled = false;
  state.settings.musicEnabled = false;
  audio.settingChanged('soundEnabled');
  check('both-off-suspends-the-context', ctx.suspends === 1, String(ctx.suspends));
}

// 6. The music bed: starts with the session, follows the volume, stops on mute and when the session ends.
{
  const { audio, ctx, state } = rig();
  audio.syncMusic();
  await tick();
  const bed = ctx.musicBus();
  check('music-starts-with-the-session', ctx.oscillators > 0 && bed.gain.value === volumeToGain(50, 'music'), `${ctx.oscillators} osc, gain ${bed.gain.value}`);
  state.settings.musicVolume = 90;
  audio.settingChanged('musicVolume');
  check('music-bus-follows-volume', bed.gain.value === volumeToGain(90, 'music'), String(bed.gain.value));
  state.settings.musicEnabled = false;
  audio.settingChanged('musicEnabled');
  check('music-mute-zeroes-the-bus', bed.gain.value === 0, String(bed.gain.value));
  const oscs = ctx.oscillators;
  audio.syncMusic();
  check('music-mute-stays-stopped', ctx.oscillators === oscs);
  state.settings.musicEnabled = true;
  audio.settingChanged('musicEnabled');
  await tick();
  check('music-unmute-restarts-the-bed', bed.gain.value === volumeToGain(90, 'music') && ctx.oscillators > oscs, String(bed.gain.value));
  state.session = false;
  audio.syncMusic();
  check('music-stops-when-the-session-ends', bed.gain.value === 0, String(bed.gain.value));
}
{
  const { audio, ctx } = rig({ session: false });
  audio.syncMusic();
  await tick();
  check('no-music-outside-a-session', ctx.oscillators === 0 && ctx.nodes.length === 0);
}
{
  const { audio, ctx } = rig({ settings: { musicVolume: 0 } });
  audio.syncMusic();
  await tick();
  check('no-music-at-volume-zero', ctx.oscillators === 0);
}

// 7. A suspended context is resumed by the first gesture, which starts the bed once.
{
  const ctx = fakeContext('suspended');
  const { audio } = rig({ ctx });
  audio.unlock();
  await tick();
  check('gesture-resumes-the-context', ctx.resumes >= 1 && ctx.state === 'running');
  const oscs = ctx.oscillators;
  check('gesture-primes-and-starts-the-bed', oscs > 1, String(oscs));
  audio.unlock();
  await tick();
  check('second-gesture-does-not-prime-again', ctx.oscillators === oscs, `${ctx.oscillators} vs ${oscs}`);
}
{
  const { audio, ctx } = rig({ settings: { soundEnabled: false, musicEnabled: false } });
  audio.unlock();
  check('gesture-with-everything-off-opens-nothing', ctx.nodes.length === 0);
}

// 8. The settings may be replaced between calls.
{
  const ctx = fakeContext();
  let current = { soundEnabled: true, soundVolume: 50, musicEnabled: false, musicVolume: 50 };
  const audio = createAudio({ settings: () => current, sessionActive: () => true, volumeToGain, createContext: () => ctx });
  audio.prime();
  current = { ...current, soundVolume: 100 };
  audio.settingChanged('soundVolume');
  check('replaced-settings-object-is-read-live', ctx.sfxBus().gain.value === volumeToGain(100, 'sfx'));
}

process.exit(failed ? 1 : 0);
