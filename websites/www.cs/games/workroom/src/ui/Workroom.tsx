// The workroom: one piece, one playhead, the views the piece offers, the
// glossary and Claude's change list. It owns what the views share (the view of
// the time axis, the playing time, the tab, the lane filter, the open word, the
// notes sheet) and holds no logic the DOM-free modules can hold. From 1024 px
// the views and the notes sheet sit side by side; narrower, the sheet is a
// bottom sheet and the page keeps room under its content for the sheet's handle.
import type { ComponentChildren } from 'preact';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'preact/hooks';
import { formatSeconds } from '../axis.ts';
import { splitTerms, term, termsIn } from '../glossary.ts';
import { ALWAYS_SEEN, guideParts } from '../guide.ts';
import type { GuideClip, GuideStore } from '../guide.ts';
import type { DemoId } from '../demo.ts';
import { follow } from '../player.ts';
import type { Clip } from '../player.ts';
import type { Change, Score } from '../score.ts';
import { legendFor, pickTab, tabsFor } from '../tabs.ts';
import type { Tab } from '../tabs.ts';
import { changeTimes, tempoMap } from '../tempo.ts';
import { boundsFor, fitView, resizeView, timeToX } from '../zoom.ts';
import type { View } from '../zoom.ts';
import { Button } from './console/Button.tsx';
import { Chip } from './console/Chip.tsx';
import { GuideOverlay } from './console/GuideOverlay.tsx';
import { Legend } from './console/Legend.tsx';
import { Sheet } from './console/Sheet.tsx';
import { panelId, tabId } from './console/Tabs.tsx';
import { Card, Word } from './Glossary.tsx';
import { PianoRoll } from './PianoRoll.tsx';
import { Player } from './Player.tsx';
import { SheetMusic } from './SheetMusic.tsx';
import { SoundPicture } from './SoundPicture.tsx';
import { Timeline } from './Timeline.tsx';
import { ViewTabs } from './ViewTabs.tsx';

export interface WorkroomProps { score: Score; version: number; versions: number[]; audioSrc: (file: string) => string; onVersion(v: number): void; guide?: GuideStore; playDemo?(id: DemoId): void; stopDemo?(): void; children?: ComponentChildren }

const FALLBACK_WIDTH = 720;

/** Where a change sits, in the words the piece is counted in: its bars on a music piece, its seconds on a sound piece. */
export function changeLabel(c: Change): string {
  if (c.from_bar !== undefined && c.to_bar !== undefined) return c.from_bar === c.to_bar ? `Bar ${c.from_bar}` : `Bars ${c.from_bar}–${c.to_bar}`;
  return `${formatSeconds(c.from ?? 0)} – ${formatSeconds(c.to ?? 0)}`;
}

const SMALL_CAPS = 'font-display text-xs font-semibold tracking-widest uppercase text-dim';

