## Global Constraints

- **No server storage for levels; links only.** Nothing about a shared level is sent to the server: the level travels in the URL fragment.
- **No free text from players.** A share link never carries a title, intro or page id. A shared level's name is generated: `Level XXXX by ABC`.
- **Initials** are the kit's `validInitials` (`games/_kit/initials.ts`): three letters A–Z, uppercased, never a word in `blocked-initials.json`. A refusal reads `Pick three letters that are not a word on the blocked list.`
- **Only a proven level is shared.** That means solved, with a line that replays to a win, and `sharedProblems(d)` empty. Stopping a search means "not shareable yet", never "shared unproven".
- **The solver runs only when asked:** on Check, on Share when the level changed since the last check, and on opening a link (for the rating). Editing never starts a search.
- **The author's best** counts only a win in Try it with no thread help.
- **The level text** (`src/puzzle/level.ts`) is the source of truth. The link is a compressed, versioned encoding of it.
- Esc is never bound; Q is the kit's back key. Tests never bind ports 3000, 5173, 8000 or 8080.
- Docs and comments describe current state, never history.
- **After any change** under `src/`, `game.css`, `index.html` or `build.json`:
  - from `websites/www.cs/games`, run `node _kit/build/build.mjs crete`;
  - in `games/crete`, run `php tools/install-files.php`;
  - in `websites/www.cs`, run `php tools/site-versions.php && php tools/site-game-pages.php`.
  
  Commit the generated files with the source.
- **Tests.** Unit tests: from `websites/www.cs/games`, `node --test crete/test/<file>.test.ts`; all of them with `bash units.sh`; the type and build check with `sh crete/test.sh`. Agents run unit suites plus at most two browser specs; CI runs the rest. A new spec gets a weight in `websites/www.cs/tests/e2e/shard.ts` and a mapping in `select.ts`.

## Rulings made while planning

These are the spec's "left to the builder" choices, plus two departures from settled calls. The departures are flagged for the owner's review.

- **Link format.** The link is `<game page>#L1.<payload>`.
  - `L1` is the format version.
  - The payload is base64url (no padding) of `deflate-raw` of UTF-8 text with this shape:
    - `by: ABC`
    - `best: 54` (only when there is a best)
    - `line: <move letters>`
    - a blank line
    - the level text as `serialize` writes it, with an empty title and intro and no `pages:`.
  - Move letters are `cache.ts`'s `lineText`.
  - A version other than `L1` reads as "made by a newer version of the game".
- **Link limits.**
  - `ENCODED_MAX = 16_384` characters after `#L1.`. This is checked before decompressing.
  - `DECODED_MAX = 32_768` characters. This is enforced chunk by chunk while decompressing, which aborts past it.
  - `MAX_LINE = 20_000` moves.
  - Board sides are 3 to 64. The shape is checked on the raw grid lines before `parse` runs.
  - The worst case is a 64 × 64 board drawn at random from every legend character, plus a 20,000-move random line. A test pins it under `ENCODED_MAX`, which is well inside what browsers and chat apps open.
- **Rejecting a link.** Beyond the limits above, two checks refuse a link:
  - The `best` is an integer of at least the line's length; a smaller best is damaged.
  - The line must replay to a win on its last move; otherwise the link is damaged.
- **Generated name.** `levelCode(text)` takes the first 20 bits of SHA-256 of the link's level text. Those bits become 4 characters from `ABCDEFGHJKLMNPQRSTUVWXYZ23456789`, five bits each, high bits first. The name is `Level ${code} by ${initials}`.
- **Cache eviction.**
  - After each put, the worker's disk store trims `crete-results/`.
  - An entry whose key carries another version goes first.
  - After that, the oldest by file `lastModified` go, down to `RESULT_LIMIT = 256` entries.
- **Cancel.** `SolverJob.cancel()` posts `{type:'cancel', id}`, drops the route at once and rejects `result` with `CancelledError`. The host treats `cancel` like a newer search arriving: the job ends and its node file closes. Stop and Keep searching stay the existing `stop()`/`resume()`.
- **Check runs one `measure`.** Share waits for that whole measure, including the catch-refusing search, which only feeds the rating. *Departure:* the spec says the catch-refusing search does not block Share. One search kind, one cache entry and one progress bar are much simpler. On every Chapter 1 level the catch-refusing search costs at most what the main solve costs. The owner accepted this departure.
- **`Difficulty.line`.** `measure` keeps the shortest winning line as move letters (`''` when unsolved), so Check produces the proof Share puts in the link without a second solve.
- **The editor is a view on the game page**, not a page of its own. *Departure, chosen by the owner:* the spec puts the editor on its own page, but the owner wants Try it on the full game screen, with its start card, status bar, strip, menu, thread help and end card. One page gives that without a second copy of the game's wiring.
  - `games/crete/#edit` opens the editor.
  - Its code lives in `src/editor/` and is bundled into `main.js`.
  - The editor is a layer (`editor`) over the game frame. While it is the top layer, keys go to the editor.
  - Try it opens the draft as an outside level. The menu and the end card offer **Back to the editor** (`menu-editor`, `end-editor`).
- **Editor keys** (never Esc):
  - U, Ctrl/⌘+Z: undo
  - Y, Ctrl/⌘+Y, Ctrl/⌘+Shift+Z: redo
  - P: Try it
  - C: Check
  - O: rotate the brush's direction
  - Q: close a dialog, else leave the editor for the title card (the draft is kept for this page's life)
- **The thread on a proven line.** `Levels` gains `line?(i): readonly Action[] | null`. While the try's actions so far are exactly a prefix of that line, the thread uses the rest of it rather than solving in the page. Otherwise it solves as today.
- **Outside levels record nothing.** A try or a shared level records no progress and no pages. The end card names the level and gives the author's best: `beat 54` before, and `You beat the author's 54.` or `The author's best is 54.` after.
- **Owner flag.** The kit pref `crete-owner` set to `on` shows the campaign fields:
  - id, title, intro;
  - the page brush, with a page id per page cell.
  
  It also shows **Copy for trials.ts**, which copies `{ id: '<id>', text: \`<serialize>\` },` with backticks and `${` escaped. This is not a security boundary.
- **Finding the editor.** The title card gains **Make a level** (`#title-editor`, key E), which opens the editor.

