# Music workroom: seeing, hearing and answering music and sound together

A page on the site where the owner, who is not a musician or a sound designer,
sees each draft of a project's music or sound effects broken down in plain
words, hears it with a moving playhead, learns the terms as they meet them, and
answers back precisely: pinned notes, spoken or typed, hummed tunes, one-tap
reactions and redrawn energy curves. The workroom is general: it serves music
and sound effects for any project, whether Crete (its score is the first
project), Tankity, Cylon or something unrelated to the website. Claude picks the
notes up, composes the next draft, and answers on the same moments. Notes are
encrypted in the browser; the server never sees them in the clear. Notes stay
sealed on the server until the owner deletes them, so every device the owner
signs in on, a phone included, shows the whole history.

Built on the admin login (`2026-10-17-admin-login-design.md`). The first
project's music direction: epic cinematic scoring in the vein of Interstellar
and Gladiator, themed on the Crete lore (the vision spec and `crete-redesign`
notes).

## Goal

The owner can point at a moment ("right where it gets big", "the low part under
Ariadne's theme", "the first tenth of a second of the cannon") and say what they
want, in their own words or voice, and Claude knows the exact bars (music) or
seconds (sound) and the instruments or layers meant. Over time the owner learns
the vocabulary, and version 2 lets them edit the music themselves.

## Projects, kinds and characters

Three facts about every piece come from its `score.json`, not from the workroom's
code:

- **Project.** Every piece belongs to one project (`id` and a plain-words
  `name`, for example `crete` and "Crete", or `tankity` and "Tankity"). The pieces
  list groups pieces under their project's name.
- **Kind.** A piece is `music` or `sound`. Music is measured in bars and tempo.
  A sound piece is a sound effect or an ambience: it has no tempo and no bars,
  its times are seconds, it can be as short as 0.05 s, and it needs no
  notation. Either kind may use any lane family.
- **Characters.** A score lists its own characters (`id`, name, colour; the list
  may be empty). A motif names one of them and takes its colour. Crete's
  Ariadne (gold), Minotaur (red), Daedalus (bronze) and Athens (blue) live in
  Crete's score, not in the workroom.

## What the owner gets (version 1)

- **Pieces list** (`/music/`): pieces grouped under their project's name
  (projects ordered by their most recent publish, pieces likewise). Each piece
  (for example "Chapter 1: The Labyrinth wakes" under Crete, or "Cannon fire"
  under Tankity) shows its latest draft, how many of the owner's notes are
  waiting for pickup, and Claude's latest change list.
- **A piece page** with an audio player and one playhead shared by up to four
  views. A music piece has all four; a sound piece has the Story timeline and
  the Sound picture, plus the Piano roll only when its score has notes, and
  never Sheet music:
  - **Story timeline:** the piece left to right; sections as coloured blocks
    named in plain words (for a sound piece they are optional named moments);
    one lane per instrument family or sound layer with an icon; each
    character's motif as a ribbon in the colour the score gives that character;
    an energy curve on top. The time axis is bars for music and seconds for a
    sound piece (milliseconds below one second).
  - **Piano roll:** every note as a bar, higher is higher, longer is held
    longer, coloured by lane and motif.
  - **Sound picture:** the rendered audio's spectrogram, labelled low to high
    and dark to bright.
  - **Sheet music** (music only): standard notation for any lane, drawn in the
    browser.
  - Pinch or drag to zoom on a phone; tap to move the playhead. The default
    zoom fits the whole piece, so a 0.3-second sound fills the view.
- **Learning as you go:** every musical or sound-design term on screen
  (ostinato, Phrygian, crescendo, octave, motif; attack, decay, envelope, layer,
  transient, reverb tail, low-pass filter) is tappable and opens a two-line explanation and,
  where it helps, a short "hear it" clip cut from the piece itself.
- **Answering back:**
  - **Pin a note:** select a moment or a span (and optionally a lane or layer),
    then type or record speech. A note on a music piece names bars and seconds;
    a note on a sound piece names seconds only.
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
  fingerprint so the owner can compare it once with `make music-status`.
- **Opening notes on any device, a phone included:** the private key is also
  stored on the server, locked. `make music-setup` encrypts it with AES-256-GCM
  under a key derived from a long random passphrase (PBKDF2-SHA-256, 600,000
  rounds, random salt); the passphrase lives in the same 1Password item, so
  1Password fills it in on any device. After sign-in the workroom asks for it;
  the browser unlocks the private key locally (Web Crypto) and opens the
  notes: their text, their recordings to play, their curves. The passphrase
  and the unlocked key never leave the device, and the locked copy is served
  only to a signed-in session. The unlocked key lives only in that page view's
  memory: www.cs is one browser origin shared by every user's `~folder`, so the
  key is never stored in the browser (1Password fills the passphrase on each
  visit). The server holds one locked keyring: the current private key and
  every retained earlier one, each tagged with its fingerprint, locked under
  the same passphrase. The browser unlocks the whole keyring and picks the key
  a note names, so notes sealed before a rotation open on a newly signed-in
  device. `make music-rotate` re-locks and uploads the full keyring.

## Pickup and the note history

A small HTTPS API under `/music/api/`, behind the admin kit's API keys:

- `GET /music/api/notes?state=waiting`: ids, sizes and SHA-256 hashes of
  sealed notes not yet picked up (scope `notes:pickup`).
- `GET /music/api/notes/{id}` (scope `notes:pickup`): one sealed bundle.
- `POST /music/api/notes/{id}/picked-up` (scope `notes:pickup`): marks it picked up. The pickup tool
  calls this only after the download matches its hash and the note opens, so a
  failed download never loses a note.
- **History:** notes stay sealed on the server until the owner deletes them.
  The workroom shows every note on any device once the key is unlocked, each
  marked waiting or picked up, with **Delete** on each and **Delete all**.
  Deleting removes the database row and the file at once; the database runs
  with `secure_delete` on, so removed rows are overwritten. The page's deletes
  need the signed-in session and its CSRF token; an API key cannot delete.
- `POST /music/api/drafts` (scope `drafts:publish`): Claude publishes a draft
  (the score data, audio and spectrogram) with its change list. Limits, all
  enforced by the server: a request body over 8 MB is refused from its
  declared length before anything is buffered; only the newest 20 drafts are
  kept (older ones are deleted on each publish); a publish that would take
  drafts past 100 MB in total is refused before it is written.
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
| `make music-setup` | Everything to get started, guided and safe to re-run: checks `op`; for each missing, misnamed or revoked API key opens the hub's key form filled in and saves the pasted key to 1Password; makes (or adopts) the notes key; uploads the passphrase-locked private key for the browser; rebuilds the page and, after one question, commits the public key on `music/notes-key-<fingerprint>` through a temporary worktree and opens the pull request. Builds the tool's virtualenv when missing or broken. |
| `make music-status` | Fingerprints of the public key in the repository, in 1Password and in this computer's cache, whether they match, whether each saved API key still works and has the right permission (checked against the server), and a "What's left" checklist ending in `Next: make music-setup` while anything is missing. |
| `make music-rotate` | Makes a new pair; the old private key stays in 1Password as a previous key; the locked keyring (new key plus every retained one) is uploaded and the new public key goes into the repository. |
| `make music-forget` | Deletes this computer's cached copies (for a borrowed or shared computer). |
| `make music-test` | The key tool's tests. |
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

The pipeline (for music, Python composing MIDI, sample instruments rendered with
sfizz, SuperCollider textures, mastering with ffmpeg; for sound effects,
SuperCollider or recorded layers mixed and mastered with ffmpeg) writes, for every draft:

- `score.json`: the project (id and name), the kind (`music` or `sound`), the
  piece, the draft version; for music, tempo and bars; sections with
  plain-words names and bar spans (music) or optional named moments in seconds
  (sound); lanes (family, icon, colour); the characters (name, colour); motifs
  (which character, where they appear); every note (lane, start, length, pitch,
  loudness, motif), which a sound piece may leave empty; the energy curve; the
  glossary terms used, each with where a "hear it" clip starts and ends.
- `score.musicxml` for the sheet music view: required for music, optional for
  sound (a sound piece never shows Sheet music).
- The audio (Opus, about 1 to 2 MB a minute at the chosen quality) and the
  spectrogram image.

`score.json` has a schema with a version; the page refuses a draft whose schema
it does not know, and a test validates every committed draft against it. The
music and its drafts are not secret: the source and renders are committed with
the project's game or site. The login guards the notes and the actions.

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
  the score model accepts a music piece and a 0.4-second sound effect (no bars,
  no MusicXML) and names the path of each broken rule, the layout draws seconds
  and milliseconds on a sound piece's axis and fits a 0.4-second sound to the
  full width, the Sheet music tab is hidden for sound and the Piano roll for a
  sound piece without notes; sealing round-trips with a test key pair and refuses a public key whose
  fingerprint differs, unlocking the private key with the passphrase (a wrong
  passphrase fails cleanly), and nothing of the key is written to browser
  storage.
- PHPUnit: every API route needs the right key scope and HTTPS; a sealed note's
  size and count limits; marking picked up; the page's delete removes row and
  file and needs a session and CSRF; an API key cannot delete; the locked
  private key is served only to a session; the pages need a session; a music draft without MusicXML is refused and a
  sound draft without it is kept; each draft's project and kind are recorded
  from its score; the pieces list groups pieces under two projects, newest
  first.
- Python: publish validates a music draft and a sound draft with the page's
  rules; pickup verifies the hash and opens the note before marking it picked
  up; a corrupt download is not marked; opened notes land outside the
  repository; `music-setup` and `music-rotate` write the locked private key that
  the browser can unlock.
- Browser (locally, `make e2e`): sign in, open a piece, play, move the
  playhead, pin a typed note, see it waiting, pick it up with the tool against
  the docker stack, see it marked picked up, then unlock the key in a second
  browser context and read and delete it there.

## Delivery

Three PRs, each green on its own: the API and storage; the page with its views
and the glossary; the answering tools (notes, humming, reactions, energy)
with the owner's key tool. CI is not changed. The admin login lands first.

## Version 2 (later)

Editing: move, add and remove notes in the piano roll; choose instruments;
play back in the browser; send an edited draft back as a note.

## Out of scope

Composing the music and sound itself (each project's own spec, using this
workroom); other users; public sharing.
