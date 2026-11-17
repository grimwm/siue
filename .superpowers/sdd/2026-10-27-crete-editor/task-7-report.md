# Task 7 report: the game screen plays a level from outside the campaign

Status: DONE. Commit `255f3ee` on `crete-editor` (parent 299d842). Not pushed.

## Implemented

- `src/campaign/chapters.ts`: `OutsideLevel` (verbatim from the brief), and `Levels.outside?(i)` and `Levels.line?(i)`. The `scratch` doc now says outside levels are scratch levels.
- `src/game.ts`:
  - `played: Action[]`. A move that changes the try pushes. An undo that changes the try pops. Restart and open clear it.
  - `line()` returns `known.slice(played.length)` while `played` is a prefix of `levels.line(trial)`. Otherwise it solves as before.
  - `GameDeps.solve?` is an optional injection seam for the thread's search; it defaults to the solver's `solve`. The test wraps it with a call counter.
  - `sameAction` compares two actions.
- `src/ui/start.tsx`: optional `kicker` (it replaces the chapter and level kicker) and optional `best` (`<p id="start-best">`, shown only when given).
- `src/ui/end.tsx`:
  - `EndView.hasLevels`: the Levels button shows only for a campaign win.
  - `onBackToEditor?`: shows `#end-editor` "Back to the editor" only when given.
- `src/ui/menu.tsx`: `onBackToEditor?` shows `#menu-editor` "Back to the editor" in its own section before Quit, only when given.
- `src/ui.ts`: `Controls.backToEditor?()`. Every campaign read for the level in play is rerouted (listed below).
- `src/main.ts`:
  - One outside slot at index `OUTSIDE = CAMPAIGN_LEVELS.count`, just past the campaign. The slot holds `{ level, about, line }`.
  - `levels.outside`, `levels.line` and `levels.scratch` are true or non-null only for that index. The level stays in the slot until the next `playLevel`, so Retry or R reopens it. Before this change, the scratch level opened once at index 0, and Retry then opened campaign level 1.
  - New signature: `playLevel(level, opts?: { outside?: OutsideLevel; line?: readonly Action[] })`. Without `opts.outside`, the level is a `try` named by its title, or "Your level" when it has none.
  - The `__creteTest` export line is unchanged, so the `smoke.test.ts` pin holds.
  - `backToEditor` is left undefined.

## How ui.ts gets `levels`

Through `UiDeps.levels?: Pick<Levels, "outside">`. It is optional; without it, every level is the campaign's. main.ts passes the same `levels` object it gives the game. `backToEditor` comes through `Controls` as the brief says.

## Campaign reads rerouted in ui.ts

Each read goes through `outsideOf(g) = levels.outside?.(g.trial)`:

1. `drawLayers`: `playing = chapterOf(g.trial)` is now null for an outside level. That gives:
   - the levels list a `current` of -1;
   - the start card a kicker of `Your level` or `Shared level`, its title set to `outside.name`, and `beat N` (`#start-best`) when a shared level has a best.
2. `endView`, win branch:
   - before: `progress.get(LEVEL_IDS[g.trial])`, `g.trial + 1 < LEVEL_IDS.length` and `chapterOf(g.trial).within`, plus the pages line from `CHAPTERS` lore;
   - outside: kicker `Your level` or `Shared level`, title `name`, `hasNext` false, `hasLevels` false, no pages, no progress best in the score;
   - the text adds ` You beat the author's N.` (only for an unassisted win with fewer moves than N) or ` The author's best is N.`
