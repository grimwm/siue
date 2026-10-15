// websites/www.cs/games/_kit/test/audio.test.ts
// The audio core against the recording fake context: lazy creation, the two
// buses, mute and gain, the gesture unlock, and the tone and noise envelopes.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createAudioCore } from '../audio/core.ts';
import { asAudioContext, asAudioNode, fakeAudioContext, gainAt, nodeOf, nodesOf } from './audio.ts';
import type { FakeContext, ParamCall } from './audio.ts';

const rig = (state?: string) => {
  const ctx = fakeAudioContext(state);
  return { ctx, core: createAudioCore({ createContext: () => asAudioContext(ctx) }) };
};
const gains = (ctx: FakeContext) => nodesOf(ctx, 'gain');
const round = (calls: ParamCall[]) => calls.map(([k, v, t]) => [k, +v.toFixed(6), +t.toFixed(6)]);
const tick = () => new Promise(r => setImmediate(r));

test('without Web Audio every call is silent and none throws', () => {
  const core = createAudioCore({ createContext: () => null });
  assert.doesNotThrow(() => {
    core.tone({ freq: 440, dur: 0.1 });
    core.noise({ dur: 0.1, vol: 0.1 });
    core.unlock(() => { throw new Error('never ready'); });
    core.setGain('music', 0.5);
    core.setMuted('sfx', true);
    core.suspend();
  });
  assert.equal(core.context(), null);
  assert.equal(core.bus('sfx'), null);
});

test('a context that throws while being made counts as none', () => {
  const core = createAudioCore({ createContext: () => { throw new Error('too many contexts'); } });
  assert.doesNotThrow(() => core.tone({ freq: 440, dur: 0.1 }));
  assert.equal(core.context(), null);
});

test('nothing is made before the first sound; then one context with the sfx and music buses', () => {
  let made = 0;
  const ctx = fakeAudioContext();
  const core = createAudioCore({ createContext: () => { made++; return asAudioContext(ctx); } });
  assert.equal(made, 0);
  assert.equal(core.peek(), null);
  core.tone({ freq: 440, dur: 0.1 });
  core.tone({ freq: 220, dur: 0.1 });
  assert.equal(made, 1);
  const [sfx, music] = gains(ctx);
  assert.equal(core.bus('sfx'), sfx);
  assert.equal(core.bus('music'), music);
  assert.deepEqual(ctx.nodes.filter(n => n.to.includes(ctx.destination)), [sfx, music]);
});

test('a context that could not be made is asked for again next time', () => {
  let ready = false;
  const ctx = fakeAudioContext();
  const core = createAudioCore({ createContext: () => (ready ? asAudioContext(ctx) : null) });
  core.tone({ freq: 440, dur: 0.1 });
  ready = true;
  core.tone({ freq: 440, dur: 0.1 });
  assert.equal(core.peek(), asAudioContext(ctx));
});

test('a muted bus makes nothing, not even the context', () => {
  let made = 0;
  const core = createAudioCore({ createContext: () => { made++; return asAudioContext(fakeAudioContext()); } });
  core.setMuted('sfx', true);
  core.tone({ freq: 440, dur: 0.1 });
  core.noise({ dur: 0.1, vol: 0.1 });
  assert.equal(made, 0);
  assert.equal(core.isMuted('sfx'), true);
});

test('a muted bus has gain 0, and unmuting restores the gain set for it', () => {
  const { ctx, core } = rig();
  core.setGain('sfx', 0.7);
  core.context();
  const sfx = nodeOf(ctx, 'gain', 0);
  assert.equal(sfx.gain.value, 0.7);
  core.setMuted('sfx', true);
  assert.equal(sfx.gain.value, 0);
  core.setMuted('sfx', false);
  assert.equal(sfx.gain.value, 0.7);
});

test('setGain cancels any ramp and sets the value at once', () => {
  const { ctx, core } = rig();
  core.context();
  core.setGain('music', 0.25);
  const music = nodeOf(ctx, 'gain', 1);
  assert.deepEqual(round(music.gain.calls).slice(-2), [['cancel', 0, 10], ['set', 0.25, 10]]);
});

test('a tone without attack starts at its volume and falls to silence over its duration', () => {
  const { ctx, core } = rig();
  core.tone({ freq: 300, dur: 0.2, vol: 0.06, when: 0.1, slideTo: 100, type: 'sawtooth' });
  const osc = nodeOf(ctx, 'osc');
  const env = gainAt(osc.to);
  assert.equal(osc.type, 'sawtooth');
  assert.deepEqual(round(env.gain.calls), [['set', 0.06, 10.1], ['exp', 0.0001, 10.3]]);
  assert.deepEqual(round(osc.frequency.calls), [['set', 300, 10.1], ['exp', 100, 10.3]]);
  assert.ok(osc.started !== null && osc.stopped !== null);
  assert.equal(+osc.started.toFixed(6), 10.1);
  assert.equal(+osc.stopped.toFixed(6), 10.32);
  assert.equal(env.to[0], core.bus('sfx'));
});

test('a tone with attack rises from silence first; a slide can be shorter than the tone', () => {
  const { ctx, core } = rig();
  core.tone({ freq: 160, dur: 0.15, vol: 0.24, attack: 0.01, slideTo: 38, slideDur: 0.13 }, 'music');
  const osc = nodeOf(ctx, 'osc');
  const env = gainAt(osc.to);
  assert.deepEqual(round(env.gain.calls), [['set', 0.0001, 10], ['exp', 0.24, 10.01], ['exp', 0.0001, 10.15]]);
  assert.deepEqual(round(osc.frequency.calls), [['set', 160, 10], ['exp', 38, 10.13]]);
  assert.equal(env.to[0], core.bus('music'));
});

