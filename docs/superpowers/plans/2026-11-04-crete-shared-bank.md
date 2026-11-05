# Crete shared bank: plan

Design: `specs/2026-11-04-crete-shared-bank-design.md`. Paths below are under `websites/www.cs/games/crete/` unless
they start with `websites/`.

## The wire format

`endless-bank.php`, JSON in and out, `Cache-Control: no-store`.

- `GET ?grade=<easy|medium|hard>&tier=<1..10>&n=<0..16>` → `{ csrf, levels: Shared[] }`. `n=0` only fetches the
  CSRF token. Rate kind `levels`.
- `POST` (Content-Type `application/json`, header `X-Crete-CSRF`, allowed origin), body by `op`:
  - `{ op: "submit", install, tuple: Tuple, made: Made }` → `{ ok: true }`; `409 { error: "duplicate" }`;
    `400 { error: "invalid", field }`; `429 { error: "rate" | "throttled" }`; `403 { error: "version" }`.
  - `{ op: "claim", install, v }` → `{ ticket, tuple }` or `{ none: true }`.
  - `{ op: "verify", install, ticket, found: Made | null }` → `{ ok: true, verdict: "match" | "mismatch" }`;
    `400 { error: "ticket" }` for a ticket not issued to this install, used or expired.
  - `{ op: "report", install, grade, h }` → `{ ok: true }`.

Types (every field required, no others):

- `install`: `[a-f0-9]{32}`.
- `Tuple`: `{ v: int, seed: [a-z0-9-]{1,32}, tier: 1..10, grade, depth: 2..100000, k: 0..parts-1,
  run: Played[1..13] }`; `Played`: `{ text, explored: 0..10^7, score: 0..10^4 }`.
- `Made`: `{ text, line: [a-z]{1,2000}, shortest: 1..2000, score: 0..10^4, explored: 0..10^7, chapter: 1..10,
  hides: bool }`.
- `Shared` (served out): `Made` plus `h` (the layout hash, 16 hex).

## Tasks

1. **Spec and plan** (this file and the design).
2. **Server** — `bank/Bank.php` (library: validation, layout hash, stores, quarantine, tickets, verdicts, strikes,
   roll-out, reports, keys), `bank/config.json`, `endless-bank.php` (thin HTTP layer on the kit's `ScoreGuard`),
   `tools/install-files.php` gains `kit_php` for `score-guard.php`, `store-dir.php`, `blocked-initials.json`
   (copied to `server/`), `test/php/EndlessBankTest.php` and a `crete` PHPUnit suite in
   `websites/www.cs/phpunit.xml`, run by `test.sh`. `websites/www.cs/deploy.sh` makes `games/crete/data/`
   (770, then 2770, every line failure-tolerant, after the upload batch) and never stages `games/crete/data/*`;
   `tests/php/AdminDeployTest.php` checks the new batch.
3. **Provenance** — `src/endless/provenance.ts`: `ENDLESS_VERSION`, `tupleOf(request, k)`, `requestOf(tuple)`,
   `sameMade`, `madeOf`, `regenerate(tuple, known)`; `test/shared-version.test.ts` pins one part's output to the
   version; `test/shared-provenance.test.ts` (round trip, last plain kept, a verifier rejects a text that does not
   match its tuple).
4. **The shared cache** — `src/endless/shared.ts`: install id, CSRF, `upload`, `refill`, `take(request)` with the
   client checks (`sharedProblems`), the played set, `report`, `claim`/`verdict`; `test/shared.test.ts`.
5. **The verifier** — `src/endless/verifier.ts`: one claim at a time in its own worker, stop on demand, back-off;
   tests in `test/shared.test.ts`.
6. **The mode** — `client.ts` resolves with the part `k`; `mode.ts` gains `shared` and `made` deps, seeded runs,
   `from: 'shared'`, `idle()`; `saved.ts` keeps `seeded` and accepts `from: 'shared'`; `main.ts` wires the cache, the
   uploads and the verifier into `followEndless`; tests in `test/endless.test.ts`.
7. **Words** — the start card's "From the shared bank."; README's Endless section; `websites/www.cs/privacy.html`.
8. **e2e** — `websites/www.cs/tests/e2e/crete-shared-bank.spec.ts`: New Run takes level 1 from a routed shared bank
   at once.
9. **Build and land** — `node ../_kit/build/build.mjs crete`, `php tools/install-files.php`,
   `php tools/site-game-pages.php`; PR through foundry:pr-fix-loop; merge on green.
