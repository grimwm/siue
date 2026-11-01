// The compose page (compose.php): the catalogue from the shared library, then the editor on the piece's newest draft, or
// New Piece first. Notes sound through one AudioContext made on the first key (a browser starts sound only after a
// gesture), from the samples the renderer decodes, so each file is fetched and decoded once for both. Web MIDI is asked
// for only when Your Keyboard is turned on, and the microphone only when Record With Mic is tapped; its sound is read
// in the page and never sent anywhere.
import { h, render } from 'preact';
import type { PageApi } from '../../api.ts';
import { catalogue } from '../../catalogue.ts';
import type { Entry } from '../../catalogue.ts';
import { docFromScore, newDoc } from '../../compose/doc.ts';
import type { EditDoc } from '../../compose/doc.ts';
import type { XmlDocument } from '../../compose/fromxml.ts';
import { browserInflate } from '../../compose/mxl.ts';
import { createSampler } from '../../compose/sampler.ts';
import { loadDraft } from '../../load.ts';
import type { Fetch } from '../../load.ts';
import { defaultDeps, LIBRARY_BASE, loadInstruments } from '../../render/engine.ts';
import type { Library } from '../../render/plan.ts';
import type { BuildSound } from '../../render/sound.ts';
import type { ThemeHandle } from '../../theme.ts';
import { loadSheetModule } from '../SheetMusic.tsx';
import { ThemeRoot } from '../ThemeSwitch.tsx';
import type { ComposerFiles } from './Composer.tsx';
import { Composer } from './Composer.tsx';
import type { ComposerStart } from './Composer.tsx';
import type { Heard, HumPorts, MicTake } from './HumPanel.tsx';
import { startLiveVoice } from '../../compose/livemic.ts';
import type { VoiceFx } from '../../score.ts';
import { NewPiece } from './NewPiece.tsx';
import type { TakeStore } from '../../compose/takes.ts';
import { recordVocal } from '../../compose/vocalrec.ts';
import { codecsCanOpus, recorderOpus, webCodecsOpus } from '../../compose/opus.ts';
import type { OpusFile } from '../../compose/opus.ts';
import { OPUS_RATE } from '../../compose/ogg.ts';
import { readLimits } from '../../studio-limits.ts';
import type { VocalPorts } from './VocalPanel.tsx';

export interface MountArgs {
  /** Vocal takes on this device; the page's sound reads them too. */
  takes?: TakeStore;
  root: HTMLElement;
  theme: ThemeHandle;
  piece: string;
  version: string | undefined;
  fetcher: Fetch;
  api: PageApi;
  buildSound: BuildSound;
  say(root: HTMLElement, text: string): void;
}

function readJson<T>(text: string | undefined, fallback: T): T {
  try {
    return text ? (JSON.parse(text) as T) : fallback;
  } catch {
    return fallback;
  }
}

/** Sheet music, import and export in the browser: the sheet bundle, DOMParser (which loads nothing from outside the file), DecompressionStream, and a download. */
const FILES: ComposerFiles = {
  loadSheet: loadSheetModule,
  importPorts: {
    parseXml: text => new DOMParser().parseFromString(text, 'application/xml') as unknown as XmlDocument,
    inflate: browserInflate,
    now: () => performance.now(),
  },
  save(name, data) {
    const url = URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  },
};

/** A decoded sound as one channel: every channel averaged. */
function mono(buffer: AudioBuffer): Heard {
  const samples = new Float32Array(buffer.length);
  for (let c = 0; c < buffer.numberOfChannels; c++) {
    const ch = buffer.getChannelData(c);
    for (let i = 0; i < ch.length; i++) samples[i]! += ch[i]! / buffer.numberOfChannels;
  }
  return { samples, rate: buffer.sampleRate };
}

