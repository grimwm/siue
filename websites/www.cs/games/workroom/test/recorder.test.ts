// Recording a spoken note or a hum: the first type the browser records wins
// (Safari records mp4), the microphone is asked for first thing in the tap, the
// audio session switches to play-and-record while recording, and a minute is the cap.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MIME_PREFERENCE, RECORDER_BITS_PER_SECOND, RECORDER_MESSAGES, RecorderProblem, createRecorder, pickMime, stopAfterLimit } from '../src/recorder.ts';
import type { BlobLike, MediaPorts, RecorderLike, Recording, StreamLike } from '../src/recorder.ts';

test('the first supported recording type wins', () => {
  assert.deepEqual([...MIME_PREFERENCE], ['audio/webm;codecs=opus', 'audio/mp4', 'audio/ogg;codecs=opus']);
  assert.equal(pickMime(() => true), 'audio/webm;codecs=opus');
  assert.equal(pickMime(m => m === 'audio/mp4'), 'audio/mp4', 'Safari');
  assert.equal(pickMime(() => false), null);
});

interface FakeRec extends RecorderLike { state: string; emit(bytes: number[]): void }
interface Fake { ports: MediaPorts; log: string[]; timers: { f: () => void; ms: number; id: number }[]; clock: { ms: number }; recorder: () => FakeRec; session: { type: string } }

function fake(opts: { supported?: (m: string) => boolean; deny?: string; breakAt?: 'make' | 'start' } = {}): Fake {
  const log: string[] = [];
  const timers: { f: () => void; ms: number; id: number }[] = [];
  const clock = { ms: 1000 };
  const session = { type: 'playback' };
  let made: FakeRec | null = null;
  const blob = (bytes: number[]): BlobLike => ({ size: bytes.length, arrayBuffer: async () => new Uint8Array(bytes).buffer });
  const stream: StreamLike = { getTracks: () => [{ stop: () => log.push('track stopped') }] };
  const ports: MediaPorts = {
    getUserMedia: () => {
      log.push(`getUserMedia (session ${session.type})`);
      return opts.deny ? Promise.reject(Object.assign(new Error('no'), { name: opts.deny })) : Promise.resolve(stream);
    },
    isTypeSupported: opts.supported ?? (m => m === 'audio/mp4'),
    makeRecorder: (_s, mime, bps) => {
      log.push(`recorder ${mime} ${bps}`);
      if (opts.breakAt === 'make') throw new Error('MediaRecorder refused');
      const r: FakeRec = {
        state: 'inactive', ondataavailable: null, onstop: null,
        start(slice?: number) { if (opts.breakAt === 'start') throw new Error('start refused'); r.state = 'recording'; log.push(`start ${slice}`); },
        stop() { r.state = 'inactive'; log.push('stop'); r.onstop?.(); },
        emit(bytes: number[]) { r.ondataavailable?.({ data: blob(bytes) }); },
      };
      made = r;
      return r;
    },
    timers: { setTimeout: (f, ms) => { timers.push({ f, ms, id: timers.length + 1 }); return timers.length; }, clearTimeout: id => { const i = timers.findIndex(t => t.id === id); if (i >= 0) timers.splice(i, 1); } },
    now: () => clock.ms,
    audioSession: session,
  };
  return { ports, log, timers, clock, recorder: () => made!, session };
}

test('stopAfterLimit fires once at 60 s unless cancelled', () => {
  const f = fake();
  let stopped = 0;
  stopAfterLimit(f.ports.timers, () => stopped++);
  assert.equal(f.timers[0]?.ms, 60_000);
  f.timers[0]!.f();
  assert.equal(stopped, 1);
  const cancel = stopAfterLimit(f.ports.timers, () => stopped++);
  cancel();
  assert.equal(f.timers.length, 1);
});

test('start asks for the microphone before anything else, with the session switched to play-and-record', async () => {
  const f = fake();
  const rec = createRecorder(f.ports, () => {});
  const started = rec.start();
  assert.deepEqual(f.log, ['getUserMedia (session play-and-record)'], 'asked synchronously, inside the tap');
  await started;
  assert.equal(rec.recording, true);
  f.recorder().emit([1, 2]);
  f.clock.ms += 7250;
  f.recorder().emit([3]);
  assert.equal(rec.elapsed(), 7.25);
  const r: Recording = await rec.stop();
  assert.deepEqual([r.mime, r.seconds, [...r.bytes]], ['audio/mp4', 7.25, [1, 2, 3]]);
  assert.equal(rec.recording, false);
  assert.equal(f.session.type, 'auto', 'the session is handed back after recording');
  assert.ok(f.log.includes('track stopped'), 'the microphone is released');
});

test('the cap stops the recording by itself and hands it on', async () => {
  const f = fake();
  let limited: Promise<Recording> | null = null;
  const rec = createRecorder(f.ports, r => { limited = r; });
  await rec.start();
  f.recorder().emit([9]);
  f.clock.ms += 61_000;
  f.timers[0]!.f();
  const r = await limited!;
  assert.equal(r.seconds, 60, 'never over the cap');
  assert.deepEqual([...r.bytes], [9]);
  assert.equal(await rec.stop(), r, 'a late Stop gets the same recording');
});

test('a recorder that will not start after the microphone was granted releases the microphone and the audio session', async () => {
  for (const breakAt of ['make', 'start'] as const) {
    const f = fake({ breakAt });
    const rec = createRecorder(f.ports, () => {});
    await assert.rejects(rec.start(), (e: unknown) => e instanceof RecorderProblem && e.message === RECORDER_MESSAGES.failed, breakAt);
    assert.ok(f.log.includes('track stopped'), `${breakAt}: the microphone is released`);
    assert.equal(f.session.type, 'auto', `${breakAt}: the audio session is handed back`);
    assert.equal(rec.recording, false);
    assert.equal(f.timers.length, 0, `${breakAt}: no cap timer is left running`);
  }
});

test('no recordable type, a refused microphone, and cancel', async () => {
  const none = fake({ supported: () => false });
  await assert.rejects(createRecorder(none.ports, () => {}).start(), (e: unknown) => e instanceof RecorderProblem && e.message === RECORDER_MESSAGES.unsupported);
  assert.deepEqual(none.log, [], 'the microphone is not asked for');
  const denied = fake({ deny: 'NotAllowedError' });
  await assert.rejects(createRecorder(denied.ports, () => {}).start(), (e: unknown) => e instanceof RecorderProblem && e.message === RECORDER_MESSAGES.denied);
  assert.equal(denied.session.type, 'auto');
  const f = fake();
  const rec = createRecorder(f.ports, () => {});
  await rec.start();
  rec.cancel();
  assert.equal(rec.recording, false);
  assert.equal(f.timers.length, 0, 'the cap timer is cleared');
  assert.ok(f.log.includes('track stopped'));
});

test('the recorder is asked for 64 kb/s', async () => {
  const f = fake();
  await createRecorder(f.ports, () => {}).start();
  assert.equal(RECORDER_BITS_PER_SECOND, 64_000);
  assert.ok(f.log.includes('recorder audio/mp4 64000'));
});

test('a microphone call that throws still hands the audio session back', async () => {
  const f = fake();
  f.ports.getUserMedia = () => { throw new TypeError('no mediaDevices'); };
  await assert.rejects(createRecorder(f.ports, () => {}).start(), (e: unknown) => e instanceof RecorderProblem && e.message === RECORDER_MESSAGES.failed);
  assert.equal(f.session.type, 'auto');
});
