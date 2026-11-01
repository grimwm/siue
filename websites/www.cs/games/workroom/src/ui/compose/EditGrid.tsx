// The editing grid: the selected part's notes as blocks on rows of pitch (a drum part's rows are its drums), bars across.
// Tap a note to select it and tap it again to delete it; drag a note to move it, or its right end to stretch it; in
// Grid mode tap an empty cell to add a note of the current length; drag across empty space (mouse or pen) to select
// several. Notes beyond the instrument are red, notes only experts play are amber. Play Live shows the other parts as
// outlines; Hum's dashed line is dragged by its handle in the bar row to the bar where hummed notes go. The grid
// scrolls inside its own box, never the page.
import { useEffect, useLayoutEffect, useRef, useState } from 'preact/hooks';
import type { Entry } from '../../catalogue.ts';
import type { BeatClock } from '../../compose/beats.ts';
import type { EditNote } from '../../compose/doc.ts';
import { cellAt, gridRows, noteRect, rowIndex } from '../../compose/grid.ts';
import type { GridLayout } from '../../compose/grid.ts';
import { gridBeats, snapStart } from '../../compose/snap.ts';
import type { Grid } from '../../compose/snap.ts';
import { pitchName } from '../../pianoroll.ts';
import { cx } from '../console/cx.ts';

export const ROW_H = 18;
export const BEAT_W = 36;
const LABEL_W = 76;
const HEAD_H = 22;
/** A pointer that moves this far is dragging, not tapping. */
const SLOP = 5;
/** The right end of a note this wide is its stretch handle. */
const HANDLE = 10;

export interface EditGridProps {
  entry: Entry;
  color: string;
  notes: readonly EditNote[];
  clock: BeatClock;
  bars: number;
  lineUp: Grid;
  /** Grid mode: an empty tap adds a note of `length` beats. */
  adding: boolean;
  length: number;
  selected: ReadonlySet<number>;
  /** The note a second tap deletes. */
  armed: number | null;
  playhead: number | null;
  cursor: number | null;
  onTapNote(id: number): void;
  onMove(id: number, start: number, pitch: number): void;
  onResize(id: number, length: number): void;
  onAdd(start: number, pitch: number): void;
  onSelect(ids: number[]): void;
  /** The other parts' notes, drawn as outlines behind this part's. */
  ghosts?: readonly { start: number; length: number; pitch: number; color: string }[];
  /** Hum's dashed line, at a bar's first beat; dragged to another bar with onLine. */
  line?: number | null;
  onLine?(beat: number): void;
}

type Drag =
  | { kind: 'note'; id: number; resize: boolean; x: number; y: number; moved: boolean; start: number; pitch: number; length: number }
  | { kind: 'empty'; x: number; y: number; moved: boolean; mouse: boolean; x2: number; y2: number };

const words = (n: EditNote, clock: BeatClock): string => {
  const bar = clock.barOfBeat(n.start);
  const beat = n.start - clock.barStartBeat(bar) + 1;
  return `${pitchName(n.pitch)}, bar ${bar} beat ${Math.round(beat * 100) / 100}, ${Math.round(n.length * 100) / 100} beats`;
};

