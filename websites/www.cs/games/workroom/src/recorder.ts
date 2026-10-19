// Recording a spoken note or a hum through ports the page hands in (the
// browser's MediaRecorder and getUserMedia; fakes in the tests). Safari needs
// three things: an mp4 recording, the microphone asked for inside the tap
// itself, and an audio session that records ('play-and-record' while recording;
// the guide's 'playback' session is for playing only). A minute is the cap. DOM-free.
import { MAX_AUDIO_SECONDS } from './note.ts';

/** The recorder asks for 64 kb/s: a minute of speech stays small enough to seal under the note limit. */
export const RECORDER_BITS_PER_SECOND = 64_000;

export const MIME_PREFERENCE: readonly string[] = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/ogg;codecs=opus'];

export function pickMime(isSupported: (mime: string) => boolean): string | null {
  return MIME_PREFERENCE.find(m => isSupported(m)) ?? null;
}

export interface Timers { setTimeout(f: () => void, ms: number): number; clearTimeout(id: number): void }

export function stopAfterLimit(timers: Timers, stop: () => void): () => void {
  const id = timers.setTimeout(stop, MAX_AUDIO_SECONDS * 1000);
  return () => timers.clearTimeout(id);
}

export interface BlobLike { readonly size: number; arrayBuffer(): Promise<ArrayBuffer> }
export interface StreamLike { getTracks(): { stop(): void }[] }
export interface RecorderLike { readonly state: string; start(timesliceMs?: number): void; stop(): void; ondataavailable: ((e: { data: BlobLike }) => void) | null; onstop: (() => void) | null }
export interface MediaPorts {
  getUserMedia(): Promise<StreamLike>;
  isTypeSupported(mime: string): boolean;
  makeRecorder(stream: StreamLike, mime: string, bitsPerSecond: number): RecorderLike;
  timers: Timers;
  now(): number;
  audioSession: { type: string } | null;
}
export interface Recording { mime: string; seconds: number; bytes: Uint8Array<ArrayBuffer> }
export class RecorderProblem extends Error {}
export const RECORDER_MESSAGES = {
  unsupported: 'This browser cannot record audio here.',
  denied: 'The microphone is off for this page. Allow it in the browser’s settings, then try again.',
  failed: 'The recording did not start. Try again.',
  cancelled: 'The recording was stopped before it began.',
} as const;
export interface Recorder { start(): Promise<void>; stop(): Promise<Recording>; cancel(): void; readonly recording: boolean; elapsed(): number }

const DENIED = new Set(['NotAllowedError', 'SecurityError', 'PermissionDeniedError']);

export function createRecorder(ports: MediaPorts, onLimit: (r: Promise<Recording>) => void): Recorder {
  let rec: RecorderLike | null = null;
  let stream: StreamLike | null = null;
  let chunks: BlobLike[] = [];
  let mime = '';
  let started = 0;
  let cancelCap: (() => void) | null = null;
  let done: Promise<Recording> | null = null;
  // The microphone has been asked for and not yet answered; abandoned once cancel or stop is pressed meanwhile.
  let pending: { abandoned: boolean } | null = null;
  const session = (type: string): void => { if (ports.audioSession) ports.audioSession.type = type; };
  const seconds = (): number => Math.min(MAX_AUDIO_SECONDS, Math.max(0, (ports.now() - started) / 1000));
  const release = (): void => {
    cancelCap?.();
    cancelCap = null;
    for (const t of stream?.getTracks() ?? []) t.stop();
    stream = null;
    session('auto');
  };
  const finish = (): Promise<Recording> => {
    if (done) return done;
    const r = rec;
    if (!r) return Promise.reject(new RecorderProblem('Nothing is recording.'));
    const length = Math.max(0.01, Math.round(seconds() * 100) / 100);
    const mine = chunks;
    done = new Promise<Recording>((resolve, reject) => {
      const onStop = (): void => {
        release();
        Promise.all(mine.map(c => c.arrayBuffer())).then(parts => {
          const bytes = new Uint8Array(parts.reduce((n, p) => n + p.byteLength, 0));
          let at = 0;
          for (const p of parts) { bytes.set(new Uint8Array(p), at); at += p.byteLength; }
          resolve({ mime, seconds: length, bytes });
        }, () => reject(new RecorderProblem(RECORDER_MESSAGES.failed)));
      };
      r.onstop = onStop;
      if (r.state !== 'inactive') r.stop(); else onStop();
    });
    return done;
  };
  return {
    start() {
      if (pending || (rec && !done)) return Promise.reject(new RecorderProblem('Already recording.'));
      const picked = pickMime(m => ports.isTypeSupported(m));
      if (picked === null) return Promise.reject(new RecorderProblem(RECORDER_MESSAGES.unsupported));
      const mark = { abandoned: false };
      pending = mark;
      session('play-and-record');
      let asked: Promise<StreamLike>;
      try {
        asked = ports.getUserMedia(); // first, inside the tap: Safari grants the microphone only there
      } catch (e) {
        asked = Promise.reject(e);
      }
      return asked.then(s => {
        pending = null;
        if (mark.abandoned) {
          // Cancel or Stop was pressed while the microphone was being asked for: nothing may start listening.
          for (const t of s.getTracks()) t.stop();
          session('auto');
          throw new RecorderProblem(RECORDER_MESSAGES.cancelled);
        }
        stream = s;
        try {
          const mine: BlobLike[] = [];
          chunks = mine;
          done = null;
          mime = picked;
          const r = ports.makeRecorder(s, picked, RECORDER_BITS_PER_SECOND);
          r.ondataavailable = e => { if (e.data.size > 0) mine.push(e.data); };
          r.start(1000);
          rec = r;
          started = ports.now();
          cancelCap = stopAfterLimit(ports.timers, () => onLimit(finish()));
        } catch {
          // The microphone was granted but the recorder would not start: nothing may keep listening.
          rec = null;
          release();
          throw new RecorderProblem(RECORDER_MESSAGES.failed);
        }
      }, (e: unknown) => {
        pending = null;
        if (mark.abandoned) throw new RecorderProblem(RECORDER_MESSAGES.cancelled);
        release();
        const name = typeof e === 'object' && e !== null ? (e as { name?: unknown }).name : undefined;
        throw new RecorderProblem(typeof name === 'string' && DENIED.has(name) ? RECORDER_MESSAGES.denied : RECORDER_MESSAGES.failed);
      });
    },
    stop() {
      if (pending) { pending.abandoned = true; return Promise.reject(new RecorderProblem(RECORDER_MESSAGES.cancelled)); }
      return finish();
    },
    cancel() {
      if (pending) pending.abandoned = true;
      const r = rec;
      rec = null;
      chunks = [];
      if (r && r.state !== 'inactive') { r.onstop = null; r.stop(); }
      release();
    },
    get recording() { return rec !== null && done === null; },
    elapsed: () => (rec && !done ? seconds() : 0),
  };
}
