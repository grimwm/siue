# PR 3 whole-branch review — findings to fix (one fix wave)

Branch crete-editor, range d74d7f0..3cb4b66 (Tasks 12 and 13). Task 13 (78c72d4..3cb4b66) was reviewed closely first.
Paths are relative to websites/www.cs/games/crete/ unless they start with `tests/e2e/` (relative to websites/www.cs/)
or `docs/` (relative to the repo root). `node --test test/shared.test.ts`: 17 pass at 3cb4b66.

How the parts fit: there is one worker, and `rating.ts` is the only door to it on the game page. The editor's
`start` is `rater.check`. A Check cancels a running rating before its own search is posted, and the rating waits
(the card says so) while any Check job has not settled, stopped ones included. Share reuses the Check, and Try
takes the Check's line. `visit.ts` proves a link with `openLink` before any parse (the limits from Tasks 4–5 hold),
rates the link's text, and drops a decode that a newer `open` or `forget` overtook.

Hash routing works end to end:
- `#edit` opens the editor through `backToEditor`, which settles a try.
- `#L<digits>` opens the card.
- An empty fragment leaves the card for the title card (hint kept) or leaves the editor.
- Any other fragment is ignored.
- `leftEditor` clears only `#edit`.

No code defect blocks merging. The two Important items are spec assertions that pass whether or not the behaviour
works: one of them is the very main.ts path the brief said had only been type-checked.

## Important

1. **"Edit a copy then U brings back the earlier draft" passes without U doing anything.**
   tests/e2e/crete-editor.spec.ts:141-159. The spec loads bare trial 9, shares it, opens the link and presses Edit a
   copy. The copy is `fromLevel(shared.level)`, which deep-equals the loaded draft: checked at 3cb4b66,
   `JSON.stringify(fromLevel(parse(bare))) === JSON.stringify(fromLevel(parse(toText(loaded, true))))` is `true`.
   So `expect(draftOf).toBe(earlier)` holds right after Edit a copy, before U is pressed. It would also hold if Edit
   a copy wiped the history again (the R18 bug). This main.ts `edit` path (settle, `showEditor(draft)`, replaceState)
   is covered by no unit test. Fix:
   - After reading the link (:140), change the draft so it differs from the shared level, for example
     `await page.locator('#brush-wall').click(); await paint(page, 5, 5);` on a floor cell. Then take
     `earlier = await draftOf(page)`.
   - After Edit a copy, assert `expect(await draftOf(page)).not.toBe(earlier)`, then press U and assert `toBe(earlier)`.
2. **Two more spec checks pass vacuously.**
   - tests/e2e/crete-editor.spec.ts:60-61: `newDraft(12, 12)` already has 44 border walls (src/editor/model.ts:45),
     so `painted >= 3` holds even if no click lands. "Pick a brush and paint a few cells" is unproven, and so is the
     click geometry in `paint()`. Fix: read the cells before painting, then assert that the cells at `3*12+3`,
     `3*12+4` and `4*12+3` are `'#'`. They are floor before the clicks and wall after.
   - tests/e2e/crete-editor.spec.ts:98-99: "no empty draft beneath the loaded level" presses `u` and checks that rows
     stay 11. That also passes if the key never reaches the editor. Fix: assert
     `await expect(page.locator('#editor-undo')).toBeDisabled()` right after `load` (keep the U press as well).

## Fix now (minor, cheap)

3. **The phone test does not win with the link's line.** tests/e2e/crete-editor.spec.ts:26 (`winWithKeys`) solves
   `game.run.now` again in the page. The brief says "press the link's line through the page's keys". As written, a
   wrong line in the link would still let the test win. Fix: in the phone page, read the line from
   `location.hash`: base64url, then `DecompressionStream('deflate-raw')`, then the `line:` header. Map each letter
   to its key as `lineOf` does, and press those keys. Add `winWithLine(page, letters)` beside `winWithKeys`.
