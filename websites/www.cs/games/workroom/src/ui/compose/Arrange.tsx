// The timeline: every row on one horizontal scale and one scroll, time running left to right. From the top, the song's
// sections, the ruler (tap a bar to put the cursor there, drag along bars to loop them, markers to jump to), the Effects
// lane (effects that are a sound of their own), then a row per track. A closed track shows its regions and a picture
// of its notes; an open one adds its toolbar, its regions strip and its piano roll or step sequencer, with the editor's
// title the instrument's name. Effects that change a track's sound are drawn on that track as a ramp or a block. The
// playhead is moved by the transport's clock straight in the DOM (draw), never through a render, and the bars follow it
// centred while the song plays.
import type { ComponentChildren } from 'preact';
import { useEffect, useLayoutEffect, useRef } from 'preact/hooks';
import { fxInfo } from '../../compose/djcatalogue.ts';
import { moveClip, pos, resizeClip } from '../../compose/djclips.ts';
import type { Part, Region } from '../../compose/doc.ts';
import { handScrolled, newFollow, followTo } from '../../compose/follow.ts';
import type { Follow } from '../../compose/follow.ts';
import { isMuted } from '../../compose/mutes.ts';
import { clipsOnPart, laneClips, targetFor } from '../../compose/placement.ts';
import type { Target } from '../../compose/placement.ts';
import { heardNotes, loopRegion, moveRegion, splitRegion } from '../../compose/regions.ts';
import { moveSection, sectionColor, sectionsOf } from '../../compose/sections.ts';
import { tempoChanges } from '../../compose/song.ts';
import { cx } from '../console/cx.ts';
import type { Ctl } from './ctl.ts';
import { barWords } from './ctl.ts';
import { FX_COLOR, fxGlyph } from './fxlook.ts';
import { Glyph } from './Glyph.tsx';
import { DrumKeys, NoteGrid, RollKeys } from './PianoRoll.tsx';
import { TrackHead } from './TrackHead.tsx';

/** The header column's width: on a phone, and wider. Matches compose.css --head. */
export const HEAD_PHONE = 132;
export const HEAD_WIDE = 264;
export const headWidth = (): number => (typeof window !== 'undefined' && window.innerWidth >= 640 ? HEAD_WIDE : HEAD_PHONE);

export interface ArrangeProps {
  c: Ctl;
  /** The timeline's width once laid out, for the scale. */
  onWidth(px: number): void;
  /** What an open track shows besides its grid: the Record drawer, a vocal track's panel, a picked clip's settings. */
  drawer(part: Part): ComponentChildren;
  vocal(part: Part): ComponentChildren;
  clipSettings(index: number): ComponentChildren;
  /** The tool row of an open track (title and tools). */
  tools(part: Part): ComponentChildren;
  /** The effect being dragged or placed, and where it would land. */
  drop: Target | null;
  setDrop(t: Target | null): void;
  /** Add Instrument and Add Vocal Track, under the last track and on an empty song. */
  adds: ComponentChildren;
}

