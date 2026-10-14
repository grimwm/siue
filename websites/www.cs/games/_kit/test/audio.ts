// websites/www.cs/games/_kit/test/audio.ts
// A recording stand-in for AudioContext, so audio code runs under Node: every
// node it makes, every call on a gain or frequency, and the context's state.
import assert from 'node:assert/strict';

export type ParamCall = [kind: 'set' | 'exp' | 'lin' | 'cancel', value: number, time: number];

export interface FakeParam {
  value: number;
  calls: ParamCall[];
  setValueAtTime(v: number, t: number): void;
  exponentialRampToValueAtTime(v: number, t: number): void;
  linearRampToValueAtTime(v: number, t: number): void;
  cancelScheduledValues(t: number): void;
}

export interface FakeBuffer {
  file?: string;
  length: number;
  sampleRate: number;
  duration: number;
  getChannelData(ch: number): Float32Array;
}

interface FakeNodeBase {
  /** What it was connected to: other fake nodes, or the context's destination. */
  to: unknown[];
  started: number | null;
  stopped: number | null;
  onended: (() => void) | null;
  connect(target: unknown): void;
  disconnect(): void;
  start(when?: number): void;
  stop(when?: number): void;
}
export interface FakeGain extends FakeNodeBase { kind: 'gain'; gain: FakeParam }
export interface FakeOsc extends FakeNodeBase { kind: 'osc'; type: string; frequency: FakeParam }
export interface FakeFilter extends FakeNodeBase { kind: 'filter'; type: string; frequency: FakeParam; Q: FakeParam }
export interface FakeSource extends FakeNodeBase { kind: 'source'; buffer: FakeBuffer | null; loop: boolean }
export type FakeNode = FakeGain | FakeOsc | FakeFilter | FakeSource;
export type FakeKind = FakeNode['kind'];

export interface FakeContext {
  state: string;
  currentTime: number;
  sampleRate: number;
  destination: { kind: 'destination' };
  nodes: FakeNode[];
  buffers: number;
  resumes: number;
  suspends: number;
  /** Settles a resume() held by the `holdResume` option. */
  settleResume(): void;
  /** A test may swap in a context whose resume() or suspend() answers nothing, as a broken browser's does. */
  resume(): Promise<void> | void;
  suspend(): Promise<void> | void;
  createGain(): FakeGain;
  createOscillator(): FakeOsc;
  createBiquadFilter(): FakeFilter;
  createBufferSource(): FakeSource;
  createBuffer(channels: number, length: number, rate: number): FakeBuffer;
  decodeAudioData(bytes: { file?: string }): Promise<FakeBuffer>;
}

function param(value: number): FakeParam {
  return {
    value,
    calls: [],
    setValueAtTime(v, t) { this.value = v; this.calls.push(['set', v, t]); },
    exponentialRampToValueAtTime(v, t) { this.calls.push(['exp', v, t]); },
    linearRampToValueAtTime(v, t) { this.calls.push(['lin', v, t]); },
    cancelScheduledValues(t) { this.calls.push(['cancel', 0, t]); },
  };
}

export function fakeAudioContext(state = 'running', opts: { holdResume?: boolean } = {}): FakeContext {
  const held: Array<() => void> = [];
  const ctx: FakeContext = {
    state,
    currentTime: 10,
    sampleRate: 8000,
    destination: { kind: 'destination' },
    nodes: [],
    buffers: 0,
    resumes: 0,
    suspends: 0,
    settleResume() { ctx.state = 'running'; held.splice(0).forEach(r => r()); },
    resume() {
      ctx.resumes++;
      if (opts.holdResume) return new Promise<void>(r => held.push(r));
      ctx.state = 'running';
      return Promise.resolve();
    },
    suspend() { ctx.suspends++; ctx.state = 'suspended'; return Promise.resolve(); },
    createGain: () => register({ ...base(), kind: 'gain', gain: param(1) }),
    createOscillator: () => register({ ...base(), kind: 'osc', type: 'sine', frequency: param(440) }),
    createBiquadFilter: () => register({ ...base(), kind: 'filter', type: 'lowpass', frequency: param(350), Q: param(1) }),
    createBufferSource: () => register({ ...base(), kind: 'source', buffer: null, loop: false }),
    createBuffer(_channels, length, rate) {
      ctx.buffers++;
      const data = new Float32Array(length);
      return { length, sampleRate: rate, duration: length / rate, getChannelData: () => data };
    },
    decodeAudioData(bytes) {
      const data = new Float32Array(1000).fill(0.5);
      return Promise.resolve({ file: bytes.file, length: 1000, sampleRate: 100, duration: 10, getChannelData: () => data });
    },
  };
  function base(): FakeNodeBase {
    return {
      to: [],
      started: null,
      stopped: null,
      onended: null,
      connect(this: FakeNodeBase, target) { this.to.push(target); },
      disconnect(this: FakeNodeBase) { this.to = []; },
      start(this: FakeNodeBase, when) { this.started = when ?? ctx.currentTime; },
      stop(this: FakeNodeBase, when) { this.stopped = when ?? ctx.currentTime; },
    };
  }
  function register<N extends FakeNode>(n: N): N {
    ctx.nodes.push(n);
    return n;
  }
  return ctx;
}

/**
 * The fake as the AudioContext the code under test takes. The fake records the
 * calls the audio code makes and implements no more, so it is not a full
 * AudioContext: `as unknown as` is the one crossing, made here and nowhere else.
 */
export function asAudioContext(ctx: FakeContext): AudioContext {
  return ctx as unknown as AudioContext;
}

/** A fake node as the AudioNode the code under test is handed (the same one crossing as asAudioContext). */
export function asAudioNode(n: FakeNode): AudioNode {
  return n as unknown as AudioNode;
}

/** Every node of one kind the context made, in creation order. */
export function nodesOf<K extends FakeKind>(ctx: FakeContext, kind: K): Array<Extract<FakeNode, { kind: K }>> {
  return ctx.nodes.filter((n): n is Extract<FakeNode, { kind: K }> => n.kind === kind);
}

/** The i-th node of one kind; the test fails, naming it, when there is none. */
export function nodeOf<K extends FakeKind>(ctx: FakeContext, kind: K, i = 0): Extract<FakeNode, { kind: K }> {
  const n = nodesOf(ctx, kind).at(i);
  if (!n) throw new assert.AssertionError({ message: `no ${kind} node at ${i}` });
  return n;
}

/** What a node was connected to, when the test knows it is a gain (the envelope of a tone). */
export function gainAt(to: unknown[], i = 0): FakeGain {
  const n = to[i];
  if (typeof n !== 'object' || n === null || !('kind' in n) || n.kind !== 'gain') throw new assert.AssertionError({ message: `connection ${i} is not a gain node` });
  return n as FakeGain;
}
