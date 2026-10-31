# The studio MCP server and AI sealing keys Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Any `@siue.edu` studio user connects their own AI app (Claude Code, Claude Desktop, Cursor, Codex, Gemini CLI or
any MCP client) to their studio with uv and one copied command, pairs it by typing a code on Your studio, and from then on
the AI lists, reads, publishes and deletes drafts and reads the person's new notes, opened on that computer.

**Architecture:**
- The Python tool `music/tools/siue_music` becomes a wheel, `siue_music-<version>-py3-none-any.whl`, built reproducibly
  by `music/tools/build-wheel` (stdlib only, stored zip entries, fixed times). `deploy.sh` builds it into
  `music/dist/` and refuses to ship when its SHA-256 differs from `music/dist/release.json`, which is committed; the
  page shows the address and the SHA-256 from that file. `uvx --from <wheel url> siue-music mcp` runs the studio MCP.
- The studio MCP (`siue_music/studio.py`, `studio_mcp.py`) reads the AI key from `SIUE_MUSIC_AI_KEY` (or the `ai-key`
  file in its config folder), makes its RSA-4096 sealing key there on first run (0600), registers the public half with
  `api/seal-key.php`, and shows a pairing code made from the key's fingerprint.
- The person types the code on that AI key's row on Your studio with their passphrase. The browser asks `pair.php`
  (rate-limited, the server checks the code), checks the code itself against the public key it is handed, adds the key to
  the locked keyring's `ai` list, locks it again and stores it through `keyring.php?pair=1` (fingerprints unchanged, the
  current key's signature). Only then is the AI key marked paired.
- The browser seals each new note as `SIUEN2` to the person's current key and to every paired AI key that is both in the
  unlocked keyring and still active on the server; with none it seals `SIUEN1` as today. The server keeps each note's
  recipients and lists to an AI key only the notes sealed to its paired key. Revoking the key forgets its public key.
- The owner's repository tool keeps its make and 1Password flows; its MCP server is `siue-music owner-mcp`.

