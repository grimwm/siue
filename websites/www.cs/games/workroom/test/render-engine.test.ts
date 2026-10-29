// The render engine: a renderable score through the sample library and the lo-fi master's Web Audio graph. Node
// has no Web Audio, so a recording fake OfflineAudioContext stands in and the tests read the graph it was given.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadInstruments, renderScore, RATE, TAIL } from '../src/render/engine.ts';
import type { RenderDeps } from '../src/render/engine.ts';
import { voices } from '../src/render/plan.ts';
import type { Library } from '../src/render/plan.ts';
import { parseScore } from '../src/score.ts';
import type { Score } from '../src/score.ts';

const LIBRARY: Library = JSON.parse(readFileSync(join(import.meta.dirname, '..', '..', '..', 'music', 'library', 'library.json'), 'utf8'));

/** The fixture's cello and horn lanes, plus a harp lane (no loop) with two notes. */
const score = (): Score => {
  const r = parseScore(JSON.parse(readFileSync(join(import.meta.dirname, 'fixtures', 'score-renderable-v1.json'), 'utf8')));
  assert.ok(r.ok);
  const s = r.score;
  return {
    ...s,
    lanes: [...s.lanes, { id: 'harp', name: 'Harp', family: 'harp', icon: 'harp', color: '#aabbcc', sound: { instrument: 'harp', gain_db: -2, attack: 0.01, release: 1.5 } }],
    notes: [...s.notes, { lane: 'harp', start: 1, length: 0.5, pitch: 60, velocity: 100, motif: null }, { lane: 'harp', start: 3, length: 0.25, pitch: 72, velocity: 80, motif: null }],
  };
};

class Param {
  events: [string, number, number][] = [];
  inputs: Node[] = [];
  value: number;
  constructor(value: number) { this.value = value; }
  setValueAtTime(v: number, t: number): this { this.events.push(['set', v, t]); return this; }
  linearRampToValueAtTime(v: number, t: number): this { this.events.push(['ramp', v, t]); return this; }
}

class Node {
  out: (Node | Param)[] = [];
  started: number | null = null;
  stopped: number | null = null;
  [k: string]: unknown;
  kind: string;
  constructor(kind: string, props: Record<string, unknown> = {}) { this.kind = kind; Object.assign(this, props); }
  connect<T extends Node | Param>(dest: T): T { this.out.push(dest); if (dest instanceof Param) dest.inputs.push(this); return dest; }
  start(at = 0): void { this.started = at; }
  stop(at = 0): void { this.stopped = at; }
}

interface Buf { numberOfChannels: number; length: number; sampleRate: number; duration: number; data: Float32Array[]; getChannelData(c: number): Float32Array; copyToChannel(src: Float32Array, c: number): void }
const buffer = (channels: number, length: number, rate: number): Buf => {
  const data = Array.from({ length: channels }, () => new Float32Array(length));
  return { numberOfChannels: channels, length, sampleRate: rate, duration: length / rate, data, getChannelData: c => data[c]!, copyToChannel: (src, c) => data[c]!.set(src) };
};

class FakeContext {
  nodes: Node[] = [];
  destination = new Node('destination');
  channels: number;
  length: number;
  sampleRate: number;
  constructor(channels: number, length: number, sampleRate: number) { this.channels = channels; this.length = length; this.sampleRate = sampleRate; }
  private add(n: Node): Node { this.nodes.push(n); return n; }
  createBufferSource(): Node { return this.add(new Node('source', { buffer: null, loop: false, loopStart: 0, loopEnd: 0, playbackRate: new Param(1) })); }
  createGain(): Node { return this.add(new Node('gain', { gain: new Param(1) })); }
  createWaveShaper(): Node { return this.add(new Node('shaper', { curve: null, oversample: 'none' })); }
  createDelay(max: number): Node { return this.add(new Node('delay', { max, delayTime: new Param(0) })); }
  createOscillator(): Node { return this.add(new Node('oscillator', { type: 'sine', frequency: new Param(440) })); }
  createBiquadFilter(): Node { return this.add(new Node('biquad', { type: 'lowpass', frequency: new Param(350), Q: new Param(1) })); }
  createConvolver(): Node { return this.add(new Node('convolver', { buffer: null, normalize: true })); }
  createBuffer(channels: number, length: number, rate: number): Buf { return buffer(channels, length, rate); }
  async startRendering(): Promise<Buf> { return buffer(this.channels, this.length, this.sampleRate); }
}

