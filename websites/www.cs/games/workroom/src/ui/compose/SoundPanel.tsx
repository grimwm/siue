// Sound: this part's settings (Volume, Left / Right, Bass / Middle / Treble, Echo Amount and Repeats, Shimmer, Warmth,
// Brightness with Sweep, Even Out Loud And Soft, Room, Mute, Solo), its Voice Effects chain with Try It With The Mic,
// and The Whole Piece (Room preset and amount, the limiter, Overall Loudness), with What The Score Saves. Settings are
// kept as score settings, never as audio; each change is one Undo step. Changes are heard with Hear With The Piece.
import { useEffect, useRef, useState } from 'preact/hooks';
import type { Part } from '../../compose/doc.ts';
import { FX_DEFAULTS, newVoiceFx } from '../../compose/sound.ts';
import type { LiveVoice } from '../../compose/livemic.ts';
import { HARMONY_VOICES, MAX_VOICE_FX, ROOMS, SWEEPS, VOICE_EFFECTS } from '../../score.ts';
import type { LaneFx, Mix, VoiceFx } from '../../score.ts';
import { Button } from '../console/Button.tsx';
import { Panel } from '../console/Panel.tsx';

export interface SoundPanelProps {
  part: Part;
  /** The other parts, for a Vocoder's or Talk Box's carrier. */
  others: readonly { id: string; name: string }[];
  mix: Mix;
  help: boolean;
  onFx(change: (fx: LaneFx) => LaneFx): void;
  onVoice(chain: VoiceFx[]): void;
  onMix(change: (m: Mix) => Mix): void;
  /** Starts the chain on the live microphone (asked for now); absent where the page has no microphone. */
  live?: (chain: readonly VoiceFx[]) => Promise<LiveVoice>;
}

const ROOM_NAMES: Record<(typeof ROOMS)[number], string> = { dry: 'Dry', small_room: 'Small Room', concert_hall: 'Concert Hall', cathedral: 'Cathedral', cave: 'Cave' };
const SWEEP_NAMES: Record<(typeof SWEEPS)[number], string> = { off: 'Off', slow: 'Slow', fast: 'Fast' };
export const EFFECT_NAMES: Record<VoiceFx['effect'], string> = {
  vocoder: 'Vocoder', autotune: 'Auto-Tune', harmonizer: 'Harmonizer', pitch: 'Pitch Shift', talkbox: 'Talk Box', robot: 'Robot', whisper: 'Whisper / Breathy',
};
const VOICE_NAMES: Record<(typeof HARMONY_VOICES)[number], string> = { third: '3rd', fifth: '5th', octave_up: 'Octave Up', octave_down: 'Octave Down' };

/** A labelled slider whose value is shown beside it. */
function Slider(p: { label: string; min: number; max: number; step: number; value: number; unit?: string; name: string; onChange(v: number): void }) {
  return (
    <label class="grid grid-cols-[7.5rem_1fr_3.5rem] items-center gap-2 text-sm">
      <span>{p.label}</span>
      <input type="range" min={p.min} max={p.max} step={p.step} value={p.value} data-fx={p.name} class="min-h-11 w-full min-w-0 accent-amber"
        onChange={e => p.onChange(Number((e.target as HTMLInputElement).value))} />
      <span class="text-right font-mono text-xs text-dim">{`${Math.round(p.value * 100) / 100}${p.unit ?? ''}`}</span>
    </label>
  );
}

const h3 = 'font-display text-sm font-semibold tracking-wide uppercase';

