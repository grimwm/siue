# Composer editor (music studios, project 4)

The editor is where a studio user writes music of their own in the music workroom, alone or alongside the AI
they connect. They add parts to a piece, enter notes in whichever way suits them, hear the piece at once, see
it as a piano roll or as sheet music, and save it as a new draft in their studio. The approved mockups are the
Composer page (`https://claude.ai/artifact/VhcoGPn94mm1jan8iPU3P5`) and the DJ & Effects page
(`https://claude.ai/artifact/WuAJHb2dTf28itqeF1Zf7T`). Where this document and a mockup differ, this document
holds.

The studios design (`2026-10-29-music-studios-design.md`) still governs accounts, storage, limits, sealing and
the AI connection. The editor stores scores, plus the recorded voice of Vocal Tracks (below), which is the one
exception. The browser renders everything else from the shared sample library: audio, sheet music, the
spectrogram and every effect.

## Who it is for

The users are students writing game music and faculty teaching AI and music. Many of them have never used a DAW
or read notation. Each control says what it does in plain words, and the "Notes On Controls" switch shows a
line of help under each control. Every button, menu, tab and heading is in Title Case ("Save Draft",
"Play Live"); sentences stay in sentence case.

## The editor

### Pieces and parts

- **Where it opens.** The editor opens from a piece's page ("Compose") on that piece's newest draft, or from
  "New Piece" on Your studio.
- **What a part is.** A part is one lane of the score. It holds:
  - one instrument;
  - its notes;
  - its speed;
  - its loudness line;
  - its sound settings.
- **Parts In This Piece** lists every part, with its instrument icon and colour. A part can be added, renamed,
  recoloured or removed.
- **Parts and the score.** The score's limit of 16 lanes holds. A draft written by the AI opens like any other,
  and its lanes are its parts.
- **Listening.** "Hear With The Piece" plays every part. "Hear My Part Alone" plays only the selected part.
  A playhead moves through every view.
- **Saving.** "Save Draft" stores the piece as the next draft of the piece, through the studio session. The page
  says the studio limit's words when a draft would pass the studio limit. Nothing is lost when a save fails: the
  edit stays in the page until it is saved or the person leaves and confirms.
- **Clear** empties the selected part. Clear can be undone like any other edit.

### One piano roll, four ways in

Every entry mode writes into the same piano roll. A note entered one way can be edited in any other way.

- **Play Live.** Play the on-screen keys, a computer keyboard or a plugged-in keyboard.
  - A key held down sets the note's length, the way a real piano does.
  - Recording starts on the first note and stops after one bar of quiet.
  - "Tidy To" sets how start times snap to the beat when recording stops ("quantize"): 1/4, 1/8, 1/16 or Off. A
    held length snaps to the nearest of ¼, ½, ¾, 1, 1½, 2, 3 or 4 beats. With Off, the timing is kept exactly as
    played.
  - A metronome count-in is optional.
- **Step.**
  - Pick a length (Whole, Half, Quarter, Eighth, Sixteenth, each with its note icon, plus Dotted), then a
    pitch. The note goes in at the step cursor, and the cursor moves on by that length.
  - Holding a key sets the length the same way Play Live does.
  - "+ Rest" moves the cursor on without a note. "‹ Back One" takes back the last step.
- **Grid.**
  - Tap an empty cell to add a note of the current length.
  - Drag a note to move it in time or pitch. Drag its right end to change its length.
  - "Line Up To" (1/4, 1/8, 1/16 or Off) is how finely notes snap when they are added, moved or stretched.