export function Workroom(p: WorkroomProps) {
  const { score } = p;
  const tempo = useMemo(() => tempoMap(score), [score]);
  const tabs = useMemo(() => tabsFor(score), [score]);
  const uses = useMemo(() => termsIn(score), [score]);
  const stage = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(FALLBACK_WIDTH);
  const [view, setView] = useState<View>(() => fitView(score.duration, FALLBACK_WIDTH));
  const [time, setTime] = useState(0);
  const [wanted, setWanted] = useState<Tab>('story');
  const [lanes, setLanes] = useState<ReadonlySet<string> | undefined>(undefined);
  const [sheetLane, setSheetLane] = useState(score.lanes[0]!.id);
  const [open, setOpen] = useState<string | null>(null);
  const [clip, setClip] = useState<Clip | null>(null);
  const [holding, setHolding] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const guide = p.guide ?? ALWAYS_SEEN;
  const [guideOpen, setGuideOpen] = useState(false);
  const howTo = useRef<HTMLButtonElement>(null);
  const pauseAudio = useRef<(() => void) | null>(null);
  const seekAudio = useRef<((t: number) => void) | null>(null);
  const playClip = useRef<((c: Clip) => void) | null>(null);
  const cardRef = useRef<HTMLElement>(null);
  const opener = useRef<Element | null>(null);
  const tab = pickTab(tabs, wanted);
  // A view's guide opens by itself the first time this browser shows that view.
  useEffect(() => {
    if (guide.seen(tab)) return;
    guide.markSeen(tab);
    setGuideOpen(true);
  }, [tab]);
  const bounds = useMemo(() => boundsFor(score.duration, width), [score.duration, width]);

  // The views are as wide as the stage: measured on mount and whenever the stage changes width (a window resize, a scrollbar appearing, the sheet opening). A browser without ResizeObserver falls back to the window's resize.
  useLayoutEffect(() => {
    const el = stage.current;
    const measure = (): void => setWidth(Math.floor(el?.getBoundingClientRect().width || FALLBACK_WIDTH));
    measure();
    if (el && typeof ResizeObserver !== 'undefined') {
      const watch = new ResizeObserver(measure);
      watch.observe(el);
      return () => watch.disconnect();
    }
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);
  // A new piece fits whole; a new width refits a view that is still the whole piece (the first measure replaces the fallback width) and leaves a zoomed one where it is.
  const fitted = useRef<{ score: Score; width: number } | null>(null);
  useLayoutEffect(() => {
    const was = fitted.current;
    fitted.current = { score, width };
    setView(v => (!was || was.score !== score ? fitView(score.duration, width) : resizeView(v, was.width, width, score.duration)));
  }, [score, width]);
  // While playing, the playhead stays on screen, a page at a time, except while a finger or the mouse is on a view (a pan is not undone every frame). A paused view stays where the owner put it.
  useEffect(() => { if (playing && !holding) setView(v => follow(v, time, bounds)); }, [time, bounds, holding, playing]);

  // The audio moves first, in this call, so the next frame reports the new time. A jump the owner asked for (a change, a clip) brings its time on screen even while paused.
  const seek = (t: number): void => { seekAudio.current?.(t); setClip(null); setTime(t); setView(v => follow(v, t, bounds)); };
  // Hear it plays inside the tap itself: iOS refuses sound started later.
  const hear = (c: Clip): void => { playClip.current?.(c); setClip(c); setTime(c.from); setView(v => follow(v, c.from, bounds)); };
  // Only one sound at a time: a demo pauses the piece and the demo before it; a piece clip silences a demo.
  const quietGuide = (): void => { if (clip) { pauseAudio.current?.(); setClip(null); } p.stopDemo?.(); };
  const openGuide = (): void => { guide.markSeen(tab); setGuideOpen(true); };
  const closeGuide = (): void => { setGuideOpen(false); howTo.current?.focus(); };
  const hearPart = (c: GuideClip): void => {
    if (c.kind === 'piece') { p.stopDemo?.(); hear({ from: c.from, to: c.to }); }
    else { pauseAudio.current?.(); setClip(null); p.stopDemo?.(); p.playDemo?.(c.id); }
  };
  const openTerm = open === null ? undefined : term(open);
  const openClip = openTerm ? uses.find(u => u.term.id === openTerm.id) : undefined;
  const seen = [...new Map(uses.map(u => [u.term.id, u.term])).values()];
  useEffect(() => { document.title = `${score.piece.title} – ${score.project.name}`; }, [score]);
  // Focus moves into an opened card so a keyboard user lands on it; closing returns focus to the word that opened it.
  useEffect(() => { if (openTerm) { cardRef.current?.scrollIntoView({ block: 'nearest' }); cardRef.current?.focus({ preventScroll: true }); } }, [openTerm?.id]);
  const openCard = (id: string): void => { if (open === null) opener.current = document.activeElement; setOpen(id); setSheetOpen(true); };
  const closeCard = (): void => { setOpen(null); const o = opener.current as HTMLElement | null; opener.current = null; o?.focus(); };
  const toggleLane = (id: string): void => {
    const all = lanes ?? new Set(score.lanes.map(l => l.id));
    const next = new Set(all);
    if (next.has(id)) next.delete(id); else next.add(id);
    setLanes(next.size === score.lanes.length ? undefined : next);
  };

  const pins = score.changes.map((c, i) => {
    const t = changeTimes(c, tempo, score.duration);
    return (
      <g class="pin cursor-pointer" data-change={i} onPointerDown={e => e.stopPropagation()} onClick={() => seek(t.from)}>
        <rect class="fill-amber" x={timeToX(view, t.from)} y={0} width={Math.max(4, (t.to - t.from) * view.pxPerSec)} height={8} />
        <text class="pointer-events-none fill-on-accent font-mono text-[8px]" x={timeToX(view, t.from) + 2} y={7}>{i + 1}</text>
      </g>
    );
  });

  return (
    <div class="workroom grid gap-4 pb-14 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start lg:pb-0">
      <div class="grid min-w-0 gap-3">
        <header class="piece-head flex flex-wrap items-end justify-between gap-3">
          <div class="min-w-0">
            <h1 class="font-display text-3xl font-semibold tracking-wide break-words uppercase">{score.piece.title}</h1>
            <p class="project-name font-mono text-xs tracking-widest uppercase text-dim">{score.project.name}</p>
          </div>
          <label class="draft-picker flex items-center gap-2 font-mono text-xs uppercase text-dim">Draft
            <select class="min-h-11 rounded-md border border-rule bg-panel px-3 text-sm text-ink focus-visible:outline-2 focus-visible:outline-amber" value={String(p.version)} onChange={e => p.onVersion(Number(e.currentTarget.value))}>
              {p.versions.map(v => <option value={String(v)}>{v === p.versions[0] ? `${v} (latest)` : String(v)}</option>)}
            </select>
          </label>
        </header>
        <Player src={score.audio} audioSrc={p.audioSrc} time={time} bar={tempo.barAt(time)} onTime={setTime} clip={clip} onClipDone={() => setClip(null)} seekRef={seekAudio} clipRef={playClip} onPlaying={setPlaying} pauseRef={pauseAudio} />
        <div class="flex flex-wrap items-end justify-end gap-x-3 gap-y-2 lg:flex-nowrap">
          <div class="min-w-0 flex-1 basis-full lg:basis-0"><ViewTabs tabs={tabs} tab={tab} onTab={setWanted} /></div>
          <Button variant="secondary" buttonRef={howTo} data={{ 'data-guide-open': '' }} onClick={openGuide}>
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="8" r="6.5" /><path d="M6.2 6.2a1.9 1.9 0 1 1 2.7 1.7c-.6.3-.9.7-.9 1.4" /><path d="M8 11.6v.1" /></svg>
            How to read this
          </Button>
        </div>
        <div role="tabpanel" id={panelId('view')} aria-labelledby={tabId('view', tab)} class="grid gap-2">
          {tab === 'roll' ? (
            <div class="lane-picker flex flex-wrap gap-2" role="group" aria-label="Lanes shown" data-guide="lane-picker">
              {score.lanes.map(l => <Chip pressed={!lanes || lanes.has(l.id)} onClick={() => toggleLane(l.id)}>{l.name}</Chip>)}
            </div>
          ) : null}
          <div ref={stage} data-guide="view" class="overflow-hidden rounded-lg bg-well ring-1 ring-rule">
            {tab === 'story' ? <Timeline score={score} tempo={tempo} view={view} time={time} onSeek={seek} onView={setView} onHold={setHolding} onTerm={openCard} overlay={pins} /> : null}
            {tab === 'roll' ? <PianoRoll score={score} tempo={tempo} view={view} time={time} lanes={lanes} onSeek={seek} onView={setView} onHold={setHolding} /> : null}
            {tab === 'sound' ? <SoundPicture score={score} view={view} time={time} imageSrc={p.audioSrc(score.spectrogram.file)} onSeek={seek} onView={setView} onHold={setHolding} /> : null}
            {tab === 'sheet' ? <SheetMusic musicxmlSrc={p.audioSrc('score.musicxml')} laneId={sheetLane} lanes={score.lanes} onLane={setSheetLane} /> : null}
          </div>
          <Legend items={legendFor(tab, score.kind)} />
        </div>
      </div>
      <Sheet title="Words & changes" open={sheetOpen} onToggle={setSheetOpen}>
        {openTerm ? <Card cardRef={cardRef} term={openTerm} clip={openClip ? { from: openClip.from, to: openClip.to } : null} onHear={hear} onClose={closeCard} /> : null}
        {seen.length > 0 ? (
          <div class="words grid gap-2" aria-label="Words in this piece">
            <span class={SMALL_CAPS}>Words in this piece</span>
            <div class="flex flex-wrap gap-2">{seen.map(t => <Word term={t} text={t.word} onOpen={openCard} />)}</div>
          </div>
        ) : null}
        {score.changes.length > 0 ? (
          <div class="grid gap-2">
            <span class={SMALL_CAPS}>Claude's changes <span class="ml-1 font-mono text-amber">{score.changes.length === 1 ? '1 change' : `${score.changes.length} changes`}</span></span>
            <ol class="changes grid list-decimal gap-2 pl-5 text-sm marker:font-mono marker:text-dim" aria-label="Claude's changes">
              {score.changes.map((c, i) => (
                <li data-change={i}>
                  <button type="button" data-where="" class="where mr-1 inline-flex min-h-11 min-w-11 items-center font-mono text-amber underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-amber" onClick={() => seek(changeTimes(c, tempo, score.duration).from)}>{changeLabel(c)}</button>{' '}
                  {splitTerms(c.text).map(part => 'term' in part ? <Word term={part.term} text={part.text} inline onOpen={openCard} /> : part.text)}
                </li>
              ))}
            </ol>
          </div>
        ) : null}
        {p.children}
      </Sheet>
      {guideOpen ? <GuideOverlay parts={guideParts({ tab, score, tempo, view, time, lanes })} onHear={hearPart} onStop={quietGuide} onClose={closeGuide} /> : null}
    </div>
  );
}