**Tech Stack:** PHP 8.4 + PHPUnit; TypeScript + Preact (node:test); Python 3.10+ with `cryptography` and the MCP SDK
`mcp==2.3.0` (unittest); Playwright for the local browser check; GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-10-29-music-studios-design.md`, project 3 ("The MCP server", "Connecting an AI",
"Settled after review": SIUEN2, the pairing code, only the person adds an AI recipient).

## Global Constraints

- The server never adds a recipient: an AI public key reaches the sealing list only from the passphrase-locked keyring,
  rewritten by the unlocked browser after the typed code matched.
- Pairing code: the first 80 bits of the SHA-256 of the AI key's SPKI DER, as 16 Crockford base32 characters
  (`0123456789ABCDEFGHJKMNPQRSTVWXYZ`), shown `XXXX-XXXX-XXXX-XXXX`; typed codes ignore case, spaces and hyphens, and read
  `I`/`L` as `1` and `O` as `0`.
- An AI sealing key is RSA-4096 with exponent 65537, its SPKI in canonical DER (re-exporting it gives the same bytes);
  the server and the browser both refuse any other.
- Pairing limits: 5 wrong codes per AI key an hour; 20 pairing requests per account an hour; then 429 `too_many`.
- `SIUEN2`: `"SIUEN2"`, one byte `n` (1–16), then `n` times (32-byte fingerprint, big-endian u16 length, that many
  bytes of RSA-OAEP SHA-256 wrapped AES-256 key), then a 12-byte IV and the AES-GCM ciphertext and tag. The additional
  data is the magic, `n` and the `n` fingerprints. The plaintext is `SIUEN1`'s: a u32 JSON length, the JSON, the audio.
- The server accepts a `SIUEN2` note only when every fingerprint is distinct and is the account's current or a previous
  key or the paired key of one of its active AI keys, and at least one is the person's.
- AI key scopes stay `notes:pickup`, `drafts:publish`, `drafts:delete`; the AI never deletes notes. Reading a draft's
  score needs `drafts:publish`. Registering a sealing key needs `notes:pickup`.
- The Connect Your AI panel and the new-key panel never mention make, a repository or checkout, GitHub, PyPI or
  1Password. Title Case for labels and buttons, sentence case for sentences.
- The repo is public: no secrets, no address but `wgrim@siue.edu`. Docs describe current state only.
- Tests: PHPUnit in `podman run --rm -v "$PWD":/w:z -w /w docker.io/library/php:8.4-cli vendor/bin/phpunit --testsuite site`;
  Node one file at a time under `systemd-run --user --scope -q -p MemoryMax=3G -p MemorySwapMax=0 /usr/bin/timeout 300 node --test <file>`;
  Python `make music-test`; at most two local e2e specs.

## Review Focus

1. **A revoked AI key while a note is being sealed:** the page refreshes the active list before sealing, and a note
   sealed to a key revoked a moment ago is refused by the server, never stored for a dead key (Task 3, Task 5).
2. **The person forgets the passphrase:** Forgot your passphrase unpairs every AI key (the new keyring holds none); the
   AI then reports "not paired" with the same code and can be paired again (Task 2).
3. **The MCP starts without a key, with the placeholder, or with a revoked key:** every tool answers a sentence saying
   what to do (make an AI key on Your studio, paste it, pair), never a traceback (Task 6).
4. **Two apps on one computer:** both use the one sealing key in the config folder, so one pairing serves both
   (Task 6).
5. **The change of passphrase after pairing:** relocking keeps the `ai` list, so pairing survives a new passphrase
   (Task 4).

---

### Task 1: PHP: sealing keys, pairing codes and the pair tries

**Files:**
- Create: `websites/www.cs/music/lib/Pairing.php`, `websites/www.cs/music/api/seal-key.php`, `websites/www.cs/music/pair.php`, `websites/www.cs/tests/php/MusicPairingTest.php`
- Modify: `websites/www.cs/admin/lib/Db.php` (tables `studio_seal_keys (key_id INTEGER PRIMARY KEY, account_id, spki BLOB, fingerprint, registered_at, paired_fp, paired_at)`, `studio_pair_tries (account_id, key_id, at, ok)`), `music/lib/AiKeys.php` (revoke and deleteAll forget the sealing key), `music/lib/KeyGate.php` (`caller()`), `music/lib/bootstrap.php`

**Interfaces:**
- `Pairing::code(string $fingerprintHex): string` (`XXXX-XXXX-XXXX-XXXX`), `Pairing::normalize(string $typed): ?string`.
- `Pairing::validSpki(string $der): bool` (RSA-4096, e = 65537, canonical).
- `Pairing->register(int $account, int $key, string $der): 'ok'|'paired'|'bad_key'`; `->status(int $account, int $key): ?array{fingerprint, paired}`;
  `->check(int $account, int $key, string $typed): array{spki, fingerprint}|'wrong_code'|'too_many'|'no_key'|'not_registered'`;
  `->markPaired(int $account, int $key, string $fp): bool`; `->activeRecipients(int $account): list<string>`; `->unpairAll(int $account): void`.
- `KeyGate->caller(Request $r, ?string $scope): Caller|Response` with `Caller{account, aiKey: ?int, pairedFp: ?string, scopes}`.

- [ ] Tests: code vectors; normalize; validSpki refuses RSA-2048, e = 3, trailing bytes; register is per key and
  per account; a paired key refuses a different key (409 `paired`); check counts wrong codes and answers `too_many` on the
  6th within the hour and after 20 tries per account; another account's key is `no_key`; revoke and start over forget it.
- [ ] Implement, run `PHPUNIT --filter MusicPairing`, commit.

### Task 2: PHP: SIUEN2 notes, recipients, pairing routes

**Files:** `music/lib/Store.php` (`addNote(string, list<string> $aiRecipients)`, table `music_note_recipients`,
`notes($state, ?string $sealedTo)`), `music/lib/Api.php` (notes routes use the caller's paired fingerprint; `api/draft.php`
GET a score; `sealKey()`), `music/lib/Pages.php` (`pair()`, `keyring.php?pair=1`, keyring GET `ai`, notes POST passes the
active recipients, studio page rows), `music/lib/Keyring.php` (`parsePair`), `music/api/draft.php`,
`tests/php/MusicPairingTest.php`, `tests/php/MusicApiTest.php`, `tests/php/MusicPagesTest.php`.

- [ ] Tests: SIUEN2 with the person and a paired AI is stored and listed to that AI only; SIUEN1 is never listed to an
  AI key; an unpaired, revoked or foreign fingerprint is `unknown_key`; a note without the person's key is refused;
  repeated recipients are refused; `keyring.php?pair=1` stores only with a right code, unchanged fingerprints and a good
  proof, and marks the key paired; Forgot your passphrase unpairs; the studio row shows "Waiting For Pairing" and the
  form, or "Paired".
- [ ] Implement, run the three filters, commit.

### Task 3: TypeScript: SIUEN2 sealing and the keyring's `ai` list

**Files:** `games/workroom/src/seal.ts` (`sealTo(body, audio, keys: PublicKey[])`, `open` reads both), `unlock.ts`
(`Unlocked.ai`, `relockKeyring` keeps `ai`, `addAiRecipient`), `pairing.ts` (code and normalize, the same vectors as
PHP and Python), `notes-session.ts` (seal to current + active AI), `remember.ts` (keeps `ai`), `api.ts` (`pair`,
`pairKeyring`, keyring answer `ai`), tests `seal.test.ts`, `unlock.test.ts`, `pairing.test.ts`, `notes-session.test.ts`.

- [ ] Tests: round trip SIUEN2 for each recipient; tampered fingerprints fail; the code vectors match PHP's; a keyring
  with an `ai` entry whose SPKI is not canonical RSA-4096 is invalid; relock keeps `ai`; send seals SIUEN1 with no AI and
  SIUEN2 with an active one, and drops one the server no longer lists.
- [ ] Implement, run each file, commit.

### Task 4: TypeScript: the pairing form and the Connect Your AI panel

**Files:** `ui/PairAi.tsx` (Pairing Code, Passphrase, Pair button; messages), `pair-flow.ts` (`pairAi(api, key, code,
passphrase)`), `ui/ConnectAi.tsx` (numbered steps: Install uv; Make An AI Key; the command per app, copyable; Type The
Pairing Code), `main.ts`, tests `connect-ai.test.ts`, `pair-flow.test.ts`; rebuild `dist/`.

- [ ] Tests: a wrong code is refused before any keyring is sent; a server that hands back a key whose code differs is
  refused by the browser; the right code relocks with the AI added and posts once; the panel shows uv's install link,
  one command per app containing the studio address and the wheel, the SHA-256, and no forbidden words.
- [ ] Implement, rebuild, run, commit.

### Task 5: PHP: the commands, from one place

**Files:** `music/lib/Connect.php` (`Connect::commands(string $base, array $release, string $key): array<app, string>`
for Claude Code, Claude Desktop, Cursor, Codex, Gemini CLI), `Pages.php` (front page `data-connect`; the new-key panel
shows the commands with the key filled in), `music/dist/release.json`, tests in `MusicPagesTest.php`.

- [ ] Tests: each command names the base and the wheel; the placeholder `PASTE-YOUR-AI-KEY-HERE` on the front page;
  the new key in the new-key panel only.
- [ ] Implement, run, commit.

### Task 6: Python: the studio connection and its MCP server

**Files:** `siue_music/studio.py` (`StudioPaths`, `Studio`: key, sealing key, registration, status, pairing code,
pieces, score, publish, delete, notes, wait, mark), `studio_mcp.py`, `sealing.py` (`open_bundle` reads SIUEN2;
`seal_to` for tests), `pickup.py` (open without marking), `cli.py` (`mcp` studio, `owner-mcp`, `save-key`,
`pairing-code`), `connect.py` (owner's commands name `owner-mcp`), tests `test_studio.py`, `test_studio_mcp.py`,
`test_sealing.py`, `test_mcp_protocol.py`.

- [ ] Tests: per-OS config folders; the key file and the sealing key are 0600 in a 0700 folder; the placeholder and a
  missing key give the "make an AI key" message; the code vectors; registration on first start; unpaired notes tools
  give the code; read, mark and wait against the fake server; SIUEN2 opened; no tool deletes notes; the MCP lists its
  tools over stdio.
- [ ] Implement, `make music-test`, commit.

### Task 7: The wheel, the deploy and CI

**Files:** `music/tools/pyproject.toml`, `music/tools/build-wheel`, `music/tools/tests/test_wheel.py`, `music/dist/release.json`,
`deploy.sh` (build, check, stage `music/dist/`), `music/.htaccess`, `docker/nginx/default.conf` if it denies `dist/`,
`.github/workflows/ci.yml` (a Python step running `make music-test`), `tests/php/MusicDeployTest.php`.

- [ ] Tests: two builds are byte-identical; the build's SHA-256 is `release.json`'s; the wheel holds only the package,
  its glossary and its metadata with the console script; `LIST=1 ./deploy.sh` lists the wheel and `release.json`.
- [ ] Implement, run, commit.

### Task 8: The whole flow in a real browser

**Files:** `tests/e2e/studio-ai.local.ts`, `Makefile` (`music-e2e` builds the wheel first).

- [ ] Make an AI key on Your studio; install the built wheel into a temporary venv; run `siue-music mcp` from it over
  stdio and read the pairing code from `studio_status`; a wrong code is refused; the right code pairs; a note typed in
  the browser arrives through `wait_for_notes` and `read_new_notes` opens it; revoking the key makes the next call fail
  with the "make an AI key" message.

### Task 9: Docs

- [ ] The spec (project 3 built; settled calls), `music/README.md`, `docs/superpowers/roadmap.md` (music: studios,
  passphrase changes and the MCP done; the editor in design, next).

## Decisions settled here (Claude's calls, with their cost if wrong)

- **The AI key reaches the MCP as `SIUE_MUSIC_AI_KEY` in the app's command,** filled in on Your studio right after the
  key is made, or from the `ai-key` file that `siue-music save-key` writes (for several apps on one computer). Every MCP
  client passes environment to a stdio server, and the key never enters the AI's conversation. Cost: the key sits in
  plain text in the app's own configuration, as every MCP client's tokens do.
- **Pairing asks for the passphrase,** because only it can lock the keyring again. Cost: one more field.
- **80-bit codes** (16 characters): the server sees the AI's public key before the person types the code, so it
  could search offline for a key of its own with the same code; browsers accept RSA keys with many small prime
  factors, which makes each candidate cheap, so 60 bits was within reach of a determined attacker and 80 bits
  is not. Cost: 16 characters to type.
- **One sealing key per computer** (the config folder), shared by every app there. Cost: one paired key serves every app
  on that computer.
- **Picked up is one mark per note,** shared by the person's page and every AI. Cost: with two AIs, the first to mark a
  note hides it from the other's "new notes".
- **The wheel is cached by the AI app's uv, and its address is cached for a year** (`Cache-Control: immutable`
  on `music/dist/`): uv has no way to check a hash given with `--from`, so after the first download a changed
  file on the server does not reach a computer that already has it. Cost: the first download trusts the site
  (as the page's own script does), and a wheel fixed under the same version would not reach those computers;
  a release always takes a new version.
- **The wheel's version is explicit** (`siue_music/__init__.py`), its SHA-256 committed in `music/dist/release.json`; a
  change to the tool without a new version fails the deploy. The deploy prunes the old wheel. Cost: a person whose app
  points at an older wheel copies the new command after a release.
- **The owner's repository MCP is `siue-music owner-mcp`;** `siue-music mcp` is the studio one everywhere. Cost: the
  owner registers the studio MCP (or reruns `make music-mcp-setup`).
- **The owner's 1Password rotate** writes a keyring without the `ai` list; the AI then reports "not paired" until the
  person pairs again. Cost: one re-pairing after a rotate.

## Found while building

- **Parallel API requests failed with 503** (`database is locked`): the key check left its read cursor open,
  so the meter's `BEGIN IMMEDIATE` failed at once under a concurrent write instead of waiting. An AI app calls
  several tools at once, so the key checks (`Music\KeyGate`, `Admin\Keys`) now close the cursor first;
  `MusicPairingTest::testParallelKeyChecksNeverFailWithALockedDatabase` runs eight processes against one file.
- **The wheel runs on Python 3.10** (uv picks the oldest Python that fits `Requires-Python`): a module that
  named `Path` only in annotations failed there; the tool's suite passes on 3.10.
