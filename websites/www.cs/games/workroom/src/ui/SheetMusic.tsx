// Sheet music: a picker (the Full Score, or one instrument), the notation in
// pages or as one long line that scrolls right, its zoom (buttons, a pinch,
// ctrl or cmd with the wheel, a trackpad pinch), a printed copy, and a lesson
// in reading it that lights the bar each step talks about. The notation library
// is a separate bundle, fetched when this view first opens.
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import type { HTMLAttributes } from 'preact';
import { term } from '../glossary.ts';
import { siblingUrl } from '../load.ts';
import { fullScore, onlyLane, titled } from '../musicxml.ts';
import type { Clip } from '../player.ts';
import { readingSteps, readLane } from '../reading.ts';
import type { LaneFacts, ReadingStep } from '../reading.ts';
import type { Lane } from '../score.ts';
import type { SheetHandle, SheetLayout } from '../sheetlife.ts';
import type { TempoMap } from '../tempo.ts';
import { fullScoreFit, SHEET_ZOOM, sheetZoom } from '../zoom.ts';
import { Button } from './console/Button.tsx';
import { Chip } from './console/Chip.tsx';
import { Panel } from './console/Panel.tsx';
import { Word } from './Glossary.tsx';
import { ZoomBar } from './ZoomBar.tsx';

type Prepare = (musicxml: string, laneId: string | null, laneName?: string) => string;
export interface SheetModule {
  mountSheet(el: HTMLElement, prepare?: Prepare): SheetHandle;
  /** Draws the printed copy into el; resolves to the function that clears it. */
  printSheet?(el: HTMLElement, musicxml: string): Promise<() => void>;
}
/** The two things the view fetches, replaceable in tests; print opens the browser's print dialog. */
export interface SheetPorts { fetchText(url: string): Promise<string>; loadModule(): Promise<SheetModule>; print?(): void }
export interface SheetMusicProps {
  /** The lane shown; null shows the Full Score. */
  musicxmlSrc: string; laneId: string | null; lanes: Lane[]; onLane(id: string | null): void; ports?: SheetPorts;
  /** Pages or one long line, and the zoom; kept by the page across views when given. */
  look?: SheetLayout; onLook?(l: SheetLayout): void;
  /** The printed copy's title and opening tempo. */
  title?: string; opening?: { bpm: number; unit: number } | null;
  /** The piece's bars, its length and the playhead, for the lesson's clips and its reading-along step. */
  tempo?: TempoMap; duration?: number; time?: number;
  /** Hear it in the lesson: play this moment of the draft. */
  onHear?(clip: Clip): void;
  /** A glossary word in the lesson was tapped: open its card. */
  onTerm?(id: string): void;
}

const NO_BARS: TempoMap = { metric: false, barStart: () => 0, barAt: () => null };
const NOTHING: LaneFacts = { clef: null, time: null, fifths: null, notes: [] };
const SMALL_CAPS = 'font-display text-xs font-semibold tracking-widest uppercase text-dim';

/** The lane's notation facts; a file this page cannot read teaches the plain rules. */
function factsOf(xml: string | null, laneId: string, laneName: string | undefined): LaneFacts {
  if (xml === null) return NOTHING;
  try { return readLane(onlyLane(xml, laneId, laneName)); } catch { return NOTHING; }
}

export const DEFAULT_LOOK: SheetLayout = { continuous: false, zoom: 1 };
/** The printed copy's place: a child of the body, so print can show it alone. */
const PRINT_ID = 'sheet-print';
/** A ctrl or cmd wheel's zoom settles (and the music is laid out again) this long after the wheel stops. */
const WHEEL_SETTLE_MS = 180;

const realPorts: SheetPorts = {
  async fetchText(url) {
    const reply = await fetch(url);
    if (reply.redirected) throw new Error('Your sign-in ended. Sign in again.');
    if (!reply.ok) throw new Error(`The sheet music file did not load (${reply.status}).`);
    return reply.text();
  },
  async loadModule() {
    try {
      return (await import(siblingUrl(import.meta.url, 'sheet.js'))) as SheetModule;
    } catch {
      throw new Error('The sheet music renderer did not load. Check the connection and reload the page.');
    }
  },
};

/** What a view that was left before its file arrived mounts: nothing to draw into, nothing to dispose. */
const NO_SHEET: SheetHandle = { async show() {}, mark() {}, layout() {}, preview() {}, dispose() {} };

