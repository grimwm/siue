// The workroom: one piece, one playhead, the views the piece offers, the
// glossary and Claude's change list. It owns what the views share (the view of
// the time axis, the playing time, the tab, the lane filter, the open word) and
// holds no logic the DOM-free modules can hold.
import type { ComponentChildren } from 'preact';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'preact/hooks';
import { formatSeconds } from '../axis.ts';
import { splitTerms, term, termsIn } from '../glossary.ts';
import { follow } from '../player.ts';
import type { Clip } from '../player.ts';
import type { Change, Score } from '../score.ts';
import { pickTab, tabsFor } from '../tabs.ts';
import type { Tab } from '../tabs.ts';
import { changeTimes, tempoMap } from '../tempo.ts';
import { boundsFor, clampView, fitView, timeToX } from '../zoom.ts';
import type { View } from '../zoom.ts';
import { Card, Word } from './Glossary.tsx';
import { PianoRoll } from './PianoRoll.tsx';
import { Player } from './Player.tsx';
import { Sheet } from './Sheet.tsx';
import { SoundPicture } from './SoundPicture.tsx';
import { Timeline } from './Timeline.tsx';
import { ViewTabs } from './ViewTabs.tsx';

export interface WorkroomProps { score: Score; version: number; versions: number[]; audioSrc: (file: string) => string; onVersion(v: number): void; children?: ComponentChildren }

const FALLBACK_WIDTH = 720;

/** Where a change sits, in the words the piece is counted in: its bars on a music piece, its seconds on a sound piece. */
export function changeLabel(c: Change): string {
  if (c.from_bar !== undefined && c.to_bar !== undefined) return c.from_bar === c.to_bar ? `Bar ${c.from_bar}` : `Bars ${c.from_bar}–${c.to_bar}`;
  return `${formatSeconds(c.from ?? 0)} – ${formatSeconds(c.to ?? 0)}`;
}