3. `render`: the status bar's `trial` (`chapterOf(...)within/len`) is empty for an outside level, so it shows `–`.
4. `render`: the closing chapter card check (`chapterOf(g.trial)` at a chapter's last level) is skipped for an outside level.
5. `render`: the story-log line on open uses `outside.name` and leaves out `: intro` when the intro is empty.

The remaining `chapterOf`, `CHAPTERS` and `LEVEL_IDS` uses are the levels list, its picks, the chapter card and the Lore book. None of them read the level in play.

The end card's `onNext`, and Enter on a won card, use `trial + 1`. Both are gated on `hasNext`, which is false for an outside level.

## Tests

### TDD RED

From `websites/www.cs/games`:

- `node --test crete/test/game.test.ts`: `not ok 17 - the thread follows a known line while the try is on it`; `not ok 18 - undo back onto the line uses it again` (`# pass 16 # fail 2`).
- `node --test crete/test/ui.test.ts`: four of the five new tests failed (`# pass 45 # fail 4`):
  - 45 start/end name: actual vs expected kicker;
  - 46 shared win: text mismatch;
  - 47 no next/levels;
  - 49 Back to the editor: `no #end-editor`.

  `an outside win records no progress` passed at RED. The game already skipped recording for `scratch`, and the harness marks the outside level scratch. It stays as a guard.

### GREEN

- Focused: `node --test crete/test/game.test.ts crete/test/ui.test.ts crete/test/views.test.ts crete/test/smoke.test.ts`: 101/101 pass.
- `bash units.sh`: exit 0. `# tests 3386`, pass 3385, fail 0, skipped 1.
- `sh crete/test.sh`: exit 0 (type and build check). The first run caught a TS narrowing error in a new test (`SolveResult.line` unnarrowed); it is fixed.

### New tests

- `game.test.ts`:
  - `the thread follows a known line while the try is on it`: three hints and V make no solves; after a move off the line, the next hint makes exactly one.
  - `undo back onto the line uses it again`: also covers restart clearing `played`.
- `ui.test.ts`: `the start and end cards name an outside level`, `a shared win says whether it beat the author`, `an outside level offers no next level and no levels list`, `an outside win records no progress`, `Back to the editor shows in the menu and on the end card only for a try`. The shared flow harness now passes one `levels` object to both `createUi` and `createGame`. Level 10 is made the outside level, so the test also shows that no closing chapter card opens. `WON` and `LOST` gained `hasLevels`.

### Browser specs

`make e2e` could not run as-is in this environment, for two reasons:

1. `podman-compose` resolves the root `compose.yaml`'s `include:` build context against the repo root ("Dockerfile not found in .../docker/php").
2. SELinux denied nginx its bind-mounted `default.conf` (Permission denied).

I ran with:

- the site's own compose file;
- my own project, `COMPOSE="docker compose -p crete-editor-t7 -f compose.yaml -f <scratchpad>/label-off.yaml"`, where the override adds `security_opt: [label=disable]` and does not relabel files on disk;
- `E2E_BASE_URL=http://127.0.0.1:<port>/`, because podman-compose's `port` prints only the port, which makes `make url` build `http://33557/`.

Results:

- `crete-play.spec.ts`: 15 passed.
- `crete-pieces.spec.ts`, which uses `playLevel`: 2 passed.

The stack was torn down afterwards (`make down` fails under podman-compose because there is no `rm`; I used `compose down`). No containers, pods or networks are left.

## Files changed

- src: `campaign/chapters.ts`, `game.ts`, `main.ts`, `ui.ts`, `ui/end.tsx`, `ui/menu.tsx`, `ui/start.tsx`
- tests: `test/game.test.ts`, `test/ui.test.ts`
- generated: `dist/main.js`, `dist/main.js.map`, `index.html`, `sw.js`. The site-level `site-versions.php` and `site-game-pages.php` produced no further changes.

## Self-review

The diff was read in full. Comments describe current state, and a long comment line in start.tsx is wrapped. No keys were added. Esc stays unbound.

## Concerns and choices for review

- **"beat 54 before"**: I show it on the start card as `#start-best` "beat 54". The brief named no id; `start-best` is my choice.
- **When a win beats the author**: strictly fewer moves and no thread help. A tie reads "The author's best is N."
- **Pages**: an outside level with page cells (the owner's page brush) still opens the Lore entry on pickup during play. Only the end card's pages line is suppressed, and nothing is recorded because the level is scratch.
- **`GameDeps.solve?`** is a new optional dep added for the counter test. Production code does not pass it.
- **Back to the editor** shows whenever a try is the game's loaded level (`g.run` set), including in the menu opened from the title card after Quit. Task 9 may want to tighten this.
- **N during an outside level** still opens the campaign levels list. "No levels list" is applied to the end card only.
- **Without `opts.outside`**, `playLevel` now treats the level as a `try`: the start card says "Your level" and the status bar shows `–`, not Chapter 1 · Level 1. crete-pieces does not check either.
- **The e2e environment workarounds** above (podman-compose include context, SELinux labels, the port-only URL) affect every agent on this machine. The owner may want a Makefile fix.
