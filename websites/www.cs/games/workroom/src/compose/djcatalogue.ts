// DJ & Effects' catalogue: the families, each effect's Title Case name, what it does in a sentence, and the one
// control the clip sheet shows for it (a choice or a slider over one of its settings). DOM-free.
import type { FxClipEffect } from '../score.ts';

export type Family = 'turntable' | 'build' | 'rhythm' | 'colour' | 'time' | 'voice' | 'live';
export const FAMILIES: readonly { id: Family; name: string; blurb: string }[] = [
  { id: 'turntable', name: 'Turntable', blurb: 'Moves the record itself: grab it, throw it backwards, cut the motor.' },
  { id: 'build', name: 'Build-Up and Drop', blurb: 'Tension before a big moment, and the hit when it lands.' },
  { id: 'rhythm', name: 'Rhythm', blurb: 'Chops and pulses locked to the beat.' },
  { id: 'colour', name: 'Colour', blurb: 'Changes the character of the sound: old, broken, swirly, metallic.' },
  { id: 'time', name: 'Time and Space', blurb: 'Backwards sound, echoes and movement around your head.' },
  { id: 'voice', name: 'Pitch and Voice', blurb: 'Shift a part, harmonise it, snap it to the key, or turn it into a robot.' },
  { id: 'live', name: 'Live DJ Tools', blurb: 'The tools of DJ Mode, placed by hand: a fader move, a jump to a cue, a loop.' },
];

/** The clip sheet's control: a choice of values, or a slider. */
export type Control =
  | { key: string; label: string; choices: readonly [string, string | number][] }
  | { key: string; label: string; min: number; max: number; step: number; percent?: boolean; unit?: string };

export interface FxInfo { id: FxClipEffect; family: Family; name: string; does: string; control?: Control; bars: number }

const info = (id: FxClipEffect, family: Family, name: string, does: string, bars: number, control?: Control): FxInfo => ({ id, family, name, does, bars, ...(control ? { control } : {}) });
const TIME3: readonly [string, string][] = [['Fast', 'fast'], ['Medium', 'medium'], ['Slow', 'slow']];

