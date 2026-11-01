// The composer: one piece's parts, the selected part's notes on the editing grid, three ways to put notes in (Play
// Live, Step, Grid), Undo and Redo over every edit, hearing the part alone or with the piece, and Save Draft. It holds
// the page's state and wires the DOM-free modules (compose/) to the keys, the grid and the sound. While any key is
// held the page is pinned where it is (compose/scrollpin.ts), and every readout keeps a fixed height, so nothing
// moves under the player.
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import type { Entry } from '../../catalogue.ts';
import { rangeClass, writtenPitch } from '../../catalogue.ts';
import { beatClock } from '../../compose/beats.ts';
import { barsNeeded, scoreFromDoc } from '../../compose/doc.ts';
import type { EditDoc, Part } from '../../compose/doc.ts';
import { addNotes, addPart, clearPart, moveIntoRange, moveNote, recolourPart, removeNotes, removePart, renamePart, resizeNote, setInstrument } from '../../compose/edit.ts';
import { createHistory } from '../../compose/history.ts';
import { keyboardStart, OCTAVE_DOWN, OCTAVE_UP, pitchForKey } from '../../compose/keys.ts';
import { createLiveTake } from '../../compose/live.ts';
import type { LiveTake } from '../../compose/live.ts';
import { saveScore } from '../../compose/save.ts';
import type { Sampler } from '../../compose/sampler.ts';
import { pinScroll } from '../../compose/scrollpin.ts';
import { GRID_LABELS, GRIDS } from '../../compose/snap.ts';
import type { Grid } from '../../compose/snap.ts';
import { createChordGather, createStepCursor, STEP_LENGTHS, stepBeats } from '../../compose/step.ts';
import type { StepLength } from '../../compose/step.ts';
import { guardLeaving } from '../../leave.ts';
import type { PageApi } from '../../api.ts';
import { pitchName } from '../../pianoroll.ts';
import type { BuildSound } from '../../render/sound.ts';
import type { Score } from '../../score.ts';
import { Button } from '../console/Button.tsx';
import { cx } from '../console/cx.ts';
import { Panel } from '../console/Panel.tsx';
import { EditGrid } from './EditGrid.tsx';
import { Icon, InstrumentPicker, rangeWords } from './InstrumentPicker.tsx';
import { Keyboard } from './Keyboard.tsx';

export type Mode = 'live' | 'step' | 'grid';
export const MODES: readonly { id: Mode; label: string; icon: string; help: string }[] = [
  { id: 'live', label: 'Play Live', icon: 'keys', help: 'Play the keys: a key held down sets the note\'s length, as on a piano. Recording starts on your first note and stops after a bar of quiet.' },
  { id: 'step', label: 'Step', icon: 'pitched', help: 'Pick a length, then press a key (or several together for a chord). The note goes in at the dashed line, which moves on.' },
  { id: 'grid', label: 'Grid', icon: 'keys', help: 'Tap an empty square to add a note of the length picked. Drag a note to move it; drag its right end to make it longer or shorter.' },
];

export interface ComposerStart {
  doc: EditDoc;
  /** The piece's id and title; for a new piece, the id it will be saved under. */
  piece: { id: string; title: string };
  project: { id: string; name: string };
  /** The draft the editor opened (0 for a new piece); Save Draft makes the next one. */
  version: number;
}

export interface ComposerProps {
  start: ComposerStart;
  entries: readonly Entry[];
  api: Pick<PageApi, 'saveDraft'>;
  sampler: Sampler;
  buildSound: BuildSound;
  /** Seconds, from any steady clock. */
  now(): number;
  /** A metronome click (count-in); absent where the page has no sound. */
  click?(accent: boolean): void;
  onSaved?(piece: string, version: number): void;
}

const isTyping = (t: EventTarget | null): boolean =>
  t instanceof HTMLElement && (t.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName));

