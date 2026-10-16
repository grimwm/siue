/* Cylon Defense: the music bed's voices.
 *
 * The four sounds the bed is built from, each scheduled at an absolute context
 * time on the node it is handed, through the kit's tone, noise and voice. */

import type { AudioCore } from '../../_kit/audio/core.ts';

export function pulseTaiko(core: AudioCore, master: AudioNode, when: number, gain = 0.09): void {
  // The body: a sine falling from 85 Hz through a lowpass that closes from 200 to 55.
  core.tone({
    at: when, freq: 85, slideTo: 32, slideDur: 0.5, dur: 0.85, stopPad: 0.05, type: 'sine', vol: gain, attack: 0.015,
    filter: { type: 'lowpass', freq: 200, slideTo: 55, slideDur: 0.45 }
  }, master);
  // The thump under it.
  core.tone({
    at: when, freq: 52, slideTo: 24, slideDur: 0.4, dur: 0.55, stopPad: 0.05, type: 'triangle', vol: gain * 0.75, attack: 0.02
  }, master);
}

export function pulseRitualHit(core: AudioCore, master: AudioNode, when: number, gain = 0.035): void {
  core.noise({
    at: when, dur: 0.18, vol: gain, source: 'fade', fadePower: 1.4, filterType: 'bandpass', filterFreq: 380, filterQ: 0.7
  }, master);
}

export function playDarkHorn(core: AudioCore, master: AudioNode, when: number, freq: number, dur = 3.2, gain = 0.04): void {
  const attack = Math.min(1.1, dur * 0.35);
  core.voice({
    at: when,
    oscs: [
      { type: 'sawtooth', freq },
      { type: 'triangle', freq: freq * 1.498 }, // fifth
      { type: 'sine', freq: freq * 0.5 }
    ],
    filter: { type: 'lowpass', freq: 480, slideTo: 280, slideDur: dur, slide: 'linear' },
    envelope: [
      { ramp: 'linear', to: gain, at: attack },
      { ramp: 'linear', to: gain * 0.7, at: dur * 0.7 },
      { ramp: 'exp', to: 0.0001, at: dur }
    ],
    dur,
    stopPad: 0.05
  }, master);
}

export function playTensionStrand(core: AudioCore, master: AudioNode, when: number, freq: number, dur = 4, gain = 0.012): void {
  core.voice({
    at: when,
    // Slight beating dissonance
    oscs: [
      { type: 'triangle', freq },
      { type: 'sine', freq: freq * 1.02 }
    ],
    envelope: [
      { ramp: 'linear', to: gain, at: 1.5 },
      { ramp: 'linear', to: gain * 0.5, at: dur * 0.8 },
      { ramp: 'exp', to: 0.0001, at: dur }
    ],
    dur,
    stopPad: 0.05
  }, master);
}