- **Hum.**
  - "● Record With Mic" listens to the microphone and turns the voice into notes. "Play The Demo Hum" shows the
    same thing without a microphone. "Upload A Recording" takes an audio file of a hum instead; it is read in the
    page and never uploaded.
  - Hum's pitch tracker is the same one Auto-Tune uses (Voice Effects, below).
  - **The microphone, and where its sound goes.**
    - The browser asks for the microphone only when the person taps Record With Mic, never before.
    - The page stops every microphone track when recording stops, fails or is cancelled, and when the person
      leaves the page.
    - The voice is turned into notes in the page, by Web Audio, and is never uploaded. Only the notes it makes
      enter the score. No audio is kept, sent to the server, or given to the AI or the MCP.
    - If permission is denied, the page says so plainly, and every other way in still works.
  - The screen shows the three stages of a hum: **1 · Your Voice** (the pitch line), **2 · Snap To Notes** and
    **3 · Note Blocks**.
  - Hum snapping has three choices:
    - **Friendly Notes** snaps to the notes of the piece's key, the default;
    - **All 12 Notes** snaps to the nearest semitone;
    - **Exact Pitch** keeps the voice's slides and in-between notes, the way singers such as Freddie Mercury bend
      between notes. Each note keeps its pitch curve as a bend, and the sheet shows it as a glissando or bend mark.
  - **Where Hummed Notes Go:**
    - **After The Part** appends them, the default;
    - **Replace The Part** swaps them in for the part's notes, with undo;
    - **At The Dashed Line** puts them at a dashed line the person drags to any bar.
- **Chords.** Pressing several keys at once (fingers, computer keys or a plugged-in keyboard) records every one
  of them at the same time, in every mode. Step mode adds a chord as one step.
- **Play Along.** The piece plays while the person records a part over it. Their notes land in time with the
  playback. A one-bar count-in comes first. The other parts can be muted while recording.

### Editing

- **Selecting and deleting.** Tap a note once to select it (it rings and is outlined). Tap it again to delete it.
  Press Delete or Backspace to delete the selection. Drag across empty space to select several notes.
- **Undo and Redo.** "↶ Undo" and "↷ Redo" cover every edit, including Clear, an import, a hum, a part's settings
  and the sound settings. The keys are Ctrl/⌘+Z and Ctrl/⌘+Shift+Z. History lasts as long as the page is open.
- **The page never moves under the player.** While any key, pad or note is held, the page never scrolls or jumps:
  - the readout areas have fixed heights;
  - `overflow-anchor: none`;
  - the scroll position is pinned while keys are held.
  This holds on phones, where the keyboard is touched directly.

### Instruments

The instrument picker is grouped by category, each category with its own icon:

| Category | Instruments |
|---|---|
| Strings | Violin, Viola, Cello, Double Bass, Harp, Lyre |
| Woodwinds | Flute, Piccolo, Oboe, Clarinet, Bassoon |
| Brass | Trumpet, French Horn, Trombone, Tuba |
| Keyboards | Piano, Organ, Celesta |
| Pitched Percussion | Timpani, Glockenspiel, Xylophone, Marimba, Vibraphone, Tubular Bells |
| Drums & Percussion | Drum Kit, Orchestral Percussion |
| Voices | Choir (Aahs / Oohs) |

- **What each entry carries:** its normal range and its expert range (as MIDI pitches and in words, such as
  "G3–E7"), its home note, its clef, its written transposition, its General MIDI program and name, and its sample
  source.
- **Written transposition.** Double Bass is written an octave above how it sounds. Clarinet and Trumpet (in B♭)
  are written a major second above, and French Horn (in F) a perfect fifth above. Piccolo, Celesta and Xylophone
  are written an octave below, and Glockenspiel two octaves below. Sheet music shows the written part, and a
  Concert Pitch switch shows how it sounds; exported MusicXML says the transposition so other programs read it
  right.
- **Drums have no high or low notes.** Each row of a drum part's grid is one drum or cymbal, named the General
  MIDI way:
  - Drum Kit: Kick (36), Snare (38), Closed Hi-Hat (42), Open Hi-Hat (46), Low Tom (45), High Tom (50),
    Crash (49) and Ride (51);
  - Orchestral Percussion: Bass Drum (35), Cymbals (57), Triangle (81) and Tambourine (54).
- **Full real ranges.** Every note any of these instruments can play may be entered, and the editor never blocks,
  refuses or moves a note:
  - a note in the normal range is drawn plainly;
  - a note in the expert range only is drawn **amber** ("for experts");
  - a note beyond the expert range is drawn **red** ("out of this instrument's range").
  "Move Them Into Range" is a button the person may choose. It shifts the red notes by octaves and can be undone.
  Nothing moves on its own.