export function EditGrid(p: EditGridProps) {
  const box = useRef<HTMLDivElement>(null);
  const area = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<Drag | null>(null);
  const [lineDrag, setLineDrag] = useState(false);
  const rows = gridRows(p.entry, p.notes);
  const totalBeats = p.clock.barStartBeat(p.bars + 2);
  const layout: GridLayout = { rows, rowH: ROW_H, beatW: BEAT_W, beats: totalBeats };
  const quarter = p.clock.quarter(1);
  const finest = Math.max(0.0625, quarter / 4);

  // Opens on the part's notes, or its home note.
  const centred = useRef('');
  useLayoutEffect(() => {
    const el = box.current;
    if (!el || centred.current === p.entry.id) return;
    centred.current = p.entry.id;
    const pitches = p.notes.map(n => n.pitch);
    const mid = pitches.length ? (Math.min(...pitches) + Math.max(...pitches)) / 2 : (p.entry.home ?? rows[Math.floor(rows.length / 2)]?.pitch ?? 60);
    const i = Math.max(0, rowIndex(layout, Math.round(mid)));
    el.scrollTop = Math.max(0, HEAD_H + i * ROW_H - el.clientHeight / 2);
  });

  const local = (e: PointerEvent): { x: number; y: number } => {
    const r = area.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  const preview = (d: Extract<Drag, { kind: 'note' }>, e: PointerEvent): { start: number; pitch: number; length: number } => {
    const { x, y } = local(e);
    const dx = (x - d.x) / BEAT_W;
    if (d.resize) return { start: d.start, pitch: d.pitch, length: Math.max(finest, snapStart(d.start + d.length + dx, p.lineUp, quarter) - d.start) };
    const from = rowIndex(layout, d.pitch);
    const to = Math.min(rows.length - 1, Math.max(0, from + Math.round((y - d.y) / ROW_H)));
    return { start: snapStart(d.start + dx, p.lineUp, quarter), pitch: rows[to]!.pitch, length: d.length };
  };
  const [live, setLive] = useState<{ id: number; start: number; pitch: number; length: number } | null>(null);

  const down = (e: PointerEvent): void => {
    if (e.button !== 0) return;
    const target = (e.target as HTMLElement).closest<HTMLElement>('[data-note-id]');
    const { x, y } = local(e);
    if (target) {
      const id = Number(target.dataset.noteId);
      const n = p.notes.find(m => m.id === id);
      if (!n) return;
      const r = target.getBoundingClientRect();
      e.preventDefault();
      target.setPointerCapture?.(e.pointerId);
      setDrag({ kind: 'note', id, resize: e.clientX > r.right - HANDLE, x, y, moved: false, start: n.start, pitch: n.pitch, length: n.length });
      return;
    }
    const mouse = e.pointerType === 'mouse' || e.pointerType === 'pen';
    if (mouse) area.current!.setPointerCapture?.(e.pointerId);
    setDrag({ kind: 'empty', x, y, moved: false, mouse, x2: x, y2: y });
  };
  const move = (e: PointerEvent): void => {
    if (!drag) return;
    const { x, y } = local(e);
    const moved = drag.moved || Math.hypot(x - drag.x, y - drag.y) > SLOP;
    if (drag.kind === 'note') {
      if (!moved) return;
      setDrag({ ...drag, moved });
      setLive({ id: drag.id, ...preview(drag, e) });
    } else if (drag.mouse) setDrag({ ...drag, moved, x2: x, y2: y });
    else if (moved) setDrag({ ...drag, moved });
  };
  const up = (e: PointerEvent): void => {
    const d = drag;
    setDrag(null);
    setLive(null);
    if (!d) return;
    if (d.kind === 'note') {
      if (!d.moved) p.onTapNote(d.id);
      else {
        const to = preview(d, e);
        if (d.resize) p.onResize(d.id, to.length);
        else p.onMove(d.id, to.start, to.pitch);
      }
      return;
    }
    if (d.moved && d.mouse) {
      const [x1, x2] = [Math.min(d.x, d.x2), Math.max(d.x, d.x2)];
      const [y1, y2] = [Math.min(d.y, d.y2), Math.max(d.y, d.y2)];
      p.onSelect(p.notes.filter(n => {
        const r = noteRect(layout, n);
        return r !== null && r.x < x2 && r.x + r.w > x1 && r.y < y2 && r.y + r.h > y1;
      }).map(n => n.id));
      return;
    }
    if (d.moved) return;
    const cell = cellAt(layout, d.x, d.y);
    if (p.adding && cell) {
      const step = gridBeats(p.lineUp, quarter);
      p.onAdd(step === 0 ? cell.beat : Math.floor(cell.beat / step + 1e-9) * step, cell.pitch);
    } else p.onSelect([]);
  };
  useEffect(() => {
    if (!drag) return;
    const cancel = (): void => { setDrag(null); setLive(null); };
    window.addEventListener('blur', cancel);
    return () => window.removeEventListener('blur', cancel);
  }, [drag]);

  // The dashed line goes to the bar nearest the pointer.
  const lineTo = (e: PointerEvent): void => {
    const r = area.current!.getBoundingClientRect();
    const beat = (e.clientX - r.left) / BEAT_W;
    let best = 1;
    for (let bar = 1; bar <= p.bars + 1; bar++) if (Math.abs(p.clock.barStartBeat(bar) - beat) < Math.abs(p.clock.barStartBeat(best) - beat)) best = bar;
    p.onLine?.(p.clock.barStartBeat(best));
  };
  const width = totalBeats * BEAT_W;
  const height = rows.length * ROW_H;
  const barLines: { x: number; bar: number }[] = [];
  for (let bar = 1; bar <= p.bars + 1; bar++) barLines.push({ x: p.clock.barStartBeat(bar) * BEAT_W, bar });
  const beatLines: number[] = [];
  for (let b = 0; b < totalBeats; b++) beatLines.push(b * BEAT_W);
  const marquee = drag?.kind === 'empty' && drag.mouse && drag.moved
    ? { left: Math.min(drag.x, drag.x2), top: Math.min(drag.y, drag.y2), width: Math.abs(drag.x2 - drag.x), height: Math.abs(drag.y2 - drag.y) } : null;

  return (
    <div ref={box} data-edit-grid="" class="relative h-[22rem] overflow-auto rounded-lg border border-rule bg-well [overflow-anchor:none]">
      <div class="relative" style={{ width: `${LABEL_W + width}px`, height: `${HEAD_H + height}px` }}>
        <div class="sticky top-0 z-20 flex h-[22px] bg-panel" style={{ width: `${LABEL_W + width}px` }}>
          <div class="sticky left-0 z-30 w-[76px] shrink-0 bg-panel px-2 font-mono text-[11px] leading-[22px] text-dim">Bar</div>
          <div class="relative" style={{ width: `${width}px` }}>
            {barLines.slice(0, -1).map(b => <span class="absolute top-0 border-l border-rule pl-1 font-mono text-[11px] leading-[22px] text-dim" style={{ left: `${b.x}px` }}>{b.bar}</span>)}
            {p.line != null && p.onLine ? (
              <span role="slider" aria-label="The Dashed Line: Bar" aria-valuemin={1} aria-valuemax={p.bars + 1} aria-valuenow={p.clock.barOfBeat(p.line)} tabIndex={0} data-line-handle=""
                class={cx('absolute top-0 z-10 h-[22px] w-5 -translate-x-1/2 cursor-ew-resize touch-none rounded-sm bg-amber text-center font-mono text-[11px] leading-[22px] text-on-accent', lineDrag && 'outline-2 outline-ink')}
                style={{ left: `${p.line * BEAT_W}px` }}
                onPointerDown={e => { e.preventDefault(); (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId); setLineDrag(true); }}
                onPointerMove={e => { if (lineDrag) lineTo(e); }}
                onPointerUp={e => { if (lineDrag) lineTo(e); setLineDrag(false); }}
                onPointerCancel={() => setLineDrag(false)}
                onKeyDown={e => {
                  const bar = p.clock.barOfBeat(p.line!);
                  if (e.key === 'ArrowLeft' && bar > 1) { e.preventDefault(); p.onLine!(p.clock.barStartBeat(bar - 1)); }
                  if (e.key === 'ArrowRight' && bar <= p.bars) { e.preventDefault(); p.onLine!(p.clock.barStartBeat(bar + 1)); }
                }}>⇔</span>
            ) : null}
          </div>
        </div>
        <div class="absolute left-0 z-10" style={{ top: `${HEAD_H}px`, width: `${LABEL_W}px` }}>
          {rows.map(r => (
            <div data-row-label={r.pitch} class={cx('sticky left-0 flex items-center truncate border-b border-rule/40 px-2 font-mono text-[11px]',
              r.black ? 'bg-lane text-dim' : 'bg-panel text-ink', r.range === 'out' && 'text-record', r.range === 'expert' && 'text-amber')}
              style={{ height: `${ROW_H}px` }}>{r.name}</div>
          ))}
        </div>
        <div ref={area} data-grid-area="" class="absolute touch-pan-x touch-pan-y select-none" style={{ left: `${LABEL_W}px`, top: `${HEAD_H}px`, width: `${width}px`, height: `${height}px` }}
          onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={() => { setDrag(null); setLive(null); }}>
          {rows.map((r, i) => <div class={cx('absolute left-0 border-b border-rule/30', r.black ? 'bg-lane/60' : '', r.range === 'out' ? 'bg-record/10' : r.range === 'expert' ? 'bg-amber/5' : '')}
            style={{ top: `${i * ROW_H}px`, height: `${ROW_H}px`, width: `${width}px` }} />)}
          {beatLines.map(x => <div class="pointer-events-none absolute top-0 border-l border-rule/30" style={{ left: `${x}px`, height: `${height}px` }} />)}
          {barLines.map(b => <div class="pointer-events-none absolute top-0 border-l border-dim/60" style={{ left: `${b.x}px`, height: `${height}px` }} />)}
          {(p.ghosts ?? []).map(g => {
            const r = noteRect(layout, g);
            return r ? <div data-ghost="" class="pointer-events-none absolute rounded-sm border-2 border-dashed opacity-70" style={{ left: `${r.x}px`, top: `${r.y + 2}px`, width: `${r.w}px`, height: `${r.h - 4}px`, borderColor: g.color }} /> : null;
          })}
          {p.line != null ? <div data-hum-line="" class="pointer-events-none absolute top-0 border-l-2 border-dashed border-amber" style={{ left: `${p.line * BEAT_W}px`, height: `${height}px` }} /> : null}
          {p.cursor !== null ? <div data-step-cursor="" class="pointer-events-none absolute top-0 border-l-2 border-dashed border-amber" style={{ left: `${p.cursor * BEAT_W}px`, height: `${height}px` }} /> : null}
          {p.notes.map(n => {
            const shown = live && live.id === n.id ? { ...n, ...live } : n;
            const r = noteRect(layout, shown);
            if (!r) return null;
            const range = rows[rowIndex(layout, shown.pitch)]?.range ?? 'normal';
            const on = p.selected.has(n.id);
            return (
              <button type="button" data-note-id={n.id} data-note={pitchName(n.pitch)} data-velocity={n.velocity} data-range={range} aria-pressed={on}
                aria-label={`${words(n, p.clock)}${range === 'out' ? ', out of this instrument\'s range' : range === 'expert' ? ', for experts' : ''}${on ? ', selected: tap again to delete' : ''}`}
                class={cx('absolute touch-none rounded-sm border text-left font-mono text-[10px] leading-none text-on-accent',
                  range === 'out' ? 'border-record bg-record' : range === 'expert' ? 'border-amber bg-amber' : 'border-ground/40',
                  on && 'outline-2 outline-offset-1 outline-ink', p.armed === n.id && 'animate-pulse')}
                style={{ left: `${r.x}px`, top: `${r.y + 1}px`, width: `${r.w}px`, height: `${r.h - 2}px`, ...(range === 'normal' ? { background: p.color } : {}) }}>
                <span class="pointer-events-none absolute top-0 right-0 h-full w-[6px] cursor-ew-resize bg-ground/30" />
              </button>
            );
          })}
          {p.playhead !== null ? <div data-playhead="" class="pointer-events-none absolute top-0 border-l-2 border-go" style={{ left: `${p.playhead * BEAT_W}px`, height: `${height}px` }} /> : null}
          {marquee ? <div data-marquee="" class="pointer-events-none absolute border border-amber bg-amber/10" style={{ left: `${marquee.left}px`, top: `${marquee.top}px`, width: `${marquee.width}px`, height: `${marquee.height}px` }} /> : null}
        </div>
      </div>
    </div>
  );
}
