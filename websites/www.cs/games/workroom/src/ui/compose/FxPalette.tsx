// The effects palette above the timeline: all of DJ & Effects' effects by family, each a chip with its own Hear. Drag a
// chip onto a track or the Effects row (with a finger, hold it still a moment first, so a swipe still scrolls), or tap
// its name and then tap where it goes; a mouse shows where it will land before the click. The settings of a picked
// effect sit under the row it is drawn on.
import { useState } from 'preact/hooks';
import { EFFECTS, FAMILIES, fxInfo } from '../../compose/djcatalogue.ts';
import type { Family } from '../../compose/djcatalogue.ts';
import { fxRow } from '../../compose/placement.ts';
import type { Target } from '../../compose/placement.ts';
import type { FxClipEffect } from '../../score.ts';
import { cx } from '../console/cx.ts';
import type { Ctl } from './ctl.ts';
import { barWords } from './ctl.ts';
import { ClipSheet } from './ClipSheet.tsx';
import type { ClipPorts } from './ClipSheet.tsx';
import { FAMILY_COLOR, FX_COLOR, fxGlyph } from './fxlook.ts';
import { FAMILY_GLYPH, Glyph } from './Glyph.tsx';
import { beatOfBar, targetAt } from './Arrange.tsx';

export interface FxPaletteProps {
  c: Ctl;
  /** Plays a short example of the effect, over the song if it is playing. */
  hear(effect: FxClipEffect): void;
  /** The effect whose example is being made ready. */
  hearing: FxClipEffect | null;
  setDrop(t: Target | null): void;
}

export function FxPalette(p: FxPaletteProps) {
  const { c } = p;
  const [family, setFamily] = useState<Family>('build');
  const shown = EFFECTS.filter(x => x.family === family);
  return (
    <section class="cmp-palette" id="palette" aria-label="Effects" data-palette="">
      <div class="flex items-start gap-2">
        <div role="tablist" aria-label="Effect Families" class="cmp-families min-w-0 flex-1">
          {FAMILIES.map(f => (
            <button type="button" role="tab" aria-selected={f.id === family} data-family={f.id} style={{ '--c': FAMILY_COLOR[f.id] }} onClick={() => setFamily(f.id)}>
              <Glyph name={FAMILY_GLYPH[f.id] ?? 'plus'} size={16} />{f.name}
            </button>
          ))}
        </div>
        <button type="button" class="cmp-icon" aria-label="Close Effects" title="Close" onClick={() => { c.setPaletteOpen(false); c.startPlacing(null); }}><Glyph name="close" /></button>
      </div>
      <p class="text-sm text-dim">{FAMILIES.find(f => f.id === family)!.blurb}</p>
      <div class="cmp-chips" role="list">
        {shown.map(x => (
          <div class="cmp-chip" role="listitem" style={{ '--c': FAMILY_COLOR[x.family] }} title={x.does}>
            <button type="button" data-effect={x.id} aria-pressed={c.placing === x.id} aria-label={`Place ${x.name}`}
              onPointerDown={e => chipDrag(c, x.id, e, p.setDrop)}
              onClick={e => { if (Date.now() < quietUntil) return; c.startPlacing(c.placing === x.id ? null : x.id); if ((e as MouseEvent).detail === 0) c.say(`${x.name}: use the arrow keys to choose the track and the bar, then Enter.`); }}>
              <Glyph name={fxGlyph(x.id)} size={16} />{x.name}
            </button>
            <button type="button" data-hear-effect={x.id} aria-label={`Hear ${x.name}`} title={`Hear ${x.name}`} onClick={() => p.hear(x.id)}>
              <Glyph name="play" size={14} />{p.hearing === x.id ? 'Getting Ready…' : 'Hear'}
            </button>
          </div>
        ))}
      </div>
      <p class="text-sm text-dim">{c.coarse ? 'Hold an effect, then drag it onto a track. Or tap its name, then tap a bar.' : 'Drag an effect onto a track or the Effects row. Or click its name, then click a bar.'}
        {' '}Effects that are a sound of their own sit on the Effects row; the rest change only the track they land on.</p>
    </section>
  );
}

/** After a chip is dragged, its click is not a tap. */
let quietUntil = 0;

