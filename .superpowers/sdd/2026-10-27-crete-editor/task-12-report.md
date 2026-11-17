# Task 12 report: the game page opens a link

Status: DONE. Commit `7c431d6` on `crete-editor` (base d74d7f0). Nothing was pushed.

## What was built

- `src/ui/shared.tsx`
  - `SharedCardProps` as specified, plus `renderSharedCard(root, props & { open })`.
  - The card shows the kicker "Shared level", the name (`#shared-title`), the rating (`#shared-rating`, `rating…` while null, aria-live), and `beat N` (`#shared-best`) when there is a best.
  - Its buttons are `#shared-play` (focused, Enter tab) and `#shared-edit` (Edit a copy).
  - `ratingText(d)` gives strings like `Chase · quickest win 54 moves · 24,086 situations`, and the same for `Solo · …`. A capped search reads `Chase or solo not known · quickest win not known · …`.
- `src/share/rating.ts` (DOM-free, new): `createRater(start, changed)` with `state`, `rate(text)`, `cancel()` and `check(text)`. It runs the rating's `measure` search and puts it in turn with the editor's Check (see below).
- `src/share/visit.ts` (DOM-free, new): `createVisit(deps)`, a link's visit to the page.
  - `open(fragment)` runs `openLink`, so the bounds from Tasks 4–5 still apply before anything is parsed.
    - On failure it cancels the rating and calls `refuse(LINK_MESSAGES[error])`.
    - On success it rates the link's text and shows the card. A decode that a newer `open` overtook is dropped.
  - `card()` returns the name, the best and the rating state, the last only when it is for this link's text.
  - `play()` calls `outside.play(level, { kind: 'shared', name, best }, line)`.
  - `edit()` opens the editor on `fromLevel(shared.level)`.
  - `leave()` cancels the rating, and `back()` rates the link again.
- `src/layers.ts`: a `shared` layer.
- `src/ui.ts`:
  - It renders the shared card.
  - Q on the shared card goes to the title card.
  - New methods:
    - `showShared()`;
    - `refuseLink(message)`, which shows a toast with the "bad" tone and the title card with `#title-note`;
    - `showTitle(hint, note?)`;
    - `showEditor(draft?)`;
    - `refresh()`.
  - `Controls.shared` is new.
  - The menu offers **The level's card** (`#menu-shared`), but only while a shared level is in play.
- `src/ui/title.tsx`: an optional `note` line (`#title-note`). The title card drops it when it is shown any other way.
- `src/ui/menu.tsx`: `onSharedCard` and the `menu-shared` section.
- `src/main.ts`:
  - **Fragments:**
    - `#edit` still opens the editor.
    - Any other non-empty fragment goes to `visit.open`, at start and on `hashchange`.
    - An empty fragment leaves the editor, as before.
  - **Wiring:**
    - The editor's `start` is `rater.check`.
    - `pagehide` cancels the rating, and a `pageshow` from the browser's back/forward cache rates the link again.
  - **Edit a copy:**
    - It settles the game and opens the editor on the copy.
    - It replaces the address's fragment with `#edit` (no new history entry), so the editor's visit works as it does today.
- `index.html`: `#shared-root`. The `tsconfig.json` and `src/tsconfig.dom.json` file lists gained the new modules.
- README:
  - The file map line for `src/share/` now names `rating` and `visit`.
  - The cards paragraph now covers the shared card, the menu's order and what a share link in the address does.
  - The full editor section is still waiting for Task 13.
- Tests:
  - `test/shared.test.ts` (new, 12 tests). Most run the page as `main.ts` wires it, on the real UI, game, outside slot, rater, visit and editor, with a fake worker. They cover:
    - a bad link;
    - the card;
    - play starting before the rating finishes, with a hint from the link's line and zero solves;
    - the rating shown on reopening the card from the menu;
    - Q;
    - cancelling on another link, on a bad link and on leaving;
    - Edit a copy, with no initials or best carried over;
    - the rater's turn-taking (three tests);
    - `ratingText`.
  - `test/ui.test.ts` gained 2 tests, for the card component and the title note.

## The rating vs the editor's Check

**Choice: the rating waits for the Check and never cancels it.**

- A rating wanted while a Check holds the worker stays `waiting`. That covers a Check that is running and one that is stopped. The rating starts when every Check job has ended, whether it finished, failed or was cancelled.
- A Check started while a rating runs comes first:
  - the rater cancels the rating's search before the Check's `start` is posted, so two searches never overlap in the worker;
  - once the Check ends, the rating starts again from the beginning.
- So the editor can never show "The solver stopped: the search was cancelled" because of a rating.

**Why:**

