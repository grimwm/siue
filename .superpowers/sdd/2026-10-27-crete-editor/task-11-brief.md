### Task 11: Share and the owner's export

**Files:**
- Create: `src/editor/share-panel.tsx`
- Modify: `src/editor/editor.ts`, `src/editor/check.ts`
- Test: `test/editor-share.test.ts`

**Interfaces:**
- Consumes: `encodeLink`, `MAX_LINE` (Task 4); `levelCode`, `sharedName`; `validInitials`; the checker (Task 10); the author's best map (Task 9).
- Produces:
  - `export async function shareLink(base: string, draftText: string, d: Difficulty, initials: string, best: number | null): Promise<{ ok: true; url: string; name: string } | { ok: false; message: string }>`;
  - `export function trialsEntry(d: Draft): string`.

- [ ] **Step 1: Write the failing tests:**
  - `share refuses until the level is shareable`, giving the `sharedProblems` text.
  - `share refuses blocked or malformed initials`, giving the Global Constraints message.
  - `share refuses a line over MAX_LINE`: `This level's quickest win is too long to share.`
  - `share builds a link that openLink opens`, with the same text, line, initials and best.
  - `share runs Check first when the level changed`. This one uses the editor wiring with a fake checker.
  - `trialsEntry escapes backticks and ${`.
  - `the owner fields only with crete-owner on`.
- [ ] **Step 2:** Run. Expect FAIL.
- [ ] **Step 3: Implement.**
  - The panel holds an initials input remembered in the kit pref `crete-initials`, and **Share**.
  - On success it shows a read-only link field, the name, and **Copy**. Copy uses `navigator.clipboard.writeText`; when that fails it selects the field and says `Press Ctrl+C to copy.`
  - The link's base is the page's own URL without its hash.
  - With the owner flag, the panel also shows the id, title and intro inputs and **Copy for trials.ts**.
- [ ] **Step 4:** Run. Expect PASS.
- [ ] **Step 5: Commit** `Crete: Share makes a link; the owner copies a campaign level`.

---

# Pull request 3: playing a shared level (`crete/editor-links`)