export function Arrange(p: ArrangeProps) {
  const { c } = p;
  const scroll = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const head = useRef<HTMLDivElement>(null);
  const dropEl = useRef<HTMLDivElement>(null);
  const follow = useRef<Follow>(newFollow(0));
  const playing = useRef(false);
  playing.current = c.playing;

  // The scale: the timeline's width, read once laid out and again whenever the window changes.
  useLayoutEffect(() => {
    const read = (): void => { if (scroll.current) p.onWidth(scroll.current.clientWidth); };
    read();
    window.addEventListener('resize', read);
    return () => window.removeEventListener('resize', read);
  }, []);
  // The playhead, drawn by the transport's clock.
  useEffect(() => {
    const hw = headWidth();
    c.head = {
      draw(beat: number, follows: boolean) {
        const x = beat * c.ppb;
        if (head.current) head.current.style.transform = `translateX(${x}px)`;
        const sc = scroll.current;
        if (!follows || !sc) return;
        const want = followTo(follow.current, hw + x, { scrollLeft: sc.scrollLeft, clientWidth: sc.clientWidth, scrollWidth: sc.scrollWidth, inset: hw }, performance.now());
        if (want !== null) sc.scrollLeft = want;
      },
    };
  });
  useEffect(() => { if (c.playing) follow.current = newFollow(scroll.current?.scrollLeft ?? 0); }, [c.playing]);
  // Where the effect would land: its shape on the rows it changes.
  useLayoutEffect(() => {
    const el = dropEl.current;
    const tl = inner.current;
    if (!el || !tl) return;
    const t = p.drop;
    if (!t) { el.hidden = true; return; }
    const rows = [...tl.querySelectorAll<HTMLElement>(t.lane === null ? '[data-row="lane"]' : `[data-track-row="${t.lane}"]`)];
    if (!rows.length) { el.hidden = true; return; }
    const top = Math.min(...rows.map(r => r.offsetTop));
    const bottom = Math.max(...rows.map(r => r.offsetTop + r.offsetHeight));
    const from = beatOfBar(c, t.from_bar);
    const to = beatOfBar(c, t.to_bar);
    el.hidden = false;
    el.className = cx('cmp-drop', t.bad && 'bad');
    el.style.setProperty('--c', FX_COLOR(t.effect));
    el.style.left = `${headWidth() + from * c.ppb}px`;
    el.style.width = `${Math.max(10, (to - from) * c.ppb)}px`;
    el.style.top = `${top + 2}px`;
    el.style.height = `${Math.max(24, bottom - top - 4)}px`;
    el.dataset['row'] = t.lane ?? 'lane';
    el.firstElementChild!.textContent = t.bad ?? t.label;
  });

  // Placing an effect by tap: a press on the timeline is the answer, never an edit; a mouse shows where it will land.
  const press = useRef<{ id: number; x: number; y: number } | null>(null);
  const placingDown = (e: PointerEvent): void => {
    if (!c.placing) return;
    const t = targetAt(c, e.clientX, e.clientY, c.placing);
    if (!t) return;
    e.stopPropagation();
    if (e.pointerType !== 'touch') e.preventDefault();
    press.current = { id: e.pointerId, x: e.clientX, y: e.clientY };
  };
  const placingMove = (e: PointerEvent): void => {
    if (!c.placing) return;
    if (press.current && e.pointerId === press.current.id && Math.hypot(e.clientX - press.current.x, e.clientY - press.current.y) > 10) press.current = null;
    if (e.pointerType !== 'touch' && !e.buttons) p.setDrop(targetAt(c, e.clientX, e.clientY, c.placing));
  };
  const placingUp = (e: PointerEvent): void => {
    if (!c.placing || !press.current || e.pointerId !== press.current.id) return;
    e.stopPropagation();
    press.current = null;
    const t = targetAt(c, e.clientX, e.clientY, c.placing);
    if (!t) return;
    if (t.bad) { p.setDrop(t); c.say(t.bad); return; }
    c.placeAt(t);
  };

  const hw = headWidth();
  const vis = Math.max(120, (scroll.current?.clientWidth ?? 360) - hw);
  const lane = laneClips(c.doc);
  const laneRows = Math.max(1, ...lane.map(x => x.row + 1));
  const picked = c.pick.kind === 'clip' ? c.pick.index : null;
  const pickedClip = picked !== null ? c.doc.fxClips?.[picked] ?? null : null;
  const pickedOnLane = pickedClip ? lane.some(x => x.index === picked) || c.doc.parts.every(x => !clipsOnPart(c.doc, x.id).some(y => y.index === picked)) : false;
  const firstPartWithPicked = picked !== null && !pickedOnLane ? c.doc.parts.find(x => clipsOnPart(c.doc, x.id).some(y => y.index === picked))?.id ?? null : null;
  const style = {
    '--W': `${c.total * c.ppb}px`, '--vis': `${vis}px`, '--beatw': `${c.ppb}px`,
    '--barw': `${c.clock.tempoAt(1).beats * c.ppb}px`,
  };

  return (
    <div ref={scroll} class="cmp-tl" data-timeline="" style={style}
      onScroll={() => { if (playing.current && scroll.current) handScrolled(follow.current, scroll.current.scrollLeft, performance.now()); }}
      onPointerDownCapture={placingDown} onPointerMoveCapture={placingMove} onPointerUpCapture={placingUp}
      onPointerLeave={e => { if (c.placing && e.pointerType !== 'touch') p.setDrop(null); }}>
      <div ref={inner} class="cmp-tl-in">
        <SectionsRow c={c} />
        <RulerRow c={c} />
        <div class="cmp-row cmp-lane" data-row="lane">
          <div class="cmp-head grid content-start gap-1 p-2">
            <b class="font-display text-sm">Effects</b>
            <button type="button" class="cmp-btn small" aria-expanded={c.paletteOpen} data-add-effect="" onClick={() => c.setPaletteOpen(!c.paletteOpen)}>
              <Glyph name="plus" size={16} />Add Effect
            </button>
          </div>
          <div class="cmp-cell" style={{ height: `${Math.max(48, laneRows * 34 + 8)}px` }}>
            <Extra c={c} />
            {lane.map(x => <LaneClip c={c} index={x.index} row={x.row} />)}
          </div>
        </div>
        {pickedClip && pickedOnLane ? <SettingsRow>{p.clipSettings(picked!)}</SettingsRow> : null}
        {c.doc.parts.length === 0 ? (
          <div class="cmp-row"><div class="cmp-empty" data-empty-song="">
            <h2 class="font-display text-xl font-semibold">This Song Is Empty</h2>
            <p class="text-sm text-dim">Add an instrument to get a track, then tap its grid to put notes in. Adding an instrument gives an empty track.</p>
            {p.adds}
          </div></div>
        ) : null}
        {c.doc.parts.map(part => (
          <>
            {part.vocal ? <VocalRows c={c} part={part} panel={p.vocal(part)} />
              : c.open.has(part.id) ? <OpenRows c={c} part={part} tools={p.tools(part)} drawer={p.drawer(part)} />
              : <MiniRow c={c} part={part} />}
            {firstPartWithPicked === part.id ? <SettingsRow>{p.clipSettings(picked!)}</SettingsRow> : null}
          </>
        ))}
        {c.doc.parts.length ? (
          <div class="cmp-row" data-add-row=""><div class="cmp-head p-2">{p.adds}</div><div class="cmp-cell plain" /></div>
        ) : null}
        <div ref={head} class="cmp-playhead" data-playhead="" style={{ transform: `translateX(${c.cursor * c.ppb}px)` }} />
        <div ref={dropEl} class="cmp-drop" hidden aria-hidden="true"><span /></div>
      </div>
    </div>
  );
}