- A Check is work the author asked for, and Share waits on it.
- The rating is a background extra: the card already works without it, and Play and the thread don't need it.
- Waiting keeps the editor's wording and code as they are, with no new failure case.

**Cost:** a Check the author stopped and never resumed or cancelled keeps the rating at `rating…` until that Check ends (an edit cancels it). This only happens when the editor and a link are used in the same tab.

## What the plan left open that I decided

- **Reopening the card.** The brief says the card shows its result "the next time it opens", but nothing reopened it. I added the menu item **The level's card** during a shared level. Play on a reopened card starts the level again from the start.
- **Which fragments are links.** Every non-empty fragment other than `#edit` is treated as a link. So `#foo` reads "This is not a level link." on the title card.
- **The link in the address.** The link stays in the address while its level is played, and after Q, so a reload opens its card again. Edit a copy replaces it with `#edit`.
- **A failed rating** reads `No rating: <message>` on the card. Opening the same link again retries it.
- **The page going away** is `pagehide`, which cancels the rating. A page restored from the browser's back/forward cache (`pageshow` with `persisted`) rates it again.
- **The title note** has no live role, because the toast already announces the message. The rating line is `aria-live="polite"`.
- **The rating's turn-taking** is a small DOM-free module, `share/rating.ts`. The link's visit is another, `share/visit.ts`. Keeping both out of `main.ts` lets them be unit-tested.

## Verification

- `node --test crete/test/shared.test.ts`: 12 pass. `node --test crete/test/ui.test.ts`: 56 pass.
- `bash units.sh` (capped at 4G and 600 s): **tests 3493, pass 3492, fail 0, skipped 1; exit 0.**
- `sh crete/test.sh`: **exit 0**. It ran after `node _kit/build/build.mjs crete` (type check passed), `php tools/install-files.php`, `php tools/site-versions.php` and `php tools/site-game-pages.php`. The last two changed nothing.
- I ran no browser check. The fragment routing, `pagehide` and `pageshow` in `main.ts` are covered only by the type check, not by a unit test. Task 13's spec opens a link on a phone-sized page.

## Fix round 1

Commit `78c72d4` (on top of 7c431d6). Nothing was pushed.

1. **Edit a copy can be undone (R18).**
   - `Editor.open(draft)` now commits `draft` onto the current history as one undo step. It starts a fresh history only when there is none yet.
   - There is no confirm dialog.
   - This changes `open(draft)` for every caller, `__creteTest.editor.load` included. Each existing test builds a fresh editor, so none changed.
   - Test: the Edit a copy test opens the editor on another draft first, then checks that U after Edit a copy brings it back.
2. **A link still decoding is dropped when the address moves on.**
   - New `visit.forget()` bumps the open generation.
   - `followHash` calls it on the `#edit` and empty-fragment branches.
   - Test: `a link still decoding when the address moves on shows no card` (the editor stays up).
3. **The menu item is named "Shared level" (R18).**
   - It shows only when `visit.card()` belongs to the level in play: the card's level object is the level in play (`card.level === game.run.now.level`). `SharedView` gained `level` for this.
   - Test: the item is missing during a campaign level, after a bad link and after a second good link. It reads "Shared level" during the open link's own level.
4. **Back to no fragment from the card shows the title card.**
   - On an empty fragment, `followHash` shows the title card when `shared` is the top layer. Otherwise it leaves the editor, as before.
   - No unit test covers this: the line is in `main.ts`.
5. **Only `L<digits>…` fragments are links (R18).**
   - New `fragmentKind(hash)` in `share/visit.ts` returns `edit`, `link` (`/^#L[0-9]/`), `empty` or `other`.
   - `other` is ignored: no toast, and the screen does not change.
   - Test: `only a fragment L<digits>… is a link…`.
6. **The card says when the rating is waiting.**
   - While the rating waits on an editor Check, the card reads "Rating waits for your Check in the editor."
   - Test: the card shows that line, then `rating…` once the Check ends.
7. **Escape does nothing on the card.**
   - Test: `Escape on the shared card does nothing: the card stays up`.

README: the menu's item and the share-link sentence now cover `#L<digits>…` fragments, ignored fragments, the waiting line, Edit a copy as one undo step, and Back to no fragment.

Verification:
- `shared.test.ts`: 16 pass.
- `ui.test.ts`: 56 pass.
- `editor-share.test.ts`: 23 pass.
- `editor-ui.test.ts`: 35 pass.
- Rebuilt with `build.mjs crete`, `install-files.php`, `site-versions.php` and `site-game-pages.php`.
- `bash units.sh`: **tests 3497, pass 3496, fail 0, skipped 1; exit 0.**
- `sh crete/test.sh`: **exit 0**.
