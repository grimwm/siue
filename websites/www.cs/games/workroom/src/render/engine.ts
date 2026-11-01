// The render engine: a renderable score to stereo audio in the browser, the way the composing pipeline
// (music/compose/siue_compose/render.py) makes its master. Each note plays its library sample through an envelope
// and its lane's level; the lanes meet in the lo-fi chain (tanh soft clip, wow and flutter, a 30 Hz high-pass, low-passes
// at 6.5 and 9 kHz) in one stereo OfflineAudioContext rendered TAIL seconds past the end. render.py's hall is silent
// (afir=dry=0 scales afir's own input to 0), so its masters are dry and the chain here has no reverb either.
// Then, in JS and in the rendered buffer itself, the tail is folded onto the start, the hiss added and the whole
// piece given one leveling gain.
// The context, the fetch and the decoder are injected, so the tests hand in fakes.
import type { Lane, Score } from '../score.ts';
import { applyLaneFx, audible, DEFAULT_ROOM_SEND, limit, roomReverb } from './fx.ts';
import { applyVoice } from './voice.ts';
import { keyScale } from '../compose/hum.ts';
import { bendRate, voices } from './plan.ts';
import type { Library, Voice } from './plan.ts';
import { fold, hissSource, levelGain } from './master.ts';

export const RATE = 48000;
export const TAIL = 6; // seconds of release rendered past the end, then folded onto the start
const PEAK_DB = -3;
const DEFAULT_LOUDNESS = -20; // LUFS, when the score has no mix
const HISS_SEED = 3;
/** The library's folder beside the workroom page (music/library/ next to music/index.php). */
export const LIBRARY_BASE = 'library/';

export type FetchBytes = (file: string) => Promise<ArrayBuffer>;
export type Decode = (bytes: ArrayBuffer) => Promise<AudioBuffer>;
export type ContextFactory = (channels: number, length: number, rate: number) => OfflineAudioContext;
export interface RenderDeps { context: ContextFactory; fetchBytes: FetchBytes; decode: Decode; cache?: Map<string, Promise<AudioBuffer>> }

/** Decoded samples by library path, kept for the page's life so each file is fetched and decoded once. */
const pageCache = new Map<string, Promise<AudioBuffer>>();

export const defaultDeps = (): RenderDeps => ({
  context: (channels, length, rate) => new OfflineAudioContext(channels, length, rate),
  fetchBytes: async file => {
    const reply = await fetch(LIBRARY_BASE + file);
    if (!reply.ok) throw new Error(`the server answered ${reply.status}`);
    return reply.arrayBuffer();
  },
  decode: bytes => new OfflineAudioContext(2, 1, RATE).decodeAudioData(bytes),
});

/**
 * The decoded samples of the instruments `ids`, by library path; with `only`, just those paths. A file that fails to
 * fetch or decode rejects with the instrument's name and leaves the cache, so a later call tries it again.
 */
export async function loadInstruments(lib: Library, ids: readonly string[], fetchBytes: FetchBytes, decode: Decode,
  cache: Map<string, Promise<AudioBuffer>> = pageCache, only?: ReadonlySet<string>): Promise<Map<string, AudioBuffer>> {
  const jobs = ids.flatMap(id => {
    const inst = lib.instruments[id];
    if (!inst) throw new Error(`the sample library does not have the instrument ${id}`);
    return inst.files.filter(f => !only || only.has(f.file)).map(async f => {
      let job = cache.get(f.file);
      if (!job) {
        job = fetchBytes(f.file).then(decode);
        cache.set(f.file, job);
        job.catch(() => { if (cache.get(f.file) === job) cache.delete(f.file); });
      }
      try {
        return [f.file, await job] as const;
      } catch (e) {
        throw new Error(`the ${id} sample ${f.file} could not be loaded: ${e instanceof Error ? e.message : String(e)}`);
      }
    });
  });
  return new Map(await Promise.all(jobs));
}

const CLIP_RANGE = 8; // tanh(8) is 1 to within 2e-7, so the curve spans [-8, 8] before it holds flat
const CLIP_POINTS = 16385;

/**
 * render.py's asoftclip=type=tanh is tanh(x). A WaveShaper's curve covers inputs in [-1, 1] and holds its end values
 * past them, so a gain of 1 / CLIP_RANGE ahead of it scales the signal in and the curve is tanh(CLIP_RANGE * x).
 */
function tanhCurve(): Float32Array<ArrayBuffer> {
  return Float32Array.from({ length: CLIP_POINTS }, (_, i) => Math.tanh(CLIP_RANGE * ((2 * i) / (CLIP_POINTS - 1) - 1)));
}

/**
 * ffmpeg's vibrato keeps a 5 ms buffer (round(rate * 0.005) samples) and delays by depth * (buffer - 1) samples times
 * a sine swinging between 0 and 1, so depth d is a delay of d * (buffer - 1) / 2 samples, swinging by as much either
 * way. render.py's two vibratos in series (wow f=0.45 d=0.012, flutter f=5.5 d=0.003) are one DelayNode here, its
 * delay the sum of their centres, each oscillator through a gain of its swing (seconds) into the delay time.
 */
