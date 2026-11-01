// DJ & Effects, Way Two, Perform Live (DJ Mode): the piece on a deck, played live through the Platter (drag to
// scratch, let go to carry on in time), the Crossfader between two groups of parts, four Hot Cues, sixteen
// Performance Pads (held to play; keys 1–4, Q–R, A–F and Z–V), the XY Pad and the Looper (Record 1 Bar, Layer, Mute
// Deck, Clear). Several fingers work at once. With Record To Timeline on, what is played lands on the timeline as
// clips with their settings, in one Undo step. The page never moves while a pad, key or the platter is held.
import { useEffect, useRef, useState } from 'preact/hooks';
import { addClips } from '../../compose/djclips.ts';
import { BROWSER_LIMITS } from '../../compose/djcatalogue.ts';
import { createDeck, PADS, XY_MODES } from '../../compose/djlive.ts';
import type { Deck } from '../../compose/djlive.ts';
import type { EditDoc } from '../../compose/doc.ts';
import type { ScrollPin } from '../../compose/scrollpin.ts';
import { barMap } from '../../render/djfx.ts';
import type { Score, FxClipEffect } from '../../score.ts';
import { Button } from '../console/Button.tsx';
import { Panel } from '../console/Panel.tsx';
import { cx } from '../console/cx.ts';

export interface DjPorts {
  /** The page's sound output, made on the first tap. */
  context(): AudioContext;
}

export interface DjModeProps {
  doc: EditDoc;
  ports: DjPorts;
  pin: ScrollPin;
  help: boolean;
  /** The piece (or only some of its parts) as a renderable score. */
  score(parts?: readonly string[]): Score;
  build(key: string, score: Score): Promise<{ channels: Float32Array[]; rate: number }>;
  apply(next: EditDoc): void;
  status(text: string): void;
  /** Told whether the deck is playing: while it plays, the pad keys are the deck's. */
  onLive?(playing: boolean): void;
}

/** 33⅓ turns a minute, in radians a second: the platter's normal speed. */
const PLATTER = (33.333 / 60) * 2 * Math.PI;

/** `ch` as stereo (a mono render on both sides) at `to` samples a second, by straight lines between samples. */
function resample(input: readonly Float32Array[], from: number, to: number): Float32Array[] {
  const ch = input.length > 1 ? input.slice(0, 2) : [input[0]!, input[0]!];
  if (from === to) return ch.map(c => c);
  const n = Math.floor((ch[0]!.length * to) / from);
  return ch.map(c => Float32Array.from({ length: n }, (_, i) => {
    const p = (i * from) / to;
    const j = Math.floor(p);
    return (c[j] ?? 0) + ((c[j + 1] ?? 0) - (c[j] ?? 0)) * (p - j);
  }));
}