function VoiceSettings(p: { fx: VoiceFx; others: SoundPanelProps['others']; onChange(fx: VoiceFx): void }) {
  const fx = p.fx;
  const set = (change: Partial<VoiceFx>) => p.onChange({ ...fx, ...change } as VoiceFx);
  switch (fx.effect) {
    case 'vocoder':
    case 'talkbox':
      return (
        <div class="grid gap-2">
          <label class="flex flex-wrap items-center gap-2 text-sm">Carrier Part
            <select class="min-h-11 rounded-md border border-rule bg-well px-2 text-ink" data-carrier="" onChange={e => set({ carrier: (e.target as HTMLSelectElement).value })}>
              {p.others.map(o => <option value={o.id} selected={o.id === fx.carrier}>{o.name}</option>)}
            </select></label>
          {fx.effect === 'vocoder'
            ? <Slider label="Bands" name="bands" min={8} max={32} step={1} value={fx.bands} onChange={v => set({ bands: v })} />
            : <Slider label="Mix" name="mix" min={0} max={1} step={0.05} value={fx.mix} onChange={v => set({ mix: v })} />}
        </div>
      );
    case 'autotune':
      return (
        <div class="grid gap-2">
          <Slider label="Strength" name="strength" min={0} max={1} step={0.05} value={fx.strength} onChange={v => set({ strength: v })} />
          <p class="font-mono text-xs text-dim">{fx.strength < 0.34 ? 'Natural' : fx.strength < 0.8 ? 'Firm' : 'Hard (the robotic sound)'}</p>
          <Slider label="Retune Speed" name="retune" min={0} max={400} step={10} value={fx.retune_ms} unit=" ms" onChange={v => set({ retune_ms: v })} />
        </div>
      );
    case 'harmonizer':
      return (
        <div class="grid gap-2">
          <div class="flex flex-wrap gap-2">
            {HARMONY_VOICES.map(v => {
              const on = fx.voices.includes(v);
              return <Button pressed={on} disabled={!on && fx.voices.length >= 3} onClick={() => {
                const next = on ? fx.voices.filter(x => x !== v) : [...fx.voices, v];
                if (next.length) set({ voices: next });
              }}>{VOICE_NAMES[v]}</Button>;
            })}
          </div>
          <Slider label="Mix" name="mix" min={0} max={1} step={0.05} value={fx.mix} onChange={v => set({ mix: v })} />
        </div>
      );
    case 'pitch':
      return (
        <div class="grid gap-2">
          <Slider label="Semitones" name="semitones" min={-12} max={12} step={1} value={fx.semitones} onChange={v => set({ semitones: v })} />
          <Slider label="Formant" name="formant" min={-12} max={12} step={1} value={fx.formant} onChange={v => set({ formant: v })} />
        </div>
      );
    default:
      return <Slider label="Mix" name="mix" min={0} max={1} step={0.05} value={fx.mix} onChange={v => set({ mix: v } as Partial<VoiceFx>)} />;
  }
}

