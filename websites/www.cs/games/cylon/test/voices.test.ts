// Cylon's four music-bed voices against a recording fake context. Each voice is
// scheduled on a master gain, and the test reads back the graph that feeds it:
// every node's type, params, calls and start/stop times, the noise buffer's
// content, and what is connected to what. The graph is written as a tree from
// the master, so it does not depend on the order the nodes were made or
// connected in. fixtures/voices.json is the recording of the hand-built voices;
// the voices must keep producing it.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { playDarkHorn, playTensionStrand, pulseRitualHit, pulseTaiko } from '../src/voices.ts';

type Call = [string, ...number[]];
interface Rec { id: number; kind: string; type?: string; loop?: boolean; buffer?: unknown; params: Record<string, Call[]>; started: number | null; stopped: number | null; to: Rec[] }

const NOW = 10;
const RATE = 8000;

function recorder() {
  const nodes: Rec[] = [];
  function param(): { value: number; calls: Call[]; [m: string]: unknown } {
    const calls: Call[] = [];
    let value = 0;
    return {
      calls,
      get value() { return value; },
      set value(v: number) { value = v; calls.push(['value', v]); },
      setValueAtTime(v: number, t: number) { value = v; calls.push(['set', v, t]); },
      linearRampToValueAtTime(v: number, t: number) { calls.push(['lin', v, t]); },
      exponentialRampToValueAtTime(v: number, t: number) { calls.push(['exp', v, t]); },
      setTargetAtTime(v: number, t: number, c: number) { calls.push(['target', v, t, c]); },
      cancelScheduledValues(t: number) { calls.push(['cancel', t]); },
    };
  }
  function make(kind: string, params: string[], extra: object = {}) {
    const rec: Rec = { id: nodes.length, kind, params: {}, started: null, stopped: null, to: [] };
    const node: Record<string, unknown> = {
      rec,
      ...extra,
      connect(t: { rec?: Rec; kind?: string }) { rec.to.push(t.rec ?? ({ kind: 'sink' } as Rec)); },
      disconnect() {},
      start(t?: number) { rec.started = t ?? NOW; },
      stop(t?: number) { rec.stopped = t ?? NOW; },
    };
    for (const p of params) {
      const pr = param();
      rec.params[p] = pr.calls;
      node[p] = pr;
    }
    nodes.push(rec);
    return node;
  }
  const buffers: Float32Array[] = [];
  const ctx = {
    state: 'running',
    currentTime: NOW,
    sampleRate: RATE,
    destination: { kind: 'destination' },
    resume: () => Promise.resolve(),
    suspend: () => Promise.resolve(),
    close: () => Promise.resolve(),
    createGain: () => make('gain', ['gain']),
    createOscillator() {
      const o = make('osc', ['frequency']);
      Object.defineProperty(o, 'type', { get: () => o.rec && (o.rec as Rec).type, set: (v: string) => { (o.rec as Rec).type = v; } });
      return o;
    },
    createBiquadFilter() {
      const f = make('filter', ['frequency', 'Q']);
      Object.defineProperty(f, 'type', { get: () => (f.rec as Rec).type, set: (v: string) => { (f.rec as Rec).type = v; } });
      return f;
    },
    createBufferSource() {
      const s = make('source', []);
      const r = s.rec as Rec;
      Object.defineProperty(s, 'buffer', { set: (b: { data: Float32Array }) => { r.buffer = { length: b.data.length, sha: createHash('sha1').update(Buffer.from(b.data.buffer)).digest('hex') }; } });
      Object.defineProperty(s, 'loop', { set: (v: boolean) => { r.loop = v; } });
      return s;
    },
    createBuffer(_c: number, length: number, rate: number) {
      const data = new Float32Array(length);
      buffers.push(data);
      return { data, length, sampleRate: rate, duration: length / rate, getChannelData: () => data };
    },
  };
  return { ctx: ctx as unknown as AudioContext, nodes };
}