/** Hum's microphone (MediaRecorder, decoded in the page when it stops), file decoding and playback. */
function humPorts(context: () => AudioContext): HumPorts {
  const decode = async (bytes: ArrayBuffer): Promise<Heard> => mono(await context().decodeAudioData(bytes.slice(0)));
  const canRecord = typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== 'undefined';
  return {
    decode,
    play(h) {
      const ctx = context();
      const buffer = ctx.createBuffer(1, h.samples.length, h.rate);
      buffer.copyToChannel(h.samples as Float32Array<ArrayBuffer>, 0);
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      src.connect(ctx.destination);
      src.start();
    },
    record: canRecord ? async (level): Promise<MicTake> => {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
      const ctx = context();
      let source: MediaStreamAudioSourceNode | null = null;
      let frame = 0;
      const release = (): void => {
        cancelAnimationFrame(frame);
        source?.disconnect();
        for (const t of stream.getTracks()) t.stop();
      };
      let recorder: MediaRecorder;
      try {
        recorder = new MediaRecorder(stream);
      } catch (e) {
        release();
        throw e;
      }
      const chunks: Blob[] = [];
      recorder.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
      source = ctx.createMediaStreamSource(stream);
      const meter = ctx.createAnalyser();
      meter.fftSize = 1024;
      source.connect(meter);
      const buf = new Float32Array(meter.fftSize);
      const listen = (): void => {
        meter.getFloatTimeDomainData(buf);
        let sum = 0;
        for (const x of buf) sum += x * x;
        level(Math.sqrt(sum / buf.length));
        frame = requestAnimationFrame(listen);
      };
      frame = requestAnimationFrame(listen);
      recorder.start(250);
      return {
        stop: () => new Promise<Heard>((resolve, reject) => {
          recorder.onstop = () => {
            release();
            new Blob(chunks, { type: recorder.mimeType }).arrayBuffer().then(decode).then(resolve, reject);
          };
          recorder.stop();
        }),
        cancel: () => {
          if (recorder.state !== 'inactive') { recorder.onstop = null; recorder.stop(); }
          release();
        },
      };
    } : undefined,
  };
}

export async function mountComposer(a: MountArgs): Promise<void> {
  a.root.textContent = 'Loading…';
  let lib: Library;
  try {
    const reply = await fetch(`${LIBRARY_BASE}library.json`);
    if (!reply.ok) throw new Error(`the server answered ${reply.status}`);
    lib = (await reply.json()) as Library;
  } catch (e) {
    a.say(a.root, `The instruments could not be loaded: ${e instanceof Error ? e.message : String(e)}. Reload the page to try again.`);
    return;
  }
  const entries = catalogue(lib);
  let ctx: AudioContext | null = null;
  const context = (): AudioContext => {
    ctx ??= new AudioContext({ latencyHint: 'interactive' });
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  };
  const deps = defaultDeps();
  const sampler = createSampler({
    context,
    library: async () => lib,
    load: (l, instrument, only) => loadInstruments(l, [instrument], deps.fetchBytes, deps.decode, undefined, only),
  });
  const click = (accent: boolean): void => {
    const c = context();
    const osc = c.createOscillator();
    const amp = c.createGain();
    osc.frequency.value = accent ? 1760 : 1320;
    amp.gain.setValueAtTime(0.25, c.currentTime);
    amp.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.08);
    osc.connect(amp).connect(c.destination);
    osc.start();
    osc.stop(c.currentTime + 0.1);
  };
  const hum = humPorts(context);
  // Voice Effects on the live microphone: asked for only when Try It With The Mic is tapped, with its own context.
  const live = typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia
    ? (chain: readonly VoiceFx[], key: readonly number[]) => startLiveVoice({
      microphone: () => navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: false, autoGainControl: false } }),
      context: () => new AudioContext({ latencyHint: 'interactive' }),
    }, chain, key) : undefined;
  // Web MIDI, without SysEx, only when asked for.
  const midi = typeof navigator !== 'undefined' && typeof navigator.requestMIDIAccess === 'function'
    ? () => navigator.requestMIDIAccess({ sysex: false }) : undefined;
  const body = document.body.dataset;
  const vocal = a.takes && live ? vocalPorts(a, a.takes, body['vocalQuality'] === 'ear' ? 'ear' : 'perfect') : undefined;
  const taken = (): string[] => readJson<string[]>(body['pieces'], []);
  const projects = (): { id: string; name: string }[] => readJson<{ id: string; name: string }[]>(body['projects'], []);
  /** New Piece: its title and project, then the editor on `doc` (an empty piece, or one made from an imported file). */
  const startNew = (doc: EditDoc | null, title?: string, note?: string): void => {
    a.root.textContent = '';
    render(h(ThemeRoot, { handle: a.theme }, h(NewPiece, {
      taken: taken(), projects: projects(), title, note,
      onStart: (piece, project) => {
        render(null, a.root);
        history.replaceState(null, '', 'compose.php');
        open({ doc: doc ? { ...doc, title: piece.title } : newDoc(piece.title), piece, project, version: 0 });
      },
    })), a.root);
  };
  const open = (start: ComposerStart): void => {
    a.root.textContent = '';
    render(h(ThemeRoot, { handle: a.theme }, h(Composer, {
      start, entries: entries as Entry[], api: a.api, sampler, buildSound: a.buildSound, click, files: FILES, hum, midi, live, vocal,
      now: () => performance.now() / 1000,
      onSaved: piece => { history.replaceState(null, '', `compose.php?id=${encodeURIComponent(piece)}`); },
      onNewPiece: (doc, title) => {
        render(null, a.root);
        startNew(doc, title, `${doc.parts.length} ${doc.parts.length === 1 ? 'part' : 'parts'} from the file you imported, at its own speed.`);
      },
    })), a.root);
  };

  if (a.piece === '') {
    startNew(null);
    return;
  }
  const wanted = a.version && /^\d+$/.test(a.version) ? Number(a.version) : null;
  const loaded = await loadDraft(a.fetcher, a.piece, wanted);
  if (!loaded.ok) { a.say(a.root, loaded.error); return; }
  if (loaded.score.kind !== 'music') { a.say(a.root, 'Only a music piece can be composed here: a sound piece has no bars to write in.'); return; }
  open({ doc: docFromScore(loaded.score, entries), piece: loaded.score.piece, project: loaded.score.project, version: Math.max(...loaded.versions) });
}

