// The renderer's vocal takes in the browser: a take still on this device is read from its 16-bit chunks, a saved one
// from the studio (take.php), and each is decoded or resampled to the renderer's rate once for the page's life.
import type { PageApi } from '../api.ts';
import { RATE } from '../render/engine.ts';
import { LOCAL_TAKE_RE } from '../score.ts';
import type { TakeStore } from './takes.ts';

/** 16-bit samples at `rate` as an AudioBuffer at the renderer's rate. */
async function bufferOf(pcm: Int16Array, rate: number): Promise<AudioBuffer> {
  const length = Math.max(1, Math.round((pcm.length * RATE) / rate));
  const ctx = new OfflineAudioContext(1, length, RATE);
  const src = ctx.createBuffer(1, Math.max(1, pcm.length), rate);
  const ch = src.getChannelData(0);
  for (let i = 0; i < pcm.length; i++) ch[i] = pcm[i]! / 32768;
  const node = ctx.createBufferSource();
  node.buffer = src;
  node.connect(ctx.destination);
  node.start();
  return ctx.startRendering();
}

export function takeAudio(api: Pick<PageApi, 'takeBytes'>, store: TakeStore): (file: string) => Promise<AudioBuffer> {
  const cache = new Map<string, Promise<AudioBuffer>>();
  const load = async (file: string): Promise<AudioBuffer> => {
    if (LOCAL_TAKE_RE.test(file)) {
      const pcm = await store.pcm(file);
      const meta = (await store.listAll()).find(t => t.id === file);
      if (!pcm || !meta) throw new Error('the take is no longer on this device');
      return bufferOf(pcm, meta.rate);
    }
    const bytes = await api.takeBytes(file);
    return new OfflineAudioContext(1, 1, RATE).decodeAudioData(bytes.buffer as ArrayBuffer);
  };
  return file => {
    let job = cache.get(file);
    if (!job) {
      job = load(file);
      cache.set(file, job);
      job.catch(() => { if (cache.get(file) === job) cache.delete(file); });
    }
    return job;
  };
}
