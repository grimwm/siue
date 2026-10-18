# Music workroom

A signed-in admin page on www.cs for music and sound-effect drafts, with
end-to-end-encrypted notes. It serves any project: a piece's `score.json` names
its project, its kind (`music` or `sound`) and its characters.

## Security model

- Notes are sealed in the browser (AES-256-GCM per note, key wrapped with RSA-OAEP
  to the committed public key). The server stores sealed bytes only and never
  decrypts; www.cs PHP has no sodium and needs none.
- The private keys live in one locked keyring (PBKDF2-SHA-256, 600,000 rounds,
  AES-256-GCM) that only a signed-in session can fetch; it is unlocked in the
  browser, in memory, and never stored there.
- Pages need the admin session. Page loads must be browser navigations; the JSON
  and byte routes refuse cross-site requests; every POST needs the session's
  CSRF token. All routes refuse plain HTTP.
- API keys are made on the admin hub and carry scopes. A key cannot delete.
- `lib/`, `tools/`, `pieces/` and `keys/` are never served (`.htaccess` on Apache,
  `docker/nginx/default.conf` locally). `deploy.sh` ships the pages, `api/`, `lib/` and
  `keys/public.json` only; the page's script, stylesheet, theme boot and fonts ship
  from `games/workroom/dist/`.

## Routes

Session routes (same-origin, signed in): `index.php`, `piece.php?id=&v=` (pages);
`csrf.php`, `notes.php` (GET list, POST upload), `note.php?id=`, `delete.php`
(POST), `keyring.php`, `drafts.php?piece=`, `draft.php?piece=&v=&file=` (data).

API routes (Bearer key, HTTPS): `api/notes.php` and `api/note.php?id=` (GET) and
`api/picked-up.php` (POST) need `notes:pickup`; `api/drafts.php` (POST) needs
`drafts:publish`; `api/keyring.php` (POST) needs `keys:publish`.

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

- `make music-setup` is the one command that gets everything started; run it again any time, it skips what is done. It checks `op` is installed and signed in; for each API key not yet saved (and any saved under the wrong name, or revoked) it opens the hub's API key page with the label and boxes filled in, asks you to press Create and paste the key (not echoed), and saves it to 1Password; makes the notes key if neither the repository nor 1Password has one (adopts the one 1Password holds); uploads the locked copy if the cache's record says the current key is not uploaded; rebuilds the page and, after one `[Y/n]` question naming the branch `music/notes-key-<fingerprint>`, commits exactly `music/keys/public.json`, `games/workroom/src/public-key.ts` and `games/workroom/dist/` through a temporary worktree cut from `origin/main` (your checkout is never switched or committed on), pushes it (never forced), opens the pull request or reports the open one, then puts your checkout's copies of those files back to what git holds. Without a terminal it asks nothing and says to run `make music-setup` in one. A failed push keeps the commit on the branch; the next run pushes it. It makes the tool's virtualenv when missing or broken. Merge the pull request once its checks pass; the deploy is automatic.
- `make music-status` compares the repository's current public key with 1Password and the cache (exit 3 when they differ), asks the server (so it needs the network) whether each saved API key still works and has the right permission, and ends with a "What's left" checklist (done or not): key in the repository, key committed, key in 1Password and the cache, both API keys saved, locked copy uploaded. It ends with `Next: make music-setup` while anything is missing and says setup is complete otherwise. After the deploy, compare its "Repository key" with the "Music notes key" line on the admin hub (`https://www.cs.siue.edu/~wgrim/admin/`).
- `make music-rotate` makes a new pair under the same passphrase, retitles the old item `(previous)`, adds the old public key to `previous`, and uploads the full keyring, current key first, replacing the stored one. It refuses when neither the cache nor 1Password holds the private key for a retained key. It uploads before it retitles; a retitle that fails (the approval timed out) is a warning naming the item to retitle by hand. It exits 4 when the keyring was not uploaded: run `make music-setup`, which uploads it, before you commit or deploy. A 429 on any API call is retried after back-off pauses that add up to more than the server's one-minute window.
- `make music-forget` deletes the cache. A key removed from 1Password stays usable from this computer's cache until you run it; every cached key is checked against its fingerprint before it is used.
- `make music-test` runs the tool's tests.
- `make music-pickup` downloads each waiting note with the `music-pickup` API key, checks its length and SHA-256 against the listing, opens it with the cached keyring and saves it under the notes folder (`~/Library/Application Support/siue-music/notes/` on macOS, `$XDG_DATA_HOME/siue-music/notes/` elsewhere on Unix, `%APPDATA%\siue-music\notes\` on Windows; `SIUE_MUSIC_NOTES_DIR` overrides; the tool refuses a folder inside the repository) as `<arrival date>-<id>/` with `note.json` and `audio.webm|m4a|ogg`. Only then does it mark the note picked up. A note whose download is corrupt or that will not open stays waiting, is reported with its reason, and the run goes on with the next; the exit code is 1 when any note was left. Every API call, the listing included, waits out a 429 and is retried; a 429 that never clears leaves that note waiting and the run goes on.
- Speech notes (webm, m4a or ogg audio; ffmpeg is told the format and never sniffs it) also get `transcript.txt` (local Whisper, `faster-whisper`; `SIUE_MUSIC_WHISPER_MODEL` picks the model, default `small.en`) and hum notes `motif.mid` (`librosa.pyin` and `mido`). Both are optional: `music/tools/.venv/bin/pip install -r music/tools/requirements-answering.txt` and `brew install ffmpeg`. Without them pickup still opens and saves every note and prints one line naming what is missing.
- `make music-publish PIECE=ch1-labyrinth [VERSION=3]` checks `music/pieces/<piece>/v<N>/score.json` with the page's rules (glossary ids from `games/workroom/src/glossary.json`), requires the audio, the spectrogram and, for music, `score.musicxml`, refuses a draft over 8 MB before sending, and publishes it with the `music-publish` API key. The newest version is the default.

## The local browser check

`make music-e2e` (local only; CI never runs it) brings up its own docker project
with the admin mail capture, signs in through the captured email, publishes the
fixture drafts with an API key made on the hub, and drives the page in Chrome:
play, seek, the four views, a glossary card, the sheet music, a sound effect from
a second project, and no content security policy violation. It prints
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
**notes key** is the encryption key: its public half is built into the page so notes are
sealed before they leave the phone; its private half and passphrase live in 1Password,
and a locked copy goes to the server so any device can open notes with the passphrase.
**API keys** are not encryption: they are passwords that let the key tool talk to the
server. `music-publish` (boxes `drafts:publish` and `keys:publish`) uploads drafts and
the locked copy; `music-pickup` (box `notes:pickup`) downloads waiting notes. They are
made on the admin hub's API keys page (`https://www.cs.siue.edu/~wgrim/admin/keys.php`,
which accepts `?label=` and `?scopes=a,b` to fill the form in; it never creates a key
from a GET); a key is shown once.
