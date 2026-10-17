# Music Workroom Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A signed-in page at `/music/` where the owner sees, hears and learns each draft of the game's music in four views that share one playhead, answers with notes sealed in the browser, and Claude picks the notes up and publishes the next draft through scoped API calls.

**Architecture:** The server is plain PHP 8.4 in `websites/www.cs/music/` (namespace `Music`) on the admin login's `Request`, `Response`, `Sessions`, `Keys` and SQLite database (`Admin\Db`, `secure_delete` on); sealed notes and published drafts are files under the admin data directory, never served directly. The page is TypeScript and Preact built by the games kit's `build.mjs` from `games/workroom/` (a kit folder with a `build.json` and no `metadata.yaml`, so the games hub never lists it), with DOM-free modules for the score model, layout, zoom, hit testing, gestures, sealing, unlocking and the outbox, and thin Preact views. The owner's tool `music/tools/siue-music` (Python 3, `cryptography`, 1Password CLI v2) keeps the keys in step, picks notes up and publishes drafts; the Makefile calls it.

**Tech Stack:** PHP 8.4, PDO SQLite, PHPUnit 12 (`--testsuite site`); TypeScript 7, Preact 11, esbuild 0.28 through `games/_kit/build/build.mjs`, `node:test` on Node 24 (Web Crypto as `globalThis.crypto.subtle`), OpenSheetMusicDisplay for notation; Python 3.11+, `cryptography`, optional `faster-whisper`, `librosa`, `mido`, `numpy`, `ffmpeg`; 1Password CLI (`op`) 2.25+; Playwright (local only).

**Spec:** `docs/superpowers/specs/2026-10-17-music-workroom-design.md`. It builds on `docs/superpowers/specs/2026-10-17-admin-login-design.md` and its plan `docs/superpowers/plans/2026-10-17-admin-login.md`, whose classes this plan uses as they are defined there.

## Global Constraints

