# Composer 4d: Keyboards, Hum and Play Along Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Plugged-in MIDI keyboards and drum pads, Hum (microphone, demo hum, uploaded recording) with three snaps and three placements, and Play Along, all writing into the editor's one piano roll.

**Architecture:** Three new DOM-free modules carry the logic, each with node:test units: `compose/midiin.ts` (MIDI messages, the sustain pedal, devices, program changes, General MIDI drum names), `compose/pitch.ts` (a YIN pitch tracker, batch and streaming, which Auto-Tune in 4e reuses) and `compose/hum.ts` (a pitch track into note segments, the three snaps, the three placements). `compose/live.ts` gains a beat clock, so Play Along's notes land on the piece's own beats. `Composer.tsx` wires these to Web MIDI, the microphone (MediaRecorder, then decoding in the page), a Hum tab and a Play Along button. `EditGrid` draws the other parts as outlines and the hum's dashed line.

**Tech Stack:** TypeScript, Preact, Web MIDI, Web Audio (MediaRecorder, decodeAudioData), node:test, Playwright (`make music-e2e E2E_ARGS=compose.local.ts`).

**Spec:** `docs/superpowers/specs/2026-10-31-composer-editor-design.md` (One piano roll, four ways in; Plugged-in keyboards and drum pads; Phases, item 4).

## Global Constraints

