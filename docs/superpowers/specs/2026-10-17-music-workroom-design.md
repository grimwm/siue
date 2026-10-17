# Music workroom: seeing, hearing and answering the score together

A page on the site where the owner, who is not a musician, sees each draft of
the game's music broken down in plain words, hears it with a moving playhead,
learns the terms as they meet them, and answers back precisely: pinned notes,
spoken or typed, hummed tunes, one-tap reactions and redrawn energy curves.
Claude picks the notes up, composes the next draft, and answers on the same
moments. Notes are encrypted in the browser; the server never sees them in the
clear, and each is deleted once picked up.

Built on the admin login (`2026-10-17-admin-login-design.md`). Music direction:
epic cinematic scoring in the vein of Interstellar and Gladiator, themed on the
Crete lore (the vision spec and `crete-redesign` notes).

## Goal

The owner can point at a moment ("right where it gets big", "the low part under
Ariadne's theme") and say what they want, in their own words or voice, and
Claude knows the exact bars and instruments meant. Over time the owner learns
the vocabulary, and version 2 lets them edit the music themselves.

## What the owner gets (version 1)

- **Pieces list** (`/music/`): each piece (for example "Chapter 1: The
  Labyrinth wakes") with its latest draft, how many of the owner's notes are
  waiting for pickup, and Claude's latest change list.
- **A piece page** with an audio player and one playhead shared by four views:
  - **Story timeline:** the piece left to right; sections as coloured blocks
    named in plain words; one lane per instrument family with an icon; each
    character's motif as a coloured ribbon (Ariadne gold, the Minotaur red,
    Daedalus bronze, Athens blue); an energy curve on top.
  - **Piano roll:** every note as a bar, higher is higher, longer is held
    longer, coloured by lane and motif.
  - **Sound picture:** the rendered audio's spectrogram, labelled low to high
    and dark to bright.
  - **Sheet music:** standard notation for any lane, drawn in the browser.
  - Pinch or drag to zoom on a phone; tap to move the playhead.
- **Learning as you go:** every musical term on screen (ostinato, Phrygian,
  crescendo, octave, motif) is tappable and opens a two-line explanation and,
  where it helps, a short "hear it" clip cut from the piece itself.
- **Answering back:**
  - **Pin a note:** select a moment or a span (and optionally a lane), then type
    or record speech.
  - **Hum it:** record up to 60 seconds of humming or singing at a moment.
  - **React:** one tap on a section: more epic, calmer, darker, brighter,
    longer, shorter, love it, not this.
  - **Draw the energy:** drag the energy curve into the shape wanted.
  - Each note is tied to the draft version it was made on.
- **Claude's answers:** each new draft comes with a change list pinned to the
  same moments ("bars 33–40: strings an octave lower, held two bars longer"),
  shown on the timeline beside the notes it answers.

## End-to-end encryption of notes

The server stores only sealed notes, which it cannot open.

- **Keys:** a pickup tool on the owner's Mac creates an RSA-4096 key pair once.
  The private key stays in `~/.config/siue-music/` (mode 0600), never in git.
  The public key is committed in this repository (it is not secret) and built
  into the page's script, together with its SHA-256 fingerprint.
- **Sealing, in the browser** (Web Crypto API): for each note, a fresh
  AES-256-GCM key encrypts the whole note (its text or audio and all its
  details: draft version, time span, lane, kind, words); RSA-OAEP with SHA-256
  wraps that AES key with the public key. Only the sealed bundle is uploaded.
- **What the server knows:** a random note id, the sealed bundle's size, and
  when it arrived. Nothing else.
- **No swapped padlock:** the page encrypts only to the built-in public key and
  checks it against the built-in fingerprint; the admin hub shows the
  fingerprint so the owner can compare it once with the Mac's
  (`siue-music fingerprint`).
- **The owner's view of their own notes:** the browser keeps a readable copy of
  each note it sealed (in this browser's storage) until the note is picked up,
  so the owner sees what they said; another browser sees only "3 notes waiting".

## Pickup and deletion

A small HTTPS API under `/music/api/`, behind the admin kit's API keys:

- `GET /music/api/notes`: ids, sizes and SHA-256 hashes of waiting sealed
  notes (scope `notes:pickup`).
- `GET /music/api/notes/{id}`: one sealed bundle.
- `DELETE /music/api/notes/{id}`: delete it; the server removes the database
  row and the file at once. The pickup tool calls this only after the download
  matches its hash and the note opens with the private key, so a failed
  download never loses a note.
- The database runs with `secure_delete` on, so removed rows are overwritten.
- **Maximum age:** a note not picked up within 14 days is deleted anyway.
- `POST /music/api/drafts` (scope `drafts:publish`): Claude publishes a draft
  (the score data, audio and spectrogram) with its change list.
- Upload limits: 60 seconds of audio, 2 MB per note, 200 waiting notes; over
  that the page says so and keeps the note in the browser.

On the Mac, `siue-music pickup` downloads, verifies, opens and deletes; opened
notes go to `~/Library/Application Support/siue-music/notes/`, outside the
repository. Speech is turned into text with a local Whisper model; humming into
pitches and rhythm (a pitch tracker such as pYIN), written as a small MIDI motif
that the next draft can use. Notes are never committed: this repository is
public.

## The score data

The music pipeline (Python composing MIDI, sample instruments rendered with
sfizz, SuperCollider textures, mastering with ffmpeg) writes, for every draft:

- `score.json`: the piece, the draft version, tempo and bars; sections with
  plain-words names and bar spans; lanes (instrument family, icon, colour);
  motifs (character, colour, where they appear); every note (lane, start,
  length, pitch, loudness, motif); the energy curve; the glossary terms used,
  each with where a "hear it" clip starts and ends.
- `score.musicxml` for the sheet music view.
- The audio (Opus, about 1 to 2 MB a minute at the chosen quality) and the
  spectrogram image.

`score.json` has a schema with a version; the page refuses a draft whose schema
it does not know, and a test validates every committed draft against it. The
music and its drafts are not secret: the source and renders are committed with
the game. The login guards the notes and the actions.

## Code

- `websites/www.cs/music/`: `index.php` and `piece.php` (call
  `require_admin()`), the API (`require_key()`), storage on the kit's
  `StoreDir` (sealed notes and drafts outside what Apache serves directly;
  audio is streamed only to a signed-in session).
- The page: TypeScript and Preact on the games kit's build (`build.json`), with
  DOM-free modules for the score model, the timeline layout, zoom and hit
  testing, sealing (Web Crypto), and the waiting-notes store; views as Preact
  components; sheet music with OpenSheetMusicDisplay or VexFlow.
- The Mac tool: `music/tools/siue-music` (Python): `keygen`, `fingerprint`,
  `pickup`, `publish`.

## Tests

- Unit (node:test): the score model and layout (sections, lanes and motifs to
  pixels at any zoom), hit testing (a tap maps to the right bar and lane),
  sealing round-trips with a test key pair and refuses a public key whose
  fingerprint differs, the waiting-notes store.
- PHPUnit: every API route needs the right key scope and HTTPS; a sealed note's
  size and count limits; DELETE removes row and file; the 14-day purge; the
  pages need a session.
- Python: pickup verifies the hash and opens the note before it deletes; a
  corrupt download is not deleted; opened notes land outside the repository.
- Browser (locally, `make e2e`): sign in, open a piece, play, move the
  playhead, pin a typed note, see it waiting, pick it up with the tool against
  the docker stack, and see it gone from the server.

## Delivery

Three PRs, each green on its own: the API and storage; the page with the four
views and the glossary; the answering tools (notes, humming, reactions, energy)
with the Mac tool. CI is not changed. The admin login lands first.

## Version 2 (later)

Editing: move, add and remove notes in the piano roll; choose instruments;
play back in the browser; send an edited draft back as a note.

## Out of scope

Composing the chapter music itself (its own spec, using this workroom); other
users; public sharing.
