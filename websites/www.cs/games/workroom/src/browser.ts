// The browser adapters the page hands its DOM-free modules.
import type { StorageLike } from '../../_kit/ports.ts';
import type { OutboxLock } from './outbox.ts';
import type { MediaPorts, RecorderLike, StreamLike } from './recorder.ts';
import type { ThemePorts } from './theme.ts';

/** localStorage, or null where touching it throws (blocked site data, some private windows). */
export function browserStorage(): StorageLike | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function browserThemePorts(): ThemePorts {
  const q = typeof matchMedia === 'function' ? matchMedia('(prefers-color-scheme: dark)') : null;
  return {
    storage: browserStorage(),
    root: document.documentElement,
    dark: q && {
      get matches() { return q.matches; },
      addEventListener: (type, fn) => q.addEventListener(type, fn),
      removeEventListener: (type, fn) => q.removeEventListener(type, fn),
    },
  };
}

/** The Web Locks lock the outbox flushes under, so two tabs never upload one kept note twice; null where the browser has no Web Locks (the outbox then flushes as it is). */
export function browserLock(): OutboxLock | null {
  const locks = typeof navigator === 'undefined' ? undefined : navigator.locks;
  return locks && typeof locks.request === 'function' ? work => locks.request('workroom-outbox', work) : null;
}

/** The microphone and MediaRecorder as the recorder's ports, or null where the browser cannot record. */
export function browserMedia(): MediaPorts | null {
  const devices = typeof navigator === 'undefined' ? undefined : navigator.mediaDevices;
  if (!devices || typeof devices.getUserMedia !== 'function' || typeof MediaRecorder === 'undefined') return null;
  const session = (navigator as unknown as { audioSession?: { type: string } }).audioSession ?? null;
  return {
    getUserMedia: () => devices.getUserMedia({ audio: true }),
    isTypeSupported: mime => MediaRecorder.isTypeSupported(mime),
    // MediaRecorder hands ondataavailable a whole BlobEvent; RecorderLike reads only its data, so this one boundary casts.
    makeRecorder: (stream: StreamLike, mime: string, bitsPerSecond: number) => new MediaRecorder(stream as MediaStream, { mimeType: mime, audioBitsPerSecond: bitsPerSecond }) as unknown as RecorderLike,
    timers: { setTimeout: (f, ms) => window.setTimeout(f, ms), clearTimeout: id => window.clearTimeout(id) },
    now: () => performance.now(),
    audioSession: session,
  };
}