/** What feeds the master, as a tree, in an order that does not depend on creation order. */
function describe(nodes: Rec[], master: Rec): unknown {
  const inputs = (target: Rec) => nodes.filter(n => n.to.includes(target));
  // A node that never starts (a filter, a gain) sounds from when its source starts.
  const startOf = (n: Rec): number | null => n.started ?? inputs(n).map(startOf).find(t => t !== null) ?? null;
  const order = (a: unknown, b: unknown) => JSON.stringify(a).localeCompare(JSON.stringify(b));
  const one = (n: Rec): unknown => {
    const params: Record<string, Call[]> = {};
    for (const [k, calls] of Object.entries(n.params)) if (calls.length) params[k] = calls.map(c => normalise(c, k, n, startOf(n)));
    return {
      kind: n.kind, type: n.type, loop: n.loop, buffer: n.buffer, params, started: n.started, stopped: n.stopped,
      from: inputs(n).map(one).sort(order),
    };
  };
  return inputs(master).map(one).sort(order);
}

// A `.value =` on a filter's frequency, made before its source starts, is the
// same as setValueAtTime at the start: the source makes no sound before then.
function normalise(c: Call, param: string, n: Rec, start: number | null): Call {
  if (c[0] === 'value' && param === 'frequency' && n.kind === 'filter') return ['set', c[1], start as number];
  return c;
}

function rounded(tree: unknown): unknown {
  return JSON.parse(JSON.stringify(tree, (_k, v) => (typeof v === 'number' ? +v.toFixed(9) : v)));
}

type Voice = (ctx: AudioContext, master: AudioNode, when: number) => void;
const CASES: Array<[string, Voice]> = [
  ['pulseTaiko default', (c, m, w) => pulseTaiko(c, m, w)],
  ['pulseTaiko 0.11', (c, m, w) => pulseTaiko(c, m, w, 0.11)],
  ['pulseTaiko 0.06', (c, m, w) => pulseTaiko(c, m, w, 0.06)],
  ['pulseRitualHit default', (c, m, w) => pulseRitualHit(c, m, w)],
  ['pulseRitualHit 0.04', (c, m, w) => pulseRitualHit(c, m, w, 0.04)],
  ['playDarkHorn default', (c, m, w) => playDarkHorn(c, m, w, 73.42)],
  ['playDarkHorn 65.41 long', (c, m, w) => playDarkHorn(c, m, w, 65.41, 4.08, 0.038)],
  ['playDarkHorn short', (c, m, w) => playDarkHorn(c, m, w, 87.31, 1.2, 0.038)],
  ['playTensionStrand default', (c, m, w) => playTensionStrand(c, m, w, 293.66)],
  ['playTensionStrand 311.13', (c, m, w) => playTensionStrand(c, m, w, 311.13, 4.32, 0.014)],
];
const WHENS = [10.05, 12.3456789, 31.117];

function record(): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  const realRandom = Math.random;
  try {
    for (const [name, voice] of CASES) {
      WHENS.forEach((when, i) => {
        let seed = 12345 + i;
        Math.random = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };
        const { ctx, nodes } = recorder();
        const master = ctx.createGain();
        voice(ctx, master, when);
        out[`${name} @${when}`] = rounded(describe(nodes, (master as unknown as { rec: Rec }).rec));
      });
    }
  } finally {
    Math.random = realRandom;
  }
  return out;
}

const FIXTURE = new URL('./fixtures/voices.json', import.meta.url);

test('the voices keep producing the recorded graphs and schedules', () => {
  const now = record();
  if (process.env.RECORD_VOICES) writeFileSync(FIXTURE, JSON.stringify(now, null, 1) + '\n');
  const before = JSON.parse(readFileSync(FIXTURE, 'utf8')) as Record<string, unknown>;
  assert.deepEqual(Object.keys(now), Object.keys(before));
  for (const k of Object.keys(before)) assert.deepEqual(now[k], before[k], k);
});

test('the recording sees each voice: its oscillators, filters and gains', () => {
  const now = record() as Record<string, unknown>;
  const kinds = (t: unknown): string[] => (Array.isArray(t) ? t.flatMap(kinds) : [(t as { kind: string }).kind, ...kinds((t as { from: unknown }).from)]);
  const tally = (key: string) => kinds(now[`${key} @10.05`]).sort().join(' ');
  assert.equal(tally('pulseTaiko default'), 'filter gain gain osc osc');
  assert.equal(tally('pulseRitualHit default'), 'filter gain source');
  assert.equal(tally('playDarkHorn default'), 'filter gain osc osc osc');
  assert.equal(tally('playTensionStrand default'), 'gain osc osc');
});
