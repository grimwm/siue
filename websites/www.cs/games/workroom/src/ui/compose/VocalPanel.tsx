// A Vocal Track: Record A Vocal sings over the piece after a one-bar count-in (the microphone is asked for only then),
// and each take is kept on this device as it is recorded, marked Only On This Device until Save To Studio sends it.
// Its clips are placed, trimmed, split, made louder or softer and faded; the take itself is never changed, and the
// part's Voice Effects and Sound apply on playback. A saved Perfect take can be made Good To The Ear to free room.
import { useEffect, useRef, useState } from 'preact/hooks';
import type { EditDoc, Part } from '../../compose/doc.ts';
import { decodeFlac } from '../../compose/flac.ts';
import type { OpusFile } from '../../compose/opus.ts';
import type { LocalTake, TakeStore } from '../../compose/takes.ts';
import { newTakeId } from '../../compose/takes.ts';
import { addTake, CLIP_GAIN, moveClip, pickTake, removeClip, renameTake, setClipFades, setClipGain, splitClip, trimClip } from '../../compose/vocal.ts';
import type { Recording, RecOptions } from '../../compose/vocalrec.ts';
import { humanBytes, takeFile } from '../../compose/vocalsave.ts';
import type { Quality } from '../../compose/vocalsave.ts';
import { Button } from '../console/Button.tsx';
import { Panel } from '../console/Panel.tsx';

/** What the page gives a Vocal Track: its takes on this device, the microphone, the encoders and the studio. */
export interface VocalPorts {
  takes: TakeStore;
  /** Starts recording (asking for the microphone now). */
  record(o: RecOptions): Promise<Recording>;
  opus(pcm: Int16Array, rate: number): Promise<OpusFile | null>;
  sha256(bytes: Uint8Array): Promise<string>;
  takeBytes(file: string): Promise<Uint8Array<ArrayBuffer>>;
  convert(from: string, to: string, bytes: Uint8Array<ArrayBuffer>): Promise<{ status: number; data: Record<string, unknown> }>;
  /** The quality Save To Studio picks first, from Your studio. */
  quality: Quality;
  /** The studio's room left, in bytes, when the page was drawn. */
  room: number;
}

export interface VocalPanelProps {
  doc: EditDoc;
  part: Part;
  piece: string;
  ports: VocalPorts;
  help: boolean;
  /** The other parts as sound from the start of the piece, or null to sing over clicks. */
  backing(): Promise<AudioBuffer | null>;
  /** Seconds a beat lasts at the start, beats in the first bar, and every beat's time in the piece. */
  beat: number;
  beats: number;
  clicks: readonly number[];
  apply(next: EditDoc): void;
  /** Changes the takes' names in the saved document too (a conversion changes every draft on the server). */
  renamed(from: string, to: string, seconds: number): void;
  status(text: string): void;
}

/** Clip `i` of `take` trimmed to start `from` seconds into it, and placed `at` seconds into the piece (a trim alone moves it). */
function placeTrimmed(doc: EditDoc, partId: string, i: number, take: string, from: number, to: number, at: number): EditDoc {
  const trimmed = trimClip(doc, partId, i, from, to);
  const j = trimmed.parts.find(x => x.id === partId)!.vocal!.clips.findIndex(c => c.take === take);
  return moveClip(trimmed, partId, j, at);
}

const sec = (x: number): string => `${Math.round(x * 100) / 100} s`;
const num = (e: Event): number => Number((e.target as HTMLInputElement).value);