test('a tone defaults to a square wave at 0.05', () => {
  const { ctx, core } = rig();
  core.tone({ freq: 440, dur: 0.1 });
  const osc = nodeOf(ctx, 'osc');
  assert.equal(osc.type, 'square');
  assert.equal(gainAt(osc.to).gain.calls[0]?.[1], 0.05);
});

test('a tone can go to any node, past both buses', () => {
  const { ctx, core } = rig();
  const target = ctx.createGain();
  core.tone({ freq: 440, dur: 0.1 }, asAudioNode(target));
  const env = gainAt(nodeOf(ctx, 'osc').to);
  assert.equal(env.to[0], target);
});

test('looping noise shares one second of white noise; a fading burst gets its own buffer', () => {
  const { ctx, core } = rig();
  core.noise({ dur: 0.3, vol: 0.1, filterFreq: 900, slideTo: 4200 });
  core.noise({ dur: 0.3, vol: 0.1 });
  assert.equal(ctx.buffers, 1);
  const loops = nodesOf(ctx, 'source');
  assert.ok(loops.every(s => s.loop === true && s.buffer === loops[0]?.buffer));
  const filter = nodeOf(ctx, 'filter');
  assert.equal(filter.type, 'lowpass');
  assert.deepEqual(round(filter.frequency.calls), [['set', 900, 10], ['exp', 4200, 10.3]]);
  core.noise({ dur: 0.2, vol: 0.1, source: 'fade', filterType: 'bandpass' });
  core.noise({ dur: 0.2, vol: 0.1, source: 'fade' });
  assert.equal(ctx.buffers, 3);
  const burst = nodeOf(ctx, 'source', -1);
  assert.equal(burst.loop, false);
  assert.ok(burst.buffer);
  const data = burst.buffer.getChannelData(0);
  const last = data[data.length - 1];
  assert.ok(last !== undefined);
  assert.ok(Math.abs(last) < 0.01, 'the burst fades to silence');
});

test('unlock resumes a suspended context, primes it once and reports ready once', async () => {
  const { ctx, core } = rig('suspended');
  let ready = 0;
  core.unlock(() => { ready++; });
  await tick();
  assert.equal(ctx.state, 'running');
  assert.ok(ctx.resumes >= 1);
  assert.equal(ready, 1);
  const oscs = nodesOf(ctx, 'osc').length;
  core.unlock(() => { ready++; });
  await tick();
  assert.equal(ready, 1);
  assert.equal(nodesOf(ctx, 'osc').length, oscs);
});

test('suspend suspends a context that exists and makes none that does not', () => {
  const { ctx, core } = rig();
  core.suspend();
  assert.equal(ctx.suspends, 0);
  core.context();
  core.suspend();
  assert.equal(ctx.suspends, 1);
});

test('a context whose buses cannot be built is silent and throws nothing', () => {
  const ctx = fakeAudioContext();
  ctx.createGain = () => { throw new Error('no gain nodes'); };
  const core = createAudioCore({ createContext: () => asAudioContext(ctx) });
  assert.doesNotThrow(() => {
    core.tone({ freq: 440, dur: 0.1 });
    core.noise({ dur: 0.1, vol: 0.1 });
    core.unlock(() => {});
  });
  assert.equal(core.peek(), null);
  assert.equal(core.bus('sfx'), null);
});

test('a context whose bus setup throws is closed, not leaked', () => {
  const ctx = fakeAudioContext();
  ctx.createGain = () => { throw new Error('no gain nodes'); };
  const core = createAudioCore({ createContext: () => asAudioContext(ctx) });
  core.tone({ freq: 440, dur: 0.1 });
  assert.equal(ctx.closes, 1);
});

test('unlock primes and reports ready only once resume resolves, for every caller waiting', async () => {
  const ctx = fakeAudioContext('suspended', { holdResume: true });
  const core = createAudioCore({ createContext: () => asAudioContext(ctx) });
  const ready: string[] = [];
  core.unlock(() => ready.push('first'));
  core.unlock(() => ready.push('second'));
  await tick();
  assert.deepEqual(ready, []);
  assert.equal(nodesOf(ctx, 'osc').length, 0);
  ctx.settleResume();
  await tick();
  assert.deepEqual(ready, ['first', 'second']);
  assert.equal(nodesOf(ctx, 'osc').length, 1);
});

test('a context whose resume() returns nothing or throws still plays and throws nothing', () => {
  for (const resume of [() => undefined, () => { throw new Error('no resume'); }]) {
    const ctx = fakeAudioContext('suspended');
    ctx.resume = resume;
    const core = createAudioCore({ createContext: () => asAudioContext(ctx) });
    assert.doesNotThrow(() => {
      core.tone({ freq: 440, dur: 0.1 });
      core.unlock(() => {});
    });
    assert.equal(core.peek(), asAudioContext(ctx));
  }
});

test('suspend() on a context that returns nothing or throws throws nothing', () => {
  for (const suspend of [() => undefined, () => { throw new Error('no suspend'); }]) {
    const ctx = fakeAudioContext();
    ctx.suspend = suspend;
    const core = createAudioCore({ createContext: () => asAudioContext(ctx) });
    core.tone({ freq: 440, dur: 0.1 });
    assert.doesNotThrow(() => core.suspend());
  }
});