- Work starts after the admin login PR has merged. Use its interfaces exactly: `Admin\Request` (constructor `method, ip, https, host, headers, cookies, post, query, agent`; `fromGlobals()`), `Admin\Response(int $status, array $headers, string $body)`, `Admin\Pages::requireAdmin(Request): ?Response` and `Pages::storageDown()`, `Admin\Keys::check(Request, string $scope): ?Response` and `Keys::create(string $label, array $scopes)`, the scope registry `Admin\Keys::SCOPES`, `Admin\Sessions::start/current/csrf/checkCsrf`, `Admin\Db::open(string $dir)` and `Db::dataDir()`, `Admin\Headers::LIST` and `Headers::apply(array)`, `Admin\StorageUnavailable`, `Kit\StoreDir`, `Admin\Clock`, and the test helpers `FakeClock`, `admin_tmp_db()`, `admin_tmp_dir()`, `req()` in `tests/php/AdminFakes.php`.
- Header lookups go through `Music\Http::header(Request $r, string $name): ?string`, case-insensitive, so nothing depends on how `Request` spells header names.
- Sealing, in the browser with Web Crypto: per note a fresh AES-256-GCM key (12-byte IV) encrypts the whole note; RSA-OAEP with SHA-256 (MGF1-SHA-256) wraps that key to the committed **RSA-4096** public key. The fingerprint is the lowercase hex SHA-256 of the public key's SPKI DER, built into the page with the key; the page refuses to seal to a key whose computed fingerprint differs from the built-in one; every sealed note carries the fingerprint it was sealed to.
- The server keeps per note only: a random id, the sealed bundle's size, its arrival time, the sealed bytes, the SHA-256 of the sealed bytes (derived from them, for the pickup check) and the picked-up time.
- www.cs PHP has **no sodium** (`docker/expected-modules.txt`). Crypto is Web Crypto in the browser and `cryptography` (OpenSSL) in Python; PHP never decrypts anything.
- The private key's home is 1Password vault `SIUE` (`OP_VAULT` overrides). The passphrase is in the same item. The locked copy: PBKDF2-SHA-256, **600,000** rounds, 16-byte random salt, AES-256-GCM (12-byte IV, AAD = the fingerprint's ASCII) over the PKCS8 DER; it is served only to a signed-in session and unlocked in the browser. The passphrase is NFC-normalised and trimmed before use, in TypeScript and Python alike.
- **Remember this device** stores the unlocked private key as a non-extractable `CryptoKey` in IndexedDB; **Forget this device** erases it.
- Notes stay sealed on the server until the owner deletes them in the page (session + CSRF). Pickup only marks a note picked up. An API key cannot delete. SQLite runs with `secure_delete` on.
- Limits: 60 s of audio per note (the page's recorder stops at 60 s), **2,097,152** bytes per sealed note, **2,000** notes stored; over either, the page says so and keeps the note in the browser's outbox.
- Secrets reach tools on standard input, never as a command-line argument, and are never printed. `op` is the 1Password CLI v2 (2.25 or newer, for `--reveal`).
- Opened notes go to `~/Library/Application Support/siue-music/notes/` on macOS, `$XDG_DATA_HOME/siue-music/notes/` (default `~/.local/share/siue-music/notes/`) elsewhere on Unix, `%APPDATA%\siue-music\notes\` on Windows; never inside the repository (the tool refuses a notes directory inside it). The key cache is `~/.config/siue/music.json`, directory 0700, file 0600.
- Speech-to-text (local Whisper via `faster-whisper`) and humming-to-MIDI (`librosa.pyin` and `mido`) are optional: when missing, pickup still opens and saves every note and prints one line naming the missing package and the install command.
- New Makefile targets only (`websites/www.cs/Makefile`): `keys-status`, `keys-pull`, `keys-init`, `keys-rotate`, `api-key-set NAME=...`, `keys-forget`, `music-pickup`, `music-publish PIECE=...`, plus `keys-upload`, `music-tools-venv`, `music-tools-test` and `music-e2e`. The `test` and `e2e` targets are never changed.
- CI is not changed: no edits to `.github/`, `tests/e2e/select.ts`, `compose.yaml`, or the Makefile's `test` and `e2e` targets. PHPUnit files go in `tests/php/` (the `site` suite). Unit tests go in `games/workroom/test/`, which `games/units.sh` discovers because the folder has a `build.json`. No `*.spec.ts` is added to `tests/e2e/` (`select.ts --check` requires every spec there to be reachable from a rule); the browser check is `tests/e2e/workroom.local.ts`, run only by `make music-e2e` through `tests/e2e/local.config.ts`.
- Never bind ports 3000, 5173, 8000 or 8080. Docker runs use a unique `COMPOSE_PROJECT_NAME` and are torn down with `docker compose -p <name> down -v`; never touch the `siue` project, never prune. Never SSH, SFTP or SCP to www.cs; deploys happen on merge.
- Nothing secret is committed; the repository is public. Opened notes are never committed. Test keys under `games/workroom/test/fixtures/` are labelled test keys, used by nothing but tests.
- Delivery: three PRs, each green on its own, in order: (1) the API and storage, (2) the page with the four views and the glossary, (3) the answering tools with the owner's key tool.
- Comments and docs describe the current state, never history.
- Commits end with:
  ```
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb
  ```

## Review Focus

1. **iPhone Safari plays and records different audio**: it may not play Opus in WebM and records `audio/mp4`. A draft may carry `audio.webm` and `audio.m4a`, the player picks the first source the browser can play, the recorder picks the first MIME type `MediaRecorder` supports, and pickup converts any of them with ffmpeg. Pinned in Task 8 (`pickSource`) and Task 14 (`pickMime`).
2. **A double tap or two quick deletes burn one CSRF token twice**: the page's API client sends one POST at a time, and on a `403 {"error":"csrf"}` fetches a fresh token once and retries once. Pinned in Task 14 (`api.test.ts`).
3. **The network drops mid-upload, or the server is full (409) or the note too large (413)**: the sealed note stays in the outbox, is never lost, and the owner is told why. Pinned in Task 14 (`outbox.test.ts`).
4. **After `make keys-rotate`**: notes sealed to the previous key still open in the page and in pickup, and a remembered device asks for the passphrase once, for the new key only. Pinned in Task 10 (`vault.test.ts`) and Task 12 (`test_keys_lifecycle.py`).
5. **A truncated, bit-flipped or re-headed sealed bundle** (the clear fingerprint swapped): opening fails with a named reason, pickup leaves it waiting, the page shows "Could not open this note" instead of failing the whole history. Pinned in Task 10 (`seal.test.ts`) and Task 13 (`test_pickup.py`).

## Decisions this plan makes (the spec leaves them open)

- **Where the page's TypeScript lives:** `websites/www.cs/games/workroom/`, built by `node _kit/build/build.mjs workroom`. The kit's build resolves the folder from `games/` and esbuild finds Preact by walking up to `games/node_modules`; a folder outside `games/` (such as `music/page/`) would need kit changes to resolve Preact, and `games/units.sh`, `npm run check` and `make test`'s `games/*/test.sh` loop find only `games/*/build.json`. The games hub lists only folders with a `metadata.yaml`, so the workroom is not a game card. Its `dist/` ships under `games/workroom/dist/` (public; nothing in it is secret), and the PHP pages under `music/` load it.
- **API routes are files** with the id in the query string (`api/note.php?id=`), because nginx (local) has no rewrite for `/music/api/notes/{id}` and the host's Apache rewrite support is unknown. Paths: `GET api/notes.php?state=waiting`, `GET api/note.php?id=`, `POST api/picked-up.php?id=`, `POST api/drafts.php`, `POST api/locked-key.php`.
- **A third scope, `keys:publish`**, lets `keys-init` and `keys-rotate` upload the locked private key. The server accepts a locked key for any well-formed fingerprint, because a new key's locked copy is uploaded before the deploy that makes it current; `make keys-upload` re-uploads every repository key's locked copy when that first upload could not happen (no API key yet, or offline). Two API keys: `music-pickup` (`notes:pickup`) and `music-publish` (`drafts:publish`, `keys:publish`).
- **The note bundle format** (byte layout below) authenticates the clear header: AES-GCM's additional data is the magic and fingerprint.
- **One 1Password item per key pair** (category Password): `password` = the passphrase (so 1Password fills it on the workroom page), `private_key` (concealed, PKCS8 base64), `fingerprint`, website `https://www.cs.siue.edu/~wgrim/music/`, tag `siue-music-key`. A rotation creates a new item with the same passphrase and retitles the old one "(previous)"; which key is current is decided by the repository's `music/keys/public.json`, never by 1Password.
- **The committed public key** is `music/keys/public.json` (read by PHP and the tool) and `games/workroom/src/public-key.ts` (built into the page); a unit test keeps them equal. Before `make keys-init` both say "no key" and the page offers no note tools.
- **Committed drafts** live in `music/pieces/<piece>/v<N>/` (not deployed); `make music-publish` uploads one into the server's data directory, where the page reads it through a session. `changes` (Claude's change list) is part of `score.json`.
- **Per-piece waiting counts** need the sealed notes opened (the server cannot know a note's piece), so the pieces list shows the total waiting until the key is unlocked, then per-piece counts.
- **Remember this device** keeps unlocked keys per fingerprint; after a rotation the device asks once more, for the new key.
- **Music pages' CSP** is the admin CSP plus `media-src 'self' blob:`, so recorded notes and opened recordings can play.
- **Python tests run locally** (`make music-tools-test`): CI's runner has no `cryptography` and CI is not changed. The two directions of the cross-language crypto are pinned by committed fixtures that the CI-run Node tests also check.
- **Local HTTPS for the docker check:** `compose.music-local.yaml` mounts `docker/nginx/fastcgi_params.https-local` (nginx's stock list plus `fastcgi_param HTTPS on;`) so the admin kit's HTTPS rules hold against `http://localhost:<port>` in the local stack only; `MUSIC_PUBLIC_KEYS` points the server at the test public key there.
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

`kind` is one of `text`, `speech`, `hum`, `react`, `energy`. `reaction` is one of `more-epic`, `calmer`, `darker`, `brighter`, `longer`, `shorter`, `love-it`, `not-this`. `curve` is a list of `[seconds, energy 0..1]`. `audio` is `{ "mime": string, "seconds": number ≤ 60 }` when audio bytes follow.

### Locked private key (JSON, version 1)

```json
{ "v": 1, "kdf": "PBKDF2-SHA-256", "iterations": 600000, "salt": "<base64 16 bytes>",
  "iv": "<base64 12 bytes>", "fingerprint": "<64 hex>", "ct": "<base64 AES-GCM(pkcs8) || tag>" }
```

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
| `piece` | `{ id, title }`; `id` matches `^[a-z0-9][a-z0-9-]{0,47}$`; `title` 1–120 chars |
| `draft` | integer ≥ 1 (the draft version) |
| `made` | ISO 8601 UTC string ending in `Z` |
| `duration` | seconds, > 0 |
| `bars` | integer ≥ 1, the last bar number (bars count from 1) |
| `tempo` | ≥ 1 of `{ bar, bpm, beats, unit }`; first `bar` is 1; bars strictly increasing and ≤ `bars`; `bpm` > 0 counts `unit` notes per minute; `beats` integer 1–16; `unit` one of 1, 2, 4, 8, 16 |
| `sections` | ≥ 1 of `{ id, name, from_bar, to_bar, color }`; contiguous: the first starts at bar 1, each starts one bar after the previous ends, the last ends at `bars`; `name` is plain words, 1–60 chars |
| `lanes` | ≥ 1 of `{ id, name, family, icon, color }`; unique ids; `family` and `icon` each one of `strings`, `brass`, `woodwinds`, `percussion`, `choir`, `keys`, `synth`, `harp`, `bells` |
| `motifs` | `{ id, character, color, spans: [{ lane, from, to }] }`; `from` < `to` seconds within `[0, duration]`; `lane` names a lane; a known character has its fixed colour: Ariadne `#d4a017`, Minotaur `#c0392b`, Daedalus `#b08d57`, Athens `#3b6fb6` |
| `notes` | `{ lane, start, length, pitch, velocity, motif }`; `start` ≥ 0 and `start + length` ≤ `duration` (seconds), `length` > 0; `pitch` MIDI integer 0–127; `velocity` integer 1–127; `motif` a motif id or `null` |
| `energy` | ≥ 2 points `[seconds, value]`; times strictly increasing, first 0, last `duration`; values in [0, 1] |
| `glossary` | `{ term, from, to }`; `term` is a page glossary id (`games/workroom/src/glossary.ts`); `0 ≤ from < to ≤ duration`, `to - from` ≤ 15 |
| `audio` | ≥ 1 of `{ file, type }`; `file` is `audio.webm` (type `audio/webm; codecs=opus`) or `audio.m4a` (type `audio/mp4; codecs=mp4a.40.2`) |
| `spectrogram` | `{ file: "spectrogram.png", low_hz, high_hz, scale }`; 0 < `low_hz` < `high_hz`; `scale` `log` or `linear` |
| `musicxml` | `"score.musicxml"`; each lane is the MusicXML part whose `id` equals the lane id |
| `changes` | `{ from_bar, to_bar, lane, text, answers }`; `1 ≤ from_bar ≤ to_bar ≤ bars`; `lane` a lane id or `null`; `text` 1–500 chars; `answers` a list of note ids (32 hex) |

Colours everywhere match `^#[0-9a-f]{6}$`. Ids everywhere match `^[a-z0-9][a-z0-9-]{0,47}$`.

## File map

```
websites/www.cs/
  music/
    .htaccess                     # admin headers with the music CSP; deny lib/ tools/ pieces/ keys/
    index.php piece.php           # session pages (thin)
    csrf.php notes.php note.php delete.php locked-keys.php drafts.php draft.php   # session JSON/bytes (thin)
    api/notes.php api/note.php api/picked-up.php api/drafts.php api/locked-key.php  # API-key routes (thin)
    music.css                     # the pages' look (dark site look)
    README.md                     # what it is, security model, schema, make targets, local check
    lib/.htaccess                 # Require all denied
    lib/bootstrap.php             # requires admin/lib/bootstrap.php and the music classes; music_* helpers
    lib/PublicKeys.php            # Music\PublicKeys: public.json reader, fingerprints
    lib/Store.php                 # Music\Store, NoteRejected, DraftRejected: notes, drafts, locked keys
    lib/Http.php                  # Music\Http: header(), json(), finish() (headers + music CSP), serveFile() (Range)
    lib/Api.php                   # Music\Api: API-key routes
    lib/Pages.php                 # Music\Pages: session routes and the two page shells
    keys/public.json              # written by keys-init / keys-rotate (absent until then)
    pieces/<piece>/v<N>/          # committed drafts: score.json score.musicxml audio.webm [audio.m4a] spectrogram.png
    tools/siue-music              # the owner's tool (entry point)
    tools/siue_music/{__init__,paths,op,sealing,keys,api,pickup,answering,publish,score,cli}.py
    tools/requirements.txt tools/requirements-answering.txt
    tools/tests/fake_op.py tools/tests/support.py tools/tests/make_fixture.py tools/tests/test_*.py
  games/workroom/
    build.json tsconfig.json tsconfig.test.json test.sh
    src/tsconfig.dom.json
    src/score.ts tempo.ts zoom.ts timeline.ts hit.ts pianoroll.ts spectro.ts glossary.ts gestures.ts player.ts load.ts   # DOM-free (view)
    src/note.ts seal.ts unlock.ts vault.ts public-key.ts answer.ts energy.ts outbox.ts api.ts history.ts recorder.ts    # DOM-free (answering)
    src/idb.ts sheet.ts main.ts   # DOM adapters and the entry
    src/ui/{Workroom,ViewTabs,Timeline,PianoRoll,SoundPicture,Sheet,Glossary,Player}.tsx                              # views
    src/ui/{UnlockPanel,PinComposer,HumButton,ReactBar,EnergyEditor,History,PiecesWaiting}.tsx                          # answering
    tools/make-fixtures.ts tools/make-draft-fixture.ts tools/e2e-bundle.ts
    test/*.test.ts test/fixture-key.ts test/fixtures/{score-v1.json,test-key.json,public.json,public-key.ts,locked-by-python.json,note-text.sealed,note-hum.sealed,draft/}
    dist/                         # built: workroom.js sheet.js (+ maps, THIRD_PARTY_LICENSES.txt)
  admin/lib/bootstrap.php         # + dashboard, fingerprint, three scopes
  tests/php/MusicFakes.php MusicStoreTest.php MusicApiTest.php MusicPagesTest.php MusicDeployTest.php
  tests/e2e/local.config.ts tests/e2e/workroom.local.ts
  compose.music-local.yaml docker/nginx/fastcgi_params.https-local
  docker/nginx/default.conf       # deny /music/lib/ /music/tools/ /music/pieces/ /music/keys/
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
- Consumes: `Admin\Db::open`, `Admin\Clock`, `Admin\StorageUnavailable`, `Kit\StoreDir` (from `admin/lib/store-dir.php`), `FakeClock`, `admin_tmp_db()`, `admin_tmp_dir()`.
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
    /** $reason: bad_piece | bad_version | missing_file | bad_file | too_large | exists | bad_score */
    public function __construct(public readonly string $reason) {}
}

final class Store {
    public const MAGIC = 'SIUEN1';
    public const MAX_NOTE_BYTES = 2_097_152;
    public const MAX_NOTES = 2000;
    public const MAX_DRAFT_FILE_BYTES = 33_554_432;
    public const MAX_LOCKED_KEY_BYTES = 16_384;
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
    /** @param array<string, string> $files published name => readable temp path @throws DraftRejected */
    public function putDraft(string $piece, int $version, array $files): void;
    /** @return list<array{piece: string, version: int, published_at: int}> newest first */
    public function drafts(?string $piece = null): array;
    /** Absolute path, or null for an unknown draft or a name outside DRAFT_FILES. */
    public function draftFile(string $piece, int $version, string $name): ?string;
    public function putLockedKey(string $fingerprint, string $lockedJson): void;
    /** @return list<array{fingerprint: string, locked: string, uploaded_at: int}> */
    public function lockedKeys(): array;
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
CREATE TABLE IF NOT EXISTS music_drafts (piece TEXT NOT NULL, version INTEGER NOT NULL, published_at INTEGER NOT NULL, PRIMARY KEY (piece, version));
CREATE TABLE IF NOT EXISTS music_locked_keys (fingerprint TEXT PRIMARY KEY, locked TEXT NOT NULL, uploaded_at INTEGER NOT NULL);
```

- [ ] **Step 1: Write the test helpers** (`tests/php/MusicFakes.php`; not a test, no `Test` suffix)

```php
<?php
// Helpers for the music workroom's tests: fixed fingerprints, a fake sealed
// bundle (only its clear header is real), a store in a temp directory, and a
// signed-in request.
declare(strict_types=1);

require_once __DIR__ . '/AdminFakes.php';
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
    preg_match('/__Host-admin=([0-9a-f]{64})/', $header, $m);
    return req(array_replace(['https' => true, 'cookies' => ['__Host-admin' => $m[1]]], $over));
}
```

- [ ] **Step 2: Write the failing tests** (`tests/php/MusicStoreTest.php`)

```php
<?php
// The note store: only sealed bundles with a known key's header, the two
// limits, private files, deletes that remove row and file, pickup marks only;
// drafts are immutable; public.json is checked against its own spki.
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
        $tmp = admin_tmp_dir();
        file_put_contents("$tmp/s", '{"schema":1}');
        $s->putDraft('ch1-labyrinth', 2, ['score.json' => "$tmp/s"]);
        self::assertSame('{"schema":1}', file_get_contents((string) $s->draftFile('ch1-labyrinth', 2, 'score.json')));
        self::assertNull($s->draftFile('ch1-labyrinth', 2, '../../admin.sqlite'));
        self::assertNull($s->draftFile('ch1-labyrinth', 3, 'score.json'));
        $this->expectExceptionObject(new Music\DraftRejected('exists'));
        $s->putDraft('ch1-labyrinth', 2, ['score.json' => "$tmp/s"]);
    }

    public function testLockedKeysUpsertByFingerprint(): void
    {
        [$s, , , $clock] = music_world();
        $s->putLockedKey(MUSIC_FP_CURRENT, '{"v":1}');
        $clock->now += 1;
        $s->putLockedKey(MUSIC_FP_CURRENT, '{"v":1,"again":true}');
        $keys = $s->lockedKeys();
        self::assertCount(1, $keys);
        self::assertSame('{"v":1,"again":true}', $keys[0]['locked']);
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
- `deleteNote`: in one transaction `DELETE FROM music_notes WHERE id = ?`, then `unlink` the file; returns whether a row went. `deleteAllNotes`: select ids, delete rows, unlink each file, return the count.
- `putDraft`: piece matches `/^[a-z0-9][a-z0-9-]{0,47}$/` else `bad_piece`; `1 ≤ version ≤ 9999` else `bad_version`; every key in `DRAFT_FILES` else `bad_file`; a file over `MAX_DRAFT_FILE_BYTES` → `too_large`; existing row → `exists`; copy each file into `"$dir/drafts/$piece/$version/"` (claimed private), mode 0600, then insert the row.
- `draftFile`: same piece/version checks, name in `DRAFT_FILES`, row exists, file exists → path.

- [ ] **Step 5: Run the tests**

Run: `vendor/bin/phpunit tests/php/MusicStoreTest.php` — PASS. Then `vendor/bin/phpunit --testsuite site` — PASS.

- [ ] **Step 6: Commit**

```bash
git add websites/www.cs/music/lib websites/www.cs/tests/php/MusicFakes.php websites/www.cs/tests/php/MusicStoreTest.php
git commit -m "Music workroom: sealed-note and draft storage

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb"
```

### Task 2: The API-key routes and the three scopes

**Files:**
- Create: `websites/www.cs/music/lib/Http.php`, `music/lib/Api.php`, `tests/php/MusicApiTest.php`
- Modify: `websites/www.cs/admin/lib/bootstrap.php` (the `Admin\Keys::SCOPES` registry), `music/lib/bootstrap.php` (require the two files)

**Interfaces:**
- Consumes: `Store`, `PublicKeys`, `Admin\Keys::check/create`, `Admin\Headers`.
- Produces:

```php
namespace Music;

final class Http {
    /** The admin CSP plus media-src for recorded and opened audio. */
    public const CSP_EXTRA = "; media-src 'self' blob:";
    public static function csp(): string; // \Admin\Headers::LIST['Content-Security-Policy'] . self::CSP_EXTRA
    public static function header(\Admin\Request $r, string $name): ?string; // case-insensitive
    /** JSON response with every admin header and the music CSP. */
    public static function json(int $status, array $data): \Admin\Response;
    /** Adds the admin headers and the music CSP to any response. */
    public static function finish(\Admin\Response $res): \Admin\Response;
    /** 200 whole file or 206 one byte range ("bytes=a-b", "bytes=a-", "bytes=-n"); 416 on a bad range. */
    public static function serveFile(string $path, string $mime, ?string $range): \Admin\Response;
}

final class Api {
    public function __construct(Store $store, \Admin\Keys $keys) {}
    public function listNotes(\Admin\Request $r): \Admin\Response;   // GET, notes:pickup, ?state=waiting|picked-up → {"notes":[{id,size,sha256,arrived_at,picked_up_at}]}
    public function getNote(\Admin\Request $r): \Admin\Response;     // GET, notes:pickup, ?id= → application/octet-stream
    public function pickedUp(\Admin\Request $r): \Admin\Response;    // POST, notes:pickup, ?id= → {"id","picked_up":true}; 404 unknown
    /** POST, drafts:publish; post fields piece, version; $files name => temp path (from $_FILES, by the thin page). */
    public function publishDraft(\Admin\Request $r, array $files): \Admin\Response; // 201 {"piece","version"}
    public function publishLockedKey(\Admin\Request $r, string $body): \Admin\Response; // POST, keys:publish → 201 {"fingerprint"}
}
```

Errors are JSON `{"error": "<reason>"}`: 405 `method`, 400 `bad_id`/`bad_state`, 404 `not_found`, 409 `exists`, 413 `too_large`, 422 `bad_file`/`bad_score`/`bad_key`/`unknown_key`. A failed `Keys::check` returns its own response unchanged, passed through `Http::finish`. The method is checked **after** the key check, so an unauthenticated caller learns nothing. `publishDraft` checks `score.json` parses, `schema === 1`, `piece.id === piece`, `draft === version`; `spectrogram.png` starts `"\x89PNG"`; `audio.webm` starts `"\x1A\x45\xDF\xA3"`; `audio.m4a` has `ftyp` at offset 4; at least one audio file; `score.musicxml` contains `<score-partwise`. `publishLockedKey` requires valid JSON with `v === 1`, `kdf === 'PBKDF2-SHA-256'`, `iterations >= 600000`, base64 `salt` (16 bytes), `iv` (12 bytes), `ct`, and a 64-hex `fingerprint`; body ≤ `MAX_LOCKED_KEY_BYTES`. The fingerprint need not be known to the server yet: `keys-init` and `keys-rotate` upload a new key's locked copy before the deploy that makes it current, and the page uses only the locked keys whose fingerprints are built into it.

- [ ] **Step 1: Write the failing tests** (`tests/php/MusicApiTest.php`)

```php
<?php
// The API-key routes: HTTPS only, the right scope only, header-only keys, no
// delete route at all, pickup marks after a separate call, drafts and locked
// keys validated before they are kept.
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

require_once __DIR__ . '/MusicFakes.php';

final class MusicApiTest extends TestCase
{
    private Music\Api $api;
    private Music\Store $store;
    private Admin\Keys $keys;

    protected function setUp(): void
    {
        [$this->store, $db, , $clock] = music_world();
        $this->keys = new Admin\Keys($db, $clock);
        $this->api = new Music\Api($this->store, $this->keys);
    }

    private function as(string $key, array $over = []): Admin\Request
    {
        return req(array_replace(['https' => true, 'method' => 'GET', 'headers' => ['Authorization' => "Bearer $key"]], $over));
    }

    private function body(Admin\Response $res): array
    {
        return json_decode($res->body, true, flags: JSON_THROW_ON_ERROR);
    }

    public function testScopesAreRegistered(): void
    {
        foreach (['notes:pickup', 'drafts:publish', 'keys:publish'] as $scope) {
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
        $tmp = admin_tmp_dir();
        $score = ['schema' => 1, 'piece' => ['id' => 'ch1-labyrinth', 'title' => 'T'], 'draft' => 1];
        file_put_contents("$tmp/score.json", json_encode($score));
        file_put_contents("$tmp/score.musicxml", '<?xml version="1.0"?><score-partwise version="4.0"></score-partwise>');
        file_put_contents("$tmp/audio.webm", "\x1A\x45\xDF\xA3" . random_bytes(100));
        file_put_contents("$tmp/spectrogram.png", "\x89PNG\r\n\x1A\n" . random_bytes(100));
        $files = [];
        foreach (['score.json', 'score.musicxml', 'audio.webm', 'spectrogram.png'] as $f) $files[$f] = "$tmp/$f";
        $post = ['method' => 'POST', 'post' => ['piece' => 'ch1-labyrinth', 'version' => '1']];
        self::assertSame(201, $this->api->publishDraft($this->as($k, $post), $files)->status);
        self::assertSame(409, $this->api->publishDraft($this->as($k, $post), $files)->status, 'drafts are immutable');
        $wrong = array_replace_recursive($post, ['post' => ['version' => '2']]);
        self::assertSame('bad_score', $this->body($this->api->publishDraft($this->as($k, $wrong), $files))['error'], 'draft must equal version');
        file_put_contents("$tmp/fake.png", 'GIF89a');
        self::assertSame(422, $this->api->publishDraft($this->as($k, array_replace_recursive($post, ['post' => ['version' => '3']])), ['spectrogram.png' => "$tmp/fake.png"] + $files)->status);
        $pickup = $this->keys->create('pickup', ['notes:pickup']);
        self::assertSame(403, $this->api->publishDraft($this->as($pickup, $post), $files)->status);
    }

    public function testLockedKeyUploadNeedsKeysScopeAndAWellFormedLock(): void
    {
        $k = $this->keys->create('publish', ['keys:publish']);
        $locked = ['v' => 1, 'kdf' => 'PBKDF2-SHA-256', 'iterations' => 600000, 'salt' => base64_encode(random_bytes(16)),
            'iv' => base64_encode(random_bytes(12)), 'fingerprint' => MUSIC_FP_CURRENT, 'ct' => base64_encode(random_bytes(2400))];
        $post = ['method' => 'POST'];
        self::assertSame(201, $this->api->publishLockedKey($this->as($k, $post), json_encode($locked))->status);
        self::assertSame(422, $this->api->publishLockedKey($this->as($k, $post), json_encode(['iterations' => 1000] + $locked))->status, 'weak KDF');
        self::assertSame(422, $this->api->publishLockedKey($this->as($k, $post), json_encode(['fingerprint' => 'xyz'] + $locked))->status);
        self::assertSame(422, $this->api->publishLockedKey($this->as($k, $post), json_encode(['salt' => base64_encode('short')] + $locked))->status);
        self::assertSame(201, $this->api->publishLockedKey($this->as($k, $post), json_encode(['fingerprint' => str_repeat('ef', 32)] + $locked))->status, 'a key not yet deployed');
        $drafts = $this->keys->create('drafts', ['drafts:publish']);
        self::assertSame(403, $this->api->publishLockedKey($this->as($drafts, $post), json_encode($locked))->status);
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
}
```

- [ ] **Step 2: Run to see it fail**

Run: `vendor/bin/phpunit tests/php/MusicApiTest.php`
Expected: FAIL — class `Music\Api` not found, and `testScopesAreRegistered` fails on unknown scopes.

- [ ] **Step 3: Implement**

In `admin/lib/bootstrap.php`, add to the `Admin\Keys::SCOPES` registry the three entries `notes:pickup` ("Pick up sealed music notes"), `drafts:publish` ("Publish music drafts") and `keys:publish` ("Upload the locked music notes key"), in the registry's existing shape.

`Http::header`: loop `$r->headers`, compare `strcasecmp`. `Http::finish`: `$res->headers = \Admin\Headers::apply($res->headers); $res->headers['Content-Security-Policy'] = self::csp(); return $res;`. `Http::json`: `finish(new Response($status, ['Content-Type' => 'application/json'], json_encode($data, JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES)))`. `serveFile`: `Accept-Ranges: bytes`, `Content-Type`, `Content-Length`; a `Range` matching `/^bytes=(\d*)-(\d*)$/` with a satisfiable span → 206 with `Content-Range: bytes a-b/size`; any other `Range` value → 416 with `Content-Range: bytes */size`.

`Api`: each method starts `if ($deny = $this->keys->check($r, '<scope>')) return Http::finish($deny);`, then checks the method (`405`), then the parameters, then calls `Store`, mapping `NoteRejected`/`DraftRejected` reasons to the statuses above.

- [ ] **Step 4: Run the tests**

Run: `vendor/bin/phpunit tests/php/MusicApiTest.php` — PASS; `vendor/bin/phpunit --testsuite site` — PASS (the admin tests still pass with the new scopes).

- [ ] **Step 5: Commit**

```bash
git add websites/www.cs/music/lib websites/www.cs/admin/lib/bootstrap.php websites/www.cs/tests/php/MusicApiTest.php
git commit -m "Music workroom: the API-key routes and their scopes

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb"
```

### Task 3: The session routes, the two page shells, and the hub entry

**Files:**
- Create: `websites/www.cs/music/lib/Pages.php`, `tests/php/MusicPagesTest.php`
- Modify: `music/lib/bootstrap.php` (require `Pages.php`), `admin/lib/bootstrap.php` (dashboard entry and fingerprint entry)

**Interfaces:**
- Consumes: `Store`, `PublicKeys`, `Http`, `Admin\Pages::requireAdmin`, `Admin\Sessions::csrf/checkCsrf`.
- Produces:

```php
namespace Music;

final class Pages {
    /** $assetVersion: 10 hex of games/workroom/dist/workroom.js (the ?v= on the script). */
    public function __construct(Store $store, \Admin\Pages $admin, \Admin\Sessions $sessions, ?PublicKeys $keys, string $assetVersion) {}
    public function index(\Admin\Request $r): \Admin\Response;       // GET index.php: pieces list (HTML)
    public function piece(\Admin\Request $r): \Admin\Response;       // GET piece.php?id=<piece>[&v=<n>]: the page shell (HTML)
    public function csrf(\Admin\Request $r): \Admin\Response;        // GET csrf.php → {"csrf"}
    public function notes(\Admin\Request $r, string $body): \Admin\Response; // GET notes.php → {"notes":[{id,size,arrived_at,picked_up_at}]}; POST (X-CSRF, body = bundle) → 201 {"id","csrf"}
    public function note(\Admin\Request $r): \Admin\Response;        // GET note.php?id= → bundle bytes
    public function delete(\Admin\Request $r): \Admin\Response;      // POST delete.php (X-CSRF; post id=<id> or all=1) → {"deleted":n,"csrf"}
    public function lockedKeys(\Admin\Request $r): \Admin\Response;  // GET locked-keys.php → {"keys":[{fingerprint, locked: object}]}
    public function drafts(\Admin\Request $r): \Admin\Response;      // GET drafts.php?piece= → {"drafts":[{version,published_at}]}
    public function draftFile(\Admin\Request $r): \Admin\Response;   // GET draft.php?piece=&v=&file= (Range for audio)
}
```

Every method: non-HTTPS → 403 JSON `{"error":"https"}` (HTML pages: plain 403); then `requireAdmin` (its redirect passes through `Http::finish`); then for POST, `checkCsrf($r, Http::header($r, 'X-CSRF') ?? '')` false → 403 `{"error":"csrf"}`; then the work. Every POST success returns the next token from `$sessions->csrf($r)`. Upload errors: 413 `too_large`, 409 `full`, 422 `bad_header`/`unknown_key`, 503 `no_key`. The page shell (`piece`) is a full HTML document: `<body data-view="piece" data-piece="<id>" data-version="<n or empty>">`, `<meta name="csrf" content="...">`, `<link rel="stylesheet" href="music.css?v=...">`, `<main id="workroom"></main>`, `<script type="module" src="../games/workroom/dist/workroom.js?v=<assetVersion>"></script>`. `index` renders, server side, one row per piece (latest version; `piece.title` and the first three `changes[].text` read from that draft's `score.json`, all escaped with `htmlspecialchars(..., ENT_QUOTES)`), the total waiting count, and the same mount and script with `data-view="index"`. Draft files are served with `Content-Type` from a fixed map (`score.json` application/json, `score.musicxml` application/vnd.recordare.musicxml+xml, `audio.webm` audio/webm, `audio.m4a` audio/mp4, `spectrogram.png` image/png).

In `admin/lib/bootstrap.php`: add the dashboard `Music workroom` → `../music/` to the hub's dashboard list, and to the fingerprint list the entry `Music notes key` whose value is `Music\PublicKeys::display($k->current)` for `$k = Music\PublicKeys::fromFile(__DIR__ . '/../../music/keys/public.json')`, or `not made yet (make keys-init)` when null (require `../../music/lib/PublicKeys.php` there; it has no dependencies).

- [ ] **Step 1: Write the failing tests** (`tests/php/MusicPagesTest.php`)

```php
<?php
// The session routes: a session for everything, CSRF on every POST (burned on
// use, the next token returned), deletes remove row and file, an API key is
// never a session, the locked key and drafts go only to a session.
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

require_once __DIR__ . '/MusicFakes.php';

final class MusicPagesTest extends TestCase
{
    private Music\Pages $pages;
    private Music\Store $store;
    private Admin\Sessions $sessions;
    private Admin\Keys $keys;
    private string $dir;

    protected function setUp(): void
    {
        [$this->store, $db, $this->dir, $clock] = music_world();
        $this->sessions = new Admin\Sessions($db, $clock);
        $this->keys = new Admin\Keys($db, $clock);
        $admin = new Admin\Pages($db, $clock, new MemoryMailer(), 'https://example.test/admin/');
        $this->pages = new Music\Pages($this->store, $admin, $this->sessions, music_keys(), '0123456789');
    }

    private function csrfFor(Admin\Request $r): string
    {
        return json_decode($this->pages->csrf($r)->body, true)['csrf'];
    }

    public function testEveryRouteNeedsASession(): void
    {
        $anon = req(['https' => true, 'query' => ['id' => str_repeat('0', 32), 'piece' => 'x', 'v' => '1', 'file' => 'score.json']]);
        foreach (['index', 'piece', 'csrf', 'note', 'lockedKeys', 'drafts', 'draftFile', 'delete'] as $route) {
            self::assertSame(303, $this->pages->$route($anon)->status, $route);
        }
        self::assertSame(303, $this->pages->notes($anon, '')->status);
    }

    public function testAnApiKeyIsNotASession(): void
    {
        $key = $this->keys->create('all', ['notes:pickup', 'drafts:publish', 'keys:publish']);
        $id = $this->store->addNote(music_sealed())['id'];
        $this->store->putLockedKey(MUSIC_FP_CURRENT, '{"v":1}');
        $bearer = req(['https' => true, 'method' => 'POST', 'headers' => ['Authorization' => "Bearer $key"], 'post' => ['id' => $id]]);
        self::assertSame(303, $this->pages->delete($bearer)->status);
        self::assertNotNull($this->store->noteBytes($id), 'an API key cannot delete');
        self::assertSame(303, $this->pages->lockedKeys(req(['https' => true, 'headers' => ['Authorization' => "Bearer $key"]]))->status, 'locked key only to a session');
    }

    public function testHttpsIsRequired(): void
    {
        $r = music_signed_in($this->sessions, ['https' => false]);
        self::assertSame(403, $this->pages->lockedKeys($r)->status);
    }

    public function testUploadNeedsCsrfAndReturnsTheNextToken(): void
    {
        $r = music_signed_in($this->sessions, ['method' => 'POST']);
        self::assertSame(403, $this->pages->notes($r, music_sealed())->status, 'no token');
        $withToken = fn(string $t) => req(['https' => true, 'method' => 'POST', 'cookies' => $r->cookies, 'headers' => ['X-CSRF' => $t]]);
        $token = $this->csrfFor(req(['https' => true, 'cookies' => $r->cookies]));
        $res = $this->pages->notes($withToken($token), music_sealed());
        self::assertSame(201, $res->status);
        $body = json_decode($res->body, true);
        self::assertMatchesRegularExpression('/^[0-9a-f]{32}$/', $body['id']);
        self::assertNotSame($token, $body['csrf']);
        self::assertSame(403, $this->pages->notes($withToken($token), music_sealed())->status, 'a token works once');
        self::assertSame(201, $this->pages->notes($withToken($body['csrf']), music_sealed())->status, 'the returned token works');
    }

    public function testUploadLimitsAreReported(): void
    {
        $r = music_signed_in($this->sessions);
        $post = fn() => req(['https' => true, 'method' => 'POST', 'cookies' => $r->cookies, 'headers' => ['X-CSRF' => $this->csrfFor($r)]]);
        self::assertSame(413, $this->pages->notes($post(), music_sealed(MUSIC_FP_CURRENT, Music\Store::MAX_NOTE_BYTES))->status);
        self::assertSame(422, $this->pages->notes($post(), music_sealed(str_repeat('ef', 32)))->status);
    }

    public function testDeleteOneAndAllRemoveRowAndFile(): void
    {
        $r = music_signed_in($this->sessions);
        $a = $this->store->addNote(music_sealed())['id'];
        $b = $this->store->addNote(music_sealed())['id'];
        $post = fn(array $fields, ?string $t = null) => req(['https' => true, 'method' => 'POST', 'cookies' => $r->cookies,
            'headers' => ['X-CSRF' => $t ?? $this->csrfFor($r)], 'post' => $fields]);
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

    public function testLockedKeysAndHistoryGoToTheSession(): void
    {
        $r = music_signed_in($this->sessions);
        $this->store->putLockedKey(MUSIC_FP_CURRENT, '{"v":1,"fingerprint":"' . MUSIC_FP_CURRENT . '"}');
        $id = $this->store->addNote(music_sealed())['id'];
        $this->store->markPickedUp($id);
        $keys = json_decode($this->pages->lockedKeys($r)->body, true)['keys'];
        self::assertSame(MUSIC_FP_CURRENT, $keys[0]['locked']['fingerprint']);
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

    public function testHubListsTheWorkroomAndItsFingerprint(): void
    {
        $db = admin_tmp_db();
        $clock = new FakeClock(1_800_000_000);
        $sessions = new Admin\Sessions($db, $clock);
        $hub = (new Admin\Pages($db, $clock, new MemoryMailer(), 'https://example.test/admin/'))->hub(music_signed_in($sessions));
        self::assertSame(200, $hub->status);
        self::assertStringContainsString('href="../music/"', $hub->body);
        self::assertStringContainsString('Music notes key', $hub->body);
    }
}
```

- [ ] **Step 2: Run to see it fail**

Run: `vendor/bin/phpunit tests/php/MusicPagesTest.php`
Expected: FAIL — class `Music\Pages` not found.

- [ ] **Step 3: Implement** `Music\Pages` and the two `admin/lib/bootstrap.php` entries as described above. The piece id is checked against `/^[a-z0-9][a-z0-9-]{0,47}$/` (else 400 page "No such piece."). `notes()` dispatches on `$r->method`: GET lists (no `sha256` in the page's list), POST uploads, anything else 405.

- [ ] **Step 4: Run the tests**

Run: `vendor/bin/phpunit tests/php/MusicPagesTest.php` — PASS; `vendor/bin/phpunit --testsuite site` — PASS.

- [ ] **Step 5: Commit**

```bash
git add websites/www.cs/music/lib websites/www.cs/admin/lib/bootstrap.php websites/www.cs/tests/php/MusicPagesTest.php
git commit -m "Music workroom: session routes, page shells and the hub entry

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb"
```

### Task 4: Thin pages, serving rules, deploy, docs; open PR 1

**Files:**
- Create: `music/index.php`, `piece.php`, `csrf.php`, `notes.php`, `note.php`, `delete.php`, `locked-keys.php`, `drafts.php`, `draft.php`, `api/notes.php`, `api/note.php`, `api/picked-up.php`, `api/drafts.php`, `api/locked-key.php`, `music/.htaccess`, `music/music.css`, `music/README.md`, `tests/php/MusicDeployTest.php`
- Modify: `music/lib/bootstrap.php` (`music_run`, `music_read_body`, `music_emit`), `docker/nginx/default.conf`, `deploy.sh`, `.gitignore`

**Interfaces:**
- Consumes: everything from Tasks 1–3.
- Produces (in `music/lib/bootstrap.php`):

```php
/** Builds the request, the database and the controllers, runs $route, emits; StorageUnavailable → Admin\Pages::storageDown(). */
function music_run(callable $route): void; // $route(Music\Pages $pages, Music\Api $api, Admin\Request $r): Admin\Response
/** php://input, at most $max + 1 bytes (so the caller can tell "too large"). */
function music_read_body(int $max): string;
function music_emit(Admin\Response $res): void;
/** name => temp path for the uploaded draft files that arrived without error. */
function music_draft_uploads(): array;
```

Each thin page is three lines, for example `music/api/note.php`:

```php
<?php
declare(strict_types=1);
require __DIR__ . '/../lib/bootstrap.php';
music_run(fn(Music\Pages $p, Music\Api $a, Admin\Request $r) => $a->getNote($r));
```

`notes.php` passes `music_read_body(Music\Store::MAX_NOTE_BYTES)`; `api/locked-key.php` passes `music_read_body(Music\Store::MAX_LOCKED_KEY_BYTES)`; `api/drafts.php` passes `music_draft_uploads()` (maps the form fields `score`, `musicxml`, `audio_webm`, `audio_m4a`, `spectrogram` to the published names). `music_run` builds `Admin\Pages` the way `admin/lib/bootstrap.php` builds it for the admin pages, and the asset version as `substr(hash_file('sha256', __DIR__ . '/../../games/workroom/dist/workroom.js') ?: '', 0, 10)` (empty string when the file is missing, until PR 2 lands).

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
        foreach (['music/index.php', 'music/piece.php', 'music/notes.php', 'music/delete.php', 'music/api/note.php', 'music/api/picked-up.php',
            'music/lib/Store.php', 'music/lib/.htaccess', 'music/.htaccess', 'music/music.css'] as $f) {
            self::assertContains($f, $list, $f);
        }
    }

    public function testNeverShipsToolsDraftsOrDocs(): void
    {
        foreach (self::shipped() as $f) {
            self::assertDoesNotMatchRegularExpression('~^music/(tools|pieces)/|^music/README\.md$|^compose\.music-local\.yaml$|fastcgi_params~', $f, $f);
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

- [ ] **Step 2: Run to see it fail**

Run: `vendor/bin/phpunit tests/php/MusicDeployTest.php` — FAIL (nothing under `music/` ships; nginx has no music rules).

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

Write the thin pages, `music.css` (dark site look: the site's `#0d0f12` background, `#e8ebf0` text, red `#e02020` accents, a list of pieces as cards), and `music/README.md` (what the workroom is; the security model in short; the routes and scopes; `make` targets that exist so far; how to create the two API keys on the hub).

- [ ] **Step 4: Run the gates**

Run, from `websites/www.cs`: `vendor/bin/phpunit tests/php/MusicDeployTest.php` — PASS; `vendor/bin/phpunit --testsuite site` — PASS; `vendor/bin/phpunit --testsuite kit` — PASS. Then a local smoke on its own project: `name=music-api-$$; docker compose -f compose.yaml -p $name up -d --build www-cs-php www-cs-nginx; port=$(docker compose -f compose.yaml -p $name port www-cs-nginx 80); curl -s -o /dev/null -w '%{http_code}\n' "http://$port/music/lib/Store.php"` prints `403`; `curl -s -o /dev/null -w '%{http_code}\n' "http://$port/music/"` prints `403` (not HTTPS); `docker compose -f compose.yaml -p $name down -v`.

- [ ] **Step 5: Commit and open PR 1**

```bash
git add websites/www.cs/music websites/www.cs/tests/php/MusicDeployTest.php websites/www.cs/docker/nginx/default.conf websites/www.cs/deploy.sh websites/www.cs/.gitignore
git commit -m "Music workroom: pages, API files, serving and deploy rules

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb"
```

Open the PR (foundry `pr-fix-loop` as for every siue PR): title "Music workroom: API and storage"; body: summary, spec and plan paths, the after-deploy check (`curl -s -o /dev/null -w '%{http_code}' https://www.cs.siue.edu/~wgrim/music/lib/Store.php` → 403; the hub lists "Music workroom" and "Music notes key: not made yet"), and the PR attribution lines. CI will select every browser spec (`select.ts` maps unknown site paths to ALL); that is expected.

---

# PR 2: the page, its four views and the glossary (branch `music/page`)

Start from `main` after PR 1 merged.

### Task 5: The workroom kit folder, the score model and the glossary

**Files:**
- Create: `websites/www.cs/games/workroom/build.json`, `tsconfig.json`, `tsconfig.test.json`, `test.sh`, `src/tsconfig.dom.json`, `src/score.ts`, `src/glossary.ts`, `src/main.ts`
- Create: `games/workroom/test/score.test.ts`, `test/glossary.test.ts`, `test/committed-drafts.test.ts`, `test/fixtures/score-v1.json`
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
export const FAMILIES = ['strings', 'brass', 'woodwinds', 'percussion', 'choir', 'keys', 'synth', 'harp', 'bells'] as const;
export type Family = (typeof FAMILIES)[number];
export const CHARACTER_COLORS: Readonly<Record<string, string>> = { Ariadne: '#d4a017', Minotaur: '#c0392b', Daedalus: '#b08d57', Athens: '#3b6fb6' };
export interface Tempo { bar: number; bpm: number; beats: number; unit: 1 | 2 | 4 | 8 | 16 }
export interface Section { id: string; name: string; from_bar: number; to_bar: number; color: string }
export interface Lane { id: string; name: string; family: Family; icon: Family; color: string }
export interface MotifSpan { lane: string; from: number; to: number }
export interface Motif { id: string; character: string; color: string; spans: MotifSpan[] }
export interface ScoreNote { lane: string; start: number; length: number; pitch: number; velocity: number; motif: string | null }
export interface GlossaryUse { term: string; from: number; to: number }
export interface AudioSource { file: 'audio.webm' | 'audio.m4a'; type: string }
export interface Spectrogram { file: 'spectrogram.png'; low_hz: number; high_hz: number; scale: 'log' | 'linear' }
export interface Change { from_bar: number; to_bar: number; lane: string | null; text: string; answers: string[] }
export interface Score {
  schema: 1; piece: { id: string; title: string }; draft: number; made: string; duration: number; bars: number;
  tempo: Tempo[]; sections: Section[]; lanes: Lane[]; motifs: Motif[]; notes: ScoreNote[];
  energy: [number, number][]; glossary: GlossaryUse[]; audio: AudioSource[]; spectrogram: Spectrogram;
  musicxml: 'score.musicxml'; changes: Change[];
}
export type Parsed = { ok: true; score: Score } | { ok: false; error: string };
/** Validates every rule in the plan's schema table; the first broken rule is the error, naming its path (e.g. "sections[1].from_bar"). */
export function parseScore(raw: unknown): Parsed;
export function unknownSchemaMessage(n: unknown): string;

// src/glossary.ts (DOM-free)
export interface Term { id: string; word: string; lines: [string, string] }
export const GLOSSARY: readonly Term[];
export function term(id: string): Term | undefined;
/** The glossary uses in a score, in order of first appearance, with their definitions. */
export function termsIn(score: Score): { term: Term; from: number; to: number }[];
/** Splits text into plain runs and glossary words (whole words, case-insensitive, first match wins). */
export function splitTerms(text: string): ({ text: string } | { term: Term; text: string })[];
```

`GLOSSARY` holds at least these ids, each with its two plain-words lines: `ostinato`, `motif`, `theme`, `phrygian`, `crescendo`, `decrescendo`, `octave`, `chord`, `drone`, `pedal-point`, `tremolo`, `pizzicato`, `legato`, `staccato`, `tempo`, `bar`, `beat`, `dynamics`, `unison`, `minor`, `major`, `cadence`, `orchestration`, `swell`. For example:

```ts
{ id: 'ostinato', word: 'ostinato', lines: ['A short pattern repeated over and over underneath the music.', 'It drives the piece forward, like footsteps in the dark.'] },
{ id: 'phrygian', word: 'Phrygian', lines: ['A minor-sounding scale whose second note is only a half step up.', 'That half step gives an ancient, Mediterranean, uneasy colour.'] },
```

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
  // DOM-free program: the score model, layout, sealing and stores cannot reach the page. See games/_kit/README.md.
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

Every later task that adds a DOM-free module appends it to `tsconfig.json`'s `files`; every DOM module or `.tsx` goes in `src/tsconfig.dom.json`'s `files`.

- [ ] **Step 1: Write the fixture** `games/workroom/test/fixtures/score-v1.json` (8 bars of 4/4 at 120 bpm: two seconds a bar):

```json
{
  "schema": 1,
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
  "motifs": [
    { "id": "ariadne", "character": "Ariadne", "color": "#d4a017", "spans": [{ "lane": "brass", "from": 8, "to": 16 }] }
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

- [ ] **Step 2: Write the failing tests**

`test/score.test.ts`:

```ts
// The score.json schema, version 1: the fixture parses; an unknown schema is
// refused with the reload message; each rule names the path it breaks.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseScore, unknownSchemaMessage, type Score } from '../src/score.ts';

const fixture = (): Score => JSON.parse(readFileSync(new URL('./fixtures/score-v1.json', import.meta.url), 'utf8')) as Score;
const broken = (change: (s: Score) => void): string => {
  const s = fixture();
  change(s);
  const r = parseScore(s);
  assert.equal(r.ok, false);
  return r.ok ? '' : r.error;
};

test('the fixture is a valid schema 1 score', () => {
  const r = parseScore(fixture());
  assert.ok(r.ok, r.ok ? '' : r.error);
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
  assert.match(broken(s => { s.sections[1]!.from_bar = 6; }), /sections\[1\]\.from_bar/);
  assert.match(broken(s => { s.sections[1]!.to_bar = 7; }), /sections\[1\]\.to_bar/);
  assert.match(broken(s => { s.motifs[0]!.color = '#ffffff'; }), /motifs\[0\]\.color/);
  assert.match(broken(s => { s.notes[5]!.length = 5; }), /notes\[5\]/);
  assert.match(broken(s => { s.notes[0]!.lane = 'violas'; }), /notes\[0\]\.lane/);
  assert.match(broken(s => { s.notes[0]!.motif = 'minotaur'; }), /notes\[0\]\.motif/);
  assert.match(broken(s => { s.notes[0]!.pitch = 128; }), /notes\[0\]\.pitch/);
  assert.match(broken(s => { s.energy[0] = [1, 0.2]; }), /energy/);
  assert.match(broken(s => { s.energy[1] = [8, 1.5]; }), /energy\[1\]/);
  assert.match(broken(s => { s.glossary[0]!.term = 'flibbertigibbet'; }), /glossary\[0\]\.term/);
  assert.match(broken(s => { s.glossary[0]!.to = 20; }), /glossary\[0\]/);
  assert.match(broken(s => { s.tempo[0]!.bar = 2; }), /tempo\[0\]\.bar/);
  assert.match(broken(s => { s.audio = []; }), /audio/);
  assert.match(broken(s => { s.lanes[1]!.id = 'strings-low'; }), /lanes\[1\]\.id/);
  assert.match(broken(s => { s.changes[0]!.answers = ['xyz']; }), /changes\[0\]\.answers/);
  assert.match(broken(s => { s.lanes[0]!.color = 'red'; }), /lanes\[0\]\.color/);
});
```

`test/glossary.test.ts`:

```ts
// The glossary: every term has two lines; a score's uses come back in order
// with their clip spans; words in text become tappable terms.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { GLOSSARY, splitTerms, term, termsIn } from '../src/glossary.ts';
import type { Score } from '../src/score.ts';

test('every term has an id, a word and two non-empty lines', () => {
  assert.ok(GLOSSARY.length >= 24);
  for (const t of GLOSSARY) {
    assert.match(t.id, /^[a-z][a-z-]*$/);
    assert.ok(t.lines[0].length > 0 && t.lines[1].length > 0, t.id);
  }
  assert.equal(new Set(GLOSSARY.map(t => t.id)).size, GLOSSARY.length);
});

test("a score's terms come with their clips", () => {
  const score = JSON.parse(readFileSync(new URL('./fixtures/score-v1.json', import.meta.url), 'utf8')) as Score;
  assert.deepEqual(termsIn(score).map(u => [u.term.id, u.from, u.to]), [['ostinato', 0, 4], ['motif', 8, 12]]);
});

test('words in text become terms, whole words only', () => {
  const parts = splitTerms('A Phrygian ostinato, motifs and a crescendo.');
  assert.deepEqual(parts.map(p => ('term' in p ? `[${p.term.id}]` : p.text)).join(''), 'A [phrygian] [ostinato], motifs and a [crescendo].');
  assert.equal(term('octave')?.word, 'octave');
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

test('every committed draft validates', () => {
  assert.ok(existsSync(PIECES), 'music/pieces/ exists');
  for (const piece of readdirSync(PIECES, { withFileTypes: true }).filter(d => d.isDirectory())) {
    for (const v of readdirSync(join(PIECES, piece.name)).filter(n => /^v\d+$/.test(n))) {
      const r = parseScore(JSON.parse(readFileSync(join(PIECES, piece.name, v, 'score.json'), 'utf8')));
      assert.ok(r.ok, `${piece.name}/${v}: ${r.ok ? '' : r.error}`);
      if (r.ok) assert.deepEqual([r.score.piece.id, `v${r.score.draft}`], [piece.name, v]);
    }
  }
});
```

- [ ] **Step 3: Run to see them fail**

Run, from `websites/www.cs/games`: `node --test workroom/test/*.test.ts`
Expected: FAIL — cannot find `../src/score.ts`.

- [ ] **Step 4: Implement** `score.ts` (a hand-written validator: one small checker per field, each returning a path-named message), `glossary.ts`, `main.ts` (for now: `document.getElementById('workroom')!.textContent = 'Loading…';`), the folder files above and `music/pieces/.gitkeep`. Run `node _kit/build/build.mjs workroom` to write `dist/`.

- [ ] **Step 5: Run the tests and the build check**

Run: `node --test workroom/test/*.test.ts` — PASS; `sh workroom/test.sh` — exit 0; `sh units.sh` — PASS (includes the kit's `typed-tests.test.ts`, which checks the new folder's test program).

- [ ] **Step 6: Commit**

```bash
git add websites/www.cs/games/workroom websites/www.cs/music/pieces/.gitkeep websites/www.cs/music/README.md
git commit -m "Music workroom: the page's kit folder, score schema 1 and glossary

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb"
```

### Task 6: Tempo, zoom, the story timeline's layout and hit testing

**Files:**
- Create: `games/workroom/src/tempo.ts`, `src/zoom.ts`, `src/timeline.ts`, `src/hit.ts`, `test/tempo.test.ts`, `test/zoom.test.ts`, `test/timeline.test.ts`, `test/hit.test.ts`
- Modify: `games/workroom/tsconfig.json` (add the four files)

**Interfaces:**
- Consumes: `Score` from `score.ts`.
- Produces:

```ts
// src/tempo.ts
export interface TempoMap {
  /** Seconds at which bar n (1-based) starts; bars past the last clamp to the end. */
  barStart(bar: number): number;
  /** The bar (1-based integer) playing at t seconds; clamped to [1, bars]. */
  barAt(t: number): number;
}
export function tempoMap(score: Score): TempoMap;

// src/zoom.ts
export interface View { start: number; pxPerSec: number; width: number }
export interface Bounds { duration: number; minPxPerSec: number; maxPxPerSec: number }
export const MAX_PX_PER_SEC = 400;
export function boundsFor(duration: number, width: number): Bounds; // minPxPerSec = width / duration
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
  ribbons: { motif: string; character: string; color: string; lane: string; rect: Rect }[]; // at the bottom of their lane
  barTicks: { bar: number; x: number }[];                        // visible bar starts
}
export function layoutTimeline(score: Score, tempo: TempoMap, view: View): TimelineLayout;

// src/hit.ts
export type Zone = 'energy' | 'sections' | 'lanes' | 'none';
export interface Hit { time: number; bar: number; zone: Zone; laneId: string | null; sectionId: string | null }
export function hitTimeline(layout: TimelineLayout, view: View, tempo: TempoMap, x: number, y: number): Hit;
export interface Span { from: number; to: number; fromBar: number; toBar: number; laneId: string | null }
/** The span between two hits, in time order; the lane only when both hits are in the same lane. */
export function spanBetween(a: Hit, b: Hit, tempo: TempoMap): Span;
```

Vertical order: energy band `0..48`, sections `48..76`, then one lane per row from `76`, `laneH` each. Bars are drawn and hit from the tempo map, never from pixel arithmetic alone.

- [ ] **Step 1: Write the failing tests**

`test/tempo.test.ts`:

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { tempoMap } from '../src/tempo.ts';
import type { Score } from '../src/score.ts';

const score = (): Score => JSON.parse(readFileSync(new URL('./fixtures/score-v1.json', import.meta.url), 'utf8')) as Score;

test('one tempo: two seconds a bar', () => {
  const m = tempoMap(score());
  assert.deepEqual([m.barStart(1), m.barStart(5), m.barStart(8)], [0, 8, 14]);
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

test('pinch: the times under the fingers follow them', () => {
  const v = pinch(fit, [100, 300], [0, 400], b);
  assert.deepEqual(v, { start: 2, pxPerSec: 100, width: 800 });
  assert.deepEqual(pinch(fit, [100, 100], [0, 400], b), fit, 'fingers on one spot change nothing');
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

const score = JSON.parse(readFileSync(new URL('./fixtures/score-v1.json', import.meta.url), 'utf8')) as Score;
const tempo = tempoMap(score);
const close = (a: number, b: number) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≈ ${b}`);

test('sections, lanes and ribbons in pixels at fit', () => {
  const l = layoutTimeline(score, tempo, fitView(16, 800));
  assert.deepEqual(l.sections.map(s => [s.id, s.rect]), [
    ['stirs', { x: 0, y: 48, w: 400, h: 28 }],
    ['thread', { x: 400, y: 48, w: 400, h: 28 }],
  ]);
  assert.deepEqual(l.lanes.map(x => [x.id, x.rect.y, x.rect.h]), [['strings-low', 76, 36], ['brass', 112, 36]]);
  assert.deepEqual(l.ribbons, [{ motif: 'ariadne', character: 'Ariadne', color: '#d4a017', lane: 'brass', rect: { x: 400, y: 142, w: 400, h: TIMELINE.ribbonH } }]);
  assert.equal(l.height, 148);
  assert.deepEqual(l.barTicks.map(t => t.x), [0, 100, 200, 300, 400, 500, 600, 700]);
  const [p0, p1, p2] = l.energy.points;
  close(p0![0], 0); close(p0![1], 38.4);
  close(p1![0], 400); close(p1![1], 24);
  close(p2![0], 800); close(p2![1], 4.8);
});

test('zoomed in, layout follows the view', () => {
  const v = zoomAt(fitView(16, 800), 400, 4, boundsFor(16, 800)); // 200 px/s, start 6
  const l = layoutTimeline(score, tempo, v);
  assert.deepEqual(l.sections.map(s => [s.id, s.rect.x, s.rect.w]), [['stirs', -1200, 1600], ['thread', 400, 1600]]);
  assert.deepEqual(l.barTicks.map(t => t.bar), [4, 5], 'only bar starts with 0 <= x < width (6 s and 8 s)');
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
const tempo = tempoMap(score);
const view = fitView(16, 800);
const layout = layoutTimeline(score, tempo, view);

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

test('a span runs forward and keeps a shared lane only', () => {
  const a = hitTimeline(layout, view, tempo, 700, 120);
  const b = hitTimeline(layout, view, tempo, 450, 120);
  assert.deepEqual(spanBetween(a, b, tempo), { from: 9, to: 14, fromBar: 5, toBar: 8, laneId: 'brass' });
  const c = hitTimeline(layout, view, tempo, 50, 80);
  assert.equal(spanBetween(a, c, tempo).laneId, null);
});
```

- [ ] **Step 2: Run to see them fail**

Run: `node --test workroom/test/tempo.test.ts workroom/test/zoom.test.ts workroom/test/timeline.test.ts workroom/test/hit.test.ts` — FAIL (modules missing).

- [ ] **Step 3: Implement** the four modules. `tempoMap` precomputes each bar's start from the tempo list (`secondsPerBar = beats * 60 / bpm`). `layoutTimeline` lists every section and ribbon (SVG clips what is off screen) and only the bar ticks with `0 ≤ x < width`. `hitTimeline`: `time = clamp(xToTime(view, x), 0, duration)`; zone from y against the layout's bands; `laneId` from the lane whose rect contains y; `sectionId` from the section containing `bar` (any y).

- [ ] **Step 4: Run the tests** — PASS. Add the files to `tsconfig.json`, run `node _kit/build/build.mjs workroom --check` — exit 0.

- [ ] **Step 5: Commit**

```bash
git add websites/www.cs/games/workroom
git commit -m "Music workroom: tempo map, zoom, timeline layout and hit testing

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
/** Pitch range = the shown notes' lowest - 1 .. highest + 1; higher pitch is higher (smaller y); colour = motif colour, else lane colour. */
export function layoutRoll(score: Score, view: View, height: number, lanes?: ReadonlySet<string>): RollLayout;
export function pitchName(midi: number): string; // 60 → "C4", 61 → "C#4"
export function hitRoll(roll: RollLayout, view: View, tempo: TempoMap, score: Score, x: number, y: number): Hit & { pitch: number | null; noteIndex: number | null };

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
const view = fitView(16, 800);

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

### Task 8: The four views, the shared playhead, the glossary cards and sheet music

**Files:**
- Create: `games/workroom/src/player.ts`, `src/load.ts`, `src/sheet.ts`, `src/ui/Workroom.tsx`, `src/ui/ViewTabs.tsx`, `src/ui/Timeline.tsx`, `src/ui/PianoRoll.tsx`, `src/ui/SoundPicture.tsx`, `src/ui/Sheet.tsx`, `src/ui/Glossary.tsx`, `src/ui/Player.tsx`
- Create: `games/workroom/test/player.test.ts`, `test/load.test.ts`, `test/views.test.ts`
- Modify: `games/workroom/src/main.ts`, `tsconfig.json` (`player.ts`, `load.ts`), `src/tsconfig.dom.json` (`sheet.ts` and the `.tsx` files), `build.json` (entry `sheet`), `games/package.json` and `games/package-lock.json` (`opensheetmusicdisplay`), `music/music.css`

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

// src/load.ts (DOM-free; fetch is a port)
export type Fetch = (url: string, init?: { method?: string; headers?: Record<string, string>; body?: Uint8Array }) => Promise<{ ok: boolean; status: number; redirected: boolean; headers: { get(n: string): string | null }; json(): Promise<unknown>; arrayBuffer(): Promise<ArrayBuffer>; text(): Promise<string> }>;
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
export function Workroom(p: WorkroomProps): JSX.Element; // owns view (View), time (number), tab ('story'|'roll'|'sound'|'sheet'), lane filter, open term;
// above the views: the draft picker, the Player, the ViewTabs, a "Words in this piece" row of Glossary.Word buttons from termsIn(score),
// and Claude's change list (changes[].text through splitTerms) pinned to its bars on the story timeline

// src/ui/Timeline.tsx
export interface TimelineProps { score: Score; tempo: TempoMap; view: View; time: number; onSeek(t: number): void; onView(v: View): void; onTerm(id: string): void; overlay?: ComponentChildren }
// renders <svg class="tl"> with data-section, data-lane, data-motif attributes; section names run through splitTerms → <Glossary.Word>

// src/ui/PianoRoll.tsx   props { score, tempo, view, time, lanes?: ReadonlySet<string>, onSeek, onView }
// src/ui/SoundPicture.tsx props { score, view, time, imageSrc: string, onSeek, onView }  (an <img> stretched by the view, the axis labels and the legend)
// src/ui/Sheet.tsx       props { musicxmlSrc: string, laneId: string, lanes: Lane[], onLane(id: string): void }
// src/ui/Glossary.tsx    export function Word(p: { term: Term; text: string; onOpen(id: string): void }): JSX.Element;
//                        export function Card(p: { term: Term; clip: Clip | null; onHear(c: Clip): void; onClose(): void }): JSX.Element;
// src/ui/Player.tsx      props { src: AudioSource[], audioSrc(file): string, time: number, onTime(t: number): void, clip: Clip | null, onClipDone(): void }
//                        (an <audio> element, one button named "Play" or "Pause", the time as bar and seconds)
// src/ui/ViewTabs.tsx    props { tab, onTab } — four buttons: "Story", "Piano roll", "Sound picture", "Sheet music"
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
import type { Score } from '../src/score.ts';

installDocument();
const ui = await importTsx<{
  tl: typeof import('../src/ui/Timeline.tsx');
  gl: typeof import('../src/ui/Glossary.tsx');
  tabs: typeof import('../src/ui/ViewTabs.tsx');
}>(import.meta.dirname, { tl: '../src/ui/Timeline.tsx', gl: '../src/ui/Glossary.tsx', tabs: '../src/ui/ViewTabs.tsx' });

const score = JSON.parse(readFileSync(new URL('./fixtures/score-v1.json', import.meta.url), 'utf8')) as Score;
const withAttr = (root: StubElement, name: string) => walk(root).filter(e => e._attrs[name] !== undefined);

test('the timeline draws sections, lanes and the motif ribbon', () => {
  const root = makeEl('root');
  render(h(ui.tl.Timeline, { score, tempo: tempoMap(score), view: fitView(16, 800), time: 0, onSeek: () => {}, onView: () => {}, onTerm: () => {} }), renderTarget(root));
  assert.deepEqual(withAttr(root, 'data-section').map(e => e._attrs['data-section']), ['stirs', 'thread']);
  assert.deepEqual(withAttr(root, 'data-lane').map(e => e._attrs['data-lane']), ['strings-low', 'brass']);
  assert.deepEqual(withAttr(root, 'data-motif').map(e => e._attrs['data-motif']), ['ariadne']);
  assert.match(root.textContent, /The Labyrinth stirs/);
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

test('four view tabs', () => {
  const root = makeEl('root');
  const picked: string[] = [];
  render(h(ui.tabs.ViewTabs, { tab: 'story', onTab: t => picked.push(t) }), renderTarget(root));
  const buttons = walk(root).filter(e => e.localName === 'button');
  assert.deepEqual(buttons.map(b => b.textContent), ['Story', 'Piano roll', 'Sound picture', 'Sheet music']);
  fire(buttons[3]!, 'click');
  assert.deepEqual(picked, ['sheet']);
});
```

The timeline's SVG carries `data-timeline=""`, and pointer coordinates are taken as `e.clientX - rect.left` with `rect = el.getBoundingClientRect()`, treating a missing `left`/`top` as 0 (the stub's rect has only width and height).

- [ ] **Step 2: Run to see them fail** — `node --test workroom/test/player.test.ts workroom/test/load.test.ts workroom/test/views.test.ts` — FAIL.

- [ ] **Step 3: Add the notation library**: from `websites/www.cs/games`, `npm install --save-exact opensheetmusicdisplay@1`; confirm `node_modules/opensheetmusicdisplay/` has a `LICENSE` file (the build refuses a package without one).

- [ ] **Step 4: Implement** the modules and components. `Workroom` keeps one `time` for all four views and the `<audio>`: a view's `onSeek(t)` sets `audio.currentTime = t`; `timeupdate` and a `requestAnimationFrame` loop while playing set `time`; every view draws a playhead line at `timeToX(view, time)`. The Sound picture `<img>` is positioned with `style={{ left: \`${-view.start * view.pxPerSec}px\`, width: \`${score.duration * view.pxPerSec}px\` }}` (CSSOM, allowed by the CSP). `renderSheet` parses the MusicXML with `DOMParser`, removes every `<score-part>` and `<part>` whose `id` is not `laneId`, serialises it, and renders it with `new OpenSheetMusicDisplay(el, { autoResize: true, drawTitle: false }).load(xml)` then `.render()`. Styles go in `music/music.css` (never inline `<style>`).

- [ ] **Step 5: Run the tests and build**

Run: `node --test workroom/test/*.test.ts` — PASS; `node _kit/build/build.mjs workroom` (writes `dist/workroom.js`, `dist/sheet.js`, maps, `THIRD_PARTY_LICENSES.txt`); `sh workroom/test.sh` — exit 0; `sh units.sh` — PASS.

- [ ] **Step 6: Commit**

```bash
git add websites/www.cs/games/workroom websites/www.cs/games/package.json websites/www.cs/games/package-lock.json websites/www.cs/music/music.css
git commit -m "Music workroom: four views on one playhead, glossary cards, sheet music

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb"
```

### Task 9: The local browser check; open PR 2

**Files:**
- Create: `websites/www.cs/compose.music-local.yaml`, `docker/nginx/fastcgi_params.https-local`, `tests/e2e/local.config.ts`, `tests/e2e/workroom.local.ts`, `games/workroom/tools/make-draft-fixture.ts`, `games/workroom/tools/e2e-bundle.ts`, `games/workroom/test/fixtures/public-key.ts`, `games/workroom/test/fixtures/draft/{score.json,score.musicxml,audio.webm,spectrogram.png}`
- Modify: `websites/www.cs/Makefile` (new target `music-e2e`), `music/README.md` (how to run the check)

**Interfaces:**
- Consumes: the admin plan's `compose.admin-local.yaml` (mail capture to `admin/data/mail`, `ADMIN_BASE_URL`), the hub's keys panel (`admin/keys.php`), `Music\Api::publishDraft`.
- Produces: `make music-e2e` (local only; prints `MUSIC-E2E-OK`); `tests/e2e/workroom.local.ts` exports nothing; helpers inside it: `signIn(page, base)`, `createKey(page, base, scopes): Promise<string>`, `publishFixtureDraft(request, base, key)`.

`compose.music-local.yaml`:

```yaml
# Local docker only (make music-e2e); CI never reads this file. The admin kit
# refuses API keys over plain HTTP; this stack's nginx tells PHP the request is
# HTTPS so the workroom's API can be checked against http://localhost:<port>.
# MUSIC_PUBLIC_KEYS points the server at the test key the check seals to.
services:
  www-cs-nginx:
    volumes:
      - ./docker/nginx/fastcgi_params.https-local:/etc/nginx/fastcgi_params:ro
  www-cs-php:
    environment:
      MUSIC_PUBLIC_KEYS: /var/www/html/games/workroom/test/fixtures/public.json
```

`docker/nginx/fastcgi_params.https-local`: the stock `fastcgi_params` of `nginx:1.29-alpine` (copy it with `docker run --rm nginx:1.29-alpine cat /etc/nginx/fastcgi_params`) followed by one line, `fastcgi_param HTTPS on;`. (`games/workroom/test/fixtures/public.json` is written in Task 10; in PR 2 the server simply has no key, which the view-only check never needs.)

`tests/e2e/local.config.ts`:

```ts
// Checks that need a local-only docker override (make music-e2e). The main
// config's testDir is this folder; these files end in .local.ts, which its
// default test match never picks up, and select.ts sees no spec.
import { defineConfig } from '@playwright/test';
import base from './playwright.config.ts';

export default defineConfig({ ...base, testMatch: ['*.local.ts'], projects: base.projects?.slice(0, 1) ?? [] });
```

Makefile target (`test` and `e2e` untouched):

```make
# The workroom's browser check against its own docker project, with the
# admin mail capture and the workroom's local HTTPS override. Local only.
music-e2e:
	@name=music-e2e-$$$$; files="-f compose.yaml -f compose.admin-local.yaml -f compose.music-local.yaml"; \
	trap 'docker compose $$files -p $$name down -v >/dev/null 2>&1' EXIT; \
	COMPOSE_PROJECT_NAME=$$name docker compose $$files -p $$name up -d --build www-cs-php www-cs-nginx >/dev/null && \
	port=$$(docker compose $$files -p $$name port www-cs-nginx 80 | sed 's/^127\.0\.0\.1/localhost/') && \
	bundle=$$(mktemp "$${TMPDIR:-/tmp}/workroom-e2e.XXXXXX") && \
	(cd games && npm ci --silent && node workroom/tools/e2e-bundle.ts "$$bundle") && \
	E2E_BASE_URL=http://$$port/ WORKROOM_E2E_BUNDLE=$$bundle tests/e2e/run.sh -c local.config.ts && \
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
```

- [ ] **Step 1: Make the draft fixture.** `tools/make-draft-fixture.ts` copies `test/fixtures/score-v1.json` to `test/fixtures/draft/score.json` and writes `score.musicxml`: a `score-partwise` with one `<score-part id="strings-low">` and one `<score-part id="brass">`, eight 4/4 measures each, one whole note per measure at that lane's note pitch (or a whole rest), with `<divisions>1</divisions>`. Run it: `node workroom/tools/make-draft-fixture.ts`. Make the audio and picture (16 s, as the score says):

```bash
cd websites/www.cs/games/workroom/test/fixtures/draft
ffmpeg -loglevel error -f lavfi -i "sine=frequency=220:duration=16" -c:a libopus -b:a 24k audio.webm
ffmpeg -loglevel error -i audio.webm -lavfi showspectrumpic=s=800x200:legend=0 spectrogram.png
```

- [ ] **Step 2: Write the check** (`tests/e2e/workroom.local.ts`):

```ts
// The workroom in a real browser against local docker (make music-e2e): sign in
// through the captured mail, publish a draft with an API key made on the hub,
// open the piece, play, move the playhead, switch views, open a glossary card,
// and never trip the content security policy.
import { expect, test, type APIRequestContext, type Page } from '@playwright/test';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const SITE = join(import.meta.dirname, '..', '..');
const MAIL = join(SITE, 'admin', 'data', 'mail');
const DRAFT = join(SITE, 'games', 'workroom', 'test', 'fixtures', 'draft');

export async function signIn(page: Page, base: string): Promise<void> {
  const before = Date.now();
  await page.goto(`${base}admin/login.php`);
  await page.getByRole('button', { name: 'Email me a link' }).click();
  let token = '';
  await expect.poll(() => {
    const fresh = readdirSync(MAIL).filter(f => f.endsWith('.eml')).map(f => join(MAIL, f)).filter(f => statSync(f).mtimeMs >= before - 1000);
    const m = fresh.map(f => readFileSync(f, 'utf8').match(/verify\.php\?token=([0-9a-f]{64})/)).find(Boolean);
    token = m?.[1] ?? '';
    return token;
  }, { timeout: 15_000 }).not.toBe('');
  await page.goto(`${base}admin/verify.php?token=${token}`);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/admin\/(index\.php)?$/);
}

export async function createKey(page: Page, base: string, label: string, scopes: string[]): Promise<string> {
  await page.goto(`${base}admin/keys.php`);
  await page.getByLabel('Label').fill(label);
  for (const s of scopes) await page.getByLabel(s).check();
  await page.getByRole('button', { name: 'Create key' }).click();
  return (await page.locator('[data-new-key]').textContent())!.trim();
}

export async function publishFixtureDraft(request: APIRequestContext, base: string, key: string): Promise<void> {
  const file = (name: string, mimeType: string) => ({ name, mimeType, buffer: readFileSync(join(DRAFT, name)) });
  const res = await request.post(`${base}music/api/drafts.php`, {
    headers: { Authorization: `Bearer ${key}` },
    multipart: {
      piece: 'test-piece', version: '1',
      score: file('score.json', 'application/json'), musicxml: file('score.musicxml', 'application/xml'),
      audio_webm: file('audio.webm', 'audio/webm'), spectrogram: file('spectrogram.png', 'image/png'),
    },
  });
  expect([201, 409]).toContain(res.status());
}

test('open a piece, play, seek, switch views, read a term, no CSP violations', async ({ page, request, baseURL }) => {
  const base = baseURL!;
  const bundle = process.env.WORKROOM_E2E_BUNDLE;
  if (bundle) await page.route('**/games/workroom/dist/workroom.js*', r => r.fulfill({ contentType: 'text/javascript', body: readFileSync(bundle, 'utf8') }));
  const violations: string[] = [];
  page.on('console', m => { if (/Content Security Policy/i.test(m.text())) violations.push(m.text()); });
  await signIn(page, base);
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
});
```

The labels the check uses (`Email me a link`, `Sign in`, `Label`, the scope checkboxes, `Create key`, `[data-new-key]`) are the admin pages' own; if the admin login's keys panel names them differently, use its names (read `admin/keys.php` and `Admin\Pages::keysPanel` first).

- [ ] **Step 3: Run it** — `make music-e2e`. Expected: the check passes and `MUSIC-E2E-OK` prints; `docker compose ls` shows no `music-e2e-*` project afterwards.

- [ ] **Step 4: Gates** — from `websites/www.cs`: `vendor/bin/phpunit --testsuite site`; `(cd games && npm ci --silent && npm run --silent check)`; `sh games/units.sh`; `cd tests/e2e && npm ci --silent && node_modules/.bin/tsc -p tsconfig.json` (the new `.local.ts` type-checks); `node tests/e2e/select.ts --check` prints `E2E-SELECT-OK`.

- [ ] **Step 5: Commit and open PR 2**

```bash
git add websites/www.cs/compose.music-local.yaml websites/www.cs/docker/nginx/fastcgi_params.https-local websites/www.cs/tests/e2e/local.config.ts websites/www.cs/tests/e2e/workroom.local.ts websites/www.cs/games/workroom websites/www.cs/Makefile websites/www.cs/music/README.md
git commit -m "Music workroom: local browser check for the four views

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb"
```

Open the PR (foundry `pr-fix-loop`): "Music workroom: the page, four views and the glossary"; body: summary, spec and plan paths, `make music-e2e` result, after-deploy check (sign in, open `/music/`, no pieces until the first `make music-publish`), attribution lines.

---

# PR 3: the answering tools and the owner's key tool (branch `music/answering`)

Start from `main` after PR 2 merged.

### Task 10: Sealing, unlocking and remembering the key (TypeScript)

**Files:**
- Create: `games/workroom/src/note.ts`, `src/seal.ts`, `src/unlock.ts`, `src/vault.ts`, `src/public-key.ts`, `src/idb.ts`
- Create: `games/workroom/tools/make-fixtures.ts`, `test/fixtures/test-key.json`, `test/fixtures/public.json`, `test/fixtures/note-text.sealed`, `test/fixtures/note-hum.sealed`
- Create: `games/workroom/test/seal.test.ts`, `test/unlock.test.ts`, `test/vault.test.ts`, `test/public-key.test.ts`, `test/fixture-key.ts`
- Modify: `games/workroom/test/fixtures/public-key.ts` (the test key), `tsconfig.json` (`note.ts`, `seal.ts`, `unlock.ts`, `vault.ts`, `public-key.ts`), `src/tsconfig.dom.json` (`idb.ts`)

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
  v: 1; kind: NoteKind; piece: string; draft: number; from: number; to: number; fromBar: number; toBar: number;
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
export function fingerprintOf(spkiDer: Uint8Array): Promise<string>;
export function headerFingerprint(bundle: Uint8Array): string | null;
/** Checks the built-in fingerprint first; throws FingerprintMismatch and seals nothing when it differs. */
export function seal(body: NoteBody, audio: Uint8Array | null, key: BuiltInKey): Promise<Uint8Array>;
export interface Opened { fingerprint: string; body: NoteBody; audio: Uint8Array | null }
export function open(bundle: Uint8Array, keyring: ReadonlyMap<string, CryptoKey>): Promise<Opened>;

// src/unlock.ts
export const ITERATIONS = 600_000;
export interface LockedKey { v: 1; kdf: 'PBKDF2-SHA-256'; iterations: number; salt: string; iv: string; fingerprint: string; ct: string }
export class WrongPassphrase extends Error {}
export class LockedKeyInvalid extends Error {}
export function normalizePassphrase(p: string): Uint8Array; // NFC, trimmed, UTF-8
/** A non-extractable RSA-OAEP SHA-256 private key (usages ['decrypt']) that is proven to pair with publicKey. */
export function unlock(locked: LockedKey, passphrase: string, publicKey: BuiltInKey): Promise<CryptoKey>;
/** The same format Python's lock() writes; the page never locks, tests and fixtures do. */
export function lock(pkcs8: Uint8Array, passphrase: string, fingerprint: string): Promise<LockedKey>;

// src/vault.ts
export interface KeyStore { get(fp: string): Promise<CryptoKey | undefined>; put(fp: string, key: CryptoKey): Promise<void>; keys(): Promise<string[]>; clear(): Promise<void> }
export function memoryKeyStore(): KeyStore;
export interface Vault {
  keyring(): ReadonlyMap<string, CryptoKey>;
  has(fp: string): boolean;
  /** The fingerprints in fps with no key yet (what the page must ask the passphrase for). */
  missing(fps: readonly string[]): string[];
  /** Refuses an extractable key. remember=true also stores it. */
  add(fp: string, key: CryptoKey, remember: boolean): Promise<void>;
  /** Loads remembered keys; returns how many. */
  restore(): Promise<number>;
  /** Erases every remembered key and empties the keyring. */
  forget(): Promise<void>;
}
export function createVault(store: KeyStore): Vault;

// src/public-key.ts (written by `siue-music keys init|rotate`)
export const PUBLIC_KEY: BuiltInKey | null;
export const PREVIOUS_KEYS: readonly BuiltInKey[];

// src/idb.ts (DOM)
export function indexedDbKeyStore(db?: string): KeyStore; // database "siue-music", store "keys"; CryptoKey objects stored as they are (structured clone keeps them non-extractable)
```

`test/fixture-key.ts` (shared by the tests):

```ts
// The committed TEST key pair (tools/make-fixtures.ts): used by nothing but tests.
import { readFileSync } from 'node:fs';
import type { LockedKey } from '../src/unlock.ts';
import type { BuiltInKey } from '../src/seal.ts';

export interface TestKey { label: string; fingerprint: string; spki: string; pkcs8: string; passphrase: string; locked: LockedKey; other: { fingerprint: string; spki: string; pkcs8: string } }
export const fx = JSON.parse(readFileSync(new URL('./fixtures/test-key.json', import.meta.url), 'utf8')) as TestKey;
export const builtIn: BuiltInKey = { fingerprint: fx.fingerprint, spki: fx.spki };
export const otherKey: BuiltInKey = { fingerprint: fx.other.fingerprint, spki: fx.other.spki };
export const b64 = (s: string): Uint8Array => Uint8Array.from(Buffer.from(s, 'base64'));
export const hex = (s: string): Uint8Array => Uint8Array.from(Buffer.from(s, 'hex'));
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
import { b64, builtIn, fx, hex, importPrivate, otherKey } from './fixture-key.ts';

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

test('the words are not in the bundle, and two seals differ', async () => {
  const a = await seal(body, null, builtIn);
  const b = await seal(body, null, builtIn);
  assert.ok(!Buffer.from(a).includes(Buffer.from('louder')));
  assert.notDeepEqual(a, b);
});

test('a public key whose fingerprint differs from the built-in one is refused', async () => {
  await assert.rejects(seal(body, null, { fingerprint: fx.fingerprint, spki: fx.other.spki }), FingerprintMismatch);
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
  void otherKey;
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
// Unlocking: the right passphrase gives a non-extractable key proven to pair
// with the built-in public key; a wrong one fails cleanly; a weak or swapped
// locked key is refused.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LockedKeyInvalid, WrongPassphrase, lock, unlock } from '../src/unlock.ts';
import { open, seal } from '../src/seal.ts';
import { b64, builtIn, fx, otherKey } from './fixture-key.ts';

test('the right passphrase unlocks a non-extractable key that opens notes', async () => {
  const key = await unlock(fx.locked, fx.passphrase, builtIn);
  assert.equal(key.extractable, false);
  assert.deepEqual(key.usages, ['decrypt']);
  await assert.rejects(crypto.subtle.exportKey('pkcs8', key));
  const note = await seal({ v: 1, kind: 'text', piece: 'p', draft: 1, from: 0, to: 1, fromBar: 1, toBar: 1, lane: null, text: 'hi', reaction: null, curve: null, audio: null, made: '2026-10-20T00:00:00.000Z' }, null, builtIn);
  assert.equal((await open(note, new Map([[fx.fingerprint, key]]))).body.text, 'hi');
});

test('a wrong passphrase fails cleanly', async () => {
  await assert.rejects(unlock(fx.locked, 'not the passphrase', builtIn), WrongPassphrase);
  await assert.rejects(unlock(fx.locked, '', builtIn), WrongPassphrase);
});

test('spaces around it and the Unicode form do not matter', async () => {
  // The fixture passphrase ends in "café" with a composed é; type it decomposed with a newline.
  const typed = `  ${fx.passphrase.normalize('NFD')}\n`;
  assert.notEqual(typed.trim(), fx.passphrase);
  assert.equal((await unlock(fx.locked, typed, builtIn)).extractable, false);
});

test('a weak, mismatched or swapped locked key is refused', async () => {
  await assert.rejects(unlock({ ...fx.locked, iterations: 1000 }, fx.passphrase, builtIn), LockedKeyInvalid);
  await assert.rejects(unlock(fx.locked, fx.passphrase, otherKey), LockedKeyInvalid);
  const swapped = await lock(b64(fx.other.pkcs8), fx.passphrase, fx.fingerprint);
  await assert.rejects(unlock(swapped, fx.passphrase, builtIn), LockedKeyInvalid, 'unlocks, but to a key that does not pair with the public key');
});
```

`test/vault.test.ts`:

```ts
// Remember this device keeps a non-extractable key; Forget erases it; after a
// rotation the remembered old key still opens old notes and only the new
// fingerprint is missing.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createVault, memoryKeyStore } from '../src/vault.ts';
import { unlock } from '../src/unlock.ts';
import { open, seal } from '../src/seal.ts';
import { builtIn, fx } from './fixture-key.ts';

const key = await unlock(fx.locked, fx.passphrase, builtIn);

test('remembered across a reload, erased by forget', async () => {
  const store = memoryKeyStore();
  await createVault(store).add(fx.fingerprint, key, true);
  assert.deepEqual(await store.keys(), [fx.fingerprint]);
  const reloaded = createVault(store);
  assert.equal(await reloaded.restore(), 1);
  assert.ok(reloaded.has(fx.fingerprint));
  assert.equal((await store.get(fx.fingerprint))?.extractable, false);
  await reloaded.forget();
  assert.deepEqual(await store.keys(), []);
  assert.equal(reloaded.keyring().size, 0);
});

test('without remember nothing is stored', async () => {
  const store = memoryKeyStore();
  const v = createVault(store);
  await v.add(fx.fingerprint, key, false);
  assert.ok(v.has(fx.fingerprint));
  assert.deepEqual(await store.keys(), []);
});

test('an extractable key is never remembered', async () => {
  const pair = await crypto.subtle.generateKey({ name: 'RSA-OAEP', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' }, true, ['encrypt', 'decrypt']);
  await assert.rejects(createVault(memoryKeyStore()).add('ff'.repeat(32), pair.privateKey, true));
});

test('after a rotation: old notes open, only the new key is missing', async () => {
  const v = createVault(memoryKeyStore());
  await v.add(fx.fingerprint, key, true);
  const old = await seal({ v: 1, kind: 'text', piece: 'p', draft: 1, from: 0, to: 1, fromBar: 1, toBar: 1, lane: null, text: 'old', reaction: null, curve: null, audio: null, made: '2026-10-20T00:00:00.000Z' }, null, builtIn);
  assert.equal((await open(old, v.keyring())).body.text, 'old');
  assert.deepEqual(v.missing([fx.other.fingerprint, fx.fingerprint]), [fx.other.fingerprint]);
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
// Writes the TEST key pair and fixtures the unit tests, the Python tests and
// the local browser check share. Rerun only to replace the test key; the
// committed files are what every test reads.
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fingerprintOf, seal } from '../src/seal.ts';
import { lock } from '../src/unlock.ts';

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
  label: 'TEST KEY: used by nothing but tests. Never a real notes key.',
  fingerprint: main.fingerprint, spki: main.spki, pkcs8: main.pkcs8, passphrase,
  locked: await lock(main.raw, passphrase, main.fingerprint),
  other: { fingerprint: other.fingerprint, spki: other.spki, pkcs8: other.pkcs8 },
};
writeFileSync(join(dir, 'test-key.json'), JSON.stringify(fixture, null, 2) + '\n');
writeFileSync(join(dir, 'public.json'), JSON.stringify({ schema: 1, current: { fingerprint: main.fingerprint, spki: main.spki }, previous: [] }, null, 2) + '\n');
writeFileSync(join(dir, 'public-key.ts'), `// The TEST key pair's public half, built into the page only by tools/e2e-bundle.ts.\nexport const PUBLIC_KEY = ${JSON.stringify({ fingerprint: main.fingerprint, spki: main.spki })};\nexport const PREVIOUS_KEYS = [];\n`);
const key = { fingerprint: main.fingerprint, spki: main.spki };
const base = { v: 1 as const, piece: 'test-piece', draft: 1, from: 64, to: 78, fromBar: 33, toBar: 40, lane: 'brass', reaction: null, curve: null, made: '2026-10-17T12:00:00.000Z' };
writeFileSync(join(dir, 'note-text.sealed'), await seal({ ...base, kind: 'text', text: 'Fixture note: louder at bar 33', audio: null }, null, key));
writeFileSync(join(dir, 'note-hum.sealed'), await seal({ ...base, kind: 'hum', text: null, audio: { mime: 'audio/webm', seconds: 2 } }, new Uint8Array(2048).fill(7), key));
console.log(`fixtures: test key ${main.fingerprint}`);
```

- [ ] **Step 3: Run the tests to see them fail** — `node --test workroom/test/seal.test.ts workroom/test/unlock.test.ts workroom/test/vault.test.ts workroom/test/public-key.test.ts` — FAIL (modules missing).

- [ ] **Step 4: Implement**, then run the fixture maker.

- `seal`: `importKey('spki', ...)` only after `fingerprintOf(spki) === key.fingerprint` (else `FingerprintMismatch`); `aes = generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt'])`; `wrapped = encrypt({ name: 'RSA-OAEP' }, pub, exportKey('raw', aes))`; header = magic ‖ fingerprint bytes; plaintext = uint32 J ‖ JSON ‖ audio; `encrypt({ name: 'AES-GCM', iv, additionalData: header }, aes, plaintext)`; concatenate per the bundle table.
- `open`: length < 52 or wrong magic or `L` past the end → `format`; fingerprint not in keyring → `unknown-key`; any failure of RSA decrypt, AES-GCM decrypt or a JSON body that does not parse as a `NoteBody` (`v === 1`, known `kind`) → `tampered`.
- `unlock`: `v`, `kdf`, `iterations >= ITERATIONS`, `fingerprint === publicKey.fingerprint` else `LockedKeyInvalid` (checked before PBKDF2 runs); derive `PBKDF2(SHA-256, salt, iterations)` → AES-GCM key; decrypt with `additionalData = UTF-8(fingerprint)`; failure → `WrongPassphrase`; import the PKCS8 with `extractable: false`, usages `['decrypt']`; prove the pair: encrypt 32 random bytes with the public key, decrypt with the private key, compare; failure → `LockedKeyInvalid`.
- `vault.add` throws on `key.extractable`; `memoryKeyStore` keeps the `CryptoKey` objects in a `Map`.
- `public-key.ts` starts as `export const PUBLIC_KEY: BuiltInKey | null = null; export const PREVIOUS_KEYS: readonly BuiltInKey[] = [];` with a comment that `siue-music keys init|rotate` writes it.

Run `node workroom/tools/make-fixtures.ts` (writes the five fixture files, replacing `test/fixtures/public-key.ts`).

- [ ] **Step 5: Run the tests** — PASS. `node _kit/build/build.mjs workroom` and `sh workroom/test.sh` — exit 0; `sh units.sh` — PASS.

- [ ] **Step 6: Commit**

```bash
git add websites/www.cs/games/workroom
git commit -m "Music workroom: sealing, unlocking and remembering the key in the browser

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb"
```

### Task 11: `siue-music` core: 1Password, the key cache, status, pull, forget, API keys and the sync check

**Files:**
- Create: `websites/www.cs/music/tools/siue-music`, `music/tools/siue_music/__init__.py`, `paths.py`, `op.py`, `sealing.py`, `keys.py`, `cli.py`, `music/tools/requirements.txt`, `music/tools/requirements-answering.txt`
- Create: `music/tools/tests/fake_op.py`, `tests/support.py`, `tests/test_op.py`, `tests/test_sealing.py`, `tests/test_keys_sync.py`, `tests/test_paths.py`
- Modify: `websites/www.cs/Makefile` (new targets `keys-status`, `keys-pull`, `keys-forget`, `api-key-set`, `music-tools-venv`, `music-tools-test`), `music/README.md`

**Interfaces:**
- Consumes: the bundle and lock formats (Task 10's fixtures), `music/keys/public.json`.
- Produces:

```python
# siue_music/paths.py
def repo_root() -> Path                      # git rev-parse --show-toplevel from this file's folder
def site_dir() -> Path                       # <repo>/websites/www.cs
def public_keys_path() -> Path               # $SIUE_MUSIC_PUBLIC_KEYS or <site>/music/keys/public.json
def public_key_ts_path() -> Path             # <site>/games/workroom/src/public-key.ts
def config_dir() -> Path                     # $SIUE_CONFIG_DIR or ~/.config/siue
def notes_dir(platform: str = sys.platform, env: Mapping[str, str] = os.environ, home: Path = Path.home()) -> Path
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
MAGIC = b"SIUEN1"; ITERATIONS = 600_000
class NoteUnreadable(Exception): reason: str           # "format" | "unknown-key" | "tampered"
class WrongPassphrase(Exception): ...
class LockedKeyInvalid(Exception): ...
@dataclass(frozen=True) class Opened: fingerprint: str; body: dict; audio: bytes
def fingerprint(spki_der: bytes) -> str
def generate() -> tuple[bytes, bytes]                   # (pkcs8_der, spki_der), RSA-4096, e = 65537
def spki_of(pkcs8_der: bytes) -> bytes
def normalize_passphrase(p: str) -> bytes               # NFC, strip, UTF-8
def new_passphrase() -> str                             # secrets.token_urlsafe(32): 43 characters
def lock(pkcs8_der: bytes, passphrase: str, fp: str) -> dict
def unlock(locked: dict, passphrase: str) -> bytes
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
    def ensure_synced(self) -> dict[str, bytes]   # fp -> pkcs8 DER for every repo key it holds; the current one guaranteed
    def forget(self) -> None
    def api_key_set(self, name: str, secret: str) -> None
    def api_key(self, name: str) -> str
    def passphrase(self) -> str                   # from the current key's 1Password item; never printed
    # Task 12 adds: init(upload), rotate(upload), upload_locked(upload)

# siue_music/cli.py
def main(argv: Sequence[str], env: Mapping[str, str] = os.environ) -> int
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
from siue_music.keys import Cache
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
        with self.assertRaises(Exception):
            self.w.keys.api_key_set("music-pickup", "not hex")

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
        self.assertEqual(sealing.unlock(self.fx["locked"], self.fx["passphrase"]), self.pkcs8)
        with self.assertRaises(sealing.WrongPassphrase):
            sealing.unlock(self.fx["locked"], "wrong")

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

    def test_weak_locks_are_refused(self):
        with self.assertRaises(sealing.LockedKeyInvalid):
            sealing.unlock({**self.fx["locked"], "iterations": 1000}, self.fx["passphrase"])


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
from siue_music.paths import NotesInsideRepo, check_outside, notes_dir


class PathsTest(unittest.TestCase):
    def test_platform_folders(self):
        home = Path("/Users/me")
        self.assertEqual(notes_dir("darwin", {}, home), home / "Library" / "Application Support" / "siue-music" / "notes")
        self.assertEqual(notes_dir("linux", {}, Path("/home/me")), Path("/home/me/.local/share/siue-music/notes"))
        self.assertEqual(notes_dir("linux", {"XDG_DATA_HOME": "/data"}, home), Path("/data/siue-music/notes"))
        self.assertEqual(notes_dir("win32", {"APPDATA": "C:/AppData"}, home), Path("C:/AppData/siue-music/notes"))
        self.assertEqual(notes_dir("darwin", {"SIUE_MUSIC_NOTES_DIR": "/elsewhere"}, home), Path("/elsewhere"))

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
  - `sealing` uses `cryptography`: `rsa.generate_private_key(65537, 4096)`; OAEP with `MGF1(SHA256)` and `SHA256`; `AESGCM`; `PBKDF2HMAC(SHA256, 32, salt, ITERATIONS)`; AAD as in the formats section; `open_bundle` maps every failure to `NoteUnreadable` with the same reasons as the page.
  - `Cache.save`: `mkdir(mode=0o700, parents=True)` then `os.chmod(dir, 0o700)`; write to `music.json.tmp` opened with `os.open(..., O_WRONLY | O_CREAT | O_TRUNC, 0o600)`, `os.replace` onto `music.json`.
  - `Keys.pull`: for each item tagged `siue-music-key`, read its fields, check `fingerprint(spki_of(b64decode(private_key))) == fingerprint field` (else `KeyMismatch("The 1Password item <title> holds a private key whose fingerprint is <A>, not <B>: fix the item")`), keep it; for each item tagged `siue-music-api`, keep `name → credential`; save the cache.
  - `Keys.ensure_synced`: no `current` → `KeyMismatch("No notes key yet: run make keys-init")`; current in cache → return the cache's keys that the repository names; else `pull()` and look again; still missing → the two messages: with keys in 1Password the repository does not know: `1Password holds a key the repository does not know (<display>). The repository may be out of date: git pull, then run this again. If it is up to date, the repository's key <display> was never saved to 1Password: run make keys-status.`; otherwise: `1Password (vault <V>) has no private key for the repository's public key <display>. Check OP_VAULT, or the key was never saved to 1Password: run make keys-status.`
  - `Keys.status`: prints the repository's current fingerprint (display form), 1Password's fingerprints (or "unreachable: <reason>"), the cache's, one line `match` / `out of date: <side>` per side, and `API keys: <names>` (names only); returns 0 when all match, 3 otherwise.
  - `Keys.api_key_set`: refuses anything but 64 lowercase hex (`KeysError`); archives an existing item with that name; creates the new one; does not touch the cache.
  - `cli.main`: `keys status|pull|forget`, `api-key-set NAME` (the secret read with `getpass.getpass("API key (shown once on the hub): ")` when stdin is a terminal, else one line from stdin); `KeyMismatch` → message on stderr, exit 3; `KeysError`/`OpError` → message, exit 1. `OP_VAULT` defaults to `SIUE`; `SIUE_OP` overrides the `op` executable.

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
- Create: `music/tools/siue_music/api.py`, `music/tools/tests/test_keys_lifecycle.py`, `music/tools/tests/make_fixture.py`, `games/workroom/test/fixtures/locked-by-python.json`
- Modify: `music/tools/siue_music/keys.py`, `cli.py`, `websites/www.cs/Makefile` (`keys-init`, `keys-rotate`, `keys-upload`), `games/workroom/test/unlock.test.ts` (one test), `tests/php/MusicDeployTest.php` (expects `music/keys/public.json` when it exists), `music/README.md`

**Interfaces:**
- Consumes: `Op`, `Cache`, `Keys`, `sealing.generate/lock/unlock/new_passphrase`.
- Produces:

```python
# siue_music/api.py
class ApiError(Exception): status: int
class Api:
    """HTTPS only (http:// allowed only for localhost and 127.0.0.1, the local docker check)."""
    def __init__(self, base: str, key: str, opener: Callable = urllib.request.urlopen): ...
    def waiting(self) -> list[dict]                        # GET api/notes.php?state=waiting
    def note(self, note_id: str) -> bytes                  # GET api/note.php?id=
    def mark_picked_up(self, note_id: str) -> None         # POST api/picked-up.php?id=
    def publish_draft(self, piece: str, version: int, files: Mapping[str, Path]) -> None  # POST api/drafts.php multipart
    def publish_locked_key(self, locked: dict) -> None     # POST api/locked-key.php

# siue_music/keys.py (added)
Upload = Callable[[dict], None]
class Keys:
    def init(self, upload: Upload | None) -> str           # returns the new fingerprint
    def rotate(self, upload: Upload | None) -> str
    def upload_locked(self, upload: Upload) -> int         # re-uploads a locked copy of every repository key; returns the count
```

`init` order: refuse (`KeysError("A notes key already exists ...: use make keys-rotate")`) when `public.json` has a current key **or** 1Password holds any `siue-music-key` item; generate the pair and `new_passphrase()`; create the 1Password item (nothing is written anywhere if this fails); write `public.json` (`current` = new, `previous` = []) and `public-key.ts`; save the private key to the cache; then `upload(lock(...))` when an upload is given — a failed or missing upload prints `The locked key was not uploaded (<reason>). After creating the music-publish API key on the hub: make api-key-set NAME=music-publish && make keys-upload` and still exits 0; finally prints the next steps: `(cd games && node _kit/build/build.mjs workroom)`, commit `music/keys/public.json`, `games/workroom/src/public-key.ts`, `games/workroom/dist/`, and compare the hub's fingerprint after the deploy with `make keys-status`. `rotate`: requires `ensure_synced()`; reads the passphrase from the current key's item; generates; creates the new item with the same passphrase; retitles the old item `... (previous)`; writes `public.json` with the old current first in `previous`; caches; uploads. `public-key.ts` is generated as:

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

The CLI builds the upload from `Api(base, keys.api_key("music-publish")).publish_locked_key`, base `$SIUE_MUSIC_BASE` or `https://www.cs.siue.edu/~wgrim/music/`.

- [ ] **Step 1: Write the failing tests** (`tests/test_keys_lifecycle.py`)

```python
"""keys-init and keys-rotate: the pair and passphrase go to 1Password first,
the repository gets only public halves, the uploaded locked key opens with the
passphrase, rotation keeps the old key and the passphrase, and nothing secret
reaches argv or output."""
import base64
import json
import unittest

from support import World
from siue_music import sealing
from siue_music.keys import KeysError


class LifecycleTest(unittest.TestCase):
    def setUp(self):
        self.w = World(self)
        self.uploads: list[dict] = []

    def item_fields(self):
        return [self.w.op.fields(i["id"]) for i in self.w.op.list_items("siue-music-key")]

    def test_init_saves_uploads_and_writes_only_public_halves(self):
        fp = self.w.keys.init(self.uploads.append)
        repo = json.loads(self.w.public_json.read_text())
        self.assertEqual(repo["current"]["fingerprint"], fp)
        self.assertEqual(sealing.fingerprint(base64.b64decode(repo["current"]["spki"])), fp)
        [fields] = self.item_fields()
        passphrase, pkcs8 = fields["password"], base64.b64decode(fields["private_key"])
        self.assertGreaterEqual(len(passphrase), 40)
        self.assertEqual(sealing.fingerprint(sealing.spki_of(pkcs8)), fp)
        [locked] = self.uploads
        self.assertEqual((locked["fingerprint"], locked["iterations"]), (fp, 600_000))
        self.assertEqual(sealing.unlock(locked, passphrase), pkcs8, "the browser's passphrase opens the uploaded copy")
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
        self.assertEqual(self.w.keys.upload_locked(self.uploads.append), 1)

    def test_rotate_keeps_the_old_key_and_the_passphrase(self):
        old = self.w.keys.init(self.uploads.append)
        new = self.w.keys.rotate(self.uploads.append)
        repo = json.loads(self.w.public_json.read_text())
        self.assertEqual((repo["current"]["fingerprint"], [p["fingerprint"] for p in repo["previous"]]), (new, [old]))
        fields = self.item_fields()
        self.assertEqual(len({f["password"] for f in fields}), 1, "one passphrase, so every device keeps working")
        titles = sorted(i["title"] for i in self.w.op.list_items("siue-music-key"))
        self.assertTrue(any(t.endswith("(previous)") and old[:16] in t for t in titles))
        self.assertEqual(sealing.unlock(self.uploads[-1], fields[0]["password"]), self.w.keys.ensure_synced()[new])
        pkcs8_old = self.w.keys.ensure_synced()[old]
        note = sealing.seal({"v": 1, "kind": "text", "text": "before the rotation"}, b"", sealing.spki_of(pkcs8_old))
        self.assertEqual(sealing.open_bundle(note, self.w.keys.ensure_synced()).body["text"], "before the rotation")
        self.assertIn(new, self.w.public_ts.read_text())
        self.assertIn(old, self.w.public_ts.read_text(), "PREVIOUS_KEYS keeps the old public key")

    def test_rotate_refuses_on_a_mismatched_key(self):
        with self.assertRaises(Exception):
            self.w.keys.rotate(self.uploads.append)
        self.assertEqual(self.uploads, [])


if __name__ == "__main__":
    unittest.main()
```

Append to `games/workroom/test/unlock.test.ts`:

```ts
test('a key Python locked unlocks in the browser', async () => {
  const { readFileSync } = await import('node:fs');
  const locked = JSON.parse(readFileSync(new URL('./fixtures/locked-by-python.json', import.meta.url), 'utf8')) as typeof fx.locked;
  assert.equal(locked.fingerprint, fx.fingerprint);
  assert.equal((await unlock(locked, fx.passphrase, builtIn)).extractable, false);
});
```

- [ ] **Step 2: Run to see them fail** — `make music-tools-test` — FAIL (`Keys.init` missing); `node --test games/workroom/test/unlock.test.ts` — FAIL (fixture missing).

- [ ] **Step 3: Write the parity fixture maker** (`tests/make_fixture.py`) and run it once (`$(MUSIC_PY) music/tools/tests/make_fixture.py`):

```python
"""Writes games/workroom/test/fixtures/locked-by-python.json: the TEST key from
test-key.json locked by Python, so the page's tests prove they unlock what the
tool uploads. Rerun only after tools/make-fixtures.ts replaces the test key."""
import base64
import json

from support import FIXTURES
from siue_music import sealing

fx = json.loads((FIXTURES / "test-key.json").read_text())
locked = sealing.lock(base64.b64decode(fx["pkcs8"]), fx["passphrase"], fx["fingerprint"])
(FIXTURES / "locked-by-python.json").write_text(json.dumps(locked, indent=2) + "\n")
print("wrote locked-by-python.json")
```

- [ ] **Step 4: Implement** `init`, `rotate`, `upload_locked`, `api.py` (urllib with `Authorization: Bearer`, a 30 s timeout; the base must be `https://`, or `http://localhost[:port]/` / `http://127.0.0.1[:port]/`, else `ApiError`; a non-2xx status raises `ApiError` with the JSON `error`) and the CLI verbs. In `MusicDeployTest::testShipsThePagesApiAndLibrary`, add: `if (is_file(dirname(__DIR__, 2) . '/music/keys/public.json')) self::assertContains('music/keys/public.json', $list);`.

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
def validate(obj: object, glossary_ids: frozenset[str] | None = None) -> list[str]   # the same rules and path names as the page's parseScore

# siue_music/publish.py
class PublishError(Exception): ...
def latest_version(piece_dir: Path) -> int
def publish(piece: str, version: int | None, pieces: Path, api) -> int
```

Pickup, for each waiting note in arrival order: download; `len == size` and `sha256 == listed` (else left: `download did not match its hash; left waiting`); open with the keyring (else left: `could not open (<reason>); left waiting`); write `<notes>/<YYYY-MM-DD of arrival, UTC>-<id>/` through a `.partial` folder renamed into place: `note.json` (`{"id", "arrived_at", "fingerprint", "body"}`), `audio.<webm|m4a|ogg>` when there is audio; then the optional steps (`speech` → `transcript.txt`, `hum` → `motif.mid`); a `MissingDependency` adds its message to `notices` once; any other step error adds `could not transcribe <id>: <error>` and does not stop the mark, since the opened note is safely on disk; then `mark_picked_up`. `check_outside(notes, repo)` runs before the first request.

- [ ] **Step 1: Write the failing tests**

`tests/test_pickup.py`:

```python
"""Pickup verifies the download's hash and opens the note before marking it;
a corrupt download or a note that will not open stays waiting; opened notes
land outside the repository; a key mismatch never reaches the server."""
import hashlib
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


class MismatchNeverReachesTheServer(unittest.TestCase):
    def test_pickup_stops_with_exit_3(self):
        w = World(self)
        orphan, _, _ = pool_key(1)
        w.write_repo(orphan)
        opened = []
        with mock.patch("siue_music.cli.make_api", side_effect=lambda *a: opened.append(a)):
            code = cli.main(["pickup"], env={"OP_VAULT": "SIUE", "SIUE_MUSIC_PUBLIC_KEYS": str(w.public_json),
                                            "SIUE_CONFIG_DIR": str(w.root / "config" / "siue"), "SIUE_OP": f"{sys.executable} {Path(__file__).parent / 'fake_op.py'}",
                                            "FAKE_OP_LOG": str(w.log), "FAKE_OP_STORE": str(w.root / "op.json")})
        self.assertEqual((code, opened), (3, []))


if __name__ == "__main__":
    unittest.main()
```

`cli.make_api(base: str, key: str) -> Api` is the one place the CLI builds an `Api`, so this test can prove it is never reached; `SIUE_OP` is split with `shlex.split`.

`tests/test_answering.py`:

```python
"""Speech and humming are optional: missing packages give one clear message;
the pitch-track-to-notes step is exact on a small fixture; with the packages
installed, a synthetic two-note hum becomes a two-note MIDI motif."""
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
        tone = np.concatenate([np.sin(2 * np.pi * 440 * t), np.sin(2 * np.pi * 493.88 * t)]) * 0.5
        with tempfile.TemporaryDirectory() as d:
            wav, mid = Path(d) / "hum.wav", Path(d) / "hum.mid"
            soundfile.write(wav, tone, rate)
            self.assertEqual(hum_to_midi(wav, mid), 2)
            pitches = [m.note for m in mido.MidiFile(mid).tracks[0] if m.type == "note_on" and m.velocity > 0]
            self.assertEqual(pitches, [69, 71])


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
a complete, valid draft; the newest version is the default."""
import json
import shutil
import tempfile
import unittest
from pathlib import Path

from support import FIXTURES
from siue_music.publish import PublishError, latest_version, publish
from siue_music.score import validate


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

    def test_publishes_the_newest_valid_draft(self):
        v2 = self.pieces / "test-piece" / "v2"
        shutil.copytree(self.v1, v2)
        score = json.loads((v2 / "score.json").read_text())
        (v2 / "score.json").write_text(json.dumps({**score, "draft": 2}))
        self.assertEqual(latest_version(self.pieces / "test-piece"), 2)
        self.assertEqual(publish("test-piece", None, self.pieces, self.api), 2)
        self.assertEqual(self.api.sent, [("test-piece", 2, ["audio.webm", "score.json", "score.musicxml", "spectrogram.png"])])

    def test_an_invalid_score_never_leaves_the_computer(self):
        score = json.loads((self.v1 / "score.json").read_text())
        score["sections"][1]["from_bar"] = 6
        (self.v1 / "score.json").write_text(json.dumps(score))
        with self.assertRaises(PublishError) as e:
            publish("test-piece", 1, self.pieces, self.api)
        self.assertIn("sections[1].from_bar", str(e.exception))
        self.assertEqual(self.api.sent, [])

    def test_a_draft_without_audio_is_refused(self):
        (self.v1 / "audio.webm").unlink()
        with self.assertRaises(PublishError):
            publish("test-piece", 1, self.pieces, self.api)

    def test_python_and_the_page_name_the_same_paths(self):
        base = json.loads((FIXTURES / "score-v1.json").read_text())
        self.assertEqual(validate(base), [])
        cases = [
            (lambda s: s["piece"].__setitem__("id", "Bad Id"), "piece.id"),
            (lambda s: s["sections"][1].__setitem__("to_bar", 7), "sections[1].to_bar"),
            (lambda s: s["motifs"][0].__setitem__("color", "#ffffff"), "motifs[0].color"),
            (lambda s: s["notes"][0].__setitem__("lane", "violas"), "notes[0].lane"),
            (lambda s: s["energy"][1].__setitem__(1, 1.5), "energy[1]"),
            (lambda s: s.__setitem__("schema", 2), "schema"),
        ]
        for change, path in cases:
            s = json.loads(json.dumps(base))
            change(s)
            errors = validate(s)
            self.assertTrue(errors and path in errors[0], (path, errors))


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

Both run `ensure_synced()` first (exit 3 on a mismatch, before any request). `pickup` then uses the `music-pickup` API key and prints `Picked up N notes into <dir>.`, each left note with its reason, and each notice; `publish` uses `music-publish` and prints `Published <piece> v<N>.`.

- [ ] **Step 2: Run to see them fail** — `make music-tools-test` — FAIL (modules missing).

- [ ] **Step 3: Implement.** `f0_to_notes`: a frame is voiced when it is a finite number > 0; MIDI = `round(69 + 12 * log2(f / 440))`; consecutive voiced frames with the same MIDI number form one note starting at `index * hop`; notes shorter than `min_seconds` are dropped. `hum_to_midi`: `to_wav`, `librosa.load(wav, sr=16000)`, `librosa.pyin(y, fmin=librosa.note_to_hz('C2'), fmax=librosa.note_to_hz('C6'), sr=16000, frame_length=1024, hop_length=160)`, `f0_to_notes(f0, 160 / 16000)`, then a one-track `mido.MidiFile` at 480 ticks per beat and 60 bpm (one beat a second) with `note_on`/`note_off` per note. Each optional import sits inside its function in `try: ... except ImportError: raise MissingDependency(f"... needs <package>: {INSTALL}")`; `shutil.which('ffmpeg') is None` raises `MissingDependency` too. `score.validate` follows the schema table rule by rule, in the same order as `parseScore`, with the same path spellings.

- [ ] **Step 4: Run the tests** — `make music-tools-test` — PASS (the hum and speech fixture tests run when the optional packages are installed: `music/tools/.venv/bin/pip install -r music/tools/requirements-answering.txt` and `brew install ffmpeg`; run them once that way too and see them pass).

- [ ] **Step 5: Commit**

```bash
git add websites/www.cs/music/tools websites/www.cs/Makefile websites/www.cs/music/README.md
git commit -m "Music workroom: pickup verifies before marking; speech, humming and publish

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb"
```

### Task 14: The answering modules: notes, energy, outbox, page API and history (DOM-free)

**Files:**
- Create: `games/workroom/src/answer.ts`, `src/energy.ts`, `src/outbox.ts`, `src/api.ts`, `src/history.ts`, `src/recorder.ts`
- Create: `games/workroom/test/answer.test.ts`, `test/energy.test.ts`, `test/outbox.test.ts`, `test/api.test.ts`, `test/history.test.ts`, `test/recorder.test.ts`
- Modify: `games/workroom/tsconfig.json` (the six files)

**Interfaces:**
- Consumes: `NoteBody`, `Reaction`, `REACTION_IDS` (`note.ts`), `Span`, `TempoMap`, `Section`, `View`, `TIMELINE`, `Fetch` (`load.ts`), `Opened`, `NoteUnreadable`, `LockedKey`.
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
export function humNote(c: Context, at: { time: number; bar: number; laneId: string | null }, audio: { mime: string; seconds: number }): NoteBody;
export function reactNote(c: Context, section: Section, tempo: TempoMap, duration: number, reaction: Reaction): NoteBody;
export function energyNote(c: Context, curve: [number, number][], duration: number, bars: number): NoteBody;

// src/energy.ts
export type Curve = [number, number][];
export function redraw(curve: Curve, stroke: Curve, duration: number): Curve;
export function strokeFromPixels(points: readonly [number, number][], view: View): Curve; // y in the energy band: value = 1 - y / TIMELINE.energyH

// src/outbox.ts
export type KeptReason = 'offline' | 'too_large' | 'full' | 'no_key' | 'bad_header' | 'unknown_key' | 'signed_out';
export interface Pending { key: string; bundle: Uint8Array; made: string; reason: KeptReason | 'new' }
export interface OutboxStore { all(): Promise<Pending[]>; put(p: Pending): Promise<void>; remove(key: string): Promise<void> }
export function memoryOutbox(): OutboxStore;
export interface FlushReport { sent: { key: string; id: string }[]; kept: { key: string; reason: KeptReason }[] }
export const KEPT_MESSAGES: Readonly<Record<KeptReason, string>>;
export interface Outbox { add(bundle: Uint8Array, made: string): Promise<FlushReport>; flush(): Promise<FlushReport>; pending(): Promise<Pending[]> }
export function createOutbox(store: OutboxStore, api: Pick<PageApi, 'upload'>, newKey: () => string): Outbox;

// src/api.ts
export class SignedOut extends Error {}
export interface ServerNote { id: string; size: number; arrived_at: number; picked_up_at: number | null }
export type UploadResult = { kind: 'sent'; id: string } | { kind: 'refused'; reason: Exclude<KeptReason, 'offline' | 'signed_out'> };
export interface PageApi {
  upload(bundle: Uint8Array): Promise<UploadResult>;
  list(): Promise<ServerNote[]>;
  bytes(id: string): Promise<Uint8Array>;
  remove(id: string): Promise<number>;
  removeAll(): Promise<number>;
  lockedKeys(): Promise<{ fingerprint: string; locked: LockedKey }[]>;
}
/** One POST at a time; each sends the token the previous POST returned; a 403 {"error":"csrf"} refreshes the token from csrf.php once and retries once; a redirect is SignedOut. */
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
import { SignedOut, createApi } from '../src/api.ts';
import type { Fetch } from '../src/load.ts';

type Init = Parameters<Fetch>[1];
const reply = (status: number, body: unknown, redirected = false) => ({
  ok: status < 400, status, redirected, headers: { get: () => 'application/json' },
  json: async () => body, text: async () => JSON.stringify(body), arrayBuffer: async () => new ArrayBuffer(0),
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
import { NoteTooLong, REACTIONS, energyNote, humNote, reactNote, textNote } from '../src/answer.ts';
import { tempoMap } from '../src/tempo.ts';
import { REACTION_IDS } from '../src/note.ts';
import type { Score } from '../src/score.ts';

const score = JSON.parse(readFileSync(new URL('./fixtures/score-v1.json', import.meta.url), 'utf8')) as Score;
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

test('a reaction covers its section', () => {
  const n = reactNote(ctx, score.sections[1]!, tempoMap(score), score.duration, 'more-epic');
  assert.deepEqual([n.kind, n.from, n.to, n.fromBar, n.toBar, n.reaction], ['react', 8, 16, 5, 8, 'more-epic']);
  assert.deepEqual(REACTIONS.map(r => r.id), [...REACTION_IDS]);
  assert.deepEqual(REACTIONS.map(r => r.label), ['More epic', 'Calmer', 'Darker', 'Brighter', 'Longer', 'Shorter', 'Love it', 'Not this']);
});

test('a redrawn energy curve covers the whole piece', () => {
  const n = energyNote(ctx, [[0, 0.1], [16, 1]], 16, 8);
  assert.deepEqual([n.kind, n.from, n.to, n.fromBar, n.toBar, n.curve], ['energy', 0, 16, 1, 8, [[0, 0.1], [16, 1]]]);
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

- [ ] **Step 3: Implement** the six modules. `createApi` keeps a `queue: Promise<unknown>` and chains each POST onto it; a POST sends `X-CSRF` and, for deletes, `Content-Type: application/x-www-form-urlencoded` with `id=<id>` or `all=1`; the upload sends the bundle as `application/octet-stream`. Every response is checked: `redirected` or a non-JSON `Content-Type` → `SignedOut`. `createOutbox.add` puts the note first (`reason: 'new'`), then flushes; `flush` walks `all()` sorted by `made`, stops at the first `offline`, and rewrites a kept note's `reason`.

- [ ] **Step 4: Run the tests** — PASS. Add the files to `tsconfig.json`; `node _kit/build/build.mjs workroom --check` — exit 0.

- [ ] **Step 5: Commit**

```bash
git add websites/www.cs/games/workroom
git commit -m "Music workroom: notes, energy curves, outbox, page API client and history

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb"
```

### Task 15: The answering views, unlock and history; the full browser check; open PR 3

**Files:**
- Create: `games/workroom/src/ui/UnlockPanel.tsx`, `src/ui/PinComposer.tsx`, `src/ui/HumButton.tsx`, `src/ui/ReactBar.tsx`, `src/ui/EnergyEditor.tsx`, `src/ui/History.tsx`, `src/ui/PiecesWaiting.tsx`, `games/workroom/test/answering-views.test.ts`
- Modify: `games/workroom/src/main.ts`, `src/ui/Workroom.tsx` (the answering bar and notes on the timeline), `src/idb.ts` (`indexedDbOutbox()`), `src/tsconfig.dom.json`, `tests/e2e/workroom.local.ts` (second test), `websites/www.cs/Makefile` (`music-e2e` passes `MUSIC_PY`), `music/music.css`, `music/README.md`

**Interfaces:**
- Consumes: everything in Tasks 10 and 14; `Workroom`, `Timeline` (Task 8); `make music-tools-venv` for the check.
- Produces:

```tsx
export function UnlockPanel(p: { busy: boolean; error: string | null; onUnlock(passphrase: string, remember: boolean): void }): JSX.Element;
  // a form with a hidden username field "siue-music" (autocomplete="username") and a password field labelled "Passphrase"
  // (autocomplete="current-password") so 1Password fills it; checkbox "Remember this device"; button "Unlock notes"
export function PinComposer(p: { span: Span | null; recording: boolean; onSend(text: string): void; onRecord(): void; onStop(): void; onCancel(): void }): JSX.Element;
  // "Select a moment or a span on the timeline" until span is set; textarea "Your note"; buttons "Send", "Record", "Stop", "Cancel"
export function HumButton(p: { recording: boolean; seconds: number; onStart(): void; onStop(): void }): JSX.Element; // "Hum it" / "Stop (0:12 of 1:00)"
export function ReactBar(p: { section: Section; onReact(r: Reaction): void }): JSX.Element; // the eight REACTIONS buttons
export function EnergyEditor(p: { score: Score; view: View; onSend(curve: Curve): void }): JSX.Element; // drag over the energy band; "Send this shape" / "Start over"
export function History(p: { items: HistoryItem[]; locked: boolean; kept: Pending[]; onDelete(id: string): void; onDeleteAll(): void; onForget(): void }): JSX.Element;
  // each item: when, state ("Waiting" / "Picked up"), its words or a player for its recording (blob: URL), or its problem; "Delete" each;
  // "Delete all" asks "Delete all N notes? This cannot be undone." with "Delete all notes" / "Keep them"; "Forget this device";
  // kept outbox notes listed with their KEPT_MESSAGES text
export function PiecesWaiting(p: { counts: Map<string, number> }): JSX.Element; // fills each piece row's [data-waiting="<piece>"] on the index page
```

`Workroom` gains an answering bar under the player: "Pin a note" (switches the gestures to `select` and opens `PinComposer`), `HumButton`, "React" (opens `ReactBar` for the section under the playhead) and "Draw the energy" (opens `EnergyEditor` over the energy band); below the views, `History` for this piece.

`main.ts` wiring (thin; everything decided lives in the DOM-free modules): read the CSRF token from `<meta name="csrf">`; `api = createApi(fetch, csrf)`; `vault = createVault(indexedDbKeyStore())` and `await vault.restore()`; `outbox = createOutbox(indexedDbOutbox(), api, () => crypto.randomUUID())`, `flush()` on load and on `online`; when `PUBLIC_KEY` is null the answering bar shows "No notes key yet (make keys-init)" and nothing seals; the needed fingerprints are `[PUBLIC_KEY, ...PREVIOUS_KEYS]` that appear in the history's bundle headers; `vault.missing(...)` non-empty → `UnlockPanel` (unlock each missing fingerprint whose locked copy `api.lockedKeys()` returned, against its `BuiltInKey`); then `api.list()`, `api.bytes(id)` and `open()` per note into the history map (one failure never stops the rest). Sending: build the `NoteBody` with `answer.ts`, `seal(body, audio, PUBLIC_KEY)`, `outbox.add(bundle, body.made)`, show the report, refresh the history. The recorder uses `MediaRecorder` with `pickMime(MediaRecorder.isTypeSupported)` and `stopAfterLimit(window, stop)`.

- [ ] **Step 1: Write the failing component tests** (`test/answering-views.test.ts`)

```ts
// The answering views are thin: the unlock form is fillable by a password
// manager and passes Remember; Delete all asks first; the eight reactions are
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

test('the unlock form suits a password manager and passes Remember', () => {
  const root = makeEl('root');
  const calls: [string, boolean][] = [];
  render(h(ui.unlock.UnlockPanel, { busy: false, error: null, onUnlock: (p, r) => calls.push([p, r]) }), renderTarget(root));
  const pass = byAttr(root, 'autocomplete', 'current-password')!;
  assert.ok(byAttr(root, 'autocomplete', 'username'));
  pass.value = 'secret words';
  fire(pass, 'input', { target: pass });
  const remember = walk(root).find(e => e._attrs.type === 'checkbox')!;
  remember.checked = true;
  fire(remember, 'change', { target: remember });
  fire(walk(root).find(e => e.localName === 'form')!, 'submit', { preventDefault: () => {} });
  assert.deepEqual(calls, [['secret words', true]]);
});

test('a wrong passphrase is shown, not thrown', () => {
  const root = makeEl('root');
  render(h(ui.unlock.UnlockPanel, { busy: false, error: 'That passphrase did not unlock the key.', onUnlock: () => {} }), renderTarget(root));
  assert.match(root.textContent, /did not unlock the key/);
});

test('Delete all asks first', () => {
  const root = makeEl('root');
  let all = 0;
  const items: HistoryItem[] = [
    { id: 'a'.repeat(32), arrived: 1, pickedUp: null, state: 'waiting', opened: null, problem: null },
    { id: 'b'.repeat(32), arrived: 2, pickedUp: 3, state: 'picked-up', opened: null, problem: null },
  ];
  render(h(ui.history.History, { items, locked: false, kept: [], onDelete: () => {}, onDeleteAll: () => all++, onForget: () => {} }), renderTarget(root));
  fire(button(root, 'Delete all')!, 'click');
  assert.equal(all, 0);
  assert.match(root.textContent, /Delete all 2 notes\? This cannot be undone\./);
  fire(button(root, 'Delete all notes')!, 'click');
  assert.equal(all, 1);
});

test('eight reactions on a section', () => {
  const root = makeEl('root');
  const got: string[] = [];
  render(h(ui.react.ReactBar, { section: score.sections[0]!, onReact: r => got.push(r) }), renderTarget(root));
  fire(button(root, 'Love it')!, 'click');
  assert.equal(walk(root).filter(e => e.localName === 'button').length, 8);
  assert.deepEqual(got, ['love-it']);
});

test('Send waits for a span and words', () => {
  const root = makeEl('root');
  render(h(ui.pin.PinComposer, { span: null, recording: false, onSend: () => {}, onRecord: () => {}, onStop: () => {}, onCancel: () => {} }), renderTarget(root));
  assert.match(root.textContent, /Select a moment or a span on the timeline/);
  assert.equal(button(root, 'Send')?.disabled ?? true, true);
});
```

- [ ] **Step 2: Run to see it fail** — `node --test workroom/test/answering-views.test.ts` — FAIL.

- [ ] **Step 3: Implement** the components, the `main.ts` wiring, `indexedDbOutbox()` (database `siue-music`, store `outbox`, keyed by `key`) and the styles. Notes on the timeline: each opened note of this piece draws a pin (a moment) or a band (a span) at its `from`/`to` in its lane row (or across all lanes), marked with its draft when it differs from the shown one; each `changes[]` entry draws a band on its bars with Claude's text, beside the pins of the notes in its `answers`.

- [ ] **Step 4: Run the unit tests and build** — `node --test workroom/test/*.test.ts` — PASS; `node _kit/build/build.mjs workroom`; `sh workroom/test.sh` — exit 0.

- [ ] **Step 5: Extend the browser check.** In the Makefile's `music-e2e` recipe, export `MUSIC_PY=$(abspath $(MUSIC_PY))` to the check (`MUSIC_PY=... E2E_BASE_URL=... tests/e2e/run.sh -c local.config.ts`). Add this test to `tests/e2e/workroom.local.ts`, beside the first (same imports, plus `spawnSync` from `node:child_process`, `mkdtempSync`, `writeFileSync` from `node:fs` and `tmpdir` from `node:os`):

```ts
const FIXTURES = join(SITE, 'games', 'workroom', 'test', 'fixtures');
const testKey = JSON.parse(readFileSync(join(FIXTURES, 'test-key.json'), 'utf8')) as { fingerprint: string; pkcs8: string; passphrase: string; locked: object };

test('pin a note, pick it up with the tool, read and delete it on a second device', async ({ browser, page, request, baseURL }) => {
  const base = baseURL!;
  const bundle = process.env.WORKROOM_E2E_BUNDLE!;
  const routeBundle = (p: Page) => p.route('**/games/workroom/dist/workroom.js*', r => r.fulfill({ contentType: 'text/javascript', body: readFileSync(bundle, 'utf8') }));
  await routeBundle(page);
  await signIn(page, base);
  const publish = await createKey(page, base, 'e2e publish', ['drafts:publish', 'keys:publish']);
  const pickupKey = await createKey(page, base, 'e2e pickup', ['notes:pickup']);
  await publishFixtureDraft(request, base, publish);
  const up = await request.post(`${base}music/api/locked-key.php`, { headers: { Authorization: `Bearer ${publish}` }, data: testKey.locked });
  expect(up.status()).toBe(201);

  // Pin a typed note on bars 5 to 7 of the horns.
  await page.goto(`${base}music/piece.php?id=test-piece`);
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

  await page.reload();
  await expect(page.getByText('Picked up', { exact: true })).toBeVisible();

  // A second device: sign in, unlock with the passphrase, read, delete; remembered across a reload; forgotten on request.
  const phone = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const p2 = await phone.newPage();
  await routeBundle(p2);
  await signIn(p2, base);
  await p2.goto(`${base}music/piece.php?id=test-piece`);
  await p2.getByLabel('Passphrase').fill('not it');
  await p2.getByRole('button', { name: 'Unlock notes' }).click();
  await expect(p2.getByText('That passphrase did not unlock the key.')).toBeVisible();
  await p2.getByLabel('Passphrase').fill(testKey.passphrase);
  await p2.getByLabel('Remember this device').check();
  await p2.getByRole('button', { name: 'Unlock notes' }).click();
  await expect(p2.getByText('louder and slower right here')).toBeVisible();
  await p2.reload();
  await expect(p2.getByText('louder and slower right here')).toBeVisible();
  await p2.getByRole('button', { name: 'Delete', exact: true }).first().click();
  await expect(p2.getByText('louder and slower right here')).toHaveCount(0);
  await p2.getByRole('button', { name: 'Forget this device' }).click();
  await p2.reload();
  await expect(p2.getByRole('button', { name: 'Unlock notes' })).toBeVisible();
  await phone.close();
});
```

- [ ] **Step 6: Run the check** — `make music-tools-venv` (once), then `make music-e2e` — both tests pass and `MUSIC-E2E-OK` prints; no `music-e2e-*` project remains (`docker compose ls`).

- [ ] **Step 7: Gates** — from `websites/www.cs`: `vendor/bin/phpunit --testsuite site`; `vendor/bin/phpunit --testsuite kit`; `(cd games && npm ci --silent && npm run --silent check)`; `sh games/units.sh`; `make music-tools-test`; `cd tests/e2e && npm ci --silent && node_modules/.bin/tsc -p tsconfig.json`; `node tests/e2e/select.ts --check`. Then `make test` with the docker stack up under a unique project name for its docker steps.

- [ ] **Step 8: Commit and open PR 3**

```bash
git add websites/www.cs/games/workroom websites/www.cs/tests/e2e/workroom.local.ts websites/www.cs/Makefile websites/www.cs/music/music.css websites/www.cs/music/README.md
git commit -m "Music workroom: pin, hum, react and draw the energy; unlock, history and delete

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb"
```

Open the PR (foundry `pr-fix-loop`): "Music workroom: answering tools and the key tool"; body: summary, spec and plan paths, `make music-e2e` and `make music-tools-test` results, and the owner's first-run steps after merge and deploy: create the `music-pickup` and `music-publish` API keys on the hub; `make api-key-set NAME=music-pickup`; `make api-key-set NAME=music-publish`; `make keys-init`; rebuild (`cd games && node _kit/build/build.mjs workroom`) and commit the key files through a PR; after that deploy, compare the hub's "Music notes key" fingerprint with `make keys-status`; unlock once on the phone with 1Password. Attribution lines.
