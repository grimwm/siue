// Record A Vocal: the microphone (asked for only now, with the browser's voice processing off so the voice is kept as
// sung) into 16-bit chunks, over the piece. The piece and a one-bar count-in play in the same audio context as the
// recording, so every recorded sample has a time in the piece: the take's place is that time less the output's and
// the input's latency. The page's audio pieces are injected, so the tests hand in fakes.

export const REC_BLOCK = 4096;
/** A take stops itself at 15 minutes. */
export const MAX_REC_SECONDS = 900;

export interface RecPorts {
  /** Asks for the microphone with echo cancellation, noise suppression and auto gain off. */
  microphone(): Promise<MediaStream>;
  context(): AudioContext;
}

export interface RecOptions {
  /** The other parts as sound, from the start of the piece; null to sing over clicks. */
  backing: AudioBuffer | null;
  /** Seconds a beat lasts, and how many beats the count-in has. */
  beat: number;
  countIn: number;
  /** A click on every beat when there is no backing; one second of the piece's beats past the count-in, in seconds. */
  clicks: readonly number[];
  onChunk(seq: number, pcm: Int16Array): void;
  /** How loud the voice is, 0 to 1, about ten times a second. */
  onLevel?(level: number): void;
  /** The take reached its limit or the piece ended. */
  onEnd?(): void;
}

export interface Recording {
  rate: number;
  /** Stops and lets the microphone go; where the take sits: `at` in the piece, `from` the first sample to keep. */
  stop(): { at: number; from: number; samples: number };
}

/** Floats to 16-bit, clipped. */
export function toInt16(x: Float32Array): Int16Array {
  const out = new Int16Array(x.length);
  for (let i = 0; i < x.length; i++) {
    const v = Math.max(-1, Math.min(1, x[i]!));
    out[i] = v < 0 ? Math.round(v * 32768) : Math.round(v * 32767);
  }
  return out;
}

/**
 * Where a take sits: its first sample was heard at `firstSample` (context seconds) and the piece began at `pieceStart`;
 * the voice reached the microphone `latency` seconds before the page heard it, and the singer heard the piece late by
 * the output latency. A take begun before the piece (in the count-in) starts at 0 and keeps only what came after.
 */
export function placeTake(firstSample: number, pieceStart: number, latency: number, rate: number): { at: number; from: number } {
  const t = firstSample - pieceStart - latency;
  return t >= 0 ? { at: Math.round(t * 1000) / 1000, from: 0 } : { at: 0, from: Math.round(-t * rate) };
}

export async function recordVocal(ports: RecPorts, o: RecOptions): Promise<Recording> {
  const stream = await ports.microphone();
  let ctx: AudioContext | null = null;
  try {
    ctx = ports.context();
    const rate = ctx.sampleRate;
    const source = ctx.createMediaStreamSource(stream);
    const node = ctx.createScriptProcessor(REC_BLOCK, 1, 1);
    const silent = ctx.createGain();
    silent.gain.value = 0;
    const start = ctx.currentTime + 0.15;
    const pieceStart = start + o.countIn * o.beat;
    // The count-in and, without backing, a click on every beat of the piece.
    const click = (at: number, accent: boolean) => {
      const osc = ctx!.createOscillator();
      const g = ctx!.createGain();
      osc.frequency.value = accent ? 1500 : 1000;
      g.gain.setValueAtTime(0.3, at);
      g.gain.exponentialRampToValueAtTime(0.001, at + 0.06);
      osc.connect(g).connect(ctx!.destination);
      osc.start(at);
      osc.stop(at + 0.07);
    };
    for (let i = 0; i < o.countIn; i++) click(start + i * o.beat, i === 0);
    if (o.backing) {
      const b = ctx.createBufferSource();
      b.buffer = o.backing;
      b.connect(ctx.destination);
      b.start(pieceStart);
      b.onended = () => o.onEnd?.();
    } else for (const t of o.clicks) click(pieceStart + t, false);
    const latency = (ctx.baseLatency ?? 0) + (ctx.outputLatency ?? 0) + (stream.getAudioTracks()[0]?.getSettings().latency ?? 0);
    let seq = 0, samples = 0, first: number | null = null, levelAt = 0;
    node.onaudioprocess = e => {
      const x = e.inputBuffer.getChannelData(0);
      // The block was captured one block before it is processed for playback.
      first ??= e.playbackTime - x.length / rate;
      o.onChunk(seq++, toInt16(x));
      samples += x.length;
      if (o.onLevel && samples - levelAt >= rate / 10) {
        levelAt = samples;
        let peak = 0;
        for (const v of x) peak = Math.max(peak, Math.abs(v));
        o.onLevel(peak);
      }
      if (samples >= MAX_REC_SECONDS * rate) o.onEnd?.();
    };
    source.connect(node).connect(silent).connect(ctx.destination);
    let stopped = false;
    return {
      rate,
      stop() {
        if (!stopped) {
          stopped = true;
          node.onaudioprocess = null;
          source.disconnect();
          node.disconnect();
          for (const t of stream.getTracks()) t.stop();
          void ctx!.close();
        }
        return { ...placeTake(first ?? pieceStart, pieceStart, latency, rate), samples };
      },
    };
  } catch (e) {
    for (const t of stream.getTracks()) t.stop();
    void ctx?.close();
    throw e;
  }
}