/** Beats from a bar position. */
export function beatOfBar(c: Ctl, bar: number): number {
  const whole = Math.floor(bar + 1e-9);
  return c.clock.barStartBeat(whole) + (bar - whole) * c.clock.tempoAt(whole).beats;
}
/** A bar position (to 1/1000) from beats. */
export function barOfBeat(c: Ctl, beat: number): number {
  const bar = c.clock.barOfBeat(beat + 1e-9);
  return pos(bar + (beat - c.clock.barStartBeat(bar)) / c.clock.tempoAt(bar).beats);
}

/** The target under a point on the screen for `effect`: a track, the Effects row or the ruler; null elsewhere. */
export function targetAt(c: Ctl, x: number, y: number, effect: import('../../score.ts').FxClipEffect): Target | null {
  const el = typeof document !== 'undefined' ? document.elementFromPoint(x, y) : null;
  const row = el?.closest<HTMLElement>('[data-track-row],[data-row]');
  const tl = el?.closest<HTMLElement>('.cmp-tl-in');
  if (!row || !tl) return null;
  const id = row.dataset['trackRow'] ?? (row.dataset['row'] === 'lane' || row.dataset['row'] === 'ruler' ? 'lane' : null);
  if (!id) return null;
  const sc = tl.parentElement!;
  const beat = el!.closest('.cmp-head') ? sc.scrollLeft / c.ppb : (x - tl.getBoundingClientRect().left - headWidth()) / c.ppb;
  return targetFor(c.doc, effect, id, Math.max(0, beat));
}

function SettingsRow(p: { children: ComponentChildren }) {
  return <div class="cmp-row" data-clip-settings-row=""><div class="cmp-fxset">{p.children}</div></div>;
}

/** The faint bar past the end of the piece, where new notes make the song longer. */
function Extra(p: { c: Ctl }) {
  return <div class="cmp-extra" style={{ width: `${(p.c.total - p.c.end) * p.c.ppb}px` }} />;
}

/** Hold-to-drag on a finger (so a swipe still scrolls), at once with a mouse; tap otherwise. */
function holdDrag(e: PointerEvent, on: { begin(): void; move(x: number, y: number): void; end(x: number, y: number, dropped: boolean): void; tap(x: number, y: number): void }): void {
  if (e.button > 0) return;
  e.stopPropagation();
  const el = e.currentTarget as HTMLElement;
  const touch = e.pointerType === 'touch';
  const x0 = e.clientX;
  const y0 = e.clientY;
  let live = false;
  let gone = false;
  let x = x0;
  let y = y0;
  const capture = (): void => { try { el.setPointerCapture(e.pointerId); } catch { /* the pointer is already gone */ } };
  if (!touch) capture();
  const timer = touch ? setTimeout(() => { if (!gone && !live) { live = true; capture(); navigator.vibrate?.(8); on.begin(); on.move(x, y); } }, 250) : undefined;
  const noScroll = (ev: TouchEvent): void => { if (live && ev.cancelable) ev.preventDefault(); };
  el.addEventListener('touchmove', noScroll, { passive: false });
  const move = (ev: PointerEvent): void => {
    if (ev.pointerId !== e.pointerId) return;
    x = ev.clientX;
    y = ev.clientY;
    if (!live) {
      const far = Math.hypot(x - x0, y - y0);
      if (touch) { if (far > 10) { clearTimeout(timer); finish(); } return; }
      if (far < 5) return;
      live = true;
      on.begin();
    }
    on.move(x, y);
  };
  const finish = (): void => {
    gone = true;
    el.removeEventListener('pointermove', move);
    el.removeEventListener('pointerup', up);
    el.removeEventListener('pointercancel', up);
    el.removeEventListener('touchmove', noScroll);
  };
  const up = (ev: PointerEvent): void => {
    if (ev.pointerId !== e.pointerId) return;
    clearTimeout(timer);
    finish();
    if (live) on.end(ev.clientX, ev.clientY, ev.type === 'pointerup');
    else if (ev.type === 'pointerup') on.tap(ev.clientX, ev.clientY);
  };
  el.addEventListener('pointermove', move);
  el.addEventListener('pointerup', up);
  el.addEventListener('pointercancel', up);
}