export function DjMode(p: DjModeProps) {
  const deck = useRef<Deck | null>(null);
  const node = useRef<{ sp: ScriptProcessorNode; quiet: ConstantSourceNode } | null>(null);
  /** The document the deck was made from: when the piece changes, the deck is stale until it is made again. */
  const builtFrom = useRef<EditDoc | null>(null);
  const [ready, setReady] = useState<'no' | 'building' | 'yes'>('no');
  const [, setTick] = useState(0);
  const [recording, setRecording] = useState(false);
  const [setCues, setSetCues] = useState(false);
  const [xyMode, setXyMode] = useState<FxClipEffect>('filter');
  const [held, setHeld] = useState<ReadonlySet<string>>(new Set());
  const [fader, setFader] = useState(0.5);
  const platter = useRef<{ id: number; a: number; at: number } | null>(null);
  const [spin, setSpin] = useState(0);
  const sides = (() => {
    const ids = p.doc.parts.map(x => x.id);
    const half = Math.max(1, Math.floor(ids.length / 2));
    return ids.length >= 2 ? { a: ids.slice(0, half), b: ids.slice(half) } : null;
  })();
  const nameOf = (ids: readonly string[]) => ids.map(id => p.doc.parts.find(x => x.id === id)?.name ?? id).join(' + ');
  const refresh = () => setTick(k => k + 1);

  /** Lets go of the deck's audio graph. */
  const release = () => {
    const n = node.current;
    if (n) {
      n.sp.onaudioprocess = null;
      try { n.quiet.stop(); } catch { /* never started */ }
      n.quiet.disconnect();
      n.sp.disconnect();
    }
    node.current = null;
    deck.current?.stop();
    deck.current = null;
  };
  useEffect(() => () => { release(); p.onLive?.(false); }, []);
  useEffect(() => { p.onLive?.(deck.current?.playing() ?? false); });

  const getReady = async () => {
    finishRecording();
    release();
    setReady('building');
    p.status('Getting the deck ready: building the piece…');
    try {
      const ctx = p.ports.context();
      const full = await p.build('dj-all', p.score());
      const a = sides ? await p.build('dj-a', p.score(sides.a)) : null;
      const b = sides ? await p.build('dj-b', p.score(sides.b)) : null;
      const rate = ctx.sampleRate;
      deck.current = createDeck({
        rate, full: resample(full.channels, full.rate, rate),
        ...(a && b ? { a: resample(a.channels, a.rate, rate), b: resample(b.channels, b.rate, rate) } : {}),
      }, barMap(p.doc.tempo, rate), sides, { changed: refresh });
      // The deck's callback, fed a silent input: a script processor with nothing coming in may never be called.
      const sp = ctx.createScriptProcessor(1024, 1, 2);
      sp.onaudioprocess = e => deck.current?.process(e.outputBuffer.getChannelData(0), e.outputBuffer.getChannelData(1));
      const quiet = ctx.createConstantSource();
      quiet.offset.value = 0;
      quiet.connect(sp);
      node.current = { sp, quiet };
      quiet.start();
      sp.connect(ctx.destination);
      if (ctx.state !== 'running') await ctx.resume();
      builtFrom.current = p.doc;
      setReady('yes');
      p.status('The deck is ready. Press Play, then hold the pads.');
    } catch (e) {
      release();
      setReady('no');
      p.status(`The deck could not be made: ${e instanceof Error ? e.message : String(e)}`);
    }
  };

  const finishRecording = () => {
    const d = deck.current;
    if (!d || !d.recording()) return;
    const clips = d.record(false);
    setRecording(false);
    if (clips.length) {
      p.apply(addClips(p.doc, clips));
      p.status(`Recorded ${clips.length} ${clips.length === 1 ? 'effect' : 'effects'} onto the timeline. Undo takes the whole performance back.`);
    } else p.status('Nothing was played while recording.');
  };

  const hold = (id: string, down: boolean, pad?: (typeof PADS)[number]) => {
    const d = deck.current;
    if (!d) return;
    if (down) {
      if (held.has(id)) return;
      p.pin.hold(`dj:${id}`);
      if (pad) d.padDown(id, pad.effect, pad.settings);
      setHeld(h => new Set(h).add(id));
    } else {
      if (pad) d.padUp(id);
      p.pin.release(`dj:${id}`);
      setHeld(h => { const n = new Set(h); n.delete(id); return n; });
    }
  };

  // The pads' keys: held to play, never repeated, and all let go when the window loses focus.
  useEffect(() => {
    const typing = (t: EventTarget | null) => t instanceof HTMLElement && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable);
    const pad = (e: KeyboardEvent) => PADS.find(x => x.key === e.key.toLowerCase());
    const down = (e: KeyboardEvent) => {
      const x = pad(e);
      if (!x || e.repeat || typing(e.target) || e.ctrlKey || e.metaKey || e.altKey || !deck.current?.playing()) return;
      e.preventDefault();
      hold(`key:${x.key}`, true, x);
    };
    const up = (e: KeyboardEvent) => { const x = pad(e); if (x) hold(`key:${x.key}`, false, x); };
    const blur = () => { for (const x of PADS) hold(`key:${x.key}`, false, x); };
    addEventListener('keydown', down);
    addEventListener('keyup', up);
    addEventListener('blur', blur);
    return () => { removeEventListener('keydown', down); removeEventListener('keyup', up); removeEventListener('blur', blur); };
  });

  const d = deck.current;
  const loop = d?.looper() ?? { bars: [], mute: false, waiting: false };
  const angle = (e: PointerEvent, el: HTMLElement) => { const r = el.getBoundingClientRect(); return Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)); };
  const xyAt = (e: PointerEvent, el: HTMLElement): [number, number] => {
    const r = el.getBoundingClientRect();
    return [Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)), Math.min(1, Math.max(0, 1 - (e.clientY - r.top) / r.height))];
  };
  const mode = XY_MODES.find(m => m.effect === xyMode)!;

  return (
    <Panel title="DJ & Effects · Perform Live (DJ Mode)" data={{ 'data-dj': '' }}>
      <div class="grid gap-3">
        <div class="flex flex-wrap items-center gap-2">
          {ready !== 'yes' ? <Button variant="primary" onClick={() => void getReady()} disabled={ready === 'building'}>{ready === 'building' ? 'Getting Ready…' : 'Get The Deck Ready'}</Button> : (
            <>
              {d?.playing() ? <Button onClick={() => { finishRecording(); d.stop(); refresh(); }}>■ Stop</Button> : <Button variant="primary" onClick={() => { d?.play(1); refresh(); }}>▶ Play</Button>}
              <Button pressed={recording} onClick={() => {
                if (recording) finishRecording();
                else { d?.record(true); setRecording(true); p.status('Recording to the timeline: what you play now lands as clips.'); }
              }} data={{ 'data-record-timeline': '' }}>● Record To Timeline: {recording ? 'On' : 'Off'}</Button>
              <DeckBar deck={d} />
            </>
          )}
        </div>
        {ready === 'yes' && builtFrom.current !== p.doc ? (
          <div class="flex flex-wrap items-center gap-2 text-sm" data-deck-stale="">
            <span>The piece has changed since the deck was made.</span>
            <Button onClick={() => void getReady()}>Get The Deck Ready Again</Button>
          </div>
        ) : null}
        <p data-recording="" class="text-sm">{recording ? 'Recording.' : 'Not recording.'}</p>

        <div class={cx('grid gap-4 md:grid-cols-2', ready !== 'yes' && 'pointer-events-none opacity-50')}>
          <div class="grid content-start gap-3">
            <h3 class="font-display text-sm font-semibold tracking-wide uppercase">Platter</h3>
            <div data-platter="" role="slider" aria-label="Platter: drag round to scratch" aria-valuenow={0} tabindex={0}
              class="relative mx-auto aspect-square w-40 max-w-full touch-none rounded-full border-4 border-rule bg-well"
              style={{ transform: `rotate(${spin}rad)` }}
              onPointerDown={e => { const el = e.currentTarget as HTMLElement; el.setPointerCapture?.(e.pointerId); platter.current = { id: e.pointerId, a: angle(e, el), at: performance.now() }; p.pin.hold('dj:platter'); deck.current?.platter(0); }}
              onPointerMove={e => {
                const pl = platter.current;
                if (!pl || pl.id !== e.pointerId) return;
                const a = angle(e, e.currentTarget as HTMLElement);
                let da = a - pl.a;
                if (da > Math.PI) da -= 2 * Math.PI;
                if (da < -Math.PI) da += 2 * Math.PI;
                const dt = Math.max(1, performance.now() - pl.at) / 1000;
                deck.current?.platter(Math.max(-8, Math.min(8, da / dt / PLATTER)));
                setSpin(s => s + da);
                platter.current = { id: pl.id, a, at: performance.now() };
              }}
              onPointerUp={() => { platter.current = null; deck.current?.platter(null); p.pin.release('dj:platter'); }}
              onPointerCancel={() => { platter.current = null; deck.current?.platter(null); p.pin.release('dj:platter'); }}>
              <span class="absolute top-2 left-1/2 h-6 w-1 -translate-x-1/2 rounded bg-amber" />
              <span class="absolute inset-0 m-auto flex size-12 items-center justify-center rounded-full bg-panel font-mono text-xs">33⅓</span>
            </div>
            <p class="text-xs text-dim">Drag the record round and back to scratch. Let go and the beat carries on in time.</p>

            <h3 class="font-display text-sm font-semibold tracking-wide uppercase">Crossfader</h3>
            {sides ? (
              <label class="grid gap-1 text-sm">
                <input type="range" min={0} max={1} step={0.01} value={fader} data-crossfader="" class="min-h-11 w-full accent-amber"
                  onPointerDown={() => p.pin.hold('dj:fader')} onPointerUp={() => p.pin.release('dj:fader')}
                  onInput={e => { const v = Number((e.target as HTMLInputElement).value); setFader(v); deck.current?.fader(Math.abs(v - 0.5) < 0.02 ? null : v); }} />
                <span class="flex justify-between font-mono text-xs text-dim"><span>A: {nameOf(sides.a)}</span><span>B: {nameOf(sides.b)}</span></span>
              </label>
            ) : <p class="text-xs text-dim">The Crossfader needs two parts or more.</p>}

            <h3 class="font-display text-sm font-semibold tracking-wide uppercase">Hot Cues</h3>
            <div class="flex flex-wrap gap-2">
              <Button pressed={setCues} onClick={() => setSetCues(!setCues)}>Set Cues</Button>
              {[0, 1, 2, 3].map(k => {
                const c = d?.cues()[k] ?? null;
                return (
                  <button type="button" data-cue={String(k + 1)} class={cx('min-h-11 min-w-11 touch-none rounded-md border px-3 font-mono text-sm', c === null ? 'border-rule bg-panel text-dim' : 'border-amber bg-lane')}
                    onPointerDown={e => { (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId); if (setCues) d?.setCue(k); else { p.pin.hold(`dj:cue${k}`); d?.cueDown(k); } refresh(); }}
                    onPointerUp={() => { if (!setCues) { d?.cueUp(k); p.pin.release(`dj:cue${k}`); } }}
                    onPointerCancel={() => { d?.cueUp(k); p.pin.release(`dj:cue${k}`); }}>{c === null ? `Cue ${k + 1}` : `${k + 1} · Bar ${c}`}</button>
                );
              })}
            </div>
            <p class="text-xs text-dim">{setCues ? 'Tap a cue to mark the bar playing now.' : 'Hold a cue to play from it.'}</p>
          </div>

          <div class="grid content-start gap-3">
            <h3 class="font-display text-sm font-semibold tracking-wide uppercase">Performance Pads</h3>
            <div class="grid grid-cols-4 gap-2" data-pads="">
              {PADS.map(x => {
                const id = `pad:${x.key}`;
                return (
                  <button type="button" data-pad={x.key} aria-pressed={held.has(id) || held.has(`key:${x.key}`)} aria-label={`${x.top} ${x.bottom}`}
                    class={cx('grid min-h-16 touch-none place-items-center rounded-md border p-1 text-center text-xs font-semibold select-none',
                      held.has(id) || held.has(`key:${x.key}`) ? 'border-amber bg-amber text-on-accent' : 'border-rule bg-well')}
                    onPointerDown={e => { (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId); hold(id, true, x); }}
                    onPointerUp={() => hold(id, false, x)} onPointerCancel={() => hold(id, false, x)}>
                    <kbd class="font-mono text-[0.6rem] text-dim">{x.key.toUpperCase()}</kbd><span>{x.top}</span><small>{x.bottom}</small>
                  </button>
                );
              })}
            </div>
            <p class="text-xs text-dim">Hold a pad. Let go to stop. Keys 1–4, Q–R, A–F and Z–V work too.</p>

            <h3 class="font-display text-sm font-semibold tracking-wide uppercase">XY Pad</h3>
            <div class="flex flex-wrap gap-1">{XY_MODES.map(m => <Button pressed={xyMode === m.effect} onClick={() => setXyMode(m.effect)}>{m.name}</Button>)}</div>
            <div data-xy="" role="application" aria-label={`XY Pad: ${mode.name}`} class="relative aspect-square w-48 max-w-full touch-none rounded-md border border-rule bg-well"
              onPointerDown={e => { const el = e.currentTarget as HTMLElement; el.setPointerCapture?.(e.pointerId); p.pin.hold('dj:xy'); const [x, y] = xyAt(e, el); deck.current?.xy(xyMode, x, y); }}
              onPointerMove={e => { if ((e.buttons & 1) === 0 && e.pointerType === 'mouse') return; const [x, y] = xyAt(e, e.currentTarget as HTMLElement); if (p.pin.held()) deck.current?.xy(xyMode, x, y); }}
              onPointerUp={() => { deck.current?.xyUp(); p.pin.release('dj:xy'); }} onPointerCancel={() => { deck.current?.xyUp(); p.pin.release('dj:xy'); }}>
              <span class="absolute bottom-1 left-2 font-mono text-[0.6rem] text-dim">X: {mode.x}</span>
              <span class="absolute top-2 left-1 origin-left rotate-90 font-mono text-[0.6rem] text-dim">Y: {mode.y}</span>
            </div>

            <h3 class="font-display text-sm font-semibold tracking-wide uppercase">Looper</h3>
            <div class="flex flex-wrap gap-2">
              <Button onClick={() => { d?.loopRecord(); refresh(); }} data={{ 'data-loop': 'record' }}>Record 1 Bar</Button>
              <Button onClick={() => { d?.loopLayer(); refresh(); }} disabled={!loop.bars.length}>Layer</Button>
              <Button pressed={loop.mute} onClick={() => { d?.loopMute(); refresh(); }}>Mute Deck</Button>
              <Button onClick={() => { d?.loopClear(); refresh(); }}>Clear</Button>
            </div>
            <p data-looper="" class="text-xs text-dim">{loop.waiting ? 'Waiting for the next bar…' : loop.bars.length ? `Looping bar ${loop.bars.join(' + ')}${loop.mute ? ', deck muted' : ''}.` : 'Empty. Records what you hear, starting on the next bar.'}</p>
          </div>
        </div>
        <div class="rounded-md border border-rule p-3">
          <h3 class="font-display text-sm font-semibold tracking-wide uppercase">What A Browser Does Less Well</h3>
          <ul class="mt-1 list-disc pl-5 text-sm text-dim">{BROWSER_LIMITS.map(t => <li>{t}</li>)}</ul>
        </div>
        {p.help ? <p class="border-l-2 border-amber pl-2 text-sm text-dim">The deck plays the piece as it was when it was made; after changing the piece, Get The Deck Ready Again. Several fingers work at once. With Record To Timeline on, each pad, cue, loop and move lands on the timeline above as a clip.</p> : null}
      </div>
    </Panel>
  );
}

/** The bar the deck is playing, read a few times a second. */
function DeckBar(q: { deck: Deck | null }) {
  const [, setTick] = useState(0);
  useEffect(() => { const id = setInterval(() => setTick(k => k + 1), 250); return () => clearInterval(id); }, []);
  return <span data-deck-bar="" data-deck-pos={String(q.deck?.bar() ?? 0)} class="font-mono text-xs text-dim">{q.deck?.playing() ? `Bar ${Math.floor(q.deck.bar())}` : 'Stopped'}</span>;
}
