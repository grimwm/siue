// An open track's grid, on the timeline's scale. A melodic track is a piano roll: two octaves of rows, the keys in the
// header column (they stay put while the bars scroll), rows in the chosen key shaded. Click or tap to add a note of
// the New Notes length; drag a note to move it, its right end to lengthen it; drag on empty space (or Select) to box
// several; Shift-click adds one to the picked notes; right-click, double-click or a long press deletes one. A drum
// track is a step sequencer: one named row per drum, a square per sixteenth; tap squares to turn hits on or off, drag
// to paint. With a finger, a tap adds on lift so a swipe still scrolls. From the keys, Tab reaches each note and Enter
// picks it; the arrows, Delete and Backspace then act on it.
import { useRef, useState } from 'preact/hooks';
import { rangeClass } from '../../catalogue.ts';
import type { Entry } from '../../catalogue.ts';
import { chordPitches, chordRoot, inKey } from '../../compose/chords.ts';
import type { EditNote, Part } from '../../compose/doc.ts';
import { addNotes, moveNote, removeNotes, resizeNote } from '../../compose/edit.ts';
import { notesInBox, shiftNotes, transposeNotes } from '../../compose/notetools.ts';
import { heardNotes } from '../../compose/regions.ts';
import { pitchName } from '../../pianoroll.ts';
import { cx } from '../console/cx.ts';
import type { Ctl } from './ctl.ts';
import { ROLL_ROWS } from './ctl.ts';

const BLACK = new Set([1, 3, 6, 8, 10]);
const NAMES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
/** A row's height: taller under a finger. */
export const rowH = (c: Ctl, drums: boolean): number => (drums ? (c.coarse ? 32 : 26) : c.coarse ? 24 : 18);
/** A pointer that moves this far is dragging, not tapping. */
const SLOP = 6;
const HOLD_DELETE_MS = 550;

/** The piano keys of a part's two-octave window, top to bottom; a press plays the key. */
export function RollKeys(p: { c: Ctl; part: Part; entry: Entry }) {
  const { c, part, entry } = p;
  const low = c.low(part);
  const rh = rowH(c, false);
  const rows = Array.from({ length: ROLL_ROWS }, (_, i) => low + ROLL_ROWS - 1 - i);
  return (
    <div class="cmp-keys" style={{ gridTemplateRows: `repeat(${ROLL_ROWS}, ${rh}px)` }} data-keys={part.id}>
      {rows.map(pitch => {
        const black = BLACK.has(pitch % 12);
        const key = c.doc.key;
        return (
          <div data-key={pitch} title={pitchName(pitch)} onPointerDown={() => c.preview(part, pitch, 1)}
            class={cx('cmp-key', black ? 'black' : 'white', key && inKey(pitch, key) && 'inkey', key && pitch % 12 === key.tonic && 'root', rangeClass(entry, pitch) === 'out' && 'out')}>
            {black ? '' : pitch % 12 === 0 ? pitchName(pitch) : NAMES[pitch % 12]}
          </div>
        );
      })}
    </div>
  );
}

/** The drum names of a step sequencer, top to bottom; a press plays the drum. */
export function DrumKeys(p: { c: Ctl; part: Part; entry: Entry }) {
  const rh = rowH(p.c, true);
  return (
    <div class="cmp-keys" style={{ gridTemplateRows: `repeat(${p.entry.pieces!.length}, ${rh}px)` }} data-keys={p.part.id}>
      {p.entry.pieces!.map(([pitch, name]) => <div class="cmp-drumkey" data-drum={pitch} title={name} onPointerDown={() => p.c.preview(p.part, pitch, 1)}>{name}</div>)}
    </div>
  );
}

type Drag =
  | { kind: 'note'; id: number; resize: boolean; x0: number; y0: number; moved: boolean; timer?: ReturnType<typeof setTimeout>; group: boolean }
  | { kind: 'empty'; x0: number; y0: number; moved: boolean; touch: boolean; box: boolean; add: boolean }
  | { kind: 'paint'; on: boolean; done: Set<string>; touch: boolean; x0: number; y0: number; moved: boolean; added: { start: number; pitch: number }[]; removed: Set<number> };