/** A small label that follows the pointer while something is dragged. */
function ghost(color: string, name: string): { el: HTMLElement; at(x: number, y: number, touch: boolean): void; say(t: string, ok: boolean): void } {
  const el = document.createElement('div');
  el.className = 'cmp-ghost';
  el.style.setProperty('--c', color);
  el.innerHTML = '<b></b><small></small>';
  el.firstElementChild!.textContent = name;
  document.body.append(el);
  return {
    el,
    at(x, y, touch) { const w = el.offsetWidth; el.style.transform = `translate(${Math.max(4, Math.min(window.innerWidth - w - 4, touch ? x - w / 2 : x + 14))}px,${Math.max(4, touch ? y - el.offsetHeight - 36 : y + 16)}px)`; },
    say(t, ok) { el.lastElementChild!.textContent = t; el.style.opacity = ok ? '1' : '.8'; },
  };
}

function SectionsRow(p: { c: Ctl }) {
  const { c } = p;
  const secs = sectionsOf(c.doc);
  const pickedId = c.pick.kind === 'section' ? c.pick.id : null;
  return (
    <div class="cmp-row cmp-sections" data-row="sections">
      <div class="cmp-head flex items-center justify-between gap-1 px-2">
        <b class="font-display text-sm">Sections</b>
        <button type="button" class="cmp-icon" aria-label="Add Section" title="Add a section" data-pop-anchor="" onClick={e => c.openPop('section-add', e.currentTarget as HTMLElement)}>
          <Glyph name="plus" />
        </button>
      </div>
      <div class="cmp-cell">
        <Extra c={c} />
        {secs.map(s => {
          const from = c.clock.barStartBeat(s.from);
          const to = c.clock.barStartBeat(s.to + 1);
          return (
            <div role="button" tabindex={0} class="cmp-sec" data-section={s.id} aria-pressed={pickedId === s.id}
              aria-label={`${s.name}, bar ${s.from} to bar ${s.to}`} style={{ '--c': sectionColor(s.name), left: `${from * c.ppb + 1}px`, width: `${Math.max(8, (to - from) * c.ppb - 2)}px` }}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); c.setPick(pickedId === s.id ? { kind: 'none' } : { kind: 'section', id: s.id }); } }}
              onPointerDown={e => {
                const el = e.currentTarget as HTMLElement;
                const cell = el.parentElement!;
                let g: ReturnType<typeof ghost> | null = null;
                let line: HTMLElement | null = null;
                let at: number | null = null;
                holdDrag(e, {
                  begin() { el.classList.add('lifting'); g = ghost(sectionColor(s.name), s.name); line = document.createElement('div'); line.className = 'cmp-insert'; cell.append(line); },
                  move(x, y) {
                    const beat = (x - cell.getBoundingClientRect().left) / c.ppb;
                    let best: { bar: number; d: number } | null = null;
                    for (const b of [...secs.map(q => q.from), c.bars + 1]) {
                      if (b >= s.from && b <= s.to + 1) continue;
                      const d = Math.abs(c.clock.barStartBeat(b) - beat);
                      if (!best || d < best.d) best = { bar: b, d };
                    }
                    at = best ? best.bar : null;
                    if (line) { line.style.display = at === null ? 'none' : ''; if (at !== null) line.style.left = `${c.clock.barStartBeat(at) * c.ppb}px`; }
                    const before = at === null ? null : secs.find(q => q.from === at);
                    g!.say(at === null ? 'Drop it before or after another section' : before ? `Moves before ${before.name}` : 'Moves to the end', at !== null);
                    g!.at(x, y, e.pointerType === 'touch');
                  },
                  end(_x, _y, dropped) {
                    el.classList.remove('lifting');
                    g?.el.remove();
                    line?.remove();
                    if (dropped && at !== null) { c.apply(moveSection(c.doc, s.id, at), `Moved ${s.name} with its music.`); c.setPick({ kind: 'section', id: s.id }); }
                  },
                  tap() { c.setPick(pickedId === s.id ? { kind: 'none' } : { kind: 'section', id: s.id }); },
                });
              }}>
              {s.name}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RulerRow(p: { c: Ctl }) {
  const { c } = p;
  const bars: { bar: number; x: number }[] = [];
  for (let b = 1; b <= c.bars + 1; b++) bars.push({ bar: b, x: c.clock.barStartBeat(b) * c.ppb });
  const down = (e: PointerEvent): void => {
    if (e.button > 0 || (e.target as HTMLElement).closest('button')) return;
    const cell = e.currentTarget as HTMLElement;
    const left = cell.getBoundingClientRect().left;
    const beatAt = (x: number): number => Math.max(0, Math.min(c.end, (x - left) / c.ppb));
    const x0 = e.clientX;
    const touch = e.pointerType === 'touch';
    let live = false;
    let range: { from: number; to: number } | null = null;
    if (!touch) cell.setPointerCapture?.(e.pointerId);
    const move = (ev: PointerEvent): void => {
      if (!live && Math.abs(ev.clientX - x0) < 8) return;
      if (touch) { finish(); return; }
      live = true;
      const a = c.clock.barOfBeat(Math.min(beatAt(x0), beatAt(ev.clientX)));
      const z = Math.max(a + 1, c.clock.barOfBeat(Math.max(beatAt(x0), beatAt(ev.clientX)) - 1e-6) + 1);
      range = { from: c.clock.barStartBeat(a), to: Math.min(c.end, c.clock.barStartBeat(z)) };
      c.setLoop(range);
    };
    const finish = (): void => { cell.removeEventListener('pointermove', move); cell.removeEventListener('pointerup', up); cell.removeEventListener('pointercancel', finish); };
    const up = (ev: PointerEvent): void => {
      finish();
      if (live && range) { c.say(`Looping ${barWords(c.clock, range.from)} to ${barWords(c.clock, range.to)}.`); return; }
      const beat = Math.floor(beatAt(ev.clientX) + 1e-9);
      c.setCursor(Math.min(beat, Math.max(0, c.end - 1)));
      if (c.playing) c.playFrom(beat);
    };
    cell.addEventListener('pointermove', move);
    cell.addEventListener('pointerup', up);
    cell.addEventListener('pointercancel', finish);
  };
  return (
    <div class="cmp-row cmp-ruler" data-row="ruler">
      <div class="cmp-head flex items-center px-2" title="Tap a bar to start there; drag along bars to loop them"><span class="cmp-label">Bar<span class="hidden sm:inline"> · tap to start, drag to loop</span></span></div>
      <div class="cmp-cell" onPointerDown={down} data-ruler="">
        <Extra c={c} />
        {bars.map(b => <span class="cmp-barnum" style={{ left: `${b.x}px` }}>{b.bar}</span>)}
        {tempoChanges(c.doc).map(t => <span class="cmp-tempo-mark" data-tempo-mark={t.bar} style={{ left: `${c.clock.barStartBeat(t.bar) * c.ppb + 2}px` }} title={`From bar ${t.bar}: ${t.bpm} BPM`}>{`♩ ${t.bpm}`}</span>)}
        {c.loop ? (
          <div class={cx('cmp-loopband', !c.loopOn && 'off')} data-loop-band="" style={{ left: `${c.loop.from * c.ppb}px`, width: `${(c.loop.to - c.loop.from) * c.ppb}px` }}>
            <button type="button" aria-label="Clear The Loop Range" title="Clear the loop range" onClick={() => c.setLoop(null)}><Glyph name="close" size={14} /></button>
          </div>
        ) : null}
        {(c.doc.markers ?? []).map(m => (
          <button type="button" class="cmp-marker" data-marker={m.name} style={{ left: `${m.beat * c.ppb}px` }} aria-label={`Jump To ${m.name}`} title={`Jump to ${m.name}`}
            onClick={() => { c.setCursor(m.beat); if (c.playing) c.playFrom(m.beat); }}>
            <Glyph name="flag" size={14} />{m.name}
          </button>
        ))}
        <div class="cmp-cursor" style={{ left: `${c.cursor * c.ppb}px` }} />
      </div>
    </div>
  );
}

/** Drag an effect block to move it, its ends to resize it, snapped to beats; a tap picks it. */
function clipPointer(c: Ctl, index: number, e: PointerEvent): void {
  const clip = c.doc.fxClips?.[index];
  if (!clip || c.placing) return;
  const edge = (e.target as HTMLElement).closest<HTMLElement>('.edge');
  const mode = edge?.classList.contains('l') ? 'l' : edge?.classList.contains('r') ? 'r' : 'move';
  const els = () => [...document.querySelectorAll<HTMLElement>(`[data-fx="${index}"]`)];
  const from = beatOfBar(c, clip.from_bar);
  const to = beatOfBar(c, clip.to_bar);
  let nf = from;
  let nt = to;
  e.stopPropagation();
  holdDrag(e, {
    begin() {},
    move(x) {
      const ds = Math.round((x - e.clientX) / c.ppb);
      if (mode === 'move') { nf = Math.max(0, Math.min(c.end - (to - from), from + ds)); nt = nf + (to - from); }
      if (mode === 'l') nf = Math.max(0, Math.min(to - 0.25, from + ds));
      if (mode === 'r') nt = Math.min(c.end, Math.max(from + 0.25, to + ds));
      for (const el of els()) { el.style.left = `${nf * c.ppb}px`; el.style.width = `${(nt - nf) * c.ppb}px`; }
    },
    end(_x, _y, dropped) {
      if (!dropped) { for (const el of els()) { el.style.left = `${from * c.ppb}px`; el.style.width = `${(to - from) * c.ppb}px`; } return; }
      let next = c.doc;
      if (mode === 'move') next = moveClip(next, index, barOfBeat(c, nf));
      else {
        if (mode === 'l') {
          next = moveClip(next, index, barOfBeat(c, nf));
          next = resizeClip(next, index, barOfBeat(c, to));
        } else next = resizeClip(next, index, barOfBeat(c, nt));
      }
      c.apply(next);
      c.setPick({ kind: 'clip', index });
    },
    tap() { c.setPick(c.pick.kind === 'clip' && c.pick.index === index ? { kind: 'none' } : { kind: 'clip', index }); },
  });
}

function LaneClip(p: { c: Ctl; index: number; row: number }) {
  const { c, index } = p;
  const clip = c.doc.fxClips![index]!;
  const from = beatOfBar(c, clip.from_bar);
  const to = beatOfBar(c, clip.to_bar);
  const info = fxInfo(clip.effect);
  const label = clip.effect === 'riser' ? `${info.name} → bar ${pos(clip.to_bar)}` : `${info.name} · ${barWords(c.clock, from)}`;
  return (
    <div role="button" tabindex={0} class={cx('cmp-clip', c.flash === index && 'cmp-placed')} data-fx={String(index)} data-clip-effect={clip.effect}
      aria-pressed={c.pick.kind === 'clip' && c.pick.index === index} aria-label={`${info.name}, ${barWords(c.clock, from)} to ${barWords(c.clock, to)}`}
      style={{ '--c': FX_COLOR(clip.effect), left: `${from * c.ppb}px`, width: `${Math.max(10, (to - from) * c.ppb)}px`, top: `${6 + p.row * 34}px` }}
      onPointerDown={e => clipPointer(c, index, e)}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); c.setPick({ kind: 'clip', index }); } }}>
      <Glyph name={fxGlyph(clip.effect)} size={14} /><span class="truncate">{label}</span>
      <i class="edge l" aria-hidden="true" /><i class="edge r" aria-hidden="true" />
    </div>
  );
}