/** Good To The Ear in this browser: WebCodecs where it makes Opus, else MediaRecorder in real time, else none. */
async function makeOpus(pcm: Int16Array, rate: number): Promise<OpusFile | null> {
  const codecs = typeof AudioEncoder === 'undefined' ? null : { AudioEncoder, AudioData };
  const floats = new Float32Array(pcm.length);
  for (let i = 0; i < pcm.length; i++) floats[i] = pcm[i]! / 32768;
  if (await codecsCanOpus(codecs)) {
    let at48 = floats;
    if (rate !== OPUS_RATE) {
      const ctx = new OfflineAudioContext(1, Math.round((floats.length * OPUS_RATE) / rate), OPUS_RATE);
      const b = ctx.createBuffer(1, floats.length, rate);
      b.copyToChannel(floats, 0);
      const src = ctx.createBufferSource();
      src.buffer = b;
      src.connect(ctx.destination);
      src.start();
      at48 = (await ctx.startRendering()).getChannelData(0);
    }
    return webCodecsOpus(at48, codecs!);
  }
  if (typeof MediaRecorder === 'undefined') return null;
  try {
    return await recorderOpus(floats, rate, { context: () => new AudioContext(), isTypeSupported: m => MediaRecorder.isTypeSupported(m), record: (s, mime) => new MediaRecorder(s, { mimeType: mime, audioBitsPerSecond: 96_000 }) });
  } catch {
    return null;
  }
}

function vocalPorts(a: MountArgs, takes: TakeStore, quality: 'perfect' | 'ear'): VocalPorts {
  return {
    takes, quality, room: readLimits(document.body).room,
    // The voice as sung: the browser's echo cancelling, noise suppression and gain riding are off.
    record: o => recordVocal({
      microphone: () => navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false, channelCount: 1 } }),
      context: () => new AudioContext({ latencyHint: 'interactive' }),
    }, o),
    opus: makeOpus,
    sha256: async bytes => [...new Uint8Array(await crypto.subtle.digest('SHA-256', bytes as Uint8Array<ArrayBuffer>))].map(b => b.toString(16).padStart(2, '0')).join(''),
    takeBytes: file => a.api.takeBytes(file),
    convert: (from, to, bytes) => a.api.convertTake(from, to, bytes),
    decodeUrl: async url => new OfflineAudioContext(2, 1, 48000).decodeAudioData(await (await fetch(url)).arrayBuffer()),
  };
}
