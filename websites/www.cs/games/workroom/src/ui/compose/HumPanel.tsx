// Hum: sing or hum and the voice becomes notes. Record With Mic asks for the microphone only when tapped; Play The Demo
// Hum shows the same without one; Upload A Recording reads an audio file. Everything is heard and read in the page:
// no sound is kept or sent anywhere, only the notes it makes go into the part. The three stages show what happened:
// 1 · Your Voice (the pitch line), 2 · Snap To Notes and 3 · Note Blocks; Add To The Part puts them in, one Undo step.
import type { ComponentChildren } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import { analyseHum, HUM_PLACES, HUM_SNAPS, humDemo, snapSegment } from '../../compose/hum.ts';
import type { HumPlace, HumSegment, HumSnap } from '../../compose/hum.ts';
import { GRID_LABELS, GRIDS } from '../../compose/snap.ts';
import type { Grid } from '../../compose/snap.ts';
import { pitchName } from '../../pianoroll.ts';
import { Button } from '../console/Button.tsx';

/** Mono samples and their rate. */
export interface Heard { samples: Float32Array; rate: number }
/** A recording in progress: stop it to hear what it caught, or cancel it. Either way the microphone is let go. */
export interface MicTake { stop(): Promise<Heard>; cancel(): void }
export interface HumPorts {
  /** Starts recording from the microphone (asking for it now); `level` hears its loudness as it records. Absent: no microphone here. */
  record?(level: (rms: number) => void): Promise<MicTake>;
  /** An audio file's samples, decoded in the page. */
  decode(bytes: ArrayBuffer): Promise<Heard>;
  /** Plays samples (the demo hum) through the page's sound. */
  play(h: Heard): void;
}

/** The longest hum read, in seconds; a longer recording or file is read to here. */
export const HUM_SECONDS = 60;
/** The largest audio file read. */
export const HUM_FILE_BYTES = 30 * 1024 * 1024;

export interface HumPanelProps {
  ports: HumPorts;
  snap: HumSnap;
  onSnap(s: HumSnap): void;
  place: HumPlace;
  onPlace(p: HumPlace): void;
  tidy: Grid;
  onTidy(g: Grid): void;
  /** The piece's key, for Friendly Notes. */
  keyName: string;
  classes: readonly number[];
  onAdd(segs: HumSegment[]): void;
  help: boolean;
}

type Stage = 'idle' | 'asking' | 'recording' | 'reading' | 'ready';