/** The effects that change this track, drawn over its row: ramps for fades and sweeps, blocks for the rest. */
function AutoEls(p: { c: Ctl; part: Part }) {
  const { c, part } = p;
  return (
    <>
      {clipsOnPart(c.doc, part.id).map(({ index, clip, shape }) => {
        const from = beatOfBar(c, clip.from_bar);
        const to = beatOfBar(c, clip.to_bar);
        const info = fxInfo(clip.effect);
        const words = clip.effect === 'crossfader' ? (shape === 'down' ? 'Fades Out' : 'Fades In') : shape === 'up' ? `${info.name}: Opens Up` : shape === 'down' ? `${info.name}: Closes Down` : info.name;
        const name = clip.effect === 'crossfader' ? `Crossfade: ${words}` : clip.lane === null ? `${words} · Whole Song` : words;
        return (
          <div class={cx('cmp-auto', c.flash === index && 'cmp-placed')} data-fx={String(index)} data-auto={clip.effect} data-shape={shape}
            aria-pressed={c.pick.kind === 'clip' && c.pick.index === index} style={{ '--c': FX_COLOR(clip.effect), left: `${from * c.ppb}px`, width: `${Math.max(10, (to - from) * c.ppb)}px` }}>
            <span class="fill" />
            {shape !== 'block' ? (
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                <line {...(shape === 'down' ? { x1: 0, y1: 6, x2: 100, y2: 96 } : { x1: 0, y1: 96, x2: 100, y2: 6 })} />
              </svg>
            ) : null}
            <span role="button" tabindex={0} class="cmp-tab" aria-label={`${name}, ${part.name}, ${barWords(c.clock, from)} to ${barWords(c.clock, to)}`}
              onPointerDown={e => clipPointer(c, index, e)}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); c.setPick({ kind: 'clip', index }); } }}>
              <Glyph name={fxGlyph(clip.effect)} size={12} />{name}
            </span>
            <i class="edge l" aria-hidden="true" onPointerDown={e => clipPointer(c, index, e)} /><i class="edge r" aria-hidden="true" onPointerDown={e => clipPointer(c, index, e)} />
          </div>
        );
      })}
    </>
  );
}