export function SoundPanel(p: SoundPanelProps) {
  const Help = (q: { children: string }) => (p.help ? <p class="border-l-2 border-amber pl-2 text-sm text-dim">{q.children}</p> : null);
  const fx = p.part.fx ?? {};
  const chain = p.part.voice ?? [];
  const [adding, setAdding] = useState<VoiceFx['effect']>('autotune');
  const [live, setLive] = useState<LiveVoice | null>(null);
  const [liveNote, setLiveNote] = useState('');
  const liveRef = useRef<LiveVoice | null>(null);
  liveRef.current = live;
  const stopLive = () => { liveRef.current?.stop(); setLive(null); setLiveNote(''); };
  // The microphone is let go when the part changes, the panel goes, or the page is hidden.
  useEffect(() => stopLive, [p.part.id]);
  useEffect(() => {
    const hide = () => { if (document.visibilityState === 'hidden') stopLive(); };
    document.addEventListener('visibilitychange', hide);
    return () => document.removeEventListener('visibilitychange', hide);
  }, []);
  const tryLive = async () => {
    if (!p.live) return;
    stopLive();
    try {
      setLive(await p.live(chain));
      setLiveNote('Listening: sing, and hear it through the chain. Use headphones so the speakers do not feed back.');
    } catch {
      setLiveNote('The microphone could not be opened. Allow it in the browser to try the chain live.');
    }
  };
  const mix = p.mix;
  const room = mix.room ?? { preset: 'dry' as const, amount: 0.4 };
  const carrier = p.others[0]?.id ?? '';
  const needsCarrier = (e: VoiceFx['effect']) => e === 'vocoder' || e === 'talkbox';
  const saves = { fx: p.part.fx ?? null, voice: p.part.voice ?? null, mix };
  return (
    <Panel title="Sound">
      <div class="grid gap-4" data-sound-panel="">
        <section class="grid gap-2" aria-label="This Part">
          <h3 class={h3}>This Part</h3>
          <Slider label="Volume" name="volume" min={-30} max={12} step={1} unit=" dB" value={fx.volume_db ?? FX_DEFAULTS.volume_db} onChange={v => p.onFx(f => ({ ...f, volume_db: v }))} />
          <Slider label="Left / Right" name="pan" min={-1} max={1} step={0.1} value={fx.pan ?? 0} onChange={v => p.onFx(f => ({ ...f, pan: v }))} />
          <Slider label="Bass" name="bass" min={-12} max={12} step={1} unit=" dB" value={fx.eq?.bass ?? 0} onChange={v => p.onFx(f => ({ ...f, eq: { ...f.eq, bass: v } }))} />
          <Slider label="Middle" name="middle" min={-12} max={12} step={1} unit=" dB" value={fx.eq?.middle ?? 0} onChange={v => p.onFx(f => ({ ...f, eq: { ...f.eq, middle: v } }))} />
          <Slider label="Treble" name="treble" min={-12} max={12} step={1} unit=" dB" value={fx.eq?.treble ?? 0} onChange={v => p.onFx(f => ({ ...f, eq: { ...f.eq, treble: v } }))} />
          <Slider label="Echo Amount" name="echo" min={0} max={1} step={0.05} value={fx.echo?.amount ?? 0} onChange={v => p.onFx(f => ({ ...f, echo: { ...f.echo, amount: v } }))} />
          <Slider label="Echo Repeats" name="repeats" min={1} max={8} step={1} value={fx.echo?.repeats ?? FX_DEFAULTS.repeats} onChange={v => p.onFx(f => ({ ...f, echo: { ...f.echo, repeats: v } }))} />
          <Slider label="Shimmer" name="shimmer" min={0} max={1} step={0.05} value={fx.shimmer ?? 0} onChange={v => p.onFx(f => ({ ...f, shimmer: v }))} />
          <Slider label="Warmth" name="warmth" min={0} max={1} step={0.05} value={fx.warmth ?? 0} onChange={v => p.onFx(f => ({ ...f, warmth: v }))} />
          <Slider label="Brightness" name="brightness" min={0} max={1} step={0.05} value={fx.brightness?.cutoff ?? 1} onChange={v => p.onFx(f => ({ ...f, brightness: { ...f.brightness, cutoff: v } }))} />
          <div class="flex flex-wrap items-center gap-2"><span class="w-28 text-sm">Sweep</span>
            {SWEEPS.map(s => <Button pressed={(fx.brightness?.sweep ?? 'off') === s} onClick={() => p.onFx(f => ({ ...f, brightness: { ...f.brightness, sweep: s } }))}>{SWEEP_NAMES[s]}</Button>)}</div>
          <Slider label="Even Out Loud And Soft" name="even-out" min={0} max={1} step={0.05} value={fx.even_out ?? 0} onChange={v => p.onFx(f => ({ ...f, even_out: v }))} />
          <Slider label="Room" name="room-send" min={0} max={1} step={0.05} value={fx.room ?? FX_DEFAULTS.room} onChange={v => p.onFx(f => ({ ...f, room: v }))} />
          <div class="flex flex-wrap gap-2">
            <Button pressed={!!fx.mute} onClick={() => p.onFx(f => ({ ...f, mute: !f.mute }))} data={{ 'data-mute': '' }}>{fx.mute ? 'Muted' : 'Mute'}</Button>
            <Button pressed={!!fx.solo} onClick={() => p.onFx(f => ({ ...f, solo: !f.solo }))} data={{ 'data-solo': '' }}>{fx.solo ? 'Soloed' : 'Solo'}</Button>
          </div>
          <Help>Left / Right places the part in the stereo picture. Bass, Middle and Treble lift or cut those ranges. Echo repeats the part a beat later. Shimmer is a chorus, Warmth a gentle drive, Brightness a filter that Sweep moves slowly or quickly. Even Out Loud And Soft is a compressor. Room sends the part into the piece's room. Mute silences the part; Solo plays only the soloed parts.</Help>
        </section>

        <section class="grid gap-2" aria-label="Voice Effects">
          <h3 class={h3}>Voice Effects</h3>
          <ol class="grid gap-2" data-voice-chain="">
            {chain.map((v, i) => (
              <li class="grid gap-2 rounded-md border border-rule p-2" data-voice-fx={v.effect}>
                <div class="flex flex-wrap items-center gap-2"><span class="font-semibold">{`${i + 1} · ${EFFECT_NAMES[v.effect]}`}</span>
                  <Button variant="ghost" onClick={() => p.onVoice(chain.filter((_, j) => j !== i))}>Remove</Button></div>
                <VoiceSettings fx={v} others={p.others} onChange={next => p.onVoice(chain.map((x, j) => (j === i ? next : x)))} />
              </li>
            ))}
          </ol>
          <div class="flex flex-wrap items-center gap-2">
            <select class="min-h-11 rounded-md border border-rule bg-well px-2 text-ink" aria-label="Effect to add" data-voice-pick=""
              onChange={e => setAdding((e.target as HTMLSelectElement).value as VoiceFx['effect'])}>
              {VOICE_EFFECTS.map(v => <option value={v} selected={v === adding} disabled={needsCarrier(v) && !carrier}>{EFFECT_NAMES[v]}</option>)}
            </select>
            <Button onClick={() => p.onVoice([...chain, newVoiceFx(adding, carrier)])} disabled={chain.length >= MAX_VOICE_FX || (needsCarrier(adding) && !carrier)}
              data={{ 'data-voice-add': '' }}>Add Effect</Button>
            {p.live ? (live
              ? <Button variant="record" onClick={stopLive} data={{ 'data-live-stop': '' }}>Stop The Mic</Button>
              : <Button onClick={() => void tryLive()} disabled={chain.length === 0} data={{ 'data-live-try': '' }}>Try It With The Mic</Button>) : null}
          </div>
          <p class="text-sm text-dim" data-live-note="">{liveNote}</p>
          <Help>Voice Effects shape this part as a voice, up to four in order: Auto-Tune pulls notes onto the key (Natural to Hard), Harmonizer adds 3rds, 5ths or octaves, Pitch Shift moves the voice and Formant keeps it from sounding sped up, Vocoder and Talk Box make another part sing with this one's shape, Robot and Whisper change its character. Try It With The Mic plays your voice through the chain in this page only; nothing is recorded.</Help>
        </section>

        <section class="grid gap-2" aria-label="The Whole Piece">
          <h3 class={h3}>The Whole Piece</h3>
          <div class="flex flex-wrap gap-2" data-room="">
            {ROOMS.map(r => <Button pressed={room.preset === r && !!mix.room === (r !== 'dry')} onClick={() => p.onMix(m => ({ ...m, room: { preset: r, amount: room.amount } }))}
              data={{ 'data-room-preset': r }}>{ROOM_NAMES[r]}</Button>)}
          </div>
          {mix.room ? <Slider label="Room Amount" name="room" min={0.05} max={1} step={0.05} value={room.amount} onChange={v => p.onMix(m => ({ ...m, room: { preset: room.preset, amount: v } }))} /> : null}
          <div class="flex flex-wrap items-center gap-2">
            <Button pressed={!!mix.limiter?.on} onClick={() => p.onMix(m => ({ ...m, limiter: { on: !m.limiter?.on, ceiling_db: m.limiter?.ceiling_db ?? -1 } }))}
              data={{ 'data-limiter': '' }}>{`Limiter: ${mix.limiter?.on ? 'On' : 'Off'}`}</Button>
          </div>
          {mix.limiter?.on ? <Slider label="Ceiling" name="ceiling" min={-12} max={0} step={0.5} unit=" dB" value={mix.limiter.ceiling_db} onChange={v => p.onMix(m => ({ ...m, limiter: { on: true, ceiling_db: v } }))} /> : null}
          <Slider label="Overall Loudness" name="loudness" min={-30} max={-10} step={1} unit=" LUFS" value={mix.loudness} onChange={v => p.onMix(m => ({ ...m, loudness: v }))} />
          <Help>The Room is the space the whole piece plays in, from Dry to a Cave. The limiter catches the loudest moments so nothing distorts. Overall Loudness sets how loud the finished piece is.</Help>
          <details class="text-sm"><summary class="cursor-pointer font-semibold">What The Score Saves</summary>
            <pre class="mt-2 max-h-64 overflow-auto rounded-md bg-well p-2 font-mono text-xs" data-score-saves="">{JSON.stringify(saves, null, 1)}</pre>
          </details>
        </section>
      </div>
    </Panel>
  );
}