const WOBBLE: readonly { hz: number; depth: number }[] = [{ hz: 0.45, depth: 0.012 }, { hz: 5.5, depth: 0.003 }];

/** ffmpeg's highpass and lowpass default to two poles at Q 0.7071; a BiquadFilterNode's Q for these types is in dB. */
const BUTTERWORTH_Q_DB = 20 * Math.log10(Math.SQRT1_2);

/** The master chain from its input to the destination; returns the node the lanes connect to. */
function masterChain(ctx: OfflineAudioContext): AudioNode {
  const drive = ctx.createGain();
  drive.gain.value = 1 / CLIP_RANGE;
  const clip = ctx.createWaveShaper();
  clip.curve = tanhCurve();
  const buffer = Math.round(RATE * 0.005);
  const swings = WOBBLE.map(w => (w.depth * (buffer - 1)) / 2 / RATE);
  const wobble = ctx.createDelay(0.01);
  wobble.delayTime.value = swings.reduce((a, b) => a + b, 0);
  WOBBLE.forEach((w, i) => {
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = w.hz;
    const swing = ctx.createGain();
    swing.gain.value = swings[i]!;
    lfo.connect(swing).connect(wobble.delayTime);
    lfo.start(0);
  });
  const filter = (type: BiquadFilterType, hz: number): BiquadFilterNode => {
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.frequency.value = hz;
    f.Q.value = BUTTERWORTH_Q_DB;
    return f;
  };
  drive.connect(clip).connect(wobble).connect(filter('highpass', 30)).connect(filter('lowpass', 6500)).connect(filter('lowpass', 9000)).connect(ctx.destination);
  return drive;
}

/** Plays voices `vs` into `ctx` through one gain node per lane, each going to `out`. */
function schedule(ctx: OfflineAudioContext, score: Score, vs: readonly Voice[], samples: Map<string, AudioBuffer>, out: AudioNode): void {
  const lanes = new Map(score.lanes.map(l => {
    const g = ctx.createGain();
    g.gain.value = 10 ** (l.sound!.gain_db / 20);
    g.connect(out);
    return [l.id, g] as const;
  }));
  for (const v of vs) {
    const lane = lanes.get(v.lane)!;
    const src = ctx.createBufferSource();
    src.buffer = samples.get(v.file)!;
    src.playbackRate.value = v.rate;
    // A bend is linear in cents, so the rate moves exponentially between its points, then holds at the last.
    if (v.bend) {
      src.playbackRate.setValueAtTime(v.rate * bendRate(v.bend, 0), v.at);
      for (const [t] of v.bend.slice(1)) src.playbackRate.exponentialRampToValueAtTime(v.rate * bendRate(v.bend, t), v.at + t);
    }
    if (v.loop) {
      src.loop = true;
      [src.loopStart, src.loopEnd] = v.loop;
    }
    // The voice's gain holds the lane level too; the lane's own node carries that, so the envelope peaks at the rest.
    const level = v.gain / lane.gain.value;
    const peak = level * Math.min(1, v.attack > 0 ? v.dur / v.attack : 1);
    const end = v.at + v.dur + v.release;
    const env = ctx.createGain();
    env.gain.setValueAtTime(0, v.at);
    env.gain.linearRampToValueAtTime(peak, v.at + Math.min(v.attack, v.dur));
    env.gain.setValueAtTime(peak, v.at + v.dur);
    env.gain.linearRampToValueAtTime(0, end);
    src.connect(env).connect(lane);
    src.start(v.at);
    src.stop(end);
  }
}

/** Whether a score uses the Sound panel, the Room, the limiter or Voice Effects, and so takes the renderer's longer road. */
export function usesSound(score: Score): boolean {
  return score.lanes.some(l => (l.fx && Object.keys(l.fx).length > 0) || (l.voice && l.voice.length > 0))
    || (!!score.mix?.room && score.mix.room.preset !== 'dry' && score.mix.room.amount > 0) || !!score.mix?.limiter?.on;
}

/** The mono mix of stereo channels. */
const mono = (ch: readonly Float32Array[]): Float32Array => Float32Array.from(ch[0]!, (v, i) => (v + (ch[1]?.[i] ?? v)) / 2);

/**
 * The parts with their Sound settings and Voice Effects, summed, with the Room: each part that has settings, or that a
 * Vocoder or Talk Box uses as its carrier, is rendered on its own, the rest together. Returns the stereo bus.
 */