/** The layout the notation draws: the owner's zoom times the Full Score's own size for the host's width. */
const drawnLook = (look: SheetLayout, full: boolean, width: number): SheetLayout => ({ continuous: look.continuous, zoom: look.zoom * (full ? fullScoreFit(width) : 1) });

interface Mounted { xml: string; sheet: SheetHandle; mod: SheetModule }

const spread = (t: TouchList): number => {
  const a = t[0];
  const b = t[1];
  return a && b ? Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY) : 0;
};

export function SheetMusic(p: SheetMusicProps) {
  const host = useRef<HTMLDivElement>(null);
  const mounted = useRef<Promise<Mounted> | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState('');
  const [xml, setXml] = useState<string | null>(null);
  const [lesson, setLesson] = useState(false);
  const [at, setAt] = useState(0);
  const lessonButton = useRef<HTMLButtonElement>(null);
  const lessonPanel = useRef<HTMLElement>(null);
  const ports = p.ports ?? realPorts;
  const tempo = p.tempo ?? NO_BARS;
  const [ownLook, setOwnLook] = useState<SheetLayout>(DEFAULT_LOOK);
  const look = p.look ?? ownLook;
  const setLook = p.onLook ?? setOwnLook;
  const liveLook = useRef(look);
  liveLook.current = look;
  const [printing, setPrinting] = useState(false);
  const laneName = p.laneId === null ? undefined : p.lanes.find(l => l.id === p.laneId)?.name;
  // The lesson talks about one instrument: the shown one, or with the Full Score the first lane.
  const lessonLane = p.laneId ?? p.lanes[0]!.id;
  const lessonName = p.lanes.find(l => l.id === lessonLane)?.name;
  const lanesNow = useRef(p.lanes);
  lanesNow.current = p.lanes;
  const prepare = useMemo<Prepare>(() => (text, lane, name) => (lane === null ? fullScore(text, lanesNow.current) : onlyLane(text, lane, name)), []);
  const steps = useMemo(() => readingSteps(factsOf(xml, lessonLane, lessonName), tempo, p.duration ?? 0), [xml, lessonLane, lessonName, tempo, p.duration]);
  const step = steps[Math.min(at, steps.length - 1)]!;
  // The lit bar: the step's own, or while reading along the bar playing now.
  const lit = !lesson ? null : step.follow ? (tempo.barAt(p.time ?? 0) ?? step.bar) : step.bar;

  // Leaving the view (or changing the file) clears the notation and its listener.
  useEffect(() => () => {
    const m = mounted.current;
    mounted.current = null;
    void m?.then(x => x.sheet.dispose(), () => {});
  }, [p.musicxmlSrc]);

  /** The layout last handed to the notation. */
  const laid = useRef<SheetLayout | null>(null);
  // One notation per container: the first run fetches and mounts, every lane draws through the same handle.
  useEffect(() => {
    let current = true;
    setStatus('loading');
    mounted.current ??= Promise.all([ports.fetchText(p.musicxmlSrc), ports.loadModule()]).then(([xml, mod]) => {
      const sheet = host.current ? mod.mountSheet(host.current, prepare) : NO_SHEET;
      return { xml, sheet, mod };
    });
    const mine = mounted.current;
    mine.then(m => {
      // The Full Score's size depends on the width: a lane switch settles it before drawing, without redrawing the lane on its way out.
      const eff = drawnLook(liveLook.current, p.laneId === null, host.current?.clientWidth ?? 0);
      laid.current = eff;
      m.sheet.layout(eff, false);
      return m.sheet.show(m.xml, p.laneId, laneName).then(() => m.xml);
    }).then(
      text => { if (current) { setXml(text); setStatus('ready'); } },
      (e: unknown) => {
        if (mounted.current === mine) mounted.current = null; // a failed fetch is tried again next time
        if (!current) return;
        setError(e instanceof Error ? e.message : 'The sheet music could not be drawn.');
        setStatus('error');
      },
    );
    return () => { current = false; };
  }, [p.musicxmlSrc, p.laneId]);

  useEffect(() => { void mounted.current?.then(m => m.sheet.mark(lit), () => {}); }, [lit, status]);
  // A new layout or zoom lays the drawn music out again, dropping any pinch preview first so the new drawing is never scaled twice.
  useEffect(() => {
    void mounted.current?.then(m => {
      const was = laid.current;
      const eff = drawnLook(look, p.laneId === null, host.current?.clientWidth ?? 0);
      m.sheet.preview(1);
      if (was && (was.continuous !== eff.continuous || was.zoom !== eff.zoom)) { laid.current = eff; m.sheet.layout(eff); }
    }, () => {});
  }, [look.continuous, look.zoom]);

  // Zooming: a scale previewed as a picture while the fingers or the wheel move, then settled by laying the music out at the new zoom.
  const preview = (factor: number): number => {
    const z = liveLook.current.zoom;
    const scale = sheetZoom(z, factor) / z;
    void mounted.current?.then(m => m.sheet.preview(scale), () => {});
    return scale;
  };
  const settle = (factor: number): void => {
    const now = liveLook.current;
    const zoom = sheetZoom(now.zoom, factor);
    if (zoom === now.zoom) { void mounted.current?.then(m => m.sheet.preview(1), () => {}); return; }
    setLook({ ...now, zoom });
  };
  const pinchFrom = useRef<number | null>(null);
  const pinchAt = useRef(1);
  const wheel = useRef<{ factor: number; timer: ReturnType<typeof setTimeout> | null }>({ factor: 1, timer: null });
  useEffect(() => () => { if (wheel.current.timer) clearTimeout(wheel.current.timer); }, []);
  const gestures = {
    onTouchStart(e: TouchEvent) { if (e.touches.length === 2) { pinchFrom.current = spread(e.touches); pinchAt.current = 1; } },
    onTouchMove(e: TouchEvent) {
      const from = pinchFrom.current;
      if (from === null || e.touches.length !== 2 || from === 0) return;
      e.preventDefault();
      pinchAt.current = spread(e.touches) / from;
      preview(pinchAt.current);
    },
    onTouchEnd(e: TouchEvent) { if (pinchFrom.current !== null && e.touches.length < 2) { pinchFrom.current = null; settle(pinchAt.current); } },
    onTouchCancel() { if (pinchFrom.current !== null) { pinchFrom.current = null; settle(1); } },
    onWheel(e: WheelEvent) {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const w = wheel.current;
      w.factor *= Math.exp(-e.deltaY / 200);
      preview(w.factor);
      if (w.timer) clearTimeout(w.timer);
      w.timer = setTimeout(() => { const f = w.factor; w.factor = 1; w.timer = null; settle(f); }, WHEEL_SETTLE_MS);
    },
    // Safari's trackpad pinch: gesture events with the scale since the pinch began.
    onGestureStart(e: Event) { e.preventDefault(); },
    onGestureChange(e: Event & { scale?: number }) { e.preventDefault(); preview(e.scale ?? 1); },
    onGestureEnd(e: Event & { scale?: number }) { e.preventDefault(); settle(e.scale ?? 1); },
  } as unknown as HTMLAttributes<HTMLDivElement>;

  // The printed copy: drawn off screen as a child of the body, printed alone, and cleared once the print dialog closes.
  const print = async (): Promise<void> => {
    const m = await mounted.current?.catch(() => null);
    if (!m?.mod.printSheet || printing) return;
    setPrinting(true);
    document.getElementById(PRINT_ID)?.remove();
    const holder = document.createElement('div');
    holder.id = PRINT_ID;
    holder.className = 'sheet-print';
    document.body.append(holder);
    try {
      const clear = await m.mod.printSheet(holder, titled(prepare(m.xml, p.laneId, laneName), p.title ?? '', p.opening ?? null));
      const done = (): void => { window.removeEventListener('afterprint', done); clear(); holder.remove(); };
      window.addEventListener('afterprint', done);
      (ports.print ?? (() => window.print()))();
    } catch (e) {
      holder.remove();
      setError(e instanceof Error ? e.message : 'The sheet music could not be printed.');
      setStatus('error');
    } finally {
      setPrinting(false);
    }
  };
  // Opening the lesson moves focus into it; closing returns focus to the button that opened it.
  useEffect(() => { if (lesson) lessonPanel.current?.focus({ preventScroll: true }); }, [lesson]);
  const closeLesson = (): void => { setLesson(false); lessonButton.current?.focus(); };
  // Back on the first step or Next on the last becomes disabled: focus stays in the lesson.
  const goTo = (n: number): void => { setAt(n); if (n === 0 || n === steps.length - 1) lessonPanel.current?.focus({ preventScroll: true }); };

  return (
    <div class="sheet-view grid min-w-0 gap-2 p-2">
      <div class="lane-picker flex flex-wrap gap-2" role="group" aria-label="Instrument" data-guide="lane-picker">
        {p.lanes.length > 1 ? <Chip pressed={p.laneId === null} onClick={() => p.onLane(null)}>Full Score</Chip> : null}
        {p.lanes.map(l => <Chip pressed={l.id === p.laneId} onClick={() => p.onLane(l.id)}>{l.name}</Chip>)}
      </div>
      <div class="sheet-tools flex flex-wrap items-center gap-2">
        <div class="flex gap-2" role="group" aria-label="Layout">
          <Chip pressed={!look.continuous} onClick={() => setLook({ ...look, continuous: false })}>Page View</Chip>
          <Chip pressed={look.continuous} onClick={() => setLook({ ...look, continuous: true })}>Continuous</Chip>
        </div>
        <ZoomBar canOut={look.zoom > SHEET_ZOOM.min} canIn={look.zoom < SHEET_ZOOM.max} atFit={look.zoom === 1}
          onOut={() => setLook({ ...look, zoom: sheetZoom(look.zoom, 1 / SHEET_ZOOM.step) })} onIn={() => setLook({ ...look, zoom: sheetZoom(look.zoom, SHEET_ZOOM.step) })} onFit={() => setLook({ ...look, zoom: 1 })} />
        <Button disabled={status !== 'ready' || printing} onClick={() => { void print(); }} data={{ 'data-print': '' }}>{printing ? 'Preparing…' : 'Print / Save PDF'}</Button>
      </div>
      <div class="flex">
        <Button pressed={lesson} pressedLook="outline" buttonRef={lessonButton} data={{ 'data-lesson-open': '' }} onClick={() => (lesson ? closeLesson() : setLesson(true))}>Learn to read sheet music</Button>
      </div>
      {lesson ? <Lesson step={step} at={Math.min(at, steps.length - 1)} count={steps.length} panelRef={lessonPanel} onAt={goTo} onHear={c => p.onHear?.(c)} onTerm={id => p.onTerm?.(id)} onClose={closeLesson} /> : null}
      {status === 'loading' ? <p class="loading" role="status">Loading sheet music…</p> : null}
      {status === 'error' ? <p class="error" role="alert">{error}</p> : null}
      <div id="sheet" data-guide="sheet" data-layout={look.continuous ? 'continuous' : 'pages'} class={`min-w-0 touch-pan-x touch-pan-y overflow-x-auto overscroll-x-contain rounded-md bg-paper p-2 ${lesson ? 'max-h-[65dvh] overflow-y-auto' : ''}`} ref={host} {...gestures} />
    </div>
  );
}

