// The answer bar under the player: Pin a note, Hum it, React and Draw the
// energy; and what became of the last note sent. Notes are sealed to the
// unlocked keyring's key, so before an unlock each button asks for it
// (onLocked) and opens nothing; with no keyring on the server the bar says
// notes are off. What needs the owner's attention right now sits in the dock,
// fixed at the bottom of a phone's screen above the notes handle (in the
// page's flow from 1024 px): the Stop button of a recording, a recording kept
// but not yet stored, and the pin composer. A recording starts inside the tap
// (the recorder asks for the microphone before anything awaits) and is shown
// as recording only once the microphone is granted. Switching to another mode
// or cancelling the composer while recording stops the recording and keeps
// it, to Send or Discard; switching while the microphone is still being asked
// for abandons the request.
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { humNote, recordClock, reactNote, speechNote, textNote, wholePiece } from '../answer.ts';
import type { Context } from '../answer.ts';
import { sectionAt } from '../hit.ts';
import type { Span } from '../hit.ts';
import type { NoteBody } from '../note.ts';
import { RECORDER_MESSAGES, RecorderProblem, createRecorder } from '../recorder.ts';
import type { MediaPorts, Recording } from '../recorder.ts';
import type { Score } from '../score.ts';
import type { TempoMap } from '../tempo.ts';
import { Button } from './console/Button.tsx';
import { PinComposer } from './PinComposer.tsx';
import { ReactBar } from './ReactBar.tsx';
import { RecordButton } from './RecordButton.tsx';

export type AnswerMode = 'none' | 'pin' | 'react' | 'energy';
/** What a tap before an unlock asked for. */
export type Asked = Exclude<AnswerMode, 'none'> | 'hum';
export const NOTES_OFF = 'Notes are off until a notes key is uploaded (make music-setup).';
/** After an unlock that Hum it asked for: iOS grants the microphone only inside a tap, so the recording waits for the next one. */
export const HUM_AFTER_UNLOCK = 'Unlocked. Tap Hum it to start recording.';
export interface AnswerBarProps {
  score: Score; tempo: TempoMap; version: number; time: number; span: Span | null;
  mode: AnswerMode; onMode(m: AnswerMode): void;
  /** off: the server holds no keyring; locked: a tap asks for the unlock (onLocked) instead; open: notes can be sealed. */
  access: 'off' | 'locked' | 'open';
  onLocked(asked: Asked): void;
  media: MediaPorts | null; now(): Date; busy: boolean;
  /** Seals and stores the note; true once it is stored (sent, or kept on this device), false when it is not. */
  send(body: NoteBody, audio: Uint8Array<ArrayBuffer> | null): Promise<boolean>;
  say(message: string): void;
  status: string | null;
}

type Kind = 'speech' | 'hum';
/** A recording that is made but not stored yet, with where in the piece it was made. */
interface Held { kind: Kind; recording: Recording; at: { time: number; bar: number | null; laneId: string | null } | null; span: Span | null }
const messageOf = (e: unknown): string => (e instanceof Error && e.message ? e.message : RECORDER_MESSAGES.failed);
/** A recording abandoned before the microphone answered is what the owner asked for, not a problem to report. */
const cancelled = (e: unknown): boolean => e instanceof RecorderProblem && e.message === RECORDER_MESSAGES.cancelled;

