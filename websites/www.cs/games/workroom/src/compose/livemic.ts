// Voice Effects on a live microphone: the microphone is asked for only when the person taps to try it, heard through
// the part's chain in the page (the same processors the renderer uses), and let go when it stops, the panel closes or
// the page hides. Nothing is recorded or sent. A Vocoder or Talk Box live has no part playing under it, so its carrier
// is a held sawtooth chord (A2, E3, A3). The page's audio pieces are injected, so the tests hand in fakes.
import type { VoiceFx } from '../score.ts';
import { voiceProcessor } from '../render/voice.ts';
import type { KeyClasses, VoiceProcessor } from '../render/voice.ts';

export const LIVE_BLOCK = 2048;
const CARRIER_HZ = [110, 164.81, 220];

/** What the page gives the live voice: the microphone, an audio context and a processing node to run the chain in. */
export interface LivePorts {
  microphone(): Promise<MediaStream>;
  context(): AudioContext;
}

/** A running live voice; `stop` lets the microphone go and closes the sound. */
export interface LiveVoice { stop(): void; readonly running: boolean }

/** A chain of processors over one block, the carrier made for those that need one. */
export function chainProcessor(chain: readonly VoiceFx[], rate: number, key?: KeyClasses): (input: Float32Array, out: Float32Array) => void {
  const steps: { p: VoiceProcessor; carrier: boolean }[] = chain.map(fx => ({ p: voiceProcessor(fx, rate, key), carrier: 'carrier' in fx }));
  const phases = CARRIER_HZ.map(() => 0);
  let carrier = new Float32Array(0);
  let a = new Float32Array(0);
  let b = new Float32Array(0);
  return (input, out) => {
    if (a.length !== input.length) { a = new Float32Array(input.length); b = new Float32Array(input.length); carrier = new Float32Array(input.length); }
    if (steps.some(s => s.carrier)) {
      for (let i = 0; i < input.length; i++) {
        let v = 0;
        CARRIER_HZ.forEach((hz, k) => { phases[k] = (phases[k]! + hz / rate) % 1; v += 2 * phases[k]! - 1; });
        carrier[i] = v / CARRIER_HZ.length;
      }
    }
    a.set(input);
    for (const s of steps) {
      s.p.process(a, b, s.carrier ? carrier : undefined);
      [a, b] = [b, a];
    }
    out.set(a);
  };
}

/** Starts the live voice: asks for the microphone now, and plays it through `chain` until stopped. */
export async function startLiveVoice(ports: LivePorts, chain: readonly VoiceFx[], key?: KeyClasses): Promise<LiveVoice> {
  const stream = await ports.microphone();
  let ctx: AudioContext | null = null;
  let source: MediaStreamAudioSourceNode;
  let node: ScriptProcessorNode;
  try {
    ctx = ports.context();
    source = ctx.createMediaStreamSource(stream);
    // A ScriptProcessor runs the chain on the page's thread: the site's rules leave no room for an audio worklet module.
    node = ctx.createScriptProcessor(LIVE_BLOCK, 1, 1);
    const run = chainProcessor(chain, ctx.sampleRate, key);
    node.onaudioprocess = e => run(e.inputBuffer.getChannelData(0), e.outputBuffer.getChannelData(0));
    source.connect(node).connect(ctx.destination);
  } catch (e) {
    // Whatever failed after the microphone was granted, it is let go.
    for (const t of stream.getTracks()) t.stop();
    void ctx?.close();
    throw e;
  }
  let running = true;
  return {
    get running() { return running; },
    stop() {
      if (!running) return;
      running = false;
      node.onaudioprocess = null;
      source.disconnect();
      node.disconnect();
      for (const t of stream.getTracks()) t.stop();
      void ctx!.close();
    },
  };
}