export function Composer(p: ComposerProps) {
  const history = useMemo(() => createHistory(p.start.doc), []);
  const [doc, setDoc] = useState<EditDoc>(p.start.doc);
  const [savedDoc, setSavedDoc] = useState<EditDoc>(p.start.doc);
  const [version, setVersion] = useState(p.start.version);
  const [partId, setPartId] = useState<string | null>(p.start.doc.parts[0]?.id ?? null);
  const [mode, setMode] = useState<Mode>('live');
  const [tidy, setTidy] = useState<Grid>('1/8');
  const [lineUp, setLineUp] = useState<Grid>('1/8');
  const [length, setLength] = useState<StepLength>('quarter');
  const [dotted, setDotted] = useState(false);
  const [selected, setSelected] = useState<ReadonlySet<number>>(new Set());
  const [armed, setArmed] = useState<number | null>(null);
  const [held, setHeld] = useState<ReadonlySet<number>>(new Set());
  const [keysFrom, setKeysFrom] = useState<number | null>(null);
  const [picking, setPicking] = useState<'add' | 'change' | null>(p.start.doc.parts.length === 0 ? 'add' : null);
  const [help, setHelp] = useState(true);
  const [fill, setFill] = useState(false);
  const [countIn, setCountIn] = useState(false);
  const [recording, setRecording] = useState<'idle' | 'counting' | 'on'>('idle');
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const [listening, setListening] = useState<{ what: 'piece' | 'part'; state: string } | null>(null);
  const [playhead, setPlayhead] = useState<number | null>(null);
  const [stepAt, setStepAt] = useState(0);

  const part: Part | null = doc.parts.find(x => x.id === partId) ?? null;
  const entry: Entry | null = part ? p.entries.find(e => e.id === part.instrument) ?? null : null;
  const bars = barsNeeded(doc);
  const clock = useMemo(() => beatClock(doc.tempo), [doc.tempo]);
  const quarter = clock.quarter(1);
  const bpm = clock.tempoAt(1).bpm;
  const start = keysFrom ?? (entry ? keyboardStart(entry) : 48);
  const dirty = doc !== savedDoc;

  // Mutable state the key and timer handlers read without re-subscribing.
  const live = useRef<{ take: LiveTake | null; handles: Map<number, number> }>({ take: null, handles: new Map() });
  const step = useMemo(() => createStepCursor(0), []);
  const gather = useMemo(() => createChordGather(() => bpm), [bpm]);
  const pin = useMemo(() => pinScroll(window), []);
  const audio = useRef<HTMLAudioElement | null>(null);
  const state = useRef({ doc, part, entry, mode, tidy, quarter, bpm, start, dotted, length, selected });
  state.current = { doc, part, entry, mode, tidy, quarter, bpm, start, dotted, length, selected };

  const apply = (next: EditDoc): void => {
    history.push(next);
    setDoc(history.now());
  };
  const undo = (): void => { setDoc(history.undo()); setSelected(new Set()); setArmed(null); };
  const redo = (): void => { setDoc(history.redo()); setSelected(new Set()); setArmed(null); };

  useEffect(() => () => pin.dispose(), [pin]);
  useEffect(() => guardLeaving(window, () => state.current.doc !== savedRef.current), []);
  const savedRef = useRef(savedDoc);
  savedRef.current = savedDoc;
  // Step's cursor follows the part: the end of its notes when the part or the mode changes.
  useEffect(() => {
    const end = part ? Math.max(0, ...part.notes.map(n => n.start + n.length)) : 0;
    step.moveTo(end);
    setStepAt(step.cursor());
  }, [partId, mode]);
  useEffect(() => { if (entry) void p.sampler.ready(entry.id); }, [entry?.id]);

  // ---- Play Live ----
  const commitTake = (): void => {
    const take = live.current.take;
    live.current.take = null;
    setRecording('idle');
    const s = state.current;
    if (!take || !take.started() || !s.part) return;
    const notes = take.notes(s.tidy, s.quarter, p.now());
    const added = addNotes(s.doc, s.part.id, notes);
    apply(added.doc);
    setStatus(`Recorded ${notes.length} ${notes.length === 1 ? 'note' : 'notes'}. Undo takes them back.`);
  };
  const newTake = (at: number | null): LiveTake => {
    const s = state.current;
    const end = s.part ? Math.max(0, ...s.part.notes.map(n => n.start + n.length)) : 0;
    const bar = end === 0 ? 1 : clock.barOfBeat(end - 1e-9) + 1;
    const take = createLiveTake({ startBeat: clock.barStartBeat(bar), bpm: s.bpm, beatsPerBar: clock.tempoAt(bar).beats });
    if (at !== null) take.begin(at);
    live.current.take = take;
    return take;
  };
  useEffect(() => {
    if (recording !== 'on') return;
    const timer = setInterval(() => {
      const take = live.current.take;
      if (take && take.quietEnough(p.now())) commitTake();
    }, 100);
    return () => clearInterval(timer);
  }, [recording]);
  const startCountIn = (): void => {
    if (!part) return;
    setRecording('counting');
    const beats = clock.tempoAt(1).beats;
    const gap = 60 / bpm;
    for (let i = 0; i < beats; i++) setTimeout(() => p.click?.(i === 0), i * gap * 1000);
    setTimeout(() => { newTake(p.now()); setRecording('on'); }, beats * gap * 1000);
  };

  // ---- Keys ----
  const keyDown = (pitch: number, source: string): void => {
    const s = state.current;
    if (!s.part) return;
    pin.hold(`${source}:${pitch}`);
    if (live.current.handles.has(pitch)) return;
    live.current.handles.set(pitch, p.sampler.start({ instrument: s.part.instrument, gain_db: s.part.gain_db, attack: s.part.attack, release: s.part.release }, pitch, 90));
    setHeld(h => new Set(h).add(pitch));
    const t = p.now();
    if (s.mode === 'live') {
      const take = live.current.take ?? newTake(null);
      take.down(pitch, t);
      setRecording('on');
    } else if (s.mode === 'step') gather.down(pitch, t);
    pin.keep();
  };
  const keyUp = (pitch: number, source: string): void => {
    pin.release(`${source}:${pitch}`);
    const handle = live.current.handles.get(pitch);
    if (handle === undefined) return;
    live.current.handles.delete(pitch);
    p.sampler.stop(handle);
    setHeld(h => { const n = new Set(h); n.delete(pitch); return n; });
    const s = state.current;
    const t = p.now();
    if (s.mode === 'live') live.current.take?.up(pitch, t);
    else if (s.mode === 'step' && s.part) {
      const chord = gather.up(pitch, t);
      if (!chord) return;
      const beats = chord.held ?? stepBeats(s.length, s.dotted, s.quarter);
      const added = addNotes(s.doc, s.part.id, chord.pitches.map(pp => ({ start: step.cursor(), length: beats, pitch: pp })));
      step.add(beats, added.ids);
      setStepAt(step.cursor());
      apply(added.doc);
    }
  };
  const keyRef = useRef({ keyDown, keyUp, undo, redo });
  keyRef.current = { keyDown, keyUp, undo, redo };
  useEffect(() => {
    const down = (e: KeyboardEvent): void => {
      if (isTyping(e.target)) return;
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.code === 'KeyZ') { e.preventDefault(); if (e.shiftKey) keyRef.current.redo(); else keyRef.current.undo(); return; }
      if (mod && e.code === 'KeyY') { e.preventDefault(); keyRef.current.redo(); return; }
      if (mod || e.altKey) return;
      if (e.code === 'Delete' || e.code === 'Backspace') {
        const s = state.current;
        if (s.part && s.selected.size > 0) { e.preventDefault(); apply(removeNotes(s.doc, s.part.id, s.selected)); setSelected(new Set()); setArmed(null); }
        return;
      }
      if (e.code === OCTAVE_DOWN || e.code === OCTAVE_UP) {
        e.preventDefault();
        if (!e.repeat) setKeysFrom(Math.min(108, Math.max(0, state.current.start + (e.code === OCTAVE_UP ? 12 : -12))));
        return;
      }
      const pitch = pitchForKey(e.code, state.current.start);
      if (pitch === null) return;
      e.preventDefault();
      if (!e.repeat) keyRef.current.keyDown(pitch, e.code);
    };
    const up = (e: KeyboardEvent): void => {
      const pitch = pitchForKey(e.code, state.current.start);
      if (pitch !== null) keyRef.current.keyUp(pitch, e.code);
    };
    const blur = (): void => { for (const pitch of [...live.current.handles.keys()]) keyRef.current.keyUp(pitch, 'blur'); };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('blur', blur);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); window.removeEventListener('blur', blur); };
  }, []);
  // A key changed the page (a readout, a note on the grid): put it back where it was pinned.
  useEffect(() => { pin.keep(); });

  // ---- Notes on the grid ----
  const tapNote = (id: number): void => {
    if (!part) return;
    if (armed === id) {
      apply(removeNotes(doc, part.id, new Set([id])));
      setSelected(new Set());
      setArmed(null);
      setStatus('Deleted the note. Undo brings it back.');
      return;
    }
    setSelected(new Set([id]));
    setArmed(id);
    const n = part.notes.find(m => m.id === id);
    if (n) {
      const h = p.sampler.start({ instrument: part.instrument, gain_db: part.gain_db, attack: part.attack, release: part.release }, n.pitch, n.velocity);
      setTimeout(() => p.sampler.stop(h), 400);
    }
  };

  // ---- Listening ----
  const stopListening = (): void => {
    audio.current?.pause();
    audio.current = null;
    setListening(null);
    setPlayhead(null);
  };
  useEffect(() => () => stopListening(), []);
  const hear = async (what: 'piece' | 'part'): Promise<void> => {
    stopListening();
    if (what === 'part' && !part) return;
    const full = scoreFromDoc(doc, { piece: p.start.piece, project: p.start.project, draft: version + 1, made: new Date().toISOString().replace(/\.\d+Z$/, 'Z') });
    const score: Score = what === 'piece' ? full : { ...full, lanes: full.lanes.filter(l => l.id === part!.id), notes: full.notes.filter(n => n.lane === part!.id), motifs: [] };
    if (score.notes.length === 0) { setStatus(what === 'part' ? 'This part has no notes yet.' : 'The piece has no notes yet.'); return; }
    setListening({ what, state: 'Getting the instruments ready…' });
    try {
      const built = await p.buildSound(`compose-${editKey(doc)}-${what === 'part' ? part!.id : 'all'}`, score, stage => {
        setListening({ what, state: stage === 'instruments' ? 'Getting the instruments ready…' : stage === 'rendering' ? 'Building the sound…' : 'Finishing…' });
      });
      const el = new Audio(built.url);
      audio.current = el;
      setListening({ what, state: 'Playing' });
      el.addEventListener('ended', stopListening);
      const tick = (): void => {
        if (audio.current !== el) return;
        setPlayhead(clock.beat(el.currentTime));
        requestAnimationFrame(tick);
      };
      await el.play();
      requestAnimationFrame(tick);
    } catch (e) {
      setListening(null);
      setStatus(`The sound could not be built: ${e instanceof Error ? e.message : String(e)}`);
    }
  };

  // ---- Saving ----
  const save = async (): Promise<void> => {
    setSaving(true);
    const score = scoreFromDoc(doc, { piece: p.start.piece, project: p.start.project, draft: version + 1, made: new Date().toISOString().replace(/\.\d+Z$/, 'Z') });
    const result = await saveScore(p.api, score);
    setSaving(false);
    if (result.ok) {
      setVersion(result.version);
      setSavedDoc(doc);
      setStatus(`Saved as draft ${result.version}.`);
      p.onSaved?.(p.start.piece.id, result.version);
    } else {
      if (result.latest !== undefined) setVersion(result.latest);
      setStatus(result.message);
    }
  };

  // ---- Parts ----
  const pick = (e: Entry): void => {
    if (picking === 'change' && part) apply(setInstrument(doc, part.id, e));
    else {
      const made = addPart(doc, e);
      if (!made) { setStatus('A piece holds at most 16 parts.'); return; }
      apply(made.doc);
      setPartId(made.id);
    }
    setKeysFrom(null);
    setPicking(null);
  };
  const outOfRange = part && entry && !entry.pieces ? part.notes.filter(n => rangeClass(entry, n.pitch) === 'out').length : 0;

  const Help = (q: { children: string }) => (help ? <p class="border-l-2 border-amber pl-2 text-sm text-dim">{q.children}</p> : null);
  const stepNow = stepAt;
  const modeHelp = MODES.find(m => m.id === mode)!.help;

  return (
    <div data-composer="" class={cx('grid gap-4 [overflow-anchor:none]', fill && 'fixed inset-0 z-50 overflow-auto bg-ground p-4')}>
      <header class="grid gap-2">
        <div class="flex flex-wrap items-baseline gap-x-3">
          <h1 class="font-display text-3xl font-semibold tracking-wide uppercase">{p.start.piece.title}</h1>
          <p data-draft-line="" class="font-mono text-sm text-dim">{version === 0 ? 'New Piece · not saved yet' : `Draft ${version}${dirty ? ' · changed since' : ''}`} · {bpm} BPM · {clock.tempoAt(1).beats}/{clock.tempoAt(1).unit}</p>
        </div>
        <div role="toolbar" aria-label="Edit" class="flex flex-wrap gap-2">
          <Button onClick={undo} disabled={history.undoCount() === 0} data={{ 'data-undo': String(history.undoCount()) }}>↶ Undo {history.undoCount()}</Button>
          <Button onClick={redo} disabled={history.redoCount() === 0} data={{ 'data-redo': String(history.redoCount()) }}>↷ Redo {history.redoCount()}</Button>
          <Button onClick={() => part && apply(clearPart(doc, part.id))} disabled={!part || part.notes.length === 0}>Clear</Button>
          <Button variant="primary" onClick={() => void save()} disabled={saving || doc.parts.length === 0}>{saving ? 'Saving…' : 'Save Draft'}</Button>
          <Button pressed={help} onClick={() => setHelp(!help)}>Notes On Controls: {help ? 'On' : 'Off'}</Button>
          <Button pressed={fill} onClick={() => setFill(!fill)}>{fill ? 'Leave Full Screen' : 'Fill My Screen'}</Button>
        </div>
        <Help>Undo and Redo step back and forward through every change; the number says how many steps there are. Ctrl+Z (⌘Z on a Mac) and Shift+Ctrl+Z work too. Clear empties this part. Save Draft keeps a new draft of the piece; older drafts stay.</Help>
        <p data-status="" role="status" class="min-h-[1.5rem] text-sm">{status}</p>
      </header>

      <div class="grid gap-4 lg:grid-cols-[20rem_minmax(0,1fr)]">
        <div class="grid content-start gap-4">
          <Panel title="Parts In This Piece">
            <ul class="grid gap-2">
              {doc.parts.map(x => (
                <li><button type="button" data-part={x.id} aria-pressed={x.id === partId} onClick={() => { setPartId(x.id); setSelected(new Set()); setArmed(null); setKeysFrom(null); setPicking(null); }}
                  class={cx('flex min-h-11 w-full items-center gap-2 rounded-md border px-3 text-left', x.id === partId ? 'border-amber bg-lane' : 'border-rule bg-panel hover:border-dim')}>
                  <span class="size-3 shrink-0 rounded-sm" style={{ background: x.color }} />
                  <span class="min-w-0 flex-1 truncate">{x.name}</span>
                  <span class="font-mono text-xs text-dim">{p.entries.find(e => e.id === x.instrument)?.name ?? x.instrument}</span>
                </button></li>
              ))}
            </ul>
            <div class="mt-2 flex flex-wrap gap-2">
              <Button onClick={() => setPicking(picking === 'add' ? null : 'add')} pressed={picking === 'add'} disabled={doc.parts.length >= 16}>Add Part</Button>
              <Button onClick={() => void hear('piece')}>Hear With The Piece</Button>
              <Button onClick={() => void hear('part')} disabled={!part}>Hear My Part Alone</Button>
              {listening ? <Button variant="record" onClick={stopListening}>Stop</Button> : null}
            </div>
            <p data-listening="" class="mt-1 h-5 truncate font-mono text-xs text-dim">{listening ? `${listening.what === 'piece' ? 'The piece' : 'Your part'}: ${listening.state}` : ''}</p>
          </Panel>
          {picking ? (
            <Panel title={picking === 'add' ? 'Choose An Instrument For The New Part' : 'Choose Another Instrument'}>
              <InstrumentPicker entries={p.entries} value={picking === 'change' ? part?.instrument ?? null : null} onPick={pick} />
              <Help>Pick a family, then an instrument. A stand-in plays another instrument's recordings until a free recording of the real one exists.</Help>
            </Panel>
          ) : null}
          {part && entry ? (
            <Panel title="Part Settings">
              <div class="grid gap-3">
                <label class="grid gap-1 text-sm">Name
                  <input type="text" value={part.name} maxLength={60} class="min-h-11 rounded-md border border-rule bg-well px-3 text-ink"
                    onChange={e => apply(renamePart(doc, part.id, (e.target as HTMLInputElement).value))} /></label>
                <label class="flex items-center gap-2 text-sm">Colour
                  <input type="color" value={part.color} class="h-11 w-16 rounded-md border border-rule bg-well"
                    onChange={e => apply(recolourPart(doc, part.id, (e.target as HTMLInputElement).value))} /></label>
                <div class="flex items-center gap-2"><Icon name={entry.icon} class="text-amber" />
                  <span data-instrument-name="" class="font-semibold">{entry.name}</span>
                  <Button onClick={() => setPicking(picking === 'change' ? null : 'change')} pressed={picking === 'change'}>Change Instrument</Button></div>
                <p data-range-words="" class="font-mono text-xs text-dim">{rangeWords(entry)}</p>
                {entry.written !== 0 && entry.range ? <p data-written="" class="text-xs text-dim">Written {Math.abs(entry.written / 12) === 1 ? 'an octave' : `${Math.abs(entry.written / 12)} octaves`} {entry.written > 0 ? 'above' : 'below'} how it sounds: {pitchName(entry.home ?? 60)} is written {pitchName(writtenPitch(entry, entry.home ?? 60))}.</p> : null}
                {outOfRange > 0 ? (
                  <div class="grid gap-1">
                    <p data-out-of-range="" class="text-sm text-record">{outOfRange} {outOfRange === 1 ? 'note is' : 'notes are'} out of this instrument's range (red).</p>
                    <Button onClick={() => apply(moveIntoRange(doc, part.id, entry))}>Move Them Into Range</Button>
                  </div>
                ) : <p data-out-of-range="" class="text-sm text-dim">Every note is in range.</p>}
                <Help>No note is ever blocked or moved by itself. Amber notes are for experts; red notes are beyond what the instrument can play. Move Them Into Range shifts the red ones by octaves, and Undo puts them back.</Help>
                <Button variant="ghost" onClick={() => { apply(removePart(doc, part.id)); setPartId(doc.parts.find(x => x.id !== part.id)?.id ?? null); }}>Remove Part</Button>
              </div>
            </Panel>
          ) : null}
        </div>

        <div class="grid min-w-0 content-start gap-4">
          {part && entry ? (
            <>
              <div role="tablist" aria-label="Ways To Put Notes In" class="grid grid-cols-3 gap-1 rounded-lg border border-rule bg-panel p-1">
                {MODES.map(m => (
                  <button type="button" role="tab" aria-selected={m.id === mode} onClick={() => { if (live.current.take) commitTake(); setMode(m.id); }}
                    class={cx('flex min-h-14 flex-col items-center justify-center gap-1 rounded-md font-display text-sm font-semibold tracking-wide uppercase', m.id === mode ? 'bg-amber text-on-accent' : 'text-ink hover:bg-lane')}>
                    <Icon name={m.icon} />{m.label}
                  </button>
                ))}
              </div>
              <Help>{modeHelp}</Help>
              <div data-readout="" class="h-[5.5rem] overflow-hidden rounded-lg border border-rule bg-panel p-3 [overflow-anchor:none]">
                {mode === 'live' ? (
                  <div class="grid gap-2">
                    <div class="flex flex-wrap items-center gap-2">
                      <span class="text-sm">Tidy To</span>
                      {GRIDS.map(g => <Button pressed={tidy === g} onClick={() => setTidy(g)}>{GRID_LABELS[g]}</Button>)}
                      <Button pressed={countIn} onClick={() => setCountIn(!countIn)}>Count-In: {countIn ? 'On' : 'Off'}</Button>
                      {recording !== 'idle' ? <Button variant="record" onClick={commitTake}>Stop Recording</Button>
                        : countIn ? <Button variant="record" onClick={startCountIn}>● Record</Button> : null}
                    </div>
                    <p data-live-state="" class="truncate font-mono text-sm text-dim">{recording === 'counting' ? 'Counting in…' : recording === 'on'
                      ? `● Recording · ${[...held].map(pitchName).join(' ') || 'waiting for a bar of quiet'}`
                      : `Press a key to start recording at bar ${part.notes.length ? clock.barOfBeat(Math.max(...part.notes.map(n => n.start + n.length)) - 1e-9) + 1 : 1}, beat 1.`}</p>
                  </div>
                ) : mode === 'step' ? (
                  <div class="grid gap-2">
                    <div class="flex flex-wrap items-center gap-1">
                      {STEP_LENGTHS.map(l => <Button pressed={length === l.id} onClick={() => setLength(l.id)} data={{ 'data-length': l.id }}>{l.label}</Button>)}
                      <Button pressed={dotted} onClick={() => setDotted(!dotted)}>Dotted</Button>
                      <Button onClick={() => { step.rest(stepBeats(length, dotted, quarter)); setStepAt(step.cursor()); }}>+ Rest</Button>
                      <Button onClick={() => { const s = step.back(); if (s) { if (s.ids.length) apply(removeNotes(doc, part.id, new Set(s.ids))); setStepAt(step.cursor()); } }}>‹ Back One</Button>
                    </div>
                    <p data-step-state="" class="truncate font-mono text-sm text-dim">Next note at bar {clock.barOfBeat(stepNow)}, beat {Math.round((stepNow - clock.barStartBeat(clock.barOfBeat(stepNow)) + 1) * 100) / 100}</p>
                  </div>
                ) : (
                  <div class="grid gap-2">
                    <div class="flex flex-wrap items-center gap-1">
                      <span class="text-sm">Line Up To</span>
                      {GRIDS.map(g => <Button pressed={lineUp === g} onClick={() => setLineUp(g)}>{GRID_LABELS[g]}</Button>)}
                    </div>
                    <div class="flex flex-wrap items-center gap-1">
                      <span class="text-sm">New Notes</span>
                      {STEP_LENGTHS.map(l => <Button pressed={length === l.id} onClick={() => setLength(l.id)}>{l.label}</Button>)}
                    </div>
                  </div>
                )}
              </div>
              <EditGrid entry={entry} color={part.color} notes={part.notes} clock={clock} bars={bars} lineUp={mode === 'grid' ? lineUp : tidy === 'off' ? 'off' : '1/16'}
                adding={mode === 'grid'} length={stepBeats(length, dotted, quarter)} selected={selected} armed={armed} playhead={playhead}
                cursor={mode === 'step' ? stepNow : null} onTapNote={tapNote}
                onMove={(id, s, pitch) => apply(moveNote(doc, part.id, id, s, pitch))}
                onResize={(id, l) => apply(resizeNote(doc, part.id, id, l, quarter / 4))}
                onAdd={(s, pitch) => { const made = addNotes(doc, part.id, [{ start: s, length: stepBeats(length, dotted, quarter), pitch }]); apply(made.doc); setSelected(new Set(made.ids)); setArmed(null);
                  const h = p.sampler.start({ instrument: part.instrument, gain_db: part.gain_db, attack: part.attack, release: part.release }, pitch, 90); setTimeout(() => p.sampler.stop(h), 300); }}
                onSelect={ids => { setSelected(new Set(ids)); setArmed(null); }} />
              <Help>Tap a note to hear and select it; tap it again to delete it. Drag across empty space to select several, then press Delete. Rows in red are beyond the instrument; amber rows are for experts.</Help>
              <Keyboard entry={entry} start={start} held={held} onStart={setKeysFrom} onDown={pitch => keyDown(pitch, 'screen')} onUp={pitch => keyUp(pitch, 'screen')} />
              <Help>On a computer keyboard, A S D F G H J K play the white keys and W E T Y U the black ones; Z and X move down and up an octave.</Help>
            </>
          ) : (
            <Panel title="Start With A Part"><p class="text-dim">Choose an instrument for your first part.</p></Panel>
          )}
        </div>
      </div>
    </div>
  );
}

/** A key per document, so a document's sound is built once however often it is heard. */
const keys = new WeakMap<EditDoc, number>();
let nextKey = 1;
function editKey(doc: EditDoc): number {
  let k = keys.get(doc);
  if (k === undefined) { k = nextKey++; keys.set(doc, k); }
  return k;
}
