// The Sheet view: every track written on a staff, on the same horizontal scale and bars as Compose, so bar 5 here is
// bar 5 there. Each note head sits behind a shaded bar as long as the note, as in the piano roll, with its name under
// it when Note Names is on; a tap on a head plays the note (even on a muted track), a tap on the staff puts the cursor
// on that beat. The playhead is moved by the transport's clock straight in the DOM (the draw handed to `register`),
// never through a render, and the staves follow it centred while the song plays. The open track's engraved sheet
// music sits below.
import type { ComponentChildren } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import type { Part } from '../../compose/doc.ts';
import { followTo, handScrolled, newFollow } from '../../compose/follow.ts';
import type { Follow } from '../../compose/follow.ts';
import { staffOf } from '../../compose/staff.ts';
import type { StaffKind, StaffLayout, StaffNote } from '../../compose/staff.ts';
import type { Ctl } from './ctl.ts';
import { headWidth } from './Arrange.tsx';
import { Glyph } from './Glyph.tsx';
import { Icon } from './InstrumentPicker.tsx';

export interface SheetViewProps {
  c: Ctl;
  /** Hands over the playhead's draw on mount, and null when the view goes. */
  register(h: { draw(beat: number, follow: boolean): void } | null): void;
  /** Below the staves: the open track's engraved sheet music. */
  engraved?: ComponentChildren;
}

/** Pixels per staff step (a line or a space); the lines are two steps apart. */
const STEP = 4;
const STEM = 26;
const NAME_H = 11;
const KIND_WORDS: Readonly<Record<StaffKind, string>> = {
  treble: 'Treble staff: the high notes', bass: 'Bass staff: the low notes', grand: 'Treble and bass staves', drums: 'Drum staff: one line per drum',
};

export function SheetView(p: SheetViewProps) {
  const { c } = p;
  const [names, setNames] = useState(true);
  const scroll = useRef<HTMLDivElement>(null);
  const head = useRef<HTMLDivElement>(null);
  const follow = useRef<Follow>(newFollow(0));
  const cRef = useRef(c);
  cRef.current = c;

  useEffect(() => {
    p.register({
      draw(beat, follows) {
        const x = beat * cRef.current.ppb;
        if (head.current) head.current.style.transform = `translateX(${x}px)`;
        const sc = scroll.current;
        if (!follows || !sc) return;
        const hw = headWidth();
        const want = followTo(follow.current, hw + x, { scrollLeft: sc.scrollLeft, clientWidth: sc.clientWidth, scrollWidth: sc.scrollWidth, inset: hw }, performance.now());
        if (want !== null) sc.scrollLeft = want;
      },
    });
    return () => p.register(null);
  }, []);
  useEffect(() => { if (c.playing) follow.current = newFollow(scroll.current?.scrollLeft ?? 0); }, [c.playing]);

  const width = c.total * c.ppb;
  const bars: number[] = [];
  for (let b = 1; b <= c.bars + 1; b++) bars.push(c.clock.barStartBeat(b) * c.ppb);
  const style = { '--W': `${width}px`, '--beatw': `${c.ppb}px`, '--barw': `${c.clock.tempoAt(1).beats * c.ppb}px` };

  return (
    <div class="grid gap-3" data-sheet-view="">
      <div class="cmp-sv-bar">
        <p class="cmp-sv-help">The same notes as the piano roll, written the way musicians read them. Higher notes sit higher on the lines. The shaded bar behind each note shows how long it lasts. Tap a note to hear it.</p>
        <button type="button" class="cmp-btn small" aria-pressed={names} data-note-names="" onClick={() => setNames(!names)}>{`Note Names: ${names ? 'On' : 'Off'}`}</button>
      </div>
      {c.doc.parts.length === 0 ? <p class="text-sm text-dim">No tracks yet. Add an instrument in Compose.</p> : (
        <div ref={scroll} class="cmp-sv" style={style}
          onScroll={() => { if (c.playing && scroll.current) handScrolled(follow.current, scroll.current.scrollLeft, performance.now()); }}>
          <div class="cmp-sv-in" style={{ width: `calc(var(--head) + ${width}px)` }}>
            <div class="cmp-row cmp-sv-ruler">
              <div class="cmp-head flex items-center px-2"><span class="cmp-label">Bar</span></div>
              <div class="cmp-cell plain">
                {bars.slice(0, -1).map((x, i) => <span class="cmp-barnum" style={{ left: `${x}px` }}>{i + 1}</span>)}
              </div>
            </div>
            {c.doc.parts.map(part => <SheetRow c={c} part={part} names={names} bars={bars} width={width} />)}
            <div ref={head} class="cmp-playhead" data-sheet-playhead="" style={{ transform: `translateX(${c.cursor * c.ppb}px)` }} />
          </div>
        </div>
      )}
      {p.engraved}
    </div>
  );
}

