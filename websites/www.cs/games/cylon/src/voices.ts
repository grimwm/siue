/* Cylon Defense: the music bed's voices.
 *
 * The four sounds the bed is built from, each scheduled at an absolute context
 * time on the node it is handed. */

export function pulseTaiko(ctx: AudioContext, master: AudioNode, when: number, gain = 0.09): void {
  const osc = ctx.createOscillator();
  const thump = ctx.createOscillator();
  const g = ctx.createGain();
  const tg = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(200, when);
  filter.frequency.exponentialRampToValueAtTime(55, when + 0.45);
  osc.type = 'sine';
  thump.type = 'triangle';
  osc.frequency.setValueAtTime(85, when);
  osc.frequency.exponentialRampToValueAtTime(32, when + 0.5);
  thump.frequency.setValueAtTime(52, when);
  thump.frequency.exponentialRampToValueAtTime(24, when + 0.4);
  g.gain.setValueAtTime(0.0001, when);
  g.gain.exponentialRampToValueAtTime(gain, when + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, when + 0.85);
  tg.gain.setValueAtTime(0.0001, when);
  tg.gain.exponentialRampToValueAtTime(gain * 0.75, when + 0.02);
  tg.gain.exponentialRampToValueAtTime(0.0001, when + 0.55);
  osc.connect(filter);
  filter.connect(g);
  g.connect(master);
  thump.connect(tg);
  tg.connect(master);
  osc.start(when);
  thump.start(when);
  osc.stop(when + 0.9);
  thump.stop(when + 0.6);
}

export function pulseRitualHit(ctx: AudioContext, master: AudioNode, when: number, gain = 0.035): void {
  const len = Math.floor(ctx.sampleRate * 0.18);
  const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 1.4);
  const src = ctx.createBufferSource();
  const g = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 380;
  filter.Q.value = 0.7;
  src.buffer = buffer;
  g.gain.setValueAtTime(gain, when);
  g.gain.exponentialRampToValueAtTime(0.0001, when + 0.18);
  src.connect(filter);
  filter.connect(g);
  g.connect(master);
  src.start(when);
  src.stop(when + 0.2);
}

export function playDarkHorn(ctx: AudioContext, master: AudioNode, when: number, freq: number, dur = 3.2, gain = 0.04): void {
  const osc = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const osc3 = ctx.createOscillator();
  const g = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(480, when);
  filter.frequency.linearRampToValueAtTime(280, when + dur);
  osc.type = 'sawtooth';
  osc2.type = 'triangle';
  osc3.type = 'sine';
  osc.frequency.setValueAtTime(freq, when);
  osc2.frequency.setValueAtTime(freq * 1.498, when); // fifth
  osc3.frequency.setValueAtTime(freq * 0.5, when);
  const attack = Math.min(1.1, dur * 0.35);
  g.gain.setValueAtTime(0.0001, when);
  g.gain.linearRampToValueAtTime(gain, when + attack);
  g.gain.linearRampToValueAtTime(gain * 0.7, when + dur * 0.7);
  g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
  osc.connect(filter);
  osc2.connect(filter);
  osc3.connect(filter);
  filter.connect(g);
  g.connect(master);
  osc.start(when);
  osc2.start(when);
  osc3.start(when);
  osc.stop(when + dur + 0.05);
  osc2.stop(when + dur + 0.05);
  osc3.stop(when + dur + 0.05);
}

export function playTensionStrand(ctx: AudioContext, master: AudioNode, when: number, freq: number, dur = 4, gain = 0.012): void {
  const osc = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = 'triangle';
  osc2.type = 'sine';
  // Slight beating dissonance
  osc.frequency.setValueAtTime(freq, when);
  osc2.frequency.setValueAtTime(freq * 1.02, when);
  g.gain.setValueAtTime(0.0001, when);
  g.gain.linearRampToValueAtTime(gain, when + 1.5);
  g.gain.linearRampToValueAtTime(gain * 0.5, when + dur * 0.8);
  g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
  osc.connect(g);
  osc2.connect(g);
  g.connect(master);
  osc.start(when);
  osc2.start(when);
  osc.stop(when + dur + 0.05);
  osc2.stop(when + dur + 0.05);
}
