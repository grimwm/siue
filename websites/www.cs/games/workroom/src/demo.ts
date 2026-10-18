// The guide's built-in sounds, for the parts the piece's own audio cannot
// show: counted clicks (two bars of four, the first beat stronger), evenly spaced
// unaccented ticks, a pair of notes going up then the same pair going down, and one note from soft to
// loud, plus the scheduling of a demo on an audio context (given as a small
// structural interface, so a stub can stand in for it). DOM-free.
export type DemoId = 'clicks' | 'ticks' | 'updown' | 'swell';
/** volTo, when set, makes the tone's gain ramp linearly from vol to volTo over dur. */
export interface DemoTone { at: number; freq: number; dur: number; vol: number; volTo?: number; wave: 'sine' | 'triangle' | 'square' }

const midi = (n: number): number => 440 * 2 ** ((n - 69) / 12);

export const DEMOS: Readonly<Record<DemoId, readonly DemoTone[]>> = {
  clicks: Array.from({ length: 8 }, (_, k): DemoTone => ({ at: k * 0.5, freq: k % 4 === 0 ? 1600 : 1000, dur: 0.06, vol: k % 4 === 0 ? 0.18 : 0.1, wave: 'square' })),
  ticks: Array.from({ length: 8 }, (_, k): DemoTone => ({ at: k * 0.25, freq: 1000, dur: 0.05, vol: 0.12, wave: 'square' })),
  updown: [
    { at: 0, freq: midi(60), dur: 0.5, vol: 0.2, wave: 'triangle' },
    { at: 0.6, freq: midi(67), dur: 0.5, vol: 0.2, wave: 'triangle' },
    { at: 1.5, freq: midi(67), dur: 0.5, vol: 0.2, wave: 'triangle' },
    { at: 2.1, freq: midi(60), dur: 0.5, vol: 0.2, wave: 'triangle' },
  ],
  swell: [{ at: 0, freq: midi(57), dur: 3.5, vol: 0.02, volTo: 0.28, wave: 'triangle' }],
};

/** Seconds from the first tone's start to the last tone's end. */
export function demoLength(id: DemoId): number {
  return Math.max(...DEMOS[id].map(t => t.at + t.dur));
}

/** The part of an audio context a demo needs. A browser AudioContext satisfies it. */
export interface DemoParam {
  readonly value: number;
  setValueAtTime(value: number, at: number): unknown;
  linearRampToValueAtTime(value: number, at: number): unknown;
  cancelScheduledValues(at: number): unknown;
}
export interface DemoNode { connect(to: DemoNode): unknown }
export interface DemoOscillator extends DemoNode { type: string; frequency: { value: number }; start(at: number): void; stop(at: number): void }
export interface DemoGain extends DemoNode { gain: DemoParam }
export interface DemoContext {
  readonly destination: DemoNode;
  readonly currentTime: number;
  createOscillator(): DemoOscillator;
  createGain(): DemoGain;
}

const EDGE = 0.005;
/** How long stop() takes to fade everything out. */
export const STOP_FADE = 0.03;

export interface DemoRun { end: number; stop(): void }

/** Schedules every tone of a demo to begin `startAt` (context seconds), each with a short fade in and out so it never clicks. `end` is the context time the demo finishes; stop() fades every gain to 0 within STOP_FADE and stops the oscillators. */
export function scheduleDemo(ctx: DemoContext, id: DemoId, startAt: number): DemoRun {
  const voices: { osc: DemoOscillator; gain: DemoGain }[] = [];
  for (const t of DEMOS[id]) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const on = startAt + t.at;
    const off = on + t.dur;
    osc.type = t.wave;
    osc.frequency.value = t.freq;
    gain.gain.setValueAtTime(0, on);
    gain.gain.linearRampToValueAtTime(t.vol, on + EDGE);
    gain.gain.setValueAtTime(t.vol, on + EDGE);
    if (t.volTo !== undefined) gain.gain.linearRampToValueAtTime(t.volTo, off - EDGE);
    else gain.gain.setValueAtTime(t.vol, off - EDGE);
    gain.gain.linearRampToValueAtTime(0, off);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(on);
    osc.stop(off);
    voices.push({ osc, gain });
  }
  return {
    end: startAt + demoLength(id),
    stop() {
      const now = ctx.currentTime;
      for (const v of voices) {
        v.gain.gain.cancelScheduledValues(now);
        v.gain.gain.setValueAtTime(v.gain.gain.value, now);
        v.gain.gain.linearRampToValueAtTime(0, now + STOP_FADE);
        v.osc.stop(now + STOP_FADE);
      }
    },
  };
}