interface LessonProps { step: ReadingStep; at: number; count: number; panelRef: { current: HTMLElement | null }; onAt(n: number): void; onHear(c: Clip): void; onTerm(id: string): void; onClose(): void }

/** One step of the lesson beside the music, never over it: its words (glossary words open their cards), Hear it when the lane has an example, Back, Next and Close. */
function Lesson(p: LessonProps) {
  const s = p.step;
  const clip = s.clip;
  return (
    <Panel role="region" label="Learn to read sheet music" tabIndex={-1} panelRef={p.panelRef} accent data={{ 'data-lesson': s.id }} class="grid gap-2">
      <p class={SMALL_CAPS}>Step {p.at + 1} of {p.count}</p>
      <div aria-live="polite" class="grid gap-2">
        <h3 class="font-display text-xl font-semibold uppercase">{s.title}</h3>
        <p class="leading-8">{s.text.map(r => {
          const t = 'term' in r ? term(r.term) : undefined;
          return t ? <Word term={t} text={r.text} inline onOpen={p.onTerm} /> : r.text;
        })}</p>
        {s.bar !== null && !s.follow ? <p class="font-mono text-xs text-dim">Bar {s.bar} is lit in amber below.</p> : null}
      </div>
      <div class="flex flex-wrap gap-2">
        {clip ? <Button variant="primary" onClick={() => p.onHear(clip)}>Hear it</Button> : null}
        <Button onClick={() => p.onAt(p.at - 1)} disabled={p.at === 0}>Back</Button>
        <Button onClick={() => p.onAt(p.at + 1)} disabled={p.at === p.count - 1}>Next</Button>
        <Button variant="ghost" onClick={p.onClose}>Close</Button>
      </div>
    </Panel>
  );
}
