// The Mix view: a strip per track (its instrument, Mute, a level meter, Volume, Left/Right, Echo and Room, and More for
// its full Sound and its speed and loudness), the DJ decks with the crossfader and Put A Crossfade On The Timeline, the
// effects on the timeline as a list with each one's settings and Show On Timeline, and the whole song's volume and
// limiter. The meters move with the playhead's clock straight in the page (register), never through a render.
import type { ComponentChildren } from 'preact';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { fxInfo } from '../../compose/djcatalogue.ts';
import { levelAt, levelTrack } from '../../compose/levels.ts';
import { isMuted, setMuted } from '../../compose/mutes.ts';
import { FX_DEFAULTS, mixOf, setLaneFx, setMix } from '../../compose/sound.ts';
import type { Part } from '../../compose/doc.ts';
import { cx } from '../console/cx.ts';
import { beatOfBar } from './Arrange.tsx';
import type { Ctl } from './ctl.ts';
import { barWords } from './ctl.ts';
import { FX_COLOR, fxGlyph } from './fxlook.ts';
import { Glyph } from './Glyph.tsx';
import { Icon } from './InstrumentPicker.tsx';

export interface MixViewProps {
  c: Ctl;
  /** Hands the view's meter drawer to the playhead's clock (null when the view goes). */
  register(h: { draw(beat: number, follow: boolean): void } | null): void;
  /** A track's full Sound, speed and loudness, behind More. */
  more(part: Part): ComponentChildren;
  /** The DJ decks (DjMode), or nothing where the page has no sound. */
  dj: ComponentChildren;
  /** An effect's settings, as on the timeline. */
  clipSettings(index: number): ComponentChildren;
  /** Show On Timeline: Compose, the clip picked, its bar in view. */
  showClip(index: number): void;
}

const pct = (v: number): string => `${Math.round(v * 100)}`;
const lr = (v: number): string => (v < -0.05 ? `L${Math.round(-v * 100)}` : v > 0.05 ? `R${Math.round(v * 100)}` : 'C');

function Knob(p: { label: string; name: string; min: number; max: number; step: number; value: number; show(v: number): string; onChange(v: number): void }) {
  const [v, setV] = useState(p.value);
  useEffect(() => setV(p.value), [p.value]);
  return (
    <label class="cmp-knob">
      <span>{p.label}</span>
      <input type="range" min={p.min} max={p.max} step={p.step} value={v} data-knob={p.name} aria-label={p.label}
        onInput={e => setV(Number((e.target as HTMLInputElement).value))}
        onChange={e => p.onChange(Number((e.target as HTMLInputElement).value))} />
      <output>{p.show(v)}</output>
    </label>
  );
}

