# Workroom Answering Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The owner answers in the workroom page itself, on a phone first: pins a typed or spoken note on a moment or a span (optionally a lane), hums up to a minute, reacts to a section with one tap, redraws the energy curve, reads every note (waiting or picked up) once the key is unlocked, deletes notes, and never loses a note: a sealed note that cannot be sent waits in the outbox on this device.

**Architecture:** DOM-free modules decide everything (`answer.ts` builds note bodies, `energy.ts` redraws curves, `recorder.ts` drives a recorder through ports, `hit.ts` finds the section under a time); Web Crypto modules talk to the server and keep notes (`api.ts`, `outbox.ts`, `history.ts`, `notes-session.ts`); `idb.ts` is the only IndexedDB code and holds sealed bundles only; thin Preact components in the Studio Console look (`Button`, `Panel`, `Chip`, `Sheet`, `Legend`, `GuideOverlay`, tokens only) render them; `main.ts` wires the browser in. The server side is unchanged: PR 1 already serves `notes.php`, `note.php`, `delete.php`, `keyring.php` and `csrf.php`.

**Tech Stack:** TypeScript 7, Preact 11, Tailwind v4 (tokens in `src/app.css`), esbuild 0.28 through `games/_kit/build/build.mjs`, `node:test` on Node 24 (Web Crypto as `globalThis.crypto.subtle`), the kit's DOM stub (`games/_kit/test/dom-stub.ts`) and `importTsx` (`games/_kit/test/tsx.ts`); `fake-indexeddb` (exact-pinned devDependency of `games/`, test-only) for the IndexedDB outbox; PHPUnit 12 for one deploy pin; Playwright (local only, `make music-e2e`); the owner's Python tool (`music/tools/siue-music`) for the pickup step of the browser check.