/** One track: its header (icon, name, which staff) and its staff. */
function SheetRow(p: { c: Ctl; part: Part; names: boolean; bars: readonly number[]; width: number }) {
  const { c, part } = p;
  const entry = c.entryOf(part);
  if (part.vocal) {
    return (
      <div class="cmp-row" data-sheet-row={part.id}>
        <Head part={part} icon={null} sub="A vocal track: its takes have no notes to write." />
        <div class="cmp-cell plain cmp-sv-vocal" />
      </div>
    );
  }
  const layout = staffOf(part, entry, c.doc.key ?? null, c.clock.quarter(1));
  const sig = layout.signature ? `Key: ${layout.signature.letters.length} ${layout.signature.accidental} (${layout.signature.letters.join(', ')})` : '';
  return (
    <div class="cmp-row" data-sheet-row={part.id}>
      <Head part={part} icon={entry?.icon ?? part.icon} sub={[KIND_WORDS[layout.kind], sig].filter(Boolean).join(' · ')} />
      <div class="cmp-cell plain">
        <Staves c={c} part={part} layout={layout} names={p.names} bars={p.bars} width={p.width} />
      </div>
    </div>
  );
}

function Head(p: { part: Part; icon: string | null; sub: string }) {
  return (
    <div class="cmp-head cmp-sv-head">
      <span class="cmp-tile" style={{ '--c': p.part.color }}>{p.icon === null ? <Glyph name="mic" /> : <Icon name={p.icon} size={22} />}</span>
      <span class="grid min-w-0">
        <b class="font-display text-sm leading-tight font-semibold break-words">{p.part.name}</b>
        <small class="text-[0.7rem] leading-snug text-dim">{p.sub}</small>
      </span>
    </div>
  );
}

/** A staff's extent in steps: the lines (−4 to 4), the notes, their stems and ledger lines. */
function extent(notes: readonly StaffNote[]): { hi: number; lo: number } {
  let hi = 6;
  let lo = -6;
  for (const n of notes) {
    hi = Math.max(hi, n.step + 2 + (n.stemUp ? STEM / STEP : 0));
    lo = Math.min(lo, n.step - 2 - (n.stemUp ? 0 : STEM / STEP));
  }
  return { hi, lo };
}

