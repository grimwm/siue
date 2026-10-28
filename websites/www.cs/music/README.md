# Music workroom

A signed-in admin page on www.cs for music and sound-effect drafts, with
end-to-end-encrypted notes. It serves any project: a piece's `score.json` names
its project, its kind (`music` or `sound`) and its characters.

## Security model

- Notes are sealed in the browser (AES-256-GCM per note, key wrapped with RSA-OAEP
  to the current public key, which the browser takes from the unlocked keyring). The
  server stores sealed bytes only and never decrypts; www.cs PHP has no sodium and needs none.
- The private keys live in one locked keyring (PBKDF2-SHA-256, 600,000 rounds,
  AES-256-GCM) that only a signed-in session can fetch; it is unlocked in the
  browser, in memory, and never stored there.
- Pages need the admin session. Page loads must be browser navigations; the JSON
  and byte routes refuse cross-site requests; every POST needs the session's
  CSRF token. All routes refuse plain HTTP.
- The only browser storage the workroom writes besides the theme and the guide
  flags is the outbox: sealed notes waiting to be sent. Nothing of any key, and
  nothing in the clear about a note, is stored in the browser.
- API keys are made on the admin hub and carry scopes. A key cannot delete.
- The server also keeps the fingerprints the uploader named (current and earlier), only
  to refuse notes sealed to other keys and to show the current one on the admin hub.
- `lib/`, `tools/` and `pieces/` are never served (`.htaccess` on Apache,
  `docker/nginx/default.conf` locally). `deploy.sh` ships the pages, `api/` and `lib/`
  only; the page's script, stylesheet, theme boot and fonts ship
  from `games/workroom/dist/`.

## Routes

Session routes (same-origin, signed in): `index.php`, `piece.php?id=&v=` (pages);
`csrf.php`, `notes.php` (GET list, POST upload), `note.php?id=`, `delete.php`
(POST), `keyring.php`, `drafts.php?piece=`, `draft.php?piece=&v=&file=` (data).

API routes (Bearer key, HTTPS): `api/notes.php` and `api/note.php?id=` (GET) and
`api/picked-up.php` (POST) need `notes:pickup`; `api/drafts.php` (POST) needs
`drafts:publish`; `api/keyring.php` needs `keys:publish` (POST uploads
`{keyring, current, previous}`; GET answers the stored fingerprints).

## The look

The workroom has its own Studio Console look, dark or light ("daylight"),
compiled with Tailwind at build time from `games/workroom/src/app.css` into
`games/workroom/dist/workroom.css`, with self-hosted OFL fonts in
`dist/fonts/`. The header's switch (System, Dark, Light) is remembered in this
browser (`workroom-theme` in localStorage); `dist/theme.js`, the first script
in the head, applies it before the first paint. Colours are tokens in
`app.css`; a score's own colours are nudged to stay readable on either theme.

Every view has a legend line and a **How to read this** button: a guided walk
through the view's parts, one lit at a time, each with Hear it (a clip of the
piece, or a built-in demo). It opens by itself the first time each view is
shown in a browser (`workroom-guide-<view>` in localStorage).

## Answering

The answer bar sits under the player on a piece's page, with four buttons: **Pin
a note** (typed or spoken words on a moment or span, optionally one lane), **Hum
it** (a recording of up to 60 s at the playhead), **React** (one of eight
reactions to the section at the playhead, or to the whole piece when there is no
section) and **Draw the energy** (a curve for how intense the piece should be).
Each note is tied to its draft, in bars and seconds on music and in seconds on a
sound.

Notes are sealed in the browser to the current key of the keyring the passphrase
unlocks. Before an unlock each of the four asks for it: the notes panel opens at
the unlock form with one line saying why, and Pin a note, React or Draw the
energy opens once unlocked. Hum it waits for the next tap, since iOS grants the
microphone only inside one. With no keyring on the server (before `make
music-setup`) the bar says "Notes are off until a notes key is uploaded (make
music-setup)."

- **Pinning** scrolls the Story view into view and picks a span on it: a drag, or a
  tap for one moment; the lane only when the drag starts and ends in one lane. On a
  phone the composer is docked at the bottom of the screen, above the notes handle,
  so the timeline and the picked span stay visible above it.
- **The recorder** records 60 s at most, in the first type the browser records, at
  64 kb/s; the microphone is asked for inside the tap. A recording that is not
  stored stays on screen to Send or Discard.
- **The energy drawing** has its own guide (`workroom-guide-energy` in localStorage).
- **Notes & answers** is the notes panel: the passphrase unlocks it, it lists the notes of this piece or of all pieces, and each note has
  Delete; Delete, Delete all and Discard (for a note not sent yet) each ask
  first, in plain words. Notes on the server are marked Waiting until they are
  picked up; notes this browser has not sent yet are listed under Not sent yet.