/** Deps with a recording context; `fetched` lists the files asked for; `fail` makes that file's fetch reject. */
const deps = (fail?: string): { deps: RenderDeps; contexts: FakeContext[]; fetched: string[] } => {
  const contexts: FakeContext[] = [];
  const fetched: string[] = [];
  return {
    contexts, fetched,
    deps: {
      context: (channels, length, rate) => { const c = new FakeContext(channels, length, rate); contexts.push(c); return c as unknown as OfflineAudioContext; },
      fetchBytes: async file => { fetched.push(file); if (file === fail) throw new Error('404'); return new ArrayBuffer(8); },
      decode: async () => buffer(2, RATE * 10, RATE) as unknown as AudioBuffer,
      cache: new Map(),
    },
  };
};

const param = (n: Node, k: string): Param => n[k] as Param;
const describe = (n: Node): string => n.kind === 'biquad' ? `${n['type']} ${param(n, 'frequency').value}` : n.kind;

test('one source per voice, started at its time with its rate, looping over the library loop when the instrument has one', async () => {
  const s = score();
  const { deps: d, contexts } = deps();
  await renderScore(s, LIBRARY, d);
  const ctx = contexts[0]!;
  const sources = ctx.nodes.filter(n => n.kind === 'source');
  const want = voices(s, LIBRARY);
  assert.equal(sources.length, want.length);
  sources.forEach((src, i) => {
    const v = want[i]!;
    assert.equal(src.started, v.at);
    assert.equal(param(src, 'playbackRate').value, v.rate);
    assert.equal(src.stopped, v.at + v.dur + v.release, 'stops once the release ends');
    assert.ok(src['buffer'], 'plays its decoded sample');
    if (v.loop) assert.deepEqual([src['loop'], src['loopStart'], src['loopEnd']], [true, ...v.loop]);
    else assert.equal(src['loop'], false);
  });
  assert.ok(sources.some(n => n['loop'] === true) && sources.some(n => n['loop'] === false), 'the fixture has looped and plucked voices');
});

test('each voice has an envelope: a linear attack to its level, a hold, and a linear release after its length', async () => {
  const s = score();
  const { deps: d, contexts } = deps();
  await renderScore(s, LIBRARY, d);
  const ctx = contexts[0]!;
  const want = voices(s, LIBRARY);
  ctx.nodes.filter(n => n.kind === 'source').forEach((src, i) => {
    const v = want[i]!;
    const env = src.out[0] as Node;
    const lane = env.out[0] as Node;
    const laneGain = param(lane, 'gain').value;
    const level = v.gain / laneGain;
    const peak = level * Math.min(1, v.dur / v.attack);
    const ev = param(env, 'gain').events;
    assert.deepEqual(ev.map(e => e[0]), ['set', 'ramp', 'set', 'ramp']);
    assert.deepEqual(ev[0], ['set', 0, v.at]);
    assert.equal(ev[1]![2], v.at + Math.min(v.attack, v.dur));
    assert.ok(Math.abs(ev[1]![1] - peak) < 1e-12);
    assert.equal(ev[2]![2], v.at + v.dur);
    assert.ok(Math.abs(ev[2]![1] - peak) < 1e-12);
    assert.deepEqual(ev[3], ['ramp', 0, v.at + v.dur + v.release]);
    const sound = s.lanes.find(l => l.id === v.lane)!.sound!;
    assert.ok(Math.abs(laneGain - 10 ** (sound.gain_db / 20)) < 1e-12, 'the lane gain is the lane level');
  });
});