/** Every effect, in its family's order; `bars` is how long a tapped-in clip of it is. */
export const EFFECTS: readonly FxInfo[] = [
  info('scratch', 'turntable', 'Scratch', 'Pushes the record forward and back over one sound.', 0.5, { key: 'style', label: 'Style', choices: [['Baby', 'baby'], ['Chirp', 'chirp'], ['Transformer', 'transformer']] }),
  info('spinback', 'turntable', 'Spinback', 'Throws the record backwards so the music whooshes away.', 1, { key: 'throw', label: 'Throw', choices: [['Gentle', 'gentle'], ['Hard', 'hard']] }),
  info('tape_stop', 'turntable', 'Tape Stop', 'The motor switches off and the music slows and sinks until it stops.', 1, { key: 'time', label: 'Stop Time', choices: TIME3 }),
  info('tape_start', 'turntable', 'Tape Start', 'The music starts from a standstill and winds up to speed, landing on the beat.', 1, { key: 'time', label: 'Wind Up', choices: TIME3 }),
  info('vinyl', 'turntable', 'Vinyl Crackle and Wow', 'Old-record crackle and a slow wobble in pitch.', 2, { key: 'age', label: 'Age', min: 0.2, max: 1, step: 0.05, percent: true }),
  info('riser', 'build', 'Riser', 'A hiss and a tone that climb and get louder before something big.', 2, { key: 'climb', label: 'Climb', choices: [['1 Octave', 1], ['2 Octaves', 2], ['3 Octaves', 3]] }),
  info('snare_roll', 'build', 'Snare Roll', 'Snare hits that come faster and louder into the drop.', 2, { key: 'level', label: 'Level', min: 0.3, max: 1, step: 0.05, percent: true }),
  info('filter_sweep', 'build', 'Filter Sweep', 'Thins the music out from the bottom (or dulls it from the top) as it builds.', 2, { key: 'mode', label: 'Sweep', choices: [['Highpass Up', 'highpass_up'], ['Lowpass Down', 'lowpass_down']] }),
  info('impact', 'build', 'Impact', 'A deep hit where the drop lands, or a sound falling away.', 0.25, { key: 'kind', label: 'Kind', choices: [['Impact', 'impact'], ['Downlifter', 'downlifter']] }),
  info('sidechain', 'build', 'Sidechain Pump', 'The music ducks on every beat and swells back: the EDM pump.', 2, { key: 'depth', label: 'Depth', min: 0, max: 1, step: 0.05, percent: true }),
  info('stutter', 'rhythm', 'Stutter', 'Repeats a tiny slice over and over.', 0.25, { key: 'slice', label: 'Slice', choices: [['1/4', 4], ['1/8', 8], ['1/16', 16], ['1/32', 32], ['Roll Down', 0]] }),
  info('trance_gate', 'rhythm', 'Trance Gate', 'Chops the sound on and off in a pattern.', 1, { key: 'pattern', label: 'Pattern', choices: [['Classic', 'classic'], ['Offbeat', 'offbeat'], ['Choppy', 'choppy']] }),
  info('wobble', 'rhythm', 'Wobble', 'A filter that opens and shuts in time: the dubstep wobble.', 1, { key: 'rate', label: 'Wobbles A Beat', min: 1, max: 8, step: 1 }),
  info('tremolo', 'rhythm', 'Tremolo', 'The volume wobbles quickly up and down.', 1, { key: 'rate', label: 'Speed', choices: [['1/8', 4], ['1/16', 8], ['1/16 Triplet', 12]] }),
  info('auto_pan', 'rhythm', 'Auto-Pan', 'The sound swings between the left and right speakers.', 2, { key: 'speed', label: 'Speed', choices: [['1 Bar', 'bar'], ['Half Bar', 'half_bar'], ['1 Beat', 'beat']] }),
  info('bitcrusher', 'colour', 'Bitcrusher', 'Crunches the sound like an old games console.', 1, { key: 'crunch', label: 'Crunch', min: 0.1, max: 1, step: 0.05, percent: true }),
  info('ring_mod', 'colour', 'Ring Mod', 'A metallic, robotic clang.', 1, { key: 'tone', label: 'Tone', min: 60, max: 1500, step: 10, unit: ' Hz' }),
  info('phaser', 'colour', 'Phaser', 'A slow swirl through the sound.', 2, { key: 'speed', label: 'Speed', choices: [['Slow', 'slow'], ['Medium', 'medium'], ['Fast', 'fast']] }),
  info('flanger', 'colour', 'Flanger', 'The jet-plane whoosh.', 2, { key: 'speed', label: 'Sweep', choices: [['Slow', 'slow'], ['Jet', 'jet'], ['Fast', 'fast']] }),
  info('auto_wah', 'colour', 'Auto-Wah', 'A filter that says "wah" as the sound gets louder.', 1, { key: 'sensitivity', label: 'Sensitivity', min: 0, max: 1, step: 0.05, percent: true }),
  info('rotary', 'colour', 'Rotary Speaker', 'A spinning organ speaker.', 2, { key: 'speed', label: 'Speed', choices: [['Slow', 'slow'], ['Fast', 'fast']] }),
  info('echo_out', 'time', 'Echo Out', 'Cuts the music and lets its echoes trail away.', 1, { key: 'time', label: 'Echo', choices: [['Dotted 1/8', 'dotted_eighth'], ['1/4', 'quarter'], ['1/2', 'half']] }),
  info('ping_pong', 'time', 'Ping-Pong Echo', 'Echoes that bounce between the left and right.', 2, { key: 'time', label: 'Echo', choices: [['1/8', 'eighth'], ['Dotted 1/8', 'dotted_eighth'], ['1/4', 'quarter']] }),
  info('reverse', 'time', 'Reverse', 'Plays the sound backwards.', 1, { key: 'length', label: 'Length', choices: [['1 Beat', 'beat'], ['2 Beats', 'two_beats'], ['1 Bar', 'bar']] }),
  info('reverse_reverb', 'time', 'Reverse Reverb', 'A ghostly swell that rises into the next bar.', 1, { key: 'swell', label: 'Swell', choices: [['Short', 'short'], ['Long', 'long']] }),
  info('granular_freeze', 'time', 'Granular Freeze', 'Freezes one moment into a hovering cloud, or stretches it out slowly.', 1, { key: 'mode', label: 'Mode', choices: [['Freeze', 'freeze'], ['Stretch', 'stretch']] }),
  info('wide_8d', 'time', 'Wide / 8D', 'The sound circles round your head (best on headphones).', 4, { key: 'circle', label: 'Circle', choices: [['1 Per 4 Bars', 'four_bars'], ['1 Per 2 Bars', 'two_bars'], ['1 Per Bar', 'bar']] }),
  info('doppler', 'time', 'Doppler Fly-By', 'The sound races past you, higher as it comes and lower as it goes.', 2),
  info('filter', 'colour', 'Filter', 'A low-pass filter: the XY Pad moves its cutoff and resonance.', 1, { key: 'cutoff', label: 'Cutoff', min: 0, max: 1, step: 0.05, percent: true }),
  info('pitch_shift', 'voice', 'Pitch Shift', 'Moves the part up or down without changing its speed.', 2, { key: 'semitones', label: 'Shift', choices: [['Octave Down', -12], ['Down A 4th', -5], ['Up A 5th', 7], ['Octave Up', 12]] }),
  info('harmonizer', 'voice', 'Harmonizer', 'Adds backing voices that follow the key.', 2, { key: 'mix', label: 'Mix', min: 0, max: 1, step: 0.05, percent: true }),
  info('vocoder', 'voice', 'Vocoder', 'Makes another part sing with this part\'s words: the robot choir.', 2, { key: 'bands', label: 'Bands', min: 8, max: 32, step: 1 }),
  info('autotune', 'voice', 'Pitch Correction', 'Snaps the notes to the key, from Natural to Robotic.', 2, { key: 'strength', label: 'Natural To Robotic', min: 0, max: 1, step: 0.05, percent: true }),
  info('crossfader', 'live', 'Crossfader', 'Fades between two groups of parts.', 2),
  info('hot_cue', 'live', 'Hot Cue', 'Jumps back to a bar you marked and plays from there.', 0.5, { key: 'cue_bar', label: 'Cue Bar', min: 1, max: 64, step: 0.25 }),
  info('looper', 'live', 'Looper', 'Loops a bar you heard, on top of the music or alone.', 2),
];

export const fxInfo = (id: FxClipEffect): FxInfo => EFFECTS.find(e => e.id === id)!;

/** What a browser does less well, shown beside the timeline and DJ Mode. */
export const BROWSER_LIMITS: readonly string[] = [
  'A scratch is made from the rendered mix, not a real record.',
  'The vocoder works best on a held part.',
  'Wide / 8D needs headphones.',
];
