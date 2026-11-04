// The composer: the transport bar on top (Play, the tempo, where the music is, Undo and Redo, Save Draft, the Piece
// menu, Compose, Mix and Sheet), and in Compose one timeline of the song's sections, its effects and its tracks (Arrange),
// each track opening in place as a piano roll or a step sequencer. Mix holds each track's Sound, Speed And Loudness and
// DJ Mode; Sheet the open track as sheet music. Play Live, Step, Hum and Your Keyboard sit in each track's Record drawer.
// It holds the page's state and wires the DOM-free modules (compose/) to the keys, the timeline and the sound. The
// sound is the real renderer's, built when Play is pressed and played as a file; the playhead and the readout are
// drawn from its clock straight into the page, so the composer never redraws while the music plays. While any key is
// held the page is pinned where it is (compose/scrollpin.ts).
import type { ComponentChildren } from 'preact';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import type { Entry } from '../../catalogue.ts';
import { intervalWords, rangeClass } from '../../catalogue.ts';
import { beatClock } from '../../compose/beats.ts';
import { barsNeeded, scoreFromDoc } from '../../compose/doc.ts';
import type { EditDoc, Part } from '../../compose/doc.ts';
import { fxDemoScore } from '../../compose/fxdemo.ts';
import { addAsNewParts, ACCEPT, newDocFrom, previewOf, readMusicFile } from '../../compose/importing.ts';
import type { ImportPorts, ImportPreview as Preview } from '../../compose/importing.ts';
import { writeMidi } from '../../compose/midi.ts';
import { ImportError } from '../../compose/music-file.ts';
import { toMusicXml } from '../../compose/toxml.ts';
import { addNotes, addPart, clearPart, moveIntoRange, PART_COLOURS, removeNotes } from '../../compose/edit.ts';
import { createHistory } from '../../compose/history.ts';
import { keyboardStart, OCTAVE_DOWN, OCTAVE_UP, pitchForKey } from '../../compose/keys.ts';
import { bendFractions, humNotes, keyScale } from '../../compose/hum.ts';
import type { HumPlace, HumSegment, HumSnap } from '../../compose/hum.ts';
import { createLiveTake } from '../../compose/live.ts';
import type { LiveTake } from '../../compose/live.ts';
import { muteStatus, setAllMuted } from '../../compose/mutes.ts';
import { fixTiming, shiftNotes, transposeNotes } from '../../compose/notetools.ts';
import { placeTarget, targetFor } from '../../compose/placement.ts';
import type { Target } from '../../compose/placement.ts';
import { deleteRegion, duplicateRegion, fitRegions, splitRegion } from '../../compose/regions.ts';
import { saveScore } from '../../compose/save.ts';
import type { Saved } from '../../compose/save.ts';
import type { Sampler } from '../../compose/sampler.ts';
import { pinScroll } from '../../compose/scrollpin.ts';
import { GRID_LABELS, GRIDS } from '../../compose/snap.ts';
import type { Grid } from '../../compose/snap.ts';
import { createChordGather, createStepCursor, STEP_LENGTHS, stepBeats } from '../../compose/step.ts';
import type { StepLength } from '../../compose/step.ts';
import { clearStep, typedPitch, typeNote } from '../../compose/typenotes.ts';
import { guardLeaving } from '../../leave.ts';
import type { PageApi } from '../../api.ts';
import { pitchName } from '../../pianoroll.ts';
import type { BuildSound } from '../../render/sound.ts';
import type { FxClipEffect, Score } from '../../score.ts';
import { cx } from '../console/cx.ts';
import type { SheetModule } from '../SheetMusic.tsx';
import { ActionBar, copyPicked, pasteAtCursor } from './ActionBar.tsx';
import type { Clipboard } from './ActionBar.tsx';
import { Arrange, headWidth } from './Arrange.tsx';
import type { Ctl, Pick, PopName } from './ctl.ts';
import { barWords, ROLL_ROWS } from './ctl.ts';
import { FxPalette, FxSettings, PlaceBanner } from './FxPalette.tsx';
import { Glyph } from './Glyph.tsx';
import { HumPanel } from './HumPanel.tsx';
import type { HumPorts } from './HumPanel.tsx';
import { ImportPreview } from './ImportPreview.tsx';
import { Icon } from './InstrumentPicker.tsx';
import { Keyboard } from './Keyboard.tsx';
import { PartSheet } from './PartSheet.tsx';
import { Pop, PopItem } from './Pop.tsx';
import { AddPop, ChordsPop, KeyPicker, MarkerPop, SectionPop, TrackMenu } from './Pops.tsx';
import { SaveTakes } from './SaveTakes.tsx';
import type { TakeToSave } from './SaveTakes.tsx';
import { SoundPanel } from './SoundPanel.tsx';
import { SpeedPanel } from './SpeedPanel.tsx';
import { readoutWords, Transport } from './Transport.tsx';
import type { View } from './Transport.tsx';
import { VocalPanel } from './VocalPanel.tsx';
import type { VocalPorts } from './VocalPanel.tsx';
import { YourKeyboard } from './YourKeyboard.tsx';
import { DjMode } from './DjMode.tsx';
import { MixView as MixPanels } from './MixView.tsx';
import { SheetView } from './SheetView.tsx';
import { SongPop } from './SongPop.tsx';
import { StartSong } from './StartSong.tsx';
import { Coach } from './Coach.tsx';
import { LooksPop } from './LooksPop.tsx';
import { templateDoc, TEMPLATES } from '../../compose/templates.ts';
import type { TemplateId } from '../../compose/templates.ts';
import { coachPref } from '../../compose/coach.ts';
import type { CoachStep } from '../../compose/coach.ts';
import { DEFAULT_LOOK } from '../../compose/looks.ts';
import type { Look, LookPorts } from '../../compose/looks.ts';
import { songPrefs } from '../../compose/songprefs.ts';
import type { SongPrefs } from '../../compose/songprefs.ts';
import { clicksBetween } from '../../compose/song.ts';
import type { StorageLike } from '../../../../_kit/ports.ts';
import { beatOfBar } from './Arrange.tsx';
import type { DjPorts } from './DjMode.tsx';
import { mixOf, setLaneFx, setMix, setVoice } from '../../compose/sound.ts';
import type { LiveVoice } from '../../compose/livemic.ts';
import type { VoiceFx } from '../../score.ts';
import { setDynamics } from '../../compose/loudness.ts';
import { setPartSpeed, setPieceSpeed, setTempoLine } from '../../compose/speed.ts';
import { newVocalPart, renameTake, takesOf } from '../../compose/vocal.ts';
import { withSavedTakes } from '../../compose/vocalsave.ts';
import { exportWithVocals, notesOnly } from '../../compose/vocalexport.ts';
import type { Encoded } from '../../compose/vocalsave.ts';
import { LOCAL_TAKE_RE } from '../../score.ts';

/** The Record drawer's ways to put notes in. */
export type Mode = 'live' | 'step' | 'hum';
export const MODES: readonly { id: Mode; label: string; help: string }[] = [
  { id: 'live', label: 'Play Live', help: 'Play the keys: a key held down sets the note\'s length, as on a piano. Recording starts on your first note and stops after a bar of quiet. Play Along plays the piece while you record over it.' },
  { id: 'step', label: 'Step', help: 'Pick a length, then press a key (or several together for a chord). The note goes in at the dashed line, which moves on.' },
  { id: 'hum', label: 'Hum', help: 'Hum or sing, and your voice becomes notes in this track. Record With Mic, try the demo, or upload a recording.' },
];

/** What the editor needs for sheet music and for files: the sheet bundle, the import's readers, and handing the person a file. */
export interface ComposerFiles {
  loadSheet(): Promise<SheetModule>;
  importPorts: ImportPorts;
  save(name: string, data: Blob): void;
}

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
  api: Pick2<PageApi, 'saveDraft'>;
  sampler: Sampler;
  buildSound: BuildSound;
  /** Seconds, from any steady clock. */
  now(): number;
  /** A metronome click, `delay` seconds from now (count-in, Click); absent where the page has no sound. */
  click?(accent: boolean, delay?: number): void;
  /** The composer's own switches (Click, count-in, Type Notes in key) and tips are remembered here. */
  storage?: StorageLike | null;
  /** Colors And Style: the choice it opens with and where a new choice is kept. */
  looks?: LookPorts;
  onSaved?(piece: string, version: number): void;
  /** Sheet music, import and export; without it the editor has no Sheet view and no files. */
  files?: ComposerFiles;
  /** Start A New Piece from an imported file: the page asks for the new piece's title and project, then opens it. */
  onNewPiece?(doc: EditDoc, title: string): void;
  /** Asks the browser for Web MIDI ({ sysex: false }); absent where there is none. */
  midi?: () => Promise<MIDIAccess>;
  /** Hum's microphone, file decoding and playback; without it there is no Hum. */
  hum?: HumPorts;
  /** Voice Effects on the live microphone (asked for when started), in the piece's key; absent where there is none. */
  live?: (chain: readonly VoiceFx[], key: readonly number[]) => Promise<LiveVoice>;
  /** Vocal Tracks: takes on this device, the microphone, the encoders and the studio; absent where there are none. */
  vocal?: VocalPorts;
  /** DJ Mode's live deck; absent where the page has no sound. */
  dj?: DjPorts;
}
type Pick2<T, K extends keyof T> = { [P in K]: T[P] };

const isTyping = (t: EventTarget | null): boolean =>
  t instanceof HTMLElement && (t.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName));
const stamp = (): string => new Date().toISOString().replace(/\.\d+Z$/, 'Z');
const coarsePointer = (): boolean => typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches;