- **Lyre** has its own icon in the picker. The Crete pieces' lyre parts already name the harp, and keep it.
- **Samples.** Every instrument plays recorded samples from the shared library. The samples come from two CC0
  libraries, VSCO-2 CE and the Versilian Community Sample Library (VCSL); the library's README names the source
  and licence of each instrument. Vibraphone, Tubular Bells and the Drum Kit's kick, snare, toms and hi-hats are
  VCSL's own recordings. Where neither library, nor any other CC0 or public-domain set, has the instrument, a
  stand-in plays:

  | Instrument | Stand-in |
  |---|---|
  | Celesta | Glockenspiel's samples, played at the celesta's pitches |
  | Choir | Organ, with a soft attack |
  | Lyre | VCSL's folk harp |
  | Drum Kit's Ride | A suspended cymbal struck with a stick |

  The picker says "Stand-In Sound" on those, with a line saying what plays instead. The score names the
  instrument, not the stand-in, so a later sample replaces the stand-in without touching any score.
- **Every instrument a shipped piece names** is in the library, and a test keeps it so.

### Views

The note area offers **Grid**, **Sheet Music** and **Both**:

- **Grid** is the piano roll.
- **Sheet Music** is the same part engraved live (OpenSheetMusicDisplay, as the Sheet view already uses):
  - in the instrument's clef, with the grand staff for Piano, Organ, Harp and Marimba and a percussion staff for
    drums;
  - with the written transposition;
  - with amber and red notes coloured as on the grid.
- **Both** stacks them, and they scroll together.

On a phone, Both stacks the two views and each keeps a usable height. The whole piece's Full Score and
Continuous views stay on the piece page.

### Speed and loudness

- **The piece's speed** is a tempo line through the piece. At any bar it is Steady, Slow Down, Speed Up or
  Sudden Change, and it starts at a named speed: Slow 66, Walking 92 or Quick 128 BPM, or any BPM.
- **Each part's speed** is one of:
  - **Follow Piece**, the default;
  - **Ratio To Piece**: ½×, ⅔×, 1×, 1½× or 2×, which keeps the part locked to the piece the way DAWs sync
    tracks;
  - **Own BPM**: a fixed speed of its own, which drifts against the piece on purpose.
- **Each part's loudness** is a line of dynamics (Very Soft pp 32, Soft p 48, Fairly Soft mp 64, Fairly Loud
  mf 80, Loud f 100, Very Loud ff 120) that is Steady, Get Louder or Get Softer between marks. A note's own
  velocity scales from the line.

### Plugged-in keyboards and drum pads

- **Web MIDI** works in Chrome, Edge and Firefox. In Safari, which has no Web MIDI, the page says so plainly and
  every other way in still works.
- **Your Keyboard** names the device as the browser reports it (for example "Yamaha P-125").
- **What a device sends.** MIDI carries notes, not sound:
  - each key's velocity sets the note's loudness;
  - the sustain pedal (CC64) holds notes the way a piano does, and a held note's recorded length runs to the
    pedal's release;
  - drum pads on channel 10 become drum notes named the General MIDI way.
- **Permissions and output.**
  - Web MIDI is asked for only when the person turns on Your Keyboard, over HTTPS. The page asks without SysEx,
    and never uses SysEx.
  - A denied or missing permission leaves every on-screen way in working, and says why plainly.
  - The page sends to a device only when the person picks that output. It sends program changes and nothing
    else.
- **Sound comes from Studio Sounds**, the library samples. A device's own built-in sound can be heard through its
  own speakers or headphones, but the page cannot use it or learn its voice's name.
- **Choosing a part's instrument** sends that instrument's General MIDI program to the device, so a General MIDI
  keyboard's own sound matches the part.
- **The on-screen keyboard** ("‹ Lower", "Higher ›") moves by octaves and shows the part's ranges in the same
  amber and red.

### Importing and exporting

- **Import Music File** takes MusicXML (`.musicxml`, `.xml`, compressed `.mxl`) and MIDI (`.mid`, `.midi`). These
  come from MuseScore, Sibelius, Finale, Dorico, Logic, FL Studio, Ableton and others. GarageBand reaches the
  workroom through Logic, since GarageBand itself exports neither format.
