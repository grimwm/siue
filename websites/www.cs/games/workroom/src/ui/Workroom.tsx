// The workroom: one piece, one playhead, the views the piece offers, the
// glossary and Claude's change list. It owns what the views share (the view of
// the time axis, the playing time, the tab, the lane filter, the open word, the
// notes sheet) and holds no logic the DOM-free modules can hold. From 1024 px
// the views and the notes sheet sit side by side; narrower, the sheet is a
// bottom sheet and the page keeps room under its content for the sheet's handle,
// and whenever the answer bar's dock shows (pinning, a recording running or
// waiting to be sent) for the dock too, so the Story view can scroll to the
// top of the screen above it.
// With a notes session it also holds the answering: the answer bar, the span
// being picked, the energy drawing and the owner's notes on the Story view;
// before an unlock the bar's buttons open the notes panel at the unlock form.
import type { ComponentChildren } from 'preact';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'preact/hooks';
import { energyNote } from '../answer.ts';
import { formatSeconds } from '../axis.ts';
import { splitTerms, term, termsIn } from '../glossary.ts';
import { ALWAYS_SEEN, energyGuideParts, guideParts } from '../guide.ts';
import type { GuideClip, GuideStore, GuideView } from '../guide.ts';
import type { Span } from '../hit.ts';
import { timelineMarks } from '../history.ts';
import type { HistoryItem } from '../history.ts';
import { guardLeaving, unsavedWork } from '../leave.ts';
import type { NoteBody } from '../note.ts';
import { UNLOCK_FIRST } from '../notes-session.ts';
import type { NotesSession } from '../notes-session.ts';
import { KEPT_MESSAGES, MEMORY_NOTICE, SENT_MESSAGE, SEND_MESSAGES } from '../outbox.ts';
import type { DemoId } from '../demo.ts';
import { follow } from '../player.ts';
import type { Clip } from '../player.ts';
import type { MediaPorts } from '../recorder.ts';
import type { Change, Score } from '../score.ts';
import { energyLegend, legendFor, pickTab, tabsFor } from '../tabs.ts';
import type { Tab } from '../tabs.ts';
import { changeTimes, sectionTimes, tempoMap } from '../tempo.ts';
import { boundsFor, fitView, resizeView, timeToX } from '../zoom.ts';
import type { View } from '../zoom.ts';
import { AnswerBar, HUM_AFTER_UNLOCK } from './AnswerBar.tsx';
import type { AnswerMode, Asked } from './AnswerBar.tsx';
import { Answers } from './Answers.tsx';
import { Button } from './console/Button.tsx';
import { Chip } from './console/Chip.tsx';
import { GuideOverlay } from './console/GuideOverlay.tsx';
import { Legend } from './console/Legend.tsx';
import { Sheet } from './console/Sheet.tsx';
import { panelId, tabId } from './console/Tabs.tsx';
import { EnergyEditor } from './EnergyEditor.tsx';
import { Card, Word } from './Glossary.tsx';
import { PianoRoll } from './PianoRoll.tsx';
import { Player } from './Player.tsx';
import { SheetMusic } from './SheetMusic.tsx';
import { SoundPicture } from './SoundPicture.tsx';
import { Timeline } from './Timeline.tsx';
import { ViewTabs } from './ViewTabs.tsx';