export function Workroom(p: WorkroomProps) {
  const { score } = p;
  const tempo = useMemo(() => tempoMap(score), [score]);
  const tabs = useMemo(() => tabsFor(score), [score]);
  const uses = useMemo(() => termsIn(score), [score]);
  const holder = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(FALLBACK_WIDTH);
  const [view, setView] = useState<View>(() => fitView(score.duration, FALLBACK_WIDTH));
  const [time, setTime] = useState(0);
  const [wanted, setWanted] = useState<Tab>('story');
  const [lanes, setLanes] = useState<ReadonlySet<string> | undefined>(undefined);
  const [sheetLane, setSheetLane] = useState(score.lanes[0]!.id);
  const [open, setOpen] = useState<string | null>(null);
  const [clip, setClip] = useState<Clip | null>(null);
  const [holding, setHolding] = useState(false);
  const seekAudio = useRef<((t: number) => void) | null>(null);
  const tab = pickTab(tabs, wanted);
  const bounds = useMemo(() => boundsFor(score.duration, width), [score.duration, width]);

  // The views are as wide as the room: measured on mount and on resize.
  useLayoutEffect(() => {
    const measure = (): void => setWidth(Math.floor(holder.current?.getBoundingClientRect().width || FALLBACK_WIDTH));
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);
  // A new piece or width: the whole piece fits at first; a zoomed view stays where it is.
  const fitted = useRef<{ score: Score; width: number } | null>(null);
  useLayoutEffect(() => {
    const was = fitted.current;
    fitted.current = { score, width };
    setView(v => (!was || was.score !== score ? fitView(score.duration, width) : clampView({ ...v, width }, boundsFor(score.duration, width))));
  }, [score, width]);
  // The playhead stays on screen, a page at a time, except while a finger or the mouse is on a view (a pan is not undone every frame); it catches up on release.
  useEffect(() => { if (!holding) setView(v => follow(v, time, bounds)); }, [time, bounds, holding]);

  // The audio moves first, in this call, so the next frame reports the new time.
  const seek = (t: number): void => { seekAudio.current?.(t); setClip(null); setTime(t); };
  const hear = (c: Clip): void => { seekAudio.current?.(c.from); setClip(c); setTime(c.from); };
  const openTerm = open === null ? undefined : term(open);
  const openClip = openTerm ? uses.find(u => u.term.id === openTerm.id) : undefined;
  const seen = [...new Map(uses.map(u => [u.term.id, u.term])).values()];
  const toggleLane = (id: string): void => {
    const all = lanes ?? new Set(score.lanes.map(l => l.id));
    const next = new Set(all);
    if (next.has(id)) next.delete(id); else next.add(id);
    setLanes(next.size === score.lanes.length ? undefined : next);
  };

  const pins = score.changes.map((c, i) => {
    const t = changeTimes(c, tempo, score.duration);
    return (
      <g class="pin" data-change={i} onPointerDown={e => e.stopPropagation()} onClick={() => seek(t.from)}>
        <rect x={timeToX(view, t.from)} y={0} width={Math.max(4, (t.to - t.from) * view.pxPerSec)} height={8} />
        <text x={timeToX(view, t.from) + 2} y={7}>{i + 1}</text>
      </g>
    );
  });

  return (
    <div class="workroom" ref={holder}>
      <div class="bar-row">
        <label class="draft-picker">Draft{' '}
          <select value={String(p.version)} onChange={e => p.onVersion(Number(e.currentTarget.value))}>
            {p.versions.map(v => <option value={String(v)}>{v === p.versions[0] ? `${v} (latest)` : String(v)}</option>)}
          </select>
        </label>
      </div>
      <Player src={score.audio} audioSrc={p.audioSrc} time={time} bar={tempo.barAt(time)} onTime={setTime} clip={clip} onClipDone={() => setClip(null)} seekRef={seekAudio} />
      <ViewTabs tabs={tabs} tab={tab} onTab={setWanted} />
      {seen.length > 0 ? (
        <div class="words" aria-label="Words in this piece">
          <span class="words-title">Words in this piece</span>
          {seen.map(t => <Word term={t} text={t.word} onOpen={setOpen} />)}
        </div>
      ) : null}
      {openTerm ? <Card term={openTerm} clip={openClip ? { from: openClip.from, to: openClip.to } : null} onHear={hear} onClose={() => setOpen(null)} /> : null}
      {tab === 'story' ? (
        <>
          <Timeline score={score} tempo={tempo} view={view} time={time} onSeek={seek} onView={setView} onHold={setHolding} onTerm={setOpen} overlay={pins} />
          {score.changes.length > 0 ? (
            <ol class="changes" aria-label="Claude's changes">
              {score.changes.map((c, i) => (
                <li data-change={i}>
                  <button type="button" class="where" onClick={() => seek(changeTimes(c, tempo, score.duration).from)}>{i + 1}. {changeLabel(c)}</button>{' '}
                  {splitTerms(c.text).map(part => 'term' in part ? <Word term={part.term} text={part.text} onOpen={setOpen} /> : part.text)}
                </li>
              ))}
            </ol>
          ) : null}
        </>
      ) : null}
      {tab === 'roll' ? (
        <>
          <div class="lane-picker" role="group" aria-label="Lanes shown">
            {score.lanes.map(l => <button type="button" class="chip" aria-pressed={!lanes || lanes.has(l.id)} onClick={() => toggleLane(l.id)}>{l.name}</button>)}
          </div>
          <PianoRoll score={score} tempo={tempo} view={view} time={time} lanes={lanes} onSeek={seek} onView={setView} onHold={setHolding} />
        </>
      ) : null}
      {tab === 'sound' ? <SoundPicture score={score} view={view} time={time} imageSrc={p.audioSrc(score.spectrogram.file)} onSeek={seek} onView={setView} onHold={setHolding} /> : null}
      {tab === 'sheet' ? <Sheet musicxmlSrc={p.audioSrc('score.musicxml')} laneId={sheetLane} lanes={score.lanes} onLane={setSheetLane} /> : null}
      {p.children}
    </div>
  );
}
