# Music workroom: seeing, hearing and answering the score together

A page on the site where the owner, who is not a musician, sees each draft of
the game's music broken down in plain words, hears it with a moving playhead,
learns the terms as they meet them, and answers back precisely: pinned notes,
spoken or typed, hummed tunes, one-tap reactions and redrawn energy curves.
Claude picks the notes up, composes the next draft, and answers on the same
moments. Notes are encrypted in the browser; the server never sees them in the
clear. Notes stay sealed on the server until the owner deletes them, so every
device the owner signs in on, a phone included, shows the whole history.

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

- **Keys:** an RSA-4096 key pair. The private key's home is the owner's
  1Password (an item in the `SIUE` vault, `OP_VAULT` to change), so any
  computer signed in to 1Password can open notes; a computer keeps a cached
  copy in `~/.config/siue/` (mode 0600) and never in git. The public key is
  committed in this repository (it is not secret) and built into the page's
  script, together with its SHA-256 fingerprint. Each sealed note names the
  fingerprint it was sealed to, and the keyring keeps earlier private keys
  after a rotation, so a note sealed before a rotation still opens.
- **Sealing, in the browser** (Web Crypto API): for each note, a fresh
  AES-256-GCM key encrypts the whole note (its text or audio and all its
  details: draft version, time span, lane, kind, words); RSA-OAEP with SHA-256
  wraps that AES key with the public key. Only the sealed bundle is uploaded.
- **What the server knows:** a random note id, the sealed bundle's size, and
  when it arrived. Nothing else.
- **No swapped padlock:** the page encrypts only to the built-in public key and
  checks it against the built-in fingerprint; the admin hub shows the
  fingerprint so the owner can compare it once with `make keys-status`.
- **Opening notes on any device, a phone included:** the private key is also
  stored on the server, locked. `make keys-init` encrypts it with AES-256-GCM
  under a key derived from a long random passphrase (PBKDF2-SHA-256, 600,000
  rounds, random salt); the passphrase lives in the same 1Password item, so
  1Password fills it in on any device. After sign-in the workroom asks for it;
  the browser unlocks the private key locally (Web Crypto) and opens the
  notes: their text, their recordings to play, their curves. The passphrase
  and the unlocked key never leave the device, and the locked copy is served
  only to a signed-in session. The unlocked key lives only in that page view's
  memory: www.cs is one browser origin shared by every user's `~folder`, so the
  key is never stored in the browser (1Password fills the passphrase on each
  visit). `make keys-rotate` re-locks the new key, so every device keeps
  working.

## Pickup and the note history

A small HTTPS API under `/music/api/`, behind the admin kit's API keys:

- `GET /music/api/notes?state=waiting`: ids, sizes and SHA-256 hashes of
  sealed notes not yet picked up (scope `notes:pickup`).
- `GET /music/api/notes/{id}`: one sealed bundle.
- `POST /music/api/notes/{id}/picked-up`: marks it picked up. The pickup tool
  calls this only after the download matches its hash and the note opens, so a
  failed download never loses a note.
- **History:** notes stay sealed on the server until the owner deletes them.
  The workroom shows every note on any device once the key is unlocked, each
  marked waiting or picked up, with **Delete** on each and **Delete all**.
  Deleting removes the database row and the file at once; the database runs
  with `secure_delete` on, so removed rows are overwritten. The page's deletes
  need the signed-in session and its CSRF token; an API key cannot delete.
- `POST /music/api/drafts` (scope `drafts:publish`): Claude publishes a draft
  (the score data, audio and spectrogram) with its change list.
- Upload limits: 60 seconds of audio, 2 MB per note, 2,000 notes stored; over
  that the page says so and keeps the note in the browser.

On the owner's computer, `siue-music pickup` downloads, verifies, opens and
marks each note picked up; opened notes go to `~/Library/Application Support/siue-music/notes/`
(or the platform's equivalent), outside the repository.

## Keys from 1Password, through make

Secrets live in 1Password and are fetched with the 1Password CLI (`op`); a
secret is passed to tools on standard input, never as a command-line argument
(so never visible in a process list) and never printed. From
`websites/www.cs`:

| Command | What it does |
| --- | --- |
| `make keys-status` | Fingerprints of the public key in the repository, in 1Password and in this computer's cache, whether they match, and which API keys are stored (labels only). |
| `make keys-pull` | Fetches the private keys and API keys from 1Password into the cache, then checks the private key matches the repository's public key. |
| `make keys-init` | First time only: makes the key pair and a passphrase, saves all three to 1Password, uploads the passphrase-locked private key for the browser, and writes the public key and fingerprint into the repository for a commit. Refuses if a key already exists. |
| `make keys-rotate` | Makes a new pair; the old private key stays in 1Password as a previous key; the new locked private key is uploaded and the new public key goes into the repository. |
| `make api-key-set NAME=music-pickup` | Prompts for an API key shown once on the admin hub and saves it to 1Password only. |
| `make keys-forget` | Deletes this computer's cached copies (for a borrowed or shared computer). |
| `make music-pickup` | Picks up waiting notes: syncs keys first, then downloads, verifies, opens and marks each picked up. |
| `make music-publish PIECE=...` | Publishes a rendered draft through the API. |

**Staying in sync:** every `music-*` target first compares the repository's
public key fingerprint with the cached private key. When they differ (a pull
brought a rotated key), it fetches from 1Password and checks again; when they
still differ, it stops and says which side is out of date. Nothing proceeds on
a mismatched key, and the page refuses to seal to a key whose fingerprint
differs from the one built into it. Speech is turned into text with a local Whisper model; humming into
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
- The owner's tool: `music/tools/siue-music` (Python): `keys` (status, pull,
  init, rotate, forget, using `op`), `pickup`, `publish`; the Makefile targets
  call it.

## Tests

- Unit (node:test): the score model and layout (sections, lanes and motifs to
  pixels at any zoom), hit testing (a tap maps to the right bar and lane),
  sealing round-trips with a test key pair and refuses a public key whose
  fingerprint differs, unlocking the private key with the passphrase (a wrong
  passphrase fails cleanly), and nothing of the key is written to browser
  storage.
- PHPUnit: every API route needs the right key scope and HTTPS; a sealed note's
  size and count limits; marking picked up; the page's delete removes row and
  file and needs a session and CSRF; an API key cannot delete; the locked
  private key is served only to a session; the pages need a session.
- Python: pickup verifies the hash and opens the note before marking it picked
  up; a corrupt download is not marked; opened notes land outside the
  repository; `keys-init` and `keys-rotate` write the locked private key that
  the browser can unlock.
- Browser (locally, `make e2e`): sign in, open a piece, play, move the
  playhead, pin a typed note, see it waiting, pick it up with the tool against
  the docker stack, see it marked picked up, then unlock the key in a second
  browser context and read and delete it there.

## Delivery

Three PRs, each green on its own: the API and storage; the page with the four
views and the glossary; the answering tools (notes, humming, reactions, energy)
with the owner's key tool. CI is not changed. The admin login lands first.

## Version 2 (later)

Editing: move, add and remove notes in the piano roll; choose instruments;
play back in the browser; send an edited draft back as a note.

## Out of scope

Composing the chapter music itself (its own spec, using this workroom); other
users; public sharing.
