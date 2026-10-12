// websites/www.cs/games/_kit/test/audio.ts
// A recording stand-in for AudioContext, so audio code runs under Node: every
// node it makes, every call on a gain or frequency, and the context's state.
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

export interface FakeNode {
  kind: 'gain' | 'osc' | 'filter' | 'source';
  to: unknown[];
  started: number | null;
  stopped: number | null;
  type?: string;
  gain?: FakeParam;
  frequency?: FakeParam;
  Q?: FakeParam;
  buffer?: FakeBuffer | null;
  loop?: boolean;
  onended?: (() => void) | null;
  connect(target: unknown): void;
  disconnect(): void;
  start(when?: number): void;
  stop(when?: number): void;
}

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
  resume(): Promise<void>;
  suspend(): Promise<void>;
  createGain(): FakeNode;
  createOscillator(): FakeNode;
  createBiquadFilter(): FakeNode;
  createBufferSource(): FakeNode;
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
    createGain: () => node('gain', { gain: param(1) }),
    createOscillator: () => node('osc', { type: 'sine', frequency: param(440) }),
    createBiquadFilter: () => node('filter', { type: 'lowpass', frequency: param(350), Q: param(1) }),
    createBufferSource: () => node('source', { buffer: null, loop: false }),
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
  function node(kind: FakeNode['kind'], extra: Partial<FakeNode>): FakeNode {
    const n: FakeNode = {
      kind,
      to: [],
      started: null,
      stopped: null,
      onended: null,
      connect(target) { n.to.push(target); },
      disconnect() { n.to = []; },
      start(when) { n.started = when ?? ctx.currentTime; },
      stop(when) { n.stopped = when ?? ctx.currentTime; },
      ...extra,
    };
    ctx.nodes.push(n);
    return n;
  }
  return ctx;
}