export function HumPanel(p: HumPanelProps) {
  const [stage, setStage] = useState<Stage>('idle');
  const [segs, setSegs] = useState<HumSegment[]>([]);
  const [level, setLevel] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [message, setMessage] = useState('');
  const take = useRef<MicTake | null>(null);
  const file = useRef<HTMLInputElement>(null);

  // Leaving the page (or this panel) lets the microphone go.
  useEffect(() => {
    const leave = (): void => { take.current?.cancel(); take.current = null; };
    window.addEventListener('pagehide', leave);
    return () => { window.removeEventListener('pagehide', leave); leave(); };
  }, []);

  const read = (h: Heard, from: string): void => {
    setStage('reading');
    setMessage(`Reading ${from}…`);
    // A moment for the page to show it is reading before the work starts.
    setTimeout(() => {
      const most = Math.min(h.samples.length, Math.round(h.rate * HUM_SECONDS));
      const found = analyseHum(h.samples.subarray(0, most), h.rate);
      setSegs(found);
      setStage('ready');
      setMessage(found.length === 0
        ? `No notes were heard in ${from}. Hum a little louder, one note at a time, close to the microphone.`
        : `${found.length} ${found.length === 1 ? 'note' : 'notes'} heard in ${from}${h.samples.length > most ? ` (the first ${HUM_SECONDS} seconds)` : ''}.`);
    }, 30);
  };

  const record = async (): Promise<void> => {
    if (!p.ports.record) return;
    setStage('asking');
    setMessage('Asking the browser for the microphone…');
    try {
      const t = await p.ports.record(setLevel);
      take.current = t;
      setStage('recording');
      setSeconds(0);
      setMessage('');
    } catch (e) {
      setStage('idle');
      setMessage(e instanceof DOMException && (e.name === 'NotAllowedError' || e.name === 'SecurityError')
        ? 'The microphone was not allowed, so nothing was recorded. Play The Demo Hum, Upload A Recording and the keys all still work.'
        : `The microphone could not be used: ${e instanceof Error ? e.message : String(e)} The other ways in still work.`);
    }
  };
  const stop = async (): Promise<void> => {
    const t = take.current;
    take.current = null;
    if (!t) return;
    setLevel(0);
    try {
      read(await t.stop(), 'your hum');
    } catch (e) {
      setStage('idle');
      setMessage(`The recording could not be read: ${e instanceof Error ? e.message : String(e)}`);
    }
  };
  // The clock while recording, and its stop at the longest.
  useEffect(() => {
    if (stage !== 'recording') return;
    const began = performance.now();
    const timer = setInterval(() => {
      const s = (performance.now() - began) / 1000;
      setSeconds(s);
      if (s >= HUM_SECONDS) void stop();
    }, 200);
    return () => clearInterval(timer);
  }, [stage]);

  const demo = (): void => {
    const h = { samples: humDemo(44100), rate: 44100 };
    p.ports.play(h);
    read(h, 'the demo hum');
  };
  const upload = async (f: File): Promise<void> => {
    if (f.size > HUM_FILE_BYTES) { setMessage(`${f.name} is larger than ${HUM_FILE_BYTES / 1024 / 1024} MB; a hum of a minute is far smaller.`); return; }
    setStage('reading');
    setMessage(`Opening ${f.name}…`);
    try {
      read(await p.ports.decode(await f.arrayBuffer()), f.name);
    } catch {
      setStage('idle');
      setMessage(`${f.name} could not be opened as sound. Try a WAV, MP3, M4A, OGG or WebM recording.`);
    }
  };

  const busy = stage === 'asking' || stage === 'recording' || stage === 'reading';
  const snapped = segs.map(s => snapSegment(s, p.snap, p.classes));
  return (
    <div data-hum="" class="grid gap-2">
      <div class="flex flex-wrap items-center gap-2">
        {stage === 'recording'
          ? <Button variant="record" onClick={() => void stop()} data={{ 'data-hum-stop': '' }}>■ Stop · {Math.floor(seconds)} s</Button>
          : <Button variant="record" onClick={() => void record()} disabled={busy || !p.ports.record}>● Record With Mic</Button>}
        <Button onClick={demo} disabled={busy}>Play The Demo Hum</Button>
        <Button onClick={() => file.current?.click()} disabled={busy}>Upload A Recording</Button>
        <input ref={file} type="file" accept="audio/*" class="hidden" data-hum-file="" aria-label="Upload A Recording"
          onChange={e => { const f = (e.target as HTMLInputElement).files?.[0]; (e.target as HTMLInputElement).value = ''; if (f) void upload(f); }} />
        <span aria-hidden="true" class="h-2 w-24 overflow-hidden rounded-full bg-lane"><span class="block h-full bg-go" style={{ width: `${Math.min(100, level * 400)}%` }} /></span>
      </div>
      <div class="flex flex-wrap items-center gap-1">
        <span class="text-sm">Hum Snaps To</span>
        {HUM_SNAPS.map(s => <Button pressed={p.snap === s.id} onClick={() => p.onSnap(s.id)} data={{ 'data-hum-snap': s.id }}>{s.id === 'friendly' ? `${s.label} (${p.keyName})` : s.label}</Button>)}
      </div>
      <div class="flex flex-wrap items-center gap-1">
        <span class="text-sm">Where Hummed Notes Go</span>
        {HUM_PLACES.map(s => <Button pressed={p.place === s.id} onClick={() => p.onPlace(s.id)} data={{ 'data-hum-place': s.id }}>{s.label}</Button>)}
      </div>
      <div class="flex flex-wrap items-center gap-1">
        <span class="text-sm">Tidy To</span>
        {GRIDS.map(g => <Button pressed={p.tidy === g} onClick={() => p.onTidy(g)}>{GRID_LABELS[g]}</Button>)}
      </div>
      {p.help ? (
        <p class="border-l-2 border-amber pl-2 text-sm text-dim">
          Hum or sing one note at a time; a breath or a new pitch starts the next note. Friendly Notes keeps to the piece's key, All 12 Notes takes the nearest note, and Exact Pitch keeps your slides and in-between notes in the picture (the saved notes keep each one's main pitch). Your voice is heard only in this page and is never kept or sent: only the notes go into the part. At The Dashed Line puts them where you drag the line on the grid.
        </p>
      ) : null}
      <p data-hum-message="" role="status" class="h-10 overflow-hidden text-sm">{message}</p>
      <HumStages segs={segs} snapped={snapped} snap={p.snap} />
      <div class="flex flex-wrap gap-2">
        <Button variant="primary" onClick={() => { p.onAdd(segs); setMessage(`Added ${segs.length} ${segs.length === 1 ? 'note' : 'notes'}. Undo takes them back.`); }} disabled={stage !== 'ready' || segs.length === 0}>Add To The Part</Button>
        {stage === 'ready' && segs.length ? <span data-hum-notes="" class="self-center font-mono text-xs text-dim">{snapped.map(s => pitchName(s.pitch)).join(' ')}</span> : null}
      </div>
    </div>
  );
}