/** The piano roll's grid or the step sequencer's squares for an open track. */
export function NoteGrid(p: { c: Ctl; part: Part; entry: Entry }) {
  const { c, part, entry } = p;
  const drums = !!entry.pieces;
  const rh = rowH(c, drums);
  const low = c.low(part);
  const high = low + ROLL_ROWS - 1;
  const pieces = entry.pieces ?? [];
  const rows = drums ? pieces.length : ROLL_ROWS;
  const step = drums ? c.clock.quarter(1) / 4 : Math.min(c.len, 1);
  const grid = useRef<HTMLDivElement>(null);
  const drag = useRef<Drag | null>(null);
  const [live, setLive] = useState<{ ds: number; dp: number; dl: number; ids: ReadonlySet<number> } | null>(null);
  const [box, setBox] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
  const [painted, setPainted] = useState<{ added: { start: number; pitch: number }[]; removed: ReadonlySet<number> } | null>(null);

  const picked = c.pick.kind === 'notes' && c.pick.part === part.id ? c.pick.ids : null;
  const rowOf = (pitch: number): number => (drums ? pieces.findIndex(([q]) => q === pitch) : high - pitch);
  const pitchAt = (y: number): number => {
    const r = Math.max(0, Math.min(rows - 1, Math.floor(y / rh)));
    return drums ? pieces[r]![0] : high - r;
  };
  const local = (e: PointerEvent): { x: number; y: number } => {
    const r = grid.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  const beatAt = (x: number): number => Math.max(0, Math.min(c.total - step, Math.floor(x / c.ppb / step + 1e-9) * step));
  const hitAt = (x: number, y: number): EditNote | undefined => {
    const b = x / c.ppb;
    const pitch = pitchAt(y);
    return drums ? part.notes.find(n => n.pitch === pitch && b >= n.start - 1e-9 && b < n.start + step - 1e-9) : undefined;
  };

  const addAt = (x: number, y: number): void => {
    const at = beatAt(x);
    if (c.chord && c.chord.part === part.id) {
      const root = chordRoot(c.chord.chord, pitchAt(y));
      const pitches = chordPitches(c.chord.chord, root);
      const made = addNotes(c.doc, part.id, pitches.map(pitch => ({ start: at, length: c.len, pitch })));
      c.apply(made.doc);
      c.setPick({ kind: 'notes', part: part.id, ids: new Set(made.ids) });
      for (const q of pitches) c.preview(part, q, Math.min(c.len, 2));
      return;
    }
    const pitch = pitchAt(y);
    const made = addNotes(c.doc, part.id, [{ start: at, length: drums ? step : c.len, pitch }]);
    c.apply(made.doc);
    c.preview(part, pitch, Math.min(c.len, 2));
  };

  const down = (e: PointerEvent): void => {
    if (c.placing) return;
    if (c.sel !== part.id) c.setSel(part.id);
    const { x, y } = local(e);
    const mouse = e.pointerType !== 'touch';
    const el = (e.target as HTMLElement).closest<HTMLElement>('[data-note-id]');
    const n = el ? part.notes.find(m => m.id === Number(el.dataset['noteId'])) : hitAt(x, y);
    if (e.button === 2) {
      if (n) { e.preventDefault(); c.apply(removeNotes(c.doc, part.id, picked?.has(n.id) ? picked : new Set([n.id]))); c.setPick({ kind: 'none' }); }
      return;
    }
    if (e.button > 0) return;
    if (n && mouse && e.shiftKey || n && c.selectMode) {
      const ids = new Set(picked ?? []);
      if (ids.has(n.id)) ids.delete(n.id); else ids.add(n.id);
      c.setPick(ids.size ? { kind: 'notes', part: part.id, ids } : { kind: 'none' });
      return;
    }
    if (c.selectMode || (mouse && e.shiftKey)) {
      grid.current!.setPointerCapture?.(e.pointerId);
      drag.current = { kind: 'empty', x0: x, y0: y, moved: false, touch: !mouse, box: true, add: e.shiftKey };
      return;
    }
    if (n && !drums) {
      e.preventDefault();
      grid.current!.setPointerCapture?.(e.pointerId);
      const r = el!.getBoundingClientRect();
      const group = !!picked?.has(n.id) && picked.size > 1;
      const d: Drag = { kind: 'note', id: n.id, resize: !group && e.clientX > r.right - Math.max(8, Math.min(14, r.width / 3)), x0: x, y0: y, moved: false, group };
      if (!mouse) d.timer = setTimeout(() => {
        if (drag.current === d && !d.moved) {
          drag.current = null;
          c.apply(removeNotes(c.doc, part.id, new Set([n.id])));
          c.setPick({ kind: 'none' });
          c.say('Deleted the note. Undo brings it back.');
        }
      }, HOLD_DELETE_MS);
      drag.current = d;
      c.preview(part, n.pitch, Math.min(n.length, 2));
      return;
    }
    if (drums) {
      if (picked) { c.setPick({ kind: 'none' }); }
      const d: Drag = { kind: 'paint', on: !n, done: new Set(), touch: !mouse, x0: x, y0: y, moved: false, added: [], removed: new Set() };
      drag.current = d;
      if (mouse) { grid.current!.setPointerCapture?.(e.pointerId); paint(d, x, y); }
      return;
    }
    if (mouse) grid.current!.setPointerCapture?.(e.pointerId);
    drag.current = { kind: 'empty', x0: x, y0: y, moved: false, touch: !mouse, box: false, add: false };
  };

  const paint = (d: Extract<Drag, { kind: 'paint' }>, x: number, y: number): void => {
    const at = beatAt(x);
    const pitch = pitchAt(y);
    const k = `${at}:${pitch}`;
    if (d.done.has(k)) return;
    d.done.add(k);
    const has = part.notes.find(n => n.pitch === pitch && Math.abs(n.start - at) < 1e-6);
    if (d.on && !has) { d.added.push({ start: at, pitch }); c.preview(part, pitch, 1); }
    if (!d.on && has) d.removed.add(has.id);
    setPainted({ added: [...d.added], removed: new Set(d.removed) });
  };

  const move = (e: PointerEvent): void => {
    const d = drag.current;
    if (!d) return;
    const { x, y } = local(e);
    if (!d.moved && Math.hypot(x - d.x0, y - d.y0) > SLOP) {
      d.moved = true;
      if (d.kind === 'note' && d.timer) clearTimeout(d.timer);
    }
    if (d.kind === 'paint') { if (!d.touch) paint(d, x, y); return; }
    if (!d.moved) return;
    if (d.kind === 'empty') {
      if (d.touch && !d.box) { drag.current = null; return; }
      d.box = true;
      setBox({ x1: d.x0, y1: d.y0, x2: x, y2: y });
      return;
    }
    const n = part.notes.find(m => m.id === d.id);
    if (!n) return;
    if (d.resize) {
      const endBeat = Math.ceil((x + 1) / c.ppb / step - 1e-9) * step;
      setLive({ ds: 0, dp: 0, dl: Math.max(step, endBeat - n.start) - n.length, ids: new Set([n.id]) });
      return;
    }
    const ds = Math.round((x - d.x0) / c.ppb / step) * step;
    const dp = Math.round((d.y0 - y) / rh);
    const ids = d.group ? picked! : new Set([n.id]);
    const sel = part.notes.filter(m => ids.has(m.id));
    const minStart = Math.min(...sel.map(m => m.start));
    const lo = Math.min(...sel.map(m => m.pitch));
    const hi = Math.max(...sel.map(m => m.pitch));
    const cds = Math.max(-minStart, ds);
    const cdp = Math.max(low - lo, Math.min(high - hi, dp));
    if (!live || live.dp !== cdp) c.preview(part, n.pitch + cdp, 1);
    setLive({ ds: cds, dp: cdp, dl: 0, ids });
  };

  const up = (e: PointerEvent): void => {
    const d = drag.current;
    drag.current = null;
    const was = live;
    setLive(null);
    setBox(null);
    setPainted(null);
    if (!d) return;
    if (d.kind === 'note' && d.timer) clearTimeout(d.timer);
    const lifted = e.type === 'pointerup';
    if (d.kind === 'paint') {
      if (d.touch && lifted && !d.moved) paint(d, d.x0, d.y0);
      let next = c.doc;
      if (d.removed.size) next = removeNotes(next, part.id, d.removed);
      if (d.added.length) next = addNotes(next, part.id, d.added.map(a => ({ start: a.start, length: step, pitch: a.pitch, velocity: 100 }))).doc;
      if (next !== c.doc) c.apply(next);
      return;
    }
    if (d.kind === 'empty') {
      if (d.box && d.moved) {
        const x1 = Math.min(d.x0, local(e).x), x2 = Math.max(d.x0, local(e).x);
        const y1 = Math.min(d.y0, local(e).y), y2 = Math.max(d.y0, local(e).y);
        const ids = notesInBox(part.notes, { from: x1 / c.ppb, to: x2 / c.ppb, low: pitchAt(y2), high: pitchAt(y1) });
        const all = new Set([...(d.add && picked ? picked : []), ...ids]);
        c.setPick(all.size ? { kind: 'notes', part: part.id, ids: all } : { kind: 'none' });
        if (all.size) c.say(`${all.size} ${all.size === 1 ? 'note' : 'notes'} picked.`);
        return;
      }
      if (!lifted || d.moved) return;
      if (picked && !c.chord) { c.setPick({ kind: 'none' }); return; }
      addAt(d.x0, d.y0);
      return;
    }
    const n = part.notes.find(m => m.id === d.id);
    if (!n) return;
    if (!d.moved) {
      if (lifted) c.setPick({ kind: 'notes', part: part.id, ids: picked?.has(n.id) ? picked : new Set([n.id]) });
      return;
    }
    if (!lifted || !was) return;
    if (d.resize) { c.apply(resizeNote(c.doc, part.id, n.id, n.length + was.dl, step)); return; }
    if (d.group) {
      let next = shiftNotes(c.doc, part.id, was.ids, was.ds);
      next = transposeNotes(next, part.id, was.ids, was.dp);
      c.apply(next);
      return;
    }
    c.apply(moveNote(c.doc, part.id, n.id, n.start + was.ds, n.pitch + was.dp));
    c.setPick({ kind: 'notes', part: part.id, ids: new Set([n.id]) });
  };

  /** Enter or the space bar on a focused note picks it (Shift adds it to the picked ones). */
  const keyPick = (e: KeyboardEvent, id: number): void => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    e.stopPropagation();
    const ids = new Set(e.shiftKey && picked ? picked : []);
    if (ids.has(id) && e.shiftKey) ids.delete(id); else ids.add(id);
    c.setPick(ids.size ? { kind: 'notes', part: part.id, ids } : { kind: 'none' });
  };
  const width = c.total * c.ppb;
  const height = rows * rh;
  const shown = heardNotes(part);
  const typingHere = c.typing && !drums && c.sel === part.id;
  return (
    <div ref={grid} class={cx('cmp-roll', (c.selectMode || c.chord) && 'selecting')} data-grid={part.id} data-drums={drums ? '' : undefined}
      style={{ width: `${width}px`, height: `${height}px`, '--c': part.color }}
      onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
      onContextMenu={e => e.preventDefault()}
      onDblClick={e => {
        const el = (e.target as HTMLElement).closest<HTMLElement>('[data-note-id]');
        if (el) { c.apply(removeNotes(c.doc, part.id, new Set([Number(el.dataset['noteId'])]))); c.setPick({ kind: 'none' }); }
      }}>
      {Array.from({ length: rows }, (_, r) => {
        const pitch = drums ? pieces[r]![0] : high - r;
        const k = c.doc.key;
        return <div class={cx('cmp-rrow', !drums && BLACK.has(pitch % 12) && 'black', !drums && k && inKey(pitch, k) && 'inkey', !drums && rangeClass(entry, pitch) === 'out' && 'out')}
          style={{ top: `${r * rh}px`, height: `${rh}px` }} />;
      })}
      {(part.regions ?? []).map(r => <div class="cmp-rg-bg" style={{ left: `${r.start * c.ppb}px`, width: `${r.length * c.ppb}px` }} />)}
      {typingHere ? <div class="cmp-stepcol" data-step-col="" style={{ left: `${c.cursor * c.ppb}px`, width: `${Math.max(4, c.len * c.ppb)}px` }} /> : null}
      {shown.map(n => {
        const ghost = 'ghost' in n && n.ghost;
        const moving = !ghost && live?.ids.has(n.id);
        const start = n.start + (moving ? live!.ds : 0);
        const pitch = n.pitch + (moving ? live!.dp : 0);
        const length = n.length + (moving ? live!.dl : 0);
        if (painted?.removed.has(n.id)) return null;
        const r = rowOf(pitch);
        if (r < 0 || r >= rows) return null;
        const on = !ghost && !!picked?.has(n.id);
        const op = (0.45 + (0.55 * n.velocity) / 127).toFixed(2);
        if (drums) {
          return <div class="cmp-cellhit" data-hit={ghost ? undefined : n.id} aria-pressed={on} tabIndex={ghost ? undefined : 0} role={ghost ? undefined : 'button'}
            aria-label={ghost ? undefined : `${pieces.find(([q]) => q === n.pitch)?.[1] ?? pitchName(n.pitch)} hit`} onKeyDown={ghost ? undefined : e => keyPick(e, n.id)}
            style={{ left: `${start * c.ppb + 2}px`, top: `${r * rh + 3}px`, width: `${Math.max(4, step * c.ppb - 4)}px`, height: `${rh - 6}px`, opacity: ghost ? 0.3 : op }} />;
        }
        const w = Math.max(6, length * c.ppb - 1);
        const out = rangeClass(entry, pitch) === 'out';
        return (
          <div data-note-id={ghost ? undefined : n.id} data-note={pitchName(pitch)} tabIndex={ghost ? undefined : 0} role={ghost ? undefined : 'button'}
            aria-label={ghost ? undefined : `${pitchName(pitch)}${out ? ', out of this instrument\'s range' : ''}`} onKeyDown={ghost ? undefined : e => keyPick(e, n.id)} data-velocity={n.velocity} data-range={out ? 'out' : 'normal'} aria-pressed={on}
            class={cx('cmp-note', ghost && 'ghost', out && 'out')} title={`${pitchName(pitch)} · loudness ${n.velocity}`}
            style={{ left: `${start * c.ppb}px`, top: `${(high - pitch) * rh + 1}px`, width: `${w}px`, height: `${rh - 2}px`, opacity: ghost ? undefined : op }}>
            {w > 26 ? pitchName(pitch) : ''}
            {!ghost && w > 14 ? <span class="end" /> : null}
          </div>
        );
      })}
      {painted?.added.map(a => {
        const r = rowOf(a.pitch);
        return <div class="cmp-cellhit" style={{ left: `${a.start * c.ppb + 2}px`, top: `${r * rh + 3}px`, width: `${Math.max(4, step * c.ppb - 4)}px`, height: `${rh - 6}px` }} />;
      })}
      {box ? <div class="cmp-box" data-box="" style={{ left: `${Math.min(box.x1, box.x2)}px`, top: `${Math.min(box.y1, box.y2)}px`, width: `${Math.abs(box.x2 - box.x1)}px`, height: `${Math.abs(box.y2 - box.y1)}px` }} /> : null}
    </div>
  );
}