- **The preview** comes before anything changes:
  - **Found In &lt;file&gt;** lists each part it found;
  - each part is matched to the nearest instrument in the catalogue, by General MIDI program or by part name, and
    any match can be changed;
  - **What Can't Come Across** lists what the score cannot keep, such as lyrics, a synth patch or ornaments;
  - three buttons: **Add As New Parts**, **Start A New Piece** and **Cancel**.
- **Safe reading.**
  - Import runs in the browser and never uploads the file.
  - MusicXML is parsed with `DOMParser`, which resolves no external entities, DTDs or URLs.
  - An `.mxl` is unzipped in memory and never to disk. The page reads only the file its `META-INF/container.xml`
    names, and refuses absolute paths and `..` segments.
  - Size limits: the file at most 10 MB, an `.mxl` at most 20 MB unzipped.
  - The parsed result must fit the score's limits (16 lanes, 20,000 notes) and finish within 5 seconds.
    Otherwise the page refuses it with a plain reason.
  - Nothing changes until the person confirms the preview. A failed import leaves the piece exactly as it was.
- **Export** gives MusicXML (`.musicxml`) or MIDI (`.mid`) of the piece. MIDI export carries each part's General
  MIDI program and puts drums on channel 10. Exporting is a download from the real site, and needs no studio
  space.

### Sound

The Sound panel is saved as score settings, never as audio.

- **Each part** has:
  - Volume and Pan;
  - three-band EQ (Bass, Middle, Treble);
  - Echo;
  - Shimmer (chorus);
  - Warmth (drive);
  - Brightness (filter cutoff), with a Sweep;
  - Even Out Loud And Soft (compressor);
  - its Room send;
  - Mute and Solo.
- **The Whole Piece** has the Room reverb, with presets Dry, Small Room, Concert Hall, Cathedral and Cave. It also
  has a master limiter, which catches the loudest moments so nothing distorts, and the overall loudness.
- **What The Score Saves** shows the settings as the score keeps them.

### Voice Effects

Voice Effects work on a voice: the microphone live, a Vocal Track (below), or any part used as the voice.

- **Vocoder:** the voice is the modulator and any part is the carrier, with a Bands control.
- **Auto-Tune:** snaps the voice to the piece's key and scale, with Strength from Natural to Hard (the robotic
  sound) and a Retune Speed.
- **Harmonizer:** adds 3rds, 5ths or octaves that follow the piece's key.
- **Pitch Shift** with a Formant control, so a voice can move without sounding sped up.
- **Talk Box**, **Robot** and **Whisper / Breathy**.

A live microphone is heard through these effects in the page only (Play Along, DJ Mode, the Record With Mic
preview), and is never stored. What is saved is the effect and its settings, as score settings. On a Vocal Track,
the effects are applied on playback, so they can be changed later.

### Vocal Tracks

A studio may hold recorded voice: the one thing the editor stores that is not a score.

- **Recording.** "Record A Vocal" records from the microphone in the page, over the piece (a one-bar count-in,
  headphones advised). A track holds clips, which can be lined up with the piece, trimmed, moved and split. Each
  recording is a take, and the person picks the take a clip plays. Each clip has its own volume and fades.
- **The raw voice is kept untouched.** Every effect (Voice Effects, and the Sound panel's EQ, Echo, Room and the
  rest) is applied on playback from score settings, so it can be changed later.
- **On this device first.** A take is saved in the page's own storage (IndexedDB, as PCM or FLAC) and survives a
  reload. Until the person taps "Save To Studio" it is marked "Only On This Device", and nothing is uploaded.
- **Two qualities,** chosen per take, with a default in the studio's settings:
  - **Perfect:** FLAC, lossless, mono at 44.1 or 48 kHz, encoded in the page;
  - **Good To The Ear:** Opus, mono, about 96 kbps (stored as Ogg or WebM Opus). It sounds the same for a voice
    at about a sixth of the size. It is encoded in the page with WebCodecs' AudioEncoder, or with MediaRecorder
    where AudioEncoder is missing.
  The library's rule of lossless audio only is waived just for takes the person saves as Good To The Ear.
- **Choosing before saving.** Save To Studio first shows the take's exact size both ways, encoded for real, and how
  much studio space and how many minutes each would leave. The person then chooses.
- **Freeing space.** A saved Perfect take can be converted to Good To The Ear later. The page says this cannot be
  undone, and never claims to restore the quality.