**Spec:** `docs/superpowers/specs/2026-10-17-music-workroom-design.md` (the answering features, notes sealed until the owner deletes them, phone first) and `docs/superpowers/specs/2026-10-17-workroom-theme-design.md` (the look: tokens, components, the guide, legends, dark and daylight). It replaces Tasks 14 and 15 of `docs/superpowers/plans/2026-10-17-music-workroom.md`, re-derived against the code on `main` after PRs 1–4 (#158–#161).

Paths below are relative to `websites/www.cs/` unless they start with `docs/`. Node commands run from `websites/www.cs/games`.

The code and tests in Tasks 1–16 and the unit test and browser-check code of Task 17 were applied to a copy of `main` while this plan was written: every `games/workroom` unit test passes, the four type-check programs and `tests/e2e`'s program are clean. `make music-e2e` itself has not been run against them; Task 17 runs it.

## Global Constraints

- **Work on branch `music/answer-ui`** in the worktree `.claude/worktrees/music-answer-ui`. Never commit to `main`.
- **Keys never touch browser storage.** The passphrase, the locked keyring and the unlocked keys are never written to IndexedDB, `localStorage`, `sessionStorage`, a cookie or the Cache API; www.cs is one origin shared by every user's `~folder`. The passphrase is asked on every visit (1Password fills it). The unlocked keys live only in the vault (`src/vault.ts`), in memory. **Only sealed notes waiting to be sent live in IndexedDB** (database `siue-music`, store `outbox`, records `{ key, bundle, made, reason }`): nothing in the clear about a note (no piece, no words, no span) is stored in the browser.
- **Limits** (spec): a recording is at most **60 s** (the recorder stops itself); a sealed note is at most **2,097,152** bytes (`MAX_NOTE_BYTES`, equal to `Store::MAX_NOTE_BYTES`); the server keeps **2,000** notes. A note over a limit, or refused by the server, stays in the outbox with a plain message; nothing is ever dropped without the owner pressing **Discard**. A typed note holds at most **4,000** characters; an energy shape at most **512** points (a longer curve, drawn or the piece's own, is resampled to 512 evenly spaced points before it is sealed, so it can always be sent).
- **The server is not changed.** Session routes (all same-origin, signed in): `GET notes.php` → `{ notes: [{ id, size, arrived_at, picked_up_at }] }` (oldest first); `POST notes.php` (raw `application/octet-stream` sealed bundle, `X-CSRF` header) → `201 { id, csrf }` or a refusal `{ error, csrf }` with 413 `too_large`, 409 `full`, 422 `bad_header` / `unknown_key`, 503 `no_key`; `GET note.php?id=` → the sealed bytes (`application/octet-stream`); `POST delete.php` (`application/x-www-form-urlencoded`, `id=<32 hex>` or `all=1`, `X-CSRF`) → `{ deleted, csrf }`; `GET keyring.php` → `{ keyring }` or 404 `{ error: "no_keyring" }`; `GET csrf.php` → `{ csrf }`. **`checkCsrf` spends the token on every check, right or wrong**; a refused check answers `403 { "error": "csrf" }` with no new token, so the page fetches `csrf.php` and retries once. A signed-out request is redirected to the admin sign-in (`fetch` reports `redirected`), or answers 401/403.
- **The look** (theme spec): components only from `src/ui/console/` (`Button`, `Tabs`, `Chip`, `Panel`, `Sheet`, `Readout`, `Legend`, `GuideOverlay`); colours only through tokens (`ground`, `panel`, `well`, `lane`, `rule`, `ink`, `dim`, `amber`, `go`, `record`, `on-accent`, `paper`); **no hex literal and no Tailwind palette class** in `src/ui/**` or `src/main.ts` (`test/tokens.test.ts` scans them); score colours go through `readableOn(theme, color, 'mark' | 'text')`; **every tap target at least 44 px** (`min-h-11 min-w-11`; `Button` already is); **no `style="…"` attribute** (the CSP blocks it; Preact `style` props and SVG attributes are fine); **no Escape handler anywhere** (Escape is never bound; each new composer, question and overlay is tested at run time by pressing Escape at every one of its elements and at every window and document key listener, as `test/guide-overlay.test.ts` does for the guide); `record` (red) is the colour of recording only (this page's UI uses it for the Record and Stop buttons and the recording strip), `amber` of time and selection, `go` of sending and energy. A destructive action is a plain secondary button with explicit words ("Delete all 12 notes"), and an error line has an `amber` border: never the red `error` class.
- **Guide and legends:** anything the answering UI draws that a view did not draw before gets a legend item and a "How to read this" part (notes on the Story timeline; the energy drawing). The guide opens by itself the first time a browser shows a view (`workroom-guide-<view>` flags in localStorage are not secrets and stay).
- **Phone first.** Below 1024 px one column; the notes panel is the bottom sheet. The answer bar sits under the player in the main column. **Pinning keeps the timeline on screen:** Pin a note scrolls the Story view to the top of the screen, and what needs the owner right now (the pin composer, the Stop button of a recording, a recording kept but not yet stored) sits in the bar's dock, fixed at the bottom of a phone's screen above the sheet handle (`fixed inset-x-0 bottom-11`), at most 40 dvh tall and scrolling inside itself; from 1024 px the dock is in the page's flow. The sheet holds the unlock form, the note history, the outbox, the words and Claude's changes. Text inputs are `text-base` (16 px) so iOS does not zoom.
- **iOS audio.** `getUserMedia` is called synchronously inside the tap that starts a recording (no `await` before it). The recorder picks the first type `MediaRecorder` supports from `audio/webm;codecs=opus`, `audio/mp4`, `audio/ogg;codecs=opus`. Where `navigator.audioSession` exists the recorder sets it to `'play-and-record'` while recording and `'auto'` afterwards; the `'playback'` trick in `src/ui/demo-player.ts` stays for playback only.
- **Nothing the owner typed or recorded is cleared until the sealed note is stored.** A typed note stays in its box until the sealed bundle is in the outbox's store (IndexedDB, or this page view's memory when the browser refuses it; the kept note's message then adds a one-line notice that it lives only until the page closes). A note that cannot be sealed (for example `crypto.subtle` is missing on a page that is not secure) leaves the composer open with its words and a plain message. A recording always has a visible Stop; moving to another mode while recording stops the microphone and keeps the recording to **Send recording** or **Discard recording**; a recording that cannot be stored stays the same way.
- **Type-check programs.** Every new `src` file joins one program: DOM-free `tsconfig.json` (`answer.ts`, `energy.ts`, `recorder.ts`); Web Crypto `src/tsconfig.crypto.json` (`api.ts`, `outbox.ts`, `history.ts`, `notes-session.ts`, which import `seal.ts`, `unlock.ts` or each other); DOM `src/tsconfig.dom.json` (`idb.ts`, `ui/*.tsx`, `ui/waiting.ts`). A DOM-free module must not import a Web Crypto one. Byte buffers that reach `crypto.subtle`, `fetch` or IndexedDB are `Uint8Array<ArrayBuffer>`.
- **The built page is committed.** After changing anything under `games/workroom/src`, run `node _kit/build/build.mjs workroom` and commit `games/workroom/dist/` with the task; `node _kit/build/build.mjs workroom --check` (type-checks every program, then compares `dist/`) must exit 0 before each commit.
- **CI is not changed:** no edits to `.github/`, `tests/e2e/select.ts`, `compose.yaml`, `tests/e2e/playwright.config.ts`, or the Makefile's `test` and `e2e` targets. The local check's files may change: `tests/e2e/workroom.local.ts`, `tests/e2e/local.config.ts`, a new `compose.music-local.yaml`, the Makefile's `music-e2e` recipe. The one other file CI reads that this plan changes is `games/package.json` with its lock file: `fake-indexeddb` joins `devDependencies`, exact-pinned (Task 7). The one line near CI is `env[MUSIC_PUBLIC_KEYS] = $MUSIC_PUBLIC_KEYS` in `docker/php/Dockerfile` (FPM clears the worker environment; it does nothing unless the variable is set, and only `compose.music-local.yaml` sets it).
- **Ports and docker:** never bind 3000, 5173, 8000 or 8080; docker runs use a unique project name and are torn down with `docker compose -p <name> down -v`; never touch the `siue` project; never prune. Never SSH, SFTP or SCP to www.cs; deploys happen on merge.
- **Nothing secret is committed;** the repository is public. Test keys under `games/workroom/test/fixtures/` are labelled test keys. Screenshots go to a scratch folder outside the repository.
- **Comments and docs describe the current state, never history** ("kept from when…", "now does…", "changed to…" are not allowed).
- **Commits** end with the committing session's attribution lines, in this shape:
  ```
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb
  ```

## Review Focus

1. **No connection, a lost sign-in, a full server or an oversized note while sending:** the sealed note is in IndexedDB before the first try, stays there with a plain reason, and goes on its own when the page loads or the browser comes back online; only **Discard** removes an unsent note. Pinned in Task 7 (`outbox.test.ts`) and Task 17 (the offline browser test).
2. **A double tap on Send or Delete, or a stale tab, spends the one-time CSRF token twice:** the API client sends one POST at a time, carries the token each answer returns, and on `403 {"error":"csrf"}` fetches `csrf.php` once and retries once. Pinned in Task 6 (`api.test.ts`).
3. **An iPhone records:** Safari has no WebM recording, refuses a microphone asked for after an `await`, and goes silent under a `'playback'` audio session: the recorder picks `audio/mp4`, asks for the microphone first thing in the tap, switches the session to `'play-and-record'` while recording, and the 60 s cap stops and keeps the recording. Pinned in Task 5 (`recorder.test.ts`).
4. **A tap exactly on a section boundary** (or a playhead resting on one) must react to a section, never to none or to the one before: floating-point round trips through pixels land a hair either side. Pinned in Task 1 (`hit.test.ts`).
5. **A note from another draft or another piece, a damaged note, or a note sealed to a key the page lacks:** the history shows each with its draft or its problem, never fails the whole list, and validates every opened body's shape before rendering it. Pinned in Task 3 (`note.test.ts`), Task 8 (`history.test.ts`) and Task 9 (`notes-session.test.ts`).
6. **Nothing typed or recorded is lost, and a recording can always be stopped:** the words stay in the box and the recording stays on screen until the sealed note is stored; a note that cannot be sealed says so and keeps the composer; a browser that refuses IndexedDB keeps the note in memory with a notice; leaving a mode while recording stops the microphone and keeps the recording to Send or Discard; a recorder that fails after the microphone was granted releases it. Pinned in Task 5 (`recorder.test.ts`), Task 7 (`idb.test.ts`), Task 12 (`composers.test.ts`) and Task 15 (`workroom-answer.test.ts`).
7. **Two tabs open on one outbox:** a kept note is uploaded once, because the flush runs under the Web Locks lock `workroom-outbox`. Pinned in Task 7 (`outbox.test.ts`).

## Decisions this plan makes (the specs leave them open)

- **The body check lives in `note.ts` and is reused.** `seal.ts` already refuses a body that fails a private `isNoteBody` before `open()` returns, so the history never receives an unchecked body. The check moves to `note.ts` (DOM-free, exported), gains ranges (ids, non-negative times in order, bars together or not at all, text ≤ 4,000, curve values in [0, 1] and ≤ 512 points, audio 0–60 s, an ISO time) and per-kind requirements (`text` has words, `speech`/`hum` audio, `react` a reaction, `energy` a curve), and `seal.ts` imports it. A body that fails it opens as `NoteUnreadable('tampered')`.
- **The section under a time comes from seconds, not pixels.** `hit.ts` gains `BOUNDARY_EPS = 1e-9` s and `spanIndexAt`: spans are inclusive at both ends within the epsilon, and on a shared boundary the later span wins. `hitTimeline` and the new `sectionAt` both use it, and the timeline layout carries each section's seconds.
- **Pinning happens on the Story view, with the timeline on screen.** "Pin a note" switches to Story, scrolls the stage to the top of the screen and puts its gestures in select mode: a drag picks a span (and the lane only when the drag starts and ends in the same lane), a tap picks a moment (and moves the playhead). The other views keep panning. The composer is docked at the bottom of a phone (at most 40 dvh, scrolling inside itself, above the notes handle), so the timeline and the picked span stay visible; the browser check asserts both at 390 × 844.
- **Drawing the energy has its own surface.** The 48 px energy band is too small for a finger, so "Draw the energy" swaps the view for a 160 px drawing well over the same time axis: the energy now as a dashed line, the owner's shape in `go`, faint sections for orientation, its own legend and its own "How to read this" (guide view `energy`, flag `workroom-guide-energy`). Each stroke replaces the curve under its time span; Send seals the whole curve, resampled to at most 512 points. While a stroke is in progress the drawing holds the playhead's follow, as the other views do.
- **The history lists this piece by default.** Two chips switch between This piece and All pieces; a note that cannot be opened is listed under both (its piece is unknown, and it must stay deletable). **Delete** (one note), **Delete all** and **Discard** each ask first, inline, in words that name what goes (“Delete this note?”, “Delete all 12 notes, on every piece?”); every button involved is a plain secondary button, because red belongs to recording. **Delete all** deletes every note on every piece and its question says so. Notes are listed only after an unlock; before it the panel shows the unlock form and the outbox.
- **Notes on the timeline** are drawn (after an unlock) as outlines in their lane, or across all lanes, numbered in the order they were made; a moment is a thin line. Energy notes are not drawn (they cover the whole piece); they are listed. Claude's changes keep their amber tabs, and each history item names the changes that answer it.
- **The notes panel is "Notes & answers"** and holds, in order: Your notes (unlock / history / not sent yet), an opened word card, Words in this piece, Claude's changes. The panel holding the history is named “Notes & answers” and the typed note's box is the textbox “Your note”, so no two controls share a name and the browser check can tell them apart by role.
- **A reaction is one tap.** The bar stays open after it with “Sent. It is waiting for pickup.” in its status line, so several reactions go one after another; every other note closes its composer once it is stored.
- **The unlock form keeps its hidden `siue-music` username beside the `current-password` field** so 1Password fills it. Chrome's own password manager may offer to save that pair; the owner dismisses the prompt (Never). The page cannot suppress it without breaking 1Password, and the passphrase is never stored by the page itself.
- **"Draft limits" means the composer's own limits:** the 4,000-character text (a count appears from 3,500 characters, when 500 are left), the 60 s recording, the 512-point shape; the server's draft-publishing limits are not page concerns.
- **No key built in yet** (`PUBLIC_KEY === null`, before `make music-setup`): the answer bar says "Notes are off: this page has no notes key yet (make music-setup)." and nothing seals; the pieces list keeps the server's total.
- **The pieces list shows per-piece waiting counts after an unlock** on that page (the server cannot know a sealed note's piece); before it, only the server's total.
- **The browser check uses a test-key bundle.** `games/workroom/tools/e2e-bundle.ts` builds `src/main.ts` with `src/public-key.ts` replaced by `test/fixtures/public-key.ts` into a temporary folder outside the repository; the check routes `dist/workroom.js` to it. The shipped bundle is never built with a test key. `compose.music-local.yaml` points the server at `games/workroom/test/fixtures/public.json`; Chrome runs with a fake microphone (`tests/e2e/local.config.ts`).
- **The recorder asks for 64 kb/s,** so a minute of speech is about 0.5 MB sealed, well under 2 MB.

## File map

```
websites/www.cs/
  games/workroom/
    src/hit.ts                 # + BOUNDARY_EPS, spanIndexAt, sectionAt (Task 1)
    src/timeline.ts            # sections carry from/to seconds (Task 1)
    src/note.ts                # + limits, isNoteBody (Task 3)
    src/seal.ts                # imports isNoteBody (Task 3)
    src/answer.ts              # note builders, reactions, labels, NoteMark (Task 3)
    src/energy.ts              # strokes, redraw, curve pixels (Task 4)
    src/recorder.ts            # MIME choice, 60 s cap, recorder over ports (Task 5)
    src/api.ts                 # the page's API client (Task 6)
    src/outbox.ts              # sealed notes waiting to be sent (Task 7)
    src/idb.ts                 # the outbox in IndexedDB, memory where it refuses (Task 7)
    src/history.ts             # history items, counts, timeline marks (Task 8)
    src/notes-session.ts       # unlock, history, send, delete over the ports (Task 9)
    src/guide.ts src/tabs.ts   # energy guide, "your notes" part, legends (Task 10)
    src/browser.ts             # + browserMedia(), browserLock() (Task 16)
    src/main.ts                # wiring (Task 16)
    src/ui/console/{Button,Panel,Sheet}.tsx            # submit buttons, names, aria-controls (Task 2)
    src/ui/{UnlockPanel,History,Answers}.tsx            # Task 11
    src/ui/{PinComposer,RecordButton,ReactBar}.tsx      # Task 12
    src/ui/EnergyEditor.tsx                             # Task 13
    src/ui/surface.ts src/ui/Timeline.tsx               # select mode, marks (Task 14)
    src/ui/{AnswerBar,Workroom}.tsx                     # Task 15 (the AnswerBar's dock holds the composer, the Stop and a kept recording)
    src/ui/{PiecesIndex.tsx,waiting.ts}                 # Task 16
    tsconfig.json src/tsconfig.crypto.json src/tsconfig.dom.json
    tools/e2e-bundle.ts                                 # Task 17
    test/{hit,console,note,answer,energy,recorder,api,outbox,idb,history,notes-session,guide-answer,answering-views,composers,energy-editor,timeline-select,workroom-answer,waiting,no-storage,workroom}.test.ts
    test/e2e-bundle.test.ts                             # Task 17
  games/package.json games/package-lock.json            # + fake-indexeddb, exact-pinned devDependency (Task 7)
    dist/                                               # rebuilt with each task
  compose.music-local.yaml       # MUSIC_PUBLIC_KEYS for the local check (Task 17)
  docker/php/Dockerfile          # + env[MUSIC_PUBLIC_KEYS] (Task 17)
  tests/php/MusicDeployTest.php  # pins that line (Task 17)
  tests/e2e/local.config.ts      # fake microphone (Task 17)
  tests/e2e/workroom.local.ts    # answering tests and screens (Tasks 17, 18)
  Makefile                       # music-e2e: the overlay, the test bundle, MUSIC_PY (Task 17)
  music/README.md                # answering, the local check (Task 18)
```

---

### Task 1: The section under a time, exact at the boundaries

**Files:**
- Modify: `games/workroom/src/hit.ts`, `games/workroom/src/timeline.ts:23,36-39`
- Test: `games/workroom/test/hit.test.ts`

**Interfaces:**
- Consumes: `sectionTimes(section, tempo, duration)` (`tempo.ts`), `layoutTimeline` (`timeline.ts`).
- Produces:

```ts
// src/hit.ts
export const BOUNDARY_EPS = 1e-9; // seconds
/** Index of the span playing at t. Spans are in time order and cover from..to inclusive, within BOUNDARY_EPS; on a shared boundary the later span wins. -1 in a gap, or when there are none. */
export function spanIndexAt(spans: readonly { from: number; to: number }[], t: number): number;
/** The section playing at t (null in a gap between a sound piece's moments, or when it has none). */
export function sectionAt(score: Score, tempo: TempoMap, t: number): Section | null;
// src/timeline.ts: TimelineLayout.sections entries gain `from: number; to: number` (seconds).
```

- [ ] **Step 1: Write the failing tests.** Add to `test/hit.test.ts` (extend the imports: `sectionAt` from `../src/hit.ts`, `timeToX` from `../src/zoom.ts`):

```ts
test('a tap exactly on a section boundary hits the section that starts there, at any zoom', () => {
  const cases: [Score, string, number][] = [[sound, 'echo', 0.08], [score, 'thread', 8]];
  for (const [piece, want, at] of cases) {
    const t = tempoMap(piece);
    for (const width of [390, 391, 733, 1280]) {
      for (const start of [0, 0.0007, 0.031, 0.05, 0.07, 1.3, 2.9]) {
        for (const k of [1, 1.7, 3.3, 7.1]) {
          const v = { start: Math.min(start, piece.duration / 2), pxPerSec: (width / piece.duration) * k, width };
          const x = timeToX(v, at);
          if (x < 0 || x > width) continue;
          const hit = hitTimeline(layoutTimeline(piece, t, v), v, t, x, 90);
          assert.equal(hit.sectionId, want, `${piece.piece.id} width ${width}, start ${v.start}, zoom ${k}: time ${hit.time}`);
        }
      }
    }
  }
});

test('sectionAt: the section under a time; a boundary belongs to the later section; a gap has none', () => {
  assert.equal(sectionAt(score, tempo, 8)?.id, 'thread');
  assert.equal(sectionAt(score, tempo, 8 - 1e-12)?.id, 'thread', 'a hair before the boundary is on it');
  assert.equal(sectionAt(score, tempo, 7.9)?.id, 'stirs');
  assert.equal(sectionAt(score, tempo, 0)?.id, 'stirs');
  assert.equal(sectionAt(score, tempo, 16)?.id, 'thread', 'the end of the piece is in the last section');
  const sTempo = tempoMap(sound);
  assert.equal(sectionAt(sound, sTempo, 0.07999999999999999)?.id, 'echo');
  const gappy: Score = { ...sound, sections: [{ ...sound.sections[0]!, to: 0.05 }, sound.sections[1]!] };
  assert.equal(sectionAt(gappy, tempoMap(gappy), 0.06), null, 'between two moments');
  assert.equal(sectionAt(gappy, tempoMap(gappy), 0.05)?.id, 'blast', 'the end of a moment is still in it');
  assert.equal(sectionAt({ ...sound, sections: [] }, sTempo, 0.1), null);
});
```

- [ ] **Step 2: Run to see them fail** — `node --test workroom/test/hit.test.ts` — the boundary test FAILS (`cannon-fire width 390, start 0.05, zoom 7.1: … 'blast' !== 'echo'`), `sectionAt` is not exported.

- [ ] **Step 3: Implement.** In `src/timeline.ts`, the sections entry type becomes `sections: { id: string; name: string; color: string; from: number; to: number; rect: Rect }[];` and the mapping returns `{ id: s.id, name: s.name, color: s.color, from, to, rect: { ...span(from, to), y: energyH, h: sectionH } }`. In `src/hit.ts` add the imports `import type { Score, Section } from './score.ts';` and `import { sectionTimes } from './tempo.ts';`, then:

```ts
/** Seconds within which a time counts as on a boundary: a time that went through pixels and back lands a hair either side of it. */
export const BOUNDARY_EPS = 1e-9;

export function spanIndexAt(spans: readonly { from: number; to: number }[], t: number): number {
  for (let i = spans.length - 1; i >= 0; i--) {
    const s = spans[i]!;
    if (t >= s.from - BOUNDARY_EPS) return t <= s.to + BOUNDARY_EPS ? i : -1;
  }
  return -1;
}

export function sectionAt(score: Score, tempo: TempoMap, t: number): Section | null {
  const i = spanIndexAt(score.sections.map(s => sectionTimes(s, tempo, score.duration)), t);
  return score.sections[i] ?? null;
}
```

In `hitTimeline`, replace the `sections`, `last` and `section` lines with `const section = layout.sections[spanIndexAt(layout.sections, time)];` (the `sectionId: section?.id ?? null` stays).

- [ ] **Step 4: Run the tests** — `node --test workroom/test/hit.test.ts workroom/test/timeline.test.ts workroom/test/guide.test.ts` — PASS. Then `node _kit/build/build.mjs workroom` and `node _kit/build/build.mjs workroom --check` — exit 0.

- [ ] **Step 5: Commit**

```bash
git add websites/www.cs/games/workroom
git commit -m "Music workroom: the section under a time, exact at its boundaries

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb"
```

### Task 2: Console components the answering UI needs

**Files:**
- Modify: `games/workroom/src/ui/console/Button.tsx`, `src/ui/console/Panel.tsx`, `src/ui/console/Sheet.tsx`
- Test: `games/workroom/test/console.test.ts`

**Interfaces:**
- Produces:

```ts
// Button: a new prop; the button is type="submit" when it is set, type="button" otherwise.
export interface ButtonProps { /* …existing… */ submit?: boolean }
// Panel: the accessible name is `label`, else `title`.
// Sheet:
export const SHEET_BODY_ID = 'notes-sheet-body'; // the body's id; the phone handle has aria-controls={SHEET_BODY_ID}
```

- [ ] **Step 1: Write the failing tests.** Add to `test/console.test.ts` (import `document as stubDocument` from `../../_kit/test/dom-stub.ts` beside the others):

```ts
test('Button: submit makes a submit button; otherwise it never submits a form', async () => {
  const plain = walk(await mount(h(c.button.Button, {}, 'Go'))).find(e => e.localName === 'button')!;
  const submit = walk(await mount(h(c.button.Button, { submit: true }, 'Unlock'))).find(e => e.localName === 'button')!;
  assert.equal(plain._attrs['type'], 'button');
  assert.equal(submit._attrs['type'], 'submit');
});

test('Panel: the heading names the panel when no label is given; a label wins', async () => {
  const titled = walk(await mount(h(c.panel.Panel, { title: 'Your notes' }, 'x'))).find(e => e.localName === 'section')!;
  assert.equal(titled._attrs['aria-label'], 'Your notes');
  const labelled = walk(await mount(h(c.panel.Panel, { title: 'Your notes', label: 'Notes for this piece' }, 'x'))).find(e => e.localName === 'section')!;
  assert.equal(labelled._attrs['aria-label'], 'Notes for this piece');
});

test('Sheet: the handle controls the body; open, the body is a grid on a phone too', async () => {
  const root = await mount(h(c.sheet.Sheet, { title: 'Notes & answers', open: true, onToggle: () => {} }, 'inside'));
  const handle = walk(root).find(e => e.localName === 'button' && e._attrs['aria-expanded'] !== undefined)!;
  const body = walk(root).find(e => e._attrs['data-sheet-body'] !== undefined)!;
  assert.equal(body.id, c.sheet.SHEET_BODY_ID);
  assert.equal(handle._attrs['aria-controls'], c.sheet.SHEET_BODY_ID);
  assert.equal(handle._attrs['aria-expanded'], 'true');
  assert.ok(classes(body).includes('grid') && !classes(body).includes('hidden'), 'open: shown at every width');
});

test('Tabs: the arrows, Home and End move the focus with the selection', async () => {
  const items = [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }, { id: 'c', label: 'C' }];
  const root = await mount(h(c.tabs.Tabs, { label: 'Views', idPrefix: 'f', items, value: 'b', onChange: () => {} }));
  const tabs = walk(root).filter(e => e._attrs['role'] === 'tab');
  fire(tabs[1]!, 'keydown', { key: 'ArrowRight' });
  assert.equal(stubDocument.activeElement, tabs[2]);
  fire(tabs[1]!, 'keydown', { key: 'Home' });
  assert.equal(stubDocument.activeElement, tabs[0]);
  fire(tabs[1]!, 'keydown', { key: 'End' });
  assert.equal(stubDocument.activeElement, tabs[2]);
  // The tabs move from the selected one (value), whichever button the key lands on.
  const first = await mount(h(c.tabs.Tabs, { label: 'Views', idPrefix: 'g', items, value: 'a', onChange: () => {} }));
  const wrap = walk(first).filter(e => e._attrs['role'] === 'tab');
  fire(wrap[0]!, 'keydown', { key: 'ArrowLeft' });
  assert.equal(stubDocument.activeElement, wrap[2], 'wraps');
});
```

The Tabs focus test pins behaviour that already works; the other three fail.

- [ ] **Step 2: Run to see them fail** — `node --test workroom/test/console.test.ts` — FAIL (no `submit`, no fallback name, no `SHEET_BODY_ID`).

- [ ] **Step 3: Implement.**
  - `Button.tsx`: add `/** A form's submit button (type="submit"); every other button is type="button" and never submits. */ submit?: boolean;` to `ButtonProps`, and render `type={p.submit ? 'submit' : 'button'}`. With `submit`, `onClick` is optional and the form's `onSubmit` does the work.
  - `Panel.tsx`: `aria-label={p.label ?? p.title}`; update the `label` doc comment to "The accessible name; the title when not given."
  - `Sheet.tsx`: `export const SHEET_BODY_ID = 'notes-sheet-body';`, the handle gets `aria-controls={SHEET_BODY_ID}`, the body div gets `id={SHEET_BODY_ID}`.

- [ ] **Step 4: Run the tests** — `node --test workroom/test/console.test.ts workroom/test/workroom.test.ts workroom/test/guide-overlay.test.ts` — PASS; rebuild and `--check` — exit 0.

- [ ] **Step 5: Commit** — `git add websites/www.cs/games/workroom` and commit "Music workroom: submit buttons, panel names and the sheet's controls" with the trailers.

### Task 3: Note bodies: the shape check, the limits and the builders

**Files:**
- Modify: `games/workroom/src/note.ts`, `games/workroom/src/seal.ts:3-4,75-90`, `games/workroom/tsconfig.json` (`src/answer.ts` joins `files`)
- Create: `games/workroom/src/answer.ts`
- Test: `games/workroom/test/note.test.ts`, `games/workroom/test/answer.test.ts`

**Interfaces:**
- Consumes: `ID_RE`, `Score`, `Section` (`score.ts`); `Span` (`hit.ts`); `TempoMap`, `sectionTimes` (`tempo.ts`); `formatSeconds` (`axis.ts`).
- Produces:

```ts
// src/note.ts (beside NOTE_KINDS, REACTION_IDS, NoteBody)
export const MAX_TEXT = 4000;
export const MAX_AUDIO_SECONDS = 60;
export const MAX_CURVE_POINTS = 512;
export const MAX_NOTE_BYTES = 2_097_152; // music/lib/Store.php MAX_NOTE_BYTES
export const MAX_NOTES = 2000;           // music/lib/Store.php MAX_NOTES; outbox.ts names it in the "server is full" message
export function isNoteBody(x: unknown): x is NoteBody;

// src/answer.ts
export const REACTION_LABELS: Readonly<Record<Reaction, string>>;
export const REACTIONS: readonly { id: Reaction; label: string }[]; // in REACTION_IDS order
export class NoteEmpty extends Error {}
export class NoteTooLong extends Error {}
export interface Context { piece: string; draft: number; now: () => Date }
export interface Audio { mime: string; seconds: number }
export function textNote(c: Context, span: Span, text: string): NoteBody;
export function speechNote(c: Context, span: Span, audio: Audio): NoteBody;
export function humNote(c: Context, at: { time: number; bar: number | null; laneId: string | null }, audio: Audio): NoteBody;
export function reactNote(c: Context, section: Section, tempo: TempoMap, duration: number, reaction: Reaction): NoteBody;
export function energyNote(c: Context, curve: readonly [number, number][], duration: number, bars: number | null): NoteBody; // the curve is resampled to at most MAX_CURVE_POINTS
/** A curve of at most `max` points (default MAX_CURVE_POINTS): a longer one is resampled at evenly spaced times between its first and last, interpolating; a shorter one is only put in time order. */
export function resampleCurve(curve: readonly [number, number][], max?: number): [number, number][];
export function wholePiece(score: Score): Section;  // id 'whole-piece'
export function spanLabel(s: { from: number; to: number; fromBar: number | null; toBar: number | null }): string;
export function recordClock(seconds: number): string;   // "0:07"
export const KIND_LABELS: Readonly<Record<NoteKind, string>>;
/** One of the owner's notes drawn on the Story timeline (history.ts makes them; Timeline.tsx and guide.ts read them). */
export interface NoteMark { id: string; n: number; from: number; to: number; lane: string | null; kind: NoteKind; draft: number }
```

- [ ] **Step 1: Write the failing tests.**

`test/note.test.ts`:

```ts
// The shape every opened note must have before the page shows it: ids, times
// in order, bars together, the limits, and what each kind must carry.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { MAX_CURVE_POINTS, MAX_TEXT, isNoteBody } from '../src/note.ts';
import type { NoteBody } from '../src/note.ts';

const ok: NoteBody = {
  v: 1, kind: 'text', piece: 'test-piece', draft: 2, from: 8, to: 12, fromBar: 5, toBar: 6, lane: 'brass',
  text: 'louder here', reaction: null, curve: null, audio: null, made: '2026-10-20T14:03:11.000Z',
};

test('a well-formed note of each kind passes', () => {
  const good: NoteBody[] = [
    ok,
    { ...ok, kind: 'speech', text: null, audio: { mime: 'audio/mp4', seconds: 12.5 } },
    { ...ok, kind: 'hum', text: null, from: 3, to: 3, fromBar: 2, toBar: 2, lane: null, audio: { mime: 'audio/webm;codecs=opus', seconds: 60 } },
    { ...ok, kind: 'react', text: null, reaction: 'love-it' },
    { ...ok, kind: 'energy', text: null, from: 0, to: 16, fromBar: 1, toBar: 8, lane: null, curve: [[0, 0], [8, 1], [16, 0.5]] },
    { ...ok, piece: 'cannon-fire', from: 0.02, to: 0.2, fromBar: null, toBar: null, lane: 'boom' },
    { ...ok, made: '2026-10-20T14:03:11Z' },
  ];
  for (const b of good) assert.equal(isNoteBody(b), true, JSON.stringify(b));
});

test('a body out of shape is refused', () => {
  const bad: unknown[] = [
    null, [], 'note', { ...ok, v: 2 }, { ...ok, kind: 'shout' },
    { ...ok, piece: 'Bad Piece' }, { ...ok, piece: '../x' }, { ...ok, draft: 0 }, { ...ok, draft: 1.5 },
    { ...ok, from: -1 }, { ...ok, from: 5, to: 4 }, { ...ok, to: Infinity },
    { ...ok, fromBar: 1, toBar: null }, { ...ok, fromBar: 0, toBar: 1 }, { ...ok, fromBar: 6, toBar: 5 }, { ...ok, fromBar: 1.5 },
    { ...ok, lane: 'Brass!' }, { ...ok, text: 'x'.repeat(MAX_TEXT + 1) }, { ...ok, text: '   ' }, { ...ok, text: null },
    { ...ok, kind: 'hum', audio: null }, { ...ok, kind: 'speech', audio: { mime: 'audio/mp4', seconds: 0 } },
    { ...ok, kind: 'hum', audio: { mime: 'audio/mp4', seconds: 60.5 } }, { ...ok, kind: 'hum', audio: { mime: 'x'.repeat(101), seconds: 1 } },
    { ...ok, kind: 'react', reaction: null }, { ...ok, reaction: 'meh' },
    { ...ok, kind: 'energy', curve: [[0, 0.5]] }, { ...ok, kind: 'energy', curve: [[0, 1.5], [1, 0]] }, { ...ok, kind: 'energy', curve: [[-1, 0.5], [1, 0]] },
    { ...ok, kind: 'energy', curve: Array.from({ length: MAX_CURVE_POINTS + 1 }, (_, i) => [i, 0]) },
    { ...ok, made: '2026-10-20 14:03' }, { ...ok, made: null },
  ];
  for (const b of bad) assert.equal(isNoteBody(b), false, JSON.stringify(b)?.slice(0, 120));
});

test('opening a sealed note uses this check and no other', () => {
  const seal = readFileSync(new URL('../src/seal.ts', import.meta.url), 'utf8');
  assert.match(seal, /import \{[^}]*\bisNoteBody\b[^}]*\} from '\.\/note\.ts'/);
  assert.doesNotMatch(seal, /function isNoteBody/);
});
```

`test/answer.test.ts`:

```ts
// Building notes: each is tied to its piece, draft and moment; music notes carry
// bars and seconds, sound notes seconds only; the limits are refused in plain words.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { NoteEmpty, NoteTooLong, REACTIONS, energyNote, humNote, reactNote, recordClock, resampleCurve, spanLabel, speechNote, textNote, wholePiece } from '../src/answer.ts';
import { MAX_CURVE_POINTS, REACTION_IDS, isNoteBody } from '../src/note.ts';
import { tempoMap } from '../src/tempo.ts';
import type { Score } from '../src/score.ts';

const score = JSON.parse(readFileSync(new URL('./fixtures/score-v1.json', import.meta.url), 'utf8')) as Score;
const sound = JSON.parse(readFileSync(new URL('./fixtures/score-sound-v1.json', import.meta.url), 'utf8')) as Score;
const ctx = { piece: 'test-piece', draft: 1, now: () => new Date('2026-10-20T14:03:11.000Z') };

test('a typed note is tied to its span and draft, trimmed, and passes the shape check', () => {
  const n = textNote(ctx, { from: 9, to: 14, fromBar: 5, toBar: 8, laneId: 'brass' }, '  more horns  ');
  assert.deepEqual(n, {
    v: 1, kind: 'text', piece: 'test-piece', draft: 1, from: 9, to: 14, fromBar: 5, toBar: 8, lane: 'brass',
    text: 'more horns', reaction: null, curve: null, audio: null, made: '2026-10-20T14:03:11.000Z',
  });
  assert.equal(isNoteBody(n), true);
  assert.throws(() => textNote(ctx, { from: 0, to: 1, fromBar: 1, toBar: 1, laneId: null }, '   '), (e: unknown) => e instanceof NoteEmpty && /Type a note first/.test(e.message));
  assert.throws(() => textNote(ctx, { from: 0, to: 1, fromBar: 1, toBar: 1, laneId: null }, 'x'.repeat(4001)), (e: unknown) => e instanceof NoteTooLong && /4,000 characters/.test(e.message));
});

test('a spoken note and a hum carry their recording; over 60 seconds or empty is refused', () => {
  const s = speechNote(ctx, { from: 2, to: 4, fromBar: 2, toBar: 3, laneId: null }, { mime: 'audio/mp4', seconds: 7.25 });
  assert.deepEqual([s.kind, s.from, s.to, s.text, s.audio], ['speech', 2, 4, null, { mime: 'audio/mp4', seconds: 7.25 }]);
  const h = humNote(ctx, { time: 2, bar: 2, laneId: 'brass' }, { mime: 'audio/mp4', seconds: 60 });
  assert.deepEqual([h.kind, h.from, h.to, h.fromBar, h.toBar, h.lane], ['hum', 2, 2, 2, 2, 'brass']);
  assert.throws(() => humNote(ctx, { time: 2, bar: 2, laneId: null }, { mime: 'audio/mp4', seconds: 60.5 }), NoteTooLong);
  assert.throws(() => humNote(ctx, { time: 2, bar: 2, laneId: null }, { mime: 'audio/mp4', seconds: 0 }), NoteEmpty);
  assert.equal(isNoteBody(s) && isNoteBody(h), true);
});

test('a reaction covers its section; the last section ends at the end of the piece', () => {
  const n = reactNote(ctx, score.sections[1]!, tempoMap(score), score.duration, 'more-epic');
  assert.deepEqual([n.kind, n.from, n.to, n.fromBar, n.toBar, n.reaction, n.lane], ['react', 8, 16, 5, 8, 'more-epic', null]);
  assert.deepEqual(REACTIONS.map(r => r.id), [...REACTION_IDS]);
  assert.deepEqual(REACTIONS.map(r => r.label), ['More epic', 'Calmer', 'Darker', 'Brighter', 'Longer', 'Shorter', 'Love it', 'Not this']);
});

test('a redrawn energy curve covers the whole piece; a long one is resampled to 512 points, never refused', () => {
  const n = energyNote(ctx, [[0, 0.1], [16, 1]], 16, 8);
  assert.deepEqual([n.kind, n.from, n.to, n.fromBar, n.toBar, n.curve], ['energy', 0, 16, 1, 8, [[0, 0.1], [16, 1]]]);
  const ramp = Array.from({ length: 3001 }, (_, i): [number, number] => [(i * 16) / 3000, i / 3000]);
  const long = energyNote(ctx, ramp, 16, 8);
  assert.equal(long.curve!.length, MAX_CURVE_POINTS);
  assert.deepEqual([long.curve![0], long.curve!.at(-1)], [[0, 0], [16, 1]], 'the ends stay where they were');
  assert.ok(long.curve!.every(([t, v], i, all) => (i === 0 || t > all[i - 1]![0]) && Math.abs(v - t / 16) < 1e-9), 'in time order, following the ramp');
  assert.equal(isNoteBody(long), true);
  const noisy = Array.from({ length: 2000 }, (_, i): [number, number] => [(i * 8) / 1999, i % 2]);
  const thin = resampleCurve(noisy);
  assert.equal(thin.length, MAX_CURVE_POINTS);
  assert.ok(thin.every(([, v]) => v >= 0 && v <= 1));
  assert.deepEqual(resampleCurve([[2, 0.5], [0, 0.1], [1, 0.2]]), [[0, 0.1], [1, 0.2], [2, 0.5]], 'a short curve is only put in time order');
  assert.equal(resampleCurve(Array.from({ length: 600 }, (_, i): [number, number] => [i, 0.5]), 100).length, 100);
});

test('notes on a sound effect carry seconds only', () => {
  const sctx = { ...ctx, piece: 'cannon-fire' };
  const text = textNote(sctx, { from: 0.02, to: 0.2, fromBar: null, toBar: null, laneId: 'boom' }, 'a sharper attack');
  assert.deepEqual([text.from, text.to, text.fromBar, text.toBar, text.lane], [0.02, 0.2, null, null, 'boom']);
  const echo = reactNote(sctx, sound.sections[1]!, tempoMap(sound), sound.duration, 'calmer');
  assert.deepEqual([echo.from, echo.to, echo.fromBar, echo.toBar], [0.08, 0.4, null, null]);
  const whole = reactNote(sctx, wholePiece(sound), tempoMap(sound), sound.duration, 'love-it');
  assert.deepEqual([whole.from, whole.to, whole.fromBar, whole.toBar], [0, 0.4, null, null], 'a sound may react to the whole piece');
  assert.deepEqual([wholePiece(score).from_bar, wholePiece(score).to_bar, wholePiece(score).name], [1, 8, 'The whole piece']);
  const energy = energyNote(sctx, [[0, 1], [0.4, 0]], sound.duration, sound.bars ?? null);
  assert.deepEqual([energy.from, energy.to, energy.fromBar, energy.toBar], [0, 0.4, null, null]);
});

test('labels say where a note sits in the words the piece is counted in', () => {
  assert.equal(spanLabel({ from: 8, to: 13.6, fromBar: 5, toBar: 7 }), 'Bars 5–7 · 8 s – 13.6 s');
  assert.equal(spanLabel({ from: 8, to: 9, fromBar: 5, toBar: 5 }), 'Bar 5 · 8 s – 9 s');
  assert.equal(spanLabel({ from: 8, to: 8, fromBar: 5, toBar: 5 }), 'Bar 5 · 8 s');
  assert.equal(spanLabel({ from: 0.02, to: 0.2, fromBar: null, toBar: null }), '20 ms – 200 ms');
  assert.equal(spanLabel({ from: 0.08, to: 0.08, fromBar: null, toBar: null }), '80 ms');
  assert.deepEqual([recordClock(0), recordClock(7.9), recordClock(60)], ['0:00', '0:07', '1:00']);
});
```

- [ ] **Step 2: Run to see them fail** — `node --test workroom/test/note.test.ts workroom/test/answer.test.ts` — FAIL (no `isNoteBody` export, no `answer.ts`).

- [ ] **Step 3: Implement `note.ts`.** Add below `NoteBody` (and `import { ID_RE } from './score.ts';` at the top):

```ts
/** A typed note's longest text, in characters. */
export const MAX_TEXT = 4000;
/** The longest recording, in seconds (the recorder stops itself there). */
export const MAX_AUDIO_SECONDS = 60;
/** The most points an energy shape may have. */
export const MAX_CURVE_POINTS = 512;
/** The largest sealed note the server keeps (music/lib/Store.php MAX_NOTE_BYTES). */
export const MAX_NOTE_BYTES = 2_097_152;
/** How many notes the server keeps (music/lib/Store.php MAX_NOTES). */
export const MAX_NOTES = 2000;

const ISO_UTC = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/;
const finite = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const barOrNull = (v: unknown): boolean => v === null || (Number.isInteger(v) && (v as number) >= 1);

/** The note contract: what an opened body must be before the page shows it or a test trusts it. */
export function isNoteBody(x: unknown): x is NoteBody {
  if (typeof x !== 'object' || x === null || Array.isArray(x)) return false;
  const b = x as Record<string, unknown>;
  const { from, to, fromBar, toBar, text, reaction, curve, audio } = b;
  if (b['v'] !== 1 || !NOTE_KINDS.includes(b['kind'] as NoteKind)) return false;
  if (typeof b['piece'] !== 'string' || !ID_RE.test(b['piece'])) return false;
  if (!Number.isInteger(b['draft']) || (b['draft'] as number) < 1) return false;
  if (!finite(from) || !finite(to) || from < 0 || to < from) return false;
  if (!barOrNull(fromBar) || !barOrNull(toBar) || (fromBar === null) !== (toBar === null)) return false;
  if (fromBar !== null && (toBar as number) < (fromBar as number)) return false;
  if (!(b['lane'] === null || (typeof b['lane'] === 'string' && ID_RE.test(b['lane'])))) return false;
  if (!(text === null || (typeof text === 'string' && text.length <= MAX_TEXT))) return false;
  if (!(reaction === null || REACTION_IDS.includes(reaction as Reaction))) return false;
  const curveOk = curve === null || (Array.isArray(curve) && curve.length >= 2 && curve.length <= MAX_CURVE_POINTS
    && curve.every(p => Array.isArray(p) && p.length === 2 && finite(p[0]) && finite(p[1]) && p[0] >= 0 && p[1] >= 0 && p[1] <= 1));
  if (!curveOk) return false;
  const a = audio as Record<string, unknown> | null;
  const audioOk = a === null || (typeof a === 'object' && !Array.isArray(a) && typeof a['mime'] === 'string' && a['mime'].length <= 100
    && finite(a['seconds']) && a['seconds'] > 0 && a['seconds'] <= MAX_AUDIO_SECONDS);
  if (!audioOk) return false;
  if (typeof b['made'] !== 'string' || !ISO_UTC.test(b['made'])) return false;
  switch (b['kind'] as NoteKind) {
    case 'text': return typeof text === 'string' && text.trim() !== '';
    case 'speech':
    case 'hum': return a !== null;
    case 'react': return reaction !== null;
    case 'energy': return curve !== null;
  }
}
```

  In `seal.ts`: delete the private `isNoteBody` (lines 75–90) and change the imports at the top to `import type { NoteBody } from './note.ts';` and `import { isNoteBody } from './note.ts';` (drop `NOTE_KINDS, REACTION_IDS`, now unused there).

- [ ] **Step 4: Implement `src/answer.ts`** (and add `"src/answer.ts"` to `tsconfig.json`'s `files`):

```ts
// Building the notes the owner sends: what they mean, where in the piece, and
// which draft they were made on. Music notes name bars and seconds; sound notes
// seconds only. The limits are refused here, in plain words. DOM-free.
import { formatSeconds } from './axis.ts';
import type { Span } from './hit.ts';
import { MAX_AUDIO_SECONDS, MAX_CURVE_POINTS, MAX_TEXT, REACTION_IDS } from './note.ts';
import type { NoteBody, NoteKind, Reaction } from './note.ts';
import type { Score, Section } from './score.ts';
import { sectionTimes } from './tempo.ts';
import type { TempoMap } from './tempo.ts';

export const REACTION_LABELS: Readonly<Record<Reaction, string>> = {
  'more-epic': 'More epic', calmer: 'Calmer', darker: 'Darker', brighter: 'Brighter',
  longer: 'Longer', shorter: 'Shorter', 'love-it': 'Love it', 'not-this': 'Not this',
};
export const REACTIONS: readonly { id: Reaction; label: string }[] = REACTION_IDS.map(id => ({ id, label: REACTION_LABELS[id] }));
export const KIND_LABELS: Readonly<Record<NoteKind, string>> = { text: 'Typed note', speech: 'Spoken note', hum: 'Humming', react: 'Reaction', energy: 'Energy shape' };

export class NoteEmpty extends Error {}
export class NoteTooLong extends Error {}
export interface Context { piece: string; draft: number; now: () => Date }
export interface Audio { mime: string; seconds: number }
export interface NoteMark { id: string; n: number; from: number; to: number; lane: string | null; kind: NoteKind; draft: number }

function base(c: Context, kind: NoteKind, from: number, to: number, fromBar: number | null, toBar: number | null, lane: string | null): NoteBody {
  return { v: 1, kind, piece: c.piece, draft: c.draft, from, to, fromBar, toBar, lane, text: null, reaction: null, curve: null, audio: null, made: c.now().toISOString() };
}

function checkAudio(a: Audio): Audio {
  if (!(a.seconds > 0)) throw new NoteEmpty('The recording is empty. Record it again.');
  if (a.seconds > MAX_AUDIO_SECONDS) throw new NoteTooLong('A recording is at most one minute long.');
  return { mime: a.mime, seconds: a.seconds };
}

export function textNote(c: Context, span: Span, text: string): NoteBody {
  const t = text.trim();
  if (t === '') throw new NoteEmpty('Type a note first.');
  if (t.length > MAX_TEXT) throw new NoteTooLong(`A note holds up to ${MAX_TEXT.toLocaleString('en-US')} characters. Shorten this one by ${(t.length - MAX_TEXT).toLocaleString('en-US')}.`);
  return { ...base(c, 'text', span.from, span.to, span.fromBar, span.toBar, span.laneId), text: t };
}

export function speechNote(c: Context, span: Span, audio: Audio): NoteBody {
  return { ...base(c, 'speech', span.from, span.to, span.fromBar, span.toBar, span.laneId), audio: checkAudio(audio) };
}

export function humNote(c: Context, at: { time: number; bar: number | null; laneId: string | null }, audio: Audio): NoteBody {
  return { ...base(c, 'hum', at.time, at.time, at.bar, at.bar, at.laneId), audio: checkAudio(audio) };
}

export function reactNote(c: Context, section: Section, tempo: TempoMap, duration: number, reaction: Reaction): NoteBody {
  const { from, to } = sectionTimes(section, tempo, duration);
  const bars = tempo.metric ? [section.from_bar ?? 1, section.to_bar ?? 1] as const : [null, null] as const;
  return { ...base(c, 'react', from, to, bars[0], bars[1], null), reaction };
}

/** A curve of at most `max` points: one with more is resampled at evenly spaced times between its first and last, interpolating between its points, so a long drawing or a finely sampled energy line still fits a note. */
export function resampleCurve(curve: readonly [number, number][], max: number = MAX_CURVE_POINTS): [number, number][] {
  const pts = curve.map(([t, v]): [number, number] => [t, v]).sort((a, b) => a[0] - b[0]);
  if (pts.length <= max) return pts;
  const t0 = pts[0]![0];
  const t1 = pts[pts.length - 1]![0];
  const out: [number, number][] = [];
  let j = 0;
  for (let i = 0; i < max; i++) {
    const t = i === max - 1 ? t1 : t0 + ((t1 - t0) * i) / (max - 1);
    while (j < pts.length - 2 && pts[j + 1]![0] < t) j++;
    const [ta, va] = pts[j]!;
    const [tb, vb] = pts[j + 1]!;
    const v = tb > ta ? va + ((vb - va) * (Math.min(Math.max(t, ta), tb) - ta)) / (tb - ta) : vb;
    out.push([t, Math.min(1, Math.max(0, v))]);
  }
  return out;
}

export function energyNote(c: Context, curve: readonly [number, number][], duration: number, bars: number | null): NoteBody {
  return { ...base(c, 'energy', 0, duration, bars === null ? null : 1, bars, null), curve: resampleCurve(curve) };
}

/** A section spanning the whole piece, for a reaction when no section is under the playhead (a sound may have none). */
export function wholePiece(score: Score): Section {
  const color = score.sections[0]?.color ?? score.lanes[0]!.color;
  return score.kind === 'music'
    ? { id: 'whole-piece', name: 'The whole piece', color, from_bar: 1, to_bar: score.bars ?? 1 }
    : { id: 'whole-piece', name: 'The whole piece', color, from: 0, to: score.duration };
}

/** "Bars 5–7 · 8 s – 13.6 s", "Bar 5 · 8 s", "20 ms – 200 ms", "80 ms". */
export function spanLabel(s: { from: number; to: number; fromBar: number | null; toBar: number | null }): string {
  const time = s.from === s.to ? formatSeconds(s.from) : `${formatSeconds(s.from)} – ${formatSeconds(s.to)}`;
  if (s.fromBar === null || s.toBar === null) return time;
  const bars = s.fromBar === s.toBar ? `Bar ${s.fromBar}` : `Bars ${s.fromBar}–${s.toBar}`;
  return `${bars} · ${time}`;
}

/** Minutes and whole seconds: "0:07", "1:00". */
export function recordClock(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
```

- [ ] **Step 5: Run the tests** — `node --test workroom/test/note.test.ts workroom/test/answer.test.ts workroom/test/seal.test.ts workroom/test/unlock.test.ts workroom/test/vault.test.ts workroom/test/no-storage.test.ts` — PASS (the committed sealed fixtures `note-text.sealed` and `note-hum.sealed` still open: their bodies meet the contract). Rebuild and `--check` — exit 0.

- [ ] **Step 6: Commit** — `git add websites/www.cs/games/workroom`; "Music workroom: the note contract, its limits and the note builders" with the trailers.

### Task 4: Energy strokes and curves

**Files:**
- Create: `games/workroom/src/energy.ts`
- Modify: `games/workroom/tsconfig.json` (`src/energy.ts` joins `files`)
- Test: `games/workroom/test/energy.test.ts`

**Interfaces:**
- Consumes: `View`, `xToTime`, `timeToX` (`zoom.ts`).
- Produces:

```ts
export type Curve = [number, number][];          // [seconds, energy 0..1]
export const ENERGY_EDIT_H = 160;                 // the drawing well's height in px
export const STROKE_STEP_PX = 4;                  // stroke points closer than this in x are dropped
export function strokeFromPixels(points: readonly [number, number][], view: View, height?: number): Curve;
export function redraw(curve: readonly [number, number][], stroke: Curve, duration: number): Curve;
export function curveToPixels(curve: readonly [number, number][], view: View, height?: number): [number, number][];
```

- [ ] **Step 1: Write the failing test** (`test/energy.test.ts`):

```ts
// Drawing the energy: a stroke in pixels becomes seconds and values; it replaces
// the curve over its own span, clamped and in time order; the curve always runs
// from 0 to the end of the piece.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ENERGY_EDIT_H, curveToPixels, redraw, strokeFromPixels } from '../src/energy.ts';
import { fitView } from '../src/zoom.ts';

test('pixels in the drawing become a curve: top is 1, bottom is 0', () => {
  assert.equal(ENERGY_EDIT_H, 160);
  assert.deepEqual(strokeFromPixels([[0, 160], [400, 80], [800, 0]], fitView(16, 800)), [[0, 0], [8, 0.5], [16, 1]]);
  assert.deepEqual(strokeFromPixels([[0, -20], [400, 400]], fitView(16, 800)), [[0, 1], [8, 0]], 'outside the well is clamped');
});

test('points closer than 4 px are dropped, but the last point of a stroke is kept', () => {
  const s = strokeFromPixels([[0, 80], [1, 80], [2, 80], [3, 80], [5, 80], [6, 40]], fitView(16, 800));
  assert.deepEqual(s.map(p => Math.round(p[0] * 50)), [0, 5, 6]);
});

test('a stroke replaces the curve over its own span, clamped and in time order', () => {
  const curve: [number, number][] = [[0, 0.2], [8, 0.5], [16, 0.9]];
  assert.deepEqual(redraw(curve, [[10, 0.1], [4, 0.8], [6, 1.2]], 16), [[0, 0.2], [4, 0.8], [6, 1], [10, 0.1], [16, 0.9]]);
});

test('a stroke over the ends keeps the curve from 0 to the duration', () => {
  assert.deepEqual(redraw([[0, 0.2], [16, 0.9]], [[-3, 0.5], [20, 0.4]], 16), [[0, 0.5], [16, 0.4]]);
  assert.deepEqual(redraw([[0, 0.2], [16, 0.9]], [[2, 0.5], [3, 0.6]], 16), [[0, 0.2], [2, 0.5], [3, 0.6], [16, 0.9]]);
});

test('drawn back over itself, the later point at a time wins; an empty stroke changes nothing', () => {
  assert.deepEqual(redraw([[0, 0], [16, 0]], [[4, 0.2], [8, 0.4], [4, 0.9]], 16), [[0, 0], [4, 0.9], [8, 0.4], [16, 0]]);
  assert.deepEqual(redraw([[0, 0.3], [16, 0.3]], [], 16), [[0, 0.3], [16, 0.3]]);
});

test('a curve back to pixels', () => {
  assert.deepEqual(curveToPixels([[0, 0], [8, 0.5], [16, 1]], fitView(16, 800)), [[0, 160], [400, 80], [800, 0]]);
});
```

- [ ] **Step 2: Run to see it fail** — `node --test workroom/test/energy.test.ts` — FAIL (no module).

- [ ] **Step 3: Implement `src/energy.ts`** (and add it to `tsconfig.json`'s `files`):

```ts
// The energy the owner draws: a finger's path in pixels becomes [seconds, value]
// points, and each stroke replaces the curve under its own time span. The curve
// always runs from 0 to the end of the piece, in time order, values in [0, 1]. DOM-free.
import { timeToX, xToTime } from './zoom.ts';
import type { View } from './zoom.ts';

export type Curve = [number, number][];
export const ENERGY_EDIT_H = 160;
export const STROKE_STEP_PX = 4;

const clamp01 = (v: number): number => Math.min(1, Math.max(0, v));

export function strokeFromPixels(points: readonly [number, number][], view: View, height: number = ENERGY_EDIT_H): Curve {
  const out: Curve = [];
  let lastX = -Infinity;
  points.forEach(([x, y], i) => {
    if (Math.abs(x - lastX) < STROKE_STEP_PX && i !== points.length - 1) return;
    lastX = x;
    out.push([xToTime(view, x), clamp01(1 - y / height)]);
  });
  return out;
}

export function redraw(curve: readonly [number, number][], stroke: Curve, duration: number): Curve {
  if (stroke.length === 0) return curve.map(([t, v]): [number, number] => [t, v]);
  const byTime = new Map<number, number>();
  for (const [t, v] of stroke) byTime.set(Math.min(duration, Math.max(0, t)), clamp01(v)); // a later point at the same time wins
  const drawn = [...byTime].sort((a, b) => a[0] - b[0]);
  const lo = drawn[0]![0];
  const hi = drawn[drawn.length - 1]![0];
  const out: Curve = [...curve.filter(([t]) => t < lo || t > hi).map(([t, v]): [number, number] => [t, v]), ...drawn].sort((a, b) => a[0] - b[0]);
  if (out[0]![0] > 0) out.unshift([0, out[0]![1]]);
  const last = out[out.length - 1]!;
  if (last[0] < duration) out.push([duration, last[1]]);
  return out;
}

export function curveToPixels(curve: readonly [number, number][], view: View, height: number = ENERGY_EDIT_H): [number, number][] {
  return curve.map(([t, v]): [number, number] => [timeToX(view, t), height * (1 - v)]);
}
```

- [ ] **Step 4: Run the test** — `node --test workroom/test/energy.test.ts` — PASS; rebuild and `--check` — exit 0.

- [ ] **Step 5: Commit** — "Music workroom: drawing the energy curve" with the trailers.

### Task 5: The recorder: the type, the 60-second cap and the iPhone

**Files:**
- Create: `games/workroom/src/recorder.ts`
- Modify: `games/workroom/tsconfig.json` (`src/recorder.ts` joins `files`)
- Test: `games/workroom/test/recorder.test.ts`

**Interfaces:**
- Consumes: `MAX_AUDIO_SECONDS` (`note.ts`).
- Produces (DOM-free: the browser's `MediaRecorder` and `getUserMedia` arrive through `MediaPorts`, which `browser.ts` builds in Task 16):

```ts
export const MIME_PREFERENCE: readonly string[]; // 'audio/webm;codecs=opus', 'audio/mp4', 'audio/ogg;codecs=opus'
export function pickMime(isSupported: (mime: string) => boolean): string | null;
export interface Timers { setTimeout(f: () => void, ms: number): number; clearTimeout(id: number): void }
export function stopAfterLimit(timers: Timers, stop: () => void): () => void; // fires after MAX_AUDIO_SECONDS; returns cancel
export interface BlobLike { readonly size: number; arrayBuffer(): Promise<ArrayBuffer> }
export interface StreamLike { getTracks(): { stop(): void }[] }
export interface RecorderLike { readonly state: string; start(timesliceMs?: number): void; stop(): void; ondataavailable: ((e: { data: BlobLike }) => void) | null; onstop: (() => void) | null }
export interface MediaPorts {
  getUserMedia(): Promise<StreamLike>;
  isTypeSupported(mime: string): boolean;
  makeRecorder(stream: StreamLike, mime: string): RecorderLike;
  timers: Timers;
  now(): number;                          // milliseconds
  audioSession: { type: string } | null;  // navigator.audioSession where the browser has one
}
export interface Recording { mime: string; seconds: number; bytes: Uint8Array<ArrayBuffer> }
export class RecorderProblem extends Error {}
export const RECORDER_MESSAGES: { unsupported: string; denied: string; failed: string };
export interface Recorder {
  /** Call straight from the tap: the microphone is asked for before anything awaits. Rejects with RecorderProblem; whatever fails after the microphone was granted (the recorder will not be made or started) stops its tracks and hands the audio session back. */
  start(): Promise<void>;
  /** Stops and gives the recording. After the cap it stopped by itself and gives the same recording. */
  stop(): Promise<Recording>;
  /** Stops and drops the recording. */
  cancel(): void;
  readonly recording: boolean;
  /** Seconds recorded so far, at most MAX_AUDIO_SECONDS. */
  elapsed(): number;
}
/** onLimit gets the recording when the cap stops it. */
export function createRecorder(ports: MediaPorts, onLimit: (r: Promise<Recording>) => void): Recorder;
```

- [ ] **Step 1: Write the failing test** (`test/recorder.test.ts`):

```ts
// Recording a spoken note or a hum: the first type the browser records wins
// (Safari records mp4), the microphone is asked for first thing in the tap, the
// audio session switches to play-and-record while recording, and a minute is the cap.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MIME_PREFERENCE, RECORDER_MESSAGES, RecorderProblem, createRecorder, pickMime, stopAfterLimit } from '../src/recorder.ts';
import type { BlobLike, MediaPorts, RecorderLike, Recording, StreamLike } from '../src/recorder.ts';

test('the first supported recording type wins', () => {
  assert.deepEqual([...MIME_PREFERENCE], ['audio/webm;codecs=opus', 'audio/mp4', 'audio/ogg;codecs=opus']);
  assert.equal(pickMime(() => true), 'audio/webm;codecs=opus');
  assert.equal(pickMime(m => m === 'audio/mp4'), 'audio/mp4', 'Safari');
  assert.equal(pickMime(() => false), null);
});

interface FakeRec extends RecorderLike { state: string; emit(bytes: number[]): void }
interface Fake { ports: MediaPorts; log: string[]; timers: { f: () => void; ms: number; id: number }[]; clock: { ms: number }; recorder: () => FakeRec; session: { type: string } }

function fake(opts: { supported?: (m: string) => boolean; deny?: string; breakAt?: 'make' | 'start' } = {}): Fake {
  const log: string[] = [];
  const timers: { f: () => void; ms: number; id: number }[] = [];
  const clock = { ms: 1000 };
  const session = { type: 'playback' };
  let made: FakeRec | null = null;
  const blob = (bytes: number[]): BlobLike => ({ size: bytes.length, arrayBuffer: async () => new Uint8Array(bytes).buffer });
  const stream: StreamLike = { getTracks: () => [{ stop: () => log.push('track stopped') }] };
  const ports: MediaPorts = {
    getUserMedia: () => {
      log.push(`getUserMedia (session ${session.type})`);
      return opts.deny ? Promise.reject(Object.assign(new Error('no'), { name: opts.deny })) : Promise.resolve(stream);
    },
    isTypeSupported: opts.supported ?? (m => m === 'audio/mp4'),
    makeRecorder: (_s, mime) => {
      log.push(`recorder ${mime}`);
      if (opts.breakAt === 'make') throw new Error('MediaRecorder refused');
      const r: FakeRec = {
        state: 'inactive', ondataavailable: null, onstop: null,
        start(slice?: number) { if (opts.breakAt === 'start') throw new Error('start refused'); r.state = 'recording'; log.push(`start ${slice}`); },
        stop() { r.state = 'inactive'; log.push('stop'); r.onstop?.(); },
        emit(bytes: number[]) { r.ondataavailable?.({ data: blob(bytes) }); },
      };
      made = r;
      return r;
    },
    timers: { setTimeout: (f, ms) => { timers.push({ f, ms, id: timers.length + 1 }); return timers.length; }, clearTimeout: id => { const i = timers.findIndex(t => t.id === id); if (i >= 0) timers.splice(i, 1); } },
    now: () => clock.ms,
    audioSession: session,
  };
  return { ports, log, timers, clock, recorder: () => made!, session };
}

test('stopAfterLimit fires once at 60 s unless cancelled', () => {
  const f = fake();
  let stopped = 0;
  stopAfterLimit(f.ports.timers, () => stopped++);
  assert.equal(f.timers[0]?.ms, 60_000);
  f.timers[0]!.f();
  assert.equal(stopped, 1);
  const cancel = stopAfterLimit(f.ports.timers, () => stopped++);
  cancel();
  assert.equal(f.timers.length, 1);
});

test('start asks for the microphone before anything else, with the session switched to play-and-record', async () => {
  const f = fake();
  const rec = createRecorder(f.ports, () => {});
  const started = rec.start();
  assert.deepEqual(f.log, ['getUserMedia (session play-and-record)'], 'asked synchronously, inside the tap');
  await started;
  assert.equal(rec.recording, true);
  f.recorder().emit([1, 2]);
  f.clock.ms += 7250;
  f.recorder().emit([3]);
  assert.equal(rec.elapsed(), 7.25);
  const r: Recording = await rec.stop();
  assert.deepEqual([r.mime, r.seconds, [...r.bytes]], ['audio/mp4', 7.25, [1, 2, 3]]);
  assert.equal(rec.recording, false);
  assert.equal(f.session.type, 'auto', 'the session is handed back after recording');
  assert.ok(f.log.includes('track stopped'), 'the microphone is released');
});

test('the cap stops the recording by itself and hands it on', async () => {
  const f = fake();
  let limited: Promise<Recording> | null = null;
  const rec = createRecorder(f.ports, r => { limited = r; });
  await rec.start();
  f.recorder().emit([9]);
  f.clock.ms += 61_000;
  f.timers[0]!.f();
  const r = await limited!;
  assert.equal(r.seconds, 60, 'never over the cap');
  assert.deepEqual([...r.bytes], [9]);
  assert.equal(await rec.stop(), r, 'a late Stop gets the same recording');
});

test('a recorder that will not start after the microphone was granted releases the microphone and the audio session', async () => {
  for (const breakAt of ['make', 'start'] as const) {
    const f = fake({ breakAt });
    const rec = createRecorder(f.ports, () => {});
    await assert.rejects(rec.start(), (e: unknown) => e instanceof RecorderProblem && e.message === RECORDER_MESSAGES.failed, breakAt);
    assert.ok(f.log.includes('track stopped'), `${breakAt}: the microphone is released`);
    assert.equal(f.session.type, 'auto', `${breakAt}: the audio session is handed back`);
    assert.equal(rec.recording, false);
    assert.equal(f.timers.length, 0, `${breakAt}: no cap timer is left running`);
  }
});

test('no recordable type, a refused microphone, and cancel', async () => {
  const none = fake({ supported: () => false });
  await assert.rejects(createRecorder(none.ports, () => {}).start(), (e: unknown) => e instanceof RecorderProblem && e.message === RECORDER_MESSAGES.unsupported);
  assert.deepEqual(none.log, [], 'the microphone is not asked for');
  const denied = fake({ deny: 'NotAllowedError' });
  await assert.rejects(createRecorder(denied.ports, () => {}).start(), (e: unknown) => e instanceof RecorderProblem && e.message === RECORDER_MESSAGES.denied);
  assert.equal(denied.session.type, 'auto');
  const f = fake();
  const rec = createRecorder(f.ports, () => {});
  await rec.start();
  rec.cancel();
  assert.equal(rec.recording, false);
  assert.equal(f.timers.length, 0, 'the cap timer is cleared');
  assert.ok(f.log.includes('track stopped'));
});
```

- [ ] **Step 2: Run to see it fail** — `node --test workroom/test/recorder.test.ts` — FAIL (no module).

- [ ] **Step 3: Implement `src/recorder.ts`** (and add it to `tsconfig.json`'s `files`):

```ts
// Recording a spoken note or a hum through ports the page hands in (the
// browser's MediaRecorder and getUserMedia; fakes in the tests). Safari needs
// three things: an mp4 recording, the microphone asked for inside the tap
// itself, and an audio session that records ('play-and-record' while recording;
// the guide's 'playback' session is for playing only). A minute is the cap. DOM-free.
import { MAX_AUDIO_SECONDS } from './note.ts';

export const MIME_PREFERENCE: readonly string[] = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/ogg;codecs=opus'];

export function pickMime(isSupported: (mime: string) => boolean): string | null {
  return MIME_PREFERENCE.find(m => isSupported(m)) ?? null;
}

export interface Timers { setTimeout(f: () => void, ms: number): number; clearTimeout(id: number): void }

export function stopAfterLimit(timers: Timers, stop: () => void): () => void {
  const id = timers.setTimeout(stop, MAX_AUDIO_SECONDS * 1000);
  return () => timers.clearTimeout(id);
}

export interface BlobLike { readonly size: number; arrayBuffer(): Promise<ArrayBuffer> }
export interface StreamLike { getTracks(): { stop(): void }[] }
export interface RecorderLike { readonly state: string; start(timesliceMs?: number): void; stop(): void; ondataavailable: ((e: { data: BlobLike }) => void) | null; onstop: (() => void) | null }
export interface MediaPorts {
  getUserMedia(): Promise<StreamLike>;
  isTypeSupported(mime: string): boolean;
  makeRecorder(stream: StreamLike, mime: string): RecorderLike;
  timers: Timers;
  now(): number;
  audioSession: { type: string } | null;
}
export interface Recording { mime: string; seconds: number; bytes: Uint8Array<ArrayBuffer> }
export class RecorderProblem extends Error {}
export const RECORDER_MESSAGES = {
  unsupported: 'This browser cannot record audio here.',
  denied: 'The microphone is off for this page. Allow it in the browser’s settings, then try again.',
  failed: 'The recording did not start. Try again.',
} as const;
export interface Recorder { start(): Promise<void>; stop(): Promise<Recording>; cancel(): void; readonly recording: boolean; elapsed(): number }

const DENIED = new Set(['NotAllowedError', 'SecurityError', 'PermissionDeniedError']);

export function createRecorder(ports: MediaPorts, onLimit: (r: Promise<Recording>) => void): Recorder {
  let rec: RecorderLike | null = null;
  let stream: StreamLike | null = null;
  let chunks: BlobLike[] = [];
  let mime = '';
  let started = 0;
  let cancelCap: (() => void) | null = null;
  let done: Promise<Recording> | null = null;
  const session = (type: string): void => { if (ports.audioSession) ports.audioSession.type = type; };
  const seconds = (): number => Math.min(MAX_AUDIO_SECONDS, Math.max(0, (ports.now() - started) / 1000));
  const release = (): void => {
    cancelCap?.();
    cancelCap = null;
    for (const t of stream?.getTracks() ?? []) t.stop();
    stream = null;
    session('auto');
  };
  const finish = (): Promise<Recording> => {
    if (done) return done;
    const r = rec;
    if (!r) return Promise.reject(new RecorderProblem('Nothing is recording.'));
    const length = Math.max(0.01, Math.round(seconds() * 100) / 100);
    done = new Promise<Recording>((resolve, reject) => {
      const onStop = (): void => {
        release();
        Promise.all(chunks.map(c => c.arrayBuffer())).then(parts => {
          const bytes = new Uint8Array(parts.reduce((n, p) => n + p.byteLength, 0));
          let at = 0;
          for (const p of parts) { bytes.set(new Uint8Array(p), at); at += p.byteLength; }
          resolve({ mime, seconds: length, bytes });
        }, () => reject(new RecorderProblem(RECORDER_MESSAGES.failed)));
      };
      r.onstop = onStop;
      if (r.state !== 'inactive') r.stop(); else onStop();
    });
    return done;
  };
  return {
    start() {
      if (rec && !done) return Promise.reject(new RecorderProblem('Already recording.'));
      const picked = pickMime(m => ports.isTypeSupported(m));
      if (picked === null) return Promise.reject(new RecorderProblem(RECORDER_MESSAGES.unsupported));
      session('play-and-record');
      const asked = ports.getUserMedia(); // first, inside the tap: Safari grants the microphone only there
      return asked.then(s => {
        stream = s;
        try {
          chunks = [];
          done = null;
          mime = picked;
          const r = ports.makeRecorder(s, picked);
          r.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
          r.start(1000);
          rec = r;
          started = ports.now();
          cancelCap = stopAfterLimit(ports.timers, () => onLimit(finish()));
        } catch {
          // The microphone was granted but the recorder would not start: nothing may keep listening.
          rec = null;
          release();
          throw new RecorderProblem(RECORDER_MESSAGES.failed);
        }
      }, (e: unknown) => {
        release();
        const name = typeof e === 'object' && e !== null ? (e as { name?: unknown }).name : undefined;
        throw new RecorderProblem(typeof name === 'string' && DENIED.has(name) ? RECORDER_MESSAGES.denied : RECORDER_MESSAGES.failed);
      });
    },
    stop: finish,
    cancel() {
      const r = rec;
      rec = null;
      chunks = [];
      if (r && r.state !== 'inactive') { r.onstop = null; r.stop(); }
      release();
    },
    get recording() { return rec !== null && done === null; },
    elapsed: () => (rec && !done ? seconds() : 0),
  };
}
```

- [ ] **Step 4: Run the test** — `node --test workroom/test/recorder.test.ts` — PASS; rebuild and `--check` — exit 0.

- [ ] **Step 5: Commit** — "Music workroom: the recorder (60 s, the first type the browser records, the iPhone's microphone)" with the trailers.

### Task 6: The page's API client

**Files:**
- Create: `games/workroom/src/api.ts`
- Modify: `games/workroom/src/tsconfig.crypto.json` (`api.ts` joins `files`)
- Test: `games/workroom/test/api.test.ts`

**Interfaces:**
- Consumes: `Fetch` (`load.ts`: `(url, init?: { method?, headers?, body?: Uint8Array<ArrayBuffer> }) => Promise<{ ok, status, redirected, headers.get, json, arrayBuffer, text }>`), `LockedKeyring` (`unlock.ts`).
- Produces:

```ts
export class SignedOut extends Error {}
export class NoKeyring extends Error {}   // keyring.php answered 404 no_keyring: make music-setup has not uploaded one
export type RefusedReason = 'too_large' | 'full' | 'no_key' | 'bad_header' | 'unknown_key';
export const REFUSED_REASONS: readonly RefusedReason[];
export interface ServerNote { id: string; size: number; arrived_at: number; picked_up_at: number | null }
export type UploadResult = { kind: 'sent'; id: string } | { kind: 'refused'; reason: RefusedReason };
export interface PageApi {
  upload(bundle: Uint8Array<ArrayBuffer>): Promise<UploadResult>; // POST notes.php
  list(): Promise<ServerNote[]>;                                   // GET notes.php, oldest first
  bytes(id: string): Promise<Uint8Array<ArrayBuffer>>;            // GET note.php?id=, the one octet-stream route
  remove(id: string): Promise<number>;                             // POST delete.php id=
  removeAll(): Promise<number>;                                    // POST delete.php all=1
  keyring(): Promise<LockedKeyring>;                               // GET keyring.php
}
export function createApi(fetch: Fetch, csrf: string): PageApi;
```

A failed network call rejects with whatever `fetch` threw (a `TypeError` in browsers); the outbox reads that as "offline".

- [ ] **Step 1: Write the failing test** (`test/api.test.ts`):

```ts
// The page's API client: POSTs never overlap, each carries the token the last
// answer returned, a spent token is refreshed once, a lost session is SignedOut
// (read from the status, never the Content-Type), and limits are refusals.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { NoKeyring, SignedOut, createApi } from '../src/api.ts';
import type { Fetch } from '../src/load.ts';

type Init = Parameters<Fetch>[1];
const reply = (status: number, body: unknown, redirected = false, type = 'application/json') => ({
  ok: status >= 200 && status < 300, status, redirected, headers: { get: (n: string) => (n.toLowerCase() === 'content-type' ? type : null) },
  json: async () => body, text: async () => JSON.stringify(body), arrayBuffer: async () => new Uint8Array([7, 8, 9]).buffer,
});
const A = 'a'.repeat(32);
const B = 'b'.repeat(32);

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
  await Promise.all([api.remove(A), api.remove(B), api.removeAll()]);
  assert.deepEqual(tokens, ['t0', 't1', 't2']);
  assert.equal(most, 1);
});

test('deletes are form posts: one id, or all', async () => {
  const sent: string[] = [];
  const fetch: Fetch = async (url, init?: Init) => {
    sent.push(`${url} ${init?.headers?.['Content-Type']} ${new TextDecoder().decode(init?.body)}`);
    return reply(200, { deleted: 2, csrf: 'n' });
  };
  const api = createApi(fetch, 't');
  assert.equal(await api.remove(A), 2);
  assert.equal(await api.removeAll(), 2);
  assert.deepEqual(sent, [`delete.php application/x-www-form-urlencoded id=${A}`, 'delete.php application/x-www-form-urlencoded all=1']);
  await assert.rejects(api.remove('../etc'), /Not a note id/);
});

test('a spent token is refreshed once from csrf.php and the POST retried', async () => {
  const seen: string[] = [];
  const fetch: Fetch = async (url, init?: Init) => {
    if (url === 'csrf.php') return reply(200, { csrf: 'fresh' });
    seen.push(init?.headers?.['X-CSRF'] ?? '');
    return seen.length === 1 ? reply(403, { error: 'csrf' }) : reply(200, { deleted: 1, csrf: 'next' });
  };
  assert.equal(await createApi(fetch, 'stale').remove(A), 1);
  assert.deepEqual(seen, ['stale', 'fresh']);
});

test('a second refusal is not retried again', async () => {
  let posts = 0;
  const fetch: Fetch = async url => (url === 'csrf.php' ? reply(200, { csrf: 'fresh' }) : (posts++, reply(403, { error: 'csrf' })));
  await assert.rejects(createApi(fetch, 'x').remove(A), /403/);
  assert.equal(posts, 2);
});

test('a sign-in redirect, a 401 or a 403 other than the CSRF refusal is SignedOut, whatever the Content-Type', async () => {
  await assert.rejects(createApi(async () => reply(200, '<html>', true, 'text/html'), 'x').list(), SignedOut);
  await assert.rejects(createApi(async () => reply(401, { error: 'unauthorized' }, false, 'text/html'), 'x').list(), SignedOut);
  await assert.rejects(createApi(async () => reply(403, { error: 'cross_site' }), 'x').list(), SignedOut);
  await assert.rejects(createApi(async () => reply(200, '<html>', true, 'text/html'), 'x').upload(new Uint8Array(4)), SignedOut);
  await assert.rejects(createApi(async () => reply(500, { error: 'boom' }), 'x').list(), (e: unknown) => e instanceof Error && !(e instanceof SignedOut) && /500/.test(e.message));
});

test('the list keeps well-formed entries and reads JSON whatever its Content-Type', async () => {
  const fetch: Fetch = async () => reply(200, { notes: [{ id: A, size: 5, arrived_at: 1, picked_up_at: null }, { id: 'zz', size: 1, arrived_at: 1, picked_up_at: null }, null] }, false, 'text/plain');
  assert.deepEqual(await createApi(fetch, 'x').list(), [{ id: A, size: 5, arrived_at: 1, picked_up_at: null }]);
});

test('bytes() returns a note\'s octet-stream; a redirect is SignedOut; any other type is an error', async () => {
  const urls: string[] = [];
  const ok: Fetch = async url => { urls.push(url); return reply(200, null, false, 'application/octet-stream'); };
  assert.deepEqual([...(await createApi(ok, 'x').bytes(A))], [7, 8, 9]);
  assert.deepEqual(urls, [`note.php?id=${A}`]);
  await assert.rejects(createApi(async () => reply(200, '<html>', true, 'text/html'), 'x').bytes(A), SignedOut);
  await assert.rejects(createApi(async () => reply(200, '<html>', false, 'text/html'), 'x').bytes(A), (e: unknown) => e instanceof Error && !(e instanceof SignedOut) && /octet-stream/.test(e.message));
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

test('an upload is a raw octet-stream; limits come back as refusals, not errors', async () => {
  const types: string[] = [];
  let status = 201;
  let answer: unknown = { id: 'c'.repeat(32), csrf: 'n' };
  const fetch: Fetch = async (url, init?: Init) => { types.push(`${url} ${init?.headers?.['Content-Type']}`); return reply(status, answer); };
  const api = createApi(fetch, 'x');
  assert.deepEqual(await api.upload(new Uint8Array(4)), { kind: 'sent', id: 'c'.repeat(32) });
  assert.deepEqual(types, ['notes.php application/octet-stream']);
  for (const [s, reason] of [[413, 'too_large'], [409, 'full'], [422, 'bad_header'], [422, 'unknown_key'], [503, 'no_key']] as const) {
    status = s;
    answer = { error: reason, csrf: 'n' };
    assert.deepEqual(await api.upload(new Uint8Array(4)), { kind: 'refused', reason });
  }
  status = 500;
  answer = { error: 'storage' };
  await assert.rejects(api.upload(new Uint8Array(4)), /500/);
});
```

- [ ] **Step 2: Run to see it fail** — `node --test workroom/test/api.test.ts` — FAIL (no module).

- [ ] **Step 3: Implement `src/api.ts`** (and add `"api.ts"` to `src/tsconfig.crypto.json`'s `files`):

```ts
// The page's own API client, over the signed-in session. One POST at a time,
// each carrying the CSRF token the last answer gave: the server spends a token
// on every check, so a refused one (403 {"error":"csrf"}) is refreshed from
// csrf.php once and the POST retried once. A lost session is SignedOut, read
// from the status (a redirect to the sign-in, a 401, or a 403 other than the
// CSRF refusal), never from the Content-Type. Every other failure names the status.
import type { Fetch } from './load.ts';
import type { LockedKeyring } from './unlock.ts';

export class SignedOut extends Error {}
export class NoKeyring extends Error {}
export type RefusedReason = 'too_large' | 'full' | 'no_key' | 'bad_header' | 'unknown_key';
export const REFUSED_REASONS: readonly RefusedReason[] = ['too_large', 'full', 'no_key', 'bad_header', 'unknown_key'];
export interface ServerNote { id: string; size: number; arrived_at: number; picked_up_at: number | null }
export type UploadResult = { kind: 'sent'; id: string } | { kind: 'refused'; reason: RefusedReason };
export interface PageApi {
  upload(bundle: Uint8Array<ArrayBuffer>): Promise<UploadResult>;
  list(): Promise<ServerNote[]>;
  bytes(id: string): Promise<Uint8Array<ArrayBuffer>>;
  remove(id: string): Promise<number>;
  removeAll(): Promise<number>;
  keyring(): Promise<LockedKeyring>;
}

type Reply = Awaited<ReturnType<Fetch>>;
type Data = Record<string, unknown>;
const NOTE_ID = /^[0-9a-f]{32}$/;
const encoder = new TextEncoder();

async function read(reply: Reply): Promise<Data> {
  try {
    const j: unknown = await reply.json();
    return typeof j === 'object' && j !== null && !Array.isArray(j) ? (j as Data) : {};
  } catch {
    return {};
  }
}
const signedOut = (reply: Reply, data: Data): boolean => reply.redirected || reply.status === 401 || (reply.status === 403 && data['error'] !== 'csrf');
const failed = (reply: Reply): Error => new Error(`The server answered ${reply.status}.`);
const isServerNote = (x: unknown): x is ServerNote => {
  const n = x as Partial<ServerNote> | null;
  return typeof n === 'object' && n !== null && typeof n.id === 'string' && NOTE_ID.test(n.id) && Number.isInteger(n.size)
    && Number.isInteger(n.arrived_at) && (n.picked_up_at === null || Number.isInteger(n.picked_up_at));
};
const noteId = (id: string): string => {
  if (!NOTE_ID.test(id)) throw new Error('Not a note id.');
  return id;
};

export function createApi(fetch: Fetch, csrf: string): PageApi {
  let token = csrf;
  let queue: Promise<unknown> = Promise.resolve();
  const get = async (url: string): Promise<{ reply: Reply; data: Data }> => {
    const reply = await fetch(url);
    const data = reply.redirected ? {} : await read(reply);
    if (signedOut(reply, data)) throw new SignedOut('Your sign-in ended.');
    return { reply, data };
  };
  const post = (url: string, type: string, body: Uint8Array<ArrayBuffer>): Promise<{ reply: Reply; data: Data }> => {
    const run = async (): Promise<{ reply: Reply; data: Data }> => {
      for (let attempt = 0; ; attempt++) {
        const reply = await fetch(url, { method: 'POST', headers: { 'X-CSRF': token, 'Content-Type': type }, body });
        const data = reply.redirected ? {} : await read(reply);
        if (typeof data['csrf'] === 'string') token = data['csrf'];
        if (reply.status === 403 && data['error'] === 'csrf' && attempt === 0) {
          const fresh = await get('csrf.php');
          if (!fresh.reply.ok || typeof fresh.data['csrf'] !== 'string') throw failed(fresh.reply);
          token = fresh.data['csrf'];
          continue;
        }
        if (signedOut(reply, data)) throw new SignedOut('Your sign-in ended.');
        return { reply, data };
      }
    };
    const next = queue.then(run, run);
    queue = next.catch(() => undefined);
    return next;
  };
  const deleted = async (form: string): Promise<number> => {
    const { reply, data } = await post('delete.php', 'application/x-www-form-urlencoded', encoder.encode(form));
    if (!reply.ok) throw failed(reply);
    return typeof data['deleted'] === 'number' ? data['deleted'] : 0;
  };
  return {
    async upload(bundle) {
      const { reply, data } = await post('notes.php', 'application/octet-stream', bundle);
      const id = data['id'];
      if (reply.status === 201 && typeof id === 'string' && NOTE_ID.test(id)) return { kind: 'sent', id };
      const error = data['error'];
      if (!reply.ok && typeof error === 'string' && (REFUSED_REASONS as readonly string[]).includes(error)) return { kind: 'refused', reason: error as RefusedReason };
      throw failed(reply);
    },
    async list() {
      const { reply, data } = await get('notes.php');
      if (!reply.ok) throw failed(reply);
      const notes = data['notes'];
      return Array.isArray(notes) ? notes.filter(isServerNote) : [];
    },
    async bytes(id) {
      const reply = await fetch(`note.php?id=${noteId(id)}`);
      if (reply.redirected || reply.status === 401 || reply.status === 403) throw new SignedOut('Your sign-in ended.');
      if (!reply.ok) throw failed(reply);
      if (!(reply.headers.get('content-type') ?? '').toLowerCase().startsWith('application/octet-stream')) throw new Error('note.php did not answer application/octet-stream.');
      return new Uint8Array(await reply.arrayBuffer());
    },
    remove: async id => deleted(`id=${noteId(id)}`),
    removeAll: async () => deleted('all=1'),
    async keyring() {
      const { reply, data } = await get('keyring.php');
      if (reply.status === 404 && data['error'] === 'no_keyring') throw new NoKeyring('No notes key has been uploaded yet.');
      const keyring = data['keyring'];
      if (!reply.ok || typeof keyring !== 'object' || keyring === null) throw failed(reply);
      return keyring as LockedKeyring;
    },
  };
}
```

- [ ] **Step 4: Run the test** — `node --test workroom/test/api.test.ts` — PASS; rebuild and `--check` — exit 0.

- [ ] **Step 5: Commit** — "Music workroom: the page's API client (one POST at a time, the CSRF retry, sign-out by status)" with the trailers.

### Task 7: The outbox, in memory and in IndexedDB

**Files:**
- Create: `games/workroom/src/outbox.ts`, `games/workroom/src/idb.ts`
- Modify: `games/workroom/src/tsconfig.crypto.json` (`outbox.ts`), `games/workroom/src/tsconfig.dom.json` (`idb.ts`), `games/package.json` and `games/package-lock.json` (`fake-indexeddb`, test-only)
- Test: `games/workroom/test/outbox.test.ts`, `games/workroom/test/idb.test.ts`

**Interfaces:**
- Consumes: `PageApi`, `SignedOut`, `RefusedReason` (Task 6); `MAX_NOTE_BYTES` (Task 3).
- Produces:

```ts
// src/outbox.ts
export type KeptReason = RefusedReason | 'offline' | 'signed_out' | 'server';
/** A sealed note on this device waiting to be sent. Nothing in the clear about the note is kept: only its sealed bytes and when it was made. */
export interface Pending { key: string; bundle: Uint8Array<ArrayBuffer>; made: string; reason: KeptReason | 'new' }
export interface OutboxStore {
  all(): Promise<Pending[]>;
  put(p: Pending): Promise<void>;
  remove(key: string): Promise<void>;
  /** True when the notes are held only in this page view's memory: no IndexedDB, or the browser refused to open it or to store a note. */
  memoryOnly(): boolean;
}
export function memoryOutbox(): OutboxStore; // memoryOnly() is always true
export interface FlushReport { sent: { key: string; id: string }[]; kept: { key: string; reason: KeptReason }[] }
/** A flush after adding a note: `key` is the added note's, so the page can say what became of it. */
export interface AddReport extends FlushReport { key: string; memoryOnly: boolean } // memoryOnly: the store held the added note only in memory
/** Runs `work` under the page's cross-tab lock. */
export type OutboxLock = <T>(work: () => Promise<T>) => Promise<T>;
export const KEPT_MESSAGES: Readonly<Record<KeptReason, string>>; // "full" names MAX_NOTES
export const SENT_MESSAGE = 'Sent. It is waiting for pickup.';
export const MEMORY_NOTICE: string;      // added to a kept note's message when AddReport.memoryOnly
export const SEND_MESSAGES: { readonly sealFailed: string }; // a note that could not be sealed: nothing stored, the words and recording still on screen
export interface Outbox {
  add(bundle: Uint8Array<ArrayBuffer>, made: string): Promise<AddReport>; // stored first, then a flush
  flush(): Promise<FlushReport>;
  pending(): Promise<Pending[]>;   // in the order they were made
  discard(key: string): Promise<void>;
}
/** `lock`: where the browser has Web Locks, every flush runs under it, so two tabs never upload one kept note twice. */
export function createOutbox(store: OutboxStore, api: Pick<PageApi, 'upload'>, newKey: () => string, lock?: OutboxLock | null): Outbox;
// src/idb.ts
export const OUTBOX_DB = 'siue-music';
export const OUTBOX_STORE = 'outbox';
/** The outbox in IndexedDB; a note the browser will not store there (IndexedDB missing, refusing to open, or refusing the write) is kept in this page view's memory, and memoryOnly() says so. */
export function indexedDbOutbox(idb?: IDBFactory | null): OutboxStore;
```

- [ ] **Step 1: Write the failing test** (`test/outbox.test.ts`):

```ts
// The outbox: a note is stored before it is sent, so nothing is lost; offline,
// over the limits, signed out or refused, it stays with a reason; online again,
// it goes, in the order the notes were made; only Discard drops one.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { KEPT_MESSAGES, createOutbox, memoryOutbox } from '../src/outbox.ts';
import type { OutboxLock } from '../src/outbox.ts';
import { SignedOut, type UploadResult } from '../src/api.ts';
import { MAX_NOTE_BYTES } from '../src/note.ts';

const keys = () => { let k = 0; return () => `k${++k}`; };
const one = (b: number) => new Uint8Array([b]);
const SENT = (id = 'f'.repeat(32)): UploadResult => ({ kind: 'sent', id });

test('a note is in the store while it is sent, and leaves it once sent', async () => {
  const store = memoryOutbox();
  const seen: number[] = [];
  const box = createOutbox(store, { upload: async () => { seen.push((await store.all()).length); return SENT(); } }, keys());
  const r = await box.add(one(1), '2026-10-20T00:00:00.000Z');
  assert.deepEqual(seen, [1]);
  assert.deepEqual(r, { key: 'k1', memoryOnly: true, sent: [{ key: 'k1', id: 'f'.repeat(32) }], kept: [] });
  assert.deepEqual(await store.all(), []);
});

test('offline keeps every note and stops trying after the first failure', async () => {
  const store = memoryOutbox();
  let calls = 0;
  const box = createOutbox(store, { upload: async () => { calls++; throw new TypeError('Failed to fetch'); } }, keys());
  await box.add(one(1), '2026-10-20T00:00:01.000Z');
  const r = await box.add(one(2), '2026-10-20T00:00:02.000Z');
  assert.deepEqual(r.kept, [{ key: 'k1', reason: 'offline' }, { key: 'k2', reason: 'offline' }]);
  assert.equal(calls, 2, 'one try per flush: the second flush stopped at the first note');
  assert.deepEqual((await store.all()).map(p => p.reason), ['offline', 'offline']);
  assert.match(KEPT_MESSAGES.offline, /kept on this device/);
});

test('refusals, a lost session and a server error keep the note with their reason', async () => {
  const cases: [() => Promise<UploadResult>, string][] = [
    [async () => ({ kind: 'refused', reason: 'too_large' }), 'too_large'],
    [async () => ({ kind: 'refused', reason: 'full' }), 'full'],
    [async () => ({ kind: 'refused', reason: 'unknown_key' }), 'unknown_key'],
    [async () => { throw new SignedOut('x'); }, 'signed_out'],
    [async () => { throw new Error('The server answered 500.'); }, 'server'],
  ];
  for (const [upload, reason] of cases) {
    const store = memoryOutbox();
    const r = await createOutbox(store, { upload }, keys()).add(one(1), 'a');
    assert.deepEqual(r.kept.map(x => x.reason), [reason]);
    assert.equal((await store.all())[0]?.reason, reason);
    assert.ok(KEPT_MESSAGES[reason as keyof typeof KEPT_MESSAGES].length > 0);
  }
});

test('a note over 2 MB is never sent and does not hold up the next one', async () => {
  const store = memoryOutbox();
  const sizes: number[] = [];
  const box = createOutbox(store, { upload: async b => { sizes.push(b.length); return SENT(); } }, keys());
  const big = await box.add(new Uint8Array(MAX_NOTE_BYTES + 1), '2026-10-20T00:00:01.000Z');
  assert.deepEqual(big.kept, [{ key: 'k1', reason: 'too_large' }]);
  const small = await box.add(one(2), '2026-10-20T00:00:02.000Z');
  assert.deepEqual([small.sent.map(s => s.key), small.kept], [['k2'], [{ key: 'k1', reason: 'too_large' }]]);
  assert.deepEqual(sizes, [1]);
  assert.match(KEPT_MESSAGES.too_large, /2 MB/);
});

test('back online, kept notes go in the order they were made', async () => {
  const store = memoryOutbox();
  let online = false;
  const sent: number[] = [];
  const box = createOutbox(store, { upload: async b => { if (!online) throw new TypeError('offline'); sent.push(b[0]!); return SENT(); } }, keys());
  await box.add(one(2), '2026-10-20T00:00:02.000Z');
  await box.add(one(1), '2026-10-20T00:00:01.000Z');
  online = true;
  const r = await box.flush();
  assert.deepEqual([sent, r.sent.length, (await store.all()).length], [[1, 2], 2, 0]);
});

test('two sends at once never send a note twice', async () => {
  const store = memoryOutbox();
  const uploaded: number[] = [];
  const box = createOutbox(store, { upload: async b => { await new Promise(r => setTimeout(r, 5)); uploaded.push(b[0]!); return SENT(); } }, keys());
  await Promise.all([box.add(one(1), 'a'), box.add(one(2), 'b'), box.flush()]);
  assert.deepEqual(uploaded, [1, 2]);
});

test('the 2,000-note limit is named from the limit itself', () => {
  assert.match(KEPT_MESSAGES.full, /holds 2,000 notes/);
});

test('with a lock, two tabs on one store upload each kept note once; without it they can upload it twice', async () => {
  const mutex = (): OutboxLock => { let tail: Promise<unknown> = Promise.resolve(); return work => { const next = tail.then(work, work); tail = next.catch(() => undefined); return next; }; };
  const run = async (lock: OutboxLock | null): Promise<number[]> => {
    const store = memoryOutbox();
    const uploaded: number[] = [];
    let online = false;
    const api = { upload: async (b: Uint8Array<ArrayBuffer>): Promise<UploadResult> => { if (!online) throw new TypeError('offline'); await new Promise(r => setTimeout(r, 5)); uploaded.push(b[0]!); return SENT(); } };
    const tabA = createOutbox(store, api, keys(), lock);
    const tabB = createOutbox(store, api, () => 'other', lock);
    await tabA.add(one(1), '2026-10-20T00:00:01.000Z');
    await tabA.add(one(2), '2026-10-20T00:00:02.000Z');
    online = true;
    await Promise.all([tabA.flush(), tabB.flush()]);
    return uploaded;
  };
  assert.deepEqual(await run(mutex()), [1, 2], 'each note once, in order');
  assert.ok((await run(null)).length > 2, 'the control: without the lock the same notes go twice');
});

test('Discard drops an unsent note; pending lists the rest in order', async () => {
  const store = memoryOutbox();
  const box = createOutbox(store, { upload: async () => { throw new TypeError('offline'); } }, keys());
  await box.add(one(1), '2026-10-20T00:00:02.000Z');
  await box.add(one(2), '2026-10-20T00:00:01.000Z');
  assert.deepEqual((await box.pending()).map(p => p.key), ['k2', 'k1']);
  await box.discard('k1');
  assert.deepEqual((await box.pending()).map(p => p.key), ['k2']);
});

test('only idb.ts names IndexedDB, and it keeps nothing but the pending record', () => {
  const outbox = readFileSync(new URL('../src/outbox.ts', import.meta.url), 'utf8');
  assert.doesNotMatch(outbox, /indexedDB|localStorage|sessionStorage|document\.cookie|\bcaches\b/);
  const idb = readFileSync(new URL('../src/idb.ts', import.meta.url), 'utf8');
  assert.match(idb, /'siue-music'/);
  assert.match(idb, /'outbox'/);
  assert.doesNotMatch(idb, /localStorage|sessionStorage|document\.cookie|\bcaches\b|passphrase|keyring|CryptoKey/);
});
```

- [ ] **Step 2: Run to see it fail** — `node --test workroom/test/outbox.test.ts` — FAIL (no module).

- [ ] **Step 3: Implement `src/outbox.ts`** (and add `"outbox.ts"` to `src/tsconfig.crypto.json`):

```ts
// Sealed notes waiting to be sent. A note is stored before its first try, so
// a lost connection, a lost sign-in or a refusal never loses it; it stays with
// the reason and goes on the next flush (page load, back online, Try again).
// Only Discard drops an unsent note. The store holds the sealed bytes and when
// the note was made, nothing else. One add or flush runs at a time in a page,
// and only one tab at a time uploads (the page's lock, where the browser has one).
import { SignedOut } from './api.ts';
import type { PageApi, RefusedReason } from './api.ts';
import { MAX_NOTES, MAX_NOTE_BYTES } from './note.ts';

export type KeptReason = RefusedReason | 'offline' | 'signed_out' | 'server';
export interface Pending { key: string; bundle: Uint8Array<ArrayBuffer>; made: string; reason: KeptReason | 'new' }
export interface OutboxStore {
  all(): Promise<Pending[]>;
  put(p: Pending): Promise<void>;
  remove(key: string): Promise<void>;
  /** True when the notes are held only in this page view's memory: the browser has no IndexedDB, or refused to open it or to store a note. */
  memoryOnly(): boolean;
}
export interface FlushReport { sent: { key: string; id: string }[]; kept: { key: string; reason: KeptReason }[] }
/** `memoryOnly`: the store held the note only in memory (OutboxStore.memoryOnly) when it was added. */
export interface AddReport extends FlushReport { key: string; memoryOnly: boolean }
/** Runs `work` while holding the page's cross-tab lock, so two tabs never upload the same kept note. */
export type OutboxLock = <T>(work: () => Promise<T>) => Promise<T>;
export interface Outbox { add(bundle: Uint8Array<ArrayBuffer>, made: string): Promise<AddReport>; flush(): Promise<FlushReport>; pending(): Promise<Pending[]>; discard(key: string): Promise<void> }

export const SENT_MESSAGE = 'Sent. It is waiting for pickup.';
/** What the owner is told when a note cannot be sealed in this browser; nothing was stored, and the words or recording are still on screen. */
export const SEND_MESSAGES = {
  sealFailed: 'This note could not be sealed here (the browser blocked encryption, or the page is not secure). Nothing was sent, and your note is still here.',
} as const;
/** Added to a kept note's message when the browser would not store it on this device. */
export const MEMORY_NOTICE = 'This browser would not save it on this device, so it is kept only until this page is closed or reloaded.';

export const KEPT_MESSAGES: Readonly<Record<KeptReason, string>> = {
  offline: 'No connection: this note is kept on this device and will be sent when you are back online.',
  signed_out: 'Your sign-in ended. Sign in again; the note stays on this device.',
  server: 'The server had a problem. This note stays on this device and is sent on the next try.',
  too_large: 'This note is over 2 MB, so it stays on this device. Record a shorter one, then discard this one.',
  full: `The workroom holds ${MAX_NOTES.toLocaleString('en-US')} notes. Delete some old ones; this note stays on this device until then.`,
  no_key: 'The workroom has no notes key yet, so this note stays on this device.',
  bad_header: 'The server did not accept this note’s key. Reload the page; the note stays on this device.',
  unknown_key: 'The server did not accept this note’s key. Reload the page; the note stays on this device.',
};

/** Reasons that would be the same for every note after this one: the walk stops there. */
const STOPS: ReadonlySet<KeptReason> = new Set<KeptReason>(['offline', 'signed_out', 'server', 'full', 'no_key']);

export function memoryOutbox(): OutboxStore {
  const notes = new Map<string, Pending>();
  return {
    all: async () => [...notes.values()].map(p => ({ ...p })),
    put: async p => { notes.set(p.key, { ...p }); },
    remove: async key => { notes.delete(key); },
    memoryOnly: () => true,
  };
}

const byMade = (a: Pending, b: Pending): number => (a.made < b.made ? -1 : a.made > b.made ? 1 : 0);

export function createOutbox(store: OutboxStore, api: Pick<PageApi, 'upload'>, newKey: () => string, lock: OutboxLock | null = null): Outbox {
  let chain: Promise<unknown> = Promise.resolve();
  const serial = <T>(work: () => Promise<T>): Promise<T> => {
    const next = chain.then(work, work);
    chain = next.catch(() => undefined);
    return next;
  };
  const flushNow = async (): Promise<FlushReport> => {
    const report: FlushReport = { sent: [], kept: [] };
    let stopped: KeptReason | null = null;
    for (const p of (await store.all()).sort(byMade)) {
      let reason: KeptReason | null = stopped;
      if (reason === null && p.bundle.length > MAX_NOTE_BYTES) reason = 'too_large';
      if (reason === null) {
        try {
          const r = await api.upload(p.bundle);
          if (r.kind === 'sent') {
            await store.remove(p.key);
            report.sent.push({ key: p.key, id: r.id });
            continue;
          }
          reason = r.reason;
        } catch (e) {
          reason = e instanceof SignedOut ? 'signed_out' : e instanceof TypeError ? 'offline' : 'server';
        }
        if (STOPS.has(reason)) stopped = reason;
      }
      if (p.reason !== reason) await store.put({ ...p, reason });
      report.kept.push({ key: p.key, reason });
    }
    return report;
  };
  const locked = <T>(work: () => Promise<T>): Promise<T> => (lock ? lock(work) : work());
  return {
    add: (bundle, made) => serial(async () => {
      const key = newKey();
      await store.put({ key, bundle, made, reason: 'new' });
      return { key, memoryOnly: store.memoryOnly(), ...(await locked(flushNow)) };
    }),
    flush: () => serial(() => locked(flushNow)),
    pending: async () => (await store.all()).sort(byMade),
    discard: key => serial(() => store.remove(key)),
  };
}
```

- [ ] **Step 4: Implement `src/idb.ts`** (and add `"idb.ts"` to `src/tsconfig.dom.json`). It is the only file that names IndexedDB. `test/idb.test.ts` (Step 5) runs it against `fake-indexeddb`; the browser check (Task 17) sends through it, reloads, and lists the origin's stores.

```ts
// The outbox's home in the browser: IndexedDB database "siue-music", store
// "outbox", one record per sealed note waiting to be sent ({ key, bundle,
// made, reason }). Nothing of any key, and nothing in the clear about a note,
// is ever stored here. Where IndexedDB is missing, refuses to open, or refuses
// to store a note (some private windows, a full disk), that note lives in this
// page view's memory instead and memoryOnly() says so.
import { memoryOutbox } from './outbox.ts';
import type { OutboxStore, Pending } from './outbox.ts';

export const OUTBOX_DB = 'siue-music';
export const OUTBOX_STORE = 'outbox';

const isPending = (x: unknown): x is Pending => {
  const p = x as Partial<Pending> | null;
  return typeof p === 'object' && p !== null && typeof p.key === 'string' && p.bundle instanceof Uint8Array && typeof p.made === 'string' && typeof p.reason === 'string';
};

export function indexedDbOutbox(idb: IDBFactory | null = typeof indexedDB === 'undefined' ? null : indexedDB): OutboxStore {
  const fallback = memoryOutbox();
  let inMemory = !idb;
  if (!idb) return { ...fallback, memoryOnly: () => true };
  let db: Promise<IDBDatabase | null> | null = null;
  const open = (): Promise<IDBDatabase | null> => (db ??= new Promise(resolve => {
    try {
      const req = idb.open(OUTBOX_DB, 1);
      req.onupgradeneeded = () => { if (!req.result.objectStoreNames.contains(OUTBOX_STORE)) req.result.createObjectStore(OUTBOX_STORE, { keyPath: 'key' }); };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => { inMemory = true; resolve(null); };
      req.onblocked = () => { inMemory = true; resolve(null); };
    } catch {
      inMemory = true;
      resolve(null);
    }
  }));
  const run = <T>(d: IDBDatabase, mode: IDBTransactionMode, work: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> => new Promise((resolve, reject) => {
    const tx = d.transaction(OUTBOX_STORE, mode);
    const req = work(tx.objectStore(OUTBOX_STORE));
    tx.oncomplete = () => resolve(req.result);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
  return {
    async all() {
      const d = await open();
      const stored = d ? (await run(d, 'readonly', s => s.getAll())).filter(isPending) : [];
      const held = new Map(stored.map(p => [p.key, p]));
      for (const p of await fallback.all()) held.set(p.key, p); // a note this view could only keep in memory
      return [...held.values()];
    },
    async put(p) {
      const d = await open();
      if (d) {
        try {
          await run(d, 'readwrite', s => s.put({ key: p.key, bundle: p.bundle, made: p.made, reason: p.reason }));
          await fallback.remove(p.key);
          return;
        } catch {
          // The browser refused to store it (a full disk, a locked-down window): keep it in memory rather than lose it.
        }
      }
      inMemory = true;
      await fallback.put(p);
    },
    async remove(key) {
      const d = await open();
      if (d) await run(d, 'readwrite', s => s.delete(key));
      await fallback.remove(key);
    },
    memoryOnly: () => inMemory,
  };
}
```

- [ ] **Step 5: Test `idb.ts` against a fake IndexedDB.** From `websites/www.cs/games` install the test-only dependency, exact-pinned: `npm install --save-exact --save-dev fake-indexeddb@6.2.6` (`package.json` lists `"fake-indexeddb": "6.2.6"` under `devDependencies`; `package-lock.json` changes with it). Then write `test/idb.test.ts`:

```ts
// The outbox in IndexedDB, against a fake IndexedDB (fake-indexeddb, a test-only
// dependency): notes survive a reload, nothing but the pending record is
// stored, and where IndexedDB is missing, refuses to open, or refuses a note,
// the note is kept in memory and the outbox says so.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { IDBFactory, IDBObjectStore } from 'fake-indexeddb';
import { OUTBOX_DB, OUTBOX_STORE, indexedDbOutbox } from '../src/idb.ts';
import type { Pending } from '../src/outbox.ts';

const pending = (key: string, bytes: number[], reason: Pending['reason'] = 'new'): Pending => ({ key, bundle: new Uint8Array(bytes), made: `2026-10-20T00:00:0${key.length}.000Z`, reason });
const bytesOf = (all: Pending[]): [string, number[], string][] => all.map((p): [string, number[], string] => [p.key, [...p.bundle], p.reason]).sort();

test('a stored note is there after a reload, with its reason; remove forgets it', async () => {
  const factory = new IDBFactory();
  const first = indexedDbOutbox(factory as unknown as globalThis.IDBFactory);
  await first.put(pending('a', [1, 2, 3]));
  await first.put(pending('bb', [4]));
  await first.put({ ...pending('a', [1, 2, 3]), reason: 'offline' });
  assert.equal(first.memoryOnly(), false);
  const reloaded = indexedDbOutbox(factory as unknown as globalThis.IDBFactory);
  assert.deepEqual(bytesOf(await reloaded.all()), [['a', [1, 2, 3], 'offline'], ['bb', [4], 'new']]);
  assert.ok((await reloaded.all()).every(p => p.bundle instanceof Uint8Array));
  await reloaded.remove('a');
  assert.deepEqual(bytesOf(await indexedDbOutbox(factory as unknown as globalThis.IDBFactory).all()), [['bb', [4], 'new']]);
});

test('the database holds one store of records with exactly key, bundle, made and reason', async () => {
  const factory = new IDBFactory();
  await indexedDbOutbox(factory as unknown as globalThis.IDBFactory).put(pending('a', [9]));
  assert.deepEqual((await factory.databases()).map(d => d.name), [OUTBOX_DB]);
  const db = await new Promise<IDBDatabase>((resolve, reject) => { const r = factory.open(OUTBOX_DB); r.onsuccess = () => resolve(r.result as unknown as IDBDatabase); r.onerror = () => reject(r.error); });
  assert.deepEqual([...db.objectStoreNames], [OUTBOX_STORE]);
  const rows = await new Promise<unknown[]>((resolve, reject) => { const q = db.transaction(OUTBOX_STORE).objectStore(OUTBOX_STORE).getAll(); q.onsuccess = () => resolve(q.result); q.onerror = () => reject(q.error); });
  db.close();
  assert.equal(rows.length, 1);
  assert.deepEqual(Object.keys(rows[0] as object).sort(), ['bundle', 'key', 'made', 'reason']);
});

test('no IndexedDB: notes are kept in memory, and the outbox says so', async () => {
  const box = indexedDbOutbox(null);
  assert.equal(box.memoryOnly(), true);
  await box.put(pending('a', [1]));
  assert.deepEqual(bytesOf(await box.all()), [['a', [1], 'new']]);
  await box.remove('a');
  assert.deepEqual(await box.all(), []);
});

test('IndexedDB that refuses to open: notes are kept in memory', async () => {
  const refusing = { open() { throw new Error('SecurityError'); } } as unknown as globalThis.IDBFactory;
  const box = indexedDbOutbox(refusing);
  await box.put(pending('a', [7]));
  assert.equal(box.memoryOnly(), true);
  assert.deepEqual(bytesOf(await box.all()), [['a', [7], 'new']]);
});

test('IndexedDB that refuses to store a note: that note is kept in memory, the stored ones stay, and the outbox says so', async () => {
  const factory = new IDBFactory();
  const box = indexedDbOutbox(factory as unknown as globalThis.IDBFactory);
  await box.put(pending('a', [1]));
  assert.equal(box.memoryOnly(), false);
  const put = IDBObjectStore.prototype.put;
  IDBObjectStore.prototype.put = function refuse() { throw new DOMException('The disk is full.', 'QuotaExceededError'); };
  try {
    await box.put(pending('bb', [2]));
  } finally {
    IDBObjectStore.prototype.put = put;
  }
  assert.equal(box.memoryOnly(), true);
  assert.deepEqual(bytesOf(await box.all()), [['a', [1], 'new'], ['bb', [2], 'new']]);
  await box.remove('bb');
  assert.deepEqual(bytesOf(await box.all()), [['a', [1], 'new']]);
});
```

- [ ] **Step 6: Run the tests** — `node --test workroom/test/outbox.test.ts workroom/test/idb.test.ts` — PASS (the idb test also fails on an `idb.ts` whose `put` has no memory fallback); rebuild and `--check` — exit 0.

- [ ] **Step 7: Commit** — `git add websites/www.cs/games/workroom websites/www.cs/games/package.json websites/www.cs/games/package-lock.json`; "Music workroom: the outbox (sealed notes wait on this device until they are sent)" with the trailers.

### Task 8: The note history

**Files:**
- Create: `games/workroom/src/history.ts`
- Modify: `games/workroom/src/tsconfig.crypto.json` (`history.ts`)
- Test: `games/workroom/test/history.test.ts`

**Interfaces:**
- Consumes: `ServerNote` (Task 6), `Opened`, `NoteUnreadable` (`seal.ts`), `NoteMark` (Task 3), `Change` (`score.ts`).
- Produces:

```ts
export interface HistoryItem { id: string; arrived: number; pickedUp: number | null; state: 'waiting' | 'picked-up'; opened: Opened | null; problem: string | null }
export type OpenOutcome = Opened | NoteUnreadable | 'download';
export const PROBLEMS: Readonly<Record<NoteUnreadable['reason'] | 'download', string>>;
export function buildHistory(server: readonly ServerNote[], outcomes: ReadonlyMap<string, OpenOutcome>): HistoryItem[]; // newest first
export function waitingByPiece(items: readonly HistoryItem[]): Map<string, number>;   // opened, waiting notes per piece
export function forPiece(items: readonly HistoryItem[], piece: string): HistoryItem[]; // the piece's notes and every note that could not be opened
export function timelineMarks(items: readonly HistoryItem[], piece: string, duration: number): NoteMark[]; // oldest first, numbered from 1; energy notes left out
export function answeredBy(changes: readonly Change[], id: string): number[];          // indexes of the changes whose answers name the note
```

- [ ] **Step 1: Write the failing test** (`test/history.test.ts`):

```ts
// The history: newest first, waiting or picked up, counts per piece, a note that
// cannot be opened named and kept (never hidden, never failing the list), and
// the marks the Story view draws for this piece's notes.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PROBLEMS, answeredBy, buildHistory, forPiece, timelineMarks, waitingByPiece } from '../src/history.ts';
import type { OpenOutcome } from '../src/history.ts';
import { NoteUnreadable, type Opened } from '../src/seal.ts';
import type { NoteBody } from '../src/note.ts';

const body = (piece: string, extra: Partial<NoteBody> = {}): NoteBody => ({ v: 1, kind: 'text', piece, draft: 1, from: 2, to: 4, fromBar: 2, toBar: 3, lane: 'brass', text: 't', reaction: null, curve: null, audio: null, made: '2026-10-20T00:00:00Z', ...extra });
const opened = (piece: string, extra: Partial<NoteBody> = {}): Opened => ({ fingerprint: 'ab'.repeat(32), body: body(piece, extra), audio: null });
const id = (c: string) => c.repeat(32);
const server = [
  { id: id('a'), size: 1, arrived_at: 1, picked_up_at: null },
  { id: id('b'), size: 1, arrived_at: 2, picked_up_at: 5 },
  { id: id('c'), size: 1, arrived_at: 3, picked_up_at: null },
  { id: id('d'), size: 1, arrived_at: 4, picked_up_at: null },
  { id: id('e'), size: 1, arrived_at: 5, picked_up_at: null },
];
const outcomes = new Map<string, OpenOutcome>([
  [id('a'), opened('ch1')], [id('b'), opened('ch1', { from: 6, to: 6, fromBar: 4, toBar: 4, lane: null, kind: 'hum', text: null, audio: { mime: 'audio/mp4', seconds: 2 } })],
  [id('c'), new NoteUnreadable('tampered')], [id('d'), 'download'], [id('e'), opened('other')],
]);

test('newest first, waiting or picked up, problems named', () => {
  const items = buildHistory(server, outcomes);
  assert.deepEqual(items.map(i => [i.id[0], i.state]), [['e', 'waiting'], ['d', 'waiting'], ['c', 'waiting'], ['b', 'picked-up'], ['a', 'waiting']]);
  assert.equal(items[2]!.problem, PROBLEMS.tampered);
  assert.equal(items[1]!.problem, PROBLEMS.download);
  assert.equal(items[0]!.problem, null);
  assert.equal(items[3]!.pickedUp, 5);
  assert.equal(buildHistory(server, new Map())[0]!.problem, null, 'not opened yet is not a problem');
});

test('waiting counts per piece; this piece lists its notes and every note that could not be opened', () => {
  const items = buildHistory(server, outcomes);
  assert.deepEqual([...waitingByPiece(items)].sort(), [['ch1', 1], ['other', 1]]);
  assert.deepEqual(forPiece(items, 'ch1').map(i => i.id[0]), ['d', 'c', 'b', 'a']);
});

test('timeline marks: this piece only, oldest first, numbered, energy left out, times inside the piece', () => {
  const extra = { id: id('f'), size: 1, arrived_at: 6, picked_up_at: null };
  const more = new Map(outcomes);
  more.set(id('f'), opened('ch1', { kind: 'energy', text: null, from: 0, to: 16, fromBar: 1, toBar: 8, lane: null, curve: [[0, 0], [16, 1]] }));
  const marks = timelineMarks(buildHistory([...server, extra], more), 'ch1', 5);
  assert.deepEqual(marks, [
    { id: id('a'), n: 1, from: 2, to: 4, lane: 'brass', kind: 'text', draft: 1 },
    { id: id('b'), n: 2, from: 5, to: 5, lane: null, kind: 'hum', draft: 1 },
  ]);
});

test('the changes that answer a note', () => {
  const changes = [{ from_bar: 1, to_bar: 2, lane: null, text: 'x', answers: [id('a')] }, { from_bar: 3, to_bar: 4, lane: null, text: 'y', answers: [id('b'), id('a')] }];
  assert.deepEqual(answeredBy(changes, id('a')), [0, 1]);
  assert.deepEqual(answeredBy(changes, id('c')), []);
});
```

- [ ] **Step 2: Run to see it fail** — `node --test workroom/test/history.test.ts` — FAIL (no module).

- [ ] **Step 3: Implement `src/history.ts`** (and add `"history.ts"` to `src/tsconfig.crypto.json`):

```ts
// The owner's notes as the page shows them: every note on the server, newest
// first, waiting or picked up, opened (its body already checked by
// note.ts isNoteBody inside open()) or with the plain reason it could not be.
// Also the counts per piece, the marks the Story view draws, and which of
// Claude's changes answer a note.
import type { ServerNote } from './api.ts';
import type { NoteMark } from './answer.ts';
import type { Change } from './score.ts';
import { NoteUnreadable } from './seal.ts';
import type { Opened } from './seal.ts';

export interface HistoryItem { id: string; arrived: number; pickedUp: number | null; state: 'waiting' | 'picked-up'; opened: Opened | null; problem: string | null }
export type OpenOutcome = Opened | NoteUnreadable | 'download';
export const PROBLEMS: Readonly<Record<NoteUnreadable['reason'] | 'download', string>> = {
  format: 'Could not open this note: it is not a sealed note.',
  'unknown-key': 'Could not open this note: it was sealed to a key this page does not hold.',
  tampered: 'Could not open this note: it was damaged or changed.',
  download: 'Could not download this note. Reload the page to try again.',
};

export function buildHistory(server: readonly ServerNote[], outcomes: ReadonlyMap<string, OpenOutcome>): HistoryItem[] {
  return server.map((n, i) => ({ n, i })).sort((a, b) => b.n.arrived_at - a.n.arrived_at || b.i - a.i).map(({ n }) => {
    const o = outcomes.get(n.id);
    const problem = o === undefined ? null : o === 'download' ? PROBLEMS.download : o instanceof NoteUnreadable ? PROBLEMS[o.reason] : null;
    const opened = o === undefined || o === 'download' || o instanceof NoteUnreadable ? null : o;
    return { id: n.id, arrived: n.arrived_at, pickedUp: n.picked_up_at, state: n.picked_up_at === null ? 'waiting' : 'picked-up', opened, problem };
  });
}

export function waitingByPiece(items: readonly HistoryItem[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const i of items) if (i.state === 'waiting' && i.opened) counts.set(i.opened.body.piece, (counts.get(i.opened.body.piece) ?? 0) + 1);
  return counts;
}

export function forPiece(items: readonly HistoryItem[], piece: string): HistoryItem[] {
  return items.filter(i => (i.opened ? i.opened.body.piece === piece : i.problem !== null));
}

export function timelineMarks(items: readonly HistoryItem[], piece: string, duration: number): NoteMark[] {
  const clamp = (t: number): number => Math.min(duration, Math.max(0, t));
  return items
    .filter(i => i.opened !== null && i.opened.body.piece === piece && i.opened.body.kind !== 'energy')
    .sort((a, b) => a.arrived - b.arrived || (a.id < b.id ? -1 : 1))
    .map((i, k) => {
      const b = i.opened!.body;
      const from = clamp(b.from);
      return { id: i.id, n: k + 1, from, to: Math.max(from, clamp(b.to)), lane: b.lane, kind: b.kind, draft: b.draft };
    });
}

export function answeredBy(changes: readonly Change[], id: string): number[] {
  return changes.flatMap((c, i) => (c.answers.includes(id) ? [i] : []));
}
```

- [ ] **Step 4: Run the test** — `node --test workroom/test/history.test.ts` — PASS; rebuild and `--check` — exit 0.

- [ ] **Step 5: Commit** — "Music workroom: the note history, its counts and its timeline marks" with the trailers.

### Task 9: The notes session: unlock, history, send and delete

**Files:**
- Create: `games/workroom/src/notes-session.ts`
- Modify: `games/workroom/src/tsconfig.crypto.json` (`notes-session.ts`), `games/workroom/test/no-storage.test.ts` (the scanned files)
- Test: `games/workroom/test/notes-session.test.ts`

**Interfaces:**
- Consumes: `PageApi`, `SignedOut`, `NoKeyring` (Task 6); `Outbox`, `AddReport`, `FlushReport`, `Pending`, `SEND_MESSAGES` (Task 7); `buildHistory`, `HistoryItem`, `OpenOutcome` (Task 8); `seal`, `open`, `NoteUnreadable`, `BuiltInKey` (`seal.ts`); `unlockKeyring`, `WrongPassphrase`, `KeyringInvalid` (`unlock.ts`); `Vault` (`vault.ts`).
- Produces:

```ts
export const UNLOCK_MESSAGES: { noKeyring: string; wrong: string; invalid: string; signedOut: string; offline: string };
export interface SessionDeps { api: PageApi; vault: Vault; outbox: Outbox; keys: { current: BuiltInKey | null; previous: readonly BuiltInKey[] } }
export interface NotesSession {
  readonly sealing: boolean;                  // the page has a notes key built in
  unlocked(): boolean;
  /** Unlocks with the passphrase (kept nowhere). Resolves to null, or the message to show. */
  unlock(passphrase: string): Promise<string | null>;
  /** Every server note, opened; one failure never stops the rest. Throws SignedOut; throws when locked. */
  history(): Promise<HistoryItem[]>;
  send(body: NoteBody, audio: Uint8Array<ArrayBuffer> | null): Promise<AddReport>;  // seal, then the outbox; a note that cannot be sealed rejects with Error(SEND_MESSAGES.sealFailed) and stores nothing
  flush(): Promise<FlushReport>;
  kept(): Promise<Pending[]>;
  discard(key: string): Promise<void>;
  remove(id: string): Promise<void>;
  removeAll(): Promise<number>;
  /** Forgets the unlocked keys and the opened notes. */
  lock(): void;
}
export function createNotesSession(d: SessionDeps): NotesSession;
```

- [ ] **Step 1: Write the failing test** (`test/notes-session.test.ts`):

```ts
// The notes session with the test keys: unlocking says what went wrong in plain
// words, sent notes come back opened, a damaged or missing note never stops the
// rest, an earlier key's note still opens, deletes forget what they removed.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { NoKeyring, type PageApi } from '../src/api.ts';
import { UNLOCK_MESSAGES, createNotesSession } from '../src/notes-session.ts';
import { SEND_MESSAGES, createOutbox, memoryOutbox } from '../src/outbox.ts';
import { PROBLEMS } from '../src/history.ts';
import { seal } from '../src/seal.ts';
import { createVault } from '../src/vault.ts';
import type { NoteBody } from '../src/note.ts';
import { builtIn, fx, otherKey } from './fixture-key.ts';

const note = (text: string, piece = 'test-piece'): NoteBody => ({ v: 1, kind: 'text', piece, draft: 1, from: 0, to: 1, fromBar: 1, toBar: 1, lane: null, text, reaction: null, curve: null, audio: null, made: '2026-10-20T00:00:00.000Z' });

function server() {
  const notes: { id: string; bytes: Uint8Array<ArrayBuffer>; arrived: number; picked: number | null }[] = [];
  let n = 0;
  const state = { failKeyring: null as unknown, broken: new Set<string>(), downloads: 0 };
  const api: PageApi = {
    upload: async b => { const id = (++n).toString(16).padStart(32, '0'); notes.push({ id, bytes: b, arrived: n, picked: null }); return { kind: 'sent', id }; },
    list: async () => notes.map(x => ({ id: x.id, size: x.bytes.length, arrived_at: x.arrived, picked_up_at: x.picked })),
    bytes: async id => { state.downloads++; if (state.broken.has(id)) throw new Error('The server answered 500.'); return notes.find(x => x.id === id)!.bytes; },
    remove: async id => { const i = notes.findIndex(x => x.id === id); if (i >= 0) notes.splice(i, 1); return i >= 0 ? 1 : 0; },
    removeAll: async () => { const k = notes.length; notes.length = 0; return k; },
    keyring: async () => { if (state.failKeyring) throw state.failKeyring; return fx.keyring; },
  };
  return { api, notes, state };
}
const session = (s = server(), current = builtIn) => ({ s, notes: createNotesSession({ api: s.api, vault: createVault(), outbox: createOutbox(memoryOutbox(), s.api, () => crypto.randomUUID()), keys: { current, previous: [otherKey] } }) });

test('unlock: no keyring yet, a wrong passphrase, a keyring without this page\'s key, then the right passphrase', async () => {
  const { s, notes } = session();
  s.state.failKeyring = new NoKeyring('none');
  assert.equal(await notes.unlock(fx.passphrase), UNLOCK_MESSAGES.noKeyring);
  s.state.failKeyring = null;
  assert.equal(await notes.unlock('not it'), UNLOCK_MESSAGES.wrong);
  assert.equal(notes.unlocked(), false);
  await assert.rejects(notes.history(), /locked/);
  const stranger = session(server(), { fingerprint: 'ab'.repeat(32), spki: builtIn.spki });
  assert.equal(await stranger.notes.unlock(fx.passphrase), UNLOCK_MESSAGES.invalid);
  assert.equal(await notes.unlock(fx.passphrase), null);
  assert.equal(notes.unlocked(), true);
});

test('sent notes come back opened, newest first; a picked-up note says so', async () => {
  const { s, notes } = session();
  assert.deepEqual((await notes.send(note('first'), null)).kept, []);
  await notes.send(note('second'), null);
  s.notes[0]!.picked = 9;
  await notes.unlock(fx.passphrase);
  const items = await notes.history();
  assert.deepEqual(items.map(i => [i.opened?.body.text, i.state]), [['second', 'waiting'], ['first', 'picked-up']]);
  const before = s.state.downloads;
  await notes.history();
  assert.equal(s.state.downloads, before, 'an opened note is not downloaded again');
});

test('a damaged note and a failed download never stop the rest; an earlier key\'s note opens', async () => {
  const { s, notes } = session();
  await notes.send(note('fine'), null);
  await s.api.upload(new TextEncoder().encode('not a sealed note'));
  await s.api.upload(await seal(note('sealed before a rotation'), null, otherKey));
  await notes.send(note('download fails'), null);
  s.state.broken.add(s.notes[3]!.id);
  await notes.unlock(fx.passphrase);
  const items = await notes.history();
  assert.deepEqual(items.map(i => i.opened?.body.text ?? i.problem), [PROBLEMS.download, 'sealed before a rotation', PROBLEMS.format, 'fine']);
  s.state.broken.clear();
  assert.equal((await notes.history())[0]!.opened?.body.text, 'download fails', 'a failed download is tried again');
});

test('delete one, delete all, and lock forgets the keys', async () => {
  const { s, notes } = session();
  await notes.send(note('a'), null);
  await notes.send(note('b'), null);
  await notes.unlock(fx.passphrase);
  await notes.remove(s.notes[0]!.id);
  assert.deepEqual((await notes.history()).map(i => i.opened?.body.text), ['b']);
  assert.equal(await notes.removeAll(), 1);
  assert.deepEqual(await notes.history(), []);
  notes.lock();
  assert.equal(notes.unlocked(), false);
});

test('a note that cannot be sealed here is a plain message, and nothing is stored', async () => {
  const s = server();
  const outbox = createOutbox(memoryOutbox(), s.api, () => 'k');
  const notes = createNotesSession({ api: s.api, vault: createVault(), outbox, keys: { current: { ...builtIn, spki: 'AAAA' }, previous: [] } });
  await assert.rejects(notes.send(note('x'), null), (e: unknown) => e instanceof Error && e.message === SEND_MESSAGES.sealFailed);
  assert.deepEqual(await outbox.pending(), []);
  assert.equal(s.notes.length, 0);
});

test('without a key built in nothing seals', async () => {
  const s = server();
  const notes = createNotesSession({ api: s.api, vault: createVault(), outbox: createOutbox(memoryOutbox(), s.api, () => 'k'), keys: { current: null, previous: [] } });
  assert.equal(notes.sealing, false);
  await assert.rejects(notes.send(note('x'), null), /no notes key/);
  assert.equal(s.notes.length, 0);
});
```

  In `test/no-storage.test.ts`, the second test's file list becomes `['note', 'seal', 'unlock', 'vault', 'public-key', 'answer', 'api', 'outbox', 'history', 'notes-session', 'recorder', 'energy']`.

- [ ] **Step 2: Run to see it fail** — `node --test workroom/test/notes-session.test.ts workroom/test/no-storage.test.ts` — FAIL (no module).

- [ ] **Step 3: Implement `src/notes-session.ts`** (and add `"notes-session.ts"` to `src/tsconfig.crypto.json`):

```ts
// The owner's notes on this page view: unlock the keyring with the passphrase
// (used once, kept nowhere), list and open every note, send a new one through
// the outbox, delete. The unlocked keys live in the vault, in memory only.
import { NoKeyring, SignedOut } from './api.ts';
import type { PageApi } from './api.ts';
import { buildHistory } from './history.ts';
import type { HistoryItem, OpenOutcome } from './history.ts';
import type { NoteBody } from './note.ts';
import { SEND_MESSAGES } from './outbox.ts';
import type { AddReport, FlushReport, Outbox, Pending } from './outbox.ts';
import { NoteUnreadable, open, seal } from './seal.ts';
import type { BuiltInKey } from './seal.ts';
import { KeyringInvalid, WrongPassphrase, unlockKeyring } from './unlock.ts';
import type { Vault } from './vault.ts';

export const UNLOCK_MESSAGES = {
  noKeyring: 'No notes key has been uploaded yet (make music-setup).',
  wrong: 'That passphrase did not unlock the key.',
  invalid: "The keyring on the server does not match this page's key. Reload the page; if it still fails, run make music-setup.",
  signedOut: 'Your sign-in ended. Sign in again.',
  offline: 'Could not reach the server. Check the connection and try again.',
} as const;

export interface SessionDeps { api: PageApi; vault: Vault; outbox: Outbox; keys: { current: BuiltInKey | null; previous: readonly BuiltInKey[] } }
export interface NotesSession {
  readonly sealing: boolean;
  unlocked(): boolean;
  unlock(passphrase: string): Promise<string | null>;
  history(): Promise<HistoryItem[]>;
  send(body: NoteBody, audio: Uint8Array<ArrayBuffer> | null): Promise<AddReport>;
  flush(): Promise<FlushReport>;
  kept(): Promise<Pending[]>;
  discard(key: string): Promise<void>;
  remove(id: string): Promise<void>;
  removeAll(): Promise<number>;
  lock(): void;
}

/** Notes opened at once while listing. */
const AT_ONCE = 6;

export function createNotesSession(d: SessionDeps): NotesSession {
  const outcomes = new Map<string, OpenOutcome>();
  let unlocked = false;
  const known = (): BuiltInKey[] => (d.keys.current ? [d.keys.current, ...d.keys.previous] : []);
  const say = (e: unknown): string => (e instanceof NoKeyring ? UNLOCK_MESSAGES.noKeyring
    : e instanceof WrongPassphrase ? UNLOCK_MESSAGES.wrong
    : e instanceof KeyringInvalid ? UNLOCK_MESSAGES.invalid
    : e instanceof SignedOut ? UNLOCK_MESSAGES.signedOut
    : UNLOCK_MESSAGES.offline);
  const openOne = async (id: string, ring: ReadonlyMap<string, CryptoKey>): Promise<void> => {
    let bytes: Uint8Array<ArrayBuffer>;
    try {
      bytes = await d.api.bytes(id);
    } catch (e) {
      if (e instanceof SignedOut) throw e;
      outcomes.set(id, 'download');
      return;
    }
    try {
      outcomes.set(id, await open(bytes, ring));
    } catch (e) {
      outcomes.set(id, e instanceof NoteUnreadable ? e : new NoteUnreadable('format'));
    }
  };
  return {
    sealing: d.keys.current !== null,
    unlocked: () => unlocked,
    async unlock(passphrase) {
      try {
        const locked = await d.api.keyring();
        d.vault.load(await unlockKeyring(locked, passphrase, known()));
        unlocked = true;
        return null;
      } catch (e) {
        return say(e);
      }
    },
    async history() {
      if (!unlocked) throw new Error('The notes are locked.');
      const server = await d.api.list();
      const ring = d.vault.keyring();
      const todo = server.filter(n => { const o = outcomes.get(n.id); return o === undefined || o === 'download'; }).map(n => n.id);
      for (let i = 0; i < todo.length; i += AT_ONCE) await Promise.all(todo.slice(i, i + AT_ONCE).map(id => openOne(id, ring)));
      const live = new Set(server.map(n => n.id));
      for (const id of [...outcomes.keys()]) if (!live.has(id)) outcomes.delete(id);
      return buildHistory(server, outcomes);
    },
    async send(body, audio) {
      const key = d.keys.current;
      if (!key) throw new Error('This page has no notes key built in.');
      let bundle: Uint8Array<ArrayBuffer>;
      try {
        bundle = await seal(body, audio, key);
      } catch {
        throw new Error(SEND_MESSAGES.sealFailed);
      }
      return d.outbox.add(bundle, body.made);
    },
    flush: () => d.outbox.flush(),
    kept: () => d.outbox.pending(),
    discard: key => d.outbox.discard(key),
    async remove(id) {
      await d.api.remove(id);
      outcomes.delete(id);
    },
    async removeAll() {
      const n = await d.api.removeAll();
      outcomes.clear();
      return n;
    },
    lock() {
      d.vault.clear();
      outcomes.clear();
      unlocked = false;
    },
  };
}
```

- [ ] **Step 4: Run the tests** — `node --test workroom/test/notes-session.test.ts workroom/test/no-storage.test.ts` — PASS (each unlock runs 600,000 PBKDF2 rounds; the file takes a few seconds). Rebuild and `--check` — exit 0.

- [ ] **Step 5: Commit** — "Music workroom: the notes session (unlock, open, send, delete)" with the trailers.

### Task 10: How to read the answering parts: guide parts and legends

**Files:**
- Modify: `games/workroom/src/guide.ts`, `games/workroom/src/tabs.ts`
- Test: `games/workroom/test/guide-answer.test.ts`

**Interfaces:**
- Consumes: `NoteMark` (Task 3), `ENERGY_EDIT_H` (Task 4), `layoutTimeline`, `TIMELINE` (`timeline.ts`).
- Produces:

```ts
// src/guide.ts
export type GuideView = Tab | 'energy';                       // GuideStore.seen/markSeen take a GuideView
export type GuideAnchor = 'view' | 'lane-picker' | 'sheet' | 'energy-editor' | 'energy-actions';
export interface GuideInput { /* …existing… */ marks?: readonly NoteMark[] }  // the Story guide adds "Your notes" when one is on screen
export function energyGuideParts(i: { score: Score; tempo: TempoMap; view: View }): GuidePart[]; // ids energy-now, energy-draw, ruler, energy-send
// src/tabs.ts
export function legendFor(tab: Tab, score: Score, opts?: { notes?: boolean }): readonly string[]; // Story + notes: adds 'outline = your note'
export function energyLegend(score: Score): readonly string[];
```

The guide flag for the energy drawing is `workroom-guide-energy` (music) and `workroom-guide-sound-energy` (sound), from the existing key rule.

- [ ] **Step 1: Write the failing test** (`test/guide-answer.test.ts`):

```ts
// The answering parts explain themselves: the energy drawing has its own guide
// and legend, and the Story guide and legend name the owner's notes once some
// are drawn.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { memoryStorage } from '../../_kit/test/record.ts';
import { AXIS_H } from '../src/axis.ts';
import { ENERGY_EDIT_H } from '../src/energy.ts';
import { energyGuideParts, guideParts, guideStore } from '../src/guide.ts';
import type { Score } from '../src/score.ts';
import { energyLegend, legendFor } from '../src/tabs.ts';
import { tempoMap } from '../src/tempo.ts';
import { fitView } from '../src/zoom.ts';

const music = JSON.parse(readFileSync(new URL('./fixtures/score-v1.json', import.meta.url), 'utf8')) as Score;
const sound = JSON.parse(readFileSync(new URL('./fixtures/score-sound-v1.json', import.meta.url), 'utf8')) as Score;

test('the energy drawing has four parts on its own anchors, with clips inside the piece', () => {
  for (const score of [music, sound]) {
    const view = fitView(score.duration, 720);
    const parts = energyGuideParts({ score, tempo: tempoMap(score), view });
    assert.deepEqual(parts.map(p => p.id), ['energy-now', 'energy-draw', 'ruler', 'energy-send']);
    assert.deepEqual(parts.map(p => p.spot.anchor), ['energy-editor', 'energy-editor', 'energy-editor', 'energy-actions']);
    assert.deepEqual(parts[2]!.spot.rect, { x: 0, y: ENERGY_EDIT_H, w: 720, h: AXIS_H }, 'the ruler under the drawing');
    for (const p of parts) {
      if (p.clip.kind === 'piece') assert.ok(p.clip.from >= 0 && p.clip.to <= score.duration && p.clip.to > p.clip.from, `${score.kind} ${p.id}`);
      if (p.spot.rect) assert.ok(p.spot.rect.x >= 0 && p.spot.rect.x + p.spot.rect.w <= 720, p.id);
    }
  }
  assert.match(energyGuideParts({ score: sound, tempo: tempoMap(sound), view: fitView(sound.duration, 720) })[0]!.what, /strong/);
});

test('the Story guide adds "Your notes" only when a note is on screen', () => {
  const view = fitView(16, 800);
  const base = { tab: 'story' as const, score: music, tempo: tempoMap(music), view, time: 0 };
  const plain = guideParts(base).map(p => p.id);
  assert.equal(plain.includes('your-notes'), false);
  const parts = guideParts({ ...base, marks: [{ id: 'a'.repeat(32), n: 1, from: 8, to: 12, lane: 'brass', kind: 'text', draft: 1 }] });
  const notes = parts.find(p => p.id === 'your-notes')!;
  assert.deepEqual(parts.map(p => p.id), [...plain.slice(0, plain.indexOf('energy')), 'your-notes', ...plain.slice(plain.indexOf('energy'))]);
  assert.ok(notes.spot.rect && notes.spot.rect.y <= 112 && notes.spot.rect.y + notes.spot.rect.h >= 148, 'the brass row, padded');
  assert.deepEqual(notes.clip, { kind: 'piece', from: 8, to: 12 });
  const off = guideParts({ ...base, view: { start: 0, pxPerSec: 400, width: 800 }, marks: [{ id: 'a'.repeat(32), n: 1, from: 12, to: 14, lane: null, kind: 'text', draft: 1 }] });
  assert.equal(off.some(p => p.id === 'your-notes'), false, 'a note off screen has no part');
});

test('a moment note plays from its moment', () => {
  const parts = guideParts({ tab: 'story', score: music, tempo: tempoMap(music), view: fitView(16, 800), time: 0, marks: [{ id: 'b'.repeat(32), n: 1, from: 6, to: 6, lane: null, kind: 'hum', draft: 1 }] });
  assert.deepEqual(parts.find(p => p.id === 'your-notes')!.clip, { kind: 'piece', from: 6, to: 10 });
});

test('the energy guide opens once per kind of piece, like the views', () => {
  const storage = memoryStorage();
  const g = guideStore(storage);
  assert.equal(g.seen('energy', 'music'), false);
  g.markSeen('energy', 'music');
  g.markSeen('energy', 'sound');
  assert.equal(storage.getItem('workroom-guide-energy'), 'seen');
  assert.equal(storage.getItem('workroom-guide-sound-energy'), 'seen');
});

test('legends: the owner\'s notes on the Story view, and the energy drawing', () => {
  assert.deepEqual(legendFor('story', music, { notes: true }), [...legendFor('story', music), 'outline = your note']);
  assert.deepEqual(legendFor('roll', music, { notes: true }), legendFor('roll', music), 'only the Story view draws notes');
  assert.deepEqual(energyLegend(music), ['dashed = the energy now', 'green = your shape', 'higher = more intense']);
  assert.deepEqual(energyLegend(sound), ['dashed = the strength now', 'green = your shape', 'higher = stronger']);
});
```

- [ ] **Step 2: Run to see it fail** — `node --test workroom/test/guide-answer.test.ts` — FAIL.

- [ ] **Step 3: Implement `guide.ts`.**
  - Imports: `import type { NoteMark } from './answer.ts';`, `import { ENERGY_EDIT_H } from './energy.ts';`, and `TIMELINE` beside `layoutTimeline` from `./timeline.ts`.
  - `export type GuideView = Tab | 'energy';` `GuideAnchor` gains `'energy-editor' | 'energy-actions'`. `GuideInput` gains `marks?: readonly NoteMark[]`. `GuideStore` becomes `{ seen(view: GuideView, kind: Kind): boolean; markSeen(view: GuideView, kind: Kind): void }`, and `guideStore`'s `flag` takes a `GuideView` (the key rule is unchanged: `workroom-guide-<view>`, with `sound-` before the view for a sound piece). Update the doc comment to name the energy drawing.
  - `ruler` gains a fourth parameter `anchor: GuideAnchor = 'view'` and builds its spot as `{ anchor, rect: { x: 0, y: top, w: width, h: AXIS_H } }`.
  - In `story()`, after the `stars` part and before the `energy` part:

```ts
  const lanesTop = TIMELINE.energyH + TIMELINE.sectionH;
  const mark = (i.marks ?? []).map(m => {
    const lane = layout.lanes.find(l => l.id === m.lane);
    const r = { x: timeToX(v, m.from), y: lane ? lane.rect.y : lanesTop, w: Math.max(2, (m.to - m.from) * v.pxPerSec), h: lane ? lane.rect.h : h - lanesTop };
    return { m, r: r.x <= w && r.x + r.w >= 0 ? onDrawing(r, w, h) : null };
  }).find(x => x.r !== null);
  if (mark) {
    parts.push({
      id: 'your-notes', title: 'Your notes',
      what: 'Each dashed outline is a note you pinned: it starts and ends where you picked. A thin line is a note on one moment. The number matches your list of notes.',
      like: 'Like sticky notes on the pages of a book.',
      spot: view(mark.r), clip: pieceClip(mark.m.from, mark.m.to > mark.m.from ? mark.m.to : mark.m.from + CLIP_MAX, score.duration),
    });
  }
```

  - Add `energyGuideParts`:

```ts
/** The energy drawing's parts: the line as it is, how to draw, its ruler, and Send or Start over. */
export function energyGuideParts(i: { score: Score; tempo: TempoMap; view: View }): GuidePart[] {
  const { score } = i;
  const music = score.kind === 'music';
  const w = i.view.width;
  const whole: GuideSpot = { anchor: 'energy-editor', rect: { x: 0, y: 0, w, h: ENERGY_EDIT_H } };
  const peak = score.energy.reduce((best, e) => (e[1] > best[1] ? e : best), score.energy[0] ?? [0, 0]);
  return [
    { id: 'energy-now', title: music ? 'The energy now' : 'The strength now',
      what: music ? 'The dashed line is how intense the music is now: calm at the bottom, most intense at the top.' : 'The dashed line is how strong the sound is now: faint at the bottom, strongest at the top.',
      like: 'Like a skyline drawn over the piece.', spot: whole, clip: pieceClip(peak[0] - CLIP_MAX / 2, peak[0] + CLIP_MAX / 2, score.duration) },
    { id: 'energy-draw', title: 'Draw the shape you want',
      what: `Drag a finger or the mouse across the drawing. ${music ? 'Higher is more intense, lower is calmer.' : 'Higher is stronger, lower is fainter.'} Each stroke replaces the line under it and leaves the rest as it was.`,
      like: 'Like tracing a new skyline over the old one.', spot: whole, clip: { kind: 'demo', id: 'swell' } },
    ruler(score, w, ENERGY_EDIT_H, 'energy-editor'),
    { id: 'energy-send', title: 'Send or start over',
      what: 'Send this shape sends your line to Claude as a note on this draft. Start over brings back the line as it is now.',
      like: 'Like handing over a sketch, or rubbing it out to begin again.', spot: { anchor: 'energy-actions', rect: null }, clip: pieceClip(0, CLIP_MAX, score.duration) },
  ];
}
```

- [ ] **Step 4: Implement `tabs.ts`.** Rename the body of `legendFor` to a private `viewLegend(tab, score)` and export:

```ts
/** The legend for a view of this piece: only what that view draws; the Story view names the owner's notes when it draws some. */
export function legendFor(tab: Tab, score: Score, opts: { notes?: boolean } = {}): readonly string[] {
  const items = viewLegend(tab, score);
  return tab === 'story' && opts.notes ? [...items, 'outline = your note'] : items;
}

/** The energy drawing's legend. */
export function energyLegend(score: Score): readonly string[] {
  return score.kind === 'music'
    ? ['dashed = the energy now', 'green = your shape', 'higher = more intense']
    : ['dashed = the strength now', 'green = your shape', 'higher = stronger'];
}
```

- [ ] **Step 5: Run the tests** — `node --test workroom/test/guide-answer.test.ts workroom/test/guide.test.ts workroom/test/console.test.ts workroom/test/workroom.test.ts workroom/test/guide-overlay.test.ts` — PASS; rebuild and `--check` — exit 0.

- [ ] **Step 6: Commit** — "Music workroom: how to read the energy drawing and the owner's notes" with the trailers.

### Task 11: The unlock form, the history and the notes panel

**Files:**
- Create: `games/workroom/src/ui/UnlockPanel.tsx`, `src/ui/History.tsx`, `src/ui/Answers.tsx`
- Modify: `games/workroom/src/tsconfig.dom.json` (the three files)
- Test: `games/workroom/test/answering-views.test.ts`

**Interfaces:**
- Consumes: `NotesSession`, `UNLOCK_MESSAGES` (Task 9); `HistoryItem`, `forPiece`, `timelineMarks`, `answeredBy` (Task 8); `Pending`, `KEPT_MESSAGES` (Task 7); `SignedOut` (Task 6); `KIND_LABELS`, `REACTION_LABELS`, `spanLabel` (Task 3); `Button` (with `submit`), `Chip`, `Panel` (Task 2).
- Produces:

```tsx
export function UnlockPanel(p: { busy: boolean; error: string | null; onUnlock(passphrase: string): void }): JSX.Element;
export interface HistoryProps {
  items: readonly HistoryItem[];  // already in scope; Delete, Delete all and Discard each ask first (“Delete it” / “Delete all 12 notes” / “Discard this note”, with Keep), all plain secondary buttons
  total: number;                  // every note on the server (Delete all)
  scope: 'piece' | 'all'; onScope(s: 'piece' | 'all'): void;
  version: number;                // the draft on screen
  laneName(id: string): string | null;
  numberOf(id: string): number | null;   // the note's number on the Story view
  answers(id: string): string | null;    // "Answered in this draft: change 2"
  kept: readonly Pending[]; busy: boolean;
  onDelete(id: string): void; onDeleteAll(): void; onDiscard(key: string): void; onRetry(): void;
}
export function History(p: HistoryProps): JSX.Element;
export function Kept(p: { kept: readonly Pending[]; busy: boolean; onDiscard(key: string): void; onRetry(): void }): JSX.Element | null;
export interface AnswersProps { notes: NotesSession; score: Score; version: number; refresh: number; onItems(items: readonly HistoryItem[]): void }
/** The "Your notes" panel (accessible name “Notes & answers”): the unlock form until unlocked, then the history; the notes not sent yet either way. Flushes the outbox on mount and whenever the browser comes back online. */
export function Answers(p: AnswersProps): JSX.Element;
```

- [ ] **Step 1: Write the failing test** (`test/answering-views.test.ts`):

```ts
// The notes panel: the unlock form suits a password manager and keeps nothing;
// the history says waiting or picked up, names a damaged note, marks another
// draft, plays a recording; Delete, Delete all and Discard each ask first, in
// words that name what goes, and none is red; the notes not sent yet say why.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { h, render } from 'preact';
import { act } from 'preact/test-utils';
import { fire, installDocument, makeEl, document as stubDocument, renderTarget, walk } from '../../_kit/test/dom-stub.ts';
import type { StubElement } from '../../_kit/test/dom-stub.ts';
import { importTsx } from '../../_kit/test/tsx.ts';
import type { ComponentChild } from 'preact';
import type { HistoryItem } from '../src/history.ts';
import type { NoteBody } from '../src/note.ts';
import type { NotesSession } from '../src/notes-session.ts';
import { KEPT_MESSAGES } from '../src/outbox.ts';
import type { Pending } from '../src/outbox.ts';
import type { Score } from '../src/score.ts';

installDocument();
// Every key listener the panel puts on the window or the document, so the Escape test can press Escape at each.
const keyListeners: unknown[] = [];
const listen = (type: string, f: unknown): void => { if (type.startsWith('key')) keyListeners.push(f); };
Object.assign(globalThis, { window: { addEventListener: listen, removeEventListener() {} } });
const addToDocument = stubDocument.addEventListener;
stubDocument.addEventListener = (type, f) => { listen(type, f); addToDocument(type, f); };
const ui = await importTsx<{
  unlock: typeof import('../src/ui/UnlockPanel.tsx');
  history: typeof import('../src/ui/History.tsx');
  answers: typeof import('../src/ui/Answers.tsx');
}>(import.meta.dirname, { unlock: '../src/ui/UnlockPanel.tsx', history: '../src/ui/History.tsx', answers: '../src/ui/Answers.tsx' });

const score = JSON.parse(readFileSync(new URL('./fixtures/score-v1.json', import.meta.url), 'utf8')) as Score;
const button = (root: StubElement, text: string) => walk(root).find(e => e.localName === 'button' && e.textContent === text);
const byAttr = (root: StubElement, name: string, value?: string) => walk(root).find(e => (value === undefined ? e._attrs[name] !== undefined : e._attrs[name] === value));
const settle = async (): Promise<void> => { for (let i = 0; i < 20; i++) await act(async () => { await new Promise(r => setImmediate(r)); }); };
const mount = async (vnode: ComponentChild): Promise<StubElement> => { const root = makeEl('root'); await act(() => { render(vnode, renderTarget(root)); }); return root; };
const body = (extra: Partial<NoteBody> = {}): NoteBody => ({ v: 1, kind: 'text', piece: 'test-piece', draft: 1, from: 8, to: 12, fromBar: 5, toBar: 6, lane: 'brass', text: 'louder here', reaction: null, curve: null, audio: null, made: '2026-10-20T00:00:00.000Z', ...extra });
const item = (c: string, extra: Partial<HistoryItem> = {}, b: Partial<NoteBody> = {}): HistoryItem => ({ id: c.repeat(32), arrived: 1_760_000_000, pickedUp: null, state: 'waiting', opened: { fingerprint: 'ab'.repeat(32), body: body(b), audio: null }, problem: null, ...extra });
const historyProps = (extra: Record<string, unknown> = {}) => ({
  items: [] as HistoryItem[], total: 0, scope: 'piece' as const, onScope: () => {}, version: 1, laneName: (id: string) => (id === 'brass' ? 'Brass' : null),
  numberOf: () => null, answers: () => null, kept: [] as Pending[], busy: false, onDelete: () => {}, onDeleteAll: () => {}, onDiscard: () => {}, onRetry: () => {}, ...extra,
});

test('the unlock form suits a password manager, offers nothing to remember, and clears the field', async () => {
  const calls: string[] = [];
  const root = await mount(h(ui.unlock.UnlockPanel, { busy: false, error: null, onUnlock: (p: string) => calls.push(p) }));
  const pass = byAttr(root, 'autocomplete', 'current-password')!;
  assert.equal(pass._attrs['type'], 'password');
  assert.ok(byAttr(root, 'autocomplete', 'username'));
  assert.equal(walk(root).some(e => e._attrs['type'] === 'checkbox'), false, 'no remember-this-device box');
  assert.doesNotMatch(root.textContent, /remember|forget/i);
  pass.value = 'secret words';
  await act(() => { fire(pass, 'input'); });
  const submit = walk(root).find(e => e.localName === 'button')!;
  assert.equal(submit._attrs['type'], 'submit');
  assert.equal(submit.textContent, 'Unlock notes');
  await act(() => { fire(walk(root).find(e => e.localName === 'form')!, 'submit'); });
  assert.deepEqual(calls, ['secret words']);
  assert.equal(pass.value, '', 'the passphrase does not stay in the page');
});

test('a wrong passphrase is shown, not thrown', async () => {
  const root = await mount(h(ui.unlock.UnlockPanel, { busy: false, error: 'That passphrase did not unlock the key.', onUnlock: () => {} }));
  assert.equal(byAttr(root, 'role', 'alert')!.textContent, 'That passphrase did not unlock the key.');
});

test('each note: when, waiting or picked up, its words, where, another draft, a problem; Delete asks first', async () => {
  const deleted: string[] = [];
  const items = [
    item('a', {}, { draft: 2 }),
    item('b', { state: 'picked-up', pickedUp: 1_760_000_100 }, { kind: 'react', text: null, reaction: 'love-it', lane: null }),
    item('c', { opened: null, problem: 'Could not open this note: it was damaged or changed.' }),
  ];
  const root = await mount(h(ui.history.History, historyProps({ items, total: 3, numberOf: (id: string) => (id === 'a'.repeat(32) ? 4 : null), answers: (id: string) => (id === 'a'.repeat(32) ? 'Answered in this draft: change 1' : null), onDelete: (id: string) => deleted.push(id) })));
  const notes = walk(root).filter(e => e._attrs['data-note'] !== undefined);
  assert.deepEqual(notes.map(n => byAttr(n, 'data-state')!.textContent), ['Waiting', 'Picked up', 'Waiting']);
  assert.match(notes[0]!.textContent, /#4/);
  assert.match(notes[0]!.textContent, /louder here/);
  assert.match(notes[0]!.textContent, /Bars 5–6 · 8 s – 12 s · Brass · draft 2/);
  assert.match(notes[0]!.textContent, /Answered in this draft: change 1/);
  assert.match(notes[1]!.textContent, /Reaction: Love it/);
  assert.match(notes[2]!.textContent, /it was damaged or changed/);
  const del = walk(notes[2]!).find(e => e.localName === 'button')!;
  assert.equal(del.textContent, 'Delete');
  assert.match(del._attrs['aria-label'] ?? '', /^Delete note from /);
  await act(() => { fire(del, 'click'); });
  assert.deepEqual(deleted, [], 'one tap only asks');
  assert.match(notes[2]!.textContent, /Delete this note\? This cannot be undone\./);
  await act(() => { fire(button(notes[2]!, 'Keep it')!, 'click'); });
  assert.deepEqual(deleted, []);
  assert.doesNotMatch(notes[2]!.textContent, /cannot be undone/);
  await act(() => { fire(button(notes[2]!, 'Delete')!, 'click'); });
  await act(() => { fire(button(notes[2]!, 'Delete it')!, 'click'); });
  assert.deepEqual(deleted, ['c'.repeat(32)]);
});

test('a recording plays from a blob: URL', async () => {
  const audio = new Uint8Array([1, 2, 3]);
  const items = [item('d', { opened: { fingerprint: 'ab'.repeat(32), body: body({ kind: 'hum', text: null, audio: { mime: 'audio/mp4', seconds: 2 } }), audio } })];
  const root = await mount(h(ui.history.History, historyProps({ items, total: 1 })));
  await settle();
  const player = byAttr(root, 'data-note-audio')!;
  assert.equal(player.localName, 'audio');
  assert.match(player._attrs['src'] ?? (player as unknown as { src: string }).src, /^blob:/);
});

test('Delete all asks first, names the count on its button, and says it is every piece', async () => {
  let all = 0;
  const root = await mount(h(ui.history.History, historyProps({ items: [item('a'), item('b')], total: 12, onDeleteAll: () => all++ })));
  await act(() => { fire(button(root, 'Delete all')!, 'click'); });
  assert.equal(all, 0);
  assert.match(root.textContent, /Delete all 12 notes, on every piece\? This cannot be undone\./);
  await act(() => { fire(button(root, 'Keep them')!, 'click'); });
  assert.doesNotMatch(root.textContent, /cannot be undone/);
  await act(() => { fire(button(root, 'Delete all')!, 'click'); });
  await act(() => { fire(button(root, 'Delete all 12 notes')!, 'click'); });
  assert.equal(all, 1);
});

test('nothing in the notes panel is red: destructive actions are plain buttons with explicit words', async () => {
  const pending: Pending[] = [{ key: 'k1', bundle: new Uint8Array(1), made: '2026-10-20T00:00:00.000Z', reason: 'offline' }];
  const root = await mount(h(ui.history.History, historyProps({ items: [item('a')], total: 3, kept: pending })));
  await act(() => { fire(button(root, 'Delete all')!, 'click'); });
  await act(() => { fire(button(root, 'Delete')!, 'click'); });
  await act(() => { fire(button(root, 'Discard')!, 'click'); });
  assert.ok(button(root, 'Delete all 3 notes') && button(root, 'Delete it') && button(root, 'Discard this note'));
  assert.doesNotMatch(walk(root).map(e => e._attrs['class'] ?? '').join(' '), /record/, 'red is the colour of recording');
});

test('the scope chips switch between this piece and all pieces', async () => {
  const picked: string[] = [];
  const root = await mount(h(ui.history.History, historyProps({ onScope: (s: string) => picked.push(s) })));
  assert.match(root.textContent, /No notes on this piece yet\./);
  assert.equal(button(root, 'This piece')!._attrs['aria-pressed'], 'true');
  fire(button(root, 'All pieces')!, 'click');
  assert.deepEqual(picked, ['all']);
});

test('notes not sent yet say why; Discard asks first; Try again flushes', async () => {
  const discarded: string[] = [];
  let retries = 0;
  const kept: Pending[] = [{ key: 'k1', bundle: new Uint8Array(1), made: '2026-10-20T00:00:00.000Z', reason: 'offline' }, { key: 'k2', bundle: new Uint8Array(1), made: '2026-10-20T00:00:01.000Z', reason: 'new' }];
  const root = await mount(h(ui.history.Kept, { kept, busy: false, onDiscard: (k: string) => discarded.push(k), onRetry: () => retries++ }));
  assert.match(root.textContent, /Not sent yet/);
  assert.ok(root.textContent.includes(KEPT_MESSAGES.offline));
  assert.match(root.textContent, /Sending…/);
  const first = walk(root).find(e => e._attrs['data-kept-note'] === 'k1')!;
  await act(() => { fire(walk(first).find(e => e.localName === 'button' && e.textContent === 'Discard')!, 'click'); });
  assert.deepEqual(discarded, []);
  await act(() => { fire(button(root, 'Discard this note')!, 'click'); });
  assert.deepEqual(discarded, ['k1']);
  fire(button(root, 'Try again')!, 'click');
  assert.equal(retries, 1);
});

test('the questions that ask before deleting or discarding take no Escape: the question stays until it is answered', async () => {
  const calls: string[] = [];
  const kept: Pending[] = [{ key: 'k1', bundle: new Uint8Array(1), made: '2026-10-20T00:00:00.000Z', reason: 'offline' }];
  const root = await mount(h(ui.history.History, historyProps({ items: [item('a')], total: 4, kept, onDelete: () => calls.push('delete'), onDeleteAll: () => calls.push('all'), onDiscard: () => calls.push('discard') })));
  await act(() => { fire(button(root, 'Delete all')!, 'click'); });
  await act(() => { fire(button(root, 'Delete')!, 'click'); });
  await act(() => { fire(button(root, 'Discard')!, 'click'); });
  assert.equal(walk(root).filter(e => e._attrs['role'] === 'group' && /^Delete/.test(e._attrs['aria-label'] ?? '')).length, 2, 'both questions are open');
  let taken = 0;
  for (const el of [root, ...walk(root)]) for (const type of ['keydown', 'keyup', 'keypress']) fire(el, type, { key: 'Escape', code: 'Escape', keyCode: 27, preventDefault: () => { taken++; }, stopPropagation: () => { taken++; } });
  for (const f of keyListeners) {
    const ev = { type: 'keydown', key: 'Escape', preventDefault: () => { taken++; }, stopPropagation: () => { taken++; } };
    (f as (e: typeof ev) => void)(ev);
  }
  assert.equal(taken, 0);
  assert.ok(button(root, 'Delete all 4 notes') && button(root, 'Delete it') && button(root, 'Discard this note'), 'the questions are still open');
  assert.deepEqual(calls, []);
});

function fakeSession(over: Partial<NotesSession> = {}): NotesSession & { calls: string[] } {
  const calls: string[] = [];
  let open = false;
  return {
    calls, sealing: true,
    unlocked: () => open,
    unlock: async p => { calls.push(`unlock ${p}`); if (p !== 'right') return 'That passphrase did not unlock the key.'; open = true; return null; },
    history: async () => { calls.push('history'); return [item('a'), item('e', {}, { piece: 'other-piece' })]; },
    send: async () => ({ key: 'k', memoryOnly: false, sent: [], kept: [] }),
    flush: async () => { calls.push('flush'); return { sent: [], kept: [] }; },
    kept: async () => [],
    discard: async () => {},
    remove: async id => { calls.push(`remove ${id[0]}`); },
    removeAll: async () => 2,
    lock() {},
    ...over,
  };
}

test('the notes panel: locked it asks for the passphrase and lists nothing; unlocked it lists this piece', async () => {
  const notes = fakeSession();
  const seen: number[] = [];
  const root = await mount(h(ui.answers.Answers, { notes, score, version: 1, refresh: 0, onItems: (i: readonly HistoryItem[]) => seen.push(i.length) }));
  await settle();
  assert.equal(byAttr(root, 'aria-label', 'Notes & answers')!.localName, 'section', 'the panel is "Notes & answers", not the name of the note box');
  assert.ok(byAttr(root, 'autocomplete', 'current-password'));
  assert.doesNotMatch(root.textContent, /Waiting|Picked up|Delete all/);
  assert.deepEqual(notes.calls, ['flush'], 'the outbox is flushed on mount; nothing is listed before an unlock');
  const pass = byAttr(root, 'autocomplete', 'current-password')!;
  pass.value = 'wrong';
  await act(() => { fire(pass, 'input'); });
  await act(() => { fire(walk(root).find(e => e.localName === 'form')!, 'submit'); });
  await settle();
  assert.match(root.textContent, /did not unlock the key/);
  pass.value = 'right';
  await act(() => { fire(pass, 'input'); });
  await act(() => { fire(walk(root).find(e => e.localName === 'form')!, 'submit'); });
  await settle();
  assert.equal(walk(root).filter(e => e._attrs['data-note'] !== undefined).length, 1, 'this piece only');
  assert.deepEqual(seen, [2], 'the Workroom gets every note, for the timeline');
  await act(() => { fire(walk(root).find(e => e.localName === 'button' && e.textContent === 'Delete')!, 'click'); });
  await act(() => { fire(button(root, 'Delete it')!, 'click'); });
  await settle();
  assert.ok(notes.calls.includes('remove a'));
});
```

- [ ] **Step 2: Run to see it fail** — `node --test workroom/test/answering-views.test.ts` — FAIL (no components).

- [ ] **Step 3: Implement `src/ui/UnlockPanel.tsx`:**

```tsx
// The passphrase form that unlocks the notes on this page view. A password
// manager fills it (a username it never shows, and a current-password field).
// Nothing is remembered by the page: the field is cleared on submit and the
// passphrase is asked on every visit. Chrome's own password manager may offer
// to save the pair; the owner dismisses that prompt.
import { useState } from 'preact/hooks';
import { Button } from './console/Button.tsx';

export interface UnlockPanelProps { busy: boolean; error: string | null; onUnlock(passphrase: string): void }

export function UnlockPanel(p: UnlockPanelProps) {
  const [value, setValue] = useState('');
  return (
    <form data-unlock="" class="grid gap-3" onSubmit={e => {
      e.preventDefault();
      const v = value;
      setValue('');
      if (v.trim() !== '') p.onUnlock(v);
    }}>
      <p class="text-sm text-dim">Unlock to read your notes. Your password manager fills the passphrase in; this device never keeps it.</p>
      <input type="text" name="username" autocomplete="username" value="siue-music" readOnly tabIndex={-1} aria-hidden="true" class="sr-only" />
      <label class="grid gap-1 font-mono text-xs tracking-widest text-dim uppercase">Passphrase
        <input type="password" name="password" autocomplete="current-password" required value={value} onInput={e => setValue(e.currentTarget.value)}
          class="min-h-11 rounded-md border border-rule bg-well px-3 font-body text-base tracking-normal text-ink normal-case focus-visible:outline-2 focus-visible:outline-amber" />
      </label>
      {p.error ? <p class="rounded-md border border-amber bg-well p-3 text-sm" role="alert">{p.error}</p> : null}
      <Button variant="primary" submit disabled={p.busy}>{p.busy ? 'Unlocking…' : 'Unlock notes'}</Button>
    </form>
  );
}
```

- [ ] **Step 4: Implement `src/ui/History.tsx`:**

```tsx
// The owner's notes: this piece's or all of them, newest first, each waiting or
// picked up, with its words, its recording, its shape or why it could not be
// opened, and Delete. Delete, Delete all and Discard each ask first, in words
// that name what goes; none is red (red is the colour of recording). Below, the
// notes not sent yet, with why, and Try again.
import { useEffect, useState } from 'preact/hooks';
import { KIND_LABELS, REACTION_LABELS, spanLabel } from '../answer.ts';
import type { HistoryItem } from '../history.ts';
import type { NoteBody } from '../note.ts';
import { KEPT_MESSAGES } from '../outbox.ts';
import type { Pending } from '../outbox.ts';
import { Button } from './console/Button.tsx';
import { Chip } from './console/Chip.tsx';
import { cx } from './console/cx.ts';

export interface HistoryProps {
  items: readonly HistoryItem[];
  total: number;
  scope: 'piece' | 'all';
  onScope(s: 'piece' | 'all'): void;
  version: number;
  laneName(id: string): string | null;
  numberOf(id: string): number | null;
  answers(id: string): string | null;
  kept: readonly Pending[];
  busy: boolean;
  onDelete(id: string): void;
  onDeleteAll(): void;
  onDiscard(key: string): void;
  onRetry(): void;
}

const SMALL_CAPS = 'font-display text-xs font-semibold tracking-widest text-dim uppercase';
const stamp = (d: Date): string => d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
const arrivedAt = (seconds: number): string => stamp(new Date(seconds * 1000));

function NoteAudio(p: { bytes: Uint8Array<ArrayBuffer>; mime: string }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function') return;
    const u = URL.createObjectURL(new Blob([p.bytes], { type: p.mime }));
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [p.bytes, p.mime]);
  return url ? <audio data-note-audio="" controls preload="metadata" src={url} class="w-full" /> : null;
}

/** A small line of the drawn shape, left to right over the piece. */
function Shape(p: { curve: readonly [number, number][] }) {
  const end = p.curve[p.curve.length - 1]?.[0] || 1;
  return (
    <svg data-note-shape="" viewBox="0 0 100 24" preserveAspectRatio="none" class="h-6 w-full" role="img" aria-label={`An energy shape of ${p.curve.length} points`}>
      <polyline class="stroke-go" fill="none" stroke-width={1.5} vector-effect="non-scaling-stroke" points={p.curve.map(([t, v]) => `${(t / end) * 100},${24 - v * 24}`).join(' ')} />
    </svg>
  );
}

function Summary(p: { body: NoteBody; audio: Uint8Array<ArrayBuffer> | null; version: number; lane: string | null }) {
  const b = p.body;
  const head = b.kind === 'react' && b.reaction ? `${KIND_LABELS.react}: ${REACTION_LABELS[b.reaction]}` : KIND_LABELS[b.kind];
  const where = [b.kind === 'energy' ? 'The whole piece' : spanLabel(b), p.lane, b.draft !== p.version ? `draft ${b.draft}` : null].filter(Boolean).join(' · ');
  return (
    <>
      <p class="font-display text-sm font-semibold tracking-wider uppercase">{head}</p>
      <p class="font-mono text-xs text-dim">{where}</p>
      {b.text ? <p class="break-words whitespace-pre-wrap">{b.text}</p> : null}
      {p.audio && b.audio ? <NoteAudio bytes={p.audio} mime={b.audio.mime} /> : null}
      {b.curve ? <Shape curve={b.curve} /> : null}
    </>
  );
}

export function Kept(p: { kept: readonly Pending[]; busy: boolean; onDiscard(key: string): void; onRetry(): void }) {
  const [asking, setAsking] = useState<string | null>(null);
  if (p.kept.length === 0) return null;
  return (
    <div data-kept="" class="grid gap-2">
      <span class={SMALL_CAPS}>Not sent yet</span>
      <ul class="grid gap-2">
        {p.kept.map(k => (
          <li data-kept-note={k.key} class="grid gap-1 rounded-md border border-rule bg-well p-3">
            <span class="font-mono text-xs text-dim">Made {stamp(new Date(k.made))}</span>
            <p class="text-sm">{k.reason === 'new' ? 'Sending…' : KEPT_MESSAGES[k.reason]}</p>
            {asking === k.key ? (
              <div class="flex flex-wrap gap-2">
                <Button disabled={p.busy} onClick={() => { setAsking(null); p.onDiscard(k.key); }}>Discard this note</Button>
                <Button variant="ghost" onClick={() => setAsking(null)}>Keep it</Button>
              </div>
            ) : <div class="flex justify-end"><Button variant="ghost" disabled={p.busy} onClick={() => setAsking(k.key)}>Discard</Button></div>}
          </li>
        ))}
      </ul>
      <Button disabled={p.busy} onClick={p.onRetry}>Try again</Button>
    </div>
  );
}

const deleteAllQuestion = (n: number): string => (n === 1 ? 'Delete the one note? This cannot be undone.' : `Delete all ${n} notes, on every piece? This cannot be undone.`);
const deleteAllLabel = (n: number): string => (n === 1 ? 'Delete the one note' : `Delete all ${n} notes`);

export function History(p: HistoryProps) {
  const [asking, setAsking] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  return (
    <div data-history="" class="grid gap-3">
      <div class="flex flex-wrap gap-2" role="group" aria-label="Which notes">
        <Chip pressed={p.scope === 'piece'} onClick={() => p.onScope('piece')}>This piece</Chip>
        <Chip pressed={p.scope === 'all'} onClick={() => p.onScope('all')}>All pieces</Chip>
      </div>
      {p.items.length === 0 ? <p class="empty">{p.scope === 'piece' ? 'No notes on this piece yet.' : 'No notes yet.'}</p> : (
        <ol class="grid gap-3" aria-label="Notes">
          {p.items.map(i => {
            const n = p.numberOf(i.id);
            const answered = p.answers(i.id);
            return (
              <li data-note={i.id} class="grid gap-1 rounded-md border border-rule bg-well p-3">
                <div class="flex flex-wrap items-center justify-between gap-2">
                  <span class="font-mono text-xs text-dim">{n !== null ? `#${n} · ` : ''}{arrivedAt(i.arrived)}</span>
                  <span data-state={i.state} class={cx('font-mono text-xs tracking-widest uppercase', i.state === 'waiting' ? 'text-amber' : 'text-go')}>{i.state === 'waiting' ? 'Waiting' : 'Picked up'}</span>
                </div>
                {i.opened
                  ? <Summary body={i.opened.body} audio={i.opened.audio} version={p.version} lane={i.opened.body.lane ? p.laneName(i.opened.body.lane) : null} />
                  : <p class="text-sm text-dim">{i.problem ?? 'Opening…'}</p>}
                {answered ? <p class="text-sm text-amber">{answered}</p> : null}
                {deleting === i.id ? (
                  <div role="group" aria-label={`Delete note from ${arrivedAt(i.arrived)}`} class="grid gap-2 rounded-md border border-amber p-3">
                    <p>Delete this note? This cannot be undone.</p>
                    <div class="flex flex-wrap gap-2">
                      <Button disabled={p.busy} onClick={() => { setDeleting(null); p.onDelete(i.id); }}>Delete it</Button>
                      <Button variant="ghost" onClick={() => setDeleting(null)}>Keep it</Button>
                    </div>
                  </div>
                ) : (
                  <div class="flex justify-end">
                    <Button variant="ghost" label={`Delete note from ${arrivedAt(i.arrived)}`} disabled={p.busy} onClick={() => setDeleting(i.id)}>Delete</Button>
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      )}
      {p.total > 0 ? (asking ? (
        <div role="group" aria-label="Delete all notes" class="grid gap-2 rounded-md border border-amber p-3">
          <p>{deleteAllQuestion(p.total)}</p>
          <div class="flex flex-wrap gap-2">
            <Button disabled={p.busy} onClick={() => { setAsking(false); p.onDeleteAll(); }}>{deleteAllLabel(p.total)}</Button>
            <Button variant="ghost" onClick={() => setAsking(false)}>Keep them</Button>
          </div>
        </div>
      ) : <Button disabled={p.busy} onClick={() => setAsking(true)}>Delete all</Button>) : null}
      <Kept kept={p.kept} busy={p.busy} onDiscard={p.onDiscard} onRetry={p.onRetry} />
    </div>
  );
}
```

- [ ] **Step 5: Implement `src/ui/Answers.tsx`:**

```tsx
// "Your notes" in the notes panel: the unlock form until the notes are
// unlocked, then the history of this piece (or all pieces). The notes not sent
// yet are listed either way. The outbox is flushed when the panel opens and
// whenever the browser comes back online.
import { useEffect, useState } from 'preact/hooks';
import { SignedOut } from '../api.ts';
import { answeredBy, forPiece, timelineMarks } from '../history.ts';
import type { HistoryItem } from '../history.ts';
import { UNLOCK_MESSAGES } from '../notes-session.ts';
import type { NotesSession } from '../notes-session.ts';
import type { Pending } from '../outbox.ts';
import type { Score } from '../score.ts';
import { Panel } from './console/Panel.tsx';
import { History, Kept } from './History.tsx';
import { UnlockPanel } from './UnlockPanel.tsx';

export interface AnswersProps { notes: NotesSession; score: Score; version: number; refresh: number; onItems(items: readonly HistoryItem[]): void }

const problemOf = (e: unknown): string => (e instanceof SignedOut ? UNLOCK_MESSAGES.signedOut : UNLOCK_MESSAGES.offline);

export function Answers(p: AnswersProps) {
  const [unlocked, setUnlocked] = useState(p.notes.unlocked());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<readonly HistoryItem[]>([]);
  const [kept, setKept] = useState<readonly Pending[]>([]);
  const [scope, setScope] = useState<'piece' | 'all'>('piece');

  const load = async (): Promise<void> => {
    setKept(await p.notes.kept());
    if (!p.notes.unlocked()) return;
    try {
      const all = await p.notes.history();
      setItems(all);
      p.onItems(all);
      setError(null);
    } catch (e) {
      setError(problemOf(e));
    }
  };
  const act = async (work: () => Promise<unknown>): Promise<void> => {
    setBusy(true);
    try { await work(); } catch (e) { setError(problemOf(e)); } finally { setBusy(false); }
    await load();
  };
  useEffect(() => { void load(); }, [p.refresh]);
  useEffect(() => {
    void p.notes.flush().then(load, load);
    const again = (): void => { void p.notes.flush().then(load, load); };
    window.addEventListener('online', again);
    return () => window.removeEventListener('online', again);
  }, [p.notes]);

  const unlock = async (passphrase: string): Promise<void> => {
    setBusy(true);
    setError(null);
    const problem = await p.notes.unlock(passphrase);
    setBusy(false);
    if (problem) { setError(problem); return; }
    setUnlocked(true);
    await load();
  };

  const piece = p.score.piece.id;
  const numbers = new Map(timelineMarks(items, piece, p.score.duration).map(m => [m.id, m.n]));
  const keptList = <Kept kept={kept} busy={busy} onDiscard={key => void act(() => p.notes.discard(key))} onRetry={() => void act(() => p.notes.flush())} />;
  return (
    <Panel title="Your notes" label="Notes & answers" class="grid gap-3" data={{ 'data-answers': '' }}>
      {!unlocked ? (
        <>
          <UnlockPanel busy={busy} error={error} onUnlock={pass => void unlock(pass)} />
          {keptList}
        </>
      ) : (
        <>
          {error ? <p class="rounded-md border border-amber bg-well p-3 text-sm" role="alert">{error}</p> : null}
          <History items={scope === 'piece' ? forPiece(items, piece) : items} total={items.length} scope={scope} onScope={setScope} version={p.version}
            laneName={id => p.score.lanes.find(l => l.id === id)?.name ?? null}
            numberOf={id => numbers.get(id) ?? null}
            answers={id => { const k = answeredBy(p.score.changes, id); return k.length ? `Answered in this draft: ${k.map(i => `change ${i + 1}`).join(', ')}` : null; }}
            kept={kept} busy={busy}
            onDelete={id => void act(() => p.notes.remove(id))}
            onDeleteAll={() => void act(() => p.notes.removeAll())}
            onDiscard={key => void act(() => p.notes.discard(key))}
            onRetry={() => void act(() => p.notes.flush())} />
        </>
      )}
    </Panel>
  );
}
```

  Add `"ui/UnlockPanel.tsx", "ui/History.tsx", "ui/Answers.tsx"` to `src/tsconfig.dom.json`'s `files`.

- [ ] **Step 6: Run the tests** — `node --test workroom/test/answering-views.test.ts workroom/test/tokens.test.ts` — PASS (the token test scans the new files for colour literals). Rebuild and `--check` — exit 0.

- [ ] **Step 7: Commit** — "Music workroom: unlock, the note history and the notes not sent yet" with the trailers.

### Task 12: The composers: a pinned note, a recording button, reactions

**Files:**
- Create: `games/workroom/src/ui/PinComposer.tsx`, `src/ui/RecordButton.tsx`, `src/ui/ReactBar.tsx`
- Modify: `games/workroom/src/tsconfig.dom.json` (the three files)
- Test: `games/workroom/test/composers.test.ts`

**Interfaces:**
- Consumes: `Span` (`hit.ts`); `REACTIONS`, `recordClock`, `spanLabel` (Task 3); `MAX_TEXT`, `Reaction` (`note.ts`); `Section` (`score.ts`); `Button`.
- Produces:

```tsx
export function RecordButton(p: { recording: boolean; seconds: number; disabled?: boolean; idle?: string; onStart(): void; onStop(): void }): JSX.Element;
  // idle text (default "Hum it"); recording: "Stop (0:12 of 1:00)", the record variant, aria-pressed. The answer bar's dock shows the Stop.
export interface PinComposerProps {
  span: Span | null; laneName: string | null; recording: boolean; canRecord: boolean; busy: boolean;
  status: string | null;                      // what became of the last send, in the composer where the owner is looking (role="status")
  onSend(text: string): Promise<boolean>;     // true once the note is stored; false leaves the words in the box
  onRecord(): void; onCancel(): void;
}
export function PinComposer(p: PinComposerProps): JSX.Element;
  // "Drag across the Story view to pick a span, or tap one moment." until a span is set, then "For Bars 5–7 · 8 s – 13.6 s · Horns" (the lane's name);
  // a textarea inside <label>Your note</label> (maxlength 4000; "N characters left" from the last 500, i.e. from 3,500 characters), Send (disabled until a span AND words),
  // Record (when the browser can record; disabled until a span; "Recording…" and disabled while one runs; its Stop is in the dock), Cancel.
  // The words are cleared only after onSend resolves true.
export function ReactBar(p: { section: Section; whole: boolean; busy: boolean; onReact(r: Reaction): void }): JSX.Element;
  // "React to: <section name>" or "React to the whole piece"; the eight reactions, nothing else
```

- [ ] **Step 1: Write the failing test** (`test/composers.test.ts`):

```ts
// The composers are thin: Send waits for a span and words and keeps the words
// until the note is stored; Record waits for a span; a recording shows its
// clock against the minute; the eight reactions and nothing else; and no
// control answers Escape, to the element or to any window or document key listener.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { h, render } from 'preact';
import type { ComponentChild } from 'preact';
import { act } from 'preact/test-utils';
import { fire, installDocument, makeEl, document as stubDocument, renderTarget, walk } from '../../_kit/test/dom-stub.ts';
import type { StubElement } from '../../_kit/test/dom-stub.ts';
import { importTsx } from '../../_kit/test/tsx.ts';
import type { Score } from '../src/score.ts';

installDocument();
// Every key listener the components put on the window or the document, so the Escape test can press Escape at each.
const keyListeners: unknown[] = [];
const listen = (type: string, f: unknown): void => { if (type.startsWith('key')) keyListeners.push(f); };
Object.assign(globalThis, { window: { addEventListener: listen, removeEventListener() {} } });
const addToDocument = stubDocument.addEventListener;
stubDocument.addEventListener = (type, f) => { listen(type, f); addToDocument(type, f); };
const ui = await importTsx<{
  pin: typeof import('../src/ui/PinComposer.tsx');
  rec: typeof import('../src/ui/RecordButton.tsx');
  react: typeof import('../src/ui/ReactBar.tsx');
}>(import.meta.dirname, { pin: '../src/ui/PinComposer.tsx', rec: '../src/ui/RecordButton.tsx', react: '../src/ui/ReactBar.tsx' });
const score = JSON.parse(readFileSync(new URL('./fixtures/score-v1.json', import.meta.url), 'utf8')) as Score;
const buttons = (root: StubElement) => walk(root).filter(e => e.localName === 'button');
const button = (root: StubElement, text: string) => buttons(root).find(e => e.textContent === text);
const mountInto = async (target: StubElement, vnode: ComponentChild): Promise<void> => { await act(() => { render(vnode, renderTarget(target)); }); };
const settle = async (): Promise<void> => { for (let i = 0; i < 5; i++) await act(async () => { await new Promise(r => setImmediate(r)); }); };

const span = { from: 8, to: 13.6, fromBar: 5, toBar: 7, laneId: 'brass' };
const pinProps = (extra: Record<string, unknown> = {}) => ({ span: null, laneName: null, recording: false, canRecord: true, busy: false, status: null, onSend: async () => true, onRecord: () => {}, onCancel: () => {}, ...extra });

test('Send waits for a span and words, sends the words, and clears the box once the note is stored', async () => {
  const root = makeEl('root');
  const sent: string[] = [];
  const onSend = async (t: string): Promise<boolean> => { sent.push(t); return true; };
  await mountInto(root, h(ui.pin.PinComposer, pinProps({ onSend })));
  assert.match(root.textContent, /Drag across the Story view to pick a span, or tap one moment\./);
  assert.equal(button(root, 'Send')!.disabled, true, 'no span yet');
  assert.equal(button(root, 'Record')!.disabled, true, 'nothing to record against yet');
  await mountInto(root, h(ui.pin.PinComposer, pinProps({ span, laneName: 'Horns', onSend })));
  assert.match(root.textContent, /For Bars 5–7 · 8 s – 13\.6 s · Horns/);
  assert.equal(button(root, 'Send')!.disabled, true, 'a span but no words');
  const box = walk(root).find(e => e.localName === 'textarea')!;
  assert.equal(box._attrs['maxLength'], '4000');
  box.value = '   ';
  await act(() => { fire(box, 'input'); });
  assert.equal(button(root, 'Send')!.disabled, true, 'spaces are not words');
  box.value = 'louder and slower right here';
  await act(() => { fire(box, 'input'); });
  assert.equal(button(root, 'Send')!.disabled, false);
  await act(() => { fire(button(root, 'Send')!, 'click'); });
  await settle();
  assert.deepEqual(sent, ['louder and slower right here']);
  assert.equal(box.value, '');
});

test('a note that was not stored keeps its words in the box', async () => {
  const root = makeEl('root');
  await mountInto(root, h(ui.pin.PinComposer, pinProps({ span, onSend: async () => false })));
  const box = walk(root).find(e => e.localName === 'textarea')!;
  box.value = 'do not lose me';
  await act(() => { fire(box, 'input'); });
  await act(() => { fire(button(root, 'Send')!, 'click'); });
  await settle();
  assert.equal(box.value, 'do not lose me');
  assert.equal(button(root, 'Send')!.disabled, false, 'it can be sent again');
});

test('the box is the textbox "Your note", and the composer shows what became of the last send', async () => {
  const root = makeEl('root');
  await mountInto(root, h(ui.pin.PinComposer, pinProps({ span, status: 'No connection: this note is kept on this device.' })));
  const label = walk(root).find(e => e.localName === 'label')!;
  assert.match(label.textContent, /^Your note/);
  assert.equal(walk(label).filter(e => e.localName === 'textarea').length, 1);
  assert.equal(walk(root).find(e => e._attrs['role'] === 'status')!.textContent, 'No connection: this note is kept on this device.');
});

test('the characters left show from the last 500 and count down', async () => {
  const root = makeEl('root');
  await mountInto(root, h(ui.pin.PinComposer, pinProps({ span })));
  const box = walk(root).find(e => e.localName === 'textarea')!;
  for (const [length, shown] of [[3499, null], [3500, '500 characters left'], [3700, '300 characters left']] as const) {
    box.value = 'x'.repeat(length);
    await act(() => { fire(box, 'input'); });
    if (shown === null) assert.doesNotMatch(root.textContent, /characters left/, `${length} characters`);
    else assert.match(root.textContent, new RegExp(shown), `${length} characters`);
  }
});

test('recording: Record starts it; while it runs the composer says so and offers no second recording', async () => {
  const root = makeEl('root');
  const calls: string[] = [];
  await mountInto(root, h(ui.pin.PinComposer, pinProps({ span, onRecord: () => calls.push('record') })));
  fire(button(root, 'Record')!, 'click');
  await mountInto(root, h(ui.pin.PinComposer, pinProps({ span, recording: true, onRecord: () => calls.push('record') })));
  assert.equal(button(root, 'Recording…')!.disabled, true);
  assert.equal(button(root, 'Send')!.disabled, true, 'no sending while recording');
  assert.equal(buttons(root).some(b => /^Stop/.test(b.textContent)), false, 'Stop lives in the answer bar\'s dock');
  assert.deepEqual(calls, ['record']);
  await mountInto(root, h(ui.pin.PinComposer, pinProps({ span, canRecord: false })));
  assert.equal(button(root, 'Record'), undefined);
});

test('Hum it is a record button with its own clock', async () => {
  const root = makeEl('root');
  let started = 0;
  await mountInto(root, h(ui.rec.RecordButton, { recording: false, seconds: 0, onStart: () => started++, onStop: () => {} }));
  fire(button(root, 'Hum it')!, 'click');
  assert.equal(started, 1);
  await mountInto(root, h(ui.rec.RecordButton, { recording: true, seconds: 12.4, onStart: () => {}, onStop: () => {} }));
  const stop = button(root, 'Stop (0:12 of 1:00)')!;
  assert.equal(stop._attrs['aria-pressed'], 'true');
  assert.ok((stop._attrs['class'] ?? stop.className).includes('bg-record'));
  await mountInto(root, h(ui.rec.RecordButton, { recording: true, seconds: 61, onStart: () => {}, onStop: () => {} }));
  assert.ok(button(root, 'Stop (1:00 of 1:00)'), 'the clock stops at the minute');
});

test('eight reactions on a section, and the whole piece when there is none', async () => {
  const root = makeEl('root');
  const got: string[] = [];
  await mountInto(root, h(ui.react.ReactBar, { section: score.sections[1]!, whole: false, busy: false, onReact: (r: string) => got.push(r) }));
  assert.match(root.textContent, /React to: Ariadne's thread/);
  assert.equal(buttons(root).length, 8);
  for (const b of buttons(root)) assert.ok((b._attrs['class'] ?? b.className).includes('min-h-11'));
  fire(button(root, 'Love it')!, 'click');
  assert.deepEqual(got, ['love-it']);
  await mountInto(root, h(ui.react.ReactBar, { section: score.sections[0]!, whole: true, busy: false, onReact: () => {} }));
  assert.match(root.textContent, /React to the whole piece/);
});

test('no composer takes Escape: not on any of its elements, nor at any window or document key listener', async () => {
  const calls: string[] = [];
  const root = makeEl('root');
  const mounts: ComponentChild[] = [
    h(ui.pin.PinComposer, pinProps({ span, onRecord: () => calls.push('record'), onCancel: () => calls.push('cancel'), onSend: async () => { calls.push('send'); return true; } })),
    h(ui.pin.PinComposer, pinProps({ span, recording: true, onCancel: () => calls.push('cancel') })),
    h(ui.rec.RecordButton, { recording: true, seconds: 3, onStart: () => calls.push('start'), onStop: () => calls.push('stop') }),
    h(ui.react.ReactBar, { section: score.sections[1]!, whole: false, busy: false, onReact: () => calls.push('react') }),
  ];
  for (const vnode of mounts) {
    await mountInto(root, vnode);
    const before = walk(root).length;
    let taken = 0;
    for (const el of [root, ...walk(root)]) {
      for (const type of ['keydown', 'keyup', 'keypress']) {
        const ev = { key: 'Escape', code: 'Escape', keyCode: 27, preventDefault: () => { taken++; }, stopPropagation: () => { taken++; } };
        fire(el, type, ev);
      }
    }
    const pressed = keyListeners.map(f => {
      const ev = { type: 'keydown', key: 'Escape', prevented: false, stopped: false, preventDefault() { ev.prevented = true; }, stopPropagation() { ev.stopped = true; } };
      (f as (e: typeof ev) => void)(ev);
      return ev;
    });
    assert.equal(taken, 0, 'no element takes Escape');
    assert.ok(pressed.every(ev => !ev.prevented && !ev.stopped), 'no global key listener takes Escape');
    assert.equal(walk(root).length, before, 'the component is still there');
  }
  assert.deepEqual(calls, [], 'Escape triggered nothing');
});
```


- [ ] **Step 2: Run to see it fail** — `node --test workroom/test/composers.test.ts` — FAIL (no components).

- [ ] **Step 3: Implement `src/ui/RecordButton.tsx`:**

```tsx
// Start or stop a recording: the record colour, and while recording the clock
// against the minute the recorder allows.
import { recordClock } from '../answer.ts';
import { MAX_AUDIO_SECONDS } from '../note.ts';
import { Button } from './console/Button.tsx';

export interface RecordButtonProps { recording: boolean; seconds: number; disabled?: boolean; idle?: string; onStart(): void; onStop(): void }

export function RecordButton(p: RecordButtonProps) {
  return p.recording
    ? <Button variant="record" pressed data={{ 'data-recording': '' }} onClick={p.onStop}>{`Stop (${recordClock(Math.min(p.seconds, MAX_AUDIO_SECONDS))} of ${recordClock(MAX_AUDIO_SECONDS)})`}</Button>
    : <Button variant="record" disabled={p.disabled} onClick={p.onStart}>{p.idle ?? 'Hum it'}</Button>;
}
```

  The label is one template literal, so its `textContent` reads `Stop (0:12 of 1:00)` in one piece; the clock never passes the minute.

- [ ] **Step 4: Implement `src/ui/PinComposer.tsx`:**

```tsx
// Pinning a typed or spoken note on the moment or span picked on the Story
// view (and its lane, when both ends were in one): the words, or a recording.
// The words stay in the box until the sealed note is stored, so a note that
// could not be sealed or kept is never lost. The Stop button of a recording
// lives in the answer bar's dock (AnswerBar.tsx), which is always on screen.
import { useState } from 'preact/hooks';
import { spanLabel } from '../answer.ts';
import type { Span } from '../hit.ts';
import { MAX_TEXT } from '../note.ts';
import { Button } from './console/Button.tsx';

export interface PinComposerProps {
  span: Span | null; laneName: string | null; recording: boolean; canRecord: boolean; busy: boolean;
  /** What became of the last send (or why it failed), shown inside the composer where the owner is looking. */
  status: string | null;
  /** Resolves true once the note is stored; false leaves the words in the box. */
  onSend(text: string): Promise<boolean>;
  onRecord(): void; onCancel(): void;
}

export function PinComposer(p: PinComposerProps) {
  const [text, setText] = useState('');
  const left = MAX_TEXT - text.length;
  const where = p.span ? `For ${spanLabel(p.span)}${p.laneName ? ` · ${p.laneName}` : ''}` : 'Drag across the Story view to pick a span, or tap one moment.';
  return (
    <div data-pin-composer="" class="grid gap-2 rounded-lg border border-amber bg-panel p-3">
      <p data-pin-span="" class="font-mono text-xs text-amber">{where}</p>
      <label class="grid gap-1 font-mono text-xs tracking-widest text-dim uppercase">Your note
        <textarea rows={3} maxLength={MAX_TEXT} value={text} onInput={e => setText(e.currentTarget.value)}
          class="min-h-24 rounded-md border border-rule bg-well p-3 font-body text-base tracking-normal text-ink normal-case focus-visible:outline-2 focus-visible:outline-amber" />
      </label>
      {left <= 500 ? <p class="font-mono text-xs text-dim">{`${left} characters left`}</p> : null}
      <div class="flex flex-wrap gap-2">
        <Button variant="primary" disabled={!p.span || text.trim() === '' || p.busy || p.recording} onClick={() => { void p.onSend(text).then(stored => { if (stored) setText(''); }); }}>Send</Button>
        {p.canRecord ? <Button variant="record" disabled={!p.span || p.busy || p.recording} onClick={p.onRecord}>{p.recording ? 'Recording…' : 'Record'}</Button> : null}
        <Button variant="ghost" onClick={p.onCancel}>Cancel</Button>
      </div>
      <p role="status" data-answer-status="" class="min-h-5 text-sm">{p.status ?? ''}</p>
    </div>
  );
}
```

- [ ] **Step 5: Implement `src/ui/ReactBar.tsx`:**

```tsx
// One tap on a section: the eight reactions, for the section under the
// playhead (or the whole piece when there is none, as on a sound without moments).
import { REACTIONS } from '../answer.ts';
import type { Reaction } from '../note.ts';
import type { Section } from '../score.ts';
import { Button } from './console/Button.tsx';

export interface ReactBarProps { section: Section; whole: boolean; busy: boolean; onReact(r: Reaction): void }

export function ReactBar(p: ReactBarProps) {
  return (
    <div data-react-bar="" class="grid gap-2 rounded-lg border border-amber bg-panel p-3">
      <p class="font-mono text-xs text-amber">{p.whole ? 'React to the whole piece' : `React to: ${p.section.name}`}</p>
      <p class="text-sm text-dim">Move the playhead to react to another part.</p>
      <div role="group" aria-label="Reactions" class="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {REACTIONS.map(r => <Button disabled={p.busy} data={{ 'data-reaction': r.id }} onClick={() => p.onReact(r.id)}>{r.label}</Button>)}
      </div>
    </div>
  );
}
```

  Add the three files to `src/tsconfig.dom.json`'s `files`.

- [ ] **Step 6: Run the tests** — `node --test workroom/test/composers.test.ts workroom/test/tokens.test.ts` — PASS; rebuild and `--check` — exit 0.

- [ ] **Step 7: Commit** — "Music workroom: the note composer, the record button and the reactions" with the trailers.

### Task 13: The energy drawing

**Files:**
- Create: `games/workroom/src/ui/EnergyEditor.tsx`
- Modify: `games/workroom/src/tsconfig.dom.json`
- Test: `games/workroom/test/energy-editor.test.ts`

**Interfaces:**
- Consumes: `ENERGY_EDIT_H`, `redraw`, `strokeFromPixels`, `curveToPixels`, `Curve` (Task 4); `axisTicks` (`axis.ts`); `Axis`, `AXIS_H` (`ui/parts.tsx`); `sectionTimes` (`tempo.ts`); `readableOn` (`color.ts`); `useTheme`; `Button`.
- Produces:

```tsx
export interface EnergyEditorProps { score: Score; tempo: TempoMap; view: View; busy: boolean; onSend(curve: Curve): void; onCancel(): void; onHold?(held: boolean): void } // onHold: true while a stroke is in progress (the playhead's follow is held), false when it ends or is cancelled
/** A 160 px drawing well on the shared view: the energy now dashed, the owner's shape in go, the live stroke in amber, the sections faint, the time axis; Send this shape / Start over / Cancel under it (data-guide="energy-actions"). */
export function EnergyEditor(p: EnergyEditorProps): JSX.Element;
```

- [ ] **Step 1: Write the failing test** (`test/energy-editor.test.ts`):

```ts
// Drawing the energy: the line as it is, dashed; a drag draws the new shape;
// Send this shape waits for a drawing and sends the whole curve; Start over
// brings the line back; a cancelled pointer draws nothing.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { h, render } from 'preact';
import { act } from 'preact/test-utils';
import { fire, installDocument, makeEl, renderTarget, walk } from '../../_kit/test/dom-stub.ts';
import type { StubElement } from '../../_kit/test/dom-stub.ts';
import { importTsx } from '../../_kit/test/tsx.ts';
import type { Score } from '../src/score.ts';
import { tempoMap } from '../src/tempo.ts';
import { fitView } from '../src/zoom.ts';

installDocument();
const ui = await importTsx<{ editor: typeof import('../src/ui/EnergyEditor.tsx') }>(import.meta.dirname, { editor: '../src/ui/EnergyEditor.tsx' });
const score = JSON.parse(readFileSync(new URL('./fixtures/score-v1.json', import.meta.url), 'utf8')) as Score;
const button = (root: StubElement, text: string) => walk(root).find(e => e.localName === 'button' && e.textContent === text)!;
const named = (root: StubElement, attr: string) => walk(root).filter(e => e._attrs[attr] !== undefined);

const mount = async (onSend: (c: [number, number][]) => void = () => {}, onHold?: (held: boolean) => void) => {
  const root = makeEl('root');
  await act(() => { render(h(ui.editor.EnergyEditor, { score, tempo: tempoMap(score), view: fitView(16, 720), busy: false, onSend, onHold, onCancel: () => {} }), renderTarget(root)); });
  return root;
};
const drag = async (svg: StubElement, points: [number, number][], end: 'pointerup' | 'pointercancel' = 'pointerup') => {
  const [first, ...rest] = points;
  await act(() => { fire(svg, 'pointerdown', { pointerId: 1, clientX: first![0], clientY: first![1] }); });
  for (const [x, y] of rest) await act(() => { fire(svg, 'pointermove', { pointerId: 1, clientX: x, clientY: y }); });
  await act(() => { fire(svg, end, { pointerId: 1, clientX: rest.at(-1)![0], clientY: rest.at(-1)![1] }); });
};

test('the drawing shows the energy now and waits for a shape', async () => {
  const root = await mount();
  const svg = named(root, 'data-energy-editor')[0]!;
  assert.equal(svg._attrs['data-guide'], 'energy-editor');
  assert.equal(svg._attrs['height'], String(160 + 20));
  assert.equal(named(root, 'data-energy-now').length, 1);
  assert.equal(named(root, 'data-energy-now')[0]!._attrs['stroke-dasharray'], '6 4');
  assert.equal(named(root, 'data-energy-drawn').length, 0);
  assert.equal(button(root, 'Send this shape').disabled, true);
  assert.equal(named(root, 'data-guide').some(e => e._attrs['data-guide'] === 'energy-actions'), true);
  assert.ok(walk(root).some(e => e._attrs['data-tick'] !== undefined), 'the time axis');
});

test('a drag draws a shape; Send sends the whole curve from 0 to the end', async () => {
  const sent: [number, number][][] = [];
  const root = await mount(c => sent.push(c));
  const svg = named(root, 'data-energy-editor')[0]!;
  await drag(svg, [[180, 150], [270, 80], [360, 10]]);
  assert.equal(named(root, 'data-energy-drawn').length, 1);
  assert.equal(button(root, 'Send this shape').disabled, false);
  await act(() => { fire(button(root, 'Send this shape'), 'click'); });
  const curve = sent[0]!;
  assert.deepEqual([curve[0]![0], curve.at(-1)![0]], [0, 16]);
  assert.ok(curve.some(([t, v]) => t === 8 && Math.abs(v - (1 - 10 / 160)) < 1e-9), 'the stroke is in it');
  assert.ok(curve.every(([, v]) => v >= 0 && v <= 1));
});

test('a stroke in progress holds the playhead\'s follow, and lets go when it ends or is cancelled', async () => {
  const holds: boolean[] = [];
  const root = await mount(() => {}, held => holds.push(held));
  const svg = named(root, 'data-energy-editor')[0]!;
  await act(() => { fire(svg, 'pointerdown', { pointerId: 1, clientX: 100, clientY: 100 }); });
  assert.deepEqual(holds, [true]);
  await act(() => { fire(svg, 'pointermove', { pointerId: 1, clientX: 200, clientY: 60 }); });
  await act(() => { fire(svg, 'pointerup', { pointerId: 1, clientX: 200, clientY: 60 }); });
  assert.deepEqual(holds, [true, false]);
  await act(() => { fire(svg, 'pointerdown', { pointerId: 1, clientX: 100, clientY: 100 }); });
  await act(() => { fire(svg, 'pointercancel', { pointerId: 1 }); });
  assert.deepEqual(holds, [true, false, true, false]);
  await act(() => { fire(svg, 'pointercancel', { pointerId: 1 }); });
  assert.deepEqual(holds, [true, false, true, false], 'a cancel with no stroke holds nothing');
});

test('Start over brings the line back; a cancelled pointer draws nothing', async () => {
  const root = await mount();
  const svg = named(root, 'data-energy-editor')[0]!;
  await drag(svg, [[100, 100], [200, 50]], 'pointercancel');
  assert.equal(named(root, 'data-energy-drawn').length, 0);
  await drag(svg, [[100, 100], [200, 50]]);
  await act(() => { fire(button(root, 'Start over'), 'click'); });
  assert.equal(named(root, 'data-energy-drawn').length, 0);
  assert.equal(button(root, 'Send this shape').disabled, true);
});
```

- [ ] **Step 2: Run to see it fail** — `node --test workroom/test/energy-editor.test.ts` — FAIL.

- [ ] **Step 3: Implement `src/ui/EnergyEditor.tsx`** (and add it to `src/tsconfig.dom.json`):

```tsx
// Drawing the energy the owner wants: a 160 px well over the shared time axis,
// the energy now as a dashed line, each stroke replacing the curve under its
// own time span, the sections faint behind for orientation. Pointer only; the
// buttons under it send the shape, start over or leave. While a stroke is in
// progress it holds the playhead's follow (onHold), as the other views do, so
// playback never scrolls the drawing under the finger.
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { axisTicks } from '../axis.ts';
import { readableOn } from '../color.ts';
import { ENERGY_EDIT_H, curveToPixels, redraw, strokeFromPixels } from '../energy.ts';
import type { Curve } from '../energy.ts';
import type { Score } from '../score.ts';
import { sectionTimes } from '../tempo.ts';
import type { TempoMap } from '../tempo.ts';
import { timeToX } from '../zoom.ts';
import type { View } from '../zoom.ts';
import { Button } from './console/Button.tsx';
import { AXIS_H, Axis } from './parts.tsx';
import { useTheme } from './theme-context.ts';

export interface EnergyEditorProps { score: Score; tempo: TempoMap; view: View; busy: boolean; onSend(curve: Curve): void; onCancel(): void; /** true while a stroke is being drawn, false once it ends or is cancelled. */ onHold?(held: boolean): void }

interface PointerLike { pointerId: number; clientX: number; clientY: number; currentTarget: Element }
const local = (e: PointerLike): [number, number] => {
  const r = e.currentTarget.getBoundingClientRect();
  return [e.clientX - (r.left || 0), e.clientY - (r.top || 0)];
};
const points = (pts: readonly [number, number][]): string => pts.map(([x, y]) => `${x},${y}`).join(' ');
const copy = (c: readonly [number, number][]): Curve => c.map(([t, v]): [number, number] => [t, v]);

export function EnergyEditor(p: EnergyEditorProps) {
  const { score, view } = p;
  const theme = useTheme();
  const [curve, setCurve] = useState<Curve>(() => copy(score.energy));
  const [drawn, setDrawn] = useState(false);
  const [live, setLive] = useState<[number, number][]>([]);
  const stroke = useRef<[number, number][] | null>(null);
  const latest = useRef(p);
  latest.current = p;
  // A drawing left mid-stroke never sees its release.
  useEffect(() => () => { if (stroke.current) latest.current.onHold?.(false); }, []);
  const sections = useMemo(() => score.sections.map(s => ({ ...sectionTimes(s, p.tempo, score.duration), id: s.id, fill: readableOn(theme, s.color, 'mark') })), [score, p.tempo, theme]);
  const height = ENERGY_EDIT_H + AXIS_H;
  const end = (): void => {
    const s = stroke.current;
    stroke.current = null;
    setLive([]);
    if (s) p.onHold?.(false);
    if (!s || s.length === 0) return;
    setCurve(c => redraw(c, strokeFromPixels(s, view), score.duration));
    setDrawn(true);
  };
  return (
    <div class="grid gap-2">
      <svg data-energy-editor="" data-guide="energy-editor" class="block max-w-full cursor-crosshair touch-none select-none" width={view.width} height={height} viewBox={`0 0 ${view.width} ${height}`}
        role="img" aria-label="The energy drawing: drag across it to draw the shape you want"
        onPointerDown={(e: PointerLike) => { e.currentTarget.setPointerCapture?.(e.pointerId); stroke.current = [local(e)]; setLive([local(e)]); p.onHold?.(true); }}
        onPointerMove={(e: PointerLike) => { const s = stroke.current; if (!s) return; s.push(local(e)); setLive(s.slice()); }}
        onPointerUp={end}
        onPointerCancel={() => { if (stroke.current) p.onHold?.(false); stroke.current = null; setLive([]); }}>
        <rect class="fill-well" x={0} y={0} width={view.width} height={ENERGY_EDIT_H} />
        {sections.map(s => <rect class="pointer-events-none opacity-20" data-energy-section={s.id} x={timeToX(view, s.from)} y={0} width={Math.max(0, (s.to - s.from) * view.pxPerSec)} height={ENERGY_EDIT_H} fill={s.fill} />)}
        <polyline data-energy-now="" class="pointer-events-none stroke-dim" fill="none" stroke-width={2} stroke-dasharray="6 4" points={points(curveToPixels(score.energy, view))} />
        {drawn ? <polyline data-energy-drawn="" class="pointer-events-none stroke-go" fill="none" stroke-width={3} stroke-linejoin="round" points={points(curveToPixels(curve, view))} /> : null}
        {live.length > 1 ? <polyline data-energy-stroke="" class="pointer-events-none stroke-amber" fill="none" stroke-width={2} points={points(live)} /> : null}
        <Axis ticks={axisTicks(score, p.tempo, view)} height={ENERGY_EDIT_H} />
      </svg>
      <div data-guide="energy-actions" class="flex flex-wrap gap-2">
        <Button variant="primary" disabled={!drawn || p.busy} onClick={() => p.onSend(curve)}>Send this shape</Button>
        <Button disabled={!drawn} onClick={() => { setCurve(copy(score.energy)); setDrawn(false); }}>Start over</Button>
        <Button variant="ghost" onClick={p.onCancel}>Cancel</Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run the tests** — `node --test workroom/test/energy-editor.test.ts workroom/test/tokens.test.ts` — PASS; rebuild and `--check` — exit 0.

- [ ] **Step 5: Commit** — "Music workroom: drawing the energy" with the trailers.

### Task 14: Picking a span on the Story view, and the owner's notes on it

**Files:**
- Modify: `games/workroom/src/ui/surface.ts`, `games/workroom/src/ui/Timeline.tsx`
- Test: `games/workroom/test/timeline-select.test.ts`

**Interfaces:**
- Consumes: `createGestures(view, bounds, mode)` (`gestures.ts`, already takes the mode); `hitTimeline`, `spanBetween`, `Span` (`hit.ts`); `NoteMark` (Task 3); `TIMELINE` (`timeline.ts`).
- Produces:

```ts
// src/ui/surface.ts: SurfaceProps gains
mode?: 'pan' | 'select';                                                        // default 'pan'
onSelect?(x0: number, x1: number, y0: number, y1: number, done: boolean, cancelled: boolean): void; // from (x0, y0) to where the pointer is now (x1, y1)
onTap?(x: number, y: number): void;                                             // after onSeek
// src/ui/Timeline.tsx
export interface TimelineSelect { span: Span | null; onPick(span: Span | null, done: boolean): void } // null: the preview was cancelled
// TimelineProps gains select?: TimelineSelect (select mode while set) and marks?: readonly NoteMark[]
```

- [ ] **Step 1: Write the failing test** (`test/timeline-select.test.ts`):

```ts
// Pinning on the Story view: in select mode a drag picks a span (bars, seconds
// and the lane when both ends are in one) with a live preview, a tap picks a
// moment and still moves the playhead, a second finger drops the preview; the
// owner's notes are drawn numbered in their lanes.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { h, render } from 'preact';
import { act } from 'preact/test-utils';
import { fire, installDocument, makeEl, renderTarget, walk } from '../../_kit/test/dom-stub.ts';
import type { StubElement } from '../../_kit/test/dom-stub.ts';
import { importTsx } from '../../_kit/test/tsx.ts';
import type { Span } from '../src/hit.ts';
import type { Score } from '../src/score.ts';
import { tempoMap } from '../src/tempo.ts';
import { fitView } from '../src/zoom.ts';

installDocument();
const ui = await importTsx<{ tl: typeof import('../src/ui/Timeline.tsx') }>(import.meta.dirname, { tl: '../src/ui/Timeline.tsx' });
const score = JSON.parse(readFileSync(new URL('./fixtures/score-v1.json', import.meta.url), 'utf8')) as Score;
const close = (a: number, b: number) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≈ ${b}`);

interface Run { root: StubElement; picks: [Span | null, boolean][]; seeks: number[]; views: number }
const mount = async (extra: Record<string, unknown> = {}, select = true): Promise<Run> => {
  const run: Run = { root: makeEl('root'), picks: [], seeks: [], views: 0 };
  await act(() => {
    render(h(ui.tl.Timeline, {
      score, tempo: tempoMap(score), view: fitView(16, 720), time: 0, onSeek: (t: number) => run.seeks.push(t), onView: () => { run.views++; }, onTerm: () => {},
      select: select ? { span: null, onPick: (s: Span | null, done: boolean) => run.picks.push([s, done]) } : undefined, ...extra,
    }), renderTarget(run.root));
  });
  return run;
};
const svgOf = (r: Run) => walk(r.root).find(e => e._attrs['data-timeline'] !== undefined)!;
const at = (x: number, y: number, t: number, id = 1) => ({ pointerId: id, clientX: x, clientY: y, timeStamp: t });

test('a drag in select mode picks a span with its bars and lane, previewed as it goes, and pans nothing', async () => {
  const r = await mount();
  const svg = svgOf(r);
  await act(() => { fire(svg, 'pointerdown', at(360, 120, 0)); });
  await act(() => { fire(svg, 'pointermove', at(500, 120, 50)); });
  await act(() => { fire(svg, 'pointermove', at(612, 120, 100)); });
  await act(() => { fire(svg, 'pointerup', at(612, 120, 150)); });
  assert.equal(r.views, 0);
  assert.ok(r.picks.length >= 2 && r.picks.slice(0, -1).every(([, done]) => !done), 'previews before the end');
  const [span, done] = r.picks.at(-1)!;
  assert.equal(done, true);
  close(span!.from, 8);
  close(span!.to, 13.6);
  assert.deepEqual([span!.fromBar, span!.toBar, span!.laneId], [5, 7, 'brass']);
});

test('a drag keeps the lane only when it starts and ends in the same lane', async () => {
  const r = await mount();
  const svg = svgOf(r);
  await act(() => { fire(svg, 'pointerdown', at(360, 120, 0)); });
  await act(() => { fire(svg, 'pointermove', at(500, 85, 50)); });
  await act(() => { fire(svg, 'pointerup', at(612, 80, 100)); });
  const diagonal = r.picks.at(-1)![0]!;
  assert.deepEqual([diagonal.fromBar, diagonal.toBar, diagonal.laneId], [5, 7, null], 'brass to the strings below: no lane');
  await act(() => { fire(svg, 'pointerdown', at(360, 115, 200)); });
  await act(() => { fire(svg, 'pointermove', at(500, 140, 250)); });
  await act(() => { fire(svg, 'pointerup', at(612, 145, 300)); });
  assert.equal(r.picks.at(-1)![0]!.laneId, 'brass', 'both ends in brass, at different heights: the lane stays');
});

test('a tap in select mode picks a moment and still moves the playhead', async () => {
  const r = await mount();
  const svg = svgOf(r);
  await act(() => { fire(svg, 'pointerdown', at(90, 80, 0)); });
  await act(() => { fire(svg, 'pointerup', at(90, 80, 50)); });
  assert.deepEqual(r.seeks, [2]);
  assert.deepEqual(r.picks, [[{ from: 2, to: 2, fromBar: 2, toBar: 2, laneId: 'strings-low' }, true]]);
});

test('a second finger drops the preview', async () => {
  const r = await mount();
  const svg = svgOf(r);
  await act(() => { fire(svg, 'pointerdown', at(100, 120, 0)); });
  await act(() => { fire(svg, 'pointermove', at(300, 120, 50)); });
  await act(() => { fire(svg, 'pointerdown', at(400, 120, 60, 2)); });
  assert.deepEqual(r.picks.at(-1), [null, true]);
});

test('without select the Story view pans as before', async () => {
  const r = await mount({}, false);
  const svg = svgOf(r);
  await act(() => { fire(svg, 'pointerdown', at(360, 120, 0)); });
  await act(() => { fire(svg, 'pointermove', at(200, 120, 50)); });
  assert.ok(r.views > 0);
  assert.deepEqual(r.picks, []);
});

test('the picked span is drawn in its lane; the owner\'s notes are drawn numbered', async () => {
  const marks = [
    { id: 'a'.repeat(32), n: 1, from: 8, to: 12, lane: 'brass', kind: 'text', draft: 1 },
    { id: 'b'.repeat(32), n: 2, from: 4, to: 4, lane: null, kind: 'hum', draft: 1 },
  ];
  const r = await mount({ select: { span: { from: 2, to: 6, fromBar: 2, toBar: 3, laneId: 'brass' }, onPick: () => {} }, marks });
  const sel = walk(r.root).find(e => e._attrs['data-selection'] !== undefined)!;
  assert.deepEqual([sel._attrs['x'], sel._attrs['y'], sel._attrs['width'], sel._attrs['height']], ['90', '112', '180', '36']);
  const drawn = walk(r.root).filter(e => e._attrs['data-note-mark'] !== undefined);
  assert.deepEqual(drawn.map(e => e._attrs['data-note-mark']), [marks[0]!.id, marks[1]!.id]);
  assert.match(drawn[0]!.textContent, /^1$/);
  const outline = walk(drawn[0]!).find(e => e.localName === 'rect')!;
  assert.deepEqual([outline._attrs['x'], outline._attrs['width'], outline._attrs['stroke-dasharray']], ['360', '180', '4 3']);
  assert.equal(walk(drawn[1]!).find(e => e.localName === 'line')!._attrs['x1'], '180', 'a moment is a line');
});
```

- [ ] **Step 2: Run to see it fail** — `node --test workroom/test/timeline-select.test.ts` — FAIL (no select mode, no marks).

- [ ] **Step 3: Implement `surface.ts`.** Add to `SurfaceProps`:

```ts
  /** 'select' (pinning): one finger picks a span instead of panning; two still pinch. */
  mode?: 'pan' | 'select';
  /** A span being picked (x and y in surface pixels): it starts at (x0, y0) and the pointer is now at (x1, y1); done closes it; cancelled drops the preview. */
  onSelect?(x0: number, x1: number, y0: number, y1: number, done: boolean, cancelled: boolean): void;
  /** A tap, after onSeek, with where it landed. */
  onTap?(x: number, y: number): void;
```

  Create the machine with `createGestures(() => live.current.view, () => live.current.bounds, () => live.current.mode ?? 'pan')`. The gesture machine's `select` output carries the y where the drag started; where it ends is the pointer's own y, so `apply` takes it as a second argument, `apply = (outs: GestureOut[], y?: number)`, and the move and up handlers pass it (`onPointerMove: e => apply(g.move(at(e)), at(e).y)`, `onPointerUp(e) { apply(g.up(at(e)), at(e).y); … }`; the other callers pass nothing). `apply` handles the other two outputs:

```ts
      if (o.kind === 'tap') {
        onSeek(Math.min(duration, Math.max(0, xToTime(view, o.x))));
        live.current.onTap?.(o.x, o.y);
      } else if (o.kind === 'select') {
        live.current.onSelect?.(o.x0, o.x1, o.y, y ?? o.y, o.done, o.cancelled === true);
      } else if (o.kind === 'view') { /* unchanged */ }
```

- [ ] **Step 4: Implement `Timeline.tsx`.** Imports: `hitTimeline`, `spanBetween`, `type Span` from `../hit.ts`; `type NoteMark` from `../answer.ts`; `timeToX` from `../zoom.ts`. Export `TimelineSelect`, add `select?: TimelineSelect; marks?: readonly NoteMark[]` to `TimelineProps`, and:

```tsx
/** The rows a span or a note covers: its lane's row, or every lane. */
function band(layout: TimelineLayout, laneId: string | null): { y: number; h: number } {
  const lane = layout.lanes.find(l => l.id === laneId);
  const top = TIMELINE.energyH + TIMELINE.sectionH;
  return lane ? { y: lane.rect.y, h: lane.rect.h } : { y: top, h: layout.height - top };
}
```

  (import `type TimelineLayout` from `../timeline.ts`). The surface call becomes:

```tsx
  const hitAt = (x: number, y: number) => hitTimeline(layout, view, tempo, x, y);
  const surface = useSurface({
    view, bounds: boundsFor(score.duration, view.width), duration: score.duration, onSeek: p.onSeek, onView: p.onView, onHold: p.onHold,
    mode: p.select ? 'select' : 'pan',
    onSelect: (x0, x1, y0, y1, done, cancelled) => {
      if (!p.select) return;
      p.select.onPick(cancelled ? null : spanBetween(hitAt(x0, y0), hitAt(x1, y1), tempo), done); // the lane survives only when both ends are in one
    },
    onTap: (x, y) => {
      if (!p.select) return;
      const hit = hitAt(x, y);
      p.select.onPick(spanBetween(hit, hit, tempo), true);
    },
  });
```

  and, just before `{p.overlay}`, draw the picked span and the marks:

```tsx
      {(p.marks ?? []).map(m => {
        const b = band(layout, m.lane);
        const x = timeToX(view, m.from);
        const w = (m.to - m.from) * view.pxPerSec;
        return (
          <g class="pointer-events-none" data-note-mark={m.id}>
            {w >= 2
              ? <rect class="fill-none stroke-ink" stroke-width={1.5} stroke-dasharray="4 3" rx={3} x={x} y={b.y + 1} width={w} height={b.h - 2} />
              : <line class="stroke-ink" stroke-width={2} x1={x} x2={x} y1={b.y} y2={b.y + b.h} />}
            <text class="fill-ink font-mono text-[10px]" x={x + 3} y={b.y + 11}>{m.n}</text>
          </g>
        );
      })}
      {p.select?.span ? (() => {
        const s = p.select.span;
        const b = band(layout, s.laneId);
        return <rect data-selection="" class="pointer-events-none fill-amber/20 stroke-amber" stroke-width={1.5} x={timeToX(view, s.from)} y={b.y} width={Math.max(2, (s.to - s.from) * view.pxPerSec)} height={b.h} />;
      })() : null}
```

  The marks' `<text>` holds the number only (the test reads `textContent` `1`).

- [ ] **Step 5: Run the tests** — `node --test workroom/test/timeline-select.test.ts workroom/test/views.test.ts workroom/test/workroom.test.ts workroom/test/gestures.test.ts` — PASS; rebuild and `--check` — exit 0.

- [ ] **Step 6: Commit** — "Music workroom: pick a span on the Story view; the owner's notes drawn on it" with the trailers.

### Task 15: The answer bar in the Workroom

**Files:**
- Create: `games/workroom/src/ui/AnswerBar.tsx`
- Modify: `games/workroom/src/ui/Workroom.tsx`, `games/workroom/src/tsconfig.dom.json`, `games/workroom/test/workroom.test.ts:416-427` (the panel's new title)
- Test: `games/workroom/test/workroom-answer.test.ts`

**Interfaces:**
- Consumes: everything above: `NotesSession` (Task 9), `MediaPorts`, `createRecorder` (Task 5), the builders (Task 3), `sectionAt` (Task 1), `timelineMarks` (Task 8), `KEPT_MESSAGES`, `SENT_MESSAGE` (Task 7), `energyGuideParts`, `GuideView`, `legendFor(…, { notes })`, `energyLegend` (Task 10), `Answers` (Task 11), the composers (Task 12), `EnergyEditor` (Task 13), `Timeline` `select` and `marks` (Task 14).
- Produces:

```tsx
export type AnswerMode = 'none' | 'pin' | 'react' | 'energy';
export interface AnswerBarProps {
  score: Score; tempo: TempoMap; version: number; time: number; span: Span | null;
  mode: AnswerMode; onMode(m: AnswerMode): void;
  sealing: boolean;              // false: "Notes are off: this page has no notes key yet (make music-setup)."
  media: MediaPorts | null;      // null: no Hum it, no Record
  now(): Date; busy: boolean;
  send(body: NoteBody, audio: Uint8Array<ArrayBuffer> | null): Promise<boolean>; // true once the note is stored (sent, or kept on this device); false when it is not
  say(message: string): void;
  status: string | null;         // shown in the bar's role="status" line (inside the pin composer while it is open)
}
export function AnswerBar(p: AnswerBarProps): JSX.Element;
// WorkroomProps gains:
notes?: NotesSession | null;  // undefined: no answering at all (the view tests); null: no key built in
media?: MediaPorts | null;
now?(): Date;
```

- [ ] **Step 1: Write the failing test** (`test/workroom-answer.test.ts`):

```ts
// Answering in the Workroom: Pin a note picks a span on the Story view and
// sends a typed note on it; React reacts to the section under the playhead;
// Draw the energy swaps the view for the drawing, with its own legend and
// guide; Hum it records at the playhead; a kept note says why; the notes
// panel is "Notes & answers" with Your notes first. Pinning keeps the timeline
// on screen above a docked composer; nothing typed or recorded is lost before
// the note is stored; a recording always has a Stop; no key takes Escape.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { h, render } from 'preact';
import { act } from 'preact/test-utils';
import { fire, installDocument, makeEl, document as stubDocument, renderTarget, walk } from '../../_kit/test/dom-stub.ts';
import type { StubElement } from '../../_kit/test/dom-stub.ts';
import { importTsx } from '../../_kit/test/tsx.ts';
import { memoryStorage } from '../../_kit/test/record.ts';
import { guideStore } from '../src/guide.ts';
import type { NoteBody } from '../src/note.ts';
import type { NotesSession } from '../src/notes-session.ts';
import { KEPT_MESSAGES, MEMORY_NOTICE, SENT_MESSAGE, SEND_MESSAGES } from '../src/outbox.ts';
import type { AddReport } from '../src/outbox.ts';
import type { MediaPorts, RecorderLike } from '../src/recorder.ts';
import type { Score } from '../src/score.ts';

installDocument();
// Every key listener the page puts on the window or the document, so the Escape test can press Escape at each.
const keyListeners: unknown[] = [];
const listen = (type: string, f: unknown): void => { if (type.startsWith('key')) keyListeners.push(f); };
Object.assign(globalThis, { window: { addEventListener: listen, removeEventListener() {} } });
const addToDocument = stubDocument.addEventListener;
stubDocument.addEventListener = (type, f) => { listen(type, f); addToDocument(type, f); };
Object.assign(globalThis, { requestAnimationFrame: () => 0, cancelAnimationFrame: () => {} });
const originalNS = stubDocument.createElementNS;
const originalEl = stubDocument.createElement;
const asAudio = (el: StubElement): StubElement => Object.assign(el, { currentTime: 0, paused: true, canPlayType: () => 'maybe', play: () => Promise.resolve(), pause() {} });
stubDocument.createElement = tag => (tag === 'audio' ? asAudio(originalEl(tag)) : originalEl(tag));
stubDocument.createElementNS = (ns, tag) => (tag === 'audio' ? asAudio(originalNS(ns, tag)) : originalNS(ns, tag));

const ui = await importTsx<{ room: typeof import('../src/ui/Workroom.tsx') }>(import.meta.dirname, { room: '../src/ui/Workroom.tsx' });
const score = JSON.parse(readFileSync(new URL('./fixtures/score-v1.json', import.meta.url), 'utf8')) as Score;
const NOW = () => new Date('2026-10-20T14:03:11.000Z');
const named = (root: StubElement, attr: string) => walk(root).find(e => e._attrs[attr] !== undefined);
const button = (root: StubElement, text: string) => walk(root).find(e => e.localName === 'button' && e.textContent === text);
const settle = async (): Promise<void> => { for (let i = 0; i < 20; i++) await act(async () => { await new Promise(r => setImmediate(r)); }); };
const close = (a: number, b: number) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≈ ${b}`);

/** `failures`: how many sends reject first, with the message of a note that could not be sealed. */
function fakeNotes(answer: (key: string) => AddReport = key => ({ key, memoryOnly: false, sent: [{ key, id: 'f'.repeat(32) }], kept: [] }), failures = 0) {
  const sent: { body: NoteBody; audio: Uint8Array | null }[] = [];
  let failing = failures;
  const session: NotesSession = {
    sealing: true, unlocked: () => false, unlock: async () => null, history: async () => [],
    send: async (body, audio) => {
      if (failing > 0) { failing--; throw new Error(SEND_MESSAGES.sealFailed); }
      sent.push({ body, audio });
      return answer(`k${sent.length}`);
    },
    flush: async () => ({ sent: [], kept: [] }), kept: async () => [], discard: async () => {}, remove: async () => {}, removeAll: async () => 0, lock() {},
  };
  return { session, sent };
}

function fakeMedia(): { ports: MediaPorts; clock: { ms: number }; released: { tracks: number } } {
  const clock = { ms: 0 };
  const released = { tracks: 0 };
  const ports: MediaPorts = {
    getUserMedia: async () => ({ getTracks: () => [{ stop() { released.tracks++; } }] }),
    isTypeSupported: m => m === 'audio/mp4',
    makeRecorder: () => {
      const r: RecorderLike & { state: string } = {
        state: 'inactive', ondataavailable: null, onstop: null,
        start() { r.state = 'recording'; },
        stop() { r.state = 'inactive'; r.ondataavailable?.({ data: { size: 3, arrayBuffer: async () => new Uint8Array([1, 2, 3]).buffer } }); r.onstop?.(); },
      };
      return r;
    },
    timers: { setTimeout: () => 1, clearTimeout: () => {} },
    now: () => clock.ms,
    audioSession: null,
  };
  return { ports, clock, released };
}

const mount = async (extra: Record<string, unknown> = {}): Promise<StubElement> => {
  const root = makeEl('root');
  await act(() => { render(h(ui.room.Workroom, { score, version: 1, versions: [1], audioSrc: (f: string) => f, onVersion: () => {}, now: NOW, ...extra }), renderTarget(root)); });
  await settle();
  return root;
};
const unmount = (root: StubElement): void => { render(null, renderTarget(root)); };
const at = (x: number, y: number, t: number) => ({ pointerId: 1, clientX: x, clientY: y, timeStamp: t });

test('without notes there is no answer bar; with no key built in, notes are off', async () => {
  const none = await mount();
  assert.equal(named(none, 'data-answer-bar'), undefined);
  assert.equal(named(none, 'data-answer-off'), undefined);
  unmount(none);
  const off = await mount({ notes: null });
  assert.match(named(off, 'data-answer-off')!.textContent, /Notes are off: this page has no notes key yet \(make music-setup\)\./);
  assert.equal(button(off, 'Pin a note'), undefined);
  unmount(off);
});

test('the notes panel is "Notes & answers", with Your notes first', async () => {
  const { session } = fakeNotes();
  const root = await mount({ notes: session });
  const aside = named(root, 'data-sheet')!;
  assert.equal(aside._attrs['aria-label'], 'Notes & answers');
  const body = named(aside, 'data-sheet-body')!;
  assert.equal(walk(body)[0]!._attrs['data-answers'], '');
  unmount(root);
});

test('Pin a note: from another view it goes to Story, a drag picks the span, Send seals a typed note on it', async () => {
  const { session, sent } = fakeNotes();
  const root = await mount({ notes: session });
  let scrolled = 0;
  const stage = walk(root).find(e => e._attrs['data-guide'] === 'view')!;
  Object.assign(stage, { scrollIntoView: () => { scrolled++; } });
  await act(() => { fire(walk(root).find(e => e._attrs['role'] === 'tab' && e.textContent === 'Piano roll')!, 'click'); });
  assert.equal(scrolled, 0);
  await act(() => { fire(button(root, 'Pin a note')!, 'click'); });
  assert.equal(scrolled, 1, 'the timeline is scrolled into view to pick on');
  assert.equal(button(root, 'Pin a note')!._attrs['aria-pressed'], 'true');
  const svg = named(root, 'data-timeline')!;
  assert.ok(svg, 'the Story view is shown for pinning');
  await act(() => { fire(svg, 'pointerdown', at(360, 120, 0)); });
  await act(() => { fire(svg, 'pointermove', at(612, 120, 50)); });
  await act(() => { fire(svg, 'pointerup', at(612, 120, 100)); });
  assert.match(named(root, 'data-pin-span')!.textContent, /^For Bars 5–7 · 8 s – 13\.6 s · Horns$/, 'the lane by its name');
  assert.ok(named(root, 'data-selection'));
  const box = walk(root).find(e => e.localName === 'textarea')!;
  assert.equal(box.parentElement?.localName, 'label');
  box.value = 'louder and slower right here';
  await act(() => { fire(box, 'input'); });
  await act(() => { fire(button(root, 'Send')!, 'click'); });
  await settle();
  const b = sent[0]!.body;
  assert.deepEqual([b.kind, b.piece, b.draft, b.fromBar, b.toBar, b.lane, b.text, b.made], ['text', 'test-piece', 1, 5, 7, 'brass', 'louder and slower right here', '2026-10-20T14:03:11.000Z']);
  close(b.from, 8);
  close(b.to, 13.6);
  assert.equal(named(root, 'data-answer-status')!.textContent, SENT_MESSAGE);
  assert.equal(named(root, 'data-pin-composer'), undefined, 'the composer closes once the note is safe');
  unmount(root);
});

test('React: the section under the playhead, in one tap', async () => {
  const { session, sent } = fakeNotes();
  const root = await mount({ notes: session });
  await act(() => { fire(button(root, 'React')!, 'click'); });
  assert.match(named(root, 'data-react-bar')!.textContent, /React to: The Labyrinth stirs/);
  await act(() => { fire(button(root, 'Love it')!, 'click'); });
  await settle();
  const b = sent[0]!.body;
  assert.deepEqual([b.kind, b.from, b.to, b.fromBar, b.toBar, b.reaction], ['react', 0, 8, 1, 4, 'love-it']);
  unmount(root);
});

test('Draw the energy: the drawing replaces the view with its own legend; Send seals the whole curve', async () => {
  const { session, sent } = fakeNotes();
  const root = await mount({ notes: session });
  await act(() => { fire(button(root, 'Draw the energy')!, 'click'); });
  assert.equal(named(root, 'data-timeline'), undefined);
  const editor = named(root, 'data-energy-editor')!;
  assert.equal(named(root, 'data-legend')!.textContent, 'dashed = the energy now · green = your shape · higher = more intense');
  await act(() => { fire(editor, 'pointerdown', { pointerId: 1, clientX: 180, clientY: 150 }); });
  await act(() => { fire(editor, 'pointermove', { pointerId: 1, clientX: 540, clientY: 20 }); });
  await act(() => { fire(editor, 'pointerup', { pointerId: 1, clientX: 540, clientY: 20 }); });
  await act(() => { fire(button(root, 'Send this shape')!, 'click'); });
  await settle();
  const b = sent[0]!.body;
  assert.deepEqual([b.kind, b.from, b.to, b.fromBar, b.toBar, b.curve![0]![0], b.curve!.at(-1)![0]], ['energy', 0, 16, 1, 8, 0, 16]);
  assert.ok(named(root, 'data-timeline'), 'the Story view comes back');
  unmount(root);
});

test('the energy drawing\'s guide opens by itself the first time', async () => {
  const storage = memoryStorage();
  for (const v of ['story', 'roll', 'sound', 'sheet']) storage.setItem(`workroom-guide-${v}`, 'seen');
  const { session } = fakeNotes();
  const root = await mount({ notes: session, guide: guideStore(storage) });
  assert.equal(named(root, 'data-guide-card'), undefined);
  await act(() => { fire(button(root, 'Draw the energy')!, 'click'); });
  assert.match(named(root, 'data-guide-card')!.textContent, /Part 1 of 4/);
  assert.equal(storage.getItem('workroom-guide-energy'), 'seen');
  unmount(root);
});

test('Hum it records at the playhead and sends a hum with its recording', async () => {
  const { session, sent } = fakeNotes();
  const media = fakeMedia();
  const root = await mount({ notes: session, media: media.ports });
  await act(() => { fire(button(root, 'Hum it')!, 'click'); });
  await settle();
  media.clock.ms += 2500;
  const stop = walk(root).find(e => e.localName === 'button' && /^Stop \(0:00 of 1:00\)$/.test(e.textContent))!;
  await act(() => { fire(stop, 'click'); });
  await settle();
  const { body, audio } = sent[0]!;
  assert.deepEqual([body.kind, body.from, body.to, body.fromBar, body.audio], ['hum', 0, 0, 1, { mime: 'audio/mp4', seconds: 2.5 }]);
  assert.deepEqual([...(audio ?? [])], [1, 2, 3]);
  unmount(root);
});

test('a note kept on this device says why', async () => {
  const { session } = fakeNotes(key => ({ key, memoryOnly: false, sent: [], kept: [{ key, reason: 'offline' }] }));
  const root = await mount({ notes: session });
  await act(() => { fire(button(root, 'React')!, 'click'); });
  await act(() => { fire(button(root, 'Calmer')!, 'click'); });
  await settle();
  assert.equal(named(root, 'data-answer-status')!.textContent, KEPT_MESSAGES.offline);
  unmount(root);
});

/** Pins a span on the Story view: Pin a note, then a drag across the brass lane (bars 5–7). */
async function pinSpan(root: StubElement): Promise<StubElement> {
  await act(() => { fire(button(root, 'Pin a note')!, 'click'); });
  const svg = named(root, 'data-timeline')!;
  await act(() => { fire(svg, 'pointerdown', at(360, 120, 0)); });
  await act(() => { fire(svg, 'pointermove', at(612, 120, 50)); });
  await act(() => { fire(svg, 'pointerup', at(612, 120, 100)); });
  return svg;
}

test('the pin composer is docked at the bottom of a phone, above the notes handle, and scrolls inside itself', async () => {
  const { session } = fakeNotes();
  const root = await mount({ notes: session });
  assert.equal(named(root, 'data-answer-dock'), undefined, 'nothing is docked until something needs the owner');
  await act(() => { fire(button(root, 'Pin a note')!, 'click'); });
  const dock = named(root, 'data-answer-dock')!;
  for (const c of ['fixed', 'bottom-11', 'max-h-[40dvh]', 'overflow-y-auto', 'lg:static']) assert.ok((dock._attrs['class'] ?? dock.className).split(' ').includes(c), c);
  assert.ok(walk(dock).includes(named(root, 'data-pin-composer')!), 'the composer is in the dock');
  await act(() => { fire(button(root, 'Cancel')!, 'click'); });
  assert.equal(named(root, 'data-answer-dock'), undefined);
  unmount(root);
});

test('a drag that starts in one lane and ends in another pins the span without a lane', async () => {
  const { session } = fakeNotes();
  const root = await mount({ notes: session });
  await act(() => { fire(button(root, 'Pin a note')!, 'click'); });
  const svg = named(root, 'data-timeline')!;
  await act(() => { fire(svg, 'pointerdown', at(360, 120, 0)); });
  await act(() => { fire(svg, 'pointermove', at(612, 80, 50)); });
  await act(() => { fire(svg, 'pointerup', at(612, 80, 100)); });
  assert.match(named(root, 'data-pin-span')!.textContent, /^For Bars 5–7 · 8 s – 13\.6 s$/, 'no lane named');
  unmount(root);
});

test('a note that cannot be sealed leaves the words in the box and says so where the owner is looking', async () => {
  const { session, sent } = fakeNotes(undefined, 1);
  const root = await mount({ notes: session });
  await pinSpan(root);
  const box = walk(root).find(e => e.localName === 'textarea')!;
  box.value = 'this must survive';
  await act(() => { fire(box, 'input'); });
  await act(() => { fire(button(root, 'Send')!, 'click'); });
  await settle();
  assert.equal(box.value, 'this must survive');
  assert.ok(named(root, 'data-pin-composer'), 'the composer stays open');
  assert.equal(named(root, 'data-answer-status')!.textContent, SEND_MESSAGES.sealFailed);
  assert.equal(sent.length, 0);
  await act(() => { fire(button(root, 'Send')!, 'click'); });
  await settle();
  assert.equal(sent[0]!.body.text, 'this must survive', 'the same words go on the next try');
  assert.equal(named(root, 'data-pin-composer'), undefined);
  unmount(root);
});

test('a recording always has a Stop; Record in the composer starts it and the dock shows Stop', async () => {
  const { session, sent } = fakeNotes();
  const media = fakeMedia();
  const root = await mount({ notes: session, media: media.ports });
  await pinSpan(root);
  await act(() => { fire(button(root, 'Record')!, 'click'); });
  await settle();
  assert.ok(walk(named(root, 'data-recording-strip')!).some(e => e.localName === 'button' && /^Stop \(/.test(e.textContent)), 'Stop sits in the dock');
  assert.equal(button(root, 'Recording…')!.disabled, true);
  media.clock.ms += 4000;
  await act(() => { fire(walk(root).find(e => e.localName === 'button' && /^Stop \(/.test(e.textContent))!, 'click'); });
  await settle();
  const { body, audio } = sent[0]!;
  assert.deepEqual([body.kind, body.fromBar, body.toBar, body.lane, body.audio], ['speech', 5, 7, 'brass', { mime: 'audio/mp4', seconds: 4 }]);
  assert.deepEqual([...(audio ?? [])], [1, 2, 3]);
  assert.equal(media.released.tracks, 1, 'the microphone is released');
  unmount(root);
});

test('switching to React or Draw while recording stops the microphone and keeps the recording to Send or Discard', async () => {
  const { session, sent } = fakeNotes();
  const media = fakeMedia();
  const root = await mount({ notes: session, media: media.ports });
  await pinSpan(root);
  await act(() => { fire(button(root, 'Record')!, 'click'); });
  await settle();
  media.clock.ms += 7000;
  await act(() => { fire(button(root, 'React')!, 'click'); });
  await settle();
  assert.equal(media.released.tracks, 1, 'the microphone is off');
  assert.equal(named(root, 'data-recording-strip'), undefined);
  assert.equal(sent.length, 0, 'nothing was sent behind the owner\'s back');
  const held = named(root, 'data-held-recording')!;
  assert.match(held.textContent, /A 0:07 recording is waiting here, not sent yet\./);
  await act(() => { fire(button(held, 'Send recording')!, 'click'); });
  await settle();
  assert.deepEqual([sent[0]!.body.kind, sent[0]!.body.fromBar, sent[0]!.body.toBar, sent[0]!.body.audio!.seconds], ['speech', 5, 7, 7]);
  assert.equal(named(root, 'data-held-recording'), undefined, 'gone once stored');
  await act(() => { fire(button(root, 'Hum it')!, 'click'); });
  await settle();
  await act(() => { fire(button(root, 'Draw the energy')!, 'click'); });
  await settle();
  const again = named(root, 'data-held-recording')!;
  assert.ok(again, 'a hum is kept the same way');
  await act(() => { fire(button(again, 'Discard recording')!, 'click'); });
  assert.equal(named(root, 'data-held-recording'), undefined);
  assert.equal(sent.length, 1);
  unmount(root);
});

test('a recording that could not be stored stays held and goes on the next Send', async () => {
  const { session, sent } = fakeNotes(undefined, 1);
  const media = fakeMedia();
  const root = await mount({ notes: session, media: media.ports });
  await act(() => { fire(button(root, 'Hum it')!, 'click'); });
  await settle();
  await act(() => { fire(walk(root).find(e => e.localName === 'button' && /^Stop \(/.test(e.textContent))!, 'click'); });
  await settle();
  assert.equal(sent.length, 0);
  const held = named(root, 'data-held-recording')!;
  assert.ok(held, 'the recording is kept');
  assert.equal(named(root, 'data-answer-status')!.textContent, SEND_MESSAGES.sealFailed);
  await act(() => { fire(button(held, 'Send recording')!, 'click'); });
  await settle();
  assert.equal(sent[0]!.body.kind, 'hum');
  assert.equal(named(root, 'data-held-recording'), undefined);
  unmount(root);
});

test('a reaction is one tap and the bar stays open for the next', async () => {
  const { session, sent } = fakeNotes();
  const root = await mount({ notes: session });
  await act(() => { fire(button(root, 'React')!, 'click'); });
  await act(() => { fire(button(root, 'Love it')!, 'click'); });
  await settle();
  assert.equal(named(root, 'data-answer-status')!.textContent, SENT_MESSAGE);
  assert.ok(named(root, 'data-react-bar'), 'still open');
  await act(() => { fire(button(root, 'Calmer')!, 'click'); });
  await settle();
  assert.deepEqual(sent.map(s => s.body.reaction), ['love-it', 'calmer']);
  assert.equal(button(root, 'React')!._attrs['aria-pressed'], 'true');
  unmount(root);
});

test('a note this browser could only keep in memory says so', async () => {
  const { session } = fakeNotes(key => ({ key, memoryOnly: true, sent: [], kept: [{ key, reason: 'offline' }] }));
  const root = await mount({ notes: session });
  await act(() => { fire(button(root, 'React')!, 'click'); });
  await act(() => { fire(button(root, 'Calmer')!, 'click'); });
  await settle();
  assert.equal(named(root, 'data-answer-status')!.textContent, `${KEPT_MESSAGES.offline} ${MEMORY_NOTICE}`);
  unmount(root);
});

test('no key takes Escape while a composer is open and a recording runs', async () => {
  const { session, sent } = fakeNotes();
  const media = fakeMedia();
  const root = await mount({ notes: session, media: media.ports });
  await pinSpan(root);
  await act(() => { fire(button(root, 'Record')!, 'click'); });
  await settle();
  let taken = 0;
  for (const el of [root, ...walk(root)]) for (const type of ['keydown', 'keyup', 'keypress']) fire(el, type, { key: 'Escape', code: 'Escape', keyCode: 27, preventDefault: () => { taken++; }, stopPropagation: () => { taken++; } });
  for (const f of keyListeners) {
    const ev = { type: 'keydown', key: 'Escape', preventDefault: () => { taken++; }, stopPropagation: () => { taken++; } };
    (f as (e: typeof ev) => void)(ev);
  }
  assert.equal(taken, 0);
  assert.ok(named(root, 'data-pin-composer'), 'the composer is still open');
  assert.ok(named(root, 'data-recording-strip'), 'the recording goes on');
  assert.equal(sent.length, 0);
  unmount(root);
});
```

  In `test/workroom.test.ts`, the test `the notes panel is "Words & changes"; …` becomes `the notes panel is "Notes & answers"; …` and asserts `aside._attrs['aria-label']` is `'Notes & answers'` (the rest of it is unchanged).

- [ ] **Step 2: Run to see it fail** — `node --test workroom/test/workroom-answer.test.ts workroom/test/workroom.test.ts` — FAIL.

- [ ] **Step 3: Implement `src/ui/AnswerBar.tsx`** (and add it to `src/tsconfig.dom.json`). The dock (`data-answer-dock`) is where what needs the owner right now sits: the recording strip with its Stop (the only Stop button on the page), a recording kept but not stored (Send recording / Discard recording), and the pin composer. On a phone it is fixed at the bottom above the sheet handle (`bottom-11` is the handle's 44 px), at most 40 dvh, scrolling inside itself; from 1024 px it is in the page's flow. A change of mode while recording stops the recording and holds it; the hum button is disabled while anything records or is held.

```tsx
// The answer bar under the player: Pin a note, Hum it, React and Draw the
// energy; and what became of the last note sent. What needs the owner's
// attention right now sits in the dock, fixed at the bottom of a phone's
// screen above the notes handle (in the page's flow from 1024 px): the Stop
// button of a recording, a recording kept but not yet stored, and the pin
// composer. A recording starts inside the tap (the recorder asks for the
// microphone before anything awaits). Switching to another mode while
// recording stops the recording and keeps it, to Send or Discard.
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { humNote, recordClock, reactNote, speechNote, textNote, wholePiece } from '../answer.ts';
import type { Context } from '../answer.ts';
import { sectionAt } from '../hit.ts';
import type { Span } from '../hit.ts';
import type { NoteBody } from '../note.ts';
import { RECORDER_MESSAGES, RecorderProblem, createRecorder } from '../recorder.ts';
import type { MediaPorts, Recording } from '../recorder.ts';
import type { Score } from '../score.ts';
import type { TempoMap } from '../tempo.ts';
import { Button } from './console/Button.tsx';
import { PinComposer } from './PinComposer.tsx';
import { ReactBar } from './ReactBar.tsx';
import { RecordButton } from './RecordButton.tsx';

export type AnswerMode = 'none' | 'pin' | 'react' | 'energy';
export interface AnswerBarProps {
  score: Score; tempo: TempoMap; version: number; time: number; span: Span | null;
  mode: AnswerMode; onMode(m: AnswerMode): void;
  sealing: boolean; media: MediaPorts | null; now(): Date; busy: boolean;
  /** Seals and stores the note; true once it is stored (sent, or kept on this device), false when it is not. */
  send(body: NoteBody, audio: Uint8Array<ArrayBuffer> | null): Promise<boolean>;
  say(message: string): void;
  status: string | null;
}

type Kind = 'speech' | 'hum';
/** A recording that is made but not stored yet, with where in the piece it was made. */
interface Held { kind: Kind; recording: Recording; at: { time: number; bar: number | null; laneId: string | null } | null; span: Span | null }
const messageOf = (e: unknown): string => (e instanceof Error && e.message ? e.message : RECORDER_MESSAGES.failed);

export function AnswerBar(p: AnswerBarProps) {
  const live = useRef(p);
  live.current = p;
  const [recording, setRecording] = useState<Kind | null>(null);
  const [held, setHeld] = useState<Held | null>(null);
  const [seconds, setSeconds] = useState(0);
  const kind = useRef<Kind | null>(null);
  const humAt = useRef<Held['at']>(null);
  const spanAt = useRef<Span | null>(null);
  const lastMode = useRef(p.mode);
  const ctx = (): Context => ({ piece: live.current.score.piece.id, draft: live.current.version, now: live.current.now });
  const bodyOf = (h: Held): NoteBody => (h.kind === 'hum' ? humNote(ctx(), h.at!, h.recording) : speechNote(ctx(), h.span!, h.recording));
  /** Stores a recording; one that cannot be stored stays held, to try again or discard. */
  const store = async (h: Held): Promise<void> => {
    try {
      const stored = await live.current.send(bodyOf(h), h.recording.bytes);
      setHeld(stored ? null : h);
    } catch (e) {
      live.current.say(messageOf(e));
      setHeld(h);
    }
  };
  const finish = async (k: Kind, rec: Promise<Recording>, keepOnly: boolean): Promise<void> => {
    setRecording(null);
    try {
      const h: Held = { kind: k, recording: await rec, at: humAt.current, span: spanAt.current };
      if (keepOnly) setHeld(h); else await store(h);
    } catch (e) {
      live.current.say(messageOf(e));
    }
  };
  const recorder = useMemo(() => (p.media ? createRecorder(p.media, r => { const k = kind.current; if (k) void finish(k, r, false); }) : null), [p.media]);
  useEffect(() => () => recorder?.cancel(), [recorder]);
  useEffect(() => {
    if (!recording || !recorder) return;
    const id = setInterval(() => setSeconds(recorder.elapsed()), 250);
    return () => clearInterval(id);
  }, [recording, recorder]);
  // Moving to another mode while recording must not leave a microphone open with nothing on screen to stop it.
  useEffect(() => {
    const changed = lastMode.current !== p.mode;
    lastMode.current = p.mode;
    const k = kind.current;
    if (changed && k && recorder?.recording) void finish(k, recorder.stop(), true);
  }, [p.mode]);

  /** Runs inside the tap: the recorder asks for the microphone before anything awaits. */
  const start = (k: Kind): void => {
    if (!recorder || recording || held) return;
    kind.current = k;
    humAt.current = { time: p.time, bar: p.tempo.barAt(p.time), laneId: p.span?.laneId ?? null };
    spanAt.current = p.span;
    recorder.start().then(() => { setSeconds(0); setRecording(k); }, (e: unknown) => p.say(e instanceof RecorderProblem ? e.message : RECORDER_MESSAGES.failed));
  };
  const stop = (): void => {
    const k = kind.current;
    if (recorder && k) void finish(k, recorder.stop(), false);
  };
  const cancelPin = (): void => {
    if (recording === 'speech') { recorder?.cancel(); setRecording(null); }
    p.onMode('none');
  };
  const toggle = (m: AnswerMode): void => p.onMode(p.mode === m ? 'none' : m);

  if (!p.sealing) return <p data-answer-off="" class="text-sm text-dim">Notes are off: this page has no notes key yet (make music-setup).</p>;
  const section = sectionAt(p.score, p.tempo, p.time);
  const target = section ?? wholePiece(p.score);
  const laneId = p.span?.laneId ?? null;
  const laneName = laneId ? p.score.lanes.find(l => l.id === laneId)?.name ?? null : null;
  const sendText = async (text: string): Promise<boolean> => {
    try { return await p.send(textNote(ctx(), p.span!, text), null); } catch (e) { p.say(messageOf(e)); return false; }
  };
  const docked = recording !== null || held !== null || p.mode === 'pin';
  return (
    <div data-answer-bar="" class="grid gap-3">
      <div role="group" aria-label="Answer" class="flex flex-wrap gap-2">
        <Button pressed={p.mode === 'pin'} onClick={() => toggle('pin')}>Pin a note</Button>
        {recorder ? <RecordButton recording={false} seconds={0} disabled={recording !== null || held !== null || p.busy} onStart={() => start('hum')} onStop={stop} /> : null}
        <Button pressed={p.mode === 'react'} onClick={() => toggle('react')}>React</Button>
        <Button pressed={p.mode === 'energy'} onClick={() => toggle('energy')}>Draw the energy</Button>
      </div>
      {docked ? (
        <div data-answer-dock="" class="fixed inset-x-0 bottom-11 z-10 grid max-h-[40dvh] gap-2 overflow-y-auto bg-ground px-3 pt-2 pb-2 lg:static lg:z-auto lg:max-h-none lg:overflow-visible lg:bg-transparent lg:p-0">
          {recording ? (
            <div data-recording-strip="" class="sticky top-0 flex flex-wrap items-center gap-3 rounded-lg border border-record bg-panel p-3">
              <RecordButton recording seconds={seconds} onStart={() => {}} onStop={stop} />
              <span class="text-sm">{recording === 'hum' ? 'Humming at the playhead.' : 'Recording your note.'}</span>
            </div>
          ) : null}
          {held ? (
            <div data-held-recording="" role="group" aria-label="Recording not sent" class="grid gap-2 rounded-lg border border-amber bg-panel p-3">
              <p class="text-sm">{`A ${recordClock(held.recording.seconds)} recording is waiting here, not sent yet.`}</p>
              <div class="flex flex-wrap gap-2">
                <Button variant="primary" disabled={p.busy} onClick={() => void store(held)}>Send recording</Button>
                <Button disabled={p.busy} onClick={() => setHeld(null)}>Discard recording</Button>
              </div>
            </div>
          ) : null}
          {p.mode === 'pin' ? <PinComposer span={p.span} laneName={laneName} recording={recording === 'speech'} canRecord={recorder !== null && held === null} busy={p.busy} status={p.status}
            onSend={sendText} onRecord={() => start('speech')} onCancel={cancelPin} /> : null}
        </div>
      ) : null}
      {p.mode === 'react' ? <ReactBar section={target} whole={section === null} busy={p.busy}
        onReact={r => void p.send(reactNote(ctx(), target, p.tempo, p.score.duration, r), null)} /> : null}
      {p.mode !== 'pin' ? <p role="status" data-answer-status="" class="min-h-5 text-sm">{p.status ?? ''}</p> : null}
    </div>
  );
}
```

- [ ] **Step 4: Wire the Workroom** (`src/ui/Workroom.tsx`). Keep every existing behaviour; add:
  - Imports: `energyNote` (`../answer.ts`); `energyGuideParts` and `type GuideView` (`../guide.ts`); `type Span` (`../hit.ts`); `timelineMarks` and `type HistoryItem` (`../history.ts`); `type NoteBody` (`../note.ts`); `type NotesSession` (`../notes-session.ts`); `KEPT_MESSAGES`, `MEMORY_NOTICE`, `SENT_MESSAGE`, `SEND_MESSAGES` (`../outbox.ts`); `type MediaPorts` (`../recorder.ts`); `energyLegend` beside `legendFor` (`../tabs.ts`); `AnswerBar`, `type AnswerMode` (`./AnswerBar.tsx`); `Answers` (`./Answers.tsx`); `EnergyEditor` (`./EnergyEditor.tsx`).
  - `WorkroomProps` gains `notes?: NotesSession | null; media?: MediaPorts | null; now?(): Date;` and the file's top comment gains one sentence: "With a notes session it also holds the answering: the answer bar, the span being picked, the energy drawing and the owner's notes on the Story view."
  - State and handlers, after the existing state:

```tsx
  const notes = p.notes ?? null;
  const answering = p.notes !== undefined;
  const now = p.now ?? ((): Date => new Date());
  const [mode, setMode] = useState<AnswerMode>('none');
  const [span, setSpan] = useState<Span | null>(null);
  const [preview, setPreview] = useState<Span | null>(null);
  const [items, setItems] = useState<readonly HistoryItem[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const marks = useMemo(() => timelineMarks(items, score.piece.id, score.duration), [items, score]);
  const changeMode = (m: AnswerMode): void => {
    setMode(m);
    setPreview(null);
    if (m !== 'pin') setSpan(null);
    if (m === 'pin') setWanted('story');
  };
  // Pinning picks on the Story view's timeline: bring it on screen, above the composer.
  useEffect(() => { if (mode === 'pin') stage.current?.scrollIntoView?.({ block: 'start' }); }, [mode]);
  const pick = (s: Span | null, done: boolean): void => {
    if (s === null) setPreview(null);
    else if (done) { setSpan(s); setPreview(null); }
    else setPreview(s);
  };
  /** Seals and stores a note: true once it is stored (sent, or kept on this device), false when it is not, with the words and recordings still the owner's. A reaction leaves the bar open for the next one. */
  const send = async (body: NoteBody, audio: Uint8Array<ArrayBuffer> | null): Promise<boolean> => {
    if (!notes) return false;
    setSending(true);
    setStatus('Sealing and sending…');
    try {
      const r = await notes.send(body, audio);
      const kept = r.kept.find(k => k.key === r.key);
      setStatus(kept ? `${KEPT_MESSAGES[kept.reason]}${r.memoryOnly ? ` ${MEMORY_NOTICE}` : ''}` : SENT_MESSAGE);
      if (body.kind !== 'react') changeMode('none');
      return true;
    } catch (e) {
      setStatus(e instanceof Error ? e.message : SEND_MESSAGES.sealFailed);
      return false;
    } finally {
      setSending(false);
      setRefresh(n => n + 1);
    }
  };
  const sendEnergy = (curve: [number, number][]): void => {
    void send(energyNote({ piece: score.piece.id, draft: p.version, now }, curve, score.duration, score.bars ?? null), null);
  };
```

  - The guide follows the energy drawing: `const guideView: GuideView = mode === 'energy' ? 'energy' : tab;`; the auto-open effect and `openGuide` use `guideView` in place of `tab` (`guide.seen(guideView, score.kind)`, `guide.markSeen(guideView, score.kind)`, dependencies `[guideView, score.kind]`); the overlay's parts are `mode === 'energy' ? energyGuideParts({ score, tempo, view }) : guideParts({ tab, score, tempo, view, time, lanes, marks })`.
  - Under `<Player … />`: `{answering ? <AnswerBar score={score} tempo={tempo} version={p.version} time={time} span={span} mode={mode} onMode={changeMode} sealing={notes?.sealing ?? false} media={p.media ?? null} now={now} busy={sending} send={send} say={setStatus} status={status} /> : null}`.
  - `ViewTabs`' `onTab` becomes `t => { setWanted(t); if (mode === 'pin' || mode === 'energy') changeMode('none'); }`.
  - The lane picker shows only when `tab === 'roll' && mode !== 'energy'`.
  - Inside the stage `div`, the energy drawing replaces the view: `{mode === 'energy' ? <EnergyEditor score={score} tempo={tempo} view={view} busy={sending} onSend={sendEnergy} onHold={setHolding} onCancel={() => changeMode('none')} /> : <>…the four existing views…</>}` (`onHold={setHolding}` is what the other views pass: playback does not scroll the drawing under a stroke); the Story view gets `select={mode === 'pin' ? { span: preview ?? span, onPick: pick } : undefined}` and `marks={marks}`.
  - The legend: `<Legend items={mode === 'energy' ? energyLegend(score) : legendFor(tab, score, { notes: marks.length > 0 })} />`.
  - The sheet: `title="Notes & answers"`, and its first child `{notes ? <Answers notes={notes} score={score} version={p.version} refresh={refresh} onItems={setItems} /> : null}`.

- [ ] **Step 5: Run the tests** — `node --test workroom/test/workroom-answer.test.ts workroom/test/workroom.test.ts workroom/test/views.test.ts workroom/test/playback.test.ts workroom/test/console.test.ts workroom/test/tokens.test.ts` — PASS; rebuild and `--check` — exit 0.

- [ ] **Step 6: Commit** — "Music workroom: answering in the page (pin, hum, react, draw the energy)" with the trailers.

### Task 16: The page wiring and the pieces list's counts

**Files:**
- Modify: `games/workroom/src/main.ts`, `games/workroom/src/browser.ts`, `games/workroom/src/tsconfig.dom.json`
- Create: `games/workroom/src/ui/PiecesIndex.tsx`, `games/workroom/src/ui/waiting.ts`
- Test: `games/workroom/test/waiting.test.ts`

**Interfaces:**
- Consumes: `createApi` (Task 6), `createOutbox`, `OutboxLock` (Task 7), `indexedDbOutbox` (Task 7), `createNotesSession` (Task 9), `createVault`, `PUBLIC_KEY`, `PREVIOUS_KEYS`, `waitingByPiece` (Task 8), `UnlockPanel`, `Kept` (Task 11), `MediaPorts`, `RecorderLike` (Task 5).
- Produces:

```ts
// src/browser.ts
/** The browser's microphone and MediaRecorder as the recorder's ports (64 kb/s), or null where the browser cannot record. */
export function browserMedia(): MediaPorts | null;
/** The outbox's cross-tab lock (navigator.locks, name "workroom-outbox"), or null where the browser has no Web Locks (the outbox then flushes as it is). */
export function browserLock(): OutboxLock | null;
// src/ui/waiting.ts
/** Writes "N waiting" (or nothing) into the .waiting-count after each a[data-waiting] of the server-rendered pieces list. */
export function showWaiting(list: ParentNode, counts: ReadonlyMap<string, number>): void;
// src/ui/PiecesIndex.tsx
export function PiecesIndex(p: { notes: NotesSession; list: ParentNode }): JSX.Element;
```

- [ ] **Step 1: Write the failing test** (`test/waiting.test.ts`):

```ts
// The pieces list's per-piece counts: written once the notes are unlocked
// (the server cannot know a sealed note's piece); a piece with none is blank.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { asElement, makeEl } from '../../_kit/test/dom-stub.ts';
import type { StubElement } from '../../_kit/test/dom-stub.ts';
import { showWaiting } from '../src/ui/waiting.ts';

test('each piece row gets its waiting count; a piece with none is blank', () => {
  const list = makeEl('list');
  const row = (piece: string): StubElement => {
    const li = makeEl('');
    const a = makeEl('');
    a.localName = 'a';
    a.setAttribute('data-waiting', piece);
    const count = makeEl('');
    count.localName = 'span';
    count.className = 'waiting-count';
    count.textContent = 'stale';
    li.append(a, count);
    list.append(li);
    return count;
  };
  const three = row('test-piece');
  const none = row('cannon-fire');
  showWaiting(asElement(list), new Map([['test-piece', 3], ['gone', 9]]));
  assert.equal(three.textContent, '3 waiting');
  assert.equal(none.textContent, '');
});
```

- [ ] **Step 2: Run to see it fail** — `node --test workroom/test/waiting.test.ts` — FAIL.

- [ ] **Step 3: Implement `src/ui/waiting.ts`:**

```ts
// The pieces list's "N waiting" counts, written into the server-rendered rows
// (music/lib/Pages.php: <a data-waiting="<piece>">…</a><span class="waiting-count">)
// once the notes are unlocked: the server cannot know a sealed note's piece.
export function showWaiting(list: ParentNode, counts: ReadonlyMap<string, number>): void {
  for (const a of Array.from(list.querySelectorAll('a'))) {
    const piece = a.getAttribute('data-waiting');
    const next = a.nextSibling as (Node & { className?: string }) | null;
    if (piece === null || !next || next.nodeType !== 1 || !String(next.className ?? '').split(' ').includes('waiting-count')) continue;
    const n = counts.get(piece) ?? 0;
    next.textContent = n === 0 ? '' : `${n} waiting`;
  }
}
```

- [ ] **Step 4: Implement `src/ui/PiecesIndex.tsx`:**

```tsx
// The pieces list's notes: unlock, and each piece shows how many of the
// owner's notes wait for pickup; the notes not sent yet are listed and flushed.
import { useEffect, useState } from 'preact/hooks';
import { SignedOut } from '../api.ts';
import { waitingByPiece } from '../history.ts';
import { UNLOCK_MESSAGES } from '../notes-session.ts';
import type { NotesSession } from '../notes-session.ts';
import type { Pending } from '../outbox.ts';
import { Panel } from './console/Panel.tsx';
import { Kept } from './History.tsx';
import { UnlockPanel } from './UnlockPanel.tsx';
import { showWaiting } from './waiting.ts';

export function PiecesIndex(p: { notes: NotesSession; list: ParentNode }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [counted, setCounted] = useState(false);
  const [kept, setKept] = useState<readonly Pending[]>([]);
  const refreshKept = async (): Promise<void> => { setKept(await p.notes.kept()); };
  useEffect(() => {
    const again = (): void => { void p.notes.flush().then(refreshKept, refreshKept); };
    again();
    window.addEventListener('online', again);
    return () => window.removeEventListener('online', again);
  }, [p.notes]);
  const unlock = async (passphrase: string): Promise<void> => {
    setBusy(true);
    setError(null);
    const problem = await p.notes.unlock(passphrase);
    if (problem) { setError(problem); setBusy(false); return; }
    try {
      showWaiting(p.list, waitingByPiece(await p.notes.history()));
      setCounted(true);
    } catch (e) {
      setError(e instanceof SignedOut ? UNLOCK_MESSAGES.signedOut : UNLOCK_MESSAGES.offline);
    }
    setBusy(false);
  };
  const act = async (work: () => Promise<unknown>): Promise<void> => {
    setBusy(true);
    try { await work(); } finally { setBusy(false); }
    await refreshKept();
  };
  return (
    <Panel title="Your notes" class="mx-auto grid max-w-xl gap-3" data={{ 'data-pieces-notes': '' }}>
      {counted
        ? <p class="text-sm text-dim">Each piece shows how many of your notes wait for pickup.</p>
        : <UnlockPanel busy={busy} error={error} onUnlock={pass => void unlock(pass)} />}
      <Kept kept={kept} busy={busy} onDiscard={key => void act(() => p.notes.discard(key))} onRetry={() => void act(() => p.notes.flush())} />
    </Panel>
  );
}
```

- [ ] **Step 5: Add `browserMedia` and `browserLock` to `src/browser.ts`:**

```ts
import type { OutboxLock } from './outbox.ts';
import type { MediaPorts, RecorderLike, StreamLike } from './recorder.ts';

/** The Web Locks lock the outbox flushes under, so two tabs never upload one kept note twice; null where the browser has no Web Locks (the outbox then flushes as it is). */
export function browserLock(): OutboxLock | null {
  const locks = typeof navigator === 'undefined' ? undefined : navigator.locks;
  return locks && typeof locks.request === 'function' ? work => locks.request('workroom-outbox', work) : null;
}

/** Speech and humming at 64 kb/s: a minute is about half a megabyte sealed. */
const BITS_PER_SECOND = 64_000;

export function browserMedia(): MediaPorts | null {
  const devices = typeof navigator === 'undefined' ? undefined : navigator.mediaDevices;
  if (!devices || typeof devices.getUserMedia !== 'function' || typeof MediaRecorder === 'undefined') return null;
  const session = (navigator as unknown as { audioSession?: { type: string } }).audioSession ?? null;
  return {
    getUserMedia: () => devices.getUserMedia({ audio: true }),
    isTypeSupported: mime => MediaRecorder.isTypeSupported(mime),
    // MediaRecorder hands ondataavailable a whole BlobEvent; RecorderLike reads only its data, so this one boundary casts.
    makeRecorder: (stream: StreamLike, mime: string) => new MediaRecorder(stream as MediaStream, { mimeType: mime, audioBitsPerSecond: BITS_PER_SECOND }) as unknown as RecorderLike,
    timers: { setTimeout: (f, ms) => window.setTimeout(f, ms), clearTimeout: id => window.clearTimeout(id) },
    now: () => performance.now(),
    audioSession: session,
  };
}
```


- [ ] **Step 6: Rewrite `src/main.ts`:**

```ts
// The workroom page: starts the theme switch, reads which view and piece the
// server rendered, and draws it: a piece (its views, the answer bar and the
// notes panel), or on the pieces list the unlock that fills in each piece's
// waiting count. Notes are sealed to the key built into the page
// (public-key.ts); with none built in, the page offers no note tools.
import { render, h } from 'preact';
import { createAudioCore } from '../../_kit/audio/core.ts';
import { createApi } from './api.ts';
import { browserLock, browserMedia, browserStorage, browserThemePorts } from './browser.ts';
import { guideStore } from './guide.ts';
import { indexedDbOutbox } from './idb.ts';
import { draftUrl, loadDraft } from './load.ts';
import { createNotesSession } from './notes-session.ts';
import type { NotesSession } from './notes-session.ts';
import { createOutbox } from './outbox.ts';
import { PREVIOUS_KEYS, PUBLIC_KEY } from './public-key.ts';
import { startTheme } from './theme.ts';
import { createVault } from './vault.ts';
import { demoPlayer } from './ui/demo-player.ts';
import { PiecesIndex } from './ui/PiecesIndex.tsx';
import { ThemeRoot, ThemeSwitch } from './ui/ThemeSwitch.tsx';
import { Workroom } from './ui/Workroom.tsx';

const theme = startTheme(browserThemePorts());
const switchHost = document.getElementById('theme-switch');
if (switchHost) render(h(ThemeSwitch, { handle: theme }), switchHost);

const root = document.getElementById('workroom')!;
const playDemo = demoPlayer(createAudioCore());
const { view, piece, version } = document.body.dataset;
const fetcher = window.fetch.bind(window);

/** The notes on this page view: the keys stay in memory, the outbox in IndexedDB holds sealed notes only. */
function notesSession(): NotesSession | null {
  if (PUBLIC_KEY === null) return null;
  const api = createApi(fetcher, document.querySelector('meta[name="csrf"]')?.getAttribute('content') ?? '');
  return createNotesSession({ api, vault: createVault(), outbox: createOutbox(indexedDbOutbox(), api, () => crypto.randomUUID(), browserLock()), keys: { current: PUBLIC_KEY, previous: PREVIOUS_KEYS } });
}
const notes = notesSession();

function say(text: string, role = 'alert'): void {
  const p = document.createElement('p');
  p.className = 'error';
  p.setAttribute('role', role);
  p.textContent = text;
  root.replaceChildren(p);
}

if (view === 'piece' && piece) {
  root.textContent = 'Loading…';
  const wanted = version && /^\d+$/.test(version) ? Number(version) : null;
  const loaded = await loadDraft(fetcher, piece, wanted);
  if (!loaded.ok) say(loaded.error);
  else {
    root.textContent = '';
    render(h(ThemeRoot, { handle: theme }, h(Workroom, {
      score: loaded.score,
      version: loaded.version,
      versions: loaded.versions,
      audioSrc: file => draftUrl(piece, loaded.version, file),
      guide: guideStore(browserStorage()),
      playDemo,
      stopDemo: playDemo.stop,
      onVersion: v => { location.search = `?id=${encodeURIComponent(piece)}&v=${v}`; },
      notes,
      media: browserMedia(),
    })), root);
  }
} else if (view === 'index' && notes) {
  root.textContent = '';
  const list = document.querySelector('.index-body');
  if (list) render(h(ThemeRoot, { handle: theme }, h(PiecesIndex, { notes, list })), root);
} else {
  root.textContent = '';
}
```

  Add `"ui/PiecesIndex.tsx", "ui/waiting.ts"` to `src/tsconfig.dom.json`.

- [ ] **Step 7: Run the tests and the build** — `node --test workroom/test/waiting.test.ts workroom/test/tokens.test.ts workroom/test/no-storage.test.ts` — PASS; `node _kit/build/build.mjs workroom` then `--check` — exit 0; `sh games/units.sh` from `websites/www.cs` — exit 0.

- [ ] **Step 8: Commit** — "Music workroom: the page wiring, the microphone, and per-piece waiting counts" with the trailers.

### Task 17: The local browser check: test keys, the microphone, and answering end to end

**Files:**
- Create: `games/workroom/tools/e2e-bundle.ts`, `compose.music-local.yaml`
- Create: `games/workroom/test/e2e-bundle.test.ts`
- Modify: `docker/php/Dockerfile:36`, `tests/php/MusicDeployTest.php`, `Makefile` (`music-e2e` recipe and `MUSIC_PY_ABS`), `tests/e2e/local.config.ts`, `tests/e2e/workroom.local.ts`

**Interfaces:**
- Consumes: the page as built in Tasks 1–16; `test/fixtures/{public-key.ts,public.json,test-key.json}` (committed TEST keys); `music/tools/siue-music pickup` and its environment (`SIUE_CONFIG_DIR`, `SIUE_MUSIC_NOTES_DIR`, `SIUE_MUSIC_BASE`, `SIUE_MUSIC_PUBLIC_KEYS`; the cache file `music.json` is `{ "v": 1, "keys": { <fingerprint>: <pkcs8 base64> }, "api": { "music-pickup": <key> } }`); `music/tools/ensure-venv music/tools/.venv music/tools/requirements.txt` (once, for `cryptography`: the command `make music-setup` runs first).
- Produces: `node workroom/tools/e2e-bundle.ts` (from `games/`) prints the path of a test-key `workroom.js` in a fresh temporary folder; `make music-e2e` runs every `*.local.ts` test with the server on the test public keys, the page routed to that bundle in the answering tests, and Chrome's fake microphone.

- [ ] **Step 1: Write the failing tests.**

`test/e2e-bundle.test.ts`:

```ts
// The browser check's page has the TEST notes keys built in, and the shipped
// page never does.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { fx } from './fixture-key.ts';

const workroom = join(import.meta.dirname, '..');

test('the shipped page carries no test key', () => {
  assert.doesNotMatch(readFileSync(join(workroom, 'dist', 'workroom.js'), 'utf8'), new RegExp(fx.fingerprint));
});

test('the check\'s bundle carries the test key, outside the repository', () => {
  const run = spawnSync(process.execPath, [join(workroom, 'tools', 'e2e-bundle.ts')], { encoding: 'utf8' });
  assert.equal(run.status, 0, run.stderr);
  const out = run.stdout.trim();
  try {
    assert.ok(out.startsWith(tmpdir()), out);
    assert.match(readFileSync(out, 'utf8'), new RegExp(fx.fingerprint));
  } finally {
    rmSync(dirname(out), { recursive: true, force: true });
  }
});
```

Add to `tests/php/MusicDeployTest.php` (beside its other tests):

```php
    public function testPhpWorkersSeeThePublicKeysVariable(): void
    {
        $docker = (string) file_get_contents(dirname(__DIR__, 2) . '/docker/php/Dockerfile');
        self::assertStringContainsString('env[MUSIC_PUBLIC_KEYS] = $MUSIC_PUBLIC_KEYS', $docker, 'FPM clears the worker environment; compose.music-local.yaml sets this variable');
        $local = (string) file_get_contents(dirname(__DIR__, 2) . '/compose.music-local.yaml');
        self::assertStringContainsString('MUSIC_PUBLIC_KEYS: /var/www/html/games/workroom/test/fixtures/public.json', $local);
    }
```

- [ ] **Step 2: Run to see them fail** — `node --test workroom/test/e2e-bundle.test.ts` — FAIL (no tool); from `websites/www.cs`, `vendor/bin/phpunit tests/php/MusicDeployTest.php` — FAIL.

- [ ] **Step 3: Implement the tool** (`games/workroom/tools/e2e-bundle.ts`):

```ts
// Builds the workroom page with the TEST notes keys built in
// (test/fixtures/public-key.ts in place of src/public-key.ts) into a fresh
// folder outside the repository, and prints the script's path. Only the local
// browser check (make music-e2e) uses it; dist/ is never built with a test key.
// Usage, from websites/www.cs/games: node workroom/tools/e2e-bundle.ts
import * as esbuild from 'esbuild';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..');
const src = join(root, 'src');
const testKey = join(root, 'test', 'fixtures', 'public-key.ts');
const out = join(mkdtempSync(join(tmpdir(), 'workroom-e2e-')), 'workroom.js');
await esbuild.build({
  absWorkingDir: root,
  entryPoints: [join(src, 'main.ts')],
  outfile: out,
  bundle: true,
  format: 'esm',
  platform: 'browser',
  target: 'es2022',
  jsx: 'automatic',
  jsxImportSource: 'preact',
  charset: 'utf8',
  logLevel: 'warning',
  plugins: [{
    name: 'test-key',
    setup(b) {
      b.onResolve({ filter: /(^|\/)public-key\.ts$/ }, a => (a.importer.startsWith(src) ? { path: testKey } : undefined));
    },
  }],
});
console.log(out);
```

- [ ] **Step 4: The server's test keys.** `compose.music-local.yaml`:

```yaml
# Local only (make music-e2e); CI and the host never read it. Points the
# workroom's server at the TEST public keys, so notes sealed by the check's
# test-key page (games/workroom/tools/e2e-bundle.ts) are accepted. Used with
# compose.admin-local.yaml.
services:
  www-cs-php:
    environment:
      MUSIC_PUBLIC_KEYS: /var/www/html/games/workroom/test/fixtures/public.json
```

  In `docker/php/Dockerfile`, end the `RUN echo 'env[...]'` chain with one more line (FPM clears the worker environment; the line does nothing when the variable is unset):

```dockerfile
    && echo 'env[ADMIN_MAIL_CAPTURE_DIR] = $ADMIN_MAIL_CAPTURE_DIR' >> /etc/php-fpm.d/www.conf \
    && echo 'env[MUSIC_PUBLIC_KEYS] = $MUSIC_PUBLIC_KEYS' >> /etc/php-fpm.d/www.conf
```

- [ ] **Step 5: The Makefile.** Beside `MUSIC_PY ?= …` add:

```make
# The tool's interpreter as an absolute path when it is one (the browser check runs it from tests/e2e); a bare python3 stays a command name.
MUSIC_PY_ABS = $(if $(findstring /,$(MUSIC_PY)),$(abspath $(MUSIC_PY)),$(MUSIC_PY))
```

  The `music-e2e` recipe becomes (same gates and teardown; the third compose file, the test-key bundle, and the two variables are new):

```make
music-e2e:
	@name=music-e2e-$$$$; files="-f compose.yaml -f compose.admin-local.yaml -f compose.music-local.yaml"; bundle_dir=; \
	export ADMIN_SMOKE_DIR=/tmp/$$name; \
	trap 'docker compose $$files -p $$name down -v >/dev/null 2>&1; [ -z "$$bundle_dir" ] || rm -rf "$$bundle_dir"' EXIT; \
	bundle=$$(cd games && node workroom/tools/e2e-bundle.ts) && bundle_dir=$$(dirname "$$bundle") && \
	docker compose $$files -p $$name up -d --build www-cs-php www-cs-nginx >/dev/null && \
	addr=$$(docker compose $$files -p $$name port www-cs-nginx 80) && port=$${addr##*:} && \
	ready=0; for i in $$(seq 1 60); do if curl -sf -o /dev/null -H 'Host: localhost' "http://127.0.0.1:$$port/admin/login.php"; then ready=1; break; fi; sleep 1; done; \
	test $$ready = 1 || { echo "music-e2e: the stack did not answer" >&2; exit 1; }; \
	docker compose $$files -p $$name exec -T -u apache www-cs-php mkdir -p $$ADMIN_SMOKE_DIR/mail && \
	MUSIC_E2E_COMPOSE="$$files" MUSIC_E2E_PROJECT=$$name MUSIC_E2E_MAIL_DIR=$$ADMIN_SMOKE_DIR/mail \
	WORKROOM_E2E_BUNDLE=$$bundle MUSIC_PY=$(MUSIC_PY_ABS) \
	E2E_BASE_URL=http://localhost:$$port/ tests/e2e/run.sh -c local.config.ts && \
	echo MUSIC-E2E-OK
```

  Update the `help` line: `music-e2e - The music workroom's browser check (test keys, fake microphone) in a throwaway docker project (local only; prints MUSIC-E2E-OK)`.

- [ ] **Step 6: The fake microphone** (`tests/e2e/local.config.ts`):

```ts
// Checks that need a local-only docker override (make music-e2e). The main
// config's testDir is this folder; these files end in .local.ts, which its
// default test match never picks up, and select.ts sees no spec. Chrome gets a
// fake microphone, already allowed, so the workroom's recordings run headless.
import { defineConfig } from '@playwright/test';
import base from './playwright.config.ts';

const chrome = base.projects?.[0];
const args = [...(chrome?.use?.launchOptions?.args ?? []), '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'];

export default defineConfig({
  ...base,
  testMatch: ['*.local.ts'],
  projects: chrome ? [{ ...chrome, use: { ...chrome.use, permissions: ['microphone'], launchOptions: { ...chrome.use?.launchOptions, args } } }] : [],
});
```

- [ ] **Step 7: The answering tests** (`tests/e2e/workroom.local.ts`). Update the file's top comment to add "…; then answering with the test keys: pin a typed note, pick it up with the owner's tool, read and delete it on a second device; hum (and find a recording kept, not lost, when the mode changes mid-recording), react, draw the energy, and a note made offline that waits and then goes". Extend the `node:fs` import with `mkdtempSync`, `readdirSync`, `writeFileSync` and add `import { tmpdir } from 'node:os';`. Rename `VIEW_TABS` to `GUIDE_VIEWS = ['story', 'roll', 'sound', 'sheet', 'energy'] as const` (the energy drawing has a guide too) and use it in `signedInPage`. Add these helpers after `publishFixtureDraft`:

```ts
const FIXTURES = join(SITE, 'games', 'workroom', 'test', 'fixtures');
const testKey = JSON.parse(readFileSync(join(FIXTURES, 'test-key.json'), 'utf8')) as { fingerprint: string; pkcs8: string; passphrase: string; keyring: object };

/** The page with the TEST notes keys built in (games/workroom/tools/e2e-bundle.ts) in place of the shipped script. */
async function withTestKeys(page: Page): Promise<void> {
  const bundle = process.env.WORKROOM_E2E_BUNDLE;
  if (!bundle) throw new Error('WORKROOM_E2E_BUNDLE is not set: run this through make music-e2e');
  await page.route('**/games/workroom/dist/workroom.js*', r => r.fulfill({ contentType: 'text/javascript', body: readFileSync(bundle, 'utf8') }));
}

async function uploadTestKeyring(request: APIRequestContext, base: string, key: string): Promise<void> {
  const up = await request.post(`${base}music/api/keyring.php`, { headers: { Authorization: `Bearer ${key}` }, data: testKey.keyring });
  expect(up.status()).toBe(201);
}

/** On a phone the notes panel is the bottom sheet: open it. */
async function openNotes(page: Page): Promise<void> {
  const handle = page.locator('[data-sheet] > button[aria-expanded="false"]');
  if (await handle.isVisible()) await handle.click();
}

/** Notes are listed only after an unlock, and nothing is remembered: every load of a page starts by unlocking. */
async function unlock(page: Page, passphrase: string): Promise<void> {
  await openNotes(page);
  await page.getByLabel('Passphrase').fill(passphrase);
  await page.getByRole('button', { name: 'Unlock notes' }).click();
}

/** The pin composer's textbox, by its role and name: the panel that lists the notes has another name. */
const noteBox = (page: Page) => page.getByRole('textbox', { name: 'Your note', exact: true });

/** Pinning keeps the timeline on screen: Pin a note scrolls the Story view into view, and the picked span stays in view above the composer (docked at the bottom of a phone, in the page's flow from 1024 px). */
async function pinSpan(page: Page, x0: number, x1: number): Promise<void> {
  await page.getByRole('button', { name: 'Pin a note' }).click();
  await expect(page.locator('[data-timeline]')).toBeInViewport();
  await dragAcross(page, '[data-timeline]', x0, x1, 120);
  await expect(page.locator('[data-selection]')).toBeVisible();
  const viewport = page.viewportSize()!;
  const selection = (await page.locator('[data-selection]').boundingBox())!;
  const composer = (await page.locator('[data-pin-composer]').boundingBox())!;
  expect(selection.y).toBeGreaterThanOrEqual(0);
  expect(selection.y + selection.height).toBeLessThanOrEqual(Math.min(viewport.height, composer.y) + 1);
}

/** Drags across a drawing from (x0, y) to (x1, y), as fractions of its width and pixels from its top. */
async function dragAcross(page: Page, selector: string, x0: number, x1: number, y0: number, y1 = y0): Promise<void> {
  const box = (await page.locator(selector).boundingBox())!;
  await page.mouse.move(box.x + box.width * x0, box.y + y0);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * x1, box.y + y1, { steps: 10 });
  await page.mouse.up();
}
```

  Add the two tests before the screens test:

```ts
test('pin a note, pick it up with the tool, read and delete it on a second device', async ({ browser, request, baseURL }) => {
  test.setTimeout(240_000);
  const base = baseURL!;
  const { context, page } = await signedInPage(browser, base);
  try {
    await withTestKeys(page);
    const publish = await createKey(page, base, 'e2e answer publish', ['drafts:publish', 'keys:publish']);
    const pickupKey = await createKey(page, base, 'e2e answer pickup', ['notes:pickup']);
    await publishFixtureDraft(request, base, publish);
    await uploadTestKeyring(request, base, publish);

    await page.goto(`${base}music/piece.php?id=test-piece`);
    await unlock(page, testKey.passphrase);
    await expect(page.locator('[data-history]')).toBeVisible();
    await pinSpan(page, 0.5 + 0.005, 0.85);
    await expect(page.locator('[data-pin-span]')).toHaveText(/^For Bars 5–7 · .* · Horns$/);
    await noteBox(page).fill('louder and slower right here');
    await page.getByRole('button', { name: 'Send', exact: true }).click();
    await expect(page.getByRole('status')).toHaveText('Sent. It is waiting for pickup.');
    const mine = page.locator('[data-note]', { hasText: 'louder and slower right here' });
    await expect(mine.locator('[data-state]')).toHaveText('Waiting');
    await expect(page.locator('[data-note-mark]').first()).toBeVisible();

    // The pieces list counts per piece once unlocked.
    await page.goto(`${base}music/`);
    await unlock(page, testKey.passphrase);
    await expect(page.locator('a[data-waiting="test-piece"] + .waiting-count')).toHaveText('1 waiting');

    // Claude's side: the owner's tool picks it up from this docker stack.
    const home = mkdtempSync(join(tmpdir(), 'siue-music-e2e-'));
    writeFileSync(join(home, 'music.json'), JSON.stringify({ v: 1, keys: { [testKey.fingerprint]: testKey.pkcs8 }, api: { 'music-pickup': pickupKey } }), { mode: 0o600 });
    const run = spawnSync(process.env.MUSIC_PY ?? 'python3', [join(SITE, 'music', 'tools', 'siue-music'), 'pickup'], {
      encoding: 'utf8',
      env: { ...process.env, SIUE_CONFIG_DIR: home, SIUE_MUSIC_NOTES_DIR: join(home, 'notes'), SIUE_MUSIC_BASE: `${base}music/`, SIUE_MUSIC_PUBLIC_KEYS: join(FIXTURES, 'public.json') },
    });
    expect(run.status, run.stderr).toBe(0);
    expect(run.stdout).toMatch(/Picked up 1 note into/);
    const [folder] = readdirSync(join(home, 'notes'));
    expect(JSON.parse(readFileSync(join(home, 'notes', folder!, 'note.json'), 'utf8')).body.text).toBe('louder and slower right here');

    await page.goto(`${base}music/piece.php?id=test-piece`);
    await unlock(page, testKey.passphrase);
    await expect(mine.locator('[data-state]')).toHaveText('Picked up');

    // A second device: a phone signs in, unlocks with the passphrase, reads, deletes. Nothing of a key is stored.
    const phone = await browser.newContext({ viewport: { width: 390, height: 844 } });
    await phone.addInitScript((views: readonly string[]) => { for (const v of views) { localStorage.setItem(`workroom-guide-${v}`, 'seen'); localStorage.setItem(`workroom-guide-sound-${v}`, 'seen'); } }, GUIDE_VIEWS);
    const p2 = await phone.newPage();
    await withTestKeys(p2);
    await signIn(p2, base);
    await p2.goto(`${base}music/piece.php?id=test-piece`);
    await unlock(p2, 'not it');
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
      const local = Object.fromEntries(Object.keys(localStorage).map(k => [k, localStorage.getItem(k)]));
      return { local, session: Object.keys(sessionStorage), stores, cookies: document.cookie, caches: typeof caches === 'undefined' ? [] : await caches.keys() };
    });
    expect(Object.keys(stored.local).filter(k => !/^workroom-(guide-|theme$)/.test(k))).toEqual([]);
    expect(stored.session).toEqual([]);
    expect(stored.stores.filter(s => s !== 'siue-music/outbox')).toEqual([]);
    expect(stored.cookies).toBe('');
    expect(stored.caches).toEqual([]);
    expect(JSON.stringify(stored)).not.toContain(testKey.passphrase);
    await p2.reload();
    await openNotes(p2);
    await expect(p2.getByRole('button', { name: 'Unlock notes' })).toBeVisible();
    await expect(p2.getByText('louder and slower right here')).toHaveCount(0);
    await unlock(p2, testKey.passphrase);
    await p2.locator('[data-note]', { hasText: 'louder and slower right here' }).getByRole('button', { name: /^Delete note from/ }).click();
    await expect(p2.getByText('louder and slower right here')).toHaveCount(0);
    await phone.close();
  } finally {
    await context.close();
  }
});

test('hum, react and draw the energy; a note made offline waits on this device and goes when the connection is back', async ({ browser, request, baseURL }) => {
  test.setTimeout(240_000);
  const base = baseURL!;
  const { context, page } = await signedInPage(browser, base);
  try {
    await withTestKeys(page);
    const publish = await createKey(page, base, 'e2e answer more', ['drafts:publish', 'keys:publish']);
    await publishFixtureDraft(request, base, publish);
    await uploadTestKeyring(request, base, publish);
    await page.goto(`${base}music/piece.php?id=test-piece`);
    await unlock(page, testKey.passphrase);
    await expect(page.locator('[data-history]')).toBeVisible();

    await page.getByRole('button', { name: 'Hum it' }).click();
    await expect(page.getByRole('button', { name: 'Stop (0:01 of 1:00)' })).toBeVisible({ timeout: 10_000 });
    await page.getByRole('button', { name: /^Stop \(/ }).click();
    const hum = page.locator('[data-note]', { hasText: 'Humming' });
    await expect(hum).toHaveCount(1);
    await expect(hum.locator('audio[data-note-audio]')).toHaveAttribute('src', /^blob:/);

    // Switching to another mode while humming stops the microphone and keeps the recording to send or discard.
    await page.getByRole('button', { name: 'Hum it' }).click();
    await expect(page.getByRole('button', { name: /^Stop \(/ })).toBeVisible({ timeout: 10_000 });
    await page.getByRole('button', { name: 'React' }).click();
    await expect(page.locator('[data-held-recording]')).toBeVisible();
    await expect(page.getByRole('button', { name: /^Stop \(/ })).toHaveCount(0);
    await page.getByRole('button', { name: 'Discard recording' }).click();
    await expect(page.locator('[data-held-recording]')).toHaveCount(0);
    await expect(hum).toHaveCount(1);

    // A reaction is one tap, and the bar stays open for the next.
    await expect(page.locator('[data-react-bar]')).toContainText('React to: The Labyrinth stirs');
    await page.getByRole('button', { name: 'Love it' }).click();
    await expect(page.locator('[data-note]', { hasText: 'Reaction: Love it' })).toHaveCount(1);
    await expect(page.locator('[data-react-bar]')).toBeVisible();

    await page.getByRole('button', { name: 'Draw the energy' }).click();
    await expect(page.locator('[data-energy-editor]')).toBeVisible();
    await expect(page.locator('[data-legend]')).toHaveText('dashed = the energy now · green = your shape · higher = more intense');
    await dragAcross(page, '[data-energy-editor]', 0.2, 0.8, 140, 20);
    await page.getByRole('button', { name: 'Send this shape' }).click();
    await expect(page.locator('[data-note]', { hasText: 'Energy shape' })).toHaveCount(1);
    await expect(page.locator('[data-timeline]')).toBeVisible();

    await context.setOffline(true);
    await page.getByRole('button', { name: 'Pin a note' }).click();
    await expect(page.locator('[data-timeline]')).toBeInViewport();
    const box = (await page.locator('[data-timeline]').boundingBox())!;
    await page.locator('[data-timeline]').click({ position: { x: box.width * 0.25, y: 90 } });
    await expect(page.locator('[data-pin-span]')).toHaveText(/^For Bar \d+ · /);
    await noteBox(page).fill('made with no connection');
    await page.getByRole('button', { name: 'Send', exact: true }).click();
    await expect(page.getByRole('status')).toContainText('No connection');
    await expect(page.locator('[data-kept-note]')).toHaveCount(1);
    const waiting = await page.evaluate(() => new Promise<number>((resolve, reject) => {
      const r = indexedDB.open('siue-music');
      r.onsuccess = () => { const q = r.result.transaction('outbox').objectStore('outbox').count(); q.onsuccess = () => resolve(q.result); q.onerror = () => reject(q.error); };
      r.onerror = () => reject(r.error);
    }));
    expect(waiting).toBe(1);
    await context.setOffline(false);
    await expect(page.locator('[data-kept-note]')).toHaveCount(0, { timeout: 15_000 });
    await expect(page.locator('[data-note]', { hasText: 'made with no connection' })).toHaveCount(1);
  } finally {
    await context.close();
  }
});
```

- [ ] **Step 8: Run the unit and PHP tests** — `node --test workroom/test/e2e-bundle.test.ts` — PASS; `vendor/bin/phpunit tests/php/MusicDeployTest.php` — PASS; `cd tests/e2e && npm ci --silent && node_modules/.bin/tsc -p tsconfig.json` — exit 0; `node tests/e2e/select.ts --check` — exit 0 (no spec was added).

- [ ] **Step 9: Run the check** — from `websites/www.cs`: `music/tools/ensure-venv music/tools/.venv music/tools/requirements.txt` (once; it makes the tool's virtualenv, which `MUSIC_PY` then finds), then `make music-e2e` — every test passes and `MUSIC-E2E-OK` prints; afterwards `docker compose ls` lists no `music-e2e-*` project and no `workroom-e2e-*` folder is left in the temporary directory. Never run it against port 3000, 5173, 8000 or 8080: nginx's host port is ephemeral.

- [ ] **Step 10: Commit**

```bash
git add websites/www.cs/games/workroom/tools/e2e-bundle.ts websites/www.cs/games/workroom/test/e2e-bundle.test.ts websites/www.cs/compose.music-local.yaml websites/www.cs/docker/php/Dockerfile websites/www.cs/tests/php/MusicDeployTest.php websites/www.cs/Makefile websites/www.cs/tests/e2e/local.config.ts websites/www.cs/tests/e2e/workroom.local.ts
git commit -m "Music workroom: the browser check answers with the test keys and a fake microphone

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb"
```

### Task 18: The answering screens, the README, the gates and the pull request

**Files:**
- Modify: `tests/e2e/workroom.local.ts` (the screens), `music/README.md`

**Interfaces:**
- Consumes: Tasks 1–17.
- Produces: screenshots of every screen (old and new) at 390 and 1280 px in dark and light, in a scratch folder outside the repository; the pull request.

- [ ] **Step 1: The answering screens.** In `tests/e2e/workroom.local.ts`, add to `SCREENS` (after `guide`, before `sound-story`):

```ts
  { name: 'notes-locked', path: 'music/piece.php?id=test-piece', ready: async p => { await openNotes(p); await expect(p.getByRole('button', { name: 'Unlock notes' })).toBeVisible(); } },
  { name: 'notes', path: 'music/piece.php?id=test-piece', ready: async p => { await unlock(p, testKey.passphrase); await expect(p.locator('[data-history]')).toBeVisible(); } },
  { name: 'pin', path: 'music/piece.php?id=test-piece', ready: async p => {
    await expect(p.locator('[data-timeline]')).toBeVisible();
    await pinSpan(p, 0.5, 0.85);
    await noteBox(p).fill('More horns here, and hold the last chord longer.');
  } },
  { name: 'react', path: 'music/piece.php?id=test-piece', ready: async p => { await p.getByRole('button', { name: 'React' }).click(); await expect(p.locator('[data-react-bar]')).toBeVisible(); } },
  { name: 'energy', path: 'music/piece.php?id=test-piece', ready: async p => {
    await p.getByRole('button', { name: 'Draw the energy' }).click();
    await dragAcross(p, '[data-energy-editor]', 0.3, 0.7, 140, 30);
    await expect(p.locator('[data-energy-drawn]')).toBeVisible();
  } },
  { name: 'energy-guide', path: 'music/piece.php?id=test-piece', ready: async p => {
    await p.getByRole('button', { name: 'Draw the energy' }).click();
    await p.getByRole('button', { name: 'How to read this' }).click();
    await expect(p.locator('[data-guide-card]')).toContainText('Part 1 of 4');
  } },
  { name: 'hum-recording', path: 'music/piece.php?id=test-piece', ready: async p => { await p.getByRole('button', { name: 'Hum it' }).click(); await expect(p.getByRole('button', { name: /^Stop \(/ })).toBeVisible(); } },
  { name: 'pieces-unlocked', path: 'music/', ready: async p => { await unlock(p, testKey.passphrase); await expect(p.locator('[data-pieces-notes]')).toContainText('Each piece shows'); } },
  { name: 'sound-react', path: 'music/piece.php?id=cannon-fire', ready: async p => { await p.getByRole('button', { name: 'React' }).click(); await expect(p.locator('[data-react-bar]')).toBeVisible(); } },
```

  In the screens test: raise its timeout to `600_000`; make the key with `['drafts:publish', 'keys:publish']`, call `await uploadTestKeyring(request, base, key)` after the drafts, and `await withTestKeys(page)` before the loop, so every screen shows the page as it is once a key is built in. The test's existing checks (no sideways scroll at 390 px, every button, link, select and tab at least 44 px, no CSP errors, the theme set) now cover the answering screens too.

- [ ] **Step 2: Run the screens** — from `websites/www.cs`: `MUSIC_E2E_SHOTS=/private/tmp/workroom-answer-shots make music-e2e` (any scratch folder outside the repository) — all tests pass, `MUSIC-E2E-OK` prints, and the folder holds `<screen>-<390|1280>-<dark|light>.png` for every screen, the nine new ones included. Look at each new one at both widths and both themes: tokens only (no stray colours), the composer is docked above the handle at 390 px with the timeline and the picked span visible above it (the `pin` screen asserts it; look at it too), the bottom sheet's handle stays reachable, the energy drawing is not clipped, the record and Stop buttons are the only red (Delete, Discard and error lines are not), Waiting is amber and Picked up green.

- [ ] **Step 3: The README** (`music/README.md`), describing what is, never what changed:
  - A new section **Answering**, after "The look": the answer bar (Pin a note, Hum it, React, Draw the energy) and what each sends; notes are sealed in the browser to the key built into the page; pinning scrolls the Story view into view and picks a span on it (a drag, or a tap for one moment; the lane only when the drag starts and ends in one lane), with the composer docked at the bottom of a phone so the timeline stays visible; the recorder (60 s, the first type the browser records, the microphone asked for inside the tap, 64 kb/s); the energy drawing and its own guide (`workroom-guide-energy`); the notes panel "Notes & answers" (unlock with the passphrase on every visit, the history of this piece or all pieces, Delete, Delete all and Discard, each asking first in plain words; the notes not sent yet); Chrome may offer to save the unlock form's username and passphrase, and the owner answers Never (1Password fills the form either way); the outbox (IndexedDB `siue-music` / `outbox`, sealed bundles only, sent on load and when the browser is back online, one tab at a time under the Web Locks lock `workroom-outbox`, Discard to drop one; a browser that refuses IndexedDB keeps the note in memory and says so); nothing typed or recorded is cleared until the note is stored, and a recording that is not stored stays on screen to Send or Discard; the pieces list's per-piece counts after an unlock; with no key built in, "Notes are off".
  - **Security model** gains: "The only browser storage the workroom writes besides the theme and the guide flags is the outbox: sealed notes waiting to be sent. Nothing of any key, and nothing in the clear about a note, is stored in the browser."
  - **The local browser check**: it also uploads the test keyring, routes the page to a test-key build (`node games/workroom/tools/e2e-bundle.ts`, written outside the repository), points the server at the test public keys (`compose.music-local.yaml`), records with Chrome's fake microphone, pins a typed note, picks it up with `siue-music pickup` (needs the tool's virtualenv, which `make music-setup` also makes), reads and deletes it on a second, phone-sized device, hums, reacts, draws the energy, and sends a note made offline once the connection is back; the shipped `dist/workroom.js` never carries a test key. `MUSIC_E2E_SHOTS=<folder>` saves every screen.

- [ ] **Step 4: Gates** — from `websites/www.cs`: `sh games/units.sh`; `(cd games && npm ci --silent && npm run --silent check)`; `vendor/bin/phpunit --testsuite site`; `vendor/bin/phpunit --testsuite kit`; `make music-test`; `cd tests/e2e && npm ci --silent && node_modules/.bin/tsc -p tsconfig.json`; `node tests/e2e/select.ts --check`; then `make test` (its docker steps under a unique project name). All exit 0. `git status` shows no stray files (no `.tmp-*` folders from `importTsx`, no screenshots, no test bundles).

- [ ] **Step 5: Commit** — `git add websites/www.cs/tests/e2e/workroom.local.ts websites/www.cs/music/README.md` and commit "Music workroom: the answering screens and the README" with the trailers.

- [ ] **Step 6: Open the pull request** — `git push -u origin music/answer-ui`, then `gh pr create --base main --head music/answer-ui --title "Music workroom: answering in the page (pin, hum, react, energy, history, outbox)"` with a body that has: a summary (the answer bar, the composers, the energy drawing, unlock and the history, Delete and Delete all, the outbox, per-piece counts, the guide and legends for the new parts); the spec and plan paths; the results of `sh games/units.sh`, `npm run check`, the PHP suites and `make music-e2e`; where the screenshots are and that they go to the owner before merge (theme spec); and **the owner's first-run steps after merge and deploy, which this PR's code does not do**: run `make music-setup` (it guides the `music-pickup` and `music-publish` API keys, makes the notes key, uploads the locked copy, rebuilds the page and opens the key pull request); merge that pull request once its checks pass; after its deploy, compare the hub's notes key fingerprint with `make music-status`; unlock once on the phone with 1Password, and answer Never if Chrome offers to save the passphrase. End the body with the PR attribution lines. Then hand the PR to the foundry `pr-fix-loop`.

---

## Self-review

- **Spec coverage.** Pin a note, typed or spoken, on a moment or span and optionally a lane: Tasks 3, 12, 14, 15. Hum up to 60 s: Tasks 3, 5, 12, 15. React on a section (eight reactions, the whole piece when there is no section): Tasks 1, 3, 12, 15. Draw the energy: Tasks 4, 13, 15. Each note tied to its draft, bars and seconds on music, seconds on sound: Task 3. Sealed in the browser, server sees only sealed bytes: Task 9 (seal before the outbox). Notes stay sealed until the owner deletes; history on any device after unlock, waiting or picked up, Delete and Delete all: Tasks 8, 9, 11. Upload limits (60 s, 2 MB, 2,000) with the note kept in the browser and a plain message: Tasks 3, 5, 7. Keys never in browser storage, passphrase every visit: Tasks 9, 11, 17. Pieces list's waiting counts: Task 16. Claude's changes beside the notes they answer: Tasks 8, 11 (and the existing change pins). The look (tokens, components, 44 px, no Escape, dark and daylight), the guide and legends for the new parts: Tasks 2, 10–15, 18. Phone first (the composers in the main column, the notes in the bottom sheet): Task 15, checked at 390 px in Task 18. Screenshots to the owner: Task 18.
- **Carried rulings.** The body check before the history renders (reused and tightened from `seal.ts`): Task 3. The section-boundary epsilon: Task 1. Panel's name, the Sheet's `aria-controls`, the Sheet open class and Tabs focus tests: Task 2. The recorder (60 s, MIME order, the tap, the audio session): Task 5. The test public key path and the FPM `env[]` line: Task 17. Post-deploy steps only in the PR body: Task 18.
- **Types used across tasks.** `Span` (`hit.ts`), `NoteBody`/`isNoteBody` (`note.ts`), `NoteMark` (`answer.ts`, made by `history.ts`, read by `Timeline.tsx` and `guide.ts`), `Curve` (`energy.ts`), `MediaPorts`/`Recording` (`recorder.ts`), `PageApi`/`ServerNote` (`api.ts`), `Pending`/`AddReport`/`KEPT_MESSAGES`/`SENT_MESSAGE` (`outbox.ts`), `HistoryItem` (`history.ts`), `NotesSession` (`notes-session.ts`), `GuideView` (`guide.ts`), `AnswerMode` (`AnswerBar.tsx`), `TimelineSelect` (`Timeline.tsx`) are each defined once and named the same wherever they are used.
- **Pre-flight rulings.** Pinning keeps the timeline on screen (scrolled into view, composer docked, asserted in the browser check at 390 × 844): Tasks 12, 15, 17, 18. Distinct names, the “Your note” textbox against the “Notes & answers” panel: Tasks 11, 12, 17. A recording always has a visible Stop, and a mode change keeps the recording: Tasks 12, 15, 17. The recorder releases the microphone on any failure: Task 5. A drawn or the piece's own energy curve is resampled to 512 points: Task 3. Nothing typed or recorded is cleared until the note is stored; an IndexedDB write failure falls back to memory with a notice; a seal failure keeps the composer: Tasks 7, 9, 12, 15. Red only for recording, destructive buttons secondary with explicit words: Tasks 11, 18. `idb.ts` tested against `fake-indexeddb`: Task 7. One Delete asks first: Task 11. The outbox flush runs under a Web Locks lock: Tasks 7, 16. The energy drawing holds the playhead's follow while a stroke is drawn: Tasks 13, 15. The pinned lane needs both drag ends in one lane: Task 14. File map, `MAX_NOTES` (the “server is full” message) and the “3,500” count agree with the code. Escape is checked at run time for every new composer, question and overlay: Tasks 11, 12, 15. The unlock form keeps the hidden username for 1Password: Task 11. A reaction is one tap and the bar stays open: Task 15.