/** The part's staff, or a grand staff's two, drawn as one SVG on the shared scale. */
function Staves(p: { c: Ctl; part: Part; layout: StaffLayout; names: boolean; bars: readonly number[]; width: number }) {
  const { c, part, layout } = p;
  const staves = layout.kind === 'grand' ? [0, 1] as const : [0] as const;
  const quarter = c.clock.quarter(1);
  // Names stack under each start's notes: the deepest stack sets the room under the staff.
  const blocks = staves.map(s => {
    const notes = layout.notes.filter(n => n.staff === s);
    const { hi, lo } = extent(notes);
    const stacks = new Map<number, number>();
    for (const n of notes) stacks.set(n.start, (stacks.get(n.start) ?? 0) + 1);
    const deepest = p.names ? Math.max(0, ...stacks.values()) : 0;
    return { s, notes, hi, lo, height: (hi - lo) * STEP + deepest * NAME_H + (deepest ? 6 : 0) };
  });
  let top = 4;
  const placed = blocks.map(b => { const at = top; top += b.height + 6; return { ...b, top: at }; });
  const height = top;
  const hear = (n: StaffNote): void => c.preview(part, n.pitch, Math.min(n.length, 2));
  const tap = (e: MouseEvent): void => {
    if ((e.target as Element).closest('[data-sheet-note]')) return;
    const svg = e.currentTarget as SVGSVGElement;
    const beat = Math.floor((e.clientX - svg.getBoundingClientRect().left) / c.ppb + 1e-9);
    c.setCursor(Math.max(0, Math.min(beat, Math.max(0, c.end - 1))));
  };
  const endX = c.end * c.ppb;
  return (
    <svg class="cmp-sv-staff" width={p.width} height={height} role="group" aria-label={`${part.name} on the staff`} onClick={tap}>
      <rect x={endX} y={0} width={Math.max(0, p.width - endX)} height={height} class="cmp-sv-past" />
      {placed.map(b => {
        const y = (step: number): number => b.top + (b.hi - step) * STEP;
        const nameTop = y(b.lo) + 4;
        const row = new Map<number, number>();
        return (
          <g>
            {[-4, -2, 0, 2, 4].map(s => <line class="cmp-sv-line" x1={0} x2={p.width} y1={y(s)} y2={y(s)} />)}
            {p.bars.map((x, i) => <line class={i === p.bars.length - 1 ? 'cmp-sv-barline end' : 'cmp-sv-barline'} x1={x} x2={x} y1={y(4)} y2={y(-4)} />)}
            {b.notes.map(n => {
              const x0 = n.start * c.ppb;
              const cx = x0 + Math.min(7, Math.max(5, c.ppb * 0.35));
              const cy = y(n.step);
              const k = row.get(n.start) ?? 0;
              row.set(n.start, k + 1);
              const stem = n.length < 4 * quarter - 1e-6;
              return (
                <g class={n.ghost ? 'cmp-sv-note ghost' : 'cmp-sv-note'} data-sheet-note={n.name} role="button" tabindex={0} aria-label={`${n.name}: hear it`}
                  onClick={() => hear(n)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); hear(n); } }}>
                  <rect class="cmp-sv-len" x={x0 + 1} y={cy - 4} width={Math.max(4, n.length * c.ppb - 2)} height={8} rx={3} style={{ fill: part.color }} />
                  {n.ledgers.map(l => <line class="cmp-sv-ledger" x1={cx - 8} x2={cx + 8} y1={y(l)} y2={y(l)} />)}
                  {n.accidental ? <text class="cmp-sv-acc" x={cx - 9} y={cy + 4} text-anchor="end">{n.accidental}</text> : null}
                  {n.cross
                    ? <path class="cmp-sv-x" d={`M${cx - 4.5} ${cy - 4}L${cx + 4.5} ${cy + 4}M${cx - 4.5} ${cy + 4}L${cx + 4.5} ${cy - 4}`} />
                    : <ellipse class={n.hollow ? 'cmp-sv-dot hollow' : 'cmp-sv-dot'} cx={cx} cy={cy} rx={5.5} ry={4} transform={`rotate(-20 ${cx} ${cy})`} />}
                  {stem ? <line class="cmp-sv-stem" x1={n.stemUp ? cx + 5 : cx - 5} x2={n.stemUp ? cx + 5 : cx - 5} y1={cy} y2={n.stemUp ? cy - STEM : cy + STEM} /> : null}
                  {p.names ? <text class="cmp-sv-name" x={cx} y={nameTop + (k + 1) * NAME_H - 2} text-anchor="middle">{n.name}</text> : null}
                  <rect x={cx - 9} y={cy - 9} width={18} height={18} fill="transparent" />
                </g>
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}