- **Space.** A non-named person's studio limit is 25 MB, about 8 to 10 minutes of Perfect singing. All non-named
  studios share a total of 20 GB by default, which can be raised at any time in config with no code change. A safety
  floor sits under both: uploads are refused while the host's free disk (`disk_free_space`) would drop below a
  config minimum, 50 GB by default. The studio shows the space and minutes left. A save that would pass the
  person's limit, the shared total or the floor is refused, with a plain message saying how much is needed. The
  admin view shows the total used and the cap, and warns at 80% of the cap.
- **The server checks every take.** Magic bytes (`fLaC`, `OggS`, or WebM's EBML header) only pick the parser. The
  server then parses the container, checks that the codec is FLAC or Opus, and takes the duration from the validated
  frames, never from a header field. It checks the file's size and a decoded-size limit (a config value, like the
  other limits), and refuses anything else.
- **Saving is one step.** Save To Studio sends one draft bundle (SIUED1, through `save-draft.php` with the session
  and CSRF token) that holds `score.json` and every new take the score names. The server checks all of it, then
  commits the draft and its takes together or not at all. A score may name only takes in its own bundle or takes
  its own account already holds.
- **Takes belong to the account.** A take is stored once per account as `vocal-<sha256>.<flac|ogg|webm>`, and drafts
  refer to it, so a new draft of the same piece costs nothing for an unchanged take. A take is deleted, in the same
  step as the change that frees it, once no draft of the account refers to it any more: when a draft rolls off or is
  deleted, a piece is deleted, or the person starts over.
- **Export** carries the vocals at the quality they were saved in.

### DJ & Effects

The DJ & Effects page's effects are the performance side, played on top of the Sound panel. All of them are saved
as score settings, never audio.

- **Families and effects** (Pitch and Voice uses the Voice Effects above):
  - **Turntable:** Scratch, Spinback, Tape Stop, Tape Start, Vinyl Crackle and Wow.
  - **Build-Up and Drop:** Riser, Snare Roll, Filter Sweep, Impact, Sidechain Pump.
  - **Rhythm:** Stutter, Trance Gate, Wobble, Tremolo, Auto-Pan.
  - **Colour:** Bitcrusher, Ring Mod, Phaser, Flanger, Auto-Wah, Rotary Speaker.
  - **Time and Space:** Echo Out, Ping-Pong Echo, Reverse, Reverse Reverb, Granular Freeze, Wide / 8D, Doppler
    Fly-By.
  - **Pitch and Voice:** Pitch Shift, Harmonizer, Vocoder, Pitch Correction.
  - **Live DJ Tools:** Crossfader, Hot Cues, Looper, XY Pad.
- **Way One, Place On The Timeline:**
  - drag an effect onto bars, or tap the effect and then a bar;
  - drag a clip to move it, and drag its right edge to lengthen it;
  - tap a clip to see its bars, hear it from there ("Hear From Here"), make it Shorter or Longer, or Remove it.
- **Way Two, Perform Live (DJ Mode):**
  - Platter: drag to scratch, and let go to carry on in time;
  - Crossfader;
  - Hot Cues;
  - Performance Pads, held to play, with keys 1–4, Q–R, A–F and Z–V;
  - XY Pad;
  - Looper: Record 1 Bar, Layer, Mute Deck, Clear;
  - several fingers at once.
  With **Record To Timeline** on, a performance lands on the timeline as clips with their settings, editable like
  placed clips.
- **What Gets Saved** shows the clips in the score's shape: effect, bars and settings.
- **The deck** plays the piece as it is when DJ Mode gets it ready, and goes round at the end. While it plays, the
  letter and number keys are its pads, not notes.
- **What A Browser Does Less Well** stays visible:
  - a scratch is made from the rendered mix, not a real record;
  - the vocoder works best on a held part;
  - Wide / 8D needs headphones.

## The score

- **Schema 1 as it stands** carries 4a, 4b and 4c. A part is a lane: its `sound.instrument` is the catalogue id,
  its `family` and `icon` come from the catalogue category, and notes keep `start`/`length` in seconds,
  `pitch` and `velocity`.