async function soundBus(score: Score, lib: Library, vs: readonly Voice[], samples: Map<string, AudioBuffer>, length: number, deps: RenderDeps): Promise<Float32Array<ArrayBuffer>[]> {
  const anySolo = score.lanes.some(l => l.fx?.solo);
  const heard = score.lanes.filter(l => audible(l.fx, anySolo));
  const carriers = new Set(score.lanes.flatMap(l => (l.voice ?? []).flatMap(v => ('carrier' in v ? [v.carrier] : []))));
  const own = (l: Lane) => (l.fx && Object.keys(l.fx).length > 0) || (l.voice?.length ?? 0) > 0 || carriers.has(l.id);
  const render = async (ids: ReadonlySet<string>): Promise<Float32Array[]> => {
    const ctx = deps.context(2, length, RATE);
    schedule(ctx, score, vs.filter(v => ids.has(v.lane)), samples, ctx.destination);
    const out = await ctx.startRendering();
    return [Float32Array.from(out.getChannelData(0)), Float32Array.from(out.getChannelData(out.numberOfChannels > 1 ? 1 : 0))];
  };
  const bus: Float32Array<ArrayBuffer>[] = [new Float32Array(length), new Float32Array(length)];
  const room = score.mix?.room && score.mix.room.preset !== 'dry' ? score.mix.room : null;
  const send = room ? [new Float32Array(length), new Float32Array(length)] : null;
  const add = (ch: readonly Float32Array[], sendLevel: number) => {
    for (let c = 0; c < 2; c++) for (let i = 0; i < length; i++) {
      bus[c]![i] = bus[c]![i]! + ch[c]![i]!;
      if (send) send[c]![i] = send[c]![i]! + ch[c]![i]! * sendLevel;
    }
  };
  const rest = new Set(heard.filter(l => !own(l)).map(l => l.id));
  if (rest.size) add(await render(rest), DEFAULT_ROOM_SEND);
  const dry = new Map<string, Float32Array[]>();
  for (const l of score.lanes.filter(own)) dry.set(l.id, await render(new Set([l.id])));
  const bpm = score.tempo?.[0]?.bpm ?? 120;
  // Auto-Tune and the Harmonizer follow the piece's key, worked out from its pitched parts' notes.
  const pitchedLanes = new Set(score.lanes.filter(l => lib.instruments[l.sound!.instrument]?.pitched !== false).map(l => l.id));
  const key = keyScale(score.notes.filter(n => pitchedLanes.has(n.lane)).map(n => n.pitch)).classes;
  for (const l of heard.filter(own)) {
    let ch = dry.get(l.id)!.map(c => Float32Array.from(c));
    if (l.voice?.length) {
      const voiced = applyVoice(mono(ch), l.voice, RATE, new Map([...dry].map(([id, c]) => [id, mono(c)])), key);
      ch = [Float32Array.from(voiced), Float32Array.from(voiced)];
    }
    if (l.fx) applyLaneFx(ch, l.fx, bpm, RATE);
    add(ch, l.fx?.room ?? DEFAULT_ROOM_SEND);
  }
  if (room && send) roomReverb(send, room, RATE).forEach((wet, c) => { for (let i = 0; i < length; i++) bus[c]![i] = bus[c]![i]! + wet[i]!; });
  return bus;
}

/**
 * The score as stereo audio at RATE, `duration` long, its tail folded onto the start so it loops. Rejects with a
 * message naming the lane or instrument when a lane has no sound, the library lacks an instrument or a sample fails.
 * A score that uses Sound, the Room, the limiter or Voice Effects has its parts made first and then played through
 * the same master chain; one that uses none of them is played in a single pass, as it always was.
 */
export async function renderScore(score: Score, lib: Library, deps: RenderDeps = defaultDeps()): Promise<{ channels: Float32Array[]; rate: number }> {
  const vs = voices(score, lib);
  const instruments = [...new Set(score.lanes.map(l => l.sound!.instrument))];
  const samples = await loadInstruments(lib, instruments, deps.fetchBytes, deps.decode, deps.cache ?? pageCache, new Set(vs.map(v => v.file)));
  const length = Math.round(score.duration * RATE);
  // The parts are made before the master's context exists, so only one full-length context is held at a time.
  const bus = usesSound(score) ? await soundBus(score, lib, vs, samples, length + TAIL * RATE, deps) : null;
  const ctx = deps.context(2, length + TAIL * RATE, RATE);
  const input = masterChain(ctx);
  if (bus) {
    const buf = ctx.createBuffer(2, bus[0]!.length, RATE);
    bus.forEach((c, i) => buf.copyToChannel(c, i));
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(input);
    src.start(0);
  } else schedule(ctx, score, vs, samples, input);
  const rendered = await ctx.startRendering();
  // From here on the work is in the rendered buffer's own memory: no full-length copy of the piece is made.
  const folded = fold(Array.from({ length: rendered.numberOfChannels }, (_, c) => rendered.getChannelData(c)), length);
  const hiss = hissSource(RATE, HISS_SEED);
  for (let j = 0; j < length; j++) {
    const h = hiss();
    for (const c of folded) c[j]! += h;
  }
  const limiter = score.mix?.limiter;
  // With the limiter on, the piece may be levelled up to full scale and the limiter catches what passes its ceiling.
  const gain = levelGain(folded, RATE, score.mix?.loudness ?? DEFAULT_LOUDNESS, limiter?.on ? 0 : PEAK_DB);
  for (const c of folded) for (let j = 0; j < length; j++) c[j]! *= gain;
  if (limiter?.on) limit(folded, limiter, RATE);
  return { channels: folded, rate: RATE };
}