- **Signing in** from the front page or a piece page returns to it: the pages send `next=../music/` or `next=../music/piece.php?id=...&v=...` to the admin sign-in, whose `safeNext` accepts only those and the admin's own `index.php` and `keys.php`.
- **General notes** are written on the front page (`/music/`), under the same
  passphrase, tied to no piece: plain words only, sealed and sent like any other
  note. Their body has piece `general`, draft 1, from 0 to 0, no bars, lane or
  curve; the server cannot tell them apart, since the body is sealed. The front
  page lists them with Delete and Discard (no Delete all there, which would also
  delete every piece's notes) and still shows each piece's count of waiting
  notes, which comes from every note. No piece can be published as `general`:
  the server refuses the id (`bad_piece`) as the tool does. Words typed in the box stay
  until the note is stored, across a lost sign-in too (the unlock form says the note is
  kept), and leaving the page asks first while they are there. A note the page could not
  open is listed as such, since its piece is not known.
- **The unlock is remembered** in this browser, so a reload or a later visit does
  not ask for the passphrase again: IndexedDB `siue-music-keys`, store `unlocked`,
  holds the unlocked private keys as non-extractable `CryptoKey`s (no script can read
  their bytes), the current public key, the SHA-256 of the locked keyring and the
  session tag `keyring.php` answers (an HMAC of `music-unlock` under the sign-in's
  session id). The passphrase and the locked keyring are never stored. A page that
  finds the tag or the keyring changed forgets it and asks again: Sign out, Sign
  out everywhere, a sign-in that ended (7 days idle, 30 days at most) and `make
  music-rotate` all do that. A lost sign-in on the page forgets it at once; a
  failed connection keeps it for the next visit. Any page on www.cs, which serves
  every user's pages from one origin, could use (never read) those keys while they
  are remembered, as it could the outbox.
- **The outbox** is IndexedDB `siue-music`, store `outbox`, and holds sealed
  bundles only. It is sent on load and when the browser is back online, one tab at
  a time under the Web Locks lock `workroom-outbox`; Discard drops one. A browser
  that refuses IndexedDB keeps the note in memory and says so.
- Nothing typed or recorded is cleared until the note is stored. Typed words
  stay when the composer closes, and leaving the page asks first while words, a
  recording or a note kept only in memory would be lost.
- The pieces list shows each piece's waiting count after an unlock.
- Chrome may offer to save the unlock form's username and passphrase; the owner
  answers Never (1Password fills the form either way).

## Limits

- A sealed note is at most 2,097,152 bytes; 2,000 notes are kept.
- A draft request is at most 8 MB (declared `Content-Length`, refused with 413
  before the script reads the body); the newest 20 drafts are kept; a publish that would
  leave more than 100 MB stored is refused with 413.

## The owner's key tool

`music/tools/siue-music` keeps the notes keys in 1Password (vault `SIUE`, or
`$OP_VAULT`; the `op` CLI must be 2.25 or newer) and a working copy in
`~/.config/siue/music.json` (folder 0700, file 0600). Secrets reach `op` on
standard input and are never printed.

- `make music-setup` is the one command that gets everything started; run it again any time, it skips what is done. It checks `op` is installed and signed in; for each API key not yet saved (and any saved under the wrong name, or revoked) it opens the hub's API key page with the label and boxes filled in, asks you to press Create and paste the key (not echoed), and saves it to 1Password; makes the notes key if 1Password has none (adopts the current one it holds); uploads the locked keyring with its fingerprints unless the server already holds exactly this computer's current and previous keys, then reads the fingerprints back to check the server's current key is yours. It refuses to make a key while the server holds a keyring this computer cannot open (to start over on purpose, press Remove the notes key under Music notes key on the admin hub, then run it again). It touches no git, builds nothing and asks no question; it ends by naming the workroom address to open. It makes the tool's virtualenv when missing or broken.
- `make music-status` prints the current notes key in 1Password, in this computer's cache and on the server (it asks the server, so it needs the network), whether they match (exit 3 when they differ or the server cannot be asked), whether each saved API key still works and has the right permission, and ends with a "What's left" checklist (done or not): key in 1Password, key in the cache, both API keys saved, the server's current key is yours. It ends with `Next: make music-setup` while anything is missing and says setup is complete otherwise. The "Notes key on the server" line is the one the admin hub shows as "Music notes key" (`https://www.cs.siue.edu/~wgrim/admin/`).
- `make music-rotate` makes a new pair under a new passphrase (so a passphrase that leaked can neither unlock nor forge the new keyring); the new item becomes current in 1Password and the old one is retitled `(previous)`, and the full keyring, current key first, is uploaded with its fingerprints (current, then previous), replacing the stored one, and read back to check it. 1Password decides which key is current: the one `siue-music-key` item whose title does not end in `(previous)`; none, or more than one, stops every command with what to fix in the titles. It refuses when the server holds a key neither 1Password nor the cache has the private key for. A retitle that fails (the approval timed out) stops before the upload and names the item to retitle by hand. It exits 4 when the keyring was not uploaded: run `make music-setup`, which uploads it. A 429 on any API call is retried after back-off pauses that add up to more than the server's one-minute window.
- `make music-forget` deletes the cache. A key removed from 1Password stays usable from this computer's cache until you run it; every cached key is checked against its fingerprint before it is used.
- `make music-test` runs the tool's tests.
- `make music-pickup` downloads each waiting note with the `music-pickup` API key, checks its length and SHA-256 against the listing, opens it with the cached keyring and saves it under the notes folder (`~/Library/Application Support/siue-music/notes/` on macOS, `$XDG_DATA_HOME/siue-music/notes/` elsewhere on Unix, `%APPDATA%\siue-music\notes\` on Windows; `SIUE_MUSIC_NOTES_DIR` overrides; the tool refuses a folder inside the repository) as `<arrival date>-<id>/` with `note.json` and `audio.webm|m4a|ogg` (a general note, piece `general`, is filed the same way beside the piece notes, and the closing line counts them: `Picked up 3 notes (1 general) into ...`). Only then does it mark the note picked up. A note whose download is corrupt or that will not open stays waiting, is reported with its reason, and the run goes on with the next; the exit code is 1 when any note was left. Every API call, the listing included, waits out a 429 and is retried; a 429 that never clears leaves that note waiting and the run goes on.
- Speech notes (webm, m4a or ogg audio; ffmpeg is told the format and never sniffs it) also get `transcript.txt` (local Whisper, `faster-whisper`; `SIUE_MUSIC_WHISPER_MODEL` picks the model, default `small.en`) and hum notes `motif.mid` (`librosa.pyin` and `mido`). Both are optional: `music/tools/.venv/bin/pip install -r music/tools/requirements-answering.txt` and `brew install ffmpeg`. Without them pickup still opens and saves every note and prints one line naming what is missing.
- `make music-publish PIECE=ch1-labyrinth [VERSION=3]` checks `music/pieces/<piece>/v<N>/score.json` with the page's rules (glossary ids from `games/workroom/src/glossary.json`), requires the audio, the spectrogram and, for music, `score.musicxml`, refuses a draft over 8 MB before sending, and publishes it with the `music-publish` API key. The newest version is the default.

## The local browser check

`make music-e2e` (local only; CI never runs it) brings up its own docker project
with the admin mail capture, signs in through the captured email, publishes the
fixture drafts with an API key made on the hub, and drives the page in Chrome:
play, seek, the four views, a glossary card, the sheet music, a sound effect from
a second project, and no content security policy violation. It also uploads the
committed TEST keyring (`games/workroom/test/fixtures/test-key.json`) with its
fingerprints through `music/api/keyring.php`, unlocks it in the shipped page with
the TEST passphrase, records with Chrome's fake microphone, pins a typed note,
picks it up with `siue-music pickup` from a temporary config folder whose cache
holds the TEST key, with the tool's 1Password stand-in
(`music/tools/tests/fake_op.py`), so the run never touches the owner's 1Password or
cache (it needs the tool's virtualenv, which `make music-setup` also makes), reads
and deletes it on a second, phone-sized device, finds a composer asking for the
unlock first, hums, reacts, draws the energy, and sends a note made offline once
the connection is back. `MUSIC_E2E_SHOTS=<folder>` saves every screen. It prints
`MUSIC-E2E-OK` and tears the project down. The page it drives is the shipped
`games/workroom/dist/workroom.js`.
The admin sign-in link is limited to three a hour per address; one run asks for
two. The fixtures under `games/workroom/test/fixtures/draft*/` come from
`node games/workroom/tools/make-draft-fixture.ts` and `ffmpeg` (see that script).

## After a deploy

`curl -s -o /dev/null -w '%{http_code}' -H 'Authorization: Bearer throwaway' https://www.cs.siue.edu/~wgrim/music/api/notes.php`
must answer 403 (or 200 with a real key), never 401: a 401 means Apache is not
handing the Authorization header to PHP.

## `score.json`, schema 1

The page refuses any other `schema` value with: "This draft uses score schema N, which this page does not know. Reload the page; if it still says so, the page needs an update." Every `music/pieces/*/v*/score.json` is validated by `games/workroom/test/committed-drafts.test.ts`.

| Field | Type and rule |
| --- | --- |
| `schema` | `1` |
| `kind` | `music` or `sound`. A `sound` piece is a sound effect or an ambience |
| `project` | `{ id, name }`; `id` matches `^[a-z0-9][a-z0-9-]{0,47}$`; `name` 1–80 chars. Every piece belongs to one project |
| `piece` | `{ id, title }`; `id` matches `^[a-z0-9][a-z0-9-]{0,47}$`; `title` 1–120 chars |
| `draft` | integer ≥ 1 (the draft version) |
| `made` | ISO 8601 UTC string ending in `Z` |
| `duration` | seconds, > 0; for `sound`, ≥ 0.05 |
| `bars` | `music`: integer ≥ 1, the last bar number (bars count from 1). `sound`: absent |
| `tempo` | `music`: ≥ 1 of `{ bar, bpm, beats, unit }`; first `bar` is 1; bars strictly increasing and ≤ `bars`; `bpm` > 0 counts `unit` notes per minute; `beats` integer 1–16; `unit` one of 1, 2, 4, 8, 16. `sound`: absent |
| `sections` | `music`: ≥ 1 of `{ id, name, from_bar, to_bar, color }`; contiguous: the first starts at bar 1, each starts one bar after the previous ends, the last ends at `bars`; `name` is plain words, 1–60 chars. `sound`: ≥ 0 named moments `{ id, name, from, to, color }` in seconds; `0 ≤ from < to ≤ duration`, in time order, none overlapping the one before; `name` 1–60 chars; sections of either kind have unique ids |
| `lanes` | ≥ 1 of `{ id, name, family, icon, color }` (for a sound piece the lanes are its layers); unique ids; `family` and `icon` each one of `strings`, `brass`, `woodwinds`, `percussion`, `choir`, `keys`, `synth`, `harp`, `bells`, `impact`, `whoosh`, `ambience`, `voice`, `electronic`, `foley`, `ui`; either kind may use any family |
| `characters` | ≥ 0 of `{ id, name, color }`; unique ids; `name` 1–60 chars. The page has no built-in characters or colours |
| `motifs` | `{ id, character, spans: [{ lane, from, to }] }`; `character` is the `id` of an entry of `characters` (the motif takes that character's colour); `from` < `to` seconds within `[0, duration]`; `lane` names a lane |
| `notes` | ≥ 0 of `{ lane, start, length, pitch, velocity, motif }` (a sound piece may have none, and then has no Piano roll); `start` ≥ 0 and `start + length` ≤ `duration` (seconds), `length` > 0; `pitch` MIDI integer 0–127; `velocity` integer 1–127; `motif` a motif id or `null` |
| `energy` | ≥ 2 points `[seconds, value]`; times strictly increasing, first 0, last `duration`; values in [0, 1] |
| `glossary` | `{ term, from, to }`; `term` is a page glossary id (an `id` in `games/workroom/src/glossary.json`, the glossary's one source; the page and the tool both read it); `0 ≤ from < to ≤ duration`, `to - from` ≤ 15 |
| `audio` | ≥ 1 of `{ file, type }`; `file` is `audio.webm` (type `audio/webm; codecs=opus`) or `audio.m4a` (type `audio/mp4; codecs=mp4a.40.2`) |
| `spectrogram` | `{ file: "spectrogram.png", low_hz, high_hz, scale }`; 0 < `low_hz` < `high_hz`; `scale` `log` or `linear` |
| `musicxml` | `music`: `"score.musicxml"`, required; each lane is the MusicXML part whose `id` equals the lane id. `sound`: absent, or `"score.musicxml"` (a sound piece never shows Sheet music) |
| `changes` | `music`: `{ from_bar, to_bar, lane, text, answers }` with `1 ≤ from_bar ≤ to_bar ≤ bars`. `sound`: `{ from, to, lane, text, answers }` with `0 ≤ from < to ≤ duration` seconds. Both: `lane` a lane id or `null`; `text` 1–500 chars; `answers` a list of note ids (32 hex) |

Colours everywhere match `^#[0-9a-f]{6}$`. Ids everywhere match `^[a-z0-9][a-z0-9-]{0,47}$`. The server checks only what it records or must refuse (`schema`, `kind`, `project`, `piece`, `draft`, the file set and the file signatures); the page and the tool check every rule in the table.

## Setup

Run `make music-setup` (in `websites/www.cs`). Two kinds of key are involved. The
**notes key** is the encryption key: its private half and passphrase live in 1Password,
and a locked copy goes to the server so any device can open notes with the passphrase.
The page takes the public half it seals to from that unlocked copy, so notes are sealed
before they leave the phone and the server cannot swap the key.
**API keys** are not encryption: they are passwords that let the key tool talk to the
server. `music-publish` (boxes `drafts:publish` and `keys:publish`) uploads drafts and
the locked copy; `music-pickup` (box `notes:pickup`) downloads waiting notes. They are
made on the admin hub's API keys page (`https://www.cs.siue.edu/~wgrim/admin/keys.php`,
which accepts `?label=` and `?scopes=a,b` to fill the form in; it never creates a key
from a GET); a key is shown once.