export function AnswerBar(p: AnswerBarProps) {
  const live = useRef(p);
  live.current = p;
  const [recording, setRecording] = useState<Kind | null>(null);
  const [asking, setAsking] = useState(false);
  const [held, setHeld] = useState<Held | null>(null);
  const [seconds, setSeconds] = useState(0);
  const kind = useRef<Kind | null>(null);
  const humAt = useRef<Held['at']>(null);
  const spanAt = useRef<Span | null>(null);
  const lastMode = useRef(p.mode);
  const ctx = (): Context => ({ piece: live.current.score.piece.id, draft: live.current.version, now: live.current.now });
  const bodyOf = (h: Held): NoteBody => (h.kind === 'hum' ? humNote(ctx(), h.at!, h.recording) : speechNote(ctx(), h.span!, h.recording));
  /** Stores a recording; one that cannot be stored stays held, to try again or discard. */
  const store = async (h: Held): Promise<void> => {
    try {
      const stored = await live.current.send(bodyOf(h), h.recording.bytes);
      setHeld(stored ? null : h);
    } catch (e) {
      live.current.say(messageOf(e));
      setHeld(h);
    }
  };
  const finish = async (k: Kind, rec: Promise<Recording>, keepOnly: boolean): Promise<void> => {
    setRecording(null);
    try {
      const h: Held = { kind: k, recording: await rec, at: humAt.current, span: spanAt.current };
      if (keepOnly) setHeld(h); else await store(h);
    } catch (e) {
      if (!cancelled(e)) live.current.say(messageOf(e));
    }
  };
  const recorder = useMemo(() => (p.media ? createRecorder(p.media, r => { const k = kind.current; if (k) void finish(k, r, false); }) : null), [p.media]);
  useEffect(() => () => recorder?.cancel(), [recorder]);
  useEffect(() => {
    if (!recording || !recorder) return;
    const id = setInterval(() => setSeconds(recorder.elapsed()), 250);
    return () => clearInterval(id);
  }, [recording, recorder]);
  // Moving to another mode must not leave a microphone open with nothing on screen to stop it: a recording is stopped and kept, a request still being answered is abandoned.
  useEffect(() => {
    const changed = lastMode.current !== p.mode;
    lastMode.current = p.mode;
    if (!changed || !recorder) return;
    const k = kind.current;
    if (k && recorder.recording) void finish(k, recorder.stop(), true);
    else if (asking) recorder.cancel();
  }, [p.mode]);

  /** Runs inside the tap: the recorder asks for the microphone before anything awaits. The bar shows a recording only once the microphone is granted. */
  const start = (k: Kind): void => {
    if (!recorder || recording || asking || held) return;
    kind.current = k;
    humAt.current = { time: p.time, bar: p.tempo.barAt(p.time), laneId: p.span?.laneId ?? null };
    spanAt.current = p.span;
    setAsking(true);
    recorder.start().then(() => { setAsking(false); setSeconds(0); setRecording(recorder.recording ? k : null); }, (e: unknown) => {
      setAsking(false);
      if (!cancelled(e)) live.current.say(e instanceof RecorderProblem ? e.message : RECORDER_MESSAGES.failed);
    });
  };
  const stop = (): void => {
    const k = kind.current;
    if (recorder && k) void finish(k, recorder.stop(), false);
  };
  const locked = p.access === 'locked';
  /** Closing an open mode needs no unlock; opening one before an unlock asks for it. */
  const toggle = (m: Exclude<AnswerMode, 'none'>): void => (p.mode === m ? p.onMode('none') : locked ? p.onLocked(m) : p.onMode(m));

  if (p.access === 'off') return <p data-answer-off="" class="text-sm text-dim">{NOTES_OFF}</p>;
  const section = sectionAt(p.score, p.tempo, p.time);
  const target = section ?? wholePiece(p.score);
  const laneId = p.span?.laneId ?? null;
  const laneName = laneId ? p.score.lanes.find(l => l.id === laneId)?.name ?? null : null;
  const sendText = async (text: string): Promise<boolean> => {
    try { return await p.send(textNote(ctx(), p.span!, text), null); } catch (e) { p.say(messageOf(e)); return false; }
  };
  const docked = recording !== null || held !== null || p.mode === 'pin';
  return (
    <div data-answer-bar="" class="grid gap-3">
      <div role="group" aria-label="Answer" class="flex flex-wrap gap-2">
        <Button pressed={p.mode === 'pin'} onClick={() => toggle('pin')}>Pin a note</Button>
        {recorder ? <RecordButton recording={false} seconds={0} disabled={recording !== null || asking || held !== null || p.busy} onStart={() => (locked ? p.onLocked('hum') : start('hum'))} onStop={stop} /> : null}
        <Button pressed={p.mode === 'react'} onClick={() => toggle('react')}>React</Button>
        <Button pressed={p.mode === 'energy'} onClick={() => toggle('energy')}>Draw the energy</Button>
      </div>
      {docked ? (
        <div data-answer-dock="" class="fixed inset-x-0 bottom-11 z-10 grid max-h-[40dvh] gap-2 overflow-y-auto bg-ground px-3 pt-2 pb-2 lg:static lg:z-auto lg:max-h-none lg:overflow-visible lg:bg-transparent lg:p-0">
          {recording ? (
            <div data-recording-strip="" class="sticky top-0 flex flex-wrap items-center gap-3 rounded-lg border border-record bg-panel p-3">
              <RecordButton recording seconds={seconds} onStart={() => {}} onStop={stop} />
              <span class="text-sm">{recording === 'hum' ? 'Humming at the playhead.' : 'Recording your note.'}</span>
            </div>
          ) : null}
          {held ? (
            <div data-held-recording="" role="group" aria-label="Recording not sent" class="grid gap-2 rounded-lg border border-amber bg-panel p-3">
              <p class="text-sm">{`A ${recordClock(held.recording.seconds)} recording is waiting here, not sent yet.`}</p>
              <div class="flex flex-wrap gap-2">
                <Button variant="primary" disabled={p.busy} onClick={() => void store(held)}>Send recording</Button>
                <Button disabled={p.busy} onClick={() => setHeld(null)}>Discard recording</Button>
              </div>
            </div>
          ) : null}
          {p.mode === 'pin' ? <PinComposer span={p.span} laneName={laneName} recording={recording === 'speech' || (asking && kind.current === 'speech')} canRecord={recorder !== null && held === null} busy={p.busy || asking} status={p.status}
            onSend={sendText} onRecord={() => start('speech')} onCancel={() => p.onMode('none')} /> : null}
        </div>
      ) : null}
      {p.mode === 'react' ? <ReactBar section={target} whole={section === null} busy={p.busy}
        onReact={r => void p.send(reactNote(ctx(), target, p.tempo, p.score.duration, r), null)} /> : null}
      {p.mode !== 'pin' ? <p role="status" data-answer-status="" class="min-h-5 text-sm">{p.status ?? ''}</p> : null}
    </div>
  );
}