- **Schema 2** comes with 4e. It adds, all optional, with schema 1 still read:
  - `piece_tempo`: the tempo line, as marks of bar, BPM and shape;
  - `lane.speed`: `follow`, `{ratio}` or `{bpm}`;
  - `lane.dynamics`: marks of bar, level and shape;
  - `note.bend`: the Exact Pitch curve, as time and cents pairs;
  - `lane.fx`: the part's Sound settings;
  - `mix.room`, `mix.limiter`;
  - `fx_clips`: effect, lane or the whole piece, from bar, to bar, and settings; bars are positions to 1/1000 of a
    bar (12.5 is halfway through bar 12), and a recorded move (the platter, the Crossfader, the XY Pad) keeps its
    `points` as [bar, value…] lists. The effects, their settings and defaults are in the 4g plan;
  - `lane.voice`: a Voice Effects chain for a lane that is a voice, at most 4 effects, applied in the order listed.
    Each is one of these, with its settings:
    - `vocoder`: `carrier` (a lane id), `bands` 8–32;
    - `autotune`: `strength` 0–1 (Natural 0, Hard 1), `retune_ms` 0–400;
    - `harmonizer`: `voices` (1–3 of `third`, `fifth`, `octave_up`, `octave_down`), `mix` 0–1;
    - `pitch`: `semitones` −12 to 12, `formant` −12 to 12;
    - `talkbox`: `carrier` (a lane id), `mix` 0–1;
    - `robot`: `mix` 0–1;
    - `whisper`: `mix` 0–1.
- **Vocal Tracks** add a `vocal` lane kind: its clips (the take, where it starts in the piece, trim in and out,
  volume, fades) and its takes, each named by its stored file (`vocal-<sha256>.flac`, `.ogg` or `.webm`).

  The page, PHP (`ScoreRules`) and Python (`siue_music/score.py`) all accept schema 2 in the same PR. The MCP
  tells the AI about the new fields.
- A score written by the editor is a renderable score: a sound on every lane, and a mix.

## Phases

Each phase ships on its own, in this order:

1. **4a: The instrument library and catalogue.**
   - Every catalogue instrument VSCO-2 CE has goes into the shared FLAC library, with the stand-ins above.
   - Unpitched instruments play each sample only on its own key.
   - The catalogue (category, icon, ranges, clef, transposition, General MIDI program, drum pieces, stand-in) is
     in the page.
   - `ScoreRules` and the AI accept the new instruments.
   - The AI can write for the whole orchestra the day this ships.
2. **4b: The core editor.**
   - Compose and New Piece;
   - parts, the instrument picker with icons, and range colouring;
   - the on-screen keyboard, computer keys, Play Live, Step, Grid and chords;
   - select, delete, Undo and Redo;
   - the page never moving while keys are held;
   - hearing the part alone or with the piece;
   - Save Draft through the studio session.
3. **4c: Sheet music, import and export.** The Grid / Sheet Music / Both views, written transposition on the
   sheet, MusicXML and MIDI import with the preview, and MusicXML and MIDI export.
4. **4d: Keyboards, Hum and Play Along.** Web MIDI devices (velocity, sustain, drum pads, General MIDI names and
   program changes), Hum with its three snaps and three placements, Upload A Recording, and Play Along.
5. **4e: Speed, loudness and Sound.** Schema 2: the piece's tempo line, each part's speed, loudness lines, Exact
   Pitch bends, the Sound panel, the Room and the limiter, and the Voice Effects on a live microphone and on any
   part.
6. **4f: Vocal Tracks.** Recording takes on this device, the two qualities and the size choice, clips, Save To
   Studio, the 25 MB limit, the server's checks, converting to Good To The Ear, and Voice Effects on vocals.
7. **4g: DJ & Effects.** The effects timeline, DJ Mode with Record To Timeline, and the Looper.

## What the design pages show, phase by phase

Every control and effect on the Composer and DJ & Effects pages, and the phase that builds it. The pages' own
preview switches (Phone, Desktop, Theme) are not part of the editor.

