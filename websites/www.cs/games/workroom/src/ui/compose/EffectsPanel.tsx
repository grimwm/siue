// DJ & Effects, Way One, Place On The Timeline: pick an effect from its family, then tap a bar on The Whole Piece or a
// part (or drag the effect onto the bars); drag a clip to move it and its right edge to lengthen it; tap a clip for its
// sheet (its bars, Hear From Here, Earlier, Later, Shorter, Longer, Remove, where it plays and its setting). From the
// keyboard, Place At Bar and Enter on a row place the armed effect. What Gets Saved shows the
// clips in the score's shape, and What A Browser Does Less Well stays in view. Each change is one Undo step; the DJ
// Mode panel beside it lands a live performance here too.
import { useRef, useState } from 'preact/hooks';
import type { EditDoc } from '../../compose/doc.ts';
import { barsNeeded } from '../../compose/doc.ts';
import { BROWSER_LIMITS, EFFECTS, FAMILIES, fxInfo } from '../../compose/djcatalogue.ts';
import type { Family } from '../../compose/djcatalogue.ts';
import { canPlace, clipsOf, moveClip, placeClip, pos, removeClip, resizeClip, setClipLane, setClipSetting, stepClip } from '../../compose/djclips.ts';
import { settingsOf } from '../../render/djfx.ts';
import { WHOLE_PIECE_EFFECTS } from '../../score.ts';
import type { FxClip, FxClipEffect } from '../../score.ts';
import { Button } from '../console/Button.tsx';
import { Panel } from '../console/Panel.tsx';
import { cx } from '../console/cx.ts';

export interface EffectsPanelProps {
  doc: EditDoc;
  help: boolean;
  apply(next: EditDoc): void;
  /** Plays the piece from a bar position. */
  hearFrom(bar: number): void;
  status(text: string): void;
}

/** A tap on the timeline lands on the nearest quarter of a bar before it. */
const SNAP = 4;
const snap = (bar: number): number => pos(Math.floor(bar * SNAP) / SNAP);
const barWords = (b: number): string => (Number.isInteger(b) ? `bar ${b}` : `bar ${Math.floor(b)} + ${pos(b - Math.floor(b))}`);