export function VocalPanel(p: VocalPanelProps) {
  const [rec, setRec] = useState<'idle' | 'starting' | 'on'>('idle');
  const [level, setLevel] = useState(0);
  const [onDevice, setOnDevice] = useState<LocalTake[]>([]);
  const [confirm, setConfirm] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const running = useRef<{ r: Recording; take: LocalTake; writes: Promise<void> } | null>(null);
  const vocal = p.part.vocal!;

  const refresh = async (): Promise<void> => setOnDevice(await p.ports.takes.list(p.piece));
  useEffect(() => { void refresh(); }, [p.piece]);
  useEffect(() => () => { running.current?.r.stop(); }, []);

  const start = async (): Promise<void> => {
    setRec('starting');
    p.status('Getting the other parts ready…');
    let backing: AudioBuffer | null = null;
    try {
      backing = await p.backing();
    } catch (e) {
      p.status(`The other parts could not be built, so you will sing over clicks: ${e instanceof Error ? e.message : String(e)}`);
    }
    const take: LocalTake = { id: newTakeId(), piece: p.piece, name: `Take ${onDevice.length + vocal.takes.length + 1}`, made: new Date().toISOString(), rate: 48000, samples: 0 };
    let writes: Promise<void> = Promise.resolve();
    try {
      const r = await p.ports.record({
        backing, beat: p.beat, countIn: p.beats, clicks: p.clicks,
        onChunk: (seq, pcm) => { writes = writes.then(() => p.ports.takes.append(take.id, seq, pcm)); if (running.current) running.current.writes = writes; },
        onLevel: setLevel,
        onEnd: () => void stop(),
      });
      take.rate = r.rate;
      await p.ports.takes.begin(take);
      running.current = { r, take, writes };
      setRec('on');
      p.status('Counting in: one bar… then sing. Headphones help: otherwise the microphone hears the speakers.');
    } catch (e) {
      setRec('idle');
      p.status(`The microphone could not be used: ${e instanceof Error ? e.message : String(e)}`);
    }
  };

  const stop = async (): Promise<void> => {
    const run = running.current;
    if (!run) return;
    running.current = null;
    const where = run.r.stop();
    setRec('idle');
    setLevel(0);
    await run.writes;
    const seconds = Math.round((where.samples / run.r.rate) * 1000) / 1000;
    if (where.samples - where.from < run.r.rate * 0.05) {
      await p.ports.takes.remove(run.take.id);
      p.status('Nothing was recorded.');
      return;
    }
    const kept: LocalTake = { ...run.take, samples: where.samples, at: where.at, from: where.from / run.r.rate };
    await p.ports.takes.update(kept);
    let next = addTake(p.doc, p.part.id, { file: run.take.id, seconds }, where.at);
    const i = next.parts.find(x => x.id === p.part.id)!.vocal!.clips.findIndex(c => c.take === run.take.id);
    if (where.from > 0) next = placeTrimmed(next, p.part.id, i, run.take.id, where.from / run.r.rate, seconds, where.at);
    p.apply(next);
    await refresh();
    p.status(`${run.take.name} is kept on this device (${sec(seconds)}). Save To Studio sends it; Undo takes it out of the track.`);
  };

  /** A take on this device that the track does not have (after a reload): put it back where it was sung. */
  const putBack = (t: LocalTake): void => {
    const file = t.saved ?? t.id;
    const seconds = Math.round((t.samples / t.rate) * 1000) / 1000;
    let next = addTake(p.doc, p.part.id, { file, seconds }, t.at ?? 0);
    const i = next.parts.find(x => x.id === p.part.id)!.vocal!.clips.findIndex(c => c.take === file);
    if (t.from && i >= 0) next = placeTrimmed(next, p.part.id, i, file, t.from, seconds, t.at ?? 0);
    p.apply(next);
  };

  const convert = async (file: string): Promise<void> => {
    setConfirm(null);
    setBusy(file);
    p.status('Making the Good To The Ear copy…');
    try {
      const flac = await p.ports.takeBytes(file);
      const { pcm, rate } = decodeFlac(flac);
      const opus = await p.ports.opus(pcm, rate);
      if (!opus) { p.status('This browser cannot make Good To The Ear. Try Chrome, Edge or Firefox.'); return; }
      const to = takeFile(await p.ports.sha256(opus.bytes), opus.ext);
      const r = await p.ports.convert(file, to, opus.bytes as Uint8Array<ArrayBuffer>);
      if (r.status !== 200) {
        p.status(typeof r.data['message'] === 'string' ? r.data['message'] : `The take could not be converted (${String(r.data['error'] ?? r.status)}). It is unchanged.`);
        return;
      }
      const seconds = typeof r.data['seconds'] === 'number' ? r.data['seconds'] : pcm.length / rate;
      p.renamed(file, to, seconds);
      p.apply(renameTake(p.doc, file, to, seconds));
      p.status(`Converted: the take now takes ${humanBytes(opus.bytes.length)} instead of ${humanBytes(flac.length)}.`);
    } catch (e) {
      p.status(`The take could not be converted: ${e instanceof Error ? e.message : String(e)} It is unchanged.`);
    } finally {
      setBusy(null);
    }
  };

  const localName = (file: string): string => onDevice.find(t => t.id === file || t.saved === file)?.name ?? `Take ${vocal.takes.findIndex(t => t.file === file) + 1}`;
  const missing = onDevice.filter(t => !vocal.takes.some(x => x.file === t.id || x.file === t.saved) && t.samples > 0);
  const Help = (q: { children: string }) => (p.help ? <p class="border-l-2 border-amber pl-2 text-sm text-dim">{q.children}</p> : null);
  const field = 'min-h-11 w-24 rounded-md border border-rule bg-well px-2 font-mono text-ink';

  return (
    <Panel title="Vocal Track">
      <div class="grid gap-3" data-vocal-panel="">
        <div class="flex flex-wrap items-center gap-2">
          {rec === 'on'
            ? <Button variant="record" onClick={() => void stop()}>■ Stop</Button>
            : <Button variant="record" onClick={() => void start()} disabled={rec === 'starting'}>● Record A Vocal</Button>}
          <span class="h-3 w-32 overflow-hidden rounded-sm border border-rule bg-well" aria-hidden="true">
            <span data-level="" class="block h-full bg-amber" style={{ width: `${Math.round(Math.min(1, level) * 100)}%` }} />
          </span>
        </div>
        {p.ports.takes.memoryOnly() ? <p data-memory-only="" class="text-sm text-record">This browser is not keeping takes on this device, so they are lost if you leave or reload. Save them to your studio first.</p> : null}
        <Help>The piece plays after a one-bar count-in and you sing over it. Wear headphones if you can. Each take stays on this device until you save, and your voice is kept exactly as sung: Voice Effects and Sound change only how it plays.</Help>

        <h3 class="font-display text-sm font-semibold uppercase tracking-wide">Takes</h3>
        <ul class="grid gap-2">
          {vocal.takes.map(t => {
            const local = t.file.startsWith('local-');
            return (
              <li data-take={t.file} class="flex flex-wrap items-center gap-2 rounded-md border border-rule px-3 py-2">
                <span class="font-semibold">{localName(t.file)}</span>
                <span class="font-mono text-xs text-dim">{sec(t.seconds)}</span>
                <span data-where="" class={local ? 'rounded-sm bg-amber px-1 text-xs text-on-accent' : 'rounded-sm border border-rule px-1 text-xs text-dim'}>
                  {local ? 'Only On This Device' : t.file.endsWith('.flac') ? 'In Your Studio · Perfect' : 'In Your Studio · Good To The Ear'}</span>
                {!local && t.file.endsWith('.flac') ? (confirm === t.file ? (
                  <span class="flex flex-wrap items-center gap-2 text-sm">
                    <span data-convert-warning="">This keeps a smaller copy that sounds the same to the ear, and deletes the Perfect one. It cannot be undone.</span>
                    <Button onClick={() => void convert(t.file)}>Convert</Button>
                    <Button variant="ghost" onClick={() => setConfirm(null)}>Keep Perfect</Button>
                  </span>
                ) : <Button onClick={() => setConfirm(t.file)} disabled={busy !== null}>{busy === t.file ? 'Converting…' : 'Convert To Good To The Ear'}</Button>) : null}
              </li>
            );
          })}
        </ul>
        {missing.length ? (
          <div class="grid gap-2">
            <p class="text-sm text-dim">On this device but not in the track:</p>
            {missing.map(t => (
              <div data-device-take={t.id} class="flex flex-wrap items-center gap-2">
                <span>{t.name}</span><span class="font-mono text-xs text-dim">{sec(t.samples / t.rate)}</span>
                <Button onClick={() => putBack(t)}>Add To The Track</Button>
                <Button variant="ghost" onClick={() => void p.ports.takes.remove(t.id).then(refresh)}>Delete From This Device</Button>
              </div>
            ))}
          </div>
        ) : null}

        <h3 class="font-display text-sm font-semibold uppercase tracking-wide">Clips</h3>
        {vocal.clips.length === 0 ? <p class="text-sm text-dim">No clips: record a vocal, or add a take back.</p> : null}
        <ul class="grid gap-3">
          {vocal.clips.map((c, i) => (
            <li data-clip={i} class="grid gap-2 rounded-md border border-rule p-3">
              <div class="flex flex-wrap items-end gap-2 text-sm">
                <label class="grid gap-1">Take
                  <select class="min-h-11 rounded-md border border-rule bg-well px-2 text-ink" value={c.take} onChange={e => p.apply(pickTake(p.doc, p.part.id, i, (e.target as HTMLSelectElement).value))}>
                    {vocal.takes.map(t => <option value={t.file}>{localName(t.file)}</option>)}
                  </select></label>
                <label class="grid gap-1">Starts At (s)<input type="number" step="0.01" min="0" class={field} value={c.at} data-clip-at="" onChange={e => p.apply(moveClip(p.doc, p.part.id, i, num(e)))} /></label>
                <label class="grid gap-1">From (s)<input type="number" step="0.01" min="0" class={field} value={c.from} data-clip-from="" onChange={e => p.apply(trimClip(p.doc, p.part.id, i, num(e), c.to))} /></label>
                <label class="grid gap-1">To (s)<input type="number" step="0.01" min="0" class={field} value={c.to} data-clip-to="" onChange={e => p.apply(trimClip(p.doc, p.part.id, i, c.from, num(e)))} /></label>
              </div>
              <div class="flex flex-wrap items-end gap-2 text-sm">
                <label class="grid gap-1">Volume (dB)<input type="number" step="0.5" min={CLIP_GAIN[0]} max={CLIP_GAIN[1]} class={field} value={c.gain_db} data-clip-gain="" onChange={e => p.apply(setClipGain(p.doc, p.part.id, i, num(e)))} /></label>
                <label class="grid gap-1">Fade In (s)<input type="number" step="0.05" min="0" class={field} value={c.fade_in} onChange={e => p.apply(setClipFades(p.doc, p.part.id, i, num(e), c.fade_out))} /></label>
                <label class="grid gap-1">Fade Out (s)<input type="number" step="0.05" min="0" class={field} value={c.fade_out} onChange={e => p.apply(setClipFades(p.doc, p.part.id, i, c.fade_in, num(e)))} /></label>
                <Button onClick={() => p.apply(splitClip(p.doc, p.part.id, i, c.at + (c.to - c.from) / 2))}>Split In Half</Button>
                <Button variant="ghost" onClick={() => p.apply(removeClip(p.doc, p.part.id, i))}>Remove Clip</Button>
              </div>
            </li>
          ))}
        </ul>
        <Help>Starts At places the clip in the piece. From and To trim it to part of its take. Split In Half makes two clips you can move apart. Undo goes back through every change.</Help>
      </div>
    </Panel>
  );
}
