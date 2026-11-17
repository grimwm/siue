### Task 12: The game page opens a link

**Files:**
- Create: `src/ui/shared.tsx`
- Modify:
  - `src/main.ts`: read `location.hash` at start and on `hashchange`;
  - `src/ui.ts`;
  - `src/layers.ts`: a `shared` layer;
  - `index.html`: `#shared-root`.
- Test: `test/ui.test.ts`, `test/shared.test.ts`

**Interfaces:**
- Consumes:
  - `openLink`, `LINK_MESSAGES` (Task 5);
  - `startSearch(text, 'measure')`;
  - `Levels.outside` and `Levels.line` (Task 7);
  - `Editor.open` (Task 8);
  - `fromLevel` (Task 6).
- Produces:
  - `export interface SharedCardProps { name: string; rating: string | null; best: number | null; onPlay(): void; onEdit(): void }`;
  - `export function ratingText(d: Difficulty): string`.

- [ ] **Step 1: Write the failing tests:**
  - The shared card shows the name, `rating…` while `rating` is null, `beat 54` when there is a best, and the buttons `#shared-play` and `#shared-edit`.
  - `ratingText` gives `Chase · quickest win 54 moves · 24,086 situations` and `Solo · …`.
  - A bad link shows its `LINK_MESSAGES` text in the toast and the title card, never a board.
  - `play starts before the rating finishes`. With a rating job that never resolves, `#shared-play` opens the level as an outside level of kind `'shared'`, and a hint uses the link's line without solving.
  - **Edit a copy** opens the editor on `fromLevel(shared.level)`, with no initials or best carried over.
- [ ] **Step 2:** Run. Expect FAIL.
- [ ] **Step 3: Implement.**
  - The rating search keeps running in the worker during play, and the shared card shows its result the next time it opens.
  - Opening another link, or the page going away, cancels the rating search.
  - The shared card's Q goes to the title card.
- [ ] **Step 4:** Run, then `bash units.sh`. Expect PASS.
- [ ] **Step 5: Commit** `Crete: a shared link opens on the game page`.


**Carried into this task (controller):**
- A Check started in the editor keeps running after the editor is left (R15), and there is one solver worker. The shared link's rating search must not silently replace that Check: if a rating would cancel it, the editor must not later show "The solver stopped: the search was cancelled". Either wait for the Check, or have the editor word that case. Choose, and say which in the report.
- No search may run at the same time as another one in the same worker. Share runs Check, and the rating runs only on the game page.
- Every untrusted-link path stays bounded as Tasks 4–5 made it: openLink refuses before parse.
- Generated `dist/`, `index.html` and `sw.js` are rebuilt with `node _kit/build/build.mjs crete`, then `php tools/install-files.php` in crete/.
