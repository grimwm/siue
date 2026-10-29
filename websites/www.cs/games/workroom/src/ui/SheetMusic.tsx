// Sheet music: a lane picker, the notation of the chosen lane, and a lesson in
// reading it that lights the bar each step talks about. The notation library is
// a separate bundle, fetched when this view first opens.
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { term } from '../glossary.ts';
import { siblingUrl } from '../load.ts';
import { onlyLane } from '../musicxml.ts';
import type { Clip } from '../player.ts';
import { readingSteps, readLane } from '../reading.ts';
import type { LaneFacts, ReadingStep } from '../reading.ts';
import type { Lane } from '../score.ts';
import type { SheetHandle } from '../sheetlife.ts';
import type { TempoMap } from '../tempo.ts';
import { Button } from './console/Button.tsx';
import { Chip } from './console/Chip.tsx';
import { Panel } from './console/Panel.tsx';
import { Word } from './Glossary.tsx';

export interface SheetModule { mountSheet(el: HTMLElement): SheetHandle }
/** The two things the view fetches, replaceable in tests. */
export interface SheetPorts { fetchText(url: string): Promise<string>; loadModule(): Promise<SheetModule> }
export interface SheetMusicProps {
  musicxmlSrc: string; laneId: string; lanes: Lane[]; onLane(id: string): void; ports?: SheetPorts;
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
const NO_SHEET: SheetHandle = { async show() {}, mark() {}, dispose() {} };

interface Mounted { xml: string; sheet: SheetHandle }

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
  const laneName = p.lanes.find(l => l.id === p.laneId)?.name;
  const steps = useMemo(() => readingSteps(factsOf(xml, p.laneId, laneName), tempo, p.duration ?? 0), [xml, p.laneId, laneName, tempo, p.duration]);
  const step = steps[Math.min(at, steps.length - 1)]!;
  // The lit bar: the step's own, or while reading along the bar playing now.
  const lit = !lesson ? null : step.follow ? (tempo.barAt(p.time ?? 0) ?? step.bar) : step.bar;

  // Leaving the view (or changing the file) clears the notation and its listener.
  useEffect(() => () => {
    const m = mounted.current;
    mounted.current = null;
    void m?.then(x => x.sheet.dispose(), () => {});
  }, [p.musicxmlSrc]);

  // One notation per container: the first run fetches and mounts, every lane draws through the same handle.
  useEffect(() => {
    let current = true;
    setStatus('loading');
    mounted.current ??= Promise.all([ports.fetchText(p.musicxmlSrc), ports.loadModule()]).then(([xml, mod]) => ({ xml, sheet: host.current ? mod.mountSheet(host.current) : NO_SHEET }));
    const mine = mounted.current;
    mine.then(m => m.sheet.show(m.xml, p.laneId, laneName).then(() => m.xml)).then(
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
  // Opening the lesson moves focus into it; closing returns focus to the button that opened it.
  useEffect(() => { if (lesson) lessonPanel.current?.focus({ preventScroll: true }); }, [lesson]);
  const closeLesson = (): void => { setLesson(false); lessonButton.current?.focus(); };
  // Back on the first step or Next on the last becomes disabled: focus stays in the lesson.
  const goTo = (n: number): void => { setAt(n); if (n === 0 || n === steps.length - 1) lessonPanel.current?.focus({ preventScroll: true }); };

  return (
    <div class="sheet-view grid gap-2 p-2">
      <div class="lane-picker flex flex-wrap gap-2" role="group" aria-label="Instrument" data-guide="lane-picker">
        {p.lanes.map(l => <Chip pressed={l.id === p.laneId} onClick={() => p.onLane(l.id)}>{l.name}</Chip>)}
      </div>
      <div class="flex">
        <Button pressed={lesson} pressedLook="outline" buttonRef={lessonButton} data={{ 'data-lesson-open': '' }} onClick={() => (lesson ? closeLesson() : setLesson(true))}>Learn to read sheet music</Button>
      </div>
      {lesson ? <Lesson step={step} at={Math.min(at, steps.length - 1)} count={steps.length} panelRef={lessonPanel} onAt={goTo} onHear={c => p.onHear?.(c)} onTerm={id => p.onTerm?.(id)} onClose={closeLesson} /> : null}
      {status === 'loading' ? <p class="loading" role="status">Loading sheet music…</p> : null}
      {status === 'error' ? <p class="error" role="alert">{error}</p> : null}
      <div id="sheet" data-guide="sheet" class={`overflow-x-auto rounded-md bg-paper p-2 ${lesson ? 'max-h-[65dvh] overflow-y-auto' : ''}`} ref={host} />
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
