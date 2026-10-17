// The guide's built-in sounds, for the parts the piece's own audio cannot
// show: counted clicks (two bars of four, the first beat stronger), a pair of
// notes going up then the same pair going down, and one note from soft to
// loud, plus the scheduling of a demo on an audio context (given as a small
// structural interface, so a stub can stand in for it). DOM-free.
export type DemoId = 'clicks' | 'updown' | 'swell';
export interface DemoTone { at: number; freq: number; dur: number; vol: number; wave: 'sine' | 'triangle' | 'square' }

const midi = (n: number): number => 440 * 2 ** ((n - 69) / 12);

export const DEMOS: Readonly<Record<DemoId, readonly DemoTone[]>> = {
  clicks: Array.from({ length: 8 }, (_, k): DemoTone => ({ at: k * 0.5, freq: k % 4 === 0 ? 1600 : 1000, dur: 0.06, vol: k % 4 === 0 ? 0.25 : 0.12, wave: 'square' })),
  updown: [
    { at: 0, freq: midi(60), dur: 0.5, vol: 0.2, wave: 'triangle' },
    { at: 0.6, freq: midi(67), dur: 0.5, vol: 0.2, wave: 'triangle' },
    { at: 1.5, freq: midi(67), dur: 0.5, vol: 0.2, wave: 'triangle' },
    { at: 2.1, freq: midi(60), dur: 0.5, vol: 0.2, wave: 'triangle' },
  ],
  swell: Array.from({ length: 10 }, (_, k): DemoTone => ({ at: k * 0.35, freq: midi(57), dur: 0.3, vol: 0.02 + k * 0.025, wave: 'triangle' })),
};

/** Seconds from the first tone's start to the last tone's end. */
export function demoLength(id: DemoId): number {
  return Math.max(...DEMOS[id].map(t => t.at + t.dur));
}

/** The part of an audio context a demo needs. A browser AudioContext satisfies it. */
export interface DemoParam { setValueAtTime(value: number, at: number): unknown; linearRampToValueAtTime(value: number, at: number): unknown }
export interface DemoNode { connect(to: DemoNode): unknown }
export interface DemoOscillator extends DemoNode { type: string; frequency: { value: number }; start(at: number): void; stop(at: number): void }
export interface DemoGain extends DemoNode { gain: DemoParam }
export interface DemoContext {
  readonly destination: DemoNode;
  createOscillator(): DemoOscillator;
  createGain(): DemoGain;
}

const EDGE = 0.005;

/** Schedules every tone of a demo to begin `startAt` (context seconds) from now, each with a short fade in and out so it never clicks; returns the context time the demo ends. */
export function scheduleDemo(ctx: DemoContext, id: DemoId, startAt: number): number {
  for (const t of DEMOS[id]) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const on = startAt + t.at;
    const off = on + t.dur;
    osc.type = t.wave;
    osc.frequency.value = t.freq;
    gain.gain.setValueAtTime(0, on);
    gain.gain.linearRampToValueAtTime(t.vol, on + EDGE);
    gain.gain.setValueAtTime(t.vol, off - EDGE);
    gain.gain.linearRampToValueAtTime(0, off);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(on);
    osc.stop(off);
  }
  return startAt + demoLength(id);
}