4. **Spec checks the brief asks for, still loose or missing:**
   - :113 and :152: the name is matched by a pattern. The brief wants "Level + the code + by WGR". Fix: read
     `#share-name` beside the link and assert `toHaveText(name)` on `#shared-title`.
   - The real worker's rating never reaches the card in any spec; it is unit-tested only with a fake worker. Fix:
     at :152, the Share's Check is over, so the rating runs at once. Add
     `await expect(page.locator('#shared-rating')).toHaveText(/^Chase · quickest win \d+ moves · [\d,]+ situations$/)`.
   - :78-85: the PR 2 review asked for a reload after Q. Fix: add `await page.reload()`, then expect `#title-veil`
     visible and `#editor-root` hidden.
   - Tests 2, 4 and 5 do not collect `pageerror`. Fix: add the same `errors` array and the `toEqual([])` check.
5. **Q on the shared card abandons a level in play.** src/ui.ts:665 sends Q on the card to the title card in every
   case. The menu's Shared level (src/ui.ts:750-753) opens that same card during the shared level. So a player who
   checks the rating mid-level, then presses Q, loses the level. A reload of the link is the only way back.
   Fix: remember how the card opened (`sharedFromMenu`, set where `sharedCard` returns `showShared`). Q then
   reopens the menu over the level (`layers.clear(); layers.open("menu")`) rather than the title card. Add a
   shared.test: menu → Shared level → Q, and `ui.top()` is `menu` while `game.run` is unchanged.
6. **A link that opens mid-play does not settle the game.** At src/main.ts:86-87, `show` and `refuse` clear the
   layers but leave a running play-out (T) or animation going under the card. A campaign win can then open its
   ending card over the shared card or the title note. This is the same seam as R13 (Forward to `#edit` mid-try),
   and `edit` (:80) already settles.
   Fix: `show: () => { game.settle(); ui.showShared(); }` and
   `refuse: message => { game.settle(); ui.refuseLink(message); }`.
7. **The 1f4b374 fix lives in two copies of the wiring.**
   - `ui.closeLayers()` before `outside.play` is in src/main.ts:78 and again in test/shared.test.ts:83. The test
     therefore proves its own copy, not main.ts.
   - `outside` already has a `closeLayers` dep, which `tryLevel` calls (src/outside.ts:63).

   Fix:
   - Call `deps.closeLayers()` at the top of `play` (src/outside.ts:54) and drop it from `tryLevel`.
   - In main.ts and shared.test, wire `play: (level, about, line) => outside.play(level, about, line)` again.
   - The `playLevel` hook then gets the same behaviour. Run crete-pieces.spec.ts once, since it uses `playLevel`.
8. **README link limits are not in the code's order.** README.md:166 says "checked in this order", and lists
   `MAX_LINE` before the board size. decodeLink checks in this order (src/share/link.ts:203-240):
   1. the version;
   2. `ENCODED_MAX`;
   3. base64url;
   4. `DECODED_MAX`;
   5. the header and the initials;
   6. the board 3–64 on the raw grid;
   7. `parse`;
   8. no title, intro or pages;
   9. `MAX_LINE`;
   10. the line's letters;
   11. `best` ≥ the line.

   Then openLink replays the line. Fix: list the limits in that order, and add the two the README leaves out:
   initials that pass `validInitials` unchanged, and a level text with any title, intro or page being damaged.
9. **README Tests section omits the new spec.** README.md:211 lists the browser specs and what each covers.
   crete-editor (and crete-pieces) are missing from the `make e2e` example and the list. Fix: add
   `crete-editor.spec.ts` with one clause, for example "the editor: build, try, share, open a link on a phone, a
   damaged link, the addresses and Back". Add crete-pieces too.
10. **README wording.**
    - README.md:168: "Play starts the level from the link's line" reads as if play begins partway along the line.
      Fix: "Play opens the level from its start; Ariadne's thread follows the link's line without solving".
    - README.md:165: Copy for trials.ts also escapes the id (quotes, backslashes and line breaks), not just the
      text. Fix: say so, or say "escaped for a TypeScript string".