- Web MIDI is requested only when the person turns on Your Keyboard, with `{ sysex: false }`; SysEx is never used.
- The page sends to a MIDI output only when the person picks it, and sends program changes and nothing else.
- Safari, or any browser without `navigator.requestMIDIAccess`, says so plainly, and every other way in keeps working.
- The microphone is requested only when Record With Mic is tapped. Every track stops when recording stops, fails or is cancelled, and when the page is left. Audio never leaves the page.
- A denied permission (MIDI or microphone) says why plainly, and every on-screen way in keeps working.
- Velocity sets loudness. The sustain pedal (CC64, value 64 or above is down) holds a note until the pedal is released. Channel 10 is drums, named the General MIDI way.
- Hum snaps: Friendly Notes (the piece's key; the default), All 12 Notes, Exact Pitch. Placements: After The Part (the default), Replace The Part, At The Dashed Line.
- Exact Pitch's bends are not stored until 4e (schema 2). In 4d a note keeps its nearest semitone in the saved score; the bend is shown while editing.
- The page never moves while any key, pad or held (sustained) note is down.
- UI labels are in Title Case. Sentences are in sentence case.

## Review Focus

1. **A pedal held through a key's release, then the key pressed again.** The old note ends at the new press, and a new note starts. Nothing sticks on. (Test: `midiin.test.ts` "a key pressed again under the pedal ends its old note".)
2. **A hum with a held vibrato or a slow glide.** It stays one note; it is not split into a run of short notes. (Test: `hum.test.ts` "a vibrato and a glide stay one note each".)
3. **Silence, noise or a very quiet recording.** No notes, and a plain message. (Test: `hum.test.ts` "silence and noise make no notes".)
4. **The microphone refused, or a browser without MediaRecorder.** A plain message; the tracks are stopped. (e2e: the denied path in `compose.local.ts`.)
5. **A MIDI device unplugged while a key is held.** Its held notes end, and the page is unpinned. (Test: `midiin.test.ts` "a device's keys all end when it goes away".)

---

### Task 1: MIDI input (`compose/midiin.ts`)

**Files:** Create `games/workroom/src/compose/midiin.ts`, `games/workroom/test/midiin.test.ts`.

**Interfaces (Produces):**
- `parseMidi(data: ArrayLike<number>): MidiMessage | null`, where `MidiMessage = { kind: 'on'; channel: number; pitch: number; velocity: number } | { kind: 'off'; channel: number; pitch: number } | { kind: 'sustain'; channel: number; down: boolean }`. A note-on with velocity 0 is an off. Channels count from 1.
- `createMidiKeys(out: { down(key: string, pitch: number, velocity: number, drum: boolean): void; up(key: string): void }): { message(device: string, m: MidiMessage): void; lost(device: string): void; pedal(): boolean }`. Keys are `midi:<device>:<channel>:<pitch>`.
- `deviceLabel(name: string | null, manufacturer: string | null): string`.
- `programChange(gm: number, channel?: number): number[]` (`[0xC0 | ch-1, gm-1]`).
- `GM_DRUMS: Readonly<Record<number, string>>` (35–81), `drumName(pitch): string`.

- [ ] Write tests:
  - parse on/off/velocity-0 off/CC64 down/up/other CC → null;
  - pedal holds: an off under the pedal is deferred, and pedal up ends it;
  - a key pressed again under the pedal ends its old note first;
  - channel 10 is drums;
  - `lost(device)` ends that device's keys and clears the pedal;
  - labels: "Yamaha P-125" from name "P-125" plus manufacturer "Yamaha", and a name already holding the manufacturer is not doubled;
  - `programChange(41)` is `[0xC0, 40]`;
  - `drumName(38)` is "Acoustic Snare".
- [ ] Run, fail; implement; run, pass; commit.

### Task 2: Pitch tracker (`compose/pitch.ts`)

**Files:** Create `games/workroom/src/compose/pitch.ts`, `games/workroom/test/pitch.test.ts`.

**Interfaces (Produces):**
- `PitchFrame = { t: number; hz: number | null; clarity: number; rms: number }`.
- `detectPitch(frame: Float32Array, rate: number, o?: { minHz?: number; maxHz?: number; threshold?: number }): { hz: number; clarity: number } | null` (YIN with parabolic interpolation; defaults 65–1100 Hz, threshold 0.15).
- `createPitchTracker(rate: number, o?: { frame?: number; hop?: number; quiet?: number }): { push(samples: Float32Array): PitchFrame[]; }` (frame 2048, hop 256, frames below `quiet` rms (default 0.005) are unvoiced; `end()` reads the last samples).
- `trackPitch(samples: Float32Array, rate: number): PitchFrame[]`.
- `midiOf(hz: number): number` (fractional; 440 Hz is 69).

- [ ] Write tests:
  - sines at 110, 220, 261.63, 440 and 880 Hz at 44.1 and 48 kHz are within 5 cents;
  - a harmonic-rich tone (a sawtooth's first 8 partials) at 196 Hz is not an octave off;
  - silence and white noise give `hz: null`;
  - the streaming tracker, fed in odd-sized chunks, gives the same frames as `trackPitch`;
  - a 5.5 Hz ±40-cent vibrato on A4 tracks within 10 cents of the true curve.
- [ ] Run, fail; implement; run, pass; commit.

### Task 3: Hum into notes (`compose/hum.ts`)

**Files:** Create `games/workroom/src/compose/hum.ts`, `games/workroom/test/hum.test.ts`.

**Interfaces:**
- Consumes `PitchFrame` and `midiOf` (Task 2), `inferFifths` (toxml.ts), and `snapStart` and `gridBeats` (snap.ts).
- Produces:
  - `HumSnap = 'friendly' | 'all12' | 'exact'`, `HumPlace = 'after' | 'replace' | 'line'`;
  - `HumSegment = { start: number; end: number; curve: [number, number][] }` (seconds; curve points are time and fractional MIDI);
  - `segmentHum(frames: PitchFrame[]): HumSegment[]`;
  - `keyScale(pitches: readonly number[]): { fifths: number; name: string; classes: number[] }` (C major with no notes);
  - `snapSegment(seg, snap, classes): { pitch: number; bend: [number, number][] | null }`;
  - `humNotes(segs, o: { snap; classes; startBeat; bpm; tidy: Grid; quarter }): NewNote[]` (velocity 90);
  - `humDemo(rate: number): Float32Array` (a hummed phrase: D4 E4 F#4 with a glide into A4 and a vibrato).

- [ ] Write tests:
  - three held tones with gaps make three segments with the right starts and ends (±30 ms);
  - a vibrato and a glide stay one note each;
  - silence and noise make no notes;
  - segments shorter than 80 ms are dropped;
  - Friendly snaps 61.4 to 62 in C major (C♯ is not in C) and to 61 in D major;
  - All 12 rounds;
  - Exact keeps the nearest semitone and a bend in cents relative to it;
  - at 60 BPM, a segment at 1.0–2.0 s is one beat at `startBeat` + 1;
  - the demo's notes, with All 12, are 62 64 66 69.
- [ ] Run, fail; implement; run, pass; commit.

### Task 4: Play Along's clock (`compose/live.ts`)

**Files:** Modify `games/workroom/src/compose/live.ts`, `games/workroom/test/compose-live.test.ts`.

**Interfaces (Produces):** `createLiveTake(o: { startBeat; bpm; beatsPerBar; beatOf?: (t: number) => number })`. With `beatOf`, times are the piece's own seconds: a start is `beatOf(chordAt)` and a length is `beatOf(up) - beatOf(down)`, both tidied as before. `startBeat` is ignored.

- [ ] Test: with a tempo change at bar 2 (60, then 120 BPM), a key at piece-second 4.25 held for 0.5 s lands at beat 4.5 with length 1. Run, fail, implement, pass, commit.

### Task 5: The editor (Composer, EditGrid, mount)

**Files:** Modify:
- `src/ui/compose/Composer.tsx`, `src/ui/compose/EditGrid.tsx`, `src/ui/compose/mount.ts`;
- `src/compose/step.ts`: the chord gather keeps the loudest velocity per pitch.

Create `src/ui/compose/YourKeyboard.tsx`, `src/ui/compose/HumPanel.tsx`.

**Interfaces:**
- `ComposerProps` gains `midi?: () => Promise<MIDIAccess>` (absent: no Web MIDI), `mic?: MicPorts`, and `decode(bytes: ArrayBuffer): Promise<{ samples: Float32Array; rate: number }>`.
- `MicPorts = { record(maxSeconds: number, level: (rms: number) => void): Promise<{ stop(): Promise<{ samples; rate }>; cancel(): void }> }`.
- EditGrid gains `ghosts: readonly { start; length; pitch; color }[]`, `line: number | null` and `onLine(beat)`.

**Behaviour:**
- **Your Keyboard: Off/On.**
  - Choose Device (All Devices, or one input).
  - Sends GM To: None, or an output. A program change goes out when an output is picked and when the part's instrument changes.
  - Sustain Pedal: Up/Down.
  - Last note readout ("D4 · Velocity 96", or "Acoustic Snare · Pad 38").
  - The Studio Sounds note.
  - Channel 10 notes play into the selected part when it is a drum part; otherwise they are not recorded, and the status names the drum part to choose (or says to add one).
- **Velocity** reaches Play Live, Step (the gather) and the sampler.
- **Hum tab:**
  - ● Record With Mic / Stop, Play The Demo Hum, Upload A Recording (`accept="audio/*"`, 30 MB, decoded in the page).
  - Hum Snaps To, Where Hummed Notes Go, and Tidy To.
  - The three stages (1 · Your Voice, 2 · Snap To Notes, 3 · Note Blocks) as SVG.
  - Add To The Part (one Undo step).
  - At The Dashed Line shows a draggable line on the grid, starting at the end of the part.
  - Recording is limited to 60 seconds.
- **Play Along** (in Play Live):
  - Hear The Other Parts: On/Off.
  - A one-bar count-in, then the piece plays (the other parts only, or clicks when they are off), with the playhead.
  - Keys record against the audio's own clock through `beatOf`. It stops at the end of the piece or on Stop, and adds the notes as one Undo step.
  - The other parts show as outlines in Play Live.
- **Scroll pin:** held MIDI keys and sustained notes hold the scroll pin.

- [ ] Typecheck and the unit suite (`units.sh`) pass. Commit.

### Task 6: Browser check and owner page

**Files:** Modify `websites/www.cs/tests/e2e/compose.local.ts`.

- [ ] Add a test with a fake Web MIDI access (an init script) and a fake microphone (`getUserMedia` returning an oscillator's MediaStream playing D4, E4, F♯4).
  - Your Keyboard On names "Yamaha P-125". A velocity-40 note and a velocity-120 note record with those velocities; the pedal holds a note past its key's release; a channel-10 pad 38 lands in a Drum Kit part as Acoustic Snare.
  - Hum: Play The Demo Hum, then All 12, then Add To The Part, which adds the four demo notes after the part. Record With Mic adds three notes. Replace The Part with Undo.
  - Play Along with the other parts off records a note in time.
  - Phone: holding a key under the pedal never moves the page.
- [ ] Run `make music-e2e E2E_ARGS=compose.local.ts`, then rebuild `dist/`, commit, open the PR, run pr-fix-loop and merge on green.