| On the pages | Phase |
|---|---|
| Parts In This Piece, Part Settings, the instrument picker by family with icons, Clear | 4b |
| Play Live with Tidy To; Step with lengths, Dotted, + Rest and ‹ Back One; Grid with Line Up To; chords | 4b |
| Tap to select then delete, Undo and Redo, Move Them Into Range, amber and red notes | 4b |
| Hear With The Piece, Hear My Part Alone, Save Draft, Notes On Controls, Fill My Screen | 4b |
| Show As Grid / Sheet Music / Both, the range picture | 4c |
| Import Music File: Found In, Time Signature, Key and Length, part matching, What Can't Come Across, Add As New Parts, Start A New Piece, Export | 4c |
| Your Keyboard, Choose Device, Sustain Pedal, drum pads on Channel 10, Sends GM, Studio Sounds | 4d |
| Hum: Record With Mic, Play The Demo Hum, Upload A Recording, Hum Snaps To (Friendly Notes, All 12 Notes, Exact Pitch), Where Hummed Notes Go (After The Part, Replace The Part, At The Dashed Line) | 4d (Exact Pitch's bends are stored from 4e) |
| Play Along, with the other parts as outlines | 4d |
| Speed: Piece speed (Slow, Walking, Quick, Beats Per Minute), Steady, Slow Down, Speed Up, Sudden Change; This part's speed: Follow Piece, Ratio To Piece, Own BPM | 4e |
| Loudness: Very Soft to Very Loud, Get Louder, Get Softer | 4e |
| Sound, Each Part: Volume, Left / Right, Bass / Middle / Treble, Echo Amount and Repeats, Shimmer, Warmth, Brightness with Sweep, Even Out Loud And Soft, Room, Mute, Solo | 4e |
| Sound, The Whole Piece: Room (Dry, Small Room, Concert Hall, Cathedral, Cave), the limiter, Overall Loudness, What The Score Saves | 4e |
| Voice Effects: Vocoder, Auto-Tune, Harmonizer, Pitch Shift with Formant, Talk Box, Robot, Whisper / Breathy | 4e live; 4f on vocals |
| Vocal Tracks: Record A Vocal, takes, clips, Perfect and Good To The Ear, Only On This Device, Save To Studio | 4f |
| Turntable: Scratch, Spinback, Tape Stop, Tape Start, Vinyl Crackle and Wow | 4g |
| Build-Up and Drop: Riser, Snare Roll, Filter Sweep, Impact, Sidechain Pump | 4g |
| Rhythm: Stutter, Trance Gate, Wobble, Tremolo, Auto-Pan | 4g |
| Colour: Bitcrusher, Ring Mod, Phaser, Flanger, Auto-Wah, Rotary Speaker | 4g |
| Time and Space: Echo Out, Ping-Pong Echo, Reverse, Reverse Reverb, Granular Freeze, Wide / 8D, Doppler Fly-By | 4g |
| Pitch and Voice: Pitch Shift, Harmonizer, Vocoder, Pitch Correction (Auto-Tune) | 4g as timeline clips; the effects themselves from 4e |
| Live DJ Tools: Platter, Crossfader, Hot Cues, Performance Pads (Crush, Echo, Filter and the rest), XY Pad, Looper | 4g |
| Timeline: Place On The Timeline, Hear From Here, Shorter, Longer, Remove; Record To Timeline; The Score Stores This; What A Browser Does Less Well | 4g |

## Decisions made with defaults

- **Instruments neither CC0 library has.** These are Celesta, Choir, a real Lyre and a ride cymbal. They ship with
  the stand-ins above. The SF2 celesta and choir sets that some sites call public domain have no clear origin, so
  they are not used. Real samples may come later, only CC0 or public domain. The score names the real instrument,
  so no score changes when that happens.
- **Library size.** The instruments grow the library from about 36 MB to about 180 MB. It stays in plain git and
  deploys whole, as today. The host has plenty of room (1.5 TB, 51 GB used).
- **One dynamic layer.** The library keeps one recorded dynamic per note, as today (mf, or the nearest).
  Loudness comes from velocity, the way the renderer already scales it.
- **The renderer is the browser's.** The editor plays through the same renderer (`render/`) the piece page uses.
  Its sound is the sound the saved draft will have.
- **The editor saves through the studio session.** The new page route `save-draft.php` takes the session, the
  CSRF token and a SIUED1 bundle holding only `score.json`. It applies the same checks as `api/draft.php`
  (`ScoreRules`, the studio limit). An AI key never reaches it.
