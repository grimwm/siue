// A picked effect's settings: Hear From Here, Earlier and Later, Shorter and Longer, Remove, where it plays, and its own
// setting (a choice or a slider). A crossfade names the tracks that fade out and those that fade in, and whether the
// ones fading in are silent until it; a vocoder the part it sings through; the Looper its bars. Each change is one Undo
// step.
import type { EditDoc } from '../../compose/doc.ts';
import { fxInfo } from '../../compose/djcatalogue.ts';
import { moveClip, removeClip, setClipLane, setClipSetting, stepClip } from '../../compose/djclips.ts';
import { settingsOf } from '../../render/djfx.ts';
import { WHOLE_PIECE_EFFECTS } from '../../score.ts';
import type { FxClip } from '../../score.ts';
import { Button } from '../console/Button.tsx';

export interface ClipPorts {
  doc: EditDoc;
  apply(next: EditDoc): void;
  /** Plays the piece from a bar position. */
  hearFrom(bar: number): void;
  /** True while the piece's sound is being built to play: Hear From Here says so and waits. */
  building?: boolean;
}

const barWords = (b: number): string => (Number.isInteger(b) ? `bar ${b}` : `bar ${Math.floor(b)} + ${Math.round((b - Math.floor(b)) * 1000) / 1000}`);

/** Beats in the bar holding a bar position. */
function beatsAt(doc: EditDoc, bar: number): number {
  let beats = doc.tempo[0]?.beats ?? 4;
  for (const t of doc.tempo) if (t.bar <= bar) beats = t.beats;
  return beats;
}

export function ClipSheet(q: { clip: FxClip; i: number; p: ClipPorts; bars: number; onDone(): void; bare?: boolean }) {
  const { clip, i, p } = q;
  const x = fxInfo(clip.effect);
  const s = settingsOf(clip);
  const ctl = x.control;
  const others = p.doc.parts;
  return (
    <div data-clip-sheet="" class="grid gap-2 rounded-md border border-amber p-3">
      {q.bare ? null : <p class="font-semibold">{x.name} <span class="font-mono text-xs text-dim" data-clip-bars="">{barWords(clip.from_bar)} to {barWords(clip.to_bar)}</span></p>}
      <p class="text-sm text-dim">{x.does}</p>
      <div class="flex flex-wrap gap-2">
        <Button onClick={() => p.hearFrom(clip.from_bar)} disabled={p.building}>{p.building ? 'Getting Ready…' : 'Hear From Here'}</Button>
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
        <div class="grid gap-1 text-sm" data-crossfade-sides="">
          {s['fade'] === true && !(s['b'] as string[]).length ? (
            <p class="font-semibold">Choose the track that fades in. Until you do, {others.filter(o => (s['a'] as string[]).includes(o.id)).map(o => o.name).join(' + ') || 'nothing'} just fades out.</p>
          ) : null}
          {others.map(o => {
            const side = (s['a'] as string[]).includes(o.id) ? 'a' : (s['b'] as string[]).includes(o.id) ? 'b' : 'none';
            const set = (to: 'a' | 'b' | 'none') => {
              const a = (s['a'] as string[]).filter(z => z !== o.id);
              const b = (s['b'] as string[]).filter(z => z !== o.id);
              if (to === 'a') a.push(o.id);
              if (to === 'b') b.push(o.id);
              // A fade keeps at least one track fading out.
              if (!a.length) return;
              p.apply(setClipSetting(setClipSetting(p.doc, i, 'a', a), i, 'b', b));
            };
            const fade = s['fade'] === true;
            return (
              <div class="flex flex-wrap items-center gap-2"><span class="w-32 truncate">{o.name}</span>
                <Button pressed={side === 'a'} onClick={() => set('a')}>{fade ? 'Fades Out' : 'Side A'}</Button>
                <Button pressed={side === 'b'} onClick={() => set('b')}>{fade ? 'Fades In' : 'Side B'}</Button>
                <Button pressed={side === 'none'} onClick={() => set('none')}>Neither</Button></div>
            );
          })}
          {s['fade'] === true && (s['b'] as string[]).length ? (
            <Button pressed={s['silent'] === true} onClick={() => p.apply(setClipSetting(p.doc, i, 'silent', !(s['silent'] === true)))}>
              {`Silent Until The Crossfade: ${s['silent'] === true ? 'On' : 'Off'}`}
            </Button>
          ) : null}
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