/** A chip dragged onto the timeline: at once with a mouse, after a short hold with a finger. */
function chipDrag(c: Ctl, effect: FxClipEffect, e: PointerEvent, setDrop: (t: Target | null) => void): void {
  if (e.button !== 0) return;
  const btn = e.currentTarget as HTMLElement;
  const touch = e.pointerType === 'touch';
  const x0 = e.clientX;
  const y0 = e.clientY;
  let live = false;
  let t: Target | null = null;
  let g: HTMLElement | null = null;
  const capture = (): void => { try { btn.setPointerCapture(e.pointerId); } catch { /* gone */ } };
  if (!touch) capture();
  const begin = (): void => {
    live = true;
    capture();
    c.startPlacing(null);
    g = document.createElement('div');
    g.className = 'cmp-ghost';
    g.style.setProperty('--c', FX_COLOR(effect));
    g.innerHTML = '<b></b><small></small>';
    g.firstElementChild!.textContent = fxInfo(effect).name;
    document.body.append(g);
    navigator.vibrate?.(8);
  };
  const timer = touch ? setTimeout(() => { if (!live) { begin(); to(x0, y0); } }, 250) : undefined;
  const to = (x: number, y: number): void => {
    t = targetAt(c, x, y, effect);
    setDrop(t);
    if (!g) return;
    g.lastElementChild!.textContent = t ? (t.bad ?? t.label) : 'Drop it on a track or the Effects row';
    const w = g.offsetWidth;
    g.style.transform = `translate(${Math.max(4, Math.min(window.innerWidth - w - 4, touch ? x - w / 2 : x + 14))}px,${Math.max(4, touch ? y - g.offsetHeight - 36 : y + 16)}px)`;
  };
  const noScroll = (ev: TouchEvent): void => { if (live && ev.cancelable) ev.preventDefault(); };
  btn.addEventListener('touchmove', noScroll, { passive: false });
  const move = (ev: PointerEvent): void => {
    if (ev.pointerId !== e.pointerId) return;
    if (!live) {
      const far = Math.hypot(ev.clientX - x0, ev.clientY - y0);
      if (touch) { if (far > 10) { clearTimeout(timer); done(); } return; }
      if (far < 5) return;
      begin();
    }
    to(ev.clientX, ev.clientY);
  };
  const done = (): void => {
    btn.removeEventListener('pointermove', move);
    btn.removeEventListener('pointerup', up);
    btn.removeEventListener('pointercancel', up);
    btn.removeEventListener('touchmove', noScroll);
  };
  const up = (ev: PointerEvent): void => {
    if (ev.pointerId !== e.pointerId) return;
    clearTimeout(timer);
    done();
    if (!live) return;
    quietUntil = Date.now() + 500;
    g?.remove();
    setDrop(null);
    if (ev.type === 'pointerup' && t && !t.bad) c.placeAt(t);
    else if (t?.bad) c.say(t.bad);
  };
  btn.addEventListener('pointermove', move);
  btn.addEventListener('pointerup', up);
  btn.addEventListener('pointercancel', up);
}

/** What a tap does while an effect is being placed, at the foot of the screen, with Cancel. */
export function PlaceBanner(p: { c: Ctl }) {
  const { c } = p;
  if (!c.placing) return null;
  const info = fxInfo(c.placing);
  const tap = c.coarse ? 'Tap' : 'Click';
  const words = c.placing === 'riser' ? `${tap} the bar line the Riser should build into.`
    : fxRow(c.placing) === 'lane' ? `${tap} where the ${info.name} should start.`
    : c.placing === 'crossfader' ? `${tap} the track that fades out, at the bar where the Crossfade should start.`
    : `${tap} a track (or the Effects row, for the whole song) where the ${info.name} should start.`;
  return (
    <div class="cmp-banner" role="status" data-place-banner="">
      <span class="cmp-tile" style={{ '--c': FX_COLOR(c.placing) }}><Glyph name={fxGlyph(c.placing)} /></span>
      <span class="min-w-0 flex-1 text-sm">{words}{c.coarse ? '' : ' Or use the arrow keys and Enter.'}</span>
      <button type="button" class="cmp-btn" onClick={() => c.startPlacing(null)}>Cancel</button>
    </div>
  );
}

/** The picked effect's settings: what it does, Hear From Here, its bars and its own setting. */
export function FxSettings(p: { c: Ctl; index: number; building: boolean; hearFrom(bar: number): void }) {
  const { c, index } = p;
  const clip = c.doc.fxClips?.[index];
  if (!clip) return null;
  const info = fxInfo(clip.effect);
  const from = beatOfBar(c, clip.from_bar);
  const to = beatOfBar(c, clip.to_bar);
  const props: ClipPorts = { doc: c.doc, apply: next => c.apply(next), hearFrom: bar => p.hearFrom(Math.max(1, Math.floor(bar) - 1)), building: p.building };
  return (
    <div class="grid gap-2" data-fx-settings={clip.effect}>
      <div class="flex flex-wrap items-center gap-2">
        <span class="cmp-tile" style={{ '--c': FX_COLOR(clip.effect) }}><Glyph name={fxGlyph(clip.effect)} /></span>
        <strong class="font-display text-xl">{info.name}</strong>
        <span class={cx('cmp-label')}>{barWords(c.clock, from)} → {barWords(c.clock, to)}</span>
        <button type="button" class="cmp-btn ml-auto" onClick={() => c.setPick({ kind: 'none' })}><Glyph name="check" size={16} />Done</button>
      </div>
      <ClipSheet clip={clip} i={index} p={props} bars={c.bars} onDone={() => c.setPick({ kind: 'none' })} bare />
    </div>
  );
}