test('the graph reaches the destination through the master chain in order, the reverb beside the dry signal', async () => {
  const { deps: d, contexts } = deps();
  await renderScore(score(), LIBRARY, d);
  const ctx = contexts[0]!;
  const lanes = new Set(ctx.nodes.filter(n => n.kind === 'source').map(src => ((src.out[0] as Node).out[0] as Node)));
  assert.equal(lanes.size, 3, 'one lane gain per lane');
  const chains = [...lanes].map(lane => {
    assert.equal(lane.out.length, 1);
    const path: Node[] = [];
    let n = lane.out[0] as Node;
    while (n.out.length === 1 && n !== ctx.destination) { path.push(n); n = n.out[0] as Node; }
    path.push(n);
    return path;
  });
  const chain = chains[0]!;
  for (const c of chains) assert.deepEqual(c, chain, 'every lane feeds the same chain');
  assert.deepEqual(chain.map(describe), ['gain', 'shaper', 'delay', 'highpass 30', 'lowpass 6500', 'lowpass 9000']);
  const [drive, shaper, delay, highpass, lowpass] = chain as [Node, Node, Node, Node, Node, Node];
  // tanh soft clip: the gain ahead of the shaper scales the input into the curve's [-1, 1].
  const curve = shaper['curve'] as Float32Array;
  const k = 1 / param(drive, 'gain').value;
  for (const x of [-1.5, -0.3, 0, 0.5, 2]) {
    const i = Math.round(((x / k + 1) / 2) * (curve.length - 1));
    assert.ok(Math.abs(curve[i]! - Math.tanh(x)) < 1e-3, `tanh(${x})`);
  }
  // Wow and flutter: two sine oscillators at 0.45 and 5.5 Hz swing the delay.
  const lfos = param(delay, 'delayTime').inputs.map(g => ctx.nodes.find(o => o.kind === 'oscillator' && o.out.includes(g))!);
  assert.deepEqual(lfos.map(o => param(o, 'frequency').value).sort((a, b) => a - b), [0.45, 5.5]);
  for (const o of lfos) assert.equal(o.started, 0);
  assert.ok(param(delay, 'delayTime').value > 0);
  for (const f of [highpass, lowpass]) assert.ok(Math.abs(param(f, 'Q').value - 20 * Math.log10(Math.SQRT1_2)) < 1e-9, 'two-pole Butterworth');
  // The last low-pass splits: dry straight to the destination, wet through the hall at 0.55.
  const last = chain[5]!;
  assert.equal(last.out.length, 2);
  assert.ok(last.out.includes(ctx.destination));
  const conv = last.out.find(n => n !== ctx.destination) as Node;
  assert.equal(conv.kind, 'convolver');
  assert.equal(conv['normalize'], false);
  assert.equal((conv['buffer'] as Buf).length, 4.5 * RATE);
  const wet = conv.out[0] as Node;
  assert.equal(wet.kind, 'gain');
  assert.equal(param(wet, 'gain').value, 0.55);
  assert.deepEqual(wet.out, [ctx.destination]);
});

test('renders the duration plus the 6 s tail in stereo, then folds it to the duration', async () => {
  const s = score();
  const { deps: d, contexts } = deps();
  const out = await renderScore(s, LIBRARY, d);
  assert.equal(TAIL, 6);
  assert.equal(contexts.length, 1);
  assert.deepEqual([contexts[0]!.channels, contexts[0]!.length, contexts[0]!.sampleRate], [2, Math.round(s.duration * RATE) + TAIL * RATE, RATE]);
  assert.equal(out.rate, RATE);
  assert.equal(out.channels.length, 2);
  for (const c of out.channels) assert.equal(c.length, Math.round(s.duration * RATE));
  assert.ok(out.channels[0]!.some(v => v !== 0), 'the hiss is on');
});

test('each needed file is fetched once and decoded once, across renders', async () => {
  const s = score();
  const { deps: d, fetched } = deps();
  await renderScore(s, LIBRARY, d);
  await renderScore(s, LIBRARY, d);
  const needed = new Set(voices(s, LIBRARY).map(v => v.file));
  assert.deepEqual([...fetched].sort(), [...needed].sort());
});

test('loadInstruments loads every file of the asked instruments', async () => {
  const { deps: d } = deps();
  const got = await loadInstruments(LIBRARY, ['harp', 'horn'], d.fetchBytes, d.decode, new Map());
  assert.deepEqual([...got.keys()].sort(), [...LIBRARY.instruments['harp']!.files, ...LIBRARY.instruments['horn']!.files].map(f => f.file).sort());
});

test('a failed fetch rejects with a message naming the instrument, and is not cached', async () => {
  const s = score();
  const file = voices(s, LIBRARY).find(v => v.lane === 'harp')!.file;
  const { deps: d, fetched } = deps(file);
  await assert.rejects(renderScore(s, LIBRARY, d), (e: Error) => /harp/.test(e.message) && e.message.includes(file));
  const again = deps();
  await renderScore(s, LIBRARY, { ...again.deps, cache: d.cache! });
  assert.ok(again.fetched.includes(file), 'the failed file is fetched again');
  assert.ok(fetched.includes(file));
});

test('an instrument the library lacks is refused by name', async () => {
  const s = score();
  const bad = { ...s, lanes: s.lanes.map(l => l.id === 'harp' ? { ...l, sound: { ...l.sound!, instrument: 'kazoo' } } : l) };
  const { deps: d } = deps();
  await assert.rejects(renderScore(bad, LIBRARY, d), /kazoo/);
});