11. **Roadmap.**
    - docs/superpowers/roadmap.md:17-18: step 1 still says "The next step is the editor." The editor is live, so
      drop the sentence.
    - :27 is 89 columns in an 80-column file, and "(next: Chapter 2)" repeats :26's last sentence. Fix: drop
      "(next: Chapter 2)" and re-wrap.

## Leave

- **Shard weight 12** (tests/e2e/shard.ts:576 in the diff) is an estimate: two Shares, a second browser context and
  three page loads. Refresh it from CI's timing once it runs. select.ts maps the crete folder to the spec correctly,
  and a change to the spec selects the spec itself (the `tests/e2e/(.+\.spec\.ts)` rule).
- **The key map and solve-and-press helper are duplicated** across crete-play.spec.ts:8/59 and
  crete-editor.spec.ts:7/23 (crete-chapter has its own). A `crete-helpers.ts` beside `helpers.ts` is worth doing
  when a third spec needs it. Note that a change to `helpers.ts` selects ALL.
- **A Check that was stopped and never resumed keeps the rating waiting** (Task 12's chosen cost). The card says
  "Rating waits for your Check in the editor.", and an edit or Leave-then-edit ends it. By design.
- **Going from `#edit` to an ignored fragment leaves the editor up** (Task 12, noted only). Nothing in the game
  links to such a fragment, and `leftEditor` then leaves the fragment alone. Harmless.
- **The browser's Back during a shared level's play** goes to no fragment and changes nothing on the screen
  (top is `start`/null). The menu's Shared level stays, because `forget` does not drop `current`. Harmless, and it
  matches a try's behaviour.
- **`pageshow` with `persisted` (re-rate after the back/forward cache)** has no browser test. It is hard to drive
  in Playwright, and the cost is a card stuck on `rating…` until the link is opened again.
- **src/main.ts:115 `ui.top() === 'shared'`** repeats the check `leaveShared` already makes (src/ui.ts:271). This is
  harmless and reads clearly.
- **`__creteTest.solveInWorker` bypasses the rater** (src/main.ts:239). It is for tests only, and no spec mixes it
  with a link.
- **`fragmentKind` takes `#L0…`** as a link that `decodeLink` then calls not-a-link, so the title card says why.
  This is consistent with the README's "`#L<digits>…`".
- **The carried fixes are correct.**
  - `ui.showEditor(draft)` makes the first `open` start a fresh history (src/editor/editor.ts:188), so no empty draft
    sits beneath the loaded level.
  - `leaveShared` keeps `titleHint` and clears the title note.
  - visit.play's `closeLayers` stops the closed start card from revealing the shared card; item 7 only moves it.

Counts: Important 2, Fix now 9, Leave 10.

## Fix wave verification (04bc233)

Items 1–11 are resolved. shared.test + editor-ui.test: 54 pass at 04bc233.

- **Item 6 correction:** `createLayers`' change callback (src/ui.ts:175) already calls `game.stop()` whenever any
  layer is open, so a play-out never ran on under the card. The new `game.settle()` in `show` and `refuse` is
  harmless: it also finishes the animation and drops the outgoing level's thread.
- **closeLayers in `outside.play`:** no new problem.
  - It is the same call `tryLevel` made, and `visit.play` made after 1f4b374.
  - `playLevel` now also clears the stack. crete-pieces.spec.ts calls it over trial 1's start card and expects a
    start card again. shared.test shows that `outside.play` after a clear leaves `start` on top, so that spec should
    still pass. It was not run locally; CI selects it.
- **Q on a card opened from the menu:** correct.
  - The flag is reset on every other `showShared()`.
  - Play from that card clears the stack.
  - The browser's Back still goes to the title card, which is consistent.

**One new stale statement (fix first, cheap).** The behaviour changed, but three places still say Q on the shared
card always goes to the title card:
- README.md, cards paragraph: "and Q on it, or the browser's Back to no fragment, goes to the title card";
- src/ui/shared.tsx:4: "Q takes it to the title card";
- src/layers.ts:5-6: "src/ui.ts takes its Q to the title card".

Fix: "Q on it goes to the title card, or back to the menu when the menu opened it during its level; the browser's
Back to no fragment goes to the title card". Use the same wording in the two comments.