/** A region block: on a closed track's row and on an open track's regions strip. Drag it along its track or onto
 *  another track of the same kind; drag its corner to repeat it; tap it to pick it (or to split it there). */
function RegionBlock(p: { c: Ctl; part: Part; r: Region; strip?: boolean }) {
  const { c, part, r } = p;
  const on = c.pick.kind === 'region' && c.pick.part === part.id && c.pick.id === r.id;
  const reps = r.loop ? Math.ceil(r.length / r.loop - 1e-9) - 1 : 0;
  const down = (e: PointerEvent): void => {
    if (c.placing) return;
    const handle = (e.target as HTMLElement).closest('.loop');
    const el = e.currentTarget as HTMLElement;
    const tl = el.closest<HTMLElement>('.cmp-tl-in')!;
    const left = () => tl.getBoundingClientRect().left + headWidth();
    let g: ReturnType<typeof ghost> | null = null;
    let target: { part: string; at: number } | null = null;
    let to = r.start + r.length;
    holdDrag(e, {
      begin() {
        if (handle) return;
        el.style.opacity = '.45';
        g = ghost(part.color, 'Region');
      },
      move(x, y) {
        if (handle) {
          const base = r.loop ?? r.length;
          to = Math.max(r.start + base, Math.round((x - left()) / c.ppb));
          el.style.width = `${(to - r.start) * c.ppb}px`;
          return;
        }
        const at = Math.max(0, r.start + Math.round((x - e.clientX) / c.ppb));
        const rowEl = document.elementFromPoint(x, y)?.closest<HTMLElement>('[data-track-row]');
        const over = rowEl ? c.doc.parts.find(q => q.id === rowEl.dataset['trackRow']) : undefined;
        const ok = !!over && !over.vocal && c.drums(over) === c.drums(part);
        target = { part: ok ? over!.id : part.id, at };
        g!.say(over && !ok ? `Only onto a ${c.drums(part) ? 'drum' : 'note'} track · stays on ${part.name}` : `${(ok ? over! : part).name} · ${barWords(c.clock, at)}`, !over || ok);
        g!.at(x, y, e.pointerType === 'touch');
      },
      end(_x, _y, dropped) {
        el.style.opacity = '';
        g?.el.remove();
        if (handle) {
          if (dropped && to !== r.start + r.length) { c.apply(loopRegion(c.doc, part.id, r.id, to), to > r.start + (r.loop ?? r.length) ? 'The region repeats.' : undefined); }
          el.style.width = `${r.length * c.ppb}px`;
          return;
        }
        if (dropped && target && (target.part !== part.id || target.at !== r.start)) {
          c.apply(moveRegion(c.doc, part.id, r.id, target.part, target.at));
          c.setPick({ kind: 'region', part: target.part, id: r.id });
        }
      },
      tap(x) {
        if (c.splitting) {
          const at = Math.round((x - left()) / c.ppb);
          const made = splitRegion(c.doc, part.id, r.id, at);
          if (made) { c.apply(made.doc); c.setPick({ kind: 'region', part: part.id, id: made.id }); }
          c.setSplitting(false);
          return;
        }
        c.setPick(on ? { kind: 'none' } : { kind: 'region', part: part.id, id: r.id });
      },
    });
  };
  return (
    <div role="button" tabindex={0} class="cmp-rg" data-region={r.id} data-region-part={part.id} aria-pressed={on}
      aria-label={`Region on ${part.name}, ${barWords(c.clock, r.start)} to ${barWords(c.clock, r.start + r.length)}${r.loop ? ', repeats' : ''}`}
      style={{ '--c': part.color, left: `${r.start * c.ppb}px`, width: `${r.length * c.ppb}px` }}
      onPointerDown={down} onClick={e => e.stopPropagation()}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); c.setPick(on ? { kind: 'none' } : { kind: 'region', part: part.id, id: r.id }); } }}>
      {Array.from({ length: reps }, (_, k) => <i class="rep" style={{ left: `${(k + 1) * r.loop! * c.ppb}px` }} />)}
      {p.strip ? <span class="rname">{r.loop ? `${part.name} · repeats` : part.name}</span> : null}
      <i class="loop" title="Drag to repeat this region" aria-hidden="true"><Glyph name="loop" size={14} /></i>
    </div>
  );
}