export function Composer(p: ComposerProps) {
  const history = useMemo(() => createHistory(fitRegions(p.start.doc)), []);
  const [doc, setDoc] = useState<EditDoc>(history.now());
  const [savedDoc, setSavedDoc] = useState<EditDoc>(history.now());
  const [version, setVersion] = useState(p.start.version);
  const [view, setView] = useState<View>('compose');
  const [open, setOpen] = useState<ReadonlySet<string>>(new Set());
  const [sel, setSelState] = useState<string | null>(p.start.doc.parts[0]?.id ?? null);
  const [lows, setLows] = useState<Record<string, number>>({});
  const [pick, setPickState] = useState<Pick>({ kind: 'none' });
  const [lenBeats, setLen] = useState<number | null>(null);
  const [selectMode, setSelectMode] = useState(false);
  const [chord, setChord] = useState<Ctl['chord']>(null);
  const [splitting, setSplitting] = useState(false);
  const [typing, setTyping] = useState(false);
  const [cursor, setCursorState] = useState(0);
  const [loop, setLoopState] = useState<{ from: number; to: number } | null>(null);
  const [loopOn, setLoopOn] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [width, setWidth] = useState(360);
  const [placing, setPlacing] = useState<FxClipEffect | null>(null);
  const [drop, setDrop] = useState<Target | null>(null);
  const [flash, setFlash] = useState<number | null>(null);
  const [pop, setPop] = useState<{ name: PopName; anchor: HTMLElement | null; arg?: string } | null>(null);
  const [clipboard, setClipboard] = useState<Clipboard>(null);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [recordOpen, setRecordOpen] = useState<string | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [getting, setGetting] = useState(false);
  const [hearingFx, setHearingFx] = useState<FxClipEffect | null>(null);
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const [help] = useState(true);
  const [mode, setMode] = useState<Mode>('live');
  const [tidy, setTidy] = useState<Grid>('1/8');
  const [length, setLength] = useState<StepLength>('quarter');
  const [dotted, setDotted] = useState(false);
  const [held, setHeld] = useState<ReadonlySet<number>>(new Set());
  const [keysFrom, setKeysFrom] = useState<number | null>(null);
  const [countIn, setCountIn] = useState(false);
  const [recording, setRecording] = useState<'idle' | 'counting' | 'on'>('idle');
  const [stepAt, setStepAt] = useState(0);
  const [concert, setConcert] = useState(false);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [choice, setChoice] = useState<string[]>([]);
  const [humSnap, setHumSnap] = useState<HumSnap>('friendly');
  const [humPlace, setHumPlace] = useState<HumPlace>('after');
  const [along, setAlong] = useState<'off' | 'ready' | 'counting' | 'on'>('off');
  const [alongParts, setAlongParts] = useState(true);
  const [choosing, setChoosing] = useState<TakeToSave[] | null>(null);
  const [room, setRoom] = useState(p.vocal?.room ?? Infinity);
  const prefStore = useMemo(() => songPrefs(p.storage ?? null), []);
  const [prefs, setPrefsState] = useState<SongPrefs>(prefStore.get());
  const setPrefs = (v: SongPrefs): void => { prefStore.set(v); setPrefsState(v); };
  const tipsPref = useMemo(() => coachPref(p.storage ?? null), []);
  const [tips, setTips] = useState(tipsPref.get());
  const [done, setDone] = useState<ReadonlySet<CoachStep>>(new Set());
  const did = (k: CoachStep): void => setDone(d => (d.has(k) ? d : new Set(d).add(k)));
  const [look, setLookState] = useState<Look>(p.looks?.initial ?? DEFAULT_LOOK);
  const setLook = (l: Look): void => { setLookState(l); p.looks?.save(l); };
  const [startOpen, setStartOpen] = useState(p.start.version === 0 && p.start.doc.parts.length === 0);
  /** The other views' playheads and meters, drawn by the same clock as the timeline's. */
  const heads = useRef(new Set<{ draw(beat: number, follow: boolean): void }>());
  const register = (slot: { current: { draw(beat: number, follow: boolean): void } | null }) => (h: { draw(beat: number, follow: boolean): void } | null): void => {
    if (slot.current) heads.current.delete(slot.current);
    slot.current = h;
    if (h) heads.current.add(h);
  };
  const sheetSlot = useRef<{ draw(beat: number, follow: boolean): void } | null>(null);
  const mixSlot = useRef<{ draw(beat: number, follow: boolean): void } | null>(null);
  const registerSheet = useMemo(() => register(sheetSlot), []);
  const registerMix = useMemo(() => register(mixSlot), []);
  const prefsRef = useRef(prefs);
  prefsRef.current = prefs;
  const [engraved, setEngraved] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const readout = useRef<HTMLSpanElement>(null);
  const coarse = useMemo(coarsePointer, []);

  const bars = barsNeeded(doc);
  const clock = useMemo(() => beatClock(doc.tempo), [doc.tempo]);
  const quarter = clock.quarter(1);
  const bpm = clock.tempoAt(1).bpm;
  const end = clock.barStartBeat(bars + 1);
  const total = clock.barStartBeat(bars + 2);
  const dirty = doc !== savedDoc;
  const part: Part | null = doc.parts.find(x => x.id === sel) ?? null;
  const entryOf = (x: Part): Entry | null => p.entries.find(e => e.id === x.instrument) ?? null;
  const entry = part ? entryOf(part) : null;
  const lengths = useMemo(() => [['1/16', quarter / 4], ['1/8', quarter / 2], ['Beat', 1], ['1/2', quarter * 2], ['Bar', clock.tempoAt(1).beats]] as const, [quarter, clock]);
  const len = lenBeats ?? 1;
  const hw = headWidth();
  const ppb = Math.max(4, Math.max(coarse ? 64 : 36, (width - hw - 2) / total) * zoom);
  const recordPart = doc.parts.find(x => x.id === recordOpen) ?? null;
  const recordEntry = recordPart ? entryOf(recordPart) : null;
  const keysStart = keysFrom ?? (recordEntry ? keyboardStart(recordEntry) : 48);

  // ---- The Try It coach notices what has been done ----
  /** A template or Undo replaced the song: what it brings is not something the person did. */
  const fresh = useRef(false);
  const counts = useRef({ notes: Number.MAX_SAFE_INTEGER, parts: doc.parts.length, clips: doc.fxClips?.length ?? 0 });
  useEffect(() => {
    const notes = doc.parts.reduce((n, x) => n + x.notes.length, 0);
    const was = counts.current;
    const skip = fresh.current;
    fresh.current = false;
    if (!skip) {
      if (notes > was.notes) did('note');
      if (doc.parts.length > was.parts) did('inst');
      if ((doc.fxClips?.length ?? 0) > was.clips) did('fxadd');
    }
    counts.current = { notes, parts: doc.parts.length, clips: doc.fxClips?.length ?? 0 };
  }, [doc]);

  // ---- The document ----
  const say = (words: string): void => setStatus(words);
  const apply = (next: EditDoc, words?: string): void => {
    history.push(fitRegions(next));
    setDoc(history.now());
    if (words) setStatus(words);
  };
  const clearPicks = (): void => { setPickState({ kind: 'none' }); setChord(null); setSplitting(false); };
  const undo = (): void => { fresh.current = true; setDoc(history.undo()); clearPicks(); };
  const redo = (): void => { fresh.current = true; setDoc(history.redo()); clearPicks(); };
  const savedRef = useRef(savedDoc);
  savedRef.current = savedDoc;
  const docRef = useRef(doc);
  docRef.current = doc;
  useEffect(() => guardLeaving(window, () => docRef.current !== savedRef.current), []);
  const lowOf = (x: Part): number => {
    const set = lows[x.id];
    if (set !== undefined) return set;
    const e = entryOf(x);
    const ps = x.notes.map(n => n.pitch).sort((a, b) => a - b);
    const mid = ps.length ? ps[Math.floor(ps.length / 2)]! : e?.home ?? 60;
    return Math.max(12, Math.min(96, Math.round((mid - 12) / 12) * 12));
  };
  const setLow = (id: string, low: number): void => setLows(l => ({ ...l, [id]: Math.max(0, Math.min(104, low)) }));
  const previewNote = (x: Part, pitch: number, beats = 1): void => {
    const h = p.sampler.start({ instrument: x.instrument, gain_db: x.gain_db, attack: x.attack, release: x.release }, pitch, 90);
    setTimeout(() => p.sampler.stop(h), Math.max(150, Math.min(900, (beats * 60 * 1000) / bpm)));
  };
  useEffect(() => { for (const x of doc.parts) if (!x.vocal) void p.sampler.ready(x.instrument); }, [doc.parts.map(x => x.instrument).join()]);
  const setCursor = (beat: number): void => {
    const b = Math.max(0, Math.min(end, beat));
    setCursorState(b);
    if (!playingRef.current) drawAt(b);
  };
  const setPick = (k: Pick): void => {
    setPickState(k);
    if (k.kind !== 'none') { setChord(null); setSplitting(false); }
    if (k.kind === 'notes' || k.kind === 'region') setSelState(k.part);
  };
  const toggleOpen = (id: string, to?: boolean): void => {
    setOpen(o => {
      const n = new Set(o);
      if (to ?? !n.has(id)) n.add(id); else n.delete(id);
      return n;
    });
    if (to ?? !open.has(id)) setSelState(id);
  };

  // ---- Sound: Play builds the piece with the real renderer and plays it as a file ----
  const playingRef = useRef(false);
  const audio = useRef<HTMLAudioElement | null>(null);
  const run = useRef(0);
  const ctlRef = useRef<Ctl | null>(null);
  const drawAt = (beat: number, follow = false): void => {
    ctlRef.current?.head?.draw(beat, follow);
    for (const h of heads.current) h.draw(beat, follow);
    const bar = clock.barOfBeat(beat + 1e-9);
    const words = readoutWords(bar, Math.floor(beat - clock.barStartBeat(bar) + 1e-9) + 1, clock.seconds(beat));
    if (readout.current && readout.current.textContent !== words) readout.current.textContent = words;
  };
  const scoreOf = (d: EditDoc): Score => scoreFromDoc(d, { piece: p.start.piece, project: p.start.project, draft: version + 1, made: stamp() });
  const stop = (): void => {
    run.current++;
    audio.current?.pause();
    audio.current = null;
    playingRef.current = false;
    setPlaying(false);
    setGetting(false);
    drawAt(cursorRef.current);
  };
  const cursorRef = useRef(cursor);
  cursorRef.current = cursor;
  const loopRef = useRef({ loop, loopOn, end });
  loopRef.current = { loop, loopOn, end };
  /** The playhead's clock: each frame it reads the audio's time and moves the playhead and the readout, nothing else. */
  const follow = (el: HTMLAudioElement, d: EditDoc): void => {
    const c = beatClock(d.tempo);
    let nextClick = -1;
    const tick = (): void => {
      if (audio.current !== el) return;
      let beat = c.beat(el.currentTime);
      const l = loopRef.current;
      const span = l.loopOn && l.loop ? l.loop : l.loopOn ? { from: 0, to: l.end } : null;
      if (span && beat >= span.to - 0.02) { el.currentTime = c.seconds(span.from); beat = span.from; }
      // Click: each beat in the next moment is scheduled on the sound's own clock, so it lands on the beat.
      if (prefsRef.current.click && p.click && !el.paused) {
        if (nextClick < 0 || beat < nextClick - 1.01) nextClick = Math.ceil(beat - 1e-6);
        const ahead = c.beat(el.currentTime + 0.15);
        const stopAt = span ? Math.min(ahead, span.to) : ahead;
        for (const k of clicksBetween(c, nextClick, stopAt)) {
          p.click(k.accent, Math.max(0, c.seconds(k.beat) - el.currentTime));
          nextClick = k.beat + 1;
        }
      } else nextClick = -1;
      drawAt(beat, true);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const play = async (from = cursorRef.current): Promise<void> => {
    stop();
    const d = docRef.current;
    const score = scoreOf(d);
    if (score.notes.length === 0 && !score.lanes.some(l => l.vocal?.clips.length)) { say('The song has no notes yet. Open a track and tap its grid to add some.'); return; }
    const mine = ++run.current;
    // Let play while the press is fresh: building the sound can take longer than the browser's window for starting sound.
    const el = pressedAudio();
    audio.current = el;
    setGetting(true);
    try {
      const built = await p.buildSound(`compose-${editKey(d)}`, score, () => {});
      if (mine !== run.current) return;
      el.src = built.url;
      const l = loopRef.current;
      const start = l.loopOn && l.loop && (from < l.loop.from || from >= l.loop.to) ? l.loop.from : from;
      el.currentTime = beatClock(d.tempo).seconds(start);
      el.addEventListener('ended', () => {
        if (audio.current !== el) return;
        if (loopRef.current.loopOn) { el.currentTime = beatClock(docRef.current.tempo).seconds(loopRef.current.loop?.from ?? 0); void el.play(); } else stop();
      });
      if (prefsRef.current.countIn && p.click) {
        // A bar of clicks first, at the tempo where the song starts playing.
        const bar = beatClock(d.tempo).tempoAt(beatClock(d.tempo).barOfBeat(start + 1e-9));
        const gap = 60 / bar.bpm;
        for (let i = 0; i < bar.beats; i++) p.click(i === 0, i * gap);
        await new Promise(r => setTimeout(r, bar.beats * gap * 1000));
        if (mine !== run.current) return;
      }
      playingRef.current = true;
      setPlaying(true);
      setGetting(false);
      did('play');
      await el.play();
      follow(el, d);
    } catch (e) {
      if (mine !== run.current) return;
      stop();
      say(`The sound could not be built: ${e instanceof Error ? e.message : String(e)}`);
    }
  };
  useEffect(() => () => stop(), []);
  // An edit while the song plays is heard on the next build, swapped in at the same moment.
  useEffect(() => {
    if (!playingRef.current) return;
    const t = setTimeout(async () => {
      const el = audio.current;
      if (!el || !playingRef.current) return;
      const d = docRef.current;
      const mine = run.current;
      try {
        const built = await p.buildSound(`compose-${editKey(d)}`, scoreOf(d), () => {});
        if (mine !== run.current || audio.current !== el) return;
        const at = el.currentTime;
        el.src = built.url;
        el.currentTime = at;
        await el.play();
        follow(el, d);
      } catch { /* the playing sound carries on */ }
    }, 400);
    return () => clearTimeout(t);
  }, [doc]);
  useEffect(() => { if (!playingRef.current) drawAt(cursor); });
  const playFrom = (beat: number): void => { setCursorState(beat); void play(beat); };
  /** Hear for an effect: a short tune with the effect on it, played on its own element so it works over the song. */
  const fxAudio = useRef<HTMLAudioElement | null>(null);
  const hearFx = async (effect: FxClipEffect): Promise<void> => {
    fxAudio.current?.pause();
    const score = fxDemoScore(effect, p.entries);
    if (!score) return;
    const el = pressedAudio();
    fxAudio.current = el;
    setHearingFx(effect);
    try {
      const built = await p.buildSound(`fxdemo-${effect}`, score, () => {});
      if (fxAudio.current !== el) return;
      el.src = built.url;
      await el.play();
    } catch (e) {
      say(`The example could not be built: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setHearingFx(h => (h === effect ? null : h));
    }
  };
  useEffect(() => () => { fxAudio.current?.pause(); }, []);
  /** Hear for an instrument: a short tune through the live sampler; low instruments an octave up, one note at a time. */
  const hearInstrument = (e: Entry): void => {
    const sound = { instrument: e.id, gain_db: 0, attack: e.attack, release: e.release };
    void p.sampler.ready(e.id).then(() => {
      const gap = 260;
      if (e.pieces) {
        const has = (q: number) => e.pieces!.some(([x]) => x === q);
        const kick = has(36) ? 36 : e.pieces[0]![0];
        const snare = has(38) ? 38 : e.pieces[1]?.[0] ?? kick;
        const hat = has(42) ? 42 : e.pieces[2]?.[0] ?? snare;
        [[kick, hat], [hat], [snare, hat], [hat], [kick, hat], [kick, hat], [snare, hat], [hat]].forEach((hits, i) =>
          setTimeout(() => { for (const q of hits) { const h = p.sampler.start(sound, q, 100); setTimeout(() => p.sampler.stop(h), 300); } }, i * gap));
        return;
      }
      const home = e.home ?? 60;
      const base = (home < 48 ? home + 12 : home) - ((home < 48 ? home + 12 : home) % 12);
      [0, 4, 7, 12, 7, 4, 0].forEach((iv, i) => setTimeout(() => { const h = p.sampler.start(sound, base + iv, 96); setTimeout(() => p.sampler.stop(h), gap * 1.6); }, i * gap));
    });
  };

  // ---- Placing effects ----
  const placeAt = (t: Target): void => {
    const made = placeTarget(doc, t);
    if (!made) { if (t.bad) say(t.bad); return; }
    apply(made.doc, `${t.label}. Undo takes it back.`);
    setPick({ kind: 'clip', index: made.index });
    setPlacing(null);
    setDrop(null);
    setFlash(made.index);
    setTimeout(() => setFlash(f => (f === made.index ? null : f)), 700);
  };
  const startPlacing = (effect: FxClipEffect | null): void => {
    setPlacing(effect);
    setDrop(null);
    if (effect) { clearPicks(); setView('compose'); }
  };

  // ---- Record drawer: Play Live, Step and Hum ----
  const live = useRef<{ take: LiveTake | null; handles: Map<number, number>; pressed: Map<string, number> }>({ take: null, handles: new Map(), pressed: new Map() });
  const step = useMemo(() => createStepCursor(0), []);
  const gather = useMemo(() => createChordGather(() => bpm), [bpm]);
  const pin = useMemo(() => pinScroll(window), []);
  useEffect(() => () => pin.dispose(), [pin]);
  const state = useRef({ doc, recordPart, recordEntry, mode, tidy, quarter, keysStart, dotted, length, pick, typing, sel, len, cursor, placing, drop, view });
  state.current = { doc, recordPart, recordEntry, mode, tidy, quarter, keysStart, dotted, length, pick, typing, sel, len, cursor, placing, drop, view };
  const alongClock = useRef<(() => number) | null>(null);
  const liveNow = (): number => alongClock.current?.() ?? p.now();
  const afterPart = (x: Part | null): number => {
    const last = x ? Math.max(0, ...x.notes.map(n => n.start + n.length)) : 0;
    return clock.barStartBeat(last === 0 ? 1 : clock.barOfBeat(last - 1e-9) + 1);
  };
  useEffect(() => {
    const x = recordPart;
    step.moveTo(x ? Math.max(0, ...x.notes.map(n => n.start + n.length)) : 0);
    setStepAt(step.cursor());
  }, [recordOpen, mode]);
  const commitTake = (): void => {
    const take = live.current.take;
    const t = liveNow();
    live.current.take = null;
    setRecording('idle');
    const s = state.current;
    if (!take || !take.started() || !s.recordPart) return;
    const notes = take.notes(s.tidy, s.quarter, t);
    if (notes.length === 0) return;
    apply(addNotes(s.doc, s.recordPart.id, notes).doc, `Recorded ${notes.length} ${notes.length === 1 ? 'note. Undo takes it back.' : 'notes. Undo takes them back.'}`);
  };
  const newTake = (at: number | null): LiveTake => {
    const startBeat = afterPart(state.current.recordPart);
    const tempo = clock.tempoAt(clock.barOfBeat(startBeat));
    const take = createLiveTake({ startBeat, bpm: tempo.bpm, beatsPerBar: tempo.beats });
    if (at !== null) take.begin(at);
    live.current.take = take;
    return take;
  };
  useEffect(() => {
    if (recording !== 'on') return;
    const timer = setInterval(() => {
      const take = live.current.take;
      if (take && !alongClock.current && take.quietEnough(p.now())) commitTake();
    }, 100);
    return () => clearInterval(timer);
  }, [recording]);
  const alongRun = useRef(0);
  const alongAudio = useRef<HTMLAudioElement | null>(null);
  const finishAlong = (): void => {
    alongRun.current++;
    if (live.current.take) commitTake();
    alongClock.current = null;
    alongAudio.current?.pause();
    alongAudio.current = null;
    setAlong('off');
  };
  const playAlong = async (): Promise<void> => {
    const s = state.current;
    if (!s.recordPart) return;
    if (live.current.take) commitTake();
    stop();
    const mine = ++alongRun.current;
    const full = scoreOf(s.doc);
    const others: Score = { ...full, lanes: full.lanes.filter(l => l.id !== s.recordPart!.id), notes: full.notes.filter(n => n.lane !== s.recordPart!.id), motifs: [] };
    let el: HTMLAudioElement | null = null;
    let url = '';
    if (alongParts && others.notes.length > 0) {
      setAlong('ready');
      const pressed = pressedAudio();
      alongAudio.current = pressed;
      try {
        url = (await p.buildSound(`along-${editKey(s.doc)}-${s.recordPart.id}`, others, () => {})).url;
      } catch (e) {
        if (mine !== alongRun.current) return;
        pressed.pause();
        alongAudio.current = null;
        setAlong('off');
        say(`The other tracks could not be built: ${e instanceof Error ? e.message : String(e)}`);
        return;
      }
      if (mine !== alongRun.current) return;
      el = pressed;
    }
    setAlong('counting');
    const first = clock.tempoAt(1);
    const gap = 60 / first.bpm;
    for (let i = 0; i < first.beats; i++) setTimeout(() => { if (mine === alongRun.current) p.click?.(i === 0); }, i * gap * 1000);
    await new Promise(r => setTimeout(r, first.beats * gap * 1000));
    if (mine !== alongRun.current) return;
    const stopAt = clock.seconds(end);
    const take = createLiveTake({ startBeat: 0, bpm: first.bpm, beatsPerBar: first.beats, beatOf: t => clock.beat(t) });
    take.begin(0);
    live.current.take = take;
    const t0 = p.now();
    alongClock.current = el ? () => el.currentTime : () => p.now() - t0;
    if (el) {
      el.src = url;
      el.addEventListener('ended', () => { if (mine === alongRun.current) finishAlong(); });
      try { await el.play(); } catch { /* the page's sound was refused: the clock still runs */ }
    }
    if (mine !== alongRun.current) return;
    setAlong('on');
    setRecording('on');
    let lastBeat = -1;
    const tick = (): void => {
      if (mine !== alongRun.current || !alongClock.current) return;
      const t = alongClock.current();
      if (t >= stopAt) { finishAlong(); return; }
      const beat = clock.beat(t);
      drawAt(beat, true);
      if (!el && Math.floor(beat + 1e-6) !== lastBeat) {
        lastBeat = Math.floor(beat + 1e-6);
        p.click?.(Math.abs(clock.barStartBeat(clock.barOfBeat(lastBeat)) - lastBeat) < 1e-6);
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  useEffect(() => () => { alongRun.current++; alongAudio.current?.pause(); }, []);
  const startCountIn = (): void => {
    if (!recordPart) return;
    setRecording('counting');
    const beats = clock.tempoAt(1).beats;
    const gap = 60 / bpm;
    for (let i = 0; i < beats; i++) setTimeout(() => p.click?.(i === 0), i * gap * 1000);
    setTimeout(() => { newTake(p.now()); setRecording('on'); }, beats * gap * 1000);
  };
  /** A key went down in the Record drawer: on screen, on the computer keyboard or on a plugged-in keyboard or drum pad. */
  const keyDown = (pitch: number, key: string, velocity = 90, drum = false): void => {
    const s = state.current;
    if (!s.recordPart || live.current.pressed.has(key)) return;
    if (drum && !s.recordEntry?.pieces) { say('Drum pads play a drum track: open a Drum Kit track\'s Record drawer.'); return; }
    live.current.pressed.set(key, pitch);
    pin.hold(key);
    if (live.current.handles.has(pitch)) return;
    const x = s.recordPart;
    live.current.handles.set(pitch, p.sampler.start({ instrument: x.instrument, gain_db: x.gain_db, attack: x.attack, release: x.release }, pitch, velocity));
    setHeld(h => new Set(h).add(pitch));
    if (s.mode === 'live' && (alongClock.current || along === 'off')) {
      const take = live.current.take ?? newTake(null);
      take.down(pitch, liveNow(), velocity);
      setRecording('on');
    } else if (s.mode === 'step') gather.down(pitch, p.now(), velocity);
    pin.keep();
  };
  const keyUp = (key: string): void => {
    const pitch = live.current.pressed.get(key);
    if (pitch === undefined) return;
    live.current.pressed.delete(key);
    pin.release(key);
    if ([...live.current.pressed.values()].includes(pitch)) return;
    const handle = live.current.handles.get(pitch);
    if (handle === undefined) return;
    live.current.handles.delete(pitch);
    p.sampler.stop(handle);
    setHeld(h => { const n = new Set(h); n.delete(pitch); return n; });
    const s = state.current;
    if (s.mode === 'live') live.current.take?.up(pitch, liveNow());
    else if (s.mode === 'step' && s.recordPart) {
      const ch = gather.up(pitch, p.now());
      if (!ch) return;
      const beats = ch.held ?? stepBeats(s.length, s.dotted, s.quarter);
      const added = addNotes(s.doc, s.recordPart.id, ch.pitches.map((pp, i) => ({ start: step.cursor(), length: beats, pitch: pp, velocity: ch.velocities[i] })));
      step.add(beats, added.ids);
      setStepAt(step.cursor());
      apply(added.doc);
    }
  };
  const key = useMemo(() => keyScale(doc.parts.filter(x => !entryOf(x)?.pieces).flatMap(x => x.notes.map(n => n.pitch))), [doc.parts]);
  const addHum = (segs: HumSegment[]): void => {
    const x = recordPart;
    if (!x || segs.length === 0) return;
    const base = humPlace === 'replace' ? clearPart(doc, x.id) : doc;
    const startBeat = humPlace === 'replace' ? 0 : humPlace === 'line' ? clock.barStartBeat(clock.barOfBeat(cursor + 1e-9)) : afterPart(x);
    const bar = clock.barOfBeat(startBeat);
    const made = humNotes(segs, { snap: humSnap, classes: key.classes, startBeat, bpm: clock.tempoAt(bar).bpm, tidy, quarter: clock.quarter(bar) });
    const added = addNotes(base, x.id, made.map((m, i) => (m.bend ? { ...m.note, bend: bendFractions(m.bend, segs[i]!) } : m.note)));
    apply(added.doc, `Added ${made.length} hummed ${made.length === 1 ? 'note' : 'notes'} at bar ${bar}${humPlace === 'replace' ? ', in place of the track\'s notes' : ''}. Undo takes ${made.length === 1 ? 'it' : 'them'} back.`);
    setPick({ kind: 'notes', part: x.id, ids: new Set(added.ids) });
  };

  // ---- Keys ----
  const keyRef = useRef<{ keyDown: typeof keyDown; keyUp: typeof keyUp; undo(): void; redo(): void; onKey(e: KeyboardEvent): boolean }>({ keyDown, keyUp, undo, redo, onKey: () => false });
  const onKey = (e: KeyboardEvent): boolean => {
    const s = state.current;
    const c = ctlRef.current!;
    const mod = e.ctrlKey || e.metaKey;
    // Placing an effect from the keys: arrows choose the track and the bar (Shift for a beat), Enter places; Cancel on the banner stops.
    if (s.placing) {
      const rows = ['lane', ...s.doc.parts.map(x => x.id)];
      const now = s.drop ?? targetFor(s.doc, s.placing, s.sel ?? 'lane', clock.barStartBeat(clock.barOfBeat(s.cursor + 1e-9)));
      if (e.key === 'Enter') { if (!now.bad) placeAt(now); else say(now.bad); return true; }
      if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return false;
      let i = Math.max(0, rows.indexOf(now.lane ?? 'lane'));
      const barLen = clock.tempoAt(1).beats;
      let at = s.cursor;
      if (s.drop) { const whole = Math.floor(s.drop.from_bar); at = clock.barStartBeat(whole) + (s.drop.from_bar - whole) * barLen; }
      if (e.key === 'ArrowUp') i = Math.max(0, i - 1);
      if (e.key === 'ArrowDown') i = Math.min(rows.length - 1, i + 1);
      if (e.key === 'ArrowLeft') at -= e.shiftKey ? 1 : barLen;
      if (e.key === 'ArrowRight') at += e.shiftKey ? 1 : barLen;
      setDrop(targetFor(s.doc, s.placing, rows[i]!, Math.max(0, Math.min(end, at))));
      return true;
    }
    if (e.code === 'Space' && !mod) { if (playingRef.current) stop(); else void play(); return true; }
    if (mod && e.code === 'KeyZ') { if (e.shiftKey) redo(); else undo(); return true; }
    if (mod && e.code === 'KeyY') { redo(); return true; }
    if (s.view !== 'compose') return false;
    if (mod && e.code === 'KeyC') return copyPicked(c, setClipboard);
    if (mod && e.code === 'KeyV') return pasteAtCursor(c, clipboardRef.current);
    if (mod && e.code === 'KeyA') {
      const x = s.doc.parts.find(y => y.id === s.sel);
      if (!x || !x.notes.length) return false;
      setPick({ kind: 'notes', part: x.id, ids: new Set(x.notes.map(n => n.id)) });
      toggleOpen(x.id, true);
      return true;
    }
    if (mod && e.code === 'KeyD') {
      const k = s.pick;
      if (k.kind === 'region') { const made = duplicateRegion(s.doc, k.part, k.id); apply(made.doc); setPick({ kind: 'region', part: k.part, id: made.id }); return true; }
      return false;
    }
    if (mod || e.altKey) return false;
    // Type Notes: the computer keyboard adds notes at the shaded step, which only the arrows move.
    const typed = s.typing ? s.doc.parts.find(y => y.id === s.sel && !y.vocal && !entryOf(y)?.pieces) : undefined;
    if (typed) {
      const low = lowOf(typed);
      const pitch = typedPitch(e.code, low, s.doc.key, prefsRef.current.inKey);
      if (pitch !== null) {
        if (e.repeat) return true;
        const made = typeNote(s.doc, typed.id, pitch, s.cursor, s.len);
        if (made.added) apply(made.doc);
        if (pitch > low + ROLL_ROWS - 1) setLow(typed.id, low + 12);
        previewNote(typed, pitch, Math.min(s.len, 2));
        return true;
      }
      if (e.code === 'ArrowRight' || e.code === 'Enter') { setCursor(Math.min(end, s.cursor + s.len)); return true; }
      if (e.code === 'ArrowLeft') { setCursor(Math.max(0, s.cursor - s.len)); return true; }
      if (e.code === 'Backspace' || e.code === 'Delete') { apply(clearStep(s.doc, typed.id, s.cursor)); return true; }
      if (e.code === 'KeyZ') { setLow(typed.id, low - 12); return true; }
      if (e.code === 'KeyX') { setLow(typed.id, low + 12); return true; }
    }
    // The Record drawer: the keys play the track (Play Live records, Step adds at the dashed line).
    if (s.recordPart && (s.mode === 'live' || s.mode === 'step')) {
      if (e.code === OCTAVE_DOWN || e.code === OCTAVE_UP) {
        if (!e.repeat) setKeysFrom(Math.min(108, Math.max(0, s.keysStart + (e.code === OCTAVE_UP ? 12 : -12))));
        return true;
      }
      const pitch = pitchForKey(e.code, s.keysStart);
      if (pitch !== null) { if (!e.repeat) keyDown(pitch, e.code); return true; }
    }
    const k = s.pick;
    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (k.kind === 'notes') { apply(removeNotes(s.doc, k.part, k.ids), 'Deleted. Undo brings them back.'); setPick({ kind: 'none' }); return true; }
      if (k.kind === 'region') { apply(deleteRegion(s.doc, k.part, k.id), 'Deleted the region. Undo brings it back.'); setPick({ kind: 'none' }); return true; }
      return false;
    }
    if (k.kind === 'notes' && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
      const x = s.doc.parts.find(y => y.id === k.part);
      if (x && !entryOf(x)?.pieces) apply(transposeNotes(s.doc, k.part, k.ids, (e.key === 'ArrowUp' ? 1 : -1) * (e.shiftKey ? 12 : 1)));
      return true;
    }
    if (k.kind === 'notes' && (e.key === 'ArrowLeft' || e.key === 'ArrowRight') && !(e.target instanceof HTMLElement && e.target.closest('.grip'))) {
      const x = s.doc.parts.find(y => y.id === k.part);
      const unit = x && entryOf(x)?.pieces ? s.quarter / 4 : Math.min(s.len, 1);
      apply(shiftNotes(s.doc, k.part, k.ids, (e.key === 'ArrowRight' ? 1 : -1) * unit));
      return true;
    }
    if (e.code === 'KeyS' && !e.repeat) {
      const id = k.kind === 'region' ? k.part : s.sel;
      const x = s.doc.parts.find(y => y.id === id);
      if (!x) return false;
      const at = Math.round(s.cursor);
      const r = (x.regions ?? []).find(q => at > q.start && at < q.start + q.length);
      const made = r ? splitRegion(s.doc, x.id, r.id, at) : null;
      if (made) { apply(made.doc); setPick({ kind: 'region', part: x.id, id: made.id }); } else setSplitting(true);
      return true;
    }
    return false;
  };
  keyRef.current = { keyDown, keyUp, undo, redo, onKey };
  const clipboardRef = useRef(clipboard);
  clipboardRef.current = clipboard;
  const chordRef = useRef(chord);
  chordRef.current = chord;
  const splittingRef = useRef(splitting);
  splittingRef.current = splitting;
  useEffect(() => {
    const down = (e: KeyboardEvent): void => {
      if (isTyping(e.target) || (e.target instanceof Element && e.target.closest('[data-pop]'))) return;
      // Enter and the space bar on a focused button press that button, whatever else they do.
      if ((e.key === 'Enter' || e.key === ' ') && e.target instanceof HTMLElement && e.target.closest('button,[role="button"]') && !ctlRef.current?.placing) return;
      if (keyRef.current.onKey(e)) e.preventDefault();
    };
    const up = (e: KeyboardEvent): void => keyRef.current.keyUp(e.code);
    const blur = (): void => { for (const k of [...live.current.pressed.keys()]) keyRef.current.keyUp(k); };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('blur', blur);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); window.removeEventListener('blur', blur); };
  }, []);
  // A key changed the page (a readout, a note on the grid): put it back where it was pinned.
  useEffect(() => { pin.keep(); });

  // ---- Saving ----
  const saveDoc = async (d: EditDoc, files: Record<string, Uint8Array> = {}): Promise<boolean> => {
    setSaving(true);
    let result: Saved;
    try {
      result = await saveScore(p.api, scoreOf(d), files);
    } catch (e) {
      result = { ok: false, message: `The draft could not be saved: ${e instanceof Error ? e.message : String(e)} Your edit is still here.` };
    } finally {
      setSaving(false);
    }
    if (result.ok) {
      setVersion(result.version);
      setSavedDoc(d);
      say(`Saved as draft ${result.version}.`);
      p.onSaved?.(p.start.piece.id, result.version);
      return true;
    }
    if (result.latest !== undefined) setVersion(result.latest);
    say(result.message);
    return false;
  };
  const save = async (): Promise<void> => {
    const local = takesOf(doc).filter(f => LOCAL_TAKE_RE.test(f));
    if (local.length === 0 || !p.vocal) { await saveDoc(doc); return; }
    const meta = await p.vocal.takes.list(p.start.piece.id);
    const list: TakeToSave[] = [];
    for (const id of local) {
      const pcm = await p.vocal.takes.pcm(id);
      const m = meta.find(t => t.id === id);
      if (!pcm || !m) { say('A take of this piece is no longer on this device, so it cannot be saved. Remove its clips, then save again.'); return; }
      list.push({ id, name: m.name, pcm, rate: m.rate });
    }
    setChoosing(list);
  };
  const saveWithTakes = async (chosen: Map<string, { enc: Encoded; seconds: number }>): Promise<void> => {
    const v = p.vocal!;
    setChoosing(null);
    const { doc: renamed, files, names } = await withSavedTakes(doc, chosen, { sha256: v.sha256 });
    if (!(await saveDoc(renamed, files))) return;
    const meta = await v.takes.list(p.start.piece.id);
    for (const [id, name] of names) {
      const m = meta.find(t => t.id === id);
      if (m) await v.takes.update({ ...m, saved: name });
    }
    apply(renamed);
    setSavedDoc(history.now());
    setRoom(r => r - Object.values(files).reduce((n, b) => n + b.length, 0));
  };

  // ---- Files ----
  const importFile = async (file: File): Promise<void> => {
    if (!p.files) return;
    say(`Reading ${file.name}…`);
    try {
      const read = await readMusicFile(file.name, new Uint8Array(await file.arrayBuffer()), p.files.importPorts);
      const v = previewOf(read, file.name, p.entries);
      setPreview(v);
      setChoice(v.parts.map(x => x.match));
      say('');
    } catch (e) {
      setPreview(null);
      say(e instanceof ImportError ? e.message : `${file.name} could not be read: ${e instanceof Error ? e.message : String(e)}`);
    }
  };
  const addImported = (): void => {
    if (!preview) return;
    try {
      const next = addAsNewParts(doc, preview, choice, p.entries);
      apply(next, `Added ${preview.parts.length} ${preview.parts.length === 1 ? 'track' : 'tracks'} from ${preview.file}. Undo takes them back.`);
      setSelState(next.parts[doc.parts.length]?.id ?? sel);
      setPreview(null);
    } catch (e) {
      say(e instanceof Error ? e.message : String(e));
    }
  };
  const newFromImport = (): void => {
    if (!preview || !p.onNewPiece) return;
    if (dirty) { say('Save Draft first, or Undo your changes: Start A New Piece leaves this piece.'); return; }
    const title = (preview.title ?? preview.file.replace(/\.[a-z]+$/i, '')).slice(0, 120);
    p.onNewPiece(newDocFrom(preview, choice, p.entries, title), title);
  };
  const exportAs = (kind: 'musicxml' | 'mid'): void => {
    const notes = notesOnly(doc);
    if (!p.files || notes.parts.length === 0) return;
    const data = kind === 'musicxml'
      ? new Blob([toMusicXml(notes, p.entries, { colours: false })], { type: 'application/vnd.recordare.musicxml+xml' })
      : new Blob([writeMidi(notes, p.entries) as Uint8Array<ArrayBuffer>], { type: 'audio/midi' });
    p.files.save(`${p.start.piece.id}.${kind}`, data);
    say(`Exported ${p.start.piece.id}.${kind}.`);
  };
  const exportVocals = async (): Promise<void> => {
    const v = p.vocal;
    if (!p.files || !v) return;
    say('Putting the vocals together…');
    try {
      const meta = await v.takes.list(p.start.piece.id);
      const zip = await exportWithVocals(doc, p.entries, p.start.piece.id, {
        saved: file => v.takeBytes(file),
        local: async id => { const pcm = await v.takes.pcm(id); const m = meta.find(t => t.id === id); return pcm && m ? { pcm, rate: m.rate } : null; },
      });
      p.files.save(`${p.start.piece.id}-with-vocals.zip`, new Blob([zip as Uint8Array<ArrayBuffer>], { type: 'application/zip' }));
      say(`Exported ${p.start.piece.id}-with-vocals.zip: the notes as MusicXML, each take as it is kept, and where each clip plays.`);
    } catch (e) {
      say(`The vocals could not be exported: ${e instanceof Error ? e.message : String(e)}`);
    }
  };

  // ---- Tracks ----
  const addInstrument = (e: Entry): void => {
    const made = addPart(doc, e);
    if (!made) { say('A piece holds at most 16 tracks.'); return; }
    apply(made.doc, `Added ${e.name}: an empty track. Tap its grid to put notes in.`);
    setStartOpen(false);
    setSelState(made.id);
    setOpen(o => new Set(o).add(made.id));
  };
  const addVocal = (): void => {
    let n = 1;
    while (doc.parts.some(x => x.id === (n === 1 ? 'voice' : `voice-${n}`))) n++;
    const id = n === 1 ? 'voice' : `voice-${n}`;
    apply({ ...doc, parts: [...doc.parts, newVocalPart(id, n === 1 ? 'Vocal Track' : `Vocal Track ${n}`, PART_COLOURS[doc.parts.length % PART_COLOURS.length]!)] });
    setSelState(id);
    setOpen(o => new Set(o).add(id));
  };
  const vocalBacking = async (partIdNow: string): Promise<AudioBuffer | null> => {
    const full = scoreOf(state.current.doc);
    const others: Score = { ...full, lanes: full.lanes.filter(l => l.id !== partIdNow), notes: full.notes.filter(n => n.lane !== partIdNow), motifs: [] };
    if (others.lanes.length === 0 || (others.notes.length === 0 && !others.lanes.some(l => l.vocal?.clips.length))) return null;
    const built = await p.buildSound(`vocal-${editKey(state.current.doc)}-${partIdNow}`, others, () => {});
    const b = new AudioBuffer({ length: built.channels[0]!.length, numberOfChannels: built.channels.length, sampleRate: built.rate });
    built.channels.forEach((ch, i) => b.copyToChannel(ch as Float32Array<ArrayBuffer>, i));
    return b;
  };

  /** Start A Song: a template replaces the song (Undo brings the old one back). */
  const pickTemplate = (id: TemplateId): void => {
    stop();
    const t = TEMPLATES.find(x => x.id === id)!;
    const next = templateDoc(id, p.entries, doc.title);
    fresh.current = true;
    apply(next, `${t.name}: ${next.parts.length ? `${next.parts.length} ${next.parts.length === 1 ? 'track' : 'tracks'} to change as you like.` : 'an empty song.'} Undo brings back what was here.`);
    setOpen(new Set());
    setSelState(next.parts.find(x => !entryOf(x)?.pieces)?.id ?? next.parts[0]?.id ?? null);
    setCursorState(0);
    setLoopState(null);
    setStartOpen(false);
  };

  const c: Ctl = {
    doc, entries: p.entries, clock, bars, total, end, ppb, coarse, open, sel, pick, len, lengths, selectMode, chord, splitting, typing, cursor,
    loop, loopOn, placing, flash, playing, recordOpen, renaming, paletteOpen,
    entryOf, drums: x => !!entryOf(x)?.pieces, low: lowOf, setLow, apply, say, setPick, setSel: setSelState, toggleOpen,
    setLen, setSelectMode: on => { setSelectMode(on); if (on) setChord(null); }, setChord, setSplitting, setTyping, setCursor,
    setLoop: range => { setLoopState(range); if (range) setLoopOn(true); }, preview: previewNote, hearInstrument, playFrom,
    openPop: (name, anchor, arg) => setPop({ name, anchor, arg }), head: ctlRef.current?.head ?? null, startPlacing, placeAt,
    setRecordOpen: id => { if (live.current.take) commitTake(); if (along !== 'off') finishAlong(); if (id !== recordOpen) setKeysFrom(null); setRecordOpen(id); if (id) setSelState(id); },
    setRenaming, setPaletteOpen,
  };
  ctlRef.current = c;

  const tools = (x: Part) => trackTools(x);
  const drawer = (x: Part) => (recordOpen === x.id ? recordDrawer(x) : null);
  const recordDrawer = (x: Part) => {
    const e = entryOf(x);
    if (!e) return null;
    return (
      <div class="grid gap-3 rounded-lg border border-amber bg-panel p-3" data-record-drawer={x.id}>
        <div class="flex flex-wrap items-center gap-2">
          <strong class="font-display text-lg">Record Into {x.name}</strong>
          <div role="tablist" aria-label="Ways To Record" class="cmp-modes">
            {MODES.filter(m => m.id !== 'hum' || p.hum).map(m => (
              <button type="button" role="tab" aria-selected={m.id === mode} onClick={() => { if (along !== 'off') finishAlong(); else if (live.current.take) commitTake(); setMode(m.id); }}>{m.label}</button>
            ))}
          </div>
          <button type="button" class="cmp-icon ml-auto" aria-label="Close Record" onClick={() => c.setRecordOpen(null)}><Glyph name="close" /></button>
        </div>
        <p class="text-sm text-dim">{MODES.find(m => m.id === mode)!.help}</p>
        {mode === 'live' ? (
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-sm">Tidy To</span>
            {GRIDS.map(g => <button type="button" class="cmp-btn small" aria-pressed={tidy === g} onClick={() => setTidy(g)}>{GRID_LABELS[g]}</button>)}
            <button type="button" class="cmp-btn small" aria-pressed={countIn} onClick={() => setCountIn(!countIn)}>Count-In: {countIn ? 'On' : 'Off'}</button>
            {along !== 'off' ? <button type="button" class="cmp-btn danger" data-along-stop="" onClick={finishAlong}>■ Stop Playing Along</button>
              : recording !== 'idle' ? <button type="button" class="cmp-btn danger" onClick={commitTake}>Stop Recording</button>
              : countIn ? <button type="button" class="cmp-btn danger" onClick={startCountIn}>● Record</button> : null}
            {along === 'off' && recording === 'idle' ? <button type="button" class="cmp-btn" onClick={() => void playAlong()}>▶ Play Along</button> : null}
            <button type="button" class="cmp-btn small" aria-pressed={alongParts} disabled={along !== 'off'} onClick={() => setAlongParts(!alongParts)}>Hear The Other Tracks: {alongParts ? 'On' : 'Off'}</button>
          </div>
        ) : mode === 'step' ? (
          <div class="flex flex-wrap items-center gap-1">
            {STEP_LENGTHS.map(l => <button type="button" class="cmp-btn small" aria-pressed={length === l.id} data-length={l.id} onClick={() => setLength(l.id)}>{l.label}</button>)}
            <button type="button" class="cmp-btn small" aria-pressed={dotted} onClick={() => setDotted(!dotted)}>Dotted</button>
            <button type="button" class="cmp-btn small" onClick={() => { step.rest(stepBeats(length, dotted, quarter)); setStepAt(step.cursor()); }}>+ Rest</button>
            <button type="button" class="cmp-btn small" onClick={() => { const s = step.back(); if (s) { if (s.ids.length) apply(removeNotes(doc, x.id, new Set(s.ids))); setStepAt(step.cursor()); } }}>‹ Back One</button>
          </div>
        ) : p.hum ? (
          <HumPanel ports={p.hum} snap={humSnap} onSnap={setHumSnap} place={humPlace} onPlace={setHumPlace} tidy={tidy} onTidy={setTidy}
            keyName={key.name} classes={key.classes} onAdd={addHum} help={help} />
        ) : null}
        <p data-live-state="" class="h-6 truncate font-mono text-sm text-dim">
          {mode === 'live' ? (along === 'ready' ? 'Getting the other tracks ready…' : along === 'counting' ? 'Counting in: one bar…' : along === 'on' ? `● Playing Along${held.size ? ` · ${[...held].map(pitchName).join(' ')}` : ''}`
            : recording === 'counting' ? 'Counting in…' : recording === 'on' ? `● Recording · ${[...held].map(pitchName).join(' ') || 'waiting for a bar of quiet'}`
            : `Press a key to start recording at ${barWords(clock, afterPart(x))}.`)
            : mode === 'step' ? `Next note at ${barWords(clock, stepAt)}${held.size ? ` · ${[...held].map(pitchName).join(' ')}` : ''}`
            : `Hummed notes go at ${humPlace === 'replace' ? 'bar 1, in place of the track\'s notes' : barWords(clock, humPlace === 'line' ? clock.barStartBeat(clock.barOfBeat(cursor + 1e-9)) : afterPart(x))}.`}
        </p>
        {mode !== 'hum' ? <Keyboard entry={e} start={keysStart} held={held} onStart={setKeysFrom} onDown={q => keyDown(q, `screen:${q}`)} onUp={q => keyUp(`screen:${q}`)} /> : null}
        {mode !== 'hum' ? <p class="text-xs text-dim">On a computer keyboard, A S D F G H J K play the white keys and W E T Y U the black ones; Z and X move down and up an octave.</p> : null}
        <YourKeyboard request={p.midi} program={e.pieces ? null : e.gm} drums={e.pieces ? new Map(e.pieces) : null} help={help}
          onDown={(k, q, velocity, drum) => keyRef.current.keyDown(q, k, velocity, drum)} onUp={k => keyRef.current.keyUp(k)} />
      </div>
    );
  };
  const vocalPanel = (x: Part) => (p.vocal ? (
    <VocalPanel doc={doc} part={x} piece={p.start.piece.id} ports={p.vocal} help={help} apply={apply} status={say}
      backing={() => vocalBacking(x.id)} beat={60 / clock.tempoAt(1).bpm} beats={clock.tempoAt(1).beats}
      clicks={Array.from({ length: Math.ceil(end) }, (_, i) => clock.seconds(i))}
      renamed={(from, to, seconds) => setSavedDoc(d => renameTake(d, from, to, seconds))} />
  ) : <p class="text-sm text-dim">Vocal Tracks are not available on this page.</p>);
  const adds = (
    <div class="flex flex-wrap gap-2">
      <button type="button" class="cmp-btn border-dashed" data-add-instrument="" data-pop-anchor="" disabled={doc.parts.length >= 16}
        onClick={e => setPop({ name: 'add', anchor: e.currentTarget as HTMLElement })}><Glyph name="plus" />Add Instrument</button>
    </div>
  );
  const heard = muteStatus(doc);
  const menu = pop?.name === 'more' ? (
    <Pop title="Piece" anchor={pop.anchor} onClose={() => setPop(null)} name="more">
      <div class="grid">
        <PopItem glyph="save" label={saving ? 'Saving…' : 'Save Draft'} onClick={() => { setPop(null); void save(); }} data={{ 'data-menu-save': '' }} />
        {p.files ? <PopItem glyph="plus" label="Import Music File" onClick={() => { setPop(null); fileInput.current?.click(); }} /> : null}
        {p.files && notesOnly(doc).parts.length ? <PopItem glyph="staff" label="Export MusicXML" onClick={() => { setPop(null); exportAs('musicxml'); }} /> : null}
        {p.files && notesOnly(doc).parts.length ? <PopItem glyph="keys" label="Export MIDI" onClick={() => { setPop(null); exportAs('mid'); }} /> : null}
        {p.files && p.vocal && doc.parts.some(x => x.vocal) ? <PopItem glyph="mic" label="Export With Vocals" onClick={() => { setPop(null); void exportVocals(); }} /> : null}
        <PopItem glyph="sliders" label="Song" onClick={() => setPop({ name: 'song', anchor: pop.anchor })} data={{ 'data-menu-song': '' }} />
        <PopItem glyph="song" label="Start A Song" onClick={() => { setPop(null); setStartOpen(true); setView('compose'); }} data={{ 'data-menu-start': '' }} />
        <PopItem glyph="dial" label="Colors And Style" onClick={() => setPop({ name: 'looks', anchor: pop.anchor })} data={{ 'data-menu-looks': '' }} />
        <PopItem glyph="flag" label="Markers" onClick={() => setPop({ name: 'marker', anchor: pop.anchor })} />
        {p.vocal ? <PopItem glyph="mic" label="Add Vocal Track" onClick={() => { setPop(null); addVocal(); }} /> : null}
      </div>
    </Pop>
  ) : null;

  return (
    <div data-composer="" class={cx('cmp', playing && 'playing')} data-colors={look.colors} data-style={look.style} data-mode={look.mode}>
      <header class="grid gap-1">
        <div class="flex flex-wrap items-baseline gap-x-3">
          <h1 class="font-display text-3xl font-semibold tracking-wide break-words uppercase">{p.start.piece.title}</h1>
          <p data-draft-line="" class="font-mono text-sm text-dim">{version === 0 ? 'New Piece · not saved yet' : `Draft ${version}${dirty ? ' · changed since' : ''}`} · {bpm} BPM · {clock.tempoAt(1).beats}/{clock.tempoAt(1).unit}</p>
        </div>
      </header>
      <Transport playing={playing} getting={getting} onPlay={() => void play()} onStop={stop} onRewind={() => { setCursor(0); if (audio.current) void play(0); }}
        loopOn={loopOn} onLoop={() => setLoopOn(!loopOn)} bpm={bpm} onBpm={v => apply(setPieceSpeed(doc, Math.max(40, Math.min(240, v))))}
        readout={readout} undos={history.undoCount()} redos={history.redoCount()} onUndo={undo} onRedo={redo}
        saving={saving} canSave={doc.parts.length > 0} onSave={() => void save()} onMenu={a => setPop({ name: 'more', anchor: a })}
        view={view} onView={v => { setView(v); if (v !== 'compose') startPlacing(null); }}
        click={prefs.click} onClick={() => setPrefs({ ...prefs, click: !prefs.click })}
        onSong={a => setPop({ name: 'song', anchor: a })} startOpen={startOpen} onStart={() => { setStartOpen(!startOpen); setView('compose'); }}
        onLooks={a => setPop({ name: 'looks', anchor: a })} />
      <Coach done={done} hidden={tips === 'hidden'} onHide={() => { tipsPref.set('hidden'); setTips('hidden'); }} onShow={() => { tipsPref.set('shown'); setTips('shown'); }} />
      <input ref={fileInput} type="file" accept={ACCEPT} class="hidden" data-import-file="" aria-label="Import Music File"
        onChange={e => { const f = (e.target as HTMLInputElement).files?.[0]; (e.target as HTMLInputElement).value = ''; if (f) void importFile(f); }} />
      <p data-status="" role="status" class="cmp-status">{status}</p>
      {preview ? (
        <ImportPreview preview={preview} choice={choice} entries={p.entries} piece={p.start.piece.title}
          onChoice={(i, id) => setChoice(cs => cs.map((x, j) => (j === i ? id : x)))}
          onAdd={addImported} onNew={newFromImport} onCancel={() => { setPreview(null); say('Nothing was imported.'); }} />
      ) : null}
      {choosing && p.vocal ? (
        <SaveTakes takes={choosing} room={room} quality={p.vocal.quality} opus={p.vocal.opus}
          onCancel={() => { setChoosing(null); say('Not saved. Your takes are still on this device.'); }} onSave={chosen => void saveWithTakes(chosen)} />
      ) : null}

      {view === 'compose' ? (
        <>
          {startOpen ? <StartSong entries={p.entries} onPick={pickTemplate} onHide={() => setStartOpen(false)} /> : null}
          <div class="cmp-bar" data-hear-bar="">
            <span class="cmp-seg" role="group" aria-label="Sound">
              <button type="button" disabled={!doc.parts.length} onClick={() => apply(setAllMuted(doc, true))}><Glyph name="spk-off" size={16} /><span class="ml-1">Mute All</span></button>
              <button type="button" disabled={!doc.parts.length} onClick={() => apply(setAllMuted(doc, false))}><Glyph name="spk" size={16} /><span class="ml-1">Unmute All</span></button>
            </span>
            <span class="cmp-seg" role="group" aria-label="Tracks">
              <button type="button" disabled={!doc.parts.length} onClick={() => setOpen(new Set(doc.parts.map(x => x.id)))}><Glyph name="expand" size={16} /><span class="ml-1">Expand All</span></button>
              <button type="button" disabled={!doc.parts.length} onClick={() => setOpen(new Set())}><Glyph name="collapse" size={16} /><span class="ml-1">Collapse All</span></button>
            </span>
            <span class="cmp-seg ml-auto" role="group" aria-label="Zoom">
              <button type="button" aria-label="Zoom Out" title="Zoom out" onClick={() => setZoom(z => Math.max(0.4, z / 1.4))}><Glyph name="zoom-out" size={16} /></button>
              <button type="button" aria-label="Zoom In" title="Zoom in" onClick={() => setZoom(z => Math.min(4, z * 1.4))}><Glyph name="zoom-in" size={16} /></button>
            </span>
            <p class="basis-full text-sm text-dim" data-mute-status="">{heard}</p>
          </div>
          {paletteOpen ? <FxPalette c={c} hear={effect => void hearFx(effect)} hearing={hearingFx} setDrop={setDrop} /> : null}
          <Arrange c={c} onWidth={setWidth} tools={tools} drawer={drawer} vocal={vocalPanel} adds={adds} drop={drop} setDrop={setDrop}
            clipSettings={i => <FxSettings c={c} index={i} building={getting} hearFrom={bar => { const b = clock.barStartBeat(bar); did('fx'); setCursorState(b); void play(b); }} />} />
        </>
      ) : view === 'mix' ? (
        <MixPanels c={c} register={registerMix}
          more={x => (
            <>
              {entryOf(x) || x.vocal ? (
                <SoundPanel part={x} others={doc.parts.filter(y => y.id !== x.id).map(y => ({ id: y.id, name: y.name }))} mix={mixOf(doc)} help={help}
                  onFx={change => apply(setLaneFx(doc, x.id, change))} onVoice={chain => apply(setVoice(doc, x.id, chain))}
                  onMix={change => apply(setMix(doc, change))} live={p.live ? chain => p.live!(chain, key.classes) : undefined} />
              ) : null}
              {entryOf(x) ? (
                <SpeedPanel doc={doc} part={x} bars={bars} help={help}
                  onPieceSpeed={v => apply(setPieceSpeed(doc, v))} onLine={marks => apply(setTempoLine(doc, marks))}
                  onPartSpeed={speed => apply(setPartSpeed(doc, x.id, speed))} onLoudness={marks => apply(setDynamics(doc, x.id, marks))} />
              ) : null}
            </>
          )}
          dj={doc.parts.length && p.dj ? (
            <DjMode doc={doc} ports={p.dj} pin={pin} help={help} apply={apply} status={say} onLive={() => {}}
              onPlaceCrossfade={() => { say('Tap the track that fades out, at the bar where the crossfade should start.'); startPlacing('crossfader'); }}
              onFader={() => did('xf')}
              score={only => {
                const full = scoreOf(doc);
                if (!only) return full;
                const keep = new Set(only);
                const clips = (full.fx_clips ?? []).filter(k => k.lane !== null && keep.has(k.lane) && k.effect !== 'vocoder');
                const s: Score = { ...full, lanes: full.lanes.filter(l => keep.has(l.id)), notes: full.notes.filter(n => keep.has(n.lane)), motifs: [] };
                if (clips.length) s.fx_clips = clips; else delete s.fx_clips;
                return s;
              }}
              build={(k, score) => p.buildSound(`${k}-${editKey(doc)}`, score, () => {})} />
          ) : <p class="text-dim">{doc.parts.length ? 'The decks are not available on this page.' : 'Add a track in Compose to use the decks.'}</p>}
          clipSettings={i => <FxSettings c={c} index={i} building={getting} hearFrom={bar => { const b = clock.barStartBeat(bar); did('fx'); setCursorState(b); void play(b); }} />}
          showClip={i => {
            setView('compose');
            const clip = i >= 0 ? doc.fxClips?.[i] : undefined;
            if (clip) { setPick({ kind: 'clip', index: i }); setCursor(beatOfBar(c, clip.from_bar)); }
          }} />
      ) : (
        <SheetView c={c} register={registerSheet} engraved={p.files ? (
          <div class="grid gap-2" data-engraved="">
            <div class="cmp-bar">
              <button type="button" class="cmp-btn small" aria-expanded={engraved} data-engraved-toggle="" onClick={() => setEngraved(!engraved)}><Glyph name="staff" size={16} />{engraved ? 'Hide Engraved Sheet Music' : 'Engraved Sheet Music'}</button>
              {engraved ? doc.parts.filter(x => !x.vocal).map(x => (
                <button type="button" class="cmp-btn small" aria-pressed={part?.id === x.id} data-part={x.id} onClick={() => setSelState(x.id)}>
                  <span class="size-3 rounded-sm" style={{ background: x.color }} />{x.name}
                </button>
              )) : null}
            </div>
            {engraved && part && entry && !part.vocal ? (
              <>
                {entry.written !== 0 && !entry.pieces ? (
                  <div class="cmp-bar">
                    <button type="button" class="cmp-btn small" aria-pressed={concert} onClick={() => setConcert(!concert)}>Concert Pitch: {concert ? 'On' : 'Off'}</button>
                    <span class="text-sm text-dim">The {entry.name} is written {intervalWords(entry.written)} how it sounds; Concert Pitch shows how it sounds.</span>
                  </div>
                ) : null}
                <PartSheet doc={doc} part={part.id} entries={p.entries} concert={concert} bar={playing ? null : clock.barOfBeat(cursor + 1e-9)} loadSheet={p.files.loadSheet} boxRef={{ current: null }} />
              </>
            ) : null}
          </div>
        ) : null} />
      )}

      <ActionBar c={c} clip={clipboard} setClip={setClipboard} />
      <PlaceBanner c={c} />
      {menu}
      {pop?.name === 'marker' ? (
        <MarkerPop c={c} anchor={pop.anchor} onClose={() => setPop(null)}
          add={name => apply({ ...doc, markers: [...(doc.markers ?? []), { beat: Math.floor(cursor + 1e-9), name: name.slice(0, 24) }].sort((a, b) => a.beat - b.beat) }, `Added the marker ${name}.`)}
          remove={i => apply({ ...doc, markers: (doc.markers ?? []).filter((_, j) => j !== i) })} />
      ) : null}
      {pop?.name === 'song' ? (
        <SongPop c={c} anchor={pop.anchor} onClose={() => setPop(null)} prefs={prefs} setPrefs={setPrefs}
          setKey={k => apply(k ? { ...doc, key: k } : withoutKey(doc))}
          addMarker={name => apply({ ...doc, markers: [...(doc.markers ?? []), { beat: Math.floor(cursor + 1e-9), name: name.slice(0, 24) }].sort((a, b) => a.beat - b.beat) }, `Added the marker ${name}.`)}
          removeMarker={i => apply({ ...doc, markers: (doc.markers ?? []).filter((_, j) => j !== i) })} />
      ) : null}
      {pop?.name === 'looks' ? <LooksPop look={look} onLook={setLook} anchor={pop.anchor} onClose={() => setPop(null)} /> : null}
      {pop?.name === 'track' && pop.arg ? <TrackMenu c={c} part={pop.arg} anchor={pop.anchor} onClose={() => setPop(null)} /> : null}
      {pop?.name === 'chords' && pop.arg ? <ChordsPop c={c} part={pop.arg} anchor={pop.anchor} onClose={() => setPop(null)} setKey={k => apply(k ? { ...doc, key: k } : withoutKey(doc))} /> : null}
      {pop?.name === 'section-add' ? <SectionPop c={c} id={null} anchor={pop.anchor} onClose={() => setPop(null)} /> : null}
      {pop?.name === 'section-rename' && pop.arg ? <SectionPop c={c} id={pop.arg} anchor={pop.anchor} onClose={() => setPop(null)} /> : null}
      {pop?.name === 'add' ? <AddPop c={c} anchor={pop.anchor} onClose={() => setPop(null)} onAdd={addInstrument} onVocal={p.vocal ? addVocal : undefined} /> : null}
    </div>
  );

  /** The tool row of an open track: the instrument's name as the title, then the tools for its notes. */
  function trackTools(x: Part) {
    const e = entryOf(x);
    if (!e) return null;
    const drums = !!e.pieces;
    const low = lowOf(x);
    const outOfRange = !drums ? x.notes.filter(n => rangeClass(e, n.pitch) === 'out').length : 0;
    const picked = pick.kind === 'notes' && pick.part === x.id ? pick.ids : null;
    return (
      <div class="cmp-tools" data-tools={x.id}>
        <div class="cmp-ed-title" data-editor-title=""><Icon name={e.icon} size={22} class="self-center" /><strong data-instrument-name="">{e.name}</strong><span>· {drums ? 'Step Sequencer' : 'Piano Roll'}</span></div>
        {drums ? null : (
          <>
            <span class="cmp-label">New Notes</span>
            <span class="cmp-seg" role="group" aria-label="New Note Length">
              {lengths.map(([label, beats]) => <button type="button" aria-pressed={Math.abs(len - beats) < 1e-9} data-len={label} onClick={() => setLen(beats)}>{label}</button>)}
            </span>
            <span class="cmp-label">Octave</span>
            <span class="cmp-seg" role="group" aria-label="Octave">
              <button type="button" aria-label="Lower Octave" title="Lower octave" onClick={() => setLow(x.id, low - 12)}><Glyph name="chev-d" size={16} /></button>
              <button type="button" aria-label="Higher Octave" title="Higher octave" onClick={() => setLow(x.id, low + 12)}><Glyph name="chev-u" size={16} /></button>
            </span>
            <button type="button" class="cmp-btn small" aria-pressed={typing && sel === x.id} data-type-notes="" title="The computer keyboard adds notes at the shaded step"
              onClick={() => { const on = !(typing && sel === x.id); setTyping(on); setSelState(x.id); if (on) say('Type Notes: A to L add notes at the shaded step (W E T Y U O are the black keys). → moves on, ← back, Backspace clears the step, Z and X change the octave.'); }}>
              <Glyph name="keys" size={16} />{typing && sel === x.id ? 'Type Notes: On' : 'Type Notes'}
            </button>
          </>
        )}
        <button type="button" class="cmp-btn small" aria-pressed={selectMode} title="Drag a box around notes to pick them" onClick={() => c.setSelectMode(!selectMode)}>
          <Glyph name="select" size={16} />{selectMode ? 'Select: On' : 'Select'}
        </button>
        {drums ? null : <button type="button" class="cmp-btn small" aria-pressed={chord?.part === x.id} data-pop-anchor="" title="Put in a chord by its name"
          onClick={e2 => setPop({ name: 'chords', anchor: e2.currentTarget as HTMLElement, arg: x.id })}><Glyph name="chord" size={16} />Chords</button>}
        <button type="button" class="cmp-btn small" title="Split a region at the cursor (S), or tap where" onClick={() => {
          const at = Math.round(cursor);
          const r = (x.regions ?? []).find(g => at > g.start && at < g.start + g.length);
          const made = r ? splitRegion(doc, x.id, r.id, at) : null;
          if (made) { apply(made.doc); setPick({ kind: 'region', part: x.id, id: made.id }); } else setSplitting(true);
        }}><Glyph name="split" size={16} />Split</button>
        <button type="button" class="cmp-btn small" title="Snap the notes (or the picked ones) to the New Notes length"
          onClick={() => apply(fixTiming(doc, x.id, picked, drums ? quarter / 4 : len), picked ? 'The picked notes now start on the step.' : 'Every note now starts on the step.')}>
          <Glyph name="magnet" size={16} />Fix Timing
        </button>
        <button type="button" class="cmp-btn small" aria-pressed={recordOpen === x.id} data-record={x.id} onClick={() => c.setRecordOpen(recordOpen === x.id ? null : x.id)}>
          <Glyph name="mic" size={16} />Record
        </button>
        {outOfRange ? (
          <span class="flex flex-wrap items-center gap-2">
            <span data-out-of-range="" class="text-sm text-record">{outOfRange} {outOfRange === 1 ? 'note is' : 'notes are'} out of this instrument's range (red).</span>
            <button type="button" class="cmp-btn small" onClick={() => apply(moveIntoRange(doc, x.id, e), 'Moved the red notes by octaves into range. Undo puts them back.')}>Move Them Into Range</button>
          </span>
        ) : null}
      </div>
    );
  }
}

const withoutKey = (d: EditDoc): EditDoc => { const { key: _, ...rest } = d; return rest; };

/**
 * An audio element told to play in the press that asked for it, before it has any sound. A browser lets a page start
 * sound only in the moments after a press; a piece's sound can take longer than that to build, and a play() after it
 * would be refused, leaving the press doing nothing. Played in the press, the element is let play once its sound is
 * set, however long the build takes.
 */
export function pressedAudio(): HTMLAudioElement {
  const el = new Audio();
  el.play().catch(() => { /* nothing to play yet: setting its sound ends this first play */ });
  return el;
}

/** A key per document, so a document's sound is built once however often it is heard. */
const keys = new WeakMap<EditDoc, number>();
let nextKey = 1;
function editKey(doc: EditDoc): number {
  let k = keys.get(doc);
  if (k === undefined) { k = nextKey++; keys.set(doc, k); }
  return k;
}
