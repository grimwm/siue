// Good To The Ear: a take's 48 kHz samples as Opus, mono at 96 kbps. WebCodecs' AudioEncoder makes the packets and
// ogg.ts puts them in an Ogg file; where the browser has no AudioEncoder, MediaRecorder records the take played into a
// stream (in real time) as WebM or Ogg Opus. Where it has neither, there is no Good To The Ear. The browser's pieces
// are injected, so the tests hand in fakes.
import { DEFAULT_PRE_SKIP, muxOggOpus, OPUS_RATE } from './ogg.ts';

export const OPUS_BITRATE = 96_000;
const FRAME = 960; // 20 ms at 48 kHz, fed to the encoder a frame at a time

export interface OpusFile { bytes: Uint8Array; ext: 'ogg' | 'webm' }

/** What the encoder needs of WebCodecs: an AudioEncoder and AudioData, as the browser has them. */
export interface CodecPorts {
  AudioEncoder: typeof AudioEncoder;
  AudioData: typeof AudioData;
}

/** What the fallback needs: a real-time context to play the take into a stream, and MediaRecorder to record it. */
export interface RecorderPorts {
  context(): AudioContext;
  isTypeSupported(mime: string): boolean;
  record(stream: MediaStream, mime: string): MediaRecorder;
}

/** The pre-skip an encoder's OpusHead description says, else libopus's own. */
export function preSkipOf(description: AllowSharedBufferSource | undefined): number {
  if (!description) return DEFAULT_PRE_SKIP;
  const b = ArrayBuffer.isView(description) ? new Uint8Array(description.buffer, description.byteOffset, description.byteLength) : new Uint8Array(description);
  const isHead = b.length >= 12 && new TextDecoder().decode(b.subarray(0, 8)) === 'OpusHead';
  return isHead ? b[10]! | (b[11]! << 8) : DEFAULT_PRE_SKIP;
}

/** `pcm` (at OPUS_RATE) through WebCodecs as an Ogg Opus file. */
export async function webCodecsOpus(pcm: Float32Array, ports: CodecPorts): Promise<OpusFile> {
  const packets: Uint8Array[] = [];
  let preSkip = DEFAULT_PRE_SKIP;
  let failed: unknown = null;
  const enc = new ports.AudioEncoder({
    output: (chunk, meta) => {
      const b = new Uint8Array(chunk.byteLength);
      chunk.copyTo(b);
      packets.push(b);
      if (meta?.decoderConfig?.description) preSkip = preSkipOf(meta.decoderConfig.description);
    },
    error: e => { failed = e; },
  });
  enc.configure({ codec: 'opus', sampleRate: OPUS_RATE, numberOfChannels: 1, bitrate: OPUS_BITRATE });
  for (let at = 0; at < pcm.length; at += FRAME) {
    const frame = pcm.subarray(at, Math.min(pcm.length, at + FRAME));
    const data = new ports.AudioData({ format: 'f32', sampleRate: OPUS_RATE, numberOfFrames: frame.length, numberOfChannels: 1, timestamp: Math.round((at / OPUS_RATE) * 1e6), data: Float32Array.from(frame) });
    enc.encode(data);
    data.close();
  }
  await enc.flush();
  enc.close();
  if (failed) throw failed instanceof Error ? failed : new Error(String(failed));
  return { bytes: muxOggOpus(packets, preSkip, OPUS_RATE, pcm.length), ext: 'ogg' };
}

/** Whether this browser's AudioEncoder takes mono Opus at 96 kbps. */
export async function codecsCanOpus(ports: CodecPorts | null): Promise<boolean> {
  if (!ports) return false;
  try {
    const r = await ports.AudioEncoder.isConfigSupported({ codec: 'opus', sampleRate: OPUS_RATE, numberOfChannels: 1, bitrate: OPUS_BITRATE });
    return !!r.supported;
  } catch {
    return false;
  }
}

/** The MediaRecorder type to use for Opus, preferring Ogg; null when there is none. */
export function recorderMime(isTypeSupported: (m: string) => boolean): { mime: string; ext: 'ogg' | 'webm' } | null {
  if (isTypeSupported('audio/ogg;codecs=opus')) return { mime: 'audio/ogg;codecs=opus', ext: 'ogg' };
  if (isTypeSupported('audio/webm;codecs=opus')) return { mime: 'audio/webm;codecs=opus', ext: 'webm' };
  return null;
}

/** `pcm` (at `rate`) played into a stream and recorded as Opus: it takes as long as the take itself. */
export async function recorderOpus(pcm: Float32Array, rate: number, ports: RecorderPorts): Promise<OpusFile> {
  const kind = recorderMime(m => ports.isTypeSupported(m));
  if (!kind) throw new Error('This browser cannot make Opus.');
  const ctx = ports.context();
  try {
    const buf = ctx.createBuffer(1, pcm.length, rate);
    buf.copyToChannel(Float32Array.from(pcm), 0);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const dest = ctx.createMediaStreamDestination();
    src.connect(dest);
    const rec = ports.record(dest.stream, kind.mime);
    const chunks: Blob[] = [];
    rec.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
    const done = new Promise<void>(resolve => { rec.onstop = () => resolve(); });
    rec.start();
    src.start();
    await new Promise<void>(resolve => { src.onended = () => resolve(); });
    rec.stop();
    await done;
    return { bytes: new Uint8Array(await new Blob(chunks).arrayBuffer()), ext: kind.ext };
  } finally {
    void ctx.close();
  }
}