function MiniRow(p: { c: Ctl; part: Part }) {
  const { c, part } = p;
  const entry = c.entryOf(part);
  const drums = c.drums(part);
  const all = heardNotes(part);
  const ps = part.notes.map(n => n.pitch);
  const lo = Math.min(...ps, 60) - 1;
  const hi = Math.max(...ps, lo + 12) + 1;
  const pieces = entry?.pieces ?? [];
  return (
    <div class={cx('cmp-row cmp-track cmp-mini', isMuted(part, c.doc) && 'muted')} data-track-row={part.id}>
      <div class="cmp-head"><TrackHead c={c} part={part} /></div>
      <div class="cmp-cell" style={{ '--c': part.color }} onClick={e => { if (!c.placing && !(e.target as HTMLElement).closest('.cmp-rg,.cmp-auto')) c.toggleOpen(part.id, true); }}>
        <Extra c={c} />
        {(part.regions ?? []).map(r => <RegionBlock c={c} part={part} r={r} />)}
        <div class="cmp-notes">
          {all.map(n => {
            const ghostNote = 'ghost' in n && n.ghost;
            if (drums) {
              const i = Math.max(0, pieces.findIndex(([q]) => q === n.pitch));
              return <i class={cx('cmp-hit', ghostNote && 'ghost')} style={{ left: `${n.start * c.ppb}px`, top: `${8 + (i / Math.max(1, pieces.length - 1)) * 70}%` }} />;
            }
            return <i class={cx('cmp-n', ghostNote && 'ghost')} style={{ left: `${n.start * c.ppb}px`, width: `${Math.max(3, n.length * c.ppb - 1)}px`, top: `${10 + ((hi - n.pitch) / (hi - lo)) * 75}%` }} />;
          })}
        </div>
        <AutoEls c={c} part={part} />
      </div>
    </div>
  );
}