export function MixView(p: MixViewProps) {
  const { c } = p;
  const [more, setMore] = useState<string | null>(null);
  const [openFx, setOpenFx] = useState<number | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const tracks = useMemo(() => c.doc.parts.map(x => ({ id: x.id, t: levelTrack(x, c.doc) })), [c.doc]);
  const tracksRef = useRef(tracks);
  tracksRef.current = tracks;
  useEffect(() => {
    p.register({
      draw(beat: number) {
        const el = box.current;
        if (!el) return;
        for (const { id, t } of tracksRef.current) {
          const m = el.querySelector<HTMLElement>(`[data-meter="${CSS.escape(id)}"]`);
          if (m) m.style.setProperty('--lvl', c.playing ? levelAt(t, beat).toFixed(3) : '0');
        }
      },
    });
    return () => p.register(null);
  }, []);
  const mix = mixOf(c.doc);
  const clips = (c.doc.fxClips ?? []).map((clip, index) => ({ clip, index })).sort((a, b) => a.clip.from_bar - b.clip.from_bar);
  const morePart = c.doc.parts.find(x => x.id === more) ?? null;

  return (
    <div ref={box} class="grid gap-4" data-mix-view="">
      <section class="cmp-panel" aria-labelledby="mix-tracks">
        <h2 id="mix-tracks" class="cmp-h2">Tracks</h2>
        <p class="cmp-explain">Each track's volume and two effects: Echo repeats the sound and Room puts it in a space. The meter moves with how loud the track is while the song plays.</p>
        {c.doc.parts.length === 0 ? <p class="text-dim">No tracks yet. Add an instrument in Compose.</p> : (
          <div class="cmp-strips">
            {c.doc.parts.map(x => {
              const e = c.entryOf(x);
              const muted = isMuted(x, c.doc);
              const fx = x.fx ?? {};
              return (
                <div class={cx('cmp-strip', muted && 'muted')} data-strip={x.id} style={{ '--c': x.color }}>
                  <div class="cmp-strip-head">
                    <span class="cmp-tile" style={{ '--c': x.color }}>{e ? <Icon name={e.icon} /> : <Glyph name="mic" />}</span>
                    <b class="min-w-0 flex-1 break-words">{x.name}</b>
                    <button type="button" class="cmp-btn small" aria-pressed={muted} data-strip-mute={x.id} aria-label={`${muted ? 'Unmute' : 'Mute'} ${x.name}`}
                      onClick={() => c.apply(setMuted(c.doc, x.id, !muted))}><Glyph name={muted ? 'spk-off' : 'spk'} size={16} />{muted ? 'Unmute' : 'Mute'}</button>
                  </div>
                  <span class="cmp-meter" aria-hidden="true"><i data-meter={x.id} /></span>
                  <Knob label="Volume" name="volume" min={-30} max={12} step={1} value={fx.volume_db ?? FX_DEFAULTS.volume_db} show={v => `${v > 0 ? '+' : ''}${v} dB`}
                    onChange={v => c.apply(setLaneFx(c.doc, x.id, f => ({ ...f, volume_db: v })))} />
                  <Knob label="Left/Right" name="pan" min={-1} max={1} step={0.05} value={fx.pan ?? 0} show={lr}
                    onChange={v => c.apply(setLaneFx(c.doc, x.id, f => ({ ...f, pan: Math.round(v * 100) / 100 })))} />
                  <Knob label="Echo" name="echo" min={0} max={1} step={0.05} value={fx.echo?.amount ?? 0} show={pct}
                    onChange={v => c.apply(setLaneFx(c.doc, x.id, f => ({ ...f, echo: { ...f.echo, amount: v } })))} />
                  <Knob label="Room" name="room" min={0} max={1} step={0.05} value={fx.room ?? FX_DEFAULTS.room} show={pct}
                    onChange={v => c.apply(setLaneFx(c.doc, x.id, f => ({ ...f, room: v })))} />
                  <button type="button" class="cmp-btn small justify-self-start" aria-expanded={more === x.id} data-strip-more={x.id} onClick={() => setMore(more === x.id ? null : x.id)}>
                    <Glyph name="sliders" size={16} />{more === x.id ? 'Less' : 'More'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
        {morePart ? <div class="cmp-more" data-strip-panel={morePart.id}>{p.more(morePart)}</div> : null}
      </section>

      <section class="cmp-panel" aria-labelledby="mix-dj">
        <h2 id="mix-dj" class="cmp-h2">DJ Decks</h2>
        <p class="cmp-explain">Deck A plays the first half of your tracks and Deck B the rest. Get the deck ready, play, and slide the crossfader to blend from one to the other. Put A Crossfade On The Timeline writes a fade into the song itself.</p>
        {p.dj}
      </section>

      <section class="cmp-panel" aria-labelledby="mix-fx">
        <h2 id="mix-fx" class="cmp-h2">Effects On The Timeline</h2>
        <p class="cmp-explain">The same effects you see in Compose, on the same bars as your notes.</p>
        {clips.length === 0 ? <p class="text-dim">No effects yet. Press Add Effect in Compose to put one in.</p> : (
          <div class="grid gap-2">
            {clips.map(({ clip, index }) => {
              const info = fxInfo(clip.effect);
              const on = clip.lane === null ? 'the whole song' : c.doc.parts.find(x => x.id === clip.lane)?.name ?? clip.lane;
              return (
                <div class="cmp-fxitem" data-fx-item={clip.effect} style={{ '--c': FX_COLOR(clip.effect) }}>
                  <div class="flex flex-wrap items-center gap-2">
                    <Glyph name={fxGlyph(clip.effect)} />
                    <b>{info.name}</b>
                    <span class="text-sm text-dim">{barWords(c.clock, beatOfBar(c, clip.from_bar))} → {barWords(c.clock, beatOfBar(c, clip.to_bar))} · {on}</span>
                    <span class="flex-1" />
                    <button type="button" class="cmp-btn small" aria-expanded={openFx === index} onClick={() => setOpenFx(openFx === index ? null : index)}><Glyph name="sliders" size={16} />Settings</button>
                    <button type="button" class="cmp-btn small" data-show-on-timeline="" onClick={() => p.showClip(index)}><Glyph name="roll" size={16} />Show On Timeline</button>
                  </div>
                  {openFx === index ? <div class="mt-2">{p.clipSettings(index)}</div> : null}
                </div>
              );
            })}
          </div>
        )}
        <div><button type="button" class="cmp-btn small" onClick={() => { c.setPaletteOpen(true); p.showClip(-1); }}><Glyph name="plus" size={16} />Add Effect</button></div>
      </section>

      <section class="cmp-panel" aria-labelledby="mix-whole">
        <h2 id="mix-whole" class="cmp-h2">Whole Song</h2>
        <div class="grid max-w-md gap-2">
          <Knob label="Volume" name="loudness" min={-30} max={-10} step={1} value={mix.loudness} show={v => `${v} LUFS`}
            onChange={v => c.apply(setMix(c.doc, m => ({ ...m, loudness: v })))} />
          <button type="button" class="cmp-btn small justify-self-start" aria-pressed={!!mix.limiter?.on} data-limiter=""
            onClick={() => c.apply(setMix(c.doc, m => ({ ...m, limiter: { on: !m.limiter?.on, ceiling_db: m.limiter?.ceiling_db ?? -1 } })))}>
            {`Limiter: ${mix.limiter?.on ? 'On' : 'Off'}`}
          </button>
        </div>
        <p class="cmp-explain">Volume sets how loud the finished song is. The limiter catches the loudest moments so nothing distorts. The room the whole song plays in is under More on any track.</p>
      </section>
    </div>
  );
}

