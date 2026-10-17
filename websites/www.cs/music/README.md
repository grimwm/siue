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
  `docker/nginx/default.conf` locally). `deploy.sh` ships the pages, `api/`, `lib/`,
  `music.css` and `keys/public.json` only.

## Routes

Session routes (same-origin, signed in): `index.php`, `piece.php?id=&v=` (pages);
`csrf.php`, `notes.php` (GET list, POST upload), `note.php?id=`, `delete.php`
(POST), `keyring.php`, `drafts.php?piece=`, `draft.php?piece=&v=&file=` (data).

API routes (Bearer key, HTTPS): `api/notes.php` and `api/note.php?id=` (GET) and
`api/picked-up.php` (POST) need `notes:pickup`; `api/drafts.php` (POST) needs
`drafts:publish`; `api/keyring.php` (POST) needs `keys:publish`.

## Limits

- A sealed note is at most 2,097,152 bytes; 2,000 notes are kept.
- A draft request is at most 8 MB (declared `Content-Length`, refused with 413
  before the script reads the body); the newest 20 drafts are kept; a publish that would
  leave more than 100 MB stored is refused with 413.

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

## Make targets

None yet; the answering tools bring their own.

## API keys

Sign in at the admin hub, open the API key panel and create two keys: one with
`notes:pickup` (pickup of notes) and one with `drafts:publish` and `keys:publish`
(publishing drafts and the locked keyring). A key is shown once.
