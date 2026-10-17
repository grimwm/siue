# Music Workroom Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A signed-in page at `/music/` where the owner sees, hears and learns each draft of a project's music or sound effects (Crete's score first; Tankity, Cylon and projects unrelated to the website after it) in up to four views that share one playhead, answers with notes sealed in the browser, and Claude picks the notes up and publishes the next draft through scoped API calls. Every piece belongs to a project and is either `music` or `sound`; its characters and their colours come from its score, never from code.

**Architecture:** The server is plain PHP 8.4 in `websites/www.cs/music/` (namespace `Music`) on the admin login's `Request`, `Response`, `Sessions`, `Keys` and SQLite database (`Admin\Db`, `secure_delete` on); sealed notes and published drafts are files under the admin data directory, never served directly. The page is TypeScript and Preact built by the games kit's `build.mjs` from `games/workroom/` (a kit folder with a `build.json` and no `metadata.yaml`, so the games hub never lists it), with DOM-free modules for the score model, the time axis, layout, zoom, hit testing, gestures and note building, Web Crypto modules in their own type-checked program for sealing, unlocking, the outbox and the page's API client, and thin Preact views. The owner's tool `music/tools/siue-music` (Python 3, `cryptography`, 1Password CLI v2) keeps the keys in step, picks notes up and publishes drafts; the Makefile calls it.

**Tech Stack:** PHP 8.4, PDO SQLite, PHPUnit 12 (`--testsuite site`); TypeScript 7, Preact 11, esbuild 0.28 through `games/_kit/build/build.mjs`, `node:test` on Node 24 (Web Crypto as `globalThis.crypto.subtle`), OpenSheetMusicDisplay for notation; Python 3.11+, `cryptography`, optional `faster-whisper`, `librosa`, `mido`, `numpy`, `ffmpeg`; 1Password CLI (`op`) 2.25+; Playwright (local only).

**Spec:** `docs/superpowers/specs/2026-10-17-music-workroom-design.md`. It builds on `docs/superpowers/specs/2026-10-17-admin-login-design.md` and its plan `docs/superpowers/plans/2026-10-17-admin-login.md`, whose merged code (`websites/www.cs/admin/lib/` and `tests/php/AdminFakes.php`) this plan uses exactly as it stands on `main`.

## Global Constraints

- Work starts from `main`, where the admin login is merged. Use its code exactly as it stands in `websites/www.cs/admin/lib/*.php`:
  - `Admin\Request`: public constructor `method, ip, https, host, headers, cookies, post, query, agent`; header names are lower-case (`authorization`, `x-csrf`, `sec-fetch-site`); `fromGlobals()` builds it. PHP keeps `CONTENT_LENGTH` out of the `HTTP_*` variables it reads, so `music_request()` (Task 4) adds the `content-length` header from `$_SERVER`.
  - `Admin\Response(int $status, array $headers, string $body, array $cookies = [])`, with public mutable properties.
  - `Admin\Pages::requireAdmin(Request): ?Response` (a 303 to the relative `login.php` without a session, which `Music\Pages` turns into the absolute admin login URL; a `PDOException` becomes the 503 page), and the statics `Pages::storageDown()` and `Pages::fromStorageError()`.
  - `Admin\Keys`: `__construct(PDO, Clock, ?array $scopes = null, ?string $baseUrl = null)`, `check(Request, string $scope): ?Response` (HTTPS, a Bearer header only, the per-key rate limit of 60 a minute, the scope), `create(string $label, array $scopes): string`, and `Keys::SCOPES`, which is the global constant `ADMIN_KEY_SCOPES` in `admin/lib/bootstrap.php`. It is `[]` on `main`; Task 2 fills it with the three music scopes and updates the admin test that asserts it empty.
  - `Admin\Sessions`: `__construct(PDO, Clock, string $cookiePath)`, `start(Request): string` (the Set-Cookie value), `current(Request): bool`, `csrf(Request): string`, `checkCsrf(Request, string): bool`, and `Sessions::COOKIE` (`__Secure-admin`). `checkCsrf` spends the session's token on every call, right or wrong; `csrf()` hands out the current token, or makes a fresh one when the last was spent. After any refused check the caller must ask `csrf()` again.
  - `Admin\Db::open(string $dir): PDO` and `Db::dataDir(): string`; `Admin\Headers::LIST` and `Headers::apply(array)`; `Admin\StorageUnavailable`; `Admin\Clock` and `Admin\SystemClock`; `Kit\StoreDir`.
  - The bootstrap functions `admin_base_url()`, `admin_cookie_path(string)`, `admin_mailer(...)`, `admin_refuse_plain_http(Request, string $baseUrl): ?Response`, `admin_refuse_script_fetch(Request): ?Response` and `admin_emit(Response)`.
  - The test helpers in `tests/php/AdminFakes.php`: `FakeClock`, `admin_tmp_dir()`, `admin_tmp_db()` and `req(array $with)`; and `MemoryMailer` (an `Admin\Mailer`) in `tests/php/AdminPagesTest.php`, which the music fakes `require_once`.
- **Session pages use the admin pages' guards.** Every session route refuses plain HTTP with `admin_refuse_plain_http` and then calls `Admin\Pages::requireAdmin`. The two HTML pages (`index.php`, `piece.php`) also run `admin_refuse_script_fetch` (Fetch Metadata: only a browser navigation may load them). The JSON and byte routes that the page's own script fetches, and the draft files its `<audio>` and `<img>` elements load, run `Music\Http::refuseCrossSite` instead: a request whose `Sec-Fetch-Site` is present and not `same-origin` is refused with 403. The thin pages call `music_run` (Task 4), which runs the HTTPS gate and the matching Fetch Metadata gate **before** it opens the database, as `admin_serve` does, so a refused request gets its 403 even when storage is down; `Music\Pages` runs the same gates again.
- **A signed-out visitor is sent to the absolute admin login.** `Admin\Pages::requireAdmin` redirects to the relative `login.php`, which under `/music/` is `/music/login.php` (a 404). `Music\Pages` rewrites that `Location` to `admin_base_url() . 'login.php'`; a test pins the header on every session route.
- **Byte buffers are `Uint8Array<ArrayBuffer>`** wherever they reach `crypto.subtle`, `fetch` or a `Fetch` body: TypeScript 7 types a bare `Uint8Array` as `Uint8Array<ArrayBufferLike>`, which `BufferSource` and `BodyInit` reject. `new Uint8Array(n)`, `new Uint8Array(arrayBuffer)`, `Uint8Array.from(...)`, `.slice()` and `new TextEncoder().encode()` all give `Uint8Array<ArrayBuffer>`; wrap a `Buffer` with `Uint8Array.from(buffer)`.
- **Two type-check programs for the page's pure modules.** `tsconfig.json` is DOM-free (`lib: ["ES2022"]`, `types: []`): the score model, layout, zoom, hit testing, gestures, player, loading, note building, energy and recorder modules. `src/tsconfig.crypto.json` (`lib: ["ES2022", "DOM"]`) holds the modules that use `crypto`, `CryptoKey` or `TextEncoder`, or import one that does (`seal.ts`, `unlock.ts`, `vault.ts`, `public-key.ts`, `api.ts`, `outbox.ts`, `history.ts`), because `tsc` checks every imported file under the importing program's `lib`. `src/tsconfig.dom.json` holds the DOM adapters and `.tsx` files.
- Header lookups go through `Music\Http::header(Request $r, string $name): ?string`, case-insensitive, so nothing depends on how `Request` spells header names.
- Sealing, in the browser with Web Crypto: per note a fresh AES-256-GCM key (12-byte IV) encrypts the whole note; RSA-OAEP with SHA-256 (MGF1-SHA-256) wraps that key to the committed **RSA-4096** public key. The fingerprint is the lowercase hex SHA-256 of the public key's SPKI DER, built into the page with the key; the page refuses to seal to a key whose computed fingerprint differs from the built-in one; every sealed note carries the fingerprint it was sealed to.
- The server keeps per note only: a random id, the sealed bundle's size, its arrival time, the sealed bytes, the SHA-256 of the sealed bytes (derived from them, for the pickup check) and the picked-up time.
- www.cs PHP has **no sodium** (`docker/expected-modules.txt`). Crypto is Web Crypto in the browser and `cryptography` (OpenSSL) in Python; PHP never decrypts anything.
- The private keys' home is 1Password vault `SIUE` (`OP_VAULT` overrides), one item per key pair; every item carries the same passphrase. The server holds **one locked keyring**: the current private key and every retained earlier one, each tagged with its fingerprint, all locked under that passphrase with PBKDF2-SHA-256 (**600,000** rounds, 16-byte random salt) and AES-256-GCM (12-byte IV, additional data = the ASCII `siue-music-keyring-v1`); the JSON is in Formats. It is served only to a signed-in session and unlocked in the browser, which picks the key a note's header names. The passphrase is NFC-normalised and trimmed before use, in TypeScript and Python alike.
- **Keys never touch browser storage.** The unlocked private keys live only in the memory of the page view, as non-extractable `CryptoKey` objects held by the vault. Nothing of any key (the passphrase, the locked keyring, an unlocked key) is written to IndexedDB, `localStorage`, `sessionStorage`, a cookie or the Cache API: www.cs is one browser origin shared by every user's `~folder`, so a stored key would be readable by their scripts. The passphrase is asked on every visit (1Password fills it in). Only sealed notes waiting to be sent (the outbox) use IndexedDB.
- Notes stay sealed on the server until the owner deletes them in the page (session + CSRF). Pickup only marks a note picked up. An API key cannot delete. SQLite runs with `secure_delete` on.
- **Scopes on every API route:** the notes list, one note and picked-up need `notes:pickup`; publishing a draft needs `drafts:publish`; uploading the keyring needs `keys:publish`. A key without a route's scope gets 403 there.
- Limits: 60 s of audio per note (the page's recorder stops at 60 s), **2,097,152** bytes per sealed note, **2,000** notes stored; over either, the page says so and keeps the note in the browser's outbox. Drafts, enforced by the server: a request whose declared `Content-Length` is over **8,388,608** bytes (8 MB) is refused with 413 `too_large` before any of its body is read; only the newest **20** drafts are kept (each successful publish deletes the older rows and files); a publish that would leave the stored drafts over **104,857,600** bytes (100 MB) is refused with 413 `over_quota` before anything is written.
- Secrets reach tools on standard input, never as a command-line argument, and are never printed. `op` is the 1Password CLI v2 (2.25 or newer, for `--reveal`).
- Opened notes go to `~/Library/Application Support/siue-music/notes/` on macOS, `$XDG_DATA_HOME/siue-music/notes/` (default `~/.local/share/siue-music/notes/`) elsewhere on Unix, `%APPDATA%\siue-music\notes\` on Windows; never inside the repository (the tool refuses a notes directory inside it). The key cache is `~/.config/siue/music.json`, directory 0700, file 0600.
- Speech-to-text (local Whisper via `faster-whisper`) and humming-to-MIDI (`librosa.pyin` and `mido`) are optional: when missing, pickup still opens and saves every note and prints one line naming the missing package and the install command.
- New Makefile targets only (`websites/www.cs/Makefile`): `keys-status`, `keys-pull`, `keys-init`, `keys-rotate`, `api-key-set NAME=...`, `keys-forget`, `music-pickup`, `music-publish PIECE=...`, plus `keys-upload`, `music-tools-venv`, `music-tools-test` and `music-e2e`. The `test` and `e2e` targets are never changed.
- CI is not changed: no edits to `.github/`, `tests/e2e/select.ts`, `compose.yaml`, or the Makefile's `test` and `e2e` targets. The one change near CI is a single `env[MUSIC_PUBLIC_KEYS] = $MUSIC_PUBLIC_KEYS` line in `docker/php/Dockerfile` (Task 15), because FPM clears the worker environment; it does nothing unless the variable is set, and only `compose.music-local.yaml` sets it. PHPUnit files go in `tests/php/` (the `site` suite). Unit tests go in `games/workroom/test/`, which `games/units.sh` discovers because the folder has a `build.json`. No `*.spec.ts` is added to `tests/e2e/` (`select.ts --check` requires every spec there to be reachable from a rule); the browser check is `tests/e2e/workroom.local.ts`, run only by `make music-e2e` through `tests/e2e/local.config.ts`.
- Never bind ports 3000, 5173, 8000 or 8080. Docker runs use a unique `COMPOSE_PROJECT_NAME` and are torn down with `docker compose -p <name> down -v`; never touch the `siue` project, never prune. Never SSH, SFTP or SCP to www.cs; deploys happen on merge.
- Nothing secret is committed; the repository is public. Opened notes are never committed. Test keys under `games/workroom/test/fixtures/` are labelled test keys, used by nothing but tests.
- **The workroom is general (projects, kinds, characters).** `score.json` names the piece's `project` (`{ id, name }`), its `kind` (`music` or `sound`) and its `characters` (`[{ id, name, color }]`, possibly empty); a motif names a character id and takes its colour, and no character or colour is built into the code (Crete's Ariadne, Minotaur, Daedalus and Athens live only in Crete's fixture data). A `sound` piece is a sound effect or an ambience: it has no `bars`, `tempo` or bar spans, its times are seconds (its sections are optional named moments with `from`/`to` seconds), its duration is at least 0.05 s, `score.musicxml` is optional, and the page offers no Sheet music view and a Piano roll only when the score has notes. A `music` piece requires `bars`, `tempo` and `score.musicxml`. Either kind may use any lane family (the orchestral families and `impact`, `whoosh`, `ambience`, `voice`, `electronic`, `foley`, `ui`). The default zoom fits the whole piece, whatever its length. The server records each draft's `project_id`, `project_name` and `kind` from the validated `score.json` (Task 2). Schema stays version 1.
- Delivery: three PRs, each green on its own, in order: (1) the API and storage, (2) the page with its views and the glossary, (3) the answering tools with the owner's key tool.
- Comments and docs describe the current state, never history.
- Commits end with the committing session's attribution lines: a `Co-Authored-By:` line naming the model that commits and the session's `Claude-Session:` line. The commit blocks below show the shape with the lines this plan was written under:
  ```
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb
  ```

## Review Focus

1. **iPhone Safari plays and records different audio**: it may not play Opus in WebM and records `audio/mp4`. A draft may carry `audio.webm` and `audio.m4a`, the player picks the first source the browser can play, the recorder picks the first MIME type `MediaRecorder` supports, and pickup converts any of them with ffmpeg. Pinned in Task 8 (`pickSource`) and Task 14 (`pickMime`).
2. **A double tap or two quick deletes burn one CSRF token twice**: the page's API client sends one POST at a time, and on a `403 {"error":"csrf"}` fetches a fresh token once and retries once. Pinned in Task 14 (`api.test.ts`).
3. **The network drops mid-upload, or the server is full (409) or the note too large (413)**: the sealed note stays in the outbox, is never lost, and the owner is told why. Pinned in Task 14 (`outbox.test.ts`).
4. **After `make keys-rotate`**: notes sealed to the previous key still open in the page and in pickup, because the server's keyring holds every retained key; a device that signs in for the first time after the rotation unlocks the keyring once and opens old and new notes alike. Pinned in Task 10 (`vault.test.ts`), Task 12 (`test_keys_lifecycle.py`) and Task 13 (`test_pickup.py`).
5. **A truncated, bit-flipped or re-headed sealed bundle** (the clear fingerprint swapped): opening fails with a named reason, pickup leaves it waiting, the page shows "Could not open this note" instead of failing the whole history. Pinned in Task 10 (`seal.test.ts`) and Task 13 (`test_pickup.py`).
6. **Nothing of any key reaches browser storage**: unlocking, using and losing the vault touch no IndexedDB, `localStorage`, `sessionStorage`, cookie or Cache API, and the second browser context in the full check finds none. Pinned in Task 10 (`no-storage.test.ts`) and Task 15.
7. **An oversized, over-quota or twenty-first draft**: refused or evicted by the server alone, whatever the tool sends. Pinned in Task 1 (`MusicStoreTest`) and Task 2 (`MusicApiTest`).
8. **A 0.3-second sound effect on views built for minutes of music**: the default zoom fits the whole piece (the zoom ceiling scales with the fit, so a short sound can still zoom in), the axis reads milliseconds and seconds, sections are optional named moments, notes pinned on it carry seconds only (`fromBar`/`toBar` null), Sheet music is not offered and an empty Piano roll is not offered. Pinned in Task 5 (`score.test.ts`), Task 6 (`axis.test.ts`, `zoom.test.ts`, `timeline.test.ts`, `hit.test.ts`), Task 8 (`views.test.ts`) and Task 14 (`answer.test.ts`).
9. **A music draft without MusicXML, a sound draft with or without it, or a project or kind the server cannot record**: the server alone decides: music without `score.musicxml` is refused (`missing_file`), a `score.musicxml` that is not MusicXML is refused (`bad_file`), a sound draft without one is kept, and a draft whose project id, project name or kind is malformed is refused (`bad_score`) before anything is written. An older database gains the three columns when the store opens it. Pinned in Task 2 (`MusicApiTest`, `MusicStoreTest`) and Task 13 (`test_publish.py`).

## Decisions this plan makes (the spec leaves them open)

- **Where the page's TypeScript lives:** `websites/www.cs/games/workroom/`, built by `node _kit/build/build.mjs workroom`. The kit's build resolves the folder from `games/` and esbuild finds Preact by walking up to `games/node_modules`; a folder outside `games/` (such as `music/page/`) would need kit changes to resolve Preact, and `games/units.sh`, `npm run check` and `make test`'s `games/*/test.sh` loop find only `games/*/build.json`. The games hub lists only folders with a `metadata.yaml`, so the workroom is not a game card. Its `dist/` ships under `games/workroom/dist/` (public; nothing in it is secret), and the PHP pages under `music/` load it.
- **API routes are files** with the id in the query string (`api/note.php?id=`), because nginx (local) has no rewrite for `/music/api/notes/{id}` and the host's Apache rewrite support is unknown. Paths: `GET api/notes.php?state=waiting`, `GET api/note.php?id=`, `POST api/picked-up.php?id=`, `POST api/drafts.php?piece=&version=`, `POST api/keyring.php`.
- **Drafts and the keyring are raw request bodies, never multipart.** PHP parses a multipart body before the first line of the script runs, which would buffer an oversized upload before the 8 MB check could refuse it. A draft is one `application/octet-stream` body in the `SIUED1` bundle format (Formats); the script reads it only after the key, the method and the declared `Content-Length` have passed. A request with no `Content-Length` (chunked) is refused with 411.
- **A third scope, `keys:publish`**, lets `keys-init` and `keys-rotate` upload the locked keyring. The server cannot read inside a keyring, so it checks only the outer envelope (version, KDF, iterations, salt, IV and ciphertext sizes, total size) and keeps one, replacing the stored one on each upload; the upload happens before the deploy that makes a new key current. `make keys-upload` re-uploads the full keyring when that first upload could not happen (no API key yet, or offline). Two API keys: `music-pickup` (`notes:pickup`) and `music-publish` (`drafts:publish`, `keys:publish`). The scopes are the three strings in `ADMIN_KEY_SCOPES` (`admin/lib/bootstrap.php`), which is empty on `main`; Task 2 fills it and updates the admin test that asserts it empty.
- **The draft quota counts what remains.** The 100 MB check sums the new draft and the newest 19 stored drafts (the ones that survive the 20-draft limit), so a full store of small drafts can always roll forward; the check and the eviction run in one transaction, the check before any file is written.
- **One 1Password item per key pair** (category Password): `password` = the passphrase (so 1Password fills it on the workroom page), `private_key` (concealed, PKCS8 base64), `fingerprint`, website `https://www.cs.siue.edu/~wgrim/music/`, tag `siue-music-key`. A rotation creates a new item with the same passphrase and retitles the old one "(previous)"; which key is current is decided by the repository's `music/keys/public.json`, never by 1Password.
- **Projects, kinds and characters are data in `score.json`.** One page serves music and sound effects for any project, so nothing project-specific is in the code: the pieces list groups pieces under the project name the latest draft of each piece carries (projects ordered by their most recent publish, pieces likewise), the page colours a motif with its character's colour from the score, and a sound piece trades bars for seconds. The schema stays at version 1 because nothing is published yet.
- **The draft table gains its project columns by a guarded `ALTER TABLE`.** `music_drafts` has `project_id`, `project_name` and `kind` columns (defaults `''`, `''`, `'music'`). `Store`'s constructor adds each with `ALTER TABLE music_drafts ADD COLUMN ...` only when `PRAGMA table_info` does not list it, so a database whose `music_drafts` table has only the four base columns (Task 1's tests seed rows into one) upgrades in place and keeps its rows, and two requests opening the store at once cannot trip over each other. Recreating the table would drop those rows for no gain.
- **The committed public key** is `music/keys/public.json` (read by PHP and the tool) and `games/workroom/src/public-key.ts` (built into the page); a unit test keeps them equal. Before `make keys-init` both say "no key" and the page offers no note tools.
- **Committed drafts** live in `music/pieces/<piece>/v<N>/` (not deployed); `make music-publish` uploads one into the server's data directory, where the page reads it through a session. `changes` (Claude's change list) is part of `score.json`.
- **Per-piece waiting counts** need the sealed notes opened (the server cannot know a note's piece), so the pieces list shows the total waiting until the key is unlocked, then per-piece counts.
- **The unlocked keys stay in the page view's memory.** The page fetches the locked keyring from the signed-in session, unlocks every entry for which it holds a built-in public key, keeps the keys in memory until the view closes, and writes them nowhere. There is no remembered device: each visit asks for the passphrase (1Password fills it in), and a rotation changes nothing for the owner.
- **Music pages' CSP** is the admin CSP plus `media-src 'self' blob:`, so recorded notes and opened recordings can play.
- **Python tests run locally** (`make music-tools-test`): CI's runner has no `cryptography` and CI is not changed. The two directions of the cross-language crypto are pinned by committed fixtures that the CI-run Node tests also check.
- **The docker check runs on the admin kit's local base URL.** `compose.admin-local.yaml` (merged with the admin login) sets `ADMIN_BASE_URL=http://localhost/admin/`, a local base, so the kit accepts plain HTTP and the check's browser and API calls use `http://localhost:<port>/`; the admin data folder and the captured mail live inside the PHP container (`ADMIN_SMOKE_DIR`), as in `tests/admin-smoke.sh`. `compose.music-local.yaml` only adds `MUSIC_PUBLIC_KEYS`, which points the server at the test public keys.
- **The browser check uses a test-key bundle**: `games/workroom/tools/e2e-bundle.ts` builds the page with `public-key.ts` aliased to the test fixture into a temporary file, and the check routes `dist/workroom.js` to it, so the shipped bundle is never built with a test key.

## Formats

### Sealed note bundle (version `SIUEN1`)

```
offset      length  field
0           6       ASCII "SIUEN1"
6           32      fingerprint, raw SHA-256 of the public key's SPKI DER
38          2       L = wrapped key length, uint16 big-endian (512 for RSA-4096)
40          L       AES-256 key wrapped with RSA-OAEP SHA-256
40+L        12      AES-GCM IV
52+L        rest    AES-256-GCM ciphertext || 16-byte tag; additional data = bytes 0..37
plaintext = uint32 big-endian J | J bytes UTF-8 JSON NoteBody | audio bytes (possibly none)
```

`NoteBody` (JSON, version 1):

```json
{ "v": 1, "kind": "text", "piece": "ch1-labyrinth", "draft": 3,
  "from": 61.5, "to": 75.0, "fromBar": 33, "toBar": 40, "lane": "strings-low",
  "text": "make this bigger", "reaction": null, "curve": null,
  "audio": null, "made": "2026-10-20T14:03:11.000Z" }
```

`from` and `to` are seconds. `fromBar` and `toBar` are integers for a note on a `music` piece and `null` for a note on a `sound` piece, which has seconds only. `kind` is one of `text`, `speech`, `hum`, `react`, `energy`. `reaction` is one of `more-epic`, `calmer`, `darker`, `brighter`, `longer`, `shorter`, `love-it`, `not-this`. `curve` is a list of `[seconds, energy 0..1]`. `audio` is `{ "mime": string, "seconds": number ≤ 60 }` when audio bytes follow.

### Locked keyring (JSON, version 1)

```json
{ "v": 1, "kdf": "PBKDF2-SHA-256", "iterations": 600000, "salt": "<base64 16 bytes>",
  "iv": "<base64 12 bytes>", "ct": "<base64 AES-GCM(keyring plaintext) || 16-byte tag>" }
```

The AES-256 key is PBKDF2-HMAC-SHA-256 over the NFC-normalised, trimmed passphrase as UTF-8, with the salt and the iteration count. The AES-GCM additional data is the ASCII bytes `siue-music-keyring-v1`. The plaintext is UTF-8 JSON with the current key first and every retained earlier key after it:

```json
{ "v": 1, "keys": [ { "fingerprint": "<64 hex>", "pkcs8": "<base64 PKCS8 DER>" } ] }
```

Each fingerprint is the SHA-256 of that key's SPKI DER and appears once. The server checks only the outer envelope: exactly the six fields above, `v === 1`, `kdf`, `iterations >= 600000`, `salt` 16 bytes and `iv` 12 bytes once decoded, `ct` strict base64 of at least 17 bytes, and the whole body at most `Store::MAX_KEYRING_BYTES` (65,536; about 4.5 KB per retained RSA-4096 key). The browser and the tool refuse a keyring whose version, KDF or iterations differ, whose plaintext is malformed or repeats a fingerprint, and (browser) one that lacks the page's current key.

### Draft bundle (version `SIUED1`)

`POST api/drafts.php?piece=<id>&version=<n>`, `Content-Type: application/octet-stream`, scope `drafts:publish`. The body is:

```
offset  length  field
0       6       ASCII "SIUED1"
6       1       N = number of files, 1 to 5
7       ...     N entries, each: 1 byte name length, the ASCII name, uint32 big-endian size, the file's bytes
```

Names come from `score.json`, `score.musicxml`, `audio.webm`, `audio.m4a`, `spectrogram.png`, each at most once (`score.musicxml` is required in a music draft and optional in a sound draft), and the entries end exactly at the end of the body. The whole body is at most 8,388,608 bytes and the request must declare it in `Content-Length` (411 `length_required` without one, 413 `too_large` over).

### `music/keys/public.json`

```json
{ "schema": 1,
  "current": { "fingerprint": "<64 hex>", "spki": "<base64 SPKI DER>" },
  "previous": [ { "fingerprint": "<64 hex>", "spki": "<base64 SPKI DER>" } ] }
```

Every reader checks `fingerprint == sha256(base64decode(spki))`.

### `score.json`, schema 1

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

Colours everywhere match `^#[0-9a-f]{6}$`. Ids everywhere match `^[a-z0-9][a-z0-9-]{0,47}$`. The server checks only what it records or must refuse (`schema`, `kind`, `project`, `piece`, `draft`, the file set and the file signatures, Task 2); the page and the tool check every rule in the table.

## File map

```
websites/www.cs/
  music/
    .htaccess                     # admin headers with the music CSP; deny lib/ tools/ pieces/ keys/
    index.php piece.php           # session pages (thin)
    csrf.php notes.php note.php delete.php keyring.php drafts.php draft.php   # session JSON/bytes (thin)
    api/notes.php api/note.php api/picked-up.php api/drafts.php api/keyring.php  # API-key routes (thin)
    music.css                     # the pages' look (dark site look)
    README.md                     # what it is, security model, schema, make targets, local check
    lib/.htaccess                 # Require all denied
    lib/bootstrap.php             # requires admin/lib/bootstrap.php and the music classes; music_request/early_refusal/run/read_body helpers
    lib/PublicKeys.php            # Music\PublicKeys: public.json reader, fingerprints
    lib/Store.php                 # Music\Store, NoteRejected, DraftRejected: notes, drafts (limits, project and kind), the locked keyring
    lib/Http.php                  # Music\Http: header(), declaredLength(), refuseCrossSite(), json(), finish() (headers + music CSP), serveFile() (Range)
    lib/Api.php                   # Music\Api: API-key routes (scopes, draft bundle, keyring envelope)
    lib/Pages.php                 # Music\Pages: session routes and the two page shells
    keys/public.json              # written by keys-init / keys-rotate (absent until then)
    pieces/<piece>/v<N>/          # committed drafts: score.json [score.musicxml: always for music] audio.webm [audio.m4a] spectrogram.png
    tools/siue-music              # the owner's tool (entry point)
    tools/siue_music/{__init__,paths,op,sealing,keys,api,pickup,answering,publish,score,cli}.py
    tools/requirements.txt tools/requirements-answering.txt
    tools/tests/fake_op.py tools/tests/support.py tools/tests/make_fixture.py tools/tests/test_*.py
  games/workroom/
    build.json tsconfig.json tsconfig.test.json test.sh
    src/tsconfig.dom.json src/tsconfig.crypto.json
    src/glossary.json             # the glossary's one source (page and tool)
    src/score.ts tempo.ts axis.ts zoom.ts timeline.ts hit.ts pianoroll.ts spectro.ts glossary.ts gestures.ts player.ts tabs.ts load.ts   # DOM-free (view)
    src/note.ts answer.ts energy.ts recorder.ts                                   # DOM-free (answering)
    src/seal.ts unlock.ts vault.ts public-key.ts api.ts outbox.ts history.ts     # Web Crypto types (src/tsconfig.crypto.json)
    src/idb.ts sheet.ts main.ts   # DOM adapters and the entry
    src/ui/{Workroom,ViewTabs,Timeline,PianoRoll,SoundPicture,Sheet,Glossary,Player}.tsx                              # views
    src/ui/{UnlockPanel,PinComposer,HumButton,ReactBar,EnergyEditor,History,PiecesWaiting}.tsx                          # answering
    tools/make-fixtures.ts tools/make-draft-fixture.ts tools/e2e-bundle.ts
    test/*.test.ts test/fixture-key.ts test/fixtures/{score-v1.json,score-sound-v1.json,test-key.json,public.json,public-key.ts,keyring-by-python.json,note-text.sealed,note-hum.sealed,draft/,draft-sound/}
    dist/                         # built: workroom.js sheet.js (+ maps, THIRD_PARTY_LICENSES.txt)
  admin/lib/bootstrap.php         # + dashboard, fingerprint, three scopes (ADMIN_KEY_SCOPES)
  tests/php/AdminKeysTest.php     # registry assertion
  tests/php/MusicFakes.php MusicStoreTest.php MusicApiTest.php MusicPagesTest.php MusicBootstrapTest.php MusicDeployTest.php
  tests/e2e/local.config.ts tests/e2e/workroom.local.ts
  compose.music-local.yaml
  docker/nginx/default.conf       # deny /music/lib/ /music/tools/ /music/pieces/ /music/keys/
  docker/php/Dockerfile           # + env[MUSIC_PUBLIC_KEYS] (FPM clears the worker environment)
  deploy.sh  .gitignore  Makefile games/package.json games/package-lock.json
```

---

# PR 1: the API and storage (branch `music/api`)

Start from `main` after the admin login PR merged: `git switch -c music/api origin/main` in a new worktree.

### Task 1: Public keys and the note store

**Files:**
- Create: `websites/www.cs/music/lib/bootstrap.php`, `music/lib/PublicKeys.php`, `music/lib/Store.php`, `music/lib/.htaccess`
- Create: `websites/www.cs/tests/php/MusicFakes.php`, `tests/php/MusicStoreTest.php`

**Interfaces:**
- Consumes: `Admin\Db::open`, `Admin\Clock`, `Admin\StorageUnavailable`, `Kit\StoreDir` (from `admin/lib/store-dir.php`), `FakeClock`, `admin_tmp_db()`, `admin_tmp_dir()`, `req()`, `MemoryMailer` (from `tests/php/AdminPagesTest.php`).
- Produces:

```php
namespace Music;

final class PublicKeys {
    public function __construct(public readonly string $current, public readonly array $previous) {} // 64-hex fingerprints
    /** null when the file is missing; \RuntimeException when it is invalid or a fingerprint does not match its spki. */
    public static function fromFile(string $path): ?self;
    /** @return list<string> current first */
    public function all(): array;
    /** "abcd ef01 ..." groups of four for people to compare. */
    public static function display(string $hex): string;
}

final class NoteRejected extends \RuntimeException {
    /** $reason: too_large | full | bad_header | unknown_key | no_key */
    public function __construct(public readonly string $reason) {}
}
final class DraftRejected extends \RuntimeException {
    /** $reason: bad_piece | bad_version | missing_file | bad_file | too_large | over_quota | exists | bad_score */
    public function __construct(public readonly string $reason) {}
}

final class Store {
    public const MAGIC = 'SIUEN1';
    public const MAX_NOTE_BYTES = 2_097_152;
    public const MAX_NOTES = 2000;
    /** The most a draft request may carry, and so the most one draft holds: 8 MB. */
    public const MAX_REQUEST_BYTES = 8_388_608;
    /** Only this many drafts are kept; each successful publish deletes the older ones. */
    public const KEEP_DRAFTS = 20;
    /** The most the kept drafts may hold in total: 100 MB. */
    public const MAX_DRAFT_TOTAL_BYTES = 104_857_600;
    /** The locked keyring: about 4.5 KB per retained RSA-4096 key, room for a dozen rotations. */
    public const MAX_KEYRING_BYTES = 65_536;
    public const DRAFT_FILES = ['score.json', 'score.musicxml', 'audio.webm', 'audio.m4a', 'spectrogram.png'];
    /** $dir is <admin data dir>/music; claimed private (0700) with notes/ and drafts/ inside; creates the music tables. */
    public function __construct(\PDO $db, string $dir, \Admin\Clock $clock, ?PublicKeys $keys) {}
    /** @return array{id: string, size: int, sha256: string, arrived_at: int} @throws NoteRejected */
    public function addNote(string $sealed): array;
    /** @param 'waiting'|'picked-up'|null $state @return list<array{id: string, size: int, sha256: string, arrived_at: int, picked_up_at: ?int}> oldest first */
    public function notes(?string $state = null): array;
    public function noteBytes(string $id): ?string;
    /** true when the note exists (marking twice is fine). */
    public function markPickedUp(string $id): bool;
    public function deleteNote(string $id): bool;
    public function deleteAllNotes(): int;
    public function waitingCount(): int;
    /**
     * Keeps one draft. In one transaction, before any file is written: refuses when the files total more than
     * MAX_REQUEST_BYTES (too_large), when the draft exists, or when the new draft plus the newest KEEP_DRAFTS - 1
     * stored drafts (the ones that remain) total more than MAX_DRAFT_TOTAL_BYTES (over_quota). After the files
     * are written, deletes every draft (row and files) older than the newest KEEP_DRAFTS.
     * @param array<string, string> $files published name => the file's bytes @throws DraftRejected
     */
    public function putDraft(string $piece, int $version, array $files): void;
    /** @return list<array{piece: string, version: int, published_at: int}> newest first */
    public function drafts(?string $piece = null): array;
    /** The bytes of every stored draft, as recorded when each was kept. */
    public function draftBytes(): int;
    /** Absolute path, or null for an unknown draft or a name outside DRAFT_FILES. */
    public function draftFile(string $piece, int $version, string $name): ?string;
    /** Keeps the one locked keyring, replacing the stored one. The server never reads inside it. */
    public function putKeyring(string $lockedJson): void;
    /** @return array{locked: string, uploaded_at: int}|null */
    public function keyring(): ?array;
}
```

In `bootstrap.php`:

```php
function music_public_keys(): ?Music\PublicKeys;   // getenv('MUSIC_PUBLIC_KEYS') ?: __DIR__ . '/../keys/public.json'
function music_store(\PDO $db, Admin\Clock $clock): Music\Store; // dir = Admin\Db::dataDir() . '/music'
```

Tables (created by `Store` on the admin database, which already runs `PRAGMA secure_delete = ON`):

```sql
CREATE TABLE IF NOT EXISTS music_notes (id TEXT PRIMARY KEY, size INTEGER NOT NULL, sha256 TEXT NOT NULL, arrived_at INTEGER NOT NULL, picked_up_at INTEGER);
CREATE TABLE IF NOT EXISTS music_drafts (piece TEXT NOT NULL, version INTEGER NOT NULL, published_at INTEGER NOT NULL, size INTEGER NOT NULL, PRIMARY KEY (piece, version));
CREATE TABLE IF NOT EXISTS music_keyring (id INTEGER PRIMARY KEY CHECK (id = 1), locked TEXT NOT NULL, uploaded_at INTEGER NOT NULL);
```

- [ ] **Step 1: Write the test helpers** (`tests/php/MusicFakes.php`; not a test, no `Test` suffix)

```php
<?php
// Helpers for the music workroom's tests: fixed fingerprints, a fake sealed
// bundle (only its clear header is real), a draft bundle, a store in a temp
// directory, and a signed-in request.
declare(strict_types=1);

require_once __DIR__ . '/AdminFakes.php';
require_once __DIR__ . '/AdminPagesTest.php'; // MemoryMailer
require_once __DIR__ . '/../../music/lib/bootstrap.php';

const MUSIC_FP_CURRENT = 'abababababababababababababababababababababababababababababababab';
const MUSIC_FP_PREVIOUS = 'cdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcd';

function music_keys(): Music\PublicKeys
{
    return new Music\PublicKeys(MUSIC_FP_CURRENT, [MUSIC_FP_PREVIOUS]);
}

/** A bundle with a real header and $body random bytes after it. */
function music_sealed(string $fpHex = MUSIC_FP_CURRENT, int $body = 64): string
{
    return 'SIUEN1' . hex2bin($fpHex) . random_bytes($body);
}

/** The SIUED1 draft bundle (Formats) for name => bytes. */
function music_draft_bundle(array $files): string
{
    $out = 'SIUED1' . chr(count($files));
    foreach ($files as $name => $bytes) {
        $out .= chr(strlen($name)) . $name . pack('N', strlen($bytes)) . $bytes;
    }
    return $out;
}

/** @return array{Music\Store, PDO, string, FakeClock} store, database, music dir, clock */
function music_world(?Music\PublicKeys $keys = null): array
{
    $clock = new FakeClock(1_800_000_000);
    $db = admin_tmp_db();
    $dir = admin_tmp_dir() . '/music';
    return [new Music\Store($db, $dir, $clock, $keys ?? music_keys()), $db, $dir, $clock];
}

/** A request with a live session cookie (and HTTPS). */
function music_signed_in(Admin\Sessions $sessions, array $over = []): Admin\Request
{
    $header = $sessions->start(req(['https' => true]));
    preg_match('/' . preg_quote(Admin\Sessions::COOKIE, '/') . '=([0-9a-f]{64})/', $header, $m);
    return req(array_replace(['https' => true, 'cookies' => [Admin\Sessions::COOKIE => $m[1]]], $over));
}
```

- [ ] **Step 2: Write the failing tests** (`tests/php/MusicStoreTest.php`)

```php
<?php
// The store: only sealed bundles with a known key's header, the note limits,
// private files, deletes that remove row and file, pickup marks only; drafts
// are immutable, capped at 8 MB each, 20 in all and 100 MB in total; one
// locked keyring; public.json is checked against its own spki.
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

require_once __DIR__ . '/MusicFakes.php';

final class MusicStoreTest extends TestCase
{
    public function testAddsANoteAndKeepsOnlyIdSizeTimeAndHash(): void
    {
        [$s, $db, $dir] = music_world();
        $bytes = music_sealed();
        $n = $s->addNote($bytes);
        self::assertMatchesRegularExpression('/^[0-9a-f]{32}$/', $n['id']);
        self::assertSame(strlen($bytes), $n['size']);
        self::assertSame(hash('sha256', $bytes), $n['sha256']);
        self::assertSame(1_800_000_000, $n['arrived_at']);
        self::assertSame($bytes, $s->noteBytes($n['id']));
        $cols = array_column($db->query('PRAGMA table_info(music_notes)')->fetchAll(), 'name');
        self::assertSame(['id', 'size', 'sha256', 'arrived_at', 'picked_up_at'], $cols);
        self::assertSame(0, fileperms("$dir/notes/{$n['id']}.sealed") & 0077, 'note file is private');
        self::assertSame(0, fileperms("$dir/notes") & 0077, 'notes dir is private');
    }

    public function testSizeLimitIsExact(): void
    {
        [$s] = music_world();
        $s->addNote(music_sealed(MUSIC_FP_CURRENT, Music\Store::MAX_NOTE_BYTES - 38));
        try {
            $s->addNote(music_sealed(MUSIC_FP_CURRENT, Music\Store::MAX_NOTE_BYTES - 37));
            self::fail('one byte over must be refused');
        } catch (Music\NoteRejected $e) {
            self::assertSame('too_large', $e->reason);
        }
    }

    public function testCountLimit(): void
    {
        [$s, $db] = music_world();
        $insert = $db->prepare('INSERT INTO music_notes VALUES (?, 1, ?, 0, NULL)');
        for ($i = 0; $i < Music\Store::MAX_NOTES; $i++) {
            $insert->execute([sprintf('%032x', $i), str_repeat('0', 64)]);
        }
        try {
            $s->addNote(music_sealed());
            self::fail('the 2,001st note must be refused');
        } catch (Music\NoteRejected $e) {
            self::assertSame('full', $e->reason);
        }
    }

    public function testHeaderMustNameAKnownKey(): void
    {
        [$s] = music_world();
        $s->addNote(music_sealed(MUSIC_FP_PREVIOUS)); // a page built before a rotation
        foreach (['bad_header' => 'XXXXXX' . str_repeat("\0", 60), 'unknown_key' => music_sealed(str_repeat('ef', 32))] as $reason => $bytes) {
            try {
                $s->addNote($bytes);
                self::fail($reason);
            } catch (Music\NoteRejected $e) {
                self::assertSame($reason, $e->reason);
            }
        }
        [$none] = music_world(new Music\PublicKeys('', []));
        try {
            $none->addNote(music_sealed());
            self::fail('no key yet');
        } catch (Music\NoteRejected $e) {
            self::assertSame('no_key', $e->reason);
        }
    }

    public function testPickupOnlyMarks(): void
    {
        [$s, , $dir, $clock] = music_world();
        $id = $s->addNote(music_sealed())['id'];
        self::assertCount(1, $s->notes('waiting'));
        $clock->now += 5;
        self::assertTrue($s->markPickedUp($id));
        self::assertTrue($s->markPickedUp($id), 'twice is fine');
        self::assertSame([], $s->notes('waiting'));
        self::assertSame(1_800_000_005, $s->notes('picked-up')[0]['picked_up_at']);
        self::assertFileExists("$dir/notes/$id.sealed", 'picked-up notes stay sealed on the server');
        self::assertFalse($s->markPickedUp(str_repeat('0', 32)));
    }

    public function testDeleteRemovesRowAndFile(): void
    {
        [$s, $db, $dir] = music_world();
        $a = $s->addNote(music_sealed())['id'];
        $b = $s->addNote(music_sealed())['id'];
        self::assertTrue($s->deleteNote($a));
        self::assertFileDoesNotExist("$dir/notes/$a.sealed");
        self::assertNull($s->noteBytes($a));
        self::assertFalse($s->deleteNote($a));
        self::assertSame(1, $s->deleteAllNotes());
        self::assertFileDoesNotExist("$dir/notes/$b.sealed");
        self::assertSame(0, (int) $db->query('SELECT COUNT(*) FROM music_notes')->fetchColumn());
        self::assertSame(1, (int) $db->query('PRAGMA secure_delete')->fetchColumn());
    }

    public function testIdsAreCheckedBeforeTouchingFiles(): void
    {
        [$s] = music_world();
        self::assertNull($s->noteBytes('../../etc/passwd'));
        self::assertFalse($s->deleteNote('../x'));
    }

    public function testDraftsAreImmutableAndNamesAllowListed(): void
    {
        [$s, , $dir] = music_world();
        $s->putDraft('ch1-labyrinth', 2, ['score.json' => '{"schema":1}']);
        self::assertSame('{"schema":1}', file_get_contents((string) $s->draftFile('ch1-labyrinth', 2, 'score.json')));
        self::assertSame(0, fileperms("$dir/drafts/ch1-labyrinth/2/score.json") & 0077, 'draft files are private');
        self::assertNull($s->draftFile('ch1-labyrinth', 2, '../../admin.sqlite'));
        self::assertNull($s->draftFile('ch1-labyrinth', 3, 'score.json'));
        $this->expectExceptionObject(new Music\DraftRejected('exists'));
        $s->putDraft('ch1-labyrinth', 2, ['score.json' => '{"schema":1}']);
    }

    public function testADraftOfExactlyEightMegabytesIsKeptAndOneByteMoreIsRefused(): void
    {
        [$s, , $dir] = music_world();
        $s->putDraft('big', 1, ['score.json' => str_repeat('x', Music\Store::MAX_REQUEST_BYTES)]);
        self::assertSame(8_388_608, $s->draftBytes());
        try {
            $s->putDraft('big', 2, ['score.json' => str_repeat('x', Music\Store::MAX_REQUEST_BYTES - 1), 'audio.webm' => 'xx']);
            self::fail('8,388,609 bytes must be refused');
        } catch (Music\DraftRejected $e) {
            self::assertSame('too_large', $e->reason);
        }
        self::assertDirectoryDoesNotExist("$dir/drafts/big/2");
        self::assertSame(8_388_608, $s->draftBytes());
    }

    public function testTwentyDraftsStayAndTheTwentyFirstEvictsTheOldest(): void
    {
        [$s, $db, $dir, $clock] = music_world();
        for ($v = 1; $v <= 20; $v++) {
            $clock->now += 10;
            $s->putDraft($v % 2 === 0 ? 'even' : 'odd', $v, ['score.json' => "v$v"]);
        }
        self::assertCount(20, $s->drafts());
        self::assertNotNull($s->draftFile('odd', 1, 'score.json'), 'twenty are all kept');
        $clock->now += 10;
        $s->putDraft('odd', 21, ['score.json' => 'v21']);
        $kept = $s->drafts();
        self::assertCount(20, $kept);
        self::assertSame(['odd', 21], [$kept[0]['piece'], $kept[0]['version']], 'newest first');
        self::assertNull($s->draftFile('odd', 1, 'score.json'), 'the oldest is gone');
        self::assertFileDoesNotExist("$dir/drafts/odd/1/score.json");
        self::assertSame(20, (int) $db->query('SELECT COUNT(*) FROM music_drafts')->fetchColumn());
        self::assertSame('v2', file_get_contents((string) $s->draftFile('even', 2, 'score.json')));
        self::assertSame(52, $s->draftBytes(), 'v2 to v9 are 2 bytes each, v10 to v21 are 3: sizes follow the rows');
    }

    public function testDraftQuotaIsExactAndARefusalWritesNothing(): void
    {
        [$s, $db, $dir] = music_world();
        $seed = $db->prepare('INSERT INTO music_drafts (piece, version, published_at, size) VALUES (?, ?, ?, ?)');
        $seed->execute(['seed', 1, 1, 60_000_000]);
        $seed->execute(['seed', 2, 2, Music\Store::MAX_DRAFT_TOTAL_BYTES - 60_000_000 - 1000]);
        $before = [$s->drafts(), scandir("$dir/drafts")];
        try {
            $s->putDraft('next', 1, ['score.json' => str_repeat('x', 1001)]);
            self::fail('one byte past 104,857,600 must be refused');
        } catch (Music\DraftRejected $e) {
            self::assertSame('over_quota', $e->reason);
        }
        self::assertSame($before, [$s->drafts(), scandir("$dir/drafts")], 'storage is unchanged');
        self::assertDirectoryDoesNotExist("$dir/drafts/next");
        $s->putDraft('next', 1, ['score.json' => str_repeat('x', 1000)]);
        self::assertSame(Music\Store::MAX_DRAFT_TOTAL_BYTES, $s->draftBytes(), 'exactly 104,857,600 is allowed');
    }

    public function testTheQuotaCountsOnlyWhatRemainsAfterEviction(): void
    {
        [$s, $db] = music_world();
        $seed = $db->prepare('INSERT INTO music_drafts (piece, version, published_at, size) VALUES (?, ?, ?, ?)');
        // The seeded rows have no files on disk: eviction deletes the rows and skips what is not there.
        $seed->execute(['old', 1, 1, 100_000_000]); // the oldest of twenty: it goes when the next draft lands
        for ($v = 2; $v <= 20; $v++) {
            $seed->execute(['old', $v, $v, 1]);
        }
        $s->putDraft('new', 1, ['score.json' => str_repeat('x', 1_000_000)]);
        self::assertNull($s->draftFile('old', 1, 'score.json'));
        self::assertCount(20, $s->drafts());
        self::assertSame(1_000_019, $s->draftBytes());
    }

    public function testTheKeyringIsOneReplaceableDocument(): void
    {
        [$s, $db, , $clock] = music_world();
        self::assertNull($s->keyring());
        $s->putKeyring('{"v":1,"ct":"first"}');
        $clock->now += 1;
        $s->putKeyring('{"v":1,"ct":"second"}');
        self::assertSame(['locked' => '{"v":1,"ct":"second"}', 'uploaded_at' => 1_800_000_001], $s->keyring());
        self::assertSame(1, (int) $db->query('SELECT COUNT(*) FROM music_keyring')->fetchColumn());
    }

    public function testPublicKeysFileMustMatchItsSpki(): void
    {
        $dir = admin_tmp_dir();
        $spki = random_bytes(550);
        $good = ['schema' => 1, 'current' => ['fingerprint' => hash('sha256', $spki), 'spki' => base64_encode($spki)], 'previous' => []];
        file_put_contents("$dir/ok.json", json_encode($good));
        self::assertSame(hash('sha256', $spki), Music\PublicKeys::fromFile("$dir/ok.json")?->current);
        self::assertNull(Music\PublicKeys::fromFile("$dir/missing.json"));
        $good['current']['fingerprint'] = MUSIC_FP_CURRENT;
        file_put_contents("$dir/bad.json", json_encode($good));
        $this->expectException(RuntimeException::class);
        Music\PublicKeys::fromFile("$dir/bad.json");
    }

    public function testDisplayGroupsByFour(): void
    {
        self::assertSame('abab abab', substr(Music\PublicKeys::display(MUSIC_FP_CURRENT), 0, 9));
    }
}
```

- [ ] **Step 3: Run to see it fail**

Run: `cd websites/www.cs && vendor/bin/phpunit tests/php/MusicStoreTest.php`
Expected: FAIL — `music/lib/bootstrap.php` not found.

- [ ] **Step 4: Implement**

`music/lib/.htaccess`: `Require all denied`.

`music/lib/bootstrap.php`:

```php
<?php
// The music workroom's server code: the admin kit plus the music classes.
declare(strict_types=1);

require_once __DIR__ . '/../../admin/lib/bootstrap.php';
require_once __DIR__ . '/PublicKeys.php';
require_once __DIR__ . '/Store.php';

function music_public_keys(): ?Music\PublicKeys
{
    $path = getenv('MUSIC_PUBLIC_KEYS') ?: __DIR__ . '/../keys/public.json';
    return Music\PublicKeys::fromFile($path);
}

function music_store(\PDO $db, Admin\Clock $clock): Music\Store
{
    return new Music\Store($db, Admin\Db::dataDir() . '/music', $clock, music_public_keys());
}
```

`PublicKeys::fromFile`: `is_file` false → null; `json_decode(..., flags: JSON_THROW_ON_ERROR)`; require `schema === 1`, `current.fingerprint` matching `/^[0-9a-f]{64}$/` and equal to `hash('sha256', base64_decode($spki, true))`, the same for each `previous` entry; any failure throws `\RuntimeException('music/keys/public.json is invalid')` (no path in the message). `all()` = `array_values(array_filter([$this->current, ...$this->previous]))`. `display()` = `implode(' ', str_split($hex, 4))`.

`Store`:
- Constructor: `$sd = new \Kit\StoreDir('music storage:', \Admin\StorageUnavailable::class); $sd->claim($dir, true); $sd->claim("$dir/notes", true); $sd->claim("$dir/drafts", true);` then the three `CREATE TABLE IF NOT EXISTS` statements.
- `addNote`: `strlen > MAX_NOTE_BYTES` → `too_large`; `$keys === null || $keys->current === ''` → `no_key`; `strlen < 38 || substr(0, 6) !== MAGIC` → `bad_header`; `bin2hex(substr(6, 32))` not in `$keys->all()` → `unknown_key`; `SELECT COUNT(*)` ≥ `MAX_NOTES` → `full`. Then `id = bin2hex(random_bytes(16))`; write `"$dir/notes/$id.tmp"` with `fopen(..., 'x')`, `chmod 0600`, `rename` to `$id.sealed`; insert the row. The count check and insert run inside `BEGIN IMMEDIATE` … `COMMIT`; on a failed insert the file is unlinked.
- Every id parameter is checked against `/^[0-9a-f]{32}$/` first; a bad id returns null/false without touching the filesystem.
- `deleteNote`: in one transaction `DELETE FROM music_notes WHERE id = ?`, then `unlink` the file when it exists; returns whether a row went. `deleteAllNotes`: select ids, delete rows, unlink each file, return the count.
- `putDraft`: piece matches `/^[a-z0-9][a-z0-9-]{0,47}$/` else `bad_piece`; `1 ≤ version ≤ 9999` else `bad_version`; no files → `missing_file`; every key in `DRAFT_FILES` else `bad_file`. Then `BEGIN IMMEDIATE`; `$size = array_sum(array_map('strlen', $files))`; `$size > MAX_REQUEST_BYTES` → `too_large`; existing row → `exists`; `$size + COALESCE(SUM(size), 0)` over `SELECT size FROM music_drafts ORDER BY published_at DESC, rowid DESC LIMIT KEEP_DRAFTS - 1` greater than `MAX_DRAFT_TOTAL_BYTES` → `over_quota`. Each refusal rolls back and leaves no file and no directory. Then write each file into `"$dir/drafts/$piece/$version/"` (claimed private), mode 0600, insert the row with `size`, select the rows past `ORDER BY published_at DESC, rowid DESC LIMIT -1 OFFSET KEEP_DRAFTS`, delete them and remove their directories (files first, then `rmdir`, then the piece directory when empty), and `COMMIT`. Eviction deletes the rows it selected and skips every file or directory that is not there (the tests seed rows with no files), so a missing file is never an error. A failure while writing removes the half-written directory and rolls back.
- `drafts`: rows ordered `published_at DESC, rowid DESC`. `draftBytes`: `COALESCE(SUM(size), 0)`.
- `draftFile`: same piece/version checks, name in `DRAFT_FILES`, row exists, file exists → path.
- `putKeyring`: `INSERT ... ON CONFLICT(id) DO UPDATE` on the single row `id = 1`. `keyring`: that row or null.

- [ ] **Step 5: Run the tests**

Run: `vendor/bin/phpunit tests/php/MusicStoreTest.php` — PASS. Then `vendor/bin/phpunit --testsuite site` — PASS.

- [ ] **Step 6: Commit**

```bash
git add websites/www.cs/music/lib websites/www.cs/tests/php/MusicFakes.php websites/www.cs/tests/php/MusicStoreTest.php
git commit -m "Music workroom: sealed-note, draft and keyring storage

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb"
```

### Task 2: The API-key routes, the three scopes, and the draft's project and kind

**Files:**
- Create: `websites/www.cs/music/lib/Http.php`, `music/lib/Api.php`, `tests/php/MusicApiTest.php`
- Modify: `websites/www.cs/music/lib/Store.php` (the draft table gains `project_id`, `project_name` and `kind`; `putDraft` records them; `drafts()` returns them), `tests/php/MusicStoreTest.php` (three new tests)
- Modify: `websites/www.cs/admin/lib/bootstrap.php` (`ADMIN_KEY_SCOPES`, the registry behind `Admin\Keys::SCOPES`), `tests/php/AdminKeysTest.php` (the registry assertion), `music/lib/bootstrap.php` (require the two files)

**Interfaces:**
- Consumes: `Store`, `PublicKeys`, `Admin\Keys::check/create/SCOPES`, `Admin\Headers`, `Admin\Response`.
- Produces, in `Store` (Task 1's class, extended; every Task 1 call still works because `$about` is optional):

```php
namespace Music;

final class Store {
    public const KINDS = ['music', 'sound'];
    /**
     * $about is taken from the validated score.json: project_id (matches /^[a-z0-9][a-z0-9-]{0,47}$/), project_name (1 to 80
     * characters) and kind (one of KINDS); anything else throws DraftRejected('bad_score') before the transaction opens. null records
     * no project: '' and '' and 'music' (the store's own tests; a published draft always has one).
     * @param array<string, string> $files
     * @param array{project_id: string, project_name: string, kind: string}|null $about
     */
    public function putDraft(string $piece, int $version, array $files, ?array $about = null): void;
    /** @return list<array{piece: string, version: int, published_at: int, project_id: string, project_name: string, kind: string}> newest first */
    public function drafts(?string $piece = null): array;
}
```

- Produces, in `Http` and `Api`:

```php
namespace Music;

final class Http {
    /** The admin CSP plus media-src for recorded and opened audio. */
    public const CSP_EXTRA = "; media-src 'self' blob:";
    public static function csp(): string; // \Admin\Headers::LIST['Content-Security-Policy'] . self::CSP_EXTRA
    public static function header(\Admin\Request $r, string $name): ?string; // case-insensitive
    /** The Content-Length header as a non-negative integer; null when it is missing or not all digits. */
    public static function declaredLength(\Admin\Request $r): ?int;
    /** 403 {"error":"cross_site"} when Sec-Fetch-Site is present and is not "same-origin"; null otherwise. */
    public static function refuseCrossSite(\Admin\Request $r): ?\Admin\Response;
    /** JSON response with every admin header and the music CSP. */
    public static function json(int $status, array $data): \Admin\Response;
    /** Adds the admin headers and the music CSP to any response. */
    public static function finish(\Admin\Response $res): \Admin\Response;
    /** 200 whole file or 206 one byte range ("bytes=a-b", "bytes=a-", "bytes=-n"); 416 on a bad range. */
    public static function serveFile(string $path, string $mime, ?string $range): \Admin\Response;
}

final class Api {
    public const DRAFT_MAGIC = 'SIUED1';
    public function __construct(Store $store, \Admin\Keys $keys) {}
    public function listNotes(\Admin\Request $r): \Admin\Response;   // GET, notes:pickup, ?state=waiting|picked-up → {"notes":[{id,size,sha256,arrived_at,picked_up_at}]}
    public function getNote(\Admin\Request $r): \Admin\Response;     // GET, notes:pickup, ?id= → application/octet-stream
    public function pickedUp(\Admin\Request $r): \Admin\Response;    // POST, notes:pickup, ?id= → {"id","picked_up":true}; 404 unknown
    /**
     * POST ?piece=&version=, drafts:publish; the body is a SIUED1 draft bundle (Formats). $read(int $n) returns the
     * request body's first $n bytes and is called only after the key, the method and the declared length have passed.
     */
    public function publishDraft(\Admin\Request $r, \Closure $read): \Admin\Response; // 201 {"piece","version"}
    /** POST, keys:publish; the body is the locked keyring JSON (Formats). $read as for publishDraft. */
    public function publishKeyring(\Admin\Request $r, \Closure $read): \Admin\Response; // 201 {"uploaded":true}
}
```

Scopes, exactly: `listNotes`, `getNote` and `pickedUp` need `notes:pickup`; `publishDraft` needs `drafts:publish`; `publishKeyring` needs `keys:publish`. A key holding any other scope gets 403 on every route; the API has no delete route and no method that deletes.

Errors are JSON `{"error": "<reason>"}`: 405 `method`, 400 `bad_id`/`bad_state`/`bad_length`, 404 `not_found`, 409 `exists`, 411 `length_required`, 413 `too_large`/`over_quota`, 422 `bad_bundle`/`bad_piece`/`bad_version`/`missing_file`/`bad_file`/`bad_score`/`bad_keyring`. A failed `Keys::check` returns its own response unchanged, passed through `Http::finish`. The method is checked **after** the key check, so an unauthenticated caller learns nothing.

`publishDraft`, in this order: key (`drafts:publish`), method (`POST`), the declared length (`Http::declaredLength`: none → 411 `length_required`; over `Store::MAX_REQUEST_BYTES` → 413 `too_large`, with the body never read), then `$read($length)` (a body whose length differs from the declared one → 400 `bad_length`), then the bundle (`SIUED1`, 1 to 5 entries, names from `DRAFT_FILES`, each at most once, entries ending exactly at the end of the body, else 422 `bad_bundle`), then the files: `score.json` parses, `schema === 1`, `piece.id` equals the query's `piece` and `draft` its `version`, `kind` is `music` or `sound`, `project.id` matches the id pattern and `project.name` is a string of 1 to 80 characters (else 422 `bad_score`); `spectrogram.png` starts `"\x89PNG"`; `audio.webm` starts `"\x1A\x45\xDF\xA3"`; `audio.m4a` has `ftyp` at offset 4; at least one audio file; `score.musicxml` is required when `kind` is `music` (absent: 422 `missing_file`) and optional when it is `sound`, and a `score.musicxml` that is present, of either kind, must contain `<score-partwise` (else 422 `bad_file`); then `Store::putDraft` with the score's `project.id`, `project.name` and `kind` as `$about`, whose refusals map `exists` → 409, `too_large`/`over_quota` → 413 and the rest to 422 with the reason as the error.

`publishKeyring`: key (`keys:publish`), method, declared length (none → 411; over `Store::MAX_KEYRING_BYTES` → 413 `too_large`, body never read), `$read($length)`, then the envelope check of Formats ("Locked keyring"): exactly the six fields `v`, `kdf`, `iterations`, `salt`, `iv`, `ct`, `v === 1`, `kdf === 'PBKDF2-SHA-256'`, integer `iterations >= 600000`, `salt` strict base64 of 16 bytes, `iv` strict base64 of 12 bytes, `ct` strict base64 of at least 17 bytes (else 422 `bad_keyring`); the body, as received, is stored with `Store::putKeyring`, replacing the stored keyring. The server cannot look inside the keyring, so it cannot check that the keyring holds the current key; the page does that when it unlocks (Task 10).

- [ ] **Step 1: Write the failing tests** (`tests/php/MusicApiTest.php`)

```php
<?php
// The API-key routes: HTTPS only, exactly the right scope on every route,
// header-only keys, no delete route at all, pickup marks after a separate
// call, drafts and the keyring validated before they are kept, and the draft
// limits (8 MB per request, 20 kept, 100 MB in total) enforced by the server.
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

require_once __DIR__ . '/MusicFakes.php';

final class MusicApiTest extends TestCase
{
    private const BASE = 'https://www.cs.siue.edu/~wgrim/admin/';

    private Music\Api $api;
    private Music\Store $store;
    private Admin\Keys $keys;
    private PDO $db;
    /** How many times a route read its request body. */
    private int $reads = 0;

    protected function setUp(): void
    {
        [$this->store, $this->db, , $clock] = music_world();
        $this->keys = new Admin\Keys($this->db, $clock, null, self::BASE);
        $this->api = new Music\Api($this->store, $this->keys);
    }

    private function as(string $key, array $over = []): Admin\Request
    {
        $headers = ['authorization' => "Bearer $key"] + ($over['headers'] ?? []);
        unset($over['headers']);
        return req(array_replace(['https' => true, 'method' => 'GET', 'headers' => $headers], $over));
    }

    /** A POST declaring $length bytes (default: the body's own length). */
    private function post(string $key, array $query, string $body, ?int $length = null): Admin\Request
    {
        return $this->as($key, ['method' => 'POST', 'query' => $query, 'headers' => ['content-length' => (string) ($length ?? strlen($body))]]);
    }

    private function reading(string $body): Closure
    {
        return function (int $n) use ($body): string {
            $this->reads++;
            return substr($body, 0, $n);
        };
    }

    private function body(Admin\Response $res): array
    {
        return json_decode($res->body, true, flags: JSON_THROW_ON_ERROR);
    }

    /** A complete, valid draft's files: a music draft carries score.musicxml, a sound draft does not. */
    private function draftFiles(string $piece = 'ch1-labyrinth', int $draft = 1, string $kind = 'music', string $project = 'crete'): array
    {
        return array_filter([
            'score.json' => json_encode(['schema' => 1, 'kind' => $kind, 'project' => ['id' => $project, 'name' => ucfirst($project)], 'piece' => ['id' => $piece, 'title' => 'T'], 'draft' => $draft]),
            'score.musicxml' => $kind === 'music' ? '<?xml version="1.0"?><score-partwise version="4.0"></score-partwise>' : null,
            'audio.webm' => "\x1A\x45\xDF\xA3" . random_bytes(100),
            'spectrogram.png' => "\x89PNG\r\n\x1A\n" . random_bytes(100),
        ], static fn(?string $bytes): bool => $bytes !== null);
    }

    /** The files with score.json's fields changed (a field set to null is removed). */
    private function withScore(array $files, array $changes): array
    {
        $score = array_filter(array_replace(json_decode($files['score.json'], true), $changes), static fn($v): bool => $v !== null);
        return ['score.json' => json_encode($score)] + $files;
    }

    private function publish(string $key, array $files, string $piece, int $version): Admin\Response
    {
        $body = music_draft_bundle($files);
        return $this->api->publishDraft($this->post($key, ['piece' => $piece, 'version' => (string) $version], $body), $this->reading($body));
    }

    private function keyring(array $over = []): array
    {
        return $over + ['v' => 1, 'kdf' => 'PBKDF2-SHA-256', 'iterations' => 600000, 'salt' => base64_encode(random_bytes(16)),
            'iv' => base64_encode(random_bytes(12)), 'ct' => base64_encode(random_bytes(2400))];
    }

    private function uploadKeyring(string $key, string $body, ?int $length = null): Admin\Response
    {
        return $this->api->publishKeyring($this->post($key, [], $body, $length), $this->reading($body));
    }

    public function testScopesAreRegistered(): void
    {
        self::assertSame(['notes:pickup', 'drafts:publish', 'keys:publish'], Admin\Keys::SCOPES);
        foreach (Admin\Keys::SCOPES as $scope) {
            self::assertMatchesRegularExpression('/^[0-9a-f]{64}$/', $this->keys->create("t-$scope", [$scope]));
        }
    }

    public function testPickupNeedsItsScopeAndHttps(): void
    {
        $pickup = $this->keys->create('pickup', ['notes:pickup']);
        $publish = $this->keys->create('publish', ['drafts:publish', 'keys:publish']);
        $this->store->addNote(music_sealed());
        self::assertSame(200, $this->api->listNotes($this->as($pickup, ['query' => ['state' => 'waiting']]))->status);
        self::assertSame(403, $this->api->listNotes($this->as($publish, ['query' => ['state' => 'waiting']]))->status, 'wrong scope');
        self::assertSame(403, $this->api->listNotes($this->as($pickup, ['https' => false, 'query' => ['state' => 'waiting']]))->status, 'HTTP');
        self::assertSame(401, $this->api->listNotes(req(['https' => true, 'query' => ['state' => 'waiting', 'key' => $pickup]]))->status, 'key in URL ignored');
        self::assertSame(401, $this->api->listNotes($this->as(str_repeat('0', 64), ['query' => ['state' => 'waiting']]))->status);
    }

    public function testEveryRouteDemandsExactlyItsOwnScope(): void
    {
        $id = $this->store->addNote(music_sealed())['id'];
        // Each route as [call, the status the key that holds its scope gets]. The empty draft and keyring bodies pass the scope
        // and are refused as malformed (422), so the own-scope status proves the route ran past the key check.
        $routes = [
            'notes:pickup' => [
                'listNotes' => [fn(string $k) => $this->api->listNotes($this->as($k, ['query' => ['state' => 'waiting']])), 200],
                'getNote' => [fn(string $k) => $this->api->getNote($this->as($k, ['query' => ['id' => $id]])), 200],
                'pickedUp' => [fn(string $k) => $this->api->pickedUp($this->as($k, ['method' => 'POST', 'query' => ['id' => $id]])), 200],
            ],
            'drafts:publish' => ['publishDraft' => [fn(string $k) => $this->api->publishDraft($this->post($k, [], ''), $this->reading('')), 422]],
            'keys:publish' => ['publishKeyring' => [fn(string $k) => $this->api->publishKeyring($this->post($k, [], ''), $this->reading('')), 422]],
        ];
        $held = [];
        foreach (array_keys($routes) as $scope) {
            $held[$scope] = $this->keys->create("only-$scope", [$scope]);
        }
        foreach ($routes as $scope => $calls) {
            foreach ($calls as $route => [$call, $ownStatus]) {
                foreach ($held as $heldScope => $key) {
                    $reads = $this->reads;
                    $status = $call($key)->status;
                    if ($heldScope === $scope) {
                        self::assertSame($ownStatus, $status, "$route with its own scope $scope");
                    } else {
                        self::assertSame(403, $status, "$route with only $heldScope");
                        self::assertSame($reads, $this->reads, "$route read a body for a key without $scope");
                    }
                }
            }
        }
        self::assertCount(1, $this->store->notes(), 'no route removed anything');
    }

    public function testListGetAndMarkInThatOrder(): void
    {
        $k = $this->keys->create('pickup', ['notes:pickup']);
        $bytes = music_sealed();
        $id = $this->store->addNote($bytes)['id'];
        $list = $this->body($this->api->listNotes($this->as($k, ['query' => ['state' => 'waiting']])))['notes'];
        self::assertSame([['id' => $id, 'size' => strlen($bytes), 'sha256' => hash('sha256', $bytes), 'arrived_at' => 1_800_000_000, 'picked_up_at' => null]], $list);
        $got = $this->api->getNote($this->as($k, ['query' => ['id' => $id]]));
        self::assertSame(200, $got->status);
        self::assertSame($bytes, $got->body);
        self::assertSame('application/octet-stream', $got->headers['Content-Type']);
        self::assertCount(1, $this->store->notes('waiting'), 'a download never marks');
        self::assertSame(405, $this->api->pickedUp($this->as($k, ['query' => ['id' => $id]]))->status, 'GET cannot mark');
        self::assertSame(200, $this->api->pickedUp($this->as($k, ['method' => 'POST', 'query' => ['id' => $id]]))->status);
        self::assertSame([], $this->store->notes('waiting'));
        self::assertSame(404, $this->api->pickedUp($this->as($k, ['method' => 'POST', 'query' => ['id' => str_repeat('0', 32)]]))->status);
        self::assertSame(400, $this->api->getNote($this->as($k, ['query' => ['id' => '../x']]))->status);
    }

    public function testEveryResponseCarriesTheHeaders(): void
    {
        $k = $this->keys->create('pickup', ['notes:pickup']);
        foreach ([$this->api->listNotes($this->as($k, ['query' => ['state' => 'waiting']])), $this->api->listNotes(req(['https' => true]))] as $res) {
            foreach (Admin\Headers::LIST as $name => $value) {
                $want = $name === 'Content-Security-Policy' ? Music\Http::csp() : $value;
                self::assertSame($want, $res->headers[$name] ?? null, $name);
            }
        }
    }

    public function testPublishDraftValidatesFiles(): void
    {
        $k = $this->keys->create('publish', ['drafts:publish']);
        $files = $this->draftFiles();
        $res = $this->publish($k, $files, 'ch1-labyrinth', 1);
        self::assertSame(201, $res->status);
        self::assertSame(['piece' => 'ch1-labyrinth', 'version' => 1], $this->body($res));
        self::assertSame($files['audio.webm'], file_get_contents((string) $this->store->draftFile('ch1-labyrinth', 1, 'audio.webm')));
        self::assertSame(
            [['piece' => 'ch1-labyrinth', 'version' => 1, 'published_at' => 1_800_000_000, 'project_id' => 'crete', 'project_name' => 'Crete', 'kind' => 'music']],
            $this->store->drafts(),
            'the project and kind come from score.json',
        );
        self::assertSame(409, $this->publish($k, $files, 'ch1-labyrinth', 1)->status, 'drafts are immutable');
        self::assertSame('bad_score', $this->body($this->publish($k, $files, 'ch1-labyrinth', 2))['error'], 'draft must equal version');
        self::assertSame('bad_score', $this->body($this->publish($k, $files, 'other-piece', 3))['error'], 'piece must equal the query');
        self::assertSame(422, $this->publish($k, ['spectrogram.png' => 'GIF89a'] + $files, 'ch1-labyrinth', 1)->status, 'a fake png');
        self::assertSame(422, $this->publish($k, array_diff_key($this->draftFiles('ch1-labyrinth', 4), ['audio.webm' => 1]), 'ch1-labyrinth', 4)->status, 'no audio');
        self::assertSame('bad_bundle', $this->body($this->api->publishDraft(
            $this->post($k, ['piece' => 'ch1-labyrinth', 'version' => '5'], 'not a bundle'),
            $this->reading('not a bundle'),
        ))['error']);
        $pickup = $this->keys->create('pickup', ['notes:pickup']);
        self::assertSame(403, $this->publish($pickup, $files, 'ch1-labyrinth', 1)->status);
    }

    public function testMusicNeedsMusicXmlAndSoundDoesNot(): void
    {
        $k = $this->keys->create('publish', ['drafts:publish']);
        $music = array_diff_key($this->draftFiles('ch2-descent', 1), ['score.musicxml' => 1]);
        $res = $this->publish($k, $music, 'ch2-descent', 1);
        self::assertSame(422, $res->status, 'a music draft without score.musicxml');
        self::assertSame('missing_file', $this->body($res)['error']);
        self::assertSame([], $this->store->drafts(), 'nothing was written');

        $sound = $this->draftFiles('cannon-fire', 1, 'sound', 'tankity');
        self::assertArrayNotHasKey('score.musicxml', $sound);
        self::assertSame(201, $this->publish($k, $sound, 'cannon-fire', 1)->status, 'a sound draft needs no score.musicxml');
        self::assertSame(['tankity', 'Tankity', 'sound'], [$this->store->drafts()[0]['project_id'], $this->store->drafts()[0]['project_name'], $this->store->drafts()[0]['kind']]);

        $notXml = ['score.musicxml' => 'not musicxml'] + $this->draftFiles('cannon-fire', 2, 'sound', 'tankity');
        $res = $this->publish($k, $notXml, 'cannon-fire', 2);
        self::assertSame(['bad_file', 422], [$this->body($res)['error'], $res->status], 'a score.musicxml that is not MusicXML is refused for either kind');
        $notXml = ['score.musicxml' => 'not musicxml'] + $this->draftFiles('ch2-descent', 2);
        self::assertSame('bad_file', $this->body($this->publish($k, $notXml, 'ch2-descent', 2))['error']);
        $withXml = ['score.musicxml' => '<score-partwise></score-partwise>'] + $this->draftFiles('cannon-fire', 3, 'sound', 'tankity');
        self::assertSame(201, $this->publish($k, $withXml, 'cannon-fire', 3)->status, 'a sound draft may carry one');
    }

    public function testADraftWithoutAProjectOrKindTheServerCanRecordIsRefused(): void
    {
        $k = $this->keys->create('publish', ['drafts:publish']);
        $base = $this->draftFiles();
        $bad = [
            'no kind' => ['kind' => null],
            'unknown kind' => ['kind' => 'noise'],
            'no project' => ['project' => null],
            'project is not an object' => ['project' => 'crete'],
            'project id with capitals' => ['project' => ['id' => 'Crete', 'name' => 'Crete']],
            'project id too long' => ['project' => ['id' => str_repeat('a', 49), 'name' => 'Crete']],
            'project name empty' => ['project' => ['id' => 'crete', 'name' => '']],
            'project name 81 characters' => ['project' => ['id' => 'crete', 'name' => str_repeat('n', 81)]],
            'project name not a string' => ['project' => ['id' => 'crete', 'name' => 7]],
        ];
        foreach ($bad as $why => $change) {
            $res = $this->publish($k, $this->withScore($base, $change), 'ch1-labyrinth', 1);
            self::assertSame(['bad_score', 422], [$this->body($res)['error'], $res->status], $why);
        }
        self::assertSame([], $this->store->drafts(), 'nothing was written');
        $edge = $this->withScore($base, ['project' => ['id' => str_repeat('a', 48), 'name' => str_repeat('n', 80)]]);
        self::assertSame(201, $this->publish($k, $edge, 'ch1-labyrinth', 1)->status, '48-character id and 80-character name are allowed');
    }

    public function testADraftBodyOverEightMegabytesIsRefusedBeforeItIsRead(): void
    {
        $k = $this->keys->create('publish', ['drafts:publish']);
        $res = $this->api->publishDraft($this->post($k, ['piece' => 'ch1-labyrinth', 'version' => '1'], '', 8_388_609), $this->reading(''));
        self::assertSame(413, $res->status);
        self::assertSame('too_large', $this->body($res)['error']);
        self::assertSame(0, $this->reads, 'the body is never read');
        self::assertSame([], $this->store->drafts());
    }

    public function testADraftBodyOfExactlyEightMegabytesIsAccepted(): void
    {
        $k = $this->keys->create('publish', ['drafts:publish']);
        $files = $this->draftFiles();
        $files['audio.webm'] .= str_repeat("\0", Music\Store::MAX_REQUEST_BYTES - strlen(music_draft_bundle($files)));
        $body = music_draft_bundle($files);
        self::assertSame(8_388_608, strlen($body));
        $res = $this->api->publishDraft($this->post($k, ['piece' => 'ch1-labyrinth', 'version' => '1'], $body), $this->reading($body));
        self::assertSame(201, $res->status);
        self::assertSame(array_sum(array_map('strlen', $files)), $this->store->draftBytes());
    }

    public function testADraftNeedsADeclaredLengthThatTheBodyMatches(): void
    {
        $k = $this->keys->create('publish', ['drafts:publish']);
        $query = ['piece' => 'ch1-labyrinth', 'version' => '1'];
        $none = $this->as($k, ['method' => 'POST', 'query' => $query]);
        self::assertSame(411, $this->api->publishDraft($none, $this->reading(''))->status);
        $bad = $this->as($k, ['method' => 'POST', 'query' => $query, 'headers' => ['content-length' => '12abc']]);
        self::assertSame(411, $this->api->publishDraft($bad, $this->reading(''))->status);
        self::assertSame(0, $this->reads);
        $body = music_draft_bundle($this->draftFiles());
        $res = $this->api->publishDraft($this->post($k, $query, $body, strlen($body) + 10), $this->reading($body));
        self::assertSame(400, $res->status);
        self::assertSame('bad_length', $this->body($res)['error']);
        self::assertSame([], $this->store->drafts());
    }

    public function testTheTwentyFirstDraftEvictsTheOldest(): void
    {
        $k = $this->keys->create('publish', ['drafts:publish']);
        for ($v = 1; $v <= 21; $v++) {
            self::assertSame(201, $this->publish($k, $this->draftFiles('ch1-labyrinth', $v), 'ch1-labyrinth', $v)->status, "draft $v");
        }
        self::assertCount(20, $this->store->drafts());
        self::assertNull($this->store->draftFile('ch1-labyrinth', 1, 'score.json'), 'the oldest is gone');
        self::assertNotNull($this->store->draftFile('ch1-labyrinth', 2, 'score.json'));
        self::assertNotNull($this->store->draftFile('ch1-labyrinth', 21, 'score.json'));
    }

    public function testADraftThatWouldPassTheQuotaIsRefusedAndNothingIsWritten(): void
    {
        $k = $this->keys->create('publish', ['drafts:publish']);
        $this->db->prepare('INSERT INTO music_drafts (piece, version, published_at, size) VALUES (?, ?, ?, ?)')
            ->execute(['seed', 1, 1, Music\Store::MAX_DRAFT_TOTAL_BYTES - 10]);
        $before = $this->store->drafts();
        $res = $this->publish($k, $this->draftFiles(), 'ch1-labyrinth', 1);
        self::assertSame(413, $res->status);
        self::assertSame('over_quota', $this->body($res)['error']);
        self::assertSame($before, $this->store->drafts());
        self::assertNull($this->store->draftFile('ch1-labyrinth', 1, 'score.json'));
    }

    public function testKeyringUploadNeedsKeysScopeAndAWellFormedEnvelope(): void
    {
        $k = $this->keys->create('publish', ['keys:publish']);
        $good = json_encode($this->keyring());
        self::assertSame(201, $this->uploadKeyring($k, $good)->status);
        self::assertSame($good, $this->store->keyring()['locked']);
        $second = json_encode($this->keyring());
        self::assertSame(201, $this->uploadKeyring($k, $second)->status);
        self::assertSame($second, $this->store->keyring()['locked'], 'a new upload replaces the stored keyring');
        foreach ([
            'weak KDF' => $this->keyring(['iterations' => 1000]),
            'wrong version' => $this->keyring(['v' => 2]),
            'wrong KDF' => $this->keyring(['kdf' => 'scrypt']),
            'short salt' => $this->keyring(['salt' => base64_encode('short')]),
            'short iv' => $this->keyring(['iv' => base64_encode(random_bytes(8))]),
            'ct not base64' => $this->keyring(['ct' => '***']),
            'ct too short' => $this->keyring(['ct' => base64_encode(random_bytes(16))]),
            'extra field' => $this->keyring(['fingerprint' => MUSIC_FP_CURRENT]),
        ] as $why => $bad) {
            self::assertSame(422, $this->uploadKeyring($k, json_encode($bad))->status, $why);
        }
        self::assertSame(422, $this->uploadKeyring($k, 'not json')->status);
        self::assertSame($second, $this->store->keyring()['locked'], 'refused uploads change nothing');
        $drafts = $this->keys->create('drafts', ['drafts:publish']);
        self::assertSame(403, $this->uploadKeyring($drafts, $good)->status);
    }

    public function testKeyringSizeLimitIsExactAndCheckedBeforeReading(): void
    {
        $k = $this->keys->create('publish', ['keys:publish']);
        $base = $this->keyring(['ct' => '']);
        $room = Music\Store::MAX_KEYRING_BYTES - strlen(json_encode($base, JSON_UNESCAPED_SLASHES));
        $envelope = json_encode(['ct' => str_repeat('A', 4 * intdiv($room, 4))] + $base, JSON_UNESCAPED_SLASHES);
        $body = $envelope . str_repeat(' ', Music\Store::MAX_KEYRING_BYTES - strlen($envelope));
        self::assertSame(65_536, strlen($body));
        self::assertSame(201, $this->uploadKeyring($k, $body)->status);
        $reads = $this->reads;
        self::assertSame(413, $this->uploadKeyring($k, '', 65_537)->status);
        self::assertSame($reads, $this->reads, 'an oversized keyring is refused from its declared length');
    }

    public function testTheApiHasNoWayToDelete(): void
    {
        $methods = array_map(fn(ReflectionMethod $m) => $m->name, (new ReflectionClass(Music\Api::class))->getMethods(ReflectionMethod::IS_PUBLIC));
        self::assertSame([], array_values(array_filter($methods, fn(string $m) => stripos($m, 'delete') !== false || stripos($m, 'remove') !== false)));
        self::assertFileDoesNotExist(dirname(__DIR__, 2) . '/music/api/delete.php');
    }

    public function testServeFileRanges(): void
    {
        $f = admin_tmp_dir() . '/a.bin';
        file_put_contents($f, '0123456789');
        self::assertSame(['200', '0123456789'], [(string) Music\Http::serveFile($f, 'audio/webm', null)->status, Music\Http::serveFile($f, 'audio/webm', null)->body]);
        $part = Music\Http::serveFile($f, 'audio/webm', 'bytes=2-4');
        self::assertSame([206, '234', 'bytes 2-4/10'], [$part->status, $part->body, $part->headers['Content-Range']]);
        self::assertSame('789', Music\Http::serveFile($f, 'audio/webm', 'bytes=-3')->body);
        self::assertSame(416, Music\Http::serveFile($f, 'audio/webm', 'bytes=20-30')->status);
        self::assertSame('bytes', Music\Http::serveFile($f, 'audio/webm', null)->headers['Accept-Ranges']);
    }

    public function testCrossSiteRequestsAreRefusedForSessionData(): void
    {
        $at = fn(string $site) => req(['https' => true, 'headers' => ['sec-fetch-site' => $site]]);
        self::assertSame(403, Music\Http::refuseCrossSite($at('cross-site'))?->status);
        self::assertSame(403, Music\Http::refuseCrossSite($at('same-site'))?->status);
        self::assertNull(Music\Http::refuseCrossSite($at('same-origin')));
        self::assertNull(Music\Http::refuseCrossSite(req(['https' => true])), 'curl and older browsers send none');
    }
}
```

Add these three tests to Task 1's `tests/php/MusicStoreTest.php` (before its closing brace; the class already requires `MusicFakes.php`):

```php
    public function testADraftRecordsItsProjectAndKind(): void
    {
        [$s, , , $clock] = music_world();
        $s->putDraft('ch1-labyrinth', 1, ['score.json' => '{}'], ['project_id' => 'crete', 'project_name' => 'Crete', 'kind' => 'music']);
        $clock->now += 10;
        $s->putDraft('cannon-fire', 1, ['score.json' => '{}'], ['project_id' => 'tankity', 'project_name' => 'Tankity', 'kind' => 'sound']);
        $clock->now += 10;
        $s->putDraft('bare', 1, ['score.json' => '{}']);
        $rows = $s->drafts();
        self::assertSame(['bare', 'cannon-fire', 'ch1-labyrinth'], array_column($rows, 'piece'), 'newest first');
        self::assertSame(['', '', 'music'], [$rows[0]['project_id'], $rows[0]['project_name'], $rows[0]['kind']], 'no $about records no project');
        self::assertSame(['tankity', 'Tankity', 'sound'], [$rows[1]['project_id'], $rows[1]['project_name'], $rows[1]['kind']]);
        self::assertSame(['crete', 'Crete', 'music'], [$rows[2]['project_id'], $rows[2]['project_name'], $rows[2]['kind']]);
        self::assertSame(['cannon-fire'], array_column($s->drafts('cannon-fire'), 'piece'), 'the piece filter still works');
    }

    public function testADraftWhoseProjectOrKindCannotBeKeptIsRefusedBeforeAnythingIsWritten(): void
    {
        [$s, , $dir] = music_world();
        $ok = ['project_id' => 'crete', 'project_name' => 'Crete', 'kind' => 'music'];
        foreach ([
            'kind' => ['kind' => 'noise'] + $ok,
            'id with capitals' => ['project_id' => 'Crete'] + $ok,
            'id with a slash' => ['project_id' => '../x'] + $ok,
            'id 49 characters' => ['project_id' => str_repeat('a', 49)] + $ok,
            'empty name' => ['project_name' => ''] + $ok,
            'name of 81 characters' => ['project_name' => str_repeat('n', 81)] + $ok,
            'missing key' => ['project_id' => 'crete', 'project_name' => 'Crete'],
        ] as $why => $about) {
            try {
                $s->putDraft('ch1-labyrinth', 1, ['score.json' => '{}'], $about);
                self::fail($why . ' must be refused');
            } catch (Music\DraftRejected $e) {
                self::assertSame('bad_score', $e->reason, $why);
            }
        }
        self::assertSame([], $s->drafts());
        self::assertDirectoryDoesNotExist("$dir/drafts/ch1-labyrinth");
        $s->putDraft('edge', 1, ['score.json' => '{}'], ['project_id' => str_repeat('a', 48), 'project_name' => str_repeat('é', 80), 'kind' => 'sound']);
        self::assertSame(str_repeat('é', 80), $s->drafts()[0]['project_name'], '80 characters, counted as characters');
    }

    public function testADatabaseFromBeforeTheProjectColumnsUpgradesInPlace(): void
    {
        $db = admin_tmp_db();
        $db->exec('CREATE TABLE music_drafts (piece TEXT NOT NULL, version INTEGER NOT NULL, published_at INTEGER NOT NULL, size INTEGER NOT NULL, PRIMARY KEY (piece, version))');
        $db->exec("INSERT INTO music_drafts (piece, version, published_at, size) VALUES ('old', 1, 5, 7)");
        $dir = admin_tmp_dir() . '/music';
        $clock = new FakeClock(1_800_000_000);
        $s = new Music\Store($db, $dir, $clock, music_keys());
        self::assertSame(
            [['piece' => 'old', 'version' => 1, 'published_at' => 5, 'project_id' => '', 'project_name' => '', 'kind' => 'music']],
            $s->drafts(),
            'the old row is kept, with the column defaults',
        );
        $s->putDraft('new', 1, ['score.json' => '{}'], ['project_id' => 'crete', 'project_name' => 'Crete', 'kind' => 'music']);
        self::assertSame('crete', $s->drafts('new')[0]['project_id']);
        new Music\Store($db, $dir, $clock, music_keys()); // opening it again changes nothing and does not trip over the columns
        self::assertCount(2, $s->drafts());
    }
```

- [ ] **Step 2: Run to see it fail**

Run: `vendor/bin/phpunit tests/php/MusicApiTest.php tests/php/MusicStoreTest.php`
Expected: FAIL — class `Music\Api` not found, `testScopesAreRegistered` fails on the empty registry, and the three new store tests fail on the missing columns and the missing `$about` parameter.

- [ ] **Step 3: Implement**

`Store` (Modify: `music/lib/Store.php`). In the constructor, replace the `music_drafts` line with the table including the three columns and the guarded upgrade:

```php
        $this->db->exec("CREATE TABLE IF NOT EXISTS music_drafts (piece TEXT NOT NULL, version INTEGER NOT NULL, published_at INTEGER NOT NULL, size INTEGER NOT NULL, project_id TEXT NOT NULL DEFAULT '', project_name TEXT NOT NULL DEFAULT '', kind TEXT NOT NULL DEFAULT 'music', PRIMARY KEY (piece, version))");
        // A database made before these columns existed gains them here; each is added only when the table lacks it.
        $have = array_column($this->db->query('PRAGMA table_info(music_drafts)')->fetchAll(\PDO::FETCH_ASSOC), 'name');
        foreach (['project_id' => "''", 'project_name' => "''", 'kind' => "'music'"] as $column => $default) {
            if (in_array($column, $have, true)) {
                continue;
            }
            try {
                $this->db->exec("ALTER TABLE music_drafts ADD COLUMN $column TEXT NOT NULL DEFAULT $default");
            } catch (\PDOException $e) {
                if (!str_contains($e->getMessage(), 'duplicate column')) { // another request added it between the check and the ALTER
                    throw $e;
                }
            }
        }
```

Add the constants beside `DRAFT_FILES` and `PIECE`: `public const KINDS = ['music', 'sound'];` and `private const PROJECT = '/^[a-z0-9][a-z0-9-]{0,47}$/D';`. Replace `putDraft`'s signature, check `$about` after the file-name loop (before the transaction), and record the columns in the `INSERT`:

```php
    public function putDraft(string $piece, int $version, array $files, ?array $about = null): void
    {
        // ... the piece, version, empty and file-name checks, unchanged ...
        $about ??= ['project_id' => '', 'project_name' => '', 'kind' => 'music'];
        if (!self::aboutIsKeepable($about)) {
            throw new DraftRejected('bad_score');
        }
        // ... the transaction (add `$about` to its closure's `use ($piece, $version, $files, $about)` list), with the INSERT replaced by:
                $this->db->prepare('INSERT INTO music_drafts (piece, version, published_at, size, project_id, project_name, kind) VALUES (?, ?, ?, ?, ?, ?, ?)')
                    ->execute([$piece, $version, $this->clock->now(), $size, $about['project_id'], $about['project_name'], $about['kind']]);
    }

    /** A recorded project is a valid id with a name of 1 to 80 characters; ('', '') is the one "no project" value. */
    private static function aboutIsKeepable(array $about): bool
    {
        $id = $about['project_id'] ?? null;
        $name = $about['project_name'] ?? null;
        $kind = $about['kind'] ?? null;
        if (!is_string($id) || !is_string($name) || !is_string($kind) || !in_array($kind, self::KINDS, true)) {
            return false;
        }
        if ($id === '' && $name === '') {
            return true;
        }
        return preg_match(self::PROJECT, $id) === 1 && mb_strlen($name) >= 1 && mb_strlen($name) <= 80;
    }
```

`drafts()` selects and returns the three columns:

```php
    /** @return list<array{piece: string, version: int, published_at: int, project_id: string, project_name: string, kind: string}> newest first */
    public function drafts(?string $piece = null): array
    {
        $q = $this->db->prepare('SELECT piece, version, published_at, project_id, project_name, kind FROM music_drafts WHERE (? IS NULL OR piece = ?) ORDER BY published_at DESC, rowid DESC');
        $q->execute([$piece, $piece]);
        return array_map(static fn(array $r): array => [
            'piece' => (string) $r['piece'],
            'version' => (int) $r['version'],
            'published_at' => (int) $r['published_at'],
            'project_id' => (string) $r['project_id'],
            'project_name' => (string) $r['project_name'],
            'kind' => (string) $r['kind'],
        ], $q->fetchAll(\PDO::FETCH_ASSOC));
    }
```

`Api::publishDraft` passes `['project_id' => $score['project']['id'], 'project_name' => $score['project']['name'], 'kind' => $score['kind']]` as `$about` (a `project` that is not an array, or a missing `kind`, is `bad_score` there, before the call), and reads `score.musicxml`'s presence from the bundle's file names for the music rule.

In `admin/lib/bootstrap.php`, set the registry that `Admin\Keys::SCOPES` reads to the three scopes, in this order: `const ADMIN_KEY_SCOPES = ['notes:pickup', 'drafts:publish', 'keys:publish'];` (the hub's key panel offers each as a checkbox labelled with the scope). In `tests/php/AdminKeysTest.php` replace `testProductionRegistryIsEmpty` with `testProductionRegistryHoldsTheWorkroomScopes`, which asserts `Admin\Keys::SCOPES` equals those three strings; every other admin test passes its own scope list.

`Http::header`: loop `$r->headers`, compare `strcasecmp`. `Http::declaredLength`: `Http::header($r, 'Content-Length')`; null unless it matches `/^\d{1,12}$/D`; else the integer. `Http::refuseCrossSite`: `Sec-Fetch-Site` absent or `same-origin` → null; anything else → `Http::json(403, ['error' => 'cross_site'])`. `Http::finish`: `$res->headers = \Admin\Headers::apply($res->headers); $res->headers['Content-Security-Policy'] = self::csp(); return $res;`. `Http::json`: `finish(new Response($status, ['Content-Type' => 'application/json'], json_encode($data, JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES)))`. `serveFile`: `Accept-Ranges: bytes`, `Content-Type`, `Content-Length`; a `Range` matching `/^bytes=(\d*)-(\d*)$/` with a satisfiable span → 206 with `Content-Range: bytes a-b/size`; any other `Range` value → 416 with `Content-Range: bytes */size`.

`Api`: each method starts `if ($deny = $this->keys->check($r, '<scope>')) return Http::finish($deny);`, then checks the method (`405`), then the remaining steps in the order given above, mapping `NoteRejected`/`DraftRejected` reasons to the statuses above. The bundle parser reads the magic, the count, then each entry with `unpack('N', ...)`, and refuses (422 `bad_bundle`) a truncated entry, a name outside `Store::DRAFT_FILES`, a repeated name, a count outside 1 to 5 or bytes left over.

- [ ] **Step 4: Run the tests**

Run: `vendor/bin/phpunit tests/php/MusicApiTest.php tests/php/MusicStoreTest.php` — PASS; `vendor/bin/phpunit --testsuite site` — PASS (the admin tests still pass with the registry filled).

- [ ] **Step 5: Commit**

```bash
git add websites/www.cs/music/lib websites/www.cs/admin/lib/bootstrap.php websites/www.cs/tests/php/MusicApiTest.php websites/www.cs/tests/php/MusicStoreTest.php websites/www.cs/tests/php/AdminKeysTest.php
git commit -m "Music workroom: the API-key routes, their scopes, the draft limits, and each draft's project and kind

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb"
```

### Task 3: The session routes, the two page shells, and the hub entry

**Files:**
- Create: `websites/www.cs/music/lib/Pages.php`, `tests/php/MusicPagesTest.php`
- Modify: `music/lib/bootstrap.php` (require `Pages.php`), `admin/lib/bootstrap.php` (`admin_dashboards()` and `admin_key_fingerprints()` return the workroom's entries)

**Interfaces:**
- Consumes: `Store`, `PublicKeys`, `Http`, `Admin\Pages::requireAdmin`, `Admin\Sessions::csrf/checkCsrf`, `admin_refuse_plain_http`, `admin_refuse_script_fetch`.
- Produces:

```php
namespace Music;

final class Pages {
    /** $assetVersion: 10 hex of games/workroom/dist/workroom.js (the ?v= on the script); $baseUrl: admin_base_url(). */
    public function __construct(Store $store, \Admin\Pages $admin, \Admin\Sessions $sessions, ?PublicKeys $keys, string $assetVersion, string $baseUrl) {}
    public function index(\Admin\Request $r): \Admin\Response;       // GET index.php: pieces list grouped by project (HTML)
    public function piece(\Admin\Request $r): \Admin\Response;       // GET piece.php?id=<piece>[&v=<n>]: the page shell (HTML)
    public function csrf(\Admin\Request $r): \Admin\Response;        // GET csrf.php → {"csrf"}
    public function notes(\Admin\Request $r, string $body): \Admin\Response; // GET notes.php → {"notes":[{id,size,arrived_at,picked_up_at}]}; POST (X-CSRF, body = bundle) → 201 {"id","csrf"}
    public function note(\Admin\Request $r): \Admin\Response;        // GET note.php?id= → bundle bytes
    public function delete(\Admin\Request $r): \Admin\Response;      // POST delete.php (X-CSRF; post id=<id> or all=1) → {"deleted":n,"csrf"}
    public function keyring(\Admin\Request $r): \Admin\Response;     // GET keyring.php → {"keyring": <the locked keyring object>}; 404 {"error":"no_keyring"} before the first upload
    public function drafts(\Admin\Request $r): \Admin\Response;      // GET drafts.php?piece= → {"drafts":[{version,published_at}]}
    public function draftFile(\Admin\Request $r): \Admin\Response;   // GET draft.php?piece=&v=&file= (Range for audio)
}
```

Every method runs the same gates, in this order, and returns the first refusal through `Http::finish`:

1. **HTTPS:** `admin_refuse_plain_http($r, $this->baseUrl)` (403 `HTTPS required.`; only a local base URL permits plain HTTP).
2. **Who may ask:** the two HTML pages (`index`, `piece`) run `admin_refuse_script_fetch($r)`, the Fetch Metadata guard the admin pages run (403 `Open this page directly.` for any request a script, embed or frame made). The routes the workroom's own script fetches, and the draft files its `<audio>` and `<img>` elements load, run `Http::refuseCrossSite($r)` instead (403 `{"error":"cross_site"}` unless `Sec-Fetch-Site` is absent or `same-origin`).
3. **Session:** `$this->admin->requireAdmin($r)`. Its 303 points at the relative `login.php`, which under `/music/` is `/music/login.php` (404); `Pages` replaces that response's `Location` with `$this->baseUrl . 'login.php'`, the absolute admin login, and the 503 storage page passes through unchanged; either goes through `Http::finish`.
4. **CSRF**, for POST: `checkCsrf($r, Http::header($r, 'X-CSRF') ?? '')` false → 403 `{"error":"csrf"}`. `checkCsrf` spends the session's token on every call, right or wrong, so after any refusal the session has no usable token until the caller fetches a fresh one from `csrf.php`.
5. The work.

Every POST success returns the next token from `$sessions->csrf($r)`. Upload errors: 413 `too_large`, 409 `full`, 422 `bad_header`/`unknown_key`, 503 `no_key`. The page shell (`piece`) is a full HTML document: `<body data-view="piece" data-piece="<id>" data-version="<n or empty>">`, `<meta name="csrf" content="...">`, `<link rel="stylesheet" href="music.css?v=...">`, `<main id="workroom"></main>`, `<script type="module" src="../games/workroom/dist/workroom.js?v=<assetVersion>"></script>`. `index` renders, server side, the pieces grouped by project: from `Store::drafts()` (newest publish first) it keeps the first row of each piece (its latest draft), and groups those rows by their `project_id` in order of first appearance, so projects are ordered by their most recent publish and the pieces inside a project likewise; a project's heading is the `project_name` of its newest row, and a piece recorded with no project (`project_id` of `''`, which a published draft never has) is listed in a last group headed "No project". Each group is `<section class="project"><h2 class="project">NAME</h2><ul class="pieces">ROWS</ul></section>`. A row is one per piece (its latest version; `piece.title` and the first three `changes[].text` read from that draft's `score.json`, all escaped with `htmlspecialchars(..., ENT_QUOTES)`); the page also carries the total waiting count and the same mount and script with `data-view="index"`. A row is `<li class="piece" data-kind="KIND"><a href="piece.php?id=ID" data-waiting="ID">TITLE</a><span class="waiting-count"></span><ul class="changes">…</ul></li>` (`KIND` is `music` or `sound`): the link is named by the piece title alone (the browser check clicks it by that name), and the `data-waiting` attribute and the empty span next to it are what `PiecesWaiting` (Task 15) fills. Draft files are served with `Content-Type` from a fixed map (`score.json` application/json, `score.musicxml` application/vnd.recordare.musicxml+xml, `audio.webm` audio/webm, `audio.m4a` audio/mp4, `spectrogram.png` image/png).

A script on another user's `~folder` page is same-origin with www.cs, so `refuseCrossSite` stops cross-site pages only. What keeps a sibling page from reading the notes is that they are sealed to a key it does not have, and the keyring is locked under a passphrase it does not have; the CSRF token guards every change.

In `admin/lib/bootstrap.php`: `admin_dashboards()` returns `['Music workroom' => '../music/']`, and `admin_key_fingerprints()` returns `['Music notes key' => <value>]` where the value is `Music\PublicKeys::display($k->current)` for `$k = Music\PublicKeys::fromFile(__DIR__ . '/../../music/keys/public.json')`, or `not made yet (make keys-init)` when null (require `../../music/lib/PublicKeys.php` there; it has no dependencies). The hub (`Admin\Pages::hub`) already renders both lists.

- [ ] **Step 1: Write the failing tests** (`tests/php/MusicPagesTest.php`)

```php
<?php
// The session routes: plain HTTP, script-made page loads and cross-site data
// requests refused; a session for everything; CSRF on every POST (burned on
// use, the next token returned); deletes remove row and file; an API key is
// never a session; the locked keyring and drafts go only to a session.
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

require_once __DIR__ . '/MusicFakes.php';

final class MusicPagesTest extends TestCase
{
    private const BASE = 'https://example.test/~wgrim/admin/';

    private Music\Pages $pages;
    private Music\Store $store;
    private Admin\Sessions $sessions;
    private Admin\Keys $keys;
    private FakeClock $clock;
    private string $dir;

    protected function setUp(): void
    {
        [$this->store, $db, $this->dir, $clock] = music_world();
        $this->clock = $clock;
        $this->sessions = new Admin\Sessions($db, $clock, '/~wgrim/');
        $this->keys = new Admin\Keys($db, $clock, null, self::BASE);
        $admin = new Admin\Pages($db, $clock, new MemoryMailer(), self::BASE, static fn(): bool => true, $this->keys);
        $this->pages = new Music\Pages($this->store, $admin, $this->sessions, music_keys(), '0123456789', self::BASE);
    }

    private function csrfFor(Admin\Request $r): string
    {
        return json_decode($this->pages->csrf($r)->body, true)['csrf'];
    }

    public function testEveryRouteNeedsASession(): void
    {
        $anon = req(['https' => true, 'query' => ['id' => str_repeat('0', 32), 'piece' => 'x', 'v' => '1', 'file' => 'score.json']]);
        $login = self::BASE . 'login.php';
        foreach (['index', 'piece', 'csrf', 'note', 'keyring', 'drafts', 'draftFile', 'delete'] as $route) {
            $res = $this->pages->$route($anon);
            self::assertSame(303, $res->status, $route);
            self::assertSame($login, $res->headers['Location'], "$route sends the browser to the admin login, not to /music/login.php");
        }
        $res = $this->pages->notes($anon, '');
        self::assertSame([303, $login], [$res->status, $res->headers['Location']]);
    }

    public function testAnApiKeyIsNotASession(): void
    {
        $key = $this->keys->create('all', ['notes:pickup', 'drafts:publish', 'keys:publish']);
        $id = $this->store->addNote(music_sealed())['id'];
        $this->store->putKeyring('{"v":1}');
        $bearer = ['authorization' => "Bearer $key"];
        self::assertSame(303, $this->pages->delete(req(['https' => true, 'method' => 'POST', 'headers' => $bearer, 'post' => ['id' => $id]]))->status);
        self::assertNotNull($this->store->noteBytes($id), 'an API key cannot delete');
        self::assertSame(303, $this->pages->keyring(req(['https' => true, 'headers' => $bearer]))->status, 'the keyring goes only to a session');
        self::assertSame(303, $this->pages->note(req(['https' => true, 'headers' => $bearer, 'query' => ['id' => $id]]))->status);
    }

    public function testHttpsIsRequired(): void
    {
        $r = music_signed_in($this->sessions, ['https' => false]);
        foreach (['index', 'piece', 'csrf', 'keyring', 'drafts'] as $route) {
            self::assertSame(403, $this->pages->$route($r)->status, $route);
        }
    }

    public function testPagesRefuseRequestsAScriptMade(): void
    {
        $script = ['sec-fetch-mode' => 'cors', 'sec-fetch-dest' => 'empty', 'sec-fetch-site' => 'same-origin'];
        $navigation = ['sec-fetch-mode' => 'navigate', 'sec-fetch-dest' => 'document', 'sec-fetch-site' => 'none'];
        foreach (['index', 'piece'] as $route) {
            $query = ['query' => ['id' => 'ch1-labyrinth']];
            self::assertSame(403, $this->pages->$route(music_signed_in($this->sessions, ['headers' => $script] + $query))->status, "$route by script");
            self::assertSame(200, $this->pages->$route(music_signed_in($this->sessions, ['headers' => $navigation] + $query))->status, "$route by navigation");
            self::assertSame(200, $this->pages->$route(music_signed_in($this->sessions, $query))->status, "$route without Fetch Metadata headers");
        }
    }

    public function testDataRoutesRefuseCrossSiteRequests(): void
    {
        $this->store->putKeyring('{"v":1}');
        foreach (['cross-site', 'same-site'] as $site) {
            $r = music_signed_in($this->sessions, ['headers' => ['sec-fetch-site' => $site]]);
            foreach (['csrf', 'notes', 'keyring', 'drafts'] as $route) {
                $res = $route === 'notes' ? $this->pages->notes($r, '') : $this->pages->$route($r);
                self::assertSame(403, $res->status, "$route from $site");
            }
        }
        $own = music_signed_in($this->sessions, ['headers' => ['sec-fetch-site' => 'same-origin', 'sec-fetch-mode' => 'cors', 'sec-fetch-dest' => 'empty']]);
        self::assertSame(200, $this->pages->keyring($own)->status, "the page's own script is same-origin");
    }

    public function testUploadNeedsCsrfAndReturnsTheNextToken(): void
    {
        // Every check spends the session's token, right or wrong (Admin\Sessions::checkCsrf), so the order below matters.
        $r = music_signed_in($this->sessions, ['method' => 'POST']);
        $cookies = req(['https' => true, 'cookies' => $r->cookies]);
        $withToken = fn(string $t) => req(['https' => true, 'method' => 'POST', 'cookies' => $r->cookies, 'headers' => ['x-csrf' => $t]]);
        self::assertSame(403, $this->pages->notes($r, music_sealed())->status, 'no token');
        $token = $this->csrfFor($cookies);
        $res = $this->pages->notes($withToken($token), music_sealed());
        self::assertSame(201, $res->status);
        $body = json_decode($res->body, true);
        self::assertMatchesRegularExpression('/^[0-9a-f]{32}$/', $body['id']);
        self::assertNotSame($token, $body['csrf']);
        // The token returned by a success is the next one and works at once.
        $second = $this->pages->notes($withToken($body['csrf']), music_sealed());
        self::assertSame(201, $second->status, 'the returned token works');
        $next = json_decode($second->body, true)['csrf'];
        // A spent token is refused, and that refusal spends the token the last success returned.
        self::assertSame(403, $this->pages->notes($withToken($token), music_sealed())->status, 'a token works once');
        self::assertSame(403, $this->pages->notes($withToken($next), music_sealed())->status, 'a refusal spends the current token too');
        // The page's recovery: ask csrf.php for a fresh token, then retry.
        self::assertSame(201, $this->pages->notes($withToken($this->csrfFor($cookies)), music_sealed())->status, 'a fresh token from csrf.php works');
    }

    public function testUploadLimitsAreReported(): void
    {
        $r = music_signed_in($this->sessions);
        $post = fn() => req(['https' => true, 'method' => 'POST', 'cookies' => $r->cookies, 'headers' => ['x-csrf' => $this->csrfFor($r)]]);
        self::assertSame(413, $this->pages->notes($post(), music_sealed(MUSIC_FP_CURRENT, Music\Store::MAX_NOTE_BYTES))->status);
        self::assertSame(422, $this->pages->notes($post(), music_sealed(str_repeat('ef', 32)))->status);
    }

    public function testDeleteOneAndAllRemoveRowAndFile(): void
    {
        $r = music_signed_in($this->sessions);
        $a = $this->store->addNote(music_sealed())['id'];
        $b = $this->store->addNote(music_sealed())['id'];
        $post = fn(array $fields, ?string $t = null) => req(['https' => true, 'method' => 'POST', 'cookies' => $r->cookies,
            'headers' => ['x-csrf' => $t ?? $this->csrfFor($r)], 'post' => $fields]);
        self::assertSame(403, $this->pages->delete($post(['id' => $a], 'nope'))->status);
        self::assertNotNull($this->store->noteBytes($a));
        $one = $this->pages->delete($post(['id' => $a]));
        self::assertSame(1, json_decode($one->body, true)['deleted']);
        self::assertFileDoesNotExist("{$this->dir}/notes/$a.sealed");
        $all = $this->pages->delete($post(['all' => '1']));
        self::assertSame(1, json_decode($all->body, true)['deleted']);
        self::assertFileDoesNotExist("{$this->dir}/notes/$b.sealed");
        self::assertSame([], $this->store->notes());
    }

    public function testTheKeyringAndTheHistoryGoToTheSession(): void
    {
        $r = music_signed_in($this->sessions);
        $none = $this->pages->keyring($r);
        self::assertSame(404, $none->status);
        self::assertSame('no_keyring', json_decode($none->body, true)['error']);
        $locked = ['v' => 1, 'kdf' => 'PBKDF2-SHA-256', 'iterations' => 600000, 'salt' => 'c2FsdA==', 'iv' => 'aXY=', 'ct' => 'Y3Q='];
        $this->store->putKeyring(json_encode($locked));
        $res = $this->pages->keyring($r);
        self::assertSame(200, $res->status);
        self::assertSame($locked, json_decode($res->body, true)['keyring']);
        $id = $this->store->addNote(music_sealed())['id'];
        $this->store->markPickedUp($id);
        $notes = json_decode($this->pages->notes($r, '')->body, true)['notes'];
        self::assertSame([$id], array_column($notes, 'id'), 'picked-up notes stay in the history');
        self::assertArrayNotHasKey('sha256', $notes[0]);
    }

    public function testPieceShellLoadsTheBundleAndCarriesAToken(): void
    {
        $r = music_signed_in($this->sessions, ['query' => ['id' => 'ch1-labyrinth']]);
        $res = $this->pages->piece($r);
        self::assertSame(200, $res->status);
        self::assertStringContainsString('src="../games/workroom/dist/workroom.js?v=0123456789"', $res->body);
        self::assertMatchesRegularExpression('/<meta name="csrf" content="[0-9a-f]{64}">/', $res->body);
        self::assertStringContainsString('data-piece="ch1-labyrinth"', $res->body);
        self::assertSame(Music\Http::csp(), $res->headers['Content-Security-Policy']);
        self::assertSame(400, $this->pages->piece(music_signed_in($this->sessions, ['query' => ['id' => '<script>']]))->status);
    }

    public function testTheIndexListsEachPieceAsALinkNamedByItsTitle(): void
    {
        $score = ['schema' => 1, 'piece' => ['id' => 'test-piece', 'title' => 'Test piece: <the> Labyrinth wakes'], 'draft' => 1, 'changes' => [
            ['text' => 'Horns carry the theme.'], ['text' => 'Strings < softer'], ['text' => 'Third change'], ['text' => 'Fourth-change-text'],
        ]];
        $this->store->putDraft('test-piece', 1, ['score.json' => json_encode($score)], ['project_id' => 'crete', 'project_name' => 'Crete', 'kind' => 'music']);
        $res = $this->pages->index(music_signed_in($this->sessions));
        self::assertSame(200, $res->status);
        self::assertStringContainsString(
            '<a href="piece.php?id=test-piece" data-waiting="test-piece">Test piece: &lt;the&gt; Labyrinth wakes</a><span class="waiting-count"></span>',
            $res->body,
        );
        self::assertStringContainsString('Strings &lt; softer', $res->body, 'change text is escaped');
        self::assertStringNotContainsString('Fourth-change-text', $res->body, 'only the first three changes');
        self::assertStringContainsString('<li class="piece" data-kind="music">', $res->body);
    }

    public function testTheIndexGroupsPiecesUnderTheirProjectsNewestFirst(): void
    {
        $put = function (string $piece, string $title, string $project, string $name, string $kind): void {
            $this->clock->now += 10;
            $score = ['schema' => 1, 'kind' => $kind, 'project' => ['id' => $project, 'name' => $name], 'piece' => ['id' => $piece, 'title' => $title], 'draft' => 1, 'changes' => []];
            $this->store->putDraft($piece, 1, ['score.json' => json_encode($score)], ['project_id' => $project, 'project_name' => $name, 'kind' => $kind]);
        };
        $put('ch1-labyrinth', 'Chapter 1', 'crete', 'Crete', 'music');
        $put('cannon-fire', 'Cannon fire', 'tankity', 'Tankity <Games>', 'sound');
        $put('ch2-descent', 'Chapter 2', 'crete', 'Crete', 'music');
        $res = $this->pages->index(music_signed_in($this->sessions));
        self::assertSame(200, $res->status);
        // Crete published most recently (chapter 2), so its heading comes first and chapter 2 leads inside it; Tankity follows.
        preg_match_all('~<h2 class="project">(.*?)</h2>~', $res->body, $headings);
        self::assertSame(['Crete', 'Tankity &lt;Games&gt;'], $headings[1], 'projects by their most recent publish, names escaped');
        preg_match_all('~data-waiting="([a-z0-9-]+)"~', $res->body, $rows);
        self::assertSame(['ch2-descent', 'ch1-labyrinth', 'cannon-fire'], $rows[1], 'pieces by their latest publish, grouped by project');
        self::assertSame(1, preg_match('~<h2 class="project">Crete</h2><ul class="pieces"><li class="piece" data-kind="music"><a href="piece.php\?id=ch2-descent"~', $res->body));
        self::assertStringContainsString('<li class="piece" data-kind="sound"><a href="piece.php?id=cannon-fire"', $res->body);
        // A fresh publish in the older project moves that project to the front.
        $put('mortar-fire', 'Mortar fire', 'tankity', 'Tankity <Games>', 'sound');
        preg_match_all('~<h2 class="project">(.*?)</h2>~', $this->pages->index(music_signed_in($this->sessions))->body, $again);
        self::assertSame(['Tankity &lt;Games&gt;', 'Crete'], $again[1]);
    }

    public function testHubListsTheWorkroomAndItsFingerprint(): void
    {
        $db = admin_tmp_db();
        $clock = new FakeClock(1_800_000_000);
        $sessions = new Admin\Sessions($db, $clock, '/~wgrim/');
        $hub = (new Admin\Pages($db, $clock, new MemoryMailer(), self::BASE, static fn(): bool => true))->hub(music_signed_in($sessions));
        self::assertSame(200, $hub->status);
        self::assertStringContainsString('href="../music/"', $hub->body);
        self::assertStringContainsString('Music notes key', $hub->body);
    }
}
```

- [ ] **Step 2: Run to see it fail**

Run: `vendor/bin/phpunit tests/php/MusicPagesTest.php`
Expected: FAIL — class `Music\Pages` not found.

- [ ] **Step 3: Implement** `Music\Pages` and the two `admin/lib/bootstrap.php` functions as described above (`index` groups `Store::drafts()` by project as described). The piece id is checked against `/^[a-z0-9][a-z0-9-]{0,47}$/` (else 400 page "No such piece."). `notes()` dispatches on `$r->method`: GET lists (no `sha256` in the page's list), POST uploads, anything else 405.

- [ ] **Step 4: Run the tests**

Run: `vendor/bin/phpunit tests/php/MusicPagesTest.php` — PASS; `vendor/bin/phpunit --testsuite site` — PASS.

- [ ] **Step 5: Commit**

```bash
git add websites/www.cs/music/lib websites/www.cs/admin/lib/bootstrap.php websites/www.cs/tests/php/MusicPagesTest.php
git commit -m "Music workroom: session routes, page shells, the pieces list by project and the hub entry

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb"
```

### Task 4: Thin pages, serving rules, deploy, docs; open PR 1

**Files:**
- Create: `music/index.php`, `piece.php`, `csrf.php`, `notes.php`, `note.php`, `delete.php`, `keyring.php`, `drafts.php`, `draft.php`, `api/notes.php`, `api/note.php`, `api/picked-up.php`, `api/drafts.php`, `api/keyring.php`, `music/.htaccess`, `music/music.css`, `music/README.md`, `tests/php/MusicBootstrapTest.php`, `tests/php/MusicDeployTest.php`
- Modify: `music/lib/bootstrap.php` (`music_request`, `music_early_refusal`, `music_run`, `music_read_body`, `music_asset_version`), `docker/nginx/default.conf`, `deploy.sh`, `.gitignore`

**Interfaces:**
- Consumes: everything from Tasks 1–3, and `admin_base_url()`, `admin_cookie_path()`, `admin_mailer()`, `admin_emit()` from `admin/lib/bootstrap.php`.
- Produces (in `music/lib/bootstrap.php`):

```php
/** Admin\Request::fromGlobals() plus the content-length header: PHP keeps CONTENT_LENGTH out of the HTTP_* variables Request reads. */
function music_request(): Admin\Request;
/**
 * The gates that need no database, in admin_serve()'s order, as a finished response (Music\Http::finish) or null:
 * plain HTTP is refused for every $kind (admin_refuse_plain_http against $baseUrl); then
 * 'page' (index.php, piece.php) adds admin_refuse_script_fetch, 'data' (the session JSON and byte routes) adds
 * Music\Http::refuseCrossSite, and 'api' (the API-key routes, which tools call) adds nothing. Any other $kind throws.
 */
function music_early_refusal(string $kind, Admin\Request $r, string $baseUrl): ?Admin\Response;
/**
 * Runs music_early_refusal($kind, ...) FIRST and emits a refusal without ever opening the database, so plain HTTP or a
 * script fetch gets its 403 even when storage is refused (admin_serve does the same). Only then builds the database,
 * the key store, the sessions and the controllers, runs $route, and emits the response; StorageUnavailable and
 * PDOException → Admin\Pages::storageDown() through Music\Http::finish. Session, CSRF and scope checks live in
 * Music\Pages and Music\Api, per route.
 */
function music_run(string $kind, callable $route): void; // $route(Music\Pages $pages, Music\Api $api, Admin\Request $r): Admin\Response
/** Up to $max bytes of php://input. Callers that must tell "too large" apart ask for one byte more than their limit. */
function music_read_body(int $max): string;
/** First 10 hex of games/workroom/dist/workroom.js's SHA-256; '' while the file is missing (until PR 2 lands). */
function music_asset_version(): string;
```

Each thin page is three lines, for example `music/api/note.php`:

```php
<?php
declare(strict_types=1);
require __DIR__ . '/../lib/bootstrap.php';
music_run('api', fn(Music\Pages $p, Music\Api $a, Admin\Request $r) => $a->getNote($r));
```

The first argument is the gate kind: `'page'` for `index.php` and `piece.php`; `'data'` for `csrf.php`, `notes.php`, `note.php`, `delete.php`, `keyring.php`, `drafts.php` and `draft.php`; `'api'` for everything under `api/`.

`notes.php` passes `music_read_body(Music\Store::MAX_NOTE_BYTES + 1)`. `api/keyring.php` and `api/drafts.php` pass a reader, not a body: `fn(int $n) => music_read_body($n)`, so the API reads the body only after the key, the method and the declared `Content-Length` have passed (`$a->publishKeyring($r, fn(int $n) => music_read_body($n))`). There is no multipart handling anywhere: PHP parses a multipart body before the script runs, which would buffer an oversized upload first.

`music/.htaccess`: `Header always set` each `Admin\Headers::LIST` header with the CSP value `Music\Http::csp()` spelled out, and `<If "%{REQUEST_URI} =~ m#/music/(lib|tools|pieces|keys)/#"> Require all denied </If>`.

- [ ] **Step 1: Write the failing deploy test** (`tests/php/MusicDeployTest.php`)

```php
<?php
// What deploy.sh ships of the workroom: its pages, API, library, styles and
// the public key file; never its tools, committed drafts, README or the local
// compose override. nginx denies what Apache's .htaccess denies.
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

final class MusicDeployTest extends TestCase
{
    private static ?array $list = null;

    private static function shipped(): array
    {
        if (self::$list === null) {
            $site = dirname(__DIR__, 2);
            exec('cd ' . escapeshellarg($site) . ' && LIST=1 ./deploy.sh 2>/dev/null', $out, $code);
            self::assertSame(0, $code, 'LIST=1 ./deploy.sh failed');
            self::$list = $out;
        }
        return self::$list;
    }

    public function testShipsThePagesApiAndLibrary(): void
    {
        $list = self::shipped();
        foreach (['music/index.php', 'music/piece.php', 'music/notes.php', 'music/delete.php', 'music/keyring.php', 'music/api/note.php', 'music/api/picked-up.php', 'music/api/keyring.php',
            'music/lib/Store.php', 'music/lib/.htaccess', 'music/.htaccess', 'music/music.css'] as $f) {
            self::assertContains($f, $list, $f);
        }
    }

    public function testNeverShipsToolsDraftsOrDocs(): void
    {
        foreach (self::shipped() as $f) {
            self::assertDoesNotMatchRegularExpression('~^music/(tools|pieces)/|^music/README\.md$|^compose\.music-local\.yaml$~', $f, $f);
        }
    }

    public function testNginxDeniesWhatApacheDenies(): void
    {
        $conf = (string) file_get_contents(dirname(__DIR__, 2) . '/docker/nginx/default.conf');
        foreach (['lib', 'tools', 'pieces', 'keys'] as $d) {
            self::assertStringContainsString("location ^~ /music/$d/ { deny all; }", $conf, $d);
        }
        $ht = (string) file_get_contents(dirname(__DIR__, 2) . '/music/.htaccess');
        self::assertStringContainsString('m#/music/(lib|tools|pieces|keys)/#', $ht);
        self::assertStringContainsString("media-src 'self' blob:", $ht);
    }
}
```

When `music/keys/public.json` exists (after `make keys-init` in PR 3), `testShipsThePagesApiAndLibrary` also expects it; add this line to that test in Task 12.

`tests/php/MusicBootstrapTest.php` (the gates that run before the database opens):

```php
<?php
// What music_run decides before it opens the database: plain HTTP is refused on
// every route; a page load must be a browser navigation, a data route must be
// same-origin, an API route (called by tools) needs nothing more. Each refusal
// carries the admin headers and the music CSP.
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

require_once __DIR__ . '/MusicFakes.php';

final class MusicBootstrapTest extends TestCase
{
    private const BASE = 'https://example.test/~wgrim/admin/';

    public function testPlainHttpIsRefusedOnEveryKindOfRoute(): void
    {
        foreach (['page', 'data', 'api'] as $kind) {
            $res = music_early_refusal($kind, req(['https' => false]), self::BASE);
            self::assertNotNull($res, $kind);
            self::assertSame(403, $res->status, $kind);
            self::assertSame(Music\Http::csp(), $res->headers['Content-Security-Policy'], $kind);
            self::assertNull(music_early_refusal($kind, req(['https' => false]), 'http://localhost/admin/'), "$kind on a local base");
            self::assertNull(music_early_refusal($kind, req(['https' => true]), self::BASE), "$kind over HTTPS");
        }
    }

    public function testAPageLoadMustBeANavigation(): void
    {
        $script = req(['https' => true, 'headers' => ['sec-fetch-mode' => 'cors', 'sec-fetch-dest' => 'empty', 'sec-fetch-site' => 'same-origin']]);
        $navigation = req(['https' => true, 'headers' => ['sec-fetch-mode' => 'navigate', 'sec-fetch-dest' => 'document', 'sec-fetch-site' => 'none']]);
        self::assertSame(403, music_early_refusal('page', $script, self::BASE)?->status);
        self::assertNull(music_early_refusal('page', $navigation, self::BASE));
        self::assertNull(music_early_refusal('page', req(['https' => true]), self::BASE), 'curl and older browsers send no Fetch Metadata');
    }

    public function testADataRouteMustBeSameOrigin(): void
    {
        $at = fn(string $site) => req(['https' => true, 'headers' => ['sec-fetch-site' => $site]]);
        self::assertSame(403, music_early_refusal('data', $at('cross-site'), self::BASE)?->status);
        self::assertSame(403, music_early_refusal('data', $at('same-site'), self::BASE)?->status);
        self::assertNull(music_early_refusal('data', $at('same-origin'), self::BASE), "the page's own script");
        self::assertNull(music_early_refusal('api', $at('cross-site'), self::BASE), 'API routes are for tools: only HTTPS and the key decide');
    }

    public function testAnUnknownKindIsABug(): void
    {
        $this->expectException(InvalidArgumentException::class);
        music_early_refusal('other', req(['https' => true]), self::BASE);
    }
}
```

- [ ] **Step 2: Run to see it fail**

Run: `vendor/bin/phpunit tests/php/MusicDeployTest.php tests/php/MusicBootstrapTest.php` — FAIL (nothing under `music/` ships; nginx has no music rules; `music_early_refusal` does not exist).

- [ ] **Step 3: Implement**

`deploy.sh`, in the stage `case`, before `*/*) continue ;;`:

```bash
    # The music workroom: its pages, API, library, styles and the public key
    # (PHP reads it). Its tools, committed drafts and README stay home.
    music/*.php | music/api/*.php | music/lib/*.php | music/lib/.htaccess | music/.htaccess | music/music.css | music/keys/public.json) ;;
    music/*) continue ;;
```

`docker/nginx/default.conf`, beside the other deny lines:

```nginx
    # The music workroom's library, tools, committed drafts and key file (Apache: music/.htaccess).
    location ^~ /music/lib/ { deny all; }
    location ^~ /music/tools/ { deny all; }
    location ^~ /music/pieces/ { deny all; }
    location ^~ /music/keys/ { deny all; }
```

`.gitignore`: `music/tools/.venv/` and `music/tools/**/__pycache__/`.

Write the thin pages, `music.css` (dark site look: the site's `#0d0f12` background, `#e8ebf0` text, red `#e02020` accents, a project heading (`h2.project`) over each group of pieces shown as cards), and `music/README.md` (what the workroom is (music and sound effects for any project; projects, kinds and characters in `score.json`); the security model in short; the routes and scopes; the draft limits (8 MB a request, 20 kept, 100 MB in all); `make` targets that exist so far; how to create the two API keys on the hub).

- [ ] **Step 4: Run the gates**

Run, from `websites/www.cs`: `vendor/bin/phpunit tests/php/MusicDeployTest.php tests/php/MusicBootstrapTest.php` — PASS; `vendor/bin/phpunit --testsuite site` — PASS; `vendor/bin/phpunit --testsuite kit` — PASS. Then a local smoke on its own project: `name=music-api-$$; docker compose -f compose.yaml -p $name up -d --build www-cs-php www-cs-nginx; port=$(docker compose -f compose.yaml -p $name port www-cs-nginx 80); curl -s -o /dev/null -w '%{http_code}\n' "http://$port/music/lib/Store.php"` prints `403`; `curl -s -o /dev/null -w '%{http_code}\n' "http://$port/music/"` prints `403` (not HTTPS); `docker compose -f compose.yaml -p $name down -v`.

- [ ] **Step 5: Commit and open PR 1**

```bash
git add websites/www.cs/music websites/www.cs/tests/php/MusicBootstrapTest.php websites/www.cs/tests/php/MusicDeployTest.php websites/www.cs/docker/nginx/default.conf websites/www.cs/deploy.sh websites/www.cs/.gitignore
git commit -m "Music workroom: pages, API files, serving and deploy rules

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb"
```

Open the PR (foundry `pr-fix-loop` as for every siue PR): title "Music workroom: API and storage"; body: summary, spec and plan paths, the after-deploy check (`curl -s -o /dev/null -w '%{http_code}' https://www.cs.siue.edu/~wgrim/music/lib/Store.php` → 403; the hub lists "Music workroom" and "Music notes key: not made yet"), and the PR attribution lines. CI will select every browser spec (`select.ts` maps unknown site paths to ALL); that is expected.

---

# PR 2: the page, its views and the glossary (branch `music/page`)

Start from `main` after PR 1 merged.

### Task 5: The workroom kit folder, the score model and the glossary

**Files:**
- Create: `websites/www.cs/games/workroom/build.json`, `tsconfig.json`, `tsconfig.test.json`, `test.sh`, `src/tsconfig.dom.json`, `src/score.ts`, `src/glossary.json`, `src/glossary.ts`, `src/main.ts`
- Create: `games/workroom/test/score.test.ts`, `test/glossary.test.ts`, `test/committed-drafts.test.ts`, `test/fixtures/score-v1.json` (a Crete music piece), `test/fixtures/score-sound-v1.json` (a Tankity sound effect)
- Create: `websites/www.cs/music/pieces/.gitkeep`
- Modify: `music/README.md` (the score schema section, copied from this plan's "Formats")

**Interfaces:**
- Consumes: nothing from earlier tasks (the kit's build and test conventions).
- Produces:

```ts
// src/score.ts (DOM-free)
export const SCHEMA = 1;
export const ID_RE = /^[a-z0-9][a-z0-9-]{0,47}$/;
export const COLOR_RE = /^#[0-9a-f]{6}$/;
export const KINDS = ['music', 'sound'] as const;
export type Kind = (typeof KINDS)[number];
/** The shortest sound piece, in seconds. */
export const MIN_SOUND_SECONDS = 0.05;
export const FAMILIES = ['strings', 'brass', 'woodwinds', 'percussion', 'choir', 'keys', 'synth', 'harp', 'bells', 'impact', 'whoosh', 'ambience', 'voice', 'electronic', 'foley', 'ui'] as const;
export type Family = (typeof FAMILIES)[number];
export interface Project { id: string; name: string }
export interface Tempo { bar: number; bpm: number; beats: number; unit: 1 | 2 | 4 | 8 | 16 }
/** A music section spans bars (from_bar, to_bar); a sound section is a named moment in seconds (from, to). parseScore guarantees the pair that fits the score's kind and none of the other. */
export interface Section { id: string; name: string; color: string; from_bar?: number; to_bar?: number; from?: number; to?: number }
export interface Lane { id: string; name: string; family: Family; icon: Family; color: string }
/** A character belongs to the score: the page has none built in. */
export interface Character { id: string; name: string; color: string }
export interface MotifSpan { lane: string; from: number; to: number }
/** `character` is the id of an entry of the score's characters; the motif is drawn in that character's colour. */
export interface Motif { id: string; character: string; spans: MotifSpan[] }
export interface ScoreNote { lane: string; start: number; length: number; pitch: number; velocity: number; motif: string | null }
export interface GlossaryUse { term: string; from: number; to: number }
export interface AudioSource { file: 'audio.webm' | 'audio.m4a'; type: string }
export interface Spectrogram { file: 'spectrogram.png'; low_hz: number; high_hz: number; scale: 'log' | 'linear' }
/** A music change names bars (from_bar, to_bar); a sound change names seconds (from, to). */
export interface Change { from_bar?: number; to_bar?: number; from?: number; to?: number; lane: string | null; text: string; answers: string[] }
export interface Score {
  schema: 1; kind: Kind; project: Project; piece: { id: string; title: string }; draft: number; made: string; duration: number;
  bars?: number; tempo?: Tempo[];                          // music only; absent for sound
  sections: Section[]; lanes: Lane[]; characters: Character[]; motifs: Motif[]; notes: ScoreNote[];
  energy: [number, number][]; glossary: GlossaryUse[]; audio: AudioSource[]; spectrogram: Spectrogram;
  musicxml?: 'score.musicxml';                             // required for music, optional for sound
  changes: Change[];
}
export type Parsed = { ok: true; score: Score } | { ok: false; error: string };
/** Validates every rule in the plan's schema table; the first broken rule is the error, naming its path (e.g. "sections[1].from_bar"). */
export function parseScore(raw: unknown): Parsed;
export function unknownSchemaMessage(n: unknown): string;
/** The colour of the motif's character, from the score's own characters. */
export function motifColor(score: Score, motif: Motif): string;

// src/glossary.ts (DOM-free; reads src/glossary.json, the glossary's one source: the Python tool reads the same file)
export interface Term { id: string; word: string; lines: [string, string] }
export const GLOSSARY: readonly Term[];
export function term(id: string): Term | undefined;
/** The glossary uses in a score, in order of first appearance, with their definitions. */
export function termsIn(score: Score): { term: Term; from: number; to: number }[];
/** Splits text into plain runs and glossary words (whole words or whole phrases such as "reverb tail", case-insensitive, first match wins). */
export function splitTerms(text: string): ({ text: string } | { term: Term; text: string })[];
```

`src/glossary.json` holds at least these ids, each with its two plain-words lines: `ostinato`, `motif`, `theme`, `phrygian`, `crescendo`, `decrescendo`, `octave`, `chord`, `drone`, `pedal-point`, `tremolo`, `pizzicato`, `legato`, `staccato`, `tempo`, `bar`, `beat`, `dynamics`, `unison`, `minor`, `major`, `cadence`, `orchestration`, `swell`, and the sound-design terms `attack`, `decay`, `release`, `envelope`, `layer`, `transient`, `pitch-sweep`, `reverb-tail`, `foley`, `ambience`, `low-pass-filter`, `distortion`. The sound-design entries are exactly these (append them to the `terms` array):

```json
    { "id": "attack", "word": "attack", "lines": ["How quickly a sound reaches its full loudness after it starts.", "A drum hit has a sharp attack; a slow string swell has a soft one."] },
    { "id": "decay", "word": "decay", "lines": ["How a sound falls from its first peak down to a steadier level.", "A cannon's boom drops away fast; a bell's ring decays slowly."] },
    { "id": "release", "word": "release", "lines": ["What a sound does after the key or trigger is let go.", "A short release stops it dead; a long one lets it fade away."] },
    { "id": "envelope", "word": "envelope", "lines": ["The shape of a sound's loudness over time: attack, decay, hold, release.", "It is why a plucked note and a bowed note feel so different."] },
    { "id": "layer", "word": "layer", "lines": ["One of several sounds played together to make one bigger sound.", "A cannon shot might layer a deep boom, a sharp crack and a rushing hiss."] },
    { "id": "transient", "word": "transient", "lines": ["The very short, sharp burst at the very start of a sound.", "It is the snap of a snare or the click of a button before the tone settles."] },
    { "id": "pitch-sweep", "word": "pitch sweep", "lines": ["A sound whose pitch slides up or down while it plays.", "A falling sweep makes a laser or a boom feel as if it drops away."] },
    { "id": "reverb-tail", "word": "reverb tail", "lines": ["The fading echo that lingers after a sound has stopped.", "A long tail makes a sound feel as if it happened in a cave or a cathedral."] },
    { "id": "foley", "word": "foley", "lines": ["Everyday sounds made by hand to match what is on screen.", "Footsteps, creaking leather and rustling cloth are all foley."] },
    { "id": "ambience", "word": "ambience", "lines": ["The quiet background sound that makes a place feel real.", "Wind, far-off machinery or a hum of insects sets the scene without being noticed."] },
    { "id": "low-pass-filter", "word": "low-pass filter", "lines": ["A filter that keeps the low sounds and cuts the high ones.", "It muffles a sound, like hearing music through a wall."] },
    { "id": "distortion", "word": "distortion", "lines": ["Deliberately overloading a sound so it turns rough and gritty.", "It adds bite and aggression, like an overdriven guitar or a crunchy explosion."] }
```

The file is `{ "terms": [ ... ] }`, for example:

```json
{
  "terms": [
    { "id": "ostinato", "word": "ostinato", "lines": ["A short pattern repeated over and over underneath the music.", "It drives the piece forward, like footsteps in the dark."] },
    { "id": "phrygian", "word": "Phrygian", "lines": ["A minor-sounding scale whose second note is only a half step up.", "That half step gives an ancient, Mediterranean, uneasy colour."] }
  ]
}
```

`src/glossary.ts` imports it with `import data from './glossary.json' with { type: 'json' };` (Node 24 runs the tests, esbuild bundles it, `tsc` reads it under `moduleResolution: bundler`) and builds `GLOSSARY` by mapping each term to `{ id, word, lines: [lines[0]!, lines[1]!] }`, which gives the tuple type. `parseScore` checks `glossary[].term` against `GLOSSARY`, and `music/tools/siue_music/score.py` (Task 13) checks it against the same JSON file.

Folder files:

```json
// build.json
{
  "programs": ["tsconfig.json", "src/tsconfig.dom.json", "tsconfig.test.json"],
  "entries": [
    { "in": "src/main.ts", "out": "workroom", "format": "esm" }
  ]
}
```

```jsonc
// tsconfig.json
{
  // DOM-free program: the score model, layout, zoom, gestures and note building cannot reach the page. The Web Crypto modules have their own program, src/tsconfig.crypto.json. See games/_kit/README.md.
  "extends": "../_kit/build/tsconfig.base.json",
  "files": ["src/score.ts", "src/glossary.ts"]
}
```

```jsonc
// src/tsconfig.dom.json
{
  "extends": "../tsconfig.json",
  "compilerOptions": { "lib": ["ES2022", "DOM"] },
  "files": ["main.ts"]
}
```

```jsonc
// tsconfig.test.json
{
  // The unit tests: Node runs them from source; this program type-checks them. See games/_kit/README.md.
  "extends": "../_kit/build/tsconfig.base.json",
  "compilerOptions": { "lib": ["ES2022", "DOM"], "types": ["node"] },
  "include": ["test/**/*.ts"]
}
```

```sh
#!/bin/sh
# The workroom page's build check, run from its folder (make test runs every
# games/*/test.sh, then games/units.sh runs the unit tests in test/).
set -e
cd "$(dirname "$0")"
node ../_kit/build/build.mjs workroom --check
```

Every later task that adds a DOM-free module appends it to `tsconfig.json`'s `files`; every DOM module or `.tsx` goes in `src/tsconfig.dom.json`'s `files`. A module that uses `crypto`, `CryptoKey` or `TextEncoder`, or imports one that does, goes in `src/tsconfig.crypto.json` (Task 10 creates it): `tsc` checks every imported file under the importing program's `lib`, so such a module in the DOM-free program fails with TS2304.

- [ ] **Step 1: Write the fixtures.** `games/workroom/test/fixtures/score-v1.json` is a Crete music piece (8 bars of 4/4 at 120 bpm: two seconds a bar). Crete's four characters and their colours live here, in data, and nowhere in the page's code:

```json
{
  "schema": 1,
  "kind": "music",
  "project": { "id": "crete", "name": "Crete" },
  "piece": { "id": "test-piece", "title": "Test piece: the Labyrinth wakes" },
  "draft": 1,
  "made": "2026-10-17T12:00:00Z",
  "duration": 16,
  "bars": 8,
  "tempo": [{ "bar": 1, "bpm": 120, "beats": 4, "unit": 4 }],
  "sections": [
    { "id": "stirs", "name": "The Labyrinth stirs", "from_bar": 1, "to_bar": 4, "color": "#2e4057" },
    { "id": "thread", "name": "Ariadne's thread", "from_bar": 5, "to_bar": 8, "color": "#6b4e16" }
  ],
  "lanes": [
    { "id": "strings-low", "name": "Low strings", "family": "strings", "icon": "strings", "color": "#7a9cc6" },
    { "id": "brass", "name": "Horns", "family": "brass", "icon": "brass", "color": "#c98b3a" }
  ],
  "characters": [
    { "id": "ariadne", "name": "Ariadne", "color": "#d4a017" },
    { "id": "minotaur", "name": "Minotaur", "color": "#c0392b" },
    { "id": "daedalus", "name": "Daedalus", "color": "#b08d57" },
    { "id": "athens", "name": "Athens", "color": "#3b6fb6" }
  ],
  "motifs": [
    { "id": "ariadne", "character": "ariadne", "spans": [{ "lane": "brass", "from": 8, "to": 16 }] }
  ],
  "notes": [
    { "lane": "strings-low", "start": 0, "length": 2, "pitch": 38, "velocity": 70, "motif": null },
    { "lane": "strings-low", "start": 2, "length": 2, "pitch": 41, "velocity": 70, "motif": null },
    { "lane": "strings-low", "start": 4, "length": 4, "pitch": 36, "velocity": 80, "motif": null },
    { "lane": "brass", "start": 8, "length": 2, "pitch": 62, "velocity": 90, "motif": "ariadne" },
    { "lane": "brass", "start": 10, "length": 2, "pitch": 65, "velocity": 95, "motif": "ariadne" },
    { "lane": "brass", "start": 12, "length": 4, "pitch": 69, "velocity": 100, "motif": "ariadne" }
  ],
  "energy": [[0, 0.2], [8, 0.5], [16, 0.9]],
  "glossary": [{ "term": "ostinato", "from": 0, "to": 4 }, { "term": "motif", "from": 8, "to": 12 }],
  "audio": [{ "file": "audio.webm", "type": "audio/webm; codecs=opus" }],
  "spectrogram": { "file": "spectrogram.png", "low_hz": 30, "high_hz": 16000, "scale": "log" },
  "musicxml": "score.musicxml",
  "changes": [{ "from_bar": 5, "to_bar": 8, "lane": "brass", "text": "Horns carry Ariadne's theme an octave higher.", "answers": [] }]
}
```

`games/workroom/test/fixtures/score-sound-v1.json` is a Tankity sound effect: a 0.4-second "cannon fire" with an impact layer and a whoosh layer, in seconds, with no bars, no tempo, no notes, no characters and no MusicXML:

```json
{
  "schema": 1,
  "kind": "sound",
  "project": { "id": "tankity", "name": "Tankity" },
  "piece": { "id": "cannon-fire", "title": "Cannon fire" },
  "draft": 1,
  "made": "2026-10-17T12:30:00Z",
  "duration": 0.4,
  "sections": [
    { "id": "blast", "name": "Blast", "from": 0, "to": 0.08, "color": "#c0392b" },
    { "id": "echo", "name": "Echo", "from": 0.08, "to": 0.4, "color": "#2e4057" }
  ],
  "lanes": [
    { "id": "boom", "name": "Boom", "family": "impact", "icon": "impact", "color": "#c0392b" },
    { "id": "air", "name": "Air rush", "family": "whoosh", "icon": "whoosh", "color": "#7a9cc6" }
  ],
  "characters": [],
  "motifs": [],
  "notes": [],
  "energy": [[0, 1], [0.08, 0.8], [0.4, 0]],
  "glossary": [{ "term": "attack", "from": 0, "to": 0.08 }, { "term": "decay", "from": 0.08, "to": 0.4 }],
  "audio": [{ "file": "audio.webm", "type": "audio/webm; codecs=opus" }],
  "spectrogram": { "file": "spectrogram.png", "low_hz": 30, "high_hz": 16000, "scale": "log" },
  "changes": [{ "from": 0, "to": 0.08, "lane": "boom", "text": "A sharper, shorter attack on the boom.", "answers": [] }]
}
```

- [ ] **Step 2: Write the failing tests**

`test/score.test.ts`:

```ts
// The score.json schema, version 1: a music piece and a sound effect parse; an
// unknown schema is refused with the reload message; each rule names the path
// it breaks; the two kinds differ exactly where the schema says; the page has
// no characters of its own.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { FAMILIES, MIN_SOUND_SECONDS, motifColor, parseScore, unknownSchemaMessage, type Score } from '../src/score.ts';

const read = (name: string): Score => JSON.parse(readFileSync(new URL(`./fixtures/${name}`, import.meta.url), 'utf8')) as Score;
const fixture = (): Score => read('score-v1.json');
const sound = (): Score => read('score-sound-v1.json');
const failure = (s: Score): string => {
  const r = parseScore(s);
  assert.equal(r.ok, false);
  return r.ok ? '' : r.error;
};
const broken = (change: (s: Score) => void): string => {
  const s = fixture();
  change(s);
  return failure(s);
};
const brokenSound = (change: (s: Score) => void): string => {
  const s = sound();
  change(s);
  return failure(s);
};

test('the fixtures are valid schema 1 scores, one of each kind', () => {
  for (const s of [fixture(), sound()]) {
    const r = parseScore(s);
    assert.ok(r.ok, r.ok ? '' : r.error);
  }
  assert.deepEqual([fixture().kind, sound().kind], ['music', 'sound']);
  assert.deepEqual([fixture().project.id, sound().project.id], ['crete', 'tankity']);
});

test('an unknown schema is refused with the reload message', () => {
  const r = parseScore({ ...fixture(), schema: 2 });
  assert.deepEqual(r, { ok: false, error: unknownSchemaMessage(2) });
  assert.match(unknownSchemaMessage(2), /score schema 2, which this page does not know\. Reload the page/);
  assert.equal(parseScore('nope').ok, false);
  assert.equal(parseScore(null).ok, false);
});

test('each rule names its path', () => {
  assert.match(broken(s => { s.piece.id = 'Bad Id'; }), /piece\.id/);
  assert.match(broken(s => { s.kind = 'noise' as never; }), /kind/);
  assert.match(broken(s => { s.project.id = 'Not An Id'; }), /project\.id/);
  assert.match(broken(s => { s.project.name = ''; }), /project\.name/);
  assert.match(broken(s => { s.project.name = 'n'.repeat(81); }), /project\.name/);
  assert.match(broken(s => { s.sections[1]!.from_bar = 6; }), /sections\[1\]\.from_bar/);
  assert.match(broken(s => { s.sections[1]!.to_bar = 7; }), /sections\[1\]\.to_bar/);
  assert.match(broken(s => { s.sections = []; }), /sections/);
  assert.match(broken(s => { s.characters[0]!.color = 'gold'; }), /characters\[0\]\.color/);
  assert.match(broken(s => { s.characters[1]!.id = 'ariadne'; }), /characters\[1\]\.id/);
  assert.match(broken(s => { s.motifs[0]!.character = 'nobody'; }), /motifs\[0\]\.character/);
  assert.match(broken(s => { s.notes[5]!.length = 5; }), /notes\[5\]/);
  assert.match(broken(s => { s.notes[0]!.lane = 'violas'; }), /notes\[0\]\.lane/);
  assert.match(broken(s => { s.notes[0]!.motif = 'minotaur'; }), /notes\[0\]\.motif/);
  assert.match(broken(s => { s.notes[0]!.pitch = 128; }), /notes\[0\]\.pitch/);
  assert.match(broken(s => { s.energy[0] = [1, 0.2]; }), /energy/);
  assert.match(broken(s => { s.energy[1] = [8, 1.5]; }), /energy\[1\]/);
  assert.match(broken(s => { s.glossary[0]!.term = 'flibbertigibbet'; }), /glossary\[0\]\.term/);
  assert.match(broken(s => { s.glossary[0]!.to = 20; }), /glossary\[0\]/);
  assert.match(broken(s => { s.tempo![0]!.bar = 2; }), /tempo\[0\]\.bar/);
  assert.match(broken(s => { delete s.tempo; }), /tempo/);
  assert.match(broken(s => { delete s.bars; }), /bars/);
  assert.match(broken(s => { delete s.musicxml; }), /musicxml/);
  assert.match(broken(s => { s.audio = []; }), /audio/);
  assert.match(broken(s => { s.lanes[1]!.id = 'strings-low'; }), /lanes\[1\]\.id/);
  assert.match(broken(s => { s.changes[0]!.answers = ['xyz']; }), /changes\[0\]\.answers/);
  assert.match(broken(s => { s.lanes[0]!.color = 'red'; }), /lanes\[0\]\.color/);
});

test('a sound effect has seconds, no bars and no tempo, and needs no MusicXML', () => {
  const s = sound();
  assert.deepEqual([s.bars, s.tempo, s.musicxml, s.notes.length, s.characters.length], [undefined, undefined, undefined, 0, 0]);
  assert.ok(s.duration >= MIN_SOUND_SECONDS);
  assert.match(brokenSound(x => { x.bars = 8; }), /bars/);
  assert.match(brokenSound(x => { x.tempo = [{ bar: 1, bpm: 120, beats: 4, unit: 4 }]; }), /tempo/);
  assert.match(brokenSound(x => { x.duration = 0.04; }), /duration/);
  assert.match(brokenSound(x => { x.sections[0]!.from_bar = 1; }), /sections\[0\]/);
  assert.match(brokenSound(x => { x.sections[1]!.from = 0.05; }), /sections\[1\]\.from/);
  assert.match(brokenSound(x => { x.sections[1]!.to = 0.5; }), /sections\[1\]\.to/);
  assert.match(brokenSound(x => { x.changes[0]!.to = 0.5; }), /changes\[0\]\.to/);
  assert.match(brokenSound(x => { x.changes[0]!.from_bar = 1; }), /changes\[0\]/);
  assert.match(brokenSound(x => { x.energy[2] = [0.5, 0]; }), /energy/);
  assert.match(brokenSound(x => { x.lanes[0]!.family = 'kazoo' as never; }), /lanes\[0\]\.family/);
  const withXml = sound();
  withXml.musicxml = 'score.musicxml';
  assert.ok(parseScore(withXml).ok, 'a sound piece may carry MusicXML');
  const noMoments = sound();
  noMoments.sections = [];
  assert.ok(parseScore(noMoments).ok, 'sections are optional for a sound piece');
  const shortest = sound();
  shortest.duration = MIN_SOUND_SECONDS;
  shortest.sections = [];
  shortest.energy = [[0, 1], [MIN_SOUND_SECONDS, 0]];
  shortest.glossary = [];
  shortest.changes = [];
  assert.ok(parseScore(shortest).ok, 'a 0.05 s sound is allowed');
});

test('either kind may use any lane family', () => {
  assert.deepEqual(FAMILIES.slice(-7), ['impact', 'whoosh', 'ambience', 'voice', 'electronic', 'foley', 'ui']);
  const music = fixture();
  music.lanes[0]!.family = 'impact';
  music.lanes[0]!.icon = 'impact';
  assert.ok(parseScore(music).ok, 'a music lane may use a sound-design family');
  const effect = sound();
  effect.lanes[1]!.family = 'strings';
  effect.lanes[1]!.icon = 'strings';
  assert.ok(parseScore(effect).ok, 'a sound layer may use an orchestral family');
});

test("a motif takes its character's colour from the score", () => {
  const s = fixture();
  assert.equal(motifColor(s, s.motifs[0]!), '#d4a017');
  s.characters[0]!.color = '#112233';
  assert.equal(motifColor(s, s.motifs[0]!), '#112233');
});

test('the page has no characters or colours of its own', () => {
  const src = join(import.meta.dirname, '..', 'src');
  const files = (dir: string): string[] => readdirSync(dir, { withFileTypes: true }).flatMap(e => (e.isDirectory() ? files(join(dir, e.name)) : /\.tsx?$/.test(e.name) ? [join(dir, e.name)] : []));
  for (const f of files(src)) assert.doesNotMatch(readFileSync(f, 'utf8'), /Ariadne|Minotaur|Daedalus|Athens|CHARACTER_COLORS/, f);
});
```

`test/glossary.test.ts`:

```ts
// The glossary: every term has two lines; the sound-design terms are there; a
// score's uses come back in order with their clip spans; words and phrases in
// text become tappable terms.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { GLOSSARY, splitTerms, term, termsIn } from '../src/glossary.ts';
import type { Score } from '../src/score.ts';

const read = (name: string): Score => JSON.parse(readFileSync(new URL(`./fixtures/${name}`, import.meta.url), 'utf8')) as Score;

test('every term has an id, a word and two non-empty lines', () => {
  assert.ok(GLOSSARY.length >= 36);
  for (const t of GLOSSARY) {
    assert.match(t.id, /^[a-z][a-z-]*$/);
    assert.ok(t.lines[0].length > 0 && t.lines[1].length > 0, t.id);
  }
  assert.equal(new Set(GLOSSARY.map(t => t.id)).size, GLOSSARY.length);
});

test('the sound-design terms are in the glossary', () => {
  for (const id of ['attack', 'decay', 'release', 'envelope', 'layer', 'transient', 'pitch-sweep', 'reverb-tail', 'foley', 'ambience', 'low-pass-filter', 'distortion']) {
    assert.ok(term(id), id);
  }
  assert.deepEqual([term('pitch-sweep')?.word, term('low-pass-filter')?.word], ['pitch sweep', 'low-pass filter']);
});

test("a score's terms come with their clips", () => {
  assert.deepEqual(termsIn(read('score-v1.json')).map(u => [u.term.id, u.from, u.to]), [['ostinato', 0, 4], ['motif', 8, 12]]);
  assert.deepEqual(termsIn(read('score-sound-v1.json')).map(u => [u.term.id, u.from, u.to]), [['attack', 0, 0.08], ['decay', 0.08, 0.4]]);
});

test('words in text become terms, whole words only', () => {
  const parts = splitTerms('A Phrygian ostinato, motifs and a crescendo.');
  assert.deepEqual(parts.map(p => ('term' in p ? `[${p.term.id}]` : p.text)).join(''), 'A [phrygian] [ostinato], motifs and a [crescendo].');
  assert.equal(term('octave')?.word, 'octave');
});

test('a phrase is one term', () => {
  const parts = splitTerms('A low-pass filter on the Reverb Tail.');
  assert.deepEqual(parts.map(p => ('term' in p ? `[${p.term.id}]` : p.text)).join(''), 'A [low-pass-filter] on the [reverb-tail].');
});
```

`test/committed-drafts.test.ts`:

```ts
// Every committed draft (music/pieces/<piece>/v<N>/score.json) is a valid
// score whose piece id and draft number match its folder.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseScore } from '../src/score.ts';

const PIECES = join(import.meta.dirname, '..', '..', '..', 'music', 'pieces');
assert.ok(existsSync(PIECES), 'music/pieces/ exists');
const drafts = readdirSync(PIECES, { withFileTypes: true }).filter(d => d.isDirectory())
  .flatMap(piece => readdirSync(join(PIECES, piece.name)).filter(n => /^v\d+$/.test(n)).map(v => ({ piece: piece.name, v })));

// A skipped test names why, so the empty folder is visible in the report instead of a green test that checked nothing.
test('every committed draft validates', { skip: drafts.length === 0 ? 'no draft is committed under music/pieces/ yet' : false }, () => {
  for (const { piece, v } of drafts) {
    const r = parseScore(JSON.parse(readFileSync(join(PIECES, piece, v, 'score.json'), 'utf8')));
    assert.ok(r.ok, `${piece}/${v}: ${r.ok ? '' : r.error}`);
    if (r.ok) assert.deepEqual([r.score.piece.id, `v${r.score.draft}`], [piece, v]);
  }
});
```

- [ ] **Step 3: Run to see them fail**

Run, from `websites/www.cs/games`: `node --test workroom/test/*.test.ts`
Expected: FAIL — cannot find `../src/score.ts`.

- [ ] **Step 4: Implement** `score.ts` (a hand-written validator: one small checker per field, each returning a path-named message; it checks `kind` first and then applies the schema table's music or sound column: a music score requires `bars`, `tempo`, bar-spanned `sections` and `musicxml`, a sound score refuses `bars` and `tempo`, takes second-spanned optional `sections` and `changes`, needs `duration` of at least `MIN_SOUND_SECONDS`, and treats `musicxml` as optional; a field that belongs to the other kind is an error naming its path; `motifs[i].character` must be the id of an entry of `characters`; `motifColor` looks that entry up), `glossary.json` and `glossary.ts`, `main.ts` (for now: `document.getElementById('workroom')!.textContent = 'Loading…';`), the folder files above and `music/pieces/.gitkeep`. Run `node _kit/build/build.mjs workroom` to write `dist/`.

- [ ] **Step 5: Run the tests and the build check**

Run: `node --test workroom/test/*.test.ts` — PASS; `sh workroom/test.sh` — exit 0; `sh units.sh` — PASS (includes the kit's `typed-tests.test.ts`, which checks the new folder's test program).

- [ ] **Step 6: Commit**

```bash
git add websites/www.cs/games/workroom websites/www.cs/music/pieces/.gitkeep websites/www.cs/music/README.md
git commit -m "Music workroom: the page's kit folder, score schema 1 (music and sound) and glossary

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb"
```

### Task 6: Tempo, zoom, the story timeline's layout and hit testing

**Files:**
- Create: `games/workroom/src/tempo.ts`, `src/axis.ts`, `src/zoom.ts`, `src/timeline.ts`, `src/hit.ts`, `test/tempo.test.ts`, `test/axis.test.ts`, `test/zoom.test.ts`, `test/timeline.test.ts`, `test/hit.test.ts`
- Modify: `games/workroom/tsconfig.json` (add the five files)

**Interfaces:**
- Consumes: `Score`, `Section` from `score.ts`.
- Produces:

```ts
// src/tempo.ts
export interface TempoMap {
  /** true for a music piece (bars and tempo); false for a sound piece, which has seconds only. */
  readonly metric: boolean;
  /** Seconds at which bar n (1-based) starts; a bar past the last (n > score.bars) is the end of the piece, score.duration. A sound piece has no bars: 0 for n <= 1, else score.duration. */
  barStart(bar: number): number;
  /** The bar (1-based integer) playing at t seconds; clamped to [1, bars]. null for a sound piece. */
  barAt(t: number): number | null;
}
export function tempoMap(score: Score): TempoMap;
/** The seconds a section covers: a music section from the start of from_bar to the start of the bar after to_bar (so the last ends at score.duration); a sound section its own from and to. */
export function sectionTimes(section: Section, tempo: TempoMap, duration: number): { from: number; to: number };

// src/axis.ts (the time axis: bars for music, seconds for sound)
export interface AxisTick { x: number; label: string; bar: number | null }  // bar is null on a sound piece's axis
/** "0 s", "50 ms", "300 ms", "1 s", "1.5 s", "12 s": milliseconds below one second, otherwise seconds with at most two decimals. */
export function formatSeconds(t: number): string;
/** Ticks at a round step (10 ms up to 5 min) chosen so neighbours are at least 60 px apart; only ticks with 0 <= x < view.width - 1e-6. */
export function secondsTicks(view: View): AxisTick[];
/** A music piece: one tick per visible bar start, labelled with the bar number. A sound piece: secondsTicks(view). */
export function axisTicks(score: Score, tempo: TempoMap, view: View): AxisTick[];

// src/zoom.ts
export interface View { start: number; pxPerSec: number; width: number }
export interface Bounds { duration: number; minPxPerSec: number; maxPxPerSec: number }
export const MAX_PX_PER_SEC = 400;
/** minPxPerSec = width / duration (the whole piece fits); maxPxPerSec = max(MAX_PX_PER_SEC, 8 * minPxPerSec), so even a 0.3 s sound can zoom in. */
export function boundsFor(duration: number, width: number): Bounds;
export function fitView(duration: number, width: number): View;
export function timeToX(v: View, t: number): number;
export function xToTime(v: View, x: number): number;
/** Zooms by factor keeping the time under x fixed; clamps pxPerSec and start. */
export function zoomAt(v: View, x: number, factor: number, b: Bounds): View;
export function panBy(v: View, dx: number, b: Bounds): View;
/** Two fingers moved from before to after (x positions): the times under them follow the fingers. */
export function pinch(v: View, before: readonly [number, number], after: readonly [number, number], b: Bounds): View;
export function clampView(v: View, b: Bounds): View;

// src/timeline.ts
export interface Rect { x: number; y: number; w: number; h: number }
export const TIMELINE = { energyH: 48, sectionH: 28, laneH: 36, ribbonH: 6 } as const;
export interface TimelineLayout {
  height: number;
  energy: { rect: Rect; points: [number, number][] };            // pixel points, y = energyH * (1 - value)
  sections: { id: string; name: string; color: string; rect: Rect }[];
  lanes: { id: string; name: string; icon: string; color: string; rect: Rect }[];   // rect spans the view width
  ribbons: { motif: string; character: string; color: string; lane: string; rect: Rect }[]; // at the bottom of their lane; character is the character id, color that character's colour from the score
  ticks: AxisTick[];                                             // the time axis: visible bar starts (music) or seconds ticks (sound)
}
export function layoutTimeline(score: Score, tempo: TempoMap, view: View): TimelineLayout;

// src/hit.ts
export type Zone = 'energy' | 'sections' | 'lanes' | 'none';
export interface Hit { time: number; bar: number | null; zone: Zone; laneId: string | null; sectionId: string | null }  // bar is null on a sound piece
export function hitTimeline(layout: TimelineLayout, view: View, tempo: TempoMap, x: number, y: number): Hit;
export interface Span { from: number; to: number; fromBar: number | null; toBar: number | null; laneId: string | null }  // the bars are null on a sound piece
/** The span between two hits, in time order; the lane only when both hits are in the same lane. */
export function spanBetween(a: Hit, b: Hit, tempo: TempoMap): Span;
```

Vertical order: energy band `0..48`, sections `48..76` (empty when a sound piece has no sections), then one lane per row from `76`, `laneH` each. Bars are drawn and hit from the tempo map, never from pixel arithmetic alone; a sound piece has no bars, so it is drawn and hit in seconds, and its sections are optional moments.

- [ ] **Step 1: Write the failing tests**

`test/tempo.test.ts`:

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { sectionTimes, tempoMap } from '../src/tempo.ts';
import type { Score } from '../src/score.ts';

const score = (): Score => JSON.parse(readFileSync(new URL('./fixtures/score-v1.json', import.meta.url), 'utf8')) as Score;
const sound = (): Score => JSON.parse(readFileSync(new URL('./fixtures/score-sound-v1.json', import.meta.url), 'utf8')) as Score;

test('one tempo: two seconds a bar', () => {
  const m = tempoMap(score());
  assert.deepEqual([m.barStart(1), m.barStart(5), m.barStart(8)], [0, 8, 14]);
  assert.deepEqual([m.barStart(9), m.barStart(99)], [16, 16], 'a bar past the last starts at the end of the piece (duration 16), not at the last bar');
  assert.deepEqual([m.barAt(0), m.barAt(7.99), m.barAt(8), m.barAt(16), m.barAt(99), m.barAt(-1)], [1, 4, 5, 8, 8, 1]);
});

test('a tempo and metre change mid-piece', () => {
  const s = score();
  s.tempo = [{ bar: 1, bpm: 120, beats: 4, unit: 4 }, { bar: 3, bpm: 60, beats: 3, unit: 4 }];
  const m = tempoMap(s);
  assert.deepEqual([m.barStart(2), m.barStart(3), m.barStart(4)], [2, 4, 7]);
  assert.equal(m.barAt(6.9), 3);
  assert.equal(m.barAt(7), 4);
});

test('a sound piece has no bars: the map says so and sections are moments', () => {
  const s = sound();
  const m = tempoMap(s);
  assert.equal(m.metric, false);
  assert.equal(tempoMap(score()).metric, true);
  assert.deepEqual([m.barAt(0), m.barAt(0.3), m.barAt(99)], [null, null, null]);
  assert.deepEqual([m.barStart(1), m.barStart(2)], [0, s.duration]);
  assert.deepEqual(s.sections.map(x => sectionTimes(x, m, s.duration)), [{ from: 0, to: 0.08 }, { from: 0.08, to: 0.4 }]);
});

test('a music section covers its bars, the last to the end of the piece', () => {
  const s = score();
  const m = tempoMap(s);
  assert.deepEqual(s.sections.map(x => sectionTimes(x, m, s.duration)), [{ from: 0, to: 8 }, { from: 8, to: 16 }]);
});
```

`test/zoom.test.ts`:

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { boundsFor, fitView, panBy, pinch, timeToX, xToTime, zoomAt, MAX_PX_PER_SEC } from '../src/zoom.ts';

const b = boundsFor(16, 800);
const fit = fitView(16, 800);

test('fit shows the whole piece', () => {
  assert.deepEqual(fit, { start: 0, pxPerSec: 50, width: 800 });
  assert.equal(timeToX(fit, 4), 200);
  assert.equal(xToTime(fit, 200), 4);
});

test('zoom keeps the time under the pointer', () => {
  const v = zoomAt(fit, 200, 2, b);
  assert.deepEqual(v, { start: 2, pxPerSec: 100, width: 800 });
  assert.equal(xToTime(v, 200), 4);
});

test('zoom and pan are clamped to the piece', () => {
  assert.deepEqual(zoomAt(fit, 400, 0.1, b), fit, 'never smaller than the whole piece');
  assert.equal(zoomAt(fit, 0, 1e6, b).pxPerSec, MAX_PX_PER_SEC);
  const v = zoomAt(fit, 0, 2, b);
  assert.equal(panBy(v, 10_000, b).start, 0, 'cannot pan before the start');
  assert.equal(panBy(v, -10_000, b).start, 8, 'cannot pan past the end (16 s - 800 px / 100 px/s)');
});

test('a very short sound fits the view and can still zoom in', () => {
  const short = boundsFor(0.4, 800);
  const whole = fitView(0.4, 800);
  assert.ok(Math.abs(whole.pxPerSec - 2000) < 1e-6 && Math.abs(short.minPxPerSec - 2000) < 1e-6, 'a 0.4 s sound fills 800 px');
  assert.ok(Math.abs(short.maxPxPerSec - 16000) < 1e-6, 'the ceiling is eight times the fit, not the 400 px/s a long piece gets');
  assert.equal(whole.start, 0);
  assert.equal(zoomAt(whole, 400, 1e6, short).pxPerSec, short.maxPxPerSec);
  assert.equal(zoomAt(whole, 400, 0.1, short).pxPerSec, short.minPxPerSec, 'never smaller than the whole sound');
  assert.equal(b.maxPxPerSec, MAX_PX_PER_SEC, 'a 16 s piece on 800 px keeps the 400 px/s ceiling');
});

test('pinch: the times under the fingers follow them', () => {
  const v = pinch(fit, [100, 300], [0, 400], b);
  assert.deepEqual(v, { start: 2, pxPerSec: 100, width: 800 });
  assert.deepEqual(pinch(fit, [100, 100], [0, 400], b), fit, 'fingers on one spot change nothing');
});
```

`test/axis.test.ts`:

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { axisTicks, formatSeconds, secondsTicks } from '../src/axis.ts';
import { tempoMap } from '../src/tempo.ts';
import { fitView, zoomAt, boundsFor } from '../src/zoom.ts';
import type { Score } from '../src/score.ts';

const read = (name: string): Score => JSON.parse(readFileSync(new URL(`./fixtures/${name}`, import.meta.url), 'utf8')) as Score;
const close = (a: number, b: number) => assert.ok(Math.abs(a - b) < 1e-6, `${a} ≈ ${b}`);

test('milliseconds below one second, seconds above', () => {
  assert.deepEqual([0, 0.01, 0.05, 0.3, 0.999, 1, 1.5, 2.25, 12].map(formatSeconds), ['0 s', '10 ms', '50 ms', '300 ms', '999 ms', '1 s', '1.5 s', '2.25 s', '12 s']);
});

test('a 0.4 s sound is ticked every 50 ms across the full width', () => {
  const ticks = secondsTicks(fitView(0.4, 800));
  assert.deepEqual(ticks.map(t => t.label), ['0 s', '50 ms', '100 ms', '150 ms', '200 ms', '250 ms', '300 ms', '350 ms']);
  assert.ok(ticks.every(t => t.bar === null));
  close(ticks[1]!.x, 100);
  close(ticks[7]!.x, 700);
});

test('a longer sound is ticked in whole seconds, and zooming in narrows the step', () => {
  assert.deepEqual(secondsTicks(fitView(12, 600)).map(t => t.label), ['0 s', '2 s', '4 s', '6 s', '8 s', '10 s']);
  const zoomed = zoomAt(fitView(12, 600), 0, 8, boundsFor(12, 600)); // 400 px/s
  assert.deepEqual(secondsTicks(zoomed).map(t => t.label), ['0 s', '200 ms', '400 ms', '600 ms', '800 ms', '1 s', '1.2 s', '1.4 s']);
});

test('a music piece is ticked by bar, a sound piece by seconds', () => {
  const music = read('score-v1.json');
  const bars = axisTicks(music, tempoMap(music), fitView(16, 800));
  assert.deepEqual(bars.map(t => [t.bar, t.label]), [1, 2, 3, 4, 5, 6, 7, 8].map(n => [n, String(n)]));
  const sound = read('score-sound-v1.json');
  const seconds = axisTicks(sound, tempoMap(sound), fitView(sound.duration, 800));
  assert.equal(seconds[1]!.label, '50 ms');
  assert.ok(seconds.every(t => t.bar === null));
});
```

`test/timeline.test.ts`:

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { layoutTimeline, TIMELINE } from '../src/timeline.ts';
import { tempoMap } from '../src/tempo.ts';
import { boundsFor, fitView, zoomAt } from '../src/zoom.ts';
import type { Score } from '../src/score.ts';

const read = (name: string): Score => JSON.parse(readFileSync(new URL(`./fixtures/${name}`, import.meta.url), 'utf8')) as Score;
const score = read('score-v1.json');
const sound = read('score-sound-v1.json');
const tempo = tempoMap(score);
const close = (a: number, b: number) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≈ ${b}`);

test('sections, lanes and ribbons in pixels at fit', () => {
  const l = layoutTimeline(score, tempo, fitView(16, 800));
  assert.deepEqual(l.sections.map(s => [s.id, s.rect]), [
    ['stirs', { x: 0, y: 48, w: 400, h: 28 }],
    ['thread', { x: 400, y: 48, w: 400, h: 28 }],
  ]);
  assert.deepEqual(l.lanes.map(x => [x.id, x.rect.y, x.rect.h]), [['strings-low', 76, 36], ['brass', 112, 36]]);
  assert.deepEqual(l.ribbons, [{ motif: 'ariadne', character: 'ariadne', color: '#d4a017', lane: 'brass', rect: { x: 400, y: 142, w: 400, h: TIMELINE.ribbonH } }]);
  assert.equal(l.height, 148);
  assert.deepEqual(l.ticks.map(t => t.x), [0, 100, 200, 300, 400, 500, 600, 700]);
  assert.deepEqual(l.ticks.map(t => t.label), ['1', '2', '3', '4', '5', '6', '7', '8']);
  const [p0, p1, p2] = l.energy.points;
  close(p0![0], 0); close(p0![1], 38.4);
  close(p1![0], 400); close(p1![1], 24);
  close(p2![0], 800); close(p2![1], 4.8);
});

test("a ribbon takes the colour of the score's own character", () => {
  const s: Score = { ...score, characters: score.characters.map(c => (c.id === 'ariadne' ? { ...c, color: '#112233' } : c)) };
  assert.equal(layoutTimeline(s, tempoMap(s), fitView(16, 800)).ribbons[0]!.color, '#112233');
});

test('zoomed in, layout follows the view', () => {
  const v = zoomAt(fitView(16, 800), 400, 4, boundsFor(16, 800)); // 200 px/s, start 6
  const l = layoutTimeline(score, tempo, v);
  assert.deepEqual(l.sections.map(s => [s.id, s.rect.x, s.rect.w]), [['stirs', -1200, 1600], ['thread', 400, 1600]]);
  assert.deepEqual(l.ticks.map(t => t.bar), [4, 5], 'only bar starts with 0 <= x < width (6 s and 8 s)');
});

test('a sound piece is laid out in seconds: moments for sections, layers for lanes, a seconds axis', () => {
  const l = layoutTimeline(sound, tempoMap(sound), fitView(sound.duration, 800)); // 2000 px/s
  assert.deepEqual(l.sections.map(s => s.id), ['blast', 'echo']);
  close(l.sections[0]!.rect.x, 0); close(l.sections[0]!.rect.w, 160);
  close(l.sections[1]!.rect.x, 160); close(l.sections[1]!.rect.w, 640);
  assert.deepEqual(l.lanes.map(x => [x.id, x.rect.y]), [['boom', 76], ['air', 112]]);
  assert.deepEqual(l.ribbons, [], 'no characters, no ribbons');
  assert.deepEqual(l.ticks.map(t => t.label), ['0 s', '50 ms', '100 ms', '150 ms', '200 ms', '250 ms', '300 ms', '350 ms']);
  assert.ok(l.ticks.every(t => t.bar === null));
});

test('a sound piece without sections still lays out its lanes', () => {
  const bare: Score = { ...sound, sections: [] };
  const l = layoutTimeline(bare, tempoMap(bare), fitView(bare.duration, 800));
  assert.deepEqual([l.sections, l.lanes.map(x => x.id)], [[], ['boom', 'air']]);
});
```

`test/hit.test.ts`:

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { hitTimeline, spanBetween } from '../src/hit.ts';
import { layoutTimeline } from '../src/timeline.ts';
import { tempoMap } from '../src/tempo.ts';
import { boundsFor, fitView, zoomAt } from '../src/zoom.ts';
import type { Score } from '../src/score.ts';

const score = JSON.parse(readFileSync(new URL('./fixtures/score-v1.json', import.meta.url), 'utf8')) as Score;
const sound = JSON.parse(readFileSync(new URL('./fixtures/score-sound-v1.json', import.meta.url), 'utf8')) as Score;
const tempo = tempoMap(score);
const view = fitView(16, 800);
const layout = layoutTimeline(score, tempo, view);
const close = (a: number, b: number) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≈ ${b}`);

test('a tap maps to the right bar, lane and section', () => {
  assert.deepEqual(hitTimeline(layout, view, tempo, 450, 120), { time: 9, bar: 5, zone: 'lanes', laneId: 'brass', sectionId: 'thread' });
  assert.deepEqual(hitTimeline(layout, view, tempo, 50, 80), { time: 1, bar: 1, zone: 'lanes', laneId: 'strings-low', sectionId: 'stirs' });
  assert.equal(hitTimeline(layout, view, tempo, 10, 10).zone, 'energy');
  assert.equal(hitTimeline(layout, view, tempo, 10, 60).zone, 'sections');
  assert.deepEqual(hitTimeline(layout, view, tempo, 10, 500), { time: 0.2, bar: 1, zone: 'none', laneId: null, sectionId: 'stirs' });
});

test('hits stay right when zoomed', () => {
  const v = zoomAt(view, 200, 2, boundsFor(16, 800));
  const l = layoutTimeline(score, tempo, v);
  assert.equal(hitTimeline(l, v, tempo, 200, 120).bar, 3);
});

test('times outside the piece clamp', () => {
  assert.equal(hitTimeline(layout, view, tempo, -50, 120).time, 0);
  assert.equal(hitTimeline(layout, view, tempo, 900, 120).time, 16);
});

test('on a sound piece a tap has seconds and no bar', () => {
  const sTempo = tempoMap(sound);
  const sView = fitView(sound.duration, 800); // 2000 px/s
  const sLayout = layoutTimeline(sound, sTempo, sView);
  const early = hitTimeline(sLayout, sView, sTempo, 40, 90);
  close(early.time, 0.02);
  assert.deepEqual([early.bar, early.zone, early.laneId, early.sectionId], [null, 'lanes', 'boom', 'blast']);
  const late = hitTimeline(sLayout, sView, sTempo, 400, 120);
  close(late.time, 0.2);
  assert.deepEqual([late.bar, late.laneId, late.sectionId], [null, 'air', 'echo']);
  assert.equal(hitTimeline(sLayout, sView, sTempo, 900, 120).time, sound.duration, 'clamped to the end');
  const span = spanBetween(late, early, sTempo);
  close(span.from, 0.02); close(span.to, 0.2);
  assert.deepEqual([span.fromBar, span.toBar, span.laneId], [null, null, null], 'seconds only, no shared lane');
});

test('a span runs forward and keeps a shared lane only', () => {
  const a = hitTimeline(layout, view, tempo, 700, 120);
  const b = hitTimeline(layout, view, tempo, 450, 120);
  assert.deepEqual(spanBetween(a, b, tempo), { from: 9, to: 14, fromBar: 5, toBar: 8, laneId: 'brass' });
  const c = hitTimeline(layout, view, tempo, 50, 80);
  assert.equal(spanBetween(a, c, tempo).laneId, null);
});
```

- [ ] **Step 2: Run to see them fail**

Run: `node --test workroom/test/tempo.test.ts workroom/test/axis.test.ts workroom/test/zoom.test.ts workroom/test/timeline.test.ts workroom/test/hit.test.ts` — FAIL (modules missing).

- [ ] **Step 3: Implement** the five modules. `tempoMap` for a music score precomputes each bar's start from the tempo list (`secondsPerBar = beats * 60 / bpm`); `barStart(n)` for `n > score.bars` returns `score.duration`, and `barAt` clamps to `[1, bars]`; for a sound score it returns `{ metric: false, barStart: n => (n <= 1 ? 0 : duration), barAt: () => null }`. `sectionTimes` is the one place a section becomes seconds. `formatSeconds(t)` is `"0 s"` for 0, `"<round(t*1000)> ms"` below one second, else `"<t rounded to 2 decimals, no trailing zeros> s"`. `secondsTicks` takes the smallest step from `[0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10, 15, 30, 60, 120, 300]` seconds whose `step * view.pxPerSec >= 60`, then walks `k * step` (rounded to 9 decimals) from the first multiple at or after `view.start`, keeping ticks with `-1e-6 <= x < view.width - 1e-6`; `axisTicks` returns, for a music score, one tick per bar whose start has that `x` (label = the bar number, `bar` = the bar). `boundsFor` returns `maxPxPerSec = Math.max(MAX_PX_PER_SEC, 8 * minPxPerSec)`; `fitView` is `width / duration` whatever that is, so the default zoom always fits the whole piece. `layoutTimeline` lays every section out with `sectionTimes` (the sections band is empty for a sound piece without sections), colours a ribbon with `motifColor`, and fills `ticks` from `axisTicks`. `layoutTimeline` lists every section and ribbon (SVG clips what is off screen) and only the bar ticks with `0 ≤ x < width`. `hitTimeline`: `time = clamp(xToTime(view, x), 0, duration)`; `bar = tempo.barAt(time)` (null on a sound piece); zone from y against the layout's bands; `laneId` from the lane whose rect contains y; `sectionId` from the section whose `sectionTimes` interval contains `time` (`from <= time < to`; the last section also owns `time == duration`; any y). `spanBetween` takes `fromBar`/`toBar` from the two hits' bars, null when either is null.

- [ ] **Step 4: Run the tests** — PASS. Add the files to `tsconfig.json`, run `node _kit/build/build.mjs workroom --check` — exit 0.

- [ ] **Step 5: Commit**

```bash
git add websites/www.cs/games/workroom
git commit -m "Music workroom: tempo map, time axis, zoom, timeline layout and hit testing

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb"
```

### Task 7: Piano roll, sound picture axes and touch gestures

**Files:**
- Create: `games/workroom/src/pianoroll.ts`, `src/spectro.ts`, `src/gestures.ts`, `test/pianoroll.test.ts`, `test/spectro.test.ts`, `test/gestures.test.ts`
- Modify: `games/workroom/tsconfig.json` (add the three files)

**Interfaces:**
- Consumes: `Score`, `View`, `Bounds`, `timeToX`, `xToTime`, `zoomAt`, `panBy`, `pinch`, `Rect`, `TempoMap`, `Hit`.
- Produces:

```ts
// src/pianoroll.ts
export const ROLL = { minRowH: 4, maxRowH: 14 } as const;
export interface RollLayout {
  low: number; high: number; rowH: number; height: number;
  rows: { pitch: number; y: number; name: string; black: boolean }[];
  notes: { index: number; lane: string; motif: string | null; color: string; rect: Rect }[]; // index into score.notes
}
/** Pitch range = the shown notes' lowest - 1 .. highest + 1; higher pitch is higher (smaller y); colour = the motif's character colour from the score (motifColor), else lane colour. With no shown notes (a sound piece may have none) rows and notes are empty and rowH is 0. */
export function layoutRoll(score: Score, view: View, height: number, lanes?: ReadonlySet<string>): RollLayout;
export function pitchName(midi: number): string; // 60 → "C4", 61 → "C#4"
export function hitRoll(roll: RollLayout, view: View, tempo: TempoMap, score: Score, x: number, y: number): Hit & { pitch: number | null; noteIndex: number | null }; // bar is null on a sound piece

// src/spectro.ts
export function freqToY(spec: Spectrogram, hz: number, height: number): number;
/** "high" at the top, "low" at the bottom, and Hz ticks (100 Hz, 1 kHz, 10 kHz) that fall inside the range. */
export function spectroAxis(spec: Spectrogram, height: number): { y: number; text: string }[];
export const BRIGHTNESS_LEGEND: readonly [string, string]; // ['dark: quiet', 'bright: loud']

// src/gestures.ts
export interface PointerIn { id: number; x: number; y: number; t: number }
export type GestureOut =
  | { kind: 'tap'; x: number; y: number }
  | { kind: 'view'; view: View }
  | { kind: 'select'; x0: number; x1: number; y: number; done: boolean };
export interface Gestures {
  down(p: PointerIn): GestureOut[];
  move(p: PointerIn): GestureOut[];
  up(p: PointerIn): GestureOut[];
  cancel(id: number): GestureOut[];
  /** Trackpad pinch arrives as ctrl+wheel: zoom by exp(-deltaY / 200) about x; otherwise deltaX pans. */
  wheel(x: number, deltaX: number, deltaY: number, ctrl: boolean): GestureOut[];
}
export const TAP_SLOP_PX = 8;
export const TAP_MS = 300;
/** mode 'pan': one finger pans, two pinch; mode 'select' (pinning a span): one finger selects, two still pinch. */
export function createGestures(view: () => View, bounds: () => Bounds, mode: () => 'pan' | 'select'): Gestures;
```

- [ ] **Step 1: Write the failing tests**

`test/pianoroll.test.ts`:

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { hitRoll, layoutRoll, pitchName } from '../src/pianoroll.ts';
import { tempoMap } from '../src/tempo.ts';
import { fitView } from '../src/zoom.ts';
import type { Score } from '../src/score.ts';

const score = JSON.parse(readFileSync(new URL('./fixtures/score-v1.json', import.meta.url), 'utf8')) as Score;
const sound = JSON.parse(readFileSync(new URL('./fixtures/score-sound-v1.json', import.meta.url), 'utf8')) as Score;
const view = fitView(16, 800);
const close = (a: number, b: number) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≈ ${b}`);

test('higher is higher, longer is longer, coloured by motif then lane', () => {
  const r = layoutRoll(score, view, 280);
  assert.deepEqual([r.low, r.high], [35, 70]);
  assert.equal(r.rowH, 280 / 36, '36 rows, inside 4..14 px');
  const byIndex = new Map(r.notes.map(n => [n.index, n]));
  assert.ok(byIndex.get(5)!.rect.y < byIndex.get(3)!.rect.y, 'pitch 69 above pitch 62');
  assert.equal(byIndex.get(2)!.rect.w, 200, 'four seconds at 50 px/s');
  assert.equal(byIndex.get(3)!.color, '#d4a017', 'motif colour');
  assert.equal(byIndex.get(0)!.color, '#7a9cc6', 'lane colour');
});

test('one lane at a time narrows the range', () => {
  const r = layoutRoll(score, view, 280, new Set(['brass']));
  assert.deepEqual([r.low, r.high, r.notes.length], [61, 70, 3]);
});

test('pitch names', () => {
  assert.deepEqual([60, 61, 38, 69].map(pitchName), ['C4', 'C#4', 'D2', 'A4']);
});

test('a tap on a note finds it', () => {
  const r = layoutRoll(score, view, 280);
  const n = r.notes.find(x => x.index === 4)!;
  const hit = hitRoll(r, view, tempoMap(score), score, n.rect.x + 2, n.rect.y + 1);
  assert.deepEqual([hit.noteIndex, hit.pitch, hit.laneId, hit.bar], [4, 65, 'brass', 6]);
});

test('a sound piece with no notes has an empty roll', () => {
  const r = layoutRoll(sound, fitView(sound.duration, 800), 280);
  assert.deepEqual([r.rows, r.notes, r.rowH], [[], [], 0]);
});

test('a sound piece with notes draws them in seconds and hits them with no bar', () => {
  const s: Score = { ...sound, notes: [
    { lane: 'boom', start: 0, length: 0.1, pitch: 36, velocity: 100, motif: null },
    { lane: 'air', start: 0.1, length: 0.2, pitch: 60, velocity: 90, motif: null },
  ] };
  const v = fitView(s.duration, 800); // 2000 px/s
  const r = layoutRoll(s, v, 280);
  close(r.notes[0]!.rect.w, 200);
  close(r.notes[1]!.rect.x, 200);
  assert.deepEqual(r.notes.map(n => n.color), ['#c0392b', '#7a9cc6'], 'lane colours: no motifs');
  const n = r.notes[0]!;
  const hit = hitRoll(r, v, tempoMap(s), s, n.rect.x + 2, n.rect.y + 1);
  assert.deepEqual([hit.noteIndex, hit.pitch, hit.laneId, hit.bar], [0, 36, 'boom', null]);
});
```

`test/spectro.test.ts`:

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BRIGHTNESS_LEGEND, freqToY, spectroAxis } from '../src/spectro.ts';
import type { Spectrogram } from '../src/score.ts';

const spec: Spectrogram = { file: 'spectrogram.png', low_hz: 30, high_hz: 16000, scale: 'log' };

test('low at the bottom, high at the top, log spaced', () => {
  assert.equal(freqToY(spec, 30, 300), 300);
  assert.equal(freqToY(spec, 16000, 300), 0);
  const mid = Math.sqrt(30 * 16000);
  assert.ok(Math.abs(freqToY(spec, mid, 300) - 150) < 1e-9);
});

test('labels in plain words and Hz', () => {
  assert.deepEqual(spectroAxis(spec, 300).map(l => l.text), ['high', '10 kHz', '1 kHz', '100 Hz', 'low']);
  assert.deepEqual(BRIGHTNESS_LEGEND, ['dark: quiet', 'bright: loud']);
});
```

`test/gestures.test.ts`:

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createGestures, TAP_MS, type GestureOut } from '../src/gestures.ts';
import { boundsFor, fitView, type View } from '../src/zoom.ts';

const setup = (mode: 'pan' | 'select' = 'pan') => {
  let v: View = fitView(16, 800);
  const g = createGestures(() => v, () => boundsFor(16, 800), () => mode);
  const apply = (outs: GestureOut[]) => { for (const o of outs) if (o.kind === 'view') v = o.view; return outs; };
  return { g, apply, view: () => v };
};

test('a short still touch is a tap', () => {
  const { g } = setup();
  g.down({ id: 1, x: 100, y: 50, t: 0 });
  assert.deepEqual(g.up({ id: 1, x: 103, y: 52, t: 120 }), [{ kind: 'tap', x: 103, y: 52 }]);
});

test('a slow or moved touch is not a tap', () => {
  const { g } = setup();
  g.down({ id: 1, x: 100, y: 50, t: 0 });
  assert.deepEqual(g.up({ id: 1, x: 100, y: 50, t: TAP_MS + 1 }), []);
});

test('two fingers pinch and one drags (zoomed in)', () => {
  const { g, apply, view } = setup();
  apply(g.down({ id: 1, x: 100, y: 50, t: 0 }));
  apply(g.down({ id: 2, x: 300, y: 50, t: 5 }));
  apply(g.move({ id: 1, x: 0, y: 50, t: 20 }));
  apply(g.move({ id: 2, x: 400, y: 50, t: 20 }));
  assert.deepEqual(view(), { start: 2, pxPerSec: 100, width: 800 });
  apply(g.up({ id: 2, x: 400, y: 50, t: 40 }));
  apply(g.move({ id: 1, x: 100, y: 50, t: 60 }));
  assert.equal(view().start, 1, 'a 100 px drag right at 100 px/s moves one second back');
});

test('select mode: one finger selects a span', () => {
  const { g } = setup('select');
  g.down({ id: 1, x: 100, y: 120, t: 0 });
  assert.deepEqual(g.move({ id: 1, x: 300, y: 120, t: 50 }), [{ kind: 'select', x0: 100, x1: 300, y: 120, done: false }]);
  assert.deepEqual(g.up({ id: 1, x: 300, y: 120, t: 400 }), [{ kind: 'select', x0: 100, x1: 300, y: 120, done: true }]);
});

test('ctrl+wheel zooms about the pointer, wheel pans', () => {
  const { g, apply, view } = setup();
  apply(g.wheel(200, 0, -200 * Math.log(2), true));
  assert.ok(Math.abs(view().pxPerSec - 100) < 1e-9);
  apply(g.wheel(200, 100, 0, false));
  assert.ok(Math.abs(view().start - 3) < 1e-9);
});
```

- [ ] **Step 2: Run to see them fail** — `node --test workroom/test/pianoroll.test.ts workroom/test/spectro.test.ts workroom/test/gestures.test.ts` — FAIL.

- [ ] **Step 3: Implement.** A pinch is computed from the view and the two finger positions at the moment the second finger went down; when one finger lifts, a one-finger pan starts afresh from the remaining finger's position and the current view. `spectroAxis` lists the top label, the decade ticks from high to low, then the bottom label; a `linear` scale maps `y = height * (1 - (hz - low) / (high - low))`.

- [ ] **Step 4: Run the tests** — PASS; add the files to `tsconfig.json`; `node _kit/build/build.mjs workroom --check` — exit 0.

- [ ] **Step 5: Commit**

```bash
git add websites/www.cs/games/workroom
git commit -m "Music workroom: piano roll, sound picture axes and touch gestures

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb"
```

### Task 8: The views, the shared playhead, the glossary cards and sheet music

**Files:**
- Create: `games/workroom/src/player.ts`, `src/tabs.ts`, `src/load.ts`, `src/sheet.ts`, `src/ui/Workroom.tsx`, `src/ui/ViewTabs.tsx`, `src/ui/Timeline.tsx`, `src/ui/PianoRoll.tsx`, `src/ui/SoundPicture.tsx`, `src/ui/Sheet.tsx`, `src/ui/Glossary.tsx`, `src/ui/Player.tsx`
- Create: `games/workroom/test/player.test.ts`, `test/tabs.test.ts`, `test/load.test.ts`, `test/views.test.ts`
- Modify: `games/workroom/src/main.ts`, `tsconfig.json` (`player.ts`, `tabs.ts`, `load.ts`), `src/tsconfig.dom.json` (`sheet.ts` and the `.tsx` files), `build.json` (entry `sheet`), `games/package.json` and `games/package-lock.json` (`opensheetmusicdisplay`), `music/music.css`

**Interfaces:**
- Consumes: everything from Tasks 5–7; `Music\Pages` routes `drafts.php`, `draft.php`.
- Produces:

```ts
// src/player.ts (DOM-free)
export function pickSource(sources: readonly AudioSource[], canPlay: (type: string) => string): AudioSource | null; // first with canPlay !== ''
export interface Clip { from: number; to: number }
/** Where a clip stops: true once t has reached clip.to. */
export function clipDone(t: number, clip: Clip): boolean;
/** Keeps the playhead visible: a view whose window contains t, moved by whole pages. */
export function follow(view: View, t: number, b: Bounds): View;

// src/tabs.ts (DOM-free)
export type Tab = 'story' | 'roll' | 'sound' | 'sheet';
export const TAB_LABELS: Readonly<Record<Tab, string>>; // Story, Piano roll, Sound picture, Sheet music
/** The views a piece offers, in this order: Story and Sound picture always; Piano roll only when the score has notes; Sheet music only for a music piece (a sound piece never shows it, even when it carries MusicXML). */
export function tabsFor(score: Score): Tab[];
/** The wanted tab when the piece offers it, else 'story'. */
export function pickTab(tabs: readonly Tab[], wanted: Tab): Tab;

// src/load.ts (DOM-free; fetch is a port)
export type Fetch = (url: string, init?: { method?: string; headers?: Record<string, string>; body?: Uint8Array<ArrayBuffer> }) => Promise<{ ok: boolean; status: number; redirected: boolean; headers: { get(n: string): string | null }; json(): Promise<unknown>; arrayBuffer(): Promise<ArrayBuffer>; text(): Promise<string> }>;
export const draftUrl = (piece: string, version: number, file: string) => string; // `draft.php?piece=..&v=..&file=..`
export type Loaded = { ok: true; score: Score; version: number; versions: number[] } | { ok: false; error: string };
/** Reads drafts.php for the versions, then score.json for the asked (or latest) one; unknown schema → its message; a redirect → "Your sign-in ended. Sign in again." */
export function loadDraft(fetch: Fetch, piece: string, version: number | null): Promise<Loaded>;

// src/sheet.ts (DOM)
/** Renders one lane (the MusicXML part with that id) with OpenSheetMusicDisplay into el. */
export function renderSheet(el: HTMLElement, musicxml: string, laneId: string): Promise<void>;
```

Components (thin: they hold no logic the DOM-free modules can hold):

```tsx
// src/ui/Workroom.tsx
export interface WorkroomProps { score: Score; version: number; versions: number[]; audioSrc: (file: string) => string; onVersion(v: number): void; children?: ComponentChildren }
export function Workroom(p: WorkroomProps): JSX.Element; // owns view (View, initially fitView(score.duration, width): the whole piece, even a 0.3 s sound), time (number), tab (a Tab from tabsFor(score); pickTab keeps it valid), lane filter, open term;
// above the views: the draft picker, the Player, the ViewTabs (only the tabs tabsFor(score) returns, so a sound piece never shows Sheet music and shows the Piano roll only when it has notes),
// a "Words in this piece" row of Glossary.Word buttons from termsIn(score),
// and Claude's change list (changes[].text through splitTerms) pinned to its bars (music) or its seconds (sound) on the story timeline

// src/ui/Timeline.tsx
export interface TimelineProps { score: Score; tempo: TempoMap; view: View; time: number; onSeek(t: number): void; onView(v: View): void; onTerm(id: string): void; overlay?: ComponentChildren }
// renders <svg class="tl" data-timeline> with data-section, data-lane, data-motif attributes and one <text data-tick> per layout tick (the label is the bar number on a music piece, "50 ms" or "1.5 s" on a sound piece). Section names run through splitTerms and are drawn
// as SVG text: a plain run is a <tspan>, a glossary word is a <tspan data-term="<id>" class="word" role="button" tabindex="0"> whose onClick (and
// Enter or Space on keydown) calls onTerm(id). Its onPointerDown stops propagation, so tapping a word opens the card and does not also seek.
// HTML buttons (Glossary.Word) are never placed inside the <svg>; they belong to the rows above and below it.

// src/ui/PianoRoll.tsx   props { score, tempo, view, time, lanes?: ReadonlySet<string>, onSeek, onView }  (its time axis comes from axisTicks; Workroom renders it only when tabsFor offers it)
// src/ui/SoundPicture.tsx props { score, view, time, imageSrc: string, onSeek, onView }  (an <img data-spectrogram> stretched by the view, the axis labels and the legend)
// src/ui/Sheet.tsx       props { musicxmlSrc: string, laneId: string, lanes: Lane[], onLane(id: string): void }
//                        (a lane picker, and one <div id="sheet"> that renderSheet draws the notation into; the browser check waits for `#sheet svg`)
// src/ui/Glossary.tsx    export function Word(p: { term: Term; text: string; onOpen(id: string): void }): JSX.Element;
//                        export function Card(p: { term: Term; clip: Clip | null; onHear(c: Clip): void; onClose(): void }): JSX.Element;
// src/ui/Player.tsx      props { src: AudioSource[], audioSrc(file): string, time: number, bar: number | null, onTime(t: number): void, clip: Clip | null, onClipDone(): void }
//                        (an <audio> element, one button named "Play" or "Pause", the time as formatSeconds(time) and, on a music piece, "bar N" from `bar`; a sound piece passes bar null and shows seconds only)
// src/ui/ViewTabs.tsx    props { tabs: Tab[], tab: Tab, onTab(t: Tab): void } — one button per entry of `tabs`, labelled from TAB_LABELS ("Story", "Piano roll", "Sound picture", "Sheet music")
```

`main.ts` reads `document.body.dataset` (`view`, `piece`, `version`), and for `piece` calls `loadDraft(window.fetch.bind(window), ...)` then renders `Workroom` into `#workroom`; for `index` it renders nothing yet (Task 15 adds the waiting counts). The sheet bundle is a second entry, `{ "in": "src/sheet.ts", "out": "sheet", "format": "esm" }`, loaded only when the Sheet tab opens with `import(new URL('./sheet.js', import.meta.url).href)`.

- [ ] **Step 1: Write the failing tests**

`test/player.test.ts`:

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { clipDone, follow, pickSource } from '../src/player.ts';
import { boundsFor, fitView, zoomAt } from '../src/zoom.ts';
import type { AudioSource } from '../src/score.ts';

const webm: AudioSource = { file: 'audio.webm', type: 'audio/webm; codecs=opus' };
const m4a: AudioSource = { file: 'audio.m4a', type: 'audio/mp4; codecs=mp4a.40.2' };

test('the first playable source wins (Safari without WebM Opus gets the m4a)', () => {
  assert.equal(pickSource([webm, m4a], t => (t.startsWith('audio/webm') ? 'probably' : 'maybe')), webm);
  assert.equal(pickSource([webm, m4a], t => (t.startsWith('audio/webm') ? '' : 'maybe')), m4a);
  assert.equal(pickSource([webm], () => ''), null);
});

test('a hear-it clip stops at its end', () => {
  assert.equal(clipDone(3.9, { from: 0, to: 4 }), false);
  assert.equal(clipDone(4, { from: 0, to: 4 }), true);
});

test('the view follows the playhead a page at a time', () => {
  const b = boundsFor(16, 800);
  const v = zoomAt(fitView(16, 800), 0, 4, b); // 200 px/s, 4 s visible from 0
  assert.equal(follow(v, 3, b).start, 0);
  assert.equal(follow(v, 5, b).start, 4);
  assert.equal(follow(v, 15.5, b).start, 12, 'clamped to the end');
});
```

`test/tabs.test.ts`:

```ts
// Which views a piece offers: a sound effect never gets Sheet music, and the
// Piano roll waits for notes.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { TAB_LABELS, pickTab, tabsFor } from '../src/tabs.ts';
import type { Score } from '../src/score.ts';

const read = (name: string): Score => JSON.parse(readFileSync(new URL(`./fixtures/${name}`, import.meta.url), 'utf8')) as Score;

test('a music piece offers all four views', () => {
  assert.deepEqual(tabsFor(read('score-v1.json')), ['story', 'roll', 'sound', 'sheet']);
  assert.deepEqual(Object.values(TAB_LABELS), ['Story', 'Piano roll', 'Sound picture', 'Sheet music']);
});

test('a sound effect without notes offers the story and the sound picture only', () => {
  assert.deepEqual(tabsFor(read('score-sound-v1.json')), ['story', 'sound']);
});

test('a sound effect with notes gets the piano roll but never sheet music, even with MusicXML', () => {
  const s: Score = { ...read('score-sound-v1.json'), musicxml: 'score.musicxml', notes: [{ lane: 'boom', start: 0, length: 0.1, pitch: 36, velocity: 100, motif: null }] };
  assert.deepEqual(tabsFor(s), ['story', 'roll', 'sound']);
});

test('a music piece without notes has no piano roll', () => {
  assert.deepEqual(tabsFor({ ...read('score-v1.json'), notes: [], motifs: [] }), ['story', 'sound', 'sheet']);
});

test('a tab the piece does not offer falls back to the story', () => {
  assert.equal(pickTab(['story', 'sound'], 'sheet'), 'story');
  assert.equal(pickTab(['story', 'sound'], 'sound'), 'sound');
});
```

`test/load.test.ts`:

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { loadDraft, type Fetch } from '../src/load.ts';

const scoreText = readFileSync(new URL('./fixtures/score-v1.json', import.meta.url), 'utf8');
const reply = (body: unknown, extra: { status?: number; redirected?: boolean } = {}) => ({
  ok: (extra.status ?? 200) < 400, status: extra.status ?? 200, redirected: extra.redirected ?? false,
  headers: { get: () => 'application/json' }, json: async () => body, arrayBuffer: async () => new ArrayBuffer(0), text: async () => JSON.stringify(body),
});
const fakeFetch = (score: unknown, redirected = false): { fetch: Fetch; urls: string[] } => {
  const urls: string[] = [];
  return {
    urls,
    fetch: async url => {
      urls.push(url);
      if (redirected) return reply('<html>', { redirected: true });
      return url.startsWith('drafts.php') ? reply({ drafts: [{ version: 2, published_at: 2 }, { version: 1, published_at: 1 }] }) : reply(score);
    },
  };
};

test('loads the latest draft by default', async () => {
  const f = fakeFetch({ ...JSON.parse(scoreText), draft: 2 });
  const r = await loadDraft(f.fetch, 'test-piece', null);
  assert.ok(r.ok);
  assert.deepEqual(r.ok && [r.version, r.versions], [2, [2, 1]]);
  assert.deepEqual(f.urls, ['drafts.php?piece=test-piece', 'draft.php?piece=test-piece&v=2&file=score.json']);
});

test('a sound effect loads like a piece of music', async () => {
  const sound = JSON.parse(readFileSync(new URL('./fixtures/score-sound-v1.json', import.meta.url), 'utf8')) as unknown;
  const r = await loadDraft(fakeFetch(sound).fetch, 'cannon-fire', 1);
  assert.ok(r.ok);
  assert.deepEqual(r.ok && [r.score.kind, r.score.project.id, r.score.duration], ['sound', 'tankity', 0.4]);
});

test('an unknown schema is refused, not drawn', async () => {
  const r = await loadDraft(fakeFetch({ ...JSON.parse(scoreText), schema: 9 }).fetch, 'test-piece', 1);
  assert.deepEqual(r.ok ? '' : r.error.slice(0, 31), 'This draft uses score schema 9,');
});

test('a lost session says so', async () => {
  const r = await loadDraft(fakeFetch(null, true).fetch, 'test-piece', null);
  assert.deepEqual(r, { ok: false, error: 'Your sign-in ended. Sign in again.' });
});
```

`test/views.test.ts`:

```ts
// The views are thin: the timeline draws what the layout says, a tap seeks to
// the hit time, a glossary word opens its two-line card, and Hear it plays the clip.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { h, render } from 'preact';
import { importTsx } from '../../_kit/test/tsx.ts';
import { fire, installDocument, makeEl, renderTarget, walk, type StubElement } from '../../_kit/test/dom-stub.ts';
import { tempoMap } from '../src/tempo.ts';
import { fitView } from '../src/zoom.ts';
import { term } from '../src/glossary.ts';
import { tabsFor } from '../src/tabs.ts';
import type { Score } from '../src/score.ts';

installDocument();
const ui = await importTsx<{
  tl: typeof import('../src/ui/Timeline.tsx');
  gl: typeof import('../src/ui/Glossary.tsx');
  tabs: typeof import('../src/ui/ViewTabs.tsx');
}>(import.meta.dirname, { tl: '../src/ui/Timeline.tsx', gl: '../src/ui/Glossary.tsx', tabs: '../src/ui/ViewTabs.tsx' });

const score = JSON.parse(readFileSync(new URL('./fixtures/score-v1.json', import.meta.url), 'utf8')) as Score;
const sound = JSON.parse(readFileSync(new URL('./fixtures/score-sound-v1.json', import.meta.url), 'utf8')) as Score;
const withAttr = (root: StubElement, name: string) => walk(root).filter(e => e._attrs[name] !== undefined);

test('the timeline draws sections, lanes and the motif ribbon', () => {
  const root = makeEl('root');
  render(h(ui.tl.Timeline, { score, tempo: tempoMap(score), view: fitView(16, 800), time: 0, onSeek: () => {}, onView: () => {}, onTerm: () => {} }), renderTarget(root));
  assert.deepEqual(withAttr(root, 'data-section').map(e => e._attrs['data-section']), ['stirs', 'thread']);
  assert.deepEqual(withAttr(root, 'data-lane').map(e => e._attrs['data-lane']), ['strings-low', 'brass']);
  assert.deepEqual(withAttr(root, 'data-motif').map(e => e._attrs['data-motif']), ['ariadne']);
  assert.match(root.textContent, /The Labyrinth stirs/);
});

test('a music timeline is ticked by bar', () => {
  const root = makeEl('root');
  render(h(ui.tl.Timeline, { score, tempo: tempoMap(score), view: fitView(16, 800), time: 0, onSeek: () => {}, onView: () => {}, onTerm: () => {} }), renderTarget(root));
  assert.deepEqual(withAttr(root, 'data-tick').map(e => e.textContent), ['1', '2', '3', '4', '5', '6', '7', '8']);
});

test('a sound effect fills the view, is ticked in milliseconds, and draws its layers and moments', () => {
  const root = makeEl('root');
  render(h(ui.tl.Timeline, { score: sound, tempo: tempoMap(sound), view: fitView(sound.duration, 800), time: 0, onSeek: () => {}, onView: () => {}, onTerm: () => {} }), renderTarget(root));
  assert.deepEqual(withAttr(root, 'data-tick').map(e => e.textContent), ['0 s', '50 ms', '100 ms', '150 ms', '200 ms', '250 ms', '300 ms', '350 ms']);
  assert.deepEqual(withAttr(root, 'data-lane').map(e => e._attrs['data-lane']), ['boom', 'air']);
  assert.deepEqual(withAttr(root, 'data-section').map(e => e._attrs['data-section']), ['blast', 'echo']);
  assert.deepEqual(withAttr(root, 'data-motif'), [], 'no characters, no ribbons');
});

test('a tap on a sound effect seeks to a time in seconds', () => {
  const root = makeEl('root');
  const seeks: number[] = [];
  render(h(ui.tl.Timeline, { score: sound, tempo: tempoMap(sound), view: fitView(sound.duration, 800), time: 0, onSeek: t => seeks.push(t), onView: () => {}, onTerm: () => {} }), renderTarget(root));
  const svg = withAttr(root, 'data-timeline')[0]!;
  fire(svg, 'pointerdown', { pointerId: 1, clientX: 400, clientY: 120, timeStamp: 0 });
  fire(svg, 'pointerup', { pointerId: 1, clientX: 400, clientY: 120, timeStamp: 50 });
  assert.equal(seeks.length, 1);
  assert.ok(Math.abs(seeks[0]! - 0.2) < 1e-9);
});

test('a glossary word in a section name is SVG text that opens its card, not a button', () => {
  const root = makeEl('root');
  const opened: string[] = [];
  const seeks: number[] = [];
  const s: Score = { ...score, sections: [{ ...score.sections[0]!, name: 'A Phrygian stir' }, score.sections[1]!] };
  render(h(ui.tl.Timeline, { score: s, tempo: tempoMap(s), view: fitView(16, 800), time: 0, onSeek: t => seeks.push(t), onView: () => {}, onTerm: id => opened.push(id) }), renderTarget(root));
  const word = withAttr(root, 'data-term')[0]!;
  assert.equal(word._attrs['data-term'], 'phrygian');
  assert.notEqual(word.localName, 'button', 'buttons do not belong inside an <svg>');
  assert.match(root.textContent, /A Phrygian stir/);
  fire(word, 'click');
  assert.deepEqual(opened, ['phrygian']);
  assert.deepEqual(seeks, []);
});

test('a tap on the timeline seeks to that time', () => {
  const root = makeEl('root');
  const seeks: number[] = [];
  render(h(ui.tl.Timeline, { score, tempo: tempoMap(score), view: fitView(16, 800), time: 0, onSeek: t => seeks.push(t), onView: () => {}, onTerm: () => {} }), renderTarget(root));
  const svg = withAttr(root, 'data-timeline')[0]!;
  fire(svg, 'pointerdown', { pointerId: 1, clientX: 450, clientY: 120, timeStamp: 0 });
  fire(svg, 'pointerup', { pointerId: 1, clientX: 450, clientY: 120, timeStamp: 50 });
  assert.deepEqual(seeks, [9]);
});

test('a glossary word opens a two-line card and Hear it plays the clip', () => {
  const root = makeEl('root');
  const heard: { from: number; to: number }[] = [];
  const t = term('ostinato')!;
  render(h(ui.gl.Card, { term: t, clip: { from: 0, to: 4 }, onHear: c => heard.push(c), onClose: () => {} }), renderTarget(root));
  assert.match(root.textContent, /repeated over and over/);
  const hear = walk(root).find(e => e.textContent === 'Hear it')!;
  fire(hear, 'click');
  assert.deepEqual(heard, [{ from: 0, to: 4 }]);
});

test('four view tabs for music', () => {
  const root = makeEl('root');
  const picked: string[] = [];
  render(h(ui.tabs.ViewTabs, { tabs: tabsFor(score), tab: 'story', onTab: t => picked.push(t) }), renderTarget(root));
  const buttons = walk(root).filter(e => e.localName === 'button');
  assert.deepEqual(buttons.map(b => b.textContent), ['Story', 'Piano roll', 'Sound picture', 'Sheet music']);
  fire(buttons[3]!, 'click');
  assert.deepEqual(picked, ['sheet']);
});

test('a sound effect has no Sheet music tab and no empty Piano roll', () => {
  const root = makeEl('root');
  render(h(ui.tabs.ViewTabs, { tabs: tabsFor(sound), tab: 'story', onTab: () => {} }), renderTarget(root));
  assert.deepEqual(walk(root).filter(e => e.localName === 'button').map(b => b.textContent), ['Story', 'Sound picture']);
  assert.doesNotMatch(root.textContent, /Sheet music|Piano roll/);
});
```

The timeline's SVG carries `data-timeline=""`, and pointer coordinates are taken as `e.clientX - rect.left` with `rect = el.getBoundingClientRect()`, treating a missing `left`/`top` as 0 (the stub's rect has only width and height).

- [ ] **Step 2: Run to see them fail** — `node --test workroom/test/player.test.ts workroom/test/load.test.ts workroom/test/views.test.ts` — FAIL.

- [ ] **Step 3: Add the notation library**: from `websites/www.cs/games`, `npm install --save-exact opensheetmusicdisplay@1`. The build refuses to bundle ANY package that has no license file (`LICENSE`, `LICENCE`, with `.md` or `.txt`), so check `opensheetmusicdisplay` and every package it pulls in:

```bash
node -e '
const { execSync } = require("node:child_process"), fs = require("node:fs");
const dirs = execSync("npm ls --all --omit=dev --parseable opensheetmusicdisplay", { encoding: "utf8" }).split("\n").filter(d => d.includes("node_modules"));
const bad = dirs.filter(d => !fs.readdirSync(d).some(f => /^licen[sc]e(\.(md|txt))?$/i.test(f)));
console.log(bad.length ? "no license file:\n" + bad.join("\n") : "all " + dirs.length + " packages have a license file");
process.exit(bad.length ? 1 : 0);'
```

It must print `all N packages have a license file`. If it lists a package, stop and report the list: the notation library is then swapped for one whose bundled packages all carry a license file, which is a decision for the plan's owner, not something to work around in `build.mjs`.

- [ ] **Step 4: Implement** the modules and components. `tabsFor` returns `['story']`, then `'roll'` when `score.notes.length > 0`, then `'sound'`, then `'sheet'` when `score.kind === 'music'`; `Workroom` renders only those tabs and views, starts at `fitView(score.duration, width)` and passes `layout.ticks` labels to `Timeline`/`PianoRoll` as `<text data-tick>` (the axis is bars for music and milliseconds and seconds for a sound piece, from `axisTicks`). `Workroom` keeps one `time` for all its views and the `<audio>`: a view's `onSeek(t)` sets `audio.currentTime = t`; `timeupdate` and a `requestAnimationFrame` loop while playing set `time`; every view draws a playhead line at `timeToX(view, time)`. The Sound picture `<img>` is positioned with `style={{ left: \`${-view.start * view.pxPerSec}px\`, width: \`${score.duration * view.pxPerSec}px\` }}` (CSSOM, allowed by the CSP). `Sheet` renders `<div id="sheet">` and passes it to `renderSheet`. `renderSheet` parses the MusicXML with `DOMParser`, removes every `<score-part>` and `<part>` whose `id` is not `laneId`, serialises it, and renders it with `new OpenSheetMusicDisplay(el, { autoResize: true, drawTitle: false }).load(xml)` then `.render()`. Styles go in `music/music.css` (never inline `<style>`).

- [ ] **Step 5: Run the tests and build**

Run: `node --test workroom/test/*.test.ts` — PASS; `node _kit/build/build.mjs workroom` (writes `dist/workroom.js`, `dist/sheet.js`, maps, `THIRD_PARTY_LICENSES.txt`); `sh workroom/test.sh` — exit 0; `sh units.sh` — PASS.

- [ ] **Step 6: Commit**

```bash
git add websites/www.cs/games/workroom websites/www.cs/games/package.json websites/www.cs/games/package-lock.json websites/www.cs/music/music.css
git commit -m "Music workroom: views on one playhead (sheet music for music only), glossary cards

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb"
```

### Task 9: The local browser check; open PR 2

**Files:**
- Create: `websites/www.cs/compose.music-local.yaml`, `tests/e2e/local.config.ts`, `tests/e2e/workroom.local.ts`, `games/workroom/tools/make-draft-fixture.ts`, `games/workroom/tools/e2e-bundle.ts`, `games/workroom/test/fixtures/public-key.ts`, `games/workroom/test/fixtures/draft/{score.json,score.musicxml,audio.webm,spectrogram.png}`, `games/workroom/test/fixtures/draft-sound/{score.json,audio.webm,spectrogram.png}`
- Modify: `websites/www.cs/Makefile` (new target `music-e2e`), `music/README.md` (how to run the check)

**Interfaces:**
- Consumes: the merged `compose.admin-local.yaml` (it needs `ADMIN_SMOKE_DIR`; it sets `ADMIN_BASE_URL=http://localhost/admin/`, a local base that lets the admin kit accept plain HTTP, `ADMIN_DATA_DIR=$ADMIN_SMOKE_DIR` and mail capture to `$ADMIN_SMOKE_DIR/mail`, all inside the PHP container), `tests/admin-smoke.sh` (the pattern for waiting on the stack and creating the mail folder), the hub's keys panel (`admin/keys.php`), `Music\Api::publishDraft`.
- Produces: `make music-e2e` (local only; prints `MUSIC-E2E-OK`); `tests/e2e/workroom.local.ts` exports nothing; helpers inside it: `signIn(page, base)`, `createKey(page, base, scopes): Promise<string>`, `publishFixtureDraft(request, base, key, fixture = 'draft')` (`'draft'` is the Crete music piece `test-piece`; `'draft-sound'` is the Tankity sound effect `cannon-fire`, which has no MusicXML).

`compose.music-local.yaml`:

```yaml
# Local docker only (make music-e2e); CI never reads this file. It goes after
# compose.admin-local.yaml, whose local ADMIN_BASE_URL (http://localhost/admin/)
# is what lets the admin kit accept plain HTTP from the check's browser and API
# calls against http://localhost:<port>. MUSIC_PUBLIC_KEYS points the server at
# the test public keys the check seals to.
services:
  www-cs-php:
    environment:
      MUSIC_PUBLIC_KEYS: /var/www/html/games/workroom/test/fixtures/public.json
```

(`games/workroom/test/fixtures/public.json` is written in Task 10; in PR 2 the server simply has no key, which the view-only check never needs. FPM clears the worker environment, so the variable only reaches PHP once Task 15 adds its `env[MUSIC_PUBLIC_KEYS]` line to `docker/php/Dockerfile`.)

`tests/e2e/local.config.ts`:

```ts
// Checks that need a local-only docker override (make music-e2e). The main
// config's testDir is this folder; these files end in .local.ts, which its
// default test match never picks up, and select.ts sees no spec.
import { defineConfig } from '@playwright/test';
import base from './playwright.config.ts';

export default defineConfig({ ...base, testMatch: ['*.local.ts'], projects: base.projects?.slice(0, 1) ?? [] });
```

Makefile target (`test` and `e2e` untouched). It mirrors `tests/admin-smoke.sh`: its own project name, the stack's ephemeral port, a wait until PHP answers (which makes the data folder), then the mail folder, and teardown on exit:

```make
# The workroom's browser check against its own docker project, with the
# admin mail capture. Local only.
music-e2e:
	@name=music-e2e-$$$$; files="-f compose.yaml -f compose.admin-local.yaml -f compose.music-local.yaml"; \
	export ADMIN_SMOKE_DIR=/tmp/$$name; \
	trap 'docker compose $$files -p $$name down -v >/dev/null 2>&1' EXIT; \
	docker compose $$files -p $$name up -d --build www-cs-php www-cs-nginx >/dev/null && \
	addr=$$(docker compose $$files -p $$name port www-cs-nginx 80) && port=$${addr##*:} && \
	ready=0; for i in $$(seq 1 60); do if curl -sf -o /dev/null -H 'Host: localhost' "http://127.0.0.1:$$port/admin/login.php"; then ready=1; break; fi; sleep 1; done; \
	test $$ready = 1 || { echo "music-e2e: the stack did not answer" >&2; exit 1; }; \
	docker compose $$files -p $$name exec -T -u apache www-cs-php mkdir -p $$ADMIN_SMOKE_DIR/mail && \
	bundle=$$(mktemp "$${TMPDIR:-/tmp}/workroom-e2e.XXXXXX") && \
	(cd games && npm ci --silent && node workroom/tools/e2e-bundle.ts "$$bundle") && \
	MUSIC_E2E_COMPOSE="$$files" MUSIC_E2E_PROJECT=$$name MUSIC_E2E_MAIL_DIR=$$ADMIN_SMOKE_DIR/mail \
	E2E_BASE_URL=http://localhost:$$port/ WORKROOM_E2E_BUNDLE=$$bundle tests/e2e/run.sh -c local.config.ts && \
	rm -f "$$bundle" && echo MUSIC-E2E-OK
```

`games/workroom/tools/e2e-bundle.ts` (not deployed: `tools/`; not in a tsc program; Node strips its types):

```ts
// Builds the workroom page with the test key built in, for the local browser
// check only (make music-e2e): every import of public-key.ts resolves to the
// test fixture. The shipped dist/ is never built this way.
// Usage, from websites/www.cs/games: node workroom/tools/e2e-bundle.ts <out.js>
import * as esbuild from 'esbuild';
import { join } from 'node:path';

const out = process.argv[2];
if (!out) {
  console.error('usage: node workroom/tools/e2e-bundle.ts <out.js>');
  process.exit(1);
}
const root = join(import.meta.dirname, '..');
const fixture = join(root, 'test', 'fixtures', 'public-key.ts');
await esbuild.build({
  absWorkingDir: root, entryPoints: ['src/main.ts'], outfile: out, bundle: true, format: 'esm',
  platform: 'browser', target: 'es2022', jsx: 'automatic', jsxImportSource: 'preact', logLevel: 'warning',
  plugins: [{ name: 'test-key', setup(b) { b.onResolve({ filter: /\/public-key\.ts$/ }, () => ({ path: fixture })); } }],
});
```

and `games/workroom/test/fixtures/public-key.ts`, which Task 10 fills with the test key (until then the page has no key, and nothing imports it):

```ts
// The test key pair's public half, built into the page only by tools/e2e-bundle.ts.
export const PUBLIC_KEY = null;
export const PREVIOUS_KEYS = [];
```

- [ ] **Step 1: Make the draft fixtures.** `tools/make-draft-fixture.ts` also copies `test/fixtures/score-sound-v1.json` to `test/fixtures/draft-sound/score.json` (a sound draft has no `score.musicxml`). It copies `test/fixtures/score-v1.json` to `test/fixtures/draft/score.json` and writes `score.musicxml`: a `score-partwise` with one `<score-part id="strings-low">` and one `<score-part id="brass">`, eight 4/4 measures each, one whole note per measure at that lane's note pitch (or a whole rest), with `<divisions>1</divisions>`. Run it: `node workroom/tools/make-draft-fixture.ts`. Make the audio and picture (16 s, as the score says):

```bash
cd websites/www.cs/games/workroom/test/fixtures/draft
ffmpeg -loglevel error -f lavfi -i "sine=frequency=220:duration=16" -c:a libopus -b:a 24k audio.webm
ffmpeg -loglevel error -i audio.webm -lavfi showspectrumpic=s=800x200:legend=0 spectrogram.png
cd ../draft-sound
ffmpeg -loglevel error -f lavfi -i "sine=frequency=110:duration=0.4" -c:a libopus -b:a 24k audio.webm
ffmpeg -loglevel error -i audio.webm -lavfi showspectrumpic=s=800x200:legend=0 spectrogram.png
```

The sound fixture's audio is 0.4 s, as `score-sound-v1.json` says.

- [ ] **Step 2: Write the check** (`tests/e2e/workroom.local.ts`):

```ts
// The workroom in a real browser against local docker (make music-e2e): sign in
// through the captured mail, publish a draft with an API key made on the hub,
// open the piece, play, move the playhead, switch views, open a glossary card,
// and never trip the content security policy; then a sound effect from another
// project: two projects on the list, a seconds axis, no sheet music.
import { expect, test, type APIRequestContext, type Browser, type BrowserContext, type Page } from '@playwright/test';
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const SITE = join(import.meta.dirname, '..', '..');
const FIXTURE_DRAFTS = {
  draft: { dir: join(SITE, 'games', 'workroom', 'test', 'fixtures', 'draft'), piece: 'test-piece' },
  'draft-sound': { dir: join(SITE, 'games', 'workroom', 'test', 'fixtures', 'draft-sound'), piece: 'cannon-fire' },
} as const;

// The tests share one browser worker and one sign-in: the admin sign-in link is limited to three a hour per address,
// so a run makes two link requests at most (this shared session, and the second device in the second test).
test.describe.configure({ mode: 'serial' });

// The admin mail is captured inside the PHP container (compose.admin-local.yaml), as in tests/admin-smoke.sh.
function inPhp(command: string): string {
  const compose = (process.env.MUSIC_E2E_COMPOSE ?? '').split(' ').filter(Boolean);
  const run = spawnSync('docker', ['compose', ...compose, '-p', process.env.MUSIC_E2E_PROJECT!, 'exec', '-T', 'www-cs-php', 'sh', '-c', command], { encoding: 'utf8', cwd: SITE });
  if (run.error || run.signal) throw new Error(`docker compose exec failed: ${run.error?.message ?? run.signal}`);
  return run.stdout;
}
const mailFiles = (): string[] => inPhp(`ls ${process.env.MUSIC_E2E_MAIL_DIR}/*.eml 2>/dev/null`).split('\n').filter(Boolean);

export async function signIn(page: Page, base: string): Promise<void> {
  const known = new Set(mailFiles());
  await page.goto(`${base}admin/login.php`);
  await page.getByLabel('Email').fill('wgrim@siue.edu');
  await page.getByRole('button', { name: 'Email me a link' }).click();
  let token = '';
  await expect.poll(() => {
    const fresh = mailFiles().filter(f => !known.has(f));
    for (const f of fresh) {
      // The mail is quoted-printable: undo its soft line breaks and =XX escapes before reading the link.
      const text = inPhp(`cat ${f}`).replace(/=\r?\n/g, '').replace(/=([0-9A-F]{2})/g, (_m, h: string) => String.fromCharCode(parseInt(h, 16)));
      const m = text.match(/verify\.php\?token=([0-9a-f]{64})/);
      if (m) { token = m[1]!; break; }
    }
    return token;
  }, { timeout: 20_000 }).not.toBe('');
  await page.goto(`${base}admin/verify.php?token=${token}`); // the mailed link names http://localhost/ with no port
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/admin\/(index\.php)?$/);
}

export async function createKey(page: Page, base: string, label: string, scopes: string[]): Promise<string> {
  await page.goto(`${base}admin/keys.php`);
  await page.getByLabel('Label').fill(label);
  for (const s of scopes) await page.getByLabel(s).check();
  await page.getByRole('button', { name: 'Create key' }).click();
  return (await page.locator('code.secret').textContent())!.trim();
}

type Session = Awaited<ReturnType<BrowserContext['storageState']>>;
let session: Session | undefined;

/** A fresh browser context signed in as the owner. The first call signs in and keeps the session; later calls reuse it. */
export async function signedInPage(browser: Browser, base: string): Promise<{ context: BrowserContext; page: Page }> {
  if (!session) {
    const first = await browser.newContext();
    await signIn(await first.newPage(), base);
    session = await first.storageState();
    await first.close();
  }
  const context = await browser.newContext({ storageState: session });
  return { context, page: await context.newPage() };
}

/** The SIUED1 bundle (Formats): "SIUED1", a file count, then per file a name length, the name, a uint32 size and the bytes. */
function draftBundle(files: Record<string, Buffer>): Buffer {
  const parts: Buffer[] = [Buffer.from('SIUED1'), Buffer.from([Object.keys(files).length])];
  for (const [name, bytes] of Object.entries(files)) {
    const size = Buffer.alloc(4);
    size.writeUInt32BE(bytes.length);
    parts.push(Buffer.from([name.length]), Buffer.from(name), size, bytes);
  }
  return Buffer.concat(parts);
}

export async function publishFixtureDraft(request: APIRequestContext, base: string, key: string, fixture: keyof typeof FIXTURE_DRAFTS = 'draft'): Promise<void> {
  const { dir, piece } = FIXTURE_DRAFTS[fixture];
  // A music draft carries score.musicxml; a sound draft does not.
  const files = Object.fromEntries(['score.json', 'score.musicxml', 'audio.webm', 'spectrogram.png'].filter(name => existsSync(join(dir, name))).map(name => [name, readFileSync(join(dir, name))]));
  const res = await request.post(`${base}music/api/drafts.php?piece=${piece}&version=1`, {
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/octet-stream' },
    data: draftBundle(files),
  });
  expect([201, 409]).toContain(res.status());
}

test('open a piece, play, seek, switch views, read a term, no CSP violations', async ({ browser, request, baseURL }) => {
  const base = baseURL!;
  const { context, page } = await signedInPage(browser, base);
  const bundle = process.env.WORKROOM_E2E_BUNDLE;
  if (bundle) await page.route('**/games/workroom/dist/workroom.js*', r => r.fulfill({ contentType: 'text/javascript', body: readFileSync(bundle, 'utf8') }));
  const violations: string[] = [];
  page.on('console', m => { if (/Content Security Policy/i.test(m.text())) violations.push(m.text()); });
  await publishFixtureDraft(request, base, await createKey(page, base, 'e2e publish', ['drafts:publish']));

  await page.goto(`${base}music/`);
  await page.getByRole('link', { name: /Test piece: the Labyrinth wakes/ }).click();
  await expect(page.locator('[data-section="stirs"]')).toBeVisible();
  await expect(page.locator('[data-motif="ariadne"]')).toBeVisible();

  await page.getByRole('button', { name: 'Play' }).click();
  await expect.poll(() => page.locator('audio').evaluate(a => (a as HTMLAudioElement).currentTime)).toBeGreaterThan(0.2);
  await page.getByRole('button', { name: 'Pause' }).click();

  const tl = page.locator('[data-timeline]');
  const box = (await tl.boundingBox())!;
  await tl.click({ position: { x: box.width * 0.75, y: 120 } });
  await expect.poll(() => page.locator('audio').evaluate(a => Math.round((a as HTMLAudioElement).currentTime))).toBe(12);

  await page.getByRole('button', { name: 'ostinato' }).first().click();
  await expect(page.getByText('A short pattern repeated over and over underneath the music.')).toBeVisible();
  await page.getByRole('button', { name: 'Hear it' }).click();

  for (const tab of ['Piano roll', 'Sound picture', 'Sheet music', 'Story']) await page.getByRole('button', { name: tab }).click();
  await page.getByRole('button', { name: 'Sheet music' }).click();
  await expect(page.locator('#sheet svg')).toBeVisible({ timeout: 15_000 });

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator('[data-timeline]')).toBeVisible();
  expect(violations).toEqual([]);
  await context.close();
});

test('a sound effect from another project: grouped list, seconds on the axis, no sheet music', async ({ browser, request, baseURL }) => {
  const base = baseURL!;
  const { context, page } = await signedInPage(browser, base);
  const bundle = process.env.WORKROOM_E2E_BUNDLE;
  if (bundle) await page.route('**/games/workroom/dist/workroom.js*', r => r.fulfill({ contentType: 'text/javascript', body: readFileSync(bundle, 'utf8') }));
  const violations: string[] = [];
  page.on('console', m => { if (/Content Security Policy/i.test(m.text())) violations.push(m.text()); });
  const key = await createKey(page, base, 'e2e publish sound', ['drafts:publish']);
  await publishFixtureDraft(request, base, key); // Crete, music
  await publishFixtureDraft(request, base, key, 'draft-sound'); // Tankity, sound: published last, so its project is listed first

  await page.goto(`${base}music/`);
  await expect(page.locator('h2.project')).toHaveText(['Tankity', 'Crete']);
  await page.getByRole('link', { name: 'Cannon fire' }).click();
  await expect(page.locator('[data-lane="boom"]')).toBeVisible();
  await expect(page.locator('[data-lane="air"]')).toBeVisible();
  await expect(page.locator('[data-section="blast"]')).toBeVisible();
  await expect(page.locator('[data-tick]').nth(1)).toHaveText('50 ms');
  await expect(page.getByRole('button', { name: 'Sheet music' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Piano roll' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Sound picture' }).click();
  await expect(page.locator('img[data-spectrogram]')).toBeVisible();
  await page.getByRole('button', { name: 'Play' }).click();
  await expect.poll(() => page.locator('audio').evaluate(a => (a as HTMLAudioElement).currentTime)).toBeGreaterThan(0.05);
  expect(violations).toEqual([]);
  await context.close();
});
```

The labels the check uses (`Email`, `Email me a link`, `Sign in`, `Label`, one checkbox per scope labelled with the scope, `Create key`, and the new key in `code.secret`) are the admin pages' own, as `Admin\Pages` renders them.

- [ ] **Step 3: Run it** — `make music-e2e`. Expected: both tests pass and `MUSIC-E2E-OK` prints; `docker compose ls` shows no `music-e2e-*` project afterwards.

- [ ] **Step 4: Gates** — from `websites/www.cs`: `vendor/bin/phpunit --testsuite site`; `(cd games && npm ci --silent && npm run --silent check)`; `sh games/units.sh`; `cd tests/e2e && npm ci --silent && node_modules/.bin/tsc -p tsconfig.json` (the new `.local.ts` type-checks); `node tests/e2e/select.ts --check` prints `E2E-SELECT-OK`.

- [ ] **Step 5: Commit and open PR 2**

```bash
git add websites/www.cs/compose.music-local.yaml websites/www.cs/tests/e2e/local.config.ts websites/www.cs/tests/e2e/workroom.local.ts websites/www.cs/games/workroom websites/www.cs/Makefile websites/www.cs/music/README.md
git commit -m "Music workroom: local browser check for the views, music and sound

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb"
```

Open the PR (foundry `pr-fix-loop`): "Music workroom: the page, its views and the glossary"; body: summary, spec and plan paths, `make music-e2e` result, after-deploy check (sign in, open `/music/`, no pieces until the first `make music-publish`), attribution lines.

---

# PR 3: the answering tools and the owner's key tool (branch `music/answering`)

Start from `main` after PR 2 merged.

### Task 10: Sealing and unlocking the keyring (TypeScript)

**Files:**
- Create: `games/workroom/src/note.ts`, `src/seal.ts`, `src/unlock.ts`, `src/vault.ts`, `src/public-key.ts`, `src/tsconfig.crypto.json`
- Create: `games/workroom/tools/make-fixtures.ts`, `test/fixtures/test-key.json`, `test/fixtures/public.json`, `test/fixtures/note-text.sealed`, `test/fixtures/note-hum.sealed`
- Create: `games/workroom/test/seal.test.ts`, `test/unlock.test.ts`, `test/vault.test.ts`, `test/no-storage.test.ts`, `test/public-key.test.ts`, `test/fixture-key.ts`
- Modify: `games/workroom/test/fixtures/public-key.ts` (the test key), `tsconfig.json` (`note.ts`), `build.json` (the `src/tsconfig.crypto.json` program)

**Interfaces:**
- Consumes: nothing from earlier tasks but the folder.
- Produces:

```ts
// src/note.ts
export const NOTE_KINDS = ['text', 'speech', 'hum', 'react', 'energy'] as const;
export type NoteKind = (typeof NOTE_KINDS)[number];
export const REACTION_IDS = ['more-epic', 'calmer', 'darker', 'brighter', 'longer', 'shorter', 'love-it', 'not-this'] as const;
export type Reaction = (typeof REACTION_IDS)[number];
export interface NoteBody {
  v: 1; kind: NoteKind; piece: string; draft: number; from: number; to: number; // seconds
  fromBar: number | null; toBar: number | null;                                  // bars on a music piece; null on a sound piece (seconds only)
  lane: string | null; text: string | null; reaction: Reaction | null; curve: [number, number][] | null;
  audio: { mime: string; seconds: number } | null; made: string;
}

// src/seal.ts
export const MAGIC = 'SIUEN1';
export interface BuiltInKey { fingerprint: string; spki: string } // spki: base64 DER
export class FingerprintMismatch extends Error {}
export class NoteUnreadable extends Error {
  readonly reason: 'format' | 'unknown-key' | 'tampered'; // a declared field: erasableSyntaxOnly forbids parameter properties
  constructor(reason: 'format' | 'unknown-key' | 'tampered');
}
export function fingerprintOf(spkiDer: Uint8Array<ArrayBuffer>): Promise<string>;
export function headerFingerprint(bundle: Uint8Array): string | null;
/** Checks the built-in fingerprint first; throws FingerprintMismatch and seals nothing when it differs. */
export function seal(body: NoteBody, audio: Uint8Array<ArrayBuffer> | null, key: BuiltInKey): Promise<Uint8Array<ArrayBuffer>>;
export interface Opened { fingerprint: string; body: NoteBody; audio: Uint8Array<ArrayBuffer> | null }
/** Picks the key the bundle's header names out of the keyring. */
export function open(bundle: Uint8Array<ArrayBuffer>, keyring: ReadonlyMap<string, CryptoKey>): Promise<Opened>;

// src/unlock.ts
export const ITERATIONS = 600_000;
export const KEYRING_AAD = 'siue-music-keyring-v1';
export interface LockedKeyring { v: 1; kdf: 'PBKDF2-SHA-256'; iterations: number; salt: string; iv: string; ct: string }
export class WrongPassphrase extends Error {}
export class KeyringInvalid extends Error {}
export function normalizePassphrase(p: string): Uint8Array<ArrayBuffer>; // NFC, trimmed, UTF-8
/**
 * Unlocks the whole keyring. `known` lists the public keys built into the page, the current one first. Every entry
 * whose fingerprint is in `known` becomes a non-extractable RSA-OAEP SHA-256 private key (usages ['decrypt']) proven
 * to pair with that public key; entries the page has no public key for are skipped. The result is in keyring order.
 * KeyringInvalid when the envelope is weak or malformed, the plaintext is malformed or repeats a fingerprint, the
 * keyring lacks known[0] (the current key), or an entry does not pair with its public key; WrongPassphrase when
 * the passphrase does not decrypt it.
 */
export function unlockKeyring(locked: LockedKeyring, passphrase: string, known: readonly BuiltInKey[]): Promise<Map<string, CryptoKey>>;
/** The format Python's lock_keyring writes (current key first); the page never locks, tests and fixtures do. */
export function lockKeyring(keys: readonly { fingerprint: string; pkcs8: Uint8Array<ArrayBuffer> }[], passphrase: string): Promise<LockedKeyring>;

// src/vault.ts: unlocked keys, in memory only
export interface Vault {
  keyring(): ReadonlyMap<string, CryptoKey>;
  has(fp: string): boolean;
  /** The fingerprints in fps with no key (a note sealed to a key the keyring does not hold). */
  missing(fps: readonly string[]): string[];
  /** Replaces the keyring with the unlocked keys. Throws on an extractable key. Nothing is stored anywhere. */
  load(keys: ReadonlyMap<string, CryptoKey>): void;
  /** Empties the keyring. */
  clear(): void;
}
export function createVault(): Vault;

// src/public-key.ts (written by `siue-music keys init|rotate`)
export const PUBLIC_KEY: BuiltInKey | null;
export const PREVIOUS_KEYS: readonly BuiltInKey[];
```

Every byte buffer these functions hand to `crypto.subtle` is a `Uint8Array<ArrayBuffer>` (see Global Constraints): a bare `Uint8Array` is `Uint8Array<ArrayBufferLike>` under TypeScript 7 and `importKey`, `encrypt`, `decrypt`, `deriveKey` and `digest` reject it. `headerFingerprint(bundle: Uint8Array)` only reads, so it takes any `Uint8Array`.

`src/tsconfig.crypto.json`, created in this task and added to `build.json`'s `programs` (`"programs": ["tsconfig.json", "src/tsconfig.dom.json", "src/tsconfig.crypto.json", "tsconfig.test.json"]`):

```jsonc
{
  // Web Crypto modules: they use crypto, CryptoKey and TextEncoder, which the DOM-free program's lib does not have. See games/_kit/README.md.
  "extends": "../tsconfig.json",
  "compilerOptions": { "lib": ["ES2022", "DOM"] },
  "files": ["seal.ts", "unlock.ts", "vault.ts", "public-key.ts"]
}
```

Task 14 appends `api.ts`, `outbox.ts` and `history.ts`. `note.ts` has no Web Crypto and goes in `tsconfig.json`'s `files`.

`test/fixture-key.ts` (shared by the tests):

```ts
// The committed TEST key pairs (tools/make-fixtures.ts): used by nothing but tests.
// `fx` is the current key; `fx.other` is an earlier key a rotation retained. Both are in fx.keyring.
import { readFileSync } from 'node:fs';
import type { LockedKeyring } from '../src/unlock.ts';
import type { BuiltInKey } from '../src/seal.ts';

export interface TestKey { label: string; fingerprint: string; spki: string; pkcs8: string; passphrase: string; keyring: LockedKeyring; other: { fingerprint: string; spki: string; pkcs8: string } }
export const fx = JSON.parse(readFileSync(new URL('./fixtures/test-key.json', import.meta.url), 'utf8')) as TestKey;
export const builtIn: BuiltInKey = { fingerprint: fx.fingerprint, spki: fx.spki };
export const otherKey: BuiltInKey = { fingerprint: fx.other.fingerprint, spki: fx.other.spki };
export const b64 = (s: string): Uint8Array<ArrayBuffer> => Uint8Array.from(Buffer.from(s, 'base64'));
export const hex = (s: string): Uint8Array<ArrayBuffer> => Uint8Array.from(Buffer.from(s, 'hex'));
export const importPrivate = (pkcs8: string): Promise<CryptoKey> =>
  crypto.subtle.importKey('pkcs8', b64(pkcs8), { name: 'RSA-OAEP', hash: 'SHA-256' }, false, ['decrypt']);
```

- [ ] **Step 1: Write the failing tests**

`test/seal.test.ts`:

```ts
// Sealing: a round trip gives back the note and its audio; the words never
// appear in the bundle; a public key whose fingerprint differs from the
// built-in one is refused; tampering fails with a reason, never a crash.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { FingerprintMismatch, NoteUnreadable, fingerprintOf, headerFingerprint, open, seal } from '../src/seal.ts';
import type { NoteBody } from '../src/note.ts';
import { b64, builtIn, fx, hex, importPrivate } from './fixture-key.ts';

const body: NoteBody = {
  v: 1, kind: 'text', piece: 'test-piece', draft: 1, from: 8, to: 12, fromBar: 5, toBar: 6, lane: 'brass',
  text: 'louder and slower right here', reaction: null, curve: null, audio: null, made: '2026-10-20T14:03:11.000Z',
};
const isReason = (r: NoteUnreadable['reason']) => (e: unknown) => e instanceof NoteUnreadable && e.reason === r;

test('the fingerprint is the SHA-256 of the SPKI DER', async () => {
  assert.equal(await fingerprintOf(b64(fx.spki)), fx.fingerprint);
});

test('seal then open gives back the note and its audio', async () => {
  const audio = new Uint8Array([1, 2, 3, 4, 5]);
  const bundle = await seal({ ...body, kind: 'hum', audio: { mime: 'audio/webm', seconds: 1 } }, audio, builtIn);
  assert.equal(new TextDecoder().decode(bundle.slice(0, 6)), 'SIUEN1');
  assert.equal(headerFingerprint(bundle), fx.fingerprint);
  assert.equal((bundle[38]! << 8) | bundle[39]!, 512, 'RSA-4096 wraps to 512 bytes');
  const opened = await open(bundle, new Map([[fx.fingerprint, await importPrivate(fx.pkcs8)]]));
  assert.equal(opened.fingerprint, fx.fingerprint);
  assert.deepEqual(opened.body, { ...body, kind: 'hum', audio: { mime: 'audio/webm', seconds: 1 } });
  assert.deepEqual([...(opened.audio ?? [])], [1, 2, 3, 4, 5]);
});

test('a note on a sound effect carries seconds only', async () => {
  const sound: NoteBody = { ...body, piece: 'cannon-fire', from: 0.02, to: 0.2, fromBar: null, toBar: null, lane: 'boom', text: 'a sharper attack' };
  const opened = await open(await seal(sound, null, builtIn), new Map([[fx.fingerprint, await importPrivate(fx.pkcs8)]]));
  assert.deepEqual(opened.body, sound);
  assert.deepEqual([opened.body.fromBar, opened.body.toBar], [null, null]);
});

test('the words are not in the bundle, and two seals differ', async () => {
  const a = await seal(body, null, builtIn);
  const b = await seal(body, null, builtIn);
  assert.ok(!Buffer.from(a).includes(Buffer.from('louder')));
  assert.notDeepEqual(a, b);
});

test('a public key whose fingerprint differs from the built-in one is refused', async () => {
  await assert.rejects(seal(body, null, { fingerprint: fx.fingerprint, spki: fx.other.spki }), FingerprintMismatch);
});

test('open picks the key the header names out of a keyring of several', async () => {
  const keyring = new Map([[fx.fingerprint, await importPrivate(fx.pkcs8)], [fx.other.fingerprint, await importPrivate(fx.other.pkcs8)]]);
  const toOther = await seal(body, null, { fingerprint: fx.other.fingerprint, spki: fx.other.spki });
  assert.equal(headerFingerprint(toOther), fx.other.fingerprint);
  assert.equal((await open(toOther, keyring)).body.text, body.text);
});

test('tampering fails with a reason', async () => {
  const keyring = new Map([[fx.fingerprint, await importPrivate(fx.pkcs8)], [fx.other.fingerprint, await importPrivate(fx.other.pkcs8)]]);
  const bundle = await seal(body, null, builtIn);
  const flipped = bundle.slice();
  flipped[flipped.length - 1] = flipped[flipped.length - 1]! ^ 1;
  await assert.rejects(open(flipped, keyring), isReason('tampered'));
  const reheaded = bundle.slice();
  reheaded.set(hex(fx.other.fingerprint), 6);
  await assert.rejects(open(reheaded, keyring), isReason('tampered'));
  await assert.rejects(open(bundle.slice(0, 30), keyring), isReason('format'));
  await assert.rejects(open(new Uint8Array(0), keyring), isReason('format'));
  await assert.rejects(open(bundle, new Map()), isReason('unknown-key'));
});

test('the committed fixture notes still open (the format is stable)', async () => {
  const keyring = new Map([[fx.fingerprint, await importPrivate(fx.pkcs8)]]);
  const text = await open(new Uint8Array(readFileSync(new URL('./fixtures/note-text.sealed', import.meta.url))), keyring);
  assert.equal(text.body.text, 'Fixture note: louder at bar 33');
  const hum = await open(new Uint8Array(readFileSync(new URL('./fixtures/note-hum.sealed', import.meta.url))), keyring);
  assert.equal(hum.body.kind, 'hum');
  assert.equal(hum.audio?.length, 2048);
});
```

`test/unlock.test.ts`:

```ts
// Unlocking the keyring: the right passphrase gives non-extractable keys, each
// proven to pair with its built-in public key; a wrong one fails cleanly; a
// weak, malformed, swapped or incomplete keyring is refused.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { KeyringInvalid, WrongPassphrase, lockKeyring, unlockKeyring } from '../src/unlock.ts';
import { open, seal } from '../src/seal.ts';
import { b64, builtIn, fx, otherKey } from './fixture-key.ts';

const note = { v: 1 as const, kind: 'text' as const, piece: 'p', draft: 1, from: 0, to: 1, fromBar: 1, toBar: 1, lane: null, text: 'hi', reaction: null, curve: null, audio: null, made: '2026-10-20T00:00:00.000Z' };

test('the right passphrase unlocks every known key, non-extractable, in keyring order', async () => {
  const ring = await unlockKeyring(fx.keyring, fx.passphrase, [builtIn, otherKey]);
  assert.deepEqual([...ring.keys()], [fx.fingerprint, fx.other.fingerprint]);
  for (const key of ring.values()) {
    assert.equal(key.extractable, false);
    assert.deepEqual(key.usages, ['decrypt']);
    await assert.rejects(crypto.subtle.exportKey('pkcs8', key));
  }
  assert.equal((await open(await seal(note, null, builtIn), ring)).body.text, 'hi');
  assert.equal((await open(await seal(note, null, otherKey), ring)).body.text, 'hi');
});

test('a wrong passphrase fails cleanly', async () => {
  await assert.rejects(unlockKeyring(fx.keyring, 'not the passphrase', [builtIn, otherKey]), WrongPassphrase);
  await assert.rejects(unlockKeyring(fx.keyring, '', [builtIn, otherKey]), WrongPassphrase);
});

test('spaces around it and the Unicode form do not matter', async () => {
  // The fixture passphrase ends in "café" with a composed é; type it decomposed with a newline.
  const typed = `  ${fx.passphrase.normalize('NFD')}\n`;
  assert.notEqual(typed.trim(), fx.passphrase);
  assert.equal((await unlockKeyring(fx.keyring, typed, [builtIn])).size, 1);
});

test('keys the page has no public key for are skipped', async () => {
  const ring = await unlockKeyring(fx.keyring, fx.passphrase, [builtIn]);
  assert.deepEqual([...ring.keys()], [fx.fingerprint]);
});

test('a weak or malformed keyring is refused before any key is derived', async () => {
  for (const bad of [{ iterations: 1000 }, { v: 2 }, { kdf: 'scrypt' }, { salt: 'AAAA' }, { iv: 'AAAA' }, { ct: '' }]) {
    await assert.rejects(unlockKeyring({ ...fx.keyring, ...bad } as typeof fx.keyring, fx.passphrase, [builtIn]), KeyringInvalid, JSON.stringify(bad));
  }
});

test('a keyring without the current key, or with a key that does not pair, is refused', async () => {
  const onlyOld = await lockKeyring([{ fingerprint: fx.other.fingerprint, pkcs8: b64(fx.other.pkcs8) }], fx.passphrase);
  await assert.rejects(unlockKeyring(onlyOld, fx.passphrase, [builtIn, otherKey]), KeyringInvalid, 'the current key is missing');
  await assert.rejects(unlockKeyring(fx.keyring, fx.passphrase, []), KeyringInvalid, 'the page has no key at all');
  const swapped = await lockKeyring([{ fingerprint: fx.fingerprint, pkcs8: b64(fx.other.pkcs8) }], fx.passphrase);
  await assert.rejects(unlockKeyring(swapped, fx.passphrase, [builtIn]), KeyringInvalid, 'unlocks, but to a key that does not pair with the public key');
  const twice = await lockKeyring([{ fingerprint: fx.fingerprint, pkcs8: b64(fx.pkcs8) }, { fingerprint: fx.fingerprint, pkcs8: b64(fx.pkcs8) }], fx.passphrase);
  await assert.rejects(unlockKeyring(twice, fx.passphrase, [builtIn]), KeyringInvalid, 'a fingerprint twice');
});
```

`test/vault.test.ts`:

```ts
// The vault holds unlocked keys in memory only and refuses extractable ones.
// A device that signs in after a rotation unlocks the one keyring and opens
// notes sealed to the old key and to the new one.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createVault } from '../src/vault.ts';
import { unlockKeyring } from '../src/unlock.ts';
import { open, seal } from '../src/seal.ts';
import type { NoteBody } from '../src/note.ts';
import { builtIn, fx, otherKey } from './fixture-key.ts';

const note = (text: string): NoteBody => ({ v: 1, kind: 'text', piece: 'p', draft: 1, from: 0, to: 1, fromBar: 1, toBar: 1, lane: null, text, reaction: null, curve: null, audio: null, made: '2026-10-20T00:00:00.000Z' });

test('load replaces the keyring and clear empties it', async () => {
  const v = createVault();
  assert.equal(v.keyring().size, 0);
  v.load(await unlockKeyring(fx.keyring, fx.passphrase, [builtIn, otherKey]));
  assert.ok(v.has(fx.fingerprint) && v.has(fx.other.fingerprint));
  v.load(await unlockKeyring(fx.keyring, fx.passphrase, [builtIn]));
  assert.ok(v.has(fx.fingerprint) && !v.has(fx.other.fingerprint), 'a load replaces what was there');
  v.clear();
  assert.equal(v.keyring().size, 0);
});

test('an extractable key is refused', async () => {
  const pair = await crypto.subtle.generateKey({ name: 'RSA-OAEP', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' }, true, ['encrypt', 'decrypt']);
  assert.throws(() => createVault().load(new Map([['ff'.repeat(32), pair.privateKey]])));
});

test('after a rotation a newly signed-in device opens notes sealed before and after it', async () => {
  // fx is the current key; fx.other is the earlier key the rotation retained; both are in the one keyring.
  const sealedBefore = await seal(note('sealed before the rotation'), null, otherKey);
  const sealedAfter = await seal(note('sealed after the rotation'), null, builtIn);
  const device = createVault(); // a phone that has never held a key
  assert.deepEqual(device.missing([otherKey.fingerprint, fx.fingerprint]), [otherKey.fingerprint, fx.fingerprint]);
  device.load(await unlockKeyring(fx.keyring, fx.passphrase, [builtIn, otherKey]));
  assert.deepEqual(device.missing([otherKey.fingerprint, fx.fingerprint]), []);
  assert.equal((await open(sealedBefore, device.keyring())).body.text, 'sealed before the rotation');
  assert.equal((await open(sealedAfter, device.keyring())).body.text, 'sealed after the rotation');
});
```

`test/no-storage.test.ts`:

```ts
// Nothing of any key is ever written to browser storage: unlocking, loading
// the vault, sealing and opening touch no IndexedDB, localStorage,
// sessionStorage, cookie or Cache API, and the key modules do not even name them.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createVault } from '../src/vault.ts';
import { unlockKeyring } from '../src/unlock.ts';
import { open, seal } from '../src/seal.ts';
import { builtIn, fx, otherKey } from './fixture-key.ts';

const touched: string[] = [];
const trap = (name: string) => new Proxy({}, {
  get: (_t, p) => { touched.push(`${name}.${String(p)}`); return () => undefined; },
  set: (_t, p) => { touched.push(`${name}.${String(p)}=`); return true; },
});
for (const name of ['indexedDB', 'localStorage', 'sessionStorage', 'caches']) {
  Object.defineProperty(globalThis, name, { value: trap(name), configurable: true });
}
Object.defineProperty(globalThis, 'document', {
  configurable: true,
  value: { get cookie() { touched.push('document.cookie'); return ''; }, set cookie(_v: string) { touched.push('document.cookie='); } },
});

test('unlocking, using and clearing the vault touch no browser storage', async () => {
  const vault = createVault();
  vault.load(await unlockKeyring(fx.keyring, fx.passphrase, [builtIn, otherKey]));
  const sealed = await seal({ v: 1, kind: 'text', piece: 'p', draft: 1, from: 0, to: 1, fromBar: 1, toBar: 1, lane: null, text: 'hi', reaction: null, curve: null, audio: null, made: '2026-10-20T00:00:00.000Z' }, null, builtIn);
  assert.equal((await open(sealed, vault.keyring())).body.text, 'hi');
  vault.clear();
  assert.deepEqual(touched, []);
});

test('the modules that handle keys never name a browser store', () => {
  for (const file of ['note', 'seal', 'unlock', 'vault', 'public-key']) {
    const source = readFileSync(new URL(`../src/${file}.ts`, import.meta.url), 'utf8');
    assert.doesNotMatch(source, /indexedDB|localStorage|sessionStorage|document\.cookie|\bcaches\b/, `${file}.ts`);
  }
});
```

`test/public-key.test.ts`:

```ts
// The key built into the page is the repository's current public key
// (music/keys/public.json), and its fingerprint matches its bytes.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { PREVIOUS_KEYS, PUBLIC_KEY } from '../src/public-key.ts';
import { fingerprintOf } from '../src/seal.ts';
import { b64 } from './fixture-key.ts';

const FILE = join(import.meta.dirname, '..', '..', '..', 'music', 'keys', 'public.json');

test('public-key.ts and music/keys/public.json agree', async () => {
  if (!existsSync(FILE)) {
    assert.equal(PUBLIC_KEY, null, 'no key in the repository, none in the page');
    assert.deepEqual(PREVIOUS_KEYS, []);
    return;
  }
  const repo = JSON.parse(readFileSync(FILE, 'utf8')) as { current: { fingerprint: string; spki: string }; previous: { fingerprint: string; spki: string }[] };
  assert.deepEqual(PUBLIC_KEY, repo.current);
  assert.deepEqual(PREVIOUS_KEYS, repo.previous);
  for (const k of [repo.current, ...repo.previous]) assert.equal(await fingerprintOf(b64(k.spki)), k.fingerprint);
});
```

- [ ] **Step 2: Write the fixture maker** (`tools/make-fixtures.ts`), run with `node workroom/tools/make-fixtures.ts` from `games/` once the modules exist (Step 4):

```ts
// Writes the TEST key pairs and fixtures the unit tests, the Python tests and
// the local browser check share: a current key and an earlier one a rotation
// retained, both locked in one keyring. Rerun only to replace the test keys;
// the committed files are what every test reads.
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fingerprintOf, seal } from '../src/seal.ts';
import { lockKeyring } from '../src/unlock.ts';

const dir = join(import.meta.dirname, '..', 'test', 'fixtures');
const b64 = (u: ArrayBuffer | Uint8Array) => Buffer.from(u instanceof Uint8Array ? u : new Uint8Array(u)).toString('base64');
async function pair() {
  const k = await crypto.subtle.generateKey({ name: 'RSA-OAEP', modulusLength: 4096, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' }, true, ['encrypt', 'decrypt']);
  const spki = new Uint8Array(await crypto.subtle.exportKey('spki', k.publicKey));
  const pkcs8 = new Uint8Array(await crypto.subtle.exportKey('pkcs8', k.privateKey));
  return { fingerprint: await fingerprintOf(spki), spki: b64(spki), pkcs8: b64(pkcs8), raw: pkcs8 };
}
const main = await pair();
const other = await pair();
const passphrase = 'test passphrase for the workroom fixtures, café';
const fixture = {
  label: 'TEST KEYS: used by nothing but tests. Never a real notes key.',
  fingerprint: main.fingerprint, spki: main.spki, pkcs8: main.pkcs8, passphrase,
  keyring: await lockKeyring([{ fingerprint: main.fingerprint, pkcs8: main.raw }, { fingerprint: other.fingerprint, pkcs8: other.raw }], passphrase),
  other: { fingerprint: other.fingerprint, spki: other.spki, pkcs8: other.pkcs8 },
};
writeFileSync(join(dir, 'test-key.json'), JSON.stringify(fixture, null, 2) + '\n');
const publicOf = (k: { fingerprint: string; spki: string }) => ({ fingerprint: k.fingerprint, spki: k.spki });
writeFileSync(join(dir, 'public.json'), JSON.stringify({ schema: 1, current: publicOf(main), previous: [publicOf(other)] }, null, 2) + '\n');
writeFileSync(join(dir, 'public-key.ts'), `// The test keys' public halves, built into the page only by tools/e2e-bundle.ts.\nexport const PUBLIC_KEY = ${JSON.stringify(publicOf(main))};\nexport const PREVIOUS_KEYS = [${JSON.stringify(publicOf(other))}];\n`);
const key = publicOf(main);
const base = { v: 1 as const, piece: 'test-piece', draft: 1, from: 64, to: 78, fromBar: 33, toBar: 40, lane: 'brass', reaction: null, curve: null, made: '2026-10-17T12:00:00.000Z' };
writeFileSync(join(dir, 'note-text.sealed'), await seal({ ...base, kind: 'text', text: 'Fixture note: louder at bar 33', audio: null }, null, key));
writeFileSync(join(dir, 'note-hum.sealed'), await seal({ ...base, kind: 'hum', text: null, audio: { mime: 'audio/webm', seconds: 2 } }, new Uint8Array(2048).fill(7), key));
console.log(`fixtures: test keys ${main.fingerprint} (current), ${other.fingerprint} (earlier)`);
```

- [ ] **Step 3: Run the tests to see them fail** — `node --test workroom/test/seal.test.ts workroom/test/unlock.test.ts workroom/test/vault.test.ts workroom/test/no-storage.test.ts workroom/test/public-key.test.ts` — FAIL (modules missing).

- [ ] **Step 4: Implement**, then run the fixture maker.

- `seal`: `importKey('spki', ...)` only after `fingerprintOf(spki) === key.fingerprint` (else `FingerprintMismatch`); `aes = generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt'])`; `wrapped = encrypt({ name: 'RSA-OAEP' }, pub, exportKey('raw', aes))`; header = magic ‖ fingerprint bytes; plaintext = uint32 J ‖ JSON ‖ audio; `encrypt({ name: 'AES-GCM', iv, additionalData: header }, aes, plaintext)`; concatenate per the bundle table.
- `open`: length < 52 or wrong magic or `L` past the end → `format`; the header's fingerprint not in the keyring → `unknown-key`; any failure of RSA decrypt, AES-GCM decrypt or a JSON body that does not parse as a `NoteBody` (`v === 1`, known `kind`) → `tampered`.
- `unlockKeyring`: before any key is derived, check `v === 1`, `kdf === 'PBKDF2-SHA-256'`, `Number.isInteger(iterations) && iterations >= ITERATIONS`, `salt` decoding to 16 bytes, `iv` to 12 bytes and `ct` to at least 17 bytes, and that `known` is not empty (else `KeyringInvalid`); derive `PBKDF2(SHA-256, salt, iterations)` → AES-GCM key; decrypt with `additionalData = UTF-8(KEYRING_AAD)`; failure → `WrongPassphrase`; parse the plaintext (`v === 1`, `keys` an array of `{ fingerprint: /^[0-9a-f]{64}$/, pkcs8: base64 }`, no fingerprint twice, else `KeyringInvalid`); the entries must include `known[0].fingerprint` (else `KeyringInvalid`); for each entry whose fingerprint is in `known`, import the PKCS8 with `extractable: false`, usages `['decrypt']`, and prove the pair: encrypt 32 random bytes with that entry's built-in public key, decrypt with the private key, compare (failure → `KeyringInvalid`); entries not in `known` are skipped.
- `lockKeyring`: the inverse, for tests and fixtures: random 16-byte salt and 12-byte IV, `ITERATIONS` rounds, the plaintext JSON of Formats, the same additional data.
- `vault.load` throws on any `key.extractable` and copies the map; `vault` has no other state and no storage.
- Write `src/tsconfig.crypto.json` as above, add it to `build.json`'s `programs`, and add `src/note.ts` to `tsconfig.json`'s `files`.
- `public-key.ts` starts as `export const PUBLIC_KEY: BuiltInKey | null = null; export const PREVIOUS_KEYS: readonly BuiltInKey[] = [];` with a comment that `siue-music keys init|rotate` writes it.

Run `node workroom/tools/make-fixtures.ts` (writes the five fixture files, replacing `test/fixtures/public-key.ts`).

- [ ] **Step 5: Run the tests** — PASS. `node _kit/build/build.mjs workroom` (type-checks the crypto program under the DOM library) and `sh workroom/test.sh` — exit 0; `sh units.sh` — PASS.

- [ ] **Step 6: Commit**

```bash
git add websites/www.cs/games/workroom
git commit -m "Music workroom: sealing and unlocking the keyring in the browser

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb"
```

### Task 11: `siue-music` core: 1Password, the key cache, status, pull, forget, API keys and the sync check

**Files:**
- Create: `websites/www.cs/music/tools/siue-music`, `music/tools/siue_music/__init__.py`, `paths.py`, `op.py`, `sealing.py`, `keys.py`, `cli.py`, `music/tools/requirements.txt`, `music/tools/requirements-answering.txt`
- Create: `music/tools/tests/fake_op.py`, `tests/support.py`, `tests/test_op.py`, `tests/test_sealing.py`, `tests/test_keys_sync.py`, `tests/test_paths.py`
- Modify: `websites/www.cs/Makefile` (new targets `keys-status`, `keys-pull`, `keys-forget`, `api-key-set`, `music-tools-venv`, `music-tools-test`), `music/README.md`

**Interfaces:**
- Consumes: the bundle and keyring formats (Task 10's fixtures), `music/keys/public.json`.
- Produces:

```python
# siue_music/paths.py  (every function that reads the environment takes it as an argument; none reads os.environ itself)
def repo_root() -> Path                      # git rev-parse --show-toplevel from this file's folder
def site_dir() -> Path                       # <repo>/websites/www.cs
def public_keys_path(env: Mapping[str, str]) -> Path      # $SIUE_MUSIC_PUBLIC_KEYS or <site>/music/keys/public.json
def public_key_ts_path(env: Mapping[str, str]) -> Path    # $SIUE_MUSIC_PUBLIC_KEY_TS or <site>/games/workroom/src/public-key.ts
def glossary_path() -> Path                  # <site>/games/workroom/src/glossary.json (the page's glossary source; Task 13)
def config_dir(env: Mapping[str, str], home: Path) -> Path    # $SIUE_CONFIG_DIR or <home>/.config/siue
def api_base(env: Mapping[str, str]) -> str  # $SIUE_MUSIC_BASE or https://www.cs.siue.edu/~wgrim/music/ (every API call uses it)
def notes_dir(platform: str, env: Mapping[str, str], home: Path) -> Path
class NotesInsideRepo(Exception): ...
def check_outside(path: Path, repo: Path) -> None   # raises NotesInsideRepo when path (resolved) is inside repo

# siue_music/op.py
class OpError(Exception): ...
MIN_VERSION = (2, 25)
class Op:
    def __init__(self, vault: str, exe: Sequence[str] = ("op",), run: Callable[..., subprocess.CompletedProcess] = subprocess.run): ...
    def check_version(self) -> None                    # OpError naming `brew install 1password-cli` / `brew upgrade 1password-cli`
    def list_items(self, tag: str) -> list[dict]       # op item list --vault V --tags TAG --format json
    def fields(self, item_id: str) -> dict[str, str]   # op item get ID --vault V --reveal --format json → {label: value}
    def create(self, title: str, category: str, tags: list[str], fields: list[dict], urls: Sequence[str] = ()) -> str
        # op item create --vault V --format json -   (the JSON template, secrets included, on stdin)
    def retitle(self, item_id: str, title: str) -> None  # op item edit ID --vault V --title TITLE
    def archive(self, item_id: str) -> None             # op item delete ID --vault V --archive

# siue_music/sealing.py
MAGIC = b"SIUEN1"; ITERATIONS = 600_000; KEYRING_AAD = b"siue-music-keyring-v1"
class NoteUnreadable(Exception): reason: str           # "format" | "unknown-key" | "tampered"
class WrongPassphrase(Exception): ...
class KeyringInvalid(Exception): ...
@dataclass(frozen=True) class Opened: fingerprint: str; body: dict; audio: bytes
def fingerprint(spki_der: bytes) -> str
def generate() -> tuple[bytes, bytes]                   # (pkcs8_der, spki_der), RSA-4096, e = 65537
def spki_of(pkcs8_der: bytes) -> bytes
def normalize_passphrase(p: str) -> bytes               # NFC, strip, UTF-8
def new_passphrase() -> str                             # secrets.token_urlsafe(32): 43 characters
def lock_keyring(keys: Mapping[str, bytes], passphrase: str) -> dict         # fp -> pkcs8 DER, current first; the Formats envelope
def unlock_keyring(locked: dict, passphrase: str) -> dict[str, bytes]        # the same order; KeyringInvalid (weak or malformed) / WrongPassphrase
def seal(body: dict, audio: bytes, spki_der: bytes) -> bytes
def open_bundle(bundle: bytes, keyring: Mapping[str, bytes]) -> Opened

# siue_music/keys.py
KEY_TAG = "siue-music-key"; API_TAG = "siue-music-api"
WORKROOM_URL = "https://www.cs.siue.edu/~wgrim/music/"
class KeyMismatch(Exception): ...        # exit code 3; the message names which side is out of date
class KeysError(Exception): ...          # exit code 1
@dataclass class RepoKeys: current: str | None; previous: list[str]; spki: dict[str, bytes]
def read_repo_keys(path: Path) -> RepoKeys
class Cache:                             # <config>/music.json: {"v": 1, "keys": {fp: pkcs8 b64}, "api": {name: key}}
    def __init__(self, path: Path): ...
    def load(self) -> dict; def save(self, data: dict) -> None; def forget(self) -> bool
class Keys:
    def __init__(self, op: Op, cache: Cache, public_json: Path, public_ts: Path, out: Callable[[str], None] = print): ...
    def status(self) -> int
    def pull(self) -> None
    def pull_checked(self) -> None                # pull(), then ensure_synced(): KeyMismatch unless the pulled keys include the repository's current key
    def ensure_synced(self) -> dict[str, bytes]   # fp -> pkcs8 DER for every repo key it holds, the current one first (guaranteed present), then `previous` in repository order
    def forget(self) -> None
    def api_key_set(self, name: str, secret: str) -> None
    def api_key(self, name: str) -> str
    def passphrase(self) -> str                   # from the current key's 1Password item; never printed
    # Task 12 adds: init(upload), rotate(upload), upload_keyring(upload), keyring()

# siue_music/cli.py
def main(argv: Sequence[str], env: Mapping[str, str] = os.environ) -> int
# main reads every location from `env` through paths.* (public.json, public-key.ts, the config folder, the API base) and
# OP_VAULT / SIUE_OP from it too; Path.home() is its only other outside input. Tests pass the env they want to cli.main
# and to paths.* alike.
```

1Password items. A key item: category `PASSWORD`, title `SIUE music notes key <first 16 hex>`, tags `["siue-music-key"]`, URL `WORKROOM_URL`, fields `password` (CONCEALED, purpose PASSWORD: the passphrase), `private_key` (CONCEALED: PKCS8 base64), `fingerprint` (STRING). An API key item: category `API_CREDENTIAL`, title `SIUE music API <name>`, tags `["siue-music-api"]`, fields `name` (STRING), `credential` (CONCEALED).

`requirements.txt`: `cryptography>=43`. `requirements-answering.txt`: `faster-whisper>=1.0`, `librosa>=0.10`, `mido>=1.3`, `numpy>=1.26`, `soundfile>=0.12`.

`siue-music` (executable, `#!/usr/bin/env python3`): puts its own folder first on `sys.path`, imports `siue_music.cli` inside a `try`; on `ModuleNotFoundError` for `cryptography` it prints `siue-music needs the cryptography package: make music-tools-venv (or pip install -r music/tools/requirements.txt)` and exits 1; else `sys.exit(cli.main(sys.argv[1:]))`.

Makefile (new targets; `test` and `e2e` untouched):

```make
# The music workroom's key and note tool (music/tools/siue-music). Its own
# virtualenv when make music-tools-venv made one, else python3.
.PHONY: keys-status keys-pull keys-init keys-rotate keys-upload keys-forget api-key-set music-pickup music-publish music-tools-venv music-tools-test music-e2e
MUSIC_PY ?= $(if $(wildcard music/tools/.venv/bin/python),music/tools/.venv/bin/python,python3)
MUSIC_TOOL = $(MUSIC_PY) music/tools/siue-music

keys-status:
	@$(MUSIC_TOOL) keys status
keys-pull:
	@$(MUSIC_TOOL) keys pull
keys-forget:
	@$(MUSIC_TOOL) keys forget
api-key-set:
	@test -n "$(NAME)" || { echo "usage: make api-key-set NAME=music-pickup" >&2; exit 1; }
	@$(MUSIC_TOOL) api-key-set "$(NAME)"
music-tools-venv:
	python3 -m venv music/tools/.venv
	music/tools/.venv/bin/pip install --quiet -r music/tools/requirements.txt
	@echo "Speech and humming (optional): music/tools/.venv/bin/pip install -r music/tools/requirements-answering.txt; brew install ffmpeg"
music-tools-test:
	$(MUSIC_PY) -m unittest discover -s music/tools/tests -t music/tools/tests
```

- [ ] **Step 1: Write the fake `op` and the test support**

`music/tools/tests/fake_op.py`:

```python
#!/usr/bin/env python3
"""A stand-in for the 1Password CLI (op v2) in tests. Items live in the JSON
file $FAKE_OP_STORE; every argv is appended to $FAKE_OP_LOG, so a test can
prove no secret ever rode on a command line."""
import json
import os
import sys
import uuid


def load():
    path = os.environ["FAKE_OP_STORE"]
    if not os.path.exists(path):
        return {"items": []}
    with open(path) as f:
        return json.load(f)


def save(data):
    with open(os.environ["FAKE_OP_STORE"], "w") as f:
        json.dump(data, f)


def flag(args, name):
    return args[args.index(name) + 1] if name in args else None


def main(argv):
    with open(os.environ["FAKE_OP_LOG"], "a") as log:
        log.write(json.dumps(argv) + "\n")
    if argv == ["--version"]:
        print(os.environ.get("FAKE_OP_VERSION", "2.30.0"))
        return 0
    data = load()
    vault = flag(argv, "--vault")
    if argv[:2] == ["item", "list"]:
        tag = flag(argv, "--tags")
        print(json.dumps([{"id": i["id"], "title": i["title"], "tags": i["tags"]}
                          for i in data["items"] if i["vault"] == vault and tag in i["tags"]]))
        return 0
    if argv[:2] == ["item", "get"]:
        for i in data["items"]:
            if i["id"] == argv[2] and i["vault"] == vault:
                hide = "--reveal" not in argv
                fields = [{**f, "value": "[use 'op item get --reveal']"} if hide and f["type"] == "CONCEALED" else f for f in i["fields"]]
                print(json.dumps({**i, "fields": fields}))
                return 0
        print(f'[ERROR] "{argv[2]}" isn\'t an item in the "{vault}" vault', file=sys.stderr)
        return 1
    if argv[:2] == ["item", "create"] and argv[-1] == "-":
        t = json.load(sys.stdin)
        item = {"id": uuid.uuid4().hex[:26], "vault": vault, "title": t["title"], "category": t["category"],
                "tags": t.get("tags", []), "fields": t["fields"], "urls": t.get("urls", [])}
        data["items"].append(item)
        save(data)
        print(json.dumps({"id": item["id"]}))
        return 0
    if argv[:2] == ["item", "edit"]:
        for i in data["items"]:
            if i["id"] == argv[2] and i["vault"] == vault:
                i["title"] = flag(argv, "--title") or i["title"]
        save(data)
        return 0
    if argv[:2] == ["item", "delete"] and "--archive" in argv:
        data["items"] = [i for i in data["items"] if i["id"] != argv[2]]
        save(data)
        return 0
    print("fake op: unsupported: " + " ".join(argv), file=sys.stderr)
    return 2


sys.exit(main(sys.argv[1:]))
```

`music/tools/tests/support.py`:

```python
"""Shared test world: a temporary repository with music/keys/public.json, the
fake op, a key cache, and a small pool of RSA-4096 test keys (made once per run)."""
import base64
import json
import os
import sys
import tempfile
from pathlib import Path
from unittest import mock

TOOLS = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(TOOLS))

from siue_music import sealing  # noqa: E402
from siue_music.keys import Cache, Keys, KEY_TAG, WORKROOM_URL  # noqa: E402
from siue_music.op import Op  # noqa: E402

SITE = TOOLS.parents[1]
FIXTURES = SITE / "games" / "workroom" / "test" / "fixtures"
GLOSSARY_JSON = SITE / "games" / "workroom" / "src" / "glossary.json"
_POOL: list[tuple[str, bytes, bytes]] = []


def pool_key(i: int) -> tuple[str, bytes, bytes]:
    """(fingerprint, pkcs8, spki) of test key i, generated on first use."""
    while len(_POOL) <= i:
        pkcs8, spki = sealing.generate()
        _POOL.append((sealing.fingerprint(spki), pkcs8, spki))
    return _POOL[i]


class World:
    def __init__(self, case):
        tmp = tempfile.TemporaryDirectory()
        case.addCleanup(tmp.cleanup)
        self.root = Path(tmp.name)
        self.repo = self.root / "repo"
        (self.repo / "music" / "keys").mkdir(parents=True)
        (self.repo / "games" / "workroom" / "src").mkdir(parents=True)
        self.public_json = self.repo / "music" / "keys" / "public.json"
        self.public_ts = self.repo / "games" / "workroom" / "src" / "public-key.ts"
        self.log = self.root / "op.log"
        env = mock.patch.dict(os.environ, {"FAKE_OP_LOG": str(self.log), "FAKE_OP_STORE": str(self.root / "op.json")})
        env.start()
        case.addCleanup(env.stop)
        self.op = Op("SIUE", exe=(sys.executable, str(TOOLS / "tests" / "fake_op.py")))
        self.cache = Cache(self.root / "config" / "siue" / "music.json")
        self.out: list[str] = []
        self.keys = Keys(self.op, self.cache, self.public_json, self.public_ts, out=self.out.append)
        self.spki: dict[str, bytes] = {}

    def op_calls(self) -> list[list[str]]:
        return [json.loads(line) for line in self.log.read_text().splitlines()] if self.log.exists() else []

    def clear_op_log(self) -> None:
        self.log.unlink(missing_ok=True)

    def add_key_to_op(self, i: int, passphrase: str = "a test passphrase", private_key: bytes | None = None) -> str:
        fp, pkcs8, spki = pool_key(i)
        self.spki[fp] = spki
        self.op.create(f"SIUE music notes key {fp[:16]}", "PASSWORD", [KEY_TAG], [
            {"id": "password", "type": "CONCEALED", "purpose": "PASSWORD", "label": "password", "value": passphrase},
            {"id": "private_key", "type": "CONCEALED", "label": "private_key", "value": base64.b64encode(private_key or pkcs8).decode()},
            {"id": "fingerprint", "type": "STRING", "label": "fingerprint", "value": fp},
        ], urls=[WORKROOM_URL])
        return fp

    def write_repo(self, current: str, previous: tuple[str, ...] = ()) -> None:
        for fp in (current, *previous):
            if fp not in self.spki:
                self.spki[fp] = next(s for f, _, s in _POOL if f == fp)
        entry = lambda fp: {"fingerprint": fp, "spki": base64.b64encode(self.spki[fp]).decode()}  # noqa: E731
        self.public_json.write_text(json.dumps({"schema": 1, "current": entry(current), "previous": [entry(p) for p in previous]}))
```

- [ ] **Step 2: Write the failing tests**

`tests/test_keys_sync.py`:

```python
"""The sync check every music-* target runs first: a cached current key needs
no 1Password; a rotated key is fetched automatically; when the keys still
differ it stops and says which side is out of date."""
import base64
import unittest

from support import World, pool_key
from siue_music.keys import KeyMismatch
from siue_music.sealing import fingerprint, spki_of


class SyncTest(unittest.TestCase):
    def setUp(self):
        self.w = World(self)

    def test_no_key_yet_says_keys_init(self):
        with self.assertRaises(KeyMismatch) as e:
            self.w.keys.ensure_synced()
        self.assertIn("make keys-init", str(e.exception))

    def test_a_cached_current_key_needs_no_1password(self):
        fp = self.w.add_key_to_op(0)
        self.w.write_repo(fp)
        self.w.keys.pull()
        self.w.clear_op_log()
        ring = self.w.keys.ensure_synced()
        self.assertEqual(fingerprint(spki_of(ring[fp])), fp)
        self.assertEqual(self.w.op_calls(), [])

    def test_a_rotated_key_is_fetched_then_used(self):
        old = self.w.add_key_to_op(0)
        self.w.write_repo(old)
        self.w.keys.pull()
        new = self.w.add_key_to_op(1)
        self.w.write_repo(new, (old,))  # what a git pull after a rotation brings
        ring = self.w.keys.ensure_synced()
        self.assertEqual(set(ring), {old, new})
        self.assertIn(new, self.w.cache.load()["keys"])

    def test_the_repository_key_missing_from_1password_stops(self):
        known = self.w.add_key_to_op(0)
        self.w.write_repo(known)
        self.w.keys.pull()
        orphan, _, _ = pool_key(1)
        self.w.write_repo(orphan, (known,))
        with self.assertRaises(KeyMismatch) as e:
            self.w.keys.ensure_synced()
        msg = str(e.exception)
        self.assertIn("1Password (vault SIUE) has no private key for the repository's public key", msg)
        self.assertIn(orphan[:4], msg)
        self.assertIn("OP_VAULT", msg)

    def test_a_key_the_repository_does_not_know_suggests_git_pull(self):
        unknown = self.w.add_key_to_op(0)
        orphan, _, _ = pool_key(1)
        self.w.write_repo(orphan)
        with self.assertRaises(KeyMismatch) as e:
            self.w.keys.ensure_synced()
        self.assertIn("git pull", str(e.exception))
        self.assertIn(unknown[:4], str(e.exception))

    def test_an_item_whose_private_key_does_not_match_its_fingerprint_is_refused(self):
        _, wrong_pkcs8, _ = pool_key(1)
        fp = self.w.add_key_to_op(0, private_key=wrong_pkcs8)
        self.w.write_repo(fp)
        with self.assertRaises(KeyMismatch) as e:
            self.w.keys.ensure_synced()
        self.assertIn("holds a private key whose fingerprint is", str(e.exception))
        self.assertNotIn(fp, self.w.cache.load().get("keys", {}))

    def test_pull_checks_the_pulled_key_against_the_repository(self):
        known = self.w.add_key_to_op(0)
        orphan, _, _ = pool_key(1)
        self.w.write_repo(orphan)
        with self.assertRaises(KeyMismatch) as e:
            self.w.keys.pull_checked()
        self.assertIn("git pull", str(e.exception), "1Password holds a key the repository does not name")
        self.assertIn(known[:4], str(e.exception))
        self.assertIn(known, self.w.cache.load()["keys"], "the pull itself still saved what 1Password holds")
        self.w.write_repo(known)
        self.w.keys.pull_checked()

    def test_pull_with_no_repository_key_says_keys_init(self):
        self.w.add_key_to_op(0)
        with self.assertRaises(KeyMismatch) as e:
            self.w.keys.pull_checked()
        self.assertIn("make keys-init", str(e.exception))

    def test_status_names_fingerprints_and_never_a_secret(self):
        fp = self.w.add_key_to_op(0, passphrase="never print me")
        self.w.write_repo(fp)
        self.w.keys.api_key_set("music-pickup", "f" * 64)
        self.w.keys.pull()
        self.assertEqual(self.w.keys.status(), 0)
        text = "\n".join(self.w.out)
        self.assertIn(fp[:4] + " " + fp[4:8], text)
        self.assertIn("match", text)
        self.assertIn("music-pickup", text)
        _, pkcs8, _ = pool_key(0)
        for secret in ("never print me", "f" * 64, base64.b64encode(pkcs8).decode()[:40]):
            self.assertNotIn(secret, text)


if __name__ == "__main__":
    unittest.main()
```

`tests/test_op.py`:

```python
"""The 1Password wrapper: secrets go to op on stdin, never in argv; an old op
is refused with the command that fixes it; a failed op call is an OpError."""
import os
import unittest
from unittest import mock

from support import World
from siue_music.keys import Cache, KeysError
from siue_music.op import OpError


class OpTest(unittest.TestCase):
    def setUp(self):
        self.w = World(self)

    def test_secrets_ride_on_stdin_never_argv(self):
        secret = "s3cret-" + "x" * 40
        item = self.w.op.create("t", "API_CREDENTIAL", ["siue-music-api"],
                                [{"id": "credential", "type": "CONCEALED", "label": "credential", "value": secret}])
        self.assertEqual(self.w.op.fields(item)["credential"], secret)
        self.w.keys.api_key_set("music-pickup", "e" * 64)
        for call in self.w.op_calls():
            for arg in call:
                self.assertNotIn(secret, arg)
                self.assertNotIn("e" * 64, arg)

    def test_an_old_op_is_refused_with_the_remedy(self):
        with mock.patch.dict(os.environ, {"FAKE_OP_VERSION": "2.10.0"}):
            with self.assertRaises(OpError) as e:
                self.w.op.check_version()
        self.assertIn("brew upgrade 1password-cli", str(e.exception))

    def test_a_missing_item_is_an_op_error(self):
        with self.assertRaises(OpError):
            self.w.op.fields("nope")

    def test_api_key_set_replaces_the_old_item(self):
        self.w.keys.api_key_set("music-pickup", "a" * 64)
        self.w.keys.api_key_set("music-pickup", "b" * 64)
        items = self.w.op.list_items("siue-music-api")
        self.assertEqual(len(items), 1)
        self.assertEqual(self.w.op.fields(items[0]["id"])["credential"], "b" * 64)
        with self.assertRaises(KeysError):
            self.w.keys.api_key_set("music-pickup", "not hex")
        self.assertEqual(len(self.w.op.list_items("siue-music-api")), 1, "a refused key changes nothing")

    def test_the_cache_is_private_and_forget_removes_it(self):
        cache = Cache(self.w.root / "c" / "siue" / "music.json")
        cache.save({"v": 1, "keys": {}, "api": {}})
        self.assertEqual(os.stat(cache.path).st_mode & 0o777, 0o600)
        self.assertEqual(os.stat(cache.path.parent).st_mode & 0o777, 0o700)
        self.assertTrue(cache.forget())
        self.assertFalse(cache.path.exists())


if __name__ == "__main__":
    unittest.main()
```

`tests/test_sealing.py` (the Python side opens what the browser sealed and unlocks what the browser locked):

```python
"""Python and the page speak one format: the browser-made fixtures open here."""
import base64
import json
import unittest

from support import FIXTURES, pool_key
from siue_music import sealing


class SealingTest(unittest.TestCase):
    def setUp(self):
        self.fx = json.loads((FIXTURES / "test-key.json").read_text())
        self.pkcs8 = base64.b64decode(self.fx["pkcs8"])
        self.ring = {self.fx["fingerprint"]: self.pkcs8}

    def test_opens_what_the_browser_sealed(self):
        text = sealing.open_bundle((FIXTURES / "note-text.sealed").read_bytes(), self.ring)
        self.assertEqual(text.body["text"], "Fixture note: louder at bar 33")
        hum = sealing.open_bundle((FIXTURES / "note-hum.sealed").read_bytes(), self.ring)
        self.assertEqual((hum.body["kind"], len(hum.audio)), ("hum", 2048))

    def test_unlocks_what_the_browser_locked(self):
        other = base64.b64decode(self.fx["other"]["pkcs8"])
        ring = sealing.unlock_keyring(self.fx["keyring"], self.fx["passphrase"])
        self.assertEqual(ring, {self.fx["fingerprint"]: self.pkcs8, self.fx["other"]["fingerprint"]: other})
        self.assertEqual(list(ring), [self.fx["fingerprint"], self.fx["other"]["fingerprint"]], "current first")
        with self.assertRaises(sealing.WrongPassphrase):
            sealing.unlock_keyring(self.fx["keyring"], "wrong")

    def test_a_keyring_round_trips_in_order(self):
        (fp0, pkcs0, _), (fp1, pkcs1, _) = pool_key(0), pool_key(1)
        locked = sealing.lock_keyring({fp1: pkcs1, fp0: pkcs0}, "a test passphrase")
        self.assertEqual(set(locked), {"v", "kdf", "iterations", "salt", "iv", "ct"})
        self.assertEqual(list(sealing.unlock_keyring(locked, "a test passphrase").items()), [(fp1, pkcs1), (fp0, pkcs0)])

    def test_round_trip_and_tampering(self):
        fp, pkcs8, spki = pool_key(0)
        bundle = sealing.seal({"v": 1, "kind": "text", "text": "hi"}, b"", spki)
        self.assertEqual(sealing.open_bundle(bundle, {fp: pkcs8}).body["text"], "hi")
        bad = bytearray(bundle)
        bad[-1] ^= 1
        for blob, reason in ((bytes(bad), "tampered"), (bundle[:20], "format"), (bundle, "unknown-key")):
            with self.assertRaises(sealing.NoteUnreadable) as e:
                sealing.open_bundle(blob, {fp: pkcs8} if reason != "unknown-key" else {})
            self.assertEqual(e.exception.reason, reason)

    def test_weak_or_malformed_keyrings_are_refused(self):
        for bad in ({"iterations": 1000}, {"v": 2}, {"kdf": "scrypt"}, {"salt": "AAAA"}, {"iv": "AAAA"}, {"ct": ""}):
            with self.assertRaises(sealing.KeyringInvalid, msg=str(bad)):
                sealing.unlock_keyring({**self.fx["keyring"], **bad}, self.fx["passphrase"])


if __name__ == "__main__":
    unittest.main()
```

`tests/test_paths.py`:

```python
"""Opened notes live outside the repository, in the platform's data folder."""
import tempfile
import unittest
from pathlib import Path

from support import SITE
from siue_music.paths import NotesInsideRepo, api_base, check_outside, config_dir, notes_dir, public_key_ts_path, public_keys_path


class PathsTest(unittest.TestCase):
    def test_platform_folders(self):
        home = Path("/Users/me")
        self.assertEqual(notes_dir("darwin", {}, home), home / "Library" / "Application Support" / "siue-music" / "notes")
        self.assertEqual(notes_dir("linux", {}, Path("/home/me")), Path("/home/me/.local/share/siue-music/notes"))
        self.assertEqual(notes_dir("linux", {"XDG_DATA_HOME": "/data"}, home), Path("/data/siue-music/notes"))
        self.assertEqual(notes_dir("win32", {"APPDATA": "C:/AppData"}, home), Path("C:/AppData/siue-music/notes"))
        self.assertEqual(notes_dir("darwin", {"SIUE_MUSIC_NOTES_DIR": "/elsewhere"}, home), Path("/elsewhere"))

    def test_every_location_comes_from_the_env_it_is_given(self):
        home = Path("/Users/me")
        self.assertEqual(public_keys_path({}), SITE / "music" / "keys" / "public.json")
        self.assertEqual(public_keys_path({"SIUE_MUSIC_PUBLIC_KEYS": "/x/p.json"}), Path("/x/p.json"))
        self.assertEqual(public_key_ts_path({}), SITE / "games" / "workroom" / "src" / "public-key.ts")
        self.assertEqual(public_key_ts_path({"SIUE_MUSIC_PUBLIC_KEY_TS": "/x/k.ts"}), Path("/x/k.ts"))
        self.assertEqual(config_dir({}, home), home / ".config" / "siue")
        self.assertEqual(config_dir({"SIUE_CONFIG_DIR": "/c"}, home), Path("/c"))
        self.assertEqual(api_base({}), "https://www.cs.siue.edu/~wgrim/music/")
        self.assertEqual(api_base({"SIUE_MUSIC_BASE": "http://localhost:5555/music/"}), "http://localhost:5555/music/")

    def test_inside_the_repository_is_refused(self):
        repo = SITE.parents[1]
        with self.assertRaises(NotesInsideRepo):
            check_outside(repo / "notes", repo)
        with tempfile.TemporaryDirectory() as d:
            check_outside(Path(d), repo)


if __name__ == "__main__":
    unittest.main()
```

- [ ] **Step 3: Run to see them fail**

Run, from `websites/www.cs`: `make music-tools-venv && make music-tools-test`
Expected: FAIL — `ModuleNotFoundError: siue_music`.

- [ ] **Step 4: Check the real `op` template shape once.** Run `op --version` (2.25 or newer) and `op item template get Password --format json`; confirm the template's `fields` entries use `id`, `type`, `purpose`, `label`, `value` and that `op item create --help` documents reading a template from standard input with `-`. The fake mirrors that shape; if the installed op differs, change `Op.create` and `fake_op.py` together.

- [ ] **Step 5: Implement.**
  - `Op._run(args, stdin=None)`: `run([*exe, *args], input=stdin, capture_output=True, text=True)`; a non-zero exit raises `OpError(f"op {args[0]} {args[1]} failed: {first stderr line}")`. `check_version` parses `op --version` and compares to `MIN_VERSION`. `create` sends `json.dumps({"title", "category", "tags", "fields", "urls": [{"href": u, "primary": i == 0}]})` on stdin.
  - `sealing` uses `cryptography`: `rsa.generate_private_key(65537, 4096)`; OAEP with `MGF1(SHA256)` and `SHA256`; `AESGCM`; `PBKDF2HMAC(SHA256, 32, salt, ITERATIONS)`; AAD as in the formats section (`KEYRING_AAD` for the keyring); `unlock_keyring` checks the envelope before deriving anything, then the plaintext (`v`, a `keys` list, no fingerprint twice, each fingerprint equal to the SHA-256 of its key's SPKI, else `KeyringInvalid`); `open_bundle` maps every failure to `NoteUnreadable` with the same reasons as the page.
  - `Cache.save`: `mkdir(mode=0o700, parents=True)` then `os.chmod(dir, 0o700)`; write to `music.json.tmp` opened with `os.open(..., O_WRONLY | O_CREAT | O_TRUNC, 0o600)`, `os.replace` onto `music.json`.
  - `Keys.pull`: for each item tagged `siue-music-key`, read its fields, check `fingerprint(spki_of(b64decode(private_key))) == fingerprint field` (else `KeyMismatch("The 1Password item <title> holds a private key whose fingerprint is <A>, not <B>: fix the item")`), keep it; for each item tagged `siue-music-api`, keep `name → credential`; save the cache.
  - `Keys.ensure_synced`: no `current` → `KeyMismatch("No notes key yet: run make keys-init")`; current in cache → return the cache's keys that the repository names, current first; else `pull()` and look again; still missing → the two messages: with keys in 1Password the repository does not know: `1Password holds a key the repository does not know (<display>). The repository may be out of date: git pull, then run this again. If it is up to date, the repository's key <display> was never saved to 1Password: run make keys-status.`; otherwise: `1Password (vault <V>) has no private key for the repository's public key <display>. Check OP_VAULT, or the key was never saved to 1Password: run make keys-status.`
  - `Keys.status`: prints the repository's current fingerprint (display form), 1Password's fingerprints (or "unreachable: <reason>"), the cache's, one line `match` / `out of date: <side>` per side, and `API keys: <names>` (names only); returns 0 when all match, 3 otherwise.
  - `Keys.api_key_set`: refuses anything but 64 lowercase hex (`KeysError`); archives an existing item with that name; creates the new one; does not touch the cache.
  - `Keys.pull_checked`: `pull()` then `ensure_synced()`, so `keys pull` fails with the same two `KeyMismatch` messages when the pulled private keys do not include the repository's current public key (the spec's "then checks the private key matches the repository's public key"). With no repository key it says `make keys-init`.
  - `cli.main`: `keys status|pull|forget` (`keys pull` runs `pull_checked`), `api-key-set NAME` (the secret read with `getpass.getpass("API key (shown once on the hub): ")` when stdin is a terminal, else one line from stdin); `KeyMismatch` → message on stderr, exit 3; `KeysError`/`OpError` → message, exit 1. `OP_VAULT` defaults to `SIUE`; `SIUE_OP` overrides the `op` executable. Every path comes from `paths.*(env)` with the `env` given to `main`: the `Cache` is `paths.config_dir(env, Path.home()) / "music.json"`, `Keys` gets `paths.public_keys_path(env)` and `paths.public_key_ts_path(env)`, and `notes_dir` is `paths.notes_dir(sys.platform, env, Path.home())`.

- [ ] **Step 6: Run the tests** — `make music-tools-test` — PASS. Run `make keys-status` once on the real machine: it reports "No notes key yet: run make keys-init" (exit 3) without printing anything secret.

- [ ] **Step 7: Commit**

```bash
git add websites/www.cs/music/tools websites/www.cs/Makefile websites/www.cs/music/README.md
git commit -m "Music workroom: siue-music keys status, pull, forget and API keys from 1Password

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb"
```

### Task 12: `keys-init`, `keys-rotate` and `keys-upload`

**Files:**
- Create: `music/tools/siue_music/api.py`, `music/tools/tests/test_keys_lifecycle.py`, `music/tools/tests/test_api.py`, `music/tools/tests/make_fixture.py`, `games/workroom/test/fixtures/keyring-by-python.json`
- Modify: `music/tools/siue_music/keys.py`, `cli.py`, `websites/www.cs/Makefile` (`keys-init`, `keys-rotate`, `keys-upload`), `games/workroom/test/unlock.test.ts` (one test), `tests/php/MusicDeployTest.php` (expects `music/keys/public.json` when it exists), `music/README.md`

**Interfaces:**
- Consumes: `Op`, `Cache`, `Keys`, `sealing.generate/lock_keyring/unlock_keyring/new_passphrase`.
- Produces:

```python
# siue_music/api.py
MAX_REQUEST_BYTES = 8_388_608                              # what the server accepts in one draft request
class ApiError(Exception): status: int
def draft_size(files: Mapping[str, Path]) -> int           # the SIUED1 body's length in bytes
def draft_container(files: Mapping[str, Path]) -> bytes    # the SIUED1 bundle of the Formats section
class Api:
    """HTTPS only (http:// allowed only for localhost and 127.0.0.1, the local docker check)."""
    def __init__(self, base: str, key: str, opener: Callable = urllib.request.urlopen): ...
    def waiting(self) -> list[dict]                        # GET api/notes.php?state=waiting
    def note(self, note_id: str) -> bytes                  # GET api/note.php?id=
    def mark_picked_up(self, note_id: str) -> None         # POST api/picked-up.php?id=
    def publish_draft(self, piece: str, version: int, files: Mapping[str, Path]) -> None  # POST api/drafts.php?piece=&version= (application/octet-stream, Content-Length set)
    def publish_keyring(self, locked: dict) -> None        # POST api/keyring.php (JSON)

# siue_music/keys.py (added)
Upload = Callable[[dict], None]
class Keys:
    def init(self, upload: Upload | None) -> str           # returns the new fingerprint; uploads a keyring of one
    def rotate(self, upload: Upload | None) -> str         # uploads the full keyring, replacing the stored one
    def upload_keyring(self, upload: Upload) -> int        # re-locks and uploads the full keyring of every repository key; returns the number of keys in it
    def keyring(self) -> dict[str, bytes]                  # fp -> pkcs8 DER for the current key then every retained one, from ensure_synced()
```

`init` order: refuse (`KeysError("A notes key already exists ...: use make keys-rotate")`) when `public.json` has a current key **or** 1Password holds any `siue-music-key` item; generate the pair and `new_passphrase()`; create the 1Password item (nothing is written anywhere if this fails); write `public.json` (`current` = new, `previous` = []) and `public-key.ts`; save the private key to the cache; then `upload(lock_keyring({new: pkcs8}, passphrase))` when an upload is given, a keyring of one. A failed or missing upload prints `The locked keyring was not uploaded (<reason>). After creating the music-publish API key on the hub: make api-key-set NAME=music-publish && make keys-upload` and still exits 0; finally it prints the next steps: `(cd games && node _kit/build/build.mjs workroom)`, commit `music/keys/public.json`, `games/workroom/src/public-key.ts`, `games/workroom/dist/`, and compare the hub's fingerprint after the deploy with `make keys-status`.

`rotate`: requires `ensure_synced()`; then runs `pull()` once and refuses (`KeysError`, nothing written or uploaded) when the cache still holds no private key for the current key or for any key in `previous`, because a keyring that dropped one would stop opening the notes sealed to it; reads the passphrase from the current key's item; generates; creates the new item with the same passphrase; retitles the old item `... (previous)`; writes `public.json` with the old current first in `previous`; caches; then uploads `lock_keyring` of the new key followed by the old current and every older retained key, in that order, under the same passphrase. The upload replaces the stored keyring.

`upload_keyring`: `ensure_synced()`, then locks and uploads the same full keyring (current first), for when the first upload could not happen. `public-key.ts` is generated as:

```ts
// The notes key built into the page: written by `siue-music keys init|rotate`
// from music/keys/public.json (a unit test keeps them equal). Not secret.
import type { BuiltInKey } from './seal.ts';

export const PUBLIC_KEY: BuiltInKey | null = {"fingerprint":"<64 hex>","spki":"<base64>"};
export const PREVIOUS_KEYS: readonly BuiltInKey[] = [];
```

Makefile (new targets):

```make
keys-init:
	@$(MUSIC_TOOL) keys init
keys-rotate:
	@$(MUSIC_TOOL) keys rotate
keys-upload:
	@$(MUSIC_TOOL) keys upload
```

The CLI builds the upload from `make_api(paths.api_base(env), keys.api_key("music-publish")).publish_keyring`. `paths.api_base(env)` (`$SIUE_MUSIC_BASE`, else `https://www.cs.siue.edu/~wgrim/music/`) is the one base for every API call the tool makes: the keyring upload here, and pickup and publish in Task 13. `cli.make_api(base: str, key: str) -> Api` is the one place the CLI builds an `Api`.

- [ ] **Step 1: Write the failing tests**

`tests/test_keys_lifecycle.py`:

```python
"""keys-init and keys-rotate: the pair and passphrase go to 1Password first,
the repository gets only public halves, the uploaded keyring opens with the
passphrase and holds the current key and every retained one, rotation keeps
the old keys and the passphrase and never drops one, a note sealed before a
rotation opens with the rotated keyring, and nothing secret reaches argv or
output."""
import base64
import json
import unittest

from support import World, pool_key
from siue_music import sealing
from siue_music.keys import KeyMismatch, KeysError


class LifecycleTest(unittest.TestCase):
    def setUp(self):
        self.w = World(self)
        self.uploads: list[dict] = []

    def item_fields(self):
        return [self.w.op.fields(i["id"]) for i in self.w.op.list_items("siue-music-key")]

    def test_init_saves_uploads_a_keyring_of_one_and_writes_only_public_halves(self):
        fp = self.w.keys.init(self.uploads.append)
        repo = json.loads(self.w.public_json.read_text())
        self.assertEqual(repo["current"]["fingerprint"], fp)
        self.assertEqual(sealing.fingerprint(base64.b64decode(repo["current"]["spki"])), fp)
        [fields] = self.item_fields()
        passphrase, pkcs8 = fields["password"], base64.b64decode(fields["private_key"])
        self.assertGreaterEqual(len(passphrase), 40)
        self.assertEqual(sealing.fingerprint(sealing.spki_of(pkcs8)), fp)
        [locked] = self.uploads
        self.assertEqual((locked["v"], locked["iterations"], set(locked)), (1, 600_000, {"v", "kdf", "iterations", "salt", "iv", "ct"}))
        self.assertEqual(sealing.unlock_keyring(locked, passphrase), {fp: pkcs8}, "the browser's passphrase opens the uploaded keyring of one")
        ts = self.w.public_ts.read_text()
        self.assertIn(fp, ts)
        self.assertNotIn(fields["private_key"][:40], ts + self.w.public_json.read_text())
        for call in self.w.op_calls():
            self.assertFalse(any(passphrase in a or fields["private_key"][:40] in a for a in call))
        self.assertNotIn(passphrase, "\n".join(self.w.out))

    def test_init_refuses_when_a_key_exists_anywhere(self):
        self.w.keys.init(self.uploads.append)
        with self.assertRaises(KeysError):
            self.w.keys.init(self.uploads.append)
        self.w.public_json.unlink()
        with self.assertRaises(KeysError, msg="1Password still holds one"):
            self.w.keys.init(self.uploads.append)
        self.assertEqual((len(self.item_fields()), len(self.uploads)), (1, 1))

    def test_a_failed_upload_keeps_the_keys_and_says_how_to_retry(self):
        def fail(_locked):
            raise OSError("network down")
        fp = self.w.keys.init(fail)
        self.assertIn(fp, self.w.cache.load()["keys"])
        self.assertIn("make keys-upload", "\n".join(self.w.out))
        self.assertEqual(self.w.keys.upload_keyring(self.uploads.append), 1)

    def test_rotate_uploads_the_full_keyring_and_keeps_the_passphrase(self):
        old = self.w.keys.init(self.uploads.append)
        new = self.w.keys.rotate(self.uploads.append)
        repo = json.loads(self.w.public_json.read_text())
        self.assertEqual((repo["current"]["fingerprint"], [p["fingerprint"] for p in repo["previous"]]), (new, [old]))
        fields = self.item_fields()
        self.assertEqual(len({f["password"] for f in fields}), 1, "one passphrase, so every device keeps working")
        titles = sorted(i["title"] for i in self.w.op.list_items("siue-music-key"))
        self.assertTrue(any(t.endswith("(previous)") and old[:16] in t for t in titles))
        ring = self.w.keys.keyring()
        self.assertEqual(list(ring), [new, old], "current first, then the retained key")
        unlocked = sealing.unlock_keyring(self.uploads[-1], fields[0]["password"])
        self.assertEqual(unlocked, ring, "the uploaded keyring is the full keyring, current first")
        self.assertEqual(len(self.uploads), 2, "init uploaded a keyring of one, rotate the full keyring")
        self.assertIn(new, self.w.public_ts.read_text())
        self.assertIn(old, self.w.public_ts.read_text(), "PREVIOUS_KEYS keeps the old public key")

    def test_a_note_sealed_before_a_rotation_opens_with_the_rotated_keyring(self):
        old = self.w.keys.init(self.uploads.append)
        note = sealing.seal({"v": 1, "kind": "text", "text": "before the rotation"}, b"", sealing.spki_of(self.w.keys.keyring()[old]))
        new = self.w.keys.rotate(self.uploads.append)
        passphrase = self.item_fields()[0]["password"]
        for ring in (self.w.keys.ensure_synced(), sealing.unlock_keyring(self.uploads[-1], passphrase)):
            self.assertEqual(sealing.open_bundle(note, ring).body["text"], "before the rotation")
        after = sealing.seal({"v": 1, "kind": "text", "text": "after"}, b"", sealing.spki_of(self.w.keys.keyring()[new]))
        self.assertEqual(sealing.open_bundle(after, sealing.unlock_keyring(self.uploads[-1], passphrase)).body["text"], "after")

    def test_rotate_never_drops_a_retained_key(self):
        old = self.w.keys.init(self.uploads.append)
        self.w.keys.rotate(self.uploads.append)
        count = len(self.uploads)
        for item in self.w.op.list_items("siue-music-key"):
            if old[:16] in item["title"]:
                self.w.op.archive(item["id"])
        data = self.w.cache.load()
        del data["keys"][old]
        self.w.cache.save(data)
        with self.assertRaises(KeysError):
            self.w.keys.rotate(self.uploads.append)
        self.assertEqual(len(self.uploads), count, "nothing was uploaded")
        self.assertEqual(len(self.item_fields()), 1, "no new item was made")

    def test_rotate_refuses_on_a_mismatched_key(self):
        self.w.add_key_to_op(0)
        orphan, _, _ = pool_key(1)
        self.w.write_repo(orphan)  # the repository names a key that 1Password never held
        with self.assertRaises(KeyMismatch):
            self.w.keys.rotate(self.uploads.append)
        self.assertEqual(self.uploads, [], "nothing was uploaded")
        self.assertEqual(len(self.item_fields()), 1, "no new item was made")
        self.assertEqual(json.loads(self.w.public_json.read_text())["current"]["fingerprint"], orphan, "public.json is untouched")


if __name__ == "__main__":
    unittest.main()
```

`tests/test_api.py`:

```python
"""The tool's side of the wire formats: the draft body is exactly the SIUED1
bundle the server parses, the request declares its length, a body past the
server's 8 MB is refused before it is sent, and plain HTTP is refused."""
import struct
import tempfile
import unittest
from pathlib import Path

import support  # noqa: F401  (puts siue_music on the path)
from siue_music.api import MAX_REQUEST_BYTES, Api, ApiError, draft_container, draft_size


class FakeResponse:
    status = 201

    def __init__(self, body=b'{"piece":"p","version":1}'):
        self.body = body

    def read(self):
        return self.body

    def __enter__(self):
        return self

    def __exit__(self, *_):
        return False


class ApiTest(unittest.TestCase):
    def setUp(self):
        tmp = tempfile.TemporaryDirectory()
        self.addCleanup(tmp.cleanup)
        self.dir = Path(tmp.name)

    def files(self, **sizes):
        out = {}
        for name, size in sizes.items():
            path = self.dir / name.replace("_", ".")
            path.write_bytes(b"x" * size)
            out[name.replace("_", ".")] = path
        return out

    def test_the_container_has_the_documented_layout(self):
        files = self.files(score_json=5, audio_webm=3)
        body = draft_container(files)
        self.assertEqual(body[:7], b"SIUED1" + bytes([2]))
        self.assertEqual(body[7:7 + 1 + 10 + 4 + 5], bytes([10]) + b"score.json" + struct.pack(">I", 5) + b"xxxxx")
        self.assertEqual(len(body), draft_size(files))

    def test_the_request_declares_its_length_and_carries_the_piece_and_version(self):
        seen = {}

        def opener(request, timeout=None):
            seen["url"], seen["headers"], seen["data"], seen["method"] = request.full_url, dict(request.header_items()), request.data, request.get_method()
            return FakeResponse()

        files = self.files(score_json=5, audio_webm=3)
        Api("https://example.test/~wgrim/music/", "k" * 64, opener).publish_draft("ch1-labyrinth", 3, files)
        self.assertEqual(seen["url"], "https://example.test/~wgrim/music/api/drafts.php?piece=ch1-labyrinth&version=3")
        self.assertEqual((seen["method"], seen["headers"]["Content-type"]), ("POST", "application/octet-stream"))
        self.assertEqual(seen["headers"]["Content-length"], str(len(seen["data"])))
        self.assertEqual(seen["data"], draft_container(files))
        self.assertEqual(seen["headers"]["Authorization"], "Bearer " + "k" * 64)

    def test_a_body_past_the_servers_limit_is_never_sent(self):
        sent = []
        files = self.files(audio_webm=MAX_REQUEST_BYTES)
        with self.assertRaises(ApiError):
            Api("https://example.test/music/", "k" * 64, lambda *a, **k: sent.append(a)).publish_draft("p", 1, files)
        self.assertEqual(sent, [])

    def test_a_body_of_exactly_the_limit_is_sent(self):
        files = self.files(score_json=1, audio_webm=1)
        overhead = draft_size(files) - 2
        files = self.files(score_json=1, audio_webm=MAX_REQUEST_BYTES - overhead - 1)
        self.assertEqual(draft_size(files), MAX_REQUEST_BYTES)
        sent = []
        Api("https://example.test/music/", "k" * 64, lambda r, timeout=None: (sent.append(r), FakeResponse())[1]).publish_draft("p", 1, files)
        self.assertEqual(len(sent), 1)

    def test_plain_http_is_refused_except_for_localhost(self):
        with self.assertRaises(ApiError):
            Api("http://www.cs.siue.edu/~wgrim/music/", "k" * 64)
        Api("http://localhost:5555/music/", "k" * 64)
        Api("http://127.0.0.1/music/", "k" * 64)


if __name__ == "__main__":
    unittest.main()
```

Append to `games/workroom/test/unlock.test.ts`:

```ts
test('a keyring Python locked unlocks in the browser, current key first', async () => {
  const { readFileSync } = await import('node:fs');
  const locked = JSON.parse(readFileSync(new URL('./fixtures/keyring-by-python.json', import.meta.url), 'utf8')) as typeof fx.keyring;
  const ring = await unlockKeyring(locked, fx.passphrase, [builtIn, otherKey]);
  assert.deepEqual([...ring.keys()], [fx.fingerprint, fx.other.fingerprint]);
  for (const key of ring.values()) assert.equal(key.extractable, false);
});
```

- [ ] **Step 2: Run to see them fail** — `make music-tools-test` — FAIL (`Keys.init` missing); `node --test games/workroom/test/unlock.test.ts` — FAIL (fixture missing).

- [ ] **Step 3: Write the parity fixture maker** (`tests/make_fixture.py`) and run it once (`$(MUSIC_PY) music/tools/tests/make_fixture.py`):

```python
"""Writes games/workroom/test/fixtures/keyring-by-python.json: the TEST keys
from test-key.json (current, then the earlier one) locked in one keyring by
Python, so the page's tests prove they unlock what the tool uploads. Rerun only
after tools/make-fixtures.ts replaces the test keys."""
import base64
import json

from support import FIXTURES
from siue_music import sealing

fx = json.loads((FIXTURES / "test-key.json").read_text())
keys = {fx["fingerprint"]: base64.b64decode(fx["pkcs8"]), fx["other"]["fingerprint"]: base64.b64decode(fx["other"]["pkcs8"])}
locked = sealing.lock_keyring(keys, fx["passphrase"])
(FIXTURES / "keyring-by-python.json").write_text(json.dumps(locked, indent=2) + "\n")
print("wrote keyring-by-python.json")
```

- [ ] **Step 4: Implement** `init`, `rotate`, `upload_keyring`, `keyring`, `api.py` (urllib with `Authorization: Bearer`, a 30 s timeout; the base must be `https://`, or `http://localhost[:port]/` / `http://127.0.0.1[:port]/`, else `ApiError`; a non-2xx status raises `ApiError` with the JSON `error`; `publish_draft` raises `ApiError` before connecting when `draft_size` exceeds `MAX_REQUEST_BYTES`, and sends `Content-Type: application/octet-stream` with `Content-Length` set explicitly to the body's length; `draft_container` writes the entries in the mapping's order) and the CLI verbs. In `MusicDeployTest::testShipsThePagesApiAndLibrary`, add: `if (is_file(dirname(__DIR__, 2) . '/music/keys/public.json')) self::assertContains('music/keys/public.json', $list);`.

- [ ] **Step 5: Run the tests** — `make music-tools-test` — PASS; `node --test games/workroom/test/unlock.test.ts` — PASS; `vendor/bin/phpunit tests/php/MusicDeployTest.php` — PASS.

- [ ] **Step 6: Commit**

```bash
git add websites/www.cs/music/tools websites/www.cs/Makefile websites/www.cs/games/workroom/test websites/www.cs/tests/php/MusicDeployTest.php websites/www.cs/music/README.md
git commit -m "Music workroom: keys-init, keys-rotate and keys-upload through 1Password

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb"
```

### Task 13: Pickup (verify, open, save, then mark), speech and humming, and publish

**Files:**
- Create: `music/tools/siue_music/pickup.py`, `answering.py`, `publish.py`, `score.py`
- Create: `music/tools/tests/test_pickup.py`, `tests/test_answering.py`, `tests/test_publish.py`
- Modify: `music/tools/siue_music/cli.py` (`pickup`, `publish`), `websites/www.cs/Makefile` (`music-pickup`, `music-publish`), `music/README.md`

**Interfaces:**
- Consumes: `Api`, `Keys.ensure_synced`, `Keys.api_key`, `sealing.open_bundle`, `paths.notes_dir/check_outside`, the score schema.
- Produces:

```python
# siue_music/answering.py
class MissingDependency(Exception): ...    # message names the package and the install command
INSTALL = "pip install -r music/tools/requirements-answering.txt (and brew install ffmpeg)"
def to_wav(src: Path, dst: Path, rate: int = 16_000) -> Path      # ffmpeg -i src -ac 1 -ar rate dst; a .wav src is used as it is
def transcribe(audio: Path, model_factory: Callable[[], Any] | None = None) -> str   # faster-whisper "small.en" unless SIUE_MUSIC_WHISPER_MODEL
def f0_to_notes(f0: Sequence[float | None], hop_seconds: float, min_seconds: float = 0.08) -> list[tuple[int, float, float]]  # (midi, start, length)
def hum_to_midi(audio: Path, out: Path) -> int                    # librosa.pyin + f0_to_notes + mido; returns the note count
@dataclass class Steps: transcribe: Callable[[Path], str]; hum_to_midi: Callable[[Path, Path], int]
def default_steps() -> Steps

# siue_music/pickup.py
@dataclass class Report: picked: list[str]; left: dict[str, str]; notices: list[str]
def pickup(api, keyring: Mapping[str, bytes], notes: Path, repo: Path, steps: Steps) -> Report

# siue_music/score.py
def glossary_ids(path: Path) -> frozenset[str]   # the term ids in games/workroom/src/glossary.json, the page's one glossary source
def validate(obj: object, glossary_ids: frozenset[str]) -> list[str]   # the same rules and path names as the page's parseScore, including glossary[].term

# siue_music/publish.py
# `from .api import MAX_REQUEST_BYTES, draft_size` (module-level in api.py); the `api` parameter below is only an object with publish_draft.
class PublishError(Exception): ...
def latest_version(piece_dir: Path) -> int
def publish(piece: str, version: int | None, pieces: Path, api, glossary_ids: frozenset[str]) -> int
```

Pickup, for each waiting note in arrival order: download; `len == size` and `sha256 == listed` (else left: `download did not match its hash; left waiting`); open with the keyring (else left: `could not open (<reason>); left waiting`); write `<notes>/<YYYY-MM-DD of arrival, UTC>-<id>/` through a `.partial` folder renamed into place: `note.json` (`{"id", "arrived_at", "fingerprint", "body"}`), `audio.<webm|m4a|ogg>` when there is audio; then the optional steps (`speech` → `transcript.txt`, `hum` → `motif.mid`); a `MissingDependency` adds its message to `notices` once; any other step error adds `could not transcribe <id>: <error>` and does not stop the mark, since the opened note is safely on disk; then `mark_picked_up`. `check_outside(notes, repo)` runs before the first request.

- [ ] **Step 1: Write the failing tests**

`tests/test_pickup.py`:

```python
"""Pickup verifies the download's hash and opens the note before marking it;
a corrupt download or a note that will not open stays waiting; opened notes
land outside the repository; a key mismatch never reaches the server."""
import contextlib
import hashlib
import io
import json
import sys
import tempfile
import unittest
from pathlib import Path
from unittest import mock

from support import SITE, World, pool_key
from siue_music import cli, sealing
from siue_music.answering import MissingDependency, Steps
from siue_music.paths import NotesInsideRepo
from siue_music.pickup import pickup

A, B = "a" * 32, "b" * 32


class FakeApi:
    def __init__(self, notes: dict[str, bytes], corrupt: frozenset[str] = frozenset()):
        self.notes, self.corrupt, self.calls, self.marked = notes, corrupt, [], []

    def waiting(self):
        self.calls.append("list")
        return [{"id": i, "size": len(b), "sha256": hashlib.sha256(b).hexdigest(), "arrived_at": 1_800_000_000} for i, b in self.notes.items()]

    def note(self, note_id):
        self.calls.append(f"get {note_id}")
        b = self.notes[note_id]
        return b[:-1] + bytes([b[-1] ^ 1]) if note_id in self.corrupt else b

    def mark_picked_up(self, note_id):
        self.calls.append(f"mark {note_id}")
        self.marked.append(note_id)


def missing(*_):
    raise MissingDependency("speech-to-text needs faster-whisper: pip install -r music/tools/requirements-answering.txt")


class PickupTest(unittest.TestCase):
    def setUp(self):
        tmp = tempfile.TemporaryDirectory()
        self.addCleanup(tmp.cleanup)
        self.notes = Path(tmp.name) / "notes"
        self.repo = SITE.parents[1]
        self.fp, self.pkcs8, self.spki = pool_key(0)
        self.ring = {self.fp: self.pkcs8}
        self.steps = Steps(transcribe=missing, hum_to_midi=missing)

    def sealed(self, text, kind="text", audio=b"", spki=None):
        body = {"v": 1, "kind": kind, "piece": "test-piece", "draft": 1, "from": 8, "to": 12, "fromBar": 5, "toBar": 6,
                "lane": "brass", "text": text, "reaction": None, "curve": None,
                "audio": {"mime": "audio/webm", "seconds": 1} if audio else None, "made": "2027-01-15T08:00:00.000Z"}
        return sealing.seal(body, audio, spki or self.spki)

    def test_verified_opened_saved_then_marked(self):
        api = FakeApi({A: self.sealed("louder here")})
        report = pickup(api, self.ring, self.notes, self.repo, self.steps)
        self.assertEqual((report.picked, api.marked), ([A], [A]))
        self.assertLess(api.calls.index(f"get {A}"), api.calls.index(f"mark {A}"))
        saved = json.loads((self.notes / f"2027-01-15-{A}" / "note.json").read_text())
        self.assertEqual((saved["body"]["text"], saved["fingerprint"]), ("louder here", self.fp))

    def test_a_corrupt_download_is_not_marked(self):
        api = FakeApi({A: self.sealed("x")}, corrupt=frozenset({A}))
        report = pickup(api, self.ring, self.notes, self.repo, self.steps)
        self.assertEqual(api.marked, [])
        self.assertIn("did not match its hash", report.left[A])
        self.assertFalse(any(self.notes.glob(f"*{A}*")))

    def test_a_note_that_will_not_open_is_not_marked(self):
        _, _, other_spki = pool_key(1)
        api = FakeApi({A: self.sealed("x", spki=other_spki)})
        report = pickup(api, self.ring, self.notes, self.repo, self.steps)
        self.assertEqual(api.marked, [])
        self.assertIn("could not open (unknown-key)", report.left[A])

    def test_one_bad_note_does_not_stop_the_rest(self):
        api = FakeApi({A: self.sealed("bad"), B: self.sealed("good")}, corrupt=frozenset({A}))
        self.assertEqual(pickup(api, self.ring, self.notes, self.repo, self.steps).picked, [B])
        self.assertEqual(api.marked, [B])

    def test_notes_inside_the_repository_are_refused_before_any_request(self):
        api = FakeApi({A: self.sealed("x")})
        with self.assertRaises(NotesInsideRepo):
            pickup(api, self.ring, self.repo / "notes", self.repo, self.steps)
        self.assertEqual(api.calls, [])

    def test_audio_is_saved_and_a_missing_step_is_a_notice_not_a_failure(self):
        api = FakeApi({A: self.sealed(None, kind="speech", audio=b"\x1aE\xdf\xa3" + b"0" * 100)})
        report = pickup(api, self.ring, self.notes, self.repo, self.steps)
        self.assertEqual(api.marked, [A])
        self.assertTrue((self.notes / f"2027-01-15-{A}" / "audio.webm").exists())
        self.assertEqual(len([n for n in report.notices if "pip install" in n]), 1)


class RotationTest(unittest.TestCase):
    def test_a_note_sealed_before_a_rotation_is_picked_up_with_the_rotated_keyring(self):
        w = World(self)
        uploads: list[dict] = []
        old = w.keys.init(uploads.append)
        old_spki = sealing.spki_of(w.keys.keyring()[old])
        w.keys.rotate(uploads.append)
        body = {"v": 1, "kind": "text", "piece": "test-piece", "draft": 1, "from": 0, "to": 1, "fromBar": 1, "toBar": 1, "lane": None,
                "text": "sealed before the rotation", "reaction": None, "curve": None, "audio": None, "made": "2027-01-15T08:00:00.000Z"}
        api = FakeApi({A: sealing.seal(body, b"", old_spki)})
        with tempfile.TemporaryDirectory() as d:
            notes = Path(d) / "notes"
            report = pickup(api, w.keys.ensure_synced(), notes, SITE.parents[1], Steps(transcribe=missing, hum_to_midi=missing))
            self.assertEqual((report.picked, api.marked), ([A], [A]))
            saved = json.loads((notes / f"2027-01-15-{A}" / "note.json").read_text())
        self.assertEqual((saved["body"]["text"], saved["fingerprint"]), ("sealed before the rotation", old))


class MismatchNeverReachesTheServer(unittest.TestCase):
    def env(self, w: World) -> dict[str, str]:
        # Every location the CLI reads comes from this env, so the test never touches the owner's repository, cache or 1Password.
        return {"OP_VAULT": "SIUE", "SIUE_MUSIC_PUBLIC_KEYS": str(w.public_json), "SIUE_MUSIC_PUBLIC_KEY_TS": str(w.public_ts),
                "SIUE_CONFIG_DIR": str(w.root / "config" / "siue"), "SIUE_MUSIC_BASE": "https://example.test/music/",
                "SIUE_OP": f"{sys.executable} {Path(__file__).parent / 'fake_op.py'}",
                "FAKE_OP_LOG": str(w.log), "FAKE_OP_STORE": str(w.root / "op.json")}

    def run_pickup(self, w: World) -> tuple[int, list, str]:
        opened, err = [], io.StringIO()
        with mock.patch("siue_music.cli.make_api", side_effect=lambda *a: opened.append(a)), contextlib.redirect_stderr(err):
            code = cli.main(["pickup"], env=self.env(w))
        return code, opened, err.getvalue()

    def test_a_repository_key_1password_lacks_stops_with_exit_3(self):
        w = World(self)
        orphan, _, _ = pool_key(1)
        w.write_repo(orphan)
        code, opened, err = self.run_pickup(w)
        self.assertEqual((code, opened), (3, []))
        self.assertIn("has no private key for the repository's public key", err, "the mismatch, not merely 'no key yet'")
        self.assertIn(orphan[:4], err)

    def test_a_key_1password_holds_that_the_repository_lacks_stops_with_exit_3(self):
        w = World(self)
        w.add_key_to_op(0)
        orphan, _, _ = pool_key(1)
        w.write_repo(orphan)
        code, opened, err = self.run_pickup(w)
        self.assertEqual((code, opened), (3, []))
        self.assertIn("git pull", err)

    def test_the_base_comes_from_the_env_for_pickup(self):
        w = World(self)
        fp = w.add_key_to_op(0)
        w.write_repo(fp)
        w.keys.api_key_set("music-pickup", "c" * 64)
        w.keys.pull()
        bases = []
        class Quiet:
            def waiting(self): return []
        with mock.patch("siue_music.cli.make_api", side_effect=lambda base, key: (bases.append((base, key)), Quiet())[1]), contextlib.redirect_stdout(io.StringIO()):
            code = cli.main(["pickup"], env={**self.env(w), "SIUE_MUSIC_NOTES_DIR": str(w.root / "notes")})
        self.assertEqual((code, bases), (0, [("https://example.test/music/", "c" * 64)]))


if __name__ == "__main__":
    unittest.main()
```

`cli.make_api(base: str, key: str) -> Api` is the one place the CLI builds an `Api`, so this test can prove it is never reached; `SIUE_OP` is split with `shlex.split`.

`tests/test_answering.py`:

```python
"""Speech and humming are optional: missing packages give one clear message;
the pitch-track-to-notes step is exact on a small fixture; with the packages
installed, a synthetic two-note hum (two tones with a 100 ms silence between)
becomes a two-note MIDI motif, each note within a semitone of what was played."""
import importlib.util
import shutil
import sys
import tempfile
import unittest
from pathlib import Path
from unittest import mock

import support  # noqa: F401  (puts siue_music on the path)
from siue_music.answering import MissingDependency, f0_to_notes, hum_to_midi, transcribe

HAVE_HUM = all(importlib.util.find_spec(m) for m in ("librosa", "mido", "numpy", "soundfile"))
HAVE_SPEECH = importlib.util.find_spec("faster_whisper") is not None and shutil.which("ffmpeg") and shutil.which("say")


class PitchTrackTest(unittest.TestCase):
    def test_frames_become_notes_and_blips_are_dropped(self):
        f0 = [440.0] * 10 + [None] * 2 + [493.88] * 10 + [261.63]
        notes = [(m, round(s, 3), round(d, 3)) for m, s, d in f0_to_notes(f0, 0.01)]
        self.assertEqual(notes, [(69, 0.0, 0.1), (71, 0.12, 0.1)])

    def test_nan_is_unvoiced(self):
        self.assertEqual(f0_to_notes([float("nan")] * 20, 0.01), [])


class MissingPackagesTest(unittest.TestCase):
    def test_speech_without_whisper(self):
        with mock.patch.dict(sys.modules, {"faster_whisper": None}):
            with self.assertRaises(MissingDependency) as e:
                transcribe(Path("x.wav"))
        self.assertIn("pip install -r music/tools/requirements-answering.txt", str(e.exception))

    def test_humming_without_librosa(self):
        with mock.patch.dict(sys.modules, {"librosa": None}):
            with self.assertRaises(MissingDependency) as e:
                hum_to_midi(Path("x.wav"), Path("y.mid"))
        self.assertIn("librosa", str(e.exception))

    def test_transcribe_joins_the_model_segments(self):
        class Seg:
            def __init__(self, text): self.text = text
        class Model:
            def transcribe(self, path, **kw): return iter([Seg(" louder at"), Seg(" bar thirty three ")]), None
        with tempfile.TemporaryDirectory() as d:
            wav = Path(d) / "a.wav"
            wav.write_bytes(b"RIFF")
            self.assertEqual(transcribe(wav, model_factory=Model), "louder at bar thirty three")


@unittest.skipUnless(HAVE_HUM, "humming needs " + "librosa, mido, numpy, soundfile")
class HumFixtureTest(unittest.TestCase):
    def test_a_two_note_hum_becomes_a_two_note_motif(self):
        import mido
        import numpy as np
        import soundfile
        rate = 16_000
        t = np.arange(int(rate * 0.5)) / rate
        gap = np.zeros(int(rate * 0.1))  # 100 ms of silence, so pyin hears two notes and not a glide across a splice
        tone = np.concatenate([np.sin(2 * np.pi * 440 * t), gap, np.sin(2 * np.pi * 493.88 * t)]) * 0.5
        with tempfile.TemporaryDirectory() as d:
            wav, mid = Path(d) / "hum.wav", Path(d) / "hum.mid"
            soundfile.write(wav, tone, rate)
            self.assertEqual(hum_to_midi(wav, mid), 2)
            pitches = [m.note for m in mido.MidiFile(mid).tracks[0] if m.type == "note_on" and m.velocity > 0]
            self.assertEqual(len(pitches), 2)
            for got, want in zip(pitches, (69, 71)):  # A4 and B4, each within a semitone: pitch tracking is not exact
                self.assertLessEqual(abs(got - want), 1, (pitches, want))


@unittest.skipUnless(HAVE_SPEECH, "speech needs faster-whisper, ffmpeg and macOS say")
class SpeechFixtureTest(unittest.TestCase):
    def test_a_spoken_sentence_is_transcribed(self):
        import subprocess
        with tempfile.TemporaryDirectory() as d:
            aiff = Path(d) / "s.aiff"
            subprocess.run(["say", "-o", str(aiff), "make the horns louder"], check=True)
            self.assertIn("louder", transcribe(aiff).lower())


if __name__ == "__main__":
    unittest.main()
```

`tests/test_publish.py`:

```python
"""Publish validates score.json with the same rules as the page and sends only
a complete, valid draft (music with its MusicXML, a sound effect without);
the newest version is the default."""
import json
import shutil
import tempfile
import unittest
from pathlib import Path

from support import FIXTURES, GLOSSARY_JSON
from siue_music.publish import PublishError, latest_version, publish
from siue_music.score import glossary_ids, validate


class FakeApi:
    def __init__(self):
        self.sent = []

    def publish_draft(self, piece, version, files):
        self.sent.append((piece, version, sorted(files)))


class PublishTest(unittest.TestCase):
    def setUp(self):
        tmp = tempfile.TemporaryDirectory()
        self.addCleanup(tmp.cleanup)
        self.pieces = Path(tmp.name)
        self.v1 = self.pieces / "test-piece" / "v1"
        shutil.copytree(FIXTURES / "draft", self.v1)
        self.api = FakeApi()
        self.ids = glossary_ids(GLOSSARY_JSON)

    def test_publishes_the_newest_valid_draft(self):
        v2 = self.pieces / "test-piece" / "v2"
        shutil.copytree(self.v1, v2)
        score = json.loads((v2 / "score.json").read_text())
        (v2 / "score.json").write_text(json.dumps({**score, "draft": 2}))
        self.assertEqual(latest_version(self.pieces / "test-piece"), 2)
        self.assertEqual(publish("test-piece", None, self.pieces, self.api, self.ids), 2)
        self.assertEqual(self.api.sent, [("test-piece", 2, ["audio.webm", "score.json", "score.musicxml", "spectrogram.png"])])

    def test_an_invalid_score_never_leaves_the_computer(self):
        score = json.loads((self.v1 / "score.json").read_text())
        score["sections"][1]["from_bar"] = 6
        (self.v1 / "score.json").write_text(json.dumps(score))
        with self.assertRaises(PublishError) as e:
            publish("test-piece", 1, self.pieces, self.api, self.ids)
        self.assertIn("sections[1].from_bar", str(e.exception))
        self.assertEqual(self.api.sent, [])

    def test_a_term_the_page_does_not_know_never_leaves_the_computer(self):
        score = json.loads((self.v1 / "score.json").read_text())
        score["glossary"][0]["term"] = "flibbertigibbet"
        (self.v1 / "score.json").write_text(json.dumps(score))
        with self.assertRaises(PublishError) as e:
            publish("test-piece", 1, self.pieces, self.api, self.ids)
        self.assertIn("glossary[0].term", str(e.exception))
        self.assertEqual(self.api.sent, [])

    def test_a_draft_past_the_servers_8_mb_never_leaves_the_computer(self):
        (self.v1 / "audio.webm").write_bytes(b"\x1a\x45\xdf\xa3" + b"0" * 8_388_608)
        with self.assertRaises(PublishError) as e:
            publish("test-piece", 1, self.pieces, self.api, self.ids)
        self.assertIn("8 MB", str(e.exception))
        self.assertEqual(self.api.sent, [])

    def test_a_draft_without_audio_is_refused(self):
        (self.v1 / "audio.webm").unlink()
        with self.assertRaises(PublishError):
            publish("test-piece", 1, self.pieces, self.api, self.ids)

    def test_a_sound_effect_publishes_without_musicxml(self):
        shutil.copytree(FIXTURES / "draft-sound", self.pieces / "cannon-fire" / "v1")
        self.assertEqual(publish("cannon-fire", None, self.pieces, self.api, self.ids), 1)
        self.assertEqual(self.api.sent, [("cannon-fire", 1, ["audio.webm", "score.json", "spectrogram.png"])])

    def test_music_without_musicxml_never_leaves_the_computer(self):
        (self.v1 / "score.musicxml").unlink()
        with self.assertRaises(PublishError) as e:
            publish("test-piece", 1, self.pieces, self.api, self.ids)
        self.assertIn("score.musicxml", str(e.exception))
        self.assertEqual(self.api.sent, [])

    def test_a_sound_effect_with_bars_never_leaves_the_computer(self):
        sound = self.pieces / "cannon-fire" / "v1"
        shutil.copytree(FIXTURES / "draft-sound", sound)
        score = json.loads((sound / "score.json").read_text())
        score["bars"] = 8
        (sound / "score.json").write_text(json.dumps(score))
        with self.assertRaises(PublishError) as e:
            publish("cannon-fire", 1, self.pieces, self.api, self.ids)
        self.assertIn("bars", str(e.exception))
        self.assertEqual(self.api.sent, [])

    def test_python_and_the_page_name_the_same_paths(self):
        base = json.loads((FIXTURES / "score-v1.json").read_text())
        self.assertEqual(validate(base, self.ids), [])
        cases = [
            (lambda s: s["piece"].__setitem__("id", "Bad Id"), "piece.id"),
            (lambda s: s["sections"][1].__setitem__("to_bar", 7), "sections[1].to_bar"),
            (lambda s: s.__setitem__("kind", "noise"), "kind"),
            (lambda s: s["project"].__setitem__("id", "Not An Id"), "project.id"),
            (lambda s: s["project"].__setitem__("name", ""), "project.name"),
            (lambda s: s["characters"][0].__setitem__("color", "gold"), "characters[0].color"),
            (lambda s: s["characters"][1].__setitem__("id", "ariadne"), "characters[1].id"),
            (lambda s: s["motifs"][0].__setitem__("character", "nobody"), "motifs[0].character"),
            (lambda s: s.pop("musicxml"), "musicxml"),
            (lambda s: s.pop("bars"), "bars"),
            (lambda s: s["notes"][0].__setitem__("lane", "violas"), "notes[0].lane"),
            (lambda s: s["energy"][1].__setitem__(1, 1.5), "energy[1]"),
            (lambda s: s["glossary"][0].__setitem__("term", "flibbertigibbet"), "glossary[0].term"),
            (lambda s: s.__setitem__("schema", 2), "schema"),
        ]
        for change, path in cases:
            s = json.loads(json.dumps(base))
            change(s)
            errors = validate(s, self.ids)
            self.assertTrue(errors and path in errors[0], (path, errors))

    def test_python_and_the_page_name_the_same_sound_paths(self):
        base = json.loads((FIXTURES / "score-sound-v1.json").read_text())
        self.assertEqual(validate(base, self.ids), [])
        with_xml = json.loads(json.dumps(base))
        with_xml["musicxml"] = "score.musicxml"
        self.assertEqual(validate(with_xml, self.ids), [], "a sound piece may carry MusicXML")
        no_moments = json.loads(json.dumps(base))
        no_moments["sections"] = []
        self.assertEqual(validate(no_moments, self.ids), [], "sections are optional for a sound piece")
        cases = [
            (lambda s: s.__setitem__("bars", 8), "bars"),
            (lambda s: s.__setitem__("tempo", [{"bar": 1, "bpm": 120, "beats": 4, "unit": 4}]), "tempo"),
            (lambda s: s.__setitem__("duration", 0.04), "duration"),
            (lambda s: s["sections"][0].__setitem__("from_bar", 1), "sections[0]"),
            (lambda s: s["sections"][1].__setitem__("from", 0.05), "sections[1].from"),
            (lambda s: s["sections"][1].__setitem__("to", 0.5), "sections[1].to"),
            (lambda s: s["changes"][0].__setitem__("to", 0.5), "changes[0].to"),
            (lambda s: s["lanes"][0].__setitem__("family", "kazoo"), "lanes[0].family"),
            (lambda s: s["project"].__setitem__("id", "Bad Id"), "project.id"),
        ]
        for change, path in cases:
            s = json.loads(json.dumps(base))
            change(s)
            errors = validate(s, self.ids)
            self.assertTrue(errors and path in errors[0], (path, errors))

    def test_either_kind_may_use_any_lane_family(self):
        music = json.loads((FIXTURES / "score-v1.json").read_text())
        music["lanes"][0].update(family="impact", icon="impact")
        self.assertEqual(validate(music, self.ids), [])
        sound = json.loads((FIXTURES / "score-sound-v1.json").read_text())
        sound["lanes"][1].update(family="strings", icon="strings")
        self.assertEqual(validate(sound, self.ids), [])


if __name__ == "__main__":
    unittest.main()
```

Makefile (new targets):

```make
music-pickup:
	@$(MUSIC_TOOL) pickup
music-publish:
	@test -n "$(PIECE)" || { echo "usage: make music-publish PIECE=ch1-labyrinth [VERSION=3]" >&2; exit 1; }
	@$(MUSIC_TOOL) publish "$(PIECE)" $(if $(VERSION),--version $(VERSION))
```

Both run `ensure_synced()` first (exit 3 on a mismatch, before any request), and both build their `Api` with `make_api(paths.api_base(env), key)`, so `SIUE_MUSIC_BASE` redirects pickup and publish exactly as it does the keyring upload. `pickup` then uses the `music-pickup` API key and prints `Picked up N notes into <dir>.`, each left note with its reason, and each notice; `publish` uses `music-publish` and prints `Published <piece> v<N>.`.

- [ ] **Step 2: Run to see them fail** — `make music-tools-test` — FAIL (modules missing).

- [ ] **Step 3: Implement.** `f0_to_notes`: a frame is voiced when it is a finite number > 0; MIDI = `round(69 + 12 * log2(f / 440))`; consecutive voiced frames with the same MIDI number form one note starting at `index * hop`; notes shorter than `min_seconds` are dropped. `hum_to_midi`: `to_wav`, `librosa.load(wav, sr=16000)`, `librosa.pyin(y, fmin=librosa.note_to_hz('C2'), fmax=librosa.note_to_hz('C6'), sr=16000, frame_length=1024, hop_length=160)`, `f0_to_notes(f0, 160 / 16000)`, then a one-track `mido.MidiFile` at 480 ticks per beat and 60 bpm (one beat a second) with `note_on`/`note_off` per note. Each optional import sits inside its function in `try: ... except ImportError: raise MissingDependency(f"... needs <package>: {INSTALL}")`; `shutil.which('ffmpeg') is None` raises `MissingDependency` too. `score.validate(obj, glossary_ids)` follows the schema table rule by rule, in the same order as `parseScore` (schema, kind, project, piece, draft, made, duration, then `bars` and `tempo`, which a music score requires and a sound score refuses, then sections, lanes, characters, motifs, notes, energy, glossary, audio, spectrogram, `musicxml` (required for music, optional for sound), changes), with the same path spellings, including `glossary[i].term` against `glossary_ids` and `motifs[i].character` against the score's own `characters`; `score.glossary_ids(path)` reads `games/workroom/src/glossary.json` (`{"terms": [{"id": ...}]}`), the same file the page's `glossary.ts` imports, so the tool and the page cannot disagree about which terms exist. `publish.publish(piece, version, pieces, api, glossary_ids)` validates `score.json` with those ids (the first error becomes a `PublishError` naming its path), sends the draft's files that exist among `score.json`, `score.musicxml`, `audio.webm`, `audio.m4a` and `spectrogram.png` (a music draft with no `score.musicxml` is a `PublishError` naming it; a sound draft needs none) and raises `PublishError("... is over the server's 8 MB limit for one draft")` before any request when the module function `draft_size(files)` (imported with `from .api import MAX_REQUEST_BYTES, draft_size`) is over `MAX_REQUEST_BYTES`, so the server's 413 is the backstop, not the first answer. The `api` argument is only the object whose `publish_draft` sends the draft; it has neither `draft_size` nor `MAX_REQUEST_BYTES`, which is why the `FakeApi` in `test_publish.py` needs neither. The CLI passes `score.glossary_ids(paths.glossary_path())`.

- [ ] **Step 4: Run the tests** — `make music-tools-test` — PASS (the hum and speech fixture tests run when the optional packages are installed: `music/tools/.venv/bin/pip install -r music/tools/requirements-answering.txt` and `brew install ffmpeg`; run them once that way too and see them pass).

- [ ] **Step 5: Commit**

```bash
git add websites/www.cs/music/tools websites/www.cs/Makefile websites/www.cs/music/README.md
git commit -m "Music workroom: pickup verifies before marking; speech, humming and publish

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb"
```

### Task 14: The answering modules: notes, energy, outbox, page API and history (no page code)

**Files:**
- Create: `games/workroom/src/answer.ts`, `src/energy.ts`, `src/outbox.ts`, `src/api.ts`, `src/history.ts`, `src/recorder.ts`
- Create: `games/workroom/test/answer.test.ts`, `test/energy.test.ts`, `test/outbox.test.ts`, `test/api.test.ts`, `test/history.test.ts`, `test/recorder.test.ts`
- Modify: `games/workroom/tsconfig.json` (`answer.ts`, `energy.ts`, `recorder.ts`), `games/workroom/src/tsconfig.crypto.json` (`api.ts`, `outbox.ts`, `history.ts`: they import `seal.ts`, `unlock.ts` or each other, so the DOM-free program cannot hold them)

**Interfaces:**
- Consumes: `NoteBody`, `Reaction`, `REACTION_IDS` (`note.ts`), `Span`, `TempoMap`, `Section`, `View`, `TIMELINE`, `Fetch` (`load.ts`), `Opened`, `NoteUnreadable`, `LockedKeyring`.
- Produces:

```ts
// src/answer.ts
export const REACTIONS: readonly { id: Reaction; label: string }[]; // More epic, Calmer, Darker, Brighter, Longer, Shorter, Love it, Not this
export const MAX_AUDIO_SECONDS = 60;
export const MAX_TEXT = 4000;
export class NoteTooLong extends Error {}
export interface Context { piece: string; draft: number; now: () => Date }
export function textNote(c: Context, span: Span, text: string): NoteBody;              // trims; empty → Error('Type a note first.')
export function speechNote(c: Context, span: Span, audio: { mime: string; seconds: number }): NoteBody;
export function humNote(c: Context, at: { time: number; bar: number | null; laneId: string | null }, audio: { mime: string; seconds: number }): NoteBody; // bar is null on a sound piece
export function reactNote(c: Context, section: Section, tempo: TempoMap, duration: number, reaction: Reaction): NoteBody; // the section's seconds from sectionTimes; its bars (music) or null (sound)
export function energyNote(c: Context, curve: [number, number][], duration: number, bars: number | null): NoteBody; // bars is score.bars ?? null: fromBar 1 and toBar bars, or both null for a sound piece
/** A section spanning the whole piece (bars 1 to score.bars, or 0 to score.duration seconds), for a reaction when no section is under the playhead: a sound piece may have no sections. */
export function wholePiece(score: Score): Section;
// Every note body carries seconds (from, to); fromBar and toBar are the bars on a music piece and null on a sound piece.

// src/energy.ts
export type Curve = [number, number][];
export function redraw(curve: Curve, stroke: Curve, duration: number): Curve;
export function strokeFromPixels(points: readonly [number, number][], view: View): Curve; // y in the energy band: value = 1 - y / TIMELINE.energyH

// src/outbox.ts
export type KeptReason = 'offline' | 'too_large' | 'full' | 'no_key' | 'bad_header' | 'unknown_key' | 'signed_out';
export interface Pending { key: string; bundle: Uint8Array<ArrayBuffer>; made: string; reason: KeptReason | 'new' }
export interface OutboxStore { all(): Promise<Pending[]>; put(p: Pending): Promise<void>; remove(key: string): Promise<void> }
export function memoryOutbox(): OutboxStore;
export interface FlushReport { sent: { key: string; id: string }[]; kept: { key: string; reason: KeptReason }[] }
export const KEPT_MESSAGES: Readonly<Record<KeptReason, string>>;
export interface Outbox { add(bundle: Uint8Array<ArrayBuffer>, made: string): Promise<FlushReport>; flush(): Promise<FlushReport>; pending(): Promise<Pending[]> }
export function createOutbox(store: OutboxStore, api: Pick<PageApi, 'upload'>, newKey: () => string): Outbox;

// src/api.ts
export class SignedOut extends Error {}
export class NoKeyring extends Error {} // keyring.php answered 404 no_keyring: keys-init has not uploaded one
export interface ServerNote { id: string; size: number; arrived_at: number; picked_up_at: number | null }
export type UploadResult = { kind: 'sent'; id: string } | { kind: 'refused'; reason: Exclude<KeptReason, 'offline' | 'signed_out'> };
export interface PageApi {
  upload(bundle: Uint8Array<ArrayBuffer>): Promise<UploadResult>;
  list(): Promise<ServerNote[]>;
  /** The note's sealed bytes: the one route that answers application/octet-stream. */
  bytes(id: string): Promise<Uint8Array<ArrayBuffer>>;
  remove(id: string): Promise<number>;
  removeAll(): Promise<number>;
  keyring(): Promise<LockedKeyring>; // GET keyring.php → { keyring }
}
/**
 * One POST at a time; each sends the token the previous POST returned; a 403 {"error":"csrf"} refreshes the token from csrf.php once and
 * retries once. Sign-out is read from the status, never from the Content-Type: a redirect (the sign-in page), a 401, or any 403 other than the
 * csrf refusal is SignedOut. Any other non-2xx status is an Error naming the status.
 */
export function createApi(fetch: Fetch, csrf: string): PageApi;

// src/history.ts
export interface HistoryItem { id: string; arrived: number; pickedUp: number | null; state: 'waiting' | 'picked-up'; opened: Opened | null; problem: string | null }
export function buildHistory(server: readonly ServerNote[], opened: ReadonlyMap<string, Opened | NoteUnreadable>): HistoryItem[]; // newest first
export function waitingByPiece(items: readonly HistoryItem[]): Map<string, number>;
export function forPiece(items: readonly HistoryItem[], piece: string): HistoryItem[];

// src/recorder.ts
export const MIME_PREFERENCE: readonly string[]; // 'audio/webm;codecs=opus', 'audio/mp4', 'audio/ogg;codecs=opus'
export function pickMime(isSupported: (mime: string) => boolean): string | null;
export interface Timers { setTimeout(f: () => void, ms: number): number; clearTimeout(id: number): void }
/** Calls stop after MAX_AUDIO_SECONDS; returns a cancel function. */
export function stopAfterLimit(timers: Timers, stop: () => void): () => void;
```

`KEPT_MESSAGES`: `offline`: "No connection: this note is kept on this device and will be sent when you are back online."; `too_large`: "This note is over 2 MB, so it stays on this device. Record a shorter one."; `full`: "The workroom holds 2,000 notes. Delete some old ones, then this note will be sent."; `no_key`: "The workroom has no notes key yet, so this note stays on this device."; `bad_header` and `unknown_key`: "The server did not accept this note's key. Reload the page; the note stays on this device."; `signed_out`: "Your sign-in ended. Sign in again; the note stays on this device."

- [ ] **Step 1: Write the failing tests**

`test/api.test.ts`:

```ts
// The page's API client: POSTs never overlap, each carries the token the last
// one returned, a burned token is refreshed once, and a lost session is SignedOut.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { NoKeyring, SignedOut, createApi } from '../src/api.ts';
import type { Fetch } from '../src/load.ts';

type Init = Parameters<Fetch>[1];
const reply = (status: number, body: unknown, redirected = false, type = 'application/json') => ({
  ok: status < 400, status, redirected, headers: { get: (n: string) => (n.toLowerCase() === 'content-type' ? type : null) },
  json: async () => body, text: async () => JSON.stringify(body), arrayBuffer: async () => new Uint8Array([7, 8, 9]).buffer,
});

test('POSTs go one at a time with the token the last one returned', async () => {
  const tokens: string[] = [];
  let inFlight = 0;
  let most = 0;
  let n = 0;
  const fetch: Fetch = async (_url, init?: Init) => {
    if (init?.method !== 'POST') return reply(200, {});
    inFlight++;
    most = Math.max(most, inFlight);
    tokens.push(init.headers?.['X-CSRF'] ?? '');
    await new Promise(r => setTimeout(r, 5));
    inFlight--;
    return reply(200, { deleted: 1, csrf: `t${++n}` });
  };
  const api = createApi(fetch, 't0');
  await Promise.all([api.remove('a'.repeat(32)), api.remove('b'.repeat(32)), api.removeAll()]);
  assert.deepEqual(tokens, ['t0', 't1', 't2']);
  assert.equal(most, 1);
});

test('a burned token is refreshed once and the POST retried', async () => {
  const seen: string[] = [];
  const fetch: Fetch = async (url, init?: Init) => {
    if (url === 'csrf.php') return reply(200, { csrf: 'fresh' });
    seen.push(init?.headers?.['X-CSRF'] ?? '');
    return seen.length === 1 ? reply(403, { error: 'csrf' }) : reply(200, { deleted: 1, csrf: 'next' });
  };
  assert.equal(await createApi(fetch, 'stale').remove('a'.repeat(32)), 1);
  assert.deepEqual(seen, ['stale', 'fresh']);
});

test('a second refusal is not retried again', async () => {
  let posts = 0;
  const fetch: Fetch = async url => (url === 'csrf.php' ? reply(200, { csrf: 'fresh' }) : (posts++, reply(403, { error: 'csrf' })));
  await assert.rejects(createApi(fetch, 'x').remove('a'.repeat(32)));
  assert.equal(posts, 2);
});

test('a sign-in redirect is SignedOut', async () => {
  const fetch: Fetch = async () => reply(200, '<html>', true);
  await assert.rejects(createApi(fetch, 'x').list(), SignedOut);
});

test('a 401 or a 403 other than the csrf refusal is SignedOut, whatever the Content-Type', async () => {
  await assert.rejects(createApi(async () => reply(401, { error: 'unauthorized' }, false, 'text/html'), 'x').list(), SignedOut);
  await assert.rejects(createApi(async () => reply(403, { error: 'cross_site' }), 'x').list(), SignedOut);
  await assert.rejects(createApi(async () => reply(500, { error: 'boom' }), 'x').list(), (e: unknown) => e instanceof Error && !(e instanceof SignedOut) && /500/.test(e.message));
});

test('a JSON answer with an odd Content-Type is still read: sign-out is never decided by the type', async () => {
  const fetch: Fetch = async () => reply(200, { notes: [{ id: 'a'.repeat(32), size: 5, arrived_at: 1, picked_up_at: null }] }, false, 'text/plain');
  assert.equal((await createApi(fetch, 'x').list()).length, 1);
});

test('bytes() returns a note\'s octet-stream, and a redirect is still SignedOut', async () => {
  const urls: string[] = [];
  const ok: Fetch = async url => { urls.push(url); return reply(200, null, false, 'application/octet-stream'); };
  assert.deepEqual([...(await createApi(ok, 'x').bytes('a'.repeat(32)))], [7, 8, 9]);
  assert.deepEqual(urls, [`note.php?id=${'a'.repeat(32)}`]);
  await assert.rejects(createApi(async () => reply(200, '<html>', true, 'text/html'), 'x').bytes('a'.repeat(32)), SignedOut);
  await assert.rejects(createApi(async () => reply(200, '<html>', false, 'text/html'), 'x').bytes('a'.repeat(32)), (e: unknown) => e instanceof Error && !(e instanceof SignedOut) && /octet-stream/.test(e.message));
});

test('the keyring comes from keyring.php; before the first upload there is none', async () => {
  const locked = { v: 1, kdf: 'PBKDF2-SHA-256', iterations: 600000, salt: 's', iv: 'i', ct: 'c' };
  const urls: string[] = [];
  const fetch: Fetch = async url => { urls.push(url); return urls.length === 1 ? reply(200, { keyring: locked }) : reply(404, { error: 'no_keyring' }); };
  const api = createApi(fetch, 'x');
  assert.deepEqual(await api.keyring(), locked);
  await assert.rejects(api.keyring(), NoKeyring);
  assert.deepEqual(urls, ['keyring.php', 'keyring.php']);
});

test('upload limits come back as refusals, not errors', async () => {
  const fetch: Fetch = async (url, init?: Init) => (init?.method === 'POST' ? reply(413, { error: 'too_large' }) : reply(200, {}));
  assert.deepEqual(await createApi(fetch, 'x').upload(new Uint8Array(4)), { kind: 'refused', reason: 'too_large' });
});
```

`test/outbox.test.ts`:

```ts
// The outbox: a note is stored before it is sent, so nothing is lost; offline,
// over the limits or signed out, it stays with a reason; online again, it goes.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { KEPT_MESSAGES, createOutbox, memoryOutbox } from '../src/outbox.ts';
import { SignedOut, type UploadResult } from '../src/api.ts';

let k = 0;
const newKey = () => `k${++k}`;

test('sent notes leave the outbox', async () => {
  const store = memoryOutbox();
  const box = createOutbox(store, { upload: async () => ({ kind: 'sent', id: 'f'.repeat(32) }) }, newKey);
  const r = await box.add(new Uint8Array([1]), '2026-10-20T00:00:00Z');
  assert.equal(r.sent.length, 1);
  assert.deepEqual(await store.all(), []);
});

test('offline keeps the note and stops trying the rest', async () => {
  const store = memoryOutbox();
  let calls = 0;
  const box = createOutbox(store, { upload: async () => { calls++; throw new TypeError('Failed to fetch'); } }, newKey);
  await box.add(new Uint8Array([1]), 'a');
  const r = await box.add(new Uint8Array([2]), 'b');
  assert.deepEqual(r.kept.map(x => x.reason), ['offline']);
  assert.equal((await store.all()).length, 2);
  assert.equal(calls, 2, 'one try per flush; the second flush stopped after the first failure');
  assert.match(KEPT_MESSAGES.offline, /kept on this device/);
});

test('limits and a lost session keep the note with their reason', async () => {
  for (const [result, reason] of [[{ kind: 'refused', reason: 'too_large' }, 'too_large'], [{ kind: 'refused', reason: 'full' }, 'full']] as const) {
    const store = memoryOutbox();
    const r = await createOutbox(store, { upload: async (): Promise<UploadResult> => result }, newKey).add(new Uint8Array([1]), 'a');
    assert.deepEqual(r.kept.map(x => x.reason), [reason]);
    assert.equal((await store.all())[0]?.reason, reason);
  }
  const store = memoryOutbox();
  const r = await createOutbox(store, { upload: async () => { throw new SignedOut(); } }, newKey).add(new Uint8Array([1]), 'a');
  assert.deepEqual(r.kept.map(x => x.reason), ['signed_out']);
});

test('back online, kept notes go in the order they were made', async () => {
  const store = memoryOutbox();
  let online = false;
  const sent: number[] = [];
  const box = createOutbox(store, { upload: async b => { if (!online) throw new TypeError('offline'); sent.push(b[0]!); return { kind: 'sent', id: 'e'.repeat(32) }; } }, newKey);
  await box.add(new Uint8Array([1]), '2026-10-20T00:00:01Z');
  await box.add(new Uint8Array([2]), '2026-10-20T00:00:02Z');
  online = true;
  const r = await box.flush();
  assert.deepEqual([sent, r.sent.length, (await store.all()).length], [[1, 2], 2, 0]);
});
```

`test/energy.test.ts`:

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { redraw, strokeFromPixels } from '../src/energy.ts';
import { fitView } from '../src/zoom.ts';

test('a stroke replaces the curve over its own span, clamped and in time order', () => {
  const curve: [number, number][] = [[0, 0.2], [8, 0.5], [16, 0.9]];
  assert.deepEqual(redraw(curve, [[10, 0.1], [4, 0.8], [6, 1.2]], 16), [[0, 0.2], [4, 0.8], [6, 1], [10, 0.1], [16, 0.9]]);
});

test('a stroke over the ends keeps the curve from 0 to the duration', () => {
  assert.deepEqual(redraw([[0, 0.2], [16, 0.9]], [[-3, 0.5], [20, 0.4]], 16), [[0, 0.5], [16, 0.4]]);
});

test('pixels in the energy band become a curve', () => {
  assert.deepEqual(strokeFromPixels([[0, 48], [400, 24], [800, 0]], fitView(16, 800)), [[0, 0], [8, 0.5], [16, 1]]);
});
```

`test/answer.test.ts`:

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { NoteTooLong, REACTIONS, energyNote, humNote, reactNote, textNote, wholePiece } from '../src/answer.ts';
import { tempoMap } from '../src/tempo.ts';
import { REACTION_IDS } from '../src/note.ts';
import type { Score } from '../src/score.ts';

const score = JSON.parse(readFileSync(new URL('./fixtures/score-v1.json', import.meta.url), 'utf8')) as Score;
const sound = JSON.parse(readFileSync(new URL('./fixtures/score-sound-v1.json', import.meta.url), 'utf8')) as Score;
const ctx = { piece: 'test-piece', draft: 1, now: () => new Date('2026-10-20T14:03:11.000Z') };

test('a typed note is tied to its span and draft', () => {
  assert.deepEqual(textNote(ctx, { from: 9, to: 14, fromBar: 5, toBar: 8, laneId: 'brass' }, '  more horns  '), {
    v: 1, kind: 'text', piece: 'test-piece', draft: 1, from: 9, to: 14, fromBar: 5, toBar: 8, lane: 'brass',
    text: 'more horns', reaction: null, curve: null, audio: null, made: '2026-10-20T14:03:11.000Z',
  });
  assert.throws(() => textNote(ctx, { from: 0, to: 1, fromBar: 1, toBar: 1, laneId: null }, '   '), /Type a note first/);
});

test('a hum over 60 seconds is refused', () => {
  assert.throws(() => humNote(ctx, { time: 2, bar: 2, laneId: null }, { mime: 'audio/mp4', seconds: 60.5 }), NoteTooLong);
  assert.equal(humNote(ctx, { time: 2, bar: 2, laneId: null }, { mime: 'audio/mp4', seconds: 60 }).kind, 'hum');
});

test('a reaction covers its section; the last section ends at the end of the piece', () => {
  // Bar 9 does not exist (the piece has 8 bars): tempoMap.barStart(9) is the piece's end, 16 s, so the last section's `to` is 16.
  const n = reactNote(ctx, score.sections[1]!, tempoMap(score), score.duration, 'more-epic');
  assert.deepEqual([n.kind, n.from, n.to, n.fromBar, n.toBar, n.reaction], ['react', 8, 16, 5, 8, 'more-epic']);
  assert.deepEqual(REACTIONS.map(r => r.id), [...REACTION_IDS]);
  assert.deepEqual(REACTIONS.map(r => r.label), ['More epic', 'Calmer', 'Darker', 'Brighter', 'Longer', 'Shorter', 'Love it', 'Not this']);
});

test('a redrawn energy curve covers the whole piece', () => {
  const n = energyNote(ctx, [[0, 0.1], [16, 1]], 16, 8);
  assert.deepEqual([n.kind, n.from, n.to, n.fromBar, n.toBar, n.curve], ['energy', 0, 16, 1, 8, [[0, 0.1], [16, 1]]]);
});

test('notes on a sound effect carry seconds only', () => {
  const sctx = { ...ctx, piece: 'cannon-fire' };
  const text = textNote(sctx, { from: 0.02, to: 0.2, fromBar: null, toBar: null, laneId: 'boom' }, 'a sharper attack');
  assert.deepEqual([text.from, text.to, text.fromBar, text.toBar, text.lane, text.text], [0.02, 0.2, null, null, 'boom', 'a sharper attack']);
  const hum = humNote(sctx, { time: 0.1, bar: null, laneId: null }, { mime: 'audio/webm', seconds: 2 });
  assert.deepEqual([hum.kind, hum.from, hum.to, hum.fromBar, hum.toBar], ['hum', 0.1, 0.1, null, null]);
  const echo = reactNote(sctx, sound.sections[1]!, tempoMap(sound), sound.duration, 'calmer');
  assert.deepEqual([echo.from, echo.to, echo.fromBar, echo.toBar], [0.08, 0.4, null, null], 'the moment named echo, in seconds');
  const whole = reactNote(sctx, wholePiece(sound), tempoMap(sound), sound.duration, 'love-it');
  assert.deepEqual([whole.from, whole.to, whole.fromBar, whole.toBar], [0, 0.4, null, null], 'a sound piece may react to the whole piece');
  assert.deepEqual([wholePiece(score).from_bar, wholePiece(score).to_bar], [1, 8]);
  const energy = energyNote(sctx, [[0, 1], [0.4, 0]], sound.duration, sound.bars ?? null);
  assert.deepEqual([energy.from, energy.to, energy.fromBar, energy.toBar], [0, 0.4, null, null]);
});
```

`test/history.test.ts`:

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildHistory, forPiece, waitingByPiece } from '../src/history.ts';
import { NoteUnreadable, type Opened } from '../src/seal.ts';
import type { NoteBody } from '../src/note.ts';

const body = (piece: string): NoteBody => ({ v: 1, kind: 'text', piece, draft: 1, from: 0, to: 1, fromBar: 1, toBar: 1, lane: null, text: 't', reaction: null, curve: null, audio: null, made: '2026-10-20T00:00:00Z' });
const opened = (piece: string): Opened => ({ fingerprint: 'ab'.repeat(32), body: body(piece), audio: null });

test('newest first, waiting counted per piece, unreadable notes named not hidden', () => {
  const items = buildHistory(
    [{ id: 'a'.repeat(32), size: 1, arrived_at: 1, picked_up_at: null }, { id: 'b'.repeat(32), size: 1, arrived_at: 2, picked_up_at: 5 }, { id: 'c'.repeat(32), size: 1, arrived_at: 3, picked_up_at: null }],
    new Map<string, Opened | NoteUnreadable>([['a'.repeat(32), opened('ch1')], ['b'.repeat(32), opened('ch1')], ['c'.repeat(32), new NoteUnreadable('tampered')]]),
  );
  assert.deepEqual(items.map(i => [i.id[0], i.state]), [['c', 'waiting'], ['b', 'picked-up'], ['a', 'waiting']]);
  assert.equal(items[0]?.problem, 'Could not open this note (tampered).');
  assert.deepEqual([...waitingByPiece(items)], [['ch1', 1]]);
  assert.deepEqual(forPiece(items, 'ch1').map(i => i.id[0]), ['b', 'a']);
});
```

`test/recorder.test.ts`:

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pickMime, stopAfterLimit } from '../src/recorder.ts';

test('the first supported recording type wins (Safari records mp4)', () => {
  assert.equal(pickMime(() => true), 'audio/webm;codecs=opus');
  assert.equal(pickMime(m => m === 'audio/mp4'), 'audio/mp4');
  assert.equal(pickMime(() => false), null);
});

test('recording stops at 60 seconds, unless cancelled', () => {
  const timers: { f: () => void; ms: number; id: number }[] = [];
  const t = { setTimeout: (f: () => void, ms: number) => { timers.push({ f, ms, id: timers.length + 1 }); return timers.length; }, clearTimeout: (id: number) => { timers.splice(timers.findIndex(x => x.id === id), 1); } };
  let stopped = 0;
  stopAfterLimit(t, () => stopped++);
  assert.equal(timers[0]?.ms, 60_000);
  timers[0]!.f();
  assert.equal(stopped, 1);
  const cancel = stopAfterLimit(t, () => stopped++);
  cancel();
  assert.equal(timers.length, 1);
});
```

- [ ] **Step 2: Run to see them fail** — `node --test workroom/test/{answer,energy,outbox,api,history,recorder}.test.ts` — FAIL.

- [ ] **Step 3: Implement** the six modules. `reactNote` covers the whole section: `{ from, to } = sectionTimes(section, tempo, duration)` (Task 6: for a music section `from = tempo.barStart(section.from_bar)` and `to = tempo.barStart(section.to_bar + 1)`, so the last section ends at the piece's end because `barStart` past the last bar is the duration; for a sound section its own seconds), with `fromBar`/`toBar` the section's bars, or null for a sound section. `humNote` sets `from = to = at.time` and both bars to `at.bar`; `energyNote` sets both bars to null when `bars` is null. `createApi` keeps a `queue: Promise<unknown>` and chains each POST onto it; a POST sends `X-CSRF` and, for deletes, `Content-Type: application/x-www-form-urlencoded` with `id=<id>` or `all=1`; the upload sends the bundle as `application/octet-stream`. Every response is checked by status, never by `Content-Type`: `redirected`, a 401, or a 403 whose JSON `error` is not `csrf` → `SignedOut`; another non-2xx status → an `Error` naming it; `keyring()` maps a 404 `no_keyring` to `NoKeyring`. `bytes(id)` fetches `note.php?id=<id>` with the same checks, then requires a 200 whose `Content-Type` starts `application/octet-stream` (else an `Error` saying so, not `SignedOut`) and returns `new Uint8Array(await res.arrayBuffer())`; the JSON routes parse their body whatever its type. `createOutbox.add` puts the note first (`reason: 'new'`), then flushes; `flush` walks `all()` sorted by `made`, stops at the first `offline`, and rewrites a kept note's `reason`.

- [ ] **Step 4: Run the tests** — PASS. Add `answer.ts`, `energy.ts` and `recorder.ts` to `tsconfig.json`'s `files` and `api.ts`, `outbox.ts` and `history.ts` to `src/tsconfig.crypto.json`'s; `node _kit/build/build.mjs workroom --check` — exit 0 (it type-checks every program first; if it then reports a stale `dist/`, run `node _kit/build/build.mjs workroom` and check again).

- [ ] **Step 5: Commit**

```bash
git add websites/www.cs/games/workroom
git commit -m "Music workroom: notes (bars or seconds), energy curves, outbox, page API client and history

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb"
```

### Task 15: The answering views, unlock and history; the full browser check; open PR 3

**Files:**
- Create: `games/workroom/src/idb.ts` (`indexedDbOutbox()`, the only IndexedDB use; it stores sealed bundles), `games/workroom/src/ui/UnlockPanel.tsx`, `src/ui/PinComposer.tsx`, `src/ui/HumButton.tsx`, `src/ui/ReactBar.tsx`, `src/ui/EnergyEditor.tsx`, `src/ui/History.tsx`, `src/ui/PiecesWaiting.tsx`, `games/workroom/test/answering-views.test.ts`
- Modify: `games/workroom/src/main.ts`, `src/ui/Workroom.tsx` (the answering bar and notes on the timeline), `src/tsconfig.dom.json` (`idb.ts`), `tests/e2e/workroom.local.ts` (a further test), `websites/www.cs/Makefile` (`music-e2e` passes `MUSIC_PY`), `websites/www.cs/docker/php/Dockerfile` (`env[MUSIC_PUBLIC_KEYS]`), `tests/php/MusicDeployTest.php` (pins that line), `music/music.css`, `music/README.md`

**Interfaces:**
- Consumes: everything in Tasks 10 and 14; `Workroom`, `Timeline` (Task 8); `make music-tools-venv` for the check.
- Produces:

```tsx
export function UnlockPanel(p: { busy: boolean; error: string | null; onUnlock(passphrase: string): void }): JSX.Element;
  // a form with a hidden username field "siue-music" (autocomplete="username") and a password field labelled "Passphrase"
  // (autocomplete="current-password") so 1Password fills it; button "Unlock notes"; no checkbox and nothing to remember: the passphrase is asked on every visit.
  // The typed value lives in component state set from the field's `input` event; submit reads that state, calls onUnlock(value) and clears it.
export function PinComposer(p: { span: Span | null; recording: boolean; onSend(text: string): void; onRecord(): void; onStop(): void; onCancel(): void }): JSX.Element;
  // The span is shown as bars and seconds on a music piece and as seconds only on a sound effect (fromBar and toBar are null there).
  // "Select a moment or a span on the timeline" until span is set; textarea "Your note"; buttons "Send", "Record", "Stop", "Cancel".
  // "Send" is always rendered, and disabled until a span is set AND the textarea holds words (not only spaces)
export function HumButton(p: { recording: boolean; seconds: number; onStart(): void; onStop(): void }): JSX.Element; // "Hum it" / "Stop (0:12 of 1:00)"
export function ReactBar(p: { section: Section; onReact(r: Reaction): void }): JSX.Element; // the eight REACTIONS buttons
export function EnergyEditor(p: { score: Score; view: View; onSend(curve: Curve): void }): JSX.Element; // drag over the energy band; "Send this shape" / "Start over"
export function History(p: { items: HistoryItem[]; locked: boolean; kept: Pending[]; onDelete(id: string): void; onDeleteAll(): void }): JSX.Element;
  // while `locked`: "Unlock to read your notes." and the kept outbox notes only (no list, no "Delete all"); otherwise
  // each item: when, state ("Waiting" / "Picked up"), its words or a player for its recording (blob: URL), or its problem; "Delete" each;
  // "Delete all" asks "Delete all N notes? This cannot be undone." with "Delete all notes" / "Keep them";
  // kept outbox notes listed with their KEPT_MESSAGES text
export function PiecesWaiting(p: { counts: Map<string, number>; list: ParentNode }): JSX.Element | null;
  // renders nothing itself: for each piece in counts it finds `a[data-waiting="<piece>"]` in `list` (the index page's server-rendered rows,
  // Task 3) and sets the text of the `<span class="waiting-count">` that follows the link to "N waiting" ("" for 0)
```

`Workroom` gains an answering bar under the player: "Pin a note" (switches the gestures to `select` and opens `PinComposer`), `HumButton`, "React" (opens `ReactBar` for the section under the playhead, or for `wholePiece(score)` when none is, as on a sound effect without sections) and "Draw the energy" (opens `EnergyEditor` over the energy band); below the views, `History` for this piece.

`main.ts` wiring (thin; everything decided lives in the pure modules): read the CSRF token from `<meta name="csrf">`; `api = createApi(fetch, csrf)`; `vault = createVault()` (memory only; nothing is restored from anywhere); `outbox = createOutbox(indexedDbOutbox(), api, () => crypto.randomUUID())`, `flush()` on load and on `online`; when `PUBLIC_KEY` is null the answering bar shows "No notes key yet (make keys-init)" and nothing seals. Until the vault holds keys the page shows `UnlockPanel`; on submit it fetches `api.keyring()` (`NoKeyring` → "No notes key has been uploaded yet (make keys-init)."), runs `unlockKeyring(locked, passphrase, [PUBLIC_KEY, ...PREVIOUS_KEYS])` and `vault.load(keys)` (`WrongPassphrase` → "That passphrase did not unlock the key."; `KeyringInvalid` → "The keyring on the server does not match this page's key. Reload the page; if it still fails, run make keys-upload."), then, only now, `api.list()`, `api.bytes(id)` and `open(bytes, vault.keyring())` per note into the history map (notes are listed after an unlock and not before: until then `History` gets `locked: true`, the index page shows the server-rendered total waiting, and nothing says Waiting or Picked up) (one failure never stops the rest; a note sealed to a fingerprint `vault.missing(...)` reports is shown as unreadable). Nothing about a key is stored: the passphrase field is cleared after submit and `main.ts` never touches `indexedDB`, `localStorage`, `sessionStorage` or cookies for keys; the only IndexedDB use is `indexedDbOutbox()` (database `siue-music`, store `outbox`), which holds sealed bundles. Sending: build the `NoteBody` with `answer.ts`, `seal(body, audio, PUBLIC_KEY)`, `outbox.add(bundle, body.made)`, show the report, refresh the history. The recorder uses `MediaRecorder` with `pickMime(MediaRecorder.isTypeSupported)` and `stopAfterLimit(window, stop)`.

- [ ] **Step 1: Write the failing component tests** (`test/answering-views.test.ts`)

```ts
// The answering views are thin: the unlock form is fillable by a password
// manager and has nothing to remember; Delete all asks first; the eight reactions are
// there; Send waits for words.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { h, render } from 'preact';
import { importTsx } from '../../_kit/test/tsx.ts';
import { fire, installDocument, makeEl, renderTarget, walk, type StubElement } from '../../_kit/test/dom-stub.ts';
import type { Score } from '../src/score.ts';
import type { HistoryItem } from '../src/history.ts';

installDocument();
const ui = await importTsx<{
  unlock: typeof import('../src/ui/UnlockPanel.tsx');
  history: typeof import('../src/ui/History.tsx');
  react: typeof import('../src/ui/ReactBar.tsx');
  pin: typeof import('../src/ui/PinComposer.tsx');
}>(import.meta.dirname, { unlock: '../src/ui/UnlockPanel.tsx', history: '../src/ui/History.tsx', react: '../src/ui/ReactBar.tsx', pin: '../src/ui/PinComposer.tsx' });

const score = JSON.parse(readFileSync(new URL('./fixtures/score-v1.json', import.meta.url), 'utf8')) as Score;
const button = (root: StubElement, text: string) => walk(root).find(e => e.localName === 'button' && e.textContent === text);
const byAttr = (root: StubElement, name: string, value: string) => walk(root).find(e => e._attrs[name] === value);
// Preact applies state updates asynchronously: after every event that changes state, await this before reading the tree or firing the next event.
const flush = async () => { for (let i = 0; i < 10; i++) await new Promise(r => setImmediate(r)); };

test('the unlock form suits a password manager and offers nothing to remember', async () => {
  const root = makeEl('root');
  const calls: string[] = [];
  render(h(ui.unlock.UnlockPanel, { busy: false, error: null, onUnlock: p => calls.push(p) }), renderTarget(root));
  const pass = byAttr(root, 'autocomplete', 'current-password')!;
  assert.ok(byAttr(root, 'autocomplete', 'username'));
  pass.value = 'secret words';
  fire(pass, 'input', { target: pass });
  await flush();
  assert.equal(walk(root).some(e => e._attrs.type === 'checkbox'), false, 'no remember-this-device checkbox');
  assert.doesNotMatch(root.textContent, /remember|forget/i);
  fire(walk(root).find(e => e.localName === 'form')!, 'submit', { preventDefault: () => {} });
  await flush();
  assert.deepEqual(calls, ['secret words']);
});

test('a wrong passphrase is shown, not thrown', () => {
  const root = makeEl('root');
  render(h(ui.unlock.UnlockPanel, { busy: false, error: 'That passphrase did not unlock the key.', onUnlock: () => {} }), renderTarget(root));
  assert.match(root.textContent, /did not unlock the key/);
});

test('Delete all asks first', async () => {
  const root = makeEl('root');
  let all = 0;
  const items: HistoryItem[] = [
    { id: 'a'.repeat(32), arrived: 1, pickedUp: null, state: 'waiting', opened: null, problem: null },
    { id: 'b'.repeat(32), arrived: 2, pickedUp: 3, state: 'picked-up', opened: null, problem: null },
  ];
  render(h(ui.history.History, { items, locked: false, kept: [], onDelete: () => {}, onDeleteAll: () => all++ }), renderTarget(root));
  assert.equal(button(root, 'Forget this device'), undefined, 'there is no remembered device to forget');
  fire(button(root, 'Delete all')!, 'click');
  await flush();
  assert.equal(all, 0);
  assert.match(root.textContent, /Delete all 2 notes\? This cannot be undone\./);
  fire(button(root, 'Keep them')!, 'click');
  await flush();
  assert.doesNotMatch(root.textContent, /This cannot be undone/);
  assert.equal(all, 0);
  fire(button(root, 'Delete all')!, 'click');
  await flush();
  fire(button(root, 'Delete all notes')!, 'click');
  await flush();
  assert.equal(all, 1);
});

test('a locked history asks for the passphrase instead of listing notes', () => {
  const root = makeEl('root');
  render(h(ui.history.History, { items: [], locked: true, kept: [], onDelete: () => {}, onDeleteAll: () => {} }), renderTarget(root));
  assert.match(root.textContent, /Unlock to read your notes\./);
  assert.equal(button(root, 'Delete all'), undefined);
  assert.doesNotMatch(root.textContent, /Waiting|Picked up/);
});

test('eight reactions on a section', () => {
  const root = makeEl('root');
  const got: string[] = [];
  render(h(ui.react.ReactBar, { section: score.sections[0]!, onReact: r => got.push(r) }), renderTarget(root));
  fire(button(root, 'Love it')!, 'click');
  assert.equal(walk(root).filter(e => e.localName === 'button').length, 8);
  assert.deepEqual(got, ['love-it']);
});

test('Send waits for a span and words', async () => {
  const root = makeEl('root');
  const target = renderTarget(root);
  const sent: string[] = [];
  const span = { from: 9, to: 14, fromBar: 5, toBar: 8, laneId: 'brass' };
  const props = { recording: false, onSend: (t: string) => sent.push(t), onRecord: () => {}, onStop: () => {}, onCancel: () => {} };
  render(h(ui.pin.PinComposer, { ...props, span: null }), target);
  assert.match(root.textContent, /Select a moment or a span on the timeline/);
  assert.ok(button(root, 'Send'), 'the Send button is always there');
  assert.equal(button(root, 'Send')!.disabled, true, 'no span yet');
  render(h(ui.pin.PinComposer, { ...props, span }), target);
  await flush();
  assert.equal(button(root, 'Send')!.disabled, true, 'a span but no words');
  const box = walk(root).find(e => e.localName === 'textarea')!;
  box.value = '   ';
  fire(box, 'input', { target: box });
  await flush();
  assert.equal(button(root, 'Send')!.disabled, true, 'spaces are not words');
  box.value = 'louder and slower right here';
  fire(box, 'input', { target: box });
  await flush();
  assert.equal(button(root, 'Send')!.disabled, false, 'a span and words');
  fire(button(root, 'Send')!, 'click');
  await flush();
  assert.deepEqual(sent, ['louder and slower right here']);
});
```

The local check needs the PHP worker to see `MUSIC_PUBLIC_KEYS`, and FPM clears the worker environment (`docker/php/Dockerfile` lists each variable it passes). Add to `tests/php/MusicDeployTest.php`:

```php
    public function testPhpWorkersSeeThePublicKeysVariable(): void
    {
        $docker = (string) file_get_contents(dirname(__DIR__, 2) . '/docker/php/Dockerfile');
        self::assertStringContainsString('env[MUSIC_PUBLIC_KEYS] = $MUSIC_PUBLIC_KEYS', $docker, 'FPM clears the worker environment; compose.music-local.yaml sets this variable');
    }
```

- [ ] **Step 2: Run to see it fail** — `node --test workroom/test/answering-views.test.ts` — FAIL; `vendor/bin/phpunit tests/php/MusicDeployTest.php` — FAIL (the Dockerfile has no such line).

- [ ] **Step 3: Implement** the components, the `main.ts` wiring, `indexedDbOutbox()` (database `siue-music`, store `outbox`, keyed by `key`) and the styles. In `docker/php/Dockerfile`, end the `RUN echo 'env[...]'` chain with one more line, so the worker sees the variable (it does nothing when the variable is unset):

```dockerfile
    && echo 'env[ADMIN_MAIL_CAPTURE_DIR] = $ADMIN_MAIL_CAPTURE_DIR' >> /etc/php-fpm.d/www.conf \
    && echo 'env[MUSIC_PUBLIC_KEYS] = $MUSIC_PUBLIC_KEYS' >> /etc/php-fpm.d/www.conf
```

Notes on the timeline: each opened note of this piece draws a pin (a moment) or a band (a span) at its `from`/`to` in its lane row (or across all lanes), marked with its draft when it differs from the shown one; each `changes[]` entry draws a band on its bars (music) or its seconds (sound) with Claude's text, beside the pins of the notes in its `answers`.

- [ ] **Step 4: Run the unit tests and build** — `node --test workroom/test/*.test.ts` — PASS; `node _kit/build/build.mjs workroom`; `sh workroom/test.sh` — exit 0.

- [ ] **Step 5: Extend the browser check.** In the Makefile, beside `MUSIC_PY`, add `MUSIC_PY_ABS = $(if $(findstring /,$(MUSIC_PY)),$(abspath $(MUSIC_PY)),$(MUSIC_PY))`: the venv's interpreter (a path) becomes absolute, which the check needs because it runs the tool from another directory, while the bare fallback `python3` stays a command name (`abspath` would turn it into `<cwd>/python3`). In the `music-e2e` recipe pass `MUSIC_PY=$(MUSIC_PY_ABS)` to the check (`MUSIC_PY=$(MUSIC_PY_ABS) E2E_BASE_URL=... tests/e2e/run.sh -c local.config.ts`). Add this test to `tests/e2e/workroom.local.ts`, beside the others (same imports, plus `mkdtempSync`, `readdirSync` and `writeFileSync` from `node:fs` and `tmpdir` from `node:os`):

```ts
const FIXTURES = join(SITE, 'games', 'workroom', 'test', 'fixtures');
const testKey = JSON.parse(readFileSync(join(FIXTURES, 'test-key.json'), 'utf8')) as { fingerprint: string; pkcs8: string; passphrase: string; keyring: object };

/** Notes are listed only after an unlock and nothing is remembered, so every load of a piece page starts by unlocking. */
async function unlock(page: Page, passphrase: string): Promise<void> {
  await page.getByLabel('Passphrase').fill(passphrase);
  await page.getByRole('button', { name: 'Unlock notes' }).click();
}

test('pin a note, pick it up with the tool, read and delete it on a second device', async ({ browser, request, baseURL }) => {
  const base = baseURL!;
  const bundle = process.env.WORKROOM_E2E_BUNDLE!;
  const routeBundle = (p: Page) => p.route('**/games/workroom/dist/workroom.js*', r => r.fulfill({ contentType: 'text/javascript', body: readFileSync(bundle, 'utf8') }));
  const { context, page } = await signedInPage(browser, base); // the shared sign-in: two sign-in links in the whole run, the second for the phone below
  await routeBundle(page);
  const publish = await createKey(page, base, 'e2e publish', ['drafts:publish', 'keys:publish']);
  const pickupKey = await createKey(page, base, 'e2e pickup', ['notes:pickup']);
  await publishFixtureDraft(request, base, publish);
  const up = await request.post(`${base}music/api/keyring.php`, { headers: { Authorization: `Bearer ${publish}` }, data: testKey.keyring });
  expect(up.status()).toBe(201);

  // Unlock first: the page lists notes (Waiting, Picked up) only once the vault holds the keys. Then pin a typed note on bars 5 to 7 of the horns.
  await page.goto(`${base}music/piece.php?id=test-piece`);
  await unlock(page, testKey.passphrase);
  await page.getByRole('button', { name: 'Pin a note' }).click();
  const tl = page.locator('[data-timeline]');
  const box = (await tl.boundingBox())!;
  await page.mouse.move(box.x + box.width * 0.5 + 4, box.y + 120);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.85, box.y + 120, { steps: 8 });
  await page.mouse.up();
  await page.getByLabel('Your note').fill('louder and slower right here');
  await page.getByRole('button', { name: 'Send' }).click();
  await expect(page.getByText('Waiting', { exact: true })).toBeVisible();

  // Claude's side: the tool picks it up from this docker stack.
  const home = mkdtempSync(join(tmpdir(), 'siue-music-e2e-'));
  writeFileSync(join(home, 'music.json'), JSON.stringify({ v: 1, keys: { [testKey.fingerprint]: testKey.pkcs8 }, api: { 'music-pickup': pickupKey } }), { mode: 0o600 });
  const run = spawnSync(process.env.MUSIC_PY ?? 'python3', [join(SITE, 'music', 'tools', 'siue-music'), 'pickup'], {
    encoding: 'utf8',
    env: { ...process.env, SIUE_CONFIG_DIR: home, SIUE_MUSIC_NOTES_DIR: join(home, 'notes'), SIUE_MUSIC_BASE: `${base}music/`, SIUE_MUSIC_PUBLIC_KEYS: join(FIXTURES, 'public.json') },
  });
  expect(run.status, run.stderr).toBe(0);
  expect(run.stdout).toMatch(/Picked up 1 note/);
  const [folder] = readdirSync(join(home, 'notes'));
  expect(JSON.parse(readFileSync(join(home, 'notes', folder!, 'note.json'), 'utf8')).body.text).toBe('louder and slower right here');

  await page.reload(); // nothing is remembered: unlock again to see the history
  await unlock(page, testKey.passphrase);
  await expect(page.getByText('Picked up', { exact: true })).toBeVisible();

  // A second device: sign in, unlock with the passphrase, read, delete. Nothing is remembered: no key reaches browser storage and a reload asks again.
  const phone = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const p2 = await phone.newPage();
  await routeBundle(p2);
  await signIn(p2, base);
  await p2.goto(`${base}music/piece.php?id=test-piece`);
  await p2.getByLabel('Passphrase').fill('not it');
  await p2.getByRole('button', { name: 'Unlock notes' }).click();
  await expect(p2.getByText('That passphrase did not unlock the key.')).toBeVisible();
  await p2.getByLabel('Passphrase').fill(testKey.passphrase);
  await p2.getByRole('button', { name: 'Unlock notes' }).click();
  await expect(p2.getByText('louder and slower right here')).toBeVisible();
  const stored = await p2.evaluate(async () => {
    const stores: string[] = [];
    for (const info of await indexedDB.databases()) {
      if (!info.name) continue;
      const db = await new Promise<IDBDatabase>((resolve, reject) => { const r = indexedDB.open(info.name!); r.onsuccess = () => resolve(r.result); r.onerror = () => reject(r.error); });
      stores.push(...Array.from(db.objectStoreNames).map(s => `${info.name}/${s}`));
      db.close();
    }
    return { local: Object.keys(localStorage), session: Object.keys(sessionStorage), stores, cookies: document.cookie };
  });
  expect(stored.local).toEqual([]);
  expect(stored.session).toEqual([]);
  expect(stored.stores.filter(s => !s.endsWith('/outbox'))).toEqual([]);
  expect(stored.cookies).toBe('');
  await p2.reload();
  await expect(p2.getByRole('button', { name: 'Unlock notes' })).toBeVisible();
  await expect(p2.getByText('louder and slower right here')).toHaveCount(0);
  await p2.getByLabel('Passphrase').fill(testKey.passphrase);
  await p2.getByRole('button', { name: 'Unlock notes' }).click();
  await expect(p2.getByText('louder and slower right here')).toBeVisible();
  await p2.getByRole('button', { name: 'Delete', exact: true }).first().click();
  await expect(p2.getByText('louder and slower right here')).toHaveCount(0);
  await phone.close();
  await context.close();
});
```

- [ ] **Step 6: Run the check** — `make music-tools-venv` (once), then `make music-e2e` — both tests pass and `MUSIC-E2E-OK` prints; no `music-e2e-*` project remains (`docker compose ls`).

- [ ] **Step 7: Gates** — from `websites/www.cs`: `vendor/bin/phpunit --testsuite site`; `vendor/bin/phpunit --testsuite kit`; `(cd games && npm ci --silent && npm run --silent check)`; `sh games/units.sh`; `make music-tools-test`; `cd tests/e2e && npm ci --silent && node_modules/.bin/tsc -p tsconfig.json`; `node tests/e2e/select.ts --check`. Then `make test` with the docker stack up under a unique project name for its docker steps.

- [ ] **Step 8: Commit and open PR 3**

```bash
git add websites/www.cs/games/workroom websites/www.cs/tests/e2e/workroom.local.ts websites/www.cs/tests/php/MusicDeployTest.php websites/www.cs/docker/php/Dockerfile websites/www.cs/Makefile websites/www.cs/music/music.css websites/www.cs/music/README.md
git commit -m "Music workroom: pin, hum, react and draw the energy; unlock, history and delete

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb"
```

Open the PR (foundry `pr-fix-loop`): "Music workroom: answering tools and the key tool"; body: summary, spec and plan paths, `make music-e2e` and `make music-tools-test` results, and the owner's first-run steps after merge and deploy: create the `music-pickup` and `music-publish` API keys on the hub; `make api-key-set NAME=music-pickup`; `make api-key-set NAME=music-publish`; `make keys-init`; rebuild (`cd games && node _kit/build/build.mjs workroom`) and commit the key files through a PR; after that deploy, compare the hub's "Music notes key" fingerprint with `make keys-status`; unlock once on the phone with 1Password. Attribution lines.