function OpenRows(p: { c: Ctl; part: Part; tools: ComponentChildren; drawer: ComponentChildren }) {
  const { c, part } = p;
  const entry = c.entryOf(part);
  const muted = isMuted(part, c.doc) ? 'muted' : '';
  if (!entry) return null;
  return (
    <>
      <div class={cx('cmp-row cmp-track', muted)} data-track-row={part.id} data-open="">
        <div class="cmp-head"><TrackHead c={c} part={part} /></div>
        <div class="cmp-cell plain">{p.tools}</div>
      </div>
      {p.drawer ? <div class={cx('cmp-row cmp-track', muted)} data-track-row={part.id}><div class="cmp-fxset" style={{ left: 0, width: `calc(var(--head) + var(--vis))` }}>{p.drawer}</div></div> : null}
      <div class={cx('cmp-row cmp-track cmp-regions', muted)} data-track-row={part.id}>
        <div class="cmp-head flex items-center px-2"><span class="cmp-label">Regions</span></div>
        <div class="cmp-cell"><Extra c={c} />{(part.regions ?? []).map(r => <RegionBlock c={c} part={part} r={r} strip />)}</div>
      </div>
      <div class={cx('cmp-row cmp-track', muted)} data-track-row={part.id}>
        <div class="cmp-head">{entry.pieces ? <DrumKeys c={c} part={part} entry={entry} /> : <RollKeys c={c} part={part} entry={entry} />}</div>
        <div class="cmp-cell"><Extra c={c} /><NoteGrid c={c} part={part} entry={entry} /><AutoEls c={c} part={part} /></div>
      </div>
    </>
  );
}

function VocalRows(p: { c: Ctl; part: Part; panel: ComponentChildren }) {
  const { c, part } = p;
  const open = c.open.has(part.id);
  return (
    <>
      <div class={cx('cmp-row cmp-track cmp-mini', isMuted(part, c.doc) && 'muted')} data-track-row={part.id}>
        <div class="cmp-head"><TrackHead c={c} part={part} /></div>
        <div class="cmp-cell" style={{ '--c': part.color }} onClick={() => { if (!c.placing) c.toggleOpen(part.id, true); }}>
          <Extra c={c} />
          {(part.vocal?.clips ?? []).map(k => {
            const from = c.clock.beat(k.at);
            const to = c.clock.beat(k.at + k.to - k.from);
            return <div class="cmp-rg" data-vocal-clip="" style={{ left: `${from * c.ppb}px`, width: `${Math.max(6, (to - from) * c.ppb)}px` }}><span class="rname">{part.name}</span></div>;
          })}
          <AutoEls c={c} part={part} />
        </div>
      </div>
      {open ? <div class="cmp-row" data-track-row={part.id}><div class="cmp-fxset" style={{ left: 0, width: `calc(var(--head) + var(--vis))` }}>{p.panel}</div></div> : null}
    </>
  );
}