export interface WorkroomProps { score: Score; version: number; versions: number[]; audioSrc: (file: string) => string; onVersion(v: number): void; guide?: GuideStore; playDemo?(id: DemoId): void; stopDemo?(): void; children?: ComponentChildren;
  /** The owner's notes: undefined, the page has no answering. */
  notes?: NotesSession;
  /** The microphone: null or undefined, no Hum it and no Record. */
  media?: MediaPorts | null;
  now?(): Date;
}

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
  const notes = p.notes ?? null;
  const answering = notes !== null;
  const now = p.now ?? ((): Date => new Date());
  const [unlocked, setUnlocked] = useState(notes?.unlocked() ?? false);
  const [keyring, setKeyring] = useState(true);
  const [asked, setAsked] = useState<Asked | null>(null);
  const [mode, setMode] = useState<AnswerMode>('none');
  const [span, setSpan] = useState<Span | null>(null);
  const [preview, setPreview] = useState<Span | null>(null);
  const [items, setItems] = useState<readonly HistoryItem[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [refresh, setRefresh] = useState(0);
  /** The words in the pin composer: they outlive the composer, and only the words a stored note sent are cleared. */
  const [draft, setDraft] = useState('');
  const draftNow = useRef(draft);
  draftNow.current = draft;
  /** A recording running (live) or made and not stored yet (held), as the answer bar reports it. */
  const [rec, setRec] = useState({ live: false, held: false });
  const recNow = useRef(rec);
  recNow.current = rec;
  const docked = mode === 'pin' || rec.live || rec.held;
  // Leaving the page (another draft, a link, a reload) asks first while something made here would be lost.
  useEffect(() => guardLeaving(window, () => unsavedWork({ draft: draftNow.current, recording: recNow.current.live, held: recNow.current.held, memoryOnly: notes?.memoryOnly() ?? false })), [notes]);
  const marks = useMemo(() => timelineMarks(items, score.piece.id, score.duration), [items, score]);
  const modeNow = useRef(mode);
  modeNow.current = mode;
  const changeMode = (m: AnswerMode): void => {
    setMode(m);
    setPreview(null);
    if (m !== 'pin') setSpan(null);
    if (m === 'pin') setWanted('story');
  };
  // Pinning picks on the Story view's timeline: bring it on screen. On a phone the composer is docked under it, so the stage goes to the top; from 1024 px the composer sits in the page above the stage, so the answer bar goes to the top and both stay in view.
  useEffect(() => {
    if (mode !== 'pin') return;
    const wide = typeof matchMedia === 'function' ? matchMedia('(min-width: 1024px)').matches : false;
    const top = wide ? stage.current?.closest('main, body')?.querySelector('[data-answer-dock]') ?? stage.current : stage.current;
    top?.scrollIntoView?.({ block: 'start' });
  }, [mode]);
  const pick = (s: Span | null, done: boolean): void => {
    if (s === null) setPreview(null);
    else if (done) { setSpan(s); setPreview(null); }
    else setPreview(s);
  };
  /** The bar is open only while the session says so: a lock anywhere (a sign-in that ended) turns it back to asking for the unlock. */
  const syncLock = (): void => setUnlocked(notes?.unlocked() ?? false);
  /** Seals and stores a note: true once it is stored (sent, or kept on this device), false when it is not, with the words and recordings still the owner's. A stored note closes only the mode it came from: a typed note its composer (unless more words were typed while it was sent), a shape the drawing. A reaction, a hum and a spoken note close nothing, so the next reaction is one tap and words typed beside a recording stay in the box. */
  const send = async (body: NoteBody, audio: Uint8Array<ArrayBuffer> | null): Promise<boolean> => {
    if (!notes) return false;
    setSending(true);
    setStatus('Sealing and sending…');
    try {
      const r = await notes.send(body, audio);
      const kept = r.kept.find(k => k.key === r.key);
      setStatus(kept ? `${KEPT_MESSAGES[kept.reason]}${r.memoryOnly ? ` ${MEMORY_NOTICE}` : ''}` : SENT_MESSAGE);
      // The note is stored; a sign-in that ended locks the notes until the owner signs in and unlocks again.
      if (r.kept.some(k => k.reason === 'signed_out')) notes.lock();
      const from: AnswerMode | null = body.kind === 'text' ? 'pin' : body.kind === 'energy' ? 'energy' : null;
      const typedSince = body.kind === 'text' && draftNow.current.trim() !== body.text;
      if (from !== null && modeNow.current === from && !typedSince) changeMode('none');
      return true;
    } catch (e) {
      setStatus(e instanceof Error ? e.message : SEND_MESSAGES.sealFailed);
      return false;
    } finally {
      setSending(false);
      syncLock();
      setRefresh(n => n + 1);
    }
  };
  const sendEnergy = (curve: [number, number][]): void => {
    let body: NoteBody;
    try {
      body = energyNote({ piece: score.piece.id, draft: p.version, now }, curve, score.duration, score.bars ?? null);
    } catch (e) {
      setStatus(e instanceof Error ? e.message : SEND_MESSAGES.sealFailed);
      return;
    }
    void send(body, null);
  };
  // A server with no keyring (make music-setup has not run) turns the bar off.
  useEffect(() => { if (notes) void notes.hasKeyring().then(setKeyring); }, [notes]);
  /** Before an unlock nothing can be sealed: the notes panel opens at the unlock form, with the reason, and remembers what was asked for. */
  const askUnlock = (what: Asked): void => { setAsked(what); setSheetOpen(true); };
  /** After the unlock the bar opens what was asked for, with the sheet closed so the timeline shows; Hum it waits for the next tap (iOS grants the microphone only inside one). */
  const unlockedNow = (): void => {
    syncLock();
    const what = asked;
    setAsked(null);
    if (what === 'hum') setStatus(HUM_AFTER_UNLOCK);
    else if (what !== null) { setSheetOpen(false); changeMode(what); }
  };
  const access = !keyring ? 'off' : unlocked && notes?.unlocked() ? 'open' : 'locked';
  // The guide follows the energy drawing while it replaces the view.
  const guideView: GuideView = mode === 'energy' ? 'energy' : tab;
  // A view's guide opens by itself the first time this browser shows that view.
  useEffect(() => {
    if (guide.seen(guideView, score.kind)) return;
    guide.markSeen(guideView, score.kind);
    setGuideOpen(true);
  }, [guideView, score.kind]);
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
  // A change's "where" moves the playhead; under the phone's bottom sheet that would be unseen, so the sheet closes and the stage scrolls into view.
  const where = (t: number): void => {
    seek(t);
    const wide = typeof matchMedia === 'function' ? matchMedia('(min-width: 1024px)').matches : false;
    if (wide) return;
    setSheetOpen(false);
    stage.current?.scrollIntoView({ block: 'nearest' });
  };
  // Hear it plays inside the tap itself: iOS refuses sound started later.
  const hear = (c: Clip): void => { playClip.current?.(c); setClip(c); setTime(c.from); setView(v => follow(v, c.from, bounds)); };
  // Only one sound at a time: a demo pauses the piece and the demo before it; a piece clip silences a demo.
  const quietGuide = (): void => { if (clip) { pauseAudio.current?.(); setClip(null); } p.stopDemo?.(); };
  const openGuide = (): void => { guide.markSeen(guideView, score.kind); setGuideOpen(true); };
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
    <div class={`workroom grid gap-4 ${docked ? 'pb-[calc(40dvh+3.5rem)]' : 'pb-14'} lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start lg:pb-0`}>
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
        <Player src={score.audio} duration={score.duration} onSeek={seek} audioSrc={p.audioSrc} time={time} bar={tempo.barAt(time)} onTime={setTime} clip={clip} onClipDone={() => setClip(null)} seekRef={seekAudio} clipRef={playClip} onPlaying={setPlaying} pauseRef={pauseAudio} />
        {answering ? <AnswerBar score={score} tempo={tempo} version={p.version} time={time} span={span} mode={mode} onMode={changeMode} access={access} onLocked={askUnlock} onFront={() => setSheetOpen(false)} media={p.media ?? null} now={now} busy={sending} send={send} say={setStatus} status={status} draft={draft} onDraft={setDraft} onRecording={r => setRec(was => (was.live === r.live && was.held === r.held ? was : r))} /> : null}
        <div class="flex flex-wrap items-end justify-end gap-x-3 gap-y-2 lg:flex-nowrap">
          <div class="min-w-0 flex-1 basis-full lg:basis-0"><ViewTabs tabs={tabs} tab={tab} onTab={t => { setWanted(t); if (mode === 'pin' || mode === 'energy') changeMode('none'); }} /></div>
          <Button variant="secondary" buttonRef={howTo} data={{ 'data-guide-open': '' }} onClick={openGuide}>
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="8" r="6.5" /><path d="M6.2 6.2a1.9 1.9 0 1 1 2.7 1.7c-.6.3-.9.7-.9 1.4" /><path d="M8 11.6v.1" /></svg>
            How to read this
          </Button>
        </div>
        <div role="tabpanel" id={panelId('view')} aria-labelledby={tabId('view', tab)} class="grid gap-2">
          {tab === 'roll' && mode !== 'energy' ? (
            <div class="lane-picker flex flex-wrap gap-2" role="group" aria-label="Lanes shown" data-guide="lane-picker">
              {score.lanes.map(l => <Chip pressed={!lanes || lanes.has(l.id)} onClick={() => toggleLane(l.id)}>{l.name}</Chip>)}
            </div>
          ) : null}
          <div ref={stage} data-guide="view" class="overflow-hidden rounded-lg bg-well ring-1 ring-rule">
            {mode === 'energy' ? <EnergyEditor score={score} tempo={tempo} view={view} busy={sending} onSend={sendEnergy} onHold={setHolding} onCancel={() => changeMode('none')} /> : (
              <>
                {tab === 'story' ? <Timeline score={score} tempo={tempo} view={view} time={time} onSeek={seek} onView={setView} onHold={setHolding} onTerm={openCard} overlay={pins}
                  select={mode === 'pin' ? { span: preview ?? span, onPick: pick } : undefined} marks={marks} /> : null}
                {tab === 'roll' ? <PianoRoll score={score} tempo={tempo} view={view} time={time} lanes={lanes} onSeek={seek} onView={setView} onHold={setHolding} /> : null}
                {tab === 'sound' ? <SoundPicture score={score} view={view} time={time} imageSrc={p.audioSrc(score.spectrogram.file)} onSeek={seek} onView={setView} onHold={setHolding} /> : null}
                {tab === 'sheet' ? <SheetMusic musicxmlSrc={p.audioSrc('score.musicxml')} laneId={sheetLane} lanes={score.lanes} onLane={setSheetLane} /> : null}
              </>
            )}
          </div>
          <Legend items={mode === 'energy' ? energyLegend(score) : legendFor(tab, score, { notes: marks.length > 0 })} />
        </div>
      </div>
      <Sheet title="Notes & answers" open={sheetOpen} onToggle={setSheetOpen}>
        {notes ? <Answers notes={notes} score={score} version={p.version} refresh={refresh} ask={asked ? UNLOCK_FIRST : null} onUnlocked={unlockedNow} onLocked={syncLock} onItems={setItems} /> : null}
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
                <li data-change={i} class="leading-8">
                  <button type="button" data-where="" class="where relative z-10 mr-1 inline-flex min-h-11 min-w-11 items-center font-mono text-amber underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-amber" onClick={() => where(changeTimes(c, tempo, score.duration).from)}>{changeLabel(c)}</button>{' '}
                  {splitTerms(c.text).map(part => 'term' in part ? <Word term={part.term} text={part.text} inline onOpen={openCard} /> : part.text)}
                </li>
              ))}
            </ol>
          </div>
        ) : null}
        {p.children}
      </Sheet>
      {guideOpen ? <GuideOverlay parts={mode === 'energy' ? energyGuideParts({ score, tempo, view }) : guideParts({ tab, score, tempo, view, time, lanes, marks })} onHear={hearPart} onStop={quietGuide} onClose={closeGuide} /> : null}
    </div>
  );
}