export function EffectsPanel(p: EffectsPanelProps) {
  const [family, setFamily] = useState<Family>('turntable');
  const [armed, setArmed] = useState<FxClipEffect | null>(null);
  const [picked, setPicked] = useState<number | null>(null);
  /** Where Enter or Space on a track places the armed effect (the keyboard's way to tap a bar). */
  const [placeAt, setPlaceAt] = useState(1);
  const drag = useRef<{ i: number; kind: 'move' | 'end'; x0: number; bar0: number; moved: boolean; width: number } | null>(null);
  const [ghost, setGhostState] = useState<{ i: number; from: number; to: number } | null>(null);
  // The latest drag position, read when the pointer lifts (before the last move has drawn).
  const ghostNow = useRef<{ i: number; from: number; to: number } | null>(null);
  const setGhost = (g: { i: number; from: number; to: number } | null) => { ghostNow.current = g; setGhostState(g); };
  const bars = barsNeeded(p.doc);
  const clips = clipsOf(p.doc);
  const rows: { id: string | null; name: string }[] = [{ id: null, name: 'The Whole Piece' }, ...p.doc.parts.map(x => ({ id: x.id, name: x.name }))];
  const pct = (bar: number) => `${((bar - 1) / bars) * 100}%`;
  const barAt = (e: PointerEvent | MouseEvent, el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    return 1 + Math.min(1, Math.max(0, (e.clientX - r.left) / Math.max(1, r.width))) * bars;
  };

  const place = (effect: FxClipEffect, lane: string | null, bar: number) => {
    const onLane = WHOLE_PIECE_EFFECTS.includes(effect) ? null : lane;
    if (!canPlace(p.doc, effect, onLane)) {
      p.status(effect === 'vocoder' ? 'A vocoder goes on a part, and needs another part to sing through.' : 'The Crossfader needs at least two parts.');
      return;
    }
    const next = placeClip(p.doc, effect, onLane, snap(bar));
    p.apply(next);
    setPicked(clipsOf(next).length - 1);
    p.status(`${fxInfo(effect).name} placed from ${barWords(snap(bar))}${onLane === null ? ' on the whole piece' : ''}.`);
  };

  const down = (e: PointerEvent, i: number, kind: 'move' | 'end') => {
    e.stopPropagation();
    const track = (e.currentTarget as HTMLElement).closest('[data-track]') as HTMLElement;
    drag.current = { i, kind, x0: e.clientX, bar0: kind === 'move' ? clips[i]!.from_bar : clips[i]!.to_bar, moved: false, width: track.getBoundingClientRect().width };
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const move = (e: PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const by = ((e.clientX - d.x0) / Math.max(1, d.width)) * bars;
    if (Math.abs(e.clientX - d.x0) > 4) d.moved = true;
    if (!d.moved) return;
    const c = clips[d.i]!;
    const len = c.to_bar - c.from_bar;
    if (d.kind === 'move') { const from = Math.max(1, snap(d.bar0 + by + 1 / (2 * SNAP))); setGhost({ i: d.i, from, to: from + len }); }
    else setGhost({ i: d.i, from: c.from_bar, to: Math.max(c.from_bar + 1 / SNAP, snap(d.bar0 + by + 1 / (2 * SNAP))) });
  };
  const up = (i: number) => {
    const d = drag.current;
    drag.current = null;
    const g = ghostNow.current;
    if (d?.moved && g) p.apply(d.kind === 'move' ? moveClip(p.doc, i, g.from) : resizeClip(p.doc, i, g.to));
    else setPicked(picked === i ? null : i);
    setGhost(null);
  };

  const sel = picked !== null ? clips[picked] ?? null : null;
  const visible = EFFECTS.filter(x => x.family === family);

  return (
    <Panel title="DJ & Effects · Place On The Timeline" data={{ 'data-effects': '' }}>
      <div class="grid gap-3">
        <div role="tablist" aria-label="Effect Families" class="flex flex-wrap gap-1">
          {FAMILIES.map(f => (
            <button type="button" role="tab" aria-selected={f.id === family} data-family={f.id} onClick={() => setFamily(f.id)}
              class={cx('min-h-11 rounded-md border px-3 font-display text-xs font-semibold tracking-wide uppercase', f.id === family ? 'border-amber bg-lane' : 'border-rule bg-panel')}>{f.name}</button>
          ))}
        </div>
        <p class="text-sm text-dim">{FAMILIES.find(f => f.id === family)!.blurb}</p>
        <div class="flex flex-wrap gap-2">
          {visible.map(x => (
            <button type="button" draggable data-effect={x.id} aria-pressed={armed === x.id} title={x.does}
              onClick={() => setArmed(armed === x.id ? null : x.id)}
              onDragStart={e => { e.dataTransfer?.setData('text/plain', x.id); setArmed(x.id); }}
              class={cx('min-h-11 rounded-md border px-3 text-sm', armed === x.id ? 'border-amber bg-amber text-on-accent' : 'border-rule bg-well hover:border-dim')}>{x.name}</button>
          ))}
        </div>
        <p data-armed="" class="min-h-5 text-sm">{armed ? `${fxInfo(armed).name}: ${fxInfo(armed).does} Tap a bar to place it.` : 'Pick an effect, then tap a bar.'}</p>
        <label class="flex flex-wrap items-center gap-2 text-sm">Place At Bar
          <input type="number" min={1} max={bars} step={0.25} value={placeAt} data-place-at="" class="min-h-11 w-24 rounded-md border border-rule bg-well px-2 text-ink"
            onChange={e => setPlaceAt(Math.min(bars, Math.max(1, Number((e.target as HTMLInputElement).value) || 1)))} />
          <span class="text-dim">then press Enter on a row to place it there.</span>
        </label>

        <div class="overflow-x-auto">
          <div class="grid min-w-[36rem] gap-1" data-timeline="">
            <div class="relative ml-36 h-5 font-mono text-[0.65rem] text-dim">
              {Array.from({ length: bars }, (_, k) => <span class="absolute" style={{ left: pct(k + 1) }}>{k + 1}</span>)}
            </div>
            {rows.map(row => (
              <div class="flex items-stretch gap-1">
                <span class="w-35 shrink-0 truncate py-2 text-xs">{row.name}</span>
                <div data-track={row.id ?? 'whole'} role="button" tabindex={0} aria-label={`${row.name} timeline`}
                  class="relative h-11 flex-1 rounded-md border border-rule bg-well"
                  style={{ backgroundImage: `repeating-linear-gradient(to right, transparent 0, transparent calc(${100 / bars}% - 1px), var(--color-rule) calc(${100 / bars}% - 1px), var(--color-rule) ${100 / bars}%)` }}
                  onClick={e => { if (armed) place(armed, row.id, barAt(e, e.currentTarget as HTMLElement)); }}
                  onKeyDown={e => { if ((e.key === 'Enter' || e.key === ' ') && e.target === e.currentTarget) { e.preventDefault(); if (armed) place(armed, row.id, placeAt); else p.status('Pick an effect first.'); } }}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => { e.preventDefault(); const id = e.dataTransfer?.getData('text/plain') as FxClipEffect; if (id && EFFECTS.some(x => x.id === id)) place(id, row.id, barAt(e, e.currentTarget as HTMLElement)); }}>
                  {clips.map((c, i) => {
                    if (c.lane !== row.id) return null;
                    const g = ghost?.i === i ? ghost : null;
                    const from = g ? g.from : c.from_bar;
                    const to = g ? g.to : c.to_bar;
                    return (
                      <div data-clip={String(i)} data-clip-effect={c.effect} role="button" tabindex={0} aria-pressed={picked === i}
                        aria-label={`${fxInfo(c.effect).name}, ${barWords(c.from_bar)} to ${barWords(c.to_bar)}`}
                        class={cx('absolute top-1 bottom-1 flex touch-none items-center overflow-hidden rounded border px-1 text-[0.65rem] font-semibold',
                          picked === i ? 'border-ink bg-amber text-on-accent' : 'border-amber bg-lane text-ink')}
                        style={{ left: pct(from), width: `calc(${pct(to)} - ${pct(from)})` }}
                        onClick={e => e.stopPropagation()}
                        onPointerDown={e => down(e, i, 'move')} onPointerMove={move} onPointerUp={() => up(i)}
                        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setPicked(picked === i ? null : i); } }}>
                        <span class="truncate">{fxInfo(c.effect).name}</span>
                        <span data-clip-end="" class="absolute top-0 right-0 bottom-0 w-3 cursor-ew-resize bg-amber/60" aria-hidden="true"
                          onPointerDown={e => down(e, i, 'end')} onPointerMove={move} onPointerUp={e => { e.stopPropagation(); up(i); }} />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {sel && picked !== null ? <ClipSheet clip={sel} i={picked} p={p} bars={bars} onDone={() => setPicked(null)} /> : <p class="text-sm text-dim">Tap a clip to see its bars, hear it, change it or remove it.</p>}

        <details data-what-saved="">
          <summary class="cursor-pointer font-display text-sm font-semibold tracking-wide uppercase">What Gets Saved</summary>
          <p class="mt-1 text-sm text-dim">The score stores each clip as numbers, never audio: its effect, where it plays (null is the whole piece), its bars and its settings. The page rebuilds the sound every time it plays.</p>
          <pre data-saved-json="" class="mt-2 max-h-64 overflow-auto rounded-md bg-well p-2 font-mono text-xs">{JSON.stringify(clips, null, 1) || '[]'}</pre>
        </details>
        <div data-browser-limits="" class="rounded-md border border-rule p-3">
          <h3 class="font-display text-sm font-semibold tracking-wide uppercase">What A Browser Does Less Well</h3>
          <ul class="mt-1 list-disc pl-5 text-sm text-dim">{BROWSER_LIMITS.map(t => <li>{t}</li>)}</ul>
        </div>
        {p.help ? <p class="border-l-2 border-amber pl-2 text-sm text-dim">Effects play on top of each part's Sound settings. A clip on The Whole Piece plays on the finished mix. Drag a clip to move it, its right edge to make it longer; Undo takes back each change.</p> : null}
      </div>
    </Panel>
  );
}

/** Beats in the bar holding a bar position. */
function beatsAt(doc: EditDoc, bar: number): number {
  let beats = doc.tempo[0]?.beats ?? 4;
  for (const t of doc.tempo) if (t.bar <= bar) beats = t.beats;
  return beats;
}

function ClipSheet(q: { clip: FxClip; i: number; p: EffectsPanelProps; bars: number; onDone(): void }) {
  const { clip, i, p } = q;
  const x = fxInfo(clip.effect);
  const s = settingsOf(clip);
  const ctl = x.control;
  const others = p.doc.parts;
  return (
    <div data-clip-sheet="" class="grid gap-2 rounded-md border border-amber p-3">
      <p class="font-semibold">{x.name} <span class="font-mono text-xs text-dim" data-clip-bars="">{barWords(clip.from_bar)} to {barWords(clip.to_bar)}</span></p>
      <p class="text-sm text-dim">{x.does}</p>
      <div class="flex flex-wrap gap-2">
        <Button onClick={() => p.hearFrom(clip.from_bar)}>Hear From Here</Button>
        <Button onClick={() => p.apply(moveClip(p.doc, i, clip.from_bar - 1 / beatsAt(p.doc, clip.from_bar)))}>Earlier</Button>
        <Button onClick={() => p.apply(moveClip(p.doc, i, clip.from_bar + 1 / beatsAt(p.doc, clip.from_bar)))}>Later</Button>
        <Button onClick={() => p.apply(stepClip(p.doc, i, -1))}>Shorter</Button>
        <Button onClick={() => p.apply(stepClip(p.doc, i, 1))}>Longer</Button>
        <Button variant="ghost" onClick={() => { p.apply(removeClip(p.doc, i)); q.onDone(); }}>Remove</Button>
      </div>
      {!WHOLE_PIECE_EFFECTS.includes(clip.effect) ? (
        <label class="flex flex-wrap items-center gap-2 text-sm">Plays On
          <select data-clip-lane="" class="min-h-11 rounded-md border border-rule bg-well px-2 text-ink"
            onChange={e => { const v = (e.target as HTMLSelectElement).value; p.apply(setClipLane(p.doc, i, v === '' ? null : v)); }}>
            {clip.effect !== 'vocoder' ? <option value="" selected={clip.lane === null}>The Whole Piece</option> : null}
            {others.map(o => <option value={o.id} selected={o.id === clip.lane}>{o.name}</option>)}
          </select></label>
      ) : null}
      {clip.effect === 'vocoder' ? (
        <label class="flex flex-wrap items-center gap-2 text-sm">Sings Through
          <select data-clip-carrier="" class="min-h-11 rounded-md border border-rule bg-well px-2 text-ink" onChange={e => p.apply(setClipSetting(p.doc, i, 'carrier', (e.target as HTMLSelectElement).value))}>
            {others.filter(o => o.id !== clip.lane).map(o => <option value={o.id} selected={o.id === s['carrier']}>{o.name}</option>)}
          </select></label>
      ) : null}
      {clip.effect === 'crossfader' ? (
        <div class="grid gap-1 text-sm">
          {others.map(o => {
            const side = (s['a'] as string[]).includes(o.id) ? 'a' : (s['b'] as string[]).includes(o.id) ? 'b' : 'none';
            const set = (to: 'a' | 'b' | 'none') => {
              const a = (s['a'] as string[]).filter(z => z !== o.id);
              const b = (s['b'] as string[]).filter(z => z !== o.id);
              if (to === 'a') a.push(o.id);
              if (to === 'b') b.push(o.id);
              p.apply(setClipSetting(setClipSetting(p.doc, i, 'a', a), i, 'b', b));
            };
            return (
              <div class="flex flex-wrap items-center gap-2"><span class="w-32 truncate">{o.name}</span>
                <Button pressed={side === 'a'} onClick={() => set('a')}>Side A</Button>
                <Button pressed={side === 'b'} onClick={() => set('b')}>Side B</Button>
                <Button pressed={side === 'none'} onClick={() => set('none')}>Neither</Button></div>
            );
          })}
        </div>
      ) : null}
      {clip.effect === 'looper' ? (
        <div class="flex flex-wrap items-center gap-2 text-sm">Loops
          {Array.from({ length: q.bars }, (_, k) => k + 1).map(b => {
            const on = (s['bars'] as number[]).includes(b);
            const list = s['bars'] as number[];
            return <Button pressed={on} onClick={() => p.apply(setClipSetting(p.doc, i, 'bars', on ? (list.length > 1 ? list.filter(z => z !== b) : list) : list.length < 4 ? [...list, b].sort((m, n) => m - n) : list))}>Bar {b}</Button>;
          })}
          <Button pressed={s['mute_deck'] === true} onClick={() => p.apply(setClipSetting(p.doc, i, 'mute_deck', !(s['mute_deck'] === true)))}>Mute Deck: {s['mute_deck'] === true ? 'On' : 'Off'}</Button>
        </div>
      ) : null}
      {ctl && 'choices' in ctl ? (
        <div class="flex flex-wrap items-center gap-2 text-sm" data-clip-control={ctl.key}>{ctl.label}
          {ctl.choices.map(([label, v]) => <Button pressed={s[ctl.key] === v} onClick={() => p.apply(setClipSetting(p.doc, i, ctl.key, v))}>{label}</Button>)}
        </div>
      ) : ctl ? (
        <label class="grid grid-cols-[8rem_1fr_3.5rem] items-center gap-2 text-sm">{ctl.label}
          <input type="range" min={ctl.min} max={clip.effect === 'hot_cue' ? q.bars + 0.75 : ctl.max} step={ctl.step} value={s[ctl.key] as number} data-clip-control={ctl.key} class="min-h-11 w-full min-w-0 accent-amber"
            onChange={e => p.apply(setClipSetting(p.doc, i, ctl.key, Number((e.target as HTMLInputElement).value)))} />
          <span class="text-right font-mono text-xs text-dim">{ctl.percent ? `${Math.round((s[ctl.key] as number) * 100)}%` : `${s[ctl.key]}${ctl.unit ?? ''}`}</span>
        </label>
      ) : null}
      {clip.points?.length ? <p class="text-xs text-dim">A recorded move: {clip.points.length} points.</p> : null}
    </div>
  );
}