/** The three stages, each a fixed-height picture so nothing moves as they fill. */
function HumStages(q: { segs: readonly HumSegment[]; snapped: readonly { pitch: number; bend: [number, number][] | null }[]; snap: HumSnap }) {
  const W = 600;
  const H = 90;
  const t0 = q.segs[0]?.start ?? 0;
  const t1 = Math.max(t0 + 1, ...q.segs.map(s => s.end));
  const all = q.segs.flatMap(s => s.curve.map(([, m]) => m)).concat(q.snapped.map(s => s.pitch));
  const lo = Math.floor(Math.min(...all, 60)) - 2;
  const hi = Math.ceil(Math.max(...all, 64)) + 2;
  const x = (t: number): number => ((t - t0) / (t1 - t0)) * (W - 8) + 4;
  const y = (m: number): number => H - 6 - ((m - lo) / (hi - lo)) * (H - 12);
  const voice = q.segs.map(s => <polyline fill="none" stroke="currentColor" stroke-width="2" points={s.curve.map(([t, m]) => `${x(t).toFixed(1)},${y(m).toFixed(1)}`).join(' ')} />);
  const box = (title: string, body: ComponentChildren, data: string) => (
    <figure class="grid gap-1" {...{ [data]: '' }}>
      <figcaption class="font-display text-xs font-semibold tracking-wide uppercase text-dim">{title}</figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} class="h-[90px] w-full rounded-md border border-rule bg-well" preserveAspectRatio="none" role="img" aria-label={title}>{body}</svg>
    </figure>
  );
  return (
    <div class="grid gap-2 sm:grid-cols-3">
      {box('1 · Your Voice', <g class="text-amber">{voice}</g>, 'data-hum-voice')}
      {box('2 · Snap To Notes', <g>
        <g class="text-dim opacity-60">{voice}</g>
        {q.segs.map((s, i) => q.snap === 'exact' && q.snapped[i]!.bend
          ? <polyline class="text-go" fill="none" stroke="currentColor" stroke-width="2" points={q.snapped[i]!.bend!.map(([t, c]) => `${x(s.start + t).toFixed(1)},${y(q.snapped[i]!.pitch + c / 100).toFixed(1)}`).join(' ')} />
          : <line class="text-go" stroke="currentColor" stroke-width="3" x1={x(s.start)} x2={x(s.end)} y1={y(q.snapped[i]!.pitch)} y2={y(q.snapped[i]!.pitch)} />)}
      </g>, 'data-hum-snapped')}
      {box('3 · Note Blocks', <g>
        {q.segs.map((s, i) => <rect class="text-amber" fill="currentColor" rx="2" x={x(s.start)} width={Math.max(2, x(s.end) - x(s.start) - 2)} y={y(q.snapped[i]!.pitch) - 4} height="8" />)}
      </g>, 'data-hum-blocks')}
    </div>
  );
}
