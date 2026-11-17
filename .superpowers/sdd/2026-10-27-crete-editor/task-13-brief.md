### Task 13: Browser specs and docs

**Files:**
- Create: `websites/www.cs/tests/e2e/crete-editor.spec.ts`
- Modify:
  - `websites/www.cs/tests/e2e/shard.ts`: weight `'crete-editor.spec.ts': 12`;
  - `select.ts`;
  - `README.md`: a section "The editor", covering the view, the keys, the link format and limits, the generated name, the owner flag and the test hook; add the editor's files to the README's file map;
  - `docs/superpowers/roadmap.md`: step 2 is live, and the next step is Chapter 2 built in the editor.

- [ ] **Step 1: Write the spec.**
  - `builds a small level and tries it`, at desktop size:
    1. Open `games/crete/#edit`, pick a brush and paint a few cells.
    2. Press Try it, close the start card, and win with the arrow keys.
    3. Press **Back to the editor** on the end card, and confirm the draft is unchanged.
  - `shares a level and wins it on a phone`:
    1. Call `__creteTest.editor.load(<trial 9 cleared of title, intro and pages>)`.
    2. Enter initials `WGR` and press **Share**. Wait for the link field and read the link.
    3. Open the link in a 390 × 844 context. The card shows `Level ` + the code + ` by WGR`.
    4. Press **Play**, press the link's line through the page's keys, and the end card shows a win.
  - `a damaged link shows a message, never a board`.
- [ ] **Step 2:** Run `make e2e E2E_ARGS="crete-editor.spec.ts"` from `websites/www.cs`. Expect PASS. Run `crete-play.spec.ts` once as the second spec.
- [ ] **Step 3: Docs.** Write the README and roadmap changes, describing the current state only.
- [ ] **Step 4:** Run `bash units.sh` and `sh crete/test.sh`. Expect PASS.
- [ ] **Step 5: Commit** `Crete: browser specs and docs for the editor`.

**Carried into this task (controller):**
- Fix first (unit-tested where possible): `editorHook.load` in main.ts calls `ui.showEditor()` and then `editor.open(draft)`, which leaves an empty 12 × 12 draft as an undo step under the loaded level. Make `load` open the level with no empty draft beneath it. And Back from the shared card to an address with no fragment calls `ui.showTitle(false)`, which drops the installed-app close hint; keep the hint the way the Q path does (`titleHint`).
- The spec must also check: Q from `#edit` clears the address; a link opened in a page shows the card; Edit a copy, then U, brings back the earlier draft (this path in main.ts is only type-checked so far); the browser's Back from the card goes to the title card.
- Task 12 changed the README: a link is only an `#L<digits>…` fragment and other fragments are ignored; the menu item is "Shared level"; a rating waiting on a Check says so. The editor section must agree with the code.
- Local runs: `make e2e E2E_ARGS="crete-editor.spec.ts"` plus at most one more spec. CI runs the rest. Never bind ports 3000, 5173, 8000 or 8080, and use your own compose project name if the Makefile allows one.
